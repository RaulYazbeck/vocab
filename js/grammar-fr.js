// ── FRENCH VERB ENGINE (+ its Spanish twin) ───
// French app only — every entry point returns null in the German app.
//
//   1. FRENCH FORMS — any verb × person × tense: Présent, Passé composé,
//      Imparfait, Plus-que-parfait, Futur proche, Futur, Conditionnel.
//      Regular -er / -ir / -re rules with their spelling changes
//      (commençons, mangeais, achète, appelle, répète, paie) plus a
//      table of irregular bases; compounds inherit from their base
//      (devenir ← venir, comprendre ← prendre, inscrire ← -crire).
//      Every form also comes split into its parts — stem, tense
//      marker, person ending, auxiliary — for the colour reveal.
//
//   2. SPANISH MEANINGS — the same person × tense in Spanish (México:
//      vous = ustedes; passé composé = pretérito: "as été" → "tú
//      fuiste"), from the Spanish the decks give the verb ("tomar"
//      for prendre). Regular rules + stem changes + irregular bases.
//
//   3. DECK EVIDENCE — like grammar-de.js: a verb (or tense) whose
//      forms disagree with a conjugation card is dropped, and so is a
//      Spanish tense that disagrees with a card's Spanish hint
//      ("seré / estaré"). The engine never shows a form the decks
//      contradict.
// ─────────────────────────────────────────────

const GR_FR = typeof WORD_KEY !== "undefined" && WORD_KEY === "fr";

const FR_PERSONS = ["je", "tu", "il", "nous", "vous", "ils"];
const FR_PERSON_LABEL = { je: "je", tu: "tu", il: "il/elle/on", nous: "nous", vous: "vous", ils: "ils/elles" };
// Timeline order (oldest → latest, then the "if…" cloud).
const FR_TENSES = [
  { id: "pq", name: "Plus-que-parfait" }, { id: "pc", name: "Passé composé" }, { id: "im", name: "Imparfait" },
  { id: "pr", name: "Présent" }, { id: "fp", name: "Futur proche" }, { id: "fu", name: "Futur" }, { id: "co", name: "Conditionnel" },
];
const FR_TENSE_BY_ID = Object.fromEntries(FR_TENSES.map(t => [t.id, t]));

const FR_VOWEL_RE = /^[aeiouyàâäéèêëîïôöùûüœæ]/i;
const FR_H_ASP_RE = /^(ha[iï]r|hach|hâ?t|han[dt]|harc|haus|heurt|his|hoch|hont|hu[eé]r|hurl|hiss|hériss|hal[eè]t|hasard|heurt)/i;
function frElides(s) { s = String(s || ""); return FR_VOWEL_RE.test(s) || (/^h/i.test(s) && !FR_H_ASP_RE.test(s)); }

// ── 1. FRENCH FORMS ───────────────────────────
// Irregular bases: "présent ×6 | participe passé | futur stem", options:
//   pfx: prefixes that make compounds of the base (devenir, apprendre)
//   sfx: a bound base that only exists inside compounds (-crire, -duire)
//   aux: "être" · imp: imparfait stem · only: impersonal (il only)
const FR_IRR = {
  "être": ["suis es est sommes êtes sont", "été", "ser", { imp: "ét" }],
  "avoir": ["ai as a avons avez ont", "eu", "aur"],
  "aller": ["vais vas va allons allez vont", "allé", "ir", { aux: "être" }],
  "faire": ["fais fais fait faisons faites font", "fait", "fer", { pfx: ["dé", "re", "satis", "contre"] }],
  "dire": ["dis dis dit disons dites disent", "dit", "dir", { pfx: ["re"] }],
  "interdire": ["interdis interdis interdit interdisons interdisez interdisent", "interdit", "interdir"],
  "prédire": ["prédis prédis prédit prédisons prédisez prédisent", "prédit", "prédir"],
  "contredire": ["contredis contredis contredit contredisons contredisez contredisent", "contredit", "contredir"],
  "venir": ["viens viens vient venons venez viennent", "venu", "viendr", { aux: "être", pfx: ["de", "re", "sou", "pré", "con", "inter", "par", "sur", "pro", "circon", "contre", "sub"] }],
  "tenir": ["tiens tiens tient tenons tenez tiennent", "tenu", "tiendr", { pfx: ["appar", "ob", "re", "con", "main", "sou", "dé", "entre", "abs"] }],
  "pouvoir": ["peux peux peut pouvons pouvez peuvent", "pu", "pourr"],
  "vouloir": ["veux veux veut voulons voulez veulent", "voulu", "voudr"],
  "devoir": ["dois dois doit devons devez doivent", "dû", "devr"],
  "savoir": ["sais sais sait savons savez savent", "su", "saur"],
  "voir": ["vois vois voit voyons voyez voient", "vu", "verr", { pfx: ["re", "entre"] }],
  "prévoir": ["prévois prévois prévoit prévoyons prévoyez prévoient", "prévu", "prévoir"],
  "croire": ["crois crois croit croyons croyez croient", "cru", "croir"],
  "boire": ["bois bois boit buvons buvez boivent", "bu", "boir"],
  "prendre": ["prends prends prend prenons prenez prennent", "pris", "prendr", { pfx: ["ap", "com", "re", "sur", "entre", "dé", "ré", "désap"] }],
  "mettre": ["mets mets met mettons mettez mettent", "mis", "mettr", { pfx: ["per", "pro", "ad", "re", "sou", "com", "trans", "entre", "ad", "o", "dé"] }],
  "lire": ["lis lis lit lisons lisez lisent", "lu", "lir", { pfx: ["re", "é"] }],
  "crire": ["cris cris crit crivons crivez crivent", "crit", "crir", { sfx: true, pfx: ["é", "dé", "ins", "pres", "sous", "trans", "circons", "pros", "ré", "réé", "rés"] }],
  "vivre": ["vis vis vit vivons vivez vivent", "vécu", "vivr", { pfx: ["sur", "re"] }],
  "suivre": ["suis suis suit suivons suivez suivent", "suivi", "suivr", { pfx: ["pour"] }],
  "connaître": ["connais connais connaît connaissons connaissez connaissent", "connu", "connaîtr", { pfx: ["re", "mé"] }],
  "paraître": ["parais parais paraît paraissons paraissez paraissent", "paru", "paraîtr", { pfx: ["ap", "dis", "re", "com"] }],
  "naître": ["nais nais naît naissons naissez naissent", "né", "naîtr", { aux: "être", pfx: ["re"] }],
  "partir": ["pars pars part partons partez partent", "parti", "partir", { aux: "être", pfx: ["re"] }],
  "sortir": ["sors sors sort sortons sortez sortent", "sorti", "sortir", { aux: "être", pfx: ["res"] }],
  "dormir": ["dors dors dort dormons dormez dorment", "dormi", "dormir", { pfx: ["en", "ren"] }],
  "sentir": ["sens sens sent sentons sentez sentent", "senti", "sentir", { pfx: ["res", "con", "pres"] }],
  "servir": ["sers sers sert servons servez servent", "servi", "servir", { pfx: ["des", "res"] }],
  "mentir": ["mens mens ment mentons mentez mentent", "menti", "mentir", { pfx: ["dé"] }],
  "ouvrir": ["ouvre ouvres ouvre ouvrons ouvrez ouvrent", "ouvert", "ouvrir", { pfx: ["r", "entr"] }],
  "couvrir": ["couvre couvres couvre couvrons couvrez couvrent", "couvert", "couvrir", { pfx: ["dé", "re", "redé"] }],
  "offrir": ["offre offres offre offrons offrez offrent", "offert", "offrir"],
  "souffrir": ["souffre souffres souffre souffrons souffrez souffrent", "souffert", "souffrir"],
  "cueillir": ["cueille cueilles cueille cueillons cueillez cueillent", "cueilli", "cueiller", { pfx: ["ac", "re"] }],
  "courir": ["cours cours court courons courez courent", "couru", "courr", { pfx: ["par", "se", "ac", "re", "con", "dis", "en"] }],
  "mourir": ["meurs meurs meurt mourons mourez meurent", "mort", "mourr", { aux: "être" }],
  "cevoir": ["çois çois çoit cevons cevez çoivent", "çu", "cevr", { sfx: true, pfx: ["re", "aper", "dé", "con", "per"] }],
  "asseoir": ["assieds assieds assied asseyons asseyez asseyent", "assis", "assiér", { pfx: ["r"] }],
  "falloir": ["faut faut faut faut faut faut", "fallu", "faudr", { only: "il", imp: "fall" }],
  "pleuvoir": ["pleut pleut pleut pleut pleut pleut", "plu", "pleuvr", { only: "il", imp: "pleuv" }],
  "valoir": ["vaux vaux vaut valons valez valent", "valu", "vaudr"],
  "rire": ["ris ris rit rions riez rient", "ri", "rir", { pfx: ["sou"] }],
  "duire": ["duis duis duit duisons duisez duisent", "duit", "duir", { sfx: true, pfx: ["con", "pro", "ré", "tra", "intro", "dé", "sé", "in", "re", "repro", "recon"] }],
  "truire": ["truis truis truit truisons truisez truisent", "truit", "truir", { sfx: true, pfx: ["cons", "dé", "ins", "recons"] }],
  "cuire": ["cuis cuis cuit cuisons cuisez cuisent", "cuit", "cuir", { pfx: ["re"] }],
  "plaire": ["plais plais plaît plaisons plaisez plaisent", "plu", "plair", { pfx: ["dé", "com"] }],
  "taire": ["tais tais tait taisons taisez taisent", "tu", "tair"],
  "eindre": ["eins eins eint eignons eignez eignent", "eint", "eindr", { sfx: true, pfx: ["ét", "p", "att", "t", "c", "f", "dép", "rest", "ast"] }],
  "oindre": ["oins oins oint oignons oignez oignent", "oint", "oindr", { sfx: true, pfx: ["j", "rej", "adj", "conj"] }],
  "aindre": ["ains ains aint aignons aignez aignent", "aint", "aindr", { sfx: true, pfx: ["cr", "pl", "contr"] }],
  "battre": ["bats bats bat battons battez battent", "battu", "battr", { pfx: ["com", "a", "dé", "re"] }],
  "rompre": ["romps romps rompt rompons rompez rompent", "rompu", "rompr", { pfx: ["inter", "cor"] }],
  "vaincre": ["vaincs vaincs vainc vainquons vainquez vainquent", "vaincu", "vaincr", { pfx: ["con"] }],
  "clure": ["clus clus clut cluons cluez cluent", "clu", "clur", { sfx: true, pfx: ["con", "ex", "in"] }],
  "résoudre": ["résous résous résout résolvons résolvez résolvent", "résolu", "résoudr"],
  "quérir": ["quiers quiers quiert quérons quérez quièrent", "quis", "querr", { sfx: true, pfx: ["ac", "con", "re", "en"] }],
  "fuir": ["fuis fuis fuit fuyons fuyez fuient", "fui", "fuir", { pfx: ["en"] }],
  "suffire": ["suffis suffis suffit suffisons suffisez suffisent", "suffi", "suffir"],
  "envoyer": ["envoie envoies envoie envoyons envoyez envoient", "envoyé", "enverr", { pfx: ["r"] }],
  "acquérir": null, // via -quérir
};
// Verbs that look like a compound of an irregular base but conjugate
// like finir (répartir: nous répartissons).
const FR_FINIR_ALSO = new Set(["répartir", "impartir", "assortir", "investir", "ressortir_"]);
// Passé composé with être (besides every reflexive verb).
const FR_ETRE = new Set(["aller", "venir", "devenir", "revenir", "parvenir", "intervenir", "survenir", "provenir", "arriver", "partir", "repartir",
  "sortir", "ressortir", "entrer", "rentrer", "monter", "remonter", "descendre", "redescendre", "rester", "tomber", "retomber", "retourner",
  "naître", "renaître", "mourir", "décéder", "apparaître", "advenir"]);
// -eler / -eter verbs that take è instead of doubling the consonant.
const FR_E_GRAVE_LT = new Set(["acheter", "racheter", "geler", "dégeler", "congeler", "surgeler", "peler", "modeler", "harceler", "marteler",
  "ciseler", "haleter", "déceler", "écarteler", "crocheter", "fureter", "celer"]);
// Never conjugated by the rules (rare / defective / unclear).
const FR_SKIP = new Set(["haïr", "gésir", "faillir", "bouillir", "vêtir", "revêtir", "maudire", "coudre", "moudre", "traire", "braire", "frire", "clore", "éclore", "luire", "nuire", "ouïr", "seoir", "choir", "déchoir", "mouvoir", "émouvoir", "promouvoir", "pourvoir", "surseoir"]);

const FR_ENDS = {
  pr_er: ["e", "es", "e", "ons", "ez", "ent"],
  im: ["ais", "ais", "ait", "ions", "iez", "aient"],
  fu: ["ai", "as", "a", "ons", "ez", "ont"],
};

function frIrrFor(inf) {
  if (FR_IRR[inf]) return { base: inf, pre: "", d: FR_IRR[inf] };
  let best = null;
  for (const base in FR_IRR) {
    const d = FR_IRR[base];
    if (!d || !inf.endsWith(base) || inf.length <= base.length) continue;
    const pre = inf.slice(0, -base.length);
    const o = d[3] || {};
    if (!(o.pfx || []).includes(pre)) continue;
    if (!best || base.length > best.base.length) best = { base, pre, d };
  }
  return best;
}

const _frFormsCache = new Map();
// The verb's whole paradigm → F, or null when the engine can't vouch
// for it. inf may carry its reflexive pronoun ("se lever", "s'habiller").
function frForms(inf) {
  if (!GR_FR && typeof module === "undefined") return null;
  inf = String(inf || "").trim().toLowerCase();
  if (_frFormsCache.has(inf)) return _frFormsCache.get(inf);
  const F = _frForms(inf);
  _frFormsCache.set(inf, F);
  return F;
}
function _frForms(full) {
  let refl = false, inf = full;
  const rm = full.match(/^(?:se\s+|s['’])(.+)$/);
  if (rm) { refl = true; inf = rm[1]; }
  if (!/^[a-zàâäéèêëîïôöùûüç]+$/.test(inf) || FR_SKIP.has(inf)) return null;
  const F = { inf: full, bare: inf, refl, pr: null, im: null, fu: null, pp: "", aux: "avoir", only: null, irr: false, group: "" };
  const irr = FR_FINIR_ALSO.has(inf) ? null : frIrrFor(inf);
  if (irr) {
    const [prS, pp, fut, o = {}] = irr.d;
    const pre = irr.pre;
    F.pr = prS.split(" ").map(x => pre + x);
    F.pp = pre + pp;
    F.futStem = pre + fut;
    F.irr = true; F.group = "irr"; F.base = irr.base;
    if (o.only) F.only = o.only;
    if (o.aux) F.aux = o.aux;
    F.impStem = o.imp ? pre + o.imp : F.pr[3].slice(0, -3);
  } else if (/er$/.test(inf) && inf.length > 2) {
    if (inf === "aller") return null;
    const st = inf.slice(0, -2);
    let boot = st, fut = inf;
    let m;
    if (/[ou]yer$/.test(inf)) { boot = st.slice(0, -1) + "i"; fut = boot + "er"; }
    else if (/ayer$/.test(inf)) { boot = st.slice(0, -1) + "i"; fut = boot + "er"; F.alt = { boot: st, fut: inf }; }
    else if ((m = st.match(/^(.*[^aeiouyàâäéèêëîïôöùûü])e([bcdfghjklmnpqrstvwxz])$/)) && !/[cg]$/.test(st)) {
      boot = (/[lt]/.test(m[2]) && !FR_E_GRAVE_LT.has(inf)) ? m[1] + "e" + m[2] + m[2] : m[1] + "è" + m[2];
      fut = boot + "er";
    } else if ((m = st.match(/^(.*)é([bcdfghjklmnpqrstvwxzç]+)$/))) {
      boot = m[1] + "è" + m[2];
    }
    const nousSt = /c$/.test(st) ? st.slice(0, -1) + "ç" : /g$/.test(st) ? st + "e" : st;
    F.pr = [boot + "e", boot + "es", boot + "e", nousSt + "ons", st + "ez", boot + "ent"];
    F.pp = st + "é";
    F.futStem = fut;
    F.impStem = nousSt;
    F.group = "er";
  } else if (/ir$/.test(inf)) {
    const st = inf.slice(0, -2);
    F.pr = [st + "is", st + "is", st + "it", st + "issons", st + "issez", st + "issent"];
    F.pp = st + "i";
    F.futStem = inf;
    F.impStem = st + "iss";
    F.group = "ir";
  } else if (/[^p]dre$/.test(inf) && !/(ein|oin|ain|soud|coud|moud)dre$/.test(inf)) {
    const st = inf.slice(0, -2);
    F.pr = [st + "s", st + "s", st, st + "ons", st + "ez", st + "ent"];
    F.pp = st + "u";
    F.futStem = st + "r";
    F.impStem = st;
    F.group = "re";
  } else return null;
  if (FR_ETRE.has(inf) || refl) F.aux = "être";
  // Imparfait: the nous stem + -ais… (mangeais / mangions, commençais / commencions).
  const softI = s => s.replace(/ç$/, "c").replace(/([g])e$/, "$1");
  F.im = FR_ENDS.im.map((e, i) => (i === 3 || i === 4 ? softI(F.impStem) : F.impStem) + e);
  F.fu = FR_ENDS.fu.map(e => F.futStem + e);
  F.co = FR_ENDS.im.map(e => F.futStem + e);
  return F;
}

const FR_AUX = {
  avoir: { pr: ["ai", "as", "a", "avons", "avez", "ont"], im: ["avais", "avais", "avait", "avions", "aviez", "avaient"] },
  "être": { pr: ["suis", "es", "est", "sommes", "êtes", "sont"], im: ["étais", "étais", "était", "étions", "étiez", "étaient"] },
};
const FR_ALLER_PR = ["vais", "vas", "va", "allons", "allez", "vont"];
const FR_REFL = ["me", "te", "se", "nous", "vous", "se"];
// The participle as the subject needs it (être: allée, allés, allées).
function frAgree(pp, i, fem) {
  const pl = i >= 3;
  let s = pp;
  if (fem) s = /e$/.test(s) && !/é$/.test(s) ? s : s.replace(/û$/, "u") + "e";
  if (pl && !/[sx]$/.test(s)) s = s.replace(/û$/, "u") + "s";
  return s;
}
function frReflBefore(i, word) {
  const p = FR_REFL[i];
  return (p === "me" || p === "te" || p === "se") && frElides(word) ? p[0] + "'" : p + " ";
}

// One person × tense → { form, full, parts, aux } or null.
//   form  — what the card shows: "allons", "as été", "me suis levé"
//   full  — with the subject pronoun, for audio: "nous allons", "j'ai été"
//   parts — [{ t: text, k: "s"|"t"|"p"|"x"|" " }] stem / tense / person / reflexive
//   fem   — être compounds agree: "est allée", "sont arrivées"
function frCell(F, tense, person, opts = {}) {
  if (!F) return null;
  const i = FR_PERSONS.indexOf(person);
  if (i < 0) return null;
  if (F.only && person !== F.only) return null;
  const fem = !!opts.fem && (tense === "pc" || tense === "pq") && F.aux === "être";
  const R = F.refl ? i : -1;
  let parts = [];
  const add = (t, k) => { if (t) parts.push({ t, k }); };
  const refl = next => { if (R >= 0) add(frReflBefore(R, next).trim(), "x"); };
  const space = () => add(" ", " ");
  if (tense === "pr") {
    const f = F.pr[i];
    if (R >= 0) { refl(f); if (!/'$/.test(parts[parts.length - 1].t)) space(); }
    parts.push(...frSplitPr(F, f, i));
  } else if (tense === "im") {
    const f = F.im[i];
    if (R >= 0) { refl(f); if (!/'$/.test(parts[parts.length - 1].t)) space(); }
    const end = FR_ENDS.im[i], stem = f.slice(0, -end.length);
    const mark = end.startsWith("ai") ? "ai" : "i";
    add(stem, "s"); add(mark, "t"); add(end.slice(mark.length), "p");
  } else if (tense === "fu" || tense === "co") {
    const f = (tense === "fu" ? F.fu : F.co)[i];
    if (R >= 0) { refl(f); if (!/'$/.test(parts[parts.length - 1].t)) space(); }
    const end = (tense === "fu" ? FR_ENDS.fu : FR_ENDS.im)[i];
    const stem = F.futStem.slice(0, -1);
    if (tense === "fu") { add(stem, "s"); add("r", "t"); add(end, "p"); }
    else { const mark = end.startsWith("ai") ? "rai" : "ri"; add(stem, "s"); add(mark, "t"); add(end.slice(mark.length - 1), "p"); }
  } else if (tense === "pc" || tense === "pq") {
    const aux = FR_AUX[F.aux][tense === "pc" ? "pr" : "im"][i];
    if (R >= 0) { refl(aux); if (!/'$/.test(parts[parts.length - 1].t)) space(); }
    if (tense === "pc") add(aux, "p");
    else { const end = FR_ENDS.im[i], st = aux.slice(0, -end.length), mark = end.startsWith("ai") ? "ai" : "i"; add(st, "s"); add(mark, "t"); add(end.slice(mark.length), "p"); }
    space();
    add(F.aux === "être" ? frAgree(F.pp, i, fem) : F.pp, "t");
  } else if (tense === "fp") {
    const a = FR_ALLER_PR[i];
    add(a, "p"); space();
    if (R >= 0) { refl(F.bare); if (!/'$/.test(parts[parts.length - 1].t)) space(); }
    add(F.bare, "t");
  } else return null;
  const form = parts.map(p => p.t).join("");
  const full = (person === "je" && frElides(form) ? "j'" : person + " ") + form;
  return { form, full, parts, aux: tense === "pc" || tense === "pq" ? F.aux : "" };
}
// Présent: stem + person ending where the form shows one ("parl|ons",
// "fin|issons"); a form with no clean ending (suis, vais, a) stays whole.
function frSplitPr(F, f, i) {
  if (["être", "avoir", "aller"].includes(F.base)) return [{ t: f, k: "p" }];
  const ends = [["e", "s", "x"], ["es", "s", "x"], ["e", "t", "d", "c"], ["issons", "ons"], ["issez", "ez", "es"], ["issent", "ent", "ont"]][i];
  for (const e of ends) {
    if (f.endsWith(e) && f.length > e.length + (i >= 3 ? 0 : 1)) {
      const st = f.slice(0, -e.length);
      if (!st) break;
      // "iss" belongs to the stem (finir type): fin|iss|ons — still the nous ending.
      if (e.startsWith("iss")) return [{ t: st, k: "s" }, { t: "iss", k: "s" }, { t: e.slice(3), k: "p" }];
      return [{ t: st, k: "s" }, { t: e, k: "p" }];
    }
  }
  return [{ t: f, k: "p" }];
}

// ── 2. SPANISH (the meanings of the French app) ──
// Persons as the French app maps them: je yo · tu tú · il él ·
// nous nosotros · vous ustedes · ils ellos. ustedes = the ellos form.
const ES_PRON = ["yo", "tú", "él", "nosotros", "ustedes", "ellos"];
const ES_IDX = [0, 1, 2, 3, 4, 4]; // French person → Spanish form (5 forms: yo tú él nos ellos)
const ES_REFL = ["me", "te", "se", "nos", "se", "se"];
const ES_INF_ENC = ["me", "te", "se", "nos", "se", "se"];
// Irregular bases. pr: whole present (5 forms) · yo: just yo ·
// ptS: strong preterite stem (tuv-) · ptJ: -eron after j (dijeron) ·
// pt: whole preterite · im: whole imperfect · fut: future stem · pp ·
// stem: present stem change ("ie" | "ue" | "i") · pfx: compound prefixes.
const ES_IRR = {
  ser: { pr: "soy eres es somos son", pt: "fui fuiste fue fuimos fueron", im: "era eras era éramos eran", pp: "sido" },
  ir: { pr: "voy vas va vamos van", pt: "fui fuiste fue fuimos fueron", im: "iba ibas iba íbamos iban", pp: "ido" },
  estar: { pr: "estoy estás está estamos están", ptS: "estuv" },
  haber: { pr: "he has ha hemos han", ptS: "hub", fut: "habr" },
  tener: { pr: "tengo tienes tiene tenemos tienen", ptS: "tuv", fut: "tendr", pfx: ["ob", "man", "con", "de", "sos", "re", "entre", "a"] },
  venir: { pr: "vengo vienes viene venimos vienen", ptS: "vin", fut: "vendr", pfx: ["pre", "con", "inter", "pro", "sobre", "re"] },
  poner: { yo: "pongo", ptS: "pus", fut: "pondr", pp: "puesto", pfx: ["com", "pro", "su", "im", "dis", "ex", "o", "re", "pos", "de", "trans"] },
  hacer: { yo: "hago", ptS: "hic", pt3: "hizo", fut: "har", pp: "hecho", pfx: ["des", "re"] },
  satisfacer: { yo: "satisfago", ptS: "satisfic", pt3: "satisfizo", fut: "satisfar", pp: "satisfecho" },
  decir: { pr: "digo dices dice decimos dicen", ptS: "dij", ptJ: true, fut: "dir", pp: "dicho", pfx: ["contra", "pre"] },
  traer: { yo: "traigo", ptS: "traj", ptJ: true, pfx: ["a", "dis", "con", "re", "sus"] },
  caer: { yo: "caigo", pfx: ["re", "de"] },
  "oír": { pr: "oigo oyes oye oímos oyen" },
  dar: { pr: "doy das da damos dan", pt: "di diste dio dimos dieron" },
  ver: { pr: "veo ves ve vemos ven", pt: "vi viste vio vimos vieron", im: "veía veías veía veíamos veían", pp: "visto" },
  saber: { yo: "sé", ptS: "sup", fut: "sabr" },
  caber: { yo: "quepo", ptS: "cup", fut: "cabr" },
  poder: { stem: "ue", ptS: "pud", fut: "podr" },
  querer: { stem: "ie", ptS: "quis", fut: "querr" },
  andar: { ptS: "anduv" },
  salir: { yo: "salgo", fut: "saldr", pfx: ["sobre"] },
  valer: { yo: "valgo", fut: "valdr", pfx: ["equi"] },
  ducir: { yo: "duzco", ptS: "duj", ptJ: true, sfx: true, pfx: ["con", "tra", "pro", "re", "intro", "de", "in", "se", "repro"] },
  morir: { stem: "ue", pp: "muerto" },
  oler: { pr: "huelo hueles huele olemos huelen" },
  "reír": { pr: "río ríes ríe reímos ríen", pt: "reí reíste rio reímos rieron", pfx: ["son"] },
  "freír": { pr: "frío fríes fríe freímos fríen", pt: "freí freíste frio freímos frieron", pp: "frito" },
  abrir: { pp: "abierto", pfx: ["entre", "re"] },
  cubrir: { pp: "cubierto", pfx: ["des", "en", "re"] },
  scribir: { pp: "scrito", sfx: true, pfx: ["e", "de", "in", "pre", "su", "tran", "pro", "re"] },
  romper: { pp: "roto" },
  volver: { stem: "ue", pp: "vuelto", pfx: ["de", "en", "re"] },
  solver: { stem: "ue", pp: "suelto", sfx: true, pfx: ["re", "ab", "di"] },
  imprimir: { pp: "impreso" },
  elegir: { stem: "i" }, corregir: { stem: "i" },
  jugar: { stem: "ue" },
  adquirir: { pr: "adquiero adquieres adquiere adquirimos adquieren" },
  prohibir: { pr: "prohíbo prohíbes prohíbe prohibimos prohíben" },
  reunir: { pr: "reúno reúnes reúne reunimos reúnen" },
};
const ES_IE = new Set(("pensar empezar comenzar cerrar despertar sentar entender perder preferir sentir mentir divertir encender defender nevar recomendar " +
  "calentar negar regar confesar atravesar gobernar apretar advertir convertir sugerir hervir herir consentir merendar fregar tropezar quebrar " +
  "temblar enterrar sembrar manifestar extender descender ascender atender tender encerrar arrepentir requerir invertir referir transferir " +
  "inferir digerir diferir interferir").split(" "));
const ES_UE = new Set(("encontrar contar costar mostrar recordar acordar acostar almorzar soñar probar mover llover doler colgar rogar sonar " +
  "volar aprobar demostrar torcer cocer soler morder renovar forzar esforzar descolgar apostar tostar consolar avergonzar recostar dormir " +
  "comprobar resonar promover remover conmover").split(" "));
const ES_I = new Set(("pedir repetir servir seguir conseguir perseguir vestir medir despedir impedir competir gemir rendir elegir corregir " +
  "reír sonreír freír expedir derretir").split(" "));
// A stem-changing verb keeps its change with a prefix (desvestir, proseguir, descontar).
const ES_SET_PFX = ["des", "re", "de", "con", "pro", "per", "com", "im", "ex", "sobre", "entre"];
function esInSet(set, inf) {
  if (set.has(inf)) return true;
  return ES_SET_PFX.some(p => inf.startsWith(p) && set.has(inf.slice(p.length)));
}
const ES_IAR = new Set(("enviar confiar esquiar guiar vaciar enfriar ampliar fotografiar variar desviar criar fiar espiar resfriar averiar " +
  "desafiar contrariar hastiar rociar reenviar").split(" "));
const ES_UAR = new Set("continuar actuar evaluar graduar situar acentuar insinuar efectuar habituar perpetuar".split(" "));
// Spanish verbs whose subject is the thing liked / hurting — "yo gusto"
// would be wrong: no meaning row for them.
const ES_NO = new Set(["gustar", "doler", "encantar", "interesar", "importar", "fascinar", "apetecer", "parecer_", "hacer falta"]);

function esStrip(s) { return s.replace(/[áéíóú]/g, c => ({ á: "a", é: "e", í: "i", ó: "o", ú: "u" })[c]); }
function esIrrFor(inf) {
  if (ES_IRR[inf] && !ES_IRR[inf].sfx) return { base: inf, pre: "", d: ES_IRR[inf] };
  let best = null;
  for (const base in ES_IRR) {
    if (!inf.endsWith(base) || inf.length <= base.length) continue;
    const pre = inf.slice(0, -base.length), d = ES_IRR[base];
    if (!(d.pfx || []).includes(pre)) continue;
    if (!best || base.length > best.base.length) best = { base, pre, d };
  }
  return best;
}
// Change the last e / o / u of a stem.
function esStemChange(stem, kind) {
  // The u of gu / qu is silent: seguir → sigue, not "seguie".
  const gu = stem.match(/([gq])u$/);
  if (gu) return esStemChange(stem.slice(0, -2) + gu[1].toUpperCase(), kind).replace(/[GQ]$/, c => c.toLowerCase() + "u");
  const re = kind === "ue" ? /(o|u)(?=[^aeiouáéíóú]*$)/ : /e(?=[^aeiouáéíóú]*$)/;
  const m = stem.match(re);
  if (!m) return stem;
  const to = kind === "ue" ? (m[1] === "u" ? "ue" : "ue") : kind === "ie" ? "ie" : "i";
  const i = m.index;
  let s = stem.slice(0, i) + to + stem.slice(i + 1);
  if (kind === "ue" && i === 0 && m[1] === "o") s = "hue" + stem.slice(1); // oler → huele
  return s;
}

const _esCache = new Map();
// A Spanish infinitive (maybe reflexive, maybe with words after it:
// "llamar por teléfono") → E with 5-form rows per tense, or null.
function esForms(phrase) {
  phrase = String(phrase || "").trim().toLowerCase();
  if (_esCache.has(phrase)) return _esCache.get(phrase);
  const E = _esForms(phrase);
  _esCache.set(phrase, E);
  return E;
}
function _esForms(phrase) {
  const words = phrase.split(/\s+/);
  let inf = words[0];
  const rest = words.slice(1).join(" ");
  if (ES_NO.has(inf) || ES_NO.has(phrase)) return null;
  let refl = false;
  if (/[aeií]rse$/.test(inf)) { refl = true; inf = inf.slice(0, -2); }
  if (!/^[a-záéíóúñü]*(ar|er|ir|ír)$/.test(inf)) return null;
  const irr = esIrrFor(inf);
  const d = irr ? irr.d : {};
  const pre = irr ? irr.pre : "";
  const P = s => s.split(" ").map(x => pre + x);
  const conj = inf.slice(-2).replace("í", "i"); // ar / er / ir
  const stem = inf.slice(0, -2);
  const kind = d.stem || (esInSet(ES_IE, inf) ? "ie" : esInSet(ES_UE, inf) ? "ue" : esInSet(ES_I, inf) ? "i" : "");
  const vowelStem = /[aeo]$/.test(stem) && conj !== "ar"; // leer, caer, oír, creer
  const uir = /[^g]uir$/.test(inf) || /^uir$/.test(inf);
  // ── presente
  let pr;
  if (d.pr) pr = P(d.pr);
  else {
    const endP = conj === "ar" ? ["o", "as", "a", "amos", "an"] : conj === "er" ? ["o", "es", "e", "emos", "en"] : ["o", "es", "e", "imos", "en"];
    let boot = kind ? esStemChange(stem, kind) : stem;
    if (ES_IAR.has(inf)) boot = stem.replace(/i$/, "í");
    if (ES_UAR.has(inf)) boot = stem.replace(/u$/, "ú");
    if (uir) boot = stem + "y";
    pr = endP.map((e, i) => (i === 3 ? stem : boot) + e);
    // yo spelling: escojo, sigo, conozco, venzo
    let yo = pr[0];
    if (d.yo) yo = pre + d.yo;
    else if (/g$/.test(boot) && conj !== "ar") yo = boot.slice(0, -1) + "jo";
    else if (/gu$/.test(boot) && conj === "ir") yo = boot.slice(0, -2) + "go";
    else if (/[aeiouáéíóú]c$/.test(stem) && conj !== "ar") yo = stem.slice(0, -1) + "zco";
    else if (/[^aeiouáéíóú]c$/.test(stem) && conj !== "ar") yo = boot.slice(0, -1) + "zo";
    pr[0] = yo;
  }
  // ── pretérito
  let pt;
  if (d.pt) pt = P(d.pt).map(x => pre && /rio$/.test(x) ? x.replace(/rio$/, "rió") : x); // rio, but sonrió
  else if (d.ptS) {
    const s = pre + d.ptS;
    pt = [s + "e", s + "iste", d.pt3 ? pre + d.pt3 : s + "o", s + "imos", s + (d.ptJ ? "eron" : "ieron")];
  } else if (conj === "ar") {
    const yoSt = /c$/.test(stem) ? stem.slice(0, -1) + "qu" : /gu$/.test(stem) ? stem.slice(0, -2) + "gü" : /g$/.test(stem) ? stem + "u" : /z$/.test(stem) ? stem.slice(0, -1) + "c" : stem;
    pt = [yoSt + "é", stem + "aste", stem + "ó", stem + "amos", stem + "aron"];
  } else if (vowelStem || uir) {
    pt = uir ? [stem + "í", stem + "iste", stem + "yó", stem + "imos", stem + "yeron"]
      : [stem + "í", stem + "íste", stem + "yó", stem + "ímos", stem + "yeron"];
  } else {
    const s3 = conj === "ir" && kind === "ue" ? esStemChange(stem, "ue").replace("ue", "u") : conj === "ir" && (kind === "ie" || kind === "i") ? esStemChange(stem, "i") : stem;
    pt = [stem + "í", stem + "iste", s3 + "ió", stem + "imos", s3 + "ieron"];
    // seguir → siguió; "gui" keeps the u
  }
  // ── imperfecto
  const im = d.im ? P(d.im) : conj === "ar" ? ["aba", "abas", "aba", "ábamos", "aban"].map(e => stem + e) : ["ía", "ías", "ía", "íamos", "ían"].map(e => stem + e);
  // ── futuro / condicional
  const fst = d.fut ? pre + d.fut : esStrip(inf);
  const fu = ["é", "ás", "á", "emos", "án"].map(e => fst + e);
  const co = ["ía", "ías", "ía", "íamos", "ían"].map(e => fst + e);
  // ── participio
  const pp = d.pp ? pre + d.pp : conj === "ar" ? stem + "ado" : vowelStem && !uir ? stem + "ído" : stem + "ido";
  return { inf, refl, rest, pr, pt, im, fu, co, pp, phrase };
}
const ES_HABER_IM = ["había", "habías", "había", "habíamos", "habían"];
const ES_IR_PR = ["voy", "vas", "va", "vamos", "van"];
// French tense → the Spanish phrase without the pronoun ("fuiste", "me levanté").
//   pr presente · pc pretérito · im imperfecto · pq pluscuamperfecto ·
//   fp ir a + inf · fu futuro · co condicional
function esCellForm(E, tense, person) {
  if (!E) return "";
  const fi = FR_PERSONS.indexOf(person);
  if (fi < 0) return "";
  const i = ES_IDX[fi];
  const r = E.refl ? ES_REFL[fi] + " " : "";
  const rest = E.rest ? " " + E.rest : "";
  let core;
  if (tense === "pr") core = r + E.pr[i];
  else if (tense === "pc") core = r + E.pt[i];
  else if (tense === "im") core = r + E.im[i];
  else if (tense === "pq") core = r + ES_HABER_IM[i] + " " + E.pp;
  else if (tense === "fu") core = r + E.fu[i];
  else if (tense === "co") core = r + E.co[i];
  else if (tense === "fp") core = ES_IR_PR[i] + " a " + E.inf + (E.refl ? ES_INF_ENC[fi] : "");
  else return "";
  return core + rest;
}
function esCell(E, tense, person) {
  const f = esCellForm(E, tense, person);
  return f ? ES_PRON[FR_PERSONS.indexOf(person)] + " " + f : "";
}

// ── 3. DECK EVIDENCE ──────────────────────────
// "être (imparfait) — j'" → { inf, tense, person }
const FR_CARD_TENSE = [[/plus-que-parfait/i, "pq"], [/imparfait/i, "im"], [/pass[ée] compos[ée]/i, "pc"], [/conditionnel/i, "co"], [/futur/i, "fu"], [/subjonctif/i, "sj"]];
function frCardParse(w) {
  const en = String(w.en || ""), fr = String(w.fr || "").trim();
  let m = en.match(/^(.+?)\s+—\s+(?:que\s+)?(j'|je|tu|il|elle|on|nous|vous|ils|elles)\s*$/i);
  if (m) {
    const label = m[1];
    const inf = label.replace(/\s*\(.*?\)\s*/g, " ").trim().toLowerCase();
    const hit = FR_CARD_TENSE.find(([re]) => re.test(label));
    const tense = hit ? hit[1] : "pr";
    const p = m[2].toLowerCase();
    const person = p === "j'" ? "je" : p === "elle" || p === "on" ? "il" : p === "elles" ? "ils" : p;
    return { inf, tense, person, ans: fr, hint: String(w.hint || "") };
  }
  // Futur proche cards: "je vais venir", "il va se lever"
  m = fr.match(/^(je|tu|il|elle|nous|vous|ils|elles)\s+(vais|vas|va|allons|allez|vont)\s+((?:se\s+|s')?[a-zàâäéèêëîïôöùûüç]+)$/i);
  if (m && /futur proche/i.test(en)) {
    const p = m[1].toLowerCase();
    const person = p === "elle" ? "il" : p === "elles" ? "ils" : p;
    return { inf: m[3].toLowerCase(), tense: "fp", person, ans: m[2] + " " + m[3], hint: "" };
  }
  return null;
}
// The Spanish verb a deck gives a French verb: "ser/estar" → "ser",
// "vivir (en un lugar)" → "vivir", "llamar por teléfono" stays whole.
function esFromDeck(en) {
  let s = String(en || "").replace(/\(.*?\)/g, " ").split(/\s*[\/,;]\s*|\s+—\s+/)[0].trim().toLowerCase();
  s = s.replace(/\s+/g, " ");
  if (!s || !/^[a-záéíóúñü]+(se)?(\s+[a-záéíóúñü]+){0,3}$/.test(s)) return "";
  if (!/^[a-záéíóúñü]*(ar|er|ir|ír)(se)?\b/.test(s)) return "";
  return s;
}
// A French verb whose Spanish reading isn't the deck's first word.
const ES_FOR_FR = { aimer: "amar", adorer: "adorar", plaire: "", falloir: "", pleuvoir: "llover", "être": "ser", devoir: "deber", partir: "irse", "s'asseoir": "sentarse" };

let _frBank = null;
function frVerbBank() {
  if (!GR_FR && typeof module === "undefined") return { verbs: [], byInf: new Map(), report: { checked: 0, mismatches: [], dropped: [] } };
  if (_frBank) return _frBank;
  const groups = (typeof ALL_GROUPS !== "undefined" ? ALL_GROUPS : []).filter(g => g.type !== "anki");
  const ev = new Map();
  const get = inf => { if (!ev.has(inf)) ev.set(inf, { inf, words: [], cards: [], es: "" }); return ev.get(inf); };
  const CONJ_DECK = /conj|imparfait|futur|pqp/;
  groups.forEach(g => g.decks.forEach(d => {
    d.words.forEach((w, i) => {
      if (CONJ_DECK.test(d.id)) {
        const c = frCardParse(w);
        if (c && c.tense !== "sj") get(c.inf).cards.push({ ...c, w, deckId: d.id, idx: i, level: g.id });
        return;
      }
      const fr = String(w.fr || "").trim().toLowerCase(), hint = String(w.hint || "");
      if (!/verbo/i.test(hint) || /adverbio/i.test(hint)) return;
      if (!/^(se |s')?[a-zàâäéèêëîïôöùûüç]+(er|ir|re|oir)$/.test(fr)) return;
      const e = get(fr);
      e.words.push({ w, deckId: d.id, idx: i, level: g.id });
      if (!e.es) e.es = esFromDeck(w.en);
    });
  }));
  const report = { checked: 0, mismatches: [], dropped: [], esMismatches: [], verbs: 0 };
  const verbs = [];
  const n1 = s => (typeof normalize === "function" ? normalize(String(s)) : String(s).toLowerCase()).replace(/\s+/g, " ").trim();
  ev.forEach(e => {
    const F = frForms(e.inf);
    if (!F) { report.dropped.push(e.inf + " (unparsed)"); return; }
    const bad = new Set(), esBad = new Set();
    let esInf = Object.prototype.hasOwnProperty.call(ES_FOR_FR, e.inf) ? ES_FOR_FR[e.inf] : e.es;
    if (!esInf) { const c = e.cards.find(c => c.tense === "pr" && c.hint); if (c) esInf = esFromDeck(c.hint); }
    const E = esInf ? esForms(esInf) : null;
    e.cards.forEach(c => {
      report.checked++;
      const cell = frCell(F, c.tense, c.person);
      if (!cell || n1(cell.form) !== n1(c.ans)) { bad.add(c.tense); report.mismatches.push(`${e.inf} ${c.tense} ${c.person}: ${cell ? cell.form : "—"} ≠ ${c.ans}`); }
      // Spanish hints of the past / future cards: "era / estaba", "tendrán (ustedes)", "había visto".
      if (E && c.hint && c.tense !== "pr" && c.tense !== "fp") {
        const alts = c.hint.split(/\s*\/\s*|\s+—\s+/).map(x => n1(x.replace(/\(.*?\)/g, "").replace(/^que\s+/, "")));
        const mine = n1(esCellForm(E, c.tense, c.person));
        if (!alts.some(a => a === mine || a.startsWith(mine + " ") || mine.endsWith(" " + a))) { esBad.add(c.tense); report.esMismatches.push(`${e.inf}/${esInf} ${c.tense} ${c.person}: ${mine} ∉ ${c.hint}`); }
      }
    });
    // A verb nobody conjugated for us and the rules can't vouch for:
    // irregular-looking -re / -oir verbs only pass through the table.
    if (!F.irr && F.group === "" ) { report.dropped.push(e.inf + " (no rule)"); return; }
    const tenses = FR_TENSES.map(t => t.id).filter(t => !bad.has(t) && frCell(F, t, F.only || "je"));
    if (!tenses.length) { report.dropped.push(e.inf + " (no tense)"); return; }
    const src = e.words[0] || e.cards[0] || null;
    verbs.push({
      inf: e.inf, F, tenses, es: E && E.phrase, E, esTenses: E ? tenses.filter(t => !esBad.has(t)) : [],
      word: src ? { ...src.w, deckId: src.deckId, idx: src.idx } : null, level: src ? src.level : "",
      words: e.words.map(x => ({ ...x.w, deckId: x.deckId, idx: x.idx })),
      cards: e.cards.map(c => ({ w: { ...c.w, deckId: c.deckId, idx: c.idx }, tense: c.tense, person: c.person })),
    });
  });
  report.verbs = verbs.length;
  _frBank = { verbs, byInf: new Map(verbs.map(v => [v.inf, v])), report };
  return _frBank;
}

if (typeof module !== "undefined") module.exports = { frForms, frCell, esForms, esCell, esCellForm, frVerbBank, frCardParse, esFromDeck, FR_TENSES, FR_PERSONS };
