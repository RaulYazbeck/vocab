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

// Mastery/streak badges shown next to the hint in drill and voice modes.
function wordBadgesHtml(ws) {
  return [
    isMasteryPlus(ws)
      ? `<span class="masteryplus-badge">⭐ ${21 - daysBetween(ws.masteryPlusDate, todayISO())}d</span>`
      : isMastered(ws) ? `<span class="mastered-badge">✓ mastered</span>` : "",
    ws.displayStreak > 0 && !isMasteryPlus(ws)
      ? `<span class="streak-badge">🔥 ${ws.displayStreak}</span>` : ""
  ].join(" ");
}

// Per-word stat chips shown under drill/voice cards.
function miniStats(ws) {
  return `<div class="mini-stat"><div class="mini-label">correct</div><div class="mini-val">${ws.correct}</div></div>
    <div class="mini-stat"><div class="mini-label">wrong</div><div class="mini-val">${ws.wrong}</div></div>
    <div class="mini-stat"><div class="mini-label">streak</div><div class="mini-val">${ws.displayStreak}</div></div>
    <div class="mini-stat"><div class="mini-label">mastered</div><div class="mini-val">${isMastered(ws)?"✓":"—"}</div></div>`;
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
