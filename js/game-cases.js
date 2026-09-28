// ── GAME: DER · DEN · DEM  (German only) ──────
// Case practice from your own example sentences: the article (or
// kein / mein / dieser… / im, zum…) in front of a noun is blanked; pick
// the form the sentence needs. The noun stays visible with its meaning.
// Every answer explains itself: gender + case, and the preposition,
// verb or subject that decides it (grammar-de.js). Your weakest case
// comes up more often.
//
// Grammar, not the word's meaning: no stage moves (credit: null). The
// case stats live in S.games.cases.
//
// Ranks: more options; from 🥇 Gold the noun is shown WITHOUT its
// article (you need the gender too); 💠 Platinum+ you type the article.

function casesAccuracy(c) {
  const r = (S.games.cases || {})[c];
  return r && r[1] >= 3 ? r[0] / r[1] : 0.5;
}

if (!IS_FRENCH_APP) registerGame({
  id: "cases", name: "Der · Den · Dem", icon: "🧭", skill: "Grammar · articles & cases", credit: null,
  ranks: [
    { options: 4 }, { options: 5 }, { options: 6, bare: true }, { options: 6, typed: true }, { options: 6, typed: true, bare: true },
  ],
  twists: ["golden", "sudden"],
  howTo: () => ["Pick the article the sentence needs — each answer shows why."],
  requirement(pool) {
    const n = caseWords(pool).length;
    return n >= 4 ? { ok: true } : { ok: false, reason: `Needs 4 nouns whose example sentence has an article — you have ${n}` };
  },
  stars: [90, 140, 180],
  start(ctx) {
    const rp = ctx.rp;
    const total = ctx.rounds(12, 6, 6);
    const eligible = caseWords(ctx.pool);
    // Weaker cases weigh more (a case you get 40% right comes up ~2× as
    // often as one at 90%); weak words too.
    const weight = w => { const ci = caseItem(w); const c = ci.reason.c || ci.cases[0]; return (1.2 - casesAccuracy(c)) * wordWeakness(w); };
    let words = weightedPickDistinct(eligible, Math.min(total, eligible.length), weight);
    while (words.length < total) words.push(...sampleWords(eligible, total - words.length));
    let r = 0, score = 0, combo = 0, maxCombo = 0, correct = 0, wrong = 0, typedOk = 0, q = null;
    const tally = {};
    const done = () => ctx.finish({ score, correct, wrong, maxCombo, typedCorrect: typedOk, note: grammarSummary(tally) });

    const round = () => {
      if (r >= words.length) { done(); return; }
      const w = words[r++];
      const ci = caseItem(w);
      const f = ctx.fmt(w);
      const typed = !!rp.typed && ctx.size === "full" && !f.rookie;
      const bare = !!rp.bare && ctx.size === "full" && !f.rookie;
      const n = f.rookie ? 3 : Math.min(rp.options || 4, ci.options.length);
      const dict = ci.dict.split(" ")[0];
      let others = ci.options.filter(o => o !== ci.answer);
      others = [...others.filter(o => o === dict), ...shuffle(others.filter(o => o !== dict))];
      const opts = typed ? [] : shuffle([{ text: ci.answer, correct: true }, ...others.slice(0, n - 1).map(t => ({ text: t, correct: false }))]);
      q = { w, ci, opts, typed };
      ctx.teach("");
      ctx.setBar((r - 1) / words.length, "progress");
      ctx.setRound(r, words.length);
      const np = nounParts(w);
      const nounLine = bare ? `<strong>${escapeHtml(np.noun)}</strong>` : colorArticleHtml(np.full);
      ctx.stage.innerHTML = `
        <div class="cz-card g-enter">
          <div class="g-q-label">${typed ? "Type the missing article" : "Which form fits?"}${ctx.tag(w)}</div>
          <div class="cz-sentence" id="cs-sentence">${ci.html}</div>
          <div class="cs-noun">${nounLine} <span>= ${escapeHtml(gamePrompt(w))}</span></div>
          <div class="cz-trans">${escapeHtml(ci.ex.en || "")}</div>
        </div>
        ${typed ? gTypedHtml("der, den, dem, im…") : mcOptionsHtml(opts, "mono")}`;
      if (typed) gTypedBind(ctx, v => answerTyped(v));
      ctx.busy = false;
    };
    const settle = (ok, btn, picked) => {
      const c = q.ci.reason.c || q.ci.cases[0];
      const t = tally[c] || (tally[c] = [0, 0]); if (ok) t[0]++; t[1]++;
      recordGrammar(c, ok);
      const sEl = document.getElementById("cs-sentence");
      if (sEl) { sEl.innerHTML = q.ci.reveal; sEl.classList.add(ok ? "ok" : "bad"); }
      speak(q.ci.ex.de);
      const np = nounParts(q.w);
      const gender = `<div class="g-teach-sub">${colorArticleHtml(np.full)} = ${escapeHtml(gamePrompt(q.w))}${np.answer === "der" || np.answer === "die" || np.answer === "das" ? " " + genderRuleHtml(np.noun, np.answer) : ""}</div>`;
      if (ok) {
        correct++; combo++; maxCombo = Math.max(maxCombo, combo);
        const pts = ctx.award(q.w, (q.typed ? 15 : 10) + Math.min(combo - 1, 5) * 2);
        score += pts;
        floatScore(btn, "+" + pts, ctx.isGolden(q.w) ? "gold" : "");
        if (combo >= 3) playCombo(combo); else playPop();
        haptic("select");
        ctx.say("Correct!");
        ctx.teach(`✓ ${q.ci.reason.html}`, "ok");
        gTimeout(round, 2200);
      } else {
        wrong++;
        combo = ctx.comboAfterMiss(combo, q.w);
        const pen = Math.round(5 * ctx.cost(q.w));
        score = Math.max(0, score - pen);
        if (btn) { shakeEl(btn); floatScore(btn, "−" + pen, "bad"); }
        playMiss(); haptic("miss");
        ctx.say(`It's ${q.ci.answer}`);
        ctx.teach(`${picked ? `✗ Not <s>${escapeHtml(picked)}</s> — ` : ""}${q.ci.reason.html}${gender}`, "bad");
        ctx.waitContinue(ctx.sudden ? done : round);
      }
      ctx.setScore(score); ctx.setCombo(combo);
    };
    const answer = i => {
      if (!q || q.typed || ctx.busy || ctx.finished || ctx.waiting) return;
      const opt = q.opts[i];
      if (!opt) return;
      ctx.busy = true;
      mcReveal(ctx.stage, q.opts, i);
      settle(opt.correct, ctx.stage.querySelector(`.g-opt[data-i="${i}"]`), opt.correct ? "" : opt.text);
    };
    const answerTyped = v => {
      if (!q || !q.typed || ctx.busy || ctx.finished) return;
      ctx.busy = true;
      const input = document.getElementById("g-typed");
      const ok = normalize(v) === normalize(q.ci.answer);
      if (ok) typedOk++;
      if (input) input.classList.add(ok ? "correct" : "wrong");
      settle(ok, input, ok ? "" : v.trim());
    };
    gListen(ctx.stage, "click", e => { const b = e.target.closest(".g-opt"); if (b) answer(+b.dataset.i); });
    ctx.onKey = e => { const i = digitKey(e, q && q.opts.length ? q.opts.length : 4); if (i >= 0) { e.preventDefault(); answer(i); } };
    ctx.setScore(0);
    round();
  },
});
