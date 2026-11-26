// Two promises the app makes, checked in the real app:
//   • 🏁 "All 4 quests done — continue" only when today's four quests are
//     really done: never carried over from a day finished but not
//     "continued" (the old flag was saved and synced with the quests and
//     came back on the next day's first session summary), never after a
//     reload, never with an open quest;
//   • 🛡️ "Shield it" only when the miss would cost the word a stage: not
//     on a 🩹 repair (the badge is kept), not on a word already dropped a
//     step today, not on the first stage, not without a shield.
//   node t-daycomplete-shield.mjs   (APP=fr; serve the repo root on :8765,
//                                    or: node ../day/run-suite.mjs ../quests/t-daycomplete-shield.mjs)
import { openApp } from "../verb-track/browser.mjs";
const APP = process.env.APP || "de";
const { browser, page, errors } = await openApp({ width: 390, height: 844, app: APP });
page.setDefaultTimeout(0);
const out = [];
const ok = (c, m) => out.push([!!c, m]);
const quiet = () => {
  window.saveToCloud = () => {}; window.showCelebrateToast = () => {}; window.confettiBurst = () => {};
  window.playAchievement = () => {}; window.playLevelUp = () => {}; window.speak = () => {};
};

// ── A. the Day complete moment ──
const A = await page.evaluate(quiet => {
  eval("(" + quiet + ")")();
  const r = [], ok = (c, m) => r.push([!!c, m]);
  questEnsureToday();
  const Q = S.quests;
  const allDone = () => { Q.list.forEach(q => { q.done = true; q.prog = q.target; }); Q.dayDone = false; questRecompute(); };
  ok(!dayCompletePending() && !dayCompleteCtaHtml(), "a fresh day: no Day complete button");
  // one quest open: never
  Q.list.slice(0, 3).forEach(q => { q.done = true; });
  questRecompute();
  ok(!Q.dayDone && !dayCompletePending(), "three of four done: no Day complete");
  allDone();
  ok(Q.dayDone && dayCompletePending() && /All 4 quests done/.test(dayCompleteCtaHtml()), "all four done: the button shows");
  ok(!("_showDayComplete" in Q) && !JSON.stringify(S).includes("_showDayComplete"), "the moment is not saved with the state (nor synced)");
  // left without "continue", the next day begins (no reload)
  Q.day = addDays(todayISO(), -1);
  questEnsureToday();
  ok(Q.day === todayISO() && Q.list.length === 4 && Q.list.every(q => !q.done) && !Q.dayDone, "the next day: four fresh open quests");
  ok(!dayCompletePending() && !dayCompleteCtaHtml(), "the next day: no Day complete button carried over");
  // a quest un-done by a sync / a reroll after the day was earned: the button goes
  allDone();
  ok(dayCompletePending(), "all done again: button back");
  Q.list[2].done = false;
  ok(!dayCompletePending(), "a quest open again (a sync, a reroll): no button");
  return r;
}, quiet.toString());
out.push(...A);

// the old saved flag, from a day finished but not continued, on reload
await page.evaluate(() => {
  const st = JSON.parse(JSON.stringify(S));
  st.quests._showDayComplete = true;
  st.quests.day = addDays(todayISO(), -1);
  st.quests.list.forEach(q => { q.done = true; });
  st.quests.dayDone = true;
  localStorage.setItem(APP_CONFIG.storageKey, JSON.stringify(st));
  return true;
});
await page.reload();
await page.waitForFunction(() => typeof S !== "undefined" && S.quests && S.quests.day);
await page.waitForTimeout(400);
const C = await page.evaluate(quiet => {
  eval("(" + quiet + ")")();
  const r = [], ok = (c, m) => r.push([!!c, m]);
  questEnsureToday();
  const Q = S.quests;
  ok(!("_showDayComplete" in Q), "the old saved flag is dropped at load");
  ok(Q.list.every(q => !q.done) && !dayCompletePending(), "yesterday's unfinished moment: no button today");
  // the real first session of the day, played to its summary (the bug's place)
  window.saveState = () => {};
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
    else pathGradeTyped(it.t === "cloze" ? it.cloze.answer : it.t === "reverse" ? gamePrompt(it.w) : it.w[WORD_KEY], true);
    if (!s.answered) s.answered = true;
    pathNext();
  }
  const html = document.getElementById("main-screen").innerHTML;
  ok(!pathSession && /p-again/.test(html), "the first session reached its summary");
  ok(!/All 4 quests done/.test(html) || Q.list.every(q => q.done), "its summary: no “All 4 quests done” while a quest is open");
  // earned now, but a session is running: kept for the menu, then shown once
  Q.list.forEach(q => { q.done = true; q.prog = q.target; }); Q.dayDone = false; questRecompute();
  ok(dayCompletePending(), "all four done now: button");
  backToMenu();
  ok(!dayCompletePending(), "back to the menu: the moment is shown once, then gone");
  return r;
}, quiet.toString());
out.push(...C);

// ── B. the shield ──
const D = await page.evaluate(quiet => {
  eval("(" + quiet + ")")();
  window.saveState = () => {};
  const r = [], ok = (c, m) => r.push([!!c, m]);
  questEnsureToday();
  S.prefs = S.prefs || {}; S.prefs.grandma = false;
  const words = [];
  vocabGroups().forEach(g => g.decks.forEach(d => d.words.forEach((w, i) => { if (S.words[d.id + "_" + i] && words.length < 40) words.push({ ...w, deckId: d.id, deckName: d.name, idx: i }); })));
  startPathSession("quick", { noBonus: true });
  const s = pathSession;
  const today = studyToday();
  let n = 0;
  // one wrong typed answer on a word set up as `ws`; did the shield show?
  const miss = (patch, shields = 2) => {
    const w = words[n++];
    const ws = getWS(w.deckId, w.idx);
    ["rp", "lrn", "fl", "dropDay", "cf", "sk"].forEach(k => delete ws[k]);
    Object.assign(ws, { dueAt: Date.now() - 864e5, metOn: addDays(today, -30) }, patch);
    S.quests.shields = shields;
    s.cur = { t: "typed", w }; s.answered = false; s.shield = null;
    pathGradeTyped("zzz qqq", false);
    const btn = document.getElementById("p-shield");
    return { btn: !!btn, st: stageOf(ws), ws };
  };
  let x = miss({ st: 3, pk: 3 });
  ok(x.btn && x.st === 2, "stage 3 → 2 (a real drop): 🛡️ Shield it shows");
  pathUseShield();
  ok(stageOf(x.ws) === 3 && S.quests.shields === 1 && !document.getElementById("p-shield"), "used: the word keeps its stage, one shield spent");
  x = miss({ st: STAGE_KNOWN, pk: STAGE_KNOWN, mastered: true });
  ok(!x.btn && x.st === STAGE_KNOWN && x.ws.rp === 1, "a Known word's first slip (🩹 repair, badge kept): no shield");
  x = miss({ st: STAGE_KNOWN, pk: STAGE_KNOWN, mastered: true, rp: 1 });
  ok(x.btn && x.st === STAGE_KNOWN - 1, "a Known word missed again while in repair (it drops): shield shows");
  x = miss({ st: 4, pk: 4, dropDay: today });
  ok(!x.btn && x.st === 4, "a word already dropped a step today (no second drop): no shield");
  x = miss({ st: 1, pk: 1 });
  ok(!x.btn && x.st === 1, "a stage-1 word (nothing below it): no shield");
  x = miss({ st: 3, pk: 3 }, 0);
  ok(!x.btn, "no shield left: no button");
  S.prefs.grandma = true;
  x = miss({ st: 3, pk: 3 });
  ok(!x.btn, "Grandma mode: no button");
  S.prefs.grandma = false;
  return r;
}, quiet.toString());
out.push(...D);

out.forEach(([c, m]) => console.log(c ? "✓" : "✗", m));
if (errors.length) console.log("page errors:", errors.slice(0, 5));
const pass = out.every(([c]) => c) && !errors.length;
console.log(`day complete + shield: ${pass ? "passed" : "FAILED"}`);
await browser.close();
process.exit(pass ? 0 : 1);
