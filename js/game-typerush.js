// ── GAME: TYPE RUSH ───────────────────────────
// A typing sprint: see the prompt, type the word, as many as you can
// before time runs out. If you hesitate, letters of the answer appear
// one by one — an answer typed with no letters shown earns recall
// credit (it moves words through every stage); with help it counts as
// recognition. Streaks multiply points; a wrong answer costs seconds
// (half for a 🌱 new word, which also gets its hints sooner).
//
// Ranks: less time and slower hints; at 💎 Diamond no hints at all.

registerGame({
  id: "typerush", name: "Type Rush", icon: "⌨️", skill: "Typed recall · speed", timed: true,
  ranks: [
    { limit: 60000, hint: 3000, pen: 2000 },
    { limit: 60000, hint: 3500, pen: 2000 },
    { limit: 55000, hint: 4000, pen: 2500 },
    { limit: 50000, hint: 5000, pen: 3000 },
    { limit: 45000, hint: 0, pen: 3000 },
  ],
  twists: ["golden", "turbo", "sudden"],
  howTo: ["Type as many words as you can before time runs out."],
  requirement(pool) {
    const n = distinctCount(pool);
    return n >= 4 ? { ok: true } : { ok: false, reason: `Needs 4 words — you have ${n}` };
  },
  stars: [120, 240, 380],
  start(ctx) {
    const rp = ctx.rp;
    const limit = ctx.rounds(rp.limit, 30000, 20000) * ctx.timeScale;
    let words = sampleWords(ctx.pool, 60), qi = 0;
    let score = 0, combo = 0, maxCombo = 0, correct = 0, wrong = 0, noHint = 0, lastSec = 99;
    let cur = null, shown = 0, shownAt = 0;

    ctx.stage.innerHTML = `
      <div class="g-question tr-q">
        <div class="g-q-label" id="tr-label">Type it</div>
        <div class="g-q-word" id="tr-prompt"></div>
        <div class="tr-hint" id="tr-hint" aria-live="polite"></div>
      </div>
      <div class="g-typed-wrap">
        <input type="text" class="german-input" id="tr-input" placeholder="type the answer…"
          autocomplete="off" autocorrect="off" autocapitalize="off" spellcheck="false" enterkeyhint="go"/>
        ${accentBarHtml("tr-input")}
        <div class="g-typed-actions">
          <button class="dontknow-btn" id="tr-skip">Skip</button>
          <button class="g-big-btn" id="tr-go">Enter ⏎</button>
        </div>
      </div>
      <div class="tr-fb" id="tr-fb"></div>`;
    const input = document.getElementById("tr-input");
    const promptEl = document.getElementById("tr-prompt"), hintEl = document.getElementById("tr-hint"), fbEl = document.getElementById("tr-fb");

    const target = w => gameForm(w);
    const renderHint = () => {
      const t = target(cur);
      if (!shown) { hintEl.innerHTML = rp.hint ? `<span class="tr-dots">${"·".repeat(Math.min(t.length, 16))}</span>` : ""; return; }
      hintEl.innerHTML = `<span class="tr-letters">${escapeHtml(t.slice(0, shown))}</span><span class="tr-dots">${"·".repeat(Math.max(0, Math.min(t.length, 16) - shown))}</span>`;
    };
    const next = () => {
      if (ctx.finished) return;
      if (qi >= words.length) { words = sampleWords(ctx.pool, 60); qi = 0; }
      cur = words[qi++];
      ctx.teach("");
      shown = 0; shownAt = ctx.clock.elapsed();
      promptEl.innerHTML = escapeHtml(gamePrompt(cur)) + ctx.tag(cur);
      document.getElementById("tr-label").textContent = cur.hint ? cur.hint : "Type it";
      input.value = ""; input.className = "german-input";
      renderHint();
      ctx.busy = false;
      try { input.focus({ preventScroll: true }); } catch (e) {}
    };
    const end = () => ctx.finish({ score, correct, wrong, maxCombo, typedCorrect: correct, cleared: ctx.size === "bonus" ? correct >= 5 : true, stats: { noHint } });

    const submit = skip => {
      if (ctx.waiting) { ctx.continueNow(); return; } // Enter after a miss = Continue
      if (!cur || ctx.busy || ctx.paused || ctx.finished) return;
      const val = input.value;
      if (!skip && !val.trim()) { shakeEl(input); return; }
      const res = skip ? false : (typedCorrect(val, cur) ? true : isNearMiss(val, [cur[WORD_KEY], target(cur)]) ? "near" : false);
      if (res === "near") {
        input.classList.add("near");
        fbEl.innerHTML = `<span class="g-near">≈ Almost — ${diffHtml(val, target(cur))}</span>`;
        gTimeout(() => { input.classList.remove("near"); input.select(); }, 700);
        return;
      }
      ctx.busy = true;
      if (res === true) {
        correct++; combo++; maxCombo = Math.max(maxCombo, combo);
        const clean = shown === 0;
        if (clean) noHint++;
        ctx.hit(cur, clean ? "recall" : "recognition");
        const pts = ctx.award(cur, Math.max(5, 20 - shown * 4) * comboMult(combo));
        score += pts;
        input.classList.add("correct");
        fbEl.innerHTML = `<span class="bb-ok">✓ ${colorArticleHtml(target(cur))}${clean ? "" : " <small>(with help)</small>"}</span>`;
        floatScore(input, "+" + pts, ctx.isGolden(cur) ? "gold" : "");
        if (combo >= 5) playCombo(combo); else playPop();
        haptic("select");
        ctx.say(`Correct — ${target(cur)}`);
        gTimeout(next, 280);
      } else {
        wrong++;
        const pen = Math.round(rp.pen * ctx.cost(cur));
        combo = ctx.comboAfterMiss(combo, cur);
        ctx.clock.add(pen);
        ctx.missed(cur);
        input.classList.add("wrong");
        fbEl.innerHTML = `<span class="bb-bad">${val.trim() ? `<s>${escapeHtml(val.trim())}</s> → ` : ""}<strong>${colorArticleHtml(target(cur))}</strong></span>`;
        floatScore(input, `−${pen / 1000}s`, "bad");
        playMiss(); haptic("miss");
        ctx.say(`It was ${target(cur)}`);
        ctx.teach(wordLessonHtml(cur), "bad");
        ctx.waitContinue(ctx.sudden ? end : next, ctx.sudden ? "See results" : "Continue");
      }
      ctx.setScore(score); ctx.setCombo(combo);
      if (ctx.size === "bonus" && correct >= 5) gTimeout(end, 300);
    };

    ["tr-go", "tr-skip"].forEach(id => gListen(document.getElementById(id), "pointerdown", e => e.preventDefault()));
    document.getElementById("tr-go").onclick = () => submit(false);
    document.getElementById("tr-skip").onclick = () => submit(true);
    gListen(input, "keydown", e => {
      if (e.key === "Enter") { e.preventDefault(); e.stopPropagation(); submit(false); }
      else if (e.key === "Tab") { e.preventDefault(); submit(true); }
    });

    gInterval(() => {
      if (ctx.finished) return;
      const ms = ctx.clock.elapsed();
      const left = Math.max(0, limit - ms);
      const sec = Math.ceil(left / 1000);
      ctx.setBar(left / limit, left < 5000 ? "urgent" : "");
      ctx.setClock(sec + "s", left < 5000);
      if (sec !== lastSec && sec <= 5 && sec > 0 && !ctx.paused) playTick();
      lastSec = sec;
      // Hints: a letter every `hint` ms (sooner for 🌱 words), never the
      // whole word.
      if (cur && rp.hint && !ctx.busy && !ctx.paused) {
        const d = rp.hint * (isRookie(cur) ? 0.6 : 1);
        const want = Math.min(Math.max(0, target(cur).length - 1), Math.floor((ms - shownAt) / d));
        if (want > shown) { shown = want; renderHint(); }
      }
      if (left <= 0) end();
    }, 100);

    ctx.setScore(0);
    next();
  },
});
