// ── ACHIEVEMENTS ──────────────────────────────
// Leveled, grindy achievement system. Every achievement is a ladder of
// 10 levels, and every ladder is paced to the journey: it tops out at
// B1 — every Path word (A1, A2 and B1) climbed to 💎, the same finish
// line as Lv 100. Nothing counts Anki cards or Anki sessions.
//
// How a ladder is sized:
//   • word ladders top out at the app's own word count (German and
//     French differ), so the last level lands as the last word does;
//   • habit ladders (quests, sessions, games, bosses…) top out at what
//     the journey brings at a steady pace, worked out from its length:
//     your first day → your finish date (Study plan), or ~9 months
//     without one;
//   • no "best ever" ladders: a record (longest combo, best day) is
//     set in one good week, so skill ladders count how often you do it
//     (20-combos, goal days, gender runs, seconds banked).
// Levels come quickly at first and then spread out (ACH_CURVE): half the
// levels by ~half the journey, the last one at the very end.
//
// Storage:
//   S.ach    = { id: levelReached }   — ladder progress (paced system)
//   S.badges = [id, …]                — one-shot secret achievements
// (S.achLevels holds the old, unpaced levels — no longer read.)
//
// To add a ladder, append a definition:
//   id       — stable storage key (never change once shipped)
//   icon/name/category
//   desc(t)  — description for a given tier target
//   top()    — the target of the last level (or fixed `tiers`)
//   curve    — optional: other level spacing than ACH_CURVE
//   exact    — optional: end on `top` itself, unrounded
//   value()  — current metric the targets are measured against
//
// XP per tier climbs with the level: level 1 pays 50 XP, level 10
// pays 500 XP — finishing a whole ladder is worth 2,750 XP.

function xpForTier(tierIndex) { return (tierIndex + 1) * 50; }

// ── PACING ────────────────────────────────────
const ACH_CURVE = [0.02, 0.05, 0.1, 0.17, 0.26, 0.37, 0.5, 0.64, 0.81, 1];
const JOURNEY_DEFAULT_DAYS = 270; // no finish date set: ~9 months
function journeyStart() { return (S.loginDates && S.loginDates[0]) || todayISO(); }
function journeyEnd() {
  return S.path && S.path.deadline ? S.path.deadline : addDays(journeyStart(), JOURNEY_DEFAULT_DAYS);
}
// Days from your first day to B1 (never under 90, so a date set late
// in the journey can't shrink the ladders to nothing).
function journeyDays() {
  const d = daysBetween(journeyStart(), journeyEnd());
  return Number.isFinite(d) ? Math.max(90, d) : JOURNEY_DEFAULT_DAYS; // a malformed date: the default
}
function journeyWeeks() { return journeyDays() / 7; }
function vocabGroupsOnly() { return ALL_GROUPS.filter(g => g.type !== "anki"); }
function vocabWordCount() {
  return vocabGroupsOnly().reduce((s, g) => s + g.decks.reduce((t, d) => t + d.words.length, 0), 0);
}
function vocabDeckCount() { return vocabGroupsOnly().reduce((s, g) => s + g.decks.length, 0); }
let _nounCount = null;
function vocabNounCount() {
  if (_nounCount === null && typeof nounParts === "function")
    _nounCount = vocabGroupsOnly().reduce((s, g) => s + g.decks.reduce((t, d) => t + d.words.filter(w => nounParts(w)).length, 0), 0);
  return _nounCount || 0;
}
function niceTier(x) {
  return x < 50 ? Math.round(x) : x < 100 ? Math.round(x / 5) * 5 : x < 1000 ? Math.round(x / 10) * 10 : Math.round(x / 50) * 50;
}
// 10 rising targets ending at `top` (rounded unless `exact`: word
// ladders end on the very last word).
function tiersTo(top, curve = ACH_CURVE, exact = false) {
  top = Math.max(curve.length, exact ? Math.round(top) || 0 : niceTier(top || 0));
  const out = [];
  curve.forEach((f, i) => {
    const t = i === curve.length - 1 ? top : niceTier(top * f);
    out.push(Math.max(t, out.length ? out[out.length - 1] + 1 : 1));
  });
  return out;
}
function gamesList() { return typeof GAMES === "undefined" ? [] : GAMES; }
function cosmeticCount() { return typeof COSMETICS === "undefined" ? 0 : COSMETICS.filter(c => !c.free).length; }
const plural = (t, one, many) => t === 1 ? one : many;
const GENDER_RUN = 20;

const ACHIEVEMENTS = [
  // ── Vocabulary ──
  { id:"road_b1", exact:true, icon:"🏔️", name:"Road to B1", category:"Vocabulary",
    desc:t => `Get ${t.toLocaleString()} words to 🌳 Known`,
    top:() => vocabWordCount(),
    value:() => countMastered(true) },
  { id:"explorer", exact:true, icon:"🧭", name:"Explorer", category:"Vocabulary",
    desc:t => `Meet ${t.toLocaleString()} new words`,
    top:() => vocabWordCount(),
    value:() => countMet() },
  { id:"perfectionist", exact:true, icon:"✨", name:"Perfectionist", category:"Vocabulary",
    desc:t => `Hold ⭐ Strong or better on ${t.toLocaleString()} words at once`,
    top:() => vocabWordCount(),
    value:() => countMasteryPlus() },
  { id:"locked_in", exact:true, icon:"💎", name:"Locked In", category:"Vocabulary",
    desc:t => `Lock in ${t.toLocaleString()} ${plural(t, "word", "words")} for good`,
    top:() => vocabWordCount(),
    value:() => countLockedIn() },
  { id:"comeback", icon:"🎢", name:"Comeback Kid", category:"Vocabulary",
    desc:t => `Get ${t} ${plural(t, "word", "words")} you missed 3+ times to 🌳 Known`,
    top:() => vocabWordCount() * 0.05, // simulated: ~200 at 92% right
    value:() => { let n = 0; forEachVocabWord(ws => { if (ws && (ws.wrong || 0) >= 3 && isMastered(ws) && !skipUnearned(ws)) n++; }); return n; } },
  { id:"healer", icon:"🩹", name:"Healer", category:"Vocabulary",
    desc:t => `Repair ${t} slipped ${plural(t, "word", "words")}`,
    top:() => vocabWordCount() * 0.2, // simulated: ~800 repairs at 92% right
    value:() => S.repairedTotal || 0 },

  // ── Today ──
  { id:"sessions", icon:"🏃", name:"Regular", category:"Today",
    desc:t => `Finish ${t.toLocaleString()} Today ${plural(t, "session", "sessions")}`,
    top:() => journeyDays(),
    value:() => S.sessionsDone || 0 },
  { id:"clean_sweep", icon:"🧼", name:"Clean Sweep", category:"Today",
    desc:t => `Finish ${t} Today ${plural(t, "session", "sessions")} of 10+ answers without a mistake`,
    top:() => journeyDays() * 0.15,
    value:() => S.flawlessSessions || 0 },
  { id:"marathon", icon:"🏅", name:"Marathon", category:"Today",
    desc:t => `Finish ${t} Long ${plural(t, "session", "sessions")}`,
    top:() => journeyDays() * 0.15,
    value:() => S.longSessions || 0 },

  // ── Practice ──
  { id:"scholar", icon:"📚", name:"Scholar", category:"Practice",
    desc:t => `${t.toLocaleString()} correct answers, all time`,
    top:() => vocabWordCount() * 9.5, // simulated: 8.5–11.7 answers take a word to 💎
    value:() => S.totalCorrect || 0 },
  { id:"goal_days", icon:"🏋️", name:"Daily Grind", category:"Practice",
    desc:t => `Reach your daily goal on ${t} ${plural(t, "day", "days")} (Anki aside)`,
    top:() => journeyDays() * 0.8,
    value:() => (S.vocabGoalDates || []).length },
  { id:"combo_runs", icon:"⚡", name:"Combo Master", category:"Practice",
    desc:t => `Reach a 🔥${COMBO_RUN} combo ${t} ${plural(t, "time", "times")}`,
    top:() => journeyDays() * 0.4,
    value:() => S.comboRuns || 0 },

  // ── Quests ──
  { id:"quest_master", icon:"🏁", name:"Quest Master", category:"Quests",
    desc:t => `Finish all four quests on ${t} ${plural(t, "day", "days")}`,
    top:() => journeyDays() * 0.8,
    value:() => (S.quests && S.quests.qdays && S.quests.qdays.length) || 0 },
  { id:"saga_hero", icon:"📜", name:"Saga Hero", category:"Quests",
    desc:t => `Finish ${t} weekly ${plural(t, "saga", "sagas")}`,
    top:() => journeyWeeks() * 0.75,
    value:() => (S.quests && S.quests.sagas) || 0 },
  { id:"collector", icon:"🎨", name:"Collector", category:"Quests",
    desc:t => `Own ${t} ${plural(t, "cosmetic", "cosmetics")}`,
    top:() => Math.min(cosmeticCount() || 37, journeyDays() * 0.15),
    value:() => (S.quests && S.quests.cos && S.quests.cos.owned.length) || 0 },
  { id:"lucky", icon:"🍀", name:"Lucky", category:"Quests",
    desc:t => `Catch ${t} flash ${plural(t, "quest", "quests")} or lucky ${plural(t, "drop", "drops")}`,
    top:() => journeyDays() * 0.7,
    value:() => ((S.quests && S.quests.flashes) || 0) + ((S.quests && S.quests.lucky) || 0) },

  // ── Dedication ──
  { id:"streak_keeper", icon:"🔥", name:"Streak Keeper", category:"Dedication",
    desc:t => `Keep your 🔥 streak for ${t} days`,
    top:() => journeyDays() * 0.75,
    value:() => maxStreak() },
  { id:"climber", icon:"🧗", name:"Climber", category:"Dedication",
    desc:t => `Reach level ${t}`,
    tiers:[5, 10, 20, 30, 40, 50, 60, 70, 85, 100], // Lv 100 = the end of the journey
    value:() => currentLevel() },

  // ── Arcade (minigames, see games-core.js) ──
  { id:"arcade_regular", icon:"🕹️", name:"Arcade Regular", category:"Arcade",
    desc:t => `Finish ${t.toLocaleString()} minigame ${plural(t, "round", "rounds")}`,
    top:() => journeyDays() * 1.5,
    value:() => (S.games && S.games.totalPlays) || 0 },
  { id:"star_collector", icon:"🌟", name:"Star Collector", category:"Arcade",
    desc:t => `Collect ${t} stars across every game and rank`,
    top:() => gamesList().reduce((s, g) => s + (g.ranks || GAME_RANKS).length * 3, 0) * 0.7,
    value:() => typeof totalGameStars === "function" ? totalGameStars() : 0 },
  { id:"rank_climber", icon:"🎖️", name:"Rank Climber", category:"Arcade",
    desc:t => `Earn ${t} ${plural(t, "rank-up", "rank-ups")} across the games (🥉→💎)`,
    top:() => gamesList().reduce((s, g) => s + Math.min(GAME_RANKS.length, (g.ranks || GAME_RANKS).length) - 1, 0) * 0.75,
    value:() => Object.values((S.games && S.games.rank) || {}).reduce((a, b) => a + (b || 0), 0) },
  { id:"timer_champion", icon:"🏆", name:"Timer Champion", category:"Arcade",
    desc:t => `Win ${t} ⏱️ Timer ${plural(t, "round", "rounds")}`,
    top:() => journeyDays() * 0.2,
    value:() => S.timerWins || 0 },
  { id:"flawless", icon:"💯", name:"Flawless", category:"Arcade",
    desc:t => `Win ${t} ⏱️ Timer ${plural(t, "round", "rounds")} without a single mistake`,
    top:() => journeyDays() * 0.08,
    value:() => S.perfectTimerWins || 0 },
  { id:"spare_time", icon:"⏳", name:"Photo Finish", category:"Arcade",
    desc:t => `Bank ${t.toLocaleString()} seconds to spare across ⏱️ Timer wins`,
    top:() => journeyDays() * 0.2 * 20, // ~20 s left on a typical win
    value:() => Math.floor(S.timerSpareTotal || 0) },
  { id:"boss_slayer", icon:"👾", name:"Boss Slayer", category:"Arcade",
    desc:t => `Defeat ${t} ${plural(t, "boss", "bosses")}`,
    top:() => journeyDays() * 0.35,
    value:() => (S.games && S.games.bossesDefeated) || 0 },
  { id:"bestiary", icon:"📖", name:"Monster Hunter", category:"Arcade",
    desc:t => `Defeat ${t} different deck ${plural(t, "boss", "bosses")}`,
    top:() => Math.min(vocabDeckCount(), journeyDays() * 0.1),
    value:() => Object.values((S.games && S.games.bestiary) || {}).filter(r => r && r.wins).length },
  { id:"world_breaker", icon:"🌋", name:"World Breaker", category:"Arcade",
    desc:t => `Defeat ${t} weekly world ${plural(t, "boss", "bosses")}`,
    top:() => journeyWeeks() * 0.75,
    value:() => (S.games && S.games.worldWins) || 0 },
  { id:"daily_challenger", icon:"📆", name:"Daily Challenger", category:"Arcade",
    desc:t => `Complete ${t} daily ${plural(t, "challenge", "challenges")}`,
    top:() => journeyDays() * 0.5,
    value:() => (S.games && S.games.daily && S.games.daily.completedDates.length) || 0 },
  { id:"gender_collector", icon:"🎭", name:"Gender Collector", category:"Arcade",
    desc:t => `Collect the gender of ${t.toLocaleString()} nouns`,
    top:() => vocabNounCount() * 0.85,
    value:() => (S.games && S.games.collect && S.games.collect.g) || 0 },
  { id:"gender_runs", icon:"🎨", name:"Gender Guru", category:"Arcade",
    desc:t => `Get ${GENDER_RUN} genders right in a row, ${t} ${plural(t, "time", "times")}`,
    top:() => journeyDays() * 0.15,
    value:() => (S.games && S.games.genderRuns) || 0 },
];

// Paced ladders work their tiers out when first needed (games, grammar
// and quests load after this file) and again whenever the top moves —
// a new finish date re-paces every habit ladder.
ACHIEVEMENTS.forEach(a => {
  if (!a.top) return;
  let key = null, memo = null;
  Object.defineProperty(a, "tiers", { get() {
    const top = Math.round(a.top()) || 0;
    if (top !== key) { key = top; memo = tiersTo(top, a.curve, a.exact); }
    return memo;
  } });
});

// One "Conquered" ladder (single level) per vocab level (A1, A2, B1),
// generated from the app's configured groups — new decks get theirs
// automatically. Conquered = every word in it 🌳 Known. Anki groups
// have none.
vocabGroupsOnly().forEach(group => {
  const total = group.decks.reduce((s, d) => s + d.words.length, 0);
  ACHIEVEMENTS.push({
    id: `group_master_${group.id}`,
    icon: group.icon || "🏅",
    name: `${group.name} Conquered`,
    category: "Vocabulary",
    desc: () => `Get every word in ${group.name} to 🌳 Known (${total.toLocaleString()} words)`,
    tiers: [total],
    value: () => groupMasteredCount(group),
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
  { id:"hat_trick", icon:"🎩", name:"Hat Trick", desc:"Win three ⏱️ Timer rounds in one day", xp:150,
    earned:ev => (ev.type === "timer_end" || (ev.type === "game_end" && ev.game === "timer")) && ev.won && (ev.winsToday || 0) >= 3 },
  { id:"perfect_match", icon:"🃏", name:"Perfect Match", desc:"Clear a full Match Pairs round with no mistakes in under 60 seconds", xp:150,
    earned:ev => ev.type === "game_end" && ev.game === "match" && ev.size === "full" && ev.wrong === 0 && ev.seconds < 60 },
  { id:"diamond_comeback", icon:"💎", name:"Comeback", desc:"Repair a 💎 locked-in word after a slip", xp:150,
    earned:ev => ev.type === "repair_locked" },
  { id:"diamond_hands", icon:"🙌", name:"Diamond Hands", desc:"Reach 💎 Diamond rank in any game", xp:200,
    earned:ev => ev.type === "game_end" && ev.rankedUp && ev.rank === 3 },
  { id:"treasure_hunter", icon:"🗺️", name:"Treasure Hunter", desc:"Find 10 golden words", xp:150,
    earned:() => !!(S.quests && S.quests.gold >= 10) },
];

// ── COUNTING HELPERS ──────────────────────────
// Counters read S.words directly — looking must never create records.
// Words lifted by ⏭️ Skip a level (ws.sk) count for achievements only
// once they've been answered right for real (srsReview clears sk) — a
// word that was already Known (sk 3) keeps counting as Known, but its
// ⭐ from the skip isn't earned.
function skipUnearned(ws) { return !!(ws && (ws.sk === 1 || ws.sk === 2)); }
function groupMasteredCount(group) {
  let n = 0;
  group.decks.forEach(d => d.words.forEach((_, i) => { const ws = S.words[d.id + "_" + i]; if (isMastered(ws) && !skipUnearned(ws)) n++; }));
  return n;
}
// Word ladders count the vocab decks only — never Anki cards.
function forEachVocabWord(fn) {
  ALL_GROUPS.forEach(g => { if (g.type !== "anki") g.decks.forEach(d => d.words.forEach((_, i) => fn(S.words[d.id + "_" + i]))); });
}
function countLockedIn() {
  let n = 0;
  forEachVocabWord(ws => { if (ws && ws.st >= STAGE_LOCKED) n++; });
  return n;
}
// forAch: leave out words lifted by Skip a level that were never answered.
function countMastered(forAch = false) {
  let n = 0;
  const count = ws => { if (isMastered(ws) && !(forAch && skipUnearned(ws))) n++; };
  if (forAch) forEachVocabWord(count);
  else ALL_GROUPS.forEach(g => g.decks.forEach(d => d.words.forEach((_, i) => count(S.words[d.id + "_" + i]))));
  return n;
}
function countMasteryPlus() {
  let n = 0;
  forEachVocabWord(ws => { if (ws && isMasteryPlus(ws) && !ws.sk) n++; });
  return n;
}
// 🧭 Explorer counts words met on the Path (stage 1 or more), minus the
// ones Skip a level lifted without you ever meeting them (sk 2).
function countMet() {
  let n = 0;
  forEachVocabWord(ws => { if (ws && (ws.st > 0 || ws.mastered) && ws.sk !== 2) n++; });
  return n;
}
// Longest run of the 🔥 streak (quest days, kept and frozen days).
function maxStreak() {
  const dates = typeof questStreakDays === "function" && S.quests ? [...questStreakDays()].sort() : [];
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
// The paced ladders start from a clean slate (S.ach): once, every
// ladder is set to the levels its new tiers already meet — quietly, no
// XP (it was paid by the old system). Old levels in S.achLevels stay
// unread. S.ach syncs as a "higher wins" map, so this runs once.
function migrateAch() {
  if (S.ach && typeof S.ach === "object") return;
  S.ach = {};
  ACHIEVEMENTS.forEach(a => {
    let v = 0;
    try { v = a.value(); } catch (e) { return; }
    const lvl = a.tiers.filter(t => v >= t).length;
    if (lvl) S.ach[a.id] = lvl;
  });
}
let _checkingAchievements = false; // addExp can re-enter via level-up

function checkAchievements(ev = {}) {
  if (_checkingAchievements) return;
  _checkingAchievements = true;
  try {
    migrateAch();
    const unlocked = [];
    let xpGain = 0;

    ACHIEVEMENTS.forEach(a => {
      const cur = S.ach[a.id] || 0;
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
        S.ach[a.id] = lvl;
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
    // A Today session reports badges apart from the XP its answers earned.
    if (typeof pathSession !== "undefined" && pathSession) {
      pathSession.badgeXp = (pathSession.badgeXp || 0) + xpGain;
      pathSession.badges = (pathSession.badges || 0) + unlocked.length;
    }
    // A big batch (e.g. new ladders catching up): two toasts, then one sum-up.
    const shown = unlocked.length > 3
      ? [unlocked[0], unlocked[1], { icon: "🏅", name: `+${unlocked.length - 2} more achievements`, sub: "See them all in 🏆 Achievements" }]
      : unlocked;
    shown.forEach((u, i) => setTimeout(() => {
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
  migrateAch();
  const totalLevels  = ACHIEVEMENTS.reduce((s, a) => s + a.tiers.length, 0) + SECRET_ACHIEVEMENTS.length;
  const earnedLevels = ACHIEVEMENTS.reduce((s, a) => s + (S.ach[a.id] || 0), 0)
    + SECRET_ACHIEVEMENTS.filter(s => S.badges.includes(s.id)).length;
  const categories = [...new Set(ACHIEVEMENTS.map(a => a.category))];

  const sections = categories.map(cat => {
    const cards = ACHIEVEMENTS.filter(a => a.category === cat).map(a => {
      const lvl   = S.ach[a.id] || 0;
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
      ${backBtnHtml()}
    </div>
    <div class="badge-pace">🏔️ Every ladder is paced to max out at B1 — ${fmtShortDate(journeyEnd())}${S.path && S.path.deadline ? " (your finish date)" : " (about 9 months in; set a finish date in 🎯 Study plan to pace them to it)"}. 💎 Locked In and 🧗 Climber end with your last 💎, a few weeks of reviews after that.</div>
    ${sections}
    <div class="badge-category">
      <div class="stats-section-title">Secret</div>
      <div class="badges-grid">${secretCards}</div>
    </div>
  </div>`;
}
