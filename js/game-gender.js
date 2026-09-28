// ── GAME: DER · DIE · DAS  (French: LE · LA) ──
// A noun appears without its article; tap the right gender bucket — or
// fling the card into it. Nouns come from nounParts() in games-core.js,
// which skips plural-only nouns and words with competing articles, so
// every answer is fair. The hint is never shown — B1 hints name the
// gender.
//
// Gender is a grammar attribute, not the word's meaning, so this game
// doesn't move stages; right answers on three different days add the
// noun to your Gender collection instead.
//
// Ranks: less time; from 🥇 Gold a miss costs seconds (half for 🌱
// words); 💎 Diamond is sudden death.

const GENDER_BUCKETS = IS_FRENCH_APP
  ? [{ a: "le", sub: "masculin", cls: "m" }, { a: "la", sub: "féminin", cls: "f" }]
  : [{ a: "der", sub: "masculine", cls: "m" }, { a: "die", sub: "feminine", cls: "f" }, { a: "das", sub: "neuter", cls: "n" }];

function genderNouns(pool) { return dedupeWords(pool.filter(w => nounParts(w))); }
function genderClass(answer) { return (GENDER_BUCKETS.find(b => b.a === answer) || {}).cls || ""; }

registerGame({
  id: "gender", name: () => IS_FRENCH_APP ? "Le · La" : "Der · Die · Das", icon: "🎨",
  skill: "Grammar · gender", timed: true, credit: null,
  ranks: [
    { limit: 45000, pen: 0 },
    { limit: 40000, pen: 0 },
    { limit: 35000, pen: 2000 },
    { limit: 30000, pen: 2000 },
    { limit: 30000, pen: 2000, sudden: true },
  ],
  twists: ["golden", "turbo", "sudden"],
  howTo: () => [`Tap <strong>${GENDER_BUCKETS.map(b => b.a).join("</strong> or <strong>")}</strong> for each noun.`],
  requirement(pool) {
    const need = 6, n = genderNouns(pool).length;
    return n >= need ? { ok: true } : { ok: false, reason: `Needs ${need} nouns — you have ${n}` };
  },
  stars: [120, 250, 400],
  onRecord(result) {
    if ((result.maxCombo || 0) > (S.games.bestGenderStreak || 0)) S.games.bestGenderStreak = result.maxCombo;
  },
  start(ctx) {
    const rp = ctx.rp;
    const limit = ctx.rounds(rp.limit, 30000, 20000) * ctx.timeScale;
    const sudden = ctx.sudden || (!!rp.sudden && ctx.size === "full");
    const bonusCount = 6;
    const nouns = genderNouns(ctx.pool);
    let words = sampleWords(nouns, ctx.size === "bonus" ? bonusCount : 80), qi = 0;
    let score = 0, combo = 0, maxCombo = 0, correct = 0, wrong = 0, lastSec = 99, cur = null, collected = 0;

    ctx.stage.innerHTML = `
      <div class="gd-card" id="gd-card"><div class="gd-noun" id="gd-noun"></div><div class="gd-en" id="gd-en"></div></div>
      <div class="gd-buckets n${GENDER_BUCKETS.length}">
        ${GENDER_BUCKETS.map((b, i) => `<button class="gd-bucket ${b.cls}" data-i="${i}">
          <span class="g-key">${i + 1}</span><span class="gd-art">${b.a}</span><span class="gd-sub">${b.sub}</span></button>`).join("")}
      </div>`;
    const card = document.getElementById("gd-card");
    const nounEl = document.getElementById("gd-noun"), enEl = document.getElementById("gd-en");

    const end = () => ctx.finish({ score, correct, wrong, maxCombo,
      cleared: ctx.size === "bonus" ? correct >= 5 : true, note: collected ? `🎨 ${collected} noun${collected > 1 ? "s" : ""} added to your Gender collection` : "" });

    const next = () => {
      if (ctx.finished) return;
      if (qi >= words.length) {
        if (ctx.size === "bonus") { end(); return; }
        words = sampleWords(nouns, 80); qi = 0;
      }
      cur = words[qi++];
      const np = nounParts(cur);
      ctx.teach("");
      card.className = "gd-card";
      card.style.transform = "";
      nounEl.textContent = np.noun;
      enEl.innerHTML = escapeHtml(gamePrompt(cur)) + ctx.tag(cur);
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
      nounEl.textContent = np.indef ? `${np.full} · ${np.indef}` : np.full;
      if (ok) {
        correct++; combo++; maxCombo = Math.max(maxCombo, combo);
        const pts = ctx.award(cur, 10 * comboMult(combo));
        score += pts;
        if (collectAttr(cur, "g")) collected++;
        floatScore(bucket, "+" + pts, ctx.isGolden(cur) ? "gold" : "");
        popEl(bucket);
        if (combo >= 5) playCombo(combo); else playPop();
        if ([10, 20, 30].includes(combo)) showComboFlash(combo);
        haptic("select");
        ctx.say(`Correct — ${np.full}`);
        gTimeout(next, 330);
      } else {
        wrong++;
        combo = ctx.comboAfterMiss(combo, cur);
        if (rp.pen) { const pen = Math.round(rp.pen * ctx.cost(cur)); ctx.clock.add(pen); floatScore(bucket, `−${pen / 1000}s`, "bad"); }
        card.classList.add("wrong");
        shakeEl(bucket); playMiss(); haptic("miss");
        ctx.missed(cur);
        ctx.say(`It's ${np.full}`);
        speak(np.full);
        // Why: an ending rule when there is one (-ung → die, -chen → das…).
        const rule = typeof genderRuleHtml === "function" ? genderRuleHtml(np.noun, np.answer) : "";
        ctx.teach(`<div class="g-teach-main">${colorArticleHtml(np.full)} = ${escapeHtml(gamePrompt(cur))}</div>${rule ? `<div class="g-teach-rule">${rule}</div>` : `<div class="g-teach-sub">No ending rule here — picture it in its colour.</div>`}`, "bad");
        if (sudden) gTimeout(end, 1500); else ctx.pauseClockFor(1700, next);
      }
      ctx.setScore(score); ctx.setCombo(combo);
    };

    gListen(ctx.stage, "click", e => { const b = e.target.closest(".gd-bucket"); if (b) answer(+b.dataset.i); });
    ctx.onKey = e => { const i = digitKey(e, GENDER_BUCKETS.length); if (i >= 0) { e.preventDefault(); answer(i); } };
    // Fling the card into a bucket.
    const buckets = () => [...ctx.stage.querySelectorAll(".gd-bucket")];
    gDrag(ctx.stage, {
      items: ".gd-card",
      canDrag: () => !ctx.busy && !ctx.paused && !ctx.finished && !!cur,
      resolve: (x, y) => buckets().find(b => pointIn(b, x, y, 14)) || null,
      hover: t => { buckets().forEach(b => b.classList.toggle("drop-hot", b === t)); },
      drop: (el, t) => { answer(+t.dataset.i); return true; },
    });

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
