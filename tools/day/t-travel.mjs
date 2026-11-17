// The study day when travelling (js/config.js, THE STUDY DAY): the real
// app in Chromium with a fake clock and the time zone switched mid-run.
//   node t-travel.mjs            (all)    node t-travel.mjs mexico plane …
// Needs playwright-core: `npm install` once in tools/audio/tests.
import fs from "node:fs";
import path from "node:path";
import { createRequire } from "node:module";
import { fileURLToPath } from "node:url";
import { serveRepo } from "./serve.mjs";
const here = path.dirname(fileURLToPath(import.meta.url));
const require = createRequire(path.join(here, "../audio/tests/package.json"));
const { chromium } = require("playwright-core");
const PORT = +(process.env.PORT || 8781);
const BASE = `http://127.0.0.1:${PORT}`;
const ONLY = process.argv.slice(2);
const server = await serveRepo(PORT);
function chrome() {
  const root = process.env.PLAYWRIGHT_BROWSERS_PATH || "/opt/pw-browsers";
  for (const d of fs.readdirSync(root).filter(d => d.startsWith("chromium-")).sort().reverse()) {
    const p = path.join(root, d, "chrome-linux", "chrome");
    if (fs.existsSync(p)) return p;
  }
}
const browser = await chromium.launch({ executablePath: chrome(), args: ["--no-sandbox"] });
const APP = process.env.APP || "de";
const profileSrc = fs.readFileSync(path.join(here, APP === "fr" ? "../verb-track/profile-fr.js" : "../verb-track/profile.js"), "utf8");

let pass = 0, fail = 0;
const ok = (c, m, x) => { if (c) pass++; else { fail++; console.log("  ✗", m, x === undefined ? "" : JSON.stringify(x)); } };
const Z = s => Date.parse(s); // "2026-11-24T08:00:00Z"

// A device: one page, its clock and time zone under the test's control.
async function device({ tz, at, app = APP, setup = null }) {
  const ctx = await browser.newContext({ viewport: { width: 1200, height: 900 } });
  const page = await ctx.newPage();
  const cdp = await ctx.newCDPSession(page);
  const errors = [];
  page.on("pageerror", e => errors.push(String(e.stack || e)));
  page.on("console", m => { if (m.type() === "error" && !/firebase|gstatic|Failed to load resource|net::ERR/i.test(m.text())) errors.push(m.text()); });
  await page.route(/gstatic\.com|googleapis\.com|firebaseio|google\.com/, r => r.abort());
  await page.addInitScript(() => { window.CX_TEST_OFF = true; });
  const d = {
    page, errors, tz,
    async setTz(id) { d.tz = id; await cdp.send("Emulation.setTimezoneOverride", { timezoneId: id }); },
    async setTime(t) { d.now = t; await page.clock.setFixedTime(t); },
    // the app comes back into view (the laptop opened)
    async wake() { await page.evaluate(() => { window.dispatchEvent(new Event("focus")); }); await page.waitForTimeout(30); },
    ev: (fn, arg) => page.evaluate(fn, arg),
    async reload() { await page.reload(); await page.waitForFunction(() => typeof S !== "undefined" && S.words && Object.keys(S.words).length > 500); await page.waitForTimeout(150); },
    close: () => ctx.close(),
  };
  await d.setTz(tz);
  await d.setTime(at);
  await page.goto(BASE + `/${app}/index.html`);
  await page.waitForFunction(() => typeof S !== "undefined" && typeof ALL_GROUPS !== "undefined");
  await page.evaluate(([src, setup]) => {
    eval(src + "\nwindow.vxTestProfile = vxTestProfile;");
    const st = window.vxTestProfile();
    st.lvCurve = 2;
    if (setup) Object.assign(st, JSON.parse(setup));
    localStorage.setItem(APP_CONFIG.storageKey, JSON.stringify(st));
    localStorage.setItem(AUDIO_PREF, JSON.stringify({ asked: true, want: [] }));
  }, [profileSrc, setup ? JSON.stringify(setup) : null]);
  await d.reload();
  return d;
}
// In the page: answer `n` words right (or wrong), the way Drill does.
const ANSWER = ({ n = 3, right = true }) => {
  window.showCelebrateToast = () => {}; window.confettiBurst = () => {};
  const keys = Object.keys(S.words).filter(k => S.words[k].st > 0 && !k.startsWith("vx")).slice(0, 400);
  for (let i = 0; i < n; i++) {
    const key = keys[((S.dayClock.act || 0) * 7 + i) % keys.length];
    const deckId = key.slice(0, key.lastIndexOf("_")), idx = +key.slice(key.lastIndexOf("_") + 1);
    const w = { deckId, idx }, ws = S.words[key];
    if (right) applyCorrect(ws, { w, quiet: true }); else applyWrong(ws, { w });
    logEvent("answer", { m: "drill", ok: right });
    questEvent("answer", { w, ok: right, mode: "drill", typed: true });
  }
  saveLocalOnly();
};
const SNAP = () => ({
  today: todayISO(), clock: clockDayOf(), dc: S.dayClock, qday: S.quests.day, ok: S.quests.m.ok || 0, act: S.dayClock.act || 0,
  list: S.quests.list.map(q => q.tpl + ":" + (q.prog || 0)).join(","), freezes: S.quests.freezes, frozen: S.quests.frozen.slice(),
  refunded: (S.quests.refunded || []).slice(), qdays: S.quests.qdays.slice(), kept: S.quests.kept.slice(), pday: S.path.day,
  plan: S.path.plan ? S.path.plan.day : null, vday: S.verb ? S.verb.day : null, start0: studyDayStart(0), start1: studyDayStart(1),
  stash: localStorage.getItem(STORAGE_KEY + "_dayundo"), saved: JSON.parse(localStorage.getItem(STORAGE_KEY)).quests.day,
  savedClock: JSON.parse(localStorage.getItem(STORAGE_KEY)).dayClock, streak: questStreak(),
});
// A Zurich learner with a streak going (Sat–Mon done) and one freeze.
const STREAK = { quests: { day: "", list: [], qdays: ["2026-11-21", "2026-11-22", "2026-11-23"], kept: [], frozen: [], freezes: 1 } };

const scenarios = {
  // ── At home: the study day is exactly the clock's, every hour, in every
  // time zone, across daylight saving — nothing held, nothing taken back.
  async home() {
    for (const tz of ["Europe/Zurich", "America/Mexico_City", "Asia/Tokyo", "Pacific/Kiritimati", "Pacific/Pago_Pago", "Asia/Kathmandu", "Pacific/Chatham", "Australia/Lord_Howe", "America/New_York"]) {
      for (const [from, hours] of [["2027-03-26T12:00:00Z", 96], ["2027-10-29T12:00:00Z", 96], ["2026-11-20T12:00:00Z", 30]]) {
        const d = await device({ tz, at: Z(from) });
        let bad = [];
        for (let h = 0; h < hours; h++) {
          await d.setTime(Z(from) + h * 3600e3 + 17 * 60e3);
          if (h % 5 === 2) await d.ev(ANSWER, { n: 1 });
          const r = await d.ev(() => {
            const now = Date.now();
            questEnsureToday();
            return { t: todayISO(), c: clockDayOf(now), s0: studyDayStart(0), c0: clockDayStart(0), s1: studyDayStart(1), c1: clockDayStart(1), s3: studyDayStart(3), c3: clockDayStart(3),
              u: usageDateOf(now), ul: usageDateOf(now - 3600e3), cl: clockDayOf(now - 3600e3), q: S.quests.day, back: _usageLog().some(e => e.e === "day_back") };
          });
          if (r.t !== r.c || r.s0 !== r.c0 || r.s1 !== r.c1 || r.s3 !== r.c3 || r.u !== r.c || r.ul !== r.cl || r.q !== r.t || r.back) bad.push([h, r]);
        }
        ok(!bad.length, `home ${tz} from ${from}: the day, its start, tomorrow's start and the log's day are the clock's, every hour`, bad.slice(0, 2));
        ok(!d.errors.length, `home ${tz}: no errors`, d.errors.slice(0, 3));
        await d.close();
      }
    }
  },

  // ── The Mexico flight: Tuesday studied a little in Zurich; the laptop is
  // opened on the plane still on Zurich time after 4 AM (Wednesday starts,
  // Tuesday's missed → a freeze); landing at 11 PM in Mexico, Tuesday is
  // back, as it was, with its freeze.
  async mexico() {
    const d = await device({ tz: "Europe/Zurich", at: Z("2026-11-24T08:00:00Z"), setup: STREAK });
    await d.ev(ANSWER, { n: 3 });
    const tue = await d.ev(SNAP);
    ok(tue.today === "2026-11-24" && tue.ok === 3 && tue.freezes === 1, "Tuesday in Zurich: 3 right answers", tue);
    // On the plane, Zurich time Wed 05:00
    await d.setTime(Z("2026-11-25T04:00:00Z")); await d.wake();
    const wed = await d.ev(SNAP);
    ok(wed.today === "2026-11-25" && wed.qday === "2026-11-25" && wed.ok === 0, "on the plane (Zurich clock, 5 AM Wed): Wednesday starts", wed);
    ok(wed.frozen.includes("2026-11-24") && wed.freezes === 0, "…and Tuesday took the freeze", wed);
    ok(!!wed.stash && JSON.parse(wed.stash).from === "2026-11-24", "…Tuesday is kept on this device, one step back");
    ok(wed.saved === "2026-11-25", "…and the new day is saved");
    // Landing: 11 PM in Mexico City (= Wed 06:00 Zurich); the laptop's time zone switches
    await d.setTime(Z("2026-11-25T05:00:00Z")); await d.setTz("America/Mexico_City"); await d.wake();
    await d.page.waitForTimeout(50);
    const back = await d.ev(SNAP);
    ok(back.today === "2026-11-24" && back.qday === "2026-11-24", "landed (11 PM Tue in Mexico): it's Tuesday again", back);
    ok(back.ok === 3 && back.list === tue.list, "…with Tuesday's quests and their progress", [back.list, tue.list]);
    ok(back.freezes === 1 && !back.frozen.includes("2026-11-24") && back.refunded.includes("2026-11-24"), "…and the freeze is back", back);
    ok(back.pday === "2026-11-24" && back.plan === tue.plan && back.vday === tue.vday, "…the plan and verb day too", [back.pday, back.plan, back.vday]);
    ok(back.dc.day === "2026-11-24" && back.dc.start === tue.dc.start, "…the day still began when it began (4 AM Zurich)", [back.dc, tue.dc]);
    ok(back.saved === "2026-11-24" && back.savedClock.day === "2026-11-24" && !back.stash, "…saved at once, and the kept copy let go", [back.saved, back.stash]);
    ok(back.streak === 3, "streak: 3 (Tuesday not done yet, still open)", back.streak);
    // Finish Tuesday in Mexico
    const goal = await d.ev(() => getDailyGoal());
    await d.ev(ANSWER, { n: goal });
    const done = await d.ev(SNAP);
    ok(done.today === "2026-11-24" && done.ok === 3 + goal && done.kept.concat(done.qdays).includes("2026-11-24"), "answers in Mexico count for Tuesday (kept)", done);
    ok(done.streak === 4, "streak 4 with Tuesday", done.streak);
    // A reload in between changes nothing
    await d.reload();
    const rl = await d.ev(SNAP);
    ok(rl.today === "2026-11-24" && rl.ok === done.ok, "a reload: still Tuesday, nothing lost", rl);
    // 4 AM Wednesday in Mexico: Wednesday, with Tuesday counted and the freeze kept
    await d.setTime(Z("2026-11-25T10:05:00Z")); await d.wake();
    const wed2 = await d.ev(SNAP);
    ok(wed2.today === "2026-11-25" && wed2.qday === "2026-11-25" && wed2.ok === 0 && wed2.freezes === 1 && !wed2.frozen.includes("2026-11-24"), "4 AM Wed in Mexico: Wednesday, Tuesday counted, freeze kept", wed2);
    ok(wed2.dc.start === Z("2026-11-25T10:00:00Z"), "…Wednesday began at 4 AM Mexico time", wed2.dc);
    ok(wed2.streak === 4, "streak still 4", wed2.streak);
    ok(!d.errors.length, "mexico: no errors", d.errors);
    await d.close();
  },

  // ── The same, but Tuesday not touched before the flight (no stash needed
  // for quests to be fresh; the freeze still comes back).
  async untouched() {
    const d = await device({ tz: "Europe/Zurich", at: Z("2026-11-24T08:00:00Z"), setup: STREAK });
    await d.setTime(Z("2026-11-25T04:00:00Z")); await d.wake();
    await d.setTime(Z("2026-11-25T05:00:00Z")); await d.setTz("America/Mexico_City"); await d.wake(); await d.page.waitForTimeout(50);
    const s = await d.ev(SNAP);
    ok(s.today === "2026-11-24" && s.freezes === 1 && !s.frozen.includes("2026-11-24"), "untouched Tuesday: back, freeze back", s);
    ok(!d.errors.length, "untouched: no errors", d.errors);
    await d.close();
  },

  // ── Studied on the plane (Zurich clock): that day is kept — after landing
  // it stays Wednesday until the clock reaches Wednesday, and then on to
  // Thursday 4 AM local. Words answered then are due from Thursday on.
  async plane() {
    const d = await device({ tz: "Europe/Zurich", at: Z("2026-11-24T08:00:00Z"), setup: STREAK });
    await d.ev(ANSWER, { n: 2 });
    await d.setTime(Z("2026-11-25T04:00:00Z")); await d.wake();
    await d.ev(ANSWER, { n: 2 });
    const wed = await d.ev(SNAP);
    ok(wed.today === "2026-11-25" && wed.ok === 2, "on the plane: Wednesday, 2 answers", wed);
    await d.setTime(Z("2026-11-25T05:00:00Z")); await d.setTz("America/Mexico_City"); await d.wake(); await d.page.waitForTimeout(50);
    const held = await d.ev(SNAP);
    ok(held.today === "2026-11-25" && held.qday === "2026-11-25" && held.ok === 2, "landed: still Wednesday (studied on)", held);
    ok(held.start0 === Z("2026-11-25T03:00:00Z"), "…which began at 4 AM Zurich", held.start0);
    ok(held.start1 === Z("2026-11-26T10:00:00Z"), "…and ends at 4 AM Thursday Mexico time", held.start1);
    const due = await d.ev(() => { const key = Object.keys(S.words).find(k => S.words[k].st === 1 && !k.startsWith("vx")); const ws = S.words[key]; const i = key.lastIndexOf("_");
      ws.dueAt = Date.now() - 1000; ws.sAt = Date.now() - 2 * 864e5; ws.lrn = 0; ws.rp = 0; ws.fl = 0;
      applyCorrect(ws, { w: { deckId: key.slice(0, i), idx: +key.slice(i + 1) }, quiet: true }); return { dueAt: ws.dueAt, day: usageDateOf(Date.now()) }; });
    ok(due.dueAt >= Z("2026-11-26T10:00:00Z"), "a word answered now is due on a later day, not later today", due);
    ok(due.day === "2026-11-25", "the log files it under Wednesday", due.day);
    await d.reload();
    const rl = await d.ev(SNAP);
    ok(rl.today === "2026-11-25" && rl.ok === 2 && rl.qday === "2026-11-25", "a reload while held: still Wednesday", rl);
    // Wed 03:00 Mexico: clock still Tuesday — held
    await d.setTime(Z("2026-11-25T09:00:00Z")); await d.wake();
    ok((await d.ev(SNAP)).today === "2026-11-25", "3 AM Wed Mexico: Wednesday");
    // Wed 18:00 Mexico: the clock caught up — same day, same quests
    await d.setTime(Z("2026-11-26T00:00:00Z")); await d.wake();
    const caught = await d.ev(SNAP);
    ok(caught.today === "2026-11-25" && caught.ok === 2 && caught.list === rl.list, "6 PM Wed Mexico: the same Wednesday", caught);
    await d.setTime(Z("2026-11-26T10:01:00Z")); await d.wake();
    const thu = await d.ev(SNAP);
    ok(thu.today === "2026-11-26" && thu.qday === "2026-11-26", "4 AM Thu Mexico: Thursday", thu);
    ok(!d.errors.length, "plane: no errors", d.errors);
    await d.close();
  },

  // ── Only wrong answers on the new day still count as having begun it.
  async wrongonly() {
    const d = await device({ tz: "Europe/Zurich", at: Z("2026-11-24T08:00:00Z"), setup: STREAK });
    await d.setTime(Z("2026-11-25T04:00:00Z")); await d.wake();
    await d.ev(ANSWER, { n: 1, right: false });
    await d.setTime(Z("2026-11-25T05:00:00Z")); await d.setTz("America/Mexico_City"); await d.wake();
    const s = await d.ev(SNAP);
    ok(s.today === "2026-11-25", "one wrong answer on the plane: the day is kept", s);
    // a day with only a word answered (no quest event at all) is kept too
    const d2 = await device({ tz: "Europe/Zurich", at: Z("2026-11-24T08:00:00Z"), setup: STREAK });
    await d2.setTime(Z("2026-11-25T04:00:00Z")); await d2.wake();
    await d2.ev(() => { const k = Object.keys(S.words)[5]; S.words[k].lastAnsweredAt = Date.now(); });
    await d2.setTime(Z("2026-11-25T05:00:00Z")); await d2.setTz("America/Mexico_City"); await d2.wake();
    ok((await d2.ev(SNAP)).today === "2026-11-25", "a word answered anywhere (no event): kept");
    ok(!d.errors.length && !d2.errors.length, "wrongonly: no errors", d.errors.concat(d2.errors));
    await d.close(); await d2.close();
  },

  // ── Flying east (Zurich → Tokyo): the day ends at the new 4 AM; no day
  // skipped, none repeated, the new day begins no earlier than the old one
  // was last seen.
  async tokyo() {
    const d = await device({ tz: "Europe/Zurich", at: Z("2026-11-23T19:00:00Z"), setup: STREAK });
    await d.ev(ANSWER, { n: 2 });
    const mon = await d.ev(SNAP);
    await d.setTime(Z("2026-11-24T05:00:00Z")); await d.setTz("Asia/Tokyo"); await d.wake();
    const tue = await d.ev(SNAP);
    ok(mon.today === "2026-11-23" && tue.today === "2026-11-24" && tue.qday === "2026-11-24" && tue.ok === 0, "Mon in Zurich → 2 PM Tue in Tokyo: Tuesday, fresh", [mon.today, tue]);
    ok(tue.dc.start >= Z("2026-11-23T19:00:00Z") && tue.dc.start <= Z("2026-11-24T05:00:00Z"), "Tuesday began after Monday was last open", tue.dc);
    const st = await d.ev(() => usageDateOf(Date.parse("2026-11-23T19:00:00Z")));
    ok(st === "2026-11-23", "Monday's answers stay Monday's", st);
    ok(!d.errors.length, "tokyo: no errors", d.errors);
    await d.close();
  },

  // ── Across the date line, the most the clock can move back: +14 → −12
  // (26 h, two calendar days with the 4 AM rollover). Studied: held.
  async dateline() {
    const d = await device({ tz: "Etc/GMT-14", at: Z("2026-11-24T16:00:00Z"), setup: STREAK }); // Wed 06:00 at +14
    await d.ev(ANSWER, { n: 1 });
    const a = await d.ev(SNAP);
    await d.setTime(Z("2026-11-24T17:00:00Z")); await d.setTz("Etc/GMT+12"); await d.wake(); // Mon 05:00 at −12
    const b = await d.ev(SNAP);
    ok(a.today === "2026-11-25" && b.clock === "2026-11-24" && b.today === "2026-11-25", "+14 → −12, studied: the day is kept", [a.today, b.clock, b.today]);
    await d.setTime(Z("2026-11-24T15:00:00Z")); // Mon 03:00 at −12 → clock Sunday (2 days behind)
    await d.wake();
    const c = await d.ev(SNAP);
    ok(c.clock === "2026-11-23" && c.today === "2026-11-25", "two days behind (the most possible): still kept", [c.clock, c.today]);
    ok(!d.errors.length, "dateline: no errors", d.errors);
    await d.close();
  },

  // ── A clock set wrong (years ahead) and put right: an untouched day comes
  // back whole; a day studied on is not held (it can't be real) and the
  // freezes the jump spent come back.
  async wrongclock() {
    const d = await device({ tz: "Europe/Zurich", at: Z("2026-11-24T08:00:00Z"), setup: STREAK });
    await d.ev(ANSWER, { n: 3 });
    const tue = await d.ev(SNAP);
    await d.setTime(Z("2031-01-01T12:00:00Z")); await d.wake();
    await d.setTime(Z("2026-11-24T09:00:00Z")); await d.wake(); await d.page.waitForTimeout(50);
    const s = await d.ev(SNAP);
    ok(s.today === "2026-11-24" && s.ok === 3 && s.list === tue.list && s.freezes === 1, "untouched: Tuesday back as it was", s);
    await d.setTime(Z("2031-01-01T12:00:00Z")); await d.wake();
    await d.ev(ANSWER, { n: 1 });
    await d.setTime(Z("2026-11-24T10:00:00Z")); await d.wake(); await d.page.waitForTimeout(50);
    const s2 = await d.ev(SNAP);
    ok(s2.today === "2026-11-24" && s2.qday === "2026-11-24" && s2.freezes === 1 && !s2.frozen.some(x => x >= "2026-11-24"), "studied in 2031: back to today anyway, freezes back", s2);
    ok(!d.errors.length, "wrongclock: no errors", d.errors);
    await d.close();
  },

  // ── Random trips: hours pass, the time zone hops around the world,
  // sometimes study. Always: the study day is never behind the clock nor
  // more than 2 days ahead; a day studied on never goes back; the quests
  // are on it; freezes stay within 0–2; no day counted is in the future.
  async fuzz() {
    const TZ = ["Europe/Zurich", "America/Mexico_City", "Asia/Tokyo", "Pacific/Kiritimati", "Pacific/Pago_Pago", "America/Los_Angeles", "Asia/Kolkata", "Australia/Sydney", "America/Sao_Paulo", "Etc/GMT+12"];
    let seed = +(process.env.SEED || 11);
    const rnd = () => { seed = (seed * 1103515245 + 12345) % 2147483648; return seed / 2147483648; };
    for (let run = 0; run < +(process.env.RUNS || 6); run++) {
      let t = Z("2026-11-24T08:00:00Z");
      const d = await device({ tz: "Europe/Zurich", at: t, setup: STREAK });
      let prev = null, bad = [];
      for (let step = 0; step < 70; step++) {
        t += Math.floor(rnd() * 14 * 3600e3);
        await d.setTime(t);
        if (rnd() < 0.35) await d.setTz(TZ[Math.floor(rnd() * TZ.length)]);
        await d.wake();
        if (rnd() < 0.4) await d.ev(ANSWER, { n: 1 + Math.floor(rnd() * 3), right: rnd() < 0.8 });
        if (rnd() < 0.1) await d.reload();
        const s = await d.ev(() => { questEnsureToday(); return { today: todayISO(), clock: clockDayOf(), q: S.quests.day, act: S.dayClock.act || 0, fr: S.quests.freezes,
          future: [...S.quests.qdays, ...S.quests.kept, ...S.quests.frozen].filter(x => x > todayISO()), start: S.dayClock.start, now: Date.now() }; });
        const behind = s.today < s.clock, ahead = (Date.parse(s.today) - Date.parse(s.clock)) / 864e5;
        if (behind || ahead > 2 || s.q !== s.today || !(s.fr >= 0 && s.fr <= 2) || s.future.length || s.start > s.now) bad.push([step, d.tz, s]);
        if (prev && prev.act > 0 && s.today < prev.today) bad.push([step, "studied day went back", d.tz, prev, s]);
        prev = s;
      }
      ok(!bad.length, `fuzz run ${run}: invariants hold over 70 random steps`, bad.slice(0, 2));
      ok(!d.errors.length, `fuzz run ${run}: no errors`, d.errors.slice(0, 3));
      await d.close();
    }
  },
};

for (const [name, fn] of Object.entries(scenarios)) {
  if (ONLY.length && !ONLY.includes(name)) continue;
  const p0 = pass, f0 = fail;
  try { await fn(); } catch (e) { fail++; console.log("  ✗", name, "threw", e.stack || e); }
  console.log(`${fail > f0 ? "✗" : "✓"} ${name}: ${pass - p0} passed${fail > f0 ? `, ${fail - f0} failed` : ""}`);
}
await browser.close();
server.close();
console.log(`\n${pass} passed, ${fail} failed`);
process.exit(fail ? 1 : 0);
