#!/usr/bin/env node
// Step 1 — list everything the app can say, per language.
//
//   node tools/audio/extract.mjs --lang de [--extra missing.txt]
//
// Writes work/<lang>/texts.json: [{ key, text, kind, deck }] where kind is
// "w" (a word or short phrase) or "s" (an example sentence). It also says
// what changed since the last run, so after editing the decks you can see at
// a glance how many clips are new and how many are no longer used.
//
// What is covered — every string the app passes to speak():
//   • each word as the games say it (gameForm: "die Katze, -n" → "die Katze")
//   • nouns with their article, German plurals ("die Katzen")
//   • every example sentence
//   • the pronoun + form of conjugation-deck cards ("ich gehe")
// Anything else (a verb form the games make up on the fly, say) still speaks
// through the system voice; the app remembers such phrases and Settings →
// Sound & voice → "Copy … phrases" gives you the list. Feed it back with
// --extra and re-run the pipeline: only new clips are made.

import fs from "node:fs";
import path from "node:path";
import { collectTexts, workDir } from "./lib.mjs";

const args = process.argv.slice(2);
const opt = (n, d) => { const i = args.indexOf("--" + n); return i >= 0 ? args[i + 1] : d; };
const lang = opt("lang");
if (!lang) { console.error("usage: extract.mjs --lang de|fr [--extra file.txt]"); process.exit(1); }

const extraFile = opt("extra");
const extra = extraFile ? fs.readFileSync(extraFile, "utf8").split(/\r?\n/) : [];
const list = collectTexts(lang, extra);

const dir = workDir(lang);
fs.mkdirSync(dir, { recursive: true });
const file = path.join(dir, "texts.json");
let before = null;
try { before = JSON.parse(fs.readFileSync(file, "utf8")); } catch (e) {}
fs.writeFileSync(file, JSON.stringify(list, null, 1));

const nw = list.filter(x => x.kind === "w").length, ns = list.length - nw;
const chars = k => list.filter(x => x.kind === k).reduce((n, x) => n + x.text.length, 0);
console.log(`${lang}: ${list.length} unique texts → ${file}`);
console.log(`  words/phrases: ${nw} (${chars("w")} characters)`);
console.log(`  sentences:     ${ns} (${chars("s")} characters)`);
if (before) {
  const old = new Map(before.map(x => [x.key, x.text])), now = new Map(list.map(x => [x.key, x.text]));
  const added = list.filter(x => !old.has(x.key)), removed = before.filter(x => !now.has(x.key));
  console.log(`  since last run: +${added.length} new, -${removed.length} no longer used`);
  added.slice(0, 8).forEach(x => console.log(`    + ${x.text}`));
  removed.slice(0, 8).forEach(x => console.log(`    - ${x.text}`));
}
