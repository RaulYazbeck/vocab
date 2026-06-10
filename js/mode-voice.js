// ── VOICE MODE (UI & SESSION FLOW) ────────────
// Speech recognition itself lives in voice-engine.js; this file owns
// the voice drill / voice timer screens and their game logic.

function startVoiceSession() {
  if (!voiceEngineUsable()) { alert("Voice not supported. Switching to Classic."); activeMode="drill"; startDrill(); return; }
  voiceSessionRunning = true;
  answered    = false;
  currentWord = drillSubMode === 'refresh' ? pickNextRefresh() : pickNext(drillSubMode === 'focus');
  showGameScreen();
  renderVoiceDrill();
}

function startVoiceTimer() {
  if (!voiceEngineUsable()) { alert("Voice not supported. Switching to typed timer."); voiceEnabled=false; startTimer(); return; }
  timerQueue     = buildTimerQueue();
  timerTotal     = Math.round(4.5 * timerQueue.length);
  timerLeft      = timerTotal;
  timerCorrect   = 0; timerWrong = 0; timerWordsDone = 0;
  timerFinished  = false; timerExpEarned = 0; timerPaused = false;
  voiceSessionRunning = true;
  showGameScreen();
  currentWord = timerQueue[timerWordsDone];
  renderVoiceTimerScreen();
  timerInterval = setInterval(timerTick, 100);
  setTimeout(() => startListening(), 400);
}

function renderVoiceTimerScreen() {
  const el = document.getElementById("main-screen");
  if (!currentWord) return;
  el.innerHTML = `<div class="screen">
    <div class="screen-top">
      <div class="screen-label">⏱ Timer · ${voiceEngineLabel()} · ${timerWordCount} words</div>
      <button class="back-btn" onclick="stopVoiceSession();backToMenu()">✕ Quit</button>
    </div>
    <div class="timer-display"><div class="timer-clock" id="timer-clock">${timerLeft.toFixed(1)}s</div></div>
    <div class="timer-bar-wrap"><div class="timer-bar-fill" id="timer-bar-fill" style="width:100%"></div></div>
    <div class="timer-score">✓ <strong id="t-correct">${timerCorrect}</strong> &nbsp; ✗ <strong id="t-wrong">${timerWrong}</strong> &nbsp; left: <strong>${timerQueue.length-timerWordsDone}</strong></div>
    <div class="word-display" id="timer-word-display">
      <div class="english-word">${currentWord.en}</div>
      <div class="word-hint" style="font-size:18px;">${currentWord.hint}</div>
    </div>
    <div class="voice-indicator">
      <button class="mic-btn" id="voice-mic-btn" onclick="toggleMic()">🎤</button>
      <div class="voice-status" id="voice-status">Listening…</div>
    </div>
    <div id="unlock-row-voice-timer"></div>
    <div id="timer-feedback" style="min-height:40px;text-align:center;padding-top:4px;"></div>
  </div>`;
  renderUnlockRow("unlock-row-voice-timer");
}

function handleVoiceTimerResult(correct, heard, isSkip=false) {
  if (timerFinished) return;
  cancelListening();
  const fb = document.getElementById("timer-feedback");
  if (correct) {
    timerCorrect++; playSuccess(); checkDrillMilestone();
    const ws = getWS(currentWord.deckId, currentWord.idx);
    applyCorrect(ws);
    saveState();
    timerWordsDone++;
    if (timerWordsDone >= timerQueue.length) { endTimer(true); return; }
    currentWord = timerQueue[timerWordsDone];
    if (fb) fb.innerHTML = `<span style="color:#0F6E56;font-weight:700;">✓ Correct!</span>`;
    document.getElementById("t-correct").textContent = timerCorrect;
    const wordEl = document.getElementById("timer-word-display");
    if (wordEl) wordEl.innerHTML = `<div class="english-word">${currentWord.en}</div><div class="word-hint" style="font-size:18px;">${currentWord.hint}</div>`;
    setTimeout(() => { if (!timerFinished && !timerPaused) startListening(); }, 400);
  } else {
    timerWrong++; playFailure();
    const ws = getWS(currentWord.deckId, currentWord.idx);
    applyWrong(ws); saveState();
    timerPaused = true; clearInterval(timerInterval);
    requeueCurrentWord();
    const skippedAnswer = currentWord[WORD_KEY];
    timerWordsDone++;
    const wordEl = document.getElementById("timer-word-display");
    if (wordEl) wordEl.style.opacity = "0.3";
    const typed = heard && !isSkip ? heard : "";
    if (fb) fb.innerHTML = typed
      ? `<span style="color:#993C1D;font-weight:700;font-size:16px;text-decoration:line-through;">${typed}</span> → <span style="color:#993C1D;font-weight:700;font-size:22px;">${skippedAnswer}</span>`
      : `<span style="color:#993C1D;font-weight:700;font-size:22px;">✗ ${skippedAnswer}</span>`;
    document.getElementById("t-wrong").textContent = timerWrong;
    setTimeout(() => {
      if (timerFinished) return;
      timerPaused = false;
      currentWord = timerQueue[timerWordsDone];
      timerInterval = setInterval(timerTick, 100);
      renderVoiceTimerScreen();
      setTimeout(() => startListening(), 400);
    }, 2500);
  }
}

function handleVoiceResult(correct, heard, isSkip=false) {
  if (!voiceSessionRunning) return;
  cancelListening();
  const ws    = getWS(currentWord.deckId, currentWord.idx);
  const isNew = ws.correct === 0 && ws.wrong === 0;
  if (correct) {
    sessionCorrect++; sessionConsecutive++;
    if (activeMode === "drill") checkDrillMilestone();
    addExp(isNew ? 10 : 5);
    applyCorrect(ws);
    checkCombo();
  } else {
    applyWrong(ws); sessionConsecutive = 0;
  }
  saveState();
  if (correct) playSuccess(); else playFailure();
  speak(currentWord[WORD_KEY]);
  showVoiceFeedback(correct, heard, isSkip);
  const delay = correct ? VOICE_PARAMS.correctShowTime : VOICE_PARAMS.wrongShowTime;
  setTimeout(() => {
    if (!voiceSessionRunning) return;
    answered    = false;
    currentWord = drillSubMode === 'refresh' ? pickNextRefresh() : pickNext(drillSubMode === 'focus');
    renderVoiceDrill();
    setTimeout(() => startListening(), 400);
  }, delay);
}

function stopVoiceSession() {
  voiceSessionRunning = false;
  cancelListening();
}

function showVoiceFeedback(correct, heard, isSkip) {
  const el = document.getElementById("voice-feedback-area");
  if (!el) return;
  const cls      = correct ? "correct" : "wrong";
  const icon     = correct ? "✓" : "✗";
  const heardHtml = heard && !isSkip ? `<div class="voice-feedback-heard">you said: "${heard}"</div>` : "";
  const skipHtml  = isSkip ? `<div class="voice-feedback-heard">skipped</div>` : "";
  el.innerHTML = `<div class="voice-feedback ${cls}">
    <div class="voice-feedback-answer">${icon} ${currentWord[WORD_KEY]}</div>
    ${heardHtml}${skipHtml}
    ${currentWord.pl ? `<div style="font-size:12px;color:#888;margin-top:2px;">plural: ${currentWord.pl}</div>` : ""}
  </div>
  ${currentWord.examples && currentWord.examples.length ? `
    <div class="examples-wrap">
      <div class="examples-title">Example</div>
      <div class="example-row">
        <div class="example-de">${currentWord.examples[0][WORD_KEY]}</div>
        <div class="example-en">${currentWord.examples[0].en}</div>
      </div>
    </div>` : ""}`;
}

function renderVoiceDrill() {
  const el = document.getElementById("main-screen");
  if (!currentWord) return;
  const ws = getWS(currentWord.deckId, currentWord.idx);
  const badges = [
    isMasteryPlus(ws) ? `<span class="masteryplus-badge">⭐ ${21 - daysBetween(ws.masteryPlusDate, todayISO())}d</span>` :
    isMastered(ws) ? `<span class="mastered-badge">✓ mastered</span>` : "",
    ws.displayStreak > 0 && !isMasteryPlus(ws) ? `<span class="streak-badge">🔥 ${ws.displayStreak}</span>` : ""
  ].join(" ");
  const deckNames = [...selectedIds].map(id => getDeck(id)?.name).filter(Boolean).join(" + ");
  el.innerHTML = `
    <div class="screen">
      <div class="screen-top">
        <div class="screen-label">${deckNames} · ${voiceEngineLabel()}</div>
        <button class="back-btn" onclick="stopVoiceSession();backToMenu()">← Menu</button>
      </div>
      <div class="word-display">
        <div class="english-word">${currentWord.en}</div>
        <div class="word-hint">${currentWord.hint} ${badges}</div>
      </div>
      <div class="voice-indicator">
        <button class="mic-btn" id="voice-mic-btn" onclick="toggleMic()">🎤</button>
        <div class="voice-status" id="voice-status">Tap the mic to start</div>
      </div>
      <div id="unlock-row-voice"></div>
      <div id="voice-feedback-area"></div>
      <div class="stats-row">${miniStats(ws)}</div>
    </div>`;
  renderUnlockRow("unlock-row-voice");
}
