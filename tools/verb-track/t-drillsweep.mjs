// The tense drill, every tense and the corners:
//   • every tense, its sheets passed: the pool builds fast, only ready
//     verbs, and 300 drawn exercises each are sound — an answer the
//     grader takes, a prompt and an explanation that draw, nothing null;
//   • the interactions: the umlaut choice (1 / 2, for real), the wrong
//     tense (one more try, no grade), a hint (no ledger), Enter pressed
//     twice (one step), Say-it mode (Show, ✓ / ✗), ✕ before any answer
//     (back to the tense, no summary);
//   • Today: a drill miss on an item that is due anyway is asked once.
//   node t-drillsweep.mjs   (APP=fr)
import { openApp } from "./browser.mjs";
const APP = process.env.APP || "de";
let pass = 0, fail = 0;
const ok = (c, m, x = "") => { if (c) pass++; else { fail++; console.log("  ✗", m, x); } };
const { browser, page, errors } = await openApp({ app: APP, umlautAuto: false });

const sweep = await page.evaluate(() => {
  window.showCelebrateToast = () => {}; window.confettiBurst = () => {}; window.speak = () => {};
  GS_SHEETS.forEach(s => { S.verb.sh[s.id] = 100; });
  vxUnitsTick(true);
  const out = [];
  VX_UNITS.forEach(u => {
    const t0 = performance.now();
    const pool = vxDrillPool(u.id);
    const ms = Math.round(performance.now() - t0);
    const r = { unit: u.id, open: vxDrillOpen(u.id), pool: pool.length, ms, bad: [], kinds: {} };
    if (pool.some(p => !vxVerbReady(p.x))) r.bad.push("a verb not ready");
    const d = vxDrillStart(u.id);
    for (let i = 0; i < 300 && pool.length; i++) {
      let ex;
      try { ex = vxDrillNext(d); } catch (e) { r.bad.push("next threw " + e.message); break; }
      if (!ex) { r.bad.push("null exercise"); break; }
      r.kinds[ex.kind] = (r.kinds[ex.kind] || 0) + 1;
      const tag = `${ex.x.inf} ${ex.kind} ${ex.p} → ${ex.form.ans}`;
      if (!ex.form.acc.includes(ex.form.ans)) r.bad.push("answer not accepted: " + tag);
      if (vxGrade(ex.form.ans, ex) !== true) r.bad.push("own answer graded wrong: " + tag);
      try { vxPromptHtml(ex); vxWhyRow(ex); vxFormHtml(ex); vxItemLabel(ex); } catch (e) { r.bad.push("draw threw: " + tag + " " + e.message); }
      if (ex.item && !vxCatalog().some(it => it.id === ex.item)) r.bad.push("unknown item " + ex.item);
    }
    r.bad = [...new Set(r.bad)].slice(0, 5);
    out.push(r);
  });
  return out;
});
sweep.forEach(r => {
  ok(r.open, `${r.unit}: opens with its sheets passed`);
  ok(r.pool > 0, `${r.unit}: has verbs`, r.pool);
  ok(r.ms < 1500, `${r.unit}: pool in ${r.ms} ms`);
  ok(!r.bad.length, `${r.unit}: 300 exercises sound`, r.bad.join(" | "));
});
console.log(sweep.map(r => `${r.unit}: ${r.pool} verbs, ${r.ms} ms, ${JSON.stringify(r.kinds)}`).join("\n"));

// The interactions, in the real screens.
const start = async (unit, size = 0) => {
  await page.evaluate(u => renderDrillStart(u), unit);
  await page.click(`.vd-size >> nth=${size}`);
  await page.waitForSelector("#vd-screen");
};
// Force the next card: a given exercise.
const force = async fn => page.evaluate(fn);

// ✕ before any answer: back to the tense.
await start("pr", 2);
await page.click(".vd-screen .g-hud-btn");
ok(await page.evaluate(() => !!document.querySelector(".gr-uhead") && !_vd), "✕ before any answer: back to the tense, no summary");

if (APP === "de") {
  // The umlaut choice: fahrt for "du fährst"? No — a verb whose plain spelling is another real form: er fährt / ihr fahrt.
  await start("pr", 2);
  const set = await force(() => {
    const x = vxVerb("fahren"); const form = vxForm(x, "sc", "er");
    _vd.ex = { kind: "sc", x, p: "er", form, tense: "pr", item: "sc:fahren", drill: true }; _vd.answered = false; vdRender();
    return form.ans;
  });
  await page.fill("#vd-input", "fahrt");
  await page.keyboard.press("Enter");
  const asked = await page.waitForSelector(".vx-uml-ask", { timeout: 3000 }).then(() => true).catch(() => false);
  ok(asked, "umlaut off where it changes the form: asks 1 or 2", set);
  if (asked) {
    await page.keyboard.press("Enter"); // never picks
    ok(await page.evaluate(() => !_vd.answered), "Enter on the choice never picks");
    const right = await page.evaluate(() => [...document.querySelectorAll(".vx-uml-opts .g-opt")].findIndex(b => b.innerText.includes("fährt")) + 1);
    await page.keyboard.press(String(right));
    await page.waitForFunction(() => _vd.answered);
    ok(await page.evaluate(() => document.querySelector("#vd-fb .vx-res.ok") !== null), "the right pick is right");
  }
  // The wrong tense: one more try, no grade.
  await page.evaluate(() => {
    const x = vxVerb("gehen"); const form = vxForm(x, "pf", "ich");
    _vd.ex = { kind: "pf", x, p: "ich", form, tense: "pf", cell: "gehen|pf", drill: true }; _vd.answered = false; vdRender();
  });
  const n0 = await page.evaluate(() => _vd.n);
  await page.fill("#vd-input", "gehe");
  await page.keyboard.press("Enter");
  await page.waitForTimeout(150);
  ok(await page.evaluate(n0 => !_vd.answered && _vd.n === n0 && /vx-retry/.test(document.getElementById("vd-fb").innerHTML), n0), "another tense: pointed out, one more try, not graded");
  await page.fill("#vd-input", "bin gegangen");
  await page.keyboard.press("Enter");
  await page.waitForFunction(() => _vd.answered);
  ok(await page.evaluate(() => !!document.querySelector("#vd-fb .vx-res.ok")), "then the right tense is right");
}
// A hint: right, but no ledger form.
await start("pr", 2);
const hint = await page.evaluate(() => {
  const ex = _vd.ex; const was = S.verb.cov[ex.x.inf]; delete S.verb.cov[ex.x.inf];
  vdHint();
  document.getElementById("vd-input").value = ex.form.ans; vdCheck();
  const res = { answered: _vd.answered, cov: vxCovHas(ex.x.inf, ex.tense), cells: _vd.cells, chip: /hint/i.test(document.getElementById("vd-fb").innerText) };
  if (was !== undefined) S.verb.cov[ex.x.inf] = was;
  return res;
});
ok(hint.answered && !hint.cov && hint.cells === 0, "with a hint: right, no ledger form", JSON.stringify(hint));
// Enter twice: one step.
const c0 = await page.evaluate(() => _vd.n);
await page.keyboard.press("Enter"); await page.keyboard.press("Enter");
await page.waitForTimeout(200);
ok(await page.evaluate(c0 => _vd.n === c0 && !_vd.answered, c0), "Enter twice after an answer: one card on, not graded");
await page.click(".vd-screen .g-hud-btn");
await page.waitForSelector(".vd-sum");

// Say-it mode.
await page.evaluate(() => { S.prefs.speak = true; applyPrefClasses(); });
await start("pr", 0);
const say1 = await page.evaluate(() => ({ typed: document.getElementById("vd-typed").style.display, show: !!document.getElementById("vd-show") }));
ok(say1.typed === "none" && say1.show, "Say-it: no typing, a Show button", JSON.stringify(say1));
await page.keyboard.press("Enter");
await page.waitForTimeout(100);
ok(await page.evaluate(() => _vd.revealed && !_vd.answered), "Say-it: Enter shows the answer");
await page.click("#vd-actions .g-big-btn");
await page.waitForFunction(() => _vd.answered);
ok(await page.evaluate(() => _vd.right === 1), "Say-it: ✓ I said it counts as right");
await page.keyboard.press("Enter");
await page.waitForTimeout(100);
await page.keyboard.press("Enter");
await page.click("#vd-actions .g-sec-btn");
await page.waitForFunction(() => _vd.answered);
ok(await page.evaluate(() => _vd.right === 1 && _vd.n === 2 && _vd.missed.length === 1), "Say-it: ✗ Not yet is a miss");
await page.evaluate(() => { S.prefs.speak = false; applyPrefClasses(); vdLeave(); });

// Today: a drill miss on an item due anyway is asked once.
const once = await page.evaluate(() => {
  const due = vxDueItems();
  const it = (due.due[0] || due.fix[0] || {}).it;
  if (!it) return { skip: true };
  S.verb.dm[it.id] = studyToday();
  const q = buildPathQueue("regular").items.filter(x => x.w && x.w.vx && x.w.vx.item === it.id);
  delete S.verb.dm[it.id];
  return { n: q.length, id: it.id };
});
ok(once.skip || once.n === 1, "a drill miss on an item due anyway: asked once", JSON.stringify(once));
ok(!errors.length, "no page errors", errors.slice(0, 5).join(" | "));
console.log(`drill sweep${APP === "fr" ? " (fr)" : ""}: ${pass} passed, ${fail} failed`);
await browser.close();
process.exit(fail ? 1 : 0);
