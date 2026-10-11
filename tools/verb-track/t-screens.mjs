// Every screen of the verb track drawn (Grammar, units, ledger pages, every
// sheet step, quiz, miss → sheet → back, result, every mastery quiz, every
// rule card and a sample of verb-item cards), phone and desktop: no page
// errors, no undefined/NaN text, no sideways scrolling. APP=fr: the French app.
import { openApp } from "./browser.mjs";
let failed = 0;
for (const [w, h] of [[390, 844], [1280, 900]]) {
  const { browser, page, errors } = await openApp({ width: w, height: h, app: process.env.APP || "de" });
  const out = await page.evaluate(async () => {
    vxSwitchOn(); window.mistakeHeld = () => false; window.speak = () => {};
    const bad = [], seen = { cards: 0, screens: 0 };
    const look = where => {
      const txt = document.getElementById("main-screen").innerText;
      if (/undefined|NaN|\[object|null\b/.test(txt)) bad.push(`${where}: "${(txt.match(/.{0,40}(undefined|NaN|\[object|null\b).{0,20}/) || [""])[0]}"`);
      if (document.documentElement.scrollWidth > window.innerWidth + 1) bad.push(`${where}: sideways scroll ${document.documentElement.scrollWidth}`);
      seen.screens++;
    };
    // Grammar screens
    renderGrammar(); look("grammar");
    for (const u of VX_UNITS) { renderGrammarUnit(u.id); look("unit " + u.id); }
    for (const lv of ["a1", "a2", "b1"]) { renderGrammarVerbs(lv); look("verbs " + lv); }
    for (const sh of GS_SHEETS) {
      renderGrammarSheet(sh.id);
      for (let i = 0; i <= _gs.steps.length; i++) { look(`sheet ${sh.id} step ${i}`); gsGo(1); }
      // the quiz, answered: a miss, the sheet, back, the rest right
      const ans = right => { const q = _gs.quiz, c = q.list[q.i], Q = c.q;
        if (Q.k === "type") { document.getElementById("gs-input").value = right ? Q.a[0] : "x"; gsQuizCheck(); }
        else if (Q.k === "order") { c.picked = Q.a.map((_, j) => j); if (!right) c.picked.reverse(); gsQuizCheck(); }
        else gsQuizPick(right ? Q.a : (Q.a + 1) % Q.o.length); };
      ans(false); look(`sheet ${sh.id} miss`); gsQuizReview(); look(`sheet ${sh.id} review`); gsReviewBack(); gsQuizNext();
      while (!_gs.quiz.done) { ans(true); look(`sheet ${sh.id} q`); gsQuizNext(); }
      look(`sheet ${sh.id} result`);
    }
    for (const u of VX_UNITS) { vxSheetIds(u.id).forEach(id => { S.verb.sh[id] = 100; }); renderGrammarMastery(u.id); look("mastery " + u.id);
      const q = _gs.quiz; while (!q.done) { const c = q.list[q.i], Q = c.q; if (Q.k === "type") { document.getElementById("gs-input").value = Q.a[0]; gsQuizCheck(); } else if (Q.k === "order") { c.picked = Q.a.map((_, j) => j); gsQuizCheck(); } else gsQuizPick(Q.a); gsQuizNext(); }
      look("mastery result " + u.id); }
    // Today: every rule's intro card and a check, and item cards
    backToMenu(); startPathSession("regular");
    const show = (ex, learn) => { const w = vxWord(ex); pathSession.items.splice(pathSession.i + 1, 0, { t: learn ? "learn" : "typed", w }); pathSession.answered = true; pathGo(); seen.cards++; };
    for (const r of VX_RULES) {
      const ex = vxMakeExercise({ kind: "r", rule: r.id, id: "r:" + r.id });
      if (!ex) { bad.push("rule without exercise: " + r.id); continue; }
      show(ex, true); look("learn " + r.id);
      show(ex, false); look("card " + r.id);
      document.getElementById("p-input").value = "falsch"; pathCheckTyped(); look("card fb " + r.id);
      const peek = document.querySelector('button[title="Open the sheet"]'); if (peek) { peek.click(); if (!document.getElementById("gs-peek")) bad.push("peek did not open " + r.id); gsPeekClose(); }
    }
    for (const it of vxCatalog().filter(i => i.kind !== "r").filter((_, k) => k % 7 === 0)) {
      const ex = vxMakeExercise(it); if (!ex) { bad.push("item without exercise: " + it.id); continue; }
      show(ex, true); look("learn " + it.id); show(ex, false);
      document.getElementById("p-input").value = ex.form.ans; pathCheckTyped(); look("card ok " + it.id);
    }
    return { bad: bad.slice(0, 30), nbad: bad.length, seen };
  });
  console.log(w, JSON.stringify(out.seen), "issues:", out.nbad, out.bad.length ? JSON.stringify(out.bad, null, 1) : "", "page errors:", errors.length ? errors.slice(0, 5) : "none");
  if (out.nbad || errors.length) failed++;
  await browser.close();
}
process.exit(failed ? 1 : 0);
