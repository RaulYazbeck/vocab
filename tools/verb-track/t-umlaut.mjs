// The umlaut choice (untimed): an answer right but for its umlauts, on a
// verb where the umlaut changes the form (fahrt / fährt, hatte / hätte),
// asks 1 or 2 — in Today, the sheet quizzes and untimed games:
//   • Enter (spammed) never picks, skips or re-checks — it points at 1 / 2;
//   • 1 / 2 or a tap picks; the right one is a full right answer, the
//     other a miss; then Enter goes on as always;
//   • a verb that keeps its umlaut (erhöhen) and ae spelling: no question;
//   • timed games: forgiven, no question.
//   node t-umlaut.mjs
import { openApp } from "./browser.mjs";
const { browser, page, errors } = await openApp({ width: 390, height: 844 });
const r = await page.evaluate(async () => {
  window.saveState = () => {}; window.speak = () => {}; window.showCelebrateToast = () => {}; window.confettiBurst = () => {};
  const realHeld = window.mistakeHeld;
  if (!vxOn()) vxSwitchOn();
  const out = [], ok = (c, m) => out.push([!!c, m]);
  const wait = ms => new Promise(r => setTimeout(r, ms));
  const key = (k, el) => (el || document.activeElement || document.body).dispatchEvent(new KeyboardEvent("keydown", { key: k, bubbles: true, cancelable: true }));
  const ask = () => document.querySelector(".vx-uml-ask");
  const pickRight = () => { const b = [...ask().querySelectorAll(".g-opt")]; return b; };
  const mk = (inf, kind, p) => { const x = vxVerb(inf); const form = vxForm(x, kind, p); return { kind, x, p, form, tense: VX_KIND_TENSE[kind], cell: inf + "|" + VX_KIND_TENSE[kind], sheet: "" }; };

  // ── Today ──
  startPathSession("regular", { noBonus: true });
  const s = pathSession;
  const show = (inf, k, p) => { const ex = mk(inf, k, p); s.items.splice(s.i + 1, 0, { t: "typed", w: vxWord(ex) }); s.answered = true; pathNext(); return ex; };
  const typeEnter = v => { const i = document.getElementById("p-input"); i.value = v; key("Enter", i); };
  const optFor = (txt) => [...ask().querySelectorAll(".g-opt")].findIndex(b => b.querySelector(".g-opt-text").textContent === txt);
  // 1. fahrt for er fährt: asked; Enter ×5 does nothing; the right pick is right.
  let ex = show("fahren", "pr", "er");
  let c0 = s.stats.correct, w0 = s.stats.wrong || 0;
  typeEnter("fahrt");
  ok(ask() && !s.answered && !!ask().offsetParent, "Today: fahrt for er fährt → the choice (visible)");
  ok(ask() && /fährt/.test(ask().textContent) && /fahrt/.test(ask().textContent), `…between fährt and fahrt: "${ask() && ask().querySelector(".vx-uml-opts").textContent.replace(/\s+/g, " ").trim()}"`);
  for (let k = 0; k < 5; k++) key("Enter", document.getElementById("p-input"));
  key("Enter", document.body); key(" ", document.body);
  ok(ask() && !s.answered && s.cur.w.vx === ex, "…Enter ×6 and Space: still asking, nothing graded or skipped");
  ok(/Pick 1 or 2/.test(ask().textContent), "…and it says Pick 1 or 2");
  ok(document.getElementById("p-input").disabled, "…the box is locked (1 / 2 can't be typed into it)");
  key(String(optFor("fährt") + 1), document.body);
  ok(s.answered && s.stats.correct === c0 + 1, "…pick fährt: a right answer (full)");
  const cardBefore = s.cur;
  key("Enter", document.body);
  ok(s.cur !== cardBefore, "…then Enter goes on as always");
  // 2. wrong pick = a miss
  ex = show("fahren", "pr", "ihr");
  typeEnter("fährt");
  ok(ask(), "Today: fährt for ihr fahrt (umlaut added) → the choice");
  key(String(optFor("fährt") + 1), document.body);
  ok(s.answered && (s.stats.wrong || 0) === w0 + 1, "…pick fährt: a miss");
  key("Enter", document.body);
  // 3. pronoun, ae spelling, a verb that keeps its umlaut, tap to pick
  show("fahren", "pr", "er"); typeEnter("er fahrt");
  ok(ask(), "Today: er fahrt → the choice");
  ask().querySelectorAll(".g-opt")[optFor("fährt")].click();
  ok(s.answered && document.getElementById("p-fb").textContent.length > 0, "…a tap picks too");
  key("Enter", document.body);
  show("fahren", "pr", "er"); typeEnter("faehrt");
  ok(!ask() && s.answered && document.getElementById("p-input").classList.contains("correct"), "Today: faehrt (ae spelling) → right, no question");
  key("Enter", document.body);
  show("erhöhen", "pr", "er"); typeEnter("erhoht");
  ok(!ask() && s.answered && document.getElementById("p-input").classList.contains("correct"), "Today: erhoht for erhöht (keeps its umlaut) → forgiven, no question");
  key("Enter", document.body);
  show("haben", "k2o", "ich"); typeEnter("hatte");
  ok(ask() && /hätte/.test(ask().textContent), "Today: hatte for ich hätte (Konjunktiv II) → the choice, not the other-tense retry");
  key(String(optFor("hätte") + 1), document.body);
  ok(s.answered && document.getElementById("p-input").classList.contains("correct"), "…pick hätte: right");
  key("Enter", document.body);
  show("fahren", "pr", "du"); typeEnter("fahrst");
  ok(ask() && /fährst/.test(ask().textContent), "Today: fahrst for du fährst (not a real form) → the choice too");
  key(String(optFor("fährst") + 1), document.body); key("Enter", document.body);
  // A form that is the start of its infinitive (fahre ⊂ fahren) is no particle: asked too.
  show("fahren", "pr", "ich"); typeEnter("fähre");
  ok(ask() && /fahre/.test(ask().textContent), "Today: fähre for ich fahre → the choice (not taken for a particle)");
  key(String(optFor("fahre") + 1), document.body); key("Enter", document.body);
  show("abfahren", "pr", "er"); typeEnter("fährt äb");
  ok(!ask(), "Today: fährt äb (umlaut on the particle) → no question");
  if (!s.answered) { const i = document.getElementById("p-input"); i.value = "fährt ab"; key("Enter", i); }
  key("Enter", document.body);
  // Escape while asking: leaves without a stuck key grab
  show("laufen", "pr", "er"); typeEnter("lauft");
  ok(ask(), "Today: lauft → the choice");
  endPathSession(true); backToMenu();
  await wait(50);
  // Leaving: the choice may stay hidden in the page, but must let go of the keys.
  let reached = false; const probe = () => { reached = true; };
  document.addEventListener("keydown", probe);
  key("Enter", document.body);
  document.removeEventListener("keydown", probe);
  ok(reached, "…leaving the session: Enter reaches the app again (no stuck key grab)");

  // ── Sheet quiz (stem change) ── (no wait after Today's misses: a person would have read them)
  window.mistakeHeld = () => false;
  renderGrammarSheet("pr4");
  for (let i = 0; i < 40 && _gs.step < _gs.steps.length; i++) gsGo(1);
  let found = false; const seenQ = [];
  for (let n = 0; n < 40 && _gs.quiz && !_gs.quiz.done && !found; n++) {
    const q = _gs.quiz, cur = q.list[q.i], Q = cur.q;
    seenQ.push(Q.k + ":" + (Q.a && Q.k === "type" ? Q.a[0] : ""));
    if (Q.k === "type") {
      const x = gsQuizVerb(Q), a = Q.a[0], bare = a.replace(/ä/g, "a").replace(/ö/g, "o").replace(/ü/g, "u");
      const inp = document.getElementById("gs-input");
      if (x && bare !== a && vxUmlautChoice(bare, Q.a, x, vxIsCommand(Q))) {
        found = true;
        inp.value = bare; key("Enter", inp);
        ok(ask() && !q.answered && !!ask().offsetParent, `Sheet quiz: ${bare} for ${a} → the choice (visible)`);
        key("Enter", inp); key("Enter", document.body);
        ok(ask() && !q.answered, "…Enter: still asking");
        key(String(optFor(a) + 1), document.body);
        ok(q.answered && cur.ok === true, "…pick the right one: right");
        break;
      }
      inp.value = a; gsQuizCheck();
    } else if (Q.k === "order") { cur.picked = Q.a.map((_, j) => j); gsQuizCheck(); }
    else gsQuizPick(Q.a);
    gsQuizNext();
  }
  ok(found, `Sheet quiz: a stem-change question was asked (${seenQ.join(" ")})`);
  // the sheet's Almost knows real forms now
  ok(vxNearTryAcc("wasche", ["wäscht"], vxVerb("waschen")) === "", "Sheet quiz: wasche for wäscht is not Almost");

  // ── Untimed game (Conjugation) vs timed ──
  ok(gameUmlautChoice({ def: { timed: true } }, "fahrt", ["fährt"], vxVerb("fahren")) === null, "timed games: no question (forgiven)");
  ok(!!gameUmlautChoice({ def: { timed: false } }, "fahrt", ["fährt"], vxVerb("fahren")), "untimed games: the question");
  backToMenu();
  // Conjugation: answer with the umlaut left out whenever its form has one.
  const orig = window.gameUmlautChoice;
  let seen = 0, asked = 0, enterOk = 0, right = 0, visibleFail = 0;
  window.gameUmlautChoice = (ctx, val, acc, x, cmd) => {
    seen++;
    // PROBE: the umlaut left out where the form has one (the real choice);
    // else a stand-in choice, to test the game's side (ask, Enter, credit).
    if (val === "PROBE") {
      const a = acc[0], bare = a.replace(/ä/g, "a").replace(/ö/g, "o").replace(/ü/g, "u");
      window._cjRight = a;
      return (bare !== a && orig(ctx, bare, acc, x, cmd)) || (ctx.def.timed ? null : { right: a, other: a + "e" });
    }
    return orig(ctx, val, acc, x, cmd);
  };
  try { localStorage.setItem("gv_game_intro_conj", "1"); } catch (e) {}
  gameRun = null;
  launchGame("conj", { size: "full", twist: "" });
  for (let t = 0; t < 30 && document.getElementById("g-go"); t++) { await wait(150); const b = document.getElementById("g-go"); if (b) b.click(); }
  await wait(600);
  const t0 = Date.now();
  while (Date.now() - t0 < 90000 && asked < 2 && activeGame && !activeGame.ctx.finished) {
    if (activeGame.ctx.waiting) { activeGame.ctx.continueNow(); await wait(150); continue; }
    const inp = document.getElementById("cj-input");
    if (!inp || activeGame.ctx.busy || inp.disabled) { await wait(100); continue; }
    inp.value = "PROBE"; key("Enter", inp);
    await wait(30);
    if (ask()) {
      asked++;
      if (!ask().offsetParent) visibleFail++;
      key("Enter", document.body); key("Enter", inp);
      if (ask() && !activeGame.ctx.waiting) enterOk++;
      key(String(optFor(window._cjRight) + 1), document.body);
      await wait(450);
      if (/bb-ok/.test(document.getElementById("cj-fb").innerHTML)) right++;
    }
  }
  window.gameUmlautChoice = orig;
  ok(!visibleFail, "Conjugation: the choice is visible");
  ok(asked >= 1, `Conjugation (untimed): umlaut left out → the choice (${asked}× in ${seen} answers)`);
  ok(enterOk === asked && right === asked, `…Enter never picked; the right pick counted right (${right}/${asked})`);
  if (typeof quitAllGames === "function") quitAllGames();
  return out;
});
let fail = 0;
r.forEach(([c, m]) => { if (!c) fail++; console.log((c ? "  ✓ " : "  ✗ ") + m); });
errors.forEach(e => { fail++; console.log("  ✗ error: " + e.slice(0, 300)); });
console.log(`umlaut choice: ${r.length - r.filter(x => !x[0]).length} passed, ${fail} failed`);
await browser.close();
process.exit(fail ? 1 : 0);
