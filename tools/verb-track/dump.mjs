// A readable dump of everything the verb track would ask, for review.
import { openApp } from "./browser.mjs";
import fs from "node:fs";
const { browser, page, errors } = await openApp();
const txt = await page.evaluate(() => {
  vxSwitchOn();
  VX_UNITS.forEach(u => S.verb.tu[u.id] = 2);
  // every verb met (to see the full order)
  vxVerbs().forEach(x => (x.v.words || [x.v.word]).forEach(w => { const ws = getWS(w.deckId, w.idx); if (!ws.st) { ws.st = 3; ws.metOn = "2026-12-01"; } }));
  const L = [];
  const show = ex => {
    const pron = ex.p === "Sie" ? "Sie" : ex.p === "sie" ? "sie(pl)" : ex.p === "er" && vxItVerb(ex.x) ? "es" : (PERSON_LABEL[ex.p] || ex.p).split("/")[0];
    return `${pron} ___${ex.form.n > 1 ? " ×" + ex.form.n : ""}${ex.form.tail ? " [" + ex.form.tail + "]" : ""}${ex.modal ? " <" + ex.modal + ">" : ""} (${ex.x.inf}) → ${ex.form.ans}   {${ex.form.acc.join(" | ")}}`;
  };
  VX_RULES.forEach(r => {
    const vs = vxRuleVerbs(r.id);
    L.push(`\n## r:${r.id} — ${r.title} (${vs.length} verbs) · ${r.chip}`);
    const byLv = {};
    vs.forEach(x => { (byLv[x.level] = byLv[x.level] || []).push(x); });
    Object.entries(byLv).forEach(([lv, xs]) => {
      L.push(`  ${lv}: ` + xs.slice(0, 18).map(x => x.inf).join(", ") + (xs.length > 18 ? ` … +${xs.length - 18}` : ""));
    });
    S.verb.rot = {}; S.verb.cov = {};
    for (let i = 0; i < 6; i++) { const ex = vxMakeExercise({ kind: "r", rule: r.id, id: "r:" + r.id }); if (ex) { L.push("    " + show(ex)); vxCovSet(ex.x.inf, ex.tense); } }
  });
  ["sc", "p2", "pt", "im"].forEach(k => {
    const items = vxCatalog().filter(it => it.kind === k);
    L.push(`\n## ${k} items (${items.length}) — ${VX_ITEM_KINDS[k].title}`);
    const ordered = vxNewCandidates().filter(it => it.kind === k);
    L.push("  order: " + ordered.slice(0, 40).map(it => it.x.inf + "(" + it.x.level + ")").join(", "));
    items.slice(0, 400).forEach(it => { const ex = vxMakeExercise(it); L.push("    " + (ex ? show(ex) : "✗ NO EXERCISE " + it.id)); });
  });
  L.push(`\n## first 60 coverage drills`);
  S.verb.cov = {};
  vxOpenCells(60).forEach(c => { const ex = vxCellExercise(c); L.push("    " + c.t + " · " + (ex ? show(ex) : "✗ " + c.x.inf)); });
  return L.join("\n");
});
fs.writeFileSync(process.env.OUT || "/tmp/vx-dump.txt", txt);
console.log("errors:", errors.length ? errors : "none", txt.length);
await browser.close();
