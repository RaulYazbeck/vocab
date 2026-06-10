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
    <div class="timer-display"><div class="timer-clock" id="timer-clock">${timerLeft.toFixed(1)}s</div></div>
    <div class="timer-bar-wrap"><div class="timer-bar-fill" id="timer-bar-fill" style="width:100%"></div></div>
    <div class="timer-score">✓ <strong id="t-correct">${timerCorrect}</strong> &nbsp; ✗ <strong id="t-wrong">${timerWrong}</strong> &nbsp; left: <strong>${timerQueue.length-timerWordsDone}</strong></div>
    <div class="word-display" id="timer-word-display">
      <div class="english-word">${currentWord.en}</div>
      <div class="word-hint" style="font-size:18px;">${currentWord.hint}</div>
    </div>
    <input type="text" class="german-input" id="timer-input" placeholder="type the answer…"
      autocomplete="off" autocorrect="off" autocapitalize="off" spellcheck="false"
      onkeydown="handleTimerKey(event)"/>
    <div class="action-row">
      <button class="check-btn"    onclick="checkTimer()">Check</button>
      <button class="dontknow-btn" onclick="skipTimer()">Skip</button>
    </div>
    <div id="timer-feedback" style="min-height:44px;font-size:18px;font-weight:700;text-align:center;padding:6px 0 2px;"></div>
  </div>`;
  focusInput();
}
function handleTimerKey(e) { if (e.key === "Enter") checkTimer(); }
function checkTimer() {
  if (timerFinished || timerPaused) return;
  const input = document.getElementById("timer-input");
  if (!input) return;
  const val = input.value;
  if (!val.trim()) { skipTimer(); return; }
  const correct = isCorrect(val, currentWord[WORD_KEY]);
  const fb = document.getElementById("timer-feedback");
  if (correct) {
    timerCorrect++; playSuccess(); checkDrillMilestone();
    const ws = getWS(currentWord.deckId, currentWord.idx);
    applyCorrect(ws);
    saveState();
    timerWordsDone++;
    if (timerWordsDone >= timerQueue.length) { endTimer(true); return; }
    currentWord = timerQueue[timerWordsDone];
    renderTimerScreen();
    const fb2 = document.getElementById("timer-feedback");
    if (fb2) fb2.innerHTML = `<span style="color:#0F6E56;font-weight:600;">✓ Correct!</span>`;
    focusInput();
  } else {
    timerWrong++;
    const ws = getWS(currentWord.deckId, currentWord.idx);
    applyWrong(ws); saveState(); playFailure();
    timerPaused = true; clearInterval(timerInterval);
    requeueCurrentWord();
    timerWordsDone++;
    const wordEl = document.getElementById("timer-word-display");
    if (wordEl) wordEl.style.opacity = "0.3";
    if (input) input.value = "";
    const typed = val.trim();
    if (fb) fb.innerHTML = `<span style="color:#993C1D;font-weight:700;font-size:16px;text-decoration:line-through;">${typed}</span><span style="color:#993C1D;font-weight:400;font-size:16px;"> → </span><span style="color:#993C1D;font-weight:700;font-size:22px;">${currentWord[WORD_KEY]}</span>`;
    document.getElementById("t-correct").textContent = timerCorrect;
    document.getElementById("t-wrong").textContent   = timerWrong;
    setTimeout(() => {
      if (timerFinished) return;
      timerPaused = false;
      currentWord = timerQueue[timerWordsDone];
      timerInterval = setInterval(timerTick, 100);
      renderTimerScreen();
    }, 2500);
  }
}
function skipTimer() {
  if (timerFinished || timerPaused) return;
  timerPaused = true; clearInterval(timerInterval);
  timerWrong++;
  const ws = getWS(currentWord.deckId, currentWord.idx);
  applyWrong(ws); saveState();
  const skipped = currentWord;
  requeueCurrentWord();
  timerWordsDone++;
  const wordEl = document.getElementById("timer-word-display");
  if (wordEl) wordEl.style.opacity = "0.3";
  const input = document.getElementById("timer-input");
  if (input) input.value = "";
  const fb = document.getElementById("timer-feedback");
  if (fb) fb.innerHTML = `<span style="color:#993C1D;font-weight:700;font-size:22px;">✗ ${skipped[WORD_KEY]}</span>`;
  document.getElementById("t-wrong").textContent = timerWrong;
  setTimeout(() => {
    if (timerFinished) return;
    timerPaused = false;
    currentWord = timerQueue[timerWordsDone];
    timerInterval = setInterval(timerTick, 100);
    renderTimerScreen();
  }, 2500);
}
function endTimer(won) {
  timerFinished = true; clearInterval(timerInterval); stopVoiceSession();
  checkAchievements({ type: "timer_end", won, perfect: won && timerWrong === 0, words: timerWordCount });
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
