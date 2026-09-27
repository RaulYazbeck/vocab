// ── GAMES CORE ────────────────────────────────
// Shared engine for the minigames (game-*.js). Owns:
//   • the registry — each game file calls registerGame() at load
//   • the word pool — "words you know", or the decks picked in the hub
//   • word helpers — display forms, gender/plural parsing, distractors
//   • the lifecycle — HUD, intro, countdown, pause, cleanup, results
//   • the hub, the pool picker, Daily Challenge, Arcade Mix and the
//     Surprise Rounds that pop up inside Drill
//
// Progress rules (decided with the user):
//   • Games give XP and feed the daily goal at a discount
//     (creditGameAnswers in progression.js) but never touch mastery —
//     except Boss Battle, which is typed recall and counts like Drill.
//   • Anki cards join the pool only once introduced, and games never
//     write to ws.anki.
//
// A game definition:
//   { id, name, icon, skill, howTo:[…lines], timed, noPause,
//     requirement(pool) → { ok, reason },
//     start(ctx),               // begins play; ctx documented at makeCtx
//     stars:[s1,s2,s3] | starsFor(result),
//     xpFor?(result, size),     // override the default XP formula
//     inRuns? (default true) }  // may appear in Daily / Mix rounds
// ─────────────────────────────────────────────

const GAMES = [];
function registerGame(def) { GAMES.push(def); }
function getGame(id) { return GAMES.find(g => g.id === id) || null; }

const IS_FRENCH_APP = WORD_KEY === "fr";
const GAME_RUN_EXCLUDE = new Set(["boss"]); // long, typed — hub only

// ── RNG ───────────────────────────────────────
function hashString(str) {
  let h = 2166136261;
  for (let i = 0; i < str.length; i++) { h ^= str.charCodeAt(i); h = Math.imul(h, 16777619); }
  return h >>> 0;
}
// mulberry32 — tiny deterministic PRNG (Daily Challenge picks)
function seededRandom(seed) {
  let a = seed >>> 0;
  return function () {
    a = (a + 0x6D2B79F5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
function randInt(n) { return Math.floor(Math.random() * n); }

// ── WORD HELPERS ──────────────────────────────
function wordKey(w) { return w.deckId + "_" + w.idx; }
function sameWord(a, b) { return !!a && !!b && a.deckId === b.deckId && a.idx === b.idx; }

const ARTICLE_RE = /^(der|die|das|den|dem|le|la|un|une)$/i;

// Clean display form of an answer string:
//   "die Katze, -n"            → "die Katze"
//   "der Mann, pl. die Männer" → "der Mann"
//   "sie (plural 3rd person)"  → "sie"
//   "der Lehrer / die Lehrerin"→ "der Lehrer"
//   "[sich (AKK)] verstecken"  → "sich verstecken"
//   "lesen +AKK"               → "lesen"
//   "der Mann, der"            → unchanged (relative clause, not a plural)
//   "der/das Joghurt"          → unchanged (article alternatives)
function formOf(s) {
  let t = String(s == null ? "" : s);
  if (t.includes(" / ")) t = t.split(" / ")[0];
  else if (t.includes("/")) {
    const before = t.slice(0, t.indexOf("/")).trim().split(/\s+/).pop() || "";
    if (!ARTICLE_RE.test(before)) t = t.slice(0, t.indexOf("/"));
  }
  t = t.replace(/\(.*?\)/g, " ").replace(/[\[\]]/g, "");
  t = t.replace(/\s*\+\s*[A-ZÄÖÜ]{2,}\b/g, "");
  t = t.replace(/,\s*(pl\.|-|¨|–).*$/, "");
  t = t.replace(/\s+([.,!?;:])/g, "$1").replace(/\s+/g, " ").trim();
  return t.replace(/,$/, "").trim() || String(s || "").trim();
}
const _formCache = new Map();
function gameForm(word) {
  const raw = word[WORD_KEY];
  let f = _formCache.get(raw);
  if (f === undefined) { f = formOf(raw); _formCache.set(raw, f); }
  return f;
}
function gamePrompt(word) { return String(word.en || "").trim(); }
const _normCache = new Map();
function normKey(s) {
  s = String(s || "");
  let k = _normCache.get(s);
  if (k === undefined) { k = normalize(s); _normCache.set(s, k); }
  return k;
}

// Part of speech, from the article or the hint text (both languages).
function posOf(word) {
  const f = gameForm(word);
  if (/^(der|die|das|le|la|les|l'|un|une)\s/i.test(f) || /^l'/i.test(f)) return "noun";
  const h = String(word.hint || "").toLowerCase();
  if (/noun|sustantivo|nombre/.test(h)) return "noun";
  if (/partizip/.test(h)) return "participle";
  if (/verb|verbo/.test(h)) return "verb";
  if (/adjecti|adjetivo/.test(h)) return "adj";
  if (/adverb|adverbio/.test(h)) return "adv";
  if (/number|número|numero/.test(h)) return "num";
  if (/phrase|frase|expresión|expresion|locución/.test(h)) return "phrase";
  return f.split(" ").length >= 3 ? "phrase" : "other";
}

// Gender of a noun → { answer, noun, full } or null when the word is
// not a clean single noun with one unambiguous article.
const _nounCache = new Map();
function nounParts(word) {
  const k = word[WORD_KEY] + "|" + (word.hint || "") + "|" + (word.pl || "");
  if (_nounCache.has(k)) return _nounCache.get(k);
  const res = _parseNoun(word);
  _nounCache.set(k, res);
  return res;
}
function _parseNoun(word) {
  const raw = String(word[WORD_KEY] || "");
  const hint = String(word.hint || "");
  if (/plural|always pl|\bpl\.\)/i.test(hint) || /always pl/i.test(raw) || /\(pl(\.|ural)?\)/i.test(word.en || "")) return null;
  const f = gameForm(word);
  if (IS_FRENCH_APP) {
    if (raw.includes("/")) return null;
    const m = f.match(/^(le|la|un|une)\s+(\S.*)$/i);
    if (!m || /[,!?]/.test(m[2])) return null;
    const art = m[1].toLowerCase();
    const answer = (art === "le" || art === "un") ? "le" : "la";
    return { answer, noun: m[2], full: f };
  }
  // German: alternatives with different articles are genuinely ambiguous
  const alts = raw.split("/");
  if (alts.length > 1) {
    const arts = alts.map(a => ((a.trim().match(/^(der|die|das)\b/i) || [])[1] || "").toLowerCase());
    if (new Set(arts).size > 1) return null;
  }
  const m = f.match(/^(der|die|das)\s+([A-ZÄÖÜ][\p{L}-]*)$/u);
  if (!m) return null;
  const answer = m[1].toLowerCase(), noun = m[2];
  // "die Ferien, pl. die Ferien": feminine nouns always change in the
  // plural, so an unchanged "die" plural means a plural-only noun.
  const pl = germanPluralNoun(word);
  if (answer === "die" && pl && pl === noun) return null;
  return { answer, noun, full: f };
}

// The plural noun (without article) of a German noun, from the `pl`
// field (A1–B1 decks) or the JM-style annotation in the answer.
function germanPluralNoun(word) {
  if (IS_FRENCH_APP) return null;
  const raw = String(word[WORD_KEY] || "");
  if (word.pl) {
    const m = String(word.pl).trim().match(/^die\s+([A-ZÄÖÜ][\p{L}-]*)$/u);
    return m ? m[1] : null;
  }
  let m = raw.match(/,\s*pl\.\s*die\s+([A-ZÄÖÜ][\p{L}-]*)\s*$/u);
  if (m) return m[1];
  m = raw.match(/^(?:der|die|das)\s+([A-ZÄÖÜ][\p{L}]*),\s*-([a-zäöüß]*)\s*$/u);
  if (m) return m[1] + m[2];
  return null;
}

// Distractors: other words whose display form AND prompt both differ
// from the answer's (so duplicates like FR "bonjour" ×2 or DE sie/Sie
// can never mark a right answer wrong). Prefers the same part of
// speech, the same deck and a similar length; falls back to the whole
// app vocabulary when the pool is small.
let _allGameWords = null;
function allGameWords() {
  if (!_allGameWords) {
    _allGameWords = [];
    ALL_GROUPS.forEach(g => g.decks.forEach(d => d.words.forEach((w, i) =>
      _allGameWords.push({ ...w, deckId: d.id, deckName: d.name, idx: i, anki: g.type === "anki" }))));
  }
  return _allGameWords;
}
function pickDistractors(word, pool, n, formFn = gameForm, filterFn = null) {
  const bad = new Set([normKey(formFn(word))]);
  const badP = new Set([normKey(gamePrompt(word))]);
  const pos = posOf(word);
  const len = formFn(word).length;
  const out = [];
  const take = list => {
    const scored = list
      .filter(w => !sameWord(w, word) && (!filterFn || filterFn(w)))
      .map(w => ({ w, s: (posOf(w) === pos ? 3 : 0) + (w.deckId === word.deckId ? 1.5 : 0)
        + (Math.abs(formFn(w).length - len) <= 3 ? 1 : 0) + Math.random() * 1.6 }))
      .sort((a, b) => b.s - a.s);
    for (const { w } of scored) {
      if (out.length >= n) break;
      const f = normKey(formFn(w)), p = normKey(gamePrompt(w));
      if (!f || bad.has(f) || badP.has(p)) continue;
      bad.add(f); badP.add(p); out.push(w);
    }
  };
  take(pool);
  if (out.length < n) take(allGameWords().filter(w => w.deckId === word.deckId));
  if (out.length < n) take(allGameWords());
  return out;
}

// Number of distinct words (by display form and prompt) in a list.
function distinctCount(list, formFn = gameForm) {
  const f = new Set(), p = new Set();
  let n = 0;
  list.forEach(w => {
    const a = normKey(formFn(w)), b = normKey(gamePrompt(w));
    if (!a || f.has(a) || p.has(b)) return;
    f.add(a); p.add(b); n++;
  });
  return n;
}

// ── WORD POOL ─────────────────────────────────
// Vocab words count as known once answered (or, for decks picked
// explicitly, once unlocked). Anki cards once introduced. S.words is
// read directly so building a pool never creates word records.
function poolWordsForDeck(deck, explicit) {
  const out = [];
  const anki = isAnkiDeck(deck.id);
  const mk = (w, i) => ({ ...w, deckId: deck.id, deckName: deck.name, idx: i, anki });
  if (anki) {
    deck.words.forEach((w, i) => {
      const ws = S.words[deck.id + "_" + i];
      if (ws && ws.anki && ws.anki.phase && ws.anki.phase !== "new") out.push(mk(w, i));
    });
  } else {
    unlockedWords(deck).forEach((w, i) => {
      if (explicit) { out.push(mk(w, i)); return; }
      const ws = S.words[deck.id + "_" + i];
      if (ws && (ws.correct || 0) + (ws.wrong || 0) > 0) out.push(mk(w, i));
    });
  }
  return out;
}
function validDeckIds(ids) { return (ids || []).filter(id => !!getDeck(id)); }
function buildGamePool(deckIds) {
  const out = [];
  const ids = deckIds ? validDeckIds(deckIds) : null;
  if (ids && ids.length) ids.forEach(id => out.push(...poolWordsForDeck(getDeck(id), true)));
  else ALL_GROUPS.forEach(g => g.decks.forEach(d => out.push(...poolWordsForDeck(d, false))));
  return out;
}

// How much a word needs practice — higher = shows up more.
function wordWeakness(w) {
  const ws = S.words[wordKey(w)];
  if (!ws) return 1;
  let s = 1;
  if (w.anki) {
    const a = ws.anki || {};
    s += (a.lapses || 0) * 1.5 + (a.phase === "learning" || a.phase === "relearning" ? 2 : 0) + ((a.ease || 2.5) < 2.3 ? 1 : 0);
  } else {
    const c = ws.correct || 0, x = ws.wrong || 0;
    if (isStruggling(ws)) s += 4;
    else if (!isMastered(ws)) s += 2;
    if (x > c) s += Math.min(6, x - c);
  }
  return s;
}
function weightedPickDistinct(list, n, weightFn) {
  const items = list.map(w => ({ w, wt: Math.max(0.01, weightFn(w)) }));
  const out = [];
  while (out.length < n && items.length) {
    let total = 0; items.forEach(it => total += it.wt);
    let r = Math.random() * total, i = 0;
    for (; i < items.length - 1; i++) { r -= items[i].wt; if (r <= 0) break; }
    out.push(items[i].w); items.splice(i, 1);
  }
  return out;
}
// n words, ~60% weighted toward weak words, ~40% uniform. Repeats only
// when the list is smaller than n, and never twice in a row.
function sampleWords(list, n) {
  if (!list.length) return [];
  const out = [];
  while (out.length < n) {
    const need = Math.min(n - out.length, list.length);
    const weak = weightedPickDistinct(list, Math.round(need * 0.6), wordWeakness);
    const rest = shuffle(list.filter(w => !weak.includes(w))).slice(0, need - weak.length);
    const batch = shuffle([...weak, ...rest]);
    if (out.length && batch.length > 1 && sameWord(batch[0], out[out.length - 1])) [batch[0], batch[1]] = [batch[1], batch[0]];
    out.push(...batch);
  }
  return out;
}
// Drop words whose form or prompt repeats an earlier one.
function dedupeWords(list, formFn = gameForm) {
  const f = new Set(), p = new Set();
  return list.filter(w => {
    const a = normKey(formFn(w)), b = normKey(gamePrompt(w));
    if (!a || f.has(a) || p.has(b)) return false;
    f.add(a); p.add(b); return true;
  });
}

// ── LIFECYCLE / CLEANUP ───────────────────────
// Every timer, frame and listener a game creates goes through these
// wrappers, so stopActiveGame() can guarantee nothing survives a quit.
const _gt = { timeouts: new Set(), intervals: new Set(), rafs: new Set(), listeners: [] };
function gTimeout(fn, ms) {
  const id = setTimeout(() => { _gt.timeouts.delete(id); fn(); }, ms);
  _gt.timeouts.add(id); return id;
}
function gClearTimeout(id) { clearTimeout(id); _gt.timeouts.delete(id); }
function gInterval(fn, ms) { const id = setInterval(fn, ms); _gt.intervals.add(id); return id; }
function gClearInterval(id) { clearInterval(id); _gt.intervals.delete(id); }
function gRaf(fn) {
  const id = requestAnimationFrame(t => { _gt.rafs.delete(id); fn(t); });
  _gt.rafs.add(id); return id;
}
function gListen(target, type, fn, opts) { target.addEventListener(type, fn, opts); _gt.listeners.push([target, type, fn, opts]); }
function gameTimersActive() { return _gt.timeouts.size + _gt.intervals.size + _gt.rafs.size; }

let activeGame = null;   // { def, ctx } while a game screen is up
let gameRun    = null;   // Daily / Mix / Surprise sequence in progress
let gameHubDeckIds = null; // start-bar selection (session only), else S.games.pool

function stopActiveGame() {
  _gt.timeouts.forEach(clearTimeout); _gt.timeouts.clear();
  _gt.intervals.forEach(clearInterval); _gt.intervals.clear();
  _gt.rafs.forEach(cancelAnimationFrame); _gt.rafs.clear();
  _gt.listeners.forEach(([t, type, fn, o]) => t.removeEventListener(type, fn, o));
  _gt.listeners = [];
  if (activeGame && activeGame.ctx) activeGame.ctx.dead = true;
  activeGame = null;
}
// Full exit (Menu button / backToMenu): also abandons any sequence.
function quitAllGames() { stopActiveGame(); gameRun = null; flushDeferredCelebrations(); }

// Pausable clock: elapsed ms excluding paused time, plus penalties.
function makeClock() {
  let acc = 0, last = 0, running = false;
  return {
    start() { if (!running) { running = true; last = performance.now(); } },
    pause() { if (running) { acc += performance.now() - last; running = false; } },
    add(ms) { acc += ms; },
    elapsed() { return acc + (running ? performance.now() - last : 0); },
    get running() { return running; },
  };
}

// ── CELEBRATIONS DURING PLAY ──────────────────
// Achievement / level-up / mastery toasts and their confetti would land
// on top of the question mid-round. While a round is in play they are
// held back and replayed once the results (or hub) are on screen.
let _deferredToasts = [], _deferredConfetti = 0;
const _toastNow = showCelebrateToast, _confettiNow = confettiBurst;
function gameInPlay() { return !!(activeGame && activeGame.ctx.started && !activeGame.ctx.finished && !activeGame.ctx.dead); }
showCelebrateToast = function (icon, title, sub) {
  if (gameInPlay()) { _deferredToasts.push([icon, title, sub]); return; }
  _toastNow(icon, title, sub);
};
confettiBurst = function (count) {
  if (gameInPlay()) { _deferredConfetti = Math.max(_deferredConfetti, count || 36); return; }
  _confettiNow(count);
};
function flushDeferredCelebrations() {
  const toasts = _deferredToasts, conf = _deferredConfetti;
  _deferredToasts = []; _deferredConfetti = 0;
  // Through the wrappers: if a new round has started by then, they wait again.
  if (conf) setTimeout(() => confettiBurst(conf), 500);
  toasts.forEach((t, i) => setTimeout(() => showCelebrateToast(...t), 900 + i * 1700));
}

// ── EFFECTS ───────────────────────────────────
const REDUCED_MOTION = !!(window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches);
function shakeEl(el) {
  if (!el || REDUCED_MOTION) return;
  el.classList.remove("g-shake"); void el.offsetWidth; el.classList.add("g-shake");
}
// soft: a gentler pop for wide elements that would overshoot the edges
function popEl(el, soft = false) {
  if (!el || REDUCED_MOTION) return;
  const cls = soft ? "g-pop-soft" : "g-pop";
  el.classList.remove(cls); void el.offsetWidth; el.classList.add(cls);
}
// Floating "+10" above an element.
function floatScore(anchor, text, cls = "") {
  if (!anchor || REDUCED_MOTION) return;
  const r = anchor.getBoundingClientRect();
  const el = document.createElement("div");
  el.className = "g-float " + cls;
  el.textContent = text;
  el.style.left = (r.left + r.width / 2) + "px";
  el.style.top = (r.top + window.scrollY) + "px";
  document.body.appendChild(el);
  setTimeout(() => el.remove(), 900);
}
function comboMult(combo) { return combo >= 20 ? 4 : combo >= 10 ? 3 : combo >= 5 ? 2 : 1; }

// ── MULTIPLE-CHOICE HELPERS ───────────────────
// options: [{ text, correct, word }]. Buttons carry data-i for clicks
// and number badges for keys 1–4 on desktop.
function mcOptionsHtml(options, cls = "") {
  return `<div class="g-options ${cls}">${options.map((o, i) => `
    <button class="g-opt${String(o.text).length > 26 ? " long" : ""}" data-i="${i}">
      <span class="g-key">${i + 1}</span><span class="g-opt-text">${escapeHtml(o.text)}</span>
    </button>`).join("")}</div>`;
}
// Mark the chosen/right options after an answer and lock the set.
function mcReveal(container, options, chosen) {
  container.querySelectorAll(".g-opt").forEach(btn => {
    const i = +btn.dataset.i;
    btn.disabled = true;
    if (options[i].correct) btn.classList.add("right");
    else if (i === chosen) btn.classList.add("wrong");
    else btn.classList.add("dim");
  });
}

// ── SCREEN SHELL & CONTEXT ────────────────────
// sizes: "full" (hub, sets bests/stars), "short" (Daily/Mix rounds),
// "bonus" (20-second Surprise Round inside Drill).
function launchGame(id, opts = {}) {
  const def = getGame(id);
  if (!def) return;
  stopActiveGame();
  const pool = opts.pool || buildGamePool(gameHubDeckIds || S.games.pool);
  const size = opts.size || "full";
  const req = gameRequirement(def, pool, size);
  if (!req.ok) { showCelebrateToast(def.icon, gameName(def), req.reason); return; }

  showGameScreen();
  const island = document.getElementById("floating-island");
  if (island) island.style.display = "none";
  const el = document.getElementById("main-screen");
  el.style.paddingBottom = "";
  const runLabel = gameRun ? `${gameRun.title} · ${gameRun.i + 1}/${gameRun.ids.length}` : "";
  el.innerHTML = `
    <div class="screen game-screen" id="game-screen" data-game="${def.id}">
      <div class="g-hud">
        <button class="g-hud-btn" onclick="quitGame()" aria-label="Quit">✕</button>
        <div class="g-hud-title">
          <span class="g-hud-name">${def.icon} ${escapeHtml(gameName(def))}</span>
          ${runLabel ? `<span class="g-hud-run">${escapeHtml(runLabel)}</span>` : ""}
        </div>
        <button class="g-hud-btn" onclick="showGameHelp()" aria-label="How to play">?</button>
        ${def.timed && !def.noPause ? `<button class="g-hud-btn" id="g-pause-btn" onclick="toggleGamePause()" aria-label="Pause">⏸</button>` : ""}
      </div>
      <div class="g-stats">
        <span class="g-stat g-score" id="g-score">0</span>
        <span class="g-stat g-lives" id="g-lives"></span>
        <span class="g-stat g-combo" id="g-combo"></span>
        <span class="g-stat g-clock" id="g-clock"></span>
      </div>
      <div class="g-bar"><div class="g-bar-fill" id="g-bar-fill"></div></div>
      <div class="g-stage" id="g-stage"></div>
      <div class="g-live" id="g-live" aria-live="polite"></div>
      <div class="g-overlay" id="g-overlay" style="display:none"></div>
    </div>`;
  window.scrollTo({ top: 0, behavior: "instant" });

  const ctx = makeCtx(def, pool, size, opts);
  activeGame = { def, ctx };
  // Deferred: the keypress that opened this screen (e.g. Enter in Drill
  // triggering a Surprise Round) is still bubbling and must not reach us.
  gTimeout(() => gListen(document, "keydown", e => gameKeydown(e, ctx)), 0);
  gListen(document, "visibilitychange", () => { if (document.hidden) pauseGame(true); });

  const introSeen = (() => { try { return localStorage.getItem("gv_game_intro_" + def.id) === "1"; } catch (e) { return true; } })();
  const go = () => {
    try { localStorage.setItem("gv_game_intro_" + def.id, "1"); } catch (e) {}
    if (def.timed) runCountdown(ctx, () => beginGame(ctx));
    else beginGame(ctx);
  };
  if (!introSeen || opts.forceIntro) showGameIntro(ctx, go);
  else if (gameRun || size === "bonus") showRoundSplash(ctx, go);
  else go();
}
function gameName(def) { return typeof def.name === "function" ? def.name() : def.name; }

// The hub asks every game's requirement several times per render (tiles,
// Daily, Mix) over thousands of words — memoised per pool array.
const _reqMemo = new WeakMap();
function gameRequirement(def, pool, size) {
  let m = _reqMemo.get(pool);
  if (!m) { m = new Map(); _reqMemo.set(pool, m); }
  const k = def.id + "|" + size;
  if (!m.has(k)) m.set(k, def.requirement(pool, size));
  return m.get(k);
}

function beginGame(ctx) {
  if (ctx.dead) return;
  ctx.started = true;
  ctx.clock.start();
  try { ctx.def.start(ctx); }
  catch (e) { console.error("game start failed:", ctx.def.id, e); showCelebrateToast("⚠️", "Something went wrong", "Returning to the hub"); quitGame(); }
}

// The object handed to every game.
//   ctx.pool / size / stage / clock / rounds(full, short, bonus)
//   ctx.setScore(n) setLives(n, max) setCombo(n) setBar(frac, cls)
//   ctx.setClock(text, urgent) say(text) missed(word) finish(result)
//   ctx.onKey(e) / onPause() / onResume()  — optional game hooks
//   ctx.busy — set while feedback shows, so double taps are ignored
function makeCtx(def, pool, size, opts) {
  const $ = id => document.getElementById(id);
  const ctx = {
    def, pool, size, opts,
    stage: $("g-stage"),
    clock: makeClock(),
    busy: false, dead: false, paused: false, started: false, finished: false,
    missedWords: [],
    rounds(full, short, bonus) { return size === "full" ? full : size === "short" ? short : (bonus ?? short); },
    setScore(n) { const e = $("g-score"); if (e) { e.textContent = n.toLocaleString(); popEl(e); } },
    setLives(n, max) { const e = $("g-lives"); if (e) e.textContent = "❤️".repeat(Math.max(0, n)) + "🖤".repeat(Math.max(0, max - n)); },
    setCombo(n) {
      const e = $("g-combo"); if (!e) return;
      const m = comboMult(n);
      e.textContent = n >= 2 ? `🔥${n}${m > 1 ? ` ×${m}` : ""}` : "";
      e.classList.toggle("hot", m > 1);
    },
    setBar(frac, cls = "") {
      const e = $("g-bar-fill"); if (!e) return;
      e.style.width = Math.max(0, Math.min(1, frac)) * 100 + "%";
      e.className = "g-bar-fill " + cls;
    },
    setClock(text, urgent = false) { const e = $("g-clock"); if (e) { e.textContent = text; e.classList.toggle("urgent", urgent); } },
    say(text) { const e = $("g-live"); if (e) e.textContent = text; },
    missed(word) { if (word && !ctx.missedWords.some(w => sameWord(w, word))) ctx.missedWords.push(word); },
    finish(result) {
      if (ctx.finished || ctx.dead) return;
      ctx.finished = true;
      ctx.clock.pause();
      finishGame(ctx, result);
    },
  };
  return ctx;
}

// ── INTRO / COUNTDOWN / PAUSE ─────────────────
// Splash buttons ignore activation for a moment after they appear, and
// take focus only then: a keystroke that opened the screen (Enter in
// Drill) must not also press its Start button.
const OVERLAY_GUARD_MS = 400;
function armOverlayButton(btn, fn) {
  const shownAt = performance.now();
  btn.onclick = () => { if (performance.now() - shownAt < OVERLAY_GUARD_MS) return; fn(); };
  setTimeout(() => { if (btn.isConnected) btn.focus({ preventScroll: true }); }, OVERLAY_GUARD_MS);
}
function overlay(html) {
  const o = document.getElementById("g-overlay");
  if (!o) return null;
  o.innerHTML = html;
  o.style.display = html ? "flex" : "none";
  return o;
}
function showGameIntro(ctx, onGo) {
  const d = ctx.def;
  const o = overlay(`<div class="g-card">
      <div class="g-card-icon">${d.icon}</div>
      <div class="g-card-title">${escapeHtml(gameName(d))}</div>
      <div class="g-card-skill">${escapeHtml(d.skill)}</div>
      <ul class="g-howto">${(typeof d.howTo === "function" ? d.howTo() : d.howTo).map(l => `<li>${l}</li>`).join("")}</ul>
      <button class="g-big-btn" id="g-go">${ctx.started ? "Resume" : "Let's go"}</button>
      ${ctx.size === "bonus" && !ctx.started ? `<button class="g-link-btn" onclick="quitGame()">Skip bonus</button>` : ""}
    </div>`);
  if (!o) return;
  armOverlayButton(o.querySelector("#g-go"), () => { overlay(""); onGo(); });
}
function showRoundSplash(ctx, onGo) {
  const d = ctx.def;
  const sub = ctx.size === "bonus" ? "🎁 Bonus round — 20 seconds!" : escapeHtml(d.skill);
  const o = overlay(`<div class="g-card">
      <div class="g-card-icon">${d.icon}</div>
      <div class="g-card-title">${escapeHtml(gameName(d))}</div>
      <div class="g-card-skill">${sub}</div>
      <button class="g-big-btn" id="g-go">Start</button>
      ${ctx.size === "bonus" ? `<button class="g-link-btn" id="g-skip">Skip bonus</button>` : ""}
    </div>`);
  if (!o) return;
  armOverlayButton(o.querySelector("#g-go"), () => { overlay(""); onGo(); });
  const skip = o.querySelector("#g-skip");
  if (skip) armOverlayButton(skip, quitGame);
}
function runCountdown(ctx, onDone) {
  let n = 3;
  const step = () => {
    if (ctx.dead) return;
    if (n === 0) { overlay(""); playCountdown(true); onDone(); return; }
    overlay(`<div class="g-countdown" aria-live="assertive">${n}</div>`);
    playCountdown(false);
    n--;
    gTimeout(step, 650);
  };
  step();
}
function showGameHelp() {
  if (!activeGame) return;
  const ctx = activeGame.ctx;
  const wasRunning = ctx.started && !ctx.paused && !ctx.finished;
  if (wasRunning && ctx.def.timed) pauseGame(false);
  showGameIntro(ctx, () => {
    if (!ctx.started) { if (ctx.def.timed) runCountdown(ctx, () => beginGame(ctx)); else beginGame(ctx); }
    else if (ctx.paused) resumeGame();
  });
}
function pauseGame(auto) {
  if (!activeGame) return;
  const ctx = activeGame.ctx;
  if (!ctx.def.timed || ctx.def.noPause || !ctx.started || ctx.paused || ctx.finished) return;
  ctx.paused = true;
  ctx.clock.pause();
  if (ctx.onPause) ctx.onPause();
  const o = overlay(`<div class="g-card">
      <div class="g-card-icon">⏸</div>
      <div class="g-card-title">Paused</div>
      <div class="g-card-skill">${auto ? "The game paused while the app was in the background." : "Take a breath."}</div>
      <button class="g-big-btn" id="g-resume">Tap to continue</button>
      <button class="g-link-btn" onclick="quitGame()">Quit game</button>
    </div>`);
  if (o) armOverlayButton(o.querySelector("#g-resume"), resumeGame);
}
function resumeGame() {
  if (!activeGame) return;
  const ctx = activeGame.ctx;
  if (!ctx.paused) { overlay(""); return; }
  overlay("");
  ctx.paused = false;
  ctx.clock.start();
  if (ctx.onResume) ctx.onResume();
}
function toggleGamePause() {
  if (!activeGame) return;
  if (activeGame.ctx.paused) resumeGame(); else pauseGame(false);
}
function gameKeydown(e, ctx) {
  if (ctx.dead) return;
  const ov = document.getElementById("g-overlay");
  const overlayUp = ov && ov.style.display !== "none";
  if (e.key === "Escape") { e.preventDefault(); if (ctx.paused) resumeGame(); else pauseGame(false); return; }
  if (overlayUp) {
    if (e.key === "Enter") { const b = ov.querySelector(".g-big-btn"); if (b && document.activeElement !== b) { e.preventDefault(); b.click(); } }
    return;
  }
  if (!ctx.started || ctx.paused || ctx.finished) return;
  if (e.metaKey || e.ctrlKey || e.altKey) return;
  if (ctx.onKey) ctx.onKey(e);
}
// Keys 1–N pick option N (multiple-choice games).
function digitKey(e, n) {
  if (e.target && e.target.tagName === "INPUT") return -1;
  const d = parseInt(e.key, 10);
  return d >= 1 && d <= n ? d - 1 : -1;
}

// Quit button: back to the hub — or, for a Drill bonus round, back to
// the drill. Nothing is recorded for an abandoned round.
function quitGame() {
  const run = gameRun;
  stopActiveGame();
  flushDeferredCelebrations();
  if (run && run.kind === "surprise") { gameRun = null; run.onDone && run.onDone(); return; }
  gameRun = null;
  openGamesHub();
}

// ── FINISH & REWARDS ──────────────────────────
function starsFor(def, result) {
  if (def.starsFor) return def.starsFor(result);
  const t = def.stars || [Infinity, Infinity, Infinity];
  return result.score >= t[2] ? 3 : result.score >= t[1] ? 2 : result.score >= t[0] ? 1 : 0;
}
// Default XP: ~2 per correct answer + 10 per star, capped per round.
function defaultGameXp(result, size, stars) {
  if (size === "bonus") return result.cleared ? 15 : Math.min(5, result.correct || 0);
  if (size === "short") return Math.min(30, (result.correct || 0) * 2);
  return Math.min(60, (result.correct || 0) * 2 + stars * 10);
}

function finishGame(ctx, result) {
  const def = ctx.def, size = ctx.size;
  stopActiveGame();
  result = Object.assign({ score: 0, correct: 0, wrong: 0, maxCombo: 0 }, result);
  result.missed = ctx.missedWords.slice();
  const G = S.games;
  const stars = size === "full" ? starsFor(def, result) : 0;
  const xp = Math.max(0, def.xpFor ? def.xpFor(result, size, stars) : defaultGameXp(result, size, stars));

  G.plays[def.id] = (G.plays[def.id] || 0) + 1;
  G.totalPlays = (G.totalPlays || 0) + 1;
  let newBest = false;
  if (size === "full") {
    const prevBest = G.best[def.id];
    if (prevBest === undefined || result.score > prevBest) { newBest = prevBest !== undefined && result.score > 0; G.best[def.id] = result.score; }
    if (stars > (G.stars[def.id] || 0)) G.stars[def.id] = stars;
  }
  if (def.onRecord) def.onRecord(result, size);
  creditGameAnswers(result.goalCorrect ?? result.correct);
  if (xp > 0) addExp(xp); // saves
  saveState();
  checkAchievements({ type: "game_end", game: def.id, size, stars, ...result });

  const summary = { def, size, result, stars, xp, newBest };
  if (newBest) {
    confettiBurst(40);
    showCelebrateToast("🏅", "New best!", `${gameName(def)} · ${result.score.toLocaleString()}`);
  }
  if (gameRun) { gameRunRoundDone(summary); return; }
  renderGameResults(summary, ctx);
}

function starsHtml(n, max = 3, cls = "") {
  let s = "";
  for (let i = 0; i < max; i++) s += `<span class="g-star ${i < n ? "on" : ""} ${cls}" style="animation-delay:${0.25 + i * 0.18}s">★</span>`;
  return s;
}
function missedListHtml(words) {
  if (!words.length) return "";
  return `<div class="g-missed">
    <div class="examples-title">Words to review (${words.length})</div>
    ${words.map(w => `<div class="g-missed-row">
      <span class="g-missed-en">${escapeHtml(gamePrompt(w))}</span>
      <span class="g-missed-target">${escapeHtml(gameForm(w))}</span>
      <button class="audio-btn g-missed-say" ${speakBtnAttrs(gameForm(w))} aria-label="Listen">🔊</button>
    </div>`).join("")}
  </div>`;
}
function renderGameResults(sum, ctx) {
  const { def, size, result, stars, xp, newBest } = sum;
  const emoji = def.id === "boss" ? (result.won ? "🏆" : "💀") : stars === 3 ? "🏆" : stars === 2 ? "🎉" : stars === 1 ? "👍" : "💪";
  const title = def.id === "boss" ? (result.won ? "Boss defeated!" : "The boss got away…")
    : stars === 3 ? "Outstanding!" : stars === 2 ? "Great round!" : stars === 1 ? "Nice work!" : "Keep practising!";
  if (stars >= 2 || (def.id === "boss" && result.won)) confettiBurst(stars === 3 ? 50 : 30);
  if (def.id === "boss" && !result.won) playGameOver(); else playAchievement();
  const best = S.games.best[def.id];
  const drillable = result.missed.filter(w => !w.anki);
  document.getElementById("main-screen").innerHTML = `
    <div class="screen game-screen">
      <div class="screen-top">
        <div class="screen-label">${def.icon} ${escapeHtml(gameName(def))}</div>
        <button class="back-btn" onclick="openGamesHub()">← Games</button>
      </div>
      <div class="result-screen g-results">
        <div class="result-emoji">${emoji}</div>
        <div class="result-title">${title}</div>
        ${size === "full" ? `<div class="g-stars-row">${starsHtml(stars, 3, "big")}</div>` : ""}
        ${newBest ? `<div class="g-newbest">🏅 New personal best!</div>` : ""}
        <div>
          <div class="result-stat"><strong>${result.score.toLocaleString()}</strong>score</div>
          <div class="result-stat"><strong>${result.correct}</strong>correct</div>
          ${result.maxCombo >= 3 ? `<div class="result-stat"><strong>🔥${result.maxCombo}</strong>best combo</div>` : ""}
          <div class="result-stat"><strong>+${xp} XP</strong>earned</div>
        </div>
        ${size === "full" && best !== undefined ? `<div class="g-best-line">Personal best: ${best.toLocaleString()}</div>` : ""}
        ${missedListHtml(result.missed)}
        <div class="g-result-actions">
          <button class="g-big-btn" id="g-again">↻ Play again</button>
          <button class="g-sec-btn" onclick="openGamesHub()">🎮 Games</button>
        </div>
        ${drillable.length ? `<button class="g-link-btn" id="g-drill-missed">📖 Drill these ${drillable.length} word${drillable.length > 1 ? "s" : ""} →</button>` : ""}
      </div>
    </div>`;
  const again = document.getElementById("g-again");
  again.onclick = () => launchGame(def.id, { pool: ctx.pool, size: "full" });
  again.focus({ preventScroll: true });
  const dm = document.getElementById("g-drill-missed");
  if (dm) dm.onclick = () => drillWords(drillable);
  flushDeferredCelebrations();
}

// Focus drill on exactly these vocab words (results → "Drill these").
function drillWords(words) {
  const uniq = [];
  words.forEach(w => { if (!w.anki && !uniq.some(u => sameWord(u, w))) uniq.push(w); });
  if (!uniq.length) return;
  quitAllGames();
  activeWords = uniq.map(w => {
    const src = getDeck(w.deckId).words[w.idx];
    return { ...src, deckId: w.deckId, deckName: w.deckName, idx: w.idx };
  });
  activeMode = "drill"; drillSubMode = "focus";
  sessionCorrect = 0; sessionConsecutive = 0;
  _surpriseShownAt = 0;
  startDrill();
}

// ── SEQUENCES (Daily Challenge, Arcade Mix, Surprise Round) ──
function startGameRun(kind, ids, opts = {}) {
  if (!ids.length) return;
  gameRun = { kind, ids, i: 0, summaries: [], pool: opts.pool, size: opts.size || "short",
    title: opts.title || "", onDone: opts.onDone || null };
  launchGame(ids[0], { pool: gameRun.pool, size: gameRun.size });
}
function gameRunRoundDone(sum) {
  const run = gameRun;
  run.summaries.push(sum);
  if (run.kind === "daily") dailyMarkDone(sum.def.id);
  if (run.kind === "surprise") { renderSurpriseResult(sum, run); return; }
  const last = run.i >= run.ids.length - 1;
  const el = document.getElementById("main-screen");
  const dailyBonus = run.kind === "daily" && last ? dailyCompleteIfDone() : 0;
  const totalXp = run.summaries.reduce((s, x) => s + x.xp, 0) + dailyBonus;
  const rows = run.summaries.map((x, i) => `<div class="g-run-row">
      <span>${i + 1}. ${x.def.icon} ${escapeHtml(gameName(x.def))}</span>
      <span>${x.result.correct} ✓ · +${x.xp} XP</span>
    </div>`).join("");
  const next = last ? null : getGame(run.ids[run.i + 1]);
  el.innerHTML = `<div class="screen game-screen">
      <div class="screen-top">
        <div class="screen-label">${escapeHtml(run.title)}</div>
        <button class="back-btn" onclick="gameRun=null;openGamesHub()">← Games</button>
      </div>
      <div class="result-screen g-results">
        <div class="result-emoji">${last ? (run.kind === "daily" ? "📆" : "🕹️") : sum.def.icon}</div>
        <div class="result-title">${last ? (run.kind === "daily" ? "Daily Challenge complete!" : "Arcade Mix complete!") : `Round ${run.i + 1} of ${run.ids.length} done`}</div>
        <div class="result-sub">${last ? `+${totalXp} XP in total${dailyBonus ? ` (incl. +${dailyBonus} challenge bonus)` : ""}` : `${sum.result.correct} correct · +${sum.xp} XP`}</div>
        <div class="g-run-list">${rows}</div>
        ${last ? missedListHtml(uniqWords(run.summaries.flatMap(x => x.result.missed))) : ""}
        <div class="g-result-actions">
          ${next ? `<button class="g-big-btn" id="g-next">Next: ${next.icon} ${escapeHtml(gameName(next))} →</button>`
                 : `<button class="g-big-btn" id="g-next">🎮 Back to games</button>`}
        </div>
      </div>
    </div>`;
  if (last && run.kind === "daily" && dailyBonus) { confettiBurst(60); playLevelUp(); }
  const btn = document.getElementById("g-next");
  btn.onclick = () => {
    if (next) { run.i++; launchGame(run.ids[run.i], { pool: run.pool, size: run.size }); }
    else { gameRun = null; openGamesHub(); }
  };
  btn.focus({ preventScroll: true });
  flushDeferredCelebrations();
}
function uniqWords(list) {
  const out = [];
  list.forEach(w => { if (!out.some(u => sameWord(u, w))) out.push(w); });
  return out;
}

// ── DAILY CHALLENGE ───────────────────────────
// Same three games all day (seeded by the date), chosen from the games
// the "All known words" pool supports. Each finished round is stored
// immediately, so leaving midway keeps progress.
const DAILY_BONUS_XP = 100;
function dailyState() {
  const d = S.games.daily, today = todayISO();
  if (d.date !== today) { d.date = today; d.done = []; }
  return d;
}
function dailyGameIds(pool) {
  const rng = seededRandom(hashString(todayISO() + "|" + STORAGE_KEY));
  const order = GAMES.map(g => g.id);
  for (let i = order.length - 1; i > 0; i--) { const j = Math.floor(rng() * (i + 1)); [order[i], order[j]] = [order[j], order[i]]; }
  return order.filter(id => {
    const g = getGame(id);
    return g.inRuns !== false && !GAME_RUN_EXCLUDE.has(id) && gameRequirement(g, pool, "short").ok;
  }).slice(0, 3);
}
function dailyMarkDone(id) {
  const d = dailyState();
  if (!d.done.includes(id)) d.done.push(id);
  saveState();
}
// Returns the bonus XP awarded (0 when not complete or already paid).
function dailyCompleteIfDone() {
  const d = dailyState();
  const ids = dailyGameIds(buildGamePool(null));
  if (ids.length < 2 || !ids.every(id => d.done.includes(id))) return 0;
  if (d.completedDates.includes(d.date)) return 0;
  d.completedDates.push(d.date);
  if (d.completedDates.length > 400) d.completedDates = d.completedDates.slice(-400);
  addExp(DAILY_BONUS_XP);
  saveState();
  checkAchievements({ type: "daily_challenge" });
  return DAILY_BONUS_XP;
}
function dailyStreak() {
  const dates = new Set(S.games.daily.completedDates);
  let day = todayISO();
  if (!dates.has(day)) day = addDays(day, -1);
  let n = 0;
  while (dates.has(day)) { n++; day = addDays(day, -1); }
  return n;
}
function startDailyChallenge() {
  const pool = buildGamePool(null);
  const ids = dailyGameIds(pool);
  const d = dailyState();
  const remaining = ids.filter(id => !d.done.includes(id));
  if (!remaining.length) { showCelebrateToast("📆", "Challenge done", "Come back tomorrow for a new one"); return; }
  startGameRun("daily", remaining, { pool, size: "short", title: "📆 Daily Challenge" });
}

// ── ARCADE MIX ────────────────────────────────
function startArcadeMix() {
  const pool = buildGamePool(gameHubDeckIds || S.games.pool);
  const ids = shuffle(GAMES.filter(g => g.inRuns !== false && !GAME_RUN_EXCLUDE.has(g.id) && gameRequirement(g, pool, "short").ok).map(g => g.id)).slice(0, 4);
  if (ids.length < 2) { showCelebrateToast("🕹️", "Arcade Mix", "Needs more known words"); return; }
  startGameRun("mix", ids, { pool, size: "short", title: "🕹️ Arcade Mix" });
}

// ── SURPRISE ROUNDS (inside Drill) ────────────
// After every 10th correct answer in typed Drill, pressing Next offers
// a 20-second bonus round on the drill's own words.
const SURPRISE_EVERY = 10;
const SURPRISE_GAMES = ["match", "gender", "blitz"];
let _surpriseShownAt = 0;
function maybeSurpriseRound() {
  if (!S.games || S.games.surprise === false) return false;
  if (activeMode !== "drill" || voiceEnabled) return false;
  if (!sessionCorrect || sessionCorrect % SURPRISE_EVERY !== 0 || _surpriseShownAt === sessionCorrect) return false;
  if (document.getElementById("unlock-modal")) return false;
  const pool = activeWords.map(w => ({ ...w, anki: isAnkiDeck(w.deckId) }));
  const options = SURPRISE_GAMES.filter(id => { const g = getGame(id); return g && gameRequirement(g, pool, "bonus").ok; });
  if (!options.length) return false;
  _surpriseShownAt = sessionCorrect;
  const id = options[randInt(options.length)];
  gameRun = { kind: "surprise", ids: [id], i: 0, summaries: [], pool, size: "bonus", title: "🎁 Bonus",
    onDone: resumeDrillAfterBonus };
  launchGame(id, { pool, size: "bonus" });
  return true;
}
function resumeDrillAfterBonus() {
  gameRun = null;
  answered = false;
  currentWord = drillSubMode === 'refresh' ? pickNextRefresh() : pickNext(drillSubMode === 'focus');
  initDrillScreen();
}
function renderSurpriseResult(sum) {
  const cleared = !!sum.result.cleared;
  if (cleared) { confettiBurst(30); playAchievement(); }
  document.getElementById("main-screen").innerHTML = `<div class="screen game-screen">
      <div class="result-screen g-results">
        <div class="result-emoji">${cleared ? "🎁" : "⏰"}</div>
        <div class="result-title">${cleared ? "Bonus cleared!" : "So close!"}</div>
        <div class="result-sub">${sum.result.correct} correct · +${sum.xp} XP</div>
        ${missedListHtml(sum.result.missed)}
        <div class="g-result-actions"><button class="g-big-btn" id="g-back-drill">Back to drill →</button></div>
      </div>
    </div>`;
  const b = document.getElementById("g-back-drill");
  b.onclick = resumeDrillAfterBonus;
  b.focus({ preventScroll: true });
  flushDeferredCelebrations();
}
function toggleSurpriseRounds() {
  S.games.surprise = !S.games.surprise;
  saveState();
  renderSettingsPanel();
}

// ── HUB ───────────────────────────────────────
// deckIds: from the start bar (session-only pool), or undefined to use
// the saved pool preference.
function openGamesHub(deckIds) {
  quitAllGames();
  closePoolPicker();
  clearGameCaches();
  if (deckIds !== undefined) gameHubDeckIds = validDeckIds(deckIds).length ? validDeckIds(deckIds) : null;
  showGameScreen();
  const island = document.getElementById("floating-island");
  if (island) island.style.display = "none";
  renderGamesHub();
}
function currentPoolIds() {
  if (gameHubDeckIds) return gameHubDeckIds;
  const saved = validDeckIds(S.games.pool);
  return saved.length ? saved : null;
}
function poolLabel(ids, pool) {
  if (gameHubDeckIds) return `Selected decks (${ids.length}) · ${pool.length} words`;
  if (!ids) return `All known words · ${pool.length}`;
  return ids.length === 1 ? `${getDeck(ids[0]).name} · ${pool.length} words` : `${ids.length} decks · ${pool.length} words`;
}
function renderGamesHub() {
  const el = document.getElementById("main-screen");
  el.style.paddingBottom = "";
  const ids = currentPoolIds();
  const pool = buildGamePool(ids);
  const top = `<div class="screen-top">
      <div class="screen-label">🎮 Games</div>
      <button class="back-btn" onclick="backToMenu()">← Menu</button>
    </div>
    <button class="g-pool-chip" onclick="openPoolPicker()">📚 ${escapeHtml(poolLabel(ids, pool))} <span class="g-pool-edit">change</span></button>`;

  if (!pool.length) {
    const names = ids ? ids.map(id => getDeck(id).name).join(", ") : "";
    el.innerHTML = `<div class="screen game-screen">${top}
      <div class="g-empty">
        <div class="g-empty-icon">🌱</div>
        <div class="g-empty-title">No words to play with yet</div>
        <div class="g-empty-sub">${ids
          ? `${escapeHtml(names)} ${ids.length > 1 ? "have" : "has"} no words you've met yet. Study ${ids.length > 1 ? "them" : "it"} first (Anki cards join once introduced), or pick other decks.`
          : "Games use words you already know. Drill a few words (or study some Anki cards) and come back!"}</div>
        <button class="g-big-btn" onclick="backToMenu()">← Back to decks</button>
      </div></div>`;
    return;
  }

  // Daily Challenge (always the "All known words" pool)
  const allPool = ids ? buildGamePool(null) : pool;
  const dIds = dailyGameIds(allPool);
  const d = dailyState();
  const dDone = dIds.filter(id => d.done.includes(id)).length;
  const dComplete = S.games.daily.completedDates.includes(todayISO());
  const streak = dailyStreak();
  const dailyHtml = dIds.length < 2
    ? `<div class="g-daily locked"><div class="g-daily-head"><span class="g-daily-title">📆 Daily Challenge</span></div>
        <div class="g-daily-sub">Get to know a few more words to unlock the daily challenge.</div></div>`
    : `<button class="g-daily ${dComplete ? "done" : ""}" onclick="startDailyChallenge()" ${dComplete ? "disabled" : ""}>
        <div class="g-daily-head">
          <span class="g-daily-title">📆 Daily Challenge</span>
          <span class="g-daily-streak">${streak > 0 ? `🔥 ${streak} day${streak > 1 ? "s" : ""}` : ""}</span>
        </div>
        <div class="g-daily-games">${dIds.map(id => { const g = getGame(id); const ok = d.done.includes(id);
          return `<span class="g-daily-game ${ok ? "ok" : ""}">${g.icon}<small>${ok ? "✓" : ""}</small></span>`; }).join("")}</div>
        <div class="g-daily-sub">${dComplete ? "Done for today — new challenge tomorrow!" : `${dDone}/${dIds.length} rounds · +${DAILY_BONUS_XP} XP bonus`}</div>
        <div class="g-daily-track"><div class="g-daily-fill" style="width:${Math.round(dDone / dIds.length * 100)}%"></div></div>
      </button>`;

  const cards = GAMES.map(g => {
    const req = gameRequirement(g, pool, "full");
    const best = S.games.best[g.id];
    const st = S.games.stars[g.id] || 0;
    const plays = S.games.plays[g.id] || 0;
    return `<button class="g-card-tile ${req.ok ? "" : "off"}" onclick="gameTileTap('${g.id}')" ${req.ok ? "" : `aria-disabled="true"`}>
      <div class="g-tile-icon">${g.icon}</div>
      <div class="g-tile-name">${escapeHtml(gameName(g))}</div>
      <div class="g-tile-skill">${escapeHtml(g.skill)}</div>
      ${req.ok
        ? `<div class="g-tile-stars">${starsHtml(st)}</div>
           <div class="g-tile-best">${best !== undefined ? `Best ${best.toLocaleString()}` : plays ? "" : "✨ Try it!"}</div>`
        : `<div class="g-tile-reason">${escapeHtml(req.reason)}</div>`}
    </button>`;
  }).join("");

  const mixOk = GAMES.filter(g => g.inRuns !== false && !GAME_RUN_EXCLUDE.has(g.id) && gameRequirement(g, pool, "short").ok).length >= 2;
  el.innerHTML = `<div class="screen game-screen">${top}
    ${dailyHtml}
    <button class="g-mix-btn" onclick="startArcadeMix()" ${mixOk ? "" : "disabled"}>🕹️ Arcade Mix <span>4 quick rounds, back to back</span></button>
    <div class="g-grid">${cards}</div>
  </div>`;
}

// Locked tiles stay tappable so they can explain themselves.
function gameTileTap(id) {
  const g = getGame(id);
  if (!g) return;
  const req = gameRequirement(g, buildGamePool(currentPoolIds()), "full");
  if (req.ok) launchGame(id);
  else { buzz(30); showCelebrateToast(g.icon, gameName(g), req.reason); }
}

// ── POOL PICKER ───────────────────────────────
let _pickerSel = null;      // Set of deck ids, or null = all known
let _pickerOpenGroups = new Set();
function openPoolPicker() {
  const ids = currentPoolIds();
  _pickerSel = ids ? new Set(ids) : null;
  _pickerOpenGroups = new Set();
  if (_pickerSel) ALL_GROUPS.forEach(g => { if (g.decks.some(d => _pickerSel.has(d.id))) _pickerOpenGroups.add(g.id); });
  renderPoolPicker();
}
// Re-renders update the open sheet in place (no replayed entrance
// animation, scroll position kept).
function renderPoolPicker() {
  let modal = document.getElementById("pool-modal");
  if (!modal) {
    modal = document.createElement("div");
    modal.className = "modal-overlay";
    modal.id = "pool-modal";
    modal.onclick = e => { if (e.target === modal) closePoolPicker(); };
    modal.innerHTML = `<div class="modal-sheet g-picker" role="dialog" aria-label="Words to play with"></div>`;
    document.body.appendChild(modal);
  }
  const sheet = modal.querySelector(".modal-sheet");
  const all = !_pickerSel;
  const count = _pickerSel ? buildGamePool([..._pickerSel]).length : buildGamePool(null).length;
  const groupsHtml = ALL_GROUPS.map(g => {
    const decks = g.decks.map(d => ({ d, n: poolWordsForDeck(d, true).length }));
    const selN = _pickerSel ? g.decks.filter(d => _pickerSel.has(d.id)).length : 0;
    const open = _pickerOpenGroups.has(g.id);
    const state = selN === 0 ? "" : selN === g.decks.length ? "on" : "some";
    const total = decks.reduce((s, x) => s + x.n, 0);
    return `<div class="g-pick-group">
      <div class="g-pick-ghead">
        <button class="g-check ${state}" onclick="pickerToggleGroup('${g.id}')" aria-label="Select all in ${escapeHtml(g.name)}">${state === "on" ? "✓" : state === "some" ? "–" : ""}</button>
        <button class="g-pick-gname" onclick="pickerToggleOpen('${g.id}')">${g.icon} ${escapeHtml(g.name)}
          <span class="g-pick-meta">${total} ${g.type === "anki" ? "introduced" : "unlocked"}${selN ? ` · ${selN} selected` : ""}</span>
          <span class="group-chevron ${open ? "open" : ""}">▶</span></button>
      </div>
      ${open ? `<div class="g-pick-decks">${decks.map(({ d, n }) => `
        <button class="g-pick-deck ${_pickerSel && _pickerSel.has(d.id) ? "on" : ""} ${n ? "" : "empty"}" onclick="pickerToggleDeck('${d.id}')">
          <span class="g-check ${_pickerSel && _pickerSel.has(d.id) ? "on" : ""}">${_pickerSel && _pickerSel.has(d.id) ? "✓" : ""}</span>
          <span class="g-pick-dname">${d.icon} ${escapeHtml(d.name)}</span>
          <span class="g-pick-n">${n}</span>
        </button>`).join("")}</div>` : ""}
    </div>`;
  }).join("");
  sheet.innerHTML = `
      <div class="modal-title">Words to play with</div>
      <div class="modal-sub">${count} word${count !== 1 ? "s" : ""} in the pool. Vocab and Anki decks can be mixed.</div>
      <button class="g-pick-all ${all ? "on" : ""}" onclick="pickerAll()">
        <span class="g-check ${all ? "on" : ""}">${all ? "✓" : ""}</span>
        <span><strong>All known words</strong><br><small>Every word you've practised, plus introduced Anki cards</small></span>
      </button>
      <div class="g-pick-list">${groupsHtml}</div>
      <div class="modal-actions">
        <button class="modal-btn secondary" onclick="closePoolPicker()">Cancel</button>
        <button class="modal-btn primary" onclick="applyPoolPicker()" ${count ? "" : "disabled"}>${count ? `Play with ${count} words` : "No words selected"}</button>
      </div>`;
}
function pickerAll() { _pickerSel = null; renderPoolPicker(); }
function pickerToggleOpen(gid) { if (_pickerOpenGroups.has(gid)) _pickerOpenGroups.delete(gid); else _pickerOpenGroups.add(gid); renderPoolPicker(); }
function pickerToggleDeck(id) {
  if (!_pickerSel) _pickerSel = new Set();
  if (_pickerSel.has(id)) _pickerSel.delete(id); else _pickerSel.add(id);
  if (!_pickerSel.size) _pickerSel = null;
  renderPoolPicker();
}
function pickerToggleGroup(gid) {
  const g = ALL_GROUPS.find(x => x.id === gid);
  if (!g) return;
  if (!_pickerSel) _pickerSel = new Set();
  const allOn = g.decks.every(d => _pickerSel.has(d.id));
  g.decks.forEach(d => { if (allOn) _pickerSel.delete(d.id); else _pickerSel.add(d.id); });
  if (!allOn) _pickerOpenGroups.add(gid);
  if (!_pickerSel.size) _pickerSel = null;
  renderPoolPicker();
}
function closePoolPicker() { const m = document.getElementById("pool-modal"); if (m) m.remove(); }
function applyPoolPicker() {
  S.games.pool = _pickerSel ? [..._pickerSel] : null;
  gameHubDeckIds = null; // an explicit choice replaces the start-bar selection
  saveState();
  closePoolPicker();
  renderGamesHub();
}

// Word edits change deck words, so the derived caches are cleared on
// every hub open (games may register extra caches here).
const _gameCacheClearers = [];
function clearGameCaches() {
  _formCache.clear(); _nounCache.clear(); _normCache.clear(); _allGameWords = null;
  _gameCacheClearers.forEach(fn => fn());
}
