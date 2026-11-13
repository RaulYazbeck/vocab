// Exercise comfort (13 Nov 2026): more typed than was asked is right; a word
// to put into a sentence is placed, not the sentence written again.
//   node t-ux.mjs      (serve the repo root on :8765 first)
import { openApp } from "../verb-track/browser.mjs";
const { browser, page, errors } = await openApp({ course: true, width: 390, height: 844 });
const res = []; const ok = (c, m, x) => res.push([!!c, m + (c ? "" : " — " + JSON.stringify(x === undefined ? "" : x))]);
const ev = (f, a) => page.evaluate(f, a);
// ── 1 · the whole prompt typed back, in the verb sheets' quizzes ──
const v = await ev(() => {
  const bad = []; let n = 0;
  (GS_SHEETS || []).forEach(sh => (sh.quiz || []).forEach(Q => {
    if (Q.k !== "type" || Q.g || !/___/.test(Q.q)) return;
    const full = Q.q.replace(/\*\*/g, "").replace(/\([^)]*\)/g, " ").replace("___", Q.a[0]).replace(/\s+/g, " ").trim();
    if (/___/.test(full)) return; n++;
    if (!gsQuizGrade(full, Q).ok || !gsQuizGrade(/[.!?]$/.test(full) ? full : full + ".", Q).ok) bad.push(sh.id + ": " + full);
    if (gsQuizGrade(full.replace(Q.a[0], Q.a[0] + "x"), Q).ok) bad.push("wrong accepted: " + full);
  }));
  const g = (val, q, acc) => vxGapTries(val, q);
  return { n, bad, t1: g("er wohnt", "er ___ (wohnen)"), t2: g("Der Film fängt um acht an.", "Der Film ___ um acht ___ (anfangen)"), t3: g("wohnt", "er ___ (wohnen)"), t4: g("Wir haben gestern gespielt", "Wir ___ gestern ___ (spielen)") };
});
ok(v.n >= 60 && !v.bad.length, `verb sheets: the whole prompt typed back is right in all ${v.n} typed questions, a wrong form in it isn't`, v.bad.slice(0, 4));
ok(v.t1[0] === "wohnt" && v.t2[0] === "fängt an" && !v.t3.length && v.t4[0] === "haben gespielt", "the gap's words are taken out of what was typed (one gap, two gaps)", v);
// ── 2 · the course: typed more than the gap ──
const c = await ev(() => {
  const chk = (set, q, t) => { const S0 = cxSet(set), it = S0.items.find(x => x.q === q); return it ? cxCheck(it, t, cxSection(S0.sec)) : null; };
  const arrow = cxSet("d5.10").items[0];
  return {
    arrow: [cxCheck(arrow, arrow.q.split("→")[1].replace("___", arrow.a[0]).trim(), cxSection("s0.neg")).ok, cxCheck(arrow, arrow.a[0], cxSection("s0.neg")).ok, cxCheck(arrow, arrow.q.split("→")[1].replace("___", "nicht").trim(), cxSection("s0.neg")).ok],
    dash: chk("dwd.wo", "(auf) ___ wartest du? — Auf das Tram.", "Worauf wartest du?"),
    part: chk("dvp.case", "(der Bus) Wir warten auf ___.", "auf den Bus"), part2: chk("dvp.case", "(der Bus) Wir warten auf ___.", "warten auf den Bus"),
    partBad: chk("dvp.case", "(der Bus) Wir warten auf ___.", "auf dem Bus"), wholeBad: chk("dvp.case", "(der Bus) Wir warten auf ___.", "Wir warten auf dem Bus."),
    other: chk("dvp.case", "(der Bus) Wir warten auf ___.", "Wir fahren mit dem Bus."),
  };
});
ok(c.arrow[0] && c.arrow[1] && !c.arrow[2], "«A. → B with a gap»: the sentence after the arrow typed whole is right (and a wrong word in it isn't)", c.arrow);
ok(c.dash && c.dash.ok, "«___ wartest du? — Auf das Tram.»: the question typed whole is right", c.dash);
ok(c.part.ok && c.part2.ok, "some of the sentence typed around the gap's words: right («auf den Bus», «warten auf den Bus»)", [c.part, c.part2]);
ok(!c.partBad.ok && !c.wholeBad.ok && c.wholeBad.rule === "vp.acc" && /Wir warten auf den Bus/.test(c.wholeBad.right), "…a slip in it is still the slip, shown in the whole sentence", [c.partBad, c.wholeBad]);
ok(!c.other.ok, "another sentence altogether stays wrong");
// ── 3 · a word to put in: placed ──
await ev(() => renderCourseDrill("s0.neg", "d5.5")); await page.waitForTimeout(200);
let st = await ev(() => { const cur = _cx.list[_cx.i]; const pl = cxPlace(cur.item, cxSet(cur.set)); return { mode: cur.mode, slots: document.querySelectorAll(".cx-slot").length, words: pl.words.length, right: pl.slots[0], input: !!document.getElementById("cx-input"), tok: !!document.getElementById("cx-ptok") }; });
ok(st.mode === "place" && st.slots === st.words + 1 && !st.input && st.tok, "«Say it with nicht»: the sentence with a slot at every place, the word waiting — nothing to type", st);
await page.click("#cx-check"); await page.waitForTimeout(100);
ok(await ev(() => !_cx.answered), "Check with nothing placed: not graded");
await page.click('.cx-slot[data-slot="0"]'); await page.waitForTimeout(100);
ok(await ev(() => _cx.list[_cx.i].at === 0 && !!document.getElementById("cx-placed") && !document.getElementById("cx-ptok")), "a tap on a slot puts it there");
await page.click("#cx-placed"); await page.waitForTimeout(100);
ok(await ev(() => _cx.list[_cx.i].at == null && !!document.getElementById("cx-ptok")), "a tap on the placed word takes it out again");
// drag it to the right place
const from = await page.locator("#cx-ptok").boundingBox(), to = await page.locator(`.cx-slot[data-slot="${st.right}"]`).boundingBox();
await page.mouse.move(from.x + from.width / 2, from.y + from.height / 2); await page.mouse.down();
await page.mouse.move(to.x + 40, to.y + to.height / 2, { steps: 6 }); await page.mouse.move(to.x + to.width / 2, to.y + to.height / 2, { steps: 6 }); await page.mouse.up(); await page.waitForTimeout(450); // (a click right after a drop is swallowed, on purpose)
ok(await ev(r => _cx.list[_cx.i].at === r, st.right), "dragged to its place", await ev(() => _cx.list[_cx.i].at));
const before = await ev(() => _cx.firstRight); await page.click("#cx-check"); await page.waitForTimeout(250);
ok(await ev(b => _cx.firstRight === b + 1, before), "…and right");
await ev(() => { if (_cx.answered) cxNext(); }); await page.waitForTimeout(150);
// the keyboard, and a wrong place: the usual miss card
await page.keyboard.press("ArrowRight"); await page.waitForTimeout(60);
ok(await ev(() => _cx.list[_cx.i].at === 0), "→ on a keyboard puts it in the first place");
await page.keyboard.press("ArrowLeft"); await page.keyboard.press("ArrowLeft");
ok(await ev(() => _cx.list[_cx.i].at === 0), "← stops at the start");
await page.keyboard.press("Enter"); await page.waitForTimeout(250);
const miss = await ev(() => ({ answered: _cx.answered, fb: document.getElementById("cx-fb").innerText, typo: !!_cx.list[_cx.i].undo }));
ok(miss.answered && /Not quite/.test(miss.fb) && /nicht/.test(miss.fb) && !miss.typo, "a wrong place: the miss card with the answer and why — and no «my typo» (nothing was typed)", miss);
// (Next is held for a moment after a miss, against a stray tap)
await page.waitForFunction(() => { const b = document.getElementById("cx-next"); return b && !b.classList.contains("mistake-hold"); }, null, { timeout: 8000 }).catch(() => {});
await page.click("#cx-next"); await page.waitForTimeout(250);
await page.click(".cx-typeit", { timeout: 3000 }); await page.waitForTimeout(100);
ok(await ev(() => _cx.list[_cx.i].mode === "typed" && !!document.getElementById("cx-input")), "«type it instead» is still there");
// which items are placed — and which never
const pl = await ev(() => {
  const out = { n: 0, sets: {}, never: [] };
  Object.values(CX.sets).forEach(s => (s.items || []).forEach(it => { if (cxItemKind(s, it) !== "transform") return; const p = cxPlace(it, s); if (!p) return; out.n++; out.sets[s.id] = (out.sets[s.id] || 0) + 1;
    p.slots.forEach(a => { if (!cxCheck(it, cxPlaceText(p, a), cxSection(s.sec)).ok) out.never.push("right slot refused " + s.id); }); }));
  ["d5.4", "ddat.o", "dgeni.spoken"].forEach(id => { if (cxSet(id).items.some(it => cxPlace(it, cxSet(id)))) out.never.push(id + " placed"); });
  return out;
});
ok(pl.n >= 55 && !pl.never.length && pl.sets["d5.5"] && pl.sets["d28.2"] && pl.sets["d23.3"] && pl.sets["dadv.place"], `${pl.n} items are placed (nicht, sehr, oft …); never a form to work out (kein → keinen, meine → meiner)`, pl);
// phone: nothing sticks out, the slots are big enough to tap
await ev(() => renderCourseDrill("s2.adv", "dadv.place")); await page.waitForTimeout(200);
const geo = await ev(() => { const W = document.documentElement.clientWidth; return { out: [...document.querySelectorAll("#cx-run *")].filter(e => e.getBoundingClientRect().right > W + 1).length, h: Math.min(...[...document.querySelectorAll(".cx-slot")].map(s => s.getBoundingClientRect().height)) }; });
ok(geo.out === 0 && geo.h >= 40, "on a phone: nothing sticks out, every slot is a finger tall", geo);
let fail = 0; res.forEach(([c2, m]) => { console.log((c2 ? "✓ " : "✗ ") + m); if (!c2) fail++; });
if (errors.length) { console.log("page errors:", errors.slice(0, 3)); fail++; }
console.log(fail ? `t-ux: ${fail} FAILED` : "t-ux: all passed");
await browser.close(); process.exit(fail ? 1 : 0);
