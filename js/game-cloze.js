// ── GAME: GAP FILL ────────────────────────────
// An example sentence with the word blanked out. Two steps:
//   1. WHICH WORD fits? (dictionary forms, as before)
//   2. WHICH FORM does the sentence need? (German) — the article's case
//      for nouns (der Mund → "Öffnen Sie bitte den Mund"), the
//      conjugated form for verbs, the ending for adjectives — with the
//      reason shown (grammar-de.js). Step 2 is grammar practice: it
//      never touches the word's stage, it feeds the case / verb stats.
// The blank comes from buildHintInfo() (hint.js), which only succeeds
// when the word can be located and hidden safely — words where it
// can't are simply not used.

const _clozeCache = new Map();
_gameCacheClearers.push(() => _clozeCache.clear());
function clozeInfo(word) {
  const k = wordKey(word) + "|" + word[WORD_KEY] + "|" + ((word.examples && word.examples[0] && word.examples[0][WORD_KEY]) || "");
  if (!_clozeCache.has(k)) _clozeCache.set(k, buildHintInfo(word, true));
  return _clozeCache.get(k);
}
function clozeWords(pool) { return dedupeWords(pool.filter(w => clozeInfo(w))); }
// The second step for a word, or null: { kind: "case"|"verb"|"adj", … }.
function clozeFormStep(w, info) {
  if (typeof GR_DE === "undefined" || !GR_DE || !info) return null;
  const ci = caseItem(w);
  if (ci && ci.ex === info.example) return { kind: "case", ci, answer: ci.det, options: ci.options, reason: ci.reason.html, c: ci.reason.c || ci.cases[0] };
  const fs = formStepItem(w, info.answer);
  if (!fs) return null;
  if (fs.kind === "adj") fs.reason += `<div class="g-teach-rule">${adjRuleFromContext(info.example[WORD_KEY], info.answer)}</div>`;
  return fs;
}
// Grammar stats (never word stages): S.games.cases[kind] = [right, total].
function recordGrammar(kind, ok) {
  if (!kind || !S.games) return;
  const c = S.games.cases || (S.games.cases = {});
  const r = c[kind] || (c[kind] = [0, 0]);
  if (ok) r[0]++;
  r[1]++;
}
const GRAMMAR_LABEL = { nom: "Nominativ", akk: "Akkusativ", dat: "Dativ", gen: "Genitiv", verb: "verb forms", adj: "adjective endings" };
function grammarSummary(tally) {
  const parts = Object.entries(tally).filter(([, r]) => r[1]).map(([k, r]) => `${GRAMMAR_LABEL[k] || k} ${r[0]}/${r[1]}`);
  if (!parts.length) return "";
  const weak = Object.entries(tally).filter(([, r]) => r[1] >= 2 && r[0] / r[1] < 0.6).map(([k]) => GRAMMAR_LABEL[k] || k);
  return `🧭 ${parts.join(" · ")}${weak.length ? ` — work on: ${weak.join(", ")}` : ""}`;
}

registerGame({
  id: "cloze", name: "Gap Fill", icon: "🕳️", skill: "Words in context", credit: "recognition",
  ranks: [
    { peek: true }, { peek: true }, { peek: false }, { peek: false, typed: true }, { peek: false, typed: true, options: 5 },
  ],
  twists: ["golden", "sudden"],
  howTo: () => [
    "A sentence is missing a word. Pick the one that fits.",
    IS_FRENCH_APP ? "The sentence may use a different form — pick the dictionary form."
      : "Then a second step: which <strong>form</strong> does the sentence need? The article in the right case (der → <em>den</em> Mund), the verb form (gehen → <em>geht</em>), the adjective ending. Every answer shows why.",
    "Need help? Show the translation (costs the bonus; gone from 🥇 Gold). From 💠 Platinum, type the missing words yourself.",
    "A wrong answer costs points (half for 🌱 new words). Keys 1–5 work too.",
  ],
  requirement(pool) {
    const n = clozeWords(pool).length;
    return n >= 4 ? { ok: true } : { ok: false, reason: `Needs 4 words with example sentences — you have ${n}` };
  },
  stars: [70, 110, 140],
  start(ctx) {
    const rp = ctx.rp;
    const total = ctx.rounds(10, 5, 5);
    const words = sampleWords(clozeWords(ctx.pool), total);
    let r = 0, score = 0, combo = 0, maxCombo = 0, correct = 0, wrong = 0, noPeek = 0, typedOk = 0, q = null, peeked = false;
    const tally = {};
    const tallyAdd = (k, ok) => { if (!k) return; const t = tally[k] || (tally[k] = [0, 0]); if (ok) t[0]++; t[1]++; recordGrammar(k, ok); };
    const done = () => ctx.finish({ score, correct, wrong, maxCombo, typedCorrect: typedOk, stats: { noPeek }, note: grammarSummary(tally) });

    const round = () => {
      if (r >= words.length) { done(); return; }
      const w = words[r++];
      const info = clozeInfo(w);
      const f = ctx.fmt(w);
      const step = clozeFormStep(w, info);
      const typed = !!rp.typed && f.typed && ctx.size === "full" && !!info.answer;
      const n = Math.min(f.options, 5);
      const opts = typed ? [] : mcChoices(w, { text: gameForm, n, pool: ctx.pool, target: true, hard: !f.rookie,
        none: !f.rookie && ctx.size === "full" && ctx.rank >= 1 });
      // Case words hide the article too, so it can't give the word away.
      const gapHtml = step && step.kind === "case" ? step.ci.gapBoth : info.html;
      const typedAnswer = step && step.kind === "case" ? `${step.ci.det} ${step.ci.noun}` : info.answer;
      q = { w, info, opts, typed, step, stage: 1, typedAnswer, f };
      peeked = false;
      ctx.teach("");
      ctx.setBar((r - 1) / words.length, "progress");
      ctx.setClock(`${r}/${words.length}`);
      const peekOk = rp.peek !== false || ctx.size !== "full";
      ctx.stage.innerHTML = `
        <div class="cz-card g-enter">
          <div class="g-q-label">${typed ? "Type the missing word" + (step && step.kind === "case" ? "s — with the right article" : "") : "Which word fits?"}${ctx.tag(w)}</div>
          <div class="cz-sentence" id="cz-sentence">${gapHtml}</div>
          ${typed ? `<div class="cz-trans">(${escapeHtml(gamePrompt(w))})</div>` : ""}
          ${peekOk ? `<button class="g-link-btn cz-peek" id="cz-peek">Show translation</button>` : ""}
          <div class="cz-trans" id="cz-trans" style="display:none">${escapeHtml(info.example.en || "")}</div>
          ${step && !typed ? `<div class="cz-steps"><span class="on">1 · word</span><span>2 · form</span></div>` : ""}
        </div>
        <div id="cz-opts">${typed ? gTypedHtml(step && step.kind === "case" ? "article + word, as in the sentence…" : "the word as it appears…") : mcOptionsHtml(opts)}</div>`;
      const pk = document.getElementById("cz-peek");
      if (pk) pk.onclick = () => {
        peeked = true;
        document.getElementById("cz-trans").style.display = "";
        pk.style.display = "none";
      };
      if (typed) gTypedBind(ctx, v => answerTyped(v));
      ctx.busy = false;
    };
    const reveal = ok => {
      const sEl = document.getElementById("cz-sentence");
      const html = q.step && q.step.kind === "case" ? q.step.ci.reveal : q.info.reveal;
      if (sEl) { sEl.innerHTML = html; sEl.classList.remove("ok", "bad"); sEl.classList.add(ok ? "ok" : "bad"); }
      const tr = document.getElementById("cz-trans"), pk = document.getElementById("cz-peek");
      if (tr) tr.style.display = ""; if (pk) pk.style.display = "none";
      speak(q.info.example[WORD_KEY]);
    };
    const award = (btn, base) => {
      const pts = ctx.award(q.w, base);
      score += pts;
      floatScore(btn, "+" + pts, ctx.isGolden(q.w) ? "gold" : "");
      return pts;
    };
    const good = (btn, base) => {
      correct++; combo++; maxCombo = Math.max(maxCombo, combo);
      if (!peeked) noPeek++;
      award(btn, base + (peeked ? 0 : 5));
      playPop(); haptic("select");
      ctx.say("Correct!");
    };
    const bad = btn => {
      wrong++;
      combo = ctx.comboAfterMiss(combo, q.w);
      const pen = Math.round(5 * ctx.cost(q.w));
      score = Math.max(0, score - pen);
      if (btn) { shakeEl(btn); floatScore(btn, "−" + pen, "bad"); }
      playMiss(); haptic("miss");
      ctx.missed(q.w);
      ctx.say(`It was ${gameForm(q.w)}`);
    };
    const next = () => (ctx.sudden && q.failed ? done() : round());

    // Step 2: the form the sentence needs.
    const showStep2 = () => {
      const st = q.step;
      q.stage = 2;
      const n = q.f.rookie ? 3 : Math.min(5, st.options.length);
      let pool = st.options.filter(o => o !== st.answer);
      // Always offer the dictionary form (der for den) — the classic slip.
      if (st.kind === "case") {
        const dict = st.ci.dict.split(" ")[0];
        pool = [...pool.filter(o => o === dict), ...shuffle(pool.filter(o => o !== dict))];
      }
      q.opts2 = shuffle([{ text: st.answer, correct: true }, ...pool.slice(0, n - 1).map(t => ({ text: t, correct: false }))]);
      const sEl = document.getElementById("cz-sentence");
      if (sEl) {
        sEl.classList.remove("ok", "bad");
        sEl.innerHTML = st.kind === "case" ? st.ci.html : q.info.html;
      }
      const lbl = ctx.stage.querySelector(".g-q-label");
      if (lbl) lbl.innerHTML = st.kind === "case" ? `Which article? <span class="cz-lemma">${colorArticleHtml(gameForm(q.w))}</span>`
        : st.kind === "verb" ? `Which form of <span class="cz-lemma">${escapeHtml(gameForm(q.w))}</span>?`
        : `Which ending? <span class="cz-lemma">${escapeHtml(gameForm(q.w))}</span>`;
      const steps = ctx.stage.querySelector(".cz-steps");
      if (steps) steps.innerHTML = `<span class="done">1 · word ✓</span><span class="on">2 · form</span>`;
      document.getElementById("cz-opts").innerHTML = mcOptionsHtml(q.opts2, "mono");
      ctx.busy = false;
    };
    const answer2 = i => {
      const opt = q.opts2[i];
      if (!opt) return;
      ctx.busy = true;
      const btn = ctx.stage.querySelector(`.g-opt[data-i="${i}"]`);
      mcReveal(ctx.stage, q.opts2, i);
      const st = q.step;
      reveal(opt.correct);
      tallyAdd(st.kind === "case" ? st.c : st.kind, opt.correct);
      if (opt.correct) {
        award(btn, 8);
        playSuccess(); haptic("select");
        ctx.teach(`✓ ${st.reason}`, "ok");
        gTimeout(next, 2200);
      } else {
        if (btn) shakeEl(btn);
        playMiss(); haptic("miss");
        ctx.teach(`✗ Not <s>${escapeHtml(opt.text)}</s> — it's ${st.reason}`, "bad");
        ctx.waitContinue(next);
      }
      ctx.setScore(score); ctx.setCombo(combo);
    };
    const answer = i => {
      if (!q || q.typed || ctx.busy || ctx.finished || ctx.waiting) return;
      if (q.stage === 2) { answer2(i); return; }
      const opt = q.opts[i];
      if (!opt) return;
      ctx.busy = true;
      const btn = ctx.stage.querySelector(`.g-opt[data-i="${i}"]`);
      mcReveal(ctx.stage, q.opts, i);
      if (opt.correct) {
        ctx.hit(q.w); good(btn, 10);
        ctx.setScore(score); ctx.setCombo(combo);
        if (q.step) { gTimeout(showStep2, 650); return; }
        reveal(true);
        gTimeout(next, 1500);
        return;
      }
      reveal(false);
      q.failed = true;
      noteWrongPick(q.w, opt);
      bad(btn);
      ctx.teach(wordLessonHtml(q.w, opt, q.step && q.step.kind === "case" ? `<div class="g-teach-rule">${q.step.reason}</div>` : ""), "bad");
      ctx.waitContinue(next);
      ctx.setScore(score); ctx.setCombo(combo);
    };
    const answerTyped = v => {
      if (!q || !q.typed || ctx.busy || ctx.finished) return;
      ctx.busy = true;
      const input = document.getElementById("g-typed");
      const res = gradeTyped(v, [q.typedAnswer]);
      const st = q.step;
      reveal(res === true);
      if (res === true) {
        typedOk++; ctx.hit(q.w, "recall"); if (input) input.classList.add("correct");
        good(input, st && st.kind === "case" ? 20 : 15);
        if (st && st.kind === "case") { tallyAdd(st.c, true); ctx.teach(`✓ ${st.reason}`, "ok"); gTimeout(next, 2200); }
        else gTimeout(next, 1500);
      } else if (res === "near") {
        if (input) input.classList.add("near");
        ctx.say("Almost — check the spelling");
        ctx.teach(`≈ Almost — ${diffHtml(v, q.typedAnswer)}`, "near");
        ctx.waitContinue(next);
      } else {
        // The right word with the wrong article / form: the word counts
        // (recall), the grammar doesn't — and you see why.
        const lastTok = String(v).trim().split(/\s+/).pop();
        const wordRight = st && st.kind === "case"
          ? normalize(lastTok) === normalize(st.ci.noun) || gradeTyped(v, [gameForm(q.w), q.w[WORD_KEY]]) === true
          : gradeTyped(v, [gameForm(q.w), q.w[WORD_KEY]]) === true;
        if (wordRight) {
          typedOk++; ctx.hit(q.w, "recall");
          if (input) input.classList.add("near");
          award(input, 5);
          if (st && st.kind === "case") tallyAdd(st.c, false);
          ctx.say(`Right word — here it's ${q.typedAnswer}`);
          ctx.teach(`Right word — but this sentence needs <strong>${escapeHtml(q.typedAnswer)}</strong>.${st ? `<div class="g-teach-rule">${st.reason}</div>` : ""}`, "near");
          ctx.waitContinue(next);
        } else {
          if (input) input.classList.add("wrong");
          q.failed = true;
          bad(input);
          ctx.teach(wordLessonHtml(q.w, null, `<div class="g-teach-sub">Here: <strong>${escapeHtml(q.typedAnswer)}</strong></div>${st ? `<div class="g-teach-rule">${st.reason}</div>` : ""}`), "bad");
          ctx.waitContinue(next);
        }
      }
      ctx.setScore(score); ctx.setCombo(combo);
    };

    gListen(ctx.stage, "click", e => { const b = e.target.closest(".g-opt"); if (b) answer(+b.dataset.i); });
    ctx.onKey = e => {
      const list = q && (q.stage === 2 ? q.opts2 : q.opts);
      const i = digitKey(e, list && list.length ? list.length : 4);
      if (i >= 0) { e.preventDefault(); answer(i); }
    };
    ctx.setScore(0);
    round();
  },
});
