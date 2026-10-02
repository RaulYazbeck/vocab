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

export function workDir(lang) { return path.join(ROOT, "tools/audio/work", lang); }

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
