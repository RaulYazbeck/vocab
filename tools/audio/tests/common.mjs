// Shared by the browser tests. run.mjs sets BASE (where the app is served)
// and OUT (where screenshots go); CHROME overrides the browser to use.
import fs from "node:fs";
import path from "node:path";
import { chromium } from "playwright-core";

export const BASE = process.env.BASE || "http://localhost:8765";
export const OUT = process.env.OUT || ".";

function findChrome() {
  if (process.env.CHROME) return process.env.CHROME;
  const root = process.env.PLAYWRIGHT_BROWSERS_PATH || "/opt/pw-browsers";
  try {
    for (const d of fs.readdirSync(root).filter(d => d.startsWith("chromium-")).sort().reverse()) {
      const p = path.join(root, d, "chrome-linux", "chrome");
      if (fs.existsSync(p)) return p;
    }
  } catch (e) {}
  return undefined;                          // let Playwright find its own
}
export function launch() {
  return chromium.launch({ executablePath: findChrome(), args: ["--autoplay-policy=no-user-gesture-required", "--no-sandbox"] });
}
export function counter() {
  const c = { pass: 0, fail: 0 };
  c.ok = (cond, msg, extra = "") => { if (cond) { c.pass++; console.log("  ✓", msg); } else { c.fail++; console.log("  ✗ FAIL:", msg, extra); } };
  c.end = () => { console.log(`\n${c.pass} passed, ${c.fail} failed`); return c.fail ? 1 : 0; };
  return c;
}
