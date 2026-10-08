// ── FIREBASE AUTH & SYNC ──────────────────────
//
// Architecture:
//   • Firestore is the shared copy; localStorage is this device's copy.
//   • LOAD (cheap): read the meta doc first — 1 read. If its last save
//     is this device's own, or the one this device last synced with,
//     there is nothing new: push local if it moved on. Otherwise another
//     device saved since — fetch the full collection and MERGE it with
//     local (sync-merge.js), then push the result. Nothing is replaced
//     wholesale, so progress made on two devices is kept from both.
//   • Each save (every doc of it) carries who wrote it and which saves it
//     includes (_dev, _at, _seen, _sv), and each device remembers the last
//     state it shared with
//     the cloud (its "base", in localStorage). That tells "another device
//     saved" apart from "my own save came back", and lets counters like
//     XP add both devices' gains without counting anything twice.
//   • SAVE (cheap): write localStorage immediately, debounce the
//     Firestore commit, and diff every doc against the last version
//     written — only changed docs are sent. A drill burst costs the
//     meta doc + the one deck doc being drilled, not the whole state.
//   • Flush immediately on beforeunload AND when the tab is hidden
//     (the reliable signal on mobile PWAs).
//   • Background sync: light meta-doc poll every few minutes while
//     the tab is visible, plus a sync when returning to the tab.
//
// Robustness:
//   • Every cloud read/write has a timeout — a hung request (common in
//     iOS PWAs after resume) fails like any other error instead of
//     silently blocking sync for the whole session.
//   • One load and one commit at a time. Commits wait while a load is
//     running, so a commit can never interleave with a load that is
//     about to replace S (that left cloud and device out of step).
//   • A load that finds nothing new in the cloud while local moved on
//     (or the cloud empty) pushes local up right away instead of waiting
//     for the next answer.
//   • Failed commits retry with backoff, and again when the device
//     comes back online or the tab becomes visible.
//   • Each commit is one atomic write: all its docs land, or none do.
//   • State pulled from the cloud is stored locally straight away.
//   • Before a commit, the meta doc is checked (at most every 15s) so a
//     save another device made meanwhile is merged, not overwritten.
//
// ─────────────────────────────────────────────

let currentUser  = null;
let syncTimeout  = null;
let bgSyncInterval = null;
let manualSyncInProgress = false;
let initialLoadComplete = false; // gate cloud writes until first load finishes
let lastCloudLoadAt = 0;

const isIOSPWA = navigator.standalone === true;
const FIRESTORE_DEBOUNCE_MS = 2500;
// Non-stop drilling keeps resetting the debounce; never hold changes
// back longer than this.
const FIRESTORE_MAX_WAIT_MS = 20000;

// JSON of each doc as last written/loaded — used to skip unchanged
// docs on save. Cleared to force a full upload.
let syncedDocCache = {};
// savedAt of the meta doc as this page last wrote or read it. If the
// cloud's differs, another device wrote since: the cache above no
// longer describes the cloud.
let syncedMetaSavedAt = null;
// Coalesced local saves (see scheduleLocalSave). Declared up here so they
// exist even if the Firebase setup below fails (offline, blocked CDN).
const LOCAL_SAVE_DEBOUNCE_MS = 300;
let _localSaveT = 0;

// Timeouts: generous — they exist to catch hung requests, not slow ones.
const LOAD_META_TIMEOUT_MS = 20000;
const LOAD_ALL_TIMEOUT_MS  = 45000;
const COMMIT_TIMEOUT_MS    = 30000;
const COMMIT_RETRY_MS = [3000, 10000, 30000, 60000];
// Each timeout in a row doubles the next one (up to 4×): a hung request
// is still caught, a very slow connection still gets through.
const growTimeout = (ms, timeoutsInARow) => ms * 2 ** Math.min(timeoutsInARow, 2);
const LOAD_RETRY_MS   = [10000, 30000, 60000, 120000];

let syncUid = null;            // uid the flags/caches below belong to
let loadInFlight = null;       // promise of the running cloud load
let cloudLoadedOnce = false;   // a load has succeeded for this user
let savesHeldBack = false;     // saves made before the first load (not sent)
let loadFailures = 0;
let loadTimeouts = 0;          // cloud reads timed out in a row
let loadRetryT = 0;
let commitInFlight = null;     // promise of the running commit
let commitAgain = false;       // commit asked for while one was running
let commitAfterLoad = false;   // commit asked for while a load was running
let commitFailures = 0;
let commitTimeouts = 0;        // commits timed out in a row
let commitRetryT = 0;
let commitPendingSince = 0;    // first save of the current debounce burst
let commitUrgent = false;      // next commit skips the pre-check (page closing)
let forceDownloadNext = false; // admin: next load replaces local with the cloud
let lastCloudCheckAt = 0;      // meta last confirmed to hold nothing new

// What this device knows about the cloud, kept in localStorage per account:
//   dev   this device's id (stamped on its saves as _dev)
//   lastAt the stamp of this device's latest save (_at): its own counter,
//         always rising, independent of any clock
//   know  { device: _at } — every save this copy holds (all it ever
//         merged); stamped on its own saves as _seen
//   base  { id, sv, seen, scal, wc } — the last cloud state this device's
//         copy descends from: who/when wrote it ("dev:at"), its savedAt,
//         its _seen, its counters and its per-word answer counts
//   hist  older bases, newest last, each with `undo` = the word counts
//         that differed from the next one (enough to rebuild them) and `t`
//         = when it stopped being the base
//   pend  saves sent but not yet confirmed, oldest first: { at, id, sv,
//         seen, scal, baseId, wcd } (wcd = word counts changed since base)
const SYNC_REC_KEY = STORAGE_KEY + "_sync";
const PRECHECK_FRESH_MS = 15000;
// History of older bases: the last SYNC_HIST_KEEP always; older ones only
// if they stayed the base for a while (another device may have loaded them
// — states replaced within seconds while drilling are folded together).
const SYNC_HIST_KEEP = 60;
const SYNC_HIST_MAX = 400;
const SYNC_HIST_PAUSE_MS = 120000;
let syncRec = { dev: "", uid: null, lastAt: 0, know: {}, base: null, hist: [], pend: [] };

// ── AUTH ──────────────────────────────────────

// Without Firebase (offline first load, a blocked CDN) the app still runs
// and saves locally; only sign-in and cloud sync are unavailable.
function watchAuth() { auth.onAuthStateChanged(user => {
  currentUser = user;
  const btn    = document.getElementById("auth-btn");
  const status = document.getElementById("sync-status");

  // New account (or signed out): nothing synced for the previous one
  // carries over — re-gate writes until this account's first load.
  const uid = user ? user.uid : null;
  if (uid !== syncUid) resetSyncSession(uid);

  if (user) {
    if (btn)    btn.textContent = user.displayName?.split(" ")[0] || "Signed in";
    if (status) status.textContent = "☁️ Syncing…";
    loadFromCloud();
    startBackgroundSync();
  } else {
    if (btn)    btn.textContent = "Sign in";
    if (status) status.textContent = "";
    stopBackgroundSync();
  }
  const sp = document.getElementById("settings-panel");
  if (sp && sp.style.display === "block" && typeof renderSettingsPanel === "function") renderSettingsPanel();
}); }
try { watchAuth(); } catch (e) { console.warn("[sync] Firebase unavailable — saving on this device only", e); }

function resetSyncSession(uid) {
  syncUid = uid;
  syncLoadRec(uid);
  lastCloudCheckAt = 0;
  syncedDocCache = {};
  syncedMetaSavedAt = null;
  initialLoadComplete = false;
  cloudLoadedOnce = false;
  savesHeldBack = false;
  loadFailures = 0;
  loadTimeouts = 0;
  commitFailures = 0;
  commitTimeouts = 0;
  commitAgain = false;
  commitAfterLoad = false;
  commitPendingSince = 0;
  clearTimeout(syncTimeout);  syncTimeout = null;
  clearTimeout(loadRetryT);   loadRetryT = 0;
  clearTimeout(commitRetryT); commitRetryT = 0;
}

function handleAuth() {
  if (!auth) { showCelebrateToast("☁️", "Sign-in unavailable", "Needs a connection — your progress is saved on this device"); return; }
  if (currentUser) {
    if (confirm("Sign out?")) auth.signOut();
  } else {
    const provider = new firebase.auth.GoogleAuthProvider();
    auth.signInWithPopup(provider).catch(e => alert("Sign in failed: " + e.message));
  }
}

// Rejects if `promise` hasn't settled within `ms`. The request itself
// may still finish later; callers ignore it once this has rejected.
function withTimeout(promise, ms, what) {
  let t;
  const timer = new Promise((_, reject) => {
    t = setTimeout(() => {
      const e = new Error(what + " timed out after " + Math.round(ms / 1000) + "s");
      e.timedOut = true;
      reject(e);
    }, ms);
  });
  return Promise.race([promise, timer]).finally(() => clearTimeout(t));
}

// ── SYNC RECORD ───────────────────────────────

function syncLoadRec(uid) {
  let r = null;
  try { r = JSON.parse(localStorage.getItem(SYNC_REC_KEY) || "null"); } catch (e) {}
  if (!r || typeof r !== "object") r = {};
  if (typeof r.dev !== "string" || !r.dev)
    r.dev = Math.random().toString(36).slice(2, 10) + Date.now().toString(36);
  if (!r.base || typeof r.base !== "object" || typeof r.base.id !== "string") r.base = null;
  if (typeof r.lastAt !== "number") r.lastAt = 0;
  if (!Array.isArray(r.pend)) r.pend = [];
  if (!Array.isArray(r.hist)) r.hist = [];
  if (!r.know || typeof r.know !== "object") r.know = {};
  if (!uid) { syncRec = { ...r, know: {}, base: null, hist: [], pend: [] }; return; } // signed out: keep what's stored
  if (r.uid !== uid) { r.uid = uid; r.know = {}; r.base = null; r.hist = []; r.pend = []; } // another account: start over
  syncRec = r;
  syncSaveRec();
}
function syncSaveRec() {
  try { localStorage.setItem(SYNC_REC_KEY, JSON.stringify(syncRec)); } catch (e) { console.warn("[sync] record not saved", e); }
}
// A meta doc written by this version: its writer's entry in _seen is its
// own stamp _at, and _sv is the savedAt it was written with. (An older
// app version re-saves the _dev/_seen/_at/_sv it loaded along with its
// own changes and a new savedAt — _sv then no longer matches, so such a
// save counts as unknown and is merged keeping the higher values.)
function syncTrusted(meta) {
  return !!meta && typeof meta._dev === "string" && typeof meta._at === "number" && !!meta._seen &&
    typeof meta._seen === "object" && meta._seen[meta._dev] === meta._at && meta._sv === meta.savedAt;
}
// Which save a cloud state is: "device:stamp", or its savedAt when it was
// written by an older app version.
function syncStateId(meta) {
  return syncTrusted(meta) ? meta._dev + ":" + meta._at : "t:" + ((meta && meta.savedAt) || 0);
}
function syncNextAt() {
  syncRec.lastAt = Math.max(Date.now(), (syncRec.lastAt || 0) + 1);
  return syncRec.lastAt;
}
// Same for a deck doc (its save's time is _at).
function syncDocSeen(doc) {
  return doc && typeof doc._dev === "string" && doc._seen && typeof doc._seen === "object" &&
    doc._seen[doc._dev] === doc._at ? doc._seen : null;
}
//   "mine"    the cloud's last save is this device's own (one this copy
//             already holds): nothing in it is missing here
//   "known"   the cloud is still the state this device last synced with
//   "changed" another device saved since (or no shared history yet)
// "mine" also needs the save's content version to be one this copy has
// had: an older app version re-saving our _dev/_at with its own changes
// would differ in savedAt from every save we made — see syncSvOf.
function syncClassify(meta) {
  if (syncTrusted(meta) && meta._dev === syncRec.dev && meta._at <= (syncRec.lastAt || 0) &&
      (meta.savedAt || 0) === syncSvOf(meta._at)) return "mine";
  if (syncRec.base && syncStateId(meta) === syncRec.base.id && (meta.savedAt || 0) === syncRec.base.sv) return "known";
  return "changed";
}
// savedAt our save with stamp `at` carried (undefined if no longer known).
function syncSvOf(at) {
  const p = syncRec.pend.find(x => x.at === at);
  if (p) return p.sv;
  const b = syncRec.base;
  if (b && b.id === syncRec.dev + ":" + at) return b.sv;
  const h = syncRec.hist.find(x => x.id === syncRec.dev + ":" + at);
  return h ? h.sv : undefined;
}
// Folds away old history entries that were the base only briefly. Each
// entry's undo leads from the next entry to it, so dropping entry i makes
// entry i-1's undo = i's changes, then i-1's on top.
function syncThinHistory() {
  const h = syncRec.hist;
  for (let i = h.length - SYNC_HIST_KEEP - 1; i >= 0; i--) {
    const stayed = (h[i].t || 0) - ((h[i - 1] && h[i - 1].t) || 0);
    if (stayed >= SYNC_HIST_PAUSE_MS) continue;
    if (i > 0) h[i - 1].undo = h[i - 1].undo && h[i].undo ? { ...h[i].undo, ...h[i - 1].undo } : null;
    h.splice(i, 1);
  }
  while (h.length > SYNC_HIST_MAX) h.shift(); // the oldest end of the chain
}
// Moves the base forward; the old one joins the history.
function syncAdvanceBase(nb) {
  const ob = syncRec.base;
  if (ob && ob.id !== nb.id) {
    let undo = null;
    if (ob.wc && nb.wc) {
      undo = {};
      new Set([...Object.keys(ob.wc), ...Object.keys(nb.wc)]).forEach(k => {
        if (JSON.stringify(ob.wc[k]) !== JSON.stringify(nb.wc[k])) undo[k] = ob.wc[k] || null;
      });
    }
    syncRec.hist = syncRec.hist.concat([{ id: ob.id, sv: ob.sv, seen: ob.seen, scal: ob.scal, undo, t: Date.now() }]);
    syncThinHistory();
  }
  syncRec.base = nb;
  syncSaveRec();
}
// Word counts of the base, or of an older base rebuilt from the history.
function syncWcOf(id) {
  const b = syncRec.base;
  if (!b || !b.wc || !id) return null;
  let wc = { ...b.wc };
  if (b.id === id) return wc;
  for (let i = syncRec.hist.length - 1; i >= 0; i--) {
    const h = syncRec.hist[i];
    if (!h.undo) return null;
    Object.entries(h.undo).forEach(([k, v]) => { if (v) wc[k] = v; else delete wc[k]; });
    if (h.id === id) return wc;
  }
  return null;
}
// The cloud's save includes one this device sent: that save becomes the base.
function syncAdoptLanded(meta) {
  if (!syncTrusted(meta)) return;
  const mine = meta._seen[syncRec.dev] || 0;
  const hit = syncRec.pend.find(p => p.at === mine);
  if (!hit) return;
  let wc = null;
  if (hit.full) wc = hit.wcd;
  else {
    // its counts = those of the base it was sent from (maybe older than the
    // current base, if an earlier save was confirmed late) + its changes
    wc = syncWcOf(hit.baseId);
    if (wc) Object.entries(hit.wcd || {}).forEach(([k, v]) => { if (v) wc[k] = v; else delete wc[k]; });
  }
  syncRec.pend = syncRec.pend.filter(p => p.at > mine);
  syncAdvanceBase({ id: hit.id, sv: hit.sv, seen: hit.seen, scal: hit.scal, wc });
}
// The latest state both this copy and a cloud save descend from — the
// base, or an older one from the history — but only if its saves are
// EXACTLY those both hold (per device: the fewer of the two; for this
// device: the cloud's). An older common state would make the merge count
// what both share since twice. Returns { scal, wc } (wc may be null), or
// null — the merge then keeps the higher value instead of adding.
function syncAncestorFor(meta) {
  return syncTrusted(meta) ? syncAncestorForSeen(meta._seen) : null;
}
// This copy already holds everything a save with this history holds:
// every other device's saves in it are ones this copy has merged (know),
// and this device's own saves are always in its own copy.
function syncIncluded(seen) {
  if (!seen) return false;
  return Object.entries(seen).every(([d, t]) => d === syncRec.dev || (syncRec.know[d] || 0) >= t);
}
function syncAddKnow(seen) {
  if (seen) Object.entries(seen).forEach(([d, t]) => { if (!(syncRec.know[d] >= t)) syncRec.know[d] = t; });
}
function syncAncestorForSeen(seen) {
  const b = syncRec.base;
  if (!b || !seen) return null;
  const me = syncRec.dev, know = syncRec.know;
  const target = {};
  new Set([...Object.keys(seen), ...Object.keys(know)]).forEach(d => {
    const t = d === me ? (seen[d] || 0) : Math.min(seen[d] || 0, know[d] || 0);
    if (t) target[d] = t;
  });
  const fits = x => !!x.seen &&
    [...new Set([...Object.keys(target), ...Object.keys(x.seen)])].every(d => (x.seen[d] || 0) === (target[d] || 0));
  let wc = b.wc ? { ...b.wc } : null;
  if (fits(b)) return { scal: b.scal, wc };
  for (let i = syncRec.hist.length - 1; i >= 0; i--) {
    const h = syncRec.hist[i];
    if (wc && h.undo) Object.entries(h.undo).forEach(([k, v]) => { if (v) wc[k] = v; else delete wc[k]; });
    else wc = null;
    if (fits(h)) return { scal: h.scal, wc };
  }
  return null;
}
// `deckSeen`: histories of the deck docs merged along with the meta — the
// base then claims every save any of them held.
function syncSetBase(meta, state, deckSeen) {
  const seen = syncTrusted(meta) ? JSON.parse(JSON.stringify(meta._seen)) : {};
  Object.values(deckSeen || {}).forEach(ds => {
    if (ds) Object.entries(ds).forEach(([d, t]) => { if (!(seen[d] >= t)) seen[d] = t; });
  });
  syncAdvanceBase({
    id: syncStateId(meta),
    sv: (state && state.savedAt) || 0,
    seen,
    scal: syncScalarsOf(state),
    wc: syncWordCounts(state),
  });
}
function syncLocalDirty() { return !syncRec.base || (S.savedAt || 0) !== syncRec.base.sv; }

// Cloud docs → one state (sync-only fields dropped).
function syncCloudState(snapshot) {
  let meta = null, learn = null;
  const words = {}, usageArchive = {}, deckSeen = {};
  snapshot.forEach(doc => {
    const data = syncDecodeArrays(doc.data()); // back to lists of lists
    if (doc.id === STORAGE_KEY) meta = data;
    else if (doc.id.startsWith(STORAGE_KEY + "_words_")) {
      Object.assign(words, data.words || {});
      deckSeen[doc.id.slice((STORAGE_KEY + "_words_").length)] = syncDocSeen(data);
    }
    else if (doc.id === STORAGE_KEY + "_learn") learn = data.learn || null;
    else if (doc.id.startsWith(STORAGE_KEY + "_usage_")) usageArchive[doc.id.slice((STORAGE_KEY + "_usage_").length)] = data.days || {};
  });
  if (!meta) return { meta: null, state: null };
  const { _evidence, _dev, _seen, _at, _sv, ...rest } = meta;
  const state = { ...rest, words, usageArchive };
  if (learn) state.learn = learn;
  return { meta, state, deckSeen };
}
// Per-word answer counts both sides share, deck by deck from each doc's
// own history (undefined for a word = not known → the merge keeps the
// higher count instead of adding).
function syncBaseWords(cloud) {
  const memo = new Map(), out = {}, cw = syncWordCounts(cloud.state);
  Object.keys(cloud.state.words).forEach(k => {
    const seen = cloud.deckSeen[k.substring(0, k.lastIndexOf("_"))];
    if (!seen) return;
    // Already in this copy: the cloud adds nothing to these counts.
    if (syncIncluded(seen)) { out[k] = cw[k]; return; }
    const key = JSON.stringify(seen);
    if (!memo.has(key)) { const a = syncAncestorForSeen(seen); memo.set(key, a && a.wc); }
    const wc = memo.get(key);
    if (wc) out[k] = wc[k] || [0, 0, 0];
  });
  return out;
}

// ── DOC BUILDING ──────────────────────────────
// State maps onto Firestore docs: one meta doc (everything except
// words) + one doc per deck holding that deck's word stats.

function buildSyncDocs(state = S) {
  const wordsByDeck = {};
  Object.keys(state.words || {}).forEach(key => {
    const deckId = key.substring(0, key.lastIndexOf("_"));
    if (!wordsByDeck[deckId]) wordsByDeck[deckId] = {};
    wordsByDeck[deckId][key] = state.words[key];
  });
  // A reset deck with no words left still gets its (now empty) doc
  // written, so the cloud stops holding the old words.
  Object.keys(state.resets || {}).forEach(deckId => { if (!wordsByDeck[deckId]) wordsByDeck[deckId] = {}; });
  // (_dev/_seen/_at/_sv: save stamps an older app version may have copied
  // into its state — never content; each commit adds its own.)
  const { words, usageArchive, learn, _dev, _seen, _at, _sv, _evidence, ...meta } = state;
  meta._evidence = evidenceCount(state); // answers in total, for a quick look at the meta doc
  const docs = { [STORAGE_KEY]: meta };
  Object.entries(wordsByDeck).forEach(([deckId, deckWords]) => {
    docs[STORAGE_KEY + "_words_" + deckId] = { words: deckWords };
  });
  // Learning log extras (learning-log.js): their own doc, so verb
  // history can grow without crowding the meta doc.
  if (learn) docs[STORAGE_KEY + "_learn"] = { learn };
  // Usage days older than the meta doc keeps (usage-log.js): one doc
  // per year, rewritten only when a day moves into it.
  Object.entries(usageArchive || {}).forEach(([year, days]) => {
    docs[STORAGE_KEY + "_usage_" + year] = { days };
  });
  return docs;
}

// ── LOAD FROM CLOUD ───────────────────────────
// Meta-first: most syncs cost a single document read. The full
// collection is only fetched when we might actually accept cloud data.
//
// CRITICAL: no cache fallback. If the server is unreachable, do nothing
// and let local state stand. Cached Firestore data can be days old and
// silently clobbering local state was the source of major data loss.

function loadFromCloud() {
  if (!currentUser) return Promise.resolve();
  const uid = currentUser.uid;
  // One load at a time — a second caller shares the running one.
  if (loadInFlight && loadInFlight.uid === uid) return loadInFlight;
  clearTimeout(loadRetryT); loadRetryT = 0;
  lastCloudLoadAt = Date.now();

  // Let a running commit land first, so the load reads a settled cloud.
  const run = Promise.resolve(commitInFlight).then(() => runCloudLoad(uid)).finally(() => {
    if (loadInFlight === run) loadInFlight = null;
    // Push local up if the load asked for it, or a commit was held back.
    if (commitAfterLoad && currentUser && currentUser.uid === uid && initialLoadComplete) {
      commitAfterLoad = false;
      commitToFirestore();
    }
  });
  run.uid = uid;
  loadInFlight = run;
  return run;
}

function runCloudLoad(uid) {
  setStatus("☁️ Syncing…");
  const ref = db.collection("users").doc(uid).collection("apps");
  const force = forceDownloadNext;
  forceDownloadNext = false;
  // The account changed while we waited — drop the result.
  const stale = () => !currentUser || currentUser.uid !== uid;
  const loaded = () => {
    initialLoadComplete = true;
    cloudLoadedOnce = true;
    savesHeldBack = false;
    loadFailures = 0;
    loadTimeouts = 0;
    lastCloudCheckAt = Date.now();
  };

  return withTimeout(ref.doc(STORAGE_KEY).get({ source: 'server' }), growTimeout(LOAD_META_TIMEOUT_MS, loadTimeouts), "Cloud load").then(metaSnap => {
    if (stale()) return;
    const meta = metaSnap.exists ? metaSnap.data() : null;
    if (!meta) {
      // Nothing in the cloud yet: put this device's progress there. The
      // empty cloud is a common state too (nothing shared, all zero).
      loaded();
      syncSetBase(null, { words: {} });
      syncedDocCache = {};
      if (S.savedAt) commitAfterLoad = true;
      setStatus("☁️ Synced", 3000);
      return;
    }
    syncAdoptLanded(meta);
    if (!force && syncClassify(meta) !== "changed") {
      // Nothing new in the cloud — 1 read. Push local if it moved on
      // (e.g. the app was closed before the last commit landed).
      loaded();
      if (syncedMetaSavedAt !== (meta.savedAt || 0)) { syncedDocCache = {}; syncedMetaSavedAt = meta.savedAt || 0; }
      if ((S.savedAt || 0) !== (meta.savedAt || 0)) commitAfterLoad = true;
      setStatus("☁️ Synced", 3000);
      return;
    }

    // Another device saved since: fetch everything and merge.
    return withTimeout(ref.get({ source: 'server' }), growTimeout(LOAD_ALL_TIMEOUT_MS, loadTimeouts), "Cloud load").then(snapshot => {
      if (stale()) return;
      const cloud = syncCloudState(snapshot);
      if (!cloud.meta) { loaded(); syncedDocCache = {}; if (S.savedAt) commitAfterLoad = true; setStatus("☁️ Synced", 3000); return; }
      syncAdoptLanded(cloud.meta);
      const metaSeen = syncTrusted(cloud.meta) ? cloud.meta._seen : null;
      const anc = force ? null : syncIncluded(metaSeen) ? { scal: syncScalarsOf(cloud.state) } : syncAncestorFor(cloud.meta);
      const next = force ? cloud.state : mergeStates(S, cloud.state, {
        base: anc && anc.scal,
        baseWords: syncBaseWords(cloud),
        localWins: syncLocalDirty() && (S.savedAt || 0) > (cloud.state.savedAt || 0),
      });

      S = next;
      migrate();
      recordLogin();
      if (typeof noteJourneyLevels === "function") noteJourneyLevels();
      if (typeof questEnsureToday === "function") questEnsureToday();
      if (typeof applyCosmetics === "function") applyCosmetics();
      if (typeof invalidatePathScan === "function") invalidatePathScan();
      renderExpBar();
      renderGroups();
      if (typeof renderHome === "function") renderHome();

      // The cloud now holds cloud.state: that is what the diff cache and
      // the base describe. Whatever local adds on top goes up as a new save.
      syncedDocCache = {};
      Object.entries(buildSyncDocs(cloud.state)).forEach(([id, payload]) => { syncedDocCache[id] = JSON.stringify(payload); });
      syncedMetaSavedAt = cloud.state.savedAt || 0;
      if (force) syncRec.know = {};
      syncAddKnow(syncTrusted(cloud.meta) ? cloud.meta._seen : null);
      Object.values(cloud.deckSeen).forEach(syncAddKnow);
      syncSetBase(cloud.meta, cloud.state, cloud.deckSeen);
      const differs = Object.entries(buildSyncDocs()).some(([id, payload]) => syncedDocCache[id] !== JSON.stringify(payload));
      // (savedAt is a content version, only ever compared for equality.)
      const now = Date.now();
      S.savedAt = !differs ? (cloud.state.savedAt || 0) : now === cloud.state.savedAt ? now + 1 : now;
      if (differs) commitAfterLoad = true;
      // Store it now — a reload before the next answer must not bring
      // back the old copy.
      saveLocalOnly();
      loaded();
      setStatus("☁️ Synced", 3000);
    });
  }).catch(e => {
    console.error("Cloud load failed (no fallback to cache):", e);
    if (stale()) return;
    if (e && e.timedOut) loadTimeouts++;
    setStatus("⚠️ Offline — using local data", 3000);
    if (cloudLoadedOnce) return; // background poll; next poll retries
    scheduleLoadRetry();
    // Unblock writes after a delay so the user isn't locked out if
    // they're offline at open time — but never for a near-empty local
    // state: pushed up before we've seen the cloud, that would replace
    // real progress (fresh install, cleared storage). It waits for a
    // load to succeed instead (retried above, on reconnect, on return).
    setTimeout(() => {
      if (stale() || initialLoadComplete) return;
      if (evidenceCount(S) < 5 && (S.exp || 0) < 50) return;
      initialLoadComplete = true;
      // Saves held back while we waited go up now, like any later save.
      if (savesHeldBack) { savesHeldBack = false; commitToFirestore(); }
    }, 5000);
  });
}

// Until the first load succeeds, keep trying on a backoff (then every
// couple of minutes) while the app is open — until then, changes this
// device made earlier may not be in the cloud. Hidden, it waits for
// the return to the tab (resumeSync) instead.
function scheduleLoadRetry() {
  if (loadRetryT) return;
  const ms = LOAD_RETRY_MS[Math.min(loadFailures++, LOAD_RETRY_MS.length - 1)];
  loadRetryT = setTimeout(() => {
    loadRetryT = 0;
    if (currentUser && !cloudLoadedOnce && !manualSyncInProgress &&
        document.visibilityState === "visible") loadFromCloud();
  }, ms);
}

// Count "evidence of progress" — total answers given.
function evidenceCount(state) {
  if (!state || !state.words) return 0;
  let n = 0;
  Object.values(state.words).forEach(ws => {
    n += (ws.correct || 0) + (ws.wrong || 0);
  });
  return n;
}

// ── SAVE TO CLOUD ─────────────────────────────
// Stamps savedAt, writes localStorage immediately, debounces the
// Firestore commit to batch rapid successive saves (e.g. drilling).

function saveToCloud() {
  // Always persist locally, even when signed out — otherwise signed-out
  // progress would silently vanish on reload.
  S.savedAt = Date.now();
  scheduleLocalSave();
  if (!currentUser) return;

  // CRITICAL: do not write to cloud until initial load has completed.
  // Otherwise, any state change between page open and cloud load can
  // push stale local state up and clobber newer data on the server.
  // (Once the load finds local newer, it pushes these saves up.)
  if (!initialLoadComplete) {
    console.log("[sync] suppressing cloud write — initial load not yet complete");
    savesHeldBack = true;
    return;
  }

  scheduleCommit();
}

function scheduleCommit() {
  clearTimeout(syncTimeout);
  const now = Date.now();
  if (!commitPendingSince) commitPendingSince = now;
  const wait = Math.max(0, Math.min(FIRESTORE_DEBOUNCE_MS, commitPendingSince + FIRESTORE_MAX_WAIT_MS - now));
  syncTimeout = setTimeout(() => {
    syncTimeout = null;
    commitToFirestore();
  }, wait);
}

// Write to Firestore immediately — used by unload/hide and force-upload.
// Diffs each doc against the last written version and skips unchanged
// docs, so a typical commit writes 2 small docs instead of ~30.
// One commit at a time: a call while one runs is folded into a single
// follow-up commit, so hide + pagehide + beforeunload (which all fire on
// close) send the changes once, and writes can't land out of order.
async function commitToFirestore() {
  if (!currentUser) return;
  clearTimeout(syncTimeout); syncTimeout = null;
  commitPendingSince = 0;
  if (!S.savedAt) return; // never-stamped state has nothing to push
  if (loadInFlight) { commitAfterLoad = true; return; }
  if (commitInFlight) { commitAgain = true; return; }
  clearTimeout(commitRetryT); commitRetryT = 0;
  const urgent = commitUrgent;
  commitUrgent = false;
  // localStorage first: it must always hold at least what the cloud gets.
  flushLocalSave();

  const user = currentUser;
  const docs = buildSyncDocs();
  const changed = Object.entries(docs)
    .map(([id, payload]) => [id, JSON.stringify(payload)])
    .filter(([id, json]) => syncedDocCache[id] !== json);
  if (!changed.length) { commitFailures = 0; setStatus("☁️ Saved", 2000); return; }

  const run = sendCommit(user, changed, { savedAt: S.savedAt || 0, scal: syncScalarsOf(S), wc: syncWordCounts(S), urgent });
  commitInFlight = run;
  const result = await run;
  commitInFlight = null;
  if (result === "conflict") {
    // Another device saved meanwhile: merge it in; the load pushes after.
    commitAgain = false;
    commitAfterLoad = true;
    loadFromCloud();
    return;
  }
  if (commitAgain) {
    commitAgain = false;
    commitToFirestore();
  }
}

async function sendCommit(user, changed, c) {
  setStatus("☁️ Saving…");
  const abort = typeof AbortController === "function" ? new AbortController() : null;
  // Each doc is recorded the moment it lands, so after a partial failure
  // or a timeout a retry resends only the rest.
  const landed = (id, json) => {
    if (!currentUser || currentUser.uid !== user.uid) return;
    syncedDocCache[id] = json;
    if (id !== STORAGE_KEY) return;
    syncedMetaSavedAt = c.savedAt;
    lastCloudCheckAt = Date.now();
    syncAdoptLanded({ _dev: syncRec.dev, _seen: ident._seen, _at: ident._at, _sv: c.savedAt, savedAt: c.savedAt });
  };
  let ident = null;
  try {
    // Pre-check: has another device saved since we last looked? Then
    // merge first instead of writing over it. Skipped when the page is
    // closing (no time for an extra round trip) and right after a check.
    // If the check itself fails (reads failing while writes may work),
    // write anyway as before — the next load merges whatever overlapped.
    if (!c.urgent && cloudLoadedOnce && Date.now() - lastCloudCheckAt > PRECHECK_FRESH_MS) {
      let meta;
      try {
        const snap = await withTimeout(db.collection("users").doc(user.uid).collection("apps").doc(STORAGE_KEY).get({ source: 'server' }),
          growTimeout(LOAD_META_TIMEOUT_MS, loadTimeouts), "Cloud check");
        meta = snap.exists ? snap.data() : null;
      } catch (e) { console.warn("[sync] pre-check failed, saving anyway:", e.message); meta = undefined; }
      if (!currentUser || currentUser.uid !== user.uid) return;
      if (meta) {
        syncAdoptLanded(meta);
        // Changed by another device — or not the save this page's diff
        // cache describes: merge / re-read first, then save.
        if (syncClassify(meta) === "changed" || (meta.savedAt || 0) !== syncedMetaSavedAt) return "conflict";
      }
      if (meta !== undefined) lastCloudCheckAt = Date.now();
    }
    // Who wrote this save, and every save it includes.
    const at = syncNextAt();
    ident = { _dev: syncRec.dev, _at: at, _sv: c.savedAt, _seen: { ...syncRec.know, [syncRec.dev]: at } };
    // Word counts as sent, kept as the change from the base (small).
    const b = syncRec.base;
    let wcd = c.wc, full = true;
    if (b && b.wc) {
      wcd = {}; full = false;
      new Set([...Object.keys(b.wc), ...Object.keys(c.wc)]).forEach(k => {
        if (JSON.stringify(b.wc[k]) !== JSON.stringify(c.wc[k])) wcd[k] = c.wc[k] || null;
      });
    }
    syncRec.pend = syncRec.pend
      .concat([{ at, id: syncRec.dev + ":" + at, sv: c.savedAt, seen: ident._seen, scal: c.scal, baseId: b ? b.id : null, wcd, full }]).slice(-8);
    syncSaveRec();
    let failedIds;
    try {
      failedIds = await withTimeout(writeDocs(user, changed, abort && abort.signal, landed, ident),
        growTimeout(COMMIT_TIMEOUT_MS, commitTimeouts), "Cloud save");
    } catch (e) {
      if (e && e.timedOut) commitTimeouts++;
      if (abort) abort.abort(); // don't let a hung write land late
      throw e;
    }
    commitTimeouts = 0;
    if (failedIds.length) throw new Error(failedIds.length + " doc write(s) failed");
    commitFailures = 0;
    setStatus("☁️ Saved", 2000);
  } catch (e) {
    console.error("Cloud save failed:", e.message);
    if (currentUser && currentUser.uid === user.uid) scheduleCommitRetry();
  }
}

// Backoff after a failed commit. Once the schedule runs out, the next
// save, reconnecting, or returning to the tab tries again.
function scheduleCommitRetry() {
  clearTimeout(commitRetryT); commitRetryT = 0;
  if (commitFailures >= COMMIT_RETRY_MS.length) { setStatus("⚠️ Sync failed"); return; }
  const ms = COMMIT_RETRY_MS[commitFailures++];
  setStatus("⚠️ Retrying…");
  commitRetryT = setTimeout(() => { commitRetryT = 0; commitToFirestore(); }, ms);
}

// Sends the changed docs in ONE atomic write — all land or none do — and
// resolves to the ids that failed (all of them, or none). A commit cut
// short (page killed, a write failed) can never leave the cloud with some
// docs of a save and not others, which a merge would misread.
async function writeDocs(user, changed, signal, landed, ident) {
  try {
    if (isIOSPWA) await commitViaREST(user, changed, signal, ident);
    else await commitViaBatch(user, changed, ident);
  } catch (e) {
    console.error("Cloud save failed:", e && e.message);
    return changed.map(([id]) => id);
  }
  changed.forEach(([id, json]) => landed(id, json));
  return [];
}

// The payload as stored: every doc also carries the save that wrote it
// (_dev, _at, _seen). A commit only rewrites the docs that changed, so
// the cloud can hold docs from different saves — a merge reads each
// doc's own history from these.
function syncWire(id, json, ident) {
  const payload = syncEncodeArrays(JSON.parse(json)); // lists of lists → storable
  return ident ? { ...payload, ...ident } : payload;
}

async function commitViaBatch(user, changed, ident) {
  const ref = db.collection("users").doc(user.uid).collection("apps");
  const batch = db.batch();
  changed.forEach(([id, json]) => batch.set(ref.doc(id), syncWire(id, json, ident)));
  await batch.commit();
}

async function commitViaREST(user, changed, signal, ident) {
  const projectId = "german-vocab-a"; // your Firebase project ID
  const root = `projects/${projectId}/databases/(default)/documents`;
  const url = `https://firestore.googleapis.com/v1/${root}:commit`;

  function toFirestoreValue(val) {
    if (val === null || val === undefined) return { nullValue: null };
    if (typeof val === "boolean") return { booleanValue: val };
    if (typeof val === "number") return Number.isInteger(val) ? { integerValue: val } : { doubleValue: val };
    if (typeof val === "string") return { stringValue: val };
    if (Array.isArray(val)) return { arrayValue: { values: val.map(toFirestoreValue) } };
    if (typeof val === "object") return { mapValue: { fields: Object.fromEntries(Object.entries(val).map(([k,v]) => [k, toFirestoreValue(v)])) } };
    return { stringValue: String(val) };
  }
  // update without a mask replaces the whole doc, like set()
  const body = JSON.stringify({ writes: changed.map(([id, json]) => ({ update: {
    name: `${root}/users/${user.uid}/apps/${id}`,
    fields: Object.fromEntries(Object.entries(syncWire(id, json, ident)).map(([k, v]) => [k, toFirestoreValue(v)])),
  } })) });
  const send = token => fetch(url, {
    method: "POST",
    headers: { "Authorization": `Bearer ${token}`, "Content-Type": "application/json" },
    body, signal,
  });
  let r = await send(await user.getIdToken());
  // 401 = the ID token went stale (common after an iOS resume): refresh it once.
  if (r.status === 401) r = await send(await user.getIdToken(true));
  if (!r.ok) throw new Error(`HTTP ${r.status}`);
}

// Write to localStorage only — no Firestore, no debounce.
// Answers often save several times in a row; serialising all of S each
// time is wasted work. Coalesce into one write shortly after, and flush
// at once when the page hides or unloads (flushPendingSave below).
function scheduleLocalSave() {
  if (_localSaveT) return;
  _localSaveT = setTimeout(() => { _localSaveT = 0; saveLocalOnly(); }, LOCAL_SAVE_DEBOUNCE_MS);
}
function flushLocalSave() {
  if (!_localSaveT) return;
  clearTimeout(_localSaveT); _localSaveT = 0;
  saveLocalOnly();
}
function saveLocalOnly() {
  if (_localSaveT) { clearTimeout(_localSaveT); _localSaveT = 0; }
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(S));
  } catch (e) {
    console.error("localStorage write failed:", e);
  }
}

// ── BACKGROUND SYNC ───────────────────────────
// Light meta-doc poll while the tab is visible (1 Firestore read per
// poll), plus a refresh when the user returns to the tab.

const BG_SYNC_INTERVAL_MS = 5 * 60 * 1000;
const RETURN_SYNC_MIN_AGE_MS = 60 * 1000;

function startBackgroundSync() {
  stopBackgroundSync(); // clear any existing interval first
  bgSyncInterval = setInterval(() => {
    if (navigator.onLine && !manualSyncInProgress && document.visibilityState === "visible") {
      loadFromCloud();
    }
  }, BG_SYNC_INTERVAL_MS);
}

function stopBackgroundSync() {
  if (bgSyncInterval) {
    clearInterval(bgSyncInterval);
    bgSyncInterval = null;
  }
}

// Back in contact (returned to the tab, or the network came back):
// finish what earlier failures left undone.
function resumeSync(force) {
  if (!currentUser || manualSyncInProgress) return;
  if (!cloudLoadedOnce) {
    loadFailures = 0;
    loadFromCloud(); // pushes local afterwards if it's newer
    return;
  }
  if (commitFailures || commitRetryT) {
    commitFailures = 0;
    commitToFirestore();
  }
  if (force || Date.now() - lastCloudLoadAt > RETURN_SYNC_MIN_AGE_MS) loadFromCloud();
}

// ── UNLOAD / HIDE FLUSH ───────────────────────
// Bypasses the debounce so the last answers are never lost. The
// visibilitychange→hidden hook is the one that actually fires on
// mobile PWAs; beforeunload covers desktop tabs. Returning to a
// visible tab triggers a pull if the last sync is stale.

// Only when there is something to send: a debounced save, a failed
// commit, or one held back by a load. (Committing with nothing pending
// would re-upload every doc on the first hide of a session — and after
// an offline open, that could push stale local data over newer cloud.)
function flushPendingSave() {
  flushLocalSave();
  const pending = syncTimeout || commitRetryT || commitFailures || commitAgain || commitAfterLoad;
  clearTimeout(syncTimeout); syncTimeout = null;
  if (currentUser && initialLoadComplete && S.savedAt && pending) {
    commitUrgent = true;
    commitToFirestore();
  }
}

window.addEventListener("beforeunload", flushPendingSave);
window.addEventListener("pagehide", flushPendingSave);

document.addEventListener("visibilitychange", () => {
  if (document.visibilityState === "hidden") {
    flushPendingSave();
  } else if (navigator.onLine) {
    resumeSync(false);
  }
});

window.addEventListener("online", () => resumeSync(false));

// ── STATUS HELPER ─────────────────────────────

function setStatus(msg, clearAfterMs = 0) {
  const el = document.getElementById("sync-status");
  if (!el) return;
  el.textContent = msg;
  if (clearAfterMs > 0) {
    setTimeout(() => { if (el.textContent === msg) el.textContent = ""; }, clearAfterMs);
  }
}


// ── SECRET SYNC CONTROLS ──────────────────────
let syncTapCount = 0;
let syncTapTimer = null;

function handleSyncTap() {
  syncTapCount++;
  clearTimeout(syncTapTimer);
  syncTapTimer = setTimeout(() => { syncTapCount = 0; }, 2000);
  if (syncTapCount >= 5) {
    syncTapCount = 0;
    showSyncControls();
  }
}

async function showSyncControls() {
  if (!confirm("⚠️ Admin sync controls. Use with care.")) return;
  const choice = confirm("OK = Force Download from cloud\nCancel = Force Upload to cloud");
  manualSyncInProgress = true;
  stopBackgroundSync();
  clearTimeout(syncTimeout); syncTimeout = null;
  if (loadInFlight) await loadInFlight; // start from a settled state
  if (commitInFlight) await commitInFlight;
  if (choice) {
    forceDownloadNext = true; // replace this copy with the cloud's, no merge
    await loadFromCloud();
    setStatus("⬇️ Downloaded", 3000);
  } else {
    S.savedAt = Date.now();
    saveLocalOnly();
    syncedDocCache = {}; // force every doc up, no diffing
    commitUrgent = true; // and no merge first: this copy replaces the cloud's
    await commitToFirestore();
  }
  manualSyncInProgress = false;
  startBackgroundSync();
}
