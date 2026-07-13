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
// "Struggling" = enough attempts, not mastered, and a Wilson lower bound
// clearly below the 0.724 mastery threshold. More right than wrong answers
// can still be struggling (e.g. 5✓/3✗ ≈ 0.44).
const STRUGGLE_WILSON_MAX = 0.5;
function isStruggling(ws) {
  const total = (ws.correct || 0) + (ws.wrong || 0);
  return total >= 3 && !isMastered(ws) && wilsonLower(ws.correct || 0, total) < STRUGGLE_WILSON_MAX;
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

// ── ANKI SCHEDULER ────────────────────────────
// Faithful port of Anki's SM-2 variant (see ANKI constants in config.js).
// rating: 0=Again, 1=Hard, 2=Good, 3=Easy. Returns a new anki state.
function ankiAnswer(a, rating) {
  const now = Date.now();
  const today = ankiToday();
  const st = { ...a };

  if (st.phase === "new") {
    st.phase = "learning";
    st.stepIndex = 0;
    st.introducedOn = today; // counts against today's new-card quota
  }

  if (st.phase === "learning" || st.phase === "relearning") {
    const steps = st.phase === "learning" ? ANKI.LEARNING_STEPS : ANKI.RELEARNING_STEPS;
    if (rating === 0) {
      // Again: back to the first step
      st.stepIndex = 0;
      st.due = now + steps[0] * 60000;
    } else if (rating === 1) {
      // Hard: repeat the step (on the first step Anki averages steps 1+2)
      const delay = st.stepIndex === 0 && steps.length > 1
        ? (steps[0] + steps[1]) / 2
        : steps[Math.min(st.stepIndex, steps.length - 1)];
      st.due = now + delay * 60000;
    } else if (rating === 2) {
      // Good: next step, or graduate to review after the last one
      const next = st.stepIndex + 1;
      if (next >= steps.length) ankiGraduate(st, false, today);
      else { st.stepIndex = next; st.due = now + steps[next] * 60000; }
    } else {
      // Easy: graduate immediately
      ankiGraduate(st, true, today);
    }
  } else {
    // Review phase. Days overdue give partial/full credit like Anki.
    const overdue = st.due ? Math.max(0, daysBetween(st.due, today)) : 0;
    if (rating === 0) {
      // Lapse: interval collapses, ease penalty, back through relearning
      st.lapses++;
      st.interval = Math.max(ANKI.LAPSE_MIN_IVL, Math.round(st.interval * ANKI.LAPSE_MULT));
      st.ease = Math.max(ANKI.MIN_EASE, st.ease - 0.20);
      st.phase = "relearning";
      st.stepIndex = 0;
      st.due = now + ANKI.RELEARNING_STEPS[0] * 60000;
      if (st.lapses >= ANKI.LEECH_THRESHOLD) st.leech = true;
    } else {
      let ivl;
      if (rating === 1) {
        ivl = st.interval * ANKI.HARD_MULT;
        st.ease = Math.max(ANKI.MIN_EASE, st.ease - 0.15);
      } else if (rating === 2) {
        ivl = (st.interval + overdue / 2) * st.ease;
      } else {
        ivl = (st.interval + overdue) * st.ease * ANKI.EASY_BONUS;
        st.ease = st.ease + 0.15;
      }
      // Next interval always exceeds the previous one by at least a day
      st.interval = Math.min(ANKI.MAX_IVL, Math.max(st.interval + 1, Math.round(ivl)));
      st.due = addDays(today, st.interval);
    }
  }
  return st;
}

// Leave the learning/relearning steps and become a review card.
function ankiGraduate(st, easy, today) {
  if (st.phase === "relearning") {
    // Post-lapse interval was already set at lapse time; Easy adds a day
    st.interval = Math.max(ANKI.LAPSE_MIN_IVL, st.interval + (easy ? 1 : 0));
  } else {
    st.interval = easy ? ANKI.EASY_IVL : ANKI.GRADUATING_IVL;
  }
  st.phase = "review";
  st.stepIndex = 0;
  st.due = addDays(today, st.interval);
}

// Button-preview label: what would happen to this card at each rating.
function ankiPreviewLabel(a, rating) {
  const st = ankiAnswer({ ...a }, rating);
  if (st.phase === "learning" || st.phase === "relearning") {
    return fmtIvlMin(Math.max(1, Math.round((st.due - Date.now()) / 60000)));
  }
  return fmtIvlDays(st.interval);
}

// Migrate a pre-rewrite anki object (day-based SM-2) to the new schema.
function migrateAnkiState(a) {
  if (!a || a.easeFactor === undefined) return a; // already new schema
  const fresh = freshAnki();
  fresh.ease   = Math.max(ANKI.MIN_EASE, a.easeFactor || ANKI.STARTING_EASE);
  fresh.lapses = a.lapses || 0;
  if (a.phase === "review" && a.dueDate) {
    fresh.phase = "review";
    fresh.interval = Math.max(1, a.interval || 1);
    fresh.due = a.dueDate;
    fresh.introducedOn = addDays(ankiToday(), -1); // unknown; don't eat today's quota
  } else if (a.phase === "learning") {
    fresh.phase = "learning";
    fresh.due = Date.now(); // due immediately, restart the steps
    fresh.introducedOn = addDays(ankiToday(), -1);
  }
  return fresh;
}
