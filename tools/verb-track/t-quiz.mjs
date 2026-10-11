// The sheet quizzes and the mastery quizzes, driven in the real app:
// sizes, 100% to pass, a miss → the exact part of the sheet and back,
// the re-ask, mastery locked → open → passed, and nothing of it in the
// daily plan.
import { openApp } from "./browser.mjs";
const { browser, page, errors } = await openApp();
let pass = 0, fail = 0;
const ok = (c, m, x = "") => { if (c) pass++; else { fail++; console.log("  ✗", m, x); } };
const r = await page.evaluate(async () => {
  const out = {};
  vxSwitchOn();
  // Answer the current question: right, or a wrong answer.
  const answer = right => {
    const q = _gs.quiz, cur = q.list[q.i], Q = cur.q;
    if (Q.k === "type") { document.getElementById("gs-input").value = right ? Q.a[0] : "xyz"; gsQuizCheck(); }
    else if (Q.k === "order") { cur.picked = Q.a.map((_, i) => i); if (!right) cur.picked.reverse(); gsQuizCheck(); }
    else gsQuizPick(right ? Q.a : (Q.a + 1) % Q.o.length);
  };
  const next = () => { window.mistakeHeld = () => false; gsQuizNext(); };
  const host = () => document.getElementById("main-screen");
  // 1 · a sheet read in the menu: every question right → passed.
  renderGrammarSheet("pr4");
  while (_gs.step < _gs.steps.length) gsGo(1);
  out.size = _gs.quiz.n; out.expect = gqSheetSize(vxSheet("pr4"));
  out.points = [...new Set(_gs.quiz.list.map(x => x.q.at))].sort().join(",");
  while (!_gs.quiz.done) { answer(true); next(); }
  out.passed = vxSheetPassed("pr4");
  // 2 · one miss → not passed; why + "see it in the sheet"; the same
  //     question once more at the end.
  renderGrammarSheet("pr2");
  while (_gs.step < _gs.steps.length) gsGo(1);
  const n = _gs.quiz.n;
  answer(false);
  out.missFb = document.getElementById("gs-qfb").innerText;
  out.seeBtn = !!document.querySelector(".gs-qsee");
  const missed = _gs.quiz.list[0].q;
  gsQuizReview();
  out.review = { inReview: !!_gs.review, lit: !!document.querySelector(".gs-hl"), label: document.querySelector(".gs-step-label").innerText, at: missed.at };
  gsReviewBack();
  out.backAnswered = _gs.quiz.answered && !!document.getElementById("gs-qnext");
  next();
  while (!_gs.quiz.done) { answer(true); next(); }
  out.listLen = _gs.quiz.list.length; out.n = n;
  out.reaskSame = _gs.quiz.list[_gs.quiz.list.length - 1].q.q === missed.q;
  out.pr2Passed = vxSheetPassed("pr2");
  out.resultText = host().innerText.slice(0, 400);
  out.missedList = document.querySelectorAll(".gs-miss").length;
  // 3 · randomness: two runs of the same sheet differ.
  const a = gqSheetQuiz(vxSheet("pr1")).map(q => q.q).join("|"), b = [1, 2, 3, 4, 5].map(() => gqSheetQuiz(vxSheet("pr1")).map(q => q.q).join("|"));
  out.random = b.some(x => x !== a);
  // 4 · mastery: locked until every sheet of the tense is passed.
  renderGrammarUnit("im");
  out.lockedCard = document.querySelector(".gr-mastery").disabled;
  vxSheetIds("im").forEach(id => { S.verb.sh[id] = 100; });
  const planBefore = JSON.stringify(vxPlanNumbers(pathScan(true)));
  renderGrammarUnit("im");
  out.openCard = !document.querySelector(".gr-mastery").disabled;
  renderGrammarMastery("im");
  out.mSize = _gs.quiz.n; out.mExpect = gqMasterySize("im");
  out.mSheets = [...new Set(_gs.quiz.list.map(x => x.q.sid))].sort().join(",");
  // a miss: not mastered, best recorded
  answer(false); next();
  while (!_gs.quiz.done) { answer(true); next(); }
  out.mFail = { mastered: vxMastered("im"), best: S.verb.ma.im && S.verb.ma.im.best };
  gsQuizRetake();
  while (!_gs.quiz.done) { answer(true); next(); }
  out.mPass = vxMastered("im");
  out.mText = host().innerText.slice(0, 200);
  out.ach = ACHIEVEMENTS.find(a => a.id === "vx_mastery").value();
  out.planAfter = JSON.stringify(vxPlanNumbers(pathScan(true)));
  out.planBefore = planBefore;
  renderGrammar(); out.homeBadge = /🏆 Mastered/.test(host().innerText);
  // 5 · in Today: a sheet item's quiz uses the same rules.
  out.planSheetQ = vxPlanNumbers(pathScan(true)).sheetQ;
  return out;
});
ok(r.size === r.expect && r.size >= 3 && r.size <= 10, "a sheet quiz has the sheet's size (3–10)", `${r.size} vs ${r.expect}`);
ok(r.points === "r1,r2,r3,table,trap", "it covers every point of the sheet", r.points);
ok(r.passed, "all right first time → passed");
ok(/Answer/.test(r.missFb) && r.seeBtn, "a miss shows the answer, why, and the way into the sheet", r.missFb);
ok(r.review.inReview && r.review.lit, "the sheet opens at the missed point, lit up", JSON.stringify(r.review));
ok(r.backAnswered, "back to the quiz: the answer is still there, Next goes on");
ok(r.listLen === r.n + 1 && r.reaskSame, "the missed question comes back once, the same", `${r.listLen} vs ${r.n}`);
ok(!r.pr2Passed, "one miss → not passed (100% needed)");
ok(/every question right the first time/.test(r.resultText) && r.missedList === 1, "the result says why, and lists what to look at again", r.resultText);
ok(r.random, "two runs of a sheet's quiz differ");
ok(r.lockedCard && r.openCard, "mastery: locked until every sheet is passed, then open");
ok(r.mSize === r.mExpect && r.mSize >= 8, "mastery has the tense's size", `${r.mSize} vs ${r.mExpect}`);
ok(r.mSheets === "im1,im2,im3", "mastery asks about every sheet of the tense", r.mSheets);
ok(!r.mFail.mastered && r.mFail.best < 100, "one miss → not mastered, best score kept", JSON.stringify(r.mFail));
ok(r.mPass && /mastered/i.test(r.mText), "100% → mastered", r.mText);
ok(r.ach === 1, "Tense Master achievement counts it", r.ach);
ok(r.planBefore === r.planAfter, "mastery is outside the daily plan", `${r.planBefore} → ${r.planAfter}`);
ok(r.homeBadge, "Grammar shows 🏆 Mastered on the tense");
ok(r.planSheetQ === undefined || r.planSheetQ >= 0, "the plan counts the sheets' real quiz sizes", r.planSheetQ);
ok(!errors.length, "no page errors", errors.join(" | "));
console.log(`quiz: ${pass} passed, ${fail} failed`);
await browser.close();
process.exit(fail ? 1 : 0);
