// Leaving a Today session (js/mode-path.js pathLeaveThen / pathQuit): a
// session with answers in it is never ended without a word — not by a ☰
// screen, the games menu or a quest's ▶ Go (they used to end it silently:
// 6 sessions "abandoned" on 2026-11-20 next to 8 ☰ screens opened) — the
// question's default is "Keep going" (an Enter meant for an answer keeps
// the session), an Escape that closes the accent picker isn't a Leave, and
// the usage log says how each session was left.
// Serve the repo (node run-suite.mjs t-leave.mjs does).
import { openApp } from "../verb-track/browser.mjs";
const { browser, page, errors } = await openApp();
let pass = 0, fail = 0;
const ok = (c, m, x = "") => { if (c) { pass++; console.log("  ✓", m); } else { fail++; console.log("  ✗", m, x); } };

await page.evaluate(() => {
  window.mistakeHeld = () => false;
  // a few cards answered, the way sim-app plays them
  window.__answer = n => {
    const s = pathSession; let k = 0;
    while (pathSession === s && s.stats.answered < n && k++ < 60) {
      const it = s.cur;
      if (!it) break;
      if (["learn", "bonus", "sheet", "repairOffer", "cx"].includes(it.t)) {
        if (it.t === "bonus") { if (it.minion) pathMinion(false); else pathBonus(false); }
        else if (it.t === "repairOffer") pathRepair(true);
        else pathNext();
        continue;
      }
      if (it.w && it.w.vx) { document.getElementById("p-input").value = it.w.vx.form.ans; pathCheckTyped(); }
      else if (it.t === "choice" || it.t === "listen") pathAnswerChoice(it.opts.findIndex(o => o.correct));
      else pathGradeTyped(it.t === "cloze" ? it.cloze.answer : it.t === "reverse" ? gamePrompt(it.w) : it.w[WORD_KEY], true);
      pathNext();
    }
    return s.stats.answered;
  };
  window.__ends = () => _usageLog().filter(e => e.e === "session_end" && e.kind === "path").map(e => ({ ab: e.abandoned, how: e.how, n: e.n }));
});
const dialog = () => page.evaluate(() => { const m = document.getElementById("app-confirm"); return m ? { title: m.querySelector(".modal-title").textContent, focus: document.activeElement && document.activeElement.id } : null; });
const until = async f => { for (let i = 0; i < 40; i++) { if (await page.evaluate(f)) return true; await page.waitForTimeout(50); } return false; };

// ── a ☰ screen: asked; Enter keeps the session ──
let n = await page.evaluate(() => { startPathSession("regular"); return __answer(3); });
ok(n >= 3, `a session with ${n} answers`);
await page.evaluate(() => { window.__s = pathSession; menuGo("journey"); });
await page.waitForTimeout(120);
let d = await dialog();
ok(d && /Leave the session/.test(d.title), "☰ → Journey mid-session: asked first", JSON.stringify(d));
ok(d && d.focus === "ac-no", "…with Keep going as the default (Enter)", JSON.stringify(d));
ok(await page.evaluate(() => pathSession === __s), "…the session is still open while asked");
await page.keyboard.press("Enter");
await until(() => !document.getElementById("app-confirm"));
ok(await page.evaluate(() => pathSession === __s && !!document.getElementById("path-screen")), "Enter: the session goes on, its screen still there");
ok(await page.evaluate(() => currentScreenName() !== "journey"), "…and the Journey didn't open");
// ── the same, Leave ──
await page.evaluate(() => menuGo("journey"));
await page.waitForTimeout(120);
await page.click("#ac-yes");
await until(() => !pathSession);
ok(await page.evaluate(() => !pathSession && currentScreenName() === "journey"), "Leave: the session ends and the Journey opens", await page.evaluate(() => currentScreenName()));
let ends = await page.evaluate(() => __ends());
ok(ends.length && ends.at(-1).ab && ends.at(-1).how === "nav", "…logged as left by a ☰ screen", JSON.stringify(ends.at(-1)));

// ── Esc: the accent picker's isn't a Leave; a real one asks, Keep going focused ──
await page.evaluate(() => { backToMenu(); startPathSession("regular"); __answer(2); window.__s = pathSession; });
await page.evaluate(() => document.dispatchEvent(new KeyboardEvent("keydown", { key: "Escape", isComposing: true, bubbles: true })));
await page.waitForTimeout(120);
ok(!(await dialog()), "Esc while composing (ä ö ü picker): no Leave question");
await page.evaluate(() => document.dispatchEvent(new KeyboardEvent("keydown", { key: "Escape", bubbles: true })));
await page.waitForTimeout(120);
d = await dialog();
ok(d && /Leave the session/.test(d.title) && d.focus === "ac-no", "Esc: asked, Keep going focused", JSON.stringify(d));
await page.keyboard.press("Enter");
await until(() => !document.getElementById("app-confirm"));
ok(await page.evaluate(() => pathSession === __s), "…Esc then Enter keeps the session");

// ── the games menu, and a quest's ▶ Go for a game ──
await page.evaluate(() => openGamesHub(null));
await page.waitForTimeout(120);
d = await dialog();
ok(d && /Leave the session/.test(d.title), "the games menu mid-session: asked first", JSON.stringify(d));
await page.click("#ac-no");
await until(() => !document.getElementById("app-confirm"));
ok(await page.evaluate(() => pathSession === __s && !document.querySelector(".g-hub, #games-hub")), "Keep going: still in the session");
await page.evaluate(() => runQuestAction("game:blitz"));
await page.waitForTimeout(300); // past the game tap the action used to schedule at once
d = await dialog();
ok(d && /Leave the session/.test(d.title), "a quest's ▶ Go (a game) mid-session: asked first", JSON.stringify(d));
ok(await page.evaluate(() => !activeGame), "…no game started behind the question");
await page.click("#ac-yes");
await until(() => !pathSession);
await page.waitForTimeout(300);
ok(await page.evaluate(() => !pathSession && !!activeGame && activeGame.def && activeGame.def.id === "blitz"), "Leave: the session ends, the quest's game opens", await page.evaluate(() => activeGame && activeGame.def && activeGame.def.id));
ends = await page.evaluate(() => __ends());
ok(ends.at(-1).how === "nav", "…logged as left for another screen", JSON.stringify(ends.at(-1)));
await page.evaluate(() => { quitAllGames(); backToMenu(); });

// ── games menu, Leave ──
await page.evaluate(() => { startPathSession("regular"); __answer(2); openGamesHub(null); });
await page.waitForTimeout(120);
await page.click("#ac-yes");
await until(() => !pathSession);
ends = await page.evaluate(() => __ends());
ok(ends.at(-1).how === "games", "games menu, Leave: logged as left for the games menu", JSON.stringify(ends.at(-1)));

// ── nothing answered yet: no question ──
await page.evaluate(() => { backToMenu(); startPathSession("regular"); });
await page.evaluate(() => menuGo("stats"));
await page.waitForTimeout(120);
ok(!(await dialog()) && await page.evaluate(() => !pathSession), "nothing answered yet: a ☰ screen just opens");
ends = await page.evaluate(() => __ends());
ok(ends.at(-1).how === "empty", "…logged as left with nothing answered", JSON.stringify(ends.at(-1)));

// ── ✕ still asks, Leave shows the summary ──
await page.evaluate(() => { backToMenu(); startPathSession("regular"); __answer(2); pathQuit(); });
await page.waitForTimeout(120);
d = await dialog();
ok(d && d.focus === "ac-no", "✕: asked, Keep going focused", JSON.stringify(d));
await page.click("#ac-yes");
await until(() => !pathSession);
ok(await page.evaluate(() => /Saved — see you soon/.test(document.body.textContent)), "Leave: the session summary");
ends = await page.evaluate(() => __ends());
ok(ends.at(-1).how === "quit", "…logged as left by ✕", JSON.stringify(ends.at(-1)));
// ── a finished session: no how ──
const fin = await page.evaluate(() => { backToMenu(); startPathSession("quick"); const s = pathSession; let k = 0; while (pathSession === s && k++ < 200) __answer(s.stats.answered + 1); return __ends().at(-1); });
ok(fin && fin.ab === false && fin.how === undefined, "a finished session: logged finished", JSON.stringify(fin));

// ── the report ──
const line = await page.evaluate(() => buildUsageReport(0).split("\n").find(l => l.startsWith("Sessions left before the end")));
ok(line && /a ☰ screen \(asked\) 2/.test(line) && /games menu \(asked\) 1/.test(line) && /nothing answered yet 1/.test(line) && /✕ \/ title \/ Esc \(asked\) 1/.test(line), "the report says how sessions were left", line);
ok(!errors.length, "no page errors", errors.join("\n"));
await browser.close();
console.log(`\nleave: ${pass} passed, ${fail} failed`);
process.exit(fail ? 1 : 0);
