// The fixes of 25 Oct 2026, in the real app (serve the repo root on :8765;
// npm install once in tools/audio/tests):
//   1 · "🩹 to fix" doesn't grow when a sheet is passed with nothing
//       missed: rules (and verb items) met today aren't "to fix" — nor in
//       the warm-up — until a later day; a miss still is, at once
//   2 · a lesson's drill on its page (☰ › 📖 Course) once its sheet is
//       passed, wherever: it finishes the lesson as Today's does, the
//       Today card's line goes, a drill card already in a session is
//       skipped (a mid-day update)
//   3 · fast learning: several lessons in one day from the Course
//
//   node t-fixes3.mjs
import { openApp } from "../verb-track/browser.mjs";

let fails = 0;
const say = (r, tag) => { console.log(`== ${tag}`); r.log.forEach(l => console.log(l)); r.fails.forEach(l => console.log(l)); fails += r.fails.length; };
const HELP = () => {
  window.mistakeHeld = () => false;
  window.__log = [], window.__fails = [];
  window.ok = (c, m) => { (c ? __log : __fails).push((c ? "✓ " : "✗ ") + m); };
  window.cxAnswerCur = right => {
    const r = _cx, cur = r.list[r.i], set = cxSet(cur.set), item = cur.item, k = cxItemKind(set, item);
    if (k === "pick" || k === "respond") { const opts = item.o || set.o, want = right ? item.a[0] : opts.find(o => o !== item.a[0]); return cxPick(opts.indexOf(want)); }
    if (k === "write" || k === "open") { document.getElementById("cx-text").value = "Ich habe keinen Fernseher und kein Auto."; return cxCheckCur(); }
    if (k === "order") { cur.picked = cur.bank.map((b, bi) => [b.i, bi]).sort((x, y) => x[0] - y[0]).map(x => x[1]); if (!right) cur.picked.reverse(); return cxCheckCur(); }
    if (cur.mode === "tiles") {
      if (right) { const words = cxTiles(set, item).tiles; const used = new Set(); cur.picked = words.map(w => { const bi = cur.bank.findIndex((t, i) => t.w === w && !used.has(i)); used.add(bi); return bi; }); }
      else { const w0 = cxTiles(set, item).tiles[0]; cur.picked = [cur.bank.findIndex(t => t.w === w0)]; }
      return cxCheckCur();
    }
    const inp = document.getElementById("cx-input");
    inp.value = right ? item.a[0] : "Das ist falsch";
    cxCheckCur();
    if (!r.answered) cxCheckCur();
  };
  // A run in the runner to its end, every answer right (or the first wrong).
  window.runAll = (missFirst = false) => { let g = 0; while (_cx && !_cx.done && g++ < 200) { cxAnswerCur(!(missFirst && g === 1)); cxNext(); } cxFinish(); };
  window.passSheetMenu = id => { renderCourseSheet(id); cxSheetResult(id, 1, true, "menu"); renderCourseSection(cxSheet(id).sec); };
  window.drillBtn = () => !!document.querySelector(`[onclick^="renderLessonDrill("]`);
};

// ── 1 · to fix ──
{
  const { browser, page, errors } = await openApp({ course: true });
  await page.evaluate(HELP);
  const r = await page.evaluate(() => {
    pathRollDay();
    const fix0 = cxTodayCounts().fix;
    passSheetMenu("cx.snd1");
    const c = cxTodayCounts(), rules = cxSheet("cx.snd1").rid;
    ok(c.fix === fix0, `sheet passed, nothing missed: to fix stays ${fix0} (was +${rules.length} before)`);
    ok(!cxTodayParts().some(p => p.part === "warm"), "no warm-up of yesterday's slips for rules met today");
    ok(rules.every(r => cxRuleWS(r).st === 1 && cxRuleWS(r).lrn), "the rules are in review (learning step), untouched");
    ok(!cxDueRules().due.length, "nor counted as due");
    // a miss today is one to fix at once
    const w = cxRuleWS(rules[0]); applyWrong(w, { kind: "recall" });
    ok(cxDueRules().fix.includes(rules[0]) && cxTodayCounts().fix === fix0 + 1, "a rule missed today: to fix at once");
    // tomorrow: still in its learning step → to fix (the warm-up asks it)
    const real = Date.now.bind(Date); Date.now = () => real() + 864e5; pathRollDay();
    ok(cxDueRules().fix.length === rules.length, `the next day: the ${rules.length} rules still learning are to fix`);
    ok(cxTodayParts().some(p => p.part === "warm"), "…and the warm-up asks them");
    Date.now = real;
    // verb items: the same count
    ok(vxOn(), "the verb track is on");
    if (vxOn()) {
      const it = vxCatalog().find(x => !(S.words[vxKey(x.id)] || {}).st), ws = S.words[vxKey(it.id)] || (S.words[vxKey(it.id)] = { st: 0, correct: 0, wrong: 0, streak: 0, displayStreak: 0 });
      const before = vxTodayCounts().fix, was = JSON.stringify(ws);
      if (!ws.st) { introduceWord(ws); ok(vxTodayCounts().fix === before, "a verb item met today: not to fix"); ws.wrong = 1; ok(vxTodayCounts().fix === before + 1, "missed: to fix"); }
      Object.keys(ws).forEach(k => delete ws[k]); Object.assign(ws, JSON.parse(was));
    }
    return { log: __log, fails: __fails };
  });
  say(r, "1 · to fix");
  errors.forEach(e => { console.log("✗ page error: " + e); fails++; });
  await browser.close();
}

// ── 2 · the drill on the lesson page; mid-day ──
{
  const { browser, page, errors } = await openApp({ course: true });
  await page.evaluate(HELP);
  const r = await page.evaluate(() => {
    pathRollDay();
    S.path.sessionLen = "regular";
    // Today's drill card, as a session built before (path.js) holds it
    const drillCard = { t: "cx", part: "drill", sec: "s0.sounds", qn: cxPartSize({ part: "drill" }) };
    renderCourseSection("s0.sounds");
    ok(!drillBtn(), "no drill button before the sheet is passed");
    passSheetMenu("cx.snd1");
    ok(drillBtn(), "sheet passed in ☰ › Course: its drill on the lesson page");
    ok(/its drill, in your session/.test(cxTodayHtml()), "Today's card: its drill is what's left");
    const dq0 = S.course.dq["drill:s0.sounds"] || 0;
    renderLessonDrill("s0.sounds");
    ok(_cx && _cx.opts.kind === "drill" && _cx.list.length > 0, `the drill runs (${_cx.list.length} questions)`);
    runAll();
    ok(cxSecDone("s0.sounds") && S.course.dd["sec:s0.sounds"], "finished: the lesson is done");
    ok(!/Sounds/.test(cxTodayHtml()), "Today's card no longer names it");
    ok(!cxTodayParts().some(p => p.sec === "s0.sounds"), "nothing of it left in Today");
    ok(!drillBtn(), "the lesson page: no drill button any more");
    ok((S.course.dq["drill:s0.sounds"] || 0) > dq0, "its answers counted for today's plan");
    ok(!cxPartLive(drillCard), "the drill card in the session built earlier is skipped");
    // a lesson whose sheet came in Today: same button
    return { log: __log, fails: __fails };
  });
  say(r, "2 · the lesson's drill outside Today");
  errors.forEach(e => { console.log("✗ page error: " + e); fails++; });
  await browser.close();
}

// ── 3 · fast learning: three lessons in a day ──
{
  const { browser, page, errors } = await openApp({ course: true });
  await page.evaluate(HELP);
  const r = await page.evaluate(() => {
    pathRollDay();
    const done = [];
    for (const id of ["s0.sounds", "s0.gender", "s0.art"]) {
      const s = cxSection(id);
      for (const sh of s.sheets) passSheetMenu(sh);
      ok(drillBtn(), `${id}: all its sheets passed — its drill offered`);
      renderLessonDrill(id); runAll();
      if (cxSecDone(id)) done.push(id);
    }
    ok(done.length === 3, `three lessons done in one day (${done.join(", ")})`);
    ok(!cxTodayParts().some(p => ["sheet", "drill", "testout"].includes(p.part) && done.includes(p.sec)), "Today asks none of them again");
    ok(cxTodayCounts().fix === 0, "to fix: 0 (nothing missed)");
    const nx = cxNextLessonDay();
    ok(nx > studyToday(), `the next lesson after a break (${nx})`);
    return { log: __log, fails: __fails };
  });
  say(r, "3 · fast learning");
  errors.forEach(e => { console.log("✗ page error: " + e); fails++; });
  await browser.close();
}
console.log(fails ? `\n${fails} FAILED` : "\nall passed");
process.exit(fails ? 1 : 0);
