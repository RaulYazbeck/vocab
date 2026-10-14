// ── THE VERB TRACK — FRENCH ───────────────────
// The French app's side of verb-track.js: the same system (tenses in
// order, bite-sized sheets with a quiz, rules asked with a different
// verb each time, per-verb items for what no rule builds, the ledger),
// taught to a Spanish speaker (México). Loaded before verb-track.js in
// the French app only; verb-track.js asks VXF wherever German and
// French differ. The sheets themselves are in grammar-sheets-fr.js.
//
//   FORMS — grammar-fr.js conjugates Présent, Passé composé, Imparfait,
//   Plus-que-parfait, Futur proche, Futur and Conditionnel. The track
//   also needs the Subjonctif (the ils stem + -e, -es, -e, -ions, -iez,
//   -ent; nous / vous = the imparfait), the Impératif (the présent,
//   -er verbs drop the s of tu), the Gérondif (en + nous stem + -ant),
//   the passive (être + an agreeing participle), the Conditionnel passé
//   and venir de + infinitive. All are built here from the engine's
//   paradigm; the Subjonctif is checked against the deck's cards.
//
//   RULES & ITEMS — a rule is one review card asked with your verbs in
//   turn (-er endings, avoir or être…); a verb gets its own item when no
//   rule builds it: an irregular présent (ils font), participle (pris)
//   or être verb (il est venu), futur stem (ir-), subjonctif (fasse),
//   impératif (sois) or gérondif (sachant).
//
//   THE LEDGER — every verb: its meaning Known, its own items Known,
//   and Présent · Passé composé · Futur produced right at least once
//   (the infinitive, the présent and the participle build the rest).
// ─────────────────────────────────────────────

const VXF_PERSONS = ["je", "tu", "il", "nous", "vous", "ils"];
// elle / elles: il / ils with the participle agreeing (être compounds).
const VXF_FEM = { elle: "il", elles: "ils" };
const VXF_ALLP = ["je", "tu", "il", "elle", "nous", "vous", "ils", "elles"];
function vxfBase(p) { return VXF_FEM[p] || p; }
function vxfIdx(p) { return FR_PERSONS.indexOf(vxfBase(p)); }

// ── WHAT KIND OF VERB ─────────────────────────
const VXF_PART = ["partir", "sortir", "dormir", "sentir", "servir", "mentir"];
const VXF_OUVRIR = ["ouvrir", "couvrir", "offrir", "souffrir", "cueillir"];
const VXF_MODAL = ["pouvoir", "vouloir", "devoir", "savoir"];
const VXF_BIG = ["aller", "faire", "venir", "prendre", "tenir", "dire", "mettre"];
const VXF_SJ_IRR = {
  "être": "sois sois soit soyons soyez soient", avoir: "aie aies ait ayons ayez aient",
  aller: "aille ailles aille allions alliez aillent", faire: "fasse fasses fasse fassions fassiez fassent",
  pouvoir: "puisse puisses puisse puissions puissiez puissent", savoir: "sache saches sache sachions sachiez sachent",
  vouloir: "veuille veuilles veuille voulions vouliez veuillent", valoir: "vaille vailles vaille valions valiez vaillent",
  falloir: "faille faille faille faille faille faille", pleuvoir: "pleuve pleuve pleuve pleuve pleuve pleuve",
};
const VXF_IP_IRR = { "être": ["sois", "soyons", "soyez"], avoir: ["aie", "ayons", "ayez"], savoir: ["sache", "sachons", "sachez"], vouloir: ["veuille", "veuillons", "veuillez"] };
const VXF_IP_NONE = ["pouvoir", "devoir", "valoir", "falloir", "pleuvoir"];
const VXF_GE_IRR = { "être": "étant", avoir: "ayant", savoir: "sachant" };
function vxfKind(F) {
  const bare = F.bare, base = F.irr ? F.base : bare, g = F.group, st = bare.slice(0, -2);
  const cg = g === "er" && /[cg]er$/.test(bare);
  const boot = g === "er" && F.pr[0] !== st + "e" && !/yer$/.test(bare);
  const yer = g === "er" && /yer$/.test(bare) && F.pr[0] !== st + "e";
  const part = g === "irr" && VXF_PART.includes(base);
  const ouvr = g === "irr" && VXF_OUVRIR.includes(base);
  const guess = g === "er" || /er$/.test(bare) ? st + "é" : /ir$/.test(bare) ? st + "i" : /re$/.test(bare) ? bare.slice(0, -2) + "u" : "";
  const futReg = F.futStem === bare || F.futStem === bare.replace(/e$/, "");
  const ils = F.pr[5].replace(/ent$/, ""), nous = (F.im[3] || "").replace(/ions$/, "");
  return {
    cg, boot, yer, spell: cg || boot || yer, part, ouvr,
    prIrr: g === "irr" && !part,
    ppIrr: F.pp !== guess,
    etre: F.aux === "être", etreVerb: F.aux === "être" && !F.refl,
    futReg, futSpell: g === "er" && !futReg, futIrr: g !== "er" && !futReg,
    sjIrr: !!VXF_SJ_IRR[base], sjTwo: !VXF_SJ_IRR[base] && ils !== nous,
    ipIrr: !!VXF_IP_IRR[base], ipNone: !!F.only || VXF_IP_NONE.includes(base),
    imIrr: base === "être", geIrr: !!VXF_GE_IRR[base],
    modal: VXF_MODAL.includes(base) && !F.refl, big: VXF_BIG.includes(base) && !F.refl, pv: VXF_PV_VERBS.has(F.inf),
    aux: (base === "être" || base === "avoir") && bare === base,
    // The verb-track.js flags German asks about: French never sets them.
    irregular: g === "irr", stem: false, glue: false,
  };
}

// ── FORMS ─────────────────────────────────────
const VXF_CO_AUX = { avoir: ["aurais", "aurais", "aurait", "aurions", "auriez", "auraient"], "être": ["serais", "serais", "serait", "serions", "seriez", "seraient"] };
const VXF_FU_ETRE = ["serai", "seras", "sera", "serons", "serez", "seront"];
const VXF_VENIR = ["viens", "viens", "vient", "venons", "venez", "viennent"];
function vxfPre(F, i, next) { return F.refl ? frReflBefore(i, next) : ""; }
// The Subjonctif row (no "que", reflexive pronoun included).
function vxfSubj(F, i) {
  const base = F.irr ? F.base : F.bare;
  let f;
  if (VXF_SJ_IRR[base]) {
    if (F.only && i !== 2) return null;
    f = (F.irr ? F.bare.slice(0, F.bare.length - base.length) : "") + VXF_SJ_IRR[base].split(" ")[i];
  } else {
    if (F.only && i !== 2) return null;
    const ils = F.pr[5];
    if (!/ent$/.test(ils)) return null;
    f = i === 3 || i === 4 ? F.im[i] : ils.slice(0, -3) + ["e", "es", "e", "", "", "ent"][i];
  }
  return vxfPre(F, i, f) + f;
}
// The Impératif (tu / nous / vous), or null.
function vxfImp(x, p) {
  const F = x.F, j = ["tu", "nous", "vous"].indexOf(p);
  if (j < 0 || x.k.ipNone) return null;
  const base = F.irr ? F.base : F.bare;
  let f;
  if (VXF_IP_IRR[base]) f = VXF_IP_IRR[base][j];
  else {
    f = F.pr[[1, 3, 4][j]];
    // tu parles → parle!, tu vas → va!, tu ouvres → ouvre!
    if (j === 0 && (F.group === "er" || x.k.ouvr || base === "aller") && /s$/.test(f)) f = f.slice(0, -1);
  }
  return F.refl ? `${f}-${["toi", "nous", "vous"][j]}` : f;
}
function vxfGerund(x) {
  const F = x.F, base = F.irr ? F.base : F.bare;
  if (F.only) return null;
  if (VXF_GE_IRR[base]) return VXF_GE_IRR[base];
  return F.impStem.replace(/ç$/, "ç") + "ant";
}
// Participles a compound may take for this person: elle / elles agree;
// je · tu · nous · vous with être can be either (vous: one person too).
function vxfPPs(F, p, always = false) {
  const i = vxfIdx(p), agree = always || F.aux === "être";
  if (!agree) return [F.pp];
  if (p === "elle" || p === "elles") return [frAgree(F.pp, i, true)];
  if (p === "il" || p === "ils") return [frAgree(F.pp, i, false)];
  const out = [frAgree(F.pp, i, false), frAgree(F.pp, i, true)];
  if (p === "vous") out.push(F.pp, frAgree(F.pp, 0, true));
  return [...new Set(out)];
}
function vxfOut(ans, acc = [], tail = "") {
  const all = [ans, ...acc].map(s => String(s).replace(/\s+/g, " ").replace(/' /g, "'").trim()).filter(Boolean);
  return { ans: all[0], acc: [...new Set(all)], tail, n: all[0].split(" ").length };
}
// One form for an exercise. kind: an engine tense (pr im fu co fp pc pq)
// or one of the track's own: sj · ip · ge · vd (venir de) · cp
// (conditionnel passé) · pvpr / pvpc / pvfu (passive) · pp (the
// participle alone). → { ans, acc, tail, n } or null.
// "Each other" verbs. se rencontrer, se connaître: "je me rencontre"
// isn't something one says — only nous / vous / ils. se disputer,
// s'entendre…: the singular needs someone to do it with — je me dispute
// AVEC ANNA; the question shows that context (ctx), as German does.
const VXF_RECIP_PLURAL = new Set(["se rencontrer", "se connaître", "se revoir"]);
const VXF_RECIP_CTX = { "se disputer": "avec Anna", "s'entendre": "avec Anna", "se retrouver": "avec Anna", "se battre": "avec Anna", "se séparer": "de Paul", "se fâcher": "avec Anna" };
function vxfForm(x, kind, p) {
  const sing = ["je", "tu", "il", "elle"].includes(p), whole = kind !== "pp" && kind !== "ge";
  if (VXF_RECIP_PLURAL.has(x.inf) && sing && whole) return null;
  const r = vxfForm1(x, kind, p);
  if (r && VXF_RECIP_CTX[x.inf] && sing && whole) r.ctx = VXF_RECIP_CTX[x.inf];
  return r;
}
function vxfForm1(x, kind, p) {
  const r = vxfForm0(x, kind, p);
  // payer: je paie and je paye are both right (paierai / payerai).
  if (r && /ayer$/.test(x.F.bare)) {
    const st = x.F.bare.slice(0, -3);
    r.acc = [...new Set([...r.acc, ...r.acc.map(a => a.replace(new RegExp(st + "i(?=e)"), st + "y"))])];
  }
  // répéter: je répéterai, and since the 1990 spelling reform répèterai.
  if (r && (kind === "fu" || kind === "co") && x.F.group === "er" && /é[^aeiouyé]+er$/.test(x.F.bare)) {
    const st = x.F.bare.slice(0, -2), alt = st.replace(/é([^aeiouyé]+)$/, "è$1");
    r.acc = [...new Set([...r.acc, ...r.acc.map(a => a.replace(st, alt))])];
  }
  return r;
}
function vxfForm0(x, kind, p) {
  const F = x.F, i = vxfIdx(p), fem = p === "elle" || p === "elles";
  if (F.only && kind !== "pp" && kind !== "ge" && vxfBase(p) !== F.only) return null;
  switch (kind) {
    case "pr": case "im": case "fu": case "co": case "fp": {
      if (i < 0 || !x.v.tenses.includes(kind)) return null;
      const c = frCell(F, kind, vxfBase(p));
      return c ? vxfOut(c.form) : null;
    }
    case "pc": case "pq": case "cp": {
      if (i < 0 || !F.pp || (kind !== "cp" && !x.v.tenses.includes(kind))) return null;
      const row = kind === "pc" ? FR_AUX[F.aux].pr : kind === "pq" ? FR_AUX[F.aux].im : VXF_CO_AUX[F.aux];
      const aux = row[i], pre = vxfPre(F, i, aux);
      return vxfOut(...((pps => [`${pre}${aux} ${pps[0]}`, pps.slice(1).map(pp => `${pre}${aux} ${pp}`)])(vxfPPs(F, p))));
    }
    case "sj": {
      if (i < 0) return null;
      const f = vxfSubj(F, i);
      return f ? vxfOut(f) : null;
    }
    case "ip": { const f = vxfImp(x, p); return f ? vxfOut(f) : null; }
    case "ge": { const f = vxfGerund(x); return f && !F.refl ? vxfOut(f, [`en ${f}`]) : null; }
    case "vd": {
      if (i < 0) return null;
      const inf = (F.refl ? frReflBefore(i, F.bare) : "") + F.bare;
      return vxfOut(`${VXF_VENIR[i]} ${frElides(inf) ? "d'" : "de "}${inf}`);
    }
    case "pvpr": case "pvpc": case "pvfu": {
      if (!x.k.pv || F.aux !== "avoir" || F.refl || !F.pp || !["il", "ils", "elle", "elles"].includes(p)) return null;
      const pl = i >= 3, aux = kind === "pvpr" ? (pl ? "sont" : "est") : kind === "pvpc" ? (pl ? "ont été" : "a été") : (pl ? "seront" : "sera");
      return vxfOut(`${aux} ${frAgree(F.pp, i, fem)}`);
    }
    case "pp": return F.pp ? vxfOut(F.pp) : null;
  }
  return null;
}
// Every tense the track can ask of this verb (the engine's, + its own).
function vxfHasTense(x, t) {
  if (x.v.tenses.includes(t)) return true;
  if (t === "sj") return !!vxfForm(x, "sj", x.F.only || "ils");
  if (t === "ip") return !!vxfForm(x, "ip", "vous");
  return false;
}

// ── DECK CARDS: what each one asks ────────────
// x.v.cards (grammar-fr.js) + the Subjonctif cards it leaves out + the
// participle decks ("hecho" → fait, "participio de faire — avoir").
let _vxfRefs = null;
function vxfRefsIndex() {
  if (_vxfRefs) return _vxfRefs;
  const m = new Map(), add = (inf, r) => { if (!m.has(inf)) m.set(inf, []); m.get(inf).push(r); };
  frVerbBank().verbs.forEach(v => (v.cards || []).forEach(c => add(v.inf, { deckId: c.w.deckId, idx: c.w.idx, tense: c.tense, person: c.person })));
  (typeof ALL_GROUPS !== "undefined" ? ALL_GROUPS : []).filter(g => g.type !== "anki").forEach(g => g.decks.forEach(d => {
    if (d.id === "b1_conj_subjonctif") d.words.forEach((w, i) => {
      const mm = String(w.en || "").match(/^(.+?)\s+—\s+(?:que\s+|qu['’])(j'|je|tu|il|elle|on|nous|vous|ils|elles)\s*$/i);
      if (!mm) return;
      const inf = mm[1].replace(/\s*\(.*?\)\s*/g, " ").trim().toLowerCase(), q = mm[2].toLowerCase();
      add(inf, { deckId: d.id, idx: i, tense: "sj", person: q === "j'" ? "je" : q === "elle" || q === "on" ? "il" : q === "elles" ? "ils" : q, ans: String(w.fr || "").trim() });
    });
    if (/participios$/.test(d.id)) d.words.forEach((w, i) => {
      const mm = String(w.hint || "").match(/participio de\s+((?:se\s+|s')?[a-zàâäéèêëîïôöùûüç]+)/i);
      if (mm) add(mm[1].toLowerCase(), { deckId: d.id, idx: i, tense: "pc", person: "il", pp: String(w.fr || "").trim() });
    });
  }));
  _vxfRefs = m;
  return m;
}
// A card counts only when its form is the track's: a Subjonctif or
// participle card the forms here disagree with is left alone.
function vxfRefs(x) {
  return (vxfRefsIndex().get(x.inf) || []).filter(r => {
    if (r.tense === "sj") { const f = vxfForm(x, "sj", r.person); return !!f && f.acc.some(a => vxfEq(a, r.ans)); }
    if (r.pp) return vxfEq(x.F.pp, r.pp);
    return true;
  });
}

// ── UNITS ─────────────────────────────────────
// Signs and colours follow Verb Thread's (verb-lab.js) where they meet.
const VXF_UNITS = [
  { id: "pr", name: "Présent", sub: "ahora, hábitos, verdades", sign: "◉", hue: 142, vl: "pr", anchor: ["a1", 0], req: [] },
  { id: "fp", name: "Futur proche", sub: "voy a… · acabo de…", sign: "➝", hue: 42, vl: "fp", anchor: ["a1", 0.15], req: ["pr"] },
  { id: "pc", name: "Passé composé", sub: "lo que pasó: comí, fui, he visto", sign: "●", hue: 212, vl: "pc", anchor: ["a1", 0.3], req: ["pr"] },
  { id: "ip", name: "Impératif", sub: "órdenes, consejos, instrucciones", sign: "!", hue: 96, vl: "", anchor: ["a1", 0.8], req: ["pr"] },
  { id: "im", name: "Imparfait", sub: "el pasado de fondo: era, tenía, iba", sign: "〰", hue: 186, vl: "im", anchor: ["a2", 0], req: ["pc"] },
  { id: "fu", name: "Futur simple", sub: "hablaré, iré, seré", sign: "✦", hue: 22, vl: "fu", anchor: ["a2", 0.3], req: ["pr"] },
  { id: "co", name: "Conditionnel", sub: "hablaría · por favor · si…", sign: "☁", hue: 330, vl: "co", anchor: ["a2", 0.65], req: ["fu", "im"] },
  { id: "pq", name: "Plus-que-parfait", sub: "había hecho — el pasado del pasado", sign: "⏮", hue: 268, vl: "pq", anchor: ["b1", 0], req: ["pc", "im"] },
  { id: "ge", name: "Gérondif", sub: "en + -ant: hablando, al llegar", sign: "⤳", hue: 165, vl: "", anchor: ["b1", 0.15], req: ["pr"] },
  { id: "sj", name: "Subjonctif", sub: "que yo sea — después de il faut que…", sign: "◈", hue: 290, vl: "", anchor: ["b1", 0.3], req: ["pr", "im"] },
  { id: "pv", name: "Voix passive", sub: "lo que se hace, no quién lo hace", sign: "⇄", hue: 52, vl: "", anchor: ["b1", 0.5], req: ["pc", "fu"] },
  { id: "cp", name: "Conditionnel passé", sub: "habría hecho · los arrepentimientos", sign: "☁", hue: 310, vl: "", anchor: ["b1", 0.7], req: ["co", "pq"] },
];

// ── RULES & PER-VERB ITEMS ────────────────────
// The verbs a passive is asked with: things that are done to something.
const VXF_PV_VERBS = new Set(("construire fabriquer vendre écrire ouvrir fermer réparer préparer organiser inviter choisir prendre faire acheter payer envoyer " +
  "livrer imprimer laver nettoyer utiliser traduire peindre produire publier détruire découvrir inventer fonder accepter refuser annuler réserver " +
  "confirmer signer recevoir voir entendre aimer respecter protéger élire interdire servir cuisiner remplir corriger vérifier contrôler rénover " +
  "transporter enregistrer partager voter emballer commander apporter donner offrir montrer expliquer présenter servir décorer dessiner louer " +
  "écouter regarder visiter attendre perdre trouver oublier poser placer ranger couper jeter préparer réveiller planter cultiver soigner examiner " +
  "opérer élever battre gagner fêter informer avertir arrêter juger condamner recruter embaucher licencier former choisir construire développer " +
  "créer réaliser diriger écrire composer chanter photographier filmer télécharger installer supprimer remplacer changer déplacer vider").split(/\s+/));
const VXF_RULES = [
  { id: "pr-er", unit: "pr", sheet: "pr1", kind: "pr", title: "Presente: -er", chip: "raíz + e · es · e · ons · ez · ent",
    verbs: x => x.F.group === "er" && !x.k.spell && !x.F.refl && !x.F.only, persons: () => VXF_PERSONS, order: () => 0,
    evid: (x, p) => x.F.group === "er" && !x.F.refl && (!x.k.spell || (x.k.cg ? p !== "nous" : p === "nous" || p === "vous")) },
  { id: "pr-spell", unit: "pr", sheet: "pr2", kind: "pr", title: "Cambios ortográficos", chip: "mangeons · commençons · achète · appelle · paie",
    verbs: x => x.k.spell && !x.F.refl, persons: x => x.k.cg ? ["nous"] : ["je", "tu", "il", "ils", "nous"], order: x => x.k.cg ? 0 : x.k.boot ? 1 : 2,
    evid: (x, p) => x.k.spell && (x.k.cg ? p === "nous" : ["je", "tu", "il", "ils"].includes(p)) },
  { id: "pr-ir", unit: "pr", sheet: "pr5", kind: "pr", title: "Presente: -ir como finir", chip: "is · is · it · issons · issez · issent",
    verbs: x => x.F.group === "ir" && !x.F.refl, persons: () => VXF_PERSONS, order: () => 0 },
  { id: "pr-part", unit: "pr", sheet: "pr5", kind: "pr", title: "Presente: partir, dormir…", chip: "pars · dors · sors — nous partons",
    verbs: x => x.k.part && !x.F.refl, persons: () => VXF_PERSONS, order: () => 0 },
  { id: "pr-re", unit: "pr", sheet: "pr6", kind: "pr", title: "Presente: -re como vendre", chip: "s · s · — · ons · ez · ent",
    verbs: x => x.F.group === "re" && !x.F.refl, persons: () => VXF_PERSONS, order: () => 0 },
  { id: "pr-refl", unit: "pr", sheet: "pr8", kind: "pr", title: "Verbos pronominales", chip: "me · te · se · nous · vous · se",
    verbs: x => x.F.refl && !x.F.only && !x.k.prIrr, persons: () => VXF_PERSONS, order: x => x.F.group === "er" && !x.k.spell ? 0 : 1 },
  { id: "fp", unit: "fp", sheet: "fp1", kind: "fp", title: "Futur proche", chip: "aller + infinitivo",
    verbs: x => x.v.tenses.includes("fp"), persons: () => VXF_PERSONS, order: x => x.F.refl ? 1 : 0 },
  { id: "vd", unit: "fp", sheet: "fp2", kind: "vd", title: "venir de + infinitivo", chip: "je viens de manger = acabo de comer",
    verbs: x => !x.F.only && x.v.tenses.includes("pr"), persons: () => VXF_PERSONS, order: x => x.F.refl ? 1 : 0 },
  { id: "pc-avoir", unit: "pc", sheet: "pc1", kind: "pc", title: "avoir + participio", chip: "ai · as · a … + parlé · fini · vendu",
    verbs: x => x.F.aux === "avoir" && !x.k.ppIrr && x.v.tenses.includes("pc"), persons: () => VXF_PERSONS, order: x => x.F.group === "er" ? 0 : x.F.group === "ir" ? 1 : 2 },
  { id: "pc-aux", unit: "pc", sheet: "pc3", kind: "pc", title: "¿avoir o être?", chip: "movimiento y cambio de estado → être",
    verbs: x => !x.F.refl && !!x.F.pp && x.v.tenses.includes("pc") && !x.k.aux, persons: () => VXF_ALLP, order: x => x.F.aux === "être" ? 0 : 1, mix: true },
  { id: "pc-refl", unit: "pc", sheet: "pc4", kind: "pc", title: "Pronominales en passé composé", chip: "je me suis levé(e) — siempre être",
    verbs: x => x.F.refl && x.v.tenses.includes("pc"), persons: () => VXF_ALLP, order: () => 0 },
  { id: "ip-reg", unit: "ip", sheet: "ip1", kind: "ip", title: "Imperativo", chip: "Parle ! · Parlons ! · Parlez !",
    verbs: x => !x.k.ipIrr && !x.k.ipNone && !x.F.refl, persons: () => ["tu", "nous", "vous"], order: x => x.F.group === "er" ? 0 : 1 },
  { id: "ip-refl", unit: "ip", sheet: "ip3", kind: "ip", title: "Imperativo pronominal", chip: "Lève-toi ! · Levons-nous ! · Levez-vous !",
    verbs: x => x.F.refl && !x.k.ipNone, persons: () => ["tu", "nous", "vous"], order: () => 0 },
  { id: "im", unit: "im", sheet: "im1", kind: "im", title: "Imparfait", chip: "raíz de nous + ais · ais · ait · ions · iez · aient",
    verbs: x => !x.k.imIrr && x.v.tenses.includes("im"), persons: () => VXF_PERSONS, order: x => x.k.cg ? 1 : 0 },
  { id: "fu-reg", unit: "fu", sheet: "fu1", kind: "fu", title: "Futur simple", chip: "infinitivo + ai · as · a · ons · ez · ont",
    verbs: x => x.k.futReg && x.v.tenses.includes("fu"), persons: () => VXF_PERSONS, order: x => x.F.group === "re" || /re$/.test(x.F.bare) ? 1 : 0 },
  { id: "fu-spell", unit: "fu", sheet: "fu3", kind: "fu", title: "Futur: cambios ortográficos", chip: "achèterai · appellerai · paierai",
    verbs: x => x.k.futSpell && x.v.tenses.includes("fu"), persons: () => VXF_PERSONS, order: () => 0 },
  { id: "co", unit: "co", sheet: "co1", kind: "co", title: "Conditionnel", chip: "raíz del futur + ais · ais · ait · ions · iez · aient",
    verbs: x => x.v.tenses.includes("co"), persons: () => VXF_PERSONS, order: x => x.k.futIrr ? 1 : 0 },
  { id: "pq", unit: "pq", sheet: "pq1", kind: "pq", title: "Plus-que-parfait", chip: "avais / étais + participio",
    verbs: x => x.v.tenses.includes("pq") && !x.k.aux, persons: () => VXF_ALLP, order: x => x.F.aux === "être" ? 1 : 0, mix: true },
  { id: "ge", unit: "ge", sheet: "ge1", kind: "ge", title: "Gérondif", chip: "en + raíz de nous + ant",
    verbs: x => !x.k.geIrr && !x.F.refl && !x.F.only, persons: () => ["il"], order: x => x.k.cg ? 1 : 0 },
  { id: "sj", unit: "sj", sheet: "sj1", kind: "sj", title: "Subjonctif", chip: "raíz de ils + e · es · e · ions · iez · ent",
    verbs: x => !x.k.sjIrr && !x.F.only, persons: () => VXF_PERSONS, order: x => x.k.sjTwo ? 1 : 0 },
  { id: "pv-pr", unit: "pv", sheet: "pv1", kind: "pvpr", title: "Pasiva en presente", chip: "est / sont + participio que concuerda",
    verbs: x => !!x.k.pv, persons: () => ["il", "elle", "ils", "elles"], order: () => 0 },
  { id: "pv-pc", unit: "pv", sheet: "pv2", kind: "pvpc", title: "Pasiva en passé composé", chip: "a été / ont été + participio",
    verbs: x => !!x.k.pv, persons: () => ["il", "elle", "ils", "elles"], order: () => 0 },
  { id: "pv-fu", unit: "pv", sheet: "pv2", kind: "pvfu", title: "Pasiva en futur", chip: "sera / seront + participio",
    verbs: x => !!x.k.pv, persons: () => ["il", "elle", "ils", "elles"], order: () => 0 },
  { id: "cp", unit: "cp", sheet: "cp1", kind: "cp", title: "Conditionnel passé", chip: "aurais / serais + participio",
    verbs: x => !!x.F.pp && x.v.tenses.includes("pc") && !x.k.aux, persons: () => VXF_ALLP, order: x => x.F.aux === "être" ? 1 : 0, mix: true },
];
const VXF_ITEM_KINDS = {
  pr: { unit: "pr", sheet: x => x.k.aux ? "pr3" : x.k.modal ? "pr7" : x.k.ouvr ? "pr5" : "pr4", form: "pr", title: "Presente irregular", tense: "pr",
    persons: () => VXF_PERSONS },
  pp: { unit: "pc", sheet: x => x.k.etreVerb ? "pc3" : "pc2", form: "pc", title: "Passé composé", tense: "pc",
    persons: x => x.k.etreVerb ? ["il", "elle", "ils", "elles"] : ["il"] },
  ip: { unit: "ip", sheet: "ip2", form: "ip", title: "Imperativo irregular", tense: "ip", persons: () => ["tu", "vous"] },
  im: { unit: "im", sheet: "im1", form: "im", title: "Imparfait irregular", tense: "im", persons: () => VXF_PERSONS },
  fu: { unit: "fu", sheet: "fu2", form: "fu", title: "Raíz irregular del futur", tense: "fu", persons: () => VXF_PERSONS },
  sj: { unit: "sj", sheet: "sj2", form: "sj", title: "Subjonctif irregular", tense: "sj", persons: () => VXF_PERSONS },
  ge: { unit: "ge", sheet: "ge1", form: "ge", title: "Gérondif irregular", tense: "ge", persons: () => ["il"] },
};
// Does a verb need its own item of this kind (and no active card has it)?
function vxfNeedsItem(x, kind) {
  const k = x.k;
  if (kind === "pr") return k.prIrr && !vxActiveRef(x, "pr", ["je", "nous", "ils"]);
  if (kind === "pp") return !!x.F.pp && !x.F.refl && !k.aux && (k.ppIrr || k.etreVerb) && !vxActiveRef(x, "pc");
  if (kind === "ip") return k.ipIrr;
  if (kind === "im") return k.imIrr && !vxActiveRef(x, "im", ["je", "nous"]);
  if (kind === "fu") return k.futIrr && x.v.tenses.includes("fu") && !vxActiveRef(x, "fu", ["je", "nous"]);
  if (kind === "sj") return k.sjIrr && !!vxfForm(x, "sj", x.F.only || "ils");
  if (kind === "ge") return k.geIrr;
  return false;
}
// The logical order inside a level: the shapes met first, odd ones last.
function vxfItemOrder(x, kind) {
  const base = x.F.irr ? x.F.base : x.F.bare;
  if (kind === "pr") return x.k.aux ? 0 : x.k.big ? 1 : x.k.modal ? 2 : 3;
  if (kind === "pp") return x.k.etreVerb && !x.k.ppIrr ? 0 : x.k.etreVerb ? 1 : 2;
  if (kind === "sj" || kind === "ip" || kind === "ge") return ["être", "avoir", "aller", "faire"].includes(base) ? 0 : 1;
  return 0;
}

// ── RETIRED CARDS & GATED DECKS ───────────────
const VXF_GATE = { a1_conjugacion: "pr", b1_concordancia: "pc", b1_pasiva: "pv", b1_gerundio: "ge", b1_hipotesis: "co" };
const VXF_RETIRE_DECKS = new Set(["a2_conjugacion", "a2_imparfait", "a2_futur", "b1_futur", "b1_conj_conditionnel", "b1_conj_pqp", "b1_conj_subjonctif", "a2_participios", "b1_participios"]);
// What covers a card of a retiring deck: the verb's own item, or the rule
// that builds the form.
function vxfCover(x, r) {
  const k = x.k, t = r.tense;
  if (t === "pr") return vxfNeedsItem(x, "pr") ? { item: "pr:" + x.inf } : { rule: vxfPrRule(x) };
  if (t === "pc") return x.F.refl ? { rule: "pc-refl" } : vxfNeedsItem(x, "pp") ? { item: "pp:" + x.inf } : { rule: x.F.aux === "être" ? "pc-aux" : "pc-avoir" };
  if (t === "im") return vxfNeedsItem(x, "im") ? { item: "im:" + x.inf } : { rule: "im" };
  if (t === "fu") return vxfNeedsItem(x, "fu") ? { item: "fu:" + x.inf } : { rule: k.futSpell ? "fu-spell" : "fu-reg" };
  if (t === "co") return { rule: "co" };
  if (t === "pq") return { rule: "pq" };
  if (t === "fp") return { rule: "fp" };
  if (t === "sj") return vxfNeedsItem(x, "sj") ? { item: "sj:" + x.inf } : { rule: "sj" };
  return null;
}
function vxfPrRule(x) {
  const k = x.k, F = x.F;
  return F.refl ? "pr-refl" : k.spell ? "pr-spell" : F.group === "ir" ? "pr-ir" : k.part ? "pr-part" : F.group === "re" ? "pr-re" : "pr-er";
}

// ── THE LEDGER'S CELLS ────────────────────────
const VXF_COV = ["pr", "pc", "fu", "im", "co", "pq", "fp", "sj", "ip"];
function vxfCellPersons(x, t) {
  if (x.F.only) return vxfForm(x, t, x.F.only) ? [x.F.only] : [];
  return (t === "ip" ? ["tu", "nous", "vous"] : VXF_PERSONS).filter(p => vxfForm(x, t, p));
}
function vxfCellOrder(x, t) {
  const k = x.k, F = x.F;
  if (t === "pr") return k.prIrr ? 4 : F.refl ? 3 : k.spell ? 2 : F.group === "er" ? 0 : 1;
  if (t === "pc") return F.refl ? 4 : k.ppIrr ? 3 : k.etreVerb ? 2 : F.group === "er" ? 0 : 1;
  if (t === "fu") return k.futIrr ? 2 : k.futSpell ? 1 : 0;
  return 0;
}
function vxfCellSheet(c) {
  const x = c.x, k = x.k, F = x.F;
  if (c.t === "pr") return k.prIrr ? VXF_ITEM_KINDS.pr.sheet(x) : F.refl ? "pr8" : k.spell ? "pr2" : F.group === "ir" || k.part ? "pr5" : F.group === "re" ? "pr6" : "pr1";
  if (c.t === "pc") return F.refl ? "pc4" : k.etreVerb ? "pc3" : k.ppIrr ? "pc2" : "pc1";
  if (c.t === "fu") return k.futIrr ? "fu2" : k.futSpell ? "fu3" : "fu1";
  return { im: "im1", co: "co1", pq: "pq1", fp: "fp1", sj: k.sjIrr ? "sj2" : "sj1", ip: k.ipIrr ? "ip2" : F.refl ? "ip3" : "ip1" }[c.t] || "";
}
// The item a missed drill flags for a typed check.
function vxfCellRuleItem(ex) {
  const x = ex.x, has = id => !!S.words[vxKey(id)];
  const t = ex.tense;
  if (t === "pr") return has("pr:" + x.inf) ? "pr:" + x.inf : x.k.prIrr ? null : "r:" + vxfPrRule(x);
  if (t === "pc") return has("pp:" + x.inf) ? "pp:" + x.inf : x.F.refl ? "r:pc-refl" : x.F.aux === "être" ? "r:pc-aux" : x.k.ppIrr ? null : "r:pc-avoir";
  if (t === "fu") return has("fu:" + x.inf) ? "fu:" + x.inf : x.k.futSpell ? "r:fu-spell" : x.k.futReg ? "r:fu-reg" : null;
  if (t === "im") return has("im:" + x.inf) ? "im:" + x.inf : "r:im";
  if (t === "sj") return has("sj:" + x.inf) ? "sj:" + x.inf : "r:sj";
  return { co: "r:co", pq: "r:pq", fp: "r:fp" }[t] || null;
}
// Items a form answered in a game stands for.
function vxfItemsForForm(x, tense, person) {
  const out = [], has = id => !!S.words[vxKey(id)];
  if (tense === "pr" && has("pr:" + x.inf)) out.push("pr:" + x.inf);
  if (tense === "pc" && has("pp:" + x.inf)) out.push("pp:" + x.inf);
  if (tense === "im" && has("im:" + x.inf)) out.push("im:" + x.inf);
  if (tense === "fu" && has("fu:" + x.inf)) out.push("fu:" + x.inf);
  VXF_RULES.forEach(r => { if (r.kind === tense && r.verbs(x) && vxRulePersons(r, x).includes(person) && has("r:" + r.id)) out.push("r:" + r.id); });
  return out;
}

// ── GRADING ───────────────────────────────────
// Accents are part of a French verb form (parle ≠ parlé, a ≠ à): forms
// are compared with them; one missing is "near" with a word on why.
// An apostrophe counts as a space (m habille), as on word cards; any
// apostrophe (’ ‘ ´) as the straight one; œ = oe, æ = ae.
function vxfEq(answer, typed) {
  const f = s => String(s || "").normalize("NFC").trim().toLowerCase().replace(/œ/g, "oe").replace(/æ/g, "ae")
    .replace(/['’‘`´ʼ\-]/g, " ").replace(/\s+/g, " ").trim();
  return f(answer) === f(typed);
}
const VXF_PRON_RE = /^(?:(?:que|qu['’‘`´ʼ]|qu)\s*)?(?:je\s+|j['’‘`´ʼ]\s*|j\s+|tu\s+|il\s+|elle\s+|on\s+|nous\s+|vous\s+|ils\s+|elles\s+)/i;
// A word left unelided before a vowel (je aime, me habille, que je aille,
// viens de arriver) counts too: the elided spelling is tried as well.
// (Quiz options that teach elision keep it: they are picked, not typed.)
const VXF_ELIDE_RE = /(^|\s)(je|me|te|se|que|de|ne)\s+(?=[aeiouyhàâäéèêëîïôöûüù])/gi;
function vxfElide(s) { return s.replace(VXF_ELIDE_RE, (m, sp, w) => sp + w.slice(0, -1) + "'"); }
// A command never has a pronoun in front: "tu parle" is not "Parle !".
function vxfGradeTries(val, imp = false) {
  const raw = String(val || "").trim().replace(/[’‘`´ʼ]/g, "'").replace(/\s*!+$/, "").trim();
  if (!raw) return [];
  if (imp) return [raw];
  const noPron = raw.replace(VXF_PRON_RE, "");
  const base = [raw, noPron, raw.replace(/^(que|qu')\s*/i, ""), raw.replace(/^en\s+/i, ""), noPron.replace(/\s*[,·/;…]\s*/g, " ")];
  return [...new Set([...base, ...base.map(vxfElide), ...base.map(vxfElide).map(t => t.replace(VXF_PRON_RE, ""))])].filter(Boolean);
}
// The mistake type, for the learning log.
function vxfClassify(given, F, tense, person) {
  // Without the subject pronoun — but "nous nous levons" keeps its second nous.
  const g0 = normalize(String(given || "")), g1 = g0.replace(/^(je|j|tu|il|elle|on|nous|vous|ils|elles) (?=\S)/, "");
  if (!g0) return "blank";
  const x = vxVerb(F.inf);
  if (!x) return "verbform";
  const forms = (t, p) => { const f = vxfForm(x, t, p); return f ? f.acc.map(a => normalize(a)) : []; };
  const want = forms(tense, person);
  const g = want.includes(g0) || !want.some(a => a.split(" ").length === g0.split(" ").length) ? g0 : g1;
  if (want.includes(g0) || want.includes(g1)) return "umlaut";
  const ps = tense === "ip" ? ["tu", "nous", "vous"] : VXF_PERSONS;
  if (ps.some(p => p !== vxfBase(person) && forms(tense, p).includes(g))) return "person";
  if (["pr", "im", "fu", "co", "pc", "pq", "sj", "fp"].some(t => t !== tense && VXF_PERSONS.some(p => forms(t, p).includes(g)))) return "tense";
  const gt = g.split(" ");
  if (["pc", "pq", "cp"].includes(tense) && F.pp) {
    const other = F.aux === "être" ? "avoir" : "être", i = vxfIdx(person);
    const oRow = tense === "pc" ? FR_AUX[other].pr : tense === "pq" ? FR_AUX[other].im : VXF_CO_AUX[other];
    if (gt.length >= 2 && normalize(oRow[i]) === gt[gt.length - 2]) return "aux";
    const strip = s => s.replace(/e?s?$/, "");
    if (want.some(a => a.split(" ").length === gt.length && strip(a) === strip(g))) return "agree";
    if (want.some(a => a.split(" ").slice(0, -1).join(" ") === gt.slice(0, -1).join(" "))) return "participle";
  }
  if (want.some(a => levenshtein(a, g) <= 2)) return "spelling";
  return "verbform";
}
function vxfMistakeType(given, ex) { return vxfClassify(given, ex.x.F, ex.kind, ex.p); }

// ── KINDS, LABELS ─────────────────────────────
// venir de (vd) and the participle alone (pp) fill no ledger cell.
const VXF_KIND_TENSE = { pr: "pr", im: "im", fu: "fu", co: "co", fp: "fp", vd: "vd", pc: "pc", pq: "pq", cp: "cp", sj: "sj", ip: "ip", ge: "ge",
  pvpr: "pv", pvpc: "pv", pvfu: "pv", pp: "pp" };
const VXF_TENSE_LABEL = { pr: "Présent", im: "Imparfait", fu: "Futur simple", co: "Conditionnel", fp: "Futur proche", pc: "Passé composé",
  pq: "Plus-que-parfait", cp: "Conditionnel passé", sj: "Subjonctif", ip: "Impératif", ge: "Gérondif", pv: "Voix passive", vd: "Passé récent", pp: "Participe passé" };
const VXF_TENSE_UNIT = { pr: "pr", im: "im", fu: "fu", co: "co", fp: "fp", vd: "fp", pp: "pc", pc: "pc", pq: "pq", cp: "cp", sj: "sj", ip: "ip", ge: "ge", pv: "pv" };
// The pronoun in front of a gap or an answer: "j'" before a vowel, "que"
// in the subjonctif, nothing in the impératif, "en" with the gérondif.
function vxfPron(kind, p, ans) {
  if (kind === "ip") return "";
  if (kind === "ge") return "en";
  const el = p === "je" && ans && frElides(ans);
  const pr = el ? "j'" : p;
  if (kind === "sj") return (/^[aeiouhéè]/i.test(pr) ? "qu'" : "que ") + pr;
  return pr;
}
// "que j'" + "aille" → no space after an apostrophe.
function vxfJoin(pron, form) { return !pron ? form : /'$/.test(pron) ? pron + form : pron + " " + form; }
function vxfSay(ex) { return ex.kind === "ip" ? ex.form.ans.replace(/-/g, " ") + " !" : vxfJoin(vxfPron(ex.kind, ex.p, ex.form.ans), ex.form.ans); }
// A one-line why for a form (feedback), in Spanish.
function vxfRuleHtml(x, kind, p) {
  const F = x.F, b = s => `<b>${escapeHtml(s)}</b>`, i = vxfIdx(p), base = F.irr ? F.base : F.bare;
  switch (kind) {
    case "pr": {
      if (x.k.prIrr) return `📏 ${b(F.inf)} es irregular en presente: aprende la fila.`;
      if (x.k.cg && p === "nous") return `📏 ${F.bare.endsWith("cer") ? "c → ç" : "g → ge"} antes de -ons: ${b(F.pr[3])}.`;
      if (x.k.spell && i !== 3 && i !== 4) return `📏 Donde la terminación no se oye (je, tu, il, ils), la raíz cambia: ${b(F.pr[0])} — pero nous ${b(F.pr[3])}.`;
      if (x.k.part) return `📏 Singular: raíz corta ${b(F.pr[0].slice(0, -1) + "-")} + s, s, t · plural: ${b(F.pr[3].slice(0, -3) + "-")} + ons, ez, ent.`;
      const ends = F.group === "ir" ? ["is", "is", "it", "issons", "issez", "issent"] : F.group === "re" ? ["s", "s", "—", "ons", "ez", "ent"] : ["e", "es", "e", "ons", "ez", "ent"];
      return `📏 Raíz ${b(F.bare.slice(0, -2) + "-")} + ${b(ends[i])}.`;
    }
    case "im": return x.k.imIrr ? `📏 être es la única excepción: ${b("ét-")} + ais, ais, ait…` : `📏 nous ${b(F.pr[3])} → raíz ${b(F.impStem.replace(/ç$/, "ç"))}- + ${b(FR_ENDS.im[i])}.`;
    case "fu": case "co": return `📏 Raíz ${b(F.futStem + "-")}${x.k.futIrr ? " (irregular)" : ""} + ${b((kind === "fu" ? FR_ENDS.fu : FR_ENDS.im)[i])}.`;
    case "fp": return `📏 aller (${b(FR_ALLER_PR[i])}) + infinitivo — sin «à».`;
    case "vd": return `📏 venir (${b(VXF_VENIR[i])}) + de + infinitivo = acabar de.`;
    case "pc": case "pq": case "cp": {
      const aux = F.aux === "être" ? "être" : "avoir";
      const why = F.refl ? " (verbo pronominal → être)" : F.aux === "être" ? " (verbo de movimiento / cambio → être, y el participio concuerda)" : "";
      return `📏 ${b(aux)}${why} + participio ${b(F.pp)}${x.k.ppIrr ? " (irregular)" : ""}.`;
    }
    case "sj": return x.k.sjIrr ? `📏 ${b(base)} tiene subjonctif propio.` : i === 3 || i === 4 ? `📏 nous / vous = el imparfait: ${b(F.im[i])}.` : `📏 ils ${b(F.pr[5])} → raíz ${b(F.pr[5].replace(/ent$/, ""))}- + ${b(["e", "es", "e", "", "", "ent"][i])}.`;
    case "ip": return x.k.ipIrr ? `📏 ${b(base)} toma su imperativo del subjonctif.` : `📏 El presente sin pronombre${p === "tu" && (F.group === "er" || x.k.ouvr || base === "aller") ? " — y en -er, tu pierde la s" : ""}.`;
    case "ge": return x.k.geIrr ? `📏 Irregular: ${b(VXF_GE_IRR[base])}.` : `📏 nous ${b(F.pr[3])} → en ${b(F.impStem)}${b("ant")}.`;
    case "pvpr": case "pvpc": case "pvfu": return `📏 être en el tiempo + participio que concuerda con el sujeto.`;
  }
  return "";
}
// The whole row of a tense for the feedback (je … ils).
// The whole row of a form, as cells: { pron, form, on } (Today's table).
function vxfRowCells(x, kind, p) {
  if (!["pr", "im", "fu", "co", "sj", "pc", "pq"].includes(kind)) return [];
  const cells = VXF_PERSONS.map(q => { const f = vxfForm(x, kind, q); return f ? { q, f: f.ans } : null; }).filter(Boolean);
  if (cells.length < 2) return [];
  return cells.map(c => ({ pron: vxfPron(kind, c.q, c.f), form: c.f, on: c.q === vxfBase(p) }));
}
function vxfRowHtml(x, kind, p) {
  const cells = vxfRowCells(x, kind, p);
  if (!cells.length) return "";
  return `<div class="vr-row">${cells.map(c => `<span class="vr-c${c.on ? " on" : ""}"><span class="vr-p">${escapeHtml(c.pron)}</span>${/'$/.test(c.pron) ? "" : " "}${escapeHtml(c.form)}</span>`).join("")}</div>`;
}
// Units already in use when the system is switched on.
function vxfSwitchOpen(pos) {
  const out = ["pr"];
  if (pos >= vxAnchorPos(VX_UNIT.fp) + 0.25) out.push("fp");
  if (pos >= vxAnchorPos(VX_UNIT.pc) + 0.25) out.push("pc");
  return out;
}

// ── QUIZ: VERB SETS & WRONG OPTIONS (grammar-quiz.js) ──
const VXF_GQ_SETS = {
  any: () => true,
  er: x => x.F.group === "er" && !x.k.spell && !x.F.refl && !x.F.only,
  spell: x => x.k.spell && !x.F.refl,
  cg: x => x.k.cg && !x.k.boot && !x.F.refl,
  boot: x => (x.k.boot || x.k.yer) && !x.F.refl,
  ir: x => x.F.group === "ir" && !x.F.refl,
  part: x => x.k.part && !x.F.refl,
  re: x => x.F.group === "re" && !x.F.refl,
  etreAvoir: x => x.k.aux,
  isEtre: x => x.inf === "être", isAvoir: x => x.inf === "avoir",
  big: x => x.k.big && x.F.bare === x.F.base,
  modal: x => x.k.modal,
  refl: x => x.F.refl && !x.k.prIrr && !x.F.only,
  reflAll: x => x.F.refl && !x.F.only,
  fp: x => !x.F.only && !x.F.refl,
  fpRefl: x => x.F.refl && !x.F.only,
  ppReg: x => x.F.aux === "avoir" && !x.k.ppIrr && !x.F.refl,
  ppIrr: x => x.k.ppIrr && !x.F.refl && !x.k.aux && !x.k.etreVerb,
  etre: x => x.k.etreVerb && !x.k.aux,
  avoir: x => x.F.aux === "avoir" && !x.F.refl && !x.k.aux && !x.F.only,
  auxAny: x => !x.F.refl && !x.k.aux && !x.F.only,
  ipEr: x => x.F.group === "er" && !x.F.refl && !x.k.ipNone,
  ipReg: x => !x.k.ipIrr && !x.k.ipNone && !x.F.refl,
  ipOther: x => x.F.group !== "er" && !x.k.ouvr && !x.k.ipIrr && !x.k.ipNone && !x.F.refl && x.F.base !== "aller",
  ipIrr: x => x.k.ipIrr,
  ipRefl: x => x.F.refl && !x.k.ipNone,
  im: x => !x.k.imIrr && !x.F.only,
  imCg: x => x.k.cg && !x.F.refl,
  imEtre: x => x.inf === "être",
  fuReg: x => x.k.futReg && !x.F.only && !x.F.refl,
  fuRe: x => x.k.futReg && /re$/.test(x.F.bare) && !x.F.refl,
  fuIrr: x => x.k.futIrr && !x.F.refl && !x.F.only,
  fuSpell: x => x.k.futSpell && !x.F.refl,
  co: x => !x.F.only && !x.F.refl,
  coModal: x => ["pouvoir", "vouloir", "devoir"].includes(x.inf),
  coIrr: x => x.k.futIrr && !x.F.refl && !x.F.only,
  pq: x => !x.F.refl && !x.k.aux && !x.F.only,
  ge: x => !x.k.geIrr && !x.F.refl && !x.F.only,
  geIrr: x => x.k.geIrr,
  sj: x => !x.k.sjIrr && !x.F.only && !x.F.refl,
  sjOne: x => !x.k.sjIrr && !x.k.sjTwo && !x.F.only && !x.F.refl,
  sjTwo: x => x.k.sjTwo && !x.F.only && !x.F.refl,
  sjIrr: x => x.k.sjIrr && !x.F.only,
  pv: x => !!x.k.pv,
  cp: x => !x.F.refl && !x.k.aux && !x.F.only,
};
// The mistakes a learner makes with this form — never a right answer.
function vxfGqWrong(x, t, p, form) {
  const F = x.F, ans = form.ans, out = [], i = vxfIdx(p);
  const cell = (tt, pp) => { const f = vxfForm(x, tt, pp); return f ? f.ans : ""; };
  const others = ps => ps.filter(q => q !== vxfBase(p)).map(q => cell(t, q));
  const bareSt = F.bare.slice(0, -2);
  const deAcc = s => String(s).normalize("NFD").replace(/[̀-ͯ]/g, "").normalize("NFC");
  const words = ans.split(" ");
  switch (t) {
    case "pr":
      if (x.k.cg && i === 3) out.push(bareSt + "ons");
      if ((x.k.boot || x.k.yer) && i !== 3 && i !== 4) out.push(bareSt + ["e", "es", "e", "", "", "ent"][i]);
      if ((x.k.boot || x.k.yer) && (i === 3 || i === 4)) out.push(F.pr[0].slice(0, -1) + (i === 3 ? "ons" : "ez"));
      if (F.group === "ir" && i >= 3) out.push(bareSt + ["", "", "", "ons", "ez", "ent"][i]);
      if (x.k.prIrr && i === 5) out.push(F.pr[3].replace(/ons$/, "ent"));
      if (x.k.prIrr && i === 4) out.push(F.pr[3].replace(/ons$/, "ez"));
      if (x.k.prIrr && i < 3 && /er$/.test(F.bare)) out.push(bareSt + ["e", "es", "e"][i]);
      out.push(...others(VXF_PERSONS));
      break;
    case "im":
      out.push(cell("pr", vxfBase(p)));
      if (x.k.cg) out.push(ans.replace(/^(.*)(ç|ge)(ai|i)/, (m, a, b, c) => a + (b === "ç" ? "c" : "g") + c));
      if (x.k.imIrr) out.push(["somais", "somais", "somait", "somions", "somiez", "somaient"][i]);
      out.push(...others(VXF_PERSONS));
      break;
    case "fu": case "co": {
      const twin = t === "fu" ? "co" : "fu";
      out.push(cell(twin, vxfBase(p)));
      const end = (t === "fu" ? FR_ENDS.fu : FR_ENDS.im)[i];
      if (x.k.futIrr || x.k.futSpell) out.push(F.bare.replace(/e$/, "") + end);
      if (/re$/.test(F.bare)) out.push(F.bare + end);
      if (t === "co") out.push(cell("im", vxfBase(p)));
      out.push(...others(VXF_PERSONS));
      break;
    }
    case "fp":
      out.push(`${words[0]} à ${words.slice(1).join(" ")}`, `${words[0]} ${F.pp || ""}`.trim(), ...others(VXF_PERSONS));
      break;
    case "vd":
      out.push(words.slice(0, 1).concat(words.slice(2)).join(" "), `${words[0]} de ${F.pp}`, ...others(VXF_PERSONS));
      break;
    case "pc": case "pq": case "cp": {
      const other = F.aux === "être" ? "avoir" : "être", row = t === "pc" ? FR_AUX[other].pr : t === "pq" ? FR_AUX[other].im : VXF_CO_AUX[other];
      const pre = F.refl ? frReflBefore(i, row[i]) : "";
      out.push(`${pre}${row[i]} ${F.pp}`.replace(/' /, "'"));
      if (F.aux === "être" && (p === "elle" || p === "elles" || p === "ils")) out.push(words.slice(0, -1).concat(F.pp).join(" "));
      out.push(words.slice(0, -1).concat(F.bare).join(" "));
      if (x.k.ppIrr) { const g = /er$/.test(F.bare) ? bareSt + "é" : /ir$/.test(F.bare) ? bareSt + "i" : F.bare.replace(/re$/, "u"); out.push(words.slice(0, -1).concat(g).join(" ")); }
      if (t === "pq") out.push(cell("pc", p));
      if (t === "cp") out.push(cell("pq", p), cell("co", vxfBase(p)));
      out.push(...others(VXF_PERSONS).map(o => o));
      break;
    }
    case "sj":
      out.push(cell("pr", vxfBase(p)));
      if (x.k.sjTwo && (i === 3 || i === 4)) out.push(vxfSubj(F, 0).replace(/e$/, i === 3 ? "ions" : "iez"));
      if (x.k.sjTwo && i !== 3 && i !== 4) out.push(F.im[3].replace(/ions$/, ["e", "es", "e", "", "", "ent"][i]));
      out.push(...others(VXF_PERSONS));
      break;
    case "ip":
      if (p === "tu" && /[^s]$/.test(ans.split("-")[0]) && F.group === "er") out.push(F.pr[1] + (F.refl ? "-toi" : ""));
      if (x.k.ipIrr) out.push(F.pr[[1, 3, 4][["tu", "nous", "vous"].indexOf(p)]]);
      if (F.refl) out.push(ans.replace(/-(toi|nous|vous)$/, "-" + ({ toi: "te", nous: "nous", vous: "vous" })[ans.split("-").pop()]).replace(/-nous$/, "-vous"), `${frReflBefore(["tu", "nous", "vous"].indexOf(p) === 0 ? 1 : ["tu", "nous", "vous"].indexOf(p) === 1 ? 3 : 4, F.pr[1])}${ans.split("-")[0]}`);
      out.push(...["tu", "nous", "vous"].filter(q => q !== p).map(q => { const f = vxfForm(x, "ip", q); return f ? f.ans : ""; }));
      break;
    case "ge":
      out.push(F.pr[5].replace(/ent$/, "ant"), F.pp, `${F.bare.replace(/(er|ir|re|oir)$/, "")}ant`);
      if (x.k.geIrr) out.push(F.pr[3].replace(/ons$/, "ant"));
      break;
    case "pvpr": case "pvpc": case "pvfu": {
      const head = words.slice(0, -1).join(" ");
      out.push(`${head} ${F.pp}`, `${head} ${F.bare}`, t === "pvpr" ? `${i >= 3 ? "ont" : "a"} ${F.pp}` : t === "pvpc" ? `${i >= 3 ? "sont" : "est"} été ${words[words.length - 1]}` : `${i >= 3 ? "auront" : "aura"} ${F.pp}`);
      if (/e?s?$/.test(words[words.length - 1])) out.push(`${head} ${frAgree(F.pp, i >= 3 ? 0 : 3, !(p === "elle" || p === "elles"))}`);
      break;
    }
    case "pp": {
      const g = /er$/.test(F.bare) ? bareSt + "é" : /ir$/.test(F.bare) ? bareSt + "i" : F.bare.replace(/re$/, "u").replace(/oir$/, "u");
      out.push(g, F.bare, deAcc(F.pp) !== F.pp ? deAcc(F.pp) : F.pp + "t");
      break;
    }
    default: out.push(...others(VXF_PERSONS));
  }
  void deAcc;
  return out;
}
// Auxiliary picks (g: "aux"): the two auxiliaries in the tense.
function vxfAuxOptions(t, p) {
  const i = vxfIdx(p);
  const row = a => t === "pc" ? FR_AUX[a].pr : t === "pq" ? FR_AUX[a].im : VXF_CO_AUX[a];
  return [row("avoir")[i], row("être")[i]];
}

// ── WORDS ON THE VERB-TRACK SCREENS (Spanish, México) ──
const VXF_ES = {
  // grammar-ui.js — the viewer and the quiz
  "Structure": "Estructura", "Rules": "Reglas", "Table": "Tabla", "List": "Lista", "Examples": "Ejemplos", "⚠️ The trap": "⚠️ La trampa",
  "Builds on:": "Se apoya en:", "Your verbs that do this · tap for the meaning": "Tus verbos que hacen esto · toca para ver el significado",
  "Back": "Atrás", "Back to the exercise": "Volver al ejercicio", "Quiz ▶": "Quiz ▶", "Next ›": "Siguiente ›", "back to the sheet": "de vuelta a la ficha",
  "Previous part": "Parte anterior", "Next part": "Parte siguiente", "Back to the quiz ▶": "Volver al quiz ▶", "🏆 optional": "🏆 opcional",
  "Question {0} of {1}": "Pregunta {0} de {1}", "Once more — the one you missed": "Otra vez — la que fallaste", "type it…": "escríbelo…",
  "tap the words in order": "toca las palabras en orden", "Your sentence": "Tu oración", "Check": "Revisar",
  "check the spelling": "revisa la ortografía",
  "≈ Almost — {0} — try again": "≈ Casi — {0} — inténtalo otra vez", "✓ Right": "✓ Correcto", "✗ Answer:": "✗ Respuesta:",
  "📖 See it in the sheet — {0}": "📖 Verlo en la ficha — {0}", "This question comes back once at the end.": "Esta pregunta vuelve una vez al final.",
  "See result": "Ver resultado", "To look at again": "Para repasar", "Mastery quiz": "Quiz de dominio", "{0} mastered!": "¡{0} dominado!",
  "Not yet": "Todavía no", "{0}/{1} right first time": "{0}/{1} correctas a la primera", " · mastery takes every question right the first time": " · el dominio pide todas las preguntas bien a la primera",
  "Take it again": "Hacerlo otra vez", "Retake — new questions": "Repetir — preguntas nuevas", "Done ✓": "Listo ✓", "Sheet passed": "Ficha aprobada",
  "{0} unlocked!": "¡{0} desbloqueado!", " · passing takes every question right the first time": " · para aprobar, todas bien a la primera",
  "It joins your reviews and the verb games from now on.": "Desde ahora entra en tus repasos y en los juegos de verbos.",
  " Its 🏆 mastery quiz is open in 📐 Grammar (optional).": " Su 🏆 quiz de dominio ya está abierto en 📐 Grammar (opcional).",
  "The sheet comes back in a later session, with new questions.": "La ficha vuelve en otra sesión, con preguntas nuevas.",
  "Read it again": "Leerla otra vez", "Retake": "Repetir", "Continue ▶": "Continuar ▶", "Later ▶": "Más tarde ▶", "Next sheet ›": "Siguiente ficha ›",
  "Close": "Cerrar", "Listen": "Escuchar",
  "the structure": "la estructura", "rule {0}": "la regla {0}", "the table": "la tabla", "the list": "la lista", "the trap": "la trampa",
  // the Grammar screens
  "📐 Grammar · Verbs": "📐 Gramática · Verbos", "/ {0} tenses open": "/ {0} tiempos abiertos", "/ {0} sheets": "/ {0} fichas", "/ {0} verbs complete": "/ {0} verbos completos",
  "📖 Your next lesson — also comes in Today": "📖 Tu próxima lección — también llega en Today", "📖 Your next lesson — in Today tomorrow, or read it now": "📖 Tu próxima lección — llega mañana en Today, o léela ahora", "The tenses, in the order you learn them": "Los tiempos, en el orden en que los aprendes",
  "ℹ️ How the verb track works": "ℹ️ Cómo funciona el sistema de verbos",
  "{0}/{1} read": "{0}/{1} leídas", "🏆 Mastered": "🏆 Dominado", "✅ Solid": "✅ Sólido", "🔁 Practising": "🔁 Practicando", "📖 Lesson {0}/{1}": "📖 Lección {0}/{1}",
  "after {0}": "después de {0}", "soon": "pronto", "📐 Grammar": "📐 Gramática", "← Tenses": "← Tiempos",
  "🔒 This tense opens {0}{1}. You can read its sheets now; passing every quiz opens it early.": "🔒 Este tiempo se abre {0}{1}. Ya puedes leer sus fichas; aprobar todos sus quizzes lo abre antes.",
  "around <b>{0}</b>": "alrededor del <b>{0}</b>", " — after {0}": " — después de {0}", " and ": " y ",
  "📌 These sheets come into Today by themselves, up to two a day — each ends with a short check.": "📌 Estas fichas llegan solas a Today, hasta dos al día — cada una termina con un pequeño quiz.",
  "All sheets done — reread any time.": "Todas las fichas hechas — reléelas cuando quieras.",
  "You already use this tense: the sheets are here to read when you want, nothing is due.": "Ya usas este tiempo: las fichas están aquí para leerlas cuando quieras, no hay nada pendiente.",
  "in Today": "en Today", "In your reviews": "En tus repasos", "Each rule is one review card in Today: one form to type, a different verb each time.": "Cada regla es una tarjeta de repaso en Today: una forma que escribir, con un verbo distinto cada vez.",
  "+ {0} verbs with their own item · {1} started · {2} 🌳 Known": "+ {0} verbos con su propia tarjeta · {1} empezados · {2} 🌳 Known",
  "Best {0}% — 100% to master": "Mejor {0}% — 100% para dominarlo", "{0} questions · 100% to master": "{0} preguntas · 100% para dominarlo",
  "Opens when all {0} sheets are passed ({1}/{0})": "Se abre al aprobar las {0} fichas ({1}/{0})", " · optional, outside your daily plan": " · opcional, fuera de tu plan diario",
  "📐 Grammar · 🏆 Mastery": "📐 Gramática · 🏆 Dominio",
  "New — not in your cards yet; starts in Today": "Nueva — todavía no está en tus tarjetas; empieza en Today", "Starts after the lesson": "Empieza después de la lección",
  "to practise": "por practicar", "due now": "toca ahora", "next check tomorrow": "próximo repaso mañana", "next check in {0} days": "próximo repaso en {0} días", "from your cards · ": "de tus tarjetas · ",
  "Learning": "Aprendiendo", "Familiar": "Conocida", "Known": "Sabida", "Known well": "Bien sabida", "Locked in": "Fijada",
  "The verb ledger": "El registro de verbos", "{0} / {1} verbs": "{0} / {1} verbos", "forms {0}/{1} · irregular items {2}/{3} Known": "formas {0}/{1} · tarjetas irregulares {2}/{3} Known",
  "📒 {0} verbs": "📒 Verbos {0}", "← Grammar": "← Gramática", "meaning": "significado", "own items": "tarjetas propias",
  "Dots fill when you produce that tense right (in Today, in Conjugation Slots, or on a card). A verb is complete with its meaning 🌳 Known, its own items 🌳 Known and all three dots.":
    "Los puntos se llenan cuando produces bien ese tiempo (en Today, en un juego o en una tarjeta). Un verbo está completo con su significado 🌳 Known, sus tarjetas propias 🌳 Known y los tres puntos.",
  // the tense drill (verb-drill.js)
  "🎯 Missed in a drill — a check": "🎯 Fallaste en la práctica — un repaso", "1 of your verbs, every person": "1 de tus verbos, todas las personas",
  "{0} of your verbs, taking turns": "{0} de tus verbos, por turnos", "None of your verbs fits this tense yet": "Ninguno de tus verbos sirve todavía para este tiempo",
  "Drill": "Práctica", "forms": "formas", "until you stop": "hasta que pares", "📐 Grammar · 🎯 Drill": "📐 Gramática · 🎯 Práctica",
  "Only verbs you've met, taking turns — every form typed, as in Today.": "Solo verbos que ya conoces, por turnos — cada forma escrita, como en Today.",
  "Outside your daily plan: nothing here counts in Today's numbers or the quests.": "Fuera de tu plan diario: nada de aquí cuenta en los números de Today ni en las misiones.",
  "A form right fills your verb ledger ahead of Today. A rule or verb item Today would check now can move up — never past 🌿 Familiar; the rest comes from Today.":
    "Una forma bien llena tu registro de verbos antes que Today. Una regla o tarjeta de verbo que Today revisaría ahora puede subir — nunca más allá de 🌿 Familiar; lo demás viene de Today.",
  "A miss comes back at the end of tomorrow's Today, as a check.": "Un error vuelve al final del Today de mañana, como repaso.",
  "Stop": "Parar", "↻ Your mistakes, once more — nothing moves": "↻ Tus errores, otra vez — nada se mueve",
  "🗓️ Checked again at the end of tomorrow's Today": "🗓️ Se repasa al final del Today de mañana",
  "📒 {0} forms done in your ledger": "📒 {0} formas hechas en tu registro", "↑ {0} moved up (🌿 Familiar at most)": "↑ {0} subieron (🌿 Familiar como máximo)",
  "🗓️ {0} to check at the end of tomorrow's Today": "🗓️ {0} por repasar al final del Today de mañana", "↻ Mistakes once more: {0}/{1} right": "↻ Errores otra vez: {0}/{1} bien",
  "{0}/{1} right": "{0}/{1} bien", " · outside your daily plan": " · fuera de tu plan diario", "Your mistakes": "Tus errores",
  "↻ Review my mistakes ({0})": "↻ Repasar mis errores ({0})", "🎯 Another round": "🎯 Otra ronda",
  // the Today card
  "📖 <b>{0}</b> lesson {1}/{2} · next sheet in your session": "📖 <b>{0}</b> lección {1}/{2} · la siguiente ficha llega en tu sesión",
  // Today's verb cards
  "Say": "Di", "Type": "Escribe",
  "🧩 Rule · {0}": "🧩 Regla · {0}", "📒 Ledger · {0} verbs": "📒 Registro · verbos {0}", "📒 {0} verb": "📒 verbo {0}",
  "One review, a different verb each time — your verbs, in order.": "Un repaso, con un verbo distinto cada vez — tus verbos, en orden.",
  " — not built by rule, so it has its own card": " — no sale de una regla, por eso tiene su propia tarjeta",
  "🧩 New verb item": "🧩 Nueva tarjeta de verbo", "📖 The sheet: {0}": "📖 La ficha: {0}", "Got it →": "Entendido →",
  "📒 new form": "📒 forma nueva", "🌱 New": "🌱 Nueva", "🩹 Repair round — one more try": "🩹 Ronda de reparación — un intento más",
  "🩹 Repair — get it right to keep its badge": "🩹 Reparación — acierta para conservar su insignia", "⚠️ Quick check": "⚠️ Revisión rápida",
  "↻ Once more": "↻ Otra vez", "🌱 From memory": "🌱 De memoria", "Show ▶": "Mostrar ▶", "💡 Hint": "💡 Pista", "? Don't know": "? No sé",
  "💡 It starts with": "💡 Empieza con", "✗ Not yet": "✗ Todavía no", "✓ I said it": "✓ Lo dije",
  "No step up, no step down — one more try at the end of this session.": "Ni sube ni baja — un intento más al final de esta sesión.",
  "✓ Correct!": "✓ ¡Correcto!", "✓ Counted": "✓ Contada", "— only the verb was needed": "— solo hacía falta el verbo", "Answer:": "Respuesta:", "🌳 Known!": "🌳 ¡Known!", "🩹 Repaired": "🩹 Reparada", "✓ Scheduled": "✓ Programada",
  "🩹 Badge kept — repair it next time": "🩹 Insignia conservada — repárala la próxima vez", "↓ back to {0}": "↓ de vuelta a {0}",
  "💡 with hint — no step up": "💡 con pista — no sube", "you typed": "escribiste", "— spelt {0}": "— se escribe {0}", "the full form": "la forma completa", "the full form…": "la forma completa…", "{0} — the full form…": "{0} — la forma completa…", "↺ That's the {0} — this one asks for the {1}.": "↺ Eso es {0} — aquí se pide {1}.", "Right verb, other tense: one more try.": "Verbo correcto, otro tiempo: un intento más.", "Almost": "Casi", "Open the sheet": "Abrir la ficha", "Next →": "Siguiente →",
  // verb-track.js
  "It joins your reviews and the verb games": "Entra en tus repasos y en los juegos de verbos", "Every rule of it 🌳 Known": "Todas sus reglas 🌳 Known",
  "{0} unlocked": "{0} desbloqueado", "{0} solid": "{0} sólido", "Verbs": "Verbos",
};
// The "how it works" box, in Spanish.
const VXF_HOW = `<p><b>Los tiempos se abren en orden</b> — cada uno después de los tiempos de los que se construye, y cuando tu Path llega hasta ahí (así tu fecha final marca el día). Un tiempo nuevo empieza con sus fichas en Today, una o dos al día; aprueba cada quiz y el tiempo entra en tus repasos y en los juegos de verbos.</p>
  <p><b>Reglas, no listas.</b> Cada regla es una tarjeta en tus repasos, y se pregunta cada vez con otro verbo que ya conoces — primero los de A1, los regulares antes que las excepciones. Los verbos que ninguna regla construye (ils font, il est venu, j'irai, que je fasse) tienen su propia tarjeta.</p>
  <p><b>El registro</b> revisa cada verbo: su significado Known, sus formas irregulares Known, y su Présent, Passé composé y Futur producidos bien al menos una vez — con el infinitivo, el presente y el participio se construye todo lo demás.</p>`;

// ── TOGETHER ──────────────────────────────────
const VXF = {
  persons: VXF_PERSONS, it: "il", langName: "French", core: ["pr", "pc", "fu"], coreLabel: "Présent · Passé composé · Futur",
  units: VXF_UNITS, rules: VXF_RULES, itemKinds: VXF_ITEM_KINDS, gate: VXF_GATE, retireDecks: VXF_RETIRE_DECKS, cov: VXF_COV,
  kindTense: VXF_KIND_TENSE, tenseLabel: VXF_TENSE_LABEL, tenseUnit: VXF_TENSE_UNIT,
  // kinds whose answers go into the learning log's verb history
  logKinds: ["pr", "im", "fu", "co", "fp", "pc", "pq", "sj", "ip", "cp"],
  bank: () => frVerbBank(), kind: vxfKind, form: vxfForm, hasTense: vxfHasTense, refs: vxfRefs, cover: vxfCover, needsItem: vxfNeedsItem,
  itemOrder: vxfItemOrder, cellPersons: vxfCellPersons, cellOrder: vxfCellOrder, cellSheet: vxfCellSheet, cellRuleItem: vxfCellRuleItem,
  itemsForForm: vxfItemsForForm, switchOpen: vxfSwitchOpen, eq: vxfEq, gradeTries: vxfGradeTries, mistake: vxfMistakeType, classify: vxfClassify,
  pron: vxfPron, join: vxfJoin, say: vxfSay, ruleHtml: vxfRuleHtml, rowHtml: vxfRowHtml, rowCells: vxfRowCells, gqSets: VXF_GQ_SETS, gqWrong: vxfGqWrong, auxOptions: vxfAuxOptions,
  es: VXF_ES, how: VXF_HOW,
};

if (typeof module !== "undefined") module.exports = { VXF };
