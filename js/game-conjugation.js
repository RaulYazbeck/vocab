// ── GAME: CONJUGATION SLOTS ───────────────────
// Two reels spin — a verb and a pronoun — and you type the form.
// Built from the conjugation decks, whose prompts read
// "sein — ich ___" (DE) or "être — je" (FR); prompts that don't parse
// (a few like "gefallen — ich ___ dir") keep their full text on one
// reel. Typed recall: a right form gives recall credit.
//
// Ranks: a clock per spin from 🥈 Silver; from 🥇 Gold, verbs you know
// show their MEANING on the reel ("to be") instead of the infinitive.

const CONJ_DECK_RE = /conj|praet|präter|imparfait|futur|passe|passé|perfekt/i;
const CONJ_RE = /^(.+?)\s+—\s+(.+?)(?:\s+___\s*(.*))?$/;
const _conjCache = new Map();
_gameCacheClearers.push(() => _conjCache.clear());
function conjItem(w) {
  const k = wordKey(w) + "|" + w.en + "|" + w[WORD_KEY];
  if (_conjCache.has(k)) return _conjCache.get(k);
  let res = null;
  if (CONJ_DECK_RE.test(w.deckId || "") && typeof w.en === "string") {
    const m = w.en.match(CONJ_RE);
    const ans = String(w[WORD_KEY] || "").trim();
    if (m && ans && ans.length <= 30) {
      const verb = m[1].trim(), pron = m[2].trim(), tail = (m[3] || "").trim();
      const meaning = String(w.hint || "").replace(/^[^—–]{1,14}\s+[—–]\s+(?=to\s)/i, "").split(/[,—–]/)[0].trim();
      res = { verb, pron, tail, ans, meaning: meaning && meaning.length <= 24 && !/sg\.|pl\./.test(meaning) ? meaning : "" };
    }
  }
  _conjCache.set(k, res);
  return res;
}
function conjWords(pool) { return dedupeWords(pool.filter(w => conjItem(w))); }

registerGame({
  id: "conj", name: "Conjugation Slots", icon: "🎰", skill: "Grammar · verb forms (typed)",
  ranks: [
    { clock: 0 }, { clock: 20000 }, { clock: 15000, meaning: true }, { clock: 12000, meaning: true }, { clock: 9000, meaning: true },
  ],
  twists: ["golden", "turbo", "sudden"],
  howTo: [
    "The reels spin a verb and a person — type the matching form.",
    "💡 shows the first letter (then it counts as help, not recall).",
    "A wrong form costs points (half for 🌱 new verbs). From 🥇 Gold the verb reel may show its meaning instead.",
    "Enter checks.",
  ],
  requirement(pool) {
    const n = conjWords(pool).length;
    return n >= 4 ? { ok: true } : { ok: false, reason: `Needs 4 verb forms from the conjugation decks — you have ${n}` };
  },
  stars: [90, 150, 200],
  start(ctx) {
    const rp = ctx.rp;
    const total = ctx.rounds(10, 5, 6);
    const limitAll = ctx.size === "bonus" ? 20000 * ctx.timeScale : 0;
    const eligible = conjWords(ctx.pool);
    const words = sampleWords(eligible, total);
    let r = 0, score = 0, combo = 0, maxCombo = 0, correct = 0, wrong = 0, cur = null, helped = false, spinT = 0;
    const perSpin = ctx.size === "full" && rp.clock ? rp.clock * ctx.timeScale : 0;
    const done = () => ctx.finish({ score, correct, wrong, maxCombo, typedCorrect: correct, cleared: ctx.size === "bonus" ? correct >= 4 : true });

    ctx.stage.innerHTML = `
      <div class="cj-machine" id="cj-machine">
        <div class="cj-reel" id="cj-verb"><span></span></div>
        <div class="cj-reel" id="cj-pron"><span></span></div>
      </div>
      <div class="cj-tail" id="cj-tail"></div>
      <div class="g-typed-wrap">
        <input type="text" class="german-input" id="cj-input" placeholder="the verb form…"
          autocomplete="off" autocorrect="off" autocapitalize="off" spellcheck="false" enterkeyhint="go"/>
        ${accentBarHtml("cj-input")}
        <div class="g-typed-actions">
          <button class="hint-btn" id="cj-hint">💡</button>
          <button class="dontknow-btn" id="cj-skip">? Don't know</button>
          <button class="g-big-btn" id="cj-go">Check</button>
        </div>
      </div>
      <div class="tr-fb" id="cj-fb"></div>`;
    const input = document.getElementById("cj-input");
    const verbEl = document.querySelector("#cj-verb span"), pronEl = document.querySelector("#cj-pron span");
    const fb = document.getElementById("cj-fb");
    const pool = eligible.map(conjItem);

    const spin = () => {
      if (r >= words.length) { done(); return; }
      cur = words[r++];
      const it = conjItem(cur);
      const f = ctx.fmt(cur);
      const useMeaning = !!rp.meaning && ctx.size === "full" && f.st >= 3 && !!it.meaning;
      helped = false;
      input.value = ""; input.className = "german-input";
      fb.innerHTML = "";
      ctx.setBar((r - 1) / words.length, "progress");
      if (!perSpin && !limitAll) ctx.setClock(`${r}/${words.length}`);
      document.getElementById("cj-tail").innerHTML = (it.tail ? `… ___ ${escapeHtml(it.tail)}` : "") + ctx.tag(cur);
      const machine = document.getElementById("cj-machine");
      machine.classList.add("spinning");
      ctx.busy = true;
      let n = 0;
      const tick = () => {
        if (ctx.finished) return;
        const a = pool[Math.floor(Math.random() * pool.length)], b = pool[Math.floor(Math.random() * pool.length)];
        verbEl.textContent = a.verb; pronEl.textContent = b.pron;
        if (++n < (REDUCED_MOTION ? 1 : 7)) gTimeout(tick, 60);
        else {
          verbEl.textContent = useMeaning ? `“${it.meaning}”` : it.verb;
          pronEl.textContent = it.pron;
          machine.classList.remove("spinning");
          if (gameSfxOn()) playNotes([{ freq: 660, at: 0, dur: 0.06 }, { freq: 880, at: 0.06, dur: 0.1 }], 0.12);
          ctx.busy = false;
          spinT = ctx.clock.elapsed();
          try { input.focus({ preventScroll: true }); } catch (e) {}
        }
      };
      tick();
    };
    const submit = skip => {
      if (!cur || ctx.busy || ctx.finished || ctx.paused) return;
      const it = conjItem(cur);
      const val = input.value;
      if (!skip && !val.trim()) { shakeEl(input); return; }
      const res = skip ? false : gradeTyped(val, [it.ans]);
      if (res === "near") {
        input.classList.add("near");
        fb.innerHTML = `<span class="g-near">≈ Almost — ${diffHtml(val, it.ans)}</span>`;
        gTimeout(() => { input.classList.remove("near"); input.select(); }, 700);
        return;
      }
      ctx.busy = true;
      if (res === true) {
        correct++; combo++; maxCombo = Math.max(maxCombo, combo);
        ctx.hit(cur, helped ? "recognition" : "recall");
        const pts = ctx.award(cur, (helped ? 8 : 15) + Math.min(combo - 1, 5) * 2);
        score += pts;
        input.classList.add("correct");
        fb.innerHTML = `<span class="bb-ok">✓ ${escapeHtml(it.pron)} <strong>${escapeHtml(it.ans)}</strong>${it.tail ? " " + escapeHtml(it.tail) : ""}</span>`;
        floatScore(input, "+" + pts, ctx.isGolden(cur) ? "gold" : "");
        if (combo >= 3) playCombo(combo); else playSuccess();
        haptic("select");
        speak(`${it.pron.split("/")[0]} ${it.ans}`);
        gTimeout(spin, 900);
      } else {
        wrong++;
        combo = ctx.comboAfterMiss(combo, cur);
        const pen = Math.round(6 * ctx.cost(cur));
        score = Math.max(0, score - pen);
        ctx.missed(cur);
        input.classList.add("wrong");
        fb.innerHTML = `<span class="bb-bad">${val.trim() ? `<s>${escapeHtml(val.trim())}</s> → ` : ""}${escapeHtml(it.pron)} <strong>${escapeHtml(it.ans)}</strong></span>`;
        playMiss(); haptic("miss");
        speak(`${it.pron.split("/")[0]} ${it.ans}`);
        gTimeout(ctx.sudden ? done : spin, 1600);
      }
      ctx.setScore(score); ctx.setCombo(combo);
    };
    ["cj-go", "cj-skip", "cj-hint"].forEach(id => gListen(document.getElementById(id), "pointerdown", e => e.preventDefault()));
    document.getElementById("cj-go").onclick = () => submit(false);
    document.getElementById("cj-skip").onclick = () => submit(true);
    document.getElementById("cj-hint").onclick = () => {
      if (!cur || ctx.busy || helped) return;
      helped = true;
      const it = conjItem(cur);
      if (!input.value) input.value = it.ans[0];
      floatScore(document.getElementById("cj-hint"), "help", "bad");
      try { input.focus({ preventScroll: true }); } catch (e) {}
    };
    gListen(input, "keydown", e => { if (e.key === "Enter") { e.preventDefault(); e.stopPropagation(); submit(false); } });

    if (perSpin || limitAll) gInterval(() => {
      if (ctx.finished || ctx.paused) return;
      if (limitAll) {
        const left = Math.max(0, limitAll - ctx.clock.elapsed());
        ctx.setClock(Math.ceil(left / 1000) + "s", left < 5000);
        ctx.setBar(left / limitAll, left < 5000 ? "urgent" : "");
        if (left <= 0) done();
        return;
      }
      if (ctx.busy) return;
      const left = Math.max(0, perSpin - (ctx.clock.elapsed() - spinT));
      ctx.setClock(Math.ceil(left / 1000) + "s", left < 4000);
      if (left <= 0) submit(true);
    }, 150);

    ctx.setScore(0);
    spin();
  },
});
