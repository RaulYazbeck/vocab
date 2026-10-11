// Every button of the verb track, pressed for real (mouse clicks, keys,
// taps) on a phone and a desktop: the switch, Grammar, units, sheets,
// quizzes (right, wrong, empty, umlaut slip, double taps, leaving
// halfway), "see it in the sheet" and back, results, mastery, and a
// Today session with its sheet, verb cards and the 📖 peek. Collects
// page errors, horizontal overflow and dead buttons on every screen.
//   REAL_STATE=… node t-buttons.mjs   (or the test profile)
import { openApp } from "./browser.mjs";
const SIZES = (process.env.SIZES || "390x844,1280x900").split(",").map(s => s.split("x").map(Number));
let pass = 0, fail = 0;
const ok = (c, m, x = "") => { if (c) pass++; else { fail++; console.log("  ✗", m, x); } };
const OUT = process.env.OUT || "";
for (const [W, H] of SIZES) {
  const { browser, page, errors } = await openApp({ width: W, height: H });
  const tag = `${W}px`;
  const shot = async n => { if (OUT) { await page.waitForTimeout(250); await page.screenshot({ path: `${OUT}/${W}-${n}.png` }); } };
  const ev = (f, a) => page.evaluate(f, a);
  const wait = ms => page.waitForTimeout(ms);
  const click = async (sel, what) => {
    const el = await page.$(sel);
    ok(!!el, `${tag}: ${what} is there`, sel);
    if (!el) return false;
    const box = await el.boundingBox();
    ok(box && box.width >= 24 && box.height >= 24, `${tag}: ${what} is big enough to tap`, JSON.stringify(box));
    await el.click();
    await wait(120);
    return true;
  };
  // No sideways scrolling, ever.
  const noOverflow = async where => {
    const o = await ev(() => ({ sw: document.documentElement.scrollWidth, w: window.innerWidth }));
    ok(o.sw <= o.w + 1, `${tag}: no sideways scroll on ${where}`, JSON.stringify(o));
  };
  const Q = () => ev(() => { const q = _gs && _gs.quiz; if (!q || q.done) return null; const c = q.list[q.i]; return { k: c.q.k, a: c.q.a, o: c.q.o, n: q.n, i: q.i, len: q.list.length, fr: q.firstRight, answered: q.answered, first: c.first }; });
  // Answer the current question with real clicks / typing.
  const answer = async right => {
    const q = await Q();
    if (!q) return null;
    if (q.k === "type") {
      await page.fill("#gs-input", right ? q.a[0] : "falsch");
      await page.press("#gs-input", "Enter");
    } else if (q.k === "order") {
      const idx = q.a.map((_, i) => i); if (!right) idx.reverse();
      for (const b of idx) await page.click(`#gs-bank .gs-tok[data-b="${b}"]`);
      await page.click("#gs-check");
    } else {
      const want = right ? q.a : (q.a + 1) % q.o.length;
      await page.click(`.gs-opt[data-o="${want}"]`);
    }
    await wait(150);
    return q;
  };
  const next = async () => { await wait(900); await page.click("#gs-qnext"); await wait(150); };
  const finishQuiz = async () => { for (let k = 0; k < 30; k++) { const q = await Q(); if (!q) break; await answer(true); await next(); } };

  // ── 1 · the switch, from Today ──
  const off = await ev(() => !vxOn());
  if (off) {
    await click(".tc-vx", "Today's ‘New verb system’ button");
    await page.waitForSelector(".vx-act");
    await noOverflow("the switch screen");
    await shot("01-switch");
    await click(".vx-act .g-big-btn", "Switch button");
    await page.waitForSelector(".gr-units");
  } else await ev(() => renderGrammar());
  ok(await ev(() => vxOn()), `${tag}: switched on`);
  await noOverflow("Grammar");
  await shot("02-grammar");
  // ── 2 · every tense opens and comes back ──
  const units = await ev(() => VX_UNITS.map(u => u.id));
  for (let i = 0; i < units.length; i++) {
    await page.click(`.gr-unit:nth-of-type(${i + 1})`);
    await page.waitForSelector(".gr-uhead");
    ok(await ev(u => document.querySelector(".gr-uhead h2").innerText === VX_UNIT[u].name, units[i]), `${tag}: unit ${units[i]} opens`);
    await noOverflow(`unit ${units[i]}`);
    await page.click(".screen-top .back-btn");
    await page.waitForSelector(".gr-units");
  }
  // ── 3 · a sheet: Next, ‹, keys, chips ──
  await ev(() => renderGrammarUnit("pr"));
  await click(".gr-sheet", "first sheet");
  await page.waitForSelector("#gs-viewer");
  const steps = await ev(() => _gs.steps.length);
  await click("#gs-next", "Next ›");
  await click(".gs-prev", "‹ back");
  ok(await ev(() => _gs.step === 0), `${tag}: ‹ goes back a step`);
  await page.keyboard.press("ArrowRight");
  ok(await ev(() => _gs.step === 1), `${tag}: → key moves on`);
  await page.keyboard.press("ArrowLeft");
  ok(await ev(() => _gs.step === 0), `${tag}: ← key goes back`);
  for (let s = 0; s < steps; s++) {
    const id = await ev(() => _gs.steps[_gs.step] && _gs.steps[_gs.step].id);
    if (id === "table") {
      const chip = await page.$(".gs-chip");
      if (chip) { await chip.click(); await wait(100); ok(await ev(() => document.activeElement && document.activeElement.classList.contains("gs-chip")), `${tag}: a verb chip takes the tap (meaning shows)`); }
      await noOverflow("the table");
      await shot("03-table");
    }
    await page.click("#gs-next"); await wait(120);
  }
  ok(await ev(() => !!_gs.quiz && !_gs.quiz.done), `${tag}: "Quiz ▶" starts the quiz`);
  await shot("04-quiz");
  // ── 4 · edge cases in a quiz ──
  // empty answer: nothing recorded
  let q = await Q();
  if (q.k === "type") {
    await page.fill("#gs-input", ""); await page.click("#gs-check");
    ok(!(await Q()).answered, `${tag}: an empty answer is not graded`);
  }
  // the first question wrong → see it in the sheet → wander → back
  q = await answer(false);
  const afterMiss = await Q();
  ok(afterMiss.answered && afterMiss.len === q.len + 1, `${tag}: a miss is recorded once, comes back at the end`);
  // Next right after a miss is held a moment (you read why)
  await page.click("#gs-qnext"); await wait(60);
  ok((await Q()).i === afterMiss.i, `${tag}: Next waits a moment after a miss`);
  await shot("05-miss");
  await click(".gs-qsee", "See it in the sheet");
  ok(await ev(() => !!_gs.review && !!document.querySelector(".gs-hl")), `${tag}: the sheet opens at the point, lit up`);
  await shot("06-review");
  await noOverflow("the review");
  for (const lbl of ["Next part", "Next part", "Previous part"]) {
    const b = await page.$(`.gs-nav3 button[aria-label="${lbl}"]:not([disabled])`);
    if (b) { await b.click(); await wait(100); }
  }
  ok(await ev(() => !!_gs.review), `${tag}: ‹ › move around the sheet`);
  await click("#gs-back-quiz", "Back to the quiz");
  const back = await Q();
  ok(back.answered && back.i === afterMiss.i && back.len === afterMiss.len && back.fr === afterMiss.fr, `${tag}: back in the quiz, nothing lost`, JSON.stringify([afterMiss, back]));
  await next();
  ok((await Q()).i === back.i + 1, `${tag}: Next goes on after the review`);
  // double tap on an answer: graded once
  q = await Q();
  if (q.k !== "type" && q.k !== "order") {
    await page.dblclick(`.gs-opt[data-o="${q.a}"]`); await wait(150);
    const d = await Q(); ok(d.fr === q.fr + 1 && d.answered, `${tag}: a double tap counts once`, JSON.stringify([q, d]));
    await next();
  } else if (q.k === "type") {
    await page.fill("#gs-input", q.a[0]); await page.press("#gs-input", "Enter"); await page.press("#gs-input", "Enter");
    await wait(200);
    const d = await ev(() => _gs.quiz.firstRight); ok(d === q.fr + 1, `${tag}: Enter twice counts once`);
    const still = await Q(); if (still && still.answered) await next();
  } else { await answer(true); await next(); }
  // an umlaut slip on a typed question gives one more try
  q = await Q();
  if (q && q.k === "type" && /[äöü]/.test(q.a[0])) {
    await page.fill("#gs-input", q.a[0].replace(/ä/g, "a").replace(/ö/g, "o").replace(/ü/g, "u")); await page.press("#gs-input", "Enter"); await wait(150);
    ok(!(await Q()).answered && /umlaut/.test(await ev(() => document.getElementById("gs-qfb").innerText)), `${tag}: an umlaut slip → "mind the umlaut", try again`);
  }
  await finishQuiz();
  await shot("07-result");
  const res = await ev(() => document.getElementById("gs-step").innerText);
  ok(/Not yet/.test(res) && /every question right the first time/.test(res), `${tag}: one miss → "Not yet", and why`, res.slice(0, 120));
  // from the result into the sheet and back
  await click(".gs-miss", "a missed point on the result");
  await click("#gs-back-quiz", "Back (to the result)");
  ok(/Not yet/.test(await ev(() => document.getElementById("gs-step").innerText)), `${tag}: back on the result`);
  // Retake: a new quiz straight away
  await click(".gs-result-act .g-sec-btn:nth-child(2)", "Retake");
  ok(await ev(() => !!_gs.quiz && !_gs.quiz.done && _gs.quiz.i === 0), `${tag}: Retake starts a fresh quiz`);
  // leave halfway: back button → unit; nothing passed, sheet reopens clean
  await answer(true); await next();
  await page.click(".screen-top .back-btn"); await page.waitForSelector(".gr-uhead");
  ok(await ev(() => !vxSheetPassed("pr1")), `${tag}: leaving a quiz halfway passes nothing`);
  await click(".gr-sheet", "the sheet again");
  ok(await ev(() => _gs.step === 0 && !_gs.quiz), `${tag}: it reopens at the start`);
  // keyboard only: → to the quiz, digits / Enter to answer
  for (let s = 0; s < steps; s++) { await page.keyboard.press("ArrowRight"); await wait(60); }
  ok(await ev(() => !!_gs.quiz), `${tag}: keys alone reach the quiz`);
  for (let k = 0; k < 15; k++) {
    q = await Q(); if (!q) break;
    if (q.k === "type") { await page.fill("#gs-input", q.a[0]); await page.keyboard.press("Enter"); }
    else if (q.k === "order") { for (let b = 0; b < q.a.length; b++) await page.click(`#gs-bank .gs-tok[data-b="${b}"]`); await page.click("#gs-check"); }
    else { const pos = await ev(() => _gs.quiz.list[_gs.quiz.i].order.indexOf(_gs.quiz.list[_gs.quiz.i].q.a)); await page.keyboard.press(String(pos + 1)); }
    await wait(250); await page.keyboard.press("Enter"); await wait(150);
  }
  const passedRes = await ev(() => document.getElementById("gs-step").innerText);
  ok(/Sheet passed/.test(passedRes) && await ev(() => vxSheetPassed("pr1")), `${tag}: all right first time → passed`, passedRes.slice(0, 80));
  await click(".gs-result-act .g-big-btn", "Next sheet ›");
  ok(await ev(() => _gs && _gs.sh.id === "pr2"), `${tag}: Next sheet opens the next one`);
  // ── 5 · mastery ──
  await ev(() => renderGrammarUnit("im"));
  ok(await ev(() => document.querySelector(".gr-mastery").disabled), `${tag}: mastery locked before the sheets`);
  await ev(() => { vxSheetIds("pr").forEach(id => { S.verb.sh[id] = 100; }); renderGrammarUnit("pr"); });
  await click(".gr-mastery", "Mastery quiz");
  ok(await ev(() => !!_gs.mastery && _gs.quiz.n === gqMasterySize("pr")), `${tag}: the mastery quiz opens`);
  await noOverflow("the mastery quiz");
  await shot("08-mastery");
  await answer(false); await next();
  await finishQuiz();
  ok(/Not yet/.test(await ev(() => document.getElementById("gs-step").innerText)) && !(await ev(() => vxMastered("pr"))), `${tag}: a miss → not mastered`);
  await click(".gs-result-act .g-sec-btn", "Retake — new questions");
  await finishQuiz();
  ok(await ev(() => vxMastered("pr")), `${tag}: 100% → mastered`);
  await shot("09-mastered");
  await click(".gs-result-act .g-big-btn", "Done");
  ok(await ev(() => /Mastered/.test(document.querySelector(".gr-mastery").innerText)), `${tag}: the card says Mastered`);
  // ── 6 · Today: the sheet item, verb cards, 📖 peek ──
  await ev(() => { backToMenu(); });
  await wait(300);
  await shot("10-today");
  await click(".tc-start", "Today's Start ▶");
  await wait(300);
  for (let k = 0; k < 60; k++) {
    const t = await ev(() => { const it = pathSession && pathSession.cur; return it ? it.t + (it.w && it.w.vx ? ":vx" : "") : "end"; });
    if (t === "end") break;
    if (t === "sheet") {
      for (let s = 0; s < 8; s++) { const r = await ev(() => _gs && !_gs.quiz); if (!r) break; await page.click("#gs-next"); await wait(100); }
      await answer(false); await click(".gs-qsee", "See it in the sheet (Today)"); await click("#gs-back-quiz", "Back to the quiz (Today)");
      ok(await ev(() => pathSession && pathSession.cur && pathSession.cur.t === "sheet" && _gs.quiz.answered), `${tag}: Today: back to the quiz, still in the session`);
      await next(); await finishQuiz();
      await shot("11-today-sheet-result");
      await click("#gs-done", "Later / Continue");
      ok(await ev(() => pathSession && pathSession.cur && pathSession.cur.t !== "sheet" || !pathSession), `${tag}: the session moves on after the sheet`);
      continue;
    }
    if (t === "learn:vx") { await shot("12-learn"); await ev(() => pathNext()); continue; }
    if (t === "typed:vx") {
      await shot("13-verb-card");
      await click("#p-hint-btn", "💡 Hint");
      await page.fill("#p-input", "xyz"); await click("#p-check", "Check");
      await wait(300);
      const peek = await page.$('button[title="Open the sheet"]');
      if (peek) {
        await peek.click(); await wait(200);
        ok(await ev(() => !!document.getElementById("gs-peek")), `${tag}: 📖 opens the sheet over the card`);
        await shot("14-peek");
        for (let s = 0; s < 6; s++) { if (!(await page.$("#gs-next"))) break; await page.click("#gs-next"); await wait(80); }
        const backBtn = await page.$("#gs-peek .gs-next");
        if (backBtn) await backBtn.click(); await wait(150);
        ok(await ev(() => !document.getElementById("gs-peek") && pathSession && pathSession.answered), `${tag}: back to the exercise, its feedback still there`);
      }
      await wait(900); await ev(() => pathGo());
      break;
    }
    await ev(() => { const s = pathSession; s.answered = false; pathNext(); });
  }
  // ── 7 · resizing mid-quiz ──
  await ev(() => { renderGrammarSheet("pr4"); while (_gs.step < _gs.steps.length) gsGo(1); });
  await page.setViewportSize({ width: W > 500 ? 390 : 1280, height: 844 }); await wait(200);
  await noOverflow("a quiz after resizing");
  await page.setViewportSize({ width: W, height: H });
  ok(!errors.length, `${tag}: no page errors`, errors.slice(0, 5).join(" | "));
  await browser.close();
}
console.log(`buttons: ${pass} passed, ${fail} failed`);
process.exit(fail ? 1 : 0);
