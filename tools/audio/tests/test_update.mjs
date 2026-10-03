// A phone with the current app + pack; new decks and the new pack are published; the app is reopened.
import fs from "node:fs";
import { launch } from "./common.mjs";
// OLD = the repo (what phones have now), NEW = a copy with edited decks and its
// rebuilt pack, SITE = the folder the test server serves, B = its address.
const OLD = process.env.OLD, NEW = process.env.NEW, SITE = process.env.SITE, B = process.env.BASE;
let pass = 0, fail = 0;
const ok = (c, msg, extra = "") => { if (c) { pass++; console.log("  ✓", msg); } else { fail++; console.log("  ✗ FAIL:", msg, extra); } };
let tick = 0;
const publish = (root, lang) => {          // what a GitHub Pages deploy does: new decks + new pack
  fs.rmSync(`${SITE}/${lang}`, { recursive: true, force: true }); fs.cpSync(`${root}/${lang}`, `${SITE}/${lang}`, { recursive: true });
  fs.rmSync(`${SITE}/audio/${lang}`, { recursive: true, force: true }); fs.cpSync(`${root}/audio/${lang}`, `${SITE}/audio/${lang}`, { recursive: true });
  const t = Date.now() / 1000 + 30 * ++tick;
  for (const d of [`${SITE}/${lang}`, `${SITE}/audio/${lang}`]) for (const f of fs.readdirSync(d)) fs.utimesSync(`${d}/${f}`, t, t);
};
const browser = await launch();
for (const lang of ["de", "fr"]) {
  console.log(`\n=== ${lang}: installed pack, then new decks are published ===`);
  publish(OLD, lang);
  const ctx = await browser.newContext({ viewport: { width: 390, height: 844 }, serviceWorkers: "block" });
  const page = await ctx.newPage(); const errs = []; page.on("pageerror", e => errs.push(e.message));
  await page.addInitScript(() => {
    window.__toasts = []; window.__tts = []; speechSynthesis.speak = u => window.__tts.push(u.text);
    new MutationObserver(() => { const t = document.querySelector("#celebrate-toast .ct-title"); if (t && !window.__toasts.includes(t.textContent)) window.__toasts.push(t.textContent); }).observe(document, { childList: true, subtree: true });
  });
  await page.goto(`${B}/${lang}/index.html`);
  await page.waitForFunction(() => typeof AUDIO !== "undefined" && AUDIO.ready && AUDIO.remote, null, { timeout: 20000 });
  await page.evaluate(() => audioDownload(["w", "s"]));
  const v1 = await page.evaluate(() => AUDIO.manifest.v);
  ok(await page.evaluate(() => audioInstalledKinds().join("") === "ws"), `current pack installed (${v1})`);

  publish(NEW, lang);
  const bins = []; page.on("request", r => { if (/\/audio\/.*\.bin$/.test(r.url())) bins.push(r.url().split("/").pop()); });
  await page.reload();
  const v2 = JSON.parse(fs.readFileSync(`${NEW}/audio/${lang}/manifest.json`)).v;
  await page.waitForFunction(v => typeof AUDIO !== "undefined" && AUDIO.manifest && AUDIO.manifest.v === v && !AUDIO.dl, v2, { timeout: 30000 }).catch(() => {});
  ok(await page.evaluate(v => AUDIO.manifest.v === v, v2), `updated by itself to the new pack (${v2}), no tap`);
  const oldF = new Set(JSON.parse(fs.readFileSync(`${OLD}/audio/${lang}/manifest.json`)).shards.map(s => s.f));
  const changed = JSON.parse(fs.readFileSync(`${NEW}/audio/${lang}/manifest.json`)).shards.filter(s => !oldF.has(s.f)).map(s => s.f);
  ok(bins.length === changed.length && bins.every(b => changed.includes(b)), `downloaded only the ${changed.length} changed files`, JSON.stringify(bins));
  ok((await page.evaluate(() => window.__toasts)).some(t => /Voices updated/.test(t)), "'Voices updated' shown");
  ok(await page.evaluate(() => audioInstalledKinds().join("") === "ws" && !audioUpdateAvailable()), "complete, nothing pending");

  const cov = await page.evaluate(() => {
    const r = { words: 0, hit: 0, sent: 0, sentHit: 0, miss: [], newDeck: [] };
    for (const g of ALL_GROUPS) for (const d of g.decks) d.words.forEach((w, i) => {
      w.deckId = d.id; w.idx = i; r.words++;
      if (audioFind(gameForm(w))) r.hit++; else r.miss.push(gameForm(w));
      (w.examples || []).forEach(ex => { if (ex[WORD_KEY]) { r.sent++; if (audioFind(ex[WORD_KEY])) r.sentHit++; else r.miss.push(ex[WORD_KEY]); } });
      if (d.id === "module_test" || gameForm(w) === "courent") r.newDeck.push(gameForm(w));
    });
    return r;
  });
  ok(cov.hit === cov.words && cov.sentHit === cov.sent, `every card and sentence has its recording (${cov.hit}/${cov.words} words, ${cov.sentHit}/${cov.sent} sentences)`, JSON.stringify(cov.miss.slice(0, 5)));

  // the new cards really play the recording (not the phone voice), and start quickly
  const play = await page.evaluate(async (list) => {
    const el = _audioEl(), out = [];
    for (const t of list) {
      const before = window.__tts.length, t0 = performance.now();
      const started = await new Promise(res => { const h = () => { el.removeEventListener("playing", h); res(true); }; el.addEventListener("playing", h); speak(t); setTimeout(() => res(false), 3000); });
      out.push({ t, started, ms: Math.round(performance.now() - t0), tts: window.__tts.length > before });
      await new Promise(r => setTimeout(r, 200));
    }
    return out;
  }, cov.newDeck);
  console.log("  new cards:", play.map(p => `${p.t} ${p.started ? p.ms + "ms" : "NO SOUND"}${p.tts ? " (phone voice!)" : ""}`).join(" | "));
  ok(play.length > 0 && play.every(p => p.started && !p.tts && p.ms < 500), "new cards play their recording, not the phone voice");

  // offline: still plays after going offline
  await ctx.setOffline(true);
  const off = await page.evaluate(async (t) => { const el = _audioEl(); return await new Promise(res => { const h = () => { el.removeEventListener("playing", h); res(true); }; el.addEventListener("playing", h); speak(t); setTimeout(() => res(false), 3000); }); }, cov.newDeck[0]);
  ok(off, "a new card plays offline");
  ok(errs.length === 0, "no page errors", errs.join(" | "));
  await ctx.close();
}
await browser.close();
console.log(`\n${pass} passed, ${fail} failed`);
process.exit(fail ? 1 : 0);
