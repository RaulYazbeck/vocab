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
  // Leaving a Today session through the header or Settings ends it
  // properly (answers are already saved) instead of orphaning it.
  if (typeof pathSession !== "undefined" && pathSession) endPathSession(true);
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


// ── THE SKY (ambient motion) ─────────────────
// Drifting orbs, twinkling stars and the breathing glows on big buttons,
// all from one slow ticker (~12 fps). The motion is so gentle that 12
// frames a second looks the same as 60–120, and the page is redrawn far
// less often. It rests entirely — no timers, no frames — after a while
// without input, when the window loses focus and when the tab is hidden;
// any input picks it up again where it was.
const SKY_FPS = 12, SKY_REST_MS = 25000, TAU = Math.PI * 2;
const SKY_STILL = !!(window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches);
// The sky's own clock only runs while it moves, so waking up resumes the
// drift exactly where it stopped (no jump).
let _skyClock = 37, _skyLast = 0; // seconds; start mid-drift
let _skyTimer = 0, _skyRestT = 0, _skyWokeAt = 0, _skyEls = null;
function skyFrame() {
  if (!_skyEls) _skyEls = { orbs: document.querySelector(".sky-orbs"), a: document.querySelector(".sky-a"), b: document.querySelector(".sky-b") };
  // While a sheet or modal covers the (then blurred) page, everything
  // holds still: no frames at all, and the blur is computed once.
  const sp = document.getElementById("settings-panel");
  if (_skyEls.orbs && _skyEls.orbs.style.transform && (document.querySelector("body > .modal-overlay") || (sp && sp.style.display === "block"))) return;
  const now = performance.now();
  if (_skyLast) _skyClock += Math.min(0.25, (now - _skyLast) / 1000); // throttled tabs never leap
  _skyLast = now;
  const t = _skyClock, E = _skyEls;
  if (E.orbs) {
    // A slow, never-repeating drift (the old orbDrift path, smoothed).
    const x = -1.4 * Math.sin(t * TAU / 40) + 0.6 * Math.sin(t * TAU / 23);
    const y = 1.2 * Math.sin(t * TAU / 34 + 1) - 0.5 * Math.sin(t * TAU / 19);
    const sc = 1.04 + 0.04 * Math.sin(t * TAU / 46);
    E.orbs.style.transform = `translate3d(${x.toFixed(3)}%, ${y.toFixed(3)}%, 0) scale(${sc.toFixed(4)})`;
  }
  // Two star fields, out of phase: the sky shimmers star by star.
  if (E.a) E.a.style.opacity = (0.45 + 0.55 * (0.5 - 0.5 * Math.cos(t * TAU / 14))).toFixed(3);
  if (E.b) E.b.style.opacity = (0.35 + 0.65 * (0.5 + 0.5 * Math.cos(t * TAU / 18))).toFixed(3);
  const g = (0.5 - 0.5 * Math.cos(t * TAU / 3)).toFixed(3);
  document.querySelectorAll(".tc-start, .fi-start, .day-cta, .tc-chest, .p-card.golden").forEach(el => el.style.setProperty("--glow", g));
}
function skyTick() { skyFrame(); _skyTimer = setTimeout(skyTick, 1000 / SKY_FPS); }
function skyRest() {
  clearTimeout(_skyRestT); clearTimeout(_skyTimer); _skyTimer = 0; _skyLast = 0;
  document.documentElement.classList.add("bg-rest");
}
function skyWake() {
  if (SKY_STILL || document.hidden) return;
  const now = Date.now();
  if (_skyTimer && now - _skyWokeAt < 1000) return; // pointermove is chatty
  _skyWokeAt = now;
  document.documentElement.classList.remove("bg-rest");
  if (!_skyTimer) skyTick();
  clearTimeout(_skyRestT);
  _skyRestT = setTimeout(skyRest, SKY_REST_MS);
}
["pointerdown", "pointermove", "keydown", "wheel", "touchstart", "scroll"].forEach(ev =>
  window.addEventListener(ev, skyWake, { passive: true, capture: true }));
window.addEventListener("blur", skyRest);
window.addEventListener("focus", skyWake);
document.addEventListener("visibilitychange", () => { if (document.hidden) skyRest(); else skyWake(); });
skyFrame();
if (document.hasFocus() || !("hasFocus" in document)) skyWake(); else skyRest();

// ── INIT ──────────────────────────────────────
document.querySelector("h1").textContent = APP_CONFIG.title;
migrate();
initVoice();
initSettingsPanel();
if (typeof audioInit === "function") audioInit();
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
