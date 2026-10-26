// The course validator — every later session runs it after adding data.
//
//   node validate.mjs              # the checks below; exit 1 on a failure
//   BOOK=<dir> node validate.mjs   # also: no item copies a sentence of the
//                                  # book — five words or more; a short simple
//                                  # sentence is anyone's German (dir: chapter
//                                  # texts from pdftotext, kept OUT of the repo)
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
  // the planner's estimate (PLAN.md §9): a whole number of sheets, 1–10 (not a target)
  ok(Number.isInteger(s.n) && s.n >= 1 && s.n <= 10, `${s.id}: n (its estimated sheets) 1–10`);
  // what it builds on: lessons that exist and come before it (the order holds)
  (s.after || []).forEach(a => ok(!!CX.byId[a] && CX.sections.indexOf(CX.byId[a]) < CX.sections.indexOf(s), `${s.id}: after ${a} — an earlier lesson`));
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
    const tense = set.gen.tense || "pr";
    ok(["pr", "pt", "im", "pf"].includes(tense), `${tag}: tense ${tense}`);
    items.forEach(it => {
      const m = /^(\S+(?: \(they\))?) ___!? \((\S+)\)$/.exec(it.q);
      ok(!!m && m[2] === it.inf, `${tag}: generated "${it.q}"`);
      if (!m) return;
      const f = C.vxForm(C.vxVerb(it.inf), tense, it.p);
      ok(f && it.a.includes(f.ans) && C.cxCheck(it, f.ans).ok && it.t === tense, `${tag}: "${it.q}" = the engine's ${f && f.ans}`);
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
    if (k === "write" || k === "open") { ok((it.model || []).length > 0, `${t}: a model answer`); return; }
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
    // a form the engine can check (vf: [[inf, tense, person]]): every
    // accepted answer holds one of the engine's forms (komm / komme), its
    // words in order — a separable prefix after the rest (ruf … an)
    if ((it.vf || []).length) it.vf.forEach(([inf, tense, p]) => {
      const f = C.vxVerb(inf) && C.vxForm(C.vxVerb(inf), tense, p);
      const has = (a, x) => { const A = C.cxToks(a); let i = 0; return C.cxToks(x).every(t => { while (i < A.length && A[i] !== t) i++; return i++ < A.length; }); };
      ok(f && it.a.every(a => f.acc.some(x => has(a, x))), `${t}: ${inf} ${tense} ${p} = the engine's ${f && f.ans}`);
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
  if (c.st === "mirrored" || c.st === "generated") ok(!!CX.sets[c.set] && (CX.sets[c.set].ex === ex || (CX.sets[c.set].also || []).includes(ex)), `cover ${ex}: set ${c.set}`);
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
  ok(/«am Montag/.test(C.cxCheck(item("d5.9", 0), "Ich komme am Montag nicht, sondern am Freitag.", neg).msg || ""), "where nicht goes: the answer's own words, capitals kept («am Montag»)");
  const r4 = C.cxCheck(item("d5.4", 4), "Sie hat keine kinder.", neg);
  ok(r4.ok && r4.soft.includes("caps"), "a noun written small: right, said");
}

// ── the checker on typical mistakes (Session 3's lessons) ──
// each: [set, item, what was typed, the rule it should name, words its message must hold]
{
  const cases = [
    ["d28.7", 0, "Der Schlüssel habe ich im Auto vergessen.", "front.obj", "den"],
    ["dfront.c", 0, "Es regnet, deshalb ich nehme den Bus.", "front.conn", "verb"],
    ["d14.7", 0, "Im Winter wir fahren jedes Wochenende Ski.", "front.one", "verb"],
    ["d28.5", 0, "Niemand kommen heute mit.", "neg2.one", "kommt"],
    ["d28.5", 1, "Ich habe nicht nichts gekauft.", "neg2.one", "nicht nichts"],
    ["dneg2.m", 1, "Nein, ich wohne noch nicht in Basel.", "neg2.mehr", "nicht mehr"],
    ["dp.neg2", 9, "Ich kenne hier nicht jemanden.", "neg2.who", "niemanden"],
    ["d15.2", 0, "meinen Vater", "dat.words", "meinem"],
    ["d15.9", 0, "unseren nette Nachbarn", "dat.adj", "netten"],
    ["d15.11", 0, "Zeigst du sie die Fotos?", "datp.vs", "ihnen"],
    ["d15.12", 1, "Ich gebe ihm es.", "ord.both", "accusative"],
    ["d15.6", 0, "mich", "dv.verbs", "mir"],
    ["ddv.g", 0, "Ich gefalle die Wohnung.", "dv.gef", "mir"],
    ["dad.t", 6, "ihm", "ad.forms", "ihn"],
    ["d28.13", 0, "Wen hilft Lisa beim Umzug?", "wer.case", "wem"],
    ["d28.13", 1, "Mit wen tanzt Tom?", "wer.prep", "wem"],
    ["dwer.w", 2, "welchen", "wer.welch", "welchem"],
    ["dresp.t", 2, "dir", "resp.how", "Ihnen"],
    ["d10.11", 2, "Die Kinder haben in den Wald gegangen.", "gs:pf2.r1", "sein"],
    ["d10.18", 0, "Wir haben den Schlüssel geverloren.", "gs:pf4.r2", "verloren"],
    ["d10.20", 3, "Er hat das Velo gerepariert.", "gs:pf4.r3", "repariert"],
    ["d12.7", 0, "Du zumachst das Fenster.", "gs:pr6.r1", "end"],
  ];
  cases.forEach(([set, i, typed, rule, word]) => {
    const s = CX.sets[set], r = s && C.cxCheck(s.items[i], typed, C.cxSection(s.sec));
    ok(r && !r.ok && r.rule === rule && String(r.msg || "").includes(word), `diagnosis: "${typed}" → ${rule}, «${word}» (got ${r && r.rule}: ${r && r.msg})`);
  });
  // a wrong ending is grammar, never "almost — check the spelling" (that would hand the answer over)
  [["d15.1", 3, "den Leute"], ["d15.9", 0, "unseren nette Nachbarn"], ["d15.2", 3, "seinen Kinder"], ["d10.3", 5, "Ihr habt lange auf den Bus gewartt."]].forEach(([set, i, typed]) => {
    const r = C.cxCheck(CX.sets[set].items[i], typed, C.cxSection(CX.sets[set].sec));
    ok(!r.ok && !r.near, `"${typed}": a wrong ending — a mistake, not almost`);
  });
  // a time word that belongs to a preposition never moves on its own
  ok(!C.cxCheck(CX.sets["d10.19"].items[8], "Heute ist er bis in Thun geblieben.").ok, "«bis heute» stays together: no «Heute ist er bis in Thun geblieben»");
}

// ── the book's table of contents: every line has its lesson ──
// (each heading of the blueprint — and a chapter's opening part, when it
// has exercises — is named by a section: taught there, in the verb track
// the section links to, or as part of that lesson)
{
  let n = 0;
  Object.entries(blueprint).forEach(([ch, c]) => {
    const heads = [...c.sections, ...(c.exercises.some(e => e.section === "") ? [""] : [])];
    heads.forEach(h => { n++; ok(CX.sections.some(s => (s.book || []).some(b => b[0] === ch && b[1] === h)), `book ${ch} "${h || "(opening)"}": a lesson teaches it`); });
  });
  ok(n > 240, `every line of the book's contents checked (${n})`);
}

// ── the build plan: every lesson has its session; nothing planned is left behind ──
{
  const { DONE, sessionPlans } = await import("./session.mjs");
  CX.sections.forEach(s => ok(s.ses >= 1 && s.ses <= 9, `${s.id}: a build session (ses 1–9)`));
  // a lesson of a finished session: every exercise it draws on has its drill (or a reason)
  CX.sections.filter(s => s.ses <= DONE).forEach(s => (s.book || []).forEach(([ch, h]) => (blueprint[ch] ? blueprint[ch].exercises : []).filter(e => e.section === h).forEach(e =>
    ok(C.cxCovOf(e.id).st !== "none", `${s.id} (session ${s.ses}, done): Übung ${e.id} has its drill`))));
  // a planned exercise waits for a lesson of a later session, and that session uploads its chapter
  const P = sessionPlans(C);
  Object.entries(CX.cov).forEach(([ex, c]) => {
    if (!c || c.st !== "planned") return;
    const sec = CX.byId[c.sec];
    ok(sec && sec.ses > DONE, `Übung ${ex}: planned for ${c.sec}, built in a later session (${sec && sec.ses})`);
    ok(sec && P[sec.ses].chapters.includes("c" + ex.split(".")[0]), `Übung ${ex}: session ${sec && sec.ses} uploads chapter ${ex.split(".")[0]}`);
  });
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
  const T = CX.themes || [];
  ok(T.length >= 10 && T.some(t => t.id === "free"), `writing themes: ${T.length}, with "free"`);
  ok(new Set(T.map(t => t.id)).size === T.length, "every theme id once");
  T.forEach(t => {
    ok(/^[a-z]+$/.test(t.id) && t.ico && t.name && t.de, `theme ${t.id}: id, icon, name, German title`);
    ["A1", "A2", "B1"].forEach(lv => ok(typeof t[lv] === "string" && t[lv].length >= 20, `theme ${t.id}: a task at ${lv}`));
  });
  J.forEach(p => ok(!!T.find(t => t.id === p.th), `${p.id}: its theme ${p.th} exists`));
  ["A1", "A2", "B1"].forEach(lv => T.forEach(t => ok(C.cxJournalPool(t.id, lv).length > 0, `theme ${t.id} at ${lv}: something to write`)));
  ok(C.cxJournalPrompt("th.home.B1") && C.cxJournalPrompt("th.home.B1").lv === "B1" && !C.cxJournalPrompt("th.nope.A1"), "a theme's own task resolves by id");
  ok(C.cxWordCount("Ich wohne seit 2021 in Zürich — es gefällt mir, z.B. der See.") === 12, "the word count (numbers and abbreviations count once)");
}

// ── no book text ──
// The rule: no book text in the repo — our sheets, sentences and stories
// are our own. But the book doesn't own the German language: a simple,
// short everyday sentence (four words or fewer — Wer ist das? · Es wird
// kalt. · Kannst du mir helfen?) is anyone's, and is fine even if the book
// happens to use it too. From five words on, a sentence the book has is
// flagged and rephrased.
const BOOK_MIN_WORDS = 5;
if (process.env.BOOK) {
  const dir = process.env.BOOK;
  const book = fs.readdirSync(dir).filter(f => f.endsWith(".txt")).map(f => fs.readFileSync(path.join(dir, f), "utf8")).join("\n");
  const sentences = new Set(book.split(/(?<=[.!?])\s+|\n/).map(s => C.cxLoose(s.replace(/^\s*\d+\.\s*/, ""))).filter(s => s.split(" ").length >= 3));
  const ours = [];
  Object.values(CX.sets).forEach(set => (set.items || []).forEach(it => [it.q, ...(it.a || []), ...(it.model || [])].forEach(s => s && ours.push([set.id, s]))));
  (CX.journal || []).forEach(p => (p.help || []).forEach(h => ours.push([p.id, h])));
  Object.values(CX.sheets).forEach(sh => [...sh.ex.map(e => e[0]), ...sh.quiz.flatMap(q => [q.q, ...(q.o || [])])].forEach(s => ours.push([sh.id, String(s)])));
  // the whole sentences inside a sheet's rules, why, trap, table and lines, and the items' notes
  // (a grammar term — "was für ein" — is no sentence: only what ends in . ! ?)
  const sentencesOf = t => String(t || "").replace(/\*\*|~~|\{\{|\}\}|\(\(|\)\)|\[\[|\]\]/g, "").split(/(?<=[.!?])\s+|\s[·—→]\s|:\s/).map(x => x.replace(/^[·—→\s]+/, "").trim()).filter(x => /[.!?]$/.test(x));
  Object.values(CX.sheets).forEach(sh => [...(sh.rules || []), sh.why, sh.trap, ...((sh.table || {}).rows || []).flat(), ...(sh.lines || []).flat()].forEach(t => sentencesOf(t).forEach(s => ours.push([sh.id, s]))));
  Object.values(CX.sets).forEach(set => (set.items || []).forEach(it => sentencesOf(it.note).forEach(s => ours.push([set.id, s]))));
  let n = 0;
  ours.forEach(([where, s]) => {
    const k = C.cxLoose(s.replace(/\*\*|\(→[^)]*\)/g, ""));
    if (k.split(" ").length < BOOK_MIN_WORDS) return; // short and simple: anyone's German
    n++;
    ok(!sentences.has(k), `${where}: "${s}" is our own (not a sentence of the book)`);
  });
  console.log(`  (${n} of our sentences compared with ${sentences.size} of the book's)`);
}

if (bad.length) bad.slice(0, 60).forEach(m => console.log("✗ " + m));
console.log(`course: ${pass} passed, ${fail} failed`);
process.exit(fail ? 1 : 0);
