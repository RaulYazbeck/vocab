// Stage 1 in the real app, day after day (Chromium, a fake clock) — the
// lessons as built, nothing synthetic: where a learner who has done Stage 0
// (and the A1 verb lesson) goes next, and how each A2 lesson runs in Today.
//   node t-stage1.mjs [--days 70 --acc 0.9 --seed 5 --partial]
// (--partial: a slow learner — the invariants only, not that Session 3's
// lessons are all done by the end)
// (serve the repo root on :8765 first, as for t-course.mjs)
//
// Checked every day: no test-out after Stage 0 · a lesson's sheets on study
// days in a row, no other lesson's sheet in between · each day's drill keeps
// to the sheets passed so far · the count never grows · the course is done
// by the end of the day. At the end: the lessons came in course order, all
// done, their rules in review, and in the mixed days; the state survives a
// round trip; no page error.
import { openApp } from "../verb-track/browser.mjs";
const arg = (k, d) => { const i = process.argv.indexOf("--" + k); return i > 0 ? +process.argv[i + 1] : d; };
const DAYS = arg("days", 70), ACC = arg("acc", 0.9), SEED = arg("seed", 5), PARTIAL = process.argv.includes("--partial");

const { browser, page, errors } = await openApp({ course: true, width: 390, height: 844 });
page.setDefaultTimeout(0);
const r = await page.evaluate(async ([DAYS, ACC, SEED, PARTIAL]) => {
  const real = Date.now.bind(Date), RD = Date; let off = 0;
  Date.now = () => real() + off;
  window.Date = class extends RD { constructor(...a) { if (a.length) super(...a); else super(RD.now() + off); } static now() { return real() + off; } };
  window.saveState = () => {}; window.saveToCloud = () => {}; window.saveLocalOnly = () => {};
  window.showCelebrateToast = () => {}; window.confettiBurst = () => {}; window.playSuccess = () => {}; window.playFailure = () => {}; window.haptic = () => {}; window.speak = () => {};
  window.mistakeHeld = () => false;
  let seed = SEED; const rnd = () => { seed = (seed * 1103515245 + 12345) & 0x7fffffff; return seed / 0x7fffffff; };
  Math.random = rnd;
  const to8pm = () => { const d = new RD(Date.now()); d.setHours(20, 0, 0, 0); off += d.getTime() - Date.now(); };
  to8pm();
  const fails = [], log = [];
  const fail = m => { if (fails.length < 40) fails.push(m); };

  // ── where I stand: Stage 0 done (lessons and checkpoint), the A1 verb lesson passed ──
  const VERBS0 = ["pr1", "pr2", "pr3", "pr4", "pr5", "pr7", "im1", "im2", "im3", "pf1", "pt11", "pt12", "pt13"];
  const long = addDays(studyToday(), -20);
  CX.sections.filter(s => s.stage === 0 && !s.verb).forEach(s => { S.course.sec[s.id] = { st: 3, at: long }; });
  S.course.last = long;
  VERBS0.forEach(v => { S.verb.sh[v] = 100; });
  const S1 = CX.sections.filter(s => s.stage === 1 && (s.built && s.sheets.length || s.verb && s.verb.every(v => typeof vxSheet === "function" && vxSheet(v))));
  const wordKeys0 = Object.keys(S.words).filter(k => !/^cx_/.test(k));

  // ── what the learner meets ──
  const sheetSeq = [];       // [day, section, sheet] for every sheet played
  const lessonOf = id => { const c = cxSheet(id); if (c) return c.sec; const v = CX.sections.find(s => s.verb && s.verb.includes(id)); return v ? v.id : null; };
  let drills = 0, reviewS1 = 0, mixS1 = 0;
  const watchRunner = () => {
    const o = _cx && _cx.opts; if (!o) return;
    if (o.kind === "testout") { const s = cxSection(o.sec); if (s && s.stage > 0) fail(`${studyToday()}: a test-out for ${o.sec} (Stage ${s.stage})`); }
    if (o.kind === "drill" && o.sec) {
      drills++;
      // the sheets read so far: those passed, and today's (passed or missed)
      const sec = cxSection(o.sec), k = sec.sheets.findIndex(id => !cxSheetPassed(id)), dd = S.course.dd || {};
      const read = sec.sheets.slice(0, k < 0 ? sec.sheets.length : (dd["try:" + o.sec] && !dd["sheet:" + o.sec]) || k === 0 ? k + 1 : k);
      const allow = new Set(read.flatMap(id => cxSheet(id).rid));
      _cx.list.forEach(e => (e.item.r || []).forEach(rr => { const R = cxRule(rr); if (R && R.sec === o.sec && !allow.has(rr)) fail(`${studyToday()}: ${o.sec}'s drill asks ${rr}, from a sheet not read yet (${e.set})`); }));
    }
    const s1 = e => { const st = cxSet(e.set); return st && st.sec && st.sec.startsWith("s1."); };
    if (o.kind === "review" || o.kind === "warm") reviewS1 += _cx.list.filter(s1).length;
    if (o.kind === "contrast") mixS1 += _cx.list.filter(s1).length;
  };

  // ── playing a card (as sim-app.mjs) ──
  const right = () => rnd() < ACC;
  const playSheet = () => {
    const g = _gs; let k = 0;
    sheetSeq.push([studyToday(), lessonOf(g.sh.id), g.sh.id]);
    while (g.step < g.steps.length && k++ < 40) gsGo(1);
    k = 0;
    while (g.quiz && !g.quiz.done && k++ < 40) {
      const cur = g.quiz.list[g.quiz.i], Q = cur.q, ok = right();
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
    if (k === "write" || k === "open") { document.getElementById("cx-text").value = "Ich habe heute keine Zeit, aber morgen komme ich."; return cxCheckCur(); }
    if (k === "order") { cur.picked = cur.bank.map((b, bi) => [b.i, bi]).sort((x, y) => x[0] - y[0]).map(x => x[1]); if (!ok) cur.picked.reverse(); return cxCheckCur(); }
    if (cur.mode === "tiles") cxTypeInstead();
    const inp = document.getElementById("cx-input");
    inp.value = ok ? item.a[0] : "Das ist ganz falsch";
    cxCheckCur(); if (!r.answered) cxCheckCur();
  };
  const playRunner = () => {
    watchRunner();
    let k = 0;
    while (_cx && !_cx.done && k++ < 80) { cxAnswer(right()); cxNext(); }
    if (_cx && _cx.done) cxFinish();
  };
  const playWrite = () => {
    const min = cxJournalMin(_cj.p), words = Array.from({ length: min + 3 }, (_, i) => ["Ich", "wohne", "seit", "zwei", "Jahren", "in", "Zürich", "und", "lerne", "Deutsch."][i % 10]).join(" ");
    document.getElementById("cx-jtext").value = words; cxJournalCount(); cxJournalSubmit(); cxJournalDone();
  };
  const playWord = (it, ok) => {
    if (it.w && it.w.vx) { document.getElementById("p-input").value = ok ? it.w.vx.form.ans : "zzz qqq"; pathCheckTyped(); }
    else if (it.t === "choice" || it.t === "listen") { const i = it.opts.findIndex(o => o.correct); pathAnswerChoice(ok ? i : (i + 1) % it.opts.length); }
    else { const ans = it.t === "cloze" ? it.cloze.answer : it.t === "reverse" ? gamePrompt(it.w) : it.w[WORD_KEY]; pathGradeTyped(ok ? ans : "zzz qqq", ok); }
    pathNext();
  };
  const playSession = () => {
    startPathSession("regular", { noBonus: true });
    const s = pathSession;
    if (!s) return false;
    let total = null, guard = 0;
    while (pathSession === s && s.cur && guard++ < 900) {
      const it = s.cur;
      const mm = ((document.getElementById("p-count") || {}).textContent || "").match(/(\d+)\/(\d+)/);
      if (mm && !s.repairPhase) { if (total === null) total = +mm[2]; else if (+mm[2] > total) { fail(`${studyToday()}: the count grew ${total} → ${mm[2]}`); total = +mm[2]; } else total = +mm[2]; }
      if (it.t === "repairOffer") { pathRepair(true); continue; }
      if (it.t === "bonus") { if (it.minion) pathMinion(false); else pathBonus(false); continue; }
      if (it.t === "learn") { pathNext(); continue; }
      if (it.t === "sheet" || it.t === "cx" && it.part === "sheet") {
        if (!_gs || _gs.mode !== "path") { fail(`${studyToday()}: a sheet card without its viewer`); pathNext(); continue; }
        playSheet(); continue;
      }
      if (it.t === "cx") {
        if (it.part === "write") { if (!_cj) { fail(`${studyToday()}: the writing card didn't open`); pathNext(); continue; } playWrite(); continue; }
        if (!_cx) { pathNext(); continue; }
        playRunner(); continue;
      }
      playWord(it, right());
    }
    if (pathSession) { fail(`${studyToday()}: a session didn't end (${s.cur && s.cur.t})`); endPathSession(true); }
    return true;
  };

  // ── the days ──
  const days = [];
  for (let day = 0; day < DAYS; day++) {
    if (day > 0) { off += 864e5; to8pm(); }
    pathRollDay(); pathMarkActive();
    const plan = pathEnsurePlan(pathScan(true)), target = plan ? plan.target : 0;
    const parts0 = cxTodayParts();
    parts0.filter(p => p.part === "testout").forEach(p => { const s = cxSection(p.sec); if (s.stage > 0) fail(`${studyToday()}: a test-out planned for ${p.sec}`); });
    let n = 0;
    while (n++ < 8) { if (!playSession()) break; if ((S.quests.m.ok || 0) >= target && !cxTodayParts().length) break; }
    const left = cxTodayParts();
    if (left.length) fail(`${studyToday()}: course parts left at the end of the day: ${left.map(p => p.part).join(", ")}`);
    const L = cxCurrentLesson();
    days.push({ d: studyToday(), parts: parts0.map(p => p.part[0] + (p.sec ? ":" + p.sec.slice(3) : "")).join(" "), sheets: sheetSeq.filter(x => x[0] === studyToday()).map(x => x[2]).join(" "), lesson: L ? L.id : "—", gap: cxGap() });
    if (S1.every(s => cxSecDone(s.id)) && !days.done) days.done = studyToday();
  }

  // ── the order, the sheets in a row ──
  const firstDay = {};
  sheetSeq.forEach(([d, sec]) => { if (sec && sec.startsWith("s1.") && !firstDay[sec]) firstDay[sec] = d; });
  const order = Object.entries(firstDay).sort((a, b) => a[1] < b[1] ? -1 : a[1] > b[1] ? 1 : CX.sections.indexOf(cxSection(a[0])) - CX.sections.indexOf(cxSection(b[0]))).map(x => x[0]);
  // the lessons met so far, in the course's order (verb lessons with their sheets among them)
  const want = S1.map(s => s.id).slice(0, order.length);
  if (JSON.stringify(order) !== JSON.stringify(want)) fail(`the lessons came in this order: ${order.join(" ")} — the course's: ${want.join(" ")}`);
  // Session 3's lessons — and the verb lessons that come before the last of them — all done by the end
  const lastS3 = Math.max(...S1.map((s, i) => s.ses === 3 ? i : -1)), required = S1.slice(0, lastS3 + 1);
  // a lesson's sheets are not interrupted by another lesson's
  const sec1 = sheetSeq.filter(x => x[1] && x[1].startsWith("s1."));
  for (let i = 1; i < sec1.length; i++) if (sec1[i][1] !== sec1[i - 1][1] && sec1.slice(i).some(x => x[1] === sec1[i - 1][1])) fail(`${sec1[i][0]}: ${sec1[i][1]} began while ${sec1[i - 1][1]} wasn't finished`);
  // on study days in a row: no day of a lesson under way without its next sheet
  S1.forEach(s => {
    const ds = [...new Set(sec1.filter(x => x[1] === s.id).map(x => x[0]))];
    for (let i = 1; i < ds.length; i++) if (daysBetween(ds[i - 1], ds[i]) > 1) fail(`${s.id}: its sheets on ${ds[i - 1]} and ${ds[i]} — a day between`);
  });
  const notDone = required.filter(s => !cxSecDone(s.id)).map(s => s.id);
  if (notDone.length && !PARTIAL) fail(`not done after ${DAYS} days: ${notDone.join(" ")}`);
  // every rule of a lesson met is in review
  const rules1 = S1.filter(s => !s.verb && firstDay[s.id]).flatMap(s => s.rules), notIn = rules1.filter(rr => !(cxRuleWS(rr) || {}).st && cxSecDone(cxRule(rr).sec));
  if (notIn.length) fail(`rules never in review: ${notIn.join(" ")}`);
  if (!reviewS1) fail("no review or warm-up ever asked a Stage 1 item");
  if (!mixS1) fail("no mixed day ever brought a Stage 1 item");
  if (!drills) fail("no drill was played");
  // ── the state ──
  const j = JSON.parse(JSON.stringify(S));
  if (JSON.stringify(j.course) !== JSON.stringify(S.course)) fail("the course doesn't survive a JSON round trip");
  const docs = buildSyncDocs(S), snap = Object.entries(docs).map(([k, v]) => ({ id: k, data: () => JSON.parse(JSON.stringify(v)) }));
  const back = syncCloudState({ forEach: f => snap.forEach(f) }).state;
  if (JSON.stringify(back.course) !== JSON.stringify(S.course)) fail("the course doesn't come back the same from the cloud docs");
  const lost = wordKeys0.filter(k => !S.words[k]);
  if (lost.length) fail(`${lost.length} word records gone`);
  log.push(`the lessons, as met: ${order.map(id => id + " " + firstDay[id].slice(5)).join(" · ")}`);
  log.push(`Stage 1A done on ${days.done || "—"} · drills ${drills} · Stage 1 items in reviews ${reviewS1}, in mixed days ${mixS1} · rules in review ${rules1.length - notIn.length}/${rules1.length}`);
  return { fails, log, days };
}, [DAYS, ACC, SEED, PARTIAL]);

console.table(r.days.filter(d => d.sheets || d.parts.includes("c:")).slice(0, 60));
r.log.forEach(l => console.log(l));
r.fails.forEach(f => console.log("✗", f));
if (errors.length) console.log("page errors:", errors.slice(0, 5));
const ok = !r.fails.length && !errors.length;
console.log(`t-stage1: ${ok ? "passed" : "FAILED"}`);
await browser.close();
process.exit(ok ? 0 : 1);
