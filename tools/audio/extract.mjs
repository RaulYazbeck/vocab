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
// Sound & voice → "Copy voice log" gives you the list. Feed it back with
// --extra and re-run the pipeline: only new clips are made.

import fs from "node:fs";
import path from "node:path";
import { collectTexts, workDir, ROOT, extraFile as savedExtraFile, savedExtras } from "./lib.mjs";

const args = process.argv.slice(2);
const opt = (n, d) => { const i = args.indexOf("--" + n); return i >= 0 ? args[i + 1] : d; };
const lang = opt("lang");
if (!lang) { console.error("usage: extract.mjs --lang de|fr [--extra file.txt]"); process.exit(1); }

const extraFile = opt("extra");
// One phrase per line, or the app's "Copy voice log" as it is: then only its
// "Phrases without a recording:" part is used.
let extra = extraFile ? fs.readFileSync(extraFile, "utf8").split(/\r?\n/).map(l => l.trim()).filter(Boolean) : [];
if (extra.length && extra[0].startsWith("Voice log (")) {
  let part = null; const keep = [];
  for (const l of extra.slice(1)) {
    if (l === "Flagged recordings:" || l === "Phrases without a recording:") part = l;
    else if (part === "Phrases without a recording:") keep.push(l);
  }
  extra = keep;
}
const list = collectTexts(lang, extra);
// Remember the new extras (see collectTexts) once they've been accepted.
const kept = savedExtras(lang), addNow = [...new Set(extra)].filter(t => !kept.includes(t));
if (addNow.length) {
  fs.mkdirSync(path.dirname(savedExtraFile(lang)), { recursive: true });
  fs.writeFileSync(savedExtraFile(lang), [...kept, ...addNow].join("\n") + "\n");
  console.log(`${lang}: ${addNow.length} extra phrase(s) saved to ${path.relative(ROOT, savedExtraFile(lang))}`);
}

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

// Against the published pack: what a run would record (works on a fresh machine too).
let pub = null;
try { pub = JSON.parse(fs.readFileSync(path.join(ROOT, "audio", lang, "manifest.json"), "utf8")); } catch (e) {}
if (pub && pub.idx) {
  const fresh = list.filter(x => !(x.key in pub.idx));
  const now = new Set(list.map(x => x.key));
  const gone = Object.keys(pub.idx).filter(k => !now.has(k)).length;
  console.log(`  vs the published pack: ${fresh.length} to record (${fresh.reduce((n, x) => n + x.text.length, 0)} characters), ${gone} no longer used`);
  fresh.slice(0, 8).forEach(x => console.log(`    + ${x.text}`));
}

// Texts the voice would read literally: dictionary shorthand, square brackets,
// an English note, a slash between words. Fix the card (or add an override).
let overrides = {};
try { overrides = JSON.parse(fs.readFileSync(path.join(path.dirname(new URL(import.meta.url).pathname), "overrides", lang + ".json"), "utf8")); } catch (e) {}
const ODD = /\b(jmd|jmdm|jmdn|jdm|jdn|etw|sth|sb|qn|qch|qc|qqn|qqch|someone|something)\b|[\[\]{}<>]|\b(sg|pl|usu|lit|fig|coll|inf|jur|med)\.(\s|$)|\b\w+\/\w+\b/i;
const odd = list.filter(x => x.kind === "w" && !(x.text in overrides) && ODD.test(x.text));
fs.writeFileSync(path.join(dir, "warnings.json"), JSON.stringify(odd.map(x => ({ text: x.text, deck: x.deck }))));
if (odd.length) {
  console.log(`  ⚠ ${odd.length} text(s) the voice would read literally (shorthand, brackets, an English note, a slash). Write them out on the card, or add an override:`);
  odd.slice(0, 20).forEach(x => console.log(`    ! ${x.text}   (deck ${x.deck})`));
}
