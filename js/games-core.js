// ── GAMES CORE ────────────────────────────────
// Shared engine for the minigames (game-*.js). Owns:
//   • the registry — each game file calls registerGame() at load
//   • the word pool — "words you know", or the decks picked in the hub
//   • word helpers — display forms, gender/plural parsing, distractors
//   • the lifecycle — HUD, intro, countdown, pause, cleanup, results
//   • the hub, the pool picker, Daily Challenge, Arcade Mix and the
//     Surprise Rounds that pop up inside Drill
//
// Progress rules (decided with the user):
//   • Games give XP and feed the daily goal 1:1, capped at 30% of it
//     (creditGameAnswers in progression.js).
//   • Tiered credit: a word answered right in a choice game gets
//     recognition credit (can lift a due word up to 🌿 Familiar); typed
//     formats give recall credit (all stages). A miss never demotes —
//     it flags the word for a typed check. Applied once, at the end of
//     a finished round (ctx.hit / ctx.missed), never for abandoned ones.
//   • Two kinds of difficulty: the game's RANK (🥉→💎, per game) sets
//     arcade handling — speed, time, lives, board size; each WORD's
//     stage sets its format (itemFormat): 🌱 words always get the gentle
//     version, typed formats only for words you know.
//   • Every miss costs something; a miss on a 🌱 word costs half.
//   • Anki cards join the pool only once introduced, and games never
//     write to ws.anki.
//
// A game definition:
//   { id, name, icon, skill, howTo:[…lines], timed, noPause,
//     requirement(pool) → { ok, reason },
//     start(ctx),               // begins play; ctx documented at makeCtx
//     stars:[s1,s2,s3] | starsFor(result),
//     xpFor?(result, size),     // override the default XP formula
//     inRuns? (default true),   // may appear in Daily / Mix rounds
//     ranks?: [p0…p4],          // arcade params per rank (ctx.rp)
//     twists?: ["mirror", …],   // twists the game supports
//     credit?: "recognition"|"recall"|null, liveCredit?, audio? }
// ─────────────────────────────────────────────

const GAMES = [];
function registerGame(def) { GAMES.push(def); }
function getGame(id) { return GAMES.find(g => g.id === id) || null; }

const IS_FRENCH_APP = WORD_KEY === "fr";
const GAME_RUN_EXCLUDE = new Set(["boss"]); // long, typed — hub only

// (hashString / seededRandom live in config.js)
function randInt(n) { return Math.floor(Math.random() * n); }

// ── WORD HELPERS ──────────────────────────────
function wordKey(w) { return w.deckId + "_" + w.idx; }
function sameWord(a, b) { return !!a && !!b && a.deckId === b.deckId && a.idx === b.idx; }

const ARTICLE_RE = /^(der|die|das|den|dem|le|la|un|une)$/i;

// Clean display form of an answer string:
//   "die Katze, -n"            → "die Katze"
//   "der Mann, pl. die Männer" → "der Mann"
//   "sie (plural 3rd person)"  → "sie"
//   "der Lehrer / die Lehrerin"→ "der Lehrer"
//   "[sich (AKK)] verstecken"  → "sich verstecken"
//   "lesen +AKK"               → "lesen"
//   "der Mann, der"            → unchanged (relative clause, not a plural)
//   "der/das Joghurt"          → unchanged (article alternatives)
function formOf(s) {
  let t = String(s == null ? "" : s);
  if (t.includes(" / ")) t = t.split(" / ")[0];
  else if (t.includes("/")) {
    const before = t.slice(0, t.indexOf("/")).trim().split(/\s+/).pop() || "";
    if (!ARTICLE_RE.test(before)) t = t.slice(0, t.indexOf("/"));
  }
  t = t.replace(/\(.*?\)/g, " ").replace(/[\[\]]/g, "");
  t = t.replace(/\s*\+\s*[A-ZÄÖÜ]{2,}\b/g, "");
  t = t.replace(/,\s*(pl\.|-|¨|–).*$/, "");
  t = t.replace(/\s+([.,!?;:])/g, "$1").replace(/\s+/g, " ").trim();
  return t.replace(/,$/, "").trim() || String(s || "").trim();
}
const _formCache = new Map();
function gameForm(word) {
  const raw = word[WORD_KEY];
  let f = _formCache.get(raw);
  if (f === undefined) { f = formOf(raw); _formCache.set(raw, f); }
  return f;
}
function gamePrompt(word) { return String(word.en || "").trim(); }
// A prompt's spaced " / " alternatives ("please / you're welcome" →
// please, you're welcome). A distractor sharing one would be a second
// right answer. Unspaced slashes ("er/sie/es") are not alternatives.
const _altCache = new Map();
function promptAlts(word) {
  const p = gamePrompt(word);
  let a = _altCache.get(p);
  if (!a) { a = p.split(" / ").map(normKey).filter(Boolean); _altCache.set(p, a); }
  return a;
}
function sharesPromptAlt(a, b) { const s = new Set(promptAlts(a)); return promptAlts(b).some(x => s.has(x)); }
// Typed recall (Boss Battle): the stored answer or its clean display
// form — "die Katze" must count for "die Katze, -n", "sie" for
// "sie (plural 3rd person)".
function typedCorrect(input, word) {
  return isCorrect(input, word[WORD_KEY]) || isCorrect(input, gameForm(word));
}
const _normCache = new Map();
function normKey(s) {
  s = String(s || "");
  let k = _normCache.get(s);
  if (k === undefined) { k = normalize(s); _normCache.set(s, k); }
  return k;
}

// Part of speech, from the article or the hint text (both languages).
function posOf(word) {
  const f = gameForm(word);
  if (/^(der|die|das|le|la|les|l'|un|une)\s/i.test(f) || /^l'/i.test(f)) return "noun";
  const h = String(word.hint || "").toLowerCase();
  if (/noun|sustantivo|nombre/.test(h)) return "noun";
  if (/partizip/.test(h)) return "participle";
  // Before "verb": "time adverb" and "conjunction — verb goes to the end".
  if (/adverb|adverbio/.test(h)) return "adv";
  if (/^(conjunction|conjunción|preposition|preposición|particle|pronoun|pronombre)|conjunction/.test(h)) return "other";
  if (/verb|verbo/.test(h)) return "verb";
  if (/adjecti|adjetivo/.test(h)) return "adj";
  if (/number|número|numero/.test(h)) return "num";
  if (/phrase|frase|expresión|expresion|locución/.test(h)) return "phrase";
  return f.split(" ").length >= 3 ? "phrase" : "other";
}

// Gender of a noun → { answer, noun, full } or null when the word is
// not a clean single noun with one unambiguous article.
const _nounCache = new Map();
function nounParts(word) {
  const k = word[WORD_KEY] + "|" + (word.hint || "") + "|" + (word.pl || "");
  if (_nounCache.has(k)) return _nounCache.get(k);
  const res = _parseNoun(word);
  _nounCache.set(k, res);
  return res;
}
// Nominalised adjectives take either article (der/die Angestellte), so
// they only count when the prompt says which person is meant.
const ADJECTIVAL_NOUN_RE = /^(Angestellte|Bekannte|Verwandte|Deutsche|Erwachsene|Jugendliche|Kranke|Arbeitslose|Fremde|Verletzte|Tote|Reisende|Vorsitzende|Verlobte|Abgeordnete|Obdachlose|Auszubildende|Studierende|Beschäftigte|Gefangene|Selbstständige|Überlebende|Behinderte|Alte|Geliebte|Freiwillige|Kriminelle|Blinde)$/;
function _parseNoun(word) {
  const raw = String(word[WORD_KEY] || "");
  const hint = String(word.hint || "");
  const en = String(word.en || "");
  if (/plural|always pl|\bpl\.\)/i.test(hint.replace(/\bno plural\b/gi, "")) || /always pl/i.test(raw) || /\(pl(\.|ural)?\)/i.test(en)) return null;
  // Grammar-deck case forms ("der Frau" = of the woman, Genitiv) show a
  // declined article, not the noun's gender.
  if (/genitiv|dativ|akkusativ|nominativ|genitive|dative|accusative|nominative/i.test(en + " " + hint)) return null;
  const f = gameForm(word);
  if (IS_FRENCH_APP) {
    if (raw.includes("/")) return null;
    // l'heure: the deck notes the gender the article hides (single words only).
    if ((word.g === "m" || word.g === "f") && /^l'[\p{L}-]+$/u.test(f))
      return { answer: word.g === "m" ? "le" : "la", noun: f.slice(2), full: f, elided: true, indef: frIndefinite(word) };
    if (/locución|adverbio|expresión|verbo|adjetivo|pronombre/i.test(hint)) return null; // "un peu"
    const m = f.match(/^(le|la|un|une)\s+(\S.*)$/i);
    if (!m || /[,!?]/.test(m[2])) return null;
    const art = m[1].toLowerCase();
    const answer = (art === "le" || art === "un") ? "le" : "la";
    return { answer, noun: m[2], full: f };
  }
  // German: alternatives with different articles are genuinely ambiguous
  const alts = raw.split("/");
  if (alts.length > 1) {
    const arts = alts.map(a => ((a.trim().match(/^(der|die|das)\b/i) || [])[1] || "").toLowerCase());
    if (new Set(arts).size > 1) return null;
  }
  const m = f.match(/^(der|die|das)\s+([A-ZÄÖÜ][\p{L}-]*)$/u);
  if (!m) return null;
  const answer = m[1].toLowerCase(), noun = m[2];
  if (ADJECTIVAL_NOUN_RE.test(noun) && !/\b(male|female|man|woman|men|women)\b/i.test(en)) return null;
  // "die Ferien, pl. die Ferien": feminine nouns always change in the
  // plural, so an unchanged "die" plural means a plural-only noun.
  const pl = germanPluralNoun(word);
  if (answer === "die" && pl && pl === noun) return null;
  return { answer, noun, full: f };
}

// The plural noun (without article) of a German noun, from the `pl`
// field (A1–B1 decks) or the JM-style annotation in the answer.
function germanPluralNoun(word) {
  if (IS_FRENCH_APP) return null;
  const raw = String(word[WORD_KEY] || "");
  if (word.pl) {
    const m = String(word.pl).trim().match(/^die\s+([A-ZÄÖÜ][\p{L}-]*)$/u);
    return m ? m[1] : null;
  }
  let m = raw.match(/,\s*pl\.\s*die\s+([A-ZÄÖÜ][\p{L}-]*)\s*$/u);
  if (m) return m[1];
  m = raw.match(/^(?:der|die|das)\s+([A-ZÄÖÜ][\p{L}]*),\s*-([a-zäöüß]*)\s*$/u);
  if (m) return m[1] + m[2];
  return null;
}

// Distractors: other words whose display form AND prompt both differ
// from the answer's (so duplicates like FR "bonjour" ×2 or DE sie/Sie
// can never mark a right answer wrong). Prefers the same part of
// speech, the same deck and a similar length; falls back to the whole
// app vocabulary when the pool is small.
let _allGameWords = null;
function allGameWords() {
  if (!_allGameWords) {
    _allGameWords = [];
    ALL_GROUPS.forEach(g => g.decks.forEach(d => d.words.forEach((w, i) =>
      _allGameWords.push({ ...w, deckId: d.id, deckName: d.name, idx: i, anki: g.type === "anki" }))));
  }
  return _allGameWords;
}
// opts.hard (games, words you know): prefer look-alikes, same-gender
// nouns and words you've mixed up before — so the answer can't be
// guessed from the article or from one odd-looking option.
function pickDistractors(word, pool, n, formFn = gameForm, filterFn = null, opts = {}) {
  const bad = new Set([normKey(formFn(word))]);
  const badP = new Set([normKey(gamePrompt(word))]);
  const pos = posOf(word);
  const len = formFn(word).length;
  const out = [];
  const hard = !!opts.hard;
  const target = normKey(gameForm(word)).replace(/^(der|die|das|le|la|l|un|une) /, "");
  const gender = hard && nounParts(word) ? nounParts(word).answer : "";
  const mixed = hard ? confusedWith(word) : null;
  // French: never two options that sound the same (vert / verre) when
  // you're listening, or speaking rather than spelling.
  const noSoundAlike = WORD_KEY === "fr" && (opts.ear || speakOn());
  const wordForm = gameForm(word);
  const hardScore = w => {
    let s = 0;
    const f = normKey(gameForm(w)).replace(/^(der|die|das|le|la|l|un|une) /, "");
    if (gender && nounParts(w) && nounParts(w).answer === gender) s += 3;
    if (f.slice(0, 3) === target.slice(0, 3)) s += 2;
    if (f.slice(-3) === target.slice(-3)) s += 1;
    if (Math.abs(f.length - target.length) <= 4 && f.length < 30 && target.length < 30) {
      const sim = 1 - levenshtein(f, target) / Math.max(f.length, target.length);
      if (sim >= 0.5) s += 2.5 * sim;
    }
    if (mixed && mixed.has(wordKey(w))) s += 6;
    return s;
  };
  const take = list => {
    const scored = list
      .filter(w => !sameWord(w, word) && (!filterFn || filterFn(w)) && !(noSoundAlike && frSoundsAlike(gameForm(w), wordForm)))
      .map(w => ({ w, s: (posOf(w) === pos ? 3 : 0) + (w.deckId === word.deckId ? 1.5 : 0)
        + (Math.abs(formFn(w).length - len) <= 3 ? 1 : 0) + Math.random() * (hard ? 0.9 : 1.6) + (hard ? hardScore(w) : 0) }))
      .sort((a, b) => b.s - a.s);
    for (const { w } of scored) {
      if (out.length >= n) break;
      const f = normKey(formFn(w)), p = normKey(gamePrompt(w));
      if (!f || bad.has(f) || badP.has(p)) continue;
      if (sharesPromptAlt(w, word) || out.some(o => sharesPromptAlt(o, w))) continue;
      bad.add(f); badP.add(p); out.push(w);
    }
  };
  take(pool);
  if (out.length < n) take(allGameWords().filter(w => w.deckId === word.deckId));
  if (out.length < n) take(allGameWords());
  return out;
}

// ── HARDER CHOICES ────────────────────────────
// Mix-ups you've made (a wrong pick in a game) come back as traps.
// Small and capped: the 150 most recent words, 3 partners each.
function confusedWith(w) {
  const m = (S.games && S.games.confuse) || {};
  const k = wordKey(w);
  const set = new Set(m[k] || []);
  Object.keys(m).forEach(o => { if ((m[o] || []).includes(k)) set.add(o); });
  return set;
}
function recordConfusion(w, other) {
  if (!w || !other || sameWord(w, other) || !S.games) return;
  const m = S.games.confuse || (S.games.confuse = {});
  const k = wordKey(w), o = wordKey(other);
  const list = (m[k] || []).filter(x => x !== o);
  list.unshift(o);
  delete m[k];
  m[k] = list.slice(0, 3); // re-insert: newest last
  const keys = Object.keys(m);
  if (keys.length > 150) keys.slice(0, keys.length - 150).forEach(x => delete m[x]);
}
// The same noun with a wrong article ("das Mund") — or null.
function articleTrap(w) {
  const np = nounParts(w);
  if (!np) return null;
  const arts = IS_FRENCH_APP ? ["le", "la"] : ["der", "die", "das"];
  const wrong = shuffle(arts.filter(a => a !== np.answer))[0];
  const art = IS_FRENCH_APP && /^[aeiouhéèê]/i.test(np.noun) ? null : wrong;
  return art ? `${art} ${np.noun}` : null;
}
// Multiple-choice options for a word, harder for words you know:
//   hard distractors · an article trap (target-language options) ·
//   "None of these" (the right answer left out, ~1 in 6).
// cfg: { text(x), n, pool, target: options show the target language,
//        hard, none, formFn?, filter? (which words may be distractors),
//        pick?(n) (own distractor picker: words, or { opt } for a ready
//        option), noTrap? (no article trap) }
function mcChoices(w, cfg) {
  const n = cfg.n;
  const hard = !!cfg.hard;
  const none = !!cfg.none;
  const noneRight = none && Math.random() < 0.17;
  const want = noneRight ? n - 1 : n - 1 - (none ? 1 : 0);
  const ds = cfg.pick ? cfg.pick(Math.max(1, want))
    : pickDistractors(w, cfg.pool, Math.max(1, want), cfg.formFn || gameForm, cfg.filter || null, { hard, ear: !!cfg.ear });
  // pick() may hand back ready options ({ opt }) — e.g. a plural form.
  let opts = ds.map(x => x.opt ? x.opt : ({ text: cfg.text(x), correct: false, word: x }));
  if (hard && cfg.target && !cfg.noTrap && opts.length >= 2 && Math.random() < 0.45) {
    const trap = articleTrap(w);
    if (trap && !opts.some(o => normKey(o.text) === normKey(trap))) opts[opts.length - 1] = { text: trap, correct: false, trap: true };
  }
  if (!noneRight) opts.push({ text: cfg.text(w), correct: true, word: w });
  opts = shuffle(opts);
  if (none) opts.push({ text: "", none: true, correct: noneRight });
  return opts;
}
// Remember a wrong pick so it returns as a trap.
function noteWrongPick(w, opt) { if (opt && opt.word && !opt.correct) recordConfusion(w, opt.word); }

// The lesson after a miss: the right word, what you picked, an example.
function wordLessonHtml(w, picked = null, extra = "") {
  const ex = (w.examples || [])[0];
  const pl = w.pl ? ` <span class="g-teach-pl">· pl. ${escapeHtml(w.pl)}</span>` : "";
  let pick = "";
  if (picked && picked.why) pick = `<div class="g-teach-sub">✗ <s>${escapeHtml(picked.text)}</s> — ${picked.why}</div>`;
  else if (picked && picked.trap) pick = `<div class="g-teach-sub">✗ <s>${escapeHtml(picked.text)}</s> — wrong article: it's ${colorArticleHtml(gameForm(w))}</div>`;
  else if (picked && picked.none) pick = `<div class="g-teach-sub">✗ It was there: ${colorArticleHtml(gameForm(w))}</div>`;
  else if (picked && picked.word && !sameWord(picked.word, w)) pick = `<div class="g-teach-sub">✗ You picked ${colorArticleHtml(gameForm(picked.word))} = ${escapeHtml(gamePrompt(picked.word))}</div>`;
  return `<div class="g-teach-main">${colorArticleHtml(gameForm(w))} = ${escapeHtml(gamePrompt(w))}${pl}</div>${pick}${extra}
    ${ex && ex[WORD_KEY] ? `<div class="g-teach-ex">${escapeHtml(ex[WORD_KEY])}${ex.en ? `<span>${escapeHtml(ex.en)}</span>` : ""}</div>` : ""}`;
}

// Number of distinct words (by display form and prompt) in a list.
function distinctCount(list, formFn = gameForm) {
  const f = new Set(), p = new Set();
  let n = 0;
  list.forEach(w => {
    const a = normKey(formFn(w)), b = normKey(gamePrompt(w));
    if (!a || f.has(a) || p.has(b)) return;
    f.add(a); p.add(b); n++;
  });
  return n;
}

// ── WORD POOL ─────────────────────────────────
// Vocab words count as known once answered (or, for decks picked
// explicitly, once unlocked). Anki cards once introduced. S.words is
// read directly so building a pool never creates word records.
function poolWordsForDeck(deck, explicit) {
  const out = [];
  const anki = isAnkiDeck(deck.id);
  const mk = (w, i) => ({ ...w, deckId: deck.id, deckName: deck.name, idx: i, anki });
  if (anki) {
    deck.words.forEach((w, i) => {
      const ws = S.words[deck.id + "_" + i];
      if (ws && ws.anki && ws.anki.phase && ws.anki.phase !== "new") out.push(mk(w, i));
    });
  } else {
    unlockedWords(deck).forEach((w, i) => {
      if (explicit) { out.push(mk(w, i)); return; }
      const ws = S.words[deck.id + "_" + i];
      if (ws && (ws.st || (ws.correct || 0) + (ws.wrong || 0) > 0)) out.push(mk(w, i));
    });
  }
  return out;
}
function validDeckIds(ids) { return (ids || []).filter(id => !!getDeck(id)); }
// Skipped words (Skip a level) are part of the pool: you know them, and
// games that need a level's words (Conjugation Slots, Le·La…) must work
// after a skip. Being ⭐ Strong, they're rarely the ones picked first.
function buildGamePool(deckIds) {
  const out = [];
  const ids = deckIds ? validDeckIds(deckIds) : null;
  if (ids && ids.length) ids.forEach(id => out.push(...poolWordsForDeck(getDeck(id), true)));
  else ALL_GROUPS.forEach(g => g.decks.forEach(d => out.push(...poolWordsForDeck(d, false))));
  return out;
}

// Words a round should favour (a Today bonus: the ones you just missed).
// Set by launchGame from opts.prefer, cleared with the game.
let gamePreferKeys = null;
// How much a word needs practice — higher = shows up more.
function wordWeakness(w) {
  const ws = S.words[wordKey(w)];
  if (!ws) return 1;
  let s = gamePreferKeys && gamePreferKeys.has(wordKey(w)) ? 10 : 1;
  if (w.anki) {
    const a = ws.anki || {};
    s += (a.lapses || 0) * 1.5 + (a.phase === "learning" || a.phase === "relearning" ? 2 : 0) + ((a.ease || 2.5) < 2.3 ? 1 : 0);
  } else {
    const st = ws.st || 0;
    if (ws.rp || ws.fl) s += 6;
    if (ws.lrn) s += 3;
    if (isDue(ws)) s += 3;
    s += Math.max(0, 5 - st) * 0.8;
    if (isStruggling(ws)) s += 3;
  }
  return s;
}
// A word's stage for game purposes (Anki cards mapped by interval).
function wordStage(w) {
  const ws = S.words[wordKey(w)];
  if (!ws) return 0;
  if (w.anki) {
    const a = ws.anki || {};
    if (a.phase !== "review") return 1;
    return a.interval >= 21 ? 5 : a.interval >= 7 ? 4 : 3;
  }
  return ws.st || 0;
}
function isRookie(w) { return wordStage(w) <= 1; }
function weightedPickDistinct(list, n, weightFn) {
  const items = list.map(w => ({ w, wt: Math.max(0.01, weightFn(w)) }));
  const out = [];
  while (out.length < n && items.length) {
    let total = 0; items.forEach(it => total += it.wt);
    let r = Math.random() * total, i = 0;
    for (; i < items.length - 1; i++) { r -= items[i].wt; if (r <= 0) break; }
    out.push(items[i].w); items.splice(i, 1);
  }
  return out;
}
// n words, ~60% weighted toward weak words, ~40% uniform. Repeats only
// when the list is smaller than n, and never twice in a row. At most
// ~30% 🌱 words when there are enough others, so a fresh batch never
// swamps a round.
function sampleWords(list, n) {
  if (!list.length) return [];
  const rookies = list.filter(isRookie), others = list.filter(w => !isRookie(w));
  if (rookies.length && others.length >= Math.ceil(n * 0.7) && rookies.length > Math.round(list.length * 0.3)) {
    const nr = Math.max(1, Math.round(n * 0.3));
    const pickR = sampleWordsRaw(rookies, Math.min(nr, rookies.length));
    const rest = sampleWordsRaw(others, n - pickR.length);
    const out = shuffle([...pickR, ...rest]);
    for (let i = 1; i < out.length; i++) if (sameWord(out[i], out[i - 1]) && i + 1 < out.length) [out[i], out[i + 1]] = [out[i + 1], out[i]];
    return out;
  }
  return sampleWordsRaw(list, n);
}
function sampleWordsRaw(list, n) {
  if (!list.length) return [];
  const out = [];
  while (out.length < n) {
    const need = Math.min(n - out.length, list.length);
    const weak = weightedPickDistinct(list, Math.round(need * 0.6), wordWeakness);
    const rest = shuffle(list.filter(w => !weak.includes(w))).slice(0, need - weak.length);
    const batch = shuffle([...weak, ...rest]);
    if (out.length && batch.length > 1 && sameWord(batch[0], out[out.length - 1])) [batch[0], batch[1]] = [batch[1], batch[0]];
    out.push(...batch);
  }
  return out;
}
// Drop words whose form or prompt repeats an earlier one.
function dedupeWords(list, formFn = gameForm) {
  const f = new Set(), p = new Set();
  return list.filter(w => {
    const a = normKey(formFn(w)), b = normKey(gamePrompt(w));
    if (!a || f.has(a) || p.has(b)) return false;
    f.add(a); p.add(b); return true;
  });
}

// ── RANKS · WORD FORMATS · TWISTS ─────────────
// Rank = the player's arcade skill in one game (speed, time, lives,
// board size). 3★ at your top rank unlocks the next. You can always
// replay a lower rank.
const GAME_RANKS = [
  { name: "Bronze", icon: "🥉" }, { name: "Silver", icon: "🥈" }, { name: "Gold", icon: "🥇" },
  { name: "Platinum", icon: "💠" }, { name: "Diamond", icon: "💎" },
];
function gameRankOf(id) { return (S.games.rank && S.games.rank[id]) || 0; }
function gameRankStars(id, r) { return ((S.games.rankStars[id] || [])[r]) || 0; }
function gameRankProgress(id) { const r = gameRankOf(id); return { rank: r, stars: gameRankStars(id, r) }; }
function totalGameStars() {
  let n = 0;
  Object.values(S.games.rankStars || {}).forEach(a => (a || []).forEach(x => n += x || 0));
  return n;
}
function rankLabel(r) { const k = GAME_RANKS[r] || GAME_RANKS[0]; return `${k.icon} ${k.name}`; }

// Per-word format: the easier of what the rank and the word's stage
// allow. 🌱 words (stage ≤ 1) always get the gentle version.
function itemFormat(w, ctx) {
  const st = wordStage(w);
  const rookie = st <= 1;
  const rp = (ctx && ctx.rp) || {};
  return {
    st, rookie,
    options: rookie ? 3 : (rp.options || 4),
    typed: !!rp.typed && st >= 3,
    reverse: st >= 2,
    slow: rookie ? 0.75 : 1,
  };
}
function rookieTagHtml(w) { return isRookie(w) ? `<span class="g-rookie" title="New word — gentler format, half the cost of a miss">🌱</span>` : ""; }

const TWISTS = {
  mirror: { icon: "🪞", name: "Mirror", desc: "Directions flipped" },
  sudden: { icon: "💀", name: "Sudden death", desc: "One slip ends the round" },
  golden: { icon: "🌟", name: "Golden words", desc: "Three words are worth ×3" },
  turbo:  { icon: "🚀", name: "Turbo", desc: "A third less time, everything faster" },
};
const TWIST_CHANCE = 0.2;
function rollTwist(def, size) {
  if (size === "bonus" || !def.twists || !def.twists.length) return null;
  if (S.games.twists === false || Math.random() >= TWIST_CHANCE) return null;
  return def.twists[Math.floor(Math.random() * def.twists.length)];
}

// ── LIFECYCLE / CLEANUP ───────────────────────
// Every timer, frame and listener a game creates goes through these
// wrappers, so stopActiveGame() can guarantee nothing survives a quit.
const _gt = { timeouts: new Set(), intervals: new Set(), rafs: new Set(), listeners: [] };
function gTimeout(fn, ms) {
  const id = setTimeout(() => { _gt.timeouts.delete(id); fn(); }, ms);
  _gt.timeouts.add(id); return id;
}
function gClearTimeout(id) { clearTimeout(id); _gt.timeouts.delete(id); }
function gInterval(fn, ms) { const id = setInterval(fn, ms); _gt.intervals.add(id); return id; }
function gClearInterval(id) { clearInterval(id); _gt.intervals.delete(id); }
function gRaf(fn) {
  const id = requestAnimationFrame(t => { _gt.rafs.delete(id); fn(t); });
  _gt.rafs.add(id); return id;
}
function gListen(target, type, fn, opts) { target.addEventListener(type, fn, opts); _gt.listeners.push([target, type, fn, opts]); }
function gameTimersActive() { return _gt.timeouts.size + _gt.intervals.size + _gt.rafs.size; }

let activeGame = null;   // { def, ctx } while a game screen is up
let gameRun    = null;   // Daily / Mix / Surprise sequence in progress
let gameHubDeckIds = null; // start-bar selection (session only), else S.games.pool

function stopActiveGame() {
  _gt.timeouts.forEach(clearTimeout); _gt.timeouts.clear();
  _gt.intervals.forEach(clearInterval); _gt.intervals.clear();
  _gt.rafs.forEach(cancelAnimationFrame); _gt.rafs.clear();
  _gt.listeners.forEach(([t, type, fn, o]) => t.removeEventListener(type, fn, o));
  _gt.listeners = [];
  if (activeGame && activeGame.ctx) { logGameQuit(activeGame); activeGame.ctx.dead = true; }
  activeGame = null;
  gamePreferKeys = null;
}
// A game left before its result (Quit, Menu, another screen) counts as
// quit, including one left on its intro or countdown ("pre").
function logGameQuit(g) {
  const ctx = g.ctx;
  if (ctx.finished || ctx.quitLogged || !g.def) return;
  ctx.quitLogged = true;
  logEvent("game_end", { id: g.def.id, size: ctx.size, quit: true, pre: !ctx.started, sd: ctx.launchDay,
    ms: ctx.started && ctx.clock ? Math.round(ctx.clock.elapsed()) : 0 });
}
// Ends a Daily Challenge / Arcade Mix run; one left before its last round
// is logged as abandoned (a finished one was logged by gameRunRoundDone).
function dropGameRun() {
  const run = gameRun;
  gameRun = null;
  if (!run || run.logged || run.kind === "surprise") return;
  run.logged = true;
  logEvent("session_end", { kind: "games:" + run.kind, abandoned: true, n: run.summaries.length, sd: run.day, ms: Date.now() - run.startedAt });
}
// Full exit (Menu button / backToMenu): also abandons any sequence.
function quitAllGames() { stopActiveGame(); dropGameRun(); flushDeferredCelebrations(); }

// Pausable clock: elapsed ms excluding paused time, plus penalties.
function makeClock() {
  let acc = 0, last = 0, running = false;
  return {
    start() { if (!running) { running = true; last = performance.now(); } },
    pause() { if (running) { acc += performance.now() - last; running = false; } },
    add(ms) { acc += ms; },
    elapsed() { return acc + (running ? performance.now() - last : 0); },
    get running() { return running; },
  };
}

// ── CELEBRATIONS DURING PLAY ──────────────────
// Achievement / level-up / mastery toasts and their confetti would land
// on top of the question mid-round. While a round is in play they are
// held back and replayed once the results (or hub) are on screen.
let _deferredToasts = [], _deferredConfetti = 0;
const _toastNow = showCelebrateToast, _confettiNow = confettiBurst;
function gameInPlay() { return !!(activeGame && activeGame.ctx.started && !activeGame.ctx.finished && !activeGame.ctx.dead); }
// A Today session holds them too: they replay on its summary screen.
function celebrationsHeld() {
  return gameInPlay() || (typeof pathSession !== "undefined" && !!pathSession && !!document.getElementById("path-screen"));
}
showCelebrateToast = function (icon, title, sub) {
  if (celebrationsHeld()) { _deferredToasts.push([icon, title, sub]); return; }
  _toastNow(icon, title, sub);
};
confettiBurst = function (count) {
  if (celebrationsHeld()) { _deferredConfetti = Math.max(_deferredConfetti, count || 36); return; }
  _confettiNow(count);
};
function flushDeferredCelebrations() {
  let toasts = _deferredToasts;
  const conf = _deferredConfetti;
  _deferredToasts = []; _deferredConfetti = 0;
  // Many at once: show the first, then one toast that sums up the rest.
  if (toasts.length > 2) {
    const rest = toasts.slice(1);
    toasts = [toasts[0], ["🎉", `+${rest.length} more`, rest.map(t => String(t[1]).replace(/<[^>]*>/g, "")).slice(0, 3).join(" · ") + (rest.length > 3 ? " …" : "")]];
  }
  // Through the wrappers: if a new round has started by then, they wait again.
  if (conf) setTimeout(() => confettiBurst(conf), 500);
  toasts.forEach((t, i) => setTimeout(() => showCelebrateToast(...t), 900 + i * 2400));
}

// ── EFFECTS ───────────────────────────────────
const REDUCED_MOTION = !!(window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches);
function shakeEl(el) {
  if (!el || REDUCED_MOTION) return;
  el.classList.remove("g-shake"); void el.offsetWidth; el.classList.add("g-shake");
}
// soft: a gentler pop for wide elements that would overshoot the edges
function popEl(el, soft = false) {
  if (!el || REDUCED_MOTION) return;
  const cls = soft ? "g-pop-soft" : "g-pop";
  el.classList.remove(cls); void el.offsetWidth; el.classList.add(cls);
}
// Floating "+10" above an element.
function floatScore(anchor, text, cls = "") {
  if (!anchor || REDUCED_MOTION) return;
  const r = anchor.getBoundingClientRect();
  const el = document.createElement("div");
  el.className = "g-float " + cls;
  el.textContent = text;
  el.style.left = (r.left + r.width / 2) + "px";
  el.style.top = (r.top + window.scrollY) + "px";
  document.body.appendChild(el);
  setTimeout(() => el.remove(), 900);
}
// ── DRAG & DROP ───────────────────────────────
// One engine for every draggable game (Pointer Events: touch + mouse).
// A move under DRAG_SLOP px is a tap — the element's normal click
// handler runs, so every tap interaction keeps working. Beyond that the
// item is picked up, a ghost follows the finger, `resolve(x, y)` names
// the drop target, `hover(target)` can draw a caret/highlight and
// `drop(item, target)` commits. A drop outside any target snaps back.
// All listeners go through gListen, so quitting a game cleans up.
const DRAG_SLOP = 6;
let _dragJustEnded = 0;
function gDrag(root, opts) {
  let st = null;
  const ctx = activeGame && activeGame.ctx;
  const cleanup = (dropped) => {
    if (!st) return;
    const s0 = st; st = null;
    if (s0.ghost) {
      if (!dropped && !REDUCED_MOTION) {
        const r = s0.el.getBoundingClientRect();
        s0.ghost.style.transition = "transform 0.18s ease";
        s0.ghost.style.transform = `translate(${r.left}px, ${r.top}px)`;
        setTimeout(() => s0.ghost.remove(), 190);
      } else s0.ghost.remove();
    }
    s0.el.classList.remove("g-dragging");
    if (opts.hover) opts.hover(null);
    document.body.classList.remove("g-drag-active");
  };
  gListen(root, "pointerdown", e => {
    if (e.button !== undefined && e.button !== 0) return;
    const el = e.target.closest(opts.items);
    if (!el || !root.contains(el) || el.disabled || (opts.canDrag && !opts.canDrag(el))) return;
    st = { el, x0: e.clientX, y0: e.clientY, id: e.pointerId, ghost: null, dragging: false, target: null };
  });
  gListen(window, "pointermove", e => {
    if (!st || e.pointerId !== st.id) return;
    const dx = e.clientX - st.x0, dy = e.clientY - st.y0;
    if (!st.dragging) {
      if (Math.hypot(dx, dy) < DRAG_SLOP) return;
      st.dragging = true;
      const r = st.el.getBoundingClientRect();
      const g = st.el.cloneNode(true);
      g.classList.add("g-ghost");
      g.removeAttribute("id");
      g.style.width = r.width + "px"; g.style.height = r.height + "px";
      st.offX = st.x0 - r.left; st.offY = st.y0 - r.top;
      document.body.appendChild(g);
      st.ghost = g;
      st.el.classList.add("g-dragging");
      document.body.classList.add("g-drag-active");
      if (typeof haptic === "function") haptic("select");
    }
    e.preventDefault();
    st.ghost.style.transform = `translate(${e.clientX - st.offX}px, ${e.clientY - st.offY}px) scale(1.06)`;
    // Auto-scroll near the viewport edges.
    if (e.clientY < 60) window.scrollBy(0, -12); else if (e.clientY > window.innerHeight - 60) window.scrollBy(0, 12);
    st.target = opts.resolve(e.clientX, e.clientY, st.el);
    if (opts.hover) opts.hover(st.target, st.el);
  }, { passive: false });
  const end = e => {
    if (!st || e.pointerId !== st.id) return;
    if (!st.dragging) { st = null; if (ctx) ctx.tapN = (ctx.tapN || 0) + 1; return; } // a tap: click handles it
    const { el, target } = st;
    _dragJustEnded = Date.now();
    const ok = !!target && opts.drop(el, target) !== false;
    if (ctx) ctx.dragN = (ctx.dragN || 0) + 1;
    if (ok && typeof haptic === "function") haptic("drop");
    cleanup(ok);
  };
  gListen(window, "pointerup", end);
  gListen(window, "pointercancel", e => { if (st && e.pointerId === st.id) cleanup(false); });
  // The click that follows a drag must not also count as a tap.
  gListen(root, "click", e => { if (Date.now() - _dragJustEnded < 350) { e.stopPropagation(); e.preventDefault(); } }, true);
}
// Where in a wrapped row of tiles would (x, y) insert? Returns an index
// among `kids` (0…kids.length).
function insertionIndex(kids, x, y) {
  if (!kids.length) return 0;
  let best = -1, bestD = Infinity;
  kids.forEach((k, i) => {
    const r = k.getBoundingClientRect();
    const cx = Math.max(r.left, Math.min(x, r.right)), cy = Math.max(r.top, Math.min(y, r.bottom));
    const d = Math.hypot(x - cx, (y - cy) * 2);
    if (d < bestD) { bestD = d; best = i; }
  });
  const r = kids[best].getBoundingClientRect();
  return x > r.left + r.width / 2 ? best + 1 : best;
}
function pointIn(el, x, y, pad = 0) {
  if (!el) return false;
  const r = el.getBoundingClientRect();
  return x >= r.left - pad && x <= r.right + pad && y >= r.top - pad && y <= r.bottom + pad;
}

function comboMult(combo) { return combo >= 20 ? 4 : combo >= 10 ? 3 : combo >= 5 ? 2 : 1; }

// ── TYPED ANSWERS INSIDE GAMES ────────────────
// Typed formats (Platinum+ on words you know) share one small UI: an
// input with the accent bar, "Don't know" and "Check". onSubmit gets
// the raw text ("" for don't know).
function gTypedHtml(placeholder = "type it…") {
  return `<div class="g-typed-wrap">
    <input type="text" class="german-input" id="g-typed" placeholder="${escapeHtml(placeholder)}"
      autocomplete="off" autocorrect="off" autocapitalize="off" spellcheck="false" enterkeyhint="go"/>
    ${accentBarHtml("g-typed")}
    <div class="g-typed-actions">
      <button class="dontknow-btn" id="g-typed-skip">? Don't know</button>
      <button class="g-big-btn" id="g-typed-go">Check</button>
    </div>
  </div>`;
}
function gTypedBind(ctx, onSubmit) {
  const input = document.getElementById("g-typed");
  if (!input) return null;
  const go = () => {
    if (ctx.waiting) { ctx.continueNow(); return; }
    if (ctx.busy || ctx.finished || ctx.paused) return;
    if (!input.value.trim()) { shakeEl(input); return; }
    onSubmit(input.value);
  };
  document.getElementById("g-typed-go").onclick = go;
  document.getElementById("g-typed-skip").onclick = () => { if (!ctx.busy && !ctx.finished && !ctx.paused) onSubmit(""); };
  ["g-typed-go", "g-typed-skip"].forEach(id => gListen(document.getElementById(id), "pointerdown", e => e.preventDefault()));
  gListen(input, "keydown", e => { if (e.key === "Enter") { e.preventDefault(); e.stopPropagation(); go(); } });
  setTimeout(() => { try { input.focus({ preventScroll: true }); } catch (e) {} }, 60);
  return input;
}
// Grade a typed game answer against one or more accepted strings.
function gradeTyped(val, answers) {
  // What was typed, for the learning log if this turns out to be a miss.
  const g = activeGame && activeGame.ctx;
  if (g) { g.lastGiven = val; g.lastExpected = answers; }
  if (!String(val || "").trim()) return false;
  if (answers.some(a => a && (isCorrect(val, a) || normalize(val) === normalize(a)))) return true;
  if (isNearMiss(val, answers)) { if (g) g.lastGiven = null; return "near"; } // a retry, not a miss: don't let it stick to the next question
  return false;
}

// ── COLLECTIONS (gender · plural) ─────────────
// A noun is collected once its gender (or plural) was right on three
// different days. Collections never go down.
function collectAttr(w, kind) {
  if (!w || w.anki) return false;
  const ws = S.words[wordKey(w)];
  if (!ws || !ws.st) return false;
  const today = todayISO();
  const c = ws[kind] || (ws[kind] = { n: 0, d: "" });
  if (c.done || c.d === today) return false;
  c.n++; c.d = today;
  if (c.n >= 3) {
    c.done = 1;
    S.games.collect[kind] = (S.games.collect[kind] || 0) + 1;
    questEvent("collect", { kind });
    return true;
  }
  return false;
}

// Today's typed answers count for the gender collection too: a noun
// typed with its right article ("der Hund", "la maison") shows its
// gender as well as the game does. Elided French (l'heure) shows none.
function typedGenderOk(val, w) {
  const np = nounParts(w);
  return !!np && !np.elided && isCorrect(String(val || ""), np.full);
}

// ── MULTIPLE-CHOICE HELPERS ───────────────────
// options: [{ text, correct, word }]. Buttons carry data-i for clicks
// and number badges for keys 1–4 on desktop.
function mcOptionsHtml(options, cls = "") {
  return `<div class="g-options ${cls}">${options.map((o, i) => `
    <button class="g-opt${String(o.text).length > 26 ? " long" : ""}${o.none ? " none" : ""}" data-i="${i}">
      <span class="g-key">${i + 1}</span><span class="g-opt-text">${o.none ? "∅ None of these" : escapeHtml(o.text)}</span>
    </button>`).join("")}</div>`;
}
// Mark the chosen/right options after an answer and lock the set.
function mcReveal(container, options, chosen) {
  container.querySelectorAll(".g-opt").forEach(btn => {
    const i = +btn.dataset.i;
    btn.disabled = true;
    if (options[i].correct) btn.classList.add("right");
    else if (i === chosen) btn.classList.add("wrong");
    else btn.classList.add("dim");
  });
}

// ── SCREEN SHELL & CONTEXT ────────────────────
// sizes: "full" (hub, sets bests/stars), "short" (Daily/Mix rounds),
// "bonus" (a short round inside a Today session or Drill — learning
// first: thinking games have no clock there, see BONUS_TIME).
function launchGame(id, opts = {}) {
  const def = getGame(id);
  if (!def) return;
  stopActiveGame();
  const pool = opts.pool || buildGamePool(gameHubDeckIds || S.games.pool);
  const size = opts.size || "full";
  const req = gameRequirement(def, pool, size);
  if (!req.ok) { showCelebrateToast(def.icon, gameName(def), req.reason); return; }

  showGameScreen();
  const island = document.getElementById("floating-island");
  if (island) island.style.display = "none";
  const el = document.getElementById("main-screen");
  el.style.paddingBottom = "";
  const runLabel = gameRun ? `${gameRun.title} · ${gameRun.i + 1}/${gameRun.ids.length}` : "";
  el.innerHTML = `
    <div class="screen game-screen" id="game-screen" data-game="${def.id}">
      <div class="g-hud">
        <button class="g-hud-btn" onclick="quitGame()" aria-label="Quit">✕</button>
        <div class="g-hud-title">
          <span class="g-hud-name">${def.icon} ${escapeHtml(gameName(def))}</span>
          ${runLabel ? `<span class="g-hud-run">${escapeHtml(runLabel)}</span>` : ""}
        </div>
        <button class="g-hud-btn" onclick="showGameHelp()" aria-label="How to play">?</button>
        ${def.timed && !def.noPause ? `<button class="g-hud-btn" id="g-pause-btn" onclick="toggleGamePause()" aria-label="Pause">⏸</button>` : ""}
      </div>
      <div class="g-stats">
        <span class="g-stat g-score" id="g-score">0</span>
        <span class="g-stat g-lives" id="g-lives"></span>
        <span class="g-stat g-combo" id="g-combo"></span>
        <span class="g-stat g-clock" id="g-clock"></span>
        ${opts.size === "bonus" ? `<span class="g-stat g-bonus-goal" id="g-bonus-goal" title="Bonus target">🎯 0/${bonusGoal(def.id)}</span>` : ""}
      </div>
      <div class="g-bar"><div class="g-bar-fill" id="g-bar-fill"></div></div>
      <div class="g-stage" id="g-stage"></div>
      <div class="g-teach" id="g-teach" aria-live="polite"></div>
      <div class="g-live" id="g-live" aria-live="polite"></div>
      <div class="g-overlay" id="g-overlay" style="display:none"></div>
    </div>`;
  window.scrollTo({ top: 0, behavior: "instant" });

  const ctx = makeCtx(def, pool, size, opts);
  activeGame = { def, ctx };
  gamePreferKeys = opts.prefer && opts.prefer.size ? opts.prefer : null;
  const maxRank = gameRankOf(def.id);
  ctx.rank = opts.rank !== undefined ? Math.min(opts.rank, maxRank) : size === "bonus" ? Math.min(maxRank, 1) : maxRank;
  // Deferred: the keypress that opened this screen (e.g. Enter in Drill
  // triggering a Surprise Round) is still bubbling and must not reach us.
  gTimeout(() => gListen(document, "keydown", e => gameKeydown(e, ctx)), 0);
  gListen(document, "visibilitychange", () => { if (document.hidden) pauseGame(true); });

  const introSeen = (() => { try { return localStorage.getItem("gv_game_intro_" + def.id) === "1"; } catch (e) { return true; } })();
  const go = () => {
    try { localStorage.setItem("gv_game_intro_" + def.id, "1"); } catch (e) {}
    if (def.timed) runCountdown(ctx, () => beginGame(ctx));
    else beginGame(ctx);
  };
  ctx.twist = opts.twist !== undefined ? opts.twist : (introSeen ? rollTwist(def, size) : null);
  ctx.twistOffered = ctx.twist;
  updateHudRun(ctx);
  ctx.launchDay = todayISO();
  logEvent("game_start", { id: def.id, size, rank: ctx.rank, twist: ctx.twist || "" });
  if (!introSeen || opts.forceIntro) showGameIntro(ctx, go);
  else if (gameRun || size === "bonus") showRoundSplash(ctx, go);
  else if (maxRank > 0 || ctx.twist) showStartCard(ctx, go);
  else go();
}
function updateHudRun(ctx) {
  const el = document.querySelector(".g-hud-title");
  if (!el) return;
  let line = el.querySelector(".g-hud-run");
  const runLabel = gameRun ? `${gameRun.title} · ${gameRun.i + 1}/${gameRun.ids.length}` : "";
  const parts = [runLabel, ctx.size === "full" && gameRankOf(ctx.def.id) > 0 ? rankLabel(ctx.rank) : "", ctx.twist ? `${TWISTS[ctx.twist].icon} ${TWISTS[ctx.twist].name}` : ""].filter(Boolean);
  if (!parts.length) { if (line) line.remove(); return; }
  if (!line) { line = document.createElement("span"); line.className = "g-hud-run"; el.appendChild(line); }
  line.textContent = parts.join(" · ");
}
// The twist line on start cards: an offered twist can be declined; with
// a rank above Bronze you can also add one yourself.
function twistLineHtml(ctx) {
  const d = ctx.def;
  if (!d.twists || !d.twists.length || ctx.size === "bonus") return "";
  if (ctx.twist) {
    const t = TWISTS[ctx.twist];
    return `<div class="g-twist on">🌀 Twist: <strong>${t.icon} ${t.name}</strong> — ${t.desc} · ×1.5 XP
      <button class="g-twist-btn" id="g-twist-x">No thanks</button></div>`;
  }
  if (ctx.size !== "full") return "";
  return `<div class="g-twist"><button class="g-twist-btn" id="g-twist-add">🌀 Add a twist</button></div>`;
}
function bindTwistLine(ctx, rerender) {
  const x = document.getElementById("g-twist-x");
  if (x) x.onclick = () => { logEvent("twist", { id: ctx.twist, taken: false }); ctx.twist = null; updateHudRun(ctx); rerender(); };
  const a = document.getElementById("g-twist-add");
  if (a) a.onclick = () => {
    const list = ctx.def.twists;
    ctx.twist = list[Math.floor(Math.random() * list.length)];
    ctx.twistOffered = ctx.twist; updateHudRun(ctx); rerender();
  };
}
// Start card for full-size rounds once a rank above Bronze exists (or a
// twist was rolled): pick the rank, keep or decline the twist.
function showStartCard(ctx, onGo) {
  const d = ctx.def, max = gameRankOf(d.id);
  const render = () => {
    const o = overlay(`<div class="g-card">
      <div class="g-card-icon">${d.icon}</div>
      <div class="g-card-title">${escapeHtml(gameName(d))}</div>
      <div class="g-card-skill">${escapeHtml(d.skill)}</div>
      ${max > 0 ? `<div class="g-ranks" role="radiogroup" aria-label="Rank" style="--n:${max + 1}">${GAME_RANKS.slice(0, max + 1).map((r, i) =>
        `<button class="g-rank ${i === ctx.rank ? "on" : ""}" data-r="${i}" role="radio" aria-checked="${i === ctx.rank}">${r.icon}<small>${r.name}</small><span>${starsHtml(gameRankStars(d.id, i))}</span></button>`).join("")}</div>` : ""}
      ${max < 4 ? `<div class="g-rank-next">3★ at ${rankLabel(max)} unlocks ${rankLabel(max + 1)}</div>` : `<div class="g-rank-next">💎 Top rank reached</div>`}
      ${twistLineHtml(ctx)}
      <button class="g-big-btn" id="g-go">Start</button>
      <button class="g-link-btn" onclick="quitGame()">← Back</button>
    </div>`);
    if (!o) return;
    o.querySelectorAll(".g-rank").forEach(b => b.onclick = () => { ctx.rank = +b.dataset.r; updateHudRun(ctx); render(); });
    bindTwistLine(ctx, render);
    armOverlayButton(o.querySelector("#g-go"), () => { overlay(""); startWithTwistLog(ctx, onGo); });
  };
  render();
}
function startWithTwistLog(ctx, onGo) {
  if (ctx.twist) logEvent("twist", { id: ctx.twist, taken: true });
  onGo();
}
function gameName(def) { return typeof def.name === "function" ? def.name() : def.name; }

// The hub asks every game's requirement several times per render (tiles,
// Daily, Mix) over thousands of words — memoised per pool array.
const _reqMemo = new WeakMap();
function gameRequirement(def, pool, size) {
  let m = _reqMemo.get(pool);
  if (!m) { m = new Map(); _reqMemo.set(pool, m); }
  const k = def.id + "|" + size;
  if (!m.has(k)) m.set(k, def.requirement(pool, size));
  return m.get(k);
}

function beginGame(ctx) {
  if (ctx.dead || ctx.started) return;
  ctx.started = true;
  ctx.startedAt = Date.now();
  // A toast or confetti still on screen from before (results, splash)
  // must not cover the first question.
  document.querySelectorAll("#celebrate-toast, .confetti-piece").forEach(el => el.remove());
  ctx.clock.start();
  try { ctx.def.start(ctx); }
  catch (e) { console.error("game start failed:", ctx.def.id, e); showCelebrateToast("⚠️", "Something went wrong", "Returning to the hub"); quitGame(); return; }
  // The countdown may have finished while the app was in the background.
  if (document.hidden) pauseGame(true);
}

// What a miss in a game means when nothing was typed (learning log).
const GAME_MISS_TYPE = { gender: "gender", plural: "plural", cases: "case", listen: "listening", cloze: "context" };
// The object handed to every game.
//   ctx.pool / size / stage / clock / rounds(full, short, bonus)
//   ctx.setScore(n) setLives(n, max) setCombo(n) setBar(frac, cls)
//   ctx.setClock(text, urgent) say(text) missed(word) finish(result)
//   ctx.onKey(e) / onPause() / onResume()  — optional game hooks
//   ctx.busy — set while feedback shows, so double taps are ignored
function makeCtx(def, pool, size, opts) {
  const $ = id => document.getElementById(id);
  const ctx = {
    def, pool, size, opts,
    stage: $("g-stage"),
    clock: makeClock(),
    busy: false, dead: false, paused: false, started: false, finished: false,
    missedWords: [], hits: new Map(), rank: 0, twist: null, golden: 0, goldenKeys: null,
    // Speak, don't spell: a typed rank stays multiple choice, one more option.
    get rp() {
      const r = def.ranks || [], p = r[Math.min(ctx.rank, r.length - 1)] || {};
      return p.typed && speakOn() ? { ...p, typed: false, options: Math.min(6, (p.options || 4) + 1) } : p;
    },
    get timeScale() { return ctx.twist === "turbo" ? 0.67 : 1; },
    get speedScale() { return ctx.twist === "turbo" ? 1.5 : 1; },
    get sudden() { return ctx.twist === "sudden"; },
    get mirror() { return ctx.twist === "mirror"; },
    fmt(w) { return itemFormat(w, ctx); },
    // Record a correct answer on a specific word (credit at the end).
    hit(w, kind = "recognition") {
      if (!w) return;
      const k = wordKey(w), prev = ctx.hits.get(k);
      if (!prev || (prev.kind !== "recall" && kind === "recall")) ctx.hits.set(k, { w, kind });
      if (typeof learnNoteHit === "function") learnNoteHit(w, "game:" + def.id);
      if (kind === "recall" && ctx.lastGiven && typeof learnNoteSoft === "function") learnNoteSoft(w, ctx.lastGiven);
      ctx.lastGiven = null;
    },
    // Cost multiplier of a miss: 🌱 words cost half — never nothing.
    cost(w) { return w && isRookie(w) ? 0.5 : 1; },
    comboAfterMiss(combo, w) { return w && isRookie(w) ? Math.floor(combo / 2) : 0; },
    // Golden words (twist): decided the first time a word is shown —
    // about one in five until three are golden.
    isGolden(w) {
      if (!w || ctx.twist !== "golden") return false;
      if (!ctx.goldenKeys) { ctx.goldenKeys = new Set(); ctx.goldenSeen = new Set(); }
      const k = wordKey(w);
      if (ctx.goldenKeys.has(k)) return true;
      if (ctx.goldenSeen.has(k)) return false;
      ctx.goldenSeen.add(k);
      if (ctx.goldenKeys.size < 3 && Math.random() < 0.22) { ctx.goldenKeys.add(k); return true; }
      return false;
    },
    // Points for a hit: 🌱 words ×1.5 (they take longer), golden ×3.
    // count: false for extra points on an answer already counted (Gap
    // Fill's second step), so the 🎯 target shows real answers.
    award(w, pts, count = true) {
      if (size === "bonus" && count) {
        ctx.bonusHits = (ctx.bonusHits || 0) + 1;
        const b = document.getElementById("g-bonus-goal");
        if (b) { b.textContent = `🎯 ${Math.min(ctx.bonusHits, bonusGoal(def.id))}/${bonusGoal(def.id)}`; b.classList.toggle("done", ctx.bonusHits >= bonusGoal(def.id)); }
      }
      let p = pts;
      if (w && isRookie(w)) p = Math.round(p * 1.5);
      if (ctx.isGolden(w)) { p *= 3; ctx.golden++; }
      return p;
    },
    tag(w) { return (ctx.isGolden(w) ? `<span class="g-golden-tag">🌟×3</span>` : "") + rookieTagHtml(w); },
    rounds(full, short, bonus) { return size === "full" ? full : size === "short" ? short : (bonus ?? short); },
    setScore(n) { const e = $("g-score"); if (e) { e.textContent = n.toLocaleString(); popEl(e); } },
    setLives(n, max) {
      const e = $("g-lives"); if (!e) return;
      n = Math.max(0, n);
      const full = Math.floor(n + 1e-9), half = n - full >= 0.5 ? 1 : 0;
      e.textContent = "❤️".repeat(full) + (half ? "💔" : "") + "🖤".repeat(Math.max(0, max - full - half));
    },
    setCombo(n) {
      const e = $("g-combo"); if (!e) return;
      const m = comboMult(n);
      e.textContent = n >= 2 ? `🔥${n}${m > 1 ? ` ×${m}` : ""}` : "";
      e.classList.toggle("hot", m > 1);
    },
    setBar(frac, cls = "") {
      const e = $("g-bar-fill"); if (!e) return;
      e.style.width = Math.max(0, Math.min(1, frac)) * 100 + "%";
      e.className = "g-bar-fill " + cls;
    },
    setClock(text, urgent = false) { const e = $("g-clock"); if (e) { e.textContent = text; e.classList.toggle("urgent", urgent); } },
    // Question counter — worded so it can't be read as a score ("5/5").
    setRound(r, total) { ctx.setClock(`Q${r} of ${total}`); },
    say(text) { const e = $("g-live"); if (e) e.textContent = text; },
    // ── Teaching panel (under the stage): the why behind an answer.
    teach(html, cls = "") {
      const e = $("g-teach"); if (!e) return;
      e.innerHTML = html ? `<div class="g-teach-card ${cls}">${html}</div>` : "";
      e.classList.toggle("on", !!html);
    },
    // After a miss: wait for Continue (Enter / tap), held for a moment so
    // a confident Enter can't skip the lesson. Never moves on by itself —
    // in every game and every round size — and the clock stands still
    // while you read.
    waitContinue(fn, label = "Continue") {
      const e = $("g-teach"); if (!e) { fn(); return; }
      if (ctx.waiting) return; // already waiting: one lesson, one button
      ctx.waiting = fn;
      ctx.clockHeld = true;
      ctx.clock.pause();
      // Timed games say so: the HUD clock greys out with ⏸.
      const scr = $("game-screen");
      if (scr && def.timed) scr.classList.add("g-held");
      const card = e.querySelector(".g-teach-card") || (ctx.teach(" "), e.querySelector(".g-teach-card"));
      card.insertAdjacentHTML("beforeend", `${def.timed ? `<div class="g-held-note">⏸ Clock paused while you read</div>` : ""}<button class="g-big-btn g-continue" id="g-continue">${escapeHtml(label)} ⏎</button>`);
      const b = $("g-continue");
      b.onclick = () => ctx.continueNow();
      gListen(b, "pointerdown", ev => ev.preventDefault()); // keep the phone keyboard up
      holdAfterMistake("g-continue");
      try { b.scrollIntoView({ block: "nearest", behavior: REDUCED_MOTION ? "auto" : "smooth" }); } catch (err) {}
    },
    continueNow() {
      if (!ctx.waiting || ctx.finished || ctx.paused) return;
      if (mistakeHeld("g-teach")) return;
      const f = ctx.waiting;
      ctx.waiting = null;
      ctx.clockHeld = false;
      const scr = $("game-screen");
      if (scr) scr.classList.remove("g-held");
      if (!ctx.paused && !ctx.finished) ctx.clock.start();
      ctx.teach("");
      f();
    },
    // info (optional, for the learning log): { given, type, expected }.
    // A typed answer is picked up from gradeTyped by itself.
    missed(word, info = {}) {
      if (word && !ctx.missedWords.some(w => sameWord(w, word))) ctx.missedWords.push(word);
      if (word && typeof learnNoteMiss === "function") {
        const given = info.given != null ? info.given : ctx.lastGiven;
        const typed = given != null;
        const type = info.type || (typed && String(given).trim() ? null : typed ? "blank" : GAME_MISS_TYPE[def.id] || "recognition");
        learnNoteMiss(word, { src: "game:" + def.id, given, type, expected: info.expected || (typed && info.given == null ? ctx.lastExpected : undefined) });
      }
      ctx.lastGiven = null;
    },
    finish(result) {
      if (ctx.finished || ctx.dead) return;
      ctx.finished = true;
      ctx.clock.pause();
      finishGame(ctx, result);
    },
  };
  return ctx;
}

// ── INTRO / COUNTDOWN / PAUSE ─────────────────
// Splash buttons ignore activation for a moment after they appear, and
// take focus only then: a keystroke that opened the screen (Enter in
// Drill) must not also press its Start button.
const OVERLAY_GUARD_MS = 400;
function armOverlayButton(btn, fn) {
  const shownAt = performance.now();
  btn.onclick = () => { if (performance.now() - shownAt < OVERLAY_GUARD_MS) return; fn(); };
  setTimeout(() => { if (btn.isConnected) btn.focus({ preventScroll: true }); }, OVERLAY_GUARD_MS);
}
function overlay(html) {
  const o = document.getElementById("g-overlay");
  if (!o) return null;
  o.innerHTML = html;
  o.style.display = html ? "flex" : "none";
  return o;
}
function showGameIntro(ctx, onGo) {
  const d = ctx.def;
  const o = overlay(`<div class="g-card">
      <div class="g-card-icon">${d.icon}</div>
      <div class="g-card-title">${escapeHtml(gameName(d))}</div>
      <div class="g-card-skill">${escapeHtml(d.skill)}</div>
      ${gameRankLineHtml(d.id)}
      <ul class="g-howto">${(typeof d.howTo === "function" ? d.howTo() : d.howTo).map(l => `<li>${l}</li>`).join("")}</ul>
      <button class="g-big-btn" id="g-go">${ctx.started ? "Resume" : "Let's go"}</button>
      <button class="g-link-btn" onclick="quitGame()">${ctx.started ? "Quit game" : ctx.size === "bonus" ? "Skip bonus" : "← Back"}</button>
    </div>`);
  if (!o) return;
  armOverlayButton(o.querySelector("#g-go"), () => { overlay(""); onGo(); });
}
// Rank, stars and best score — on the game's intro, not its hub tile.
function gameRankLineHtml(id) {
  try {
    const r = gameRankOf(id), st = gameRankStars(id, r), best = (S.games.rankBest[id] || [])[r];
    if (!(S.games.plays[id] || 0) && best === undefined) return `<div class="g-card-rank">✨ New — first round</div>`;
    const next = r < GAME_RANKS.length - 1 ? (st === 3 ? "" : `3★ → ${GAME_RANKS[r + 1].icon}`) : "💎 max rank";
    return `<div class="g-card-rank">${GAME_RANKS[r].icon} ${GAME_RANKS[r].name} · ${starsHtml(st)}${[next, best !== undefined ? `best ${best.toLocaleString()}` : ""].filter(Boolean).map(x => " · " + x).join("")}</div>`;
  } catch (e) { return ""; }
}
function showRoundSplash(ctx, onGo) {
  const d = ctx.def;
  const sub = ctx.size === "bonus" ? `🎁 Bonus round — ${escapeHtml(bonusGoalText(d.id))}${bonusUntimed(d.id) ? " · no clock, take your time" : ""}` : escapeHtml(d.skill);
  const render = () => {
    const o = overlay(`<div class="g-card">
        <div class="g-card-icon">${d.icon}</div>
        <div class="g-card-title">${escapeHtml(gameName(d))}</div>
        <div class="g-card-skill">${sub}</div>
        ${twistLineHtml(ctx)}
        <button class="g-big-btn" id="g-go">Start</button>
        <button class="g-link-btn" id="g-skip">${ctx.size === "bonus" ? "Skip bonus" : gameRun && gameRun.kind === "daily" ? "← Leave — finished rounds are kept" : "← Leave"}</button>
      </div>`);
    if (!o) return;
    bindTwistLine(ctx, render);
    armOverlayButton(o.querySelector("#g-go"), () => { overlay(""); startWithTwistLog(ctx, onGo); });
    const skip = o.querySelector("#g-skip");
    if (skip) armOverlayButton(skip, quitGame);
  };
  render();
}
function runCountdown(ctx, onDone) {
  let n = 3;
  ctx.counting = true;
  const step = () => {
    if (ctx.dead || !ctx.counting) return;
    if (n === 0) { ctx.counting = false; overlay(""); playCountdown(true); onDone(); return; }
    overlay(`<div class="g-countdown" aria-live="assertive">${n}</div>`);
    playCountdown(false);
    n--;
    ctx.countdownTimer = gTimeout(step, 650);
  };
  step();
}
function cancelCountdown(ctx) {
  if (!ctx.counting) return;
  ctx.counting = false;
  gClearTimeout(ctx.countdownTimer);
}
function showGameHelp() {
  if (!activeGame) return;
  const ctx = activeGame.ctx;
  if (ctx.finished) return;
  cancelCountdown(ctx); // "?" mid-countdown: the intro's button restarts it
  const wasRunning = ctx.started && !ctx.paused;
  if (wasRunning && ctx.def.timed) pauseGame(false);
  showGameIntro(ctx, () => {
    if (!ctx.started) { if (ctx.def.timed) runCountdown(ctx, () => beginGame(ctx)); else beginGame(ctx); }
    else if (ctx.paused) resumeGame();
  });
}
// auto: true = app went to the background; a string = custom reason.
function pauseGame(auto) {
  if (!activeGame) return;
  const ctx = activeGame.ctx;
  if (!ctx.def.timed || ctx.def.noPause || !ctx.started || ctx.paused || ctx.finished) return;
  ctx.paused = true;
  ctx.clock.pause();
  if (ctx.onPause) ctx.onPause();
  const o = overlay(`<div class="g-card">
      <div class="g-card-icon">⏸</div>
      <div class="g-card-title">Paused</div>
      <div class="g-card-skill">${typeof auto === "string" ? escapeHtml(auto) : auto ? "The game paused while the app was in the background." : "Take a breath."}</div>
      <button class="g-big-btn" id="g-resume">Tap to continue</button>
      <button class="g-link-btn" onclick="quitGame()">Quit game</button>
    </div>`);
  if (o) armOverlayButton(o.querySelector("#g-resume"), resumeGame);
}
function resumeGame() {
  if (!activeGame) return;
  const ctx = activeGame.ctx;
  if (!ctx.paused) { overlay(""); return; }
  overlay("");
  ctx.paused = false;
  if (!ctx.clockHeld) ctx.clock.start();
  if (ctx.onResume) ctx.onResume();
}
function toggleGamePause() {
  if (!activeGame) return;
  if (activeGame.ctx.paused) resumeGame(); else pauseGame(false);
}
function gameKeydown(e, ctx) {
  if (ctx.dead) return;
  const ov = document.getElementById("g-overlay");
  const overlayUp = ov && ov.style.display !== "none";
  if (e.key === "Escape") { e.preventDefault(); if (ctx.paused) resumeGame(); else pauseGame(false); return; }
  if (overlayUp) {
    if (e.key === "Enter") { const b = ov.querySelector(".g-big-btn"); if (b && document.activeElement !== b) { e.preventDefault(); b.click(); } }
    return;
  }
  if (!ctx.started || ctx.paused || ctx.finished) return;
  if (e.metaKey || e.ctrlKey || e.altKey) return;
  if (ctx.waiting) {
    if (e.key === "Enter" || e.key === " ") { e.preventDefault(); if (e.target && e.target.id !== "g-continue") ctx.continueNow(); }
    return;
  }
  if (ctx.onKey) ctx.onKey(e);
}
// Keys 1–N pick option N (multiple-choice games).
function digitKey(e, n) {
  if (e.target && e.target.tagName === "INPUT") return -1;
  const d = parseInt(e.key, 10);
  return d >= 1 && d <= n ? d - 1 : -1;
}

// Quit button: back to the hub — or, for a Drill bonus round, back to
// the drill. Nothing is recorded for an abandoned round.
function quitGame() {
  const run = gameRun;
  stopActiveGame();
  flushDeferredCelebrations();
  if (run && run.kind === "surprise") { gameRun = null; run.onDone && run.onDone(); return; }
  dropGameRun();
  openGamesHub();
}

// ── FINISH & REWARDS ──────────────────────────
function starsFor(def, result, ctx) {
  const rank = ctx ? ctx.rank : 0;
  if (def.starsFor) return def.starsFor(result, ctx);
  const rp = (def.ranks && def.ranks[rank]) || {};
  const t = rp.stars || def.stars || [Infinity, Infinity, Infinity];
  return result.score >= t[2] ? 3 : result.score >= t[1] ? 2 : result.score >= t[0] ? 1 : 0;
}
// Default XP: ~2 per correct answer + 10 per star, capped per round.
function defaultGameXp(result, size, stars) {
  if (size === "bonus") return result.cleared ? 15 : Math.min(5, result.correct || 0);
  if (size === "short") return Math.min(30, (result.correct || 0) * 2);
  return Math.min(60, (result.correct || 0) * 2 + stars * 10);
}

// Tiered credit, applied once when a round is finished: misses flag
// (never demote), hits lift due words — recognition up to 🌿 Familiar,
// recall (typed formats) through every stage. Grammar games (credit:
// null — a wrong article, case or plural) still flag their misses: every
// mistake comes back as a typed check in Today; only their hits move nothing.
function applyGameCredit(ctx) {
  const out = { up: 0, flagged: 0, moved: [] };
  const def = ctx.def;
  if (def.liveCredit) return out;
  const missKeys = new Set(ctx.missedWords.map(wordKey));
  ctx.missedWords.forEach(w => {
    if (w.anki) return;
    const ws = S.words[wordKey(w)];
    if (!ws || !ws.st) return;
    const r = srsReview(ws, false, "recognition");
    r._w = w;
    if (r.events.includes("flagged")) out.flagged++;
    questEvent("srs", r);
  });
  if (def.credit === null) { if (out.flagged && typeof invalidatePathScan === "function") invalidatePathScan(); return out; }
  ctx.hits.forEach(({ w, kind }, k) => {
    if (w.anki || missKeys.has(k)) return;
    const ws = S.words[k];
    if (!ws || !ws.st) return;
    if (kind === "recall") { ws.correct = (ws.correct || 0) + 1; S.totalCorrect++; }
    ws.lastAnsweredAt = Date.now();
    const r = srsReview(ws, true, kind === "recall" ? "recall" : "recognition");
    r._w = w;
    celebrateReview(r, false);
    if (r.promoted) { out.up++; out.moved.push({ w, from: r.from, to: r.to }); }
  });
  if (typeof invalidatePathScan === "function") invalidatePathScan();
  return out;
}

// Bonus rounds (inside Today sessions and Drill): one clear target per
// game — the same number on the offer card, in the HUD and at the end.
const BONUS_GOALS = { boss: 10, listen: 4, cloze: 4, cases: 4, builder: 3, scramble: 4, plural: 4, conj: 4, gender: 5, blitz: 6, truefalse: 8, typerush: 5, rain: 6, match: 10 };
function bonusGoal(id) { return BONUS_GOALS[id] || 4; }
// Timed games' bonus clock. Thinking games (Conjugation Slots, Gap Fill…)
// have none inside a Today session — the clock is for the Games hub.
const BONUS_TIME = { match: 60000 };
function bonusTime(id) { return BONUS_TIME[id] || 20000; }
function bonusGoalText(id) {
  const g = getGame(id), n = bonusGoal(id);
  return g && g.timed ? `get ${n} right in ${Math.round(bonusTime(id) / 1000)} s` : `get ${n} right`;
}
// "no clock" for untimed games — said on the offer and the splash.
function bonusUntimed(id) { const g = getGame(id); return !!g && !g.timed; }
function finishGame(ctx, result) {
  const def = ctx.def, size = ctx.size, rank = ctx.rank, twist = ctx.twist;
  stopActiveGame();
  result = Object.assign({ score: 0, correct: 0, wrong: 0, maxCombo: 0 }, result);
  if (size === "bonus") result.cleared = (result.correct || 0) >= bonusGoal(def.id);
  result.missed = ctx.missedWords.slice();
  result.golden = ctx.golden || 0;
  const G = S.games;
  const stars = size === "full" ? starsFor(def, result, ctx) : 0;
  let xp = Math.max(0, def.xpFor ? def.xpFor(result, size, stars) : defaultGameXp(result, size, stars));
  if (twist) xp = Math.round(xp * 1.5);

  G.plays[def.id] = (G.plays[def.id] || 0) + 1;
  G.totalPlays = (G.totalPlays || 0) + 1;
  G.lastPlayed[def.id] = todayISO();
  let newBest = false, rankedUp = false;
  if (size === "full") {
    if (twist) {
      const prev = G.twistBest[def.id];
      if (prev === undefined || result.score > prev) { newBest = prev !== undefined && result.score > 0; G.twistBest[def.id] = result.score; }
    } else {
      const rs = G.rankStars[def.id] = G.rankStars[def.id] || [0, 0, 0, 0, 0];
      const rb = G.rankBest[def.id] = G.rankBest[def.id] || [];
      if (stars > (rs[rank] || 0)) rs[rank] = stars;
      if (rb[rank] === undefined || result.score > rb[rank]) { newBest = rb[rank] !== undefined && result.score > 0; rb[rank] = result.score; }
      if (stars > (G.stars[def.id] || 0)) G.stars[def.id] = stars;
      if (G.best[def.id] === undefined || result.score > G.best[def.id]) G.best[def.id] = result.score;
      if (stars === 3 && rank === gameRankOf(def.id) && rank < GAME_RANKS.length - 1) {
        G.rank[def.id] = rank + 1; rankedUp = true;
      }
    }
  }
  if (def.onRecord) def.onRecord(result, size);
  const credit = applyGameCredit(ctx);
  creditGameAnswers(result.goalCorrect ?? result.correct);
  if (xp > 0) addExp(xp); // saves
  if (ctx.dragN) logEvent("drag", { how: "drag", game: def.id, n: ctx.dragN });
  if (ctx.tapN) logEvent("drag", { how: "tap", game: def.id, n: ctx.tapN });
  logEvent("game_end", { id: def.id, size, rank, twist: twist || "", stars, score: result.score, ok: result.correct, bad: result.wrong,
    ms: Math.round(ctx.clock.elapsed()), up: credit.up, fl: credit.flagged, rankedUp, sd: ctx.launchDay });
  questEvent("game_end", { id: def.id, size, stars, result, rank, twist, rankedUp, newBest, startedAt: ctx.startedAt || 0 });
  saveState();
  checkAchievements({ type: "game_end", game: def.id, size, stars, rank, rankedUp, ...result });

  const summary = { def, size, result, stars, xp, newBest, rank, twist, rankedUp, credit };
  if (rankedUp) {
    confettiBurst(60);
    showCelebrateToast(GAME_RANKS[rank + 1].icon, `${GAME_RANKS[rank + 1].name} unlocked!`, `${gameName(def)} · harder handling, same words`);
  } else if (newBest) {
    confettiBurst(40);
    showCelebrateToast("🏅", "New best!", `${gameName(def)} · ${result.score.toLocaleString()}`);
  }
  if (gameRun) { gameRunRoundDone(summary); return; }
  renderGameResults(summary, ctx);
}

function starsHtml(n, max = 3, cls = "") {
  let s = "";
  for (let i = 0; i < max; i++) s += `<span class="g-star ${i < n ? "on" : ""} ${cls}" style="animation-delay:${0.25 + i * 0.18}s">★</span>`;
  return s;
}
function missedListHtml(words, title = "") {
  if (!words.length) return "";
  return `<div class="g-missed">
    <div class="examples-title">${title || `Words to review (${words.length})`}</div>
    ${words.map(w => `<div class="g-missed-row">
      <span class="g-missed-en">${escapeHtml(gamePrompt(w))}</span>
      <span class="g-missed-target">${escapeHtml(gameForm(w))}</span>
      <button class="audio-btn g-missed-say" ${speakBtnAttrs(gameForm(w))} aria-label="Listen">🔊</button>
    </div>`).join("")}
  </div>`;
}
function renderGameResults(sum, ctx) {
  const { def, size, result, stars, xp, newBest, rank, twist, rankedUp, credit } = sum;
  const emoji = def.id === "boss" ? (result.won ? "🏆" : "💀") : stars === 3 ? "🏆" : stars === 2 ? "🎉" : stars === 1 ? "👍" : "💪";
  const title = def.id === "boss" ? (result.won ? "Boss defeated!" : "The boss got away…")
    : stars === 3 ? "Outstanding!" : stars === 2 ? "Great round!" : stars === 1 ? "Nice work!" : "Keep practising!";
  if (stars >= 2 || (def.id === "boss" && result.won)) confettiBurst(stars === 3 ? 50 : 30);
  if (def.id === "boss" && !result.won) playGameOver(); else playAchievement();
  const best = twist ? S.games.twistBest[def.id] : ((S.games.rankBest[def.id] || [])[rank]);
  const maxR = gameRankOf(def.id);
  const drillable = result.missed.filter(w => !w.anki);
  document.getElementById("main-screen").innerHTML = `
    <div class="screen game-screen">
      <div class="screen-top">
        <div class="screen-label">${def.icon} ${escapeHtml(gameName(def))}</div>
        <button class="back-btn" onclick="openGamesHub()">← Games</button>
      </div>
      <div class="result-screen g-results">
        <div class="result-emoji">${emoji}</div>
        <div class="result-title">${title}</div>
        ${size === "full" ? `<div class="g-stars-row">${starsHtml(stars, 3, "big")}</div>` : ""}
        ${size === "full" ? `<div class="g-rank-line">${twist ? `${TWISTS[twist].icon} ${TWISTS[twist].name} round · twists don't change your rank` : rankedUp ? `<span class="g-rankup">${GAME_RANKS[rank + 1].icon} ${GAME_RANKS[rank + 1].name} unlocked!</span>` : maxR < GAME_RANKS.length - 1 && rank === maxR ? `${rankLabel(rank)} · 3★ unlocks ${rankLabel(rank + 1)}` : rankLabel(rank)}</div>` : ""}
        ${newBest ? `<div class="g-newbest">🏅 New personal best!</div>` : ""}
        ${credit && (credit.up || credit.flagged) ? `<div class="g-credit">${credit.up ? `📈 ${credit.up} word${credit.up > 1 ? "s" : ""} moved up` : ""}${credit.up && credit.flagged ? " · " : ""}${credit.flagged ? `⚠️ ${credit.flagged} flagged for ${sayOr("a typed check", "a check out loud")}` : ""}</div>` : ""}
        <div>
          <div class="result-stat"><strong>${result.score.toLocaleString()}</strong>score</div>
          <div class="result-stat"><strong>${result.correct}</strong>correct</div>
          <div class="result-stat"><strong>${result.wrong || 0}</strong>mistake${result.wrong === 1 ? "" : "s"}</div>
          ${result.maxCombo >= 3 ? `<div class="result-stat"><strong>🔥${result.maxCombo}</strong>best combo</div>` : ""}
          <div class="result-stat"><strong>+${xp} XP</strong>earned${twist ? " (×1.5)" : ""}</div>
          ${result.golden ? `<div class="result-stat"><strong>🌟${result.golden}</strong>golden</div>` : ""}
        </div>
        ${result.note ? `<div class="g-best-line">${escapeHtml(result.note)}</div>` : ""}
        ${size === "full" && best !== undefined ? `<div class="g-best-line">Personal best${twist ? " (twist)" : ` at ${GAME_RANKS[rank].name}`}: ${best.toLocaleString()}</div>` : ""}
        ${missedListHtml(result.missed)}
        <div class="g-result-actions">
          ${typeof dayCompleteCtaHtml === "function" ? dayCompleteCtaHtml() : ""}
          <button class="g-big-btn" id="g-again">↻ Play again</button>
          <button class="g-sec-btn" onclick="openGamesHub()">🎮 Games</button>
        </div>
        ${drillable.length ? `<button class="g-link-btn" id="g-drill-missed">📖 Drill these ${drillable.length} word${drillable.length > 1 ? "s" : ""} →</button>` : ""}
      </div>
    </div>`;
  window.scrollTo({ top: 0, behavior: "instant" });
  // Guarded: a keypress that ended the round (Enter in Boss Battle)
  // must not immediately restart it.
  armOverlayButton(document.getElementById("g-again"), () => launchGame(def.id, { pool: ctx.pool, size: "full", rank: rankedUp ? rank + 1 : rank }));
  const dm = document.getElementById("g-drill-missed");
  if (dm) dm.onclick = () => drillWords(drillable);
  flushDeferredCelebrations();
}

// Focus drill on exactly these vocab words (results → "Drill these").
function drillWords(words) {
  const uniq = [];
  words.forEach(w => { if (!w.anki && !uniq.some(u => sameWord(u, w))) uniq.push(w); });
  if (!uniq.length) return;
  quitAllGames();
  activeWords = uniq.map(w => {
    const src = getDeck(w.deckId).words[w.idx];
    return { ...src, deckId: w.deckId, deckName: w.deckName, idx: w.idx };
  });
  activeMode = "drill"; drillSubMode = "focus";
  sessionCorrect = 0; sessionConsecutive = 0;
  _surpriseShownAt = 0;
  startDrill();
}

// ── SEQUENCES (Daily Challenge, Arcade Mix, Surprise Round) ──
function startGameRun(kind, ids, opts = {}) {
  if (!ids.length) return;
  dropGameRun();
  gameRun = { kind, ids, i: 0, summaries: [], pool: opts.pool, size: opts.size || "short",
    title: opts.title || "", onDone: opts.onDone || null, twists: opts.twists || null,
    day: todayISO(), startedAt: Date.now() };
  logEvent("session_start", { kind: "games:" + kind, n: ids.length });
  launchGame(ids[0], runLaunchOpts(0));
}
function runLaunchOpts(i) {
  const o = { pool: gameRun.pool, size: gameRun.size };
  if (gameRun.twists) o.twist = gameRun.twists[i] || null;
  return o;
}
// Audio games only when words can be read aloud (switch on, not muted
// today); spelling games not at all with "Speak, don't spell" on.
function gameUsableNow(g) { return (!g.audio || audioOk()) && !gameHiddenNow(g); }
const SPELLING_GAMES = new Set(["typerush", "scramble"]);
function gameHiddenNow(g) { return !!g && SPELLING_GAMES.has(g.id) && speakOn(); }
function gameRunRoundDone(sum) {
  const run = gameRun;
  run.summaries.push(sum);
  // A daily round counts once you get at least one answer right.
  const dailyMissed = run.kind === "daily" && !(sum.result.correct > 0);
  if (run.kind === "daily" && !dailyMissed) dailyMarkDone(sum.def.id);
  if (run.kind === "surprise") { renderSurpriseResult(sum, run); return; }
  const last = run.i >= run.ids.length - 1;
  const el = document.getElementById("main-screen");
  const dailyBonus = run.kind === "daily" && last ? dailyCompleteIfDone() : 0;
  if (last && !run.logged) { run.logged = true; logEvent("session_end", { kind: "games:" + run.kind, abandoned: false, n: run.summaries.length, sd: run.day, ms: Date.now() - run.startedAt }); }
  if (last && run.kind === "mix") questEvent("mix", {});
  const totalXp = run.summaries.reduce((s, x) => s + x.xp, 0) + dailyBonus;
  const rows = run.summaries.map((x, i) => `<div class="g-run-row">
      <span>${i + 1}. ${x.def.icon} ${escapeHtml(gameName(x.def))}</span>
      <span>${x.result.correct} ✓ · ${x.result.wrong || 0} ✗ · +${x.xp} XP</span>
    </div>`).join("");
  const next = last ? null : getGame(run.ids[run.i + 1]);
  el.innerHTML = `<div class="screen game-screen">
      <div class="screen-top">
        <div class="screen-label">${escapeHtml(run.title)}</div>
        <button class="back-btn" onclick="dropGameRun();openGamesHub()">← Games</button>
      </div>
      <div class="result-screen g-results">
        <div class="result-emoji">${last ? (run.kind === "daily" ? "📆" : "🕹️") : sum.def.icon}</div>
        <div class="result-title">${last ? (run.kind === "daily" ? (dailyBonus || S.games.daily.completedDates.includes(todayISO()) ? "Daily Challenge complete!" : "Daily rounds finished") : "Arcade Mix complete!") : `Round ${run.i + 1} of ${run.ids.length} done`}</div>
        <div class="result-sub">${last ? `+${totalXp} XP in total${dailyBonus ? ` (incl. +${dailyBonus} challenge bonus)` : ""}` : `${sum.result.correct} correct · ${sum.result.wrong || 0} mistake${sum.result.wrong === 1 ? "" : "s"} · +${sum.xp} XP`}</div>
        ${dailyMissed ? `<div class="g-notice">This round didn't count — get at least one answer right. You can replay it from the hub.</div>` : ""}
        <div class="g-run-list">${rows}</div>
        ${last ? missedListHtml(uniqWords(run.summaries.flatMap(x => x.result.missed))) : ""}
        <div class="g-result-actions">
          ${next ? `<button class="g-big-btn" id="g-next">Next: ${next.icon} ${escapeHtml(gameName(next))} →</button>`
                 : `<button class="g-big-btn" id="g-next">🎮 Back to games</button>`}
        </div>
      </div>
    </div>`;
  if (last && run.kind === "daily" && dailyBonus) { confettiBurst(60); playLevelUp(); }
  window.scrollTo({ top: 0, behavior: "instant" });
  armOverlayButton(document.getElementById("g-next"), () => {
    if (next) { run.i++; launchGame(run.ids[run.i], runLaunchOpts(run.i)); }
    else { gameRun = null; openGamesHub(); }
  });
  flushDeferredCelebrations();
}
function uniqWords(list) {
  const out = [];
  list.forEach(w => { if (!out.some(u => sameWord(u, w))) out.push(w); });
  return out;
}

// ── DAILY CHALLENGE ───────────────────────────
// Same three games all day (seeded by the date), chosen from the games
// the "All known words" pool supports. Each finished round is stored
// immediately, so leaving midway keeps progress.
const DAILY_BONUS_XP = 100;
function dailyState() {
  const d = S.games.daily, today = todayISO();
  if (d.date !== today) { d.date = today; d.done = []; d.ids = []; }
  return d;
}
// Once three games are available the day's set is frozen, so learning
// new words mid-day can never reshuffle a half-finished challenge.
function dailyGameIds(pool) {
  const d = dailyState();
  const usable = id => { const g = getGame(id); return g && g.inRuns !== false && !GAME_RUN_EXCLUDE.has(id) && gameUsableNow(g) && gameRequirement(g, pool, "short").ok; };
  if (Array.isArray(d.ids) && d.ids.length === 3 && d.ids.every(usable)) return d.ids.slice();
  const rng = seededRandom(hashString(todayISO() + "|" + STORAGE_KEY));
  const order = GAMES.map(g => g.id);
  for (let i = order.length - 1; i > 0; i--) { const j = Math.floor(rng() * (i + 1)); [order[i], order[j]] = [order[j], order[i]]; }
  // A frozen set that stopped fitting (Speak, don't spell hid a game,
  // sound was switched off): keep the rounds already played.
  const keep = Array.isArray(d.ids) && d.ids.length === 3 ? d.done.filter(id => d.ids.includes(id) && usable(id)) : [];
  const ids = [...keep, ...order.filter(id => usable(id) && !keep.includes(id))].slice(0, 3);
  if (ids.length === 3) d.ids = ids.slice();
  return ids;
}
function dailyMarkDone(id) {
  const d = dailyState();
  if (!d.done.includes(id)) d.done.push(id);
  saveState();
}
// Returns the bonus XP awarded (0 when not complete or already paid).
function dailyCompleteIfDone() {
  const d = dailyState();
  const ids = dailyGameIds(buildGamePool(null));
  if (ids.length < 2 || !ids.every(id => d.done.includes(id))) return 0;
  if (d.completedDates.includes(d.date)) return 0;
  d.completedDates.push(d.date);
  if (d.completedDates.length > 400) d.completedDates = d.completedDates.slice(-400);
  addExp(DAILY_BONUS_XP);
  saveState();
  questEvent("daily", {});
  checkAchievements({ type: "daily_challenge" });
  return DAILY_BONUS_XP;
}
function dailyStreak() {
  const dates = new Set(S.games.daily.completedDates);
  let day = todayISO();
  if (!dates.has(day)) day = addDays(day, -1);
  let n = 0;
  while (dates.has(day)) { n++; day = addDays(day, -1); }
  return n;
}
// The Daily Challenge plays your due / flagged / weakest words (topped
// up with other known words), with a random twist on the last round.
function dailyPool() {
  const all = buildGamePool(null);
  const need = all.filter(w => wordWeakness(w) >= 4);
  if (need.length >= 16) return need;
  const rest = all.filter(w => !need.includes(w)).sort((a, b) => wordWeakness(b) - wordWeakness(a));
  return need.concat(rest.slice(0, Math.max(0, 24 - need.length)));
}
function startDailyChallenge() {
  const pool = dailyPool();
  const ids = dailyGameIds(pool);
  const d = dailyState();
  const remaining = ids.filter(id => !d.done.includes(id));
  if (!remaining.length) { showCelebrateToast("📆", "Challenge done", "Come back tomorrow for a new one"); return; }
  const twists = remaining.map(id => {
    if (ids.indexOf(id) !== ids.length - 1 || ids.length < 3) return null;
    const g = getGame(id); return g && g.twists && g.twists.length ? g.twists[Math.floor(Math.random() * g.twists.length)] : null;
  });
  startGameRun("daily", remaining, { pool, size: "short", title: "📆 Daily Challenge", twists });
}

// ── ARCADE MIX ────────────────────────────────
function startArcadeMix() {
  const pool = buildGamePool(gameHubDeckIds || S.games.pool);
  const ids = shuffle(GAMES.filter(g => g.inRuns !== false && !GAME_RUN_EXCLUDE.has(g.id) && gameUsableNow(g) && gameRequirement(g, pool, "short").ok).map(g => g.id)).slice(0, 4);
  if (ids.length < 2) { showCelebrateToast("🕹️", "Arcade Mix", "Needs more known words"); return; }
  startGameRun("mix", ids, { pool, size: "short", title: "🕹️ Arcade Mix" });
}

// ── SURPRISE ROUNDS (inside Drill) ────────────
// After every 10th correct answer in typed Drill, pressing Next offers
// a short bonus round on the drill's own words.
const SURPRISE_EVERY = 10;
const SURPRISE_GAMES = ["match", "gender", "blitz"];
let _surpriseShownAt = 0;
function maybeSurpriseRound() {
  if (!S.games || S.games.surprise === false) return false;
  if (activeMode !== "drill" || voiceEnabled) return false;
  if (!sessionCorrect || sessionCorrect % SURPRISE_EVERY !== 0 || _surpriseShownAt === sessionCorrect) return false;
  if (document.getElementById("unlock-modal")) return false;
  const pool = activeWords.map(w => ({ ...w, anki: isAnkiDeck(w.deckId) }));
  const options = SURPRISE_GAMES.filter(id => { const g = getGame(id); return g && gameUsableNow(g) && gameRequirement(g, pool, "bonus").ok; });
  if (!options.length) return false;
  _surpriseShownAt = sessionCorrect;
  const id = options[randInt(options.length)];
  gameRun = { kind: "surprise", ids: [id], i: 0, summaries: [], pool, size: "bonus", title: "🎁 Bonus",
    onDone: resumeDrillAfterBonus };
  launchGame(id, { pool, size: "bonus" });
  return true;
}
function resumeDrillAfterBonus() {
  gameRun = null;
  answered = false;
  currentWord = drillSubMode === 'refresh' ? pickNextRefresh() : pickNext(drillSubMode === 'focus');
  initDrillScreen();
}
function renderSurpriseResult(sum, run) {
  const back = (run && run.onDone) || resumeDrillAfterBonus;
  const label = run && run.onDone === resumeDrillAfterBonus ? "Back to drill →" : "Continue →";
  const cleared = !!sum.result.cleared, minion = !!sum.result.minion;
  if (cleared) { confettiBurst(minion ? 50 : 30); playAchievement(); }
  document.getElementById("main-screen").innerHTML = `<div class="screen game-screen">
      <div class="result-screen g-results">
        <div class="result-emoji">${minion ? (cleared ? "⚔️" : "💨") : cleared ? "🎁" : sum.def && sum.def.timed ? "⏰" : "💪"}</div>
        <div class="result-title">${minion ? (cleared ? "Minion defeated!" : "The minion escaped") : cleared ? "Bonus cleared ✓"
          : (sum.result.correct || 0) >= bonusGoal(sum.def && sum.def.id) - 1 ? "So close!" : "Good practice"}</div>
        ${sum.result.note ? `<div class="g-best-line">${escapeHtml(sum.result.note)}</div>` : ""}
        <div class="result-sub">${bonusScoreLine(sum)} · +${sum.xp} XP</div>
        ${missedListHtml(sum.result.missed)}
        <div class="g-result-actions"><button class="g-big-btn" id="g-back-drill">${label}</button></div>
      </div>
    </div>`;
  window.scrollTo({ top: 0, behavior: "instant" });
  armOverlayButton(document.getElementById("g-back-drill"), () => back());
  flushDeferredCelebrations();
}
// "5 right · 1 mistake · target 4 ✓" — right answers and mistakes are
// always shown separately, never folded into one "x/y".
function bonusScoreLine(sum) {
  const r = sum.result, id = sum.id || (sum.def && sum.def.id);
  const ok = r.correct || 0, bad = r.wrong || 0;
  if (r.minion) return `${ok} right · ${bad} mistake${bad === 1 ? "" : "s"}`;
  const goal = bonusGoal(id);
  return `${ok} right · ${bad} mistake${bad === 1 ? "" : "s"} · ${r.cleared ? `target ${goal} ✓` : `${Math.max(1, goal - ok)} short of the target (${goal})`}`;
}
function toggleSurpriseRounds() {
  S.games.surprise = !S.games.surprise;
  saveState();
  renderSettingsPanel();
}

// ── HUB ───────────────────────────────────────
// deckIds: from the start bar (session-only pool), or undefined to use
// the saved pool preference.
function openGamesHub(deckIds) {
  if (typeof pathSession !== "undefined" && pathSession) endPathSession(true);
  quitAllGames();
  closePoolPicker();
  clearGameCaches();
  if (deckIds !== undefined) gameHubDeckIds = validDeckIds(deckIds).length ? validDeckIds(deckIds) : null;
  showGameScreen();
  const island = document.getElementById("floating-island");
  if (island) island.style.display = "none";
  renderGamesHub();
}
function currentPoolIds() {
  if (gameHubDeckIds) return gameHubDeckIds;
  const saved = validDeckIds(S.games.pool);
  return saved.length ? saved : null;
}
function poolLabel(ids, pool) {
  if (gameHubDeckIds) return `Selected decks (${ids.length}) · ${pool.length} words`;
  if (!ids) return `Your words · ${pool.length}`;
  return ids.length === 1 ? `${getDeck(ids[0]).name} · ${pool.length} words` : `${ids.length} decks · ${pool.length} words`;
}
function renderGamesHub() {
  const el = document.getElementById("main-screen");
  el.style.paddingBottom = "";
  const ids = currentPoolIds();
  const pool = buildGamePool(ids);
  const gm = grandmaOn();
  const top = `<div class="screen-top">
      <div class="screen-label">🎮 Games</div>
      ${backBtnHtml()}
    </div>`;

  if (!pool.length) {
    const names = ids ? ids.map(id => getDeck(id).name).join(", ") : "";
    el.innerHTML = `<div class="screen game-screen">${top}
      ${gm ? "" : `<button class="g-pool-chip" onclick="openPoolPicker()">📚 ${escapeHtml(poolLabel(ids, pool))} <span class="g-pool-edit">change</span></button>`}
      <div class="g-empty">
        <div class="g-empty-icon">🌱</div>
        <div class="g-empty-title">No words to play with yet</div>
        <div class="g-empty-sub">${ids
          ? `${escapeHtml(names)} ${ids.length > 1 ? "have" : "has"} no words you've met yet. Study ${ids.length > 1 ? "them" : "it"} first (Anki cards join once introduced), or pick other decks.`
          : "Games use words you already know. Do a Today session or two and come back!"}</div>
        ${backBtnHtml("g-big-btn")}
      </div></div>`;
    return;
  }

  // Daily Challenge (always the "All known words" pool): one row.
  const allPool = ids ? buildGamePool(null) : pool;
  const dIds = dailyGameIds(allPool);
  const d = dailyState();
  const dDone = dIds.filter(id => d.done.includes(id)).length;
  const dComplete = S.games.daily.completedDates.includes(todayISO());
  const streak = dailyStreak();
  const dailyHtml = dIds.length < 2
    ? `<div class="g-row off"><span class="g-row-icon">📆</span><span class="g-row-main"><b>Daily challenge</b><small>Get to know a few more words to unlock it</small></span></div>`
    : `<button class="g-row ${dComplete ? "done" : ""}" onclick="startDailyChallenge()" ${dComplete ? "disabled" : ""}>
        <span class="g-row-icon">📆</span>
        <span class="g-row-main"><b>Daily challenge</b>
          <small>${dComplete ? "Done ✓ — new one tomorrow" : `${dIds.map(id => `<span class="g-dot ${d.done.includes(id) ? "on" : ""}"></span>`).join("")} ${dDone}/${dIds.length} · +${DAILY_BONUS_XP} XP`}</small></span>
        ${streak > 0 ? `<span class="g-row-meta">${streak} in a row</span>` : ""}
        ${dComplete ? "" : `<span class="set-chev" aria-hidden="true">›</span>`}
      </button>`;

  // 👵 Grandma mode: just the games — no bosses, Arcade Mix or pool menu.
  const cards = GAMES.filter(g => !gameHiddenNow(g) && !(gm && g.id === "boss")).map(g => {
    const req = gameRequirement(g, pool, "full");
    const r = gameRankOf(g.id);
    const st = gameRankStars(g.id, r);
    const best = (S.games.rankBest[g.id] || [])[r];
    const fresh = !(S.games.plays[g.id] || 0) && best === undefined;
    const quietOff = !gameUsableNow(g);
    const off = !req.ok || quietOff;
    // 👵 Grandma mode: only games that can be played now, no rank medals.
    if (gm && off) return "";
    return `<button class="g-card-tile ${off ? "off" : ""}" onclick="gameTileTap('${g.id}')" ${req.ok ? "" : `aria-disabled="true"`} title="${escapeHtml(off ? (req.ok ? "Needs sound" : req.reason) : g.skill)}">
      ${off ? `<span class="g-tile-rank">🔒</span>` : fresh || gm ? "" : `<span class="g-tile-rank" title="${GAME_RANKS[r].name}">${GAME_RANKS[r].icon}</span>`}
      <span class="g-tile-icon">${g.icon}</span>
      <span class="g-tile-name">${escapeHtml(gameName(g))}</span>
      <span class="g-tile-stars">${off ? "" : fresh ? `<span class="g-tile-new">new</span>` : starsHtml(st)}</span>
    </button>`;
  }).join("");

  const mixOk = GAMES.filter(g => g.inRuns !== false && !GAME_RUN_EXCLUDE.has(g.id) && gameUsableNow(g) && gameRequirement(g, pool, "short").ok).length >= 2;
  const pick = playForTodayPick();
  el.innerHTML = `<div class="screen game-screen">${top}
    ${pick ? `<button class="g-today-btn" onclick="playForToday()"><span class="g-today-main">▶ Play for today</span><span class="g-today-sub">${pick.icon} ${escapeHtml(gameName(pick))} with the words you need most</span></button>` : ""}
    <div class="g-rows">
      ${dailyHtml}
      ${!gm && typeof bossSummaryRowHtml === "function" ? bossSummaryRowHtml() : ""}
      ${gm ? "" : `<button class="g-row" onclick="startArcadeMix()" ${mixOk ? "" : "disabled"}><span class="g-row-icon">🕹️</span><span class="g-row-main"><b>Arcade Mix</b><small>4 quick rounds, back to back</small></span><span class="set-chev" aria-hidden="true">›</span></button>`}
    </div>
    <div class="g-grid-head"><span>All games</span>${gm ? "" : `<button class="g-pool-chip" onclick="openPoolPicker()">📚 ${escapeHtml(poolLabel(ids, pool))} <span class="g-pool-edit">change</span></button>`}</div>
    <div class="g-grid">${cards}</div>
  </div>`;
}

// ▶ Play for today: no choosing — a game that fits your due words,
// preferring ones you haven't played lately, never the last one.
let _todayPick = null;
function playForTodayPick() {
  const pool = dailyPool();
  const last = S.games.lastGameId;
  const cands = GAMES.filter(g => g.id !== "boss" && g.id !== last && gameUsableNow(g) && gameRequirement(g, pool, "full").ok);
  if (!cands.length) return null;
  if (_todayPick && cands.includes(_todayPick)) return _todayPick;
  const today = todayISO();
  const w = cands.map(g => {
    const lp = S.games.lastPlayed[g.id];
    const age = lp ? Math.min(14, daysBetween(lp, today)) : 14;
    return { g, w: 1 + age };
  });
  _todayPick = weightedPick(w).g;
  return _todayPick;
}
function playForToday() {
  const g = playForTodayPick();
  if (!g) return;
  _todayPick = null;
  S.games.lastGameId = g.id;
  logEvent("play_for_today", { id: g.id });
  launchGame(g.id, { pool: dailyPool(), size: "full" });
}

// Locked tiles stay tappable so they can explain themselves.
function gameTileTap(id) {
  const g = getGame(id);
  if (!g) return;
  const req = gameRequirement(g, buildGamePool(currentPoolIds()), "full");
  if (req.ok && !gameUsableNow(g)) { showCelebrateToast("🔇", gameName(g), "Needs words read aloud — check ⚙️ Settings › Sound & voice"); return; }
  if (req.ok) { S.games.lastGameId = id; launchGame(id); }
  else { buzz(30); showCelebrateToast(g.icon, gameName(g), req.reason); }
}

// ── POOL PICKER ───────────────────────────────
let _pickerSel = null;      // Set of deck ids, or null = all known
let _pickerOpenGroups = new Set();
function _pickerKey(e) { if (e.key === "Escape") { e.preventDefault(); closePoolPicker(); } }
function openPoolPicker() {
  document.addEventListener("keydown", _pickerKey);
  const ids = currentPoolIds();
  _pickerSel = ids ? new Set(ids) : null;
  _pickerOpenGroups = new Set();
  if (_pickerSel) ALL_GROUPS.forEach(g => { if (g.decks.some(d => _pickerSel.has(d.id))) _pickerOpenGroups.add(g.id); });
  renderPoolPicker();
}
// Re-renders update the open sheet in place (no replayed entrance
// animation, scroll position kept).
function renderPoolPicker() {
  let modal = document.getElementById("pool-modal");
  if (!modal) {
    modal = document.createElement("div");
    modal.className = "modal-overlay";
    modal.id = "pool-modal";
    modal.onclick = e => { if (e.target === modal) closePoolPicker(); };
    modal.innerHTML = `<div class="modal-sheet g-picker" role="dialog" aria-label="Words to play with"></div>`;
    document.body.appendChild(modal);
  }
  const sheet = modal.querySelector(".modal-sheet");
  const all = !_pickerSel;
  const count = _pickerSel ? buildGamePool([..._pickerSel]).length : buildGamePool(null).length;
  const groupsHtml = ALL_GROUPS.map(g => {
    const decks = g.decks.map(d => ({ d, n: poolWordsForDeck(d, true).length }));
    const selN = _pickerSel ? g.decks.filter(d => _pickerSel.has(d.id)).length : 0;
    const open = _pickerOpenGroups.has(g.id);
    const state = selN === 0 ? "" : selN === g.decks.length ? "on" : "some";
    const total = decks.reduce((s, x) => s + x.n, 0);
    return `<div class="g-pick-group">
      <div class="g-pick-ghead">
        <button class="g-check ${state}" onclick="pickerToggleGroup('${g.id}')" aria-label="Select all in ${escapeHtml(g.name)}">${state === "on" ? "✓" : state === "some" ? "–" : ""}</button>
        <button class="g-pick-gname" onclick="pickerToggleOpen('${g.id}')">${g.icon} ${escapeHtml(g.name)}
          <span class="g-pick-meta">${total} ${g.type === "anki" ? "introduced" : "unlocked"}${selN ? ` · ${selN} selected` : ""}</span>
          <span class="group-chevron ${open ? "open" : ""}">▶</span></button>
      </div>
      ${open ? `<div class="g-pick-decks">${decks.map(({ d, n }) => `
        <button class="g-pick-deck ${_pickerSel && _pickerSel.has(d.id) ? "on" : ""} ${n ? "" : "empty"}" onclick="pickerToggleDeck('${d.id}')">
          <span class="g-check ${_pickerSel && _pickerSel.has(d.id) ? "on" : ""}">${_pickerSel && _pickerSel.has(d.id) ? "✓" : ""}</span>
          <span class="g-pick-dname">${d.icon} ${escapeHtml(d.name)}</span>
          <span class="g-pick-n">${n}</span>
        </button>`).join("")}</div>` : ""}
    </div>`;
  }).join("");
  sheet.innerHTML = `
      <div class="modal-title">Words to play with</div>
      <div class="modal-sub">${count} word${count !== 1 ? "s" : ""} in the pool. Vocab and Anki decks can be mixed.</div>
      <button class="g-pick-all ${all ? "on" : ""}" onclick="pickerAll()">
        <span class="g-check ${all ? "on" : ""}">${all ? "✓" : ""}</span>
        <span><strong>Your words</strong><br><small>Every word you've met on your Path, plus introduced Anki cards</small></span>
      </button>
      <div class="g-pick-list">${groupsHtml}</div>
      <div class="modal-actions">
        <button class="modal-btn secondary" onclick="closePoolPicker()">Cancel</button>
        <button class="modal-btn primary" onclick="applyPoolPicker()" ${count ? "" : "disabled"}>${count ? `Play with ${count} words` : "No words selected"}</button>
      </div>`;
}
function pickerAll() { _pickerSel = null; renderPoolPicker(); }
function pickerToggleOpen(gid) { if (_pickerOpenGroups.has(gid)) _pickerOpenGroups.delete(gid); else _pickerOpenGroups.add(gid); renderPoolPicker(); }
function pickerToggleDeck(id) {
  if (!_pickerSel) _pickerSel = new Set();
  if (_pickerSel.has(id)) _pickerSel.delete(id); else _pickerSel.add(id);
  if (!_pickerSel.size) _pickerSel = null;
  renderPoolPicker();
}
function pickerToggleGroup(gid) {
  const g = ALL_GROUPS.find(x => x.id === gid);
  if (!g) return;
  if (!_pickerSel) _pickerSel = new Set();
  const allOn = g.decks.every(d => _pickerSel.has(d.id));
  g.decks.forEach(d => { if (allOn) _pickerSel.delete(d.id); else _pickerSel.add(d.id); });
  if (!allOn) _pickerOpenGroups.add(gid);
  if (!_pickerSel.size) _pickerSel = null;
  renderPoolPicker();
}
function closePoolPicker() {
  document.removeEventListener("keydown", _pickerKey);
  const m = document.getElementById("pool-modal");
  if (m) m.remove();
}
function applyPoolPicker() {
  S.games.pool = _pickerSel ? [..._pickerSel] : null;
  gameHubDeckIds = null; // an explicit choice replaces the start-bar selection
  saveState();
  closePoolPicker();
  renderGamesHub();
}

// Word edits change deck words, so the derived caches are cleared on
// every hub open (games may register extra caches here).
const _gameCacheClearers = [];
function clearGameCaches() {
  _formCache.clear(); _nounCache.clear(); _normCache.clear(); _altCache.clear(); _allGameWords = null;
  _gameCacheClearers.forEach(fn => fn());
}
