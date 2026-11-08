// ── VOICE (TTS) ───────────────────────────────
function initVoice() {
  if (!window.speechSynthesis) return;
  const langPrefix = APP_CONFIG.speechLang.split('-')[0];
  const load = () => {
    const v = speechSynthesis.getVoices();
    if (!v.length) return;
    const matches = v.filter(x => x.lang && x.lang.startsWith(langPrefix));
    targetVoice = matches.find(x => x.lang === APP_CONFIG.speechLang) || matches[0] || null;
  };
  load();
  speechSynthesis.onvoiceschanged = load;
}
// Three switches (state.js) — read words aloud, sound effects,
// vibration — and "Mute until tomorrow" (path.js) over all of them.
function mutedToday() { return typeof quietActive === "function" && quietActive(); }
function ttsOn()  { return SOUND.tts && !mutedToday(); }
function sfxOn()  { return SOUND.sfx && !mutedToday(); }
function vibeOn() { return SOUND.vibe && !mutedToday(); }
// Is there any way to read words aloud: a recorded voice pack on this
// device (audio.js) or the browser's own text-to-speech?
function ttsAvailable() {
  return !!window.speechSynthesis || (typeof audioReady === "function" && audioReady());
}
// Reads text aloud: the recorded natural voice when the pack has it,
// otherwise the browser's own voice. rate: 0.85 is normal speed, 0.55
// is the "🐢 Slower" button.
// opts.quiet: a phrase picked by the learner (a selection) that has no
// recording isn't noted in the voice log (it's no phrase the app says).
function speak(text, rate = 0.85, opts = {}) {
  if (!ttsOn()) return;
  if (typeof audioSpeak === "function" && audioSpeak(text, rate, opts)) return;
  speakSystem(text, rate);
}
function speakSystem(text, rate = 0.85) {
  if (typeof audioStop === "function") audioStop();
  if (!window.speechSynthesis) return;
  speechSynthesis.cancel();
  const u = new SpeechSynthesisUtterance(text);
  u.lang = APP_CONFIG.speechLang;
  u.rate = rate;
  if (targetVoice) u.voice = targetVoice;
  speechSynthesis.speak(u);
}


// Silences whatever is being said (moving on to the next question).
function speakStop() {
  if (typeof audioStop === "function") audioStop();
  try { if (window.speechSynthesis) speechSynthesis.cancel(); } catch (e) {}
}
// ── TAP TO HEAR (German app) ──────────────────
// A German word or sentence the app has revealed — a right answer, a miss
// card, a sheet's example, a game's lesson — carries data-tap-say (its
// text, sayTapAttrs in ui-helpers.js): a tap plays its recording, the
// phone's voice when there is none. Selecting German text inside a
// data-say-zone (a sheet's reading, an answered question's feedback) says
// the selection. Nothing is ever marked while a question is being asked:
// only right German is recorded, so hearing a candidate in the natural
// voice would give the answer away. No setting: the Sound switch rules.
function sayTapInstall() {
  if (typeof sayTapOn !== "function" || !sayTapOn() || window._sayTapOn) return;
  window._sayTapOn = true;
  // (capture: a tap that says a word never also moves a game on — the
  // teaching card of 🧵 Verb Thread and ⏳ Timeline skips ahead on a tap)
  document.addEventListener("click", e => {
    const el = e.target && e.target.closest && e.target.closest("[data-tap-say]");
    if (!el) return;
    const b = e.target.closest("button, a, input, textarea, select");
    if (b && b !== el && el.contains(b)) return;
    e.stopPropagation();
    if (el.tagName !== "BUTTON") e.preventDefault();
    speak(el.dataset.tapSay);
    el.classList.remove("say-pop"); void el.offsetWidth; el.classList.add("say-pop");
  }, true);
  let timer = 0, down = false, last = "", lastAt = 0;
  const check = () => {
    timer = 0;
    if (down) return;
    const sel = window.getSelection && window.getSelection();
    if (!sel || sel.isCollapsed || !sel.rangeCount) return;
    const zone = n => { const el = n && (n.nodeType === 1 ? n : n.parentElement); return el && el.closest ? el.closest("[data-say-zone]") : null; };
    const z = zone(sel.anchorNode);
    if (!z || z !== zone(sel.focusNode)) return;
    if (sel.anchorNode && (sel.anchorNode.nodeType === 1 ? sel.anchorNode : sel.anchorNode.parentElement).closest("input, textarea")) return;
    const t = String(sel.toString()).replace(/[🔊⚑]/gu, " ").replace(/\s+/g, " ").trim();
    if (t.length < 2 || t.length > 300 || !/[A-Za-zÄÖÜäöüß]{2}/.test(t)) return;
    if (t === last && Date.now() - lastAt < 4000) return;
    last = t; lastAt = Date.now();
    speak(t, 0.85, { quiet: true });
  };
  const soon = ms => { clearTimeout(timer); timer = setTimeout(check, ms); };
  document.addEventListener("pointerdown", () => { down = true; }, true);
  document.addEventListener("pointerup", () => { down = false; soon(350); }, true);
  document.addEventListener("pointercancel", () => { down = false; soon(350); }, true);
  // (a phone's long-press selection, and its handles, end without a pointerup)
  document.addEventListener("selectionchange", () => soon(down ? 900 : 700));
}
if (typeof document !== "undefined" && document.addEventListener) {
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", sayTapInstall); else setTimeout(sayTapInstall, 0);
}

// ── SOUNDS ────────────────────────────────────
// One shared AudioContext — creating a new one per answer leaks
// resources and hits the browser's context limit.
let audioCtx = null;
function getAudioCtx() {
  const AC = window.AudioContext || window.webkitAudioContext;
  if (!AC) return null;
  if (!audioCtx) audioCtx = new AC();
  if (audioCtx.state === "suspended") audioCtx.resume();
  return audioCtx;
}
// notes: [{ freq, at, dur }], volume 0–1, type: oscillator waveform
function playNotes(notes, volume, type = "sine") {
  if (!sfxOn()) return;
  try {
    const ctx = getAudioCtx();
    if (!ctx) return;
    const t = ctx.currentTime;
    notes.forEach(n => {
      const osc  = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain); gain.connect(ctx.destination);
      osc.type = type;
      osc.frequency.setValueAtTime(n.freq, t + n.at);
      gain.gain.setValueAtTime(0.0001, t + n.at);
      gain.gain.linearRampToValueAtTime(volume, t + n.at + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.001, t + n.at + n.dur);
      osc.start(t + n.at); osc.stop(t + n.at + n.dur);
    });
  } catch(e) {}
}
function playSuccess() {
  playNotes([{ freq:659, at:0, dur:0.16 }, { freq:784, at:0.12, dur:0.38 }], 0.25);
}
function playFailure() {
  if (!sfxOn()) return;
  try {
    const ctx = getAudioCtx();
    if (!ctx) return;
    const t    = ctx.currentTime;
    const osc  = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain); gain.connect(ctx.destination);
    osc.type = "sine";
    osc.frequency.setValueAtTime(294, t);
    osc.frequency.linearRampToValueAtTime(261, t + 0.25);
    gain.gain.setValueAtTime(0.2, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.4);
    osc.start(t); osc.stop(t + 0.4);
  } catch(e) {}
}
function playLevelUp() {
  playNotes([
    { freq:523, at:0,    dur:0.18 },
    { freq:659, at:0.12, dur:0.18 },
    { freq:784, at:0.24, dur:0.18 },
    { freq:1047, at:0.36, dur:0.5 },
  ], 0.22);
}
function playAchievement() {
  playNotes([
    { freq:880,  at:0,    dur:0.14 },
    { freq:1175, at:0.10, dur:0.14 },
    { freq:1568, at:0.20, dur:0.45 },
  ], 0.18);
}

// ── GAME SOUNDS & HAPTICS ─────────────────────
// Short arcade effects for the minigames — the same 🔊 Sound
// switch as the answer chimes above.
function gameSfxOn() { return sfxOn(); }
function playPop() {
  if (gameSfxOn()) playNotes([{ freq:880, at:0, dur:0.07 }, { freq:1320, at:0.05, dur:0.09 }], 0.14);
}
// Pitch climbs with the combo so a hot streak audibly "rises".
function playCombo(n) {
  if (!gameSfxOn()) return;
  const f = 523 * Math.pow(2, Math.min(n, 24) / 24);
  playNotes([{ freq:f, at:0, dur:0.09 }, { freq:f * 1.5, at:0.06, dur:0.16 }], 0.14);
}
function playTick() {
  if (gameSfxOn()) playNotes([{ freq:1250, at:0, dur:0.035 }], 0.07);
}
function playMiss() {
  if (gameSfxOn()) playNotes([{ freq:220, at:0, dur:0.16 }, { freq:185, at:0.08, dur:0.22 }], 0.12, "triangle");
}
function playBossHit() {
  if (gameSfxOn()) playNotes([{ freq:130, at:0, dur:0.12 }, { freq:98, at:0.05, dur:0.2 }], 0.12, "square");
}
function playGameOver() {
  if (gameSfxOn()) playNotes([
    { freq:392, at:0, dur:0.2 }, { freq:330, at:0.18, dur:0.2 }, { freq:262, at:0.36, dur:0.45 },
  ], 0.16, "triangle");
}
function playCountdown(final) {
  if (gameSfxOn()) playNotes([{ freq: final ? 1047 : 659, at:0, dur: final ? 0.25 : 0.1 }], 0.13);
}
// Haptics follow the 📳 Vibration switch (and Mute until tomorrow).
function buzz(pattern) {
  if (!vibeOn()) return;
  try { if (navigator.vibrate) navigator.vibrate(pattern); } catch (e) {}
}

// ── CELEBRATIONS ──────────────────────────────
const CONFETTI_COLORS = ["#F5A623", "#FFD166", "#00C9B1", "#9B7FE8", "#00D896", "#FF6363"];
function confettiBurst(count = 36) {
  // Never stack bursts into a blizzard: top up to a ceiling instead.
  const live = document.querySelectorAll(".confetti-piece").length;
  count = Math.min(count, Math.max(0, 70 - live));
  for (let i = 0; i < count; i++) {
    const piece = document.createElement("div");
    piece.className = "confetti-piece";
    const duration = 1.6 + Math.random() * 1.4;
    piece.style.cssText = `
      left:${Math.random() * 100}vw;
      background:${CONFETTI_COLORS[i % CONFETTI_COLORS.length]};
      animation-duration:${duration}s;
      animation-delay:${Math.random() * 0.4}s;
      transform:rotate(${Math.random() * 360}deg);
      width:${6 + Math.random() * 6}px;
      height:${10 + Math.random() * 8}px;
    `;
    document.body.appendChild(piece);
    setTimeout(() => piece.remove(), (duration + 0.5) * 1000);
  }
}
function showCelebrateToast(icon, title, sub = "") {
  const existing = document.getElementById("celebrate-toast");
  if (existing) existing.remove();
  const el = document.createElement("div");
  el.className = "celebrate-toast";
  el.id = "celebrate-toast";
  el.innerHTML = `
    <div class="ct-icon">${icon}</div>
    <div class="ct-title">${title}</div>
    ${sub ? `<div class="ct-sub">${sub}</div>` : ""}`;
  document.body.appendChild(el);
  setTimeout(() => el.remove(), 2700);
}
function showComboFlash(n) {
  const existing = document.getElementById("combo-flash");
  if (existing) existing.remove();
  const el = document.createElement("div");
  el.className = "combo-flash";
  el.id = "combo-flash";
  el.textContent = `🔥 ${n} in a row!`;
  document.body.appendChild(el);
  setTimeout(() => el.remove(), 2100);
}

// Unified haptic vocabulary: light = select, double = correct streak,
// strong = miss / heart lost.
const HAPTICS = { select: 8, correct: [10, 40, 10], miss: 40, heavy: [60, 40, 60], drop: 12 };
function haptic(kind) { buzz(HAPTICS[kind] || 10); }
