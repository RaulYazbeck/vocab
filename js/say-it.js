// ── SAY IT ("Speak, don't spell") ─────────────
// With S.prefs.speak on, every answer the app would ask you to type
// becomes a Say-it card: see the prompt, say the word out loud, tap
// Show, hear it and see it, then grade yourself — ✗ Didn't know ·
// ≈ Close · ✓ Got it. Remembering a word is tested; spelling it isn't.
//
//   • "Got it" is full recall: words climb all the way to 💎, like a
//     typed answer. Only when Show came so fast (< SAY_MIN_MS) that
//     nothing can have been recalled does it count as recognition.
//   • The reveal plays the word (Pimsleur's "anticipation": your try
//     first, then the native audio to compare), with 🐢 slower and
//     ▶ in a sentence — where French liaisons and dropped letters live.
//   • The mic stays optional (voice-engine.js): a match grades itself,
//     a mismatch never counts as wrong — it reveals and you judge.
//
// Used by the Today session (mode-path.js), Library Drill and Timer,
// Boss Battle and Conjugation Slots.

const SAY_MIN_MS = 1000;
// Recall unless helped (💡) or revealed too fast to have recalled anything.
function sayKind(shownAt, revealedAt, helped = false) {
  return helped || revealedAt - shownAt < SAY_MIN_MS ? "recognition" : "recall";
}
function sayPromptLabel(w) {
  return typeof nounParts === "function" && nounParts(w) ? "Say it out loud — with its article" : "Say it out loud";
}

// The answer, big, with what helps you say it: the gender you hear for
// French l' nouns, and the three listening buttons.
//   opts.answer — text shown (default: the word's form)
//   opts.html   — shown as-is instead of colouring the answer
//   opts.audio  — what 🔊 says (default: the answer)
//   opts.sub    — a line under the answer
//   opts.heard  — what the mic heard, when it didn't match
function sayRevealHtml(w, opts = {}) {
  const text = opts.answer != null ? String(opts.answer) : w ? gameForm(w) : "";
  const audio = opts.audio != null ? String(opts.audio) : text;
  const ex = w && w.examples && w.examples[0] && w.examples[0][WORD_KEY];
  return `<div class="say-reveal">
    ${opts.heard ? `<div class="say-heard">🎙️ I heard “${escapeHtml(opts.heard)}” — how did you do?</div>` : ""}
    <div class="say-word">${opts.html != null ? opts.html : colorArticleHtml(text)}</div>
    ${opts.sub ? `<div class="say-sub">${opts.sub}</div>` : ""}
    ${w ? frGenderNoteHtml(w) : ""}
    ${audioOk() ? `<div class="say-audio">
      <button class="say-btn" data-say="${escapeHtml(audio)}" onclick="speak(this.dataset.say)" aria-label="Hear it again">🔊 Again</button>
      <button class="say-btn" data-say="${escapeHtml(audio)}" onclick="speak(this.dataset.say, 0.55)" aria-label="Hear it slower">🐢 Slower</button>
      ${ex && !opts.noSentence ? `<button class="say-btn" data-say="${escapeHtml(ex)}" onclick="speak(this.dataset.say)" aria-label="Hear it in a sentence">▶ Sentence</button>` : ""}
    </div>` : ""}
  </div>`;
}
// The three self-grade buttons; fn is called with false / "near" / true.
// A race (Timer, games) has no "Close": pass { close: false }.
function sayGradeHtml(fn, { close = true } = {}) {
  return `<div class="say-grade" role="group" aria-label="How did you do?">
    <button class="say-g bad" onclick="${fn}(false)" title="Key 1"><b>✗</b><span>Didn't know</span></button>
    ${close ? `<button class="say-g near" onclick="${fn}('near')" title="Key 2"><b>≈</b><span>Close</span></button>` : ""}
    <button class="say-g ok" onclick="${fn}(true)" title="Key 3"><b>✓</b><span>Got it</span></button>
  </div>`;
}
function sayShowBtnHtml(onclick, id = "say-show") {
  return `<button class="g-big-btn say-show" id="${id}" onclick="${onclick}">Show ▶</button>`;
}

// Keyboard for Say-it screens (the Today session has its own handler):
// Enter / Space = Show, then Next · 1 / 2 / 3 = ✗ / ≈ / ✓.
// A screen registers { root, state(): "prompt"|"revealed"|"done",
// reveal(), grade(v), next() } and is dropped once root is gone.
let sayKeys = null;
document.addEventListener("keydown", e => {
  if (!sayKeys || !speakOn()) return;
  if (!document.getElementById(sayKeys.root)) { sayKeys = null; return; }
  if (document.querySelector("body > .modal-overlay") || document.getElementById("settings-panel")?.style.display === "block") return;
  if (e.target && (e.target.tagName === "INPUT" || (e.target.tagName === "BUTTON" && (e.key === "Enter" || e.key === " ")))) return;
  const st = sayKeys.state();
  if (e.key === "Enter" || e.key === " ") {
    if (st === "prompt") { e.preventDefault(); sayKeys.reveal(); }
    else if (st === "done" && sayKeys.next) { e.preventDefault(); sayKeys.next(); }
  } else if (st === "revealed" && ["1", "2", "3"].includes(e.key)) {
    e.preventDefault();
    sayKeys.grade(e.key === "1" ? false : e.key === "2" ? (sayKeys.close === false ? true : "near") : true);
  }
});

// ── FRENCH: WORDS THAT SOUND THE SAME ─────────
// French writes many sounds several ways (parle / parles / parlent,
// vert / verre / ver, parler / parlé / parlez). A rough sound key —
// silent endings dropped, common spellings of one sound merged — keeps
// a multiple-choice question from hinging on a spelling-only
// difference (such options are simply not offered together), and
// names the look-alike sounds when a listening item is revealed.
// Deliberately conservative: when unsure, two words stay different.
// Words whose final consonant IS spoken (six, bus, l'est…) keep it.
const FR_SPOKEN_END = new Set(["six", "dix", "fils", "bus", "foot", "quiz", "sud", "ouest", "est", "os", "sens", "mars", "tennis", "net"]);
const _frKeyCache = new Map();
function frSoundKey(s) {
  const src = String(s || "");
  if (_frKeyCache.has(src)) return _frKeyCache.get(src);
  const key = _frSoundKey(src);
  _frKeyCache.set(src, key);
  return key;
}
function _frSoundKey(s) {
  let t = s.toLowerCase().trim();
  const noun = /^(le|la|les|un|une|l')/.test(t); // "l'est" (east) ≠ "est" (is)
  t = t.replace(/^(le|la|les|un|une|des|du)\s+|^l'/, "");
  return t.split(/[\s'’-]+/).filter(Boolean).map(w => {
    let x = w;
    if (FR_SPOKEN_END.has(x) && (x !== "est" || noun)) return x + "!";
    if (x.length > 4) x = x.replace(/ent$/, "e");        // ils parlent = il parle
    x = x.replace(/([aeiouyéè])nn?es?$/, "$1N");          // cousine ≠ cousin, viennent ≠ viens
    x = x.replace(/(ées?|és|ez|et)$/, "é");               // parlez = parlé(e)(s)
    if (x.length >= 5) x = x.replace(/er$/, "é");         // parler = parlé (not mer, fer)
    x = x.replace(/[sxtdzp]+$/, "");                      // silent final consonants
    if (x.length > 2) x = x.replace(/e$/, "");           // silent final e
    x = x.replace(/eaux?|aux?/g, "o").replace(/ph/g, "f").replace(/qu/g, "k").replace(/c(?=[aou])/g, "k").replace(/h/g, "");
    return stripAccents(x.replace(/é/g, "É")).replace(/(.)\1+/g, "$1");
  }).join(" ");
}
function frSoundsAlike(a, b) {
  if (WORD_KEY !== "fr") return false;
  const ka = frSoundKey(a);
  return !!ka && ka === frSoundKey(b) && normalize(a) !== normalize(b);
}
// Other deck words that sound like this one ("mère" → mer, maire).
let _frSoundIndex = null;
function frSoundAlikes(w, max = 3) {
  if (WORD_KEY !== "fr" || !w) return [];
  if (!_frSoundIndex) {
    _frSoundIndex = new Map();
    ALL_GROUPS.forEach(g => g.decks.forEach(d => d.words.forEach(x => {
      const f = gameForm(x);
      if (!f || /\s/.test(f.replace(/^(le|la|les|un|une)\s+/i, ""))) return; // single words only
      const k = frSoundKey(f);
      if (!_frSoundIndex.has(k)) _frSoundIndex.set(k, new Set());
      _frSoundIndex.get(k).add(f);
    })));
  }
  const f = gameForm(w);
  const set = _frSoundIndex.get(frSoundKey(f));
  return set ? [...set].filter(x => normalize(x) !== normalize(f) && frSoundKey(x) === frSoundKey(f)).slice(0, max) : [];
}
