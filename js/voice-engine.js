// ── VOICE RECOGNITION ENGINES ─────────────────
// Two interchangeable speech-to-text engines feed the same result
// pipeline (skip/repeat phrases, fuzzy answer matching):
//
//  • "system"  — the browser's built-in Web Speech API. Fast and
//    free, but accuracy varies by platform and it needs to be online.
//
//  • "whisper" — OpenAI's Whisper model running locally in the
//    browser via transformers.js (github.com/huggingface/transformers.js,
//    model: onnx-community/whisper-tiny). Free, much more robust for
//    non-English speech, works offline once the ~40 MB model has been
//    downloaded and cached. Falls back to "system" automatically if
//    the model can't be loaded.
//
// The engine is chosen in Settings and persisted in localStorage.

let voiceEngineChoice = localStorage.getItem("gv_voice_engine") || "system";

function voiceEngineLabel() {
  return voiceEngineChoice === "whisper" ? "🎙️ Whisper" : "🎙️ Voice";
}
function voiceEngineUsable() {
  if (voiceEngineChoice === "whisper") {
    return !!(navigator.mediaDevices && navigator.mediaDevices.getUserMedia && window.MediaRecorder);
  }
  const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
  return !!SR && navigator.onLine;
}
function cycleVoiceEngine() {
  voiceEngineChoice = voiceEngineChoice === "system" ? "whisper" : "system";
  localStorage.setItem("gv_voice_engine", voiceEngineChoice);
  const btn = document.getElementById("settings-voice-btn");
  if (btn) btn.innerHTML = voiceEngineSettingLabel();
}
function voiceEngineSettingLabel() {
  return voiceEngineChoice === "whisper"
    ? "🎙️&nbsp; Voice: Whisper (accurate, 40 MB once)"
    : "🎙️&nbsp; Voice: System (fast)";
}

// ── RESULT PIPELINE (shared by both engines) ──

function routeVoiceResult(correct, heard, isSkip = false) {
  const isTimerVoice = activeMode === "timer" && voiceEnabled;
  if (isTimerVoice) handleVoiceTimerResult(correct, heard, isSkip);
  else              handleVoiceResult(correct, heard, isSkip);
}

function processTranscripts(transcripts) {
  const main = (transcripts[0] || "").trim();
  const lower = main.toLowerCase();
  if (!main) { routeVoiceResult(false, "", true); return; }
  if (VOICE_PARAMS.skipPhrases.some(p => lower.includes(p))) {
    routeVoiceResult(false, main, true); return;
  }
  if (VOICE_PARAMS.repeatPhrases.some(p => lower.includes(p))) {
    speak(currentWord[WORD_KEY]); startListening(); return;
  }
  const ok = transcripts.some(t => voiceIsCorrect(t.trim().toLowerCase(), currentWord[WORD_KEY]));
  routeVoiceResult(ok, main);
}

// Accept the answer if it appears in the transcript, or if it is a
// near-miss (small edit distance) — recognisers often mangle a single
// letter of an otherwise perfect answer.
function voiceIsCorrect(transcript, answer) {
  const normT = normalize(transcript);
  if (!normT) return false;
  return answer.split("/").some(alt => {
    const normA = normalize(alt.trim());
    if (!normA) return false;
    if (normT.includes(normA)) return true;
    if (normA.includes(normT) && normT.length > 2) return true;
    if (normA.length >= 4) {
      const whole = 1 - levenshtein(normT, normA) / Math.max(normT.length, normA.length);
      if (whole >= 0.8) return true;
      if (normT.split(" ").some(tok =>
        tok.length >= 4 && 1 - levenshtein(tok, normA) / Math.max(tok.length, normA.length) >= 0.8
      )) return true;
    }
    return false;
  });
}

// ── LISTENING CONTROL ─────────────────────────

function startListening() {
  if (!voiceSessionRunning) return;
  if (voiceEngineChoice === "whisper") startListeningWhisper();
  else startListeningSystem();
}

// Abort whatever is currently listening, silently.
function cancelListening() {
  voiceActive = false;
  clearTimeout(voiceSilenceTimer);
  if (voiceRecognition) { try { voiceRecognition.abort(); } catch(e) {} voiceRecognition = null; }
  if (whisperStopRecording) whisperStopRecording(true);
}

function stopListening() {
  cancelListening();
  updateMicBtn();
  setVoiceStatus("Paused — tap mic to resume");
}

function toggleMic() { if (voiceActive) stopListening(); else startListening(); }

function updateMicBtn() {
  const btn = document.getElementById("voice-mic-btn");
  if (!btn) return;
  btn.className   = voiceActive ? "mic-btn listening" : "mic-btn";
  btn.textContent = voiceActive ? "🎙️" : "🎤";
}
function setVoiceStatus(msg) { const el = document.getElementById("voice-status"); if (el) el.textContent = msg; }

// ── SYSTEM ENGINE (Web Speech API) ────────────

function initVoiceRecognition() {
  const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
  if (!SR) return null;
  const recognition = new SR();
  recognition.lang            = APP_CONFIG.speechLang;
  recognition.continuous      = false;
  recognition.interimResults  = false;
  recognition.maxAlternatives = 3;
  try {
    const SGL = window.SpeechGrammarList || window.webkitSpeechGrammarList;
    if (SGL && currentWord) {
      const grammar = `#JSGF V1.0; grammar answer; public <answer> = ${currentWord[WORD_KEY]};`;
      const list = new SGL();
      list.addFromString(grammar, 1);
      recognition.grammars = list;
    }
  } catch(e) {}

  recognition.onresult = event => {
    clearTimeout(voiceSilenceTimer);
    const results = Array.from(event.results[0]);
    const best    = results[0];
    const confidence = best.confidence;
    if (confidence < VOICE_PARAMS.minConfidence && confidence > 0) {
      setVoiceStatus("Didn't catch that — try again"); startListening(); return;
    }
    processTranscripts(results.map(r => r.transcript));
  };

  recognition.onerror = event => {
    clearTimeout(voiceSilenceTimer);
    if (event.error === "no-speech") {
      routeVoiceResult(false, "", true);
    } else if (event.error === "network") {
      stopVoiceSession();
      alert("Network error. Switching to Classic.");
      activeMode = "drill"; startDrill();
    } else {
      setVoiceStatus("Error: " + event.error + " — tap mic to retry");
      voiceActive = false; updateMicBtn();
    }
  };

  recognition.onend = () => { voiceActive = false; updateMicBtn(); };
  return recognition;
}

function startListeningSystem() {
  voiceRecognition = initVoiceRecognition();
  if (!voiceRecognition) return;
  voiceActive = true; updateMicBtn();
  setVoiceStatus("Listening… say the answer");
  try { voiceRecognition.start(); } catch(e) { voiceActive = false; updateMicBtn(); }
  clearTimeout(voiceSilenceTimer);
  voiceSilenceTimer = setTimeout(() => {
    if (voiceActive) {
      try { voiceRecognition.abort(); } catch(e) {} voiceRecognition = null;
      routeVoiceResult(false, "", true);
    }
  }, VOICE_PARAMS.silenceTimeout);
}

// ── WHISPER ENGINE (transformers.js) ──────────

const WHISPER_MODEL = "onnx-community/whisper-tiny";
const WHISPER_CDN   = "https://cdn.jsdelivr.net/npm/@huggingface/transformers@3.3.3";
const WHISPER_LANGS = { de:"german", fr:"french", en:"english", es:"spanish", it:"italian", pt:"portuguese", nl:"dutch" };

let whisperPipe = null;
let whisperLoadPromise = null;
let whisperStopRecording = null; // set while the mic is recording

function whisperLanguage() {
  return WHISPER_LANGS[APP_CONFIG.speechLang.split("-")[0]] || "english";
}

function loadWhisper() {
  if (whisperPipe) return Promise.resolve(whisperPipe);
  if (!whisperLoadPromise) {
    whisperLoadPromise = (async () => {
      setVoiceStatus("Loading Whisper…");
      const { pipeline } = await import(WHISPER_CDN);
      const pipe = await pipeline("automatic-speech-recognition", WHISPER_MODEL, {
        dtype: "q8",
        progress_callback: p => {
          if (p.status === "progress" && p.total) {
            setVoiceStatus(`Downloading Whisper… ${Math.round(p.loaded / p.total * 100)}% (one time)`);
          }
        },
      });
      whisperPipe = pipe;
      return pipe;
    })();
    whisperLoadPromise.catch(() => { whisperLoadPromise = null; });
  }
  return whisperLoadPromise;
}

async function startListeningWhisper() {
  voiceActive = true; updateMicBtn();
  try {
    const pipe = await loadWhisper();
    if (!voiceSessionRunning || !voiceActive) return;
    setVoiceStatus("Listening… say the answer");
    const audio = await recordUtterance();
    if (!voiceSessionRunning) return;
    if (audio === undefined) return;                            // cancelled
    if (audio === null) { routeVoiceResult(false, "", true); return; } // silence
    setVoiceStatus("Transcribing…");
    const out = await pipe(audio, { language: whisperLanguage(), task: "transcribe" });
    if (!voiceSessionRunning) return;
    processTranscripts([(out.text || "").trim()]);
  } catch (e) {
    console.error("Whisper unavailable, falling back to system voice:", e);
    setVoiceStatus("Whisper unavailable — using system voice");
    voiceEngineChoice = "system";
    const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (SR) { setTimeout(() => startListeningSystem(), 800); }
    else {
      voiceActive = false; updateMicBtn();
      setVoiceStatus("Voice not available on this device");
    }
  }
}

// Record one utterance from the mic: waits for speech, stops after a
// short silence (or a hard cap), and returns mono 16 kHz Float32 audio
// for Whisper. Resolves null when nothing was said, undefined when
// cancelled via whisperStopRecording(true).
function recordUtterance({ maxMs = 8000, silenceMs = 1100, startTimeoutMs = VOICE_PARAMS.silenceTimeout } = {}) {
  return new Promise(async (resolve, reject) => {
    let stream;
    try {
      stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    } catch (e) { reject(e); return; }

    const ctx = getAudioCtx();
    const source   = ctx.createMediaStreamSource(stream);
    const analyser = ctx.createAnalyser();
    analyser.fftSize = 2048;
    source.connect(analyser);
    const buf = new Float32Array(analyser.fftSize);

    const recorder = new MediaRecorder(stream);
    const chunks = [];
    recorder.ondataavailable = e => { if (e.data.size) chunks.push(e.data); };

    let spoke = false, silentSince = Date.now(), cancelled = false;
    const startedAt = Date.now();

    const meter = setInterval(() => {
      analyser.getFloatTimeDomainData(buf);
      let rms = 0;
      for (let i = 0; i < buf.length; i++) rms += buf[i] * buf[i];
      rms = Math.sqrt(rms / buf.length);
      const now = Date.now();
      if (rms > 0.02) { spoke = true; silentSince = now; }
      if (!spoke && now - startedAt > startTimeoutMs) stop(false);
      else if (spoke && now - silentSince > silenceMs) stop(false);
      else if (now - startedAt > maxMs) stop(false);
    }, 100);

    function stop(cancel) {
      cancelled = cancelled || cancel;
      if (recorder.state !== "inactive") recorder.stop();
    }
    whisperStopRecording = stop;

    recorder.onstop = async () => {
      clearInterval(meter);
      try { source.disconnect(); } catch(e) {}
      stream.getTracks().forEach(t => t.stop());
      whisperStopRecording = null;
      if (cancelled)             { resolve(undefined); return; }
      if (!spoke || !chunks.length) { resolve(null); return; }
      try {
        const blob    = new Blob(chunks, { type: recorder.mimeType });
        const decoded = await getAudioCtx().decodeAudioData(await blob.arrayBuffer());
        const off = new OfflineAudioContext(1, Math.ceil(decoded.duration * 16000), 16000);
        const src = off.createBufferSource();
        src.buffer = decoded;
        src.connect(off.destination);
        src.start();
        const rendered = await off.startRendering();
        resolve(rendered.getChannelData(0));
      } catch (e) { reject(e); }
    };

    recorder.start();
  });
}
