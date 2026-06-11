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
// ─────────────────────────────────────────────

let currentUser  = null;
let syncTimeout  = null;
let bgSyncInterval = null;
let manualSyncInProgress = false;
let initialLoadComplete = false; // gate cloud writes until first load finishes
let lastCloudLoadAt = 0;

const isIOSPWA = navigator.standalone === true;
const FIRESTORE_DEBOUNCE_MS = 2500;

// JSON of each doc as last written/loaded — used to skip unchanged
// docs on save. Cleared to force a full upload.
let syncedDocCache = {};

// ── AUTH ──────────────────────────────────────

auth.onAuthStateChanged(user => {
  currentUser = user;
  const btn    = document.getElementById("auth-btn");
  const status = document.getElementById("sync-status");

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
});

function handleAuth() {
  if (currentUser) {
    if (confirm("Sign out?")) auth.signOut();
  } else {
    const provider = new firebase.auth.GoogleAuthProvider();
    auth.signInWithPopup(provider).catch(e => alert("Sign in failed: " + e.message));
  }
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
  const { words, ...meta } = S;
  meta._evidence = evidenceCount(S); // lets loads compare without fetching words
  const docs = { [STORAGE_KEY]: meta };
  Object.entries(wordsByDeck).forEach(([deckId, deckWords]) => {
    docs[STORAGE_KEY + "_words_" + deckId] = { words: deckWords };
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
  if (!currentUser) return;
  setStatus("☁️ Syncing…");
  const ref = db.collection("users").doc(currentUser.uid).collection("apps");
  lastCloudLoadAt = Date.now();

  return ref.doc(STORAGE_KEY).get({ source: 'server' }).then(metaSnap => {
    if (!metaSnap.exists) {
      setStatus("☁️ Synced", 3000);
      initialLoadComplete = true;
      return;
    }
    const meta = metaSnap.data();
    const cloudTime = meta.savedAt || 0;
    const localTime = S.savedAt || 0;

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
        setStatus("☁️ Synced (local newer)", 3000);
        initialLoadComplete = true;
        return; // 1 read total
      }
    }

    // Cloud is newer-or-equal (or fresh-install override) — fetch all.
    return ref.get({ source: 'server' }).then(snapshot => {
      let cloudMeta = null;
      const allWords = {};
      snapshot.forEach(doc => {
        const data = doc.data();
        if (doc.id === STORAGE_KEY) cloudMeta = data;
        else if (doc.id.startsWith(STORAGE_KEY + "_words_")) Object.assign(allWords, data.words || {});
      });
      if (!cloudMeta) { setStatus("☁️ Synced", 3000); initialLoadComplete = true; return; }

      const cloudState = { ...cloudMeta, words: allWords };
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
          initialLoadComplete = true;
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
      renderExpBar();
      renderGroups();
      // What we just loaded IS the cloud content — seed the save diff
      // cache so the next commit only writes docs that really changed.
      const docs = buildSyncDocs();
      syncedDocCache = {};
      Object.entries(docs).forEach(([id, payload]) => { syncedDocCache[id] = JSON.stringify(payload); });

      setStatus("☁️ Synced", 3000);
      initialLoadComplete = true;
    });
  }).catch(e => {
    console.error("Cloud load failed (no fallback to cache):", e);
    setStatus("⚠️ Offline — using local data", 3000);
    // Even on failure, unblock writes after a delay so the user isn't
    // permanently locked out if they're offline at open time.
    setTimeout(() => { initialLoadComplete = true; }, 5000);
  });
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
  saveLocalOnly();
  if (!currentUser) return;

  // CRITICAL: do not write to cloud until initial load has completed.
  // Otherwise, any state change between page open and cloud load can
  // push stale local state up and clobber newer data on the server.
  if (!initialLoadComplete) {
    console.log("[sync] suppressing cloud write — initial load not yet complete");
    return;
  }

  clearTimeout(syncTimeout);
  syncTimeout = setTimeout(() => {
    commitToFirestore();
  }, FIRESTORE_DEBOUNCE_MS);
}

// Write to Firestore immediately — used by unload/hide and force-upload.
// Diffs each doc against the last written version and skips unchanged
// docs, so a typical commit writes 2 small docs instead of ~30.
async function commitToFirestore(retries = 3) {
  if (!currentUser) return;
  const docs = buildSyncDocs();
  const changed = Object.entries(docs)
    .map(([id, payload]) => [id, JSON.stringify(payload)])
    .filter(([id, json]) => syncedDocCache[id] !== json);
  if (!changed.length) { setStatus("☁️ Saved", 2000); return; }

  setStatus("☁️ Saving…");
  try {
    if (isIOSPWA) {
      await commitViaREST(changed);
    } else {
      const ref = db.collection("users").doc(currentUser.uid).collection("apps");
      const results = await Promise.allSettled(
        changed.map(([id, json]) => ref.doc(id).set(JSON.parse(json)))
      );
      const failed = results.filter(r => r.status === "rejected");
      if (failed.length > 0) {
        console.error("Cloud save failed:", failed.map(r => r.reason?.message));
        throw new Error("Some doc writes failed");
      }
    }
    changed.forEach(([id, json]) => { syncedDocCache[id] = json; });
    setStatus("☁️ Saved", 2000);
  } catch (e) {
    console.error("Cloud save failed:", e.message);
    if (retries > 0) {
      setStatus("⚠️ Retrying…");
      setTimeout(() => commitToFirestore(retries - 1), 3000);
    } else {
      setStatus("⚠️ Sync failed");
    }
  }
}

async function commitViaREST(changed) {
  if (!currentUser) return;

  const token = await currentUser.getIdToken();
  const projectId = "german-vocab-a"; // your Firebase project ID
  const baseUrl = `https://firestore.googleapis.com/v1/projects/${projectId}/databases/(default)/documents/users/${currentUser.uid}/apps`;

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

  const saves = changed.map(([docId, json]) =>
    fetch(`${baseUrl}/${docId}`, {
      method: "PATCH",
      headers: { "Authorization": `Bearer ${token}`, "Content-Type": "application/json" },
      body: JSON.stringify(toFirestoreDoc(JSON.parse(json)))
    }).then(r => { if (!r.ok) throw new Error(`HTTP ${r.status}`); })
  );

  await Promise.all(saves);
}

// Write to localStorage only — no Firestore, no debounce.
function saveLocalOnly() {
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

// ── UNLOAD / HIDE FLUSH ───────────────────────
// Bypasses the debounce so the last answers are never lost. The
// visibilitychange→hidden hook is the one that actually fires on
// mobile PWAs; beforeunload covers desktop tabs. Returning to a
// visible tab triggers a pull if the last sync is stale.

function flushPendingSave() {
  clearTimeout(syncTimeout);
  if (currentUser && initialLoadComplete && S.savedAt) {
    commitToFirestore();
  }
}

window.addEventListener("beforeunload", flushPendingSave);

document.addEventListener("visibilitychange", () => {
  if (document.visibilityState === "hidden") {
    flushPendingSave();
  } else if (
    currentUser && navigator.onLine && !manualSyncInProgress &&
    Date.now() - lastCloudLoadAt > RETURN_SYNC_MIN_AGE_MS
  ) {
    loadFromCloud();
  }
});

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
