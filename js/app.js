// ── START SESSION ─────────────────────────────
function startSession() {
  const island = document.getElementById("floating-island");
  if (island) island.remove();
  if (activeMode === "anki") { buildActiveWords(); startAnki(); return; }
  buildActiveWords();
  if (!activeWords.length) return;
  sessionCorrect = 0; sessionConsecutive = 0;
  if (activeMode === "learn")       startLearn();
  else if (activeMode === "timer")  { if (voiceEnabled) startVoiceTimer(); else startTimer(); }
  else                              { if (voiceEnabled) startVoiceSession(); else startDrill(); }
}

// ── SHOW SCREEN ───────────────────────────────
function showScreen(name) {
  showGameScreen();
  const island = document.getElementById('floating-island');
  if (island) island.style.display = 'none';
  if (name === "stats")       renderStatsChoice();
  else if (name === "badges") renderBadgesScreen();
  else if (name === "edits")  renderWordEditsScreen();
}
function backToMenu() {
  clearInterval(timerInterval);
  stopVoiceSession();
  const island = document.getElementById("floating-island");
  if (island) island.remove();
  document.getElementById("main-screen").style.paddingBottom = '';
  document.getElementById("main-screen").style.display = "none";
  document.getElementById("groups-container").style.display = "block";
  document.getElementById("exp-bar").style.display = "block";
  renderStartBar();
  renderGroups();
  renderExpBar();
}


// ── INIT ──────────────────────────────────────
document.querySelector("h1").textContent = APP_CONFIG.title;
migrate();
initVoice();
initSettingsPanel();
recordLogin();
renderExpBar();
renderGroups();

// ── SERVICE WORKER ────────────────────────────
// Caches the app shell for instant opens and full offline use.
// Registered after load so it never competes with first-paint fetches.
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('../sw.js').catch(e => {
      console.warn('Service worker registration failed:', e);
    });
  });
}
