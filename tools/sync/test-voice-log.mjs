// The voice log across devices — nothing anyone wrote is ever lost (no browser):
//   node test-voice-log.mjs [seeds=150] [steps=400]
//   SEED=13 TRACE="Satz 3" node test-voice-log.mjs   (one run, following one phrase)
//
// Four devices, each running the app's own code (js/sync-merge.js +
// js/audio.js) with its own state and a clock that is off by up to ±30 s,
// flag recordings (keeping the note, leaving it empty, or writing a new one
// over the old), note phrases without a recording, copy the log out ("Copy
// voice log") and sync with the cloud, at random, in any order. Checked:
//   • nothing is lost: every flagging and every noting is either in a copy
//     that was made, or still in the log at the end; every note too, unless
//     a device that had it replaced it on purpose (an edit);
//   • a copy never marks anything done that it didn't show;
//   • every device and the cloud agree once all have synced;
//   • after a last copy and a sync, the log is empty on every device —
//     nothing copied comes back, from any device;
//   • "Copy the last voice log again" gives exactly the last copy.
import fs from "node:fs"; import vm from "node:vm";
const read = f => fs.readFileSync(new URL("../../js/" + f, import.meta.url), "utf8");
const SRC = [read("sync-merge.js"), read("audio.js")];
const TRACE = process.env.TRACE; const tr = (...a) => { if (TRACE) console.log(...a); };
const SEEDS = +(process.argv[2] || 150), STEPS = +(process.argv[3] || 400);
let pass = 0, fail = 0, firstFail = null;
const ok = (c, m, x = "") => { if (c) pass++; else { fail++; if (!firstFail) { firstFail = m; console.log("  ✗", m, String(x).slice(0, 600)); } } };

function rng(seed) { let a = seed >>> 0; return () => { a = (a + 0x6D2B79F5) >>> 0; let t = Math.imul(a ^ (a >>> 15), 1 | a); t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t; return ((t ^ (t >>> 14)) >>> 0) / 4294967296; }; }

function device(name, clock, skew, rnd) {
  const store = new Map(), noop = () => {};
  const sb = {
    console, setTimeout, clearTimeout,
    localStorage: { getItem: k => (store.has(k) ? store.get(k) : null), setItem: (k, v) => store.set(k, String(v)), removeItem: k => store.delete(k) },
    navigator: {}, addEventListener: noop, matchMedia: () => ({ matches: false }),
    document: { querySelector: noop, getElementById: noop, createElement: () => ({ style: {} }), addEventListener: noop, body: { appendChild: noop } },
    crypto: { getRandomValues: a => { for (let i = 0; i < a.length; i++) a[i] = Math.floor(rnd() * 4294967296); return a; } },
    __now: () => clock.t + skew,
  };
  sb.window = sb; sb.self = sb;
  const ctx = vm.createContext(sb);
  vm.runInContext(`var WORD_KEY = "de", STORAGE_KEY = "gv5_de", S = {}; function saveState() {}; Date.now = () => __now();`, ctx);
  SRC.forEach(src => vm.runInContext(src, ctx));
  vm.runInContext(`AUDIO.manifest = { v: "p1", idx: {} };`, ctx);
  const ev = code => vm.runInContext(code, ctx);
  return { name, ctx, ev, log: () => JSON.parse(ev("JSON.stringify(S.voiceLog || null)")) };
}
// What "Copy voice log" put on the clipboard: flags (with notes) and phrases.
function parseCopy(text) {
  const out = { flags: new Map(), misses: new Set() };
  let part = "";
  text.split("\n").slice(1).forEach(l => {
    if (l === "Flagged recordings:") { part = "f"; return; }
    if (l === "Phrases without a recording:") { part = "m"; return; }
    if (part === "f") { const [t, ns] = l.split(" | "); out.flags.set(t, ns ? ns.split(" / ") : []); }
    else if (part === "m") out.misses.add(l);
  });
  return out;
}
const ids = log => new Set(log ? [...log.flags, ...log.misses].flatMap(e => e.ids) : []);

for (let seed = +(process.env.SEED || 1); seed <= (process.env.SEED ? +process.env.SEED : SEEDS) && !firstFail; seed++) {
  const rnd = rng(seed), pick = a => a[Math.floor(rnd() * a.length)];
  const clock = { t: 1.8e12 };
  const devs = ["phone", "laptop", "tablet", "web"].map(n => device(n, clock, Math.round((rnd() - 0.5) * 60000), rnd));
  let cloud = null, noteN = 0;
  const events = [];      // { kind, id, t, n? }
  const editedAway = new Set();   // note ids replaced on purpose (on a device that had them)
  const copied = new Set();       // ids a copy marked done
  const shown = [];               // what each copy showed
  let lastCopy = null;
  const sync = d => {
    // the app: merge with the cloud (mergeStates → syncMergeVoiceLog), then migrate(); the merged copy goes up
    d.ctx.__cloud = cloud;
    d.ev(`S.voiceLog = syncMergeVoiceLog(S.voiceLog, __cloud === null ? null : JSON.parse(__cloud)); migrateVoiceLog();`);
    cloud = JSON.stringify(d.log());
  };
  for (let step = 0; step < STEPS; step++) {
    clock.t += Math.floor(rnd() * 3000);
    const d = pick(devs), r = rnd();
    if (r < 0.32) {
      const t = "Satz " + Math.floor(rnd() * 8);
      const before = d.log(), had = before && before.flags.find(f => f.t === t);
      const mode = rnd();
      const fresh = !(mode < 0.3 || (mode < 0.5 && had));   // a note newly written (else: left empty, or the shown notes kept)
      const note = mode < 0.3 ? "" : !fresh ? d.ev(`audioFlagNote(${JSON.stringify(t)})`) : "note" + ++noteN;
      d.ctx.__t = t; d.ctx.__n = note;
      d.ev(`audioFlag(__t, __n)`);
      if (t === TRACE) tr(step, d.name, "flag", JSON.stringify(note), "had:", JSON.stringify(had), "→", JSON.stringify(d.log().flags.find(x => x.t === t)));
      const f = d.log().flags.find(x => x.t === t);
      const newId = f.ids.find(x => !(had && had.ids.includes(x)));
      ok(!!newId, "a flagging gets its own id", JSON.stringify(f));
      events.push({ kind: "f", id: newId, t });
      if (fresh) {
        if (had && note !== had.ns.map(x => x.n).join(" / ")) had.ns.forEach(x => editedAway.add(x.id));
        events.push({ kind: "n", id: newId, t, n: note });
      }
    } else if (r < 0.52) {
      const t = "Phrase " + Math.floor(rnd() * 8);
      const before = d.log(), had = before && before.misses.find(m => m.t === t);
      d.ctx.__t = t; d.ev(`audioNoteMiss(__t)`);
      if (!had) { const m = d.log().misses.find(x => x.t === t); events.push({ kind: "m", id: m.ids[0], t }); }
    } else if (r < 0.62) {
      // "Copy voice log", the clipboard accepting it
      const snap = d.log();
      if (!snap || !(snap.flags.length + snap.misses.length)) continue;
      const text = d.ev(`(() => { const f = _audioLogList("flags").slice(), m = _audioLogList("misses").slice(), text = audioLogText();
        localStorage.setItem(AUDIO_LAST, JSON.stringify({ text, at: Date.now() })); _audioLogDone(f, m); return text; })()`);
      const got = parseCopy(text);
      // a copy marks done only what it showed: every entry's text (and notes) is in it
      snap.flags.forEach(f => {
        ok(got.flags.has(f.t), `seed ${seed}: a copied flag is in the copy`, f.t);
        f.ns.forEach(x => ok((got.flags.get(f.t) || []).includes(x.n), `seed ${seed}: a copied note is in the copy`, x.n));
      });
      snap.misses.forEach(m => ok(got.misses.has(m.t), `seed ${seed}: a copied phrase is in the copy`, m.t));
      ids(snap).forEach(x => copied.add(x));
      if (TRACE) tr(step, d.name, "COPY", JSON.stringify(snap.flags.find(x => x.t === TRACE)));
      shown.push(got); lastCopy = text;
      ok(!d.log().flags.length && !d.log().misses.length, `seed ${seed}: copying empties the log here`);
    } else {
      const b = d.log(); sync(d);
      if (TRACE) tr(step, d.name, "sync", JSON.stringify(b && b.flags.find(x => x.t === TRACE)), "→", JSON.stringify(d.log().flags.find(x => x.t === TRACE)));
    }
  }
  // everyone syncs (twice round: the last device's changes reach the first)
  for (let i = 0; i < 2; i++) devs.forEach(sync);
  const final = JSON.parse(cloud);
  devs.forEach(d => ok(JSON.stringify(d.log()) === cloud, `seed ${seed}: ${d.name} agrees with the cloud`, JSON.stringify(d.log())));
  // NOTHING LOST
  const finalIds = ids(final);
  const finalNotes = new Map(final ? final.flags.map(f => [f.t, f.ns.map(x => x.n)]) : []);
  events.forEach(e => {
    if (e.kind === "n") {
      if (editedAway.has(e.id)) return;
      const inCopy = shown.some(c => (c.flags.get(e.t) || []).includes(e.n)), still = (finalNotes.get(e.t) || []).includes(e.n);
      ok(inCopy || still, `seed ${seed}: note "${e.n}" on ${e.t} copied or still in the log`, JSON.stringify(final));
    } else {
      ok(copied.has(e.id) || finalIds.has(e.id), `seed ${seed}: ${e.kind === "f" ? "flagging" : "noting"} ${e.id} of ${e.t} copied or still in the log`, JSON.stringify(final));
    }
  });
  ok(final === null || JSON.stringify(final).length < 300000, `seed ${seed}: the log stays far below its bound`);
  // a last copy, then everyone syncs: empty everywhere, nothing comes back
  const d0 = devs[seed % devs.length];
  const text = d0.ev(`(() => { const f = _audioLogList("flags").slice(), m = _audioLogList("misses").slice(), text = audioLogText();
    if (f.length + m.length) { localStorage.setItem(AUDIO_LAST, JSON.stringify({ text, at: Date.now() })); _audioLogDone(f, m); } return text; })()`);
  if (final && final.flags.length + final.misses.length) lastCopy = text;
  for (let i = 0; i < 2; i++) devs.forEach(sync);
  devs.forEach(d => { const l = d.log(); ok(!l || (!l.flags.length && !l.misses.length), `seed ${seed}: after the last copy, ${d.name}'s log is empty`, JSON.stringify(l)); });
  if (lastCopy) {
    const again = d0.ev(`JSON.parse(localStorage.getItem(AUDIO_LAST)).text`);
    if (final && final.flags.length + final.misses.length) ok(again === lastCopy, `seed ${seed}: the last copy can be copied again`);
  }
}
console.log(`voice log: ${pass} passed, ${fail} failed (${SEEDS} runs × ${STEPS} steps, 4 devices, clocks ±30 s)`);
process.exit(fail ? 1 : 0);
