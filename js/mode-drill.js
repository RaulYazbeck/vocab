// ── CLASSIC & FOCUS DRILL ─────────────────────
function startDrill() {
  answered    = false;
  currentWord = drillSubMode === 'refresh' ? pickNextRefresh() : pickNext(drillSubMode === 'focus');
  initDrillScreen();
}
function nextDrillWord() { answered = false; currentWord = drillSubMode === 'refresh' ? pickNextRefresh() : pickNext(drillSubMode === 'focus'); updateDrillWord(); }
// Renders the drill skeleton once per session. Never called again until
// the user leaves and re-enters drill mode.
function initDrillScreen() {
  showGameScreen();
  const el = document.getElementById("main-screen");
  el.innerHTML = `
    <div class="drill-meta-card">
      <div class="screen-top">
        <div class="screen-label" id="drill-deck-label"></div>
        <button class="back-btn" onclick="backToMenu()">← Menu</button>
      </div>
      <div id="unlock-row-drill"></div>
    </div>
    <div class="drill-word-card">
      <div class="word-display">
        <div class="english-word" id="drill-english"></div>
        <div class="word-hint"    id="drill-hint"></div>
      </div>
      <input type="text" class="german-input" id="german-input" placeholder="type the answer…"
        autocomplete="off" autocorrect="off" autocapitalize="off" spellcheck="false"
        onkeydown="handleDrillKey(event)"/>
      <div class="action-row">
        <button class="check-btn"    onclick="checkDrill()">Check</button>
        <button class="hint-btn"     id="hint-btn" onclick="showDrillHint()">💡 Hint</button>
        <button class="dontknow-btn" onclick="dontKnow()">? Don't know</button>
      </div>
      <div id="hint-area"></div>
      <div id="examples-area"></div>
      <div class="feedback" id="feedback" style="min-height:56px;"></div>
      <div class="stats-row"  id="stats-row"></div>
    </div>`;
  el.style.paddingBottom = IS_STANDALONE ? '50vh' : '';
  updateDrillWord();
}

// Updates only the parts that change between words. The DOM structure
// and the input element are preserved — keyboard never dismisses.
function updateDrillWord() {
  if (!currentWord) return;
  const ws = getWS(currentWord.deckId, currentWord.idx);
  const badges = wordBadgesHtml(ws);

  document.getElementById('drill-deck-label').textContent = currentWord.deckName;
  document.getElementById('drill-english').textContent    = currentWord.en;
  document.getElementById('drill-hint').innerHTML         = `${currentWord.hint} ${badges}`;

  const wordDisplay = document.querySelector('.drill-word-card .word-display');
  if (wordDisplay) {
    wordDisplay.classList.remove('word-pop');
    void wordDisplay.offsetWidth; // restart the animation
    wordDisplay.classList.add('word-pop');
  }

  const input = document.getElementById('german-input');
  input.value     = '';
  input.className = 'german-input';

  document.getElementById('feedback').innerHTML      = '';
  document.getElementById('examples-area').innerHTML = '';
  document.getElementById('hint-area').innerHTML     = '';
  document.getElementById('stats-row').innerHTML     = miniStats(ws);

  // Hint is only offered when the word can be confidently located
  // (and hidden) in one of its example sentences.
  currentDrillHint = buildHint(currentWord);
  const hintBtn = document.getElementById('hint-btn');
  hintBtn.style.display = currentDrillHint ? '' : 'none';
  hintBtn.disabled = false;

  renderUnlockRow('unlock-row-drill', currentWord.deckId);
  input.focus();
  // Auto-scroll keeps the card above the keyboard — installed PWA only,
  // desktop browsers should never jump around.
  if (IS_STANDALONE) {
    requestAnimationFrame(() => {
      const card = document.querySelector('.drill-word-card');
      if (card) card.scrollIntoView({block: 'start', behavior: 'instant'});
    });
  }
}
function renderUnlockRow(containerId, onlyDeckId = null) {
  const container = document.getElementById(containerId);
  if (!container) return;
  const rows = [];
  const _ids = onlyDeckId ? [onlyDeckId] : [...selectedIds];
  _ids.forEach(id => {
    const deck = getDeck(id);
    if (!deck) return;
    const u = getUnlocked(id);
    if (u < deck.words.length) {
      const toUnlock = Math.min(UNLOCK_STEP, deck.words.length - u);
      rows.push(`<div class="unlock-row">
        <div class="unlock-info">🔒 ${deck.name}: ${u} of ${deck.words.length} words unlocked</div>
        <button class="unlock-btn" onclick="event.stopPropagation();unlockMore('${id}')">+ Unlock ${toUnlock} words</button>
      </div>`);
    }
  });
  container.innerHTML = rows.join("");
}
let currentDrillHint = null;
function showDrillHint() {
  if (!currentDrillHint || answered) return;
  document.getElementById('hint-area').innerHTML = `
    <div class="hint-wrap">
      <div class="examples-title">💡 In context — word hidden</div>
      <div class="hint-sentence">${currentDrillHint}</div>
    </div>`;
  const hintBtn = document.getElementById('hint-btn');
  if (hintBtn) hintBtn.disabled = true;
  const input = document.getElementById('german-input');
  if (input) input.focus();
}
function focusInput() {
  const ids = ["german-input","timer-input"];
  const attempt = ms => setTimeout(() => {
    for (const id of ids) { const i = document.getElementById(id); if (i) { i.focus(); return; } }
  }, ms);
  attempt(0); attempt(100); attempt(300);
}
function handleDrillKey(e) { if (e.key === "Enter") { if (answered) nextDrillWord(); else checkDrill(); } }
function checkDrillMilestone() {
  const today = todayISO();
  if (S.drillMilestonesDate !== today) {
    S.drillMilestonesDate = today;
    S.drillCorrectToday = 0;
    S.drillMilestonesClaimed = [];
  }
  S.drillCorrectToday++;
  if (S.drillCorrectToday > (S.bestDayCorrect || 0)) S.bestDayCorrect = S.drillCorrectToday;
  const milestone = getDrillMilestone(S.drillCorrectToday);
  if (milestone && !S.drillMilestonesClaimed.includes(milestone.at)) {
    S.drillMilestonesClaimed.push(milestone.at);
    addExp(milestone.xp);
    showMilestoneFlash(`🎯 ${S.drillCorrectToday} correct today! +${milestone.xp} XP`);
  }
}

function showMilestoneFlash(msg) {
  const el = document.createElement("div");
  el.textContent = msg;
  el.style.cssText = `
    position:absolute;top:${window.scrollY + 24}px;left:50%;transform:translateX(-50%);
    background:#1D9E75;color:white;padding:10px 20px;border-radius:12px;
    font-size:14px;font-weight:700;z-index:999;
    animation:milestoneIn 0.3s ease,milestoneOut 0.4s ease 2s forwards;
    pointer-events:none;white-space:nowrap;
  `;
  el.id = "milestone-flash";
  const existing = document.getElementById("milestone-flash");
  if (existing) existing.remove();
  document.body.appendChild(el);
  setTimeout(() => el.remove(), 2500);
}
// Shared correct/wrong bookkeeping for typed and voice drill answers.
// Pure state changes only — sounds and rendering stay at the call sites.
function applyAnswerState(ws, correct) {
  if (correct) {
    sessionCorrect++; sessionConsecutive++;
    if (activeMode === "drill") checkDrillMilestone();
    addExp(ws.correct === 0 && ws.wrong === 0 ? 10 : 5);
    applyCorrect(ws);
    checkCombo();
  } else {
    applyWrong(ws); sessionConsecutive = 0;
  }
  saveState();
}
function checkDrill() {
  if (answered) return;
  const input = document.getElementById("german-input");
  if (!input || !currentWord) return;
  if (!input.value.trim()) { dontKnow(); return; }
  answered = true;
  const correct = isCorrect(input.value, currentWord[WORD_KEY]);
  const ws      = getWS(currentWord.deckId, currentWord.idx);
  applyAnswerState(ws, correct);
  input.classList.add(correct ? "correct" : "wrong");
  if (correct) playSuccess(); else playFailure();
  showDrillFeedback(correct, ws);
}
function dontKnow() {
  if (answered) return;
  answered = true;
  const ws = getWS(currentWord.deckId, currentWord.idx);
  applyAnswerState(ws, false);
  const input = document.getElementById("german-input");
  if (input) { input.value = currentWord[WORD_KEY]; input.classList.add("wrong"); }
  showDrillFeedback(false, ws);
}
// Fix a wrong prompt/answer on the spot — opens the word editor for the
// word just answered and refreshes the card with the edited texts.
let lastDrillCorrect = false;
function editCurrentDrillWord() {
  const { deckId, idx } = currentWord;
  openWordEditor(deckId, idx, () => {
    const src = getDeck(deckId).words[idx];
    WORD_EDIT_FIELDS.forEach(f => {
      if (src[f] === undefined) delete currentWord[f]; else currentWord[f] = src[f];
    });
    const ws = getWS(deckId, idx);
    const en = document.getElementById("drill-english");
    if (en) en.textContent = currentWord.en;
    const hint = document.getElementById("drill-hint");
    if (hint) hint.innerHTML = `${currentWord.hint} ${wordBadgesHtml(ws)}`;
    if (answered) showDrillFeedback(lastDrillCorrect, ws);
  });
}
function showDrillFeedback(correct, ws) {
  lastDrillCorrect = correct;
  const cls  = correct ? "correct" : "wrong";
  const icon = correct ? "✓" : "✗";
  document.getElementById("feedback").innerHTML = `
    <div class="feedback-left">
      <div class="feedback-text ${cls}">${icon} ${correct?"Correct!":"Answer:"} <strong>${currentWord[WORD_KEY]}</strong></div>
      ${currentWord.pl ? `<div class="plural-text">plural: ${currentWord.pl}</div>` : ""}
    </div>
    <div class="feedback-right">
      <button class="audio-btn" onclick="editCurrentDrillWord()" title="Edit this word">✏️</button>
      <button class="audio-btn" ${speakBtnAttrs(currentWord[WORD_KEY])}>🔊</button>
      <button class="next-btn"  onclick="nextDrillWord()">Next →</button>
    </div>`;
  speak(currentWord[WORD_KEY]);
  document.getElementById("hint-area").innerHTML = ""; // full examples replace the hint
  const hintBtn = document.getElementById("hint-btn");
  if (hintBtn) hintBtn.style.display = "none";
  document.getElementById("examples-area").innerHTML = examplesHtml(currentWord, "big");
  document.getElementById("stats-row").innerHTML = miniStats(ws);
  const inp = document.getElementById("german-input");
  if (inp) inp.focus();
}
