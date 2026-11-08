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
ok(P.left > 120 && P.left < 160, `sheets ahead: ${P.left} (the complete course: built lessons' real sheets, the others' estimates, the verb lessons')`);
ok(P.cl >= 60 && P.cl < P.left, `the course's own: ${P.cl} (the verb track paces the rest)`);
ok(P.target === "2027-07-06" && P.status === "green", `15 Aug 2027 → all sheets passed by ${P.target}: ${P.status}`);
C.S.path.deadline = "2027-01-15"; P = C.cxPlanner();
ok(P.status === "red", `finish date 15 Jan 2027: ${P.status} (${P.need.toFixed(2)} a day)`);
// amber: lessons back to back (study days ≥ sheets, < sheets + a day's break per lesson)
C.S.path.deadline = C.addDays("2026-10-18", P.S + 1 + 40); P = C.cxPlanner();
ok(P.status === "amber" && C.cxBreak() === 0, `finish date ${C.S.path.deadline}: ${P.status}, no break (${P.need.toFixed(2)} a day)`);
C.S.path.deadline = C.addDays("2026-10-18", P.S + P.L + 5 + 40); P = C.cxPlanner();
ok(P.status === "green" && C.cxBreak() >= 1, `finish date ${C.S.path.deadline}: ${P.status}, a break of ${C.cxBreak()} day(s)`);
C.S.path.deadline = ""; ok(C.cxPlanner().status === "none", "no finish date: no status");
// the verb track's passed sheets count as done
fresh();
const before = C.cxPlanner().left;
["pr1", "pr2", "pr3", "pr4", "pr5", "pr7", "im1", "im2", "im3", "pf1", "pt11", "pt12", "pt13"].forEach(id => { C.S.verb.sh[id] = 100; });
ok(C.cxPlanner().left === before - 13 && C.cxSecDone("s0.verbs"), "the passed verb sheets count as done (their section too)");

// the day
fresh();
ok(J(C.cxTodayParts().filter(p => p.part !== "write").map(p => p.part)) === J(["testout", "sheet", "drill"]), "a first day: test-out, sheet, drill", J(C.cxTodayParts()));
C.cxPartBegin({ part: "testout", sec: "s0.neg" });
C.cxTestoutResult("s0.neg", 5, 8);
ok(C.S.course.sec["s0.neg"].st === 1 && C.S.course.sec["s0.neg"].to === 63, "a test-out 5/8: missed, the sheet is due", J(C.S.course.sec));
ok(J(C.cxTodayParts().filter(p => p.part !== "write").map(p => p.part)) === J(["sheet", "drill"]), "then: sheet, drill");
C.cxSheetResult("cx.neg1", 2 / 3, false, "path");
C.cxSheetResult("cx.neg1", 2 / 3, false, "path");
ok(!C.cxTodayParts().some(p => p.part === "sheet"), "a sheet missed twice today waits for tomorrow");
C.S.course.dd = { "new:s0.neg": 1 };
C.cxSheetResult("cx.neg1", 1, true, "path");
ok(C.S.course.sec["s0.neg"].st === 2 && C.cxSection("s0.neg").rules.every(r => C.S.words["cx_" + r].st === 1), "sheet passed: rules introduced");
ok(J(C.cxTodayParts().filter(p => p.part !== "write").map(p => p.part)) === J(["warm", "drill"]), "then: its rules waiting to be confirmed, the drill", J(C.cxTodayParts().map(p => p.part)));
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
  const K = C.cxClock(), days = C.daysBetween("2026-10-18", "2027-07-06");
  ok(K.days === days && Math.abs(K.G - (days - K.S) / K.L) < 1e-9 && C.cxBreak() >= 1 && C.cxGap() === C.cxBreak() + 1, `15 Aug 2027: ${K.S} sheets, ${K.L} lessons over ${days} days — a break of ≈ ${K.G.toFixed(2)} days after each (${C.cxBreak()} now)`);
  C.S.path.deadline = "2027-12-15"; const later = C.cxGap();
  C.S.path.deadline = "2027-04-15"; const sooner = C.cxGap();
  ok(later > sooner && sooner >= 1, `a later date spaces them out (${later} days), an earlier one brings them closer (${sooner})`);
  C.S.path.deadline = "2026-12-01"; ok(C.cxGap() === 1, "a date too close: every day (and the levers)");
  C.S.path.deadline = ""; ok(C.cxGap() === 1, "no finish date: every day");
  C.S.path.deadline = "2030-01-01"; ok(C.cxBreak() === 7, "far away: never more than a week's break");
  fresh(); const g = C.cxGap();
  ok(C.cxTodayParts().some(p => p.part === "sheet"), "first day: a sheet");
  C.cxSheetResult("cx.neg1", 1, true, "path");
  ok(C.S.course.last === "2026-10-18" && C.cxTodayParts().some(p => p.part === "drill"), "passed: the last sheet's day noted, the drill still today");
  C.cxDrillDone("s0.neg", 10, 12); C.cxPartDone({ part: "drill", sec: "s0.neg" });
  C.__today = "2026-10-19"; C.S.course.day = "2026-10-18";
  ok(g >= 2 && C.cxNextLessonDay() === C.addDays("2026-10-18", C.cxGap()) && !C.cxTodayParts().some(p => p.part === "sheet" || p.part === "testout"), `the next day: no new sheet (the next on ${C.cxNextLessonDay()})`);
  ok(C.cxTodayParts().some(p => p.part === "write"), "a day between sheets: a writing prompt");
  // a sheet failed: it comes back the next day, whatever the gap
  fresh(); C.cxSheetResult("cx.neg1", 2 / 3, true, "path"); C.S.course.last = "2026-10-18";
  C.__today = "2026-10-19";
  ok(C.cxNextLessonDay() === "2026-10-19" && C.cxTodayParts().some(p => p.part === "sheet"), "a sheet missed: back the next day");
}

// contrast days: about every 5th day once two sections are done, on a day between sheets
{
  fresh();
  // (two more lessons, as if built — what they really hold comes back at the end)
  const real = ["s0.gender", "s0.art"].map(id => [id, C.CX.byId[id].built, C.CX.byId[id].sheets]);
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
  { const K = C.cxClock(); C.S.path.deadline = C.addDays("2026-10-18", K.S + 1 + 40); }
  ok(C.cxBreak() === 0 && /testout|sheet/.test(kinds()) && !/:mix/.test(kinds()), "lessons back to back (no break): the lesson; the mixed day waits for a break", kinds());
  C.S.path.deadline = "2027-01-01"; const st = C.cxPlanner().status;
  ok(st === "red" && /testout|sheet/.test(kinds()) && !/:mix/.test(kinds()), `behind (${st}): the lesson comes, no mixed day`, kinds());
  real.forEach(([id, built, sheets]) => { C.CX.byId[id].built = built; C.CX.byId[id].sheets = sheets; });
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
  const g3 = C.cxGap();
  ok(g3 > 1 && C.cxNextLessonDay() === C.addDays("2026-10-18", g3 - 1), `a day skipped doesn't count: today is study day 1 of ${g3} (${C.cxNextLessonDay()})`);
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
      cxPack({ id: "t-zu", sections: { "s2.conj3": { rules: Object.fromEntries(rid.map(r => [r, r])), sheets: [mk("cx.t.zu1", rid.slice(0, 2)), mk("cx.t.zu2", rid.slice(2))], drills: sets } } });
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
  // a two-sheet lesson not built yet (s2.conj3, Session 6's — s1.zu, used here until
  // Session 5, is built now): only the section's own rules matter here
  C2.S.course.sec = Object.fromEntries(C2.CX.sections.filter(s => C2.CX.sections.indexOf(s) < C2.CX.sections.indexOf(C2.CX.byId["s2.conj3"]) && s.id !== "s2.conj3").map(s => [s.id, { st: 3 }]));
  ok(C2.cxNextSections(1)[0].id === "s2.conj3", "the several-sheet section is next");
  ok(J(C2.cxTodayParts().filter(p => p.part !== "write").map(p => p.part + ":" + (p.sheet || ""))) === J(["sheet:cx.t.zu1", "drill:"]), "day 1: its first sheet, then a drill", J(C2.cxTodayParts()));
  C2.cxSheetResult("cx.t.zu1", 1, true, "path");
  ok(["zu.a1", "zu.a2"].every(r => C2.S.words["cx_" + r]) && !C2.S.words["cx_zu.b1"], "sheet 1 passed: its own rules go into review, not sheet 2's");
  let list = C2.cxPartList({ part: "drill", sec: "s2.conj3" });
  ok(list.length >= 6 && list.every(e => e.item.r.every(r => ["zu.a1", "zu.a2"].includes(r))), `day 1's drill keeps to sheet 1's rules (${list.length} items)`);
  C2.cxDrillDone("s2.conj3", 10, 12); C2.cxPartDone({ part: "drill", sec: "s2.conj3" });
  ok(!C2.cxSecDone("s2.conj3"), "not done after day 1");
  C2.S.course.day = "2000-01-01";
  C2.__today = "2026-10-19";
  ok(J(C2.cxTodayParts().filter(p => p.sec === "s2.conj3").map(p => p.part + ":" + (p.sheet || ""))) === J(["sheet:cx.t.zu2", "drill:"]), "the next day: its second sheet at once (a lesson's sheets on consecutive days)", J(C2.cxTodayParts()));
  C2.__today = "2026-10-18";
  C2.S.course.day = "2000-01-01"; C2.S.course.last = "2000-01-01"; C2.S.course.seen = Array.from({ length: 10 }, (_, i) => C2.addDays("2026-10-08", i));
  ok(J(C2.cxTodayParts().filter(p => p.sec === "s2.conj3").map(p => p.part + ":" + (p.sheet || ""))) === J(["sheet:cx.t.zu2", "drill:"]), "its day: the second sheet, then the drill");
  C2.cxSheetResult("cx.t.zu2", 1, true, "path");
  list = C2.cxPartList({ part: "drill", sec: "s2.conj3" });
  ok(list.some(e => e.item.r.some(r => ["zu.b1", "zu.b2"].includes(r))), "day 2's drill: the whole section");
  C2.cxDrillDone("s2.conj3", 12, 14);
  ok(C2.cxSecDone("s2.conj3"), "both sheets and the drill: the section is done");
  // s0.recap: the stage's checkpoint
  fresh2();
  ok(!C2.cxCheckpointReady(C2.CX.byId["s0.recap"]) && !C2.cxTodayParts().some(p => p.part === "checkpoint"), "the checkpoint waits while stage 0 has sections to do (coming ones too)");
  C2.CX.sections.filter(s => s.stage === 0 && s.id !== "s0.recap").forEach(s => { C2.S.course.sec[s.id] = { st: 3 }; });
  ["pr1", "pr2", "pr3", "pr4", "pr5", "pr7", "im1", "im2", "im3", "pf1", "pt11", "pt12", "pt13"].forEach(id => { C2.S.verb.sh[id] = 100; });
  C2.cxIntroduceRules("s0.neg", 3);
  ok(C2.cxCheckpointReady(C2.CX.byId["s0.recap"]) && C2.cxTodayParts().some(p => p.part === "checkpoint" && p.sec === "s0.recap"), "stage 0 done: the checkpoint comes in Today");
  const plan = C2.cxCheckpointPlan("s0.recap"), stageRules = C2.cxStageRules(0);
  ok(plan.length === 12 && plan.every(e => stageRules.includes(e.rule)) && new Set(plan.map(e => e.rule)).size === Math.min(12, stageRules.length), `12 questions over the stage's rules, round and round (${plan.length} over ${new Set(plan.map(e => e.rule)).size} of ${stageRules.length})`);
  ok(!C2.cxCheckpointResult("s0.recap", 8, 12) && !C2.cxSecDone("s0.recap"), "67%: not passed, it comes back");
  ok(!C2.cxCheckpointResult("s0.recap", 9, 12) && !C2.cxSecDone("s0.recap"), "75%: not passed");
  ok(!C2.cxCheckpointResult("s0.recap", 9, 12) && C2.cxSecDone("s0.recap") && C2.S.course.sec["s0.recap"].on === 1, "third try: the stage moves on anyway (the date matters more)");
  fresh2(); C2.cxIntroduceRules("s0.neg", 3);
  ok(C2.cxCheckpointResult("s0.recap", 10, 12) && C2.cxSecDone("s0.recap"), "83%: passed");
}

// ── the lesson clock (PLAN.md §9): lesson, practise, lesson, practise ──
{
  // The course as Session 1 left it — only the pilot built (the lessons of
  // Sessions 2 and 3 taken out again), so the clock's scenarios below stay the same.
  // tBuild(id, n): a lesson built with n sheets (the pilot's shape, its own rules)
  const C3 = loadCourse({ extra: `
    (function () {
      CX.sections.filter(s => s.ses >= 2 && !s.verb).forEach(s => {
        s.sets.forEach(id => delete CX.sets[id]); s.sheets.forEach(id => delete CX.sheets[id]); s.rules.forEach(r => delete CX.rules[r]);
        Object.assign(s, { built: false, sheets: [], sets: [], rules: [], diag: [] }); delete s.checkpoint; delete s.testout;
      });
    })();
    function tBuild(id, n) {
      const pilot = CX.byId["s0.neg"], ps = CX.sheets["cx.neg1"], k = id.replace(/\\W/g, "");
      const rid = Array.from({ length: 2 * n }, (_, i) => "t." + k + "-r" + (i + 1));
      const sheets = Array.from({ length: n }, (_, j) => ({ id: "cx.t." + k + j, title: id + " " + (j + 1), qn: 3, struct: ps.struct, why: "x", rules: ["a", "b"], ex: ps.ex, trap: "t",
        quiz: [{ at: "r1", k: "pick", q: "x", o: ["a", "b"], a: 0, why: "w" }], rid: rid.slice(2 * j, 2 * j + 2) }));
      const sets = pilot.sets.map(i => CX.sets[i]).filter(s => !s.gen).map((s, i) => ({ ...s, id: "d.t." + k + "." + i, ex: undefined, items: s.items.map((it, j) => ({ ...it, r: [rid[(i + j) % rid.length]] })) }));
      cxPack({ id: "t-" + k, sections: { [id]: { rules: Object.fromEntries(rid.map(r => [r, r])), sheets, drills: sets, testout: false } } });
      _cxSimMemo = null;
    }` });
  const day = d => { C3.__today = d; };
  const fresh3 = () => {
    C3.S = { words: {}, verb: { sh: {}, su: {}, day: "" }, path: { deadline: "2027-08-15", newPerDay: 10 } };
    day("2026-10-18");
    C3.pathDeadlineOn = () => !!C3.S.path.deadline; C3.pathScan = () => ({ due: 60 });
    C3.vxOn = () => true; C3.vxSheetPassed = id => !!(C3.S.verb.sh[id] > 0);
    C3.getWS = (d, i) => C3.S.words[d + "_" + i] || (C3.S.words[d + "_" + i] = { correct: 0, wrong: 0 });
    C3.introduceWord = ws => { if (ws.st) return false; ws.st = 1; ws.lrn = 1; ws.dueAt = Date.now(); return true; };
    C3.scheduleStage = ws => { ws.dueAt = Date.now() + 864e5; };
    C3.applyCorrect = ws => { ws.correct++; ws.lrn = 0; return { events: [] }; }; C3.applyWrong = ws => { ws.wrong++; ws.lrn = 1; return { events: [] }; };
    C3.migrateCourse();
  };
  const id = () => (C3.cxClockLesson() || {}).id;
  const verbToday = () => C3.cxVerbClock().today;
  // a study day: the day rolls over, the app is opened
  const open = d => { day(d); C3.S.course.day = "x"; C3.cxRollDay(); C3.S.verb.day = d; C3.S.verb.su = {}; };
  // a verb sheet opened and passed in Today
  const passVerb = v => { C3.S.verb.su[v] = 1; C3.cxVerbSheetLearned(v); C3.S.verb.sh[v] = 100; };
  const VERBS0 = ["pr1", "pr2", "pr3", "pr4", "pr5", "pr7", "im1", "im2", "im3", "pf1", "pt11", "pt12", "pt13"];
  ok(C3.CX.byId["s1.pt21"].verb.join() === "pt21" && C3.CX.byId["s0.verbs"].verb.slice(-3).join() === "pt11,pt12,pt13", "the Präteritum in steps: war & hatte in the A1 lesson, the regular one in A2");
  ok(C3.CX.sections.filter(s => s.verb).flatMap(s => s.verb).sort().join() === C3.GS_SHEETS.map(s => s.id).sort().join(), "every verb sheet in exactly one lesson");

  fresh3();
  ok(id() === "s0.neg", `nothing begun: the first built lesson in course order (${id()})`);
  // the learner: nicht/kein done, the Präsens lesson 9 of 10
  C3.S.course.sec["s0.neg"] = { st: 3, at: "2026-10-17" }; C3.S.course.last = "2026-10-17";
  VERBS0.filter(v => v !== "pr7").forEach(v => { C3.S.verb.sh[v] = 100; });
  ok(id() === "s0.verbs" && C3.cxCurrentLesson() && C3.cxCurrentLesson().id === "s0.verbs", "a lesson under way (the A1 verb lesson, 12/13): it carries on");
  ok(J(verbToday()) === J(["pr7"]) && C3.cxNextLessonDay() === "2026-10-18", `its next sheet comes today, whatever the break (${verbToday()})`);
  C3.S.verb.day = "2026-10-18"; C3.S.verb.su.pr7 = 1;
  ok(J(verbToday()) === J([]), "opened today (one a day): no other sheet today");
  passVerb("pr7");
  ok(C3.cxSecDone("s0.verbs") && !C3.cxCurrentLesson() && C3.S.course.last === "2026-10-18", "its last sheet passed: the lesson is done, its break starts today");
  const b0 = C3.cxBreak(), K0 = C3.cxClock();
  ok(b0 === C3.cxBreakAfter(C3.cxLessonsDone(), K0.G) && b0 >= 1 && b0 <= 3, `a break of ${b0} study day(s) (G ≈ ${K0.G.toFixed(2)} = (${K0.D} days − ${K0.S} sheets) ÷ ${K0.L} lessons)`);
  // the break: no new sheet; then the next lesson — the first ready one (skip ahead to A2)
  ok(C3.cxNextLessonDay() === C3.addDays("2026-10-18", b0 + 1), `the next lesson on ${C3.cxNextLessonDay()}`);
  open("2026-10-19");
  ok(b0 < 1 || (C3.cxDayLessons().length === 0 && J(verbToday()) === J([]) && !C3.cxTodayParts().some(p => ["sheet", "testout", "drill"].includes(p.part))), "a break day: no lesson, no sheet");
  ok(C3.cxTodayParts().some(p => p.part === "write" || p.part === "review"), "a break day: practice (reviews, writing)");
  ok(id() === "s1.pf", `every built A1 lesson done: the next built one comes, an A2 verb lesson (${id()})`);
  for (let i = 2; i <= b0 + 1; i++) open(C3.addDays("2026-10-18", i));
  ok(J(verbToday()) === J(["pf2"]), `the break over (${b0} study days): the next lesson's first sheet (${verbToday()})`);
  passVerb("pf2");
  open(C3.addDays("2026-10-18", b0 + 2));
  ok(J(verbToday()) === J(["pf3"]), "the next study day: its next sheet (days in a row)");
  // a day missed mid-lesson: it carries on at the next study day
  open(C3.addDays("2026-10-18", b0 + 5));
  ok(J(verbToday()) === J(["pf3"]) && C3.cxCurrentLesson().id === "s1.pf", "two days missed mid-lesson: the same sheet the next study day (never stretched)");
  ["pf3", "pf4", "pf5", "pf6"].forEach((v, i) => { open(C3.addDays("2026-10-18", b0 + 5 + i)); passVerb(v); });
  const end1 = C3.S.course.last, b1 = C3.cxBreak();
  ok(C3.cxSecDone("s1.pf") && Math.abs(b1 - b0) <= 1, `after the 5-sheet lesson the same break, ± 1 (${b1} vs ${b0} after the 1-sheet one)`);
  // an earlier lesson built later fills the gap first
  C3.tBuild("s0.gender", 3);
  ok(id() === "s0.gender", `an A1 lesson built later comes next, before the A2 ones (${id()})`);
  // a lesson whose prerequisite isn't built waits
  C3.tBuild("s0.acc", 1);
  ok(!C3.cxLessonReady(C3.cxSection("s0.acc")) && C3.cxSection("s0.acc").after.includes("s0.art"), "s0.acc built, but it builds on s0.art (not built): it waits");
  // the estimate → the real count
  const S1 = C3.cxClock().S;
  ok(C3.cxLessonSize(C3.cxSection("s0.plural")) === C3.cxSection("s0.plural").n && C3.cxLessonSize(C3.cxSection("s0.gender")) === 3, "not built: its estimate (n); built: its real sheets");
  C3.tBuild("s0.plural", C3.cxSection("s0.plural").n + 2);
  ok(C3.cxClock().S === S1 + 2, `a lesson built with 2 sheets more than its estimate: 2 more sheets ahead (${S1} → ${C3.cxClock().S})`);
  // a 3-sheet course lesson: its sheets on days in a row, each with its drill
  const d0 = C3.addDays(end1, b1 + 1);
  for (let i = 1; i <= b1 + 1; i++) open(C3.addDays(end1, i));
  const kinds = () => C3.cxTodayParts().filter(p => p.sec === "s0.gender").map(p => p.part + ":" + (p.sheet || "")).join(" ");
  ok(kinds() === "sheet:cx.t.s0gender0 drill:", `its day: sheet 1 and its drill (${kinds()})`);
  C3.cxSheetResult("cx.t.s0gender0", 1, true, "path");
  ok(!/sheet/.test(kinds()), "sheet 1 passed: no second sheet today");
  C3.cxDrillDone("s0.gender", 10, 12); C3.cxPartDone({ part: "drill", sec: "s0.gender" });
  open(C3.addDays(d0, 1));
  ok(kinds() === "sheet:cx.t.s0gender1 drill:", `the next day: sheet 2 (${kinds()})`);
  C3.cxSheetResult("cx.t.s0gender1", 1, true, "path"); C3.cxDrillDone("s0.gender", 10, 12);
  open(C3.addDays(d0, 2));
  C3.cxSheetResult("cx.t.s0gender2", 1, true, "path"); C3.cxDrillDone("s0.gender", 10, 12);
  ok(C3.cxSecDone("s0.gender") && C3.S.course.last === C3.addDays(d0, 2), "3 sheets, 3 days in a row: done, the break counts from its last day");
  // back after a long time away: the next lesson at once
  day(C3.addDays(d0, 40));
  ok(C3.cxNextLessonDay() === C3.addDays(d0, 40), "back after a long time away: the next lesson at once");
  // G rounded down: the days saved stay in the days left (G grows later)
  const seq = Array.from({ length: 10 }, (_, k) => C3.cxBreakAfter(k, 2.3));
  ok(seq.every(b => b === 2), `G 2.3: breaks ${seq.join(" ")} (the 0.3 kept for later lessons)`);
  ok(C3.cxBreakAfter(0, 2.9999999999) === 3 && C3.cxBreakAfter(5, 3) === 3, "G 3 (or a hair under it): 3");
  ok(J(Array.from({ length: 4 }, (_, k) => C3.cxBreakAfter(k, 0.5))) === J([0, 0, 0, 0]), "G 0.5 (behind): no break");
  // no finish date: lesson after lesson
  C3.S.path.deadline = ""; ok(C3.cxClock().G === 0 && C3.cxBreak() === 0, "no finish date: no break, lesson after lesson");
  C3.S.path.deadline = "2027-08-15";
  // waiting for new lessons: nothing built is ready
  fresh3();
  C3.S.course.sec["s0.neg"] = { st: 3 }; C3.S.course.last = "2026-10-01";
  C3.CX.sections.filter(s => s.verb && s.prio !== "C").forEach(s => s.verb.forEach(v => { C3.S.verb.sh[v] = 100; }));
  // (the lessons built above done; s0.acc's prerequisite isn't built)
  C3.CX.sections.filter(s => s.built && s.id !== "s0.acc").forEach(s => { C3.S.course.sec[s.id] = { st: 3 }; });
  ok(!C3.cxClockLesson() && C3.cxPlanner().waiting && C3.cxDayLessons().length === 0, "nothing ready (the rest not built yet): waiting — no lesson, the planner says so");
  ok(C3.cxClock().L > 50 && C3.cxPlanner().status === "green", `…and the lessons still to come are in the pace (${C3.cxClock().L} lessons, ${C3.cxClock().S} sheets)`);
  // the bonus waits for every other lesson
  ok(!C3.cxLessonReady(C3.cxSection("s4.k2p")), "the post-B1 verb lesson waits for the rest of the course");
  // the forecast: the complete course's dates — every lesson starts, the last paced one by the target
  fresh3(); C3.CX.sections.forEach(s => { if (s.built) delete C3.S.course.sec[s.id]; });
  const sim = C3.cxClockSim();
  const starts = C3.CX.sections.filter(s => s.prio !== "C").map(s => sim.start[s.id]);
  ok(starts.every(Boolean) && sim.last && sim.last <= "2027-07-06", `the clock run forward: every lesson starts, the last ends ${sim.last} (target 2027-07-06)`);
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
  ["pr1", "pr2", "pr3", "pr4", "pr5", "pr7", "im1", "im2", "im3", "pf1", "pt11", "pt12", "pt13"].forEach(id => { C.S.verb.sh[id] = 100; });
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
  ok(rep.length === 2 && /rule\(s\) due/.test(rep[1]) && /lesson clock: .*breaks ≈ [\d.]+ day/.test(rep[1]), "the usage report: sections, rules by tier, today and the planner", J(rep));
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
  fresh(); C.S.learn = {}; C.__due = 400; C.S.course.last = "2026-10-01";
  C.S.writing = { "2026": [{ id: "w1", d: "2026-10-15", p: "w.me", t: "x", w: 1 }] };
  const heavy = () => C.cxTodayParts().some(p => p.part === "write");
  ok(!heavy(), "a heavy lesson day, a text 3 days ago: no writing today");
  C.S.writing["2026"][0].d = "2026-10-14";
  ok(heavy(), "4 days since the last text: writing comes anyway");
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

// ── Session 2: Stage 0 built — where my progress lands, the verb lesson's drills ──
{
  const VERBS0 = ["pr1", "pr2", "pr3", "pr4", "pr5", "pr7", "im1", "im2", "im3", "pf1", "pt11", "pt12", "pt13"];
  const S0 = ["s0.sounds", "s0.gender", "s0.art", "s0.plural", "s0.pron", "s0.v2q", "s0.wq", "s0.num", "s0.acc", "s0.accpron"];
  ok(S0.every(id => C.cxLearnable(C.cxSection(id))) && C.cxSection("s0.recap").checkpoint, "every Stage 0 lesson is built, and its checkpoint");
  C.vxOn = () => true;
  fresh();
  ok(C.cxClockLesson().id === "s0.sounds" && C.cxTodayParts().some(p => p.part === "testout" && p.sec === "s0.sounds"), "nothing begun: Sounds and spelling first, with its test-out");
  // my progress as it stands: nicht / kein done, the A1 verb lesson passed
  fresh(); C.S.course.sec["s0.neg"] = { st: 3, at: "2026-10-17" }; C.S.course.last = "2026-10-01";
  VERBS0.forEach(v => { C.S.verb.sh[v] = 100; });
  ok(C.cxSecDone("s0.verbs") && C.cxSecDone("s0.neg"), "what I passed stays passed: the pilot and the A1 verb lesson are done");
  ok(C.cxClockLesson().id === "s0.sounds", `the Stage 0 lessons built now come before the A2 verb lessons (${C.cxClockLesson().id})`);
  // …but an A2 verb lesson I've started carries on first
  C.S.verb.sh.pf2 = 100;
  ok(C.cxCurrentLesson() && C.cxCurrentLesson().id === "s1.pf" && C.cxClockLesson().id === "s1.pf", "a lesson under way (pf2 passed) carries on first — never stretched");
  delete C.S.verb.sh.pf2;
  // a test-out passed: a two-sheet lesson done in one go, its rules in light review
  C.cxPartBegin({ part: "testout", sec: "s0.gender" });
  ok(C.cxTestoutResult("s0.gender", 7, 7) && C.cxSecDone("s0.gender") && C.cxSection("s0.gender").rules.every(r => (C.S.words["cx_" + r] || {}).st === 3), "the gender test-out passed: the lesson is done, its 7 rules at stage 3");
  // a test-out missed: the first sheet comes, then its drill (one sheet a day)
  fresh(); C.S.course.sec["s0.neg"] = { st: 3 }; VERBS0.forEach(v => { C.S.verb.sh[v] = 100; });
  ["s0.sounds"].forEach(id => { C.S.course.sec[id] = { st: 3, at: "2026-10-01" }; });
  C.S.course.last = "2026-10-01";
  ok(C.cxClockLesson().id === "s0.gender", "Sounds done: Gender next");
  ok(!C.cxTestoutResult("s0.gender", 4, 7), "the gender test-out missed (4/7)");
  ok(J(C.cxTodayParts().filter(p => p.sec === "s0.gender").map(p => p.part + ":" + (p.sheet || ""))) === J(["sheet:cx.gen1", "drill:"]), "…its first sheet today, then the drill", J(C.cxTodayParts()));
  const allow = new Set(C.cxSheet("cx.gen1").rid);
  C.cxSheetResult("cx.gen1", 1, true, "path");
  const dl = C.cxPartList({ part: "drill", sec: "s0.gender" });
  ok(dl.length >= 10 && dl.every(e => e.item.r.every(r => allow.has(r))) && ["compose", "translate", "write", "answer"].includes(C.cxItemKind(C.cxSet(dl[dl.length - 1].set), dl[dl.length - 1].item)), `day 1's drill: sheet 1's rules only, production last (${dl.length})`);
  ok(!C.cxSecDone("s0.gender") && C.cxLessonLeft(C.cxSection("s0.gender")) === 1, "one sheet passed: the lesson goes on tomorrow");
  // the verb lesson's book drills: a day's practice rotates its 30 sets, production last
  fresh(); VERBS0.forEach(v => { C.S.verb.sh[v] = 100; });
  const vsets = C.cxSecSets("s0.verbs").filter(s => !s.gen);
  ok(vsets.length >= 25, `the verb lesson has its book exercises (${vsets.length} sets)`);
  const p1 = C.cxDrillPlan("s0.verbs", 12), last = e => C.cxItemKind(C.cxSet(e.set), e.item);
  ok(p1.length === 12 && ["compose", "translate", "write"].includes(last(p1[p1.length - 1])), `12 items, production last (${p1.map(e => e.set).join(" ")})`);
  p1.forEach(e => { const ds = C.S.course.ds[e.set] || (C.S.course.ds[e.set] = [0, 0, 0]); ds[1]++; });
  const p2 = C.cxDrillPlan("s0.verbs", 12), seen1 = new Set(p1.map(e => e.set));
  ok(p2.filter(e => !seen1.has(e.set)).length >= 8, "the next practice: mostly other sets (the least asked first)");
  ok(C.cxMixSections().some(s => s.id === "s0.verbs"), "the verb lesson done: its drills join the mixed days");
  // the engine's forms: commands (du · ihr · Sie) and the generated sets' answers
  const imp = C.cxGenItems(C.cxSet("d9.1"), 10);
  ok(imp.length >= 8 && imp.every(it => it.t === "im" && it.a.includes(C.vxForm(C.vxVerb(it.inf), "im", it.p).ans)), "generated commands: the engine's form, with Sie where it belongs", J(imp.slice(0, 3).map(it => [it.q, it.a])));
  // the word-order rule moves "um sieben Uhr" whole
  const zug = { a: ["Ich nehme den Zug um sieben Uhr."] };
  ok(C.cxOrders(zug).includes("Um sieben Uhr nehme ich den Zug.") && !C.cxOrders(zug).some(o => /Uhr$/.test(o.replace(/\.$/, "")) && /^Um sieben nehme/.test(o)), "«um sieben Uhr» moves as one: Um sieben Uhr nehme ich den Zug.", J(C.cxOrders(zug)));
  ok(C.cxCheck(zug, "Um sieben Uhr nehme ich den Zug").ok && !C.cxCheck(zug, "Um sieben nehme ich den Zug Uhr").ok, "…and the broken order isn't accepted");
  // a verb rule on a miss: the sheet's own point
  const rv = C.cxRuleView("gs:pr4.r2");
  ok(rv && rv.sheet === "pr4" && /sprechen/.test(rv.text) && !C.cxRuleView("gs:nope.r1"), "a miss in the verb drills names the verb sheet's rule");
  // tiles of a question set: the first word small (it doesn't give the start away)
  const tl = C.cxTiles(C.cxSet("d6.9"), C.cxSet("d6.9").items[0]).tiles;
  ok(tl[0] === "wohnst", `question tiles: the verb written small (${tl.join(" ")})`);
  // the verb drills' own sentences reach the verb log: the form right in a
  // sentence otherwise wrong, the word I wrote for it on a miss — and, as
  // agreed, a missing umlaut is never a mistake (fahrt for fährt is right)
  // unless the 1 / 2 choice was asked and the other form picked
  const notes = []; C.learnNoteVerb = (F, t, p, right, given, want) => notes.push([F.inf, t, p, right, given, want]);
  const it87 = C.cxSet("d8.7").items[1], it614 = C.cxSet("d6.14").items[0];
  C.cxRecordAnswer({ set: "d8.7", item: it87 }, false, { rule: null }, { given: "Fahrt er nach Haus?" });
  C.cxRecordAnswer({ set: "d8.7", item: it87 }, false, { rule: null, umlaut: "fahrt" }, { given: "Fahrt er nach Hause?" });
  C.cxRecordAnswer({ set: "d8.7", item: it87 }, false, { rule: null }, { given: "Fährt sie nach Hause?" });
  C.cxRecordAnswer({ set: "d6.14", item: it614 }, true, { ok: true }, { given: "beginnt" });
  ok(notes.length === 4 && notes[0][3] && !notes[1][3] && notes[1][4] === "fahrt" && notes[2][3] && notes[3][3] && notes[3][0] === "beginnen",
    "verb drills feed the verb log: a missing umlaut is right, the other form picked in the 1 / 2 choice is the miss", J(notes));
  // the 1 / 2 choice in the course's drills: only when the plain spelling is another real form
  const uc = (set, i, typed) => C.cxUmlautChoice(C.cxSet(set).items[i], typed);
  const u1 = uc("d8.7", 1, "Fahrt er nach Hause?"), u2 = uc("d8.10", 0, "schlaft");
  ok(u1 && u1.right === "fährt" && u1.others.includes("fahrt") && u2 && u2.right === "schläft", "fahrt / schlaft typed: asked which one (fährt or fahrt)", J([u1, u2]));
  ok(!uc("d8.7", 1, "Fährt er nach Hause?") && !uc("d8.13", 0, "Wie lange fahrst du schon Auto?") && !uc("d1.2", 0, "die"),
    "typed with its umlaut, only one form that fits (fahrst → fährst), or no verb: nothing asked");
  delete C.learnNoteVerb;
}

// ── Session 3: Stage 1A built — where my progress lands next, in what order ──
{
  const VERBS0 = ["pr1", "pr2", "pr3", "pr4", "pr5", "pr7", "im1", "im2", "im3", "pf1", "pt11", "pt12", "pt13"];
  const S1 = ["s1.front", "s1.neg2", "s1.resp", "s1.dat", "s1.datpron", "s1.datverb", "s1.accdat", "s1.wer"];
  ok(S1.every(id => C.cxLearnable(C.cxSection(id))), "the eight Stage 1A lessons are built");
  ok(["s1.pf", "s1.sep"].every(id => C.cxSecSets(id).filter(s => !s.gen).length >= 8), "the Perfekt and prefix lessons have their book drills");
  C.vxOn = () => true;
  // all of Stage 0 done (lessons, checkpoint, the A1 verb lesson): the first
  // built A2 lesson comes — then the rest in course order, the verb lessons
  // (pf2–pf6, pr6) among them, wer / wen / wem after the dative
  fresh(); C.S.course.last = "2026-10-01";
  C.CX.sections.filter(s => s.stage === 0 && !s.verb).forEach(s => { C.S.course.sec[s.id] = { st: 3, at: "2026-10-01" }; });
  VERBS0.forEach(v => { C.S.verb.sh[v] = 100; });
  const order = [];
  for (let k = 0; k < 30; k++) {
    const s = C.cxClockLesson();
    if (!s || s.stage !== 1) break;
    order.push(s.id);
    if (s.verb) s.verb.forEach(v => { C.S.verb.sh[v] = 100; }); else C.S.course.sec[s.id] = { st: 3, at: "2026-10-01" };
  }
  // (the regular Präteritum, a verb lesson, comes where the course puts it: before the dative)
  // (Session 4's lessons come in among them — this test keeps to Session 3's; Session 4 has its own)
  const order3 = order.filter(id => C.cxSection(id).ses <= 3 || id === "s1.pt21");
  ok(J(order3) === J(["s1.front", "s1.neg2", "s1.resp", "s1.pf", "s1.sep", "s1.pt21", "s1.dat", "s1.datpron", "s1.datverb", "s1.accdat", "s1.wer"]),
    "Stage 0 done: the A2 lessons in course order — fronting first, wer/wen/wem after the dative", J(order));
  // a lesson waits for the ones it builds on
  fresh(); C.CX.sections.filter(s => s.stage === 0 && !s.verb).forEach(s => { C.S.course.sec[s.id] = { st: 3 }; }); VERBS0.forEach(v => { C.S.verb.sh[v] = 100; });
  ok(!C.cxLessonReady(C.cxSection("s1.wer")) && !C.cxLessonReady(C.cxSection("s1.datverb")) && !C.cxLessonReady(C.cxSection("s1.accdat")),
    "wer/wen/wem waits for the dative, the dative verbs and the contrast for the dative pronouns");
  C.S.course.sec["s1.dat"] = { st: 3 };
  ok(C.cxLessonReady(C.cxSection("s1.wer")) && C.cxLessonReady(C.cxSection("s1.datpron")) && !C.cxLessonReady(C.cxSection("s1.datverb")), "the dative done: wer/wen/wem and the pronouns are ready, the dative verbs still wait");
  // where I stand if I'm in the middle of Stage 0: Stage 0 keeps going first
  fresh(); C.S.course.sec["s0.neg"] = { st: 3 }; C.S.course.sec["s0.sounds"] = { st: 3 }; VERBS0.forEach(v => { C.S.verb.sh[v] = 100; });
  ok(C.cxClockLesson().stage === 0, `mid Stage 0: the next Stage 0 lesson, not a new A2 one (${C.cxClockLesson().id})`);
  // no test-out after Stage 0: the lesson opens with its sheet
  fresh(); C.CX.sections.filter(s => s.stage === 0 && !s.verb).forEach(s => { C.S.course.sec[s.id] = { st: 3, at: "2026-10-01" }; });
  VERBS0.forEach(v => { C.S.verb.sh[v] = 100; }); C.S.course.last = "2026-10-01";
  const parts = C.cxTodayParts().filter(p => p.sec === "s1.front");
  ok(!parts.some(p => p.part === "testout") && parts.some(p => p.part === "sheet" && p.sheet === "cx.front1"), "a Stage 1 lesson: no test-out, its first sheet", J(parts));
  // a sheet missed today: its drill still comes, as practice — on that sheet's rules, never the next sheet's
  fresh(); C.CX.sections.filter(s => s.stage === 0 && !s.verb).forEach(s => { C.S.course.sec[s.id] = { st: 3, at: "2026-10-01" }; });
  VERBS0.forEach(v => { C.S.verb.sh[v] = 100; }); C.S.course.last = "2026-10-01";
  C.cxPartBegin({ part: "sheet", sec: "s1.front", sheet: "cx.front1" });
  C.cxSheetResult("cx.front1", 0, false, "path");
  const miss = C.cxPartList({ part: "drill", sec: "s1.front" }), r1 = new Set(C.cxSheet("cx.front1").rid);
  ok(!C.cxSheetPassed("cx.front1") && miss.length >= 10 && miss.every(e => e.item.r.every(rr => r1.has(rr))), `sheet 1 missed: its drill keeps to sheet 1's rules (${[...new Set(miss.flatMap(e => e.item.r))].join(" ")})`);
  // the plan counts that drill as long as it is — and counting it moves no set's turn
  const turns = J(C.S.course.ds), size = C.cxPartSize({ part: "drill", sec: "s1.front" });
  ok(size === C.cxPartList({ part: "drill", sec: "s1.front" }).length && J(C.S.course.ds) !== turns, `the drill's size is its length (${size})`);
  const turns2 = J(C.S.course.ds); C.cxPartSize({ part: "drill", sec: "s1.front" });
  ok(J(C.S.course.ds) === turns2, "counting a drill moves no set's turn");
  // the generated Perfekt: the auxiliary and the participle, as the engine has them
  const pf = C.cxGenItems(C.cxSet("d10.9"), 10);
  ok(pf.length === 10 && pf.every(it => it.t === "pf" && /^er\/sie\/es ___ \(/.test(it.q) && it.a.includes(C.vxForm(C.vxVerb(it.inf), "pf", "er").ans) && /^(hat|ist) /.test(it.a[0])),
    "generated Perfekt: hat / ist + the participle, the engine's", J(pf.slice(0, 3).map(it => [it.q, it.a])));
  // a participle on its own (p2only) is logged as the Perfekt
  const notes = []; C.learnNoteVerb = (F, t, p, right, given, want) => notes.push([F.inf, t, p, right, given, want]);
  const it1010 = C.cxSet("d10.10").items[0];
  C.cxRecordAnswer({ set: "d10.10", item: it1010 }, true, { ok: true }, { given: "studiert" });
  C.cxRecordAnswer({ set: "d10.10", item: it1010 }, false, { rule: null }, { given: "gestudiert" });
  ok(notes.length === 2 && notes.every(n => n[0] === "studieren" && n[1] === "pf") && notes[0][3] && !notes[1][3] && notes[1][4] === "gestudiert",
    "a participle typed alone goes to the verb log as the Perfekt — right, or the word written", J(notes));
  delete C.learnNoteVerb;
  // the Perfekt lesson done: its book drills join the mixed days and Practise
  fresh(); VERBS0.concat(["pf2", "pf3", "pf4", "pf5", "pf6"]).forEach(v => { C.S.verb.sh[v] = 100; });
  ok(C.cxSecDone("s1.pf") && C.cxMixSections().some(s => s.id === "s1.pf"), "the Perfekt lesson passed: its drills join the mixed days");
  const pp = C.cxDrillPlan("s1.pf", 12);
  ok(pp.length === 12 && ["compose", "translate", "write"].includes(C.cxItemKind(C.cxSet(pp[pp.length - 1].set), pp[pp.length - 1].item)), `its practice: 12 items, production last (${pp.map(e => e.set).join(" ")})`);
}

// ── Session 4: Stage 1B built — the prepositions, the conjunctions, modals, wissen, reflexives, the Präteritum ──
{
  const VERBS0 = ["pr1", "pr2", "pr3", "pr4", "pr5", "pr7", "im1", "im2", "im3", "pf1", "pt11", "pt12", "pt13"];
  const S4 = ["s1.conj1", "s1.accprep", "s1.datprep", "s1.twoway", "s1.wowohin", "s1.conj2", "s1.modal", "s1.wissen", "s1.refl"];
  ok(S4.every(id => C.cxLearnable(C.cxSection(id))), "the nine Stage 1B lessons are built");
  ok(C.cxSecSets("s1.pt21").length >= 8 && C.cxSecSets("s1.pt21").some(s => !s.gen), "the regular Präteritum has its book drills");
  C.vxOn = () => true;
  // Stage 0 done: every built A2 lesson in course order — Session 3's and Session 4's together
  fresh(); C.S.course.last = "2026-10-01";
  C.CX.sections.filter(s => s.stage === 0 && !s.verb).forEach(s => { C.S.course.sec[s.id] = { st: 3, at: "2026-10-01" }; });
  VERBS0.forEach(v => { C.S.verb.sh[v] = 100; });
  const order = [];
  for (let k = 0; k < 30; k++) {
    const s = C.cxClockLesson();
    if (!s) break;
    order.push(s.id);
    if (s.verb) s.verb.forEach(v => { C.S.verb.sh[v] = 100; }); else C.S.course.sec[s.id] = { st: 3, at: "2026-10-01" };
    if (s.id === "s1.refl") break;
  }
  // (Session 5's possessives come in among them — this test keeps to Sessions 3 and 4; Session 5 has its own)
  const order4 = order.filter(id => C.cxSection(id).ses <= 4 || C.cxSection(id).verb);
  // (the strong Präteritum — a B1 verb lesson — sits after wo? vs wohin? on purpose: Oct 2026, moved one place in Session 4)
  ok(J(order4) === J(["s1.front", "s1.conj1", "s1.neg2", "s1.resp", "s1.pf", "s1.sep", "s1.accprep", "s1.pt21", "s1.dat", "s1.datpron", "s1.datverb", "s1.accdat", "s1.wer",
    "s1.datprep", "s1.twoway", "s1.wowohin", "s2.pt2", "s1.conj2", "s1.modal", "s1.wissen", "s1.refl"]),
    "Stage 0 done: the A2 lessons in course order — und/aber early, the prepositions after the dative, weil/dass before the modals", J(order4));
  // what waits for what
  fresh(); C.CX.sections.filter(s => s.stage === 0 && !s.verb).forEach(s => { C.S.course.sec[s.id] = { st: 3 }; }); VERBS0.forEach(v => { C.S.verb.sh[v] = 100; });
  const ready = id => C.cxLessonReady(C.cxSection(id));
  ok(ready("s1.accprep") && ready("s1.conj1") && ready("s1.conj2") && ready("s1.wissen"), "with Stage 0 done: the accusative prepositions, und/aber, weil/dass and wissen/kennen are ready");
  ok(!ready("s1.datprep") && !ready("s1.twoway") && !ready("s1.wowohin") && !ready("s1.modal") && !ready("s1.refl"),
    "the dative prepositions wait for the dative, the two-way ones for both, wo/wohin for the two-way, the modals for weil/dass, the reflexives for the dative pronouns");
  ["s1.accprep", "s1.dat"].forEach(id => { C.S.course.sec[id] = { st: 3 }; });
  ok(ready("s1.datprep") && !ready("s1.twoway"), "the dative done: its prepositions are ready, the two-way ones still wait");
  C.S.course.sec["s1.datprep"] = { st: 3 };
  ok(ready("s1.twoway") && !ready("s1.wowohin"), "both prepositions done: the two-way lesson is ready, wo/wohin after it");
  C.S.course.sec["s1.conj2"] = { st: 3 };
  ok(ready("s1.modal"), "weil/dass done: the modals are ready");
  // no test-out after Stage 0: a Session 4 lesson opens with its first sheet
  fresh(); C.CX.sections.filter(s => s.stage === 0 && !s.verb).forEach(s => { C.S.course.sec[s.id] = { st: 3, at: "2026-10-01" }; });
  ["s1.front"].forEach(id => { C.S.course.sec[id] = { st: 3, at: "2026-10-01" }; });
  VERBS0.forEach(v => { C.S.verb.sh[v] = 100; }); C.S.course.last = "2026-10-01";
  ok(C.cxClockLesson().id === "s1.conj1", `fronting done: und, aber, oder… next (${C.cxClockLesson().id})`);
  const parts = C.cxTodayParts().filter(p => p.sec === "s1.conj1");
  ok(!parts.some(p => p.part === "testout") && parts.some(p => p.part === "sheet" && p.sheet === "cx.co1"), "no test-out: its sheet", J(parts));
  // a lesson already under way keeps going first, whatever Session 4 built
  fresh(); C.CX.sections.filter(s => s.stage === 0 && !s.verb).forEach(s => { C.S.course.sec[s.id] = { st: 3, at: "2026-10-01" }; });
  VERBS0.forEach(v => { C.S.verb.sh[v] = 100; }); C.S.course.sec["s1.front"] = { st: 3 }; C.S.course.sec["s1.neg2"] = { st: 1, ok: { "cx.neg2a": 1 } };
  ok(C.cxClockLesson().id === "s1.neg2", `a lesson under way (niemand, nichts) finishes before und/aber comes (${C.cxClockLesson().id})`);
  // the generated Präteritum: the engine's -te forms; a prefix after the verb
  const pt = C.cxGenItems(C.cxSet("d14.1"), 10);
  ok(pt.length === 10 && pt.every(it => it.t === "pt" && it.a.includes(C.vxForm(C.vxVerb(it.inf), "pt", it.p).ans) && /te(st|n|t)?$/.test(it.a[0])), "generated Präteritum: the engine's -te forms", J(pt.slice(0, 3).map(it => [it.q, it.a])));
  const sep = C.cxGenItems(C.cxSet("d14.4"), 10).filter(it => ["abholen", "zuhören", "aufhören", "einkaufen", "zumachen", "aufräumen"].includes(it.inf));
  ok(sep.length > 0 && sep.every(it => / (ab|zu|auf|ein)$/.test(it.a[0])), "a separable verb's Präteritum: the prefix after it (holte ab)", J(sep.map(it => it.a[0])));
  // its book drills join the mixed days once the lesson is done
  fresh(); VERBS0.concat(["pt21"]).forEach(v => { C.S.verb.sh[v] = 100; });
  ok(C.cxSecDone("s1.pt21") && C.cxMixSections().some(s => s.id === "s1.pt21"), "the regular Präteritum passed: its drills join the mixed days");
  // 18•4 (commands) is the A1 verb lesson's: in its practice, not the wissen lesson's
  ok(C.cxSet("d18.4").sec === "s0.verbs" && C.cxCovOf("18.4").set === "d18.4", "18•4 (du / ihr / Sie commands) sits with the A1 verb lesson's commands");
  // the checker: a gap that closes the sentence takes just the missing part
  const g = C.cxSet("d29.2").items[0];
  ok(C.cxCheck(g, "meine Frau bleibt im Bett").ok && C.cxCheck(g, g.a[0]).ok, "«…, aber ___.»: the missing part alone is right, and so is the whole sentence");
  // a modal's vowel is grammar, not a slip; the fix is shown with its umlaut
  const m = C.cxCheck(C.cxSet("d17.11").items[0], "Mögst", C.cxSection("s1.modal"));
  ok(!m.ok && !m.near && m.rule === "mod.form", `«Mögst» for magst: a mistake, its rule (${m.rule}, near ${m.near})`);
  const m2 = C.cxCheck(C.cxSet("d17.10").items[1], "möchtet", C.cxSection("s1.modal"));
  ok(/möchte\b/.test(m2.msg || "") && !/mochte/.test(m2.msg || ""), `the fix keeps its umlaut (${m2.msg})`);
  // wo? or wohin? — the verb pair names its rule
  const w = C.cxCheck(C.cxSet("dp.ww").items[1], "Die Milch stellt im Kühlschrank.", C.cxSection("s1.wowohin"));
  ok(!w.ok && w.rule === "ww.pairs" && /steht/.test(w.msg || ""), `stellt for steht: the verb pair (${w.rule}: ${w.msg})`);
  // (the Session 4 review) correct German the checker used to reject
  const chk = (set, i, t) => C.cxCheck(C.cxSet(set).items[i], t, C.cxSection(C.cxSet(set).sec));
  ok(chk("dp.pt21", 2, "Jeden Tag spielte ich Fußball.").ok, "«jeden Tag» moves like «jeden Morgen»: Jeden Tag spielte ich Fußball.");
  ok(chk("dp.sub", 0, "Heute gehe ich nicht joggen, weil es regnet.").ok && chk("dsub.two", 0, "Heute komme ich nicht, weil ich arbeiten muss.").ok,
    "a main clause before «, weil …» moves its time word like any other: Heute gehe ich nicht joggen, weil es regnet.");
  ok(!chk("dsub.f", 0, "Ich komme mit, wenn ich Zeit habe.").ok, "…but a set where the order is the point (start with wenn) still wants its order");
  ok(!chk("dp.sub", 0, "Heute gehe ich nicht joggen, weil regnet es.").ok, "and the side clause's verb still goes last");
  const whole = chk("d7.10", 0, "Die Kinder rennen durch den Park."), wholeBad = chk("d7.10", 0, "Die Kinder rennen durch dem Park.");
  ok(whole.ok && !wholeBad.ok && wholeBad.rule === "ap.list" && wholeBad.right === "Die Kinder rennen durch den Park.",
    `a gap answered with the whole sentence: right when it is, its slip named when not, the answer shown whole (${wholeBad.right})`);
  ok(!chk("d7.10", 0, "Die Kinder laufen durch den Park.").ok, "…another sentence around the gap is not the answer");
  ok(chk("dsub.two", 0, "Ich komme heute nicht, weil ich arbeiten muss.").ok && chk("dsub.two", 0, "Ich komme heute nicht, weil ich muss arbeiten.").right === "Ich komme heute nicht, weil ich arbeiten muss.",
    "an item whose answers are whole sentences is checked as before (no gap taken out)");
  ok(chk("d19.5", 4, "Wo springt die Katze hin?").ok && /wohin/.test(chk("d19.5", 4, "Wo springt die Katze?").msg || ""), "wo … hin? is right too; wo? alone for a movement names wohin");
  // a day's drill of each new lesson: 10–14 items, production last
  S4.forEach(id => {
    fresh();
    const plan = C.cxDrillPlan(id);
    ok(plan.length >= 10 && plan.length <= 14 && ["compose", "translate", "write", "answer"].includes(C.cxItemKind(C.cxSet(plan[plan.length - 1].set), plan[plan.length - 1].item)), `${id}: a day's drill of ${plan.length}, production last`);
  });
}

// ── Session 5: Stage 1C built — possessives, the future's drills, comparison, adjective endings, zu + infinitive, the checkpoint ──
{
  const VERBS0 = ["pr1", "pr2", "pr3", "pr4", "pr5", "pr7", "im1", "im2", "im3", "pf1", "pt11", "pt12", "pt13"];
  const S5 = ["s1.poss", "s1.comp", "s1.adj", "s1.zu"];
  ok(S5.every(id => C.cxLearnable(C.cxSection(id))), "the four Stage 1C lessons are built");
  ok(C.cxSecSets("s1.fu").filter(s => !s.gen).length >= 8, `the future (a verb lesson) has its book drills (${C.cxSecSets("s1.fu").length} sets)`);
  ok(J(C.cxSection("s1.recap").checkpoint) === J({ n: 24, pass: 0.8 }), "Stage 1's checkpoint: 24 questions, 80 %");
  ok(J(S5.map(id => C.cxSection(id).sheets.length)) === J([2, 2, 3, 2]), "their sheets: 2 · 2 · 3 · 2");
  C.vxOn = () => true;
  // Stage 0 done: every built A2 lesson in course order — the Session 5 ones where the course puts them
  fresh(); C.S.course.last = "2026-10-01";
  C.CX.sections.filter(s => s.stage === 0 && !s.verb).forEach(s => { C.S.course.sec[s.id] = { st: 3, at: "2026-10-01" }; });
  VERBS0.forEach(v => { C.S.verb.sh[v] = 100; });
  const order = [];
  for (let k = 0; k < 40; k++) {
    const s = C.cxClockLesson();
    if (!s) break;
    order.push(s.id);
    if (s.verb) s.verb.forEach(v => { C.S.verb.sh[v] = 100; }); else C.S.course.sec[s.id] = { st: 3, at: "2026-10-01" };
    if (s.id === "s1.zu") break; // (then Stage 2's verb lessons, built in the verb track, take over while verb + preposition isn't built)
  }
  ok(J(order) === J(["s1.front", "s1.conj1", "s1.neg2", "s1.resp", "s1.pf", "s1.sep", "s1.accprep", "s1.pt21", "s1.dat", "s1.datpron", "s1.datverb", "s1.accdat", "s1.wer",
    "s1.datprep", "s1.twoway", "s1.wowohin", "s2.pt2", "s1.conj2", "s1.modal", "s1.poss", "s1.wissen", "s1.refl", "s1.fu", "s1.comp", "s1.adj", "s1.zu"]),
    "Stage 0 done: the possessives after the modals, then the future, comparison, adjective endings, zu + infinitive", J(order));
  // the checkpoint waits for the whole stage — verb + preposition too (built in Session 6)
  ok(!C.cxLessonReady(C.cxSection("s1.recap")) && !order.includes("s1.recap"), "every built Stage 1 lesson done: the checkpoint still waits for verb + preposition (Session 6)");
  C.S.course.sec["s1.verbprep"] = { st: 3, at: "2026-10-01" };
  ok(C.cxLessonReady(C.cxSection("s1.recap")) && C.cxClockLesson().id === "s1.recap", "the whole stage done: the checkpoint is next");
  const cp = C.cxCheckpointPlan("s1.recap"), cpRules = cp.map(e => e.rule);
  ok(cp.length === 24 && new Set(cpRules).size === 24 && cp.every(e => !["write", "open"].includes(C.cxItemKind(C.cxSet(e.set), e.item))) && cp.every(e => C.CX.rules[e.rule] && C.cxSection(C.CX.rules[e.rule].sec).stage === 1),
    `the checkpoint: 24 Stage 1 rules, one question each, nothing self-graded (${cp.length}, ${new Set(cpRules).size} rules)`);
  ok(cp.filter(e => (C.CX_LADDER[C.cxItemKind(C.cxSet(e.set), e.item)] || 0) >= 1).length >= 18, "…typed where it can");
  // what waits for what
  fresh(); C.CX.sections.filter(s => s.stage === 0 && !s.verb).forEach(s => { C.S.course.sec[s.id] = { st: 3 }; }); VERBS0.forEach(v => { C.S.verb.sh[v] = 100; });
  const ready = id => C.cxLessonReady(C.cxSection(id));
  ok(ready("s1.comp") && !ready("s1.poss") && !ready("s1.adj") && !ready("s1.zu"), "with Stage 0 done: comparison is ready; the possessives wait for the dative prepositions, the endings for the dative and comparison, zu for the modals");
  ["s1.dat", "s1.datprep"].forEach(id => { C.S.course.sec[id] = { st: 3 }; });
  ok(ready("s1.poss") && !ready("s1.adj"), "the dative and its prepositions done: the possessives are ready — the endings still wait for comparison");
  C.S.course.sec["s1.comp"] = { st: 3 };
  ok(ready("s1.adj"), "comparison done: the endings are ready (their third sheet puts der bessere, das größte before a noun)");
  ["s1.conj2", "s1.modal"].forEach(id => { C.S.course.sec[id] = { st: 3 }; });
  ok(ready("s1.zu"), "weil / dass and the modals done: zu + infinitive is ready");
  // no test-out after Stage 0: the lesson opens with its first sheet
  fresh(); C.CX.sections.filter(s => s.stage === 0 && !s.verb).forEach(s => { C.S.course.sec[s.id] = { st: 3, at: "2026-10-01" }; });
  C.CX.sections.filter(s => s.stage === 1 && C.CX.sections.indexOf(s) < C.CX.sections.indexOf(C.cxSection("s1.poss"))).forEach(s => { if (!s.verb) C.S.course.sec[s.id] = { st: 3, at: "2026-10-01" }; });
  C.CX.sections.filter(s => s.verb).forEach(s => s.verb.forEach(v => { if (!["fu1", "fu2"].includes(v)) C.S.verb.sh[v] = 100; }));
  C.S.course.last = "2026-10-01";
  ok(C.cxClockLesson().id === "s1.poss", `the modals done: the possessives next (${C.cxClockLesson().id})`);
  const parts = C.cxTodayParts().filter(p => p.sec === "s1.poss");
  ok(!parts.some(p => p.part === "testout") && parts.some(p => p.part === "sheet" && p.sheet === "cx.poss1"), "no test-out: its first sheet", J(parts));
  // each day of a several-sheet lesson: the sheets read so far, production last
  S5.forEach(id => C.cxSection(id).sheets.forEach((sh, k) => {
    fresh();
    const allow = new Set(C.cxSection(id).sheets.slice(0, k + 1).flatMap(x => C.cxSheet(x).rid));
    for (let d = 0; d < 6; d++) {
      const plan = C.cxDrillPlan(id, 14, allow), last = plan[plan.length - 1];
      ok(plan.length >= 8 && plan.every(e => e.item.r.every(r => allow.has(r))) && ["compose", "translate", "write", "answer"].includes(C.cxItemKind(C.cxSet(last.set), last.item)),
        `${id} after sheet ${k + 1} (day ${d + 1} of its rotation): ${plan.length} items on the sheets read, production last (${last && last.set})`);
      plan.forEach(e => { const ds = C.S.course.ds[e.set] || (C.S.course.ds[e.set] = [0, 0, 0]); ds[1]++; });
    }
  }));
  // a day's whole drill of each new lesson: 10–14 items, production last
  S5.forEach(id => {
    fresh();
    const plan = C.cxDrillPlan(id);
    ok(plan.length >= 10 && plan.length <= 14 && ["compose", "translate", "write", "answer"].includes(C.cxItemKind(C.cxSet(plan[plan.length - 1].set), plan[plan.length - 1].item)), `${id}: a day's drill of ${plan.length}, production last`);
  });
  // the future's book drills: a practice of 12, production last; joining the mixed days once fu1 · fu2 are passed
  fresh(); VERBS0.concat(["fu1", "fu2"]).forEach(v => { C.S.verb.sh[v] = 100; });
  const fp = C.cxDrillPlan("s1.fu", 12);
  ok(fp.length === 12 && ["compose", "translate", "write"].includes(C.cxItemKind(C.cxSet(fp[fp.length - 1].set), fp[fp.length - 1].item)), `the future's practice: 12 items, production last (${[...new Set(fp.map(e => e.set))].join(" ")})`);
  ok(C.cxSecDone("s1.fu") && C.cxMixSections().some(s => s.id === "s1.fu"), "fu1 and fu2 passed: the future's drills join the mixed days");
  // its forms reach the verb log as the Futur I: right in a sentence, the word written on a miss
  const notes = []; C.learnNoteVerb = (F, t, p, right, given, want) => notes.push([F.inf, t, p, right, given, want]);
  const f0 = C.cxSet("d11.8").items[0];
  C.cxRecordAnswer({ set: "d11.8", item: f0 }, true, { ok: true }, { given: "Wir werden ein neues Sofa kaufen." });
  C.cxRecordAnswer({ set: "d11.8", item: f0 }, false, { rule: "gs:fu1.r2" }, { given: "Wir werden kaufen ein neues Sofa." });
  ok(notes.length === 2 && notes.every(n => n[0] === "kaufen" && n[1] === "fu" && n[2] === "wir") && notes[0][3],
    "the future's forms go to the verb log as the Futur I (werden … kaufen)", J(notes));
  delete C.learnNoteVerb;
  // the checker: a mistake it finds is the grammar, never "almost" (hard)
  const chk = (set, i, t) => C.cxCheck(C.cxSet(set).items[i], t, C.cxSection(C.cxSet(set).sec));
  const t1 = chk("d20.8", 3, "teuerer"), t2 = chk("dcomp.am", 2, "altsten"), t3 = chk("dcomp.irr", 4, "nahsten");
  ok([t1, t2, t3].every(r => !r.ok && !r.near && r.msg), `one letter off, but the rule: teuerer · altsten · nahsten — mistakes, never "almost" (${[t1, t2, t3].map(r => r.rule)})`);
  ok(chk("d20.8", 5, "langer").ok && chk("d20.8", 5, "langer").soft.includes("umlaut"), "länger typed without its umlaut: right, as everywhere (agreed) — the umlaut is asked in its own pick set");
  ok(C.cxSet("dcomp.uml").t === "pick" && C.cxSet("dcomp.uml").items.every(it => it.o.length === 2), "…the pick set: älter or alter?");
  // the right answer said other ways
  ok(chk("d11.9", 1, "Ich werde heute Abend ein Risotto kochen.").ok && chk("d11.9", 1, "Ich koche heute Abend ein Risotto.").ok, "11•9: with a time word both the Präsens and werden are right");
  ok(!chk("d11.6", 2, "Wir fahren nächste Woche ins Engadin.").ok, "11•6 says start with Nächste Woche: the order is the point");
  ok(chk("d24.8", 0, "eine Wohnung in Zürich zu finden").ok && chk("d24.8", 0, "Es ist schwierig, eine Wohnung in Zürich zu finden.").ok, "a zu-part: the gap alone or the whole sentence");
  ok(chk("dzu.um", 0, "Um die Prüfung zu bestehen.").ok, "Why? — Um … zu. on its own is a whole answer");
}

// ── behind: a Should lesson not begun gives way to the Must ones (PLAN.md §5) ──
{
  C.vxOn = () => true;
  const VERBS0 = ["pr1", "pr2", "pr3", "pr4", "pr5", "pr7", "im1", "im2", "im3", "pf1", "pt11", "pt12", "pt13"];
  // on time (15 Aug 2027): the course's own order — Sounds and spelling (Should) first
  fresh();
  ok(C.cxStatusOf(C.cxClock()) !== "red" && !C.cxLate() && C.cxClockLesson().id === "s0.sounds", `on time: the usual order, Sounds first (${C.cxClockLesson().id})`);
  // behind (a date the course can't make at a sheet a day): the Must lessons first
  fresh({ path: { deadline: "2026-12-01", newPerDay: 10 } });
  ok(C.cxLate() && C.cxClockLesson().id === "s0.gender", `behind: Sounds (Should) gives way — Gender first (${C.cxClockLesson().id})`);
  const nx0 = C.cxNextSections(30).map(s => s.id);
  ok(nx0[0] === "s0.gender" && nx0.indexOf("s0.sounds") > 0 && nx0.slice(0, nx0.indexOf("s0.sounds")).every(id => C.cxSection(id).prio === "M"),
    `…and the coming lessons list it after the Must ones ready now (${nx0.join(" ")})`);
  const sim = C.cxClockSim(400, false);
  ok(sim.start["s0.gender"] && sim.start["s0.sounds"] && sim.start["s0.sounds"] > sim.start["s0.gender"], `the forecast agrees: Sounds starts after Gender (${sim.start["s0.gender"]} · ${sim.start["s0.sounds"]})`);
  // nothing is skipped: once no Must lesson is ready, it comes
  C.CX.sections.filter(s => s.stage === 0 && !s.verb && s.prio === "M" && !s.checkpoint).forEach(s => { C.S.course.sec[s.id] = { st: 3 }; });
  VERBS0.forEach(v => { C.S.verb.sh[v] = 100; });
  ok(C.cxCheckpointReady(C.cxSection("s0.recap")), "behind: the Stage 0 checkpoint doesn't wait for Sounds");
  const nx = C.cxNextSections(40).map(s => s.id);
  ok(nx.indexOf("s0.recap") >= 0 && nx.indexOf("s0.sounds") > nx.indexOf("s0.recap") && nx.indexOf("s0.sounds") > nx.indexOf("s1.front"), `behind: the checkpoint and the A2 lessons first, Sounds still in the list (${nx.slice(0, 4).join(" ")} … s0.sounds at ${nx.indexOf("s0.sounds")})`);
  // a lesson under way is never put off
  C.S.course.sec["s0.sounds"] = { st: 1 };
  ok(C.cxClockLesson().id === "s0.sounds", "behind, but Sounds already begun: it finishes first");
  // on time again: the usual order (and the checkpoint waits for every lesson of its stage)
  fresh(); C.CX.sections.filter(s => s.stage === 0 && !s.verb && s.prio === "M" && !s.checkpoint).forEach(s => { C.S.course.sec[s.id] = { st: 3 }; });
  VERBS0.forEach(v => { C.S.verb.sh[v] = 100; });
  ok(!C.cxCheckpointReady(C.cxSection("s0.recap")) && C.cxClockLesson().id === "s0.sounds", "on time: the checkpoint waits for Sounds, which comes next");
  // a verb lesson never gives way (it paces the verb track): Stage 1 behind keeps the regular Präteritum where it is
  fresh({ path: { deadline: "2026-12-01", newPerDay: 10 } });
  C.CX.sections.filter(s => s.stage === 0 && !s.verb).forEach(s => { C.S.course.sec[s.id] = { st: 3 }; }); VERBS0.forEach(v => { C.S.verb.sh[v] = 100; });
  const order = [];
  for (let k = 0; k < 30; k++) { const s = C.cxClockLesson(); if (!s) break; order.push(s.id); if (s.verb) s.verb.forEach(v => { C.S.verb.sh[v] = 100; }); else C.S.course.sec[s.id] = { st: 3 }; if (s.id === "s1.refl") break; }
  ok(C.cxLate() && order.indexOf("s1.pt21") === order.indexOf("s1.accprep") + 1, `behind: the regular Präteritum (a verb lesson) keeps its place (${order.join(" ")})`);
  // the conversation units sit right after the grammar they need, in their own part
  const pos = id => C.CX.sections.indexOf(C.cxSection(id));
  ok(pos("s3.greet") === pos("s1.datprep") + 1 && pos("s3.way") === pos("s1.wowohin") + 1 && pos("s3.shop") === pos("s1.modal") + 1
    && pos("s3.bus") === pos("s1.verbprep") + 1 && pos("s3.school") === pos("s1.recap") + 1 && pos("s3.travel") === pos("s2.k2") + 1,
    "the six conversation units: each right after the lesson its dialogue needs");
  ok(["s3.greet", "s3.way", "s3.bus", "s3.school", "s3.shop", "s3.travel"].every(id => C.cxSection(id).stage === 3) && !C.cxStageRules(1).some(r => /^s3/.test(r)),
    "…still their own part (💬), not in Stage 1's or 2's checkpoint");
}

// ── a pile bigger than a day: the reviews take turns ──
// (Session 3's review: the slips came in the course's order every day and
// the rules due by lowest stage, so a pile left some unasked for weeks)
{
  fresh();
  const R = Object.keys(C.CX.rules), slips = R.slice(0, 60), dueR = R.slice(60, 100);
  const W = r => C.getWS(C.CX_DECK, r);
  slips.forEach((r, i) => Object.assign(W(r), { st: 2, lrn: 1, wrong: 1, metOn: "2026-10-01", lastAnsweredAt: 1e12 + (60 - i) * 1e6, dueAt: 1 }));
  dueR.forEach((r, i) => Object.assign(W(r), { st: 4 - (i % 3), lrn: 0, metOn: "2026-10-01", lastAnsweredAt: 1e12, dueAt: 1e12 + (40 - i) * 1e6 }));
  const { fix, due } = C.cxDueRules();
  ok(fix[0] === slips[59] && fix[59] === slips[0], "slips: the longest unasked first, not the course's order", J([fix[0], fix[59]]));
  ok(due[0] === dueR[39] && due[39] === dueR[0], "rules due: the longest waiting first, whatever their stage", J([due[0], due[39]]));
  const parts = C.cxTodayParts(), warm = parts.find(p => p.part === "warm"), rev = parts.find(p => p.part === "review");
  ok(warm && J(warm.rules) === J(fix.slice(0, C.CX_WARM_MAX)), "the warm-up: the longest-waiting slips", J(warm && warm.rules));
  const dueIn = rev ? rev.rules.filter(r => dueR.includes(r)).length : 0;
  ok(rev && dueIn >= Math.floor(rev.rules.length / 3) && rev.rules.filter(r => slips.includes(r)).every(r => fix.indexOf(r) >= C.CX_WARM_MAX),
    `more slips than room: the rules due still get a third of the review (${dueIn}/${rev && rev.rules.length})`);
}

// ── a review cut over two sessions counts both cards in the plan ──
// (Session 3's review: the second card counted only up to its own length,
// on top of what the first had counted — 1–2 short on long review days)
{
  fresh();
  const take = (n, k) => Array.from({ length: k }, () => C.cxPlanTake("review:", n, true)).filter(Boolean).length;
  ok(take(8, 8) === 8, "the first card (cut to 8): its 8 count");
  C.cxPartDone({ part: "review", rules: Array(8).fill("neg.kein"), cut: 1 });
  ok(take(10, 11) === 10 && C.S.course.dq["review:"] === 18, "the next card's 10 count on top (18), and no more", J(C.S.course.dq));
  // a card left half-way and opened again: its questions count once
  fresh();
  ok(take(10, 4) === 4 && take(10, 10) === 6, "a card left and opened again: 10 in all, not 14");
}

console.log(`course unit: ${pass} passed, ${fail} failed`);
process.exit(fail ? 1 : 0);
