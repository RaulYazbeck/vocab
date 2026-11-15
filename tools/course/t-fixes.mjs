// The fixes after the first week (PLAN.md §12, "Fixes after the first
// week"), in the real app (same setup as t-course.mjs):
//   1 · the session length is the length: the grammar inside it — the
//       learner's own day (the A1 verb lesson 12/13: its last sheet in a
//       Long 60 that still reads x/60)
//   1b · 💎 spot checks: the count still the length; weighted towards the
//       words likely to have slipped; PATH.SPOT_PER_DAY a day; none forced
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
    // With a 💎 spot check (a Locked word unseen for two weeks): it takes a
    // review's place — the count is still the length, never one over.
    const old = Date.now() - 30 * 864e5;
    Object.keys(S.words).filter(k => !/^(cx|vx)_/.test(k) && S.words[k].st >= STAGE_KNOWN).slice(0, 20)
      .forEach(k => Object.assign(S.words[k], { st: STAGE_LOCKED, sAt: old, spotAt: 0, rp: 0, rt: 0, dueAt: Date.now() + 60 * 864e5 }));
    invalidatePathScan();
    for (const [len, n] of [["quick", 15], ["regular", 30], ["long", 60]]) {
      S.path.spotToday = 0;
      startPathSession(len, { noBonus: true });
      const c = (document.getElementById("p-count") || {}).textContent, spot = pathSession.items.some(x => x.t === "spot");
      ok(spot && +c.split("/")[1] <= n, `${len} with a spot check: ${c}${spot ? "" : " (no spot check came)"}`);
      pathSession = null; backToMenu();
    }
    return { log: __log, fails: __fails };
  });
  say(r, "the length is the length");
  if (errors.length) { console.log("ERRORS", errors.slice(0, 5)); fails++; }
  await browser.close();
}

// ── 💎 spot checks: weighted towards the words likely to have slipped,
// PATH.SPOT_PER_DAY a day, none when no word qualifies ──
{
  const { browser, page, errors } = await openApp({ course: true });
  await page.evaluate(HELP);
  const r = await page.evaluate(() => {
    const now = Date.now(), day = 864e5;
    const keys = Object.keys(S.words).filter(k => !/^(cx|vx)_/.test(k) && S.words[k].st >= STAGE_KNOWN && !S.words[k].rt).slice(0, 40);
    ok(keys.length === 40, `40 words to lock in (${keys.length})`);
    // every other word of the profile: not a 💎 (only these 40 can come)
    Object.values(S.words).forEach(ws => { if (ws.st >= STAGE_LOCKED) ws.st = STAGE_STRONG; });
    const lock = (k, o) => Object.assign(S.words[k], { st: STAGE_LOCKED, rp: 0, rt: 0, fl: 0, lrn: 0, spotAt: 0, k: 1, dueAt: now + 60 * day, ...o });
    const draw = (set, n = 4000) => { const c = new Map(); for (let i = 0; i < n; i++) { const w = pathSpotCandidates(1)[0]; const k = w && w.deckId + "_" + w.idx; c.set(k, (c.get(k) || 0) + 1); } return sel => sel.reduce((a, x) => a + (c.get(x) || 0), 0) / n; };
    // 1 · misses: 20 never missed, 20 missed six times — the same days unseen
    const A = keys.slice(0, 20), B = keys.slice(20);
    A.forEach(k => lock(k, { wrong: 0, sAt: now - 30 * day, lastAnsweredAt: now - 30 * day }));
    B.forEach(k => lock(k, { wrong: 6, sAt: now - 30 * day, lastAnsweredAt: now - 30 * day }));
    let share = draw(keys);
    const wA = pathSpotWeight(S.words[A[0]], now), wB = pathSpotWeight(S.words[B[0]], now), want = wB / (wA + wB);
    ok(Math.abs(share(B) - want) < 0.04, `missed six times: ${(share(B) * 100).toFixed(1)} % of the picks (the weights say ${(want * 100).toFixed(1)} %, ×${(wB / wA).toFixed(1)} a word)`);
    ok(share(A) > 0.12, `never missed: still ${(share(A) * 100).toFixed(1)} % of the picks`);
    // 2 · time: the same misses, last right 20 or 120 days ago
    A.forEach(k => lock(k, { wrong: 1, sAt: now - 20 * day, lastAnsweredAt: now - 20 * day }));
    B.forEach(k => lock(k, { wrong: 1, sAt: now - 120 * day, lastAnsweredAt: now - 120 * day }));
    share = draw(keys);
    ok(share(B) > 0.7 && share(A) > 0.05, `unseen 120 days: ${(share(B) * 100).toFixed(1)} % · unseen 20 days: ${(share(A) * 100).toFixed(1)} %`);
    // 3 · a word answered right in a game yesterday: almost never
    lock(A[0], { wrong: 6, lastAnsweredAt: now - day });
    ok(pathSpotWeight(S.words[A[0]], now) < pathSpotWeight(S.words[A[1]], now) / 5, "answered right yesterday (a game): its weight is tiny");
    // 4 · the rules of who can come are unchanged: locked or checked < 14 days ago, due, in repair → never
    lock(A[1], { sAt: now - 5 * day }); lock(A[2], { spotAt: now - 3 * day }); lock(A[3], { dueAt: now - day }); lock(A[4], { rp: 1 });
    share = draw(keys, 3000);
    ok([1, 2, 3, 4].every(i => share([A[i]]) === 0), "locked 5 days ago / spot-checked 3 days ago / due / in repair: never picked");
    // 5 · the Practise list "Spot checks": every 💎 word, weighted order
    const fl = focusWords("spot");
    ok(fl.length === 40 && new Set(fl.map(x => x.d.id + "_" + x.i)).size === 40, `🎯 Spot checks lists all 40 (${fl.length})`);
    // 6 · nothing to spot-check → no spot check, the length still the length
    keys.forEach(k => lock(k, { spotAt: now - day }));
    invalidatePathScan();
    ok(pathSpotCandidates(3).length === 0, "every 💎 checked yesterday: no candidate");
    S.path.spotToday = 0;
    startPathSession("long", { noBonus: true });
    let c = (document.getElementById("p-count") || {}).textContent;
    ok(!pathSession.items.some(x => x.t === "spot") && +c.split("/")[1] <= 60, `none forced: long ${c}, no spot check`);
    pathSession = null; backToMenu();
    // 7 · PATH.SPOT_PER_DAY a day: the 3rd still comes, then none
    keys.forEach(k => lock(k, { spotAt: 0, sAt: now - 30 * day, lastAnsweredAt: now - 30 * day }));
    invalidatePathScan();
    ok(PATH.SPOT_PER_DAY === 3, `${PATH.SPOT_PER_DAY} a day`);
    for (const [done, want2] of [[2, true], [3, false]]) {
      S.path.spotToday = done;
      startPathSession("long", { noBonus: true });
      c = (document.getElementById("p-count") || {}).textContent;
      ok(pathSession.items.some(x => x.t === "spot") === want2 && +c.split("/")[1] <= 60, `${done} done today: ${want2 ? "one more comes" : "no more"} (long ${c})`);
      pathSession = null; backToMenu();
    }
    return { log: __log, fails: __fails };
  });
  say(r, "💎 spot checks: weighted, 3 a day, never forced");
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
    // (at the rates the app measures from my last days — planRate — not fixed ones: with
    // fixed rates the check failed on some dates, the test profile's days being dated)
    const P = pathEnsurePlan(), vxExtra = P.vx ? vxPlanTarget({ ...P.vx, sheets: 0, sheetQ: 0 }) + (P.vx.due || 0) * planRate("v") : 0;
    ok(f.days.slice(1).every(d => d.target === planTarget(d.total, d.newWords, vxExtra + d.cx, 0, planRate("w"))), "each day's number: words, verbs and the course, rounded up to 10",
      JSON.stringify(f.days.slice(1).map(d => [d.target, planTarget(d.total, d.newWords, vxExtra + d.cx, 0, planRate("w"))])));
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
