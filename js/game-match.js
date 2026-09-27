// ── GAME: MATCH PAIRS ─────────────────────────
// Two columns — prompts left, target words right. Tap one on each side
// to pair them, or drag a tile onto its partner. Boards never hold two
// pairs with the same form or prompt, so every match is unambiguous.
// Score rewards speed and punishes wrong pairings (a 🌱 word's miss
// costs half); the clock counts up (bonus rounds: 20 s cap).
//
// Ranks: bigger boards and a tighter time par; 💎 Diamond is memory
// mode — the target column flips face-down after a short preview.

const MATCH_RANKS = [
  { boards: 3, per: 5, par: 4.0 },
  { boards: 3, per: 6, par: 3.7 },
  { boards: 4, per: 6, par: 3.4 },
  { boards: 4, per: 6, par: 3.0 },
  { boards: 4, per: 6, par: 3.4, memory: true },
];

registerGame({
  id: "match", name: "Match Pairs", icon: "🧩", skill: "Recognition", timed: true,
  ranks: MATCH_RANKS, twists: ["mirror", "golden", "turbo", "sudden"], credit: "recognition",
  howTo: [
    "Tap a word on the left, then its translation on the right — or drag one onto the other.",
    "Clear every board as fast as you can.",
    "Wrong pairs cost points (half for 🌱 new words) — accuracy beats frantic tapping.",
    "Higher ranks: bigger boards, a tighter clock, and at 💎 Diamond the answers flip face-down.",
  ],
  requirement(pool, size) {
    const need = size === "full" ? 5 : 4, n = distinctCount(pool);
    return n >= need ? { ok: true } : { ok: false, reason: `Needs ${need} words — you have ${n}` };
  },
  // Thresholds were tuned for 15 pairs; they scale with the board size.
  starsFor(res) {
    const k = (res.pairsTotal || 15) / 15, t = [1100, 1500, 1750].map(x => x * k);
    return res.score >= t[2] ? 3 : res.score >= t[1] ? 2 : res.score >= t[0] ? 1 : 0;
  },
  start(ctx) {
    const rp = ctx.rp;
    const boards = ctx.rounds(rp.boards, 2, 1), per = Math.min(ctx.rounds(rp.per, 4, 4), 6);
    const memory = ctx.size === "full" && !!rp.memory;
    const total = boards * per;
    const limit = ctx.size === "bonus" ? 20000 : 0;
    const candidates = sampleWords(ctx.pool, total * 3);
    const used = new Set();
    const boardSets = [];
    for (let b = 0; b < boards; b++) {
      const forms = new Set(), prompts = new Set(), set = [];
      const fits = w => !forms.has(normKey(gameForm(w))) && !prompts.has(normKey(gamePrompt(w)))
        && !set.some(x => sharesPromptAlt(x, w));
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

    let b = 0, pairs = 0, pts = 0, mistakes = 0, penalty = 0, combo = 0, maxCombo = 0, sel = null, byKey = new Map();
    const live = () => Math.max(0, Math.round(pts - penalty));
    // Mirror twist: targets on the left.
    const leftSide = ctx.mirror ? "R" : "L";

    const renderBoard = () => {
      const set = boardSets[b];
      byKey = new Map(set.map(w => [wordKey(w), w]));
      const left = shuffle(set.slice()), right = shuffle(set.slice());
      const tile = (w, side) => {
        const isTarget = side === "R";
        const text = isTarget ? gameForm(w) : gamePrompt(w);
        return `<button class="m-tile ${isTarget ? "target" : ""} ${text.length > 22 ? "long" : ""}" data-k="${wordKey(w)}" data-side="${side}">${escapeHtml(text)}${!isTarget ? ctx.tag(w) : ""}</button>`;
      };
      const colL = left.map(w => tile(w, leftSide)).join(""), colR = right.map(w => tile(w, leftSide === "L" ? "R" : "L")).join("");
      ctx.stage.innerHTML = `
        <div class="m-board-label">${boardSets.length > 1 ? `Board ${b + 1} of ${boardSets.length}` : ""}${memory ? " · 🧠 memorise the answers!" : ""}</div>
        <div class="m-board g-enter">
          <div class="m-col">${colL}</div>
          <div class="m-col">${colR}</div>
        </div>`;
      if (memory) {
        ctx.busy = true;
        gTimeout(() => {
          ctx.stage.querySelectorAll('.m-tile[data-side="R"]').forEach(t => t.classList.add("hidden-face"));
          ctx.busy = false;
          const lab = ctx.stage.querySelector(".m-board-label");
          if (lab) lab.textContent = (boardSets.length > 1 ? `Board ${b + 1} of ${boardSets.length} · ` : "") + "🧠 from memory";
        }, 3000);
      }
    };

    const finish = cleared => {
      const secs = ctx.clock.elapsed() / 1000;
      const par = realTotal * rp.par * ctx.timeScale;
      const timeBonus = limit ? 0 : Math.max(0, Math.round(par - secs)) * 10;
      const seconds = Math.round(secs * 10) / 10;
      ctx.finish({ score: live() + timeBonus, correct: pairs, wrong: mistakes, maxCombo, seconds, cleared, pairsTotal: realTotal,
        stats: { memory },
        note: limit ? "" : `⏱ ${seconds}s · ${mistakes} mistake${mistakes === 1 ? "" : "s"} · time bonus +${timeBonus}` });
    };

    // Try to pair two tiles (either order). Returns true when matched.
    const attempt = (a, t) => {
      if (a.dataset.side === t.dataset.side) return false;
      if (a.dataset.k === t.dataset.k) {
        const w = byKey.get(t.dataset.k);
        [a, t].forEach(x => { x.classList.remove("peek", "hidden-face", "sel"); x.classList.add("done"); x.disabled = true; });
        pairs++; combo++; maxCombo = Math.max(maxCombo, combo);
        const got = ctx.award(w, 100);
        pts += got;
        ctx.hit(w);
        ctx.setScore(live()); ctx.setCombo(combo);
        floatScore(t, "+" + got, ctx.isGolden(w) ? "gold" : "");
        if (combo >= 3) playCombo(combo); else playSuccess();
        haptic("select");
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
        return true;
      }
      // The prompt-side tile names the word that was being asked about.
      const promptTile = a.dataset.side === "L" ? a : t;
      const w = byKey.get(promptTile.dataset.k);
      const cost = ctx.cost(w);
      mistakes++; penalty += 30 * cost; combo = ctx.comboAfterMiss(combo, w);
      ctx.setScore(live()); ctx.setCombo(combo);
      ctx.missed(w);
      [a, t].forEach(x => { x.classList.add("bad"); shakeEl(x); });
      gTimeout(() => [a, t].forEach(x => { x.classList.remove("bad"); if (memory && x.dataset.side === "R") { x.classList.remove("peek"); x.classList.add("hidden-face"); } }), 450);
      playMiss(); haptic("miss");
      ctx.say(cost < 1 ? "Not a pair — new word, half the cost." : "Not a pair — try again.");
      if (ctx.sudden) { ctx.busy = true; gTimeout(() => finish(false), 600); }
      return false;
    };
    const reveal = t => { if (memory && t.dataset.side === "R" && t.classList.contains("hidden-face")) { t.classList.remove("hidden-face"); t.classList.add("peek"); } };
    const hide = t => { if (memory && t && t.dataset.side === "R" && t.classList.contains("peek")) { t.classList.remove("peek"); t.classList.add("hidden-face"); } };

    gListen(ctx.stage, "click", e => {
      const t = e.target.closest(".m-tile");
      if (!t || t.disabled || ctx.busy || ctx.paused || ctx.finished) return;
      if (!sel) { sel = t; t.classList.add("sel"); reveal(t); playPop(); return; }
      if (sel === t) { t.classList.remove("sel"); hide(t); sel = null; return; }
      if (sel.dataset.side === t.dataset.side) { sel.classList.remove("sel"); hide(sel); sel = t; t.classList.add("sel"); reveal(t); return; }
      const a = sel; sel = null; a.classList.remove("sel");
      reveal(t);
      attempt(a, t);
    });

    // Drag a tile onto its partner in the other column.
    gDrag(ctx.stage, {
      items: ".m-tile:not(.done)",
      canDrag: () => !ctx.busy && !ctx.paused && !ctx.finished,
      resolve: (x, y, el) => {
        const hit = [...ctx.stage.querySelectorAll(".m-tile:not(.done)")].find(t => t !== el && t.dataset.side !== el.dataset.side && pointIn(t, x, y, 4));
        return hit || null;
      },
      hover: (t) => { ctx.stage.querySelectorAll(".m-tile.drop-hot").forEach(x => x.classList.remove("drop-hot")); if (t) t.classList.add("drop-hot"); },
      drop: (el, t) => {
        if (sel) { sel.classList.remove("sel"); sel = null; }
        reveal(t);
        return attempt(el, t);
      },
    });

    gInterval(() => {
      if (ctx.finished) return;
      const ms = ctx.clock.elapsed();
      if (limit) {
        const lim = limit * ctx.timeScale;
        const left = Math.max(0, lim - ms);
        ctx.setBar(left / lim, left < 5000 ? "urgent" : "");
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
