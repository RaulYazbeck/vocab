#!/usr/bin/env node
// Step 1 — list everything the app can say, per language.
//
//   node tools/audio/extract.mjs --lang de [--extra missing.txt]
//
// Writes tools/audio/work/<lang>/texts.json: [{ key, text, kind }] where
// kind is "w" (a word or short phrase) or "s" (an example sentence).
// Words come first, in deck order, so one lesson's clips sit together.
//
// What is covered — every string the app passes to speak():
//   • each word as the games say it (gameForm: "die Katze, -n" → "die Katze")
//   • nouns with their article, German plurals ("die Katzen")
//   • every example sentence
//   • the pronoun + form of conjugation-deck cards ("ich gehe")
// Anything else (a verb form the games make up on the fly, say) still
// speaks through the system voice; the app remembers such phrases and
// Settings → Sound & voice → "Copy … phrases" gives you the list. Feed
// it back with --extra and re-run the pipeline: only new clips are made.

import fs from "node:fs";
import path from "node:path";
import { loadApp, loadAudioKey, evalIn, workDir } from "./lib.mjs";

const args = process.argv.slice(2);
const opt = (n, d) => { const i = args.indexOf("--" + n); return i >= 0 ? args[i + 1] : d; };
const lang = opt("lang");
if (!lang) { console.error("usage: extract.mjs --lang de|fr [--extra file.txt]"); process.exit(1); }

const app = loadApp(lang);
const audioKey = loadAudioKey();

// Runs inside the app sandbox, with the app's own functions.
const found = evalIn(app, `(() => {
  const out = [];
  const add = (text, kind) => { text = String(text == null ? "" : text).replace(/\\s+/g, " ").trim(); if (text) out.push([text, kind]); };
  for (const g of ALL_GROUPS) for (const d of g.decks) d.words.forEach((w, i) => {
    w.deckId = d.id; w.idx = i;
    add(gameForm(w), "w");
    try { const np = typeof nounParts === "function" ? nounParts(w) : null; if (np && np.full) add(np.full, "w"); } catch (e) {}
    if (WORD_KEY === "de") try {
      const np = nounParts(w);
      const pl = np && typeof germanPluralNoun === "function" ? germanPluralNoun(w) : "";
      if (pl) add("die " + pl, "w");
    } catch (e) {}
    try { const it = conjItem(w); if (it) add(conjJoin(it.pron.split("/")[0], it.ans), "w"); } catch (e) {}
    (w.examples || []).forEach(ex => { if (ex && ex[WORD_KEY]) add(ex[WORD_KEY], "s"); });
  });
  return out;
})()`);

// Extra phrases (the app's "missing" list): sentence-looking ones are "s".
const extraFile = opt("extra");
if (extraFile) {
  fs.readFileSync(extraFile, "utf8").split(/\r?\n/).map(s => s.trim()).filter(Boolean).forEach(t => {
    found.push([t, t.length > 28 && /\s/.test(t) && /[.!?]$/.test(t) || t.split(/\s+/).length > 4 ? "s" : "w"]);
  });
}

// A text used as a word anywhere is a word (it lives in the small pack).
const byKey = new Map();
for (const [text, kind] of found) {
  const key = audioKey(text);
  const prev = byKey.get(key);
  if (prev) {
    if (prev.text.normalize("NFC").replace(/\s+/g, " ").trim() !== text.normalize("NFC").replace(/\s+/g, " ").trim()) {
      throw new Error(`Key collision between "${prev.text}" and "${text}"`);
    }
    if (kind === "w") prev.kind = "w";
  } else byKey.set(key, { key, text, kind });
}
const all = [...byKey.values()];
const list = [...all.filter(x => x.kind === "w"), ...all.filter(x => x.kind === "s")];

const dir = workDir(lang);
fs.mkdirSync(dir, { recursive: true });
fs.writeFileSync(path.join(dir, "texts.json"), JSON.stringify(list, null, 1));
const nw = list.filter(x => x.kind === "w").length, ns = list.length - nw;
const chars = k => list.filter(x => x.kind === k).reduce((n, x) => n + x.text.length, 0);
console.log(`${lang}: ${list.length} unique texts → ${path.join(dir, "texts.json")}`);
console.log(`  words/phrases: ${nw} (${chars("w")} characters)`);
console.log(`  sentences:     ${ns} (${chars("s")} characters)`);
