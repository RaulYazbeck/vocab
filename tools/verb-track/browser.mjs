// Drives the real app in Chromium: loads the test profile, and returns
// a page ready for page.evaluate(). BASE defaults to a local server.
import fs from "node:fs";
import path from "node:path";
import { createRequire } from "node:module";
import { fileURLToPath } from "node:url";
const here = path.dirname(fileURLToPath(import.meta.url));
const require = createRequire(path.join(here, "../audio/tests/package.json"));
const { chromium } = require("playwright-core");
export const BASE = process.env.BASE || "http://localhost:8765";
function chrome() {
  const root = process.env.PLAYWRIGHT_BROWSERS_PATH || "/opt/pw-browsers";
  for (const d of fs.readdirSync(root).filter(d => d.startsWith("chromium-")).sort().reverse()) {
    const p = path.join(root, d, "chrome-linux", "chrome");
    if (fs.existsSync(p)) return p;
  }
}
export async function openApp({ width = 390, height = 844, profile = true, extra = null } = {}) {
  const browser = await chromium.launch({ executablePath: chrome(), args: ["--no-sandbox"] });
  const ctx = await browser.newContext({ viewport: { width, height }, deviceScaleFactor: 2 });
  const page = await ctx.newPage();
  const errors = [];
  page.on("pageerror", e => errors.push(String(e.stack || e)));
  page.on("console", m => { if (m.type() === "error" && !/firebase|gstatic|Failed to load resource|net::ERR/i.test(m.text())) errors.push(m.text()); });
  await page.route(/gstatic\.com|googleapis\.com|firebaseio|google\.com/, r => r.abort());
  await page.goto(BASE + "/de/index.html");
  await page.waitForFunction(() => typeof S !== "undefined" && typeof ALL_GROUPS !== "undefined");
  if (profile) {
    const src = fs.readFileSync(path.join(here, "profile.js"), "utf8");
    await page.evaluate(([src, extra]) => {
      eval(src + "\nwindow.vxTestProfile = vxTestProfile;");
      const st = window.vxTestProfile();
      if (extra) Object.assign(st, extra);
      st.lvCurve = 2; // the one-time "levels follow your journey" note: already seen
      localStorage.setItem(APP_CONFIG.storageKey, JSON.stringify(st));
      localStorage.setItem(AUDIO_PREF, JSON.stringify({ asked: true, want: [] })); // the voice-pack offer: already answered
    }, [src, extra]);
    await page.reload();
    await page.waitForFunction(() => typeof S !== "undefined" && S.words && Object.keys(S.words).length > 500);
  }
  await page.waitForTimeout(400);
  return { browser, page, errors };
}
