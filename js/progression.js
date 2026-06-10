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
