// What the logs get from the quizzes: answers labelled by kind, the
// usage report's verb columns, the learning log's weak points, the
// verb history and ledger from typed forms, and the merge across devices.
import { openApp } from "./browser.mjs";
const { browser, page, errors } = await openApp();
let pass = 0, fail = 0;
const ok = (c, m, x = "") => { if (c) pass++; else { fail++; console.log("  ✗", m, x); } };
const r = await page.evaluate(() => {
  vxSwitchOn();
  window.mistakeHeld = () => false;
  const answer = right => { const q = _gs.quiz, cur = q.list[q.i], Q = cur.q;
    if (Q.k === "type") { document.getElementById("gs-input").value = right ? Q.a[0] : "falsch"; gsQuizCheck(); }
    else if (Q.k === "order") { cur.picked = Q.a.map((_, i) => i); if (!right) cur.picked.reverse(); gsQuizCheck(); }
    else gsQuizPick(right ? Q.a : (Q.a + 1) % Q.o.length); };
  const run = (wrongFirst) => { answer(!wrongFirst); gsQuizNext(); while (!_gs.quiz.done) { answer(true); gsQuizNext(); } };
  const out = {};
  // a sheet quiz with a typed engine question first: find one
  let typed = null;
  for (let k = 0; k < 40 && !typed; k++) {
    renderGrammarSheet("pr4"); while (_gs.step < _gs.steps.length) gsGo(1);
    const i = _gs.quiz.list.findIndex(x => x.q.inf && x.q.k === "type");
    if (i >= 0) { const it = _gs.quiz.list.splice(i, 1)[0]; _gs.quiz.list.unshift(it); typed = it.q; gsRender(); }
  }
  out.typed = typed && { inf: typed.inf, t: typed.t, p: typed.p };
  const before = typed ? JSON.stringify((S.learn.verbs[typed.inf] || { t: {} }).t[typed.t] || [0, 0]) : "";
  // miss it (typed), then look it up in the sheet
  answer(false); gsQuizReview(); gsReviewBack(); gsQuizNext();
  while (!_gs.quiz.done) { answer(true); gsQuizNext(); }
  out.verbHist = typed ? [before, JSON.stringify(S.learn.verbs[typed.inf].t[typed.t])] : null;
  out.qm = JSON.stringify(S.verb.qm);
  // a right typed form fills its ledger cell
  const x = vxVerb("schlafen"); S.verb.cov[x.inf] = 0;
  vxQuizAnswer({ inf: "schlafen", t: "pr", p: "du", k: "type", a: ["schläfst"], sid: "pr4", at: "r1" }, true, "schläfst", true);
  out.cov = vxCovHas("schlafen", "pr");
  // mastery: one taken (miss), one passed
  vxSheetIds("im").forEach(id => { S.verb.sh[id] = 100; });
  renderGrammarMastery("im"); run(true); gsQuizRetake(); run(false);
  // the logs
  const ev = _usageLog().slice(-400);
  out.labels = [...new Set(ev.filter(e => e.e === "answer").map(e => e.m))].sort().join(",");
  const day = usageDay();
  out.dayVx = JSON.stringify(day && day.vx);
  const rep = String(buildUsageReport());
  out.reportHas = { mastery: /Mastery quizzes: .*Imperativ 🏆/.test(rep), points: /Quiz points to work on/.test(rep), perDay: /🏆1\/2/.test(rep) && /↩1/.test(rep), legend: /🏆 mastery passed\/taken/.test(rep) };
  const ll = String(buildLearningReport());
  out.learnHas = { weak: /Grammar points I miss in quizzes/.test(ll), mastery: /Mastery quizzes:/.test(ll) };
  out.fns = {};
  // merge across devices
  const a = { verb: { on: "x", onAt: 1, qm: { "pr4:r1": [2, 0] }, ma: { im: { best: 80, ok: 0 } } } }, b = { verb: { on: "x", onAt: 1, qm: { "pr4:r1": [1, 3], "pr2:trap": [1, 0] }, ma: { im: { best: 100, ok: 1 } } } };
  const m = mergeStates(a, b, { localWins: true });
  out.merge = m ? JSON.stringify([m.verb.qm, m.verb.ma]) : "no merge fn";
  return out;
});
ok(!!r.typed, "a typed engine question was found", JSON.stringify(r.typed));
ok(r.verbHist && r.verbHist[0] !== r.verbHist[1], "a typed quiz form goes into the verb's learning history", JSON.stringify(r.verbHist));
ok(/pr4:/.test(r.qm), "missed sheet points are kept", r.qm);
ok(r.cov, "a right typed form fills its ledger cell");
ok(/grammar:mastery/.test(r.labels) && /grammar:quiz/.test(r.labels), "answers are labelled sheet quiz / mastery apart", r.labels);
ok(/"ma":2/.test(r.dayVx) && /"mp":1/.test(r.dayVx) && /"rv":1/.test(r.dayVx), "the day counts mastery taken/passed and look-ups", r.dayVx);
ok(Object.values(r.reportHas).every(Boolean), "usage report: mastery, points to work on, per-day columns, legend", JSON.stringify(r.reportHas) + JSON.stringify(r.fns));
ok(Object.values(r.learnHas).every(Boolean), "learning log: weak grammar points and mastery", JSON.stringify(r.learnHas));
ok(/"pr4:r1":\[2,3\]/.test(r.merge) && /"pr2:trap":\[1,0\]/.test(r.merge) && /"ok":1/.test(r.merge), "two devices merge the quiz points and mastery", r.merge);
ok(!errors.length, "no page errors", errors.join(" | "));
console.log(`logs: ${pass} passed, ${fail} failed`);
await browser.close();
process.exit(fail ? 1 : 0);
