// Usage and learning logs: edge cases in the real app (no Google, no cloud —
// Firebase is stubbed). Two days in the old format, as a real report had them.
import { launch, BASE, counter } from "./common.mjs";
const DAYS = {"2026-09-27": {"bonus": [0, 5], "lat": [564598, 112], "voice": 0, "ev": {"flash": 1, "lucky+": 4}, "twist": [0, 2], "ses": {"path": [8, 7, 1]}, "min": 41, "hint": 0, "hr": [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 72, 0, 29, 48, 0, 0], "q": [5, 1, 0, 1], "gp": {"gender": [2, 2, 0], "boss": [11, 1, 9]}, "drag": [4, 17], "open": 1, "ans": {"path:choice": [30, 29, 0], "path:typed": [111, 92, 0]}, "near": 0}, "2026-10-01": {"hr": [12, 0, 0, 0, 20, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 128, 113, 62], "gp": {"rain": [9, 9, 0]}, "drag": [0, 0], "hint": 3, "near": 3, "open": 0, "lat": [2468686, 290], "bonus": [0, 18], "ev": {"lucky+": 6}, "voice": 0, "ans": {"path:typed": [179, 141, 0], "path:cloze": [121, 101, 0]}, "min": 103.5, "ses": {"path": [5, 6, 0]}, "twist": [0, 0], "q": [2, 1, 0, 0]}};
const c = counter();
const browser = await launch();
const ctx = await browser.newContext({ viewport: { width: 420, height: 800 }, serviceWorkers: "block" });
const page = await ctx.newPage();
await page.route(/gstatic\.com/, r => r.abort());
await page.addInitScript(() => {
  const fake = { collection: (...a) => window.__fakeDb.collection(...a) };
  window.firebase = { initializeApp() {}, firestore: () => fake,
    auth: () => ({ onAuthStateChanged() {}, signOut() {}, signInWithPopup: async () => {}, currentUser: null }) };
  window.firebase.auth.GoogleAuthProvider = function () {};
});
const errs = []; page.on("pageerror", e => errs.push(e.message)); page.on("console", m => { if (m.type() === "error") errs.push("console: " + m.text()); });
await page.goto(`${BASE}/de/index.html`);
await page.waitForFunction(() => typeof S !== "undefined" && typeof learnNoteMiss === "function" && typeof GAMES !== "undefined");
await page.waitForTimeout(800);

// ── 0. empty state: both reports build
let r = await page.evaluate(() => { try { return { u: buildUsageReport(0).length, l: buildLearningReport().length }; } catch (e) { return { err: String(e) }; } });
c.ok(!r.err && r.u > 100 && r.l > 100, "empty state: both reports build", JSON.stringify(r));

// ── 1. usage edge cases
r = await page.evaluate((DAYS) => {
  const out = {};
  Object.assign(S.usage.days, JSON.parse(JSON.stringify(DAYS)));
  const y = addDays(todayISO(), -1);
  const all = ALL_GROUPS.flatMap(g => g.decks.flatMap(d => d.words.map((w, i) => ({ ...w, deckId: d.id, deckName: d.name, idx: i }))));
  const pool = all.filter(w => nounParts(w)).slice(0, 150);
  pool.forEach(w => { const ws = getWS(w.deckId, w.idx); ws.st = 3; ws.metOn = addDays(todayISO(), -3); });
  window.__pool = pool; window.__all = all;
  // a game launched yesterday, left today from the Menu → yesterday's count
  launchGame("gender", { pool, size: "short" });
  activeGame.ctx.launchDay = y;
  backToMenu();
  out.yGp = (S.usage.days[y] || {}).gp;
  // a path session started yesterday, finished today
  startPathSession("quick");
  pathSession.startedAt = Date.now() - 864e5;
  endPathSession(false);
  out.ySes = (S.usage.days[y] || {}).ses;
  // a finished Daily run must not ALSO count as abandoned when leaving
  startGameRun("daily", ["gender"], { pool });
  gameRun.i = 0;
  try { gameRunRoundDone({ def: getGame("gender"), result: { correct: 2, wrong: 0, missed: [] }, xp: 0, size: "short" }); } catch (e) { out.runErr = String(e); }
  openGamesHub();
  // an Arcade Mix left in the middle via the game's Quit button
  startGameRun("mix", ["gender", "match"], { pool });
  quitGame();
  out.ses = usageDay().ses;
  out.rep = buildUsageReport(0).split("--- JSON")[0];
  return out;
}, DAYS);
c.ok(r.yGp && r.yGp.gender && r.yGp.gender[2] === 1, "game left a day later counts on the day it started", JSON.stringify(r.yGp));
c.ok(r.ySes && r.ySes.path && r.ySes.path[1] === 1, "path session finished a day later counts on its start day", JSON.stringify(r.ySes));
c.ok(r.ses["games:daily"] && r.ses["games:daily"].join() === "1,1,0", "finished Daily: 1/1/0 (not also abandoned)", JSON.stringify(r.ses) + (r.runErr || ""));
c.ok(r.ses["games:mix"] && r.ses["games:mix"].join() === "1,0,1", "Mix quit mid-way: 1/0/1", JSON.stringify(r.ses));
c.ok(/2026-09-27 · 41 ·/.test(r.rep) && /2026-10-01 · 104 ·/.test(r.rep), "old-format days show in the per-day lines", r.rep.split("\n").filter(l => /^2026/.test(l)).join(" | "));

// ── 2. sync round trip with a fake cloud
r = await page.evaluate(async () => {
  const out = {};
  const old = addDays(todayISO(), -200), localOnly = addDays(todayISO(), -2);
  S.usageArchive = { [old.slice(0, 4)]: { [old]: { min: 5, ans: {}, lat: [0, 0], hr: [], q: [0, 0, 0, 0], ev: {}, gp: {}, ses: {}, drag: [0, 0], bonus: [0, 0], twist: [0, 0] } } };
  S.usage.days[localOnly] = { min: 7, ans: {}, lat: [0, 0], hr: [], q: [0, 0, 0, 0], ev: {}, gp: {}, ses: {}, drag: [0, 0], bonus: [0, 0], twist: [0, 0] };
  migrateLearn(); S.learn.verbs.gehen = { t: { pr: [1, 1] }, pe: {}, mx: {}, mh: [] };
  const docs = buildSyncDocs();
  out.ids = Object.keys(docs).filter(k => /_usage_|_learn/.test(k));
  out.metaClean = !("usageArchive" in docs[STORAGE_KEY]) && !("learn" in docs[STORAGE_KEY]);
  // cloud = same docs, but newer and without the local-only day / archive / learn
  const cloudMeta = JSON.parse(JSON.stringify(docs[STORAGE_KEY]));
  cloudMeta.savedAt = Date.now() + 10000; delete cloudMeta.usage.days[localOnly];
  const cloudDocs = Object.fromEntries(Object.entries(docs).filter(([k]) => !/_usage_|_learn/.test(k)).map(([k, v]) => [k, JSON.parse(JSON.stringify(v))]));
  cloudDocs[STORAGE_KEY] = cloudMeta;
  const snap = (id, data) => ({ id, exists: true, data: () => data });
  window.currentUser = { uid: "u" };
  window.__fakeDb = { collection: () => ({ doc: () => ({ collection: () => ({
    doc: id => ({ get: async () => snap(id, cloudDocs[id]) }),
    get: async () => ({ forEach: f => Object.entries(cloudDocs).forEach(([id, d]) => f(snap(id, d))) }),
  }) }) }) };
  try { currentUser = window.currentUser; } catch (e) {}
  window.confirm = () => true;
  await loadFromCloud();
  out.keptArchive = !!(S.usageArchive[old.slice(0, 4)] || {})[old];
  out.keptLocalDay = !!S.usage.days[localOnly];
  out.keptLearn = !!(S.learn && S.learn.verbs && S.learn.verbs.gehen);
  return out;
});
c.ok(r.ids.length === 2 && r.metaClean, "archive and learn docs split out of the meta doc", JSON.stringify(r.ids));
c.ok(r.keptArchive && r.keptLocalDay && r.keptLearn, "a cloud load keeps local-only history and verb data", JSON.stringify(r));

// ── 3. learning: real path grading with edge-case answers
r = await page.evaluate(() => {
  const out = {};
  const all = window.__all;
  const W = re => all.find(w => re.test(w.de));
  const cases = [
    ["gender", W(/^die Wohnung\b/), "der Wohnung", false],
    ["article", W(/^die Wohnung\b/), "Wohnung", false],
    ["plural", W(/^die Wohnung\b/), "die Wohnungen", false],
    ["blank", W(/^die Wohnung\b/), "", false],
    ["spelling", W(/^das Mädchen\b/), "das Madchn", "near"],
    ["person", all.find(w => w.deckId === "a1_conjugation" && /^sein — du/.test(w.en)), "bin", false],
    ["meaning", W(/^die Küche\b/), "Haus", false],
  ];
  out.got = {};
  startPathSession("quick");
  for (const [want, w, val, ok] of cases) {
    if (!w) { out.got[want] = "no word"; continue; }
    const ws = getWS(w.deckId, w.idx); ws.st = Math.max(ws.st || 0, 2);
    pathSession.cur = { t: "typed", w }; pathSession.answered = false; pathSession.shownAt = Date.now();
    try { pathGradeTyped(val, ok); } catch (e) { out.got[want] = "ERR " + e; continue; }
    const h = (ws.mh || [])[ws.mh.length - 1];
    out.got[want] = h ? h[2] + " / " + h[3] : "nothing";
  }
  // accepted but written without umlaut + lower-case noun → soft slips only
  const m = W(/^das Mädchen\b/), ms = getWS(m.deckId, m.idx), before = JSON.stringify(ms.mx);
  pathSession.cur = { t: "typed", w: m }; pathSession.answered = false;
  pathGradeTyped("das madchen", true);
  out.soft = ms.sf; out.mxUnchanged = JSON.stringify(ms.mx) === before;
  // the private "my typo" override removes the miss again
  const k = W(/^die Küche\b/), ks = getWS(k.deckId, k.idx);
  pathSession.cur = { t: "typed", w: k }; pathSession.answered = false; pathSession.shownAt = Date.now();
  pathGradeTyped("Kuhce", false);
  const n1 = (ks.mh || []).length;
  try { pathSecretOk(); } catch (e) { out.secretErr = String(e); }
  out.undo = [n1, (ks.mh || []).length];
  endPathSession(true);
  // anki words are ignored
  learnNoteMiss({ deckId: "x", idx: 1, anki: true, de: "x" }, { given: "y" });
  out.ankiIgnored = !S.words["x_1"];
  return out;
});
for (const [want, got] of Object.entries(r.got)) c.ok(String(got).startsWith(want + " /"), `path typed → ${want}`, got);
c.ok(r.soft && r.soft.umlaut === 1 && r.soft.capital === 1 && r.mxUnchanged, "accepted answer: umlaut + lower-case slips, no mistake", JSON.stringify(r.soft));
c.ok(r.undo[1] === r.undo[0] - 1, "'my typo' override removes the recorded miss", JSON.stringify(r.undo) + (r.secretErr || ""));
c.ok(r.ankiIgnored, "Anki cards are not logged");

// ── 4. games: a near-miss must not stick to the next question
r = await page.evaluate(() => {
  const w1 = window.__pool.find(w => gameForm(w).length >= 10), w2 = window.__pool[1];
  const f = gameForm(w1), near = f.slice(0, -4) + "x" + f.slice(-3);
  launchGame("listen", { pool: window.__pool, size: "short" });
  const g = activeGame.ctx;
  const nr = gradeTyped(near, [f]);                              // typed near-miss
  g.missed(w2);                                                  // next round: a choice miss
  const h = getWS(w2.deckId, w2.idx).mh.slice(-1)[0];
  gradeTyped("qqqq", [gameForm(w1)]); g.missed(w1);              // a typed real miss keeps what was typed
  const h1 = getWS(w1.deckId, w1.idx).mh.slice(-1)[0];
  backToMenu();
  return { choice: h, typed: h1, nr };
});
c.ok(r.choice[2] === "listening" && r.choice[3] === "", "choice miss after a typed near-miss carries no stale answer", JSON.stringify(r));
c.ok(r.typed[3] === "qqqq", "typed game miss keeps what was typed", JSON.stringify(r.typed));

const real = errs.filter(e => !/Failed to load resource/.test(e));
c.ok(!real.length, "no page/console errors (blocked Firebase aside)", real.slice(0, 5).join(" | "));
await browser.close();
process.exit(c.end());
