#!/usr/bin/env node
// The phrases the app MAKES while it runs, which no deck holds as text:
// the verb forms of 🎰 Conjugation Slots ("ich würde besuchen", "bedeuten
// Sie"), 🧵 Verb Thread ("ich hatte gedankt", and the bare form in its 🎧
// rounds), the verb track's exercises ("triffst dich", "rufen an"), the
// grammar sheets' examples, the idiom cards, and the word a Today
// "Sentences" item asks for, as the sentence has it ("Hallo").
//
//   node tools/audio/runtime.mjs --lang de [--levels a1,a2] [--skip thread-ear] [--dry]
//
// The app itself is loaded in a real browser (Chromium via Playwright, as
// the tests do) and every such phrase is generated with the app's own
// functions, so the list is exactly what speak() will be asked to say.
// It is written to state/<lang>/runtime.tsv (kind, deck, text), which
// extract / synth / pack pick up like the decks (lib.mjs).
//
// --levels: only verbs of these deck levels (a1, a2, b1; verbs with no
// level go with the first). The full list is large (German ~700k
// characters, French ~510k), more than one month of Google's free tier,
// so it can be recorded level by level, a month apart. A phrase recorded
// once is kept: phrases already in runtime.tsv are never dropped by a
// narrower --levels. --skip leaves out sources (cloze, idioms, sheets,
// track, conj, thread, thread-ear). --dry prints the counts and writes nothing.
//
// Deck ids decide the shard (pack.mjs): a verb's forms share "_v:<verb>",
// so they spread over the shards and a new verb changes one shard.

import fs from "node:fs";
import path from "node:path";
import http from "node:http";
import { spawnSync } from "node:child_process";
import { ROOT, stateDir, collectTexts } from "./lib.mjs";

const args = process.argv.slice(2);
const opt = (n, d) => { const i = args.indexOf("--" + n); return i >= 0 ? args[i + 1] : d; };
const lang = opt("lang");
if (!["de", "fr"].includes(lang)) { console.error("usage: runtime.mjs --lang de|fr [--levels a1,a2,b1] [--skip source,…] [--dry]"); process.exit(1); }
const levels = opt("levels", "a1,a2,b1").split(",").map(s => s.trim()).filter(Boolean);
const skip = new Set(opt("skip", "").split(",").map(s => s.trim()).filter(Boolean));
const dry = args.includes("--dry");

const TESTS = path.join(ROOT, "tools/audio/tests");
if (!fs.existsSync(path.join(TESTS, "node_modules", "playwright-core"))) {
  console.log("installing playwright-core (first run)…");
  const r = spawnSync("npm", ["install", "--no-audit", "--no-fund", "--silent"], { cwd: TESTS, stdio: "inherit" });
  if (r.status !== 0) process.exit(1);
}
const { launch } = await import("./tests/common.mjs");

// A plain static server for the app (no voice pack: not needed here).
const TYPES = { ".html": "text/html", ".js": "text/javascript", ".css": "text/css", ".json": "application/json", ".png": "image/png" };
const srv = http.createServer((req, res) => {
  let f = path.join(ROOT, decodeURIComponent(new URL(req.url, "http://x").pathname));
  if (!path.resolve(f).startsWith(ROOT) || /\.bin$/.test(f)) { res.writeHead(404); return res.end(); }
  try { if (fs.statSync(f).isDirectory()) f = path.join(f, "index.html"); } catch (e) {}
  fs.readFile(f, (err, buf) => { if (err) { res.writeHead(404); return res.end(); } res.writeHead(200, { "Content-Type": TYPES[path.extname(f)] || "application/octet-stream" }); res.end(buf); });
});
await new Promise(r => srv.listen(0, "127.0.0.1", r));
const browser = await launch();
const page = await browser.newPage();
const errors = [];
page.on("pageerror", e => errors.push(String(e)));
await page.route(/gstatic|firebase|googleapis/, r => r.abort());
await page.goto(`http://127.0.0.1:${srv.address().port}/${lang}/index.html`);
await page.waitForFunction(() => typeof ALL_GROUPS !== "undefined" && typeof vlBank === "function", null, { timeout: 30000 });

// [text, kind, deck, level, source]
const found = await page.evaluate(() => {
  const out = [];
  const add = (text, kind, deck, lv, src) => { text = String(text == null ? "" : text).replace(/\s+/g, " ").trim(); if (text) out.push([text, kind, deck, lv || "", src]); };
  const words = [];
  ALL_GROUPS.forEach(g => g.decks.forEach(d => d.words.forEach((w, i) => { if (w.deckId == null) w.deckId = d.id; if (w.idx == null) w.idx = i; words.push(w); })));
  // Today "Sentences": the asked word as the sentence has it (mode-path.js).
  if (typeof clozeTarget === "function") words.forEach(w => { const i = clozeTarget(w); if (i) add(i.answer, "w", w.deckId, "", "cloze"); });
  // Idiom cards (idioms.js): the idiom and its example.
  const idioms = WORD_KEY === "de" ? (typeof IDIOMS_DE !== "undefined" ? IDIOMS_DE : []) : (typeof IDIOMS_FR !== "undefined" ? IDIOMS_FR : []);
  idioms.forEach(c => { add(c.p, "w", "_idioms", "", "idioms"); add(c.ex, "s", "_idioms", "", "idioms"); });
  // Grammar sheets (grammar-ui.js gsExamplesHtml).
  if (typeof GS_SHEETS !== "undefined") GS_SHEETS.forEach(sh => (sh.ex || []).forEach(([t]) => add(t.replace(/\[\[|\]\]/g, ""), "s", "_sheet:" + sh.id, "", "sheets")));
  // The verb track's exercises (grammar-ui.js: ex.form.ans).
  if (typeof vxAvailable === "function" && vxAvailable()) vxVerbs().forEach(x => {
    const d = "_v:" + x.inf, lv = x.level, put = t => add(t, "w", d, lv, "track");
    VX_RULES.forEach(r => { if (r.verbs(x)) vxRulePersons(r, x).forEach(p => (r.kind === "pvmod" ? Object.keys(VX_PV_MODALS) : [""]).forEach(m => { const f = vxForm(x, r.kind, p, { modal: m }); if (f) put(f.ans); })); });
    Object.entries(VX_ITEM_KINDS).forEach(([k, it]) => {
      if (k === "sc") { if (x.k.stem) ["du", "er"].forEach(p => { const f = vxForm(x, "sc", p); if (f) put(f.ans); }); return; }
      const f = vxForm(x, it.form, k === "im" ? "du" : "er"); if (f) put(f.ans);
    });
    ["pr", "pt", "pf", "fu", "pq"].forEach(t => { if (x.v.tenses.includes(t)) vxCellPersons(x, t).forEach(p => { const f = vxForm(x, t, p); if (f) put(f.ans); }); });
  });
  // 🎰 Conjugation Slots, unlimited spins (game-conjugation.js sayOf).
  if (typeof conjUnlimitedOn === "function" && conjUnlimitedOn()) {
    const all = CONJ_TENSE_IDS();
    verbBank().verbs.forEach(v => v.tenses.filter(t => all.includes(t)).forEach(t => (t === "im" ? ["du", "ihr", "Sie"] : PERSONS).forEach(p => {
      const c = verbCell(v.F, t, p); if (!c) return;
      add(`${t === "im" ? "" : PERSON_LABEL[p].split("/")[0] + " "}${c.ans}${c.tail ? " " + c.tail.replace(/^… /, "").replace(/!$/, "") : ""}`, "w", "_v:" + v.inf, v.level, "conj");
    })));
  }
  // 🧵 Verb Thread (game-thread.js): the full form after each answer, the bare form in 🎧 rounds.
  const ts = VL_TENSES.map(t => t.id);
  vlBank().verbs.forEach(v => ts.forEach(t => vlPersonsOf(v).forEach(p => [false, true].forEach(fem => {
    if (fem && !VL_FR) return;
    const c = vlCell(v, t, p, { fem }); if (!c) return;
    add(c.full, "w", "_v:" + v.inf, v.level, "thread");
    add(c.form, "w", "_v:" + v.inf, v.level, "thread-ear");
  }))));
  return out;
});
await browser.close(); srv.close();
if (errors.length) { console.error("page errors:\n  " + errors.slice(0, 5).join("\n  ")); process.exit(1); }

// What the decks already give (no need to list those again).
const inDecks = new Set(collectTexts(lang, [], { runtime: false }).map(t => t.text));
const order = ["a1", "a2", "b1"];
const okLevel = lv => !lv || (levels.includes(lv) || (!order.includes(lv) && levels.includes(order[0])));
const file = path.join(stateDir(lang), "runtime.tsv");
const kept = new Map();
try { fs.readFileSync(file, "utf8").split("\n").filter(Boolean).forEach(l => { const [k, d, t] = l.split("\t"); kept.set(t, [k, d]); }); } catch (e) {}
const now = new Map(kept), bySrc = {};
for (const [text, kind, deck, lv, src] of found) {
  if (inDecks.has(text) || !okLevel(lv) || skip.has(src)) continue;
  const s = bySrc[src] = bySrc[src] || new Set(); s.add(text);
  if (!now.has(text)) now.set(text, [kind, deck]);
  else if (kind === "w") now.get(text)[0] = "w";       // used as a word anywhere = a word
}
const chars = it => [...it].reduce((n, t) => n + t.length, 0);
console.log(`${lang}: levels ${levels.join(", ")}`);
for (const [s, set] of Object.entries(bySrc)) console.log(`  ${s.padEnd(11)} ${String(set.size).padStart(6)} phrases`);
const added = [...now.keys()].filter(t => !kept.has(t));
console.log(`  runtime.tsv: ${now.size} phrases (${chars(now.keys())} characters), ${added.length} new (${chars(added)} characters)`);
if (dry) process.exit(0);
fs.mkdirSync(path.dirname(file), { recursive: true });
const lines = [...now].map(([t, [k, d]]) => `${k}\t${d}\t${t}`).sort((a, b) => a.split("\t")[1].localeCompare(b.split("\t")[1]) || (a < b ? -1 : 1));
fs.writeFileSync(file, lines.join("\n") + "\n");
console.log(`  → ${path.relative(ROOT, file)}`);
