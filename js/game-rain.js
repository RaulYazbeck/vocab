// ── GAME: WORD RAIN ───────────────────────────
// Target words fall in three lanes; the prompt sits at the bottom.
// Tap the right one before it lands. Three hearts; a miss on a 🌱 new
// word costs half a heart and its wave falls a quarter slower. Speed
// ramps every five hits. Movement is driven from requestAnimationFrame
// (not CSS animation), so it keeps working under prefers-reduced-motion
// and freezes exactly while paused.
//
// Ranks: faster start, steeper ramp; from 💠 Platinum the rain is
// reversed for words you know (target at the bottom, meanings falling).

// A lane on a 320px phone is ~80px wide: forms must be short overall and
// have no single word so long it could only fit by breaking mid-word.
const RAIN_MAX_LEN = 20, RAIN_MAX_TOKEN = 14;
function rainFitsText(f) {
  return f.length <= RAIN_MAX_LEN && f.split(" ").every(t => t.length <= RAIN_MAX_TOKEN);
}
function rainFits(w) { return rainFitsText(gameForm(w)); }
function rainWords(pool) { return dedupeWords(pool.filter(rainFits)); }
// Shrink the text until the longest word fits the lane (never mid-word).
function fitDropText(el) {
  let size = parseFloat(getComputedStyle(el).fontSize) || 13;
  while (el.scrollWidth > el.clientWidth + 1 && size > 9) { size -= 0.5; el.style.fontSize = size + "px"; }
}

registerGame({
  id: "rain", name: "Word Rain", icon: "🌧️", skill: "Recognition · speed", timed: true,
  ranks: [
    { fall: 7.5, ramp: 0.12 },
    { fall: 6.8, ramp: 0.13 },
    { fall: 6.2, ramp: 0.14 },
    { fall: 5.8, ramp: 0.15, reverse: true },
    { fall: 5.2, ramp: 0.16, reverse: true },
  ],
  twists: ["mirror", "golden", "turbo", "sudden"], credit: "recognition",
  howTo: [
    "Words fall from the sky. Tap the one that matches the prompt at the bottom.",
    "A wrong tap or a word hitting the ground costs a ❤️ — half a heart for 🌱 new words, which also fall slower.",
    "Every 5 hits the rain gets faster — and your multiplier grows.",
    "Keys 1–3 pick the lanes.",
  ],
  requirement(pool) {
    const n = rainWords(pool).length;
    return n >= 6 ? { ok: true } : { ok: false, reason: `Needs 6 short words — you have ${n}` };
  },
  stars: [80, 180, 320],
  start(ctx) {
    const rp = ctx.rp;
    const limit = ctx.size === "full" ? 0 : ctx.rounds(0, 45000, 20000) * ctx.timeScale;
    const eligible = rainWords(ctx.pool);
    let words = sampleWords(eligible, 60), qi = 0;
    const maxLives = ctx.sudden ? 1 : 3;
    let lives = maxLives, lost = 0, score = 0, combo = 0, maxCombo = 0, correct = 0, wrong = 0;
    let drops = [], target = null, last = 0, lastSec = 99, slow = 1, reversed = false;

    ctx.stage.innerHTML = `
      <div class="r-field" id="r-field">
        <div class="r-lane"></div><div class="r-lane"></div><div class="r-lane"></div>
        <div class="r-ground"></div>
      </div>
      <div class="r-prompt" id="r-prompt"></div>`;
    const field = document.getElementById("r-field");
    const promptEl = document.getElementById("r-prompt");
    const fit = () => {
      const top = field.getBoundingClientRect().top;
      field.style.height = Math.max(230, Math.min(460, window.innerHeight - top - 96)) + "px";
    };
    fit();
    gListen(window, "resize", fit);
    const fieldH = () => field.clientHeight;
    const speed = () => (fieldH() / rp.fall) * Math.min(2.6, 1 + rp.ramp * Math.floor(correct / 5)) * ctx.speedScale * slow; // px / s

    const end = () => {
      drops.forEach(d => d.el.remove());
      drops = [];
      if (lives <= 0) playGameOver();
      ctx.finish({ score, correct, wrong, maxCombo, cleared: lives > 0, stats: { lostHearts: lost } });
    };

    const wave = () => {
      if (ctx.finished) return;
      if (qi >= words.length) { words = sampleWords(eligible, 60); qi = 0; }
      target = words[qi++];
      const f = ctx.fmt(target);
      const others = pickDistractors(target, eligible, 2, gameForm, rainFits, { hard: !f.rookie });
      ctx.teach("");
      // Reverse (meanings fall, target at the bottom) for words you know,
      // at Platinum+ or with the Mirror twist — when the meanings fit.
      reversed = (rp.reverse || ctx.mirror) && f.reverse &&
        [target, ...others].every(w => rainFitsText(gamePrompt(w)));
      slow = f.slow;
      const text = w => reversed ? gamePrompt(w) : gameForm(w);
      const lanes = shuffle([0, 1, 2]);
      const offsets = shuffle([0, 1, 2]);
      drops.forEach(d => d.el.remove());
      drops = [target, ...others].map((w, i) => {
        const el = document.createElement("button");
        el.className = "r-drop" + (reversed ? " rev" : "");
        el.textContent = text(w);
        el.dataset.lane = lanes[i];
        el.style.left = `calc(${lanes[i] * 33.333}% + 3px)`;
        field.appendChild(el);
        fitDropText(el);
        const d = { w, el, lane: lanes[i], y: -12 - offsets[i] * 28 - Math.random() * 18, ok: i === 0 };
        el.style.transform = `translateY(${d.y}px)`;
        return d;
      });
      promptEl.innerHTML = `${escapeHtml(reversed ? gameForm(target) : gamePrompt(target))}${ctx.tag(target)}`;
      promptEl.classList.toggle("target", reversed);
      popEl(promptEl, true);
      ctx.busy = false;
    };

    const loseLife = (drop, why) => {
      ctx.busy = true;
      const cost = ctx.sudden ? lives : ctx.cost(target);
      lives = Math.max(0, lives - cost); lost += cost; wrong++;
      combo = ctx.comboAfterMiss(combo, target);
      ctx.setLives(lives, maxLives); ctx.setCombo(combo);
      ctx.missed(target);
      const right = drops.find(d => d.ok);
      if (right) right.el.classList.add("right");
      if (drop && !drop.ok) drop.el.classList.add("wrong");
      drops.filter(d => d !== right && d !== drop).forEach(d => d.el.classList.add("fade"));
      shakeEl(field); playMiss(); haptic(cost < 1 ? "miss" : "heavy");
      ctx.say(`${why} — it was ${gameForm(target)}${cost < 1 ? " (new word: half a heart)" : ""}`);
      speak(gameForm(target));
      if (drop && drop.w) recordConfusion(target, drop.w);
      ctx.teach(wordLessonHtml(target, drop && !drop.ok ? { word: drop.w } : null), "bad");
      gTimeout(() => { if (lives <= 0) end(); else wave(); }, 2000);
    };

    const hit = drop => {
      if (!drop || ctx.busy || ctx.paused || ctx.finished) return;
      if (!drop.ok) { loseLife(drop, "Wrong word"); return; }
      ctx.busy = true;
      correct++; combo++; maxCombo = Math.max(maxCombo, combo);
      const pts = ctx.award(target, 10 * comboMult(combo));
      score += pts;
      ctx.hit(target);
      ctx.setScore(score); ctx.setCombo(combo);
      drop.el.classList.add("burst");
      floatScore(drop.el, "+" + pts, ctx.isGolden(target) ? "gold" : "");
      drops.filter(d => d !== drop).forEach(d => d.el.classList.add("fade"));
      if (combo >= 5) playCombo(combo); else playPop();
      haptic("select");
      if (correct % 5 === 0) ctx.say("Faster!"); else ctx.say("Correct!");
      gTimeout(wave, 260);
    };

    const frame = t => {
      if (ctx.finished) return;
      const dt = last ? Math.min(50, t - last) : 16;
      last = t;
      if (!ctx.paused && !ctx.busy && ctx.clock.running) {
        const v = speed(), floor = fieldH();
        for (const d of drops) {
          d.y += v * dt / 1000;
          d.el.style.transform = `translateY(${d.y}px)`;
          if (d.ok && d.y + d.el.offsetHeight >= floor) { loseLife(null, "Too slow"); break; }
        }
      }
      gRaf(frame);
    };

    gListen(field, "pointerdown", e => {
      const el = e.target.closest(".r-drop");
      if (!el) return;
      e.preventDefault();
      hit(drops.find(d => d.el === el));
    });
    ctx.onKey = e => {
      const i = digitKey(e, 3);
      if (i < 0) return;
      e.preventDefault();
      hit(drops.find(d => d.lane === i));
    };
    ctx.onResume = () => { last = 0; };

    if (limit) {
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
    }

    ctx.setScore(0); ctx.setLives(lives, maxLives);
    wave();
    gRaf(frame);
  },
});
