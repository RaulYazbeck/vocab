// ── THE VERB TRACK (German) ───────────────────
// How verbs are learnt once the new system is switched on (S.verb.on).
// Three layers, all on the same 0–7 stages as words (srs.js):
//
//   1. TENSES in a fixed order (VX_UNITS). A tense opens when the
//      tenses it is built from are open and your Path has got far
//      enough (its anchor: a point in A1 → A2 → B1, so the finish
//      date sets its calendar day). It starts as a 📖 lesson — bite-
//      sized sheets with a small quiz each (grammar-sheets-de.js) that
//      come into Today one or two a day — and is 🔁 practising once
//      every sheet is passed. Games only use tenses you've been taught.
//
//   2. VERB ITEMS, stored next to the words in S.words under "vx_…":
//        r:<rule>   one rule of a sheet (ge-…-t, sein or haben, the
//                   Präsens endings…), asked each review with another
//                   verb you've met, in a fixed, logical order
//        sc:<inf>   a stem change in the Präsens (du fährst, er fährt)
//        p2:<inf>   Perfekt of a verb you can't build by rule (ist gegangen)
//        pt:<inf>   Präteritum of a strong / mixed verb (ging, brachte)
//        im:<inf>   an irregular imperative (nimm!, sei!)
//        ir:<inf>   the Präsens no rule builds (bin, kann, weiß), and
//        p1:<inf>   its Präteritum (war, konnte, wusste), every person
//        k2s:<inf>  a strong verb's own Konjunktiv II (käme, ginge, gäbe)
//      Per-verb items exist only for verbs that need them and that no
//      active deck card already covers.
//
//   3. THE LEDGER — every verb of the engine's list (verbBank), level
//      by level: its meaning Known, its irregular items Known, and its
//      three core tenses (Präsens · Präteritum · Perfekt — everything
//      else is built from them) produced right at least once. Coverage
//      drills sweep through the verbs you've met in order: A1 verbs
//      first, regular ones before the exceptions.
//
// The old form cards: a card you have met keeps all its progress. An
// unmet card in a deck the rules now cover is RETIRED — never
// introduced again — and mirrors the item that covers it (a "shadow"
// record, ws.rt), so totals, levels and achievements stay whole and
// fill up as you learn the verbs the new way.
//
// Nothing here runs before the switch. The French app runs the same
// system: verb-track-fr.js (loaded first) is VXF — its tenses, rules,
// forms and grading, in Spanish — and every place below where the two
// languages differ asks it (VX_FR).
// ─────────────────────────────────────────────

const VX_FR = typeof VXF !== "undefined" && !!VXF;
// The engine's verb list: grammar-de.js, or grammar-fr.js.
function vxBank() { return VX_FR ? VXF.bank() : verbBank(); }
// Words on the track's screens: English, or the French app's Spanish.
// "{0}" … are filled in from the arguments.
function vxT(s, ...a) {
  const t = VX_FR && Object.prototype.hasOwnProperty.call(VXF.es, s) ? VXF.es[s] : s;
  return a.length ? t.replace(/\{(\d)\}/g, (m, i) => a[+i] !== undefined ? a[+i] : m) : t;
}
// The persons of the engine, and the one an "it" verb takes.
const VX_PERSONS = VX_FR ? VXF.persons : (typeof PERSONS !== "undefined" ? PERSONS : []);
const VX_IT = VX_FR ? VXF.it : "er";
// A verb's deck cards that ask one of its forms: { deckId, idx, tense, person }.
function vxRefs(x) { return VX_FR ? VXF.refs(x) : (x.v.refs || []); }
// Can the track ask this tense of the verb at all?
function vxHasTense(x, t) { return VX_FR ? VXF.hasTense(x, t) : x.v.tenses.includes(t); }

const VX_DECK = "vx";
const VX_PASS_RE = 1;            // a quiz: every question right the first time (grammar-quiz.js)
const VX_SHEETS_PER_DAY = 2;     // new sheets brought into Today per day
const VX_SESSION_SHARE = 0.25;   // verb items take at most this share of a session
const VX_LEMMA_MIN = 2;          // a verb joins the verb track once its word is past day 0
const VX_ITEM_PACE = [1, 12];    // new verb items a day (min, max) with a finish date
const VX_CELL_PACE = [2, 30];    // coverage drills a day (min, max)
const VX_DEFAULT = { items: 3, cells: 6 }; // without a finish date

function vxAvailable() {
  if (VX_FR) return typeof GR_FR !== "undefined" && GR_FR && vxBank().verbs.length >= 20;
  return typeof GR_DE !== "undefined" && GR_DE && typeof verbBank === "function" && verbBank().verbs.length >= 20;
}
function vxOn() { return vxAvailable() && !!(S.verb && S.verb.on); }

// ── STATE ─────────────────────────────────────
// S.verb (meta doc, synced):
//   on    the study day the system was switched on ("" = not yet)
//   tu    { unit: 0 locked · 1 lesson · 2 practising · 3 solid }
//   sh    { sheet: best first-try score % of a passed quiz }
//   sr    { sheet: 1 } — opened at least once
//   cov   { inf: bitmask of VX_COV tenses produced right at least once }
//   rot   { rule: index } — where each rule's verb rotation stands
//   day / ni / nc / ns — today's new items, coverage drills, sheets shown
//   su    { sheet: 1 } — today's sheets that used up one of the day's two
//   sq    { sheet: n } — today's answers of each sheet counted in the plan
//   seed  what the switch did (for the report)
function migrateVerb() {
  if (!S.verb || typeof S.verb !== "object") S.verb = {};
  const V = S.verb;
  if (typeof V.on !== "string") V.on = "";
  ["tu", "sh", "sr", "cov", "rot", "ma", "qm", "su", "sq"].forEach(k => { if (!V[k] || typeof V[k] !== "object") V[k] = {}; });
  if (typeof V.day !== "string") V.day = "";
  ["ni", "nc", "ns"].forEach(k => { if (!(V[k] >= 0)) V[k] = 0; });
  if (vxOn()) {
    vxRollDay(); vxUnitsTick(true);
    // Seeding learned to read more of your cards: run it again once.
    // It only fills what hasn't started (or lifts what you never missed).
    if ((V.seedV || 1) < VX_SEED_V) { V.seedV = VX_SEED_V; const n = vxSeed(false, true); if (typeof logEvent === "function") logEvent("vx_reseed", n); }
    vxMirror();
    vxAchCatchUp();
  }
}
// Version of vxSeed's reading of your cards (2: rule evidence by person).
const VX_SEED_V = 2;
function vxRollDay() {
  const V = S.verb, today = studyToday();
  if (V.day !== today) { V.day = today; V.ni = 0; V.nc = 0; V.ns = 0; V.su = {}; V.sq = {}; }
  if (!V.su || typeof V.su !== "object") V.su = {};
  if (!V.sq || typeof V.sq !== "object") V.sq = {};
}

// ── VERBS ─────────────────────────────────────
// The engine's verbs with what the track needs to know about each.
const VX_LEVELS = ["a1", "a2", "b1"];
let _vxVerbs = null;
function vxVerbs() {
  if (_vxVerbs) return _vxVerbs;
  const out = [];
  vxBank().verbs.forEach(v => {
    let lv = VX_LEVELS.indexOf(v.level), refOnly = false;
    // A German verb the decks only conjugate (tragen: trage, trägst…;
    // trug) has no word card: its form cards stand in for it, at the
    // level of the first one — so no old card is left outside the track.
    if (!VX_FR && !v.word && !(v.words && v.words.length)) {
      const own = (v.refs || []).filter(r => VX_CONJ_DECKS.has(r.deckId)).map(r => VX_LEVELS.indexOf(r.deckId.slice(0, 2))).filter(l => l >= 0);
      if (!own.length) return;
      lv = Math.min(...own); refOnly = true;
    }
    if (lv < 0 || (!v.word && !refOnly)) return; // the track follows the A1 → B1 decks
    out.push(Object.assign(Object.create(null), { v, inf: v.inf, F: v.F, lv, level: VX_LEVELS[lv], refOnly, k: VX_FR ? VXF.kind(v.F) : vxKind(v.F) }));
  });
  out.forEach((x, i) => { x.i = i; });
  _vxVerbs = out;
  return out;
}
let _vxByInf = null;
function vxVerb(inf) {
  if (!_vxByInf) _vxByInf = new Map(vxVerbs().map(x => [x.inf, x]));
  return _vxByInf.get(inf) || null;
}
// What kind of verb, for the logical order and the rules.
function vxKind(F) {
  const simple = !F.sep && !F.insep;
  const aux = simple && ["sein", "haben", "werden"].includes(F.base);
  const modal = simple && MODAL_BASES.includes(F.base);
  const stem = !aux && !modal && F.presSure && !F.only && verbStemChanges(F);
  const base = F.insep + F.base;
  const eln = /eln$/.test(base), ern = /ern$/.test(base) && !eln;
  const st = eln || ern ? base.slice(0, -1) : base.replace(/(en|n)$/, "");
  const glue = !aux && !modal && (needsE(st) || isSSound(st) || eln || ern);
  const ptWeak = /te$/.test(F.pt.ich || "") && !F.strong;
  const mixed = !!F.strong && /te$/.test(F.pt.ich || "");
  const ieren = /ieren$/.test(F.inf);
  return { aux, modal, stem, glue, eln, ern, ptWeak, mixed, strongPt: !/te$/.test(F.pt.ich || ""), ieren,
    irregular: aux || modal || F.base === "tun" || F.base === "wissen" };
}
// The verb's own word cards: met? how far? when first met?
// French: a verb the decks only conjugate (mettre: a2_conjugacion) has
// no word card — its conjugation cards stand in; when every one of them
// is retired, the verb counts as met once the Path reaches its level, and
// as Known once its own items are.
// (German: a verb with no word card — x.refOnly — the same with its form
// cards.) A card the track took over counts with the record it had.
function vxLemma(x) {
  let st = 0, met = "";
  const own = x.v.words && x.v.words.length, cardsOnly = (VX_FR || x.refOnly) && !own;
  const cards = VX_FR ? (x.v.cards || []).map(c => c.w) : vxRefs(x).filter(r => VX_CONJ_DECKS.has(r.deckId)).map(r => ({ deckId: r.deckId, idx: r.idx }));
  (cardsOnly ? cards : own ? x.v.words : [x.v.word]).forEach(w => {
    const ws0 = w && S.words[w.deckId + "_" + w.idx];
    const ws = ws0 && ws0.rt ? ws0.rtWas : ws0;
    if (ws && ws.st && !ws.rt) { st = Math.max(st, ws.st); if (ws.metOn && (!met || ws.metOn < met)) met = ws.metOn; }
  });
  if (cardsOnly && !st && vxOn() && cards.every(c => vxRetired(c.deckId, c.idx)) && vxPathPos() >= x.lv) {
    const its = vxCatalog().filter(it => it.x === x).map(it => (S.words[vxKey(it.id)] || {}).st || 0);
    st = Math.max(VX_LEMMA_MIN, its.length ? Math.min(...its) : 0);
  }
  return { st, met };
}
function vxVerbReady(x) { return vxLemma(x).st >= VX_LEMMA_MIN; }
// What a verb means, as its card says it — the whole meaning, so verbs
// that share one (to know: wissen / kennen) stay apart: "to know (a
// fact)". A verb card shows only this, never the verb. French: its word
// card's Spanish. The verbs the decks only conjugate get one here.
const VX_MEANING_EXTRA = { tragen: "to carry / to wear", streiten: "to fight / to dispute (no sich)", unterhalten: "to entertain / to keep (no sich)", "sich verhalten": "to behave" };
function vxMeaning(x) {
  if (VX_FR) {
    // (a verb with no word card of its own: its Spanish gloss — its
    // conjugation cards' text names the verb: "mettre — je")
    const w = x.v.word, d = w && !VX_LEGACY_DECKS.has(w.deckId) && getDeck(w.deckId), card = d && d.words[w.idx];
    return String((card && card.en) || x.v.es || "").trim();
  }
  return String(x.v.en || VX_MEANING_EXTRA[x.inf] || (typeof vlGloss === "function" ? vlGloss(x.v) : "")).trim();
}
// Which verb a deck card is about — its word card (hängen) or one of its
// form cards (gehangen) — so Today never asks it right next to a verb
// card of the same verb. null for anything else.
let _vxCardVerb = null;
function vxVerbOfWord(w) {
  if (!w || !vxAvailable()) return null;
  if (w.vx) return w.vx.x.inf;
  if (!_vxCardVerb) {
    _vxCardVerb = new Map();
    vxVerbs().forEach(x => {
      [...(x.v.words || []), x.v.word, ...(Array.isArray(x.v.cards) ? x.v.cards.map(c => c.w) : [])].forEach(c => { if (c) _vxCardVerb.set(c.deckId + "_" + c.idx, x.inf); });
      vxRefs(x).forEach(r => _vxCardVerb.set(r.deckId + "_" + r.idx, x.inf));
    });
  }
  return _vxCardVerb.get(w.deckId + "_" + w.idx) || null;
}

// ── TENSE UNITS ───────────────────────────────
// anchor [level, share]: opens once your Path is that far (the share of
// that level's words met), or as soon as it's past it.
const VX_UNITS = VX_FR ? VXF.units : [
  { id: "pr", name: "Präsens", sub: "now, habits, plans", sign: "◉", hue: 142, vl: "pr", anchor: ["a1", 0], req: [] },
  { id: "pf", name: "Perfekt", sub: "the spoken past", sign: "●", hue: 186, vl: "pf", anchor: ["a1", 0.25], req: ["pr"] },
  { id: "im", name: "Imperativ", sub: "commands, requests, tips", sign: "!", hue: 96, vl: "im", anchor: ["a1", 0.9], req: ["pr"] },
  { id: "pt1", name: "Präteritum I", sub: "war · hatte · the modals", sign: "✎", hue: 212, vl: "pt", anchor: ["a2", 0], req: ["pr"] },
  { id: "fu", name: "Futur I", sub: "werden + infinitive", sign: "✦", hue: 22, vl: "fu", anchor: ["a2", 0.3], req: ["pr"] },
  { id: "k2a", name: "Konjunktiv II", sub: "würde · wäre · hätte · könnte", sign: "☁", hue: 330, vl: "k2", anchor: ["a2", 0.6], req: ["pt1"] },
  { id: "pt2", name: "Präteritum II", sub: "every verb · the written past", sign: "✎", hue: 230, vl: "pt", anchor: ["b1", 0], req: ["pt1", "pf"] },
  { id: "pq", name: "Plusquamperfekt", sub: "the past before the past", sign: "⏮", hue: 268, vl: "pq", anchor: ["b1", 0.25], req: ["pf", "pt1"] },
  { id: "pv", name: "Passiv", sub: "what is done, not who does it", sign: "⇄", hue: 52, vl: "", anchor: ["b1", 0.45], req: ["pf", "pt1"] },
  { id: "k2p", name: "Konjunktiv II · past", sub: "would have · regrets", sign: "☁", hue: 300, vl: "", anchor: ["b1", 0.65], req: ["k2a", "pf"] },
];
const VX_UNIT = Object.fromEntries(VX_UNITS.map((u, i) => [u.id, Object.assign(u, { n: i })]));
const VX_STATE = ["locked", "lesson", "practising", "solid"];
function vxUnitState(id) { return (S.verb && S.verb.tu && S.verb.tu[id]) || 0; }
function vxUnitOpen(id) { return vxUnitState(id) >= 2; }
function vxUnitStyle(id) { const u = VX_UNIT[id]; return u ? `--th:${u.hue}` : ""; }
// Where the Path stands: 0 = A1 start … 3 = all levels met. Retired
// cards and grammar cards waiting for their lesson don't hold it back.
function vxPathPos(scan = pathScan()) {
  const gs = scan.groups.filter(g => VX_LEVELS.includes(g.id));
  for (let i = 0; i < gs.length; i++) {
    const g = gs[i], total = g.total - (g.ret || 0), met = g.met - (g.retMet || 0);
    if (met < total) return i + (total ? met / total : 0);
  }
  return gs.length;
}
function vxAnchorPos(u) { return VX_LEVELS.indexOf(u.anchor[0]) + u.anchor[1]; }
// The day a locked tense is expected to open, from the plan's pace:
// the active words still to meet before the Path reaches its anchor.
function vxUnitEta(u, scan = pathScan()) {
  const want = vxAnchorPos(u);
  if (vxPathPos(scan) >= want) return null;
  const gs = scan.groups.filter(g => VX_LEVELS.includes(g.id));
  let words = 0;
  gs.forEach((g, i) => {
    const total = g.total - (g.ret || 0), met = Math.max(0, g.met - (g.retMet || 0));
    const target = i < Math.floor(want) ? total : i === Math.floor(want) ? (want - i) * total : 0;
    words += Math.max(0, target - met);
  });
  const pace = Math.max(1, pathDeadlineOn() ? pathPace(scan) : (S.path.newPerDay || PATH.NEW_PER_DAY_DEFAULT));
  return addDays(studyToday(), Math.max(1, Math.ceil(words / pace)));
}
// Move units along: locked → lesson (anchor + prerequisites), lesson →
// practising (every sheet passed), practising → solid (every item of the
// unit 🌳 Known). States only ever go up.
function vxUnitsTick(quiet = false) {
  if (!vxOn()) return;
  const V = S.verb;
  let pos = null;
  VX_UNITS.forEach(u => {
    const st = vxUnitState(u.id);
    const reqOk = u.req.every(r => vxUnitOpen(r));
    if (st === 0 && reqOk) {
      if (pos === null) pos = vxPathPos(pathScan());
      if (pos >= vxAnchorPos(u) || vxUnitSheetsPassed(u.id)) vxSetUnit(u.id, vxUnitSheetsPassed(u.id) ? 2 : 1, quiet);
    }
    if (vxUnitState(u.id) === 1 && vxUnitSheetsPassed(u.id) && reqOk) vxSetUnit(u.id, 2, quiet);
    if (vxUnitState(u.id) === 2 && vxUnitSolid(u.id)) vxSetUnit(u.id, 3, quiet);
  });
  void V;
}
// While the switch screen works out its preview, nothing is logged.
let _vxDry = false;
function vxSetUnit(id, st, quiet) {
  const V = S.verb;
  if ((V.tu[id] || 0) >= st) return;
  V.tu[id] = st;
  if (_vxDry) return;
  if (typeof logEvent === "function") logEvent("vx_unit", { u: id, st: VX_STATE[st] });
  if (st === 2) { _vxQueueCache = null; if (typeof invalidatePathScan === "function") invalidatePathScan(); }
  if (!quiet && st >= 2 && typeof showCelebrateToast === "function")
    showCelebrateToast(VX_UNIT[id].sign, st === 2 ? vxT("{0} unlocked", VX_UNIT[id].name) : vxT("{0} solid", VX_UNIT[id].name),
      st === 2 ? vxT("It joins your reviews and the verb games") : vxT("Every rule of it 🌳 Known"));
  if (typeof checkAchievements === "function") checkAchievements({ type: "vx" });
}
function vxUnitSheetsPassed(id) {
  const ids = vxSheetIds(id);
  return ids.length > 0 && ids.every(s => vxSheetPassed(s));
}
function vxUnitSolid(id) {
  const items = vxCatalog().filter(it => it.unit === id);
  if (!items.length) {
    // A tense taught by deck cards (Präteritum I): solid when they are.
    const decks = Object.entries(VX_GATE).filter(([, u]) => u === id).map(([d]) => d);
    let n = 0, k = 0;
    decks.forEach(d => { const dk = getDeck(d); if (dk) dk.words.forEach((w, i) => { n++; if (isMastered(S.words[d + "_" + i])) k++; }); });
    return n > 0 && k === n;
  }
  return items.every(it => { const ws = S.words[vxKey(it.id)]; return ws && (ws.st || 0) >= STAGE_KNOWN; });
}

// ── SHEETS ────────────────────────────────────
function vxSheetIds(unit) { return typeof GS_SHEETS === "undefined" ? [] : GS_SHEETS.filter(s => s.unit === unit).map(s => s.id); }
function vxSheet(id) { return typeof GS_SHEET_BY_ID === "undefined" ? null : GS_SHEET_BY_ID[id] || null; }
function vxSheetPassed(id) { return (S.verb && S.verb.sh && S.verb.sh[id] > 0) || false; }
// Sheets waiting in Today: every unit in its lesson, in curriculum order.
function vxPendingSheets() {
  if (!vxOn()) return [];
  const out = [];
  VX_UNITS.forEach(u => { if (vxUnitState(u.id) === 1) vxSheetIds(u.id).forEach(s => { if (!vxSheetPassed(s)) out.push(s); }); });
  return out;
}
// The sheets your next Today session brings: today's allowance
// (VX_SHEETS_PER_DAY) not yet used — sheets passed on the grammar screen
// use it up too (vxSheetResult). The Today banner and the sheet quest
// show only these — once today's sheets are done, the rest wait for
// tomorrow and nothing announces them.
function vxSheetsToday() {
  if (!vxOn()) return [];
  return vxPendingSheets().slice(0, vxQuotas().sheetsLeft);
}
// A sheet uses up one of the day's VX_SHEETS_PER_DAY once: opened in
// Today, or passed on the grammar screen — the same sheet again that day
// (a retry, another device) doesn't. ns counts them too (and what an
// older version of the app counted without naming the sheet).
function vxSheetUse(id) {
  vxRollDay();
  const V = S.verb;
  if (!V.su[id]) { V.su[id] = 1; V.ns++; }
}
function vxSheetsUsed() { const V = S.verb; return Math.max(V.ns || 0, Object.keys(V.su || {}).length); }
// May this answer of sheet `id` (n questions) count in the day's plan?
// Each sheet counts its n questions' worth of right answers once a day,
// wherever it's done; retries until it's passed still teach, but don't
// add to the plan. A right answer that counts is taken from the room.
function vxSheetPlanTake(id, n, ok) {
  vxRollDay();
  const V = S.verb, k = V.sq[id] || 0;
  if (k >= n) return false;
  if (ok) V.sq[id] = k + 1;
  return true;
}
// A quiz finished: score = first-try share (0–1), all = every question
// right in the end. Returns true when the sheet counts as passed.
function vxSheetResult(id, score, all, where) {
  migrateVerb();
  const V = S.verb, pct = Math.round(score * 100);
  const passed = all && score >= VX_PASS_RE - 1e-9;
  // A first pass outside Today (the grammar screen) uses up one of the
  // day's sheets too; a sheet in Today counted when it opened.
  if (passed && where !== "path" && !vxSheetPassed(id)) vxSheetUse(id);
  if (passed) V.sh[id] = Math.max(V.sh[id] || 0, Math.max(1, pct));
  V.sr[id] = 1;
  if (typeof logEvent === "function") logEvent("vx_sheet", { id, pct, ok: passed, where: where || "" });
  const sh = vxSheet(id);
  if (passed && sh) vxUnitsTick(false);
  if (typeof questEvent === "function" && passed) questEvent("vx_sheet", { id });
  saveState();
  return passed;
}

// ── MASTERY (optional, outside the daily plan) ─
// A tense's mastery quiz opens once all its sheets are passed. ma[unit]:
// { best: % first try, n: questions, at: ms, ok: 1 once passed at 100% }.
function vxMasteryOpen(unit) { return vxUnitSheetsPassed(unit); }
function vxMastered(unit) { return !!(S.verb && S.verb.ma && S.verb.ma[unit] && S.verb.ma[unit].ok); }
function vxMasteryResult(unit, right, n) {
  migrateVerb();
  const V = S.verb, pct = n ? Math.round(right / n * 100) : 0, ok = n > 0 && right === n;
  const m = V.ma[unit] || (V.ma[unit] = { best: 0, n: 0, at: 0, ok: 0 });
  m.best = Math.max(m.best || 0, pct); m.n = n; m.at = Date.now(); m.tries = (m.tries || 0) + 1;
  if (ok) m.ok = 1;
  if (typeof logEvent === "function") logEvent("vx_mastery", { u: unit, pct, n, ok });
  if (ok && typeof checkAchievements === "function") try { checkAchievements({ type: "vx_mastery" }); } catch (e) {}
  saveState();
  return ok;
}

// ── WHAT A QUIZ ANSWER LEAVES BEHIND ───────────
// qm["sheet:point"] = [missed, right] on the first try — the points to
// work on, for the learning log. A form typed in a quiz is a form like
// any other: it goes into the verb's learning history, and a right one
// fills its ledger cell.
function vxQuizAnswer(Q, ok, given, first) {
  if (!vxAvailable() || !Q) return;
  migrateVerb();
  if (first && Q.sid && Q.at) {
    const k = Q.sid + ":" + Q.at, m = S.verb.qm[k] || (S.verb.qm[k] = [0, 0]);
    m[ok ? 1 : 0]++;
  }
  if (!first || !Q.inf || Q.k !== "type") return;
  const x = vxVerb(Q.inf);
  if (!x) return;
  const t = VX_FR ? (VXF.logKinds.includes(Q.t) ? Q.t : null) : { pr: "pr", pt: "pt", pf: "pf", pq: "pq", fu: "fu", im: "im" }[Q.t];
  if (t && typeof learnNoteVerb === "function") learnNoteVerb(x.F, t, Q.p, ok, given || "", Array.isArray(Q.a) ? Q.a[0] : "");
  const cell = VX_KIND_TENSE[Q.t];
  if (ok && vxOn() && VX_COV.includes(cell) && !vxCovHas(x.inf, cell)) {
    vxCovSet(x.inf, cell);
    if (typeof logEvent === "function") logEvent("vx_cell", { inf: x.inf, t: cell, from: "quiz" });
  }
}
// The sheet points missed most (first try), worst first.
function vxQuizWeakPoints(n = 8) {
  const qm = (S.verb && S.verb.qm) || {};
  return Object.entries(qm).filter(([, m]) => m[0] > 0 && m[0] >= m[1])
    .sort((a, b) => (b[1][0] - b[1][1]) - (a[1][0] - a[1][1]) || b[1][0] - a[1][0]).slice(0, n)
    .map(([k, m]) => { const [sid, at] = k.split(":"), sh = vxSheet(sid); if (!sh) return null;
      const txt = /^r\d$/.test(at) ? (sh.rules || [])[+at.slice(1) - 1] : at === "trap" ? sh.trap : at === "why" ? sh.why : "";
      return { sid, at, title: sh.title, missed: m[0], right: m[1], text: String(txt || "").replace(/\*\*|\{\{|\}\}|\(\(|\)\)|\[\[|\]\]|~~/g, "") }; })
    .filter(Boolean);
}

// ── GAMES: only the tenses you've been taught ─
// Engine tense ids the games may use. Präteritum before the full lesson
// (pt2) is limited to the verbs of Präteritum I.
const VX_PT1_VERBS = new Set(["sein", "haben", "werden", "können", "müssen", "wollen", "dürfen", "sollen", "mögen", "wissen"]);
function vxGameTenses(all) {
  if (!vxOn()) return null;
  const out = [];
  VX_UNITS.forEach(u => { if (u.vl && vxUnitOpen(u.id) && !out.includes(u.vl) && all.includes(u.vl)) out.push(u.vl); });
  return all.filter(t => out.includes(t));
}
function vxTenseOkFor(inf, t) {
  if (!vxOn() || VX_FR) return true;
  if (t !== "pt") return true;
  return vxUnitOpen("pt2") || VX_PT1_VERBS.has(String(inf).replace(/^sich\s+/, ""));
}

// ── FORMS ─────────────────────────────────────
// One form for an exercise. kind: an engine tense (pr pt pf pq fu im)
// or one of the track's own: prsep (the prefix typed too), prrefl (with
// the pronoun), k2w (würde + inf), k2o (own Konjunktiv II), pvpr / pvpt
// (Passiv), pvmod (modal + Partizip II + werden), k2p (hätte / wäre +
// Partizip II), sc (du + er), p2 (er + Perfekt).
//   → { ans: shown answer, acc: [accepted…], tail, n: words to type }
const VX_PV_MODALS = { können: { er: "kann", sie: "können" }, müssen: { er: "muss", sie: "müssen" }, sollen: { er: "soll", sie: "sollen" }, dürfen: { er: "darf", sie: "dürfen" } };
const K2_AUX = { haben: { ich: "hätte", du: "hättest", er: "hätte", wir: "hätten", ihr: "hättet", sie: "hätten" }, sein: { ich: "wäre", du: "wärst", er: "wäre", wir: "wären", ihr: "wärt", sie: "wären" } };
// "With each other" verbs: in the singular they need someone to do it
// with — du triffst dich MIT ANNA. Without it, "du triffst sie" (you
// meet her) is just as right. The question shows that context (ctx).
const VX_RECIPROCAL = new Set(["sich treffen", "sich streiten", "sich unterhalten", "sich verabreden", "sich einigen"]);
// Position verbs take haben in the north and sein in the south and in
// Austria (hat / ist gestanden): both are right (the old cards said
// "haben · sein"); the answer shown is the haben one.
const VX_BOTH_AUX = new Set(["stehen", "liegen", "sitzen", "hängen"]);
const VX_SEIN_FOR = { habe: "bin", hast: "bist", hat: "ist", haben: "sind", habt: "seid", hatte: "war", hattest: "warst", hatten: "waren", hattet: "wart",
  hätte: "wäre", hättest: "wärst", hätten: "wären", hättet: "wärt" };
function vxForm(x, kind, p, opt = {}) {
  if (VX_FR) return VXF.form(x, kind, p, opt);
  const f = vxFormBase(x, kind, p, opt);
  if (f && VX_RECIPROCAL.has(x.inf) && ["ich", "du", "er", "Sie"].includes(p) && kind !== "p2only" && kind !== "sc" && kind !== "p2") f.ctx = "mit Anna";
  if (f && VX_BOTH_AUX.has(x.inf) && ["pf", "p2", "pq", "k2p"].includes(kind))
    f.acc = [...new Set([...f.acc, ...f.acc.map(a => a.split(" ").map(t => VX_SEIN_FOR[t] || t).join(" "))])];
  return f;
}
function vxFormBase(x, kind, p, opt = {}) {
  const F = x.F, refl = F.refl ? REFL[p] || "sich" : "";
  const out = (ans, acc = [], tail = "") => {
    const all = [ans, ...acc].map(s => s.replace(/\s+/g, " ").trim()).filter(Boolean);
    return { ans: all[0], acc: [...new Set(all)], tail, n: all[0].split(" ").length };
  };
  const engine = t => { const c = verbCell(F, t, p); return c ? { ans: c.ans, acc: verbCellAnswers(c), tail: c.tail } : null; };
  // The whole verb, to be produced, never shown: the reflexive pronoun,
  // a separable prefix and a command's Sie are part of the answer
  // (wir fahren ab · du triffst dich · vermieten Sie · hast dich beeilt).
  const whole = c => {
    if (kind === "im") {
      const rest = String(c.tail || "").replace(/!$/, "").trim();
      const fins = [...new Set(c.acc.map(a => a.split(" ")[0]))];
      return out([c.ans, rest].filter(Boolean).join(" "), fins.slice(1).map(f => [f, rest].filter(Boolean).join(" ")));
    }
    if (kind === "pr" || kind === "pt") {
      const fins = [...new Set(c.acc.map(a => a.split(" ")[0]))];
      const full = f => [f, refl, F.sep].filter(Boolean).join(" ");
      return out(full(c.ans), fins.slice(1).map(full));
    }
    // Compound tenses carry the pronoun already; it is not optional.
    const acc = refl ? c.acc.filter(a => a.split(" ").includes(refl)) : c.acc;
    return out(c.ans, acc);
  };
  switch (kind) {
    case "pr": case "pt": case "pf": case "pq": case "fu": case "im": {
      const c = engine(kind);
      return c ? whole(c) : null;
    }
    case "prsep": {
      const c = engine("pr"); if (!c || !F.sep) return null;
      const fin = [c.ans, refl].filter(Boolean).join(" ");
      return out(`${fin} ${F.sep}`, [`${fin} … ${F.sep}`]);
    }
    case "prrefl": {
      const c = engine("pr"); if (!c || !F.refl) return null;
      const fin = c.ans, sep = F.sep ? " " + F.sep : "";
      return out(`${fin} ${refl}${sep}`, F.sep ? [`${fin} ${refl} … ${F.sep}`] : []);
    }
    case "k2w": {
      if (F.k2special) return null;
      const c = engine("k2"); return c ? out(c.ans, refl ? c.acc.filter(a => a.split(" ").includes(refl)) : c.acc) : null;
    }
    case "k2o": {
      if (!F.k2special || !F.k2 || !F.k2[p]) return null;
      return out([F.k2[p], refl].filter(Boolean).join(" "));
    }
    case "k2s": {
      if (!F.k2own || !F.k2own[p]) return null;
      const whole = f => [f, refl, F.sep].filter(Boolean).join(" ");
      return out(whole(F.k2own[p]), (F.k2ownAlt[p] || []).map(whole));
    }
    case "pvpr": case "pvpt": {
      if (!F.p2 || F.aux !== "haben" || F.refl) return null;
      const w = (kind === "pvpr" ? { er: "wird", sie: "werden" } : { er: "wurde", sie: "wurden" })[p];
      return w ? out(`${w} ${F.p2}`) : null;
    }
    case "pvmod": {
      const m = VX_PV_MODALS[opt.modal || "müssen"];
      if (!F.p2 || F.aux !== "haben" || F.refl || !m || !m[p]) return null;
      return out(`${m[p]} ${F.p2} werden`);
    }
    case "k2p": {
      if (!F.p2 || !F.aux) return null;
      const a = K2_AUX[F.aux][p];
      return a ? out(F.refl ? `${a} ${refl} ${F.p2}` : `${a} ${F.p2}`) : null;
    }
    // For the sheets' quizzes (tests check them against the engine).
    case "p2only": return F.p2 ? out(F.p2) : null;
    case "imfull": {
      const c = verbCell(F, "im", p); if (!c) return null;
      return out(`${c.ans} ${String(c.tail || "").replace(/!$/, "")}`);
    }
    case "imsep": {
      // The whole command, prefix and pronoun included: the prompt shows
      // no tail, so the learner must know where the pieces go.
      const c = verbCell(F, "im", p); if (!c || (!F.sep && !F.refl)) return null;
      const rest = String(c.tail || "").replace(/!$/, "").trim();
      const vs = [c.ans, ...(p === "du" ? F.imAlt.du.filter(v => v !== c.ans) : [])];
      return out(`${c.ans} ${rest}`, vs.slice(1).map(v => `${v} ${rest}`));
    }
    case "ptsep": {
      const c = engine("pt"); if (!c || !F.sep) return null;
      return out(`${c.ans} ${F.sep}`);
    }
    case "sc": {
      // One person (du or er), the whole verb: du fährst ab, du triffst dich.
      const f = (p === "du" || p === "er") && F.pr[p];
      if (!f) return null;
      return out([f, refl, F.sep].filter(Boolean).join(" "));
    }
    case "p2": {
      if (!F.p2 || !F.aux) return null;
      const a = AUX_PR[F.aux].er;
      const f = p2 => F.refl ? `${a} sich ${p2}` : `${a} ${p2}`;
      return out(f(F.p2), (F.p2Alt || []).map(f));
    }
  }
  return null;
}
// The tense a kind of form belongs to (for colours, coverage and logs).
const VX_KIND_TENSE = VX_FR ? VXF.kindTense : { pr: "pr", prsep: "pr", prrefl: "pr", sc: "pr", pt: "pt", pf: "pf", p2: "pf", pq: "pq", fu: "fu", im: "im", imsep: "im",
  k2w: "k2", k2o: "k2", k2s: "k2", k2p: "k2p", pvpr: "pv", pvpt: "pv", pvmod: "pv" };
const VX_TENSE_LABEL = VX_FR ? VXF.tenseLabel : { pr: "Präsens", pt: "Präteritum", pf: "Perfekt", pq: "Plusquamperfekt", fu: "Futur I", im: "Imperativ", k2: "Konjunktiv II",
  k2p: "Konjunktiv II · past", pv: "Passiv" };
const VX_TENSE_UNIT = VX_FR ? VXF.tenseUnit : { pr: "pr", pf: "pf", im: "im", pt: "pt2", fu: "fu", k2: "k2a", pq: "pq", pv: "pv", k2p: "k2p" };

// ── RULES ─────────────────────────────────────
// One per idea a sheet teaches that applies to many verbs. verbs(x):
// which verbs show it · persons · kind of form · order: a group number
// for the logical order (lower first).
const VX_PV_VERBS = new Set(("machen kaufen bauen reparieren schreiben lesen öffnen schließen bezahlen bestellen waschen putzen kochen verkaufen einladen abholen " +
  "fragen besuchen finden sehen hören nehmen bringen schicken trinken essen backen malen zeigen erklären beantworten unterschreiben ausfüllen " +
  "organisieren planen verschieben absagen renovieren streichen verletzen informieren kontrollieren prüfen überprüfen korrigieren übersetzen drucken " +
  "kopieren speichern löschen installieren liefern operieren untersuchen behandeln wählen gründen entdecken erfinden produzieren eröffnen " +
  "anrufen anmelden abschließen aufräumen ausmachen anmachen benutzen bestätigen buchen empfehlen erledigen feiern gewinnen heizen lieben " +
  "messen mieten nennen packen sammeln sauber stellen suchen tragen trocknen verbessern verlieren verschicken versichern vorbereiten waschen " +
  "wecken werfen zahlen ziehen zerstören beschädigen abschleppen ersetzen bauen sanieren testen begrüßen loben kritisieren unterstützen bewerten").split(/\s+/));
const VX_RULES = VX_FR ? VXF.rules : [
  { id: "pr-end", unit: "pr", sheet: "pr1", kind: "pr", title: "Präsens endings", chip: "stem + e · st · t · en · t · en",
    verbs: x => !x.k.irregular && !x.k.stem && !x.k.glue && !x.F.sep && !x.F.refl && x.F.presSure && !x.F.only, persons: () => PERSONS, order: () => 0,
    // Your cards that show these endings: any verb that isn't irregular,
    // in the persons where nothing else changes (ich fahre, wir fahren).
    evid: (x, p) => !x.k.irregular && (["ich", "wir", "sie"].includes(p) || (!x.k.glue && (p === "ihr" || !x.k.stem))) },
  { id: "pr-glue", unit: "pr", sheet: "pr2", kind: "pr", title: "Spelling glue", chip: "arbeitest · heißt · sammle",
    verbs: x => x.k.glue && !x.k.stem && !x.k.irregular && !x.F.sep && !x.F.refl && x.F.presSure && !x.F.only,
    persons: x => x.k.eln ? ["ich", "wir"] : x.k.ern ? ["wir", "sie"] : ["du", "er", "ihr"], order: x => x.k.eln || x.k.ern ? 1 : 0,
    // du isst, er liest: a stem changer shows the glue too.
    evid: (x, p) => x.k.glue && !x.k.irregular && (x.k.eln ? ["ich", "wir"] : x.k.ern ? ["wir", "sie"] : ["du", "er", "ihr"]).includes(p) },
  { id: "pr-sep", unit: "pr", sheet: "pr6", kind: "prsep", title: "Separable verbs", chip: "the prefix jumps to the end",
    verbs: x => !!x.F.sep && x.F.presSure && !x.F.only, persons: () => PERSONS, order: x => x.k.stem ? 1 : 0 },
  { id: "pr-refl", unit: "pr", sheet: "pr7", kind: "prrefl", title: "Reflexive verbs", chip: "mich · dich · sich · uns · euch · sich",
    verbs: x => !!x.F.refl && x.F.presSure && !x.F.only, persons: () => PERSONS, order: x => x.F.sep ? 1 : 0 },
  { id: "pf-ge", unit: "pf", sheet: "pf3", kind: "pf", title: "Partizip II: ge-…-t", chip: "haben + ge-stem-t",
    verbs: x => !x.F.strong && x.F.aux === "haben" && !x.F.sep && !x.F.insep && !x.k.ieren && !x.F.refl, persons: () => PERSONS, order: x => x.k.glue ? 1 : 0 },
  { id: "pf-aux", unit: "pf", sheet: "pf2", kind: "pf", title: "haben or sein", chip: "movement / change → sein",
    verbs: x => !!x.F.aux && !x.F.only, persons: () => PERSONS, order: x => x.F.aux === "sein" ? 0 : 1, mix: true },
  { id: "pf-prefix", unit: "pf", sheet: "pf4", kind: "pf", title: "Where ge- goes", chip: "ein·ge·kauft · besucht · studiert",
    verbs: x => (!!x.F.sep || !!x.F.insep || x.k.ieren) && !x.F.strong && !!x.F.aux, persons: () => PERSONS,
    order: x => x.F.sep ? 0 : x.F.insep ? 1 : 2, mix: true },
  { id: "im-reg", unit: "im", sheet: "im1", kind: "im", title: "Imperativ", chip: "du: stem! · ihr: -t! · Sie: -en Sie!",
    verbs: x => !!x.F.im && !x.F.eToI && !x.k.aux && !x.k.modal && !x.F.sep && !x.F.refl && !vxItVerb(x), persons: () => ["du", "ihr", "Sie"], order: x => x.k.glue ? 1 : 0 },
  { id: "im-sep", unit: "im", sheet: "im3", kind: "imsep", title: "Imperativ with prefixes", chip: "Ruf an! · Setz dich!",
    verbs: x => !!x.F.im && (!!x.F.sep || !!x.F.refl) && !x.k.modal && !vxItVerb(x), persons: () => ["du", "ihr", "Sie"], order: x => x.F.sep ? 0 : 1 },
  { id: "fu", unit: "fu", sheet: "fu1", kind: "fu", title: "Futur I", chip: "werden + infinitive",
    verbs: x => !x.F.only && !x.k.modal && x.v.tenses.includes("fu"), persons: () => PERSONS, order: () => 0 },
  { id: "k2-wuerde", unit: "k2a", sheet: "k21", kind: "k2w", title: "würde + infinitive", chip: "würde · würdest · würde…",
    verbs: x => !x.F.k2special && !x.F.only, persons: () => PERSONS, order: () => 0 },
  { id: "k2-own", unit: "k2a", sheet: "k22", kind: "k2o", title: "Their own Konjunktiv II", chip: "wäre · hätte · könnte · müsste",
    verbs: x => !!x.F.k2special && x.F.base !== "werden", persons: () => PERSONS, order: x => x.k.aux ? 0 : 1 },
  { id: "pt-weak", unit: "pt2", sheet: "pt21", kind: "pt", title: "Präteritum: -te", chip: "stem + te · test · te · ten · tet · ten",
    verbs: x => x.k.ptWeak && !x.F.only, persons: () => PERSONS, order: x => x.k.glue ? 1 : 0 },
  { id: "pt-strong", unit: "pt2", sheet: "pt22", kind: "pt", title: "Strong Präteritum endings", chip: "ging · gingst · ging · gingen",
    verbs: x => x.k.strongPt && !x.k.aux && !x.k.modal, persons: () => ["du", "wir", "ihr", "sie"], order: () => 0 },
  { id: "pq", unit: "pq", sheet: "pq1", kind: "pq", title: "Plusquamperfekt", chip: "hatte / war + Partizip II",
    verbs: x => !!x.F.aux && !x.F.only && !x.k.modal, persons: () => PERSONS, order: x => x.F.aux === "sein" ? 1 : 0, mix: true },
  { id: "pv-pr", unit: "pv", sheet: "pv1", kind: "pvpr", title: "Passiv Präsens", chip: "wird + Partizip II",
    verbs: x => VX_PV_VERBS.has(x.inf), persons: () => ["er", "sie"], order: () => 0 },
  { id: "pv-pt", unit: "pv", sheet: "pv2", kind: "pvpt", title: "Passiv Präteritum", chip: "wurde + Partizip II",
    verbs: x => VX_PV_VERBS.has(x.inf), persons: () => ["er", "sie"], order: () => 0 },
  { id: "pv-mod", unit: "pv", sheet: "pv3", kind: "pvmod", title: "Passiv with a modal", chip: "muss + Partizip II + werden",
    verbs: x => VX_PV_VERBS.has(x.inf), persons: () => ["er", "sie"], order: () => 0 },
  { id: "k2p", unit: "k2p", sheet: "k2p1", kind: "k2p", title: "Konjunktiv II · past", chip: "hätte / wäre + Partizip II",
    verbs: x => !!x.F.aux && !x.F.only && !x.k.modal, persons: () => PERSONS, order: x => x.F.aux === "sein" ? 1 : 0, mix: true },
];
const VX_RULE = Object.fromEntries(VX_RULES.map(r => [r.id, r]));
// Per-verb items: which sheet teaches them and which unit opens them.
const VX_ITEM_KINDS = VX_FR ? VXF.itemKinds : {
  sc: { unit: "pr", sheet: "pr4", form: "sc", title: "Stem change", tense: "pr" },
  p2: { unit: "pf", sheet: "pf3", form: "p2", title: "Perfekt", tense: "pf" },
  pt: { unit: "pt2", sheet: x => x.k.mixed ? "pt23" : "pt22", form: "pt", title: "Präteritum", tense: "pt" },
  im: { unit: "im", sheet: "im2", form: "im", title: "Imperativ", tense: "im" },
  // The verbs no rule builds, in every person: bin · bist · ist…, kann ·
  // kannst…, weiß — and their Präteritum I: war, hatte, konnte, wusste.
  // (They were the A1 conjugation and A2 Präteritum cards.)
  // (persons: every one — for the verbs that have the item; none for the rest)
  ir: { unit: "pr", sheet: x => x.k.aux ? "pr3" : "pr5", form: "pr", title: "Irregular Präsens", tense: "pr", persons: x => vxNeedsItem(x, "ir") ? PERSONS : [] },
  p1: { unit: "pt1", sheet: x => x.k.modal ? "pt12" : "pt11", form: "pt", title: "Präteritum I", tense: "pt", persons: x => vxNeedsItem(x, "p1") ? PERSONS : [] },
  // A strong verb's own Konjunktiv II, next to würde + infinitive:
  // käme · kämest · käme… (grammar-de.js K2_OWN): every person whose
  // form isn't the Präteritum's too (wir gingen: there, würde gehen).
  k2s: { unit: "k2a", sheet: "k25", form: "k2s", title: "Own Konjunktiv II", tense: "k2",
    persons: x => vxNeedsItem(x, "k2s") ? PERSONS.filter(p => { const f = vxForm(x, "k2s", p), pt = vxForm(x, "pt", p); return f && !(pt && pt.acc.includes(f.ans)); }) : [] },
};
function vxKey(id) { return VX_DECK + "_" + id; }

// ── RETIRED CARDS & GATED DECKS ───────────────
// Grammar decks whose cards only come once their tense is taught.
const VX_GATE = VX_FR ? VXF.gate : { a2_praeteritum: "pt1", b1_konjunktiv2: "k2a", b1_passiv: "pv", a1_conjugation: "pr", a2_conjugation: "pr", a1_verbs_p2: "pf" };
// Decks whose unmet cards are covered by the verb track — and how.
const VX_RETIRE_DECKS = VX_FR ? VXF.retireDecks : new Set(["a2_verbs_p2", "b1_partizip2", "b1_praeteritum", "b1_praet_endungen", "a2_conjugation", "a2_futur", "b1_plusquamperfekt"]);
// Every deck that asks verb forms — the retiring ones and the gated
// ones: all their cards are covered by the verb track. A card you had met
// keeps its whole record and hands its progress to what covers it
// (vxAdopt); nothing of it is asked the old way again.
const VX_LEGACY_DECKS = new Set([...VX_RETIRE_DECKS, ...Object.keys(VX_GATE)]);
// The decks of plain verb forms (a person, a Partizip, a Präteritum) — what
// a verb with no word card of its own is known by.
const VX_CONJ_DECKS = VX_FR ? new Set() : new Set(["a1_conjugation", "a2_conjugation", "a2_praeteritum", "b1_praeteritum", "b1_praet_endungen", "a1_verbs_p2", "a2_verbs_p2", "b1_partizip2"]);
// Verb-form cards the engine can't read off by itself (two auxiliaries,
// a phrase around the verb, a Konjunktiv II or a Passiv): what they ask.
// Cards that aren't a verb form (als ob, von + Dativ, the Zustandspassiv,
// the Passiv Perfekt, nachdem clauses) stay ordinary grammar cards.
const VX_EXTRA_COVER = VX_FR ? {
  a2_participios_58: ["tomber", "pc", "il"], a2_imparfait_48: ["avoir", "im", "il"], a2_imparfait_49: ["être", "im", "il"],
} : {
  a1_verbs_p2_28: ["gehen", "p2"], a1_verbs_p2_30: ["stehen", "p2"], a1_verbs_p2_31: ["liegen", "p2"], a1_verbs_p2_34: ["hängen", "p2"],
  a1_verbs_p2_47: ["starten", "p2"], a1_verbs_p2_65: ["sich kümmern", "p2"], a1_verbs_p2_76: ["fahren", "p2"],
  a2_verbs_p2_149: ["anrufen", "p2"], a2_verbs_p2_152: ["aussteigen", "p2"],
  b1_partizip2_20: ["sich befinden", "p2"], b1_partizip2_38: ["sich entschließen", "p2"], b1_partizip2_82: ["sich verlaufen", "p2"],
  b1_plusquamperfekt_4: ["vergessen", "pq", "ihr"], b1_plusquamperfekt_8: ["ankommen", "pq"], b1_plusquamperfekt_10: ["aufstehen", "pq", "sie"],
  a2_futur_8: ["gewinnen", "fu", "Sie"], b1_praet_endungen_12: ["abfahren", "pt"],
  b1_konjunktiv2_0: ["sein", "k2", "ich"], b1_konjunktiv2_1: ["sein", "k2", "du"], b1_konjunktiv2_2: ["sein", "k2"], b1_konjunktiv2_3: ["sein", "k2", "wir"],
  b1_konjunktiv2_4: ["haben", "k2", "ich"], b1_konjunktiv2_5: ["haben", "k2", "du"], b1_konjunktiv2_6: ["haben", "k2"], b1_konjunktiv2_7: ["haben", "k2", "wir"],
  b1_konjunktiv2_8: ["können", "k2", "ich"], b1_konjunktiv2_9: ["können", "k2", "du"], b1_konjunktiv2_10: ["müssen", "k2", "ich"], b1_konjunktiv2_11: ["sollen", "k2", "ich"],
  b1_konjunktiv2_12: ["dürfen", "k2", "ich"], b1_konjunktiv2_13: ["mögen", "k2", "ich"],
  b1_konjunktiv2_14: ["kommen", "k2", "ich", "k2-wuerde"], b1_konjunktiv2_15: ["helfen", "k2", "du", "k2-wuerde"], b1_konjunktiv2_16: ["kaufen", "k2"], b1_konjunktiv2_17: ["reisen", "k2", "wir"], b1_konjunktiv2_18: ["fragen", "k2", "sie"],
  b1_konjunktiv2_19: ["gehen", "k2"], b1_konjunktiv2_20: ["kommen", "k2"], b1_konjunktiv2_21: ["geben", "k2"], b1_konjunktiv2_22: ["wissen", "k2", "ich"], b1_konjunktiv2_23: ["brauchen", "k2", "ich"],
  b1_konjunktiv2_24: ["machen", "k2p", "ich"], b1_konjunktiv2_25: ["kommen", "k2p"],
  b1_passiv_0: ["reparieren", "pv", "er", "pv-pr"], b1_passiv_1: ["fragen", "pv", "er", "pv-pr"], b1_passiv_2: ["einladen", "pv", "er", "pv-pr"], b1_passiv_3: ["abholen", "pv", "sie", "pv-pr"],
  b1_passiv_4: ["bauen", "pv", "sie", "pv-pr"], b1_passiv_5: ["reparieren", "pv", "er", "pv-pt"], b1_passiv_6: ["fragen", "pv", "er", "pv-pt"], b1_passiv_7: ["öffnen", "pv", "er", "pv-pt"],
  b1_passiv_8: ["schicken", "pv", "sie", "pv-pt"], b1_passiv_11: ["reparieren", "pv", "er", "pv-mod"], b1_passiv_12: ["bezahlen", "pv", "er", "pv-mod"], b1_passiv_13: ["überprüfen", "pv", "er", "pv-mod"],
};
let _vxRetire = null;
// What covers a German form of a verb: its own item, or the rule that builds it.
function vxCoverDe(x, t, p) {
  const F = x.F, k = x.k;
  if (t === "p2" || t === "pf") return vxNeedsItem(x, "p2") ? { item: "p2:" + x.inf } : { rule: !F.strong && F.aux === "haben" && !F.sep && !F.insep && !k.ieren && !F.refl ? "pf-ge" : !F.strong && (F.sep || F.insep || k.ieren) ? "pf-prefix" : "pf-aux" };
  if (t === "pt") return vxNeedsItem(x, "p1") ? { item: "p1:" + x.inf } : vxNeedsItem(x, "pt") && (p === "er" || p === "ich") ? { item: "pt:" + x.inf } : { rule: k.strongPt ? "pt-strong" : "pt-weak" };
  if (t === "pr") {
    if (vxNeedsItem(x, "ir")) return { item: "ir:" + x.inf };
    if ((p === "du" || p === "er") && vxNeedsItem(x, "sc")) return { item: "sc:" + x.inf };
    return { rule: F.sep ? "pr-sep" : F.refl ? "pr-refl" : k.glue && !k.stem ? "pr-glue" : "pr-end" };
  }
  if (t === "fu") return { rule: "fu" };
  if (t === "pq") return { rule: "pq" };
  if (t === "k2") return vxNeedsItem(x, "k2s") ? { item: "k2s:" + x.inf } : { rule: F.k2special ? "k2-own" : "k2-wuerde" };
  if (t === "k2p") return { rule: "k2p" };
  return null;
}
// Map "deckId_idx" → { item?, rule?, inf, t, p } — what covers a card.
function vxRetireMap() {
  if (_vxRetire) return _vxRetire;
  const m = new Map();
  vxVerbs().forEach(x => vxRefs(x).forEach(r => {
    if (!VX_LEGACY_DECKS.has(r.deckId)) return;
    const key = r.deckId + "_" + r.idx;
    const c = VX_FR ? VXF.cover(x, r) : vxCoverDe(x, r.tense, r.person || "er");
    if (c) m.set(key, { ...c, inf: x.inf, t: r.tense === "p2" ? "pf" : r.tense, p: r.person || "er" });
  }));
  Object.entries(VX_EXTRA_COVER).forEach(([key, [inf, t, p, rule]]) => {
    const x = vxVerb(inf);
    if (!x || m.has(key)) return;
    const c = rule ? { rule } : VX_FR ? VXF.cover(x, { tense: t, person: p }) : vxCoverDe(x, t, p || "er");
    if (c) m.set(key, { ...c, inf, t: t === "p2" ? "pf" : t, p: p || VX_IT });
  });
  _vxRetire = m;
  return m;
}
// Is this card retired (on, in the map, and not one you met yourself)?
function vxRetired(deckId, idx) {
  if (!vxOn()) return false;
  const k = deckId + "_" + idx;
  if (!vxRetireMap().has(k)) return false;
  const ws = S.words[k];
  return !(ws && ws.st && !ws.rt);
}
// A verb-form deck the track has taken over entirely: none of its cards
// can be asked as a card any more (quests leave it alone).
function vxDeckRetired(deckId) {
  if (!vxOn() || !VX_LEGACY_DECKS.has(deckId)) return false;
  const d = getDeck(deckId);
  return !!d && d.words.every((w, i) => vxRetired(deckId, i));
}
// A grammar deck still waiting for its lesson.
function vxGated(deckId) {
  if (!vxOn()) return false;
  const u = VX_GATE[deckId];
  return !!u && !vxUnitOpen(u);
}
// Shadows: a retired card mirrors its cover — a per-verb item's stage,
// or a rule's stage once that verb's form was produced right. A card you
// had met (adopted, ws.rtWas) never shows less than it had reached.
function vxMirror() {
  if (!vxOn()) return;
  vxAdopt();
  const now = Date.now();
  vxRetireMap().forEach((c, key) => {
    let ws = S.words[key];
    if (ws && ws.st && !ws.rt) return; // (adopted just above)
    let st = 0, src = null;
    if (c.item) { src = S.words[vxKey(c.item)]; st = src ? src.st || 0 : 0; }
    // A rule: once that verb's form was produced — or straight away when
    // the ledger never asks that form (würde kommen, es wird repariert):
    // then the rule is all there is to know about it.
    else if (vxCovHas(c.inf, c.t) || !vxCellRequired(c.inf, c.t)) { src = S.words[vxKey("r:" + c.rule)]; st = src ? src.st || 0 : 0; }
    const floor = ws && ws.rtWas ? ws.rtWas.st || 0 : 0;
    st = Math.max(st, floor);
    if (!st && !(ws && ws.rt)) return;
    if (!ws) ws = S.words[key] = { correct: 0, wrong: 0, streak: 0, displayStreak: 0, lastAnsweredAt: null, anki: freshAnki() };
    if (ws.st === st && ws.rt && !ws.dueAt && !ws.lrn && !ws.rp && !ws.fl) return;
    ws.rt = 1; ws.st = st; ws.pk = Math.max(ws.pk || 0, st);
    ws.dueAt = null; ws.sAt = (src && src.sAt) || ws.sAt || now;
    if (st >= STAGE_KNOWN) ws.mastered = true;
    ["lrn", "rp", "fl", "cf", "metOn"].forEach(f => delete ws[f]);
  });
}
// A card of a verb-form deck you had met becomes part of the track: its
// whole record is kept (ws.rtWas — switching back restores it), its form
// counts as produced in the ledger, and its progress goes to what covers
// it — a per-verb item takes the cards' stage and schedule when it has
// less (the middle one of its cards: one card at 💎 and two at 🌱 is not
// 💎), a rule not yet started is placed like the switch places it. The
// card itself then mirrors, never below the stage it had.
const VX_ADOPT_FIELDS = ["st", "dueAt", "sAt", "pk", "k", "cf", "mt", "rc", "lrn", "rp", "fl", "mastered", "metOn", "spotAt", "dropDay"];
function vxAdopt() {
  if (!vxOn()) return 0;
  const groups = new Map();
  vxRetireMap().forEach((c, key) => {
    const ws = S.words[key];
    if (!ws) return;
    // A card you met, not handed over yet — or one handed over before
    // its own kind of item existed (brachte, käme: a rule covered them
    // then): its record (rtWas) goes to that item, once.
    let rec = null, again = false;
    if (ws.st && !ws.rt) rec = ws;
    else if (ws.rt && ws.rtWas && ws.rtWas.st && c.item) {
      const it = S.words[vxKey(c.item)];
      if (!(it && it.adopted)) { rec = ws.rtWas; again = true; }
    }
    if (!rec) return;
    const g = c.item ? "i|" + c.item : "r|" + c.rule;
    if (!groups.has(g)) groups.set(g, []);
    groups.get(g).push({ key, ws, rec, c, again });
  });
  if (!groups.size) return 0;
  const now = Date.now();
  let items = 0, rules = 0, cards = 0;
  groups.forEach(list => {
    const c0 = list[0].c;
    const sorted = list.slice().sort((a, b) => a.rec.st - b.rec.st || (a.rec.sAt || 0) - (b.rec.sAt || 0));
    const mid = sorted[Math.floor((sorted.length - 1) / 2)].rec;
    const pending = list.some(o => o.rec.rp || o.rec.fl || o.rec.lrn);
    if (c0.item) {
      const it = getWS(VX_DECK, c0.item);
      if ((it.st || 0) < mid.st) {
        VX_ADOPT_FIELDS.forEach(f => { if (mid[f] === undefined) delete it[f]; else it[f] = mid[f]; });
        it.pk = Math.max(it.pk || 0, ...list.map(o => o.rec.pk || o.rec.st || 0));
        // A card still waiting for a repair: a quick check soon.
        if (pending && !it.rp && !it.lrn) it.fl = 1;
        // A record handed over a while ago: its review date passed long
        // since — due again within its stage's gap, not all at once today.
        if (list[0].again && it.dueAt && it.dueAt < now && it.st) {
          const gap = Math.max(1, Math.round(STAGE_DAYS[it.st] || 1));
          it.dueAt = studyDayStart(1 + hashString(c0.item) % gap, now);
        }
        items++;
      }
      // (Right / wrong counts stay with the cards: added here, two devices
      // adopting the same cards would count them twice when they sync.)
      it.adopted = 1;
    } else if (c0.rule && VX_RULE[c0.rule]) {
      const r = getWS(VX_DECK, "r:" + c0.rule);
      if (!r.st) {
        const med = mid.st, st = med >= STAGE_KNOWN ? med : Math.min(med, 4);
        r.st = st; r.pk = Math.max(r.pk || 0, st); r.sAt = now; r.seed = 1;
        const spread = 1 + hashString(c0.rule) % Math.max(1, Math.round(STAGE_DAYS[st] || 1));
        r.dueAt = studyDayStart(Math.min(spread, STAGE_DAYS[st] || 1), now);
        if (st >= STAGE_KNOWN) r.mastered = true;
        rules++;
      }
    }
    list.forEach(({ ws, c, again }) => {
      if (VX_COV.includes(c.t)) vxCovSet(c.inf, c.t);
      if (again) return; // (handed over already: its record stays as it was)
      const was = {};
      Object.keys(ws).forEach(f => { if (f !== "rtWas" && f !== "anki") was[f] = ws[f]; });
      ws.rtWas = JSON.parse(JSON.stringify(was));
      ws.rt = 1;
      cards++;
    });
  });
  vxCatalogReset();
  if (typeof invalidatePathScan === "function") invalidatePathScan();
  if (typeof logEvent === "function") logEvent("vx_adopt", { cards, items, rules });
  return cards;
}

// ── ITEM CATALOG ──────────────────────────────
// Does a verb need its own item of this kind (and no active card has it)?
// (Every card of a verb-form deck is covered by the track now — met ones
// included, which hand their progress over — so none of them counts.)
function vxActiveRef(x, tense, persons) {
  return vxRefs(x).some(r => r.tense === tense && (!persons || persons.includes(r.person)) && !VX_LEGACY_DECKS.has(r.deckId));
}
function vxNeedsItem(x, kind) {
  if (VX_FR) return VXF.needsItem(x, kind);
  const F = x.F;
  if (kind === "sc") return x.k.stem && !x.k.irregular && !vxActiveRef(x, "pr", ["du"]) && !vxActiveRef(x, "pr", ["er"]);
  if (kind === "p2") return !!F.aux && !!F.p2 && (F.strong || F.aux === "sein") && !x.k.modal && !vxActiveRef(x, "p2");
  if (kind === "pt") return !F.only && (x.k.strongPt || vxMixedPt(x)) && !x.k.aux && !x.k.modal && !VX_PT1_VERBS.has(F.base) && !vxActiveRef(x, "pt", ["er", "ich"]);
  if (kind === "im") return !!F.im && !!F.presSure && !vxItVerb(x) && (F.eToI || (F.base === "sein" && !F.sep && !F.insep));
  if (kind === "ir") return x.k.irregular && !!F.presSure && !F.only && !F.sep && !F.insep && !F.refl && !!vxForm(x, "pr", "ich");
  if (kind === "p1") return VX_PT1_VERBS.has(F.base) && F.base === x.inf && !!vxForm(x, "pt", "ich");
  // The plain verb only (kommen → käme): its prefixed ones build theirs
  // the same way, and würde + infinitive is right for them too.
  if (kind === "k2s") return !!F.k2own && !F.sep && !F.insep && !F.refl && !F.only && vxHasTense(x, "k2") && !!vxForm(x, "k2s", "ich");
  return false;
}
// A mixed verb: a new stem AND -te (brachte, dachte, kannte) — no rule
// builds that, so it has its own card like a strong verb. (backen →
// backte is regular in the Präteritum: only its Partizip is strong.)
function vxMixedPt(x) {
  if (!x.k.mixed) return false;
  const F = x.F, st = (F.insep + F.base).replace(/(en|n)$/, "");
  return ![st + "te", st + "ete"].includes(F.pt.er || "");
}
let _vxCatalog = null, _vxCatalogAt = "";
// Every item the track can ever have: { id, kind, unit, sheet, rule?, x?, lv, ord }
function vxCatalog() {
  const stamp = S.verb && S.verb.on;
  if (_vxCatalog && _vxCatalogAt === stamp) return _vxCatalog;
  const out = [];
  VX_RULES.forEach((r, i) => out.push({ id: "r:" + r.id, kind: "r", rule: r.id, unit: r.unit, sheet: r.sheet, lv: -1, ord: i }));
  vxVerbs().forEach(x => Object.keys(VX_ITEM_KINDS).forEach(kind => {
    if (!vxNeedsItem(x, kind)) return;
    const d = VX_ITEM_KINDS[kind];
    out.push({ id: kind + ":" + x.inf, kind, unit: d.unit, sheet: vxItemSheet(d, x), x, lv: x.lv, ord: vxItemOrder(x, kind) });
  }));
  _vxCatalog = out; _vxCatalogAt = stamp;
  return out;
}
// A per-verb item's sheet (French: it depends on the verb).
function vxItemSheet(d, x) { return typeof d.sheet === "function" ? d.sheet(x) : d.sheet; }
function vxCatalogReset() { _vxCatalog = null; _vxRetire = null; _vxQueueCache = null; _vxCells = null; _vxOpenDays = null; _vxPace = null; }
// The logical order inside a level (lower first): the shapes a learner
// meets first, the odd ones last.
function vxItemOrder(x, kind) {
  if (VX_FR) return VXF.itemOrder(x, kind);
  const F = x.F;
  if (kind === "sc") { const er = lastVowel(F.pr.er.replace(/t$/, "")); return er === "ä" || er === "äu" ? 0 : er === "i" ? 1 : er === "ie" ? 2 : 3; }
  if (kind === "p2") { if (!F.strong) return 0; if (x.k.mixed) return 4; const a = lastVowel(F.base.replace(/(en|n)$/, "")), b = lastVowel(F.p2.replace(/(en|n|t)$/, "")); return a === b ? 1 : F.aux === "sein" ? 3 : 2; }
  if (kind === "pt") return x.k.mixed ? 2 : 1;
  if (kind === "k2s") return ["kommen", "gehen", "geben", "bleiben", "lassen", "finden"].includes(F.base) ? 0 : 1;
  if (kind === "im") return F.base === "sein" ? 0 : 1;
  if (kind === "ir" || kind === "p1") return x.k.aux ? 0 : x.k.modal ? 2 : 1;
  return 0;
}

// ── COVERAGE (the ledger's cells) ─────────────
const VX_COV = VX_FR ? VXF.cov : ["pr", "pt", "pf", "pq", "fu", "k2", "im"];
// The three tenses every other one is built from: each verb's ledger cells.
const VX_CORE = VX_FR ? VXF.core : ["pr", "pt", "pf"];
const VX_CORE_LABEL = VX_FR ? VXF.coreLabel : "Präsens · Präteritum · Perfekt";
function vxCovHas(inf, t) { const i = VX_COV.indexOf(t); return i >= 0 && !!(((S.verb && S.verb.cov && S.verb.cov[inf]) || 0) & (1 << i)); }
function vxCovSet(inf, t) {
  const i = VX_COV.indexOf(t);
  if (i < 0 || !inf || !vxVerb(inf)) return false;
  const V = S.verb, was = V.cov[inf] || 0;
  if (was & (1 << i)) return false;
  V.cov[inf] = was | (1 << i);
  return true;
}
// Cells the ledger requires: the three core tenses of every verb, plus
// the forms a retired card used to ask (a Futur, a Plusquamperfekt).
let _vxCells = null;
function vxRequiredCells() {
  if (_vxCells) return _vxCells;
  const extra = new Map();
  vxRetireMap().forEach(c => { if (!VX_CORE.includes(c.t)) { const k = c.inf + "|" + c.t; extra.set(k, c); } });
  const out = [];
  const extraT = VX_FR ? VX_COV.filter(t => !VX_CORE.includes(t)) : ["fu", "pq"];
  vxVerbs().forEach(x => {
    VX_CORE.forEach(t => { if (vxHasTense(x, t) && vxCellPersons(x, t).length) out.push({ x, t }); });
    extraT.forEach(t => { if (extra.has(x.inf + "|" + t) && vxHasTense(x, t) && (!VX_FR || vxCellPersons(x, t).length)) out.push({ x, t }); });
  });
  out.forEach(c => { c.ord = vxCellOrder(c.x, c.t); });
  out.sort((a, b) => a.x.lv - b.x.lv || a.ord - b.ord || a.x.i - b.x.i);
  _vxCells = out;
  return out;
}
// Is this verb and tense one of the ledger's forms?
let _vxCellKeys = null;
function vxCellRequired(inf, t) {
  if (!_vxCellKeys || _vxCellKeys.src !== _vxCells) { _vxCellKeys = new Set(vxRequiredCells().map(c => c.x.inf + "|" + c.t)); _vxCellKeys.src = _vxCells; }
  return _vxCellKeys.has(inf + "|" + t);
}
// Verbs that only take "it" (es regnet, das kostet, es gefällt mir).
function vxItVerb(x) { return VX_FR ? !!x.F.only : !!x.F.impersonal || DE_WEATHER.test(x.inf) || DE_IT_VERBS.test(x.inf); }
// The persons a rule may ask of a verb: an "it" verb only in er (es).
function vxRulePersons(r, x) {
  const ps = r.persons(x);
  return vxItVerb(x) && !/^pv/.test(r.kind) ? ps.filter(p => p === VX_IT) : ps;
}
function vxCellPersons(x, t) {
  if (VX_FR) return VXF.cellPersons(x, t);
  if (x.F.only && !x.F.only.includes(t)) return [];
  if (vxItVerb(x)) return verbCell(x.F, t, "er") ? ["er"] : [];
  return PERSONS.filter(p => verbCell(x.F, t, p));
}
function vxCellOrder(x, t) {
  if (VX_FR) return VXF.cellOrder(x, t);
  const k = x.k, F = x.F;
  if (t === "pr") return k.irregular ? 4 : k.stem ? 3 : F.sep || F.refl ? 2 : k.glue ? 1 : 0;
  if (t === "pf") return k.irregular ? 4 : F.aux === "sein" ? 3 : F.strong ? 2 : F.sep || F.insep || k.ieren ? 1 : 0;
  if (t === "pt") return k.irregular ? 3 : k.mixed ? 2 : k.strongPt ? 1 : 0;
  return 0;
}
// Which unit a cell's tense waits for.
function vxCellOpen(c) {
  if (c.t === "pt" && !VX_FR) return vxUnitOpen("pt2") || (vxUnitOpen("pt1") && VX_PT1_VERBS.has(c.x.F.base) && !c.x.F.sep && !c.x.F.insep);
  return vxUnitOpen(VX_TENSE_UNIT[c.t]);
}

// ── EXERCISES ─────────────────────────────────
// A rule's verbs in their fixed order: level, then the rule's own
// groups, then the order you met them. mix: alternate groups (sein /
// haben) so each review contrasts with the last.
function vxRuleVerbs(rule) {
  const r = VX_RULE[rule];
  const vs = vxVerbs().filter(x => r.verbs(x) && vxVerbReady(x) && vxRulePersons(r, x).some(p => vxForm(x, r.kind, p, { modal: "müssen" })));
  const met = new Map(vs.map(x => [x, vxLemma(x).met || "9999"]));
  vs.sort((a, b) => a.lv - b.lv || (r.mix ? 0 : r.order(a) - r.order(b)) || met.get(a).localeCompare(met.get(b)) || a.i - b.i);
  if (!r.mix) return vs;
  // Interleave the groups level by level (sein, haben, sein…).
  const out = [];
  VX_LEVELS.forEach((_, lv) => {
    const groups = {};
    vs.filter(x => x.lv === lv).forEach(x => (groups[r.order(x)] = groups[r.order(x)] || []).push(x));
    const keys = Object.keys(groups).sort();
    for (let i = 0; keys.some(k => groups[k][i]); i++) keys.forEach(k => { if (groups[k][i]) out.push(groups[k][i]); });
  });
  return out;
}
// Next verb for a rule: first one whose cell for this tense is still
// open (so the ledger fills), then round the list.
function vxNextRuleVerb(rule, avoid) {
  const list = vxRuleVerbs(rule);
  if (!list.length) return null;
  // Only the ledger's tenses have cells to fill; Passiv and Konjunktiv II
  // past just go round the list.
  const t = VX_KIND_TENSE[VX_RULE[rule].kind];
  const open = VX_COV.includes(t) && list.find(x => !vxCovHas(x.inf, t) && x.inf !== avoid);
  if (open) return open;
  const V = S.verb, i = (V.rot[rule] || 0) % list.length;
  let x = list[i];
  if (x.inf === avoid && list.length > 1) x = list[(i + 1) % list.length];
  V.rot[rule] = (list.indexOf(x) + 1) % list.length;
  return x;
}
function vxPickPerson(list, x) {
  const ps = list.slice();
  // A stem-change verb shows its change in du and er: lean there.
  if (x && x.k.stem && ps.includes("du") && Math.random() < 0.6) return Math.random() < 0.5 ? "du" : "er";
  return ps[Math.floor(Math.random() * ps.length)];
}
// An exercise: everything a card needs to show and grade.
//   { kind (form kind), x, p, form, tense, rule?, item?, cell?, modal? }
function vxMakeExercise(item, avoid) {
  if (item.kind === "r") {
    const r = VX_RULE[item.rule];
    for (let tries = 0; tries < 6; tries++) {
      const x = vxNextRuleVerb(item.rule, avoid);
      if (!x) return null;
      const ps = vxRulePersons(r, x).filter(p => vxForm(x, r.kind, p, { modal: "müssen" }));
      if (!ps.length) continue;
      const p = vxPickPerson(ps, x);
      const modal = r.kind === "pvmod" ? Object.keys(VX_PV_MODALS)[Math.floor(Math.random() * 4)] : "";
      const form = vxForm(x, r.kind, p, { modal });
      if (form) return { kind: r.kind, x, p, form, tense: VX_KIND_TENSE[r.kind], rule: item.rule, item: item.id, modal, sheet: r.sheet };
    }
    return null;
  }
  const d = VX_ITEM_KINDS[item.kind], x = item.x;
  // French items ask any of their persons; German ones a fixed one —
  // a stem change one of du and er each time.
  const ps = d.persons ? d.persons(x).filter(q => vxForm(x, d.form, q)) : null;
  if (ps && !ps.length) return null;
  const p = ps ? vxPickPerson(ps, x) : item.kind === "sc" ? (Math.random() < 0.5 ? "du" : "er") : item.kind === "im" ? "du" : "er";
  const form = vxForm(x, d.form, p);
  return form ? { kind: d.form, x, p, form, tense: d.tense, item: item.id, sheet: vxItemSheet(d, x) } : null;
}
function vxCellExercise(c) {
  const ps = vxCellPersons(c.x, c.t);
  if (!ps.length) return null;
  const p = vxPickPerson(ps, c.t === "pr" ? c.x : null);
  const form = vxForm(c.x, c.t, p);
  return form ? { kind: c.t, x: c.x, p, form, tense: c.t, cell: c.x.inf + "|" + c.t, sheet: vxCellSheet(c) } : null;
}
function vxCellSheet(c) {
  if (VX_FR) return VXF.cellSheet(c);
  const k = c.x.k, F = c.x.F;
  if (c.t === "pr") return k.irregular ? "pr5" : k.stem ? "pr4" : F.sep ? "pr6" : F.refl ? "pr7" : k.glue ? "pr2" : "pr1";
  if (c.t === "pf") return F.aux === "sein" ? "pf5" : F.sep || F.insep || k.ieren ? "pf4" : "pf3";
  if (c.t === "pt") return k.irregular ? "pt12" : k.mixed ? "pt23" : k.strongPt ? "pt22" : "pt21";
  if (c.t === "fu") return "fu1";
  if (c.t === "pq") return "pq1";
  return "";
}
// Who the form is for, as the question shows it: "er", "sie (they)",
// "es" for an it-verb (es regnet), "(du)" for a command, "j'" / "que
// nous" in French. Passiv asks es / sie (they).
function vxPronText(ex) {
  if (VX_FR) return ex.kind === "ip" ? `(${ex.p})` : VXF.pron(ex.kind, ex.p, ex.form.ans) || "";
  if (ex.kind === "im" || ex.kind === "imsep" || ex.kind === "imfull") return `(${ex.p})`;
  if (ex.kind === "pvpr" || ex.kind === "pvpt" || ex.kind === "pvmod") return ex.p === "sie" ? "sie (they)" : "es";
  return ex.p === "sie" ? "sie (they)" : ex.p === "er" && vxItVerb(ex.x) ? "es" : (PERSON_LABEL[ex.p] || ex.p).split("/")[0];
}
// The tense as a game names it: the Passiv says which one, and its modal.
// A strong verb's own Konjunktiv II (käme) is asked as such: würde +
// infinitive is right German but not this item's answer. French: the
// three passives (est loué · a été loué · sera loué).
function vxGameTense(ex) {
  if (VX_FR) {
    const sub = { pvpr: "pr", pvpc: "pc", pvfu: "fu" }[ex.kind];
    return sub ? `${VX_TENSE_LABEL[ex.tense] || ""} · ${VX_TENSE_LABEL[sub] || ""}` : VX_TENSE_LABEL[ex.tense] || "";
  }
  if (ex.kind === "k2s") return "Konjunktiv II · own form, not würde";
  if (ex.kind === "pvpr") return "Passiv Präsens";
  if (ex.kind === "pvpt") return "Passiv Präteritum";
  if (ex.kind === "pvmod") return `Passiv with ${ex.modal}`;
  return VX_TENSE_LABEL[ex.tense] || "";
}
// A verb item as one line of text for the games (their prompt): the
// verb, the tense, and the person with a gap — "waschen (Präsens) — er
// ___", "gehen (Imperativ) — (du) ___!". Without the person a form can't
// be guessed (wasche? wäschst? wäscht?).
function vxCueText(ex) {
  const pron = vxPronText(ex), ctx = ex.form.ctx ? " " + ex.form.ctx : "";
  const cmd = VX_FR ? ex.kind === "ip" : /^im/.test(ex.kind);
  const gap = !pron ? "___" : /'$/.test(pron) ? pron + "___" : pron + " ___";
  return `${ex.x.inf} (${vxGameTense(ex)}) — ${gap}${ctx}${cmd ? (VX_FR ? " !" : "!") : ""}`;
}
// The word-like object a Today item carries (wordKey(w) = "vx_…").
function vxWord(ex) {
  const id = ex.item || ("cell:" + ex.cell);
  return { deckId: VX_DECK, idx: id, deckName: vxT("Verbs"), de: ex.form.ans, fr: ex.form.ans, en: vxCueText(ex), hint: "verb", vx: ex };
}

// ── GRADING ───────────────────────────────────
// true · "near" · false. A pronoun typed in front is fine.
// vxEq compares a form with its umlauts (ae / oe / ue spelt out is
// fine). Grading forgives a missing umlaut, as the rest of the app does,
// and the feedback then shows the spelling (fährt, hätte).
function vxEq(answer, typed) {
  if (VX_FR) return VXF.eq(answer, typed);
  const f = s => String(s || "").normalize("NFC").trim().toLowerCase().replace(/ß/g, "ss").replace(/['’‘`´ʼ\-]/g, " ").replace(/\s+/g, " ").trim();
  const a = f(answer), t = f(typed);
  return a === t || a.replace(/ä/g, "ae").replace(/ö/g, "oe").replace(/ü/g, "ue") === t;
}
// Right but for an umlaut (fahrst for fährst)?
function vxUmlautSlip(answers, typed) {
  return answers.some(a => !vxEq(a, typed) && normalize(a) === normalize(typed));
}
// The ways an answer may be typed. A form: with its pronoun in front or
// not (du gehst). A Sie command (imp "Sie"): with "Sie" after it or not,
// in any case (vermieten Sie / vermieten sie); a du / ihr command never
// takes one (wohn sie is wrong). Never a pronoun in front: "Sie
// vermieten" is a statement, not a command.
function vxGradeTries(val, imp = false) {
  if (VX_FR) return VXF.gradeTries(val, imp);
  const raw = String(val || "").trim().replace(/!+$/, "").trim();
  if (!raw) return [];
  const list = imp ? (imp === "Sie" ? [raw, raw.replace(/\s+sie$/i, "")] : [raw]) : [raw, raw.replace(/^(ich|du|er|sie|es|wir|ihr|man)\s+/i, "")];
  return [...list, ...list.map(t => t.replace(/\s*[,·/;…]\s*/g, " "))];
}
// Is this exercise (or quiz question) a command? German: "Sie" for a Sie
// command, true for a du / ihr one, false for none.
function vxIsCommand(ex) {
  const k = ex && (ex.kind || ex.t || (ex.chk && ex.chk[1]));
  // French: the impératif ("im" there is the imparfait).
  if (VX_FR) return k === "ip" || /^\((tu|nous|vous)\)/.test(String(ex && ex.q || ""));
  const q = String(ex && ex.q || "");
  if (!/^im/.test(String(k || "")) && !/^\((du|ihr|Sie)\)|___ Sie\b/.test(q)) return false;
  return ex.p === "Sie" || /^\(Sie\)|___ Sie\b/.test(q) ? "Sie" : true;
}
// An umlaut left out counts, as everywhere in the app (no umlaut keys
// needed); vxUmlautOnly() tells the feedback to show the spelling.
function vxGrade(val, ex) {
  const tries = vxGradeTries(val, vxIsCommand(ex));
  if (!tries.length) return false;
  const acc = ex.form.acc;
  for (const t of tries) if (acc.some(a => vxEq(a, t))) return true;
  if (tries.some(t => vxUmlautSlip(acc, t))) return true;
  if (vxExtraOk(tries, acc, ex.x)) return true;
  if (vxNearTry(val, ex)) return "near";
  return false;
}
// A typo (one letter off) is "Almost" — one more try. Another real form
// of the verb is not a typo but a wrong conjugation (wasche for wäscht:
// the ich form; kam for kamen): a miss. Returns what was typed, without
// its pronoun (for the diff), or "".
function vxNearTry(val, ex) { return vxNearTryAcc(val, ex.form.acc, ex.x, vxIsCommand(ex)); }
function vxNearTryAcc(val, acc, x, cmd = false) {
  const tries = vxGradeTries(val, cmd);
  if (!tries.length || (x && tries.some(t => vxIsOwnForm(x, t)))) return "";
  return tries.slice().reverse().find(t => isNearMiss(t, acc)) || "";
}
// What a wrong answer that is a real form of the verb is: another person
// of the asked tense ("ich"), else the asked person in another tense
// ("Präteritum"). English, for the games' miss feedback, or "".
function vxFormOwner(val, ex) {
  const tries = vxGradeTries(val, vxIsCommand(ex));
  if (!tries.some(t => vxIsOwnForm(ex.x, t))) return "";
  const hit = (k, p) => { let f = null; try { f = vxForm(ex.x, k, p, { modal: ex.modal }); } catch (e) { f = null; } return f && f.acc && tries.some(t => f.acc.some(a => normalize(a) === normalize(t))); };
  for (const p of VX_PERSONS.concat(VX_FR ? ["elle", "elles"] : ["Sie"])) if (p !== ex.p && hit(ex.kind, p)) {
    const pron = VX_FR ? p : vxPronText({ ...ex, p, form: vxForm(ex.x, ex.kind, p, { modal: ex.modal }) }).replace(/[()]/g, "");
    return `the ${pron} form`;
  }
  for (const k of VX_OTHER_KINDS) { const t = VX_KIND_TENSE[k]; if (t && t !== ex.tense && hit(k, ex.p)) return `the ${VX_TENSE_LABEL[t] || ""}`; }
  return `another form of ${ex.x.inf}`;
}
// Every form of a verb, any person, any tense (umlauts ignored).
const _vxOwnForms = new Map();
function vxOwnForms(x) {
  let o = _vxOwnForms.get(x.inf);
  if (!o) {
    o = { norm: new Set(), exact: new Set() };
    for (const k of Object.keys(VX_KIND_TENSE)) for (const p of VX_PERSONS.concat(VX_FR ? ["elle", "elles"] : ["Sie"]))
      for (const modal of k === "pvmod" ? Object.keys(VX_PV_MODALS) : [""]) {
        let f = null;
        try { f = vxForm(x, k, p, { modal }); } catch (e) { f = null; }
        if (f && f.acc) f.acc.forEach(a => {
          o.norm.add(normalize(a)); o.exact.add(String(a).toLowerCase().normalize("NFC"));
          // Without its separable prefix too (fährt for fährt ab): a game may show the prefix.
          const w = String(a).split(" "), pre = x.inf.replace(/^sich /, "");
          if (w.length > 1 && pre.startsWith(w[w.length - 1].toLowerCase()) && w[w.length - 1].length < pre.length) o.norm.add(normalize(w.slice(0, -1).join(" ")));
        });
      }
    _vxOwnForms.set(x.inf, o);
  }
  return o;
}
function vxIsOwnForm(x, typed) { return !!x && !!x.inf && vxOwnForms(x).norm.has(normalize(typed)); }

// ── THE UMLAUT CHOICE (untimed) ───────────────
// Spelt right but for its umlauts (fahrt for fährt, fährt for fahrt, faehrt
// for fahrt), on a verb whose umlaut changes the form (fahrt / fährt, hatte
// / hätte, konnte / könnte): untimed, that is asked — 1 or 2, the right
// spelling or the one typed — instead of forgiven. Picking right is right.
// Verbs that keep their umlaut in every form (hören, üben), and timed
// games, still forgive it. German only.
const vxUmlKey = s => String(s || "").toLowerCase().normalize("NFC").replace(/ä/g, "a").replace(/ö/g, "o").replace(/ü/g, "u").replace(/\s+/g, " ").trim();
const vxUmlSpelt = s => String(s || "").toLowerCase().normalize("NFC").replace(/ae/g, "ä").replace(/oe/g, "ö").replace(/ue/g, "ü");
// The words of a verb's forms by their umlaut-free spelling: its own
// (fährt, fahrt) and the auxiliaries' (hatte, hätte, wurde, würde).
const _vxUmlWords = new Map();
function vxUmlWords(x) {
  let o = _vxUmlWords.get(x.inf);
  if (!o) {
    o = { main: new Map(), aux: new Map(), alt: false };
    for (const f of vxOwnForms(x).exact) for (const w of f.split(" ")) {
      const m = VX_EXTRA_BAN.test(normalize(w)) ? o.aux : o.main, k = vxUmlKey(w);
      if (!m.has(k)) m.set(k, new Set());
      m.get(k).add(w);
    }
    // Its stem alternates when two of its own words differ only by an umlaut.
    for (const set of o.main.values()) if (set.size > 1) { o.alt = true; break; }
    _vxUmlWords.set(x.inf, o);
  }
  return o;
}
function vxUmlautAlternates(x) { return !VX_FR && !!x && !!x.inf && vxUmlWords(x).alt; }
// Does a word typed with its umlaut off matter? The verb's own word: when
// its stem alternates (fahren yes; erhöhen, hören no), at the part that
// changes — never its separable particle (an, über). An auxiliary or modal: hatte / hätte, wurde /
// würde, konnte / könnte, musst / müsst, durfte / dürfte, mochte /
// möchte, warst / wärst — always (another tense or person).
const VX_UML_AUX = /^(hatt|wurd|konn|muss|durf|moch|war)/;
function vxUmlWordMatters(x, answerWord, typedWord) {
  if (VX_EXTRA_BAN.test(normalize(answerWord))) return VX_UML_AUX.test(vxUmlKey(answerWord));
  const inf = x.inf.replace(/^sich /, "").toLowerCase();
  if (answerWord.length < inf.length && inf.startsWith(answerWord)) return false; // the particle (an, über)
  if (!vxUmlWords(x).alt) return false;
  // An umlaut the infinitive has in the same place never changes (the ü
  // of überfahren); one it doesn't, or one added, is the alternation.
  for (let i = 0; i < answerWord.length; i++)
    if (answerWord[i] !== typedWord[i] && !(/[äöü]/.test(answerWord[i]) && inf[i] === answerWord[i])) return true;
  return false;
}
// → { right, other } (the two spellings to choose from) or null.
function vxUmlautChoice(val, acc, x, cmd = false) {
  if (VX_FR || !x || !x.inf || !acc || !acc.length) return null;
  const tries = vxGradeTries(val, cmd).slice().reverse(); // the pronoun-less try first
  if (!tries.length || tries.some(t => acc.some(a => vxEq(a, t)))) return null; // right as typed (ae for ä too)
  for (const t of tries) for (const a of acc) {
    const typed = [t, vxUmlSpelt(t)].find(v => vxUmlKey(v) === vxUmlKey(a));
    if (!typed) continue;
    const tw = vxUmlKey(typed) === vxUmlKey(a) ? String(typed).toLowerCase().normalize("NFC").replace(/\s+/g, " ").trim().split(" ") : [];
    const aw = String(a).toLowerCase().normalize("NFC").split(" ");
    if (tw.length !== aw.length || !aw.some((w, i) => w !== tw[i] && vxUmlWordMatters(x, w, tw[i]))) continue;
    // Show the other spelling as the verb's own form when it is one (faehrt → fährt).
    const own = [...vxOwnForms(x).exact].find(f => vxEq(f, typed)) || String(t).trim();
    if (vxEq(a, own) || vxUmlKey(own) !== vxUmlKey(a)) continue;
    return { right: a, other: own };
  }
  return null;
}
// A right form with a few words of context added (er ist zu Fuß gegangen,
// the "(on foot)" of the meaning in German): still right — every word of
// the form there, in order, starting with its first, and nothing that
// changes it: nicht / kein, a pronoun, an auxiliary or modal, or any form
// of the verb itself (ging gegangen). German only.
const VX_EXTRA_BAN = /^(nicht|nichts|nie|niemals|kein\w*|ich|du|er|sie|es|wir|ihr|man|mich|dich|sich|mir|dir|uns|euch|bin|bist|ist|sind|seid|sei|seist|seien|seiet|sein|war|warst|waren|wart|ware|warest|waret|gewesen|hab\w*|hast|hat|hatt\w*|gehabt|wird|wirst|werd\w*|wurd\w*|worden|geworden|kann\w*|konn\w*|muss\w*|must\w*|will\w*|woll\w*|soll\w*|darf\w*|durf\w*|mag|magst|moch\w*|lass\w*|lies\w*)$/;
const _vxVerbWords = new Map();
function vxVerbWords(x) {
  if (!x || !x.inf) return new Set();
  let set = _vxVerbWords.get(x.inf);
  if (set) return set;
  set = new Set(normalize(x.inf).split(" "));
  for (const k of VX_OTHER_KINDS.concat(["k2s", "sc", "p2"])) for (const p of VX_PERSONS.concat(["Sie"])) {
    let f = null;
    try { f = vxForm(x, k, p); } catch (e) { f = null; }
    if (f && f.acc) f.acc.forEach(a => normalize(a).split(" ").forEach(w => set.add(w)));
  }
  _vxVerbWords.set(x.inf, set);
  return set;
}
function vxExtraOk(tries, acc, x) {
  if (VX_FR) return false;
  const words = s => normalize(String(s || "")).split(" ").filter(Boolean);
  const same = (a, t) => vxEq(a, t) || normalize(a) === normalize(t);
  const own = vxVerbWords(x);
  return tries.some(t => {
    const tw = words(t);
    return acc.some(a => {
      const aw = words(a);
      if (!aw.length || tw.length <= aw.length || tw.length - aw.length > 4 || !same(aw[0], tw[0])) return false;
      let j = 0;
      const extra = [];
      for (const w of tw) { if (j < aw.length && same(aw[j], w)) j++; else extra.push(w); }
      return j === aw.length && !extra.some(w => VX_EXTRA_BAN.test(w) || own.has(w) || aw.some(y => same(y, w)));
    });
  });
}
// Right only with the extra words left out (the feedback says so)?
function vxExtraOnly(val, ex) {
  const tries = vxGradeTries(val, vxIsCommand(ex)), acc = ex.form.acc;
  return !tries.some(t => acc.some(a => vxEq(a, t))) && !tries.some(t => vxUmlautSlip(acc, t)) && vxExtraOk(tries, acc, ex.x);
}
// A wrong answer that is the same verb and person, right, in another
// tense (er kommt where the Perfekt was asked): that tense, or null.
// Today then names both tenses and gives one more try. Exact forms only
// (umlauts forgiven as always) — a near miss of another tense is a miss.
const VX_OTHER_KINDS = VX_FR ? ["pr", "im", "fu", "co", "pc", "pq", "cp", "sj", "ip", "fp", "vd"] : ["pr", "pt", "pf", "pq", "fu", "k2w", "k2o", "im"];
// exact: spelt exactly (umlauts too) — for an answer that only passed
// because a missing umlaut is forgiven: ich hätte for ich hatte is the
// Konjunktiv II, not a slip.
function vxOtherTense(val, ex, exact = false) {
  if (!ex || !ex.x || !String(val || "").trim()) return null;
  // Its own Konjunktiv II asked (käme), würde + infinitive given: right
  // German, but not what this card is for — "k2w", one more try.
  if (ex.kind === "k2s" && !exact) {
    const f = vxForm(ex.x, "k2w", ex.p), acc = f ? f.acc.filter(a => /^würd/.test(a)) : [];
    if (acc.length && vxGrade(val, { kind: "k2w", x: ex.x, p: ex.p, form: { ...f, acc } }) === true) return "k2w";
  }
  for (const k of VX_OTHER_KINDS) {
    const t = VX_KIND_TENSE[k];
    if (!t || t === ex.tense) continue;
    // German: the Sie of a command is the sie (they) form of the other tenses.
    const p = !VX_FR && ex.p === "Sie" && !/^im/.test(k) ? "sie" : ex.p;
    let f = null;
    try { f = vxForm(ex.x, k, p); } catch (e) { f = null; }
    if (!f || !f.acc || !f.acc.length) continue;
    // The asked form itself is never "another tense" (Präsens wir = Imperativ wir…).
    if (f.acc.some(a => ex.form.acc.some(b => vxEq(a, b)))) continue;
    const oex = { kind: k, x: ex.x, p, form: f };
    if (exact ? vxGradeTries(val, vxIsCommand(oex)).some(tr => f.acc.some(a => vxEq(a, tr))) : vxGrade(val, oex) === true) return t;
  }
  return null;
}
// Right only once the umlauts are ignored (fahrst for fährst)?
function vxUmlautOnly(val, answers, imp = false) {
  const tries = vxGradeTries(val, imp);
  return !tries.some(t => answers.some(a => vxEq(a, t))) && tries.some(t => vxUmlautSlip(answers, t));
}
// The mistake type, for the learning log and the usage report.
function vxMistakeType(given, ex) {
  if (VX_FR) return VXF.mistake(given, ex);
  const g = normalize(String(given || ""));
  if (!g) return "blank";
  const engineT = { pr: 1, pt: 1, pf: 1, pq: 1, fu: 1, im: 1 }[ex.kind] ? ex.kind : ex.kind === "p2" ? "pf" : ex.kind === "k2w" || ex.kind === "k2o" || ex.kind === "k2s" ? "k2" : null;
  if (engineT && typeof classifyVerbMistake === "function") {
    const t = classifyVerbMistake(given, ex.x.F, engineT, ex.p === "Sie" ? "Sie" : ex.p);
    if (t && t !== "umlaut") return t;
  }
  if (ex.kind === "sc") {
    // The plain stem where the vowel should change (fahrt for fährt).
    const plain = normalize(ex.x.F.pr.wir.replace(/en$/, ex.p === "du" ? "st" : "t"));
    if (g.split(/\s+/)[0] === plain) return "verbform";
  }
  return ex.form.acc.some(a => levenshtein(normalize(a), g) <= 2) ? "spelling" : "verbform";
}

// ── TODAY: WHAT THE VERB TRACK ADDS ───────────
let _vxQueueCache = null;
// With a finish date the verb work is paced like the words: everything
// started by the plan's margin (PLAN.LAG) before the date, so it has time
// to climb to Known. A tense's items and forms can only start once it
// opens, so the pace is the one the busiest stretch needs: for each day
// a tense opens, what opens from then on over the days left after it.
function vxQuotas(scan) {
  vxRollDay();
  const V = S.verb;
  let items = VX_DEFAULT.items, cells = VX_DEFAULT.cells;
  if (pathDeadlineOn()) {
    const need = vxPaceNeeded(scan);
    items = need.items ? Math.max(VX_ITEM_PACE[0], Math.min(VX_ITEM_PACE[1], need.items)) : 0;
    cells = need.cells ? Math.max(VX_CELL_PACE[0], Math.min(VX_CELL_PACE[1], need.cells)) : 0;
  }
  return { items, cells, itemsLeft: Math.max(0, items - V.ni), cellsLeft: Math.max(0, cells - V.nc), sheetsLeft: Math.max(0, VX_SHEETS_PER_DAY - vxSheetsUsed()) };
}
// The day (from today) each tense can start its work: 0 when open; a
// lesson waits for its sheets (two a day); a locked one for its Path
// anchor (vxUnitEta) and the tenses it needs.
let _vxOpenDays = null, _vxOpenDaysAt = 0;
function vxUnitOpenDays(scan) {
  if (_vxOpenDays && Date.now() - _vxOpenDaysAt < 2000) return _vxOpenDays;
  scan = scan || pathScan();
  const today = studyToday(), out = {};
  VX_UNITS.forEach(u => {
    const st = vxUnitState(u.id);
    if (st >= 2) { out[u.id] = 0; return; }
    const sheets = vxSheetIds(u.id).filter(id => !vxSheetPassed(id)).length;
    const eta = st === 1 ? null : vxUnitEta(u, scan);
    let d = (eta ? Math.max(0, daysBetween(today, eta)) : 0) + Math.ceil(sheets / VX_SHEETS_PER_DAY);
    u.req.forEach(r => { if (out[r] !== undefined) d = Math.max(d, out[r] + 1); });
    out[u.id] = d;
  });
  _vxOpenDays = out; _vxOpenDaysAt = Date.now();
  return out;
}
// New items and drills a day the finish date needs (uncapped), and
// whether the caps can keep it: { items, cells, ok, eta }.
let _vxPace = null, _vxPaceAt = 0;
function vxPaceNeeded(scan) {
  if (_vxPace && Date.now() - _vxPaceAt < 2000 && _vxPace.day === studyToday()) return _vxPace;
  _vxPace = vxPaceNeeded0(scan); _vxPace.day = studyToday(); _vxPaceAt = Date.now();
  return _vxPace;
}
function vxPaceNeeded0(scan) {
  const end = Math.max(14, pathDaysLeft() - PLAN.LAG);
  const open = vxUnitOpenDays(scan);
  const itemsBy = {}, cellsBy = {};
  vxCatalog().forEach(it => { const ws = S.words[vxKey(it.id)]; if (!ws || !ws.st) itemsBy[it.unit] = (itemsBy[it.unit] || 0) + 1; });
  vxRequiredCells().forEach(c => {
    if (vxCovHas(c.x.inf, c.t)) return;
    const u = VX_FR ? VX_TENSE_UNIT[c.t] : c.t === "pt" ? (VX_PT1_VERBS.has(c.x.F.base) && !c.x.F.sep && !c.x.F.insep ? "pt1" : "pt2") : VX_TENSE_UNIT[c.t];
    cellsBy[u] = (cellsBy[u] || 0) + 1;
  });
  const pace = by => {
    const starts = [...new Set(Object.keys(by).map(u => open[u] || 0))].sort((a, b) => a - b);
    let need = 0, eta = 0;
    starts.forEach(o => {
      const n = Object.keys(by).filter(u => (open[u] || 0) >= o).reduce((a, u) => a + by[u], 0);
      need = Math.max(need, Math.ceil(n / Math.max(7, end - o)));
    });
    return { need, total: Object.values(by).reduce((a, b) => a + b, 0) };
  };
  const I = pace(itemsBy), C = pace(cellsBy);
  // At the caps, when would the last one start?
  const lastStart = (by, cap) => { let t = 0; Object.keys(by).map(u => [open[u] || 0, by[u]]).sort((a, b) => a[0] - b[0]).forEach(([o, n]) => { t = Math.max(t, o) + Math.ceil(n / cap); }); return t; };
  const days = Math.max(lastStart(itemsBy, VX_ITEM_PACE[1]), lastStart(cellsBy, VX_CELL_PACE[1]));
  // Nothing left to start: nothing to wait for (what's started climbs
  // with its reviews, as words do once met).
  const left = I.total + C.total;
  return { items: I.need, cells: C.need, left, ok: I.need <= VX_ITEM_PACE[1] && C.need <= VX_CELL_PACE[1],
    eta: left ? addDays(studyToday(), days + (typeof KNOWN_LAG === "number" ? KNOWN_LAG : 30)) : studyToday() };
}
// The verb track's share of the Today card's numbers: reviews due (and
// of them, repairs) and new items still to come today.
function vxTodayCounts() {
  if (!vxOn()) return { due: 0, fix: 0, fresh: 0 };
  const { fix, due } = vxDueItems();
  const q = vxQuotas();
  return { due: fix.length + due.length, fix: fix.length, fresh: Math.min(q.itemsLeft, vxNewCandidates().length) };
}
// Work left on the whole journey (every verb, every unit).
function vxLeft() {
  let items = 0, cells = 0;
  vxCatalog().forEach(it => { const ws = S.words[vxKey(it.id)]; if (!ws || !ws.st) items++; });
  vxRequiredCells().forEach(c => { if (!vxCovHas(c.x.inf, c.t)) cells++; });
  return { items, cells };
}
// Items you could start today (open unit, verb past day 0), in order:
// rules first (curriculum order), then per-verb items by level and shape.
function vxNewCandidates() {
  const out = [];
  vxCatalog().forEach(it => {
    if (!vxUnitOpen(it.unit)) return;
    const ws = S.words[vxKey(it.id)];
    if (ws && ws.st) return;
    if (it.kind === "r") { if (vxRuleVerbs(it.rule).length >= 2) out.push(it); return; }
    if (vxVerbReady(it.x)) out.push(it);
  });
  const uo = id => VX_UNIT[id].n;
  return out.sort((a, b) => (a.kind === "r" ? 0 : 1) - (b.kind === "r" ? 0 : 1) || uo(a.unit) - uo(b.unit) ||
    a.lv - b.lv || a.ord - b.ord || (a.x && b.x ? (vxLemma(a.x).met || "").localeCompare(vxLemma(b.x).met || "") || a.x.i - b.x.i : a.ord - b.ord));
}
function vxDueItems(now = Date.now()) {
  const fix = [], due = [];
  vxCatalog().forEach(it => {
    const ws = S.words[vxKey(it.id)];
    if (!ws || !ws.st) return;
    if (ws.rp || ws.fl || ws.lrn) fix.push({ it, ws });
    else if (ws.dueAt && ws.dueAt <= now) due.push({ it, ws });
  });
  fix.sort((a, b) => (b.ws.rp || 0) - (a.ws.rp || 0) || (a.ws.dueAt || 0) - (b.ws.dueAt || 0));
  due.sort((a, b) => a.ws.st - b.ws.st || a.ws.dueAt - b.ws.dueAt);
  return { fix, due };
}
function vxOpenCells(n) {
  const out = [];
  for (const c of vxRequiredCells()) {
    if (out.length >= n) break;
    if (vxCovHas(c.x.inf, c.t) || !vxCellOpen(c) || !vxVerbReady(c.x)) continue;
    out.push(c);
  }
  return out;
}
// The day's numbers for the plan (made once in the morning).
function vxPlanNumbers(scan) {
  if (!vxOn()) return null;
  vxUnitsTick(true);
  const q = vxQuotas(scan);
  const { fix, due } = vxDueItems();
  const items = Math.min(q.items, vxNewCandidates().length);
  const cells = Math.min(q.cells, vxOpenCells(q.cells).length);
  const pend = vxPendingSheets().slice(0, VX_SHEETS_PER_DAY);
  // Each sheet asks its own number of questions (grammar-quiz.js).
  const sheetQ = pend.reduce((n, id) => n + (typeof gqSheetSize === "function" ? gqSheetSize(vxSheet(id)) : 4), 0);
  return { due: fix.length + due.length, items, cells, sheets: pend.length, sheetQ };
}
// Right answers the verb track adds to the day's target.
function vxPlanTarget(vx) {
  if (!vx) return 0;
  return Math.round(vx.items * 2 + vx.cells * 1.1 + (vx.sheetQ != null ? vx.sheetQ : vx.sheets * 4));
}
// Items for one Today session: { sheets:[ids], learn:[ex], items:[ex] }.
// counted items stay within `room`. Sheets first, then fixes and due
// items, then new items (each: an intro card + a typed check), then
// coverage drills.
function vxSessionPlan(room) {
  if (!vxOn()) return { sheets: [], items: [], learns: [] };
  vxUnitsTick(false);
  const q = vxQuotas();
  const sheets = vxSheetsToday();
  const items = [], learns = [];
  const { fix, due } = vxDueItems();
  let avoid = "";
  [...fix, ...due].forEach(({ it }) => {
    if (items.length >= room) return;
    const ex = vxMakeExercise(it, avoid);
    if (ex) { items.push(ex); avoid = ex.x.inf; }
  });
  const fresh = vxNewCandidates().slice(0, Math.min(q.itemsLeft, Math.max(0, room - items.length)));
  fresh.forEach(it => {
    const ex = vxMakeExercise(it, avoid);
    if (!ex) return;
    learns.push(ex); items.push({ ...ex, fresh: true }); avoid = ex.x.inf;
  });
  const cells = vxOpenCells(Math.min(q.cellsLeft, Math.max(0, room - items.length)));
  cells.forEach(c => { const ex = vxCellExercise(c); if (ex) items.push(ex); });
  return { sheets, items, learns };
}

// ── ANSWERS ───────────────────────────────────
// Bookkeeping for one answered verb exercise in Today. ok: true / false.
// Returns the srsReview result (null for a coverage drill).
function vxRecordAnswer(ex, ok, opts = {}) {
  migrateVerb();
  vxRollDay();
  const V = S.verb;
  let res = null;
  // A drill uses up today's quota, right or wrong (a miss comes back in
  // the repair round, or tomorrow) — its repair-round try doesn't.
  if (ex.cell && !opts.repair) V.nc++;
  if (ok === true && !opts.hint) vxCovSet(ex.x.inf, ex.tense);
  if (ex.cell && ok !== true) {
    // A missed drill: the rule behind it gets a typed check.
    const rk = vxCellRuleItem(ex);
    const ws = rk && S.words[vxKey(rk)];
    if (ws && ws.st && !ws.lrn && !ws.rp) { srsReview(ws, false, "recognition"); }
  }
  const noteT = ex.kind === "sc" ? "pr" : ex.kind;
  if (typeof learnNoteVerb === "function" && (VX_FR ? VXF.logKinds : ["pr", "pt", "pf", "pq", "fu", "im"]).includes(noteT))
    learnNoteVerb(ex.x.F, noteT, ex.p, ok === true, opts.given || "", ex.form.ans);
  else if (ok === false && typeof _learnDay === "function") _learnDay("mk", vxMistakeType(opts.given, ex));
  if (typeof logEvent === "function") logEvent("vx_ans", { k: ex.item ? ex.item.split(":")[0] : "cell", t: ex.tense, ok: ok === true });
  vxMirror();
  return res;
}
// The rule item a coverage drill exercises (for a miss to flag).
function vxCellRuleItem(ex) {
  if (VX_FR) return VXF.cellRuleItem(ex);
  const x = ex.x, F = x.F;
  if (ex.tense === "pr") return x.k.irregular ? (S.words[vxKey("ir:" + x.inf)] ? "ir:" + x.inf : null) : x.k.stem ? (S.words[vxKey("sc:" + x.inf)] ? "sc:" + x.inf : null) : F.sep ? "r:pr-sep" : F.refl ? "r:pr-refl" : x.k.glue ? "r:pr-glue" : "r:pr-end";
  if (ex.tense === "pf") return S.words[vxKey("p2:" + x.inf)] ? "p2:" + x.inf : F.sep || F.insep || x.k.ieren ? "r:pf-prefix" : "r:pf-ge";
  if (ex.tense === "pt") return S.words[vxKey("p1:" + x.inf)] ? "p1:" + x.inf : S.words[vxKey("pt:" + x.inf)] ? "pt:" + x.inf : x.k.ptWeak ? "r:pt-weak" : "r:pt-strong";
  if (ex.tense === "fu") return "r:fu";
  if (ex.tense === "pq") return "r:pq";
  return null;
}
function vxIntroduce(ex) {
  const ws = getWS(VX_DECK, ex.item);
  const fresh = introduceWord(ws);
  if (fresh) {
    vxRollDay(); S.verb.ni++;
    if (typeof logEvent === "function") logEvent("vx_intro", { id: ex.item });
  }
  return fresh;
}

// ── GAMES GIVE CREDIT ─────────────────────────
// A form answered in a verb game. Typed (Slots) = recall: a right one on
// a due item counts like a review and fills the ledger; a wrong one
// flags the item for a typed check. Read (Thread) = recognition credit.
function vxGameHit(ctx, inf, tense, person, ok, kind) {
  if (!vxOn() || !ctx) return;
  (ctx.vxHits || (ctx.vxHits = [])).push({ inf, tense, person, ok, kind });
}
function vxItemsForForm(x, tense, person) {
  if (VX_FR) return VXF.itemsForForm(x, tense, person);
  const out = [];
  if (tense === "pr" && (person === "du" || person === "er") && S.words[vxKey("sc:" + x.inf)]) out.push("sc:" + x.inf);
  if (tense === "pf" && S.words[vxKey("p2:" + x.inf)]) out.push("p2:" + x.inf);
  if (tense === "pt" && (person === "er" || person === "ich") && S.words[vxKey("pt:" + x.inf)]) out.push("pt:" + x.inf);
  if (tense === "im" && person === "du" && S.words[vxKey("im:" + x.inf)]) out.push("im:" + x.inf);
  if (tense === "pr" && S.words[vxKey("ir:" + x.inf)]) out.push("ir:" + x.inf);
  if (tense === "pt" && S.words[vxKey("p1:" + x.inf)]) out.push("p1:" + x.inf);
  VX_RULES.forEach(r => {
    const kt = r.kind === "k2w" || r.kind === "k2o" ? "k2" : r.kind === "prsep" || r.kind === "prrefl" ? null : r.kind;
    if (kt === tense && r.verbs(x) && vxRulePersons(r, x).includes(person) && S.words[vxKey("r:" + r.id)]) out.push("r:" + r.id);
  });
  return out;
}
function vxApplyGameHits(ctx) {
  const out = { up: 0, flagged: 0 };
  if (!vxOn() || !ctx || !ctx.vxHits || !ctx.vxHits.length) return out;
  const seen = new Map();
  ctx.vxHits.forEach(h => {
    const x = vxVerb(h.inf);
    if (!x) return;
    if (h.ok && h.kind === "recall") vxCovSet(x.inf, h.tense);
    vxItemsForForm(x, h.tense, h.person).forEach(id => {
      const prev = seen.get(id);
      if (!prev) seen.set(id, { ok: h.ok, kind: h.kind });
      else { prev.ok = prev.ok && h.ok; if (h.kind === "recall") prev.kind = "recall"; }
    });
  });
  seen.forEach((h, id) => {
    const ws = S.words[vxKey(id)];
    if (!ws || !ws.st) return;
    if (!h.ok) { if (h.kind === "recall") { const r = srsReview(ws, false, "recognition"); if (r.events.includes("flagged")) out.flagged++; } return; }
    ws.lastAnsweredAt = Date.now();
    const r = srsReview(ws, true, h.kind === "recall" ? "recall" : "recognition");
    if (r.promoted) out.up++;
  });
  vxMirror();
  return out;
}

// A deck card that asks a verb form ("sein — du ___", "gegangen"),
// answered right: that verb's cell in the ledger is done.
let _vxRefIdx = null;
function vxCardRight(w) {
  if (!w || !vxOn() || w.deckId === VX_DECK) return;
  if (!_vxRefIdx) {
    _vxRefIdx = new Map();
    vxVerbs().forEach(x => vxRefs(x).forEach(r => _vxRefIdx.set(r.deckId + "_" + r.idx, { inf: x.inf, t: r.tense === "p2" ? "pf" : r.tense })));
  }
  const r = _vxRefIdx.get(w.deckId + "_" + w.idx);
  if (r && vxCovSet(r.inf, r.t)) vxMirror();
}
// Timeline Drop before Präteritum II: a Präteritum sentence only when
// its verb is one of Präteritum I (war, hatte, konnte, wurde…).
let _vxPt1Forms = null;
function vxPt1Sentence(r) {
  if (!vxOn() || VX_FR || vxUnitOpen("pt2")) return true;
  if (!vxUnitOpen("pt1")) return false;
  if (!_vxPt1Forms) {
    _vxPt1Forms = new Set();
    VX_PT1_VERBS.forEach(inf => { const v = verbBank().byInf.get(inf); if (v) Object.values(v.F.pt || {}).forEach(f => _vxPt1Forms.add(String(f).toLowerCase())); });
    ["wurde", "wurdest", "wurden", "wurdet"].forEach(f => _vxPt1Forms.add(f));
  }
  const toks = (r.verb || []).map(i => String(r.tokens[i] || "").toLowerCase());
  return toks.length > 0 && toks.every(t => _vxPt1Forms.has(t));
}

// ── THE SWITCH ────────────────────────────────
// What switching on would do, worked out on the live state without
// changing it: { before: {pace, unmet}, after: {pace, unmet, items,
// cells}, retired: {deck: n}, seeds, units, eta }.
function vxPreview() {
  const wasOn = S.verb.on;
  const scanB = pathScan(true);
  const before = { pace: pathDeadlineOn() ? pathPace(scanB) : S.path.newPerDay, unmet: pathUnmet(scanB) };
  // Simulate on a copy: on, units, seeds.
  const snapWords = S.words, snapVerb = S.verb;
  S.words = Object.assign({}, snapWords);
  S.verb = JSON.parse(JSON.stringify(snapVerb));
  let after, retired = {}, seeds, units;
  _vxDry = true;
  try {
    S.verb.on = studyToday();
    const pos0 = vxPathPos(pathScan(true));
    vxSwitchUnits(pos0).forEach(u => { S.verb.tu[u] = Math.max(S.verb.tu[u] || 0, 2); });
    vxCatalogReset(); invalidatePathScan();
    seeds = vxSeed(true);
    vxUnitsTick(true);
    const scan = pathScan(true);
    after = { pace: pathDeadlineOn() ? pathPace(scan) : S.path.newPerDay, unmet: pathUnmet(scan), ...vxLeft() };
    vxRetireMap().forEach((c, k) => { const d = k.slice(0, k.lastIndexOf("_")), i = +k.slice(k.lastIndexOf("_") + 1); if (vxRetired(d, i)) retired[d] = (retired[d] || 0) + 1; });
    units = VX_UNITS.map(u => ({ id: u.id, st: vxUnitState(u.id) }));
    after.q = vxQuotas(scan);
    after.status = pathDeadlineStatus(scan);
  } finally {
    _vxDry = false;
    S.words = snapWords; S.verb = snapVerb; S.verb.on = wasOn;
    vxCatalogReset(); invalidatePathScan();
  }
  return { before, after, retired, seeds, units };
}
// Starting stages for the new items, from what you've already shown:
//   rule items of the open tenses — the median stage of the cards that
//   asked those forms (≥3 of them), capped at 🌿 4 unless Known;
//   per-verb items — the verb's own form cards, or right answers in the
//   conjugation game; coverage cells — any form you got right before.
// dry: count only. Returns { rules, items, cells }.
// upgrade: a later re-run may also lift an item you started since but
// never missed, when your cards say you know it better.
function vxSeed(dry = false, upgrade = false) {
  const now = Date.now(), n = { rules: 0, items: 0, cells: 0 };
  const stOf = (d, i) => { const ws = S.words[d + "_" + i]; return ws && ws.st && !ws.rt ? ws.st : 0; };
  const med = a => { const s = a.slice().sort((x, y) => x - y); return s[Math.floor((s.length - 1) / 2)]; };
  const cap = st => st >= STAGE_KNOWN ? st : Math.min(st, 4);
  const place = (id, st) => {
    if (!st) return;
    const ws = getWS(VX_DECK, id);
    if (ws.st && !(upgrade && ws.st < st && !ws.wrong && !ws.rp && !ws.fl)) return false;
    ws.st = st; ws.pk = Math.max(ws.pk || 0, st); ws.sAt = now; ws.seed = 1;
    delete ws.lrn;
    const spread = 1 + hashString(id) % Math.max(1, Math.round(STAGE_DAYS[st] || 1));
    ws.dueAt = studyDayStart(Math.min(spread, STAGE_DAYS[st] || 1), now);
    if (st >= STAGE_KNOWN) ws.mastered = true;
    return true;
  };
  // Evidence per (inf, tense) from your met cards.
  const ev = new Map();
  vxVerbs().forEach(x => vxRefs(x).forEach(r => {
    const st = stOf(r.deckId, r.idx);
    if (!st) return;
    const t = r.tense === "p2" ? "pf" : r.tense;
    const k = x.inf + "|" + t;
    if (!ev.has(k)) ev.set(k, []);
    ev.get(k).push({ st, p: r.person });
  }));
  const learnT = inf => ((S.learn && S.learn.verbs && S.learn.verbs[inf]) || {}).t || {};
  // Cells: a form you got right before (a card you've met, or a right
  // answer in the conjugation game).
  vxVerbs().forEach(x => VX_COV.forEach(t => {
    const hit = (ev.get(x.inf + "|" + t) || []).length || ((learnT(x.inf)[t] || [0])[0] > 0);
    if (hit && !vxCovHas(x.inf, t)) { n.cells++; vxCovSet(x.inf, t); }
  }));
  // Rules of the open tenses: the cards that asked those forms, or else
  // the conjugation game (3+ right at 70%+ → 🌱 3, checked soon).
  VX_RULES.forEach(r => {
    if (!vxUnitOpen(r.unit)) return;
    const t = VX_KIND_TENSE[r.kind];
    const sts = [];
    let ok = 0, bad = 0;
    const counts = r.evid || ((x, p) => r.verbs(x) && (r.persons(x).includes(p) || t === "pf"));
    vxVerbs().forEach(x => {
      (ev.get(x.inf + "|" + t) || []).forEach(e => { if (counts(x, e.p)) sts.push(e.st); });
      if (!r.verbs(x)) return;
      const g = learnT(x.inf)[t]; if (g) { ok += g[0] || 0; bad += g[1] || 0; }
    });
    if (sts.length >= 3) { if (place("r:" + r.id, cap(med(sts)))) n.rules++; }
    else if (ok >= 3 && ok / (ok + bad) >= 0.7) { if (place("r:" + r.id, 3)) n.rules++; }
  });
  // Per-verb items: their own evidence.
  vxCatalog().forEach(it => {
    if (it.kind === "r") return;
    const x = it.x, t = VX_ITEM_KINDS[it.kind].tense;
    const sts = (ev.get(x.inf + "|" + t) || []).map(e => e.st);
    const g = (learnT(x.inf)[t] || [0, 0]);
    let st = sts.length ? cap(med(sts)) : g[0] >= 2 && g[0] > g[1] ? 2 : 0;
    if (st && place(it.id, st)) n.items++;
  });
  return n;
}
// Tenses you've already been using when you switch: Präsens (and Perfekt
// once A1 is well under way) — in French Présent, then Futur proche and
// Passé composé the same way.
function vxSwitchUnits(pos) {
  if (VX_FR) return VXF.switchOpen(pos);
  return ["pr", ...(pos >= vxAnchorPos(VX_UNIT.pf) + 0.25 ? ["pf"] : [])];
}
function vxSwitchOn() {
  migrateVerb();
  if (S.verb.on) return;
  const today = studyToday();
  S.verb.on = today; S.verb.onAt = Date.now();
  vxCatalogReset();
  // Tenses you've already been using: Präsens (and Perfekt once A1 is
  // well under way) count as practising — their sheets are there to read.
  const pos = vxPathPos(pathScan(true));
  vxSwitchUnits(pos).forEach(u => { S.verb.tu[u] = Math.max(S.verb.tu[u] || 0, 2); });
  const seed = vxSeed(false);
  S.verb.seedV = VX_SEED_V;
  S.verb.seed = { on: today, ...seed, pos: Math.round(pos * 100) / 100 };
  vxUnitsTick(true);
  vxMirror();
  // Achievements: the new ladders start where you are, quietly.
  if (S.ach && typeof ACHIEVEMENTS !== "undefined") ACHIEVEMENTS.filter(a => a.id.startsWith("vx_")).forEach(a => {
    let v = 0; try { v = a.value(); } catch (e) {}
    const lvl = a.tiers.filter(t => v >= t).length;
    if (lvl > (S.ach[a.id] || 0)) S.ach[a.id] = lvl;
  });
  invalidatePathScan();
  logEvent("vx_switch", { on: true, ...seed, pos: S.verb.seed.pos });
  saveState();
}
// Back to the old way: the verb items and shadows go, your cards stay.
function vxSwitchOff() {
  if (!S.verb || !S.verb.on) return;
  Object.keys(S.words).forEach(k => {
    const ws = S.words[k];
    if (k.startsWith(VX_DECK + "_")) delete S.words[k];
    // A card you had met: exactly as it was when the track took it over.
    else if (ws && ws.rt && ws.rtWas) S.words[k] = Object.assign({ anki: ws.anki || freshAnki() }, ws.rtWas);
    else if (ws && ws.rt) delete S.words[k];
  });
  S.verb.on = ""; S.verb.onAt = Date.now();
  S.verb.tu = {};
  vxCatalogReset();
  invalidatePathScan();
  logEvent("vx_switch", { on: false });
  saveState();
}

// ── THE LEDGER ────────────────────────────────
// Per level: verbs complete (meaning Known · its items Known · its core
// cells done), cells done, items Known.
function vxLedger() {
  const lv = VX_LEVELS.map(id => ({ id, verbs: 0, done: 0, cells: 0, cellsDone: 0, items: 0, itemsKnown: 0 }));
  const cellsBy = new Map();
  vxRequiredCells().forEach(c => { if (!cellsBy.has(c.x)) cellsBy.set(c.x, []); cellsBy.get(c.x).push(c.t); });
  const itemsBy = new Map();
  vxCatalog().forEach(it => { if (it.x) { if (!itemsBy.has(it.x)) itemsBy.set(it.x, []); itemsBy.get(it.x).push(it.id); } });
  vxVerbs().forEach(x => {
    const L = lv[x.lv];
    L.verbs++;
    const cells = cellsBy.get(x) || [], items = itemsBy.get(x) || [];
    const cd = cells.filter(t => vxCovHas(x.inf, t)).length;
    const ik = items.filter(id => { const ws = S.words[vxKey(id)]; return ws && ws.st >= STAGE_KNOWN; }).length;
    L.cells += cells.length; L.cellsDone += cd; L.items += items.length; L.itemsKnown += ik;
    if (vxLemma(x).st >= STAGE_KNOWN && cd === cells.length && ik === items.length) L.done++;
  });
  const all = lv.reduce((a, L) => { Object.keys(a).forEach(k => { if (k !== "id") a[k] += L[k]; }); return a; },
    { id: "all", verbs: 0, done: 0, cells: 0, cellsDone: 0, items: 0, itemsKnown: 0 });
  return { levels: lv, all };
}
// One verb's row for the map: { x, lemma, cells: {t: done}, items: [{id, st}] }
function vxVerbRow(x) {
  const cells = {};
  VX_CORE.forEach(t => { if (vxHasTense(x, t)) cells[t] = vxCovHas(x.inf, t); });
  const items = vxCatalog().filter(it => it.x === x).map(it => ({ id: it.id, kind: it.kind, st: (S.words[vxKey(it.id)] || {}).st || 0 }));
  return { x, lemma: vxLemma(x), cells, items };
}

// ── LOGS ──────────────────────────────────────
function vxReportLines() {
  if (!vxAvailable()) return [];
  migrateVerb();
  if (!vxOn()) return [`Verbs: new verb system not switched on yet`];
  const L = vxLedger(), tiers = {};
  let n = 0;
  vxCatalog().forEach(it => { const ws = S.words[vxKey(it.id)]; const t = tierOfStage(ws ? ws.st || 0 : 0).id; tiers[t] = (tiers[t] || 0) + 1; n++; });
  const sheets = typeof GS_SHEETS !== "undefined" ? GS_SHEETS.length : 0;
  const passed = Object.keys(S.verb.sh || {}).filter(id => S.verb.sh[id] > 0).length;
  const q = vxQuotas();
  return [
    `Verbs (on since ${S.verb.on}): tenses ` + VX_UNITS.map(u => `${u.id} ${VX_STATE[vxUnitState(u.id)]}`).join(" · "),
    `Verb sheets passed ${passed}/${sheets} · verb items ${n}: ` + TIERS.map(t => `${t.icon}${tiers[t.id] || 0}`).join(" ") +
      ` · ledger ${L.all.done}/${L.all.verbs} verbs complete (` + L.levels.map(l => `${l.id.toUpperCase()} ${l.done}/${l.verbs}`).join(", ") + `) · cells ${L.all.cellsDone}/${L.all.cells}` +
      ` · per day: ${q.items} new items, ${q.cells} drills`,
    ...vxMasteryLines(),
    ...(vxQuizWeakPoints(3).length ? [`Quiz points to work on: ` + vxQuizWeakPoints(3).map(w => `${w.sid} ${w.at} (${w.missed}✗/${w.right}✓)`).join(" · ")] : []),
  ];
}
// Mastery quizzes taken (optional): mastered, or the best score so far.
function vxMasteryLines() {
  const ma = (S.verb && S.verb.ma) || {}, taken = VX_UNITS.filter(u => ma[u.id] && ma[u.id].tries);
  if (!taken.length) return [];
  return [`Mastery quizzes: ` + taken.map(u => `${u.name} ${ma[u.id].ok ? "🏆" : `best ${ma[u.id].best}%`} (${ma[u.id].tries} tr${ma[u.id].tries > 1 ? "ies" : "y"})`).join(" · ")];
}

// For the learning log (learning-log.js): where the verb track stands,
// and what to drill — for an AI tutor.
function vxLearnLines() {
  if (!vxOn()) return [];
  const L = vxLedger(), out = [``, `## VERB TRACK (tenses in order · rules · the verb ledger)`];
  out.push(`Tenses: ` + VX_UNITS.map(u => `${u.name} ${["🔒", "📖", "🔁", "✅"][vxUnitState(u.id)]}`).join(" · ") + `  (🔒 not taught yet — please don't use these tenses with me · 📖 being taught · 🔁 practising · ✅ solid)`);
  const passed = GS_SHEETS.filter(sh => vxSheetPassed(sh.id)).map(sh => `${sh.id} ${S.verb.sh[sh.id]}%`);
  if (passed.length) out.push(`Sheets passed (first-try quiz score): ${passed.join(" · ")}`);
  const weakPts = vxQuizWeakPoints();
  if (weakPts.length) out.push(`Grammar points I miss in quizzes (missed/right first try): ` + weakPts.map(w => `${w.title} — ${typeof gqPointName === "function" ? gqPointName(w.at, true) : w.at}${w.text ? ` (“${w.text.slice(0, 90)}”)` : ""} ${w.missed}/${w.right}`).join(" · "));
  out.push(...vxMasteryLines());
  const rules = VX_RULES.map(r => { const ws = S.words[vxKey("r:" + r.id)]; return ws && ws.st ? `${r.title} ${tierOfStage(ws.st).icon}${ws.rp ? "🩹" : ws.fl ? "⚠️" : ""}${(ws.k || 1) < EASE.HARD_K ? " (hard for me)" : ""}` : ""; }).filter(Boolean);
  if (rules.length) out.push(`Rules in my reviews: ${rules.join(" · ")}`);
  const weak = vxCatalog().filter(it => it.x).map(it => ({ it, ws: S.words[vxKey(it.id)] })).filter(o => o.ws && o.ws.st && (o.ws.rp || o.ws.fl || (o.ws.k || 1) < EASE.HARD_K || (o.ws.wrong || 0) >= 2))
    .map(o => { const d = VX_ITEM_KINDS[o.it.kind], p = d.persons ? d.persons(o.it.x)[0] : o.it.kind === "sc" || o.it.kind === "im" ? "du" : "er", f = vxForm(o.it.x, d.form, p);
      return `${o.it.x.inf} (${d.title}: ${f ? f.ans : "—"})`; });
  if (weak.length) out.push(`Irregular verb forms I struggle with: ${weak.join(" · ")}`);
  out.push(`Verb ledger: ${L.all.done}/${L.all.verbs} verbs complete (meaning Known + irregular forms Known + ${VX_CORE_LABEL.replace(/ · /g, "/")} produced) — ` +
    L.levels.map(l => `${l.id.toUpperCase()} ${l.done}/${l.verbs} (forms ${l.cellsDone}/${l.cells})`).join(" · "));
  return out;
}

// ── ACHIEVEMENTS ──────────────────────────────
if (typeof ACHIEVEMENTS !== "undefined" && (VX_FR ? typeof GR_FR !== "undefined" && GR_FR : typeof GR_DE !== "undefined" && GR_DE)) {
  ACHIEVEMENTS.push(
    { id: "vx_tenses", icon: "🧭", name: "Tense Explorer", category: "Grammar",
      desc: t => `Open ${t} of the ${VX_UNITS.length} ${VX_FR ? "French" : "German"} tenses (every sheet of each passed)`,
      tiers: VX_UNITS.map((u, i) => i + 1),
      value: () => vxOn() ? VX_UNITS.filter(u => vxUnitOpen(u.id)).length : 0 },
    { id: "vx_ledger", exact: true, icon: "📒", name: "Verb Ledger", category: "Grammar",
      desc: t => `Complete ${t.toLocaleString()} verbs: meaning Known, irregular forms Known, ${VX_CORE_LABEL} produced`,
      top: () => vxAvailable() ? vxVerbs().length : 1,
      value: () => vxOn() ? vxLedger().all.done : 0 },
    { id: "vx_mastery", icon: "🏆", name: "Tense Master", category: "Grammar",
      desc: t => `Pass the mastery quiz of ${t} tense${t > 1 ? "s" : ""} at 100% (optional quizzes in 📐 Grammar)`,
      tiers: VX_FR ? [1, 3, 6, 9, 12] : [1, 3, 5, 8, 10],
      value: () => VX_UNITS.filter(u => vxMastered(u.id)).length },
    { id: "vx_forms", exact: true, icon: "🧩", name: "Irregular Forms", category: "Grammar",
      desc: t => `Get ${t.toLocaleString()} irregular verb forms to 🌳 Known (${VX_FR ? "suis · fait · eu · irai" : "ging · ist gegangen · fährt · nimm! · war"})`,
      top: () => vxAvailable() ? vxCatalog().filter(it => it.kind !== "r").length : 1,
      value: () => vxOn() ? vxCatalog().filter(it => it.kind !== "r" && ((S.words[vxKey(it.id)] || {}).st || 0) >= STAGE_KNOWN).length : 0 },
    { id: "vx_cells", exact: true, icon: "📒", name: "Form Filler", category: "Grammar",
      desc: t => `Produce ${t.toLocaleString()} verb forms for your ledger (a verb in ${VX_CORE_LABEL}…)`,
      top: () => vxAvailable() ? vxRequiredCells().length : 1,
      value: () => vxOn() ? vxRequiredCells().filter(c => vxCovHas(c.x.inf, c.t)).length : 0 });
  ["vx_ledger", "vx_forms", "vx_cells"].forEach(id => {
    const a = ACHIEVEMENTS.find(x => x.id === id);
    let key = null, memo = null;
    Object.defineProperty(a, "tiers", { get() { const top = Math.round(a.top()) || 0; if (top !== key) { key = top; memo = tiersTo(top, a.curve, true); } return memo; } });
  });
}
// Ladders added after you switched on start where you are, quietly (as
// the switch does for the first ones): no burst of old levels at once.
function vxAchCatchUp() {
  if (!vxOn() || !S.ach || typeof ACHIEVEMENTS === "undefined") return;
  ACHIEVEMENTS.filter(a => (a.id === "vx_forms" || a.id === "vx_cells") && S.ach[a.id] === undefined).forEach(a => {
    let v = 0; try { v = a.value(); } catch (e) {}
    S.ach[a.id] = a.tiers.filter(t => v >= t).length;
  });
}

if (typeof module !== "undefined") module.exports = { vxForm, vxGrade, VX_RULES, VX_UNITS, VX_FR };
