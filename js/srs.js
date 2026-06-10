// ── SPACED REPETITION ─────────────────────────
function getWS(deckId, idx) {
  const key = deckId + "_" + idx;
  if (!S.words[key]) S.words[key] = { correct:0, wrong:0, streak:0, displayStreak:0, lastAnsweredAt:null, anki:freshAnki() };
  const ws = S.words[key];
  if (!ws.anki) ws.anki = freshAnki();
  if (ws.displayStreak === undefined) ws.displayStreak = ws.streak;
  return ws;
}
function wilsonLower(correct, total) {
  if (total === 0) return 0;
  const z = 1.281; // 80% confidence
  const p = correct / total;
  return (p + z*z/(2*total) - z*Math.sqrt((p*(1-p)+z*z/(4*total))/total)) / (1 + z*z/total);
}
function isMastered(ws) {
  if (ws.mastered) return true;
  const total = ws.correct + ws.wrong;
  if (ws.streak >= 6) return true;
  if (total >= 6 && wilsonLower(ws.correct, total) >= 0.724) return true;
  return false;
}
function isMasteryPlus(ws) {
  if (!isMastered(ws)) return false;
  if (!ws.masteryPlusDate) return false;
  const today = todayISO();
  if (daysBetween(ws.masteryPlusDate, today) > 21) return false;
  return ws.streak >= 3 && wilsonLower(ws.correct, ws.correct + ws.wrong) >= 0.83;
}

function checkMasteryPlus(ws) {
  if (!isMastered(ws)) return;
  if (ws.streak >= 3 && wilsonLower(ws.correct, ws.correct + ws.wrong) >= 0.83) {
    if (!isMasteryPlus(ws)) {
      ws.masteryPlusDate = todayISO();
      ws.streak = 0;
      addExp(75);
      confettiBurst(30);
      showCelebrateToast("⭐", "Mastery+!", "+75 XP · locked in for 21 days");
    }
  }
}

// ── ANSWER BOOKKEEPING ────────────────────────
// Shared correct/wrong bookkeeping used by drill, voice and timer modes.
function applyCorrect(ws) {
  ws.lastAnsweredAt = Date.now();
  ws.correct++; ws.streak++; ws.displayStreak++;
  S.totalCorrect++;
  if (!ws.mastered && isMastered(ws)) {
    ws.mastered = true;
    ws.streak = 0;
    addExp(50);
    confettiBurst(26);
    showCelebrateToast("🏆", "Word mastered!", "+50 XP");
  } else if (ws.mastered) {
    checkMasteryPlus(ws);
  }
  if (sessionConsecutive > (S.bestCombo || 0)) S.bestCombo = sessionConsecutive;
  checkAchievements({ type: "answer", hour: new Date().getHours() });
}
function applyWrong(ws) {
  ws.lastAnsweredAt = Date.now();
  ws.wrong++; ws.streak = 0; ws.displayStreak = 0;
}
// Drill combo: flash every 5 consecutive correct answers.
function checkCombo() {
  if (sessionConsecutive >= 5 && sessionConsecutive % 5 === 0) showComboFlash(sessionConsecutive);
}
function getWeight(w, focusMode=false) {
  const ws = getWS(w.deckId, w.idx);
  if (focusMode) {
    if (isMastered(ws)) return 0;
    if (ws.wrong > ws.correct && ws.wrong > 0) return 10 + ws.wrong * 3;
    return 5;
  }
  if (isMastered(ws)) return 1;
  if (ws.wrong > ws.correct && ws.wrong > 0) return 10 + ws.wrong * 2;
  return 5;
}
function pickNext(focusMode=false) {
  if (focusMode) {
    const unmastered = activeWords.filter(w => !isMastered(getWS(w.deckId, w.idx)));
    const masteredNotPlus = activeWords.filter(w => isMastered(getWS(w.deckId, w.idx)) && !isMasteryPlus(getWS(w.deckId, w.idx)));
    const masteryPlusWords = activeWords.filter(w => isMasteryPlus(getWS(w.deckId, w.idx)));
    const pool = unmastered.length ? unmastered : masteredNotPlus.length ? masteredNotPlus : masteryPlusWords;
    if (!pool.length) return null;
    const filtered = pool.length > 1 && currentWord
      ? pool.filter(w => !(w.deckId === currentWord.deckId && w.idx === currentWord.idx))
      : pool;
    const candidates = filtered.length ? filtered : pool;
    const weights = candidates.map(w => {
      const ws = getWS(w.deckId, w.idx);
      if (ws.correct === 0 && ws.wrong === 0) return 15;
      if (ws.wrong > ws.correct) return 10 + (ws.wrong - ws.correct) * 5;
      if (ws.correct > ws.wrong) return Math.max(2, 10 - 2 * (ws.correct - ws.wrong));
      return 10; // equal — still struggling
    });
    const total = weights.reduce((a,b) => a+b, 0);
    let r = Math.random() * total;
    for (let i = 0; i < candidates.length; i++) { r -= weights[i]; if (r <= 0) return candidates[i]; }
    return candidates[candidates.length - 1];
  }
  let pool = activeWords;
  if (!pool.length) return null;
  const filtered = pool.length > 1 && currentWord
    ? pool.filter(w => !(w.deckId === currentWord.deckId && w.idx === currentWord.idx))
    : pool;
  const candidates = filtered.length ? filtered : pool;
  const weights = candidates.map(w => Math.max(1, getWeight(w, false)));
  const total = weights.reduce((a,b) => a+b, 0);
  let r = Math.random() * total;
  for (let i = 0; i < candidates.length; i++) { r -= weights[i]; if (r <= 0) return candidates[i]; }
  return candidates[candidates.length - 1];
}
function pickNextRefresh() {
  if (!activeWords.length) return null;
  const never = activeWords.filter(w => !getWS(w.deckId, w.idx).lastAnsweredAt);
  const answered = activeWords
    .filter(w => getWS(w.deckId, w.idx).lastAnsweredAt)
    .sort((a, b) => getWS(a.deckId, a.idx).lastAnsweredAt - getWS(b.deckId, b.idx).lastAnsweredAt);
  const ordered = [...never, ...answered];
  const candidates = ordered.length > 1 && currentWord
    ? ordered.filter(w => !(w.deckId === currentWord.deckId && w.idx === currentWord.idx))
    : ordered;
  return candidates[0] || null;
}

// ── SM-2 ALGORITHM ────────────────────────────
// rating: 0=Again, 1=Hard, 2=Good, 3=Easy
function sm2(anki, rating) {
  const today = todayISO();
  let { interval, easeFactor, phase, learningStep, lapses } = anki;

  if (phase === "new" || phase === "learning") {
    phase = "learning"; // mark as seen immediately
    if (rating === 0) {
      // Again: full reset, re-insert in session
      learningStep = 0;
      interval = 1;
    } else if (rating === 1) {
      // Hard: stay on current step, ease penalty
      easeFactor = Math.max(1.3, easeFactor - 0.15);
      interval = 1;
    } else if (rating === 2) {
      // Good: advance step, graduate at step 2
      learningStep++;
      if (learningStep >= 2) {
        phase = "review";
        interval = 1;
        learningStep = 0;
      }
    } else {
      // Easy: graduate immediately with bonus interval
      phase = "review";
      interval = 4;
      easeFactor = Math.min(2.5, easeFactor + 0.15);
      learningStep = 0;
    }
  } else {
    // Review phase
    const daysSinceDue = anki.dueDate ? daysBetween(anki.dueDate, today) : 0;
    // Overdue correction: cap effective interval to avoid inflation
    const effectiveInterval = daysSinceDue > 1
      ? Math.min(anki.interval, daysSinceDue)
      : anki.interval;

    if (rating === 0) {
      // Again: lapse — back to learning, ease penalty
      lapses++;
      phase = "learning";
      learningStep = 0;
      interval = 1;
      easeFactor = Math.max(1.3, easeFactor - 0.2);
    } else if (rating === 1) {
      // Hard: slow growth, ease penalty
      interval = Math.max(1, Math.round(effectiveInterval * 1.2));
      easeFactor = Math.max(1.3, easeFactor - 0.15);
    } else if (rating === 2) {
      // Good: standard SM-2
      interval = Math.max(1, Math.round(effectiveInterval * easeFactor));
    } else {
      // Easy: accelerated growth + ease boost
      interval = Math.max(1, Math.round(effectiveInterval * easeFactor * 1.3));
      easeFactor = Math.min(2.5, easeFactor + 0.15);
    }
  }

  const dueDate = addDays(today, interval);
  return { interval, easeFactor, phase, learningStep, lapses, dueDate };
}
