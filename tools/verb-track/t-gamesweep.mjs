// Every Today bonus game with a session-like pool: verb items (the
// longest prompts there are) + the session's words. Each game is
// started and played for a few seconds by random taps and typed
// answers (right and wrong), phone and desktop: no page errors, no
// sideways scroll, no text cut out of its box, no undefined / NaN, and
// a verb item is never shown without its person.
//   node t-gamesweep.mjs     (APP=fr for the French app)
import { openApp } from "./browser.mjs";
const APP = process.env.APP || "de";
let failed = 0;
for (const [W, H] of [[390, 844], [1280, 900]]) {
  const { browser, page, errors } = await openApp({ width: W, height: H, app: APP });
  const r = await page.evaluate(async () => {
    window.saveState = () => {}; window.speak = () => {}; window.showCelebrateToast = () => {}; window.confettiBurst = () => {};
    if (!vxOn()) vxSwitchOn();
    const out = [], ok = (c, m) => out.push([!!c, m]);
    const wait = ms => new Promise(r => setTimeout(r, ms));
    startPathSession("regular", { noBonus: true });
    const base = uniqWords(pathSession.items.map(x => x.w).filter(Boolean)).filter(w => !w.vx && isMet(w.deckId, w.idx));
    // Verb items: a spread of kinds, the longest prompts first.
    const exs = [];
    for (const it of vxCatalog()) { const ex = vxMakeExercise(it); if (ex) exs.push(ex); }
    const vx = exs.map(vxWord).sort((a, b) => gamePrompt(b).length - gamePrompt(a).length);
    const byKind = new Map(); vx.forEach(w => { if (!byKind.has(w.vx.kind)) byKind.set(w.vx.kind, w); });
    const verbs = [...byKind.values(), ...vx.slice(0, 4)];
    const pool = uniqWords(verbs.concat(base.slice(0, 14))).map(w => ({ ...w, anki: false }));
    ok(verbs.length >= 6, `${verbs.length} verb items (${[...byKind.keys()].join(" ")}) + ${pool.length - verbs.length} words`);
    const vxCues = new Map(verbs.map(w => [gamePrompt(w).replace(/\s*—.*$/, ""), w]));
    for (const id of PATH_BONUS_IDS) {
      const g = getGame(id);
      if (!g || !gameUsableNow(g)) continue;
      const req = gameRequirement(g, pool, "bonus");
      if (!req.ok) { out.push([true, `${id}: not offered (${req.reason})`]); continue; }
      try { localStorage.setItem("gv_game_intro_" + id, "1"); } catch (e) {}
      gameRun = { kind: "surprise", ids: [id], i: 0, summaries: [], pool, size: "bonus", title: "🎁 Bonus", onDone: () => {} };
      launchGame(id, { pool, size: "bonus", twist: "" });
      for (let t = 0; t < 30 && document.getElementById("g-go"); t++) { await wait(150); const b = document.getElementById("g-go"); if (b) b.click(); }
      await wait(2300); // countdown
      const bad = [];
      let sawVerb = 0;
      for (let step = 0; step < 40 && activeGame && !activeGame.ctx.finished; step++) {
        const scr = document.getElementById("game-screen");
        if (!scr) break;
        const txt = scr.innerText;
        if (/undefined|NaN|\[object/.test(txt)) bad.push(`text: ${(txt.match(/.{0,30}(undefined|NaN|\[object).{0,20}/) || [""])[0]}`);
        if (document.documentElement.scrollWidth > window.innerWidth + 1) bad.push(`sideways scroll ${document.documentElement.scrollWidth}`);
        // A text box cut off: text wider than its own box (buttons, tiles, prompts).
        scr.querySelectorAll("button, .g-q-word, .tf-top, .tf-bot, [class*=tile], [class*=drop]").forEach(el => {
          if (el.offsetParent && el.scrollWidth > el.clientWidth + 2 && getComputedStyle(el).overflowX !== "auto" && el.innerText.trim()) bad.push(`cut: "${el.innerText.trim().slice(0, 50)}" ${el.scrollWidth}>${el.clientWidth}`);
        });
        // Any verb shown with its tense must show its person.
        for (const [head, w] of vxCues) if (txt.includes(head + " —")) { sawVerb++; if (!txt.includes(gamePrompt(w).replace(/\s*___.*$/, ""))) bad.push(`verb without person: ${head}`); }
        // Act: answer a typed box (alternately right / wrong / with the pronoun), else a random tap.
        const input = scr.querySelector("input[type=text]:not([disabled])");
        const cont = scr.querySelector(".g-continue-btn, #g-continue, .g-teach button");
        if (cont && cont.offsetParent && Math.random() < 0.7) cont.click();
        else if (input && input.offsetParent) {
          const cur = activeGame.ctx.lastShown || null;
          const words = pool.filter(w => scr.innerText.includes(gamePrompt(w)));
          const w = words[0];
          input.value = !w ? "xx" : step % 3 === 0 ? "falsch" : step % 3 === 1 && w.vx ? vxPronText(w.vx).replace(" (they)", "") + " " + w.vx.form.ans : gameForm(w);
          input.dispatchEvent(new KeyboardEvent("keydown", { key: "Enter", bubbles: true }));
        } else {
          const bs = [...scr.querySelectorAll("#g-stage button, #g-stage [role=button], #g-stage .tf-btn")].filter(b => b.offsetParent && !b.disabled);
          if (bs.length) bs[Math.floor(Math.random() * bs.length)].click();
        }
        await wait(260);
      }
      ok(!bad.length, `${id}: played${sawVerb ? `, verb prompts seen ${sawVerb}×` : ""}${bad.length ? " — " + [...new Set(bad)].slice(0, 4).join(" · ") : ""}`);
      if (typeof quitAllGames === "function") quitAllGames(); else stopActiveGame();
      gameRun = null;
      await wait(100);
    }
    return out;
  });
  r.forEach(([c, m]) => { if (!c) failed++; console.log((c ? "  ✓ " : "  ✗ ") + `[${W}] ` + m); });
  errors.forEach(e => { failed++; console.log(`  ✗ [${W}] error: ` + e.slice(0, 300)); });
  await browser.close();
}
console.log(`game sweep (${APP}): ${failed} failed`);
process.exit(failed ? 1 : 0);
