// A real learner's journey to the finish date, in the real app (Chromium,
// a fake clock): a backup's state (REAL_STATE, the "gv5_de" value), every
// Today session played card by card through the app's own handlers, day
// after day until the finish date. The course's lessons not built yet get
// synthetic packs shaped like the pilot (as tools/course/sim-app.mjs), so
// the lesson clock runs as it will once they are.
//
// The learner does the day's plan: Long sessions until Today has nothing
// left to ask (with the code before pathOwed: until it says "All caught
// up"), then extra practice until the plan quest is done — the padding.
// Accuracy by kind of card, from the profile's usage log by default.
//
// Every day it records the plan (its parts and count), the right answers
// given, what was still owed at the end, how the plan quest ended (count /
// nothing owed / not done), the sources of the answers, the finish-date
// status and the pace check. At the end: when every word was met and
// Known, when the verb ledger and items were done, how close the count
// came to the work, and every day something was left owed.
//
//   REAL_STATE=state.json TZID=Europe/Berlin node sim-journey.mjs
//     [--days 300] [--seed 7] [--skip 0] [--breaks 60:5,150:7] [--accScale 1]
//     [--typed 0.86] [--choice 0.97] [--verb 0.8] [--course 0.88] [--sheetq 0.94]
//     [--len long] [--out file.json]
//   (serve the repo root on :8765 — BASE= for another — npm install once in
//   tools/audio/tests)
import fs from "node:fs";
import { openApp } from "../verb-track/browser.mjs";
const arg = (k, d) => { const i = process.argv.indexOf("--" + k); return i > 0 ? process.argv[i + 1] : d; };
const CFG = {
  days: +arg("days", 300), seed: +arg("seed", 7), skip: +arg("skip", 0), len: arg("len", "long"),
  breaks: String(arg("breaks", "")).split(",").filter(Boolean).map(b => b.split(":").map(Number)),
  acc: { typed: +arg("typed", 0.86), choice: +arg("choice", 0.97), verb: +arg("verb", 0.8), course: +arg("course", 0.88), sheetq: +arg("sheetq", 0.94), repair: +arg("repair", 0.9) },
  scale: +arg("accScale", 1),
  lean: arg("lean", ""), // PATH.VERB_LEAN for this run (compare with / without)
};
const OUT = arg("out", "");
const { browser, page, errors } = await openApp({ course: true, width: 390, height: 844, state: process.env.REAL_STATE || "" });
page.setDefaultTimeout(0);
const r = await page.evaluate(async (CFG) => {
  // ── the fake clock, quiet effects, a seeded dice ──
  const real = Date.now.bind(Date), RD = Date; let off = 0;
  Date.now = () => real() + off;
  window.Date = class extends RD { constructor(...a) { if (a.length) super(...a); else super(RD.now() + off); } static now() { return real() + off; } };
  window.saveState = () => {}; window.saveToCloud = () => {}; window.saveLocalOnly = () => {};
  window.showCelebrateToast = () => {}; window.confettiBurst = () => {}; window.playSuccess = () => {}; window.playFailure = () => {}; window.haptic = () => {}; window.speak = () => {};
  window.mistakeHeld = () => false;
  let seed = CFG.seed; const rnd = () => { seed = (seed * 1103515245 + 12345) & 0x7fffffff; return seed / 0x7fffffff; };
  Math.random = rnd;
  const at = h => { const d = new RD(Date.now()); d.setHours(h, 0, 0, 0); off += d.getTime() - Date.now(); };
  const NEW = typeof pathOwedAny === "function"; // the code under test has pathOwed
  if (CFG.lean !== "" && PATH.VERB_LEAN !== undefined) PATH.VERB_LEAN = +CFG.lean;
  const owedAny = NEW ? () => pathOwedAny() : () => !questTodayExhausted();
  const planQ = () => (S.quests.list || []).find(q => q.tpl === "a_plan");

  // ── the course's lessons not built yet: synthetic packs (sim-app.mjs) ──
  const ps = CX.sheets["cx.neg1"], pilot = CX.byId["s0.neg"];
  CX.sections.forEach(sec => {
    if (sec.built || sec.verb) return;
    const k = sec.id.replace(/\W/g, "");
    if (sec.kind === "recap") { cxPack({ id: "sim-" + k, sections: { [sec.id]: { checkpoint: { n: 20, pass: 0.8 } } } }); return; }
    const n = sec.n || 1, rid = Array.from({ length: 4 * n }, (_, i) => "sim." + k + "-r" + (i + 1));
    const sheets = Array.from({ length: n }, (_, j) => ({ id: "cx.sim." + k + j, title: sec.title + (n > 1 ? " " + (j + 1) : ""), qn: 3,
      struct: ps.struct, why: ps.why, rules: ps.rules, ex: ps.ex, trap: ps.trap, quiz: ps.quiz.map(q => ({ ...q })), rid: rid.slice(4 * j, 4 * j + 4) }));
    const sets = pilot.sets.map(id => CX.sets[id]).filter(s => !s.gen).map((s, i) => ({ ...s, id: "d.sim." + k + "." + i, ex: undefined,
      items: s.items.map((it, j) => ({ ...it, r: [rid[(i * 3 + j) % rid.length]] })) }));
    cxPack({ id: "sim-" + k, sections: { [sec.id]: { rules: Object.fromEntries(rid.map(x => [x, x])), sheets, drills: sets, diag: pilot.diag } } });
  });

  const fails = [], notes = [];
  const fail = m => { if (fails.length < 60) fails.push(m); };
  const P = k => Math.min(0.995, CFG.acc[k] * CFG.scale);
  // ── playing a card (sim-app.mjs, with accuracy by kind) ──
  const playSheet = () => {
    const g = _gs; let k = 0;
    while (g.step < g.steps.length && k++ < 40) gsGo(1);
    k = 0;
    while (g.quiz && !g.quiz.done && k++ < 60) {
      const cur = g.quiz.list[g.quiz.i], Q = cur.q, ok = rnd() < P("sheetq");
      if (Q.k === "type") { document.getElementById("gs-input").value = ok ? Q.a[0] : "xyz"; gsQuizCheck(); if (!g.quiz.answered) gsQuizCheck(); }
      else if (Q.k === "order") { cur.picked = Q.a.map((_, i) => i); if (!ok) cur.picked.reverse(); gsQuizCheck(); }
      else gsQuizPick(ok ? Q.a : (Q.a + 1) % Q.o.length);
      gsQuizNext();
    }
    gsQuizFinish();
  };
  const cxAnswer = ok => {
    const r = _cx, cur = r.list[r.i], set = cxSet(cur.set), item = cur.item, k = cxItemKind(set, item);
    if (k === "pick" || k === "respond") { const opts = item.o || set.o, want = ok ? item.a[0] : opts.find(o => o !== item.a[0]); return cxPick(opts.indexOf(want)); }
    if (k === "write" || k === "open") { document.getElementById("cx-text").value = "Ich habe keinen Fernseher und kein Auto."; return cxCheckCur(); }
    if (k === "order") { cur.picked = cur.bank.map((b, bi) => [b.i, bi]).sort((x, y) => x[0] - y[0]).map(x => x[1]); if (!ok) cur.picked.reverse(); return cxCheckCur(); }
    if (cur.mode === "tiles") cxTypeInstead();
    const inp = document.getElementById("cx-input");
    inp.value = ok ? item.a[0] : "Das ist ganz falsch";
    cxCheckCur(); if (!r.answered) cxCheckCur();
  };
  const playRunner = () => { let k = 0; while (_cx && !_cx.done && k++ < 120) { cxAnswer(rnd() < P("course")); cxNext(); } if (_cx && _cx.done) cxFinish(); };
  const playWrite = () => {
    const min = cxJournalMin(_cj.p), words = Array.from({ length: min + 3 }, (_, i) => ["Ich", "wohne", "seit", "zwei", "Jahren", "in", "Zürich", "und", "lerne", "Deutsch."][i % 10]).join(" ");
    document.getElementById("cx-jtext").value = words; cxJournalCount(); cxJournalSubmit(); cxJournalDone();
  };
  const playWord = (it, s) => {
    const k = it.w && it.w.vx ? "verb" : it.t === "choice" || it.t === "listen" ? "choice" : "typed";
    const ok = s.repairPhase ? rnd() < P("repair") : rnd() < P(k);
    if (it.w && it.w.vx) { document.getElementById("p-input").value = ok ? it.w.vx.form.ans : "zzz qqq"; pathCheckTyped(); }
    else if (it.t === "choice" || it.t === "listen") { const i = it.opts.findIndex(o => o.correct); pathAnswerChoice(ok ? i : (i + 1) % it.opts.length); }
    else { const ans = it.t === "cloze" ? it.cloze.answer : it.t === "reverse" ? gamePrompt(it.w) : it.w[WORD_KEY]; pathGradeTyped(ok ? ans : "zzz qqq", ok); }
    pathNext();
  };
  const tick = () => new Promise(r => setTimeout(r, 0)); // (the app's deferred work runs, as between taps)
  const playSession = async (opts = {}) => {
    startPathSession(CFG.len, { noBonus: true, ...opts });
    const s = pathSession;
    if (!s) return false;
    let guard = 0;
    while (pathSession === s && s.cur && guard++ < 1500) {
      const it = s.cur;
      if (it.t === "repairOffer") { pathRepair(true); continue; }
      if (it.t === "bonus") { if (it.minion) pathMinion(false); else pathBonus(false); continue; }
      if (it.t === "learn") { pathNext(); continue; }
      if (it.t === "sheet" || it.t === "cx" && it.part === "sheet") { if (!_gs || _gs.mode !== "path") { fail(`${studyToday()}: a sheet card without its viewer`); pathNext(); continue; } playSheet(); continue; }
      if (it.t === "cx") {
        if (it.part === "write") { if (!_cj) { pathNext(); continue; } playWrite(); continue; }
        if (!_cx) { pathNext(); continue; }
        playRunner(); continue;
      }
      playWord(it, s);
    }
    if (pathSession) { fail(`${studyToday()}: a session didn't end (${s.cur && s.cur.t})`); endPathSession(true); }
    await tick();
    off += 20 * 60000; // twenty minutes later
    invalidatePathScan(); if (typeof invalidatePathOwed === "function") invalidatePathOwed();
    return true;
  };
  const snap = () => {
    const sc = pathScan(true), L = vxLeft();
    return { met: sc.met, known: sc.known, total: sc.total, unmet: pathUnmet(sc), od: sc.overdue, due: sc.due, cellsLeft: L.cells, itemsLeft: L.items,
      vxKnown: vxCatalog().filter(it => { const ws = S.words[vxKey(it.id)]; return ws && ws.st >= STAGE_KNOWN; }).length, vxAll: vxCatalog().length,
      verbs: vxVerbs().filter(vxVerbReady).length };
  };
  // What's late, and why (the last few words / verb items short of Known).
  const stragglers = () => {
    const words = vocabGroups().flatMap(g => g.decks.flatMap(d => d.words.map((w, i) => [d.id + "_" + i, S.words[d.id + "_" + i], w])))
      .filter(([k, ws]) => !(ws && ws.st >= STAGE_KNOWN)).slice(0, 12)
      .map(([k, ws, w]) => `${k} ${w[WORD_KEY]} st${ws ? ws.st : 0}${ws && ws.rt ? " rt" : ""}${ws && ws.sk ? " sk" : ""}${ws && ws.fl ? " fl" : ""}${ws && ws.rp ? " rp" : ""}${ws && ws.lrn ? " lrn" : ""} k${ws && ws.k ? ws.k.toFixed(2) : "-"} due ${ws && ws.dueAt ? new Date(ws.dueAt).toISOString().slice(0, 10) : "-"}`);
    const items = vxCatalog().filter(it => { const ws = S.words[vxKey(it.id)]; return !ws || (ws.st || 0) < STAGE_KNOWN; }).slice(0, 12)
      .map(it => { const ws = S.words[vxKey(it.id)]; return `${it.id} st${ws ? ws.st : 0} unit ${it.unit}:${vxUnitState(it.unit)}${it.x ? " lemma st" + vxLemma(it.x).st : ""}${it.kind === "r" ? " verbs " + vxRuleVerbs(it.rule).length : ""} due ${ws && ws.dueAt ? new Date(ws.dueAt).toISOString().slice(0, 10) : "-"}`; });
    return { words, items };
  };

  // ── the days ──
  const days = [];
  const start = studyToday(), deadline = S.path.deadline;
  let firstAllMet = null, firstAllKnown = null, ledgerDone = null, itemsStarted = null, itemsKnown = null, atDeadline = null;
  for (let day = 0; day < CFG.days; day++) {
    if (day > 0) off += 864e5;
    at(8);
    const today = studyToday();
    if (today > deadline && firstAllKnown && ledgerDone) break;
    const brk = CFG.breaks.some(([from, n]) => day >= from && day < from + n);
    if (brk || (CFG.skip && day > 0 && rnd() < CFG.skip)) { days.push({ d: today, skipped: 1 }); continue; }
    pathRollDay(); pathMarkActive();
    if (typeof questEnsureToday === "function") questEnsureToday();
    const plan = pathEnsurePlan(pathScan(true));
    const owed0 = NEW ? pathOwed(true) : null;
    const pc = NEW && typeof pathPaceCheck === "function" ? pathPaceCheck() : null;
    const st = pathDeadlineStatus();
    // The day: Today until nothing is owed, then extra practice until the
    // plan quest is done (the padding).
    // (more can come due while practising: the learner goes on until both
    // are done)
    let n = 0, pad = 0, okAtOwed0 = null;
    for (let round = 0; round < 4; round++) {
      while (n < 12) {
        if (!owedAny()) { if (okAtOwed0 === null) okAtOwed0 = S.quests.m.ok || 0; break; }
        if (!(await playSession())) break;
        n++;
      }
      if (okAtOwed0 === null && !owedAny()) okAtOwed0 = S.quests.m.ok || 0;
      while (pad < 6 && planQ() && !planQ().done) { if (!(await playSession({ practice: true }))) break; pad++; }
      if (!owedAny()) break;
    }
    const q = planQ(), ow = NEW ? pathOwed(true) : null, u = usageDay();
    const dueNotAsked = () => { const c = pathReviewCandidates(Date.now()), ks = new Set([...c.fix, ...c.due].map(x => x.d.id + "_" + x.i)), out = [];
      vocabGroups().forEach(g => g.decks.forEach(d => d.words.forEach((w, i) => { const k = d.id + "_" + i, ws = S.words[k]; if (ws && isDue(ws) && !ks.has(k)) out.push(k + JSON.stringify({ st: ws.st, rt: ws.rt, sk: ws.sk, lrn: ws.lrn, rp: ws.rp, fl: ws.fl, due: ws.dueAt && new Date(ws.dueAt).toISOString() })); })));
      return out.join(" ") + ` · leave ${S.path.plan && S.path.plan.leave} · candidates ${ks.size}`; };
    if (NEW && ow.total > 0) fail(`${today}: ${ow.total} still owed after ${n} sessions ${JSON.stringify(ow)}` + (ow.words ? ` · due words not in Today: ${dueNotAsked()}` : "") + (ow.cx ? ` · course: ${JSON.stringify(cxTodayCounts())} parts ${JSON.stringify(cxTodayParts().map(p => [p.part, p.sec, cxPartSize(p)]))} rules due ${JSON.stringify(cxDueRules())}` : ""));
    if (q && !q.done) fail(`${today}: the plan quest still open after the day and ${pad} extra round(s) (${q.prog}/${q.target})`);
    const sn = snap();
    if (!firstAllMet && sn.unmet === 0) firstAllMet = today;
    if (!firstAllKnown && sn.known >= sn.total) firstAllKnown = today;
    if (!ledgerDone && sn.cellsLeft === 0) ledgerDone = today;
    if (!itemsStarted && sn.itemsLeft === 0) itemsStarted = today;
    if (!itemsKnown && sn.vxKnown >= sn.vxAll) itemsKnown = today;
    if (today === deadline || (day === CFG.days - 1 && !atDeadline)) atDeadline = { d: today, ...stragglers() };
    days.push({ d: today, target: plan ? plan.target : 0, ok: S.quests.m.ok || 0, okAtOwed0, sessions: n, pad, kw: plan && plan.kw,
      plan: plan ? { rev: plan.reviews, pace: plan.pace, leave: plan.leave, vx: plan.vx, cxq: plan.cx ? plan.cx.q : 0 } : null,
      owedStart: owed0 && owed0.total, owedEnd: ow && ow.total, done: q ? (q.done ? ((u.src && u.src.x ? u.src.x[1] : 0) > 0 ? "with padding" : "by the work alone") : "open") : "-",
      src: u.src || null, met: u.met || 0, vx: u.vx || null, status: st.ok ? "ok" : "late " + st.eta, pace: pc ? pc.level + (pc.why.length ? ":" + pc.why.join("/") : "") : "",
      need: { words: pathPaceNeeded(), vx: vxPaceNeeded(pathScan()) }, ...sn });
    if (day % 30 === 29) { const j = JSON.parse(JSON.stringify(S)); if (!j.words || Object.keys(j.words).length !== Object.keys(S.words).length) fail(`${today}: state round trip`); }
  }
  const reportTail = typeof buildUsageReport === "function" ? buildUsageReport(0).split("\n").filter(l => /^Plan per day|^20\d\d-\d\d-\d\d · /.test(l)).slice(-4) : [];
  return { reportTail, start, deadline, firstAllMet, firstAllKnown, ledgerDone, itemsStarted, itemsKnown, atDeadline, days, fails, notes, NEW };
}, CFG);

const act = r.days.filter(d => !d.skipped);
const pct = (a, b) => b ? Math.round(a / b * 100) : 0;
const avg = f => act.length ? Math.round(act.reduce((a, d) => a + f(d), 0) / act.length * 10) / 10 : 0;
console.log(`code: ${r.NEW ? "new (pathOwed)" : "before"} · ${act.length} days studied, ${r.days.length - act.length} skipped · ${r.start} → ${r.days.length ? r.days[r.days.length - 1].d : ""} · finish date ${r.deadline}`);
console.log(`all words met ${r.firstAllMet || "—"} · all Known ${r.firstAllKnown || "—"} · verb ledger complete ${r.ledgerDone || "—"} · verb items all started ${r.itemsStarted || "—"} · all Known ${r.itemsKnown || "—"}`);
// Padding: right answers of extra practice (usage src "x") — the plan's
// margin; for other quests (xq): their own; the work: every other one.
const padOf = d => (d.src && d.src.x ? d.src.x[1] : 0), qOf = d => (d.src && d.src.xq ? d.src.xq[1] : 0), workOf = d => Math.max(0, d.ok - padOf(d) - qOf(d));
if (r.atDeadline) { console.log(`short of Known on ${r.atDeadline.d}: words ${r.atDeadline.words.length ? r.atDeadline.words.join(" | ") : "none"}`); console.log(`  verb items ${r.atDeadline.items.length ? r.atDeadline.items.join(" | ") : "none"}`); }
console.log(`avg/day: target ${avg(d => d.target)} · right answers ${avg(d => d.ok)} · of them the day's work ${avg(workOf)} · padding ${avg(padOf)} · for other quests ${avg(qOf)} · sessions ${avg(d => d.sessions)} + extra rounds ${avg(d => d.pad)}`);
const padd = act.map(padOf).sort((a, b) => a - b);
console.log(`padding per day (right answers on top of the work): median ${padd[Math.floor(padd.length / 2)] || 0} · p90 ${padd[Math.floor(padd.length * 0.9)] || 0} · max ${padd[padd.length - 1] || 0} · days with none ${pct(padd.filter(x => !x).length, padd.length)}%`);
const ratio = act.filter(d => d.target).map(d => workOf(d) / d.target).sort((a, b) => a - b);
const q = p => ratio.length ? ratio[Math.min(ratio.length - 1, Math.floor(p * ratio.length))].toFixed(2) : "—";
console.log(`the day's work ÷ the plan's count: p10 ${q(0.1)} · median ${q(0.5)} · p90 ${q(0.9)} · within ±10% ${pct(ratio.filter(x => x >= 0.9 && x <= 1.1).length, ratio.length)}% · count too high (<0.9) ${pct(ratio.filter(x => x < 0.9).length, ratio.length)}% · too low (>1.1) ${pct(ratio.filter(x => x > 1.1).length, ratio.length)}%`);
const ends = act.reduce((a, d) => (a[d.done] = (a[d.done] || 0) + 1, a), {});
console.log(`plan quest ended: ${JSON.stringify(ends)} · days left owing: ${act.filter(d => d.owedEnd > 0).length} · late status days: ${act.filter(d => d.status !== "ok").length} · pace amber days: ${act.filter(d => /^amber/.test(d.pace)).length}`);
for (let i = 0; i < r.days.length; i += 14) {
  const w = r.days.slice(i, i + 14).filter(d => !d.skipped);
  if (!w.length) continue;
  const l = w[w.length - 1], m = f => Math.round(w.reduce((a, d) => a + f(d), 0) / w.length);
  console.log(`${w[0].d}  target ${m(d => d.target)}  ok ${m(d => d.ok)}  @owed0 ${m(d => d.okAtOwed0 || d.ok)}  ses ${m(d => d.sessions)}+${m(d => d.pad)}  pace ${l.plan ? l.plan.pace : "-"}  vx ${l.plan && l.plan.vx ? `${l.plan.vx.due}d ${l.plan.vx.items}i ${l.plan.vx.cells}c` : "-"}  kw ${l.kw}  met ${l.met}  unmet ${l.unmet}  known ${l.known}/${l.total}  verbs ${l.verbs}  od ${l.od}  cellsLeft ${l.cellsLeft}  itemsLeft ${l.itemsLeft}  ${l.status} ${l.pace}`);
}
if (process.argv.includes("--report")) r.reportTail.forEach(l => console.log("report> " + l));
r.fails.forEach(f => console.log("✗", f));
if (errors.length) console.log("page errors:", errors.slice(0, 8));
if (OUT) fs.writeFileSync(OUT, JSON.stringify({ cfg: CFG, ...r, errors }));
console.log(`sim-journey: ${!r.fails.length && !errors.length ? "passed" : "FAILED"}`);
await browser.close();
process.exit(!r.fails.length && !errors.length ? 0 : 1);
