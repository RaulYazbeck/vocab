// ── HINT (REDACTED EXAMPLE) ───────────────────
// Shows an example sentence in the target language with the answer
// word hidden behind a fixed-width blur — no translation and no clue
// about the word's length.
//
// The challenge: the word rarely appears letter-for-letter in the
// sentence ("die Katze, -n" vs "…eine Katze.", "gehen" vs "geht").
// Instead of any per-word fixes, every sentence token is fuzzy-matched
// against every answer token (shared stem or small edit distance).
// If the main answer token can't be confidently located, no hint is
// offered for that word — better no hint than a hint that leaks the
// answer.

function levenshtein(a, b) {
  if (a === b) return 0;
  if (!a.length) return b.length;
  if (!b.length) return a.length;
  let prev = Array.from({ length: b.length + 1 }, (_, i) => i);
  for (let i = 1; i <= a.length; i++) {
    const row = [i];
    for (let j = 1; j <= b.length; j++) {
      row[j] = Math.min(
        prev[j] + 1,
        row[j - 1] + 1,
        prev[j - 1] + (a[i - 1] === b[j - 1] ? 0 : 1)
      );
    }
    prev = row;
  }
  return prev[b.length];
}

function commonPrefixLen(a, b) {
  let i = 0;
  while (i < a.length && i < b.length && a[i] === b[i]) i++;
  return i;
}

// Does a sentence token look like an inflected form of an answer token?
function hintTokenMatches(sentenceTok, answerTok) {
  if (sentenceTok === answerTok) return true;
  // Short tokens (articles, "ja") must match exactly to avoid noise.
  if (answerTok.length < 4 || sentenceTok.length < 4) return false;
  const sim = 1 - levenshtein(sentenceTok, answerTok) / Math.max(sentenceTok.length, answerTok.length);
  if (sim >= 0.6) return true;
  // Shared stem: a long common prefix covering nearly the whole answer token.
  const pre = commonPrefixLen(sentenceTok, answerTok);
  return pre >= 4 && pre >= answerTok.length - 2;
}

// Tokens of the answer, cleaned of alternatives, parentheticals and
// plural annotations: "die Katze, -n" → ["die", "katze"].
function hintAnswerTokens(answer) {
  return answer.split("/")
    .map(alt => alt.replace(/\(.*?\)/g, " ").split(",")[0])
    .flatMap(alt => alt.split(/[^\p{L}]+/u))
    .map(t => normalize(t))
    .filter(t => t.length >= 2);
}

// Returns HTML of an example sentence with the answer word(s) redacted,
// or null when the word can't be confidently located in any example.
function buildHint(word) {
  const info = buildHintInfo(word);
  return info ? info.html : null;
}

// Same as buildHint, plus the example the redaction was built from
// (Gap Fill shows its translation and reveals the full sentence).
// tight: helper tokens (an article, a particle) are hidden only when
// they touch the main word — Gap Fill wants one gap, not a stray blank
// wherever "der" happens to appear in the sentence.
function buildHintInfo(word, tight = false) {
  if (!word || !word.examples || !word.examples.length) return null;
  const tokens = hintAnswerTokens(word[WORD_KEY]);
  if (!tokens.length) return null;
  // Longest token, ties going to the later one: for three-letter nouns
  // ("der Rat", "die Ehe") the article would otherwise win and the hint
  // would hinge on the sentence containing "der"/"die"/"das".
  const mainToken = tokens.reduce((a, b) => (b.length >= a.length ? b : a), "");

  let best = null;
  for (const ex of word.examples) {
    const sentence = ex[WORD_KEY];
    if (!sentence) continue;
    const parts = sentence.split(/(\p{L}+)/u); // odd indices = words
    const matched = new Set(), main = new Set();
    parts.forEach((part, i) => {
      if (i % 2 === 0) return;
      const norm = normalize(part);
      if (tokens.some(t => hintTokenMatches(norm, t))) {
        matched.add(i);
        if (hintTokenMatches(norm, mainToken)) main.add(i);
      }
    });
    if (!main.size) continue; // unsafe: the main word can't be hidden here
    let hidden = matched;
    if (tight) {
      // One gap: only the sentence word closest to the main token
      // ("Ich kann nicht kommen, ich bin krank" hides krank, not the
      // look-alike kann too), then grow outward through directly
      // neighbouring matches only ("s'il vous plaît", "auf Wiedersehen").
      const closeness = i => {
        const n = normalize(parts[i]);
        if (n === mainToken) return 99;
        return commonPrefixLen(n, mainToken) - levenshtein(n, mainToken);
      };
      const best = [...main].reduce((a, b) => (closeness(b) > closeness(a) ? b : a));
      // (A word of the answer itself stays: "tous" in "tous les jours" only
      // looks like "jours".)
      matched.forEach(i => { if (main.has(i) && i !== best && !tokens.includes(normalize(parts[i]))) matched.delete(i); });
      hidden = new Set([best]);
      let grew = true;
      while (grew) {
        grew = false;
        matched.forEach(i => { if (!hidden.has(i) && (hidden.has(i - 2) || hidden.has(i + 2))) { hidden.add(i); grew = true; } });
      }
    }
    let html = parts.map((part, i) => hidden.has(i) ? `<span class="hint-redacted"></span>` : part).join("");
    // tight: one blank per gap, however many words it hides — "___ ___ ___"
    // would tell you the answer is the one three-word option.
    const two = /<span class="hint-redacted"><\/span>[\s'’-]*<span class="hint-redacted"><\/span>/;
    if (tight) while (two.test(html)) html = html.replace(two, `<span class="hint-redacted"></span>`);
    // Same sentence with the hidden words highlighted (Gap Fill reveal).
    const reveal = parts.map((part, i) => hidden.has(i) ? `<mark class="hint-reveal">${part}</mark>` : part).join("");
    // The exact text that was hidden (first to last hidden word), for
    // typed sentence recall in the Path.
    const hid = [...hidden].sort((a, b) => a - b);
    const answer = parts.slice(hid[0], hid[hid.length - 1] + 1).join("");
    // before: the sentence up to the gap (Gap Fill reads the article
    // right in front of it).
    const info = { html, reveal, example: ex, answer, before: parts.slice(0, hid[0]).join("") };
    if (!tight) return info;
    // tight: prefer an example whose blanks form one group (a fuzzy
    // match like "Haben" ≈ "Abend" elsewhere adds a second, stray gap).
    const idx = [...hidden].sort((a, b) => a - b);
    let groups = 1;
    for (let k = 1; k < idx.length; k++) if (idx[k] - idx[k - 1] > 2) groups++;
    if (groups === 1) return info;
    if (!best || groups < best.groups) best = { info, groups };
  }
  return best ? best.info : null;
}

// The example's translation with the word's own meaning hidden, so a
// peek at the translation helps with the sentence without giving the
// answer away. Null when the meaning can't be found in it (then the
// translation isn't offered — better none than a leak).
const HINT_EN_STOP = /^(the|a|an|to|be|of|one|ones|oneself|someone|something|sb|sth|sich|it|up|out|off|on|in|at|for|with|and|or|is|are|get)$/;
function redactTranslation(sentence, prompt) {
  if (!sentence || !prompt) return null;
  const toks = String(prompt).replace(/\(.*?\)/g, " ").split(/[^\p{L}']+/u)
    .map(t => t.toLowerCase()).filter(t => t.length >= 2 && !HINT_EN_STOP.test(t));
  if (!toks.length) return null;
  const parts = String(sentence).split(/(\p{L}+)/u);
  let hit = false;
  const html = parts.map((part, i) => {
    if (i % 2 === 0) return escapeHtml(part);
    const n = part.toLowerCase();
    if (!HINT_EN_STOP.test(n) && toks.some(t => hintTokenMatches(n, t))) { hit = true; return `<span class="hint-redacted"></span>`; }
    return escapeHtml(part);
  }).join("");
  return hit ? html : null;
}

// ── THE CARD'S HINT WHILE IT IS ASKED ─────────
// A hint is for the rule ("verb regular", "+ Dativ"), not the word, but
// some name a form of the answer: a verb's principal parts ("lebte
// getrennt · hat getrennt gelebt", "ging · ist gegangen"), a word built
// on it. While the card asks for the German those forms are shown as
// "…"; once it is answered, revealAskHints() puts the whole hint back
// (the forms are worth reading then). The deck data stays as it is: the
// app reads the principal parts to build the verb's forms.
const ASK_HINT_KEEP = /^(verb|verbs|regular|irregular|separable|inseparable|reflexive|phrase|idiom|noun|adjective|adverb|sich|hat|ist|takes|haben|sein|präteritum|partizip|ii|no|not|also|the|and|or|with|ge)$/i;
function askHintText(w) {
  const hint = String((w && w.hint) || "");
  if (!hint || typeof WORD_KEY === "undefined" || WORD_KEY !== "de") return hint;
  const form = typeof gameForm === "function" ? gameForm(w) : String(w[WORD_KEY] || "");
  const ans = hintAnswerTokens(form).filter(t => t.length >= 3 && !/^(der|die|das|den|dem|des|ein|eine|einen|einem|sich|etwas|jemandem|jemanden)$/.test(t));
  const hide = new Set(); // character ranges [start, end) as "s:e"
  const parts = [];
  const re = /\p{L}+/gu;
  let m;
  while ((m = re.exec(hint))) parts.push({ t: m[0], s: m.index, e: m.index + m[0].length });
  // 1. A word that is a form of the answer: the same stem ("fürchtete",
  // "verletzen" for die Verletzung) or a compound with it ("Nachtdienst").
  // Not by likeness alone: the English meaning in a hint ("to help, 1st
  // sg." for helfe) must stay.
  const enToks = new Set(String(w.en || "").split(/[^\p{L}]+/u).map(t => normalize(t)).filter(Boolean));
  const stemOf = (n, a) => n === a || (a.length >= 4 && n.includes(a)) || (commonPrefixLen(n, a) >= 4 && commonPrefixLen(n, a) >= a.length - 2);
  parts.forEach((p, i) => {
    const n = normalize(p.t);
    if (ASK_HINT_KEEP.test(p.t) || enToks.has(n) || /ing$/.test(n) || (i > 0 && /^to$/i.test(parts[i - 1].t))) return;
    if (ans.some(a => stemOf(n, normalize(a)))) hide.add(p);
  });
  // 2. Principal parts: "<Präteritum> · hat|ist [sich] <Partizip II>" and "(hing · gehangen)".
  const inRange = (s, e) => parts.filter(p => p.s >= s && p.e <= e && !ASK_HINT_KEEP.test(p.t)).forEach(p => hide.add(p));
  const pp = /(?:^|·|—|\()\s*([^·—()]*?)\s*·\s*(?:hat|ist)\s+(?:sich\s+)?([^·—()]+?)\s*(?=$|·|\)|,)/gu;
  while ((m = pp.exec(hint))) {
    const at = m.index + m[0].indexOf(m[1]);
    if (m[1] && !/\b(verb|regular|irregular|separable|phrase|idiom|noun|präteritum|partizip)\b/i.test(m[1])) inRange(at, at + m[1].length);
    const at2 = m.index + m[0].lastIndexOf(m[2]);
    inRange(at2, at2 + m[2].length);
  }
  const pair = /\(\s*(\p{L}+)\s*·\s*(\p{L}+)\s*\)/gu;
  while ((m = pair.exec(hint))) inRange(m.index, m.index + m[0].length);
  // 3. A noun is asked with its article, so the hint must not tell the
  // gender: "masculine noun — no plural" → "noun — no plural", and the
  // answer's own article elsewhere in it ("short for der …") is hidden.
  const art = (form.match(/^(der|die|das)\s/i) || [])[1];
  if (art && /n-declension/i.test(hint)) hide.add({ s: -1, e: -1, t: "" }); // the rebuild drops it below
  if (art) parts.forEach(p => {
    if (/^(masculine|feminine|neuter|masc|fem|neut)$/i.test(p.t) || p.t.toLowerCase() === art.toLowerCase()) hide.add(p);
  });
  if (!hide.size) return hint;
  // Rebuild, one "…" for a run of hidden words ("lebte getrennt" → "…").
  let out = "", pos = 0, lastHidden = false;
  parts.forEach(p => {
    const gap = hint.slice(pos, p.s);
    if (hide.has(p)) {
      if (lastHidden && /^\s*$/.test(gap)) { pos = p.e; return; }
      out += gap + "…"; lastHidden = true;
    } else { out += gap + p.t; lastHidden = false; }
    pos = p.e;
  });
  out += hint.slice(pos);
  // "… noun" reads oddly: a hidden gender before "noun" is just dropped.
  // "n-declension" all but says masculine: it waits for the answer too.
  return art ? out.replace(/…\s+(?=noun\b)/gi, "").replace(/\s*[—·]\s*n-declension\b/gi, "").replace(/(^|[·—]\s*)…,\s*/g, "$1") : out;
}
// The hint as HTML for a card that is being asked; revealAskHints()
// shows the full one in its place after the answer.
function askHintHtml(w) {
  const full = String((w && w.hint) || ""), shown = askHintText(w);
  if (shown === full) return escapeHtml(full);
  return `<span class="ask-hint" data-full="${escapeHtml(full)}">${escapeHtml(shown)}</span>`;
}
function revealAskHints(root) {
  (root || document).querySelectorAll(".ask-hint[data-full]").forEach(el => {
    el.textContent = el.getAttribute("data-full");
    el.removeAttribute("data-full");
  });
}
