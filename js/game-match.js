// ── GAME: MATCH PAIRS ─────────────────────────
// Two columns — prompts left, target words right. Tap one on each side
// to pair them. Boards never hold two pairs with the same form or
// prompt, so every match is unambiguous. Score rewards speed and
// punishes wrong pairings; the clock counts up (bonus rounds: 20 s cap).

registerGame({
  id: "match", name: "Match Pairs", icon: "🧩", skill: "Recognition", timed: true,
  howTo: [
    "Tap a word on the left, then its translation on the right.",
    "Clear every board as fast as you can.",
    "Wrong pairs cost points — accuracy beats frantic tapping.",
  ],
  requirement(pool, size) {
    const need = size === "full" ? 5 : 4, n = distinctCount(pool);
    return n >= need ? { ok: true } : { ok: false, reason: `Needs ${need} words — you have ${n}` };
  },
  stars: [1100, 1500, 1750],
  start(ctx) {
    const boards = ctx.rounds(3, 2, 1), per = ctx.rounds(5, 4, 4);
    const total = boards * per;
    const limit = ctx.size === "bonus" ? 20000 : 0;
    const candidates = sampleWords(ctx.pool, total * 3);
    const used = new Set();
    const boardSets = [];
    for (let b = 0; b < boards; b++) {
      const forms = new Set(), prompts = new Set(), set = [];
      const fits = w => !forms.has(normKey(gameForm(w))) && !prompts.has(normKey(gamePrompt(w)))
        && !set.some(x => sharesPromptAlt(x, w));
      // Prefer words not used on an earlier board; reuse only if needed;
      // finally fall back to the whole pool so a board always fills.
      const fallback = shuffle(dedupeWords(ctx.pool).slice());
      for (const pass of [0, 1, 2]) {
        for (const w of pass < 2 ? candidates : fallback) {
          if (set.length >= per) break;
          if (set.includes(w) || !fits(w) || (pass === 0 && used.has(wordKey(w)))) continue;
          set.push(w); forms.add(normKey(gameForm(w))); prompts.add(normKey(gamePrompt(w)));
        }
      }
      set.forEach(w => used.add(wordKey(w)));
      boardSets.push(set);
    }
    for (let i = boardSets.length - 1; i >= 0; i--) if (boardSets[i].length < 2) boardSets.splice(i, 1);
    const realTotal = boardSets.reduce((s, x) => s + x.length, 0);

    let b = 0, pairs = 0, mistakes = 0, combo = 0, maxCombo = 0, sel = null, byKey = new Map();
    const live = () => Math.max(0, pairs * 100 - mistakes * 30);

    const renderBoard = () => {
      const set = boardSets[b];
      byKey = new Map(set.map(w => [wordKey(w), w]));
      const left = shuffle(set.slice()), right = shuffle(set.slice());
      const tile = (w, side) => {
        const text = side === "L" ? gamePrompt(w) : gameForm(w);
        return `<button class="m-tile ${side === "R" ? "target" : ""} ${text.length > 22 ? "long" : ""}" data-k="${wordKey(w)}" data-side="${side}">${escapeHtml(text)}</button>`;
      };
      ctx.stage.innerHTML = `
        <div class="m-board-label">${boardSets.length > 1 ? `Board ${b + 1} of ${boardSets.length}` : ""}</div>
        <div class="m-board g-enter">
          <div class="m-col">${left.map(w => tile(w, "L")).join("")}</div>
          <div class="m-col">${right.map(w => tile(w, "R")).join("")}</div>
        </div>`;
    };

    const finish = cleared => {
      const secs = ctx.clock.elapsed() / 1000;
      const timeBonus = limit ? 0 : Math.max(0, Math.round(realTotal * 4 - secs)) * 10;
      const seconds = Math.round(secs * 10) / 10;
      ctx.finish({ score: live() + timeBonus, correct: pairs, wrong: mistakes, maxCombo, seconds, cleared,
        note: limit ? "" : `⏱ ${seconds}s · ${mistakes} mistake${mistakes === 1 ? "" : "s"} · time bonus +${timeBonus}` });
    };

    gListen(ctx.stage, "click", e => {
      const t = e.target.closest(".m-tile");
      if (!t || t.disabled || ctx.busy || ctx.paused || ctx.finished) return;
      if (!sel) { sel = t; t.classList.add("sel"); playPop(); return; }
      if (sel === t) { t.classList.remove("sel"); sel = null; return; }
      if (sel.dataset.side === t.dataset.side) { sel.classList.remove("sel"); sel = t; t.classList.add("sel"); return; }
      const a = sel; sel = null; a.classList.remove("sel");
      if (a.dataset.k === t.dataset.k) {
        const w = byKey.get(t.dataset.k);
        [a, t].forEach(x => { x.classList.add("done"); x.disabled = true; });
        pairs++; combo++; maxCombo = Math.max(maxCombo, combo);
        ctx.setScore(live()); ctx.setCombo(combo);
        floatScore(t, "+100");
        if (combo >= 3) playCombo(combo); else playSuccess();
        speak(gameForm(w));
        ctx.say(`Matched: ${gamePrompt(w)} — ${gameForm(w)}`);
        if (!limit) ctx.setBar(pairs / realTotal);
        if (!ctx.stage.querySelector(".m-tile:not(.done)")) {
          ctx.busy = true;
          gTimeout(() => {
            ctx.busy = false;
            if (++b >= boardSets.length) finish(true); else renderBoard();
          }, 420);
        }
      } else {
        mistakes++; combo = 0;
        ctx.setScore(live()); ctx.setCombo(0);
        ctx.missed(byKey.get(a.dataset.k));
        [a, t].forEach(x => { x.classList.add("bad"); shakeEl(x); });
        gTimeout(() => [a, t].forEach(x => x.classList.remove("bad")), 450);
        playMiss(); buzz(40);
        ctx.say("Not a pair — try again.");
      }
    });

    gInterval(() => {
      if (ctx.finished) return;
      const ms = ctx.clock.elapsed();
      if (limit) {
        const left = Math.max(0, limit - ms);
        ctx.setBar(left / limit, left < 5000 ? "urgent" : "");
        ctx.setClock(Math.ceil(left / 1000) + "s", left < 5000);
        if (left <= 0) finish(false);
      } else {
        ctx.setClock((ms / 1000).toFixed(1) + "s");
      }
    }, 100);

    ctx.setScore(0);
    if (!limit) ctx.setBar(0, "progress");
    renderBoard();
  },
});
