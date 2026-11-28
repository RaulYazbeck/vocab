// The course inside the real app, day after day (Chromium, a fake clock):
// the test profile's words and verbs, the whole course filled with
// synthetic packs (the pilot's sheet and drills under every section's own
// rules), and every Today session played card by card through the app's
// own handlers — word cards, verb sheets, the course's test-outs, sheets,
// drills, reviews, checkpoints and the writing card.
//
// Checked every day: the session count (x/N) never grows (it only drops
// when a passed test-out makes its sheet and drill unnecessary); no page
// error; the course's parts are all done by the end of the day; at most
// one new section (on track) and one text; the day's plan is reachable
// (with every answer right: the right answers reach the target). Every 10
// days and at the end: the state survives a JSON round trip and the cloud
// docs round trip (course, writing) unchanged; the learning log and the
// usage report agree with what was done (texts, words written, course
// answers); the word records the profile started with are all still there.
//
// --mix: the share of wrong word answers typed as another word I know (a
// mix-up, path.js MIX-UPS) — checked every day: pairs on both words, 3 at
// most a word, only between met words; partners come in sessions and
// repair rounds; pairs get sorted; the usage log counts them as made.
// Also every day: the writing plan (never two days running, 3 a week at
// most), a verb card asked in a sentence grades its own form right, and
// each session's bonus rounds follow pathBonusSlots (sessions with them).
//   node sim-app.mjs [--days 45] [--acc 0.85] [--seed 3] [--skip 0.2] [--mix 0.4]
//   (serve the repo root on :8765; npm install once in tools/audio/tests)
import { openApp } from "../verb-track/browser.mjs";
const arg = (k, d) => { const i = process.argv.indexOf("--" + k); return i > 0 ? +process.argv[i + 1] : d; };
const DAYS = arg("days", 45), ACC = arg("acc", 0.85), SEED = arg("seed", 3), SKIP = arg("skip", 0), MIX = arg("mix", 0);

const { browser, page, errors } = await openApp({ course: true, width: 390, height: 844 });
page.setDefaultTimeout(0);
const r = await page.evaluate(async ([DAYS, ACC, SEED, SKIP, MIX]) => {
  // ── the fake clock, quiet effects, a seeded dice ──
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

  // ── the whole course: synthetic packs shaped like the pilot ──
  const ps = CX.sheets["cx.neg1"], pilot = CX.byId["s0.neg"];
  CX.sections.forEach(sec => {
    if (sec.built || sec.verb) return;
    const k = sec.id.replace(/\W/g, "");
    if (sec.kind === "recap") { cxPack({ id: "sim-" + k, sections: { [sec.id]: { checkpoint: { n: 20, pass: 0.8 } } } }); return; }
    const n = sec.n || 1, rid = Array.from({ length: 4 * n }, (_, i) => "sim." + k + "-r" + (i + 1));
    const sheets = Array.from({ length: n }, (_, j) => ({ id: "cx.sim." + k + j, title: sec.title + (n > 1 ? " " + (j + 1) : ""), qn: 3,
      struct: ps.struct, why: ps.why, rules: ps.rules, ex: ps.ex, trap: ps.trap, quiz: ps.quiz.map(q => ({ ...q })), rid: rid.slice(4 * j, 4 * j + 4) }));
    // (the pilot's sentences, not its detectors: those would blame its real
    // rule — kein — for every miss on these placeholder rules)
    const sets = pilot.sets.map(id => CX.sets[id]).filter(s => !s.gen).map((s, i) => ({ ...s, id: "d.sim." + k + "." + i, ex: undefined,
      items: s.items.map((it, j) => ({ ...it, r: [rid[(i * 3 + j) % rid.length]] })) }));
    cxPack({ id: "sim-" + k, sections: { [sec.id]: { rules: Object.fromEntries(rid.map(x => [x, x])), sheets, drills: sets } } });
  });

  const fails = [], log = [];
  // the day's course cards as they're asked (named when the plan isn't met)
  let trace = [];
  const _list = cxPartList, _done = cxPartDone;
  window.cxPartList = p => { const l = _list(p); if (p.part === "warm" || p.part === "review") trace.push(`${p.part} ${(p.rules || []).length}${p.cut ? " cut" : ""} → ${l.length}`); return l; };
  window.cxPartDone = p => { trace.push(`✓${p.part}${p.cut ? " cut" : ""}`); return _done(p); };
  const fail = m => { if (fails.length < 40) fails.push(m); };
  const wordKeys0 = Object.keys(S.words).filter(k => !/^cx_/.test(k));
  const stats = { answers: 0, cxAnswers: 0, sessions: 0, sheets: 0, cxSheets: 0, texts: 0, words: 0, metDays: 0, perfectDays: 0, perfectMet: 0, newSecs: 0, shrunk: 0, skipped: 0, wordShort: 0 };

  // ── playing a card ──
  let perfect = false; // a day with every answer right (words, sheets, the course)
  const right = () => perfect || rnd() < ACC;
  const playSheet = () => {
    const g = _gs; let k = 0;
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
    if (cur.first) stats.cxAnswers++; // (a miss comes back once at the end: logged once)
    if (k === "pick" || k === "respond") { const opts = item.o || set.o, want = ok ? item.a[0] : opts.find(o => o !== item.a[0]); return cxPick(opts.indexOf(want)); }
    if (k === "write" || k === "open") { document.getElementById("cx-text").value = "Ich habe keinen Fernseher und kein Auto."; stats.texts++; stats.words += 7; return cxCheckCur(); }
    if (k === "order") { cur.picked = cur.bank.map((b, bi) => [b.i, bi]).sort((x, y) => x[0] - y[0]).map(x => x[1]); if (!ok) cur.picked.reverse(); return cxCheckCur(); }
    if (cur.mode === "tiles" || cur.mode === "place") cxTypeInstead(); // (built or placed: these runs type)
    const inp = document.getElementById("cx-input");
    inp.value = ok ? item.a[0] : "Das ist ganz falsch";
    cxCheckCur(); if (!r.answered) cxCheckCur();
  };
  const playRunner = () => {
    let k = 0;
    while (_cx && !_cx.done && k++ < 80) { cxAnswer(right()); cxNext(); }
    if (_cx && _cx.done) cxFinish();
  };
  const playWrite = () => {
    const min = cxJournalMin(_cj.p), words = Array.from({ length: min + 3 }, (_, i) => ["Ich", "wohne", "seit", "zwei", "Jahren", "in", "Zürich", "und", "lerne", "Deutsch."][i % 10]).join(" ");
    document.getElementById("cx-jtext").value = words; cxJournalCount();
    if (document.getElementById("cx-jsave").disabled) fail(`${studyToday()}: Save stays off with ${min + 3} words`);
    cxJournalSubmit(); stats.texts++; stats.words += cxWordCount(words);
    cxJournalDone();
  };
  // another word I know, for a mix-up (not the one asked)
  const metWords = () => Object.keys(S.words).filter(k => { const ws = S.words[k]; return ws && ws.st && !ws.rt && !/^(vx|cx)_/.test(k); });
  const mixStats = { typed: 0, sentence: 0, sentenceOk: 0, partners: 0, bonusChecked: 0, bonusSeen: 0 };
  // (the raw event log is capped: mix events counted as they're logged)
  const mixEv = { new: 0, again: 0, sorted: 0 }, _log = logEvent;
  window.logEvent = (type, data) => { if (type === "mix" && data && data.ev in mixEv) mixEv[data.ev]++; return _log(type, data); };
  const playWord = (it, ok) => {
    if (it.mix) mixStats.partners++;
    if (it.w && it.w.vx && it.w.vx.sent) { mixStats.sentence++; if (vxGrade(it.w.vx.form.ans, it.w.vx) === true) mixStats.sentenceOk++; else fail(`${studyToday()}: a verb card in a sentence doesn't take its own form: ${it.w.vx.form.ans} · ${it.w.vx.sent.q}`); }
    if (!ok && MIX && !(it.w && it.w.vx) && ["typed", "cloze", "spot"].includes(it.t) && rnd() < MIX) {
      const ks = metWords(), k = ks[Math.floor(rnd() * ks.length)], o = k && mixKeyWord(k);
      if (o && wordKey(o) !== wordKey(it.w)) { mixStats.typed++; pathGradeTyped(o[WORD_KEY], false); stats.answers++; pathNext(); return; }
    }
    if (it.w && it.w.vx) { document.getElementById("p-input").value = ok ? it.w.vx.form.ans : "zzz qqq"; pathCheckTyped(); }
    else if (it.t === "choice" || it.t === "listen") { const i = it.opts.findIndex(o => o.correct); pathAnswerChoice(ok ? i : (i + 1) % it.opts.length); }
    else { const ans = it.t === "cloze" ? it.cloze.answer : it.t === "reverse" ? gamePrompt(it.w) : it.w[WORD_KEY]; pathGradeTyped(ok ? ans : "zzz qqq", ok); }
    stats.answers++;
    pathNext();
  };
  const isQ = it => it && !["learn", "bonus", "sheet", "repairOffer", "cx"].includes(it.t);
  const playSession = (allRight) => {
    startPathSession("regular", MIX ? {} : { noBonus: true });
    const s = pathSession;
    if (!s) return false;
    if (MIX) {
      const qOf = x => x.t === "cx" ? x.qn || 1 : x.t !== "learn" && x.t !== "bonus" && x.t !== "sheet" && !x.warm ? 1 : 0;
      const q = s.items.reduce((n, x) => n + qOf(x), 0), b = s.items.filter(x => x.t === "bonus").length;
      if (!s.focus && b !== pathBonusSlots(q).length) fail(`${studyToday()}: ${b} bonus rounds in a session of ${q} questions (want ${pathBonusSlots(q).length})`);
      mixStats.bonusChecked++;
    }
    stats.sessions++;
    let total = null, guard = 0, prev = "";
    while (pathSession === s && s.cur && guard++ < 900) {
      const it = s.cur;
      const desc = it.t + (it.part ? ":" + it.part + (it.qn !== undefined ? "(qn " + it.qn + ")" : "") : "");
      const mm = ((document.getElementById("p-count") || {}).textContent || "").match(/(\d+)\/(\d+)/);
      if (mm && !s.repairPhase) { if (total === null) total = +mm[2]; else if (+mm[2] > total || +mm[2] < total && !/^cx:testout/.test(prev)) { fail(`${studyToday()}: the count changed ${total} → ${mm[2]} at ${desc}, after ${prev} (item ${s.i}/${s.items.length})`); total = +mm[2]; }
        else if (+mm[2] < total) { stats.shrunk++; total = +mm[2]; } }
      prev = desc;
      if (it.t === "repairOffer") { pathRepair(true); continue; }
      if (it.t === "bonus") { if (it.minion) pathMinion(false); else { mixStats.bonusSeen++; pathBonus(false); } continue; }
      if (it.t === "learn") { pathNext(); continue; }
      if (it.t === "sheet" || it.t === "cx" && it.part === "sheet") {
        if (!_gs || _gs.mode !== "path") { fail(`${studyToday()}: a sheet card without its viewer`); pathNext(); continue; }
        if (it.t === "sheet") stats.sheets++; else stats.cxSheets++;
        playSheet(); continue;
      }
      if (it.t === "cx") {
        if (it.part === "write") { if (!_cj) { fail(`${studyToday()}: the writing card didn't open`); pathNext(); continue; } playWrite(); continue; }
        if (!_cx) { pathNext(); continue; } // a part that had nothing left skips itself
        playRunner(); continue;
      }
      playWord(it, allRight || right());
    }
    if (pathSession) { fail(`${studyToday()}: a session didn't end (${s.cur && s.cur.t})`); endPathSession(true); }
    return true;
  };
  const roundTrips = tag => {
    const j = JSON.parse(JSON.stringify(S));
    if (JSON.stringify(j.course) !== JSON.stringify(S.course) || JSON.stringify(j.writing) !== JSON.stringify(S.writing)) fail(`${tag}: the state doesn't survive a JSON round trip`);
    const docs = buildSyncDocs(S), snap = Object.entries(docs).map(([k, v]) => ({ id: k, data: () => JSON.parse(JSON.stringify(v)) }));
    const back = syncCloudState({ forEach: f => snap.forEach(f) }).state;
    if (JSON.stringify(back.writing || {}) !== JSON.stringify(S.writing || {})) fail(`${tag}: writing doesn't come back the same from the cloud docs`);
    if (JSON.stringify(back.course) !== JSON.stringify(S.course)) fail(`${tag}: the course doesn't come back the same from the cloud docs`);
    const lost = wordKeys0.filter(k => !S.words[k]);
    if (lost.length) fail(`${tag}: ${lost.length} word records gone`);
  };

  // ── the days ──
  const days = [];
  for (let day = 0; day < DAYS; day++) {
    if (day > 0) { off += 864e5; to8pm(); }
    const today = studyToday();
    if (SKIP && day > 0 && rnd() < SKIP) { stats.skipped++; continue; }
    pathRollDay(); pathMarkActive(); trace = [];
    const plan = pathEnsurePlan(pathScan(true));
    const target = plan ? plan.target : 0;
    const P = cxPlanner(), parts0 = cxTodayParts();
    const sizes0 = parts0.map(p => p.part + (p.sec ? ":" + p.sec.slice(3) : "") + "=" + cxPartSize(p)).join(" ");
    const freshSecs = new Set(parts0.filter(p => ["testout", "sheet", "checkpoint"].includes(p.part) && !cxSecState(p.sec)).map(p => p.sec));
    if (freshSecs.size > (P.status === "red" ? 2 : 1)) fail(`${today}: ${freshSecs.size} new sections (${P.status})`);
    stats.newSecs += freshSecs.size;
    const texts0 = cxJournalList().filter(e => !/^drill:/.test(e.p)).length, cx0 = stats.cxAnswers;
    // Every 4th day everything right: the plan must be met by Today alone.
    const allRight = day % 4 === 3;
    perfect = allRight;
    let n = 0;
    while (n++ < 8) {
      if (!playSession(allRight)) break;
      if ((S.quests.m.ok || 0) >= target && !cxTodayParts().length) break;
    }
    const left = cxTodayParts();
    if (left.length) fail(`${today}: course parts left at the end of the day: ${left.map(p => p.part).join(", ")}`);
    const texts = cxJournalList().filter(e => !/^drill:/.test(e.p)).length - texts0;
    if (texts > 1) fail(`${today}: ${texts} writing prompts in one day`);
    // the writing plan: never two days running, 3 a week at most
    const wd = cxWriteDays();
    if (wd.some((d, i) => i && daysBetween(wd[i - 1], d) < 2)) fail(`${today}: two writing days in a row (${wd.slice(-4).join(", ")})`);
    if (cxWriteWeek(today, wd) > 3) fail(`${today}: ${cxWriteWeek(today, wd)} texts this week`);
    // mix-ups: both sides, 3 at most a word, only between met words
    Object.entries(S.words).forEach(([k, ws]) => {
      if (!ws || !ws.mix) return;
      const ks = Object.keys(ws.mix);
      if (ks.length > 3) fail(`${today}: ${k} has ${ks.length} mix-up pairs`);
      ks.forEach(o => { const ow = S.words[o]; if (!ow || !ow.st || !ow.mix || !ow.mix[k]) fail(`${today}: mix-up ${k} → ${o} on one side only`); });
    });
    const met = (S.quests.m.ok || 0) >= target;
    if (met) stats.metDays++;
    if (allRight) {
      stats.perfectDays++;
      // The course's share of the plan, and what it credited (its parts all done)
      const cxPlan = plan && plan.cx ? cxPlanTarget(plan.cx) : 0, cxGot = Object.values(S.course.dq || {}).reduce((a, b) => a + b, 0);
      const more = buildPathQueue("regular").items.filter(isQ).length;
      if (met) stats.perfectMet++;
      else if (cxGot < cxPlan) fail(`${today}: every answer right, the plan not met (${S.quests.m.ok}/${target}) — the course credited ${cxGot} of its ${cxPlan} (the morning's parts: ${(plan.cx.parts || []).join(" ")}) — planned ${sizes0}${plan.cx.cut ? " (cut " + JSON.stringify(plan.cx.cut) + ")" : ""}; credited ${JSON.stringify(S.course.dq)} · ${trace.join(" · ")}`);
      else { stats.wordShort++; log.push(`${today}: every answer right, ${S.quests.m.ok}/${target} — the course gave its ${cxGot}/${cxPlan}; the words side short after ${n - 1} sessions (${more} more cards in Today)`); }
    }
    days.push({ d: today, target, ok: S.quests.m.ok || 0, sessions: n, parts: parts0.map(p => p.part[0] + (p.sec ? ":" + p.sec.slice(3) : "")).join(" "), cx: stats.cxAnswers - cx0, text: texts, gap: cxGap(), status: P.status });
    if (day % 10 === 9) roundTrips(today);
  }
  roundTrips("the end");

  // ── the logs agree ──
  const L = buildLearningReport(), U = buildUsageReport();
  const open = cxJournalList().filter(e => !e.c);
  if (!/## MY WRITING/.test(L) || open.some(e => !L.includes(e.t))) fail("the learning log misses a text to correct");
  const wr = [...U.matchAll(/✍️(\d+) \((\d+)w\)/g)].reduce((a, m) => [a[0] + +m[1], a[1] + +m[2]], [0, 0]);
  if (wr[0] !== stats.texts || wr[1] !== stats.words) fail(`usage report: ✍️ ${wr[0]} texts / ${wr[1]} words, written ${stats.texts} / ${stats.words}`);
  const cxAll = [...U.matchAll(/✎(\d+)\/(\d+)/g)].reduce((a, m) => a + +m[2], 0);
  if (cxAll < stats.cxAnswers) fail(`usage report: ${cxAll} course answers, given ${stats.cxAnswers}`);
  const rules = Object.keys(S.words).filter(k => /^cx_/.test(k)).length, started = Object.keys(CX.rules).filter(r => (cxRuleWS(r) || {}).st).length;
  if (rules !== started) fail(`${rules} rule items, ${started} rules started`);
  const done = CX.sections.filter(s => s.built && (s.sheets.length || s.checkpoint) && cxSecDone(s.id)).length;
  log.push(`sections done: ${done} · rules started ${started} · texts ${stats.texts} · gap now ${cxGap()} days · planner ${cxPlanner().status}`);
  if (MIX) {
    const made = mixEv.new, sorted = mixEv.sorted;
    const open = Object.values(S.words).reduce((n, ws) => n + (ws && ws.mix ? Object.keys(ws.mix).length : 0), 0) / 2;
    const days2 = usageAllDays(), mp = days2.reduce((a, [, v]) => a.map((x, i) => x + ((v.mixp || [])[i] || 0)), [0, 0, 0]);
    if (mp[0] !== made || mp[2] !== sorted) fail(`usage log: mix-ups ${mp[0]} new / ${mp[2]} sorted, events ${made} / ${sorted}`);
    if (!(U.includes(`open now ${Math.round(open)}`))) fail(`usage report: open pairs not ${Math.round(open)}`);
    if (mixStats.typed && !made) fail("mix-ups typed but no pair made");
    // the usage log agrees: verb cards in a sentence, bonus rounds offered; the learning log lists open pairs
    const vs = days2.reduce((a, [, v]) => a + ((v.vsent || [])[0] || 0), 0), bo = days2.reduce((a, [, v]) => a + (v.bonus ? v.bonus[0] + v.bonus[1] : 0), 0);
    if (vs !== mixStats.sentence) fail(`usage log: ${vs} verb answers in a sentence, asked ${mixStats.sentence}`);
    if (!U.includes(`Verb exercises asked in an old card's sentence: ${vs} `)) fail("usage report: the sentence line doesn't say " + vs);
    if (bo !== mixStats.bonusSeen) fail(`usage log: ${bo} bonus rounds offered, seen ${mixStats.bonusSeen}`);
    if (open && !/Being practised as pairs in Today now: /.test(L)) fail("the learning log doesn't list the open pairs");
    if (DAYS >= 20 && made && !sorted) fail("no mix-up pair sorted in " + DAYS + " days");
    if (made && !mixStats.partners) fail("no partner ever asked");
    log.push(`mix-ups: typed ${mixStats.typed} · pairs made ${made} · again ${mixEv.again} · sorted ${sorted} · open ${open} · partners asked ${mixStats.partners} · verb cards in a sentence ${mixStats.sentence} (${mixStats.sentenceOk} take their form) · sessions' bonus checked ${mixStats.bonusChecked}`);
  }
  return { fails, log, stats, days };
}, [DAYS, ACC, SEED, SKIP, MIX]);

console.table(process.argv.includes("--all") ? r.days : r.days.filter((_, i) => i % 3 === 0 || i === r.days.length - 1));
r.log.forEach(l => console.log(l));
console.log(JSON.stringify(r.stats));
r.fails.forEach(f => console.log("✗", f));
if (errors.length) console.log("page errors:", errors.slice(0, 5));
const ok = !r.fails.length && !errors.length;
console.log(`sim-app: ${ok ? "passed" : "FAILED"}`);
await browser.close();
process.exit(ok ? 0 : 1);
