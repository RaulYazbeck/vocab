// The verb track is on for everyone, with nothing to press:
//   • a profile without it gets it at load — the same state the old
//     switch made (items, seeds, tenses, mirrors), and a reload of the
//     saved state changes nothing more;
//   • nowhere to switch: no offer in Today, nothing on the Grammar screen,
//     in ☰ or in ⚙️ — the old cards are only in Classic mode's Library;
//   • moved cards (German): a record under a card's old key follows it to
//     its new one — the record studied last wins — and its text edit too.
//   node t-alwayson.mjs   (APP=fr)
import { openApp } from "./browser.mjs";
const APP = process.env.APP || "de";
let pass = 0, fail = 0;
const ok = (c, m, x = "") => { if (c) pass++; else { fail++; console.log("  ✗", m, x); } };
// What switching on leaves behind, without the clock.
const shape = () => {
  const items = Object.keys(S.words).filter(k => k.startsWith("vx_")).sort().map(k => k + "=" + (S.words[k].st || 0));
  const mirrors = Object.keys(S.words).filter(k => S.words[k].rt).sort().map(k => k + "=" + S.words[k].st);
  return { on: S.verb.on, onAt: S.verb.onAt, tu: JSON.stringify(S.verb.tu), seed: JSON.stringify({ ...S.verb.seed }), cov: JSON.stringify(S.verb.cov), items: items.join(" "), mirrors: mirrors.join(" ") };
};

// 1 · the old way: loaded without it, then the switch
const a = await openApp({ app: APP, vxOff: true });
const viaSwitch = await a.page.evaluate(`(() => { const was = vxOn(); window.saveState = () => {}; vxSwitchOn(); return { was, s: (${shape})() }; })()`);
await a.browser.close();
ok(!viaSwitch.was, "the test profile has no verb track saved");

// 2 · the real way: just open the app
const { browser, page, errors } = await openApp({ app: APP });
const r = await page.evaluate(`(() => {
  const out = { s: (${shape})() };
  out.on = vxOn();
  out.today = vxTodayHtml();
  out.ui = ["renderVerbSwitch", "vxSwitchGo", "vxSwitchLater", "vxConfirmOff", "vxSwitchCardHtml"].filter(f => typeof window[f] === "function");
  renderGrammar(); out.grammar = document.getElementById("main-screen").innerText;
  out.menu = settingsMenuHtml();
  out.switchLogs = _usageLog().filter(e => e.e === "vx_switch").length;
  saveState();
  out.saved = JSON.parse(localStorage.getItem(APP_CONFIG.storageKey)).verb.on;
  return out;
})()`);
ok(r.on, "on at load, nothing pressed");
ok(r.s.items === viaSwitch.s.items && r.s.items.length > 0, "the same verb items and stages as the switch made", r.s.items.slice(0, 200) + " | " + viaSwitch.s.items.slice(0, 200));
ok(r.s.tu === viaSwitch.s.tu && r.s.seed === viaSwitch.s.seed && r.s.cov === viaSwitch.s.cov, "the same tenses, seeds and ledger", JSON.stringify([r.s.tu, r.s.seed]));
ok(r.s.mirrors === viaSwitch.s.mirrors, "the same retired cards and mirrors");
ok(!/new verb system|nuevo sistema|see what changes|mira qué cambia/i.test(r.today), "Today offers nothing to switch", r.today);
ok(!r.ui.length, "no switch screens left", r.ui.join());
ok(!/switch|old verb cards|Volver|Cambiar|nuevo sistema|new verb system/i.test(r.grammar), "the Grammar screen has no switch", r.grammar.slice(0, 300));
ok(!/new verb system|see what (it )?changes|nuevo sistema/i.test(r.menu), "☰ has no switch");
ok(r.switchLogs <= 1, "switched on once", r.switchLogs);

// 3 · a reload of the saved state: nothing more happens
await page.reload();
await page.waitForFunction(() => typeof S !== "undefined" && S.verb && S.words);
await page.waitForTimeout(300);
const again = await page.evaluate(`(() => ({ s: (${shape})(), logs: _usageLog().filter(e => e.e === "vx_switch").length }))()`);
ok(again.s.items === r.s.items && again.s.on === r.s.on && again.s.mirrors === r.s.mirrors, "a reload changes nothing");
ok(r.saved === r.s.on && again.s.onAt === r.s.onAt, "saved, and not switched on again", JSON.stringify([r.saved, again.s.onAt, r.s.onAt]));

// 4 · the settings: no switch in ⚙️ either
const settings = await page.evaluate(() => { try { openSettings(); } catch (e) { return "err " + e.message; } return document.body.innerText; });
ok(!/new verb system|see what it changes|nuevo sistema/i.test(settings), "⚙️ has no switch");

// 5 · moved cards follow their record
if (APP === "de") {
  const mv = await page.evaluate(() => {
    const out = {};
    const rec = (st, at) => ({ correct: 3, wrong: 1, streak: 2, displayStreak: 2, lastAnsweredAt: at, st, pk: st, dueAt: at + 864e5, anki: freshAnki() });
    // only the old key
    delete S.words.b1_shopping_38; S.words.b1_passiv_14 = rec(4, 1000);
    S.wordEdits.b1_passiv_14 = { hint: "my hint" };
    migrate();
    out.moved = !S.words.b1_passiv_14 && S.words.b1_shopping_38 && S.words.b1_shopping_38.st === 4;
    out.edit = !S.wordEdits.b1_passiv_14 && S.wordEdits.b1_shopping_38 && S.wordEdits.b1_shopping_38.hint === "my hint";
    out.card = getDeck("b1_shopping").words[38].de + " · " + getDeck("b1_shopping").words[38].hint;
    // the old key comes back through sync, studied earlier: the new one stays
    S.words.b1_passiv_14 = rec(2, 500);
    migrate();
    out.olderLoses = !S.words.b1_passiv_14 && S.words.b1_shopping_38.st === 4;
    // … studied later (on a device that still had the old decks): it wins
    S.words.b1_passiv_14 = rec(5, 5000);
    migrate();
    out.newerWins = !S.words.b1_passiv_14 && S.words.b1_shopping_38.st === 5;
    // every move lands on its own card
    out.targets = Object.entries(CARD_MOVES).map(([from, to]) => { const i = to.lastIndexOf("_"); const w = getDeck(to.slice(0, i)).words[+to.slice(i + 1)]; return w ? w.de : "MISSING " + to; });
    out.oldGone = Object.keys(CARD_MOVES).every(k => { const i = k.lastIndexOf("_"); return !getDeck(k.slice(0, i)).words[+k.slice(i + 1)]; });
    delete S.wordEdits.b1_shopping_38; applyWordEdits();
    return out;
  });
  ok(mv.moved, "a record under the old key moves to the new card");
  ok(mv.edit && /my hint/.test(mv.card), "its text edit moves with it", mv.card);
  ok(mv.olderLoses, "an older copy coming back through sync doesn't overwrite it");
  ok(mv.newerWins, "a newer copy coming back through sync wins");
  ok(mv.targets.length === 9 && !mv.targets.some(t => /MISSING/.test(t)), "all nine moved cards are where the map says", mv.targets.join(" · "));
  ok(mv.oldGone, "no card left under an old key");
}
ok(!errors.length, "no page errors", errors.slice(0, 5).join(" | "));
console.log(`always on${APP === "fr" ? " (fr)" : ""}: ${pass} passed, ${fail} failed`);
await browser.close();
process.exit(fail ? 1 : 0);
