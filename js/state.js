// ── STATE ─────────────────────────────────────
let S = loadState();
let selectedIds = new Set();
let openGroups  = new Set();
let activeMode    = "drill";
let drillSubMode  = "classic"; // 'classic' | 'focus' | 'refresh'
let timerSubMode  = "classic"; // 'classic' | 'focus'
// Sound switches live on this device (a phone and a laptop can differ).
// Each one names what it controls; "Mute until tomorrow" (quietActive,
// path.js) silences all three for the day without touching them.
const SOUND = loadSoundPrefs();
function loadSoundPrefs() {
  let p = null;
  try { p = JSON.parse(localStorage.getItem("gv_sound") || "null"); } catch (e) {}
  if (!p || typeof p !== "object") {
    // The old single "Sound off" switch silenced speech, game sounds and
    // vibration: carry it over as those switches off.
    const muted = localStorage.getItem("gv_mute") === "true";
    p = { tts: !muted, sfx: !muted, vibe: !muted };
  }
  return { tts: p.tts !== false, sfx: p.sfx !== false, vibe: p.vibe !== false };
}
function setSoundPref(k, v) {
  SOUND[k] = !!v;
  try { localStorage.setItem("gv_sound", JSON.stringify(SOUND)); } catch (e) {}
  if (k === "tts" && !v && window.speechSynthesis) try { speechSynthesis.cancel(); } catch (e) {}
  if (typeof logEvent === "function") logEvent("setting", { k: "sound_" + k, v: !!v });
}
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
    if (!ws.anki) ws.anki = freshAnki();
    else ws.anki = migrateAnkiState(ws.anki); // old day-based SM-2 → Anki schema
  });
  S.loginDates = [...new Set(S.loginDates)].sort();
  S.badges = [...new Set(S.badges)];
  if (!S.wordEdits)             S.wordEdits = {};
  if (!GOAL_OPTIONS.includes(S.dailyGoal)) {
    // Adopt the pre-sync localStorage goal once, then live in S (synced).
    const legacy = parseInt(localStorage.getItem('gv_daily_goal'), 10);
    S.dailyGoal = GOAL_OPTIONS.includes(legacy) ? legacy : 20;
  }
  if (!S.goalDates) S.goalDates = [];
  if (!S.achLevels)             S.achLevels = {};
  if (!S.bestCombo)             S.bestCombo = 0;
  if (!S.bestDayCorrect)        S.bestDayCorrect = 0;
  if (!S.timerWins)             S.timerWins = 0;
  if (!S.perfectTimerWins)      S.perfectTimerWins = 0;
  if (!S.bestTimerSecondsLeft)  S.bestTimerSecondsLeft = 0;
  if (!S.ankiSessions)          S.ankiSessions = 0;
  if (!ANKI.NEW_PER_DAY_OPTIONS.includes(S.ankiNewPerDay)) S.ankiNewPerDay = ANKI.NEW_PER_DAY_DEFAULT;
  if (S.ankiNewPaused === undefined) S.ankiNewPaused = false;
  migratePrefs();
  migrateGames();
  migratePath();
  if (typeof migrateQuests === "function") migrateQuests();
  if (typeof migrateUsage === "function") migrateUsage();
  // Re-apply user word-text overrides after every state load — migrate()
  // runs both at startup and after a cloud sync replaces S.
  if (typeof applyWordEdits === "function") applyWordEdits();
  // Auto-pause new Anki words after a long absence (3+ missed days).
  if (typeof checkAnkiAutoPause === "function") checkAnkiAutoPause();
}

// Two ways of using the app, both off by default and synced:
//   grandma — the home screen shrinks to Start, quests and games
//   speak   — "Speak, don't spell": recall is said aloud and self-graded
function migratePrefs() {
  if (!S.prefs || typeof S.prefs !== "object") S.prefs = {};
  S.prefs.grandma = !!S.prefs.grandma;
  S.prefs.speak = !!S.prefs.speak;
  applyPrefClasses();
}
function grandmaOn() { return !!(S.prefs && S.prefs.grandma); }
function speakOn() { return !!(S.prefs && S.prefs.speak); }
function applyPrefClasses() {
  if (!document.body) return;
  document.body.classList.toggle("grandma", grandmaOn());
  document.body.classList.toggle("speak-mode", speakOn());
}

// Minigame records (see games-core.js). Lives in the synced meta doc,
// so it holds only small aggregates — never per-word data.
function migrateGames() {
  if (!S.games || typeof S.games !== "object") S.games = {};
  const G = S.games;
  ["best", "stars", "plays"].forEach(k => { if (!G[k] || typeof G[k] !== "object") G[k] = {}; });
  if (!G.totalPlays)       G.totalPlays = 0;
  if (!G.bossesDefeated)   G.bossesDefeated = 0;
  if (!G.bestGenderStreak) G.bestGenderStreak = 0;
  if (!Array.isArray(G.pool)) G.pool = null;          // null = all known words
  if (G.surprise === undefined) G.surprise = true;    // bonus rounds in Drill
  if (!G.daily || typeof G.daily !== "object") G.daily = {};
  if (typeof G.daily.date !== "string") G.daily.date = "";
  if (!Array.isArray(G.daily.done)) G.daily.done = [];
  if (!Array.isArray(G.daily.completedDates)) G.daily.completedDates = [];
  if (!Array.isArray(G.daily.ids)) G.daily.ids = [];
  // Ranks (🥉→💎): stars and bests per rank. Old single-level records
  // become Bronze; a 3★ Bronze game starts with Silver unlocked.
  ["rank", "rankStars", "rankBest", "twistBest", "lastPlayed"].forEach(k => { if (!G[k] || typeof G[k] !== "object") G[k] = {}; });
  Object.keys(G.stars).forEach(id => {
    if (!G.rankStars[id]) G.rankStars[id] = [G.stars[id] || 0, 0, 0, 0, 0];
    if (G.rank[id] === undefined) G.rank[id] = (G.stars[id] || 0) >= 3 ? 1 : 0;
  });
  Object.keys(G.best).forEach(id => { if (!G.rankBest[id]) G.rankBest[id] = [G.best[id]]; });
  if (G.twists === undefined) G.twists = true;
  if (!G.bestiary || typeof G.bestiary !== "object") G.bestiary = {};
  if (!G.world || typeof G.world !== "object") G.world = {};
  if (!G.collect || typeof G.collect !== "object") G.collect = { g: 0, p: 0 };
  // Grammar practice records (never touch word stages, never shown as
  // progress): case accuracy, verb forms per verb × tense (they steer
  // Conjugation Slots), and recent mix-ups used as distractors.
  if (!G.cases || typeof G.cases !== "object") G.cases = {};
  if (!G.vf || typeof G.vf !== "object") G.vf = {};
  if (!G.confuse || typeof G.confuse !== "object") G.confuse = {};
  if (S.gameCorrectToday === undefined) S.gameCorrectToday = 0;
  if (S.gameCorrectDate === undefined)  S.gameCorrectDate = "";
}

// ── PATH MIGRATION ────────────────────────────
// One-time conversion of the old mastery model (Wilson score, Mastery+
// for 21 days) into word stages. Idempotent: only records without `st`
// are touched, and every choice is derived from the record itself plus
// a hash of its key, so two devices (or a cloud load) agree.
function legacyMastered(ws) {
  if (ws.mastered) return true;
  const total = (ws.correct || 0) + (ws.wrong || 0);
  if ((ws.streak || 0) >= 6) return true;
  return total >= 6 && wilsonLower(ws.correct || 0, total) >= 0.724;
}
function legacyMasteryPlus(ws) {
  if (!ws.masteryPlusDate || !legacyMastered(ws)) return false;
  if (daysBetween(ws.masteryPlusDate, todayISO()) > 21) return false;
  return (ws.streak || 0) >= 3 && wilsonLower(ws.correct || 0, (ws.correct || 0) + (ws.wrong || 0)) >= 0.83;
}
function migratePath() {
  if (!S.path || typeof S.path !== "object") S.path = {};
  const P = S.path;
  if (!PATH.NEW_PER_DAY_OPTIONS.includes(P.newPerDay)) P.newPerDay = PATH.NEW_PER_DAY_DEFAULT;
  if (!PATH.SESSION_LENGTHS[P.sessionLen]) P.sessionLen = "regular";
  if (P.voiceInput === undefined) P.voiceInput = false;
  if (typeof P.day !== "string") P.day = "";
  if (!(P.introducedToday >= 0)) P.introducedToday = 0;
  if (!(P.extraToday >= 0)) P.extraToday = 0;
  if (typeof P.lastActiveDay !== "string") P.lastActiveDay = "";
  if (P.autoPaused === undefined) P.autoPaused = false;
  if (P.welcomed === undefined) P.welcomed = false;
  if (typeof P.quietDay !== "string") P.quietDay = "";
  if (typeof P.deadline !== "string") P.deadline = "";
  if (P.plan === undefined) P.plan = null;
  if (typeof P.lastDeck !== "string") P.lastDeck = "";
  if (!P.migrated) P.migrated = {};
  const now = Date.now();
  const counts = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0, 6: 0 };
  let changed = 0;
  Object.keys(S.words).forEach(key => {
    const ws = S.words[key];
    if (ws.st !== undefined) return;
    const deckId = key.substring(0, key.lastIndexOf("_"));
    if (!getDeck(deckId) || isAnkiDeck(deckId)) return;
    const total = (ws.correct || 0) + (ws.wrong || 0);
    const h = hashString(key);
    let st = 0, spread = 0;
    if (legacyMasteryPlus(ws)) { st = 6; spread = 3 + h % 8; }
    else if (legacyMastered(ws)) { st = 5; spread = 2 + h % 9; ws.mastered = true; }
    else if (total > 0) {
      const w = wilsonLower(ws.correct || 0, total);
      st = w >= 0.62 ? 4 : w >= 0.5 ? 3 : w >= 0.3 ? 2 : 1;
      spread = st >= 3 ? 1 + h % 5 : h % 3;
    }
    ws.st = st;
    if (st) {
      ws.pk = st;
      ws.sAt = now;
      ws.dueAt = studyDayStart(spread, now);
      counts[st]++;
    }
    changed++;
  });
  if (changed && !P.migrated.done) P.migrated = { done: true, counts, on: todayISO() };
}
