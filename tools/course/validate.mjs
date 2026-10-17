// The course validator — every later session runs it after adding data.
//
//   node validate.mjs              # the checks below; exit 1 on a failure
//   BOOK=<dir> node validate.mjs   # also: no item copies a sentence of the
//                                  # book (dir: chapter texts from pdftotext,
//                                  # kept OUT of the repo)
//
// Checks: every data file is loaded by de/index.html (and none by the
// French app) · the format of every section, sheet, rule, drill set and
// item · every item's rules exist and every rule belongs to a sheet ·
// every built section ends with a production drill · every blueprint
// exercise of a built section has a status, and every status points at
// something real · each mirrored exercise has 8+ items of our own ·
// every accepted answer passes the checker, tiles rebuild it, no
// distractor is a right answer · the diagnosis of typical mistakes names
// the right rule · engine-checkable forms agree with the verb engine.
import fs from "node:fs";
import path from "node:path";
import { loadCourse, courseFiles, ROOT } from "./load.mjs";

let pass = 0, fail = 0;
const bad = [];
function ok(c, msg) { if (c) pass++; else { fail++; bad.push(msg); } }

const C = loadCourse();
const { CX } = C;
const blueprint = JSON.parse(fs.readFileSync(path.join(ROOT, "tools/book/blueprint.json"), "utf8"));

// ── files ──
const listed = courseFiles();
const onDisk = ["js/course-de.js", "js/course-ui.js", ...fs.readdirSync(path.join(ROOT, "js/course")).filter(f => f.endsWith(".js")).map(f => "js/course/" + f)];
onDisk.forEach(f => ok(listed.includes(f), `de/index.html loads ${f}`));
ok(listed[0] === "js/course-de.js" && listed[listed.length - 1] === "js/course-ui.js", "the engine first, the screens last");
ok(!/course/.test(fs.readFileSync(path.join(ROOT, "fr/index.html"), "utf8")), "the French app loads nothing of the course");
ok(!CX.orphans, `packs only fill sections of the skeleton (${(CX.orphans || []).join(", ")})`);
// Every script of the German app shares one global scope: a name declared
// twice silently replaces the first (cxKey once did).
{
  const html = fs.readFileSync(path.join(ROOT, "de/index.html"), "utf8"), seen = new Map();
  [...html.matchAll(/<script src="\.\.\/(js\/[^"]+\.js)"/g)].map(m => m[1]).forEach(f => {
    for (const m of fs.readFileSync(path.join(ROOT, f), "utf8").matchAll(/^(?:async )?function (\w+)\s*\(|^(?:const|let|var) (\w+)\b/gm)) {
      const n = m[1] || m[2];
      ok(!seen.has(n), `${n} is declared once (${seen.get(n) || ""} ${f})`);
      seen.set(n, f);
    }
  });
}

// ── skeleton ──
const ids = new Set();
CX.sections.forEach(s => {
  ok(!ids.has(s.id), `section ${s.id} once`); ids.add(s.id);
  ok(/^s\d\.[a-z0-9]+$/.test(s.id), `section id ${s.id}`);
  ok(CX.stages.some(st => st.id === s.stage), `${s.id}: its stage exists`);
  ok(["M", "S", "C"].includes(s.prio), `${s.id}: prio M/S/C`);
  ok(/^(A1|A2|B1|B2|C1)$/.test(s.level), `${s.id}: level`);
  ok(!!s.title, `${s.id}: title`);
  (s.book || []).forEach(([ch, head]) => {
    ok(!!blueprint[ch], `${s.id}: chapter ${ch} is in the blueprint`);
    if (blueprint[ch]) ok(head === "" || blueprint[ch].sections.includes(head), `${s.id}: "${head}" is a section of ${ch}`);
  });
  (s.verb || []).forEach(v => ok(!!C.GS_SHEET_BY_ID[v], `${s.id}: verb sheet ${v} exists`));
});

// ── rules and sheets ──
Object.values(CX.rules).forEach(r => {
  ok(!/_/.test(r.id), `rule id ${r.id}: no "_" (S.words keys are deck_id)`);
  ok(/^[a-z0-9]+(\.[a-z0-9-]+)+$/.test(r.id), `rule id ${r.id}: shape area.name`);
  ok(!!CX.sheets[r.sheet] && CX.sheets[r.sheet].rid.includes(r.id), `rule ${r.id} belongs to a sheet`);
  ok(r.title && r.title !== r.id, `rule ${r.id}: a short title`);
});
Object.values(CX.sheets).forEach(sh => {
  ok(Array.isArray(sh.struct) && sh.struct.length >= 2, `${sh.id}: struct`);
  ok(!!sh.why && !!sh.trap && (sh.ex || []).length >= 3, `${sh.id}: why, trap, 3+ examples`);
  ok((sh.rules || []).length >= 2 && sh.rules.length <= 4 && sh.rid.length === sh.rules.length, `${sh.id}: 2–4 rules, each with an id`);
  const pts = C.gqPoints(sh);
  pts.forEach(at => ok(sh.quiz.some(q => q.at === at), `${sh.id}: a quiz question on ${at}`));
  ok(sh.quiz.length >= 5, `${sh.id}: quiz pool 5+`);
  sh.quiz.forEach((q, i) => {
    ok(pts.includes(q.at), `${sh.id} quiz ${i}: point ${q.at}`);
    ok(["pick", "odd", "why", "type", "order"].includes(q.k), `${sh.id} quiz ${i}: kind`);
    if (q.k === "type") { ok(Array.isArray(q.a) && q.a.length, `${sh.id} quiz ${i}: answers`); ok(q.cx === true, `${sh.id} quiz ${i}: typed course questions use the course checker (cx: true)`); }
    if (["pick", "odd", "why"].includes(q.k)) ok(Array.isArray(q.o) && q.a >= 0 && q.a < q.o.length && new Set(q.o).size === q.o.length, `${sh.id} quiz ${i}: options`);
    if (q.k === "order") ok(Array.isArray(q.a) && q.a.length >= 3, `${sh.id} quiz ${i}: blocks`);
    ok(!!q.why, `${sh.id} quiz ${i}: why`);
  });
  for (let k = 0; k < 40; k++) { const qz = C.gqSheetQuiz(sh); ok(qz.length === C.gqSheetSize(sh) && new Set(qz.map(q => q.at)).size === qz.length, `${sh.id}: a drawn quiz has ${C.gqSheetSize(sh)} questions on different points`); }
});

// ── drill sets and items ──
const ruleOk = r => {
  if (CX.rules[r]) return true;
  const m = /^gs:(\w+)\.(\w+)$/.exec(r);
  return !!m && !!C.GS_SHEET_BY_ID[m[1]] && C.gqPoints(C.GS_SHEET_BY_ID[m[1]]).includes(m[2]);
};
const PROD = new Set(["compose", "write", "translate", "answer", "open"]);
Object.values(CX.sets).forEach(set => {
  const tag = set.id;
  ok(/^d[a-z]?[\w.]+$/.test(set.id) && !/_/.test(set.id), `${tag}: id`);
  ok(C.CX_KINDS.includes(set.t), `${tag}: kind ${set.t}`);
  ok(!!set.title && !!set.how, `${tag}: title and how`);
  if (set.ex) {
    const ch = "c" + set.ex.split(".")[0], ex = blueprint[ch] && blueprint[ch].exercises.find(e => e.id === set.ex);
    ok(!!ex, `${tag}: Übung ${set.ex} is in the blueprint`);
    const cov = C.cxCovOf(set.ex);
    ok(cov.set === set.id && ["mirrored", "generated"].includes(cov.st), `${tag}: the coverage of ${set.ex} points to it`);
  }
  if (set.gen) {
    const items = C.cxGenItems(set, set.n || 10);
    ok(items.length >= 8, `${tag}: the generator gives 8+ items (${items.length})`);
    (set.r || []).forEach(r => ok(ruleOk(r), `${tag}: rule ${r}`));
    items.forEach(it => {
      const m = /^(\S+(?: \(they\))?) ___ \((\S+)\)$/.exec(it.q);
      ok(!!m, `${tag}: generated "${it.q}"`);
      if (!m) return;
      const p = { "er/sie/es": "er", "sie (they)": "sie" }[m[1]] || m[1];
      const f = C.vxForm(C.vxVerb(m[2]), "pr", p);
      ok(f && it.a.includes(f.ans) && C.cxCheck(it, f.ans).ok, `${tag}: "${it.q}" = the engine's ${f && f.ans}`);
    });
    return;
  }
  ok((set.items || []).length >= 8, `${tag}: 8+ items (${(set.items || []).length})`);
  const qs = new Set();
  (set.items || []).forEach((it, i) => {
    const t = `${tag}#${i}`, k = C.cxItemKind(set, it);
    ok(C.CX_KINDS.includes(k), `${t}: kind ${k}`);
    ok((it.r || []).length > 0 && it.r.every(ruleOk), `${t}: rules ${it.r}`);
    ok((it.r || []).every(r => !CX.rules[r] || CX.rules[r].sec === set.sec), `${t}: its rules are its section's`);
    const key = it.q || (it.w || []).join("/");
    ok(!!key && !qs.has(key), `${t}: a question, once`); qs.add(key);
    if (k === "write" || k === "open") { ok((it.model || []).length && (it.check || []).length, `${t}: model and checklist`); return; }
    ok(Array.isArray(it.a) && it.a.length > 0, `${t}: answers`);
    it.a.forEach(a => {
      const r = C.cxCheck(it, a, C.cxSection(set.sec));
      ok(r.ok && !r.soft.length, `${t}: "${a}" passes the checker`);
      ok(C.cxCheck(it, a.toLowerCase().replace(/[.,!?]/g, ""), C.cxSection(set.sec)).ok, `${t}: "${a}" without capitals/punctuation passes`);
      const loose = a.replace(/ä/g, "a").replace(/ö/g, "o").replace(/ü/g, "u");
      if (loose !== a) { const r2 = C.cxCheck(it, loose, C.cxSection(set.sec)); ok(r2.ok && r2.soft.includes("umlaut"), `${t}: a missing umlaut is a soft slip`); }
    });
    if (k === "pick") {
      const o = it.o || set.o;
      ok(Array.isArray(o) && o.includes(it.a[0]), `${t}: the answer is an option`);
      ok(/___/.test(it.q), `${t}: a gap`);
    }
    if (k === "type") ok(/___/.test(it.q), `${t}: a gap`);
    if (k === "transform" || k === "compose") {
      const { tiles, extra } = C.cxTiles(set, it);
      ok(C.cxCheck(it, tiles.join(" "), C.cxSection(set.sec)).ok, `${t}: its tiles rebuild the answer`);
      extra.forEach(x => ok(!tiles.map(w => w.toLowerCase()).includes(String(x).toLowerCase()), `${t}: distractor "${x}" isn't one of the tiles`));
      if (it.hl) ok(it.q.includes(it.hl), `${t}: the highlight "${it.hl}" is in the sentence`);
      if (k === "compose") ok((it.w || []).length >= 3, `${t}: cue words`);
    }
    if ((it.vf || []).length) it.vf.forEach(([inf, tense, p]) => {
      const f = C.vxForm(C.vxVerb(inf), tense, p);
      ok(f && it.a.every(a => C.cxToks(a).includes(C.cxLoose(f.ans))), `${t}: ${inf} ${tense} ${p} = the engine's ${f && f.ans}`);
    });
  });
});

// ── sections ──
// A built section is a lesson (sheets), a checkpoint, or a verb-track
// section with generated drills only.
CX.sections.filter(s => s.built).forEach(s => ok(s.sheets.length > 0 || !!s.checkpoint || (s.verb && s.verb.length), `${s.id}: built as a lesson, a checkpoint or a verb section`));
CX.sections.filter(s => s.built && s.checkpoint).forEach(s => {
  ok(s.checkpoint.n >= 8 && s.checkpoint.pass > 0 && s.checkpoint.pass <= 1, `${s.id}: checkpoint size and pass mark`);
  ok(CX.sections.indexOf(s) > CX.sections.findIndex(x => x.stage === s.stage) && CX.sections.filter(x => x.stage === s.stage).pop() === s, `${s.id}: the checkpoint closes its stage`);
});
CX.sections.filter(s => s.built && s.sheets.length > 1).forEach(s => {
  // Each day of a several-sheet section drills the sheets passed so far.
  s.sheets.forEach((_, k) => {
    C.S.course = { ds: {}, rot: {}, sec: {}, dd: {}, dq: {}, qm: {} };
    const allow = new Set(s.sheets.slice(0, k + 1).flatMap(id => CX.sheets[id].rid));
    const plan = C.cxDrillPlan(s.id, C.CX_DRILL_N[1], allow);
    ok(plan.length >= 6 && plan.every(e => e.item.r.every(r => allow.has(r) || CX.rules[r].sec !== s.id)), `${s.id}: after sheet ${k + 1}, a drill of ${plan.length} items on its rules only`);
  });
});
CX.sections.filter(s => s.built && s.sheets.length).forEach(s => {
  const sets = s.sets.map(id => CX.sets[id]);
  ok(sets.length > 0, `${s.id}: drill sets`);
  ok(sets.some(d => d.end && PROD.has(d.t)) && PROD.has(sets[sets.length - 1].t), `${s.id}: ends with a production drill`);
  ok(s.rules.length >= 2, `${s.id}: rules`);
  s.rules.forEach(r => ok(Object.values(CX.sets).some(d => d.sec === s.id && (d.items || []).some(it => (it.r || []).includes(r))), `${s.id}: rule ${r} is drilled`));
  // Every exercise of the book sections it draws on has a status.
  (s.book || []).forEach(([ch, head]) => (blueprint[ch] ? blueprint[ch].exercises : []).filter(e => e.section === head).forEach(e => {
    ok(C.cxCovOf(e.id).st !== "none", `${s.id}: Übung ${e.id} (${ch} "${head}") has a status`);
  }));
  // A day's drill: 10–14 items, every set, production last.
  for (let k = 0; k < 10; k++) {
    C.S.course = { ds: {}, rot: {}, sec: {}, dd: {}, dq: {}, qm: {} };
    const plan = C.cxDrillPlan(s.id);
    ok(plan.length >= C.CX_DRILL_N[0] && plan.length <= C.CX_DRILL_N[1], `${s.id}: a day's drill has ${plan.length} items`);
    ok(PROD.has(C.cxItemKind(CX.sets[plan[plan.length - 1].set], plan[plan.length - 1].item)), `${s.id}: the day's drill ends in production`);
  }
  const to = C.cxTestoutPlan(s.id);
  ok(to.length === ((s.testout && s.testout.n) || 8) && s.rules.every(r => to.some(e => e.item.r.includes(r))), `${s.id}: a test-out covers every rule (${to.length})`);
});
Object.entries(CX.cov).forEach(([ex, c0]) => {
  const c = C.cxCovOf(ex);
  ok(["mirrored", "generated", "skipped", "planned"].includes(c.st), `cover ${ex}: status`);
  const ch = "c" + ex.split(".")[0];
  ok(!!(blueprint[ch] && blueprint[ch].exercises.some(e => e.id === ex)), `cover ${ex}: in the blueprint`);
  if (c.st === "mirrored" || c.st === "generated") ok(!!CX.sets[c.set] && CX.sets[c.set].ex === ex, `cover ${ex}: set ${c.set}`);
  if (c.st === "planned") ok(!!CX.byId[c.sec], `cover ${ex}: section ${c.sec}`);
  if (c.st === "skipped") ok(!!c.why, `cover ${ex}: why skipped`);
  void c0;
});

// ── the checker on typical mistakes (s0.neg) ──
const neg = C.cxSection("s0.neg");
if (neg && neg.built) {
  const item = (set, i) => CX.sets[set].items[i];
  const diag = (set, i, typed) => C.cxCheck(item(set, i), typed, neg);
  const cases = [
    ["d5.4", 0, "Ich habe nicht ein Fahrrad.", "neg.kein"],
    ["d5.4", 0, "Ich habe nicht Fahrrad.", "neg.kein"],
    ["d5.5", 2, "Das ist kein mein Schlüssel.", "neg.kein"],
    ["d5.4", 5, "Ich brauche kein Stuhl.", "neg.kein-end"],
    ["d5.5", 6, "Ich kenne nicht die Frau.", "neg.nicht-pos"],
    ["d5.5", 0, "Der Zug ist pünktlich nicht.", "neg.nicht-pos"],
    ["d5.9", 0, "Ich komme nicht am Montag, aber am Freitag.", "neg.sondern"],
    ["d5.5", 1, "Meine Eltern wohnen in Basel.", "neg.kein"],
  ];
  cases.forEach(([s, i, typed, rule]) => { const r = diag(s, i, typed); ok(!r.ok && r.rule === rule && !!r.msg, `diagnosis: "${typed}" → ${rule} (got ${r.rule}: ${r.msg})`); });
  const r1 = diag("d5.5", 0, "der zug ist nicht punktlich");
  ok(r1.ok && r1.soft.includes("umlaut"), "no capitals, no umlaut: right, a soft slip");
  const r2 = diag("d5.5", 4, "Das Weter wird nicht besser.");
  ok(!r2.ok && r2.near, "one letter off in an ordinary word: almost");
  const r3 = diag("d5.4", 5, "Ich brauche keinem Stuhl.");
  ok(!r3.ok && !r3.near, "one letter off in kein…: a mistake, not almost");
  ok(diag("d5.4", 0, "").empty, "empty: nothing graded");
  const r4 = C.cxCheck(item("d5.4", 4), "Sie hat keine kinder.", neg);
  ok(r4.ok && r4.soft.includes("caps"), "a noun written small: right, said");
}

// ── the writing journal's prompts ──
{
  const J = CX.journal || [];
  ok(J.length >= 20, `writing prompts: ${J.length}`);
  ok(new Set(J.map(p => p.id)).size === J.length, "every prompt id once");
  ["A1", "A2", "B1"].forEach(lv => ok(J.filter(p => p.lv === lv).length >= 5, `at least 5 prompts at ${lv}`));
  J.forEach(p => {
    ok(/^w\.[a-z0-9.-]+$/.test(p.id), `${p.id}: id w.<name>`);
    ok(["A1", "A2", "B1"].includes(p.lv), `${p.id}: a level A1 · A2 · B1`);
    ok(typeof p.t === "string" && p.t.length >= 20 && typeof p.de === "string" && p.de.length >= 3, `${p.id}: a situation and a title`);
    ok(!p.help || Array.isArray(p.help) && p.help.every(h => typeof h === "string" && h.length), `${p.id}: help is a list of starters`);
    ok(!p.sec || !!CX.byId[p.sec], `${p.id}: its section ${p.sec} is in the skeleton`);
    ok(!p.min || p.min >= 10 && p.min <= 250, `${p.id}: min words in range`);
  });
  ok(C.cxWordCount("Ich wohne seit 2021 in Zürich — es gefällt mir, z.B. der See.") === 12, "the word count (numbers and abbreviations count once)");
}

// ── no book text ──
if (process.env.BOOK) {
  const dir = process.env.BOOK;
  const book = fs.readdirSync(dir).filter(f => f.endsWith(".txt")).map(f => fs.readFileSync(path.join(dir, f), "utf8")).join("\n");
  const sentences = new Set(book.split(/(?<=[.!?])\s+|\n/).map(s => C.cxLoose(s.replace(/^\s*\d+\.\s*/, ""))).filter(s => s.split(" ").length >= 3));
  const ours = [];
  Object.values(CX.sets).forEach(set => (set.items || []).forEach(it => [it.q, ...(it.a || []), ...(it.model || [])].forEach(s => s && ours.push([set.id, s]))));
  (CX.journal || []).forEach(p => (p.help || []).forEach(h => ours.push([p.id, h])));
  Object.values(CX.sheets).forEach(sh => [...sh.ex.map(e => e[0]), ...sh.quiz.flatMap(q => [q.q, ...(q.o || [])])].forEach(s => ours.push([sh.id, String(s)])));
  let n = 0;
  ours.forEach(([where, s]) => {
    const k = C.cxLoose(s.replace(/\*\*|\(→[^)]*\)/g, ""));
    if (k.split(" ").length < 3) return;
    n++;
    ok(!sentences.has(k), `${where}: "${s}" is our own (not a sentence of the book)`);
  });
  console.log(`  (${n} of our sentences compared with ${sentences.size} of the book's)`);
}

if (bad.length) bad.slice(0, 60).forEach(m => console.log("✗ " + m));
console.log(`course: ${pass} passed, ${fail} failed`);
process.exit(fail ? 1 : 0);
