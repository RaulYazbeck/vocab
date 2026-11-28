// The old verb cards' sentences (js/verb-track.js vxSentenceBank /
// vxWithSentence): every card the verb track takes over had a sentence the
// cloze asked; once taken over nothing asked it (208 Known cards' sentences
// on 27 Nov 2026). Now verb exercises are asked in them now and then.
//
// Checked: every taken-over card's sentence can be asked by an exercise of
// its verb and tense (its item, its rule, or its ledger cell) — with every
// tense open, so a tense that opens later (Konjunktiv II, Passiv) can't
// lose its cards' sentences; the gap is the exercise's own form, word for
// word; the card shows the sentence, its English, the gap(s) and no
// pronoun; the form, or the whole sentence, typed back is right, another
// form wrong; the feedback shows the whole sentence; Today asks some
// exercises in sentences, never a new item's first check; the usage log
// counts them.
//   node t-sentences.mjs   (serve the repo root on :8765; npm install once in ../audio/tests)
import { openApp } from "./browser.mjs";
const { browser, page, errors } = await openApp();
let pass = 0, fail = 0;
const ok = (c, m, x = "") => { if (c) { pass++; console.log("  ✓", m); } else { fail++; console.log("  ✗", m, x); } };

const r = await page.evaluate(() => {
  const out = {};
  // every tense open: the cards of every legacy deck are taken over
  Object.keys(VX_UNIT).forEach(u => { if (S.verb && S.verb.u) S.verb.u[u] = S.verb.u[u] || "practising"; });
  vxCatalogReset();
  const bank = vxSentenceBank(), map = vxRetireMap();
  let cards = 0, reach = 0; const miss = [], byTense = {};
  bank.forEach((list, k) => list.forEach(s => {
    cards++;
    const c = map.get(s.key), x = vxVerb(c.inf), t = k.split("|")[1];
    byTense[t] = byTense[t] || [0, 0]; byTense[t][0]++;
    const routes = [];
    if (c.item) { const it = vxCatalog().find(i => i.id === c.item); const ex = it && vxMakeExercise(it, ""); if (ex) routes.push(ex); }
    if (c.rule && VX_RULE[c.rule]) {
      const R = VX_RULE[c.rule], ps = vxRulePersons(R, x);
      for (const p of ps.slice(0, 1)) { const form = vxForm(x, R.kind, p, { modal: "müssen" }); if (form) routes.push({ kind: R.kind, x, p, form, tense: VX_KIND_TENSE[R.kind], rule: c.rule, modal: R.kind === "pvmod" ? "müssen" : "" }); }
    }
    const cell = vxCellExercise({ x, t: c.t });
    if (cell) routes.push(cell);
    const hit = routes.some(ex => vxSentenceFits(ex).some(f => f.key === s.key));
    if (hit) { reach++; byTense[t][1]++; return; }
    // Not reachable: why. Only these reasons are allowed —
    //   tense   the sentence has no form of the verb in that tense, for any
    //           person (an infinitive, a bare participle, a passive)
    //   person  only a person the exercises never ask for this verb has it
    //           (gefallen is asked as es gefällt)
    //   none    no exercise asks this verb in this tense
    // — anything else is a sentence lost: a bug.
    const kinds = [...new Set([...routes.map(e => e.kind), c.t])];
    const modals = ["", ...Object.keys(VX_PV_MODALS)];
    const fitsAny = [...PERSONS, VX_IT].filter(p => kinds.some(k => modals.some(m => { const f = vxForm(x, k, p, { modal: m }); return f && vxSentenceGap(s.de, f.ans); })));
    const why = !routes.length ? "none" : !fitsAny.length ? "tense" : !routes.some(e => vxSentPersons(e).some(p => fitsAny.includes(p))) ? "person" : "LOST";
    (out.why = out.why || {})[why] = (out.why[why] || 0) + 1;
    if (miss.length < 30) miss.push(`${why} · ${s.key} [${t} ${c.p} · ${c.item || c.rule}] «${s.de}» routes: ${routes.map(e => (e.item || e.rule || e.cell) + "=" + e.p + " " + e.form.ans).join("; ")}`);
  }));
  out.cover = { cards, reach, byTense, miss, why: out.why || {} };
  // the gap is the form, word for word
  out.gaps = [
    vxSentenceGap("Ich bin noch nie in Berlin gewesen.", "bin gewesen"),
    vxSentenceGap("Er ruft morgen an.", "ruft an"),
    vxSentenceGap("Ich war gestern im Kino.", "war"),
    vxSentenceGap("Ich habe Glück gehabt.", "hat gehabt"),       // another person: null
    vxSentenceGap("Wir haben es gemacht, aber nicht gern gemacht.", "haben gemacht"),
    vxSentenceGap("Er hätte es gern gemacht, wenn er gekonnt hätte.", "hätte gemacht gekonnt"), // three gaps: null
  ];
  // one exercise, forced into a sentence: the card, the grading, the feedback
  let ex = null;
  for (const it of vxCatalog()) {
    if (it.kind !== "p2") continue;
    const e = vxMakeExercise(it, ""); const s = e && vxWithSentence(e, true);
    if (s && s.sent && s.form.ans.split(" ").length === 2) { ex = s; break; }
  }
  out.ex = ex && { q: ex.sent.q, de: ex.sent.de, en: ex.sent.en, ans: ex.form.ans, p: ex.p };
  if (ex) {
    const html = vxPromptHtml(ex);
    const tmp = document.createElement("div"); tmp.innerHTML = html;
    out.card = { gaps: tmp.querySelectorAll(".vx-sent .vx-gap").length, en: (tmp.querySelector(".vx-sent-en") || {}).textContent || "",
      pron: !!tmp.querySelector(".vx-pron"), text: tmp.querySelector(".vx-sent").textContent };
    out.grade = { form: vxGrade(ex.form.ans, ex), whole: vxGrade(ex.sent.de, ex), wrong: vxGrade("hat gemacht", ex) };
    const fb = document.createElement("div"); fb.innerHTML = vxFormHtml(ex);
    out.fb = (fb.querySelector(".vx-sent-full") || {}).textContent || "";
    out.say = vxSayText(ex);
  }
  // Today: due verb items, some in sentences; a new item's first check never
  const now = Date.now();
  vxCatalog().filter(i => i.kind !== "r").slice(0, 60).forEach(i => { const ws = S.words[vxKey(i.id)] || (S.words[vxKey(i.id)] = { st: 3, correct: 3, wrong: 0 }); ws.st = ws.st || 3; ws.dueAt = now - 864e5; });
  invalidatePathScan();
  const rnd = Math.random; let seq = 0; Math.random = () => (seq++ % 7) / 7;
  const q = buildPathQueue("long");
  Math.random = rnd;
  const vx = q.items.filter(x => x.w && x.w.vx);
  out.today = { vx: vx.length, sent: vx.filter(x => x.w.vx.sent).length, freshSent: vx.filter(x => x.fresh && x.w.vx.sent).length };
  // the usage log counts answers asked in a sentence
  logEvent("answer", { m: "path:verb", ok: true, typed: true, ms: 3000, sent: 1 });
  out.vsent = usageDay().vsent;
  out.line = buildUsageReport(0).split("\n").find(l => l.startsWith("Verb exercises asked in an old card's sentence")) || "";
  return out;
});

const c = r.cover;
ok(c.cards > 700, `taken-over cards with a sentence: ${c.cards}`);
ok(!c.why.LOST, `every sentence that shows its tense can be asked by its verb's exercise: ${c.reach}/${c.cards} (by tense ${JSON.stringify(c.byTense)}; not askable: ${JSON.stringify(c.why)})`, "\n    " + c.miss.filter(m => /^LOST/.test(m)).join("\n    "));
ok(c.reach / c.cards >= 0.95, `…that's ${Math.round(c.reach / c.cards * 100)}% of them (at least 95%)`, "\n    " + c.miss.join("\n    "));
console.log("    not askable, and why:\n    " + c.miss.join("\n    "));
ok(r.gaps[0] === "Ich ___ noch nie in Berlin ___." && r.gaps[1] === "Er ___ morgen ___." && r.gaps[2] === "Ich ___ gestern im Kino.", "the gap is the form, one or two gaps", JSON.stringify(r.gaps.slice(0, 3)));
ok(r.gaps[3] === null, "another person's form: no sentence", String(r.gaps[3]));
ok(r.gaps[4] === "Wir ___ es ___, aber nicht gern gemacht.", "a form's words gapped where they first come", String(r.gaps[4]));
ok(r.gaps[5] === null, "more than two gaps: no sentence", String(r.gaps[5]));
ok(!!r.ex, "a Perfekt item asked in a sentence", JSON.stringify(r.ex));
if (r.ex) {
  ok(r.card.gaps === (r.ex.q.match(/___/g) || []).length && r.card.gaps >= 1, `the card: the sentence with its gap(s) — «${r.card.text}»`, JSON.stringify(r.card));
  ok(!r.card.pron, "…no pronoun line (the sentence's subject says who)");
  ok(r.card.en === r.ex.en && r.ex.en.length > 0, `…and its English: «${r.card.en}»`);
  ok(r.grade.form === true, `the form typed: right (${r.ex.ans})`);
  ok(r.grade.whole === true, "the whole sentence typed back: right");
  ok(r.grade.wrong !== true, "another form: not right", String(r.grade.wrong));
  ok(r.fb === r.ex.de, `the feedback shows the whole sentence («${r.fb}»)`);
  ok(r.say === r.ex.de, "…and says it");
}
ok(r.today.vx > 10 && r.today.sent > 0 && r.today.sent < r.today.vx, `Today: ${r.today.sent} of ${r.today.vx} verb exercises in a sentence`, JSON.stringify(r.today));
ok(r.today.freshSent === 0, "…never a new item's first check");
ok(r.vsent && r.vsent[0] >= 1 && r.vsent[1] >= 1, "the usage log counts them", JSON.stringify(r.vsent));
ok(/Verb exercises asked in an old card's sentence: \d+ \(\d+% right\)/.test(r.line), "…and the report says so", r.line);
ok(!errors.length, "no page errors", errors.join("\n"));
await browser.close();
console.log(`\nsentences: ${pass} passed, ${fail} failed`);
process.exit(fail ? 1 : 0);
