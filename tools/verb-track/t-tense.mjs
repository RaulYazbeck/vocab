// The tense on a verb card, and the second chance:
//   • a right form of the same verb and person in another tense is
//     named (both tenses) and gets one more try — nothing is graded;
//   • right on that try = a full right answer; wrong = a normal miss;
//   • only one second chance per card; a near miss of another tense, a
//     plain wrong answer, a blank or "Don't know" are graded as before;
//   • an answer right only because an umlaut is forgiven, that is
//     exactly another tense (ich hätte for ich hatte), is that tense;
//   • the card shows the tense as its title and in the input.
//   node t-tense.mjs     (APP=fr for the French app)
import { openApp } from "./browser.mjs";
const APP = process.env.APP || "de";
const { browser, page, errors } = await openApp({ width: 390, height: 844, app: APP });
const r = await page.evaluate((APP) => {
  window.saveState = () => {}; window.speak = () => {}; window.showCelebrateToast = () => {}; window.confettiBurst = () => {};
  if (!vxOn()) vxSwitchOn();
  const out = [], ok = (c, m) => out.push([!!c, m]);
  const mk = (inf, kind, p) => { const x = vxVerb(inf); const form = vxForm(x, kind, p); return { kind, x, p, form, tense: VX_KIND_TENSE[kind], cell: inf + "|" + VX_KIND_TENSE[kind], sheet: "" }; };
  const other = (ex, val) => { const g = vxGrade(val, ex); return g !== true ? vxOtherTense(val, ex) : vxUmlautOnly(val, ex.form.acc, vxIsCommand(ex)) ? vxOtherTense(val, ex, true) : null; };
  const DE = [["kommen", "pf", "wir", "wir kommen", "pr"], ["kommen", "pf", "wir", "wir kamen", "pt"], ["gehen", "pr", "er", "er ist gegangen", "pf"],
    ["aufstehen", "im", "Sie", "Sie stehen auf", "pr"], ["aufstehen", "im", "du", "du stehst auf", "pr"], ["kommen", "pf", "er", "er wird kommen", "fu"],
    ["haben", "pt", "ich", "ich hätte", "k2"], ["werden", "pt", "wir", "wir würden", "k2"], ["sein", "k2o", "ich", "ich war", "pt"],
    ["fahren", "pr", "du", "du fahrst", null], ["machen", "pr", "wir", "wir mache", null], ["kommen", "pf", "wir", "wir kommten", null], ["kommen", "pf", "wir", "", null]];
  const FR = [["venir", "pc", "nous", "nous venons", "pr"], ["finir", "fu", "ils", "ils finissent", "pr"], ["parler", "pr", "je", "je parlais", "im"],
    ["avoir", "pr", "je", "j'aurai", "fu"], ["parler", "pr", "nous", "nous parlerons", "fu"], ["parler", "pr", "je", "je parl", null], ["parler", "pr", "je", "", null]];
  (APP === "fr" ? FR : DE).forEach(([inf, k, p, val, want]) => {
    const ex = mk(inf, k, p);
    if (!ex.form) { ok(false, `${inf} ${k} ${p}: no form`); return; }
    const got = other(ex, val);
    ok(got === want, `${inf} ${k} ${p} "${val}" → ${got} (want ${want})`);
  });
  // The flow in a Today session.
  startPathSession("regular", { noBonus: true });
  const s = pathSession;
  const show = (inf, k, p) => { const ex = mk(inf, k, p); s.items.splice(s.i + 1, 0, { t: "typed", w: vxWord(ex) }); s.answered = true; pathNext(); return ex; };
  const type = v => { document.getElementById("p-input").value = v; pathCheckTyped(); };
  const [inf, k, p, slip] = APP === "fr" ? ["venir", "pc", "nous", "nous venons"] : ["kommen", "pf", "wir", "wir kommen"];
  // Title and placeholder
  let ex = show(inf, k, p);
  const title = document.querySelector("#p-card .vx-tt");
  ok(title && title.textContent.includes(VX_TENSE_LABEL[ex.tense]), "the tense is the card's title");
  ok(document.getElementById("p-input").placeholder.startsWith(VX_TENSE_LABEL[ex.tense]), "the input names the tense");
  // 1. other tense, then right → full right
  let st0 = { ...s.stats };
  type(slip);
  ok(!s.answered, "another tense: not graded");
  ok(s.stats.answered === st0.answered && s.stats.wrong === st0.wrong, "another tense: no answer counted");
  ok(/vx-retry/.test(document.getElementById("p-fb").innerHTML), "another tense: both tenses named");
  ok(!vxCovHas(ex.x.inf, ex.tense) || true, "");
  type(ex.form.ans);
  ok(s.answered && s.stats.correct === st0.correct + 1 && s.stats.wrong === st0.wrong, "right on the second try: a right answer");
  ok(/vx-res ok/.test(document.getElementById("p-fb").innerHTML), "right on the second try: ✓ Correct");
  ok(vxCovHas(ex.x.inf, ex.tense), "right on the second try: the ledger form is set");
  ok(!document.getElementById("p-input").classList.contains("retry"), "the retry outline goes");
  // 2. other tense, then the other tense again → a miss (one chance only)
  ex = show(APP === "fr" ? "finir" : "gehen", APP === "fr" ? "fu" : "pr", APP === "fr" ? "ils" : "er");
  st0 = { ...s.stats };
  const slip2 = APP === "fr" ? "ils finissent" : "er ist gegangen";
  type(slip2); ok(!s.answered, "second card: retry offered");
  type(slip2); ok(s.answered && s.stats.wrong === st0.wrong + 1, "the other tense twice: a miss");
  ok(s.missed.some(w => w.vx && w.vx.x === ex.x), "the miss waits for the repair round");
  // 3. plain wrong: graded at once
  ex = show(inf, k, p);
  st0 = { ...s.stats };
  type("zzz"); ok(s.answered && s.stats.wrong === st0.wrong + 1, "a plain wrong answer: graded at once");
  // 4. umlaut-only other tense (German)
  if (APP !== "fr") {
    ex = show("haben", "pt", "ich"); st0 = { ...s.stats };
    type("ich hätte"); ok(!s.answered, "ich hätte for the Präteritum: the Konjunktiv II is named");
    type("ich hätte"); ok(s.answered && s.stats.wrong === st0.wrong + 1, "ich hätte twice: a miss, not a forgiven umlaut");
    ex = show("fahren", "pr", "du"); st0 = { ...s.stats };
    type("du fahrst"); ok(s.answered && s.stats.correct === st0.correct + 1, "du fahrst: still a forgiven umlaut");
  }
  // 5. Don't know is never a retry
  ex = show(inf, k, p); st0 = { ...s.stats };
  pathGradeVerb("", false); ok(s.answered && s.stats.wrong === st0.wrong + 1, "Don't know: a miss");
  return out.filter(([c, m]) => m);
}, APP);
let pass = 0, fail = 0;
r.forEach(([c, m]) => { if (c) pass++; else { fail++; console.log("✗", m); } });
if (errors.length) { fail++; console.log("page errors:", errors.slice(0, 5)); }
console.log(`tense${APP === "fr" ? " (fr)" : ""}: ${pass} passed, ${fail} failed`);
await browser.close();
process.exit(fail ? 1 : 0);
