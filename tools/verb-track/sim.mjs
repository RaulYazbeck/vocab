// Journey simulation with the app's real code: every day until the
// finish date, Today sessions are built (buildPathQueue) and answered
// the way the profile answers (typed ≈87%, choice ≈98%, verbs ≈80%),
// until the day's plan target is reached. Runs once with the new verb
// system switched on and once without, and compares.
//   node sim.mjs [--days N] [--off] [--skip 0.05] [--app fr]
//                [--typed 0.87] [--cloze 0.87] [--vx 0.80] [--vxgrow 0.12]   (accuracy: typed, sentence,
//                verb forms at the start and how much they gain over 200 days — set them from a real
//                profile's usage log to simulate that learner)
//                [--decay 0.15]  (typed, sentence and verb accuracy fall this much, steadily, by the finish date)
//                [--breaks 60:10,150:7]  (busy periods: from day 60, 10 days without studying; …)
import { openApp } from "./browser.mjs";
const arg = (k, d) => { const i = process.argv.indexOf(k); return i > 0 ? process.argv[i + 1] : d; };
const DAYS = +arg("--days", 330), SKIP = +arg("--skip", 0.04), SEED = +arg("--seed", 99), APP = arg("--app", "de");
const ACC = { typed: +arg("--typed", 0.87), cloze: +arg("--cloze", NaN), vx: +arg("--vx", 0.80), vxGrow: +arg("--vxgrow", 0.12), decay: +arg("--decay", 0),
  breaks: String(arg("--breaks", "")).split(",").filter(Boolean).map(b => b.split(":").map(Number)) };
const modes = process.argv.includes("--off") ? [false] : process.argv.includes("--on") ? [true] : [true, false];
const results = {};
for (const on of modes) {
  const { browser, page, errors } = await openApp({ width: 900, height: 900, app: APP });
  page.setDefaultTimeout(0);
  const r = await page.evaluate(async ([on, DAYS, SKIP, SEED, ACC]) => {
    // ── fake clock ──
    const real = Date.now.bind(Date); let off = 0;
    Date.now = () => real() + off;
    const RD = Date;
    window.Date = class extends RD { constructor(...a) { if (a.length) super(...a); else super(RD.now() + off); } static now() { return real() + off; } };
    window.saveState = () => {}; window.saveToCloud = () => {}; window.saveLocalOnly = () => {};
    window.showCelebrateToast = () => {}; window.confettiBurst = () => {}; window.playSuccess = () => {}; window.playFailure = () => {}; window.haptic = () => {}; window.speak = () => {};
    let seed = SEED; const rnd = () => { seed = (seed * 1103515245 + 12345) & 0x7fffffff; return seed / 0x7fffffff; };
    Math.random = rnd;
    const P = { typed: ACC.typed, cloze: ACC.cloze, choice: 0.98, vx: ACC.vx, vxGrow: ACC.vxGrow, sheetQ: 0.94 };
    if (on) vxSwitchOn();
    const days = [];
    const start = studyToday();
    const to8pm = () => { const d = new RD(Date.now()); d.setHours(20, 0, 0, 0); off += d.getTime() - Date.now(); };
    to8pm();
    let firstAllMet = null, firstAllKnown = null, ledgerDone = null;
    for (let day = 0; day < DAYS; day++) {
      if (day > 0) { off += 864e5; to8pm(); }
      const today = studyToday();
      if (today > S.path.deadline && firstAllKnown) break;
      if ((rnd() < SKIP && day > 2) || ACC.breaks.some(([from, n]) => day >= from && day < from + n)) { days.push({ d: today, skipped: true }); continue; }
      // Accuracy falling steadily until the finish date (--decay).
      const fall = ACC.decay * Math.min(1, day / Math.max(1, daysBetween(start, S.path.deadline)));
      pathRollDay(); pathMarkActive();
      const scan0 = pathScan(true);
      pathCheckAutoPause(scan0);
      const plan = pathEnsurePlan(scan0);
      const target = plan ? plan.target : 180;
      let right = 0, answers = 0, vxAns = 0, vxRight = 0, sessions = 0, sheets = 0, sheetFails = 0;
      const vxAcc = Math.min(0.95, P.vx + P.vxGrow * day / 200) - fall;
      while (right < target && sessions < 12) {
        const q = buildPathQueue("regular");
        if (!q.items.length) break;
        sessions++;
        const missed = [];
        for (const it of q.items) {
          const w = it.w;
          if (it.t === "bonus") continue;
          if (it.t === "sheet") {
            // Its quiz: the sheet's size, each question right at P.sheetQ;
            // passing takes every one right first time. Misses come back once.
            const n = gqSheetSize(vxSheet(it.sheet));
            let first = 0;
            for (let k = 0; k < n; k++) if (rnd() < P.sheetQ) first++;
            const ok = first === n;
            vxRollDay(); S.verb.ns++;
            vxSheetResult(it.sheet, first / n, ok, "path");
            sheets++; if (!ok) sheetFails++;
            right += n; answers += n + (n - first); vxAns += n + (n - first);
            continue;
          }
          if (it.t === "learn") { if (w.vx) vxIntroduce(w.vx); else pathMeetWord(w); continue; }
          if (w && w.vx) {
            const ex = w.vx;
            const ok = rnd() < vxAcc;
            vxRecordAnswer(ex, ok, { given: ok ? ex.form.ans : "x" });
            if (ex.item) { const ws = getWS("vx", ex.item); if (ok) applyCorrect(ws, { quiet: true, kind: "recall", w }); else { applyWrong(ws, { w }); missed.push(it); } }
            answers++; vxAns++; if (ok) { right++; vxRight++; }
            continue;
          }
          const ws = getWS(w.deckId, w.idx);
          if (it.t === "choice" || it.t === "listen") {
            const ok = rnd() < P.choice;
            answers++; if (ok) right++;
            if (!(it.fresh || it.warm)) srsReview(ws, ok, "recognition");
            continue;
          }
          const ok = rnd() < (it.t === "cloze" && P.cloze === P.cloze ? P.cloze : P.typed + (ws.st >= 5 ? 0.06 : 0)) - fall;
          answers++;
          if (ok) { right++; if (!it.practice) applyCorrect(ws, { quiet: true, kind: "recall", w }); }
          else { applyWrong(ws, { w }); missed.push(it); }
        }
        // the repair round
        for (const it of missed) {
          const w = it.w, ok = rnd() < 0.9 - fall;
          answers++; if (ok) right++;
          if (w.vx) { if (it.w.vx.item) { const ws = getWS("vx", w.vx.item); if (ok) applyCorrect(ws, { quiet: true, kind: "recall", w }); } vxAns++; }
          else { const ws = getWS(w.deckId, w.idx); if (ok) applyCorrect(ws, { quiet: true, kind: "recall", w }); }
        }
        off += 15 * 60000;
        invalidatePathScan();
      }
      if (plan && right >= target) pathMarkPlanDone();
      const scan = pathScan(true);
      const L = on ? vxLedger().all : null;
      if (!firstAllMet && pathUnmet(scan) === 0) firstAllMet = today;
      if (!firstAllKnown && scan.known >= scan.total) firstAllKnown = today;
      if (on && !ledgerDone && L.done === L.verbs) ledgerDone = today;
      // The last few cards short of Known: which, and why (for the tail).
      const strag = scan.total - scan.known <= 3 ? vocabGroups().flatMap(g => g.decks.flatMap(d => d.words.map((w, i) => [d.id + "_" + i, S.words[d.id + "_" + i], w])))
        .filter(([k, ws]) => !(ws && ws.st >= STAGE_KNOWN)).map(([k, ws, w]) => `${k} ${w[WORD_KEY]} st${ws ? ws.st : 0}${ws && ws.rt ? " mirror→" + JSON.stringify(vxRetireMap().get(k)) : ""}${ws && ws.fl ? " fl" : ""}${ws && ws.rp ? " rp" : ""}${ws && ws.lrn ? " lrn" : ""} due ${ws && ws.dueAt ? new Date(ws.dueAt).toISOString().slice(0, 10) : "-"} k${ws && ws.k ? ws.k.toFixed(2) : "-"}`) : null;
      days.push({ d: today, strag, target, right, answers, sessions, vxAns, vxRight, sheets, sheetFails, pace: plan ? plan.pace : 0, met: scan.met, known: scan.known, total: scan.total, unmet: pathUnmet(scan), due: scan.due, od: scan.overdue,
        units: on ? VX_UNITS.map(u => vxUnitState(u.id)).join("") : "", ledger: L ? [L.done, L.cellsDone, L.itemsKnown] : null, vxq: on ? vxQuotas() : null });
    }
    const scan = pathScan(true);
    return { start, days, firstAllMet, firstAllKnown, ledgerDone, final: { met: scan.met, known: scan.known, total: scan.total, locked: scan.locked, ledger: on ? vxLedger() : null,
      units: on ? VX_UNITS.map(u => [u.id, vxUnitState(u.id)]) : null, level: currentLevel(), exp: S.exp,
      unmet: vocabGroups().flatMap(g => g.decks.flatMap(d => d.words.map((w, i) => [d.id, i, w]).filter(([id, i]) => !isMet(id, i)).map(([id, i, w]) => `${id}_${i} ${w[WORD_KEY]}${on && vxRetired(id, i) ? " (retired→" + JSON.stringify(vxRetireMap().get(id + "_" + i)) + ")" : ""}${on && vxGated(id) ? " (gated)" : ""}`))),
      stuck: on ? vxCatalog().filter(it => { const ws = S.words[vxKey(it.id)]; return !ws || (ws.st || 0) < STAGE_KNOWN; }).map(it => { const ws = S.words[vxKey(it.id)]; return `${it.id} st${ws ? ws.st : 0}${it.x ? " lemma" + vxLemma(it.x).st + " words:" + (it.x.v.words || []).map(w => w.deckId + "_" + w.idx).join(",") : ""}`; }) : null } };
  }, [on, DAYS, SKIP, SEED, ACC]);
  results[on ? "on" : "off"] = r;
  if (errors.length) console.log("errors:", errors.slice(0, 5));
  await browser.close();
}
const fs = await import("node:fs");
fs.writeFileSync(process.env.SIMOUT || "/tmp/vx-sim.json", JSON.stringify(results));
for (const [k, r] of Object.entries(results)) {
  const act = r.days.filter(d => !d.skipped);
  const avg = f => Math.round(act.reduce((a, d) => a + f(d), 0) / act.length);
  console.log(`\n=== verb system ${k.toUpperCase()} ===`);
  console.log(`days ${r.days.length} (skipped ${r.days.length - act.length}) · all met ${r.firstAllMet} · all Known ${r.firstAllKnown} · ledger complete ${r.ledgerDone || "—"}`);
  const sh = act.reduce((a, d) => a + d.sheets, 0), shf = act.reduce((a, d) => a + d.sheetFails, 0);
  console.log(`sheet quizzes taken ${sh} · not passed first time ${shf} (${sh ? Math.round(shf / sh * 100) : 0}%)`);
  console.log(`avg/day: target ${avg(d => d.target)} · right ${avg(d => d.right)} · answers ${avg(d => d.answers)} · sessions ${(act.reduce((a, d) => a + d.sessions, 0) / act.length).toFixed(1)} · verb answers ${avg(d => d.vxAns)} (${Math.round(act.reduce((a, d) => a + d.vxAns, 0) / act.reduce((a, d) => a + d.answers, 0) * 100)}%)`);
  console.log(`final: met ${r.final.met}/${r.final.total} · known ${r.final.known} · locked ${r.final.locked} · level ${r.final.level}`);
  if (r.final.ledger) console.log(`ledger: ` + r.final.ledger.levels.map(l => `${l.id} ${l.done}/${l.verbs} cells ${l.cellsDone}/${l.cells} items ${l.itemsKnown}/${l.items}`).join(" · "));
  if (r.final.units) console.log(`units: ` + r.final.units.map(u => u.join(":")).join(" "));
  if (r.final.unmet && r.final.unmet.length) console.log(`unmet: ` + r.final.unmet.join(" | "));
  if (r.final.stuck && r.final.stuck.length) console.log(`items not Known: ` + r.final.stuck.join(" | "));
  // weekly table
  for (let i = 0; i < r.days.length; i += 14) {
    const w = r.days.slice(i, i + 14).filter(d => !d.skipped);
    if (!w.length) continue;
    const l = w[w.length - 1];
    console.log(`${w[0].d}  target ${Math.round(w.reduce((a, d) => a + d.target, 0) / w.length)}  ans ${Math.round(w.reduce((a, d) => a + d.answers, 0) / w.length)}  vx ${Math.round(w.reduce((a, d) => a + d.vxAns, 0) / w.length)}  pace ${l.pace}  met ${l.met}  known ${l.known}  od ${l.od}  units ${l.units}  ledger ${l.ledger ? l.ledger.join("/") : ""}  vxq ${l.vxq ? l.vxq.items + "i " + l.vxq.cells + "c" : ""}`);
  }
}
