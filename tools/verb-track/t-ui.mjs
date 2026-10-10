// Walks the new screens and takes screenshots (phone + desktop).
import { openApp } from "./browser.mjs";
const OUT = process.env.OUT || "/tmp/vx-shots";
import fs from "node:fs";
fs.mkdirSync(OUT, { recursive: true });
const sizes = (process.env.SIZES || "390x844,1280x900").split(",").map(s => s.split("x").map(Number));
for (const [w, h] of sizes) {
  const tag = `${w}`;
  const { browser, page, errors } = await openApp({ width: w, height: h });
  const shot = async name => { await page.waitForTimeout(350); await page.screenshot({ path: `${OUT}/${tag}-${name}.png`, fullPage: false }); };
  const full = async name => { await page.waitForTimeout(350); await page.screenshot({ path: `${OUT}/${tag}-${name}.png`, fullPage: true }); };
  await shot("01-today");
  await page.evaluate(() => renderVerbSwitch());
  await page.waitForSelector(".vx-act");
  await full("02-switch");
  await page.click(".vx-act .g-big-btn");
  await page.waitForSelector(".gr-units");
  await full("03-grammar");
  await page.evaluate(() => renderGrammarUnit("pf"));
  await full("04-unit-pf");
  await page.evaluate(() => renderGrammarSheet("pf2"));
  await shot("05-sheet-struct");
  for (let i = 0; i < 3; i++) { await page.click("#gs-next"); await shot(`06-sheet-step${i + 2}`); }
  await page.click("#gs-next"); // quiz
  await shot("07-quiz-q1");
  // answer the quiz: pick the right options
  for (let k = 0; k < 8; k++) {
    const done = await page.evaluate(() => !_gs || !_gs.quiz || _gs.quiz.done);
    if (done) break;
    await page.evaluate(() => {
      const q = _gs.quiz, cur = q.list[q.i];
      if (cur.q.k === "type") { document.getElementById("gs-input").value = cur.q.a[0]; gsQuizCheck(); }
      else if (cur.q.k === "order") { cur.picked = cur.q.a.map((_, i) => i); gsQuizCheck(); }
      else gsQuizPick(cur.q.a);
    });
    if (k === 0) await shot("08-quiz-answered");
    await page.waitForTimeout(900);
    await page.evaluate(() => gsQuizNext());
  }
  await shot("09-quiz-result");
  await page.evaluate(() => renderGrammarVerbs("a1"));
  await shot("10-verbs-a1");
  // Today session
  await page.evaluate(() => { backToMenu(); });
  await shot("11-today-after");
  await page.evaluate(() => startPathSession("regular"));
  await page.waitForSelector("#gs-viewer");
  await shot("12-path-sheet");
  // finish sheet quickly: jump to quiz and answer
  await page.evaluate(() => { while (_gs.step < _gs.steps.length) gsGo(1); });
  for (let k = 0; k < 10; k++) {
    const done = await page.evaluate(() => !_gs || !_gs.quiz || _gs.quiz.done);
    if (done) break;
    await page.evaluate(() => { const q = _gs.quiz, cur = q.list[q.i]; if (cur.q.k === "type") { document.getElementById("gs-input").value = cur.q.a[0]; gsQuizCheck(); } else if (cur.q.k === "order") { cur.picked = cur.q.a.map((_, i) => i); gsQuizCheck(); } else gsQuizPick(cur.q.a); });
    await page.waitForTimeout(850);
    await page.evaluate(() => gsQuizNext());
  }
  await shot("13-path-sheet-done");
  await page.evaluate(() => gsQuizFinish());
  // walk to the first verb items
  let n = 0;
  for (let k = 0; k < 40 && n < 4; k++) {
    const t = await page.evaluate(() => { const it = pathSession && pathSession.cur; return it ? it.t + (it.w && it.w.vx ? ":vx" : "") : "none"; });
    if (t === "learn:vx") { await shot(`14-path-vx-learn-${n}`); n++; await page.evaluate(() => pathNext()); continue; }
    if (t === "typed:vx") {
      await shot(`15-path-vx-typed-${n}`);
      await page.evaluate(() => { const ex = pathSession.cur.w.vx; document.getElementById("p-input").value = ex.form.ans; pathCheckTyped(); });
      await shot(`16-path-vx-fb-${n}`); n++;
      await page.waitForTimeout(900); await page.evaluate(() => pathGo()); continue;
    }
    if (t === "sheet") { await page.evaluate(() => { _gs.quiz = null; pathNext(); }); continue; }
    if (t === "none") break;
    // skip other items
    await page.evaluate(() => { const s = pathSession; s.answered = false; pathNext(); });
  }
  console.log(tag, "errors:", errors.length ? errors : "none");
  await browser.close();
}
