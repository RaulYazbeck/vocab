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

const EXP_BASE = 100, EXP_RATIO = 1.4;
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

// ── STATE ─────────────────────────────────────
let S = loadState();
let selectedIds = new Set();
let openGroups  = new Set();
let activeMode  = "classic";
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
  return { words:{}, exp:0, badges:[], unlocked:{}, loginDates:[], totalCorrect:0, lastLoginDate:"" };
}
function saveState() {
  try { localStorage.setItem(STORAGE_KEY, JSON.stringify(S)); } catch(e) {}
  saveToCloud();
}
function migrate() {
  if (!S.words)         S.words = {};
  if (!S.exp)           S.exp = 0;
  if (!S.badges)        S.badges = [];
  if (!S.unlocked)      S.unlocked = {};
  if (!S.loginDates)    S.loginDates = [];
  if (!S.totalCorrect)  S.totalCorrect = 0;
  if (!S.lastLoginDate) S.lastLoginDate = "";
}

// ── FIREBASE AUTH & SYNC ──────────────────────
let currentUser = null;
let syncTimeout = null;

auth.onAuthStateChanged(user => {
  currentUser = user;
  const btn    = document.getElementById("auth-btn");
  const status = document.getElementById("sync-status");
  if (user) {
    if (btn)    btn.textContent = user.displayName?.split(" ")[0] || "Signed in";
    if (status) status.textContent = "☁️ Syncing...";
    loadFromCloud();
  } else {
    if (btn)    btn.textContent = "Sign in";
    if (status) status.textContent = "";
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

function loadFromCloud() {
  if (!currentUser) return;
  const status = document.getElementById("sync-status");
  db.collection("users").doc(currentUser.uid)
    .collection("apps").doc(STORAGE_KEY)
    .get().then(doc => {
      if (doc.exists) {
        const cloud = doc.data();
        if (cloud.exp && cloud.exp > S.exp) {
          S = { ...S, ...cloud };
          migrate();
          saveState();
          renderExpBar();
          renderGroups();
        }
      }
      if (status) status.textContent = "☁️ Synced";
      setTimeout(() => { if (status) status.textContent = ""; }, 3000);
    }).catch(e => {
      if (status) status.textContent = "☁️ Sync failed";
      console.error(e);
    });
}

function saveToCloud() {
  if (!currentUser) return;
  clearTimeout(syncTimeout);
  syncTimeout = setTimeout(() => {
    db.collection("users").doc(currentUser.uid)
      .collection("apps").doc(STORAGE_KEY)
      .set(S).then(() => {
        const status = document.getElementById("sync-status");
        if (status) {
          status.textContent = "☁️ Saved";
          setTimeout(() => { status.textContent = ""; }, 2000);
        }
      }).catch(e => console.error("Cloud save failed:", e));
  }, 1500);
}

// ── VOICE (TTS) ───────────────────────────────
function initVoice() {
  if (!window.speechSynthesis) return;
  const load = () => {
    const v = speechSynthesis.getVoices();
    const lang = APP_CONFIG.speechLang;
    targetVoice = v.find(x => x.lang === lang) || v.find(x => x.lang.startsWith(lang.slice(0,2))) || null;
  };
  load();
  speechSynthesis.onvoiceschanged = load;
}
function speak(text) {
  if (!window.speechSynthesis) return;
  speechSynthesis.cancel();
  const u = new SpeechSynthesisUtterance(text);
  u.lang = APP_CONFIG.speechLang;
  u.rate = 0.85;
  if (targetVoice) u.voice = targetVoice;
  speechSynthesis.speak(u);
}

// ── ANSWER CHECK ──────────────────────────────
function stripAccents(s) { return s.normalize("NFD").replace(/[̀-ͯ]/g,""); }
function normalizeChars(s) { return s.replace(/['\-]/g, " ").replace(/\s+/g, " "); }
function normalize(s) { return normalizeChars(stripAccents(s.trim().toLowerCase())); }
function isCorrect(input, answer) {
  if (!input.trim()) return false;
  const ni = normalize(input);
  return answer.split("/").map(p => normalize(p.trim())).some(p => p.length > 0 && ni.includes(p));
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
  const dates = [...new Set(S.loginDates)].sort();
  if (!dates.length) return 0;
  let streak = 1;
  const today = new Date().toISOString().slice(0,10);
  const last  = dates[dates.length - 1];
  if (last !== today) {
    const diff = (new Date(today) - new Date(last)) / (1000*60*60*24);
    if (diff > 1) return 0;
  }
  for (let i = dates.length - 1; i > 0; i--) {
    const diff = (new Date(dates[i]) - new Date(dates[i-1])) / (1000*60*60*24);
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
  if (!S.words[key]) S.words[key] = { correct:0, wrong:0, streak:0 };
  return S.words[key];
}
function getWeight(w, focusMode=false) {
  const ws = getWS(w.deckId, w.idx);
  if (focusMode) {
    if (ws.streak >= 5) return 0;
    if (ws.wrong > ws.correct && ws.wrong > 0) return 10 + ws.wrong * 3;
    return 5;
  }
  if (ws.streak >= 5) return Math.max(1, 8 - ws.streak);
  if (ws.wrong > ws.correct && ws.wrong > 0) return 10 + ws.wrong * 2;
  return 5;
}
function pickNext(focusMode=false) {
  let pool = focusMode
    ? activeWords.filter(w => getWS(w.deckId, w.idx).streak < 5)
    : activeWords;
  if (!pool.length) pool = activeWords;
  if (!pool.length) return null;
  const filtered = pool.length > 1 && currentWord
    ? pool.filter(w => !(w.deckId === currentWord.deckId && w.idx === currentWord.idx))
    : pool;
  const candidates = filtered.length ? filtered : pool;
  const weights = candidates.map(w => Math.max(focusMode ? 0 : 1, getWeight(w, focusMode)));
  const total   = weights.reduce((a,b) => a+b, 0);
  if (total === 0) return candidates[Math.floor(Math.random() * candidates.length)];
  let r = Math.random() * total;
  for (let i = 0; i < candidates.length; i++) { r -= weights[i]; if (r <= 0) return candidates[i]; }
  return candidates[candidates.length - 1];
}

// ── DECK HELPERS ──────────────────────────────
function getDeck(deckId) {
  for (const g of ALL_GROUPS) for (const d of g.decks) if (d.id === deckId) return d;
  return null;
}
function deckProgress(deck) {
  const words   = unlockedWords(deck);
  const mastered = words.filter((_,i) => getWS(deck.id, i).streak >= 5).length;
  return { mastered, total:words.length, all:deck.words.length };
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

// ── LOGIN STREAK ──────────────────────────────
function recordLogin() {
  const today = new Date().toISOString().slice(0,10);
  if (S.lastLoginDate === today) return;
  S.loginDates.push(today);
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
  addExp(15);
  saveState();
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
    return u > 0 && d.words.slice(0,u).every((_,i) => getWS(d.id,i).streak >= 5);
  }));
  if (earned) { S.badges.push(id); addExp(100); saveState(); }
}
function checkAllBadges() {
  ["first_correct","on_fire","sharp","century","mastery_10","mastery_50","polyglot","graduate"].forEach(checkBadge);
}
function countMastered() {
  let n = 0;
  ALL_GROUPS.forEach(g => g.decks.forEach(d => d.words.forEach((_,i) => {
    if (getWS(d.id, i).streak >= 5) n++;
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
      const { mastered, total, all } = deckProgress(deck);
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
  const totalWords = [...selectedIds].reduce((s, id) => {
    const d = getDeck(id); return s + (d ? getUnlocked(id) : 0);
  }, 0);
  const names = [...selectedIds].map(id => getDeck(id)?.name).filter(Boolean).join(", ");
  const modeLabels = { learn:"👁 Learn", classic:"📖 Classic", focus:"🎯 Focus", timer:"⏱ Timer" };
  island.innerHTML = `
    <div class="fi-summary">
      <span class="fi-count"><strong>${selectedIds.size}</strong> deck${selectedIds.size !== 1 ? "s" : ""} · <strong>${totalWords}</strong> words</span>
      <span class="fi-names">${names}</span>
    </div>
    <div class="fi-modes">
      ${["learn","classic","focus","timer"].map(m =>
        `<button class="fi-pill ${activeMode === m ? "active" : ""}" onclick="setMode('${m}')">${modeLabels[m]}</button>`
      ).join("")}
      ${activeMode !== "learn" ? `<button class="fi-pill ${voiceEnabled ? "active" : ""}" onclick="toggleVoice()">🎙️ Voice</button>` : ""}
    </div>
    ${activeMode === "timer" ? `
    <div class="fi-modes" style="margin-top:6px;">
      <span style="font-size:11px;color:#888;align-self:center;">Words:</span>
      ${[10,25,50].map(n =>
        `<button class="fi-pill ${timerWordCount === n ? "active" : ""}" onclick="setTimerCount(${n})">${n}</button>`
      ).join("")}
    </div>` : ""}
    <button class="fi-start" onclick="startSession()">Start ▶</button>`;
    requestAnimationFrame(() => {
    const spacer = document.getElementById("island-spacer");
    if (spacer) spacer.style.height = (island.offsetHeight + 32) + "px";
  });
}
function setMode(m)       { activeMode = m; renderStartBar(); }
function toggleVoice()    { voiceEnabled = !voiceEnabled; renderStartBar(); }
function setTimerCount(n) { timerWordCount = n; renderStartBar(); }

// ── BUILD ACTIVE WORDS ────────────────────────
function buildActiveWords() {
  activeWords = [];
  selectedIds.forEach(id => {
    const deck = getDeck(id);
    if (!deck) return;
    unlockedWords(deck).forEach((w,i) => activeWords.push({...w, deckId:id, deckName:deck.name, idx:i}));
  });
}

// ── START SESSION ─────────────────────────────
function startSession() {
  buildActiveWords();
  if (!activeWords.length) return;
  const island = document.getElementById("floating-island");
  if (island) island.remove();
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
  if (name === "stats")   renderStatsScreen();
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
  currentWord = pickNext(activeMode === "focus");
  renderDrill();
  document.getElementById("main-screen").style.display = "block";
  document.getElementById("groups-container").style.display = "none";
  document.getElementById("start-bar").style.display = "none";
  document.getElementById("exp-bar").style.display = "none";
}
function nextDrillWord() { answered = false; currentWord = pickNext(activeMode === "focus"); renderDrill(); }
function miniStats(ws) {
  return `<div class="mini-stat"><div class="mini-label">correct</div><div class="mini-val">${ws.correct}</div></div>
    <div class="mini-stat"><div class="mini-label">wrong</div><div class="mini-val">${ws.wrong}</div></div>
    <div class="mini-stat"><div class="mini-label">streak</div><div class="mini-val">${ws.streak}</div></div>
    <div class="mini-stat"><div class="mini-label">mastered</div><div class="mini-val">${ws.streak>=5?"✓":"—"}</div></div>`;
}
function renderDrill() {
  const el = document.getElementById("main-screen");
  if (!currentWord) return;
  const ws = getWS(currentWord.deckId, currentWord.idx);
  const badges = [
    ws.streak >= 5 ? `<span class="mastered-badge">✓ mastered</span>` : "",
    ws.streak > 0 && ws.streak < 5 ? `<span class="streak-badge">🔥 ${ws.streak}</span>` : ""
  ].join(" ");
  const deckNames   = [...selectedIds].map(id => getDeck(id)?.name).filter(Boolean).join(" + ");
  const focusNotice = activeMode === "focus"
    ? `<div class="focus-notice">🎯 Focus mode — mastered words excluded</div>` : "";
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
function checkDrill() {
  if (answered) return;
  const input = document.getElementById("german-input");
  if (!input || !currentWord) return;
  if (!input.value.trim()) { dontKnow(); return; }
  answered = true;
  const correct = isCorrect(input.value, currentWord[WORD_KEY]);
  const ws      = getWS(currentWord.deckId, currentWord.idx);
  const isNew   = ws.correct === 0 && ws.wrong === 0;
  if (correct) {
    ws.correct++; ws.streak++;
    sessionCorrect++; sessionConsecutive++;
    S.totalCorrect++;
    addExp(isNew ? 20 : 5);
    if (ws.streak === 5) addExp(50);
    input.classList.add("correct");
    playSuccess();
    checkAllBadges();
  } else {
    ws.wrong++; ws.streak = 0; sessionConsecutive = 0;
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
  ws.wrong++; ws.streak = 0; sessionConsecutive = 0;
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
      <div class="examples-wrap">
        <div class="examples-title">Examples</div>
        ${currentWord.examples.map(ex => `
          <div class="example-row">
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
  if (!SR) { alert("Voice not supported. Switching to Classic."); activeMode="classic"; startDrill(); return; }
  if (!navigator.onLine) { alert("No internet. Switching to Classic."); activeMode="classic"; startDrill(); return; }
  voiceSessionRunning = true;
  answered    = false;
  currentWord = pickNext(activeMode === "focus");
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
  const words = [...activeWords];
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
    timerCorrect++; addExp(10); timerExpEarned += 10; playSuccess();
    const ws = getWS(currentWord.deckId, currentWord.idx);
    ws.correct++; S.totalCorrect++; saveState();
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
    ws.wrong++; saveState();
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
      activeMode = "classic"; startDrill();
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
    ws.correct++; ws.streak++;
    sessionCorrect++; sessionConsecutive++;
    S.totalCorrect++;
    addExp(isNew ? 20 : 5);
    if (ws.streak === 5) addExp(50);
    checkAllBadges();
  } else {
    ws.wrong++; ws.streak = 0; sessionConsecutive = 0;
  }
  saveState();
  if (correct) playSuccess(); else playFailure();
  speak(currentWord[WORD_KEY]);
  showVoiceFeedback(correct, heard, isSkip);
  const delay = correct ? VOICE_PARAMS.correctShowTime : VOICE_PARAMS.wrongShowTime;
  setTimeout(() => {
    if (!voiceSessionRunning) return;
    answered    = false;
    currentWord = pickNext(activeMode === "focus");
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
    ws.streak >= 5 ? `<span class="mastered-badge">✓ mastered</span>` : "",
    ws.streak > 0 && ws.streak < 5 ? `<span class="streak-badge">🔥 ${ws.streak}</span>` : ""
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
function finishLearnStartDrill() { activeMode = "classic"; startDrill(); }

// ── TIMER MODE ────────────────────────────────
function startTimer() {
  const words = [...activeWords];
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
    timerCorrect++; playSuccess(); addExp(10); timerExpEarned += 10;
    const ws = getWS(currentWord.deckId, currentWord.idx);
    ws.correct++; saveState();
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
    ws.wrong++; saveState(); playFailure();
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
  ws.wrong++; saveState();
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
  if (won) { addExp(50); timerExpEarned += 50; }
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
    <div class="screen-top"><div class="screen-label">Progress</div><button class="back-btn" onclick="backToMenu()">← Back</button></div>
    <div style="text-align:right;margin-bottom:1rem;">
      <button onclick="resetAll()" style="font-size:12px;padding:5px 12px;border:1px solid #E24B4A;border-radius:6px;background:white;color:#E24B4A;cursor:pointer;">Reset all progress</button>
    </div>`;
  ALL_GROUPS.forEach(group => {
    html += `<div class="stats-section"><div class="stats-section-title">${group.icon} ${group.name}</div>`;
    group.decks.forEach(deck => {
      const { mastered, total, all } = deckProgress(deck);
      html += `<div style="margin-bottom:1rem">
        <div style="font-size:12px;font-weight:600;color:#888;margin-bottom:6px;display:flex;align-items:center;justify-content:space-between;">
          <span>${deck.icon} ${deck.name} — ${mastered}/${total} mastered (${all} total)</span>
          <button onclick="resetDeck('${deck.id}')" style="font-size:11px;padding:3px 8px;border:1px solid #ddd;border-radius:6px;background:white;color:#888;cursor:pointer;">Reset</button>
        </div>
        <table><thead><tr><th>English</th><th>Target</th><th>Plural</th><th>✓</th><th>✗</th><th>Streak</th></tr></thead><tbody>`;
      unlockedWords(deck).forEach((w,i) => {
        const ws = getWS(deck.id, i);
        const st = ws.streak >= 5
          ? `<span class="mastered-badge">mastered</span>`
          : ws.streak > 0
            ? `<span class="streak-badge">${ws.streak}</span>`
            : `<span style="color:#bbb">new</span>`;
        html += `<tr><td>${w.en}</td><td style="color:#555">${w[WORD_KEY]}</td><td style="color:#aaa">${w.pl||"—"}</td><td>${ws.correct}</td><td>${ws.wrong}</td><td>${st}</td></tr>`;
      });
      html += `</tbody></table></div>`;
    });
    html += `</div>`;
  });
  html += `</div>`;
  document.getElementById("main-screen").innerHTML = html;
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
