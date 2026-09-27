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
  id: "cloze", name: "Gap Fill", icon: "🕳️", skill: "Words in context", credit: "recognition",
  ranks: [
    { peek: true }, { peek: true }, { peek: false }, { peek: false, typed: true }, { peek: false, typed: true, options: 5 },
  ],
  twists: ["golden", "sudden"],
  howTo: [
    "A sentence is missing a word. Pick the one that fits.",
    "The sentence may use a different form (e.g. <em>geht</em> for <em>gehen</em>) — pick the dictionary form.",
    "Need help? Show the translation (costs the bonus; gone from 🥇 Gold). From 💠 Platinum, type the missing word yourself.",
    "A wrong answer costs points (half for 🌱 new words). Keys 1–4 work too.",
  ],
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
    const done = () => ctx.finish({ score, correct, wrong, maxCombo, typedCorrect: typedOk, stats: { noPeek } });

    const round = () => {
      if (r >= words.length) { done(); return; }
      const w = words[r++];
      const info = clozeInfo(w);
      const f = ctx.fmt(w);
      const typed = !!rp.typed && f.typed && ctx.size === "full" && !!info.answer;
      const n = Math.min(f.options, 5);
      const opts = typed ? [] : shuffle([{ text: gameForm(w), correct: true },
        ...pickDistractors(w, ctx.pool, n - 1).map(x => ({ text: gameForm(x), correct: false }))]);
      q = { w, info, opts, typed };
      peeked = false;
      ctx.setBar((r - 1) / words.length, "progress");
      ctx.setClock(`${r}/${words.length}`);
      const peekOk = rp.peek !== false || ctx.size !== "full";
      ctx.stage.innerHTML = `
        <div class="cz-card g-enter">
          <div class="g-q-label">${typed ? "Type the missing word" : "Which word fits?"}${ctx.tag(w)}</div>
          <div class="cz-sentence" id="cz-sentence">${info.html}</div>
          ${typed ? `<div class="cz-trans">(${escapeHtml(gamePrompt(w))})</div>` : ""}
          ${peekOk ? `<button class="g-link-btn cz-peek" id="cz-peek">Show translation</button>` : ""}
          <div class="cz-trans" id="cz-trans" style="display:none">${escapeHtml(info.example.en || "")}</div>
        </div>
        ${typed ? gTypedHtml("the word as it appears…") : mcOptionsHtml(opts)}`;
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
      if (sEl) { sEl.innerHTML = q.info.reveal; sEl.classList.add(ok ? "ok" : "bad"); }
      const tr = document.getElementById("cz-trans"), pk = document.getElementById("cz-peek");
      if (tr) tr.style.display = ""; if (pk) pk.style.display = "none";
      speak(q.info.example[WORD_KEY]);
    };
    const good = (btn, base) => {
      correct++; combo++; maxCombo = Math.max(maxCombo, combo);
      if (!peeked) noPeek++;
      const pts = ctx.award(q.w, base + (peeked ? 0 : 5));
      score += pts;
      floatScore(btn, "+" + pts, ctx.isGolden(q.w) ? "gold" : "");
      playPop(); haptic("select");
      ctx.say("Correct!");
      gTimeout(round, 1500);
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
      gTimeout(ctx.sudden ? done : round, 2300);
    };

    const answer = i => {
      if (!q || q.typed || ctx.busy || ctx.finished) return;
      if (!q.opts[i]) return;
      ctx.busy = true;
      const btn = ctx.stage.querySelector(`.g-opt[data-i="${i}"]`);
      mcReveal(ctx.stage, q.opts, i);
      reveal(q.opts[i].correct);
      if (q.opts[i].correct) { ctx.hit(q.w); good(btn, 10); } else bad(btn);
      ctx.setScore(score); ctx.setCombo(combo);
    };
    const answerTyped = v => {
      if (!q || !q.typed || ctx.busy || ctx.finished) return;
      ctx.busy = true;
      const input = document.getElementById("g-typed");
      const res = gradeTyped(v, [q.info.answer]);
      reveal(res === true);
      if (res === true) { typedOk++; ctx.hit(q.w, "recall"); if (input) input.classList.add("correct"); good(input, 15); }
      else if (res === "near" || gradeTyped(v, [gameForm(q.w), q.w[WORD_KEY]]) === true) {
        if (input) input.classList.add("near");
        ctx.say(res === "near" ? "Almost — check the spelling" : `Right word — here it's ${q.info.answer}`);
        gTimeout(round, 2000);
      } else { if (input) input.classList.add("wrong"); bad(input); }
      ctx.setScore(score); ctx.setCombo(combo);
    };

    gListen(ctx.stage, "click", e => { const b = e.target.closest(".g-opt"); if (b) answer(+b.dataset.i); });
    ctx.onKey = e => { const i = digitKey(e, q && q.opts.length ? q.opts.length : 4); if (i >= 0) { e.preventDefault(); answer(i); } };
    ctx.setScore(0);
    round();
  },
});
