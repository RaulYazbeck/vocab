// The course over the whole journey, with the real scheduler (srs.js) on
// a fake clock — no browser. Every lesson section of the skeleton gets a
// synthetic pack shaped like the pilot (1–3 sheets, 4 rules each, the
// pilot's drill sets), so this also measures the course at full size.
//
//   node sim.mjs [--days (to the finish date)] [--acc 0.8] [--testout 0.3] [--seed 7]
//                [--skip 0.2]          a share of days with no app at all
//                [--break 60:21]       a 21-day break from day 60
//                [--late 120]          the course starts 120 days in (catching up)
//                [--deadline 2027-08-15]
//                [--due 40:120]        word reviews a day (the grammar block fits around them)
//   node sim.mjs --matrix              every scenario below × 3 seeds, each checked:
//
// Checked every day: no new section before the pace allows it (on track),
// never two new sections unless behind, never three; at most one writing
// prompt; the day's grammar questions within reason. At the end: every
// section done by the target (when the start left room for it), every
// rule 🌳 Known by the finish date, no long stretch without a new sheet,
// writing every week. Exit 1 on any failure.
import vm from "node:vm";
import { loadCourse } from "./load.mjs";

const argv = process.argv;
const num = (k, d) => { const i = argv.indexOf("--" + k); return i > 0 ? +argv[i + 1] : d; };
const str = (k, d) => { const i = argv.indexOf("--" + k); return i > 0 ? argv[i + 1] : d; };
const DAY = 864e5, START = "2026-10-18";

// Synthetic packs: the pilot's shape, our own placeholder sentences.
const SYNTH = `
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

function run(o) {
  const deadline0 = o.deadline || "2027-08-15";
  const days = o.days || Math.round((Date.parse(deadline0) - Date.parse(START)) / DAY) + 1, acc = o.acc ?? 0.8, testout = o.testout ?? 0.3, skip = o.skip || 0, late = o.late || 0;
  const brk = o.brk || null, deadline = o.deadline || "2027-08-15", due = o.due || [40, 120];
  let seed = o.seed || 7;
  const rnd = () => { seed = (seed * 1103515245 + 12345) & 0x7fffffff; return seed / 0x7fffffff; };
  const away = d => d < late || brk && d >= brk[0] && d < brk[0] + brk[1];
  const C = loadCourse({ real: true, extra: SYNTH });
  C.__rnd = rnd; vm.runInContext("Math.random = () => __rnd();", C);
  let wordsDue = 70;
  Object.assign(C, {
    sessionConsecutive: 0, checkAchievements() {}, questEvent() {}, celebrateReview() {}, addExp() {}, logEvent() {}, _learnDay() {}, invalidatePathScan() {},
    introduceWord(ws, t = C.Date.now()) { if (ws.st) return false; ws.st = 1; ws.pk = 1; ws.lrn = 1; ws.sAt = t; ws.dueAt = t; ws.metOn = C.studyToday(); return true; },
    pathDeadlineOn: () => true, pathDaysLeft: () => C.daysBetween(C.studyToday(), deadline), pathScan: () => ({ due: wordsDue }),
    shuffle: a => { for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(rnd() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; } return a; },
  });
  C.S = { words: {}, path: { deadline, newPerDay: 11 }, verb: { sh: {} }, learn: {} };
  // The learner's verb sheets passed (PLAN.md §1); more come through the
  // verb track, about 2 every 5 days.
  ["pr1", "pr2", "pr3", "pr4", "pr5", "pr7", "im1", "im2", "im3", "pf1", "pt11", "pt12", "pt13"].forEach(id => { C.S.verb.sh[id] = 100; });
  C.vxSheetPassed = id => !!C.S.verb.sh[id];
  const verbQueue = C.CX.sections.filter(s => s.verb).flatMap(s => s.verb).filter(id => !C.S.verb.sh[id]);
  C.__now = Date.parse(START + "T09:00:00");
  C.migrateCourse();

  const sections = C.CX.sections.filter(s => s.built && (s.sheets.length || s.checkpoint));
  const target = C.addDays(deadline, -C.CX_LAG);
  const bad = [], rows = [], doneOn = {}, cps = [];
  const fail = m => { if (bad.length < 12) bad.push(m); };
  const M = { stageDone: {}, stageStart: {}, q: 0, maxQ: 0, inApp: 0, contrast: 0, contrastLesson: 0, two: 0, writes: 0, lateDays: 0, maxDue: 0, dueHigh: 0, sheetDays: [], writeDays: [], maxMs: 0 };
  const okFor = e => { const ws = e.rule && C.cxRuleWS(e.rule); return rnd() < Math.min(0.97, acc + (ws ? (ws.st || 0) * 0.02 : 0)); };
  for (let d = 0; d < days; d++) {
    C.__now = Date.parse(START + "T09:00:00") + d * DAY;
    const today = C.studyToday();
    if (d % 5 === 0 || d % 5 === 2) { const v = verbQueue.shift(); if (v) C.S.verb.sh[v] = 100; }
    if (away(d) || skip && d > 0 && rnd() < skip) continue;
    M.inApp++;
    wordsDue = Math.round(due[0] + rnd() * (due[1] - due[0]));
    const t0 = performance.now();
    // the morning: what the pace allows
    const P = C.cxPlanner(), allowed = C.cxNextLessonDay() <= today, underway = C.cxUnderway();
    const fresh = s => !C.cxSecState(s) && !C.S.course.dd["new:" + s];
    const parts = C.cxTodayParts();
    const freshSecs = [...new Set(parts.filter(p => ["testout", "sheet", "checkpoint"].includes(p.part) && fresh(p.sec)).map(p => p.sec))];
    if (P.status === "green" && !allowed && !underway && freshSecs.length) fail(`${today}: a new section before the pace allows (next ${C.cxNextLessonDay()})`);
    if (freshSecs.length > 1 && P.status !== "red") fail(`${today}: ${freshSecs.length} new sections while ${P.status}`);
    if (freshSecs.length > 2) fail(`${today}: ${freshSecs.length} new sections`);
    if (parts.filter(p => p.part === "write").length > 1) fail(`${today}: two writing prompts`);
    if (freshSecs.length > 1) M.two++;
    if (parts.some(p => p.contrast)) { M.contrast++; if (parts.some(p => ["sheet", "drill", "checkpoint"].includes(p.part))) M.contrastLesson++; }
    let q = 0, sheet = false;
    for (const p of parts) {
      C.cxPartBegin(p);
      if (!C.cxPartLive(p)) continue;
      if (p.part === "testout") {
        const n = C.cxPartSize(p); q += n;
        if (C.cxTestoutResult(p.sec, rnd() < testout ? n : Math.floor(n * 0.6), n)) sheet = true; // something new (known already)
        C.cxPartDone(p); continue;
      }
      if (p.part === "sheet") {
        q += 3;
        if (!C.cxSheetResult(p.sheet, rnd() < 0.75 ? 1 : 2 / 3, true, "path")) C.cxSheetResult(p.sheet, rnd() < 0.85 ? 1 : 2 / 3, true, "path");
        if (C.cxSheetPassed(p.sheet)) { C.cxPartDone(p); sheet = true; }
        continue;
      }
      if (p.part === "write") { q++; M.writes++; M.writeDays.push(d); C.cxJournalSave(C.cxJournalPick(0).id, "Ich schreibe heute ein paar Sätze."); C.cxPartDone(p); continue; }
      const list = C.cxPartList(p);
      let right = 0;
      list.forEach(e => {
        const ok = okFor(e); if (ok) right++;
        C.cxRecordAnswer(e, ok, ok ? { ok: true } : C.cxCheck(e.item, "falsch", C.cxSection(C.CX.sets[e.set].sec)), {});
        q++;
      });
      if (p.part === "drill") C.cxDrillDone(p.sec, 0, list.length);
      if (p.part === "checkpoint") { const pass = C.cxCheckpointResult(p.sec, right, list.length); sheet = true; cps.push(`${p.sec} ${today}: ${right}/${list.length}${pass ? " ✓" : C.cxSecDone(p.sec) ? " → on anyway" : ""}`); }
      C.cxPartDone(p);
    }
    if (sheet) M.sheetDays.push(d);
    M.maxMs = Math.max(M.maxMs, performance.now() - t0);
    M.q += q; M.maxQ = Math.max(M.maxQ, q);
    if (q > 60) fail(`${today}: ${q} grammar questions`);
    const dueN = C.cxDueRules().due.length;
    M.maxDue = Math.max(M.maxDue, dueN); if (dueN > 60) M.dueHigh++;
    sections.forEach(s => { if (doneOn[s.id] === undefined && C.cxSecDone(s.id)) doneOn[s.id] = d; });
    C.CX.stages.forEach(st => { const secs = sections.filter(s => s.stage === st.id); if (M.stageDone[st.id] === undefined && secs.length && secs.every(s => doneOn[s.id] !== undefined)) M.stageDone[st.id] = today; });
    C.CX.stages.forEach(st => { if (M.stageStart[st.id] === undefined && sections.some(s => s.stage === st.id && (C.cxSecState(s.id) || C.S.course.dd["new:" + s.id]))) M.stageStart[st.id] = today; });
    if (o.table && (d % 30 === 0 || d === days - 1)) {
      const rules = Object.keys(C.CX.rules).map(r => C.cxRuleWS(r)).filter(ws => ws && ws.st);
      const Q = C.cxPlanner();
      rows.push({ date: today, done: Object.keys(doneOn).length, q, due: dueN, learned: rules.filter(ws => ws.st >= 2 && !ws.lrn).length,
        known: rules.filter(ws => ws.st >= 5).length, left: Q.left, plan: Q.status, gap: C.cxGap(), next: C.cxNextLessonDay(), pace: Q.pace === null ? "" : +Q.pace.toFixed(2) });
    }
  }
  // ── the end ──
  // The sections paced to the date (post-B1 — "only if time allows" — come after, one a week).
  const core = sections.filter(s => s.prio !== "C"), bonus = sections.filter(s => s.prio === "C");
  const lastDone = core.every(s => doneOn[s.id] !== undefined) ? Math.max(...core.map(s => doneOn[s.id])) : null;
  const finish = lastDone === null ? null : C.addDays(START, lastDone);
  const firstIn = late || 0, room = C.daysBetween(C.addDays(START, firstIn), target), need = core.reduce((n, s) => n + (s.n || 1), 0);
  const feasible = room >= need; // one sheet a day would get there
  if (!finish) fail(`not every section done in ${days} days (${core.filter(s => doneOn[s.id] !== undefined).length}/${core.length})`);
  else if (feasible && finish > C.addDays(target, 3)) fail(`finished ${finish}, after the target ${target}`);
  M.bonus = bonus.filter(s => doneOn[s.id] !== undefined).length + "/" + bonus.length;
  const coreRules = new Set(core.flatMap(s => s.rules));
  const rules = Object.keys(C.CX.rules).filter(r => coreRules.has(r)).map(r => C.cxRuleWS(r)).filter(Boolean);
  const known = rules.filter(ws => ws.st >= 5).length;
  // by the finish date (the run ends there): every rule Known, but a slip or two in the last days
  if (feasible && known < rules.length * 0.98) fail(`${rules.length - known} rules not 🌳 Known by the finish date`);
  // stretches without a new sheet while the app was used and sections remained
  let longest = 0;
  for (let i = 1; i < M.sheetDays.length; i++) {
    let gap = 0;
    for (let d = M.sheetDays[i - 1] + 1; d < M.sheetDays[i]; d++) if (!away(d)) gap++;
    longest = Math.max(longest, gap);
  }
  if (!skip && longest > C.CX_GAP_MAX + 1) fail(`${longest} days in the app without a new sheet`);
  let wGap = 0; for (let i = 1; i < M.writeDays.length; i++) { let g = 0; for (let d = M.writeDays[i - 1] + 1; d < M.writeDays[i]; d++) if (!away(d)) g++; wGap = Math.max(wGap, g); }
  if (!skip && wGap > 7) fail(`${wGap} days in the app without writing`);
  const kept = C.cxJournalList().length;
  if (kept !== M.writes) fail(`texts kept ${kept} ≠ written ${M.writes}`);
  const gaps = M.sheetDays.slice(1).map((d, i) => d - M.sheetDays[i]);
  return { o, bad, rows, cps, finish, target, feasible, known, rules: rules.length, sections: sections.length, M, longest, wGap,
    gapAvg: gaps.length ? gaps.reduce((a, b) => a + b, 0) / gaps.length : 0, C };
}

const SCEN = [
  ["on track", {}],
  ["struggling (60 %)", { acc: 0.6 }],
  ["strong (95 %), tests out", { acc: 0.95, testout: 0.9 }],
  ["no test-outs", { testout: 0 }],
  ["30 % of days skipped", { skip: 0.3 }],
  ["half the days skipped", { skip: 0.5 }],
  ["30-day break in Dec", { brk: [60, 30] }],
  ["45-day break in spring", { brk: [150, 45] }],
  ["starts 5 months late", { late: 150 }],
  ["starts 6.5 months late", { late: 200 }],
  ["finish 15 Jul 2027", { deadline: "2027-07-15" }],
  ["finish 15 Dec 2027", { deadline: "2027-12-15" }],
  ["heavy word days", { due: [150, 260] }],
  ["you: A1 known (85 % test-outs)", { testout: 0.85, acc: 0.8 }],
];
if (argv.includes("--matrix")) {
  const t0 = Date.now(); let failed = 0;
  console.log("scenario".padEnd(27) + "seed  finish      (target)     sheet every  max q/day  avg q  writing  Known      worst stretch");
  for (const [name, o] of SCEN) for (const seed of [1, 2, 3]) {
    const r = run({ ...o, seed });
    const M = r.M;
    console.log(`${(r.bad.length ? "✗ " : "✓ ") + name}`.padEnd(27) + `${seed}     ${r.finish || "—"}  (${r.target})${r.feasible ? " " : "*"}  ${r.gapAvg.toFixed(1).padStart(4)} days  ${String(M.maxQ).padStart(6)}     ${(M.q / Math.max(1, M.inApp)).toFixed(1).padStart(5)}  ${String(M.writes).padStart(5)}    ${r.known}/${r.rules}  ${r.longest}d sheet · ${r.wGap}d writing · post-B1 ${M.bonus}`);
    r.bad.forEach(b => console.log("     ✗ " + b));
    if (r.bad.length) failed++;
  }
  console.log(`(* the start left less than a day per sheet: the target can't be met, only approached)`);
  console.log(`matrix: ${SCEN.length * 3 - failed}/${SCEN.length * 3} scenarios passed in ${((Date.now() - t0) / 1000).toFixed(0)} s`);
  process.exit(failed ? 1 : 0);
}
const brkArg = str("break", "");
const r = run({ days: num("days", 0), acc: num("acc", 0.8), testout: num("testout", 0.3), seed: num("seed", 7), skip: num("skip", 0), late: num("late", 0),
  brk: brkArg ? brkArg.split(":").map(Number) : null, deadline: str("deadline", "2027-08-15"), due: str("due", "40:120").split(":").map(Number), table: true });
const C = r.C;
console.log(`course at full size: ${r.sections} lesson sections, ${C.CX.sections.filter(s => s.checkpoint).length} checkpoints, ${r.rules} rules, ${Object.keys(C.CX.sets).length} drill sets`);
console.table(r.rows);
console.log(`sections done: ${r.finish ? "all, the last on " + r.finish : "not all"}; target ${r.target}${r.feasible ? "" : " (out of reach from this start)"} · post-B1 (if time allows) ${r.M.bonus}`);
console.log(`checkpoints: ${r.cps.join(" · ") || "none taken"}`);
console.log("stages: " + C.CX.stages.map(st => `${st.name}: ${r.M.stageStart[st.id] || "—"} → ${r.M.stageDone[st.id] || "—"}`).join("\n        "));
console.log(`a new sheet every ${r.gapAvg.toFixed(1)} days on average · longest stretch without one ${r.longest} days · two new sections on ${r.M.two} days · contrast days ${r.M.contrast} (${r.M.contrastLesson} with a section)`);
console.log(`grammar questions a day: ${(r.M.q / Math.max(1, r.M.inApp)).toFixed(1)} on average, ${r.M.maxQ} at most · writing ${r.M.writes} texts (longest gap ${r.wGap} days) · rule reviews due at most ${r.M.maxDue} · rules Known ${r.known}/${r.rules}`);
console.log(`slowest day of model work: ${r.M.maxMs.toFixed(1)} ms`);
r.bad.forEach(b => console.log("✗ " + b));
console.log(r.bad.length ? "sim: FAILED" : "sim: passed");
process.exit(r.bad.length ? 1 : 0);
