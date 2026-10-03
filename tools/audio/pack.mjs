#!/usr/bin/env node
// Step 3 — turn the WAVs into the voice pack the app downloads.
//
//   node tools/audio/pack.mjs --lang de [--bitrate 24] [--format opus] [--voice "Name"]
//
// Reads  work/<lang>/texts.json + work/<lang>/wav/<key>.wav
// Writes audio/<lang>/manifest.json and audio/<lang>/<k><NNN>.<hash>.bin
//
// For every clip: trim the silence at both ends, bring the loudness to
// one level (so a word is never quieter than a sentence), encode (Opus
// by default), then lay the clips end to end in ~2 MB shard files, words
// and sentences in separate shards (the app can download just the words).
// The manifest maps  key -> [shard, offset, length].
//
// Stable by design, so people who already have the pack download only what
// changed when you edit the decks:
//   • each deck's clips always go to the same shard (chosen from the deck's
//     name; clips sorted by key inside it), so editing a deck changes that
//     deck's shard and nothing else;
//   • encoding is byte-for-byte reproducible (ffmpeg "bitexact"), so an
//     unchanged clip is an unchanged shard even if work/ was lost;
//   • the shard count per kind is remembered in the manifest ("buckets").
// At the end it prints how many shards (and MB) existing users would fetch.
// Clips are encoded once and kept in work/<lang>/enc, so re-running after
// adding phrases only encodes the new ones.
//
// Needs ffmpeg with libopus (or libmp3lame / aac for --format mp3|aac).
// Requires: node 18+.

import fs from "node:fs";
import path from "node:path";
import os from "node:os";
import crypto from "node:crypto";
import { spawn } from "node:child_process";
import { ROOT, workDir } from "./lib.mjs";

const args = process.argv.slice(2);
const opt = (n, d) => { const i = args.indexOf("--" + n); return i >= 0 ? args[i + 1] : d; };
const lang = opt("lang");
if (!lang) { console.error("usage: pack.mjs --lang de|fr [--bitrate 24] [--format opus|aac|mp3] [--shard-kb 2048] [--voice name] [--out dir]"); process.exit(1); }

const FORMATS = {
  opus: { ext: "opus", mime: "audio/ogg; codecs=opus", args: b => ["-c:a", "libopus", "-b:a", `${b}k`, "-vbr", "on", "-application", "audio", "-f", "ogg"] },
  aac:  { ext: "m4a",  mime: 'audio/mp4; codecs="mp4a.40.2"', args: b => ["-c:a", "aac", "-b:a", `${b}k`, "-movflags", "+faststart", "-f", "mp4"] },
  mp3:  { ext: "mp3",  mime: "audio/mpeg",             args: b => ["-c:a", "libmp3lame", "-b:a", `${b}k`, "-f", "mp3"] },
};
const fmtName = opt("format", "opus");
const FMT = FORMATS[fmtName];
if (!FMT) { console.error(`--format must be one of ${Object.keys(FORMATS).join(", ")}`); process.exit(1); }
const bitrate = +opt("bitrate", fmtName === "opus" ? 24 : 40);
const shardBytes = +opt("shard-kb", 2048) * 1024;
const voice = opt("voice", "");
const sampleRate = +opt("rate", 24000);
const outDir = path.resolve(opt("out", path.join(ROOT, "audio", lang)));
const jobs = +opt("jobs", Math.max(1, os.cpus().length));
const TARGET_DB = -21;                                  // mean level of the speech itself

const work = workDir(lang);
const wavDir = path.join(work, "wav"), encDir = path.join(work, "enc");
const texts = JSON.parse(fs.readFileSync(path.join(work, "texts.json"), "utf8"));
fs.mkdirSync(encDir, { recursive: true });

// Re-encode everything when any encoding setting changes.
const settings = JSON.stringify({ fmtName, bitrate, sampleRate, TARGET_DB, v: 2 });   // (the silence threshold doesn't change the encoding)
const settingsFile = path.join(encDir, ".settings");
if (!fs.existsSync(settingsFile) || fs.readFileSync(settingsFile, "utf8") !== settings) {
  for (const f of fs.readdirSync(encDir)) if (!f.startsWith(".")) fs.unlinkSync(path.join(encDir, f));
  fs.writeFileSync(settingsFile, settings);
}

function ffmpeg(a) {
  return new Promise((resolve, reject) => {
    const p = spawn("ffmpeg", ["-hide_banner", "-nostdin", ...a], { stdio: ["ignore", "ignore", "pipe"] });
    let err = "";
    p.stderr.on("data", d => err += d);
    p.on("error", e => reject(new Error("ffmpeg not found: " + e.message)));
    p.on("close", code => code === 0 ? resolve(err) : reject(new Error(err.split("\n").slice(-6).join("\n"))));
  });
}
// Silence off both ends (the model's lead-in and tail), keeping a breath.
const TRIM = "silenceremove=start_periods=1:start_threshold=-48dB:start_silence=0.04," +
  "areverse,silenceremove=start_periods=1:start_threshold=-48dB:start_silence=0.12,areverse";

async function encode(wav, dest) {
  // Pass 1: how loud is the trimmed speech?
  const log = await ffmpeg(["-i", wav, "-af", `${TRIM},volumedetect`, "-f", "null", "-"]);
  const mean = parseFloat((log.match(/mean_volume:\s*(-?[\d.]+) dB/) || [])[1]);
  const peak = parseFloat((log.match(/max_volume:\s*(-?[\d.]+) dB/) || [])[1]);
  // Real speech peaks around -10..0 dB. Below -30 it is a near-silent clip (a
  // TTS glitch): leave it out, so that word uses the phone voice, never silence.
  if (!isFinite(mean) || !isFinite(peak) || peak < -30) throw new Error(`near-silent clip (peak ${isFinite(peak) ? peak : "?"} dB)`);
  // Pass 2: gain to the target mean, never past -1 dB peak.
  const gain = Math.max(-15, Math.min(20, TARGET_DB - mean, -1 - peak));
  // bitexact: no random Ogg serial number / version tags, so the same WAV
  // always encodes to the same bytes.
  await ffmpeg(["-y", "-i", wav, "-af", `${TRIM},volume=${gain.toFixed(2)}dB,alimiter=limit=0.9`,
    "-ac", "1", "-ar", String(sampleRate), "-fflags", "+bitexact", "-flags:a", "+bitexact", ...FMT.args(bitrate), dest + ".part"]);
  fs.renameSync(dest + ".part", dest);
}

// ── encode what is missing ──
const have = texts.filter(t => fs.existsSync(path.join(wavDir, t.key + ".wav")));
const missingWav = texts.length - have.length;
const bad = [];
let done = 0, next = 0;
const todo = have.filter(t => {
  const enc = path.join(encDir, `${t.key}.${FMT.ext}`);
  const wav = path.join(wavDir, t.key + ".wav");
  return !(fs.existsSync(enc) && fs.statSync(enc).mtimeMs >= fs.statSync(wav).mtimeMs);
});
console.log(`${lang}: ${have.length}/${texts.length} clips have audio; encoding ${todo.length} (${fmtName} ${bitrate} kbps, ${jobs} at a time)`);
async function worker() {
  while (next < todo.length) {
    const t = todo[next++];
    try { await encode(path.join(wavDir, t.key + ".wav"), path.join(encDir, `${t.key}.${FMT.ext}`)); }
    catch (e) { bad.push({ t, why: e.message.split("\n").pop() }); }
    if (++done % 250 === 0) console.log(`  ${done}/${todo.length}`);
  }
}
await Promise.all(Array.from({ length: jobs }, worker));
if (bad.length) {
  console.log(`  ${bad.length} clip(s) could not be encoded and are left out (they keep the system voice):`);
  bad.slice(0, 10).forEach(b => console.log(`    ${b.t.text}  —  ${b.why}`));
}
const badKeys = new Set(bad.map(b => b.t.key));

// ── lay the clips into shards ──
// What is published now (if anything): its shard count per kind keeps the
// layout stable between builds, and its files are what existing users have.
let prev = null;
try { prev = JSON.parse(fs.readFileSync(path.join(outDir, "manifest.json"), "utf8")); } catch (e) {}
const bucketOf = (deck, n) => parseInt(crypto.createHash("sha1").update(String(deck)).digest("hex").slice(0, 8), 16) % n;
const shards = [];                     // { f, k, n, h, buf }
const idx = {};
const tot = { w: { n: 0, b: 0 }, s: { n: 0, b: 0 } };
const buckets = {};
for (const kind of ["w", "s"]) {
  const clips = have.filter(x => x.kind === kind && !badKeys.has(x.key)).map(t => ({ t, buf: fs.readFileSync(path.join(encDir, `${t.key}.${FMT.ext}`)) }));
  const bytes = clips.reduce((n, c) => n + c.buf.length, 0);
  const wanted = Math.max(1, Math.round(bytes / shardBytes));
  const fixed = +opt("buckets-" + kind, 0) || (prev && prev.buckets && prev.buckets[kind]) || wanted;
  buckets[kind] = fixed;
  if (prev && fixed && bytes / fixed > 2.5 * shardBytes) console.log(`  note: ${kind === "w" ? "word" : "sentence"} shards are now ~${(bytes / fixed / 1048576).toFixed(1)} MB each (target ${(shardBytes / 1048576).toFixed(1)}). Re-split with --buckets-${kind} ${wanted} (this changes every shard once).`);
  const groups = Array.from({ length: fixed }, () => []);
  for (const c of clips) groups[bucketOf(c.t.deck || c.t.key, fixed)].push(c);
  groups.forEach((g, bi) => {
    if (!g.length) return;
    g.sort((a, b) => (a.t.key < b.t.key ? -1 : 1));          // order inside a shard never depends on deck order
    const si = shards.length;
    let off = 0;
    for (const c of g) { idx[c.t.key] = [si, off, c.buf.length]; off += c.buf.length; tot[kind].n++; tot[kind].b += c.buf.length; }
    const buf = Buffer.concat(g.map(c => c.buf));
    const h = crypto.createHash("sha256").update(buf).digest("hex").slice(0, 16);
    shards.push({ f: `${kind}${String(bi).padStart(3, "0")}.${h}.bin`, k: kind, n: buf.length, h, buf });
  });
}
if (!shards.length) { console.error("Nothing to pack: no WAV files yet. Run synth.py first."); process.exit(1); }

// ── write ──
fs.mkdirSync(outDir, { recursive: true });
const keep = new Set(["manifest.json"]);
for (const s of shards) {
  keep.add(s.f);
  const p = path.join(outDir, s.f);
  if (!fs.existsSync(p) || fs.statSync(p).size !== s.n) fs.writeFileSync(p, s.buf);
}
for (const f of fs.readdirSync(outDir)) if (!keep.has(f)) fs.unlinkSync(path.join(outDir, f));
const v = crypto.createHash("sha256").update(shards.map(s => s.h).join(",") + JSON.stringify(idx)).digest("hex").slice(0, 12);
const manifest = {
  fmt: 1, v, lang, mime: FMT.mime, voice, bitrate, buckets,
  tot: { w: { n: tot.w.n, b: tot.w.b }, s: { n: tot.s.n, b: tot.s.b } },
  shards: shards.map(({ f, k, n, h }) => ({ f, k, n, h })),
  idx,
};
fs.writeFileSync(path.join(outDir, "manifest.json"), JSON.stringify(manifest));

const mb = b => (b / 1048576).toFixed(1) + " MB";
console.log(`\n${lang}: wrote ${shards.length} shards to ${path.relative(ROOT, outDir)}/`);
console.log(`  words/phrases: ${tot.w.n} clips, ${mb(tot.w.b)}`);
console.log(`  sentences:     ${tot.s.n} clips, ${mb(tot.s.b)}`);
console.log(`  everything:    ${mb(tot.w.b + tot.s.b)}   (manifest ${(fs.statSync(path.join(outDir, "manifest.json")).size / 1024).toFixed(0)} KB, version ${v})`);
if (missingWav) console.log(`  ${missingWav} texts have no audio yet and will use the system voice.`);
if (prev && Array.isArray(prev.shards)) {
  const old = new Set(prev.shards.map(x => x.f));
  const changed = shards.filter(x => !old.has(x.f));
  const mbChanged = changed.reduce((n, x) => n + x.n, 0);
  console.log(`  vs the pack that was published: ${changed.length} of ${shards.length} shards changed — people who already have it download ${mb(mbChanged)} (everything else is kept).`);
} else console.log("  first build: nothing published yet to compare with.");
