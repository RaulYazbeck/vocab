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
// Distractors: hard, but never a second right answer. "Haben wir noch
// ___?" takes Milch, Brot and Käse alike, so a same-topic noun is only
// offered when the grammar rules it out:
//   • GENDER: the article in front of the gap decides ("Öffnen Sie bitte
//     den ___" → only a masculine noun) — same-topic nouns of another
//     gender are wrong, however well they'd fit the meaning.
//   • NUMBER: the right noun in the plural after "einen", "das", "dem"…
//   • ARTICLE: no article in the sentence — die / der / das Milch.
//   • SAME WORD, WRONG FORM: schlafen for "Ich ___ acht Stunden".
//   • LOOK-ALIKES: words spelled like the answer (krank · kann) of a
//     kind that can't take the slot.
// Case nouns and verbs also have a step 2 (the article / the form).
const CZ_DET_FIXED = { der: "mf", die: "f", das: "n", den: "m", dem: "mn" };
const CZ_EIN_END = { "": "mn", e: "f", en: "m", em: "mn", er: "f" };
const CZ_DIES_END = { er: "mf", e: "f", es: "n", en: "m", em: "mn" };
// The article/determiner right in front of the gap (an adjective may sit
// between: "einen großen ___") → { det, genders: "mfn" subset } or null.
function clozeDeterminer(before) {
  const toks = String(before || "").match(/\p{L}+|[^\p{L}\s]+/gu) || [];
  if (!toks.length || !/\s$/.test(before)) return null;
  const read = t => {
    const x = t.toLowerCase();
    if (CZ_DET_FIXED[x]) return CZ_DET_FIXED[x];
    let m = x.match(/^(ein|kein|mein|dein|sein|ihr|unser|euer)(e|en|em|er)?$/) || x.match(/^(eur)(e|en|em|er)$/);
    if (m) return CZ_EIN_END[m[2] || ""];
    m = x.match(/^(dies|jed|welch|jen|manch)(e|en|em|er|es)$/);
    return m ? CZ_DIES_END[m[2]] : null;
  };
  let i = toks.length - 1;
  if (!/^\p{L}+$/u.test(toks[i])) return null;
  let g = read(toks[i]);
  if (!g && i > 0 && /^[a-zäöüß]+(e|en|er|es|em)$/.test(toks[i]) && /^\p{L}+$/u.test(toks[i - 1])) g = read(toks[--i]);
  return g ? { det: toks[i], genders: g } : null;
}
const CZ_GENDER = { der: "m", die: "f", das: "n" };
const CZ_GENDER_NAME = { m: "masculine", f: "feminine", n: "neuter" };
// The gap's own article, when it pins the noun's gender — or null.
function clozeDetFor(w, info) {
  const np = !IS_FRENCH_APP && posOf(w) === "noun" ? nounParts(w) : null;
  if (!np || normalize(info.answer || "") !== normalize(np.noun)) return null;
  const det = clozeDeterminer(info.before);
  return det && det.genders.includes(CZ_GENDER[np.answer]) ? det : null;
}
// Word kinds, by the slots they can stand in: adjectives and adverbs
// swap freely ("Ich möchte nur / kurz ein Glas"), so they are one kind;
// conjugation-deck forms ("schlafe") are verbs.
function clozeKind(x) {
  const p = posOf(x);
  if (p === "verb" || p === "participle") return "verb";
  if (p === "adj" || p === "adv") return "mod";
  if (p === "other") return /conj|praet|präter|perfekt|imparfait|futur|pass/i.test(x.deckId || "") ? "verb" : "func";
  return p;
}
// Which kinds may be a wrong option for which: never one that could take
// the slot too. Adverbs stand where time nouns do ("Freitag / pünktlich
// fahren wir"), nouns after "ich bin" (Arzt), function words next to
// greetings — so those pairs are out.
const CZ_OTHER_KINDS = { noun: ["verb", "func"], verb: ["noun", "mod", "func"], mod: ["verb", "func"], num: ["noun", "verb", "func"],
  func: ["noun", "verb"], phrase: ["noun", "verb"], other: ["noun", "verb"] };
const CZ_PAST_RE = /präteritum|praeteritum|past|partizip|perfekt|plusquam/i;
// useDet: the gap's article is visible (see clozeDetFor). useCase: the
// article is hidden too and asked in step 2.
function clozeDistractors(w, info, pool, n, formFn, hard, useDet, useCase) {
  const kind = clozeKind(w);
  const gapN = normalize(info.answer || "");
  // Never the gap's own word under another card ("erlaubt" for erlauben).
  const fillsGap = x => [formFn(x), gameForm(x), nounParts(x) ? nounParts(x).noun : ""].some(f => f && normalize(f) === gapN);
  const out = [], seen = new Set([normKey(formFn(w))]);
  const add = list => list.forEach(x => {
    const k = normKey(x.opt ? x.opt.text : formFn(x));
    if (out.length < n && !seen.has(k)) { seen.add(k); out.push(x); }
  });
  const pick = (k, filter, h = hard) => k > 0 ? pickDistractors(w, pool, k, formFn, x => !fillsGap(x) && filter(x), { hard: h }) : [];
  const np = nounParts(w), det = useDet ? clozeDetFor(w, info) : null;
  if (det) {
    // GENDER: same-topic nouns the article rules out. A noun whose plural
    // looks like its singular (der Lehrer, die Lehrer) could still fit
    // as a plural — never a trap.
    const clean = x => { const p = nounParts(x), pl = germanPluralNoun(x); return p && pl && pl !== p.noun; };
    const dLow = escapeHtml(det.det.toLowerCase());
    add(pick(2, x => clean(x) && !det.genders.includes(CZ_GENDER[nounParts(x).answer]), true).map(x => { const p = nounParts(x);
      return { opt: { text: p.noun, correct: false, word: x,
        why: `${escapeHtml(p.noun)} is ${CZ_GENDER_NAME[CZ_GENDER[p.answer]]} (${colorArticleHtml(p.full)}) — it can't follow <b>${dLow}</b>` } }; }));
    // NUMBER: the plural can't follow ein / einen / das / dem…
    const pl = germanPluralNoun(w), d = det.det.toLowerCase();
    const plBlocked = /^(das|dem|ein|eine|einen|einem|einer)$/.test(d) || /em$/.test(d) || /^(kein|mein|dein|sein|ihr|unser|euer)$/.test(d)
      || ((d === "den" || /en$/.test(d)) && pl && !/[ns]$/.test(pl));
    if (pl && pl !== np.noun && plBlocked && Math.random() < 0.6)
      add([{ opt: { text: pl, correct: false, why: `${escapeHtml(pl)} is the plural — <b>${dLow}</b> needs one ${escapeHtml(np.noun)}` } }]);
  } else if (np && !useCase && normalize(info.answer || "") === normalize(np.noun)) {
    // ARTICLE: no article in front of the gap ("Haben wir noch ___?"),
    // so the options carry theirs — the same noun with a wrong one is a
    // trap (only one of die / der / das Milch is German). Another noun
    // is never offered: Milch, Fisch and Brot would all fit.
    // Only articles no case can give this noun: "mit der Karte" is
    // right (Dativ), so never der for a feminine noun; die / der for
    // m / n only when the plural looks different (die Zimmer is plural).
    const pl = germanPluralNoun(w), plDiffers = !!pl && pl !== np.noun;
    const ok = { m: { die: plDiffers, das: true }, f: { das: true }, n: { die: plDiffers, der: plDiffers } }[CZ_GENDER[np.answer]] || {};
    const wrong = IS_FRENCH_APP ? [articleTrap(w)].filter(Boolean) : shuffle(Object.keys(ok).filter(a => ok[a])).map(a => `${a} ${np.noun}`);
    add(wrong.map(text => ({ opt: { text, correct: false, trap: true } })));
  } else if (kind === "verb" && !IS_FRENCH_APP && /\p{L}/u.test(info.before || "")
      && !/(^|[^\p{L}])(sie|Sie)([^\p{L}]|$)/u.test(info.example[WORD_KEY] || "")) {
    // SAME WORD, WRONG FORM: another present-tense form or the
    // infinitive (schlafen for "Ich ___ acht Stunden") — the sentence's
    // person rules it out. Never past forms (they could fit too), never
    // with sie / Sie (she plays / they play) or a verb-first sentence
    // (Komm / Kommt bitte!), where two forms can be right.
    const g = gapN.split(" ")[0];
    add(pick(2, x => {
      if (clozeKind(x) !== kind || CZ_PAST_RE.test((x.hint || "") + " " + (x.deckId || ""))) return false;
      const f = normalize(formFn(x)), pre = commonPrefixLen(f, g);
      return pre >= 4 && pre >= 0.6 * Math.min(f.length, g.length);
    }, true));
  }
  // LOOK-ALIKES of a kind that can't take the slot (hard mode scores
  // spelling similarity).
  const others = CZ_OTHER_KINDS[kind] || CZ_OTHER_KINDS.other;
  add(pick(n - out.length, x => others.includes(clozeKind(x))));
  if (out.length < n) add(pick(n, x => others.includes(clozeKind(x)), false));
  return out;
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
  howTo: () => ["Pick the word that fits the sentence."],
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
      let step = clozeFormStep(w, info);
      // Variety for case nouns: half the time the article stays in the
      // sentence and the traps are nouns of the wrong gender instead.
      if (step && step.kind === "case" && !f.rookie && clozeDetFor(w, info) && Math.random() < 0.5) step = null;
      const typed = !!rp.typed && f.typed && ctx.size === "full" && !!info.answer;
      const n = Math.min(f.options, 5);
      // Case words: step 1 asks only for the noun ("– Mund"); the article
      // the sentence needs is step 2. Showing "der Mund" first would give
      // the dictionary article — which is usually not the one in the gap.
      const caseStep = !!step && step.kind === "case";
      const bare = x => { const np = nounParts(x); return np ? np.noun : gameForm(x); };
      // The gap's article is in the sentence: nouns show without theirs
      // (it would give the gender away).
      const detMode = !caseStep && !!clozeDetFor(w, info);
      const formFn = caseStep || detMode ? bare : gameForm;
      const opts = typed ? [] : mcChoices(w, {
        text: caseStep ? x => (nounParts(x) ? "– " : "") + bare(x) : formFn, formFn, n, pool: ctx.pool, target: !caseStep, hard: !f.rookie, noTrap: true,
        pick: k => clozeDistractors(w, info, ctx.pool, k, formFn, !f.rookie, detMode, caseStep),
        none: !f.rookie && ctx.size === "full" && ctx.rank >= 1 });
      // The translation hides the word's own meaning (else it's the answer).
      const transHtml = redactTranslation(info.example.en, gamePrompt(w));
      // Case words hide the article too, so it can't give the word away.
      const gapHtml = step && step.kind === "case" ? step.ci.gapBoth : info.html;
      const typedAnswer = step && step.kind === "case" ? `${step.ci.det} ${step.ci.noun}` : info.answer;
      q = { w, info, opts, typed, step, stage: 1, typedAnswer, f };
      peeked = false;
      ctx.teach("");
      ctx.setBar((r - 1) / words.length, "progress");
      ctx.setRound(r, words.length);
      const peekOk = rp.peek !== false || ctx.size !== "full";
      ctx.stage.innerHTML = `
        <div class="cz-card g-enter">
          <div class="g-q-label">${typed ? "Type the missing word" + (caseStep ? "s — with the right article" : "") : caseStep ? "Which word fits? <small class=\"cz-next\">article next</small>" : "Which word fits?"}${ctx.tag(w)}</div>
          <div class="cz-sentence" id="cz-sentence">${gapHtml}</div>
          ${typed ? `<div class="cz-trans">(${escapeHtml(gamePrompt(w))})</div>` : ""}
          ${peekOk && transHtml ? `<button class="g-link-btn cz-peek" id="cz-peek">Show translation</button>` : ""}
          <div class="cz-trans" id="cz-trans" style="display:none">${transHtml || ""}</div>
          ${step && !typed ? `<div class="cz-steps"><span class="on">1 · word</span><span>2 · ${caseStep ? "article" : "form"}</span></div>` : ""}
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
      if (tr) { tr.textContent = q.info.example.en || ""; tr.style.display = ""; }
      if (pk) pk.style.display = "none";
      speak(q.info.example[WORD_KEY]);
    };
    // count: false when the question isn't settled yet (a two-step item
    // counts as right only once its second step is right too).
    const award = (btn, base, count = true) => {
      const pts = ctx.award(q.w, base, count);
      score += pts;
      floatScore(btn, "+" + pts, ctx.isGolden(q.w) ? "gold" : "");
      return pts;
    };
    const good = (btn, base, count = true) => {
      if (count) correct++;
      combo++; maxCombo = Math.max(maxCombo, combo);
      if (!peeked) noPeek++;
      award(btn, base + (peeked ? 0 : 5), count);
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
        correct++;
        award(btn, 8);
        playSuccess(); haptic("select");
        ctx.teach(`✓ ${st.reason}`, "ok");
        gTimeout(next, 2200);
      } else {
        // The word was right, the form wasn't: a mistake on this question
        // (grammar only — the word's stage is untouched).
        wrong++; q.failed = true;
        combo = ctx.comboAfterMiss(combo, q.w);
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
        ctx.hit(q.w); good(btn, 10, !q.step);
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
          award(input, 5, false);
          wrong++;
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
