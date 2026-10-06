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
// The one streak: days with all quests done, kept or frozen (quests.js).
function getDailyStreak() {
  return typeof questStreak === "function" && S.quests ? questStreak() : 0;
}
// The top bar: 🔥 streak (lit once today counts) · 🧊 freezes · Lv,
// with XP as a hairline along the header's bottom edge. The title and
// the XP numbers live on the Menu's profile card.
function renderExpBar() {
  const lv   = currentLevel();
  const cur  = S.exp - expForLevel(lv);
  const need = expForLevel(lv + 1) - expForLevel(lv);
  const pct  = Math.min(100, Math.round((cur / need) * 100));
  const streak = getDailyStreak();
  const safe = streakSafeToday();
  const freezes = (S.quests && S.quests.freezes) || 0;
  const meta = document.getElementById("hdr-meta");
  // 👵 Grandma mode: just the streak — no freezes, no level, no XP line.
  if (meta && grandmaOn()) meta.innerHTML = `
    <button class="hdr-chip streak-chip ${safe ? "safe" : ""}" onclick="openStreakSheet()" aria-label="${streak} days in a row${safe ? ", done for today" : ""}">
      <span class="sc-fire">🔥</span><b>${streak}</b></button>`;
  else if (meta) meta.innerHTML = `
    <button class="hdr-chip streak-chip ${safe ? "safe" : ""}" onclick="openStreakSheet()" aria-label="Streak ${streak} days${safe ? ", safe today" : ", not safe yet today"} · ${freezes} freezes">
      <span class="sc-fire">🔥</span><b>${streak}</b><span class="sc-ice">🧊${freezes}</span></button>
    <button class="hdr-chip lv-chip" onclick="openMenu()" aria-label="Level ${lv} — open the menu">Lv ${lv}</button>`;
  const bar = document.getElementById("exp-bar");
  if (bar) bar.innerHTML = `<i style="width:${pct}%"></i>`;
  celebrateStreakSafe(safe);
}
// Does today already count for the streak (all quests, kept or frozen)?
function streakSafeToday() {
  return typeof questStreakDays === "function" && S.quests ? questStreakDays().has(todayISO()) : false;
}
// One toast the moment today first counts (never on page open).
let _streakSafeSeen = null;
function celebrateStreakSafe(safe) {
  const today = todayISO();
  if (_streakSafeSeen === null || _streakSafeSeen.day !== today) { _streakSafeSeen = { day: today, safe }; return; }
  if (safe && !_streakSafeSeen.safe) {
    _streakSafeSeen.safe = true;
    confettiBurst(30);
    showCelebrateToast("🔥", "Streak safe for today", `${getDailyStreak()} day${getDailyStreak() === 1 ? "" : "s"} in a row`);
  }
}
// Tap 🔥: how today keeps the streak — any one of three — and freezes.
function openStreakSheet() {
  const Q = S.quests || {};
  const streak = getDailyStreak();
  const safe = streakSafeToday();
  const goal = getDailyGoal(), done = goalProgress();
  const keepAt = Math.ceil(goal * (typeof KEEP_GOAL_SHARE === "number" ? KEEP_GOAL_SHARE : 0.4));
  const nDone = (Q.list || []).filter(q => q.done).length, nAll = (Q.list || []).length || 4;
  const longDone = ((Q.m && Q.m.sessions) || []).some(x => x.len === "long" && !x.ab && !x.quick);
  if (grandmaOn()) {
    const left = Math.max(0, keepAt - done);
    openSheet({ title: "🔥 Streak", html: `
      <div class="sk-head"><b>${streak}</b> day${streak === 1 ? "" : "s"} in a row</div>
      <div class="gm-sk ${safe ? "ok" : ""}">${safe ? "✓ Done for today — see you tomorrow!" : `${left} more right answer${left === 1 ? "" : "s"} today keeps it going.`}</div>
      ${safe ? "" : `<span class="sk-bar gm-sk-bar"><i style="width:${Math.min(100, Math.round(done / Math.max(1, keepAt) * 100))}%"></i></span>`}
      ${safe ? "" : `<button class="tc-start gm-sk-go" onclick="closeSettings();startPathSession(S.path.sessionLen || 'regular')">Start ▶</button>`}` });
    return;
  }
  const bar = (a, b) => `<span class="sk-bar"><i style="width:${Math.min(100, Math.round(a / Math.max(1, b) * 100))}%"></i></span>`;
  const row = (ok, label, prog) => `<div class="sk-row ${ok ? "ok" : ""}"><span class="sk-tick">${ok ? "✓" : "○"}</span><span class="sk-label">${label}</span>${prog || ""}</div>`;
  openSheet({ title: "🔥 Streak", html: `
    <div class="sk-head"><b>${streak}</b> day${streak === 1 ? "" : "s"} in a row<span class="sk-state ${safe ? "ok" : ""}">${safe ? "✓ Safe today" : "Not safe yet today"}</span></div>
    <div class="set-group-title">Keep it today — any one of</div>
    ${row(done >= keepAt, `${Math.min(done, keepAt)} / ${keepAt} right answers <small>(${Math.round(keepAt / goal * 100)}% of your goal of ${goal})</small>`, bar(done, keepAt))}
    ${row(longDone, "Finish a Long session")}
    ${row(nDone >= nAll, `All ${nAll} quests <small>(${nDone} / ${nAll})</small>`, bar(nDone, nAll))}
    <div class="sk-freeze">🧊 <b>${Q.freezes || 0}</b> freeze${Q.freezes === 1 ? "" : "s"} — each one covers a missed day by itself. Chests give more.</div>
    <button class="g-sec-btn sk-cal" onclick="menuGo('stats')">📅 Streak calendar</button>` });
}

// ── DAILY GOAL ────────────────────────────────
// Goal number lives in S.dailyGoal so it syncs between devices.
// Progress metric is S.drillCorrectToday (reset daily). Days where the
// goal was reached are recorded in S.goalDates; hitting the goal on
// The goal bar shows how many of this week's days hit it (of GOAL_WEEK_TARGET).
const GOAL_OPTIONS = [10, 20, 50, 100, 150];
const GOAL_WEEK_TARGET = 5;
function getDailyGoal() {
  // A finish date sizes the goal to the day's real work (see path.js).
  const plan = typeof pathEnsurePlan === "function" && S.path ? pathEnsurePlan() : null;
  if (plan) return plan.goal;
  return GOAL_OPTIONS.includes(S.dailyGoal) ? S.dailyGoal : 20;
}

// Every correct answer counts toward the goal — typed, spoken, choice,
// Anki or games. Games count 1:1 but can fill at most GAME_GOAL_SHARE of
// the goal, so reaching it always takes real (typed) recall.
const GAME_GOAL_SHARE = 0.3;
function gameGoalCredit() {
  if (S.gameCorrectDate !== todayISO()) return 0;
  return Math.min(S.gameCorrectToday || 0, Math.floor(getDailyGoal() * GAME_GOAL_SHARE));
}
function drillCorrectTodayCount() {
  return S.drillMilestonesDate === todayISO() ? (S.drillCorrectToday || 0) : 0;
}
function goalProgress() {
  // With a finish date, one counter everywhere: correct answers while
  // studying today (Today sessions, Drill, Timer, bosses) — the same
  // number as "Today's plan".
  if (S.path && S.path.deadline && S.quests && S.quests.m && S.quests.day === todayISO()) return S.quests.m.ok || 0;
  return drillCorrectTodayCount() + gameGoalCredit();
}
function markGoalIfReached() {
  const today = todayISO();
  if (!S.goalDates) S.goalDates = [];
  if (goalProgress() >= getDailyGoal() && !S.goalDates.includes(today)) S.goalDates.push(today);
  if (typeof questMarkKept === "function" && S.quests && S.quests.m) questMarkKept();
}
// Caller saves. n = correct answers given in a game.
function creditGameAnswers(n) {
  if (!(n > 0)) return;
  const today = todayISO();
  if (S.gameCorrectDate !== today) { S.gameCorrectDate = today; S.gameCorrectToday = 0; }
  S.gameCorrectToday = (S.gameCorrectToday || 0) + n;
  markGoalIfReached();
}
// Goal days in this Monday–Sunday study week.
function goalWeekInfo() {
  const goalDates = new Set(S.goalDates || []);
  const today = todayISO();
  const monday = addDays(today, -((new Date(today + "T12:00").getDay() + 6) % 7));
  let thisWeek = 0;
  for (let i = 0; i < 7; i++) if (goalDates.has(addDays(monday, i))) thisWeek++;
  return { thisWeek };
}
// One note, once, when levels moved to the journey curve (config.js):
// the same XP now shows a lower level, so say why. A cloud load can
// replace S before the flag reaches the cloud: once per page, too.
let _journeyNoted = false;
function noteJourneyLevels() {
  if (S.lvCurve === 2) return;
  S.lvCurve = 2;
  saveLocalOnly(); // no savedAt stamp at init (see recordLogin)
  if (_journeyNoted) return;
  _journeyNoted = true;
  if ((S.exp || 0) > expForLevel(10) && !grandmaOn())
    setTimeout(() => showCelebrateToast("🗺️", "Levels now follow your journey",
      `Lv ${currentLevel()} = ${journeyPercent()}% of the way · Lv 100 = every deck done`), 1500);
}
// ── DAILY LOGIN ──────────────────────────────
function recordLogin() {
  const today = todayISO();
  if (S.lastLoginDate === today || S.loginDates.includes(today)) return;
  S.loginDates.push(today);
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
