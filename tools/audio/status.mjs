#!/usr/bin/env node
// Is the voice pack up to date with the decks? No GPU, no audio needed.
//
//   node tools/audio/status.mjs --lang de [--manifest audio/de/manifest.json] [--list 20] [--strict]
//
// Compares every string the app can say (from the decks, as extract.mjs does)
// with the published pack's manifest:
//   missing  = texts with no recording yet (they use the phone's voice)
//   unused   = recordings no deck uses any more (dropped by the next pack)
// Run it after editing the decks. --strict exits 1 when anything is missing
// (handy in a CI check).

import fs from "node:fs";
import path from "node:path";
import { collectTexts, ROOT } from "./lib.mjs";

const args = process.argv.slice(2);
const opt = (n, d) => { const i = args.indexOf("--" + n); return i >= 0 ? args[i + 1] : d; };
const lang = opt("lang");
if (!lang) { console.error("usage: status.mjs --lang de|fr [--manifest file] [--list 20] [--strict]"); process.exit(1); }
const file = path.resolve(opt("manifest", path.join(ROOT, "audio", lang, "manifest.json")));
const listN = +opt("list", 15);

const texts = collectTexts(lang);
let idx = null;
try { idx = JSON.parse(fs.readFileSync(file, "utf8")).idx; } catch (e) {}
if (!idx) {
  console.log(`${lang}: no voice pack at ${path.relative(ROOT, file)} yet — all ${texts.length} texts need recording.`);
  process.exit(args.includes("--strict") ? 1 : 0);
}
const have = new Set(Object.keys(idx));
const missing = texts.filter(t => !have.has(t.key));
const used = new Set(texts.map(t => t.key));
const unused = [...have].filter(k => !used.has(k));
const pct = ((1 - missing.length / texts.length) * 100).toFixed(1);
console.log(`${lang}: ${texts.length - missing.length}/${texts.length} texts have a recording (${pct}%)`);
console.log(`  missing: ${missing.length}   unused recordings: ${unused.length}`);
missing.slice(0, listN).forEach(t => console.log(`    + [${t.kind}] ${t.text}   (${t.deck})`));
if (missing.length > listN) console.log(`    … and ${missing.length - listN} more`);
if (missing.length) console.log(`\nTo add them:  node tools/audio/extract.mjs --lang ${lang}  →  python tools/audio/synth.py --lang ${lang} …  →  node tools/audio/pack.mjs --lang ${lang}`);
process.exit(missing.length && args.includes("--strict") ? 1 : 0);
