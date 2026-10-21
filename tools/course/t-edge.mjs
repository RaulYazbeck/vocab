// Edge cases of the course in the real app (same setup as t-course.mjs):
//   • the real keyboard: type + Enter checks, Enter goes on, Enter mashed
//     after a miss never skips its feedback, digits pick an option
//   • ✕ in the middle of a drill: what was answered stays, the card comes
//     back in the next session
//   • HTML typed into an answer is shown as text, never run
//   • a damaged S.course is repaired at load, every screen still draws
//   • 👵 Grandma mode and 🗣️ Speak, don't spell: the course cards still work
//   • the sheet passed on another device mid-session: its card skips
//     itself and the count never grows
//   • the study day rolling over in the middle of a drill
//   • the sheet peeked over a question, then back to it with the keyboard
//   • ✍️ the writing card in Today: Enter makes a new line, saved, done
import { openApp } from "../verb-track/browser.mjs";

let fails = 0;
const report = (r, tag) => { console.log(`== ${tag}`); r.log.forEach(l => console.log(l)); r.fails.forEach(l => console.log(l)); fails += r.fails.length; };
const SETUP = () => {
  window.__log = []; window.__fails = [];
  window.ok = (c, m) => { (c ? __log : __fails).push((c ? "✓ " : "✗ ") + m); };
  window.toCx = part => { let g = 0; while (pathSession && pathSession.cur && !(pathSession.cur.t === "cx" && (!part || pathSession.cur.part === part)) && g++ < 400) { if (pathSession.cur.t === "bonus") pathBonus(false); else pathNext(); } return pathSession && pathSession.cur && pathSession.cur.t === "cx"; };
};

// ── the keyboard, ✕ and resume, HTML in an answer ──
{
  const { browser, page, errors } = await openApp({ course: true });
  await page.evaluate(SETUP);
  await page.evaluate(() => { startPathSession("long", { noBonus: true }); ok(toCx("testout"), "Today reaches the test-out card"); });
  // a typed question: type it, Enter checks, Enter goes on
  const typed = async right => {
    const a = await page.evaluate(right => { const cur = _cx.list[_cx.i]; const k = cxItemKind(cxSet(cur.set), cur.item); return { k, a: cur.item.a[0], o: cur.item.o || cxSet(cur.set).o }; }, right);
    if (a.k === "pick") { const opts = a.o, i = opts.indexOf(a.a); await page.keyboard.press(String((right ? i : (i + 1) % opts.length) + 1)); }
    else { await page.click("#cx-input"); await page.keyboard.type(right ? a.a : "<img src=x onerror=window.__x=1> nein"); await page.keyboard.press("Enter"); }
    return a;
  };
  const a1 = await typed(true);
  await page.evaluate(k => ok(_cx.answered && _cx.list[_cx.i].ok === true, `typed (${k}) + Enter: checked, right`), a1.k);
  await page.keyboard.press("Enter");
  await page.evaluate(() => ok(_cx.i === 1 && !_cx.answered, "Enter: the next question"));
  await typed(false);
  await page.evaluate(() => ok(_cx.answered && _cx.list[_cx.i].ok === false, "a wrong answer"));
  await page.keyboard.press("Enter"); await page.keyboard.press("Enter"); await page.keyboard.press("Enter");
  await page.evaluate(() => ok(_cx.i === 1 && _cx.answered, "Enter mashed right after a miss: the feedback stays (held)"));
  await page.evaluate(() => {
    ok(window.__x !== 1 && !document.querySelector("#cx-fb img"), "HTML typed into an answer is never run or drawn");
  });
  await page.waitForTimeout(1300);
  await page.keyboard.press("Enter");
  await page.evaluate(() => ok(_cx.i === 2, "after the hold, Enter goes on"));
  // ✕ in the middle: what was answered stays, the card comes back
  await page.evaluate(() => {
    const ds0 = JSON.stringify(S.course.ds), q0 = S.quests.m.ok;
    endPathSession(true);
    ok(JSON.stringify(S.course.ds) === ds0 && S.course.dd["new:s0.neg"], "✕ mid-card: the answers and the day's section are kept");
    startPathSession("long", { noBonus: true });
    ok(pathSession.items.some(x => x.t === "cx" && x.part === "testout"), "the next session brings the test-out again (not finished)");
    void q0;
  });
  report(await page.evaluate(() => ({ log: __log, fails: __fails })), "keyboard · ✕ · HTML");
  if (errors.length) { console.log("ERRORS", errors.slice(0, 5)); fails++; }
  await browser.close();
}

// ── a damaged S.course ──
{
  const { browser, page, errors } = await openApp({ course: true, extra: { course: { v: 1, sec: null, ds: "x", rot: [], qm: 5, dd: null, dq: "?", day: 7, since: null, mins: "abc" } } });
  await page.evaluate(SETUP);
  await page.evaluate(() => {
    ok(S.course && typeof S.course.sec === "object" && !Array.isArray(S.course.rot) && !("mins" in S.course) && typeof S.course.day === "string", "a damaged S.course is repaired at load");
    renderHome(); renderCourse(); renderCourseSection("s0.neg"); renderDrills(); openSettingsPage("plan"); closeSettings();
    startPathSession("quick", { noBonus: true }); ok(pathSession.items.some(x => x.t === "cx"), "and Today still brings the course"); endPathSession(true);
  });
  report(await page.evaluate(() => ({ log: __log, fails: __fails })), "damaged state");
  if (errors.length) { console.log("ERRORS", errors.slice(0, 5)); fails++; }
  await browser.close();
}

// ── Grandma, Speak, another device, the day rolling over, a peek ──
{
  const { browser, page, errors } = await openApp({ course: true });
  await page.evaluate(SETUP);
  await page.evaluate(() => {
    S.prefs.grandma = true; applyPrefClasses(); backToMenu(); renderHome();
    ok(/Start/.test(document.getElementById("home").innerText), "👵 Grandma home draws");
    startPathSession("long", { noBonus: true });
    ok(toCx("testout") && !!document.getElementById("cx-run"), "👵 Grandma: the course card runs in Today");
    endPathSession(true); S.prefs.grandma = false; applyPrefClasses();
    S.prefs.speak = true;
    startPathSession("long", { noBonus: true });
    ok(toCx("testout") && !!document.getElementById("cx-run"), "🗣️ Speak, don't spell: the course card runs");
    endPathSession(true); S.prefs.speak = false;
    // another device passes the sheet while this session is open
    startPathSession("long", { noBonus: true });
    const s = pathSession, cnt = () => +(document.getElementById("p-count").textContent.split("/")[1]);
    const total0 = cnt();
    toCx("testout"); while (!_cx.done) { const c = _cx.list[_cx.i], set = cxSet(c.set), k = cxItemKind(set, c.item); if (k === "pick") cxPick((c.item.o || set.o).indexOf(c.item.a[0])); else { if (c.mode === "tiles") cxTypeInstead(); if (document.getElementById("cx-input")) { document.getElementById("cx-input").value = "falsch"; } else { document.getElementById("cx-text").value = "Ich habe kein Auto."; } cxCheckCur(); cxCheckCur(); } window.mistakeHeld = () => false; cxNext(); }
    cxFinish();
    // (the sheet card is next) — meanwhile the other device's sync arrives:
    S.course.sec["s0.neg"] = { st: 2, sh: 100, ok: { "cx.neg1": 100 }, to: S.course.sec["s0.neg"].to };
    pathNext && 0;
    ok(s.cur.t === "cx" && s.cur.part === "sheet", "on the sheet card when the sync lands");
    // re-entering the card (as after a redraw) finds it done: it skips itself
    pathNext.call && renderPathCx(s.cur);
    ok(s.cur.part === "drill" && cnt() === total0, `the passed sheet skipped itself, the drill is next, the count stayed (${total0} → ${cnt()})`);
    ok(s.items.slice(s.i + 1).some(x => x.w && !x.w.vx && !x.warm && (x.t !== "choice" || !x.fresh)), "its questions came back as word reviews after the drill");
    // the day rolls over in the middle of the drill
    const k0 = _cx.i;
    S.course.day = "2000-01-01";
    const c = _cx.list[_cx.i], set = cxSet(c.set), k = cxItemKind(set, c.item);
    if (k === "pick") cxPick((c.item.o || set.o).indexOf(c.item.a[0])); else { if (c.mode === "tiles") cxTypeInstead(); document.getElementById("cx-input").value = c.item.a[0]; cxCheckCur(); }
    ok(_cx.answered && S.course.day === studyToday(), "the day rolled over mid-drill: the answer counts on the new day");
    void k0;
    // a peek over a question, then back with the keyboard
    cxNext();
    const btnHost = document.getElementById("cx-run");
    gsPeek("cx.neg1");
    ok(!!document.getElementById("gs-peek") && _gs.mode === "peek", "the sheet opens over the question");
    gsPeekClose();
    ok(!document.getElementById("gs-peek") && document.getElementById("cx-run") === btnHost && !_cx.answered, "closed: the same question, still to answer");
  });
  // keyboard after the peek
  const a = await page.evaluate(() => { const c = _cx.list[_cx.i]; return { k: cxItemKind(cxSet(c.set), c.item), mode: c.mode }; });
  if (a.k !== "pick" && a.mode !== "tiles") {
    await page.evaluate(() => { const c = _cx.list[_cx.i]; document.getElementById("cx-input").value = c.item.a[0]; });
    await page.keyboard.press("Enter");
    await page.evaluate(() => ok(_cx.answered, "Enter checks after the peek"));
  }
  report(await page.evaluate(() => ({ log: __log, fails: __fails })), "modes · another device · rollover · peek");
  if (errors.length) { console.log("ERRORS", errors.slice(0, 5)); fails++; }
  await browser.close();
}
// ── ✍️ the writing card in Today: Enter makes a new line, the count, saved, done ──
{
  const { browser, page, errors } = await openApp({ course: true });
  await page.evaluate(SETUP);
  await page.evaluate(() => {
    S.course.last = studyToday(); S.course.since = studyToday(); // a sheet learned today: tomorrow-style day between sheets
    startPathSession("long", { noBonus: true });
    ok(!pathSession.items.some(x => x.t === "cx" && ["testout", "sheet"].includes(x.part)) && pathSession.items.some(x => x.t === "cx" && x.part === "write"), "a day between sheets: no new sheet, a writing card");
    ok(toCx("write") && !!document.getElementById("cx-jtext"), "the writing card runs in Today");
    window.__n0 = +(document.getElementById("p-count").textContent.split("/")[0]);
  });
  await page.click("#cx-jtext");
  await page.keyboard.type("Am Samstag gehe ich gern auf den Markt.");
  await page.keyboard.press("Enter");
  await page.keyboard.type("Am Sonntag arbeite ich nie, sondern ich schlafe lange und trinke Kaffee. Dann gehen wir mit den Kindern an den See, und am Abend essen wir zusammen.");
  await page.evaluate(() => {
    ok(pathSession.cur.part === "write" && /\n/.test(document.getElementById("cx-jtext").value), "Enter in the text: a new line, the card stays");
    ok(!document.getElementById("cx-jsave").disabled, "enough words: Save is on");
    document.getElementById("cx-jsave").click();
    ok(/Good job/.test(document.getElementById("cx-journal").innerText), "saved: good job");
    cxJournalDone();
    ok(S.course.dd.write === 1 && pathSession.cur && !(pathSession.cur.t === "cx" && pathSession.cur.part === "write"), "done: the session goes on, the writing part is done for today");
    const W = cxJournalList();
    ok(W.length === 1 && W[0].t.includes("\n") && S.writing[W[0].d.slice(0, 4)].length === 1, "the text kept with its lines, under its year");
    // the cloud: one doc a year, and back the same
    const docs = buildSyncDocs(S), id = STORAGE_KEY + "_writing_" + W[0].d.slice(0, 4);
    ok(docs[id] && docs[id].wr.length === 1 && !("writing" in docs[STORAGE_KEY]), "synced as its own doc (" + id + "), not in the main one");
    const snap = Object.entries(docs).map(([k, v]) => ({ id: k, data: () => JSON.parse(JSON.stringify(v)) }));
    const back = syncCloudState({ forEach: f => snap.forEach(f) }).state;
    ok(JSON.stringify(back.writing) === JSON.stringify(S.writing), "and read back from the cloud the same");
    ok(!cxTodayParts().some(p => p.part === "write"), "no second writing card today");
    endPathSession(true);
  });
  report(await page.evaluate(() => ({ log: __log, fails: __fails })), "writing in Today");
  if (errors.length) { console.log("ERRORS", errors.slice(0, 5)); fails++; }
  await browser.close();
}
console.log(fails ? `t-edge: ${fails} FAILED` : "t-edge: all passed");
process.exit(fails ? 1 : 0);
