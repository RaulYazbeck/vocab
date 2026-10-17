// Loads the verb engine (as tools/verb-track/load.mjs does) plus the
// course: its engine and every pack de/index.html lists — into a plain
// Node context, for the validator and the unit tests.
import fs from "node:fs";
import vm from "node:vm";
import path from "node:path";
import { fileURLToPath } from "node:url";
export const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../..");
// The course files the German app loads, in its order.
export function courseFiles() {
  const html = fs.readFileSync(path.join(ROOT, "de/index.html"), "utf8");
  return [...html.matchAll(/<script src="\.\.\/(js\/course[^"]*\.js)"/g)].map(m => m[1]);
}
// real: also the app's clock and scheduler (config.js, srs.js) instead of
// stubs — for the long simulation (sim.mjs), whose fake clock is
// globalThis.__now. extra: more source appended (synthetic packs).
export function loadCourse({ state = null, real = false, extra = "" } = {}) {
  const engine = ["de/german_decks_a1.js", "de/german_decks_a2.js", "de/german_decks_b1.js", "js/grammar-de.js", "js/verb-lab.js", "js/verb-track.js", "js/grammar-sheets-de.js", "js/grammar-quiz.js"];
  const files = [...(real ? ["js/config.js", "js/srs.js"] : []), ...engine, ...courseFiles().filter(f => !/course-ui\.js$/.test(f))];
  let src = (real ? `var APP_CONFIG = { targetProp: "de", storageKey: "gv5_de", speechLang: "de-DE", allGroups: [] };` : `var WORD_KEY = "de"; var IS_FRENCH_APP = false;`) + ` function escapeHtml(s){return String(s)}
    function normalize(s){return String(s).trim().toLowerCase().normalize("NFD").replace(/[\\u0300-\\u036f]/g,"").replace(/ß/g,"ss").replace(/['\\-]/g," ").replace(/\\s+/g," ")}
    var S = { words: {}, verb: {}, path: {} }; var __saved = 0;
    function saveState(){ __saved++ }`;
  src += real ? `var window = { matchMedia: () => ({ matches: false }) }; var navigator = {}; Date.now = () => globalThis.__now || new Date().getTime();`
    : `function shuffle(a){return a} function studyToday(){ return globalThis.__today || "2026-10-18" }
    function addDays(d,n){ const x=new Date(String(d).slice(0,10)+"T00:00:00Z"); x.setUTCDate(x.getUTCDate()+n); return x.toISOString().slice(0,10) }
    function daysBetween(a,b){ return Math.round((Date.parse(String(b).slice(0,10))-Date.parse(String(a).slice(0,10)))/864e5) }`;
  src += files.map(f => fs.readFileSync(path.join(ROOT, f), "utf8")).join("\n;\n") + "\n;\n" + extra;
  src = src.replace(/\bconst (DECKS_\w+|VX_\w+|GS_\w+|GQ_\w+|VL_\w+|CX_\w+|CX|STAGE_\w+|EASE|TIERS|ANKI|PATH|PERSONS|REFL|AUX_PR|AUX_PT|TENSES|MODAL_BASES|EN_\w+|DE_\w+|K2_AUX)\b/g, "var $1");
  src += real ? `\n;ALL_GROUPS.push(DECKS_A1, DECKS_A2, DECKS_B1);` : `\n;var ALL_GROUPS = [DECKS_A1, DECKS_A2, DECKS_B1];`;
  const ctx = { console, module: undefined };
  vm.createContext(ctx);
  vm.runInContext(src, ctx, { filename: "course.js" });
  if (state) ctx.S = state;
  return ctx;
}
