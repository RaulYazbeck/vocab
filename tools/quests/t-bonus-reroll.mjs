// Stars from Today's bonus rounds, and the 🎲 reroll that may arrive done.
//   node t-bonus-reroll.mjs     (serve the repo root on :8765 first)
import { openApp } from "../verb-track/browser.mjs";
const { browser, page, errors } = await openApp({});
const out = await page.evaluate(async () => {
  const res = []; const ok = (c, m, x) => res.push([!!c, m + (c ? "" : " — " + JSON.stringify(x === undefined ? "" : x))]);
  const wait = ms => new Promise(r => setTimeout(r, ms));
  // ── bonus rounds earn stars at your rank ──
  const pool = dailyPool();
  const play = async (id, result, opts = {}) => {
    gameRun = { kind: "surprise", ids: [id], i: 0, summaries: [], pool, size: "bonus", title: "🎁 Bonus", onDone: () => { gameRun = null; } };
    launchGame(id, Object.assign({ pool, size: "bonus" }, opts)); await wait(30);
    const ctx = activeGame.ctx; finishGame(ctx, Object.assign({ score: 0 }, result)); await wait(30);
    const html = document.getElementById("main-screen").innerHTML; gameRun = null; return { ctx, html };
  };
  const id = ["gender", "truefalse", "blitz", "cloze"].find(g => getGame(g) && gameRequirement(getGame(g), pool, "bonus").ok);
  ok(!!id, "a game that can run as a bonus round", id);
  S.games.rank[id] = 0; S.games.rankStars[id] = [0, 0, 0, 0, 0]; S.games.stars[id] = 0; delete S.games.best[id];
  const goal = bonusGoal(id), w0 = S.quests.week.stars || 0;
  let r = await play(id, { correct: goal - 1, wrong: 0 });
  ok(gameRankStars(id, 0) === 0 && /g-stars-row/.test(r.html), "the target missed: no star, the stars row still shown", gameRankStars(id, 0));
  r = await play(id, { correct: goal, wrong: 3 });
  ok(gameRankStars(id, 0) === 1 && gameRankOf(id) === 0, "the target reached with mistakes: ★", gameRankStars(id, 0));
  r = await play(id, { correct: goal, wrong: 1 });
  ok(gameRankStars(id, 0) === 2 && gameRankOf(id) === 0 && /no mistake next time/.test(r.html), "one mistake: ★★, and the card says what ★★★ takes", gameRankStars(id, 0));
  r = await play(id, { correct: goal, wrong: 2 });
  ok(gameRankStars(id, 0) === 2 && /your best here stays/.test(r.html), "a worse round never takes stars away");
  ok(S.games.best[id] === undefined, "a bonus round's score sets no personal best");
  ok((S.quests.m.games[id] || {}).stars === 2 && (S.quests.week.stars || 0) === w0 + 0 + 1 + 2 + 1, "the quests see them: today's best for the game, the week's count", [S.quests.m.games[id], S.quests.week.stars, w0]);
  r = await play(id, { correct: goal, wrong: 0 });
  ok(gameRankStars(id, 0) === 3 && gameRankOf(id) === 1 && /unlocked/.test(r.html), "no mistake: ★★★ and the next rank", [gameRankStars(id, 0), gameRankOf(id)]);
  ok(r.ctx.rank === 0, "…it was played at the rank it had");
  r = await play(id, { correct: goal, wrong: 0 });
  ok(r.ctx.rank === 1 && gameRankStars(id, 1) === 3 && gameRankOf(id) === 2, "the next bonus round is played at the new rank, and its stars are that rank's", [r.ctx.rank, gameRankOf(id)]);
  // a full round is untouched: its own thresholds
  S.games.rank[id] = 0; S.games.rankStars[id] = [0, 0, 0, 0, 0];
  launchGame(id, { pool, size: "full" }); await wait(30); const fc = activeGame.ctx; finishGame(fc, { score: 0, correct: 1, wrong: 0 }); await wait(30);
  ok(gameRankStars(id, 0) === 0, "a full round still goes by its score");
  // 🐣 Easy or 🏅 Rank up — your choice, remembered
  S.games.rank[id] = 2; S.games.rankStars[id] = [3, 3, 0, 0, 0]; S.games.stars[id] = 3;
  bonusModeSet(true);
  r = await play(id, { correct: goal, wrong: 0 });
  ok(r.ctx.rank === 0 && r.ctx.noStars && gameRankStars(id, 2) === 0 && gameRankOf(id) === 2 && /Easy round/.test(r.html), "🐣 Easy: played at the lowest rank, no stars, no rank change — and the card says so", [r.ctx.rank, gameRankOf(id)]);
  ok(S.games.bonusEasy === true, "…the choice is kept (it syncs with the games)");
  launchGame(id, { pool, size: "bonus" }); await wait(40);
  const sp = document.getElementById("g-bmode-splash");
  ok(!!sp && sp.querySelector(".g-bmode-opt.on").dataset.easy === "1", "the start card (or a game's first intro) shows the switch, on 🐣 Easy", sp && sp.outerHTML.slice(0, 80));
  sp.querySelector('.g-bmode-opt[data-easy="0"]').click(); await wait(30);
  ok(!S.games.bonusEasy && activeGame.ctx.rank === 2 && !activeGame.ctx.noStars && document.querySelector("#g-bmode-splash .g-bmode-opt.on").dataset.easy === "0", "a tap on 🏅 Rank up: your rank, stars again — remembered", [S.games.bonusEasy, activeGame.ctx.rank]);
  stopActiveGame(); gameRun = null;
  launchGame("boss", { pool, size: "bonus", bossMode: "minion", deck: (S.games && Object.keys(S.games.rank)[0]) || "" }); await wait(30);
  ok(!document.getElementById("g-bmode-splash"), "a minion fight has no switch (it earns no stars either way)");
  stopActiveGame();
  // the offer in Today says so
  ok(/★/.test(bonusStarsText()) && typeof renderPathBonusOffer === "function", "the offer and the splash say how the stars are earned");
  // ── the 🎲 reroll: a real draw, which may arrive done ──
  const Q = S.quests; questEnsureToday(); if (!Q.list.length) questGenerate();
  const m = Q.m; Object.keys(m).forEach(k => { if (typeof m[k] === "number") m[k] = 500; }); // a day on which a lot was done
  questRecompute(true);
  const slotIdx = Q.list.findIndex(q => !q.done && !(byId(q.tpl) || {}).fixed);
  Q.tokens = 3;
  let lucky = 0, rolls = 0, bad = [], sameAsBefore = 0; const seen = new Set();
  const paid0 = (Q.chests || []).length + (Q.done || 0);
  for (let k = 0; k < 60; k++) {
    const i = Q.list.findIndex(q => !q.done && !(byId(q.tpl) || {}).fixed && q.tpl !== "d_mystery");
    if (i < 0) { Q.list.forEach(q => { if (!(byId(q.tpl) || {}).fixed) { q.done = false; q.tpl = q.slot === "C" ? "c_games" : "a_typed"; q.target = 99999; } }); continue; }
    const before = Q.list[i].tpl, tok = Q.tokens = 3;
    questReroll(i); await wait(3);
    const nq = Q.list[i]; rolls++;
    if (Q.tokens !== tok - 1) bad.push("token " + before);
    if (nq.tpl === before) sameAsBefore++;
    const t = byId(nq.tpl); if (!t || t.fixed || t.retired || nq.tpl === "d_mystery" || t.audio) bad.push("drew " + nq.tpl);
    if (nq.slot !== Q.list[i].slot) bad.push("slot");
    seen.add(nq.tpl); if (nq.done) { lucky++; if (!(nq.prog >= nq.target)) bad.push("done without the work " + nq.tpl); }
    else { let fits = false; try { fits = !!t.ok(questContext()); } catch (e) {} if (!fits) bad.push("open but can't be done: " + nq.tpl); }
  }
  ok(rolls >= 40 && !bad.length, `${rolls} rerolls: a token each, never a fixed, retired, sound or mystery quest, never an open one that can't be done`, bad.slice(0, 5));
  ok(lucky >= 3, `some arrive done and are paid at once (${lucky} of ${rolls})`, lucky);
  ok(sameAsBefore === 0 && seen.size >= 6, `always another quest than the one rolled away; a real variety (${seen.size} kinds)`, [...seen]);
  // nothing fits: no token is spent
  Q.tokens = 2; const fi = Q.list.findIndex(q => !(byId(q.tpl) || {}).fixed); Q.list[fi].done = false;
  const real = questRerollCandidates; window.questRerollCandidates = () => [];
  questReroll(fi); window.questRerollCandidates = real;
  ok(Q.tokens === 2, "nothing to draw: the token stays", Q.tokens);
  return res;
});
let fail = 0; out.forEach(([c, m]) => { console.log((c ? "✓ " : "✗ ") + m); if (!c) fail++; });
if (errors.length) { console.log("page errors:", errors.slice(0, 3)); fail++; }
console.log(fail ? `bonus-reroll: ${fail} FAILED` : "bonus-reroll: all passed");
await browser.close(); process.exit(fail ? 1 : 0);
