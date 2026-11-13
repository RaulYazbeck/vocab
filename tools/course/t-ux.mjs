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
// ── 4 · a sentence to type: the box grows with it ──
await ev(() => renderCourseDrill("s2.conj3", "dp.cj")); await page.waitForTimeout(200);
const box = await ev(async () => { const t = document.getElementById("cx-input"); const h0 = t.getBoundingClientRect().height;
  t.focus(); t.value = "Bevor ich morgens zur Arbeit gehe, trinke ich immer einen großen Kaffee mit Milch."; t.dispatchEvent(new Event("input"));
  await new Promise(r => setTimeout(r, 50)); const h1 = t.getBoundingClientRect().height;
  return { tag: t.tagName, h0, h1, fits: t.scrollHeight <= t.clientHeight + 2, nl: (t.value = "a\nb", t.dispatchEvent(new Event("input")), t.value) }; });
ok(box.tag === "TEXTAREA" && box.h0 >= 48 && box.h0 < 60 && box.h1 > box.h0 + 15 && box.fits, "a sentence box: one line to start, as tall as the sentence once typed — nothing hidden", box);
ok(box.nl === "a b", "a line break typed is no answer: it becomes a space", box.nl);
await ev(() => { const t = document.getElementById("cx-input"); t.value = ""; }); await page.focus("#cx-input"); await page.keyboard.type("Ich trinke Kaffee"); await page.keyboard.press("Enter"); await page.waitForTimeout(200);
ok(await ev(() => _cx.answered), "Enter still checks");
await ev(() => renderCourseDrill("s1.verbprep", "dvp.case")); await page.waitForTimeout(150);
ok(await ev(() => document.getElementById("cx-input").tagName === "INPUT"), "a short gap keeps the one-line input");
// ── 5 · after a miss, Next in sight — the answer never pushed off the top ──
const nx = await ev(async () => { const wait = ms => new Promise(r => setTimeout(r, ms)); const out = [];
  for (const id of ["d15.6", "d19.7", "dsub.two", "d17.10", "dp.sub"]) { const S0 = cxSet(id); if (!S0) continue; renderCourseDrill(S0.sec, id); await wait(20);
    if (_cx.list[_cx.i].mode !== "typed") cxTypeInstead(); window.scrollTo(0, 0);
    const a = String(_cx.list[_cx.i].item.a[0]); document.getElementById("cx-input").value = a.split(" ").length > 2 ? a.replace(/(\S+) (\S+)([.?!]?)$/, "$2 $1$3") : a + "x"; cxCheckCur(); await wait(900);
    const b = document.getElementById("cx-next").getBoundingClientRect(), f = document.getElementById("cx-fb").getBoundingClientRect();
    out.push({ id, nb: Math.round(b.bottom), ft: Math.round(f.top), H: innerHeight }); }
  return out; });
ok(nx.length >= 4 && nx.every(x => x.nb <= x.H && x.ft >= 0), "after a miss Next is on the screen, the card's top still in sight", nx);
// ── 6 · build-it: no answer given away ──
await ev(() => renderCourseDrill("s1.verbprep", "dvp.build")); await page.waitForTimeout(150);
const bt = await ev(() => { const cur = _cx.list[_cx.i]; if (cur.mode !== "tiles") return null; const chips = [...document.querySelectorAll(".cx-cue .gs-chip")].map(c => c.textContent), toks = cur.bank.map(b => b.w);
  return { chips, w: cur.item.w, toks, ans: cur.item.a[0] }; });
ok(bt && bt.chips.length === bt.w.length && bt.chips.join("|") !== bt.w.join("|") && bt.chips[0] !== bt.w[0], "with tiles the cue comes in another order (in sentence order it was the answer)", bt);
ok(bt && bt.toks.some(t => /^der$/i.test(t)) && bt.toks.some(t => /^den$/i.test(t)), "…and «der» lies beside «den»: the form is yours to choose", bt && bt.toks);
await ev(() => { cxTypeInstead(); }); await page.waitForTimeout(100);
ok(await ev(() => [...document.querySelectorAll(".cx-cue .gs-chip")].map(c => c.textContent).join("|") === _cx.list[_cx.i].item.w.join("|")), "typed, the cue stays as written (the forms are the work there)");
// ── 7 · "Start with Ich weiß nicht, …": written in for you ──
await ev(() => renderCourseDrill("s2.indq", "d29.9")); await page.waitForTimeout(150);
await ev(() => { if (_cx.list[_cx.i].mode !== "typed") cxTypeInstead(); }); await page.waitForTimeout(150);
const ld = await ev(() => { const t = document.getElementById("cx-input"); return { v: t.value, caret: t.selectionStart, len: t.value.length }; });
ok(ld.v === "Ich weiß nicht, " && ld.caret === ld.len, "typed: the start is in the box, the caret after it", ld);
await page.keyboard.type(await ev(() => _cx.list[_cx.i].item.a[0].replace(/^Ich weiß nicht, /, ""))); await page.keyboard.press("Enter"); await page.waitForTimeout(200);
ok(await ev(() => _cx.list[_cx.i].ok === true), "…typing the rest is right");
await ev(() => renderCourseDrill("s2.indq", "d29.9")); await page.waitForTimeout(150);
const lt = await ev(() => { const cur = _cx.list[_cx.i]; if (cur.mode !== "typed") { const t = document.getElementById("cx-input"); if (t) t.value = ""; } cxTypeInstead(); const t = document.getElementById("cx-input"); t.value = cur.item.a[0].replace(/^Ich weiß nicht, /, ""); cxCheckCur(); return cur.ok; });
ok(lt === true, "the start deleted and only the rest typed: right too");
await ev(() => { renderCourseDrill("s2.indq", "d29.9"); const cur = _cx.list[_cx.i]; cur.mode = "tiles"; cur.bank = null; cur.picked = []; cxRender(); }); await page.waitForTimeout(150);
const lp = await ev(() => [...document.querySelectorAll("#cx-built .gs-tok")].map(b => b.textContent).join(" "));
ok(/^ich weiß nicht$/i.test(lp), "with tiles: its words already placed", lp);
let fail = 0; res.forEach(([c2, m]) => { console.log((c2 ? "✓ " : "✗ ") + m); if (!c2) fail++; });
if (errors.length) { console.log("page errors:", errors.slice(0, 3)); fail++; }
console.log(fail ? `t-ux: ${fail} FAILED` : "t-ux: all passed");
await browser.close(); process.exit(fail ? 1 : 0);
