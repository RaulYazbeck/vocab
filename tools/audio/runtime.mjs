#!/usr/bin/env node
// The phrases the app MAKES while it runs, which no deck holds as text:
// the verb forms of 🎰 Conjugation Slots ("ich würde besuchen", "bedeuten
// Sie"), 🧵 Verb Thread ("ich hatte gedankt", and the bare form in its 🎧
// rounds), the verb track's exercises ("triffst dich", "rufen an"), the
// grammar sheets' examples, the idiom cards, and the word a Today
// "Sentences" item asks for, as the sentence has it ("Hallo").
//
//   node tools/audio/runtime.mjs --lang de [--levels a1,a2] [--verbs lernen,…] [--skip thread-ear] [--dry | --check]
//
// The app itself is loaded in a real browser (Chromium via Playwright, as
// the tests do) and every phrase is made by the app's own "what is said"
// functions (conjSayText, threadSayText, vxSayText, gsSayText…), never a
// copy of them, so the list is exactly what speak() will be asked to say.
// It is written to state/<lang>/runtime.tsv (kind, deck, text), which
// extract / synth / pack pick up like the decks (lib.mjs).
//
// The list is rebuilt in full each time, like the decks: a phrase the app
// no longer says is dropped (and its recording leaves the pack).
// --levels: only verbs of these deck levels (a1, a2, b1; verbs with no
// level go with the first). The full list is large (German ~700k
// characters, French ~510k), more than one month of Google's free tier,
// so it is recorded level by level, a month apart. --skip leaves out
// sources (cloze, idioms, sheets, track, conj, thread, thread-ear). Both
// are remembered in the file's first line, so a plain re-run (after
// adding verbs or sheets) keeps them. --verbs lists single verbs whose
// forms go in whatever their level (a month's leftover characters spent on
// the next level, verb by verb); remembered the same way. --dry prints the counts and writes
// nothing; --check exits 1 if runtime.tsv is not what the app says now.
//
// Deck ids decide the shard (pack.mjs): a verb's forms share "_v:<verb>",
// so they spread over the shards and a new verb changes one shard.

import fs from "node:fs";
import path from "node:path";
import http from "node:http";
import { spawnSync } from "node:child_process";
import { ROOT, collectTexts, runtimeFile, runtimeSettings, runtimeTexts } from "./lib.mjs";

const args = process.argv.slice(2);
const opt = (n, d) => { const i = args.indexOf("--" + n); return i >= 0 ? args[i + 1] : d; };
const lang = opt("lang");
if (!["de", "fr"].includes(lang)) { console.error("usage: runtime.mjs --lang de|fr [--levels a1,a2,b1] [--verbs inf,…] [--skip source,…] [--dry | --check]"); process.exit(1); }
const file = runtimeFile(lang);
const prev = runtimeSettings(lang);
if (args.includes("--check") && !prev) { console.log(`${lang}: no ${path.relative(ROOT, file)} — nothing to check`); process.exit(0); }
const list = s => String(s || "").split(",").map(x => x.trim()).filter(Boolean);
const levels = list(opt("levels", prev ? prev.levels : "a1,a2,b1"));
const skip = new Set(list(opt("skip", prev ? prev.skip : "")));
const verbs = new Set(list(opt("verbs", prev ? prev.verbs : "")));
const dry = args.includes("--dry"), check = args.includes("--check");

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
  // Grammar sheets: each example's 🔊 (grammar-ui.js).
  if (typeof GS_SHEETS !== "undefined") GS_SHEETS.forEach(sh => (sh.ex || []).forEach(([t]) => add(gsSayText(t), "s", "_sheet:" + sh.id, "", "sheets")));
  // The verb cards (verb-track.js / grammar-ui.js), German and French
  // alike: every exercise a rule, a verb item or a coverage cell can make —
  // every verb, every person (which you meet depends on your progress).
  if (typeof vxAvailable === "function" && vxAvailable()) vxVerbs().forEach(x => {
    const d = "_v:" + x.inf, lv = x.level;
    const put = (kind, p, form) => { if (form) add(vxSayText({ kind, x, p, form }), "w", d, lv, "track"); };
    VX_RULES.forEach(r => { if (r.verbs(x)) vxRulePersons(r, x).forEach(p =>
      (r.kind === "pvmod" && typeof VX_PV_MODALS !== "undefined" ? Object.keys(VX_PV_MODALS) : [""]).forEach(m => put(r.kind, p, vxForm(x, r.kind, p, { modal: m })))); });
    Object.entries(VX_ITEM_KINDS).forEach(([k, it]) => {
      // French items ask any of their persons; German ones a fixed one (vxMakeExercise).
      const ps = it.persons ? it.persons(x) : k === "sc" ? (x.k.stem ? ["du", "er"] : []) : [k === "im" ? "du" : "er"];
      ps.forEach(p => put(it.form, p, vxForm(x, it.form, p)));
    });
    VX_COV.forEach(t => { if (vxHasTense(x, t)) vxCellPersons(x, t).forEach(p => put(t, p, vxForm(x, t, p))); });
  });
  // The games only take verbs you can meet: a verb with a card of its own
  // (or, in French, a conjugation card). The bank also holds verbs known
  // only from other cards' evidence; no game ever shows those.
  const reachable = v => !!v.word || (v.words || []).length > 0 || vlCards(v).some(c => c.w);
  // 🎰 Conjugation Slots, unlimited spins: every verb × tense × person.
  if (typeof conjUnlimitedOn === "function" && conjUnlimitedOn()) {
    const all = CONJ_TENSE_IDS();
    verbBank().verbs.filter(v => v.word).forEach(v => v.tenses.filter(t => all.includes(t)).forEach(t => (t === "im" ? ["du", "ihr", "Sie"] : PERSONS).forEach(p => {
      const cell = verbCell(v.F, t, p);
      if (cell) add(conjSayText({ tense: t, person: p, cell }), "w", "_v:" + v.inf, v.level, "conj");
    })));
  }
  // 🧵 Verb Thread: the full form after each answer, the form alone in 🎧 rounds.
  const ts = VL_TENSES.map(t => t.id);
  vlBank().verbs.filter(reachable).forEach(v => ts.forEach(t => vlPersonsOf(v).forEach(p => [false, true].forEach(fem => {
    if (fem && !VL_FR) return;
    const c = vlCell(v, t, p, { fem }); if (!c) return;
    add(c.full, "w", "_v:" + v.inf, v.level, "thread");
    add(threadSayText(c.form), "w", "_v:" + v.inf, v.level, "thread-ear");
  }))));
  return out;
});
await browser.close(); srv.close();
if (errors.length) { console.error("page errors:\n  " + errors.slice(0, 5).join("\n  ")); process.exit(1); }

// What the decks already give (no need to list those again).
const inDecks = new Set(collectTexts(lang, [], { runtime: false }).map(t => t.text));
const order = ["a1", "a2", "b1"];
const okLevel = lv => !lv || (levels.includes(lv) || (!order.includes(lv) && levels.includes(order[0])));
const okVerb = deck => deck.startsWith("_v:") && verbs.has(deck.slice(3));
const kept = new Map(runtimeTexts(lang).map(([t, k, d]) => [t, [k, d]]));
const now = new Map(), bySrc = {};
for (const [text, kind, deck, lv, src] of found) {
  if (inDecks.has(text) || !(okLevel(lv) || okVerb(deck)) || skip.has(src)) continue;
  const s = bySrc[src] = bySrc[src] || new Set(); s.add(text);
  if (!now.has(text)) now.set(text, [kind, deck]);
  else if (kind === "w") now.get(text)[0] = "w";       // used as a word anywhere = a word
}
const chars = it => [...it].reduce((n, t) => n + t.length, 0);
console.log(`${lang}: levels ${levels.join(", ")}${verbs.size ? ` + ${verbs.size} verb(s): ${[...verbs].join(", ")}` : ""}`);
for (const [s, set] of Object.entries(bySrc)) console.log(`  ${s.padEnd(11)} ${String(set.size).padStart(6)} phrases`);
const added = [...now.keys()].filter(t => !kept.has(t)), dropped = [...kept.keys()].filter(t => !now.has(t));
const changed = [...now].filter(([t, v]) => kept.has(t) && kept.get(t).join() !== v.join()).length;
console.log(`  runtime.tsv: ${now.size} phrases (${chars(now.keys())} characters); vs the file: +${added.length} (${chars(added)} characters), -${dropped.length}${changed ? `, ${changed} moved` : ""}`);
added.slice(0, 5).forEach(t => console.log(`    + ${t}`));
dropped.slice(0, 5).forEach(t => console.log(`    - ${t}`));
const head = `# levels=${levels.join(",")}\tskip=${[...skip].join(",")}` + (verbs.size ? `\tverbs=${[...verbs].join(",")}` : "");
const same = !added.length && !dropped.length && !changed && prev && prev.head === head;
if (check) { console.log(same ? "  ✓ up to date" : "  ✗ out of date: run  node tools/audio/runtime.mjs --lang " + lang); process.exit(same ? 0 : 1); }
if (dry) process.exit(0);
fs.mkdirSync(path.dirname(file), { recursive: true });
const lines = [...now].map(([t, [k, d]]) => `${k}\t${d}\t${t}`).sort((a, b) => { const [da, db] = [a.split("\t")[1], b.split("\t")[1]]; return da < db ? -1 : da > db ? 1 : a < b ? -1 : a > b ? 1 : 0; });
fs.writeFileSync(file, [head, ...lines].join("\n") + "\n");
console.log(`  → ${path.relative(ROOT, file)}`);
