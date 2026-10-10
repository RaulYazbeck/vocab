// The French app must behave exactly as before (no verb track there).
import fs from "node:fs"; import path from "node:path"; import { createRequire } from "node:module";
const require = createRequire(path.resolve("../audio/tests/package.json"));
const { chromium } = require("playwright-core");
const exe = fs.readdirSync("/opt/pw-browsers").filter(d => d.startsWith("chromium-")).map(d => `/opt/pw-browsers/${d}/chrome-linux/chrome`).find(p => fs.existsSync(p));
const browser = await chromium.launch({ executablePath: exe, args: ["--no-sandbox"] });
const page = await browser.newPage();
const errors = [];
page.on("pageerror", e => errors.push(String(e)));
await page.route(/gstatic\.com|googleapis\.com|google\.com/, r => r.abort());
await page.goto((process.env.BASE || "http://localhost:8765") + "/fr/index.html");
await page.waitForFunction(() => typeof S !== "undefined");
const r = await page.evaluate(() => {
  const scan = pathScan(true);
  const q = buildPathQueue("regular");
  return { vx: typeof vxOn, items: q.items.length, total: scan.total, unmet: pathUnmet(scan), thread: vlLevelTenses(), menu: settingsMenuHtml().includes("Grammar") };
});
console.log(JSON.stringify(r), errors.length ? errors : "no errors");
await browser.close();
process.exit(errors.length || r.vx !== "undefined" || r.menu ? 1 : 0);
