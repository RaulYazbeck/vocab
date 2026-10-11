// A French test profile: A1 done (every A1 card met), stages spread
// like the German profile, a finish date.
// Runs in the page (needs ALL_GROUPS).
function vxTestProfile(seed = 11) {
  let a = seed >>> 0;
  const rnd = () => { a = (a + 0x6D2B79F5) >>> 0; let t = a; t = Math.imul(t ^ (t >>> 15), t | 1); t ^= t + Math.imul(t ^ (t >>> 7), t | 61); return ((t ^ (t >>> 14)) >>> 0) / 4294967296; };
  const now = Date.now(), day = 864e5;
  const iso = d => new Date(now - d * day - 4 * 3600e3).toLocaleDateString("en-CA");
  const words = {};
  const groups = ALL_GROUPS.filter(g => g.type !== "anki");
  const pick = () => { const r = rnd(); return r < 0.06 ? 1 + Math.floor(rnd() * 2) : r < 0.3 ? 3 + Math.floor(rnd() * 2) : r < 0.55 ? 5 : 6; };
  const put = (d, idx, metAgo) => {
    const st = pick(), gap = [0, 1, 2, 4, 7, 14, 30][st], dueIn = Math.round((rnd() * 1.3 - 0.35) * gap);
    words[d.id + "_" + idx] = { correct: 3 + st, wrong: Math.floor(rnd() * 3), streak: 2, displayStreak: 2, lastAnsweredAt: now - Math.max(1, gap - dueIn) * day,
      anki: { phase: "new", stepIndex: 0, interval: 0, ease: 2.5, due: null, lapses: 0, leech: false, introducedOn: null },
      st, pk: st, sAt: now - Math.max(1, gap - dueIn) * day, dueAt: now + dueIn * day, metOn: iso(metAgo), k: 1, ...(st >= 5 ? { mastered: true } : {}) };
  };
  groups[0].decks.forEach(d => d.words.forEach((w, idx) => { put(d, idx, 20 - Math.floor(idx / d.words.length * 19)); }));
  const unlocked = {};
  groups.forEach(g => g.decks.forEach(d => { let n = 0; d.words.forEach((_, k) => { if (words[d.id + "_" + k]) n = k + 1; }); if (n) unlocked[d.id] = n; }));
  return {
    words, exp: 30000, badges: [], unlocked, loginDates: Array.from({ length: 14 }, (_, k) => iso(13 - k)), totalCorrect: 1800, lastLoginDate: iso(0), savedAt: now,
    path: { newPerDay: 10, deadline: "2027-08-15", sessionLen: "regular", lastActiveDay: iso(1), welcomed: true, migrated: { done: true }, skipFixed: true },
  };
}
