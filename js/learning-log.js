// ── LEARNING LOG ──────────────────────────────
// What you know, what's new, and exactly how you get things wrong, so
// an AI tutor can build exercises around your real weak spots:
// Settings → For developers → "Copy learning log".
//
// Every miss (Today path, Drill, games) is sorted into a mistake type:
// the wrong gender, a spelling slip, the wrong case, a verb in the wrong
// person or tense, haben/sein, a mix-up with another word… Where it's kept:
//   • per word, in its word stats (synced with the deck docs):
//       ws.mx = { type: count }          mistakes by type, all time
//       ws.mh = [[date, src, type, given]]  the last LEARN_HIST misses
//       ws.sf = { type: count }          "soft" slips on answers that
//                                         still counted (no umlaut…)
//       ws.g  = [right, wrong]           in games (Path/Drill are in
//                                         ws.correct / ws.wrong)
//   • verb forms the conjugation game makes up (not deck cards), in
//     S.learn.verbs[infinitive] (its own synced doc, see sync.js)
//   • per day, in the usage log: day.mk / day.sf (mistakes / soft slips
//     by type), so the usage report shows them too.

const LEARN_HIST = 6;
const MISTAKE_LABEL = {
  gender: "wrong gender / article", article: "article missing or extra", plural: "plural",
  case: "case (den/dem/des…)", spelling: "spelling", umlaut: "ä/ö/ü/ß or accents",
  order: "word order / separable prefix", person: "verb: wrong person", tense: "verb: wrong tense",
  aux: "verb: haben/sein", participle: "verb: past participle", verbform: "verb: other wrong form",
  confused: "mixed up with another word", meaning: "didn't know the word", blank: "no answer / don't know",
  listening: "misheard (listening)", recognition: "picked the wrong meaning", context: "wrong word for the sentence",
};
const SOFT_LABEL = { umlaut: "typed without ä/ö/ü/ß (accepted)", capital: "noun typed in lower case (accepted)" };
const LEARN_ARTICLES_DE = ["der", "die", "das", "den", "dem", "des", "ein", "eine", "einen", "einem", "einer", "eines"];
const LEARN_ARTICLES_FR = ["le", "la", "les", "l", "un", "une", "des"];

function migrateLearn() {
  if (!S.learn || typeof S.learn !== "object") S.learn = {};
  if (!S.learn.verbs || typeof S.learn.verbs !== "object") S.learn.verbs = {};
  if (!S.learn.since) S.learn.since = todayISO(); // mistake types are recorded from this day
}
function _learnDay(field, type) {
  try { const d = usageDay(); const m = d[field] || (d[field] = {}); m[type] = (m[type] || 0) + 1; } catch (e) {}
}
const _clip = s => String(s == null ? "" : s).replace(/\s+/g, " ").trim().slice(0, 60);

// ── CLASSIFYING ───────────────────────────────
function _toks(s) { return normalize(String(s || "")).split(" ").filter(Boolean); }
function _sameBag(a, b) { return a.length > 1 && a.length === b.length && [...a].sort().join(" ") === [...b].sort().join(" "); }
function _close(a, b) {
  if (!a || !b) return false;
  if (a.length >= 2 && typeof isTransposition === "function" && isTransposition(a, b)) return true; // "its" for "ist"
  const d = levenshtein(a, b);
  return d <= Math.max(1, Math.floor(Math.max(a.length, b.length) * 0.25)) && Math.min(a.length, b.length) >= 3;
}
function _expectedList(expected) {
  return (Array.isArray(expected) ? expected : [expected]).flatMap(x => String(x || "").split("/")).map(x => x.trim()).filter(Boolean);
}
// Does the text match another deck word? (a real mix-up, not a blank guess)
let _learnIndex = null;
function _learnFind(given, notW) {
  const g = normalize(String(given || ""));
  if (g.length < 2) return null;
  if (!_learnIndex) {
    _learnIndex = new Map();
    for (const grp of ALL_GROUPS) for (const d of grp.decks) d.words.forEach((x, i) => {
      [x[WORD_KEY], typeof gameForm === "function" ? gameForm({ ...x, deckId: d.id, idx: i }) : ""].forEach(t => {
        String(t || "").split("/").forEach(p => { const k = normalize(p.trim()); if (k && !_learnIndex.has(k)) _learnIndex.set(k, d.id + "_" + i); });
      });
    });
  }
  const k = _learnIndex.get(g);
  return k && (!notW || k !== wordKey(notW)) ? k : null;
}
// given vs expected (a string or a list of accepted answers) → a type.
// opts.alsoOk: forms that are the right word in another shape (the
// dictionary form of a cloze gap = a case slip).
function classifyMistake(given, expected, w, opts = {}) {
  const g = normalize(String(given || ""));
  if (!g) return "blank";
  const alts = _expectedList(expected).map(normalize).filter(Boolean);
  if (!alts.length) return "meaning";
  if (opts.alsoOk && opts.alsoOk.some(x => normalize(x) === g)) return "case";
  const gt = g.split(" ");
  // Nouns: the noun right, the article not.
  const np = w && typeof nounParts === "function" && !opts.noNoun ? nounParts(w) : null;
  if (np && np.noun) {
    const noun = normalize(np.noun), arts = IS_FRENCH_APP ? LEARN_ARTICLES_FR : LEARN_ARTICLES_DE;
    const tail = gt[gt.length - 1];
    const pl = !IS_FRENCH_APP && typeof germanPluralNoun === "function" ? normalize(germanPluralNoun(w) || "") : "";
    if (pl && tail === pl && pl !== noun) return "plural";
    if (tail === noun || _close(tail, noun) && gt.length > 1) {
      const art = gt.slice(0, -1).join(" ");
      if (!art) return "article";
      if (arts.includes(art) && art !== normalize(np.answer)) return "gender";
    }
    if (gt.length === 1 && _close(g, noun)) return "article";
  }
  for (const a of alts) {
    const at = a.split(" ");
    if (a === g) return "umlaut";              // only accents / ß / case differed
    if (_sameBag(gt, at)) return "order";
  }
  if (alts.some(a => _close(g, a))) return "spelling";
  if (_learnFind(given, w)) return "confused";
  return "meaning";
}
// A German verb form (conjugation game): which kind of slip?
function classifyVerbMistake(given, F, tense, person) {
  // A pronoun typed in front ("sie haben gekommen") isn't part of the form.
  const g = normalize(String(given || "")).replace(/^(ich|du|er|sie|es|wir|ihr|man) (?=\S)/, "");
  if (!g) return "blank";
  if (typeof verbCell !== "function" || !F) return "verbform";
  const cellsOf = (t, p) => verbCellAnswers(verbCell(F, t, p)).map(x => normalize(x));
  const want = cellsOf(tense, person);
  if (want.includes(g)) return "umlaut";
  const persons = tense === "im" ? ["du", "ihr", "Sie"] : PERSONS;
  if (persons.some(p => p !== person && cellsOf(tense, p).includes(g))) return "person";
  if (TENSES.some(t => t.id !== tense && [...PERSONS, "Sie"].some(p => cellsOf(t.id, p).includes(g)))) return "tense";
  const gt = g.split(" ");
  if ((tense === "pf" || tense === "pq") && F.aux && F.p2) {
    const table = tense === "pf" ? AUX_PR : AUX_PT;
    const other = F.aux === "sein" ? "haben" : "sein";
    const p2 = normalize(F.p2), right = normalize(table[F.aux][person] || "");
    if (Object.values(table[other]).map(normalize).includes(gt[0]) && gt.slice(1).join(" ").endsWith(p2.split(" ").pop())) return "aux";
    if (gt[0] === right && gt.length >= 2) return "participle";
  }
  if (want.some(a => _sameBag(gt, a.split(" ")))) return "order";
  if (F.sep && want.some(a => normalize(a.replace(new RegExp("\\s+" + F.sep + "$"), "")) === g || normalize(F.sep + a.split(" ")[0]) === g)) return "order";
  if (want.some(a => _close(g, a))) return "spelling";
  return "verbform";
}

// A conjugation card ("sein — du ___" = bist): its verb, tense and person,
// so a miss can be told apart as person / tense / spelling.
const CARD_TENSE = [[/plusq/i, "pq"], [/praet|präter/i, "pt"], [/futur/i, "fu"], [/perfekt/i, "pf"], [/conj/i, "pr"]];
function _cardVerb(w) {
  if (IS_FRENCH_APP || typeof conjItem !== "function" || typeof verbBank !== "function") return null;
  const it = conjItem(w);
  if (!it) return null;
  const tense = (CARD_TENSE.find(([re]) => re.test(w.deckId || "")) || [])[1];
  const p = String(it.pron).trim().toLowerCase();
  const person = p === "ich" ? "ich" : p === "du" ? "du" : /^er/.test(p) ? "er" : p === "wir" ? "wir" : p === "ihr" ? "ihr" : /^sie/.test(p) ? "sie" : null;
  const v = verbBank().byInf.get(it.verb);
  return tense && person && v && v.F ? { F: v.F, tense, person, inf: it.verb } : null;
}

// ── RECORDING ─────────────────────────────────
// info: { src, given, expected, type?, alsoOk?, other? }
function learnNoteMiss(w, info = {}) {
  try {
    migrateLearn();
    if (!w || w.anki || typeof getWS !== "function") return;
    const ws = getWS(w.deckId, w.idx);
    const cv = !info.type && info.given != null && String(info.given).trim() ? _cardVerb(w) : null;
    let cvType = cv ? classifyVerbMistake(info.given, cv.F, cv.tense, cv.person) : null;
    if (cvType === "umlaut" || cvType === "verbform") cvType = null; // nothing verb-specific: the general rules decide
    const type = info.type || cvType || classifyMistake(info.given, info.expected != null ? info.expected : [w[WORD_KEY], typeof gameForm === "function" ? gameForm(w) : ""], w, info);
    const mx = ws.mx || (ws.mx = {});
    mx[type] = (mx[type] || 0) + 1;
    const mh = ws.mh || (ws.mh = []);
    const row = [todayISO(), info.src || "?", type, _clip(info.given)];
    if (info.other) row.push(info.other);
    mh.push(row);
    if (mh.length > LEARN_HIST) mh.splice(0, mh.length - LEARN_HIST);
    if (info.src && info.src.startsWith("game:")) { const gm = ws.g || (ws.g = [0, 0]); gm[1]++; }
    _learnDay("mk", type);
    return type;
  } catch (e) { console.warn("learning log failed", e); }
}
function learnNoteHit(w, src) {
  try {
    if (!w || w.anki || !src || !src.startsWith("game:")) return;
    const ws = getWS(w.deckId, w.idx);
    const gm = ws.g || (ws.g = [0, 0]); gm[0]++;
  } catch (e) {}
}
// A right answer that still shows a writing slip.
function learnNoteSoft(w, given) {
  try {
    migrateLearn();
    if (!w || w.anki) return;
    const raw = String(given || "").trim();
    if (!raw) return;
    const want = String(typeof gameForm === "function" ? gameForm(w) : w[WORD_KEY]);
    const ws = getWS(w.deckId, w.idx);
    const note = t => { const sf = ws.sf || (ws.sf = {}); sf[t] = (sf[t] || 0) + 1; _learnDay("sf", t); };
    const DIA = /[äöüßéèêàâçôîûùëïœ]/i;
    if (DIA.test(want) && !DIA.test(raw)) note("umlaut");
    if (!IS_FRENCH_APP) {
      const np = typeof nounParts === "function" ? nounParts(w) : null;
      if (np && np.noun && /^\p{Lu}/u.test(np.noun)) {
        const last = raw.split(/\s+/).pop() || "";
        if (last && /^\p{Ll}/u.test(last)) note("capital");
      }
    }
  } catch (e) {}
}
// The private "my typo" override: the last miss on this word didn't count.
function learnUndoLast(w) {
  try {
    const ws = getWS(w.deckId, w.idx);
    const last = ws.mh && ws.mh.pop();
    if (!last) return;
    const t = last[2];
    if (ws.mx && ws.mx[t]) { ws.mx[t]--; if (!ws.mx[t]) delete ws.mx[t]; }
    const d = usageDay(); if (d.mk && d.mk[t]) d.mk[t]--;
  } catch (e) {}
}
// A verb form made up by the conjugation game (no deck card behind it).
function learnNoteVerb(F, tense, person, ok, given, expected) {
  try {
    if (!F || !F.inf) return;
    migrateLearn();
    const v = S.learn.verbs[F.inf] || (S.learn.verbs[F.inf] = { t: {}, pe: {}, mx: {}, mh: [] });
    const t = v.t[tense] || (v.t[tense] = [0, 0]);
    t[ok ? 0 : 1]++;
    if (ok) return;
    v.pe[person] = (v.pe[person] || 0) + 1;
    const type = classifyVerbMistake(given, F, tense, person);
    v.mx[type] = (v.mx[type] || 0) + 1;
    v.mh.push([todayISO(), tense, person, _clip(given), _clip(expected), type]);
    if (v.mh.length > LEARN_HIST) v.mh.splice(0, v.mh.length - LEARN_HIST);
    _learnDay("mk", type);
  } catch (e) { console.warn("learning log failed", e); }
}

// ── REPORT ────────────────────────────────────
function _learnWord(key) {
  const i = key.lastIndexOf("_"), deckId = key.slice(0, i), idx = +key.slice(i + 1);
  const d = typeof getDeck === "function" ? getDeck(deckId) : null;
  const x = d && d.words[idx];
  return x ? { ...x, deckId, idx, deckName: d.name } : null;
}
function buildLearningReport() {
  migrateLearn();
  const lang = IS_FRENCH_APP ? "French" : "German";
  const today = todayISO(), recentFrom = addDays(today, -13);
  const form = w => typeof gameForm === "function" ? gameForm(w) : w[WORD_KEY];
  const tierOf = st => TIERS.find(t => st >= t.min && st <= t.max) || TIERS[0];
  // One entry per written form: the same word in two decks is merged
  // (counts added, the higher stage kept).
  const byForm = new Map();
  Object.entries(S.words || {}).forEach(([k, ws]) => {
    if (!ws || !(ws.st || ws.correct || ws.wrong || ws.mx || ws.sf)) return;
    const w = _learnWord(k);
    if (!w || w.anki) return;
    const f = form(w), prev = byForm.get(f);
    if (!prev) { byForm.set(f, { k, w, ws }); return; }
    const a = prev.ws, m = { ...a };
    ["correct", "wrong", "near"].forEach(x => m[x] = (a[x] || 0) + (ws[x] || 0));
    ["mx", "sf"].forEach(x => { if (a[x] || ws[x]) { m[x] = { ...(a[x] || {}) }; Object.entries(ws[x] || {}).forEach(([t, n]) => m[x][t] = (m[x][t] || 0) + n); } });
    if (a.g || ws.g) m.g = [(a.g || [0, 0])[0] + (ws.g || [0, 0])[0], (a.g || [0, 0])[1] + (ws.g || [0, 0])[1]];
    if (a.mh || ws.mh) m.mh = [...(a.mh || []), ...(ws.mh || [])].sort((x, y) => String(x[0]).localeCompare(String(y[0]))).slice(-LEARN_HIST);
    m.st = Math.max(a.st || 0, ws.st || 0); m.k = Math.min(a.k || 1, ws.k || 1);
    m.metOn = [a.metOn, ws.metOn].filter(Boolean).sort()[0]; m.rp = a.rp || ws.rp; m.fl = a.fl || ws.fl;
    if ((ws.st || 0) > (a.st || 0)) prev.w = w;
    prev.ws = m;
  });
  const words = [...byForm.values()];
  const lines = [];
  const L = (...a) => lines.push(...a);
  L(`${lang.toUpperCase()} LEARNING LOG — for my AI tutor — ${today}`);
  L(`I'm learning ${lang} with a vocabulary app (decks A1 → B1). This is everything it knows about my learning: what I've met, what I've learnt, and exactly how I get things wrong. Please use it to give me exercises aimed at my weak spots (the mistake types, words, genders, verbs and tenses below), mixing in the words I'm learning right now. Explain the rule briefly when you correct me. Mistake types are recorded from ${S.learn.since || today}; older history only shows right/wrong totals. "Recent" = the last 14 days.`);

  // Profile
  L(``, `## PROFILE`);
  const met = words.filter(x => x.ws.st > 0);
  const tiers = {};
  met.forEach(x => { const t = tierOf(x.ws.st).name; tiers[t] = (tiers[t] || 0) + 1; });
  const total = ALL_GROUPS.filter(g => g.type !== "anki").reduce((a, g) => a + g.decks.reduce((b, d) => b + d.words.length, 0), 0);
  const firstMet = met.map(x => x.ws.metOn).filter(Boolean).sort()[0];
  L(`Words met: ${met.length} of ${total}${firstMet ? ` (since ${firstMet})` : ""} · ` + TIERS.filter(t => t.id !== "new").map(t => `${t.icon} ${t.name} ${tiers[t.name] || 0}`).join(" · "));
  L(`Stages: 🌱 Learning = just met · 🌿 Familiar = recognised · 🌳 Known = recalled over a week+ · ⭐ Strong = a month · 💎 Locked in = for good.`);
  ALL_GROUPS.filter(g => g.type !== "anki").forEach(g => {
    const ids = new Set(g.decks.map(d => d.id));
    const gw = met.filter(x => ids.has(x.w.deckId));
    const n = g.decks.reduce((a, d) => a + d.words.length, 0);
    L(`  ${g.name}: met ${gw.length}/${n} · known or better ${gw.filter(x => x.ws.st >= STAGE_KNOWN).length}`);
  });
  const usage = typeof usageAllDays === "function" ? usageAllDays() : [];
  const acc = (from, to) => {
    let n = 0, ok = 0;
    usage.forEach(([d, v]) => { if (d < from || d > to) return; Object.entries(v.ans || {}).forEach(([m, a]) => { if (/typed|cloze|drill/.test(m)) { n += a[0] || 0; ok += a[1] || 0; } }); });
    return n ? `${Math.round(ok / n * 100)}% of ${n}` : "—";
  };
  L(`Typed accuracy: last 14 days ${acc(recentFrom, today)} · the 14 days before ${acc(addDays(today, -27), addDays(today, -14))}`);

  // Mistake types
  const typeAll = {}, typeRecent = {}, softAll = {};
  usage.forEach(([d, v]) => {
    Object.entries(v.mk || {}).forEach(([t, n]) => { typeAll[t] = (typeAll[t] || 0) + n; if (d >= recentFrom) typeRecent[t] = (typeRecent[t] || 0) + n; });
    Object.entries(v.sf || {}).forEach(([t, n]) => { softAll[t] = (softAll[t] || 0) + n; });
  });
  L(``, `## MY MISTAKES BY TYPE (all · recent)`);
  const tl = Object.entries(typeAll).sort((a, b) => b[1] - a[1]);
  L(tl.length ? tl.map(([t, n]) => `${MISTAKE_LABEL[t] || t}: ${n} · ${typeRecent[t] || 0}`).join("\n") : "Nothing recorded yet.");
  const sl = Object.entries(softAll);
  if (sl.length) L(`Writing slips on answers that still counted: ` + sl.map(([t, n]) => `${SOFT_LABEL[t] || t} ${n}`).join(" · "));

  // What to work on first: a short summary for the tutor.
  const focus = [];
  const topTypes = Object.entries(typeRecent).sort((a, b) => b[1] - a[1]).slice(0, 3).map(([t]) => MISTAKE_LABEL[t] || t);
  if (topTypes.length) focus.push(`Most common mistakes lately: ${topTypes.join(", ")}.`);
  const csF = Object.entries((S.games && S.games.cases) || {}).filter(([, a]) => a && a[1] >= 5).sort((a, b) => a[1][0] / a[1][1] - b[1][0] / b[1][1]);
  if (csF.length) { const [k, a] = csF[0]; focus.push(`Weakest case: ${(typeof GRAMMAR_LABEL !== "undefined" && GRAMMAR_LABEL[k]) || k} (${Math.round(a[0] / a[1] * 100)}% right).`); }
  const tF = {}; Object.values(S.learn.verbs).forEach(v => Object.entries(v.t || {}).forEach(([t, a]) => { const r = tF[t] || (tF[t] = [0, 0]); r[0] += a[0]; r[1] += a[1]; }));
  const tW = Object.entries(tF).filter(([, a]) => a[0] + a[1] >= 5).sort((a, b) => a[1][0] / (a[1][0] + a[1][1]) - b[1][0] / (b[1][0] + b[1][1]));
  if (tW.length) { const [t, a] = tW[0]; focus.push(`Weakest tense: ${typeof TENSE_BY_ID !== "undefined" && TENSE_BY_ID[t] ? TENSE_BY_ID[t].name : t} (${Math.round(a[0] / (a[0] + a[1]) * 100)}% right).`); }
  const auxN = Object.values(S.learn.verbs).reduce((n, v) => n + ((v.mx || {}).aux || 0), 0);
  if (auxN >= 3) focus.push(`Perfekt with haben vs sein: ${auxN} mistakes.`);
  const softU = softAll.umlaut || 0;
  if (softU >= 5) focus.push(`I often leave out ä/ö/ü/ß (${softU}× on answers the app still accepted).`);
  const worst = words.filter(x => _wscore(x.ws) > 1).sort((a, b) => _wscore(b.ws) - _wscore(a.ws)).slice(0, 12).map(x => form(x.w));
  if (worst.length) focus.push(`Hardest words right now: ${worst.join(", ")}.`);
  if (focus.length) { L(``, `## FOCUS FOR MY NEXT EXERCISES`); focus.forEach(f => L(`- ${f}`)); }

  const hist = (ws, types) => (ws.mh || []).filter(h => !types || types.includes(h[2]));
  const wrote = (ws, types) => [...new Set(hist(ws, types).map(h => h[3]).filter(Boolean))].map(x => `"${x}"`).join(", ");

  // Gender
  {
    const g = words.filter(x => (x.ws.mx || {}).gender || (x.ws.mx || {}).article).sort((a, b) => ((b.ws.mx.gender || 0) + (b.ws.mx.article || 0)) - ((a.ws.mx.gender || 0) + (a.ws.mx.article || 0)));
    L(``, `## GENDER / ARTICLES — nouns I get wrong (right form · times · what I wrote)`);
    if (!g.length) L("None recorded yet.");
    const gn = x => (x.ws.mx.gender || 0) + (x.ws.mx.article || 0);
    g.filter(x => gn(x) > 1).forEach(x => L(`${form(x.w)} (${x.w.en}) · ${gn(x)}× · ${wrote(x.ws, ["gender", "article"]) || "—"}`));
    const once = g.filter(x => gn(x) === 1);
    if (once.length) L(`Wrong once (right form ← what I wrote): ` + once.map(x => `${form(x.w)} ← ${wrote(x.ws, ["gender", "article"]) || "—"}`).join(" · "));
    // Which article I put instead of which.
    const swap = {};
    words.forEach(x => {
      const np = typeof nounParts === "function" ? nounParts(x.w) : null;
      if (!np) return;
      hist(x.ws, ["gender"]).forEach(h => { const a = normalize(String(h[3] || "")).split(" ")[0]; if (a) { const k = `${np.answer} → ${a}`; swap[k] = (swap[k] || 0) + 1; } });
    });
    const sw = Object.entries(swap).sort((a, b) => b[1] - a[1]);
    if (sw.length) L(`Article swaps (right → what I wrote): ` + sw.map(([k, n]) => `${k} ${n}×`).join(" · "));
  }

  // Spelling
  const sp = words.filter(x => (x.ws.mx || {}).spelling || (x.ws.mx || {}).umlaut || (x.ws.mx || {}).order || (x.ws.sf || {}).umlaut || x.ws.near);
  L(``, `## SPELLING & WRITING — words I misspell (right form · slips · what I wrote)`);
  if (!sp.length) L("None recorded yet.");
  sp.sort((a, b) => _wscore(b.ws) - _wscore(a.ws)).forEach(x => {
    const m = x.ws.mx || {}, s = x.ws.sf || {};
    const bits = [m.spelling && `spelling ${m.spelling}×`, m.umlaut && `accents ${m.umlaut}×`, x.ws.near && `almost-right ${x.ws.near}×`, m.order && `word order ${m.order}×`, s.umlaut && `no ä/ö/ü/ß ${s.umlaut}×`, s.capital && `lower-case ${s.capital}×`].filter(Boolean);
    L(`${form(x.w)} (${x.w.en}) · ${bits.join(", ")}${wrote(x.ws, ["spelling", "order", "umlaut"]) ? " · " + wrote(x.ws, ["spelling", "order", "umlaut"]) : ""}`);
  });

  // Verbs
  L(``, `## VERBS & CONJUGATION`);
  const vf = (S.games && S.games.vf) || {};
  const tenseIds = typeof CONJ_TENSE_IDS === "function" ? CONJ_TENSE_IDS() : [];
  const tname = id => (typeof TENSE_BY_ID !== "undefined" && TENSE_BY_ID[id] ? TENSE_BY_ID[id].name : id);
  const tAcc = {}, pMiss = {}, vType = {};
  Object.values(S.learn.verbs).forEach(v => {
    Object.entries(v.t || {}).forEach(([t, a]) => { const r = tAcc[t] || (tAcc[t] = [0, 0]); r[0] += a[0]; r[1] += a[1]; });
    Object.entries(v.pe || {}).forEach(([p, n]) => pMiss[p] = (pMiss[p] || 0) + n);
    Object.entries(v.mx || {}).forEach(([t, n]) => vType[t] = (vType[t] || 0) + n);
  });
  const ta = Object.entries(tAcc);
  if (ta.length) L(`Accuracy by tense: ` + ta.map(([t, a]) => `${tname(t)} ${Math.round(a[0] / (a[0] + a[1]) * 100)}% (${a[0] + a[1]})`).join(" · "));
  const pm = Object.entries(pMiss).sort((a, b) => b[1] - a[1]);
  if (pm.length) L(`Mistakes by person: ` + pm.map(([p, n]) => `${p} ${n}`).join(" · "));
  const vt = Object.entries(vType).sort((a, b) => b[1] - a[1]);
  if (vt.length) L(`Kinds of verb mistakes: ` + vt.map(([t, n]) => `${MISTAKE_LABEL[t] || t} ${n}`).join(" · "));
  const verbs = Object.entries(S.learn.verbs).filter(([, v]) => (v.mh || []).length)
    .sort((a, b) => Object.values(b[1].mx).reduce((x, y) => x + y, 0) - Object.values(a[1].mx).reduce((x, y) => x + y, 0));
  if (verbs.length) {
    L(`Verbs I get wrong (verb · tense, person: what I wrote → right form [kind]):`);
    verbs.forEach(([inf, v]) => L(`${inf} · ` + v.mh.map(h => `${tname(h[1])}, ${h[2]}: "${h[3] || "—"}" → ${h[4]} [${MISTAKE_LABEL[h[5]] || h[5]}]`).join(" | ")));
  }
  if (tenseIds.length && Object.keys(vf).length) {
    // Level 0 also means "never practised": it only counts with a recorded miss.
    const weak = Object.entries(vf).map(([inf, r]) => {
      const l = String(r.l || ""), lv = S.learn.verbs[inf];
      const bad = tenseIds.map((t, i) => [t, +l[i] || 0]).filter(([t, n]) => n >= 1 && n <= 2 || n === 0 && lv && lv.t[t] && lv.t[t][1]);
      return bad.length ? `${inf} (` + bad.map(([t, n]) => `${tname(t)} ${n}/5`).join(", ") + ")" : "";
    }).filter(Boolean);
    if (weak.length) L(`Weakest verb × tense levels (0–5, from the conjugation game): ` + weak.join(" · "));
  }
  // Conjugation deck cards (fixed forms like "du möchtest").
  const cardMiss = words.filter(x => typeof conjItem === "function" && conjItem(x.w) && Object.keys(x.ws.mx || {}).length);
  if (cardMiss.length) {
    L(`Conjugation cards I miss (form · meaning · what I wrote):`);
    cardMiss.forEach(x => { const it = conjItem(x.w); L(`${conjJoin(it.pron.split("/")[0], it.ans)} (${x.w.en}) · ${wrote(x.ws) || "—"}`); });
  }

  // Cases & plurals
  const cs = (S.games && S.games.cases) || {};
  const csl = Object.entries(cs).filter(([, a]) => a && a[1]);
  if (csl.length) {
    L(``, `## CASES & GRAMMAR (right/total)`);
    const lab = typeof GRAMMAR_LABEL !== "undefined" ? GRAMMAR_LABEL : {};
    L(csl.map(([k, a]) => `${lab[k] || k} ${a[0]}/${a[1]} (${Math.round(a[0] / a[1] * 100)}%)`).join(" · "));
  }
  const caseW = words.filter(x => (x.ws.mx || {}).case);
  if (caseW.length) L(`Words I put in the wrong case: ` + caseW.map(x => `${form(x.w)} (${wrote(x.ws, ["case"]) || "—"})`).join(" · "));
  const plW = words.filter(x => (x.ws.mx || {}).plural);
  if (plW.length) L(`Plurals I get wrong: ` + plW.map(x => `${form(x.w)} → die ${x.w.pl || "?"} (${x.ws.mx.plural}×)`).join(" · "));

  // Struggling words
  L(``, `## WORDS I STRUGGLE WITH (word · meaning · stage · right/wrong · mistake types · last wrong answers)`);
  const strug = words.filter(x => _wscore(x.ws) > 1).sort((a, b) => _wscore(b.ws) - _wscore(a.ws)).slice(0, 80);
  if (!strug.length) L("None yet.");
  strug.forEach(x => {
    const ws = x.ws, gm = ws.g || [0, 0];
    const types = Object.entries(ws.mx || {}).sort((a, b) => b[1] - a[1]).map(([t, n]) => `${MISTAKE_LABEL[t] || t} ${n}`).join(", ");
    const flags = [ws.rp && "being repaired", ws.fl && "flagged", (ws.k || 1) < EASE.HARD_K && "hard for me"].filter(Boolean).join(", ");
    L(`${form(x.w)} · ${x.w.en} · ${tierOf(ws.st).name}${flags ? ` (${flags})` : ""} · ${(ws.correct || 0) + gm[0]}/${(ws.wrong || 0) + gm[1]}${types ? " · " + types : ""}${wrote(ws) ? " · " + wrote(ws) : ""}`);
  });
  if (words.filter(x => _wscore(x.ws) > 1).length > 80) L(`(more in the JSON below)`);

  // Confusions
  const conf = (S.games && S.games.confuse) || {};
  const cl = Object.entries(conf).map(([k, list]) => { const a = _learnWord(k); const bs = (list || []).map(_learnWord).filter(Boolean); return a && bs.length ? `${form(a)} ↔ ${bs.map(form).join(", ")}` : ""; }).filter(Boolean);
  words.forEach(x => hist(x.ws, ["confused", "recognition", "listening"]).forEach(h => { const o = _learnFind(h[3], x.w); const b = o && _learnWord(o); if (b) cl.push(`${form(x.w)} ↔ ${form(b)}`); }));
  if (cl.length) { L(``, `## WORDS I MIX UP`); L([...new Set(cl)].join(" · ")); }

  // New words
  L(``, `## NEW WORDS — last 14 days (by the day I met them)`);
  const byDay = {};
  met.filter(x => x.ws.metOn && x.ws.metOn >= recentFrom).forEach(x => (byDay[x.ws.metOn] = byDay[x.ws.metOn] || []).push(x));
  const days = Object.keys(byDay).sort();
  if (!days.length) L("None.");
  days.forEach(d => L(`${d}: ` + byDay[d].map(x => `${form(x.w)} = ${x.w.en} [${tierOf(x.ws.st).icon}]`).join(" · ")));

  // Learnt well
  const solid = met.filter(x => x.ws.st >= STAGE_KNOWN);
  L(``, `## WORDS I KNOW WELL (${solid.length}, 🌳 Known or better) — use them freely in exercises`);
  L(solid.length ? solid.map(x => form(x.w)).join(", ") : "None yet.");

  const json = {
    app: STORAGE_KEY, generated: new Date().toISOString(), since: S.learn.since || null,
    mistakeTypes: typeAll, softSlips: softAll,
    // Words with recorded mistakes or 3+ misses: [form, stage, right, wrong, types, slips, last misses]
    words: words.filter(x => x.ws.mx || x.ws.sf || (x.ws.wrong || 0) + (x.ws.g ? x.ws.g[1] : 0) >= 3).map(x => [form(x.w), x.ws.st || 0,
      (x.ws.correct || 0) + (x.ws.g ? x.ws.g[0] : 0), (x.ws.wrong || 0) + (x.ws.g ? x.ws.g[1] : 0), x.ws.mx || {}, x.ws.sf || {}, (x.ws.mh || []).map(h => [h[0], h[2], h[3]])]),
    verbs: S.learn.verbs, cases: cs,
  };
  return lines.join("\n") + "\n\n--- JSON ---\n" + JSON.stringify(json);
}
// How much a word troubles me: misses (recent types weigh in), slips,
// low ease and repair flags.
function _wscore(ws) {
  const mx = Object.values(ws.mx || {}).reduce((a, b) => a + b, 0);
  const gm = ws.g ? ws.g[1] : 0;
  const tot = (ws.correct || 0) + (ws.wrong || 0) + (ws.g ? ws.g[0] + ws.g[1] : 0);
  const rate = tot ? ((ws.wrong || 0) + gm) / tot : 0;
  return (ws.wrong || 0) * 0.6 + gm * 0.4 + mx * 0.5 + (ws.near || 0) * 0.3 + rate * 3 + (ws.rp || ws.fl ? 1.5 : 0) + Math.max(0, 1 - (ws.k || 1)) * 4;
}
function copyLearningReport() {
  const text = buildLearningReport();
  copyTextToClipboard(text)
    .then(() => showCelebrateToast("📚", "Learning log copied", "Paste it into your German project in Claude"))
    .catch(() => { window.prompt("Copy the learning log:", text); });
}
