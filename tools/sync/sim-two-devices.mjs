// Two devices running the real app (Chromium) against one in-memory
// Firestore. Both start in sync; the web then studies for two days (every
// due word, the days kept — not all quests); the phone, whose copy is now
// days old, opens today. Each scenario checks nothing is lost.
//
//   plain    the phone opens and syncs
//   tap      a slow network: Long is tapped while it's still syncing
//   timeout  the phone's first cloud read hangs (iOS resume), Long tapped
//   offline  the phone can't read the cloud, you study on it, then it can
//   repair   the state 2026-10-11's sync left behind (kept days gone, a
//            plan made from the phone's old words): put right on open
//   outdated the cloud was saved by newer sync rules than the phone runs:
//            it reloads once, then writes nothing
// Every scenario also checks the web's other changes (a setting, the
// daily goal, game data) survive the phone's old copy.
//
// Serve the repo root (python3 -m http.server 8765), run `npm install`
// once in ../audio/tests (playwright-core), then: node sim-two-devices.mjs [scenario…]
import fs from "node:fs";
import path from "node:path";
import { createRequire } from "node:module";
import { fileURLToPath } from "node:url";
const here = path.dirname(fileURLToPath(import.meta.url));
const require = createRequire(path.join(here, "../audio/tests/package.json"));
const { chromium } = require("playwright-core");
const BASE = process.env.BASE || "http://localhost:8765";
const SCENARIOS = process.argv.slice(2).length ? process.argv.slice(2) : ["plain", "tap", "timeout", "offline", "repair", "outdated"];
const DAY = 864e5;
function chrome() {
  const root = process.env.PLAYWRIGHT_BROWSERS_PATH || "/opt/pw-browsers";
  for (const d of fs.readdirSync(root).filter(d => d.startsWith("chromium-")).sort().reverse()) {
    const p = path.join(root, d, "chrome-linux", "chrome");
    if (fs.existsSync(p)) return p;
  }
}
// The Firebase SDK, faked: one signed-in user, Firestore reads and batch
// writes go to the test (window.__fs), which can slow them or hang them.
const STUB = `(function(){
  const user = { uid: "u1", displayName: "Test", getIdToken: async () => "t" };
  const auth = { currentUser: user, onAuthStateChanged(cb){ setTimeout(() => cb(user), 30); }, signOut(){}, signInWithPopup(){} };
  const snapOf = (id, d) => ({ id, exists: d != null, data: () => d == null ? undefined : JSON.parse(JSON.stringify(d)) });
  const apps = {
    doc: id => ({ id, get: async () => snapOf(id, await window.__fs("get", id)) }),
    get: async () => { const all = await window.__fs("all"); return { forEach(fn){ Object.entries(all).forEach(([id, d]) => fn(snapOf(id, d))); } }; },
  };
  const db = { collection: () => ({ doc: () => ({ collection: () => apps }) }),
    batch(){ const ops = []; return { set(ref, data){ ops.push([ref.id, JSON.parse(JSON.stringify(data))]); }, commit: () => window.__fs("commit", ops) }; } };
  window.firebase = { initializeApp(){}, firestore: () => db, auth: () => auth };
  window.firebase.auth.GoogleAuthProvider = function(){};
})();`;

let pass = 0, fail = 0;
const ok = (c, m, x = "") => { if (c) { pass++; console.log("  ✓", m); } else { fail++; console.log("  ✗", m, x); } };
const browser = await chromium.launch({ executablePath: chrome(), args: ["--no-sandbox"] });
const profileSrc = fs.readFileSync(path.join(here, "../verb-track/profile.js"), "utf8");
const today10 = new Date(new Date().toDateString()).getTime() + 10 * 3600e3;

async function device(cloud, name) {
  const ctx = await browser.newContext({ viewport: { width: 390, height: 844 } });
  const dev = { name, ctx, page: null, delay: 0, failReads: false, hang: 0 };
  await ctx.exposeFunction("__fs", async (op, arg) => {
    if (op !== "commit") {
      if (dev.hang > 0) { dev.hang--; await new Promise(() => {}); }
      if (dev.failReads) throw new Error("offline");
    }
    if (dev.delay) await new Promise(r => setTimeout(r, dev.delay));
    if (op === "get") return cloud[arg] ? JSON.parse(cloud[arg]) : null;
    if (op === "all") return Object.fromEntries(Object.entries(cloud).map(([k, v]) => [k, JSON.parse(v)]));
    if (op === "commit") { arg.forEach(([id, d]) => { cloud[id] = JSON.stringify(d); }); return true; }
  });
  await ctx.route(/gstatic\.com|googleapis\.com/, r => r.abort());
  await ctx.route(/firebase-app-compat/, r => r.fulfill({ contentType: "text/javascript", body: STUB }));
  return dev;
}
// Opens the app at time t. seed: run once on the origin first (localStorage);
// during: right after the page starts, before the first load finishes.
async function open(dev, t, { seed, during, waitLoad = true } = {}) {
  if (dev.page) await dev.page.close({ runBeforeUnload: true });
  const page = await dev.ctx.newPage();
  await page.clock.install({ time: t });
  await page.clock.resume();
  page.on("pageerror", e => { fail++; console.log(`  ✗ [${dev.name}] page error`, String(e).slice(0, 200)); });
  await page.goto(BASE + "/de/index.html");
  if (seed) { await page.evaluate(seed); await page.goto(BASE + "/de/index.html"); }
  if (during) await during(page);
  if (waitLoad) await page.waitForFunction(() => initialLoadComplete && !loadInFlight, null, { timeout: 60000 });
  await page.waitForTimeout(300);
  dev.page = page;
  return page;
}
const settle = p => p.evaluate(async () => {
  if (initialLoadComplete) await commitToFirestore();
  while (commitInFlight || loadInFlight || syncTimeout) await new Promise(r => setTimeout(r, 100));
});
const snap = p => p.evaluate(() => {
  const now = Date.now(); let due = 0, known = 0;
  Object.values(S.words).forEach(ws => { if (!ws.st || ws.sk || ws.rt) return; if (ws.st >= STAGE_KNOWN) known++; if (isDue(ws, now)) due++; });
  const plan = pathEnsurePlan();
  return { exp: S.exp, totalCorrect: S.totalCorrect, streak: getDailyStreak(), kept: S.quests.kept.slice(), qday: S.quests.day, qok: S.quests.m.ok,
    known, due, plan: plan && { day: plan.day, reviews: plan.reviews, leave: plan.leave, target: plan.target }, sessionLen: S.path.sessionLen,
    other: { goal: S.dailyGoal, grandma: S.prefs.grandma, lastGame: S.games.lastGameId } };
});
// A day of study: every due word right in a Today session; the day kept.
const study = (p, limit = 1e9) => p.evaluate(async limit => {
  const now = Date.now(); let n = 0;
  for (const ws of Object.values(S.words)) {
    if (n >= limit) break;
    if (!ws.st || ws.sk || ws.rt || !isDue(ws, now)) continue;
    applyCorrect(ws, { quiet: true }); n++;
  }
  S.quests.m.ok = (S.quests.m.ok || 0) + n;
  logEvent("session_end", { kind: "path", n, ms: 600000 });
  questMarkKept();
  await new Promise(r => setTimeout(r, 50)); // the day's usage snapshot runs on a timer
  saveState();
  return n;
}, limit);
const tapLong = async pg => {
  await pg.waitForFunction(() => typeof setSessionLen === "function");
  await pg.waitForTimeout(500);
  await pg.evaluate(() => setSessionLen("long"));
};

// Day −2: web + phone in sync. Days −2 and −1: the web studies. Returns
// the web's state before the phone opens and the two devices.
async function setup() {
  const cloud = {};
  const web = await device(cloud, "web"), phone = await device(cloud, "phone");
  const T0 = today10 - 2 * DAY;
  await open(web, T0, { seed: new Function(`${profileSrc}; const st = vxTestProfile(); st.lvCurve = 2;
    localStorage.setItem(APP_CONFIG.storageKey, JSON.stringify(st)); localStorage.setItem(AUDIO_PREF, JSON.stringify({ asked: true, want: [] }));`) });
  await settle(web.page);
  await open(phone, T0 + 3600e3, { seed: () => localStorage.setItem(AUDIO_PREF, JSON.stringify({ asked: true, want: [] })) });
  await settle(phone.page);
  await phone.page.close(); phone.page = null;
  for (const d of [2, 1]) {
    await open(web, today10 - d * DAY + 7200e3);
    await study(web.page);
    // and, on the web only: a setting, the daily goal, game data
    if (d === 1) await web.page.evaluate(() => { S.dailyGoal = 150; S.prefs.grandma = !S.prefs.grandma; S.games.lastGameId = "web-was-here"; saveState(); });
    await settle(web.page);
  }
  const before = await snap(web.page);
  await web.page.close(); web.page = null;
  return { cloud, web, phone, before };
}
// What a plain sync gives today (the reference for the other scenarios).
let reference = null;
async function checkBoth(name, s, extra = () => {}) {
  await settle(s.phone.page);
  const ph = await snap(s.phone.page);
  await s.phone.page.close(); s.phone.page = null;
  await open(s.web, today10 + 600e3); await settle(s.web.page);
  const wb = await snap(s.web.page);
  for (const [who, x] of [["phone", ph], ["web", wb]]) {
    ok(x.streak === s.before.streak && x.streak >= 2, `${name}: ${who} keeps the streak (${x.streak})`, JSON.stringify(x.kept));
    ok(x.known >= s.before.known, `${name}: ${who} keeps every Known word (${x.known})`, `before ${s.before.known}`);
    ok(x.exp >= s.before.exp, `${name}: ${who} keeps the XP`, `${x.exp} < ${s.before.exp}`);
    ok(JSON.stringify(x.other) === JSON.stringify(s.before.other), `${name}: ${who} keeps the web's settings and game data`, JSON.stringify(x.other));
    if (reference) ok(x.plan.leave === reference.plan.leave && x.plan.reviews >= reference.plan.reviews, `${name}: ${who}'s plan made from the real words (${x.plan.reviews} reviews, ${x.plan.leave} left for later)`, JSON.stringify(reference.plan));
  }
  extra(ph, wb);
  await s.web.ctx.close(); await s.phone.ctx.close();
  return wb;
}

for (const sc of SCENARIOS) {
  console.log(`\n== ${sc}`);
  const s = await setup();
  if (sc === "plain") {
    await open(s.phone, today10);
    reference = await checkBoth(sc, s);
  } else if (sc === "tap") {
    s.phone.delay = 4000; // every cloud call takes 4 s
    await open(s.phone, today10, { during: async pg => { await tapLong(pg); ok(!(await pg.evaluate(() => initialLoadComplete)), "tap: Long tapped before the sync finished"); } });
    s.phone.delay = 0;
    await checkBoth(sc, s, (ph, wb) => ok(ph.sessionLen === "long" && wb.sessionLen === "long", "tap: the tap on Long is kept"));
  } else if (sc === "timeout") {
    s.phone.hang = 1;
    await open(s.phone, today10, { waitLoad: false, during: async pg => {
      await tapLong(pg);
      await pg.waitForTimeout(26000); // past the 20 s read timeout and the old 5 s unblock
      const cloudSaved = JSON.parse(s.cloud.gv5_de).savedAt;
      ok(cloudSaved < today10, "timeout: nothing written over the cloud before it was read", String(cloudSaved));
    } });
    await s.phone.page.waitForFunction(() => initialLoadComplete && !loadInFlight, null, { timeout: 60000 }); // the retry gets through
    await checkBoth(sc, s, (ph, wb) => ok(wb.sessionLen === "long", "timeout: the tap reaches the web after the retry"));
  } else if (sc === "offline") {
    s.phone.failReads = true;
    await open(s.phone, today10, { waitLoad: false, during: pg => pg.waitForFunction(() => typeof study !== "undefined" || typeof applyCorrect === "function") });
    await s.phone.page.waitForTimeout(1500);
    const n = await study(s.phone.page, 25);
    ok(n === 25, "offline: 25 answers on the phone");
    s.phone.failReads = false;
    await s.phone.page.evaluate(() => resumeSync(true));
    await s.phone.page.waitForFunction(() => initialLoadComplete && !loadInFlight, null, { timeout: 60000 });
    await checkBoth(sc, s, (ph, wb) => {
      ok(ph.qday === wb.qday && wb.qok >= 25, `offline: today's answers count on both (${wb.qok})`);
      ok(wb.totalCorrect >= s.before.totalCorrect + 25, "offline: total right answers add up", `${wb.totalCorrect} vs ${s.before.totalCorrect}`);
    });
  } else if (sc === "repair") {
    // The web as 2026-10-11's sync left it: kept days cut back, today's
    // plan made from the phone's old words (a big backlog, v4).
    await open(s.web, today10 + 60e3);
    await s.web.page.evaluate(() => {
      S.quests.kept = S.quests.kept.slice(0, 1);
      const p = pathEnsurePlan();
      Object.assign(p, { v: 4, reviews: 40, leave: 150, target: 60, goal: 60 });
      saveLocalOnly();
    });
    const broken = await snap(s.web.page);
    ok(broken.streak < s.before.streak, `repair: streak broken first (${broken.streak})`);
    await open(s.web, today10 + 120e3);
    const fixed = await snap(s.web.page);
    ok(fixed.streak === s.before.streak, `repair: streak back on open (${fixed.streak})`, JSON.stringify(fixed.kept));
    ok(fixed.plan.leave === 0 && fixed.plan.reviews > 40, `repair: today's plan made again (${fixed.plan.reviews} reviews, ${fixed.plan.leave} left)`, JSON.stringify(fixed.plan));
    // without this device's event log: from the synced day history alone
    const alone = await s.web.page.evaluate(() => {
      localStorage.removeItem(USAGE_LOG_KEY); _usageBuf = null;
      S.quests.kept = S.quests.kept.slice(0, 1); _questDaysFor = null;
      questRestoreDays();
      return getDailyStreak();
    });
    ok(alone === s.before.streak, `repair: from the synced day history alone (${alone})`);
    await s.web.ctx.close(); await s.phone.ctx.close();
  } else if (sc === "outdated") {
    // newer sync rules saved the cloud
    const meta = JSON.parse(s.cloud.gv5_de); meta._p = 99; s.cloud.gv5_de = JSON.stringify(meta);
    const before = s.cloud.gv5_de;
    let navs = 0;
    const pg = await s.phone.ctx.newPage();
    pg.on("framenavigated", f => { if (f === pg.mainFrame()) navs++; });
    await pg.clock.install({ time: today10 }); await pg.clock.resume();
    await pg.goto(BASE + "/de/index.html");
    await pg.waitForTimeout(4000);
    await pg.evaluate(() => { setSessionLen("long"); });
    await pg.waitForTimeout(4000);
    ok(navs === 2, `outdated: reloaded once for the new code, no loop (${navs} loads)`);
    ok(s.cloud.gv5_de === before, "outdated: nothing written over the newer cloud");
    ok(/reopen/.test(await pg.evaluate(() => document.getElementById("sync-status").textContent)), "outdated: tells you to reopen the app");
    await s.web.ctx.close(); await s.phone.ctx.close();
  }
}
await browser.close();
console.log(`\nsync sim: ${pass} passed, ${fail} failed`);
process.exit(fail ? 1 : 0);
