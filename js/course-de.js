// ── THE COURSE (German) ───────────────────────
// The grammar book as the backbone (PLAN.md): stages → sections, each
// section with its sheet(s), rules and drill sets — all our own content.
// The verb track (verb-track.js) keeps its tense units and sheets; the
// course links them in as sections and adds everything else.
//
//   Data files (js/course/*.js) call cxDefine() (the skeleton: stages,
//   chapters, every planned section in order) and cxPack() (a section's
//   content) and cxCover() (what each book exercise became). A section
//   with no content shows as "coming" — adding one is a data file plus
//   its script tag; the validator (tools/course) checks the rest.
//
//   Rules are review items next to the words in S.words, "cx_<rule>",
//   on the same 0–7 stages (srs.js): introduced when the sheet is passed
//   (or the test-out), asked each review with another of the rule's
//   drill items, the format climbing with the stage — pick → type →
//   tiles → production. A miss goes back to its rule. A rule counts as
//   learned at stage 2: right twice, on separate days.
//
//   S.course (meta doc, synced — sync-merge.js):
//     v      version
//     since  the first study day the course ran
//     sec    { section: { st, to?, sh?, at? } } — st: 1 sheet due · 2 sheet
//            passed · 3 done (sheet + first drill, or the test-out); to: test-
//            out score %; sh: best quiz %; at: the day it was done
//     ds     { set: [right, asked, next] } — next: where its rotation stands
//     rot    { rule: n } — where each rule's review rotation stands
//     qm     { "sheet:point": [missed, right] } — sheet quiz first tries
//     last   the day the last sheet was learned (the next is spaced from it)
//     seen   the days I opened the app (the last 60): my rhythm
//     cd     the last contrast day
//     day / dd / dq — today, the parts done today, today's plan answers
//     idle   the days (last 28) the course had nothing new: not held
//            against my pace
//
//   S.writing (synced, one cloud doc a year): the writing journal —
//     { year: [{ id, d: day, p: prompt id, t: text, w: words, c?: day corrected }] }
//
// German app only: the French app never loads these files (cxOn()).
// ─────────────────────────────────────────────

const CX_DECK = "cx";
const CX_LAG = 40;            // days: every sheet passed ≈ early July for 15 Aug (PLAN.md §9)
const CX_DRILL_N = [10, 14];  // the day's drill: items (min, max)
const CX_REVIEW = [6, 30];    // rule reviews a day (min, max): never starved, never a flood
const CX_DAY_Q = 50;          // the day's grammar questions the reviews fill up to (never under CX_REVIEW[0])
const CX_WARM_MAX = 8;        // yesterday's slips in the warm-up (the rest join the review)
const CX_Q_MIN = 0.5;         // minutes a review question takes
const CX_TESTOUT = { n: 8, miss: 1 }; // a test-out: questions, misses allowed
const CX_LEARNED = 2;         // a rule is learned from this stage on
const CX_MIN = { warm: 5, testout: 5, sheet: 10, drill: 15, review: 10, write: 5 }; // minutes (PLAN.md §8)
const CX_KINDS = ["pick", "type", "transform", "compose", "open", "translate", "write", "respond", "order", "answer"];
const CX_PRODUCTION = new Set(["compose", "write", "translate", "answer", "open"]);

// ── REGISTRY ──────────────────────────────────
const CX = { stages: [], chapters: {}, sections: [], byId: {}, sheets: {}, rules: {}, sets: {}, cov: {}, packs: [], journal: [], themes: [] };
// (CX_TEST_OFF: the older test scripts measure Today without the course.)
function cxOn() { return typeof WORD_KEY !== "undefined" && WORD_KEY === "de" && CX.sections.length > 0 && !(typeof window !== "undefined" && window.CX_TEST_OFF); }
// The skeleton: { stages: [{ id, name, sub }], chapters: { c5: "title" },
// sections: [{ id, stage, title, level, prio, book: [[ch, heading]], n?,
// verb?: [sheet ids], kind? }] } — in the order the learner meets them.
function cxDefine(def) {
  (def.stages || []).forEach(s => { if (!CX.stages.some(x => x.id === s.id)) CX.stages.push(s); });
  Object.assign(CX.chapters, def.chapters || {});
  (def.sections || []).forEach(s => {
    if (CX.byId[s.id]) return;
    const sec = Object.assign({ n: 1, prio: "M", book: [], sheets: [], sets: [], rules: [], built: false }, s);
    CX.byId[s.id] = sec; CX.sections.push(sec);
  });
}
// A section's content: { sections: { id: { sheets: [...], rules: { id:
// title }, drills: [...], diag: [...], testout? } } }.
function cxPack(pack) {
  CX.packs.push(pack.id || "?");
  Object.entries(pack.sections || {}).forEach(([id, c]) => {
    const sec = CX.byId[id];
    if (!sec) { CX.orphans = (CX.orphans || []).concat(id); return; }
    sec.built = true;
    sec.diag = c.diag || [];
    if (c.testout !== undefined) sec.testout = c.testout;
    // A stage's checkpoint (a recap section): { n: questions, pass: share }.
    if (c.checkpoint) sec.checkpoint = Object.assign({ n: 20, pass: 0.8 }, c.checkpoint);
    (c.sheets || []).forEach(sh => {
      Object.assign(sh, { cx: true, sec: id });
      CX.sheets[sh.id] = sh; sec.sheets.push(sh.id);
      (sh.rid || []).forEach((rid, i) => {
        CX.rules[rid] = { id: rid, title: (c.rules || {})[rid] || rid, text: (sh.rules || [])[i] || "", sheet: sh.id, at: "r" + (i + 1), sec: id };
        sec.rules.push(rid);
      });
    });
    (c.drills || []).forEach(d => {
      Object.assign(d, { sec: id });
      // fixed: the order is the point (a fronting drill) — no other order counts.
      if (d.fixed) (d.items || []).forEach(it => { it.fixed = true; });
      CX.sets[d.id] = d; sec.sets.push(d.id);
    });
  });
}
// What each book exercise became: { "5.4": "d5.4" } (mirrored by that
// set), or { st: "generated" | "skipped" | "planned", set?, sec?, why? }.
function cxCover(map) { Object.assign(CX.cov, map); }
// The writing journal's prompts (js/course/writing.js; packs may add).
function cxJournal(list) { (list || []).forEach(p => { if (p && p.id && !CX.journal.some(q => q.id === p.id)) CX.journal.push(p); }); }
// Its themes: { id, ico, name, de, A1, A2, B1 (a one-line task each) }.
function cxJournalThemes(list) { (list || []).forEach(t => { if (t && t.id && !CX.themes.some(x => x.id === t.id)) CX.themes.push(t); }); }
function cxSheet(id) { return CX.sheets[id] || null; }
// A section the learner can work through: a lesson (its sheets) or a
// stage's checkpoint. (Verb-track sections live in the verb track.)
function cxLearnable(s) { return !!s && s.built && (s.sheets.length > 0 || !!s.checkpoint); }
function cxSection(id) { return CX.byId[id] || null; }
function cxStage(id) { return CX.stages.find(s => s.id === id) || null; }
function cxSet(id) { return CX.sets[id] || null; }
function cxRule(id) { return CX.rules[id] || null; }
// A rule to show on a miss: the course's own, or a verb sheet's point
// ("gs:pr4.r2" — the verb lesson's book drills): { title, text, sheet }.
function cxRuleView(id) {
  const r = cxRule(id);
  if (r) return r;
  const m = /^gs:(\w+)\.(\w+)$/.exec(String(id || "")), sh = m && typeof vxSheet === "function" ? vxSheet(m[1]) : null;
  if (!sh) return null;
  const i = /^r(\d)$/.exec(m[2]);
  return { id, title: sh.title, text: i ? (sh.rules || [])[+i[1] - 1] || sh.why : m[2] === "trap" ? sh.trap : sh.why, sheet: sh.id, verb: true };
}
function cxWordKey(rule) { return CX_DECK + "_" + rule; }

// ── STATE ─────────────────────────────────────
function migrateCourse() {
  if (!cxOn()) return;
  if (!S.course || typeof S.course !== "object") S.course = {};
  const C = S.course;
  C.v = 1;
  ["sec", "ds", "rot", "qm", "dd", "dq"].forEach(k => { if (!C[k] || typeof C[k] !== "object" || Array.isArray(C[k])) C[k] = {}; });
  if (typeof C.day !== "string") C.day = "";
  if (typeof C.since !== "string") C.since = "";
  delete C.mins; // (a setting of the first build: the date sets the pace now)
  cxWritingStore();
  cxRollDay();
}
function cxRollDay() {
  const C = S.course, today = studyToday();
  if (C.day === today) return;
  // Days the course had nothing new to give (every built section done)
  // don't count against my pace: today, and the days since the last open
  // when nothing was waiting then either.
  if (!Array.isArray(C.idle)) C.idle = [];
  if (C.since && !cxNextSections(1).length) {
    const from = C.day && C.idle.includes(C.day) && daysBetween(C.day, today) <= 28 ? C.day : today;
    for (let d = from; d <= today; d = addDays(d, 1)) if (!C.idle.includes(d)) C.idle.push(d);
    C.idle = C.idle.sort().slice(-28);
  }
  // The days I open the app (the last 60): my rhythm (cxAttend).
  if (!Array.isArray(C.seen)) C.seen = [];
  if (!C.seen.includes(today)) { C.seen.push(today); C.seen = C.seen.filter(d => typeof d === "string").sort().slice(-60); }
  C.day = today; C.dd = {}; C.dq = {};
}
function cxSecState(id) { return (S.course && S.course.sec && S.course.sec[id]) || null; }
// A section linked to the verb track is done when its verb sheets are.
function cxSecDone(id) {
  const sec = cxSection(id);
  if (!sec) return false;
  if (sec.verb && sec.verb.length) return sec.verb.every(s => typeof vxSheetPassed === "function" && vxSheetPassed(s));
  const st = cxSecState(id);
  return !!st && st.st >= 3;
}
function cxSheetPassed(id) {
  const sh = cxSheet(id), st = sh && cxSecState(sh.sec);
  return !!st && (st.st >= 2 || (st.ok && st.ok[id] > 0));
}
function cxSecSet(id, patch) {
  const C = S.course, cur = C.sec[id] || (C.sec[id] = { st: 0 });
  Object.entries(patch).forEach(([k, v]) => { cur[k] = typeof v === "number" && typeof cur[k] === "number" && k !== "at" ? Math.max(cur[k], v) : v; });
  return cur;
}

// ── RULE ITEMS ────────────────────────────────
function cxRuleWS(rule) { return S.words[cxWordKey(rule)] || null; }
function cxRuleLearned(rule) { const ws = cxRuleWS(rule); return !!ws && (ws.st || 0) >= CX_LEARNED && !ws.lrn && !ws.rp && !ws.fl; }
// A section's rules go into review: after its sheet (stage 1, a check
// due now — the drill that follows confirms it), or after a test-out
// (stage 3: light review only). Never lowers a rule already started.
// rules: only these (one sheet's, in a section of several sheets).
function cxIntroduceRules(secId, stage = 1, rules = null) {
  const sec = cxSection(secId);
  if (!sec) return 0;
  let n = 0;
  const now = Date.now();
  (rules || sec.rules).forEach(r => {
    const ws = getWS(CX_DECK, r);
    if (ws.st) return;
    if (stage <= 1) { introduceWord(ws, now); n++; return; }
    ws.st = stage; ws.pk = Math.max(ws.pk || 0, stage); ws.lrn = 0; ws.metOn = studyToday();
    scheduleStage(ws, now); n++;
  });
  if (n && typeof invalidatePathScan === "function") invalidatePathScan();
  return n;
}
// Every rule item that's started: { fix: [...], due: [...] }.
function cxDueRules(now = Date.now()) {
  const fix = [], due = [];
  Object.keys(CX.rules).forEach(r => {
    const ws = cxRuleWS(r);
    if (!ws || !ws.st) return;
    if (ws.rp || ws.fl || ws.lrn) fix.push(r);
    else if (ws.dueAt && ws.dueAt <= now) due.push(r);
  });
  const st = r => cxRuleWS(r).st || 0;
  due.sort((a, b) => st(a) - st(b) || cxRuleWS(a).dueAt - cxRuleWS(b).dueAt);
  return { fix, due };
}

// ── TEXT ──────────────────────────────────────
// Strict key: case and punctuation don't count. Loose key: ß/ss and a
// missing umlaut don't either (a soft slip, said in the feedback).
function cxStrict(s) {
  return String(s || "").normalize("NFC").toLowerCase().replace(/[.,!?;:„“"«»‚‘’()…–—]/g, " ").replace(/\s+/g, " ").trim();
}
function cxLoose(s) { return cxStrict(s).replace(/ß/g, "ss").replace(/ä/g, "a").replace(/ö/g, "o").replace(/ü/g, "u"); }
function cxToks(s) { return cxLoose(s).split(" ").filter(Boolean); }
function cxLev(a, b) {
  if (a === b) return 0;
  const m = a.length, n = b.length;
  if (Math.abs(m - n) > 2) return 3;
  let prev = Array.from({ length: n + 1 }, (_, j) => j);
  for (let i = 1; i <= m; i++) {
    const cur = [i];
    for (let j = 1; j <= n; j++) cur[j] = Math.min(prev[j] + 1, cur[j - 1] + 1, prev[j - 1] + (a[i - 1] === b[j - 1] ? 0 : 1));
    prev = cur;
  }
  return prev[n];
}
// Words that carry the grammar: a slip in one of them is a mistake, never "almost".
const CX_GRAMMAR_TOK = /^(k?ein\w*|d(er|ie|as|en|em|es)|mein\w*|dein\w*|sein\w*|ihr\w*|unser\w*|eu(er|r)\w*|dies\w*|jed\w*|welch\w*|nicht\w*|nie\w*|sondern|aber|doch|ja|nein|und|oder)$/;
function cxBag(toks) { const m = new Map(); toks.forEach(t => m.set(t, (m.get(t) || 0) + 1)); return m; }
function cxBagEq(a, b) { if (a.length !== b.length) return false; const A = cxBag(a); for (const t of b) { const k = A.get(t); if (!k) return false; A.set(t, k - 1); } return true; }
// Tokens of `a` not matched in `b` (multiset difference).
function cxMinus(a, b) { const B = cxBag(b), out = []; a.forEach(t => { const k = B.get(t); if (k) B.set(t, k - 1); else out.push(t); }); return out; }

// ── THE WORD-ORDER RULES ───────────────────────
// More than one order is right: German keeps the verb second, and a time
// phrase can start the sentence (then the subject follows the verb) or
// sit after the verb (and its pronoun objects). From each answer the
// checker builds the other order by that rule, so "Heute habe ich keine
// Zeit" and "Ich habe heute keine Zeit" are both right without listing
// both. Only pronoun subjects and time phrases move (nothing it could get
// wrong); never in a nicht … sondern sentence (the place of nicht is
// the point there).
const CX_PRON_SUBJ = /^(ich|du|er|sie|es|wir|ihr|man)$/;
const CX_PRON_OBJ = /^(mich|dich|ihn|sie|es|uns|euch|ihnen|mir|dir|ihm|sich)$/;
const CX_TIME1 = /^(heute|morgen|gestern|jetzt|bald|dann|später|sonntags|montags|samstags|abends|morgens|manchmal|oft|immer|leider|hier)$/;
const CX_TIME2A = /^(am|im|um|nächste[ns]?|letzte[ns]?|diese[ns]?|jeden|heute|morgen|gestern)$/;
const CX_TIME2B = /^(abend|morgen|mittag|nachmittag|montag|dienstag|mittwoch|donnerstag|freitag|samstag|sonntag|wochenende|sommer|winter|herbst|frühling|januar|februar|märz|april|mai|juni|juli|august|september|oktober|november|dezember|woche|monat|jahr|acht|neun|zehn|elf|zwölf|eins|zwei|drei|vier|fünf|sechs|sieben|früh)$/;
function cxTimeLen(w, i) {
  const a = (w[i] || "").toLowerCase(), b = (w[i + 1] || "").toLowerCase();
  // (um acht Uhr: the Uhr moves with it)
  if (CX_TIME2A.test(a) && CX_TIME2B.test(b)) return /^uhr$/i.test(w[i + 2] || "") ? 3 : 2;
  return CX_TIME1.test(a) ? 1 : 0;
}
const _cxOrders = new WeakMap();
function cxOrders(item) {
  if (_cxOrders.has(item)) return _cxOrders.get(item);
  const out = [];
  cxAnswers(item).forEach(ans => {
    if (/\bsondern\b/i.test(ans) || /,/.test(ans.replace(/^(nein|ja|doch)(, danke)?,/i, ""))) return;
    const end = (ans.match(/[.!?]+$/) || [""])[0];
    let w = ans.replace(/[.!?]+$/, "").split(/\s+/), pre = [];
    const m = /^(nein|ja|doch),?$/i.exec(w[0] || "");
    if (m) { pre = [w[0]]; w = w.slice(1); if (/^danke,?$/i.test(w[0] || "")) { pre.push(w[0]); w = w.slice(1); } }
    if (w.length < 3) return;
    const cap = s => s.charAt(0).toUpperCase() + s.slice(1);
    const small = s => CX_PRON_SUBJ.test(s.toLowerCase()) || CX_TIME1.test(s.toLowerCase()) || CX_TIME2A.test(s.toLowerCase()) ? s.charAt(0).toLowerCase() + s.slice(1) : s;
    const join = list => { const s = [...pre, ...list].join(" "); return (pre.length ? s : cap(s)) + end; };
    // (a) Pronoun + verb + … time … → Time + verb + pronoun + …
    if (CX_PRON_SUBJ.test(w[0].toLowerCase())) {
      for (let j = 2; j < w.length; j++) {
        const n = cxTimeLen(w, j);
        if (!n || /^nicht$/i.test(w[j - 1])) continue;
        const chunk = w.slice(j, j + n), rest = [...w.slice(2, j), ...w.slice(j + n)];
        if (!rest.length) continue;
        out.push(join([...chunk.map((x, i) => i ? x : x), w[1], small(w[0]), ...rest]));
        break;
      }
    }
    // (b) Time + verb + pronoun + … → Pronoun + verb + (pronoun objects) + time + …
    const n = cxTimeLen(w, 0);
    if (n && w[n + 1] && CX_PRON_SUBJ.test(w[n + 1].toLowerCase()) && w.length > n + 2) {
      const chunk = w.slice(0, n).map(small), verb = w[n], subj = w[n + 1], rest = w.slice(n + 2);
      let k = 0; while (k < rest.length && CX_PRON_OBJ.test(rest[k].toLowerCase())) k++;
      out.push(join([subj, verb, ...rest.slice(0, k), ...chunk, ...rest.slice(k)]));
    }
  });
  const res = out.filter(v => !cxAnswers(item).some(a => cxStrict(a) === cxStrict(v)));
  _cxOrders.set(item, res);
  return res;
}

// ── CHECKING AN ANSWER ────────────────────────
// → { ok, soft: [notes], right, near?, rule?, msg?, empty? }
//   ok: one of the accepted answers, give or take capitals, punctuation,
//   ß/ss and an umlaut (soft: said, still right). Several word orders are
//   accepted when the item lists them. A wrong answer is diagnosed by the
//   section's detectors (cxDiagnose) to name the rule it broke.
function cxAnswers(item) { return (item.a || []).map(String); }
function cxCheck(item, typed, sec) {
  const answers = [...cxAnswers(item), ...(item.k === "order" || item.fixed ? [] : cxOrders(item))], t = String(typed || "").trim();
  if (!t) return { ok: false, empty: true, soft: [], right: answers[0] || "" };
  for (const a of answers) {
    if (cxStrict(a) === cxStrict(t)) {
      const soft = [];
      const strip = s => s.normalize("NFC").replace(/[.,!?;:„“"«»‚‘’()…–—]/g, " ").replace(/\s+/g, " ").trim();
      // A noun (or Sie) written small, mid-sentence: say so.
      const at = strip(a).split(" "), tt = strip(t).split(" ");
      if (at.length === tt.length && at.some((w, i) => i > 0 && w !== tt[i] && /^[A-ZÄÖÜ]/.test(w))) soft.push("caps");
      return { ok: true, soft, right: a };
    }
  }
  for (const a of answers) {
    if (cxLoose(a) === cxLoose(t)) return { ok: true, soft: [/ß/.test(a) && !/ß/.test(t) ? "ss" : "umlaut"], right: a };
  }
  // The closest accepted answer, for the feedback and the diagnosis.
  const T = cxToks(t);
  let best = answers[0] || "", bestD = Infinity;
  answers.forEach(a => { const A = cxToks(a); const d = cxMinus(A, T).length + cxMinus(T, A).length; if (d < bestD) { bestD = d; best = a; } });
  const A = cxToks(best);
  const res = { ok: false, soft: [], right: best };
  // One letter off in an ordinary word (not one that carries the grammar):
  // almost — one more try.
  const miss = cxMinus(A, T), extra = cxMinus(T, A);
  if (miss.length === 1 && extra.length === 1 && miss[0].length >= 4 && !CX_GRAMMAR_TOK.test(miss[0]) && cxLev(miss[0], extra[0]) === 1) res.near = true;
  const d = cxDiagnose(item, T, A, sec, String(best).normalize("NFC").replace(/[.,!?;:„“"«»‚‘’()…–—]/g, " ").split(/\s+/).filter(Boolean));
  if (d) { res.rule = d.rule; res.msg = d.msg; }
  if (!res.rule) res.rule = (item.r || [])[0] || null;
  return res;
}
// The detectors a section names (its `diag`), in order; the first that
// fits explains the miss:
//   swap    { from, to }  you wrote a `from` word where a `to` word goes
//   ending  { stem }      the right word, the wrong ending
//   seq     { seq: [a, b] } you wrote a, then b (nicht ein…)
//   pos     { tok }       the same words, `tok` in another place
//   missing { tok } / extra { tok }
// Messages fill {right} (the word that goes there), {typed} and {where}
// (where tok goes: "before «in die Stadt»" / "at the end").
const cxRx = x => x instanceof RegExp ? x : new RegExp("^" + String(x) + "$");
// orig: the answer's own words, as written (A is lowercased for matching).
function cxWhere(A, tok, orig = null) {
  const i = A.findIndex(t => cxRx(tok).test(t));
  if (i < 0) return "";
  if (i === A.length - 1) return "at the very end";
  const W = orig && orig.length === A.length ? orig : A;
  return `right before «${W.slice(i + 1, i + 3).join(" ")}${A.length > i + 3 ? " …" : ""}»`;
}
function cxDiagnose(item, T, A, sec, orig = null) {
  const list = [...(item.diag || []), ...((sec && sec.diag) || [])];
  const fill = (m, o) => String(m || "").replace(/\{(\w+)\}/g, (s, k) => o[k] !== undefined ? o[k] : s);
  for (const d of list) {
    let o = null;
    if (d.t === "swap") {
      const f = cxRx(d.from), to = cxRx(d.to);
      const tf = cxMinus(T, A).find(x => f.test(x)), at = cxMinus(A, T).find(x => to.test(x));
      if (tf && at) o = { typed: tf, right: at };
    } else if (d.t === "ending") {
      const re = new RegExp("^" + d.stem + "\\w*$");
      const tf = cxMinus(T, A).find(x => re.test(x)), at = cxMinus(A, T).find(x => re.test(x));
      if (tf && at) o = { typed: tf, right: at };
    } else if (d.t === "seq") {
      const [a, b] = d.seq.map(cxRx);
      for (let i = 0; i + 1 < T.length; i++) if (a.test(T[i]) && b.test(T[i + 1])) { o = { typed: T[i] + " " + T[i + 1] }; break; }
    } else if (d.t === "pos") {
      const re = cxRx(d.tok);
      if (cxBagEq(T, A) && T.some(x => re.test(x)) && T.findIndex(x => re.test(x)) !== A.findIndex(x => re.test(x))) o = { where: cxWhere(A, d.tok, orig) };
    } else if (d.t === "missing") {
      const re = cxRx(d.tok);
      if (A.some(x => re.test(x)) && !T.some(x => re.test(x))) o = {};
    } else if (d.t === "extra") {
      const re = cxRx(d.tok);
      if (T.some(x => re.test(x)) && !A.some(x => re.test(x))) o = {};
    }
    if (o) {
      const rule = d.rule && (!item.r || item.r.includes(d.rule) || cxRule(d.rule)) ? d.rule : (item.r || [])[0];
      return { rule, msg: fill(d.msg, o) };
    }
  }
  if (cxBagEq(T, A)) return { rule: (item.r || [])[0], msg: "The right words, another order." };
  return null;
}

// ── DRILL ITEMS ───────────────────────────────
// A drill set: { id, ex, t: kind, title, how, items: [...], d?: [distractor
// tiles], gen? }. An item: { q, a: [answers], r: [rules], k?, hl?, en?,
// o?, model?, check?, w? (compose: the cue words), tiles?, cap?, fixed? }
// (order: a = the lines in their order).
function cxItemKind(set, item) { return item.k || set.t; }
// A generated set's items, from the verb engine (grammar-de.js): pure
// conjugation is never hand-written (PLAN.md §7). gen: { kind: "conj",
// verbs, tense?: "pr" | "pt" | "im", persons? } — a command (im) asks
// du · ihr · Sie and its answer is the whole command (komm · kommt · kommen Sie).
const CX_GEN_LABEL = { pr: { er: "er/sie/es", sie: "sie (they)" }, pt: { er: "er/sie/es", sie: "sie (they)" }, im: { du: "du:", ihr: "ihr:", Sie: "Sie:" } };
function cxGenItems(set, n = 10) {
  const g = set.gen;
  if (!g || g.kind !== "conj" || typeof vxVerb !== "function") return [];
  const t = g.tense || "pr", label = CX_GEN_LABEL[t] || {};
  const out = [], persons = g.persons || (t === "im" ? ["du", "ihr", "Sie"] : ["ich", "du", "er", "wir", "ihr", "sie"]);
  const verbs = g.verbs.map(vxVerb).filter(Boolean);
  const q = (x, p) => t === "im" ? `${label[p] || p} ___! (${x.inf})` : `${label[p] || p} ___ (${x.inf})`;
  for (let i = 0; i < n * 3 && out.length < n && verbs.length; i++) {
    const x = verbs[i % verbs.length], p = persons[Math.floor(Math.random() * persons.length)];
    const f = vxForm(x, t, p);
    if (!f || out.some(o => o.q === q(x, p))) continue;
    out.push({ k: "type", q: q(x, p), a: f.acc || [f.ans], r: set.r || [], gen: true, inf: x.inf, p, t });
  }
  return out;
}
function cxSetItems(set) { return set.gen ? cxGenItems(set, set.n || 10) : set.items || []; }
// The tiles of a build-it item: the answer's words (or the item's own
// tiles), the first one small unless it's a name or noun (cap), plus up to
// two wrong ones that would fit (the set's d). A set marked low writes
// every first word small (a question's verb, a command) — its items that
// start with a noun or a name say cap.
const CX_SMALL_START = /^(ich|du|er|sie|es|wir|ihr|man|das|der|die|den|dem|ein|eine|einen|kein\w*|mein\w*|dein\w*|sein\w*|unser\w*|heute|morgen|gestern|jetzt|hier|dort|da|im|am|in|um|nein|ja|nicht|warum|wann|wo|wie|was|wer|hast|hat|habt|haben|bist|ist|sind|seid|bin|kommst|kommt|wohnst|wohnt|gehst|geht|kannst|kann|willst|will|musst|muss|arbeitest|arbeitet|trinkst|trinkt|isst|fährst|fährt|spielst|spielt|siehst|sieht|brauchst|braucht|kaufst|kauft|wird|werden|wirst)$/i;
function cxTiles(set, item) {
  const src = item.tiles || String(item.a[0]).replace(/[.!?]+$/, "").split(/\s+/).map(w => w.replace(/[,;:]$/, ""));
  const tiles = src.map((w, i) => i === 0 && !item.cap && (set.low || CX_SMALL_START.test(w)) ? w.toLowerCase() : w);
  const have = new Set(tiles.map(w => w.toLowerCase()));
  const extra = shuffle((item.d || set.d || []).filter(w => !have.has(String(w).toLowerCase())).slice()).slice(0, 2);
  return { tiles, extra };
}

// ── PICKING ITEMS ─────────────────────────────
// Rotation through a set: least asked first, never the same twice in a row.
// allow: only items whose section rules are all in it (a sheet passed).
function cxSetPick(set, n, avoid = new Set(), allow = null) {
  const items = cxSetItems(set);
  if (!items.length) return [];
  if (set.gen) return items.slice(0, n).map(item => ({ set: set.id, item }));
  const C = S.course, ds = C.ds[set.id] || (C.ds[set.id] = [0, 0, 0]);
  const fits = item => !allow || (item.r || []).every(r => allow.has(r) || !cxRule(r) || cxRule(r).sec !== set.sec);
  const out = [];
  let last = -1;
  for (let k = 0; k < items.length && out.length < n; k++) {
    const i = (ds[2] + k) % items.length;
    if (avoid.has(set.id + "#" + i) || !fits(items[i])) continue;
    out.push({ set: set.id, i, item: items[i] }); last = i;
  }
  if (last >= 0) ds[2] = (last + 1) % items.length;
  return out;
}
// The order a section's drill climbs: recognise, then supply, then
// build, then produce (PLAN.md §7: pick → type → tiles → free production).
const CX_LADDER = { pick: 0, respond: 0, type: 1, transform: 2, order: 2, answer: 3, compose: 3, translate: 4, open: 4, write: 5 };
function cxSecSets(secId) { const sec = cxSection(secId); return sec ? sec.sets.map(cxSet).filter(Boolean) : []; }
// The day's drill for a section: 10–14 items, a few from every set in
// ladder order, ending with its production drill(s).
function cxDrillPlan(secId, n = CX_DRILL_N[1], allow = null) {
  const sets = cxSecSets(secId).filter(s => !s.gen && !s.mix && (!allow || (s.items || []).some(it => (it.r || []).some(r => allow.has(r)))));
  if (!sets.length) return [];
  // (more sets than a drill has room for — the verb lesson's book
  // exercises: the ones asked least so far, in turn; production too)
  const asked = s => ((S.course && S.course.ds && S.course.ds[s.id]) || [0, 0])[1] || 0;
  const least = (list, k) => list.length <= k ? list : list.map((s, i) => ({ s, i })).sort((a, b) => asked(a.s) - asked(b.s) || a.i - b.i).slice(0, k).sort((a, b) => a.i - b.i).map(o => o.s);
  const prod = least(sets.filter(s => CX_PRODUCTION.has(s.t) && s.end), 2);
  const room = Math.max(1, n - prod.length);
  const main = least(sets.filter(s => !(CX_PRODUCTION.has(s.t) && s.end)), room).sort((a, b) => (CX_LADDER[a.t] || 0) - (CX_LADDER[b.t] || 0));
  const per = Math.max(1, Math.floor(room / Math.max(1, main.length)));
  const out = [];
  main.forEach(s => out.push(...cxSetPick(s, per, new Set(), allow)));
  // Spare room: more from the fullest sets.
  for (let pass = 0; pass < 3 && out.length < room; pass++)
    for (const s of main.slice().sort((a, b) => cxSetItems(b).length - cxSetItems(a).length)) {
      if (out.length >= room) break;
      out.push(...cxSetPick(s, 1, new Set(out.map(e => e.set + "#" + e.i)), allow));
    }
  const lv = e => CX_LADDER[cxItemKind(cxSet(e.set), e.item)] || 0;
  out.sort((a, b) => lv(a) - lv(b));
  prod.forEach(s => out.push(...cxSetPick(s, 1, new Set(), allow)));
  return out.slice(0, n);
}
// All of a section's items (or one set) for practice outside Today.
function cxPracticePlan(secId, setId, n = 12) {
  if (setId) { const s = cxSet(setId); return s ? cxSetPick(s, n) : []; }
  return cxDrillPlan(secId, n);
}
// The items that can review a rule, in the format its stage asks for.
function cxRulePool(rule) {
  const out = [];
  Object.values(CX.sets).forEach(s => { if (s.gen) return; (s.items || []).forEach((item, i) => { if ((item.r || []).includes(rule)) out.push({ set: s.id, i, item }); }); });
  return out;
}
function cxReviewFor(rule, avoid = new Set()) {
  const ws = cxRuleWS(rule), st = (ws && ws.st) || 1;
  const pool = cxRulePool(rule).filter(e => !avoid.has(e.set + "#" + e.i));
  if (!pool.length) return null;
  const lv = e => CX_LADDER[cxItemKind(cxSet(e.set), e.item)] || 0;
  // Stage 1–2: recognise or supply · 3–4: build or transform · 5+: produce.
  const want = st <= 2 ? [0, 1, 2] : st <= 4 ? [1, 2, 3] : [3, 4, 2];
  const fit = pool.filter(e => want.includes(lv(e)) && !["open", "write"].includes(cxItemKind(cxSet(e.set), e.item)));
  const list = fit.length ? fit : pool;
  const C = S.course, k = C.rot[rule] || 0;
  C.rot[rule] = k + 1;
  return Object.assign({ rule, review: true }, list[k % list.length]);
}
// A test-out: two questions per rule (typed where it can), mixed.
function cxTestoutPlan(secId) {
  const sec = cxSection(secId), out = [], seen = new Set();
  if (!sec) return out;
  const n = (sec.testout && sec.testout.n) || CX_TESTOUT.n;
  const per = Math.ceil(n / Math.max(1, sec.rules.length));
  sec.rules.forEach(r => {
    const pool = shuffle(cxRulePool(r).filter(e => cxSet(e.set).sec === secId && !["open", "write"].includes(cxItemKind(cxSet(e.set), e.item))).slice());
    pool.sort((a, b) => (CX_LADDER[cxItemKind(cxSet(b.set), b.item)] >= 1) - (CX_LADDER[cxItemKind(cxSet(a.set), a.item)] >= 1));
    let k = 0;
    for (const e of pool) { if (k >= per) break; const key = e.set + "#" + e.i; if (seen.has(key)) continue; seen.add(key); out.push({ ...e, testout: true }); k++; }
  });
  return shuffle(out).slice(0, n);
}

// ── THE ORDER ─────────────────────────────────
// A checkpoint opens once every other section of its stage is done.
function cxCheckpointReady(sec) {
  return CX.sections.filter(s => s.stage === sec.stage && s !== sec && !(s.kind === "recap")).every(s => cxSecDone(s.id));
}
// The stage's lesson sections done, and the rules they taught.
function cxStageRules(stage) {
  return CX.sections.filter(s => s.stage === stage && s.built && s.sheets.length && cxSecDone(s.id)).flatMap(s => s.rules);
}
// A checkpoint: the stage's rules, round and round, typed where it can.
function cxCheckpointPlan(secId) {
  const sec = cxSection(secId), cp = sec && sec.checkpoint;
  if (!cp) return [];
  const rules = shuffle(cxStageRules(sec.stage).slice()), out = [], avoid = new Set();
  for (let pass = 0; pass < 6 && out.length < cp.n; pass++)
    for (const r of rules) {
      if (out.length >= cp.n) break;
      const pool = cxRulePool(r).filter(e => !avoid.has(e.set + "#" + e.i) && !["write", "open"].includes(cxItemKind(cxSet(e.set), e.item)));
      const typed = pool.filter(e => (CX_LADDER[cxItemKind(cxSet(e.set), e.item)] || 0) >= 1);
      const e = (typed.length ? typed : pool)[Math.floor(Math.random() * (typed.length || pool.length))];
      if (e) { avoid.add(e.set + "#" + e.i); out.push({ ...e, rule: r, checkpoint: true }); }
    }
  return out;
}
// A contrast day — mixed items from the sections done — about every 5th
// day once two sections are done, on a day between new sheets (at one
// sheet a day it takes that day's sheet slot).
function cxContrastDue(today = studyToday()) {
  const C = S.course;
  if (!C.since) return false;
  const done = CX.sections.filter(s => s.built && cxSecDone(s.id)).length;
  return done >= 2 && (!C.cd || daysBetween(C.cd, today) >= 5);
}
// ── THE PLANNER: THE LESSON CLOCK (PLAN.md §9) ─
// Lesson, consolidate, lesson, consolidate. One lesson at a time, in
// course order; its sheets on consecutive study days (one a day, each
// course sheet with its drill); then a break of G study days with no new
// sheet — the drill, reviews, mixed practice and writing of what I just
// learned — the same G after every lesson, 1 sheet or 10:
//   G = (study days left − sheets left) ÷ lessons left
// counted to the target (the finish date − CX_LAG), the study days scaled
// by my rhythm (cxAttend). Recomputed every day; a lesson under way is
// never stretched. The fraction is carried from lesson to lesson, so the
// breaks alternate around G (2.3 → 2, 2, 3, 2, 2, 3…).
// The verb lessons are lessons like any other: the clock says when their
// sheets come, the verb track brings them (cxVerbClock). A lesson not
// built yet counts its estimated sheets (`n` in plan.js), so the pace is
// the complete course's. The post-B1 bonus ("Could") isn't paced to the
// target: it comes after the rest, spread to the finish date itself.
const CX_GAP_MAX = 7;         // a break is never longer than a week
const CX_SECOND_MAX = 2;      // behind: at most this many new sheets a day

function cxIsVerb(s) { return !!(s && s.verb && s.verb.length); }
function cxIsRecap(s) { return !!(s && (s.kind === "recap" || s.checkpoint)); }
// A lesson's sheets: the verb track's, a built lesson's own (a checkpoint
// counts 1), or — not built yet — the estimate.
function cxLessonSize(s) {
  if (cxIsVerb(s)) return s.verb.length;
  if (cxIsRecap(s)) return 1;
  return s.built && s.sheets.length ? s.sheets.length : Math.max(1, s.n || 1);
}
// Its sheets still to learn (0 once they're passed, though its drill may
// still be open that day).
function cxLessonLeft(s) {
  if (cxSecDone(s.id)) return 0;
  if (cxIsVerb(s)) return s.verb.filter(id => !(typeof vxSheetPassed === "function" && vxSheetPassed(id))).length;
  if (cxIsRecap(s)) return 1;
  if (!s.built || !s.sheets.length) return Math.max(1, s.n || 1);
  const st = cxSecState(s.id);
  return st && st.st >= 2 ? 0 : s.sheets.filter(id => !cxSheetPassed(id)).length;
}
// Built: a pack loaded (a verb lesson: its sheets in the verb track, which is on).
function cxLessonBuilt(s) {
  if (cxIsVerb(s)) return typeof vxOn === "function" && vxOn() && typeof vxSheet === "function" && s.verb.every(id => !!vxSheet(id));
  return cxLearnable(s);
}
// The post-B1 bonus waits for every other lesson.
function cxBonusOpen() { return CX.sections.every(s => s.prio === "C" || cxSecDone(s.id)); }
// Can it be learned now: built, not done, every lesson it builds on
// (`after`) done; a checkpoint once its stage is; the bonus after the rest.
function cxLessonReady(s) {
  if (!s || cxSecDone(s.id) || !cxLessonBuilt(s)) return false;
  if ((s.after || []).some(id => !cxSecDone(id))) return false;
  if (s.checkpoint && !cxCheckpointReady(s)) return false;
  if (s.prio === "C" && !cxBonusOpen()) return false;
  return true;
}
// Begun and not finished: a sheet passed (or a sheet, test-out or
// checkpoint tried and missed).
function cxLessonStarted(s) {
  if (cxSecDone(s.id)) return false;
  if (cxIsVerb(s)) return s.verb.some(id => vxSheetPassed(id));
  const st = cxSecState(s.id);
  return !!st && (st.st === 1 || st.st === 2 || !!(st.ok && Object.keys(st.ok).length) || !!(s.checkpoint && st.tries));
}
// The lesson under way: carried on whatever the break says.
function cxCurrentLesson() {
  return CX.sections.find(s => cxLessonStarted(s) && cxLessonReady(s)) || null;
}
// The lesson the clock takes next: the one under way, else the first
// ready one in course order (an earlier lesson built later comes first).
function cxClockLesson() {
  return cxCurrentLesson() || CX.sections.find(cxLessonReady) || null;
}
// The next lessons in the clock's order (built and ready).
function cxNextSections(n = 1) {
  const cur = cxCurrentLesson(), out = cur ? [cur] : [];
  for (const s of CX.sections) { if (out.length >= n) break; if (s !== cur && cxLessonReady(s)) out.push(s); }
  return out.slice(0, n);
}
// My rhythm: the share of days I opened the app over the last 4 weeks
// (1 before a week of it is recorded; never under a quarter).
function cxAttend(today = studyToday()) {
  const C = S.course;
  if (!C || !Array.isArray(C.seen) || !C.seen.length) return 1;
  // (from the first day recorded: an older copy of the app kept none)
  const first = C.seen[0], from = first > addDays(today, -27) ? first : addDays(today, -27);
  const days = daysBetween(from, today) + 1;
  if (days < 7) return 1;
  // (today counts: the app is open — before or after the day rolls over)
  const n = C.seen.filter(d => d >= from && d <= today).length + (C.seen.includes(today) ? 0 : 1);
  return Math.max(0.25, Math.min(1, n / days));
}
// The clock's numbers today: the lessons and sheets left (paced: Must and
// Should; once they're all done, the bonus to the finish date), the study
// days left and G. No finish date: lesson after lesson (G 0).
function cxClock(today = studyToday()) {
  const deadline = typeof pathDeadlineOn === "function" && pathDeadlineOn() ? S.path.deadline : "";
  let bonus = false, L = 0, Sh = 0;
  const count = s => { if (!cxSecDone(s.id)) { L++; Sh += cxLessonLeft(s); } };
  CX.sections.forEach(s => { if (s.prio !== "C") count(s); });
  if (!L) { bonus = true; CX.sections.forEach(s => { if (s.prio === "C") count(s); }); }
  if (!deadline) return { deadline: "", target: "", days: 0, D: 0, L, S: Sh, G: 0, bonus };
  const target = bonus ? deadline : addDays(deadline, -CX_LAG);
  const days = daysBetween(today, target), D = Math.max(0, days) * cxAttend(today);
  const G = L ? Math.max(0, Math.min(CX_GAP_MAX, (D - Sh) / L)) : 0;
  return { deadline, target, days, D, L, S: Sh, G, bonus };
}
// The break after the k-th lesson (k lessons done): the fraction carried,
// so the breaks alternate around G and add up to it.
function cxBreakAfter(k, G) { return Math.floor((k + 1) * G + 1e-9) - Math.floor(k * G + 1e-9); }
function cxLessonsDone() { return CX.sections.filter(s => cxSecDone(s.id)).length; }
function cxBreak(today = studyToday()) { return cxBreakAfter(cxLessonsDone(), cxClock(today).G); }
// (kept for the screens and the tests: days from one lesson's start to
// the next one's, a one-sheet lesson — the break plus its day)
function cxGap(today = studyToday()) { return cxBreak(today) + 1; }
// The verb sheets of the course's lessons.
let _cxVerbIds = null;
function cxVerbLessonIds() {
  if (!_cxVerbIds) { _cxVerbIds = new Set(); CX.sections.forEach(s => (s.verb || []).forEach(id => _cxVerbIds.add(id))); }
  return _cxVerbIds;
}
// New sheets begun today: the course's passed today, the verb lessons'
// opened today (a verb sheet opened uses up its day — verb-track.js).
function cxSheetsToday() {
  const C = S.course, dd = (C && C.dd) || {};
  let n = 0;
  Object.keys(dd).forEach(k => { if (k.startsWith("sheet:")) n += +dd[k] || 1; });
  if (S.verb && S.verb.day === studyToday() && S.verb.su) Object.keys(S.verb.su).forEach(id => { if (cxVerbLessonIds().has(id)) n++; });
  return n;
}
// A lesson piece learned today (a sheet passed, a test-out or checkpoint done).
function cxLearnedToday() {
  const C = S.course;
  return !!C && (C.last === studyToday() || Object.keys(C.dd || {}).some(k => /^(sheet|to|sec):/.test(k)));
}
// The day the next new sheet comes: today while a lesson is under way;
// after a lesson, once its break (study days) is over — or at once, back
// after a long time away (twice the break in the calendar).
function cxNextLessonDay(today = studyToday()) {
  const C = S.course;
  if (!C || cxCurrentLesson()) return today;
  if (!C.last) return today;
  // (today counts: the app is open)
  const n = (C.seen || []).filter(d => d > C.last && d < today).length + (today > C.last ? 1 : 0), b = cxBreak(today);
  if (n > b || daysBetween(C.last, today) >= 2 * (b + 1)) return today;
  return addDays(today, b + 1 - n);
}
// The planner's status from the clock's numbers (see cxPlanner).
function cxStatusOf(K) { return !K.target ? "none" : !K.L ? "green" : K.days <= 0 ? "red" : K.D >= K.S + K.L ? "green" : K.D >= K.S ? "amber" : "red"; }
// Behind: a second sheet today (every other day, or on an easy day) —
// never while rules are failing or the reviews pile up.
function cxSecondToday(scan) {
  if (cxStatusOf(cxClock()) !== "red") return false;
  const { fix, due } = cxDueRules(), C = S.course;
  return fix.length <= CX_WARM_MAX && due.length <= 3 * CX_REVIEW[1]
    && (!!C.since && daysBetween(C.since, studyToday()) % 2 === 0 || cxBudget(scan).easy);
}
// Today's lessons and how many new sheets each may still give:
// [{ s, sheets }] — the lesson under way (or the next one, its break
// over); behind, a second sheet, then the next lesson may start the same
// day. [] on a break day.
function cxDayLessons(scan) {
  if (!cxOn()) return [];
  const today = studyToday();
  if (cxNextLessonDay(today) > today) return [];
  const allow = cxSecondToday(scan) ? CX_SECOND_MAX : 1;
  let room = Math.max(0, allow - cxSheetsToday());
  const out = [], cur = cxCurrentLesson();
  // A lesson finished today (its break starts) brings no other one today
  // unless behind.
  if (!cur && cxLearnedToday() && allow < 2) return [];
  const list = cur ? [cur, ...CX.sections.filter(s => s !== cur && cxLessonReady(s))] : CX.sections.filter(cxLessonReady);
  for (const s of list) {
    const left = cxLessonLeft(s), k = Math.min(left, room);
    out.push({ s, sheets: k });
    room -= k;
    // One lesson at a time: the next only when this one has nothing left
    // after today and there's room for another sheet.
    if (left - k > 0 || room <= 0 || allow < 2) break;
  }
  return out;
}
// The verb track's sheets as the clock gives them (verb-track.js):
// today's — the verb lesson's next sheet(s) on its days; next — the verb
// lesson under way or next in line, its sheets still to learn (the
// grammar screen's "next lesson"); inLesson — every verb sheet of a
// lesson (the others the verb track paces itself). null: no course.
function cxVerbClock(scan) {
  if (!cxOn()) return null;
  migrateCourse();
  const today = [];
  cxDayLessons(scan).forEach(({ s, sheets }) => { if (cxIsVerb(s)) today.push(...s.verb.filter(id => !vxSheetPassed(id)).slice(0, sheets)); });
  const nx = cxClockLesson(), next = nx && cxIsVerb(nx) ? nx.verb.filter(id => !vxSheetPassed(id)) : [];
  return { today, next, inLesson: cxVerbLessonIds() };
}
// The course lesson a verb sheet belongs to (null: none, or no course) —
// so Today and the sheet name the lesson the Course shows, with its count.
function cxVerbLessonOf(id) {
  if (!cxOn() || !cxVerbLessonIds().has(id)) return null;
  const s = CX.sections.find(x => cxIsVerb(x) && x.verb.includes(id));
  return s ? { s, n: s.verb.indexOf(id) + 1, of: s.verb.length, sign: (cxStage(s.stage) || {}).sign || "" } : null;
}
// A verb sheet of a course lesson learned: the break is counted from it.
function cxVerbSheetLearned(id) {
  if (!cxOn() || !cxVerbLessonIds().has(id)) return;
  migrateCourse();
  S.course.last = studyToday();
  if (!S.course.since) S.course.since = studyToday();
  _cxSimMemo = null;
}

// ── THE CLOCK, FORWARD ────────────────────────
// The days to come (≈, if I come every day): when each lesson starts and
// ends at today's G. complete: every lesson as if built (the estimates —
// the course's dates); else only what is built (the coming days).
// → { days: [{ d, lesson: id | null }], start: { id: day }, end: { id: day }, last: day }
let _cxSimMemo = null;
function cxClockSim(n = 400, complete = true) {
  const today = studyToday();
  const key = [today, complete, n, CX.packs.length, S.course && S.course.last, cxSheetsToday(), cxLessonsDone(), cxSheetsLeft(), S.path && S.path.deadline, Object.keys((S.course && S.course.dd) || {}).length].join("|");
  if (_cxSimMemo && _cxSimMemo.key === key) return _cxSimMemo.out;
  const G = cxClock(today).G, done = new Set(CX.sections.filter(s => cxSecDone(s.id)).map(s => s.id));
  const left = {};
  CX.sections.forEach(s => { if (!done.has(s.id)) left[s.id] = cxLessonLeft(s); });
  const isDone = id => done.has(id);
  const ready = s => !isDone(s.id) && (complete || cxLessonBuilt(s)) && (s.after || []).every(isDone)
    && (!cxIsRecap(s) || CX.sections.filter(x => x.stage === s.stage && x !== s && !cxIsRecap(x)).every(x => isDone(x.id)))
    && (s.prio !== "C" || CX.sections.every(x => x.prio === "C" || isDone(x.id)));
  let k = done.size, last = (S.course && S.course.last) || "", cur = cxCurrentLesson();
  const out = { days: [], start: {}, end: {}, last: "" };
  const finish = (s, d) => { done.add(s.id); out.end[s.id] = d; k++; last = d; cur = null; };
  // Today: what the day holds (or already did).
  const day0 = cxDayLessons();
  let lessonToday = null;
  day0.forEach(({ s, sheets }) => {
    lessonToday = lessonToday || s.id;
    if (!out.start[s.id]) out.start[s.id] = today;
    left[s.id] = Math.max(0, (left[s.id] || 0) - sheets);
    if (left[s.id] <= 0) finish(s, today); else cur = s;
  });
  if (!lessonToday && cxLearnedToday()) { lessonToday = (cur && cur.id) || "·"; if (!cur) last = today; }
  out.days.push({ d: today, lesson: lessonToday });
  for (let i = 1; i < n; i++) {
    const d = addDays(today, i);
    let id = null;
    if (!cur && (!last || daysBetween(last, d) > cxBreakAfter(k, G))) {
      cur = CX.sections.find(ready) || null;
      if (cur && !out.start[cur.id]) out.start[cur.id] = d;
    }
    if (cur) {
      id = cur.id;
      left[cur.id] = (left[cur.id] || 1) - 1;
      if (left[cur.id] <= 0) finish(cur, d);
    }
    out.days.push({ d, lesson: id });
    if (!cur && CX.sections.every(s => isDone(s.id) || !ready(s)) && !CX.sections.some(ready)) {
      // Nothing left that can come: the rest of the days are empty.
      if (complete || CX.sections.every(s => isDone(s.id))) { for (let j = i + 1; j < n; j++) out.days.push({ d: addDays(today, j), lesson: null }); break; }
    }
  }
  CX.sections.forEach(s => { if (s.prio !== "C" && out.end[s.id] && out.end[s.id] > out.last) out.last = out.end[s.id]; });
  _cxSimMemo = { key, out };
  return out;
}
// A verb tense's sheets all learned, on the clock (≈ days from today) —
// for the verb track's pace (verb-track.js vxUnitOpenDays); null when
// its sheets aren't all in the course's lessons; -1 when they're in the
// post-B1 bonus ("if time allows": not paced to the date).
function cxVerbUnitDays(unit) {
  if (!cxOn() || typeof vxSheetIds !== "function") return null;
  const ids = vxSheetIds(unit).filter(id => !vxSheetPassed(id));
  if (!ids.length) return 0;
  if (!ids.every(id => cxVerbLessonIds().has(id))) return null;
  if (CX.sections.some(s => cxIsVerb(s) && s.prio === "C" && s.verb.some(id => ids.includes(id)))) return -1;
  const sim = cxClockSim(), today = studyToday();
  let d = 0;
  for (const s of CX.sections) {
    if (!cxIsVerb(s) || !s.verb.some(id => ids.includes(id))) continue;
    const e = sim.end[s.id];
    if (!e) return null;
    d = Math.max(d, daysBetween(today, e));
  }
  return d;
}

// ── THE PLANNER'S STATUS ──────────────────────
// green — a break of a day or more after every lesson keeps the date ·
// amber — lessons back to back (no break) · red — more sheets than study
// days: a second sheet on some days, past 1.5 a day a later date.
function cxSheetsLeft(prio = null) {
  let n = 0;
  CX.sections.forEach(s => { if (!prio || prio.includes(s.prio)) n += cxLessonLeft(s); });
  return n;
}
// The paced lessons' sheets still to learn (Must and Should).
function cxCourseSheetsLeft(could = false) { return cxSheetsLeft(could ? null : ["M", "S"]); }
function cxPlanner(today = studyToday()) {
  // left: every sheet still to learn; cl: the paced ones (Must, Should).
  const K = cxClock(today), left = cxSheetsLeft(), must = cxSheetsLeft(["M", "S"]), cl = must;
  const target = K.target, days = K.days;
  // Sheets a study day still needed.
  const need = target ? K.S / Math.max(1, K.D) : 0;
  const status = cxStatusOf(K);
  // When the last paced lesson ends at this pace (≈, coming every day);
  // and my own pace over the last 4 weeks (for the report).
  const sim = target ? cxClockSim() : null;
  const eta = sim && sim.last ? sim.last : today;
  const pace = cxPace(today);
  const built = CX.sections.filter(s => s.built || cxIsVerb(s)).length;
  return { left, cl, must, target, days, need, eta, pace, status, built, total: CX.sections.length, G: K.G, L: K.L, S: K.S, D: K.D, brk: cxBreak(today), waiting: !!K.L && !cxClockLesson() };
}
// The sheets I passed a day over the last 4 weeks (sections finished in
// the course; the verb track keeps its own pace) — null before a week of it.
function cxPace(today = studyToday()) {
  const C = S.course;
  if (!C || !C.since) return null;
  const from = C.since > addDays(today, -27) ? C.since : addDays(today, -27);
  const days = daysBetween(from, today) + 1;
  const idle = (C.idle || []).filter(d => d >= from && d <= today).length;
  if (days - idle < 7) return null;
  let n = 0;
  CX.sections.forEach(s => { const st = cxSecState(s.id); if (!s.verb && st && st.at && st.at >= from && st.at <= today && !s.checkpoint) n += s.n || 1; });
  return n / (days - idle);
}
// The day's minutes (PLAN.md §8–9): the words' share estimated from
// today's plan, the grammar block fitted around it — the review and the
// writing prompt give way first; the sheet and its drill never do.
const CX_WORD_MIN = { review: 0.3, fresh: 1.2 };
// The hour a day the plan is built around (PLAN.md §1) — not a setting:
// the finish date sets the pace; this only keeps a heavy word day from
// also getting a flood of grammar reviews.
const CX_DAY_MIN = 60;
// lesson: today brings a sheet and its drill (their minutes come first).
function cxBudget(scan, lesson = true) {
  const mins = CX_DAY_MIN;
  let words = 0;
  try {
    // Today's plan when it's made (never made from here: the plan asks
    // the course for its own numbers), else the Path's numbers.
    const plan = S.path && S.path.plan && S.path.plan.day === studyToday() ? S.path.plan : null;
    scan = scan || (typeof pathScan === "function" ? pathScan() : null);
    const reviews = plan ? plan.reviews : scan ? scan.due : 0, fresh = plan ? plan.pace : (S.path && S.path.newPerDay) || 0;
    words = reviews * CX_WORD_MIN.review + fresh * CX_WORD_MIN.fresh;
  } catch (e) {}
  const left = Math.max(0, mins - words);
  const core = lesson ? CX_MIN.sheet + CX_MIN.drill : 0;
  return { mins, words: Math.round(words), left: Math.round(left), review: Math.max(CX_REVIEW[0], Math.min(CX_REVIEW[1], Math.round((left - core - CX_MIN.warm) / CX_Q_MIN))),
    write: left - core - CX_MIN.review >= CX_MIN.write, easy: words < mins * 0.4 };
}

// ── TODAY ─────────────────────────────────────
// The course's parts of today's loop, not done yet, in order:
//   warm     yesterday's misses (rules being fixed)
//   testout  a Stage 0 section's first look: pass → done, light review
//   sheet    the next sheet + its quiz
//   drill    the sheet's drill set, same day
//   review   due rule items (and, on a contrast day, mixed items)
//   write    a short writing prompt
// Each is one card in a Today session that runs several questions.
// A course lesson's pieces today: its checkpoint, or a test-out (Stage 0,
// before its first sheet), today's sheet (`sheets` new ones allowed) and
// its drill — none once today's part of it is finished.
function cxLessonParts(sec, sheets, dd, add) {
  if (dd["sec:" + sec.id] || cxSecDone(sec.id)) return; // today's part of it, finished
  if (sec.checkpoint) { add({ part: "checkpoint", sec: sec.id }); return; }
  const st = cxSecState(sec.id) || { st: 0 };
  const sheetDone = (dd["sheet:" + sec.id] || 0) > 0;
  if (sec.stage === 0 && sec.testout !== false && st.to === undefined && !(st.st >= 2) && !sheetDone && !(st.ok && Object.keys(st.ok).length)) add({ part: "testout", sec: sec.id });
  // One sheet a day (two when behind); a sheet missed twice today waits
  // for tomorrow (new questions then) — and its drill with it.
  if (!(st.st >= 2) && sheets > 0) {
    if ((dd["try:" + sec.id] || 0) >= 2 && !sheetDone) return;
    add({ part: "sheet", sec: sec.id, sheet: sec.sheets.find(id => !cxSheetPassed(id)) || sec.sheets[0] });
  }
  add({ part: "drill", sec: sec.id });
}
function cxUnderway() { return !!cxCurrentLesson(); }
function cxTodayParts(scan) {
  if (!cxOn()) return [];
  migrateCourse();
  const C = S.course, dd = C.dd, parts = [];
  const { fix, due } = cxDueRules();
  if (fix.length && !dd.warm) parts.push({ part: "warm", rules: fix.slice(0, CX_WARM_MAX) });
  // Today's lesson (the lesson clock: cxDayLessons) — its sheet with its
  // drill, a test-out first in Stage 0, or its checkpoint; none on a break
  // day. A contrast day falls on a break day only. A verb lesson's sheet
  // comes through the verb track (cxVerbClock).
  const lessons = cxDayLessons(scan);
  const contrast = !!dd.contrast || cxContrastDue() && !lessons.length;
  lessons.forEach(({ s: sec, sheets }, li) => {
    if (cxIsVerb(sec)) return;
    // (a second lesson — behind — only if the day's grammar has room for it)
    const mine = [];
    cxLessonParts(sec, sheets, dd, p => mine.push(p));
    if (li > 0 && parts.reduce((n, p) => n + cxPartSize(p), 0) + mine.reduce((n, p) => n + cxPartSize(p), 0) > CX_DAY_Q) return;
    parts.push(...mine);
  });
  // The reviews fit around the day: all the room a day without a new
  // sheet leaves, at least CX_REVIEW[0] even on a heavy one.
  const B = cxBudget(scan, parts.some(p => p.part === "sheet" || p.part === "drill" || p.part === "checkpoint"));
  // (a pile of due rules is cleared over about three days, even on a heavy
  // word day: rules left waiting never reach Known)
  const pile = (dd.warm ? fix.length : Math.max(0, fix.length - CX_WARM_MAX)) + due.length;
  // — and the reviews stop where the day reaches CX_DAY_Q questions.
  const asked = parts.reduce((n, p) => n + cxPartSize(p), 0);
  const revN = Math.min(Math.max(B.review, Math.min(CX_REVIEW[1], Math.ceil(pile / 3))), Math.max(CX_REVIEW[0], CX_DAY_Q - asked));
  const rev = [...(dd.warm ? fix : fix.slice(CX_WARM_MAX)), ...due].slice(0, revN);
  // A contrast day: the due reviews and a few mixed items on top.
  if (contrast && !dd.contrast) parts.push({ part: "review", rules: rev, contrast: true });
  else if (rev.length && !dd.review) parts.push({ part: "review", rules: rev });
  // Writing: on the days between new sheets, on a contrast day, on any
  // day with room for it — and never more than 4 days apart.
  const lessonToday = parts.some(p => p.part === "testout" || p.part === "sheet" || p.part === "drill" || p.part === "checkpoint");
  const lastW = cxJournalList().filter(e => !/^drill:/.test(e.p)).map(e => e.d).pop();
  const writeDue = !lastW || daysBetween(lastW, studyToday()) >= CX_WRITE_EVERY;
  if ((B.write || contrast || !lessonToday || writeDue) && !dd.write && cxJournalPick()) parts.push({ part: "write" });
  return parts;
}
// The course's next days for the Journey's forecast (≈, if I come every
// day): a lesson day (the lesson clock, with what is built — cxClockSim),
// the grammar rules coming due, a writing prompt — the same rules as
// cxTodayParts. Today is what's planned or done today.
// [{ d, lesson, sec, rules, write }]
function cxForecastDays(n = 8) {
  if (!cxOn()) return [];
  migrateCourse();
  const today = studyToday(), C = S.course, dd = C.dd || {}, parts = cxTodayParts();
  const sim = cxClockSim(n, false);
  let lastW = cxJournalList().filter(e => !/^drill:/.test(e.p)).map(e => e.d).pop() || "";
  const prompts = !!cxJournalPick();
  const out = [];
  for (let i = 0; i < n; i++) {
    const d = addDays(today, i), sd = sim.days[i] || {};
    const lesson = !!sd.lesson, sec = sd.lesson && sd.lesson !== "·" ? sd.lesson : "";
    // Rules: today, the ones due now (as Today counts them); a later day,
    // the ones coming due that day.
    const end = studyDayStart(i + 1), start = studyDayStart(i);
    const rules = i === 0 ? (({ fix, due }) => fix.length + due.length)(cxDueRules())
      : Object.keys(CX.rules).filter(r => { const ws = cxRuleWS(r); return ws && ws.st && !(ws.rp || ws.fl || ws.lrn) && ws.dueAt >= start && ws.dueAt < end; }).length;
    const write = i === 0 ? parts.some(p => p.part === "write") || !!dd.write
      : !!prompts && (!lesson || !lastW || daysBetween(lastW, d) >= CX_WRITE_EVERY);
    if (write) lastW = d;
    out.push({ d, lesson, sec, rules, write });
  }
  return out;
}
// The right answers the course adds to each coming day's plan (≈, the
// Journey's "Coming up"; today's is the plan's own): a lesson day its
// sheet (a course lesson's with its drill), the rules coming due, the
// writing prompt — counted as cxPlanTarget counts them.
function cxForecastAnswers(n = 8) {
  if (!cxOn()) return [];
  const sheetQ = (sh, dflt) => sh && typeof gqSheetSize === "function" ? gqSheetSize(sh) : dflt;
  return cxForecastDays(n).map(x => {
    let q = x.rules + (x.write ? 1 : 0);
    const s = x.sec && cxSection(x.sec);
    if (s) q += cxIsVerb(s) ? sheetQ(typeof vxSheet === "function" ? vxSheet(s.verb.find(id => !vxSheetPassed(id)) || s.verb[0]) : null, 4)
      : sheetQ(cxSheet(s.sheets.find(id => !cxSheetPassed(id)) || s.sheets[0]), 3) + CX_DRILL_N[1];
    return cxPlanTarget({ q });
  });
}
// The finish date out of reach for the course? At the fastest the planner
// goes (a second sheet every other day: 1.5 a day), when the last paced
// sheet would come, plus the time its rules take to be Known (path.js
// pathDeadlineStatus).
function cxFastestEta(today = studyToday()) {
  if (!cxOn()) return null;
  const K = cxClock(today);
  if (!K.L || K.bonus) return null;
  return addDays(today, Math.ceil(K.S / 1.5 / cxAttend(today)) + (typeof KNOWN_LAG === "number" ? KNOWN_LAG : 30));
}
// Questions each part asks (the session's count; fixed when it's built).
function cxPartSize(p) {
  if (p.part === "warm") return p.rules.length;
  if (p.part === "testout") { const s = cxSection(p.sec); return Math.min((s && s.testout && s.testout.n) || CX_TESTOUT.n, cxTestoutPlan(p.sec).length); }
  if (p.part === "checkpoint") return cxCheckpointPlan(p.sec).length;
  if (p.part === "sheet") { const sh = cxSheet(p.sheet); return sh && typeof gqSheetSize === "function" ? gqSheetSize(sh) : 3; }
  if (p.part === "drill") return CX_DRILL_N[1];
  if (p.part === "review") return p.rules.length + (p.contrast ? CX_CONTRAST_MIX : 0);
  if (p.part === "write") return 1;
  return 0;
}
// A part of a section starts: that section is one of today's.
function cxPartBegin(p) {
  migrateCourse();
  if (p.sec && (p.part === "testout" || p.part === "sheet" || p.part === "drill")) S.course.dd["new:" + p.sec] = 1;
  if (!S.course.since) S.course.since = studyToday();
}
// Does a part built into this session still apply (a test-out passed
// since makes its sheet and drill unnecessary; a sheet passed elsewhere…)?
function cxPartLive(p) {
  if (!cxOn()) return false;
  const st = p.sec ? cxSecState(p.sec) || { st: 0 } : null;
  if (p.part === "testout") return st.to === undefined && !(st.st >= 2);
  if (p.part === "sheet") return !(st.st >= 2);
  // A sheet not passed today: its drill still comes, as practice (the
  // section isn't done then — the sheet comes back tomorrow).
  if (p.part === "drill" || p.part === "checkpoint") return !cxSecDone(p.sec) && !S.course.dd["sec:" + p.sec];
  if (p.part === "warm") return cxDueRules().fix.length > 0 && !S.course.dd.warm;
  // (✅ Due today asks the rules due whatever Today did)
  if (p.part === "review") return !!p.dues || !S.course.dd[p.contrast ? "contrast" : "review"];
  if (p.part === "write") return !S.course.dd.write;
  return true;
}
// What a part asks, in order (course-ui.js runs it; sim.mjs answers it).
const CX_CONTRAST_MIX = 6;    // mixed items a contrast day adds
// The sections mixed practice draws on: the lessons done — and the verb
// lessons done whose book exercises have their drills here (their sheets
// live in the verb track; these are the book's Übungen for them).
function cxMixSections() {
  return CX.sections.filter(s => s.built && cxSecDone(s.id) && (s.sheets.length || cxIsVerb(s) && s.sets.some(id => !cxSet(id).gen)));
}
function cxPartList(p) {
  if (p.part === "testout") return cxTestoutPlan(p.sec);
  if (p.part === "checkpoint") return cxCheckpointPlan(p.sec);
  if (p.part === "drill") {
    // A section of several sheets, not all passed yet: today's drill
    // keeps to the rules of the sheets passed.
    const sec = cxSection(p.sec), st = cxSecState(p.sec) || {};
    const allow = !(st.st >= 2) && sec.sheets.length > 1 ? new Set(sec.sheets.filter(cxSheetPassed).flatMap(id => cxSheet(id).rid || [])) : null;
    return cxDrillPlan(p.sec, CX_DRILL_N[1], allow && allow.size ? allow : null);
  }
  const reviews = () => { const avoid = new Set(); return (p.rules || []).map(r => { const e = cxReviewFor(r, avoid); if (e) avoid.add(e.set + "#" + e.i); return e; }).filter(Boolean); };
  if (p.part === "warm" || (p.part === "review" && !p.contrast)) return reviews();
  if (p.part === "review" && p.contrast) {
    // Contrast: the day's reviews, then items from every section done, mixed.
    const mix = [];
    cxMixSections().forEach(s => mix.push(...cxDrillPlan(s.id, 4).filter(e => !["write", "open"].includes(cxItemKind(cxSet(e.set), e.item)))));
    return [...reviews(), ...shuffle(mix).slice(0, CX_CONTRAST_MIX)];
  }
  if (p.part === "write") return []; // the journal (course-ui.js cxJournalOpen)
  return [];
}
function cxPartDone(p) {
  const C = S.course;
  cxRollDay();
  // (a card cut to fit its session — path.js pathGrammarFit — leaves its
  // other rules for the next session: the part stays open)
  if (p.part === "warm") { if (!p.cut) C.dd.warm = 1; }
  // (✅ Due today doesn't close Today's reviews: rules it left, or due later
  // today, still come — Today's card only holds the rules still due)
  else if (p.part === "review" && !p.dues) { if (!p.cut || p.contrast) C.dd[p.contrast ? "contrast" : "review"] = 1; if (p.contrast) C.cd = studyToday(); }
  else if (p.part === "write") C.dd.write = 1;
  else if (p.part === "testout") C.dd["to:" + p.sec] = 1;
  else if (p.part === "sheet") { if (!C.dd["sheet:" + p.sec]) C.dd["sheet:" + p.sec] = 1; } // (counted when passed: cxSheetResult)
  else if (p.part === "drill" || p.part === "checkpoint") C.dd["sec:" + p.sec] = 1;
  saveState();
}
// What the Today card counts: rules to fix / due, and the day's lesson.
function cxTodayCounts() {
  if (!cxOn()) return { due: 0, fix: 0, lesson: null, parts: 0 };
  migrateCourse();
  const { fix, due } = cxDueRules();
  const parts = cxTodayParts();
  const lesson = parts.find(p => p.part === "sheet" || p.part === "testout" || p.part === "drill") || null;
  return { due: due.length + fix.length, fix: fix.length, lesson, write: parts.some(p => p.part === "write"), parts: parts.length };
}
// The day's plan (made once in the morning, path.js): the right answers
// the course adds to the target.
function cxPlanNumbers(scan) {
  if (!cxOn()) return null;
  const parts = cxTodayParts(scan);
  // A test-out may make its sheet and drill unnecessary: they count half.
  const to = new Set(parts.filter(p => p.part === "testout").map(p => p.sec));
  const q = Math.round(parts.reduce((n, p) => n + cxPartSize(p) * (to.has(p.sec) && p.part !== "testout" ? 0.5 : 1), 0));
  // (half of each test-out's sheet and drill: taken off again if it's passed — cxPlanTrim)
  const cut = {};
  parts.forEach(p => { if (to.has(p.sec) && p.part !== "testout") cut[p.sec] = (cut[p.sec] || 0) + cxPartSize(p) * 0.5; });
  return { parts: parts.map(p => p.part), q, ...(Object.keys(cut).length ? { cut } : {}) };
}
function cxPlanTarget(cx) { return cx ? Math.round((cx.q || 0) * 0.85) : 0; }
// A test-out passed: its sheet and drill won't come, so today's plan
// stops counting their half (the target only ever goes down here).
function cxPlanTrim(secId) {
  const plan = S.path && S.path.plan;
  if (!plan || plan.day !== studyToday() || !plan.cx || !plan.cx.cut || !plan.cx.cut[secId]) return;
  plan.cx.q = Math.max(0, Math.round(plan.cx.q - plan.cx.cut[secId]));
  delete plan.cx.cut[secId];
  if (typeof planTarget !== "function") return;
  const t = planTarget(plan.reviews, plan.pace, (typeof vxPlanTarget === "function" ? vxPlanTarget(plan.vx) : 0) + cxPlanTarget(plan.cx));
  if (t < plan.target) { plan.target = plan.goal = t; if (typeof planSyncQuest === "function") planSyncQuest(plan); }
}

// ── RESULTS ───────────────────────────────────
// A course sheet's quiz is over (grammar-ui.js). Passing puts the
// section's rules into review; the drill comes next.
function cxSheetResult(id, score, all, where) {
  migrateCourse();
  const sh = cxSheet(id);
  if (!sh) return false;
  const passed = all && score >= 1 - 1e-9, pct = Math.round(score * 100);
  cxRollDay();
  S.course.dd["try:" + sh.sec] = (S.course.dd["try:" + sh.sec] || 0) + 1;
  if (!S.course.since) S.course.since = studyToday();
  if (passed && !cxSheetPassed(id)) {
    S.course.last = studyToday(); // a sheet learned today: the next one is spaced from here
    // (the day's new sheets, wherever it was passed: one a day — cxDayLessons)
    S.course.dd["sheet:" + sh.sec] = (S.course.dd["sheet:" + sh.sec] || 0) + 1;
    _cxSimMemo = null;
  }
  if (passed) {
    const st = cxSecSet(sh.sec, { sh: Math.max(1, pct) });
    st.ok = Object.assign(st.ok || {}, { [id]: Math.max(1, pct) });
    const sec = cxSection(sh.sec);
    // Each sheet's rules go into review when that sheet is passed (a
    // section of 2–3 sheets takes 2–3 days); the section's drill is done
    // once every sheet is.
    cxIntroduceRules(sh.sec, 1, sh.rid || []);
    if (sec.sheets.every(s => cxSheetPassed(s))) { cxSecSet(sh.sec, { st: 2 }); cxIntroduceRules(sh.sec, 1); }
  } else cxSecSet(sh.sec, { st: 1 });
  if (typeof logEvent === "function") logEvent("cx_sheet", { id, pct, ok: passed, where: where || "" });
  saveState();
  return passed;
}
// A test-out is over: right of n. Pass → the section is done (its rules
// in light review); a miss → its sheet is next.
function cxTestoutResult(secId, right, n) {
  migrateCourse();
  const sec = cxSection(secId);
  const miss = n - right, pass = n > 0 && miss <= ((sec && sec.testout && sec.testout.miss !== undefined) ? sec.testout.miss : CX_TESTOUT.miss);
  const pct = n ? Math.round(right / n * 100) : 0;
  if (!S.course.since) S.course.since = studyToday();
  const cur = S.course.sec[secId] || (S.course.sec[secId] = { st: 0 });
  cur.to = Math.max(cur.to || 0, pct);
  if (pass) { cxSecSet(secId, { st: 3 }); cur.at = studyToday(); S.course.last = studyToday(); cxIntroduceRules(secId, 3); cxPlanTrim(secId); }
  else cxSecSet(secId, { st: 1 });
  if (typeof logEvent === "function") logEvent("cx_testout", { sec: secId, right, n, ok: pass });
  saveState();
  return pass;
}
// A checkpoint is over: pass (≥ its share right first time) → done; below,
// the rules missed are already back in review (fixed first, in the warm-up
// of the next days) and the checkpoint comes again tomorrow. It never holds
// the course up for good: after CX_CP_TRIES tries the stage moves on anyway
// (the weak rules keep coming back in review) — the date matters more.
const CX_CP_TRIES = 3;
function cxCheckpointResult(secId, right, n) {
  migrateCourse();
  const sec = cxSection(secId), cp = (sec && sec.checkpoint) || { pass: 0.8 };
  const pct = n ? Math.round(right / n * 100) : 0, pass = n > 0 && right / n >= cp.pass - 1e-9;
  const cur = S.course.sec[secId] || (S.course.sec[secId] = { st: 0 });
  cur.cp = Math.max(cur.cp || 0, pct); cur.tries = (cur.tries || 0) + 1;
  S.course.last = studyToday();
  if (pass || cur.tries >= CX_CP_TRIES) { cxSecSet(secId, { st: 3 }); cur.at = studyToday(); if (!pass) cur.on = 1; }
  if (typeof logEvent === "function") logEvent("cx_checkpoint", { sec: secId, right, n, ok: pass });
  saveState();
  return pass;
}
// The day's drill of a section is over: the section is done.
function cxDrillDone(secId, right, n) {
  migrateCourse();
  const st = cxSecState(secId);
  // (the lesson ends: its break is counted from today)
  if (st && st.st >= 2 && st.st < 3) { cxSecSet(secId, { st: 3 }); st.at = studyToday(); S.course.last = studyToday(); }
  if (typeof logEvent === "function") logEvent("cx_drill", { sec: secId, right, n });
  saveState();
}
// One answered drill item. ok: true / false. opts.kind: "recognition" for
// a choice (a miss flags its rule for a typed check, as with words),
// else "recall". A right answer is a review
// of each rule it tests (it only moves a rule that's due — srs.js); a
// wrong one goes to the rule it broke. Returns { from, to, rule }.
function cxRecordAnswer(e, ok, res, opts = {}) {
  migrateCourse();
  const set = cxSet(e.set), item = e.item;
  if (set && !set.gen) {
    const ds = S.course.ds[set.id] || (S.course.ds[set.id] = [0, 0, 0]);
    ds[1]++; if (ok) ds[0]++;
  }
  const rules = (item.r || []).filter(r => cxRule(r));
  const out = { rule: null, from: 0, to: 0, events: [] };
  if (ok) {
    rules.forEach(r => {
      const ws = cxRuleWS(r);
      if (!ws || !ws.st) return;
      const from = ws.st;
      // (practice, or your own writing — not checked here: no step up)
      const free = opts.practice || opts.self;
      const rr = free ? null : applyCorrect(ws, { quiet: true, kind: opts.kind || "recall" });
      if (free) { ws.lastAnsweredAt = Date.now(); ws.correct++; }
      if (r === e.rule || !out.rule) { out.rule = r; out.from = from; out.to = ws.st; out.events = rr ? rr.events : []; }
    });
  } else {
    const r = res && res.rule && cxRule(res.rule) ? res.rule : rules[0];
    const ws = r && cxRuleWS(r);
    out.rule = r || null;
    if (ws && ws.st) { out.from = ws.st; const rr = applyWrong(ws, { kind: opts.kind || "recall" }); out.to = ws.st; out.events = rr.events; }
    // What I wrote, for the learning log: [day, where, "grammar", given, right].
    if (ws && opts.typed && String(opts.given || "").trim() && typeof _clip === "function") {
      const mh = ws.mh || (ws.mh = []);
      mh.push([studyToday(), "course:" + (opts.where || "drill"), "grammar", _clip(opts.given), _clip(res && res.right || (item.a || [])[0] || "")]);
      if (mh.length > LEARN_HIST) mh.splice(0, mh.length - LEARN_HIST);
    }
  }
  if (item.inf && typeof learnNoteVerb === "function" && typeof vxVerb === "function") {
    const x = vxVerb(item.inf);
    if (x) learnNoteVerb(x.F, item.t || "pr", item.p || "er", !!ok, opts.given || "", (item.a || [])[0] || "");
  }
  // A verb lesson's own sentence: each verb form it checks (vf) goes to the
  // verb log too — right when the form is in what I wrote, whatever else
  // the sentence got wrong; a miss logs the word I wrote in its place.
  if (item.vf && !item.inf && typeof learnNoteVerb === "function" && typeof vxVerb === "function") item.vf.forEach(([inf, t, p]) => {
    const x = vxVerb(inf), f = x && typeof vxForm === "function" ? vxForm(x, t, p) : null;
    if (!f) return;
    // (umlauts count here: fahrt for fährt is the verb's mistake)
    const tok = s => cxStrict(s).replace(/ß/g, "ss").split(" ").filter(Boolean);
    const W = String(opts.given || "").replace(/[.,!?;:„“"«»()…–—]/g, " ").split(/\s+/).filter(Boolean), T = W.map(w => tok(w)[0] || "");
    const has = a => { let i = 0; return tok(a).every(w => { while (i < T.length && T[i] !== w) i++; return i++ < T.length; }); };
    const right = W.length ? (f.acc || [f.ans]).some(has) : !!ok;
    const head = tok(f.ans)[0] || "";
    let k = 0;
    T.forEach((w, i) => { if (cxLev(w, head) < cxLev(T[k], head)) k = i; });
    learnNoteVerb(x.F, t, p, right, W.length && cxLev(T[k], head) <= 2 ? W[k] : opts.given || "", f.ans);
  });
  if (!ok && typeof _learnDay === "function") _learnDay("mk", "grammar");
  if (typeof logEvent === "function") logEvent("answer", { m: "course:" + (opts.where || "drill"), ok: !!ok, typed: !!opts.typed, set: e.set, rule: out.rule || "", ...(opts.ms > 0 ? { ms: opts.ms } : {}) });
  saveState();
  return out;
}
// A quiz answer on a course sheet: its point, for the weak-points list.
function cxQuizAnswer(Q, ok, first) {
  if (!first || !Q || !Q.sid) return;
  migrateCourse();
  const k = Q.sid + ":" + Q.at, m = S.course.qm[k] || (S.course.qm[k] = [0, 0]);
  m[ok ? 1 : 0]++;
}
// May this answer count in the day's plan? Each part counts its own
// questions once a day (as the verb sheets do).
function cxPlanTake(key, n, ok) {
  migrateCourse();
  cxRollDay();
  const k = S.course.dq[key] || 0;
  if (k >= n) return false;
  if (ok) S.course.dq[key] = k + 1;
  return true;
}

// ── COVERAGE (the book map) ───────────────────
// Every book exercise: mirrored · generated · skipped (each counts as
// covered) · planned (a section still coming) · none yet.
function cxCovOf(exId) {
  const c = CX.cov[exId];
  if (!c) return { st: "none" };
  if (typeof c === "string") return { st: "mirrored", set: c };
  return c;
}
function cxCovCounts(exercises) {
  const n = { mirrored: 0, generated: 0, skipped: 0, planned: 0, none: 0 };
  exercises.forEach(e => { const c = cxCovOf(e.id); n[c.st] = (n[c.st] || 0) + 1; });
  n.done = n.mirrored + n.generated + n.skipped;
  n.total = exercises.length;
  return n;
}
// The skeleton's sections that draw on a chapter.
function cxSectionsOfChapter(ch) { return CX.sections.filter(s => (s.book || []).some(b => b[0] === ch)); }

// ── THE WRITING JOURNAL ───────────────────────
// Free writing on a situation, at least N words; saved as it is (never
// graded here — "always done"), for a tutor to correct from the learning
// log. My level follows the course: the level of the next section.
const CX_JOURNAL_MIN = { A1: 30, A2: 60, B1: 90 };
const CX_WRITE_EVERY = 4;     // days: a writing prompt at least this often
const CX_JOURNAL_LEN = 2000;  // characters kept of one text
// Every text is kept, never dropped: S.writing = { year: [entry] }, one
// cloud doc a year (sync.js). (The first build kept them in S.learn.wr:
// moved here, also when an older copy of the app syncs some back.)
function cxWritingStore() {
  if (!S.writing || typeof S.writing !== "object" || Array.isArray(S.writing)) S.writing = {};
  const old = S.learn && Array.isArray(S.learn.wr) ? S.learn.wr : null;
  if (old) {
    old.forEach(e => {
      if (!e || !e.id || !e.d) return;
      const y = String(e.d).slice(0, 4), list = S.writing[y] || (S.writing[y] = []);
      const had = list.find(x => x.id === e.id);
      if (!had) list.push(e); else if (e.c && !had.c) had.c = e.c;
    });
    delete S.learn.wr;
    Object.values(S.writing).forEach(l => l.sort((a, b) => String(a.d).localeCompare(String(b.d))));
  }
  return S.writing;
}
// All my texts, oldest first.
function cxJournalList() {
  const W = cxWritingStore();
  return Object.keys(W).sort().flatMap(y => Array.isArray(W[y]) ? W[y] : []);
}
function cxLevel() {
  const next = cxNextSections(1)[0] || [...CX.sections].reverse().find(s => s.built && cxSecDone(s.id));
  const lv = next && next.level;
  return lv === "B1" || lv === "B2" ? "B1" : lv === "A2" ? "A2" : "A1";
}
function cxJournalMin(p) { return p.min || CX_JOURNAL_MIN[p.lv] || 30; }
function cxWordCount(t) { return (String(t || "").match(/[\p{L}\p{N}]+(?:[-'’.][\p{L}\p{N}]+)*/gu) || []).length; }
// The prompts open to me: my level and below, a section's once it's done.
// skip: offer the next one instead ("another topic").
function cxJournalPick(skip = 0) {
  if (!CX.journal.length) return null;
  const order = ["A1", "A2", "B1"], top = order.indexOf(cxLevel());
  const open = CX.journal.filter(p => order.indexOf(p.lv) <= top && (!p.sec || cxSecDone(p.sec)));
  if (!open.length) return null;
  const last = {};
  cxJournalList().forEach(e => { if (!last[e.p] || e.d > last[e.p]) last[e.p] = e.d; });
  // Never written first — my own level, then a done section's prompt —
  // then the one written longest ago.
  const rank = p => [last[p.id] ? 1 : 0, p.lv === order[top] ? 0 : 1, p.sec ? 0 : 1, last[p.id] || ""];
  const sorted = open.map((p, i) => ({ p, i, k: rank(p) })).sort((a, b) => {
    for (let j = 0; j < 4; j++) if (a.k[j] !== b.k[j]) return a.k[j] < b.k[j] ? -1 : 1;
    return a.i - b.i;
  });
  return sorted[skip % sorted.length].p;
}
// q: the task, for a text that isn't one of the journal's prompts (a
// drill's "write your own").
function cxJournalSave(promptId, text, q = "") {
  const t = String(text || "").trim().slice(0, CX_JOURNAL_LEN), w = cxWordCount(t);
  if (!w) return null;
  const W = cxWritingStore(), d = studyToday(), y = d.slice(0, 4);
  const e = { id: Date.now().toString(36) + Math.random().toString(36).slice(2, 6), d, p: promptId, t, w, ...(q ? { q: String(q).replace(/\*\*/g, "").slice(0, 200) } : {}) };
  (W[y] || (W[y] = [])).push(e);
  if (typeof logEvent === "function") logEvent("cx_write", { w, p: promptId });
  saveState();
  return e;
}
// Corrected with the tutor: it moves to the log's "corrected" list (kept).
function cxJournalMark(id, on = true) {
  const e = cxJournalList().find(x => x.id === id);
  if (!e) return;
  if (on) e.c = studyToday(); else delete e.c;
  saveState();
}
// A theme's own task at a level ("th.<theme>.<level>") when no prompt of
// the theme is written for that level.
function cxJournalPrompt(id) {
  const p = CX.journal.find(x => x.id === id);
  if (p) return p;
  const m = /^th\.([a-z]+)\.(A1|A2|B1)$/.exec(String(id || "")), t = m && cxJournalTheme(m[1]);
  return t && t[m[2]] ? { id, lv: m[2], th: t.id, de: t.de, t: t[m[2]] } : null;
}
function cxJournalTheme(id) { return CX.themes.find(t => t.id === id) || null; }
// What I can write at a level, on a theme ("" = any): its prompts open to
// me, never written first, then a done section's, then the oldest
// written; a theme without one at that level gives its own task.
function cxJournalPool(th, lv) {
  const last = {};
  cxJournalList().forEach(e => { if (!last[e.p] || e.d > last[e.p]) last[e.p] = e.d; });
  const rank = p => [last[p.id] ? 1 : 0, p.sec ? 0 : 1, last[p.id] || ""];
  const open = CX.journal.filter(p => p.lv === lv && (!th || p.th === th) && (!p.sec || cxSecDone(p.sec)));
  const ids = open.map((p, i) => ({ p, i, k: rank(p) })).sort((a, b) => {
    for (let j = 0; j < 3; j++) if (a.k[j] !== b.k[j]) return a.k[j] < b.k[j] ? -1 : 1;
    return a.i - b.i;
  }).map(o => o.p.id);
  if (!ids.length && cxJournalPrompt(`th.${th || "free"}.${lv}`)) ids.push(`th.${th || "free"}.${lv}`);
  return ids;
}
// A text's short name: its prompt's title, or its drill's section.
function cxJournalTitle(e) {
  const p = cxJournalPrompt(e.p);
  if (p) return p.de;
  const set = /^drill:/.test(e.p) && cxSet(e.p.slice(6).split("#")[0]), sec = set && cxSection(set.sec);
  return sec ? sec.title : e.p;
}

// ── LOGS ──────────────────────────────────────
// For the learning log (a tutor reads it, so in English).
function cxLearnLines() {
  if (!cxOn() || !S.course) return [];
  const out = [``, `## GRAMMAR COURSE (sections · rules in review)`];
  const done = CX.sections.filter(s => s.built && s.sheets.length && cxSecDone(s.id)).map(s => { const st = cxSecState(s.id) || {}; return `${s.title}${st.sh ? ` (quiz ${st.sh}%)` : st.to !== undefined ? ` (tested out ${st.to}%)` : ""}`; });
  out.push(`Sections done: ${done.join(" · ") || "none yet"}`);
  const rules = Object.values(CX.rules).map(r => ({ r, ws: cxRuleWS(r.id) })).filter(o => o.ws && o.ws.st);
  if (rules.length) out.push(`Rules in my reviews: ` + rules.map(o => `${o.r.title} ${tierOfStage(o.ws.st).icon}${o.ws.rp ? "🩹" : o.ws.fl || o.ws.lrn ? "⚠️" : ""} ${o.ws.correct || 0}✓/${o.ws.wrong || 0}✗`).join(" · "));
  const weak = rules.filter(o => (o.ws.wrong || 0) >= 2 && (o.ws.wrong || 0) * 2 >= (o.ws.correct || 0));
  if (weak.length) out.push(`Grammar rules I slip on — please practise them with me: ${weak.map(o => `${o.r.title} (“${o.r.text.replace(/\*\*|~~/g, "").slice(0, 80)}”)`).join(" · ")}`);
  out.push(...cxJournalLines());
  const miss = rules.filter(o => (o.ws.mh || []).length);
  if (miss.length) {
    out.push(`Course sentences I got wrong (rule: what I wrote → right):`);
    miss.forEach(o => out.push(`${o.r.title}: ` + o.ws.mh.map(h => `"${h[3] || "—"}" → ${h[4] || "?"}`).join(" | ")));
  }
  return out;
}
function cxReportLines() {
  if (!cxOn() || !S.course) return [];
  const done = CX.sections.filter(s => s.built && cxSecDone(s.id)).map(s => s.title);
  const learned = Object.keys(CX.rules).filter(cxRuleLearned).length;
  const started = Object.keys(CX.rules).filter(r => (cxRuleWS(r) || {}).st).length;
  const P = cxPlanner(), T = cxTodayCounts();
  const tiers = {};
  Object.keys(CX.rules).forEach(r => { const ws = cxRuleWS(r); if (ws && ws.st) { const t = tierOfStage(ws.st).icon; tiers[t] = (tiers[t] || 0) + 1; } });
  const sets = Object.values(S.course.ds || {}).reduce((a, d) => [a[0] + (d[0] || 0), a[1] + (d[1] || 0)], [0, 0]);
  return [`Course: ${done.length} section(s) done${done.length ? " (" + done.join(", ") + ")" : ""} · rules ${learned} learned / ${started} started / ${Object.keys(CX.rules).length}${started ? " (" + Object.entries(tiers).map(([t, n]) => t + n).join(" ") + ")" : ""}`,
    `Course drills: ${sets[0]}/${sets[1]} right · today ${T.parts} part(s), ${T.due} rule(s) due${T.fix ? ` (${T.fix} to fix)` : ""} · ${P.cl} course sheets ahead (${P.left} with the verb track's), planner ${P.status}${P.target ? ` (all passed by ${P.target}, the last at this pace ${P.eta})` : ""} · lesson clock: ${(cxClockLesson() || {}).id || "waiting for new lessons"}${cxCurrentLesson() ? " under way" : ""}, breaks ≈ ${P.G.toFixed(1)} day(s) (this one ${cxBreak()}), next sheet ${cxNextLessonDay()}${P.pace !== null ? ` · my pace over 4 weeks: ${P.pace.toFixed(2)} sheets a day` : ""}`];
}
// My writing not corrected yet, oldest first, for the tutor to correct.
function cxJournalLines() {
  const all = cxJournalList();
  if (!all.length) return [];
  const open = all.filter(e => !e.c), done = all.filter(e => e.c);
  const head = e => { const p = cxJournalPrompt(e.p); return `[${e.d}] ${p ? `${p.de} — ${p.t}` : e.q || e.p} (${e.w} words${p ? `, level ${p.lv}` : ""})`; };
  const out = [``, `## MY WRITING (${all.length} text${all.length === 1 ? "" : "s"} since ${all[0].d}; ${open.length} to correct)`];
  if (open.length) {
    out.push(`Please correct each text below: my mistakes explained, a corrected version, one tip.`);
    open.forEach(e => out.push(``, head(e), e.t));
  }
  if (done.length) out.push(``, `Already corrected (date · topic · words · corrected on): ` + done.map(e => { const p = cxJournalPrompt(e.p); return `${e.d} ${p ? p.de : cxJournalTitle(e)} ${e.w}w ✓${e.c}`; }).join(" · "));
  out.push(``, `(I tick a text once it's corrected, in 📖 Course › ✍️ Writing. Every text stays saved there.)`);
  return out;
}
// ✍️ Writing › Copy: every text in full, with its date — for a tutor.
function cxJournalCopyText() {
  const all = cxJournalList();
  const line = e => { const p = cxJournalPrompt(e.p); return `[${e.d}] ${p ? `${p.de} — ${p.t}` : e.q || e.p} (${e.w} words${p ? `, level ${p.lv}` : ""}${e.c ? `, corrected ${e.c}` : ""})\n${e.t}`; };
  const open = all.filter(e => !e.c), done = all.filter(e => e.c);
  return [`# My German writing — ${all.length} text${all.length === 1 ? "" : "s"}, ${open.length} to correct`,
    open.length ? `\n## To correct (oldest first) — for each: my mistakes explained, a corrected version, one tip\n\n` + open.map(line).join("\n\n") : "",
    done.length ? `\n## Already corrected — to see how I progress\n\n` + done.map(line).join("\n\n") : ""].filter(Boolean).join("\n");
}
// For the learning log's JSON: sections, rules (stage, right, wrong, last misses), drill sets.
function cxLearnJson() {
  if (!cxOn() || !S.course) return null;
  const rules = {};
  Object.keys(CX.rules).forEach(r => { const ws = cxRuleWS(r); if (ws && ws.st) rules[r] = [ws.st, ws.correct || 0, ws.wrong || 0, (ws.mh || []).map(h => [h[0], h[3], h[4]])]; });
  return { sec: S.course.sec, rules, sets: S.course.ds, since: S.course.since || null, writing: cxJournalList().map(e => e.c ? [e.d, e.p, e.w, e.c] : [e.d, e.p, e.w, e.t]) };
}

if (typeof module !== "undefined") module.exports = { CX, cxCheck, cxDefine, cxPack, cxCover };
