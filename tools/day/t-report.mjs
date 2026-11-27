// The usage report's game times and quest counts (js/usage-log.js), on
// days shaped like a real history, and live through the app's own quest
// functions. Serve the repo (node run-suite.mjs t-report.mjs does).
//
// - game times: a game left open before the 10-minute cap (Thread, 26 min
//   on 2026-10-08) counts 10 min; days before game times were logged don't
//   thin the averages (an "active" time above the whole game's); new games
//   count themselves
// - quests: a day's quests drawn again count once; a reroll's, the weekend's
//   and a swapped-in quest count as offered; older days read so that no
//   quest is done more often than offered
import { openApp } from "../verb-track/browser.mjs";
const { browser, page, errors } = await openApp();
let pass = 0, fail = 0;
const ok = (c, m, x = "") => { if (c) { pass++; console.log("  ✓", m); } else { fail++; console.log("  ✗", m, x); } };

const r = await page.evaluate(() => {
  const out = {};
  const put = (date, v) => { const d = usageDay(date); Object.assign(d, v); };
  // ── game times on past days ──
  // before game times existed: 9 rain games finished
  put("2026-10-01", { min: 30, gp: { rain: [9, 9, 0] } });
  // Thread on 2026-10-08 (logged before the cap): 1 finished, 1 left open 26 min
  put("2026-10-08", { min: 46, gp: { thread: [2, 1, 1] }, gx: { thread: [4, 4, 128203, 1581592, 0] } });
  // rain with times, and active time logged
  put("2026-10-16", { min: 47, gp: { rain: [1, 1, 0] }, gx: { rain: [8, 0, 20003, 0, 0, 20003, 1] } });
  // ── live games today ──
  const today = todayISO();
  logEvent("game_start", { id: "match" });
  logEvent("game_end", { id: "match", ms: 30000, act: 20000, ok: 5, bad: 1 });
  logEvent("game_start", { id: "match" });
  logEvent("game_end", { id: "match", quit: true, ms: 2e6 }); // left open half an hour
  out.gxToday = usageDay(today).gx.match;
  const rep = buildUsageReport(0);
  out.gameLine = rep.split("\n").find(l => l.startsWith("Game detail"));

  // ── quests, live ──
  const Q = S.quests;
  questGenerate(); questGenerate(); // the day's quests drawn again (a sync, a finish-date change)
  out.list = Q.list.map(q => q.tpl);
  const qt0 = JSON.parse(JSON.stringify(usageDay(today).qt));
  out.drawnTwice = out.list.map(id => qt0[id][0]);
  // a 🎲 reroll
  Q.tokens = 3;
  const idx = Q.list.findIndex(q => !q.done && !(byId(q.tpl) || {}).fixed);
  const was = Q.list[idx].tpl;
  questReroll(idx);
  const now = Q.list[idx].tpl;
  out.reroll = { was, now, qt: JSON.parse(JSON.stringify(usageDay(today).qt)) };
  // the app swaps a quest in (a retired template, say)
  const j = Q.list.findIndex((q, k) => k !== idx && !q.done && !(byId(q.tpl) || {}).fixed);
  const before = Q.list[j].tpl;
  questSwapWhere(id => id === before, "test");
  out.auto = { before, after: Q.list[j].tpl, qt: JSON.parse(JSON.stringify(usageDay(today).qt)), swaps: usageDay(today).q[2] };
  // the weekend quest, from the draw's event
  logEvent("quest_gen", { ids: out.list, weekend: "d_weekendtest" });
  out.weekend = usageDay(today).qt.d_weekendtest;
  // ── quests on an older day (before qv): drawn three times, a reroll's quest done ──
  put("2026-10-27", { min: 70, qt: { a_plan: [3, 1, 0], c_stars: [3, 0, 0], d_clean: [0, 1, 0] } });
  const rep2 = buildUsageReport(0);
  out.questLine = rep2.split("\n").find(l => l.startsWith("Quest templates"));
  return out;
});

// game times
const games = Object.fromEntries(r.gameLine.replace(/^[^:]+: /, "").split(" | ").map(s => {
  const [g, rest] = s.split(/ (.*)/s); return [g, rest];
}));
const nums = s => (s.match(/[\d.]+s/g) || []).map(x => parseFloat(x));
ok(r.gxToday[7] === 1 && r.gxToday[8] === 1, "a new game counts its finished and quit games", JSON.stringify(r.gxToday));
ok(r.gxToday[3] === 600000, "a game left open half an hour counts 10 min", JSON.stringify(r.gxToday));
const [tFin, tQuit] = nums(games.thread);
ok(tFin === 128.2 && tQuit === 600.0, `Thread 2026-10-08: 128.2s finished, the one left open 26 min counts 600s (${games.thread})`);
const rain = nums(games.rain);
ok(rain[0] === 20.0 && rain[1] === 20.0, `rain: the days before times were logged don't thin the average (${games.rain})`);
const m = nums(games.match);
ok(m[0] === 30.0 && m[1] === 20.0 && m[2] === 600.0, `match today: 30s finished, 20s active, quit after 600s at most (${games.match})`);
for (const [g, s] of Object.entries(games)) {
  const [fin, act] = nums(s);
  if (/active/.test(s)) ok(act <= fin, `${g}: active time not above the whole game's (${s})`);
}
// quests
ok(r.drawnTwice.every(n => n === 1), "the day's quests drawn twice: offered once", JSON.stringify(r.drawnTwice));
ok(r.reroll.was !== r.reroll.now && r.reroll.qt[r.reroll.now][0] >= 1 && r.reroll.qt[r.reroll.was][2] === 1, `a reroll's quest counts as offered (${r.reroll.was} → ${r.reroll.now})`, JSON.stringify(r.reroll.qt));
ok(r.auto.before !== r.auto.after && r.auto.qt[r.auto.after][0] >= 1 && !r.auto.qt[r.auto.before][2], `a quest the app swapped in counts as offered, not as your swap (${r.auto.before} → ${r.auto.after})`, JSON.stringify(r.auto.qt));
ok(r.auto.swaps === 0, "…and isn't counted among the 🔇 swaps", String(r.auto.swaps));
ok(r.weekend && r.weekend[0] === 1, "the weekend quest counts as offered", JSON.stringify(r.weekend));
const qs = Object.fromEntries(r.questLine.replace(/^[^:]+\): /, "").split(" · ").map(s => { const [k, v] = s.split(" "); return [k, v.split("/").map(Number)]; }));
ok(Object.values(qs).every(([o, d]) => o >= d), "no quest done more often than offered", r.questLine);
ok(qs.c_stars && qs.c_stars[0] === 1, `an older day drawn three times counts once (c_stars ${qs.c_stars})`);
ok(qs.d_clean && qs.d_clean[0] === 1 && qs.d_clean[1] === 1, `an older day's quest from a reroll, done: offered once (d_clean ${qs.d_clean})`);
ok(qs.a_plan && qs.a_plan[0] === 2, `a_plan: offered on 2 days (the older one and today) (${qs.a_plan})`);
ok(!errors.length, "no page errors", errors.join("\n"));
await browser.close();
console.log(`\nreport: ${pass} passed, ${fail} failed`);
process.exit(fail ? 1 : 0);
