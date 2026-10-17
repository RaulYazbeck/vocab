// ── GRAMMAR QUIZZES: SHEET CHECKS & TENSE MASTERY ──
// A sheet's quiz checks every point of the sheet: each rule, the table
// (or list) and the trap — and the structure when it has a question of
// its own. A point gets one question (two when the sheet says the point
// carries more: qx), so the length follows the sheet: 3 to 10.
//
// A point's questions are a pool, drawn at random each time:
//   • written ones (k: type · pick · odd · order · why), and
//   • generated ones (g:) built by the verb engine from YOUR met verbs —
//     a form to type, or to pick among the mistakes people really make.
// The order is shuffled too, so no two runs are the same.
//
// Passing takes 100%: every question right the first time. A miss shows
// why and opens that exact part of the sheet; the same question comes
// back once at the end, to check it stuck.
//
// The mastery quiz of a tense (optional, outside the daily plan) opens
// once every sheet of the tense is passed: questions from every sheet,
// leaning on your own verbs, 8 to 20 depending on the tense. 100% too.
//
// Generated item:
//   { at, g: "form", t: vxForm kind, p: [persons], v: verb set, fb: [infs],
//     ask: "type" | "pick", lbl: " — Perfekt", why }
//   { at, g: "aux", t: "pf" | "pq" | "k2p", p, v, fb, why }  → pick the auxiliary
// ─────────────────────────────────────────────

const GQ_MIN = 3, GQ_MAX = 10, GQ_M_MIN = 8, GQ_M_MAX = 20;

// ── VERB SETS ─────────────────────────────────
// Which verbs a generated question may use (x: a vxVerbs() entry).
function gqStem(x) { const F = x.F, b = F.insep + F.base; return x.k.eln || x.k.ern ? b.slice(0, -1) : b.replace(/(en|n)$/, ""); }
const GQ_SETS = VX_FR ? VXF.gqSets : {
  any: () => true,
  regular: x => !x.k.irregular && !x.k.stem && !x.k.glue && !x.F.sep && !x.F.refl && x.F.presSure && !x.F.only,
  glueT: x => x.k.glue && !x.k.stem && !x.k.irregular && !x.F.sep && !x.F.refl && needsE(gqStem(x)),
  glueS: x => x.k.glue && !x.k.stem && !x.k.irregular && !x.F.sep && !x.F.refl && isSSound(gqStem(x)),
  eln: x => (x.k.eln || x.k.ern) && !x.F.sep && !x.F.refl,
  aToAe: x => x.k.stem && /ä/.test(x.F.pr.du || "") && !x.F.sep && !x.F.refl,
  eToI: x => x.k.stem && !!x.F.eToI && !/ie/.test(x.F.pr.er || "") && !x.F.sep && !x.F.refl,
  eToIe: x => x.k.stem && !!x.F.eToI && /ie/.test(x.F.pr.er || "") && !x.F.sep && !x.F.refl,
  stem: x => x.k.stem && !x.F.sep && !x.F.refl,
  modal: x => x.k.modal && !x.F.only,
  k2modal: x => x.k.modal && !x.F.only && !["sollen", "wollen", "mögen"].includes(x.F.base) && !!x.F.k2special,
  auxSH: x => ["sein", "haben"].includes(x.inf),
  isSein: x => x.inf === "sein",
  isHaben: x => x.inf === "haben",
  isWerden: x => x.inf === "werden",
  sollWoll: x => ["sollen", "wollen"].includes(x.inf),
  modalX: x => ["wollen", "sollen", "wissen", "werden"].includes(x.inf),
  sep: x => !!x.F.sep && !x.F.refl && x.F.presSure,
  refl: x => !!x.F.refl && x.F.presSure,
  sein: x => x.F.aux === "sein" && !x.k.modal,
  haben: x => x.F.aux === "haben" && !x.F.refl && !x.k.modal,
  auxAny: x => !!x.F.aux && !x.k.modal,
  weakP2: x => !x.F.strong && x.F.aux && !x.F.sep && !x.F.insep && !x.k.ieren && !x.F.refl && !x.k.modal,
  weakP2T: x => GQ_SETS.weakP2(x) && needsE(gqStem(x)),
  strongP2: x => !!x.F.strong && !x.k.mixed && !x.F.sep && !x.F.insep && !x.k.modal && !x.k.aux,
  mixed: x => x.k.mixed && !x.F.sep && !x.F.insep,
  sepP2: x => !!x.F.sep && !!x.F.aux && !x.F.refl,
  insepP2: x => !!x.F.insep && !x.F.sep && !!x.F.aux && !x.F.refl,
  ieren: x => x.k.ieren && !x.F.refl,
  imReg: x => !!x.F.im && !x.F.eToI && !x.k.aux && !x.k.modal && !x.F.sep && !x.F.refl && !vxItVerb(x) && !x.k.stem,
  imAtoAe: x => !!x.F.im && GQ_SETS.aToAe(x) && !vxItVerb(x),
  imEtoI: x => !!x.F.im && !!x.F.eToI && !x.F.sep && !x.F.refl && !vxItVerb(x),
  imSep: x => !!x.F.im && !!x.F.sep && !x.F.refl && !x.k.modal && !vxItVerb(x),
  imRefl: x => !!x.F.im && !!x.F.refl && !x.k.modal && !vxItVerb(x),
  ptWeak: x => x.k.ptWeak && !x.F.only && !x.F.sep,
  ptWeakT: x => x.k.ptWeak && !x.F.only && !x.F.sep && needsE(gqStem(x)),
  ptStrong: x => x.k.strongPt && !x.k.aux && !x.k.modal && !x.k.mixed && !x.F.sep,
  ptMixed: x => x.k.mixed && !x.F.sep,
  ptSep: x => !!x.F.sep && !x.F.refl,
  ptInsep: x => !!x.F.insep && !x.F.sep && !x.F.refl,
  fu: x => !x.F.only && !x.k.modal,
  k2w: x => !x.F.k2special && !x.F.only && !x.k.modal,
  // käme, ginge… (a verb with a k2s card); k2same: no umlaut to add.
  k2own: x => typeof vxNeedsItem === "function" && vxNeedsItem(x, "k2s"),
  k2same: x => typeof vxNeedsItem === "function" && vxNeedsItem(x, "k2s") && !/[äöü]/.test(x.F.k2own.ich),
  pv: x => typeof VX_PV_VERBS !== "undefined" && VX_PV_VERBS.has(x.inf),
};

// ── PICKING A VERB ────────────────────────────
// Your met verbs first (any level you've reached); the item's fallback
// verbs when you've met none that fit (a sheet read ahead of time).
function gqVerbFor(item, avoid) {
  const set = GQ_SETS[item.v || "any"] || GQ_SETS.any;
  const ok = x => set(x) && gqPersons(item, x).length;
  const all = vxVerbs().filter(ok);
  let pool = all.filter(x => vxLemma(x).st > 0 && !avoid.has(x.inf));
  if (!pool.length) pool = (item.fb || []).map(vxVerb).filter(x => x && ok(x) && !avoid.has(x.inf));
  if (!pool.length) pool = (item.fb || []).map(vxVerb).filter(x => x && ok(x));
  if (!pool.length) pool = all.filter(x => x.lv === 0);
  if (!pool.length) return null;
  return pool[Math.floor(Math.random() * pool.length)];
}
function gqPersons(item, x) {
  const t = item.t;
  let ps = item.p || VX_PERSONS;
  if (vxItVerb(x) && !/^pv/.test(t)) ps = ps.filter(p => p === VX_IT);
  return ps.filter(p => vxForm(x, t, p, { modal: item.modal || "müssen" }));
}
// "sie" alone could be she; an "it" verb speaks of es.
function gqPron(p, x, t) {
  if (p === "Sie") return "Sie";
  if (p === "sie") return "sie (they)";
  if (p === "er") return /^pv/.test(t) || vxItVerb(x) ? "es" : "er";
  return p;
}

// ── WRONG OPTIONS ─────────────────────────────
// The mistakes a learner makes with this form, never a right answer.
const GQ_WEAK_PT = { ich: "te", du: "test", er: "te", wir: "ten", ihr: "tet", sie: "ten" };
const gqDeUml = s => String(s).replace(/äu/g, "au").replace(/ä/g, "a").replace(/ö/g, "o").replace(/ü/g, "u");
function gqP2Wrong(x) {
  const F = x.F, p2 = F.p2 || "", st = F.base.replace(/(en|n)$/, ""), out = [];
  if (F.strong) out.push((F.sep || "") + (F.insep || "ge") + st + "t");
  else if (/t$/.test(p2)) out.push(p2.replace(/e?t$/, "en"));
  if ((F.insep || x.k.ieren) && !/^ge/.test(p2)) out.push("ge" + p2);
  if (F.sep) out.push("ge" + F.sep + p2.slice(F.sep.length).replace(/^ge/, ""));
  return out;
}
function gqWrong(x, t, p, form, modal) {
  if (VX_FR) return gqClean(VXF.gqWrong(x, t, p, form), form);
  const F = x.F, ans = form.ans, out = [];
  const cell = (tt, pp) => { const f = vxForm(x, tt, pp, { modal }); return f ? f.ans : ""; };
  const others = ps => ps.filter(q => q !== p).map(q => cell(t, q));
  const words = ans.split(" ");
  switch (t) {
    case "pr":
      out.push(gqDeUml(ans));
      if (/e(s?t)$/.test(ans)) out.push(ans.replace(/e(s?t)$/, "$1"));
      if (p === "du" && isSSound(gqStem(x))) out.push(ans.replace(/t$/, "st"));
      if (x.k.stem) out.push(p === "du" ? F.pr.wir.replace(/en$/, "st") : p === "er" ? F.pr.wir.replace(/en$/, "t") : cell("pr", "er"));
      out.push(...others(PERSONS));
      break;
    case "prsep": out.push(`${F.sep}${words[0]}`, ...others(PERSONS)); break;
    case "prrefl": Object.values(REFL).forEach(r => out.push(`${words[0]} ${r}${F.sep ? " " + F.sep : ""}`)); out.push(...others(PERSONS)); break;
    case "pf": case "pq": case "k2p": {
      const tab = t === "pf" ? AUX_PR : t === "pq" ? AUX_PT : K2_AUX, other = F.aux === "sein" ? "haben" : "sein";
      out.push([tab[other][p], ...words.slice(1)].join(" "));
      gqP2Wrong(x).forEach(w => out.push([...words.slice(0, -1), w].join(" ")));
      out.push(...others(PERSONS));
      break;
    }
    case "p2only": out.push(...gqP2Wrong(x)); break;
    case "pt":
      // A strong verb given -te (gehte), a mixed one its old stem (denkte).
      if (x.k.strongPt || x.k.mixed) out.push(gqStem(x) + GQ_WEAK_PT[p]);
      out.push(cell("pr", p), ...others(PERSONS));
      break;
    case "ptsep": out.push(`${F.sep}${words[0]}`, `${cell("pr", p)} ${F.sep}`); break;
    case "im":
      if (p === "du") { out.push(F.pr.du); if (x.k.stem && !F.eToI) out.push(F.pr.du.replace(/s?t$/, "")); if (F.eToI) out.push(F.pr.wir.replace(/en$/, "")); }
      if (p === "ihr") out.push(F.inf, F.pr.wir);
      if (p === "Sie") out.push(F.pr.ihr || "");
      out.push(...others(["du", "ihr", "Sie"]));
      break;
    case "imsep": case "imfull":
      if (F.sep) out.push(`${F.sep}${words[0]}`, words[0]);
      if (F.refl) out.push(p === "Sie" ? `${words[0]} sich Sie` : `${words[0]} sich`);
      out.push(...["du", "ihr", "Sie"].filter(q => q !== p).map(q => { const f = vxForm(x, t, q); return f ? f.ans : ""; }));
      break;
    case "fu": out.push(`${words[0]} ${F.p2 || ""}`.trim(), ...others(PERSONS)); break;
    case "k2w": out.push(gqDeUml(ans), `${cell("fu", p).split(" ")[0]} ${F.inf}`, ...others(PERSONS)); break;
    case "k2o": out.push(gqDeUml(ans), cell("pr", p), ...others(PERSONS)); break;
    case "pvpr": out.push(`${words[0]} ${F.inf}`, `${p === "sie" ? "sind" : "ist"} ${F.p2}`); break;
    case "pvpt": out.push(`${p === "sie" ? "würden" : "würde"} ${F.p2}`, `${words[0]} ${F.inf}`); break;
    case "pvpf": out.push(`${words[0]} ${F.p2} geworden`, `${p === "sie" ? "haben" : "hat"} ${F.p2} worden`, `${words[0]} ${F.p2} werden`); break;
    case "pvmod": out.push(`${words[0]} ${F.p2} worden`, `${words[0]} ${F.inf} werden`, `${words[0]} werden ${F.p2}`); break;
    default: out.push(...others(PERSONS));
  }
  return gqClean(out, form);
}
// Wrong options: each one once, never one of the right answers.
function gqClean(out, form) {
  const seen = new Set([normalize(form.ans)]), res = [];
  for (const w of out) {
    const s = String(w || "").replace(/\s+/g, " ").trim();
    if (!s || form.acc.some(a => vxEq(a, s)) || seen.has(s.toLowerCase())) continue;
    seen.add(s.toLowerCase()); res.push(s);
  }
  return res;
}

// ── RESOLVING A QUESTION ──────────────────────
// A written item as it is; a generated one with a verb, a person and
// the engine's answer. → { k, q, a, o?, why, whyHtml?, at, sid, inf? } or null
const GQ_ENGINE_T = { pr: "pr", pt: "pt", pf: "pf", pq: "pq", fu: "fu", im: "im", k2w: "k2", k2o: "k2", p2only: "pf" };
function gqResolve(item, sid, avoid = new Set()) {
  if (!item.g) return { ...item, sid };
  const x = gqVerbFor(item, avoid);
  if (!x) return null;
  const ps = gqPersons(item, x);
  const p = ps[Math.floor(Math.random() * ps.length)];
  const modal = item.modal || (item.t === "pvmod" ? Object.keys(VX_PV_MODALS)[Math.floor(Math.random() * 4)] : "");
  const form = vxForm(x, item.t, p, { modal });
  if (!form) return null;
  if (VX_FR) return gqResolveFr(item, sid, x, p, form);
  const et = GQ_ENGINE_T[item.t];
  const rule = et && typeof verbRuleHtml === "function" ? verbRuleHtml(x.F, et, p) : "";
  const base = { at: item.at, sid, inf: x.inf, p, t: item.t, modal, why: item.why || "", whyHtml: rule };
  const verb = `(${x.inf}${item.t === "pvmod" ? " · " + modal : ""})`;
  if (item.g === "aux") {
    const words = form.ans.split(" "), tab = item.t === "pf" ? AUX_PR : item.t === "pq" ? AUX_PT : K2_AUX;
    const o = [...new Set([tab.haben[p], tab.sein[p]])];
    if (o.length < 2) return null;
    return { ...base, aux: true, k: "pick", q: `${gqPron(p, x, item.t)} ___ ${words.slice(1).join(" ")} ${verb}${item.lbl || ""}`, o, a: o.indexOf(words[0]) };
  }
  if (item.t === "p2only") {
    const q = `Partizip II of **${x.inf}**`;
    if (item.ask === "pick") { const w = gqWrong(x, "p2only", p, form).slice(0, 2); if (!w.length) return null; const o = [form.ans, ...w]; return { ...base, k: "pick", q, o, a: 0 }; }
    return { ...base, k: "type", q, a: form.acc };
  }
  // One blank for the whole verb (prefix, pronoun, Sie included).
  const gaps = "___";
  const imp = /^im/.test(item.t);
  const ctx = form.ctx ? " " + form.ctx : "";
  const q = imp ? `(${p}) ${gaps}${ctx}! ${verb}${item.lbl || ""}` : `${gqPron(p, x, item.t)} ${gaps}${ctx} ${verb}${item.lbl || ""}`;
  if (item.ask === "pick") {
    const w = gqWrong(x, item.t, p, form, modal);
    if (w.length < 2) return null;
    // Two wrong ones: the most telling first, then one at random.
    const o = [form.ans, w[0], w[1 + Math.floor(Math.random() * Math.min(2, w.length - 1))]];
    return { ...base, k: "pick", q, o, a: 0 };
  }
  return { ...base, k: "type", q, a: form.acc };
}

// The French app's generated questions: "nous ___ (manger)", "que j' ___
// (aller)", "(tu) ___ ! (finir)", "en ___ (lire)", "(elle) ___ partie".
function gqResolveFr(item, sid, x, p, form) {
  const t = item.t, base = { at: item.at, sid, inf: x.inf, p, t, modal: "", why: item.why || "", whyHtml: VXF.ruleHtml(x, t, p) };
  const verb = `(${x.inf})`;
  if (item.g === "aux") {
    const words = form.ans.split(" "), o = VXF.auxOptions(t, p);
    if (x.F.refl || o.indexOf(words[0]) < 0) return null;
    return { ...base, aux: true, k: "pick", q: `(${p}) ___ ${words.slice(1).join(" ")} ${verb}${item.lbl || ""}`, o, a: o.indexOf(words[0]) };
  }
  if (t === "pp") {
    const q = `Participio de **${x.inf}**`;
    if (item.ask === "pick") { const w = gqWrong(x, t, p, form).slice(0, 2); if (w.length < 2) return null; return { ...base, k: "pick", q, o: [form.ans, ...w], a: 0 }; }
    return { ...base, k: "type", q, a: form.acc };
  }
  // One blank for the whole verb (the reflexive pronoun included), as in German.
  const gaps = "___", ctx = form.ctx ? " " + form.ctx : "";
  const pron = VXF.pron(t, p, form.ans);
  const q = t === "ip" ? `(${p}) ${gaps}${ctx} ! ${verb}${item.lbl || ""}` : `${pron} ${gaps}${ctx} ${verb}${item.lbl || ""}`;
  if (item.ask === "pick") {
    const w = gqWrong(x, t, p, form);
    if (w.length < 2) return null;
    const o = [form.ans, w[0], w[1 + Math.floor(Math.random() * Math.min(2, w.length - 1))]];
    return { ...base, k: "pick", q, o, a: 0 };
  }
  return { ...base, k: "type", q, a: form.acc };
}

// ── A SHEET'S QUIZ ────────────────────────────
// The sheet's points in reading order (structure only when asked about).
function gqPoints(sh) {
  const pts = [];
  if ((sh.quiz || []).some(q => q.at === "why")) pts.push("why");
  (sh.rules || []).forEach((_, i) => pts.push("r" + (i + 1)));
  if (sh.table) pts.push("table"); else if (sh.lines) pts.push("lines");
  if (sh.trap) pts.push("trap");
  return pts;
}
function gqPool(sh, at) { return (sh.quiz || []).filter(q => q.at === at); }
// How many questions a sheet asks (fixed by the sheet).
// A course sheet (course-de.js) asks qn of them: 3 drawn from 5+.
function gqSheetSize(sh) {
  if (sh.qn) return Math.min(sh.qn, gqPoints(sh).filter(at => gqPool(sh, at).length).length);
  const n = gqPoints(sh).reduce((s, at) => s + Math.min(gqPool(sh, at).length, (sh.qx && sh.qx[at]) || 1), 0);
  return Math.max(Math.min(GQ_MIN, (sh.quiz || []).length), Math.min(GQ_MAX, n));
}
// Draw `n` different questions from a point's pool. A verb already asked
// in this quiz is kept for last (one question must not give away
// another); the same question never comes twice.
const gqVerbOf = item => item.chk ? item.chk[0] : null;
function gqDraw(sh, at, n, avoid, seen) {
  const pool = shuffle(gqPool(sh, at).slice()), out = [];
  const fresh = pool.filter(i => !avoid.has(gqVerbOf(i))), later = pool.filter(i => avoid.has(gqVerbOf(i)));
  for (const item of [...fresh, ...later]) {
    if (out.length >= n) break;
    const q = gqResolve(item, sh.id, avoid);
    if (!q || seen.has(q.q)) continue;
    const v = q.inf || gqVerbOf(item);
    if (v) avoid.add(v);
    seen.add(q.q);
    out.push(q);
  }
  return out;
}
function gqSheetQuiz(sh) {
  const avoid = new Set(), seen = new Set(), out = [];
  if (sh.qn) {
    shuffle(gqPoints(sh).slice()).forEach(at => { if (out.length < gqSheetSize(sh)) out.push(...gqDraw(sh, at, 1, avoid, seen)); });
    return out;
  }
  gqPoints(sh).forEach(at => out.push(...gqDraw(sh, at, (sh.qx && sh.qx[at]) || 1, avoid, seen)));
  // A short sheet still asks three: more from its fullest points.
  const target = gqSheetSize(sh);
  for (const at of gqPoints(sh).sort((a, b) => gqPool(sh, b).length - gqPool(sh, a).length)) {
    if (out.length >= target) break;
    const have = out.filter(q => q.at === at).length;
    if (gqPool(sh, at).length > have) {
      const extra = gqDraw(sh, at, 1, avoid, seen);
      if (extra.length) out.push(extra[0]);
    }
  }
  return shuffle(out).slice(0, GQ_MAX);
}

// ── A TENSE'S MASTERY QUIZ ────────────────────
function gqMasterySize(unit) {
  const pts = vxSheetIds(unit).reduce((s, id) => s + gqPoints(vxSheet(id)).length, 0);
  return Math.max(GQ_M_MIN, Math.min(GQ_M_MAX, Math.round(pts * 0.6)));
}
// Round the sheets, a point from each in turn, until the size is reached;
// a generated question (your verbs) wherever the point has one.
// A small tense (fewer points than the size) asks a second question on
// some points — never the same written question twice.
function gqMasteryQuiz(unit) {
  const sheets = vxSheetIds(unit).map(vxSheet), size = gqMasterySize(unit), avoid = new Set(), out = [], used = new Set();
  const fill = () => sheets.map(sh => shuffle(gqPoints(sh).slice()).map(at => ({ sh, at })));
  let queues = fill();
  for (let pass = 0; out.length < size && pass < 4; pass++) {
    while (out.length < size && queues.some(q => q.length)) {
      for (const q of queues) {
        if (out.length >= size) break;
        const pt = q.shift();
        if (!pt) continue;
        const pool = gqPool(pt.sh, pt.at).filter(i => i.g || !used.has(i)), gen = pool.filter(i => i.g);
        const pick = [...shuffle((gen.length && Math.random() < 0.7 ? gen : pool).slice()), ...shuffle(pool.slice())];
        const order = [...pick.filter(i => !avoid.has(gqVerbOf(i))), ...pick.filter(i => avoid.has(gqVerbOf(i)))];
        for (const item of order) {
          const r = gqResolve(item, pt.sh.id, avoid);
          if (!r || out.some(o => o.q === r.q)) continue;
          if (r.inf || gqVerbOf(item)) avoid.add(r.inf || gqVerbOf(item));
          used.add(item); out.push(r); break;
        }
      }
    }
    queues = fill();
  }
  return shuffle(out);
}
// Where a point lives in the sheet viewer: the step and what to light up.
function gqPointStep(at) {
  if (at === "why") return { id: "struct" };
  if (/^r\d$/.test(at)) return { id: "rules", li: +at.slice(1) };
  if (at === "table" || at === "lines") return { id: "table" };
  return { id: "ex", trap: true };
}
// en: in English whatever the app (the learning log is for a tutor).
function gqPointName(at, en = false) {
  const T = en ? s => s.replace("{0}", at.slice(1)) : vxT;
  if (en) return at === "why" ? "the structure" : /^r\d$/.test(at) ? T("rule {0}") : at === "table" ? "the table" : at === "lines" ? "the list" : "the trap";
  return at === "why" ? vxT("the structure") : /^r\d$/.test(at) ? vxT("rule {0}", at.slice(1)) : at === "table" ? vxT("the table") : at === "lines" ? vxT("the list") : vxT("the trap");
}

if (typeof module !== "undefined") module.exports = { gqSheetQuiz, gqMasteryQuiz, gqSheetSize, gqPoints, gqResolve, GQ_SETS };
