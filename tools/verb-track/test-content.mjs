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
  ok(s.quiz.length >= 3 && s.quiz.length <= 5, `${s.id} has 3–5 questions`, s.quiz.length);
  ok(s.trap, `${s.id} has a trap`);
  s.quiz.forEach((q, i) => {
    const tag = `${s.id} q${i + 1}`;
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
// Every rule's sheet exists and each rule finds verbs.
G.VX_RULES.forEach(r => ok(ids.has(r.sheet), `rule ${r.id} sheet ${r.sheet}`));
console.log(`content: ${pass} passed, ${fail} failed`);
process.exit(fail ? 1 : 0);
