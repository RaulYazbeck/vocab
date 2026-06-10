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
  if (!word || !word.examples || !word.examples.length) return null;
  const tokens = hintAnswerTokens(word[WORD_KEY]);
  if (!tokens.length) return null;
  const mainToken = tokens.reduce((a, b) => (b.length > a.length ? b : a), "");

  for (const ex of word.examples) {
    const sentence = ex[WORD_KEY];
    if (!sentence) continue;
    const parts = sentence.split(/(\p{L}+)/u); // odd indices = words
    let hidMain = false;
    const out = parts.map((part, i) => {
      if (i % 2 === 0) return part;
      const norm = normalize(part);
      if (tokens.some(t => hintTokenMatches(norm, t))) {
        if (hintTokenMatches(norm, mainToken)) hidMain = true;
        return `<span class="hint-redacted"></span>`;
      }
      return part;
    }).join("");
    if (hidMain) return out; // safe: the main word is hidden
  }
  return null;
}
