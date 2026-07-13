// ─────────────────────────────────────────────────────────────────
// Vocab app engine — shared by all language apps.
// Requires APP_CONFIG to be defined before these files load:
// {
//   title: "🇩🇪 German Vocabulary",
//   speechLang: "de-DE",
//   storageKey: "gv5_de",
//   targetProp: "de",
//   allGroups: [DECKS_A1, DECKS_A2],
// }
// Also requires Firebase (firebase-app-compat, firebase-auth-compat,
// firebase-firestore-compat) and firebaseConfig to be initialized.
//
// Files are plain scripts sharing the global scope (no build step).
// Load order is defined in each app's index.html.
// ─────────────────────────────────────────────────────────────────

// ── CONSTANTS ────────────────────────────────
const STORAGE_KEY   = APP_CONFIG.storageKey;
const ALL_GROUPS    = APP_CONFIG.allGroups;
const WORD_KEY      = APP_CONFIG.targetProp;
const UNLOCK_STEP   = 10;
const UNLOCK_INITIAL = 12;

// True when running as an installed PWA (home-screen app) rather
// than a normal browser tab — some mobile-only behaviours key off this.
const IS_STANDALONE = navigator.standalone === true ||
  (window.matchMedia && window.matchMedia("(display-mode: standalone)").matches);

const EXP_BASE = 400, EXP_RATIO = 1.08;
function expForLevel(n) {
  if (n <= 1) return 0;
  return Math.round(EXP_BASE * (Math.pow(EXP_RATIO, n - 1) - 1) / (EXP_RATIO - 1));
}

const DRILL_MILESTONES = [
  { at:25, xp:10 }, { at:50, xp:20 }, { at:75, xp:30 }, { at:100, xp:40 }
];
function getDrillMilestone(n) {
  if (n <= 100) return DRILL_MILESTONES.find(m => m.at === n) || null;
  if (n > 100 && n % 50 === 0) return { at:n, xp:50 };
  return null;
}

// ── ANKI SCHEDULER SETTINGS ──────────────────
// Faithful to the official Anki defaults, with one deliberate deviation:
// no interval fuzz. Every interval is deterministic, so the forecast
// screen shows exactly what each future day will cost.
const ANKI = {
  LEARNING_STEPS:   [1, 10],  // minutes; new cards repeat in-session
  RELEARNING_STEPS: [10],     // minutes; after a lapsed review
  GRADUATING_IVL:   1,        // days after final learning step (Good)
  EASY_IVL:         4,        // days when Easy skips learning entirely
  STARTING_EASE:    2.5,
  MIN_EASE:         1.3,
  HARD_MULT:        1.2,
  EASY_BONUS:       1.3,
  LAPSE_MULT:       0,        // new interval = old × 0% on lapse…
  LAPSE_MIN_IVL:    1,        // …but never below 1 day
  MAX_IVL:          36500,
  LEECH_THRESHOLD:  8,        // lapses before a card is flagged a leech
  LEARN_AHEAD_MIN:  20,       // show learning cards early when idle
  ROLLOVER_HOUR:    4,        // "next day" starts at 4 AM, like Anki
  NEW_PER_DAY_DEFAULT: 20,
  NEW_PER_DAY_OPTIONS: [5, 10, 15, 20, 30, 40],
};

// The Anki day rolls over at 4 AM, not midnight — a 1 AM session still
// counts as "yesterday". Only the Anki system uses this clock.
function ankiToday() {
  return new Date(Date.now() - ANKI.ROLLOVER_HOUR * 3600 * 1000).toLocaleDateString('en-CA');
}
function ankiNewPerDay() {
  return ANKI.NEW_PER_DAY_OPTIONS.includes(S.ankiNewPerDay) ? S.ankiNewPerDay : ANKI.NEW_PER_DAY_DEFAULT;
}
// The quota actually in force: 0 while new words are paused (manually,
// or auto-paused after 3 missed days). Reviews are never paused.
function ankiEffectiveNewPerDay() {
  return S.ankiNewPaused ? 0 : ankiNewPerDay();
}

function freshAnki() {
  return {
    phase: "new",       // new | learning | review | relearning
    stepIndex: 0,       // position in the learning/relearning steps
    interval: 0,        // days (review phase)
    ease: ANKI.STARTING_EASE,
    due: null,          // learning/relearning: epoch ms · review: ISO date
    lapses: 0,
    leech: false,
    introducedOn: null, // anki-day the card was first studied (new quota)
  };
}

// Interval label for rating buttons: "1m", "10m", "3d", "2mo", "1.5yr"
function fmtIvlMin(mins) {
  if (mins < 60) return `${Math.round(mins)}m`;
  return `${Math.round(mins / 60)}h`;
}
function fmtIvlDays(days) {
  if (days < 30) return `${days}d`;
  if (days < 365) return `${Math.round(days / 30)}mo`;
  const yr = days / 365;
  return `${yr < 10 ? Math.round(yr * 10) / 10 : Math.round(yr)}yr`;
}

// Fisher-Yates, in place. (Math.random in sort() is biased.)
function shuffle(arr) {
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
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


// ── DATE HELPERS ──────────────────────────────
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
