// A sheet's place in the day, driven in the real app: a new sheet passed on the
// grammar screen uses up one of the day's two and its answers count in the plan;
// a retake of a passed sheet, a mastery quiz or a peek counts nothing; in Today
// the count (x/N) adds each sheet's questions, moves with them, never goes back
// and never changes its total ("Read it again" included).  (APP=fr)
import { openApp } from "./browser.mjs";
const app = process.env.APP || "de";
const { browser, page, errors } = await openApp({ app });
const r = await page.evaluate(() => {
  if (!vxOn()) vxSwitchOn();
  const log = [], fails = [];
  const ok = (c, m) => { (c ? log : fails).push((c ? "✓ " : "✗ ") + m); };
  const answer = right => { const g = _gs, cur = g.quiz.list[g.quiz.i], Q = cur.q;
    if (Q.k === "type") { document.getElementById("gs-input").value = right ? Q.a[0] : "xyz"; gsQuizCheck(); }
    else if (Q.k === "order") { cur.picked = Q.a.map((_, i) => i); if (!right) cur.picked.reverse(); gsQuizCheck(); }
    else gsQuizPick(right ? Q.a : (Q.a + 1) % Q.o.length); };
  const next = () => { window.mistakeHeld = () => false; gsQuizNext(); };
  const mok = () => S.quests.m.ok;
  const toQuiz = () => { while (_gs.step < _gs.steps.length) gsGo(1); };
  const runQuiz = (missFirst) => { let rights = 0, k = 0; while (!_gs.quiz.done) { const r = !(missFirst && k++ === 0); answer(r); if (r) rights++; next(); } return rights; };
  // 1 · pending sheet passed on the grammar screen
  let id = vxPendingSheets()[0], m0 = mok(), ns0 = S.verb.ns;
  renderGrammarSheet(id); toQuiz(); let n = _gs.quiz.n, rights = runQuiz(false);
  ok(vxSheetPassed(id) && mok() - m0 === n && S.verb.ns - ns0 === 1, `grammar screen, new sheet ${id} passed: plan +${mok() - m0} (= ${n} questions), daily sheets +${S.verb.ns - ns0}`);
  // 2 · retake of the same (passed) sheet
  m0 = mok(); ns0 = S.verb.ns;
  renderGrammarSheet(id); toQuiz(); runQuiz(false);
  ok(mok() === m0 && S.verb.ns === ns0, `retake of passed ${id}: plan +${mok() - m0}, daily sheets +${S.verb.ns - ns0}`);
  // 3 · pending sheet failed on the grammar screen (1 miss, asked again at the end)
  id = vxPendingSheets()[0]; m0 = mok(); ns0 = S.verb.ns;
  renderGrammarSheet(id); toQuiz(); n = _gs.quiz.n; rights = runQuiz(true);
  ok(!vxSheetPassed(id) && mok() - m0 === rights && S.verb.ns === ns0, `grammar screen, ${id} failed (1 miss): plan +${mok() - m0} (= ${rights} right answers incl. the re-ask), daily sheets +${S.verb.ns - ns0}, still pending`);
  // 3b · Retake button after failing: still not passed → counts
  m0 = mok(); gsQuizRetake(); n = _gs.quiz.n; runQuiz(false);
  ok(vxSheetPassed(id) && mok() - m0 === n && S.verb.ns - ns0 === 1, `Retake after failing ${id}, all right: plan +${mok() - m0}, now passed, daily sheets +${S.verb.ns - ns0}`);
  // 4 · mastery quiz (not part of the plan)
  const unit = VX_UNITS.find(u => vxUnitState(u.id) >= 1).id;
  vxSheetIds(unit).forEach(s => { S.verb.sh[s] = S.verb.sh[s] || 100; });
  m0 = mok(); renderGrammarMastery(unit); runQuiz(false);
  ok(mok() === m0, `mastery quiz (${unit}): plan +${mok() - m0}`);
  // 5 · peek (a quick look from an exercise): records nothing
  id = vxPendingSheets()[0]; m0 = mok(); ns0 = S.verb.ns;
  gsPeek(id); const peekQuiz = _gs.mode === "peek" && _gs.steps.length > 0; while (_gs.step < _gs.steps.length - 1) gsGo(1); gsPeekClose();
  ok(peekQuiz && mok() === m0 && S.verb.ns === ns0 && !vxSheetPassed(id), `peek at ${id} (read to the end): plan +${mok() - m0}, daily sheets +${S.verb.ns - ns0}, not passed`);
  // 6 · Today, with a sheet: counter includes its questions, moves per question, total never changes
  S.verb.ns = 0; // fresh allowance for the Today part
  const pendT = vxSheetsToday();
  startPathSession("regular", { noBonus: true });
  const s = pathSession, cnt = () => (document.getElementById("p-count") || {}).textContent;
  const sheets = s.items.filter(x => x.t === "sheet");
  const cards = s.items.filter(x => x.t !== "bonus" && x.t !== "learn" && x.t !== "sheet" && !x.warm && !x.repair).length;
  const sq = sheets.reduce((a, x) => a + gqSheetSize(vxSheet(x.sheet)), 0);
  const total0 = +cnt().split("/")[1];
  ok(sheets.length === pendT.length && total0 === cards + sq, `Today: ${sheets.length} sheet(s) [${sheets.map(x => x.sheet)}], counter total ${total0} = ${cards} cards + ${sq} sheet questions`);
  let guard = 0, totals = new Set([total0]), seq = [], plan0 = mok(), sheetRights = 0, sheetMiss = false, mono = true, last = 0;
  while (pathSession && s.cur && guard++ < 400) {
    const it = s.cur;
    if (it.t === "repairOffer" || s.repairPhase) break;
    if (it.t === "sheet") {
      toQuiz(); const qn = _gs.quiz.n; ok(qn === gqSheetSize(vxSheet(it.sheet)), `sheet ${it.sheet} quiz has ${qn} questions = counted size`);
      while (!_gs.quiz.done) {
        const c = cnt(); seq.push(c); totals.add(+c.split("/")[1]);
        const pos = +c.split("/")[0]; if (pos < last) mono = false; last = pos;
        const right = sheetMiss || _gs.quiz.i !== 1; if (!right) sheetMiss = true; // one miss in the first sheet
        answer(right); if (right) sheetRights++; next();
      }
      if (!vxSheetPassed(it.sheet)) { // failed in Today: "Read it again", then its quiz once more
        seq.push("(read again)"); gsRestart(); seq.push(cnt()); toQuiz();
        while (!_gs.quiz.done) { const c = cnt(); seq.push(c); const pos = +c.split("/")[0]; if (pos < last) mono = false; last = pos; answer(true); sheetRights++; next(); }
        ok(vxSheetPassed(it.sheet), `after "Read it again" ${it.sheet} passed in Today`);
      }
      seq.push("|"); gsQuizFinish(); continue;
    }
    const c = cnt(); totals.add(+c.split("/")[1]); const pos = +c.split("/")[0]; if (pos < last) mono = false; last = pos;
    if (it.t === "learn") { pathNext(); continue; }
    if (it.t === "bonus") { pathBonus(false); continue; }
    pathNext(); // skip word cards (the counter only)
  }
  ok(totals.size === 1, `counter total never changed during the session (${[...totals]})`);
  ok(mono, `counter only moves forward`);
  ok(mok() - plan0 === sheetRights, `Today sheet answers in the plan: +${mok() - plan0} (= ${sheetRights} right, incl. a re-ask)`);
  log.push("  counter during the sheets: " + seq.join(" "));
  return { log, fails };
});
console.log(`== ${app}`); console.log(r.log.join("\n")); if (r.fails.length) console.log(r.fails.join("\n"));
if (errors.length) console.log("ERRORS", errors.slice(0, 5));
await browser.close();
process.exit(r.fails.length || errors.length ? 1 : 0);
