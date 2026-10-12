// Content tests: every sheet quiz answer the engine can produce must
// match it; every sheet is well-formed; every unit has its sheets.
import { loadEngine } from "./load.mjs";
const G = loadEngine();
let pass = 0, fail = 0;
const ok = (c, m, x = "") => { if (c) pass++; else { fail++; console.log("  ✗", m, x); } };
const norm = s => String(s).trim().toLowerCase();
const sheets = G.GS_SHEETS;
ok(sheets.length === 38, "38 sheets", sheets.length);
const units = new Set(G.VX_UNITS.map(u => u.id));
G.VX_UNITS.forEach(u => ok(sheets.some(s => s.unit === u.id), `unit ${u.id} has sheets`));
const ids = new Set();
sheets.forEach(s => {
  ok(!ids.has(s.id), `unique id ${s.id}`); ids.add(s.id);
  ok(units.has(s.unit), `${s.id} unit exists`);
  ok(s.title && s.why && Array.isArray(s.struct) && s.struct.length, `${s.id} has title/why/struct`);
  // Every point of the sheet has questions; every question tests a point.
  const pts = G.gqPoints(s);
  pts.forEach(at => ok(G.gqPool(s, at).length >= 1, `${s.id} point ${at} has a question`));
  // A generated question can come up empty (no verb fits, too few wrong
  // options): every point also has a written one, so it is always asked.
  pts.forEach(at => ok(G.gqPool(s, at).some(q => !q.g), `${s.id} point ${at} has a written question`));
  s.quiz.forEach((q, i) => ok(pts.includes(q.at), `${s.id} q${i + 1} tests a point of the sheet`, q.at));
  const size = G.gqSheetSize(s);
  ok(size >= 3 && size <= 10, `${s.id} quiz is 3–10 questions`, size);
  ok(s.trap, `${s.id} has a trap`);
  s.quiz.forEach((q, i) => {
    const tag = `${s.id} q${i + 1}`;
    if (q.g) {
      ok(["form", "aux"].includes(q.g) && q.t && G.GQ_SETS[q.v], `${tag} generator is well-formed`, JSON.stringify(q));
      ok(q.why, `${tag} has a why`);
      return;
    }
    ok(["type", "pick", "odd", "order", "why"].includes(q.k), `${tag} kind`);
    ok(q.why, `${tag} has a why`);
    if (q.k === "type") ok(Array.isArray(q.a) && q.a.length, `${tag} answers`);
    if (q.k === "pick" || q.k === "odd" || q.k === "why") ok(Array.isArray(q.o) && q.a >= 0 && q.a < q.o.length, `${tag} options`);
    if (q.k === "order") ok(Array.isArray(q.a) && q.a.length >= 3, `${tag} blocks`);
    if (q.chk) {
      const [inf, kind, p, modal] = q.chk;
      const v = G.verbBank().byInf.get(inf);
      ok(!!v, `${tag} verb ${inf} in the engine`);
      if (!v) return;
      const x = { v, inf, F: v.F, k: G.vxKind(v.F) };
      const f = G.vxForm(x, kind, p, { modal });
      ok(!!f, `${tag} engine has ${inf} ${kind} ${p}`);
      if (!f) return;
      const want = q.k === "type" ? q.a[0] : q.o[q.a];
      ok(f.acc.map(norm).includes(norm(want)), `${tag} ${inf} ${kind} ${p}: "${want}" vs engine`, f.acc.join(" | "));
    }
  });
});
// Tables and lines: every form must be one the engine makes for that
// verb and person (any tense) — catches typos in the sheets.
const PMAP = { "ich": "ich", "du": "du", "er/sie/es": "er", "wir": "wir", "ihr": "ihr", "sie/Sie": "sie", "Sie": "Sie" };
const formsOf = (inf, p) => {
  const v = G.verbBank().byInf.get(inf); if (!v) return null;
  const x = { v, inf, F: v.F, k: G.vxKind(v.F) }, out = new Set();
  ["pr", "pt", "pf", "pq", "fu", "im", "k2o", "k2w", "prrefl", "imfull"].forEach(k => { const f = G.vxForm(x, k, p); if (f) f.acc.forEach(a => out.add(norm(a))); });
  if (v.F.im && v.F.im[p]) out.add(norm(v.F.im[p] + (p === "Sie" ? " sie" : "")));
  return out;
};
const strip = t => norm(String(t).replace(/\*\*|\{\{|\}\}|\(\(|\)\)/g, "").replace(/!$/, "").replace(/ … /g, " "));
sheets.forEach(s => {
  if (s.table) {
    const verbs = s.table.head.slice(1);
    s.table.rows.forEach(row => {
      const p = PMAP[row[0]];
      verbs.forEach((h, j) => {
        const inf = h.replace(/ \+ .*/, "").trim();
        const fs = p && formsOf(inf.includes("+") ? inf.split(" ")[0] : inf, p);
        if (!fs || h.includes("+")) return;
        ok(fs.has(strip(row[j + 1])), `${s.id} table ${inf} ${row[0]}: "${row[j + 1]}"`, [...fs].slice(0, 8).join(" | "));
      });
    });
  }
  (s.lines || []).forEach(([label, text]) => {
    const fs6 = text.split(" · ");
    if (fs6.length !== 6) return;
    ["ich", "du", "er", "wir", "ihr", "sie"].forEach((p, i) => {
      const fs = formsOf(label, p);
      if (fs) ok(fs.has(strip(fs6[i])), `${s.id} line ${label} ${p}: "${fs6[i]}"`, [...fs].slice(0, 8).join(" | "));
    });
  });
});
// ── Generated questions ──
// Every sheet's quiz drawn many times — with no verb met (the fallback
// verbs) and with every verb met — each answer is the engine's, and no
// wrong option is ever a right answer.
const vm = await import("node:vm");
vm.runInContext(`var S = { words: {}, verb: {}, learn: {} }; var __met = false; var __lemma = vxLemma; vxLemma = x => __met ? { st: 3, met: "2026-01-01" } : __lemma(x);`, G);
const checkQ = (q, tag) => {
  if (q.k === "type") ok(q.a.length && q.a.every(a => String(a).trim()), `${tag} has answers`, JSON.stringify(q));
  else if (q.k !== "order") {
    ok(Array.isArray(q.o) && q.o.length >= 2 && q.a >= 0 && q.a < q.o.length, `${tag} options`, JSON.stringify(q));
    ok(new Set(q.o.map(o => norm(o))).size === q.o.length, `${tag} options differ`, q.o.join(" | "));
  }
  if (!q.inf) return;
  const x = G.vxVerb(q.inf), f = x && G.vxForm(x, q.t, q.p, { modal: q.modal || "müssen" });
  ok(!!f, `${tag} ${q.inf} ${q.t} ${q.p} exists`);
  if (!f) return;
  if (q.k === "type") ok(q.a.every(a => f.acc.includes(a)), `${tag} answer = engine`, `${q.a} vs ${f.acc}`);
  else if (q.aux) {
    // An auxiliary pick: the right one is the engine's first word.
    ok(q.o[q.a] === f.ans.split(" ")[0], `${tag} aux = engine`, `${q.o[q.a]} vs ${f.ans}`);
  } else {
    ok(f.acc.some(a => G.vxEq(a, q.o[q.a])), `${tag} right option = engine`, `${q.o[q.a]} vs ${f.acc}`);
    q.o.forEach((o, j) => { if (j !== q.a) ok(!f.acc.some(a => G.vxEq(a, o)), `${tag} wrong option "${o}" is really wrong`, f.acc.join(" | ")); });
  }
};
let drawn = 0;
for (const met of [false, true]) {
  vm.runInContext(`__met = ${met};`, G);
  sheets.forEach(s => {
    const size = G.gqSheetSize(s);
    for (let r = 0; r < 25; r++) {
      const quiz = G.gqSheetQuiz(s);
      ok(quiz.length === size, `${s.id} draws ${size} questions (met=${met})`, quiz.length);
      ok(new Set(quiz.map(q => q.at)).size >= Math.min(size, G.gqPoints(s).length), `${s.id} covers every point`, quiz.map(q => q.at).join(","));
      quiz.forEach((q, i) => { drawn++; checkQ(q, `${s.id} draw ${r} q${i + 1} (met=${met})`); });
    }
  });
  G.VX_UNITS.forEach(u => {
    const size = G.gqMasterySize(u.id);
    ok(size >= 8 && size <= 20, `mastery ${u.id} is 8–20`, size);
    for (let r = 0; r < 10; r++) {
      const quiz = G.gqMasteryQuiz(u.id);
      ok(quiz.length === size, `mastery ${u.id} draws ${size}`, quiz.length);
      const sheetsHit = new Set(quiz.map(q => q.sid));
      ok(G.vxSheetIds(u.id).every(id => sheetsHit.has(id)), `mastery ${u.id} asks about every sheet`, [...sheetsHit].join(","));
      quiz.forEach((q, i) => { drawn++; checkQ(q, `mastery ${u.id} draw ${r} q${i + 1}`); });
    }
  });
}
console.log(`  (${drawn} drawn questions checked)`);
// ── Grading of typed answers ──
// [verb, form kind, person, typed, expected: true / "near" / false]
const G2 = (inf, kind, p) => G.vxForm(G.vxVerb(inf), kind, p);
// The one-letter-typo helper lives in ui-helpers.js (browser only); none
// of these cases is a typo, so "no typo" stands in for it here.
if (typeof G.isNearMiss !== "function") vm.runInContext("var isNearMiss = () => false;", G);
[
  ["vermieten", "im", "Sie", "vermieten", false], ["vermieten", "im", "Sie", "vermieten Sie", true],
  ["vermieten", "im", "Sie", "vermieten sie", true], ["vermieten", "im", "Sie", "Vermieten Sie!", true],
  ["vermieten", "im", "Sie", "Sie vermieten", false], ["kommen", "im", "du", "du komm", false],
  ["kommen", "im", "du", "komm!", true], ["anrufen", "imsep", "Sie", "rufen sie an", true],
  ["anrufen", "imsep", "Sie", "Rufen Sie an!", true], ["anrufen", "imsep", "du", "ruf an", true],
  ["sich setzen", "imsep", "Sie", "setzen sie sich", true], ["fahren", "im", "du", "fahr", true],
  ["fahren", "pr", "du", "du fährst", true], ["fahren", "pr", "du", "fährst", true], ["fahren", "pr", "du", "fahrst", true],
  ["haben", "k2o", "ich", "hatte", true], ["haben", "k2o", "ich", "ich hätte", true], ["einkaufen", "prsep", "du", "kaufst … ein", true],
  // the stem change: one person, the whole verb (prefix included), umlaut optional
  ["abfahren", "sc", "du", "fährst", false], ["abfahren", "sc", "du", "fährst ab", true], ["abfahren", "sc", "du", "fahrst ab", true],
  ["abfahren", "sc", "er", "fährt ab", true], ["abfahren", "sc", "du", "fährst fährt", false], ["nehmen", "sc", "er", "nehmt", false],
  // the whole verb is the answer: prefix, pronoun and Sie included
  ["abfahren", "pr", "wir", "fahren", false], ["abfahren", "pr", "wir", "fahren ab", true], ["abfahren", "pt", "er", "fuhr ab", true],
  ["abfahren", "pt", "er", "fuhr", false], ["sich treffen", "pr", "du", "triffst dich", true], ["sich treffen", "pr", "du", "triffst", false],
  ["sich treffen", "pf", "du", "hast getroffen", false], ["sich treffen", "pf", "du", "hast dich getroffen", true],
  ["mitnehmen", "im", "du", "nimm", false], ["mitnehmen", "im", "du", "nimm mit", true], ["sich setzen", "im", "Sie", "setzen Sie sich", true],
  ["sich anmelden", "prsep", "du", "meldest dich an", true], ["sich anmelden", "prsep", "du", "meldest an", false],
].forEach(([inf, kind, p, typed, want]) => {
  const got = G.vxGrade(typed, { kind, form: G2(inf, kind, p) });
  ok(got === want, `grading: ${inf} ${kind} ${p} "${typed}" → ${want}`, String(got));
});
// "With each other" verbs carry their context in the singular only.
[["sich treffen", "prrefl", "du", "mit Anna"], ["sich treffen", "prrefl", "wir", undefined], ["sich treffen", "pf", "ich", "mit Anna"],
 ["sich streiten", "prrefl", "er", "mit Anna"], ["sich treffen", "imsep", "du", "mit Anna"], ["sich treffen", "imsep", "ihr", undefined],
 ["sich freuen", "prrefl", "du", undefined]].forEach(([inf, kind, p, want]) => {
  const f = G2(inf, kind, p);
  ok(f && f.ctx === want, `context: ${inf} ${kind} ${p} → ${want || "none"}`, f && f.ctx);
});
// Every rule's sheet exists and each rule finds verbs.
G.VX_RULES.forEach(r => ok(ids.has(r.sheet), `rule ${r.id} sheet ${r.sheet}`));
console.log(`content: ${pass} passed, ${fail} failed`);
process.exit(fail ? 1 : 0);
