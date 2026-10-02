// ── GAME: LISTEN & PICK ───────────────────────
// A voice says a word (the recorded natural voice, else the browser's
// text-to-speech); pick its meaning. It needs words read aloud, so it's
// never auto-picked while that switch is off
// or muted until tomorrow (games-core: gameUsableNow). speak() is then
// silent, so the game offers an inline "Turn it on" instead.
//
// Ranks: fewer free replays; from 💠 Platinum, words you know become
// dictation — type what you hear (recall credit).

// Voices load asynchronously; only warn once the list is known and has
// nothing for this language.
function listenVoiceMissing() {
  if (targetVoice || !window.speechSynthesis || (typeof audioReady === "function" && audioReady())) return false;
  const voices = speechSynthesis.getVoices();
  const prefix = APP_CONFIG.speechLang.split("-")[0];
  return voices.length > 0 && !voices.some(v => v.lang && v.lang.startsWith(prefix));
}
function listenUnmute() {
  if (!SOUND.tts) setSoundPref("tts", true);
  const n = document.getElementById("l-muted");
  if (n) n.remove();
  if (activeGame && activeGame.ctx.listenReplay) activeGame.ctx.listenReplay();
}

registerGame({
  id: "listen", name: "Listen & Pick", icon: "🎧", skill: "Listening", audio: true,
  ranks: [
    { replays: 99 },
    { replays: 99 },
    { replays: 3 },
    { replays: 2, typed: true },
    { replays: 1, typed: true },
  ],
  twists: ["golden", "sudden"], credit: "recognition",
  howTo: () => ["Listen, then pick what it means. 🔊 plays it again."],
  requirement(pool) {
    if (!ttsAvailable()) return { ok: false, reason: "Needs text-to-speech, which this browser doesn't offer" };
    const n = distinctCount(pool);
    return n >= 4 ? { ok: true } : { ok: false, reason: `Needs 4 words — you have ${n}` };
  },
  stars: [80, 120, 160],
  start(ctx) {
    const rp = ctx.rp;
    const total = ctx.rounds(12, 6, 6);
    const words = dedupeWords(sampleWords(ctx.pool, total * 2)).slice(0, total);
    while (words.length < total) words.push(...sampleWords(ctx.pool, total - words.length));
    let r = 0, score = 0, combo = 0, maxCombo = 0, correct = 0, wrong = 0, replays = 0, noReplay = 0, typedOk = 0, q = null;
    const langName = IS_FRENCH_APP ? "French" : "German";

    const say = () => { if (q) speak(gameForm(q.w)); };
    ctx.listenReplay = say;
    const replay = () => {
      if (!q || ctx.busy) return;
      if (replays >= rp.replays) { ctx.say("No replays left at this rank"); shakeEl(document.getElementById("l-play")); return; }
      replays++; say(); popEl(document.getElementById("l-play"));
      const left = document.getElementById("l-left");
      if (left && rp.replays < 99) left.textContent = `${Math.max(0, rp.replays - replays)} replay${rp.replays - replays === 1 ? "" : "s"} left`;
    };

    const round = () => {
      if (r >= words.length) { ctx.finish({ score, correct, wrong, maxCombo, typedCorrect: typedOk, stats: { noReplay } }); return; }
      const w = words[r++];
      const f = ctx.fmt(w);
      const typed = f.typed && ctx.size === "full";
      const n = Math.min(4, f.options);
      // Words you know: options whose German sounds alike, and from 🥇 Gold
      // sometimes "None of these".
      const opts = typed ? [] : mcChoices(w, { text: gamePrompt, n, pool: ctx.pool, target: false, hard: !f.rookie, ear: true,
        none: !f.rookie && ctx.size === "full" && ctx.rank >= 2 });
      q = { w, opts, typed };
      ctx.teach("");
      replays = 0;
      ctx.setBar((r - 1) / words.length, "progress");
      ctx.setRound(r, words.length);
      ctx.stage.innerHTML = `
        ${!SOUND.tts ? `<div class="g-notice" id="l-muted">🔇 Reading words aloud is off. <button class="g-notice-btn" onclick="listenUnmute()">Turn it on</button></div>` : ""}
        ${listenVoiceMissing() ? `<div class="g-notice soft">No ${langName} voice found on this device — pronunciation may sound off.</div>` : ""}
        <div class="l-play-wrap">
          <button class="l-play g-enter" id="l-play" aria-label="Play the word again">🔊</button>
          <div class="l-left" id="l-left">${rp.replays < 99 ? `${rp.replays} replay${rp.replays === 1 ? "" : "s"} left` : ""}${ctx.tag(w)}</div>
          <div class="l-reveal" id="l-reveal"></div>
        </div>
        ${typed ? `<div class="g-q-label" style="text-align:center">✍️ Dictation — type what you hear</div>${gTypedHtml("type what you hear…")}` : mcOptionsHtml(opts)}`;
      document.getElementById("l-play").onclick = replay;
      if (typed) gTypedBind(ctx, v => answerTyped(v));
      ctx.busy = false;
      say();
    };

    const good = (w, btn, base) => {
      correct++; combo++; maxCombo = Math.max(maxCombo, combo);
      if (replays === 0) noReplay++;
      const pts = ctx.award(w, base + (replays === 0 ? 5 : 0));
      score += pts;
      floatScore(btn, "+" + pts, ctx.isGolden(w) ? "gold" : "");
      playPop(); haptic("select");
      ctx.say("Correct!");
      gTimeout(round, 1000);
    };
    const bad = (w, btn, picked) => {
      wrong++;
      combo = ctx.comboAfterMiss(combo, w);
      const pen = Math.round(5 * ctx.cost(w));
      score = Math.max(0, score - pen);
      if (btn) { shakeEl(btn); floatScore(btn, "−" + pen, "bad"); }
      playMiss(); haptic("miss");
      ctx.missed(w);
      ctx.say(`It was: ${gamePrompt(w)}`);
      noteWrongPick(w, picked);
      ctx.teach(wordLessonHtml(w, picked, `<button class="g-link-btn" ${speakBtnAttrs(gameForm(w))}>🔊 Hear it again</button>`), "bad");
      ctx.waitContinue(ctx.sudden ? () => ctx.finish({ score, correct, wrong, maxCombo, typedCorrect: typedOk, stats: { noReplay } }) : round);
    };

    const answer = i => {
      if (!q || q.typed || ctx.busy || ctx.finished) return;
      const opt = q.opts[i];
      if (!opt) return;
      ctx.busy = true;
      const btn = ctx.stage.querySelector(`.g-opt[data-i="${i}"]`);
      mcReveal(ctx.stage, q.opts, i);
      const rev = document.getElementById("l-reveal");
      if (rev) rev.textContent = gameForm(q.w);
      if (opt.correct) { ctx.hit(q.w); good(q.w, btn, 10); } else bad(q.w, btn, opt);
      ctx.setScore(score); ctx.setCombo(combo);
    };
    const answerTyped = v => {
      if (!q || !q.typed || ctx.busy || ctx.finished) return;
      ctx.busy = true;
      const res = gradeTyped(v, [gameForm(q.w), q.w[WORD_KEY]]);
      const input = document.getElementById("g-typed");
      const rev = document.getElementById("l-reveal");
      if (rev) rev.innerHTML = res === true ? escapeHtml(gameForm(q.w)) : diffHtml(v, gameForm(q.w));
      if (res === true) { typedOk++; ctx.hit(q.w, "recall"); if (input) input.classList.add("correct"); good(q.w, input, 15); }
      else if (res === "near") { if (input) input.classList.add("near"); ctx.say("Almost — check the spelling"); ctx.teach(`≈ Almost — ${diffHtml(v, gameForm(q.w))}`, "near"); ctx.waitContinue(round); }
      else { if (input) input.classList.add("wrong"); bad(q.w, input); }
      ctx.setScore(score); ctx.setCombo(combo);
    };

    gListen(ctx.stage, "click", e => { const b = e.target.closest(".g-opt"); if (b) answer(+b.dataset.i); });
    ctx.onKey = e => {
      if (e.target && e.target.tagName === "INPUT") return;
      if (e.key === " ") { e.preventDefault(); replay(); return; }
      const i = digitKey(e, 4); if (i >= 0) { e.preventDefault(); answer(i); }
    };
    ctx.setScore(0);
    round();
  },
});
