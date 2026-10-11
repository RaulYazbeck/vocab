// sync-merge.js rules for the streak, today's quests and the path's day
// (pure, no browser): node test-merge.mjs
import fs from "node:fs"; import vm from "node:vm";
const src = fs.readFileSync(new URL("../../js/sync-merge.js", import.meta.url), "utf8");
const ctx = {}; vm.createContext(ctx); vm.runInContext(src + "\n;this.mergeStates = mergeStates;", ctx);
const merge = (l, c, o = {}) => ctx.mergeStates(l, c, o);
let pass = 0, fail = 0; const ok = (c, m, x = "") => { if (c) pass++; else { fail++; console.log("  ✗", m, x); } };
const J = JSON.stringify;

// A quest day: m.ok right answers, `done` quests finished.
const quests = (day, okN = 0, extra = {}) => ({ day, m: { ok: okN, game: 0 }, list: [{ tpl: "a_plan", done: false }, { tpl: "b_x", done: false }],
  qdays: [], kept: [], frozen: [], freezes: 1, gold: 0, ...extra });
const path = (day, extra = {}) => ({ day, sessionLen: "regular", newPerDay: 10, deadline: "2027-08-15", extraToday: 0, spotToday: 0,
  plan: day ? { v: 5, day, reviews: 100, leave: 0, target: 150 } : null, lastActiveDay: day, ...extra });

// ── what happened: the web kept 3 days, the phone (3 days old) opened
// today, rolled over on its old copy and a tap stamped it newer ──
const web = { savedAt: 2000, quests: quests("2026-10-10", 81, { kept: ["2026-10-08", "2026-10-09", "2026-10-10"], freezes: 2 }),
  path: path("2026-10-10", { plan: { v: 5, day: "2026-10-10", reviews: 60, leave: 0, target: 60 } }), words: {} };
const phone = { savedAt: 3000, quests: quests("2026-10-11", 0, { kept: ["2026-10-08"], frozen: ["2026-10-09"], freezes: 0 }),
  path: path("2026-10-11", { sessionLen: "long", plan: { v: 5, day: "2026-10-11", reviews: 40, leave: 156, target: 60 } }), words: {} };
let m = merge(phone, web, { localWins: true });
ok(J(m.quests.kept) === J(["2026-10-08", "2026-10-09", "2026-10-10"]), "kept days: both sides'", J(m.quests.kept));
ok(J(m.quests.frozen) === J(["2026-10-09"]), "frozen days: both sides'", J(m.quests.frozen));
ok(m.quests.day === "2026-10-10" && m.quests.freezes === 2, "an untouched new day on a stale copy loses to the day with progress (re-rolled after)", m.quests.day + " " + m.quests.freezes);
ok(m.path.plan.day === "2026-10-10" && m.path.day === "2026-10-10", "… and so does its plan (made from stale words)", J(m.path.plan));
ok(m.path.sessionLen === "long", "path settings: the side that saved last", m.path.sessionLen);
ok(m.path.lastActiveDay === "2026-10-11", "last active day: the later");
// the same, seen from the web's side
m = merge(web, phone, { localWins: false });
ok(m.quests.day === "2026-10-10" && m.path.plan.day === "2026-10-10" && m.quests.kept.length === 3, "same result merged the other way round");

// ── the later day with progress wins (studied offline on the phone) ──
const phoneStudied = { ...phone, quests: quests("2026-10-11", 40, { kept: ["2026-10-08"] }), path: path("2026-10-11", { extraToday: 3 }) };
m = merge(phoneStudied, web, { localWins: true });
ok(m.quests.day === "2026-10-11" && m.quests.m.ok === 40, "a later day with answers is kept", m.quests.day);
ok(m.path.plan.day === "2026-10-11" && m.path.extraToday === 3, "… and its path day too");
ok(m.quests.kept.length === 3, "… while the other side's kept days stay");
m = merge(web, phoneStudied, { localWins: false });
ok(m.quests.day === "2026-10-11", "a later cloud day with answers is kept");

// ── same day: more done wins; a tie — the cloud's ──
const a = { savedAt: 5, quests: quests("2026-10-11", 10), path: path("2026-10-11", { plan: { v: 5, day: "2026-10-11", reviews: 1, target: 10 } }) };
const b = { savedAt: 4, quests: quests("2026-10-11", 30), path: path("2026-10-11", { plan: { v: 5, day: "2026-10-11", reviews: 2, target: 20 } }) };
m = merge(a, b, { localWins: true });
ok(m.quests.m.ok === 30 && m.path.plan.reviews === 2, "same day: the side with more done", m.quests.m.ok);
m = merge(b, a, { localWins: false });
ok(m.quests.m.ok === 30 && m.path.plan.reviews === 2, "same day: the side with more done (local)");
const a0 = { ...a, quests: quests("2026-10-11", 0) }, b0 = { ...b, quests: quests("2026-10-11", 0) };
m = merge(a0, b0, { localWins: true });
ok(m.path.plan.reviews === 2, "same day, nothing done on either: the cloud's plan", J(m.path.plan));
const doneOne = quests("2026-10-11", 0); doneOne.list[1].done = true;
m = merge({ ...a0, quests: doneOne }, b0, { localWins: false });
ok(m.quests.list[1].done === true, "a finished quest counts as progress");

// ── both on old days, nothing today: the later one with progress ──
m = merge({ quests: quests("2026-10-09", 5), path: path("2026-10-09") }, { quests: quests("2026-10-10", 0), path: path("2026-10-10") }, {});
ok(m.quests.day === "2026-10-09", "later day without progress loses to an earlier one with", m.quests.day);
m = merge({ quests: quests("2026-10-09", 0), path: path("2026-10-09") }, { quests: quests("2026-10-10", 0), path: path("2026-10-10") }, {});
ok(m.quests.day === "2026-10-09", "neither has progress: the earlier (re-rolled on merged data)", m.quests.day);

// ── counters riding inside quests still add up ──
m = merge({ quests: quests("2026-10-11", 0, { gold: 15 }) }, { quests: quests("2026-10-10", 9, { gold: 12 }) }, { base: { "quests.gold": 10 } });
ok(m.quests.gold === 17, "quest gold: base + both gains", m.quests.gold);
ok(J(m.quests.qdays) === "[]", "qdays still a union");

// ── a side without quests / path (an old save) ──
m = merge({ words: {} }, web, { localWins: true });
ok(m.quests.kept.length === 3 && m.path.plan.day === "2026-10-10", "a save without quests keeps the other side's");
// ── reset all on one side: its streak days stand ──
m = merge({ ...phone, resetAllAt: 9 }, web, { localWins: true });
ok(J(m.quests.kept) === J(["2026-10-08"]), "a newer reset-all keeps its own days", J(m.quests.kept));

console.log(`merge: ${pass} passed, ${fail} failed`); process.exit(fail ? 1 : 0);
