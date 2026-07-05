// ── TIMER MODE ────────────────────────────────
function startTimer() {
  timerQueue    = buildTimerQueue();
  timerTotal    = Math.round(4.5 * timerQueue.length);
  timerLeft     = timerTotal;
  timerCorrect  = 0; timerWrong = 0; timerWordsDone = 0;
  timerFinished = false; timerExpEarned = 0;
  showGameScreen();
  currentWord   = timerQueue[timerWordsDone];
  renderTimerScreen();
  timerInterval = setInterval(timerTick, 100);
}
function timerTick() {
  timerLeft = Math.max(0, timerLeft - 0.1);
  updateTimerDisplay();
  if (timerLeft <= 0 && !timerFinished) endTimer(false);
}
function updateTimerDisplay() {
  const clockEl = document.getElementById("timer-clock");
  const barEl   = document.getElementById("timer-bar-fill");
  if (!clockEl || !barEl) return;
  const urgent = timerLeft < 10;
  clockEl.textContent = timerLeft.toFixed(1) + "s";
  clockEl.className   = "timer-clock" + (urgent ? " urgent" : "");
  barEl.style.width   = (timerLeft / timerTotal * 100) + "%";
  barEl.className     = "timer-bar-fill" + (urgent ? " urgent" : "");
}
function renderTimerScreen() {
  const el = document.getElementById("main-screen");
  if (!currentWord) return;
  el.innerHTML = `<div class="screen">
    <div class="screen-top">
      <div class="screen-label">⏱ Timer · ${timerWordCount} words · ${4.5*timerWordCount}s total</div>
      <button class="back-btn" onclick="backToMenu()">✕ Quit</button>
    </div>
    <div class="timer-head">
      <div class="timer-display"><div class="timer-clock" id="timer-clock">${timerLeft.toFixed(1)}s</div></div>
      <div class="timer-bar-wrap"><div class="timer-bar-fill" id="timer-bar-fill" style="width:100%"></div></div>
      <div class="timer-score">✓ <strong id="t-correct">${timerCorrect}</strong> &nbsp; ✗ <strong id="t-wrong">${timerWrong}</strong> &nbsp; left: <strong>${timerQueue.length-timerWordsDone}</strong></div>
      <div class="word-display" id="timer-word-display">
        ${timerWordHtml(currentWord)}
      </div>
      <div id="timer-feedback" class="timer-feedback"></div>
    </div>
    <input type="text" class="german-input" id="timer-input" placeholder="type the answer…"
      autocomplete="off" autocorrect="off" autocapitalize="off" spellcheck="false"
      onkeydown="handleTimerKey(event)"/>
    <div class="action-row">
      <button class="check-btn"    onclick="checkTimer()">Check</button>
      <button class="dontknow-btn" onclick="skipTimer()">Skip</button>
    </div>
  </div>`;
  timerFocusAndPosition();
}
function handleTimerKey(e) { if (e.key === "Enter") checkTimer(); }

// One authority for scroll position: focus never scrolls (preventScroll),
// then the whole timer card is aligned to the top of the viewport — the
// same spot after every answer, every next word, and while typing.
// Phones only; desktop fits without scrolling.
function timerFocusAndPosition() {
  [0, 100, 300].forEach(ms => setTimeout(() => {
    const input = document.getElementById("timer-input");
    if (input) { try { input.focus({ preventScroll: true }); } catch (e) { input.focus(); } }
    if (window.innerWidth <= 640 || IS_STANDALONE) {
      const card = document.querySelector("#main-screen .screen");
      if (card) card.scrollIntoView({ block: "start", behavior: "instant" });
    }
  }, ms));
}

// ── SHARED ANSWER FLOW ────────────────────────
// Used by the typed timer (checkTimer/skipTimer) and the voice timer
// (handleVoiceTimerResult in mode-voice.js). `voice` selects the
// re-render/mic path; state bookkeeping is identical for both.
function timerCorrectAnswer(voice) {
  timerCorrect++; playSuccess(); checkDrillMilestone();
  applyCorrect(getWS(currentWord.deckId, currentWord.idx));
  saveState();
  timerWordsDone++;
  if (timerWordsDone >= timerQueue.length) { endTimer(true); return; }
  currentWord = timerQueue[timerWordsDone];
  if (voice) {
    // Patch in place — a full re-render would interrupt the mic flow.
    const fb = document.getElementById("timer-feedback");
    if (fb) fb.innerHTML = `<span class="tfb-ok tfb-strong">✓ Correct!</span>`;
    const tc = document.getElementById("t-correct");
    if (tc) tc.textContent = timerCorrect;
    const wordEl = document.getElementById("timer-word-display");
    if (wordEl) wordEl.innerHTML = timerWordHtml(currentWord);
    setTimeout(() => { if (!timerFinished && !timerPaused) startListening(); }, 400);
  } else {
    renderTimerScreen();
    const fb = document.getElementById("timer-feedback");
    if (fb) fb.innerHTML = `<span class="tfb-ok">✓ Correct!</span>`;
  }
}
// shownWrongText: the user's rejected answer ("" for a plain skip).
// sound: the typed skip is historically silent.
function timerWrongAnswer(shownWrongText, voice, sound) {
  timerWrong++;
  applyWrong(getWS(currentWord.deckId, currentWord.idx));
  saveState();
  if (sound) playFailure();
  timerPaused = true; clearInterval(timerInterval);
  const answer = currentWord[WORD_KEY];
  requeueCurrentWord();
  timerWordsDone++;
  const wordEl = document.getElementById("timer-word-display");
  if (wordEl) wordEl.style.opacity = "0.3";
  const fb = document.getElementById("timer-feedback");
  if (fb) fb.innerHTML = shownWrongText
    ? `<span class="tfb-strike">${escapeHtml(shownWrongText)}</span><span class="tfb-arrow"> → </span><span class="tfb-ans">${answer}</span>`
    : `<span class="tfb-ans">✗ ${answer}</span>`;
  const tc = document.getElementById("t-correct"), tw = document.getElementById("t-wrong");
  if (tc) tc.textContent = timerCorrect;
  if (tw) tw.textContent = timerWrong;
  setTimeout(() => {
    if (timerFinished) return;
    timerPaused = false;
    currentWord = timerQueue[timerWordsDone];
    timerInterval = setInterval(timerTick, 100);
    if (voice) {
      renderVoiceTimerScreen();
      setTimeout(() => startListening(), 400);
    } else {
      renderTimerScreen();
    }
  }, 2500);
}

function checkTimer() {
  if (timerFinished || timerPaused) return;
  const input = document.getElementById("timer-input");
  if (!input) return;
  const val = input.value;
  if (!val.trim()) { skipTimer(); return; }
  if (isCorrect(val, currentWord[WORD_KEY])) {
    timerCorrectAnswer(false);
  } else {
    input.value = "";
    timerWrongAnswer(val.trim(), false, true);
  }
}
function skipTimer() {
  if (timerFinished || timerPaused) return;
  const input = document.getElementById("timer-input");
  if (input) input.value = "";
  timerWrongAnswer("", false, false);
}
function endTimer(won) {
  timerFinished = true; clearInterval(timerInterval); stopVoiceSession();
  if (won) {
    if (S.timerWinsDate !== todayISO()) { S.timerWinsDate = todayISO(); S.timerWinsToday = 0; }
    S.timerWinsToday = (S.timerWinsToday || 0) + 1;
    S.timerWins = (S.timerWins || 0) + 1;
    if (timerWrong === 0) S.perfectTimerWins = (S.perfectTimerWins || 0) + 1;
    if (timerLeft > (S.bestTimerSecondsLeft || 0)) S.bestTimerSecondsLeft = timerLeft;
  }
  checkAchievements({ type: "timer_end", won, perfect: won && timerWrong === 0, words: timerWordCount, winsToday: S.timerWinsToday || 0 });
  const perfBonus = Math.max(0, (timerCorrect - timerWrong) * 6);
  const winBonus = won ? timerWordCount : 0;
  timerExpEarned = perfBonus + winBonus;
  addExp(timerExpEarned);
  if (won) confettiBurst(44);
  document.getElementById("main-screen").innerHTML = `<div class="screen">
    <div class="result-screen">
      <div class="result-emoji">${won?"🏆":"⏰"}</div>
      <div class="result-title">${won?"You won!":"Time's up!"}</div>
      <div class="result-sub">${won?"You answered all words before time ran out!":"Better luck next time."}</div>
      <div>
        <div class="result-stat"><strong>${timerCorrect}</strong>correct</div>
        <div class="result-stat"><strong>${timerWrong}</strong>wrong</div>
        <div class="result-stat"><strong>+${timerExpEarned} XP</strong>earned</div>
      </div>
      <button class="result-btn" onclick="backToMenu()">← Back to menu</button>
    </div></div>`;
}
