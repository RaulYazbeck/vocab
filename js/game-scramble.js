// ── GAME: LETTER SCRAMBLE ─────────────────────
// Spell the word from shuffled letter tiles. Nouns show their article
// as a fixed chip and only the noun is spelled. Letters are displayed
// and compared in lower case, so a capital tile never gives away the
// first letter; repeated letters are interchangeable.
//
// Tap a letter to drop it in the first empty box — or DRAG it onto any
// box (dropping on a filled box swaps them). Drag between boxes to
// swap, drag a letter back down to remove it.
//
// Ranks: decoy letters from 🥈 Silver; from 💠 Platinum, words you know
// are spelled from memory (no tiles — typed, recall credit).

function scrambleTarget(word) {
  const np = nounParts(word);
  if (np && !np.elided) {
    const parts = np.full.split(" ");
    const noun = parts.slice(1).join(" ");
    if (/^[\p{L}]+$/u.test(noun) && noun.length >= 3 && noun.length <= 12) return { prefix: parts[0], word: noun };
    return null;
  }
  const f = gameForm(word);
  if (/^[\p{L}]+$/u.test(f) && f.length >= 3 && f.length <= 12) return { prefix: "", word: f };
  return null;
}
function scrambleWords(pool) { return dedupeWords(pool.filter(w => scrambleTarget(w))); }
const lowerCh = c => c.toLocaleLowerCase(IS_FRENCH_APP ? "fr" : "de");
const DECOY_LETTERS = IS_FRENCH_APP ? "aeinorstulcdmpé" : "eanirstdhulgcmob";

registerGame({
  id: "scramble", name: "Letter Scramble", icon: "🔤", skill: "Spelling", credit: "recognition",
  ranks: [
    { decoys: 0 }, { decoys: 1 }, { decoys: 2 }, { decoys: 2, typed: true }, { decoys: 3, typed: true },
  ],
  twists: ["golden", "sudden"],
  howTo: ["Tap the letters in order to spell the word."],
  requirement(pool) {
    const n = scrambleWords(pool).length;
    return n >= 4 ? { ok: true } : { ok: false, reason: `Needs 4 single words (3–12 letters) — you have ${n}` };
  },
  stars: [110, 150, 185],
  start(ctx) {
    const rp = ctx.rp;
    const total = ctx.rounds(10, 5, 5);
    const words = sampleWords(scrambleWords(ctx.pool), total);
    let r = 0, score = 0, combo = 0, maxCombo = 0, correct = 0, wrong = 0, noHint = 0, typedOk = 0;
    let cur = null, tiles = [], slots = [], stack = [], hints = 0, tries = 0;
    const done = () => ctx.finish({ score, correct, wrong, maxCombo, typedCorrect: typedOk, stats: { noHint } });

    const render = () => {
      const t = cur.t;
      document.getElementById("sc-slots").innerHTML =
        (t.prefix ? `<span class="sc-prefix">${escapeHtml(t.prefix)}</span>` : "") +
        slots.map((ti, i) => {
          const ch = ti !== null ? lowerCh(tiles[ti].ch) : "";
          return `<button class="sc-slot ${ch ? "filled" : ""}" data-s="${i}" ${ch ? "" : "aria-label='empty'"}>${escapeHtml(ch)}</button>`;
        }).join("");
      document.getElementById("sc-bank").innerHTML = tiles.map((tl, i) =>
        `<button class="sc-tile" data-t="${i}" ${tl.used ? "disabled" : ""}>${escapeHtml(lowerCh(tl.ch))}</button>`).join("");
    };

    const round = () => {
      if (r >= words.length) { done(); return; }
      ctx.teach("");
      const w = words[r++];
      const t = scrambleTarget(w);
      const f = ctx.fmt(w);
      const typed = !!rp.typed && f.typed && ctx.size === "full";
      cur = { w, t, typed };
      hints = 0; tries = 0; stack = [];
      const letters = [...t.word];
      slots = new Array(letters.length).fill(null);
      let order = shuffle(letters.slice());
      for (let k = 0; k < 12 && new Set(letters.map(lowerCh)).size > 1 && order.map(lowerCh).join("") === letters.map(lowerCh).join(""); k++) order = shuffle(order);
      const nDecoy = ctx.size === "full" && !f.rookie ? rp.decoys || 0 : 0;
      for (let k = 0; k < nDecoy; k++) order.splice(Math.floor(Math.random() * (order.length + 1)), 0, DECOY_LETTERS[Math.floor(Math.random() * DECOY_LETTERS.length)]);
      tiles = order.map(ch => ({ ch, used: false }));
      ctx.setBar((r - 1) / words.length, "progress");
      ctx.setRound(r, words.length);
      ctx.stage.innerHTML = `
        <div class="g-question g-enter">
          <div class="g-q-label">${typed ? "Spell it from memory" : "Spell it"}${nDecoy ? ` · ${nDecoy} extra letter${nDecoy > 1 ? "s" : ""}` : ""}${ctx.tag(w)}</div>
          <div class="g-q-word">${escapeHtml(gamePrompt(w))}</div>
        </div>
        ${typed ? `<div class="sc-slots" id="sc-slots">${t.prefix ? `<span class="sc-prefix">${escapeHtml(t.prefix)}</span>` : ""}<span class="sc-typed-hint">${t.word.length} letters</span></div>${gTypedHtml("type the word…")}`
          : `<div class="sc-slots" id="sc-slots"></div>
        <div class="sc-bank" id="sc-bank"></div>
        <div class="sc-tools">
          <button class="g-sec-btn" id="sc-undo" aria-label="Undo">⌫</button>
          <button class="g-sec-btn" id="sc-hint">💡 Hint</button>
          <button class="g-sec-btn" id="sc-give">Reveal</button>
        </div>`}`;
      ctx.busy = false;
      if (typed) { gTypedBind(ctx, v => answerTyped(v)); return; }
      document.getElementById("sc-undo").onclick = undo;
      document.getElementById("sc-hint").onclick = hint;
      document.getElementById("sc-give").onclick = () => reveal("Revealed");
      render();
    };

    const filled = () => slots.every(x => x !== null);
    const putIn = (tileIdx, slotIdx) => {
      if (slots[slotIdx] !== null) tiles[slots[slotIdx]].used = false;
      slots[slotIdx] = tileIdx; tiles[tileIdx].used = true;
      stack = stack.filter(x => x !== slotIdx); stack.push(slotIdx);
    };
    const place = i => {
      if (ctx.busy || !cur || cur.typed || !tiles[i] || tiles[i].used) return;
      const j = slots.indexOf(null);
      if (j < 0) return;
      putIn(i, j);
      playPop();
      render();
      if (filled()) check();
    };
    const removeAt = j => {
      if (ctx.busy || slots[j] === null) return;
      tiles[slots[j]].used = false; slots[j] = null;
      stack = stack.filter(x => x !== j);
      render();
    };
    const undo = () => { if (ctx.busy || !stack.length) return; removeAt(stack[stack.length - 1]); };
    const hint = () => {
      if (ctx.busy || cur.typed) return;
      const target = [...cur.t.word];
      const j = slots.findIndex((ti, k) => ti === null || lowerCh(tiles[ti].ch) !== lowerCh(target[k]));
      if (j < 0) return;
      if (slots[j] !== null) { tiles[slots[j]].used = false; slots[j] = null; }
      // A tile with the right letter: a free one, or take it from a box
      // where it's wrong.
      let i = tiles.findIndex(tl => !tl.used && lowerCh(tl.ch) === lowerCh(target[j]));
      if (i < 0) {
        const k = slots.findIndex((ti, kk) => ti !== null && kk !== j && lowerCh(tiles[ti].ch) === lowerCh(target[j]) && lowerCh(tiles[ti].ch) !== lowerCh(target[kk]));
        if (k < 0) return;
        i = slots[k]; slots[k] = null; tiles[i].used = false;
      }
      hints++;
      floatScore(document.getElementById("sc-hint"), "−3", "bad");
      putIn(i, j);
      render();
      if (filled()) check();
    };
    const reveal = (why, force) => {
      if (ctx.busy && !force) return;
      ctx.busy = true;
      wrong++; combo = ctx.comboAfterMiss(combo, cur.w);
      ctx.missed(cur.w);
      ctx.setCombo(combo);
      const t = cur.t;
      document.getElementById("sc-slots").innerHTML =
        (t.prefix ? `<span class="sc-prefix">${escapeHtml(t.prefix)}</span>` : "") +
        [...t.word].map(ch => `<span class="sc-slot filled shown">${escapeHtml(lowerCh(ch))}</span>`).join("");
      const bank = document.getElementById("sc-bank");
      if (bank) bank.innerHTML = `<div class="sc-answer">${escapeHtml(gameForm(cur.w))}</div>`;
      speak(gameForm(cur.w));
      playMiss(); haptic("miss");
      ctx.say(`${why}: ${gameForm(cur.w)}`);
      ctx.teach(wordLessonHtml(cur.w), "bad");
      ctx.waitContinue(ctx.sudden ? done : round);
    };
    const win = (el, base) => {
      ctx.busy = true;
      correct++; combo++; maxCombo = Math.max(maxCombo, combo);
      if (hints === 0) noHint++;
      const pts = ctx.award(cur.w, Math.max(5, base - hints * 3 - tries * 5));
      score += pts;
      ctx.setScore(score); ctx.setCombo(combo);
      if (el) el.classList.add("ok");
      floatScore(el || ctx.stage, "+" + pts, ctx.isGolden(cur.w) ? "gold" : "");
      speak(gameForm(cur.w));
      if (combo >= 3) playCombo(combo); else playSuccess();
      haptic("correct");
      ctx.say(`Correct — ${gameForm(cur.w)}`);
      ctx.teach(wordLessonHtml(cur.w), "ok");
      gTimeout(round, 1700);
    };
    const check = () => {
      const guess = slots.map(i => lowerCh(tiles[i].ch)).join("");
      const slotsEl = document.getElementById("sc-slots");
      if (guess === lowerCh(cur.t.word)) {
        ctx.hit(cur.w);
        const bank = document.getElementById("sc-bank");
        if (bank) bank.innerHTML = `<div class="sc-answer ok">${escapeHtml(gameForm(cur.w))}</div>`;
        win(slotsEl, 20);
        return;
      }
      tries++;
      slotsEl.classList.add("bad");
      shakeEl(slotsEl); playMiss(); haptic("miss");
      ctx.busy = true;
      if (tries >= 3 || ctx.sudden) { gTimeout(() => { slotsEl.classList.remove("bad"); reveal(ctx.sudden ? "Sudden death" : "Three tries", true); }, 500); return; }
      ctx.say(`Not quite — ${3 - tries} ${3 - tries === 1 ? "try" : "tries"} left`);
      // Keep the letters that are right; take back the rest.
      const target = [...cur.t.word];
      gTimeout(() => {
        ctx.busy = false; slotsEl.classList.remove("bad");
        slots.forEach((ti, k) => { if (ti !== null && lowerCh(tiles[ti].ch) !== lowerCh(target[k])) { tiles[ti].used = false; slots[k] = null; } });
        stack = stack.filter(k => slots[k] !== null);
        render();
      }, 550);
    };
    const answerTyped = v => {
      if (ctx.busy || !cur.typed) return;
      const input = document.getElementById("g-typed");
      const res = gradeTyped(v, [cur.t.word]);
      if (res === true) { typedOk++; ctx.hit(cur.w, "recall"); if (input) input.classList.add("correct"); win(document.getElementById("sc-slots"), 25); return; }
      ctx.busy = true;
      if (res === "near") {
        if (input) input.classList.add("near");
        document.getElementById("sc-slots").innerHTML = `<span class="g-near">≈ ${diffHtml(v, cur.t.word)}</span>`;
        ctx.say("Almost — check the spelling");
        ctx.teach(`≈ Almost — ${diffHtml(v, cur.t.word)}`, "near");
        ctx.waitContinue(round);
        return;
      }
      if (input) input.classList.add("wrong");
      document.getElementById("sc-slots").innerHTML = `<span class="sc-answer">${escapeHtml(gameForm(cur.w))}</span>`;
      wrong++; combo = ctx.comboAfterMiss(combo, cur.w); ctx.setCombo(combo);
      ctx.missed(cur.w);
      speak(gameForm(cur.w)); playMiss(); haptic("miss");
      ctx.teach(wordLessonHtml(cur.w), "bad");
      ctx.waitContinue(ctx.sudden ? done : round);
    };

    gListen(ctx.stage, "click", e => {
      const t = e.target.closest(".sc-tile");
      if (t) { place(+t.dataset.t); return; }
      const s = e.target.closest(".sc-slot[data-s]");
      if (s && s.classList.contains("filled")) removeAt(+s.dataset.s);
    });
    // ── drag & drop ──
    const clearHot = () => ctx.stage.querySelectorAll(".drop-hot").forEach(x => x.classList.remove("drop-hot"));
    gDrag(ctx.stage, {
      items: ".sc-tile:not(:disabled), .sc-slot.filled[data-s]",
      canDrag: () => !ctx.busy && !ctx.paused && !ctx.finished && cur && !cur.typed,
      resolve: (x, y, el) => {
        const slot = [...ctx.stage.querySelectorAll(".sc-slot[data-s]")].find(s => s !== el && pointIn(s, x, y, 5));
        if (slot) return { zone: "slot", j: +slot.dataset.s, el: slot };
        if (el.dataset.s !== undefined && pointIn(document.getElementById("sc-bank"), x, y, 20)) return { zone: "bank" };
        return null;
      },
      hover: t => { clearHot(); if (t && t.el) t.el.classList.add("drop-hot"); else if (t && t.zone === "bank") document.getElementById("sc-bank").classList.add("drop-hot"); },
      drop: (el, t) => {
        clearHot();
        if (t.zone === "bank") { removeAt(+el.dataset.s); return true; }
        if (el.dataset.s !== undefined) {
          const a = +el.dataset.s, b = t.j;
          [slots[a], slots[b]] = [slots[b], slots[a]];
          stack = stack.filter(k => slots[k] !== null);
          if (slots[b] !== null && !stack.includes(b)) stack.push(b);
        } else putIn(+el.dataset.t, t.j);
        playPop();
        render();
        if (filled()) check();
        return true;
      },
    });
    ctx.onKey = e => {
      if (!cur || cur.typed) return;
      if (e.key === "Backspace") { e.preventDefault(); undo(); return; }
      if (e.key.length !== 1 || !/\p{L}/u.test(e.key)) return;
      const k = lowerCh(e.key);
      let i = tiles.findIndex(tl => !tl.used && lowerCh(tl.ch) === k);
      // No exact tile left? Let a plain "e" pick an "è"/"é" (keyboards
      // without accent keys) — prefer the letter the word needs next.
      if (i < 0) {
        const want = cur.t.word[slots.indexOf(null)];
        const loose = tl => !tl.used && stripAccents(lowerCh(tl.ch)) === stripAccents(k);
        i = tiles.findIndex(tl => loose(tl) && want && lowerCh(tl.ch) === lowerCh(want));
        if (i < 0) i = tiles.findIndex(loose);
      }
      if (i >= 0) { e.preventDefault(); place(i); }
    };
    ctx.setScore(0);
    round();
  },
});
