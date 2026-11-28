// The writing plan (js/course-de.js cxWriteDue / cxWritePick / cxJournalMin,
// js/course/writing-bank.js — 28 Nov 2026): three texts a week, never two
// days in a row, a skipped day waits; 130 topics that never repeat, by
// level; the words asked grow 5 at a time.
//
// Checked: the bank (130 = A1 12 · A2 60 · B1 58, unique, no topic of the
// older prompts, about a third practical); the week (Mon → Wed → Fri, a
// skipped Monday comes Tuesday, never two days in a row, never a 4th);
// the whole road to 15 Aug 2027 written on every day it's due — ≤ 3 a week,
// no two days running, no topic twice, enough topics for every level
// (the course's level moving A1 → A2 → B1); the ramp (A1 30 → 35, A2 40 →
// 65, B1 70 → 90); Today offers the card only on a writing day; the card
// (topic n of N, the words, text k of 3, "another topic" never brings back
// a written one, Save, "next one comes …"); ☰ › Writing's plan line; the
// Journey's forecast keeps the rule.
//   node t-writing.mjs   (serve the repo root on :8765; tools/day/run-suite.mjs does)
import fs from "node:fs";
import { openApp } from "../verb-track/browser.mjs";
const { browser, page, errors } = await openApp({ course: true });
let pass = 0, fail = 0;
const ok = (c, m, x = "") => { if (c) { pass++; console.log("  ✓", m); } else { fail++; console.log("  ✗", m, x); } };

const r = await page.evaluate(() => {
  const out = {};
  const B = CX.wbank;
  const by = {}; B.forEach(p => { by[p.lv] = (by[p.lv] || 0) + 1; });
  const oldTitles = new Set([...CX.journal.map(p => p.de.toLowerCase()), ...CX.themes.map(t => t.de.toLowerCase())]);
  out.bank = { n: B.length, by, ids: new Set(B.map(p => p.id)).size, titles: new Set(B.map(p => p.de)).size,
    clash: B.filter(p => oldTitles.has(p.de.toLowerCase())).map(p => p.de), tasks: B.filter(p => p.k === "task").length,
    bad: B.filter(p => !p.de || !p.t || !["A1", "A2", "B1"].includes(p.lv) || !["task", "me"].includes(p.k)).map(p => p.id) };

  // ── the week, day by day (pure: the days written as given) ──
  const mon = "2026-11-30";
  const D = i => addDays(mon, i);
  const due = (i, days) => cxWriteDue(D(i), days);
  out.week = {
    mon: due(0, []),                                     // nothing yet: Monday due
    tueAfterMon: due(1, [D(0)]),                         // never two days running
    wedAfterMon: due(2, [D(0)]),
    tueSkippedMon: due(1, ["2026-11-27"]),               // Monday skipped: Tuesday
    sunAfterThree: due(6, [D(0), D(2), D(4)]),           // three this week: no 4th
    monNextWeek: due(7, [D(0), D(2), D(4)]),             // a new week
    satAfterTwo: due(5, [D(1), D(3)]),
    sameDay: due(2, [D(0), D(2)]),
  };
  out.weekStart = [cxWeekStart("2026-11-30"), cxWeekStart("2026-12-06"), cxWeekStart("2026-12-07")];

  // ── the whole road: every due day written, the level moving with the course ──
  const keepLevel = cxLevel, keepW = S.writing;
  S.writing = {};
  const lvOf = d => d < "2026-12-07" ? "A1" : d < "2027-04-12" ? "A2" : "B1";
  let curD = "2026-11-28";
  window.cxLevel = () => lvOf(curD);
  const texts = [], perWeek = {}, mins = {};
  for (let d = "2026-11-28"; d <= "2027-08-15"; d = addDays(d, 1)) {
    curD = d;
    if (!cxWriteDue(d)) continue;
    const p = cxJournalPick(0);
    if (!p) { texts.push({ d, none: true }); continue; }
    mins[p.lv] = mins[p.lv] || []; mins[p.lv].push(cxJournalMin(p));
    const y = d.slice(0, 4), W = cxWritingStore();
    (W[y] || (W[y] = [])).push({ id: "t" + texts.length, d, p: p.id, t: "x", w: 99 });
    texts.push({ d, p: p.id, lv: p.lv });
    const wk = cxWeekStart(d); perWeek[wk] = (perWeek[wk] || 0) + 1;
  }
  const days = texts.map(t => t.d);
  out.road = { n: texts.length, none: texts.filter(t => t.none).length, repeats: texts.length - new Set(texts.map(t => t.p)).size,
    maxWeek: Math.max(...Object.values(perWeek)), weeks: Object.keys(perWeek).length,
    twoInRow: days.some((d, i) => i && daysBetween(days[i - 1], d) < 2),
    wrongLevel: texts.filter(t => t.p && t.lv !== lvOf(t.d)).map(t => t.d + " " + t.lv).slice(0, 5),
    left: cxWritePick().length, byLevel: ["A1", "A2", "B1"].map(l => [l, texts.filter(t => t.lv === l).length]),
    rampEnds: Object.fromEntries(Object.entries(mins).map(([l, m]) => [l, [m[0], m[m.length - 1], [...new Set(m)].join(",")]])) };
  // the ramp, by texts written at a level
  S.writing = {};
  const put = (lv, n) => { const ids = B.filter(p => p.lv === lv).slice(0, n).map(p => p.id); S.writing = { 2026: ids.map((p, i) => ({ id: lv + i, d: "2026-01-01", p, t: "x", w: 99 })) }; };
  out.ramp = {};
  [["A1", 0], ["A1", 6], ["A1", 12], ["A2", 0], ["A2", 9], ["A2", 10], ["A2", 50], ["A2", 60], ["B1", 0], ["B1", 10], ["B1", 40], ["B1", 58]].forEach(([lv, n]) => { put(lv, n); out.ramp[lv + n] = cxJournalMin({ lv }); });
  window.cxLevel = keepLevel; S.writing = keepW || {};
  return out;
});

const b = r.bank;
ok(b.n === 130 && b.by.A1 === 12 && b.by.A2 === 60 && b.by.B1 === 58, `the bank: 130 topics (A1 ${b.by.A1} · A2 ${b.by.A2} · B1 ${b.by.B1})`);
ok(b.ids === 130 && b.titles === 130, "…each id and title once");
ok(!b.clash.length, "…none the title of an older prompt or theme", b.clash.join(", "));
ok(b.tasks >= 39 && b.tasks <= 52, `…about a third practical, as the fide written part (${b.tasks})`);
ok(!b.bad.length, "…every topic complete (title, task, level, kind)", b.bad.join(", "));
const w = r.week;
ok(w.mon === true, "Monday, nothing written yet: a writing day");
ok(w.tueAfterMon === false && w.wedAfterMon === true, "never two days in a row: Tuesday no, Wednesday yes");
ok(w.tueSkippedMon === true, "a skipped day waits: Monday missed → Tuesday");
ok(w.sunAfterThree === false && w.monNextWeek === true, "three in a week: no fourth on Sunday; the next Monday again");
ok(w.satAfterTwo === true, "two written (Tue, Thu): Saturday is the third");
ok(w.sameDay === false, "a day already written: not again");
ok(r.weekStart.every(d => d === "2026-11-30" || d === "2026-12-07") && r.weekStart[1] === "2026-11-30", "the week runs Monday to Sunday", JSON.stringify(r.weekStart));
const road = r.road;
ok(road.n >= 105 && road.n <= 112, `to 15 Aug 2027, written on every writing day: ${road.n} texts over ${road.weeks} weeks`);
ok(road.maxWeek <= 3 && !road.twoInRow, "…never more than 3 a week, never two days running");
ok(road.repeats === 0 && road.none === 0, "…never the same topic twice, never without one");
ok(!road.wrongLevel.length, "…each at the course's level of that day", road.wrongLevel.join(", "));
ok(road.left >= 15, `…with topics to spare (${road.left} left; by level ${JSON.stringify(road.byLevel)})`);
console.log("    words asked on the road:", JSON.stringify(road.rampEnds));
const R = r.ramp;
ok(R.A10 === 30 && R.A16 === 35 && R.A112 === 35, `A1: 30 → 35 (${R.A10}, ${R.A16}, ${R.A112})`);
ok(R.A20 === 40 && R.A29 === 40 && R.A210 === 45 && R.A250 === 65 && R.A260 === 65, `A2: 40, +5 every 10 texts, up to 65 (${[R.A20, R.A29, R.A210, R.A250, R.A260]})`);
ok(R.B10 === 70 && R.B110 === 75 && R.B140 === 90 && R.B158 === 90, `B1: 70, +5 every 10 texts, up to 90 (${[R.B10, R.B110, R.B140, R.B158]})`);

// ── Today and the card, in the app ──
const t = await page.evaluate(() => {
  const out = {};
  S.writing = {}; delete S.course.dd.write;
  const today = studyToday();
  out.dueToday = cxWriteDue();
  out.partToday = cxTodayParts().some(p => p.part === "write");
  // yesterday written: no card today
  S.writing = { [today.slice(0, 4)]: [{ id: "y", d: addDays(today, -1), p: "wb.a1.01", t: "x", w: 40 }] };
  out.partAfterYesterday = cxTodayParts().some(p => p.part === "write");
  S.writing = {};
  // the card in a host, as Today opens it
  const host = document.createElement("div"); document.body.appendChild(host);
  cxJournalOpen(host, { mode: "path", onDone: () => {} });
  const first = _cj.p;
  out.card = { head: host.querySelector(".gs-unit").textContent, qpos: host.querySelector(".gs-qpos").textContent, title: first.de, id: first.id };
  cxJournalOther(); out.other = _cj.p.id;
  cxJournalOther(); cxJournalOther();
  // back to the first and write it
  while (_cj.p.id !== first.id) cxJournalOther();
  const ta = document.getElementById("cx-jtext");
  ta.value = Array.from({ length: cxJournalMin(first) }, (_, i) => ["Ich", "wohne", "gern", "hier"][i % 4]).join(" ");
  cxJournalCount();
  out.saveOn = !document.getElementById("cx-jsave").disabled;
  ta.value = "zu kurz"; cxJournalCount(); out.saveOffShort = document.getElementById("cx-jsave").disabled;
  ta.value = Array.from({ length: cxJournalMin(first) }, () => "Wort").join(" "); cxJournalCount();
  cxJournalSubmit();
  out.saved = host.querySelector(".gs-result") ? host.querySelector(".gs-result").textContent.replace(/\s+/g, " ") : "";
  cxJournalDone(); host.remove();
  out.nextPick = cxJournalPick(0).id;
  // "another topic" cycles through unwritten topics only
  const seen = new Set(); for (let k = 0; k < 140; k++) seen.add(cxJournalPick(k).id);
  out.cycleHasWritten = seen.has(first.id);
  out.partAfterToday = cxTodayParts().some(p => p.part === "write");
  // ☰ › Writing
  renderJournal();
  const plan = document.querySelector(".cx-wplan");
  out.screen = { plan: plan ? plan.textContent.replace(/\s+/g, " ") : "", dots: document.querySelectorAll(".cx-wdot.on").length, seg: [...document.querySelectorAll(".cx-seg small")].map(e => e.textContent) };
  // the Journey's forecast
  out.fc = cxForecastDays(14).map(x => [x.d, x.write]);
  return out;
});
ok(t.dueToday === true && t.partToday === true, "Today: nothing written yet — the writing card is in");
ok(t.partAfterYesterday === false, "…written yesterday: no card today");
ok(/topic 1 of 12/.test(t.card.head) || /topic \d+ of (12|60|58)/.test(t.card.head), `the card: «${t.card.head}»`);
ok(/^30\+ words/.test(t.card.qpos) && /text 1 of 3 this week/.test(t.card.qpos), `…«${t.card.qpos}»`);
ok(t.other !== t.card.id, "↻ another topic: another one");
ok(t.saveOn && t.saveOffShort, "Save only once the words are there");
ok(/Text 1 of 3 this week/.test(t.saved) && /next one comes (on )?(tomorrow|Monday|Tuesday|Wednesday|Thursday|Friday|Saturday|Sunday)/i.test(t.saved), `saved: «${t.saved.slice(0, 120)}»`);
ok(t.nextPick !== t.card.id && !t.cycleHasWritten, "a written topic never comes again, not even through ↻");
ok(t.partAfterToday === false, "written today: no second card");
ok(/1 of 3/.test(t.screen.plan) && t.screen.dots === 1 && /never repeated/.test(t.screen.plan), `☰ › Writing: «${t.screen.plan}»`);
ok(t.screen.seg[0] === "30+ words" && t.screen.seg[1] === "40+ words" && t.screen.seg[2] === "70+ words", `…the levels' words now: ${t.screen.seg.join(" · ")}`);
const fc = t.fc.filter(([, w]) => w).map(([d]) => d);
ok(fc.every((d, i) => !i || daysBetween(fc[i - 1], d) >= 2), `the Journey's forecast: writing days never two in a row (${fc.join(", ")})`);
function daysBetween(a, b) { return Math.round((Date.parse(b) - Date.parse(a)) / 864e5); }
ok(!errors.length, "no page errors", errors.join("\n"));
await browser.close();
console.log(`\nwriting: ${pass} passed, ${fail} failed`);
process.exit(fail ? 1 : 0);
