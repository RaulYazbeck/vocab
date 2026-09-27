// ── GAME: LETTER SCRAMBLE ─────────────────────
// Spell the word from shuffled letter tiles. Nouns show their article
// as a fixed chip and only the noun is spelled. Letters are displayed
// and compared in lower case, so a capital tile never gives away the
// first letter; repeated letters are interchangeable.

function scrambleTarget(word) {
  const np = nounParts(word);
  if (np) {
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

registerGame({
  id: "scramble", name: "Letter Scramble", icon: "🔤", skill: "Spelling",
  howTo: [
    "Tap the letters in the right order to spell the word.",
    "Tap a filled box or ⌫ to take a letter back. On a keyboard, just type.",
    "💡 reveals the next letter (costs points). Three wrong tries reveal the word.",
  ],
  requirement(pool) {
    const n = scrambleWords(pool).length;
    return n >= 4 ? { ok: true } : { ok: false, reason: `Needs 4 single words (3–12 letters) — you have ${n}` };
  },
  stars: [110, 150, 185],
  start(ctx) {
    const total = ctx.rounds(10, 5, 5);
    const words = sampleWords(scrambleWords(ctx.pool), total);
    let r = 0, score = 0, combo = 0, maxCombo = 0, correct = 0, wrong = 0;
    let cur = null, tiles = [], placed = [], hints = 0, tries = 0;

    const render = () => {
      const t = cur.t;
      const slots = [];
      for (let i = 0; i < t.word.length; i++) {
        const ch = placed[i] !== undefined ? lowerCh(tiles[placed[i]].ch) : "";
        slots.push(`<button class="sc-slot ${ch ? "filled" : ""}" data-s="${i}" ${ch ? "" : "disabled"}>${escapeHtml(ch)}</button>`);
      }
      document.getElementById("sc-slots").innerHTML =
        (t.prefix ? `<span class="sc-prefix">${escapeHtml(t.prefix)}</span>` : "") + slots.join("");
      document.getElementById("sc-bank").innerHTML = tiles.map((tl, i) =>
        `<button class="sc-tile" data-t="${i}" ${tl.used ? "disabled" : ""}>${escapeHtml(lowerCh(tl.ch))}</button>`).join("");
    };

    const round = () => {
      if (r >= words.length) { ctx.finish({ score, correct, wrong, maxCombo }); return; }
      const w = words[r++];
      const t = scrambleTarget(w);
      cur = { w, t };
      hints = 0; tries = 0; placed = [];
      const letters = [...t.word];
      let order = shuffle(letters.slice());
      for (let k = 0; k < 12 && new Set(letters.map(lowerCh)).size > 1 && order.map(lowerCh).join("") === letters.map(lowerCh).join(""); k++) order = shuffle(order);
      tiles = order.map(ch => ({ ch, used: false }));
      ctx.setBar((r - 1) / words.length, "progress");
      ctx.setClock(`${r}/${words.length}`);
      ctx.stage.innerHTML = `
        <div class="g-question g-enter">
          <div class="g-q-label">Spell it</div>
          <div class="g-q-word">${escapeHtml(gamePrompt(w))}</div>
        </div>
        <div class="sc-slots" id="sc-slots"></div>
        <div class="sc-bank" id="sc-bank"></div>
        <div class="sc-tools">
          <button class="g-sec-btn" id="sc-undo" aria-label="Undo">⌫</button>
          <button class="g-sec-btn" id="sc-hint">💡 Hint</button>
          <button class="g-sec-btn" id="sc-give">Reveal</button>
        </div>`;
      document.getElementById("sc-undo").onclick = undo;
      document.getElementById("sc-hint").onclick = hint;
      document.getElementById("sc-give").onclick = () => reveal("Revealed");
      ctx.busy = false;
      render();
    };

    const place = i => {
      if (ctx.busy || !tiles[i] || tiles[i].used || placed.length >= cur.t.word.length) return;
      tiles[i].used = true; placed.push(i);
      playPop();
      render();
      if (placed.length === cur.t.word.length) check();
    };
    const undo = () => {
      if (ctx.busy || !placed.length) return;
      tiles[placed.pop()].used = false;
      render();
    };
    const unplaceFrom = k => {
      if (ctx.busy) return;
      while (placed.length > k) tiles[placed.pop()].used = false;
      render();
    };
    const hint = () => {
      if (ctx.busy) return;
      const target = [...cur.t.word];
      let k = 0;
      while (k < placed.length && lowerCh(tiles[placed[k]].ch) === lowerCh(target[k])) k++;
      if (k >= target.length) return;
      while (placed.length > k) tiles[placed.pop()].used = false;
      const i = tiles.findIndex(tl => !tl.used && lowerCh(tl.ch) === lowerCh(target[k]));
      if (i < 0) return;
      hints++;
      floatScore(document.getElementById("sc-hint"), "−3", "bad");
      place(i);
    };
    const reveal = (why, force) => {
      if (ctx.busy && !force) return;
      ctx.busy = true;
      wrong++; combo = 0;
      ctx.missed(cur.w);
      ctx.setCombo(0);
      const t = cur.t;
      document.getElementById("sc-slots").innerHTML =
        (t.prefix ? `<span class="sc-prefix">${escapeHtml(t.prefix)}</span>` : "") +
        [...t.word].map(ch => `<span class="sc-slot filled shown">${escapeHtml(lowerCh(ch))}</span>`).join("");
      document.getElementById("sc-bank").innerHTML = `<div class="sc-answer">${escapeHtml(gameForm(cur.w))}</div>`;
      speak(gameForm(cur.w));
      playMiss();
      ctx.say(`${why}: ${gameForm(cur.w)}`);
      gTimeout(round, 1800);
    };
    const check = () => {
      const guess = placed.map(i => lowerCh(tiles[i].ch)).join("");
      const slotsEl = document.getElementById("sc-slots");
      if (guess === lowerCh(cur.t.word)) {
        ctx.busy = true;
        correct++; combo++; maxCombo = Math.max(maxCombo, combo);
        const pts = Math.max(5, 20 - hints * 3 - tries * 5);
        score += pts;
        ctx.setScore(score); ctx.setCombo(combo);
        slotsEl.classList.add("ok");
        document.getElementById("sc-bank").innerHTML = `<div class="sc-answer ok">${escapeHtml(gameForm(cur.w))}</div>`;
        floatScore(slotsEl, "+" + pts);
        speak(gameForm(cur.w));
        if (combo >= 3) playCombo(combo); else playSuccess();
        ctx.say(`Correct — ${gameForm(cur.w)}`);
        gTimeout(round, 1100);
      } else {
        tries++;
        slotsEl.classList.add("bad");
        shakeEl(slotsEl); playMiss(); buzz(40);
        ctx.busy = true;
        if (tries >= 3) { gTimeout(() => { slotsEl.classList.remove("bad"); reveal("Three tries", true); }, 500); return; }
        ctx.say(`Not quite — ${3 - tries} ${3 - tries === 1 ? "try" : "tries"} left`);
        // Keep the letters that are already right; take back the rest.
        let keep = 0;
        const target = [...cur.t.word];
        while (keep < placed.length && lowerCh(tiles[placed[keep]].ch) === lowerCh(target[keep])) keep++;
        gTimeout(() => { ctx.busy = false; slotsEl.classList.remove("bad"); unplaceFrom(keep); }, 550);
      }
    };

    gListen(ctx.stage, "click", e => {
      const t = e.target.closest(".sc-tile");
      if (t) { place(+t.dataset.t); return; }
      const s = e.target.closest(".sc-slot[data-s]");
      if (s && !s.disabled) unplaceFrom(+s.dataset.s);
    });
    ctx.onKey = e => {
      if (e.key === "Backspace") { e.preventDefault(); undo(); return; }
      if (e.key.length !== 1 || !/\p{L}/u.test(e.key)) return;
      const k = lowerCh(e.key);
      let i = tiles.findIndex(tl => !tl.used && lowerCh(tl.ch) === k);
      // No exact tile left? Let a plain "e" pick an "è"/"é" (keyboards
      // without accent keys) — prefer the letter the word needs next.
      if (i < 0) {
        const want = cur.t.word[placed.length];
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
