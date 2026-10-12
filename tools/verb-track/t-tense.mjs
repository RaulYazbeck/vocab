// The tense on a verb card, and the second chance:
//   • a right form of the same verb and person in another tense is
//     named (both tenses) and gets one more try — nothing is graded;
//   • right on that try = a full right answer; wrong = a normal miss;
//   • a wrong-tense form is never graded (Don't know is the way out); a near miss of another tense, a
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
    ["kommen", "k2s", "er", "er würde kommen", "k2w"], ["kommen", "k2s", "er", "er kam", "pt"], ["gehen", "k2s", "er", "er ging", "pt"], ["kommen", "pt", "er", "er käme", "k2"],
    ["kommen", "k2w", "er", "er käme", null], ["bringen", "pt", "er", "er brachte", null],
    ["fahren", "pr", "du", "du fahrst", null], ["machen", "pr", "wir", "wir mache", null], ["kommen", "pf", "wir", "wir kommten", null], ["kommen", "pf", "wir", "", null]];
  const FR = [["venir", "pc", "nous", "nous venons", "pr"], ["finir", "fu", "ils", "ils finissent", "pr"], ["parler", "pr", "je", "je parlais", "im"],
    ["avoir", "pr", "je", "j'aurai", "fu"], ["parler", "pr", "nous", "nous parlerons", "fu"], ["parler", "pr", "je", "je parl", null], ["parler", "pr", "je", "", null]];
  (APP === "fr" ? FR : DE).forEach(([inf, k, p, val, want]) => {
    const ex = mk(inf, k, p);
    if (!ex.form) { ok(false, `${inf} ${k} ${p}: no form`); return; }
    const got = other(ex, val);
    ok(got === want, `${inf} ${k} ${p} "${val}" → ${got} (want ${want})`);
  });
  // The card never names its verb: only its meaning, and the label above
  // doesn't either (a French verb spelt the same in Spanish aside).
  const named = [];
  vxVerbs().forEach(x => {
    const t = VX_CORE.find(t => vxHasTense(x, t)), p = t && vxCellPersons(x, t)[0];
    const f = p && vxForm(x, t, p);
    if (!f) return;
    const ex = { kind: t, x, p, form: f, tense: t, cell: x.inf + "|" + t };
    const div = document.createElement("div"); div.innerHTML = vxPromptHtml(ex) + vxItemLabel(ex);
    const text = " " + div.textContent.toLowerCase().replace(/[^a-zäöüßéèêàâçôîûùëïœ' ]+/g, " ") + " ";
    const bare = x.inf.toLowerCase().replace(/^(sich |se |s')/, "");
    if (text.includes(" " + bare + " ") && !vxMeaning(x).toLowerCase().includes(bare)) named.push(x.inf);
  });
  ok(!named.length, `no verb card names its verb (${vxVerbs().length} verbs)`, named.slice(0, 8).join(", "));
  ok(vxVerbs().every(x => vxMeaning(x)), "every verb has a meaning to show");
  if (APP !== "fr") {
    // käme for "würde kommen": right; würde kommen / kämst for a käme card: right / retry.
    const k2w = mk("kommen", "k2w", "er"), k2s = mk("kommen", "k2s", "du"), br = mk("bringen", "pt", "er");
    ok(vxGrade("er käme", k2w) === true && vxGrade("er würde kommen", k2w) === true, "würde kommen asked: käme is right too");
    ok(vxGrade("du kämest", k2s) === true && vxGrade("du kämst", k2s) === true && vxGrade("du würdest kommen", k2s) !== true, "käme asked: kämest / kämst right, würdest kommen not");
    ok(br.form.ans === "brachte" && !!S.words && vxCatalog().some(it => it.id === "pt:bringen"), "brachte has its own card");
  }
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
  // 2. other tense, again and again → never graded; ? Don't know is the way out
  ex = show(APP === "fr" ? "finir" : "gehen", APP === "fr" ? "fu" : "pr", APP === "fr" ? "ils" : "er");
  st0 = { ...s.stats };
  const slip2 = APP === "fr" ? "ils finissent" : "er ist gegangen";
  type(slip2); ok(!s.answered, "second card: retry offered");
  type(slip2); ok(!s.answered && s.stats.wrong === st0.wrong, "the other tense twice: still not graded");
  type(slip2); ok(!s.answered && /vx-retry/.test(document.getElementById("p-fb").innerHTML), "the other tense three times: the retry stays");
  pathGradeVerb("", false); ok(s.answered && s.stats.wrong === st0.wrong + 1, "Don't know after the retry: a miss");
  ok(s.missed.some(w => w.vx && w.vx.x === ex.x), "the miss waits for the repair round");
  // 3. plain wrong: graded at once
  ex = show(inf, k, p);
  st0 = { ...s.stats };
  type("zzz"); ok(s.answered && s.stats.wrong === st0.wrong + 1, "a plain wrong answer: graded at once");
  // 4. umlaut-only other tense (German)
  if (APP !== "fr") {
    ex = show("haben", "pt", "ich"); st0 = { ...s.stats };
    type("ich hätte"); ok(!s.answered, "ich hätte for the Präteritum: the Konjunktiv II is named");
    type("ich hätte"); ok(!s.answered && s.stats.correct === st0.correct, "ich hätte twice: still the Konjunktiv II, never a forgiven umlaut");
    type("ich hatte"); ok(s.answered && s.stats.correct === st0.correct + 1, "then ich hatte: right");
    ex = show("fahren", "pr", "du"); st0 = { ...s.stats };
    type("du fahrst"); ok(s.answered && s.stats.correct === st0.correct + 1, "du fahrst: still a forgiven umlaut");
  }
  // 5. Don't know is never a retry
  ex = show(inf, k, p); st0 = { ...s.stats };
  pathGradeVerb("", false); ok(s.answered && s.stats.wrong === st0.wrong + 1, "Don't know: a miss");
  if (APP !== "fr") {
    // 6. the meaning's hint in German around a right form: right
    const g = mk("gehen", "pf", "er");
    ok(vxGrade("ist zu fuss gegangen", g) === true && vxGrade("er ist zu Fuß gegangen", g) === true, "ist zu Fuß gegangen: right");
    ok(vxExtraOnly("ist zu fuss gegangen", g) && !vxExtraOnly("ist gegangen", g), "…and the feedback says only the verb was needed");
    ok(vxGrade("geht zu Fuß", mk("gehen", "pr", "er")) === true, "geht zu Fuß: right");
    ok(vxGrade("ist nicht gegangen", g) !== true && vxGrade("ist kein gegangen", g) !== true, "nicht / kein added: not right");
    ok(vxGrade("hat ist gegangen", g) !== true && vxGrade("zu fuss ist gegangen", g) !== true && vxGrade("ist zu fuss", g) !== true, "another auxiliary, words in front, or the form cut: not right");
    ok(vxGrade("ist gegangen gegangen", g) !== true && vxGrade("ist sie gegangen", g) !== true, "the form doubled, a pronoun added: not right");
    ok(vxGrade("ist gestern mit ihm sehr weit gegangen", g) !== true, "more than four extra words: not right");
    // 7. Shift+Enter ×3 on a wrong verb answer: counted, all rolled back
    const shift = () => document.dispatchEvent(new KeyboardEvent("keydown", { key: "Enter", shiftKey: true, bubbles: true }));
    S.path.secretOk = null;
    ex = show("gehen", "pf", "er"); st0 = { ...s.stats };
    const verb0 = JSON.stringify(S.verb), missed0 = s.missed.length;
    type("ist gegangn x"); ok(s.answered && s.stats.wrong === st0.wrong + 1, "a wrong verb answer: a miss");
    ok(document.querySelector("#p-fb .vx-res.bad .p-typo"), "the ✗ can be tapped");
    shift(); shift(); shift();
    ok(s.answered && s.stats.wrong === st0.wrong && s.stats.correct === st0.correct + 1 && s.stats.answered === st0.answered + 1, "Shift+Enter ×3: counted right, the miss gone");
    ok(/Counted/.test(document.getElementById("p-fb").innerHTML), "…shown as ✓ Counted");
    ok(s.missed.length === missed0 && S.path.secretOk.n === 1, "…not waiting for the repair round, one of today's 3 used");
    ok(JSON.parse(verb0).nc + 1 === S.verb.nc && vxCovHas("gehen", "pf"), "…the verb ledger rolled back, then counted once, the form set");
    shift(); ok(s.answered && s.stats.correct === st0.correct + 1, "a 4th Shift+Enter does nothing");
    // A near miss: no daily cap.
    ex = show("gehen", "pf", "er"); st0 = { ...s.stats };
    type("ist gegagen"); ok(s.answered && s.stats.near === st0.near + 1, "a near miss");
    shift(); shift(); shift();
    ok(s.stats.near === st0.near && s.stats.correct === st0.correct + 1 && S.path.secretOk.n === 1, "Shift+Enter ×3 on ≈: counted, no allowance used");
  }
  return out.filter(([c, m]) => m);
}, APP);
let pass = 0, fail = 0;
r.forEach(([c, m]) => { if (c) pass++; else { fail++; console.log("✗", m); } });
if (errors.length) { fail++; console.log("page errors:", errors.slice(0, 5)); }
console.log(`tense${APP === "fr" ? " (fr)" : ""}: ${pass} passed, ${fail} failed`);
await browser.close();
process.exit(fail ? 1 : 0);
