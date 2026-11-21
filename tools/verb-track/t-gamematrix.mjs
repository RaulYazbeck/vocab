// Every minigame × every difficulty, played to the end the way a person
// plays: from the games menu, the rank card (intros already seen, as for a
// returning player), Start — then a round played to its results screen.
//
//   ranks   every game at every rank 🥉→💎, picked on the real rank card
//   twists  every twist a game offers (Mirror, Golden, Turbo, Sudden death)
//   bonus   every game as a Today bonus round, 🐣 Easy and 🏅 Rank up
//   runs    🎯 Daily Challenge and 🕹️ Arcade Mix, every round of them
//   rankup  a perfect round at the top rank you have ranks the game up (3★)
//   menu    the menu itself: every tile, ▶ Play for today — with and without
//           ranks, intros seen and not
//
// A round is played by an auto-player in the page: right answers where the
// screen says what is right (the prompt → its word in the pool), a set share
// of deliberate mistakes (the lesson card, Continue), random taps elsewhere.
// Timed rounds are fast-forwarded once enough has been answered.
//
// Checked: the round starts and reaches its results (no stall), no page
// errors, no "undefined" / NaN on screen, no sideways scroll, no text cut out
// of its box, the round ran at the rank and twist chosen, stars 0–3, score a
// number, and each rank's own handling where it shows (decoys, typed
// formats, reversed rain, memory mode, no hints, sudden death…).
//
//   node t-gamematrix.mjs                 # all parts (APP=fr: the French app)
//   PART=ranks,menu ONLY=rain,blitz node t-gamematrix.mjs
//   W=1280 H=900 node t-gamematrix.mjs   # desktop
import { openApp } from "./browser.mjs";
const APP = process.env.APP || "de";
const W = +(process.env.W || 390), H = +(process.env.H || 844);
const PARTS = (process.env.PART || "menu,ranks,twists,bonus,runs,rankup").split(",");
const ONLY = (process.env.ONLY || "").split(",").filter(Boolean);
let failed = 0, passed = 0, errSeen = 0;
const report = (ok, msg) => { if (ok) passed++; else failed++; console.log((ok ? "  ✓ " : "  ✗ ") + `[${APP} ${W}] ` + msg); };

const { browser, page, errors } = await openApp({ width: W, height: H, app: APP });

// ── In-page helpers: the auto-player and the round watcher ──
await page.evaluate(() => {
  window.saveState = () => {};
  window.showCelebrateToast = () => {}; window.confettiBurst = () => {};
  // What was said aloud (Listen, Blitz at 💎): the auto-player hears it.
  window._said = ""; window.speak = t => { window._said = String(t || ""); };
  window._wait = ms => new Promise(r => setTimeout(r, ms));
  // Every finished round: the game_end log line (stars, score, rank, twist).
  window._ends = [];
  const _log = window.logEvent;
  window.logEvent = function (type, data) { if (type === "game_end" && data && !data.quit) window._ends.push({ ...data }); return _log.apply(this, arguments); };
  window._text = el => (el ? el.textContent : "").replace(/🌟×3|🌱|\s+/g, m => /\s/.test(m) ? " " : "").trim();
  window._vis = el => !!(el && el.offsetParent && !el.disabled);
  window._click = el => { if (window._vis(el)) { el.click(); return true; } return false; };
  window._type = (input, val) => {
    input.value = val;
    input.dispatchEvent(new Event("input", { bubbles: true }));
    input.dispatchEvent(new KeyboardEvent("keydown", { key: "Enter", bubbles: true }));
  };
  // The word behind a shown text (a prompt, a form, a noun).
  window._byPrompt = t => window._pool.find(w => gamePrompt(w) === t);
  window._byForm = t => window._pool.find(w => gameForm(w) === t);
  // One move in the current round. good: answer right where the screen
  // says what is right; else deliberately wrong (or a random tap).
  window._move = async (good, notes) => {
    const g = activeGame, id = g.def.id, scr = document.getElementById("game-screen"), st = document.getElementById("g-stage");
    const cont = document.getElementById("g-continue");
    if (window._vis(cont)) { await window._wait(850); cont.click(); return "continue"; } // (the 0.8 s mistake hold)
    if (g.ctx.busy) return "busy";
    const opts = [...st.querySelectorAll(".g-opt")].filter(window._vis);
    const typed = [...st.querySelectorAll("input.german-input")].find(i => window._vis(i));
    const pick = (list, right) => { const c = list.filter(right), o = list.filter(x => !right(x)); const L = good && c.length ? c : o.length ? o : list; return L[Math.floor(Math.random() * L.length)]; };
    const optText = b => window._text(b.querySelector(".g-opt-text") || b);
    switch (id) {
      case "match": {
        const L = [...st.querySelectorAll('.m-tile[data-side="L"]:not(.done)')], R = [...st.querySelectorAll('.m-tile[data-side="R"]:not(.done)')];
        if (!L.length) return "wait";
        if (R.some(t => t.classList.contains("hidden-face"))) notes.memory = true;
        const a = L[0], b = good ? R.find(t => t.dataset.k === a.dataset.k) : (R.find(t => t.dataset.k !== a.dataset.k) || R[0]);
        a.click(); await window._wait(60); if (b) b.click(); return "pair";
      }
      case "rain": {
        const p = window._text(document.getElementById("r-prompt"));
        const w = window._byPrompt(p) || window._byForm(p);
        const drops = [...st.querySelectorAll(".r-drop")];
        if (!drops.length) return "wait";
        if (drops.some(d => d.classList.contains("rev"))) notes.reversed = true;
        const right = d => !!w && (window._text(d) === gameForm(w) || window._text(d) === gamePrompt(w));
        const d = pick(drops, right);
        d.dispatchEvent(new PointerEvent("pointerdown", { bubbles: true })); return "drop";
      }
      case "gender": {
        const noun = window._text(document.getElementById("gd-noun")), en = window._text(document.getElementById("gd-en"));
        const w = window._pool.find(x => { const np = nounParts(x); return np && np.noun === noun && gamePrompt(x) === en; });
        const bs = [...st.querySelectorAll(".gd-bucket")];
        const b = pick(bs, b => !!w && GENDER_BUCKETS[+b.dataset.i].a === nounParts(w).answer); b.click(); return "bucket";
      }
      case "truefalse": {
        const top = window._text(document.getElementById("tf-top")), bot = window._text(document.getElementById("tf-bot"));
        const mirror = g.ctx.mirror;
        const prompt = mirror ? bot : top, shown = mirror ? top : bot;
        const w = window._byPrompt(prompt);
        const truth = !!w && shown === gameForm(w);
        const say = good ? truth : !truth;
        document.getElementById(say ? "tf-yes" : "tf-no").click(); return "judge";
      }
    }
    if (opts.length) {
      // Multiple choice: Blitz, Listen, Plural, Gap Fill, Der·Den·Dem…
      const q = window._text(st.querySelector(".g-q-word"));
      let right = () => false;
      if (id === "blitz" || id === "listen") {
        const heard = st.querySelector("#bz-say, #l-play") ? window._said : "";
        const w = window._byPrompt(q) || window._byForm(q) || (heard && window._byForm(heard));
        if (w) right = b => optText(b) === gameForm(w) || optText(b) === gamePrompt(w);
        if (st.querySelector("#bz-say")) notes.spoken = true;
      } else if (id === "plural") {
        const w = window._pool.find(x => { const it = pluralItem(x); return it && it.np.full === q; });
        if (w) right = b => optText(b) === "die " + pluralItem(w).pl;
      }
      if (opts.length >= 5) notes.manyOptions = true;
      pick(opts, right).click(); return "option";
    }
    if (typed) {
      notes.typed = true;
      const pr = window._text(st.querySelector("#tr-prompt, #tm-prompt, .english-word, .g-q-word"));
      let ans = "";
      const w = window._byPrompt(pr);
      if (w) ans = id === "boss" ? w[WORD_KEY] : gameForm(w);
      if (id === "listen" && window._said) ans = window._said;
      if (id === "typerush") { const h = document.getElementById("tr-hint"); if (h && !h.textContent.trim() && !h.querySelector("i")) notes.noHint = true; }
      window._type(typed, good && ans ? ans : "qqq"); return "typed";
    }
    if (id === "scramble") {
      const tiles = [...st.querySelectorAll(".sc-tile:not(:disabled)")];
      const slots = st.querySelectorAll("button.sc-slot");
      if (tiles.length > slots.length) notes.decoys = true;
      const w = window._byPrompt(window._text(st.querySelector(".g-q-word")));
      if (good && w && tiles.length) {
        const pre = window._text(st.querySelector(".sc-prefix"));
        const word = gameForm(w).replace(new RegExp("^" + (pre ? pre.replace(/[.*+?^${}()|[\]\\]/g, "\\$&") + "\\s+" : "")), "").toLowerCase();
        const empty = [...slots].findIndex(s => !s.classList.contains("filled"));
        const ch = word[empty < 0 ? 0 : empty];
        const t = tiles.find(t => window._text(t).toLowerCase() === ch);
        if (t) { t.click(); return "letter"; }
      }
      if (!window._click(document.getElementById("sc-give"))) { const t = tiles[0]; if (t) t.click(); }
      return "scramble";
    }
    if (id === "builder") {
      const bank = [...st.querySelectorAll("#sb-bank .sb-tile:not(:disabled)")];
      if (bank.length && Math.random() < 0.7) { bank[Math.floor(Math.random() * bank.length)].click(); return "tile"; }
      if (window._click(document.getElementById("sb-check"))) return "check";
      window._click(document.getElementById("sb-give")); return "reveal";
    }
    if (id === "thread") {
      const chips = [...st.querySelectorAll(".vt-row.on .vt-chip:not(:disabled)")];
      const chk = document.getElementById("vt-check");
      if (chips.length && (!chk || chk.disabled || Math.random() < 0.5)) { chips[Math.floor(Math.random() * chips.length)].click(); return "chip"; }
      if (window._click(chk)) return "check";
      return "wait";
    }
    if (id === "timeline") {
      const chips = [...st.querySelectorAll(".tl-chip:not(:disabled)")];
      if (chips.length) { chips[Math.floor(Math.random() * chips.length)].click(); return "station"; }
      return "wait";
    }
    // Anything else on the stage: a random enabled button.
    const bs = [...st.querySelectorAll("button")].filter(window._vis);
    if (bs.length) { bs[Math.floor(Math.random() * bs.length)].click(); return "tap"; }
    return "wait";
  };
  // Play the round that is on screen to its results. acc: share of right moves.
  window._playRound = async (acc, maxMoves = 400) => {
    const notes = {}, problems = new Set();
    const t0 = Date.now();
    let moves = 0, lastChange = Date.now(), lastSig = "";
    const g0 = activeGame;
    while (true) {
      const g = activeGame;
      if (!g || g !== g0 || g.ctx.finished || document.querySelector(".g-results")) break;
      if (Date.now() - t0 > 150000) { problems.add("round did not end in 150 s"); break; }
      const scr = document.getElementById("game-screen");
      if (!scr) { problems.add("game screen gone"); break; }
      // what the player sees
      const txt = scr.innerText;
      const bad = txt.match(/.{0,30}(undefined|NaN|\[object)(?!\w).{0,20}/);
      if (bad) problems.add("text: " + bad[0]);
      if (document.documentElement.scrollWidth > window.innerWidth + 1) problems.add("sideways scroll " + document.documentElement.scrollWidth);
      scr.querySelectorAll("#g-stage button, .g-q-word, .tf-top, .tf-bot, [class*=tile], .r-drop-text").forEach(el => {
        if (el.offsetParent && el.scrollWidth > el.clientWidth + 2 && getComputedStyle(el).overflowX !== "auto" && el.innerText.trim()) problems.add(`cut: "${el.innerText.trim().slice(0, 40)}" ${el.scrollWidth}>${el.clientWidth}`);
      });
      // stall: nothing changes on screen for 25 s while nothing waits on a clock
      const sig = txt.length + "|" + (g.ctx.clock.elapsed() | 0);
      if (sig !== lastSig) { lastSig = sig; lastChange = Date.now(); }
      else if (Date.now() - lastChange > 25000) { problems.add("stalled: " + txt.slice(0, 80).replace(/\n/g, " | ")); break; }
      const right = Math.random() < acc;
      try { await window._move(right, notes); } catch (e) { problems.add("player: " + e.message); }
      moves++;
      // Long enough: run the clock out (timed games), then answer wrong (lives).
      if (moves === 40 && g.def.timed) g.ctx.clock.add(1e7);
      if (moves > 60 && (g.def.id === "rain" || g.def.id === "boss")) acc = 0; // (they end on lost lives)
      if (moves > maxMoves) { problems.add("too many moves"); break; }
      await window._wait(g.def.id === "rain" ? 120 : 160);
    }
    return { notes, problems: [...problems], moves, secs: Math.round((Date.now() - t0) / 1000) };
  };
  window._reset = () => { if (typeof quitAllGames === "function") quitAllGames(); gameRun = null; };
});

const gameIds = (await page.evaluate(() => GAMES.map(g => ({ id: g.id, twists: g.twists || [], timed: !!g.timed }))))
  .filter(g => !ONLY.length || ONLY.includes(g.id));

// The real menu → the rank card → Start (with a rank chosen on the card).
async function startFromMenu(id, rank) {
  await page.evaluate(() => { window._reset(); openGamesHub(); });
  await page.waitForTimeout(200);
  const tile = page.locator(`.g-card-tile[onclick*="'${id}'"]`);
  if (!(await tile.count())) return "no tile";
  if (await tile.evaluate(e => e.classList.contains("off"))) return "off: " + (await tile.getAttribute("title"));
  await tile.click();
  await page.waitForTimeout(250);
  if (rank !== undefined) {
    const r = page.locator(`#g-overlay .g-rank[data-r="${rank}"]`);
    if (await r.count()) { await r.click(); await page.waitForTimeout(150); }
    const no = page.locator("#g-twist-x"); // a rolled twist: declined, the plain round is what this part tests
    if (await no.count()) { await no.click(); await page.waitForTimeout(150); }
  }
  for (let i = 0; i < 6; i++) {
    await page.waitForTimeout(450); // (Start ignores taps for 0.4 s)
    const go = page.locator("#g-go");
    if (await go.count() && await go.isVisible()) await go.click(); else break;
  }
  await page.waitForFunction(() => !!(activeGame && activeGame.ctx.started), null, { timeout: 8000 }).catch(() => {});
  return (await page.evaluate(() => !!(activeGame && activeGame.ctx.started))) ? "ok" : "not started";
}
async function play(label, acc, expect = {}) {
  const errs0 = errors.length;
  const ends0 = await page.evaluate(() => window._ends.length);
  const r = await page.evaluate(acc => window._playRound(acc), acc);
  await page.waitForTimeout(400);
  const end = await page.evaluate(n => window._ends[n] || null, ends0);
  const res = await page.evaluate(() => { const el = document.querySelector(".g-results"); return el ? el.innerText : ""; });
  const probs = [...r.problems];
  if (!end) probs.push("no game_end");
  if (!res && !expect.noResults) probs.push("no results screen");
  if (/undefined|NaN|\[object/.test(res)) probs.push("results text: " + (res.match(/.{0,30}(undefined|NaN|\[object).{0,20}/) || [""])[0]);
  if (end) {
    if (!(Number.isInteger(end.stars) && end.stars >= 0 && end.stars <= 3)) probs.push("stars " + end.stars);
    if (!Number.isFinite(end.score) || end.score < 0) probs.push("score " + end.score);
    if (expect.rank !== undefined && end.rank !== expect.rank) probs.push(`ran at rank ${end.rank}, not ${expect.rank}`);
    if (expect.twist !== undefined && (end.twist || "") !== expect.twist) probs.push(`twist "${end.twist}", not "${expect.twist}"`);
  }
  for (const [k, v] of Object.entries(expect.notes || {})) if (!!r.notes[k] !== v) probs.push(`${v ? "expected" : "unexpected"} ${k}`);
  if (errors.length > errs0) probs.push("page error: " + errors.slice(errs0).map(e => e.split("\n")[0]).join(" | "));
  errSeen = errors.length;
  report(!probs.length, `${label}: ${r.moves} moves, ${r.secs}s${end ? `, ★${end.stars} ${end.score} pts` : ""}${probs.length ? " — " + probs.slice(0, 4).join(" · ") : ""}`);
  return { end, notes: r.notes };
}
const setup = (ranks, introsSeen) => page.evaluate(([ranks, seen]) => {
  window._reset();
  window._pool = buildGamePool(S.games.pool);
  S.games.rank = S.games.rank || {};
  GAMES.forEach(g => { S.games.rank[g.id] = ranks; try { localStorage.setItem("gv_game_intro_" + g.id, seen ? "1" : "0"); if (!seen) localStorage.removeItem("gv_game_intro_" + g.id); } catch (e) {} });
}, [ranks, introsSeen]);

// What each rank must change, where the auto-player can see it. Only the
// ranks a format applies to "known" words can show it (the profile knows some).
const RANK_NOTES = {
  match: r => r === 4 ? { memory: true } : { memory: false },
  rain: r => r <= 2 ? { reversed: false } : {},
  scramble: r => r === 0 ? { decoys: false } : {},
  typerush: r => r === 4 ? { noHint: true } : {},
};

// ── menu: every tile and ▶ Play for today, fresh and returning players ──
if (PARTS.includes("menu")) {
  console.log("── menu");
  for (const [ranks, seen, label] of [[0, false, "first time"], [0, true, "returning, 🥉"], [2, true, "returning, 🥇 open"]]) {
    await setup(ranks, seen);
    const notStarted = [];
    for (const g of gameIds) { const s = await startFromMenu(g.id); if (s !== "ok" && !s.startsWith("off")) notStarted.push(`${g.id} (${s})`); }
    await page.evaluate(() => { window._reset(); openGamesHub(); });
    await page.waitForTimeout(200);
    let today = "not offered";
    const pf = page.locator(".g-today-btn");
    if (await pf.count()) {
      await pf.click();
      for (let i = 0; i < 6; i++) { await page.waitForTimeout(450); const go = page.locator("#g-go"); if (await go.count() && await go.isVisible()) await go.click(); else break; }
      await page.waitForFunction(() => !!(activeGame && activeGame.ctx.started), null, { timeout: 8000 }).catch(() => {}); // (a timed game counts down first)
      today = (await page.evaluate(() => !!(activeGame && activeGame.ctx.started))) ? "ok" : "NOT STARTED";
    }
    report(!notStarted.length && today !== "NOT STARTED", `menu, ${label}: every tile starts${notStarted.length ? " — not: " + notStarted.join(", ") : ""} · ▶ Play for today ${today}`);
  }
}

// ── ranks: every game × every rank, from the rank card ──
if (PARTS.includes("ranks")) {
  console.log("── ranks");
  await setup(4, true);
  for (const g of gameIds) for (let r = 0; r <= 4; r++) {
    const s = await startFromMenu(g.id, r);
    if (s !== "ok") { report(s.startsWith("off"), `${g.id} ${r}: ${s}`); continue; }
    const notes = (RANK_NOTES[g.id] || (() => ({})))(r);
    const res = await play(`${g.id} rank ${r}`, 0.75, { rank: r, twist: "", notes });
    // 💎 Der · Die · Das is sudden death: the first miss ends it.
    if (g.id === "gender" && r === 4 && res.end && res.end.bad > 1) report(false, `gender rank 4: ${res.end.bad} misses — sudden death should end at the first`);
  }
}

// ── twists: every twist each game offers (rank 2) ──
if (PARTS.includes("twists")) {
  console.log("── twists");
  await setup(4, true);
  for (const g of gameIds) for (const tw of g.twists) {
    const ok = await page.evaluate(([id, tw]) => { window._reset(); const pool = window._pool; if (!gameRequirement(getGame(id), pool, "full").ok) return false; launchGame(id, { pool, size: "full", twist: tw, rank: 2 }); return true; }, [g.id, tw]);
    if (!ok) continue;
    for (let i = 0; i < 6; i++) { await page.waitForTimeout(450); const go = page.locator("#g-go"); if (await go.count() && await go.isVisible()) await go.click(); else break; }
    await page.waitForFunction(() => !!(activeGame && activeGame.ctx.started), null, { timeout: 8000 }).catch(() => {});
    // Sudden death: one wrong answer ends the round.
    const r = await play(`${g.id} 🌀 ${tw}`, tw === "sudden" ? 0 : 0.75, { rank: 2, twist: tw });
    if (tw === "sudden" && r.end && r.end.bad > 1 && g.id !== "match") report(false, `${g.id} 🌀 sudden: ${r.end.bad} misses before the end`);
  }
}

// ── bonus: every game as a Today bonus round, Easy and Rank up ──
if (PARTS.includes("bonus")) {
  console.log("── bonus");
  await setup(2, true);
  for (const g of gameIds) for (const easy of [true, false]) {
    const ok = await page.evaluate(([id, easy]) => {
      window._reset(); S.games.bonusEasy = easy;
      const pool = window._pool; if (!gameRequirement(getGame(id), pool, "bonus").ok || !gameUsableNow(getGame(id))) return false;
      gameRun = { kind: "surprise", ids: [id], i: 0, summaries: [], pool, size: "bonus", title: "🎁 Bonus", onDone: () => { window._bonusDone = (window._bonusDone || 0) + 1; } };
      launchGame(id, { pool, size: "bonus" }); return true; }, [g.id, easy]);
    if (!ok) continue;
    for (let i = 0; i < 6; i++) { await page.waitForTimeout(450); const go = page.locator("#g-go"); if (await go.count() && await go.isVisible()) await go.click(); else break; }
    await page.waitForFunction(() => !!(activeGame && activeGame.ctx.started), null, { timeout: 8000 }).catch(() => {});
    const r = await play(`${g.id} 🎁 bonus ${easy ? "🐣 easy" : "🏅 rank up"}`, 0.8, { rank: easy ? 0 : 2, noResults: true });
    if (r.end && easy && r.end.stars) report(false, `${g.id} 🎁 easy earned ★${r.end.stars} (practice only)`);
  }
}

// ── runs: Daily Challenge and Arcade Mix, every round ──
if (PARTS.includes("runs") && !ONLY.length) {
  console.log("── runs");
  await setup(1, true);
  for (const [label, fn] of [["🎯 Daily Challenge", "startDailyChallenge"], ["🕹️ Arcade Mix", "startArcadeMix"]]) {
    await page.evaluate(() => { window._reset(); S.games.daily = {}; openGamesHub(); });
    await page.waitForTimeout(200);
    const b = page.locator(`button[onclick='${fn}()']`);
    if (!(await b.count()) || await b.isDisabled()) { report(true, `${label}: not offered`); continue; }
    await b.click();
    let rounds = 0, total = await page.evaluate(() => gameRun ? gameRun.ids.length : 0);
    while (rounds < 8) {
      for (let i = 0; i < 6; i++) { await page.waitForTimeout(450); const go = page.locator("#g-go"); if (await go.count() && await go.isVisible()) await go.click(); else break; }
      await page.waitForFunction(() => !!(activeGame && activeGame.ctx.started), null, { timeout: 8000 }).catch(() => {});
      const id = await page.evaluate(() => activeGame && activeGame.def.id);
      if (!id) break;
      await play(`${label} round ${rounds + 1}/${total}: ${id}`, 0.75);
      rounds++;
      const next = page.locator("#g-next");
      if (!(await next.count())) break;
      const txt = await next.innerText();
      await next.click(); await page.waitForTimeout(300);
      if (/Back to games/.test(txt)) break;
    }
    report(rounds === total && total > 0, `${label}: ${rounds} of ${total} rounds played through`);
  }
}

// ── rankup: a perfect round at your top rank ranks the game up ──
if (PARTS.includes("rankup")) {
  console.log("── rankup");
  for (const id of ["blitz", "gender", "truefalse", "rain", "match"].filter(x => gameIds.some(g => g.id === x))) {
    await setup(0, true);
    await page.evaluate(id => { S.games.rank[id] = 1; S.games.rankStars[id] = [3, 0, 0, 0, 0]; }, id);
    const s = await startFromMenu(id, 1);
    if (s !== "ok") { report(false, `${id} rank-up: ${s}`); continue; }
    const r = await play(`${id} rank-up round at 🥈`, 1, { rank: 1 });
    const after = await page.evaluate(id => S.games.rank[id], id);
    const want = r.end && r.end.stars === 3 ? 2 : 1;
    report(after === want, `${id}: ★${r.end ? r.end.stars : "?"} at 🥈 → rank now ${after} (expected ${want})${r.end && r.end.rankedUp !== (want === 2) ? " · rankedUp flag " + r.end.rankedUp : ""}`);
  }
}

await page.evaluate(() => window._reset());
errors.slice(errSeen).forEach(e => { failed++; console.log(`  ✗ [${APP} ${W}] page error: ` + e.slice(0, 300)); });
await browser.close();
console.log(`game matrix (${APP} ${W}): ${passed} passed, ${failed} failed`);
process.exit(failed ? 1 : 0);
