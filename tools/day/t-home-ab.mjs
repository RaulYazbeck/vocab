// At home nothing changes: 12 days in Zurich (a fixed clock, seeded
// randomness, study most days, some skipped), and the state at the end —
// everything but the study day's own record — written to OUT. Run it on
// two checkouts and compare the files:
//   OUT=/tmp/new.json node t-home-ab.mjs   (and on the other checkout)
import fs from "node:fs";
import path from "node:path";
import { createRequire } from "node:module";
import { fileURLToPath } from "node:url";
import { serveRepo } from "./serve.mjs";
const here = path.dirname(fileURLToPath(import.meta.url));
const require = createRequire(path.join(here, "../audio/tests/package.json"));
const { chromium } = require("playwright-core");
const PORT = +(process.env.PORT || 8782), TZ = process.env.TZ_ID || "Europe/Zurich";
const server = await serveRepo(PORT);
const root = process.env.PLAYWRIGHT_BROWSERS_PATH || "/opt/pw-browsers";
const exe = fs.readdirSync(root).filter(d => d.startsWith("chromium-")).sort().reverse().map(d => path.join(root, d, "chrome-linux", "chrome")).find(p => fs.existsSync(p));
const browser = await chromium.launch({ executablePath: exe, args: ["--no-sandbox"] });
const ctx = await browser.newContext({ timezoneId: TZ, viewport: { width: 1200, height: 900 } });
const page = await ctx.newPage();
const errors = [];
page.on("pageerror", e => errors.push(String(e)));
await page.route(/gstatic\.com|googleapis\.com|firebaseio|google\.com/, r => r.abort());
await page.addInitScript(() => {
  window.CX_TEST_OFF = true;
  let a = 12345; Math.random = () => { a = (a + 0x6D2B79F5) >>> 0; let t = a; t = Math.imul(t ^ (t >>> 15), t | 1); t ^= t + Math.imul(t ^ (t >>> 7), t | 61); return ((t ^ (t >>> 14)) >>> 0) / 4294967296; };
});
let t = Date.parse("2026-11-20T07:00:00Z");
await page.clock.setFixedTime(t);
await page.goto(`http://127.0.0.1:${PORT}/de/index.html`);
await page.waitForFunction(() => typeof S !== "undefined" && typeof ALL_GROUPS !== "undefined");
const src = fs.readFileSync(path.join(here, "../verb-track/profile.js"), "utf8");
await page.evaluate(src => { eval(src + "\nwindow.vxTestProfile = vxTestProfile;"); const st = window.vxTestProfile(); st.lvCurve = 2;
  st.quests = { qdays: ["2026-11-18", "2026-11-19"], kept: [], frozen: [], freezes: 2, list: [], day: "" };
  localStorage.setItem(APP_CONFIG.storageKey, JSON.stringify(st)); localStorage.setItem(AUDIO_PREF, JSON.stringify({ asked: true, want: [] })); }, src);
const reload = async () => { await page.reload(); await page.waitForFunction(() => typeof S !== "undefined" && S.words && Object.keys(S.words).length > 500); await page.waitForTimeout(100); };
await reload();
const trail = [];
for (let day = 0; day < 12; day++) {
  for (const [h, n] of [[7, 30], [13, 15], [21, 40], [26, 5]]) { // 08:00, 14:00, 22:00, 03:00 next night (local, CET)
    await page.clock.setFixedTime(t + day * 864e5 + (h - 7) * 3600e3);
    if (day % 5 === 3) continue; // a skipped day
    if (h === 13 && day % 3 === 0) await reload();
    await page.evaluate(n => {
      window.showCelebrateToast = () => {}; window.confettiBurst = () => {};
      questEnsureToday();
      const keys = Object.keys(S.words).filter(k => S.words[k].st > 0 && !k.startsWith("vx")).sort();
      for (let i = 0; i < n; i++) {
        const key = keys[Math.floor(Math.random() * keys.length)], j = key.lastIndexOf("_");
        const w = { deckId: key.slice(0, j), idx: +key.slice(j + 1) }, ws = S.words[key], right = Math.random() < 0.85;
        if (right) applyCorrect(ws, { w, quiet: true }); else applyWrong(ws, { w });
        logEvent("answer", { m: "drill", ok: right });
        questEvent("answer", { w, ok: right, mode: "drill", typed: true });
        if (right) checkDrillMilestone();
      }
      saveLocalOnly();
    }, n);
    trail.push(await page.evaluate(() => [todayISO(), S.quests.day, S.quests.m.ok, questStreak(), S.quests.freezes, studyDayStart(0), studyDayStart(1)]));
  }
}
const out = await page.evaluate(() => {
  const s = JSON.parse(localStorage.getItem(STORAGE_KEY));
  delete s.dayClock; delete s.savedAt;
  return s;
});
fs.writeFileSync(process.env.OUT || "/tmp/home-ab.json", JSON.stringify({ trail, state: out, errors }, null, 1));
console.log(`home A/B: ${trail.length} checkpoints written, ${errors.length} page errors`);
await browser.close(); server.close();
