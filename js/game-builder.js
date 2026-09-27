// ── GAME: SENTENCE BUILDER ────────────────────
// Rebuild an example sentence from shuffled word tiles, guided by its
// translation. Trains word order (V2, verb-final, …). Punctuation is
// glued to the neighbouring word so tiles are always real words; the
// check compares text, so repeated words are interchangeable.

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
const _builderCache = new Map();
_gameCacheClearers.push(() => _builderCache.clear());
function builderItem(word) {
  const k = wordKey(word); // examples are never edited, so the key is stable
  if (_builderCache.has(k)) return _builderCache.get(k);
  let res = null;
  for (const ex of word.examples || []) {
    const s = ex && ex[WORD_KEY];
    if (!s || !ex.en) continue;
    const tiles = sentenceTiles(s);
    if (tiles.length >= 3 && tiles.length <= 9) { res = { ex, tiles }; break; }
  }
  _builderCache.set(k, res);
  return res;
}
function builderWords(pool) {
  const seen = new Set();
  return pool.filter(w => {
    const it = builderItem(w);
    if (!it) return false;
    const key = normKey(it.ex[WORD_KEY]);
    if (seen.has(key)) return false;
    seen.add(key); return true;
  });
}

registerGame({
  id: "builder", name: "Sentence Builder", icon: "🧱", skill: "Grammar · word order",
  howTo: [
    "Put the word tiles in order to build the sentence that matches the translation.",
    "Tap a tile to add it; tap a placed tile to send it back.",
    "Get it right first time for a bonus. Two misses reveal the answer.",
    "On a keyboard: Enter checks, Backspace takes back the last tile.",
  ],
  requirement(pool) {
    const n = builderWords(pool).length;
    return n >= 3 ? { ok: true } : { ok: false, reason: `Needs 3 words with short example sentences — you have ${n}` };
  },
  stars: [110, 170, 215],
  start(ctx) {
    const total = ctx.rounds(8, 4, 4);
    const words = sampleWords(builderWords(ctx.pool), total);
    let r = 0, score = 0, combo = 0, maxCombo = 0, correct = 0, wrong = 0;
    let cur = null, bank = [], line = [], tries = 0;

    const render = () => {
      const lineEl = document.getElementById("sb-line");
      lineEl.innerHTML = line.length
        ? line.map((ti, i) => `<button class="sb-tile placed" data-l="${i}">${escapeHtml(bank[ti].text)}</button>`).join("")
        : `<span class="sb-placeholder">Tap the tiles below in order…</span>`;
      lineEl.classList.remove("ok", "bad");
      document.getElementById("sb-bank").innerHTML = bank.map((t, i) =>
        `<button class="sb-tile" data-b="${i}" ${t.used ? "disabled" : ""}>${escapeHtml(t.text)}</button>`).join("");
      document.getElementById("sb-check").disabled = line.length !== bank.length;
    };

    const round = () => {
      if (r >= words.length) { ctx.finish({ score, correct, wrong, maxCombo }); return; }
      const w = words[r++];
      const it = builderItem(w);
      cur = { w, it };
      tries = 0; line = [];
      let order = shuffle(it.tiles.slice());
      for (let k = 0; k < 12 && new Set(it.tiles).size > 1 && order.join(" ") === it.tiles.join(" "); k++) order = shuffle(order);
      bank = order.map(text => ({ text, used: false }));
      ctx.setBar((r - 1) / words.length, "progress");
      ctx.setClock(`${r}/${words.length}`);
      ctx.stage.innerHTML = `
        <div class="sb-card g-enter">
          <div class="g-q-label">Build this sentence</div>
          <div class="sb-trans">${escapeHtml(it.ex.en)}</div>
        </div>
        <div class="sb-line" id="sb-line"></div>
        <div class="sb-bank" id="sb-bank"></div>
        <div class="sc-tools">
          <button class="g-sec-btn" id="sb-clear">↺ Clear</button>
          <button class="g-sec-btn" id="sb-give">Reveal</button>
          <button class="g-big-btn sb-check" id="sb-check" disabled>Check</button>
        </div>`;
      document.getElementById("sb-clear").onclick = () => { if (ctx.busy) return; bank.forEach(t => t.used = false); line = []; render(); };
      document.getElementById("sb-give").onclick = () => reveal();
      document.getElementById("sb-check").onclick = check;
      ctx.busy = false;
      render();
    };

    const reveal = force => {
      if (ctx.busy && force !== true) return;
      ctx.busy = true;
      wrong++; combo = 0; ctx.setCombo(0);
      ctx.missed(cur.w);
      const lineEl = document.getElementById("sb-line");
      lineEl.innerHTML = cur.it.tiles.map(t => `<span class="sb-tile shown">${escapeHtml(t)}</span>`).join("");
      lineEl.classList.add("shown");
      document.getElementById("sb-bank").innerHTML = "";
      document.getElementById("sb-check").disabled = true;
      speak(cur.it.ex[WORD_KEY]);
      playMiss();
      ctx.say("Here's the sentence.");
      gTimeout(round, 2600);
    };

    const check = () => {
      if (ctx.busy || line.length !== bank.length) return;
      const guess = line.map(i => bank[i].text);
      const lineEl = document.getElementById("sb-line");
      const firstBad = guess.findIndex((t, i) => t !== cur.it.tiles[i]);
      if (firstBad < 0) {
        ctx.busy = true;
        correct++; combo++; maxCombo = Math.max(maxCombo, combo);
        const pts = 20 + (tries === 0 ? 10 : 0);
        score += pts;
        ctx.setScore(score); ctx.setCombo(combo);
        lineEl.classList.add("ok");
        lineEl.querySelectorAll(".sb-tile").forEach(t => t.disabled = true);
        floatScore(lineEl, "+" + pts);
        speak(cur.it.ex[WORD_KEY]);
        if (combo >= 3) playCombo(combo); else playSuccess();
        ctx.say("Perfect!");
        gTimeout(round, 1700);
        return;
      }
      tries++;
      const tileEls = lineEl.querySelectorAll(".sb-tile");
      if (tileEls[firstBad]) tileEls[firstBad].classList.add("bad");
      lineEl.classList.add("bad");
      shakeEl(lineEl); playMiss(); buzz(40);
      if (tries >= 2) { ctx.busy = true; gTimeout(() => reveal(true), 700); return; }
      ctx.say("Almost — the highlighted word is out of place. One more try!");
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
        if (bank[i].used) return;
        bank[i].used = true; line.push(i);
        playPop(); render();
        return;
      }
      const l = e.target.closest(".sb-tile[data-l]");
      if (l) takeBack(+l.dataset.l);
    });
    ctx.onKey = e => {
      if (e.key === "Enter") { e.preventDefault(); check(); }
      else if (e.key === "Backspace") { e.preventDefault(); takeBack(line.length - 1); }
    };
    ctx.setScore(0);
    round();
  },
});
