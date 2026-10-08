// ── VERB LAB ──────────────────────────────────
// The shared model behind 🧵 Verb Thread and ⏳ Timeline Drop, for both
// apps. It speaks one language to the games:
//
//   • persons, tenses (in timeline order) and the tenses of your level
//   • vlVerbs(pool) — the verbs you've met, from grammar-de.js /
//     grammar-fr.js (forms the decks back up, nothing invented)
//   • vlCell(v, t, p) — a form split into colour parts: stem · tense
//     marker · person ending · auxiliary
//   • vlMeaning(v, t, p) — the same form in your own language:
//     Spanish in the French app ("tú fuiste"), English in the German
//     app ("you went")
//   • vlItem(...) — a form plus every reading of it (nous/ils serons
//     sound alike; "geht" is er and ihr), its twins (allons/allions)
//   • vlSentence(text) — the tense of an example sentence, or null
//     when it isn't safe to say (two tenses, passive, imperative…)
//
// Each tense has one colour and one sign, used by both games, so a
// colour learned in one reads the same in the other.
// ─────────────────────────────────────────────

const VL_FR = typeof IS_FRENCH_APP !== "undefined" ? IS_FRENCH_APP : (typeof WORD_KEY !== "undefined" && WORD_KEY === "fr");

// ── TENSES: names, signs, colours, places on the timeline ──
// zone: where it sits in time — before · past · now · next · if
const VL_TENSES = VL_FR ? [
  { id: "pq", name: "Plus-que-parfait", short: "Plus-que-parfait", sign: "⏮", zone: "before", hue: 268 },
  { id: "pc", name: "Passé composé", short: "Passé composé", sign: "●", zone: "past", hue: 212 },
  { id: "im", name: "Imparfait", short: "Imparfait", sign: "〰", zone: "past", hue: 186 },
  { id: "pr", name: "Présent", short: "Présent", sign: "◉", zone: "now", hue: 142 },
  { id: "fp", name: "Futur proche", short: "Futur proche", sign: "➝", zone: "next", hue: 42 },
  { id: "fu", name: "Futur", short: "Futur", sign: "✦", zone: "next", hue: 22 },
  { id: "co", name: "Conditionnel", short: "Conditionnel", sign: "☁", zone: "if", hue: 330 },
] : [
  { id: "pq", name: "Plusquamperfekt", short: "Plusquam\u00adperfekt", sign: "⏮", zone: "before", hue: 268 },
  { id: "pt", name: "Präteritum", short: "Präteritum", sign: "✎", zone: "past", hue: 212 },
  { id: "pf", name: "Perfekt", short: "Perfekt", sign: "●", zone: "past", hue: 186 },
  { id: "pr", name: "Präsens", short: "Präsens", sign: "◉", zone: "now", hue: 142 },
  { id: "fu", name: "Futur I", short: "Futur I", sign: "✦", zone: "next", hue: 22 },
  { id: "k2", name: "Konjunktiv II", short: "Konjunktiv II", sign: "☁", zone: "if", hue: 330 },
];
const VL_T = Object.fromEntries(VL_TENSES.map(t => [t.id, t]));
const VL_ZONES = [
  { id: "before", name: "Before that", sign: "⏮" },
  { id: "past", name: "Back then", sign: "◀" },
  { id: "now", name: "Now", sign: "◉" },
  { id: "next", name: "Ahead", sign: "▶" },
  { id: "if", name: "What if…", sign: "☁" },
];
// What each tense means — the line under it after an answer.
const VL_TENSE_SENSE = VL_FR ? {
  pq: "an action already finished before another past moment",
  pc: "a finished action — it happened, full stop",
  im: "a background in the past: a state, a habit, something going on",
  pr: "now, in general, or a habit",
  fp: "about to happen — aller + infinitive",
  fu: "later on — the r of the future + the endings of avoir",
  co: "would / could — futur stem + imparfait endings",
} : {
  pq: "finished before another past moment — hatte / war + Partizip II",
  pt: "the past in writing — and in speech for sein, haben and the modals (war, hatte, konnte)",
  pf: "the past as you say it — haben / sein + Partizip II",
  pr: "now, in general — and often the future with a time word",
  fu: "later on — werden + infinitive",
  k2: "would / could — wishes, polite requests, the unreal",
};
// Twins worth knowing apart (the trap tense, for teaching).
const VL_TWIN_TENSE = VL_FR ? { fu: "co", co: "fu", im: "pr", pr: "im", pc: "pq", pq: "pc", fp: "fu" } : { pt: "pf", pf: "pt", pr: "pt", fu: "k2", k2: "fu", pq: "pf" };
function vlTenseName(t) { return (VL_T[t] || {}).name || t; }
function vlTenseStyle(t) { const h = (VL_T[t] || {}).hue; return h == null ? "" : `--th:${h}`; }

// ── PERSONS ──
const VL_PERSONS = VL_FR ? ["je", "tu", "il", "nous", "vous", "ils"] : ["ich", "du", "er", "wir", "ihr", "sie"];
const VL_PERSON_LABEL = VL_FR ? { je: "je", tu: "tu", il: "il/elle/on", nous: "nous", vous: "vous", ils: "ils/elles" }
  : { ich: "ich", du: "du", er: "er/sie/es", wir: "wir", ihr: "ihr", sie: "sie/Sie" };
function vlPersonLabel(p) { return VL_PERSON_LABEL[p] || p; }

// Your level's tenses (the frontier of your path): A1 a few, B1 all.
const VL_LEVEL_TENSES = VL_FR ? { a1: ["pr", "pc", "fp"], a2: ["pr", "pc", "fp", "im", "fu"] }
  : { a1: ["pr", "pf"], a2: ["pr", "pf", "pt", "fu", "k2"] };
function vlLevelTenses() {
  const fg = typeof pathFrontier === "function" ? pathFrontier() : null;
  const lv = fg && VL_LEVEL_TENSES[fg.id];
  return VL_TENSES.map(t => t.id).filter(t => !lv || lv.includes(t));
}

// ── ENGLISH (the German app's meanings) ───────
const EN_IRR = (() => {
  const m = {};
  ("arise arose arisen|awake awoke awoken|be was been|bear bore born|beat beat beaten|become became become|begin began begun|bend bent bent|" +
   "bet bet bet|bind bound bound|bite bit bitten|bleed bled bled|blow blew blown|break broke broken|breed bred bred|bring brought brought|" +
   "broadcast broadcast broadcast|build built built|burn burned burned|burst burst burst|buy bought bought|catch caught caught|choose chose chosen|" +
   "cling clung clung|come came come|cost cost cost|creep crept crept|cut cut cut|deal dealt dealt|dig dug dug|do did done|draw drew drawn|" +
   "dream dreamed dreamed|drink drank drunk|drive drove driven|eat ate eaten|fall fell fallen|feed fed fed|feel felt felt|fight fought fought|" +
   "find found found|flee fled fled|fly flew flown|forbid forbade forbidden|forget forgot forgotten|forgive forgave forgiven|freeze froze frozen|" +
   "get got gotten|give gave given|go went gone|grind ground ground|grow grew grown|hang hung hung|have had had|hear heard heard|hide hid hidden|" +
   "hit hit hit|hold held held|hurt hurt hurt|keep kept kept|kneel knelt knelt|know knew known|lay laid laid|lead led led|leave left left|" +
   "lend lent lent|let let let|lie lay lain|light lit lit|lose lost lost|make made made|mean meant meant|meet met met|pay paid paid|put put put|" +
   "quit quit quit|read read read|ride rode ridden|ring rang rung|rise rose risen|run ran run|say said said|see saw seen|seek sought sought|" +
   "sell sold sold|send sent sent|set set set|sew sewed sewn|shake shook shaken|shine shone shone|shoot shot shot|show showed shown|" +
   "shrink shrank shrunk|shut shut shut|sing sang sung|sink sank sunk|sit sat sat|sleep slept slept|slide slid slid|speak spoke spoken|" +
   "spend spent spent|spin spun spun|spit spat spat|split split split|spread spread spread|spring sprang sprung|stand stood stood|" +
   "steal stole stolen|stick stuck stuck|sting stung stung|stink stank stunk|strike struck struck|swear swore sworn|sweep swept swept|" +
   "swim swam swum|swing swung swung|take took taken|teach taught taught|tear tore torn|tell told told|think thought thought|throw threw thrown|" +
   "understand understood understood|misunderstand misunderstood misunderstood|wake woke woken|wear wore worn|weep wept wept|win won won|" +
   "wind wound wound|withdraw withdrew withdrawn|write wrote written|overtake overtook overtaken|undertake undertook undertaken|" +
   "mislead misled misled|upset upset upset|withstand withstood withstood|oversleep overslept overslept|overcome overcame overcome|" +
   "foresee foresaw foreseen|rebuild rebuilt rebuilt|retell retold retold|rewrite rewrote rewritten|reread reread reread|outgrow outgrew outgrown|" +
   "overhear overheard overheard|uphold upheld upheld|undergo underwent undergone|undo undid undone|redo redid redone|withhold withheld withheld|" +
   "mistake mistook mistaken|forecast forecast forecast|leap leapt leapt|lean leaned leaned|learn learned learned|smell smelled smelled|" +
   "spell spelled spelled|spill spilled spilled|prove proved proven|hang hung hung|bid bid bid|fit fit fit|upset upset upset|lie lay lain")
    .split("|").forEach(x => { const [b, p, pp] = x.split(" "); m[b] = [p, pp]; });
  return m;
})();
// "to lie (tell untruths)" is regular: lied.
const EN_REGULAR_OVERRIDE = { "lie (tell untruths)": true };
const EN_DOUBLE = new Set(["admit", "commit", "permit", "submit", "omit", "emit", "transmit", "prefer", "refer", "occur", "regret", "control",
  "equip", "patrol", "compel", "propel", "rebel", "expel", "deter", "incur", "recur", "confer", "transfer", "defer", "acquit", "unplug", "chat"]);
function enThird(v) {
  if (v === "be") return "is";
  if (v === "have") return "has";
  if (/(s|sh|ch|x|z|o)$/.test(v)) return v + "es";
  if (/[^aeiou]y$/.test(v)) return v.slice(0, -1) + "ies";
  return v + "s";
}
function enPastReg(v) {
  if (/e$/.test(v)) return v + "d";
  if (/[^aeiou]y$/.test(v)) return v.slice(0, -1) + "ied";
  if (EN_DOUBLE.has(v) || /^[^aeiou]*[aeiou][^aeiouwxy]$/.test(v)) return v + v.slice(-1) + "ed";
  return v + "ed";
}
const EN_PRON = { ich: "I", du: "you", er: "he", wir: "we", ihr: "you all", sie: "they" };
// Modals and a few verbs whose English isn't "to + verb" all the way.
//   fixed: one form for every person · base: the phrase to conjugate
const EN_SPECIAL = {
  "können": { pr: "can", pt: "could", pf: "could", k2: "could", base: "be able to" },
  "müssen": { base: "have to" },
  "wollen": { base: "want to" },
  "sollen": { k2: "should", base: "be supposed to" },
  "dürfen": { base: "be allowed to" },
  "mögen": { base: "like" },
  "möchten": { pr: "would like", base: "" },
  "werden": { base: "become" },
};
// The English phrase of a German verb's gloss: "to go (on foot)" → "go".
function enBaseOf(v) {
  const sp = EN_SPECIAL[v.inf];
  if (sp && sp.base !== undefined) return sp.base;
  const raw = String(v.en || "").trim();
  if (EN_REGULAR_OVERRIDE[raw.replace(/^to\s+/, "")]) return "lie_reg";
  const s = raw.replace(/\(.*?\)/g, " ").split(/\s*[\/,;]\s*|\s+—\s+/)[0].replace(/\s+/g, " ").trim();
  const m = s.match(/^to\s+([a-z][a-z' -]*)$/i);
  return m ? m[1].trim() : "";
}
function enForm(base, tense, person) {
  if (!base) return "";
  let words = base.split(" "), v = words[0], rest = words.slice(1).join(" ");
  if (v === "lie_reg") { v = "lie"; rest = ""; }
  const irr = v === "lie" && base === "lie_reg" ? null : EN_IRR[v];
  const past = v === "be" ? (person === "ich" || person === "er" ? "was" : "were") : irr ? irr[0] : enPastReg(v);
  const pp = irr ? irr[1] : enPastReg(v);
  let f;
  if (tense === "pr") f = v === "be" ? ({ ich: "am", er: "is" }[person] || "are") : person === "er" ? enThird(v) : v;
  else if (tense === "pt" || tense === "pf") f = past;
  else if (tense === "pq") f = "had " + pp;
  else if (tense === "fu") f = "will " + v;
  else if (tense === "k2") f = "would " + v;
  else return "";
  return rest ? f + " " + rest : f;
}
function enCell(v, tense, person) {
  const sp = EN_SPECIAL[v.inf];
  const pron = EN_PRON[person];
  if (!pron) return "";
  if (sp && sp[tense]) return pron + " " + sp[tense];
  if (sp && sp.base === "" ) return "";
  const base = enBaseOf(v);
  const f = enForm(base, tense, person);
  return f ? pron + " " + f : "";
}

// ── GERMAN CELLS WITH PARTS ───────────────────
const DE_PR_ENDS = { ich: ["e"], du: ["est", "st", "t"], er: ["et", "t"], wir: ["en", "n"], ihr: ["et", "t"], sie: ["en", "n"] };
const DE_PTW_ENDS = { ich: "te", du: "test", er: "te", wir: "ten", ihr: "tet", sie: "ten" };
const DE_PTS_ENDS = { ich: [""], du: ["est", "st"], er: [""], wir: ["en", "n"], ihr: ["et", "t"], sie: ["en", "n"] };
function deSplit(word, ends, stemKind) {
  for (const e of ends) {
    if (e && word.endsWith(e) && word.length > e.length + 1) return [{ t: word.slice(0, -e.length), k: stemKind }, { t: e, k: "p" }];
  }
  return ends.includes("") ? [{ t: word, k: stemKind === "s" ? "p" : stemKind }] : [{ t: word, k: "p" }];
}
function dePtParts(word, person, weak) {
  if (weak) {
    const e = DE_PTW_ENDS[person];
    if (word.endsWith(e)) return [{ t: word.slice(0, -e.length), k: "s" }, { t: "te", k: "t" }, ...(e.length > 2 ? [{ t: e.slice(2), k: "p" }] : [])];
  }
  return deSplit(word, DE_PTS_ENDS[person], "t");
}
function deCell(v, tense, person) {
  if (typeof verbCell !== "function") return null;
  const F = v.F, c = verbCell(F, tense, person);
  if (!c) return null;
  const parts = [];
  const add = (t, k) => { if (t) parts.push({ t, k }); };
  const words = c.ans.split(" ");
  if (tense === "pr") {
    parts.push(...(["sein", "haben", "werden", "wissen"].includes(F.base) && !F.sep && !F.insep ? [{ t: c.ans, k: "p" }] : deSplit(c.ans, DE_PR_ENDS[person], "s")));
  } else if (tense === "pt") {
    parts.push(...dePtParts(c.ans, person, /te$/.test(F.pt.ich || "")));
  } else if (tense === "k2" && F.k2special) {
    parts.push(...deSplit(c.ans, DE_PTS_ENDS[person].map(e => e === "" ? "e" : e), "t"));
  } else {
    // aux (+ sich) + Partizip II / infinitive
    const aux = words[0];
    if (tense === "pq") parts.push(...dePtParts(aux, person, /^hat/.test(aux)));
    else if (tense === "k2") parts.push(...deSplit(aux, DE_PTS_ENDS[person].map(e => e === "" ? "e" : e), "t"));
    else add(aux, "p");
    words.slice(1).forEach((w, i, a) => { add(" ", " "); add(w, i < a.length - 1 && F.refl ? "x" : "t"); });
  }
  // Tail: reflexive pronoun and separable prefix ("freust dich", "rufst … an").
  const tail = String(c.tail || "").replace(/!$/, "").trim();
  if (tail) tail.split(" ").forEach(w => { add(" ", " "); add(w, "x"); });
  const form = parts.map(p => p.t).join("");
  const pron = PERSON_LABEL[person].split("/")[0];
  return { form, full: pron + " " + form.replace(/ … /g, " "), parts, aux: "" };
}

// ── THE ADAPTER ───────────────────────────────
// A verb record: { inf, word, words, tenses, …engine data }.
function vlBank() {
  if (VL_FR) return typeof frVerbBank === "function" ? frVerbBank() : { verbs: [] };
  return typeof verbBank === "function" ? verbBank() : { verbs: [] };
}
function vlCell(v, tense, person, opts = {}) {
  if (!v || !v.tenses.includes(tense)) return null;
  return VL_FR ? frCell(v.F, tense, person, opts) : deCell(v, tense, person);
}
function vlMeaning(v, tense, person) {
  if (VL_FR) return v.E && v.esTenses.includes(tense) ? esCell(v.E, tense, person) : "";
  return enCell(v, tense, person);
}
// Persons a verb has at all (pleuvoir: il only).
function vlPersonsOf(v) { return VL_FR && v.F.only ? [v.F.only] : VL_PERSONS; }
// The verb's word (for its meaning, stage and the review flag).
function vlVerbWord(v) { return v.word || null; }
function vlInfLabel(v) { return v.inf; }
// The gloss under the infinitive: "ir", "to go".
function vlGloss(v) {
  if (VL_FR) return v.es || "";
  return String(v.en || "").replace(/\(.*?\)/g, "").split(/\s*\/\s*/)[0].trim();
}

// Sounds-alike key for 🎧 rounds: French drops its silent endings
// (parle · parles · parlent, serons · seront); German reads as written.
function vlEarKey(form, person) {
  const f = String(form).toLowerCase().replace(/ … /g, " ");
  if (!VL_FR) return f;
  return f.split(" ").map((w, i, a) => {
    if (i === a.length - 1 && person === "ils" && /[^aeiouy]ent$/.test(w) && w.length > 4) w = w.slice(0, -3);
    return w.replace(/[sxtd]+$/, "").replace(/ée$/, "é").replace(/([^aeiouyéèêë])e$/, "$1");
  }).join(" ");
}

// ── VERBS YOU'VE MET ──────────────────────────
// French verb records list their conjugation cards; German ones count them.
function vlCards(v) { return Array.isArray(v.cards) ? v.cards : []; }
function vlIsMet(w) {
  if (!w) return false;
  const ws = typeof S !== "undefined" && S.words ? S.words[w.deckId + "_" + w.idx] : null;
  return !!(ws && ws.st);
}
// Met verbs with a meaning in at least two of `tenses`. A verb is met
// when its own card is, when one of its conjugation cards is (French),
// or when it is in the round's pool.
function vlVerbs(pool, tenses) {
  const inPool = new Set((pool || []).map(w => w.deckId + "_" + w.idx));
  const has = w => !!w && (inPool.has(w.deckId + "_" + w.idx) || vlIsMet(w));
  return vlBank().verbs.filter(v => {
    if (!/^[\p{L}' ]+$/u.test(v.inf)) return false;
    const met = has(v.word) || (v.words || []).some(has) || vlCards(v).some(c => has(c.w));
    if (!met) return false;
    const ts = tenses.filter(t => v.tenses.includes(t) && vlMeaning(v, t, vlPersonsOf(v)[0]));
    return ts.length >= Math.min(2, tenses.length) && vlPersonsOf(v).length > 1;
  });
}
function vlInPool(v, pool) {
  const inPool = new Set((pool || []).map(w => w.deckId + "_" + w.idx));
  return [v.word, ...(v.words || []), ...vlCards(v).map(c => c.w)].some(w => w && inPool.has(w.deckId + "_" + w.idx));
}
// The deck card that asks exactly this form (French conjugation decks)
// — a miss on it flags that card for review.
function vlCardFor(v, tense, person) {
  const c = vlCards(v).find(c => c.tense === tense && c.person === person && vlIsMet(c.w));
  return c ? c.w : null;
}

// ── ITEMS ─────────────────────────────────────
function vlLev(a, b) {
  if (a === b) return 0;
  const m = a.length, n = b.length;
  if (Math.abs(m - n) > 2) return 9;
  let prev = Array.from({ length: n + 1 }, (_, j) => j);
  for (let i = 1; i <= m; i++) {
    const cur = [i];
    for (let j = 1; j <= n; j++) cur[j] = Math.min(prev[j] + 1, cur[j - 1] + 1, prev[j - 1] + (a[i - 1] === b[j - 1] ? 0 : 1));
    prev = cur;
  }
  return prev[n];
}
// One form to decode → everything a round needs about it.
//   valid  — every { p, t } this exact form (or sound, for 🎧) can be
//   twins  — other forms of the verb one or two letters away (allons ↔ allions)
function vlItem(v, tense, person, tenses, opts = {}) {
  const fem = !!opts.fem;
  const cell = vlCell(v, tense, person, { fem });
  const base = fem ? vlCell(v, tense, person) : cell;
  if (!cell) return null;
  // "est allée" is visibly a she: the Spanish says ella / ellas too.
  const she = VL_FR && fem && cell.form !== base.form;
  const mean = (t, p) => { const m = vlMeaning(v, t, p); return she && m ? m.replace(/^él /, "ella ").replace(/^ellos /, "ellas ") : m; };
  const meaning = mean(tense, person);
  if (!meaning) return null;
  const ear = !!opts.ear;
  const key = ear ? vlEarKey(base.form, person) : base.form.toLowerCase();
  const valid = [], twins = [], all = [];
  const persons = vlPersonsOf(v);
  tenses.forEach(t => persons.forEach(p => {
    const c = vlCell(v, t, p);
    if (!c) return;
    const m = mean(t, p);
    all.push({ p, t, form: c.form, meaning: m });
    const k = ear ? vlEarKey(c.form, p) : c.form.toLowerCase();
    if (k === key) valid.push({ p, t, meaning: m });
    else if (t !== tense && p === person && c.form.length > 3 && vlLev(c.form, base.form) <= 2) twins.push({ p, t, form: c.form });
  }));
  return { v, t: tense, p: person, cell, form: cell.form, full: cell.full, parts: cell.parts, meaning, valid, twins, all, ear, fem };
}
// Is this pick right? Pronoun rows: any reading's person. Tense row:
// a reading with that tense (and the person picked, when it fits).
function vlPersonOk(item, p) { return item.valid.some(x => x.p === p); }
function vlTenseOk(item, t, p) {
  const withP = item.valid.filter(x => x.p === p);
  return (withP.length ? withP : item.valid).some(x => x.t === t);
}
function vlMeaningOk(item, text) { return item.valid.some(x => x.meaning === text); }
// Meaning options: the right one plus near misses — same person in
// another tense, same tense for another person, the twin's meaning.
function vlMeaningOptions(item, n) {
  const right = item.meaning;
  const bad = new Set(item.valid.map(x => x.meaning));
  const pool = item.all.filter(x => x.meaning && !bad.has(x.meaning));
  const score = x => (x.p === item.p ? 3 : 0) + (x.t === item.t ? 2 : 0) + (item.twins.some(tw => tw.t === x.t && tw.p === x.p) ? 4 : 0) + Math.random() * 2.5;
  const seen = new Set([right]);
  const picks = pool.sort((a, b) => score(b) - score(a)).filter(x => !seen.has(x.meaning) && seen.add(x.meaning)).slice(0, n - 1).map(x => x.meaning);
  return shuffle([right, ...picks]);
}
// Tense options in timeline order: the right one, the twin tense, and
// neighbours, up to n.
function vlTenseOptions(item, tenses, n) {
  if (tenses.length <= n) return tenses.slice();
  const keep = new Set([item.t]);
  const tw = VL_TWIN_TENSE[item.t];
  if (tw && tenses.includes(tw)) keep.add(tw);
  item.valid.forEach(x => keep.size < n && keep.add(x.t));
  shuffle(tenses.filter(t => !keep.has(t))).forEach(t => { if (keep.size < n) keep.add(t); });
  return tenses.filter(t => keep.has(t));
}

// ── COLOUR PARTS ──────────────────────────────
// parts → HTML: person parts in the person colour, tense parts in the
// tense's own colour, stems plain. `labels` adds a caption under each
// coloured part ("nous", "futur").
function vlPartsHtml(parts, tense, person, labels = false) {
  const tn = VL_T[tense] ? VL_T[tense].short : "";
  return parts.map(p => {
    if (p.k === " ") return `<span class="vl-sp"> </span>`;
    const cls = p.k === "p" ? "vl-p" : p.k === "t" ? "vl-t" : p.k === "x" ? "vl-x" : "vl-s";
    const cap = !labels ? "" : p.k === "p" ? vlPersonLabel(person).split("/")[0] : p.k === "t" ? tn : "";
    return `<span class="vl-part ${cls}" style="${p.k === "t" ? vlTenseStyle(tense) : ""}">${escapeHtml(p.t)}${cap ? `<small>${escapeHtml(cap)}</small>` : ""}</span>`;
  }).join("");
}
// A one-line "why" for the form.
function vlWhyHtml(item) {
  const t = item.t, tn = vlTenseName(t);
  const pers = item.parts.filter(p => p.k === "p").map(p => p.t).join(" ");
  const tens = item.parts.filter(p => p.k === "t").map(p => p.t).join(" ");
  const sense = VL_TENSE_SENSE[t] ? ` — ${VL_TENSE_SENSE[t]}` : "";
  const tline = tens ? `<b style="${vlTenseStyle(t)}" class="vl-tc">${escapeHtml(tens)}</b> says <b>${escapeHtml(tn)}</b>${sense}` : `<b>${escapeHtml(tn)}</b>${sense}`;
  const pline = pers ? `<b class="vl-pc">${escapeHtml(pers)}</b> says <b>${escapeHtml(vlPersonLabel(item.p))}</b>` : "";
  return [pline, tline].filter(Boolean).join(" · ");
}

// ── TIMELINE: THE TENSE OF A SENTENCE ─────────
// A small index of every form the banks can produce:
//   fin — a conjugated simple form (+ tense) · pp — a participle (+ aux)
//   inf — an infinitive · aux — a form of avoir/être/aller/haben/sein/werden
// Words that look like verb forms but almost never are one.
const VL_NOT_VERB = VL_FR ? /^(été|fin|or|son|sens|livre|livres|porte|portes|pas|bois|ferme|marche|court|sort|lit|nuit|vers|fait_)$/ : /^(bitte|danke|leider|essen_)$/;
let _vlIndex = null;
function vlIndex() {
  if (_vlIndex) return _vlIndex;
  const idx = new Map();
  const put = (form, e) => {
    form = String(form || "").toLowerCase();
    if (!form || /\s/.test(form) || VL_NOT_VERB.test(form)) return;
    if (!idx.has(form)) idx.set(form, []);
    idx.get(form).push(e);
  };
  const verbs = vlBank().verbs;
  if (VL_FR) {
    verbs.forEach(v => {
      const F = v.F;
      ["pr", "im", "fu", "co"].forEach(t => { if (v.tenses.includes(t)) (F[t] || []).forEach((f, i) => { if (!F.only || i === 2) put(f, { k: "fin", t, v }); }); });
      if (F.pp) new Set([F.pp, F.pp + "e", /[sx]$/.test(F.pp) ? F.pp : F.pp + "s", F.pp + "es"].map(x => x.replace(/û(?=.)/, "u"))).forEach(x => put(x, { k: "pp", aux: F.aux, refl: F.refl, v }));
      put(F.bare, { k: "inf", v });
    });
    ["ai", "as", "a", "avons", "avez", "ont"].forEach(f => put(f, { k: "aux", aux: "avoir", t: "pr" }));
    ["avais", "avait", "avions", "aviez", "avaient"].forEach(f => put(f, { k: "aux", aux: "avoir", t: "im" }));
    ["suis", "es", "est", "sommes", "êtes", "sont"].forEach(f => put(f, { k: "aux", aux: "être", t: "pr" }));
    ["étais", "était", "étions", "étiez", "étaient"].forEach(f => put(f, { k: "aux", aux: "être", t: "im" }));
    ["vais", "vas", "va", "allons", "allez", "vont"].forEach(f => put(f, { k: "aux", aux: "aller", t: "pr" }));
    ["allais", "allait", "allions", "alliez", "allaient"].forEach(f => put(f, { k: "aux", aux: "aller", t: "im" }));
    ["viens", "vient", "venons", "venez", "viennent"].forEach(f => put(f, { k: "aux", aux: "venir", t: "pr" }));
  } else {
    verbs.forEach(v => {
      const F = v.F;
      ["pr", "pt"].forEach(t => { if (v.tenses.includes(t)) PERSONS.forEach(p => { const c = verbCell(F, t, p); if (c) put(c.ans, { k: "fin", t, v }); }); });
      // wollte / sollte read as Präteritum; möchte is möchten; würde is the aux.
      // …but "sollte" is as often "should" (Konjunktiv II) as "was to": both, so it's never guessed.
      if (F.k2special && v.tenses.includes("k2") && F.base !== "mögen" && F.base !== "werden") PERSONS.forEach(p => { if (F.k2[p] !== (F.pt || {})[p] || F.base === "sollen") put(F.k2[p], { k: "fin", t: "k2", v }); });
      if (F.p2) put(F.p2, { k: "pp", aux: F.aux, v });
      put(F.inf.replace(/^sich\s+/, ""), { k: "inf", v });
    });
    Object.values(AUX_PR.haben).forEach(f => put(f, { k: "aux", aux: "haben", t: "pr" }));
    Object.values(AUX_PR.sein).forEach(f => put(f, { k: "aux", aux: "sein", t: "pr" }));
    Object.values(AUX_PT.haben).forEach(f => put(f, { k: "aux", aux: "haben", t: "pt" }));
    Object.values(AUX_PT.sein).forEach(f => put(f, { k: "aux", aux: "sein", t: "pt" }));
    Object.values(WERDEN_PR).forEach(f => put(f, { k: "aux", aux: "werden", t: "pr" }));
    Object.values(WUERDE).forEach(f => put(f, { k: "aux", aux: "würde", t: "k2" }));
    ["wurde", "wurdest", "wurden", "wurdet"].forEach(f => put(f, { k: "aux", aux: "wurde", t: "pt" }));
  }
  _vlIndex = idx;
  return idx;
}
const VL_ANCHORS = VL_FR
  ? /^(hier|avant-hier|demain|après-demain|aujourd|maintenant|bientôt|déjà|autrefois|dernier|dernière|derniers|dernières|prochain|prochaine|depuis|pendant|quand|lorsque|si|avant|après|soudain|enfin|ensuite|souvent|toujours|jamais|matin|soir|année|semaine|mois|jadis|enfance|tard|tôt|encore)$/i
  : /^(gestern|vorgestern|heute|morgen|übermorgen|jetzt|gerade|bald|schon|früher|damals|letzte|letzten|letzter|letztes|nächste|nächsten|nächster|nächstes|seit|später|immer|oft|nie|wenn|als|falls|nachdem|bevor|vorher|neulich|einmal|irgendwann|sonst)$/i;
// Present-tense sentences about the future or the past ("Je pars
// demain", "Morgen fahre ich") are real grammar but a muddle on a
// timeline: left out.
const VL_SHIFT = VL_FR ? /\b(demain|après-demain|bientôt|prochain|prochaine|hier|dernier|dernière)\b|\bce soir\b/i
  : /\b(morgen|übermorgen|bald|nächste|nächsten|nächster|nächstes|später|gestern|vorgestern|letzte|letzten|letzter|letztes)\b|\bheute abend\b/i;
const VL_FR_SKIP = /^(ne|n|pas|plus|jamais|rien|déjà|bien|toujours|encore|beaucoup|trop|souvent|tout|tous|y|en|aussi|enfin|mal|peu|presque|longtemps|guère|vite|tant|tellement|assez|même|il|elle|on|ils|elles|je|j|tu|nous|vous|t|le|la|les|l|lui|leur|me|m|te|se|s|[\p{L}]+ment)$/iu;
const _vlSentCache = new Map();
// → { t, tokens, verb:[i…], anchors:[i…] } or null.
function vlSentence(text) {
  text = String(text || "").trim();
  if (_vlSentCache.has(text)) return _vlSentCache.get(text);
  let r = null;
  try { r = _vlSentence(text); } catch (e) { r = null; }
  _vlSentCache.set(text, r);
  return r;
}
function _vlSentence(text) {
  if (!text || text.length > 120) return null;
  // Sentences about words ("Aus bessern wird verbessern") aren't about time.
  if (!VL_FR && /^aus\s/i.test(text) && /\bwird\b/.test(text)) return null;
  // One sentence per card: "Mes livres ? Je les leur prête." is two.
  if (/[.!?…]\s+\S/.test(text.replace(/\s*[.!?…]+\s*$/, ""))) return null;
  const tokens = text.match(/[\p{L}]+|[^\p{L}]+/gu) || [];
  const words = []; // { i: token index, w: lowercased, cap }
  tokens.forEach((tk, i) => { if (/^\p{L}/u.test(tk)) words.push({ i, w: tk.toLowerCase(), cap: /^\p{Lu}/u.test(tk) }); });
  if (words.length < 2 || words.length > 16) return null;
  const idx = vlIndex();
  const look = (wd, n) => {
    // German nouns: a capital word inside the sentence is never a verb.
    if (!VL_FR && wd.cap && n > 0) return [];
    return idx.get(wd.w) || [];
  };
  const question = /\?\s*$/.test(text);
  // Imperatives and other verb-first sentences: left out.
  if (!question && look(words[0], 0).some(e => e.k === "fin" || e.k === "aux")) return null;
  const used = new Set(), verbAt = [];
  const found = new Set();
  const between = (a, b) => words.slice(a + 1, b);
  if (VL_FR) {
    for (let i = 0; i < words.length; i++) {
      const es = look(words[i], i);
      const aux = es.find(e => e.k === "aux");
      if (!aux) continue;
      if (aux.aux === "avoir" || aux.aux === "être") {
        const reflBefore = i > 0 && /^(se|s|me|m|te|t|nous|vous)$/.test(words[i - 1].w);
        for (let j = i + 1; j < Math.min(words.length, i + 5); j++) {
          const pps = look(words[j], j).filter(e => e.k === "pp");
          if (pps.length) {
            // être + the participle of an avoir verb is a state or a
            // passive ("il est fatigué"): a present, not a compound.
            if (aux.aux === "avoir" || reflBefore || pps.some(e => e.aux === "être")) {
              found.add(aux.t === "pr" ? "pc" : "pq"); used.add(i); used.add(j); verbAt.push(i, j);
            }
            break;
          }
          if (!VL_FR_SKIP.test(words[j].w)) break;
        }
      } else if (aux.aux === "aller" || aux.aux === "venir") {
        for (let j = i + 1; j < Math.min(words.length, i + 4); j++) {
          if (aux.aux === "venir") { if (/^(de|d)$/.test(words[j].w) && words[j + 1] && look(words[j + 1], j + 1).some(e => e.k === "inf")) return null; continue; }
          if (look(words[j], j).some(e => e.k === "inf")) {
            if (aux.t === "im") return null; // allait faire: futur dans le passé
            found.add("fp"); used.add(i); used.add(j); verbAt.push(i, j); break;
          }
          if (!VL_FR_SKIP.test(words[j].w)) break;
        }
      }
    }
  } else {
    const auxes = words.map((wd, i) => ({ i, e: look(wd, i).find(e => e.k === "aux") })).filter(x => x.e);
    // "…, einen Parkplatz zu bekommen": after zu it's an infinitive, even when it looks like a Partizip II.
    const ppAt = words.map((wd, i) => ({ i, e: i > 0 && words[i - 1].w === "zu" ? [] : look(wd, i).filter(e => e.k === "pp") })).filter(x => x.e.length);
    const infAt = words.map((wd, i) => ({ i, e: look(wd, i).find(e => e.k === "inf") })).filter(x => x.e);
    for (const a of auxes) {
      if (used.has(a.i)) continue;
      const aux = a.e.aux;
      if (aux === "werden" || aux === "wurde") {
        if (ppAt.some(p => !used.has(p.i) && p.i !== a.i)) return null; // passive
        if (aux === "werden") {
          const inf = infAt.find(x => x.i > a.i && !used.has(x.i));
          if (inf) { found.add("fu"); used.add(a.i); used.add(inf.i); verbAt.push(a.i, inf.i); }
        }
        continue;
      }
      if (aux === "würde") {
        const inf = infAt.find(x => x.i > a.i && !used.has(x.i));
        if (inf) { found.add("k2"); used.add(a.i); used.add(inf.i); verbAt.push(a.i, inf.i); }
        continue;
      }
      const pp = ppAt.find(p => !used.has(p.i) && p.i !== a.i && p.e.some(e => e.aux === aux));
      if (pp) { found.add(a.e.t === "pr" ? "pf" : "pq"); used.add(a.i); used.add(pp.i); verbAt.push(a.i, pp.i); }
    }
    // hätte / wäre + Partizip II: Konjunktiv II of the past — left out.
    if (words.some((wd, i) => !used.has(i) && /^(hätte|hättest|hätten|hättet|wäre|wärst|wären|wärt)$/.test(wd.w)) && ppAt.some(p => !used.has(p.i))) return null;
  }
  // An auxiliary we couldn't tie to its participle ("elle m'a gentiment
  // aidé"): not safe to call it a present.
  for (let i = 0; i < words.length; i++) {
    if (used.has(i)) continue;
    const aux = look(words[i], i).find(e => e.k === "aux");
    if (!aux || !/^(avoir|être|haben|sein)$/.test(aux.aux)) continue;
    const later = words.slice(i + 1).some((wd, j) => !used.has(i + 1 + j) && look(wd, i + 1 + j).some(e => e.k === "pp" && (aux.aux === "avoir" || aux.aux === "haben" || e.aux === aux.aux)) && !look(wd, i + 1 + j).some(e => e.k === "fin"));
    if (later) return null;
  }
  // French imperatives open a clause with the verb ("…, partage !").
  if (VL_FR && /!/.test(text)) {
    for (let n = 0; n < words.length; n++) {
      const prev = tokens.slice(0, words[n].i).join("").trim();
      if ((!prev || /[,;:!?]$/.test(prev)) && look(words[n], n).some(e => e.k === "fin")) return null;
    }
  }
  // Simple forms left over.
  const weak = [];
  words.forEach((wd, i) => {
    if (used.has(i)) return;
    const es = look(wd, i);
    let ts = [...new Set(es.filter(e => e.k === "fin").map(e => e.t))];
    if (!ts.length) {
      const aux = es.find(e => e.k === "aux");
      if (aux && aux.aux !== "würde" && aux.aux !== "venir") ts = [aux.aux === "aller" && aux.t === "im" ? "im" : aux.t];
      if (aux && aux.aux === "aller" && aux.t === "pr") ts = ["pr"];
      if (aux && aux.aux === "venir") ts = ["pr"];
    }
    if (!ts.length) return;
    // Infinitive-shaped present forms (wir/sie gehen) and "il y a":
    // only when nothing else in the sentence is a verb.
    const infLike = es.some(e => e.k === "inf") || (VL_FR && wd.w === "est" && words[i + 1] && words[i + 1].w === "ce");
    if (ts.length > 1) { if (!infLike) { found.add("?"); } return; }
    if (infLike) { weak.push({ i, t: ts[0] }); return; }
    found.add(ts[0]); verbAt.push(i);
  });
  if (!found.size && weak.length) weak.forEach(x => { found.add(x.t); verbAt.push(x.i); });
  if (found.size !== 1 || found.has("?")) return null;
  const t = [...found][0];
  if (!VL_T[t]) return null;
  if (t === "pr" && VL_SHIFT.test(text)) return null;
  const anchors = words.filter((wd, i) => !used.has(i) && VL_ANCHORS.test(wd.w)).map(wd => wd.i);
  return { t, tokens, verb: verbAt.map(i => words[i].i), anchors };
}
// The sentence with its verb and time words marked.
function vlSentenceHtml(r, reveal) {
  const v = new Set(r.verb), a = new Set(r.anchors);
  return r.tokens.map((tk, i) => {
    const e = escapeHtml(tk);
    if (reveal && v.has(i)) return `<b class="tl-verb" style="${vlTenseStyle(r.t)}">${e}</b>`;
    if (reveal && a.has(i)) return `<span class="tl-anchor">${e}</span>`;
    return e;
  }).join("");
}

// ── HIDDEN PRACTICE RECORD ────────────────────
// S.games.vt / S.games.tl: per tense [right, asked] — steers which
// tenses come up (weak ones more). Small, synced, never shown as
// progress.
function vlTenseAcc(store, t) {
  const r = (S.games[store] || {})[t];
  return r && r[1] >= 3 ? r[0] / r[1] : 0.5;
}
function vlTenseRecord(store, t, ok) {
  const m = S.games[store] || (S.games[store] = {});
  const r = m[t] || (m[t] = [0, 0]);
  r[0] += ok ? 1 : 0; r[1]++;
  // Keep it recent: halve once it gets long.
  if (r[1] > 60) { r[0] = Math.round(r[0] / 2); r[1] = Math.round(r[1] / 2); }
}

if (typeof module !== "undefined") module.exports = { vlSentence, vlItem, vlCell, vlMeaning, vlVerbs, vlBank, enCell, vlEarKey, VL_TENSES };
