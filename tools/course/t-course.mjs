// The course in the real app (Chromium; serve the repo root on :8765 and
// `npm install` once in tools/audio/tests, as for tools/verb-track):
//
//   • progress intact: the profile loads with every word record, verb
//     sheet and tense exactly as saved — the course adds nothing until
//     it's used, and its rules live under their own key (cx_…)
//   • Today: the course's cards come after the verb sheet, a third of the
//     way in; the count (x/N) adds their questions, only moves forward and
//     never changes its total; the test-out (missed) → the sheet → its
//     drill; a miss names its rule (title, why, the sheet a tap away) and
//     comes back once at the end; the section is done, its rules in review
//   • the next day: the rules come back (warm-up / review cards)
//   • a test-out passed: the section is done, the sheet and drill skipped,
//     its rules in light review (stage 3)
//   • every format of the runner in ☰ › 📖 Course (tiles, typed, pick,
//     answer, compose, translate, write with its checklist), the screens
//     on a phone and a desktop with nothing cut off, the 📚 book map
//   • the French app: nothing of the course anywhere
//
//   node t-course.mjs            (REAL_STATE=… to run it on a real backup)
import { openApp } from "../verb-track/browser.mjs";

let fails = 0;
const say = (r, tag) => { console.log(`== ${tag}`); r.log.forEach(l => console.log(l)); r.fails.forEach(l => console.log(l)); fails += r.fails.length; };

// Helpers inside the page: answer the runner's current question right or wrong.
const HELP = () => {
  window.mistakeHeld = () => false;
  // A text written yesterday: today's writing isn't due (the course cards are counted exactly below).
  if (typeof cxJournalSave === "function") { const d = addDays(studyToday(), -1); S.writing = { [d.slice(0, 4)]: [{ id: "t0", d, p: "w.me", t: "Ich heiße Test und wohne in Bern.", w: 7 }] }; }
  window.__log = [], window.__fails = [];
  window.ok = (c, m) => { (c ? __log : __fails).push((c ? "✓ " : "✗ ") + m); };
  window.cxAnswerCur = right => {
    const r = _cx, cur = r.list[r.i], set = cxSet(cur.set), item = cur.item, k = cxItemKind(set, item);
    if (k === "pick" || k === "respond") {
      const opts = item.o || set.o, want = right ? item.a[0] : opts.find(o => o !== item.a[0]);
      return cxPick(opts.indexOf(want));
    }
    if (k === "write" || k === "open") { document.getElementById("cx-text").value = "Ich habe keinen Fernseher und kein Auto."; return cxCheckCur(); }
    if (k === "order") { cur.picked = cur.bank.map((b, bi) => [b.i, bi]).sort((x, y) => x[0] - y[0]).map(x => x[1]); if (!right) cur.picked.reverse(); return cxCheckCur(); }
    if (cur.mode === "tiles") {
      if (right) { const words = cxTiles(set, item).tiles; const used = new Set(); cur.picked = words.map(w => { const bi = cur.bank.findIndex((t, i) => t.w === w && !used.has(i)); used.add(bi); return bi; }); }
      else cur.picked = [cur.bank.length - 1, 0];
      return cxCheckCur();
    }
    const inp = document.getElementById("cx-input");
    inp.value = right ? item.a[0] : (/\bkein\w*\b/i.test(item.a[0]) ? item.a[0].replace(/\bkein\w*\b/i, "nicht") : item.a[0].replace(/\bnicht\b/, "kein"));
    if (!right && inp.value === item.a[0]) inp.value = "Das ist falsch";
    cxCheckCur();
    if (!r.answered) cxCheckCur(); // an "almost" gets one more try
  };
  window.gsAnswerCur = right => {
    const g = _gs, cur = g.quiz.list[g.quiz.i], Q = cur.q;
    if (Q.k === "type") { document.getElementById("gs-input").value = right ? Q.a[0] : "xyz"; gsQuizCheck(); }
    else if (Q.k === "order") { cur.picked = Q.a.map((_, i) => i); if (!right) cur.picked.reverse(); gsQuizCheck(); }
    else gsQuizPick(right ? Q.a : (Q.a + 1) % Q.o.length);
  };
  window.wordsSnap = () => JSON.stringify(Object.keys(S.words).filter(k => !/^cx_/.test(k)).sort().map(k => [k, S.words[k].st, S.words[k].dueAt, S.words[k].correct, S.words[k].wrong]));
};

// ── 1 · progress intact, Today with the course ──
{
  const { browser, page, errors } = await openApp({ course: true });
  // What was saved, as it was saved — before the app touches it.
  const saved = await page.evaluate(() => JSON.parse(localStorage.getItem(APP_CONFIG.storageKey)));
  await page.evaluate(HELP);
  const r = await page.evaluate(saved => {
    // ── loaded unchanged ──
    const keys = Object.keys(saved.words);
    const same = keys.every(k => S.words[k] && S.words[k].st === saved.words[k].st && S.words[k].dueAt === saved.words[k].dueAt && S.words[k].correct === saved.words[k].correct && S.words[k].wrong === saved.words[k].wrong);
    ok(same, `every saved word record loads with its stage, due date and counts (${keys.length})`);
    ok(!Object.keys(S.words).some(k => /^cx_/.test(k)), "the course adds no review items until a section is learned");
    ok(S.course && S.course.v === 1 && Object.keys(S.course.sec).length === 0, "S.course starts empty");
    const verb0 = JSON.stringify([S.verb.sh, S.verb.tu]);
    // ── Today ──
    const before = wordsSnap();
    const parts = cxTodayParts().map(p => p.part);
    ok(parts.join() === "testout,sheet,drill", `today's course parts: ${parts}`);
    startPathSession("regular", { noBonus: true });
    const s = pathSession, cnt = () => (document.getElementById("p-count") || {}).textContent;
    const cx = s.items.filter(x => x.t === "cx");
    const iFirstCx = s.items.findIndex(x => x.t === "cx"), iSheet = s.items.findIndex(x => x.t === "sheet");
    ok(cx.length === 3 && iFirstCx > 0 && (iSheet < 0 || iSheet < iFirstCx), `3 course cards (${cx.map(x => x.part + ":" + x.qn)}), after the verb sheet, at ${iFirstCx} of ${s.items.length}`);
    const total0 = +cnt().split("/")[1];
    let guard = 0, totals = new Set([total0]), last = 0, mono = true, seq = [];
    const tick = () => { const c = cnt(); totals.add(+c.split("/")[1]); const pos = +c.split("/")[0]; if (pos < last) mono = false; last = pos; return c; };
    const m0 = S.quests.m.ok;
    let toMissed = 0, ruleBox = "", peeked = false, drillMissSeen = false, reaskSeen = false, plan = 0;
    while (pathSession && s.cur && guard++ < 600) {
      const it = s.cur;
      if (it.t === "repairOffer" || s.repairPhase) break;
      if (it.t === "cx") {
        if (it.part === "sheet") {
          ok(_gs && _gs.mode === "path" && _gs.sh.cx, "the sheet opens in the viewer, in Today");
          while (_gs.step < _gs.steps.length) gsGo(1);
          while (!_gs.quiz.done) { seq.push(tick()); gsAnswerCur(true); gsQuizNext(); }
          ok(cxSheetPassed("cx.neg1"), "sheet passed in Today");
          ok(Object.keys(S.course.sec["s0.neg"]).length && S.course.sec["s0.neg"].st === 2, "section: sheet passed (st 2)");
          ok(cxSection("s0.neg").rules.every(rr => S.words["cx_" + rr] && S.words["cx_" + rr].st === 1 && S.words["cx_" + rr].lrn), "its 4 rules are introduced (stage 1, to confirm)");
          seq.push("|"); gsQuizFinish(); continue;
        }
        if (!_cx) { pathNext(); continue; }
        const kind = _cx.opts.kind;
        let k = 0;
        while (!_cx.done) {
          seq.push(tick());
          const cur = _cx.list[_cx.i];
          if (!cur.first) reaskSeen = true;
          // test-out: miss two (it fails) · drill: miss the 3rd once
          const right = kind === "testout" ? !(cur.first && k < 2) : !(cur.first && k === 2);
          cxAnswerCur(right);
          if (!right && kind === "testout") toMissed++;
          if (!right && kind === "drill" && cur.first) {
            const fb = document.getElementById("cx-fb");
            ruleBox = fb ? fb.innerText : "";
            drillMissSeen = /✗/.test(ruleBox) && /📏/.test(ruleBox) && !!fb.querySelector(".cx-why") && ruleBox.split("\n").filter(l => l.trim()).length <= 4;
            const btn = fb && fb.querySelector(".cx-see");
            if (btn) { btn.click(); peeked = !!document.getElementById("gs-peek") && _gs && _gs.mode === "peek" && _gs.sh.cx; gsPeekClose(); }
          }
          k++;
          cxNext();
        }
        if (kind === "testout") ok(!cxSecDone("s0.neg") && S.course.sec["s0.neg"].to < 100 && S.course.sec["s0.neg"].st === 1, `test-out with 2 misses: not passed (${S.course.sec["s0.neg"].to}%) → the sheet is next`);
        if (kind === "drill") ok(cxSecDone("s0.neg"), "after its drill the section is done");
        seq.push("|"); cxFinish(); continue;
      }
      tick();
      if (it.t === "learn") { pathNext(); continue; }
      if (it.t === "bonus") { pathBonus(false); continue; }
      if (it.t === "sheet") { gsQuizFinish && pathNext(); continue; }
      pathNext();
    }
    plan = S.quests.m.ok - m0;
    ok(toMissed === 2, "the test-out was missed twice");
    ok(drillMissSeen, `a drill miss, in a few lines: the fix marked, why, the rule (a tap opens its sheet): "${ruleBox.replace(/\n+/g, " · ").slice(0, 160)}"`);
    ok(peeked, "📏 the rule's name opens the course sheet over the exercise");
    ok(reaskSeen, "the missed item came back once at the end");
    ok(totals.size === 1, `counter total never changed (${[...totals]})`);
    ok(mono, "counter only moves forward");
    ok(plan > 10, `the course's right answers count in today's plan (+${plan})`);
    ok(S.course.dd["sec:s0.neg"] && S.course.dd["new:s0.neg"], "the day knows the section was today's");
    ok(JSON.stringify([S.verb.sh, S.verb.tu]) === verb0, "verb sheets and tenses unchanged");
    const b = JSON.parse(before), a = new Map(JSON.parse(wordsSnap()).map(x => [x[0], x]));
    ok(b.every(x => a.has(x[0]) && (a.get(x[0])[1] || 0) >= (x[1] || 0) && a.get(x[0])[3] === x[3] && a.get(x[0])[4] === x[4]), `no word record lost or lowered by the course's cards (${b.length})`);
    __log.push("  counter in the course cards: " + seq.join(" "));
    // ── the reports ──
    const rep = buildUsageReport(), ll = buildLearningReport();
    ok(/Course: 1 section\(s\) done \(nicht or kein\?\)/.test(rep), "the usage report has the course line");
    ok(/## GRAMMAR COURSE/.test(ll) && /Rules in my reviews: .*kein/.test(ll) && /grammar course: broke a rule/.test(ll), "the learning log has the course, its rules and the grammar mistakes");
    // ── the Today line never says "0 rules" ──
    backToMenu(); renderHome();
    const line = (document.querySelector(".cx-today") || {}).innerText || "";
    ok(!/\b0 rules?\b/.test(line), `the Today line says what's left, never "0 rules" ("${line}")`);
    // ── what a second session today brings: nothing new ──
    const parts2 = cxTodayParts().map(p => p.part);
    ok(!parts2.includes("sheet") && !parts2.includes("drill") && !parts2.includes("testout"), `a second session today: no new section (${parts2})`);
    // ── the next day ──
    // (a day later: what's due by tomorrow is due now)
    Object.keys(CX.rules).forEach(r => { const ws = S.words["cx_" + r]; if (ws && ws.dueAt && ws.dueAt < Date.now() + 864e5 * 1.5) ws.dueAt = Date.now() - 1000; });
    S.course.day = "2000-01-01"; cxRollDay();
    const d = cxDueRules(), parts3 = cxTodayParts();
    ok(d.fix.length + d.due.length > 0 && parts3.some(p => p.part === "warm" || p.part === "review"), `the next day its rules come back (${parts3.map(p => p.part + ":" + (p.rules || []).length)})`);
    ok(!parts3.some(p => p.part === "sheet"), "and no sheet: the next section isn't built yet");
    return { log: __log, fails: __fails };
  }, saved);
  say(r, "Today: progress intact, test-out → sheet → drill");
  if (errors.length) { console.log("ERRORS", errors.slice(0, 5)); fails++; }
  await browser.close();
}

// ── 2 · a test-out passed ──
{
  const { browser, page, errors } = await openApp({ course: true });
  await page.evaluate(HELP);
  const r = await page.evaluate(() => {
    startPathSession("regular", { noBonus: true });
    const s = pathSession;
    const plan = pathEnsurePlan(), t0 = plan.target, cut0 = plan.cx && plan.cx.cut && plan.cx.cut["s0.neg"];
    let guard = 0, skipped = [];
    while (pathSession && s.cur && guard++ < 600) {
      const it = s.cur;
      if (it.t === "repairOffer" || s.repairPhase) break;
      if (it.t === "cx") {
        if (it.part !== "testout") { skipped.push(it.part + ":" + it.qn); pathNext(); continue; }
        while (!_cx.done) { cxAnswerCur(true); cxNext(); }
        ok(_cx.result.passed, "8/8: tested out");
        cxFinish(); continue;
      }
      if (it.t === "bonus") { pathBonus(false); continue; }
      pathNext();
    }
    ok(cxSecDone("s0.neg") && S.course.sec["s0.neg"].to === 100, "the section is done by the test-out");
    ok(cut0 > 0 && !(plan.cx.cut || {})["s0.neg"] && plan.target <= t0 && plan.target === planTarget(plan.reviews, plan.pace, (plan.vx ? vxPlanTarget(plan.vx) : 0) + cxPlanTarget(plan.cx)), `today's plan stops counting the skipped sheet and drill (${t0} → ${plan.target})`);
    ok(skipped.length === 0, `its sheet and drill skipped themselves (${skipped})`);
    ok(cxSection("s0.neg").rules.every(r => (S.words["cx_" + r] || {}).st === 3), "its rules are in light review (stage 3)");
    renderCourseSection("s0.neg");
    ok(/Tested out/.test(document.getElementById("main-screen").innerText), "the section says Tested out");
    return { log: __log, fails: __fails };
  });
  say(r, "a test-out passed");
  if (errors.length) { console.log("ERRORS", errors.slice(0, 5)); fails++; }
  await browser.close();
}

// ── 2b · the sheet missed in Today: its drill still comes, as practice ──
{
  const { browser, page, errors } = await openApp({ course: true });
  await page.evaluate(HELP);
  const r = await page.evaluate(() => {
    startPathSession("regular", { noBonus: true });
    const s = pathSession, cnt = () => (document.getElementById("p-count") || {}).textContent;
    const totals = new Set([+cnt().split("/")[1]]);
    let guard = 0, drillRan = false;
    while (pathSession && s.cur && guard++ < 600) {
      const it = s.cur;
      if (it.t === "repairOffer" || s.repairPhase) break;
      totals.add(+cnt().split("/")[1]);
      if (it.t === "cx" && it.part === "sheet") {
        while (_gs.step < _gs.steps.length) gsGo(1);
        let k = 0; while (!_gs.quiz.done) { gsAnswerCur(k++ !== 0); gsQuizNext(); }
        ok(!cxSheetPassed("cx.neg1"), "the sheet missed once in Today: not passed");
        gsQuizFinish(); continue;
      }
      if (it.t === "cx" && _cx) {
        while (!_cx.done) { cxAnswerCur(_cx.opts.kind === "drill"); cxNext(); }
        if (_cx.opts.kind === "drill") { drillRan = true; ok(/comes back tomorrow/.test(document.getElementById("cx-run").innerText), "the drill says the sheet comes back tomorrow"); }
        cxFinish(); continue;
      }
      if (it.t === "bonus") { pathBonus(false); continue; }
      pathNext();
    }
    ok(drillRan && !cxSecDone("s0.neg"), "its drill ran as practice; the section isn't done");
    ok(totals.size === 1, `the count never changed (${[...totals]})`);
    ok(!Object.keys(S.words).some(k => /^cx_/.test(k)), "no rule went into review (the sheet isn't passed)");
    const p = cxTodayParts().map(x => x.part);
    ok(!p.includes("sheet") && !p.includes("drill"), `nothing more of it today (${p})`);
    S.course.day = "2000-01-01";
    ok(cxTodayParts().map(x => x.part).join() === "sheet,drill", "tomorrow: the sheet again, then the drill");
    return { log: __log, fails: __fails };
  });
  say(r, "the sheet missed in Today");
  if (errors.length) { console.log("ERRORS", errors.slice(0, 5)); fails++; }
  await browser.close();
}

// ── 3 · every format, the screens, the book map (phone + desktop) ──
for (const [w, h, tag] of [[390, 844, "phone"], [1280, 900, "desktop"]]) {
  const { browser, page, errors } = await openApp({ course: true, width: w, height: h });
  await page.evaluate(HELP);
  const noOverflow = async name => {
    const o = await page.evaluate(() => { const W = document.documentElement.clientWidth; return [...document.querySelectorAll("#main-screen *")].filter(e => { const b = e.getBoundingClientRect(); return b.width && b.right > W + 1; }).map(e => e.className || e.tagName).slice(0, 3); });
    await page.evaluate(([n, o]) => ok(!o.length, `${n}: nothing sticks out (${o})`), [`${tag} ${name}`, o]);
  };
  await page.evaluate(() => renderCourse()); await noOverflow("Course");
  await page.evaluate(() => renderCourseSection("s0.neg")); await noOverflow("section");
  await page.evaluate(() => renderCourseSection("s1.dat")); await noOverflow("a coming section");
  await page.evaluate(() => { renderCourseSection("s0.verbs"); ok(/verb track/.test(document.getElementById("main-screen").innerText), "a verb-track section lists its verb sheets"); });
  await page.evaluate(() => renderDrills()); await noOverflow("Drills");
  // every drill set through the runner, right then wrong
  await page.evaluate(() => {
    const seen = new Set();
    CX.sections.forEach(sec => sec.sets.forEach(id => {
      renderCourseDrill(sec.id, id);
      let k = 0;
      while (!_cx.done && k < 40) {
        const cur = _cx.list[_cx.i];
        seen.add(cxItemKind(cxSet(cur.set), cur.item) + ":" + cur.mode);
        const html = document.getElementById("cx-run").innerHTML;
        if (/undefined|NaN|\[object/.test(html)) ok(false, `${id}: broken text in the card`);
        cxAnswerCur(k % 3 !== 1); cxNext(); k++;
      }
      ok(_cx.done && /right first time|Tested|Nothing/.test(document.getElementById("cx-run").innerText), `${id}: runs to its result`);
    }));
    ok(["pick:typed", "type:typed", "transform:tiles", "answer:typed", "compose:tiles", "translate:typed", "write:typed"].every(k => seen.has(k)), `formats met: ${[...seen].sort()}`);
    // the formats the pilot doesn't use yet: order a conversation, pick a response, complete freely
    CX.sets["dz.test"] = { id: "dz.test", sec: "s0.neg", t: "order", title: "Formats", how: "—", items: [
      { q: "Put the conversation in order.", a: ["Grüezi, wie geht's?", "Gut, danke. Und Ihnen?", "Auch gut, danke."], r: ["neg.kein"] },
      { k: "respond", q: "Haben Sie heute Zeit?", o: ["Nein, leider nicht.", "Ja, ich heiße Tom."], a: ["Nein, leider nicht."], r: ["neg.kein"] },
      { k: "open", q: "Ich komme heute nicht, weil ___", model: ["Ich komme heute nicht, weil ich krank bin."], check: ["the verb goes last after weil"], r: ["neg.kein"] } ] };
    const host = document.createElement("div"); document.getElementById("main-screen").appendChild(host);
    for (const right of [true, false]) {
      cxRun(host, CX.sets["dz.test"].items.map((item, i) => ({ set: "dz.test", i, item })), { mode: "menu", kind: "practice" });
      const kinds = [];
      while (!_cx.done) { const cur = _cx.list[_cx.i]; if (cur.first) kinds.push(cxItemKind(CX.sets["dz.test"], cur.item)); cxAnswerCur(right); ok(_cx.answered, `${kinds[kinds.length - 1]}: answered (${right ? "right" : "wrong"})`); cxNext(); }
      ok(_cx.result.right === (right ? 3 : 1) && kinds.join() === "order,respond,open", `order · respond · open (your own writing: saved, never wrong): ${_cx.result.right}/3 ${right ? "right" : "wrong"}`);
    }
    delete CX.sets["dz.test"]; host.remove();
    // tiles become typed once a set is going well
    renderCourseDrill("s0.neg", "d5.4"); ok(_cx.list[0].mode === "typed", "d5.4 after a few right: typed, not tiles");
    // the sheet in the menu: read, quiz, pass
    renderCourseSheet("cx.neg1"); while (_gs.step < _gs.steps.length) gsGo(1);
    while (!_gs.quiz.done) { gsAnswerCur(true); gsQuizNext(); }
    ok(cxSheetPassed("cx.neg1") && /Drill it/.test(document.getElementById("main-screen").innerText), "the sheet passed in ☰ › Course offers its drill");
    renderCourseDrill(null, null, "weak"); ok(_cx.list.length > 0, `weak rules drill: ${_cx.list.length} items`);
    renderCourseDrill(null, null, "mixed"); ok(_cx.list.length > 0, `mixed drill: ${_cx.list.length} items`);
  });
  await noOverflow("runner");
  await page.evaluate(() => renderCourseBook());
  await page.waitForFunction(() => /exercises covered/.test((document.getElementById("cx-book") || {}).innerText || ""), null, { timeout: 8000 }).catch(() => {});
  await page.evaluate(() => ok(/exercises covered/.test(document.getElementById("cx-book").innerText), "the book map loads the blueprint"));
  await noOverflow("book map");
  await page.evaluate(() => renderCourseChapter("c5"));
  await page.waitForFunction(() => /Übung 5\.4/.test(document.getElementById("main-screen").innerText), null, { timeout: 8000 }).catch(() => {});
  await page.evaluate(() => { const t = document.getElementById("main-screen").innerText; ok(/Übung 5\.4[\s\S]*mirrored/.test(t) && /Übung 5\.1[\s\S]*generated/.test(t) && /planned/.test(t), "chapter 5: mirrored, generated and planned exercises"); });
  await page.evaluate(() => renderCourseChapter("c28"));
  await page.waitForFunction(() => /Übung 28\.2/.test(document.getElementById("main-screen").innerText), null, { timeout: 8000 }).catch(() => {});
  await page.evaluate(() => { const t = document.getElementById("main-screen").innerText; ok(/Negation[\s\S]*Übung 28\.2[\s\S]*mirrored/.test(t), "chapter 28: Negation's exercises mirrored"); });
  await noOverflow("chapter");
  // ✍️ the writing journal: a live count, saved as it is, in the learning log, ticked when corrected
  await page.evaluate(() => { ok(cxJournalList().some(e => /^drill:dw\.neg/.test(e.p) && e.q), "the drills' own writing was saved for Claude, with its task"); S.writing = {}; renderJournal(); ok(/Nothing yet/.test(document.getElementById("main-screen").innerText), "✍️ My writing: empty (texts cleared for this check)"); });
  await noOverflow("Writing (empty)");
  await page.evaluate(() => cxJournalOpen(document.getElementById("main-screen"), { mode: "menu" }));
  await noOverflow("Writing prompt");
  await page.click("#cx-jtext");
  await page.keyboard.type("Ich heiße <b>Raul</b> und wohne in Zürich.");
  await page.evaluate(() => {
    ok(document.getElementById("cx-jsave").disabled && /^9 \/ 30 words$/.test(document.getElementById("cx-wc").textContent), `under the minimum: Save waits (${document.getElementById("cx-wc").textContent})`);
    // leave and come back: the draft is still there
    const pid = _cj.p.id; renderJournal(); cxJournalOpen(document.getElementById("main-screen"), { mode: "menu", prompt: pid });
    ok(/wohne in Zürich/.test(document.getElementById("cx-jtext").value), "left and back: the draft is kept");
  });
  await page.click("#cx-jtext"); await page.keyboard.press("End");
  await page.keyboard.type(" Meine Wohnung hat drei Zimmer, aber wir haben keinen Balkon. Ich arbeite nicht am Montag, sondern am Dienstag. Am Abend koche ich gern mit meiner Frau.");
  await page.evaluate(() => ok(!document.getElementById("cx-jsave").disabled && /words ✓/.test(document.getElementById("cx-wc").textContent), `enough words: Save is on (${document.getElementById("cx-wc").textContent})`));
  await page.click("#cx-jsave");
  await page.evaluate(() => {
    const t = document.getElementById("main-screen").innerText;
    ok(/Good job — 3\d words/.test(t) && /learning log/.test(t), "saved: good job, it's in the learning log");
    const L = buildLearningReport();
    ok(/## MY WRITING \(1 text since/.test(L) && /Please correct/.test(L) && /Ich heiße <b>Raul<\/b>/.test(L) && /"writing":\[\[/.test(L), "the learning log carries the text (and its JSON)");
    { const m = buildUsageReport().match(/✍️(\d+) \((\d+)w\)/); ok(m && +m[1] >= 2 && +m[2] >= 30, `the usage report counts the day's texts (the drills' and this one) and their words (${m && m[0]})`); }
    cxJournalDone();
    const m = document.getElementById("main-screen");
    ok(/to correct/.test(m.innerText) && !m.querySelector(".cx-jbody b"), "listed, to correct — the HTML typed shows as text");
  });
  await noOverflow("Writing (a text)");
  await page.evaluate(() => {
    document.querySelector(".cx-jentry").open = true;
    document.querySelector(".cx-jentry .g-sec-btn").click();
    const L2 = buildLearningReport();
    ok(/corrected ✓/.test(document.getElementById("main-screen").innerText) && !/Please correct/.test(L2) && /Already corrected[^\n]*Über mich|Already corrected[^\n]*\d+w ✓/.test(L2), "ticked as corrected: kept, listed by date as corrected in the learning log");
    ok(/Already corrected[\s\S]*Ich heiße <b>Raul<\/b>/.test(cxJournalCopyText()), "and ✍️ Copy my texts still has it in full");
  });
  await page.evaluate(() => { openSettings("menu"); ok(/Course/.test(document.getElementById("settings-panel").innerText) && !/Drills/.test(document.getElementById("settings-panel").innerText), "☰ has 📖 Course (Drills live inside it — one row, not two)"); closeSettings();
    openSettingsPage("plan"); ok(/Grammar course/.test(document.getElementById("settings-panel").innerText) && /Grammar course[\s\S]*set by your finish date/.test(document.getElementById("settings-panel").innerText) && !/Minutes a day/.test(document.getElementById("settings-panel").innerText), "⚙️ Study plan: the grammar pace, set by the finish date (no minutes to pick)"); closeSettings(); });
  const r = await page.evaluate(() => ({ log: __log, fails: __fails }));
  say(r, `screens · ${tag}`);
  if (errors.length) { console.log("ERRORS", errors.slice(0, 5)); fails++; }
  await browser.close();
}

// ── 4 · the French app: nothing of the course ──
{
  const { browser, page, errors } = await openApp({ app: "fr", course: true });
  const r = await page.evaluate(() => {
    const log = [], f = [];
    const ok = (c, m) => (c ? log : f).push((c ? "✓ " : "✗ ") + m);
    ok(typeof cxOn === "undefined" && typeof renderCourse === "undefined" && typeof CX === "undefined", "no course code loaded");
    ok(!S.course, "no S.course");
    ok(settingsMenuHtml().includes("Grammar") && !settingsMenuHtml().includes("Course"), "☰ keeps 📐 Grammar");
    startPathSession("regular", { noBonus: true });
    ok(!pathSession.items.some(x => x.t === "cx"), "no course cards in Today");
    endPathSession(true);
    ok(!Object.keys(S.words).some(k => /^cx_/.test(k)), "no cx_ items");
    return { log, fails: f };
  });
  say(r, "French app");
  if (errors.length) { console.log("ERRORS", errors.slice(0, 5)); fails++; }
  await browser.close();
}
console.log(fails ? `t-course: ${fails} FAILED` : "t-course: all passed");
process.exit(fails ? 1 : 0);
