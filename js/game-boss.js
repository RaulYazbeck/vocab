// ── GAME: BOSS BATTLE ─────────────────────────
// Your weakest words form a boss. Type each answer (typed recall, the
// same check as Drill) to deal damage; a miss costs a heart and sends
// the word to the back of the queue.
//
// The one game that counts toward mastery: vocab words go through
// applyCorrect/applyWrong exactly like Drill (and earn Drill XP). Anki
// cards earn XP only — their stats and scheduling are never touched.
// Like Drill, it keeps ONE input element and updates the rest in
// place, so the phone keyboard never closes between words.

const BOSSES = [
  { icon: "👾", name: "Glitch Gremlin" },
  { icon: "🐉", name: "Grammar Dragon" },
  { icon: "🦖", name: "Vocab-o-saurus" },
  { icon: "👹", name: "Oni of Forgetting" },
  { icon: "🐙", name: "Kraken of Cases" },
];
const BOSS_HEARTS = 3, BOSS_SIZE = 8;

registerGame({
  id: "boss", name: "Boss Battle", icon: "👾", skill: "Typed recall · counts for mastery",
  inRuns: false,
  howTo: [
    "Your weakest words have teamed up. Type each answer to hit the boss.",
    "A miss costs a ❤️ and the word comes back later. Lose all three and the boss escapes.",
    "Answers count toward mastery, just like Drill.",
  ],
  requirement(pool) {
    const n = distinctCount(pool);
    return n >= 4 ? { ok: true } : { ok: false, reason: `Needs 4 words — you have ${n}` };
  },
  starsFor(res) { return !res.won ? 0 : res.wrong === 0 ? 3 : res.hearts >= 2 ? 2 : 1; },
  xpFor(res) { return res.won ? 50 : 0; }, // per-answer XP is paid live, like Drill
  onRecord(res) { if (res.won) S.games.bossesDefeated = (S.games.bossesDefeated || 0) + 1; },
  start(ctx) {
    const ranked = dedupeWords(ctx.pool.slice().sort((a, b) => (wordWeakness(b) + Math.random() * 1.5) - (wordWeakness(a) + Math.random() * 1.5)));
    const queue = ranked.slice(0, BOSS_SIZE);
    const maxHp = queue.length;
    const boss = BOSSES[Math.min(Math.floor((S.games.bossesDefeated || 0) / 3), BOSSES.length - 1)];
    let hp = maxHp, hearts = BOSS_HEARTS, correct = 0, wrong = 0, combo = 0, maxCombo = 0;
    sessionConsecutive = 0; // applyCorrect reads it for the best-combo record

    ctx.stage.innerHTML = `
      <div class="bb-arena" id="bb-arena">
        <div class="bb-boss" id="bb-boss">${boss.icon}</div>
        <div class="bb-name">${escapeHtml(boss.name)}</div>
        <div class="bb-hp"><div class="bb-hp-fill" id="bb-hp"></div></div>
        <div class="bb-hp-label" id="bb-hp-label"></div>
      </div>
      <div class="word-display bb-prompt">
        <div class="english-word" id="bb-en"></div>
        <div class="word-hint" id="bb-hint"></div>
      </div>
      <input type="text" class="german-input" id="bb-input" placeholder="type the answer…"
        autocomplete="off" autocorrect="off" autocapitalize="off" spellcheck="false" enterkeyhint="go"/>
      <div class="action-row">
        <button class="check-btn" id="bb-attack">⚔️ Attack</button>
        <button class="dontknow-btn" id="bb-skip">? Don't know</button>
      </div>
      <div class="bb-feedback" id="bb-fb"></div>`;
    const input = document.getElementById("bb-input");
    const fb = document.getElementById("bb-fb");
    const bossEl = document.getElementById("bb-boss");

    const updateHp = () => {
      document.getElementById("bb-hp").style.width = (hp / maxHp * 100) + "%";
      document.getElementById("bb-hp-label").textContent = `HP ${hp}/${maxHp}`;
      ctx.setLives(hearts, BOSS_HEARTS);
      ctx.setBar(1 - hp / maxHp, "progress");
    };
    const show = () => {
      const w = queue[0];
      document.getElementById("bb-en").textContent = gamePrompt(w);
      document.getElementById("bb-hint").textContent = w.hint || "";
      input.value = "";
      input.className = "german-input";
      fb.innerHTML = "";
      ctx.busy = false;
      try { input.focus({ preventScroll: true }); } catch (e) { input.focus(); }
    };
    const end = won => {
      const score = correct * 10 + hearts * 20 + (won ? 50 : 0);
      ctx.finish({ score, correct, wrong, maxCombo, won, hearts });
    };

    const attack = skip => {
      if (ctx.busy || ctx.finished || !queue.length) return;
      const w = queue[0];
      const val = input.value;
      if (!skip && !val.trim()) { skip = true; }
      const ok = !skip && isCorrect(val, w[WORD_KEY]);
      ctx.busy = true;
      if (ok) {
        correct++; combo++; maxCombo = Math.max(maxCombo, combo);
        if (!w.anki) {
          const ws = getWS(w.deckId, w.idx);
          const first = ws.correct === 0 && ws.wrong === 0;
          sessionConsecutive++;
          addExp(first ? 10 : 5);
          applyCorrect(ws);
        } else addExp(5);
        saveState();
        queue.shift(); hp--;
        input.classList.add("correct");
        fb.innerHTML = `<span class="bb-ok">⚔️ Hit! <strong>${escapeHtml(w[WORD_KEY])}</strong></span>`;
        bossEl.classList.remove("hit"); void bossEl.offsetWidth; bossEl.classList.add("hit");
        floatScore(bossEl, "−1 HP", "dmg");
        playBossHit(); buzz(25);
        ctx.setCombo(combo); ctx.setScore(correct * 10);
        ctx.say(`Hit! ${w[WORD_KEY]}`);
        updateHp();
        if (hp <= 0) {
          bossEl.classList.add("defeated");
          gTimeout(() => end(true), 1100);
        } else gTimeout(show, 750);
      } else {
        wrong++; hearts--; combo = 0;
        if (!w.anki) { applyWrong(getWS(w.deckId, w.idx)); }
        sessionConsecutive = 0;
        saveState();
        ctx.missed(w);
        queue.push(queue.shift());
        input.classList.add("wrong");
        fb.innerHTML = `<span class="bb-bad">${skip ? "✗" : `<s>${escapeHtml(val.trim())}</s> →`} <strong>${escapeHtml(w[WORD_KEY])}</strong></span>
          <button class="audio-btn" ${speakBtnAttrs(w[WORD_KEY])} aria-label="Listen">🔊</button>`;
        speak(w[WORD_KEY]);
        const arena = document.getElementById("bb-arena");
        arena.classList.remove("hurt"); void arena.offsetWidth; arena.classList.add("hurt");
        shakeEl(document.getElementById("game-screen"));
        playMiss(); buzz([60, 40, 60]);
        ctx.setCombo(0);
        ctx.say(`Ouch — it was ${w[WORD_KEY]}`);
        updateHp();
        if (hearts <= 0) gTimeout(() => end(false), 1800);
        else gTimeout(show, 1900);
      }
    };

    document.getElementById("bb-attack").onclick = () => attack(false);
    document.getElementById("bb-skip").onclick = () => attack(true);
    gListen(input, "keydown", e => { if (e.key === "Enter") { e.preventDefault(); attack(false); } });

    ctx.setScore(0);
    updateHp();
    show();
  },
});
