// ── ACHIEVEMENTS ──────────────────────────────
// Data-driven achievement system. Earned ids are stored in S.badges
// (same array the old badge system used, so nothing already earned
// is ever lost).
//
// To add an achievement, append a definition:
//   id        — stable storage key (never change once shipped)
//   icon/name/desc
//   category  — section heading on the achievements screen
//   xp        — awarded once, when unlocked
//   secret    — hidden until earned (optional)
//   earned(ev)— return true to unlock; ev = the triggering event
//   progress()— optional { cur, target } for the locked progress bar
//
// Most checks read global state, so new achievements are awarded
// retroactively from existing progress the next time anything is
// answered. Event-only achievements (timer wins, Anki sessions,
// time of day) inspect `ev`:
//   { type:"answer", hour }  — after every correct answer
//   { type:"timer_end", won, perfect, words }
//   { type:"anki_complete" }
//   { type:"unlock" }        — after unlocking new words

const ACHIEVEMENTS = [
  // ── Getting started ──
  { id:"first_correct", icon:"🌱", name:"First Steps", desc:"Answer your first word correctly", category:"Getting Started", xp:50,
    earned:() => S.totalCorrect >= 1, progress:() => ({ cur:S.totalCorrect, target:1 }) },
  { id:"explorer", icon:"🧭", name:"Explorer", desc:"Unlock 100 words", category:"Getting Started", xp:100,
    earned:() => totalUnlockedWords() >= 100, progress:() => ({ cur:totalUnlockedWords(), target:100 }) },
  { id:"collector", icon:"🗃️", name:"Collector", desc:"Unlock 300 words", category:"Getting Started", xp:200,
    earned:() => totalUnlockedWords() >= 300, progress:() => ({ cur:totalUnlockedWords(), target:300 }) },
  { id:"polyglot", icon:"🌍", name:"Completionist", desc:"Unlock every word in a deck", category:"Getting Started", xp:100,
    earned:() => ALL_GROUPS.some(g => g.decks.some(d => getUnlocked(d.id) >= d.words.length)) },

  // ── Practice volume ──
  { id:"century", icon:"📚", name:"Century", desc:"100 correct answers, all time", category:"Practice", xp:100,
    earned:() => S.totalCorrect >= 100, progress:() => ({ cur:S.totalCorrect, target:100 }) },
  { id:"correct_500", icon:"✍️", name:"Wordsmith", desc:"500 correct answers, all time", category:"Practice", xp:150,
    earned:() => S.totalCorrect >= 500, progress:() => ({ cur:S.totalCorrect, target:500 }) },
  { id:"correct_1000", icon:"🏛️", name:"Thousand Club", desc:"1,000 correct answers, all time", category:"Practice", xp:200,
    earned:() => S.totalCorrect >= 1000, progress:() => ({ cur:S.totalCorrect, target:1000 }) },
  { id:"correct_2500", icon:"🧠", name:"Walking Dictionary", desc:"2,500 correct answers, all time", category:"Practice", xp:300,
    earned:() => S.totalCorrect >= 2500, progress:() => ({ cur:S.totalCorrect, target:2500 }) },
  { id:"daily_100", icon:"🏃", name:"Marathon", desc:"100 correct answers in a single day", category:"Practice", xp:150,
    earned:() => (S.drillCorrectToday || 0) >= 100, progress:() => ({ cur:S.drillCorrectToday || 0, target:100 }) },

  // ── Mastery ──
  { id:"mastery_10", icon:"🏆", name:"Mastery", desc:"Master 10 words", category:"Mastery", xp:100,
    earned:() => countMastered() >= 10, progress:() => ({ cur:countMastered(), target:10 }) },
  { id:"mastery_50", icon:"👑", name:"Grand Master", desc:"Master 50 words", category:"Mastery", xp:150,
    earned:() => countMastered() >= 50, progress:() => ({ cur:countMastered(), target:50 }) },
  { id:"mastery_100", icon:"🏰", name:"Centurion", desc:"Master 100 words", category:"Mastery", xp:250,
    earned:() => countMastered() >= 100, progress:() => ({ cur:countMastered(), target:100 }) },
  { id:"masteryplus_10", icon:"✨", name:"Shining", desc:"Hold Mastery+ on 10 words at once", category:"Mastery", xp:200,
    earned:() => countMasteryPlus() >= 10, progress:() => ({ cur:countMasteryPlus(), target:10 }) },
  { id:"comeback", icon:"🎢", name:"Comeback Kid", desc:"Master a word you got wrong 5+ times", category:"Mastery", xp:150,
    earned:() => Object.values(S.words).some(ws => (ws.wrong || 0) >= 5 && isMastered(ws)) },
  { id:"graduate", icon:"🎓", name:"Graduate", desc:"Master every unlocked word in a deck", category:"Mastery", xp:200,
    earned:() => ALL_GROUPS.some(g => g.decks.some(d => {
      const u = getUnlocked(d.id);
      return u > 0 && d.words.slice(0, u).every((_, i) => isMastered(getWS(d.id, i)));
    })) },

  // ── Hot streaks (within a session) ──
  { id:"on_fire", icon:"🔥", name:"On Fire", desc:"10 correct answers in one session", category:"Hot Streaks", xp:50,
    earned:() => sessionCorrect >= 10 },
  { id:"sharp", icon:"🎯", name:"Sharp", desc:"20 correct in a row", category:"Hot Streaks", xp:100,
    earned:() => sessionConsecutive >= 20 },
  { id:"combo_30", icon:"🔦", name:"Laser Focus", desc:"30 correct in a row", category:"Hot Streaks", xp:150,
    earned:() => sessionConsecutive >= 30 },
  { id:"combo_50", icon:"🌊", name:"Flow State", desc:"50 correct in a row", category:"Hot Streaks", xp:250,
    earned:() => sessionConsecutive >= 50 },

  // ── Daily habit ──
  { id:"streak_3", icon:"📅", name:"Dedicated", desc:"3-day practice streak", category:"Habit", xp:50,
    earned:() => maxLoginStreak() >= 3, progress:() => ({ cur:maxLoginStreak(), target:3 }) },
  { id:"streak_7", icon:"🗓️", name:"Committed", desc:"7-day practice streak", category:"Habit", xp:100,
    earned:() => maxLoginStreak() >= 7, progress:() => ({ cur:maxLoginStreak(), target:7 }) },
  { id:"streak_14", icon:"🚀", name:"Fortnight", desc:"14-day practice streak", category:"Habit", xp:150,
    earned:() => maxLoginStreak() >= 14, progress:() => ({ cur:maxLoginStreak(), target:14 }) },
  { id:"streak_30", icon:"💎", name:"Obsessed", desc:"30-day practice streak", category:"Habit", xp:250,
    earned:() => maxLoginStreak() >= 30, progress:() => ({ cur:maxLoginStreak(), target:30 }) },
  { id:"streak_60", icon:"🌋", name:"Unstoppable", desc:"60-day practice streak", category:"Habit", xp:400,
    earned:() => maxLoginStreak() >= 60, progress:() => ({ cur:maxLoginStreak(), target:60 }) },

  // ── Speed ──
  { id:"speed_demon", icon:"⚡", name:"Speed Demon", desc:"Finish a timer session", category:"Speed", xp:50,
    earned:ev => ev.type === "timer_end" },
  { id:"timer_perfect", icon:"💯", name:"Flawless", desc:"Win a timer session without a single mistake", category:"Speed", xp:150,
    earned:ev => ev.type === "timer_end" && ev.perfect },
  { id:"timer_50", icon:"🏎️", name:"Speed Machine", desc:"Win a 50-word timer session", category:"Speed", xp:250,
    earned:ev => ev.type === "timer_end" && ev.won && ev.words >= 50 },

  // ── Memory (Anki) ──
  { id:"anki_first", icon:"🃏", name:"Card Shark", desc:"Complete an Anki session", category:"Memory", xp:50,
    earned:ev => ev.type === "anki_complete" },
  { id:"anki_mature", icon:"🐘", name:"Long Memory", desc:"Grow a card to a 21-day review interval", category:"Memory", xp:150,
    earned:() => Object.values(S.words).some(ws => ws.anki && ws.anki.interval >= 21) },

  // ── Journey (levels) ──
  { id:"level_5", icon:"🧗", name:"Climber", desc:"Reach level 5", category:"Journey", xp:100,
    earned:() => currentLevel() >= 5, progress:() => ({ cur:currentLevel(), target:5 }) },
  { id:"level_10", icon:"🌟", name:"Rising Star", desc:"Reach level 10", category:"Journey", xp:150,
    earned:() => currentLevel() >= 10, progress:() => ({ cur:currentLevel(), target:10 }) },
  { id:"level_20", icon:"🧙", name:"Sage", desc:"Reach level 20", category:"Journey", xp:250,
    earned:() => currentLevel() >= 20, progress:() => ({ cur:currentLevel(), target:20 }) },
  { id:"level_30", icon:"🐉", name:"Grandmaster", desc:"Reach level 30", category:"Journey", xp:400,
    earned:() => currentLevel() >= 30, progress:() => ({ cur:currentLevel(), target:30 }) },

  // ── Secret ──
  { id:"early_bird", icon:"🐦", name:"Early Bird", desc:"Answer correctly before 7 in the morning", category:"Secret", xp:100, secret:true,
    earned:ev => ev.type === "answer" && ev.hour < 7 },
  { id:"night_owl", icon:"🦉", name:"Night Owl", desc:"Answer correctly after 11 at night", category:"Secret", xp:100, secret:true,
    earned:ev => ev.type === "answer" && ev.hour >= 23 },
  { id:"weekend_warrior", icon:"🛡️", name:"Weekend Warrior", desc:"Practice on a Saturday and the following Sunday", category:"Secret", xp:100, secret:true,
    earned:() => hasWeekendPair() },
];

// ── COUNTING HELPERS ──────────────────────────
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
    const newly = [];
    ACHIEVEMENTS.forEach(a => {
      if (S.badges.includes(a.id)) return;
      let ok = false;
      try { ok = !!a.earned(ev); } catch (e) { console.error("achievement check failed:", a.id, e); }
      if (ok) { S.badges.push(a.id); newly.push(a); }
    });
    if (!newly.length) return;
    newly.forEach((a, i) => setTimeout(() => {
      playAchievement();
      confettiBurst(30);
      showCelebrateToast(a.icon, a.name, `Achievement unlocked · +${a.xp} XP`);
    }, i * 1600));
    addExp(newly.reduce((sum, a) => sum + a.xp, 0)); // also saves state
  } finally {
    _checkingAchievements = false;
  }
}

// ── ACHIEVEMENTS SCREEN ───────────────────────
function renderBadgesScreen() {
  const earnedCount = ACHIEVEMENTS.filter(a => S.badges.includes(a.id)).length;
  const categories = [...new Set(ACHIEVEMENTS.map(a => a.category))];

  const sections = categories.map(cat => {
    const cards = ACHIEVEMENTS.filter(a => a.category === cat).map(a => {
      const earned = S.badges.includes(a.id);
      if (!earned && a.secret) {
        return `<div class="badge-card locked secret">
          <div class="badge-icon">🔒</div>
          <div class="badge-name">Secret</div>
          <div class="badge-desc">Keep playing to discover it</div>
        </div>`;
      }
      let progressHtml = "";
      if (!earned && a.progress) {
        const { cur, target } = a.progress();
        const pct = Math.min(100, Math.round((cur / target) * 100));
        progressHtml = `
          <div class="badge-progress-track"><div class="badge-progress-fill" style="width:${pct}%"></div></div>
          <div class="badge-progress-label">${Math.min(cur, target)}/${target}</div>`;
      }
      return `<div class="badge-card ${earned ? "earned" : "locked"}">
        <div class="badge-icon">${a.icon}</div>
        <div class="badge-name">${a.name}</div>
        <div class="badge-desc">${a.desc}</div>
        ${earned ? `<div class="badge-xp">+${a.xp} XP</div>` : progressHtml}
      </div>`;
    }).join("");
    return `<div class="badge-category">
      <div class="stats-section-title">${cat}</div>
      <div class="badges-grid">${cards}</div>
    </div>`;
  }).join("");

  document.getElementById("main-screen").innerHTML = `<div class="screen">
    <div class="screen-top">
      <div class="screen-label">Achievements · ${earnedCount}/${ACHIEVEMENTS.length} unlocked</div>
      <button class="back-btn" onclick="backToMenu()">← Back</button>
    </div>
    ${sections}
  </div>`;
}
