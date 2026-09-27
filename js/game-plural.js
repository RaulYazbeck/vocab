// ── GAME: PLURAL HUNT (German only) ───────────
// See a singular noun, pick its plural. The real plural comes from the
// `pl` field (A1–B1) or the JM-style annotation ("die Katze, -n");
// distractors are generated from genuine German plural patterns so
// they all look plausible.

function umlautize(noun) {
  const map = { a: "ä", o: "ö", u: "ü", A: "Ä", O: "Ö", U: "Ü" };
  const m = noun.match(/^(.*?)(au|Au|a|o|u|A|O|U)([^aeiouäöüAEIOUÄÖÜ]*e?[^aeiouäöüAEIOUÄÖÜ]*)$/);
  if (!m) return noun;
  const v = m[2].length === 2 ? map[m[2][0]] + "u" : map[m[2]];
  return m[1] + v + m[3];
}
function pluralDistractors(noun, real) {
  const U = umlautize(noun);
  const endsE = /e$/.test(noun);
  const cands = [
    noun, noun + "e", noun + (endsE ? "n" : "en"), noun + "n", noun + "er", noun + "s",
    U + "e", U + "er", U, /in$/.test(noun) ? noun + "nen" : null, endsE ? noun + "s" : noun + "es",
  ];
  const seen = new Set([real.toLowerCase()]);
  return shuffle(cands.filter(c => {
    if (!c || !/^[\p{L}-]+$/u.test(c) || seen.has(c.toLowerCase())) return false;
    seen.add(c.toLowerCase()); return true;
  }));
}
const _pluralCache = new Map();
_gameCacheClearers.push(() => _pluralCache.clear());
function pluralItem(word) {
  const k = word[WORD_KEY] + "|" + (word.hint || "") + "|" + (word.pl || "");
  if (!_pluralCache.has(k)) _pluralCache.set(k, _pluralItem(word));
  return _pluralCache.get(k);
}
function _pluralItem(word) {
  const np = nounParts(word);
  if (!np) return null;
  const pl = germanPluralNoun(word);
  if (!pl || !/^[\p{L}-]+$/u.test(pl)) return null;
  const others = pluralDistractors(np.noun, pl);
  if (others.length < 3) return null;
  return { np, pl, others };
}
function pluralWords(pool) { return dedupeWords(pool.filter(w => pluralItem(w))); }

if (!IS_FRENCH_APP) registerGame({
  id: "plural", name: "Plural Hunt", icon: "🔢", skill: "Grammar · plurals",
  howTo: [
    "You see a noun in the singular. Pick its plural.",
    "The wrong answers follow real German patterns (-e, -en, -er, -s, umlauts…) — trust your ear!",
    "Streaks add bonus points. Keys 1–4 work too.",
  ],
  requirement(pool) {
    const n = pluralWords(pool).length;
    return n >= 4 ? { ok: true } : { ok: false, reason: `Needs 4 nouns with plurals — you have ${n}` };
  },
  stars: [70, 120, 160],
  start(ctx) {
    const total = ctx.rounds(10, 5, 5);
    const eligible = pluralWords(ctx.pool);
    const words = sampleWords(eligible, total);
    let r = 0, score = 0, combo = 0, maxCombo = 0, correct = 0, wrong = 0, q = null;

    const round = () => {
      if (r >= words.length) { ctx.finish({ score, correct, wrong, maxCombo }); return; }
      const w = words[r++];
      const item = pluralItem(w);
      const opts = shuffle([{ text: "die " + item.pl, correct: true },
        ...shuffle(item.others.slice()).slice(0, 3).map(o => ({ text: "die " + o, correct: false }))]);
      q = { w, item, opts };
      ctx.setBar((r - 1) / words.length, "progress");
      ctx.setClock(`${r}/${words.length}`);
      ctx.stage.innerHTML = `
        <div class="g-question g-enter">
          <div class="g-q-label">One → many</div>
          <div class="g-q-word target"><span class="${genderClass(item.np.answer)}-text">${escapeHtml(item.np.full)}</span></div>
          <div class="g-q-sub">${escapeHtml(gamePrompt(w))}</div>
          <div class="pl-arrow">↓ plural</div>
        </div>
        ${mcOptionsHtml(opts, "mono")}`;
      ctx.busy = false;
    };

    const answer = i => {
      if (!q || ctx.busy || ctx.finished) return;
      ctx.busy = true;
      const btn = ctx.stage.querySelector(`.g-opt[data-i="${i}"]`);
      mcReveal(ctx.stage, q.opts, i);
      const realText = "die " + q.item.pl;
      speak(realText);
      if (q.opts[i].correct) {
        correct++; combo++; maxCombo = Math.max(maxCombo, combo);
        const pts = 10 + Math.min(combo - 1, 5) * 2;
        score += pts;
        floatScore(btn, "+" + pts);
        if (combo >= 3) playCombo(combo); else playPop();
        ctx.say(`Correct — ${q.item.np.full} → ${realText}`);
        gTimeout(round, 1000);
      } else {
        wrong++; combo = 0;
        shakeEl(btn); playMiss(); buzz(40);
        ctx.missed(q.w);
        ctx.say(`${q.item.np.full} → ${realText}`);
        gTimeout(round, 1800);
      }
      ctx.setScore(score); ctx.setCombo(combo);
    };

    gListen(ctx.stage, "click", e => { const b = e.target.closest(".g-opt"); if (b) answer(+b.dataset.i); });
    ctx.onKey = e => { const i = digitKey(e, 4); if (i >= 0) { e.preventDefault(); answer(i); } };
    ctx.setScore(0);
    round();
  },
});
