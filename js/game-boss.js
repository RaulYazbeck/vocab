// ── GAME: BOSS BATTLE ─────────────────────────
// Three kinds of boss, one engine:
//   • Weakest-words boss (hub) — your weakest words have teamed up.
//   • Deck bosses — every vocab deck has one (deterministic name), a
//     final exam on that deck's met words. Unlocks at 12 met words;
//     wins fill the Bestiary; rematches grow with the deck.
//   • Weekly world boss — a big HP pool you chip away at across
//     sessions during the week; progress persists (S.games.world).
// Type each answer (typed recall, the same check as Drill) to deal
// damage; a miss costs a heart (half for a 🌱 new word) and sends the
// word to the back of the queue.
//
// The one game that counts toward stages live: vocab words go through
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
  { icon: "🧌", name: "Troll of Tenses" },
  { icon: "🦂", name: "Scorpion of Syntax" },
  { icon: "🧛", name: "Count Conjugation" },
  { icon: "🐺", name: "Wolf of Word Order" },
  { icon: "🗿", name: "Golem of Genders" },
];
const BOSS_RANKS = [
  { hp: 8, hearts: 3 }, { hp: 10, hearts: 3 }, { hp: 12, hearts: 2 }, { hp: 14, hearts: 2 }, { hp: 16, hearts: 1, timer: 12000 },
];
const DECK_BOSS_UNLOCK = 12; // legacy (quests); the 👑 boss now needs the whole deck met
const BOSS_CREATURES = [
  ["Kraken", "🐙"], ["Dragon", "🐉"], ["Golem", "🗿"], ["Hydra", "🐍"], ["Wyvern", "🐲"], ["Troll", "🧌"],
  ["Phantom", "👻"], ["Sphinx", "🦁"], ["Basilisk", "🦎"], ["Manticore", "🦂"], ["Yeti", "❄️"], ["Minotaur", "🐂"],
  ["Griffin", "🦅"], ["Leviathan", "🐋"], ["Chimera", "🔥"], ["Banshee", "🌫️"], ["Cyclops", "👁️"], ["Gargoyle", "🦇"],
  ["Harpy", "🪶"], ["Ogre", "👹"], ["Vampire", "🧛"], ["Werewolf", "🐺"], ["Mummy", "🧟"], ["Titan", "🗻"],
  ["Djinn", "🧞"], ["Kobold", "👺"], ["Wraith", "💀"], ["Behemoth", "🦏"], ["Serpent", "🐍"], ["Robot", "🤖"],
];
// Words sharing this exact prompt — typing any of them is fair game
// ("the car": das Auto or der Wagen when both carry that prompt).
function bossSynonyms(w) {
  const p = normKey(gamePrompt(w));
  return allGameWords().filter(x => !sameWord(x, w) && normKey(gamePrompt(x)) === p);
}

// ── DECK BOSSES ───────────────────────────────
// Deterministic per deck: an alliterating creature when one exists.
function deckBoss(deckId) {
  const d = getDeck(deckId);
  const first = String(d ? d.name : deckId).split(/[\s—–,&]+/).find(t => /^\p{L}{3,}/u.test(t)) || "Word";
  const h = hashString(deckId);
  const allit = BOSS_CREATURES.filter(c => c[0][0].toLowerCase() === first[0].toLowerCase());
  const c = allit.length ? allit[h % allit.length] : BOSS_CREATURES[h % BOSS_CREATURES.length];
  return { icon: c[1], name: `${first} ${c[0]}` };
}
function deckBossName(deckId) { const b = deckBoss(deckId); return `${b.icon} ${b.name}`; }
function deckMetWords(deckId) {
  const d = getDeck(deckId);
  if (!d) return [];
  const out = [];
  d.words.forEach((w, i) => { const ws = S.words[d.id + "_" + i]; if (ws && ws.st) out.push({ ...w, deckId: d.id, deckName: d.name, idx: i, anki: false }); });
  return out;
}
// 👑 The ultimate deck boss: unlocks once every word of the deck is met,
// has the whole deck as HP and must be beaten without a single mistake.
function deckBossReady(deckId) { const d = getDeck(deckId); return !!d && deckMetWords(deckId).length >= d.words.length; }
function deckBossHp(deckId) { const d = getDeck(deckId); return d ? d.words.length : 0; }
// Decks whose ultimate boss can be fought now (not already beaten today).
function deckBossesAvailable() {
  const out = [];
  const today = todayISO();
  vocabGroups().forEach(g => g.decks.forEach(d => {
    const rec = S.games.bestiary[d.id];
    if (deckBossReady(d.id) && !(rec && rec.last === today)) out.push(d.id);
  }));
  return out;
}
// ⚔️ Minions: the weak version, met by surprise inside Today sessions —
// 10 words of a deck, 3 lives. A win is a small trophy, not the 👑 kill.
const MINION_WORDS = 10, MINION_CHANCE = 0.10;
function minionDeckPick(rng = Math.random) {
  const ds = [];
  vocabGroups().forEach(g => g.decks.forEach(d => { const n = deckMetWords(d.id).length; if (n >= MINION_WORDS) ds.push({ id: d.id, w: n }); }));
  const p = weightedPick(ds, rng);
  return p ? p.id : null;
}
function startMinion(deckId, onDone) {
  const pool = deckMetWords(deckId);
  gameRun = { kind: "surprise", ids: ["boss"], i: 0, summaries: [], pool, size: "bonus", title: "⚔️ Minion", onDone };
  launchGame("boss", { pool, size: "bonus", bossMode: "minion", deck: deckId });
}
function deckBossBadge(deckId) {
  const rec = S.games.bestiary[deckId];
  if (!rec || !rec.wins) return "";
  return rec.perfect ? "🏅" : "⚔️";
}
function deckBossRowHtml(deckId) {
  const b = deckBoss(deckId), rec = S.games.bestiary[deckId] || {};
  const met = deckMetWords(deckId).length;
  const ok = deckBossReady(deckId);
  return `<div class="boss-row">
    <span class="boss-row-icon">${ok || rec.wins ? b.icon : "🔒"}</span>
    <span class="boss-row-body"><b>${ok || rec.wins ? `👑 ${escapeHtml(b.name)}` : "👑 Deck boss"}</b>
      <small>${rec.wins ? `Defeated ${rec.wins}× · the whole deck, no mistakes${rec.minions ? ` · ⚔️ ${rec.minions} minion${rec.minions > 1 ? "s" : ""}` : ""}` : ok ? `All ${deckBossHp(deckId)} words · no mistakes allowed` : `Unlocks when all ${getDeck(deckId).words.length} words are met (${met} so far)${rec.minions ? ` · ⚔️ ${rec.minions} minion${rec.minions > 1 ? "s" : ""} beaten` : ""}`}</small></span>
    ${ok ? `<button class="g-sec-btn" onclick="startDeckBoss('${deckId}')">${rec.wins ? "Rematch" : "Fight"} ⚔️</button>` : ""}
  </div>`;
}
function startDeckBoss(deckId) {
  const pool = deckMetWords(deckId);
  if (!deckBossReady(deckId)) { showCelebrateToast("🔒", "👑 Deck boss", `Meet all ${deckBossHp(deckId)} words of this deck first (${pool.length} so far)`); return; }
  launchGame("boss", { pool, size: "full", bossMode: "deck", deck: deckId });
}

// ── WORLD BOSS ────────────────────────────────
function worldBossState() {
  const wk = typeof isoWeekKey === "function" ? isoWeekKey() : todayISO();
  const W = S.games.world;
  if (W.week !== wk) {
    const rng = seededRandom(hashString(wk + "|world|" + STORAGE_KEY));
    const c = BOSS_CREATURES[Math.floor(rng() * BOSS_CREATURES.length)];
    const titles = ["the Unforgettable", "of the Lost Words", "the Endless", "of a Thousand Articles", "the Weekly Terror", "of Forgotten Plurals"];
    const max = getDailyGoal() >= 100 ? 60 : 40;
    Object.assign(W, { week: wk, hp: max, max, icon: c[1], name: `${c[0]} ${titles[Math.floor(rng() * titles.length)]}`, defeated: false });
  }
  return W;
}
function startWorldBoss() {
  const W = worldBossState();
  if (W.defeated) { showCelebrateToast(W.icon, "World boss defeated", "A new one arrives on Monday"); return; }
  const pool = typeof dailyPool === "function" ? dailyPool() : buildGamePool(null);
  if (distinctCount(pool) < 4) { showCelebrateToast("🌋", "World boss", "Meet a few more words first"); return; }
  launchGame("boss", { pool, size: "full", bossMode: "world" });
}
// Hub row: weakest-words boss, world boss, deck bosses.
function bossRowHtml() {
  const W = worldBossState();
  const avail = deckBossesAvailable();
  const beaten = Object.values(S.games.bestiary).filter(r => r.wins).length;
  const unbeaten = avail.filter(id => !(S.games.bestiary[id] || {}).wins);
  const show = (unbeaten.length ? unbeaten : avail).slice(0, 8);
  return `<div class="boss-hub">
    <div class="boss-hub-head"><span>⚔️ Bosses</span><button class="tc-link" onclick="renderBestiary()">📖 Bestiary ${beaten}</button></div>
    <button class="boss-world ${W.defeated ? "done" : ""}" onclick="startWorldBoss()" ${W.defeated ? "disabled" : ""}>
      <span class="boss-world-icon">${W.icon}</span>
      <span class="boss-world-body"><b>World boss: ${escapeHtml(W.name)}</b>
        <span class="boss-world-bar"><i style="width:${Math.round(W.hp / W.max * 100)}%"></i></span>
        <small>${W.defeated ? "Defeated this week ✓" : `HP ${W.hp}/${W.max} · chip away all week`}</small></span>
    </button>
    ${show.length ? `<div class="boss-decks">${show.map(id => { const b = deckBoss(id), rec = S.games.bestiary[id] || {};
      return `<button class="boss-chip ${rec.wins ? "won" : ""}" onclick="startDeckBoss('${id}')" title="${escapeHtml(getDeck(id).name)}">
        <span>${b.icon}</span><small>${escapeHtml(b.name)}</small><em>HP ${deckBossHp(id)}${rec.wins ? " · ⚔️" : ""}</em></button>`; }).join("")}</div>`
      : `<div class="boss-hint">👑 A deck's boss unlocks once every word of it is met. Its minions may show up in your sessions before that.</div>`}
  </div>`;
}
function renderBestiary() {
  showGameScreen();
  if (typeof logScreen === "function") logScreen("bestiary");
  const groups = vocabGroups().map(g => {
    const tiles = g.decks.map(d => {
      const b = deckBoss(d.id), rec = S.games.bestiary[d.id] || {};
      const met = deckMetWords(d.id).length;
      const known = rec.wins > 0;
      const ready = deckBossReady(d.id), seen = known || ready || rec.minions;
      return `<button class="bst-tile ${known ? "won" : ready ? "ready" : "locked"}" ${ready ? `onclick="startDeckBoss('${d.id}')"` : "disabled"}>
        <span class="bst-icon">${seen ? b.icon : "❔"}</span>
        <span class="bst-name">${seen ? (known ? "👑 " : "") + escapeHtml(b.name) : "???"}</span>
        <span class="bst-deck">${d.icon} ${escapeHtml(d.name)}</span>
        <span class="bst-rec">${known ? `👑 ${rec.wins}×` : ready ? "ready ⚔️" : `${met}/${d.words.length} met`}${rec.minions ? ` · ⚔️${rec.minions}` : ""}</span>
      </button>`;
    }).join("");
    return `<div class="stats-section-title" style="margin-top:12px">${g.icon} ${escapeHtml(g.name)}</div><div class="bst-grid">${tiles}</div>`;
  }).join("");
  const total = vocabGroups().reduce((s, g) => s + g.decks.length, 0);
  const beaten = Object.values(S.games.bestiary).filter(r => r.wins).length;
  document.getElementById("main-screen").innerHTML = `<div class="screen">
    <div class="screen-top"><div class="screen-label">📖 Bestiary · ${beaten}/${total}</div><button class="back-btn" onclick="openGamesHub(null)">← Games</button></div>
    ${groups}
  </div>`;
}

registerGame({
  id: "boss", name: "Boss Battle", icon: "👾", skill: "Typed recall · counts for stages",
  inRuns: false, liveCredit: true, ranks: BOSS_RANKS, twists: ["sudden", "golden"],
  howTo: [
    "Your weakest words have teamed up. Type each answer to hit the boss.",
    "A miss costs a ❤️ (half a heart for 🌱 new words) and the word comes back later. Lose them all and the boss escapes.",
    "Answers count toward your word stages, just like Drill. Deck bosses and the weekly world boss live in the hub.",
  ],
  requirement(pool) {
    const n = distinctCount(pool);
    return n >= 4 ? { ok: true } : { ok: false, reason: `Needs 4 words — you have ${n}` };
  },
  starsFor(res) { return !res.won ? 0 : res.wrong === 0 ? 3 : res.hearts >= 2 ? 2 : 1; },
  xpFor(res) { return res.won ? (res.world ? 150 : res.deck ? 200 : res.minion ? 25 : 50) : 0; }, // per-answer XP is paid live, like Drill
  onRecord(res) { if (res.won) S.games.bossesDefeated = (S.games.bossesDefeated || 0) + 1; },
  start(ctx) {
    const mode = ctx.opts.bossMode || "weak";
    const rp = ctx.rp;
    const world = mode === "world" ? worldBossState() : null;
    // Weakest first (a little jitter so equal words vary between fights).
    const ranked = dedupeWords(ctx.pool.map(w => ({ w, k: wordWeakness(w) + Math.random() * 1.5 }))
      .sort((a, b) => b.k - a.k).map(x => x.w));
    const size = mode === "deck" ? deckBossHp(ctx.opts.deck) : mode === "minion" ? MINION_WORDS : mode === "world" ? Math.min(12, world.hp) : rp.hp;
    const queue = ranked.slice(0, size);
    while (queue.length < size && ranked.length) queue.push(...shuffle(ranked.slice()).slice(0, size - queue.length));
    const maxHp = mode === "world" ? world.max : queue.length;
    let hp = mode === "world" ? world.hp : maxHp;
    const skin = typeof activeBossSkin === "function" ? activeBossSkin() : null;
    const boss = mode === "deck" ? deckBoss(ctx.opts.deck) : mode === "minion" ? { icon: deckBoss(ctx.opts.deck).icon, name: deckBoss(ctx.opts.deck).name + " minion" }
      : mode === "world" ? { icon: world.icon, name: world.name }
      : skin ? { icon: skin.icon, name: skin.name } : BOSSES[Math.floor((S.games.bossesDefeated || 0) / 3) % BOSSES.length];
    // 👑 Deck boss: flawless or nothing. Minion: 3 lives.
    const flawless = ctx.sudden || mode === "deck";
    const maxHearts = flawless ? 1 : mode === "minion" ? 3 : rp.hearts;
    let hearts = maxHearts, correct = 0, wrong = 0, combo = 0, maxCombo = 0, dealt = 0, typedOk = 0;
    const perWord = ctx.size === "full" && rp.timer ? rp.timer * ctx.timeScale : 0;
    let wordStart = 0;
    sessionConsecutive = 0; // applyCorrect reads it for the best-combo record

    ctx.stage.innerHTML = `
      <div class="bb-arena" id="bb-arena">
        <div class="bb-boss" id="bb-boss">${boss.icon}</div>
        <div class="bb-name">${mode === "deck" ? "👑 " : ""}${escapeHtml(boss.name)}${mode === "world" ? " · 🌋 world boss" : mode === "deck" || mode === "minion" ? ` · ${escapeHtml(getDeck(ctx.opts.deck).name)}` : ""}</div>
        ${mode === "deck" ? `<div class="bb-rule">The whole deck — one mistake and it escapes</div>` : mode === "minion" ? `<div class="bb-rule">${MINION_WORDS} words · 3 lives</div>` : ""}
        <div class="bb-hp"><div class="bb-hp-fill" id="bb-hp"></div></div>
        <div class="bb-hp-label" id="bb-hp-label"></div>
      </div>
      <div class="word-display bb-prompt">
        <div class="english-word" id="bb-en"></div>
        <div class="word-hint" id="bb-hint"></div>
      </div>
      <input type="text" class="german-input" id="bb-input" placeholder="type the answer…"
        autocomplete="off" autocorrect="off" autocapitalize="off" spellcheck="false" enterkeyhint="go"/>
      ${accentBarHtml("bb-input")}
      <div class="action-row">
        <button class="check-btn" id="bb-attack">⚔️ Attack</button>
        <button class="dontknow-btn" id="bb-skip">? Don't know</button>
        ${mode === "world" ? `<button class="dontknow-btn" id="bb-retreat" title="Keep your damage and leave">🏳️ Retreat</button>` : ""}
      </div>
      <div class="bb-feedback" id="bb-fb"></div>`;
    const input = document.getElementById("bb-input");
    const fb = document.getElementById("bb-fb");
    const bossEl = document.getElementById("bb-boss");

    const updateHp = () => {
      document.getElementById("bb-hp").style.width = (hp / maxHp * 100) + "%";
      document.getElementById("bb-hp-label").textContent = `HP ${hp}/${maxHp}`;
      ctx.setLives(hearts, maxHearts);
      ctx.setBar(1 - hp / maxHp, "progress");
    };
    const show = () => {
      const w = queue[0];
      document.getElementById("bb-en").innerHTML = escapeHtml(gamePrompt(w)) + ctx.tag(w);
      document.getElementById("bb-hint").textContent = w.hint || "";
      input.value = "";
      input.className = "german-input";
      fb.innerHTML = "";
      ctx.busy = false;
      wordStart = ctx.clock.elapsed();
      try { input.focus({ preventScroll: true }); } catch (e) { input.focus(); }
    };
    const end = won => {
      const score = correct * 10 + Math.round(hearts * 20) + (won ? 50 : 0) + ctx.golden * 20;
      if (mode === "world") {
        // Losing every heart lets the world boss recover; retreating keeps your damage.
        world.hp = !won && hearts <= 0 ? world.max : Math.max(0, hp);
        if (won && !world.defeated) {
          world.defeated = true;
          S.games.worldWins = (S.games.worldWins || 0) + 1;
          if (typeof questQueueChest === "function") questQueueChest("world", "epic");
        }
      }
      if (mode === "deck" && won) {
        const rec = S.games.bestiary[ctx.opts.deck] || (S.games.bestiary[ctx.opts.deck] = { wins: 0 });
        rec.wins++; rec.last = todayISO(); rec.perfect = 1;
        if (typeof questQueueChest === "function") questQueueChest("boss", "epic");
      }
      if (mode === "minion" && won) {
        const rec = S.games.bestiary[ctx.opts.deck] || (S.games.bestiary[ctx.opts.deck] = { wins: 0 });
        rec.minions = (rec.minions || 0) + 1;
        if (typeof questQueueChest === "function") questQueueChest("minion", "common");
      }
      // Minions count for the "any boss" quests (and the weekly saga), not
      // for the 👑 deck-boss or weakest-words ones. Their answers already
      // count as Today-session answers (they happen inside one).
      questEvent("boss", { won, perfect: won && wrong === 0, ms: Math.round(ctx.clock.elapsed()), deck: mode === "deck" ? ctx.opts.deck : null, world: mode === "world", minion: mode === "minion" });
      ctx.finish({ score, correct, wrong, maxCombo, won, hearts, world: mode === "world", deck: mode === "deck", minion: mode === "minion", dealt,
        note: mode === "world" ? (won ? "🌋 World boss defeated — an Epic chest is waiting!" : hearts <= 0 ? "🌋 The world boss recovered — it's back to full HP." : `🌋 You dealt ${dealt} damage — the world boss has ${Math.max(0, hp)} HP left this week.`)
          : mode === "deck" ? (won ? `👑 ${boss.name} defeated — the whole deck, flawless. An Epic chest is waiting!` : `👑 ${boss.name} escaped. It's back to full strength — the whole deck, no mistakes.`)
          : mode === "minion" && won ? `⚔️ Minion defeated — the 👑 ${deckBoss(ctx.opts.deck).name} still waits for the whole deck.` : "" });
    };

    const attack = skip => {
      if (ctx.busy || ctx.finished || !queue.length) return;
      const w = queue[0];
      const val = input.value;
      if (!skip && !val.trim()) {
        // An accidental Enter on an empty box shouldn't cost a heart.
        shakeEl(input);
        ctx.say("Type an answer — or tap “Don't know”.");
        return;
      }
      const ok = !skip && (typedCorrect(val, w) || bossSynonyms(w).some(x => typedCorrect(val, x)));
      const near = !ok && !skip && isNearMiss(val, [w[WORD_KEY], gameForm(w)]);
      ctx.busy = true;
      if (near) {
        input.classList.add("near");
        fb.innerHTML = `<span class="g-near">≈ Almost! ${diffHtml(val, gameForm(w))}</span>`;
        ctx.say("Almost — check the spelling and try again");
        gTimeout(() => { ctx.busy = false; input.classList.remove("near"); input.select(); }, 900);
        return;
      }
      if (ok) {
        correct++; typedOk++; combo++; maxCombo = Math.max(maxCombo, combo); dealt++;
        if (!w.anki) {
          const ws = getWS(w.deckId, w.idx);
          const first = ws.correct === 0 && ws.wrong === 0;
          sessionConsecutive++;
          addExp(first ? 10 : 5);
          applyCorrect(ws, { w });
          questEvent("answer", { mode: mode === "minion" ? "path" : "boss", ok: true, typed: true, w });
        } else addExp(5);
        ctx.award(w, 1);
        saveState();
        queue.shift(); hp--;
        if (mode === "world") { world.hp = Math.max(0, hp); questEvent("world", { dmg: 1 }); if (queue.length < 3) queue.push(...sampleWords(ctx.pool, 6)); }
        input.classList.add("correct");
        fb.innerHTML = `<span class="bb-ok">⚔️ Hit! <strong>${colorArticleHtml(w[WORD_KEY])}</strong></span>`;
        bossEl.classList.remove("hit"); void bossEl.offsetWidth; bossEl.classList.add("hit");
        floatScore(bossEl, "−1 HP", "dmg");
        playBossHit(); haptic("select");
        ctx.setCombo(combo); ctx.setScore(correct * 10);
        ctx.say(`Hit! ${w[WORD_KEY]}`);
        updateHp();
        if (hp <= 0) {
          bossEl.classList.add("defeated");
          gTimeout(() => end(true), 1100);
        } else gTimeout(show, 750);
      } else {
        const cost = flawless ? hearts : ctx.cost(w);
        wrong++; hearts = Math.max(0, hearts - cost); combo = ctx.comboAfterMiss(combo, w);
        if (!w.anki) { applyWrong(getWS(w.deckId, w.idx), { w }); questEvent("answer", { mode: mode === "minion" ? "path" : "boss", ok: false, typed: true, w }); }
        sessionConsecutive = 0;
        saveState();
        ctx.missed(w);
        queue.push(queue.shift());
        input.classList.add("wrong");
        fb.innerHTML = `<span class="bb-bad">${skip ? "✗" : `<s>${escapeHtml(val.trim())}</s> →`} <strong>${colorArticleHtml(w[WORD_KEY])}</strong></span>
          <button class="audio-btn" ${speakBtnAttrs(w[WORD_KEY])} aria-label="Listen">🔊</button>`;
        speak(w[WORD_KEY]);
        const arena = document.getElementById("bb-arena");
        arena.classList.remove("hurt"); void arena.offsetWidth; arena.classList.add("hurt");
        shakeEl(document.getElementById("game-screen"));
        playMiss(); haptic(cost < 1 ? "miss" : "heavy");
        ctx.setCombo(combo);
        ctx.say(`Ouch — it was ${w[WORD_KEY]}${cost < 1 && !ctx.sudden ? " (new word: half a heart)" : ""}`);
        updateHp();
        if (hearts <= 0) gTimeout(() => end(false), 1800);
        else gTimeout(show, 1900);
      }
    };

    // Buttons must not take focus from the input — on phones that would
    // close the keyboard between every word.
    ["bb-attack", "bb-skip", "bb-retreat"].forEach(id => { const b = document.getElementById(id); if (b) gListen(b, "pointerdown", e => e.preventDefault()); });
    document.getElementById("bb-attack").onclick = () => { attack(false); input.focus({ preventScroll: true }); };
    document.getElementById("bb-skip").onclick = () => { attack(true); input.focus({ preventScroll: true }); };
    const rt = document.getElementById("bb-retreat");
    if (rt) rt.onclick = () => { if (!ctx.busy && !ctx.finished) end(false); };
    gListen(input, "keydown", e => { if (e.key === "Enter") { e.preventDefault(); attack(false); } });
    if (perWord) gInterval(() => {
      if (ctx.busy || ctx.paused || ctx.finished || !queue.length) return;
      const left = Math.max(0, perWord - (ctx.clock.elapsed() - wordStart));
      ctx.setClock(Math.ceil(left / 1000) + "s", left < 4000);
      if (left <= 0) { input.value = ""; attack(true); }
    }, 200);

    ctx.setScore(0);
    updateHp();
    show();
  },
});
