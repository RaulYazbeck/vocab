// ── GAME: LISTEN & PICK ───────────────────────
// Text-to-speech says a word; pick its meaning. Needs speechSynthesis.
// speak() is silent while the app is muted, so the game offers an
// inline "Turn sound on" instead of playing a silent round.

function listenUnmute() {
  if (muteEnabled) toggleMute();
  const n = document.getElementById("l-muted");
  if (n) n.remove();
  if (activeGame && activeGame.ctx.listenReplay) activeGame.ctx.listenReplay();
}

registerGame({
  id: "listen", name: "Listen & Pick", icon: "🎧", skill: "Listening",
  howTo: [
    "Listen to the word, then pick what it means.",
    "Tap 🔊 to hear it again — as often as you like.",
    "Answering without a replay earns a bonus.",
    "Keys 1–4 pick, Space replays.",
  ],
  requirement(pool) {
    if (!window.speechSynthesis) return { ok: false, reason: "Needs text-to-speech, which this browser doesn't offer" };
    const n = distinctCount(pool);
    return n >= 4 ? { ok: true } : { ok: false, reason: `Needs 4 words — you have ${n}` };
  },
  stars: [80, 120, 160],
  start(ctx) {
    const total = ctx.rounds(12, 6, 6);
    const words = dedupeWords(sampleWords(ctx.pool, total * 2)).slice(0, total);
    while (words.length < total) words.push(...sampleWords(ctx.pool, total - words.length));
    let r = 0, score = 0, combo = 0, maxCombo = 0, correct = 0, wrong = 0, replays = 0, q = null;
    const langName = IS_FRENCH_APP ? "French" : "German";

    const say = () => { if (q) speak(gameForm(q.w)); };
    ctx.listenReplay = say;

    const round = () => {
      if (r >= words.length) { ctx.finish({ score, correct, wrong, maxCombo }); return; }
      const w = words[r++];
      const opts = shuffle([{ text: gamePrompt(w), correct: true, word: w },
        ...pickDistractors(w, ctx.pool, 3).map(x => ({ text: gamePrompt(x), correct: false, word: x }))]);
      q = { w, opts };
      replays = 0;
      ctx.setBar((r - 1) / words.length, "progress");
      ctx.setClock(`${r}/${words.length}`);
      ctx.stage.innerHTML = `
        ${muteEnabled ? `<div class="g-notice" id="l-muted">🔇 Sound is off. <button class="g-notice-btn" onclick="listenUnmute()">Turn sound on</button></div>` : ""}
        ${!targetVoice ? `<div class="g-notice soft">No ${langName} voice found on this device — pronunciation may sound off.</div>` : ""}
        <div class="l-play-wrap">
          <button class="l-play g-enter" id="l-play" aria-label="Play the word again">🔊</button>
          <div class="l-reveal" id="l-reveal"></div>
        </div>
        ${mcOptionsHtml(opts)}`;
      document.getElementById("l-play").onclick = () => { replays++; say(); popEl(document.getElementById("l-play")); };
      ctx.busy = false;
      say();
    };

    const answer = i => {
      if (!q || ctx.busy || ctx.finished) return;
      ctx.busy = true;
      const opt = q.opts[i];
      const btn = ctx.stage.querySelector(`.g-opt[data-i="${i}"]`);
      mcReveal(ctx.stage, q.opts, i);
      const rev = document.getElementById("l-reveal");
      if (rev) rev.textContent = gameForm(q.w);
      if (opt.correct) {
        correct++; combo++; maxCombo = Math.max(maxCombo, combo);
        const pts = 10 + (replays === 0 ? 5 : 0);
        score += pts;
        floatScore(btn, "+" + pts);
        playPop();
        ctx.say("Correct!");
        gTimeout(round, 1000);
      } else {
        wrong++; combo = 0;
        shakeEl(btn); playMiss(); buzz(40);
        ctx.missed(q.w);
        ctx.say(`It was: ${gamePrompt(q.w)}`);
        gTimeout(round, 1700);
      }
      ctx.setScore(score); ctx.setCombo(combo);
    };

    gListen(ctx.stage, "click", e => { const b = e.target.closest(".g-opt"); if (b) answer(+b.dataset.i); });
    ctx.onKey = e => {
      if (e.key === " ") { e.preventDefault(); replays++; say(); return; }
      const i = digitKey(e, 4); if (i >= 0) { e.preventDefault(); answer(i); }
    };
    ctx.setScore(0);
    round();
  },
});
