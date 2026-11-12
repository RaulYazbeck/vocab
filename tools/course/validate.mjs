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
// A sheet, rule or drill-set id used by two packs: the second would replace
// the first without a word (Session 6 nearly reused cx.gen1 — the gender sheet
// — for the genitive: a sheet's id carries the learner's progress).
ok(!CX.dups, `every sheet, rule and drill-set id is used once (${(CX.dups || []).join(", ")})`);
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
  // "missing nicht" only when the negative is what's missing: another
  // sentence altogether stays the item's own rule (not a kein mistake)
  {
    const set = Object.values(CX.sets).find(s => s.sec === "s0.neg" && (s.items || []).some(it => (it.a || [])[0] === "Der Zug ist nicht pünktlich."));
    const it = set && set.items.find(it => it.a[0] === "Der Zug ist nicht pünktlich."), sec = set && C.cxSection(set.sec);
    ok(it && C.cxCheck(it, "Das Wetter ist heute schön.", sec).rule === "neg.nicht-pos", "another sentence altogether: the item's rule, not neg.kein");
    ok(it && C.cxCheck(it, "Der Zug ist pünktlich.", sec).rule === "neg.kein", "the negative left out: «it needs its negative»");
  }
}

// ── the checker on typical mistakes (Session 4's lessons) ──
{
  const cases = [
    ["d7.10", 0, "dem Park", "ap.list", "den"],
    ["d7.10", 4, "ihm", "ap.pron", "ihn"],
    ["d13.4", 1, "durch es", "ap.da", "dadurch"],
    ["d13.4", 0, "dafür", "ap.da", "person"],
    ["d13.9", 0, "den lange Tunnel", "ap.adj", "langen"],
    ["d13.8", 1, "Um was bittet der Hauswart?", "ap.da", "worum"],
    ["d15.4", 0, "den Hauswart", "dpr.list", "dem"],
    ["d15.14", 1, "ihn", "dpr.pron", "ihm"],
    ["d15.15", 0, "gegenüber euch", "dpr.gegen", "after"],
    ["d15.5", 1, "mit ihm", "dpr.da", "damit"],
    ["dp.dpr", 2, "Die Kinder gehen zu der Schule.", "dpr.short", "zur"],
    ["dp.dpr", 8, "Ich habe seit zwei Jahren in der Schweiz gewohnt.", "dpr.from", "present"],
    ["d19.1", 0, "dem Haus", "tw.wohin", "accusative"],
    ["d19.2", 0, "in dem Garten", "tw.im", "im"],
    ["dp.tw", 4, "Wir gehen heute im Kino.", "tw.wohin", "accusative"],
    ["dtw.t", 0, "seit einem Monat", "tw.time", "vor"],
    ["dp.ww", 1, "Die Milch stellt im Kühlschrank.", "ww.pairs", "steht"],
    ["dp.ww", 0, "Ich stelle die Milch im Kühlschrank.", "ww.ask", "accusative"],
    ["d19.5", 4, "Wo springt die Katze?", "ww.ask", "wohin"],
    ["d14.8", 8, "Tom geht früh ins Bett, denn ist er müde.", "co.denn", "subject"],
    ["dco.p", 4, "aber", "co.sondern", "sondern"],
    ["dco.p", 10, "sondern", "co.sondern", "aber"],
    ["dsub.p", 0, "ich bin krank", "sub.end", "end"],
    ["dsub.two", 0, "Ich komme heute nicht, weil ich muss arbeiten.", "sub.end", "end"],
    ["dp.sub", 1, "Ich weiß, das du viel Arbeit hast.", "sub.dass", "dass"],
    ["d17.13", 0, "Ich gehe früh ins Bett, weil ich muss um fünf aufstehen.", "mod.sub", "last"],
    ["d17.8", 0, "Ich darf bleiben heute länger.", "mod.end", "end"],
    ["dmod.p", 4, "darfst", "mod.neg", "musst"],
    ["d17.10", 1, "möchtet", "mod.form", "möchte"],
    ["d18.2", 1, "kenne", "wk.fact", "weiß"],
    ["d18.2", 0, "wissen", "wk.kennen", "kennen"],
    ["d18.1", 1, "weiße", "wk.forms", "weiß"],
    ["d23.6", 1, "Ich kaufe mich ein Velo.", "refl.dat", "mir"],
    ["d23.5", 6, "Ich wasche sich.", "refl.forms", "mich"],
    ["drefl.p", 7, "sich", "refl.vs", "sie"],
    // (Session 5: a verb pack's detector names its own verb-sheet rule — the message was
    // already this rule's, the stem + te; the miss used to go to the item's r2)
    ["d14.5", 0, "Ich wohnt in Olten.", "gs:pt21.r1", "wohnte"],
    ["d14.6", 1, "arbeitte", "gs:pt21.r3", "arbeitete"],
    ["dp.pt21", 2, "Ich spieltest jeden Tag Fußball.", "gs:pt21.r2", "spielte"],
  ];
  cases.forEach(([set, i, typed, rule, word]) => {
    const s = CX.sets[set], r = s && C.cxCheck(s.items[i], typed, C.cxSection(s.sec));
    ok(r && !r.ok && r.rule === rule && String(r.msg || "").toLowerCase().includes(word.toLowerCase()), `diagnosis: "${typed}" → ${rule}, «${word}» (got ${r && r.rule}: ${r && r.msg})`);
  });
  // a modal's vowel is the grammar — never "almost, check the spelling"
  [["d17.11", 0, "Mögst"], ["d17.12", 0, "wollst"], ["d18.1", 4, "wesst"]].forEach(([set, i, typed]) => {
    const r = C.cxCheck(CX.sets[set].items[i], typed, C.cxSection(CX.sets[set].sec));
    ok(!r.ok && !r.near, `"${typed}": a modal's form — a mistake, not almost`);
  });
  // the fix is shown as it's spelt (möchte, not mochte)
  const r5 = C.cxCheck(CX.sets["d17.10"].items[1], "möchtet", C.cxSection("s1.modal"));
  ok(/möchte\b/.test(r5.msg || "") && !/\bmochte\b/.test(r5.msg || ""), `the fix keeps its umlaut (${r5.msg})`);
}

// ── the checker on typical mistakes (Session 5's lessons) ──
{
  const cases = [
    ["d11.8", 0, "Wir werden kaufen ein neues Sofa.", "gs:fu1.r2", "end"],
    ["d11.8", 1, "Lea werdet die Prüfung machen.", "gs:fu1.r1", "wird"],
    ["d11.8", 2, "Wirst du genug Zeit hast?", "gs:fu1.r2", "infinitive"],
    ["d11.10", 0, "Ich werde am Samstag müssen arbeiten.", "gs:fu1.r2", "last"],
    ["d11.10", 0, "Ich werde am Samstag arbeiten.", "gs:fu1.r2", "müssen"],
    ["d11.12", 0, "Sie werden in den Ferien sein.", "gs:fu2.r3", "wohl"],
    ["d11.6", 2, "Nächste Woche wir fahren ins Engadin.", "gs:fu2.r1", "verb stays second"],
    ["dposs.acc", 0, "mein", "poss.acc", "meinen"],
    ["dposs.acc", 5, "seinen", "poss.who", "ihren"],
    ["dposs.dat", 0, "meinen", "poss.dat", "meinem"],
    ["dposs.dat", 2, "unsere", "poss.dat", "unserer"],
    ["dposs.who", 7, "ihre", "poss.who", "eure"],
    ["dposs.alone", 0, "mein", "poss.alone", "meiner"],
    ["dposs.alone", 2, "mein", "poss.alone", "meins"],
    ["dposs.name", 0, "Das ist Lea s Handy.", "poss.name", "apostrophe"],
    ["dposs.name", 0, "Das ist das Leas Handy.", "poss.name", "no article"],
    ["dposs.von", 2, "unseren Kinder", "poss.dat", "-n"],
    ["d20.8", 3, "teuerer", "comp.er", "teurer"],
    ["dcomp.am", 2, "altsten", "comp.am", "ältesten"],
    ["dcomp.am", 5, "schnellesten", "comp.am", "schnellsten"],
    ["dcomp.irr", 0, "guter", "comp.irr", "besser"],
    ["dcomp.irr", 4, "nahsten", "comp.irr", "nächsten"],
    ["dcomp.gern", 0, "gerner", "comp.gern", "lieber"],
    ["dp.comp", 0, "Bern ist kleiner wie Zürich.", "comp.er", "als"],
    ["dp.comp", 1, "Meine Schwester ist so groß als ich.", "comp.wie", "wie"],
    ["dp.comp", 2, "Der Zug ist mehr schnell als das Auto.", "comp.er", "-er"],
    ["dp.comp", 4, "Wer läuft schnellsten?", "comp.am", "am"],
    ["dadj.der", 5, "nette", "adj.en", "netten"],
    ["dadj.ein", 0, "gute", "adj.ein", "guter"],
    ["dadj.ein", 1, "neue", "adj.ein", "neues"],
    ["dadj.ein", 6, "teueres", "adj.ein", "teures"],
    ["d23.1", 0, "mit einen alten Freund", "adj.eine", "einem"],
    ["d23.1", 6, "durch den dunkelen Wald", "adj.en", "dunklen"],
    ["dadj.zero", 8, "warmen", "adj.zerodat", "warmem"],
    ["d31.14", 4, "Zürich ist die am größten Stadt.", "adj.comp", "no am"],
    ["dp.adj", 3, "Das Wetter ist heute schönes.", "adj.pred", "schön"],
    ["d24.6", 2, "um acht Uhr zu ankommen", "zu.sep", "inside"],
    ["d24.6", 2, "um acht Uhr an zu kommen", "zu.sep", "one"],
    ["d24.6", 2, "um acht Uhr ankommen", "zu.sep", "inside"],
    ["d24.5", 0, "eine neue Sprache lernen", "zu.end", "zu"],
    ["dp.zu", 9, "Ich muss morgen zu arbeiten.", "zu.modal", "no zu"],
    ["dp.zu", 5, "Ich lerne Deutsch, für eine bessere Stelle zu finden.", "zu.um", "um"],
    ["dzu.front", 0, "Um Geld zu sparen, ich fahre Velo.", "zu.front", "verb"],
  ];
  cases.forEach(([set, i, typed, rule, word]) => {
    const s = CX.sets[set], r = s && C.cxCheck(s.items[i], typed, C.cxSection(s.sec));
    ok(r && !r.ok && r.rule === rule && String(r.msg || "").toLowerCase().includes(word.toLowerCase()), `diagnosis: "${typed}" → ${rule}, «${word}» (got ${r && r.rule}: ${r && r.msg})`);
  });
  // one letter off, but it's the rule: a mistake, never "almost" (the detectors marked hard)
  [["d20.8", 3, "teuerer"], ["d20.8", 10, "dunkeler"], ["dcomp.am", 2, "altsten"], ["dcomp.irr", 4, "nahsten"], ["dadj.ein", 6, "teueres"], ["dadj.ein", 0, "gute"], ["dposs.dat", 0, "meinen"]].forEach(([set, i, typed]) => {
    const r = C.cxCheck(CX.sets[set].items[i], typed, C.cxSection(CX.sets[set].sec));
    ok(!r.ok && !r.near, `"${typed}": the grammar — a mistake, not almost`);
  });
}

// ── the checker on typical mistakes (Session 6's lessons) ──
// each: [set, the item's question or first answer, what was typed, the rule it should name, words its message must hold]
{
  const cases = [
    ["dvp.prep", "Ich warte seit einer Stunde ___ den Hauswart.", "für", "vp.fixed", "auf"],
    ["dvp.case", "(der Bus) Wir warten auf ___.", "dem Bus", "vp.acc", "den"],
    ["dvp.case", "(ein neues Velo) Mein Sohn träumt von ___.", "ein neues Velo", "vp.dat", "einem"],
    ["dvp.au", "Danke für die Karte! Ich habe mich sehr ___ deine Karte gefreut.", "auf", "vp.aufueber", "über"],
    ["dvp.refl", "Ich freue ___ auf das Wochenende.", "sich", "vp.refl", "mich"],
    ["dvp.refl", "Ich freue ___ auf das Wochenende.", "mir", "vp.refl", "mich"],
    ["dvp.wen", "Mit wem telefoniert Tom?", "Mit wen telefoniert Tom?", "vp.wen", "wem"],
    ["dvp.wen", "Auf wen wartet Lea?", "Wen wartet Lea auf?", "vp.wen", "first"],
    ["dp.vp", "Ich warte auf den Bus.", "Ich warte für den Bus.", "vp.fixed", "auf"],
    ["dp.vp", "Ich freue mich auf das Wochenende.", "Ich freue auf das Wochenende.", "vp.refl", "reflexive"],
    ["dcj.prep", "___ ich frühstücke, gehe ich joggen.", "Vor", "cj.prepconj", "bevor"],
    ["dcj.prep", "___ dem Frühstück gehe ich joggen.", "Bevor", "cj.prepconj", "vor"],
    ["dcj.nach", "Nachdem die Kinder nach Hause gekommen sind, essen sie etwas.", "Nachdem die Kinder nach Hause gekommen haben, essen sie etwas.", "cj.nachdem", "sind"],
    ["dcj.nach", "Nachdem ich gefrühstückt habe, gehe ich zur Arbeit.", "Nachdem ich frühstücke, gehe ich zur Arbeit.", "cj.nachdem", "Perfekt"],
    ["dcj.join", "Tom geht joggen, obwohl es schneit.", "Tom geht joggen, weil es schneit.", "cj.obwohl", "obwohl"],
    ["dcj.ob", "Es regnet ein bisschen, ___ grillen wir heute.", "obwohl", "cj.trotzdem", "trotzdem"],
    ["dcj.trotz", "Er ist krank, trotzdem geht er arbeiten.", "Er ist krank, trotzdem er geht arbeiten.", "cj.trotzdem", "verb"],
    ["dcj.damit", "Ich spreche langsam, damit du mich verstehst.", "Ich spreche langsam, um du mich verstehst.", "cj.damit", "damit"],
    ["dp.cj", "Ich spreche langsam, damit du mich verstehst.", "Ich spreche langsam, damit du verstehst mich.", "cj.damit", "last"],
    ["dp.cj", "Nachdem ich gegessen habe, gehe ich spazieren.", "Nach ich gegessen habe, gehe ich spazieren.", "cj.prepconj", "nachdem"],
    ["d29.5", "Ich war sehr nervös, ___ ich meine erste Stelle bekam.", "wenn", "aw.als", "als"],
    ["d29.5", "Meine Mutter hat immer gesungen, ___ sie gekocht hat.", "als", "aw.immer", "wenn"],
    ["d29.5", "Weißt du, ___ der letzte Bus fährt?", "wenn", "aw.wann", "wann"],
    ["daw.join", "Als ich ein Kind war, wohnten wir auf dem Land.", "Als ich war ein Kind, wohnten wir auf dem Land.", "aw.als", "end"],
    ["diq.dassob", "Ich weiß nicht, ___ der Zug heute fährt.", "dass", "iq.dassob", "ob"],
    ["diq.wenn", "Ich weiß nicht, ___ ich morgen kommen kann.", "wenn", "iq.wenn", "ob"],
    ["d29.9", "Ich weiß nicht, ob die Post weit von hier ist.", "Ich weiß nicht, die Post weit von hier ist.", "iq.ob", "ob"],
    ["d29.9", "Ich weiß nicht, wer in der Wohnung über uns wohnt.", "Ich weiß nicht, ob wer in der Wohnung über uns wohnt.", "iq.w", "no ob"],
    ["d26.12", "Der Arzt sagt, ich soll viel Wasser trinken.", "Der Arzt sagt, ich viel Wasser trinken.", "iq.soll", "sollen"],
    ["dp.iq", "Ich weiß nicht, wo er wohnt.", "Ich weiß nicht, wo wohnt er.", "iq.w", "last"],
    ["d23.11", "Wir wissen nicht, mit wem Lea Tennis gespielt hat.", "Wir wissen nicht, mit wen Lea Tennis gespielt hat.", "iq.prep", "wem"],
    ["dwd.wo", "(auf) ___ wartest du? — Auf das Tram.", "Woauf", "wd.r", "worauf"],
    ["dwd.wo", "(für) ___ interessiert sich deine Tochter? — Für Pferde.", "Worfür", "wd.r", "wofür"],
    ["dwd.da", "Ich denke oft daran.", "Ich denke oft an sie.", "wd.da", "daran"],
    ["dwd.da", "Wir warten auf ihn.", "Wir warten darauf.", "wd.da", "person"],
    ["d28.15", "Worauf warten die Kinder?", "Auf was warten die Kinder?", "wd.wo", "worauf"],
    ["d28.15", "Über wen ärgert sich Tom?", "Worüber ärgert sich Tom?", "wd.wo", "wen"],
    ["dwd.dass", "Ich freue mich darauf, dass du uns besuchst.", "Ich freue mich auf, dass du uns besuchst.", "wd.dass", "darauf"],
    ["dp.wd", "Ich freue mich darauf.", "Ich freue mich auf es.", "wd.da", "darauf"],
    ["drel.acc", "Der Kaffee, ___ ich trinke, ist kalt.", "der", "rel.acc", "den"],
    ["drel.dat", "Die Gäste, ___ wir die Stadt gezeigt haben, kommen aus Japan.", "den", "rel.dat", "denen"],
    ["d22.6", "Wo ist der Schirm, den ich gestern gekauft habe?", "Wo ist der Schirm, ich gestern gekauft habe?", "rel.form", "den"],
    ["d22.6", "Wo ist der Schirm, den ich gestern gekauft habe?", "Wo ist der Schirm, was ich gestern gekauft habe?", "rel.form", "den"],
    ["d22.6", "Das ist die Ärztin, die mich operiert hat.", "Das ist die Ärztin, die hat mich operiert.", "rel.nom", "closes"],
    ["dp.rel", "Das ist der Mann, der neben uns wohnt.", "Das ist der Mann, wer neben uns wohnt.", "rel.form", "der"],
    ["drp.form", "mit den Kindern → ___", "mit den", "rp.case", "denen"],
    ["d22.8", "Ich habe einen Kollegen, mit dem ich zur Arbeit fahre.", "Ich habe einen Kollegen, dem ich zur Arbeit fahre.", "rp.prep", "preposition"],
    ["d22.8", "Ich habe einen Kollegen, dessen Frau Ärztin ist.", "Ich habe einen Kollegen, deren Frau Ärztin ist.", "rp.gen", "dessen"],
    ["drp.was", "Das ist alles, ___ ich dir sagen kann.", "das", "rp.was", "was"],
    ["drp.was", "Das ist das Kleid, ___ ich mir gekauft habe.", "was", "rp.was", "das"],
    ["d22.4", "Wer Hunger hat, soll etwas essen.", "Der Hunger hat, soll etwas essen.", "rp.wer", "Wer"],
    ["d22.12", "Der Vertrag, welchen wir unterschrieben haben, gilt ein Jahr.", "Der Vertrag, welcher wir unterschrieben haben, gilt ein Jahr.", "rp.welch", "welchen"],
    ["dgeni.pick", "Das ist das Velo ___ Nachbarin.", "des", "geni.art", "der"],
    ["d20.1", "das Auto → ___", "des Auto", "geni.s", "Autos"],
    ["d20.1", "meine Eltern → ___", "meinen Eltern", "geni.art", "meiner"],
    ["dgeni.s", "(das Haus) die Tür des ___", "Haus", "geni.s", "Hauses"],
    ["d20.2", "(mein Bruder) Die Frau ___ ist Ärztin.", "mein Bruders", "geni.art", "meines"],
    ["dgeni.spoken", "Das ist das Velo meines Bruders.", "Das ist das Velo von meines Bruders.", "geni.von", "meinem"],
    ["dgeni.wessen", "Wessen Jacke ist das?", "Wem Jacke ist das?", "geni.wessen", "wessen"],
    ["dgeni.wessen", "Wessen Jacke ist das?", "Wessen die Jacke ist das?", "geni.wessen", "No article"],
    ["d20.5", "(neu) Das ist das Büro des ___ Chefs.", "neue", "geni.adj", "neuen"],
    ["d20.6", "Wo ist die Jacke dieses jungen Mannes?", "Wo ist die Jacke dieser junge Mann?", "geni.art", "dieses"],
    ["d20.3", "(der Regen) Wegen ___ bleiben wir zu Hause.", "dem Regen", "gp.list", "des"],
    ["d20.3", "(meine Erkältung) Wegen ___ bleiben wir zu Hause.", "meine Erkältung", "gp.list", "meiner"],
    ["dgp.ww", "___ der Hitze bleiben wir im Schatten.", "Weil", "gp.weil", "wegen"],
    ["dgp.dat", "wegen dem Stau", "wegen des Stau", "gp.dat", "Staus"],
    ["dadv.viel", "Der zweite Film war ___ besser.", "sehr", "adv.viel", "viel"],
    ["dadv.viel", "Der Film war ___ gut.", "viel", "adv.viel", "sehr"],
    ["dadv.front", "Leider habe ich keine Zeit.", "Leider ich habe keine Zeit.", "adv.pos", "verb"],
    ["dadv.place", "Ich sehe ihn oft.", "Ich oft sehe ihn.", "adv.order", "after the verb"],
    ["dadv.dir", "Ich gehe ___ und hole meine Jacke.", "oben", "adv.dir", "nach"],
    ["dadv.dir", "Der Hund muss ___.", "draußen", "adv.dir", "raus"],
    ["dp.adv", "Ist das Zimmer groß genug?", "Ist das Zimmer genug groß?", "adv.zu", "after"],
    ["dp.adv", "Ich habe gar keine Zeit.", "Ich habe gar nicht Zeit.", "adv.neg", "keine"],
  ];
  cases.forEach(([set, key, typed, rule, word]) => {
    const s = CX.sets[set], it = s && s.items.find(x => x.q === key || (x.a || [])[0] === key), r = it && C.cxCheck(it, typed, C.cxSection(s.sec));
    ok(r && !r.ok && r.rule === rule && String(r.msg || "").toLowerCase().includes(word.toLowerCase()), `diagnosis: "${typed}" → ${rule}, «${word}» (got ${r ? r.rule + ": " + r.msg : "no such item in " + set})`);
  });
  // what the detectors find here is the grammar — never "almost, check the spelling"
  [["dvp.case", "(der Bus) Wir warten auf ___.", "dem Bus"], ["drel.dat", "Die Gäste, ___ wir die Stadt gezeigt haben, kommen aus Japan.", "den"], ["d20.1", "das Auto → ___", "des Auto"], ["d20.5", "(neu) Das ist das Büro des ___ Chefs.", "neue"], ["dwd.wo", "(auf) ___ wartest du? — Auf das Tram.", "Woauf"], ["d29.5", "Weißt du, ___ der letzte Bus fährt?", "wenn"], ["d22.12", "Der Vertrag, welchen wir unterschrieben haben, gilt ein Jahr.", "Der Vertrag, welcher wir unterschrieben haben, gilt ein Jahr."]].forEach(([set, key, typed]) => {
    const s = CX.sets[set], it = s.items.find(x => x.q === key || (x.a || [])[0] === key), r = it && C.cxCheck(it, typed, C.cxSection(s.sec));
    ok(r && !r.ok && !r.near, `"${typed}": the grammar — a mistake, not almost`);
  });
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

// ── what the course says (course-de.js cxSayAll / cxQuizSayText) ──
// Said once a question is answered and recorded by the voice pack
// (tools/audio/runtime.mjs): only whole, clean German — no gap, no cue in
// brackets, no arrow, no English instruction.
{
  const clean = t => !/___|→|[()[\]{}<>=\/]|\*/.test(t) && !C.cxEnglish(t) && t === t.trim() && !/\s[.,!?]/.test(t);
  let n = 0;
  Object.values(CX.sets).forEach(set => C.cxSayItems(set).forEach(it => C.cxSayAll(it, set).forEach(t => { n++; ok(clean(t), `${set.id}: says clean German «${t}»`); })));
  // every sheet's quiz, the course's and the verb track's (its fixed questions; the ones
  // made from your verbs say the verb track's own form)
  [...Object.values(CX.sheets), ...(C.GS_SHEETS || [])].forEach(sh => (sh.quiz || []).filter(Q => !Q.g).forEach(Q => { const t = C.cxQuizSayText(Q); if (t) { n++; ok(clean(t) && C.cxGermanish(t), `${sh.id}: its quiz says clean German «${t}»`); } }));
  // an English option is never said (it would be read with the German voice)
  ["mixed", "oy", "soft, as in huge", "neither — same time, different habit"].forEach(o => ok(C.cxQuizSayText({ k: "pick", q: "Which?", o: [o], a: 0 }) === "", `an English option says nothing («${o}»)`));
  ok(C.cxQuizSayText({ k: "pick", q: "Which?", o: ["Advice: An deiner Stelle würde ich warten."], a: 0 }) === "An deiner Stelle würde ich warten.", "an English label before a sentence is left out");
  // a production item always has something to say once answered
  Object.values(CX.sets).forEach(set => (set.items || []).forEach(it => { const k = C.cxItemKind(set, it); if (["transform", "compose", "translate", "answer", "respond"].includes(k)) ok(!!C.cxSayText(it, set), `${set.id}: «${it.q || (it.w || []).join(" ")}» says its answer`); }));
  ok(n > 5000, `the course says ${n} texts`);
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
