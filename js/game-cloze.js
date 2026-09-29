// ── GAME: GAP FILL ────────────────────────────
// An example sentence with the word blanked out. Two steps:
//   1. WHICH WORD fits? (dictionary forms, as before)
//   2. WHICH FORM does the sentence need? (German) — the article's case
//      for nouns (der Mund → "Öffnen Sie bitte den Mund"), the
//      conjugated form for verbs, the ending for adjectives — with the
//      reason shown (grammar-de.js). Step 2 is grammar practice: it
//      never touches the word's stage, it feeds the case / verb stats.
// The blank comes from buildHintInfo() (hint.js), which only succeeds
// when the word can be located and hidden safely — words where it
// can't are simply not used.

const _clozeCache = new Map();
_gameCacheClearers.push(() => _clozeCache.clear());
function clozeInfo(word) {
  const k = wordKey(word) + "|" + word[WORD_KEY] + "|" + ((word.examples && word.examples[0] && word.examples[0][WORD_KEY]) || "");
  if (!_clozeCache.has(k)) _clozeCache.set(k, buildHintInfo(word, true));
  return _clozeCache.get(k);
}
function clozeWords(pool) { return dedupeWords(pool.filter(w => { const i = clozeInfo(w); return i && czFormMatchesGap(w, i); })); }
// The second step for a word, or null: { kind: "case"|"verb"|"adj", … }.
function clozeFormStep(w, info) {
  if (typeof GR_DE === "undefined" || !GR_DE || !info) return null;
  const ci = caseItem(w);
  if (ci && ci.ex === info.example) return { kind: "case", ci, answer: ci.det, options: ci.options, reason: ci.reason.html, c: ci.reason.c || ci.cases[0] };
  const fs = formStepItem(w, info.answer);
  if (!fs) return null;
  if (fs.kind === "adj") fs.reason += `<div class="g-teach-rule">${adjRuleFromContext(info.example[WORD_KEY], info.answer)}</div>`;
  return fs;
}
// Distractors: hard, but never a second right answer. "Haben wir noch
// ___?" takes Milch, Brot and Käse alike, so a same-topic noun is only
// offered when the grammar rules it out:
//   • GENDER: the article in front of the gap decides ("Öffnen Sie bitte
//     den ___" → only a masculine noun) — same-topic nouns of another
//     gender are wrong, however well they'd fit the meaning.
//   • NUMBER: the right noun in the plural after "einen", "das", "dem"…
//   • ARTICLE: no article in the sentence — die / der / das Milch.
//   • SAME WORD, WRONG FORM: schlafen for "Ich ___ acht Stunden".
//   • PARTICLE: "Füllen Sie … aus" → verbs with another particle (anrufen).
//   • LOOK-ALIKES: words spelled like the answer (krank · kann) of a
//     kind that can't take the slot.
// Both languages (French: une ___ → not a masculine noun). Never the
// answer's own verb on another card (sprang for springen), never a word
// that fits any slot of its kind (days, colours), and a wrong pick you
// say fits too ("That fits too") never comes back for that sentence.
// Case nouns and verbs also have a step 2 (the article / the form).
const CZ_DET_FIXED = { der: "mf", die: "f", das: "n", den: "m", dem: "mn" };
const CZ_EIN_END = { "": "mn", e: "f", en: "m", em: "mn", er: "f" };
const CZ_DIES_END = { er: "mf", e: "f", es: "n", en: "m", em: "mn" };
// Contractions carry an article too: am / im = an / in dem…
const CZ_CONTR = { am: "mn", im: "mn", vom: "mn", beim: "mn", zum: "mn", zur: "f", ins: "n", ans: "n", aufs: "n", ums: "n", fürs: "n", durchs: "n", übers: "n" };
// Words that stand where an article would, but say nothing of gender.
const CZ_QUANT = /^(\d+|zwei|drei|vier|fünf|sechs|sieben|acht|neun|zehn|elf|zwölf|zwanzig|dreißig|hundert|tausend|viele|vielen|wenige|einige|mehrere|alle|beide|manche|andere|welche|paar)$/i;
const CZ_INTENS = /^(sehr|so|ganz|ziemlich|besonders|wirklich|echt|total|zu|recht|richtig|extrem|super)$/i;
// Look like adjectives (-e / -en / -er…) but aren't.
const CZ_NOT_ADJ = /^(immer|oder|aber|hier|wieder|unter|über|hinter|oben|unten|außer|später|vorher|nachher|sonst|gern|gerne|bitte|heute|morgen|gestern|dann|wenn|denn|wann|nie|eben|ohne|gegen|neben|zwischen|seit|während|wegen|trotz|innen|außen|draußen|drinnen|leider|lieber|etwa|zuerst|zuletzt|sogar|schon|selten|danke|ne|je|zwar|daher|woher|weiter|nun|nachdem|ob)$/i;
const CZ_ADJ_END = /^[a-zäöüß]+(e|en|er|es|em)$/i;
function czReadDet(t) {
  const x = t.toLowerCase();
  if (CZ_DET_FIXED[x]) return CZ_DET_FIXED[x];
  let m = x.match(/^(ein|kein|mein|dein|sein|ihr|unser|euer)(e|en|em|er)?$/) || x.match(/^(eur)(e|en|em|er)$/);
  if (m) return CZ_EIN_END[m[2] || ""];
  m = x.match(/^(dies|jed|welch|jen|manch)(e|en|em|er|es)$/);
  return m ? CZ_DIES_END[m[2]] : null;
}
// What stands in front of the gap (adjectives, and the adverbs before
// them, may sit between: "einen sehr guten ___") →
//   { det, genders }  an article or contraction: genders ⊂ "mfn"
//   { det, genders: "" }  a number, "viele", or an article-less adjective
//                         ("Vielen ___", "Sehr geehrte ___"): no gender
//   null  nothing of the kind — the gap takes its own article.
function clozeDeterminer(before) {
  if (IS_FRENCH_APP) return frDeterminer(before);
  const toks = String(before || "").match(/\p{L}+|[^\p{L}\s]+/gu) || [];
  if (!toks.length || !/\s$/.test(before)) return null;
  const isWord = t => /^\p{L}+$/u.test(t || "");
  let i = toks.length - 1;
  if (!isWord(toks[i])) return null;
  // Walk back over adjectives. A capitalised one only at the start of the
  // sentence ("Vielen ___"), not a verb ("Ich trinke ___").
  let adj = 0;
  const adjAt = k => isWord(toks[k]) && CZ_ADJ_END.test(toks[k]) && !CZ_NOT_ADJ.test(toks[k]) && !czReadDet(toks[k]) && !CZ_QUANT.test(toks[k])
    && (/^[a-zäöüß]/.test(toks[k]) || k === 0 || !isWord(toks[k - 1]));
  while (i >= 0 && adjAt(i)) {
    i--; adj++;
    while (i >= 0 && CZ_INTENS.test(toks[i] || "")) i--;
  }
  if (i < 0 || !isWord(toks[i])) return adj && (i < 0 || /[.!?:;–]/.test(toks[i])) ? { det: toks[i + 1], genders: "" } : null;
  const t = toks[i], low = t.toLowerCase();
  // Not an article: "habt ihr ___" (you), ", der ___ hat" (who).
  const g = czReadDet(t);
  if (g && !(low === "ihr" || toks[i - 1] === ",")) return { det: t, genders: g };
  if (CZ_CONTR[low]) return { det: t, genders: CZ_CONTR[low] };
  if (CZ_QUANT.test(t)) return { det: t, genders: "" };
  // "Ich trinke ___": trinke only looked like an adjective — nothing
  // stands in front of the gap.
  return null;
}
// French: the determiner right in front of the gap (a short adjective may
// sit between: "une nouvelle ___").
const FR_DET = { un: "m", une: "f", le: "m", la: "f", ce: "m", cet: "m", cette: "f", au: "m", du: "m", ma: "f", ta: "f", sa: "f", quel: "m", quelle: "f" };
const FR_DET_ANY = /^(mon|ton|son|notre|votre|leur|les|des|mes|tes|ses|nos|vos|leurs|ces|aux|quels|quelles|de|chaque|quelques|plusieurs|deux|trois|quatre|cinq|six|sept|huit|neuf|dix|onze|douze|vingt|trente|cent|mille|\d+)$/i;
const FR_PRE_ADJ = /^(beau|bel|belle|bon|bonne|grand|grande|petit|petite|nouveau|nouvel|nouvelle|vieux|vieil|vieille|jeune|joli|jolie|gros|grosse|premier|première|dernier|dernière|mauvais|mauvaise|autre|même|prochain|prochaine|seul|seule|long|longue|haut|haute|meilleur|meilleure)$/i;
function frDeterminer(before) {
  const b = String(before || "");
  if (/(^|[^\p{L}])[ldLD]['’]$/u.test(b)) return { det: b.slice(-2), genders: "" }; // l' / d'
  if (!/\s$/.test(b)) return null;
  const toks = b.match(/[\p{L}]+|[^\p{L}\s]+/gu) || [];
  let i = toks.length - 1;
  while (i > 0 && FR_PRE_ADJ.test(toks[i])) i--;
  const t = toks[i] || "", low = t.toLowerCase();
  if (FR_DET[low]) return { det: t, genders: FR_DET[low] };
  if (FR_DET_ANY.test(low)) return { det: t, genders: "" };
  return null;
}
const CZ_GENDER = { der: "m", die: "f", das: "n", le: "m", la: "f" };
const CZ_GENDER_NAME = { m: "masculine", f: "feminine", n: "neuter" };
// The gap's own article, when it pins the noun's gender — or null.
function clozeDetFor(w, info) {
  const np = posOf(w) === "noun" ? nounParts(w) : null;
  if (!np || normalize(info.answer || "") !== normalize(np.noun)) return null;
  const det = clozeDeterminer(info.before);
  return det && det.genders && det.genders.includes(CZ_GENDER[np.answer]) ? det : null;
}
// A noun's article and bare noun: nounParts(), or — for nouns it leaves
// out (irregular or unchanged plural) — just what the card shows.
function czNounBits(w) {
  if (posOf(w) !== "noun") return null;
  const np = nounParts(w);
  if (np) return np;
  const f = String(gameForm(w)).trim();
  const m = IS_FRENCH_APP ? f.match(/^(le|la|les)\s+([^,;!?]+)$/i) || f.match(/^(l)['’]([^,;!?]+)$/i) : f.match(/^(der|die|das)\s+([A-ZÄÖÜ][\p{L}-]*)$/u);
  return m ? { answer: m[1].toLowerCase(), noun: m[2], full: f, loose: true } : null;
}
// How a noun's options look:
//   "det"      the sentence's article pins the gender: bare nouns, and
//              nouns of the wrong gender as traps (den ___ → not Tasche)
//   "article"  the gap takes the article too (no article in the
//              sentence; French: the article is hidden): options with
//              their article, the wrong article as a trap
//   "bare"     something else stands there (fünf / ma / l' / a plural
//              form): bare nouns — "fünf die Minute" makes no sense
//   null       not a noun
function clozeNounMode(w, info) {
  const np = czNounBits(w);
  if (!np) return null;
  const gap = normalize(info.answer || "");
  if (gap === normalize(np.full)) return "article"; // the gap hides the article too
  if (gap !== normalize(np.noun)) return "bare";
  if (clozeDetFor(w, info)) return "det";
  return IS_FRENCH_APP || clozeDeterminer(info.before) ? "bare" : "article";
}
// Word kinds, by the slots they can stand in: adjectives and adverbs
// swap freely ("Ich möchte nur / kurz ein Glas"), so they are one kind;
// conjugation-deck forms ("schlafe") are verbs.
function clozeKind(x) {
  const p = posOf(x);
  if (p === "verb" || p === "participle") return "verb";
  if (p === "adj" || p === "adv") return "mod";
  if (p === "other") return /conj|praet|präter|perfekt|imparfait|futur|pass/i.test(x.deckId || "") ? "verb" : "func";
  return p;
}
// Which kinds may be a wrong option for which: never one that could take
// the slot too. Adverbs stand where time nouns do ("Freitag / pünktlich
// fahren wir"), nouns after "ich bin" (Arzt), function words next to
// greetings — so those pairs are out.
const CZ_OTHER_KINDS = { noun: ["verb", "func"], verb: ["noun", "mod", "func"], mod: ["verb", "func"], num: ["noun", "verb", "func"],
  func: ["noun", "verb"], phrase: ["noun", "verb"], other: ["noun", "verb"] };
const CZ_PAST_RE = /präteritum|praeteritum|past|partizip|perfekt|plusquam/i;
// ── Same verb, another card ───────────────────
// Verb forms have cards of their own (sprang, besaß, attendez, été), so
// "another word" can be the answer's own verb. czVerb(x) →
//   { lemmas: Set of infinitives, shape: "inf" | "form" }, or null.
const CZ_FORM_DECK = /conj|praet|präter|partizip|p2|konjunktiv|imparfait|futur|pass|participio|plusq/i;
const CZ_VERB_HINT = /·\s*(hat|ist)\s|präteritum|partizip|participio|\bverb|\bverbo/i;
const CZ_PRON = /^(ich|du|er|sie|es|wir|ihr|je|j|tu|il|elle|on|nous|vous|ils|elles)\s+/i;
let _czFormIdx = null;
const _czVerbCache = new Map();
_gameCacheClearers.push(() => { _czFormIdx = null; _czVerbCache.clear(); });
// German: every form the grammar knows → its infinitives.
function czFormIndex() {
  if (_czFormIdx) return _czFormIdx;
  const m = _czFormIdx = new Map();
  if (IS_FRENCH_APP || typeof verbBank !== "function" || typeof GR_DE === "undefined" || !GR_DE) return m;
  const put = (f, inf) => { if (!f || /\s/.test(f)) return; const k = normalize(f); if (!m.has(k)) m.set(k, new Set()); m.get(k).add(normalize(inf)); };
  verbBank().verbs.forEach(({ inf, F }) => {
    const pre = F.sep || "";
    [F.pr, F.pt, F.k2].forEach(t => Object.values(t || {}).forEach(f => { put(f, inf); if (pre) put(pre + f, inf); }));
    put(F.p2, inf); put(F.inf, inf);
    if (F.im) put(F.im.du, inf);
  });
  return m;
}
function czVerb(x) {
  const key = wordKey(x) + "|" + gameForm(x);
  if (_czVerbCache.has(key)) return _czVerbCache.get(key);
  let res = null;
  const kind = clozeKind(x), formDeck = CZ_FORM_DECK.test(x.deckId || "");
  if (kind === "verb" || (kind === "func" && (formDeck || CZ_VERB_HINT.test(x.hint || "")))) {
    const form = String(gameForm(x)).trim().replace(/^(sich|se)\s+/i, "").replace(/^s['’]/i, "");
    const lemmas = new Set();
    const addL = l => { if (l) lemmas.add(normalize(String(l).replace(/^(sich|se)\s+/i, "").replace(/^s['’]/i, ""))); };
    // "müssen — sie ___", "abbiegen (Partizip II) — er ist ___", "attendre — vous"
    const en = String(x.en || "").match(/^(?:(?:sich|se)\s+)?([\p{Ll}]+)\s*(?:\([^)]*\)\s*)?—/u);
    if (en) addL(en[1]);
    const part = String(x.hint || "").match(/participio de ([\p{L}]+)/u);
    if (part) addL(part[1]);
    // "je vais venir", "ich wäre"
    const bare = form.replace(CZ_PRON, "");
    const fut = IS_FRENCH_APP && bare.match(/^(?:vais|vas|va|allons|allez|vont)\s+(\S+)$/);
    if (fut) addL(fut[1]);
    const isInf = !formDeck && (IS_FRENCH_APP ? /^[\p{L}'’-]+(er|ir|re|oir)$/u.test(form)
      : /^[a-zäöüß]+(en|ern|eln|n)$/.test(form) && (kind === "verb" || CZ_VERB_HINT.test(x.hint || "")));
    if (isInf) addL(form);
    if (!lemmas.size && !IS_FRENCH_APP) {
      // A German form: by the grammar (a split verb: lade ein → einlade).
      const toks = bare.split(/\s+/), idx = czFormIndex();
      const hit = idx.get(normalize(toks.length === 2 ? toks[1] + toks[0] : toks[0]));
      if (hit) hit.forEach(l => lemmas.add(l));
    }
    if (!lemmas.size) addL(form);
    res = { lemmas, shape: isInf ? "inf" : "form" };
  }
  _czVerbCache.set(key, res);
  return res;
}
const czSameVerb = (a, b) => !!a && !!b && [...a.lemmas].some(l => b.lemmas.has(l));
// Options you said also fit this sentence ("That fits too").
function czAlsoFits(w) { const m = S.games && S.games.czFits; return (m && m[wordKey(w)]) || []; }
function czMarkFits(w, text) {
  if (!S.games) return;
  const m = S.games.czFits || (S.games.czFits = {});
  const k = wordKey(w), list = (m[k] || []).filter(t => t !== normKey(text));
  list.push(normKey(text));
  delete m[k];
  m[k] = list.slice(-6);
  const keys = Object.keys(m);
  if (keys.length > 300) keys.slice(0, keys.length - 300).forEach(x => delete m[x]);
}
// A mix-up you said wasn't one: it stops coming back as a trap.
function czForgetConfusion(w, other) {
  const m = S.games && S.games.confuse;
  if (!m) return;
  const a = wordKey(w), b = wordKey(other);
  if (m[a]) m[a] = m[a].filter(x => x !== b);
  if (m[b]) m[b] = m[b].filter(x => x !== a);
}
// A form card is only worth a gap when the sentence uses that form
// ("abgebogen" over "…links abbiegen" would make the answer wrong).
function czFormMatchesGap(w, info) {
  // German capitals tell a noun from a verb: das Frühstück can't fill
  // "Ich ___ jeden Morgen" (frühstücke), essen can't fill "Das ___ ist gut".
  if (!IS_FRENCH_APP) {
    const last = String(info.answer || "").trim().split(/\s+/).pop() || "";
    const midSentence = /\p{L}[^.!?:;–]*$/u.test(info.before || "");
    if (czNounBits(w) && /^[a-zäöüß]/.test(last)) return false;
    if (["verb", "mod"].includes(clozeKind(w)) && midSentence && /^[A-ZÄÖÜ]/.test(last) && !/^[A-ZÄÖÜ]/.test(gameForm(w))) return false;
  }
  // A phrase only when the gap holds all of it: "Tu as ___" can't take
  // "avoir raison". (Nouns lose their article, reflexives their sich / se,
  // split verbs their particle — those are handled elsewhere.)
  const np = czNounBits(w);
  const core = String(np ? np.noun : gameForm(w)).trim().replace(/^(sich|se)\s+/i, "").replace(/^s['’]/i, "");
  const words = t => (String(t).trim().match(/[\p{L}\d]+/gu) || []).length;
  const v = czVerb(w);
  if (!(v && v.shape === "form") && words(info.answer || "") < words(core)) return false;
  // French l'est: the gap must be that noun, so something a noun takes
  // stands before it ("Strasbourg ___ à l'est" hid the verb est).
  if (IS_FRENCH_APP && np && /^l['’]/i.test(np.full) && normalize(info.answer || "") !== normalize(np.full)
    && !frDeterminer(info.before) && !/(^|\s)(en|à|de|pour|sans|avec|par|chez|sur|sous|dans|entre|vers|après|avant|suis|es|est|sommes|êtes|sont)\s+$/i.test(info.before || "")) return false;
  if (!v || v.shape !== "form") return true;
  const form = normalize(String(gameForm(w)).replace(/^(sich|se)\s+/i, "")), gap = normalize(info.answer || "");
  if (gap === form || gap === form.split(" ")[0]) return true; // split: "lade ein" → Lade
  return IS_FRENCH_APP && gap.startsWith(form) && gap.length - form.length <= 2; // partie, montées
}
// Words that fit almost any slot of their kind: days, months, seasons
// ("Chaque ___" → matin / mai), colours ("Das Glas ist ___" → grau),
// frequencies ("hat ___ geöffnet" → zweimal).
const CZ_CALENDAR = /^(day|month|season|calendar|colou?r|frequency)$|día de la semana|mes del año|^estación|^color|^frecuencia/i;
const FR_INF_TAKER = /^(vais|vas|va|allons|allez|vont|peux|peut|pouvons|pouvez|peuvent|dois|doit|devons|devez|doivent|veux|veut|voulons|voulez|veulent|sais|sait|savons|savez|savent|faut|aime|aimes|aiment|aimons|aimez|adore|adores|préfère|préfères|préférons|préférez|préfèrent|voudrais|voudrait|pourrais|pourrait|devrais|devrait)$/i;
const DE_INF_TAKER = /(^|[^\p{L}])(muss|musst|müssen|müsst|kann|kannst|können|könnt|will|willst|wollen|wollt|soll|sollst|sollen|sollt|darf|darfst|dürfen|dürft|möchte|möchtest|möchten|möchtet|werde|wirst|wird|werden|werdet|könnte|könntest|könnten|sollte|solltest|sollten|müsste|müssten|würde|würdest|würden|lass|lasse|lässt|lassen)([^\p{L}]|$)/iu;
// mode: how a noun's options look (clozeNounMode). useCase: the article
// is hidden too and asked in step 2.
function clozeDistractors(w, info, pool, n, formFn, hard, mode, useCase) {
  const kind = clozeKind(w);
  const gapN = normalize(info.answer || "");
  // Never the gap's own word under another card ("erlaubt" for erlauben).
  const fillsGap = x => [formFn(x), gameForm(x), nounParts(x) ? nounParts(x).noun : ""].some(f => f && normalize(f) === gapN);
  const banned = new Set(czAlsoFits(w));
  const wv = czVerb(w);
  // Verbs: never the answer's own verb in another form (sprang for
  // springen, besitzen for besaß), and the same shape as the answer —
  // infinitives with an infinitive, forms with a form — so the answer
  // isn't the one infinitive among past forms.
  const fitsShape = x => {
    const xv = czVerb(x);
    if (!xv) return true;
    if (czSameVerb(wv, xv)) return false;
    return !wv || xv.shape === wv.shape;
  };
  // A gap that holds its own subject ("___ demain" = je vais venir,
  // "___ gern reich" = ich wäre) takes any clause: never another one.
  const clause = t => CZ_PRON.test(String(t).trim());
  const wClause = clause(gameForm(w));
  // Days, months, colours…: never a trap, unless the answer is a verb.
  const calendar = x => !wv && CZ_CALENDAR.test(String(x.hint || "").trim());
  // An infinitive fits after aller / pouvoir / pour… and at the end of a
  // clause with a modal ("Je vais ___" → mieux / fumer): no infinitive
  // traps there when the answer isn't a verb.
  const afterGap = String(info.example[WORD_KEY] || "").slice(String(info.before || "").length + String(info.answer || "").length);
  const infSlot = !wv && (IS_FRENCH_APP
    ? FR_INF_TAKER.test((String(info.before || "").trim().split(/\s+/).pop() || "")) || /(^|\s)(pour|sans|de|d['’])\s*$/i.test(info.before || "")
    : /(^|\s)zu\s+$/i.test(info.before || "") || (DE_INF_TAKER.test(info.before || "") && /^\s*([.,!?;:–]|$)/.test(afterGap)));
  const infHere = x => infSlot && (czVerb(x) || {}).shape === "inf";
  // Never the answer with a word added or taken away (ärgerlich über).
  const wToks = normKey(formFn(w)).split(" ");
  const nearCopy = x => { const t = normKey(formFn(x)).split(" "); return t.length !== wToks.length && t.some(a => a.length >= 4 && wToks.includes(a)); };
  const out = [], seen = new Set([normKey(formFn(w))]);
  const add = list => list.forEach(x => {
    const k = normKey(x.opt ? x.opt.text : formFn(x));
    if (out.length < n && !seen.has(k) && !banned.has(k)) { seen.add(k); out.push(x); }
  });
  // A split verb ("Füllen Sie … aus"): the particle is in the sentence,
  // so any verb with that particle could fill the gap (auswählen).
  const after = afterGap;
  const vp = wv && wv.shape === "inf" && !IS_FRENCH_APP && typeof verbParse === "function" ? verbParse(gameForm(w)) : null;
  const hasWord = (t, p) => new RegExp(`(^|[^\\p{L}])${p}([^\\p{L}]|$)`, "iu").test(t);
  const split = !!(vp && vp.sep && !gapN.startsWith(normalize(vp.sep)) && hasWord(after, vp.sep));
  const sameParticle = x => { if (!split || !czVerb(x)) return false; const q = verbParse(String(gameForm(x)).replace(/^sich\s+/, "")); return !!q && q.sep === vp.sep; };
  // sameOk: the answer's own verb may come back (SAME WORD, WRONG FORM).
  const pick = (k, filter, h = hard, sameOk = false) => k > 0 ? pickDistractors(w, pool, k, formFn,
    x => !fillsGap(x) && !banned.has(normKey(formFn(x))) && !nearCopy(x) && !(wClause && clause(gameForm(x))) && !calendar(x) && !infHere(x) && !sameParticle(x)
      && (sameOk || fitsShape(x)) && filter(x), { hard: h }) : [];
  const np = czNounBits(w), det = mode === "det" ? clozeDetFor(w, info) : null;
  if (det) {
    // GENDER: same-topic nouns the article rules out. A noun whose plural
    // looks like its singular (der Lehrer, die Lehrer) could still fit
    // as a plural — never a trap. French: le / la / ma… only stand
    // before a consonant (l' / mon before a vowel), so the trap does too.
    const dLow = escapeHtml(det.det.toLowerCase());
    const vowel = /^[aeiouyhàâéèêëîïôûœ]/i;
    const clean = x => {
      const p = nounParts(x);
      if (!p) return false;
      if (IS_FRENCH_APP) return p.full !== p.noun && !(/^(le|la|ma|ta|sa|ce|du|au)$/i.test(det.det) && vowel.test(p.noun));
      const pl = germanPluralNoun(x);
      return pl && pl !== p.noun;
    };
    const gOf = p => CZ_GENDER[p.answer];
    add(pick(2, x => clean(x) && !det.genders.includes(gOf(nounParts(x))), true).map(x => { const p = nounParts(x);
      return { opt: { text: p.noun, correct: false, word: x,
        why: `${escapeHtml(p.noun)} is ${CZ_GENDER_NAME[gOf(p)]} (${colorArticleHtml(p.full)}) — it can't follow <b>${dLow}</b>` } }; }));
    // NUMBER: the plural can't follow ein / einen / das / dem…
    const pl = germanPluralNoun(w), d = det.det.toLowerCase();
    const plBlocked = /^(das|dem|ein|eine|einen|einem|einer)$/.test(d) || /em$/.test(d) || /^(kein|mein|dein|sein|ihr|unser|euer)$/.test(d)
      || ((d === "den" || /en$/.test(d)) && pl && !/[ns]$/.test(pl));
    if (pl && pl !== np.noun && plBlocked && !CZ_CONTR[d] && Math.random() < 0.6)
      add([{ opt: { text: pl, correct: false, why: `${escapeHtml(pl)} is the plural — <b>${dLow}</b> needs one ${escapeHtml(np.noun)}` } }]);
  } else if (mode === "article" && !useCase) {
    // ARTICLE: no article in front of the gap ("Haben wir noch ___?"),
    // so the options carry theirs — the same noun with a wrong one is a
    // trap (only one of die / der / das Milch is German). Another noun
    // is never offered: Milch, Fisch and Brot would all fit.
    // Only articles no case can give this noun: "mit der Karte" is
    // right (Dativ), so never der for a feminine noun; die / der for
    // m / n only when the plural looks different (die Zimmer is plural).
    const pl = germanPluralNoun(w), plDiffers = !!pl && pl !== np.noun;
    const ok = { m: { die: plDiffers, das: true }, f: { das: true }, n: { die: plDiffers, der: plDiffers } }[CZ_GENDER[np.answer]] || {};
    const wrong = IS_FRENCH_APP ? [articleTrap(w)].filter(Boolean) : shuffle(Object.keys(ok).filter(a => ok[a])).map(a => `${a} ${np.noun}`);
    add(wrong.map(text => ({ opt: { text, correct: false, trap: true } })));
  } else if (kind === "verb" && !IS_FRENCH_APP && wv && wv.shape === "form" && !CZ_PAST_RE.test((w.hint || "") + " " + (w.deckId || ""))
      && /\p{L}/u.test(info.before || "") && !/(^|[^\p{L}])(sie|Sie)([^\p{L}]|$)/u.test(info.example[WORD_KEY] || "")) {
    // SAME WORD, WRONG FORM: another present-tense form or the
    // infinitive (schlafen for "Ich ___ acht Stunden") — the sentence's
    // person rules it out. Only when the answer itself is a present
    // form: never past forms (they could fit too), never with sie / Sie
    // (she plays / they play) or a verb-first sentence (Komm / Kommt
    // bitte!), where two forms can be right.
    const g = gapN.split(" ")[0];
    add(pick(2, x => {
      if (clozeKind(x) !== kind || CZ_PAST_RE.test((x.hint || "") + " " + (x.deckId || ""))) return false;
      const f = normalize(formFn(x)), pre = commonPrefixLen(f, g);
      return pre >= 4 && pre >= 0.6 * Math.min(f.length, g.length);
    }, true, true));
  }
  if (split) {
    // PARTICLE: the verb is split ("Füllen Sie bitte das Formular aus"),
    // so it's plainly a verb — the traps are verbs too, ones that can't
    // end in that particle: another particle (anrufen) or a prefix that
    // never splits (bezahlen).
    const sep = escapeHtml(vp.sep);
    add(pick(2, x => {
      const xv = czVerb(x);
      if (!xv || xv.shape !== "inf") return false;
      const q = verbParse(gameForm(x));
      return !!q && (q.sep ? q.sep !== vp.sep && !hasWord(after, q.sep) : !!q.insep);
    }, true).map(x => { const q = verbParse(gameForm(x)), f = escapeHtml(gameForm(x));
      return { opt: { text: gameForm(x), correct: false, word: x,
        why: q.sep ? `${f} splits off <b>${escapeHtml(q.sep)}</b> — this sentence ends in <b>${sep}</b>`
          : `${f} never splits — the <b>${sep}</b> here belongs to the verb in the gap` } }; }));
  }
  // LOOK-ALIKES of a kind that can't take the slot (hard mode scores
  // spelling similarity). A verb closing its clause next to another
  // ("noch ___ gehen") could be an adverb too: noch einmal gehen.
  let others = CZ_OTHER_KINDS[kind] || CZ_OTHER_KINDS.other;
  if (wv && /^\s+[a-zäöüß]+\s*([.,!?;:–-]|$)/.test(after)) others = others.filter(k => k !== "mod");
  add(pick(n - out.length, x => others.includes(clozeKind(x))));
  if (out.length < n) add(pick(n, x => others.includes(clozeKind(x)), false));
  return out;
}
// Grammar stats (never word stages): S.games.cases[kind] = [right, total].
function recordGrammar(kind, ok) {
  if (!kind || !S.games) return;
  const c = S.games.cases || (S.games.cases = {});
  const r = c[kind] || (c[kind] = [0, 0]);
  if (ok) r[0]++;
  r[1]++;
}
const GRAMMAR_LABEL = { nom: "Nominativ", akk: "Akkusativ", dat: "Dativ", gen: "Genitiv", verb: "verb forms", adj: "adjective endings" };
function grammarSummary(tally) {
  const parts = Object.entries(tally).filter(([, r]) => r[1]).map(([k, r]) => `${GRAMMAR_LABEL[k] || k} ${r[0]}/${r[1]}`);
  if (!parts.length) return "";
  const weak = Object.entries(tally).filter(([, r]) => r[1] >= 2 && r[0] / r[1] < 0.6).map(([k]) => GRAMMAR_LABEL[k] || k);
  return `🧭 ${parts.join(" · ")}${weak.length ? ` — work on: ${weak.join(", ")}` : ""}`;
}

registerGame({
  id: "cloze", name: "Gap Fill", icon: "🕳️", skill: "Words in context", credit: "recognition",
  ranks: [
    { peek: true }, { peek: true }, { peek: false }, { peek: false, typed: true }, { peek: false, typed: true, options: 5 },
  ],
  twists: ["golden", "sudden"],
  howTo: () => ["Pick the word that fits the sentence."],
  requirement(pool) {
    const n = clozeWords(pool).length;
    return n >= 4 ? { ok: true } : { ok: false, reason: `Needs 4 words with example sentences — you have ${n}` };
  },
  stars: [70, 110, 140],
  start(ctx) {
    const rp = ctx.rp;
    const total = ctx.rounds(10, 5, 5);
    const words = sampleWords(clozeWords(ctx.pool), total);
    let r = 0, score = 0, combo = 0, maxCombo = 0, correct = 0, wrong = 0, noPeek = 0, typedOk = 0, q = null, peeked = false;
    const tally = {};
    const tallyAdd = (k, ok) => { if (!k) return; const t = tally[k] || (tally[k] = [0, 0]); if (ok) t[0]++; t[1]++; recordGrammar(k, ok); };
    const done = () => ctx.finish({ score, correct, wrong, maxCombo, typedCorrect: typedOk, stats: { noPeek }, note: grammarSummary(tally) });

    const round = () => {
      if (r >= words.length) { done(); return; }
      const w = words[r++];
      const info = clozeInfo(w);
      const f = ctx.fmt(w);
      let step = clozeFormStep(w, info);
      // Variety for case nouns: half the time the article stays in the
      // sentence and the traps are nouns of the wrong gender instead.
      if (step && step.kind === "case" && !f.rookie && clozeDetFor(w, info) && Math.random() < 0.5) step = null;
      const typed = !!rp.typed && f.typed && ctx.size === "full" && !!info.answer;
      const n = Math.min(f.options, 5);
      // Case words: step 1 asks only for the noun ("– Mund"); the article
      // the sentence needs is step 2. Showing "der Mund" first would give
      // the dictionary article — which is usually not the one in the gap.
      const caseStep = !!step && step.kind === "case";
      const bare = x => { const np = czNounBits(x); return np ? np.noun : gameForm(x); };
      // Nouns show without their article when the sentence has one in
      // front of the gap (it would give the gender away) or anything else
      // that stands there (fünf / ma / l'): see clozeNounMode.
      const nounMode = caseStep ? null : clozeNounMode(w, info);
      const formFn = caseStep || nounMode === "det" || nounMode === "bare" ? bare : gameForm;
      const opts = typed ? [] : mcChoices(w, {
        text: caseStep ? x => (nounParts(x) ? "– " : "") + bare(x) : formFn, formFn, n, pool: ctx.pool, target: !caseStep, hard: !f.rookie, noTrap: true,
        pick: k => clozeDistractors(w, info, ctx.pool, k, formFn, !f.rookie, nounMode, caseStep),
        none: !f.rookie && ctx.size === "full" && ctx.rank >= 1 });
      // The translation hides the word's own meaning (else it's the answer).
      const transHtml = redactTranslation(info.example.en, gamePrompt(w));
      // Case words hide the article too, so it can't give the word away.
      const gapHtml = step && step.kind === "case" ? step.ci.gapBoth : info.html;
      const typedAnswer = step && step.kind === "case" ? `${step.ci.det} ${step.ci.noun}` : info.answer;
      q = { w, info, opts, typed, step, stage: 1, typedAnswer, f };
      peeked = false;
      ctx.teach("");
      ctx.setBar((r - 1) / words.length, "progress");
      ctx.setRound(r, words.length);
      const peekOk = rp.peek !== false || ctx.size !== "full";
      ctx.stage.innerHTML = `
        <div class="cz-card g-enter">
          <div class="g-q-label">${typed ? "Type the missing word" + (caseStep ? "s — with the right article" : "") : caseStep ? "Which word fits? <small class=\"cz-next\">article next</small>" : "Which word fits?"}${ctx.tag(w)}</div>
          <div class="cz-sentence" id="cz-sentence">${gapHtml}</div>
          ${typed ? `<div class="cz-trans">(${escapeHtml(gamePrompt(w))})</div>` : ""}
          ${peekOk && transHtml ? `<button class="g-link-btn cz-peek" id="cz-peek">Show translation</button>` : ""}
          <div class="cz-trans" id="cz-trans" style="display:none">${transHtml || ""}</div>
          ${step && !typed ? `<div class="cz-steps"><span class="on">1 · word</span><span>2 · ${caseStep ? "article" : "form"}</span></div>` : ""}
        </div>
        <div id="cz-opts">${typed ? gTypedHtml(step && step.kind === "case" ? "article + word, as in the sentence…" : "the word as it appears…") : mcOptionsHtml(opts)}</div>`;
      const pk = document.getElementById("cz-peek");
      if (pk) pk.onclick = () => {
        peeked = true;
        document.getElementById("cz-trans").style.display = "";
        pk.style.display = "none";
      };
      if (typed) gTypedBind(ctx, v => answerTyped(v));
      ctx.busy = false;
    };
    const reveal = ok => {
      const sEl = document.getElementById("cz-sentence");
      const html = q.step && q.step.kind === "case" ? q.step.ci.reveal : q.info.reveal;
      if (sEl) { sEl.innerHTML = html; sEl.classList.remove("ok", "bad"); sEl.classList.add(ok ? "ok" : "bad"); }
      const tr = document.getElementById("cz-trans"), pk = document.getElementById("cz-peek");
      if (tr) { tr.textContent = q.info.example.en || ""; tr.style.display = ""; }
      if (pk) pk.style.display = "none";
      speak(q.info.example[WORD_KEY]);
    };
    // count: false when the question isn't settled yet (a two-step item
    // counts as right only once its second step is right too).
    const award = (btn, base, count = true) => {
      const pts = ctx.award(q.w, base, count);
      score += pts;
      floatScore(btn, "+" + pts, ctx.isGolden(q.w) ? "gold" : "");
      return pts;
    };
    const good = (btn, base, count = true) => {
      if (count) correct++;
      combo++; maxCombo = Math.max(maxCombo, combo);
      if (!peeked) noPeek++;
      award(btn, base + (peeked ? 0 : 5), count);
      playPop(); haptic("select");
      ctx.say("Correct!");
    };
    const bad = btn => {
      wrong++;
      combo = ctx.comboAfterMiss(combo, q.w);
      const pen = Math.round(5 * ctx.cost(q.w));
      score = Math.max(0, score - pen);
      if (btn) { shakeEl(btn); floatScore(btn, "−" + pen, "bad"); }
      playMiss(); haptic("miss");
      ctx.missed(q.w);
      ctx.say(`It was ${gameForm(q.w)}`);
    };
    const next = () => (ctx.sudden && q.failed ? done() : round());

    // Step 2: the form the sentence needs.
    const showStep2 = () => {
      const st = q.step;
      q.stage = 2;
      const n = q.f.rookie ? 3 : Math.min(5, st.options.length);
      let pool = st.options.filter(o => o !== st.answer);
      // Always offer the dictionary form (der for den) — the classic slip.
      if (st.kind === "case") {
        const dict = st.ci.dict.split(" ")[0];
        pool = [...pool.filter(o => o === dict), ...shuffle(pool.filter(o => o !== dict))];
      }
      q.opts2 = shuffle([{ text: st.answer, correct: true }, ...pool.slice(0, n - 1).map(t => ({ text: t, correct: false }))]);
      const sEl = document.getElementById("cz-sentence");
      if (sEl) {
        sEl.classList.remove("ok", "bad");
        sEl.innerHTML = st.kind === "case" ? st.ci.html : q.info.html;
      }
      const lbl = ctx.stage.querySelector(".g-q-label");
      if (lbl) lbl.innerHTML = st.kind === "case" ? `Which article? <span class="cz-lemma">${colorArticleHtml(gameForm(q.w))}</span>`
        : st.kind === "verb" ? `Which form of <span class="cz-lemma">${escapeHtml(gameForm(q.w))}</span>?`
        : `Which ending? <span class="cz-lemma">${escapeHtml(gameForm(q.w))}</span>`;
      const steps = ctx.stage.querySelector(".cz-steps");
      if (steps) steps.innerHTML = `<span class="done">1 · word ✓</span><span class="on">2 · form</span>`;
      document.getElementById("cz-opts").innerHTML = mcOptionsHtml(q.opts2, "mono");
      ctx.busy = false;
    };
    const answer2 = i => {
      const opt = q.opts2[i];
      if (!opt) return;
      ctx.busy = true;
      const btn = ctx.stage.querySelector(`.g-opt[data-i="${i}"]`);
      mcReveal(ctx.stage, q.opts2, i);
      const st = q.step;
      reveal(opt.correct);
      tallyAdd(st.kind === "case" ? st.c : st.kind, opt.correct);
      if (opt.correct) {
        correct++;
        award(btn, 8);
        playSuccess(); haptic("select");
        ctx.teach(`✓ ${st.reason}`, "ok");
        gTimeout(next, 2200);
      } else {
        // The word was right, the form wasn't: a mistake on this question
        // (grammar only — the word's stage is untouched).
        wrong++; q.failed = true;
        combo = ctx.comboAfterMiss(combo, q.w);
        if (btn) shakeEl(btn);
        playMiss(); haptic("miss");
        ctx.teach(`✗ Not <s>${escapeHtml(opt.text)}</s> — it's ${st.reason}`, "bad");
        ctx.waitContinue(next);
      }
      ctx.setScore(score); ctx.setCombo(combo);
    };
    const answer = i => {
      if (!q || q.typed || ctx.busy || ctx.finished || ctx.waiting) return;
      if (q.stage === 2) { answer2(i); return; }
      const opt = q.opts[i];
      if (!opt) return;
      ctx.busy = true;
      const btn = ctx.stage.querySelector(`.g-opt[data-i="${i}"]`);
      mcReveal(ctx.stage, q.opts, i);
      if (opt.correct) {
        ctx.hit(q.w); good(btn, 10, !q.step);
        ctx.setScore(score); ctx.setCombo(combo);
        if (q.step) { gTimeout(showStep2, 650); return; }
        reveal(true);
        gTimeout(next, 1500);
        return;
      }
      const before = { score, combo, missed: ctx.missedWords.some(x => sameWord(x, q.w)) };
      reveal(false);
      q.failed = true;
      noteWrongPick(q.w, opt);
      bad(btn);
      // Not for a wrong article (das Milch): that one is certain.
      const fitsBtn = opt.none || opt.trap ? "" : `<button class="g-link-btn cz-fits" id="cz-fits">🤔 That fits too? Count it</button>`;
      ctx.teach(wordLessonHtml(q.w, opt, q.step && q.step.kind === "case" ? `<div class="g-teach-rule">${q.step.reason}</div>` : "") + fitsBtn, "bad");
      ctx.waitContinue(next);
      const fb = document.getElementById("cz-fits");
      if (fb) fb.onclick = () => alsoFits(opt, btn, before, fb);
      ctx.setScore(score); ctx.setCombo(combo);
    };
    // "That fits too": the option you picked works in this sentence as
    // well — no option can be checked for meaning, so you get the last
    // word. The miss is undone and that option never comes back here.
    const alsoFits = (opt, btn, before, el) => {
      if (!q || !q.failed) return;
      czMarkFits(q.w, opt.text);
      if (opt.word) czForgetConfusion(q.w, opt.word);
      if (typeof logEvent === "function") logEvent("cloze_also_fits", { word: wordKey(q.w), opt: opt.text, ex: q.info.example[WORD_KEY] });
      wrong--; correct++; q.failed = false;
      if (!before.missed) ctx.missedWords = ctx.missedWords.filter(x => !sameWord(x, q.w));
      ctx.hit(q.w);
      combo = before.combo + 1; maxCombo = Math.max(maxCombo, combo);
      score = before.score + ctx.award(q.w, 10);
      if (btn) { btn.classList.remove("wrong"); btn.classList.add("right"); }
      el.outerHTML = `<div class="g-teach-sub">✓ Counted — ${escapeHtml(opt.text)} won't be offered for this sentence again.</div>`;
      ctx.say("Counted");
      ctx.setScore(score); ctx.setCombo(combo);
    };
    const answerTyped = v => {
      if (!q || !q.typed || ctx.busy || ctx.finished) return;
      ctx.busy = true;
      const input = document.getElementById("g-typed");
      const res = gradeTyped(v, [q.typedAnswer]);
      const st = q.step;
      reveal(res === true);
      if (res === true) {
        typedOk++; ctx.hit(q.w, "recall"); if (input) input.classList.add("correct");
        good(input, st && st.kind === "case" ? 20 : 15);
        if (st && st.kind === "case") { tallyAdd(st.c, true); ctx.teach(`✓ ${st.reason}`, "ok"); gTimeout(next, 2200); }
        else gTimeout(next, 1500);
      } else if (res === "near") {
        if (input) input.classList.add("near");
        ctx.say("Almost — check the spelling");
        ctx.teach(`≈ Almost — ${diffHtml(v, q.typedAnswer)}`, "near");
        ctx.waitContinue(next);
      } else {
        // The right word with the wrong article / form: the word counts
        // (recall), the grammar doesn't — and you see why.
        const lastTok = String(v).trim().split(/\s+/).pop();
        const wordRight = st && st.kind === "case"
          ? normalize(lastTok) === normalize(st.ci.noun) || gradeTyped(v, [gameForm(q.w), q.w[WORD_KEY]]) === true
          : gradeTyped(v, [gameForm(q.w), q.w[WORD_KEY]]) === true;
        if (wordRight) {
          typedOk++; ctx.hit(q.w, "recall");
          if (input) input.classList.add("near");
          award(input, 5, false);
          wrong++;
          if (st && st.kind === "case") tallyAdd(st.c, false);
          ctx.say(`Right word — here it's ${q.typedAnswer}`);
          ctx.teach(`Right word — but this sentence needs <strong>${escapeHtml(q.typedAnswer)}</strong>.${st ? `<div class="g-teach-rule">${st.reason}</div>` : ""}`, "near");
          ctx.waitContinue(next);
        } else {
          if (input) input.classList.add("wrong");
          q.failed = true;
          bad(input);
          ctx.teach(wordLessonHtml(q.w, null, `<div class="g-teach-sub">Here: <strong>${escapeHtml(q.typedAnswer)}</strong></div>${st ? `<div class="g-teach-rule">${st.reason}</div>` : ""}`), "bad");
          ctx.waitContinue(next);
        }
      }
      ctx.setScore(score); ctx.setCombo(combo);
    };

    gListen(ctx.stage, "click", e => { const b = e.target.closest(".g-opt"); if (b) answer(+b.dataset.i); });
    ctx.onKey = e => {
      const list = q && (q.stage === 2 ? q.opts2 : q.opts);
      const i = digitKey(e, list && list.length ? list.length : 4);
      if (i >= 0) { e.preventDefault(); answer(i); }
    };
    ctx.setScore(0);
    round();
  },
});
