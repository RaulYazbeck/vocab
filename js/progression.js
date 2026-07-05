// ── EXP & LEVELS ──────────────────────────────
function addExp(amount) {
  const before = currentLevel();
  S.exp += amount;
  saveState();
  renderExpBar();
  const after = currentLevel();
  if (after > before) {
    playLevelUp();
    confettiBurst(50);
    showCelebrateToast("🏅", `Level ${after}!`, "Keep it up!");
  }
}
function currentLevel() {
  let lv = 1;
  while (expForLevel(lv + 1) <= S.exp) lv++;
  return lv;
}
function getDailyStreak() {
  const today = new Date().toLocaleDateString('en-CA');
  const dates = [...new Set(S.loginDates)].sort();
  if (!dates.length) return 0;
  const last = dates[dates.length - 1];
  const diffFromToday = (new Date(today) - new Date(last)) / (1000*60*60*24);
  if (diffFromToday > 1) return 0;
  let streak = 1;
  for (let i = dates.length - 1; i > 0; i--) {
    const diff = Math.round((new Date(dates[i]) - new Date(dates[i-1])) / (1000*60*60*24));
    if (diff === 1) streak++;
    else break;
  }
  return streak;
}
function renderExpBar() {
  const lv   = currentLevel();
  const cur  = S.exp - expForLevel(lv);
  const need = expForLevel(lv + 1) - expForLevel(lv);
  const pct  = Math.min(100, Math.round((cur / need) * 100));
  const streak = getDailyStreak();
  const streakHtml = streak > 0
    ? `<div class="exp-streak">🔥 ${streak} day${streak>1?"s":""}</div>`
    : "";
  document.getElementById("exp-bar").innerHTML = `
    <div class="exp-bar-wrap">
      <div class="exp-level">Lv ${lv}</div>
      <div class="exp-track"><div class="exp-fill" style="width:${pct}%"></div></div>
      <div class="exp-label">${cur}/${need} XP</div>
      ${streakHtml}
    </div>
    ${dailyGoalHtml()}`;
}

// ── DAILY GOAL ────────────────────────────────
// Goal number lives in S.dailyGoal so it syncs between devices.
// Progress metric is S.drillCorrectToday (reset daily). Days where the
// goal was reached are recorded in S.goalDates; hitting the goal on
// GOAL_WEEK_TARGET days per week keeps the weekly goal streak alive.
const GOAL_OPTIONS = [10, 20, 50, 100, 150];
const GOAL_WEEK_TARGET = 5;
function getDailyGoal() {
  return GOAL_OPTIONS.includes(S.dailyGoal) ? S.dailyGoal : 20;
}
function goalWeekInfo() {
  const goalDates = new Set(S.goalDates || []);
  const daysHit = monday => {
    let c = 0; const t = new Date(monday);
    for (let i = 0; i < 7; i++) { if (goalDates.has(t.toLocaleDateString('en-CA'))) c++; t.setDate(t.getDate() + 1); }
    return c;
  };
  const monday = new Date(); monday.setHours(12, 0, 0, 0);
  monday.setDate(monday.getDate() - ((monday.getDay() + 6) % 7));
  const thisWeek = daysHit(monday);
  let streak = thisWeek >= GOAL_WEEK_TARGET ? 1 : 0;
  const m = new Date(monday);
  while (true) {
    m.setDate(m.getDate() - 7);
    if (daysHit(m) >= GOAL_WEEK_TARGET) streak++; else break;
  }
  return { thisWeek, streak };
}
let _goalCelebrated = null; // date the toast fired; seeded on first render
function dailyGoalHtml() {
  const goal  = getDailyGoal();
  const done  = S.drillCorrectToday || 0;
  const today = todayISO();
  const reached = done >= goal;
  if (_goalCelebrated === null) {
    // First render after page open: never toast retroactively.
    _goalCelebrated = reached ? today : "";
  } else if (reached && _goalCelebrated !== today) {
    _goalCelebrated = today;
    confettiBurst(40);
    showCelebrateToast("🎯", "Daily goal reached!", `${goal} correct today — nice!`);
  }
  const pct = Math.min(100, Math.round((done / goal) * 100));
  const week = goalWeekInfo();
  const weekChip = `<span class="goal-week">${week.thisWeek}/${GOAL_WEEK_TARGET}d${week.streak > 0 ? ` · 🔥${week.streak}w` : ""}</span>`;
  return `<div class="goal-row${reached ? " reached" : ""}">
      <span class="goal-icon">🎯</span>
      <div class="goal-track"><div class="goal-fill" style="width:${pct}%"></div></div>
      <span class="goal-label">${done}/${goal}${reached ? " ✓" : ""}</span>
      ${weekChip}
    </div>`;
}


// ── LOGIN STREAK ──────────────────────────────
function recordLogin() {
  const today = new Date().toLocaleDateString('en-CA');
  if (S.lastLoginDate === today) return;
  if (!S.loginDates.includes(today)) S.loginDates.push(today);
  S.lastLoginDate = today;
  S.exp += 15;
  // Do NOT stamp savedAt here at init time (and do NOT run achievement
  // checks, which save). If we did, this device would look "newer" than
  // cloud on page open and reject the load. The next real save
  // (answering a word, etc.) stamps savedAt via saveState() and the
  // answer's achievement check picks up any new streak achievements.
  saveLocalOnly();
  renderExpBar();
}
