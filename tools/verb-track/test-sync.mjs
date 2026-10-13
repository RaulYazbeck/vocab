// S.verb merges between two devices (sync-merge.js is pure).
import fs from "node:fs"; import vm from "node:vm";
const src = fs.readFileSync(new URL("../../js/sync-merge.js", import.meta.url), "utf8");
const ctx = {}; vm.createContext(ctx); vm.runInContext(src + "\n;this.mergeStates = mergeStates;", ctx);
let pass = 0, fail = 0; const ok = (c, m, x = "") => { if (c) pass++; else { fail++; console.log("  ✗", m, x); } };
const A = { verb: { on: "2026-10-11", onAt: 1000, tu: { pr: 2, pf: 2, im: 1 }, sh: { im1: 100 }, sr: { im1: 1 }, cov: { gehen: 1, machen: 3 }, day: "2026-10-12", ni: 2, nc: 5, ns: 1, rot: { "pr-end": 4 } },
  words: { "vx_r:pr-end": { st: 3, sAt: 5, correct: 2, wrong: 0 } } };
const B = { verb: { on: "", onAt: 0, tu: { pr: 1 }, sh: { im2: 80 }, sr: { im2: 1 }, cov: { gehen: 4, sein: 1 }, day: "2026-10-12", ni: 1, nc: 7, ns: 2 },
  words: { "vx_r:pr-end": { st: 4, sAt: 9, correct: 3, wrong: 1 } } };
let m = ctx.mergeStates(A, B, { localWins: false });
ok(m.verb.on === "2026-10-11", "switch-on from the side that decided last", m.verb.on);
ok(m.verb.tu.pr === 2 && m.verb.tu.im === 1, "tense states: the higher");
ok(m.verb.sh.im1 === 100 && m.verb.sh.im2 === 80, "quiz scores from both");
ok(m.verb.cov.gehen === 5 && m.verb.cov.machen === 3 && m.verb.cov.sein === 1, "coverage bits OR-ed", JSON.stringify(m.verb.cov));
ok(m.verb.nc === 7 && m.verb.ni === 2 && m.verb.ns === 2, "same-day counters: the higher");
ok(m.words["vx_r:pr-end"].st === 4, "verb items merge like words (latest activity wins)");
// switching off later wins
const C = { verb: { ...A.verb, on: "", onAt: 2000 } };
m = ctx.mergeStates(A, C, { localWins: true });
ok(m.verb.on === "", "a later switch-off sticks");
// a device that never had S.verb
m = ctx.mergeStates({ words: {} }, A, { localWins: true });
ok(m.verb && m.verb.on === "2026-10-11", "an old device's save keeps the cloud's verb track");
// today's sheets: one on each device = two used; plan answers per sheet the higher
const P = { verb: { day: "2026-10-12", ns: 1, su: { im1: 1 }, sq: { im1: 5, im2: 2 } } };
const L = { verb: { day: "2026-10-12", ns: 1, su: { pt11: 1 }, sq: { im2: 3 } } };
m = ctx.mergeStates(P, L, { localWins: true });
ok(Object.keys(m.verb.su).sort().join() === "im1,pt11" && m.verb.ns === 1, "same day: today's sheets of both devices (two used)", JSON.stringify(m.verb.su));
ok(m.verb.sq.im1 === 5 && m.verb.sq.im2 === 3, "same day: each sheet's plan answers the higher", JSON.stringify(m.verb.sq));
m = ctx.mergeStates({ verb: { ...P.verb, day: "2026-10-11" } }, L, { localWins: true });
ok(JSON.stringify(m.verb.su) === '{"pt11":1}' && JSON.stringify(m.verb.sq) === '{"im2":3}', "another day: the later day's sheets only", JSON.stringify(m.verb));
m = ctx.mergeStates({ verb: { day: "2026-10-12", ns: 2 } }, L, { localWins: true });
ok(m.verb.ns === 2 && JSON.stringify(m.verb.su) === '{"pt11":1}', "an older app (ns only) still counts", JSON.stringify(m.verb));
console.log(`sync: ${pass} passed, ${fail} failed`); process.exit(fail ? 1 : 0);
