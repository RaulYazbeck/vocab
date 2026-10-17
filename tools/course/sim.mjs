// The course over the whole journey, with the real scheduler (srs.js) on
// a fake clock — no browser. Every lesson section of the skeleton gets a
// synthetic pack shaped like the pilot (1 sheet, 4 rules, 10 drill sets of
// 10 items + production), so this also measures the course at full size.
//
//   node sim.mjs [--days 300] [--acc 0.8] [--testout 0.3] [--seed 7]
//                [--skip 0.2]          a share of days with no app at all
//                [--break 60:21]       a 21-day break from day 60
//                [--late 120]          the course starts 120 days in (catching up)
//                [--deadline 2027-08-15]
//
// Each simulated day: the course's parts as Today would bring them, every
// question answered (right with the learner's accuracy, a little better
// on rules that hold). It prints the journey: when the sections are done,
// how many grammar questions a day asks, the review load, the planner,
// rules learned / Known — and how long the day's model work takes.
import { loadCourse } from "./load.mjs";

const arg = (k, d) => { const i = process.argv.indexOf("--" + k); return i > 0 ? +process.argv[i + 1] : d; };
const DAYS = arg("days", 300), ACC = arg("acc", 0.8), TESTOUT = arg("testout", 0.3), SKIP = arg("skip", 0), LATE = arg("late", 0);
const sarg = (k, d) => { const i = process.argv.indexOf("--" + k); return i > 0 ? process.argv[i + 1] : d; };
const BRK = sarg("break", "").split(":").map(Number), DEADLINE = sarg("deadline", "2027-08-15");
const away = d => d < LATE || BRK.length === 2 && d >= BRK[0] && d < BRK[0] + BRK[1];
let seed = arg("seed", 7);
const rnd = () => { seed = (seed * 1103515245 + 12345) & 0x7fffffff; return seed / 0x7fffffff; };

// Synthetic packs: the pilot's shape, our own placeholder sentences.
const synth = `
(function () {
  const pilot = CX.byId["s0.neg"];
  CX.sections.forEach(sec => {
    if (sec.built || sec.verb) return;
    const k = sec.id.replace(/\\W/g, "");
    if (sec.kind === "recap") { cxPack({ id: "sim-" + k, sections: { [sec.id]: { checkpoint: { n: 20, pass: 0.8 } } } }); return; }
    // n sheets: the section's 4·n rules spread over them, 4 each.
    const n = sec.n || 1, rid = Array.from({ length: 4 * n }, (_, i) => "sim." + k + "-r" + (i + 1));
    const sheets = Array.from({ length: n }, (_, j) => ({ id: "cx.sim." + k + j, title: sec.title + (n > 1 ? " " + (j + 1) : ""), qn: 3, struct: [["a", "who"], ["b", "verb"]], why: "x",
      rid: rid.slice(4 * j, 4 * j + 4), rules: ["r1", "r2", "r3", "r4"], ex: [["a", "a"], ["b", "b"], ["c", "c"]], trap: "t", quiz: [] }));
    const sets = pilot.sets.map(id => CX.sets[id]).filter(s => !s.gen).map((s, i) => ({ ...s, id: "d.sim." + k + "." + i, ex: undefined,
      items: s.items.map((it, j) => ({ ...it, r: [rid[(i * 3 + j) % rid.length]] })) }));
    cxPack({ id: "sim-" + k, sections: { [sec.id]: { rules: Object.fromEntries(rid.map(r => [r, r])), sheets, drills: sets, diag: pilot.diag } } });
  });
})();`;
const C = loadCourse({ real: true, extra: synth });
const DAY = 864e5;
let now = Date.parse("2026-10-18T09:00:00");
C.__now = now;
// What the course calls in the app that a simulation doesn't need.
Object.assign(C, {
  sessionConsecutive: 0, checkAchievements() {}, questEvent() {}, celebrateReview() {}, addExp() {}, logEvent() {}, _learnDay() {}, invalidatePathScan() {},
  introduceWord(ws, t = C.Date.now()) { if (ws.st) return false; ws.st = 1; ws.pk = 1; ws.lrn = 1; ws.sAt = t; ws.dueAt = t; ws.metOn = C.studyToday(); return true; },
  pathDeadlineOn: () => true, pathDaysLeft: () => C.daysBetween(C.studyToday(), DEADLINE), pathScan: () => ({ due: 70 }),
  shuffle: a => { for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(rnd() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; } return a; },
});
C.S = { words: {}, path: { deadline: DEADLINE, newPerDay: 11 }, verb: { sh: {} } };
// The learner's verb sheets passed (PLAN.md §1).
["pr1", "pr2", "pr3", "pr4", "pr5", "pr7", "im1", "im2", "im3", "pf1", "pt11", "pt12", "pt13"].forEach(id => { C.S.verb.sh[id] = 100; });
C.vxSheetPassed = id => !!C.S.verb.sh[id];
// Verb sheets keep coming through the verb track: about 2 every 5 days.
const verbQueue = C.CX.sections.filter(s => s.verb).flatMap(s => s.verb).filter(id => !C.S.verb.sh[id]);
C.migrateCourse();

const sections = C.CX.sections.filter(s => s.built && (s.sheets.length || s.checkpoint));
console.log(`course at full size: ${sections.length} lesson sections (${sections.filter(s => s.sheets.length > 1).length} with 2–3 sheets), ${C.CX.sections.filter(s => s.checkpoint).length} checkpoints, ${Object.keys(C.CX.rules).length} rules, ${Object.keys(C.CX.sets).length} drill sets, ${Object.values(C.CX.sets).reduce((n, s) => n + (s.items || []).length, 0)} items`);

const rows = [], doneOn = {}, cps = [];
let maxMs = 0, totalQ = 0, maxQ = 0, contrastDays = 0, skipped = 0, twoDays = 0, contrastLesson = 0, writes = 0;
const okFor = e => {
  const ws = e.rule && C.cxRuleWS(e.rule);
  return rnd() < Math.min(0.97, ACC + (ws ? (ws.st || 0) * 0.02 : 0));
};
for (let d = 0; d < DAYS; d++) {
  now = Date.parse("2026-10-18T09:00:00") + d * DAY; C.__now = now;
  if (d % 5 === 0 || d % 5 === 2) { const v = verbQueue.shift(); if (v) C.S.verb.sh[v] = 100; }
  if (away(d) || SKIP && rnd() < SKIP) { skipped++; if (d % 30 === 0) rows.push({ day: d, date: C.studyToday(), done: Object.keys(doneOn).length, q: 0, due: C.cxDueRules().due.length, plan: C.cxPlanner().status, away: 1 }); continue; }
  const t0 = performance.now();
  const parts = C.cxTodayParts();
  if (parts.some(p => p.part === "sheet" || p.part === "testout") && parts.filter(p => p.part === "drill").length > 1) twoDays++;
  let q = 0;
  if (parts.some(p => p.contrast)) { contrastDays++; if (parts.some(p => p.part === "sheet" || p.part === "drill" || p.part === "checkpoint")) contrastLesson++; }
  for (const p of parts) {
    C.cxPartBegin(p);
    if (p.part === "testout") {
      if (!C.cxPartLive(p)) continue;
      const n = C.cxPartSize(p); q += n;
      C.cxTestoutResult(p.sec, rnd() < TESTOUT ? n : Math.floor(n * 0.6), n);
      C.cxPartDone(p); continue;
    }
    if (p.part === "sheet") {
      if (!C.cxPartLive(p)) continue;
      q += 3;
      if (!C.cxSheetResult(p.sheet, rnd() < 0.75 ? 1 : 2 / 3, true, "path")) C.cxSheetResult(p.sheet, rnd() < 0.85 ? 1 : 2 / 3, true, "path");
      if (C.cxSheetPassed(p.sheet)) C.cxPartDone(p);
      continue;
    }
    if (!C.cxPartLive(p)) continue;
    if (p.part === "write") { writes++; C.cxPartDone(p); continue; }
    const list = C.cxPartList(p);
    let right = 0;
    list.forEach(e => {
      const ok = okFor(e); if (ok) right++;
      const res = ok ? { ok: true } : C.cxCheck(e.item, "falsch", C.cxSection(C.CX.sets[e.set].sec));
      C.cxRecordAnswer(e, ok, res, {});
      q++;
    });
    if (p.part === "drill") C.cxDrillDone(p.sec, 0, list.length);
    if (p.part === "checkpoint") { const pass = C.cxCheckpointResult(p.sec, right, list.length); cps.push(`${p.sec} day ${d}: ${right}/${list.length}${pass ? " ✓" : C.cxSecDone(p.sec) ? " → on anyway" : ""}`); }
    C.cxPartDone(p);
  }
  const ms = performance.now() - t0;
  maxMs = Math.max(maxMs, ms); totalQ += q; maxQ = Math.max(maxQ, q);
  sections.forEach(s => { if (!doneOn[s.id] && C.cxSecDone(s.id)) doneOn[s.id] = d; });
  if (d % 30 === 0 || d === DAYS - 1) {
    const rules = Object.keys(C.CX.rules).map(r => C.cxRuleWS(r)).filter(ws => ws && ws.st);
    const P = C.cxPlanner();
    rows.push({ day: d, date: C.studyToday(), done: Object.keys(doneOn).length, q, due: C.cxDueRules().due.length, learned: rules.filter(ws => ws.st >= 2 && !ws.lrn).length,
      known: rules.filter(ws => ws.st >= 5).length, started: rules.length, left: P.left, plan: P.status, pace: P.pace === null ? "" : +P.pace.toFixed(2), eta: P.eta, ms: +ms.toFixed(1) });
  }
}
console.table(rows);
const lastDone = Math.max(...Object.values(doneOn));
console.log(`sections done: ${Object.keys(doneOn).length}/${sections.length} — the last on day ${lastDone} (${new Date(Date.parse("2026-10-18") + lastDone * DAY).toISOString().slice(0, 10)}); target ${C.cxPlanner().target || "2027-07-06"}`);
console.log(`checkpoints: ${cps.join(" · ") || "none taken"}`);
console.log(`days away: ${skipped} · days with two new sections: ${twoDays} · writing prompts: ${writes}`);
console.log(`grammar questions a day: ${(totalQ / Math.max(1, DAYS - skipped)).toFixed(1)} on average (days in the app), ${maxQ} at most · contrast days: ${contrastDays} (${contrastLesson} with a new section, when tight) · slowest day of model work: ${maxMs.toFixed(1)} ms`);
const ms = []; for (let k = 0; k < 20; k++) { const t = performance.now(); C.cxTodayParts(); C.cxTodayCounts(); ms.push(performance.now() - t); }
console.log(`Today card numbers at full size: ${(ms.reduce((a, b) => a + b) / ms.length).toFixed(2)} ms`);
