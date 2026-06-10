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

function freshAnki() {
  return { phase:"new", interval:0, easeFactor:2.5, dueDate:null, learningStep:0, lapses:0 };
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
