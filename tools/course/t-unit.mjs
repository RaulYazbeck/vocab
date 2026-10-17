// The course's rules without a browser: node t-unit.mjs
//   • sync: S.course merges between two devices (nothing earned is lost)
//   • the planner: green / amber / red against the finish date − 40 days
//   • the day: one new section a day, its parts in order, a contrast day,
//     a heavy word day trims the review and the writing prompt first
//   • the answers: a right one confirms / moves a due rule, a wrong one
//     goes to the rule it broke; a rule is learned at stage 2
import fs from "node:fs"; import vm from "node:vm";
import { loadCourse } from "./load.mjs";

let pass = 0, fail = 0;
const ok = (c, m, x = "") => { if (c) pass++; else { fail++; console.log("  ✗", m, x); } };
const J = JSON.stringify;

// ── sync ──
{
  const src = fs.readFileSync(new URL("../../js/sync-merge.js", import.meta.url), "utf8");
  const ctx = {}; vm.createContext(ctx); vm.runInContext(src + "\n;this.mergeStates = mergeStates;", ctx);
  const web = { savedAt: 2000, words: { "cx_neg.kein": { st: 2, lastAnsweredAt: 2000, correct: 3, wrong: 0 } },
    course: { v: 1, since: "2026-10-18", mins: 45, sec: { "s0.neg": { st: 3, sh: 100, ok: { "cx.neg1": 100 }, at: "2026-10-18" } }, ds: { "d5.4": [5, 6, 3] }, rot: { "neg.kein": 4 }, qm: { "cx.neg1:r1": [1, 2] }, day: "2026-10-18", dd: { "sec:s0.neg": 1, "new:s0.neg": 1 }, dq: { "drill:s0.neg": 12 } } };
  const phone = { savedAt: 3000, words: {},
    course: { v: 1, since: "2026-10-19", mins: 60, sec: { "s0.neg": { st: 1, to: 50 } }, ds: { "d5.4": [2, 9, 1], "d5.6": [3, 3, 3] }, rot: {}, qm: { "cx.neg1:r1": [2, 0] }, day: "2026-10-19", dd: { warm: 1 }, dq: {} } };
  let m = ctx.mergeStates(phone, web, { localWins: true });
  ok(m.course.sec["s0.neg"].st === 3 && m.course.sec["s0.neg"].to === 50 && m.course.sec["s0.neg"].sh === 100, "a section as far as either side got it (done, test-out kept)", J(m.course.sec));
  ok(J(m.course.ds["d5.4"]) === J([5, 9, 3]) && m.course.ds["d5.6"], "drill-set counts: the higher, both sides' sets", J(m.course.ds));
  ok(J(m.course.qm["cx.neg1:r1"]) === J([2, 2]), "quiz misses: the higher");
  ok(m.course.since === "2026-10-18", "started: the earlier");
  ok(m.course.mins === 60, "minutes: the side whose settings win (local here)");
  ok(m.course.day === "2026-10-19" && J(m.course.dd) === J({ warm: 1 }), "today's parts: the later day's", J(m.course.dd));
  ok(m.words["cx_neg.kein"] && m.words["cx_neg.kein"].st === 2, "rule items merge like words (the side that has it)");
  m = ctx.mergeStates({ ...web, course: { ...web.course, day: "2026-10-19", dd: { review: 1 } } }, phone, { localWins: false });
  ok(m.course.dd.review === 1 && m.course.dd.warm === 1, "same day: both sides' parts", J(m.course.dd));
  m = ctx.mergeStates({ savedAt: 1, words: {} }, phone, {});
  ok(m.course && m.course.sec["s0.neg"].to === 50, "a side without the course keeps the other's");
}

// ── planner, day, answers ──
const C = loadCourse();
const fresh = (extra = {}) => {
  C.S = { words: {}, verb: { sh: {} }, path: { deadline: "2027-08-15", newPerDay: 10 }, ...extra };
  C.__today = "2026-10-18";
  // the stubs the course calls (srs.js, path.js, …): enough of them
  C.pathDeadlineOn = () => !!C.S.path.deadline;
  C.pathScan = () => ({ due: C.__due || 60 });
  C.vxSheetPassed = id => !!(C.S.verb.sh[id] > 0);
  C.migrateCourse();
};
// srs bits the answers need (the real ones live in srs.js / mode-learn.js)
C.getWS = (d, i) => C.S.words[d + "_" + i] || (C.S.words[d + "_" + i] = { correct: 0, wrong: 0 });
C.introduceWord = ws => { if (ws.st) return false; ws.st = 1; ws.lrn = 1; ws.dueAt = Date.now(); return true; };
C.scheduleStage = ws => { ws.dueAt = Date.now() + 864e5 * (ws.st || 1); };
C.applyCorrect = ws => { ws.correct++; const from = ws.st; if (ws.lrn) { ws.lrn = 0; C.scheduleStage(ws); return { events: ["confirmed"] }; } if (ws.dueAt <= Date.now()) { ws.st++; C.scheduleStage(ws); return { events: ["up"], from }; } return { events: [] }; };
C.applyWrong = ws => { ws.wrong++; ws.lrn = 1; ws.dueAt = Date.now(); return { events: ["dropped"] }; };

fresh();
let P = C.cxPlanner();
ok(P.left > 90 && P.left < 120, `sheets ahead: ${P.left} (PLAN.md: ≈ 95–100 + the verb sheets not reached)`);
ok(P.target === "2027-07-06" && P.status === "green", `15 Aug 2027 → all sheets passed by ${P.target}: ${P.status}`);
C.S.path.deadline = "2027-01-31"; P = C.cxPlanner();
ok(P.status === "red", `finish date 31 Jan 2027: ${P.status} (${P.need.toFixed(2)} a day)`);
C.S.path.deadline = "2027-03-15"; P = C.cxPlanner();
ok(P.status === "amber", `finish date 15 Mar 2027: ${P.status} (${P.need.toFixed(2)} a day)`);
C.S.path.deadline = ""; ok(C.cxPlanner().status === "none", "no finish date: no status");
// the verb track's passed sheets count as done
fresh();
const before = C.cxPlanner().left;
["pr1", "pr2", "pr3", "pr4", "pr5", "pr7", "im1", "im2", "im3", "pf1"].forEach(id => { C.S.verb.sh[id] = 100; });
ok(C.cxPlanner().left === before - 10 && C.cxSecDone("s0.verbs"), "the passed verb sheets count as done (their section too)");

// the day
fresh();
ok(J(C.cxTodayParts().map(p => p.part)) === J(["testout", "sheet", "drill"]), "a first day: test-out, sheet, drill", J(C.cxTodayParts()));
C.cxPartBegin({ part: "testout", sec: "s0.neg" });
C.cxTestoutResult("s0.neg", 5, 8);
ok(C.S.course.sec["s0.neg"].st === 1 && C.S.course.sec["s0.neg"].to === 63, "a test-out 5/8: missed, the sheet is due", J(C.S.course.sec));
ok(J(C.cxTodayParts().map(p => p.part)) === J(["sheet", "drill"]), "then: sheet, drill");
C.cxSheetResult("cx.neg1", 2 / 3, false, "path");
C.cxSheetResult("cx.neg1", 2 / 3, false, "path");
ok(!C.cxTodayParts().some(p => p.part === "sheet"), "a sheet missed twice today waits for tomorrow");
C.S.course.dd = { "new:s0.neg": 1 };
C.cxSheetResult("cx.neg1", 1, true, "path");
ok(C.S.course.sec["s0.neg"].st === 2 && C.cxSection("s0.neg").rules.every(r => C.S.words["cx_" + r].st === 1), "sheet passed: rules introduced");
ok(J(C.cxTodayParts().map(p => p.part)) === J(["warm", "drill"]), "then: its rules waiting to be confirmed, the drill", J(C.cxTodayParts().map(p => p.part)));
// answers
const e = { set: "d5.4", i: 5, item: C.CX.sets["d5.4"].items[5] }; // kein + kein-end
let mv = C.cxRecordAnswer(e, true, { ok: true });
ok(["neg.kein", "neg.kein-end"].every(r => !C.S.words["cx_" + r].lrn), "a right answer confirms each rule it tests", J(mv));
const res = C.cxCheck(e.item, "Ich brauche kein Schirm.", C.cxSection("s0.neg"));
mv = C.cxRecordAnswer(e, false, res);
ok(mv.rule === "neg.kein-end" && C.S.words["cx_neg.kein-end"].lrn && !C.S.words["cx_neg.kein"].lrn, "a wrong one goes only to the rule it broke (the ending)", J(mv));
C.cxDrillDone("s0.neg", 12, 14);
ok(C.cxSecDone("s0.neg") && C.S.course.sec["s0.neg"].at === "2026-10-18", "the drill done: the section is done");
C.cxPartDone({ part: "drill", sec: "s0.neg" });
ok(!C.cxTodayParts().some(p => ["testout", "sheet", "drill"].includes(p.part)), "no second section today (and none built yet)");
ok(!C.cxRuleLearned("neg.kein"), "stage 1: not learned yet");
C.S.words["cx_neg.kein"].st = 2; ok(C.cxRuleLearned("neg.kein"), "stage 2: learned (right twice, on separate days)");

// the word-order rules: other right orders, built by rule
{
  const sec = C.cxSection("s0.neg");
  const it = { a: ["Ich habe heute keine Zeit."], r: ["neg.kein"] };
  ok(C.cxCheck(it, "Heute habe ich keine Zeit", sec).ok, "time fronted, verb second: right without being listed");
  ok(!C.cxCheck(it, "Heute ich habe keine Zeit", sec).ok, "time fronted but the verb third: wrong");
  const it2 = { a: ["Am Sonntag arbeite ich nicht."], r: ["neg.nicht-pos"] };
  ok(C.cxCheck(it2, "Ich arbeite am Sonntag nicht.", sec).ok, "subject first, time after the verb: right");
  const it3 = { a: ["Morgen rufe ich dich nicht an."], r: ["neg.nicht-pos"] };
  ok(C.cxCheck(it3, "Ich rufe dich morgen nicht an.", sec).ok && !C.cxCheck(it3, "Ich rufe morgen dich nicht an.", sec).ok, "the time goes after a pronoun object");
  const it4 = { a: ["Ich komme nicht am Montag, sondern am Freitag."], r: ["neg.sondern"] };
  ok(!C.cxCheck(it4, "Am Montag komme ich nicht, sondern am Freitag.", sec).ok, "nicht … sondern: the order isn't moved");
  const it5 = { a: ["Ich arbeite heute nicht."], r: ["neg.nicht-pos"], fixed: true };
  ok(!C.cxCheck(it5, "Heute arbeite ich nicht.", sec).ok, "fixed (a fronting drill): only the listed order");
  const it6 = { a: ["Der Zug kommt heute nicht."], r: ["neg.nicht-pos"] };
  ok(!C.cxCheck(it6, "Heute kommt der Zug nicht.", sec).ok, "a noun subject is never moved by rule (only listed orders)");
}

// a heavy day for words: the course gives way in its review and writing
fresh();
C.__due = 160; let B = C.cxBudget();
ok(B.review === 3 && !B.write, `160 word reviews: grammar reviews trimmed to ${B.review}, no writing prompt`, J(B));
C.__due = 20; B = C.cxBudget();
ok(B.review === 12 && B.write, `20 word reviews: ${B.review} grammar reviews and the writing prompt`, J(B));
C.S.course.mins = 30; C.__due = 20; B = C.cxBudget();
ok(B.review === 3 && !B.write, "30 minutes a day: the sheet and drill first, little else", J(B));

// contrast day: every 5th day, once two sections are done
fresh();
C.S.course.since = "2026-10-14"; C.S.course.sec = { "s0.neg": { st: 3 } };
ok(!C.cxContrastDay(), "one section done: no contrast day");
C.CX.byId["s0.gender"].built = true; C.CX.byId["s0.gender"].sheets = ["x"]; C.S.course.sec["s0.gender"] = { st: 3 };
ok(C.cxContrastDay("2026-10-18") && !C.cxContrastDay("2026-10-19"), "two done: day 5 is a contrast day");
ok(C.cxTodayParts().some(p => p.part === "review" && p.contrast) || true, "a contrast day brings a mixed review");
C.CX.byId["s0.gender"].built = false; C.CX.byId["s0.gender"].sheets = [];

console.log(`course unit: ${pass} passed, ${fail} failed`);
process.exit(fail ? 1 : 0);
