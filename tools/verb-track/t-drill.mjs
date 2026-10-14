// The tense drill (📐 Grammar › a tense › 🎯 Drill), in the real app:
//   • it opens once every sheet of the tense is passed; only verbs you've
//     met (ready for the track), taking turns — never the same twice in a row;
//   • outside the plan: Today's plan, its count and the quests don't move;
//   • a right form fills the ledger (not with a hint); a rule or item Today
//     would review now steps up — once a day, never past 🌿 Familiar; above
//     that, or not due, nothing changes;
//   • a miss: nothing drops, the item is checked at the end of the next
//     day's Today session (not today's), and that check clears it;
//   • both logs: the usage log (grammar:drill answers, 🎯 in the report)
//     and the learning log (the verb's history);
//   • the screens: 10 / 30 / ∞, a round with mistakes, their review, ✕ on
//     ∞ ends it with the same summary; phone and desktop, nothing cut off.
//   node t-drill.mjs   (APP=fr)
import { openApp } from "./browser.mjs";
const APP = process.env.APP || "de";
let pass = 0, fail = 0;
const ok = (c, m, x = "") => { if (c) pass++; else { fail++; console.log("  ✗", m, x); } };

const { browser, page, errors } = await openApp({ app: APP });
const r = await page.evaluate(() => {
  window.showCelebrateToast = () => {}; window.confettiBurst = () => {}; window.speak = () => {}; window.playSuccess = () => {}; window.playFailure = () => {};
  const out = {};
  const unit = "pr";
  vxSheetIds(unit).forEach(id => { delete S.verb.sh[id]; });
  out.lockedBefore = !vxDrillOpen(unit) && /🔒/.test(gsDrillCardHtml(unit));
  vxSheetIds(unit).forEach(id => { S.verb.sh[id] = 100; });
  out.open = vxDrillOpen(unit);
  const pool = vxDrillPool(unit);
  out.pool = pool.length;
  out.poolReady = pool.every(p => vxVerbReady(p.x));
  out.notReady = vxVerbs().filter(x => !vxVerbReady(x)).length;
  // Turns: never the same verb twice in a row, and round the whole pool.
  const d = vxDrillStart(unit), seen = new Set();
  let prev = "", twice = 0;
  for (let i = 0; i < pool.length * 2; i++) { const ex = vxDrillNext(d); if (ex.x.inf === prev) twice++; prev = ex.x.inf; seen.add(ex.x.inf); }
  out.turns = { twice, seen: seen.size, pool: pool.length };
  // Outside the plan.
  const before = { plan: JSON.stringify(S.path.plan || null), quests: JSON.stringify(S.quests || null), today: JSON.stringify(typeof pathTodayDone === "function" ? pathTodayDone() : null) };
  // A rule with one of your verbs.
  const R = VX_RULES.find(r => r.unit === unit && vxDrillPool(unit).some(p => p.choices.some(c => c.rule === r)));
  const x = vxDrillPool(unit).find(p => p.choices.some(c => c.rule === R)).x;
  const ex = vxDrillExercise({ rule: R, x });
  const ws = getWS("vx", "r:" + R.id);
  const reset = (st, due) => { Object.assign(ws, { st, pk: st, k: 1, cf: 0, rp: 0, fl: 0, lrn: 0, sAt: due ? Date.now() - 10 * 864e5 : Date.now() - 864e5, dueAt: due ? Date.now() - 1000 : Date.now() + 5 * 864e5 }); };
  reset(2, true);
  const a1 = vxDrillAnswer(ex, true, { given: ex.form.ans });
  out.up = [a1.up && a1.up.to, ws.st];
  const a2 = vxDrillAnswer(ex, true, { given: ex.form.ans });
  out.onceADay = !a2.up && ws.st === 3;
  reset(VX_DRILL_CAP, true); const due4 = ws.dueAt;
  const a3 = vxDrillAnswer(ex, true, { given: ex.form.ans });
  out.cap = !a3.up && ws.st === VX_DRILL_CAP && ws.dueAt === due4;
  reset(3, false); const due3 = ws.dueAt;
  vxDrillAnswer(ex, true, { given: ex.form.ans });
  out.notDue = ws.st === 3 && ws.dueAt === due3;
  reset(3, true);
  vxDrillAnswer(ex, true, { given: ex.form.ans, hint: true });
  out.hint = ws.st === 3;
  // A miss: nothing drops; checked tomorrow.
  reset(5, false);
  const a4 = vxDrillAnswer(ex, false, { given: "xx" });
  out.miss = { st: ws.st, check: a4.check, dm: S.verb.dm["r:" + R.id], tomorrow: addDays(studyToday(), 1) };
  // The ledger: a form right fills it, with a hint it doesn't.
  const cellP = vxDrillPool(unit).find(p => p.choices.some(c => c.cell));
  const cell = cellP.choices.find(c => c.cell).cell;
  const cex = vxCellExercise(cell);
  const covKey = cell.x.inf;
  const wasCov = S.verb.cov[covKey];
  delete S.verb.cov[covKey];
  vxDrillAnswer(cex, true, { given: cex.form.ans, hint: true });
  out.hintNoCell = !vxCovHas(covKey, cell.t);
  const a5 = vxDrillAnswer(cex, true, { given: cex.form.ans });
  out.cell = a5.cell && vxCovHas(covKey, cell.t);
  if (wasCov !== undefined) S.verb.cov[covKey] = wasCov | S.verb.cov[covKey];
  // Logs.
  const day = usageDay();
  out.usage = { dr: day.vx && day.vx.dr, ans: day.ans["grammar:drill"] };
  out.report = buildUsageReport(0).split("\n").filter(l => l.includes("🎯")).slice(0, 2);
  out.learn = !!(S.learn.verbs[x.inf] || S.learn.verbs[cell.x.inf]);
  out.after = { plan: JSON.stringify(S.path.plan || null) === before.plan, quests: JSON.stringify(S.quests || null) === before.quests, today: JSON.stringify(typeof pathTodayDone === "function" ? pathTodayDone() : null) === before.today };
  // Today: not today…
  const today = buildPathQueue("regular").items;
  out.todayHas = today.some(it => it.w && it.w.vx && it.w.vx.item === "r:" + R.id && it.drillCheck);
  // …tomorrow, at the end of the session.
  const real = Date.now.bind(Date); const RD = Date;
  const off = 864e5;
  Date.now = () => real() + off;
  window.Date = class extends RD { constructor(...a) { if (a.length) super(...a); else super(RD.now() + off); } static now() { return real() + off; } };
  try {
    pathRollDay(); invalidatePathScan();
    const q = buildPathQueue("regular").items;
    const at = q.findIndex(it => it.drillCheck && it.w.vx.item === "r:" + R.id);
    const lastReal = q.map((it, i) => it.t !== "bonus" && !it.drillCheck ? i : -1).reduce((a, b) => Math.max(a, b), -1);
    out.tomorrow = { at, n: q.length, lastReal, kicker: "" };
    if (at >= 0) {
      const ex2 = q[at].w.vx;
      vxRecordAnswer(ex2, true, { given: ex2.form.ans });
      out.cleared = !S.verb.dm["r:" + R.id];
    }
  } finally { Date.now = real; window.Date = RD; }
  return out;
});
ok(r.lockedBefore, "locked until every sheet of the tense is passed");
ok(r.open && r.pool > 5, "opens once they are", r.pool);
ok(r.poolReady && r.notReady > 0, "only verbs you've met (ready for the track)", JSON.stringify([r.pool, r.notReady]));
ok(r.turns.twice === 0 && r.turns.seen >= Math.min(r.turns.pool, r.turns.pool * 0.9), "verbs take turns, never twice in a row", JSON.stringify(r.turns));
ok(r.up[0] === 3 && r.up[1] === 3, "a rule Today would review now steps up", JSON.stringify(r.up));
ok(r.onceADay, "once a day: a second right answer moves nothing");
ok(r.cap, "never past 🌿 Familiar: at the cap nothing changes, not even its review day");
ok(r.notDue, "not due (nor early enough, as in Today): nothing changes");
ok(r.hint, "with a hint: no step up");
ok(r.miss.st === 5 && r.miss.check && r.miss.dm === r.miss.tomorrow, "a miss: nothing drops, checked tomorrow", JSON.stringify(r.miss));
ok(r.hintNoCell, "a form with a hint doesn't fill the ledger");
ok(r.cell, "a form right fills the ledger");
ok(r.usage.dr && r.usage.dr[0] >= 8 && r.usage.ans && r.usage.ans[0] >= 8, "the usage log counts the drill", JSON.stringify(r.usage));
ok(r.report.length >= 1, "the usage report shows 🎯", r.report.join(" | "));
ok(r.learn, "the learning log has the verb");
ok(r.after.plan && r.after.quests && r.after.today, "Today's plan, count and quests don't move", JSON.stringify(r.after));
ok(!r.todayHas, "not checked in today's Today");
ok(r.tomorrow.at > r.tomorrow.lastReal, "checked at the end of tomorrow's session", JSON.stringify(r.tomorrow));
ok(r.cleared, "that check clears it");

// The screens, phone and desktop.
for (const [w, h] of [[390, 844], [1280, 900]]) {
  await page.setViewportSize({ width: w, height: h });
  const fits = async what => ok(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth + 1), `${w}: ${what} fits`);
  await page.evaluate(() => { vxSheetIds("pr").forEach(id => { S.verb.sh[id] = 100; }); renderGrammarUnit("pr"); });
  await page.click(".gr-drill");
  await page.waitForSelector(".vd-size");
  await fits("the start screen");
  await page.click(".vd-size >> nth=0");
  await page.waitForSelector("#vd-input");
  await fits("a card");
  for (let i = 0; i < 10; i++) {
    const ans = await page.evaluate(() => _vd.ex.form.ans);
    await page.fill("#vd-input", i % 4 === 1 ? "zzz" : ans);
    await page.keyboard.press("Enter");
    await page.waitForFunction(() => _vd && _vd.answered);
    if (i % 4 === 1) await page.waitForTimeout(1300);
    await page.keyboard.press("Enter");
    await page.waitForTimeout(120);
  }
  await page.waitForSelector("#vd-review");
  const sum = await page.evaluate(() => document.getElementById("main-screen").innerText);
  ok(/7\/10|8\/10/.test(sum) && /mistakes|errores/i.test(sum), `${w}: the round's summary`, sum.slice(0, 200));
  await fits("the summary");
  await page.click("#vd-review");
  await page.waitForSelector("#vd-input");
  const n = await page.evaluate(() => _vd.review.list.length);
  for (let i = 0; i < n; i++) {
    const ans = await page.evaluate(() => _vd.ex.form.ans);
    await page.fill("#vd-input", ans);
    await page.keyboard.press("Enter");
    await page.waitForFunction(() => _vd && _vd.answered);
    await page.keyboard.press("Enter");
    await page.waitForTimeout(120);
  }
  const sum2 = await page.evaluate(() => document.getElementById("main-screen").innerText);
  ok(new RegExp(`${n}/${n}`).test(sum2) && /once more|otra vez/i.test(sum2), `${w}: the review, then the summary again`, sum2.slice(0, 260));
  ok(await page.evaluate(() => !document.getElementById("vd-review")), `${w}: nothing left to review`);
  // ∞: three answers, then ✕
  await page.evaluate(() => renderDrillStart("pr"));
  await page.click(".vd-size >> nth=2");
  await page.waitForSelector("#vd-input");
  for (let i = 0; i < 3; i++) {
    await page.fill("#vd-input", i === 0 ? "qqq" : await page.evaluate(() => _vd.ex.form.ans));
    await page.keyboard.press("Enter");
    await page.waitForFunction(() => _vd && _vd.answered);
    await page.waitForTimeout(i === 0 ? 1300 : 50);
    await page.keyboard.press("Enter");
    await page.waitForTimeout(120);
  }
  ok(await page.evaluate(() => /^4$/.test(document.getElementById("vd-count").textContent)), `${w}: ∞ counts on`);
  await page.click(".vd-screen .g-hud-btn");
  await page.waitForSelector("#vd-review");
  const sum3 = await page.evaluate(() => document.getElementById("main-screen").innerText);
  ok(/2\/3/.test(sum3), `${w}: ✕ ends ∞ with its summary and the review offer`, sum3.slice(0, 200));
  await page.click(".vd-act .g-sec-btn >> nth=1");
  ok(await page.evaluate(() => !!document.querySelector(".gr-uhead")), `${w}: back to the tense`);
}
ok(!errors.length, "no page errors", errors.slice(0, 5).join(" | "));
console.log(`drill${APP === "fr" ? " (fr)" : ""}: ${pass} passed, ${fail} failed`);
await browser.close();
process.exit(fail ? 1 : 0);
