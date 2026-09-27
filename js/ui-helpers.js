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
      <div class="word-hint word-hint-lg">${word.hint}</div>`;
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
            <div class="example-de">${ex[WORD_KEY]}</div>
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
        <div class="example-de">${ex[WORD_KEY]}</div>
        <div class="example-en">${ex.en}</div>
      </div>
    </div>`;
  }
  return `<div class="examples-wrap" style="text-align:left;margin-top:12px">
        <div class="examples-title">Examples</div>
        ${word.examples.map(ex=>`<div class="example-row"><div class="example-de">${ex[WORD_KEY]}</div><div class="example-en">${ex.en}</div></div>`).join("")}
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
  const la = a.toLowerCase(), lb = b.toLowerCase();
  const n = la.length, m = lb.length;
  const dp = Array.from({ length: n + 1 }, () => new Array(m + 1).fill(0));
  for (let i = 0; i <= n; i++) dp[i][0] = i;
  for (let j = 0; j <= m; j++) dp[0][j] = j;
  for (let i = 1; i <= n; i++) for (let j = 1; j <= m; j++)
    dp[i][j] = Math.min(dp[i - 1][j] + 1, dp[i][j - 1] + 1, dp[i - 1][j - 1] + (la[i - 1] === lb[j - 1] ? 0 : 1));
  // A totally different word: a letter diff is noise — just show
  // what was typed, struck through (the answer is shown next to it).
  if (dp[n][m] > Math.max(2, Math.ceil(m * 0.4))) return `<span class="df-typed">you typed <s>${escapeHtml(a)}</s></span>`;
  // Walk back: build the answer with marks.
  const out = [];
  let i = n, j = m;
  while (i > 0 || j > 0) {
    if (i > 0 && j > 0 && la[i - 1] === lb[j - 1] && dp[i][j] === dp[i - 1][j - 1]) { out.push(["ok", b[j - 1]]); i--; j--; }
    else if (i > 0 && j > 0 && dp[i][j] === dp[i - 1][j - 1] + 1) { out.push(["bad", b[j - 1]]); i--; j--; }
    else if (j > 0 && dp[i][j] === dp[i][j - 1] + 1) { out.push(["miss", b[j - 1]]); j--; }
    else { out.push(["extra", a[i - 1]]); i--; }
  }
  out.reverse();
  return out.map(([k, ch]) => k === "ok" ? escapeHtml(ch) : k === "extra" ? `<span class="df-extra">${escapeHtml(ch)}</span>`
    : `<span class="df-${k}">${escapeHtml(ch === " " ? "·" : ch)}</span>`).join("");
}

// One-letter typo on a longer word, away from the article and the
// ending (which carry grammar): "Almost" — neither right nor wrong.
// Articles carry the grammar (gender, case): a slip there is never a
// "typo" — not in the first word, not in the middle of a phrase.
const ARTICLE_TOKENS = /^(der|die|das|den|dem|des|ein|eine|einen|einem|einer|eines|kein|keine|keinen|keinem|keiner|keines|le|la|les|l|un|une|du|au|aux)$/;
function articleSeq(s) { return s.split(" ").filter(t => ARTICLE_TOKENS.test(t)).join(" "); }
function isNearMiss(input, answers) {
  const b = normalize(String(input || ""));
  if (!b) return false;
  const alts = answers.flatMap(x => String(x || "").split("/")).map(x => x.trim()).filter(Boolean);
  return alts.some(ansRaw => {
    const a = normalize(ansRaw);
    if (a.length < 6 || Math.abs(a.length - b.length) > 1) return false;
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
