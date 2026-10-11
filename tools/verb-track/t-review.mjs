// "See it in the sheet" and back, for every kind of question, in the
// Grammar menu and inside a Today session: the quiz picks up exactly
// where it was — same question, your answer, the score — nothing lost.
import { openApp } from "./browser.mjs";
const { browser, page, errors } = await openApp();
let pass = 0, fail = 0;
const ok = (c, m, x = "") => { if (c) pass++; else { fail++; console.log("  ✗", m, x); } };
const r = await page.evaluate(() => {
  vxSwitchOn();
  window.mistakeHeld = () => false;
  const out = [];
  const snap = () => { const q = _gs.quiz; return JSON.stringify({ i: q.i, n: q.n, len: q.list.length, fr: q.firstRight, ans: q.answered, done: q.done }); };
  const wrong = () => {
    const q = _gs.quiz, cur = q.list[q.i], Q = cur.q;
    if (Q.k === "type") { document.getElementById("gs-input").value = "falsch"; gsQuizCheck(); }
    else if (Q.k === "order") { cur.picked = Q.a.map((_, i) => i).reverse(); gsQuizCheck(); }
    else gsQuizPick((Q.a + 1) % Q.o.length);
    return Q.k;
  };
  const right = () => { const q = _gs.quiz, cur = q.list[q.i], Q = cur.q;
    if (Q.k === "type") { document.getElementById("gs-input").value = Q.a[0]; gsQuizCheck(); }
    else if (Q.k === "order") { cur.picked = Q.a.map((_, i) => i); gsQuizCheck(); } else gsQuizPick(Q.a); };
  // Every kind: find a sheet question of that kind, miss it, review, come back.
  const kinds = { type: 0, pick: 0, order: 0, odd: 0, why: 0 };
  const runSheet = (id, mode) => {
    if (mode === "menu") renderGrammarSheet(id);
    else { const host = document.getElementById("main-screen"); host.innerHTML = `<div id="p-card"></div>`; gsOpen(document.getElementById("p-card"), id, { mode: "path", onDone: () => {} }); }
    while (_gs.step < _gs.steps.length) gsGo(1);
    const kind = wrong();
    const before = snap(), fbBefore = document.getElementById("gs-qfb").innerText;
    const inputBefore = (document.getElementById("gs-input") || {}).value;
    gsQuizReview();
    const inReview = !!_gs.review && !!document.querySelector(".gs-hl");
    // wander around the sheet, keys too
    gsReviewGo(1); gsReviewGo(1); gsReviewGo(-1);
    gsKey({ key: "ArrowRight", preventDefault() {}, target: document.body });
    gsKey({ key: "Enter", preventDefault() {}, target: document.body }); // Enter = back to the quiz
    const after = snap(), fbAfter = document.getElementById("gs-qfb").innerText;
    const inp = document.getElementById("gs-input");
    const state = {
      kind, mode, inReview, same: before === after, fbSame: fbBefore === fbAfter,
      input: !inp || (inp.disabled && inp.value === inputBefore && inp.classList.contains("wrong")),
      opts: kind === "type" || kind === "order" || (document.querySelector(".gs-opt.right") && document.querySelector(".gs-opt.wrong") && [...document.querySelectorAll(".gs-opt")].every(b => b.disabled)),
      order: kind !== "order" || document.getElementById("gs-built").classList.contains("bad"),
      next: !!document.getElementById("gs-qnext"),
    };
    // twice more, then finish
    gsQuizReview(); gsReviewBack(); gsQuizReview(); gsReviewBack();
    state.twice = snap() === after;
    gsQuizNext();
    while (!_gs.quiz.done) { right(); gsQuizNext(); }
    state.finished = _gs.quiz.done && _gs.quiz.firstRight === _gs.quiz.n - 1 && _gs.quiz.list.length === _gs.quiz.n + 1;
    // from the result: open a missed point and come back to the result
    const missBtn = document.querySelector(".gs-miss");
    if (missBtn) { missBtn.click(); state.fromResult = !!_gs.review; gsReviewBack(); state.resultBack = /Not yet/.test(document.getElementById("gs-step").innerText); }
    kinds[kind]++;
    return state;
  };
  // Sheets whose quizzes include each kind; several draws to meet them all.
  for (const mode of ["menu", "path"]) for (const id of ["pr1", "pr3", "pr5", "pr6", "pf1", "pf3", "im3", "k24", "pv1"]) for (let k = 0; k < 2; k++) out.push(runSheet(id, mode));
  return { out, kinds };
});
for (const s of r.out) {
  const tag = `${s.mode} · ${s.kind}`;
  ok(s.inReview, `${tag}: the sheet opens at the point, lit up`);
  ok(s.same && s.fbSame, `${tag}: back to the quiz — same question, same score, same feedback`);
  ok(s.input && s.opts && s.order, `${tag}: your answer and the right one still shown`, JSON.stringify(s));
  ok(s.next && s.twice, `${tag}: Next is there; reviewing again changes nothing`);
  ok(s.finished, `${tag}: the quiz finishes normally (missed one comes back once)`);
  if (s.fromResult !== undefined) ok(s.fromResult && s.resultBack, `${tag}: from the result into the sheet and back to the result`);
}
// why / odd questions use the same option buttons as pick.
ok(r.kinds.type && (r.kinds.pick + r.kinds.odd + r.kinds.why) && r.kinds.order, "covered typed, option and word-order questions", JSON.stringify(r.kinds));
ok(!errors.length, "no page errors", errors.join(" | "));
console.log(`review: ${pass} passed, ${fail} failed`, JSON.stringify(r.kinds));
await browser.close();
process.exit(fail ? 1 : 0);
