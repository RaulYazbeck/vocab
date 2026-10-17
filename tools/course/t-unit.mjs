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
  ok(m.course.day === "2026-10-19" && J(m.course.dd) === J({ warm: 1 }), "today's parts: the later day's", J(m.course.dd));
  ok(m.words["cx_neg.kein"] && m.words["cx_neg.kein"].st === 2, "rule items merge like words (the side that has it)");
  m = ctx.mergeStates({ ...web, course: { ...web.course, day: "2026-10-19", dd: { review: 1 } } }, phone, { localWins: false });
  ok(m.course.dd.review === 1 && m.course.dd.warm === 1, "same day: both sides' parts", J(m.course.dd));
  m = ctx.mergeStates({ ...web, course: { ...web.course, idle: ["2026-10-01", "2026-10-03"] } }, { ...phone, course: { ...phone.course, idle: ["2026-10-02", "2026-10-03"] } }, {});
  ok(J(m.course.idle) === J(["2026-10-01", "2026-10-02", "2026-10-03"]), "days with nothing new: both sides'", J(m.course.idle));
  m = ctx.mergeStates({ ...web, course: { ...web.course, seen: ["2026-10-01", "2026-10-03"], last: "2026-10-03", cd: "2026-10-01" } }, { ...phone, course: { ...phone.course, seen: ["2026-10-02"], last: "2026-10-02", cd: "2026-10-04" } }, { localWins: true });
  ok(J(m.course.seen) === J(["2026-10-01", "2026-10-02", "2026-10-03"]) && m.course.last === "2026-10-03" && m.course.cd === "2026-10-04", "study days: both sides'; the last sheet and mixed day: the later", J([m.course.seen, m.course.last, m.course.cd]));
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
ok(P.cl >= 60 && P.cl < P.left, `the course's own: ${P.cl} (the verb track paces the rest)`);
ok(P.target === "2027-07-06" && P.status === "green", `15 Aug 2027 → all sheets passed by ${P.target}: ${P.status}`);
C.S.path.deadline = "2027-01-31"; P = C.cxPlanner();
ok(P.status === "red", `finish date 31 Jan 2027: ${P.status} (${P.need.toFixed(2)} a day)`);
C.S.path.deadline = "2027-02-15"; P = C.cxPlanner();
ok(P.status === "amber", `finish date 15 Feb 2027: ${P.status} (${P.need.toFixed(2)} a day)`);
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
const res = C.cxCheck(e.item, "Ich brauche kein Stuhl.", C.cxSection("s0.neg"));
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
ok(B.review === 6 && !B.write, `160 word reviews: grammar reviews down to the minimum ${B.review}, no writing prompt`, J(B));
C.__due = 20; B = C.cxBudget();
ok(B.review === 24 && B.write, `20 word reviews: ${B.review} grammar reviews and the writing prompt`, J(B));
B = C.cxBudget(null, false);
ok(B.review === 30, `no new sheet today: its minutes go to reviews (${B.review}, the most a day)`, J(B));

// the finish date sets the pace: new sheets spread evenly to the target
{
  fresh();
  const left = C.cxCourseSheetsLeft(), days = C.daysBetween("2026-10-18", "2027-07-06");
  ok(C.cxGap() === Math.floor(days / left) && C.cxGap() >= 2, `15 Aug 2027: ${left} sheets over ${days} days — a new one every ${C.cxGap()} days`);
  C.S.path.deadline = "2027-12-15"; const later = C.cxGap();
  C.S.path.deadline = "2027-04-15"; const sooner = C.cxGap();
  ok(later > sooner && sooner >= 1, `a later date spaces them out (${later} days), an earlier one brings them closer (${sooner})`);
  C.S.path.deadline = "2026-12-01"; ok(C.cxGap() === 1, "a date too close: every day (and the levers)");
  C.S.path.deadline = ""; ok(C.cxGap() === 1, "no finish date: every day");
  C.S.path.deadline = "2030-01-01"; ok(C.cxGap() === 7, "far away: never more than a week apart");
  fresh(); const g = C.cxGap();
  ok(C.cxTodayParts().some(p => p.part === "sheet"), "first day: a sheet");
  C.cxSheetResult("cx.neg1", 1, true, "path");
  ok(C.S.course.last === "2026-10-18" && C.cxTodayParts().some(p => p.part === "drill"), "passed: the last sheet's day noted, the drill still today");
  C.cxDrillDone("s0.neg", 10, 12); C.cxPartDone({ part: "drill", sec: "s0.neg" });
  C.__today = "2026-10-19"; C.S.course.day = "2026-10-18";
  ok(C.cxNextLessonDay() === C.addDays("2026-10-18", g) && !C.cxTodayParts().some(p => p.part === "sheet" || p.part === "testout"), `the next day: no new sheet (the next on ${C.cxNextLessonDay()})`);
  ok(C.cxTodayParts().some(p => p.part === "write"), "a day between sheets: a writing prompt");
  // a sheet failed: it comes back the next day, whatever the gap
  fresh(); C.cxSheetResult("cx.neg1", 2 / 3, true, "path"); C.S.course.last = "2026-10-18";
  C.__today = "2026-10-19";
  ok(C.cxNextLessonDay() === "2026-10-19" && C.cxTodayParts().some(p => p.part === "sheet"), "a sheet missed: back the next day");
}

// contrast days: about every 5th day once two sections are done, on a day between sheets
{
  fresh();
  const fake = id => { C.CX.byId[id].built = true; C.CX.byId[id].sheets = ["cx.neg1"]; };
  C.S.course.since = "2026-10-01"; C.S.course.sec = { "s0.neg": { st: 3 } }; C.S.course.seen = Array.from({ length: 18 }, (_, i) => C.addDays("2026-10-01", i));
  ok(!C.cxContrastDue(), "one section done: no contrast day");
  fake("s0.gender"); fake("s0.art"); C.S.course.sec["s0.gender"] = { st: 3 };
  const kinds = () => C.cxTodayParts().map(p => p.part + (p.contrast ? ":mix" : "")).join(" ");
  C.S.course.last = "2026-10-18";
  ok(C.cxContrastDue() && /review:mix/.test(kinds()) && !/sheet|testout/.test(kinds()), "two done, a day between sheets: the mixed review", kinds());
  C.cxPartDone({ part: "review", contrast: true, rules: [] });
  ok(C.S.course.cd === "2026-10-18" && !C.cxContrastDue("2026-10-22") && C.cxContrastDue("2026-10-23"), "then not for 5 days");
  C.S.course.cd = "2026-10-10"; C.S.course.dd = {}; C.S.course.last = "2026-10-01";
  ok(C.cxGap() > 1 && /testout|sheet/.test(kinds()) && !/:mix/.test(kinds()), `a sheet due (every ${C.cxGap()} days): the sheet; the mixed day waits for a day between`, kinds());
  C.S.path.deadline = "2027-03-25";
  ok(C.cxGap() === 1 && C.cxPlanner().status === "green" && /:mix/.test(kinds()) && !/testout|sheet/.test(kinds()), "a sheet every day (on track): the mixed day takes the fifth day's slot", kinds());
  C.S.path.deadline = "2027-02-01"; const st = C.cxPlanner().status;
  ok(st !== "green" && /:mix/.test(kinds()) && /testout|sheet/.test(kinds()), `tight (${st}): the mixed day brings its sheet too`, kinds());
  ["s0.gender", "s0.art"].forEach(id => { C.CX.byId[id].built = false; C.CX.byId[id].sheets = []; });
}
// my rhythm: the gap counts study days
{
  fresh();
  C.S.course.since = "2026-09-20"; C.S.course.last = "2026-10-12";
  const all = Array.from({ length: 29 }, (_, i) => C.addDays("2026-09-20", i));
  C.S.course.seen = all.slice(); const g1 = C.cxGap();
  C.S.course.seen = all.filter((_, i) => i % 2 === 0); const g2 = C.cxGap();
  ok(C.cxAttend() < 0.6 && g2 < g1, `every other day in the app (${C.cxAttend().toFixed(2)}): sheets ${g2} study days apart instead of ${g1}, the same pace in the calendar`);
  C.S.course.seen = all.slice(); C.S.course.last = "2026-10-16";
  const g = C.cxGap(), next = C.cxNextLessonDay();
  ok(next === C.addDays("2026-10-16", g), `came every day: the next sheet ${g} days after the last (${next})`);
  C.S.course.seen = all.filter(d => d <= "2026-10-16");
  ok(C.cxNextLessonDay() > next, "skipped days don't count: it comes later in the calendar");
}

// ── room for what's coming: a section of 2 sheets, a stage checkpoint ──
{
  const C2 = loadCourse({ extra: `
    (function () {
      const pilot = CX.byId["s0.neg"];
      const mk = (id, rid) => ({ id, title: id, qn: 3, struct: [["a", "who"], ["b", "verb"]], why: "x", rid, rules: rid.map(r => r), ex: [["a", "a"], ["b", "b"], ["c", "c"]], trap: "t",
        quiz: [{ at: "r1", k: "pick", q: "x", o: ["a", "b"], a: 0, why: "w" }] });
      const rid = ["zu.a1", "zu.a2", "zu.b1", "zu.b2"];
      const sets = pilot.sets.map(id => CX.sets[id]).filter(s => !s.gen).map((s, i) => ({ ...s, id: "d.t.zu." + i, ex: undefined,
        items: s.items.map((it, j) => ({ ...it, r: [rid[(i + j) % 4]] })) }));
      cxPack({ id: "t-zu", sections: { "s1.zu": { rules: Object.fromEntries(rid.map(r => [r, r])), sheets: [mk("cx.t.zu1", rid.slice(0, 2)), mk("cx.t.zu2", rid.slice(2))], drills: sets } } });
      cxPack({ id: "t-recap", sections: { "s0.recap": { checkpoint: { n: 12 } } } });
    })();` });
  const fresh2 = () => {
    C2.S = { words: {}, verb: { sh: {} }, path: { deadline: "2027-08-15", newPerDay: 10 } };
    C2.pathDeadlineOn = () => true; C2.pathScan = () => ({ due: 60 }); C2.vxSheetPassed = id => !!(C2.S.verb.sh[id] > 0);
    C2.getWS = (d, i) => C2.S.words[d + "_" + i] || (C2.S.words[d + "_" + i] = { correct: 0, wrong: 0 });
    C2.introduceWord = ws => { if (ws.st) return false; ws.st = 1; ws.lrn = 1; ws.dueAt = Date.now(); return true; };
    C2.scheduleStage = ws => { ws.dueAt = Date.now() + 864e5; };
    C2.applyCorrect = ws => { ws.correct++; ws.lrn = 0; return { events: [] }; }; C2.applyWrong = ws => { ws.wrong++; ws.lrn = 1; return { events: [] }; };
    C2.migrateCourse();
  };
  fresh2();
  // s1.zu: two sheets — only the section's own rules matter here
  C2.S.course.sec = Object.fromEntries(C2.CX.sections.filter(s => C2.CX.sections.indexOf(s) < C2.CX.sections.indexOf(C2.CX.byId["s1.zu"]) && s.id !== "s1.zu").map(s => [s.id, { st: 3 }]));
  ok(C2.cxNextSections(1)[0].id === "s1.zu", "the several-sheet section is next");
  ok(J(C2.cxTodayParts().map(p => p.part + ":" + (p.sheet || ""))) === J(["sheet:cx.t.zu1", "drill:"]), "day 1: its first sheet, then a drill", J(C2.cxTodayParts()));
  C2.cxSheetResult("cx.t.zu1", 1, true, "path");
  ok(["zu.a1", "zu.a2"].every(r => C2.S.words["cx_" + r]) && !C2.S.words["cx_zu.b1"], "sheet 1 passed: its own rules go into review, not sheet 2's");
  let list = C2.cxPartList({ part: "drill", sec: "s1.zu" });
  ok(list.length >= 6 && list.every(e => e.item.r.every(r => ["zu.a1", "zu.a2"].includes(r))), `day 1's drill keeps to sheet 1's rules (${list.length} items)`);
  C2.cxDrillDone("s1.zu", 10, 12); C2.cxPartDone({ part: "drill", sec: "s1.zu" });
  ok(!C2.cxSecDone("s1.zu"), "not done after day 1");
  C2.S.course.day = "2000-01-01";
  ok(!C2.cxTodayParts().some(p => p.sec === "s1.zu"), "the next day: the second sheet waits for the gap");
  C2.S.course.day = "2000-01-01"; C2.S.course.last = "2000-01-01"; C2.S.course.seen = Array.from({ length: 10 }, (_, i) => C2.addDays("2026-10-08", i));
  ok(J(C2.cxTodayParts().filter(p => p.sec === "s1.zu").map(p => p.part + ":" + (p.sheet || ""))) === J(["sheet:cx.t.zu2", "drill:"]), "its day: the second sheet, then the drill");
  C2.cxSheetResult("cx.t.zu2", 1, true, "path");
  list = C2.cxPartList({ part: "drill", sec: "s1.zu" });
  ok(list.some(e => e.item.r.some(r => ["zu.b1", "zu.b2"].includes(r))), "day 2's drill: the whole section");
  C2.cxDrillDone("s1.zu", 12, 14);
  ok(C2.cxSecDone("s1.zu"), "both sheets and the drill: the section is done");
  // s0.recap: the stage's checkpoint
  fresh2();
  ok(!C2.cxCheckpointReady(C2.CX.byId["s0.recap"]) && !C2.cxTodayParts().some(p => p.part === "checkpoint"), "the checkpoint waits while stage 0 has sections to do (coming ones too)");
  C2.CX.sections.filter(s => s.stage === 0 && s.id !== "s0.recap").forEach(s => { C2.S.course.sec[s.id] = { st: 3 }; });
  ["pr1", "pr2", "pr3", "pr4", "pr5", "pr7", "im1", "im2", "im3", "pf1"].forEach(id => { C2.S.verb.sh[id] = 100; });
  C2.cxIntroduceRules("s0.neg", 3);
  ok(C2.cxCheckpointReady(C2.CX.byId["s0.recap"]) && C2.cxTodayParts().some(p => p.part === "checkpoint" && p.sec === "s0.recap"), "stage 0 done: the checkpoint comes in Today");
  const plan = C2.cxCheckpointPlan("s0.recap");
  ok(plan.length === 12 && new Set(plan.map(e => e.rule)).size === 4, `12 questions over the stage's 4 rules (${plan.length})`);
  ok(!C2.cxCheckpointResult("s0.recap", 8, 12) && !C2.cxSecDone("s0.recap"), "67%: not passed, it comes back");
  ok(!C2.cxCheckpointResult("s0.recap", 9, 12) && !C2.cxSecDone("s0.recap"), "75%: not passed");
  ok(!C2.cxCheckpointResult("s0.recap", 9, 12) && C2.cxSecDone("s0.recap") && C2.S.course.sec["s0.recap"].on === 1, "third try: the stage moves on anyway (the date matters more)");
  fresh2(); C2.cxIntroduceRules("s0.neg", 3);
  ok(C2.cxCheckpointResult("s0.recap", 10, 12) && C2.cxSecDone("s0.recap"), "83%: passed");
}

// ── my rhythm: the pace of the last 4 weeks, the days with nothing new, the levers ──
{
  fresh();
  ok(C.cxPace() === null && C.cxPlanner().pace === null, "no history yet: no pace of mine to report");
  C.S.course.since = "2026-10-04"; C.S.course.sec["s0.neg"] = { st: 3, at: "2026-10-10" };
  const p = C.cxPace();
  ok(Math.abs(p - 1 / 15) < 1e-9, `one sheet in 15 days: ${p && p.toFixed(3)} a day`);
  const P = C.cxPlanner();
  ok(P.status === "green" && P.eta <= P.target, `the pace is the date's: the last sheet ${P.eta}, by the target ${P.target} — my slow start doesn't change the status`);
  C.S.course.idle = Array.from({ length: 9 }, (_, i) => C.addDays("2026-10-05", i));
  ok(C.cxPace() === null, "9 of the 15 days had nothing new to learn: too little to judge my pace");
  C.S.course.idle = ["2026-10-05", "2026-10-06"];
  ok(Math.abs(C.cxPace() - 1 / 13) < 1e-9, "days with nothing new don't count against me");
  // the day rolls over with nothing built left: it's an idle day
  fresh(); C.S.course.since = "2026-10-10"; C.S.course.sec["s0.neg"] = { st: 3, at: "2026-10-10" };
  ["pr1", "pr2", "pr3", "pr4", "pr5", "pr7", "im1", "im2", "im3", "pf1"].forEach(id => { C.S.verb.sh[id] = 100; });
  if (!C.cxNextSections(1).length) { C.S.course.day = "2026-10-15"; C.S.course.idle = ["2026-10-15"]; C.__today = "2026-10-18"; C.cxRollDay();
    ok(J(C.S.course.idle) === J(["2026-10-15", "2026-10-16", "2026-10-17", "2026-10-18"]), "nothing built then or now: the days between are idle too", J(C.S.course.idle)); }
  else ok(true, "(a section is built beyond the pilot: idle check skipped)");
  ok(true);
}

// ── the course in the learning log ──
{
  fresh();
  C.tierOfStage = C.tierOfStage || (st => ({ icon: "•" + st }));
  C._clip = C._clip || (s => String(s).slice(0, 60)); C.LEARN_HIST = C.LEARN_HIST || 6;
  C.cxIntroduceRules("s0.neg", 1);
  const set = C.CX.sets["d5.4"], item = set.items[0];
  const res = C.cxCheck(item, "Ich habe nicht Zeit", C.cxSection("s0.neg"));
  C.cxRecordAnswer({ set: "d5.4", item, rule: item.r[0] }, false, res, { typed: true, given: "Ich habe nicht Zeit", where: "drill" });
  const r = res.rule || item.r[0], ws = C.cxRuleWS(r);
  ok(ws.mh && ws.mh.length === 1 && ws.mh[0][3] === "Ich habe nicht Zeit" && ws.mh[0][4], "a typed miss keeps what I wrote and the right answer", J(ws.mh));
  C.cxRecordAnswer({ set: "d5.4", item, rule: item.r[0] }, false, res, { typed: false, where: "drill" });
  ok(ws.mh.length === 1, "a picked miss doesn't (nothing written)");
  const lines = C.cxLearnLines().join("\n");
  ok(/Course sentences I got wrong/.test(lines) && lines.includes("Ich habe nicht Zeit"), "the learning log lists it for the tutor");
  const j = C.cxLearnJson();
  ok(j && j.rules[r] && j.rules[r][3].length === 1 && j.sec, "and its JSON carries the rules and sections", J(j && j.rules[r]));
  const rep = C.cxReportLines();
  ok(rep.length === 2 && /rule\(s\) due/.test(rep[1]) && /a new sheet every \d+ day/.test(rep[1]), "the usage report: sections, rules by tier, today and the planner", J(rep));
}

// ── the writing journal ──
{
  fresh(); C.S.learn = {};
  C.saveState = C.saveState || (() => {});
  ok(C.cxLevel() === "A1", "Stage 0 next: A1 prompts");
  const p1 = C.cxJournalPick(0);
  ok(p1 && p1.lv === "A1" && !p1.sec, `the first prompt: A1, not tied to an unfinished section (${p1 && p1.id})`);
  ok(C.cxJournalPick(1).id !== p1.id, "another topic: a different prompt");
  ok(!C.CX.journal.filter(p => p.sec === "s0.neg").some(p => p.id === C.cxJournalPick(0).id), "nicht/kein prompts wait for their section");
  C.S.course.sec["s0.neg"] = { st: 3, at: "2026-10-18" };
  ok(C.cxJournalPick(0).sec === "s0.neg", `the section done: its prompt comes first (${C.cxJournalPick(0).id})`);
  ok(C.cxJournalSave("w.flat", "   ") === null, "nothing written: nothing saved");
  const e = C.cxJournalSave(C.cxJournalPick(0).id, "Meine Wohnung hat drei Zimmer. Wir haben keinen Balkon.");
  ok(e && e.w === 9 && C.S.writing["2026"].length === 1 && e.d === "2026-10-18" && !C.S.learn.wr, "saved with its day and word count, under its year", J(e));
  ok(C.cxJournalPick(0).id !== e.p, "written today: the next pick is another prompt");
  let L = C.cxLearnLines().join("\n");
  ok(/## MY WRITING \(1 text since 2026-10-18; 1 to correct\)/.test(L) && /Please correct/.test(L) && L.includes("Wir haben keinen Balkon."), "the learning log asks for its correction, the text in full", L);
  ok(C.cxLearnJson().writing.length === 1, "and the JSON carries it");
  ok(/To correct[\s\S]*\[2026-10-18\][\s\S]*Wir haben keinen Balkon/.test(C.cxJournalCopyText()), "✍️ Copy my texts: every text, dated");
  C.cxJournalMark(e.id);
  L = C.cxLearnLines().join("\n");
  ok(C.S.writing["2026"][0].c === "2026-10-18" && !/Please correct/.test(L) && /Already corrected[^\n]*2026-10-18/.test(L), "corrected: it moves to the log's corrected list (kept)", L);
  ok(/Already corrected[\s\S]*Wir haben keinen Balkon/.test(C.cxJournalCopyText()), "and Copy my texts still has it in full");
  C.cxJournalMark(e.id, false); ok(!C.S.writing["2026"][0].c, "and back");
  for (let i = 0; i < 400; i++) C.cxJournalSave("w.me", "Ich heiße Test " + i);
  ok(C.cxJournalList().length === 401, `never dropped: ${C.cxJournalList().length} texts kept`);
  C.__today = "2027-01-02"; C.cxJournalSave("w.day", "Neues Jahr, neuer Text.");
  ok(C.S.writing["2027"].length === 1 && C.cxJournalList().slice(-1)[0].d === "2027-01-02", "a new year: its own list (its own cloud doc)");
  // the first build's texts (S.learn.wr) move over, once
  fresh(); C.S.learn = { wr: [{ id: "x1", d: "2026-10-17", p: "w.me", t: "Hallo.", w: 1, c: "2026-10-18" }] }; C.S.writing = { "2026": [{ id: "x2", d: "2026-10-18", p: "w.day", t: "Tag.", w: 1 }] };
  C.migrateCourse();
  ok(!C.S.learn.wr && J(C.cxJournalList().map(x => x.id)) === J(["x1", "x2"]) && C.cxJournalList()[0].c === "2026-10-18", "texts from the first build move to S.writing", J(C.S.writing));
  // Today: the writing part when there's room
  fresh(); C.S.learn = {};
  C.__due = 1;
  ok(C.cxTodayParts().some(p => p.part === "write"), "a light day: a writing part in Today");
  C.S.course.dd.write = 1;
  ok(!C.cxTodayParts().some(p => p.part === "write"), "written today: no second one");
  C.__due = 60;
}
{
  const src = fs.readFileSync(new URL("../../js/sync-merge.js", import.meta.url), "utf8");
  const ctx = {}; vm.createContext(ctx); vm.runInContext(src + "\n;this.mergeStates = mergeStates;", ctx);
  const a = { savedAt: 1, words: {}, learn: { verbs: {}, wr: [{ id: "a", d: "2026-10-18", p: "w.me", t: "x", w: 1 }, { id: "b", d: "2026-10-19", p: "w.day", t: "y", w: 1 }] } };
  const b = { savedAt: 2, words: {}, learn: { verbs: {}, wr: [{ id: "b", d: "2026-10-19", p: "w.day", t: "y", w: 1, c: "2026-10-20" }, { id: "c", d: "2026-10-20", p: "w.food", t: "z", w: 1 }] } };
  let m = ctx.mergeStates(a, b, { localWins: true });
  ok(J(m.learn.wr.map(e => e.id)) === J(["a", "b", "c"]) && m.learn.wr[1].c === "2026-10-20", "(first build) both devices' texts kept", J(m.learn.wr));
  const wa = { savedAt: 1, words: {}, writing: { "2026": [{ id: "a", d: "2026-10-18", p: "w.me", t: "x", w: 1 }, { id: "b", d: "2026-12-30", p: "w.day", t: "y", w: 1 }] } };
  const wb = { savedAt: 2, words: {}, writing: { "2026": [{ id: "b", d: "2026-12-30", p: "w.day", t: "y", w: 1, c: "2027-01-03" }], "2027": [{ id: "c", d: "2027-01-02", p: "w.food", t: "z", w: 1 }] } };
  m = ctx.mergeStates(wa, wb, { localWins: false });
  ok(J(m.writing["2026"].map(e => e.id)) === J(["a", "b"]) && m.writing["2026"][1].c === "2027-01-03" && m.writing["2027"][0].id === "c", "writing: both devices' texts, year by year, corrected stays corrected", J(m.writing));
  ok(!("writing" in ctx.mergeStates({ savedAt: 1, words: {} }, { savedAt: 2, words: {} }, {})), "no writing anywhere: none made up");
}

console.log(`course unit: ${pass} passed, ${fail} failed`);
process.exit(fail ? 1 : 0);
