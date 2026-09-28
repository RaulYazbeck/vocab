// ── DAILY QUESTS · RANDOM EVENTS · CHESTS ─────
// Four quests a day, drawn at random from ~100 templates (one per
// slot), sized so that finishing all four ≈ the daily goal (S.dailyGoal,
// set in Settings). No day themes: every day is a fresh draw, with
// rules behind the randomness so it stays fair:
//   • anti-repeat — no template within 5 days, one per family per day
//   • feasibility — nothing you can't do today (no repair quest with
//     nothing to repair, no time window that's already passed, …)
//   • balance — families not seen for 6 days get a boost
//   • recall ≥ 60% of the day, games ≤ 30%
//   • sound/voice never required: audio quests always have a text
//     route, a free 🔇 swap, and are never drawn in Quiet mode
//
// Random events on top: ✨ double-reward quest, ⚡ flash quest, 🍀 lucky
// chest drop (with a pity timer), 🌟 golden words, a weekly 3-chapter
// saga and an optional weekend bonus quest.
//
// State: S.quests (meta doc, synced) — small aggregates only.

const QUEST_SLOTS = ["A", "B", "C", "D"];
const QUEST_SLOT_INFO = {
  A: { name: "Core", share: 0.45, xp: 50 },
  B: { name: "Growth", share: 0.15, xp: 40 },
  C: { name: "Arcade", share: 0.25, xp: 40 },
  D: { name: "Wildcard", share: 0.15, xp: 60 },
};
const QUEST_NO_REPEAT_DAYS = 5;

function migrateQuests() {
  if (!S.quests || typeof S.quests !== "object") S.quests = {};
  const Q = S.quests;
  if (typeof Q.day !== "string") Q.day = "";
  if (!Array.isArray(Q.list)) Q.list = [];
  if (!Array.isArray(Q.history)) Q.history = [];
  if (!Q.m || typeof Q.m !== "object") Q.m = freshQuestCounters();
  if (!Array.isArray(Q.qdays)) Q.qdays = [];
  if (!Array.isArray(Q.frozen)) Q.frozen = [];
  if (!(Q.freezes >= 0)) Q.freezes = 0;
  if (!(Q.tokens >= 0)) Q.tokens = 0;
  if (!(Q.boosts >= 0)) Q.boosts = 0;
  if (!Q.chest || typeof Q.chest !== "object") Q.chest = { opened: 0, sinceRare: 0, sinceEpic: 0, sinceLeg: 0 };
  if (!Array.isArray(Q.pending)) Q.pending = [];
  if (!Q.cos || typeof Q.cos !== "object") Q.cos = { owned: [], on: {} };
  if (!Array.isArray(Q.cos.owned)) Q.cos.owned = [];
  if (!Q.cos.on || typeof Q.cos.on !== "object") Q.cos.on = {};
  if (!(Q.luckySince >= 0)) Q.luckySince = 0;
  if (!Array.isArray(Q.missedYesterday)) Q.missedYesterday = [];
  if (!(Q.prevOk >= 0)) Q.prevOk = 0;
  if (!Q.saga || typeof Q.saga !== "object") Q.saga = null;
  if (!Q.week || typeof Q.week !== "object") Q.week = { key: "", ok: 0, bosses: 0, days: 0, up: 0, stars: 0, games: [], locked: 0, weeklyChest: false };
  if (!(Q.gold >= 0)) Q.gold = 0;
  if (!(Q.lucky >= 0)) Q.lucky = 0;
  if (!(Q.flashes >= 0)) Q.flashes = 0;
  if (!(Q.sagas >= 0)) Q.sagas = 0;
}
function freshQuestCounters() {
  return {
    ok: 0, typed: 0, typedNoHint: 0, typedSinceHint: 0, hints: 0, path: 0, pathAll: 0, game: 0, voice: 0, ear: 0,
    pos: { verb: 0, noun: 0, adj: 0 }, art: 0, rev: 0, cloze: 0, umlaut: 0, fast: 0,
    up: 0, known: 0, strong: 0, locked: 0, repaired: 0, unflagged: 0, rescued: 0, spot: 0, spotRun: 0, spotBest: 0,
    met: 0, metBeforeNoon: 0, metDeck: {}, decks: {}, levels: {}, upDeck: {}, upLevel: {},
    run: 0, bestRun: 0, runs15: 0, cleanStart: 0, cleanBroken: false,
    sessions: [], sittingMax: 0, games: {}, gameDistinct: 0, gold: 0, bonusCleared: 0,
    timerWins: {}, bosses: 0, bossPerfect: 0, bossFast: 0, deckBosses: {}, weakBoss: 0, worldDmg: 0,
    rankUps: 0, rankUpIds: {}, twistWins: 0, dailyDone: 0, mixDone: 0, bests: {}, retro: 0,
    genderRun: 0, plural: 0, conj: 0, builderFirst: 0, matchClean: 0, rainClean: 0, scrambleNoHint: 0,
    typeRushNoHint: 0, tfRun: 0, clozeNoPeek: 0, listenNoReplay: 0, blitzFast: 0, blitzPts: 0, maxCombo: 0, memoryClear: 0,
    missedKeys: [], fixedSameDay: 0, comeback: 0, stale30: 0, hard: 0, focus: {}, wotd: [], b2b: 0, lastGameEnd: 0,
    ankiDone: 0, gCollected: 0, pCollected: 0, coreDoneAt: 0,
  };
}

// ── DAY ROLLOVER ──────────────────────────────
function questEnsureToday() {
  migrateQuests();
  const Q = S.quests, today = todayISO();
  if (Q.day === today && Q.list.length) { questSwapUnusedAnki(); questSwapForSpeak(); return false; }
  // Quests made before the switch to the 4 AM day (00:00–04:00 that one
  // night) belong to the day that's about to start — keep them.
  if (Q.day > today && Q.list.length) return false;
  if (Q.day && Q.day !== today) questCloseDay(Q.day, today);
  Q.day = today;
  Q.m = freshQuestCounters();
  Q.rerolled = false;
  Q.dayDone = false;
  Q.flash = null;
  Q.weekend = null;
  Q.dbl = -1;
  questGenerate();
  questEnsureWeek();
  saveLocalOnly();
  return true;
}
function questCloseDay(prevDay, today) {
  const Q = S.quests;
  const gap = daysBetween(prevDay, today);
  Q.missedYesterday = gap === 1 ? (Q.m.missedKeys || []).slice(0, 60) : [];
  Q.prevOk = gap === 1 ? (Q.m.ok || 0) : 0;
  Q.history.push({ day: prevDay, tpls: Q.list.map(q => q.tpl) });
  if (Q.history.length > 21) Q.history = Q.history.slice(-21);
  // Streak freezes: missed days since the last full day are covered
  // while freezes last (only when there is a streak to protect).
  if (questStreak(prevDay) > 0 || Q.qdays.includes(prevDay)) {
    for (let d = addDays(prevDay, Q.qdays.includes(prevDay) ? 1 : 0); d < today; d = addDays(d, 1)) {
      if (Q.qdays.includes(d) || Q.frozen.includes(d)) continue;
      if (Q.freezes > 0) { Q.freezes--; Q.frozen.push(d); logEvent("freeze_used", { d }); }
      else break;
    }
  }
  if (Q.frozen.length > 60) Q.frozen = Q.frozen.slice(-60);
}
// Consecutive full-quest days (frozen days count) ending today or `from`.
function questStreak(from) {
  const Q = S.quests;
  const days = new Set([...(Q.qdays || []), ...(Q.frozen || [])]);
  let d = from || todayISO();
  if (!days.has(d)) d = addDays(d, -1);
  let n = 0;
  while (days.has(d)) { n++; d = addDays(d, -1); }
  return n;
}
function isoWeekKey(date = new Date()) {
  const d = new Date(date); d.setHours(12, 0, 0, 0);
  d.setDate(d.getDate() - ((d.getDay() + 6) % 7));
  return d.toLocaleDateString("en-CA");
}

// ── CONTEXT FOR THE GENERATOR ─────────────────
function questContext() {
  const scan = pathScan(true);
  const G = getDailyGoal();
  const now = new Date();
  const hour = now.getHours();
  const quota = pathNewQuota(scan);
  const plan = pathEnsurePlan(scan);
  const ctx = {
    G, hour, scan, quota, plan, quiet: quietActive(), audio: audioOk(),
    weekend: [0, 6].includes(now.getDay()), de: !IS_FRENCH_APP,
    struggling: 0, stale30: 0, st4due: 0, st5due: 0, belowPeak: 0, strong: 0, clozeable: 0,
    pos: { verb: 0, noun: 0, adj: 0 }, special: 0, metDecks: [], dueByDeck: {},
    missedYesterday: (S.quests.missedYesterday || []).length, prevOk: S.quests.prevOk || 0,
    frontierIdx: scan.groups.findIndex(g => g.met < g.total),
    ankiOwed: allAnkiDeckIds().length && ankiInUse() ? ankiOwedToday(allAnkiDeckIds()) : 0,
    games: [], gameLast: {}, bossDecks: [],
  };
  const nowMs = Date.now(), dayMs = 864e5;
  const specialRe = IS_FRENCH_APP ? /[éèêàâçôîûùëïœ]/i : /[äöüß]/i;
  vocabGroups().forEach(g => g.decks.forEach(d => {
    let met = 0, known = 0, due = 0;
    for (let i = 0; i < d.words.length; i++) {
      const ws = S.words[d.id + "_" + i];
      if (!ws || !ws.st || ws.sk) continue; // skipped words: not yours to quest on
      met++;
      if (ws.st >= STAGE_KNOWN) known++;
      if (isDue(ws, nowMs)) {
        due++;
        if (ws.st === 4 && !ws.lrn && !ws.rp) ctx.st4due++;
        if (ws.st === 5 && !ws.lrn && !ws.rp) ctx.st5due++;
      }
      if (isStruggling(ws)) ctx.struggling++;
      if (ws.lastAnsweredAt && nowMs - ws.lastAnsweredAt > 30 * dayMs) ctx.stale30++;
      if (ws.st < (ws.pk || 0)) ctx.belowPeak++;
      if (ws.st >= STAGE_STRONG) ctx.strong++;
      if (ws.st >= 3) ctx.clozeable++;
      const w = d.words[i];
      const p = posOf({ ...w, deckId: d.id, idx: i });
      if (p === "verb") ctx.pos.verb++; else if (p === "noun") ctx.pos.noun++; else if (p === "adj") ctx.pos.adj++;
      if (specialRe.test(w[WORD_KEY] || "")) ctx.special++;
    }
    if (met) ctx.metDecks.push({ id: d.id, name: d.name, icon: d.icon, group: g.id, met, known, total: d.words.length, due });
    ctx.dueByDeck[d.id] = due;
  }));
  const pool = buildGamePool(null);
  if (typeof GAMES !== "undefined") GAMES.forEach(g => {
    if (gameRequirement(g, pool, "full").ok && (!g.audio || ctx.audio) && !gameHiddenNow(g)) ctx.games.push(g.id);
  });
  ctx.gameLast = (S.games && S.games.lastPlayed) || {};
  ctx.bossDecks = typeof deckBossesAvailable === "function" ? deckBossesAvailable() : [];
  return ctx;
}
function sz(ctx, share, min, max) { return Math.max(min, Math.min(max || 9999, Math.round(ctx.G * share))); }
function pickFrom(arr, rng) { return arr.length ? arr[Math.floor(rng() * arr.length)] : null; }
function deckName(id) { const d = getDeck(id); return d ? `${d.icon} ${d.name}` : id; }
function groupName(id) { const g = ALL_GROUPS.find(x => x.id === id); return g ? `${g.icon} ${g.name}` : id; }
function gameLabel(id) { const g = typeof getGame === "function" && getGame(id); return g ? `${g.icon} ${gameName(g)}` : id; }
function rankName(r) { return (typeof GAME_RANKS !== "undefined" && GAME_RANKS[r]) ? GAME_RANKS[r].icon + " " + GAME_RANKS[r].name : ""; }

// ── TEMPLATES ─────────────────────────────────
// { id, slot, fam, icon, w, title(q), target(ctx,q), ok(ctx), prog(m,q),
//   params(ctx, rng), go (action), audio: "ear"|"voice" (text route),
//   alt(m,q) (text-route progress, same target ×1.5) }
const QT = [];
function qt(def) { QT.push(Object.assign({ w: 1, ok: () => true, params: () => ({}) }, def)); }
const byId = id => QT.find(t => t.id === id);

// "typed" wording, or its Say-it equivalent with Speak, don't spell on.
function sayOr(typed, said) { return speakOn() ? said : typed; }

// A · CORE — typed recall, the backbone of the day
qt({ id: "a_path", slot: "A", fam: "path", icon: "📖", w: 3, target: c => sz(c, 0.45, 10, 90),
  title: q => `Practise ${q.target} words in Today sessions`, prog: m => m.path, go: "path" });
// With a finish date (Settings), this one always takes the Core slot:
// the day's reviews + new words, sized so the 4 quests keep you on time.
// Its progress is the goal bar's counter (right answers outside games),
// so the two always show the same number. If the due and new words run
// out first, extra practice makes up the rest.
qt({ id: "a_plan", slot: "A", fam: "plan", icon: "📅", w: 0, fixed: true, ok: () => false,
  target: c => c.plan ? c.plan.target : sz(c, 0.45, 10, 90),
  title: q => `Today's plan: ${q.target} right answers`,
  sub: () => { const p = S.path.plan; const parts = [];
    if (p && p.day === studyToday()) parts.push(`${p.reviews} reviews + ${p.pace} new words`);
    if (S.path.deadline && pathDaysLeft() >= 0) parts.push(`on course for ${fmtShortDate(S.path.deadline)}`);
    return parts.join(" · "); },
  prog: m => m.ok, go: "path" });
qt({ id: "a_typed", slot: "A", fam: "typed", icon: "⌨️", w: 3, target: c => sz(c, 0.45, 10, 90),
  title: q => speakOn() ? `Recall ${q.target} words out loud (any mode)` : `Type ${q.target} correct answers (any mode)`, prog: m => m.typed, go: "path" });
qt({ id: "a_clear", slot: "A", fam: "clear", icon: "🧹", w: 2,
  ok: c => c.scan.due >= 8 && c.scan.due <= Math.max(12, c.G * 0.6), target: c => c.scan.due,
  title: q => `Clear every review due today (${q.target})`,
  prog: (m, q) => Math.max(0, q.target - pathScan().due), go: "path" });
qt({ id: "a_nohint", slot: "A", fam: "nohint", icon: "🙈", w: 2, target: c => sz(c, 0.35, 8, 60),
  title: q => `${q.target} ${sayOr("typed answers", "words recalled")} without a hint`, prog: m => m.typedNoHint, go: "path" });
qt({ id: "a_twosess", slot: "A", fam: "sessions", icon: "🕰️", w: 1.5, ok: c => c.hour < 17, target: () => 2,
  title: () => `Two Today sessions at least 3 hours apart`,
  prog: m => { const t = m.sessions.filter(s => !s.ab && s.n >= 8).map(s => s.t); if (!t.length) return 0;
    return t.some(a => t.some(b => b - a >= 3 * 3600e3)) ? 2 : 1; }, go: "path" });
qt({ id: "a_weakdeck", slot: "A", fam: "deck", icon: "🎯", w: 2,
  ok: c => c.metDecks.some(d => d.met >= 8 && d.known < d.met),
  params: (c, rng) => { const ds = c.metDecks.filter(d => d.met >= 8 && d.known < d.met).sort((a, b) => a.known / a.met - b.known / b.met);
    return { deck: (ds[Math.floor(rng() * Math.min(3, ds.length))] || ds[0]).id }; },
  target: (c, q) => Math.min(sz(c, 0.25, 8, 40), (c.metDecks.find(d => d.id === q.p.deck) || { met: 10 }).met * 2),
  title: q => `Your weakest deck: ${q.target} correct in ${deckName(q.p.deck)}`, prog: (m, q) => m.decks[q.p.deck] || 0,
  go: q => `focus:deck:${q.p.deck}` });
qt({ id: "a_deck", slot: "A", fam: "deck", icon: "🗂️", w: 1.5, ok: c => c.metDecks.some(d => d.met >= 10),
  params: (c, rng) => ({ deck: pickFrom(c.metDecks.filter(d => d.met >= 10), rng).id }),
  target: (c, q) => Math.min(sz(c, 0.25, 8, 40), (c.metDecks.find(d => d.id === q.p.deck) || { met: 10 }).met * 2),
  title: q => `${q.target} correct from ${deckName(q.p.deck)}`, prog: (m, q) => m.decks[q.p.deck] || 0,
  go: q => `focus:deck:${q.p.deck}` });
qt({ id: "a_timer2", slot: "A", fam: "timer", icon: "⏱", w: 1.5, ok: c => c.scan.met >= 25, target: () => 2,
  title: () => `Beat a 25-word Timer twice`, prog: m => (m.timerWins[25] || 0) + (m.timerWins[50] || 0), go: "timer:25" });
qt({ id: "a_cloze", slot: "A", fam: "sentence", icon: "📝", w: 1.5, ok: c => c.clozeable >= 15, target: c => sz(c, 0.15, 6, 25),
  title: q => `${q.target} sentence answers (${sayOr("type the word into its sentence", "say the missing word")})`, prog: m => m.cloze, go: "focus:cloze" });
qt({ id: "a_reverse", slot: "A", fam: "reverse", icon: "🔁", w: 1, ok: c => c.scan.known >= 15, target: c => sz(c, 0.1, 6, 20),
  title: q => speakOn() ? `${q.target} listening answers (hear the word, say its meaning)` : `${q.target} reversed answers (see the word, type its meaning)`, prog: m => m.rev, go: "focus:reverse" });
qt({ id: "a_long", slot: "A", fam: "sessions", icon: "🏃", w: 1, ok: c => c.G >= 50, target: () => 1,
  title: () => `Finish a Long session`, prog: m => m.sessions.filter(s => s.len === "long" && !s.ab).length, go: "path:long" });
qt({ id: "a_runs", slot: "A", fam: "run", icon: "🔗", w: 1.5, target: c => 2, params: c => ({ len: c.G >= 50 ? 15 : 8 }),
  title: q => `Two runs of ${q.p.len} correct in a row`, prog: (m, q) => q.p.len === 15 ? m.runs15 : Math.min(2, m.runs15 + (m.bestRun >= 8 ? 1 : 0)), go: "path" });
qt({ id: "a_acc", slot: "A", fam: "accuracy", icon: "🎯", w: 1.5, target: c => sz(c, 0.3, 10, 60),
  title: q => `${q.target} answers at 90%+ accuracy`, sub: m => m.pathAll ? `now ${Math.round(m.path / m.pathAll * 100)}%` : "",
  prog: (m, q) => m.pathAll && m.path / m.pathAll >= 0.9 ? m.pathAll : Math.min(m.pathAll, q.target - 1), go: "path" });
qt({ id: "a_nohintday", slot: "A", fam: "nohint", icon: "🧠", w: 1, target: c => sz(c, 0.3, 10, 60),
  title: q => `No-hint streak: ${q.target} ${sayOr("typed answers", "words recalled")} since your last hint`, prog: m => m.typedSinceHint, go: "path" });
qt({ id: "a_refresh", slot: "A", fam: "stale", icon: "🧺", w: 1.5, ok: c => c.scan.met >= 30, target: c => sz(c, 0.2, 10, 40),
  title: q => `Refresh: ${q.target} of your least recently seen words`, prog: m => m.focus.stale || 0, go: "focus:stale" });
qt({ id: "a_lookback", slot: "A", fam: "level", icon: "🔙", w: 1.5, ok: c => c.frontierIdx > 0,
  params: (c, rng) => ({ g: c.scan.groups[Math.floor(rng() * c.frontierIdx)].id }), target: c => sz(c, 0.2, 10, 40),
  title: q => `Look back: ${q.target} words from ${groupName(q.p.g)}`, prog: (m, q) => m.levels[q.p.g] || 0, go: q => `focus:level:${q.p.g}` });
qt({ id: "a_verbs", slot: "A", fam: "pos", icon: "🏃", w: 1, ok: c => c.pos.verb >= 15, target: c => sz(c, 0.15, 8, 30),
  title: q => `${q.target} verbs ${sayOr("typed", "recalled")} right`, prog: m => m.pos.verb, go: "focus:pos:verb" });
qt({ id: "a_nouns", slot: "A", fam: "pos", icon: "🏷️", w: 1, ok: c => c.pos.noun >= 15, target: c => sz(c, 0.15, 8, 30),
  title: q => `${q.target} nouns ${sayOr("typed", "said")} with the right article`, prog: m => m.art, go: "focus:pos:noun" });
qt({ id: "a_adj", slot: "A", fam: "pos", icon: "🎨", w: 1, ok: c => c.pos.adj >= 15, target: c => sz(c, 0.13, 8, 25),
  title: q => `${q.target} adjectives ${sayOr("typed", "recalled")} right`, prog: m => m.pos.adj, go: "focus:pos:adj" });
qt({ id: "a_fix", slot: "A", fam: "fix", icon: "🔧", w: 1.2, target: c => c.G >= 50 ? 8 : 4,
  title: q => `Fix ${q.target} mistakes: get right words you missed earlier today`, prog: m => m.fixedSameDay, go: "path" });
qt({ id: "a_fast", slot: "A", fam: "fast", icon: "⚡", w: 1.2, target: c => sz(c, 0.15, 8, 25),
  title: q => speakOn() ? `Quick recall: ${q.target} words in under 5 seconds` : `Quick fingers: ${q.target} typed answers in under 5 seconds`, prog: m => m.fast, go: "path" });
qt({ id: "a_topic", slot: "A", fam: "deck", icon: "🔎", w: 1.2, ok: c => c.metDecks.some(d => d.met >= 10),
  params: (c, rng) => ({ deck: pickFrom(c.metDecks.filter(d => d.met >= 10), rng).id }), target: c => sz(c, 0.18, 8, 30),
  title: q => `Topic hunt: ${q.target} correct in ${deckName(q.p.deck)}`, prog: (m, q) => m.decks[q.p.deck] || 0, go: q => `focus:deck:${q.p.deck}` });
qt({ id: "a_sessacc", slot: "A", fam: "accuracy", icon: "💯", w: 1, target: () => 1,
  title: () => `Finish a Today session at 85%+ accuracy`, prog: m => m.sessions.filter(s => !s.ab && s.n >= 10 && s.acc >= 85).length, go: "path" });
qt({ id: "a_twin", slot: "A", fam: "deck", icon: "👯", w: 1, ok: c => c.metDecks.filter(d => d.met >= 8).length >= 2,
  params: (c, rng) => { const ds = seededShuffle(c.metDecks.filter(d => d.met >= 8).slice(), rng); return { d1: ds[0].id, d2: ds[1].id }; },
  target: c => Math.round(sz(c, 0.2, 8, 30) / 2) * 2,
  title: q => `Twin decks: ${q.target / 2} from ${deckName(q.p.d1)} and ${q.target / 2} from ${deckName(q.p.d2)}`,
  prog: (m, q) => Math.min(q.target / 2, m.decks[q.p.d1] || 0) + Math.min(q.target / 2, m.decks[q.p.d2] || 0), go: q => `focus:deck:${q.p.d1}` });
qt({ id: "a_special", slot: "A", fam: "spelling", icon: "✒️", w: 1, spell: true, ok: c => ACCENT_BAR_ON && c.special >= 15, target: c => c.G >= 50 ? 12 : 6,
  title: q => `${q.target} words with ${IS_FRENCH_APP ? "accents" : "ä, ö, ü or ß"} typed exactly right`, prog: m => m.umlaut, go: "path" });
qt({ id: "a_timeattack", slot: "A", fam: "fast", icon: "⏲️", w: 1, target: c => sz(c, 0.25, 10, 40),
  title: q => `Time attack: ${q.target} correct within the first 5 minutes of a session`,
  prog: m => Math.max(0, ...m.sessions.map(s => s.ok5 || 0)), go: "path" });
qt({ id: "a_longhaul", slot: "A", fam: "sitting", icon: "🧗", w: 1, ok: c => c.G >= 20, target: c => sz(c, 0.4, 15, 70),
  title: q => `Long haul: ${q.target} answers in one sitting`, prog: m => m.sittingMax, go: "path:long" });

// B · GROWTH — moving words forward
qt({ id: "b_meet", slot: "B", fam: "meet", icon: "🌱", w: 3, ok: c => c.quota.left >= 3, target: c => c.quota.left,
  title: q => `Meet your ${q.target} new words`, prog: m => m.met, go: "path" });
qt({ id: "b_up", slot: "B", fam: "up", icon: "📈", w: 3, ok: c => c.scan.due >= 8, target: c => Math.min(c.scan.due, sz(c, 0.13, 5, 25)),
  title: q => `Move ${q.target} words up a stage`, prog: m => m.up, go: "path" });
qt({ id: "b_heal", slot: "B", fam: "repair", icon: "🩹", w: 3, ok: c => c.scan.repair >= 1, target: c => c.scan.repair,
  title: q => `Heal every 🩹 word (${q.target})`, prog: m => m.repaired, go: "path" });
qt({ id: "b_known", slot: "B", fam: "known", icon: "🌳", w: 2, ok: c => c.st4due >= 3, target: c => Math.min(c.st4due, 8),
  title: q => `Push ${q.target} words to 🌳 Known`, prog: m => m.known, go: "path" });
qt({ id: "b_strong", slot: "B", fam: "known", icon: "⭐", w: 1.5, ok: c => c.st5due >= 3, target: c => Math.min(c.st5due, 6),
  title: q => `Push ${q.target} words to ⭐ Strong`, prog: m => m.strong, go: "path" });
qt({ id: "b_spot", slot: "B", fam: "spot", icon: "🔍", w: 1.2, ok: c => c.scan.locked >= 5, target: () => 3,
  title: q => `Spot-check ${q.target} 💎 words`, prog: m => m.spot, go: "focus:spot" });
qt({ id: "b_explore", slot: "B", fam: "explore", icon: "🧭", w: 1.5, ok: c => !!pathFrontier(c.scan),
  params: (c, rng) => { const f = pathFrontier(c.scan); const ds = f.decks.filter(d => d.met < d.total); return { deck: pickFrom(ds, rng).id }; },
  target: () => 3, title: q => `Explorer: meet a bonus cluster from ${deckName(q.p.deck)}`,
  prog: (m, q) => m.metDeck[q.p.deck] || 0, go: q => `focus:new:${q.p.deck}` });
qt({ id: "b_finish", slot: "B", fam: "explore", icon: "🏁", w: 2,
  ok: c => { const f = pathFrontier(c.scan); return !!f && f.decks.some(d => d.total - d.met >= 1 && d.total - d.met <= 8); },
  params: (c, rng) => { const f = pathFrontier(c.scan); return { deck: pickFrom(f.decks.filter(d => d.total - d.met >= 1 && d.total - d.met <= 8), rng).id }; },
  target: (c, q) => { const d = c.scan.decks[q.p.deck]; return d.total - d.met; },
  title: q => `Finish ${deckName(q.p.deck)}: meet its last ${q.target} word${q.target > 1 ? "s" : ""}`,
  prog: (m, q) => m.metDeck[q.p.deck] || 0, go: q => `focus:new:${q.p.deck}` });
qt({ id: "b_comeback", slot: "B", fam: "comeback", icon: "🥊", w: 2, ok: c => c.missedYesterday >= 5, target: c => Math.min(10, c.missedYesterday),
  title: q => `Comeback: get right ${q.target} words you missed yesterday`, prog: m => m.comeback, go: "focus:comeback" });
qt({ id: "b_dust", slot: "B", fam: "stale", icon: "🪶", w: 1.5, ok: c => c.stale30 >= 10, target: c => Math.min(15, c.stale30),
  title: q => `Dust-off: review ${q.target} words you haven't seen for 30+ days`, prog: m => m.stale30, go: "focus:stale30" });
qt({ id: "b_crown", slot: "B", fam: "crown", icon: "👑", w: 1.5,
  ok: c => c.metDecks.some(d => d.met === d.total && d.known < d.total && d.known / d.total >= 0.5),
  params: (c, rng) => ({ deck: pickFrom(c.metDecks.filter(d => d.met === d.total && d.known < d.total && d.known / d.total >= 0.5), rng).id }),
  target: (c, q) => Math.min(10, Math.max(3, c.dueByDeck[q.p.deck] || 3)),
  title: q => `Crown hunt: ${q.target} words of ${deckName(q.p.deck)} up a stage`, prog: (m, q) => m.upDeck[q.p.deck] || 0, go: q => `focus:deck:${q.p.deck}` });
qt({ id: "b_flags", slot: "B", fam: "repair", icon: "⚠️", w: 1.5, ok: c => c.scan.flagged >= 2, target: c => c.scan.flagged,
  title: q => `Clear all ⚠️ flags (${q.target})`, prog: m => m.unflagged, go: "path" });
qt({ id: "b_level", slot: "B", fam: "up", icon: "🪜", w: 1.2, ok: c => c.frontierIdx >= 0 && c.scan.due >= 10,
  params: c => ({ g: c.scan.groups[Math.max(0, c.frontierIdx)].id }), target: c => sz(c, 0.1, 5, 15),
  title: q => `Level push: ${q.target} words of ${groupName(q.p.g)} up a stage`, prog: (m, q) => m.upLevel[q.p.g] || 0, go: q => `focus:level:${q.p.g}` });
qt({ id: "b_rescue", slot: "B", fam: "rescue", icon: "🛟", w: 1.5, ok: c => c.belowPeak >= 3, target: c => Math.min(5, c.belowPeak),
  title: q => `Rescue: bring ${q.target} words back to their best stage`, prog: m => m.rescued, go: "focus:rescue" });
qt({ id: "b_gender", slot: "B", fam: "collect", icon: "🎨", w: 1.2, ok: c => c.pos.noun >= 20 && c.games.includes("gender"), target: () => 5,
  title: q => `Collect ${q.target} new nouns for your gender collection`, sub: () => "3 right answers on different days collects a noun",
  prog: m => m.gCollected, go: "game:gender" });
qt({ id: "b_plural", slot: "B", fam: "collect", icon: "🔢", w: 1, ok: c => c.de && c.games.includes("plural"), target: () => 5,
  title: q => `Collect ${q.target} new plurals`, sub: () => "3 right answers on different days collects a plural", prog: m => m.pCollected, go: "game:plural" });
qt({ id: "b_hard", slot: "B", fam: "hard", icon: "🪨", w: 1.5, ok: c => c.struggling >= 5, target: c => Math.min(10, c.struggling),
  title: q => `The hard ones: ${q.target} right from your struggling list`, prog: m => m.hard, go: "focus:hard" });
qt({ id: "b_sweep", slot: "B", fam: "deck", icon: "🧽", w: 1.2, ok: c => Object.values(c.dueByDeck).some(n => n >= 5 && n <= 20),
  params: (c, rng) => ({ deck: pickFrom(Object.keys(c.dueByDeck).filter(k => c.dueByDeck[k] >= 5 && c.dueByDeck[k] <= 20), rng) }),
  target: (c, q) => c.dueByDeck[q.p.deck],
  title: q => `Deck sweep: every due word of ${deckName(q.p.deck)} (${q.target})`,
  prog: (m, q) => Math.max(0, q.target - ((pathScan().decks[q.p.deck] || {}).due || 0)), go: q => `focus:deck:${q.p.deck}` });
qt({ id: "b_oldest", slot: "B", fam: "stale", icon: "🏺", w: 1, ok: c => c.scan.known >= 20, target: () => 10,
  title: q => `Oldest first: review ${q.target} of your longest-known words`, prog: m => m.focus.oldest || 0, go: "focus:oldest" });
qt({ id: "b_anki", slot: "B", fam: "anki", icon: "🃏", w: 1.5, ok: c => c.ankiOwed >= 5, target: () => 1,
  title: () => `Clear today's Anki cards`, prog: m => m.ankiDone, go: "anki" });

// C · ARCADE — games (≤ 30% of the day)
const gameOk = (c, id) => c.games.includes(id);
qt({ id: "c_games", slot: "C", fam: "games", icon: "🎮", w: 3, ok: c => c.games.length >= 2, target: c => sz(c, 0.25, Math.max(3, Math.floor(c.G * 0.3)), 40),
  title: q => `${q.target} correct answers in games`, prog: m => m.game, go: "hub" });
qt({ id: "c_stars", slot: "C", fam: "stars", icon: "⭐", w: 2.5, ok: c => c.games.length >= 1,
  params: (c, rng) => ({ g: pickFrom(c.games.filter(id => id !== "boss"), rng) || c.games[0] }), target: () => 2,
  title: q => `Get 2★ in ${gameLabel(q.p.g)} at your rank`, prog: (m, q) => ((m.games[q.p.g] || {}).stars || 0), go: q => `game:${q.p.g}` });
qt({ id: "c_rankup", slot: "C", fam: "rank", icon: "🏅", w: 1.5, ok: c => c.games.length >= 3, target: () => 1,
  title: () => `Rank up any game`, sub: () => "3★ at your rank unlocks the next", prog: m => m.rankUps, go: "hub" });
qt({ id: "c_rankgame", slot: "C", fam: "rank", icon: "🥇", w: 1.2,
  ok: c => c.games.some(id => typeof gameRankProgress === "function" && gameRankProgress(id).stars === 2),
  params: (c, rng) => ({ g: pickFrom(c.games.filter(id => gameRankProgress(id).stars === 2), rng) }), target: () => 1,
  title: q => `Rank up ${gameLabel(q.p.g)} — you're one star away`, prog: (m, q) => m.rankUpIds[q.p.g] ? 1 : 0, go: q => `game:${q.p.g}` });
qt({ id: "c_combo", slot: "C", fam: "combo", icon: "🔥", w: 1.5, ok: c => c.games.some(id => ["blitz", "rain", "gender", "truefalse"].includes(id)), target: () => 10,
  title: () => `Reach a ×3 combo (10 in a row) in any game`, prog: m => m.maxCombo, go: "game:blitz" });
qt({ id: "c_rainclean", slot: "C", fam: "clean", icon: "☂️", w: 1, ok: c => gameOk(c, "rain"), target: () => 1,
  title: () => `Word Rain without losing a heart (10+ hits)`, prog: m => m.rainClean, go: "game:rain" });
qt({ id: "c_deckboss", slot: "C", fam: "boss", icon: "🐲", w: 1.5, ok: c => c.bossDecks.length > 0,
  params: (c, rng) => ({ deck: pickFrom(c.bossDecks, rng) }), target: () => 1,
  title: q => `Beat ${typeof deckBossName === "function" ? deckBossName(q.p.deck) : "a deck boss"}`, sub: q => deckName(q.p.deck),
  prog: (m, q) => m.deckBosses[q.p.deck] ? 1 : 0, go: q => `boss:${q.p.deck}` });
qt({ id: "c_world", slot: "C", fam: "boss", icon: "🌋", w: 1.2, ok: c => c.scan.met >= 20 && typeof worldBossState === "function", target: () => 15,
  title: q => `Deal ${q.target} damage to the world boss`, prog: m => m.worldDmg, go: "world" });
qt({ id: "c_rediscover", slot: "C", fam: "variety", icon: "🔭", w: 1.5,
  ok: c => c.games.some(id => !c.gameLast[id] || daysBetween(c.gameLast[id], todayISO()) >= 7),
  params: (c, rng) => ({ g: pickFrom(c.games.filter(id => !c.gameLast[id] || daysBetween(c.gameLast[id], todayISO()) >= 7), rng) }), target: () => 1,
  title: q => `Rediscover ${gameLabel(q.p.g)}`, sub: () => "not played for a week", prog: (m, q) => ((m.games[q.p.g] || {}).plays || 0), go: q => `game:${q.p.g}` });
qt({ id: "c_daily", slot: "C", fam: "daily", icon: "📆", w: 1.5, ok: c => c.games.length >= 3, target: () => 1,
  title: () => `Finish the Daily Challenge`, prog: m => m.dailyDone, go: "daily" });
qt({ id: "c_gender", slot: "C", fam: "gender", icon: "🎨", w: 1.5, ok: c => gameOk(c, "gender"), target: c => c.G >= 50 ? 15 : 10,
  title: q => `${q.target} genders right in a row`, prog: m => m.genderRun, go: "game:gender" });
qt({ id: "c_builder", slot: "C", fam: "builder", icon: "🧱", w: 1.2, ok: c => gameOk(c, "builder"), target: () => 5,
  title: q => `${q.target} sentences built on the first try`, prog: m => m.builderFirst, go: "game:builder" });
qt({ id: "c_match", slot: "C", fam: "clean", icon: "🧩", w: 1.2, ok: c => gameOk(c, "match"), target: () => 1,
  title: () => `Clear a Match board with no mistakes`, prog: m => m.matchClean, go: "game:match" });
qt({ id: "c_conj", slot: "C", fam: "conj", icon: "🎰", w: 1.2, ok: c => gameOk(c, "conj"), target: c => c.G >= 50 ? 20 : 10,
  title: q => `${q.target} conjugations right`, prog: m => m.conj, go: "game:conj" });
qt({ id: "c_three", slot: "C", fam: "variety", icon: "🎲", w: 1.5, ok: c => c.games.length >= 4, target: () => 3,
  title: () => `Play 3 different games`, prog: m => Object.keys(m.games).length, go: "hub" });
qt({ id: "c_mix", slot: "C", fam: "variety", icon: "🕹️", w: 1, ok: c => c.games.length >= 3, target: () => 1,
  title: () => `Finish an Arcade Mix`, prog: m => m.mixDone, go: "mix" });
qt({ id: "c_best", slot: "C", fam: "best", icon: "🏆", w: 1.2, ok: c => c.games.some(id => S.games.best[id] !== undefined),
  params: (c, rng) => ({ g: pickFrom(c.games.filter(id => S.games.best[id] !== undefined), rng) }), target: () => 1,
  title: q => `Beat your personal best in ${gameLabel(q.p.g)}`, prog: (m, q) => m.bests[q.p.g] ? 1 : 0, go: q => `game:${q.p.g}` });
qt({ id: "c_twist", slot: "C", fam: "twist", icon: "🌀", w: 1.2, ok: c => c.games.length >= 2, target: () => 1,
  title: () => `Win a round with a twist`, sub: () => "twists pop up at random — or turn one on in the hub", prog: m => m.twistWins, go: "hub" });
qt({ id: "c_gold", slot: "C", fam: "gold", icon: "🌟", w: 1, target: () => 3,
  title: q => `Hit ${q.target} golden words`, sub: () => "they shimmer — in sessions and in games", prog: m => m.gold, go: "hub" });
qt({ id: "c_plural", slot: "C", fam: "plural", icon: "🔢", w: 1.2, ok: c => gameOk(c, "plural"), target: () => 12,
  title: q => `${q.target} plurals right`, prog: m => m.plural, go: "game:plural" });
qt({ id: "c_scramble", slot: "C", fam: "spelling", icon: "🔤", w: 1, spell: true, ok: c => gameOk(c, "scramble"), target: () => 8,
  title: q => `Scramble ${q.target} words without hints`, prog: m => m.scrambleNoHint, go: "game:scramble" });
qt({ id: "c_typerush", slot: "C", fam: "typing", icon: "⌨️", w: 1.2, spell: true, ok: c => gameOk(c, "typerush"), target: c => c.G >= 50 ? 20 : 10,
  title: q => `Type Rush: ${q.target} answers with no hints`, prog: m => m.typeRushNoHint, go: "game:typerush" });
qt({ id: "c_tf", slot: "C", fam: "combo", icon: "✅", w: 1, ok: c => gameOk(c, "truefalse"), target: () => 15,
  title: q => `True / False: ${q.target} in a row`, prog: m => m.tfRun, go: "game:truefalse" });
qt({ id: "c_gap", slot: "C", fam: "sentence", icon: "🕳️", w: 1, ok: c => gameOk(c, "cloze"), target: () => 8,
  title: q => `Gap Fill: ${q.target} right without peeking`, prog: m => m.clozeNoPeek, go: "game:cloze" });
qt({ id: "c_weakboss", slot: "C", fam: "boss", icon: "👾", w: 1.2, ok: c => gameOk(c, "boss"), target: () => 1,
  title: () => `Beat the Weakest-words boss`, prog: m => m.weakBoss, go: "game:boss" });
qt({ id: "c_bossclean", slot: "C", fam: "boss", icon: "🛡️", w: 1, ok: c => gameOk(c, "boss"), target: () => 1,
  title: () => `Win any boss battle without losing a heart`, prog: m => m.bossPerfect, go: "game:boss" });
qt({ id: "c_bonus", slot: "C", fam: "bonus", icon: "🎁", w: 1, ok: c => c.G >= 50, target: () => 3,
  title: q => `Clear ${q.target} bonus rounds inside Today sessions`, prog: m => m.bonusCleared, go: "path:long" });
qt({ id: "c_blitz", slot: "C", fam: "score", icon: "⚡", w: 1, ok: c => gameOk(c, "blitz"), target: () => 300,
  title: q => `Blitz: ${q.target} points in one round`, prog: m => m.blitzPts, go: "game:blitz" });
qt({ id: "c_listen", slot: "C", fam: "ear", icon: "🎧", w: 1, audio: "ear", ok: c => gameOk(c, "listen"), target: () => 10,
  title: q => `Listen & Pick: ${q.target} without replaying`, altTitle: q => `or ${Math.round(q.target * 1.5)} correct in any game`,
  prog: m => m.listenNoReplay, alt: m => m.game, go: "game:listen" });
qt({ id: "c_memory", slot: "C", fam: "clean", icon: "🧠", w: 1, ok: c => gameOk(c, "match") && typeof gameRankOf === "function" && gameRankOf("match") >= 4, target: () => 1,
  title: () => `Clear Match in memory mode`, prog: m => m.memoryClear, go: "game:match" });

// D · WILDCARD — the surprise of the day
qt({ id: "d_mystery", slot: "D", fam: "mystery", icon: "❓", w: 2, target: () => 1,
  title: () => `Mystery quest`, prog: () => 0, go: "path" }); // wraps a hidden quest
qt({ id: "d_clean", slot: "D", fam: "clean", icon: "🧼", w: 1.5, target: c => c.G >= 50 ? 20 : 10,
  title: q => `Clean start: ${q.target} right before your first mistake`, sub: (m, q) => `slipped? ${q.target} in a row later counts too`,
  prog: m => Math.max(m.cleanStart, m.bestRun), go: "path" });
qt({ id: "d_early", slot: "D", fam: "time", icon: "🐦", w: 1, ok: c => c.hour < 8, target: () => 1,
  title: () => `Early bird: finish a session before 9:00`, prog: m => m.sessions.filter(s => !s.ab && new Date(s.t).getHours() < 9).length, go: "path:quick" });
qt({ id: "d_night", slot: "D", fam: "time", icon: "🦉", w: 1, target: () => 1,
  title: () => `Night owl: finish a session after 21:00`, prog: m => m.sessions.filter(s => !s.ab && new Date(s.t).getHours() >= 21).length, go: "path:quick" });
qt({ id: "d_lunch", slot: "D", fam: "time", icon: "🥪", w: 1, ok: c => c.hour < 13, target: () => 1,
  title: () => `Lunch break: a Quick session between 12:00 and 14:00`,
  prog: m => m.sessions.filter(s => !s.ab && [12, 13].includes(new Date(s.t).getHours())).length, go: "path:quick" });
qt({ id: "d_perfect", slot: "D", fam: "accuracy", icon: "💎", w: 1, target: () => 1,
  title: () => `A perfect Quick session (100%)`, prog: m => m.sessions.filter(s => s.len === "quick" && !s.ab && s.n >= 10 && s.acc === 100).length, go: "path:quick" });
qt({ id: "d_run", slot: "D", fam: "run", icon: "🔗", w: 1.5, target: c => c.G >= 50 ? 15 : 8,
  title: q => `${q.target} ${sayOr("typed answers", "words recalled")} in a row without a miss`, prog: m => m.bestRun, go: "path" });
qt({ id: "d_blitzfast", slot: "D", fam: "fast", icon: "💨", w: 1, ok: c => gameOk(c, "blitz"), target: () => 10,
  title: q => `Blitz: ${q.target} answers under 2 seconds each`, prog: m => m.blitzFast, go: "game:blitz" });
qt({ id: "d_spotrun", slot: "D", fam: "spot", icon: "🔍", w: 1, ok: c => c.scan.locked >= 8, target: () => 5,
  title: q => `${q.target} spot checks in a row, no slips`, prog: m => m.spotBest, go: "focus:spot" });
qt({ id: "d_bossfast", slot: "D", fam: "boss", icon: "⏱️", w: 1, ok: c => gameOk(c, "boss"), target: () => 1,
  title: () => `Defeat a boss in under 60 seconds`, prog: m => m.bossFast, go: "game:boss" });
qt({ id: "d_chain", slot: "D", fam: "chain", icon: "⛓️", w: 1, target: () => 3,
  title: () => `Chain: finish Core → Growth → Arcade, in that order`, sub: () => "out of order? finishing all three still counts",
  prog: () => { const L = S.quests.list; const t = s => (L.find(q => q.slot === s) || {}).doneAt || 0;
    const a = t("A"), b = t("B"), c = t("C"); return (a ? 1 : 0) + (b ? 1 : 0) + (c ? 1 : 0); }, go: "path" });
qt({ id: "d_speedrun", slot: "D", fam: "fast", icon: "🏎️", w: 1, target: () => 1,
  title: () => `Speed run: a Quick session in under 4 minutes`, prog: m => m.sessions.filter(s => s.len === "quick" && !s.ab && s.n >= 10 && s.ms < 240000).length, go: "path:quick" });
qt({ id: "d_wotd", slot: "D", fam: "wotd", icon: "📌", w: 1.5, ok: c => c.scan.met >= 20,
  params: (c, rng) => { const cands = [];
    vocabGroups().forEach(g => g.decks.forEach(d => d.words.forEach((w, i) => { const ws = S.words[d.id + "_" + i]; if (ws && ws.st >= 2 && ws.st <= 4) cands.push(d.id + "_" + i); })));
    return { key: pickFrom(cands, rng) }; },
  target: () => 3, title: q => { const k = q.p.key || ""; const d = k.substring(0, k.lastIndexOf("_")), i = +k.slice(k.lastIndexOf("_") + 1);
    const w = getDeck(d) && getDeck(d).words[i]; return `Word of the day: “${w ? escapeHtml(w.en) : "?"}” right in 3 different sessions`; },
  prog: m => m.wotd.length, go: "path" });
qt({ id: "d_treasure", slot: "D", fam: "gold", icon: "🗺️", w: 1.2, target: () => 1,
  title: () => `Treasure hunt: find a 🌟 golden word`, sub: () => "golden words turn up more often today", prog: m => m.gold, go: "path" });
qt({ id: "d_earlycore", slot: "D", fam: "time", icon: "🌅", w: 1, ok: c => c.hour < 10, target: () => 1,
  title: () => `Early finisher: complete your Core quest before noon`, sub: () => "reward: your daily chest is at least Rare",
  prog: () => { const a = S.quests.list.find(q => q.slot === "A"); return a && a.doneAt && new Date(a.doneAt).getHours() < 12 ? 1 : 0; }, go: "path" });
qt({ id: "d_beat", slot: "D", fam: "beat", icon: "📊", w: 1.2, ok: c => c.prevOk >= 10 && c.prevOk <= c.G * 1.3, target: c => c.prevOk + 1,
  title: q => `Beat yesterday: more than ${q.target - 1} correct answers`, prog: m => m.ok + Math.min(m.game, Math.floor(getDailyGoal() * 0.3)), go: "path" });
qt({ id: "d_accstreak", slot: "D", fam: "accuracy", icon: "🎯", w: 1, ok: c => c.G >= 50, target: () => 2,
  title: q => `${q.target} sessions at 90%+ accuracy`, prog: m => m.sessions.filter(s => !s.ab && s.n >= 10 && s.acc >= 90).length, go: "path" });
qt({ id: "d_leastgame", slot: "D", fam: "variety", icon: "🆕", w: 1.2, ok: c => c.games.length >= 3,
  params: (c, rng) => { const plays = S.games.plays || {}; const sorted = c.games.slice().sort((a, b) => (plays[a] || 0) - (plays[b] || 0));
    return { g: sorted[Math.floor(rng() * Math.min(2, sorted.length))] }; },
  target: () => 1, title: q => `Try the game you've played least: ${gameLabel(q.p.g)}`, prog: (m, q) => ((m.games[q.p.g] || {}).plays || 0), go: q => `game:${q.p.g}` });
qt({ id: "d_retro", slot: "D", fam: "twist", icon: "📼", w: 0.8, ok: c => c.games.length >= 2, target: () => 1,
  title: () => `Retro: 3★ at 🥉 Bronze with a twist on`, sub: () => "pick Bronze and a twist in the game's menu", prog: m => m.retro, go: "hub" });
qt({ id: "d_ear", slot: "D", fam: "ear", icon: "👂", w: 1, audio: "ear", target: () => 20,
  title: q => `Listening: ${q.target} words by ear`, altTitle: q => `or ${Math.round(q.target * 1.5)} ${sayOr("typed answers", "words recalled")}`,
  prog: m => m.ear, alt: m => m.typed, go: "game:listen" });
qt({ id: "d_voice", slot: "D", fam: "voice", icon: "🎙️", w: 0.8, audio: "voice", target: () => 20,
  title: q => `Voice: say ${q.target} answers aloud`, altTitle: q => `or ${sayOr("type", "recall")} ${Math.round(q.target * 1.5)}`,
  prog: m => m.voice, alt: m => m.typed, go: "path" });
qt({ id: "d_b2b", slot: "D", fam: "variety", icon: "🔂", w: 1, ok: c => c.games.length >= 2, target: () => 1,
  title: () => `Double trouble: two games back to back`, prog: m => m.b2b, go: "hub" });
qt({ id: "d_mirror", slot: "D", fam: "reverse", icon: "🪞", w: 1, ok: c => c.scan.known >= 15, target: () => 15,
  title: q => `Mirror: ${q.target} reversed answers`, prog: m => m.rev, go: "focus:reverse" });
qt({ id: "d_fivedecks", slot: "D", fam: "deck", icon: "🖐️", w: 1.2, ok: c => c.metDecks.length >= 5, target: () => 5,
  title: () => `Five decks: correct answers from 5 different decks`, prog: m => Object.keys(m.decks).length, go: "path" });
qt({ id: "d_earlygrowth", slot: "D", fam: "time", icon: "🌤️", w: 1, ok: c => c.hour < 10 && c.quota.left >= 3, target: c => c.quota.left,
  title: q => `Early growth: meet today's ${q.target} new words before noon`, prog: m => m.metBeforeNoon, go: "path" });
qt({ id: "d_spree", slot: "D", fam: "up", icon: "🎉", w: 1.2, ok: c => c.scan.due >= 10, target: () => 5,
  title: q => `Level-up spree: ${q.target} words up a stage in one session`, prog: m => Math.max(0, ...m.sessions.map(s => s.up || 0)), go: "path" });
qt({ id: "d_bigrun", slot: "D", fam: "run", icon: "🌊", w: 1, ok: c => c.G >= 100, target: () => 25,
  title: q => `Drill streak: ${q.target} correct in a row (Today or Drill)`, prog: m => m.bestRun, go: "path" });
qt({ id: "d_timer50", slot: "D", fam: "timer", icon: "⏳", w: 1, ok: c => c.scan.met >= 60 && c.G >= 100, target: () => 1,
  title: () => `Beat a 50-word Timer`, prog: m => m.timerWins[50] || 0, go: "timer:50" });
qt({ id: "d_ankiwild", slot: "D", fam: "anki", icon: "🃏", w: 1, ok: c => c.ankiOwed >= 5, target: () => 1,
  title: () => `Clear your Anki cards before 18:00`, prog: m => m.ankiDone && new Date().getHours() < 18 ? 1 : (m.ankiDoneBefore18 || 0), go: "anki" });
qt({ id: "d_quickfive", slot: "D", fam: "sessions", icon: "5️⃣", w: 0.8, ok: c => c.scan.due >= 5, target: () => 3,
  title: q => `Snack-sized: ${q.target} Quick Fives across the day`, prog: m => m.sessions.filter(s => s.quick && !s.ab).length, go: "quick5" });

// ── GENERATOR ─────────────────────────────────
function questRecentTpls(days = QUEST_NO_REPEAT_DAYS) {
  const cutoff = addDays(todayISO(), -days);
  return new Set(S.quests.history.filter(h => h.day >= cutoff).flatMap(h => h.tpls));
}
function questRecentFams(days = 6) {
  const cutoff = addDays(todayISO(), -days);
  const s = new Set();
  S.quests.history.filter(h => h.day >= cutoff).forEach(h => h.tpls.forEach(id => { const t = byId(id); if (t) s.add(t.fam); }));
  return s;
}
function questCandidates(slot, ctx, exclude, famsToday) {
  const recent = questRecentTpls();
  const recentFams = questRecentFams();
  return QT.filter(t => t.slot === slot && !exclude.has(t.id) && !famsToday.has(t.fam) && !recent.has(t.id)
    && !(t.audio && (ctx.quiet || !ctx.audio && t.audio === "ear"))
    && !(t.spell && speakOn())
    && (() => { try { return t.ok(ctx); } catch (e) { return false; } })())
    .map(t => ({ t, w: t.w * (recentFams.has(t.fam) ? 1 : 3) }));
}
function makeQuest(t, ctx, rng, slot) {
  let p = {};
  try { p = t.params(ctx, rng) || {}; } catch (e) { p = {}; }
  const q = { tpl: t.id, slot: slot || t.slot, p, prog: 0, done: false, doneAt: 0 };
  let target = 1;
  try { target = t.target(ctx, q); } catch (e) { target = 1; }
  q.target = Math.max(1, Math.round(target || 1));
  return q;
}
function questGenerate(opts = {}) {
  const Q = S.quests;
  const ctx = questContext();
  const rng = seededRandom(hashString(Q.day + "|" + STORAGE_KEY + "|" + (opts.salt || 0)));
  const used = new Set(), fams = new Set();
  const list = [];
  QUEST_SLOTS.forEach(slot => {
    if (slot === "A" && ctx.plan) {
      const t = byId("a_plan");
      used.add(t.id); fams.add(t.fam);
      list.push(makeQuest(t, ctx, rng, slot));
      return;
    }
    let cands = questCandidates(slot, ctx, used, fams);
    if (!cands.length) cands = QT.filter(t => t.slot === slot && !used.has(t.id) && !t.audio && !(t.spell && speakOn()) && (() => { try { return t.ok(ctx); } catch (e) { return false; } })()).map(t => ({ t, w: t.w }));
    const pick = weightedPick(cands, rng);
    const t = pick ? pick.t : byId(slot === "C" ? "c_games" : "a_typed");
    used.add(t.id); fams.add(t.fam);
    const q = makeQuest(t, ctx, rng, slot);
    if (t.id === "d_mystery") {
      const inner = weightedPick(questCandidates("D", ctx, new Set([...used, "d_mystery"]), fams), rng);
      const it = inner ? inner.t : byId("d_run");
      q.hidden = makeQuest(it, ctx, rng, "D");
      fams.add(it.fam);
    }
    list.push(q);
  });
  // ✨ One quest may pay double today (25%).
  Q.dbl = rng() < 0.25 ? Math.floor(rng() * 4) : -1;
  Q.list = list;
  // Weekend: an optional 5th quest from any slot.
  if (ctx.weekend) {
    const cands = QUEST_SLOTS.flatMap(s => questCandidates(s, ctx, used, fams)).filter(x => x.t.id !== "d_mystery");
    const pick = weightedPick(cands, rng);
    Q.weekend = pick ? makeQuest(pick.t, ctx, rng, "W") : null;
  }
  logEvent("quest_gen", { ids: list.map(q => q.tpl), dbl: Q.dbl, weekend: Q.weekend ? Q.weekend.tpl : null });
  questRecompute(true);
}
// The finish date was switched on/off or moved: rebuild today's quests
// if none is finished yet, else swap just the Core quest if it's still
// open; otherwise the change applies from tomorrow.
function questPlanChanged() {
  const Q = S.quests;
  if (!Q || !Q.list.length) return false;
  if (!Q.list.some(q => q.done)) { questGenerate({ salt: 1 }); saveState(); return true; }
  const i = Q.list.findIndex(q => q.slot === "A");
  if (i >= 0 && !Q.list[i].done) {
    const ctx = questContext();
    const rng = seededRandom(hashString(Q.day + "|plan|" + Date.now()));
    let t = ctx.plan ? byId("a_plan") : null;
    if (!t) {
      const used = new Set(Q.list.map(x => x.tpl));
      const fams = new Set(Q.list.filter((x, k) => k !== i).map(x => (byId(x.tpl) || {}).fam));
      const pick = weightedPick(questCandidates("A", ctx, used, fams).filter(x => !x.t.audio), rng);
      t = pick ? pick.t : byId("a_typed");
    }
    Q.list[i] = makeQuest(t, ctx, rng, "A");
    questRecompute(true);
    saveState();
    return true;
  }
  showCelebrateToast("🗓️", "Starts tomorrow", "Today's Core quest is already done");
  return false;
}
// An Anki quest drawn before Anki went quiet (not used for 2 weeks) is
// swapped for free — you never have to do Anki to finish your day.
const ANKI_TPLS = ["b_anki", "d_ankiwild"];
function questSwapUnusedAnki() {
  const Q = S.quests;
  if (!Q || !Q.list.length || (typeof ankiInUse === "function" && ankiInUse())) return;
  let changed = false;
  Q.list.forEach((q, i) => {
    const isAnki = ANKI_TPLS.includes(q.tpl) || (q.hidden && ANKI_TPLS.includes(q.hidden.tpl));
    if (!isAnki || q.done) return;
    const ctx = questContext();
    const rng = seededRandom(hashString(Q.day + "|anki|" + i));
    const used = new Set(Q.list.map(x => x.tpl).concat(ANKI_TPLS));
    const fams = new Set(Q.list.filter((x, k) => k !== i).map(x => (byId(x.tpl) || {}).fam));
    const pick = weightedPick(questCandidates(q.slot, ctx, used, fams).filter(x => !x.t.audio && x.t.id !== "d_mystery"), rng);
    Q.list[i] = makeQuest(pick ? pick.t : byId(q.slot === "C" ? "c_games" : "a_typed"), ctx, rng, q.slot);
    changed = true;
  });
  if (changed) { logEvent("quest_swap", { why: "anki_unused" }); questRecompute(true); saveLocalOnly(); }
}
// "Speak, don't spell" switched on: open spelling quests (accents,
// Scramble, Type Rush) are swapped for free.
function questSwapForSpeak() {
  const Q = S.quests;
  if (!Q || !Q.list.length || !speakOn()) return;
  const bad = id => { const t = byId(id); return !!(t && t.spell); };
  let changed = false;
  Q.list.forEach((q, i) => {
    if (q.done || !(bad(q.tpl) || (q.hidden && bad(q.hidden.tpl)))) return;
    const ctx = questContext();
    const rng = seededRandom(hashString(Q.day + "|speak|" + i));
    const used = new Set(Q.list.map(x => x.tpl));
    const fams = new Set(Q.list.filter((x, k) => k !== i).map(x => (byId(x.tpl) || {}).fam));
    const pick = weightedPick(questCandidates(q.slot, ctx, used, fams).filter(x => !x.t.audio && x.t.id !== "d_mystery"), rng);
    Q.list[i] = makeQuest(pick ? pick.t : byId(q.slot === "C" ? "c_games" : "a_typed"), ctx, rng, q.slot);
    changed = true;
  });
  if (Q.weekend && !Q.weekend.done && bad(Q.weekend.tpl)) { Q.weekend = null; changed = true; }
  if (changed) { logEvent("quest_swap", { why: "speak" }); questRecompute(true); saveState(); }
}
// Replace one quest (reroll, or free 🔇 swap for sound quests).
function questReroll(idx, free = false) {
  const Q = S.quests, q = Q.list[idx];
  if (!q || q.done) return;
  const t = byId(q.tpl);
  if (t && t.fixed) return;
  const isSound = t && t.audio || (q.hidden && byId(q.hidden.tpl) && byId(q.hidden.tpl).audio);
  if (!free) {
    if (Q.rerolled && Q.tokens <= 0) { showCelebrateToast("🎟️", "No rerolls left", "Chests sometimes contain reroll tokens"); return; }
    if (Q.rerolled) Q.tokens--; else Q.rerolled = true;
  } else if (!isSound) return;
  const ctx = questContext();
  const rng = seededRandom(hashString(Q.day + "|reroll|" + idx + "|" + Date.now()));
  const used = new Set(Q.list.map(x => x.tpl));
  const fams = new Set(Q.list.filter((x, i) => i !== idx).map(x => (byId(x.tpl) || {}).fam));
  const cands = questCandidates(q.slot, ctx, used, fams).filter(x => !x.t.audio && x.t.id !== "d_mystery");
  const pick = weightedPick(cands, rng);
  if (!pick) { showCelebrateToast("🎲", "Nothing else fits today", "Try again later"); return; }
  Q.list[idx] = makeQuest(pick.t, ctx, rng, q.slot);
  logEvent(free ? "quest_swap" : "quest_reroll", { tpl: q.tpl, to: pick.t.id });
  questRecompute(true);
  saveState();
  if (typeof renderHome === "function") renderHome();
}

// ── PROGRESS ──────────────────────────────────
function questProgOf(q) {
  const t = byId(q.tpl);
  if (!t) return 0;
  const m = S.quests.m;
  if (q.tpl === "d_mystery" && q.hidden) return questProgOf(q.hidden) >= q.hidden.target ? 1 : 0;
  let p = 0;
  try { p = t.prog(m, q) || 0; } catch (e) { p = 0; }
  if (t.alt) {
    let a = 0; try { a = t.alt(m, q) || 0; } catch (e) {}
    p = Math.max(p, Math.floor(a / 1.5));
  }
  return Math.max(0, Math.min(q.target, p));
}
function questAllDone() { return S.quests.list.length === 4 && S.quests.list.every(q => q.done); }
// Recompute every quest; pay out newly finished ones.
function questRecompute(silent = false) {
  const Q = S.quests;
  if (!Q || !Q.list) return;
  const finished = [];
  Q.list.forEach((q, i) => {
    q.prog = questProgOf(q);
    if (q.hidden) q.hidden.prog = questProgOf(q.hidden);
    if (!q.done && q.prog >= q.target) { q.done = true; q.doneAt = Date.now(); finished.push([q, i]); }
  });
  if (Q.weekend && !Q.weekend.done) {
    Q.weekend.prog = questProgOf(Q.weekend);
    if (Q.weekend.prog >= Q.weekend.target) { Q.weekend.done = true; Q.weekend.doneAt = Date.now(); finished.push([Q.weekend, "W"]); }
  }
  if (Q.flash && !Q.flash.done && !Q.flash.expired) {
    if (Date.now() > Q.flash.until) Q.flash.expired = true;
    else {
      Q.flash.prog = Math.max(0, Math.min(Q.flash.target, (Q.m[Q.flash.metric] || 0) - Q.flash.base));
      if (Q.flash.prog >= Q.flash.target) { Q.flash.done = true; finished.push([Q.flash, "F"]); }
    }
  }
  if (silent && !finished.length) return;
  finished.forEach(([q, i]) => questPay(q, i));
  if (!Q.dayDone && questAllDone()) questDayComplete();
}
function questPay(q, i) {
  const Q = S.quests;
  const t = byId(q.tpl) || {};
  logEvent("quest_done", { tpl: q.tpl, slot: q.slot });
  if (i === "F") {
    Q.flashes++;
    questQueueChest("flash", "common");
    showCelebrateToast("⚡", "Flash quest done!", "A chest is waiting");
    return;
  }
  if (i === "W") {
    questQueueChest("weekend", "rare");
    addExp(60);
    showCelebrateToast("🎁", "Weekend bonus done!", "+60 XP · a Rare chest");
    return;
  }
  const base = (QUEST_SLOT_INFO[q.slot] || { xp: 40 }).xp;
  const dbl = Q.dbl === i;
  addExp(dbl ? base * 2 : base);
  if (dbl) questQueueChest("double", "common");
  playAchievement();
  showCelebrateToast(t.icon || "✅", "Quest complete!", `${questTitle(q, true)} · +${dbl ? base * 2 : base} XP${dbl ? " ✨" : ""}`);
  questWeekBump("quests", 0);
}
function questDayComplete() {
  const Q = S.quests;
  Q.dayDone = true;
  const today = todayISO();
  if (!Q.qdays.includes(today)) Q.qdays.push(today);
  if (Q.qdays.length > 400) Q.qdays = Q.qdays.slice(-400);
  if (!S.goalDates) S.goalDates = [];
  if (!S.goalDates.includes(today)) S.goalDates.push(today);
  const early = Q.list.some(q => q.tpl === "d_earlycore" && q.done);
  questQueueChest("daily", early ? "rare" : "common");
  addExp(100);
  logEvent("day_complete", { streak: questStreak() });
  // Weekly chest: 5 full days in this Mon–Sun week.
  const wk = isoWeekKey();
  const daysThisWeek = Q.qdays.filter(d => isoWeekKey(new Date(d + "T12:00")) === wk).length;
  questEnsureWeek();
  Q.week.days = daysThisWeek;
  if (daysThisWeek >= 5 && !Q.week.weeklyChest) { Q.week.weeklyChest = true; questQueueChest("weekly", "epic"); }
  // One freeze earned for every 7-day streak.
  const st = questStreak();
  if (st > 0 && st % 7 === 0 && Q.freezes < 3) { Q.freezes++; showCelebrateToast("🧊", "Streak freeze earned", `${st}-day streak!`); }
  checkAchievements({ type: "day_complete" });
  saveState();
  Q._showDayComplete = true;
}

// ── EVENTS FROM THE REST OF THE APP ───────────
// type: "answer" | "srs" | "session_end" | "game_end" | "timer_end" |
//       "boss" | "met" | "golden" | "daily" | "mix" | "anki_done" |
//       "collect" | "world"
function questEvent(type, d = {}) {
  if (!S.quests || !S.quests.m) return;
  if (S.quests.day !== todayISO()) { questEnsureToday(); }
  const m = S.quests.m;
  switch (type) {
    case "answer": questOnAnswer(m, d); break;
    case "srs": {
      const res = d; if (!res || !res.events) break;
      if (typeof invalidatePathScan === "function") invalidatePathScan();
      if (res.promoted) {
        m.up++;
        const w = res._w;
        if (w) { m.upDeck[w.deckId] = (m.upDeck[w.deckId] || 0) + 1; const g = deckGroupId(w.deckId); if (g) m.upLevel[g] = (m.upLevel[g] || 0) + 1; }
        if (res.pkBefore && res.from < res.pkBefore) m.rescued++;
        if (pathSession) pathSession.upCount = (pathSession.upCount || 0) + 1;
        questWeekBump("up", 1);
      }
      if (res.events.includes("known")) m.known++;
      if (res.events.includes("strong")) m.strong++;
      if (res.events.includes("locked")) { m.locked++; questWeekBump("locked", 1); }
      if (res.events.includes("repaired")) m.repaired++;
      if (res.events.includes("unflagged")) m.unflagged++;
      if (res.events.includes("spotcheck")) { m.spot++; m.spotRun++; m.spotBest = Math.max(m.spotBest, m.spotRun); }
      if (res.events.includes("repair") && res.from >= STAGE_LOCKED) m.spotRun = 0;
      break;
    }
    case "met": {
      m.met++;
      if (new Date().getHours() < 12) m.metBeforeNoon++;
      if (d.w) m.metDeck[d.w.deckId] = (m.metDeck[d.w.deckId] || 0) + 1;
      break;
    }
    case "session_end": {
      if (d.kind !== "path") break;
      const st = d.stats || {};
      const acc = st.answered ? Math.round(st.correct / st.answered * 100) : 0;
      m.sessions.push({ t: Date.now(), len: d.len, n: st.answered || 0, acc, ms: d.ms || 0, ab: !!d.abandoned, ok5: d.ok5 || 0, up: d.up || 0, quick: !!d.quick });
      if (m.sessions.length > 30) m.sessions = m.sessions.slice(-30);
      m.sittingMax = Math.max(m.sittingMax, st.answered || 0);
      if (d.wotdHit) { const id = m.sessions.length; if (!m.wotd.includes(id)) m.wotd.push(id); }
      questMaybeFlash();
      questMaybeLucky();
      break;
    }
    case "game_end": questOnGame(m, d); break;
    case "timer_end": if (d.won) m.timerWins[d.words] = (m.timerWins[d.words] || 0) + 1; break;
    case "boss": {
      if (d.won) {
        m.bosses++; questWeekBump("bosses", 1);
        if (d.perfect) m.bossPerfect++;
        if (d.ms && d.ms < 60000) m.bossFast++;
        if (d.minion) m.minions = (m.minions || 0) + 1;
        else if (d.deck) m.deckBosses[d.deck] = 1; else if (!d.world) m.weakBoss++;
      }
      break;
    }
    case "world": m.worldDmg += d.dmg || 0; break;
    case "golden": m.gold++; S.quests.gold++; break;
    case "daily": m.dailyDone = 1; break;
    case "mix": m.mixDone++; break;
    case "anki_done": m.ankiDone = 1; if (new Date().getHours() < 18) m.ankiDoneBefore18 = 1; break;
    case "collect": if (d.kind === "g") m.gCollected++; else if (d.kind === "p") m.pCollected++; break;
    case "bonus_cleared": m.bonusCleared++; break;
  }
  questRecompute();
  // With a finish date the goal bar shows this same counter: keep it live.
  if (type === "answer" && S.path && S.path.deadline) {
    if (typeof markGoalIfReached === "function") markGoalIfReached();
    if (typeof renderExpBar === "function") renderExpBar();
  }
}
function deckGroupId(deckId) {
  for (const g of ALL_GROUPS) if (g.decks.some(d => d.id === deckId)) return g.id;
  return null;
}
function questOnAnswer(m, d) {
  const w = d.w;
  const ok = d.ok === true;
  const isGame = d.mode === "game";
  const key = w ? w.deckId + "_" + w.idx : "";
  if (d.mode === "path" && (d.ok === true || d.ok === false)) { m.pathAll++; if (ok) m.path++; }
  if (ok) {
    if (!isGame) m.ok++;
    if (d.typed) {
      m.typed++;
      if (!d.hint) { m.typedNoHint++; m.typedSinceHint++; } else { m.hints++; m.typedSinceHint = 0; }
      m.run++; m.bestRun = Math.max(m.bestRun, m.run);
      if (m.run === 15) m.runs15++;
      if (d.voice) m.voice++;
      if (d.ms && d.ms < 5000) m.fast++;
      if (d.it === "reverse") m.rev++;
      if (d.it === "cloze") m.cloze++;
      if (w) {
        const p = posOf(w);
        if (p === "verb") m.pos.verb++; else if (p === "adj") m.pos.adj++;
        if (p === "noun" && /^(der|die|das|le|la|l')\b/i.test(gameForm(w))) m.art++;
        const re = IS_FRENCH_APP ? /[éèêàâçôîûùëïœ]/i : /[äöüß]/i;
        if (re.test(w[WORD_KEY] || "") && d.raw !== false) m.umlaut++;
      }
    }
    if (d.ear) m.ear++;
    if (!m.cleanBroken) m.cleanStart++;
    if (w && !isGame) {
      m.decks[w.deckId] = (m.decks[w.deckId] || 0) + 1;
      const g = deckGroupId(w.deckId); if (g) m.levels[g] = (m.levels[g] || 0) + 1;
      if (m.missedKeys.includes(key)) m.fixedSameDay++;
      if ((S.quests.missedYesterday || []).includes(key)) m.comeback++;
      const ws = S.words[key];
      if (ws && d.prevAt && Date.now() - d.prevAt > 30 * 864e5) m.stale30++;
      if (ws && isStruggling(ws)) m.hard++;
      if (pathSession && pathSession.focus) m.focus[pathSession.focus] = (m.focus[pathSession.focus] || 0) + 1;
      const wq = S.quests.list.find(q => q.tpl === "d_wotd") || (S.quests.list.find(q => q.hidden && q.hidden.tpl === "d_wotd") || {}).hidden;
      if (wq && wq.p && wq.p.key === key && pathSession) pathSession.wotdHit = true;
    }
  } else if (d.ok === false) {
    if (d.typed || !isGame) { m.run = 0; }
    m.cleanBroken = true;
    if (key && !isGame && !m.missedKeys.includes(key)) { m.missedKeys.push(key); if (m.missedKeys.length > 80) m.missedKeys.shift(); }
  }
  questWeekBump("ok", ok ? 1 : 0);
}
function questOnGame(m, d) {
  const r = d.result || {};
  const g = (m.games[d.id] = m.games[d.id] || { plays: 0, stars: 0 });
  g.plays++;
  m.game += (r.goalCorrect ?? r.correct) || 0;
  if (r.typedCorrect) { m.typed += r.typedCorrect; m.typedNoHint += r.typedCorrect; }
  if (d.size === "full") g.stars = Math.max(g.stars, d.stars || 0);
  m.maxCombo = Math.max(m.maxCombo, r.maxCombo || 0);
  if (d.rankedUp) { m.rankUps++; m.rankUpIds[d.id] = 1; }
  if (d.newBest) m.bests[d.id] = 1;
  if (d.twist && (d.stars >= 1 || r.cleared)) m.twistWins++;
  if (d.twist && d.rank === 0 && d.stars >= 3) m.retro++;
  if (r.golden) m.gold += r.golden;
  const x = r.stats || {};
  if (d.id === "gender") m.genderRun = Math.max(m.genderRun, r.maxCombo || 0);
  if (d.id === "plural") m.plural += r.correct || 0;
  if (d.id === "conj") m.conj += r.correct || 0;
  if (d.id === "builder") m.builderFirst += x.firstTry || 0;
  if (d.id === "match" && (r.wrong || 0) === 0 && r.cleared !== false) { m.matchClean++; if (x.memory) m.memoryClear++; }
  if (d.id === "rain" && x.lostHearts === 0 && (r.correct || 0) >= 10) m.rainClean++;
  if (d.id === "scramble") m.scrambleNoHint += x.noHint || 0;
  if (d.id === "typerush") m.typeRushNoHint += x.noHint || 0;
  if (d.id === "truefalse") m.tfRun = Math.max(m.tfRun, r.maxCombo || 0);
  if (d.id === "cloze") m.clozeNoPeek += x.noPeek || 0;
  if (d.id === "listen") { m.listenNoReplay += x.noReplay || 0; m.ear += r.correct || 0; }
  if (d.id === "blitz") { m.blitzFast += x.fast || 0; m.blitzPts = Math.max(m.blitzPts, r.score || 0); }
  if (d.size === "bonus" && r.cleared) m.bonusCleared++;
  const now = Date.now();
  if (m.lastGameEnd && d.startedAt && d.startedAt - m.lastGameEnd < 120000) m.b2b++;
  m.lastGameEnd = now;
  questWeekBump("stars", d.size === "full" ? d.stars || 0 : 0);
  questWeekBump("game", d.id);
  questMaybeLucky();
}

// ── RANDOM EVENTS ─────────────────────────────
// ⚡ Flash quest: after the first finished session, 20% of days get one
// 30-minute bonus objective (never more than one a day).
const FLASH_KINDS = [
  { metric: "ok", n: g => Math.max(8, Math.round(g * 0.12)), title: n => `${n} correct answers` },
  { metric: "typed", n: g => Math.max(6, Math.round(g * 0.1)), title: n => `${n} ${sayOr("typed answers", "words recalled")}` },
  { metric: "up", n: () => 5, title: n => `${n} words up a stage` },
  { metric: "game", n: () => 12, title: n => `${n} correct in games` },
  { metric: "typedNoHint", n: () => 10, title: n => `${n} ${sayOr("typed", "recalled")}, no hints` },
];
function questMaybeFlash() {
  const Q = S.quests;
  if (Q.flash || Q.flashRolled === Q.day) return;
  const first = Q.m.sessions.filter(s => !s.ab).length >= 1;
  if (!first) return;
  Q.flashRolled = Q.day;
  const rng = seededRandom(hashString(Q.day + "|flash|" + STORAGE_KEY));
  const hit = rng() < 0.2;
  logEvent("event", { kind: "flash", taken: hit });
  if (!hit) return;
  const k = FLASH_KINDS[Math.floor(rng() * FLASH_KINDS.length)];
  const n = k.n(getDailyGoal());
  Q.flash = { metric: k.metric, target: n, base: Q.m[k.metric] || 0, until: Date.now() + 30 * 60000, title: k.title(n), prog: 0, done: false };
  setTimeout(() => showCelebrateToast("⚡", "Flash quest!", `${k.title(n)} in 30 minutes`), 1200);
}
// 🍀 Lucky drop: 10% per finished session/round, guaranteed within 7.
function questMaybeLucky() {
  const Q = S.quests;
  Q.luckySince = (Q.luckySince || 0) + 1;
  const hit = Q.luckySince >= 7 || Math.random() < 0.1;
  if (!hit) return;
  Q.luckySince = 0; Q.lucky++;
  questQueueChest("lucky", "common");
  logEvent("event", { kind: "lucky", taken: true });
  setTimeout(() => showCelebrateToast("🍀", "Lucky drop!", "A bonus chest appeared"), 1500);
}
// 🌟 Golden words: chance per session item (higher on treasure days).
function goldenChance() {
  const treasure = S.quests && S.quests.list.some(q => q.tpl === "d_treasure" || (q.hidden && q.hidden.tpl === "d_treasure"));
  return treasure ? 1 / 12 : 1 / 40;
}

// ── WEEKLY SAGA ───────────────────────────────
// A 3-chapter chain each week; each chapter's objective is drawn at
// random from weekly counters. No fixed story — the reward is a
// cosmetic at the end.
const SAGA_CHAPTERS = [
  { id: "ok", n: g => Math.round(g * 2), title: n => `Practise ${n} words this week` },
  { id: "up", n: g => Math.max(20, Math.round(g * 0.4)), title: n => `Move ${n} words up a stage this week` },
  { id: "bosses", n: () => 2, title: n => `Defeat ${n} bosses this week` },
  { id: "days", n: () => 3, title: n => `${n} full quest days this week` },
  { id: "stars", n: () => 12, title: n => `Earn ${n} game stars this week` },
  { id: "locked", n: () => 3, title: n => `Lock in ${n} words this week` },
  { id: "games", n: () => 5, title: n => `Play ${n} different games this week` },
  { id: "quests", n: () => 10, title: n => `Finish ${n} quests this week` },
];
function questEnsureWeek() {
  const Q = S.quests, wk = isoWeekKey();
  if (Q.week.key !== wk) Q.week = { key: wk, ok: 0, bosses: 0, days: 0, up: 0, stars: 0, games: [], locked: 0, quests: 0, weeklyChest: false };
  if (!Q.saga || Q.saga.week !== wk) {
    const rng = seededRandom(hashString(wk + "|saga|" + STORAGE_KEY));
    // Only chapters that can be reached this week (no "lock in 3 words"
    // before any word is close to 💎, no bosses before there are words).
    const scan = pathScan();
    const nearLock = Object.values(S.words).filter(ws => ws && ws.st === STAGE_STRONG && ws.dueAt && ws.dueAt < Date.now() + 6 * 864e5).length;
    const fits = c => c.id === "locked" ? nearLock >= 6 : c.id === "bosses" ? scan.met >= 12 : c.id === "stars" || c.id === "games" ? scan.met >= 8 : true;
    const pool = seededShuffle(SAGA_CHAPTERS.filter(fits), rng).slice(0, 3);
    const G = getDailyGoal();
    Q.saga = { week: wk, idx: 0, done: false, ch: pool.map(c => ({ id: c.id, target: c.n(G), title: c.title(c.n(G)), base: 0 })) };
  }
}
function questWeekBump(kind, n) {
  const Q = S.quests;
  if (!Q.week || Q.week.key !== isoWeekKey()) questEnsureWeek();
  const W = Q.week;
  if (kind === "game") { if (!W.games.includes(n)) W.games.push(n); }
  else if (kind === "quests") W.quests = (W.quests || 0) + 1;
  else W[kind] = (W[kind] || 0) + n;
  questSagaCheck();
}
function sagaValue(id) {
  const W = S.quests.week;
  if (id === "games") return W.games.length;
  if (id === "days") return S.quests.qdays.filter(d => isoWeekKey(new Date(d + "T12:00")) === W.key).length;
  return W[id] || 0;
}
function questSagaCheck() {
  const Q = S.quests, sg = Q.saga;
  if (!sg || sg.done) return;
  const ch = sg.ch[sg.idx];
  if (!ch) return;
  if (sagaValue(ch.id) - (ch.base || 0) >= ch.target) {
    sg.idx++;
    addExp(sg.idx === 3 ? 200 : 100);
    if (sg.idx >= 3) {
      sg.done = true; Q.sagas++;
      const c = grantCosmetic(null, "epic");
      showCelebrateToast("📜", "Weekly saga complete!", c ? `${c.icon} ${c.name} unlocked` : "+200 XP");
    } else {
      sg.ch[sg.idx].base = sagaValue(sg.ch[sg.idx].id);
      showCelebrateToast("📜", `Saga chapter ${sg.idx}/3`, `Next: ${sg.ch[sg.idx].title}`);
    }
  }
}
function sagaProgress() {
  const sg = S.quests.saga;
  if (!sg) return null;
  if (sg.done) return { done: true, idx: 3 };
  const ch = sg.ch[sg.idx];
  return { done: false, idx: sg.idx, title: ch.title, prog: Math.min(ch.target, sagaValue(ch.id) - (ch.base || 0)), target: ch.target };
}

// ── CHESTS ────────────────────────────────────
const RARITIES = ["common", "rare", "epic", "legendary"];
const RARITY_INFO = {
  common:    { name: "Common",    icon: "📦", color: "#9fb3c8" },
  rare:      { name: "Rare",      icon: "🎁", color: "#5B8DEF" },
  epic:      { name: "Epic",      icon: "💜", color: "#9B7FE8" },
  legendary: { name: "Legendary", icon: "👑", color: "#F5A623" },
};
function questQueueChest(src, min = "common") {
  S.quests.pending.push({ src, min, at: Date.now() });
  if (S.quests.pending.length > 20) S.quests.pending = S.quests.pending.slice(-20);
}
// Pity-timed roll: Rare by the 3rd, Epic by the 10th, Legendary by
// the 30th chest.
function rollRarity(min = "common", rng = Math.random) {
  const C = S.quests.chest;
  let r = rng() * 100;
  let rar = r < 2 ? "legendary" : r < 12 ? "epic" : r < 40 ? "rare" : "common";
  if (C.sinceLeg >= 29) rar = "legendary";
  else if (C.sinceEpic >= 9 && RARITIES.indexOf(rar) < 2) rar = "epic";
  else if (C.sinceRare >= 2 && RARITIES.indexOf(rar) < 1) rar = "rare";
  if (RARITIES.indexOf(rar) < RARITIES.indexOf(min)) rar = min;
  C.opened++;
  C.sinceRare = RARITIES.indexOf(rar) >= 1 ? 0 : C.sinceRare + 1;
  C.sinceEpic = RARITIES.indexOf(rar) >= 2 ? 0 : C.sinceEpic + 1;
  C.sinceLeg = rar === "legendary" ? 0 : C.sinceLeg + 1;
  return rar;
}
function openChest(ch) {
  const rar = rollRarity(ch.min);
  const loot = [];
  const r = Math.random;
  if (rar === "common") {
    const xp = 30 + Math.floor(r() * 31); addExp(xp); loot.push(`+${xp} XP`);
    if (r() < 0.25) { S.quests.tokens++; loot.push("🎟️ Reroll token"); }
  } else if (rar === "rare") {
    const xp = 80 + Math.floor(r() * 41); addExp(xp); loot.push(`+${xp} XP`);
    const x = r();
    if (x < 0.34 && S.quests.freezes < 3) { S.quests.freezes++; loot.push("🧊 Streak freeze"); }
    else if (x < 0.67) { S.quests.tokens++; loot.push("🎟️ Reroll token"); }
    else { S.quests.boosts++; loot.push("⚡ XP boost (next session ×2)"); }
  } else if (rar === "epic") {
    const xp = 150 + Math.floor(r() * 101); addExp(xp); loot.push(`+${xp} XP`);
    const c = grantCosmetic(null, "epic"); loot.push(c ? `${c.icon} ${c.name}` : "+100 XP");
    if (!c) addExp(100);
    if (r() < 0.5 && S.quests.freezes < 3) { S.quests.freezes++; loot.push("🧊 Streak freeze"); } else { S.quests.boosts++; loot.push("⚡ XP boost"); }
  } else {
    addExp(400); loot.push("+400 XP");
    const c = grantCosmetic(null, "legendary"); loot.push(c ? `${c.icon} ${c.name} (legendary)` : "+200 XP");
    if (!c) addExp(200);
    const f = Math.min(2, 3 - S.quests.freezes); if (f > 0) { S.quests.freezes += f; loot.push(`🧊 ${f} streak freeze${f > 1 ? "s" : ""}`); }
  }
  logEvent("chest", { src: ch.src, rar });
  checkAchievements({ type: "chest" });
  return { rar, loot };
}
function openPendingChest() {
  const Q = S.quests;
  const ch = Q.pending.shift();
  if (!ch) return;
  const res = openChest(ch);
  saveState();
  showChestModal(ch, res);
}
const CHEST_SRC = { daily: "Daily chest", weekly: "Weekly chest", flash: "Flash quest chest", lucky: "Lucky drop", double: "✨ Double reward", weekend: "Weekend bonus", world: "World boss chest", saga: "Saga chest", boss: "👑 Deck boss chest", minion: "⚔️ Minion chest" };
// The opening: the chest lands in the middle of the screen as a plain
// Common chest and takes a few taps. Some taps upgrade it — Rare, Epic,
// Legendary — up to the rarity it already rolled (rollRarity decides,
// the taps only show it). Four taps for every chest, so the count gives
// nothing away… except a Legendary, which upgrades on the "last" tap
// and asks for one more.
const CHEST_TAPS = 4;
function chestTapPlan(finalIdx, rng = Math.random) {
  // upgrades[k] = the tier reached on tap k+1 (or -1: just a shake).
  const steps = Math.max(CHEST_TAPS, finalIdx + 2);
  const early = Math.min(finalIdx, CHEST_TAPS - 2);
  const slots = seededShuffle([...Array(CHEST_TAPS - 1).keys()], rng).slice(0, early).sort((a, b) => a - b);
  const plan = new Array(steps - 1).fill(-1);
  slots.forEach((k, i) => plan[k] = i + 1);
  if (finalIdx > early) plan[CHEST_TAPS - 1] = finalIdx; // the Legendary surprise
  return plan;
}
function chestSvg() {
  return `<svg class="chx-svg" viewBox="0 0 200 180" aria-hidden="true">
    <defs><clipPath id="chx-lid-clip"><path d="M30 80 V60 Q30 24 100 24 Q170 24 170 60 V80 Z"/></clipPath></defs>
    <ellipse cx="100" cy="164" rx="74" ry="9" fill="rgba(0,0,0,0.35)"/>
    <ellipse class="chx-inner" cx="100" cy="80" rx="66" ry="10"/>
    <g class="chx-base">
      <rect x="30" y="80" width="140" height="76" rx="8" class="c-wood"/>
      <path d="M32 106 H168 M32 131 H168" class="c-seam"/>
      <rect x="46" y="80" width="15" height="76" class="c-band"/>
      <rect x="139" y="80" width="15" height="76" class="c-band"/>
      <rect x="26" y="146" width="148" height="12" rx="5" class="c-band"/>
      <rect x="84" y="72" width="32" height="40" rx="6" class="c-plate"/>
      <circle cx="100" cy="88" r="5" class="c-hole"/><rect x="97.5" y="90" width="5" height="11" rx="2" class="c-hole"/>
      <circle cx="100" cy="106" r="3.2" class="c-gem"/>
    </g>
    <g class="chx-lid">
      <path d="M30 80 V60 Q30 24 100 24 Q170 24 170 60 V80 Z" class="c-wood"/>
      <g clip-path="url(#chx-lid-clip)">
        <path d="M30 52 Q100 30 170 52" class="c-seam"/>
        <rect x="46" y="10" width="15" height="72" class="c-band"/>
        <rect x="139" y="10" width="15" height="72" class="c-band"/>
        <path d="M44 44 Q70 30 100 29" class="c-sheen"/>
      </g>
      <rect x="26" y="72" width="148" height="12" rx="5" class="c-band"/>
      <circle cx="53.5" cy="78" r="2.4" class="c-rivet"/><circle cx="146.5" cy="78" r="2.4" class="c-rivet"/>
      <circle cx="100" cy="46" r="5.5" class="c-gem"/>
    </g>
  </svg>`;
}
function chestSfx(kind, tier = 0) {
  if (typeof gameSfxOn === "function" && !gameSfxOn()) return;
  if (kind === "tap") playNotes([{ freq: 150 + tier * 30, at: 0, dur: 0.12 }, { freq: 110 + tier * 20, at: 0.04, dur: 0.16 }], 0.16, "triangle");
  else if (kind === "up") { const f = 523 * Math.pow(1.26, tier); playNotes([{ freq: f, at: 0, dur: 0.14 }, { freq: f * 1.25, at: 0.09, dur: 0.14 }, { freq: f * 1.5, at: 0.18, dur: 0.4 }], 0.2); }
}
function chestParticles(stage, color, n, spread) {
  const box = stage.querySelector(".chx-fx");
  if (!box) return;
  for (let i = 0; i < n; i++) {
    const p = document.createElement("i");
    const a = Math.random() * Math.PI * 2, d = spread * (0.55 + Math.random() * 0.6);
    p.style.cssText = `--dx:${Math.cos(a) * d}px;--dy:${Math.sin(a) * d - spread * 0.25}px;--pc:${color};--ps:${4 + Math.random() * 6}px;animation-delay:${Math.random() * 60}ms`;
    box.appendChild(p);
    setTimeout(() => p.remove(), 1100);
  }
}
function showChestModal(ch, res) {
  const old = document.getElementById("chest-modal"); if (old) old.remove();
  const finalIdx = Math.max(0, RARITIES.indexOf(res.rar));
  const plan = chestTapPlan(finalIdx);
  const final = RARITY_INFO[res.rar];
  let tier = 0, taps = 0, opened = false;
  const m = document.createElement("div");
  m.className = "modal-overlay chx-overlay"; m.id = "chest-modal";
  m.innerHTML = `<div class="chx r-common" id="chx" role="dialog" aria-label="Chest">
      <button class="chx-skip" id="chx-skip">Skip ›</button>
      <div class="chx-src">${escapeHtml(CHEST_SRC[ch.src] || "Chest")}</div>
      <div class="chx-rar" id="chx-rar" aria-live="polite">${RARITY_INFO.common.name}</div>
      <button class="chx-btn" id="chx-btn" aria-label="Tap the chest">
        <span class="chx-rays"></span><span class="chx-glow"></span><span class="chx-beam"></span>
        <span class="chx-body">${chestSvg()}</span>
        <span class="chx-fx"></span>
      </button>
      <div class="chx-pips" id="chx-pips">${"<i></i>".repeat(CHEST_TAPS)}</div>
      <div class="chx-tap" id="chx-tap">Tap the chest!</div>
      <div class="chx-reveal" id="chx-reveal" hidden>
        <ul class="chest-loot">${res.loot.map((l, i) => `<li style="animation-delay:${0.25 + i * 0.12}s">${escapeHtml(l)}</li>`).join("")}</ul>
        <div class="modal-actions">${S.quests.pending.length ? `<button class="modal-btn secondary" onclick="closeChestModal();openPendingChest()">Next chest (${S.quests.pending.length}) →</button>` : ""}
          <button class="modal-btn primary" id="chx-ok" onclick="closeChestModal()">Nice!</button></div>
      </div>
    </div>`;
  document.body.appendChild(m);
  const stage = m.querySelector("#chx"), btn = m.querySelector("#chx-btn"), label = m.querySelector("#chx-rar");
  const tapLine = m.querySelector("#chx-tap"), pips = m.querySelector("#chx-pips");
  const setTier = t => {
    tier = t;
    const key = RARITIES[t], info = RARITY_INFO[key];
    RARITIES.forEach(r => stage.classList.toggle("r-" + r, r === key));
    label.textContent = info.name + (t ? "!" : "");
    label.classList.remove("pop"); void label.offsetWidth; label.classList.add("pop");
    stage.classList.remove("flash"); void stage.offsetWidth; stage.classList.add("flash");
    chestParticles(stage, info.color, 14 + t * 8, 110 + t * 20);
    chestSfx("up", t);
    haptic(t >= 2 ? "heavy" : "correct");
    if (t === 3) confettiBurst(30);
  };
  const open = () => {
    if (opened) return;
    opened = true;
    if (tier !== finalIdx) { tier = finalIdx; RARITIES.forEach(r => stage.classList.toggle("r-" + r, r === res.rar)); }
    stage.classList.add("open");
    label.textContent = `${final.icon} ${final.name}`;
    label.classList.remove("pop"); void label.offsetWidth; label.classList.add("pop");
    btn.disabled = true;
    tapLine.style.display = pips.style.display = m.querySelector("#chx-skip").style.display = "none";
    m.querySelector("#chx-reveal").hidden = false;
    chestParticles(stage, final.color, 26, 150);
    confettiBurst(res.rar === "legendary" ? 80 : res.rar === "epic" ? 50 : 24);
    if (res.rar === "legendary" || res.rar === "epic") playLevelUp(); else playAchievement();
    haptic("correct");
    setTimeout(() => { const ok = document.getElementById("chx-ok"); if (ok) ok.focus({ preventScroll: true }); }, 350);
  };
  const tap = () => {
    if (opened) return;
    taps++;
    const up = plan[taps - 1];
    if (up === undefined) { open(); return; }
    stage.style.setProperty("--shake", 1 + taps * 0.35);
    btn.classList.remove("hit"); void btn.offsetWidth; btn.classList.add("hit");
    chestSfx("tap", taps);
    haptic("select");
    chestParticles(stage, "rgba(255,255,255,0.8)", 5, 70);
    if (up > 0) setTier(up);
    // The Legendary surprise earns the extra tap its own pip.
    if (up === 3 && taps === CHEST_TAPS) pips.insertAdjacentHTML("beforeend", "<i class='extra'></i>");
    pips.querySelectorAll("i").forEach((p, i) => p.classList.toggle("on", i < taps));
    const left = plan.length + 1 - taps;
    tapLine.textContent = left === 1 ? (up === 3 ? "LEGENDARY! One more tap…" : "One more tap — open it!") : "Keep tapping…";
  };
  // Rapid taps must never zoom the page (iOS double-tap zoom): the chest
  // reacts on touch-down, and within the chest sheet a touch that ends
  // anywhere but a live button (Skip, Nice!, Next chest) has its default
  // — zoom — cancelled. Mouse and keyboard still use click.
  let touchTapAt = 0;
  btn.addEventListener("pointerdown", e => {
    if (e.pointerType === "mouse") return;
    touchTapAt = Date.now();
    tap();
  });
  btn.addEventListener("click", () => { if (Date.now() - touchTapAt > 700) tap(); });
  m.addEventListener("touchend", e => {
    const b = e.target.closest && e.target.closest("button");
    if ((!b || b === btn || b.disabled) && e.cancelable) e.preventDefault();
  }, { passive: false });
  m.addEventListener("dblclick", e => e.preventDefault());
  m.querySelector(".chx-body").addEventListener("animationend", e => { if (e.animationName === "chxHit") btn.classList.remove("hit"); });
  m.querySelector("#chx-skip").onclick = open;
  setTimeout(() => { if (btn.isConnected) btn.focus({ preventScroll: true }); }, 300);
}
function closeChestModal() {
  const m = document.getElementById("chest-modal"); if (m) m.remove();
  if (typeof renderHome === "function" && document.getElementById("today-card")) renderHome();
}

// ── COSMETICS ─────────────────────────────────
// ~40 collectables: accent themes, boss skins, card backs, titles.
const COSMETICS = [
  // themes: [accent, accent-hi]
  { id: "th_amber", kind: "theme", icon: "🟠", name: "Amber (default)", rar: "common", v: ["#F5A623", "#FFD166"], free: true },
  { id: "th_ocean", kind: "theme", icon: "🌊", name: "Ocean", rar: "epic", v: ["#38BDF8", "#7DD3FC"] },
  { id: "th_rose", kind: "theme", icon: "🌹", name: "Rose", rar: "epic", v: ["#FB7185", "#FDA4AF"] },
  { id: "th_mint", kind: "theme", icon: "🌿", name: "Mint", rar: "epic", v: ["#34D399", "#6EE7B7"] },
  { id: "th_violet", kind: "theme", icon: "🔮", name: "Violet", rar: "epic", v: ["#A78BFA", "#C4B5FD"] },
  { id: "th_sunset", kind: "theme", icon: "🌇", name: "Sunset", rar: "epic", v: ["#FB923C", "#FDBA74"] },
  { id: "th_ice", kind: "theme", icon: "🧊", name: "Ice", rar: "epic", v: ["#67E8F9", "#CFFAFE"] },
  { id: "th_lime", kind: "theme", icon: "🍋", name: "Lime", rar: "epic", v: ["#A3E635", "#D9F99D"] },
  { id: "th_cherry", kind: "theme", icon: "🍒", name: "Cherry", rar: "epic", v: ["#F43F5E", "#FB7185"] },
  { id: "th_gold", kind: "theme", icon: "🏆", name: "Royal Gold", rar: "legendary", v: ["#EAB308", "#FDE68A"] },
  { id: "th_aurora", kind: "theme", icon: "🌌", name: "Aurora", rar: "legendary", v: ["#2DD4BF", "#A78BFA"] },
  { id: "th_ember", kind: "theme", icon: "🔥", name: "Ember", rar: "legendary", v: ["#EF4444", "#F59E0B"] },
  // boss skins (the Weakest-words boss wears it)
  { id: "bs_dragon", kind: "boss", icon: "🐲", name: "Jade Dragon", rar: "epic" },
  { id: "bs_squid", kind: "boss", icon: "🦑", name: "Deep Squid", rar: "epic" },
  { id: "bs_ghost", kind: "boss", icon: "👻", name: "Forgetful Ghost", rar: "epic" },
  { id: "bs_robot", kind: "boss", icon: "🤖", name: "Grammar Bot", rar: "epic" },
  { id: "bs_scorpion", kind: "boss", icon: "🦂", name: "Case Scorpion", rar: "epic" },
  { id: "bs_zombie", kind: "boss", icon: "🧟", name: "Undead Umlaut", rar: "epic" },
  { id: "bs_shark", kind: "boss", icon: "🦈", name: "Syntax Shark", rar: "epic" },
  { id: "bs_croc", kind: "boss", icon: "🐊", name: "Article Croc", rar: "epic" },
  { id: "bs_bat", kind: "boss", icon: "🦇", name: "Night Verb", rar: "epic" },
  { id: "bs_spider", kind: "boss", icon: "🕷️", name: "Web of Tenses", rar: "epic" },
  { id: "bs_trex", kind: "boss", icon: "🦖", name: "Lexi-Rex", rar: "legendary" },
  { id: "bs_alien", kind: "boss", icon: "👽", name: "Foreign Word", rar: "legendary" },
  // card backs (Today card pattern)
  { id: "cb_none", kind: "card", icon: "▫️", name: "Plain", rar: "common", free: true },
  { id: "cb_stars", kind: "card", icon: "✨", name: "Starfield", rar: "epic" },
  { id: "cb_waves", kind: "card", icon: "〰️", name: "Waves", rar: "epic" },
  { id: "cb_dots", kind: "card", icon: "⚪", name: "Polka", rar: "epic" },
  { id: "cb_grid", kind: "card", icon: "🔲", name: "Grid", rar: "epic" },
  { id: "cb_stripes", kind: "card", icon: "🟰", name: "Stripes", rar: "epic" },
  { id: "cb_glow", kind: "card", icon: "🌟", name: "Glow", rar: "legendary" },
  { id: "cb_prism", kind: "card", icon: "🔷", name: "Prism", rar: "legendary" },
  // titles (shown next to your level)
  { id: "ti_none", kind: "title", icon: "—", name: "No title", rar: "common", free: true },
  { id: "ti_word", kind: "title", icon: "🖋️", name: "Wordsmith", rar: "epic" },
  { id: "ti_knight", kind: "title", icon: "🛡️", name: "Grammar Knight", rar: "epic" },
  { id: "ti_owl", kind: "title", icon: "🦉", name: "Night Scholar", rar: "epic" },
  { id: "ti_rocket", kind: "title", icon: "🚀", name: "Speed Speller", rar: "epic" },
  { id: "ti_heart", kind: "title", icon: "💗", name: "Word Collector", rar: "epic" },
  { id: "ti_sage", kind: "title", icon: "🧙", name: "Polyglot Sage", rar: "legendary" },
  { id: "ti_crown", kind: "title", icon: "👑", name: "Vocab Royalty", rar: "legendary" },
];
function cosmeticOwned(id) { const c = COSMETICS.find(x => x.id === id); return !!c && (c.free || S.quests.cos.owned.includes(id)); }
function grantCosmetic(kind, minRar = "epic") {
  const idx = RARITIES.indexOf(minRar);
  let cands = COSMETICS.filter(c => !c.free && !S.quests.cos.owned.includes(c.id) && (!kind || c.kind === kind));
  const exact = cands.filter(c => c.rar === minRar);
  if (exact.length) cands = exact;
  else cands = cands.filter(c => RARITIES.indexOf(c.rar) >= Math.min(idx, 2));
  if (!cands.length) return null;
  const c = cands[Math.floor(Math.random() * cands.length)];
  S.quests.cos.owned.push(c.id);
  logEvent("cosmetic", { id: c.id });
  return c;
}
function equipCosmetic(id) {
  const c = COSMETICS.find(x => x.id === id);
  if (!c || !cosmeticOwned(id)) return;
  S.quests.cos.on[c.kind] = id;
  saveState();
  applyCosmetics();
  renderCollection();
}
function activeCosmetic(kind) {
  const id = S.quests && S.quests.cos && S.quests.cos.on[kind];
  return id && cosmeticOwned(id) ? COSMETICS.find(x => x.id === id) : null;
}
function applyCosmetics() {
  if (!S.quests) return;
  const th = activeCosmetic("theme");
  const root = document.documentElement.style;
  if (th && th.id !== "th_amber") {
    const [a, b] = th.v;
    root.setProperty("--accent", a); root.setProperty("--accent-hi", b);
    root.setProperty("--accent-dim", hexA(a, 0.13)); root.setProperty("--accent-glow", hexA(a, 0.35));
  } else ["--accent", "--accent-hi", "--accent-dim", "--accent-glow"].forEach(p => root.removeProperty(p));
  const cb = activeCosmetic("card");
  document.body.dataset.cardback = cb ? cb.id : "";
}
function hexA(hex, a) {
  const n = parseInt(hex.slice(1), 16);
  return `rgba(${(n >> 16) & 255},${(n >> 8) & 255},${n & 255},${a})`;
}
function activeTitle() { const t = activeCosmetic("title"); return t && t.id !== "ti_none" ? t : null; }
function activeBossSkin() { return activeCosmetic("boss"); }

// ── UI ────────────────────────────────────────
function questTitle(q, plain = false) {
  if (q.tpl === "d_mystery") {
    if (!questAllOthersDone(q)) return "❓ Mystery quest";
    return questTitle(q.hidden, plain);
  }
  const t = byId(q.tpl);
  if (!t) return q.tpl;
  let s = "";
  try { s = t.title(q); } catch (e) { s = q.tpl; }
  if (plain) s = s.replace(/<[^>]+>/g, "");
  return s;
}
function questAllOthersDone(q) { return S.quests.list.filter(x => x !== q).every(x => x.done); }
function questSub(q) {
  if (q.tpl === "d_mystery") return questAllOthersDone(q) ? "Revealed!" : "Revealed when the other three are done";
  const t = byId(q.tpl);
  const parts = [];
  if (t && t.sub) { try { const s = t.sub(S.quests.m, q); if (s) parts.push(s); } catch (e) {} }
  if (t && t.altTitle) parts.push(t.altTitle(q));
  return parts.join(" · ");
}
function questIcon(q) {
  if (q.tpl === "d_mystery" && questAllOthersDone(q)) return (byId(q.hidden.tpl) || {}).icon || "❓";
  return (byId(q.tpl) || {}).icon || "✅";
}
// Quest cards: icon, title, a clear progress bar with "3 / 10", and ▶.
// simple (👵 Grandma mode) leaves out everything else — rerolls, the
// 🔇 swap, ✨×2, weekend and flash quests.
function questRowHtml({ icon, title, prog, target, done, num, note = "", go = "", acts = "", cls = "" }) {
  const pct = Math.round(Math.min(1, prog / Math.max(1, target)) * 100);
  const hasActs = !done && !!go;
  // Grid: icon | title | buttons, and the bar across the full width below.
  return `<div class="gm-quest ${done ? "done" : ""} ${hasActs ? "" : "no-acts"} ${cls}">
    <div class="gm-q-icon" aria-hidden="true">${done ? "✓" : icon}</div>
    <div class="gm-q-body">
      <div class="gm-q-title">${title}</div>
      ${note ? `<div class="gm-q-note">${note}</div>` : ""}
    </div>
    ${hasActs ? `<div class="gm-q-acts"><button class="gm-q-go" onclick="${go}" aria-label="Start this quest">▶</button>${acts}</div>` : ""}
    <div class="gm-q-prog">
      <div class="gm-q-bar" role="progressbar" aria-valuemin="0" aria-valuemax="${target}" aria-valuenow="${Math.min(prog, target)}"><i style="width:${pct}%"></i></div>
      <span class="gm-q-num">${num != null ? num : done ? "Done" : `${Math.min(prog, target)} / ${target}`}</span>
    </div>
  </div>`;
}
function questCardsHtml(opts = {}) {
  questEnsureToday();
  const Q = S.quests;
  const quiet = quietActive();
  const simple = !!opts.simple;
  const rows = Q.list.map((q, i) => {
    const t = byId(q.tpl) || {};
    const mystery = q.tpl === "d_mystery" && !questAllOthersDone(q);
    const inner = q.tpl === "d_mystery" && !mystery ? q.hidden : q;
    const it = byId(inner.tpl) || t;
    const sound = !!it.audio;
    const dbl = !simple && Q.dbl === i ? ` <span class="quest-dbl" title="Double reward">✨×2</span>` : "";
    // Only what changes how you do it: the text route of a sound quest,
    // and when the mystery opens.
    const note = simple ? "" : mystery ? "Revealed when the other three are done"
      : it.altTitle ? (() => { try { return escapeHtml(it.altTitle(inner)); } catch (e) { return ""; } })() : "";
    const acts = simple || q.done ? ""
      : sound ? `<button class="gm-q-mini" onclick="questReroll(${i}, true)" title="Can't use sound now? Swap it (free)" aria-label="Swap this sound quest">🔇</button>`
      : q.tpl !== "d_mystery" && !t.fixed ? `<button class="gm-q-mini" onclick="questReroll(${i})" title="Reroll this quest${Q.rerolled ? ` (${Q.tokens} tokens)` : " (1 free today)"}" aria-label="Reroll this quest">🎲</button>` : "";
    return questRowHtml({ icon: questIcon(q), title: questTitle(q) + dbl, prog: mystery ? 0 : inner.prog, target: mystery ? 1 : inner.target,
      done: q.done, num: mystery && !q.done ? "?" : null, note, go: `questGo(${i})`, acts, cls: sound && quiet ? "muted" : "" });
  });
  if (!simple && Q.flash && !Q.flash.done && !Q.flash.expired && Date.now() < Q.flash.until) {
    const mins = Math.max(1, Math.ceil((Q.flash.until - Date.now()) / 60000));
    rows.push(questRowHtml({ icon: "⚡", title: `Flash quest: ${escapeHtml(Q.flash.title)} <span class="gm-q-tag">${mins} min left · 🎁</span>`,
      prog: Q.flash.prog, target: Q.flash.target, go: "startPathSession('quick')", cls: "flash" }));
  }
  if (!simple && Q.weekend && !Q.weekend.done) {
    const w = Q.weekend;
    rows.push(questRowHtml({ icon: questIcon(w), title: `${questTitle(w)} <span class="gm-q-tag">🎁 weekend bonus</span>`,
      prog: w.prog, target: w.target, go: `questGoTpl('${w.tpl}', 'W')`, cls: "weekend" }));
  }
  const nDone = Q.list.filter(q => q.done).length;
  // The day's chest, right under the quests: its progress (one step per
  // quest), then a big button once it — or any other chest — is waiting.
  const pend = Q.pending.length;
  const chest = pend
    ? `<button class="gm-chest-open" onclick="openPendingChest()">🎁 Open your chest${pend > 1 ? `s (${pend})` : ""}</button>`
    : Q.dayDone ? `<div class="gm-chest-done">✓ Today's chest is opened — new quests tomorrow</div>`
    : questRowHtml({ icon: "🎁", title: `Chest — finish all ${Q.list.length} quests to open it`, prog: nDone, target: Q.list.length, cls: "chest" });
  return `<div class="gm-quests-head"><span>Today's quests</span><b>${nDone} / ${Q.list.length}</b></div>
    <div class="gm-quests">${rows.join("")}${chest}</div>`;
}
function questMiniHtml() {
  if (!S.quests || !S.quests.list.length) return "";
  return `<div class="quest-mini-row">${S.quests.list.map(q => {
    const pct = Math.round(Math.min(1, q.prog / q.target) * 100);
    return `<span class="quest-mini-ring ${q.done ? "done" : ""}" style="--p:${q.tpl === "d_mystery" && !q.done ? 0 : pct}" title="${escapeHtml(questTitle(q, true))}">${q.done ? "✓" : questIcon(q)}</span>`;
  }).join("")}</div>`;
}
// The ▶ on a quest: jump straight into the activity that fills it.
function questGo(i) {
  const q = S.quests.list[i];
  if (!q) return;
  const inner = q.tpl === "d_mystery" ? (questAllOthersDone(q) ? q.hidden : null) : q;
  const t = inner ? byId(inner.tpl) : null;
  runQuestAction(t ? (typeof t.go === "function" ? t.go(inner) : t.go) : "path");
}
function questGoTpl(id) {
  const q = S.quests.weekend;
  const t = byId(id);
  runQuestAction(t ? (typeof t.go === "function" ? t.go(q) : t.go) : "path");
}
function runQuestAction(a) {
  a = a || "path";
  logEvent("quest_go", { a });
  const [k, x, y] = a.split(":");
  const len = S.path.sessionLen || "regular";
  if (k === "path") return startPathSession(x || len);
  if (k === "quick5") return startQuickFive();
  if (k === "focus") return startPathSession(len, { focus: x, param: y });
  if (k === "hub") return openGamesHub(null);
  if (k === "game") { openGamesHub(null); const g = getGame(x); if (g) setTimeout(() => gameTileTap(x), 50); return; }
  if (k === "daily") { openGamesHub(null); return setTimeout(startDailyChallenge, 50); }
  if (k === "mix") { openGamesHub(null); return setTimeout(startArcadeMix, 50); }
  if (k === "timer") return startQuestTimer(+x || 25);
  if (k === "boss") return typeof startDeckBoss === "function" ? startDeckBoss(x) : openGamesHub(null);
  if (k === "world") return typeof startWorldBoss === "function" ? startWorldBoss() : openGamesHub(null);
  if (k === "anki") {
    selectedIds = new Set(allAnkiDeckIds()); activeMode = "anki";
    return startAnki();
  }
  startPathSession(len);
}
// A Timer over the words you've met (weak ones first).
function startQuestTimer(n) {
  const words = [];
  vocabGroups().forEach(g => g.decks.forEach(d => d.words.forEach((w, i) => {
    const ws = S.words[d.id + "_" + i];
    if (ws && ws.st) words.push({ w: { ...w, deckId: d.id, deckName: d.name, idx: i }, k: (ws.st || 0) + Math.random() * 3 });
  })));
  if (words.length < 10) { showCelebrateToast("⏱", "Timer", "Meet a few more words first"); return; }
  words.sort((a, b) => a.k - b.k);
  activeWords = words.slice(0, Math.max(n, 40)).map(x => x.w);
  selectedIds = new Set(activeWords.map(w => w.deckId));
  activeMode = "timer"; timerSubMode = "classic"; timerWordCount = n;
  sessionCorrect = 0; sessionConsecutive = 0;
  const island = document.getElementById("floating-island"); if (island) island.remove();
  startTimer();
}

// "Day complete" moment — shown once, after the fourth quest.
function questAfterActivity() {
  const Q = S.quests;
  // Chests never pop up on their own mid-flow — they wait on the Today
  // card (and the Day complete screen) until you choose to open them.
  if (Q && Q._showDayComplete) { Q._showDayComplete = false; setTimeout(renderDayComplete, 600); return true; }
  return false;
}
function gameInPlaySafe() { return typeof gameInPlay === "function" && gameInPlay(); }
// End screens (session summary, game results) keep their content and
// offer the Day complete moment as their main button instead of being
// replaced by it.
function dayCompletePending() { return !!(S.quests && S.quests._showDayComplete); }
function dayCompleteCtaHtml() {
  return dayCompletePending() ? `<button class="g-big-btn day-cta" onclick="openDayComplete()">🏁 All 4 quests done — continue</button>` : "";
}
function openDayComplete() {
  S.quests._showDayComplete = false;
  if (typeof quitAllGames === "function") quitAllGames();
  renderDayComplete(true);
}
function renderDayComplete(force = false) {
  if (!force && (gameInPlaySafe() || (typeof pathSession !== "undefined" && pathSession) || document.getElementById("game-screen"))) { S.quests._showDayComplete = true; return; }
  const Q = S.quests;
  const st = questStreak();
  showGameScreen();
  const el = document.getElementById("main-screen");
  el.innerHTML = `<div class="screen">
    <div class="result-screen day-complete">
      <div class="result-emoji">🏁</div>
      <div class="result-title">Day complete ✓</div>
      <div class="result-sub">All four quests done — see you tomorrow.</div>
      <div class="p-chips">
        ${st ? `<span class="p-chip gold">🔥 ${st}-day streak</span>` : ""}
        ${Q.freezes ? `<span class="p-chip">🧊 ${Q.freezes} freeze${Q.freezes > 1 ? "s" : ""}</span>` : ""}
        <span class="p-chip ok">+100 XP</span>
      </div>
      ${questMiniHtml()}
      <div class="g-result-actions">
        ${Q.pending.length ? `<button class="g-big-btn" onclick="openPendingChest()">🎁 Open your chest${Q.pending.length > 1 ? `s (${Q.pending.length})` : ""}</button>` : ""}
        <button class="g-sec-btn" onclick="backToMenu()">🏠 Home</button>
      </div>
      <div class="p-sub" style="margin-top:12px">Want more? Everything still counts — but you're done.</div>
    </div></div>`;
  confettiBurst(70); playLevelUp();
}

// ── COLLECTION PAGE ───────────────────────────
function renderCollection() {
  showGameScreen();
  logScreen("collection");
  const kinds = [["theme", "🎨 Themes"], ["card", "🃏 Card backs"], ["title", "🏷️ Titles"], ["boss", "👾 Boss skins"]];
  const owned = COSMETICS.filter(c => !c.free && cosmeticOwned(c.id)).length;
  const total = COSMETICS.filter(c => !c.free).length;
  const Q = S.quests;
  document.getElementById("main-screen").innerHTML = `<div class="screen">
    <div class="screen-top"><div class="screen-label">🎨 Collection · ${owned}/${total}</div><button class="back-btn" onclick="backToMenu()">← Back</button></div>
    <div class="coll-stats">
      <span class="p-chip">🧊 ${Q.freezes} freeze${Q.freezes === 1 ? "" : "s"}</span>
      <span class="p-chip">🎟️ ${Q.tokens} reroll${Q.tokens === 1 ? "" : "s"}</span>
      <span class="p-chip">⚡ ${Q.boosts} boost${Q.boosts === 1 ? "" : "s"}</span>
      <span class="p-chip">📦 ${Q.chest.opened} chests opened</span>
      ${Q.pending.length ? `<button class="p-chip gold" onclick="openPendingChest()">🎁 ${Q.pending.length} to open</button>` : ""}
    </div>
    ${kinds.map(([k, label]) => `<div class="stats-section-title" style="margin-top:14px">${label}</div>
      <div class="coll-grid">${COSMETICS.filter(c => c.kind === k).map(c => {
        const own = cosmeticOwned(c.id), on = (Q.cos.on[k] || (c.free ? c.id : "")) === c.id;
        return `<button class="coll-item ${own ? "own" : "locked"} ${on ? "on" : ""} r-${c.rar}" ${own ? `onclick="equipCosmetic('${c.id}')"` : "disabled"}
          style="${c.kind === "theme" && own ? `--sw:${c.v[0]}` : ""}">
          <span class="coll-icon">${own ? c.icon : "🔒"}</span><span class="coll-name">${own ? escapeHtml(c.name) : "???"}</span>
          <span class="coll-rar">${RARITY_INFO[c.rar].name}${on ? " · on" : ""}</span></button>`;
      }).join("")}</div>`).join("")}
    <div class="p-sub" style="margin-top:14px">Epic and Legendary chests hold new pieces. Weekly sagas always give one.</div>
  </div>`;
}
function questWotdKey() {
  if (!S.quests || !S.quests.list) return null;
  const q = S.quests.list.find(x => x.tpl === "d_wotd" && !x.done) || (S.quests.list.find(x => x.hidden && x.hidden.tpl === "d_wotd" && !x.done) || {}).hidden;
  return q && q.p ? q.p.key : null;
}
