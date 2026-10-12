// Today sessions played to the end, every kind of item, right and wrong
// (repair round included), several sessions in a row:
//   • the count (x/N) never grows — mistakes wait for the 🩹 repair round,
//     which has its own fixed count;
//   • the same word is never asked twice in a row (a verb card and the
//     card of its verb count as the same word).
//   node t-session.mjs            (REAL_STATE=… for a real profile, APP=fr,
//                                  SEED=n, DAYS=n: start n days later)
import { openApp } from "./browser.mjs";
const APP = process.env.APP || "de";
const { browser, page, errors } = await openApp({ width: 390, height: 844, app: APP });
page.setDefaultTimeout(0);
const r = await page.evaluate(async ([SEED, DAYS]) => {
  if (DAYS) { const real = Date.now.bind(Date), off = DAYS * 864e5, RD = Date; Date.now = () => real() + off;
    window.Date = class extends RD { constructor(...a) { if (a.length) super(...a); else super(RD.now() + off); } static now() { return real() + off; } }; }
  window.saveState = () => {}; window.saveToCloud = () => {}; window.speak = () => {};
  window.showCelebrateToast = () => {}; window.confettiBurst = () => {};
  let seed = SEED; Math.random = () => { seed = (seed * 1103515245 + 12345) & 0x7fffffff; return seed / 0x7fffffff; };
  if (typeof vxSwitchOn === "function" && vxAvailable() && !vxOn()) vxSwitchOn();
  const fails = [], stats = { sessions: 0, items: 0, vx: 0, wrong: 0, repairs: 0, gap1: 0, kinds: {} };
  let prev2 = null;
  const fail = m => { if (fails.length < 40) fails.push(m); };
  // What a question is "about": its word, or for a verb card its verb.
  const about = it => {
    if (!it || !it.w) return null;
    const w = it.w;
    if (w.vx) return "verb:" + w.vx.x.inf;
    const v = typeof vxVerbOfWord === "function" ? vxVerbOfWord(w) : null;
    return v ? "verb:" + v : w.deckId + "_" + w.idx;
  };
  const isQ = it => it && it.t !== "learn" && it.t !== "bonus" && it.t !== "sheet" && it.t !== "repairOffer";
  for (const [len, pWrong] of [["long", 0.35], ["regular", 0.6], ["quick", 0.2], ["long", 0.15], ["regular", 0.9]]) {
    startPathSession(len, { noBonus: false });
    const s = pathSession;
    if (!s) { fail(`${len}: no session`); continue; }
    stats.sessions++;
    let total = null, rTotal = null, prevAbout = null, prevKind = "", guard = 0;
    while (pathSession && guard++ < 600) {
      const it = s.cur;
      if (!it) break;
      if (it.t === "repairOffer") { pathRepair(true); prevAbout = null; continue; }
      const m = (document.getElementById("p-count") || {}).textContent || "";
      const mm = m.match(/(\d+)\/(\d+)/);
      if (mm && isQ(it)) {
        const n = +mm[2];
        if (s.repairPhase) { if (rTotal === null) rTotal = n; else if (n !== rTotal) fail(`${len}: repair count changed ${rTotal} → ${n} (${m})`); }
        else { if (total === null) total = n; else if (n !== total) fail(`${len}: count changed ${total} → ${n} (${m}) at item ${s.i} ${it.t}`); }
      }
      if (isQ(it)) {
        const a = about(it);
        if (a && a === prevAbout) fail(`${len}: ${a} twice in a row (${prevKind} → ${it.t}${it.w && it.w.vx ? ":vx" : ""}) at ${s.i}`);
        if (a && a === prev2) stats.gap1++; // one card between: allowed, kept rare
        prev2 = prevAbout; prevAbout = a; prevKind = it.t + (it.w && it.w.vx ? ":vx" : "");
      } else if (it.t === "learn" || it.t === "sheet") { prev2 = prevAbout; prevAbout = null; }
      stats.items++; stats.kinds[it.t] = (stats.kinds[it.t] || 0) + 1;
      const wrong = Math.random() < pWrong;
      if (it.t === "sheet") { if (typeof _gs !== "undefined" && _gs) _gs.quiz = null; pathNext(); continue; }
      if (it.t === "learn") { pathNext(); continue; }
      if (it.t === "bonus") { if (it.minion) pathMinion(false); else pathBonus(false); continue; }
      if (s.repairPhase) stats.repairs++;
      if (wrong) stats.wrong++;
      if (it.w && it.w.vx) {
        stats.vx++;
        const ex = it.w.vx;
        if (it.said !== undefined && speakOn()) { pathVerbReveal(); pathGradeVerb("", !wrong, true); }
        else { document.getElementById("p-input").value = wrong ? "zzz qqq" : ex.form.ans; pathCheckTyped(); }
      } else if (it.t === "choice" || it.t === "listen") {
        const i = it.opts.findIndex(o => o.correct);
        pathAnswerChoice(wrong ? (i + 1) % it.opts.length : i);
      } else {
        const ans = it.t === "cloze" ? it.cloze.answer : it.t === "reverse" ? gamePrompt(it.w) : it.w[WORD_KEY];
        pathGradeTyped(wrong ? "zzz qqq" : ans, wrong ? false : true);
      }
      if (!s.answered) { fail(`${len}: item ${s.i} ${it.t} not answered`); s.answered = true; }
      pathNext();
    }
    if (pathSession) { fail(`${len}: session did not end`); pathQuit && endPathSession(true); }
  }
  return { fails, stats };
}, [+(process.env.SEED || 7), +(process.env.DAYS || 0)]);
const ok = !r.fails.length && !errors.length;
console.log(JSON.stringify(r.stats));
r.fails.forEach(f => console.log("✗", f));
if (errors.length) console.log("page errors:", errors.slice(0, 5));
console.log(`session: ${ok ? "passed" : "FAILED"}`);
await browser.close();
process.exit(ok ? 0 : 1);
