// Flows around the verb track, in the real app.
import { openApp } from "./browser.mjs";
const { browser, page, errors } = await openApp();
let pass = 0, fail = 0; const ok = (c, m, x = "") => { if (c) pass++; else { fail++; console.log("  ✗", m, x); } };
const r = await page.evaluate(() => {
  const out = {};
  // 1 · games before the switch: level tenses (old behaviour)
  out.before = { thread: vlLevelTenses(), conj: conjLevelTenses(), pace: pathPace() };
  out.todayOffer = vxTodayHtml().includes("New verb system");
  // 2 · the preview changes nothing
  const snap = JSON.stringify(S);
  vxPreview();
  out.previewPure = JSON.stringify(S) === snap;
  // 3 · switch on
  vxSwitchOn();
  out.after = { thread: vlLevelTenses(), conj: conjLevelTenses() };
  out.level = currentLevel(); out.exp = S.exp;
  // 4 · a game round: Slots typed forms → credit + coverage
  const ctx = {};
  const x = vxVerb("fahren");
  const before = (S.verb.cov.fahren || 0);
  vxGameHit(ctx, "fahren", "pr", "du", true, "recall");
  vxGameHit(ctx, "machen", "pf", "ich", false, "recall");
  const pfge = S.words["vx_r:pf-ge"];
  const pfgeFl0 = pfge && pfge.fl;
  const res = vxApplyGameHits(ctx);
  out.game = { covBefore: before, covAfter: S.verb.cov.fahren, flagged: res.flagged, pfgeFl: [pfgeFl0, S.words["vx_r:pf-ge"] && S.words["vx_r:pf-ge"].fl] };
  // 5 · a conjugation card typed right fills the ledger
  const card = vxVerbs().flatMap(x => (x.v.refs || []).map(r => ({ x, r }))).find(o => o.r.deckId === "a1_conjugation" && o.r.tense === "pr");
  delete S.verb.cov[card.x.inf];
  applyCorrect(getWS(card.r.deckId, card.r.idx), { quiet: true, kind: "recall", w: { deckId: card.r.deckId, idx: card.r.idx } });
  out.card = { inf: card.x.inf, cov: vxCovHas(card.x.inf, "pr") };
  // 6 · reports
  const rep = buildUsageReport(0);
  out.report = rep.split("\n").filter(l => /^Verb/.test(l));
  const ll = buildLearningReport();
  out.learn = ll.includes("## VERB TRACK") && ll.includes("Verb ledger");
  // 7 · achievements ladders exist, levels quiet
  out.ach = ACHIEVEMENTS.filter(a => a.id.startsWith("vx_")).map(a => [a.id, a.tiers.length, S.ach[a.id] || 0]);
  // 8 · menu row and Today line
  out.menu = settingsMenuHtml().includes("Grammar");
  out.todayLesson = vxTodayHtml();
  // 9 · gated deck: a2_praeteritum never in new words before Präteritum I
  out.gated = vxGated("a2_praeteritum");
  const nw = planNewWords(200).flat().map(w => w.deckId);
  out.gatedPicked = nw.filter(d => d === "a2_praeteritum").length;
  out.retiredPicked = planNewWords(400).flat().filter(w => vxRetired(w.deckId, w.idx)).length;
  // 10 · the Partizip II retired card mirrors its item
  const retKey = [...vxRetireMap().entries()].find(([k, c]) => c.item && c.item.startsWith("p2:"));
  const [rk, rc] = retKey;
  const iws = getWS("vx", rc.item); iws.st = 5; iws.sAt = Date.now(); iws.pk = 5;
  vxMirror();
  out.mirror = { key: rk, st: S.words[rk] && S.words[rk].st, rt: S.words[rk] && S.words[rk].rt, inPool: buildGamePool(null).some(w => wordKey(w) === rk) };
  // 11 · switch off: verb items and mirrors go, cards stay
  const wordsBefore = Object.keys(S.words).filter(k => !k.startsWith("vx_") && !S.words[k].rt).length;
  vxSwitchOff();
  out.off = { vx: Object.keys(S.words).filter(k => k.startsWith("vx_")).length, rt: Object.values(S.words).filter(w => w.rt).length,
    words: Object.keys(S.words).length === wordsBefore, thread: vlLevelTenses(), pace: pathPace() };
  return out;
});
ok(r.before.thread.length >= 2 && (process.env.REAL_STATE || r.before.thread.includes("k2")), "before the switch the games use the level's tenses", r.before.thread);
ok(r.todayOffer, "Today offers the switch");
ok(r.previewPure, "the preview leaves the state untouched");
ok(JSON.stringify(r.after.thread) === JSON.stringify(["pf", "pr"]) && !r.after.conj.includes("k2") && !r.after.conj.includes("im"), "after: only taught tenses in Thread and Slots", JSON.stringify(r.after));
ok(r.level >= 19, "level unchanged", r.level);
ok((r.game.covAfter & 1) === 1, "a typed game form fills the ledger", JSON.stringify(r.game));
ok(r.game.flagged >= 1 || r.game.pfgeFl[1], "a typed game miss flags its rule", JSON.stringify(r.game));
ok(r.card.cov, "a conjugation card answered right fills the ledger", JSON.stringify(r.card));
ok(r.report.length >= 2, "usage report has the Verbs lines", JSON.stringify(r.report));
ok(r.learn, "learning log has the verb track");
ok(r.ach.length === 2, "two Grammar ladders", JSON.stringify(r.ach));
ok(r.menu, "☰ has Grammar");
ok(/Imperativ/.test(r.todayLesson), "Today names the lesson", r.todayLesson);
ok(r.gated && r.gatedPicked === 0, "a gated grammar deck is never picked", JSON.stringify([r.gated, r.gatedPicked]));
ok(r.retiredPicked === 0, "a retired card is never a new word");
ok(r.mirror.st === 5 && r.mirror.rt === 1 && !r.mirror.inPool, "a retired card mirrors its item, out of the games", JSON.stringify(r.mirror));
ok(r.off.vx === 0 && r.off.rt === 0 && r.off.words, "switching off removes items and mirrors only", JSON.stringify(r.off));
ok(r.off.thread.join() === r.before.thread.join() && r.off.pace === r.before.pace, "switched off: back to the old behaviour", JSON.stringify([r.before, r.off]));
console.log(r.report.join("\n"));
console.log(`flows: ${pass} passed, ${fail} failed`, errors.length ? errors : "");
await browser.close();
process.exit(fail ? 1 : 0);
