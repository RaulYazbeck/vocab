// ── GAME: SPEED BLITZ ─────────────────────────
// Rapid-fire 4-option questions against the clock, alternating
// direction (prompt → target, then target → prompt). Streaks raise a
// ×2/×3/×4 multiplier; a wrong answer costs 2 seconds and the streak.

registerGame({
  id: "blitz", name: "Speed Blitz", icon: "⚡", skill: "Recognition · both ways", timed: true,
  howTo: [
    "Pick the right translation — as many as you can before time runs out.",
    "Questions alternate direction every round.",
    "Streaks multiply your points (×2 at 5, ×3 at 10, ×4 at 20). A miss costs 2 seconds.",
    "Keys 1–4 work too.",
  ],
  requirement(pool) {
    const n = distinctCount(pool);
    return n >= 4 ? { ok: true } : { ok: false, reason: `Needs 4 words — you have ${n}` };
  },
  stars: [150, 300, 480],
  start(ctx) {
    const limit = ctx.rounds(60000, 30000, 20000);
    let words = sampleWords(ctx.pool, 60), qi = 0;
    let score = 0, combo = 0, maxCombo = 0, correct = 0, wrong = 0, lastSec = 99;
    let q = null;

    const next = () => {
      if (ctx.finished) return;
      if (qi >= words.length) { words = sampleWords(ctx.pool, 60); qi = 0; }
      const w = words[qi++];
      const reverse = qi % 2 === 0; // show target, pick the meaning
      const text = x => reverse ? gamePrompt(x) : gameForm(x);
      const opts = shuffle([{ text: text(w), correct: true, word: w },
        ...pickDistractors(w, ctx.pool, 3).map(x => ({ text: text(x), correct: false, word: x }))]);
      q = { w, opts };
      ctx.busy = false;
      ctx.stage.innerHTML = `
        <div class="g-question g-enter">
          <div class="g-q-label">${reverse ? "What does it mean?" : "Translate"}</div>
          <div class="g-q-word ${reverse ? "target" : ""}">${escapeHtml(reverse ? gameForm(w) : gamePrompt(w))}</div>
        </div>
        ${mcOptionsHtml(opts)}`;
    };

    const answer = i => {
      if (!q || ctx.busy || ctx.paused || ctx.finished) return;
      ctx.busy = true;
      const opt = q.opts[i];
      const btn = ctx.stage.querySelector(`.g-opt[data-i="${i}"]`);
      mcReveal(ctx.stage, q.opts, i);
      if (opt.correct) {
        correct++; combo++; maxCombo = Math.max(maxCombo, combo);
        const pts = 10 * comboMult(combo);
        score += pts;
        floatScore(btn, "+" + pts);
        if (combo >= 5) playCombo(combo); else playPop();
        if ([5, 10, 20].includes(combo)) showComboFlash(combo);
        ctx.say("Correct!");
        gTimeout(next, 260);
      } else {
        wrong++; combo = 0;
        ctx.clock.add(2000);
        floatScore(btn, "−2s", "bad");
        shakeEl(btn); playMiss(); buzz(40);
        ctx.missed(q.w);
        ctx.say(`Answer: ${q.opts.find(o => o.correct).text}`);
        gTimeout(next, 850);
      }
      ctx.setScore(score); ctx.setCombo(combo);
      if (ctx.size === "bonus" && correct >= 6) end();
    };

    const end = () => ctx.finish({ score, correct, wrong, maxCombo, cleared: ctx.size === "bonus" ? correct >= 6 : true });

    gListen(ctx.stage, "click", e => { const b = e.target.closest(".g-opt"); if (b) answer(+b.dataset.i); });
    ctx.onKey = e => { const i = digitKey(e, 4); if (i >= 0) { e.preventDefault(); answer(i); } };

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
