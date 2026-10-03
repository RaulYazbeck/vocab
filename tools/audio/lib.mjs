// Shared by the voice-pack tools: loads the app's own deck and grammar
// code into a sandbox, so the texts we record are exactly the strings
// the app will ask speak() to say, and the lookup key is the very same
// function the browser uses (js/audio.js — never copied).

import vm from "node:vm";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

export const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../..");
export const LANGS = {
  de: { decks: ["german_decks_a1", "german_decks_a2", "german_decks_b1", "jm_deck_sammy"],
        groups: "[DECKS_A1, DECKS_A2, DECKS_B1, germanWithSammyDecks]", speech: "de-DE" },
  fr: { decks: ["french_decks_a1", "french_decks_a2", "french_decks_b1"],
        groups: "[DECKS_A1, DECKS_A2, DECKS_B1]", speech: "fr-FR" },
};

// Intermediate files (texts, WAVs, encoded clips). AUDIO_WORK puts them
// somewhere else (optional; tests use it).
export function workDir(lang) {
  return path.join(process.env.AUDIO_WORK || path.join(ROOT, "tools/audio/work"), lang);
}

// A sandbox with just enough browser to run the pure helpers.
function makeSandbox() {
  const noop = () => {};
  const sb = {
    console, setTimeout, clearTimeout, setInterval, clearInterval,
    localStorage: { getItem: () => null, setItem: noop, removeItem: noop },
    navigator: {}, addEventListener: noop, MutationObserver: class { observe() {} },
    matchMedia: () => ({ matches: false }),
    document: { querySelector: noop, getElementById: noop, createElement: () => ({ style: {} }), addEventListener: noop, body: { appendChild: noop } },
    // game files call these at load time
    showCelebrateToast: noop, confettiBurst: noop,
  };
  sb.window = sb; sb.self = sb;
  return vm.createContext(sb);
}
function run(ctx, file) {
  const full = path.isAbsolute(file) ? file : path.join(ROOT, file);
  vm.runInContext(fs.readFileSync(full, "utf8"), ctx, { filename: full });
}

// Only the key function: js/audio.js is safe to load on its own.
export function loadAudioKey() {
  const ctx = makeSandbox();
  vm.runInContext(`var WORD_KEY = "x";`, ctx);
  run(ctx, "js/audio.js");
  return vm.runInContext("audioKey", ctx);
}

// The whole vocabulary side of the app for one language.
export function loadApp(lang) {
  const L = LANGS[lang];
  if (!L) throw new Error(`Unknown language "${lang}" (use ${Object.keys(LANGS).join(" or ")})`);
  const ctx = makeSandbox();
  L.decks.forEach(d => run(ctx, `${lang}/${d}.js`));
  vm.runInContext(
    `var APP_CONFIG = { title: "t", speechLang: "${L.speech}", storageKey: "x", targetProp: "${lang}", allGroups: ${L.groups} };`, ctx);
  for (const f of ["config", "ui-helpers", "games-core", "grammar-de", "game-conjugation", "audio"]) run(ctx, `js/${f}.js`);
  return ctx;
}
export function evalIn(ctx, code) { return vm.runInContext(code, ctx); }

// Languages whose bare verb forms are read wrongly on their own, so a
// conjugation card's form is spoken WITH its pronoun ("as" → "tu as",
// "ai" → "j'ai", "puissent" → "qu'ils puissent"). French: silent endings and
// homographs ("as" alone is the noun "ace"). German forms read fine alone.
export const SAY_WITH_PRONOUN = new Set(["fr"]);

// Everything the app can ask speak() to say for one language, de-duplicated:
// [{ key, text, kind: "w"|"s", deck, say? }]. Words come first, in deck order.
// say: what is actually sent to the voice when it differs from text (the
// clip is still found under text).
//   w = a word or short phrase, s = an example sentence;
//   deck = the deck it belongs to (used to keep a deck's clips together in the
//   pack, so editing one deck only changes that deck's files).
// extraTexts: optional extra phrases (the app's "missing" list).
export function collectTexts(lang, extraTexts = []) {
  const app = loadApp(lang);
  const audioKey = evalIn(app, "audioKey");
  const found = evalIn(app, `(() => {
    const out = [], conjCtx = {}, vocab = new Set();
    const add = (text, kind, deck) => { text = String(text == null ? "" : text).replace(/\\s+/g, " ").trim(); if (text) out.push([text, kind, deck]); };
    for (const g of ALL_GROUPS) for (const d of g.decks) d.words.forEach((w, i) => {
      w.deckId = d.id; w.idx = i;
      add(gameForm(w), "w", d.id);
      try {
        const it = conjItem(w);
        if (it) { const f = gameForm(w); (conjCtx[f] = conjCtx[f] || []).push(conjJoin(it.pron.split("/")[0], it.ans)); }
        else vocab.add(gameForm(w));
      } catch (e) {}
      try { const np = typeof nounParts === "function" ? nounParts(w) : null; if (np && np.full) add(np.full, "w", d.id); } catch (e) {}
      if (WORD_KEY === "de") try {
        const np = nounParts(w);
        const pl = np && typeof germanPluralNoun === "function" ? germanPluralNoun(w) : "";
        if (pl) add("die " + pl, "w", d.id);
      } catch (e) {}
      try { const it = conjItem(w); if (it) add(conjJoin(it.pron.split("/")[0], it.ans), "w", d.id); } catch (e) {}
      (w.examples || []).forEach(ex => { if (ex && ex[WORD_KEY]) add(ex[WORD_KEY], "s", d.id); });
    });
    out.conjCtx = conjCtx; out.vocab = [...vocab];
    return out;
  })()`);
  // Which bare verb forms to say with their pronoun (see SAY_WITH_PRONOUN):
  // one pronoun → always; several (e.g. "parle": je/il) → only when the bare
  // word is risky (≤ 3 letters, or a silent "-ent"), with the first card's
  // pronoun; a text that is also an ordinary vocabulary word → never.
  const sayFor = new Map();
  if (SAY_WITH_PRONOUN.has(lang)) {
    const vocab = new Set(found.vocab);
    for (const [form, ctxs] of Object.entries(found.conjCtx)) {
      const uniq = [...new Set(ctxs)];
      if (vocab.has(form) || !uniq.length) continue;
      const risky = form.length <= 3 || /ent$/.test(form);
      if (uniq.length === 1 || risky) sayFor.set(form, uniq[0]);
    }
  }
  for (const t of extraTexts) {
    const x = String(t).trim();
    if (x) found.push([x, x.length > 28 && /\s/.test(x) && /[.!?]$/.test(x) || x.split(/\s+/).length > 4 ? "s" : "w", "_extra"]);
  }
  const norm = t => t.normalize("NFC").replace(/\s+/g, " ").trim();
  const byKey = new Map();
  for (const [text, kind, deck] of found) {
    const key = audioKey(text);
    const prev = byKey.get(key);
    if (prev) {
      if (norm(prev.text) !== norm(text)) throw new Error(`Key collision between "${prev.text}" and "${text}"`);
      if (kind === "w") prev.kind = "w";            // used as a word anywhere = a word
    } else byKey.set(key, sayFor.has(text) ? { key, text, kind, deck, say: sayFor.get(text) } : { key, text, kind, deck });
  }
  const all = [...byKey.values()];
  return [...all.filter(x => x.kind === "w"), ...all.filter(x => x.kind === "s")];
}
