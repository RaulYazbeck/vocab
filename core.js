// ─────────────────────────────────────────────────────────────────
// core.js — Shared vocab app engine
// Requires APP_CONFIG to be defined before this file loads:
// {
//   title: "🇩🇪 German Vocabulary",
//   speechLang: "de-DE",
//   storageKey: "gv5_de",
//   allGroups: [DECKS_A1, DECKS_A2],
// }
// Also requires Firebase (firebase-app-compat, firebase-auth-compat,
// firebase-firestore-compat) and firebaseConfig to be initialized
// before this file loads.
// ─────────────────────────────────────────────────────────────────

// ── CONSTANTS ────────────────────────────────
const STORAGE_KEY   = APP_CONFIG.storageKey;
const ALL_GROUPS    = APP_CONFIG.allGroups;
const WORD_KEY      = APP_CONFIG.targetProp;
const UNLOCK_STEP   = 10;
const UNLOCK_INITIAL = 12;

const EXP_BASE = 400, EXP_RATIO = 1.08;
function expForLevel(n) {
  if (n <= 1) return 0;
  return Math.round(EXP_BASE * (Math.pow(EXP_RATIO, n - 1) - 1) / (EXP_RATIO - 1));
}

const BADGE_DEFS = [
  { id:"first_correct",  icon:"🌱", name:"First Steps",   desc:"First correct answer" },
  { id:"on_fire",        icon:"🔥", name:"On Fire",       desc:"10 correct in one session" },
  { id:"streak_3",       icon:"📅", name:"Dedicated",     desc:"3-day login streak" },
  { id:"streak_7",       icon:"🗓️", name:"Committed",     desc:"7-day login streak" },
  { id:"streak_30",      icon:"💎", name:"Obsessed",      desc:"30-day login streak" },
  { id:"sharp",          icon:"🎯", name:"Sharp",         desc:"20 correct in a row" },
  { id:"century",        icon:"📚", name:"Century",       desc:"100 total correct answers" },
  { id:"mastery_10",     icon:"🏆", name:"Mastery",       desc:"10 words mastered" },
  { id:"mastery_50",     icon:"👑", name:"Grand Master",  desc:"50 words mastered" },
  { id:"speed_demon",    icon:"⚡", name:"Speed Demon",   desc:"Complete a timer session" },
  { id:"polyglot",       icon:"🌍", name:"Polyglot",      desc:"All words unlocked in a deck" },
  { id:"graduate",       icon:"🎓", name:"Graduate",      desc:"All words mastered in a deck" },
];

const DRILL_MILESTONES = [
  { at:25, xp:10 }, { at:50, xp:20 }, { at:75, xp:30 }, { at:100, xp:40 }
];
function getDrillMilestone(n) {
  if (n <= 100) return DRILL_MILESTONES.find(m => m.at === n) || null;
  if (n > 100 && n % 50 === 0) return { at:n, xp:50 };
  return null;
}

// ── STATE ─────────────────────────────────────
let S = loadState();
let selectedIds = new Set();
let openGroups  = new Set();
let activeMode    = "drill";
let drillSubMode  = "classic"; // 'classic' | 'focus' | 'refresh'
let timerSubMode  = "classic"; // 'classic' | 'focus'
let muteEnabled   = localStorage.getItem('gv_mute') === 'true';
let activeWords = [];
let currentWord = null;
let answered    = false;
let targetVoice = null;

let sessionCorrect = 0;
let sessionConsecutive = 0;

let timerTotal = 0, timerLeft = 0, timerInterval = null;
let timerQueue = [], timerCorrect = 0, timerWrong = 0, timerWordsDone = 0;
let timerFinished = false, timerPaused = false;
let timerWordCount = 10, timerExpEarned = 0;
let stagedDeckId = null, stagedCount = 0;

let learnQueue = [], learnIndex = 0;

let voiceRecognition = null;
let voiceActive = false;
let voiceSilenceTimer = null;
let voiceSessionRunning = false;
let voiceEnabled = false;

// ── VOICE PARAMETERS ─────────────────────────
const VOICE_PARAMS = {
  silenceTimeout:  5000,
  correctShowTime: 1500,
  wrongShowTime:   2500,
  minConfidence:   0.35,
  skipPhrases:   ["skip","i don't know","keine ahnung","weiter","pass","je sais pas","passer"],
  repeatPhrases: ["again","repeat","nochmal","wiederholen","encore","répéter"],
};

// ── PERSISTENCE ──────────────────────────────
function loadState() {
  try {
    const r = localStorage.getItem(APP_CONFIG.storageKey);
    if (r) return JSON.parse(r);
  } catch(e) {}
  return { words:{}, exp:0, badges:[], unlocked:{}, loginDates:[], totalCorrect:0, lastLoginDate:"", savedAt:0 };
}
function saveState() {
  saveToCloud(); // stamps savedAt, writes localStorage, debounces Firestore
}
function migrate() {
  if (!S.words)         S.words = {};
  if (!S.exp)           S.exp = 0;
  if (!S.badges)        S.badges = [];
  if (!S.unlocked)      S.unlocked = {};
  if (!S.loginDates)    S.loginDates = [];
  if (!S.totalCorrect)  S.totalCorrect = 0;
  if (!S.lastLoginDate) S.lastLoginDate = "";
  if (!S.drillMilestonesDate)    S.drillMilestonesDate = "";
  if (!S.drillCorrectToday)      S.drillCorrectToday = 0;
  if (!S.drillMilestonesClaimed) S.drillMilestonesClaimed = [];
  if (S.drillMilestonesDate !== todayISO()) {
    S.drillMilestonesDate = todayISO();
    S.drillCorrectToday = 0;
    S.drillMilestonesClaimed = [];
  }
  Object.keys(S.words).forEach(key => {
    const ws = S.words[key];
    if (ws.lastAnsweredAt === undefined) ws.lastAnsweredAt = null;
    if (!ws.mastered && (ws.streak >= 6 || ws.displayStreak >= 6)) ws.mastered = true;
    if (ws.displayStreak === undefined) ws.displayStreak = ws.streak;
    if (ws.masteryPlusDate && ws.mastered) {
      const today = todayISO();
      if (daysBetween(ws.masteryPlusDate, today) > 21) {
        ws.masteryPlusDate = null;
        ws.streak = 0;
      }
    }
    if (!ws.anki) {
      ws.anki = {
        phase: "new",
        interval: 0,
        easeFactor: 2.5,
        dueDate: null,
        learningStep: 0,
        lapses: 0,
      };
    }
  });
  S.loginDates = [...new Set(S.loginDates)].sort();
}

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
//   • Background sync: every 3 minutes while online, pull from
//     Firestore as a safety net for cross-device drift.
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
  if (!currentUser) return;

  S.savedAt = Date.now();
  saveLocalOnly();

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
// Pulls from Firestore every 3 minutes while online.
// Does nothing when offline — Firestore persistence handles that.

const BG_SYNC_INTERVAL_MS = 0.5 * 60 * 1000; // 90 seconds

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

// ── VOICE (TTS) ───────────────────────────────
function initVoice() {
  if (!window.speechSynthesis) return;
  const load = () => {
    const v = speechSynthesis.getVoices();
    if (!v.length) return;
    const deVoices = v.filter(x => x.lang && x.lang.startsWith('de'));
    targetVoice = deVoices.find(x => x.lang === APP_CONFIG.speechLang) || deVoices[0] || null;
  };
  load();
  speechSynthesis.onvoiceschanged = load;
}
function speak(text) {
  if (muteEnabled || !window.speechSynthesis) return;
  speechSynthesis.cancel();
  const u = new SpeechSynthesisUtterance(text);
  u.lang = APP_CONFIG.speechLang;
  u.rate = 0.85;
  if (targetVoice) u.voice = targetVoice;
  speechSynthesis.speak(u);
}

// ── ANSWER CHECK ──────────────────────────────
function stripAccents(s) { return s.normalize("NFD").replace(/[̀-ͯ]/g,""); }
function normalizeChars(s) { return s.replace(/ß/g, "ss").replace(/['\-]/g, " ").replace(/\s+/g, " "); }
function normalize(s) { return normalizeChars(stripAccents(s.trim().toLowerCase())); }
function isCorrect(input, answer) {
  if (!input.trim()) return false;
  const ni = normalize(input);
  return answer.split("/").map(p => normalize(p.trim())).some(p => {
    if (!p.length) return false;
    const escaped = p.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    return new RegExp("(?<![a-zäöüß])" + escaped + "(?![a-zäöüß])", "i").test(ni);
  });
}

// ── EXP & LEVELS ──────────────────────────────
function addExp(amount) {
  S.exp += amount;
  saveState();
  renderExpBar();
}
function currentLevel() {
  let lv = 1;
  while (expForLevel(lv + 1) <= S.exp) lv++;
  return lv;
}
function getDailyStreak() {
  const today = new Date().toLocaleDateString('en-CA');
  const dates = [...new Set(S.loginDates)].sort();
  if (!dates.length) return 0;
  const last = dates[dates.length - 1];
  const diffFromToday = (new Date(today) - new Date(last)) / (1000*60*60*24);
  if (diffFromToday > 1) return 0;
  let streak = 1;
  for (let i = dates.length - 1; i > 0; i--) {
    const diff = Math.round((new Date(dates[i]) - new Date(dates[i-1])) / (1000*60*60*24));
    if (diff === 1) streak++;
    else break;
  }
  return streak;
}
function renderExpBar() {
  const lv   = currentLevel();
  const cur  = S.exp - expForLevel(lv);
  const need = expForLevel(lv + 1) - expForLevel(lv);
  const pct  = Math.min(100, Math.round((cur / need) * 100));
  const streak = getDailyStreak();
  const streakHtml = streak > 0
    ? `<div style="font-size:13px;font-weight:600;color:#E25C1A;">🔥 ${streak} day${streak>1?"s":""}</div>`
    : "";
  document.getElementById("exp-bar").innerHTML = `
    <div class="exp-bar-wrap">
      <div class="exp-level">Lv ${lv}</div>
      <div class="exp-track"><div class="exp-fill" style="width:${pct}%"></div></div>
      <div class="exp-label">${cur}/${need} XP</div>
      ${streakHtml}
    </div>`;
}

// ── UNLOCK SYSTEM ─────────────────────────────
function getUnlocked(deckId) {
  const deck = getDeck(deckId);
  if (!deck) return 0;
  if (S.unlocked[deckId] === undefined)
    S.unlocked[deckId] = Math.min(UNLOCK_INITIAL, deck.words.length);
  return S.unlocked[deckId];
}
function unlockMore(deckId) {
  event.stopPropagation();
  stagedDeckId = deckId;
  stagedCount  = UNLOCK_STEP;
  showUnlockModal();
}
function showUnlockModal() {
  const deck = getDeck(stagedDeckId);
  if (!deck) return;
  const currentlyUnlocked = getUnlocked(stagedDeckId);
  const toAdd       = Math.min(stagedCount, deck.words.length - currentlyUnlocked);
  const stagedWords = deck.words.slice(currentlyUnlocked, currentlyUnlocked + toAdd);
  const canAddMore  = (currentlyUnlocked + toAdd) < deck.words.length;
  const remaining   = deck.words.length - (currentlyUnlocked + toAdd);
  const existing = document.getElementById("unlock-modal");
  if (existing) existing.remove();
  const overlay = document.createElement("div");
  overlay.className = "modal-overlay";
  overlay.id = "unlock-modal";
  overlay.innerHTML = `
    <div class="modal-sheet">
      <div class="modal-title">Add new words</div>
      <div class="modal-sub">${deck.name} · ${currentlyUnlocked} unlocked · adding ${toAdd} words</div>
      <div class="modal-word-list">
        ${stagedWords.map(w=>`<div class="modal-word">
          <span class="modal-word-en">${w.en}</span>
          <span class="modal-word-de">${w[WORD_KEY]}</span>
        </div>`).join("")}
      </div>
      <button class="modal-add-more" id="modal-add-more-btn" onclick="stageMore()" ${!canAddMore?"disabled":""}>
        ${canAddMore ? `+ ${Math.min(UNLOCK_STEP,remaining)} more words` : `No more words to add`}
      </button>
      <div class="modal-actions">
        <button class="modal-btn secondary" onclick="cancelUnlock()">Cancel</button>
        <button class="modal-btn primary"   onclick="confirmUnlock()">Add & Learn →</button>
      </div>
    </div>`;
  document.body.appendChild(overlay);
}
function stageMore()  { stagedCount += UNLOCK_STEP; showUnlockModal(); }
function cancelUnlock() {
  stagedCount = 0; stagedDeckId = null;
  const modal = document.getElementById("unlock-modal");
  if (modal) modal.remove();
}
function confirmUnlock() {
  const deck = getDeck(stagedDeckId);
  if (!deck) return;
  const currentlyUnlocked = getUnlocked(stagedDeckId);
  const toAdd    = Math.min(stagedCount, deck.words.length - currentlyUnlocked);
  const newWords = deck.words.slice(currentlyUnlocked, currentlyUnlocked + toAdd);
  S.unlocked[stagedDeckId] = currentlyUnlocked + toAdd;
  saveState();
  checkBadge("polyglot");
  const modal = document.getElementById("unlock-modal");
  if (modal) modal.remove();
  const deckId = stagedDeckId;
  stagedCount = 0; stagedDeckId = null;
  activeWords = newWords.map((w,i) => ({...w, deckId, deckName:deck.name, idx:currentlyUnlocked+i}));
  activeMode = "learn";
  selectedIds.add(deckId);
  startLearn();
}
function unlockedWords(deck) {
  return deck.words.slice(0, getUnlocked(deck.id));
}

// ── SPACED REPETITION ─────────────────────────
function getWS(deckId, idx) {
  const key = deckId + "_" + idx;
  if (!S.words[key]) S.words[key] = { correct:0, wrong:0, streak:0, displayStreak:0, lastAnsweredAt:null, anki:{ phase:"new", interval:0, easeFactor:2.5, dueDate:null, learningStep:0, lapses:0 } };
  if (!S.words[key].anki) S.words[key].anki = { phase:"new", interval:0, easeFactor:2.5, dueDate:null, learningStep:0, lapses:0 };
  const ws = S.words[key];
  if (!ws.anki) ws.anki = { phase:"new", interval:0, easeFactor:2.5, dueDate:null, learningStep:0, lapses:0 };
  if (ws.displayStreak === undefined) ws.displayStreak = ws.streak;
  return ws;
}
function wilsonLower(correct, total) {
  if (total === 0) return 0;
  const z = 1.281; // 80% confidence
  const p = correct / total;
  return (p + z*z/(2*total) - z*Math.sqrt((p*(1-p)+z*z/(4*total))/total)) / (1 + z*z/total);
}
function isMastered(ws) {
  if (ws.mastered) return true;
  const total = ws.correct + ws.wrong;
  if (ws.streak >= 6) return true;
  if (total >= 6 && wilsonLower(ws.correct, total) >= 0.724) return true;
  return false;
}
function isMasteryPlus(ws) {
  if (!isMastered(ws)) return false;
  if (!ws.masteryPlusDate) return false;
  const today = todayISO();
  if (daysBetween(ws.masteryPlusDate, today) > 21) return false;
  return ws.streak >= 3 && wilsonLower(ws.correct, ws.correct + ws.wrong) >= 0.83;
}

function checkMasteryPlus(ws) {
  if (!isMastered(ws)) return;
  if (ws.streak >= 3 && wilsonLower(ws.correct, ws.correct + ws.wrong) >= 0.83) {
    if (!isMasteryPlus(ws)) {
      ws.masteryPlusDate = todayISO();
      ws.streak = 0;
      addExp(75);
    }
  }
}
function getWeight(w, focusMode=false) {
  const ws = getWS(w.deckId, w.idx);
  if (focusMode) {
    if (isMastered(ws)) return 0;
    if (ws.wrong > ws.correct && ws.wrong > 0) return 10 + ws.wrong * 3;
    return 5;
  }
  if (isMastered(ws)) return 1;
  if (ws.wrong > ws.correct && ws.wrong > 0) return 10 + ws.wrong * 2;
  return 5;
}
function pickNext(focusMode=false) {
  if (focusMode) {
    const unmastered = activeWords.filter(w => !isMastered(getWS(w.deckId, w.idx)));
    const masteredNotPlus = activeWords.filter(w => isMastered(getWS(w.deckId, w.idx)) && !isMasteryPlus(getWS(w.deckId, w.idx)));
    const masteryPlusWords = activeWords.filter(w => isMasteryPlus(getWS(w.deckId, w.idx)));
    const pool = unmastered.length ? unmastered : masteredNotPlus.length ? masteredNotPlus : masteryPlusWords;
    if (!pool.length) return null;
    const filtered = pool.length > 1 && currentWord
      ? pool.filter(w => !(w.deckId === currentWord.deckId && w.idx === currentWord.idx))
      : pool;
    const candidates = filtered.length ? filtered : pool;
    const weights = candidates.map(w => {
      const ws = getWS(w.deckId, w.idx);
      if (ws.correct === 0 && ws.wrong === 0) return 15;
      if (ws.wrong > ws.correct) return 10 + (ws.wrong - ws.correct) * 5;
      if (ws.correct > ws.wrong) return Math.max(2, 10 - 2 * (ws.correct - ws.wrong));
      return 10; // equal — still struggling
    });
    const total = weights.reduce((a,b) => a+b, 0);
    let r = Math.random() * total;
    for (let i = 0; i < candidates.length; i++) { r -= weights[i]; if (r <= 0) return candidates[i]; }
    return candidates[candidates.length - 1];
  }
  let pool = activeWords;
  if (!pool.length) return null;
  const filtered = pool.length > 1 && currentWord
    ? pool.filter(w => !(w.deckId === currentWord.deckId && w.idx === currentWord.idx))
    : pool;
  const candidates = filtered.length ? filtered : pool;
  const weights = candidates.map(w => Math.max(1, getWeight(w, false)));
  const total = weights.reduce((a,b) => a+b, 0);
  let r = Math.random() * total;
  for (let i = 0; i < candidates.length; i++) { r -= weights[i]; if (r <= 0) return candidates[i]; }
  return candidates[candidates.length - 1];
}
function pickNextRefresh() {
  if (!activeWords.length) return null;
  const never = activeWords.filter(w => !getWS(w.deckId, w.idx).lastAnsweredAt);
  const answered = activeWords
    .filter(w => getWS(w.deckId, w.idx).lastAnsweredAt)
    .sort((a, b) => getWS(a.deckId, a.idx).lastAnsweredAt - getWS(b.deckId, b.idx).lastAnsweredAt);
  const ordered = [...never, ...answered];
  const candidates = ordered.length > 1 && currentWord
    ? ordered.filter(w => !(w.deckId === currentWord.deckId && w.idx === currentWord.idx))
    : ordered;
  return candidates[0] || null;
}
// ── ANKI HELPERS ─────────────────────────────
function todayISO() {
  return new Date().toLocaleDateString('en-CA');
}
function daysBetween(a, b) {
  return Math.round((new Date(b) - new Date(a)) / (1000 * 60 * 60 * 24));
}
function addDays(date, n) {
  const d = new Date(date);
  d.setDate(d.getDate() + n);
  return d.toISOString().slice(0, 10);
}

// ── SM-2 ALGORITHM ────────────────────────────
// rating: 0=Again, 1=Hard, 2=Good, 3=Easy
function sm2(anki, rating) {
  const today = todayISO();
  let { interval, easeFactor, phase, learningStep, lapses } = anki;

  if (phase === "new" || phase === "learning") {
    phase = "learning"; // mark as seen immediately
    if (rating === 0) {
      // Again: full reset, re-insert in session
      learningStep = 0;
      interval = 1;
    } else if (rating === 1) {
      // Hard: stay on current step, ease penalty
      easeFactor = Math.max(1.3, easeFactor - 0.15);
      interval = 1;
    } else if (rating === 2) {
      // Good: advance step, graduate at step 2
      learningStep++;
      if (learningStep >= 2) {
        phase = "review";
        interval = 1;
        learningStep = 0;
      }
    } else {
      // Easy: graduate immediately with bonus interval
      phase = "review";
      interval = 4;
      easeFactor = Math.min(2.5, easeFactor + 0.15);
      learningStep = 0;
    }
  } else {
    // Review phase
    const daysSinceDue = anki.dueDate ? daysBetween(anki.dueDate, today) : 0;
    // Overdue correction: cap effective interval to avoid inflation
    const effectiveInterval = daysSinceDue > 1
      ? Math.min(anki.interval, daysSinceDue)
      : anki.interval;

    if (rating === 0) {
      // Again: lapse — back to learning, ease penalty
      lapses++;
      phase = "learning";
      learningStep = 0;
      interval = 1;
      easeFactor = Math.max(1.3, easeFactor - 0.2);
    } else if (rating === 1) {
      // Hard: slow growth, ease penalty
      interval = Math.max(1, Math.round(effectiveInterval * 1.2));
      easeFactor = Math.max(1.3, easeFactor - 0.15);
    } else if (rating === 2) {
      // Good: standard SM-2
      interval = Math.max(1, Math.round(effectiveInterval * easeFactor));
    } else {
      // Easy: accelerated growth + ease boost
      interval = Math.max(1, Math.round(effectiveInterval * easeFactor * 1.3));
      easeFactor = Math.min(2.5, easeFactor + 0.15);
    }
  }

  const dueDate = addDays(today, interval);
  return { interval, easeFactor, phase, learningStep, lapses, dueDate };
}
// ── ANKI STATE ────────────────────────────────
let ankiQueue = [];
let ankiIndex = 0;
let ankiShowingAnswer = false;
let ankiSessionStats = { again:0, hard:0, good:0, easy:0 };

// ── ANKI QUEUE BUILDER ────────────────────────
function buildAnkiQueue() {
  const today = todayISO();
  let newCards = [], learningCards = [], reviewCards = [];

  selectedIds.forEach(id => {
    const deck = getDeck(id);
    if (!deck) return;
    deck.words.forEach((w, i) => {
      const ws = getWS(id, i);
      if (!ws.anki) ws.anki = { phase:"new", interval:0, easeFactor:2.5, dueDate:null, learningStep:0, lapses:0 };
      const a = ws.anki;
      const word = { ...w, deckId: id, deckName: deck.name, idx: i };
      if (a.phase === "new" && !a.dueDate) {
        newCards.push(word);
      } else if (a.phase === "learning" && a.dueDate <= today) {
        learningCards.push(word);
      } else if (a.phase === "review" && a.dueDate <= today) {
        reviewCards.push(word);
      }
    });
  });

  const shuffle = arr => arr.sort(() => Math.random() - 0.5);
  shuffle(learningCards);
  shuffle(reviewCards);
  shuffle(newCards);

  // Cap total session size: due/learning cards always included, new cards fill remaining slots up to 20
  const MAX_SESSION = 20;
  const dueCount = learningCards.length + reviewCards.length;
  const newSlots = Math.max(0, MAX_SESSION - dueCount);
  newCards = newCards.slice(0, newSlots);

  return [...learningCards, ...reviewCards, ...newCards];
}

function ankiDueCount() {
  const today = todayISO();
  let due = 0, newCount = 0;
  selectedIds.forEach(id => {
    const deck = getDeck(id);
    if (!deck) return;
    deck.words.forEach((w, i) => {
      const ws = getWS(id, i);
      if (!ws.anki) ws.anki = { phase:"new", interval:0, easeFactor:2.5, dueDate:null, learningStep:0, lapses:0 };
      const a = ws.anki;
      if (a.phase === "new" && !a.dueDate) newCount++;
      else if (a.dueDate <= today) due++;
    });
  });
  return { due, newCount };
}
// ── ANKI SESSION ──────────────────────────────
function startAnki() {
  ankiQueue = buildAnkiQueue();
  if (ankiQueue.length === 0) {
    // Nothing due — redirect to Learn mode
    buildActiveWords();
    if (!activeWords.length) { backToMenu(); return; }
    activeMode = "learn";
    startLearn();
    return;
  }
  ankiIndex = 0;
  ankiShowingAnswer = false;
  ankiSessionStats = { again:0, hard:0, good:0, easy:0 };
  showGameScreen();
  renderAnkiQuestion();
}

function showGameScreen() {
  document.getElementById("main-screen").style.display = "block";
  document.getElementById("groups-container").style.display = "none";
  document.getElementById("start-bar").style.display = "none";
  document.getElementById("exp-bar").style.display = "none";
}

function ankiReveal() {
  ankiShowingAnswer = true;
  const word = ankiQueue[ankiIndex];
  const toSpeak = word.examples && word.examples.length ? word.examples[0][WORD_KEY] : word[WORD_KEY];
  speak(toSpeak);
  renderAnkiAnswer();
}

function ankiRate(rating) {
  const word = ankiQueue[ankiIndex];
  const ws = getWS(word.deckId, word.idx);

  // Apply SM-2
  ws.anki = sm2(ws.anki, rating);

  // Unlock this word for Classic/Focus/Timer if not already unlocked
  // Only extend the boundary sequentially — never jump ahead
  const currentUnlocked = S.unlocked[word.deckId] || 0;
  if (word.idx === currentUnlocked) {
    S.unlocked[word.deckId] = currentUnlocked + 1;
  }

  // Track session stats
  const labels = ["again", "hard", "good", "easy"];
  ankiSessionStats[labels[rating]]++;

  // XP
  const xpMap = [0, 2, 4, 8];
  if (xpMap[rating] > 0) addExp(xpMap[rating]);

  // Again in learning: re-insert 3 cards ahead so user sees it soon
  if (rating === 0) {
    const insertAt = Math.min(ankiIndex + 3, ankiQueue.length);
    ankiQueue.splice(insertAt, 0, { ...word });
  }

  saveState();
  ankiIndex++;

  if (ankiIndex >= ankiQueue.length) {
    renderAnkiSummary();
  } else {
    ankiShowingAnswer = false;
    renderAnkiQuestion();
  }
}

function ankiPreviewInterval(word, rating) {
  const ws = getWS(word.deckId, word.idx);
  const current = ws.anki;
  const result = sm2({ ...current }, rating);

  // Again on learning card: comes back within this session
  if (rating === 0 && (current.phase === "new" || current.phase === "learning")) {
    return "soon";
  }
  // Still in learning after this rating: comes back tomorrow
  if (result.phase === "learning") {
    return "1d";
  }
  // Graduated to review
  const n = result.interval;
  if (n < 30) return `${n}d`;
  if (n < 365) return `${Math.round(n/30)}mo`;
  return `${Math.round(n/365)}yr`;
}
// ── ANKI RENDER ───────────────────────────────
function renderAnkiQuestion() {
  const el = document.getElementById("main-screen");
  const word = ankiQueue[ankiIndex];
  if (!word) { renderAnkiSummary(); return; }
  const ws = getWS(word.deckId, word.idx);
  const a = ws.anki;
  const phaseBadge = a.phase === "review"
    ? `<span class="anki-badge review">review</span>`
    : a.phase === "learning"
      ? `<span class="anki-badge learning">learning</span>`
      : `<span class="anki-badge new">new</span>`;
  const total = ankiQueue.length;
  const pct = total > 0 ? Math.round((ankiIndex / total) * 100) : 0;
  const hasExample = word.examples && word.examples.length;
  const exSentence = hasExample ? word.examples[0][WORD_KEY] : null;

  el.innerHTML = `
    <div class="screen">
      <div class="screen-top">
        <div class="screen-label">🃏 Anki · ${total - ankiIndex} left</div>
        <button class="back-btn" onclick="backToMenu()">← Menu</button>
      </div>
      <div class="anki-progress-wrap">
        <div class="anki-progress-fill" style="width:${pct}%"></div>
      </div>
      <div class="anki-phase-row">${phaseBadge}</div>
      <div class="anki-word-header">
        <div class="anki-word-main">${word[WORD_KEY]}</div>
        ${word.hint ? `<div class="anki-word-hint">${word.hint}</div>` : ""}
      </div>
      ${hasExample
        ? `<div class="anki-example-q">
            <div class="anki-example-sentence">${exSentence}</div>
            <button class="anki-example-play" onclick="speak('${exSentence.replace(/'/g,"\\'")}')">🔊</button>
           </div>`
        : `<div style="text-align:center;padding:1.5rem 0;color:var(--text-2);font-size:16px;">${word.en}</div>`}
      <button class="anki-reveal-btn" onclick="ankiReveal()">Show Answer</button>
      <div class="anki-session-bar">
        <span class="anki-stat again">✗ ${ankiSessionStats.again}</span>
        <span class="anki-stat hard">~ ${ankiSessionStats.hard}</span>
        <span class="anki-stat good">✓ ${ankiSessionStats.good}</span>
        <span class="anki-stat easy">⚡ ${ankiSessionStats.easy}</span>
      </div>
    </div>`;

  setTimeout(() => speak(hasExample ? exSentence : word[WORD_KEY]), 350);
}

function renderAnkiAnswer() {
  const el = document.getElementById("main-screen");
  const word = ankiQueue[ankiIndex];
  if (!word) { renderAnkiSummary(); return; }
  const ws = getWS(word.deckId, word.idx);
  const a = ws.anki;
  const phaseBadge = a.phase === "review"
    ? `<span class="anki-badge review">review</span>`
    : a.phase === "learning"
      ? `<span class="anki-badge learning">learning</span>`
      : `<span class="anki-badge new">new</span>`;
  const total = ankiQueue.length;
  const pct = total > 0 ? Math.round((ankiIndex / total) * 100) : 0;
  const previews = [0,1,2,3].map(r => ankiPreviewInterval(word, r));
  const hasExample = word.examples && word.examples.length;
  const exSentence = hasExample ? word.examples[0][WORD_KEY] : null;
  const exEn = hasExample ? word.examples[0].en : null;

  el.innerHTML = `
    <div class="screen">
      <div class="screen-top">
        <div class="screen-label">🃏 Anki · ${total - ankiIndex} left</div>
        <button class="back-btn" onclick="backToMenu()">← Menu</button>
      </div>
      <div class="anki-progress-wrap">
        <div class="anki-progress-fill" style="width:${pct}%"></div>
      </div>
      <div class="anki-phase-row">${phaseBadge}</div>
      <div class="anki-word-header">
        <div class="anki-word-main">${word[WORD_KEY]}</div>
        ${word.hint ? `<div class="anki-word-hint">${word.hint}</div>` : ""}
      </div>
      ${hasExample
        ? `<div class="anki-example-q">
            <div class="anki-example-sentence">${exSentence}</div>
            <button class="anki-example-play" onclick="speak('${exSentence.replace(/'/g,"\\'")}')">🔊</button>
           </div>
           <div class="anki-answer-en">
             <div class="anki-answer-en-sentence">${exEn}</div>
             <div class="anki-answer-en-word">— ${word.en}</div>
           </div>`
        : `<div class="anki-answer-reveal">
            <div class="anki-answer-word">${word[WORD_KEY]}
              <button class="audio-btn" style="font-size:14px;padding:4px 8px;margin-left:8px;" onclick="speak('${word[WORD_KEY].replace(/'/g,"\\'")}')">🔊</button>
            </div>
            ${word.pl ? `<div style="font-size:13px;color:var(--text-3);margin-top:4px;">plural: ${word.pl}</div>` : ""}
           </div>`}
      <div class="anki-rating-row">
        <button class="anki-rate-btn again" onclick="ankiRate(0)">
          <span class="anki-rate-label">Again</span>
          <span class="anki-rate-interval">${previews[0]}</span>
        </button>
        <button class="anki-rate-btn hard" onclick="ankiRate(1)">
          <span class="anki-rate-label">Hard</span>
          <span class="anki-rate-interval">${previews[1]}</span>
        </button>
        <button class="anki-rate-btn good" onclick="ankiRate(2)">
          <span class="anki-rate-label">Good</span>
          <span class="anki-rate-interval">${previews[2]}</span>
        </button>
        <button class="anki-rate-btn easy" onclick="ankiRate(3)">
          <span class="anki-rate-label">Easy</span>
          <span class="anki-rate-interval">${previews[3]}</span>
        </button>
      </div>
      <div class="anki-session-bar">
        <span class="anki-stat again">✗ ${ankiSessionStats.again}</span>
        <span class="anki-stat hard">~ ${ankiSessionStats.hard}</span>
        <span class="anki-stat good">✓ ${ankiSessionStats.good}</span>
        <span class="anki-stat easy">⚡ ${ankiSessionStats.easy}</span>
      </div>
    </div>`;
}

function renderAnkiSummary() {
  const today = todayISO();
  // Find next due date across all selected decks
  let nextDue = null, nextCount = 0;
  selectedIds.forEach(id => {
    const deck = getDeck(id);
    if (!deck) return;
    unlockedWords(deck).forEach((w, i) => {
      const ws = getWS(id, i);
      if (!ws.anki || !ws.anki.dueDate) return;
      if (ws.anki.dueDate > today) {
        if (!nextDue || ws.anki.dueDate < nextDue) nextDue = ws.anki.dueDate;
      }
    });
  });
  if (nextDue) {
    selectedIds.forEach(id => {
      const deck = getDeck(id);
      if (!deck) return;
      unlockedWords(deck).forEach((w, i) => {
        const ws = getWS(id, i);
        if (ws.anki && ws.anki.dueDate === nextDue) nextCount++;
      });
    });
  }
  const nextDueLabel = nextDue
    ? `Next review: ${daysBetween(today, nextDue) === 1 ? "tomorrow" : `in ${daysBetween(today, nextDue)} days`} · ${nextCount} card${nextCount !== 1 ? "s" : ""}`
    : "No upcoming reviews scheduled yet.";

  // Bonus XP for completing session
  addExp(25);

  document.getElementById("main-screen").innerHTML = `
    <div class="screen">
      <div class="result-screen">
        <div class="result-emoji">🎉</div>
        <div class="result-title">Session complete!</div>
        <div class="anki-summary-stats">
          <span class="anki-stat again">✗ Again: ${ankiSessionStats.again}</span>
          <span class="anki-stat hard">~ Hard: ${ankiSessionStats.hard}</span>
          <span class="anki-stat good">✓ Good: ${ankiSessionStats.good}</span>
          <span class="anki-stat easy">⚡ Easy: ${ankiSessionStats.easy}</span>
        </div>
        <div style="font-size:13px;color:#888;margin-top:1rem;">${nextDueLabel}</div>
        <div style="font-size:13px;color:#1D9E75;font-weight:600;margin-top:8px;">+25 XP session bonus</div>
        <button class="result-btn" onclick="backToMenu()">← Back to menu</button>
      </div>
    </div>`;
}

// ── DECK HELPERS ──────────────────────────────
function getDeck(deckId) {
  for (const g of ALL_GROUPS) for (const d of g.decks) if (d.id === deckId) return d;
  return null;
}
function deckProgress(deck) {
  const words = unlockedWords(deck);
  const mastered = words.filter((_,i) => isMastered(getWS(deck.id, i))).length;
  const masteryPlus = words.filter((_,i) => isMasteryPlus(getWS(deck.id, i))).length;
  return { mastered, masteryPlus, total:words.length, all:deck.words.length };
}
function resetDeck(deckId) {
  if (!confirm("Reset all progress for this deck?")) return;
  const deck = getDeck(deckId);
  if (!deck) return;
  deck.words.forEach((_,i) => { delete S.words[deckId + "_" + i]; });
  S.unlocked[deckId] = Math.min(UNLOCK_INITIAL, deck.words.length);
  saveState();
  renderStatsScreen();
  renderGroups();
}
function resetAll() {
  if (!confirm("Reset ALL progress across every deck? This cannot be undone.")) return;
  S.words = {}; S.exp = 0; S.badges = []; S.unlocked = {};
  S.loginDates = []; S.totalCorrect = 0; S.lastLoginDate = "";
  saveState();
  renderExpBar();
  renderGroups();
  renderStatsScreen();
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

// ── LOGIN STREAK ──────────────────────────────
function recordLogin() {
  const today = new Date().toLocaleDateString('en-CA');
  if (S.lastLoginDate === today) return;
  if (!S.loginDates.includes(today)) S.loginDates.push(today);
  S.lastLoginDate = today;
  const dates = S.loginDates.slice().sort();
  let streak = 1, maxStreak = 1;
  for (let i = 1; i < dates.length; i++) {
    const diff = (new Date(dates[i]) - new Date(dates[i-1])) / (1000*60*60*24);
    if (diff === 1)  { streak++; maxStreak = Math.max(maxStreak, streak); }
    else if (diff>1)   streak = 1;
  }
  if (maxStreak >= 3)  checkBadge("streak_3");
  if (maxStreak >= 7)  checkBadge("streak_7");
  if (maxStreak >= 30) checkBadge("streak_30");
  S.exp += 15;
  // Do NOT stamp savedAt here at init time. If we did, Mac would look
  // "newer" than cloud on page open and reject the load. The next real
  // save (answering a word, etc.) will stamp savedAt correctly via
  // saveState() → saveToCloud(). For now, just persist locally.
  saveLocalOnly();
  renderExpBar();
}

// ── BADGES ────────────────────────────────────
function checkBadge(id) {
  if (S.badges.includes(id)) return;
  let earned = false;
  if (id === "first_correct") earned = S.totalCorrect >= 1;
  if (id === "on_fire")       earned = sessionCorrect >= 10;
  if (id === "sharp")         earned = sessionConsecutive >= 20;
  if (id === "century")       earned = S.totalCorrect >= 100;
  if (id === "mastery_10")    earned = countMastered() >= 10;
  if (id === "mastery_50")    earned = countMastered() >= 50;
  if (id === "speed_demon")   earned = true;
  if (id === "polyglot")      earned = ALL_GROUPS.some(g => g.decks.some(d => getUnlocked(d.id) >= d.words.length));
  if (id === "graduate")      earned = ALL_GROUPS.some(g => g.decks.some(d => {
    const u = getUnlocked(d.id);
    return u > 0 && d.words.slice(0,u).every((_,i) => isMastered(getWS(d.id,i)));
  }));
  if (earned) { S.badges.push(id); addExp(100); saveState(); }
}
function checkAllBadges() {
  ["first_correct","on_fire","sharp","century","mastery_10","mastery_50","polyglot","graduate"].forEach(checkBadge);
}
function countMastered() {
  let n = 0;
  ALL_GROUPS.forEach(g => g.decks.forEach(d => d.words.forEach((_,i) => {
    if (isMastered(getWS(d.id, i))) n++;
  })));
  return n;
}

// ── SOUNDS ────────────────────────────────────
function playSuccess() {
  try {
    const ctx  = new (window.AudioContext || window.webkitAudioContext)();
    const t    = ctx.currentTime;
    const osc  = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain); gain.connect(ctx.destination);
    osc.type = "sine";
    osc.frequency.setValueAtTime(659, t);
    osc.frequency.setValueAtTime(784, t + 0.12);
    gain.gain.setValueAtTime(0.25, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.5);
    osc.start(t); osc.stop(t + 0.5);
  } catch(e) {}
}
function playFailure() {
  try {
    const ctx  = new (window.AudioContext || window.webkitAudioContext)();
    const t    = ctx.currentTime;
    const osc  = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain); gain.connect(ctx.destination);
    osc.type = "sine";
    osc.frequency.setValueAtTime(294, t);
    osc.frequency.linearRampToValueAtTime(261, t + 0.25);
    gain.gain.setValueAtTime(0.2, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.4);
    osc.start(t); osc.stop(t + 0.4);
  } catch(e) {}
}

// ── RENDER GROUPS ─────────────────────────────
function toggleGroup(id) { openGroups.has(id) ? openGroups.delete(id) : openGroups.add(id); renderGroups(); }
function toggleDeck(id)  { selectedIds.has(id) ? selectedIds.delete(id) : selectedIds.add(id); renderGroups(); renderStartBar(); }
function renderGroups() {
  document.getElementById("groups-container").innerHTML = ALL_GROUPS.map(group => {
    const isOpen       = openGroups.has(group.id);
    const totalWords   = group.decks.reduce((s,d) => s + d.words.length, 0);
    const totalMastered = group.decks.reduce((s,d) => s + deckProgress(d).mastered, 0);
    const decksHtml = group.decks.map(deck => {
      const { mastered, masteryPlus, total, all } = deckProgress(deck);
      const pct      = total > 0 ? Math.round((mastered / total) * 100) : 0;
      const sel      = selectedIds.has(deck.id);
      const unlocked = getUnlocked(deck.id);
      return `<div class="folder-card ${sel?"selected":""}" onclick="toggleDeck('${deck.id}')">
        <div class="folder-check">✓</div>
        <div class="folder-icon">${deck.icon}</div>
        <div class="folder-name">${deck.name}</div>
        <div class="folder-meta">${mastered}/${total} mastered</div>
        <div class="folder-unlock">${unlocked}/${all} unlocked</div>
        <div class="progress-bar"><div class="progress-fill" style="width:${pct}%"></div></div>
        <div class="progress-bar" style="margin-top:3px;"><div class="progress-fill" style="background:linear-gradient(90deg,#7C5CBF,#B39DDB);width:${Math.round((masteryPlus/total)*100)||0}%"></div></div>
        <div style="font-size:10px;color:#7C5CBF;margin-top:2px;">${masteryPlus} ⭐</div>
      </div>`;
    }).join("");
    return `<div class="group">
      <div class="group-header" onclick="toggleGroup('${group.id}')">
        <span class="group-icon">${group.icon}</span>
        <span class="group-name">${group.name}</span>
        <span class="group-meta">${group.decks.length} deck${group.decks.length!==1?"s":""} · ${totalWords} words · ${totalMastered} mastered</span>
        <span class="group-chevron ${isOpen?"open":""}">▶</span>
      </div>
      <div class="group-decks ${isOpen?"":"collapsed"}">${decksHtml}</div>
    </div>`;
  }).join("");
}

// ── START BAR ─────────────────────────────────
function renderStartBar() {
  let island = document.getElementById("floating-island");
  if (selectedIds.size === 0) {
    if (island) island.remove();
    const spacer = document.getElementById("island-spacer");
    if (spacer) spacer.remove();
    return;
  }
  if (!island) {
    island = document.createElement("div");
    island.id = "floating-island";
    document.body.appendChild(island);
    let spacer = document.getElementById("island-spacer");
    if (!spacer) {
      spacer = document.createElement("div");
      spacer.id = "island-spacer";
      document.querySelector(".app").appendChild(spacer);
    }
  }
  const modeLabels = { learn:"👁 Learn", drill:"📖 Drill", timer:"⏱ Timer", anki:"🃏 Anki" };
  const { due, newCount } = ankiDueCount();
  const isFocusMode = (activeMode === "drill" && drillSubMode === "focus") || (activeMode === "timer" && timerSubMode === "focus");
  const totalWords = [...selectedIds].reduce((s, id) => {
    const d = getDeck(id);
    if (!d) return s;
    if (isFocusMode) {
      const unmastered = unlockedWords(d).filter((w, i) => !isMastered(getWS(id, i))).length;
      return s + (unmastered > 0 ? unmastered : getUnlocked(id));
    }
    return s + getUnlocked(id);
  }, 0);
  const names = [...selectedIds].map(id => getDeck(id)?.name).filter(Boolean).join(", ");
  const ankiSubtitle = activeMode === "anki"
    ? `<div style="font-size:11px;color:#7C5CBF;font-weight:500;margin-bottom:8px;">${due} due today · ${Math.min(newCount,20)} new available</div>`
    : "";
  island.innerHTML = `
    <div class="fi-summary">
      <span class="fi-count"><strong>${selectedIds.size}</strong> deck${selectedIds.size !== 1 ? "s" : ""} · <strong>${totalWords}</strong> words</span>
      <span class="fi-names">${names}</span>
    </div>
    <div class="fi-modes">
      ${["learn","drill","timer","anki"].map(m =>
        `<button class="fi-pill ${activeMode === m ? "active" : ""}" onclick="setMode('${m}')">${modeLabels[m]}</button>`
      ).join("")}
    </div>
    ${activeMode === "drill" ? `
    <div class="fi-modes" style="margin-top:6px;">
      ${["classic","focus","refresh"].map(s =>
        `<button class="fi-pill ${drillSubMode === s ? "active" : ""}" onclick="setDrillSubMode('${s}')">${s[0].toUpperCase()+s.slice(1)}</button>`
      ).join("")}
      <button class="fi-pill ${voiceEnabled ? "active" : ""}" onclick="toggleVoice()">🎙️ Voice</button>
    </div>` : ""}
    ${activeMode === "timer" ? `
    <div class="fi-modes" style="margin-top:6px;">
      ${["classic","focus"].map(s =>
        `<button class="fi-pill ${timerSubMode === s ? "active" : ""}" onclick="setTimerSubMode('${s}')">${s[0].toUpperCase()+s.slice(1)}</button>`
      ).join("")}
      <button class="fi-pill ${voiceEnabled ? "active" : ""}" onclick="toggleVoice()">🎙️ Voice</button>
    </div>
    <div class="fi-modes" style="margin-top:6px;">
      <span style="font-size:11px;color:var(--text-3);align-self:center;">Words:</span>
      ${[10,25,50].map(n =>
        `<button class="fi-pill ${timerWordCount === n ? "active" : ""}" onclick="setTimerCount(${n})">${n}</button>`
      ).join("")}
    </div>` : ""}
    ${ankiSubtitle}
    <button class="fi-start" onclick="startSession()">Start ▶</button>`;
    requestAnimationFrame(() => {
    const spacer = document.getElementById("island-spacer");
    if (spacer) spacer.style.height = (island.offsetHeight + 32) + "px";
  });
}
function setMode(m)       { activeMode = m; renderStartBar(); }
function toggleVoice()    { voiceEnabled = !voiceEnabled; renderStartBar(); }
function setTimerCount(n) { timerWordCount = n; renderStartBar(); }
function toggleMute() {
  muteEnabled = !muteEnabled;
  localStorage.setItem('gv_mute', muteEnabled);
  const btn = document.getElementById('mute-btn');
  if (btn) btn.textContent = muteEnabled ? '🔇' : '🔊';
}
function setDrillSubMode(s) { drillSubMode = s; renderStartBar(); }
function setTimerSubMode(s) { timerSubMode = s; renderStartBar(); }

// ── BUILD ACTIVE WORDS ────────────────────────
function buildActiveWords() {
  activeWords = [];
  selectedIds.forEach(id => {
    const deck = getDeck(id);
    if (!deck) return;
    unlockedWords(deck).forEach((w,i) => activeWords.push({...w, deckId:id, deckName:deck.name, idx:i}));
  });
}
function buildTimerWords() {
  if (timerSubMode === 'focus') {
    const unmastered = activeWords.filter(w => !isMastered(getWS(w.deckId, w.idx)));
    return unmastered.length ? unmastered : activeWords;
  }
  return activeWords;
}

// ── START SESSION ─────────────────────────────
function startSession() {
  const island = document.getElementById("floating-island");
  if (island) island.remove();
  if (activeMode === "anki") { buildActiveWords(); startAnki(); return; }
  buildActiveWords();
  if (!activeWords.length) return;
  sessionCorrect = 0; sessionConsecutive = 0;
  if (activeMode === "learn")       startLearn();
  else if (activeMode === "timer")  { if (voiceEnabled) startVoiceTimer(); else startTimer(); }
  else                              { if (voiceEnabled) startVoiceSession(); else startDrill(); }
}

// ── SHOW SCREEN ───────────────────────────────
function showScreen(name) {
  document.getElementById("main-screen").style.display = "block";
  document.getElementById("groups-container").style.display = "none";
  document.getElementById("start-bar").style.display = "none";
  document.getElementById("exp-bar").style.display = "none";
  if (name === "stats")       renderStatsChoice();
  else if (name === "badges") renderBadgesScreen();
}
function backToMenu() {
  clearInterval(timerInterval);
  stopVoiceSession();
  const island = document.getElementById("floating-island");
  if (island) island.remove();
  document.getElementById("main-screen").style.display = "none";
  document.getElementById("groups-container").style.display = "block";
  document.getElementById("exp-bar").style.display = "block";
  renderStartBar();
  renderGroups();
  renderExpBar();
}

// ── CLASSIC & FOCUS DRILL ─────────────────────
function startDrill() {
  answered    = false;
  currentWord = drillSubMode === 'refresh' ? pickNextRefresh() : pickNext(drillSubMode === 'focus');
  renderDrill();
  document.getElementById("main-screen").style.display = "block";
  document.getElementById("groups-container").style.display = "none";
  document.getElementById("start-bar").style.display = "none";
  document.getElementById("exp-bar").style.display = "none";
}
function nextDrillWord() { answered = false; currentWord = drillSubMode === 'refresh' ? pickNextRefresh() : pickNext(drillSubMode === 'focus'); renderDrill(); }
function miniStats(ws) {
  return `<div class="mini-stat"><div class="mini-label">correct</div><div class="mini-val">${ws.correct}</div></div>
    <div class="mini-stat"><div class="mini-label">wrong</div><div class="mini-val">${ws.wrong}</div></div>
    <div class="mini-stat"><div class="mini-label">streak</div><div class="mini-val">${ws.displayStreak}</div></div>
    <div class="mini-stat"><div class="mini-label">mastered</div><div class="mini-val">${isMastered(ws)?"✓":"—"}</div></div>`;
}
function renderDrill() {
  const el = document.getElementById("main-screen");
  if (!currentWord) return;
  const ws = getWS(currentWord.deckId, currentWord.idx);
  const badges = [
    isMasteryPlus(ws) ? `<span class="masteryplus-badge">⭐ ${21 - daysBetween(ws.masteryPlusDate, todayISO())}d</span>` :
      isMastered(ws) ? `<span class="mastered-badge">✓ mastered</span>` : "",
    ws.displayStreak > 0 && !isMasteryPlus(ws) ? `<span class="streak-badge">🔥 ${ws.displayStreak}</span>` : ""
  ].join(" ");
  const deckNames   = [...selectedIds].map(id => getDeck(id)?.name).filter(Boolean).join(" + ");
  const focusNotice = drillSubMode === "focus"
    ? `<div class="focus-notice">🎯 Focus mode — mastered words excluded</div>`
    : drillSubMode === "refresh"
      ? `<div class="focus-notice" style="background:rgba(0,201,177,0.08);border-color:rgba(0,201,177,0.25);color:var(--teal);">🔄 Refresh — cycling by time since last answer</div>`
      : "";
  el.innerHTML = `
    <div class="screen">
      <div class="screen-top">
        <div class="screen-label">${deckNames}</div>
        <button class="back-btn" onclick="backToMenu()">← Menu</button>
      </div>
      ${focusNotice}
      <div id="unlock-row-drill"></div>
      <div class="word-display">
        <div class="english-word">${currentWord.en}</div>
        <div class="word-hint">${currentWord.hint} ${badges}</div>
      </div>
      <input type="text" class="german-input" id="german-input" placeholder="type the answer…"
        autocomplete="off" autocorrect="off" autocapitalize="off" spellcheck="false"
        onkeydown="handleDrillKey(event)"/>
      <div class="action-row">
        <button class="check-btn"   onclick="checkDrill()">Check</button>
        <button class="dontknow-btn" onclick="dontKnow()">? Don't know</button>
      </div>
      <div class="feedback" id="feedback"></div>
      <div id="examples-area"></div>
      <div class="stats-row" id="stats-row">${miniStats(ws)}</div>
    </div>`;
  renderUnlockRow("unlock-row-drill");
  focusInput();
}
function renderUnlockRow(containerId) {
  const container = document.getElementById(containerId);
  if (!container) return;
  const rows = [];
  selectedIds.forEach(id => {
    const deck = getDeck(id);
    if (!deck) return;
    const u = getUnlocked(id);
    if (u < deck.words.length) {
      const toUnlock = Math.min(UNLOCK_STEP, deck.words.length - u);
      rows.push(`<div class="unlock-row">
        <div class="unlock-info">🔒 ${deck.name}: ${u} of ${deck.words.length} words unlocked</div>
        <button class="unlock-btn" onclick="unlockMore('${id}')">+ Unlock ${toUnlock} words</button>
      </div>`);
    }
  });
  container.innerHTML = rows.join("");
}
function focusInput() {
  const ids = ["german-input","timer-input"];
  const attempt = ms => setTimeout(() => {
    for (const id of ids) { const i = document.getElementById(id); if (i) { i.focus(); return; } }
  }, ms);
  attempt(0); attempt(100); attempt(300);
}
function handleDrillKey(e) { if (e.key === "Enter") { if (answered) nextDrillWord(); else checkDrill(); } }
function checkDrillMilestone() {
  const today = todayISO();
  if (S.drillMilestonesDate !== today) {
    S.drillMilestonesDate = today;
    S.drillCorrectToday = 0;
    S.drillMilestonesClaimed = [];
  }
  S.drillCorrectToday++;
  const milestone = getDrillMilestone(S.drillCorrectToday);
  if (milestone && !S.drillMilestonesClaimed.includes(milestone.at)) {
    S.drillMilestonesClaimed.push(milestone.at);
    addExp(milestone.xp);
    showMilestoneFlash(`🎯 ${S.drillCorrectToday} correct today! +${milestone.xp} XP`);
  }
}

function showMilestoneFlash(msg) {
  const el = document.createElement("div");
  el.textContent = msg;
  el.style.cssText = `
    position:fixed;top:24px;left:50%;transform:translateX(-50%);
    background:#1D9E75;color:white;padding:10px 20px;border-radius:12px;
    font-size:14px;font-weight:700;z-index:999;
    animation:milestoneIn 0.3s ease,milestoneOut 0.4s ease 2s forwards;
    pointer-events:none;white-space:nowrap;
  `;
  el.id = "milestone-flash";
  const existing = document.getElementById("milestone-flash");
  if (existing) existing.remove();
  document.body.appendChild(el);
  setTimeout(() => el.remove(), 2500);
}
function checkDrill() {
  if (answered) return;
  const input = document.getElementById("german-input");
  if (!input || !currentWord) return;
  if (!input.value.trim()) { dontKnow(); return; }
  answered = true;
  const correct = isCorrect(input.value, currentWord[WORD_KEY]);
  const ws      = getWS(currentWord.deckId, currentWord.idx);
  ws.lastAnsweredAt = Date.now();
  const isNew   = ws.correct === 0 && ws.wrong === 0;
  if (correct) {
    ws.correct++; ws.streak++; ws.displayStreak++;
    sessionCorrect++; sessionConsecutive++;
    S.totalCorrect++;
    if (activeMode === "drill") checkDrillMilestone();
    addExp(isNew ? 10 : 5);
    if (!ws.mastered && isMastered(ws)) {
      ws.mastered = true;
      ws.streak = 0;
      addExp(50);
    } else if (ws.mastered) {
      checkMasteryPlus(ws);
    }
    input.classList.add("correct");
    playSuccess();
    checkAllBadges();
  } else {
    ws.wrong++; ws.streak = 0; ws.displayStreak = 0; sessionConsecutive = 0;
    input.classList.add("wrong");
    playFailure();
  }
  saveState();
  showDrillFeedback(correct, ws);
}
function dontKnow() {
  if (answered) return;
  answered = true;
  const ws    = getWS(currentWord.deckId, currentWord.idx);
  ws.lastAnsweredAt = Date.now();
  ws.wrong++; ws.streak = 0; ws.displayStreak = 0; sessionConsecutive = 0;
  const input = document.getElementById("german-input");
  if (input) { input.value = currentWord[WORD_KEY]; input.classList.add("wrong"); }
  saveState();
  showDrillFeedback(false, ws);
}
function showDrillFeedback(correct, ws) {
  const cls  = correct ? "correct" : "wrong";
  const icon = correct ? "✓" : "✗";
  document.getElementById("feedback").innerHTML = `
    <div class="feedback-left">
      <div class="feedback-text ${cls}">${icon} ${correct?"Correct!":"Answer:"} <strong>${currentWord[WORD_KEY]}</strong></div>
      ${currentWord.pl ? `<div class="plural-text">plural: ${currentWord.pl}</div>` : ""}
    </div>
    <div class="feedback-right">
      <button class="audio-btn" onclick="speak('${currentWord[WORD_KEY].replace(/'/g,"\\'")}')">🔊</button>
      <button class="next-btn"  onclick="nextDrillWord()">Next →</button>
    </div>`;
  speak(currentWord[WORD_KEY]);
  if (currentWord.examples && currentWord.examples.length) {
    document.getElementById("examples-area").innerHTML = `
      <div class="examples-wrap-big">
        <div class="examples-title">Examples</div>
        ${currentWord.examples.map(ex => `
          <div class="example-row-big">
            <div class="example-de">${ex[WORD_KEY]}</div>
            <div class="example-en">${ex.en}</div>
          </div>`).join("")}
      </div>`;
  }
  document.getElementById("stats-row").innerHTML = miniStats(ws);
  const inp = document.getElementById("german-input");
  if (inp) { inp.setAttribute("readonly","true"); inp.removeAttribute("readonly"); inp.focus(); }
}

// ── VOICE MODE ────────────────────────────────
function startVoiceSession() {
  const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
  if (!SR) { alert("Voice not supported. Switching to Classic."); activeMode="drill"; startDrill(); return; }
  if (!navigator.onLine) { alert("No internet. Switching to Classic."); activeMode="drill"; startDrill(); return; }
  voiceSessionRunning = true;
  answered    = false;
  currentWord = drillSubMode === 'refresh' ? pickNextRefresh() : pickNext(drillSubMode === 'focus');
  renderVoiceDrill();
  document.getElementById("main-screen").style.display = "block";
  document.getElementById("groups-container").style.display = "none";
  document.getElementById("start-bar").style.display = "none";
  document.getElementById("exp-bar").style.display = "none";
}

function startVoiceTimer() {
  const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
  if (!SR) { alert("Voice not supported. Switching to typed timer."); voiceEnabled=false; startTimer(); return; }
  if (!navigator.onLine) { alert("No internet. Switching to typed timer."); voiceEnabled=false; startTimer(); return; }
  const words = buildTimerWords();
  timerQueue  = [];
  while (timerQueue.length < timerWordCount) {
    timerQueue.push(...[...words].sort(() => Math.random() - 0.5));
  }
  timerQueue     = timerQueue.slice(0, timerWordCount);
  timerTotal     = Math.round(4.5 * timerQueue.length);
  timerLeft      = timerTotal;
  timerCorrect   = 0; timerWrong = 0; timerWordsDone = 0;
  timerFinished  = false; timerExpEarned = 0; timerPaused = false;
  voiceSessionRunning = true;
  document.getElementById("main-screen").style.display = "block";
  document.getElementById("groups-container").style.display = "none";
  document.getElementById("start-bar").style.display = "none";
  document.getElementById("exp-bar").style.display = "none";
  currentWord = timerQueue[timerWordsDone];
  renderVoiceTimerScreen();
  timerInterval = setInterval(timerTick, 100);
  setTimeout(() => startListening(), 400);
}

function renderVoiceTimerScreen() {
  const el = document.getElementById("main-screen");
  if (!currentWord) return;
  el.innerHTML = `<div class="screen">
    <div class="screen-top">
      <div class="screen-label">⏱ Timer · 🎙️ Voice · ${timerWordCount} words</div>
      <button class="back-btn" onclick="stopVoiceSession();backToMenu()">✕ Quit</button>
    </div>
    <div class="timer-display"><div class="timer-clock" id="timer-clock">${timerLeft.toFixed(1)}s</div></div>
    <div class="timer-bar-wrap"><div class="timer-bar-fill" id="timer-bar-fill" style="width:100%"></div></div>
    <div class="timer-score">✓ <strong id="t-correct">${timerCorrect}</strong> &nbsp; ✗ <strong id="t-wrong">${timerWrong}</strong> &nbsp; left: <strong>${timerQueue.length-timerWordsDone}</strong></div>
    <div class="word-display" id="timer-word-display">
      <div class="english-word">${currentWord.en}</div>
      <div class="word-hint">${currentWord.hint}</div>
    </div>
    <div class="voice-indicator">
      <button class="mic-btn" id="voice-mic-btn" onclick="toggleMic()">🎤</button>
      <div class="voice-status" id="voice-status">Listening…</div>
    </div>
    <div id="unlock-row-voice-timer"></div>
    <div id="timer-feedback" style="min-height:40px;text-align:center;padding-top:4px;"></div>
  </div>`;
}
renderUnlockRow("unlock-row-voice-timer");

function handleVoiceTimerResult(correct, heard, isSkip=false) {
  if (timerFinished) return;
  voiceActive = false;
  clearTimeout(voiceSilenceTimer);
  if (voiceRecognition) { try { voiceRecognition.abort(); } catch(e) {} voiceRecognition = null; }
  const fb = document.getElementById("timer-feedback");
  if (correct) {
    timerCorrect++; playSuccess(); checkDrillMilestone();
    const ws = getWS(currentWord.deckId, currentWord.idx);
    ws.lastAnsweredAt = Date.now();
    ws.correct++; ws.streak++; ws.displayStreak++; S.totalCorrect++;
    if (!ws.mastered && isMastered(ws)) {
      ws.mastered = true;
      ws.streak = 0;
      addExp(50);
    } else if (ws.mastered) {
      checkMasteryPlus(ws);
    }
    saveState();
    timerWordsDone++;
    if (timerWordsDone >= timerQueue.length) { endTimer(true); return; }
    currentWord = timerQueue[timerWordsDone];
    if (fb) fb.innerHTML = `<span style="color:#0F6E56;font-weight:700;">✓ Correct!</span>`;
    document.getElementById("t-correct").textContent = timerCorrect;
    const wordEl = document.getElementById("timer-word-display");
    if (wordEl) wordEl.innerHTML = `<div class="english-word">${currentWord.en}</div><div class="word-hint">${currentWord.hint}</div>`;
    setTimeout(() => { if (!timerFinished && !timerPaused) startListening(); }, 400);
  } else {
    timerWrong++; playFailure();
    const ws = getWS(currentWord.deckId, currentWord.idx);
    ws.wrong++; ws.streak = 0; ws.displayStreak = 0; saveState();
    timerPaused = true; clearInterval(timerInterval);
    const remaining = timerQueue.length - timerWordsDone - 1;
    if (remaining > 0) {
      const insertAt = timerWordsDone + 1 + Math.floor(Math.random() * remaining);
      timerQueue.splice(insertAt, 0, {...currentWord});
    } else { timerQueue.push({...currentWord}); }
    const skippedAnswer = currentWord[WORD_KEY];
    timerWordsDone++;
    const wordEl = document.getElementById("timer-word-display");
    if (wordEl) wordEl.style.opacity = "0.3";
    const typed = heard && !isSkip ? heard : "";
    if (fb) fb.innerHTML = typed
      ? `<span style="color:#993C1D;font-weight:700;font-size:16px;text-decoration:line-through;">${typed}</span> → <span style="color:#993C1D;font-weight:700;font-size:22px;">${skippedAnswer}</span>`
      : `<span style="color:#993C1D;font-weight:700;font-size:22px;">✗ ${skippedAnswer}</span>`;
    document.getElementById("t-wrong").textContent = timerWrong;
    setTimeout(() => {
      if (timerFinished) return;
      timerPaused = false;
      currentWord = timerQueue[timerWordsDone];
      timerInterval = setInterval(timerTick, 100);
      renderVoiceTimerScreen();
      setTimeout(() => startListening(), 400);
    }, 2500);
  }
}

function initVoiceRecognition() {
  const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
  if (!SR) return null;
  const recognition = new SR();
  recognition.lang            = APP_CONFIG.speechLang;
  recognition.continuous      = false;
  recognition.interimResults  = false;
  recognition.maxAlternatives = 3;
  try {
    const SGL = window.SpeechGrammarList || window.webkitSpeechGrammarList;
    if (SGL && currentWord) {
      const grammar = `#JSGF V1.0; grammar answer; public <answer> = ${currentWord[WORD_KEY]};`;
      const list = new SGL();
      list.addFromString(grammar, 1);
      recognition.grammars = list;
    }
  } catch(e) {}

  recognition.onresult = event => {
    clearTimeout(voiceSilenceTimer);
    const results    = Array.from(event.results[0]);
    const best       = results[0];
    const transcript = best.transcript.trim().toLowerCase();
    const confidence = best.confidence;
    const isTV = activeMode === "timer" && voiceEnabled;

    if (VOICE_PARAMS.skipPhrases.some(p => transcript.includes(p))) {
      if (isTV) handleVoiceTimerResult(false, transcript, true);
      else      handleVoiceResult(false, transcript, true);
      return;
    }
    if (VOICE_PARAMS.repeatPhrases.some(p => transcript.includes(p))) {
      speak(currentWord[WORD_KEY]); startListening(); return;
    }
    if (confidence < VOICE_PARAMS.minConfidence && confidence > 0) {
      setVoiceStatus("Didn't catch that — try again"); startListening(); return;
    }
    const anyMatch = results.some(r => voiceIsCorrect(r.transcript.trim().toLowerCase(), currentWord[WORD_KEY]));
    if (isTV) handleVoiceTimerResult(anyMatch, best.transcript.trim());
    else      handleVoiceResult(anyMatch, best.transcript.trim());
  };

  recognition.onerror = event => {
    clearTimeout(voiceSilenceTimer);
    const isTV = activeMode === "timer" && voiceEnabled;
    if (event.error === "no-speech") {
      if (isTV) handleVoiceTimerResult(false, "", true);
      else      handleVoiceResult(false, "", true);
    } else if (event.error === "network") {
      stopVoiceSession();
      alert("Network error. Switching to Classic.");
      activeMode = "drill"; startDrill();
    } else {
      setVoiceStatus("Error: " + event.error + " — tap mic to retry");
      voiceActive = false; updateMicBtn();
    }
  };

  recognition.onend = () => { voiceActive = false; updateMicBtn(); };
  return recognition;
}

function voiceIsCorrect(transcript, answer) {
  const normT = normalize(transcript);
  const normA = normalize(answer);
  if (normT.includes(normA)) return true;
  if (normA.includes(normT) && normT.length > 2) return true;
  return answer.split("/").map(p => normalize(p.trim())).some(p => normT.includes(p));
}

function handleVoiceResult(correct, heard, isSkip=false) {
  if (!voiceSessionRunning) return;
  voiceActive = false;
  clearTimeout(voiceSilenceTimer);
  if (voiceRecognition) { try { voiceRecognition.abort(); } catch(e) {} voiceRecognition = null; }
  const ws    = getWS(currentWord.deckId, currentWord.idx);
  const isNew = ws.correct === 0 && ws.wrong === 0;
  if (correct) {
    ws.correct++; ws.streak++; ws.displayStreak++;
    sessionCorrect++; sessionConsecutive++;
    S.totalCorrect++;
    if (activeMode === "drill") checkDrillMilestone();
    addExp(isNew ? 10 : 5);
    if (!ws.mastered && isMastered(ws)) {
      ws.mastered = true;
      ws.streak = 0;
      addExp(50);
    } else if (ws.mastered) {
      checkMasteryPlus(ws);
    }
    checkAllBadges();
  } else {
    ws.wrong++; ws.streak = 0; ws.displayStreak = 0; sessionConsecutive = 0;
  }
  saveState();
  if (correct) playSuccess(); else playFailure();
  speak(currentWord[WORD_KEY]);
  showVoiceFeedback(correct, heard, isSkip);
  const delay = correct ? VOICE_PARAMS.correctShowTime : VOICE_PARAMS.wrongShowTime;
  setTimeout(() => {
    if (!voiceSessionRunning) return;
    answered    = false;
    currentWord = drillSubMode === 'refresh' ? pickNextRefresh() : pickNext(drillSubMode === 'focus');
    renderVoiceDrill();
    setTimeout(() => startListening(), 400);
  }, delay);
}

function startListening() {
  if (!voiceSessionRunning) return;
  voiceRecognition = initVoiceRecognition();
  if (!voiceRecognition) return;
  voiceActive = true; updateMicBtn();
  setVoiceStatus("Listening… say the answer");
  try { voiceRecognition.start(); } catch(e) { voiceActive = false; updateMicBtn(); }
  clearTimeout(voiceSilenceTimer);
  voiceSilenceTimer = setTimeout(() => {
    if (voiceActive) {
      try { voiceRecognition.abort(); } catch(e) {} voiceRecognition = null;
      const isTV = activeMode === "timer" && voiceEnabled;
      if (isTV) handleVoiceTimerResult(false, "", true);
      else      handleVoiceResult(false, "", true);
    }
  }, VOICE_PARAMS.silenceTimeout);
}

function stopListening() {
  voiceActive = false; clearTimeout(voiceSilenceTimer);
  if (voiceRecognition) { try { voiceRecognition.abort(); } catch(e) {} voiceRecognition = null; }
  updateMicBtn(); setVoiceStatus("Paused — tap mic to resume");
}
function stopVoiceSession() {
  voiceSessionRunning = false; voiceActive = false; clearTimeout(voiceSilenceTimer);
  if (voiceRecognition) { try { voiceRecognition.abort(); } catch(e) {} voiceRecognition = null; }
}
function toggleMic()    { if (voiceActive) stopListening(); else startListening(); }
function updateMicBtn() {
  const btn = document.getElementById("voice-mic-btn");
  if (!btn) return;
  btn.className  = voiceActive ? "mic-btn listening" : "mic-btn";
  btn.textContent = voiceActive ? "🎙️" : "🎤";
}
function setVoiceStatus(msg) { const el = document.getElementById("voice-status"); if (el) el.textContent = msg; }

function showVoiceFeedback(correct, heard, isSkip) {
  const el = document.getElementById("voice-feedback-area");
  if (!el) return;
  const cls      = correct ? "correct" : "wrong";
  const icon     = correct ? "✓" : "✗";
  const heardHtml = heard && !isSkip ? `<div class="voice-feedback-heard">you said: "${heard}"</div>` : "";
  const skipHtml  = isSkip ? `<div class="voice-feedback-heard">skipped</div>` : "";
  el.innerHTML = `<div class="voice-feedback ${cls}">
    <div class="voice-feedback-answer">${icon} ${currentWord[WORD_KEY]}</div>
    ${heardHtml}${skipHtml}
    ${currentWord.pl ? `<div style="font-size:12px;color:#888;margin-top:2px;">plural: ${currentWord.pl}</div>` : ""}
  </div>
  ${currentWord.examples && currentWord.examples.length ? `
    <div class="examples-wrap">
      <div class="examples-title">Example</div>
      <div class="example-row">
        <div class="example-de">${currentWord.examples[0][WORD_KEY]}</div>
        <div class="example-en">${currentWord.examples[0].en}</div>
      </div>
    </div>` : ""}`;
}

function renderVoiceDrill() {
  const el = document.getElementById("main-screen");
  if (!currentWord) return;
  const ws = getWS(currentWord.deckId, currentWord.idx);
  const badges = [
    isMasteryPlus(ws) ? `<span class="masteryplus-badge">⭐ ${21 - daysBetween(ws.masteryPlusDate, todayISO())}d</span>` :
    isMastered(ws) ? `<span class="mastered-badge">✓ mastered</span>` : "",
    ws.displayStreak > 0 && !isMasteryPlus(ws) ? `<span class="streak-badge">🔥 ${ws.displayStreak}</span>` : ""
  ].join(" ");
  const deckNames = [...selectedIds].map(id => getDeck(id)?.name).filter(Boolean).join(" + ");
  el.innerHTML = `
    <div class="screen">
      <div class="screen-top">
        <div class="screen-label">${deckNames} · 🎙️ Voice</div>
        <button class="back-btn" onclick="stopVoiceSession();backToMenu()">← Menu</button>
      </div>
      <div class="word-display">
        <div class="english-word">${currentWord.en}</div>
        <div class="word-hint">${currentWord.hint} ${badges}</div>
      </div>
      <div class="voice-indicator">
        <button class="mic-btn" id="voice-mic-btn" onclick="toggleMic()">🎤</button>
        <div class="voice-status" id="voice-status">Tap the mic to start</div>
      </div>
      <div id="unlock-row-voice"></div>
      <div id="voice-feedback-area"></div>
      <div class="stats-row">${miniStats(ws)}</div>
    </div>`;
}
renderUnlockRow("unlock-row-voice");

// ── LEARN MODE ────────────────────────────────
function startLearn() {
  learnQueue = [...activeWords].sort((a,b) => {
    const wa = getWS(a.deckId, a.idx), wb = getWS(b.deckId, b.idx);
    const newA = wa.correct===0 && wa.wrong===0;
    const newB = wb.correct===0 && wb.wrong===0;
    if (newA && !newB) return -1;
    if (!newA && newB) return 1;
    return (wb.wrong - wb.correct) - (wa.wrong - wa.correct);
  });
  learnIndex = 0;
  document.getElementById("main-screen").style.display = "block";
  document.getElementById("groups-container").style.display = "none";
  document.getElementById("start-bar").style.display = "none";
  document.getElementById("exp-bar").style.display = "none";
  renderLearnCard();
}
function renderLearnCard() {
  const el = document.getElementById("main-screen");
  if (learnIndex >= learnQueue.length) {
    el.innerHTML = `<div class="screen">
      <div class="screen-top"><div class="screen-label">Learning complete</div><button class="back-btn" onclick="backToMenu()">← Menu</button></div>
      <div class="result-screen">
        <div class="result-emoji">🎉</div>
        <div class="result-title">All cards seen!</div>
        <div class="result-sub">Now drill them to lock them in.</div>
        <button class="result-btn" onclick="finishLearnStartDrill()">Start drilling →</button>
      </div></div>`;
    return;
  }
  const w     = learnQueue[learnIndex];
  const total = activeWords.length;
  const seen  = Math.min(learnIndex, total);
  el.innerHTML = `<div class="screen">
    <div class="screen-top">
      <div class="screen-label">Learn · ${seen+1}/${total}</div>
      <button class="back-btn" onclick="backToMenu()">← Menu</button>
    </div>
    <div class="learn-progress">${learnQueue.length - learnIndex} cards left in queue</div>
    <div id="unlock-row-learn"></div>
    <div class="learn-card">
      <div class="learn-en">${w.en}</div>
      <div class="learn-de">${w[WORD_KEY]}</div>
      ${w.pl ? `<div class="learn-hint">plural: ${w.pl}</div>` : ""}
      <div class="learn-hint">${w.hint}</div>
      ${w.examples && w.examples.length ? `<div class="examples-wrap" style="text-align:left;margin-top:12px">
        <div class="examples-title">Examples</div>
        ${w.examples.map(ex=>`<div class="example-row"><div class="example-de">${ex[WORD_KEY]}</div><div class="example-en">${ex.en}</div></div>`).join("")}
      </div>` : ""}
    </div>
    <button class="audio-btn" style="display:block;margin:0 auto 1rem;" onclick="speak('${w[WORD_KEY].replace(/'/g,"\\'")}')">🔊 Listen</button>
    <div class="learn-actions">
      <button class="learn-btn not-yet" onclick="learnNotYet()">Not yet</button>
      <button class="learn-btn got-it"  onclick="learnGotIt()">Got it ✓</button>
    </div>
  </div>`;
  renderUnlockRow("unlock-row-learn");
}
function learnGotIt()  { learnIndex++; addExp(5); saveState(); renderLearnCard(); }
function learnNotYet() {
  const w = learnQueue[learnIndex];
  learnQueue.splice(learnIndex, 1);
  learnQueue.push(w);
  const el = document.getElementById("main-screen");
  const notYetBtn = el.querySelector(".learn-btn.not-yet");
  const gotItBtn  = el.querySelector(".learn-btn.got-it");
  if (notYetBtn) notYetBtn.disabled = true;
  if (gotItBtn)  gotItBtn.disabled  = true;
  const deEl = el.querySelector(".learn-de");
  if (deEl) { deEl.style.color = "#993C1D"; deEl.style.fontSize = "2.2rem"; }
  let banner = document.getElementById("learn-wrong-banner");
  if (!banner) {
    banner = document.createElement("div");
    banner.id = "learn-wrong-banner";
    banner.style.cssText = "background:#fff5f5;border:1px solid #E24B4A;border-radius:8px;padding:10px 14px;text-align:center;margin-bottom:1rem;font-size:20px;font-weight:700;color:#993C1D;";
    const actionsEl = el.querySelector(".learn-actions");
    if (actionsEl) actionsEl.parentNode.insertBefore(banner, actionsEl);
  }
  banner.textContent = `✗ ${w[WORD_KEY]}`;
  setTimeout(() => { renderLearnCard(); }, 0);
}
function finishLearnStartDrill() { activeMode = "drill"; startDrill(); }

// ── TIMER MODE ────────────────────────────────
function startTimer() {
  const words = buildTimerWords();
  timerQueue  = [];
  while (timerQueue.length < timerWordCount) {
    timerQueue.push(...[...words].sort(() => Math.random() - 0.5));
  }
  timerQueue    = timerQueue.slice(0, timerWordCount);
  timerTotal    = Math.round(4.5 * timerQueue.length);
  timerLeft     = timerTotal;
  timerCorrect  = 0; timerWrong = 0; timerWordsDone = 0;
  timerFinished = false; timerExpEarned = 0;
  document.getElementById("main-screen").style.display = "block";
  document.getElementById("groups-container").style.display = "none";
  document.getElementById("start-bar").style.display = "none";
  document.getElementById("exp-bar").style.display = "none";
  currentWord   = timerQueue[timerWordsDone];
  renderTimerScreen();
  timerInterval = setInterval(timerTick, 100);
}
function timerTick() {
  timerLeft = Math.max(0, timerLeft - 0.1);
  updateTimerDisplay();
  if (timerLeft <= 0 && !timerFinished) endTimer(false);
}
function updateTimerDisplay() {
  const clockEl = document.getElementById("timer-clock");
  const barEl   = document.getElementById("timer-bar-fill");
  if (!clockEl || !barEl) return;
  const urgent = timerLeft < 10;
  clockEl.textContent = timerLeft.toFixed(1) + "s";
  clockEl.className   = "timer-clock" + (urgent ? " urgent" : "");
  barEl.style.width   = (timerLeft / timerTotal * 100) + "%";
  barEl.className     = "timer-bar-fill" + (urgent ? " urgent" : "");
}
function renderTimerScreen() {
  const el = document.getElementById("main-screen");
  if (!currentWord) return;
  el.innerHTML = `<div class="screen">
    <div class="screen-top">
      <div class="screen-label">⏱ Timer · ${timerWordCount} words · ${4.5*timerWordCount}s total</div>
      <button class="back-btn" onclick="backToMenu()">✕ Quit</button>
    </div>
    <div class="timer-display"><div class="timer-clock" id="timer-clock">${timerLeft.toFixed(1)}s</div></div>
    <div class="timer-bar-wrap"><div class="timer-bar-fill" id="timer-bar-fill" style="width:100%"></div></div>
    <div class="timer-score">✓ <strong id="t-correct">${timerCorrect}</strong> &nbsp; ✗ <strong id="t-wrong">${timerWrong}</strong> &nbsp; left: <strong>${timerQueue.length-timerWordsDone}</strong></div>
    <div class="word-display" id="timer-word-display">
      <div class="english-word">${currentWord.en}</div>
      <div class="word-hint">${currentWord.hint}</div>
    </div>
    <div id="timer-feedback" style="min-height:44px;font-size:18px;font-weight:700;text-align:center;padding:6px 0 2px;"></div>
    <input type="text" class="german-input" id="timer-input" placeholder="type the answer…"
      autocomplete="off" autocorrect="off" autocapitalize="off" spellcheck="false"
      onkeydown="handleTimerKey(event)"/>
    <div class="action-row">
      <button class="check-btn"    onclick="checkTimer()">Check</button>
      <button class="dontknow-btn" onclick="skipTimer()">Skip</button>
    </div>
  </div>`;
  focusInput();
}
function handleTimerKey(e) { if (e.key === "Enter") checkTimer(); }
function checkTimer() {
  if (timerFinished || timerPaused) return;
  const input = document.getElementById("timer-input");
  if (!input) return;
  const val = input.value;
  if (!val.trim()) { skipTimer(); return; }
  const correct = isCorrect(val, currentWord[WORD_KEY]);
  const fb = document.getElementById("timer-feedback");
  S.totalCorrect += correct ? 1 : 0;
  saveState();
  if (correct) {
    timerCorrect++; playSuccess(); checkDrillMilestone();
    const ws = getWS(currentWord.deckId, currentWord.idx);
    ws.correct++; ws.streak++; ws.displayStreak++;
    if (!ws.mastered && isMastered(ws)) {
      ws.mastered = true;
      ws.streak = 0;
      addExp(50);
    } else if (ws.mastered) {
      checkMasteryPlus(ws);
    }
    saveState();
    timerWordsDone++;
    if (timerWordsDone >= timerQueue.length) { endTimer(true); return; }
    currentWord = timerQueue[timerWordsDone];
    renderTimerScreen();
    const fb2 = document.getElementById("timer-feedback");
    if (fb2) fb2.innerHTML = `<span style="color:#0F6E56;font-weight:600;">✓ Correct!</span>`;
    focusInput();
  } else {
    timerWrong++;
    const ws = getWS(currentWord.deckId, currentWord.idx);
    ws.wrong++; ws.streak = 0; ws.displayStreak = 0; saveState(); playFailure();
    timerPaused = true; clearInterval(timerInterval);
    const remaining = timerQueue.length - timerWordsDone - 1;
    if (remaining > 0) {
      timerQueue.splice(timerWordsDone + 1 + Math.floor(Math.random() * remaining), 0, {...currentWord});
    } else { timerQueue.push({...currentWord}); }
    timerWordsDone++;
    const wordEl = document.getElementById("timer-word-display");
    if (wordEl) wordEl.style.opacity = "0.3";
    if (input) input.value = "";
    const typed = val.trim();
    if (fb) fb.innerHTML = `<span style="color:#993C1D;font-weight:700;font-size:16px;text-decoration:line-through;">${typed}</span><span style="color:#993C1D;font-weight:400;font-size:16px;"> → </span><span style="color:#993C1D;font-weight:700;font-size:22px;">${currentWord[WORD_KEY]}</span>`;
    document.getElementById("t-correct").textContent = timerCorrect;
    document.getElementById("t-wrong").textContent   = timerWrong;
    setTimeout(() => {
      if (timerFinished) return;
      timerPaused = false;
      currentWord = timerQueue[timerWordsDone];
      timerInterval = setInterval(timerTick, 100);
      renderTimerScreen();
    }, 2500);
  }
}
function skipTimer() {
  if (timerFinished || timerPaused) return;
  timerPaused = true; clearInterval(timerInterval);
  timerWrong++;
  const ws = getWS(currentWord.deckId, currentWord.idx);
  ws.wrong++; ws.streak = 0; ws.displayStreak = 0; saveState();
  const skipped   = currentWord;
  const remaining = timerQueue.length - timerWordsDone - 1;
  if (remaining > 0) {
    timerQueue.splice(timerWordsDone + 1 + Math.floor(Math.random() * remaining), 0, {...skipped});
  } else { timerQueue.push({...skipped}); }
  timerWordsDone++;
  const wordEl = document.getElementById("timer-word-display");
  if (wordEl) wordEl.style.opacity = "0.3";
  const input = document.getElementById("timer-input");
  if (input) input.value = "";
  const fb = document.getElementById("timer-feedback");
  if (fb) fb.innerHTML = `<span style="color:#993C1D;font-weight:700;font-size:22px;">✗ ${skipped[WORD_KEY]}</span>`;
  document.getElementById("t-wrong").textContent = timerWrong;
  setTimeout(() => {
    if (timerFinished) return;
    timerPaused = false;
    currentWord = timerQueue[timerWordsDone];
    timerInterval = setInterval(timerTick, 100);
    renderTimerScreen();
  }, 2500);
}
function endTimer(won) {
  timerFinished = true; clearInterval(timerInterval); stopVoiceSession();
  checkBadge("speed_demon");
  const perfBonus = Math.max(0, (timerCorrect - timerWrong) * 6);
  const winBonus = won ? timerWordCount : 0;
  timerExpEarned = perfBonus + winBonus;
  addExp(timerExpEarned);
  document.getElementById("main-screen").innerHTML = `<div class="screen">
    <div class="result-screen">
      <div class="result-emoji">${won?"🏆":"⏰"}</div>
      <div class="result-title">${won?"You won!":"Time's up!"}</div>
      <div class="result-sub">${won?"You answered all words before time ran out!":"Better luck next time."}</div>
      <div>
        <div class="result-stat"><strong>${timerCorrect}</strong>correct</div>
        <div class="result-stat"><strong>${timerWrong}</strong>wrong</div>
        <div class="result-stat"><strong>+${timerExpEarned} XP</strong>earned</div>
      </div>
      <button class="result-btn" onclick="backToMenu()">← Back to menu</button>
    </div></div>`;
}

// ── STATS SCREEN ──────────────────────────────
function renderStatsScreen() {
  let html = `<div class="screen">
    <div class="screen-top"><div class="screen-label">Progress</div><button class="back-btn" onclick="renderStatsChoice()">← Back</button></div>
    <div style="text-align:right;margin-bottom:1rem;">
      <button onclick="resetAll()" style="font-size:12px;padding:5px 12px;border:1px solid #E24B4A;border-radius:6px;background:white;color:#E24B4A;cursor:pointer;">Reset all progress</button>
    </div>`;
  ALL_GROUPS.forEach(group => {
    html += `<div class="stats-section"><div class="stats-section-title">${group.icon} ${group.name}</div>`;
    group.decks.forEach(deck => {
      const { mastered, masteryPlus, total, all } = deckProgress(deck);
      const pct = total > 0 ? Math.round((mastered / total) * 100) : 0;
      const deckKey = `stats-deck-${deck.id}`;
      html += `
        <div style="margin-bottom:0.75rem;border:1px solid #eee;border-radius:10px;overflow:hidden;">
          <div onclick="toggleStatsDeck('${deck.id}')" style="display:flex;align-items:center;justify-content:space-between;padding:10px 12px;cursor:pointer;background:#fafafa;user-select:none;">
            <div style="display:flex;align-items:center;gap:10px;flex:1;">
              <span style="font-size:14px;">${deck.icon}</span>
              <div>
                <div style="font-size:13px;font-weight:600;">${deck.name}</div>
                <div style="font-size:11px;color:#888;margin-top:2px;">${mastered}/${total} mastered · ${masteryPlus} ⭐ · ${pct}% · ${all} total</div>
              </div>
            </div>
            <div style="display:flex;align-items:center;gap:8px;">
              <button onclick="event.stopPropagation();resetDeck('${deck.id}')" style="font-size:11px;padding:3px 8px;border:1px solid #ddd;border-radius:6px;background:white;color:#888;cursor:pointer;">Reset</button>
              <span id="chevron-${deck.id}" style="font-size:11px;color:#aaa;transition:transform 0.2s;display:inline-block;">▶</span>
            </div>
          </div>
          <div id="${deckKey}" style="display:none;">
            <div class="stats-table-wrap"><table style="margin:0;border-radius:0;">
              <thead><tr><th>English</th><th>Target</th><th>Plural</th><th>✓</th><th>✗</th><th>Streak</th></tr></thead>
              <tbody>`;
      unlockedWords(deck).forEach((w,i) => {
        const ws = getWS(deck.id, i);
        const st = isMasteryPlus(ws)
          ? `<span class="masteryplus-badge">⭐ ${21 - daysBetween(ws.masteryPlusDate, todayISO())}d</span>`
          : isMastered(ws)
            ? `<span class="mastered-badge">✓</span>`
            : ws.displayStreak > 0
              ? `<span class="streak-badge">${ws.displayStreak}</span>`
              : `<span style="color:#bbb">new</span>`;
        html += `<tr><td>${w.en}</td><td style="color:#555">${w[WORD_KEY]}</td><td style="color:#aaa">${w.pl||"—"}</td><td>${ws.correct}</td><td>${ws.wrong}</td><td>${st}</td></tr>`;
      });
      html += `</tbody></table></div></div></div>`;
    });
    html += `</div>`;
  });
  html += `</div>`;
  document.getElementById("main-screen").innerHTML = html;
}

function toggleStatsDeck(deckId) {
  const el = document.getElementById(`stats-deck-${deckId}`);
  const chevron = document.getElementById(`chevron-${deckId}`);
  if (!el) return;
  const isOpen = el.style.display !== "none";
  el.style.display = isOpen ? "none" : "block";
  if (chevron) chevron.style.transform = isOpen ? "" : "rotate(90deg)";
}
// ── STATS CHOICE ──────────────────────────────
function renderStatsChoice() {
  document.getElementById("main-screen").innerHTML = `
    <div class="screen">
      <div class="screen-top">
        <div class="screen-label">Statistics</div>
        <button class="back-btn" onclick="backToMenu()">← Back</button>
      </div>
      <div class="stats-choice-row">
        <button class="stats-choice-btn" onclick="renderStatsScreen()">
          <div class="stats-choice-icon">📖</div>
          <div class="stats-choice-label">Classic Stats</div>
          <div class="stats-choice-sub">Mastery · streaks · correct/wrong</div>
        </button>
        <button class="stats-choice-btn" onclick="renderAnkiStatsScreen()">
          <div class="stats-choice-icon">🃏</div>
          <div class="stats-choice-label">Anki Stats</div>
          <div class="stats-choice-sub">Intervals · due dates · phases</div>
        </button>
      </div>
    </div>`;
}

// ── ANKI STATS SCREEN ─────────────────────────
function renderAnkiStatsScreen() {
  const today = todayISO();

  // Build upcoming due chart data (next 7 days)
  const dueBuckets = {};
  for (let i = 1; i <= 7; i++) {
    dueBuckets[addDays(today, i)] = 0;
  }
  let totalNew = 0, totalLearning = 0, totalReview = 0, totalOverdue = 0;

  ALL_GROUPS.forEach(g => g.decks.forEach(d => {
    unlockedWords(d).forEach((w, i) => {
      const ws = getWS(d.id, i);
      if (!ws.anki) return;
      const a = ws.anki;
      if (a.phase === "new" && !a.dueDate) { totalNew++; return; }
      if (a.phase === "learning") totalLearning++;
      else if (a.phase === "review") totalReview++;
      if (a.dueDate && a.dueDate <= today) { totalOverdue++; return; }
      if (a.dueDate && dueBuckets[a.dueDate] !== undefined) dueBuckets[a.dueDate]++;
    });
  }));

  const maxBucket = Math.max(...Object.values(dueBuckets), 1);
  const chartBars = Object.entries(dueBuckets).map(([date, count]) => {
    const pct = Math.round((count / maxBucket) * 100);
    const label = daysBetween(today, date) === 1 ? "tmr" : `+${daysBetween(today, date)}d`;
    return `<div class="anki-chart-col">
      <div class="anki-chart-bar-wrap">
        <div class="anki-chart-bar" style="height:${pct}%"></div>
      </div>
      <div class="anki-chart-count">${count}</div>
      <div class="anki-chart-label">${label}</div>
    </div>`;
  }).join("");

  // Per-deck table
  let deckRows = "";
  ALL_GROUPS.forEach(g => g.decks.forEach(d => {
    let dNew = 0, dLearning = 0, dReview = 0, dDue = 0;
    unlockedWords(d).forEach((w, i) => {
      const ws = getWS(d.id, i);
      if (!ws.anki) return;
      const a = ws.anki;
      if (a.phase === "new" && !a.dueDate) dNew++;
      else if (a.phase === "learning") dLearning++;
      else if (a.phase === "review") dReview++;
      if (a.dueDate && a.dueDate <= today) dDue++;
    });
    deckRows += `<tr>
      <td>${d.icon} ${d.name}</td>
      <td><span class="anki-badge new">${dNew}</span></td>
      <td><span class="anki-badge learning">${dLearning}</span></td>
      <td><span class="anki-badge review">${dReview}</span></td>
      <td style="font-weight:600;color:${dDue>0?"#c62828":"#888"}">${dDue}</td>
    </tr>`;
  }));

  // Per-word detail (all reviewed words only — skip pure new)
  let wordRows = "";
  ALL_GROUPS.forEach(g => g.decks.forEach(d => {
    unlockedWords(d).forEach((w, i) => {
      const ws = getWS(d.id, i);
      if (!ws.anki || ws.anki.phase === "new") return;
      const a = ws.anki;
      const phaseBadge = a.phase === "review"
        ? `<span class="anki-badge review">review</span>`
        : `<span class="anki-badge learning">learning</span>`;
      const dueLabel = !a.dueDate ? "—"
        : a.dueDate <= today ? `<span style="color:#c62828;font-weight:600;">overdue</span>`
        : daysBetween(today, a.dueDate) === 1 ? "tomorrow"
        : `in ${daysBetween(today, a.dueDate)}d`;
      wordRows += `<tr>
        <td>${w.en}</td>
        <td style="color:#555">${w[WORD_KEY]}</td>
        <td>${phaseBadge}</td>
        <td>${a.interval}d</td>
        <td>${dueLabel}</td>
        <td>${a.lapses}</td>
      </tr>`;
    });
  }));

  document.getElementById("main-screen").innerHTML = `
    <div class="screen">
      <div class="screen-top">
        <div class="screen-label">🃏 Anki Stats</div>
        <button class="back-btn" onclick="renderStatsChoice()">← Back</button>
      </div>
      <div style="text-align:right;margin-bottom:1rem;">
        <button onclick="resetAnkiProgress()" style="font-size:12px;padding:5px 12px;border:1px solid #7C5CBF;border-radius:6px;background:white;color:#7C5CBF;cursor:pointer;">Reset Anki progress</button>
      </div>
      <div class="anki-stats-summary">
        <div class="anki-stats-pill new">📦 ${totalNew} new</div>
        <div class="anki-stats-pill learning">🔄 ${totalLearning} learning</div>
        <div class="anki-stats-pill review">✅ ${totalReview} review</div>
        <div class="anki-stats-pill overdue">🔴 ${totalOverdue} due</div>
      </div>
      <div class="anki-chart-title">Due in the next 7 days</div>
      <div class="anki-chart">${chartBars}</div>
      <div class="stats-section-title" style="margin-top:1.5rem;">By deck</div>
      <table>
        <thead><tr><th>Deck</th><th>New</th><th>Learning</th><th>Review</th><th>Due</th></tr></thead>
        <tbody>${deckRows}</tbody>
      </table>
      ${wordRows ? `
      <div class="stats-section-title" style="margin-top:1.5rem;">Word detail</div>
      <table>
        <thead><tr><th>English</th><th>Target</th><th>Phase</th><th>Interval</th><th>Due</th><th>Lapses</th></tr></thead>
        <tbody>${wordRows}</tbody>
      </table>` : `<div style="text-align:center;color:#aaa;margin-top:2rem;font-size:13px;">No Anki reviews yet — start a session first.</div>`}
    </div>`;
}
function resetAnkiProgress() {
  if (!confirm("Reset all Anki progress? SM-2 intervals and phases will be cleared. Classic progress is untouched.")) return;
  Object.keys(S.words).forEach(key => {
    S.words[key].anki = {
      phase: "new",
      interval: 0,
      easeFactor: 2.5,
      dueDate: null,
      learningStep: 0,
      lapses: 0,
    };
  });
  saveState();
  renderAnkiStatsScreen();
}
// ── BADGES SCREEN ─────────────────────────────
function renderBadgesScreen() {
  document.getElementById("main-screen").innerHTML = `<div class="screen">
    <div class="screen-top"><div class="screen-label">Badges</div><button class="back-btn" onclick="backToMenu()">← Back</button></div>
    <div class="badges-grid">
      ${BADGE_DEFS.map(b => {
        const earned = S.badges.includes(b.id);
        return `<div class="badge-card ${earned?"earned":"locked"}">
          <div class="badge-icon">${b.icon}</div>
          <div class="badge-name">${b.name}</div>
          <div class="badge-desc">${b.desc}</div>
        </div>`;
      }).join("")}
    </div>
  </div>`;
}

// ── INIT ──────────────────────────────────────
document.querySelector("h1").textContent = APP_CONFIG.title;
migrate();
initVoice();
recordLogin();
renderExpBar();
renderGroups();
const muteBtn = document.getElementById('mute-btn');
if (muteBtn) muteBtn.textContent = muteEnabled ? '🔇' : '🔊';
