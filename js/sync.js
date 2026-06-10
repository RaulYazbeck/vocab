// ── FIREBASE AUTH & SYNC ──────────────────────
//
// Architecture:
//   • Firestore persistence enabled → offline writes queue locally,
//     flush automatically when back online. No offline logic needed.
//   • On login: always load from Firestore unconditionally (no EXP
//     comparison). Firestore is source of truth; localStorage is cache.
//   • On save: write to localStorage immediately, then debounce-write
//     to Firestore (300ms). Every save stamps a `savedAt` timestamp.
//   • On load merge: take cloud if cloud.savedAt >= local.savedAt,
//     otherwise keep local (local has newer unsaved progress).
//   • beforeunload: bypass debounce, write to Firestore immediately
//     so tab/browser closes don't lose the last session.
//   • Background sync: periodically while online (see
//     BG_SYNC_INTERVAL_MS), pull from Firestore as a safety net
//     for cross-device drift.
//
// ─────────────────────────────────────────────

let currentUser  = null;
let syncTimeout  = null;
let bgSyncInterval = null;
let manualSyncInProgress = false;
let initialLoadComplete = false; // gate cloud writes until first load finishes

const isIOSPWA = navigator.standalone === true;

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

// ── LOAD FROM CLOUD ───────────────────────────
// Always prefer the most recently saved state using savedAt timestamp.
// Falls back to unconditional overwrite if either side lacks savedAt
// (handles existing data that pre-dates this change).

function loadFromCloud() {
  if (!currentUser) return;
  setStatus("☁️ Syncing…");
  const ref = db.collection("users").doc(currentUser.uid).collection("apps");

  // CRITICAL: no cache fallback. If the server is unreachable, do nothing
  // and let local state stand. The cached Firestore data can be days old
  // and silently clobbering local state was the source of major data loss.
  return ref.get({ source: 'server' }).then(snapshot => {
    let meta = null;
    const allWords = {};

    snapshot.forEach(doc => {
      const data = doc.data();
      if (doc.id === STORAGE_KEY) {
        meta = data;
      } else if (doc.id.startsWith(STORAGE_KEY + "_words_")) {
        Object.assign(allWords, data.words || {});
      }
    });

    if (!meta) { setStatus("☁️ Synced", 3000); initialLoadComplete = true; return; }

    const cloudTime = meta.savedAt || 0;
    const localTime = S.savedAt || 0;

    const cloudState = { ...meta, words: allWords };

    if (cloudTime < localTime) {
      // Local timestamp is newer, BUT: if local is nearly empty and cloud
      // has substantial data, this is almost certainly a fresh-install or
      // post-sign-in scenario where local state is bogus. Override and
      // accept cloud.
      if (isFreshInstallVsCloud(S, cloudState)) {
        console.warn("Local looks like a fresh install but cloud has data. Accepting cloud.");
        S = cloudState;
        migrate();
        recordLogin();
        renderExpBar();
        renderGroups();
        setStatus("☁️ Restored from cloud", 3000);
        initialLoadComplete = true;
        return;
      }
      setStatus("☁️ Synced (local newer)", 3000);
      initialLoadComplete = true;
      return;
    }

    // Cloud is newer-or-equal. Before accepting, sanity-check for regression.
    if (isRegression(S, cloudState)) {
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

    setStatus("☁️ Synced", 3000);
    initialLoadComplete = true;
  }).catch(e => {
    console.error("Cloud load failed (no fallback to cache):", e);
    setStatus("⚠️ Offline — using local data", 3000);
    // Even on failure, unblock writes after a delay so the user isn't
    // permanently locked out if they're offline at open time.
    setTimeout(() => { initialLoadComplete = true; }, 5000);
  });
}

// Count "evidence of progress" — total answers given + total XP.
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

// Detect "fresh install meets real cloud data" scenario.
// Local has trivial evidence, cloud has substantial evidence → cloud wins
// regardless of timestamps.
function isFreshInstallVsCloud(local, cloud) {
  const localEv = evidenceCount(local);
  const cloudEv = evidenceCount(cloud);
  const localXp = local.exp || 0;
  const cloudXp = cloud.exp || 0;
  // Local has barely anything AND cloud has real data
  if (localEv < 5 && cloudEv >= 20) return true;
  if (localXp < 50 && cloudXp >= 200) return true;
  return false;
}

// ── SAVE TO CLOUD ─────────────────────────────
// Stamps savedAt, writes localStorage immediately, debounces Firestore
// write to 300ms to batch rapid successive saves (e.g. answering words).

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
  }, 300);
}

// Write to Firestore immediately — used by beforeunload and background sync.
async function commitToFirestore(retries = 3) {
  if (!currentUser) return;
  setStatus("☁️ Saving…");
  try {
    if (isIOSPWA) {
      await commitViaREST();
    } else {
      const ref = db.collection("users").doc(currentUser.uid).collection("apps");
      const wordsByDeck = {};
      Object.keys(S.words).forEach(key => {
        const deckId = key.substring(0, key.lastIndexOf("_"));
        if (!wordsByDeck[deckId]) wordsByDeck[deckId] = {};
        wordsByDeck[deckId][key] = S.words[key];
      });
      const { words, ...meta } = S;
      const saves = [ref.doc(STORAGE_KEY).set(meta)];
      Object.entries(wordsByDeck).forEach(([deckId, deckWords]) => {
        saves.push(ref.doc(STORAGE_KEY + "_words_" + deckId).set({ words: deckWords }));
      });
      const results = await Promise.allSettled(saves);
      const failed = results.filter(r => r.status === "rejected");
      if (failed.length > 0) {
        console.error("Cloud save failed:", failed.map(r => r.reason?.message));
        throw new Error("Some doc writes failed");
      }
    }
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

async function commitViaREST() {
  if (!currentUser) return;
  
  const token = await currentUser.getIdToken();
  const projectId = "german-vocab-a"; // your Firebase project ID
  const baseUrl = `https://firestore.googleapis.com/v1/projects/${projectId}/databases/(default)/documents/users/${currentUser.uid}/apps`;

  const wordsByDeck = {};
  Object.keys(S.words).forEach(key => {
    const deckId = key.substring(0, key.lastIndexOf("_"));
    if (!wordsByDeck[deckId]) wordsByDeck[deckId] = {};
    wordsByDeck[deckId][key] = S.words[key];
  });

  const { words, ...meta } = S;
  const docs = { [STORAGE_KEY]: meta };
  Object.entries(wordsByDeck).forEach(([deckId, deckWords]) => {
    docs[STORAGE_KEY + "_words_" + deckId] = { words: deckWords };
  });

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

  const saves = Object.entries(docs).map(([docId, data]) =>
    fetch(`${baseUrl}/${docId}`, {
      method: "PATCH",
      headers: { "Authorization": `Bearer ${token}`, "Content-Type": "application/json" },
      body: JSON.stringify(toFirestoreDoc(data))
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
// Pulls from Firestore on an interval while online.
// Does nothing when offline — Firestore persistence handles that.

const BG_SYNC_INTERVAL_MS = 30 * 1000;

function startBackgroundSync() {
  stopBackgroundSync(); // clear any existing interval first
  bgSyncInterval = setInterval(() => {
    if (navigator.onLine && !manualSyncInProgress) {
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

// ── BEFOREUNLOAD FLUSH ────────────────────────
// Bypasses the debounce on tab/browser close so the last session
// is never lost due to the debounce window being open.
// Uses sendBeacon-style approach: fire-and-forget, no await.

window.addEventListener("beforeunload", () => {
  clearTimeout(syncTimeout); // cancel any pending debounce
  if (currentUser && S.savedAt) {
    commitToFirestore();
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
    await commitToFirestore();
  }
  manualSyncInProgress = false;
  startBackgroundSync();
}
