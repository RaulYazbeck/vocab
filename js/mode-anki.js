// ── ANKI STATE ────────────────────────────────
let ankiQueue = [];
let ankiIndex = 0;
let ankiShowingAnswer = false;
let ankiSessionStats = { again:0, hard:0, good:0, easy:0 };

// ── ANKI QUEUE BUILDER ────────────────────────
function buildAnkiQueue() {
  const today = todayISO();
  let newCards = [], learningCards = [], reviewCards = [];

  selectedIds.forEach(id => {
    const deck = getDeck(id);
    if (!deck) return;
    deck.words.forEach((w, i) => {
      const a = getWS(id, i).anki;
      const word = { ...w, deckId: id, deckName: deck.name, idx: i };
      if (a.phase === "new" && !a.dueDate) {
        newCards.push(word);
      } else if (a.phase === "learning" && a.dueDate <= today) {
        learningCards.push(word);
      } else if (a.phase === "review" && a.dueDate <= today) {
        reviewCards.push(word);
      }
    });
  });

  shuffle(learningCards);
  shuffle(reviewCards);
  shuffle(newCards);

  // Cap total session size: due/learning cards always included, new cards fill remaining slots up to 20
  const MAX_SESSION = 20;
  const dueCount = learningCards.length + reviewCards.length;
  const newSlots = Math.max(0, MAX_SESSION - dueCount);
  newCards = newCards.slice(0, newSlots);

  return [...learningCards, ...reviewCards, ...newCards];
}

function ankiDueCount() {
  const today = todayISO();
  let due = 0, newCount = 0;
  selectedIds.forEach(id => {
    const deck = getDeck(id);
    if (!deck) return;
    deck.words.forEach((w, i) => {
      const a = getWS(id, i).anki;
      if (a.phase === "new" && !a.dueDate) newCount++;
      else if (a.dueDate <= today) due++;
    });
  });
  return { due, newCount };
}
// ── ANKI SESSION ──────────────────────────────
function startAnki() {
  ankiQueue = buildAnkiQueue();
  if (ankiQueue.length === 0) {
    // Nothing due — redirect to Learn mode
    buildActiveWords();
    if (!activeWords.length) { backToMenu(); return; }
    activeMode = "learn";
    startLearn();
    return;
  }
  ankiIndex = 0;
  ankiShowingAnswer = false;
  ankiSessionStats = { again:0, hard:0, good:0, easy:0 };
  showGameScreen();
  renderAnkiQuestion();
}

function showGameScreen() {
  document.getElementById("main-screen").style.display = "block";
  document.getElementById("groups-container").style.display = "none";
  document.getElementById("start-bar").style.display = "none";
  document.getElementById("exp-bar").style.display = "none";
}

function ankiReveal() {
  ankiShowingAnswer = true;
  const word = ankiQueue[ankiIndex];
  const toSpeak = word.examples && word.examples.length ? word.examples[0][WORD_KEY] : word[WORD_KEY];
  speak(toSpeak);
  renderAnkiAnswer();
}

function ankiRate(rating) {
  const word = ankiQueue[ankiIndex];
  const ws = getWS(word.deckId, word.idx);

  // Apply SM-2
  ws.anki = sm2(ws.anki, rating);

  // Unlock this word for Classic/Focus/Timer if not already unlocked
  // Only extend the boundary sequentially — never jump ahead
  const currentUnlocked = S.unlocked[word.deckId] || 0;
  if (word.idx === currentUnlocked) {
    S.unlocked[word.deckId] = currentUnlocked + 1;
  }

  // Track session stats
  const labels = ["again", "hard", "good", "easy"];
  ankiSessionStats[labels[rating]]++;

  // XP
  const xpMap = [0, 2, 4, 8];
  if (xpMap[rating] > 0) addExp(xpMap[rating]);

  // Again in learning: re-insert 3 cards ahead so user sees it soon
  if (rating === 0) {
    const insertAt = Math.min(ankiIndex + 3, ankiQueue.length);
    ankiQueue.splice(insertAt, 0, { ...word });
  }

  saveState();
  ankiIndex++;

  if (ankiIndex >= ankiQueue.length) {
    renderAnkiSummary();
  } else {
    ankiShowingAnswer = false;
    renderAnkiQuestion();
  }
}

function ankiPreviewInterval(word, rating) {
  const ws = getWS(word.deckId, word.idx);
  const current = ws.anki;
  const result = sm2({ ...current }, rating);

  // Again on learning card: comes back within this session
  if (rating === 0 && (current.phase === "new" || current.phase === "learning")) {
    return "soon";
  }
  // Still in learning after this rating: comes back tomorrow
  if (result.phase === "learning") {
    return "1d";
  }
  // Graduated to review
  const n = result.interval;
  if (n < 30) return `${n}d`;
  if (n < 365) return `${Math.round(n/30)}mo`;
  return `${Math.round(n/365)}yr`;
}
// ── ANKI RENDER ───────────────────────────────
function renderAnkiQuestion() {
  const el = document.getElementById("main-screen");
  const word = ankiQueue[ankiIndex];
  if (!word) { renderAnkiSummary(); return; }
  const ws = getWS(word.deckId, word.idx);
  const a = ws.anki;
  const phaseBadge = a.phase === "review"
    ? `<span class="anki-badge review">review</span>`
    : a.phase === "learning"
      ? `<span class="anki-badge learning">learning</span>`
      : `<span class="anki-badge new">new</span>`;
  const total = ankiQueue.length;
  const pct = total > 0 ? Math.round((ankiIndex / total) * 100) : 0;
  const hasExample = word.examples && word.examples.length;
  const exSentence = hasExample ? word.examples[0][WORD_KEY] : null;

  el.innerHTML = `
    <div class="screen">
      <div class="screen-top">
        <div class="screen-label">🃏 Anki · ${total - ankiIndex} left</div>
        <button class="back-btn" onclick="backToMenu()">← Menu</button>
      </div>
      <div class="anki-progress-wrap">
        <div class="anki-progress-fill" style="width:${pct}%"></div>
      </div>
      <div class="anki-phase-row">${phaseBadge}</div>
      <div class="anki-word-header">
        <div class="anki-word-main">${word[WORD_KEY]}</div>
        ${word.hint ? `<div class="anki-word-hint">${word.hint}</div>` : ""}
      </div>
      ${hasExample
        ? `<div class="anki-example-q">
            <div class="anki-example-sentence">${exSentence}</div>
            <button class="anki-example-play" onclick="speak('${exSentence.replace(/'/g,"\\'")}')">🔊</button>
           </div>`
        : `<div style="text-align:center;padding:1.5rem 0;color:var(--text-2);font-size:16px;">${word.en}</div>`}
      <button class="anki-reveal-btn" onclick="ankiReveal()">Show Answer</button>
      <div class="anki-session-bar">
        <span class="anki-stat again">✗ ${ankiSessionStats.again}</span>
        <span class="anki-stat hard">~ ${ankiSessionStats.hard}</span>
        <span class="anki-stat good">✓ ${ankiSessionStats.good}</span>
        <span class="anki-stat easy">⚡ ${ankiSessionStats.easy}</span>
      </div>
    </div>`;

  setTimeout(() => speak(hasExample ? exSentence : word[WORD_KEY]), 350);
}

function renderAnkiAnswer() {
  const el = document.getElementById("main-screen");
  const word = ankiQueue[ankiIndex];
  if (!word) { renderAnkiSummary(); return; }
  const ws = getWS(word.deckId, word.idx);
  const a = ws.anki;
  const phaseBadge = a.phase === "review"
    ? `<span class="anki-badge review">review</span>`
    : a.phase === "learning"
      ? `<span class="anki-badge learning">learning</span>`
      : `<span class="anki-badge new">new</span>`;
  const total = ankiQueue.length;
  const pct = total > 0 ? Math.round((ankiIndex / total) * 100) : 0;
  const previews = [0,1,2,3].map(r => ankiPreviewInterval(word, r));
  const hasExample = word.examples && word.examples.length;
  const exSentence = hasExample ? word.examples[0][WORD_KEY] : null;
  const exEn = hasExample ? word.examples[0].en : null;

  el.innerHTML = `
    <div class="screen">
      <div class="screen-top">
        <div class="screen-label">🃏 Anki · ${total - ankiIndex} left</div>
        <button class="back-btn" onclick="backToMenu()">← Menu</button>
      </div>
      <div class="anki-progress-wrap">
        <div class="anki-progress-fill" style="width:${pct}%"></div>
      </div>
      <div class="anki-phase-row">${phaseBadge}</div>
      <div class="anki-word-header">
        <div class="anki-word-main">${word[WORD_KEY]}</div>
        ${word.hint ? `<div class="anki-word-hint">${word.hint}</div>` : ""}
      </div>
      ${hasExample
        ? `<div class="anki-example-q">
            <div class="anki-example-sentence">${exSentence}</div>
            <button class="anki-example-play" onclick="speak('${exSentence.replace(/'/g,"\\'")}')">🔊</button>
           </div>
           <div class="anki-answer-en">
             <div class="anki-answer-en-sentence">${exEn}</div>
             <div class="anki-answer-en-word">— ${word.en}</div>
           </div>`
        : `<div class="anki-answer-reveal">
            <div class="anki-answer-word">${word[WORD_KEY]}
              <button class="audio-btn" style="font-size:14px;padding:4px 8px;margin-left:8px;" onclick="speak('${word[WORD_KEY].replace(/'/g,"\\'")}')">🔊</button>
            </div>
            ${word.pl ? `<div style="font-size:13px;color:var(--text-3);margin-top:4px;">plural: ${word.pl}</div>` : ""}
           </div>`}
      <div class="anki-rating-row">
        <button class="anki-rate-btn again" onclick="ankiRate(0)">
          <span class="anki-rate-label">Again</span>
          <span class="anki-rate-interval">${previews[0]}</span>
        </button>
        <button class="anki-rate-btn hard" onclick="ankiRate(1)">
          <span class="anki-rate-label">Hard</span>
          <span class="anki-rate-interval">${previews[1]}</span>
        </button>
        <button class="anki-rate-btn good" onclick="ankiRate(2)">
          <span class="anki-rate-label">Good</span>
          <span class="anki-rate-interval">${previews[2]}</span>
        </button>
        <button class="anki-rate-btn easy" onclick="ankiRate(3)">
          <span class="anki-rate-label">Easy</span>
          <span class="anki-rate-interval">${previews[3]}</span>
        </button>
      </div>
      <div class="anki-session-bar">
        <span class="anki-stat again">✗ ${ankiSessionStats.again}</span>
        <span class="anki-stat hard">~ ${ankiSessionStats.hard}</span>
        <span class="anki-stat good">✓ ${ankiSessionStats.good}</span>
        <span class="anki-stat easy">⚡ ${ankiSessionStats.easy}</span>
      </div>
    </div>`;
}

function renderAnkiSummary() {
  const today = todayISO();
  // Find next due date across all selected decks
  let nextDue = null, nextCount = 0;
  selectedIds.forEach(id => {
    const deck = getDeck(id);
    if (!deck) return;
    unlockedWords(deck).forEach((w, i) => {
      const ws = getWS(id, i);
      if (!ws.anki || !ws.anki.dueDate) return;
      if (ws.anki.dueDate > today) {
        if (!nextDue || ws.anki.dueDate < nextDue) nextDue = ws.anki.dueDate;
      }
    });
  });
  if (nextDue) {
    selectedIds.forEach(id => {
      const deck = getDeck(id);
      if (!deck) return;
      unlockedWords(deck).forEach((w, i) => {
        const ws = getWS(id, i);
        if (ws.anki && ws.anki.dueDate === nextDue) nextCount++;
      });
    });
  }
  const nextDueLabel = nextDue
    ? `Next review: ${daysBetween(today, nextDue) === 1 ? "tomorrow" : `in ${daysBetween(today, nextDue)} days`} · ${nextCount} card${nextCount !== 1 ? "s" : ""}`
    : "No upcoming reviews scheduled yet.";

  // Bonus XP for completing session
  S.ankiSessions = (S.ankiSessions || 0) + 1;
  addExp(25);
  confettiBurst(36);
  checkAchievements({ type: "anki_complete" });

  document.getElementById("main-screen").innerHTML = `
    <div class="screen">
      <div class="result-screen">
        <div class="result-emoji">🎉</div>
        <div class="result-title">Session complete!</div>
        <div class="anki-summary-stats">
          <span class="anki-stat again">✗ Again: ${ankiSessionStats.again}</span>
          <span class="anki-stat hard">~ Hard: ${ankiSessionStats.hard}</span>
          <span class="anki-stat good">✓ Good: ${ankiSessionStats.good}</span>
          <span class="anki-stat easy">⚡ Easy: ${ankiSessionStats.easy}</span>
        </div>
        <div style="font-size:13px;color:#888;margin-top:1rem;">${nextDueLabel}</div>
        <div style="font-size:13px;color:#1D9E75;font-weight:600;margin-top:8px;">+25 XP session bonus</div>
        <button class="result-btn" onclick="backToMenu()">← Back to menu</button>
      </div>
    </div>`;
}
