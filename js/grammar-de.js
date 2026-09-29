// ── GERMAN GRAMMAR ENGINE ─────────────────────
// Two small, rule-based engines the games build on (German app only —
// every entry point returns null in the French app):
//
//   1. ARTICLES & CASES — for a noun in an example sentence, the
//      determiner in front of it ("den" in "Öffnen Sie bitte den Mund"),
//      the other forms of its family (der/die/das/den/dem/des,
//      ein/eine/einen…) and WHY it is that form: gender + case, and the
//      preposition or verb that decides the case when there is one.
//      The right answer is always the sentence's own text — the engine
//      only explains it, it never invents German.
//
//   2. VERB FORMS — any verb × person × tense: Präsens, Präteritum,
//      Perfekt, Plusquamperfekt, Futur I, Konjunktiv II, Imperativ.
//      Built from spelling rules plus a table of strong/irregular base
//      verbs; compounds (ab|fahren, ver|stehen) inherit from their base.
//      Forms are only trusted after checking against the decks' own
//      data (conjugation cards, Partizip II cards, the "bog ab · ist
//      abgebogen" hints): verbConjugator() drops any verb (or tense)
//      that disagrees with a card, or that it can't back up.
// ─────────────────────────────────────────────

const GR_DE = typeof WORD_KEY === "undefined" || WORD_KEY !== "fr";

// ── 1. ARTICLES & CASES ───────────────────────
// Families: forms by [gender][case]; gender m/f/n/pl, case nom/akk/dat/gen.
const DET_FAMILIES = {
  def:  { m: ["der", "den", "dem", "des"], f: ["die", "die", "der", "der"], n: ["das", "das", "dem", "des"], pl: ["die", "die", "den", "der"] },
  ein:  { m: ["ein", "einen", "einem", "eines"], f: ["eine", "eine", "einer", "einer"], n: ["ein", "ein", "einem", "eines"] },
  kein: { m: ["", "en", "em", "es"], f: ["e", "e", "er", "er"], n: ["", "", "em", "es"], pl: ["e", "e", "en", "er"] },
  dies: { m: ["er", "en", "em", "es"], f: ["e", "e", "er", "er"], n: ["es", "es", "em", "es"], pl: ["e", "e", "en", "er"] },
};
const CASES = ["nom", "akk", "dat", "gen"];
const CASE_NAME = { nom: "Nominativ", akk: "Akkusativ", dat: "Dativ", gen: "Genitiv" };
const CASE_ROLE = { nom: "the subject (or the noun after sein / werden / bleiben)", akk: "the direct object", dat: "the indirect object (to / for whom)", gen: "whose / of what" };
// Fixed verb + preposition pairs (B1 "Verben mit Präpositionen"):
// [stem regex on any word of the sentence, preposition, case, label].
const VERB_PREP = [
  [/^(warte|wartet|wartest|wartete|gewartet|warten)$/, "auf", "akk", "warten auf"], [/^freu/, "auf", "akk", "sich freuen auf"], [/^freu/, "über", "akk", "sich freuen über"],
  [/^(denk|dachte|gedacht)/, "an", "akk", "denken an"], [/^erinner/, "an", "akk", "sich erinnern an"], [/^gewöhn/, "an", "akk", "sich gewöhnen an"],
  [/^glaub/, "an", "akk", "glauben an"], [/^(ärger)/, "über", "akk", "sich ärgern über"], [/^(sprech|sprich|sprach|gesprochen)/, "über", "akk", "sprechen über"],
  [/^(beschwer)/, "über", "akk", "sich beschweren über"], [/^(unterhalt|unterhielt)/, "über", "akk", "sich unterhalten über"], [/^(informier)/, "über", "akk", "sich informieren über"],
  [/^(nachdenk|nachgedacht|dachte)/, "über", "akk", "nachdenken über"], [/^(antwort|geantwortet)/, "auf", "akk", "antworten auf"], [/^(acht|geachtet)/, "auf", "akk", "achten auf"],
  [/^(pass|aufgepasst)/, "auf", "akk", "aufpassen auf"], [/^(hoff|gehofft)/, "auf", "akk", "hoffen auf"], [/^(konzentrier)/, "auf", "akk", "sich konzentrieren auf"],
  [/^(bereite|vorbereit)/, "auf", "akk", "sich vorbereiten auf"], [/^(reagier)/, "auf", "akk", "reagieren auf"], [/^(verzicht)/, "auf", "akk", "verzichten auf"],
  [/^(verlass|verließ)/, "auf", "akk", "sich verlassen auf"], [/^(verlieb)/, "in", "akk", "sich verlieben in"], [/^(teilnehm|nimmt|nahm|teilgenommen)/, "an", "dat", "teilnehmen an"],
  [/^(angst)$/i, "vor", "dat", "Angst haben vor"], [/^(schütz|geschützt)/, "vor", "dat", "schützen vor"], [/^(warn|gewarnt)/, "vor", "dat", "warnen vor"],
  [/^(zweifel|gezweifelt)/, "an", "dat", "zweifeln an"], [/^(arbeit|gearbeitet)/, "an", "dat", "arbeiten an"], [/^(leid|litt|gelitten)/, "an", "dat", "leiden an"],
];
const COPULA = /^(bin|bist|ist|sind|seid|war|warst|waren|wart|wird|werde|wirst|werden|werdet|wurde|wurden|bleibt|bleibe|bleiben|blieb|heißt|heiße|heißen|hieß|gewesen|geworden|geblieben)$/i;
const SUBJ_PRON = /^(ich|du|er|wir|ihr|man)$/i;
const GENDER_NAME = { m: "masculine", f: "feminine", n: "neuter", pl: "plural" };
// kein-type stems (possessives take ein-endings); dies-type stems take der-endings.
const KEIN_STEMS = ["kein", "mein", "dein", "sein", "ihr", "unser", "euer", "eur"];
const DIES_STEMS = ["dies", "jed", "welch", "jen", "manch", "solch"];
const PREP_DAT = ["aus", "bei", "mit", "nach", "seit", "von", "zu", "gegenüber", "außer", "ab"];
const PREP_AKK = ["durch", "für", "gegen", "ohne", "um", "bis", "entlang"];
const PREP_GEN = ["wegen", "während", "trotz", "statt", "anstatt", "innerhalb", "außerhalb", "aufgrund"];
const PREP_TWOWAY = ["an", "auf", "hinter", "in", "neben", "über", "unter", "vor", "zwischen"];
// Contractions: preposition + article in one word.
const CONTRACTIONS = {
  im: ["in", "dem"], am: ["an", "dem"], zum: ["zu", "dem"], zur: ["zu", "der"], vom: ["von", "dem"],
  beim: ["bei", "dem"], ins: ["in", "das"], ans: ["an", "das"], aufs: ["auf", "das"], ums: ["um", "das"],
};
// Common verbs whose object is Dativ (not Akkusativ).
const DAT_VERBS = /^(helfen|hilft|hilfst|half|geholfen|danken|dankt|dankte|gedankt|gefallen|gefällt|gefiel|gehören|gehört|gehörte|antworten|antwortet|antwortete|geantwortet|gratulieren|gratuliert|gratulierte|passen|passt|passte|gepasst|schmecken|schmeckt|schmeckte|geschmeckt|glauben|glaubt|glaubte|folgen|folgt|folgte|gefolgt|fehlen|fehlt|fehlte|begegnen|begegnet|begegnete|vertrauen|vertraut|vertraute|widersprechen|widerspricht|zuhören|hört|zuhörte)$/i;

// Parse a determiner token → { family, stem, cls } or null. The token
// is compared lower-case; capitalisation is restored by the caller.
function detParse(tok) {
  const t = String(tok || "").toLowerCase();
  for (const [g, forms] of Object.entries(DET_FAMILIES.def)) if (forms.includes(t)) return { fam: "def", stem: "", cap: tok };
  if (/^eine?[nmrs]?$/.test(t)) return { fam: "ein", stem: "", cap: tok };
  for (const s of KEIN_STEMS) {
    const rest = t.startsWith(s) ? t.slice(s.length) : null;
    if (rest !== null && /^(|e|en|em|er|es)$/.test(rest)) {
      // "euer" drops its e before an ending: eure, euren, eurem.
      if (s === "euer" && rest) continue;
      if (s === "eur" && !rest) continue;
      return { fam: "kein", stem: s === "euer" || s === "eur" ? "eur" : s, cap: tok };
    }
  }
  for (const s of DIES_STEMS) {
    const rest = t.startsWith(s) ? t.slice(s.length) : null;
    if (rest !== null && /^(e|en|em|er|es)$/.test(rest)) return { fam: "dies", stem: s, cap: tok };
  }
  return null;
}
// All forms of a determiner's family (lower case), for options.
function detFamilyForms(p) {
  const out = new Set();
  const fam = DET_FAMILIES[p.fam];
  Object.values(fam).forEach(row => row.forEach(e => {
    if (p.fam === "def" || p.fam === "ein") out.add(e);
    else if (p.stem === "eur" && e === "") out.add("euer");
    else out.add(p.stem + e);
  }));
  return [...out];
}
function detForm(p, g, c) {
  const fam = DET_FAMILIES[p.fam];
  const row = fam[g] || (p.fam === "ein" ? null : fam.pl);
  if (!row) return null;
  const e = row[CASES.indexOf(c)];
  if (p.fam === "def" || p.fam === "ein") return e;
  if (p.stem === "eur" && e === "") return "euer";
  return p.stem + e;
}
// Which (gender, case) pairs a form can be, given the noun's gender.
function detCases(p, form, g) {
  const f = form.toLowerCase();
  return CASES.filter(c => detForm(p, g, c) === f);
}
function capLike(model, s) { return /^[A-ZÄÖÜ]/.test(model) ? s[0].toUpperCase() + s.slice(1) : s; }

// The noun's gender and whether the sentence uses its plural.
function nounGenderOf(word) {
  if (!GR_DE || typeof nounParts !== "function") return null;
  const np = nounParts(word);
  if (!np) return null;
  return { g: { der: "m", die: "f", das: "n" }[np.answer], noun: np.noun };
}

// Case item for a noun word: finds its example sentence with a
// determiner (or contraction) right before the noun. Returns
//   { ex, parts, detIdx, nounIdx, det, answer, options[], g, plural,
//     cases[], reason, html (gap) , reveal }
// or null when the sentence has no clean determiner + noun.
const _caseCache = new Map();
function caseItem(word) {
  if (!GR_DE || !word) return null;
  const k = (word.deckId || "") + "_" + word.idx + "|" + word[WORD_KEY];
  if (_caseCache.has(k)) return _caseCache.get(k);
  const res = _caseItem(word);
  _caseCache.set(k, res);
  return res;
}
function _caseItem(word) {
  const ng = nounGenderOf(word);
  if (!ng) return null;
  const nounN = normalize(ng.noun);
  const plN = typeof germanPluralNoun === "function" ? normalize(germanPluralNoun(word) || "") : "";
  for (const ex of word.examples || []) {
    const s = ex && ex.de;
    if (!s) continue;
    const parts = s.split(/(\p{L}+)/u); // odd = words
    for (let i = 3; i < parts.length; i += 2) {
      const tokN = normalize(parts[i]);
      const plural = !!plN && plN !== nounN && tokN === plN;
      // The noun itself, or a case-marked form of it (-s/-es Genitiv,
      // -n/-en n-declension, -n Dativ plural).
      const isNoun = tokN === nounN || plural || (plN && tokN === plN + "n")
        || (tokN.startsWith(nounN) && /^(s|es|n|en)$/.test(tokN.slice(nounN.length)));
      if (!isNoun) continue;
      // Directly preceded by one space and a determiner — no adjective
      // in between (keeps the gap about the article alone).
      if (parts[i - 1] !== " ") return null;
      const detTok = parts[i - 2];
      const g = plural ? "pl" : ng.g;
      const lower = detTok.toLowerCase();
      let prep = "", item = null;
      if (CONTRACTIONS[lower]) {
        const [pr, art] = CONTRACTIONS[lower];
        prep = pr;
        const p = { fam: "def", stem: "" };
        const cases = detCases(p, art, g);
        if (!cases.length) return null;
        // Options: the contraction's siblings for this preposition.
        const opts = contractionOptions(pr, lower);
        item = { det: detTok, answer: detTok, family: "contr", cases, options: opts.map(o => capLike(detTok, o)), prep, art };
      } else {
        const p = detParse(detTok);
        if (!p) return null;
        const cases = detCases(p, lower, g);
        if (!cases.length) return null; // unexpected form → don't guess
        prep = i >= 4 && parts[i - 3] === " " ? String(parts[i - 4] || "").toLowerCase() : "";
        if (![...PREP_DAT, ...PREP_AKK, ...PREP_GEN, ...PREP_TWOWAY].includes(prep)) prep = "";
        item = { det: detTok, answer: detTok, family: p.fam, cases, options: detFamilyForms(p).map(o => capLike(detTok, o)), prep };
      }
      const before = parts.slice(0, i - 2).join(""), after = parts.slice(i + 1).join("");
      const noun = parts[i];
      return {
        ...item, ex, g, plural, noun, nounIdx: i,
        dict: capLike(detTok, ({ m: "der", f: "die", n: "das", pl: "die" })[g]) + " " + (plural ? ng.noun : ng.noun),
        html: `${escapeHtml(before)}<span class="cg-gap">___</span> ${escapeHtml(noun)}${escapeHtml(after)}`,
        gapBoth: `${escapeHtml(before)}<span class="hint-redacted"></span> <span class="hint-redacted"></span>${escapeHtml(after)}`,
        reveal: `${escapeHtml(before)}<mark class="hint-reveal">${escapeHtml(detTok)}</mark> ${escapeHtml(noun)}${escapeHtml(after)}`,
        reason: caseReason({ ...item, g, plural, sentence: s, first: !/\p{L}/u.test(before) }),
      };
    }
  }
  return null;
}
function contractionOptions(prep, answer) {
  const all = {
    in: ["im", "ins", "in der", "in den", "in die"], an: ["am", "ans", "an der", "an den", "an die"],
    zu: ["zum", "zur", "zu den"], von: ["vom", "von der", "von den"], bei: ["beim", "bei der", "bei den"],
    auf: ["aufs", "auf dem", "auf der", "auf den"], um: ["ums", "um den", "um die"],
  }[prep] || [answer];
  return all.includes(answer) ? all : [answer, ...all];
}
// Why this form — one short line, as HTML.
function caseReason(it) {
  const g = it.g, cs = it.cases;
  const gName = GENDER_NAME[g];
  const prep = (it.prep || "").toLowerCase();
  let c = cs.length === 1 ? cs[0] : null, why = "";
  if (PREP_DAT.includes(prep)) { c = "dat"; why = `<strong>${prep}</strong> always takes Dativ`; }
  else if (PREP_AKK.includes(prep)) { c = "akk"; why = `<strong>${prep}</strong> always takes Akkusativ`; }
  else if (PREP_GEN.includes(prep)) { c = cs.includes("gen") ? "gen" : cs.includes("dat") ? "dat" : c; why = `<strong>${prep}</strong> takes Genitiv${c === "dat" ? " (Dativ in speech)" : ""}`; }
  else if (PREP_TWOWAY.includes(prep)) {
    const words = (it.sentence || "").split(/[^\p{L}]+/u).map(t => t.toLowerCase());
    const vp = VERB_PREP.find(([re, pr, vc]) => pr === prep && cs.includes(vc) && words.some(t => re.test(t)));
    if (vp) { c = vp[2]; why = `fixed pair: <strong>${vp[3]}</strong> + ${CASE_NAME[vp[2]]}`; }
    else {
      c = cs.includes("dat") && !cs.includes("akk") ? "dat" : cs.includes("akk") && !cs.includes("dat") ? "akk" : c;
      why = c === "dat" ? `<strong>${prep}</strong> + Dativ = <em>wo?</em> (where — a place)` : c === "akk" ? `<strong>${prep}</strong> + Akkusativ = <em>wohin?</em> (where to — a direction), or a verb + preposition pair` : `<strong>${prep}</strong>: Dativ for <em>wo?</em>, Akkusativ for <em>wohin?</em>`;
    }
  }
  if (!why && cs.length > 1) {
    const toks = (it.sentence || "").split(/[^\p{L}]+/u).filter(Boolean);
    const verb = toks.find(t => DAT_VERBS.test(t));
    if (verb && cs.includes("dat")) { c = "dat"; why = `<strong>${escapeHtml(verb)}</strong> takes a Dativ object`; }
    else if (cs.includes("nom") && cs.includes("akk") && !prep) {
      // Nominativ or Akkusativ look alike (die, das, eine, ein): who's the subject?
      // Only the first clause counts: "Die Frau, die ich kenne…" has ich in another clause.
      const clause = (it.sentence || "").split(/[,;:–—]/)[0].split(/[^\p{L}]+/u).filter(Boolean);
      const pron = clause.find(t => SUBJ_PRON.test(t));
      const copula = clause.find(t => COPULA.test(t));
      const low = toks.map(t => t.toLowerCase());
      const esGibt = low.some((t, j) => (t === "gibt" && low[j + 1] === "es") || (t === "es" && /^(gibt|gab)$/.test(low[j + 1] || "")));
      if (esGibt) { c = "akk"; why = "<strong>es gibt</strong> + Akkusativ"; }
      else if (pron && copula) { c = "nom"; why = `after <strong>${escapeHtml(copula)}</strong> the noun stays Nominativ`; }
      else if (pron) { c = "akk"; why = `<strong>${escapeHtml(pron)}</strong> is the subject, so this is the object`; }
      else if (it.first) { c = "nom"; why = "it starts the sentence as its subject"; }
    }
  }
  const art = it.family === "contr" ? `${escapeHtml(it.det)} = ${escapeHtml(it.prep)} ${escapeHtml(it.art)}` : `<strong>${escapeHtml(it.det)}</strong>`;
  const caseTxt = c ? `${CASE_NAME[c]}` : cs.map(x => CASE_NAME[x]).join(" or ");
  if (!why && c) why = `${CASE_NAME[c]} = ${CASE_ROLE[c]}`;
  if (!why && !c && cs.length > 1) why = `${cs.map(x => CASE_NAME[x]).join(" and ")} look the same for ${gName} nouns`;
  return { c, html: `${art} · ${gName}${it.plural ? "" : ""} · ${caseTxt}${why ? ` — ${why}` : ""}` };
}
function caseWords(pool) { return typeof dedupeWords === "function" ? dedupeWords(pool.filter(w => caseItem(w))) : pool.filter(w => caseItem(w)); }

// ── GENDER RULES (for the "why" after a gender miss) ──
const GENDER_RULES = [
  [/(ung|heit|keit|schaft|ion|tät|ik|ur|enz|anz|ie|ei)$/, "f", ending => `Nouns ending in <strong>-${ending}</strong> are feminine`],
  [/(chen|lein|ment|um|tum|ma)$/, "n", ending => `Nouns ending in <strong>-${ending}</strong> are usually neuter`],
  [/(ling|ismus|ist|or|ant|ig|ich|eur)$/, "m", ending => `Nouns ending in <strong>-${ending}</strong> are usually masculine`],
  [/^ge.+e$/, "n", () => `<strong>Ge-…-e</strong> nouns are usually neuter`],
  [/(in)$/, "f", () => `Female person nouns in <strong>-in</strong> are feminine`],
];
function genderRuleHtml(noun, answer) {
  if (!GR_DE) return "";
  const low = String(noun || "").toLowerCase();
  const g = { der: "m", die: "f", das: "n" }[answer];
  for (const [re, rg, txt] of GENDER_RULES) {
    const m = low.match(re);
    if (!m) continue;
    const end = m[1] || m[0];
    if (rg === g) return `📏 ${txt(end)}.`;
    return `⚠️ An exception: most <strong>-${escapeHtml(end)}</strong> nouns are ${GENDER_NAME[rg]}, this one is ${GENDER_NAME[g]}.`;
  }
  return "";
}

// ── PLURAL PATTERNS (for the "why" after a plural miss) ──
function pluralRuleHtml(singularFull, plural) {
  if (!GR_DE) return "";
  const m = String(singularFull || "").match(/^(der|die|das)\s+(.+)$/);
  if (!m) return "";
  const sg = m[2], art = m[1], low = sg.toLowerCase();
  const ending = plural.toLowerCase().startsWith(low) ? plural.slice(sg.length) : null;
  const uml = !ending && plural.length >= sg.length && plural.toLowerCase() !== low;
  if (art === "die" && /e$/.test(low) && ending === "n") return "📏 Feminine nouns ending in <strong>-e</strong> add <strong>-n</strong>.";
  if (art === "die" && /(ung|heit|keit|schaft|ion|tät)$/.test(low)) return "📏 <strong>-ung, -heit, -keit, -schaft, -ion, -tät</strong> always add <strong>-en</strong>.";
  if (/in$/.test(low) && ending === "nen") return "📏 <strong>-in</strong> becomes <strong>-innen</strong>.";
  if (/(chen|lein)$/.test(low)) return "📏 <strong>-chen / -lein</strong> never change in the plural.";
  if (/(er|el|en)$/.test(low) && art !== "die" && (ending === "" || uml)) return `📏 Masculine/neuter <strong>-er, -el, -en</strong> nouns add nothing${uml ? " (sometimes an umlaut)" : ""}.`;
  if (/[aiouy]$/.test(low) && ending === "s") return "📏 Nouns ending in a vowel other than -e (Auto, Kino) usually add <strong>-s</strong>.";
  if (ending === "er" || (uml && /er$/.test(plural))) return "📏 <strong>-er</strong> plurals (often with umlaut) are mostly short neuter nouns: Kind → Kinder, Haus → Häuser.";
  if (art === "der" && (ending === "e" || (uml && /e$/.test(plural)))) return "📏 Most masculine nouns add <strong>-e</strong>, often with an umlaut: Stuhl → Stühle.";
  return "";
}

// ── WORD ORDER (for the "why" after a Sentence Builder miss) ──
const SUBORD = ["weil", "dass", "ob", "wenn", "als", "obwohl", "damit", "bevor", "nachdem", "während", "seit", "seitdem", "bis", "sodass", "falls", "indem", "ohne dass"];
const MODALS_ALL = /^(kann|kannst|können|könnt|muss|musst|müssen|müsst|will|willst|wollen|wollt|darf|darfst|dürfen|dürft|soll|sollst|sollen|sollt|möchte|möchtest|möchten|möchtet|konnte|musste|wollte|durfte|sollte)$/i;
function wordOrderRuleHtml(sentence) {
  if (!GR_DE) return "";
  const toks = String(sentence || "").replace(/[.,!?;:„“"]/g, " ").split(/\s+/).filter(Boolean);
  const low = toks.map(t => t.toLowerCase());
  const sub = low.find(t => SUBORD.includes(t));
  if (sub) return `📏 After <strong>${escapeHtml(sub)}</strong> the conjugated verb goes to the <strong>end</strong> of that clause.`;
  if (low.includes("zu") && /en$/.test(low[low.length - 1])) return "📏 With <strong>zu + infinitive</strong>, the infinitive goes last.";
  if (toks.some(t => MODALS_ALL.test(t))) return "📏 A modal verb sits in position 2; the other verb goes to the <strong>end</strong> as an infinitive.";
  if (low.some(t => /^(habe|hast|hat|haben|habt|bin|bist|ist|sind|seid)$/.test(t)) && /^ge\p{L}+(t|en)$/u.test(low[low.length - 1])) return "📏 Perfekt: <strong>haben/sein</strong> in position 2, the participle at the <strong>end</strong>.";
  if (/[?]\s*$/.test(sentence) && /^w/i.test(toks[0] || "")) return "📏 W-question: question word first, verb second.";
  if (/[?]\s*$/.test(sentence)) return "📏 Yes/no question: the verb comes <strong>first</strong>.";
  return "📏 Main clause: the conjugated verb is always in <strong>position 2</strong> — whatever comes first.";
}

// ── 2. VERB FORMS ─────────────────────────────
// Strong / irregular base verbs: inf → "er-present[/du]|Präteritum|Partizip II|aux".
// An empty present = regular present. aux h = haben, s = sein.
// Compounds derive from these; their aux is only trusted from deck data.
const STRONG_BASES = {
  backen: "|backte|gebacken|h", befehlen: "befiehlt|befahl|befohlen|h", ginnen: "|gann|gegonnen|h",
  beißen: "|biss|gebissen|h", trügen: "|trog|getrogen|h", bieten: "|bot|geboten|h", biegen: "|bog|gebogen|h",
  binden: "|band|gebunden|h", bitten: "|bat|gebeten|h", blasen: "bläst|blies|geblasen|h", bleiben: "|blieb|geblieben|s",
  braten: "brät/brätst|briet|gebraten|h", brechen: "bricht|brach|gebrochen|h", brennen: "|brannte|gebrannt|h",
  bringen: "|brachte|gebracht|h", denken: "|dachte|gedacht|h", dürfen: "darf|durfte|gedurft|h",
  empfehlen: "empfiehlt|empfahl|empfohlen|h", essen: "isst|aß|gegessen|h", fahren: "fährt|fuhr|gefahren|s",
  fallen: "fällt|fiel|gefallen|s", fangen: "fängt|fing|gefangen|h", finden: "|fand|gefunden|h",
  fliegen: "|flog|geflogen|s", fliehen: "|floh|geflohen|s", fließen: "|floss|geflossen|s", fressen: "frisst|fraß|gefressen|h",
  frieren: "|fror|gefroren|h", geben: "gibt|gab|gegeben|h", gehen: "|ging|gegangen|s", lingen: "|lang|gelungen|s",
  gelten: "gilt/giltst|galt|gegolten|h", nesen: "|nas|genesen|s", nießen: "|noss|genossen|h", schehen: "schieht|schah|geschehen|s",
  winnen: "|wann|gewonnen|h", gießen: "|goss|gegossen|h", gleichen: "|glich|geglichen|h", graben: "gräbt|grub|gegraben|h",
  greifen: "|griff|gegriffen|h", haben: "hat/hast|hatte|gehabt|h", halten: "hält/hältst|hielt|gehalten|h", hängen: "|hing|gehangen|h",
  heben: "|hob|gehoben|h", heißen: "|hieß|geheißen|h", helfen: "hilft|half|geholfen|h", kennen: "|kannte|gekannt|h",
  klingen: "|klang|geklungen|h", kommen: "|kam|gekommen|s", können: "kann|konnte|gekonnt|h", kriechen: "|kroch|gekrochen|s",
  laden: "lädt/lädst|lud|geladen|h", lassen: "lässt|ließ|gelassen|h", laufen: "läuft|lief|gelaufen|s",
  leiden: "|litt|gelitten|h", leihen: "|lieh|geliehen|h", lesen: "liest|las|gelesen|h", liegen: "|lag|gelegen|h",
  lügen: "|log|gelogen|h", meiden: "|mied|gemieden|h", messen: "misst|maß|gemessen|h", mögen: "mag|mochte|gemocht|h",
  müssen: "muss|musste|gemusst|h", nehmen: "nimmt|nahm|genommen|h", nennen: "|nannte|genannt|h",
  pfeifen: "|pfiff|gepfiffen|h", raten: "rät/rätst|riet|geraten|h", reiben: "|rieb|gerieben|h", reißen: "|riss|gerissen|h",
  rennen: "|rannte|gerannt|s", riechen: "|roch|gerochen|h", rufen: "|rief|gerufen|h", scheiden: "|schied|geschieden|h",
  scheinen: "|schien|geschienen|h", schieben: "|schob|geschoben|h", schießen: "|schoss|geschossen|h",
  schlafen: "schläft|schlief|geschlafen|h", schlagen: "schlägt|schlug|geschlagen|h", schleichen: "|schlich|geschlichen|s",
  schließen: "|schloss|geschlossen|h", schmeißen: "|schmiss|geschmissen|h", schmelzen: "schmilzt|schmolz|geschmolzen|s",
  schneiden: "|schnitt|geschnitten|h", schreiben: "|schrieb|geschrieben|h", schreien: "|schrie|geschrien|h",
  schweigen: "|schwieg|geschwiegen|h", schwimmen: "|schwamm|geschwommen|s", schwinden: "|schwand|geschwunden|s",
  sehen: "sieht|sah|gesehen|h", sein: "ist/bist|war|gewesen|s", singen: "|sang|gesungen|h", sinken: "|sank|gesunken|s",
  sitzen: "|saß|gesessen|h", sollen: "soll|sollte|gesollt|h", sprechen: "spricht|sprach|gesprochen|h",
  springen: "|sprang|gesprungen|s", stechen: "sticht|stach|gestochen|h", stehen: "|stand|gestanden|h",
  stehlen: "stiehlt|stahl|gestohlen|h", steigen: "|stieg|gestiegen|s", sterben: "stirbt|starb|gestorben|s",
  stinken: "|stank|gestunken|h", stoßen: "stößt|stieß|gestoßen|h", streichen: "|strich|gestrichen|h",
  streiten: "|stritt|gestritten|h", tragen: "trägt|trug|getragen|h", treffen: "trifft|traf|getroffen|h",
  treiben: "|trieb|getrieben|h", treten: "tritt/trittst|trat|getreten|h", trinken: "|trank|getrunken|h",
  tun: "tut|tat|getan|h", derben: "dirbt|darb|gedorben|h", gessen: "gisst|gaß|gegessen|h", lieren: "|lor|geloren|h",
  wachsen: "wächst|wuchs|gewachsen|s", waschen: "wäscht|wusch|gewaschen|h", weisen: "|wies|gewiesen|h",
  werben: "wirbt|warb|geworben|h", werden: "wird/wirst|wurde|geworden|s", werfen: "wirft|warf|geworfen|h",
  wiegen: "|wog|gewogen|h", wissen: "weiß|wusste|gewusst|h", wollen: "will|wollte|gewollt|h", zeihen: "|zieh|geziehen|h",
  ziehen: "|zog|gezogen|h", zwingen: "|zwang|gezwungen|h", sitzen: "|saß|gesessen|h", saufen: "säuft|soff|gesoffen|h",
  schwingen: "|schwang|geschwungen|h", stinken: "|stank|gestunken|h", gleiten: "|glitt|geglitten|s", reiten: "|ritt|geritten|s",
  sprießen: "|spross|gesprossen|s", schrecken: "schrickt|schrak|geschrocken|s", schwören: "|schwor|geschworen|h", wenden: "|wandte|gewandt|h", senden: "|sandte|gesandt|h",
};
// Bases that only ever occur with an inseparable prefix (be|ginnen…).
const BOUND_BASES = new Set(["schrecken", "ginnen", "trügen", "lingen", "nesen", "nießen", "schehen", "winnen", "derben", "gessen", "lieren", "zeihen"]);
// Look strong but are weak (denominal, or weak in this sense): be|antragen ≠ tragen.
const WEAK_OVERRIDE = new Set(["bereiten", "vorbereiten", "zubereiten", "verbreiten", "beantragen", "beauftragen", "veranlassen",
  "beanspruchen", "übernachten", "begleiten", "handhaben", "veranstalten", "beinhalten", "verabreden", "verwenden"]);
// Look separable but aren't: ant|worten, an|alysieren…
const NOT_SEP = new Set(["antworten", "beantworten", "abonnieren", "analysieren", "angeln", "einigen", "herrschen", "ahnen", "annoncieren",
  "animieren", "arrangieren", "ankern", "anschuldigen"]);
// Two-way prefix, inseparable in these (wiederholt, übersetzt…) — deck data can override.
const INSEP_WORDS = new Set(["wiederholen"]);
// Compounds whose aux differs from their base verb's.
const SEIN_COMPOUND = /^(aufstehen|entstehen|einschlafen|einziehen|umziehen|ausziehen|eintreten|auftreten|zurücktreten|aufwachen|umsteigen|einsteigen|aussteigen|aufwachsen|verschwinden|vergehen|verreisen|entkommen|erscheinen|ertrinken|erwachen|zerfallen|verfallen|verunglücken|erfrieren|verhungern|verdursten|versinken|erschrecken|gelingen|misslingen|geschehen|genesen|begegnen|entgleisen|zusammenstoßen)$/;
// No imperative, and only 3rd person makes sense.
const IMPERSONAL = /^(geschehen|passieren|gelingen|misslingen|stattfinden|regnen|schneien|schmecken|vorkommen|ausfallen|klappen|dauern|kosten)$/;
const INSEP = ["miss", "emp", "ent", "zer", "be", "er", "ge", "ver", "hinter", "wider"];
// Two-way prefixes: the default when no deck data says otherwise.
const AMBI = ["über", "unter", "durch", "um", "wieder"];
const AMBI_DEFAULT_SEP = { um: true, wieder: true, über: false, unter: false, durch: false };
const SEP = ["zusammen", "zurück", "vorbei", "weiter", "heraus", "herein", "herunter", "hinaus", "hinein", "hinunter", "hinauf", "herauf",
  "entgegen", "gegenüber", "fest", "fort", "kennen", "statt", "teil", "fern", "frei", "hoch", "los", "nach", "vor", "weg", "zu", "ab", "an",
  "auf", "aus", "bei", "ein", "her", "hin", "mit", "dar", "dabei", "dazu", "nieder", "voran", "voraus", "heim", "kaputt", "sauber",
  "bereit", "bekannt", "fertig", "sicher", "offen", "klar", "hinzu", "herum", "empor", "zurecht", "weh", "statt", "vorher", "vorüber", "da"];
// Weak verbs that take sein in the Perfekt (never guessed as haben).
const SEIN_WEAK = /^(reisen|wandern|landen|passieren|joggen|klettern|segeln|surfen|begegnen|folgen|wachen|rudern|stolpern|starten|wechseln|umkippen|kippen|rasen|eilen|sausen|stürzen|flüchten|scheitern|platzen|verreisen|aufwachen|erwachen|verunglücken|zurückkehren|kehren|bummeln|tauchen|verschwinden|wachsen|gelingen|misslingen|sinken|rennen|reiten|aufstehen)$/;

const PERSONS = ["ich", "du", "er", "wir", "ihr", "sie"];
const PERSON_LABEL = { ich: "ich", du: "du", er: "er/sie/es", wir: "wir", ihr: "ihr", sie: "sie/Sie", Sie: "Sie" };
const REFL = { ich: "mich", du: "dich", er: "sich", wir: "uns", ihr: "euch", sie: "sich", Sie: "sich" };
const TENSES = [
  { id: "pr", name: "Präsens" }, { id: "pt", name: "Präteritum" }, { id: "pf", name: "Perfekt" },
  { id: "pq", name: "Plusquamperfekt" }, { id: "fu", name: "Futur I" }, { id: "k2", name: "Konjunktiv II" }, { id: "im", name: "Imperativ" },
];
const TENSE_BY_ID = Object.fromEntries(TENSES.map(t => [t.id, t]));

const isSSound = s => /(s|ß|x|z)$/.test(s) && !/sch$/.test(s);
// A stem needs a linking e before -st/-t (arbeitest, öffnet, rechnet).
const needsE = s => /[td]$/.test(s) || /[^aeiouäöülrmnh][mn]$/.test(s) || /(chn|ckn)$/.test(s);
const lastVowel = s => { const m = String(s).match(/(au|äu|eu|ei|ie|[aeiouäöü])[^aeiouäöü]*$/); return m ? m[1] : ""; };

// Split an infinitive into { refl, sep, insep, base, inf }.
//   hints.sep: true/false from deck data (a Partizip II like abgebogen
//   proves separable; umarmt proves not), undefined = use the tables.
function verbParse(inf, hints = {}) {
  let v = String(inf || "").trim();
  const refl = /^sich\s+/.test(v);
  v = v.replace(/^sich\s+/, "");
  if (!/^[a-zäöüß]+$/.test(v) || !/(en|ern|eln|n)$/.test(v) || v.length < 3) return null;
  const out = { refl, sep: "", insep: "", base: v, inf: v };
  if (STRONG_BASES[v] && !BOUND_BASES.has(v)) return out; // a base verb itself
  const weak = WEAK_OVERRIDE.has(v) || hints.weak;
  const known = r => !weak && STRONG_BASES[r] !== undefined;
  const plausible = r => /[aeiouäöü]/.test(r.replace(/(ern|eln|en|n)$/, "")) && (r.length >= 4 || known(r));
  let rest = v;
  if (!NOT_SEP.has(v)) {
    const list = [...SEP, ...AMBI].sort((a, b) => b.length - a.length);
    for (const p of list) {
      if (!rest.startsWith(p)) continue;
      const r = rest.slice(p.length);
      if (!plausible(r)) continue;
      const viaInsep = INSEP.some(q => r.startsWith(q) && known(r.slice(q.length)));
      if (!(known(r) || viaInsep || r.length >= 5)) continue;
      const ambi = AMBI.includes(p);
      const hint = hints.sep !== undefined ? hints.sep : INSEP_WORDS.has(v) ? false : undefined;
      const isSep = hint !== undefined ? hint : ambi ? AMBI_DEFAULT_SEP[p] : true;
      if (!isSep && !ambi) break; // only über/unter/durch/um/wieder can be inseparable
      if (isSep) out.sep = p; else out.insep = p;
      rest = r;
      break;
    }
  }
  if (!out.insep) {
    for (const p of INSEP) {
      if (!rest.startsWith(p)) continue;
      const r = rest.slice(p.length);
      if (!plausible(r)) continue;
      if (known(r) || !known(rest)) { out.insep = p; rest = r; }
      break;
    }
  }
  out.base = rest;
  if (BOUND_BASES.has(rest) && !out.insep) return null;
  return out;
}

// All forms of one verb, or null.
//   data: { sep, weak, pt3, p2, aux } — deck evidence (optional).
const MODAL_BASES = ["dürfen", "können", "mögen", "müssen", "sollen", "wollen", "wissen"];
function verbForms(inf, data = {}) {
  if (!GR_DE) return null;
  const P = verbParse(inf, { sep: data.sep, weak: data.weak });
  if (!P) return null;
  const { refl, sep, insep: pre, base } = P;
  const weak = data.weak || WEAK_OVERRIDE.has(P.inf);
  const tbl = !weak && STRONG_BASES[base] ? STRONG_BASES[base].split("|") : null;
  const baseInf = pre + base; // the verb without its separable prefix
  const eln = /eln$/.test(baseInf), ern = /ern$/.test(baseInf) && !eln;
  const stem = eln || ern ? baseInf.slice(0, -1) : baseInf.replace(/(en|n)$/, ""); // sammel, wander, mach
  const ieren = /ieren$/.test(baseInf);
  const modal = MODAL_BASES.includes(base) && !pre && !sep;
  const F = { inf: P.inf, refl, sep, insep: pre, base, strong: false, pr: {}, pt: {}, im: null, presSure: true };
  if (P.inf === "möchten") {
    // Its own verb in class (a Konjunktiv II of mögen): present only.
    return { ...F, strong: true, only: ["pr"], pr: { ich: "möchte", du: "möchtest", er: "möchte", wir: "möchten", ihr: "möchtet", sie: "möchten" }, pt: {}, p2: "", aux: null };
  }

  // ── Präsens
  const wir = baseInf;
  let R;
  if (eln) R = { ich: stem.replace(/el$/, "le"), du: stem + "st", er: stem + "t", ihr: stem + "t" };
  else if (ern) R = { ich: stem + "e", du: stem + "st", er: stem + "t", ihr: stem + "t" };
  else {
    const e = needsE(stem);
    R = { ich: stem + "e", du: stem + (isSSound(stem) ? "t" : e ? "est" : "st"), er: stem + (e ? "et" : "t"), ihr: stem + (e ? "et" : "t") };
  }
  F.pr = { ich: R.ich, du: R.du, er: R.er, wir, ihr: R.ihr, sie: wir };
  let p3core = "";
  if (tbl && tbl[0]) {
    const [p3, du] = tbl[0].split("/");
    p3core = p3;
    const pres3 = pre + p3;
    if (modal) { F.pr.ich = pres3; F.pr.er = pres3; F.pr.du = pres3 + (isSSound(pres3) ? "t" : "st"); }
    else {
      F.pr.er = pres3;
      if (du) F.pr.du = pre + du;
      else { const b = pres3.replace(/t$/, ""); F.pr.du = isSSound(b) ? pres3 : b + "st"; }
    }
  }
  if (!tbl && data.pt3 && !/te$/.test(data.pt3) && /^(a|au|e|o)$/.test(lastVowel(base.replace(/(en|n)$/, "")))) F.presSure = false; // strong, vowel change unknown
  if (!pre && !sep) {
    if (base === "sein") F.pr = { ich: "bin", du: "bist", er: "ist", wir: "sind", ihr: "seid", sie: "sind" };
    if (base === "haben") F.pr = { ich: "habe", du: "hast", er: "hat", wir: "haben", ihr: "habt", sie: "haben" };
    if (base === "werden") F.pr = { ich: "werde", du: "wirst", er: "wird", wir: "werden", ihr: "werdet", sie: "werden" };
  }
  if (base === "tun") F.pr = { ich: pre + "tue", du: pre + "tust", er: pre + "tut", wir: pre + "tun", ihr: pre + "tut", sie: pre + "tun" };

  // ── Präteritum
  let pt3 = tbl ? pre + tbl[1] : data.pt3 && !/te$/.test(data.pt3) ? data.pt3 : stem + (needsE(stem) && !eln && !ern ? "ete" : "te");
  F.strong = !/te$/.test(pt3) || !!(tbl && tbl[1] && /te$/.test(tbl[1])); // mixed verbs count as irregular
  if (/te$/.test(pt3)) {
    const s = pt3.slice(0, -1);
    F.pt = { ich: pt3, du: s + "est", er: pt3, wir: s + "en", ihr: s + "et", sie: s + "en" };
  } else if (base === "werden" && !pre && !sep) {
    F.pt = { ich: "wurde", du: "wurdest", er: "wurde", wir: "wurden", ihr: "wurdet", sie: "wurden" };
  } else {
    const s = pt3, td = /[td]$/.test(s), ss = isSSound(s), ie = /ie$/.test(s);
    F.pt = { ich: s, du: s + (td || ss ? "est" : "st"), er: s, wir: s + (ie ? "n" : "en"), ihr: s + (td ? "et" : "t"), sie: s + (ie ? "n" : "en") };
    F.ptAlt = { du: td ? [s + "st"] : ss ? [s + "t"] : [] };
  }

  // ── Partizip II
  let p2;
  if (tbl) p2 = pre ? pre + tbl[2].replace(/^ge/, "") : tbl[2];
  else if (data.p2) p2 = data.p2.startsWith(sep) ? data.p2.slice(sep.length) : data.p2;
  else {
    const t = stem + (needsE(stem) && !eln && !ern ? "et" : "t");
    p2 = pre || ieren ? t : "ge" + t;
  }
  F.p2 = sep + p2;

  // ── aux: base verbs from the table; weak simple verbs haben unless
  // they're motion/change verbs; compounds only from deck data.
  if (data.aux) F.aux = data.aux;
  else if (tbl && !sep && !pre) F.aux = tbl[3] === "s" ? "sein" : "haben";
  // Compounds of strong verbs: inseparable ones take haben (bekommen,
  // verstehen), separable ones their base's aux (anrufen, abfahren) —
  // apart from a list of known exceptions (aufstehen, einschlafen…).
  else if (tbl && SEIN_COMPOUND.test(P.inf)) F.aux = refl ? "haben" : "sein";
  else if (tbl && pre && !sep) F.aux = "haben";
  else if (tbl && sep && !pre) F.aux = refl ? "haben" : tbl[3] === "s" ? "sein" : "haben";
  else if (!tbl && /te$/.test(pt3) && !SEIN_WEAK.test(P.inf) && !SEIN_WEAK.test(baseInf) && !SEIN_WEAK.test(base)) F.aux = "haben";
  else F.aux = null;

  // ── Imperativ (du / ihr / Sie)
  const eToI = !!p3core && /i/.test(p3core) && /e/.test(lastVowel(base.replace(/(en|n)$/, ""))) && !modal && !["werden", "sein"].includes(base);
  let du, duAlt = [];
  if (!pre && !sep && base === "sein") du = "sei";
  else if (!pre && !sep && base === "haben") { du = "hab"; duAlt = ["habe"]; }
  else if (!pre && !sep && base === "werden") du = "werde";
  else if (["tritt", "gilt"].includes(p3core)) du = pre + p3core;
  else if (eToI) du = pre + p3core.replace(/t$/, "");
  else if (eln) du = stem.replace(/el$/, "le");
  else if (ern || needsE(stem)) du = stem + "e";
  else { du = stem; duAlt = [stem + "e"]; }
  if (base === "tun") { du = pre + "tu"; duAlt = [pre + "tue"]; }
  F.impersonal = IMPERSONAL.test(P.inf);
  F.eToI = eToI;
  F.im = modal || F.impersonal ? null : { du, ihr: !pre && !sep && base === "sein" ? "seid" : F.pr.ihr, Sie: !pre && !sep && base === "sein" ? "seien" : wir };
  F.imAlt = { du: duAlt };

  // ── Konjunktiv II: its own form for sein, haben, werden, modals, wissen
  const K2 = { sein: "wär", haben: "hätt", werden: "würd", können: "könnt", dürfen: "dürft", müssen: "müsst", sollen: "sollt", wollen: "wollt", mögen: "möcht", wissen: "wüsst" };
  if (K2[base] && !pre && !sep) {
    const s = K2[base];
    F.k2special = true;
    F.k2 = base === "sein" ? { ich: "wäre", du: "wärst", er: "wäre", wir: "wären", ihr: "wärt", sie: "wären" }
      : { ich: s + "e", du: s + "est", er: s + "e", wir: s + "en", ihr: s + "et", sie: s + "en" };
  }
  return F;
}

// The answer for one person × tense → { ans, alts[], tail } or null.
// For simple tenses the separable prefix sits in the tail (shown, not
// typed — typing it too is accepted).
const AUX_PR = { haben: { ich: "habe", du: "hast", er: "hat", wir: "haben", ihr: "habt", sie: "haben" }, sein: { ich: "bin", du: "bist", er: "ist", wir: "sind", ihr: "seid", sie: "sind" } };
const AUX_PT = { haben: { ich: "hatte", du: "hattest", er: "hatte", wir: "hatten", ihr: "hattet", sie: "hatten" }, sein: { ich: "war", du: "warst", er: "war", wir: "waren", ihr: "wart", sie: "waren" } };
const WERDEN_PR = { ich: "werde", du: "wirst", er: "wird", wir: "werden", ihr: "werdet", sie: "werden" };
const WUERDE = { ich: "würde", du: "würdest", er: "würde", wir: "würden", ihr: "würdet", sie: "würden" };
function verbCell(F, tense, person) {
  if (!F) return null;
  const sep = F.sep;
  const refl = F.refl ? REFL[person] : "";
  const simple = fin => ({ ans: fin, alts: sep ? [fin + " " + sep] : [], tail: [refl, sep ? "… " + sep : ""].filter(Boolean).join(" ") });
  // Reflexive compounds carry the pronoun after the auxiliary (hat sich bedankt); leaving it out is accepted.
  const compound = (a, rest) => ({ ans: F.refl ? `${a} ${refl} ${rest}` : `${a} ${rest}`, alts: F.refl ? [`${a} ${rest}`] : [], tail: "" });
  let r = null;
  if (F.only && !F.only.includes(tense)) return null;
  if (F.impersonal && !["er", "sie"].includes(person)) return null;
  if (tense === "pr") { if (!F.presSure || !PERSONS.includes(person)) return null; r = simple(F.pr[person]); }
  else if (tense === "pt") { if (!PERSONS.includes(person)) return null; r = simple(F.pt[person]); if (F.ptAlt && F.ptAlt[person]) r.alts.push(...F.ptAlt[person]); }
  else if (tense === "pf" || tense === "pq") { if (!F.aux || !PERSONS.includes(person)) return null; r = compound((tense === "pf" ? AUX_PR : AUX_PT)[F.aux][person], F.p2); }
  else if (tense === "fu") { if (!PERSONS.includes(person)) return null; r = compound(WERDEN_PR[person], F.inf); }
  else if (tense === "k2") { if (!PERSONS.includes(person)) return null; r = F.k2special ? simple(F.k2[person]) : compound(WUERDE[person], F.inf); }
  else if (tense === "im") {
    if (!F.im || !F.presSure || !["du", "ihr", "Sie"].includes(person)) return null;
    const fin = F.im[person];
    r = { ans: fin, alts: [], tail: "" };
    const pr = person === "Sie" ? "Sie" : "", rf = F.refl ? REFL[person] : "";
    r.tail = [pr, rf, sep].filter(Boolean).join(" ") + "!";
    const variants = [fin, ...(person === "du" ? F.imAlt.du : [])];
    variants.forEach(x => { if (x !== fin) r.alts.push(x); if (sep) r.alts.push(x + " " + sep); });
  }
  if (!r || !r.ans) return null;
  return r;
}
// All accepted spellings of a cell.
function verbCellAnswers(c) { return c ? [c.ans, ...c.alts] : []; }

// A short "why" for a verb form, as HTML.
function verbRuleHtml(F, tense, person) {
  if (!F) return "";
  const b = F.base, inf = F.inf;
  if (tense === "pr") {
    if (["sein", "haben", "werden", "wissen"].includes(b) && !F.insep && !F.sep) return `📏 <strong>${inf}</strong> is irregular in the present — learn the row by heart.`;
    if (MODAL_BASES.includes(b)) return "📏 Modal verbs: <strong>ich</strong> and <strong>er</strong> are the same, with no ending (ich kann, er kann).";
    const stemV = lastVowel(F.pr.wir.replace(/(en|n)$/, "")), erV = lastVowel(F.pr.er.replace(/t$/, ""));
    if (stemV && erV && stemV !== erV) return `📏 Stem change in <strong>du</strong> and <strong>er/sie/es</strong> only (${stemV} → ${erV}): du ${F.pr.du}, er ${F.pr.er} — but wir ${F.pr.wir}.`;
    if (F.sep) return `📏 Separable verb: the prefix <strong>${F.sep}-</strong> jumps to the end of the clause.`;
    if (/est$|et$/.test(F.pr.du + F.pr.er) && needsE(F.pr.wir.replace(/en$/, ""))) return "📏 Stem ends in -t/-d (or -m/-n after a consonant): add an <strong>e</strong> — du arbeitest, er öffnet.";
    return "📏 Present endings: ich -e · du -st · er -t · wir -en · ihr -t · sie -en.";
  }
  if (tense === "pt") {
    if (/te$/.test(F.pt.ich) && F.strong) return `📏 Mixed verb: a new stem <strong>${escapeHtml(F.pt.ich.slice(0, -2))}-</strong> with weak endings (-te, -test, -te…).`;
    if (/te$/.test(F.pt.ich)) return "📏 Weak verb: stem + <strong>-te</strong>: -te, -test, -te, -ten, -tet, -ten.";
    return `📏 Strong verb: new stem <strong>${escapeHtml(F.pt.ich)}</strong>, no -te — and ich / er/sie/es take no ending.`;
  }
  if (tense === "pf" || tense === "pq") {
    const aux = F.aux === "sein" ? "<strong>sein</strong> (movement or change of state)" : "<strong>haben</strong>";
    const p2 = /ieren$/.test(F.inf) ? " · -ieren verbs take no ge-" : F.insep ? ` · <strong>${F.insep}-</strong> is inseparable, so no ge-` : F.sep ? ` · ge- goes after the prefix: ${escapeHtml(F.p2)}` : "";
    return tense === "pq" ? `📏 Plusquamperfekt = ${aux} in the Präteritum + Partizip II${p2}.` : `📏 Perfekt with ${aux} + Partizip II${p2}.`;
  }
  if (tense === "fu") return "📏 Futur I = <strong>werden</strong> (conjugated) + the infinitive at the end.";
  if (tense === "k2") return F.k2special ? `📏 <strong>${inf}</strong> has its own Konjunktiv II (wäre, hätte, könnte, müsste…) — no würde.` : "📏 Konjunktiv II = <strong>würde</strong> + infinitive (sein, haben and the modals have their own forms).";
  if (tense === "im") {
    if (person === "Sie") return "📏 Sie-imperative: infinitive + Sie — prefix at the end.";
    if (person === "ihr") return "📏 ihr-imperative = the ihr form, without ihr.";
    return F.eToI ? "📏 e → i/ie verbs keep the change in the du-imperative, with no ending: nimm, lies, gib." : "📏 du-imperative = the stem (no du, no -st); add -e after -t/-d: warte!";
  }
  return "";
}
// The whole row of a tense, compactly, with the asked form highlighted.
function verbRowHtml(F, tense, person) {
  const ps = tense === "im" ? ["du", "ihr", "Sie"] : PERSONS;
  const cells = ps.map(p => {
    const c = verbCell(F, tense, p);
    if (!c) return "";
    const lbl = tense === "im" ? `<span class="vr-p">${p === "Sie" ? "Sie" : p}</span> ` : `<span class="vr-p">${PERSON_LABEL[p].split("/")[0]}</span> `;
    const tail = tense === "im" ? (p === "Sie" ? c.tail.replace(/^Sie ?/, "") : c.tail) : c.tail.replace(/^… /, "");
    return `<span class="vr-c${p === person ? " on" : ""}">${lbl}${escapeHtml(c.ans)}${tail && tail !== "!" ? `<span class="vr-t"> ${escapeHtml(tail.replace(/!$/, ""))}</span>` : ""}</span>`;
  }).filter(Boolean);
  return `<div class="vr-row">${cells.join("")}</div>`;
}

// ── DECK EVIDENCE & VERIFICATION ──────────────
// What the decks say about each verb (principal-part hints, Partizip II
// cards, conjugation cards). A verb joins the bank only when the engine
// reproduces every piece of it; a tense a card contradicts is left out.
let _verbBank = null;
function verbBank() {
  if (!GR_DE) return { verbs: [], byInf: new Map(), report: { checked: 0, mismatches: [], dropped: [] } };
  if (_verbBank) return _verbBank;
  const groups = (typeof ALL_GROUPS !== "undefined" ? ALL_GROUPS : []).filter(g => g.type !== "anki");
  const ev = new Map();
  const get = inf => { if (!ev.has(inf)) ev.set(inf, { inf, words: [], cards: [] }); return ev.get(inf); };
  const enToInf = new Map();
  const GRAMMAR_DECK = /conj|praet|futur|plusq|p2|partizip|konjunktiv|passiv/;
  const personOf = (pron, fin) => {
    const t = String(pron).trim().toLowerCase();
    if (t === "sie" && fin) return /^(wird|hatte|war|ist|hat)$/.test(fin) ? "er" : "sie";
    return t === "ich" ? "ich" : t === "du" ? "du" : /^er/.test(t) ? "er" : t === "wir" ? "wir" : t === "ihr" ? "ihr" : /^sie/.test(t) ? "sie" : null;
  };
  groups.forEach(g => g.decks.forEach(d => {
    if (GRAMMAR_DECK.test(d.id)) return;
    d.words.forEach((w, i) => {
      const de = String(w.de || "").trim(), hint = String(w.hint || ""), en = String(w.en || "");
      const verbHint = /verb/i.test(hint.replace(/adverb/gi, "")) || /·\s*(hat|ist)\s/.test(hint) || /_verbs/.test(d.id);
      if (!/^(sich\s+)?[a-zäöüß]+(en|ern|eln|n)$/.test(de) || !verbHint) return;
      const e = get(de);
      e.words.push({ w, deckId: d.id, idx: i, level: g.id });
      if (!e.en) e.en = en;
      enToInf.set(g.id + "|" + en, de);
      const m = hint.match(/^([a-zäöüß]+(?:\s+sich)?(?:\s+[a-zäöü]+)?)\s*·\s*(hat|ist)\s+(?:sich\s+)?([a-zäöüß]+)/);
      if (m) {
        const pp = m[1].split(/\s+/).filter(x => x !== "sich");
        e.pt3 = pp[0]; e.aux = m[2] === "ist" ? "sein" : "haben"; e.p2 = m[3];
        if (pp.length > 1) e.sep = true;
      }
      if (/\bregular\b/i.test(hint) && !/irregular/i.test(hint)) e.regular = true;
    });
  }));
  groups.forEach(g => g.decks.forEach(d => {
    if (!GRAMMAR_DECK.test(d.id)) return;
    d.words.forEach(w => {
      const de = String(w.de || "").trim(), hint = String(w.hint || ""), en = String(w.en || "");
      let m;
      if (/p2|partizip/.test(d.id)) {
        if ((m = en.match(/^(sich\s+)?([a-zäöüß]+)\s+\(Partizip II\)\s+—\s+er\s+(hat|ist)\s+___/))) {
          const e = get((m[1] || "") + m[2]); e.p2 = de.replace(/^sich\s+/, ""); e.aux = m[3] === "ist" ? "sein" : "haben";
          const pt = hint.match(/^Präteritum\s+([a-zäöüß]+)((?:\s+[a-zäöü]+)?)/); if (pt) { e.pt3 = pt[1]; if (pt[2].trim()) e.sep = true; }
        } else if ((m = hint.match(/^Partizip II — (?:takes )?(haben|sein)(?!\s*·)/))) {
          const inf = enToInf.get(g.id + "|" + en);
          if (inf) { const e = get(inf); e.p2 = de.replace(/^sich\s+/, ""); e.aux = m[1]; }
        }
        return;
      }
      if ((m = en.match(/^(sich\s+)?([a-zäöüß]+)(?:\s+\((Präteritum)\))?\s+—\s+(ich|du|er\/sie\/es|wir|ihr|sie\/Sie)\s+___/))) {
        const inf = (m[1] || "") + m[2];
        get(inf).cards.push({ tense: m[3] ? "pt" : "pr", person: personOf(m[4]), ans: de.split(/\s+/)[0], full: de });
      } else if ((m = de.match(/^(ich|du|er|sie|wir|ihr)\s+(werde|wirst|wird|werden|werdet)\s+([a-zäöüß]+)$/))) {
        get(m[3]).cards.push({ tense: "fu", person: personOf(m[1], m[2]), ans: `${m[2]} ${m[3]}` });
      } else if ((m = de.match(/^(ich|du|er|sie|wir|ihr)\s+(hatte|hattest|hatten|hattet|war|warst|waren|wart)\s+([a-zäöüß]+)$/))) {
        const inf = verbP2Index().get(m[3]);
        if (inf) get(inf).cards.push({ tense: "pq", person: personOf(m[1], m[2]), ans: `${m[2]} ${m[3]}` });
      }
    });
  }));
  const report = { checked: 0, mismatches: [], dropped: [], verbs: 0 };
  const verbs = [];
  // A Partizip II settles a two-way prefix: ab|ge|bogen is separable.
  const sepFromP2 = (inf, p2) => {
    const v = inf.replace(/^sich\s+/, "");
    const p = [...SEP, ...AMBI].sort((a, b) => b.length - a.length).find(x => v.startsWith(x) && v.length > x.length + 2);
    if (!p || !p2) return undefined;
    if (p2.startsWith(p + "ge") || (p2.startsWith(p) && /ieren$/.test(v)) || (p2.startsWith(p) && INSEP.some(q => v.slice(p.length).startsWith(q)))) return true;
    return false;
  };
  const check = (e, F) => {
    const bad = [];
    if (F.only) return bad; // möchten: present-only, its cards are checked below
    if (e.pt3 && e.pt3 !== F.pt.er) bad.push(`pt ${F.pt.er}≠${e.pt3}`);
    if (e.p2 && e.p2 !== F.p2) bad.push(`p2 ${F.p2}≠${e.p2}`);
    if (e.aux && F.aux && e.aux !== F.aux) bad.push(`aux ${F.aux}≠${e.aux}`);
    return bad;
  };
  ev.forEach(e => {
    if (!e.words.length && !e.cards.length) return;
    let sep = e.sep !== undefined ? e.sep : sepFromP2(e.inf, e.p2);
    let F = verbForms(e.inf, { sep });
    if (!F) { report.dropped.push(e.inf + " (unparsed)"); return; }
    let bad = check(e, F);
    // Strong in the table but weak here (hängen → hängte auf)? Or a
    // strong verb the table lacks? Rebuild from the deck's own parts.
    if (bad.length && e.pt3 && e.p2) {
      const F2 = verbForms(e.inf, { sep, weak: /te$/.test(e.pt3), pt3: e.pt3, p2: e.p2, aux: e.aux });
      if (F2 && !check(e, F2).length) { F = F2; bad = []; }
    }
    if (bad.length) { report.mismatches.push(`${e.inf}: ${bad.join(", ")}`); report.dropped.push(e.inf); return; }
    if (e.aux && !F.aux) F.aux = e.aux;
    const tenseBad = new Set();
    e.cards.forEach(c => {
      report.checked++;
      const cell = verbCell(F, c.tense, c.person);
      const ok = cell && verbCellAnswers(cell).some(a => norm1(a) === norm1(c.ans) || norm1(a) === norm1(c.full || ""));
      if (!ok) { tenseBad.add(c.tense); report.mismatches.push(`${e.inf} ${c.tense} ${c.person}: ${cell ? cell.ans : "—"} ≠ ${c.ans}`); }
    });
    // A weak verb with no deck evidence at all can't be told apart from
    // a strong verb the table is missing — keep only backed verbs.
    // (Weak verbs whose base isn't in the strong table are regular by
    // construction; the table covers the strong verbs up to B1.)
    const backed = STRONG_BASES[F.base] || e.pt3 || e.p2 || e.regular || e.cards.length || !F.strong;
    if (!backed) { report.dropped.push(e.inf + " (no evidence)"); return; }
    const tenses = TENSES.map(t => t.id).filter(t => !tenseBad.has(t) && verbCell(F, t, t === "im" ? "du" : "er"));
    if (!tenses.length) { report.dropped.push(e.inf + " (no tense)"); return; }
    const src = e.words[0] || null;
    verbs.push({ inf: e.inf, F, tenses, word: src ? { ...src.w, deckId: src.deckId, idx: src.idx } : null, level: src ? src.level : "", en: e.en || "", cards: e.cards.length });
  });
  report.verbs = verbs.length;
  _verbBank = { verbs, byInf: new Map(verbs.map(v => [v.inf, v])), report };
  return _verbBank;
}
function norm1(s) { return typeof normalize === "function" ? normalize(String(s)) : String(s).toLowerCase(); }
// Partizip II → infinitive (for the Plusquamperfekt cards).
let _p2Index = null;
function verbP2Index() {
  if (_p2Index) return _p2Index;
  _p2Index = new Map();
  Object.keys(STRONG_BASES).forEach(b => { if (!BOUND_BASES.has(b)) _p2Index.set(STRONG_BASES[b].split("|")[2], b); });
  ["machen", "sagen", "kaufen", "spielen", "lernen", "arbeiten", "hören", "kochen", "fragen", "wohnen", "besuchen", "erzählen"].forEach(v => {
    const F = verbForms(v); if (F) _p2Index.set(F.p2, v);
  });
  return _p2Index;
}

// ── FORM STEP (Gap Fill, step 2) ──────────────
// After the right word is picked, which form does the sentence need?
//   verbs: geht / gehst / gehe / ging / gegangen…
//   adjectives: gut / gute / guten / guter / gutes / gutem
// hidden: the exact text hidden in the sentence (buildHintInfo answer).
// Returns { kind, answer, options[], reason } or null.
function formStepItem(word, hidden) {
  if (!GR_DE || !word || !hidden || /\s/.test(hidden.trim())) return null;
  const tok = hidden.trim();
  const pos = typeof posOf === "function" ? posOf(word) : "";
  if (pos === "verb" || pos === "participle") return verbFormStep(word, tok);
  if (pos === "adj") return adjFormStep(word, tok);
  return null;
}
function verbFormStep(word, tok) {
  const inf = String(word.de || "").trim();
  const v = verbBank().byInf.get(inf);
  if (!v) return null;
  const F = v.F, t = norm1(tok);
  // A separable Partizip II card (ein·ge·laden) isn't an infinitive to
  // conjugate — its ge- only looks like a prefix. (bekommen, vergessen
  // are both, and fine.)
  if (/^partizip/i.test(word.hint || "") && F.sep && F.insep === "ge") return null;
  // Separable verbs: the gap holds the particle ("Ich muss noch einkaufen
  // gehen", "…, weil ich einkaufe") or not ("Füllen Sie … aus"). Every
  // option keeps that shape — kaufen / kaufte are another verb there,
  // ausfüllen / ausgefüllt a doubled particle here.
  const glued = !!F.sep && t.startsWith(norm1(F.sep));
  const pre = glued ? F.sep : "";
  const cells = [];
  const add = (tense, person, form) => { if (form && !/\s/.test(form)) cells.push({ tense, person, form }); };
  if (v.tenses.includes("pr")) PERSONS.forEach(p => add("pr", p, F.pr[p] && pre + F.pr[p]));
  if (v.tenses.includes("pt")) PERSONS.forEach(p => add("pt", p, F.pt[p] && pre + F.pt[p]));
  if (!F.sep || glued) {
    if (F.p2 && (v.tenses.includes("pf") || v.tenses.includes("pq"))) add("p2", "", F.p2);
    add("inf", "", F.inf);
  }
  if (F.im && v.tenses.includes("im") && !glued) add("im", "du", F.im.du);
  const hits = cells.filter(c => norm1(c.form) === t);
  if (!hits.length) return null;
  const answer = capLike(tok, hits[0].form);
  const forms = [...new Set(cells.map(c => c.form))].filter(f => norm1(f) !== t);
  // Prefer forms that differ in a way worth noticing (person, then tense).
  const sameTense = forms.filter(f => cells.some(c => c.form === f && c.tense === hits[0].tense));
  const others = forms.filter(f => !sameTense.includes(f));
  const pickFrom = [...shuffleG(sameTense).slice(0, 2), ...shuffleG(others)];
  const options = [answer, ...pickFrom.slice(0, 4).map(f => capLike(tok, f))];
  const label = describeVerbHits(hits);
  const rule = verbRuleHtml(F, hits[0].tense === "p2" ? "pf" : hits[0].tense === "inf" ? "fu" : hits[0].tense, hits[0].person || "er");
  return { kind: "verb", answer, options, reason: `<strong>${escapeHtml(answer)}</strong> = ${escapeHtml(F.inf)} · ${label}${rule && hits[0].tense !== "inf" ? `<div class="g-teach-rule">${rule}</div>` : ""}`, F, tense: hits[0].tense };
}
function describeVerbHits(hits) {
  const byTense = {};
  hits.forEach(h => (byTense[h.tense] = byTense[h.tense] || []).push(h.person));
  return Object.entries(byTense).map(([t, ps]) => {
    if (t === "p2") return "Partizip II (Perfekt / Passiv)";
    if (t === "inf") return "infinitive (after a modal, werden, zu…)";
    if (t === "im") return "Imperativ (du)";
    const name = TENSE_BY_ID[t].name;
    const who = [...new Set(ps)].map(p => PERSON_LABEL[p]).join(", ");
    return `${name} · ${who}`;
  }).join(" — or ");
}
const ADJ_ENDINGS = ["", "e", "en", "er", "es", "em"];
function adjFormStep(word, tok) {
  const lemma = String(word.de || "").trim();
  if (!/^[a-zäöüß]+$/.test(lemma)) return null;
  const t = tok.toLowerCase();
  if (!t.startsWith(lemma.replace(/e$/, ""))) return null;
  const stemAdj = lemma.replace(/e$/, ""); // leise → leis-e
  const ending = t.slice(stemAdj.length);
  if (!ADJ_ENDINGS.includes(ending) && !(lemma.endsWith("e") && ending === "")) return null;
  // Adjectives in -el/-er drop an e before endings (dunkel → dunkle): skip those.
  if (/(el|er)$/.test(lemma) && ending) return null;
  const options = [...new Set(ADJ_ENDINGS.map(e => (e ? stemAdj + e : lemma)))].map(f => capLike(tok, f));
  const answer = capLike(tok, t);
  if (!options.includes(answer)) return null;
  return { kind: "adj", answer, options: [answer, ...shuffleG(options.filter(o => o !== answer)).slice(0, 4)], reason: adjReasonHtml(tok, ending), lemma };
}
// Filled in at call time from the sentence context (see gapAdjReason).
function adjReasonHtml(tok, ending) {
  return `<strong>${escapeHtml(tok)}</strong>${ending ? ` — ending <strong>-${escapeHtml(ending)}</strong>` : " — no ending"}`;
}
// The rule for an adjective ending, from the word before it (an article
// or not) and whether a noun follows.
function adjRuleFromContext(sentence, tok) {
  const parts = String(sentence || "").split(/(\p{L}+)/u);
  const i = parts.findIndex((p, j) => j % 2 === 1 && p === tok);
  if (i < 0) return "";
  const prev = i >= 2 ? parts[i - 2] : "", next = parts[i + 2] || "";
  const nounNext = /^[A-ZÄÖÜ]/.test(next) && parts[i + 1] === " ";
  if (!nounNext) {
    const cop = parts.some((p, j) => j % 2 === 1 && COPULA.test(p));
    return cop ? "📏 After sein / werden / bleiben the adjective takes <strong>no ending</strong>." : "📏 An adjective without a noun after it (and adverbs) takes no ending.";
  }
  const p = parts[i - 1] === " " ? detParse(prev) : null;
  if (p && (p.fam === "def" || p.fam === "dies")) return "📏 After <strong>der / die / das</strong>-words the article already shows the case — the adjective only takes <strong>-e</strong> or <strong>-en</strong>.";
  if (p && (p.fam === "ein" || p.fam === "kein")) {
    const bare = /^(ein|kein|mein|dein|sein|ihr|unser|euer)$/i.test(prev);
    return bare ? "📏 <strong>" + escapeHtml(prev) + "</strong> has no ending here, so the adjective shows the gender: <strong>-er</strong> (masculine) or <strong>-es</strong> (neuter)." : "📏 After an <strong>ein</strong>-word with an ending, the adjective takes <strong>-e</strong> or <strong>-en</strong>.";
  }
  return "📏 No article: the adjective carries the article's ending itself (der → -er, das → -es, dem → -em, den → -en).";
}
function shuffleG(a) { return typeof shuffle === "function" ? shuffle(a.slice()) : a.slice(); }
