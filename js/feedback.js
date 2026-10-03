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
function speak(text, rate = 0.85) {
  if (!ttsOn()) return;
  if (typeof audioSpeak === "function" && audioSpeak(text, rate)) return;
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
