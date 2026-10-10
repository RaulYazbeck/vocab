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
//        pt:<inf>   Präteritum of a strong / mixed verb (ging)
//        im:<inf>   an irregular imperative (nimm!, sei!)
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
// Nothing here runs in the French app, nor before the switch.
// ─────────────────────────────────────────────

const VX_DECK = "vx";
const VX_PASS_RE = 0.6;          // a quiz: ≥60% first try, and every question right in the end
const VX_SHEETS_PER_DAY = 2;     // new sheets brought into Today per day
const VX_SESSION_SHARE = 0.25;   // verb items take at most this share of a session
const VX_LEMMA_MIN = 2;          // a verb joins the verb track once its word is past day 0
const VX_ITEM_PACE = [1, 8];     // new verb items a day (min, max) with a finish date
const VX_CELL_PACE = [2, 20];    // coverage drills a day (min, max)
const VX_DEFAULT = { items: 3, cells: 6 }; // without a finish date

function vxAvailable() { return typeof GR_DE !== "undefined" && GR_DE && typeof verbBank === "function" && verbBank().verbs.length >= 20; }
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
//   seed  what the switch did (for the report)
function migrateVerb() {
  if (!S.verb || typeof S.verb !== "object") S.verb = {};
  const V = S.verb;
  if (typeof V.on !== "string") V.on = "";
  ["tu", "sh", "sr", "cov", "rot"].forEach(k => { if (!V[k] || typeof V[k] !== "object") V[k] = {}; });
  if (typeof V.day !== "string") V.day = "";
  ["ni", "nc", "ns"].forEach(k => { if (!(V[k] >= 0)) V[k] = 0; });
  if (vxOn()) { vxRollDay(); vxUnitsTick(true); vxMirror(); }
}
function vxRollDay() {
  const V = S.verb, today = studyToday();
  if (V.day !== today) { V.day = today; V.ni = 0; V.nc = 0; V.ns = 0; }
}

// ── VERBS ─────────────────────────────────────
// The engine's verbs with what the track needs to know about each.
const VX_LEVELS = ["a1", "a2", "b1"];
let _vxVerbs = null;
function vxVerbs() {
  if (_vxVerbs) return _vxVerbs;
  const out = [];
  verbBank().verbs.forEach(v => {
    const lv = VX_LEVELS.indexOf(v.level);
    if (lv < 0 || !v.word) return; // the track follows the A1 → B1 decks
    out.push(Object.assign(Object.create(null), { v, inf: v.inf, F: v.F, lv, level: v.level, k: vxKind(v.F) }));
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
function vxLemma(x) {
  let st = 0, met = "";
  (x.v.words && x.v.words.length ? x.v.words : [x.v.word]).forEach(w => {
    const ws = w && S.words[w.deckId + "_" + w.idx];
    if (ws && ws.st && !ws.rt) { st = Math.max(st, ws.st); if (ws.metOn && (!met || ws.metOn < met)) met = ws.metOn; }
  });
  return { st, met };
}
function vxVerbReady(x) { return vxLemma(x).st >= VX_LEMMA_MIN; }

// ── TENSE UNITS ───────────────────────────────
// anchor [level, share]: opens once your Path is that far (the share of
// that level's words met), or as soon as it's past it.
const VX_UNITS = [
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
    showCelebrateToast(VX_UNIT[id].sign, st === 2 ? `${VX_UNIT[id].name} unlocked` : `${VX_UNIT[id].name} solid`,
      st === 2 ? "It joins your reviews and the verb games" : "Every rule of it 🌳 Known");
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
// A quiz finished: score = first-try share (0–1), all = every question
// right in the end. Returns true when the sheet counts as passed.
function vxSheetResult(id, score, all, where) {
  migrateVerb();
  const V = S.verb, pct = Math.round(score * 100);
  const passed = all && score >= VX_PASS_RE - 1e-9;
  if (passed) V.sh[id] = Math.max(V.sh[id] || 0, Math.max(1, pct));
  V.sr[id] = 1;
  if (typeof logEvent === "function") logEvent("vx_sheet", { id, pct, ok: passed, where: where || "" });
  const sh = vxSheet(id);
  if (passed && sh) vxUnitsTick(false);
  if (typeof questEvent === "function" && passed) questEvent("vx_sheet", { id });
  saveState();
  return passed;
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
  if (!vxOn()) return true;
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
function vxForm(x, kind, p, opt = {}) {
  const F = x.F, refl = F.refl ? REFL[p] || "sich" : "";
  const out = (ans, acc = [], tail = "") => {
    const all = [ans, ...acc].map(s => s.replace(/\s+/g, " ").trim()).filter(Boolean);
    return { ans: all[0], acc: [...new Set(all)], tail, n: all[0].split(" ").length };
  };
  const engine = t => { const c = verbCell(F, t, p); return c ? { ans: c.ans, acc: verbCellAnswers(c), tail: c.tail } : null; };
  switch (kind) {
    case "pr": case "pt": case "pf": case "pq": case "fu": case "im": {
      const c = engine(kind);
      return c ? out(c.ans, c.acc, c.tail) : null;
    }
    case "prsep": {
      const c = engine("pr"); if (!c || !F.sep) return null;
      const fin = c.ans;
      return out(`${fin} ${F.sep}`, [`${fin} … ${F.sep}`, ...(refl ? [`${fin} ${refl} ${F.sep}`] : [])], refl ? `(${refl} … )` : "");
    }
    case "prrefl": {
      const c = engine("pr"); if (!c || !F.refl) return null;
      const fin = c.ans, sep = F.sep ? " " + F.sep : "";
      return out(`${fin} ${refl}${sep}`, F.sep ? [`${fin} ${refl} … ${F.sep}`] : []);
    }
    case "k2w": {
      if (F.k2special) return null;
      const c = engine("k2"); return c ? out(c.ans, c.acc, c.tail) : null;
    }
    case "k2o": {
      if (!F.k2special || !F.k2 || !F.k2[p]) return null;
      return out(F.k2[p], [], refl);
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
      return a ? out(F.refl ? `${a} ${refl} ${F.p2}` : `${a} ${F.p2}`, F.refl ? [`${a} ${F.p2}`] : []) : null;
    }
    // For the sheets' quizzes (tests check them against the engine).
    case "p2only": return F.p2 ? out(F.p2) : null;
    case "imfull": {
      const c = verbCell(F, "im", p); if (!c) return null;
      return out(`${c.ans} ${String(c.tail || "").replace(/!$/, "")}`);
    }
    case "ptsep": {
      const c = engine("pt"); if (!c || !F.sep) return null;
      return out(`${c.ans} ${F.sep}`);
    }
    case "sc": {
      const du = F.pr.du, er = F.pr.er;
      if (!du || !er) return null;
      return out(`${du} ${er}`, [`${du}, ${er}`, `${du} · ${er}`, `du ${du} er ${er}`, `du ${du}, er ${er}`], F.sep ? `… ${F.sep}` : "");
    }
    case "p2": {
      if (!F.p2 || !F.aux) return null;
      const a = AUX_PR[F.aux].er;
      return out(F.refl ? `${a} sich ${F.p2}` : `${a} ${F.p2}`, F.refl ? [`${a} ${F.p2}`] : []);
    }
  }
  return null;
}
// The tense a kind of form belongs to (for colours, coverage and logs).
const VX_KIND_TENSE = { pr: "pr", prsep: "pr", prrefl: "pr", sc: "pr", pt: "pt", pf: "pf", p2: "pf", pq: "pq", fu: "fu", im: "im",
  k2w: "k2", k2o: "k2", k2p: "k2p", pvpr: "pv", pvpt: "pv", pvmod: "pv" };
const VX_TENSE_LABEL = { pr: "Präsens", pt: "Präteritum", pf: "Perfekt", pq: "Plusquamperfekt", fu: "Futur I", im: "Imperativ", k2: "Konjunktiv II",
  k2p: "Konjunktiv II · past", pv: "Passiv" };
const VX_TENSE_UNIT = { pr: "pr", pf: "pf", im: "im", pt: "pt2", fu: "fu", k2: "k2a", pq: "pq", pv: "pv", k2p: "k2p" };

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
const VX_RULES = [
  { id: "pr-end", unit: "pr", sheet: "pr1", kind: "pr", title: "Präsens endings", chip: "stem + e · st · t · en · t · en",
    verbs: x => !x.k.irregular && !x.k.stem && !x.k.glue && !x.F.sep && !x.F.refl && x.F.presSure && !x.F.only, persons: () => PERSONS, order: () => 0 },
  { id: "pr-glue", unit: "pr", sheet: "pr2", kind: "pr", title: "Spelling glue", chip: "arbeitest · heißt · sammle",
    verbs: x => x.k.glue && !x.k.stem && !x.k.irregular && x.F.presSure && !x.F.only,
    persons: x => x.k.eln ? ["ich", "wir"] : x.k.ern ? ["wir", "sie"] : ["du", "er", "ihr"], order: x => x.k.eln || x.k.ern ? 1 : 0 },
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
    verbs: x => !!x.F.im && !x.F.eToI && !x.k.aux && !x.F.sep && !x.F.refl, persons: () => ["du", "ihr", "Sie"], order: x => x.k.glue ? 1 : 0 },
  { id: "im-sep", unit: "im", sheet: "im3", kind: "im", title: "Imperativ with prefixes", chip: "Ruf an! · Setz dich!",
    verbs: x => !!x.F.im && (!!x.F.sep || !!x.F.refl), persons: () => ["du", "ihr", "Sie"], order: x => x.F.sep ? 0 : 1 },
  { id: "fu", unit: "fu", sheet: "fu1", kind: "fu", title: "Futur I", chip: "werden + infinitive",
    verbs: x => !x.F.only && x.v.tenses.includes("fu"), persons: () => PERSONS, order: () => 0 },
  { id: "k2-wuerde", unit: "k2a", sheet: "k21", kind: "k2w", title: "würde + infinitive", chip: "würde · würdest · würde…",
    verbs: x => !x.F.k2special && !x.F.only, persons: () => PERSONS, order: () => 0 },
  { id: "k2-own", unit: "k2a", sheet: "k22", kind: "k2o", title: "Their own Konjunktiv II", chip: "wäre · hätte · könnte · müsste",
    verbs: x => !!x.F.k2special && x.F.base !== "werden", persons: () => PERSONS, order: x => x.k.aux ? 0 : 1 },
  { id: "pt-weak", unit: "pt2", sheet: "pt21", kind: "pt", title: "Präteritum: -te", chip: "stem + te · test · te · ten · tet · ten",
    verbs: x => x.k.ptWeak && !x.F.only, persons: () => PERSONS, order: x => x.k.glue ? 1 : 0 },
  { id: "pt-strong", unit: "pt2", sheet: "pt22", kind: "pt", title: "Strong Präteritum endings", chip: "ging · gingst · ging · gingen",
    verbs: x => x.k.strongPt && !x.k.aux && !x.k.modal, persons: () => ["du", "wir", "ihr", "sie"], order: () => 0 },
  { id: "pq", unit: "pq", sheet: "pq1", kind: "pq", title: "Plusquamperfekt", chip: "hatte / war + Partizip II",
    verbs: x => !!x.F.aux && !x.F.only, persons: () => PERSONS, order: x => x.F.aux === "sein" ? 1 : 0, mix: true },
  { id: "pv-pr", unit: "pv", sheet: "pv1", kind: "pvpr", title: "Passiv Präsens", chip: "wird + Partizip II",
    verbs: x => VX_PV_VERBS.has(x.inf), persons: () => ["er", "sie"], order: () => 0 },
  { id: "pv-pt", unit: "pv", sheet: "pv2", kind: "pvpt", title: "Passiv Präteritum", chip: "wurde + Partizip II",
    verbs: x => VX_PV_VERBS.has(x.inf), persons: () => ["er", "sie"], order: () => 0 },
  { id: "pv-mod", unit: "pv", sheet: "pv3", kind: "pvmod", title: "Passiv with a modal", chip: "muss + Partizip II + werden",
    verbs: x => VX_PV_VERBS.has(x.inf), persons: () => ["er", "sie"], order: () => 0 },
  { id: "k2p", unit: "k2p", sheet: "k2p1", kind: "k2p", title: "Konjunktiv II · past", chip: "hätte / wäre + Partizip II",
    verbs: x => !!x.F.aux && !x.F.only, persons: () => PERSONS, order: x => x.F.aux === "sein" ? 1 : 0, mix: true },
];
const VX_RULE = Object.fromEntries(VX_RULES.map(r => [r.id, r]));
// Per-verb items: which sheet teaches them and which unit opens them.
const VX_ITEM_KINDS = {
  sc: { unit: "pr", sheet: "pr4", form: "sc", title: "Stem change", tense: "pr" },
  p2: { unit: "pf", sheet: "pf3", form: "p2", title: "Perfekt", tense: "pf" },
  pt: { unit: "pt2", sheet: "pt22", form: "pt", title: "Präteritum", tense: "pt" },
  im: { unit: "im", sheet: "im2", form: "im", title: "Imperativ", tense: "im" },
};
function vxKey(id) { return VX_DECK + "_" + id; }

// ── RETIRED CARDS & GATED DECKS ───────────────
// Grammar decks whose cards only come once their tense is taught.
const VX_GATE = { a2_praeteritum: "pt1", b1_konjunktiv2: "k2a", b1_passiv: "pv", a1_conjugation: "pr", a2_conjugation: "pr", a1_verbs_p2: "pf" };
// Decks whose unmet cards are covered by the verb track — and how.
const VX_RETIRE_DECKS = new Set(["a2_verbs_p2", "b1_partizip2", "b1_praeteritum", "b1_praet_endungen", "a2_conjugation", "a2_futur", "b1_plusquamperfekt"]);
let _vxRetire = null;
// Map "deckId_idx" → { item?, rule?, inf, t } — what covers a card.
function vxRetireMap() {
  if (_vxRetire) return _vxRetire;
  const m = new Map();
  vxVerbs().forEach(x => (x.v.refs || []).forEach(r => {
    if (!VX_RETIRE_DECKS.has(r.deckId)) return;
    const key = r.deckId + "_" + r.idx, F = x.F;
    let c = null;
    if (r.tense === "p2") c = vxNeedsItem(x, "p2") ? { item: "p2:" + x.inf } : { rule: F.sep || F.insep || x.k.ieren ? "pf-prefix" : "pf-ge" };
    else if (r.tense === "pt") c = vxNeedsItem(x, "pt") && (r.person === "er" || r.person === "ich") ? { item: "pt:" + x.inf } : { rule: x.k.strongPt ? "pt-strong" : "pt-weak" };
    else if (r.tense === "pr") { if (r.person !== "du" && r.person !== "er") c = { rule: F.sep ? "pr-sep" : "pr-end" }; }
    else if (r.tense === "fu") c = { rule: "fu" };
    else if (r.tense === "pq") c = { rule: "pq" };
    if (c) m.set(key, { ...c, inf: x.inf, t: r.tense === "p2" ? "pf" : r.tense, p: r.person || "er" });
  }));
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
// A grammar deck still waiting for its lesson.
function vxGated(deckId) {
  if (!vxOn()) return false;
  const u = VX_GATE[deckId];
  return !!u && !vxUnitOpen(u);
}
// Shadows: a retired card mirrors its cover — a per-verb item's stage,
// or a rule's stage once that verb's form was produced right.
function vxMirror() {
  if (!vxOn()) return;
  const now = Date.now();
  vxRetireMap().forEach((c, key) => {
    let ws = S.words[key];
    if (ws && ws.st && !ws.rt) return; // met by you: a normal card
    let st = 0, src = null;
    if (c.item) { src = S.words[vxKey(c.item)]; st = src ? src.st || 0 : 0; }
    else if (vxCovHas(c.inf, c.t)) { src = S.words[vxKey("r:" + c.rule)]; st = src ? src.st || 0 : 0; }
    if (!st && !(ws && ws.rt)) return;
    if (!ws) ws = S.words[key] = { correct: 0, wrong: 0, streak: 0, displayStreak: 0, lastAnsweredAt: null, anki: freshAnki() };
    if (ws.st === st && ws.rt) return;
    ws.rt = 1; ws.st = st; ws.pk = Math.max(ws.pk || 0, st);
    ws.dueAt = null; ws.sAt = (src && src.sAt) || now;
    if (st >= STAGE_KNOWN) ws.mastered = true;
    ["lrn", "rp", "fl", "cf", "metOn"].forEach(f => delete ws[f]);
  });
}

// ── ITEM CATALOG ──────────────────────────────
// Does a verb need its own item of this kind (and no active card has it)?
function vxActiveRef(x, tense, persons) {
  return (x.v.refs || []).some(r => r.tense === tense && (!persons || persons.includes(r.person)) &&
    !(VX_RETIRE_DECKS.has(r.deckId) && vxRetireDeckCard(r)));
}
// A card in a retiring deck counts as active only if you met it.
function vxRetireDeckCard(r) { const ws = S.words[r.deckId + "_" + r.idx]; return !(ws && ws.st && !ws.rt); }
function vxNeedsItem(x, kind) {
  const F = x.F;
  if (kind === "sc") return x.k.stem && !vxActiveRef(x, "pr", ["du"]) && !vxActiveRef(x, "pr", ["er"]);
  if (kind === "p2") return !!F.aux && !!F.p2 && (F.strong || F.aux === "sein") && !x.k.modal && !vxActiveRef(x, "p2");
  if (kind === "pt") return !F.only && x.k.strongPt && !x.k.aux && !x.k.modal && !VX_PT1_VERBS.has(F.base) && !vxActiveRef(x, "pt", ["er", "ich"]);
  if (kind === "im") return !!F.im && !!F.presSure && (F.eToI || (F.base === "sein" && !F.sep && !F.insep));
  return false;
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
    out.push({ id: kind + ":" + x.inf, kind, unit: d.unit, sheet: d.sheet, x, lv: x.lv, ord: vxItemOrder(x, kind) });
  }));
  _vxCatalog = out; _vxCatalogAt = stamp;
  return out;
}
function vxCatalogReset() { _vxCatalog = null; _vxRetire = null; _vxQueueCache = null; _vxCells = null; }
// The logical order inside a level (lower first): the shapes a learner
// meets first, the odd ones last.
function vxItemOrder(x, kind) {
  const F = x.F;
  if (kind === "sc") { const er = lastVowel(F.pr.er.replace(/t$/, "")); return er === "ä" || er === "äu" ? 0 : er === "i" ? 1 : er === "ie" ? 2 : 3; }
  if (kind === "p2") { if (!F.strong) return 0; if (x.k.mixed) return 4; const a = lastVowel(F.base.replace(/(en|n)$/, "")), b = lastVowel(F.p2.replace(/(en|n|t)$/, "")); return a === b ? 1 : F.aux === "sein" ? 3 : 2; }
  if (kind === "pt") return x.k.mixed ? 2 : 1;
  if (kind === "im") return F.base === "sein" ? 0 : 1;
  return 0;
}

// ── COVERAGE (the ledger's cells) ─────────────
const VX_COV = ["pr", "pt", "pf", "pq", "fu", "k2", "im"];
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
  vxRetireMap().forEach(c => { if (!["pr", "pt", "pf"].includes(c.t)) { const k = c.inf + "|" + c.t; extra.set(k, c); } });
  const out = [];
  vxVerbs().forEach(x => {
    ["pr", "pt", "pf"].forEach(t => { if (x.v.tenses.includes(t) && vxCellPersons(x, t).length) out.push({ x, t }); });
    ["fu", "pq"].forEach(t => { if (extra.has(x.inf + "|" + t) && x.v.tenses.includes(t)) out.push({ x, t }); });
  });
  out.forEach(c => { c.ord = vxCellOrder(c.x, c.t); });
  out.sort((a, b) => a.x.lv - b.x.lv || a.ord - b.ord || a.x.i - b.x.i);
  _vxCells = out;
  return out;
}
function vxCellPersons(x, t) {
  if (x.F.only && !x.F.only.includes(t)) return [];
  if (x.F.impersonal || DE_WEATHER.test(x.inf) || DE_IT_VERBS.test(x.inf)) return verbCell(x.F, t, "er") ? ["er"] : [];
  return PERSONS.filter(p => verbCell(x.F, t, p));
}
function vxCellOrder(x, t) {
  const k = x.k, F = x.F;
  if (t === "pr") return k.irregular ? 4 : k.stem ? 3 : F.sep || F.refl ? 2 : k.glue ? 1 : 0;
  if (t === "pf") return k.irregular ? 4 : F.aux === "sein" ? 3 : F.strong ? 2 : F.sep || F.insep || k.ieren ? 1 : 0;
  if (t === "pt") return k.irregular ? 3 : k.mixed ? 2 : k.strongPt ? 1 : 0;
  return 0;
}
// Which unit a cell's tense waits for.
function vxCellOpen(c) {
  if (c.t === "pt") return vxUnitOpen("pt2") || (vxUnitOpen("pt1") && VX_PT1_VERBS.has(c.x.F.base) && !c.x.F.sep && !c.x.F.insep);
  return vxUnitOpen(VX_TENSE_UNIT[c.t]);
}

// ── EXERCISES ─────────────────────────────────
// A rule's verbs in their fixed order: level, then the rule's own
// groups, then the order you met them. mix: alternate groups (sein /
// haben) so each review contrasts with the last.
function vxRuleVerbs(rule) {
  const r = VX_RULE[rule];
  const vs = vxVerbs().filter(x => r.verbs(x) && vxVerbReady(x) && r.persons(x).some(p => vxForm(x, r.kind, p, { modal: "müssen" })));
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
  const t = VX_KIND_TENSE[VX_RULE[rule].kind];
  const open = list.find(x => !vxCovHas(x.inf, t) && x.inf !== avoid);
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
      const ps = r.persons(x).filter(p => vxForm(x, r.kind, p, { modal: "müssen" }));
      if (!ps.length) continue;
      const p = vxPickPerson(ps, x);
      const modal = r.kind === "pvmod" ? Object.keys(VX_PV_MODALS)[Math.floor(Math.random() * 4)] : "";
      const form = vxForm(x, r.kind, p, { modal });
      if (form) return { kind: r.kind, x, p, form, tense: VX_KIND_TENSE[r.kind], rule: item.rule, item: item.id, modal, sheet: r.sheet };
    }
    return null;
  }
  const d = VX_ITEM_KINDS[item.kind], x = item.x;
  const p = item.kind === "sc" ? "du" : item.kind === "im" ? "du" : "er";
  const form = vxForm(x, d.form, p);
  return form ? { kind: d.form, x, p, form, tense: d.tense, item: item.id, sheet: d.sheet } : null;
}
function vxCellExercise(c) {
  const ps = vxCellPersons(c.x, c.t);
  if (!ps.length) return null;
  const p = vxPickPerson(ps, c.t === "pr" ? c.x : null);
  const form = vxForm(c.x, c.t, p);
  return form ? { kind: c.t, x: c.x, p, form, tense: c.t, cell: c.x.inf + "|" + c.t, sheet: vxCellSheet(c) } : null;
}
function vxCellSheet(c) {
  const k = c.x.k, F = c.x.F;
  if (c.t === "pr") return k.irregular ? "pr5" : k.stem ? "pr4" : F.sep ? "pr6" : F.refl ? "pr7" : k.glue ? "pr2" : "pr1";
  if (c.t === "pf") return F.aux === "sein" ? "pf5" : F.sep || F.insep || k.ieren ? "pf4" : "pf3";
  if (c.t === "pt") return k.irregular ? "pt12" : k.mixed ? "pt23" : k.strongPt ? "pt22" : "pt21";
  if (c.t === "fu") return "fu1";
  if (c.t === "pq") return "pq1";
  return "";
}
// The word-like object a Today item carries (wordKey(w) = "vx_…").
function vxWord(ex) {
  const id = ex.item || ("cell:" + ex.cell);
  return { deckId: VX_DECK, idx: id, deckName: "Verbs", de: ex.form.ans, en: `${ex.x.inf} — ${VX_TENSE_LABEL[ex.tense] || ""}`, hint: "verb", vx: ex };
}

// ── GRADING ───────────────────────────────────
// true · "near" · false. A pronoun typed in front is fine.
function vxGrade(val, ex) {
  const raw = String(val || "").trim().replace(/!+$/, "").trim();
  if (!raw) return false;
  const acc = ex.form.acc;
  const tries = [raw, raw.replace(/^(ich|du|er|sie|es|wir|ihr|man)\s+/i, ""), raw.replace(/\s+Sie$/, ""), raw.replace(/\s*[,·/;]\s*/g, " ")];
  for (const t of tries) if (acc.some(a => normalize(a) === normalize(t))) return true;
  // An umlaut left out (fahrst) counts as wrong for a form: it IS the form.
  if (isNearMiss(raw, acc)) return "near";
  return false;
}
// The mistake type, for the learning log and the usage report.
function vxMistakeType(given, ex) {
  const g = normalize(String(given || ""));
  if (!g) return "blank";
  const engineT = { pr: 1, pt: 1, pf: 1, pq: 1, fu: 1, im: 1 }[ex.kind] ? ex.kind : ex.kind === "p2" ? "pf" : ex.kind === "k2w" || ex.kind === "k2o" ? "k2" : null;
  if (engineT && typeof classifyVerbMistake === "function") {
    const t = classifyVerbMistake(given, ex.x.F, engineT, ex.p === "Sie" ? "Sie" : ex.p);
    if (t && t !== "umlaut") return t;
  }
  if (ex.kind === "sc") {
    const [a, b] = g.split(/[\s,·]+/);
    if (a === normalize(ex.x.F.pr.wir.replace(/en$/, "st")) || b === normalize(ex.x.F.pr.wir.replace(/en$/, "t"))) return "verbform";
  }
  return ex.form.acc.some(a => levenshtein(normalize(a), g) <= 2) ? "spelling" : "verbform";
}

// ── TODAY: WHAT THE VERB TRACK ADDS ───────────
let _vxQueueCache = null;
function vxQuotas(scan) {
  vxRollDay();
  const V = S.verb;
  let items = VX_DEFAULT.items, cells = VX_DEFAULT.cells;
  if (pathDeadlineOn()) {
    const days = Math.max(14, pathDaysLeft() - PLAN.LAG);
    const left = vxLeft();
    items = Math.max(VX_ITEM_PACE[0], Math.min(VX_ITEM_PACE[1], Math.ceil(left.items / days)));
    cells = Math.max(VX_CELL_PACE[0], Math.min(VX_CELL_PACE[1], Math.ceil(left.cells / days)));
    if (!left.items) items = 0;
    if (!left.cells) cells = 0;
  }
  void scan;
  return { items, cells, itemsLeft: Math.max(0, items - V.ni), cellsLeft: Math.max(0, cells - V.nc), sheetsLeft: Math.max(0, VX_SHEETS_PER_DAY - V.ns) };
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
  const sheets = Math.min(VX_SHEETS_PER_DAY, vxPendingSheets().length);
  return { due: fix.length + due.length, items, cells, sheets };
}
// Right answers the verb track adds to the day's target.
function vxPlanTarget(vx) {
  if (!vx) return 0;
  return Math.round(vx.items * 2 + vx.cells * 1.1 + vx.sheets * 4);
}
// Items for one Today session: { sheets:[ids], learn:[ex], items:[ex] }.
// counted items stay within `room`. Sheets first, then fixes and due
// items, then new items (each: an intro card + a typed check), then
// coverage drills.
function vxSessionPlan(room, opts = {}) {
  if (!vxOn()) return { sheets: [], items: [], learns: [] };
  vxUnitsTick(false);
  const q = vxQuotas();
  const sheets = opts.noSheets ? [] : vxPendingSheets().slice(0, q.sheetsLeft);
  const items = [], learns = [];
  const { fix, due } = vxDueItems();
  let avoid = "";
  [...fix, ...due].forEach(({ it }) => {
    if (items.length >= room) return;
    const ex = vxMakeExercise(it, avoid);
    if (ex) { items.push(ex); avoid = ex.x.inf; }
  });
  if (!opts.reviewOnly) {
    const fresh = vxNewCandidates().slice(0, Math.min(q.itemsLeft, Math.max(0, room - items.length)));
    fresh.forEach(it => {
      const ex = vxMakeExercise(it, avoid);
      if (!ex) return;
      learns.push(ex); items.push({ ...ex, fresh: true }); avoid = ex.x.inf;
    });
    const cells = vxOpenCells(Math.min(q.cellsLeft, Math.max(0, room - items.length)));
    cells.forEach(c => { const ex = vxCellExercise(c); if (ex) items.push(ex); });
  }
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
  if (ex.cell) V.nc++; // a drill uses up today's quota, right or wrong (a miss comes back tomorrow)
  if (ok === true && !opts.hint) vxCovSet(ex.x.inf, ex.tense);
  if (ex.cell && ok !== true) {
    // A missed drill: the rule behind it gets a typed check.
    const rk = vxCellRuleItem(ex);
    const ws = rk && S.words[vxKey(rk)];
    if (ws && ws.st && !ws.lrn && !ws.rp) { srsReview(ws, false, "recognition"); }
  }
  if (typeof learnNoteVerb === "function" && ["pr", "pt", "pf", "pq", "fu", "im"].includes(ex.kind))
    learnNoteVerb(ex.x.F, ex.kind, ex.p, ok === true, opts.given || "", ex.form.ans);
  else if (ok === false && typeof _learnDay === "function") _learnDay("mk", vxMistakeType(opts.given, ex));
  if (typeof logEvent === "function") logEvent("vx_ans", { k: ex.item ? ex.item.split(":")[0] : "cell", t: ex.tense, ok: ok === true });
  vxMirror();
  return res;
}
// The rule item a coverage drill exercises (for a miss to flag).
function vxCellRuleItem(ex) {
  const x = ex.x, F = x.F;
  if (ex.tense === "pr") return x.k.stem ? (S.words[vxKey("sc:" + x.inf)] ? "sc:" + x.inf : null) : F.sep ? "r:pr-sep" : F.refl ? "r:pr-refl" : x.k.glue ? "r:pr-glue" : x.k.irregular ? null : "r:pr-end";
  if (ex.tense === "pf") return S.words[vxKey("p2:" + x.inf)] ? "p2:" + x.inf : F.sep || F.insep || x.k.ieren ? "r:pf-prefix" : "r:pf-ge";
  if (ex.tense === "pt") return S.words[vxKey("pt:" + x.inf)] ? "pt:" + x.inf : x.k.ptWeak ? "r:pt-weak" : "r:pt-strong";
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
  const out = [];
  if (tense === "pr" && (person === "du" || person === "er") && S.words[vxKey("sc:" + x.inf)]) out.push("sc:" + x.inf);
  if (tense === "pf" && S.words[vxKey("p2:" + x.inf)]) out.push("p2:" + x.inf);
  if (tense === "pt" && (person === "er" || person === "ich") && S.words[vxKey("pt:" + x.inf)]) out.push("pt:" + x.inf);
  if (tense === "im" && person === "du" && S.words[vxKey("im:" + x.inf)]) out.push("im:" + x.inf);
  VX_RULES.forEach(r => {
    const kt = r.kind === "k2w" || r.kind === "k2o" ? "k2" : r.kind === "prsep" || r.kind === "prrefl" ? null : r.kind;
    if (kt === tense && r.verbs(x) && r.persons(x).includes(person) && S.words[vxKey("r:" + r.id)]) out.push("r:" + r.id);
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
    vxVerbs().forEach(x => (x.v.refs || []).forEach(r => _vxRefIdx.set(r.deckId + "_" + r.idx, { inf: x.inf, t: r.tense === "p2" ? "pf" : r.tense })));
  }
  const r = _vxRefIdx.get(w.deckId + "_" + w.idx);
  if (r && vxCovSet(r.inf, r.t)) vxMirror();
}
// Timeline Drop before Präteritum II: a Präteritum sentence only when
// its verb is one of Präteritum I (war, hatte, konnte, wurde…).
let _vxPt1Forms = null;
function vxPt1Sentence(r) {
  if (!vxOn() || vxUnitOpen("pt2")) return true;
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
    S.verb.tu.pr = Math.max(S.verb.tu.pr || 0, 2);
    if (pos0 >= vxAnchorPos(VX_UNIT.pf) + 0.25) S.verb.tu.pf = Math.max(S.verb.tu.pf || 0, 2);
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
function vxSeed(dry = false) {
  const now = Date.now(), n = { rules: 0, items: 0, cells: 0 };
  const stOf = (d, i) => { const ws = S.words[d + "_" + i]; return ws && ws.st && !ws.rt ? ws.st : 0; };
  const med = a => { const s = a.slice().sort((x, y) => x - y); return s[Math.floor((s.length - 1) / 2)]; };
  const cap = st => st >= STAGE_KNOWN ? st : Math.min(st, 4);
  const place = (id, st) => {
    if (!st) return;
    const ws = getWS(VX_DECK, id);
    if (ws.st) return;
    ws.st = st; ws.pk = st; ws.sAt = now;
    const spread = 1 + hashString(id) % Math.max(1, Math.round(STAGE_DAYS[st] || 1));
    ws.dueAt = studyDayStart(Math.min(spread, STAGE_DAYS[st] || 1), now);
    if (st >= STAGE_KNOWN) ws.mastered = true;
  };
  // Evidence per (inf, tense) from your met cards.
  const ev = new Map();
  vxVerbs().forEach(x => (x.v.refs || []).forEach(r => {
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
    vxVerbs().forEach(x => {
      if (!r.verbs(x)) return;
      (ev.get(x.inf + "|" + t) || []).forEach(e => { if (r.persons(x).includes(e.p) || t === "pf") sts.push(e.st); });
      const g = learnT(x.inf)[t]; if (g) { ok += g[0] || 0; bad += g[1] || 0; }
    });
    if (sts.length >= 3) { place("r:" + r.id, cap(med(sts))); n.rules++; }
    else if (ok >= 3 && ok / (ok + bad) >= 0.7) { place("r:" + r.id, 3); n.rules++; }
  });
  // Per-verb items: their own evidence.
  vxCatalog().forEach(it => {
    if (it.kind === "r") return;
    const x = it.x, t = VX_ITEM_KINDS[it.kind].tense;
    const sts = (ev.get(x.inf + "|" + t) || []).map(e => e.st);
    const g = (learnT(x.inf)[t] || [0, 0]);
    let st = sts.length ? cap(med(sts)) : g[0] >= 2 && g[0] > g[1] ? 2 : 0;
    if (st) { place(it.id, st); n.items++; }
  });
  return n;
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
  S.verb.tu.pr = Math.max(S.verb.tu.pr || 0, 2);
  if (pos >= vxAnchorPos(VX_UNIT.pf) + 0.25) S.verb.tu.pf = Math.max(S.verb.tu.pf || 0, 2);
  const seed = vxSeed(false);
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
    if (k.startsWith(VX_DECK + "_")) delete S.words[k];
    else if (S.words[k] && S.words[k].rt) delete S.words[k];
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
  ["pr", "pt", "pf"].forEach(t => { if (x.v.tenses.includes(t)) cells[t] = vxCovHas(x.inf, t); });
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
  ];
}

// For the learning log (learning-log.js): where the verb track stands,
// and what to drill — for an AI tutor.
function vxLearnLines() {
  if (!vxOn()) return [];
  const L = vxLedger(), out = [``, `## VERB TRACK (tenses in order · rules · the verb ledger)`];
  out.push(`Tenses: ` + VX_UNITS.map(u => `${u.name} ${["🔒", "📖", "🔁", "✅"][vxUnitState(u.id)]}`).join(" · ") + `  (🔒 not taught yet — please don't use these tenses with me · 📖 being taught · 🔁 practising · ✅ solid)`);
  const passed = GS_SHEETS.filter(sh => vxSheetPassed(sh.id)).map(sh => `${sh.id} ${S.verb.sh[sh.id]}%`);
  if (passed.length) out.push(`Sheets passed (first-try quiz score): ${passed.join(" · ")}`);
  const rules = VX_RULES.map(r => { const ws = S.words[vxKey("r:" + r.id)]; return ws && ws.st ? `${r.title} ${tierOfStage(ws.st).icon}${ws.rp ? "🩹" : ws.fl ? "⚠️" : ""}${(ws.k || 1) < EASE.HARD_K ? " (hard for me)" : ""}` : ""; }).filter(Boolean);
  if (rules.length) out.push(`Rules in my reviews: ${rules.join(" · ")}`);
  const weak = vxCatalog().filter(it => it.x).map(it => ({ it, ws: S.words[vxKey(it.id)] })).filter(o => o.ws && o.ws.st && (o.ws.rp || o.ws.fl || (o.ws.k || 1) < EASE.HARD_K || (o.ws.wrong || 0) >= 2))
    .map(o => `${o.it.x.inf} (${VX_ITEM_KINDS[o.it.kind].title}: ${vxForm(o.it.x, VX_ITEM_KINDS[o.it.kind].form, o.it.kind === "sc" || o.it.kind === "im" ? "du" : "er").ans})`);
  if (weak.length) out.push(`Irregular verb forms I struggle with: ${weak.join(" · ")}`);
  out.push(`Verb ledger: ${L.all.done}/${L.all.verbs} verbs complete (meaning Known + irregular forms Known + Präsens/Präteritum/Perfekt produced) — ` +
    L.levels.map(l => `${l.id.toUpperCase()} ${l.done}/${l.verbs} (forms ${l.cellsDone}/${l.cells})`).join(" · "));
  return out;
}

// ── ACHIEVEMENTS ──────────────────────────────
if (typeof ACHIEVEMENTS !== "undefined" && typeof GR_DE !== "undefined" && GR_DE) {
  ACHIEVEMENTS.push(
    { id: "vx_tenses", icon: "🧭", name: "Tense Explorer", category: "Grammar",
      desc: t => `Open ${t} of the 10 German tenses (every sheet of each passed)`,
      tiers: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10],
      value: () => vxOn() ? VX_UNITS.filter(u => vxUnitOpen(u.id)).length : 0 },
    { id: "vx_ledger", exact: true, icon: "📒", name: "Verb Ledger", category: "Grammar",
      desc: t => `Complete ${t.toLocaleString()} verbs: meaning Known, irregular forms Known, Präsens · Präteritum · Perfekt produced`,
      top: () => vxAvailable() ? vxVerbs().length : 1,
      value: () => vxOn() ? vxLedger().all.done : 0 });
  const _vxL = ACHIEVEMENTS[ACHIEVEMENTS.length - 1];
  let key = null, memo = null;
  Object.defineProperty(_vxL, "tiers", { get() { const top = Math.round(_vxL.top()) || 0; if (top !== key) { key = top; memo = tiersTo(top, _vxL.curve, true); } return memo; } });
}

if (typeof module !== "undefined") module.exports = { vxForm, vxGrade, VX_RULES, VX_UNITS };
