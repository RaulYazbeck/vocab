// ── GAME: GAP FILL ────────────────────────────
// An example sentence with the word blanked out; pick the word that
// fits. The blank comes from buildHintInfo() (hint.js), which only
// succeeds when the word can be located and hidden safely — words where
// it can't are simply not used.

const _clozeCache = new Map();
_gameCacheClearers.push(() => _clozeCache.clear());
function clozeInfo(word) {
  const k = wordKey(word) + "|" + word[WORD_KEY] + "|" + ((word.examples && word.examples[0] && word.examples[0][WORD_KEY]) || "");
  if (!_clozeCache.has(k)) _clozeCache.set(k, buildHintInfo(word, true));
  return _clozeCache.get(k);
}
function clozeWords(pool) { return dedupeWords(pool.filter(w => clozeInfo(w))); }

registerGame({
  id: "cloze", name: "Gap Fill", icon: "🕳️", skill: "Words in context",
  howTo: [
    "A sentence is missing a word. Pick the one that fits.",
    "The sentence may use a different form (e.g. <em>geht</em> for <em>gehen</em>) — pick the dictionary form.",
    "Need help? Show the translation (costs the bonus). Keys 1–4 work too.",
  ],
  requirement(pool) {
    const n = clozeWords(pool).length;
    return n >= 4 ? { ok: true } : { ok: false, reason: `Needs 4 words with example sentences — you have ${n}` };
  },
  stars: [70, 110, 140],
  start(ctx) {
    const total = ctx.rounds(10, 5, 5);
    const words = sampleWords(clozeWords(ctx.pool), total);
    let r = 0, score = 0, combo = 0, maxCombo = 0, correct = 0, wrong = 0, q = null, peeked = false;

    const round = () => {
      if (r >= words.length) { ctx.finish({ score, correct, wrong, maxCombo }); return; }
      const w = words[r++];
      const info = clozeInfo(w);
      const opts = shuffle([{ text: gameForm(w), correct: true },
        ...pickDistractors(w, ctx.pool, 3).map(x => ({ text: gameForm(x), correct: false }))]);
      q = { w, info, opts };
      peeked = false;
      ctx.setBar((r - 1) / words.length, "progress");
      ctx.setClock(`${r}/${words.length}`);
      ctx.stage.innerHTML = `
        <div class="cz-card g-enter">
          <div class="g-q-label">Which word fits?</div>
          <div class="cz-sentence" id="cz-sentence">${info.html}</div>
          <button class="g-link-btn cz-peek" id="cz-peek">Show translation</button>
          <div class="cz-trans" id="cz-trans" style="display:none">${escapeHtml(info.example.en || "")}</div>
        </div>
        ${mcOptionsHtml(opts)}`;
      document.getElementById("cz-peek").onclick = () => {
        peeked = true;
        document.getElementById("cz-trans").style.display = "";
        document.getElementById("cz-peek").style.display = "none";
      };
      ctx.busy = false;
    };

    const answer = i => {
      if (!q || ctx.busy || ctx.finished) return;
      ctx.busy = true;
      const btn = ctx.stage.querySelector(`.g-opt[data-i="${i}"]`);
      mcReveal(ctx.stage, q.opts, i);
      const sentence = q.info.example[WORD_KEY];
      const sEl = document.getElementById("cz-sentence");
      if (sEl) { sEl.innerHTML = q.info.reveal; sEl.classList.add(q.opts[i].correct ? "ok" : "bad"); }
      const tr = document.getElementById("cz-trans"), pk = document.getElementById("cz-peek");
      if (tr) tr.style.display = ""; if (pk) pk.style.display = "none";
      speak(sentence);
      if (q.opts[i].correct) {
        correct++; combo++; maxCombo = Math.max(maxCombo, combo);
        const pts = 10 + (peeked ? 0 : 5);
        score += pts;
        floatScore(btn, "+" + pts);
        playPop();
        ctx.say("Correct!");
        gTimeout(round, 1500);
      } else {
        wrong++; combo = 0;
        shakeEl(btn); playMiss(); buzz(40);
        ctx.missed(q.w);
        ctx.say(`It was ${gameForm(q.w)}`);
        gTimeout(round, 2300);
      }
      ctx.setScore(score); ctx.setCombo(combo);
    };

    gListen(ctx.stage, "click", e => { const b = e.target.closest(".g-opt"); if (b) answer(+b.dataset.i); });
    ctx.onKey = e => { const i = digitKey(e, 4); if (i >= 0) { e.preventDefault(); answer(i); } };
    ctx.setScore(0);
    round();
  },
});
