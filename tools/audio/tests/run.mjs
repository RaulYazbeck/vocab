#!/usr/bin/env node
// Runs the voice tests in a real browser (Chromium via Playwright). Never
// calls the real Google: the update scenario uses fake_google.py.
//
//   node tools/audio/tests/run.mjs            # all of them (about 5 minutes)
//   node tools/audio/tests/run.mjs pack flag  # some of them
//
//   pack    the published packs in the app: download, every deck text finds its
//           recording, every clip decodes, sound starts fast, no page errors
//   games   every game in both languages runs with the packs, no page errors
//   flag    the ⚑ flag and the "Copy voice log" row
//   update  adding decks later, on a fresh copy with no work folder: the update
//           routine (run_all.py full) records only what is new, then a phone
//           that has the current pack updates by itself, fetches only the
//           changed files, and every card (new ones too) plays its recording
//
// Needs node 18+, python 3, ffmpeg; installs playwright-core here on first run.

import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import http from "node:http";
import net from "node:net";
import { spawn, spawnSync } from "node:child_process";
import { fileURLToPath } from "node:url";

const HERE = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(HERE, "../../..");
const ALL = ["pack", "games", "flag", "update"];
const want = process.argv.slice(2).length ? process.argv.slice(2) : ALL;
for (const w of want) if (!ALL.includes(w)) { console.error(`unknown test "${w}" (choose from ${ALL.join(", ")})`); process.exit(2); }

if (!fs.existsSync(path.join(HERE, "node_modules", "playwright-core"))) {
  console.log("installing playwright-core (first run)…");
  const r = spawnSync("npm", ["install", "--no-audit", "--no-fund", "--silent"], { cwd: HERE, stdio: "inherit" });
  if (r.status !== 0) process.exit(1);
}

const TMP = fs.mkdtempSync(path.join(os.tmpdir(), "voice-tests-"));
const OUT = path.join(TMP, "out"); fs.mkdirSync(OUT);

// A plain static server: no caching headers, so a swapped file is always seen.
const TYPES = { ".html": "text/html", ".js": "text/javascript", ".mjs": "text/javascript", ".css": "text/css", ".json": "application/json", ".bin": "application/octet-stream", ".png": "image/png", ".svg": "image/svg+xml", ".ico": "image/x-icon", ".webmanifest": "application/manifest+json" };
function serve(root) {
  const srv = http.createServer((req, res) => {
    let p = decodeURIComponent(new URL(req.url, "http://x").pathname);
    let f = path.join(root, p);
    if (!path.resolve(f).startsWith(path.resolve(root))) { res.writeHead(403); return res.end(); }
    try { if (fs.statSync(f).isDirectory()) f = path.join(f, "index.html"); } catch (e) {}
    fs.readFile(f, (err, buf) => {
      if (err) { res.writeHead(404); return res.end("not found"); }
      res.writeHead(200, { "Content-Type": TYPES[path.extname(f)] || "application/octet-stream", "Cache-Control": "no-store" });
      res.end(buf);
    });
  });
  return new Promise(r => srv.listen(0, "127.0.0.1", () => r({ srv, base: `http://localhost:${srv.address().port}` })));
}
const freePort = () => new Promise(r => { const s = net.createServer().listen(0, () => { const p = s.address().port; s.close(() => r(p)); }); });
function run(cmd, args, opts = {}) {
  return new Promise(resolve => {
    const p = spawn(cmd, args, { stdio: ["ignore", "pipe", "pipe"], ...opts });
    let out = "";
    p.stdout.on("data", d => { out += d; if (opts.echo !== false) process.stdout.write(d); });
    p.stderr.on("data", d => { out += d; if (opts.echo !== false) process.stdout.write(d); });
    p.on("close", code => resolve({ code, out }));
  });
}
// The site as GitHub Pages serves it: the repo's files, linked (not copied).
function siteFrom(src, dst, copy = []) {
  fs.mkdirSync(dst, { recursive: true });
  for (const f of fs.readdirSync(src)) {
    if ([".git", "tools", "node_modules"].includes(f)) continue;
    if (copy.includes(f)) continue;
    fs.symlinkSync(path.join(src, f), path.join(dst, f));
  }
  return dst;
}

const results = [];
const servers = [];
let fake = null;
try {
  const { srv, base } = await serve(siteFrom(ROOT, path.join(TMP, "site")));
  servers.push(srv);
  const env = { ...process.env, BASE: base, OUT };
  for (const name of ["pack", "games", "flag"].filter(n => want.includes(n))) {
    console.log(`\n━━ ${name} ━━`);
    const r = await run("node", [path.join(HERE, `test_${name}.mjs`)], { env });
    results.push([name, r.code === 0]);
  }

  if (want.includes("update")) {
    console.log("\n━━ update ━━");
    // 1. a fresh copy of the repo, without the work folder (as a new session has it)
    const SIM = path.join(TMP, "sim");
    fs.cpSync(ROOT, SIM, { recursive: true, filter: s => !/[\\/](\.git|node_modules|__pycache__)$/.test(s) && !s.startsWith(path.join(ROOT, "tools", "audio", "work")) });
    // 2. deck edits: a new German deck, one card removed, one sentence edited, a new French conjugation card
    const deF = path.join(SIM, "de", "jm_deck_sammy.js");
    let de = fs.readFileSync(deF, "utf8");
    const end = de.lastIndexOf("  ]\n};");
    if (end < 0) throw new Error("unexpected end of de/jm_deck_sammy.js");
    const lines = de.slice(0, end).split("\n");
    const cards = lines.map((l, i) => /^\s+\{ en:/.test(l) ? i : -1).filter(i => i >= 0);
    lines.splice(cards[cards.length - 1], 1);                                  // remove the last card
    const ed = cards[cards.length - 2];
    lines[ed] = lines[ed].replace(/(examples:\[\{de:")([^"]*?)([.!?]?)"/, (m, a, b) => `${a}${b}, wirklich."`);   // edit a sentence
    de = lines.join("\n") + `    {
      id: "module_test", name: "Test deck", icon: "🧗",
      words: [
        { en:"climber", de:"der Bergsteiger, -", hint:"masc, noun", examples:[{de:"Der Bergsteiger erreicht den Gipfel.",en:"The climber reaches the summit."}] },
        { en:"to climb", de:"klettern", hint:"verb", examples:[{de:"Wir klettern jeden Samstag.",en:"We climb every Saturday."}], conjugation:"klettern, klettert, kletterte, ist geklettert" },
        { en:"either today or tomorrow", de:"entweder heute … oder morgen", hint:"phrase", examples:[{de:"Wir fahren entweder heute oder morgen.",en:"We leave either today or tomorrow."}] },
      ]
    },
` + de.slice(end);
    fs.writeFileSync(deF, de);
    const frF = path.join(SIM, "fr", "french_decks_a1.js");
    const fr = fs.readFileSync(frF, "utf8").split("\n");
    const at = fr.findIndex(l => / — ils", fr:"/.test(l));
    if (at >= 0) fr.splice(at + 1, 0, `        { en:"courir — ils", fr:"courent", hint:"correr", examples:[{fr:"Ils courent dans le parc.",en:"Ellos corren en el parque."}] },`);
    fs.writeFileSync(frF, fr.join("\n"));
    // 3. the documented routine, against the fake Google
    const gport = await freePort();
    fake = spawn("python3", [path.join(HERE, "fake_google.py"), String(gport), "injected-key"], { stdio: "ignore" });
    await new Promise(r => setTimeout(r, 800));
    const genv = { ...process.env, GOOGLE_TTS_ENDPOINT: `http://127.0.0.1:${gport}/v1/text:synthesize` };
    delete genv.AUDIO_WORK; delete genv.GOOGLE_TTS_API_KEY;
    const r = await run("python3", [path.join(SIM, "tools", "audio", "run_all.py"), "full"], { cwd: SIM, env: genv, echo: false });
    for (const l of r.out.split("\n")) if (/to record|clips to make|reusing|shards changed|have a recording|⚠|STOPPED|Error/.test(l)) console.log("  " + l.trim());
    const routineOk = r.code === 0 && /de: \d+\/\d+ texts have a recording \(100\.0%\)/.test(r.out) && /fr: \d+\/\d+ texts have a recording \(100\.0%\)/.test(r.out);
    console.log(routineOk ? "  ✓ the update routine recorded only what was new, 100% coverage" : "  ✗ FAIL: the update routine (exit " + r.code + ")");
    // 4. a phone with the current pack sees the new decks and pack published
    const SITE = siteFrom(ROOT, path.join(TMP, "site3"), ["de", "fr", "audio"]);
    fs.mkdirSync(path.join(SITE, "audio"));
    const s3 = await serve(SITE); servers.push(s3.srv);
    const u = await run("node", [path.join(HERE, "test_update.mjs")], { env: { ...process.env, OLD: ROOT, NEW: SIM, SITE, BASE: s3.base } });
    results.push(["update", routineOk && u.code === 0]);
  }
} finally {
  if (fake) fake.kill();
  for (const s of servers) s.close();
}
console.log("\n━━ summary ━━");
for (const [n, good] of results) console.log(`  ${good ? "✓" : "✗"} ${n}`);
console.log(`  screenshots: ${OUT}`);
process.exit(results.every(([, g]) => g) ? 0 : 1);
