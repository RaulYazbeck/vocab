// Old verb cards taken over by the verb track — nothing lost:
//   • every card of a verb-form deck (met or not) is covered and never
//     asked the old way: not as a new word, not as a review, not in Today;
//   • a met card keeps its whole record (rtWas) and shows at least the
//     stage it had — so met / Known / Strong / Locked counts, levels and
//     every achievement value stay where they were (or go up);
//   • its progress goes to what covers it: a per-verb item takes its stage
//     and schedule, its forms count as produced in the ledger;
//   • a later load changes nothing more; switching back restores every
//     card exactly as it was.
//   node t-adopt.mjs            (REAL_STATE=… for a real profile; APP=fr)
import { openApp } from "./browser.mjs";
const APP = process.env.APP || "de";
const { browser, page, errors } = await openApp({ width: 390, height: 844, app: APP });
page.setDefaultTimeout(0);
import fs from "node:fs";
const RAW = process.env.REAL_STATE ? fs.readFileSync(process.env.REAL_STATE, "utf8") : "";
const r = await page.evaluate((RAW) => {
  window.saveState = () => {}; window.saveToCloud = () => {}; window.showCelebrateToast = () => {};
  const out = [], ok = (c, m) => out.push([!!c, m]);
  const clone = o => JSON.parse(JSON.stringify(o));
  // What "progress" is, as the app shows it.
  const metrics = () => {
    invalidatePathScan();
    const sc = pathScan(true);
    const ach = {};
    ACHIEVEMENTS.forEach(a => { try { ach[a.id] = a.value(); } catch (e) { ach[a.id] = "err"; } });
    return { met: sc.met, known: sc.known, locked: sc.locked, total: sc.total, tiers: clone(sc.tiers), level: currentLevel(), exp: S.exp, ach };
  };
  // Before: the words and verb track exactly as saved (a real profile:
  // the backup, before this version ever loaded it; the test profile:
  // switched on the old way, without adoption).
  const _adopt = vxAdopt; window.vxAdopt = () => 0;
  if (RAW) { const raw = JSON.parse(RAW); S.words = raw.words; S.verb = raw.verb; migrateVerb(); }
  else if (!vxOn()) vxSwitchOn();
  vxCatalogReset();
  const legacy = [];
  ALL_GROUPS.forEach(g => g.decks.forEach(d => { if (VX_LEGACY_DECKS.has(d.id)) d.words.forEach((w, i) => legacy.push(d.id + "_" + i)); }));
  const words0 = clone(S.words);
  const metLegacy = legacy.filter(k => words0[k] && words0[k].st && !words0[k].rt);
  const m0 = metrics();
  window.vxAdopt = _adopt;
  // Adopt (what this version does on its first load).
  const n = vxAdopt(); vxMirror();
  const m1 = metrics();
  ok(true, `${metLegacy.length} met cards of verb-form decks, ${n} adopted`);
  ok(n === metLegacy.filter(k => vxRetireMap().has(k)).length, "every mapped met card adopted");
  // 1. Every legacy card covered, except the plain grammar cards.
  const unmapped = legacy.filter(k => !vxRetireMap().has(k));
  ok(true, `not verb forms, staying ordinary cards: ${unmapped.length} (${unmapped.map(k => { const i = k.lastIndexOf("_"); const d = getDeck(k.slice(0, i)); return d.words[+k.slice(i + 1)][WORD_KEY]; }).join(" · ")})`);
  // 2. No card lower than it was; met cards keep their record.
  let lower = [], lostRec = [];
  Object.keys(words0).forEach(k => {
    if (k.startsWith("vx_")) return;
    const a = words0[k], b = S.words[k];
    if (a && a.st && (!b || (b.st || 0) < a.st)) lower.push(`${k} ${a.st}→${b ? b.st : "gone"}`);
    if (metLegacy.includes(k) && vxRetireMap().has(k) && !(b && b.rtWas && b.rtWas.st === a.st && b.rtWas.correct === a.correct)) lostRec.push(k);
  });
  ok(!lower.length, "no card shows a lower stage", lower.slice(0, 8).join(" | "));
  ok(!lostRec.length, "every adopted card keeps its whole record", lostRec.slice(0, 5).join(" "));
  // 3. Counts, level, achievements: never down.
  ["met", "known", "locked", "total", "level", "exp"].forEach(f => ok(m1[f] >= m0[f], `${f}: ${m0[f]} → ${m1[f]}`));
  const down = Object.keys(m0.ach).filter(id => typeof m0.ach[id] === "number" && m1.ach[id] < m0.ach[id]).map(id => `${id} ${m0.ach[id]}→${m1.ach[id]}`);
  ok(!down.length, "no achievement value goes down", down.join(" | "));
  // 4. Progress handed over: items take the cards' stage; forms produced.
  const byItem = new Map();
  metLegacy.forEach(k => { const c = vxRetireMap().get(k); if (c && c.item) { if (!byItem.has(c.item)) byItem.set(c.item, []); byItem.get(c.item).push(words0[k].st); } });
  const weak = [];
  byItem.forEach((sts, id) => {
    const s = sts.slice().sort((a, b) => a - b), mid = s[Math.floor((s.length - 1) / 2)];
    const it = S.words[vxKey(id)];
    if (!it || (it.st || 0) < mid) weak.push(`${id} cards ${sts.join(",")} item ${it ? it.st : "none"}`);
  });
  ok(!weak.length, `${byItem.size} items took over their cards' stage`, weak.slice(0, 8).join(" | "));
  ok([...byItem.keys()].every(id => vxCatalog().some(it => it.id === id)), "every item that took over is in the catalog");
  const covMiss = metLegacy.filter(k => { const c = vxRetireMap().get(k); return c && VX_COV.includes(c.t) && !vxCovHas(c.inf, c.t); });
  ok(!covMiss.length, "their forms count as produced in the ledger", covMiss.slice(0, 5).join(" "));
  // 5. Never asked the old way.
  const scan = pathScan(true);
  const { fix, due } = pathReviewCandidates(Date.now() + 400 * 864e5);
  const oldDue = [...fix, ...due].filter(o => VX_LEGACY_DECKS.has(o.d.id) && vxRetireMap().has(o.d.id + "_" + o.i));
  ok(!oldDue.length, "no old verb card comes as a review (even a year on)", oldDue.slice(0, 5).map(o => o.d.id + "_" + o.i).join(" "));
  const fresh = [];
  ALL_GROUPS.forEach(g => g.decks.forEach(d => { if (VX_LEGACY_DECKS.has(d.id)) unmetIndices(d, 999).forEach(i => { if (vxRetireMap().has(d.id + "_" + i)) fresh.push(d.id + "_" + i); }); }));
  ok(!fresh.length, "no old verb card comes as a new word", fresh.slice(0, 5).join(" "));
  // Today sessions over a few days: no legacy card at all.
  const seen = [];
  const realNow = Date.now.bind(Date);
  for (let day = 0; day < 4; day++) {
    const off = day * 864e5; Date.now = () => realNow() + off;
    invalidatePathScan();
    const q = buildPathQueue("long");
    q.items.forEach(it => { if (it.w && !it.w.vx && VX_LEGACY_DECKS.has(it.w.deckId) && vxRetireMap().has(wordKey(it.w))) seen.push(wordKey(it.w)); });
  }
  Date.now = realNow;
  ok(!seen.length, "Today never asks an old verb card", seen.slice(0, 5).join(" "));
  // Every covered card can reach Known in the end (else the word total —
  // and Road to B1 — could never be complete): its cover is an item of the
  // catalog, a rule whose form the ledger asks, or a rule it then mirrors
  // directly.
  const dead = [];
  vxRetireMap().forEach((c, k) => {
    if (c.item ? !vxCatalog().some(it => it.id === c.item) : !VX_RULE[c.rule]) dead.push(k + " → " + (c.item || c.rule));
  });
  ok(!dead.length, `all ${vxRetireMap().size} covered cards can reach Known`, dead.slice(0, 5).join(" | "));
  // A rule-covered card whose form the ledger never asks mirrors its rule.
  const rk = [...vxRetireMap().entries()].find(([k, c]) => c.rule && !vxCellRequired(c.inf, c.t));
  if (rk) {
    const r0 = getWS(VX_DECK, "r:" + rk[1].rule), was = r0.st;
    r0.st = 5; vxMirror();
    ok((S.words[rk[0]] || {}).st >= 5, `${rk[0]} (${rk[1].rule}) mirrors its rule without a ledger form`);
    r0.st = was; vxMirror();
  }
  // 6. A second load changes nothing.
  const snap = JSON.stringify(S.words);
  ok(vxAdopt() === 0, "a second load adopts nothing");
  vxMirror();
  ok(JSON.stringify(S.words) === snap, "a second load changes nothing");
  // 7. Switching back: every met card exactly as it was.
  vxSwitchOff();
  const diff = metLegacy.filter(k => JSON.stringify(Object.assign({}, S.words[k], { anki: undefined })) !== JSON.stringify(Object.assign({}, words0[k], { anki: undefined })));
  ok(!diff.length, "switching back restores every card exactly", diff.slice(0, 3).map(k => k + " " + JSON.stringify(S.words[k]).slice(0, 120) + " vs " + JSON.stringify(words0[k]).slice(0, 120)).join(" | "));
  const m2 = metrics();
  // The same as switching back before this version: your own cards, no
  // mirrors and no verb items.
  const after = S.words;
  S.words = {}; Object.entries(words0).forEach(([k, ws]) => { if (!k.startsWith("vx_") && !(ws && ws.rt)) S.words[k] = clone(ws); });
  const mExp = metrics();
  S.words = after;
  ok(m2.met === mExp.met && m2.known === mExp.known && m2.locked === mExp.locked, `switched back: met ${m2.met} / known ${m2.known} / locked ${m2.locked} = your own cards (${mExp.met} / ${mExp.known} / ${mExp.locked})`);
  return out;
}, RAW);
let pass = 0, fail = 0;
r.forEach(([c, m]) => { if (c) { pass++; if (/adopted|staying|took over|→/.test(m)) console.log("✓", m); } else { fail++; console.log("✗", m); } });
if (errors.length) { fail++; console.log("page errors:", errors.slice(0, 5)); }
console.log(`adopt${APP === "fr" ? " (fr)" : ""}: ${pass} passed, ${fail} failed`);
await browser.close();
process.exit(fail ? 1 : 0);
