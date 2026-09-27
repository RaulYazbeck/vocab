// ── GAME: SPEED BLITZ ─────────────────────────
// Rapid-fire multiple-choice questions against the clock, alternating
// direction (prompt → target, then target → prompt) for words you know
// well enough. Streaks raise a ×2/×3/×4 multiplier; a miss costs time
// and the streak (half for a 🌱 new word, which also always gets three
// options and the easy direction).
//
// Ranks: less time, more options on known words, bigger penalties; at
// 💎 Diamond the prompt is spoken instead of shown (when sound is on).

registerGame({
  id: "blitz", name: "Speed Blitz", icon: "⚡", skill: "Recognition · both ways", timed: true,
  ranks: [
    { limit: 60000, options: 4, pen: 2000 },
    { limit: 55000, options: 5, pen: 2500 },
    { limit: 50000, options: 5, pen: 3000 },
    { limit: 45000, options: 6, pen: 3500 },
    { limit: 45000, options: 6, pen: 4000, audio: true },
  ],
  twists: ["mirror", "golden", "turbo", "sudden"], credit: "recognition",
  howTo: [
    "Pick the right translation — as many as you can before time runs out.",
    "Questions alternate direction for words you know; 🌱 new words stay easy.",
    "Streaks multiply your points (×2 at 5, ×3 at 10, ×4 at 20). A miss costs seconds — half for new words.",
    "Keys 1–6 work too.",
  ],
  requirement(pool) {
    const n = distinctCount(pool);
    return n >= 4 ? { ok: true } : { ok: false, reason: `Needs 4 words — you have ${n}` };
  },
  stars: [150, 300, 480],
  start(ctx) {
    const rp = ctx.rp;
    const limit = ctx.rounds(rp.limit, 30000, 20000) * ctx.timeScale;
    let words = sampleWords(ctx.pool, 60), qi = 0;
    let score = 0, combo = 0, maxCombo = 0, correct = 0, wrong = 0, fast = 0, lastSec = 99;
    let q = null;
    const spoken = !!rp.audio && ctx.size === "full" && audioOk();

    const next = () => {
      if (ctx.finished) return;
      if (qi >= words.length) { words = sampleWords(ctx.pool, 60); qi = 0; }
      const w = words[qi++];
      const f = ctx.fmt(w);
      let reverse = f.reverse && qi % 2 === 0; // show target, pick the meaning
      if (ctx.mirror && f.reverse) reverse = !reverse;
      const text = x => reverse ? gamePrompt(x) : gameForm(x);
      const n = Math.min(f.options, 6);
      const opts = shuffle([{ text: text(w), correct: true, word: w },
        ...pickDistractors(w, ctx.pool, n - 1).map(x => ({ text: text(x), correct: false, word: x }))]);
      q = { w, opts, at: performance.now() };
      ctx.busy = false;
      const shown = reverse ? gameForm(w) : gamePrompt(w);
      const hideText = spoken && reverse;
      ctx.stage.innerHTML = `
        <div class="g-question g-enter">
          <div class="g-q-label">${reverse ? (hideText ? "Listen — what does it mean?" : "What does it mean?") : "Translate"}${ctx.tag(w)}</div>
          <div class="g-q-word ${reverse ? "target" : ""}">${hideText ? `<button class="l-play blitz-say" id="bz-say" aria-label="Say it again">🔊</button>` : escapeHtml(shown)}</div>
        </div>
        ${mcOptionsHtml(opts, opts.length > 4 ? "six" : "")}`;
      if (hideText) {
        speak(gameForm(w));
        const b = document.getElementById("bz-say"); if (b) b.onclick = () => speak(gameForm(w));
      }
    };

    const answer = i => {
      if (!q || ctx.busy || ctx.paused || ctx.finished) return;
      const opt = q.opts[i];
      if (!opt) return;
      ctx.busy = true;
      const btn = ctx.stage.querySelector(`.g-opt[data-i="${i}"]`);
      mcReveal(ctx.stage, q.opts, i);
      if (opt.correct) {
        correct++; combo++; maxCombo = Math.max(maxCombo, combo);
        if (performance.now() - q.at < 2000) fast++;
        const pts = ctx.award(q.w, 10 * comboMult(combo));
        score += pts;
        ctx.hit(q.w);
        floatScore(btn, "+" + pts, ctx.isGolden(q.w) ? "gold" : "");
        if (combo >= 5) playCombo(combo); else playPop();
        if ([5, 10, 20].includes(combo)) showComboFlash(combo);
        haptic("select");
        ctx.say("Correct!");
        gTimeout(next, 260);
      } else {
        wrong++;
        const cost = ctx.cost(q.w);
        combo = ctx.comboAfterMiss(combo, q.w);
        const pen = Math.round(rp.pen * cost);
        ctx.clock.add(pen);
        floatScore(btn, `−${(pen / 1000).toFixed(pen % 1000 ? 1 : 0)}s`, "bad");
        shakeEl(btn); playMiss(); haptic("miss");
        ctx.missed(q.w);
        ctx.say(`Answer: ${q.opts.find(o => o.correct).text}`);
        if (ctx.sudden) { gTimeout(end, 850); }
        else gTimeout(next, 850);
      }
      ctx.setScore(score); ctx.setCombo(combo);
      if (ctx.size === "bonus" && correct >= 6) end();
    };

    const end = () => ctx.finish({ score, correct, wrong, maxCombo, cleared: ctx.size === "bonus" ? correct >= 6 : true, stats: { fast } });

    gListen(ctx.stage, "click", e => { const b = e.target.closest(".g-opt"); if (b) answer(+b.dataset.i); });
    ctx.onKey = e => { const i = digitKey(e, q ? q.opts.length : 4); if (i >= 0) { e.preventDefault(); answer(i); } };

    gInterval(() => {
      if (ctx.finished) return;
      const left = Math.max(0, limit - ctx.clock.elapsed());
      const sec = Math.ceil(left / 1000);
      ctx.setBar(left / limit, left < 5000 ? "urgent" : "");
      ctx.setClock(sec + "s", left < 5000);
      if (sec !== lastSec && sec <= 5 && sec > 0 && !ctx.paused) playTick();
      lastSec = sec;
      if (left <= 0) end();
    }, 100);

    ctx.setScore(0);
    next();
  },
});
