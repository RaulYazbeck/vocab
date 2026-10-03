// The published packs inside the real app: first-launch offer, full download,
// 100% of deck texts find their recording, every clip decodes, sound starts fast.
import { launch, BASE } from "./common.mjs";
let pass = 0, fail = 0;
const ok = (c, msg, extra = "") => { if (c) { pass++; console.log("  ✓", msg); } else { fail++; console.log("  ✗ FAIL:", msg, extra); } };
const browser = await launch();
for (const lang of (process.env.LANGS || "de,fr").split(",")) {
  console.log(`\n=== ${lang}: full-size pack ===`);
  const ctx = await browser.newContext({ viewport: { width: 420, height: 800 }, serviceWorkers: "block" });
  const page = await ctx.newPage();
  const errs = []; page.on("pageerror", e => errs.push(e.message));
  await page.addInitScript(() => { window.__tts = []; speechSynthesis.speak = u => window.__tts.push(u.text); });
  await page.goto(`${BASE}/${lang}/index.html`);
  await page.waitForSelector("#audio-offer", { timeout: 20000 });
  console.log("  offer:", (await page.$$eval("#audio-offer .modal-btn", b => b.map(x => x.textContent))).join(" | "));
  const t0 = Date.now();
  await page.click("#ao-all");
  await page.waitForFunction(() => !AUDIO.dl, null, { timeout: 120000 });
  const secs = ((Date.now() - t0) / 1000).toFixed(1);
  const info = await page.evaluate(async () => {
    const est = await navigator.storage.estimate();
    return { shards: AUDIO.manifest.shards.length, have: AUDIO.have.size, kinds: audioInstalledKinds().join(""), clips: Object.keys(AUDIO.manifest.idx).length, usageMB: Math.round((est.usage || 0) / 1048576), mem: AUDIO.mem.size };
  });
  console.log(`  downloaded in ${secs}s (localhost): ${JSON.stringify(info)}`);
  ok(info.have === info.shards && info.kinds === "ws", "every shard installed");

  // coverage: every string the app could ask speak() to say for deck words
  const cov = await page.evaluate(() => {
    const r = { words: 0, wordHit: 0, rawHit: 0, sent: 0, sentHit: 0, np: 0, npHit: 0, miss: [] };
    for (const g of ALL_GROUPS) for (const d of g.decks) d.words.forEach((w, i) => {
      w.deckId = d.id; w.idx = i;
      r.words++;
      if (audioFind(gameForm(w))) r.wordHit++; else r.miss.push(gameForm(w));
      if (audioFind(w[WORD_KEY])) r.rawHit++;                       // speak(w[WORD_KEY]) as several modes do
      try { const np = nounParts(w); if (np) { r.np++; if (audioFind(np.full)) r.npHit++; } } catch (e) {}
      (w.examples || []).forEach(ex => { if (ex[WORD_KEY]) { r.sent++; if (audioFind(ex[WORD_KEY])) r.sentHit++; else r.miss.push(ex[WORD_KEY]); } });
    });
    return r;
  });
  console.log(`  coverage: words ${cov.wordHit}/${cov.words} (raw strings ${cov.rawHit}), noun-with-article ${cov.npHit}/${cov.np}, sentences ${cov.sentHit}/${cov.sent}`);
  ok(cov.wordHit === cov.words && cov.sentHit === cov.sent && cov.rawHit === cov.words && cov.npHit === cov.np, "100% of deck words, raw strings and sentences resolve", JSON.stringify(cov.miss.slice(0, 5)));

  // every clip in the pack must decode (checks every offset/length in every shard)
  const dec = await page.evaluate(async () => {
    const m = AUDIO.manifest, ac = new (window.OfflineAudioContext || window.webkitOfflineAudioContext)(1, 1, 24000);
    let good = 0, bad = [], total = 0, shortest = 1e9;
    const entries = Object.entries(m.idx);
    for (let i = 0; i < entries.length; i += 25) {
      await Promise.all(entries.slice(i, i + 25).map(async ([key, e]) => {
        total++;
        try {
          const buf = await _audioShardBytes(e[0]);
          const a = await ac.decodeAudioData(buf.slice(e[1], e[1] + e[2]));
          if (a.duration > 0.1) { good++; shortest = Math.min(shortest, a.duration); } else bad.push(key);
        } catch (err) { bad.push(key); }
      }));
    }
    return { good, total, bad: bad.slice(0, 5), shortest: +shortest.toFixed(2) };
  });
  console.log(`  decode check: ${dec.good}/${dec.total} clips decode (shortest ${dec.shortest}s)`);
  ok(dec.good === dec.total, "every clip in every shard decodes", JSON.stringify(dec.bad));

  // latency of speak() → playing, from the on-device cache
  const lat = await page.evaluate(async () => {
    const keys = Object.keys(AUDIO.manifest.idx), texts = [];
    for (const g of ALL_GROUPS) for (const d of g.decks) for (const w of d.words) texts.push(gameForm(w));
    const el = _audioEl(), out = [];
    for (let i = 0; i < 60; i++) {
      const t = texts[Math.floor(Math.random() * texts.length)];
      const t0 = performance.now();
      await new Promise(res => { const h = () => { el.removeEventListener("playing", h); res(); }; el.addEventListener("playing", h); speak(t); setTimeout(res, 2000); });
      out.push(performance.now() - t0);
    }
    out.sort((a, b) => a - b);
    return { median: Math.round(out[30]), p95: Math.round(out[57]), max: Math.round(out[59]), tts: window.__tts.length };
  });
  console.log(`  speak() → sound starts: median ${lat.median} ms, p95 ${lat.p95} ms, max ${lat.max} ms (60 random words)`);
  ok(lat.median < 150 && lat.tts === 0, "starts quickly and never falls back for recorded words");

  // storage footprint & reload
  await page.reload(); await page.waitForFunction(() => AUDIO.ready);
  const t1 = await page.evaluate(() => performance.now());
  ok(await page.evaluate(() => audioReady() && AUDIO.have.size === AUDIO.manifest.shards.length), "pack still complete after reload");
  ok(errs.length === 0, "no page errors", JSON.stringify(errs.slice(0, 3)));
  await ctx.close();
}
console.log(`\n${pass} passed, ${fail} failed`);
await browser.close(); process.exit(fail ? 1 : 0);
