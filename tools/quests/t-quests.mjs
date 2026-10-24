// Quests that only Today can feed — reachable through the daily plus a
// little extra effort, never finished for you:
//   • nothing is ever auto-completed (Today empty, quest short → it stays open);
//   • targets are sized for the way you answer (accuracy), never above what
//     Today holds; a hinted right form still counts for the verb-forms quest
//     (not for first-try / ledger / repairs);
//   • a verb quest left short is topped up by verb forms in the spare room of
//     a session / extra practice (ledger forms first, then known items as
//     practice — no step up or down); ▶ on a quest with Today empty opens
//     that extra practice, not the "All caught up" dead end;
//   • the end of a session lists open focus / verb quests with a Go button;
//   • whole days played (seeds × accuracy × hints): after the daily and at
//     most two quick extra rounds every such quest is done — measured.
//   node t-quests.mjs        (SEEDS=n, EXTRA_ROUNDS=n, APP=fr; serve the repo
//                             root on :8765, `npm install` once in tools/audio/tests)
import { openApp } from "../verb-track/browser.mjs";
const APP = process.env.APP || "de";
const SEEDS = +(process.env.SEEDS || 3);
const NOPRACTICE = !!process.env.NOPRACTICE; // control run: without the verb practice the late-deficit days must fail
const MAX_EXTRA_ROUNDS = +(process.env.EXTRA_ROUNDS || 2);
const { browser, page, errors } = await openApp({ width: 390, height: 844, app: APP });
page.setDefaultTimeout(0);

// ── A. the rules ──
const A = await page.evaluate(() => {
  window.saveState = () => {}; window.saveToCloud = () => {}; window.showCelebrateToast = () => {}; window.confettiBurst = () => {};
  window.playAchievement = () => {}; window.speak = () => {};
  if (vxAvailable() && !vxOn()) vxSwitchOn();
  const out = [], ok = (c, m, x) => out.push([!!c, m + (x !== undefined ? " — " + x : "")]);
  const real = { sum: pathTodaySummary, vxc: vxTodayCounts, sh: vxSheetsToday, acc: window.recentAccuracy, owed: window.pathOwed };
  const today = (due, newLeft, vxDue = 0, vxFresh = 0, sheets = 0) => {
    window.pathTodaySummary = () => ({ due, fix: 0, newLeft, scan: {} });
    window.vxTodayCounts = () => ({ due: vxDue, fix: 0, fresh: vxFresh });
    window.vxSheetsToday = () => new Array(sheets).fill("x");
    // (what Today still owes: the ledger's forms and sheets too — path.js pathOwed)
    window.pathOwed = () => ({ words: due, fresh: newLeft, vxDue, vxNew: vxFresh, cells: 0, sheets, cx: 0, total: due + newLeft + vxDue + vxFresh + sheets });
  };
  const restore = () => { window.pathTodaySummary = real.sum; window.vxTodayCounts = real.vxc; window.vxSheetsToday = real.sh; window.recentAccuracy = real.acc; window.pathOwed = real.owed; };
  const METRIC = { b_vxforms: "vxOk", a_vxsure: "vxTenseSure", b_ledger: "vxCells", b_known: "known", b_up: "up", a_path: "path", c_games: "game", a_deck: "", a_cloze: "cloze", b_hard: "hard" };
  const setup = (tpls, progs, targets, mOk = 10) => {
    questEnsureToday();
    const c = questContext(), rng = seededRandom(1);
    S.quests.m = freshQuestCounters(); S.quests.m.ok = mOk;
    S.quests.list = tpls.map((id, i) => { const q = makeQuest(byId(id), c, rng, "ABCD"[i]); q.target = targets[i]; q.done = false; if (METRIC[id]) S.quests.m[METRIC[id]] = progs[i]; return q; });
    S.quests.weekend = null; S.quests.dayDone = false; S.quests.dbl = -1; S.quests._showDayComplete = false;
    S.quests.list.forEach(q => { q.prog = questProgOf(q); });
    return S.quests.list;
  };

  // 1. nothing is finished for you
  today(0, 0);
  let L = setup(["b_vxforms", "a_vxsure", "b_ledger", "b_known"], [20, 3, 2, 1], [23, 8, 6, 8]);
  questRecompute(); renderHome(); questEvent("session_end", { kind: "path", len: "quick", stats: { answered: 15, correct: 12 }, ms: 1e5 });
  ok(L.every(q => !q.done), "Today empty and quests short → none finished for you", L.map(q => `${q.prog}/${q.target}`).join(" "));
  ok(!S.quests.dayDone, "the day does not complete itself");
  ok(typeof questFitFinite === "undefined", "no auto-finish function left");

  // 2. hints: a hinted right form counts as a form, not as first-try / ledger / repair
  const m = freshQuestCounters(), x = vxVerbs()[0];
  const ex = { kind: VX_CORE[0], x, p: VX_PERSONS[0], form: vxForm(x, VX_CORE[0], VX_PERSONS[0]), tense: VX_CORE[0], cell: x.inf + "|" + VX_CORE[0] };
  const a = (o) => questOnAnswer(m, { mode: "path", ok: true, typed: true, w: vxWord(ex), it: "verb", ...o });
  a({ hint: true, fix: true });
  ok(m.vxOk === 1 && m.vxCells === 0 && m.vxFixed === 0 && m.vxTenseSure === 0, "hinted right form: counts for verb forms only", JSON.stringify([m.vxOk, m.vxCells, m.vxFixed, m.vxTenseSure]));
  a({}); a({ retried: true, fix: true });
  ok(m.vxOk === 3 && m.vxCells === 2 && m.vxFixed === 1 && m.vxTenseSure === 1, "plain / second-try forms count as before", JSON.stringify([m.vxOk, m.vxCells, m.vxFixed, m.vxTenseSure]));
  questOnAnswer(m, { mode: "path", ok: false, typed: true, w: vxWord(ex), it: "verb" });
  ok(m.vxOk === 3, "a wrong form never counts");

  // 3. sizing follows accuracy and never exceeds what Today holds
  const tv = byId("b_vxforms"), mk = (fix, due, items, cells) => ({ vx: { fix, due, items, cells } });
  [0.7, 0.85, 0.95, 0.99].forEach(acc => {
    window.recentAccuracy = () => acc;
    let bad = "";
    for (let f = 0; f < 5; f++) for (let d = 0; d < 6; d++) for (let i = 0; i < 6; i++) for (let c = 0; c < 6; c++) {
      const cx = mk(f * 2, d * 4, i * 2, c * 3), sup = f * 2 + d * 4 + i * 2 + c * 3;
      if (tv.ok(cx) && (tv.target(cx) > Math.max(6, sup) || tv.target(cx) > 30 || tv.target(cx) < 1)) bad = JSON.stringify(cx.vx);
    }
    ok(!bad, `verb-forms target within the day's supply at ${Math.round(acc * 100)}% accuracy`, bad);
  });
  window.recentAccuracy = () => 0.7; const lo = tv.target(mk(2, 10, 4, 6));
  window.recentAccuracy = () => 0.99; const hi = tv.target(mk(2, 10, 4, 6));
  ok(lo < hi && hi <= 22, "lower accuracy → smaller target", `${lo} < ${hi} (of 22)`);
  window.recentAccuracy = () => 0.9;
  const ctx0 = { scan: { due: 40, repair: 6, flagged: 4 }, st4due: 10, st5due: 10, vx: { cells: 8, fix: 0, due: 0, items: 0 }, G: 30 };
  ["b_known", "b_strong", "b_up", "b_heal", "b_flags", "b_ledger"].forEach(id => {
    const t = byId(id), tg = t.target(ctx0, {});
    const sup = { b_known: 10, b_strong: 10, b_up: 40, b_heal: 6, b_flags: 4, b_ledger: 8 }[id];
    ok(tg >= 1 && tg <= sup, `${id}: target ${tg} ≤ supply ${sup}`);
  });
  ok(byId("b_heal").title({ target: 1 }) === "Heal 1 🩹 word" && byId("b_flags").title({ target: 3 }) === "Clear 3 ⚠️ flags", "titles say how many, not 'every'");
  window.recentAccuracy = () => 0.97; const fixHi = byId("a_fix").ok({ G: 30 });
  window.recentAccuracy = () => 0.8; const fixLo = byId("a_fix").ok({ G: 30 });
  ok(!fixHi && fixLo, "a_fix not offered at 97% accuracy on a 30 day, offered at 80%");
  const tf = byId("a_fix").target({ G: 30 }); ok(tf >= 2 && tf <= 4, "a_fix sized to the mistakes you make", tf);
  restore();

  // 4. which quests extra practice can top up, and how much they still need
  ok(QT.filter(t => t.practice).map(t => t.id).sort().join() === "a_vxsure,b_ledger,b_vxforms", "practice quests: verb forms, first try, ledger");
  L = setup(["b_vxforms", "a_vxsure", "a_path", "c_games"], [20, 5, 3, 3], [23, 8, 30, 20]);
  ok(questPracticeNeed() === 3, "need = the most any verb quest still lacks", questPracticeNeed());
  L[0].done = true; ok(questPracticeNeed() === 3, "a done quest doesn't count (the other still needs 3)");
  L[1].done = true; ok(questPracticeNeed() === 0, "nothing needed when they are done");
  L = setup(["a_path", "c_games", "b_known", "d_run"], [0, 0, 0, 0], [30, 20, 8, 8]);
  ok(questPracticeNeed() === 0, "no verb quest open → 0");

  // 5. ▶ with Today empty opens extra practice, not the dead end
  let sp = null; const rs = window.startPathSession; window.startPathSession = (len, o) => { sp = [len, o]; };
  today(0, 0); runQuestAction("path"); ok(sp && sp[1].practice === true, "▶ with Today empty → extra practice", JSON.stringify(sp));
  today(4, 0); runQuestAction("path"); ok(sp && !sp[1].practice, "▶ with work left → a normal session");
  today(0, 0); runQuestAction("path:long"); ok(sp[0] === "long" && !sp[1].practice, "▶ on a Long-session quest → Long, as asked");
  window.startPathSession = rs; restore();

  // 6. verb practice items
  const P = vxPracticeItems(8);
  ok(P.length > 0 && P.length <= 8, "practice items: up to n", P.length);
  ok(P.every((e, i) => !i || e.x.inf !== P[i - 1].x.inf), "never the same verb twice in a row");
  ok(P.filter(e => !e.cell).every(e => e.practice === true), "reviews of known items are practice (no step)");
  ok(vxPracticeItems(0).length === 0, "none asked → none");
  const ws0 = P.find(e => e.item), snap = ws0 ? JSON.stringify(S.words[vxKey(ws0.item)]) : null;
  // 7. the session fill: verb forms come first when a verb quest is short
  // Today's own content stubbed out, so what's left in the queue is the fill
  const keep = { sp: window.vxSessionPlan, rc: window.pathReviewCandidates, nw: window.planNewWords };
  window.vxSessionPlan = () => ({ sheets: [], items: [], learns: [] });
  window.pathReviewCandidates = () => ({ fix: [], due: [] });
  window.planNewWords = () => [];
  const counted = qq => qq.items.filter(i => i.t !== "learn" && i.t !== "bonus" && i.t !== "sheet").length;
  L = setup(["b_vxforms", "a_path", "c_games", "d_run"], [10, 0, 0, 0], [23, 30, 20, 8]);
  today(0, 0);
  const q = buildPathQueue("quick", { practice: true });
  const tail = q.items.filter(i => i.w && i.w.vx);
  ok(tail.length > 0 && tail.length <= 13, "extra practice with a short verb quest contains verb forms (up to what it lacks)", tail.length);
  ok(counted(q) <= PATH.SESSION_LENGTHS.quick, "the session keeps its length", `${counted(q)} of ${PATH.SESSION_LENGTHS.quick}`);
  ok(q.items.every((it, i) => !i || !(it.w && it.w.vx && q.items[i - 1].w && q.items[i - 1].w.vx && it.w.vx.x.inf === q.items[i - 1].w.vx.x.inf)), "no verb twice in a row in the queue");
  ok(!ws0 || snap === JSON.stringify(S.words[vxKey(ws0.item)]), "building the queue changes no item");
  L = setup(["b_vxforms", "a_path", "c_games", "d_run"], [22, 0, 0, 0], [23, 30, 20, 8]);
  const q1 = buildPathQueue("quick", { practice: true });
  ok(q1.items.filter(i => i.w && i.w.vx).length <= 1, "a quest one form short asks for about one form", q1.items.filter(i => i.w && i.w.vx).length);
  L = setup(["a_path", "c_games", "b_known", "d_run"], [0, 0, 0, 0], [30, 20, 8, 8]);
  const q2 = buildPathQueue("quick", { practice: true });
  ok(q2.items.filter(i => i.w && i.w.vx).length === 0, "no verb quest open → no extra verb forms");
  Object.assign(window, { vxSessionPlan: keep.sp, pathReviewCandidates: keep.rc, planNewWords: keep.nw });
  restore();

  // 8. the end-of-session list
  L = setup(["a_deck", "b_known", "b_vxforms", "b_hard"], [0, 0, 0, 0], [8, 3, 23, 5]);
  const open = questFocusOpen().map(([q]) => q.tpl);
  ok(open.join() === "a_deck,b_vxforms,b_hard", "focus + verb quests listed, other Today quests not", open.join());
  ok((questFocusCtaHtml().match(/questGo\(/g) || []).length === 2, "at most two Go buttons");
  L = setup(["b_explore", "b_known", "a_path", "c_games"], [0, 0, 0, 0], [3, 3, 10, 20]);
  ok(questFocusCtaHtml() === "", "Explorer / Today / game quests are not listed");
  L = setup(["d_mystery", "b_known", "a_path", "c_games"], [0, 0, 0, 0], [1, 3, 10, 20]);
  ok(questFocusCtaHtml() === "", "a mystery quest is not listed");
  // 9. every changed template builds, titles, measures
  restore();
  const ctx = questContext();
  QT.filter(t => ["a_fix", "b_vxforms", "a_vxsure", "b_ledger", "b_up", "b_known", "b_strong", "b_heal", "b_flags"].includes(t.id)).forEach(t => {
    let qq, ti = "", pr = -1;
    try { qq = makeQuest(t, ctx, seededRandom(5), t.slot); ti = t.title(qq); pr = questProgOf(qq); } catch (e) { ti = "ERR " + e.message; }
    ok(!/ERR|undefined|NaN/.test(ti) && pr >= 0 && qq.target >= 1, `${t.id}: "${ti}"`);
  });
  return out;
});
let fails = 0;
for (const [pass, msg] of A) { if (!pass) fails++; console.log((pass ? "✓ " : "✗ ") + msg); }
console.log(`rules: ${A.length - fails} passed, ${fails} failed`);

// ── B. whole days: the daily, then a little extra ──
const B = await page.evaluate(async ([SEEDS, MAX_EXTRA, NOPRACTICE]) => {
  if (NOPRACTICE) window.vxPracticeItems = () => [];
  window.saveState = () => {}; window.saveToCloud = () => {}; window.speak = () => {};
  window.showCelebrateToast = () => {}; window.confettiBurst = () => {}; window.playAchievement = () => {};
  const snapshot = JSON.stringify(S);
  const SETS = [
    ["b_vxforms", "a_vxsure", "b_meet", "b_up"],
    ["b_ledger", "b_vxforms", "b_heal", "a_fix"],
    ["a_clear", "b_known", "b_strong", "b_flags"],
    ["b_vxforms", "b_ledger", "b_sheet", "a_vxfix"],
    ["b_vxforms", "a_vxsure", "b_ledger", "a_path"], // stress: targets pushed 8 above what the day gives
    ["b_vxforms", "b_ledger", "a_path", "c_games"],  // late deficit: after the daily, the verb quests lack 10 forms
  ];
  const PROFILES = [[0.05, 0.05], [0.12, 0.10], [0.25, 0.15], [0.4, 0.2]]; // [wrong, hint]
  const LATE = 5;
  const VERB_Q = ["b_vxforms", "a_vxsure", "b_ledger"];
  // One session played to its end. Returns the answers given (-1: nothing to play).
  const play = (len, opts, pWrong, pHint) => {
    startPathSession(len, { noBonus: true, ...opts });
    const s = pathSession; if (!s) return -1;
    let guard = 0;
    while (pathSession && guard++ < 800) {
      const it = s.cur; if (!it) break;
      if (it.t === "repairOffer") { pathRepair(true); continue; }
      if (it.t === "sheet") { if (typeof _gs !== "undefined" && _gs) _gs.quiz = null; pathNext(); continue; }
      if (it.t === "learn") { pathNext(); continue; }
      if (it.t === "bonus") { if (it.minion) pathMinion(false); else pathBonus(false); continue; }
      const wrong = Math.random() < pWrong;
      if (!wrong && Math.random() < pHint) it.usedHint = true;
      if (it.w && it.w.vx) { document.getElementById("p-input").value = wrong ? "zzz qqq" : it.w.vx.form.ans; pathCheckTyped(); }
      else if (it.t === "choice" || it.t === "listen") { const i = it.opts.findIndex(o => o.correct); pathAnswerChoice(wrong ? (i + 1) % it.opts.length : i); }
      else { const ans = it.t === "cloze" ? it.cloze.answer : it.t === "reverse" ? gamePrompt(it.w) : it.w[WORD_KEY]; pathGradeTyped(wrong ? "zzz qqq" : ans, wrong ? false : true); }
      pathNext();
    }
    const n = s.stats.answered;
    if (pathSession) endPathSession(true);
    return n;
  };
  const results = [];
  for (let seed = 1; seed <= SEEDS; seed++) {
    for (const [si, set] of SETS.entries()) {
      const [pWrong, pHint] = PROFILES[si === LATE ? (seed + si) % 3 : (seed + si) % 4]; // the late-deficit day: 25% wrong at worst
      Object.assign(S, JSON.parse(snapshot));
      if (typeof invalidatePathScan === "function") invalidatePathScan();
      let sd = seed * 7919 + si; Math.random = () => { sd = (sd * 1103515245 + 12345) & 0x7fffffff; return sd / 0x7fffffff; };
      window.recentAccuracy = () => 1 - pWrong; // the day's sizing sees the accuracy it is played at
      if (vxAvailable() && !vxOn()) vxSwitchOn();
      questEnsureToday();
      const c = questContext(), rng = seededRandom(seed);
      S.quests.list = set.map((id, i) => makeQuest(byId(id), c, rng, "ABCD"[i]));
      if (si === 4) S.quests.list.forEach(q => { if (VERB_Q.includes(q.tpl)) q.target += 8; });
      S.quests.weekend = null; S.quests.dayDone = false; S.quests.m = freshQuestCounters(); S.quests.dbl = -1;
      const start = S.quests.list.map(q => q.target), fails = [];
      let sessions = 0, exhausted = false;
      while (sessions < 40 && !exhausted) { play(["quick", "regular", "long"][sessions % 3], {}, pWrong, pHint); sessions++; exhausted = questTodayExhausted(); }
      const fmt = q => `${q.tpl} ${q.prog}/${q.target}${q.done ? "✓" : ""}`;
      if (si === 5) S.quests.list.forEach((q, i) => { if (VERB_Q.includes(q.tpl)) { q.target = Math.min(q.prog, q.target) + 10; q.done = false; q.doneAt = 0; start[i] = q.target; } });
      const afterDaily = S.quests.list.map(fmt);
      // a little extra: ▶ on the open verb quests — quick rounds (extra practice when Today is empty)
      let extra = 0, rounds = 0;
      while (rounds < MAX_EXTRA && S.quests.list.some(q => !q.done && VERB_Q.includes(q.tpl))) {
        const n = play("quick", questTodayExhausted() ? { practice: true } : {}, pWrong, pHint);
        if (n < 0) break; // nothing offered
        extra += n; rounds++;
      }
      S.quests.list.forEach((q, i) => { if (q.target > start[i]) fails.push(`${q.tpl} target rose ${start[i]} → ${q.target}`); });
      renderHome();
      if (/NaN|Infinity|undefined/.test(document.getElementById("home").innerHTML)) fails.push("NaN/undefined in the Today card");
      S.quests.list.forEach(q => { if (exhausted && VERB_Q.includes(q.tpl) && !q.done) fails.push(`${q.tpl} still open after the daily + ${rounds} extra round(s) (${q.prog}/${q.target})`); });
      results.push({ seed, set: si, pWrong, pHint, sessions, exhausted, afterDaily, extra, rounds, final: S.quests.list.map(fmt), fails });
    }
  }
  return results;
}, [SEEDS, MAX_EXTRA_ROUNDS, NOPRACTICE]);
let bFails = 0;
for (const r of B) {
  if (r.fails.length) bFails++;
  console.log(`${r.fails.length ? "✗" : "✓"} seed ${r.seed} set ${r.set} wrong ${r.pWrong} hint ${r.pHint}: daily ${r.sessions} sessions${r.exhausted ? "" : " (Today not empty)"} → ${r.afterDaily.join(" · ")}`);
  if (r.extra) console.log(`    + extra: ${r.extra} answers in ${r.rounds} round(s) → ${r.final.join(" · ")}`);
  r.fails.forEach(f => console.log("    ✗ " + f));
}
console.log(`days: ${B.length - bFails} passed, ${bFails} failed (${B.filter(r => !r.exhausted).length} days never emptied Today in 40 sessions — not judged)`);

// ── C. the nudge on the real summary screen ──
const C = await page.evaluate(async () => {
  window.saveState = () => {}; window.saveToCloud = () => {}; window.speak = () => {};
  window.showCelebrateToast = () => {}; window.confettiBurst = () => {}; window.playAchievement = () => {};
  const out = [], ok = (c, m, x) => out.push([!!c, m + (x !== undefined ? " — " + x : "")]);
  const answerAll = s => {
    let guard = 0;
    while (pathSession && guard++ < 400) {
      const it = s.cur; if (!it) break;
      if (it.t === "repairOffer") { pathRepair(false); continue; }
      if (it.t === "sheet") { if (typeof _gs !== "undefined" && _gs) _gs.quiz = null; pathNext(); continue; }
      if (it.t === "learn") { pathNext(); continue; }
      if (it.t === "bonus") { if (it.minion) pathMinion(false); else pathBonus(false); continue; }
      if (it.w && it.w.vx) { document.getElementById("p-input").value = it.w.vx.form.ans; pathCheckTyped(); }
      else if (it.t === "choice" || it.t === "listen") pathAnswerChoice(it.opts.findIndex(o => o.correct));
      else { const ans = it.t === "cloze" ? it.cloze.answer : it.t === "reverse" ? gamePrompt(it.w) : it.w[WORD_KEY]; pathGradeTyped(ans, true); }
      pathNext();
    }
  };
  const play = () => { startPathSession("quick", { noBonus: true }); answerAll(pathSession); };
  questEnsureToday();
  const c = questContext(), rng = seededRandom(9);
  const mk = ids => { S.quests.m = freshQuestCounters(); S.quests.list = ids.map((id, i) => makeQuest(byId(id), c, rng, "ABCD"[i])); S.quests.weekend = null; S.quests.dayDone = false; };
  mk(["a_deck", "b_hard", "a_path", "c_games"]); S.quests.list[0].target = 9999; S.quests.list[1].target = 9999;
  play();
  const html = document.getElementById("main-screen").innerHTML;
  ok(/Still open/.test(html) && (html.match(/questGo\(/g) || []).length === 2, "summary lists the two open focus quests with Go");
  ok(!/NaN|undefined/.test(html), "summary has no NaN/undefined");
  const btn = [...document.querySelectorAll("#main-screen button")].find(b => /questGo\(0\)/.test(b.getAttribute("onclick") || ""));
  let started = null; const rs = window.startPathSession; window.startPathSession = (len, o) => { started = o; };
  if (btn) btn.click(); window.startPathSession = rs;
  ok(started && started.focus === "deck", "pressing Go starts the deck session", JSON.stringify(started));
  mk(["b_known", "a_path", "c_games", "d_run"]);
  play();
  ok(!/Still open/.test(document.getElementById("main-screen").innerHTML), "no card when no focus quest is open");
  mk(["b_vxforms", "b_known", "a_path", "c_games"]); S.quests.list[0].target = 9999;
  play();
  const h2 = document.getElementById("main-screen").innerHTML;
  ok(/Still open/.test(h2) && /questGo\(0\)/.test(h2), "a short verb quest is listed too");
  mk(["a_deck", "b_known", "a_path", "c_games"]);
  const deck = S.quests.list[0].p.deck; S.quests.list[0].target = 5;
  startPathSession("quick", { focus: "deck", param: deck });
  answerAll(pathSession);
  ok(S.quests.list[0].done && S.quests.m.decks[deck] >= 5, "a deck focus session fills the deck quest", `deck answers ${S.quests.m.decks[deck]}`);
  return out;
});
let cFails = 0;
for (const [pass, msg] of C) { if (!pass) cFails++; console.log((pass ? "✓ " : "✗ ") + msg); }
console.log(`summary: ${C.length - cFails} passed, ${cFails} failed`);
if (errors.length) console.log("page errors:", errors.slice(0, 5));
const ok = !fails && !bFails && !cFails && !errors.length;
console.log(`quests: ${ok ? "passed" : "FAILED"}`);
await browser.close();
process.exit(ok ? 0 : 1);
