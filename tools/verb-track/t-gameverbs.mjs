// Verb items (Today's verb track) in the games — bonus rounds take a
// session's words, verb items included:
//   • the prompt says the verb, the tense AND the person (er ___), so
//     the form can be worked out (waschen — Präsens alone can't);
//   • Type Rush / Timer grade them like Today: the pronoun may be typed
//     in front, a missing umlaut is fine; a wrong person is wrong;
//   • the lesson after a miss shows the whole form (er wäscht).
//   node t-gameverbs.mjs     (APP=fr for the French app)
import { openApp } from "./browser.mjs";
const APP = process.env.APP || "de";
const { browser, page, errors } = await openApp({ width: 390, height: 844, app: APP });
const r = await page.evaluate(async (APP) => {
  window.saveState = () => {}; window.speak = () => {}; window.showCelebrateToast = () => {}; window.confettiBurst = () => {};
  if (!vxOn()) vxSwitchOn();
  const out = [], ok = (c, m) => out.push([!!c, m]);
  const mk = (inf, kind, p) => { const x = vxVerb(inf); const form = vxForm(x, kind, p); return { kind, x, p, form, tense: VX_KIND_TENSE[kind], cell: inf + "|" + VX_KIND_TENSE[kind], sheet: "" }; };
  const DE = [["waschen", "pr", "er", "er wäscht", "wascht", "wasche"], ["fahren", "pr", "du", "du fährst", "fahrst", "fahre"], ["gehen", "pf", "wir", "wir sind gegangen", "sind gegangen", "bin gegangen"],
    ["aufstehen", "im", "du", "steh auf", "steh auf", "stehst auf"], ["kommen", "pt", "sie", "sie kamen", "kamen", "kam"], ["machen", "fu", "ich", "ich werde machen", "werde machen", "wird machen"]];
  const FR = [["finir", "pr", "nous", "nous finissons", "finissons", "finis"], ["aller", "pc", "il", "il est allé", "est allé", "suis allé"], ["parler", "im", "je", "je parlais", "parlais", "parlait"], ["prendre", "fu", "vous", "vous prendrez", "prendrez", "prendras"]];
  const cases = APP === "fr" ? FR : DE;
  const words = cases.map(([inf, k, p]) => vxWord(mk(inf, k, p)));
  cases.forEach(([inf, k, p, full, bare, wrongP], i) => {
    const w = words[i];
    ok(w.vx.form, `${inf} ${k} ${p}: a form`);
    const pron = vxPronText(w.vx);
    ok(gamePrompt(w).includes(inf) && gamePrompt(w).includes(vxGameTense(w.vx)) && gamePrompt(w).includes(pron.replace(/'$/, "")), `prompt names verb, tense and person: "${gamePrompt(w)}"`);
    ok(typedCorrect(full, w), `"${full}" right for ${gamePrompt(w)}`);
    ok(typedCorrect(bare, w), `"${bare}" right for ${gamePrompt(w)}`);
    ok(!typedCorrect(wrongP, w), `"${wrongP}" (wrong person) not right for ${gamePrompt(w)}`);
    const div = document.createElement("div"); div.innerHTML = wordLessonHtml(w);
    ok(div.textContent.includes(w.vx.form.ans.split(" ")[0]) && div.textContent.includes(inf), `lesson: ${div.textContent.replace(/\s+/g, " ").trim()}`);
  });
  // Edge cases.
  const near = (v, w) => typedNear(v, w);
  if (APP !== "fr") {
    const k2w = vxWord(mk("kommen", "k2w", "er")), k2s = vxWord(mk("kommen", "k2s", "du")), k2sEr = vxWord(mk("kommen", "k2s", "er"));
    ok(gamePrompt(k2s) !== gamePrompt(vxWord(mk("kommen", "k2w", "du"))) && /own form/.test(gamePrompt(k2s)), `own Konjunktiv II says so: "${gamePrompt(k2s)}"`);
    ok(!typedCorrect("würdest kommen", k2s) && typedCorrect("kämest", k2s) && typedCorrect("käme", k2w) && typedCorrect("würde kommen", k2w), "käme / würde: right where asked");
    ok(answersOverlap(k2w, k2sEr) && !answersOverlap(words[0], words[1]), "käme and würde kommen (er) overlap; waschen er / fahren du don't");
    // käme never offered as a wrong option for "würde kommen" (and back).
    let clash = 0;
    for (let i = 0; i < 40; i++) {
      const pool2 = [k2w, k2sEr, ...words].map(w => ({ ...w, anki: false }));
      const ds = pickDistractors(k2w, pool2, 3, gameForm, null, { hard: true }), ds2 = pickDistractors(k2sEr, pool2, 3, gameForm, null, { hard: true });
      if (ds.some(d => d.vx && d.vx.kind === "k2s") || ds2.some(d => d.vx && d.vx.kind === "k2w")) clash++;
    }
    ok(!clash, "a right answer is never a distractor (käme / würde kommen)");
    const w0 = words[0];
    const w1 = words[1]; // fahren du → fährst
    ok(near("du färhst", w1) === "färhst" && near("färhst", w1) === "färhst", `typo with the pronoun typed = Almost, diffed without it ("${near("du färhst", w1)}")`);
    ok(!near("er wäsch", w0), "a slip in the ending is wrong, not Almost (as everywhere)");
    ok(!typedCorrect("wasche wäschst wäscht", w0), "every person at once is not right");
    ok(!near("falsch", w0) && !near("", w0), "a wrong word / blank is not Almost");
    ok(typedCorrect("Er wäscht", w0) && typedCorrect("  wäscht ", w0) && typedCorrect("er waescht", w0), "case, spaces and ae for ä are fine");
    ok(!typedCorrect("er wäscht nicht", w0) && !typedCorrect("sie wäscht er", w0), "nicht / a second pronoun is not right");
    const es = vxWord(mk("regnen", "pr", "er"));
    ok(/— es ___/.test(gamePrompt(es)) && typedCorrect("es regnet", es) && typedCorrect("regnet", es), `it-verb: "${gamePrompt(es)}"`);
    const sie = vxWord(mk("aufstehen", "im", "Sie"));
    ok(/\(Sie\) ___!/.test(gamePrompt(sie)) && typedCorrect("stehen Sie auf", sie) && typedCorrect("stehen Sie auf!", sie), `Sie command: "${gamePrompt(sie)}"`);
  } else {
    const kinds = ["pvpr", "pvpc", "pvfu"].map(k => vxWord(mk("vendre", k, "il")));
    ok(new Set(kinds.map(gamePrompt)).size === 3, `the three passives differ: ${kinds.map(gamePrompt).join(" | ")}`);
    const el = vxWord(mk("aimer", "pc", "je"));
    ok(/— j'___/.test(gamePrompt(el)) && typedCorrect("j'ai aimé", el) && typedCorrect("ai aimé", el), `elision: "${gamePrompt(el)}"`);
    const sj = vxWord(mk("finir", "sj", "nous"));
    ok(/que nous ___/.test(gamePrompt(sj)) && typedCorrect("que nous finissions", sj) && typedCorrect("finissions", sj), `subjonctif: "${gamePrompt(sj)}"`);
  }
  // Type Rush with these words: the prompt on screen has the person.
  const pool = words.concat(words).map(w => ({ ...w, anki: false }));
  try { localStorage.setItem("gv_game_intro_typerush", "1"); } catch (e) {}
  gameRun = { kind: "surprise", ids: ["typerush"], i: 0, summaries: [], pool, size: "bonus", title: "🎁 Bonus", onDone: () => {} };
  launchGame("typerush", { pool, size: "bonus", twist: "" });
  // The round's Start (armed after a moment), then the countdown.
  for (let t = 0; t < 30 && document.getElementById("g-go"); t++) { await new Promise(r => setTimeout(r, 200)); const b = document.getElementById("g-go"); if (b) b.click(); }
  for (let t = 0; t < 60 && !(document.getElementById("tr-prompt") && document.getElementById("tr-prompt").textContent); t++) await new Promise(r => setTimeout(r, 100));
  const prompt = document.getElementById("tr-prompt");
  ok(prompt && /___/.test(prompt.textContent), `Type Rush shows the person: "${prompt && prompt.textContent}"`);
  // Answer one with its pronoun in front: counted right.
  const cur = prompt && words.find(w => prompt.textContent.startsWith(w.vx.x.inf) && prompt.textContent.includes(vxPronText(w.vx)));
  if (cur) {
    const c = cases[words.indexOf(cur)];
    const input = document.getElementById("tr-input");
    input.value = c[3]; document.getElementById("tr-go").click();
    ok(input.classList.contains("correct"), `Type Rush: "${c[3]}" counted right`);
  } else ok(false, "Type Rush: current word found");
  if (typeof quitAllGames === "function") quitAllGames();
  return out;
}, APP);
let fail = 0;
r.forEach(([c, m]) => { if (!c) fail++; console.log((c ? "  ✓ " : "  ✗ ") + m); });
errors.forEach(e => { fail++; console.log("  ✗ error: " + e); });
console.log(`game verbs (${APP}): ${r.length - r.filter(x => !x[0]).length} passed, ${fail} failed`);
await browser.close();
process.exit(fail ? 1 : 0);
