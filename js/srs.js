// ── WORD RECORDS ──────────────────────────────
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

// ── STAGES ────────────────────────────────────
// Per-word Path fields (all optional, absent = 0/none):
//   st       stage 0–7 (see STAGE_DAYS in config.js)
//   dueAt    epoch ms the next review is due (null: locked in / not met)
//   sAt      epoch ms the current interval was scheduled
//   pk       highest stage ever reached (fast re-climb while st < pk)
//   rp       1 = 🩹 repair pending on a checkpoint word
//   lrn      1 = relearning / freshly introduced — needs one correct
//            recall to be (re)scheduled, never promotes
//   fl       1 = ⚠️ flagged by a recognition miss — typed check wanted
//   dropDay  study day of the last demotion (max one step down a day)
//   k        personal ease ×0.5–×1.6 on every interval (see EASE)
//   cf       1 = a hard word passed once at this stage, one more to go
//   mt       💎 maintenance check-ins done (see LOCKED_CHECKS)
//   rc       1 = a repaired 💎 word's extra check-in is pending
//   mastered sticky: reached Known once (achievements never go down)
function stageOf(ws) { return (ws && ws.st) || 0; }
function tierOfStage(st) { return TIERS.find(t => st >= t.min && st <= t.max) || TIERS[0]; }
function tierOf(ws) { return tierOfStage(stageOf(ws)); }
function isMastered(ws) { return !!ws && (!!ws.mastered || stageOf(ws) >= STAGE_KNOWN); }
function isMasteryPlus(ws) { return stageOf(ws) >= STAGE_STRONG; }
function isLockedIn(ws) { return stageOf(ws) >= STAGE_LOCKED; }
function isCheckpoint(st) { return st >= STAGE_KNOWN; }
// "Struggling" = enough attempts, not mastered, and a Wilson lower bound
// clearly below the mastery bar. More right than wrong answers can still
// be struggling (e.g. 5✓/3✗ ≈ 0.44).
const STRUGGLE_WILSON_MAX = 0.5;
function isStruggling(ws) {
  const total = (ws.correct || 0) + (ws.wrong || 0);
  return total >= 3 && !isMastered(ws) && wilsonLower(ws.correct || 0, total) < STRUGGLE_WILSON_MAX;
}
// Needs attention now: relearning, repair, flagged, or due.
function isDue(ws, now = Date.now()) {
  const st = stageOf(ws);
  if (!st) return false;
  if (ws.lrn || ws.rp || ws.fl) return true;
  return !!ws.dueAt && ws.dueAt <= now;
}
// Interval (days) for reaching `st`: scaled by the word's ease, halved
// while re-climbing to the peak.
function stageIntervalDays(ws, st) {
  let d = STAGE_DAYS[st] || 0;
  if (!d) return 0;
  d *= ws.k || 1;
  if (st < (ws.pk || 0)) d /= 2;
  return Math.max(1, Math.round(d));
}
function isHard(ws) { return (ws.k || 1) < EASE.HARD_K; }
function nudgeEase(ws, delta) {
  ws.k = Math.round(Math.max(EASE.MIN, Math.min(EASE.MAX, (ws.k || 1) + delta)) * 100) / 100;
}
function scheduleStage(ws, now, halve = false) {
  const st = stageOf(ws);
  ws.sAt = now;
  if (st >= STAGE_LOCKED) {
    // Just repaired: one extra check-in a month later (then the usual ones).
    if (halve) { ws.dueAt = studyDayStart(LOCKED_REPAIR_CHECK, now); return; }
    const mt = ws.mt || 0;
    ws.dueAt = mt < LOCKED_CHECKS.length ? studyDayStart(LOCKED_CHECKS[mt], now) : null;
    return;
  }
  let d = stageIntervalDays(ws, st);
  if (halve) d = Math.max(1, Math.round(d / 2));
  ws.dueAt = studyDayStart(d, now);
}
// Early review: for intervals of 4+ days, half the interval elapsed.
function isEarlyOk(ws, now) {
  if (!ws.dueAt || !ws.sAt) return false;
  const span = ws.dueAt - ws.sAt;
  return span >= 3.5 * 864e5 && now - ws.sAt >= span * 0.5;
}
// Pips for display: "●●●○○○○" (7 steps).
function pipsHtml(ws, cls = "") {
  const st = stageOf(ws);
  let s = "";
  for (let i = 1; i <= STAGE_MAX; i++) s += `<i class="pip ${i <= st ? "on" : ""} ${i >= STAGE_KNOWN ? "ck" : ""}"></i>`;
  return `<span class="pips ${cls}" aria-label="stage ${st} of ${STAGE_MAX}">${s}</span>`;
}
// Pips for a stage change: the pips just gained glow.
function pipsMoveHtml(from, to) {
  let s = "";
  for (let i = 1; i <= STAGE_MAX; i++) s += `<i class="pip ${i <= to ? "on" : ""} ${i > from && i <= to ? "gain" : ""} ${i >= STAGE_KNOWN ? "ck" : ""}"></i>`;
  return `<span class="pips" aria-label="stage ${from} to ${to} of ${STAGE_MAX}">${s}</span>`;
}
function tierBadgeHtml(ws) {
  const t = tierOf(ws);
  if (t.id === "new") return "";
  const extra = ws.rp ? " 🩹" : ws.fl ? " ⚠️" : "";
  return `<span class="tier-badge tier-${t.id}">${t.icon} ${t.name}${extra}</span>`;
}

// The single entry point for every answer that should move a word.
//   ok:   true / false / "near" (one-letter typo: neutral)
//   kind: "recall" (typed / spoken) or "recognition" (choice, games)
// Returns { from, to, promoted, demoted, repaired, events:[…] } so
// callers (Path end screen, quests, games) can report what happened.
// Never touches ws.correct/wrong — applyCorrect/applyWrong do that.
function srsReview(ws, ok, kind = "recall", now = Date.now(), opts = {}) {
  const from = stageOf(ws);
  const res = { from, to: from, promoted: false, demoted: false, repaired: false, events: [], pkBefore: ws.pk || 0 };
  if (ok === "near") { if (from && kind === "recall") nudgeEase(ws, -EASE.NEAR); return res; }
  const recall = kind === "recall";
  const today = studyToday();

  // Not met yet (Library drill of an unlocked word): the first answer
  // introduces it.
  if (!from) {
    if (!recall) return res;
    ws.st = 1; ws.pk = Math.max(ws.pk || 0, 1); ws.metOn = today;
    if (ok) { ws.lrn = 0; scheduleStage(ws, now); }
    else { ws.lrn = 1; ws.sAt = now; ws.dueAt = now + RELEARN_MS; }
    res.to = 1; res.events.push("met");
    return res;
  }

  if (!ok) {
    if (!recall) {
      // A recognition miss never demotes — it asks for a typed check.
      if (!ws.fl) { ws.fl = 1; res.events.push("flagged"); }
      return res;
    }
    ws.fl = 0; ws.cf = 0;
    // A slip on a scheduled word makes its future gaps shorter (once
    // per day — relearning misses in the same session don't stack).
    if (!ws.lrn && ws.dropDay !== today) nudgeEase(ws, isCheckpoint(from) && !ws.rp ? -EASE.REPAIR : -EASE.SLIP);
    if (isCheckpoint(from) && !ws.rp && ws.dropDay !== today) {
      // First slip on a checkpoint word: keep the badge, open a repair.
      ws.rp = 1; ws.lrn = 0; ws.sAt = now; ws.dueAt = now + RELEARN_MS;
      res.events.push("repair");
      return res;
    }
    if (ws.dropDay !== today) {
      const to = Math.max(1, from - 1);
      if (to < from) { ws.st = to; res.demoted = true; res.to = to; res.events.push("dropped"); }
      ws.dropDay = today;
    }
    ws.rp = 0;
    ws.lrn = 1; ws.sAt = now; ws.dueAt = now + RELEARN_MS;
    return res;
  }

  // ── correct ──
  if (ws.rp) {
    if (!recall) return res; // repairs need recall
    ws.rp = 0; ws.fl = 0; ws.lrn = 0;
    if (from >= STAGE_LOCKED) ws.rc = 1;
    scheduleStage(ws, now, true);
    res.repaired = true; res.events.push("repaired");
    return res;
  }
  if (ws.lrn) {
    if (!recall) return res;
    ws.lrn = 0; ws.fl = 0;
    scheduleStage(ws, now);
    res.events.push("confirmed");
    return res;
  }
  if (recall && ws.fl) { ws.fl = 0; res.events.push("unflagged"); }
  const due = !!ws.dueAt && ws.dueAt <= now;
  if (from >= STAGE_LOCKED) {
    if (due && recall) {
      if (ws.rc) ws.rc = 0; else ws.mt = (ws.mt || 0) + 1;
      scheduleStage(ws, now); res.events.push("maintained");
    }
    else { ws.spotAt = now; res.events.push("spotcheck"); }
    return res;
  }
  if (!due && !(recall && isEarlyOk(ws, now))) return res;
  if (!recall && from >= STAGE_RECOG_CAP) return res;
  if (recall) nudgeEase(ws, opts.ms > 0 && opts.ms < EASE.FAST_MS ? EASE.UP_FAST : EASE.UP);
  // Hard words need a second correct review at this stage first.
  if (recall && isHard(ws) && !ws.cf) {
    ws.cf = 1;
    scheduleStage(ws, now, true);
    res.events.push("confirm");
    return res;
  }
  ws.cf = 0;
  const to = from + 1;
  const firstTime = to > (ws.pk || 0);
  ws.st = to; ws.pk = Math.max(ws.pk || 0, to);
  scheduleStage(ws, now);
  res.to = to; res.promoted = true; res.events.push("up");
  if (to === STAGE_LOCKED) { ws.mt = 0; scheduleStage(ws, now); }
  if (to === STAGE_KNOWN && !ws.mastered) { ws.mastered = true; res.events.push("known"); }
  if (firstTime && to === STAGE_STRONG) res.events.push("strong");
  if (firstTime && to === STAGE_LOCKED) res.events.push("locked");
  return res;
}
// XP + celebrations for what srsReview reports. `quiet` skips toasts
// (games defer their own; the Path end screen shows a summary).
function celebrateReview(res, quiet = false) {
  if (!res) return;
  const ev = res.events;
  const toast = (i, t, s) => { if (!quiet) { confettiBurst(26); showCelebrateToast(i, t, s); } };
  if (ev.includes("known"))   { addExp(50);  toast("🌳", "Word Known!", "+50 XP"); }
  if (ev.includes("strong"))  { addExp(75);  toast("⭐", "Strong!", "+75 XP"); }
  if (ev.includes("locked"))  { addExp(150); toast("💎", "Locked in!", "+150 XP · done for good"); }
  if (ev.includes("repaired")) {
    addExp(10);
    S.repairedTotal = (S.repairedTotal || 0) + 1;
    if (res.from >= STAGE_LOCKED) checkAchievements({ type: "repair_locked" });
  }
  if (typeof questEvent === "function") questEvent("srs", res);
}

// ── ANSWER BOOKKEEPING ────────────────────────
// Shared correct/wrong bookkeeping used by drill, voice, timer, Path and
// the typed games. Every one of these is recall practice, so the word's
// stage moves through srsReview.
function applyCorrect(ws, opts = {}) {
  ws.lastAnsweredAt = Date.now();
  ws.correct++; ws.streak++; ws.displayStreak++;
  S.totalCorrect++;
  const res = srsReview(ws, true, opts.kind || "recall", Date.now(), { ms: opts.ms });
  res._w = opts.w || null;
  celebrateReview(res, opts.quiet);
  if (sessionConsecutive > (S.bestCombo || 0)) S.bestCombo = sessionConsecutive;
  checkAchievements({ type: "answer", hour: new Date().getHours() });
  return res;
}
function applyWrong(ws, opts = {}) {
  ws.lastAnsweredAt = Date.now();
  ws.wrong++; ws.streak = 0; ws.displayStreak = 0;
  const res = srsReview(ws, false, opts.kind || "recall");
  res._w = opts.w || null;
  if (typeof questEvent === "function") questEvent("srs", res);
  return res;
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
