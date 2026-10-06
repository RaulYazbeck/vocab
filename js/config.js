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
// counts as "yesterday". The whole app uses this clock (todayISO), in
// the device's local time zone.
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

// ── WORD STAGES (the Path) ────────────────────
// Every vocab word climbs 0 → 7. Intervals are in days and land on the
// 4 AM rollover (like Anki's day). Known (5) is the main finish line,
// Locked in (7) the prestige one; 5–7 are checkpoints (see srs.js).
const STAGE_DAYS = [0, 1, 2, 4, 7, 14, 30, 0]; // interval after reaching st
const STAGE_KNOWN = 5, STAGE_STRONG = 6, STAGE_LOCKED = 7, STAGE_MAX = 7;
const STAGE_RECOG_CAP = 3;          // recognition can lift a word up to here
const RELEARN_MS = 2 * 60 * 1000;   // a missed word comes back this soon
// Per-word ease (FSRS-inspired personalisation): every interval is
// scaled by ws.k. Easy words (fast, never slipping) stretch up to ×1.6;
// words you slip on shrink down to ×0.5 and, below HARD_K, need two
// correct reviews at a stage before moving up.
const EASE = { MIN: 0.5, MAX: 1.6, SLIP: 0.2, REPAIR: 0.15, NEAR: 0.05, UP: 0.02, UP_FAST: 0.08, FAST_MS: 5000, HARD_K: 0.8 };
// 💎 maintenance: a locked-in word keeps its badge and gets two quiet
// check-ins — 4 months and then a year later — then it's done for good.
const LOCKED_CHECKS = [120, 365];
const LOCKED_REPAIR_CHECK = 30; // days: a 💎 word that slipped and was repaired
const TIERS = [
  { id: "new",      icon: "·",  name: "Not met",    min: 0, max: 0 },
  { id: "learning", icon: "🌱", name: "Learning",   min: 1, max: 2 },
  { id: "familiar", icon: "🌿", name: "Familiar",   min: 3, max: 4 },
  { id: "known",    icon: "🌳", name: "Known",      min: 5, max: 5 },
  { id: "strong",   icon: "⭐", name: "Strong",     min: 6, max: 6 },
  { id: "locked",   icon: "💎", name: "Locked in",  min: 7, max: 7 },
];
const PATH = {
  NEW_PER_DAY_OPTIONS: [0, 5, 10, 15, 20, 30],
  NEW_PER_DAY_DEFAULT: 10,
  CLUSTER_MIN: 3, CLUSTER_MAX: 4,
  THROTTLE_HALF: 60,   // overdue reviews that halve new words
  THROTTLE_STOP: 120,  // … and that pause them
  AUTO_PAUSE_DAYS: 3,
  SESSION_LENGTHS: { quick: 15, regular: 30, long: 60 },
  EXTRA_NEW: 5,
};
// Start of the study day `offset` days from today (4 AM rollover).
function studyDayStart(offset = 0, now = Date.now()) {
  const d = new Date(now);
  d.setHours(ANKI.ROLLOVER_HOUR, 0, 0, 0);
  if (now < d.getTime()) d.setDate(d.getDate() - 1);
  if (offset) d.setDate(d.getDate() + offset);
  return d.getTime();
}
// ISO date of the current study day (same clock as the Anki day).
function studyToday() { return ankiToday(); }

// "2027-09-27" → "27 Sep 2027"
function fmtShortDate(iso) {
  const d = new Date(iso + "T12:00");
  return isNaN(d) ? iso : d.toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" });
}

// ── RNG ───────────────────────────────────────
function hashString(str) {
  let h = 2166136261;
  for (let i = 0; i < str.length; i++) { h ^= str.charCodeAt(i); h = Math.imul(h, 16777619); }
  return h >>> 0;
}
// mulberry32 — tiny deterministic PRNG (Daily Challenge, quests, Path)
function seededRandom(seed) {
  let a = seed >>> 0;
  return function () {
    a = (a + 0x6D2B79F5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
// Weighted pick from [{…, w}] with an rng() in [0,1).
function weightedPick(items, rng = Math.random, wf = x => x.w) {
  let total = 0; items.forEach(x => total += Math.max(0, wf(x)));
  if (total <= 0) return items[Math.floor(rng() * items.length)] || null;
  let r = rng() * total;
  for (const x of items) { r -= Math.max(0, wf(x)); if (r <= 0) return x; }
  return items[items.length - 1] || null;
}
function seededShuffle(arr, rng) {
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
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
// The app's day rolls over at 4 AM (like Anki): a 1 AM session still
// counts as yesterday, for quests, goals, streaks and the Path alike.
function todayISO() {
  return ankiToday();
}
// Day arithmetic on plain "YYYY-MM-DD" dates, in UTC so daylight-saving
// changes can never repeat or skip a date.
function daysBetween(a, b) {
  return Math.round((Date.parse(String(b).slice(0, 10)) - Date.parse(String(a).slice(0, 10))) / 864e5);
}
function addDays(date, n) {
  const d = new Date(String(date).slice(0, 10) + "T00:00:00Z");
  d.setUTCDate(d.getUTCDate() + n);
  return d.toISOString().slice(0, 10);
}
