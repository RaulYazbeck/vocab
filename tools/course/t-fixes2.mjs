// The fixes of 21 Oct 2026, in the real app (same setup as t-course.mjs):
//   1 · new words forced on top: words met anywhere count against today's;
//       "+5" only once today's are met, its round brings exactly them, the
//       length you picked stays; no word is ever skipped
//   2 · the session's count never goes down when a 📖 card asks fewer
//       questions than planned
//   3 · drag & drop on the course's tiles (the games' engine)
//   4 · Shift+Enter ×3: 10 a day
//   5 · no "rules to review" line on the Today card
//   6 · undo a "+5" — and the undo survives a sync
//
//   node t-fixes2.mjs   (serve the repo root on :8765; npm install once in tools/audio/tests)
import fs from "node:fs"; import vm from "node:vm";
import { openApp } from "../verb-track/browser.mjs";

let fails = 0;
const say = (r, tag) => { console.log(`== ${tag}`); r.log.forEach(l => console.log(l)); r.fails.forEach(l => console.log(l)); fails += r.fails.length; };
const HELP = () => {
  window.__log = [], window.__fails = [];
  window.ok = (c, m) => { (c ? __log : __fails).push((c ? "✓ " : "✗ ") + m); };
  window.mistakeHeld = () => false;
  // Today's new words: met as many as the day allows (the "+5" shows).
  window.meetAll = () => { const q = pathNewQuota(pathScan(true)); planNewWords(q.left).flat().forEach(w => pathMeetWord(w)); invalidatePathScan(); return pathNewQuota(pathScan(true)); };
  window.learnCards = () => pathSession.items.filter(x => x.t === "learn" && !(x.w && x.w.vx));
};

// ── 1 + 6 · new words, "+5" and its undo ──
{
  const { browser, page, errors } = await openApp({ course: true });
  await page.evaluate(HELP);
  const r = await page.evaluate(async () => {
    S.path.sessionLen = "regular";
    pathRollDay();
    let q = pathNewQuota(pathScan(true));
    ok(q.left > 0, `a fresh day: ${q.left} new words to meet`);
    // the old bug: words met in the classic Learn mode (or anywhere) count
    const left0 = q.left;
    const pick = planNewWords(Math.min(2, left0)).flat();
    activeWords = pick; startLearn(); pick.forEach(() => learnGotIt()); backToMenu();
    q = pathNewQuota(pathScan(true));
    ok(q.left === left0 - pick.length, `2 met in the classic Learn mode: today's left goes ${left0} → ${q.left}, nothing added on top`);
    // "+5" while today's words are still waiting: refused
    ok(pathLearnExtra() === false && (S.path.extraToday || 0) === 0, "+5 with today's words still waiting: refused, nothing stacked");
    renderHome();
    ok(!/\+5 new/.test(document.querySelector(".tc-stats").innerText), "…and the Today card doesn't offer it");
    q = meetAll();
    ok(q.left === 0, "today's words met");
    renderHome();
    ok(/🌱 \+5 new/.test(document.querySelector(".tc-stats").innerText) && !/Undo/.test(document.querySelector(".tc-stats").innerText), "now the Today card offers +5 (no undo yet)");
    // the deck order before: the first unmet word of each deck
    const firstUnmet = {}; vocabGroups().forEach(g => g.decks.forEach(d => { const i = unmetIndices(d, 1)[0]; if (i !== undefined) firstUnmet[d.id] = i; }));
    pathStartExtra();
    const learn = learnCards();
    ok(learn.length === PATH.EXTRA_NEW, `the +5 round brings all ${PATH.EXTRA_NEW} new words (${learn.length})`);
    ok(S.path.sessionLen === "regular", `…and the length you picked stays (${S.path.sessionLen})`);
    ok(pathSession.items.filter(x => !["learn", "bonus", "sheet", "cx"].includes(x.t) && !x.warm && !x.fresh).length === 0, "…new words only, no reviews in it");
    const byDeck = {}; learn.forEach(x => (byDeck[x.w.deckId] = byDeck[x.w.deckId] || []).push(x.w.idx));
    ok(Object.entries(byDeck).every(([d, idx]) => idx[0] === firstUnmet[d] && idx.every((v, k) => k === 0 || v === idx[k - 1] + 1 || !isMet(d, idx[k - 1] + 1))), `in deck order, from each deck's first unmet word — nothing skipped (${JSON.stringify(byDeck)})`);
    // meet 2 of the 5, then quit: undo takes back the 3 not met
    learn.slice(0, 2).forEach(x => pathMeetWord(x.w));
    endPathSession(true); backToMenu();
    invalidatePathScan();
    renderHome();
    const chips = document.querySelector(".tc-stats").innerText;
    ok(/↶ Undo \+3/.test(chips) && /🌱 3 new/.test(chips), `back on Today: 🌱 3 new and ↶ Undo +3 (${chips.replace(/\n/g, " ")})`);
    const metBefore = pathScan(true).metToday;
    document.querySelector(".tc-undo").click();
    q = pathNewQuota(pathScan(true));
    ok(q.left === 0 && pathScan(true).metToday === metBefore, "undone: 0 left, the 2 met stay met and counted");
    const chips2 = document.querySelector(".tc-stats").innerText;
    ok(/🌱 \+5 new/.test(chips2) && !/Undo/.test(chips2), "the +5 is offered again, no undo left");
    ok(pathUndoExtra() === 0, "a second undo does nothing");
    // after an undo, the next +5 still starts where the deck left off
    const fu = {}; vocabGroups().forEach(g => g.decks.forEach(d => { const i = unmetIndices(d, 1)[0]; if (i !== undefined) fu[d.id] = i; }));
    pathStartExtra();
    const l2 = learnCards();
    ok(l2.length === PATH.EXTRA_NEW && l2.every(x => fu[x.w.deckId] <= x.w.idx), "a new +5 after the undo: 5 words, none before a deck's first unmet one");
    // "Another round" after it: one of the length you picked
    pathSession.i = pathSession.items.length; renderPathSummary(false);
    await new Promise(res => setTimeout(res, 1200)); // (the button's guard against a stray tap)
    document.getElementById("p-again").click();
    ok(pathSession && pathSession.lenKey === "regular" && !pathSession.extra && S.path.sessionLen === "regular", `another round after a +5: ${pathSession && pathSession.lenKey}, your length`);
    endPathSession(true); backToMenu();
    // pressed twice by mistake: the second undo takes back the other 5
    S.path.extraToday = 0; S.path.extraBtn = 0; S.path.extraUndo = 0; invalidatePathScan(); meetAll();
    pathLearnExtra(); const twice = pathLearnExtra();
    ok(twice === false, "a second +5 while the first's words wait: refused (no double press)");
    const waiting = pathNewQuota(pathScan(true)).left;
    ok(waiting > 0 && pathUndoExtra() === waiting && pathNewQuota(pathScan(true)).left === 0, `undo: the ${waiting} not met yet taken back, nothing left (the 2 extras met earlier still count)`);
    // the "All caught up" screen: "Learn 5 extra" only once today's words are met
    S.path.extraUndo = 0; invalidatePathScan();
    renderPathCaughtUp();
    ok(!/Learn 5 extra/.test(document.getElementById("main-screen").innerText), "All caught up with words still waiting: no Learn 5 extra");
    S.path.extraUndo = 5; invalidatePathScan();
    renderPathCaughtUp();
    ok(/Learn 5 extra/.test(document.getElementById("main-screen").innerText), "…and with today's met: Learn 5 extra");
    // a new day: the counters start again
    S.path.day = "2000-01-01"; pathRollDay();
    ok(!S.path.extraToday && !S.path.extraBtn && !S.path.extraUndo, "the next day: no extras, no undo carried over");
    return { log: __log, fails: __fails };
  });
  say(r, "new words · +5 · undo");
  if (errors.length) { console.log("ERRORS", errors.slice(0, 5)); fails++; }
  await browser.close();
}

// ── 6 · the undo survives a sync ──
{
  const src = fs.readFileSync(new URL("../../js/sync-merge.js", import.meta.url), "utf8");
  const ctx = {}; vm.createContext(ctx); vm.runInContext(src + ";this.mergeStates = mergeStates;", ctx);
  const day = "2026-10-21";
  const st = path => ({ path: { day, sessionLen: "regular", newPerDay: 10, extraToday: 0, spotToday: 0, plan: { day }, ...path }, quests: { day, m: { ok: 30 }, list: [] }, words: {} });
  const pressed = st({ extraToday: 5, extraBtn: 5 }), undone = st({ extraToday: 5, extraBtn: 5, extraUndo: 5 });
  const a = ctx.mergeStates(undone, pressed, { localWins: false }), b = ctx.mergeStates(pressed, undone, { localWins: true });
  const log = [], fl = [];
  const ok = (c, m) => (c ? log : fl).push((c ? "✓ " : "✗ ") + m);
  ok(a.path.extraUndo === 5 && b.path.extraUndo === 5, `the device that undid the +5 keeps its day, whichever side syncs first (${a.path.extraUndo}, ${b.path.extraUndo})`);
  say({ log, fails: fl }, "the undo and sync");
}

// ── 2 · 4 · 5 · the count, Shift+Enter, the Today card ──
{
  const { browser, page, errors } = await openApp({ course: true });
  await page.evaluate(HELP);
  const r = await page.evaluate(() => {
    // 5 · rules due, no lesson, no writing: no line
    migrateCourse();
    const c0 = cxTodayCounts();
    renderHome();
    const line = (document.querySelector(".cx-today") || {}).innerText || "";
    ok(!/to review/.test(document.getElementById("main-screen").innerText), `no "rules to review" line on Today (${line || "none"}; lesson: ${!!c0.lesson})`);
    S.course.sec["s0.neg"] = { st: 3, sh: 100, ok: { "cx.neg1": 100 }, at: addDays(studyToday(), -2) };
    cxIntroduceRules("s0.neg", 3);
    Object.keys(CX.rules).forEach(rid => { const ws = cxRuleWS(rid); if (ws) ws.dueAt = Date.now() - 1000; });
    S.course.dd = { write: 1 };
    invalidatePathScan();
    const c1 = cxTodayCounts();
    ok(c1.due > 0, `rules due today: ${c1.due}`);
    ok(cxTodayHtml() === "" || /📖/.test(cxTodayHtml()), `rules due, writing done: no line about them ("${cxTodayHtml().replace(/<[^>]+>/g, "")}")`);
    S.course.dd = {};
    const c2 = cxTodayCounts();
    ok(!c2.write || /✍️ Writing/.test(cxTodayHtml()) || /📖/.test(cxTodayHtml()), "the writing line only when writing is part of today");
    // 4 · Shift+Enter ×3: 10 a day
    const shift = () => document.dispatchEvent(new KeyboardEvent("keydown", { key: "Enter", shiftKey: true, bubbles: true }));
    const wrongTyped = () => {
      const s = pathSession;
      const j = s.items.findIndex((x, k) => k > s.i && x.t === "typed" && x.w && !x.w.vx && !x.ask);
      if (j < 0) return false;
      s.i = j - 1; pathNext();
      document.getElementById("p-input").value = "zzzz falsch"; pathCheckTyped();
      return s.answered && s.undo;
    };
    S.path.secretOk = { d: studyToday(), n: 9 };
    startPathSession("long", { noBonus: true });
    ok(wrongTyped(), "a wrong typed answer");
    const w0 = pathSession.stats.wrong;
    shift(); shift(); shift();
    ok(pathSession.stats.wrong === w0 - 1 && S.path.secretOk.n === 10, `the 10th of the day: counted right (${S.path.secretOk.n} used)`);
    ok(wrongTyped(), "another wrong typed answer");
    const w1 = pathSession.stats.wrong;
    shift(); shift(); shift();
    ok(pathSession.stats.wrong === w1 && S.path.secretOk.n === 10, "an 11th: refused, the miss stays");
    endPathSession(true);
    return { log: __log, fails: __fails };
  });
  say(r, "the Today card · Shift+Enter");
  if (errors.length) { console.log("ERRORS", errors.slice(0, 5)); fails++; }
  await browser.close();
}

// ── 3 · drag & drop on the course's tiles (phone and desktop) ──
for (const [width, height, tag] of [[390, 844, "phone"], [1280, 900, "desktop"]]) {
  const { browser, page, errors } = await openApp({ course: true, width, height });
  await page.evaluate(HELP);
  // a fresh "nicht in longer sentences" drill: tiles
  const info = await page.evaluate(() => {
    migrateCourse();
    S.course.sec["s0.neg"] = { st: 3, sh: 100, ok: { "cx.neg1": 100 } };
    renderCourseDrill("s0.neg", "d5.8");
    const cur = _cx.list[0], set = cxSet(cur.set);
    const { tiles } = cxTiles(set, cur.item);
    const n = tiles.indexOf("nicht");
    // tap every word but nicht, in order
    tiles.forEach((w, i) => { if (i === n) return; const b = cur.bank.findIndex((t, bi) => t.i === i); document.querySelector(`#cx-bank .gs-tok[data-b="${b}"]`).click(); });
    return { mode: cur.mode, tiles, n, nb: cur.bank.findIndex(t => t.i === n), picked: cur.picked.slice(), listeners: _cxDragL.length };
  });
  const lg = [], fl = [];
  const ok = (c, m) => (c ? lg : fl).push((c ? "✓ " : "✗ ") + m);
  ok(info.mode === "tiles" && info.n > 0, `${tag}: a tiles question with nicht inside the sentence ("${info.tiles.join(" ")}")`);
  ok(info.picked.length === info.tiles.length - 1, "the other words tapped in (taps still work)");
  const drag = async (from, to) => {
    await page.mouse.move(from.x, from.y); await page.mouse.down();
    await page.mouse.move(from.x + 8, from.y + 8, { steps: 2 });
    await page.mouse.move(to.x, to.y, { steps: 8 });
    await page.mouse.up();
  };
  const box = async sel => { const b = await page.locator(sel).first().boundingBox(); return b; };
  const center = b => ({ x: b.x + b.width / 2, y: b.y + b.height / 2 });
  // drag nicht from the bank onto the right edge of the word before its place
  const src = await box(`#cx-bank .gs-tok[data-b="${info.nb}"]`);
  const prev = await box(`#cx-built .gs-tok[data-j="${info.n - 1}"]`);
  await drag(center(src), { x: prev.x + prev.width - 3, y: prev.y + prev.height / 2 });
  let st = await page.evaluate(() => { const cur = _cx.list[_cx.i]; return { words: cur.picked.map(bi => cur.bank[bi].w), carets: document.querySelectorAll(".g-caret").length, ghosts: document.querySelectorAll(".g-ghost").length, listeners: _cxDragL.length }; });
  ok(st.words.join(" ") === info.tiles.join(" "), `nicht dragged into the middle of the sentence: "${st.words.join(" ")}"`);
  ok(!st.carets && !st.ghosts, "no caret or ghost left behind");
  ok(st.listeners === info.listeners, `no listeners pile up between redraws (${info.listeners} → ${st.listeners})`);
  // move the first word to the end, then back
  const first = await box(`#cx-built .gs-tok[data-j="0"]`), lastB = await box(`#cx-built .gs-tok[data-j="${info.tiles.length - 1}"]`);
  await drag(center(first), { x: lastB.x + lastB.width - 3, y: lastB.y + lastB.height / 2 });
  st = await page.evaluate(() => { const cur = _cx.list[_cx.i]; return { words: cur.picked.map(bi => cur.bank[bi].w) }; });
  ok(st.words[st.words.length - 1] === info.tiles[0] && st.words.length === info.tiles.length, `a word moved inside the sentence (to the end: "${st.words.join(" ")}")`);
  // drag it back to the bank
  const moved = await box(`#cx-built .gs-tok[data-j="${info.tiles.length - 1}"]`), bankB = await box("#cx-bank");
  await drag(center(moved), center(bankB));
  st = await page.evaluate(() => { const cur = _cx.list[_cx.i]; return { words: cur.picked.map(bi => cur.bank[bi].w) }; });
  ok(st.words.length === info.tiles.length - 1 && !st.words.includes(info.tiles[0]), "dragged back to the bank: out of the sentence");
  // a drop outside: nothing changes
  const anyB = await box(`#cx-built .gs-tok[data-j="0"]`);
  await drag(center(anyB), { x: 5, y: 5 });
  const st2 = await page.evaluate(() => _cx.list[_cx.i].picked.length);
  ok(st2 === info.tiles.length - 1, "dropped outside: snaps back, nothing changes");
  // put the first word back at the start by dragging, then check
  const fb = await page.evaluate(n0 => _cx.list[_cx.i].bank.findIndex(t => t.i === 0), 0);
  const src2 = await box(`#cx-bank .gs-tok[data-b="${fb}"]`), b0 = await box(`#cx-built .gs-tok[data-j="0"]`);
  await drag(center(src2), { x: b0.x + 3, y: b0.y + b0.height / 2 });
  const res = await page.evaluate(() => { const cur = _cx.list[_cx.i]; const words = cur.picked.map(bi => cur.bank[bi].w); cxCheckCur(); return { words, ok: cur.ok, answered: _cx.answered }; });
  ok(res.answered && res.ok === true, `checked: right ("${res.words.join(" ")}")`);
  // after the answer: no drag
  const any = await box(`#cx-built .gs-tok`);
  const before = await page.evaluate(() => _cx.list[_cx.i].picked.join());
  await drag(center(any), { x: 5, y: 5 });
  ok(await page.evaluate(b => _cx.list[_cx.i].picked.join() === b, before), "answered: the tiles don't move any more");
  // the conversation lines (order): drag a line above another
  await page.waitForTimeout(400); // (a tap right after a drag is the drag's own click)
  const ord = await page.evaluate(() => {
    CX.sets["dz.ord"] = { id: "dz.ord", sec: "s0.neg", t: "order", title: "Lines", how: "—", items: [{ q: "Put the conversation in order.", a: ["Grüezi, wie geht's?", "Gut, danke. Und Ihnen?", "Auch gut, danke."], r: ["neg.kein"] }] };
    const host = document.getElementById("cx-host") || document.getElementById("main-screen");
    cxRun(host, [{ set: "dz.ord", i: 0, item: CX.sets["dz.ord"].items[0] }], { mode: "menu", kind: "practice" });
    const cur = _cx.list[0];
    [1, 2].forEach(i => document.querySelector(`#cx-bank .gs-tok[data-b="${cur.bank.findIndex(t => t.i === i)}"]`).click());
    return { b0: cur.bank.findIndex(t => t.i === 0) };
  });
  const l0 = await box(`#cx-bank .gs-tok[data-b="${ord.b0}"]`), top = await box(`#cx-built .gs-tok[data-j="0"]`);
  await drag(center(l0), { x: top.x + top.width / 2, y: top.y + 4 });
  const ow = await page.evaluate(() => { const cur = _cx.list[_cx.i]; return cur.picked.map(bi => cur.bank[bi].i).join(); });
  ok(ow === "0,1,2", `a conversation line dragged above the others (order ${ow})`);
  await page.evaluate(() => { cxClose(); delete CX.sets["dz.ord"]; });
  ok(await page.evaluate(() => _cxDragL.length) === 0, "closed: its listeners are gone");
  say({ log: lg, fails: fl }, `drag & drop · ${tag}`);
  if (errors.length) { console.log("ERRORS", errors.slice(0, 5)); fails++; }
  await browser.close();
}

console.log(fails ? `t-fixes2: ${fails} FAILED` : "t-fixes2: all passed");
process.exit(fails ? 1 : 0);
