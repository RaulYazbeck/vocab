// The French app's verb track, in the real app: the switch, the preview,
// units and gating, every sheet's quiz through the screens, a miss and
// the way back, mastery, Today's sheet and verb cards, game credit,
// retired cards, the reports, the Spanish screens, switching back.
import { openApp } from "./browser.mjs";
const { browser, page, errors } = await openApp({ app: "fr" });
let pass = 0, fail = 0;
const ok = (c, m, x = "") => { if (c) pass++; else { fail++; console.log("  ✗", m, x); } };
const ev = f => page.evaluate(f);
const r = await ev(() => {
  const out = {};
  const host = () => document.getElementById("main-screen");
  out.avail = vxAvailable(); out.fr = VX_FR;
  // 1 · before the switch: the old behaviour, the offer
  out.before = { thread: vlLevelTenses(), pace: pathPace() };
  out.todayOffer = vxTodayHtml();
  out.menu = settingsMenuHtml().includes("Grammar");
  renderGrammar(); out.grammarOff = host().innerText.slice(0, 300);
  // 2 · the preview changes nothing
  const snap = JSON.stringify(S);
  const p = vxPreview();
  out.previewPure = JSON.stringify(S) === snap;
  out.preview = { items: p.after.items, cells: p.after.cells, retired: p.retired, units: p.units.filter(u => u.st).map(u => u.id + u.st).join(" ") };
  renderVerbSwitch();
  return out;
});
ok(r.avail && r.fr, "the verb track is available in the French app");
ok(/Nuevo sistema de verbos/.test(r.todayOffer), "Today offers the switch, in Spanish", r.todayOffer);
ok(r.menu, "☰ has Grammar");
ok(/Gramática/.test(r.grammarOff) && /12 tiempos/.test(r.grammarOff), "the Grammar screen is in Spanish, 12 tenses", r.grammarOff);
ok(r.previewPure, "the preview leaves the state untouched");
ok(r.preview.items > 200 && r.preview.cells > 1000, "the preview counts items and cells", JSON.stringify(r.preview));
ok(Object.keys(r.preview.retired).length >= 5, "conjugation decks retire their unmet cards", JSON.stringify(r.preview.retired));
await page.waitForSelector(".vx-switch", { timeout: 5000 }).catch(() => {});
const sw = await ev(() => document.getElementById("main-screen").innerText);
ok(/Qué cambia para ti/.test(sw) && /Activar el nuevo sistema/.test(sw) && !/What changes/.test(sw), "the switch screen is in Spanish", sw.slice(0, 200));

const r2 = await ev(() => {
  const out = {};
  const host = () => document.getElementById("main-screen");
  vxSwitchGo();
  out.units = VX_UNITS.map(u => u.id + vxUnitState(u.id)).join(" ");
  out.thread = vlLevelTenses();
  out.pending = vxPendingSheets();
  out.grammar = host().innerText;
  out.today = vxTodayHtml();
  // gating & retiring
  out.gated = ["b1_pasiva", "b1_gerundio"].map(vxGated).concat(!vxGated("b1_concordancia")); // concordancia opens with the Passé composé
  out.retiredPicked = planNewWords(400).flat().filter(w => vxRetired(w.deckId, w.idx)).length;
  out.gatedPicked = planNewWords(400).flat().filter(w => vxGated(w.deckId)).length;
  // a retired participle card mirrors its verb's item
  const ret = [...vxRetireMap().entries()].find(([k, c]) => c.item && c.item.startsWith("pp:"));
  const iws = getWS("vx", ret[1].item); iws.st = 5; iws.sAt = Date.now(); iws.pk = 5;
  vxMirror();
  out.mirror = { key: ret[0], st: S.words[ret[0]].st, rt: S.words[ret[0]].rt };
  // a conjugation card answered right fills the ledger
  const card = vxVerbs().flatMap(x => vxRefs(x).map(r => ({ x, r }))).find(o => o.r.deckId === "a1_conjugacion");
  delete S.verb.cov[card.x.inf];
  applyCorrect(getWS(card.r.deckId, card.r.idx), { quiet: true, kind: "recall", w: { deckId: card.r.deckId, idx: card.r.idx } });
  out.card = vxCovHas(card.x.inf, "pr");
  // game credit: Verb Thread reading (recognition), a typed miss flags
  const rule = getWS("vx", "r:pr-er"); rule.st = 3; rule.sAt = Date.now() - 864e5 * 3; rule.dueAt = Date.now() - 1000;
  const ctx = {};
  vxGameHit(ctx, "parler", "pr", "nous", true, "recall");
  vxGameHit(ctx, "aller", "pr", "ils", false, "recall");
  const g = vxApplyGameHits(ctx);
  out.game = { cov: vxCovHas("parler", "pr"), up: g.up, flagged: g.flagged, rule: S.words["vx_r:pr-er"].st };
  return out;
});
ok(/^pr2/.test(r2.units) && /pc2/.test(r2.units) && /sj0/.test(r2.units), "Présent and Passé composé open, later tenses locked", r2.units);
ok(r2.thread.every(t => ["pr", "fp", "pc"].includes(t)), "Verb Thread only uses taught tenses", JSON.stringify(r2.thread));
ok(/Present|Présent/.test(r2.grammar) && /Los tiempos, en el orden/i.test(r2.grammar) && /El registro de verbos/i.test(r2.grammar), "the Grammar screen after the switch", r2.grammar.slice(0, 300));
ok(r2.gated.every(Boolean) && r2.gatedPicked === 0 && r2.retiredPicked === 0, "gated decks wait, retired cards never come", JSON.stringify(r2));
ok(r2.mirror.st === 5 && r2.mirror.rt === 1, "a retired participle card mirrors its item", JSON.stringify(r2.mirror));
ok(r2.card, "a conjugation card answered right fills the ledger");
ok(r2.game.cov && r2.game.flagged >= 0, "a typed game form fills the ledger", JSON.stringify(r2.game));

// 3 · every sheet through the screens: all right → passed; units open.
const r3 = await ev(() => {
  const out = { sheets: {}, errs: [] };
  window.mistakeHeld = () => false;
  const answer = right => {
    const q = _gs.quiz, cur = q.list[q.i], Q = cur.q;
    if (Q.k === "type") { document.getElementById("gs-input").value = right ? Q.a[0] : "xyz"; gsQuizCheck(); }
    else if (Q.k === "order") { cur.picked = Q.a.map((_, i) => i); if (!right) cur.picked.reverse(); gsQuizCheck(); }
    else gsQuizPick(right ? Q.a : (Q.a + 1) % Q.o.length);
  };
  // a miss on the first sheet: why, the way into the sheet, the re-ask
  renderGrammarSheet("pr2");
  out.steps = _gs.steps.map(s => s.label).join(",");
  while (_gs.step < _gs.steps.length) gsGo(1);
  answer(false);
  out.missFb = document.getElementById("gs-qfb").innerText;
  const missed = _gs.quiz.list[0].q;
  gsQuizReview();
  out.review = { lit: !!document.querySelector(".gs-hl"), text: document.getElementById("main-screen").innerText.slice(0, 160) };
  gsReviewBack(); gsQuizNext();
  while (!_gs.quiz.done) { answer(true); gsQuizNext(); }
  out.reask = _gs.quiz.list[_gs.quiz.list.length - 1].q.q === missed.q;
  out.notPassed = !vxSheetPassed("pr2") && /Todavía no/.test(document.getElementById("main-screen").innerText);
  GS_SHEETS.forEach(sh => {
    try {
      renderGrammarSheet(sh.id);
      while (_gs.step < _gs.steps.length) gsGo(1);
      let n = 0;
      while (!_gs.quiz.done && n++ < 30) { answer(true); gsQuizNext(); }
      out.sheets[sh.id] = vxSheetPassed(sh.id);
    } catch (e) { out.errs.push(sh.id + ": " + e.message); }
  });
  out.units = VX_UNITS.map(u => u.id + vxUnitState(u.id)).join(" ");
  // mastery of a tense
  renderGrammarMastery("fu");
  let n = 0;
  while (!_gs.quiz.done && n++ < 40) { answer(true); gsQuizNext(); }
  out.mastered = vxMastered("fu");
  out.mText = document.getElementById("main-screen").innerText.slice(0, 120);
  return out;
});
ok(r3.steps === "Estructura,Reglas,Tabla,Ejemplos", "the sheet's steps are in Spanish", r3.steps);
ok(/Respuesta/.test(r3.missFb) && /Verlo en la ficha/.test(r3.missFb), "a miss: the answer, why, the way into the sheet", r3.missFb);
ok(r3.review.lit, "the missed point lights up in the sheet", r3.review.text);
ok(r3.reask && r3.notPassed, "the missed question comes back; one miss = not passed");
ok(!r3.errs.length, "every sheet renders and runs", r3.errs.join(" | "));
ok(Object.values(r3.sheets).every(Boolean) && Object.keys(r3.sheets).length === 38, "all 38 sheets pass with every answer right", JSON.stringify(r3.sheets));
ok(!/[01]/.test(r3.units.replace(/[a-z]/g, "")), "every tense opens once its sheets are passed", r3.units);
ok(r3.mastered && /dominado/.test(r3.mText), "the Futur mastery quiz", r3.mText);

// 4 · Today: verb items through the screens, right and wrong.
const r4 = await ev(() => {
  const out = { kinds: {}, errs: [], prompts: [], fb: [] };
  window.mistakeHeld = () => false;
  backToMenu();
  // every rule with verbs: an exercise, its prompt and feedback
  startPathSession("regular");
  let k = 0;
  while (pathSession && k++ < 120) {
    const it = pathSession.cur;
    if (!it) break;
    try {
      if (it.t === "sheet") { _gs.quiz = null; pathNext(); continue; }
      if (it.t === "learn" && it.w && it.w.vx) { out.kinds.learn = (out.kinds.learn || 0) + 1; out.learnText = document.getElementById("p-card").innerText; pathNext(); continue; }
      if (it.t === "typed" && it.w && it.w.vx) {
        const ex = it.w.vx;
        out.kinds[ex.kind] = (out.kinds[ex.kind] || 0) + 1;
        out.prompts.push(document.getElementById("p-card").innerText.replace(/\s+/g, " ").slice(0, 400));
        const right = out.prompts.length % 3 !== 0;
        // an accented answer typed without its accents: right, spelling shown
        const plain = ex.form.ans.normalize("NFD").replace(/[\u0300-\u036f]/g, "");
        if (right && plain !== ex.form.ans && !out.accentFb) {
          document.getElementById("p-input").value = plain; pathCheckTyped();
          out.accentFb = document.getElementById("p-fb").innerText.replace(/\s+/g, " ").slice(0, 160);
          pathGo(); continue;
        }
        document.getElementById("p-input").value = right ? ex.form.ans : "zzz";
        pathCheckTyped();
        out.fb.push(document.getElementById("p-fb").innerText.replace(/\s+/g, " ").slice(0, 160));
        pathGo(); continue;
      }
      pathSession.answered = false; pathNext();
    } catch (e) { out.errs.push(e.message); break; }
  }
  // the near miss: a missing accent
  const x = vxVerb("acheter"), form = vxForm(x, "pr", "je");
  out.near = vxGrade("achete", { form, kind: "pr" }) === true && vxUmlautOnly("achete", form.acc);
  out.cmd = vxGrade("tu parle", { kind: "ip", form: vxForm(vxVerb("parler"), "ip", "tu") });
  out.items = Object.keys(S.words).filter(k => k.startsWith("vx_") && S.words[k].st).length;
  // every per-verb item and rule makes an exercise that grades its own answer
  const bad = [];
  vxCatalog().forEach(it => {
    if (it.kind === "r" && !vxRuleVerbs(it.rule).length) return;
    if (it.x && !vxVerbReady(it.x)) { S.words[it.x.v.word.deckId + "_" + it.x.v.word.idx] = S.words[it.x.v.word.deckId + "_" + it.x.v.word.idx] || { st: 3 }; }
    const ex = vxMakeExercise(it, "");
    if (!ex) { if (it.x) bad.push(it.id + " none"); return; }
    if (vxGrade(ex.form.ans, ex) !== true) bad.push(it.id + " " + ex.form.ans);
    const html = vxPromptHtml(ex) + vxFormHtml(ex);
    if (/undefined|null|NaN/.test(html)) bad.push(it.id + " html");
  });
  out.bad = bad;
  return out;
});
ok(!r4.errs.length, "a Today session runs through its verb items", r4.errs.join(" | "));
ok(Object.keys(r4.kinds).length >= 2, "Today brings verb items", JSON.stringify(r4.kinds));
ok(r4.prompts.every(p => /Escribe|Di/.test(p)), "verb cards are in Spanish", r4.prompts.slice(0, 3).join(" ‖ "));
ok(r4.fb.some(f => /Correcto/.test(f)) && r4.fb.some(f => /Respuesta/.test(f)), "feedback, right and wrong, in Spanish", r4.fb.slice(0, 3).join(" ‖ "));
ok(r4.near, "a missing accent counts, and is told apart");
ok(!r4.accentFb || /Correcto.*se escribe/.test(r4.accentFb), "a card typed without accents: right, the spelling shown", r4.accentFb);
ok(r4.cmd === false, "a command with a pronoun in front (tu parle) is not accepted");
ok(!r4.bad.length, "every item and rule makes an exercise that accepts its own answer", r4.bad.slice(0, 10).join(" | "));

// 5 · reports, the learning log, switching back
const r5 = await ev(() => {
  const out = {};
  const x = vxVerb("aller");
  learnNoteVerb(x.F, "pc", "je", false, "ai allé", "suis allé");
  learnNoteVerb(x.F, "pr", "ils", false, "allent", "vont");
  out.mx = S.learn.verbs["aller"].mx;
  out.report = buildUsageReport(0).split("\n").filter(l => /^Verb/.test(l));
  const ll = buildLearningReport();
  out.learn = ll.includes("## VERB TRACK") && /Passé composé/.test(ll) && /Présent · Passé composé · Futur|Présent\/Passé composé\/Futur/.test(ll);
  out.ach = ACHIEVEMENTS.filter(a => a.id.startsWith("vx_")).map(a => [a.id, a.tiers.length]);
  const before = Object.keys(S.words).filter(k => !k.startsWith("vx_") && !S.words[k].rt).length;
  vxSwitchOff();
  out.off = { vx: Object.keys(S.words).filter(k => k.startsWith("vx_")).length, rt: Object.values(S.words).filter(w => w.rt).length,
    words: Object.keys(S.words).length === before, thread: vlLevelTenses() };
  return out;
});
ok(r5.mx.aux >= 1, "an avoir/être mix-up is logged as such", JSON.stringify(r5.mx));
ok(r5.report.length >= 2, "the usage report has the Verbs lines", r5.report.join(" | "));
ok(r5.learn, "the learning log has the French verb track");
ok(r5.ach.length === 3 && r5.ach[0][1] === 12, "three Grammar ladders, 12 tenses", JSON.stringify(r5.ach));
ok(r5.off.vx === 0 && r5.off.rt === 0 && r5.off.words, "switching back removes items and mirrors only", JSON.stringify(r5.off));
ok(!errors.length, "no page errors", errors.slice(0, 5).join(" | "));
console.log("accent card:", r4.accentFb || "(none in this session)");
console.log(r5.report.join("\n"));
console.log(`french: ${pass} passed, ${fail} failed`);
await browser.close();
process.exit(fail ? 1 : 0);
