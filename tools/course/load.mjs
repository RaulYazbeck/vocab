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
export function loadCourse({ state = null } = {}) {
  const engine = ["de/german_decks_a1.js", "de/german_decks_a2.js", "de/german_decks_b1.js", "js/grammar-de.js", "js/verb-lab.js", "js/verb-track.js", "js/grammar-sheets-de.js", "js/grammar-quiz.js"];
  const files = [...engine, ...courseFiles().filter(f => !/course-ui\.js$/.test(f))];
  let src = `var WORD_KEY = "de"; var IS_FRENCH_APP = false; function escapeHtml(s){return String(s)}
    function normalize(s){return String(s).trim().toLowerCase().normalize("NFD").replace(/[\\u0300-\\u036f]/g,"").replace(/ß/g,"ss").replace(/['\\-]/g," ").replace(/\\s+/g," ")}
    function shuffle(a){return a}
    var S = { words: {}, verb: {}, path: {} }; var __saved = 0;
    function saveState(){ __saved++ } function studyToday(){ return globalThis.__today || "2026-10-18" }
    function addDays(d,n){ const x=new Date(String(d).slice(0,10)+"T00:00:00Z"); x.setUTCDate(x.getUTCDate()+n); return x.toISOString().slice(0,10) }
    function daysBetween(a,b){ return Math.round((Date.parse(String(b).slice(0,10))-Date.parse(String(a).slice(0,10)))/864e5) }`;
  src += files.map(f => fs.readFileSync(path.join(ROOT, f), "utf8")).join("\n;\n");
  src = src.replace(/\bconst (DECKS_\w+|VX_\w+|GS_\w+|GQ_\w+|VL_\w+|CX_\w+|CX|PERSONS|REFL|AUX_PR|AUX_PT|TENSES|MODAL_BASES|EN_\w+|DE_\w+|K2_AUX)\b/g, "var $1");
  src += `\n;var ALL_GROUPS = [DECKS_A1, DECKS_A2, DECKS_B1];`;
  const ctx = { console, module: undefined };
  vm.createContext(ctx);
  vm.runInContext(src, ctx, { filename: "course.js" });
  if (state) ctx.S = state;
  return ctx;
}
