// Quests that only Today can feed (`finite`) and the end-of-session nudge:
//   • when Today says "All caught up", an open finite quest is finished at
//     what was earned — never stuck (misses, hints, repairs use items up
//     without counting); nothing else is touched (games, focus, time-of-day,
//     done quests, a day with no answers yet, a day with work left);
//   • the verb-forms quest is sized from what Today holds (repairs counted,
//     a new item = one check);
//   • the end of a session lists the open focus quests, with a Go button;
//   • whole days played to the end (random right / wrong, seeds): every
//     finite quest ends done, no target ever goes up, nothing is NaN.
//   node t-quests.mjs        (SEEDS=n, APP=fr; serve the repo root on :8765,
//                             `npm install` once in tools/audio/tests)
import { openApp } from "../verb-track/browser.mjs";
const APP = process.env.APP || "de";
const SEEDS = +(process.env.SEEDS || 4);
const NOFIT = !!process.env.NOFIT; // control run: without the fix the days should end stuck
const { browser, page, errors } = await openApp({ width: 390, height: 844, app: APP });
page.setDefaultTimeout(0);

// ── A. the rules, with Today's numbers stubbed ──
const A = await page.evaluate(() => {
  window.saveState = () => {}; window.saveToCloud = () => {}; window.showCelebrateToast = () => {}; window.confettiBurst = () => {};
  window.playAchievement = () => {};
  if (vxAvailable() && !vxOn()) vxSwitchOn();
  const out = [], ok = (c, m, x) => out.push([!!c, m + (x !== undefined ? " — " + x : "")]);
  const real = { sum: pathTodaySummary, vxc: vxTodayCounts, sh: vxSheetsToday };
  const today = (due, newLeft, vxDue = 0, vxFresh = 0, sheets = 0) => {
    window.pathTodaySummary = () => ({ due, fix: 0, newLeft, scan: {} });
    window.vxTodayCounts = () => ({ due: vxDue, fix: 0, fresh: vxFresh });
    window.vxSheetsToday = () => new Array(sheets).fill("x");
  };
  const restore = () => { window.pathTodaySummary = real.sum; window.vxTodayCounts = real.vxc; window.vxSheetsToday = real.sh; };
  // progress is read from the day's counters, as in the app
  const METRIC = { b_vxforms: "vxOk", a_vxsure: "vxTenseSure", b_known: "known", b_strong: "strong", b_up: "up", b_heal: "repaired", b_flags: "unflagged", a_path: "path", c_games: "game", d_run: "bestRun", a_deck: "", a_cloze: "cloze", b_hard: "hard", d_mystery: "" };
  const setup = (tpls, progs, targets, mOk = 10) => {
    questEnsureToday();
    const c = questContext(), rng = seededRandom(1);
    S.quests.m = freshQuestCounters(); S.quests.m.ok = mOk;
    S.quests.list = tpls.map((id, i) => { const q = makeQuest(byId(id), c, rng, "ABCD"[i]); q.target = targets[i]; q.done = false; if (METRIC[id]) S.quests.m[METRIC[id]] = progs[i]; return q; });
    S.quests.weekend = null; S.quests.dayDone = false;
    S.quests.dbl = -1; S.quests._showDayComplete = false;
    S.quests.list.forEach(q => { q.prog = questProgOf(q); });
    return S.quests.list;
  };
  const fresh = () => ({ ...freshQuestCounters() });

  // 1. finite quests are flagged, the others are not
  const fin = QT.filter(t => t.finite).map(t => t.id).sort();
  ok(fin.length === 13, "13 finite quests", fin.join(" "));
  ok(QT.filter(t => t.finite).every(t => t.go === "path" || typeof t.go === "function"), "every finite quest opens Today");
  ["c_games", "a_path", "a_typed", "a_deck", "b_comeback", "b_dust", "b_hard", "b_spot", "b_explore", "b_finish", "d_early", "d_run", "d_bigrun", "a_twosess", "a_long", "d_mystery", "c_three", "b_gender", "a_verbs", "d_spree", "d_clean"]
    .forEach(id => ok(!byId(id).finite, `${id} is not finite`));

  // 2. exhausted → the stuck verb quest is finished at what was earned
  today(0, 0);
  let L = setup(["b_vxforms", "a_path", "c_games", "d_run"], [20, 5, 3, 2], [23, 30, 20, 10]);
  questFitFinite();
  ok(L[0].done && L[0].prog === L[0].target && L[0].fit === 20 && L[0].target === 23, "20/23 verb forms, nothing left → done (earned 20)", `${L[0].prog}/${L[0].target} fit=${L[0].fit} done=${L[0].done}`);
  ok(!L[1].done && L[1].target === 30 && !L[2].done && L[2].target === 20 && !L[3].done, "path / games / run quests untouched");
  ok(!S.quests.dayDone, "day not complete while others are open");

  // 3. each way Today can still hold work → nothing changes
  [["words due", () => today(3, 0)], ["new words left", () => today(0, 2)], ["verb reviews due", () => today(0, 0, 4)],
   ["new verb items", () => today(0, 0, 0, 1)], ["a grammar sheet waiting", () => today(0, 0, 0, 0, 1)]].forEach(([n, f]) => {
    f(); L = setup(["b_vxforms"], [20], [23]); questFitFinite();
    ok(!L[0].done && L[0].target === 23, `${n} → target stays 23`);
  });
  today(0, 0);
  // 4. no answers yet today → never settles
  L = setup(["b_vxforms"], [0], [23], 0); questFitFinite();
  ok(!L[0].done && L[0].target === 23, "no answers yet today → untouched");
  // 5. nothing earned at all but Today is empty → done, not 0/0
  L = setup(["b_known"], [0], [3], 5); questFitFinite();
  ok(L[0].done && L[0].target >= 1 && L[0].prog === L[0].target && L[0].fit === 0, "0 earned, Today empty → done, never 0/0", `${L[0].prog}/${L[0].target}`);
  renderHome(); const mini = questMiniHtml();
  ok(!/NaN|Infinity/.test(mini + document.getElementById("home").innerHTML), "no NaN in the Today card");
  // 6. already-done and complete quests aren't touched / paid twice
  L = setup(["b_known", "b_up"], [3, 1], [3, 5]); L[0].done = true; L[0].doneAt = 1;
  const xp0 = S.exp; questFitFinite();
  ok(L[0].doneAt === 1 && L[1].done && L[1].fit === 1, "a done quest keeps its time; the open one fits");
  ok(S.exp > xp0, "the fitted quest pays its XP once", `+${S.exp - xp0}`);
  const xp1 = S.exp; questFitFinite(); questRecompute(); questRecompute();
  ok(S.exp === xp1, "no double payment on repeat calls");
  // 7. all four finite → day complete, once
  L = setup(["b_flags", "b_up", "b_heal", "b_known"], [1, 1, 1, 1], [4, 5, 6, 7]);
  const days0 = S.quests.qdays.filter(d => d === todayISO()).length;
  questFitFinite();
  ok(L.every(q => q.done) && S.quests.dayDone, "all four finite quests fit → the day completes");
  ok(S.quests._showDayComplete === true && S.quests.qdays.filter(d => d === todayISO()).length === Math.max(days0, 1), "day-complete shown, today counted once");
  questFitFinite(); questFitFinite();
  ok(S.quests.qdays.filter(d => d === todayISO()).length === Math.max(days0, 1), "repeat calls don't count the day twice");
  S.quests._showDayComplete = false;
  // 8. weekend quest
  L = setup(["a_path"], [0], [10]);
  S.quests.weekend = (() => { const q = makeQuest(byId("b_heal"), questContext(), seededRandom(2), "W"); q.target = 5; S.quests.m.repaired = 2; q.prog = 2; return q; })();
  questFitFinite();
  ok(S.quests.weekend.done && S.quests.weekend.fit === 2, "weekend finite quest fits too", `${S.quests.weekend.prog}/${S.quests.weekend.target}`);
  S.quests.weekend = null;
  // 9. a mystery quest hiding a finite one is left alone (it is only a ❓)
  L = setup(["d_mystery"], [0], [1]); L[0].hidden = makeQuest(byId("b_known"), questContext(), seededRandom(3), "D");
  questFitFinite();
  ok(!L[0].done, "mystery quest untouched");
  // 10. the target never goes up
  L = setup(["b_vxforms"], [30], [23]); questFitFinite();
  ok(L[0].target <= 23, "target never rises");
  // 11. the fit is permanent: more answers later don't undo or double it
  L = setup(["b_vxforms"], [20], [23]); questFitFinite(); today(5, 0);
  const m = S.quests.m; m.vxOk = 0; questRecompute();
  ok(L[0].done && L[0].prog === L[0].target, "stays done, and at 100%, after the counters change");

  // 12. verb-forms target sizing
  restore();
  const t = byId("b_vxforms"), mk = (fix, due, items, cells) => ({ vx: { fix, due, items, cells } });
  ok(t.ok(mk(0, 0, 0, 5)) === false && t.ok(mk(0, 0, 0, 6)) === true, "offered from 6 forms of work");
  ok(t.target(mk(2, 5, 3, 4)) === 14, "target = repairs + due + 1 per new item + drills", t.target(mk(2, 5, 3, 4)));
  ok(t.target(mk(0, 40, 12, 30)) === 30, "capped at 30");
  ok(t.target(mk(0, 0, 0, 6)) === 6, "floor 6");
  ok(t.target({}) === 6, "no verb track → 6 (not offered anyway)");
  for (let f = 0; f < 6; f++) for (let d = 0; d < 6; d++) for (let i = 0; i < 6; i++) for (let c = 0; c < 6; c++) {
    const cx = mk(f * 3, d * 4, i * 2, c * 3);
    if (t.ok(cx) && t.target(cx) > f * 3 + d * 4 + i * 2 + c * 3) { ok(false, "target above the day's supply", JSON.stringify(cx.vx)); f = d = i = c = 99; }
  }
  ok(true, "no sizing ever above what Today holds (1296 mixes)");
  // 13. every finite template can be built, titled and measured from any state
  restore();
  const ctx = questContext();
  QT.filter(t => t.finite).forEach(t => {
    let q, ti = "", pr = -1;
    try { q = makeQuest(t, ctx, seededRandom(5), t.slot); ti = t.title(q); pr = questProgOf(q); } catch (e) { ti = "ERR " + e.message; }
    ok(!/ERR|undefined|NaN/.test(ti) && pr >= 0 && q.target >= 1, `${t.id}: "${ti}" ${q ? q.target : "?"}`);
  });
  // 14. the focus nudge
  L = setup(["a_deck", "b_known", "a_cloze", "b_hard"], [0, 0, 0, 0], [8, 3, 6, 5]);
  const open = questFocusOpen().map(([q]) => q.tpl);
  ok(open.join() === "a_deck,a_cloze,b_hard", "focus quests listed in order, Today-only ones not", open.join());
  let h = questFocusCtaHtml();
  ok((h.match(/questGo\(/g) || []).length === 2, "at most two Go buttons");
  ok(/questGo\(0\)/.test(h) && /questGo\(2\)/.test(h), "buttons point at the right quests (list indexes)");
  L[0].done = true; L[2].done = true; L[3].done = true;
  ok(questFocusCtaHtml() === "", "nothing when every focus quest is done");
  L = setup(["b_explore", "b_known", "a_path", "c_games"], [0, 0, 0, 0], [3, 3, 10, 20]);
  ok(questFocusCtaHtml() === "", "Explorer (focus:new) is not nudged; Today/game quests neither");
  L = setup(["d_mystery", "b_known", "a_path", "c_games"], [0, 0, 0, 0], [1, 3, 10, 20]);
  ok(questFocusCtaHtml() === "", "a mystery quest is not nudged");
  // 15. Go really starts a focus session (and the quest list index is the list's)
  L = setup(["a_deck", "b_known", "a_path", "c_games"], [0, 0, 0, 0], [8, 3, 10, 20]);
  let started = null; const rs = window.startPathSession; window.startPathSession = (len, o) => { started = o; };
  questGo(0); window.startPathSession = rs;
  ok(started && started.focus === "deck" && started.param === L[0].p.deck, "Go starts that deck's focus session", JSON.stringify(started));
  restore();
  return out;
});
let fails = 0;
for (const [pass, msg] of A) { if (!pass) fails++; console.log((pass ? "✓ " : "✗ ") + msg); }
console.log(`rules: ${A.length - fails} passed, ${fails} failed`);

// ── B. whole days, played to the end ──
const B = await page.evaluate(async ([SEEDS, NOFIT]) => {
  if (NOFIT) window.questFitFinite = () => {};
  window.saveState = () => {}; window.saveToCloud = () => {}; window.speak = () => {};
  window.showCelebrateToast = () => {}; window.confettiBurst = () => {}; window.playAchievement = () => {};
  const snapshot = JSON.stringify(S);
  const results = [];
  const SETS = [
    ["b_vxforms", "a_vxsure", "b_meet", "b_up"],
    ["a_vxfix", "b_ledger", "b_heal", "a_fix"],
    ["a_clear", "b_known", "b_strong", "b_flags"],
    ["b_vxforms", "b_ledger", "b_sheet", "a_vxfix"],
  ];
  for (let seed = 1; seed <= SEEDS; seed++) {
    for (const [si, set] of SETS.entries()) {
      const pWrong = [0.05, 0.15, 0.3, 0.5][(seed + si) % 4];
      Object.keys(localStorage).forEach(() => {});
      Object.assign(S, JSON.parse(snapshot));
      if (typeof invalidatePathScan === "function") invalidatePathScan();
      let sd = seed * 7919 + si; Math.random = () => { sd = (sd * 1103515245 + 12345) & 0x7fffffff; return sd / 0x7fffffff; };
      if (vxAvailable() && !vxOn()) vxSwitchOn();
      questEnsureToday();
      const c = questContext(), rng = seededRandom(seed);
      S.quests.list = set.map((id, i) => makeQuest(byId(id), c, rng, "ABCD"[i]));
      S.quests.weekend = null; S.quests.dayDone = false; S.quests.m = freshQuestCounters(); S.quests.dbl = -1;
      const start = S.quests.list.map(q => q.target), fails = [];
      let sessions = 0, exhausted = false, guard = 0;
      while (sessions < 40 && !exhausted) {
        const len = ["quick", "regular", "long"][sessions % 3];
        startPathSession(len, { noBonus: true });
        const s = pathSession; if (!s) break;
        sessions++; guard = 0;
        while (pathSession && guard++ < 800) {
          const it = s.cur; if (!it) break;
          if (it.t === "repairOffer") { pathRepair(true); continue; }
          if (it.t === "sheet") { if (typeof _gs !== "undefined" && _gs) _gs.quiz = null; pathNext(); continue; }
          if (it.t === "learn") { pathNext(); continue; }
          if (it.t === "bonus") { if (it.minion) pathMinion(false); else pathBonus(false); continue; }
          const wrong = Math.random() < pWrong;
          if (it.w && it.w.vx) { document.getElementById("p-input").value = wrong ? "zzz qqq" : it.w.vx.form.ans; pathCheckTyped(); }
          else if (it.t === "choice" || it.t === "listen") { const i = it.opts.findIndex(o => o.correct); pathAnswerChoice(wrong ? (i + 1) % it.opts.length : i); }
          else { const ans = it.t === "cloze" ? it.cloze.answer : it.t === "reverse" ? gamePrompt(it.w) : it.w[WORD_KEY]; pathGradeTyped(wrong ? "zzz qqq" : ans, wrong ? false : true); }
          pathNext();
        }
        if (pathSession) { fails.push(`session ${sessions} did not end`); endPathSession(true); }
        else { /* the summary ran endPathSession */ }
        // targets never rise
        S.quests.list.forEach((q, i) => { if (q.target > start[i]) fails.push(`${q.tpl} target rose ${start[i]} → ${q.target}`); });
        exhausted = questTodayExhausted();
      }
      renderHome();
      const html = document.getElementById("home").innerHTML;
      if (/NaN|Infinity|undefined/.test(html)) fails.push("NaN/undefined in the Today card");
      const states = S.quests.list.map(q => `${q.tpl} ${q.prog}/${q.target}${q.done ? "✓" : ""}`);
      if (exhausted) S.quests.list.forEach(q => { if (!q.done) fails.push(`${q.tpl} not done though Today is empty (${q.prog}/${q.target})`); });
      results.push({ seed, set: si, pWrong, sessions, exhausted, states, dayDone: !!S.quests.dayDone, fails });
    }
  }
  return results;
}, [SEEDS, NOFIT]);
let bFails = 0, notExhausted = 0;
for (const r of B) {
  const bad = r.fails.length;
  if (bad) bFails++;
  if (!r.exhausted) notExhausted++;
  console.log(`${bad ? "✗" : "✓"} seed ${r.seed} set ${r.set} wrong ${r.pWrong}: ${r.sessions} sessions, Today ${r.exhausted ? "empty" : "NOT empty"}, ${r.states.join(" · ")}${r.dayDone ? " · day done" : ""}`);
  r.fails.forEach(f => console.log("    ✗ " + f));
}
console.log(`days: ${B.length - bFails} passed, ${bFails} failed (${notExhausted} days never emptied Today within 40 sessions)`);
// ── C. the nudge on the real summary screen ──
const C = await page.evaluate(async () => {
  window.saveState = () => {}; window.saveToCloud = () => {}; window.speak = () => {};
  window.showCelebrateToast = () => {}; window.confettiBurst = () => {}; window.playAchievement = () => {};
  const out = [], ok = (c, m, x) => out.push([!!c, m + (x !== undefined ? " — " + x : "")]);
  const play = () => {
    startPathSession("quick", { noBonus: true });
    const s = pathSession; let guard = 0;
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
  questEnsureToday();
  const c = questContext(), rng = seededRandom(9);
  const mk = ids => { S.quests.m = freshQuestCounters(); S.quests.list = ids.map((id, i) => makeQuest(byId(id), c, rng, "ABCD"[i])); S.quests.weekend = null; S.quests.dayDone = false; };
  mk(["a_deck", "b_hard", "a_path", "c_games"]); S.quests.list[0].target = 9999; S.quests.list[1].target = 9999;
  play();
  const html = document.getElementById("main-screen").innerHTML;
  ok(/Still open/.test(html) && (html.match(/questGo\(/g) || []).length === 2, "summary lists the two open focus quests with Go");
  ok(!/NaN|undefined/.test(html), "summary has no NaN/undefined");
  const btn = [...document.querySelectorAll("#main-screen button")].find(b => /questGo\(0\)/.test(b.getAttribute("onclick") || ""));
  ok(!!btn, "the Go button is on screen");
  let started = null; const rs = window.startPathSession; window.startPathSession = (len, o) => { started = o; };
  if (btn) btn.click(); window.startPathSession = rs;
  ok(started && started.focus === "deck", "pressing Go starts the deck session", JSON.stringify(started));
  mk(["b_known", "a_path", "c_games", "d_run"]);
  play();
  ok(!/Still open/.test(document.getElementById("main-screen").innerHTML), "no card when no focus quest is open");
  // a real focus session runs and counts toward its quest
  mk(["a_deck", "b_known", "a_path", "c_games"]);
  const deck = S.quests.list[0].p.deck; S.quests.list[0].target = 5;
  startPathSession("quick", { focus: "deck", param: deck });
  const s = pathSession; let n = 0, guard = 0;
  while (pathSession && guard++ < 200) {
    const it = s.cur; if (!it) break;
    if (it.t === "learn" || it.t === "sheet") { pathNext(); continue; }
    if (it.t === "repairOffer") { pathRepair(false); continue; }
    if (it.w && it.w.vx) { document.getElementById("p-input").value = it.w.vx.form.ans; pathCheckTyped(); }
    else if (it.t === "choice" || it.t === "listen") pathAnswerChoice(it.opts.findIndex(o => o.correct));
    else { const ans = it.t === "cloze" ? it.cloze.answer : it.t === "reverse" ? gamePrompt(it.w) : it.w[WORD_KEY]; pathGradeTyped(ans, true); }
    n++; pathNext();
  }
  ok(S.quests.list[0].done && S.quests.m.decks[deck] >= 5, "a deck focus session fills the deck quest", `deck answers ${S.quests.m.decks[deck]}, done=${S.quests.list[0].done}`);
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
