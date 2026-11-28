// Bonus rounds in a Today session (js/path.js pathBonusSlots): by the
// questions the session really holds, not the length picked — 40 or more →
// 2, 12–39 → 1, fewer → none. A Long session picked for the last 10 cards
// of the day brings none (it brought three). A course card counts its
// questions; a bonus is never the last card, never two in a row; a minion
// takes a slot, not one more. Serve the repo (node run-suite.mjs t-bonus.mjs).
import { openApp } from "../verb-track/browser.mjs";
const { browser, page, errors } = await openApp();
let pass = 0, fail = 0;
const ok = (c, m, x = "") => { if (c) { pass++; console.log("  ✓", m); } else { fail++; console.log("  ✗", m, x); } };

const r = await page.evaluate(() => {
  const out = {};
  out.slots = [0, 5, 11, 12, 20, 39, 40, 80].map(n => [n, pathBonusSlots(n).length]);
  const qOf = x => x.t === "cx" ? x.qn || 1 : x.t !== "learn" && x.t !== "bonus" && x.t !== "sheet" && !x.warm ? 1 : 0;
  const look = items => {
    const b = items.map((x, i) => x.t === "bonus" ? i : -1).filter(i => i >= 0);
    return { q: items.reduce((n, x) => n + qOf(x), 0), bonus: b.length, last: b.includes(items.length - 1),
      twoInRow: b.some((i, k) => k && b[k - 1] === i - 1), minion: items.filter(x => x.t === "bonus" && x.minion).length };
  };
  // plenty due: each length as picked
  const now = Date.now();
  Object.values(S.words).forEach(ws => { if (ws && ws.st && !ws.rt) ws.dueAt = now - 864e5; });
  invalidatePathScan();
  out.full = ["quick", "regular", "long"].map(len => { const q = buildPathQueue(len); return [len, look(q.items)]; });
  // a minion day: it takes a slot
  const rnd = Math.random; Math.random = () => 0.01; S.games.minionDay = "";
  out.minion = look(buildPathQueue("long").items);
  Math.random = rnd;
  return out;
});
// the end of the day: only 10 cards owed, the plan otherwise met (nothing
// to pad with), Long picked — a profile without verb items
const two = await openApp({ vxOff: true });
r.tenLeft = await two.page.evaluate(() => {
  const qOf = x => x.t === "cx" ? x.qn || 1 : x.t !== "learn" && x.t !== "bonus" && x.t !== "sheet" && !x.warm ? 1 : 0;
  const now = Date.now(); let k = 0;
  Object.values(S.words).forEach(ws => { if (ws && ws.st && !ws.rt) { ws.dueAt = k++ < 10 ? now - 864e5 : now + 30 * 864e5; delete ws.lrn; delete ws.rp; delete ws.fl; } });
  S.path.newPerDay = 0; if (S.path.plan) S.path.plan.pace = 0;
  if (S.quests && S.quests.m) S.quests.m.ok = 999;
  window.questNudges = () => ({ focus: [], games: [] }); // (no quest asking for words of its own)
  invalidatePathScan();
  const items = buildPathQueue("long").items;
  return { q: items.reduce((n, x) => n + qOf(x), 0), bonus: items.filter(x => x.t === "bonus").length };
});
errors.push(...two.errors);
await two.browser.close();
const want = { 0: 0, 5: 0, 11: 0, 12: 1, 20: 1, 39: 1, 40: 2, 80: 2 };
ok(r.slots.every(([n, k]) => want[n] === k), "40+ questions → 2, 12–39 → 1, fewer → none", JSON.stringify(r.slots));
for (const [len, x] of r.full) {
  const exp = x.q >= 40 ? 2 : x.q >= 12 ? 1 : 0;
  ok(x.bonus === exp, `${len} (${x.q} questions): ${x.bonus} bonus round${x.bonus === 1 ? "" : "s"}`, JSON.stringify(x));
  ok(!x.last && !x.twoInRow, `${len}: never the last card, never two in a row`, JSON.stringify(x));
}
const long = r.full.find(([l]) => l === "long")[1];
ok(long.bonus <= 2, `Long: at most 2 (it was 3)`, JSON.stringify(long));
ok(r.minion.minion === 1 && r.minion.bonus === long.bonus, `a minion takes one of the slots, not one more (${r.minion.bonus} offers, 1 minion)`, JSON.stringify(r.minion));
ok(r.tenLeft.q < 12 && r.tenLeft.bonus === 0, `Long picked for the last ${r.tenLeft.q} cards of the day: no bonus round`, JSON.stringify(r.tenLeft));
ok(!errors.length, "no page errors", errors.join("\n"));
await browser.close();
console.log(`\nbonus: ${pass} passed, ${fail} failed`);
process.exit(fail ? 1 : 0);
