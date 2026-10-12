// The verb track inside the day's plan, the quests and the achievements:
//   • with a finish date, the verb pace is what the date needs, each tense
//     from the day it opens; the finish-date check counts the verbs too
//     (a date too close for them is "out of reach");
//   • the Today card's numbers include the verbs' reviews, repairs and new
//     items — one plan, not two;
//   • verb quests: offered when the day has verb work, counted from verb
//     answers; a quest on a deck the track took over is swapped; Explorer
//     / Finish never point at cards that can't come; the verbs quest
//     opens Today;
//   • bosses and minions never use the cards the track took over;
//   • the Grammar ladders: Irregular Forms and Form Filler, sized to the
//     catalog, starting where you are.
//   node t-plan.mjs        (REAL_STATE=… for a real profile; APP=fr)
import { openApp } from "./browser.mjs";
const APP = process.env.APP || "de";
const { browser, page, errors } = await openApp({ width: 390, height: 844, app: APP });
const r = await page.evaluate(() => {
  window.saveState = () => {}; window.saveToCloud = () => {}; window.showCelebrateToast = () => {};
  const out = [], ok = (c, m) => out.push([!!c, m]);
  if (!vxOn()) vxSwitchOn();
  if (!pathDeadlineOn()) setPathDeadline(addDays(studyToday(), 300));
  // 1. pace
  vxCatalogReset();
  const need = vxPaceNeeded(), q = vxQuotas(), open = vxUnitOpenDays();
  ok(need.items >= 0 && need.cells >= 0 && need.ok, `pace the date needs: ${need.items} items, ${need.cells} drills a day (eta ${need.eta})`);
  ok(q.items === Math.max(VX_ITEM_PACE[0], Math.min(VX_ITEM_PACE[1], need.items)) || (!need.items && !q.items), "the day's quota follows it");
  ok(VX_UNITS.every(u => open[u.id] >= 0) && VX_UNITS.every(u => u.req.every(r => open[u.id] > open[r] || vxUnitState(u.id) >= 2)), "every tense has an opening day, after the ones it needs", JSON.stringify(open));
  ok(pathDeadlineStatus().ok, "the finish date is on course");
  // A date the verbs can't make: out of reach, later eta.
  const keep = S.path.deadline;
  S.path.deadline = addDays(studyToday(), 40); _vxPace = null;
  const st = pathDeadlineStatus();
  ok(!st.ok && st.eta > S.path.deadline, `a date 40 days away is out of reach (eta ${st.eta})`);
  S.path.deadline = keep; _vxPace = null;
  // The final stretch: a word not yet Known waits less near the date.
  const keep2 = S.path.deadline, w0 = { st: 4, k: 1 }, now0 = Date.now();
  S.path.deadline = addDays(studyToday(), 200); scheduleStage(w0, now0);
  const far = Math.round((w0.dueAt - studyDayStart(0, now0)) / 864e5);
  S.path.deadline = addDays(studyToday(), 24); scheduleStage(w0, now0);
  const near = Math.round((w0.dueAt - studyDayStart(0, now0)) / 864e5);
  const known = { st: STAGE_KNOWN, k: 1 }; scheduleStage(known, now0);
  const kd = Math.round((known.dueAt - studyDayStart(0, now0)) / 864e5);
  S.path.deadline = keep2; _vxPace = null;
  ok(far === STAGE_DAYS[4] && near === 3 && kd === STAGE_DAYS[STAGE_KNOWN], `final stretch: a 🌿4 word waits ${far} days far from the date, ${near} with 24 days left; a Known one still ${kd}`);
  // …and a hard word moves up on one right answer there (no second check).
  const hard = () => ({ st: 3, k: 0.56, pk: 3, dueAt: Date.now() - 1000, sAt: Date.now() - 5 * 864e5, correct: 0, wrong: 0 });
  S.path.deadline = addDays(studyToday(), 200);
  const h1 = hard(); srsReview(h1, true, "recall");
  S.path.deadline = addDays(studyToday(), 20);
  const h2 = hard(); srsReview(h2, true, "recall");
  S.path.deadline = keep2;
  ok(h1.st === 3 && h1.cf === 1 && h2.st === 4, `a hard word: a second check far from the date (st ${h1.st}), straight up in the final stretch (st ${h2.st})`);
  // 2. Today numbers
  const words = pathTodaySummary(), vx = vxTodayCounts();
  renderHome();
  const chips = document.querySelector(".tc-stats").innerText;
  const due = +((chips.match(/(\d+) due/) || [])[1] || -1);
  ok(due === words.due + vx.due, `📚 due = words ${words.due} + verbs ${vx.due} (${chips.replace(/\n/g, " ")})`);
  ok(/words and verbs/.test(deadlineLineHtml(pathScan())), "the plan line says words and verbs");
  // 3. quests
  const c = questContext();
  ok(!!c.vx, "the quest context knows the day's verb work", JSON.stringify(c.vx));
  ["a_vxfix", "a_vxsure", "b_vxforms", "b_ledger"].forEach(id => {
    const t = QT.find(x => x.id === id);
    let ti = ""; try { ti = t.title({ target: t.target(c), p: {} }); } catch (e) { ti = "ERR " + e.message; }
    ok(t && !/ERR|undefined|NaN/.test(ti), `${id}: ${ti}`);
  });
  const av = QT.find(x => x.id === "a_verbs");
  ok(av.go({}) === "path", "the verbs quest opens Today");
  const m = freshQuestCounters(), x = vxVerbs()[0];
  const ex = { kind: VX_CORE[0], x, p: VX_PERSONS[0], form: vxForm(x, VX_CORE[0], VX_PERSONS[0]), tense: VX_CORE[0], cell: x.inf + "|" + VX_CORE[0] };
  questOnAnswer(m, { mode: "path", ok: true, typed: true, w: vxWord(ex), it: "verb", fix: true, retried: false });
  questOnAnswer(m, { mode: "path", ok: true, typed: true, w: vxWord(ex), it: "verb", retried: true });
  questOnAnswer(m, { mode: "path", ok: true, typed: true, w: vxWord(ex), it: "verb", hint: true });
  ok(m.vxOk === 2 && m.vxCells === 2 && m.vxFixed === 1 && m.vxTenseSure === 1, "verb answers counted (a hint doesn't, a second try isn't 'first try')", JSON.stringify([m.vxOk, m.vxCells, m.vxFixed, m.vxTenseSure]));
  // a quest on a taken-over deck is swapped
  const legacy = ALL_GROUPS.flatMap(g => g.decks).find(d => vxDeckRetired(d.id));
  ok(!!legacy, "a deck the track took over entirely" + (legacy ? `: ${legacy.id}` : ""));
  if (legacy) {
    questEnsureToday();
    const Q = S.quests, idx = Q.list.findIndex(x => !x.done && byId(x.tpl) && !byId(x.tpl).fixed);
    if (idx >= 0) {
      Q.list[idx] = Object.assign({}, Q.list[idx], { tpl: "b_crown", p: { deck: legacy.id }, done: false });
      questSwapRetired();
      ok(!(Q.list[idx].p && Q.list[idx].p.deck === legacy.id), "a quest on that deck is swapped for another");
    }
    ok(!c.metDecks.some(d => vxDeckRetired(d.id)), "deck quests never pick it");
    ok(deckMetWords(legacy.id).length === 0 && !deckBossReady(legacy.id), "no boss or minion from its cards");
  }
  const f = pathFrontier(c.scan);
  if (f) {
    let bad = 0;
    for (let i = 0; i < 30; i++) { const rng = seededRandom(i); const t = QT.find(x => x.id === "b_explore"); if (t.ok(c)) { const p = t.params(c, rng); if (!(c.scan.decks[p.deck].avail > 0)) bad++; } }
    ok(!bad, "Explorer only picks decks with words that can still come");
  }
  // 4. ladders
  const ids = ACHIEVEMENTS.filter(a => a.id.startsWith("vx_")).map(a => a.id);
  ok(ids.includes("vx_forms") && ids.includes("vx_cells"), "Irregular Forms and Form Filler ladders", ids.join(","));
  const af = ACHIEVEMENTS.find(a => a.id === "vx_forms"), ac = ACHIEVEMENTS.find(a => a.id === "vx_cells");
  ok(af.tiers[af.tiers.length - 1] === vxCatalog().filter(it => it.kind !== "r").length, "Irregular Forms tops out at every per-verb item");
  ok(ac.tiers[ac.tiers.length - 1] === vxRequiredCells().length, "Form Filler tops out at every ledger form");
  ok(af.value() <= af.tiers[af.tiers.length - 1] && ac.value() <= ac.tiers[ac.tiers.length - 1], "values within their ladders");
  return out;
});
let pass = 0, fail = 0;
r.forEach(([c, m]) => { if (c) { pass++; if (/pace|due =|out of reach|: \d|ERR/.test(m)) console.log("✓", m); } else { fail++; console.log("✗", m); } });
if (errors.length) { fail++; console.log("page errors:", errors.slice(0, 5)); }
console.log(`plan${APP === "fr" ? " (fr)" : ""}: ${pass} passed, ${fail} failed`);
await browser.close();
process.exit(fail ? 1 : 0);
