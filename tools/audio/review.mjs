#!/usr/bin/env node
// Listen before you ship. Builds a page of random clips (text + player)
// so you can judge accent and clarity in a few minutes.
//
//   node tools/audio/review.mjs --lang fr [--n 40] [--seed 1]
//   → open tools/audio/work/fr/review.html in a browser
//
// Pay attention to what a learner would copy: French liaison and nasal
// vowels, German ch / ü / ö, word stress, and any clip that sounds
// like another language or stumbles. To redo a bad clip: delete its
// work/<lang>/wav/<key>.wav (the key is shown next to it), run synth.py
// again (it makes only the missing ones, with a fresh seed), then pack.
import fs from "node:fs";
import path from "node:path";
import { workDir } from "./lib.mjs";

const args = process.argv.slice(2);
const opt = (n, d) => { const i = args.indexOf("--" + n); return i >= 0 ? args[i + 1] : d; };
const lang = opt("lang");
if (!lang) { console.error("usage: review.mjs --lang de|fr [--n 40] [--seed 1]"); process.exit(1); }
const n = +opt("n", 40);
let seed = +opt("seed", Date.now() % 100000);
const rnd = () => { seed = (seed * 1664525 + 1013904223) >>> 0; return seed / 4294967296; };

const dir = workDir(lang);
const texts = JSON.parse(fs.readFileSync(path.join(dir, "texts.json"), "utf8"))
  .filter(t => fs.existsSync(path.join(dir, "wav", t.key + ".wav")));
const pick = kind => {
  const pool = texts.filter(t => t.kind === kind);
  for (let i = pool.length - 1; i > 0; i--) { const j = Math.floor(rnd() * (i + 1)); [pool[i], pool[j]] = [pool[j], pool[i]]; }
  return pool.slice(0, n);
};
const esc = s => s.replace(/[&<>"]/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));
const rows = (title, list) => `<h2>${title} (${list.length})</h2>` + list.map(t =>
  `<div class="r"><span>${esc(t.text)}</span><audio controls preload="none" src="wav/${t.key}.wav"></audio><code>${t.key}</code></div>`).join("");
fs.writeFileSync(path.join(dir, "review.html"), `<!doctype html><meta charset="utf-8"><title>Review ${lang}</title>
<style>body{font:16px system-ui;max-width:760px;margin:2rem auto;padding:0 1rem}.r{display:flex;gap:12px;align-items:center;padding:6px 0;border-bottom:1px solid #8883}
.r span{flex:1}code{color:#888;font-size:11px}audio{height:32px}</style>
<h1>Voice review — ${lang}</h1><p>Listen for accent, clarity, and anything that sounds wrong.</p>
${rows("Words", pick("w"))}${rows("Sentences", pick("s"))}`);
console.log(`wrote ${path.join(dir, "review.html")}`);
