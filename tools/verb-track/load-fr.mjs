// Loads the French decks, the French verb engine and the verb track
// (French layer + sheets + quizzes) into a plain Node context.
import fs from "node:fs";
import vm from "node:vm";
import path from "node:path";
import { fileURLToPath } from "node:url";
const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../..");
export function loadEngineFr({ sheets = true } = {}) {
  const files = ["fr/french_decks_a1.js", "fr/french_decks_a2.js", "fr/french_decks_b1.js", "js/grammar-de.js", "js/grammar-fr.js", "js/verb-lab.js",
    "js/verb-track-fr.js", "js/verb-track.js", ...(sheets ? ["js/grammar-sheets-fr.js"] : []), "js/grammar-quiz.js"];
  let src = `var WORD_KEY = "fr"; var IS_FRENCH_APP = true; function escapeHtml(s){return String(s)}
    function stripAccents(s){return String(s).normalize("NFD").replace(/[\\u0300-\\u036f]/g,"")}
    function normalize(s){return String(s).trim().toLowerCase().normalize("NFD").replace(/[\\u0300-\\u036f]/g,"").replace(/ß/g,"ss").replace(/['\\-]/g," ").replace(/\\s+/g," ")}
    function levenshtein(a,b){const m=a.length,n=b.length;let p=Array.from({length:n+1},(_,j)=>j);for(let i=1;i<=m;i++){const c=[i];for(let j=1;j<=n;j++)c[j]=Math.min(p[j]+1,c[j-1]+1,p[j-1]+(a[i-1]===b[j-1]?0:1));p=c}return p[n]}
    function isNearMiss(){return false}
    function shuffle(a){return a}`;
  src += files.map(f => fs.readFileSync(path.join(ROOT, f), "utf8")).join("\n;\n");
  src = src.replace(/\bconst (DECKS_\w+|VX_\w+|VXF\w*|GS_\w+|GQ_\w+|VL_\w+|FR_\w+|ES_\w+|GR_\w+|PERSONS|REFL|AUX_PR|AUX_PT|TENSES|MODAL_BASES|EN_\w+|DE_\w+|K2_AUX)\b/g, "var $1");
  src += `\n;var ALL_GROUPS = [DECKS_A1, DECKS_A2, DECKS_B1];`;
  const ctx = { console, module: undefined };
  vm.createContext(ctx);
  vm.runInContext(src, ctx, { filename: "engine-fr.js" });
  return ctx;
}
