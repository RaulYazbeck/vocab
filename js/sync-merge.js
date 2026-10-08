// ── SYNC MERGE ────────────────────────────────
//
// When two devices both changed progress since they last synced, sync.js
// merges the two states instead of letting the newer save replace the
// older one. Pure functions only — no network, no globals besides the
// constants below — so the rules can be tested on their own.
//
// The rules, by kind of data:
//   • Words — each word keeps the record of whichever device studied it
//     last (stage, due date, ease… belong together and are never mixed);
//     right/wrong/near counts add both devices' answers since their last
//     common sync (the higher of the two when that isn't known), mistake
//     stats take the higher, "mastered" and the peak stage never go down.
//     A word only one device has is simply kept.
//   • Counters that add up (XP, total correct, game plays, gold) — the
//     gains of both devices since their last common sync are added
//     (base + mine + theirs). Without a known common base, the higher.
//   • Bests, levels, stars, unlocks — the higher.
//   • Earned collections (badges, login/goal days, owned cosmetics) —
//     the union.
//   • Day counters (today's drill/game/timer count) — the later day's;
//     on the same day, the higher.
//   • Usage history and the learning log — per day / per verb, the higher
//     counts; mistake histories are combined.
//   • Everything else (today's quests, the path plan, settings) — the
//     whole object from the device that saved last, as before.
//   • Resets — "reset deck" / "reset all" leave a timestamp; words last
//     studied before it are dropped on both sides, so a reset sticks.
//
// ─────────────────────────────────────────────

// Counters merged as base + (local − base) + (cloud − base).
const SYNC_ADD_PATHS = [
  "exp", "totalCorrect", "repairedTotal", "timerWins", "perfectTimerWins", "ankiSessions",
  "games.totalPlays", "games.bossesDefeated", "quests.gold",
];
// Never go down: the higher wins.
const SYNC_MAX_PATHS = [
  "bestCombo", "bestDayCorrect", "bestTimerSecondsLeft",
  "games.bestGenderStreak", "games.collect.g", "games.collect.p",
];
// Per-key "higher wins" maps.
const SYNC_MAX_MAPS = [
  "unlocked", "achLevels", "games.best", "games.stars", "games.rank", "games.twistBest",
  "games.plays", "games.lastPlayed", "games.rankStars", "games.rankBest", "games.bestiary",
];
// Sets (arrays of unique values) — union.
const SYNC_SET_PATHS = [
  "badges", "loginDates", "goalDates", "quests.qdays", "quests.cos.owned", "games.daily.completedDates",
];
// [count, day] pairs: the later day's count; the higher on the same day.
const SYNC_DAY_COUNTERS = [
  ["drillCorrectToday", "drillMilestonesDate", "drillMilestonesClaimed"],
  ["gameCorrectToday", "gameCorrectDate"],
  ["timerWinsToday", "timerWinsDate"],
];
const SYNC_MH_CAP = 30; // mistake history entries kept per word/verb (learning-log.js LEARN_HIST)

function syncClone(v) { return v === undefined ? undefined : JSON.parse(JSON.stringify(v)); }
function syncIsObj(v) { return !!v && typeof v === "object" && !Array.isArray(v); }
function syncGet(o, path) {
  for (const k of path.split(".")) { if (!syncIsObj(o)) return undefined; o = o[k]; }
  return o;
}
function syncSet(o, path, v) {
  const ks = path.split("."), last = ks.pop();
  for (const k of ks) { if (!syncIsObj(o[k])) o[k] = {}; o = o[k]; }
  if (v === undefined) delete o[last]; else o[last] = v;
}
const syncNum = v => (typeof v === "number" && isFinite(v) ? v : 0);

// Higher-wins for any shape: numbers → max, arrays → element-wise,
// objects → per key, anything else → the first (preferred) value.
function syncDeepMax(a, b) {
  if (a === undefined || a === null) return syncClone(b);
  if (b === undefined || b === null) return syncClone(a);
  if (typeof a === "number" && typeof b === "number") return Math.max(a, b);
  if (typeof a === "string" && typeof b === "string" && /^\d{4}-\d\d-\d\d/.test(a) && /^\d{4}-\d\d-\d\d/.test(b)) return a > b ? a : b;
  if (Array.isArray(a) && Array.isArray(b)) {
    const n = Math.max(a.length, b.length), out = [];
    for (let i = 0; i < n; i++) out.push(syncDeepMax(a[i], b[i]));
    return out;
  }
  if (syncIsObj(a) && syncIsObj(b)) {
    const out = {};
    new Set([...Object.keys(a), ...Object.keys(b)]).forEach(k => { out[k] = syncDeepMax(a[k], b[k]); });
    return out;
  }
  return syncClone(a);
}
// Union of two lists of entries (e.g. mistake histories), oldest first.
function syncUnionList(a, b, cap) {
  const seen = new Set(), out = [];
  [...(Array.isArray(a) ? a : []), ...(Array.isArray(b) ? b : [])].forEach(x => {
    const k = JSON.stringify(x);
    if (!seen.has(k)) { seen.add(k); out.push(x); }
  });
  out.sort((x, y) => String(Array.isArray(x) ? x[0] : x).localeCompare(String(Array.isArray(y) ? y[0] : y)));
  return cap ? out.slice(-cap) : out;
}

// When a word was last worked on (ms): answers, (re)scheduling, Anki.
function syncWordActivity(ws) {
  if (!syncIsObj(ws)) return 0;
  return Math.max(syncNum(ws.lastAnsweredAt), syncNum(ws.sAt), syncIsObj(ws.anki) ? syncNum(ws.anki.at) : 0);
}
function syncWordEvidence(ws) {
  return syncIsObj(ws) ? syncNum(ws.correct) + syncNum(ws.wrong) + syncNum(ws.near) : 0;
}
// Right/wrong/near counts of every word: { key: [correct, wrong, near] }.
const SYNC_COUNTS = ["correct", "wrong", "near"];
function syncWordCounts(state) {
  const out = {};
  Object.entries((state && syncIsObj(state.words) && state.words) || {}).forEach(([k, ws]) => {
    if (syncIsObj(ws)) out[k] = SYNC_COUNTS.map(c => syncNum(ws[c]));
  });
  return out;
}
// One word on both sides: the last-studied record whole, counts added
// over `bc` (the counts both started from) or else the higher, stats at
// their highest, sticky flags kept.
function syncMergeWord(a, b, preferA, bc) {
  if (!syncIsObj(a)) return syncClone(b);
  if (!syncIsObj(b)) return syncClone(a);
  if (JSON.stringify(a) === JSON.stringify(b)) return syncClone(a);
  const ta = syncWordActivity(a), tb = syncWordActivity(b);
  const ea = syncWordEvidence(a), eb = syncWordEvidence(b);
  const aFirst = ta !== tb ? ta > tb : ea !== eb ? ea > eb : preferA;
  const [p, q] = aFirst ? [a, b] : [b, a];
  const m = syncClone(p);
  SYNC_COUNTS.forEach((k, i) => {
    if (p[k] === undefined && q[k] === undefined) return;
    const x = syncNum(p[k]), y = syncNum(q[k]);
    if (bc) { const b = syncNum(bc[i]); m[k] = b + Math.max(0, x - b) + Math.max(0, y - b); }
    else m[k] = Math.max(x, y);
  });
  if (p.mastered || q.mastered) m.mastered = true;
  if (p.pk !== undefined || q.pk !== undefined) m.pk = Math.max(syncNum(p.pk), syncNum(q.pk));
  ["mx", "sf", "g"].forEach(k => { if (p[k] !== undefined || q[k] !== undefined) m[k] = syncDeepMax(p[k], q[k]); });
  if (p.mh || q.mh) m.mh = syncUnionList(p.mh, q.mh, SYNC_MH_CAP);
  return m;
}
function syncDeckOf(key) { return key.substring(0, key.lastIndexOf("_")); }

// Words of both sides. `cutFor(deckId)` = the latest reset of that deck
// (ms) — records not worked on since are dropped. `bw` = per word, the
// counts both sides started from ([correct, wrong, near]); a word missing
// from it (or no bw) is merged by the higher count.
function syncMergeWords(lw, cw, preferLocal, cutFor, bw) {
  lw = syncIsObj(lw) ? lw : {}; cw = syncIsObj(cw) ? cw : {};
  const out = {};
  new Set([...Object.keys(lw), ...Object.keys(cw)]).forEach(k => {
    const ws = syncMergeWord(lw[k], cw[k], preferLocal, bw ? bw[k] || null : null);
    if (!syncIsObj(ws)) return;
    const cut = cutFor(syncDeckOf(k));
    if (cut && syncWordActivity(ws) < cut) return;
    out[k] = ws;
  });
  return out;
}

// The counters base/local/cloud are compared on.
function syncScalarsOf(state) {
  const out = {};
  SYNC_ADD_PATHS.forEach(p => { out[p] = syncNum(syncGet(state, p)); });
  return out;
}

// Merge two progress states. Neither input is modified.
//   local, cloud  full states (words included, no sync-only fields)
//   opts.base     syncScalarsOf() of the last state both descend from,
//                 or null when unknown
//   opts.baseWords per word, the counts both sides started from
//                 ({ key: [correct, wrong, near] }); words not in it, or
//                 no map at all, keep the higher count
//   opts.localWins true when local's whole-object fields (quests, path,
//                 settings…) should be kept rather than cloud's
function mergeStates(local, cloud, opts = {}) {
  local = syncIsObj(local) ? local : {};
  cloud = syncIsObj(cloud) ? cloud : {};
  const localWins = !!opts.localWins;
  const base = syncIsObj(opts.base) ? opts.base : null;
  const [win, lose] = localWins ? [local, cloud] : [cloud, local];
  const { words: _w1, usageArchive: _u1, learn: _l1, ...winRest } = win;
  const out = syncClone(winRest);

  // Resets: deck → latest reset time; "reset all" applies to every deck.
  const resets = syncDeepMax(local.resets || {}, cloud.resets || {});
  const resetAll = Math.max(syncNum(local.resetAllAt), syncNum(cloud.resetAllAt));
  if (Object.keys(resets).length) out.resets = resets;
  if (resetAll) out.resetAllAt = resetAll;
  const cutFor = deckId => Math.max(syncNum(resets[deckId]), resetAll);
  // A side whose "reset all" is newer than the other's: its earned
  // collections and bests stand as they are (the reset was meant).
  const lr = syncNum(local.resetAllAt), cr = syncNum(cloud.resetAllAt);
  const resetSide = lr > cr ? local : cr > lr ? cloud : null;

  out.words = syncMergeWords(local.words, cloud.words, localWins, cutFor, syncIsObj(opts.baseWords) ? opts.baseWords : null);

  SYNC_ADD_PATHS.forEach(p => {
    const l = syncNum(syncGet(local, p)), c = syncNum(syncGet(cloud, p));
    let v;
    if (base && typeof base[p] === "number") v = Math.max(0, base[p] + (l - base[p]) + (c - base[p]));
    else v = resetSide ? syncNum(syncGet(resetSide, p)) : Math.max(l, c);
    if (syncGet(local, p) !== undefined || syncGet(cloud, p) !== undefined) syncSet(out, p, v);
  });
  SYNC_MAX_PATHS.forEach(p => {
    const l = syncGet(local, p), c = syncGet(cloud, p);
    if (l === undefined && c === undefined) return;
    syncSet(out, p, resetSide ? syncGet(resetSide, p) : Math.max(syncNum(l), syncNum(c)));
  });
  SYNC_MAX_MAPS.forEach(p => {
    const l = syncGet(local, p), c = syncGet(cloud, p);
    if (l === undefined && c === undefined) return;
    const [w, x] = localWins ? [l, c] : [c, l];
    syncSet(out, p, resetSide ? syncClone(syncGet(resetSide, p)) : syncDeepMax(syncIsObj(w) ? w : {}, syncIsObj(x) ? x : {}));
  });
  SYNC_SET_PATHS.forEach(p => {
    const l = syncGet(local, p), c = syncGet(cloud, p);
    if (!Array.isArray(l) && !Array.isArray(c)) return;
    if (resetSide) { syncSet(out, p, syncClone(syncGet(resetSide, p))); return; }
    const all = [...new Set([...(Array.isArray(l) ? l : []), ...(Array.isArray(c) ? c : [])])];
    if (all.every(x => typeof x === "string")) all.sort();
    syncSet(out, p, p === "quests.qdays" ? all.slice(-400) : all);
  });
  if (local.lastLoginDate || cloud.lastLoginDate)
    out.lastLoginDate = [local.lastLoginDate || "", cloud.lastLoginDate || ""].sort().pop();
  SYNC_DAY_COUNTERS.forEach(([n, d, claimed]) => {
    const ld = String(local[d] || ""), cd = String(cloud[d] || "");
    if (!ld && !cd) return;
    if (ld === cd) {
      out[n] = Math.max(syncNum(local[n]), syncNum(cloud[n]));
      if (claimed) out[claimed] = [...new Set([...(local[claimed] || []), ...(cloud[claimed] || [])])];
    } else {
      const src = ld > cd ? local : cloud;
      out[d] = src[d]; out[n] = syncNum(src[n]);
      if (claimed) out[claimed] = syncClone(src[claimed] || []);
    }
  });
  // Word text overrides: both sides' edits, the preferred side's on a clash.
  if (local.wordEdits || cloud.wordEdits)
    out.wordEdits = { ...syncClone(lose.wordEdits || {}), ...syncClone(win.wordEdits || {}) };

  // Usage history (recent days in meta, older years archived): per day,
  // the higher counts.
  if (local.usage || cloud.usage) {
    out.usage = syncClone(win.usage || {});
    out.usage.days = syncDeepMax((local.usage || {}).days || {}, (cloud.usage || {}).days || {});
  }
  if (local.usageArchive || cloud.usageArchive) {
    const ua = {};
    new Set([...Object.keys(local.usageArchive || {}), ...Object.keys(cloud.usageArchive || {})]).forEach(y => {
      ua[y] = syncDeepMax((local.usageArchive || {})[y] || {}, (cloud.usageArchive || {})[y] || {});
    });
    out.usageArchive = ua;
  }
  // Learning log (verbs): per verb the higher counts, histories combined.
  if (local.learn || cloud.learn) {
    const ll = local.learn || {}, cl = cloud.learn || {};
    const L = syncClone(localWins ? ll : cl);
    const lv = ll.verbs || {}, cv = cl.verbs || {}, verbs = {};
    new Set([...Object.keys(lv), ...Object.keys(cv)]).forEach(v => {
      const a = lv[v], b = cv[v];
      if (!syncIsObj(a) || !syncIsObj(b)) { verbs[v] = syncClone(syncIsObj(a) ? a : b); return; }
      const { mh: am, ...ar } = a, { mh: bm, ...br } = b;
      verbs[v] = syncDeepMax(ar, br);
      if (am || bm) verbs[v].mh = syncUnionList(am, bm, SYNC_MH_CAP);
    });
    L.verbs = verbs;
    if (ll.since || cl.since) L.since = [ll.since, cl.since].filter(Boolean).sort()[0];
    out.learn = L;
  }
  out.savedAt = Math.max(syncNum(local.savedAt), syncNum(cloud.savedAt));
  return out;
}
