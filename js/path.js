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

// "Mute until tomorrow" (stored as quietDay): no speech, no sound
// effects, no vibration, no mic and no listening items — until the
// 4 AM rollover. The permanent sound switches are left alone.
function quietActive() { return !!(S.path && S.path.quietDay === todayISO()); }
function toggleQuiet() {
  S.path.quietDay = quietActive() ? "" : todayISO();
  saveState();
  logEvent("quiet", { on: quietActive() });
  if (quietActive() && window.speechSynthesis) try { speechSynthesis.cancel(); } catch (e) {}
  if (typeof onQuietChanged === "function") onQuietChanged();
}
function audioOk() { return ttsOn() && !!window.speechSynthesis; }

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
    let size = Math.min(max - n, PATH.CLUSTER_MIN + Math.floor(rng() * (PATH.CLUSTER_MAX - PATH.CLUSTER_MIN + 1)));
    // Never leave a lone word or two behind — neither at the end of a
    // deck nor at the end of this batch: they join this cluster.
    const deckLeft = scan.decks[deck.id].total - scan.decks[deck.id].met;
    if (deckLeft - size > 0 && deckLeft - size < PATH.CLUSTER_MIN) size = deckLeft;
    else if (max - n - size > 0 && max - n - size < PATH.CLUSTER_MIN) size = max - n;
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
// How many of a deck's last `left` unmet words one Explorer / "finish
// the deck" session takes: never a lone word or two left over for later.
// Up to 8 all at once (7 → 7); up to 12 in two even halves (10 → 5 + 5);
// otherwise the usual batch, which always leaves plenty behind.
function exploreBatchSize(left, want) {
  if (left <= 8) return left;
  if (left <= 12) return Math.ceil(left / 2);
  return Math.min(want, left);
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
const PLAN = { LAG: 75, MIN_PACE: 5, MAX_PACE: 30, SPREAD: 7, SMALL_BACKLOG: 20, GOAL_MIN: 20, GOAL_MAX: 300 };
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
// Today's plan, or null when no finish date is set.
// It is made ONCE, the first time the app is opened in a study day, and
// stays fixed all day: reviews due this morning + today's new words.
// Only changing the finish date recalculates it (keeping the morning's
// reviews). App updates never rebuild a day that has started.
function planTarget(reviews, pace) {
  return Math.max(PLAN.GOAL_MIN, Math.min(PLAN.GOAL_MAX, Math.ceil((reviews * 1.1 + pace * 3) / 10) * 10));
}
function planSyncQuest(plan) {
  const pq = S.quests && S.quests.list && S.quests.list.find(q => q.tpl === "a_plan" && !q.done);
  if (pq) pq.target = plan.target;
}
// The first plan logged today (this morning's numbers), from the usage log.
function morningPlanEvent() {
  if (typeof _usageLog !== "function") return null;
  const t0 = studyDayStart(0);
  return _usageLog().find(e => e.e === "plan" && e.t >= t0 && e.reviews >= 0 && e.pace >= 0) || null;
}
function pathEnsurePlan(scan) {
  const P = S.path;
  if (!pathDeadlineOn()) return null;
  const today = studyToday();
  const prev = P.plan && P.plan.day === today ? P.plan : null;
  if (prev && prev.deadline === P.deadline) {
    if (prev.v >= 4) return prev;
    // One-time repair: earlier versions rebuilt today's plan mid-day.
    // Go back to this morning's reviews and pace.
    const first = morningPlanEvent();
    if (first) { prev.reviews = first.reviews; prev.pace = first.pace; }
    prev.target = prev.goal = planTarget(prev.reviews, prev.pace);
    prev.v = 4;
    planSyncQuest(prev);
    return prev;
  }
  scan = scan || pathScan(true);
  const pace = pathPace(scan, today);
  let reviews, leave;
  if (prev) {
    // Finish date changed today: same morning reviews, new pace.
    reviews = prev.reviews; leave = prev.leave;
  } else {
    // A backlog from missed days is spread out: about a week's worth a
    // day, but never more than +20% on a normal day (after several days
    // away it simply takes up to two weeks to clear).
    const backlog = scan.overdue;
    const normal = (scan.due - backlog) * 1.1 + pace * 3;
    const take = backlog <= PLAN.SMALL_BACKLOG ? backlog
      : Math.max(Math.ceil(backlog / 14), Math.min(Math.ceil(backlog / PLAN.SPREAD), Math.floor(normal * 0.2 / 1.1)));
    // Turned on mid-day: reviews already done today still belong to today.
    reviews = scan.due - backlog + take + pathReviewedToday();
    leave = backlog - take;
  }
  const target = planTarget(reviews, pace);
  P.plan = { v: 4, day: today, deadline: P.deadline, pace, reviews, leave, target, goal: target };
  planSyncQuest(P.plan);
  logEvent("plan", { pace, reviews, target, leave });
  return P.plan;
}
// Reviews already done today: words that were due and got answered and
// rescheduled today (not today's new words, not ones still being fixed).
function pathReviewedToday() {
  const t0 = studyDayStart(0), today = studyToday();
  let n = 0;
  for (const ws of Object.values(S.words)) {
    if (ws && ws.st && ws.sAt >= t0 && ws.lastAnsweredAt >= t0 && ws.metOn !== today && !ws.lrn && !ws.rp) n++;
  }
  return n;
}
function setPathDeadline(iso) {
  const P = S.path;
  if (iso && !/^\d{4}-\d{2}-\d{2}$/.test(iso)) return;
  if (iso && daysBetween(studyToday(), iso) < 30) iso = addDays(studyToday(), 30);
  P.deadline = iso || "";
  // Keep today's plan: pathEnsurePlan sees the new date and redoes only
  // the pace, keeping this morning's reviews.
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
//   st 2–4  typed
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
  return { t: "typed", w };
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
      if (!ws || !ws.st || ws.sk) continue;
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
  return { t: "typed", w };
}
const FOCUS_LABELS = { deck: "Deck focus", level: "Level focus", pos: "Word-type focus", hard: "The hard ones", stale: "Refresh",
  stale30: "Dust-off", oldest: "Oldest first", comeback: "Comeback", reverse: "Mirror", cloze: "Sentences", spot: "Spot checks",
  rescue: "Rescue", new: "Explorer" };

// ── QUESTS THE SESSION CAN MOVE ───────────────
// Start is the one button: besides today's due and new words it leans
// towards your open quests — words for focus quests (the hard ones, a
// deck, verbs…) and, as the bonus round, the game a quest asks for.
const PATH_BONUS_IDS = ["gender", "match", "blitz", "cloze", "rain", "truefalse", "listen", "conj", "cases"];
function questNudges() {
  const out = { focus: [], games: [], quests: [] };
  if (!S.quests || !S.quests.list || typeof byId !== "function") return out;
  const list = S.quests.list.concat(S.quests.weekend ? [S.quests.weekend] : []);
  list.forEach(q => {
    if (!q || q.done || q.tpl === "d_mystery") return;
    const t = byId(q.tpl); if (!t || !t.go) return;
    let go = ""; try { go = typeof t.go === "function" ? t.go(q) : t.go; } catch (e) { return; }
    const [k, a, b] = String(go).split(":");
    if (k === "focus" && a !== "new") { out.focus.push({ focus: a, param: b }); out.quests.push(q); }
    else if (k === "game" && PATH_BONUS_IDS.includes(a)) { out.games.push(a); out.quests.push(q); }
    else if (k === "path" || k === "quick5") out.quests.push(q);
  });
  return out;
}

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
    const left = deck ? unmetIndices(deck, 999).length : 0;
    const n = exploreBatchSize(left, Math.max(3, Math.min(8, q.left || 4)));
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
    // Words for open focus quests: the spare room, at least a fifth and
    // at most a third of the session, spread through it.
    const nudges = opts.reviewOnly ? null : questNudges();
    if (nudges && nudges.focus.length) {
      // With a finish date, today's plan comes first: quest words only
      // take room the plan's reviews and new words leave free.
      const spare = budget - reviews.length - nNew0 * 3;
      const room = pathDeadlineOn() ? Math.max(0, Math.min(Math.round(budget / 3), spare))
        : Math.min(Math.round(budget / 3), Math.max(Math.round(budget / 5), spare));
      const have = new Set(reviews.map(r => r.w.deckId + "_" + r.w.idx));
      const per = Math.ceil(room / nudges.focus.length), extra = [];
      nudges.focus.forEach(({ focus: f, param }) => {
        focusWords(f, param).filter(x => !have.has(x.d.id + "_" + x.i)).slice(0, per).forEach(x => {
          have.add(x.d.id + "_" + x.i); extra.push(focusItem(x, f));
        });
      });
      if (extra.length) {
        const step = Math.max(1, Math.floor((reviews.length + extra.length) / extra.length));
        extra.slice(0, room).forEach((it, i) => reviews.splice(Math.min(reviews.length, i * step + 1), 0, it));
      }
    }
    // Spot check (at most 2 a day).
    spots = !opts.reviewOnly && (S.path.spotToday || 0) < 2 && budget >= 15 ? pathSpotCandidates(1, rng) : [];
    // Word of the day (a quest): slip it in once per session.
    const wk = typeof questWotdKey === "function" ? questWotdKey() : null;
    if (wk && !opts.reviewOnly) {
      const di = wk.lastIndexOf("_"), dId = wk.substring(0, di), idx = +wk.slice(di + 1);
      if (getDeck(dId) && isMet(dId, idx) && !reviews.some(r => r.w.deckId === dId && r.w.idx === idx))
        reviews.splice(Math.floor(reviews.length * 0.4), 0, { t: "typed", w: pathWord(dId, idx), wotd: true });
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
        delayed.push({ minPos: base + 3 + j * 2, item: { t: "typed", w, fresh: true } });
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
  // The length you picked is the length you get: once due and new words
  // run out, the rest is practice on your least recently seen words
  // (stages only move for due words, so it's pure extra practice).
  if (!focus && !opts.reviewOnly && !opts.limit) {
    const have = new Set(out.map(x => x.w && x.w.deckId + "_" + x.w.idx));
    const short = budget - counted();
    if (short > 0) focusWords("stale").filter(x => !have.has(x.d.id + "_" + x.i)).slice(0, short)
      .forEach(x => out.push({ ...focusItem(x, "stale"), practice: true }));
  }
  // Every word goes learn → multiple choice → typed: a 🌱 word (stage ≤ 1:
  // a fix, a word of the day, a practice pick…) never meets typing first
  // in a session. A warm-up choice goes a few items before it — no stage
  // change and not counted in the session length.
  const TYPED_T = new Set(["typed", "spot", "cloze", "reverse"]);
  const choiced = new Set();
  for (let i = 0; i < out.length; i++) {
    const it = out[i];
    if (!it.w) continue;
    const k = it.w.deckId + "_" + it.w.idx;
    if (it.t === "choice" || it.t === "listen") { choiced.add(k); continue; }
    if (!TYPED_T.has(it.t) || choiced.has(k)) continue;
    const ws = S.words[k];
    if (ws && (ws.st || 0) >= 2) continue;
    let at = Math.max(0, i - 3);
    for (let j = i - 1; j >= at; j--) if (out[j].t === "learn" && out[j].w && sameWord(out[j].w, it.w)) { at = j + 1; break; }
    out.splice(at, 0, { t: "choice", w: it.w, warm: true, rev: rng() < 0.5 });
    choiced.add(k);
    i++;
  }
  // ⚔️ A minion may show up (≈10% of Regular/Long sessions, once a day).
  if (budget >= 30 && !opts.noBonus && !focus && !grandmaOn() && typeof minionDeckPick === "function"
      && S.games && S.games.minionDay !== todayISO() && Math.random() < MINION_CHANCE) {
    const deck = out.filter(x => x.t !== "learn").length >= 10 ? minionDeckPick() : null;
    if (deck) out.splice(Math.floor(out.length * 0.55), 0, { t: "bonus", minion: deck });
  }
  // Bonus-round offers: one every 9 questions (Quick gets one too;
  // never while muted for audio games; never in Grandma mode).
  if (budget >= 15 && !opts.noBonus && !focus && !grandmaOn()) {
    let n = 0;
    for (let i = 0; i < out.length; i++) {
      if (out[i].t === "learn" || out[i].t === "bonus" || out[i].warm) { if (out[i].minion) n = 0; continue; }
      n++;
      if (n % 9 === 0 && i < out.length - 3) { out.splice(i + 1, 0, { t: "bonus" }); i++; }
    }
  }
  return { items: out, budget, newWords: nNew, reviews: reviews.length, quota: q, focus };
}

// ── SKIP A LEVEL (⚙️ › 🍪 Cookie) ──────────────
// "I already know A1": every word of the first level that still has
// words below 🌳 Known becomes Known, and Start moves straight on to
// new words of the next level. Skipped words (ws.sk) are treated as
// known and stay out of the way:
//   • no scheduled reviews (dueAt null) — they never fill a session;
//   • left out of extra practice, focus sessions, game pools and quest
//     sizing (focusWords, poolWordsForDeck, questContext);
//   • words learnt today are lifted too and stop counting toward
//     today's new-word quota, so Start brings new words of the next
//     level right away; quests keep their own counters untouched;
//   • no XP, goal, streak, saga or achievement credit (srs.js clears
//     sk only when a skipped word is later answered right, e.g. when
//     you practise it on purpose in the Library).
function skipLevelInfo() {
  const groups = vocabGroups();
  for (let gi = 0; gi < groups.length; gi++) {
    const g = groups[gi];
    let lift = 0;
    g.decks.forEach(d => d.words.forEach((w, i) => {
      const ws = S.words[d.id + "_" + i];
      if (!ws || (ws.st || 0) < STAGE_KNOWN) lift++;
    }));
    if (lift) return { id: g.id, name: g.name, lift, next: (groups[gi + 1] || {}).name || "" };
  }
  return null;
}
function skipLevel(groupId) {
  const g = vocabGroups().find(x => x.id === groupId);
  if (!g) return 0;
  const today = studyToday(), now = Date.now();
  let n = 0;
  g.decks.forEach(d => {
    d.words.forEach((w, i) => {
      const prev = S.words[d.id + "_" + i];
      if (prev && (prev.st || 0) >= STAGE_KNOWN) return;
      const ws = getWS(d.id, i);
      const met = !!ws.st;
      ws.st = STAGE_KNOWN;
      ws.pk = Math.max(ws.pk || 0, STAGE_KNOWN);
      ws.sAt = now;
      ws.dueAt = null;   // known: no reviews scheduled
      ws.mastered = true;
      ws.sk = met ? 1 : 2; // skipped, not answered (see srs.js)
      if (ws.metOn === today) delete ws.metOn; // frees today's new-word quota
      ["rp", "lrn", "fl", "cf", "rc", "dropDay"].forEach(f => delete ws[f]);
      n++;
    });
    S.unlocked[d.id] = d.words.length;
  });
  invalidatePathScan();
  logEvent("skip_level", { g: groupId, n });
  saveState();
  return n;
}
// Skipped words are known — they never fill a session or a game.
function isSkipped(ws) { return !!(ws && ws.sk); }

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
