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
    <div class="timer-head">
      <div class="timer-display"><div class="timer-clock" id="timer-clock">${timerLeft.toFixed(1)}s</div></div>
      <div class="timer-bar-wrap"><div class="timer-bar-fill" id="timer-bar-fill" style="width:100%"></div></div>
      <div class="timer-score">✓ <strong id="t-correct">${timerCorrect}</strong> &nbsp; ✗ <strong id="t-wrong">${timerWrong}</strong> &nbsp; left: <strong>${timerQueue.length-timerWordsDone}</strong></div>
      <div class="word-display" id="timer-word-display">
        ${timerWordHtml(currentWord)}
      </div>
    </div>
    <div class="voice-indicator">
      <button class="mic-btn" id="voice-mic-btn" onclick="toggleMic()">🎤</button>
      <div class="voice-status" id="voice-status">Listening…</div>
    </div>
    <div id="unlock-row-voice-timer"></div>
    <div id="timer-feedback" class="timer-feedback-v"></div>
  </div>`;
  renderUnlockRow("unlock-row-voice-timer");
}

function handleVoiceTimerResult(correct, heard, isSkip=false) {
  if (timerFinished) return;
  cancelListening();
  if (correct) timerCorrectAnswer(true);
  else timerWrongAnswer(heard && !isSkip ? heard : "", true, true);
}

function handleVoiceResult(correct, heard, isSkip=false) {
  if (!voiceSessionRunning) return;
  cancelListening();
  const ws = getWS(currentWord.deckId, currentWord.idx);
  applyAnswerState(ws, correct);
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
  const heardHtml = heard && !isSkip ? `<div class="voice-feedback-heard">you said: "${escapeHtml(heard)}"</div>` : "";
  const skipHtml  = isSkip ? `<div class="voice-feedback-heard">skipped</div>` : "";
  el.innerHTML = `<div class="voice-feedback ${cls}">
    <div class="voice-feedback-answer">${icon} ${currentWord[WORD_KEY]}</div>
    ${heardHtml}${skipHtml}
    ${currentWord.pl ? `<div style="font-size:12px;color:#888;margin-top:2px;">plural: ${currentWord.pl}</div>` : ""}
  </div>
  ${examplesHtml(currentWord, "first")}`;
}

function renderVoiceDrill() {
  const el = document.getElementById("main-screen");
  if (!currentWord) return;
  const ws = getWS(currentWord.deckId, currentWord.idx);
  const badges = wordBadgesHtml(ws);
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
