// ── UNLOCK SYSTEM ─────────────────────────────
function getUnlocked(deckId) {
  const deck = getDeck(deckId);
  if (!deck) return 0;
  if (S.unlocked[deckId] === undefined)
    S.unlocked[deckId] = Math.min(UNLOCK_INITIAL, deck.words.length);
  return S.unlocked[deckId];
}
function unlockMore(deckId) {
  stagedDeckId = deckId;
  stagedCount  = UNLOCK_STEP;
  showUnlockModal();
}
function showUnlockModal() {
  const deck = getDeck(stagedDeckId);
  if (!deck) return;
  const currentlyUnlocked = getUnlocked(stagedDeckId);
  const toAdd       = Math.min(stagedCount, deck.words.length - currentlyUnlocked);
  const stagedWords = deck.words.slice(currentlyUnlocked, currentlyUnlocked + toAdd);
  const canAddMore  = (currentlyUnlocked + toAdd) < deck.words.length;
  const remaining   = deck.words.length - (currentlyUnlocked + toAdd);
  const existing = document.getElementById("unlock-modal");
  if (existing) existing.remove();
  const overlay = document.createElement("div");
  overlay.className = "modal-overlay";
  overlay.id = "unlock-modal";
  overlay.innerHTML = `
    <div class="modal-sheet">
      <div class="modal-title">Add new words</div>
      <div class="modal-sub">${deck.name} · ${currentlyUnlocked} unlocked · adding ${toAdd} words</div>
      <div class="modal-word-list">
        ${stagedWords.map(w=>`<div class="modal-word">
          <span class="modal-word-en">${w.en}</span>
          <span class="modal-word-de">${w[WORD_KEY]}</span>
        </div>`).join("")}
      </div>
      <button class="modal-add-more" id="modal-add-more-btn" onclick="stageMore()" ${!canAddMore?"disabled":""}>
        ${canAddMore ? `+ ${Math.min(UNLOCK_STEP,remaining)} more words` : `No more words to add`}
      </button>
      <div class="modal-actions">
        <button class="modal-btn secondary" onclick="cancelUnlock()">Cancel</button>
        <button class="modal-btn primary"   onclick="confirmUnlock()">Add & Learn →</button>
      </div>
    </div>`;
  document.body.appendChild(overlay);
}
function stageMore()  { stagedCount += UNLOCK_STEP; showUnlockModal(); }
function cancelUnlock() {
  stagedCount = 0; stagedDeckId = null;
  const modal = document.getElementById("unlock-modal");
  if (modal) modal.remove();
}
function confirmUnlock() {
  const deck = getDeck(stagedDeckId);
  if (!deck) return;
  const currentlyUnlocked = getUnlocked(stagedDeckId);
  const toAdd    = Math.min(stagedCount, deck.words.length - currentlyUnlocked);
  const newWords = deck.words.slice(currentlyUnlocked, currentlyUnlocked + toAdd);
  S.unlocked[stagedDeckId] = currentlyUnlocked + toAdd;
  saveState();
  checkAchievements({ type: "unlock" });
  const modal = document.getElementById("unlock-modal");
  if (modal) modal.remove();
  const deckId = stagedDeckId;
  stagedCount = 0; stagedDeckId = null;
  activeWords = newWords.map((w,i) => ({...w, deckId, deckName:deck.name, idx:currentlyUnlocked+i}));
  activeMode = "learn";
  selectedIds.add(deckId);
  startLearn();
}
function unlockedWords(deck) {
  return deck.words.slice(0, getUnlocked(deck.id));
}


// ── DECK HELPERS ──────────────────────────────
function getDeck(deckId) {
  for (const g of ALL_GROUPS) for (const d of g.decks) if (d.id === deckId) return d;
  return null;
}
function deckProgress(deck) {
  const words = unlockedWords(deck);
  const mastered = words.filter((_,i) => isMastered(getWS(deck.id, i))).length;
  const masteryPlus = words.filter((_,i) => isMasteryPlus(getWS(deck.id, i))).length;
  return { mastered, masteryPlus, total:words.length, all:deck.words.length };
}
function resetDeck(deckId) {
  if (!confirm("Reset all progress for this deck?")) return;
  const deck = getDeck(deckId);
  if (!deck) return;
  deck.words.forEach((_,i) => { delete S.words[deckId + "_" + i]; });
  S.unlocked[deckId] = Math.min(UNLOCK_INITIAL, deck.words.length);
  saveState();
  renderStatsScreen();
  renderGroups();
}
function resetAll() {
  if (!confirm("Reset ALL progress across every deck? This cannot be undone.")) return;
  S.words = {}; S.exp = 0; S.badges = []; S.unlocked = {};
  S.loginDates = []; S.totalCorrect = 0; S.lastLoginDate = "";
  saveState();
  renderExpBar();
  renderGroups();
  renderStatsScreen();
}


// ── BUILD ACTIVE WORDS ────────────────────────
function buildActiveWords() {
  activeWords = [];
  selectedIds.forEach(id => {
    const deck = getDeck(id);
    if (!deck) return;
    unlockedWords(deck).forEach((w,i) => activeWords.push({...w, deckId:id, deckName:deck.name, idx:i}));
  });
}
function buildTimerWords() {
  if (timerSubMode === 'focus') {
    const unmastered = activeWords.filter(w => !isMastered(getWS(w.deckId, w.idx)));
    return unmastered.length ? unmastered : activeWords;
  }
  return activeWords;
}
function buildTimerQueue() {
  const words = buildTimerWords();
  const queue = [];
  while (queue.length < timerWordCount) queue.push(...shuffle([...words]));
  return queue.slice(0, timerWordCount);
}
// Re-insert the missed/skipped word at a random later spot so it comes back.
function requeueCurrentWord() {
  const remaining = timerQueue.length - timerWordsDone - 1;
  if (remaining > 0) {
    timerQueue.splice(timerWordsDone + 1 + Math.floor(Math.random() * remaining), 0, { ...currentWord });
  } else {
    timerQueue.push({ ...currentWord });
  }
}
