// ── UI HELPERS ────────────────────────────────
// Small shared HTML builders used by several modes/screens.
// Pure functions: they build strings and never touch state.

function escapeHtml(s) {
  return String(s ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

// Attributes for a 🔊 button. The text travels through a data attribute
// (entities are decoded when read back via dataset), so quotes, backslashes
// and ampersands in words can never break the inline handler.
function speakBtnAttrs(text) {
  return `data-say="${escapeHtml(text)}" onclick="speak(this.dataset.say)"`;
}

// Tap to hear (feedback.js, sayTapInstall): attributes for a revealed
// German word or sentence, so a tap plays it. German app only (the French
// app is left as it is); "" when there's nothing to say. Never on anything
// shown while a question is still being asked.
function sayTapOn() { return typeof WORD_KEY === "string" && WORD_KEY === "de"; }
function sayTapAttrs(text) {
  const t = String(text == null ? "" : text).replace(/\s+/g, " ").trim();
  return t && sayTapOn() ? ` data-tap-say="${escapeHtml(t)}" title="Tap to hear"` : "";
}
// The selection-to-hear zone (a sheet, an answered question's feedback).
function sayZoneAttr() { return sayTapOn() ? " data-say-zone" : ""; }

// Stage badge + pips shown next to the hint in drill and voice modes.
function wordBadgesHtml(ws) {
  return [
    tierBadgeHtml(ws),
    stageOf(ws) ? pipsHtml(ws) : "",
    ws.displayStreak > 0 ? `<span class="streak-badge">🔥 ${ws.displayStreak}</span>` : ""
  ].filter(Boolean).join(" ");
}

// Per-word stat chips shown under drill/voice cards.
function miniStats(ws) {
  const t = tierOf(ws);
  return `<div class="mini-stat"><div class="mini-label">correct</div><div class="mini-val">${ws.correct}</div></div>
    <div class="mini-stat"><div class="mini-label">wrong</div><div class="mini-val">${ws.wrong}</div></div>
    <div class="mini-stat"><div class="mini-label">streak</div><div class="mini-val">${ws.displayStreak}</div></div>
    <div class="mini-stat"><div class="mini-label">stage</div><div class="mini-val">${t.icon}</div></div>`;
}

// The prompt (word + hint) shown on timer screens.
function timerWordHtml(word) {
  return `<div class="english-word">${word.en}</div>
      <div class="word-hint word-hint-lg">${askHintHtml(word)}</div>`;
}

// Example sentences. Variants match the three historical layouts:
//   "big"   — drill feedback: all examples, large rows
//   "first" — voice feedback: first example only
//   "all"   — learn card: all examples, compact rows
function examplesHtml(word, variant) {
  if (!word.examples || !word.examples.length) return "";
  if (variant === "big") {
    return `
      <div class="examples-wrap-big">
        <div class="examples-title">Examples</div>
        ${word.examples.map(ex => `
          <div class="example-row-big">
            <div class="example-de"${sayTapAttrs(ex[WORD_KEY])}>${ex[WORD_KEY]}</div>
            <div class="example-en">${ex.en}</div>
          </div>`).join("")}
      </div>`;
  }
  if (variant === "first") {
    const ex = word.examples[0];
    return `
    <div class="examples-wrap">
      <div class="examples-title">Example</div>
      <div class="example-row">
        <div class="example-de"${sayTapAttrs(ex[WORD_KEY])}>${ex[WORD_KEY]}</div>
        <div class="example-en">${ex.en}</div>
      </div>
    </div>`;
  }
  return `<div class="examples-wrap" style="text-align:left;margin-top:12px">
        <div class="examples-title">Examples</div>
        ${word.examples.map(ex=>`<div class="example-row"><div class="example-de"${sayTapAttrs(ex[WORD_KEY])}>${ex[WORD_KEY]}</div><div class="example-en">${ex.en}</div></div>`).join("")}
      </div>`;
}

// Copy text to the clipboard with a fallback for older mobile browsers.
function copyTextToClipboard(text) {
  if (navigator.clipboard && navigator.clipboard.writeText) {
    return navigator.clipboard.writeText(text);
  }
  return new Promise((resolve, reject) => {
    const ta = document.createElement("textarea");
    ta.value = text;
    ta.style.cssText = "position:fixed;top:-1000px;opacity:0;";
    document.body.appendChild(ta);
    ta.select();
    try { document.execCommand("copy") ? resolve() : reject(new Error("copy failed")); }
    catch (e) { reject(e); }
    finally { ta.remove(); }
  });
}

// ── TYPING COMFORT ────────────────────────────
// Accent bar above an input: tapping a letter inserts it at the caret
// without closing the phone keyboard (pointerdown is swallowed so the
// input keeps focus).
const ACCENT_KEYS = WORD_KEY === "fr"
  ? ["é", "è", "ê", "à", "â", "ç", "ô", "î", "û", "ù", "ë", "ï", "œ"]
  : ["ä", "ö", "ü", "ß", "Ä", "Ö", "Ü"];
// Answers ignore accents, umlauts and ß in both apps (Muller = Müller,
// ecole = école), so no bar is shown: the phone keyboard is enough.
// Kept as a function so the call sites stay put.
const ACCENT_BAR_ON = false;
function accentBarHtml(inputId) {
  if (!ACCENT_BAR_ON) return "";
  return `<div class="accent-bar" data-for="${inputId}" role="toolbar" aria-label="Special letters">${ACCENT_KEYS.map(k =>
    `<button type="button" class="accent-key" data-ch="${k}" tabindex="-1">${k}</button>`).join("")}</div>`;
}
// Delegated once for the whole document.
document.addEventListener("pointerdown", e => {
  const b = e.target.closest && e.target.closest(".accent-key");
  if (!b) return;
  e.preventDefault();
  const bar = b.closest(".accent-bar");
  const input = bar && document.getElementById(bar.dataset.for);
  if (!input || input.disabled || input.readOnly) return;
  const ch = b.dataset.ch;
  const s = input.selectionStart ?? input.value.length, en = input.selectionEnd ?? input.value.length;
  input.value = input.value.slice(0, s) + ch + input.value.slice(en);
  try { input.setSelectionRange(s + ch.length, s + ch.length); } catch (err) {}
  input.dispatchEvent(new Event("input", { bubbles: true }));
  if (document.activeElement !== input) input.focus({ preventScroll: true });
  if (typeof haptic === "function") haptic("select");
});

const DF_PUNCT = /[.,!?;:„“”"«»‚‘’()…–—¿¡]/;
// Letter-by-letter comparison of what was typed against the answer:
// matching letters plain, wrong ones red, missing ones underlined.
function diffHtml(typed, answer) {
  const a = String(typed || "").trim();
  let b = String(answer || "").trim();
  if (!a) return `<span class="df-miss">${escapeHtml(b)}</span>`;
  // "Platz / Sitz": diff against the closest alternative.
  if (b.includes("/")) {
    const alts = b.split("/").map(x => x.trim()).filter(Boolean);
    if (alts.length) b = alts.reduce((best, x) => levenshtein(a.toLowerCase(), x.toLowerCase()) < levenshtein(a.toLowerCase(), best.toLowerCase()) ? x : best, alts[0]);
  }
  if (a.length > 80 || b.length > 80) return escapeHtml(b);
  // Only what the checker counts is marked: punctuation, case and accents
  // (cafe = Café, a missing full stop) are never shown as a mistake.
  const aa = [...a].filter(ch => !DF_PUNCT.test(ch)).join("").replace(/\s+/g, " ").trim();
  const la = aa.toLowerCase(), lb = b.toLowerCase();
  const key = ch => stripAccents(ch);
  const n = la.length, m = lb.length;
  const free = j => DF_PUNCT.test(lb[j - 1]); // an answer's punctuation: free to leave out
  const dp = Array.from({ length: n + 1 }, () => new Array(m + 1).fill(0));
  for (let i = 0; i <= n; i++) dp[i][0] = i;
  for (let j = 1; j <= m; j++) dp[0][j] = dp[0][j - 1] + (free(j) ? 0 : 1);
  for (let i = 1; i <= n; i++) for (let j = 1; j <= m; j++)
    dp[i][j] = Math.min(dp[i - 1][j] + 1, dp[i][j - 1] + (free(j) ? 0 : 1), dp[i - 1][j - 1] + (key(la[i - 1]) === key(lb[j - 1]) ? 0 : 1));
  // A totally different word: a letter diff is noise — just show
  // what was typed, struck through (the answer is shown next to it).
  if (dp[n][m] > Math.max(2, Math.ceil(m * 0.4))) return `<span class="df-typed">you typed <s>${escapeHtml(a)}</s></span>`;
  // Walk back: build the answer with marks.
  const out = [];
  let i = n, j = m;
  while (i > 0 || j > 0) {
    if (i > 0 && j > 0 && key(la[i - 1]) === key(lb[j - 1]) && dp[i][j] === dp[i - 1][j - 1]) { out.push(["ok", b[j - 1]]); i--; j--; }
    else if (j > 0 && free(j) && dp[i][j] === dp[i][j - 1]) { out.push(["ok", b[j - 1]]); j--; }
    else if (i > 0 && j > 0 && dp[i][j] === dp[i - 1][j - 1] + 1) { out.push(["bad", b[j - 1]]); i--; j--; }
    else if (j > 0 && dp[i][j] === dp[i][j - 1] + 1) { out.push(["miss", b[j - 1]]); j--; }
    else { out.push(["extra", aa[i - 1]]); i--; }
  }
  out.reverse();
  return out.map(([k, ch]) => k === "ok" ? escapeHtml(ch) : k === "extra" ? `<span class="df-extra">${escapeHtml(ch)}</span>`
    : `<span class="df-${k}">${escapeHtml(ch === " " ? "·" : ch)}</span>`).join("");
}

// Word by word, for a sentence: the answer with the words you got wrong
// or left out marked, and what you wrote with its wrong words marked.
// Punctuation, case and accents never count (as in the checker); a word
// that's right but in another place is marked "moved", not wrong.
// → { ans, typed, same } (HTML; same: nothing but punctuation differs).
function wordDiffHtml(typed, answer) {
  const split = s => String(s || "").trim().split(/\s+/).filter(Boolean);
  const key = w => normalize([...w].filter(ch => !DF_PUNCT.test(ch)).join(""));
  const A = split(answer), T = split(typed).filter(w => key(w));
  const ka = A.map(key), kt = T.map(key);
  const n = kt.length, m = ka.length;
  const L = Array.from({ length: n + 1 }, () => new Array(m + 1).fill(0));
  for (let i = n - 1; i >= 0; i--) for (let j = m - 1; j >= 0; j--)
    L[i][j] = kt[i] && kt[i] === ka[j] ? L[i + 1][j + 1] + 1 : Math.max(L[i + 1][j], L[i][j + 1]);
  const okA = new Array(m).fill(false), okT = new Array(n).fill(false);
  for (let i = 0, j = 0; i < n && j < m;) {
    if (kt[i] && kt[i] === ka[j]) { okT[i] = okA[j] = true; i++; j++; }
    else if (L[i + 1][j] >= L[i][j + 1]) i++; else j++;
  }
  // (a word left over on both sides is one that moved)
  const leftA = ka.filter((k, j) => !okA[j]), leftT = kt.filter((k, i) => !okT[i]);
  const ans = A.map((w, j) => okA[j] || !ka[j] ? escapeHtml(w)
    : `<span class="${leftT.includes(ka[j]) ? "dw-moved" : "dw-fix"}">${escapeHtml(w)}</span>`).join(" ");
  const typ = T.map((w, i) => okT[i] ? escapeHtml(w)
    : `<span class="${leftA.includes(kt[i]) ? "dw-moved" : "dw-wrong"}">${escapeHtml(w)}</span>`).join(" ");
  return { ans, typed: typ || "—", same: okA.every((x, j) => x || !ka[j]) && okT.every(Boolean) };
}

// One-letter typo on a longer word, away from the article and the
// ending (which carry grammar): "Almost" — neither right nor wrong.
// Articles carry the grammar (gender, case): a slip there is never a
// "typo" — not in the first word, not in the middle of a phrase.
const ARTICLE_TOKENS = /^(der|die|das|den|dem|des|ein|eine|einen|einem|einer|eines|kein|keine|keinen|keinem|keiner|keines|le|la|les|l|un|une|du|au|aux)$/;
function articleSeq(s) { return s.split(" ").filter(t => ARTICLE_TOKENS.test(t)).join(" "); }
// b is a with exactly one pair of neighbouring (different) letters swapped.
function isTransposition(a, b) {
  if (a.length !== b.length) return false;
  let i = 0;
  while (i < a.length && a[i] === b[i]) i++;
  return i < a.length - 1 && a[i] === b[i + 1] && a[i + 1] === b[i] && a[i] !== a[i + 1]
    && a.slice(i + 2) === b.slice(i + 2) && !/\s/.test(a[i] + a[i + 1]);
}
function isNearMiss(input, answers) {
  const b = normalize(String(input || ""));
  if (!b) return false;
  const alts = answers.flatMap(x => String(x || "").split("/")).map(x => x.trim()).filter(Boolean);
  return alts.some(ansRaw => {
    const a = normalize(ansRaw);
    if (a.length < 6 || Math.abs(a.length - b.length) > 1) return false;
    // Two neighbouring letters swapped (Anrufbeatnworter) is a typo,
    // not a spelling error — anywhere but inside an article.
    if (isTransposition(a, b)) return articleSeq(a) === articleSeq(b);
    if (levenshtein(a, b) !== 1) return false;
    if (articleSeq(a) !== articleSeq(b)) return false; // an article changed, went missing or appeared
    let p = 0;
    while (p < a.length && p < b.length && a[p] === b[p]) p++;
    let q = 0;
    while (q < a.length - p && q < b.length - p && a[a.length - 1 - q] === b[b.length - 1 - q]) q++;
    // The word holding the slip must not be an article (e.g. "dem"→"deem").
    const start = a.lastIndexOf(" ", Math.max(0, p - 1)) + 1, end = a.indexOf(" ", p);
    const tok = a.slice(start, end < 0 ? a.length : end);
    if (ARTICLE_TOKENS.test(tok)) return false;
    // A slip in the last two letters is the ending — grammar (musstn
    // for müssen is a conjugation error), so it's simply wrong.
    if (q < 2) return false;
    return true;
  });
}

// After a mistake, moving on stays shut for a moment, so a confident
// Enter pressed before the correction was read can't skip past it.
// The Next button shows the wait; a press during it shakes the
// feedback instead.
const MISTAKE_HOLD_MS = 800;
let _mistakeHoldUntil = 0;
function holdAfterMistake(btnId) {
  _mistakeHoldUntil = Date.now() + MISTAKE_HOLD_MS;
  const b = btnId && document.getElementById(btnId);
  if (!b) return;
  b.classList.remove("mistake-hold"); void b.offsetWidth; b.classList.add("mistake-hold");
  setTimeout(() => b.classList.remove("mistake-hold"), MISTAKE_HOLD_MS);
}
// True while the hold is on (and nudges the feedback so you look).
function mistakeHeld(fbId) {
  if (Date.now() >= _mistakeHoldUntil) return false;
  const fb = fbId && document.getElementById(fbId);
  if (fb && typeof shakeEl === "function") shakeEl(fb);
  return true;
}

// ── PRIVATE "MY TYPO" OVERRIDE (every typed answer) ──
// Shift+Enter ×3 within 1.5s, or the ✗ tapped ×3, on a wrong typed answer
// turns it into a right one — honour system. Today's cards (mode-path.js)
// and the course drills (course-ui.js) have their own; every other screen
// where you type uses this one. One daily allowance for all of them
// (S.path.secretOk, 10 a day); an "≈ Almost" is never capped.
//   1. typoSnap() before a wrong answer's bookkeeping: what it can touch
//      (word / rule progress, the course, the verb track, the learning
//      log, quests, the day's mistakes, the session's counters).
//   2. typoArm(snap, { live, ok, fb, m, near }) once it's shown — live():
//      still this answer on screen · ok(): grade it right (the screen's
//      own state first; the snapshot is already put back) · fb: the
//      feedback's id (shaken when the allowance is spent).
//   3. typoMark("✗") in the feedback: the tap target.
const TYPO_PER_DAY = 10;
let _typo = null, _typoTaps = [];
function _typoJ(o) { return o === undefined ? null : JSON.stringify(o); }
function typoSnap() {
  let mk = null;
  try { mk = _typoJ(usageDay().mk); } catch (e) {}
  const Q = S.quests, ps = typeof pathSession !== "undefined" && pathSession;
  return {
    words: _typoJ(S.words), course: _typoJ(S.course), learn: _typoJ(S.learn), verb: _typoJ(S.verb), mk,
    qm: Q ? _typoJ(Q.m) : null, qw: Q ? _typoJ(Q.week) : null, hearts: Q ? Q.hearts : undefined,
    totalCorrect: S.totalCorrect, cases: S.games ? _typoJ(S.games.cases) : null, vf: S.games ? _typoJ(S.games.vf) : null,
    sc: typeof sessionCorrect !== "undefined" ? sessionCorrect : 0,
    consec: typeof sessionConsecutive !== "undefined" ? sessionConsecutive : 0,
    stats: ps && ps.stats ? { ...ps.stats } : null,
  };
}
// Puts a snapshot back in place (the same objects, so nothing holding one goes stale).
function _typoPut(obj, src) {
  if (Array.isArray(obj) && Array.isArray(src)) { obj.length = 0; src.forEach(x => obj.push(x)); return; }
  Object.keys(obj).forEach(k => { if (!(k in src)) delete obj[k]; });
  Object.keys(src).forEach(k => {
    const a = obj[k], b = src[k];
    if (a && b && typeof a === "object" && typeof b === "object" && Array.isArray(a) === Array.isArray(b)) _typoPut(a, b);
    else obj[k] = b;
  });
}
function _typoBack(key, json) {
  if (json === null) { delete S[key]; return; }
  const v = JSON.parse(json);
  if (S[key] && typeof S[key] === "object" && v && typeof v === "object") _typoPut(S[key], v); else S[key] = v;
}
function typoRestore(u) {
  ["words", "course", "learn", "verb"].forEach(k => _typoBack(k, u[k]));
  try { const d = usageDay(); if (u.mk === null) delete d.mk; else d.mk = JSON.parse(u.mk); } catch (e) {}
  const Q = S.quests;
  if (Q) {
    if (u.qm !== null && Q.m) _typoPut(Q.m, JSON.parse(u.qm));
    if (u.qw !== null && Q.week) _typoPut(Q.week, JSON.parse(u.qw));
    if (u.hearts !== undefined) Q.hearts = u.hearts;
  }
  if (u.totalCorrect !== undefined) S.totalCorrect = u.totalCorrect;
  if (S.games) ["cases", "vf"].forEach(k => { if (u[k] === null) delete S.games[k]; else S.games[k] = JSON.parse(u[k]); });
  if (typeof sessionCorrect !== "undefined") sessionCorrect = u.sc;
  if (typeof sessionConsecutive !== "undefined") sessionConsecutive = u.consec;
  const ps = typeof pathSession !== "undefined" && pathSession;
  if (ps && ps.stats && u.stats) Object.assign(ps.stats, u.stats);
  if (typeof invalidatePathScan === "function") invalidatePathScan();
}
function typoArm(snap, opts) { _typo = snap ? { snap, used: false, ...opts } : null; _typoTaps = []; }
function typoDisarm() { _typo = null; }
function typoLive() { if (_typo && !_typo.live()) _typo = null; return !!_typo; }
// The ✗ (or ≈) of the answer just shown, tappable ×3 while the override is open.
function typoMark(sign) {
  return typoLive() && !_typo.used ? `<span class="p-typo" onpointerdown="event.preventDefault();event.stopPropagation();typoPress(1200)">${sign}</span>` : sign;
}
function typoPress(windowMs) {
  if (!typoLive() || _typo.used) return;
  const now = Date.now();
  _typoTaps = _typoTaps.filter(t => now - t < windowMs).concat(now);
  if (_typoTaps.length >= 3) { _typoTaps = []; typoFire(); }
}
function typoFire() {
  const t = _typo;
  if (!t || t.used || !t.live()) return;
  const P = S.path || (S.path = {}), today = typeof studyToday === "function" ? studyToday() : todayISO();
  if (!P.secretOk || P.secretOk.d !== today) P.secretOk = { d: today, n: 0 };
  const cap = typeof SECRET_OK_PER_DAY !== "undefined" ? SECRET_OK_PER_DAY : TYPO_PER_DAY;
  if (!t.near && P.secretOk.n >= cap) { const fb = t.fb && document.getElementById(t.fb); if (fb && typeof shakeEl === "function") shakeEl(fb); return; }
  t.used = true;
  typoRestore(t.snap);
  if (!t.near) P.secretOk.n++;
  if (typeof logEvent === "function") logEvent("secretOk", { m: t.m || "", n: P.secretOk.n, near: !!t.near });
  t.ok();
  _mistakeHoldUntil = 0; // a success now: Next must not wait on the old miss
  if (typeof saveState === "function") saveState();
}
// "✓ Correct!" → "✓ Counted" in a feedback just drawn by ok().
function typoCounted(sel, from) {
  const el = document.querySelector(sel);
  const to = typeof vxT === "function" ? vxT("✓ Counted") : "✓ Counted";
  if (el) el.innerHTML = el.innerHTML.replace(from, to);
}
// Shift+Enter, ahead of every other key handler: while the override is
// open (or was just used on this answer) it never also checks or moves on.
window.addEventListener("keydown", e => {
  if (e.key !== "Enter" || !e.shiftKey || !typoLive()) return;
  e.preventDefault(); e.stopImmediatePropagation();
  if (!_typo.used) typoPress(1500);
}, true);

// "≈ Almost — try again" (one more try): the answer that got it is kept
// (nearMark), and the same answer sent again — a double Enter, a second
// tap — is never graded: the input shakes and asks for a change.
const _nearNorm = v => String(v || "").trim().replace(/\s+/g, " ").toLowerCase();
function nearMark(cur, val) { cur.near = true; cur.nearVal = _nearNorm(val); }
function nearSameAgain(cur, val, inp, fb, html) {
  if (!cur || !cur.near || cur.nearVal === undefined || _nearNorm(val) !== cur.nearVal) return false;
  if (inp && typeof shakeEl === "function") shakeEl(inp);
  if (inp && inp.select) try { inp.select(); } catch (e) {}
  if (fb) fb.innerHTML = html;
  return true;
}

// Page blur behind sheets and modals: a body class kept in sync from
// here, not CSS :has() — iOS home-screen apps sometimes don't
// re-evaluate :has() when the sheet is removed, and the page stayed
// blurred after closing the welcome sheet.
//
// The page behind a sheet must not scroll (on phones a drag on the dim
// backdrop scrolled the home screen). overflow:hidden alone doesn't stop
// iOS Safari, so the body is pinned in place (position:fixed at the
// current offset) and the scroll position restored when the sheet closes.
let _sheetScrollY = null;
function lockPageScroll(lock) {
  const b = document.body;
  if (lock && _sheetScrollY === null) {
    _sheetScrollY = window.scrollY || 0;
    Object.assign(b.style, { position: "fixed", top: `-${_sheetScrollY}px`, left: "0", right: "0", width: "100%" });
  } else if (!lock && _sheetScrollY !== null) {
    const y = _sheetScrollY;
    _sheetScrollY = null;
    ["position", "top", "left", "right", "width"].forEach(k => b.style[k] = "");
    window.scrollTo(0, y);
  }
}
// A new screen starts at its top — also when a sheet is still closing
// over it (it would otherwise restore the old screen's offset).
function scrollPageTop(smooth) {
  if (_sheetScrollY !== null) { _sheetScrollY = 0; document.body.style.top = "0px"; }
  window.scrollTo({ top: 0, behavior: smooth ? "smooth" : "instant" });
}
(function watchSheets() {
  const sync = () => {
    const sp = document.getElementById("settings-panel");
    const open = !!document.querySelector("body > .modal-overlay") || !!(sp && sp.style.display === "block");
    document.body.classList.toggle("sheet-open", open);
    lockPageScroll(open);
  };
  let watched = null;
  new MutationObserver(() => {
    const sp = document.getElementById("settings-panel");
    if (sp && sp !== watched) { watched = sp; new MutationObserver(sync).observe(sp, { attributes: true, attributeFilter: ["style"] }); }
    sync();
  }).observe(document.body, { childList: true });
})();

// Colour a leading article by gender (der/le blue, die/la red, das
// green) — the colours stick in memory. Returns escaped HTML.
function colorArticleHtml(text) {
  const t = String(text ?? "");
  const m = t.match(/^(der|die|das|les|le|la|l')(\s*)(.*)$/i);
  if (!m) return escapeHtml(t);
  const a = m[1].toLowerCase();
  if (a !== "l'" && !m[2]) return escapeHtml(t); // "lent", "lesen": not an article
  // French l'/les hide the gender: the decks note it (g), see frGenderOf.
  const hidden = (a === "l'" || a === "les") && WORD_KEY === "fr" ? frGenderOf(t) : "";
  const cls = a === "der" || a === "le" || hidden === "m" ? "m" : a === "die" || a === "la" || hidden === "f" ? "f" : a === "das" ? "n" : "";
  if (!cls || (a === "die" && /,\s*pl\.|^die\s+\S+\s*\(pl/i.test(t))) return escapeHtml(t);
  return `<span class="art ${cls}-text">${escapeHtml(m[1])}</span>${escapeHtml(m[2] + m[3])}`;
}

// French nouns whose article hides the gender (l'heure, les vacances)
// carry g: "m" | "f" | "mf" in the decks. Looked up by their text.
let _frGender = null;
function frGenderOf(text) {
  if (!_frGender) {
    _frGender = new Map();
    ALL_GROUPS.forEach(g => g.decks.forEach(d => d.words.forEach(w => { if (w.g) _frGender.set(String(w.fr), w.g); })));
  }
  return _frGender.get(String(text).trim()) || "";
}
// "une heure" / "un ou une élève" for an l' noun — the gender you
// hear. Null for everything else (les + noun: "des" has no gender).
function frIndefinite(word) {
  if (WORD_KEY !== "fr") return null;
  const f = String(word.fr || "");
  const g = word.g || frGenderOf(f);
  if (!g || !/^l'/i.test(f)) return null;
  const noun = f.slice(2);
  return g === "m" ? `un ${noun}` : g === "f" ? `une ${noun}` : `un ou une ${noun}`;
}
// A small line under a French l' noun: "une heure · féminin".
function frGenderNoteHtml(word) {
  const ind = frIndefinite(word);
  if (!ind) return "";
  const g = word.g || frGenderOf(word.fr);
  const cls = g === "m" ? "m" : g === "f" ? "f" : "";
  const label = g === "m" ? "masculin" : g === "f" ? "féminin" : "masculin ou féminin";
  return `<div class="fr-gender"><span class="${cls ? cls + "-text" : ""}">${escapeHtml(ind)}</span> · ${label}</div>`;
}

// In-app confirmation sheet (instead of the browser's confirm()).
// Resolves true/false. Esc / tapping outside = cancel.
function appConfirm({ title, body = "", ok = "OK", cancel = "Cancel", danger = false }) {
  return new Promise(resolve => {
    const old = document.getElementById("app-confirm"); if (old) old.remove();
    const m = document.createElement("div");
    m.className = "modal-overlay"; m.id = "app-confirm";
    m.innerHTML = `<div class="modal-sheet confirm-sheet" role="alertdialog" aria-modal="true" aria-labelledby="ac-title">
      <div class="modal-title" id="ac-title">${escapeHtml(title)}</div>
      ${body ? `<div class="modal-sub">${escapeHtml(body)}</div>` : ""}
      <div class="modal-actions">
        <button class="modal-btn secondary" id="ac-no">${escapeHtml(cancel)}</button>
        <button class="modal-btn primary ${danger ? "danger" : ""}" id="ac-yes">${escapeHtml(ok)}</button>
      </div></div>`;
    const done = v => { document.removeEventListener("keydown", key, true); m.remove(); resolve(v); };
    const key = e => { if (e.key === "Escape") { e.preventDefault(); e.stopPropagation(); done(false); } };
    document.addEventListener("keydown", key, true);
    m.onclick = e => { if (e.target === m) done(false); };
    document.body.appendChild(m);
    m.querySelector("#ac-no").onclick = () => done(false);
    m.querySelector("#ac-yes").onclick = () => done(true);
    setTimeout(() => m.querySelector("#ac-yes").focus(), 50);
  });
}
