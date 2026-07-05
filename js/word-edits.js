// ── WORD EDITS ────────────────────────────────
// In-app overrides for deck word texts (en / target / hint / plural).
//
// Edits live in S.wordEdits = { "deckId_idx": { en?, <target>?, hint?, pl? } }
// and sync to the cloud like any other state field. They are applied by
// merging over the in-memory deck objects — the deck data files are never
// modified and word positions never change, so progress is unaffected.
//
// applyWordEdits() is idempotent: it restores captured originals first,
// then applies the current set. migrate() calls it after every state
// load (startup and cloud sync), so edits follow the state everywhere.

const WORD_EDIT_FIELDS = ["en", WORD_KEY, "hint", "pl"];
const WORD_EDIT_LABELS = { en: "English prompt", [WORD_KEY]: "Answer", hint: "Hint", pl: "Plural" };

const _wordEditOriginals = {}; // key → original field values, captured before first override

function _wordEditTarget(key) {
  const cut = key.lastIndexOf("_");
  const deckId = key.substring(0, cut);
  const idx = parseInt(key.substring(cut + 1), 10);
  const deck = getDeck(deckId);
  if (!deck || isNaN(idx) || !deck.words[idx]) return null;
  return { deck, idx, word: deck.words[idx] };
}

function originalWord(deckId, idx) {
  const key = deckId + "_" + idx;
  if (_wordEditOriginals[key]) return _wordEditOriginals[key];
  const t = _wordEditTarget(key);
  if (!t) return null;
  const o = {};
  WORD_EDIT_FIELDS.forEach(f => { if (t.word[f] !== undefined) o[f] = t.word[f]; });
  return o;
}

function applyWordEdits() {
  // Undo previously applied overrides so edits removed elsewhere
  // (e.g. reverted on another device, arriving via sync) don't linger.
  Object.keys(_wordEditOriginals).forEach(key => {
    const t = _wordEditTarget(key);
    if (!t) return;
    const orig = _wordEditOriginals[key];
    WORD_EDIT_FIELDS.forEach(f => {
      if (orig[f] === undefined) delete t.word[f];
      else t.word[f] = orig[f];
    });
  });
  const edits = (S && S.wordEdits) || {};
  Object.keys(edits).forEach(key => {
    const t = _wordEditTarget(key);
    if (!t) return;
    if (!_wordEditOriginals[key]) {
      const o = {};
      WORD_EDIT_FIELDS.forEach(f => { if (t.word[f] !== undefined) o[f] = t.word[f]; });
      _wordEditOriginals[key] = o;
    }
    WORD_EDIT_FIELDS.forEach(f => {
      const v = edits[key][f];
      if (typeof v === "string" && v !== "") t.word[f] = v;
    });
  });
}

// ── EDITOR MODAL ──────────────────────────────

let _wordEditorAfterSave = null; // re-render callback for the opening screen

function openWordEditor(deckId, idx, afterSave) {
  const deck = getDeck(deckId);
  const word = deck && deck.words[idx];
  if (!word) return;
  _wordEditorAfterSave = afterSave || null;
  const orig = originalWord(deckId, idx) || {};
  const existing = document.getElementById("word-editor-modal");
  if (existing) existing.remove();

  const fieldRow = f => {
    const cur = word[f] !== undefined ? word[f] : "";
    const origVal = orig[f] !== undefined ? orig[f] : "";
    const changed = cur !== origVal;
    return `<div class="we-field">
      <div class="we-label"><span>${WORD_EDIT_LABELS[f]}</span>${changed ? `<span class="we-orig">original: ${escapeHtml(origVal) || "—"}</span>` : ""}</div>
      <input class="we-input" id="we-${f}" value="${escapeHtml(cur)}" autocomplete="off" spellcheck="false"/>
    </div>`;
  };

  const overlay = document.createElement("div");
  overlay.className = "modal-overlay";
  overlay.id = "word-editor-modal";
  overlay.innerHTML = `
    <div class="modal-sheet">
      <div class="modal-title">✏️ Edit word</div>
      <div class="modal-sub">${deck.icon} ${deck.name} · word #${idx + 1} · progress is untouched</div>
      ${WORD_EDIT_FIELDS.map(fieldRow).join("")}
      <div class="modal-actions">
        <button class="modal-btn secondary" onclick="closeWordEditor()">Cancel</button>
        <button class="modal-btn primary" onclick="saveWordEditor('${deckId}',${idx})">Save</button>
      </div>
    </div>`;
  document.body.appendChild(overlay);
}

function closeWordEditor() {
  const m = document.getElementById("word-editor-modal");
  if (m) m.remove();
}

function saveWordEditor(deckId, idx) {
  const key = deckId + "_" + idx;
  const orig = originalWord(deckId, idx) || {};
  const edit = {};
  WORD_EDIT_FIELDS.forEach(f => {
    const input = document.getElementById("we-" + f);
    if (!input) return;
    const val = input.value.trim();
    const origVal = orig[f] !== undefined ? orig[f] : "";
    if (val !== "" && val !== origVal) edit[f] = val;
  });
  // The answer must never be emptied — an empty input reverts that field.
  if (!S.wordEdits) S.wordEdits = {};
  if (Object.keys(edit).length) S.wordEdits[key] = edit;
  else delete S.wordEdits[key];
  applyWordEdits();
  saveState();
  closeWordEditor();
  if (_wordEditorAfterSave) _wordEditorAfterSave();
}

function revertWordEdit(key) {
  if (!S.wordEdits || !S.wordEdits[key]) return;
  delete S.wordEdits[key];
  applyWordEdits();
  saveState();
  renderWordEditsScreen();
}

// ── "MY WORD EDITS" SCREEN ────────────────────

function renderWordEditsScreen() {
  showGameScreen();
  const edits = S.wordEdits || {};
  const keys = Object.keys(edits);
  let items = "";
  keys.forEach(key => {
    const t = _wordEditTarget(key);
    if (!t) return;
    const orig = _wordEditOriginals[key] || {};
    const group = ALL_GROUPS.find(g => g.decks.includes(t.deck));
    const diffs = Object.keys(edits[key]).map(f => {
      const from = orig[f] !== undefined ? orig[f] : "—";
      return `<div class="we-diff">${WORD_EDIT_LABELS[f] || f}: <span class="we-old">${escapeHtml(from)}</span> → <span class="we-new">${escapeHtml(edits[key][f])}</span></div>`;
    }).join("");
    items += `<div class="we-item">
      <div class="we-item-head">
        <div class="we-item-title">${group ? group.icon + " " : ""}${t.deck.name} · word #${t.idx + 1}</div>
        <div>
          <button class="mini-btn" onclick="openWordEditor('${t.deck.id}',${t.idx},renderWordEditsScreen)">✏️ Edit</button>
          <button class="mini-btn" onclick="revertWordEdit('${key}')">↩ Revert</button>
        </div>
      </div>
      ${diffs}
    </div>`;
  });

  document.getElementById("main-screen").innerHTML = `<div class="screen">
    <div class="screen-top">
      <div class="screen-label">✏️ My word edits</div>
      <button class="back-btn" onclick="backToMenu()">← Back</button>
    </div>
    ${keys.length ? `
      <div class="we-toolbar">
        <button class="modal-btn primary we-copy-btn" onclick="copyWordEdits()">📋 Copy all changes</button>
        <div class="we-note">Paste the copied list into GitHub (or hand it to an AI) to update the original deck files. Once the files are updated, revert the edits here.</div>
      </div>
      ${items}` : `
      <div class="we-empty">No edits yet. Open <strong>Stats → a deck → ✏️</strong> next to any word to change its texts. Edits apply instantly, sync to your other devices, and never touch your progress.</div>`}
  </div>`;
}

function buildWordEditsExport() {
  const edits = S.wordEdits || {};
  const lines = [
    `WORD EDITS — ${APP_CONFIG.title} (${STORAGE_KEY})`,
    `Apply these text changes to the deck data files.`,
    `IMPORTANT: only change the listed fields — never reorder, insert or delete words.`,
    ``
  ];
  Object.keys(edits).forEach(key => {
    const t = _wordEditTarget(key);
    if (!t) return;
    const orig = _wordEditOriginals[key] || {};
    const anchor = orig[WORD_KEY] !== undefined ? orig[WORD_KEY] : t.word[WORD_KEY];
    lines.push(`Deck "${t.deck.name}" (id: ${t.deck.id}), word #${t.idx + 1} — find ${WORD_KEY}:"${anchor}"`);
    Object.keys(edits[key]).forEach(f => {
      const from = orig[f] !== undefined ? `"${orig[f]}"` : "(none)";
      lines.push(`  ${f}: ${from}  →  "${edits[key][f]}"`);
    });
    lines.push("");
  });
  return lines.join("\n");
}

function copyWordEdits() {
  copyTextToClipboard(buildWordEditsExport())
    .then(() => showCelebrateToast("📋", "Copied!", "Changelist is on your clipboard"))
    .catch(() => alert(buildWordEditsExport()));
}
