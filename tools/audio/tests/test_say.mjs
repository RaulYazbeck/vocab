// Hearing German inside the exercises (German app): the whole right
// sentence plays once a question is answered — never before — and every
// revealed word or sentence plays again on a tap (data-tap-say); a
// selection inside a sheet or an answered question's feedback is said too.
// The course drill, the sheet quiz, the games' lesson card, Today; the
// principal-part hints shortened while a card asks; the French app untouched.
import { launch, BASE, OUT } from "./common.mjs";
const B = BASE;
let pass = 0, fail = 0;
const ok = (c, msg, extra = "") => { if (c) { pass++; console.log("  ✓", msg); } else { fail++; console.log("  ✗ FAIL:", msg, extra); } };
const browser = await launch();
const ctx = await browser.newContext({ viewport: { width: 390, height: 844 }, serviceWorkers: "block", deviceScaleFactor: 1 });
const page = await ctx.newPage(); const errs = []; page.on("pageerror", e => errs.push(e.message));
await page.addInitScript(() => { window.__tts = []; speechSynthesis.speak = u => window.__tts.push(u.text); });
await page.goto(`${B}/de/index.html`);
await page.waitForFunction(() => typeof AUDIO !== "undefined" && AUDIO.ready && AUDIO.remote && typeof cxRun === "function", null, { timeout: 20000 });
await page.evaluate(() => { const o = document.getElementById("audio-offer"); if (o) o.remove(); });
await page.evaluate(() => audioDownload(["w", "s"]));
// Every speak() call, in order (the real one still runs: recording or phone voice).
await page.evaluate(() => { window.__said = []; const o = window.speak; window.speak = (t, r, opts) => { window.__said.push(t); return o(t, r, opts); }; MISTAKE_HOLD_MS; });
const said = () => page.evaluate(() => window.__said.slice());
const clear = () => page.evaluate(() => { window.__said = []; });
const taps = sel => page.$$eval(`${sel} [data-tap-say]`, els => els.map(e => e.dataset.tapSay));

console.log("1. a course drill: a pick item");
await page.evaluate(() => {
  showGameScreen();
  const host = document.getElementById("game-screen") || document.body;
  const set = cxSet("d5.6"), item = set.items[0];
  cxRun(host, [{ set: set.id, item, i: 0 }], { mode: "menu", kind: "practice", sec: set.sec, title: "Test" });
});
await page.waitForSelector("#cx-run .gs-opt");
await page.waitForTimeout(400);
ok((await taps("#cx-run")).length === 0, "nothing to tap while the question is asked");
ok((await said()).length === 0, "nothing said before the answer");
const wrong = await page.evaluate(() => { const it = _cx.list[0].item, o = cxSet("d5.6").o; return o.findIndex(x => x !== it.a[0]); });
await page.evaluate(i => cxPick(i), wrong);
await page.waitForTimeout(500);
ok((await said()).includes("Heute habe ich keine Zeit für Sport."), "after a miss: the whole right sentence is said", JSON.stringify(await said()));
const t1 = await taps("#cx-fb");
ok(t1.includes("Heute habe ich keine Zeit für Sport."), "the miss card's answer / sentence plays on a tap", JSON.stringify(t1));
ok(await page.evaluate(() => document.getElementById("cx-fb").hasAttribute("data-say-zone")), "the answered feedback is a selection zone");
await clear();
await page.click("#cx-fb [data-tap-say]");
ok((await said()).length === 1, "a tap says it (once)");
ok(await page.evaluate(() => audioMissCount()) >= 0, "voice log reachable");

console.log("2. a gap typed: nothing before Check; the gap filled in after");
await clear();
await page.evaluate(() => {
  const host = document.getElementById("game-screen") || document.body;
  const set = cxSet("d5.10"), item = set.items[0];
  cxRun(host, [{ set: set.id, item, i: 0 }], { mode: "menu", kind: "practice", sec: set.sec, title: "Test" });
});
await page.waitForSelector("#cx-input");
const item2 = await page.evaluate(() => ({ q: _cx.list[0].item.q, a: _cx.list[0].item.a[0], say: cxSayText(_cx.list[0].item, cxSet("d5.10")) }));
await page.fill("#cx-input", item2.a.slice(0, -1));
await page.waitForTimeout(300);
ok((await said()).length === 0 && (await taps("#cx-run")).length === 0, "typing: nothing said or tappable");
await page.fill("#cx-input", item2.a);
await page.keyboard.press("Enter");
await page.waitForTimeout(500);
ok(!/___/.test(item2.say) && item2.say.includes(item2.a), `the sentence said is whole: «${item2.say}»`);
ok((await said()).includes(item2.say), "right: the sentence is said after Check");
ok((await taps("#cx-fb")).includes(item2.say), "and shown, to tap");
await page.evaluate(() => cxNext());
ok(await page.evaluate(() => !!document.querySelector("#cx-run .gs-result")), "Next goes on (the result)");

console.log("3. the sheet quiz");
await clear();
await page.evaluate(() => {
  const host = document.getElementById("game-screen") || document.body;
  gsOpen(host, "cx.neg1", { mode: "menu" });
  _gs.step = _gs.steps.length; gsQuizStart(); gsRender();
});
await page.waitForSelector("#gs-step");
const q3 = await page.evaluate(() => { const Q = _gs.quiz.list[0].q; return { k: Q.k, say: cxQuizSayText(Q) }; });
ok((await taps("#gs-step")).length === 0, "nothing to tap while asked");
await page.evaluate(() => {
  const q = _gs.quiz, Q = q.list[0].q;
  if (Q.k === "pick" || Q.k === "why") gsQuizPick((Q.a + 1) % Q.o.length);
  else if (Q.k === "type") { document.getElementById("gs-input").value = "xyz"; gsQuizCheck(); }
  else { q.list[0].picked = Q.a.map((_, i) => i).reverse(); gsQuizCheck(); }
});
await page.waitForTimeout(500);
if (q3.say) {
  ok((await said()).includes(q3.say), `a quiz answer says its sentence: «${q3.say}»`);
  ok((await taps("#gs-qfb")).includes(q3.say), "and shows it to tap");
} else ok((await said()).length === 0, `an English quiz question (${q3.k}) says nothing`);

console.log("3b. everything a quiz or a drill says has its recording in the pack");
// Every verb sheet's quiz drawn 6 times (its questions come from your verbs:
// another verb, another person each time), every course sheet's quiz, and
// every course drill item's sentence for each accepted answer.
const gaps = await page.evaluate(() => {
  const out = new Set();
  const chk = t => { if (t && !audioFind(t)) out.add(t); };
  GS_SHEETS.forEach(sh => { for (let i = 0; i < 6; i++) gqSheetQuiz(sh).forEach(Q => chk(cxQuizSayText(Q))); });
  Object.values(CX.sheets).forEach(sh => (sh.quiz || []).forEach(Q => chk(cxQuizSayText(Q))));
  Object.values(CX.sets).forEach(set => cxSayItems(set).forEach(it => cxSayAll(it, set).forEach(chk)));
  return [...out];
});
ok(gaps.length === 0, `nothing said without a recording (${gaps.length})`, gaps.slice(0, 8).join(" | "));

console.log("4. a sheet: examples, table sentences, a selection");
await clear();
await page.evaluate(() => { const host = document.getElementById("game-screen") || document.body; gsOpen(host, "cx.neg1", { mode: "menu" }); _gs.step = _gs.steps.findIndex(s => s.id === "table"); gsRender(); });
const cells = await taps("#gs-step");
ok(cells.includes("Heute arbeite ich nicht."), "a German sentence in a table cell plays on a tap", JSON.stringify(cells.slice(0, 3)));
ok(await page.evaluate(() => document.getElementById("gs-step").hasAttribute("data-say-zone")), "a sheet's reading is a selection zone");
const misses0 = await page.evaluate(() => audioMissCount());
await page.evaluate(() => {
  const el = [...document.querySelectorAll("#gs-step th[scope=row]")][0];
  const r = document.createRange(); r.selectNodeContents(el); const s = getSelection(); s.removeAllRanges(); s.addRange(r);
});
await page.waitForTimeout(1100);
const sel = await said();
ok(sel.length === 1, `a selection is said once (${JSON.stringify(sel)})`);
ok(await page.evaluate(() => audioMissCount()) === misses0, "a selection without a recording isn't noted in the voice log");
await page.evaluate(() => getSelection().removeAllRanges());

console.log("5. the games' lesson card, Today's hint");
const lesson = await page.evaluate(() => { const w = ALL_GROUPS[0].decks[0].words.find(x => (x.examples || []).length); return { html: wordLessonHtml(w), form: gameForm(w), ex: w.examples[0].de }; });
ok(lesson.html.includes(`data-tap-say="${lesson.form}"`) || lesson.html.includes("data-tap-say="), "the word on a miss card plays on a tap");
ok(lesson.html.includes("data-tap-say") && lesson.html.split("data-tap-say").length === 3, "the word and its example both");
const hint = await page.evaluate(() => { let w = null; ALL_GROUPS.forEach(g => g.decks.forEach(d => d.words.forEach(x => { if (x.de === "trennen") w = x; }))); return w ? { full: w.hint, ask: askHintText(w), lesson: wordLessonHtml(w) } : null; });
ok(hint && !/trennte|getrennt/.test(hint.ask), `principal parts hidden while asked (${hint && hint.ask})`);
ok(hint && hint.lesson.includes(hint.full), "the lesson card after a miss shows the whole hint");
ok(hint && /trennte/.test(hint.full), "the deck's hint itself is unchanged");
await page.evaluate(() => { window.__said = []; document.body.insertAdjacentHTML("beforeend", `<div id="tt" style="position:fixed;top:0;left:0;z-index:99999;background:#fff;padding:20px"><div id="tt-card"><span${sayTapAttrs("der Vater")}>der Vater</span></div></div>`); });
let moved = false;
await page.evaluate(() => document.getElementById("tt-card").addEventListener("click", () => { window.__moved = true; }));
await page.click("#tt [data-tap-say]");
moved = await page.evaluate(() => !!window.__moved);
ok((await said()).includes("der Vater") && !moved, "a tap says it and never also moves a game on");
ok(errs.length === 0, "no page errors (German)", errs.join(" | "));

console.log("6. the French app is left as it was");
const fr = await ctx.newPage(); const ferrs = []; fr.on("pageerror", e => ferrs.push(e.message));
await fr.goto(`${B}/fr/index.html`);
await fr.waitForFunction(() => typeof wordLessonHtml === "function" && typeof ALL_GROUPS !== "undefined", null, { timeout: 20000 });
const frHtml = await fr.evaluate(() => { const w = ALL_GROUPS[0].decks[0].words[0]; return wordLessonHtml(w) + sayTapAttrs("bonjour") + sayZoneAttr() + askHintText({ fr: "manger", hint: "verbe · a mangé" }); });
ok(!/data-tap-say|data-say-zone/.test(frHtml), "no tap-to-hear in the French app");
ok(ferrs.length === 0, "no page errors (French)", ferrs.join(" | "));
await browser.close();
console.log(`\n${pass} passed, ${fail} failed`);
process.exit(fail ? 1 : 0);
