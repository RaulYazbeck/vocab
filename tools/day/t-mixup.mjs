// Mix-ups (js/path.js MIX-UPS, js/mode-path.js pathMixMiss — 28 Nov 2026):
// typing another word I know for the one asked makes the two a pair.
//
// Checked, through Today's own grading: the pair on both words, the games'
// trap map too; the feedback shows the two side by side; the other word
// follows in this session's repair round, right after the missed one;
// "my typo" takes the pair back; the next session brings the partner a few
// cards after its word (not in a focus session, never twice); a pair is
// sorted once both were right on 2 separate days (and says so); a word not
// met yet makes no pair; a word keeps 3 pairs at most; the usage report
// and the learning log show them. Serve the repo (node run-suite.mjs t-mixup.mjs).
import { openApp } from "../verb-track/browser.mjs";
const { browser, page, errors } = await openApp();
let pass = 0, fail = 0;
const ok = (c, m, x = "") => { if (c) { pass++; console.log("  ✓", m); } else { fail++; console.log("  ✗", m, x); } };

const r = await page.evaluate(() => {
  const out = {};
  window.mistakeHeld = () => false; window.holdAfterMistake = () => {};
  // two met words, far apart in spelling, not verbs, not Anki
  const met = [];
  ALL_GROUPS.forEach(g => g.decks.forEach(d => { if (typeof isAnkiDeck === "function" && isAnkiDeck(d.id)) return; d.words.forEach((x, i) => {
    const ws = S.words[d.id + "_" + i]; if (ws && ws.st >= 2 && !ws.rt && /^[a-zäöüß]+$/i.test(x[WORD_KEY]) && x[WORD_KEY].length >= 5) met.push(pathWord(d.id, i)); }); }));
  const pick = n => met.filter((w, i) => i % 37 === n)[0];
  const A = pick(1), B = met.find(w => w[WORD_KEY][0] !== A[WORD_KEY][0] && !isNearMiss(normalize(w[WORD_KEY]), [normalize(A[WORD_KEY])]));
  const kA = wordKey(A), kB = wordKey(B);
  out.words = [A[WORD_KEY], B[WORD_KEY]];
  // ── a Today session: A asked, B typed ──
  startPathSession("regular");
  const s = pathSession;
  const ask = (w, val, extra = {}) => { s.cur = { t: "typed", w, ...extra }; s.answered = false; s.shownAt = Date.now(); pathGradeTyped(val, val === w[WORD_KEY] ? true : false); };
  ask(A, B[WORD_KEY]);
  out.pair = { a: !!(S.words[kA].mix && S.words[kA].mix[kB]), b: !!(S.words[kB].mix && S.words[kB].mix[kA]), games: confusedWith(A).has(kB) };
  const fb = document.getElementById("p-fb");
  out.fb = { mix: !!fb.querySelector(".p-mix"), text: (fb.querySelector(".p-mix") || {}).textContent || "", lead: (fb.querySelector(".p-mix-lead") || {}).textContent || "" };
  out.mixq = (s.mixq || []).map(x => wordKey(x.w));
  out.usage = [...(usageDay().mixp || [])];
  out.mixlog = _usageLog().filter(e => e.e === "mix").map(e => e.ev + " " + e.a + "|" + e.b);
  // ── the repair round: A, then B right after ──
  const start = s.items.length;
  s.cur = { t: "repairOffer", list: pathRepairList() };
  pathRepair(true);
  const rep = s.items.slice(start).map(x => ({ k: wordKey(x.w), mix: x.mix || "", practice: !!x.practice }));
  out.repair = rep;
  endPathSession(true);
  // ── "my typo" takes a pair back ──
  const C = met.find(w => ![kA, kB].includes(wordKey(w)) && w[WORD_KEY][0] !== B[WORD_KEY][0]), D = met.find(w => ![kA, kB, wordKey(C)].includes(wordKey(w)) && w[WORD_KEY][0] !== C[WORD_KEY][0] && !isNearMiss(normalize(w[WORD_KEY]), [normalize(C[WORD_KEY])]));
  startPathSession("regular");
  const s2 = pathSession;
  s2.cur = { t: "typed", w: C }; s2.answered = false; s2.shownAt = Date.now();
  pathGradeTyped(D[WORD_KEY], false);
  out.before = !!(S.words[wordKey(C)].mix && S.words[wordKey(D)].mix);
  pathSecretOk();
  out.typo = { c: !!(S.words[wordKey(C)].mix && S.words[wordKey(C)].mix[wordKey(D)]), d: !!(S.words[wordKey(D)].mix && S.words[wordKey(D)].mix[wordKey(C)]), q: (s2.mixq || []).length };
  endPathSession(true);
  // ── a later session: E due (a pair with F, neither answered today), F comes a few cards after it ──
  const used = new Set([kA, kB, wordKey(C), wordKey(D)]);
  const E = met.filter(w => !used.has(wordKey(w)))[20], F = met.filter(w => !used.has(wordKey(w)) && w[WORD_KEY][0] !== E[WORD_KEY][0])[40];
  const kE = wordKey(E), kF = wordKey(F);
  mixNote(E, kF);
  const now = Date.now();
  Object.values(S.words).forEach(ws => { if (ws && ws.st && !ws.rt) { ws.dueAt = now + 30 * 864e5; delete ws.lrn; delete ws.rp; delete ws.fl; } });
  [kE].forEach(k => { const ws = S.words[k]; ws.dueAt = now - 864e5; delete ws.lrn; delete ws.rp; delete ws.fl; ws.lastAnsweredAt = now - 3 * 864e5; ws.sAt = now - 3 * 864e5; });
  // (room for word reviews: no verb items, no new words in this one)
  const keepVx = window.vxOn; window.vxOn = () => false; S.path.newPerDay = 0; if (S.path.plan) S.path.plan.pace = 0;
  invalidatePathScan();
  const q = buildPathQueue("regular").items;
  const iA = q.findIndex(x => x.w && wordKey(x.w) === kE), iB = q.findIndex(x => x.w && wordKey(x.w) === kF);
  out.next = { iA, iB, mix: iB >= 0 ? q[iB].mix : "", twice: q.filter(x => x.w && wordKey(x.w) === kF).length, n: q.length };
  const rc = pathReviewCandidates(Date.now());
  out.dbg = { kE, due: isDue(S.words[kE]), inFix: rc.fix.some(o => o.d.id + "_" + o.i === kE), inDue: rc.due.some(o => o.d.id + "_" + o.i === kE), nDue: rc.due.length, nFix: rc.fix.length, types: [...new Set(q.map(x => x.t))].join(","), words: q.filter(x => x.w && !x.w.vx).length };
  const qf = buildPathQueue("regular", { focus: "dues" }).items;
  out.focus = qf.filter(x => x.mix).length;
  window.vxOn = keepVx;
  // ── sorted: both right on two separate days ──
  S.words[kA].mix[kB].d = ["2026-01-05"]; S.words[kB].mix[kA].d = ["2026-01-05"];
  mixRight(A);
  out.halfway = !!S.words[kA].mix; // A right today, B not yet: still open
  startPathSession("regular");
  const s3 = pathSession;
  s3.cur = { t: "typed", w: B }; s3.answered = false; s3.shownAt = Date.now();
  pathGradeTyped(B[WORD_KEY], true);
  out.sorted = { a: !!S.words[kA].mix, b: !!S.words[kB].mix, chip: /Sorted/.test(document.getElementById("p-fb").textContent) };
  endPathSession(true);
  // ── a word not met yet: no pair ──
  let unmet = null;
  ALL_GROUPS.forEach(g => g.decks.forEach(d => d.words.forEach((x, i) => { if (!unmet && !S.words[d.id + "_" + i] && /^[a-zäöüß]{6,}$/i.test(x[WORD_KEY]) && !(typeof isAnkiDeck === "function" && isAnkiDeck(d.id))) unmet = d.id + "_" + i; })));
  out.unmet = mixNote(A, unmet);
  // ── 3 pairs at most a word ──
  const many = met.filter(w => ![kA, kB].includes(wordKey(w))).slice(10, 15);
  many.forEach(o => mixNote(A, wordKey(o)));
  out.cap = Object.keys(S.words[kA].mix || {}).length;
  out.capLast = Object.keys(S.words[kA].mix || {}).includes(wordKey(many[4]));
  // ── the logs ──
  out.report = buildUsageReport(0).split("\n").find(l => l.startsWith("Mix-up pairs")) || "";
  out.learn = typeof buildLearningLog === "function" ? /Being practised as pairs in Today now/.test(buildLearningLog()) : null;
  return out;
});
console.log("    words:", r.words.join(" / "));
ok(r.pair.a && r.pair.b, "typing the other word: the two are a pair, on both words");
ok(r.pair.games, "…and a trap in the games");
ok(r.fb.mix && r.fb.text.includes(r.words[0]) && r.fb.text.includes(r.words[1]) && /another word/.test(r.fb.lead), `the feedback: the two side by side («${r.fb.text.trim()}»)`);
ok(r.mixq.length === 1, "the other word waits for the repair round");
ok(r.usage && r.usage[0] === 1, "the usage log counts a new pair", JSON.stringify(r.usage) + " " + JSON.stringify(r.mixlog));
const ia = r.repair.findIndex(x => x.mix === ""), ib = r.repair.findIndex(x => x.mix !== "");
ok(ia >= 0 && ib > ia && r.repair[ib].practice, "the repair round: the missed word, then the other one (practice)", JSON.stringify(r.repair));
ok(r.before && !r.typo.c && !r.typo.d && r.typo.q === 0, "\"my typo\": the pair taken back on both words, nothing for the repair round", JSON.stringify(r.typo));
ok(r.next.iA >= 0 && r.next.iB > r.next.iA && r.next.iB - r.next.iA <= 6 && r.next.mix, `the next session: the partner a few cards after its word (${r.next.iA} → ${r.next.iB})`, JSON.stringify(r.next));
ok(r.next.twice === 1, "…once", JSON.stringify(r.dbg));
ok(r.focus === 0, "…not in a focus session");
ok(r.halfway === true, "one side right today: the pair stays open");
ok(!r.sorted.a && !r.sorted.b && r.sorted.chip, "both right on 2 separate days: sorted, and the feedback says so", JSON.stringify(r.sorted));
ok(r.unmet === null, "a word not met yet: no pair");
ok(r.cap === 3 && r.capLast, `a word keeps 3 pairs at most, the newest (${r.cap})`);
ok(/Mix-up pairs .*: \d+ new · \d+ mixed up again · \d+ sorted · open now \d+/.test(r.report), "the usage report", r.report);
ok(r.learn !== false, "the learning log lists the pairs being practised", String(r.learn));
ok(!errors.length, "no page errors", errors.join("\n"));
await browser.close();
console.log(`\nmix-ups: ${pass} passed, ${fail} failed`);
process.exit(fail ? 1 : 0);
