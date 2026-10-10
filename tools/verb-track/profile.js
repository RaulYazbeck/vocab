// A test profile shaped like the real one (usage report of 2026-10-10):
// A1 done (1,001 words) + 13 A2 words met, tiers ≈ Learning 52 ·
// Familiar 236 · Known 203 · Strong 523, ~110 overdue, finish date
// 15 Aug 2027. Runs in the page (needs ALL_GROUPS).
function vxTestProfile(seed = 7) {
  let a = seed >>> 0;
  const rnd = () => { a = (a + 0x6D2B79F5) >>> 0; let t = a; t = Math.imul(t ^ (t >>> 15), t | 1); t ^= t + Math.imul(t ^ (t >>> 7), t | 61); return ((t ^ (t >>> 14)) >>> 0) / 4294967296; };
  const now = Date.now(), day = 864e5;
  const iso = d => new Date(now - d * day - 4 * 3600e3).toLocaleDateString("en-CA");
  const words = {};
  const groups = ALL_GROUPS.filter(g => g.type !== "anki");
  const a1 = groups[0], a2 = groups[1];
  const pick = () => { const r = rnd() * 1014; return r < 52 ? 1 + Math.floor(rnd() * 2) : r < 288 ? 3 + Math.floor(rnd() * 2) : r < 491 ? 5 : 6; };
  let i = 0;
  const put = (d, idx, metAgo) => {
    const st = pick();
    const gap = [0, 1, 2, 4, 7, 14, 30][st];
    const dueIn = Math.round((rnd() * 1.3 - 0.35) * gap); // some overdue
    words[d.id + "_" + idx] = { correct: 3 + st, wrong: Math.floor(rnd() * 3), streak: 2, displayStreak: 2, lastAnsweredAt: now - Math.max(1, gap - dueIn) * day,
      anki: { phase: "new", stepIndex: 0, interval: 0, ease: 2.5, due: null, lapses: 0, leech: false, introducedOn: null },
      st, pk: st, sAt: now - Math.max(1, gap - dueIn) * day, dueAt: now + dueIn * day, metOn: iso(metAgo), k: 1, ...(st >= 5 ? { mastered: true } : {}) };
    i++;
  };
  a1.decks.forEach(d => d.words.forEach((w, idx) => put(d, idx, 14 - Math.floor(idx / d.words.length * 13))));
  // 13 A2 words met in the last days, from the topic decks
  ["a2_expressions", "a2_people", "a2_work"].forEach(id => { const d = a2.decks.find(x => x.id === id); for (let k = 0; k < 4 + (id === "a2_work" ? 1 : 0); k++) put(d, k, 1); });
  const unlocked = {};
  groups.forEach(g => g.decks.forEach(d => { let n = 0; d.words.forEach((_, k) => { if (words[d.id + "_" + k]) n = k + 1; }); if (n) unlocked[d.id] = n; }));
  const learnVerbs = {};
  ["fahren", "gehen", "haben", "sein", "machen", "kommen", "lesen", "spielen", "wohnen", "arbeiten"].forEach(v => { learnVerbs[v] = { t: { pr: [4, 1], pf: [2, 1] }, pe: {}, mx: {}, mh: [] }; });
  return {
    words, exp: 52000, badges: [], unlocked, loginDates: Array.from({ length: 14 }, (_, k) => iso(13 - k)), totalCorrect: 2600, lastLoginDate: iso(0), savedAt: now,
    path: { newPerDay: 10, deadline: "2027-08-15", sessionLen: "regular", lastActiveDay: iso(1), welcomed: true, migrated: { done: true }, skipFixed: true },
    learn: { verbs: learnVerbs, since: iso(13) },
    games: { vf: { fahren: { l: "2200000", d: iso(2), b: 0 } } },
  };
}
