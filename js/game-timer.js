// ── GAME: TIMER ───────────────────────────────
// The old Timer mode as a minigame: a fixed set of words and one clock
// for all of them. Type every word before time runs out — a miss sends
// the word to the back of the line, so you only win by getting each one
// right. Typed with no help, so every hit is recall credit.
//
// Ranks: more words and less time for each. Stars: a win is ★, two
// mistakes or fewer ★★, no mistakes at all ★★★.

registerGame({
  id: "timer", name: "Timer", icon: "⏱️", skill: "Typed recall · race the clock", timed: true,
  ranks: [
    { words: 12, per: 5000 },
    { words: 16, per: 4500 },
    { words: 20, per: 4000 },
    { words: 25, per: 3500 },
    { words: 30, per: 3000 },
  ],
  twists: ["golden", "turbo", "sudden"],
  howTo: ["Type every word before the clock runs out.", "A miss sends the word to the back of the line — you win only when each one is right.", "No mistakes at all = ★★★."],
  requirement(pool) {
    const n = distinctCount(pool);
    return n >= 6 ? { ok: true } : { ok: false, reason: `Needs 6 words — you have ${n}` };
  },
  starsFor(res) { return !res.won ? 0 : res.wrong === 0 ? 3 : res.wrong <= 2 ? 2 : 1; },
  xpFor(res, size, stars) {
    if (size === "bonus") return res.cleared ? 15 : Math.min(5, res.correct || 0);
    if (size === "short") return Math.min(30, (res.correct || 0) * 2);
    return Math.min(70, (res.correct || 0) * 2 + stars * 10 + (res.won ? 10 : 0));
  },
  // Records the old Timer mode kept (🏆 Timer Champion, 💯 Flawless,
  // ⏱️ Photo Finish, 🎩 Hat Trick). Full rounds only.
  onRecord(res, size) {
    if (size !== "full" || !res.won) return;
    const today = todayISO();
    if (S.timerWinsDate !== today) { S.timerWinsDate = today; S.timerWinsToday = 0; }
    S.timerWinsToday = (S.timerWinsToday || 0) + 1;
    S.timerWins = (S.timerWins || 0) + 1;
    if (res.wrong === 0) S.perfectTimerWins = (S.perfectTimerWins || 0) + 1;
    if (res.secondsLeft > (S.bestTimerSecondsLeft || 0)) S.bestTimerSecondsLeft = res.secondsLeft;
    S.timerSpareTotal = (S.timerSpareTotal || 0) + (res.secondsLeft || 0);
    res.winsToday = S.timerWinsToday;
  },
  start(ctx) {
    const rp = ctx.rp;
    const n = Math.min(distinctCount(ctx.pool), ctx.rounds(rp.words, 8, 5));
    const queue = sampleWords(ctx.pool, n);
    const limit = (ctx.size === "bonus" ? bonusTime("timer") : queue.length * rp.per) * ctx.timeScale;
    const missedOnce = new Set();
    let qi = 0, score = 0, combo = 0, maxCombo = 0, correct = 0, wrong = 0, lastSec = 99, cur = null, over = false;

    ctx.stage.innerHTML = `
      <div class="g-question tr-q">
        <div class="g-q-label" id="tm-label">Type it</div>
        <div class="g-q-word" id="tm-prompt"></div>
        <div class="tr-hint" id="tm-left"></div>
      </div>
      <div class="g-typed-wrap">
        <input type="text" class="german-input" id="tm-input" placeholder="type the answer…"
          autocomplete="off" autocorrect="off" autocapitalize="off" spellcheck="false" enterkeyhint="go"/>
        ${accentBarHtml("tm-input")}
        <div class="g-typed-actions">
          <button class="dontknow-btn" id="tm-skip">Skip</button>
          <button class="g-big-btn" id="tm-go">Enter ⏎</button>
        </div>
      </div>
      <div class="tr-fb" id="tm-fb"></div>`;
    const input = document.getElementById("tm-input");
    const promptEl = document.getElementById("tm-prompt"), leftEl = document.getElementById("tm-left"), fbEl = document.getElementById("tm-fb");
    const target = w => gameForm(w);

    const end = (won, why = "⏰ Time's up") => {
      if (over) return;
      over = true;
      const secondsLeft = won ? Math.max(0, Math.floor((limit - ctx.clock.elapsed()) / 1000)) : 0;
      if (won) score += 100 + secondsLeft * 5;
      ctx.finish({ score, correct, wrong, maxCombo, typedCorrect: correct, won, secondsLeft,
        cleared: ctx.size === "bonus" ? correct >= bonusGoal("timer") : won,
        note: won ? `⏱️ Won with ${secondsLeft} s to spare` : why });
    };
    const next = () => {
      if (ctx.finished) return;
      if (qi >= queue.length) { end(true); return; }
      cur = queue[qi];
      ctx.teach("");
      promptEl.innerHTML = escapeHtml(gamePrompt(cur)) + ctx.tag(cur);
      document.getElementById("tm-label").textContent = cur.hint ? cur.hint : "Type it";
      leftEl.textContent = `${queue.length - qi} left`;
      input.value = ""; input.className = "german-input";
      ctx.busy = false;
      try { input.focus({ preventScroll: true }); } catch (e) {}
    };

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
        ctx.hit(cur, missedOnce.has(wordKey(cur)) ? "recognition" : "recall");
        const pts = ctx.award(cur, 15 * comboMult(combo));
        score += pts;
        qi++;
        input.classList.add("correct");
        fbEl.innerHTML = `<span class="bb-ok">✓ ${colorArticleHtml(target(cur))}</span>`;
        floatScore(input, "+" + pts, ctx.isGolden(cur) ? "gold" : "");
        if (combo >= 5) playCombo(combo); else playPop();
        haptic("select");
        ctx.say(`Correct — ${target(cur)}`);
        ctx.setScore(score); ctx.setCombo(combo);
        if (ctx.size === "bonus" && correct >= bonusGoal("timer")) { gTimeout(() => end(true), 300); return; }
        gTimeout(next, 280);
      } else {
        wrong++;
        combo = ctx.comboAfterMiss(combo, cur);
        missedOnce.add(wordKey(cur));
        ctx.missed(cur);
        // To the back of the line: it has to be answered again.
        queue.push(queue.splice(qi, 1)[0]);
        input.classList.add("wrong");
        fbEl.innerHTML = `<span class="bb-bad">${val.trim() ? `<s>${escapeHtml(val.trim())}</s> → ` : ""}<strong>${colorArticleHtml(target(cur))}</strong></span>`;
        playMiss(); haptic("miss");
        ctx.say(`It was ${target(cur)}`);
        ctx.teach(wordLessonHtml(cur), "bad");
        ctx.setScore(score); ctx.setCombo(combo);
        ctx.waitContinue(ctx.sudden ? () => end(false, "💀 Sudden death — one miss ends the round") : next, ctx.sudden ? "See results" : "Continue");
      }
    };

    ["tm-go", "tm-skip"].forEach(id => gListen(document.getElementById(id), "pointerdown", e => e.preventDefault()));
    document.getElementById("tm-go").onclick = () => submit(false);
    document.getElementById("tm-skip").onclick = () => submit(true);
    gListen(input, "keydown", e => {
      if (e.key === "Enter") { e.preventDefault(); e.stopPropagation(); submit(false); }
      else if (e.key === "Tab") { e.preventDefault(); submit(true); }
    });

    gInterval(() => {
      if (ctx.finished) return;
      const left = Math.max(0, limit - ctx.clock.elapsed());
      const sec = Math.ceil(left / 1000);
      ctx.setBar(left / limit, left < 10000 ? "urgent" : "");
      ctx.setClock((left / 1000).toFixed(1) + "s", left < 10000);
      if (sec !== lastSec && sec <= 5 && sec > 0 && !ctx.paused) playTick();
      lastSec = sec;
      if (left <= 0) end(false);
    }, 100);

    ctx.setScore(0);
    next();
  },
});
