// Every game, both languages: no JS errors, and which texts do the games ask speak() to say?
import { launch, BASE } from "./common.mjs";
const browser = await launch();
let bad = 0;
for (const lang of ["de", "fr"]) {
  const ctx = await browser.newContext({ viewport: { width: 420, height: 800 }, serviceWorkers: "block" });
  const page = await ctx.newPage();
  const errs = [];
  page.on("pageerror", e => errs.push(e.message));
  await page.addInitScript(() => { window.__spoken = []; speechSynthesis.speak = u => {}; });
  await page.goto(`${BASE}/${lang}/index.html`);
  await page.waitForFunction(() => typeof AUDIO !== "undefined" && AUDIO.ready);
  await page.evaluate(() => { const sp = window.speak; window.speak = (t, r) => { window.__spoken.push(t); window.__all.push(t); return sp(t, r); }; });
  await page.evaluate(() => {
    // every word of every deck, marked as met, so every game has material
    window.__pool = ALL_GROUPS.flatMap(g => g.decks.flatMap(d => d.words.map((w, i) => ({ ...w, deckId: d.id, deckName: d.name, idx: i, anki: false }))));
    window.__pool.forEach(w => { const ws = getWS(w.deckId, w.idx); ws.st = 3; ws.correct = 3; });
  });
  await page.evaluate(() => audioDownload(["w", "s"]));
  await page.evaluate(() => { window.__all = []; });
  const ids = await page.evaluate(() => GAMES.map(g => g.id));
  const rows = [];
  for (const id of ids) {
    const before = errs.length;
    await page.evaluate(id => { try { launchGame(id, { pool: window.__pool, size: "full" }); } catch (e) { window.__err = String(e); } }, id);
    // play: click the first available option / continue a few times
    for (let i = 0; i < 30; i++) {
      await page.waitForTimeout(150);
      await page.evaluate(() => {
        const q = s => document.querySelector(`#game-screen ${s}`);
        const go = [...document.querySelectorAll("#game-screen .g-big-btn")].find(x => /let.?s go|start|play/i.test(x.textContent));
        if (go) { go.click(); return; }
        const b = q(".g-opt:not([disabled])") || q(".pl-opt:not([disabled])") || q(".g-continue") || q("[data-i]") || q(".g-btn");
        if (b) b.click();
        const cont = [...document.querySelectorAll("#game-screen button")].find(x => /continue|next|see results/i.test(x.textContent));
        if (cont) cont.click();
      }).catch(() => {});
    }
    const sp = await page.evaluate(() => { const s = window.__spoken.slice(); window.__spoken.length = 0; return s; });
    const started = await page.evaluate(() => !!document.querySelector("#game-screen"));
    await page.evaluate(() => { try { quitGame(); } catch (e) {} });
    rows.push({ id, started, speaks: sp.length, new: errs.length - before });
  }
  console.log(`\n${lang}: games — ${rows.map(r => `${r.id}${r.started ? "" : "(not startable)"}:${r.speaks}${r.new ? " ERR×" + r.new : ""}`).join("  ")}`);
  const cov = await page.evaluate(() => { const u = [...new Set(window.__all)]; const miss = u.filter(t => !audioFind(t)); return { n: u.length, hit: u.length - miss.length, miss }; });
  console.log(`  ${lang}: ${cov.hit}/${cov.n} distinct spoken texts are in the pack` + (cov.miss.length ? `; not in pack: ${JSON.stringify(cov.miss)}` : ""));
  if (errs.length) { bad++; console.log("  page errors:", [...new Set(errs)].slice(0, 5)); }
  await ctx.close();
}
console.log(bad ? "\nFAILED: page errors" : "\nno page errors in any game");
await browser.close(); process.exit(bad ? 1 : 0);
