// ── START SESSION ─────────────────────────────
function startSession() {
  const island = document.getElementById("floating-island");
  if (island) island.remove();
  // Anki decks: startAnki manages its own scope and hard-stops when the
  // day's debt is cleared (no fallback into other modes).
  if (activeMode === "anki") { startAnki(); return; }
  if (activeMode === "games") { openGamesHub([...selectedIds]); return; }
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
  if (typeof logScreen === "function") logScreen(name);
  if (name === "stats")         renderStatsChoice();
  else if (name === "journey")  renderJourney();
  else if (name === "collection") renderCollection();
  else if (name === "badges")   renderBadgesScreen();
  else if (name === "edits")    renderWordEditsScreen();
  else if (name === "forecast") renderAnkiForecast();
  else if (name === "games")    openGamesHub(null);
}
function backToMenu() {
  if (typeof pathSession !== "undefined" && pathSession) endPathSession(true);
  if (typeof stopPathVoice === "function") stopPathVoice();
  activeMode = selectionType() === "anki" ? "anki" : (activeMode === "path" ? "drill" : activeMode);
  quitAllGames();
  closePoolPicker();
  clearInterval(timerInterval);
  clearTimeout(_ankiWaitTimer);
  stopVoiceSession();
  const island = document.getElementById("floating-island");
  if (island) island.remove();
  document.getElementById("main-screen").style.paddingBottom = '';
  document.getElementById("main-screen").style.display = "none";
  document.getElementById("groups-container").style.display = "block";
  document.getElementById("exp-bar").style.display = "block";
  const home = document.getElementById("home");
  if (home) home.style.display = "";
  renderStartBar();
  renderGroups();
  renderExpBar();
  renderHome();
  if (typeof logScreen === "function") logScreen("home");
  if (typeof questAfterActivity === "function") questAfterActivity();
}


// ── INIT ──────────────────────────────────────
document.querySelector("h1").textContent = APP_CONFIG.title;
migrate();
initVoice();
initSettingsPanel();
recordLogin();
questEnsureToday();
applyCosmetics();
renderExpBar();
renderGroups();
renderHome();
startUsageClock();
logEvent("app_open", { standalone: IS_STANDALONE, w: window.innerWidth });

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
