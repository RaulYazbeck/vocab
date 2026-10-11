// Content tests for the French app (verb-track-fr.js + grammar-sheets-fr.js):
// every sheet well-formed; every quiz answer, table and list = the verb
// engine; every point has questions; drawn quizzes checked; the forms the
// French layer adds agree with the decks (Subjonctif, participles).
import vm from "node:vm";
import { loadEngineFr } from "./load-fr.mjs";
const G = loadEngineFr();
vm.runInContext(`var S = { words: {}, verb: {}, learn: {} };`, G);
let pass = 0, fail = 0;
const ok = (c, m, x = "") => { if (c) pass++; else { fail++; console.log("  ✗", m, x); } };
const norm = s => String(s).trim().toLowerCase().replace(/’/g, "'");
const sheets = G.GS_SHEETS;
ok(G.VX_FR === true, "French layer on");
ok(sheets.length === 38, "38 sheets", sheets.length);
ok(G.VX_UNITS.length === 12, "12 tenses", G.VX_UNITS.length);
const units = new Set(G.VX_UNITS.map(u => u.id));
G.VX_UNITS.forEach(u => { ok(sheets.some(s => s.unit === u.id), `unit ${u.id} has sheets`); u.req.forEach(r => ok(units.has(r) && G.VX_UNIT[r].n < u.n, `unit ${u.id} needs ${r}, which comes before it`)); });
// No English or German in the lessons: Spanish and French only.
const EN = /\b(the|you|with|which|when|verb|tense|stem|ending|would|should|have|Build it)\b/;
const vx = id => G.vxVerb(id);
const ids = new Set();
sheets.forEach(s => {
  ok(!ids.has(s.id), `unique id ${s.id}`); ids.add(s.id);
  ok(units.has(s.unit), `${s.id} unit exists`);
  ok(s.title && s.why && Array.isArray(s.struct) && s.struct.length, `${s.id} has title/why/struct`);
  ok((s.rules || []).length <= 4, `${s.id} at most four rules`);
  const text = [s.title, s.why, s.trap, ...(s.rules || []), ...s.struct.map(b => b[0]), ...(s.ex || []).map(e => e[1]), ...s.quiz.map(q => (q.q || "") + " " + (q.why || "") + " " + (q.lbl || ""))].join(" \n ");
  ok(!EN.test(text), `${s.id} is Spanish / French only`, (text.match(EN) || [])[0]);
  if (s.mine) ok(!!G.VXF_GQ_SETS[s.mine], `${s.id} mine set ${s.mine}`);
  const pts = G.gqPoints(s);
  pts.forEach(at => ok(G.gqPool(s, at).length >= 3, `${s.id} point ${at} has three questions`, G.gqPool(s, at).length));
  s.quiz.forEach((q, i) => ok(pts.includes(q.at), `${s.id} q${i + 1} tests a point of the sheet`, q.at));
  const size = G.gqSheetSize(s);
  ok(size >= 3 && size <= 10, `${s.id} quiz is 3–10 questions`, size);
  ok(s.trap, `${s.id} has a trap`);
  s.quiz.forEach((q, i) => {
    const tag = `${s.id} q${i + 1}`;
    if (q.g) {
      ok(["form", "aux"].includes(q.g) && q.t && G.VXF_GQ_SETS[q.v], `${tag} generator is well-formed`, JSON.stringify(q));
      (q.fb || []).forEach(inf => ok(!!vx(inf) && G.VXF_GQ_SETS[q.v](vx(inf)), `${tag} fallback ${inf} is in the bank and the set`));
      ok(q.why, `${tag} has a why`);
      return;
    }
    ok(["type", "pick", "odd", "order", "why"].includes(q.k), `${tag} kind`);
    ok(q.why, `${tag} has a why`);
    if (q.k === "type") ok(Array.isArray(q.a) && q.a.length, `${tag} answers`);
    if (q.k === "pick" || q.k === "odd" || q.k === "why") ok(Array.isArray(q.o) && q.a >= 0 && q.a < q.o.length && new Set(q.o).size === q.o.length, `${tag} options`);
    if (q.k === "order") ok(Array.isArray(q.a) && q.a.length >= 3, `${tag} blocks`);
    if (q.chk) {
      const [inf, kind, p] = q.chk, x = vx(inf);
      ok(!!x, `${tag} verb ${inf} in the bank`);
      if (!x) return;
      const f = G.vxForm(x, kind, p);
      ok(!!f, `${tag} engine has ${inf} ${kind} ${p}`);
      if (!f) return;
      const want = q.k === "type" ? q.a : [q.o[q.a]];
      want.forEach(w => ok(f.acc.some(a => G.vxEq(a, w)), `${tag} ${inf} ${kind} ${p}: "${w}" vs engine`, f.acc.join(" | ")));
      if (q.k === "pick") q.o.forEach((o, j) => { if (j !== q.a) ok(!f.acc.some(a => G.vxEq(a, o)), `${tag} wrong option "${o}" is really wrong`); });
    }
  });
});
// Tables and 6-form lists: every form one the engine makes for that verb and person.
const PMAP = { je: "je", tu: "tu", "il/elle/on": "il", nous: "nous", vous: "vous", "ils/elles": "ils" };
const KINDS = ["pr", "im", "fu", "co", "fp", "vd", "pc", "pq", "cp", "sj", "ip"];
const formsOf = (inf, p) => { const x = vx(inf); if (!x) return null; const out = new Set(); KINDS.forEach(k => { const f = G.vxForm(x, k, p); if (f) f.acc.forEach(a => out.add(norm(a))); }); return out; };
const strip = t => norm(String(t).replace(/\*\*|\{\{|\}\}/g, ""));
sheets.forEach(s => {
  if (s.table) s.table.rows.forEach(row => s.table.head.slice(1).forEach((inf, j) => {
    const fs = formsOf(inf, PMAP[row[0]]);
    ok(!!fs, `${s.id} table ${inf} ${row[0]} known`);
    if (fs) ok(fs.has(strip(row[j + 1])), `${s.id} table ${inf} ${row[0]}: "${row[j + 1]}"`, [...fs].slice(0, 10).join(" | "));
  }));
  (s.lines || []).forEach(([label, text]) => {
    const six = text.split(" · ");
    if (six.length !== 6) return;
    ["je", "tu", "il", "nous", "vous", "ils"].forEach((p, i) => { const fs = formsOf(label, p); ok(fs && fs.has(strip(six[i])), `${s.id} line ${label} ${p}: "${six[i]}"`, fs ? [...fs].slice(0, 8).join(" | ") : "no verb"); });
  });
});
// The forms the French layer adds, against the decks.
let sj = 0, pp = 0;
G.vxVerbs().forEach(x => (G.vxfRefsIndex().get(x.inf) || []).forEach(r => {
  if (r.tense === "sj") { sj++; const f = G.vxForm(x, "sj", r.person); ok(f && f.acc.some(a => G.vxEq(a, r.ans)), `subjonctif card ${x.inf} ${r.person}: ${r.ans}`, f && f.ans); }
  if (r.pp) { pp++; ok(G.vxEq(x.F.pp, r.pp), `participle card ${x.inf}: ${r.pp}`, x.F.pp); }
}));
ok(sj >= 60 && pp >= 100, `deck cards checked (${sj} subjonctif, ${pp} participles)`);
// Every rule's sheet exists; every per-verb item kind's sheet exists.
G.VX_RULES.forEach(r => ok(ids.has(r.sheet), `rule ${r.id} sheet ${r.sheet}`));
G.vxCatalog().filter(it => it.x).forEach(it => ok(ids.has(it.sheet), `item ${it.id} sheet ${it.sheet}`));
// Every Spanish string the screens ask for exists.
import fs from "node:fs";
const src = ["../../js/grammar-ui.js", "../../js/verb-track.js", "../../js/grammar-quiz.js"].map(f => fs.readFileSync(new URL(f, import.meta.url), "utf8")).join("\n");
const keys = [...src.matchAll(/vxT\("((?:[^"\\]|\\.)*)"/g)].map(m => JSON.parse(`"${m[1]}"`));
[...new Set(keys)].forEach(k => ok(Object.prototype.hasOwnProperty.call(G.VXF_ES, k), `Spanish for "${k}"`));
// Grading: pronouns, elision, accents.
const ex = (inf, k, p) => ({ form: G.vxForm(vx(inf), k, p) });
ok(G.vxGrade("j'aime", ex("aimer", "pr", "je")) === true, "j'aime accepted for je ___ (aimer)");
ok(G.vxGrade("que j'aille", ex("aller", "sj", "je")) === true, "que j'aille accepted");
ok(G.vxGrade("nous nous levons", ex("se lever", "pr", "nous")) === true, "nous nous levons accepted");
ok(G.vxGrade("leve-toi !", ex("se lever", "ip", "tu")) === "near", "missing accent is near");
ok(G.vxGrade("parler", ex("parler", "pp", "il")) !== true, "parler ≠ parlé");
ok(G.vxGrade("je paye", ex("payer", "pr", "je")) === true, "je paye accepted");
ok(G.vxGrade("elle est allée", ex("aller", "pc", "elle")) === true && G.vxGrade("est allé", ex("aller", "pc", "elle")) !== true, "agreement required for elle");
// Generated questions, many draws, met or not.
vm.runInContext(`var __met = false; var __lemma = vxLemma; vxLemma = x => __met ? { st: 3, met: "2026-01-01" } : __lemma(x);`, G);
const checkQ = (q, tag) => {
  if (q.k === "type") ok(q.a.length && q.a.every(a => String(a).trim()), `${tag} has answers`, JSON.stringify(q));
  else if (q.k !== "order") {
    ok(Array.isArray(q.o) && q.o.length >= 2 && q.a >= 0 && q.a < q.o.length, `${tag} options`, JSON.stringify(q));
    ok(new Set(q.o.map(o => norm(o))).size === q.o.length, `${tag} options differ`, q.o.join(" | "));
  }
  ok(!/undefined|null|NaN/.test(JSON.stringify(q.q) + JSON.stringify(q.o || q.a)), `${tag} no undefined`, q.q);
  if (!q.inf) return;
  const f = G.vxForm(vx(q.inf), q.t, q.p);
  ok(!!f, `${tag} ${q.inf} ${q.t} ${q.p} exists`);
  if (!f) return;
  if (q.k === "type") ok(q.a.every(a => f.acc.includes(a)), `${tag} answer = engine`);
  else if (q.aux) ok(q.o[q.a] === f.ans.split(" ")[0], `${tag} aux = engine`, `${q.o[q.a]} vs ${f.ans}`);
  else {
    ok(f.acc.some(a => G.vxEq(a, q.o[q.a])), `${tag} right option = engine`, `${q.o[q.a]} vs ${f.acc}`);
    q.o.forEach((o, j) => { if (j !== q.a) ok(!f.acc.some(a => G.vxEq(a, o)), `${tag} wrong option "${o}" is really wrong (${q.inf} ${q.t} ${q.p})`); });
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
      ok(new Set(quiz.map(q => q.at)).size >= Math.min(size, G.gqPoints(s).length), `${s.id} covers every point`);
      quiz.forEach((q, i) => { drawn++; checkQ(q, `${s.id} draw ${r} q${i + 1} (met=${met})`); });
    }
  });
  G.VX_UNITS.forEach(u => {
    const size = G.gqMasterySize(u.id);
    ok(size >= 8 && size <= 20, `mastery ${u.id} is 8–20`, size);
    for (let r = 0; r < 10; r++) {
      const quiz = G.gqMasteryQuiz(u.id);
      ok(quiz.length === size, `mastery ${u.id} draws ${size}`, quiz.length);
      ok(G.vxSheetIds(u.id).every(id => quiz.some(q => q.sid === id)), `mastery ${u.id} asks about every sheet`);
      quiz.forEach((q, i) => { drawn++; checkQ(q, `mastery ${u.id} draw ${r} q${i + 1}`); });
    }
  });
}
console.log(`  (${drawn} drawn questions checked)`);
console.log(`content-fr: ${pass} passed, ${fail} failed`);
process.exit(fail ? 1 : 0);
