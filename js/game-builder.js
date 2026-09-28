// ── GAME: SENTENCE BUILDER ────────────────────
// Rebuild an example sentence from shuffled word tiles, guided by its
// translation. Trains word order (V2, verb-final, …). Punctuation is
// glued to the neighbouring word so tiles are always real words; the
// check compares text, so repeated words are interchangeable.
//
// Tap a tile to add it at the end — or DRAG it into any gap of the
// sentence, drag placed tiles to reorder them, drag one back to the
// bank to remove it.
//
// Word order is grammar, not a word's meaning, so this game doesn't move
// stages (credit: null). Ranks: longer sentences; a decoy tile from 🥇
// Gold; no Reveal button at 💎 Diamond.

function sentenceTiles(sentence) {
  const parts = String(sentence || "").trim().split(/\s+/).filter(Boolean);
  const out = [];
  let pending = "";
  parts.forEach(p => {
    if (/[\p{L}\p{N}]/u.test(p)) { out.push(pending + p); pending = ""; }
    else if (/^[„“"«‚(¿¡]+$/.test(p)) pending += p;          // opening marks → next word
    else if (out.length) out[out.length - 1] += " " + p;      // "vous ?" / "—" → previous word
    else pending += p;
  });
  if (pending && out.length) out[out.length - 1] += pending;
  return out;
}
const BUILDER_BASE = [3, 9];
const _builderCache = new Map();
_gameCacheClearers.push(() => _builderCache.clear());
function builderItem(word, range = BUILDER_BASE) {
  const k = wordKey(word) + "|" + range.join("-"); // examples are never edited, so the key is stable
  if (_builderCache.has(k)) return _builderCache.get(k);
  let res = null;
  for (const ex of word.examples || []) {
    const s = ex && ex[WORD_KEY];
    if (!s || !ex.en) continue;
    const tiles = sentenceTiles(s);
    if (tiles.length >= range[0] && tiles.length <= range[1]) { res = { ex, tiles }; break; }
  }
  _builderCache.set(k, res);
  return res;
}
// A wrong-case twin of an article in the sentence ("dem" when it says
// "den"), or null — German only.
function builderGrammarDecoy(tiles, have) {
  if (typeof GR_DE === "undefined" || !GR_DE) return null;
  for (const t of shuffle(tiles.slice())) {
    if (!/^[\p{L}]+$/u.test(t)) continue;
    const p = detParse(t);
    if (!p) continue;
    const alt = shuffle(detFamilyForms(p).map(f => capLike(t, f)).filter(f => !have.has(normKey(f))))[0];
    if (alt) return alt;
  }
  return null;
}
function builderWords(pool, range = BUILDER_BASE) {
  const seen = new Set();
  return pool.filter(w => {
    const it = builderItem(w, range);
    if (!it) return false;
    const key = normKey(it.ex[WORD_KEY]);
    if (seen.has(key)) return false;
    seen.add(key); return true;
  });
}

registerGame({
  id: "builder", name: "Sentence Builder", icon: "🧱", skill: "Grammar · word order", credit: null,
  ranks: [
    { range: [3, 9] },
    { range: [4, 10] },
    { range: [5, 11], decoy: 1 },
    { range: [5, 12], decoy: 1 },
    { range: [6, 12], decoy: 2, noReveal: true },
  ],
  twists: ["golden", "sudden"],
  howTo: ["Tap the tiles in order to build the sentence."],
  requirement(pool) {
    const n = builderWords(pool).length;
    return n >= 3 ? { ok: true } : { ok: false, reason: `Needs 3 words with short example sentences — you have ${n}` };
  },
  stars: [110, 170, 215],
  start(ctx) {
    const rp = ctx.rp;
    const total = ctx.rounds(8, 4, 4);
    let range = ctx.size === "full" ? rp.range : BUILDER_BASE;
    let eligible = builderWords(ctx.pool, range);
    if (eligible.length < Math.min(total, 4)) { range = BUILDER_BASE; eligible = builderWords(ctx.pool, range); }
    const decoys = ctx.size === "full" ? (rp.decoy || 0) : 0;
    const words = sampleWords(eligible, total);
    let r = 0, score = 0, combo = 0, maxCombo = 0, correct = 0, wrong = 0, firstTry = 0;
    let cur = null, bank = [], line = [], tries = 0;
    const done = () => ctx.finish({ score, correct, wrong, maxCombo, stats: { firstTry } });

    const render = () => {
      const lineEl = document.getElementById("sb-line");
      lineEl.innerHTML = line.length
        ? line.map((ti, i) => `<button class="sb-tile placed" data-l="${i}">${escapeHtml(bank[ti].text)}</button>`).join("")
        : `<span class="sb-placeholder">Tap or drag the tiles into order…</span>`;
      lineEl.classList.remove("ok", "bad");
      document.getElementById("sb-bank").innerHTML = bank.map((t, i) =>
        `<button class="sb-tile ${t.decoy ? "decoy" : ""}" data-b="${i}" ${t.used ? "disabled" : ""}>${escapeHtml(t.text)}</button>`).join("");
      document.getElementById("sb-check").disabled = line.length !== cur.it.tiles.length;
    };

    const round = () => {
      if (r >= words.length) { done(); return; }
      ctx.teach("");
      const w = words[r++];
      const it = builderItem(w, range);
      cur = { w, it };
      tries = 0; line = [];
      let order = shuffle(it.tiles.slice());
      for (let k = 0; k < 12 && new Set(it.tiles).size > 1 && order.join(" ") === it.tiles.join(" "); k++) order = shuffle(order);
      bank = order.map(text => ({ text, used: false }));
      // Decoy tiles: whole words from other sentences, never one that's
      // already in this sentence.
      if (decoys) {
        const have = new Set(it.tiles.map(t => normKey(t)));
        const pool = shuffle(eligible.filter(x => x !== w).flatMap(x => builderItem(x, range) ? builderItem(x, range).tiles : []))
          .filter(t => /^[\p{L}]+$/u.test(t) && !have.has(normKey(t)));
        // German: the first decoy is the sentence's own article in the
        // wrong case (dem for den) — so the order AND the case count.
        const gd = builderGrammarDecoy(it.tiles, have);
        cur.gd = gd;
        (gd ? [gd, ...pool] : pool).slice(0, decoys).forEach(t => bank.splice(Math.floor(Math.random() * (bank.length + 1)), 0, { text: t, used: false, decoy: true }));
      }
      ctx.setBar((r - 1) / words.length, "progress");
      ctx.setRound(r, words.length);
      const noReveal = ctx.size === "full" && rp.noReveal;
      ctx.stage.innerHTML = `
        <div class="sb-card g-enter">
          <div class="g-q-label">Build this sentence${ctx.tag(w)}</div>
          <div class="sb-trans">${escapeHtml(it.ex.en)}</div>
          ${decoys ? `<div class="sb-decoy-note">${decoys === 1 ? "One tile doesn't belong" : `${decoys} tiles don't belong`}</div>` : ""}
        </div>
        <div class="sb-line" id="sb-line"></div>
        <div class="sb-bank" id="sb-bank"></div>
        <div class="sc-tools">
          <button class="g-sec-btn" id="sb-clear">↺ Clear</button>
          ${noReveal ? "" : `<button class="g-sec-btn" id="sb-give">Reveal</button>`}
          <button class="g-big-btn sb-check" id="sb-check" disabled>Check</button>
        </div>`;
      document.getElementById("sb-clear").onclick = () => { if (ctx.busy) return; bank.forEach(t => t.used = false); line = []; render(); };
      const give = document.getElementById("sb-give");
      if (give) give.onclick = () => reveal();
      document.getElementById("sb-check").onclick = check;
      ctx.busy = false;
      render();
    };

    const reveal = force => {
      if (ctx.busy && force !== true) return;
      ctx.busy = true;
      wrong++; combo = ctx.comboAfterMiss(combo, cur.w); ctx.setCombo(combo);
      ctx.missed(cur.w);
      const lineEl = document.getElementById("sb-line");
      lineEl.innerHTML = cur.it.tiles.map(t => `<span class="sb-tile shown">${escapeHtml(t)}</span>`).join("");
      lineEl.classList.add("shown");
      document.getElementById("sb-bank").innerHTML = "";
      document.getElementById("sb-check").disabled = true;
      speak(cur.it.ex[WORD_KEY]);
      playMiss(); haptic("miss");
      ctx.say("Here's the sentence.");
      const rule = typeof wordOrderRuleHtml === "function" ? wordOrderRuleHtml(cur.it.ex[WORD_KEY]) : "";
      ctx.teach(`<div class="g-teach-main">${escapeHtml(cur.it.ex[WORD_KEY])}</div><div class="g-teach-sub">${escapeHtml(cur.it.ex.en || "")}</div>${rule ? `<div class="g-teach-rule">${rule}</div>` : ""}${cur.gd ? `<div class="g-teach-sub">The extra tile <s>${escapeHtml(cur.gd)}</s> was the same article in the wrong case.</div>` : ""}`, "bad");
      ctx.waitContinue(ctx.sudden ? done : round);
    };

    const check = () => {
      if (ctx.busy || line.length !== cur.it.tiles.length) return;
      const guess = line.map(i => bank[i].text);
      const lineEl = document.getElementById("sb-line");
      const firstBad = guess.findIndex((t, i) => t !== cur.it.tiles[i]);
      if (firstBad < 0) {
        ctx.busy = true;
        correct++; combo++; maxCombo = Math.max(maxCombo, combo);
        if (tries === 0) firstTry++;
        const pts = ctx.award(cur.w, 20 + (tries === 0 ? 10 : 0));
        score += pts;
        ctx.setScore(score); ctx.setCombo(combo);
        lineEl.classList.add("ok");
        lineEl.querySelectorAll(".sb-tile").forEach(t => t.disabled = true);
        floatScore(lineEl, "+" + pts, ctx.isGolden(cur.w) ? "gold" : "");
        speak(cur.it.ex[WORD_KEY]);
        if (combo >= 3) playCombo(combo); else playSuccess();
        haptic("correct");
        ctx.say("Perfect!");
        gTimeout(round, 1700);
        return;
      }
      tries++;
      const tileEls = lineEl.querySelectorAll(".sb-tile");
      if (tileEls[firstBad]) tileEls[firstBad].classList.add("bad");
      lineEl.classList.add("bad");
      shakeEl(lineEl); playMiss(); haptic("miss");
      if (tries >= 2 || ctx.sudden) { ctx.busy = true; gTimeout(() => reveal(true), 700); return; }
      ctx.say("Almost — the highlighted word is out of place. Drag it where it belongs!");
      const rule = typeof wordOrderRuleHtml === "function" ? wordOrderRuleHtml(cur.it.ex[WORD_KEY]) : "";
      const usedDecoy = line.some(i => bank[i].decoy);
      ctx.teach(`${usedDecoy ? "A tile in your sentence doesn't belong. " : "The highlighted word is out of place. "}${rule ? `<div class="g-teach-rule">${rule}</div>` : ""}`, "near");
    };

    const takeBack = li => {
      if (ctx.busy || li < 0 || li >= line.length) return;
      bank[line[li]].used = false;
      line.splice(li, 1);
      render();
    };

    gListen(ctx.stage, "click", e => {
      const b = e.target.closest(".sb-tile[data-b]");
      if (b && !ctx.busy) {
        const i = +b.dataset.b;
        if (bank[i].used || line.length >= cur.it.tiles.length) { if (line.length >= cur.it.tiles.length) shakeEl(document.getElementById("sb-line")); return; }
        bank[i].used = true; line.push(i);
        playPop(); render();
        return;
      }
      const l = e.target.closest(".sb-tile[data-l]");
      if (l) takeBack(+l.dataset.l);
    });

    // ── drag & drop ──
    const lineEl = () => document.getElementById("sb-line");
    const bankEl = () => document.getElementById("sb-bank");
    const clearHover = () => {
      ctx.stage.querySelectorAll(".g-caret").forEach(c => c.remove());
      const bk = bankEl(); if (bk) bk.classList.remove("drop-hot");
      const L = lineEl();
      if (L && !line.length && !L.querySelector(".sb-placeholder") && !L.classList.contains("shown"))
        L.innerHTML = `<span class="sb-placeholder">Tap or drag the tiles into order…</span>`;
    };
    gDrag(ctx.stage, {
      items: ".sb-tile[data-b]:not(:disabled), .sb-tile[data-l]",
      canDrag: () => !ctx.busy && !ctx.paused && !ctx.finished,
      resolve: (x, y, el) => {
        const L = lineEl(), B = bankEl();
        if (pointIn(L, x, y, 14)) {
          const kids = [...L.querySelectorAll(".sb-tile[data-l]")].filter(k => k !== el);
          return { zone: "line", index: insertionIndex(kids, x, y), kids };
        }
        if (el.dataset.l !== undefined && pointIn(B, x, y, 24)) return { zone: "bank" };
        return null;
      },
      hover: (t) => {
        clearHover();
        if (!t) return;
        if (t.zone === "bank") { bankEl().classList.add("drop-hot"); return; }
        const caret = document.createElement("span");
        caret.className = "g-caret";
        const L = lineEl();
        const ph = L.querySelector(".sb-placeholder"); if (ph) ph.remove();
        const ref = t.kids[t.index] || null;
        L.insertBefore(caret, ref);
      },
      drop: (el, t) => {
        clearHover();
        if (t.zone === "bank") {
          if (el.dataset.l === undefined) return false;
          takeBack(+el.dataset.l);
          return true;
        }
        // Map index among the other kids back to a line position.
        let idx = t.index;
        if (el.dataset.l !== undefined) {
          const li = +el.dataset.l;
          const bi = line[li];
          line.splice(li, 1);
          line.splice(Math.min(idx, line.length), 0, bi);
        } else {
          const bi = +el.dataset.b;
          if (bank[bi].used) return false;
          if (line.length >= cur.it.tiles.length) { shakeEl(lineEl()); render(); return false; }
          bank[bi].used = true;
          line.splice(Math.min(idx, line.length), 0, bi);
        }
        playPop();
        render();
        return true;
      },
    });
    ctx.onKey = e => {
      if (e.key === "Enter") { e.preventDefault(); check(); }
      else if (e.key === "Backspace") { e.preventDefault(); takeBack(line.length - 1); }
    };
    ctx.setScore(0);
    round();
  },
});
