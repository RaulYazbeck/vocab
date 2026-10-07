// ── FIREBASE AUTH & SYNC ──────────────────────
//
// Architecture:
//   • Firestore is the source of truth; localStorage is the cache.
//   • LOAD (cheap): read the meta doc first — 1 read. Only when the
//     cloud is actually newer (or local looks like a fresh install)
//     fetch the full collection of word docs.
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
//   • A load that finds local newer (or the cloud empty) pushes local
//     up right away instead of waiting for the next answer.
//   • Failed commits retry with backoff, and again when the device
//     comes back online or the tab becomes visible.
//   • The meta doc is written last, after the deck docs landed, so its
//     savedAt always marks a complete commit.
//   • State pulled from the cloud is stored locally straight away.
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
// Coalesced local saves (see scheduleLocalSave). Declared up here so they
// exist even if the Firebase setup below fails (offline, blocked CDN).
const LOCAL_SAVE_DEBOUNCE_MS = 300;
let _localSaveT = 0;

// Timeouts: generous — they exist to catch hung requests, not slow ones.
const LOAD_META_TIMEOUT_MS = 20000;
const LOAD_ALL_TIMEOUT_MS  = 45000;
const COMMIT_TIMEOUT_MS    = 30000;
const COMMIT_RETRY_MS = [3000, 10000, 30000, 60000];
const LOAD_RETRY_MS   = [10000, 30000, 60000, 120000];

let syncUid = null;            // uid the flags/caches below belong to
let loadInFlight = null;       // promise of the running cloud load
let cloudLoadedOnce = false;   // a load has succeeded for this user
let loadFailures = 0;
let loadRetryT = 0;
let commitInFlight = null;     // promise of the running commit
let commitAgain = false;       // commit asked for while one was running
let commitAfterLoad = false;   // commit asked for while a load was running
let commitFailures = 0;
let commitRetryT = 0;
let commitPendingSince = 0;    // first save of the current debounce burst

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
  syncedDocCache = {};
  initialLoadComplete = false;
  cloudLoadedOnce = false;
  loadFailures = 0;
  commitFailures = 0;
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
    t = setTimeout(() => reject(new Error(what + " timed out after " + Math.round(ms / 1000) + "s")), ms);
  });
  return Promise.race([promise, timer]).finally(() => clearTimeout(t));
}

// ── DOC BUILDING ──────────────────────────────
// State maps onto Firestore docs: one meta doc (everything except
// words) + one doc per deck holding that deck's word stats.

function buildSyncDocs() {
  const wordsByDeck = {};
  Object.keys(S.words).forEach(key => {
    const deckId = key.substring(0, key.lastIndexOf("_"));
    if (!wordsByDeck[deckId]) wordsByDeck[deckId] = {};
    wordsByDeck[deckId][key] = S.words[key];
  });
  const { words, usageArchive, learn, ...meta } = S;
  meta._evidence = evidenceCount(S); // lets loads compare without fetching words
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
  // Local's save stamp as the load starts. Answers given while it runs
  // must not make local look newer than a cloud that really is newer
  // (another device's session) — that would push over it.
  const localTime = S.savedAt || 0;
  // Saves made while the load ran (held back from the cloud) — push
  // them once the load has kept local.
  const pushIfChanged = () => { if ((S.savedAt || 0) !== localTime) commitAfterLoad = true; };
  // The account changed while we waited — drop the result.
  const stale = () => !currentUser || currentUser.uid !== uid;
  const loaded = () => {
    initialLoadComplete = true;
    cloudLoadedOnce = true;
    loadFailures = 0;
  };

  return withTimeout(ref.doc(STORAGE_KEY).get({ source: 'server' }), LOAD_META_TIMEOUT_MS, "Cloud load").then(metaSnap => {
    if (stale()) return;
    if (!metaSnap.exists) {
      // Nothing in the cloud yet: put this device's progress there.
      loaded();
      if (S.savedAt) commitAfterLoad = true;
      setStatus("☁️ Synced", 3000);
      return;
    }
    const meta = metaSnap.data();
    const cloudTime = meta.savedAt || 0;

    if (localTime && cloudTime === localTime) {
      // Same save on both sides — already in sync, 1 read total.
      // (Fetching here would re-apply cloud docs over local; if a deck
      // doc failed to write, that would roll its answers back.)
      loaded();
      pushIfChanged();
      if (commitFailures) commitAfterLoad = true; // finish a failed commit
      setStatus("☁️ Synced", 3000);
      return;
    }

    if (cloudTime < localTime) {
      // Local is newer. Accept cloud anyway only in the fresh-install
      // scenario (local nearly empty, cloud has real data) — decidable
      // from the meta doc alone, no word fetch needed.
      const localEv = evidenceCount(S);
      const cloudEv = meta._evidence;
      const freshInstall =
        (localEv < 5 && (cloudEv === undefined || cloudEv >= 20)) ||
        ((S.exp || 0) < 50 && (meta.exp || 0) >= 200);
      if (!freshInstall) {
        // Local has changes the cloud never got (e.g. the app was
        // closed before the last commit landed): push them up now.
        loaded();
        commitAfterLoad = true;
        setStatus("☁️ Synced (local newer)", 3000);
        return; // 1 read total
      }
    }

    // Cloud is newer (or fresh-install override) — fetch all.
    return withTimeout(ref.get({ source: 'server' }), LOAD_ALL_TIMEOUT_MS, "Cloud load").then(snapshot => {
      if (stale()) return;
      let cloudMeta = null;
      const allWords = {};
      const usageArchive = {};
      let cloudLearn = null;
      snapshot.forEach(doc => {
        const data = doc.data();
        if (doc.id === STORAGE_KEY) cloudMeta = data;
        else if (doc.id.startsWith(STORAGE_KEY + "_words_")) Object.assign(allWords, data.words || {});
        else if (doc.id === STORAGE_KEY + "_learn") cloudLearn = data.learn || null;
        else if (doc.id.startsWith(STORAGE_KEY + "_usage_")) usageArchive[doc.id.slice((STORAGE_KEY + "_usage_").length)] = data.days || {};
      });
      if (!cloudMeta) { loaded(); setStatus("☁️ Synced", 3000); return; }

      // Answers given while this fetch ran are not pushed (commits wait
      // for the load) and the newer cloud state below replaces them.
      if ((S.savedAt || 0) !== localTime) {
        console.warn("[sync] local changed during cloud load; the newer cloud state wins");
      }

      // Usage history is never lost to a load: archived days only this
      // device has are kept alongside the cloud's.
      Object.entries(S.usageArchive || {}).forEach(([y, days]) => {
        usageArchive[y] = { ...(days || {}), ...(usageArchive[y] || {}) };
      });
      const cloudState = { ...cloudMeta, words: allWords, usageArchive };
      if (cloudLearn || S.learn) cloudState.learn = cloudLearn || S.learn;
      if (S.usage && S.usage.days) {
        const cu = cloudState.usage = { ...(cloudState.usage || {}) };
        cu.days = { ...S.usage.days, ...(cu.days || {}) };
      }
      delete cloudState._evidence; // derived field, not real state

      // Sanity-check for regression before accepting.
      if ((cloudState.savedAt || 0) >= localTime && isRegression(S, cloudState)) {
        console.warn("Refusing cloud load: looks like a regression.", {
          localEvidence: evidenceCount(S),
          cloudEvidence: evidenceCount(cloudState),
        });
        const accept = confirm(
          "⚠️ Cloud data looks older than local data.\n\n" +
          "Local: " + evidenceCount(S) + " answers, " + S.exp + " XP\n" +
          "Cloud: " + evidenceCount(cloudState) + " answers, " + (cloudState.exp||0) + " XP\n\n" +
          "Accept cloud data (LOSE local progress)?\n" +
          "Cancel = keep local and push it to cloud."
        );
        if (!accept) {
          // Force local to overwrite cloud on next save.
          loaded();
          syncedDocCache = {};
          S.savedAt = Date.now();
          saveToCloud();
          setStatus("☁️ Kept local, pushing up", 3000);
          return;
        }
      }

      S = cloudState;
      migrate();
      recordLogin();
      if (typeof noteJourneyLevels === "function") noteJourneyLevels();
      if (typeof questEnsureToday === "function") questEnsureToday();
      if (typeof applyCosmetics === "function") applyCosmetics();
      if (typeof invalidatePathScan === "function") invalidatePathScan();
      renderExpBar();
      renderGroups();
      if (typeof renderHome === "function") renderHome();
      // The loaded state is this device's state now — store it, or a
      // reload before the next answer would bring back the old copy.
      saveLocalOnly();
      // What we just loaded IS the cloud content — seed the save diff
      // cache so the next commit only writes docs that really changed.
      const docs = buildSyncDocs();
      syncedDocCache = {};
      Object.entries(docs).forEach(([id, payload]) => { syncedDocCache[id] = JSON.stringify(payload); });

      setStatus("☁️ Synced", 3000);
      loaded();
    });
  }).catch(e => {
    console.error("Cloud load failed (no fallback to cache):", e);
    if (stale()) return;
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
      if ((S.savedAt || 0) !== localTime) commitToFirestore();
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
// Used to detect when a load would regress state.
function evidenceCount(state) {
  if (!state || !state.words) return 0;
  let n = 0;
  Object.values(state.words).forEach(ws => {
    n += (ws.correct || 0) + (ws.wrong || 0);
  });
  return n;
}

// A load is a regression if cloud has materially less evidence than local.
// Threshold: cloud has fewer than 90% of local's answers, OR cloud has
// significantly less XP. Tuned to be lenient (allow normal drift) but
// catch big losses.
function isRegression(local, cloud) {
  const localEv = evidenceCount(local);
  const cloudEv = evidenceCount(cloud);
  const localXp = local.exp || 0;
  const cloudXp = cloud.exp || 0;

  // If local has very little, accept anything.
  if (localEv < 10) return false;

  // Cloud has materially less work.
  if (cloudEv < localEv * 0.9) return true;
  // Cloud has materially less XP.
  if (cloudXp < localXp * 0.9) return true;

  return false;
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

  const user = currentUser;
  const docs = buildSyncDocs();
  const changed = Object.entries(docs)
    .map(([id, payload]) => [id, JSON.stringify(payload)])
    .filter(([id, json]) => syncedDocCache[id] !== json);
  if (!changed.length) { commitFailures = 0; setStatus("☁️ Saved", 2000); return; }

  const run = sendCommit(user, changed);
  commitInFlight = run;
  await run;
  commitInFlight = null;
  if (commitAgain) {
    commitAgain = false;
    commitToFirestore();
  }
}

async function sendCommit(user, changed) {
  setStatus("☁️ Saving…");
  const abort = typeof AbortController === "function" ? new AbortController() : null;
  try {
    let failedIds;
    try {
      failedIds = await withTimeout(writeDocs(user, changed, abort && abort.signal), COMMIT_TIMEOUT_MS, "Cloud save");
    } catch (e) {
      if (abort) abort.abort(); // don't let a hung write land late
      throw e;
    }
    // Docs that did land are recorded, so a retry resends only the rest.
    if (currentUser && currentUser.uid === user.uid) {
      changed.forEach(([id, json]) => { if (!failedIds.includes(id)) syncedDocCache[id] = json; });
    }
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

// Sends the changed docs; resolves to the ids that failed to write.
// The meta doc goes last, only once every other doc has landed: its
// savedAt then marks a complete commit. (Written alongside, a commit cut
// short — page killed, a write failed — could leave the cloud meta
// claiming a save whose deck docs never arrived.)
async function writeDocs(user, changed, signal) {
  const isMeta = ([id]) => id === STORAGE_KEY;
  const rest = changed.filter(c => !isMeta(c));
  const meta = changed.filter(isMeta);
  const failed = rest.length ? await sendDocs(user, rest, signal) : [];
  if (!meta.length) return failed;
  if (failed.length) return failed.concat(meta.map(([id]) => id));
  return sendDocs(user, meta, signal);
}

async function sendDocs(user, changed, signal) {
  if (isIOSPWA) return commitViaREST(user, changed, signal);
  const ref = db.collection("users").doc(user.uid).collection("apps");
  const results = await Promise.allSettled(
    changed.map(([id, json]) => ref.doc(id).set(JSON.parse(json)))
  );
  const failed = [];
  results.forEach((r, i) => {
    if (r.status === "rejected") {
      console.error("Cloud save failed for " + changed[i][0] + ":", r.reason?.message);
      failed.push(changed[i][0]);
    }
  });
  return failed;
}

async function commitViaREST(user, changed, signal) {
  const projectId = "german-vocab-a"; // your Firebase project ID
  const baseUrl = `https://firestore.googleapis.com/v1/projects/${projectId}/databases/(default)/documents/users/${user.uid}/apps`;

  function toFirestoreValue(val) {
    if (val === null || val === undefined) return { nullValue: null };
    if (typeof val === "boolean") return { booleanValue: val };
    if (typeof val === "number") return Number.isInteger(val) ? { integerValue: val } : { doubleValue: val };
    if (typeof val === "string") return { stringValue: val };
    if (Array.isArray(val)) return { arrayValue: { values: val.map(toFirestoreValue) } };
    if (typeof val === "object") return { mapValue: { fields: Object.fromEntries(Object.entries(val).map(([k,v]) => [k, toFirestoreValue(v)])) } };
    return { stringValue: String(val) };
  }
  function toFirestoreDoc(obj) {
    return { fields: Object.fromEntries(Object.entries(obj).map(([k,v]) => [k, toFirestoreValue(v)])) };
  }

  const send = (docId, json, token) =>
    fetch(`${baseUrl}/${docId}`, {
      method: "PATCH",
      headers: { "Authorization": `Bearer ${token}`, "Content-Type": "application/json" },
      body: JSON.stringify(toFirestoreDoc(JSON.parse(json))),
      signal
    }).then(r => {
      if (!r.ok) { const e = new Error(`HTTP ${r.status}`); e.status = r.status; throw e; }
    });
  const settle = p => p.then(() => null, e => e);

  let token = await user.getIdToken();
  let errors = await Promise.all(changed.map(([id, json]) => settle(send(id, json, token))));
  // 401 = the ID token went stale (common after an iOS resume): refresh
  // it once and resend just those docs.
  if (errors.some(e => e && e.status === 401)) {
    token = await user.getIdToken(true);
    errors = await Promise.all(changed.map(([id, json], i) =>
      errors[i] && errors[i].status === 401 ? settle(send(id, json, token)) : errors[i]));
  }
  const failed = [];
  errors.forEach((e, i) => {
    if (e) { console.error("Cloud save failed for " + changed[i][0] + ":", e.message); failed.push(changed[i][0]); }
  });
  return failed;
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
    S.savedAt = 0;
    saveLocalOnly();
    await loadFromCloud();
    setStatus("⬇️ Downloaded", 3000);
  } else {
    S.savedAt = Date.now();
    saveLocalOnly();
    syncedDocCache = {}; // force every doc up, no diffing
    await commitToFirestore();
  }
  manualSyncInProgress = false;
  startBackgroundSync();
}
