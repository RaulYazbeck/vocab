// Content tests: every sheet quiz answer the engine can produce must
// match it; every sheet is well-formed; every unit has its sheets.
import { loadEngine } from "./load.mjs";
const G = loadEngine();
let pass = 0, fail = 0;
const ok = (c, m, x = "") => { if (c) pass++; else { fail++; console.log("  ✗", m, x); } };
const norm = s => String(s).trim().toLowerCase();
const sheets = G.GS_SHEETS;
ok(sheets.length === 37, "37 sheets", sheets.length);
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
// Every rule's sheet exists and each rule finds verbs.
G.VX_RULES.forEach(r => ok(ids.has(r.sheet), `rule ${r.id} sheet ${r.sheet}`));
console.log(`content: ${pass} passed, ${fail} failed`);
process.exit(fail ? 1 : 0);
