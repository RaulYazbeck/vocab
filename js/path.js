// ── THE PATH ──────────────────────────────────
// Automatic unlocking and the daily plan. Vocab decks only — Anki decks
// keep their own scheduler (mode-anki.js).
//
//   Frontier  — the lowest vocab level (A1 → A2 → B1, in ALL_GROUPS
//               order) that still has words you haven't met.
//   Clusters  — new words arrive 3–4 at a time from one topic deck of
//               the frontier. Decks are drawn weighted by how many
//               words they have left (so topics finish together) and
//               never twice in a row. S.unlocked[deck] keeps meaning
//               "the first N words of the deck": a cluster takes the
//               next unmet words, so the prefix only ever grows.
//   Pace      — S.path.newPerDay, throttled by the review backlog and
//               paused after a long absence, like Anki's auto-pause.
//
// Word state lives in S.words (see srs.js). Nothing here creates word
// records just by looking — reads go through S.words directly.

function vocabGroups() { return ALL_GROUPS.filter(g => g.type !== "anki"); }
function pathWord(deckId, idx) {
  const d = getDeck(deckId);
  return { ...d.words[idx], deckId, deckName: d.name, idx };
}
function wsPeek(deckId, idx) { return S.words[deckId + "_" + idx] || null; }
function isMet(deckId, idx) { const ws = wsPeek(deckId, idx); return !!(ws && ws.st); }

// Quiet mode: no sound, no voice, no audio items — for today only.
function quietActive() { return !!(S.path && S.path.quietDay === todayISO()); }
function toggleQuiet() {
  S.path.quietDay = quietActive() ? "" : todayISO();
  saveState();
  logEvent("quiet", { on: quietActive() });
  if (quietActive() && window.speechSynthesis) try { speechSynthesis.cancel(); } catch (e) {}
  if (typeof onQuietChanged === "function") onQuietChanged();
}
function audioOk() { return !muteEnabled && !quietActive() && !!window.speechSynthesis; }

// ── SCAN ──────────────────────────────────────
// One pass over every vocab word. Memoised for a short moment: the
// home screen, the Today card and the map all ask in the same render.
let _scanCache = null, _scanAt = 0;
function invalidatePathScan() { _scanCache = null; }
function pathScan(force = false) {
  const now = Date.now();
  if (!force && _scanCache && now - _scanAt < 1500) return _scanCache;
  const today = studyToday();
  const dayStart = studyDayStart(0, now);
  const res = {
    tiers: {}, total: 0, met: 0, known: 0, locked: 0,
    due: 0, overdue: 0, fix: 0, repair: 0, flagged: 0, relearn: 0, metToday: 0,
    groups: [], decks: {}, dueByDay: new Array(8).fill(0),
  };
  TIERS.forEach(t => res.tiers[t.id] = 0);
  vocabGroups().forEach(g => {
    const gs = { id: g.id, name: g.name, icon: g.icon, total: 0, met: 0, known: 0, locked: 0, tiers: {}, repair: 0, decks: [] };
    TIERS.forEach(t => gs.tiers[t.id] = 0);
    g.decks.forEach(d => {
      const ds = { id: d.id, name: d.name, icon: d.icon, group: g.id, total: d.words.length, met: 0, known: 0, locked: 0,
        tiers: {}, repair: 0, due: 0, unlocked: S.unlocked[d.id] || 0 };
      TIERS.forEach(t => ds.tiers[t.id] = 0);
      for (let i = 0; i < d.words.length; i++) {
        const ws = S.words[d.id + "_" + i];
        const st = ws ? (ws.st || 0) : 0;
        const tier = tierOfStage(st).id;
        ds.tiers[tier]++;
        if (st) {
          ds.met++;
          if (st >= STAGE_KNOWN) ds.known++;
          if (st >= STAGE_LOCKED) ds.locked++;
          if (ws.rp) { ds.repair++; res.repair++; }
          if (ws.fl) res.flagged++;
          if (ws.lrn && ws.metOn !== today) res.relearn++;
          if (ws.metOn === today) res.metToday++;
          if (isDue(ws, now)) {
            ds.due++; res.due++;
            if (ws.rp || ws.fl || (ws.lrn && ws.metOn !== today)) res.fix++;
            else if (ws.dueAt && ws.dueAt < dayStart) res.overdue++;
          } else if (ws.dueAt) {
            const dd = Math.floor((ws.dueAt - dayStart) / 864e5);
            if (dd >= 0 && dd < 8) res.dueByDay[dd]++;
          }
        }
      }
      ["total", "met", "known", "locked", "repair"].forEach(k => gs[k] += ds[k]);
      TIERS.forEach(t => gs.tiers[t.id] += ds.tiers[t.id]);
      gs.decks.push(ds);
      res.decks[d.id] = ds;
    });
    ["total", "met", "known", "locked"].forEach(k => res[k] += gs[k]);
    TIERS.forEach(t => res.tiers[t.id] += gs.tiers[t.id]);
    res.groups.push(gs);
  });
  res.dueByDay[0] += res.due; // "today" = due now + later today
  _scanCache = res; _scanAt = now;
  return res;
}

// ── FRONTIER & CLUSTERS ───────────────────────
function pathFrontier(scan = pathScan()) {
  return scan.groups.find(g => g.met < g.total) || null;
}
// The next `n` unmet word indices of a deck, in deck order.
function unmetIndices(deck, n) {
  const out = [];
  for (let i = 0; i < deck.words.length && out.length < n; i++) if (!isMet(deck.id, i)) out.push(i);
  return out;
}
// Pick the deck the next cluster comes from.
function pickClusterDeck(scan, exclude = [], rng = Math.random) {
  const fg = pathFrontier(scan);
  if (!fg) return null;
  let cands = fg.decks.filter(d => d.met < d.total && !exclude.includes(d.id));
  if (!cands.length) cands = fg.decks.filter(d => d.met < d.total);
  if (cands.length > 1) { const f = cands.filter(d => d.id !== S.path.lastDeck); if (f.length) cands = f; }
  if (!cands.length) return null;
  // Unlocked-but-unmet words (manual unlocks) go first.
  const pending = cands.filter(d => { const deck = getDeck(d.id); return unmetIndices(deck, 1)[0] < (S.unlocked[d.id] || 0); });
  const pool = pending.length ? pending : cands;
  const pick = weightedPick(pool.map(d => ({ d, w: d.total - d.met })), rng);
  return pick ? getDeck(pick.d.id) : null;
}
// Returns up to `max` words for new clusters (planned, not yet met).
function planNewWords(max, rng = Math.random, onlyDeck = null) {
  const out = [];
  if (max <= 0) return out;
  const scan = pathScan(true);
  const taken = new Set();
  let guard = 0;
  const usedDecks = [];
  let n = 0;
  while (n < max && guard++ < 20) {
    const deck = onlyDeck ? getDeck(onlyDeck) : pickClusterDeck(scan, usedDecks, rng);
    if (!deck) break;
    usedDecks.push(deck.id);
    const size = Math.min(max - n, PATH.CLUSTER_MIN + Math.floor(rng() * (PATH.CLUSTER_MAX - PATH.CLUSTER_MIN + 1)));
    const idx = unmetIndices(deck, size + 8).filter(i => !taken.has(deck.id + "_" + i)).slice(0, size);
    if (!idx.length) continue;
    const cluster = idx.map(i => { taken.add(deck.id + "_" + i); return pathWord(deck.id, i); });
    out.push(cluster);
    n += cluster.length;
    // Pretend they're met so the next pick can see the deck's new size.
    scan.decks[deck.id].met += idx.length;
    const g = scan.groups.find(x => x.id === scan.decks[deck.id].group);
    if (g) g.met += idx.length;
  }
  return out; // array of clusters
}
// Called when a Learn card is actually shown — only then is a word met
// and the deck's unlocked prefix extended.
function pathMeetWord(w) {
  const ws = getWS(w.deckId, w.idx);
  const fresh = introduceWord(ws);
  if (fresh) {
    if ((S.unlocked[w.deckId] || 0) < w.idx + 1) S.unlocked[w.deckId] = w.idx + 1;
    S.path.lastDeck = w.deckId;
    invalidatePathScan();
    if (typeof questEvent === "function") questEvent("met", { w });
  }
  return fresh;
}

// ── PACE ──────────────────────────────────────
function pathRollDay() {
  const P = S.path, today = studyToday();
  if (P.day !== today) { P.day = today; P.extraToday = 0; P.spotToday = 0; }
}
// Auto-pause after AUTO_PAUSE_DAYS missed days with reviews waiting;
// it lifts by itself once the backlog is back under THROTTLE_HALF.
function pathCheckAutoPause(scan = pathScan()) {
  const P = S.path, today = studyToday();
  if (P.autoPaused && scan.overdue < PATH.THROTTLE_HALF * (pathDeadlineOn() ? 2 : 1)) { P.autoPaused = false; P.autoPausedOn = ""; }
  if (!P.autoPaused && P.lastActiveDay && scan.due > 0) {
    const missed = daysBetween(P.lastActiveDay, today) - 1;
    if (missed >= PATH.AUTO_PAUSE_DAYS) { P.autoPaused = true; P.autoPausedOn = today; }
  }
}
function pathMarkActive() { S.path.lastActiveDay = studyToday(); }
// { quota, left, reason } — today's new-word allowance.
function pathNewQuota(scan = pathScan()) {
  pathRollDay();
  const P = S.path;
  const plan = pathEnsurePlan(scan);
  let base = plan ? plan.pace : P.newPerDay;
  // With a finish date the plan works backlogs down over a week, so the
  // brakes only kick in at twice the usual pile.
  const k = plan ? 2 : 1;
  let reason = "";
  if (!pathFrontier(scan)) return { quota: 0, left: 0, reason: "done" };
  if (P.autoPaused) { base = 0; reason = "autopaused"; }
  else if (base === 0) reason = "paused";
  else if (scan.overdue >= PATH.THROTTLE_STOP * k) { base = 0; reason = "catchup"; }
  else if (scan.overdue >= PATH.THROTTLE_HALF * k) { base = Math.ceil(base / 2); reason = "slowed"; }
  const quota = base + (P.extraToday || 0);
  return { quota, left: Math.max(0, quota - scan.metToday), reason };
}
function pathLearnExtra() {
  pathRollDay();
  S.path.extraToday = (S.path.extraToday || 0) + PATH.EXTRA_NEW;
  saveState();
  logEvent("extra_new", {});
}
function setPathNewPerDay(n) {
  if (!PATH.NEW_PER_DAY_OPTIONS.includes(n)) return;
  S.path.newPerDay = n;
  if (n > 0) { S.path.autoPaused = false; }
  saveState();
  logEvent("setting", { k: "newPerDay", v: n });
}
// ── FINISH DATE (optional) ────────────────────
// With S.path.deadline set, the day's numbers are worked out once each
// morning: new words from the words left and the days left (LAG days
// kept for the last words to reach Known, plus slack), reviews from
// what's due (a backlog from missed days is spread over the next days).
// The quests are sized from them, so doing the 4 quests = on time.
const PLAN = { LAG: 75, MIN_PACE: 5, MAX_PACE: 30, SPREAD: 7, SMALL_BACKLOG: 20, GOAL_MIN: 50, GOAL_MAX: 300 };
function pathDeadlineOn() { return !!(S.path && S.path.deadline); }
function pathDaysLeft(today = studyToday()) { return pathDeadlineOn() ? daysBetween(today, S.path.deadline) : 0; }
function pathUnmet(scan = pathScan()) { return scan.total - scan.met; }
// New words a day needed from here, uncapped (for the "out of reach" note).
function pathPaceNeeded(scan = pathScan(), today = studyToday()) {
  const unmet = pathUnmet(scan);
  if (!unmet) return 0;
  return Math.ceil(unmet / Math.max(14, pathDaysLeft(today) - PLAN.LAG));
}
function pathPace(scan = pathScan(), today = studyToday()) {
  if (!pathUnmet(scan)) return 0;
  return Math.max(PLAN.MIN_PACE, Math.min(PLAN.MAX_PACE, pathPaceNeeded(scan, today)));
}
// Today's frozen plan, or null when no finish date is set.
function pathEnsurePlan(scan) {
  const P = S.path;
  if (!pathDeadlineOn()) return null;
  const today = studyToday();
  if (P.plan && P.plan.day === today && P.plan.deadline === P.deadline) return P.plan;
  scan = scan || pathScan(true);
  const backlog = scan.overdue;
  const pace = pathPace(scan, today);
  // A backlog from missed days is spread out: about a week's worth a day,
  // but never more than +20% on a normal day (after several days away it
  // simply takes up to two weeks to clear).
  const normal = (scan.due - backlog) * 1.1 + pace * 3;
  const take = backlog <= PLAN.SMALL_BACKLOG ? backlog
    : Math.max(Math.ceil(backlog / 14), Math.min(Math.ceil(backlog / PLAN.SPREAD), Math.floor(normal * 0.2 / 1.1)));
  const reviews = scan.due - backlog + take;
  const target = Math.max(5, Math.round((reviews * 1.1 + pace * 3) / 5) * 5);
  P.plan = { day: today, deadline: P.deadline, pace, reviews, leave: backlog - take, target,
    goal: Math.max(PLAN.GOAL_MIN, Math.min(PLAN.GOAL_MAX, Math.round(target / 10) * 10)) };
  logEvent("plan", { pace, reviews, target, backlog });
  return P.plan;
}
// Everything today's plan asked for is done: reviews down to the part
// of the backlog left for later days, and today's new words met.
function pathPlanDone(scan = pathScan()) {
  const plan = pathEnsurePlan(scan);
  if (!plan) return false;
  return scan.due <= plan.leave && pathNewQuota(scan).left === 0;
}
function setPathDeadline(iso) {
  const P = S.path;
  if (iso && !/^\d{4}-\d{2}-\d{2}$/.test(iso)) return;
  if (iso && daysBetween(studyToday(), iso) < 30) iso = addDays(studyToday(), 30);
  P.deadline = iso || "";
  P.plan = null;
  invalidatePathScan();
  saveState();
  logEvent("setting", { k: "deadline", v: P.deadline });
}
function pathResume() { S.path.autoPaused = false; S.path.autoPausedOn = ""; if (!S.path.newPerDay) S.path.newPerDay = PATH.NEW_PER_DAY_DEFAULT; saveState(); }

// ── REVIEW CANDIDATES ─────────────────────────
// Words that need attention now, most urgent first:
//   fix (🩹 repair, ⚠️ flag, relearn from an earlier day) → due reviews
//   (lowest stage first, then most overdue).
function pathReviewCandidates(now = Date.now()) {
  const fix = [], due = [];
  vocabGroups().forEach(g => g.decks.forEach(d => {
    for (let i = 0; i < d.words.length; i++) {
      const ws = S.words[d.id + "_" + i];
      if (!ws || !ws.st || (ws.st >= STAGE_LOCKED && !ws.rp && !ws.fl && !(ws.dueAt && ws.dueAt <= now))) continue;
      if (ws.rp || ws.fl || ws.lrn) fix.push({ d, i, ws });
      else if (ws.dueAt && ws.dueAt <= now) due.push({ d, i, ws });
    }
  }));
  fix.sort((a, b) => (b.ws.rp || 0) - (a.ws.rp || 0) || (a.ws.dueAt || 0) - (b.ws.dueAt || 0));
  due.sort((a, b) => a.ws.st - b.ws.st || a.ws.dueAt - b.ws.dueAt);
  return { fix, due };
}
function pathSpotCandidates(n = 1, rng = Math.random) {
  const out = [];
  const cutoff = Date.now() - 14 * 864e5;
  vocabGroups().forEach(g => g.decks.forEach(d => {
    for (let i = 0; i < d.words.length; i++) {
      const ws = S.words[d.id + "_" + i];
      const last = Math.max(ws ? ws.spotAt || 0 : 0, ws ? ws.sAt || 0 : 0);
      if (ws && ws.st >= STAGE_LOCKED && !ws.rp && !(ws.dueAt && ws.dueAt <= Date.now()) && last < cutoff) out.push(pathWord(d.id, i));
    }
  }));
  return seededShuffle(out, rng).slice(0, n);
}

// ── ITEM FORMAT ───────────────────────────────
// What kind of exercise a review becomes, by stage (drill-first):
//   st ≤ 1  choice (either direction) or listen-pick
//   st 2–4  typed (hint allowed below 4)
//   st ≥ 5  typed; every second review typed into its example sentence;
//           ⭐+ sometimes reversed (type the meaning)
function pathItemFor(w, ws, rng = Math.random) {
  const st = ws ? ws.st || 0 : 0;
  if (ws && (ws.rp || ws.lrn || ws.fl)) return { t: "typed", w, fix: true };
  if (st >= STAGE_LOCKED) return { t: "spot", w, maint: true };
  if (st <= 1) {
    if (audioOk() && rng() < 0.25) return { t: "listen", w };
    return { t: "choice", w, rev: rng() < 0.5 };
  }
  if (st >= STAGE_KNOWN) {
    const canCloze = !!clozeTarget(w);
    ws.czAlt = !ws.czAlt; // alternate between plain and sentence recall
    if (st >= STAGE_STRONG && rng() < 0.25) return { t: "reverse", w };
    if (canCloze && ws.czAlt) return { t: "cloze", w };
  }
  return { t: "typed", w, hintOk: st < 4 };
}
// The sentence gap for a word, with the exact hidden text to type.
const _clozeTargetCache = new Map();
function clozeTarget(w) {
  const k = w.deckId + "_" + w.idx + "|" + w[WORD_KEY];
  if (_clozeTargetCache.has(k)) return _clozeTargetCache.get(k);
  const info = buildHintInfo(w, true);
  const res = info && info.answer && info.answer.length <= 40 ? info : null;
  _clozeTargetCache.set(k, res);
  return res;
}

// ── FOCUS SESSIONS ────────────────────────────
// Quests can open a session on a slice of your words: one deck, one
// level, a part of speech, the hard ones, the dusty ones… Due words of
// the slice come first; the rest is practice (stats and quests count,
// stages only move for due words — same rules as everywhere).
function focusWords(focus, param) {
  const now = Date.now();
  const out = [];
  const miss = new Set((S.quests && S.quests.missedYesterday) || []);
  vocabGroups().forEach(g => g.decks.forEach(d => {
    if (focus === "deck" && d.id !== param) return;
    if (focus === "level" && g.id !== param) return;
    for (let i = 0; i < d.words.length; i++) {
      const ws = S.words[d.id + "_" + i];
      if (!ws || !ws.st) continue;
      let keep = true;
      if (focus === "pos") keep = posOf({ ...d.words[i], deckId: d.id, idx: i }) === param;
      else if (focus === "hard") keep = isStruggling(ws) || !!ws.rp || !!ws.fl;
      else if (focus === "stale30") keep = !!ws.lastAnsweredAt && now - ws.lastAnsweredAt > 30 * 864e5;
      else if (focus === "oldest") keep = ws.st >= STAGE_KNOWN && ws.st < STAGE_LOCKED;
      else if (focus === "comeback") keep = miss.has(d.id + "_" + i);
      else if (focus === "reverse") keep = ws.st >= 4;
      else if (focus === "cloze") keep = ws.st >= 3 && !!clozeTarget(pathWord(d.id, i));
      else if (focus === "spot") keep = ws.st >= STAGE_LOCKED;
      else if (focus === "rescue") keep = ws.st < (ws.pk || 0);
      if (keep) out.push({ d, i, ws, due: isDue(ws, now) });
    }
  }));
  const byDue = (a, b) => (b.due - a.due) || (a.ws.st - b.ws.st);
  if (focus === "stale") out.sort((a, b) => (a.ws.lastAnsweredAt || 0) - (b.ws.lastAnsweredAt || 0));
  else if (focus === "oldest") out.sort((a, b) => (a.ws.sAt || 0) - (b.ws.sAt || 0));
  else if (focus === "spot") seededShuffle(out, Math.random);
  else out.sort(byDue);
  return out;
}
function focusItem(x, focus) {
  const w = pathWord(x.d.id, x.i);
  if (focus === "reverse") return { t: "reverse", w };
  if (focus === "cloze") return { t: "cloze", w };
  if (focus === "spot") return { t: "spot", w };
  if (x.due) return pathItemFor(w, x.ws);
  return { t: "typed", w, hintOk: x.ws.st < 4 };
}
const FOCUS_LABELS = { deck: "Deck focus", level: "Level focus", pos: "Word-type focus", hard: "The hard ones", stale: "Refresh",
  stale30: "Dust-off", oldest: "Oldest first", comeback: "Comeback", reverse: "Mirror", cloze: "Sentences", spot: "Spot checks",
  rescue: "Rescue", new: "Explorer" };

// ── QUEUE ─────────────────────────────────────
// Builds one session: fixes, due reviews, new-word rituals (learn card →
// choice check → typed recall a few items later), an optional spot
// check on a 💎 word and optional bonus-round offers.
function buildPathQueue(lenKey, opts = {}) {
  const budget = opts.limit || PATH.SESSION_LENGTHS[lenKey] || PATH.SESSION_LENGTHS.regular;
  const rng = Math.random;
  const now = Date.now();
  const scan = pathScan(true);
  pathCheckAutoPause(scan);
  const q = pathNewQuota(scan);
  const focus = opts.focus || "";
  let clusters = [], reviews = [];
  pathRollDay();
  let spots = [];
  if (focus === "new") {
    // Explorer: a bonus cluster from one deck (on top of today's pace).
    const deck = opts.param && getDeck(opts.param);
    const left = deck ? unmetIndices(deck, 99).length : 0;
    const n = Math.min(left, Math.max(3, Math.min(8, q.left || 4)));
    if (n > q.left) { S.path.extraToday = (S.path.extraToday || 0) + (n - q.left); }
    clusters = planNewWords(n, rng, deck ? deck.id : null);
  } else if (focus) {
    reviews = focusWords(focus, opts.param).slice(0, budget).map(x => focusItem(x, focus));
  } else {
    const { fix, due } = pathReviewCandidates(now);
    const reviewsAvail = fix.length + due.length;
    const newSlots = opts.reviewOnly ? 0 : Math.max(Math.round(budget * 0.3), budget - Math.min(reviewsAvail, Math.round(budget * 0.7)));
    // Each new word costs ~3 counted items: a choice check and two
    // spaced typed recalls (successive relearning, criterion 2).
    const newCount = opts.reviewOnly ? 0 : Math.min(q.left, Math.floor(newSlots / 3));
    clusters = planNewWords(newCount, rng);
    const nNew0 = clusters.reduce((s, c) => s + c.length, 0);
    const reviewBudget = Math.max(0, budget - nNew0 * 3);
    reviews = [...fix, ...due].slice(0, reviewBudget).map(x => pathItemFor(pathWord(x.d.id, x.i), x.ws, rng));
    // Spot check (at most 2 a day).
    spots = !opts.reviewOnly && (S.path.spotToday || 0) < 2 && budget >= 15 ? pathSpotCandidates(1, rng) : [];
    // Word of the day (a quest): slip it in once per session.
    const wk = typeof questWotdKey === "function" ? questWotdKey() : null;
    if (wk && !opts.reviewOnly) {
      const di = wk.lastIndexOf("_"), dId = wk.substring(0, di), idx = +wk.slice(di + 1);
      if (getDeck(dId) && isMet(dId, idx) && !reviews.some(r => r.w.deckId === dId && r.w.idx === idx))
        reviews.splice(Math.floor(reviews.length * 0.4), 0, { t: "typed", w: pathWord(dId, idx), wotd: true, hintOk: false });
    }
  }
  const nNew = clusters.reduce((s, c) => s + c.length, 0);

  const out = [];
  const delayed = [];
  let ri = 0, ci = 0;
  const counted = () => out.filter(x => x.t !== "learn" && x.t !== "bonus").length;
  const clusterEvery = clusters.length ? Math.max(4, Math.floor(reviews.length / (clusters.length + 1))) : Infinity;
  let nextClusterAt = Math.min(2, reviews.length);
  const spotAt = Math.floor(budget * 0.6);
  let spotDone = !spots.length;
  let guard = 0;
  while (guard++ < 2000) {
    const pos = counted();
    const di = delayed.findIndex(x => x.minPos <= pos);
    if (di >= 0) { out.push(delayed.splice(di, 1)[0].item); continue; }
    if (!spotDone && pos >= spotAt) { out.push({ t: "spot", w: spots[0] }); spotDone = true; continue; }
    if (ci < clusters.length && pos >= nextClusterAt) {
      const cl = clusters[ci++];
      cl.forEach((w, j) => {
        out.push({ t: "learn", w, fresh: true });
        if (j > 0) out.push({ t: "choice", w: cl[j - 1], fresh: true, rev: rng() < 0.5 });
      });
      out.push({ t: "choice", w: cl[cl.length - 1], fresh: true, rev: rng() < 0.5 });
      const base = counted();
      cl.forEach((w, j) => {
        delayed.push({ minPos: base + 3 + j * 2, item: { t: "typed", w, fresh: true, hintOk: true } });
        delayed.push({ minPos: base + 9 + j * 2, item: { t: "typed", w, fresh: true, second: true } });
      });
      nextClusterAt = base + clusterEvery;
      continue;
    }
    if (ri < reviews.length) { out.push(reviews[ri++]); continue; }
    if (delayed.length) { delayed.sort((a, b) => a.minPos - b.minPos); out.push(delayed.shift().item); continue; }
    if (ci < clusters.length) { nextClusterAt = pos; continue; }
    if (!spotDone) { out.push({ t: "spot", w: spots[0] }); spotDone = true; continue; }
    break;
  }
  // Bonus-round offers (Regular / Long, never in Quiet mode for audio games).
  if (budget >= 30 && !opts.noBonus && !focus) {
    let n = 0;
    for (let i = 0; i < out.length; i++) {
      if (out[i].t === "learn" || out[i].t === "bonus") continue;
      n++;
      if (n % 12 === 0 && i < out.length - 3) { out.splice(i + 1, 0, { t: "bonus" }); i++; }
    }
  }
  return { items: out, budget, newWords: nNew, reviews: reviews.length, quota: q, focus };
}

// ── SUMMARY FOR THE TODAY CARD ────────────────
function pathTodaySummary() {
  const scan = pathScan();
  pathCheckAutoPause(scan);
  const q = pathNewQuota(scan);
  return { scan, due: scan.due, fix: scan.fix, overdue: scan.overdue, newLeft: q.left, quota: q.quota, reason: q.reason,
    frontier: pathFrontier(scan), metToday: scan.metToday };
}

// ── FORECAST / ETA ────────────────────────────
// Rough, honest projections for the map: when every word of a level is
// met, Known, and locked in, at the current pace and assuming reviews
// go well.
function pathEta(groupStats) {
  const perDay = Math.max(1, pathDeadlineOn() ? pathPace() : (S.path.newPerDay || PATH.NEW_PER_DAY_DEFAULT));
  const today = todayISO();
  const scan = pathScan();
  // Words still to meet before this level is finished (earlier levels first).
  let before = 0;
  for (const g of scan.groups) { if (g.id === groupStats.id) break; before += g.total - g.met; }
  const unmet = groupStats.total - groupStats.met;
  const metDays = Math.ceil((before + unmet) / perDay);
  const knownLag = STAGE_DAYS.slice(1, STAGE_KNOWN).reduce((a, b) => a + b, 0) + 1;   // ≈ 14
  const lockLag = knownLag + STAGE_DAYS[STAGE_KNOWN] + STAGE_DAYS[STAGE_STRONG];      // ≈ 58
  return {
    met: unmet ? addDays(today, metDays) : null,
    known: groupStats.known < groupStats.total ? addDays(today, metDays + knownLag) : null,
    locked: groupStats.locked < groupStats.total ? addDays(today, metDays + lockLag) : null,
  };
}
