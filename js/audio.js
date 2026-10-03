// ── NATURAL VOICES (recorded audio) ───────────
// Every word and example sentence has been recorded ahead of time with
// a natural-sounding AI voice (tools/audio) and shipped as a "voice
// pack" in /audio/<lang>/. This file plays those recordings and falls
// back to the browser's own text-to-speech (feedback.js) for anything
// that isn't recorded, or when no pack is on the device.
//
//   • The pack is a manifest.json plus a few dozen ~2 MB shard files,
//     each a back-to-back run of tiny Opus clips. The manifest maps a
//     key (audioKey of the text) to [shard, offset, length].
//   • "Download" saves the shards into Cache Storage (one cache per
//     language), so they play offline — no service worker involved.
//   • Two kinds of shard: words ("w") and example sentences ("s"). You
//     can take just the words (small) or both.
//   • Playback is one shared <audio> element, unlocked by the first tap
//     (iOS only lets an element that a tap has started play later).
//
// Everything here is device-local: nothing is synced, nothing leaves
// the device. How a pack is made: tools/audio/README.md.

const AUDIO_CACHE = "audio-v1-" + (typeof WORD_KEY === "string" ? WORD_KEY : "x");
const AUDIO_PREF  = "gv_audio_" + (typeof WORD_KEY === "string" ? WORD_KEY : "x");
const AUDIO_MISS  = "gv_audio_miss_" + (typeof WORD_KEY === "string" ? WORD_KEY : "x");
const AUDIO_MISS_MAX = 400;
const AUDIO_MEM_SHARDS = 4;          // decoded-free: raw bytes of the last few shards
const AUDIO_PARALLEL = 3;
const AUDIO_NATURAL_RATE = 0.85;     // speak()'s default rate = the recording at normal speed

// Same text → same key in the browser and in tools/audio (tools/audio
// loads this very function). NEVER change it: every pack already built
// and downloaded would stop matching. cyrb53, 53 bits, base 36. Case and punctuation count
// (they change how a sentence is read); only whitespace is normalised.
function audioKey(text) {
  const s = String(text == null ? "" : text).normalize("NFC").replace(/\s+/g, " ").trim();
  let h1 = 0xdeadbeef, h2 = 0x41c6ce57;
  for (let i = 0; i < s.length; i++) {
    const c = s.charCodeAt(i);
    h1 = Math.imul(h1 ^ c, 2654435761);
    h2 = Math.imul(h2 ^ c, 1597334677);
  }
  h1 = Math.imul(h1 ^ (h1 >>> 16), 2246822507) ^ Math.imul(h2 ^ (h2 >>> 13), 3266489909);
  h2 = Math.imul(h2 ^ (h2 >>> 16), 2246822507) ^ Math.imul(h1 ^ (h1 >>> 13), 3266489909);
  return (4294967296 * (2097151 & h2) + (h1 >>> 0)).toString(36);
}

// ── STATE ─────────────────────────────────────
// Persisted (localStorage, this device): { asked, use, want }
//   asked — the first-launch offer has been shown (once per language)
//   use   — play recordings when available (the "Natural voice" switch)
//   want  — shard kinds the user downloaded: "w" (words), "s" (sentences)
// In memory: the manifest in force, which of its shards are on the
// device, the download in progress, and a listener list for the UI.
let _aPrefs = null;
function audioPrefs() {
  if (_aPrefs) return _aPrefs;
  let p = null;
  try { p = JSON.parse(localStorage.getItem(AUDIO_PREF) || "null"); } catch (e) {}
  if (!p || typeof p !== "object") p = {};
  _aPrefs = { asked: !!p.asked, use: p.use !== false, want: Array.isArray(p.want) ? p.want.filter(k => k === "w" || k === "s") : [] };
  return _aPrefs;
}
function audioSavePrefs() { try { localStorage.setItem(AUDIO_PREF, JSON.stringify(audioPrefs())); } catch (e) {} }

const AUDIO = {
  base: null,          // URL of /audio/<lang>/
  manifest: null,      // the manifest whose shards are on the device (null = nothing usable)
  remote: null,        // the manifest currently published (null = unknown / offline / none)
  have: new Set(),     // shard indexes of AUDIO.manifest that are in the cache
  mem: new Map(),      // shard index → Promise<ArrayBuffer> (small LRU)
  dl: null,            // { kinds, total, done, label, cancel } while downloading
  error: "",           // last download problem, shown in Settings
  ready: false,        // audioInit finished
  listeners: new Set(),
  el: null, url: null, seq: 0, unlocked: false,
};
function audioOnChange(fn) { AUDIO.listeners.add(fn); return () => AUDIO.listeners.delete(fn); }
// kind "progress" = bytes moved (throttled, listeners should only repaint
// numbers); anything else = something changed (listeners may re-render).
let _aEmitAt = 0;
function _audioEmit(kind) {
  if (kind === "progress") { const now = Date.now(); if (now - _aEmitAt < 200) return; _aEmitAt = now; }
  AUDIO.listeners.forEach(fn => { try { fn(kind || "state"); } catch (e) {} });
}

// Can this browser keep and play a pack at all? (Whether it can play the
// pack's audio format is checked against the manifest: _audioCanPlay.)
function audioSupported() {
  return !!(window.caches && window.fetch && window.Blob && window.URL && window.URL.createObjectURL && typeof Audio === "function");
}
function _audioMime(m) { return (m && m.mime) || "audio/ogg; codecs=opus"; }
function _audioCanPlay(m) {
  try { return !!document.createElement("audio").canPlayType(_audioMime(m)); } catch (e) { return false; }
}

// ── MANIFEST + CACHE ──────────────────────────
function _audioUrl(file) { return new URL(file, AUDIO.base).href; }
async function _audioFetchManifest() {
  // "no-cache" = ask the server if it changed (a tiny 304 reply), never serve a stale copy.
  const res = await fetch(_audioUrl("manifest.json"), { cache: "no-cache" });
  if (!res.ok) throw new Error("no pack (" + res.status + ")");
  const m = await res.json();
  if (!m || m.fmt !== 1 || !Array.isArray(m.shards) || !m.idx) throw new Error("bad manifest");
  return m;
}
async function _audioCache() { return caches.open(AUDIO_CACHE); }
async function _audioCachedManifest() {
  try {
    const hit = await (await _audioCache()).match(_audioUrl("manifest.json"));
    return hit ? await hit.json() : null;
  } catch (e) { return null; }
}
async function _audioScanHave(m) {
  const have = new Set();
  if (!m) return have;
  try {
    const cache = await _audioCache();
    await Promise.all(m.shards.map(async (s, i) => { if (await cache.match(_audioUrl(s.f))) have.add(i); }));
  } catch (e) {}
  return have;
}

// Called once at start-up (app.js). Never throws and never blocks the
// app: with no pack published or no network, everything stays on the
// system voice.
async function audioInit() {
  try {
    if (!audioSupported()) { AUDIO.ready = true; return; }
    AUDIO.base = new URL("../audio/" + WORD_KEY + "/", location.href).href;
    const cached = await _audioCachedManifest();
    if (cached && _audioCanPlay(cached)) {
      AUDIO.manifest = cached;
      AUDIO.have = await _audioScanHave(cached);
    }
    AUDIO.ready = true;
    _audioEmit();
    // Playing any <audio> makes iOS treat the page as a media player: it can
    // pause the user's music and let the app's chimes through the silent
    // switch. So nothing audio-related is touched unless the recorded voice
    // is actually in use on this device.
    if (audioReady()) audioInstallUnlock();
    _audioSweepSw();
    // Is there a pack (or a newer one) on the server? Quiet, best-effort.
    if (navigator.onLine !== false) {
      try {
        AUDIO.remote = await _audioFetchManifest();
        if (!_audioCanPlay(AUDIO.remote)) AUDIO.remote = null;
      } catch (e) { AUDIO.remote = null; }
      _audioEmit();
      audioMaybeOffer();
    }
  } catch (e) {
    AUDIO.ready = true;
  }
}

// The app may have started offline (or before the pack was published):
// look again when the connection is back or Settings is opened. At most
// one look every 30 s.
let _aRefreshAt = 0;
async function audioRefreshRemote() {
  if (!AUDIO.ready || !AUDIO.base || AUDIO.remote || AUDIO.dl || navigator.onLine === false) return;
  const now = Date.now();
  if (now - _aRefreshAt < 30000) return;
  _aRefreshAt = now;
  try {
    const m = await _audioFetchManifest();
    if (_audioCanPlay(m)) { AUDIO.remote = m; _audioEmit(); audioMaybeOffer(); }
  } catch (e) {}
}
window.addEventListener("online", audioRefreshRemote);

// ── SIZES + STATUS (for the UI) ───────────────
function audioFmtMB(bytes) {
  const mb = bytes / 1048576;
  return mb < 10 ? mb.toFixed(1) + " MB" : Math.round(mb) + " MB";
}
// Bytes of the shards of the given kinds in manifest m (all, or only
// the ones not on the device when `missingOnly`).
function audioBytes(m, kinds, missingOnly = false) {
  if (!m) return 0;
  const have = m === AUDIO.manifest ? AUDIO.have : new Set();
  return m.shards.reduce((n, s, i) => n + (kinds.includes(s.k) && !(missingOnly && have.has(i)) ? s.n : 0), 0);
}
function audioCount(m, kind) { return m && m.tot && m.tot[kind] ? m.tot[kind].n : 0; }
function audioInstalledKinds() {
  const m = AUDIO.manifest;
  if (!m) return [];
  return ["w", "s"].filter(k => {
    const idx = m.shards.map((s, i) => [s, i]).filter(([s]) => s.k === k);
    return idx.length > 0 && idx.every(([, i]) => AUDIO.have.has(i));
  });
}
// A pack is published and this browser could play it.
function audioOffered() { return !!(AUDIO.remote || AUDIO.manifest); }
// Recordings will actually be used right now.
function audioReady() { return audioPrefs().use && !!AUDIO.manifest && AUDIO.have.size > 0; }
// "w"/"s" the user asked for but whose shards are not all on the device
// (storage got cleared, or an update is waiting).
function audioNeedsRepair() {
  if (!AUDIO.manifest || AUDIO.dl) return false;
  const got = audioInstalledKinds();
  return audioPrefs().want.some(k => !got.includes(k) && audioCount(AUDIO.manifest, k) > 0);
}
function audioUpdateAvailable() {
  return !!(AUDIO.remote && AUDIO.manifest && AUDIO.remote.v !== AUDIO.manifest.v && audioInstalledKinds().length);
}

// ── DOWNLOAD ──────────────────────────────────
// kinds: ["w"] or ["w","s"]. Resumable: shards already on the device are
// skipped, so an interrupted download just continues next time. The
// manifest is stored last, so a half-finished download never changes
// what plays.
// Resolves "done", "cancelled", "error" (the reason is in AUDIO.error) or
// "busy" (one is already running; nothing was started).
async function audioDownload(kinds) {
  if (AUDIO.dl) return "busy";
  kinds = (kinds || ["w", "s"]).filter(k => k === "w" || k === "s");
  if (!kinds.length || !AUDIO.base) return "error";
  AUDIO.error = "";
  let outcome = "done";
  const job = { kinds, total: 0, done: 0, cancelled: false, cancel() { job.cancelled = true; if (job.abort) job.abort.abort(); } };
  job.abort = typeof AbortController === "function" ? new AbortController() : null;
  AUDIO.dl = job;
  _audioEmit();
  // Keep the screen awake while downloading (a locked phone suspends the page).
  // The lock is dropped whenever the page is hidden, so ask again on return.
  let lock = null;
  const takeLock = async () => { try { if (navigator.wakeLock && document.visibilityState === "visible") lock = await navigator.wakeLock.request("screen"); } catch (e) {} };
  const onVisible = () => { if (AUDIO.dl === job) takeLock(); };
  document.addEventListener("visibilitychange", onVisible);
  takeLock();
  try {
    let M = null;
    try { M = await _audioFetchManifest(); } catch (e) { throw new Error(navigator.onLine === false ? "You're offline — connect and try again." : "The voice pack isn't available right now."); }
    if (!_audioCanPlay(M)) throw new Error("This browser can't play the voice files.");
    AUDIO.remote = M;
    // Keep what the user already has, plus what they ask for now.
    const want = Array.from(new Set([...audioPrefs().want, ...kinds]));
    const firstInstall = !AUDIO.manifest;
    const cache = await _audioCache();
    const todo = [];
    for (let i = 0; i < M.shards.length; i++) {
      const s = M.shards[i];
      if (!want.includes(s.k)) continue;
      if (!(await cache.match(_audioUrl(s.f)))) todo.push(s);
    }
    job.total = todo.reduce((n, s) => n + s.n, 0);
    // Room? (Cache Storage counts against the browser's quota.)
    try {
      if (navigator.storage && navigator.storage.estimate) {
        const est = await navigator.storage.estimate();
        if (est && est.quota && est.quota - (est.usage || 0) < job.total * 1.15) {
          throw new Error(`Not enough free space — need about ${audioFmtMB(job.total)}.`);
        }
      }
    } catch (e) { if (/free space/.test(e.message)) throw e; }
    try { if (navigator.storage && navigator.storage.persist) navigator.storage.persist(); } catch (e) {}

    let next = 0;
    const worker = async () => {
      while (!job.cancelled) {
        const s = todo[next++];
        if (!s) return;
        let last = 0;
        const bytes = await _audioFetchShard(s, job, n => { job.done += n - last; last = n; _audioEmit("progress"); });
        if (job.cancelled) return;
        await cache.put(_audioUrl(s.f), new Response(bytes, { headers: { "Content-Type": "application/octet-stream" } }));
        _audioForgetInSw();
      }
    };
    await Promise.all(Array.from({ length: Math.min(AUDIO_PARALLEL, todo.length) }, worker));
    if (job.cancelled) throw Object.assign(new Error("Stopped"), { cancelled: true });

    // All there: switch to the new manifest, then drop shards it no longer uses.
    await cache.put(_audioUrl("manifest.json"), new Response(JSON.stringify(M), { headers: { "Content-Type": "application/json" } }));
    const keep = new Set(M.shards.map(s => _audioUrl(s.f)));
    keep.add(_audioUrl("manifest.json"));
    for (const req of await cache.keys()) if (!keep.has(req.url)) await cache.delete(req);
    AUDIO.manifest = M;
    AUDIO.have = await _audioScanHave(M);
    AUDIO.mem.clear();
    const p = audioPrefs();
    p.want = want; p.asked = true;
    if (firstInstall) p.use = true;                    // an update must not undo "use the system voice"
    audioSavePrefs();
    if (audioReady()) audioInstallUnlock();
  } catch (e) {
    const byUser = e.cancelled || job.cancelled;       // an aborted fetch rejects too
    job.cancel();                                      // stop the other workers; nothing may continue in the background
    if (byUser) outcome = "cancelled";
    else {
      outcome = "error";
      AUDIO.error = e && e.name === "QuotaExceededError" ? "This device ran out of storage. Free some space and try again — what already downloaded is kept."
        : e instanceof TypeError ? "The connection dropped. Tap Download to carry on — what already downloaded is kept."   // fetch() failures are TypeErrors ("Load failed" on Safari)
        : (e && e.message) || "Download failed.";
    }
    // A partly finished download still lets the first words play when a
    // manifest is in place; otherwise nothing changes.
  } finally {
    document.removeEventListener("visibilitychange", onVisible);
    try { if (lock) lock.release(); } catch (e) {}
    AUDIO.dl = null;
    _audioEmit();
    setTimeout(_audioSweepSw, 1500);                   // the old worker's late copies
  }
  return outcome;
}
// One shard, streamed so the progress bar moves; size and checksum are
// checked so a captive-portal page or a cut-off download is never kept.
async function _audioFetchShard(s, job, onBytes) {
  const res = await fetch(_audioUrl(s.f), { cache: "no-store", signal: job.abort ? job.abort.signal : undefined });
  if (!res.ok) throw new Error(`Download failed (${res.status}).`);
  let buf;
  if (res.body && res.body.getReader) {
    const reader = res.body.getReader(), parts = [];
    let n = 0;
    for (;;) {
      const { done, value } = await reader.read();
      if (done) break;
      parts.push(value); n += value.length; onBytes(n);
    }
    buf = new Uint8Array(n);
    let o = 0; parts.forEach(p => { buf.set(p, o); o += p.length; });
  } else {
    buf = new Uint8Array(await res.arrayBuffer());
    onBytes(buf.length);
  }
  if (buf.length !== s.n) throw new Error("A voice file arrived damaged. Try again.");
  if (s.h && window.crypto && crypto.subtle) {
    const h = Array.from(new Uint8Array(await crypto.subtle.digest("SHA-256", buf))).map(b => b.toString(16).padStart(2, "0")).join("");
    if (!h.startsWith(s.h)) throw new Error("A voice file arrived damaged. Try again.");
  }
  return buf;
}
// An already-installed older service worker caches every same-origin
// GET, which would store each shard a second time (and finishes doing so
// a moment after we have the bytes). Sweep those copies out of its
// caches: after each shard, again once the download ends, and at start-up.
// The current worker never touches /audio/, so this is a no-op for it.
async function _audioSweepSw() {
  try {
    for (const n of ["app-v1", "pages-v1", "cdn-v1"]) {
      if (!(await caches.has(n))) continue;
      const c = await caches.open(n);
      for (const req of await c.keys()) if (req.url.includes("/audio/")) await c.delete(req);
    }
  } catch (e) {}
}
function _audioForgetInSw() { _audioSweepSw(); }
function audioCancelDownload() { if (AUDIO.dl) AUDIO.dl.cancel(); }

async function audioRemove() {
  audioCancelDownload();
  try { await caches.delete(AUDIO_CACHE); } catch (e) {}
  AUDIO.manifest = null; AUDIO.have = new Set(); AUDIO.mem.clear();
  const p = audioPrefs(); p.want = []; audioSavePrefs();
  audioStop();
  _audioEmit();
}
function audioSetUse(on) {
  audioPrefs().use = !!on; audioSavePrefs();
  if (on) { if (audioReady()) audioInstallUnlock(); } else audioStop();
  _audioEmit();
}

// ── PLAYBACK ──────────────────────────────────
// iOS Safari lets an <audio> element play from a timer only after the
// same element has been started by a tap. Do that once, silently, on the
// first touch/click/key.
const _SILENT_WAV = "data:audio/wav;base64,UklGRiQAAABXQVZFZm10IBAAAAABAAEARKwAAIhYAQACABAAZGF0YQAAAAA=";
function _audioEl() {
  if (!AUDIO.el) { AUDIO.el = new Audio(); AUDIO.el.preload = "auto"; }
  return AUDIO.el;
}
// Start (and at once drop) a silent clip, inside a tap.
function _audioUnlockNow() {
  AUDIO.unlocked = true;
  try {
    const el = _audioEl();
    if (el.paused && !el.src) {
      el.src = _SILENT_WAV;
      const p = el.play();
      // Only undo our own silent clip: if a real recording took the element
      // in the meantime (the first tap was also a 🔊 tap), leave it playing.
      const done = () => { if (el.src === _SILENT_WAV) { try { el.pause(); } catch (e) {} el.removeAttribute("src"); } };
      if (p && p.then) p.then(done, done); else done();
    }
  } catch (e) {}
}
function audioInstallUnlock() {
  if (AUDIO.unlockHooked || AUDIO.unlocked) return;
  AUDIO.unlockHooked = true;
  const unlock = () => {
    ["pointerdown", "touchend", "click", "keydown"].forEach(ev => window.removeEventListener(ev, unlock, true));
    _audioUnlockNow();
  };
  ["pointerdown", "touchend", "click", "keydown"].forEach(ev => window.addEventListener(ev, unlock, true));
}
function audioStop() {
  AUDIO.seq++;
  try { if (AUDIO.el) AUDIO.el.pause(); } catch (e) {}
}

function _audioShardBytes(i) {
  let p = AUDIO.mem.get(i);
  if (p) { AUDIO.mem.delete(i); AUDIO.mem.set(i, p); return p; }   // refresh LRU order
  const m = AUDIO.manifest;
  p = _audioCache().then(c => c.match(_audioUrl(m.shards[i].f))).then(r => { if (!r) throw new Error("shard missing"); return r.arrayBuffer(); });
  AUDIO.mem.set(i, p);
  p.catch(() => AUDIO.mem.delete(i));
  while (AUDIO.mem.size > AUDIO_MEM_SHARDS) AUDIO.mem.delete(AUDIO.mem.keys().next().value);
  return p;
}
// Where a text is in the pack: tries the text as given, then its clean
// display form ("die Katze, -n" → "die Katze", via formOf in games-core).
function audioFind(text) {
  const m = AUDIO.manifest;
  if (!m) return null;
  let e = m.idx[audioKey(text)];
  if (!e && typeof formOf === "function") { const f = formOf(text); if (f !== text) e = m.idx[audioKey(f)]; }
  return e || null;
}

// Plays a recording of `text` if there is one on the device. Returns
// true when it took the request (speak() must then stay silent), false
// when the caller should use the system voice. `rate` is speak()'s rate:
// 0.85 is normal speed, 0.55 is the "🐢 Slower" button.
function audioSpeak(text, rate = AUDIO_NATURAL_RATE) {
  if (!audioReady()) return false;
  const e = audioFind(text);
  if (!e) { audioNoteMiss(text); return false; }
  if (!AUDIO.have.has(e[0])) return false;             // that shard isn't downloaded
  _audioPlayEntry(e, rate, ++AUDIO.seq, () => _audioFallback(text, rate));
  try { if (window.speechSynthesis) speechSynthesis.cancel(); } catch (err) {}
  return true;
}
// Plays one clip on the shared element. `my` is the request number: if a
// newer request has replaced it by the time the bytes are read, nothing
// happens. onFail(reason) is called, once, if the clip can't be read or
// played (reason = a DOMException name, e.g. NotAllowedError).
function _audioPlayEntry(e, rate, my, onFail) {
  const m = AUDIO.manifest;
  const fail = why => { if (my === AUDIO.seq) onFail(why); };
  return _audioShardBytes(e[0]).then(buf => {
    if (my !== AUDIO.seq) return;                      // a newer request replaced this one
    const blob = new Blob([buf.slice(e[1], e[1] + e[2])], { type: _audioMime(m) });
    const url = URL.createObjectURL(blob);
    const el = _audioEl();
    const old = AUDIO.url; AUDIO.url = url;
    el.onended = el.onerror = null;
    el.src = url;
    if (old) URL.revokeObjectURL(old);
    el.preservesPitch = true; el.mozPreservesPitch = true; el.webkitPreservesPitch = true;
    el.playbackRate = Math.max(0.5, Math.min(1.25, rate / AUDIO_NATURAL_RATE));
    el.onerror = () => fail(el.error && el.error.code === 4 ? "NotSupportedError" : "MediaError");
    const p = el.play();
    if (p && p.catch) return p.catch(err => fail((err && err.name) || "PlayError"));
  }).catch(() => fail("ReadError"));
}
// Settings → "Hear a sample": plays one recorded word and says plainly
// whether the phone accepted it, so a new device can be checked in one tap.
function audioSample() {
  const m = AUDIO.manifest;
  const key = m && Object.keys(m.idx).find(k => AUDIO.have.has(m.idx[k][0]));
  if (!key) return;
  const toast = (i, a, b) => { if (typeof showCelebrateToast === "function") showCelebrateToast(i, a, b); };
  _audioUnlockNow();                                   // we are inside a tap
  try { if (window.speechSynthesis) speechSynthesis.cancel(); } catch (err) {}
  const my = ++AUDIO.seq;
  let failed = false;
  _audioPlayEntry(m.idx[key], AUDIO_NATURAL_RATE, my, why => {
    failed = true;
    toast("⚠️", "Couldn't play the recording", `${why}. The system voice will be used instead.`);
  }).then(() => {
    if (!failed && my === AUDIO.seq) toast("▶", "Sample played", "Didn't hear it? Check the volume and the silent switch.");
  });
}
// Recording failed at the last moment (evicted, blocked): system voice.
function _audioFallback(text, rate) {
  if (typeof speakSystem === "function") speakSystem(text, rate);
}

// ── MISSES ────────────────────────────────────
// Phrases the app tried to say that the pack has no recording for (a
// verb form the games made up, say). They fall back to the system voice
// and are remembered here so the next build of the pack can include
// them: Settings → Sound & voice → "Copy missing phrases".
let _aMiss = null;
function _audioMisses() {
  if (_aMiss) return _aMiss;
  try { _aMiss = JSON.parse(localStorage.getItem(AUDIO_MISS) || "[]"); } catch (e) { _aMiss = []; }
  if (!Array.isArray(_aMiss)) _aMiss = [];
  return _aMiss;
}
function audioNoteMiss(text) {
  const t = String(text == null ? "" : text).replace(/\s+/g, " ").trim();
  if (!t || t.length > 200) return;
  const list = _audioMisses();
  if (list.includes(t)) return;
  list.push(t);
  if (list.length > AUDIO_MISS_MAX) list.shift();
  try { localStorage.setItem(AUDIO_MISS, JSON.stringify(list)); } catch (e) {}
}
function audioMissCount() { return _audioMisses().length; }
function audioMissText() { return _audioMisses().join("\n"); }
function audioClearMisses() { _aMiss = []; try { localStorage.removeItem(AUDIO_MISS); } catch (e) {} }

// ── THE FIRST-LAUNCH OFFER ────────────────────
// Once per language, after the update that brings voices: ask. Never
// while another sheet is open, never offline, never twice. "Not now" is
// remembered; Settings → Sound & voice has the same download.
function audioMaybeOffer() {
  const p = audioPrefs();
  if (p.asked || !AUDIO.remote || AUDIO.manifest || AUDIO.dl) return;
  const tryOpen = (left) => {
    if (audioPrefs().asked || AUDIO.manifest || AUDIO.dl) return;
    const busy = document.querySelector("body > .modal-overlay") ||
      (document.getElementById("settings-panel") && document.getElementById("settings-panel").style.display === "block");
    if (busy) { if (left > 0) setTimeout(() => tryOpen(left - 1), 4000); return; }
    p.asked = true; audioSavePrefs();
    audioOfferSheet();
  };
  setTimeout(() => tryOpen(5), 1800);
}
function audioOfferSheet() {
  const m = AUDIO.remote;
  if (!m) return;
  const all = audioBytes(m, ["w", "s"]), words = audioBytes(m, ["w"]);
  const lang = WORD_KEY === "fr" ? "French" : "German";
  const old = document.getElementById("audio-offer"); if (old) old.remove();
  const el = document.createElement("div");
  el.className = "modal-overlay"; el.id = "audio-offer";
  el.innerHTML = `<div class="modal-sheet audio-sheet" role="dialog" aria-modal="true" aria-labelledby="ao-title">
    <div class="modal-title" id="ao-title">🔊 Natural ${lang} voices</div>
    <div class="modal-sub">Every word and example sentence was recorded with a natural voice, so you hear a real accent instead of the phone's robot voice. Download once, then it works offline.</div>
    <div class="audio-offer-btns">
      <button class="modal-btn primary" id="ao-all">Download everything · ${audioFmtMB(all)}</button>
      ${words < all ? `<button class="modal-btn secondary" id="ao-words">Words only · ${audioFmtMB(words)}</button>` : ""}
      <button class="modal-btn secondary" id="ao-no">Not now</button>
    </div>
    <div class="audio-offer-note">Best on Wi-Fi. You can change your mind any time in Settings → Sound &amp; voice.</div>
  </div>`;
  const close = () => { document.removeEventListener("keydown", key, true); el.remove(); };
  const key = e => { if (e.key === "Escape") { e.preventDefault(); close(); } };
  document.addEventListener("keydown", key, true);
  el.onclick = e => { if (e.target === el) close(); };
  document.body.appendChild(el);
  el.querySelector("#ao-all").onclick = () => { close(); audioDownloadWithPill(["w", "s"]); };
  const w = el.querySelector("#ao-words"); if (w) w.onclick = () => { close(); audioDownloadWithPill(["w"]); };
  el.querySelector("#ao-no").onclick = close;
  setTimeout(() => { const b = el.querySelector("#ao-all"); if (b) b.focus(); }, 50);
}

// Start a download and show a small progress pill at the bottom until
// it ends (the Settings page shows the same progress).
function audioDownloadWithPill(kinds) {
  if (AUDIO.dl) return;                                // already running: its pill and toast stay
  audioPill(true);
  audioDownload(kinds).then(outcome => {
    audioPill(false);
    if (typeof showCelebrateToast !== "function") return;
    if (outcome === "error") showCelebrateToast("⚠️", "Voices not downloaded", AUDIO.error);
    else if (outcome === "done") showCelebrateToast("🔊", "Natural voices ready", "They work offline now");
  });
}
let _audioPillOff = null;
function audioPill(on) {
  let pill = document.getElementById("audio-pill");
  if (!on) { if (pill) pill.remove(); if (_audioPillOff) { _audioPillOff(); _audioPillOff = null; } return; }
  if (!pill) {
    pill = document.createElement("div");
    pill.id = "audio-pill"; pill.className = "audio-pill";
    document.body.appendChild(pill);
  }
  const paint = () => {
    const j = AUDIO.dl;
    if (!j) return;
    const pct = _audioPct(j);
    pill.innerHTML = `<span>🔊 Downloading… ${pct}%</span><span class="audio-pill-bar"><i style="width:${pct}%"></i></span><button class="audio-pill-x" aria-label="Stop downloading" onclick="audioCancelDownload()">✕</button>`;
  };
  paint();
  if (_audioPillOff) _audioPillOff();
  _audioPillOff = audioOnChange(paint);
}

// ── SETTINGS ROWS (Sound & voice page) ────────
function _audioPct(j) { return j.total ? Math.min(100, Math.round(j.done / j.total * 100)) : 0; }
function _audioProgressText(j) { return `Downloading… ${_audioPct(j)}% (${audioFmtMB(j.done)} of ${audioFmtMB(j.total)}). Keep the app open.`; }
function audioSettingsHtml() {
  if (!AUDIO.ready || !audioSupported()) return "";
  const p = audioPrefs(), m = AUDIO.manifest, r = AUDIO.remote;
  if (!r) audioRefreshRemote();                        // maybe it is published and we just didn't know
  if (!m && !r && !AUDIO.dl) return "";                // nothing published yet: stay out of the way
  const lang = WORD_KEY === "fr" ? "French" : "German";
  const kinds = audioInstalledKinds();
  const pack = r || m;
  const allB = audioBytes(pack, ["w", "s"]), wordsB = audioBytes(pack, ["w"]);
  const j = AUDIO.dl;
  let status, buttons = "";
  if (j) {
    status = _audioProgressText(j);
    buttons = `<button class="set-seg-btn" onclick="audioCancelDownload()">Stop</button>`;
  } else if (!kinds.length) {
    status = `Not on this device. Recorded words and sentences sound far more natural than the system voice, and work offline.`;
    buttons = `<button class="set-seg-btn on" onclick="audioDownloadWithPill(['w','s'])">Download all · ${audioFmtMB(allB)}</button>` +
      (wordsB < allB ? `<button class="set-seg-btn" onclick="audioDownloadWithPill(['w'])">Words only · ${audioFmtMB(wordsB)}</button>` : "");
  } else {
    const have = kinds.includes("s") ? "words and sentences" : "words only";
    status = `On this device — ${have}, works offline.`;
    if (audioNeedsRepair()) status = `Some files are missing from this device (the browser cleared them?).`;
    if (audioUpdateAvailable()) status = `A newer recording is available.`;
    const fix = audioNeedsRepair() ? `<button class="set-seg-btn on" onclick="audioDownloadWithPill(${_audioKindsJs(p.want)})">Repair</button>` : "";
    const upd = audioUpdateAvailable() ? `<button class="set-seg-btn on" onclick="audioDownloadWithPill(${_audioKindsJs(p.want.length ? p.want : kinds)})">Update</button>` : "";
    const more = !kinds.includes("s") && r && audioCount(r, "s") ? `<button class="set-seg-btn" onclick="audioDownloadWithPill(['w','s'])">Add sentences · ${audioFmtMB(audioBytes(r, ["s"]))}</button>` : "";
    buttons = upd + fix + more + `<button class="set-seg-btn" onclick="audioSample()">▶ Hear a sample</button><button class="set-seg-btn" onclick="audioRemoveConfirm()">Remove</button>`;
  }
  const err = AUDIO.error && !j ? `<div class="set-choice-sub audio-err">⚠️ ${escapeHtml(AUDIO.error)}</div>` : "";
  const misses = audioMissCount();
  return `
    <div class="set-group-title">Natural ${lang} voice</div>
    ${kinds.length ? setSwitchHtml("🗣️", "Use the natural voice", "Off = the phone's own voice, like before. Anything without a recording uses it too.", p.use, "audioToggleUse()") : ""}
    <div class="set-choice">
      <div class="set-choice-head"><span class="set-icon">⬇️</span><span class="set-label">Voice pack</span></div>
      <div class="set-choice-sub" id="audio-status">${status}</div>
      ${j ? `<div class="audio-bar"><i id="audio-bar-fill" style="width:${_audioPct(j)}%"></i></div>` : ""}
      <div class="set-seg audio-seg">${buttons}</div>
      ${err}
    </div>
    ${kinds.length && misses ? setNavHtml("📝", `Copy ${misses} phrase${misses === 1 ? "" : "s"} without a recording`, "Paste them to Claude to add them to the next voice pack", "audioCopyMisses()") : ""}`;
}
// ["w","s"] as a JS literal that is safe inside a double-quoted onclick.
function _audioKindsJs(kinds) { return "[" + kinds.map(k => `'${k}'`).join(",") + "]"; }
function audioToggleUse() { audioSetUse(!audioPrefs().use); if (typeof renderSettingsPanel === "function") renderSettingsPanel(); }
async function audioRemoveConfirm() {
  const ok = await appConfirm({ title: "Remove the natural voices?", body: "This frees the space. You can download them again any time.", ok: "Remove", cancel: "Keep", danger: true });
  if (ok) { await audioRemove(); if (typeof renderSettingsPanel === "function") renderSettingsPanel(); }
}
function audioCopyMisses() {
  const text = audioMissText();
  const done = () => { audioClearMisses(); if (typeof showCelebrateToast === "function") showCelebrateToast("📝", "Copied", "Paste it to Claude"); if (typeof renderSettingsPanel === "function") renderSettingsPanel(); };
  try { navigator.clipboard.writeText(text).then(done, () => prompt("Copy this list:", text)); } catch (e) { prompt("Copy this list:", text); }
}
// Keep the open Settings page in step with a running download: numbers
// are painted in place (re-rendering would swallow a tap on "Stop").
audioOnChange(kind => {
  const sp = document.getElementById("settings-panel");
  if (!sp || sp.style.display !== "block" || typeof settingsPage === "undefined" || settingsPage !== "sound") return;
  if (kind === "progress" && AUDIO.dl) {
    const st = document.getElementById("audio-status"), bar = document.getElementById("audio-bar-fill");
    if (st) st.textContent = _audioProgressText(AUDIO.dl);
    if (bar) bar.style.width = _audioPct(AUDIO.dl) + "%";
    return;
  }
  if (typeof renderSettingsPanel === "function") {
    const sheet = sp.querySelector(".settings-sheet"), y = sheet ? sheet.scrollTop : 0;
    renderSettingsPanel();
    const s2 = sp.querySelector(".settings-sheet"); if (s2) s2.scrollTop = y;
  }
});
