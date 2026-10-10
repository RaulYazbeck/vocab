// Loads the German decks, the verb engine and the verb track into a
// plain Node context (no browser) — for the content tests.
import fs from "node:fs";
import vm from "node:vm";
import path from "node:path";
import { fileURLToPath } from "node:url";
const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../..");
export function loadEngine() {
  const files = ["de/german_decks_a1.js", "de/german_decks_a2.js", "de/german_decks_b1.js", "js/grammar-de.js", "js/verb-lab.js", "js/verb-track.js", "js/grammar-sheets-de.js"];
  let src = `var WORD_KEY = "de"; var IS_FRENCH_APP = false; function escapeHtml(s){return String(s)}
    function normalize(s){return String(s).trim().toLowerCase().normalize("NFD").replace(/[\\u0300-\\u036f]/g,"").replace(/ß/g,"ss").replace(/['\\-]/g," ").replace(/\\s+/g," ")}
    function shuffle(a){return a}`;
  src += files.map(f => fs.readFileSync(path.join(ROOT, f), "utf8")).join("\n;\n");
  src = src.replace(/\bconst (DECKS_\w+|VX_\w+|GS_\w+|VL_\w+|PERSONS|REFL|AUX_PR|AUX_PT|TENSES|MODAL_BASES|EN_\w+|DE_\w+|K2_AUX)\b/g, "var $1");
  src += `\n;var ALL_GROUPS = [DECKS_A1, DECKS_A2, DECKS_B1];`;
  const ctx = { console, module: undefined };
  vm.createContext(ctx);
  vm.runInContext(src, ctx, { filename: "engine.js" });
  return ctx;
}
