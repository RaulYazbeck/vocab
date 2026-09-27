// ── GAME: DER · DIE · DAS  (French: LE · LA) ──
// A noun appears without its article; tap the right gender bucket.
// Nouns come from nounParts() in games-core.js, which skips plural-only
// nouns and words with competing articles, so every answer is fair.
// The hint is never shown — B1 hints name the gender.

const GENDER_BUCKETS = IS_FRENCH_APP
  ? [{ a: "le", sub: "masculin", cls: "m" }, { a: "la", sub: "féminin", cls: "f" }]
  : [{ a: "der", sub: "masculine", cls: "m" }, { a: "die", sub: "feminine", cls: "f" }, { a: "das", sub: "neuter", cls: "n" }];

function genderNouns(pool) { return dedupeWords(pool.filter(w => nounParts(w))); }
function genderClass(answer) { return (GENDER_BUCKETS.find(b => b.a === answer) || {}).cls || ""; }

registerGame({
  id: "gender", name: () => IS_FRENCH_APP ? "Le · La" : "Der · Die · Das", icon: "🎨",
  skill: "Grammar · gender", timed: true,
  howTo: () => [
    `A noun appears without its article — tap <strong>${GENDER_BUCKETS.map(b => b.a).join("</strong>, <strong>")}</strong>.`,
    "Every correct answer in a row builds your streak and multiplier.",
    `Colours stick in memory: ${GENDER_BUCKETS.map(b => `<span class="gd-inline ${b.cls}">${b.a}</span>`).join(" ")}`,
    `Keys 1–${GENDER_BUCKETS.length} work too.`,
  ],
  requirement(pool, size) {
    const need = 6, n = genderNouns(pool).length;
    return n >= need ? { ok: true } : { ok: false, reason: `Needs ${need} nouns — you have ${n}` };
  },
  stars: [120, 250, 400],
  onRecord(result) {
    if ((result.maxCombo || 0) > (S.games.bestGenderStreak || 0)) S.games.bestGenderStreak = result.maxCombo;
  },
  start(ctx) {
    const limit = ctx.rounds(45000, 30000, 20000);
    const bonusCount = 6;
    const nouns = genderNouns(ctx.pool);
    let words = sampleWords(nouns, ctx.size === "bonus" ? bonusCount : 80), qi = 0;
    let score = 0, combo = 0, maxCombo = 0, correct = 0, wrong = 0, lastSec = 99, cur = null;

    ctx.stage.innerHTML = `
      <div class="gd-card" id="gd-card"><div class="gd-noun" id="gd-noun"></div><div class="gd-en" id="gd-en"></div></div>
      <div class="gd-buckets n${GENDER_BUCKETS.length}">
        ${GENDER_BUCKETS.map((b, i) => `<button class="gd-bucket ${b.cls}" data-i="${i}">
          <span class="g-key">${i + 1}</span><span class="gd-art">${b.a}</span><span class="gd-sub">${b.sub}</span></button>`).join("")}
      </div>`;
    const card = document.getElementById("gd-card");
    const nounEl = document.getElementById("gd-noun"), enEl = document.getElementById("gd-en");

    const end = () => ctx.finish({ score, correct, wrong, maxCombo,
      cleared: ctx.size === "bonus" ? correct >= 5 : true });

    const next = () => {
      if (ctx.finished) return;
      if (qi >= words.length) {
        if (ctx.size === "bonus") { end(); return; }
        words = sampleWords(nouns, 80); qi = 0;
      }
      cur = words[qi++];
      const np = nounParts(cur);
      card.className = "gd-card";
      nounEl.textContent = np.noun;
      enEl.textContent = gamePrompt(cur);
      popEl(card, true);
      ctx.busy = false;
    };

    const answer = i => {
      if (!cur || ctx.busy || ctx.paused || ctx.finished) return;
      ctx.busy = true;
      const np = nounParts(cur);
      const bucket = ctx.stage.querySelector(`.gd-bucket[data-i="${i}"]`);
      const ok = GENDER_BUCKETS[i].a === np.answer;
      card.classList.add(genderClass(np.answer));
      nounEl.textContent = np.full;
      if (ok) {
        correct++; combo++; maxCombo = Math.max(maxCombo, combo);
        const pts = 10 * comboMult(combo);
        score += pts;
        floatScore(bucket, "+" + pts);
        popEl(bucket);
        if (combo >= 5) playCombo(combo); else playPop();
        if ([10, 20, 30].includes(combo)) showComboFlash(combo);
        ctx.say(`Correct — ${np.full}`);
        gTimeout(next, 330);
      } else {
        wrong++; combo = 0;
        card.classList.add("wrong");
        shakeEl(bucket); playMiss(); buzz(40);
        ctx.missed(cur);
        ctx.say(`It's ${np.full}`);
        speak(np.full);
        gTimeout(next, 1000);
      }
      ctx.setScore(score); ctx.setCombo(combo);
    };

    gListen(ctx.stage, "click", e => { const b = e.target.closest(".gd-bucket"); if (b) answer(+b.dataset.i); });
    ctx.onKey = e => { const i = digitKey(e, GENDER_BUCKETS.length); if (i >= 0) { e.preventDefault(); answer(i); } };

    gInterval(() => {
      if (ctx.finished) return;
      const left = Math.max(0, limit - ctx.clock.elapsed());
      const sec = Math.ceil(left / 1000);
      ctx.setBar(left / limit, left < 5000 ? "urgent" : "");
      ctx.setClock(sec + "s", left < 5000);
      if (sec !== lastSec && sec <= 5 && sec > 0 && !ctx.paused) playTick();
      lastSec = sec;
      if (left <= 0) end();
    }, 100);

    ctx.setScore(0);
    next();
  },
});
