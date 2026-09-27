// ── GAME: PLURAL HUNT (German only) ───────────
// See a singular noun, pick its plural. The real plural comes from the
// `pl` field (A1–B1) or the JM-style annotation ("die Katze, -n");
// distractors are generated from genuine German plural patterns so
// they all look plausible.

function umlautize(noun) {
  const map = { a: "ä", o: "ö", u: "ü", A: "Ä", O: "Ö", U: "Ü" };
  // Last a/o/u/au of the word, not part of a vowel pair (Pool, Tour).
  const m = noun.match(/^(|.*?[^aeiouäöüAEIOUÄÖÜ])(au|Au|a|o|u|A|O|U)([^aeiouäöüAEIOUÄÖÜ]*e?[^aeiouäöüAEIOUÄÖÜ]*)$/);
  if (!m) return noun;
  const v = m[2].length === 2 ? map[m[2][0]] + "u" : map[m[2]];
  return m[1] + v + m[3];
}
// Plausible wrong plurals, chosen by how the noun ends — the patterns a
// learner actually has to choose between, never nonsense like "Gruppee"
// or "Filmn".
function pluralDistractors(noun, real) {
  const low = noun.toLowerCase();
  // Suffixes that never take an umlaut (Zeitung, Freiheit, Station…)
  const U = /(ung|heit|keit|schaft|ion|tät)$/.test(low) ? noun : umlautize(noun), hasU = U !== noun;
  let cands;
  if (/e$/.test(low)) {                              // Katze, Gruppe, Name
    cands = [noun + "n", noun + "s", noun, hasU && U + "n", hasU && U];
  } else if (/[^aeiouäöü](el|er|en)$|(chen|lein)$/.test(low)) { // Lehrer, Apfel, Garten, Mädchen (not Meer)
    cands = [noun, noun + "n", noun + "s", hasU && U, hasU && U + "n", noun + "e"];
  } else if (/y$/.test(low)) {                        // Baby, Handy, Party
    cands = [noun.slice(0, -1) + "ies", noun, noun + "en", noun.slice(0, -1) + "ien"];
  } else if (/[^aeiouäöü][aiou]$/.test(low)) {        // Auto, Kino, Thema, Oma, Taxi (not Ei, Bäckerei)
    cands = [noun + "s", noun.slice(0, -1) + "en", noun + "n", noun];
  } else {                                            // Film, Stuhl, Zeitung, Lehrerin
    cands = [noun + "e", noun + "en", noun + "er", noun + "s", hasU && U + "e", hasU && U + "er", noun];
  }
  const seen = new Set([real.toLowerCase()]);
  return shuffle(cands.filter(c => {
    if (!c || !/^[\p{L}-]+$/u.test(c) || seen.has(c.toLowerCase())) return false;
    seen.add(c.toLowerCase()); return true;
  }));
}
const _pluralCache = new Map();
_gameCacheClearers.push(() => _pluralCache.clear());
function pluralItem(word) {
  const k = word[WORD_KEY] + "|" + (word.hint || "") + "|" + (word.pl || "");
  if (!_pluralCache.has(k)) _pluralCache.set(k, _pluralItem(word));
  return _pluralCache.get(k);
}
function _pluralItem(word) {
  const np = nounParts(word);
  if (!np) return null;
  const pl = germanPluralNoun(word);
  if (!pl || !/^[\p{L}-]+$/u.test(pl)) return null;
  const others = pluralDistractors(np.noun, pl);
  if (others.length < 3) return null;
  return { np, pl, others };
}
function pluralWords(pool) { return dedupeWords(pool.filter(w => pluralItem(w))); }

if (!IS_FRENCH_APP) registerGame({
  id: "plural", name: "Plural Hunt", icon: "🔢", skill: "Grammar · plurals", credit: null,
  ranks: [
    { options: 4 }, { options: 4 }, { options: 5 }, { options: 6, typed: true }, { options: 6, typed: true },
  ],
  twists: ["golden", "sudden"],
  howTo: [
    "You see a noun in the singular. Pick its plural.",
    "The wrong answers follow real German patterns (-e, -en, -er, -s, umlauts…) — trust your ear!",
    "From 💠 Platinum you type the plural of nouns you know. A miss costs points (half for 🌱 new words).",
    "Right on three different days → the plural joins your collection. Keys 1–6 work too.",
  ],
  requirement(pool) {
    const n = pluralWords(pool).length;
    return n >= 4 ? { ok: true } : { ok: false, reason: `Needs 4 nouns with plurals — you have ${n}` };
  },
  stars: [70, 120, 160],
  start(ctx) {
    const total = ctx.rounds(10, 5, 5);
    const eligible = pluralWords(ctx.pool);
    const words = sampleWords(eligible, total);
    let r = 0, score = 0, combo = 0, maxCombo = 0, correct = 0, wrong = 0, typedOk = 0, collected = 0, q = null;
    const done = () => ctx.finish({ score, correct, wrong, maxCombo, typedCorrect: typedOk,
      note: collected ? `🔢 ${collected} plural${collected > 1 ? "s" : ""} added to your collection` : "" });

    const round = () => {
      if (r >= words.length) { done(); return; }
      ctx.teach("");
      const w = words[r++];
      const item = pluralItem(w);
      const f = ctx.fmt(w);
      const typed = !!ctx.rp.typed && f.typed && ctx.size === "full";
      const n = Math.min(f.options, item.others.length + 1);
      const opts = typed ? [] : shuffle([{ text: "die " + item.pl, correct: true },
        ...shuffle(item.others.slice()).slice(0, n - 1).map(o => ({ text: "die " + o, correct: false }))]);
      q = { w, item, opts, typed };
      ctx.setBar((r - 1) / words.length, "progress");
      ctx.setClock(`${r}/${words.length}`);
      ctx.stage.innerHTML = `
        <div class="g-question g-enter">
          <div class="g-q-label">One → many${ctx.tag(w)}</div>
          <div class="g-q-word target"><span class="${genderClass(item.np.answer)}-text">${escapeHtml(item.np.full)}</span></div>
          <div class="g-q-sub">${escapeHtml(gamePrompt(w))}</div>
          <div class="pl-arrow">↓ plural</div>
        </div>
        ${typed ? gTypedHtml("die …") : mcOptionsHtml(opts, "mono")}`;
      if (typed) gTypedBind(ctx, v => answerTyped(v));
      ctx.busy = false;
    };
    const good = (btn) => {
      correct++; combo++; maxCombo = Math.max(maxCombo, combo);
      if (collectAttr(q.w, "p")) collected++;
      const pts = ctx.award(q.w, 10 + Math.min(combo - 1, 5) * 2);
      score += pts;
      floatScore(btn, "+" + pts, ctx.isGolden(q.w) ? "gold" : "");
      if (combo >= 3) playCombo(combo); else playPop();
      haptic("select");
      ctx.say(`Correct — ${q.item.np.full} → die ${q.item.pl}`);
      gTimeout(round, 1000);
    };
    const bad = (btn) => {
      wrong++;
      combo = ctx.comboAfterMiss(combo, q.w);
      const pen = Math.round(6 * ctx.cost(q.w));
      score = Math.max(0, score - pen);
      if (btn) { shakeEl(btn); floatScore(btn, "−" + pen, "bad"); }
      playMiss(); haptic("miss");
      ctx.missed(q.w);
      ctx.say(`${q.item.np.full} → die ${q.item.pl}`);
      const rule = typeof pluralRuleHtml === "function" ? pluralRuleHtml(q.item.np.full, q.item.pl) : "";
      ctx.teach(`<div class="g-teach-main">${colorArticleHtml(q.item.np.full)} → <strong>die ${escapeHtml(q.item.pl)}</strong> <span class="g-teach-pl">= ${escapeHtml(gamePrompt(q.w))}</span></div>${rule ? `<div class="g-teach-rule">${rule}</div>` : `<div class="g-teach-sub">No simple rule for this one — learn it with the singular.</div>`}`, "bad");
      ctx.waitContinue(ctx.sudden ? done : round);
    };

    const answer = i => {
      if (!q || q.typed || ctx.busy || ctx.finished) return;
      if (!q.opts[i]) return;
      ctx.busy = true;
      const btn = ctx.stage.querySelector(`.g-opt[data-i="${i}"]`);
      mcReveal(ctx.stage, q.opts, i);
      speak("die " + q.item.pl);
      if (q.opts[i].correct) good(btn); else bad(btn);
      ctx.setScore(score); ctx.setCombo(combo);
    };
    const answerTyped = v => {
      if (!q || !q.typed || ctx.busy || ctx.finished) return;
      ctx.busy = true;
      const input = document.getElementById("g-typed");
      const res = gradeTyped(v.replace(/^\s*die\s+/i, ""), [q.item.pl]);
      speak("die " + q.item.pl);
      const sub = ctx.stage.querySelector(".pl-arrow");
      if (res === true) { typedOk++; if (input) input.classList.add("correct"); if (sub) sub.textContent = `✓ die ${q.item.pl}`; good(input); }
      else if (res === "near") { if (input) input.classList.add("near"); if (sub) sub.innerHTML = `≈ die ${diffHtml(v.replace(/^\s*die\s+/i, ""), q.item.pl)}`; ctx.say("Almost — check the spelling"); ctx.teach("≈ Almost — check the spelling.", "near"); ctx.waitContinue(round); }
      else { if (input) input.classList.add("wrong"); if (sub) sub.textContent = `die ${q.item.pl}`; bad(input); }
      ctx.setScore(score); ctx.setCombo(combo);
    };

    gListen(ctx.stage, "click", e => { const b = e.target.closest(".g-opt"); if (b) answer(+b.dataset.i); });
    ctx.onKey = e => { const i = digitKey(e, q && q.opts.length ? q.opts.length : 4); if (i >= 0) { e.preventDefault(); answer(i); } };
    ctx.setScore(0);
    round();
  },
});
