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
    if (!ws.anki) ws.anki = freshAnki();
  });
  S.loginDates = [...new Set(S.loginDates)].sort();
  S.badges = [...new Set(S.badges)];
}
