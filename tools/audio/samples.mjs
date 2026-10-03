#!/usr/bin/env node
// A single, self-contained listening page: random clips from each language
// with their text, the audio embedded (MP3, so it plays on any phone).
// Made at the end of a run so the voices can be judged before merging.
//
//   node tools/audio/samples.mjs [--langs de,fr] [--n 24] [--seed 7] [--out work/samples.html]
//   node tools/audio/samples.mjs --check list.json [--title "…"] [--out …]
//       a page of chosen clips instead of random ones; list.json is
//       {"de": {"Section title": ["text", …], …}, "fr": {…}}

import fs from "node:fs";
import path from "node:path";
import { spawnSync } from "node:child_process";
import { workDir } from "./lib.mjs";

const args = process.argv.slice(2);
const opt = (n, d) => { const i = args.indexOf("--" + n); return i >= 0 ? args[i + 1] : d; };
const check = opt("check", "") ? JSON.parse(fs.readFileSync(opt("check"), "utf8")) : null;
const langs = check ? Object.keys(check) : opt("langs", "de,fr").split(",").map(s => s.trim()).filter(Boolean);
const n = +opt("n", 24);
let seed = +opt("seed", 7);
const out = path.resolve(opt("out", path.join(path.dirname(workDir("x")), "samples.html")));
const rnd = () => { seed = (seed * 1664525 + 1013904223) >>> 0; return seed / 4294967296; };
const shuffle = a => { for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(rnd() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; } return a; };
const esc = s => String(s).replace(/[&<>"]/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));
const NAMES = { de: "German", fr: "French" };
const readJson = p => { try { return JSON.parse(fs.readFileSync(p, "utf8")); } catch (e) { return {}; } };

function mp3(wav) {
  const r = spawnSync("ffmpeg", ["-v", "error", "-i", wav, "-ac", "1", "-ar", "24000", "-c:a", "libmp3lame", "-b:a", "64k", "-f", "mp3", "-"], { maxBuffer: 1 << 26 });
  if (r.status !== 0) throw new Error("ffmpeg failed on " + wav + ": " + r.stderr);
  return r.stdout.toString("base64");
}

let sections = "", total = 0;
for (const lang of langs) {
  const dir = workDir(lang);
  const texts = JSON.parse(fs.readFileSync(path.join(dir, "texts.json"), "utf8"))
    .filter(t => fs.existsSync(path.join(dir, "wav", t.key + ".wav")));
  const overrides = readJson(path.join(path.dirname(new URL(import.meta.url).pathname), "overrides", lang + ".json"));
  const variantsUsed = readJson(path.join(dir, "variants.json"));
  const pick = kind => shuffle(texts.filter(t => t.kind === kind)).slice(0, Math.ceil(n / 2));
  const sent = t => (overrides[t.text] && !t.text.startsWith("_") ? overrides[t.text] : t.say) || "";
  const row = t => { total++; const v = variantsUsed[t.text] || sent(t);
    return `<li><p>${esc(t.text)}${v && v !== t.text ? ` <small>sent to Google as “${esc(v)}”</small>` : ""}</p><audio controls preload="none" src="data:audio/mpeg;base64,${mp3(path.join(dir, "wav", t.key + ".wav"))}"></audio></li>`; };
  if (check) {
    const byText = new Map(texts.map(t => [t.text, t]));
    sections += `<section><h2>${NAMES[lang] || lang}</h2>` + Object.entries(check[lang]).map(([title, list]) => {
      const items = list.map(x => byText.get(x)).filter(Boolean);
      return `<h3>${esc(title)} (${items.length})</h3><ul>${items.map(row).join("\n")}</ul>`;
    }).join("\n") + `</section>\n`;
    continue;
  }
  // Short words Google first returned as near-silence, re-made with a full stop or
  // an exclamation mark: worth hearing on purpose.
  const helped = new Set([...Object.keys(variantsUsed), ...Object.keys(overrides).filter(k => !k.startsWith("_"))]);
  const fixed = texts.filter(t => helped.has(t.text));
  sections += `<section><h2>${NAMES[lang] || lang}</h2><ul>${[...pick("w"), ...pick("s")].map(row).join("\n")}</ul>` +
    (fixed.length ? `<h3>Short words that needed a second try (${fixed.length})</h3><ul>${fixed.map(row).join("\n")}</ul>` : "") + `</section>\n`;
}

const html = `<!doctype html>
<html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1">
<title>${check ? "Pronunciation check" : "Voice samples"}</title>
<style>
:root { --bg:#f7f7f5; --card:#fff; --text:#1c1c1c; --muted:#666; --line:#e4e4e0; }
@media (prefers-color-scheme: dark) { :root:not([data-theme="light"]) { --bg:#121314; --card:#1c1d1f; --text:#ececec; --muted:#a0a0a0; --line:#2c2d30; } }
:root[data-theme="dark"] { --bg:#121314; --card:#1c1d1f; --text:#ececec; --muted:#a0a0a0; --line:#2c2d30; }
* { box-sizing:border-box; }
body { margin:0; background:var(--bg); color:var(--text); font:16px/1.45 system-ui, -apple-system, Segoe UI, sans-serif; }
main { max-width:720px; margin:0 auto; padding:24px 16px 48px; }
h1 { font-size:1.5rem; margin:0 0 4px; } .lead { color:var(--muted); margin:0 0 24px; }
h2 { font-size:1.15rem; margin:28px 0 10px; } h3 { font-size:1rem; margin:22px 0 8px; color:var(--muted); }
ul { list-style:none; margin:0; padding:0; display:grid; gap:10px; }
li { background:var(--card); border:1px solid var(--line); border-radius:12px; padding:12px 14px; }
li p { margin:0 0 8px; } li small { color:var(--muted); } audio { width:100%; height:36px; }
</style></head>
<body><main>
<h1>${esc(opt("title", check ? "Pronunciation check" : "Voice samples"))}</h1>
<p class="lead">${check ? `${total} chosen clips of the AI voice (Google Chirp 3 HD, "Aoede"), exactly as the app will play them. When a text was sent to Google differently, it says so under the text.` : `${total} clips of the new AI voice (Google Chirp 3 HD, "Aoede"): random words and example sentences, then the short words that needed a second try. Exactly as the app will play them. Listen for a smooth, native-sounding accent.`}</p>
${sections}</main></body></html>
`;
fs.mkdirSync(path.dirname(out), { recursive: true });
fs.writeFileSync(out, html);
console.log(`wrote ${out}  (${total} clips, ${(html.length / 1048576).toFixed(1)} MB)`);
