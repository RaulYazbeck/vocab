// ── ACHIEVEMENTS ──────────────────────────────
// Leveled, grindy achievement system. Every achievement is a ladder:
// it has tiers (level 1 … level N) with escalating targets, and the
// player climbs it over months of play. The flagship ladder is
// "Road to B1": level 1 at 10 words mastered, level 10 at 4,000.
//
// Storage:
//   S.achLevels = { id: levelReached }   — ladder progress
//   S.badges    = [id, …]                — one-shot secret achievements
//                                          (same array the old system
//                                           used, nothing is lost)
//
// To add a ladder, append a definition:
//   id       — stable storage key (never change once shipped)
//   icon/name/category
//   desc(t)  — description for a given tier target
//   tiers    — ascending targets, one per level
//   value()  — current metric the targets are measured against
//
// XP per tier climbs with the level: level 1 pays 50 XP, level 10
// pays 500 XP — finishing a whole ladder is worth 2,750 XP.

function xpForTier(tierIndex) { return (tierIndex + 1) * 50; }

const ACHIEVEMENTS = [
  // ── Vocabulary ──
  { id:"road_b1", icon:"🏔️", name:"Road to B1", category:"Vocabulary",
    desc:t => `Master ${t.toLocaleString()} words`,
    tiers:[10, 50, 150, 300, 600, 1000, 1500, 2200, 3000, 4000],
    value:() => countMastered() },
  { id:"explorer", icon:"🧭", name:"Explorer", category:"Vocabulary",
    desc:t => `Unlock ${t.toLocaleString()} words`,
    tiers:[25, 60, 120, 250, 450, 800, 1300, 2000, 3000, 4000],
    value:() => totalUnlockedWords() },
  { id:"perfectionist", icon:"✨", name:"Perfectionist", category:"Vocabulary",
    desc:t => `Hold Mastery+ on ${t} words at once`,
    tiers:[1, 3, 5, 10, 15, 25, 40, 60, 80, 100],
    value:() => countMasteryPlus() },
  { id:"comeback", icon:"🎢", name:"Comeback Kid", category:"Vocabulary",
    desc:t => `Master ${t} word${t>1?"s":""} you failed 5+ times`,
    tiers:[1, 3, 7, 12, 20, 30, 45, 60, 80, 100],
    value:() => Object.values(S.words).filter(ws => (ws.wrong || 0) >= 5 && isMastered(ws)).length },

  // ── Practice ──
  { id:"scholar", icon:"📚", name:"Scholar", category:"Practice",
    desc:t => `${t.toLocaleString()} correct answers, all time`,
    tiers:[50, 150, 400, 1000, 2000, 3500, 5500, 8000, 12000, 20000],
    value:() => S.totalCorrect || 0 },
  { id:"daily_grind", icon:"🏃", name:"Daily Grind", category:"Practice",
    desc:t => `${t} correct answers in a single day`,
    tiers:[25, 50, 75, 100, 150, 200, 250, 300, 400, 500],
    value:() => S.bestDayCorrect || 0 },
  { id:"combo_master", icon:"⚡", name:"Combo Master", category:"Practice",
    desc:t => `${t} correct answers in a row`,
    tiers:[10, 20, 30, 40, 60, 80, 120, 160, 200, 250],
    value:() => S.bestCombo || 0 },

  // ── Dedication ──
  { id:"streak_keeper", icon:"🔥", name:"Streak Keeper", category:"Dedication",
    desc:t => `Practice ${t} days in a row`,
    tiers:[3, 7, 14, 30, 60, 100, 150, 200, 280, 365],
    value:() => maxLoginStreak() },
  { id:"climber", icon:"🧗", name:"Climber", category:"Dedication",
    desc:t => `Reach level ${t}`,
    tiers:[5, 10, 15, 20, 25, 30, 35, 40, 45, 50],
    value:() => currentLevel() },

  // ── Speed ──
  { id:"timer_champion", icon:"🏆", name:"Timer Champion", category:"Speed",
    desc:t => `Win ${t} timer session${t>1?"s":""}`,
    tiers:[1, 10, 25, 50, 75, 130, 180, 250, 360, 500],
    value:() => S.timerWins || 0 },
  { id:"flawless", icon:"💯", name:"Flawless", category:"Speed",
    desc:t => `Win ${t} timer${t>1?"s":""} without a single mistake`,
    tiers:[1, 3, 7, 12, 20, 30, 45, 65, 90, 120],
    value:() => S.perfectTimerWins || 0 },
  { id:"photo_finish", icon:"⏱️", name:"Photo Finish", category:"Speed",
    desc:t => `Win a timer with ${t} seconds to spare`,
    tiers:[5, 10, 15, 20, 25, 30, 40, 50, 60, 75],
    value:() => Math.floor(S.bestTimerSecondsLeft || 0) },

  // ── Memory ──
  { id:"memory_master", icon:"🃏", name:"Memory Master", category:"Memory",
    desc:t => `Complete ${t} Anki session${t>1?"s":""}`,
    tiers:[1, 5, 12, 25, 45, 70, 100, 140, 190, 250],
    value:() => S.ankiSessions || 0 },
  { id:"elephant", icon:"🐘", name:"Elephant Memory", category:"Memory",
    desc:t => `Grow ${t} card${t>1?"s":""} to a 21-day review interval`,
    tiers:[1, 5, 15, 30, 60, 100, 160, 240, 350, 500],
    value:() => Object.values(S.words).filter(ws => ws.anki && ws.anki.interval >= 21).length },
];

// One "Conquered" ladder (single level) per deck group, generated from
// the app's configured groups — new decks get theirs automatically.
// Vocab groups are conquered by mastering every word; Anki groups by
// graduating every card into the review phase.
ALL_GROUPS.forEach(group => {
  const total = group.decks.reduce((s, d) => s + d.words.length, 0);
  // Read group.type directly: this runs at script load, before decks.js
  // (and its isAnkiGroup helper) exists — calling it here crashed the
  // rest of this file and with it every correct-answer feedback render.
  const anki = group.type === "anki";
  ACHIEVEMENTS.push({
    id: `group_master_${group.id}`,
    icon: group.icon || "🏅",
    name: `${group.name} Conquered`,
    category: "Vocabulary",
    desc: () => anki
      ? `Graduate every card in ${group.name} to review (${total.toLocaleString()} words)`
      : `Master every word in ${group.name} (${total.toLocaleString()} words)`,
    tiers: [total],
    value: () => anki ? groupReviewCount(group) : groupMasteredCount(group),
  });
});

// One-shot secret achievements (hidden until earned, stored in S.badges).
const SECRET_ACHIEVEMENTS = [
  { id:"early_bird", icon:"🐦", name:"Early Bird", desc:"Answer correctly before 7 in the morning", xp:100,
    earned:ev => ev.type === "answer" && ev.hour < 7 },
  { id:"night_owl", icon:"🦉", name:"Night Owl", desc:"Answer correctly after 11 at night", xp:100,
    earned:ev => ev.type === "answer" && ev.hour >= 23 },
  { id:"weekend_warrior", icon:"🛡️", name:"Weekend Warrior", desc:"Practice on a Saturday and the following Sunday", xp:100,
    earned:() => hasWeekendPair() },
  { id:"hat_trick", icon:"🎩", name:"Hat Trick", desc:"Win three timer sessions in one day", xp:150,
    earned:ev => ev.type === "timer_end" && ev.won && (ev.winsToday || 0) >= 3 },
];

// ── COUNTING HELPERS ──────────────────────────
function groupMasteredCount(group) {
  let n = 0;
  group.decks.forEach(d => d.words.forEach((_, i) => { if (isMastered(getWS(d.id, i))) n++; }));
  return n;
}
function groupReviewCount(group) {
  let n = 0;
  group.decks.forEach(d => d.words.forEach((_, i) => {
    const ws = S.words[d.id + "_" + i];
    if (ws && ws.anki && ws.anki.phase === "review") n++;
  }));
  return n;
}
function countMastered() {
  let n = 0;
  ALL_GROUPS.forEach(g => g.decks.forEach(d => d.words.forEach((_, i) => {
    if (isMastered(getWS(d.id, i))) n++;
  })));
  return n;
}
function countMasteryPlus() {
  let n = 0;
  ALL_GROUPS.forEach(g => g.decks.forEach(d => d.words.forEach((_, i) => {
    if (isMasteryPlus(getWS(d.id, i))) n++;
  })));
  return n;
}
function totalUnlockedWords() {
  let n = 0;
  ALL_GROUPS.forEach(g => g.decks.forEach(d => { n += getUnlocked(d.id); }));
  return n;
}
// Longest run of consecutive days in the login history.
function maxLoginStreak() {
  const dates = [...new Set(S.loginDates)].sort();
  if (!dates.length) return 0;
  let streak = 1, max = 1;
  for (let i = 1; i < dates.length; i++) {
    if (daysBetween(dates[i - 1], dates[i]) === 1) { streak++; max = Math.max(max, streak); }
    else streak = 1;
  }
  return max;
}
// A Saturday immediately followed by its Sunday in the login history.
function hasWeekendPair() {
  const dates = new Set(S.loginDates);
  return [...dates].some(d =>
    new Date(d + "T12:00").getDay() === 6 && dates.has(addDays(d, 1))
  );
}

// ── AWARDING ──────────────────────────────────
let _checkingAchievements = false; // addExp can re-enter via level-up

function checkAchievements(ev = {}) {
  if (_checkingAchievements) return;
  _checkingAchievements = true;
  try {
    if (!S.achLevels) S.achLevels = {};
    const unlocked = [];
    let xpGain = 0;

    ACHIEVEMENTS.forEach(a => {
      const cur = S.achLevels[a.id] || 0;
      const max = a.tiers.length;
      if (cur >= max) return;
      let v = 0;
      try { v = a.value(); } catch (e) { console.error("achievement value failed:", a.id, e); return; }
      let lvl = cur;
      while (lvl < max && v >= a.tiers[lvl]) lvl++;
      if (lvl > cur) {
        let xp = 0;
        for (let i = cur; i < lvl; i++) xp += xpForTier(i);
        xpGain += xp;
        S.achLevels[a.id] = lvl;
        unlocked.push({ icon: a.icon, name: a.name, sub: (lvl >= max
          ? `MAX LEVEL ${lvl}/${max}!`
          : `Level ${lvl}/${max}`) + ` · +${xp} XP` });
      }
    });

    SECRET_ACHIEVEMENTS.forEach(s => {
      if (S.badges.includes(s.id)) return;
      let ok = false;
      try { ok = !!s.earned(ev); } catch (e) {}
      if (ok) {
        S.badges.push(s.id);
        xpGain += s.xp;
        unlocked.push({ icon: s.icon, name: s.name, sub: `Secret achievement! · +${s.xp} XP` });
      }
    });

    if (!unlocked.length) return;
    unlocked.forEach((u, i) => setTimeout(() => {
      playAchievement();
      confettiBurst(u.sub.startsWith("MAX") ? 50 : 30);
      showCelebrateToast(u.icon, u.name, u.sub);
    }, i * 1600));
    addExp(xpGain); // also saves state
  } finally {
    _checkingAchievements = false;
  }
}

// ── ACHIEVEMENTS SCREEN ───────────────────────
function renderBadgesScreen() {
  if (!S.achLevels) S.achLevels = {};
  const totalLevels  = ACHIEVEMENTS.reduce((s, a) => s + a.tiers.length, 0) + SECRET_ACHIEVEMENTS.length;
  const earnedLevels = ACHIEVEMENTS.reduce((s, a) => s + (S.achLevels[a.id] || 0), 0)
    + SECRET_ACHIEVEMENTS.filter(s => S.badges.includes(s.id)).length;
  const categories = [...new Set(ACHIEVEMENTS.map(a => a.category))];

  const sections = categories.map(cat => {
    const cards = ACHIEVEMENTS.filter(a => a.category === cat).map(a => {
      const lvl   = S.achLevels[a.id] || 0;
      const max   = a.tiers.length;
      const maxed = lvl >= max;
      let v = 0; try { v = a.value(); } catch (e) {}
      const prevT = lvl > 0 ? a.tiers[lvl - 1] : 0;
      const nextT = maxed ? a.tiers[max - 1] : a.tiers[lvl];
      const pct   = maxed ? 100 : Math.max(0, Math.min(100, Math.round(((v - prevT) / (nextT - prevT)) * 100)));
      return `<div class="badge-card ${maxed ? "maxed" : lvl > 0 ? "earned" : "locked"}">
        <div class="badge-icon">${a.icon}</div>
        <div class="badge-name">${a.name}</div>
        <div class="badge-level">${maxed ? "MAX" : `Lv ${lvl}/${max}`}</div>
        <div class="badge-desc">${maxed ? a.desc(a.tiers[max - 1]) : `Next: ${a.desc(nextT)}`}</div>
        <div class="badge-progress-track"><div class="badge-progress-fill" style="width:${pct}%"></div></div>
        <div class="badge-progress-label">${maxed ? "Complete!" : `${Math.min(v, nextT).toLocaleString()}/${nextT.toLocaleString()}`}</div>
      </div>`;
    }).join("");
    return `<div class="badge-category">
      <div class="stats-section-title">${cat}</div>
      <div class="badges-grid">${cards}</div>
    </div>`;
  }).join("");

  const secretCards = SECRET_ACHIEVEMENTS.map(s => {
    const earned = S.badges.includes(s.id);
    if (!earned) {
      return `<div class="badge-card locked secret">
        <div class="badge-icon">🔒</div>
        <div class="badge-name">Secret</div>
        <div class="badge-desc">Keep playing to discover it</div>
      </div>`;
    }
    return `<div class="badge-card earned">
      <div class="badge-icon">${s.icon}</div>
      <div class="badge-name">${s.name}</div>
      <div class="badge-desc">${s.desc}</div>
      <div class="badge-xp">+${s.xp} XP</div>
    </div>`;
  }).join("");

  document.getElementById("main-screen").innerHTML = `<div class="screen">
    <div class="screen-top">
      <div class="screen-label">Achievements · ${earnedLevels}/${totalLevels} levels</div>
      <button class="back-btn" onclick="backToMenu()">← Back</button>
    </div>
    ${sections}
    <div class="badge-category">
      <div class="stats-section-title">Secret</div>
      <div class="badges-grid">${secretCards}</div>
    </div>
  </div>`;
}
