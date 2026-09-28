// ── GAME: TRUE / FALSE FLASH ──────────────────
// A word and a translation flash up: is the pair right? Swipe right for
// true, left for false (or tap ✓ / ✗, or ← →). About half the pairs are
// false, built from real distractors. Very quick — a perfect warm-up.
//
// Credit: only a right "true" earns recognition credit (a correct
// "false" says little about the word). Saying true to a wrong pair — or
// false to a right one — flags the shown word for a typed check. A miss
// costs time (half for a 🌱 new word).

registerGame({
  id: "truefalse", name: "True or False", icon: "✅", skill: "Recognition · lightning", timed: true, credit: "recognition",
  ranks: [
    { limit: 45000, pen: 1500 }, { limit: 42000, pen: 2000 }, { limit: 40000, pen: 2500 },
    { limit: 36000, pen: 3000 }, { limit: 32000, pen: 3500 },
  ],
  twists: ["mirror", "golden", "turbo", "sudden"],
  howTo: ["Do the word and the translation match? Tap ✓ or ✗ — or swipe."],
  requirement(pool) {
    const n = distinctCount(pool);
    return n >= 4 ? { ok: true } : { ok: false, reason: `Needs 4 words — you have ${n}` };
  },
  stars: [120, 260, 420],
  start(ctx) {
    const rp = ctx.rp;
    const limit = ctx.rounds(rp.limit, 30000, 20000) * ctx.timeScale;
    let words = sampleWords(ctx.pool, 60), qi = 0;
    let score = 0, combo = 0, maxCombo = 0, correct = 0, wrong = 0, lastSec = 99, q = null;

    ctx.stage.innerHTML = `
      <div class="tf-wrap">
        <div class="tf-card g-enter" id="tf-card">
          <div class="tf-top" id="tf-top"></div>
          <div class="tf-eq">=</div>
          <div class="tf-bot" id="tf-bot"></div>
          <div class="tf-stamp" id="tf-stamp"></div>
        </div>
        <div class="tf-hint">← false · swipe · true →</div>
      </div>
      <div class="tf-btns">
        <button class="tf-btn no" id="tf-no" aria-label="False">✗</button>
        <button class="tf-btn yes" id="tf-yes" aria-label="True">✓</button>
      </div>`;
    const card = document.getElementById("tf-card");
    const top = document.getElementById("tf-top"), bot = document.getElementById("tf-bot"), stamp = document.getElementById("tf-stamp");

    const end = () => ctx.finish({ score, correct, wrong, maxCombo, cleared: ctx.size === "bonus" ? correct >= 8 : true });
    const next = () => {
      if (ctx.finished) return;
      if (qi >= words.length) { words = sampleWords(ctx.pool, 60); qi = 0; }
      const w = words[qi++];
      const f = ctx.fmt(w);
      const truth = Math.random() < 0.5;
      // False pairs: for words you know, a near miss — the wrong article
      // (~40% of nouns) or the most look-alike / mixed-up word.
      let other = null, trap = null;
      if (!truth) {
        const t = !f.rookie && Math.random() < 0.4 ? articleTrap(w) : null;
        if (t) trap = t;
        else other = pickDistractors(w, ctx.pool, 1, gameForm, null, { hard: !f.rookie })[0] || null;
      }
      const isTrue = truth || (!other && !trap);
      const shownForm = isTrue ? gameForm(w) : trap || gameForm(other);
      q = { w, truth: isTrue, shownForm, other, trap };
      ctx.teach("");
      const promptHtml = escapeHtml(gamePrompt(w)) + ctx.tag(w);
      const formHtml = `<span class="tf-target">${colorArticleHtml(shownForm)}</span>`;
      top.innerHTML = ctx.mirror ? formHtml : promptHtml;
      bot.innerHTML = ctx.mirror ? promptHtml : formHtml;
      card.className = "tf-card g-enter";
      card.style.transform = "";
      stamp.textContent = "";
      ctx.busy = false;
    };
    const answer = said => {
      if (!q || ctx.busy || ctx.paused || ctx.finished) return;
      ctx.busy = true;
      const ok = said === q.truth;
      card.classList.add(said ? "fly-right" : "fly-left");
      stamp.textContent = ok ? "✓" : "✗";
      card.classList.add(ok ? "good" : "bad");
      if (ok) {
        correct++; combo++; maxCombo = Math.max(maxCombo, combo);
        if (q.truth) ctx.hit(q.w);
        const pts = ctx.award(q.w, 10 * comboMult(combo));
        score += pts;
        floatScore(card, "+" + pts, ctx.isGolden(q.w) ? "gold" : "");
        if (combo >= 5) playCombo(combo); else playPop();
        haptic("select");
        ctx.say("Right!");
        gTimeout(next, 230);
      } else {
        wrong++;
        combo = ctx.comboAfterMiss(combo, q.w);
        const pen = Math.round(rp.pen * ctx.cost(q.w));
        ctx.clock.add(pen);
        ctx.missed(q.w);
        floatScore(card, `−${(pen / 1000).toFixed(1)}s`, "bad");
        playMiss(); haptic("miss");
        ctx.say(`${gamePrompt(q.w)} = ${gameForm(q.w)}`);
        bot.innerHTML = `<span class="tf-target">${colorArticleHtml(gameForm(q.w))}</span>`;
        if (q.other) recordConfusion(q.w, q.other);
        const why = q.truth ? `<div class="g-teach-sub">✓ That pair was right.</div>`
          : q.trap ? `<div class="g-teach-sub">✗ <s>${escapeHtml(q.trap)}</s> — wrong article.${GR_DE ? " " + genderRuleHtml(nounParts(q.w).noun, nounParts(q.w).answer) : ""}</div>`
          : q.other ? `<div class="g-teach-sub">✗ ${colorArticleHtml(gameForm(q.other))} = ${escapeHtml(gamePrompt(q.other))}</div>` : "";
        ctx.teach(wordLessonHtml(q.w, null, why), "bad");
        ctx.waitContinue(ctx.sudden ? end : next, ctx.sudden ? "See results" : "Continue");
      }
      ctx.setScore(score); ctx.setCombo(combo);
      if (ctx.size === "bonus" && correct >= 8) gTimeout(end, 250);
    };

    // Swipe the card: horizontal drag, decided past 70px.
    let sw = null;
    gListen(card, "pointerdown", e => { if (!ctx.busy) sw = { x: e.clientX, id: e.pointerId }; });
    gListen(window, "pointermove", e => {
      if (!sw || e.pointerId !== sw.id || ctx.busy) return;
      const dx = e.clientX - sw.x;
      card.style.transform = `translateX(${dx}px) rotate(${dx / 20}deg)`;
      card.classList.toggle("lean-right", dx > 30); card.classList.toggle("lean-left", dx < -30);
    });
    const release = e => {
      if (!sw || e.pointerId !== sw.id) return;
      const dx = e.clientX - sw.x;
      sw = null;
      card.classList.remove("lean-right", "lean-left");
      if (Math.abs(dx) > 70) { if (ctx.dragN !== undefined) ctx.dragN++; else ctx.dragN = 1; answer(dx > 0); }
      else card.style.transform = "";
    };
    gListen(window, "pointerup", release);
    gListen(window, "pointercancel", () => { sw = null; card.style.transform = ""; });
    document.getElementById("tf-yes").onclick = () => answer(true);
    document.getElementById("tf-no").onclick = () => answer(false);
    ctx.onKey = e => {
      if (e.key === "ArrowRight" || e.key === "2") { e.preventDefault(); answer(true); }
      else if (e.key === "ArrowLeft" || e.key === "1") { e.preventDefault(); answer(false); }
    };

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
