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
function speak(text) {
  if (muteEnabled || !window.speechSynthesis) return;
  speechSynthesis.cancel();
  const u = new SpeechSynthesisUtterance(text);
  u.lang = APP_CONFIG.speechLang;
  u.rate = 0.85;
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
// notes: [{ freq, at, dur }], volume 0–1
function playNotes(notes, volume) {
  try {
    const ctx = getAudioCtx();
    if (!ctx) return;
    const t = ctx.currentTime;
    notes.forEach(n => {
      const osc  = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain); gain.connect(ctx.destination);
      osc.type = "sine";
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

// ── CELEBRATIONS ──────────────────────────────
const CONFETTI_COLORS = ["#F5A623", "#FFD166", "#00C9B1", "#9B7FE8", "#00D896", "#FF6363"];
function confettiBurst(count = 36) {
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
