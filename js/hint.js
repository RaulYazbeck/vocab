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
      // Grow outward from the main word through directly neighbouring
      // matches only ("s'il vous plaît", "auf Wiedersehen").
      hidden = new Set(main);
      let grew = true;
      while (grew) {
        grew = false;
        matched.forEach(i => { if (!hidden.has(i) && (hidden.has(i - 2) || hidden.has(i + 2))) { hidden.add(i); grew = true; } });
      }
    }
    const html = parts.map((part, i) => hidden.has(i) ? `<span class="hint-redacted"></span>` : part).join("");
    // Same sentence with the hidden words highlighted (Gap Fill reveal).
    const reveal = parts.map((part, i) => hidden.has(i) ? `<mark class="hint-reveal">${part}</mark>` : part).join("");
    // The exact text that was hidden (first to last hidden word), for
    // typed sentence recall in the Path.
    const hid = [...hidden].sort((a, b) => a - b);
    const answer = parts.slice(hid[0], hid[hid.length - 1] + 1).join("");
    const info = { html, reveal, example: ex, answer };
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
