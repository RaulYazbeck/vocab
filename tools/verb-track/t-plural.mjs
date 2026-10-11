// A plural missed in Plural Hunt comes back as its plural, not its meaning:
//   • a game miss of the plural alone flags the word and marks it (fx);
//     Today's fix then asks "der Tisch → die ___" — in a session and in
//     the repair round;
//   • typed right: flag and mark go; the singular typed is a miss (with
//     a pointer), never "almost";
//   • a word already waiting for its own repair keeps that repair; any
//     other miss of the word (a game, a choice, a typed answer) asks the
//     word again.
//   • a plural missed twice is watched: after its repair, its reviews ask
//     the plural until it's right on two separate days.
//   node t-plural.mjs
import { openApp } from "./browser.mjs";
const { browser, page, errors } = await openApp({ width: 390, height: 844 });
const r = await page.evaluate(() => {
  window.saveState = () => {}; window.speak = () => {}; window.showCelebrateToast = () => {}; window.confettiBurst = () => {};
  const out = [], ok = (c, m) => out.push([!!c, m]);
  // Met nouns with a plural, no repair pending.
  const nouns = [];
  vocabGroups().forEach(g => g.decks.forEach(d => d.words.forEach((w0, i) => {
    const w = pathWord(d.id, i), ws = S.words[d.id + "_" + i];
    if (ws && ws.st >= 2 && !ws.fl && !ws.rp && !ws.lrn && pluralItem(w)) nouns.push(w);
  })));
  ok(nouns.length >= 4, `met nouns with a plural (${nouns.length})`);
  const game = (ws, kinds) => applyGameCredit({ def: { id: "plural", credit: null }, missedWords: ws, missKinds: kinds, hits: new Map(), vxHits: [] });
  const [a, b, c, d] = nouns, wsOf = w => S.words[wordKey(w)];
  // 1. plural only → marked, flagged
  game([a], { [wordKey(a)]: "plural" });
  ok(wsOf(a).fl && wsOf(a).fx === "pl", "a missed plural: flagged and marked");
  ok(pathItemFor(a, wsOf(a)).ask === "pl", "its fix asks the plural");
  // 2. already waiting for its own repair → keeps it
  wsOf(b).fl = 1;
  game([b], { [wordKey(b)]: "plural" });
  ok(!wsOf(b).fx, "a word already flagged for itself keeps that repair");
  // 3. marked, then another kind of game miss → the word again
  game([c], { [wordKey(c)]: "plural" });
  ok(wsOf(c).fx === "pl", "c marked");
  applyGameCredit({ def: { id: "match", credit: "recognition" }, missedWords: [c], missKinds: { [wordKey(c)]: "word" }, hits: new Map(), vxHits: [] });
  ok(!wsOf(c).fx, "another game miss: the repair asks the word");
  // 4. marked, then a typed miss elsewhere → the word again
  game([d], { [wordKey(d)]: "plural" });
  applyWrong(wsOf(d), { w: d });
  ok(!wsOf(d).fx, "a typed miss of the word: the repair asks the word");
  // 5. In Today: the plural card
  startPathSession("regular", { noBonus: true });
  const s = pathSession;
  const show = it => { s.items.splice(s.i + 1, 0, it); s.answered = true; pathNext(); };
  show(pathItemFor(a, wsOf(a)));
  const card = document.getElementById("p-card").innerText;
  const item = pluralItem(a);
  ok(/One → many/i.test(card) && card.includes(item.np.full), "the card shows the singular, asks the plural");
  ok(document.getElementById("p-input").placeholder === "die …", "placeholder: die …");
  // singular typed → a miss with a pointer, mark kept
  document.getElementById("p-input").value = item.np.noun; pathCheckTyped();
  ok(s.answered && /singular/.test(document.getElementById("p-fb").innerHTML), "the singular: a miss, with a pointer");
  ok(wsOf(a).fx === "pl" && (wsOf(a).fl || wsOf(a).rp || wsOf(a).lrn), "still marked after a missed plural");
  // the repair round asks the plural, and a right answer clears it
  s.items.length = s.i + 1;
  pathNext(); // → repair offer
  ok(s.cur && s.cur.t === "repairOffer", "repair offered");
  pathRepair(true);
  const rit = s.items.find(x => x.repair && sameWord(x.w, a));
  ok(rit && rit.ask === "pl", "the repair round asks the plural");
  while (s.cur && !sameWord(s.cur.w, a)) { s.answered = true; pathNext(); }
  ok(/One → many/i.test(document.getElementById("p-card").innerText), "repair card: the plural");
  document.getElementById("p-input").value = "Die " + item.pl; pathCheckTyped();
  ok(s.stats.correct > 0 && /p-ok/.test(document.getElementById("p-fb").innerHTML), "the plural typed right");
  ok(!wsOf(a).fx, "right: the mark goes");
  // bare plural (without die) is fine too
  game([b], {}); delete wsOf(b).fl; delete wsOf(b).lrn; delete wsOf(b).rp;
  game([b], { [wordKey(b)]: "plural" });
  startPathSession("regular", { noBonus: true });
  const s2 = pathSession; s2.items.splice(s2.i + 1, 0, pathItemFor(b, wsOf(b))); s2.answered = true; pathNext();
  document.getElementById("p-input").value = pluralItem(b).pl; pathCheckTyped();
  ok(/p-ok/.test(document.getElementById("p-fb").innerHTML), "the plural without die: right");
  // 6. A plural missed twice is watched: after its repair, its next
  //    reviews ask the plural until it's right on two separate days.
  const e = nouns[3] && nouns.find((w, i) => i > 3 && !wsOf(w).fl && !wsOf(w).rp && !wsOf(w).lrn);
  if (e) {
    const ws = wsOf(e);
    game([e], { [wordKey(e)]: "plural" });
    ok(ws.plm === 1 && !ws.plw, "one plural miss: not watched yet");
    game([e], { [wordKey(e)]: "plural" });
    ok(ws.plm === 2 && ws.plw === 2, "a second miss: watched");
    // repaired (its fix typed right)
    startPathSession("regular", { noBonus: true });
    const s3 = pathSession; s3.items.splice(s3.i + 1, 0, pathItemFor(e, ws)); s3.answered = true; pathNext();
    document.getElementById("p-input").value = "die " + pluralItem(e).pl; pathCheckTyped();
    ok(!ws.fl && !ws.fx && ws.plw === 2, "repaired: flag gone, still watched");
    // its next due review asks the plural
    ws.dueAt = Date.now() - 1000; delete ws.lrn; delete ws.rp;
    const it1 = pathItemFor(e, ws);
    ok(it1.ask === "pl" && it1.watch, "a due review of a watched word asks the plural");
    s3.items.splice(s3.i + 1, 0, it1); s3.answered = true; pathNext();
    ok(/missed it before/.test(document.getElementById("p-card").innerText), "the card says why");
    document.getElementById("p-input").value = pluralItem(e).pl; pathCheckTyped();
    ok(ws.plw === 1 && ws.plDay === studyToday(), "right once: one more day to go");
    ws.dueAt = Date.now() - 1000;
    ok(pathItemFor(e, ws).ask !== "pl", "not asked again the same day");
    ws.plDay = addDays(studyToday(), -1);
    const it2 = pathItemFor(e, ws);
    ok(it2.ask === "pl", "asked again another day");
    s3.items.splice(s3.i + 1, 0, it2); s3.answered = true; pathNext();
    document.getElementById("p-input").value = "Tisch-falsch"; pathCheckTyped();
    ok(ws.plw === 2 && ws.fx === "pl" && (ws.fl || ws.rp || ws.lrn), "missed during the watch: watched again from the start, repair asks the plural");
    ws.plw = 1; ws.plDay = addDays(studyToday(), -1); delete ws.fl; delete ws.rp; delete ws.lrn; delete ws.fx; ws.dueAt = Date.now() - 1000;
    const it3 = pathItemFor(e, ws);
    s3.items.splice(s3.i + 1, 0, it3); s3.answered = true; pathNext();
    document.getElementById("p-input").value = "die " + pluralItem(e).pl; pathCheckTyped();
    ok(!ws.plw && !ws.plm, "right on the last day: the watch ends");
    ws.dueAt = Date.now() - 1000;
    ok(pathItemFor(e, ws).ask !== "pl", "then reviews ask the word again");
    // A watched word comes back the next day, due or not — a 💎 one too.
    ws.plw = 1; ws.plDay = addDays(studyToday(), -1); ws.st = STAGE_LOCKED; ws.dueAt = Date.now() + 90 * 864e5;
    const { due } = pathReviewCandidates();
    ok(due.some(o => o.d.id + "_" + o.i === wordKey(e)), "a watched plural comes back the next day, even on a 💎 word not due");
    ws.plDay = studyToday();
    ok(!pathReviewCandidates().due.some(o => o.d.id + "_" + o.i === wordKey(e)), "…but not twice the same day");
    delete ws.plw; delete ws.plDay;
  }
  return out;
});
let pass = 0, fail = 0;
r.forEach(([c, m]) => { if (c) pass++; else { fail++; console.log("✗", m); } });
if (errors.length) { fail++; console.log("page errors:", errors.slice(0, 5)); }
console.log(`plural: ${pass} passed, ${fail} failed`);
await browser.close();
process.exit(fail ? 1 : 0);
