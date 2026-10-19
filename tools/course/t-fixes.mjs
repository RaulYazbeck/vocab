// The fixes after the first week (PLAN.md §12, "Fixes after the first
// week"), in the real app (same setup as t-course.mjs):
//   1 · the session length is the length: the grammar inside it — the
//       learner's own day (the A1 verb lesson 12/13: its last sheet in a
//       Long 60 that still reads x/60)
//   2 · ✍️ a writing starter tapped is typed, at the cursor
//   4 · the Journey's coming days count the course; "out of reach" counts it
//   5 · a twist round ranks up when the twist is neutral or harder, never
//       with 🌟 Golden words
//   6 · the lesson clock on the screens: the verb lesson under way in
//       Today, the Course's pace line, the Journey's days
//
//   node t-fixes.mjs   (serve the repo root on :8765; npm install once in tools/audio/tests)
import { openApp } from "../verb-track/browser.mjs";

let fails = 0;
const say = (r, tag) => { console.log(`== ${tag}`); r.log.forEach(l => console.log(l)); r.fails.forEach(l => console.log(l)); fails += r.fails.length; };
const HELP = () => {
  window.__log = [], window.__fails = [];
  window.ok = (c, m) => { (c ? __log : __fails).push((c ? "✓ " : "✗ ") + m); };
  window.mistakeHeld = () => false;
};

// ── 1 + 6 · the learner's day: nicht/kein done, the Präsens lesson at 9 of 10 ──
{
  const { browser, page, errors } = await openApp({ course: true });
  await page.evaluate(HELP);
  const r = await page.evaluate(() => {
    migrateCourse();
    S.course.sec["s0.neg"] = { st: 3, sh: 100, ok: { "cx.neg1": 100 }, at: addDays(studyToday(), -2) };
    S.course.since = addDays(studyToday(), -2); S.course.last = addDays(studyToday(), -2);
    ["pr1", "pr2", "pr3", "pr4", "pr5", "im1", "im2", "im3", "pf1", "pt11", "pt12", "pt13"].forEach(id => { S.verb.sh[id] = 100; });
    delete S.verb.sh.pr7; S.verb.su = {}; S.verb.ns = 0;
    S.path.plan = null; invalidatePathScan();
    ok(cxCurrentLesson() && cxCurrentLesson().id === "s0.verbs", `the lesson under way: the Präsens lesson (${(cxCurrentLesson() || {}).id})`);
    ok(JSON.stringify(vxSheetsToday()) === JSON.stringify(["pr7"]), `today's sheet: the one left, pr7 (${vxSheetsToday()})`);
    ok(!cxTodayParts().some(p => ["testout", "sheet", "drill"].includes(p.part)), "no course lesson on top of it (one lesson at a time)");
    // the names and counts agree: the Course, the Today card, the sheet
    renderHome();
    const card = (document.querySelector(".tc-vx.lesson") || {}).innerText || "";
    ok(/A1 · Präsens · Imperativ · the Perfekt's structure · war & hatte · sheet 6 of 13 in your session/.test(card), `the Today card names the course lesson and its count ("${card}")`);
    renderCourseSection("s0.verbs");
    ok(/12\/13 sheets/.test(document.getElementById("main-screen").innerText), "the Course: 12/13 sheets — the same count");
    startPathSession("long", { noBonus: true });
    const s = pathSession, cnt = () => (document.getElementById("p-count") || {}).textContent;
    ok(s.items.some(x => x.t === "sheet" && x.sheet === "pr7"), "Today brings it");
    ok(+cnt().split("/")[1] === 60, `the count: ${cnt()} — 60 means 60, the sheet's questions inside it`);
    let guard = 0;
    const totals = new Set();
    while (pathSession && s.cur && guard++ < 400) {
      const it = s.cur; totals.add(+cnt().split("/")[1]);
      if (it.t === "repairOffer" || s.repairPhase) break;
      if (it.t === "sheet") {
        const badge = (document.querySelector(".gs-unit") || {}).innerText || "";
        ok(/Präsens · A1 lesson 6\/13/.test(badge), `the sheet's badge: its tense, then its place in the course lesson ("${badge}")`);
        while (_gs.step < _gs.steps.length) gsGo(1);
        while (!_gs.quiz.done) { const cur = _gs.quiz.list[_gs.quiz.i], Q = cur.q;
          if (Q.k === "type") { document.getElementById("gs-input").value = Q.a[0]; gsQuizCheck(); }
          else if (Q.k === "order") { cur.picked = Q.a.map((_, i) => i); gsQuizCheck(); }
          else gsQuizPick(Q.a);
          gsQuizNext(); }
        gsQuizFinish(); continue;
      }
      if (it.t === "bonus") { pathBonus(false); continue; }
      if (it.t === "cx") { if (_cx) { while (!_cx.done) cxNext(); cxFinish(); } else pathNext(); continue; }
      pathNext();
    }
    ok(totals.size === 1, `the count never changed (${[...totals]})`);
    ok(vxSheetPassed("pr7") && cxSecDone("s0.verbs") && S.course.last === studyToday(), "pr7 passed: the Präsens lesson is done, its break starts today");
    ok(!cxCurrentLesson() && cxNextLessonDay() > studyToday(), `then no new lesson today (the next on ${cxNextLessonDay()})`);
    // the Course screen
    renderCourse();
    const t = document.getElementById("main-screen").innerText;
    ok(/On track · each lesson's sheets on days in a row, then about \d+ days? to practise it/.test(t), `the pace line says the clock (${(t.match(/On track[^\n]*/) || [""])[0]})`);
    ok(/Your next lesson — in Today on/.test(t), "the next lesson: its day");
    // the Journey: the 7 days, today lit (a lesson was learned today)
    renderJourney();
    const days = [...document.querySelectorAll(".cx-wday")];
    ok(days.length === 7 && days[0].classList.contains("on") && days.slice(1).some(d => d.classList.contains("on")) && !days[1].classList.contains("on"), `the Journey's days: today lit, tomorrow a break, a lesson after (${days.map(d => d.textContent).join(" ")})`);
    return { log: __log, fails: __fails };
  });
  say(r, "the learner's day: the Präsens lesson's last sheet, 60 is 60");
  if (errors.length) { console.log("ERRORS", errors.slice(0, 5)); fails++; }
  await browser.close();
}

// ── 1 · Quick / Regular / Long: the length is the length ──
{
  const { browser, page, errors } = await openApp({ course: true });
  await page.evaluate(HELP);
  const r = await page.evaluate(() => {
    for (const [len, n] of [["quick", 15], ["regular", 30], ["long", 60]]) {
      startPathSession(len, { noBonus: true });
      const c = (document.getElementById("p-count") || {}).textContent, cx = pathSession.items.filter(x => x.t === "cx").map(x => x.part + ":" + x.qn);
      ok(+c.split("/")[1] <= n, `${len}: ${c} (the grammar inside: ${cx.join(" ") || "none — it waits"})`);
      if (len === "quick") ok(!cx.some(x => /^(testout|sheet|drill)/.test(x)), "quick: the lesson doesn't fit whole — none of it");
      pathSession = null; backToMenu();
    }
    return { log: __log, fails: __fails };
  });
  say(r, "the length is the length");
  if (errors.length) { console.log("ERRORS", errors.slice(0, 5)); fails++; }
  await browser.close();
}

// ── 2 · ✍️ a starter tapped is typed ──
{
  const { browser, page, errors } = await openApp({ course: true });
  await page.evaluate(HELP);
  await page.evaluate(() => { renderJournal(); cxJournalOpen(document.getElementById("main-screen"), { mode: "menu", prompt: "w.notlike" }); });
  const chips = await page.$$(".cx-starters .gs-chip");
  await chips[1].click(); // "Ich mag … nicht."
  await page.keyboard.type("Fisch");
  await page.evaluate(() => { const v = document.getElementById("cx-jtext").value; ok(v === "Ich mag Fisch nicht.", `"Ich mag … nicht." tapped, then typed: the word lands in the gap ("${v}")`); });
  await page.evaluate(() => { const ta = document.getElementById("cx-jtext"); ta.focus(); ta.setSelectionRange(ta.value.length, ta.value.length); });
  await (await page.$$(".cx-starters .gs-chip"))[2].click(); // "… sondern …"
  await page.keyboard.type("Fleisch.");
  await page.evaluate(() => { const v = document.getElementById("cx-jtext").value; ok(v === "Ich mag Fisch nicht. sondern Fleisch.", `a second one at the cursor, with a space ("${v}")`); });
  await page.evaluate(() => {
    ok(cxJDraft("w.notlike") === document.getElementById("cx-jtext").value, "the draft is kept");
    ok(/\d+ \/ \d+ words|\d+ words ✓/.test(document.getElementById("cx-wc").textContent) && /^6 \//.test(document.getElementById("cx-wc").textContent), `the count follows (${document.getElementById("cx-wc").textContent})`);
    ok(document.activeElement === document.getElementById("cx-jtext"), "the text keeps the keyboard");
  });
  // the middle of the text, then the text blurred by the tap (a phone): at the cursor still
  await page.evaluate(() => { const ta = document.getElementById("cx-jtext"); ta.value = "A B"; ta.focus(); ta.setSelectionRange(1, 1); ta.blur(); });
  await (await page.$$(".cx-starters .gs-chip"))[3].click(); // "Lieber …"
  await page.evaluate(() => { const v = document.getElementById("cx-jtext").value; ok(v === "A Lieber  B", `the cursor where it was before the tap ("${v}")`); });
  say(await page.evaluate(() => ({ log: __log, fails: __fails })), "✍️ starters");
  if (errors.length) { console.log("ERRORS", errors.slice(0, 5)); fails++; }
  await browser.close();
}

// ── 4 · the Journey's coming days and "out of reach" count the course ──
{
  const { browser, page, errors } = await openApp({ course: true });
  await page.evaluate(HELP);
  const r = await page.evaluate(() => {
    const f = pathForecast(8), cxd = cxForecastDays(8);
    ok(f.days.slice(1).every(d => d.cx >= 0) && f.days.slice(1).some(d => d.cx > 0), `the coming days carry the course's answers (${f.days.map(d => d.cx).join(" ")})`);
    const i = cxd.findIndex((d, k) => k > 0 && d.lesson);
    const verbDay = i > 0 && cxIsVerb(cxSection(cxd[i].sec));
    ok(i > 0 && f.days[i].cx >= (verbDay ? 3 : 10), `a lesson day counts its sheet${verbDay ? " (a verb lesson's)" : " and drill"} (day ${i}, ${cxd[i] && cxd[i].sec}: +${f.days[i] && f.days[i].cx})`);
    ok(f.days.slice(1).every(d => d.target === planTarget(d.total, d.newWords, (pathEnsurePlan().vx ? vxPlanTarget({ ...pathEnsurePlan().vx, sheets: 0, sheetQ: 0 }) + Math.round((pathEnsurePlan().vx.due || 0) * 1.1) : 0) + d.cx)), "each day's number: words, verbs and the course, rounded up to 10");
    renderJourney();
    ok(/grammar/.test(document.querySelector(".jf-legend").innerText) && document.querySelector(".jf-g"), "the bars show the grammar's share");
    ok(pathDeadlineStatus().ok, "15 Aug 2027: in reach");
    const keep = S.path.deadline; S.path.deadline = addDays(studyToday(), 45); S.path.plan = null; invalidatePathScan();
    const st = pathDeadlineStatus();
    ok(!st.ok && cxFastestEta() > S.path.deadline, `a date 45 days away: out of reach — the course alone needs until ${cxFastestEta()}`);
    ok(/grammar lessons 1\.5 sheets a day/.test(deadlineSettingsHtml()), "the warning names the grammar");
    S.path.deadline = keep; S.path.plan = null; invalidatePathScan();
    return { log: __log, fails: __fails };
  });
  say(r, "the Journey and the date count the course");
  if (errors.length) { console.log("ERRORS", errors.slice(0, 5)); fails++; }
  await browser.close();
}

// ── 5 · twists and ranks ──
{
  const { browser, page, errors } = await openApp({ course: true });
  await page.evaluate(HELP);
  const r = await page.evaluate(() => {
    const id = "match", def = getGame(id);
    const round = (twist, rank) => {
      const ctx = { def, size: "full", rank, twist, missedWords: [], missKinds: {}, hits: new Map(), golden: 0, clock: { elapsed: () => 30000 }, opts: {}, pool: [] };
      finishGame(ctx, { score: 1e7, correct: 30, wrong: 0, maxCombo: 30 });
      return document.getElementById("main-screen").innerText;
    };
    for (const tw of ["turbo", "sudden", "mirror"]) {
      S.games.rank[id] = 3; S.games.rankStars[id] = [3, 3, 3, 0, 0];
      const t = round(tw, 3);
      ok(gameRankOf(id) === 4 && S.games.rankStars[id][3] === 3 && /Diamond unlocked/.test(t), `3★ at 💠 Platinum with ${TWISTS[tw].name}: 💎 Diamond unlocked`);
    }
    S.games.rank[id] = 3; S.games.rankStars[id] = [3, 3, 3, 0, 0];
    const best = (S.games.rankBest[id] || [])[3];
    const t = round("golden", 3);
    ok(gameRankOf(id) === 3 && S.games.rankStars[id][3] === 0 && /makes the round easier/.test(t), "with 🌟 Golden words (easier): no stars for the rank, no rank-up — and it says why");
    ok((S.games.rankBest[id] || [])[3] === best && S.games.twistBest[id] >= 1e7, "a twist's score stays in its own best");
    S.games.rank[id] = 1; S.games.rankStars[id] = [3, 1, 0, 0, 0];
    round("mirror", 0);
    ok(gameRankOf(id) === 1, "3★ below the top rank (Retro): no rank-up, as without a twist");
    return { log: __log, fails: __fails };
  });
  say(r, "twists and ranks");
  if (errors.length) { console.log("ERRORS", errors.slice(0, 5)); fails++; }
  await browser.close();
}

console.log(fails ? `t-fixes: ${fails} FAILED` : "t-fixes: all passed");
process.exit(fails ? 1 : 0);
