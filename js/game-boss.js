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
  { hp: 8, hearts: 3 }, { hp: 10, hearts: 3 }, { hp: 12, hearts: 2 }, { hp: 14, hearts: 2 }, { hp: 16, hearts: 1, timer: 20000 },
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
// has the whole deck as HP and must be beaten without a single mistake
// — or with the ❤️ boss hearts you bring (1 per 20 words, from chests).
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
// 🗝️ Boss key (chest item): a minion fight on demand, from the hub.
function useBossKey() {
  if (!S.quests || !(S.quests.keys > 0)) return;
  const deck = minionDeckPick();
  if (!deck) { showCelebrateToast("🗝️", "No minion yet", `Meet ${MINION_WORDS} words of a deck first`); return; }
  S.quests.keys--;
  logEvent("boss_key", { deck });
  saveState();
  startMinion(deck, () => openGamesHub());
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
      <small>${rec.wins ? `Defeated ${rec.wins}× · the whole deck${rec.minions ? ` · ⚔️ ${rec.minions} minion${rec.minions > 1 ? "s" : ""}` : ""}` : ok ? `All ${deckBossHp(deckId)} words · no mistakes (or bring up to ❤️ ×${typeof deckHeartLimit === "function" ? deckHeartLimit(deckBossHp(deckId)) : 0})` : `Unlocks when all ${getDeck(deckId).words.length} words are met (${met} so far)${rec.minions ? ` · ⚔️ ${rec.minions} minion${rec.minions > 1 ? "s" : ""} beaten` : ""}`}</small></span>
    ${ok ? `<button class="g-sec-btn" onclick="startDeckBoss('${deckId}')">${rec.wins ? "Rematch" : "Fight"} ⚔️</button>` : ""}
  </div>`;
}
async function startDeckBoss(deckId) {
  const pool = deckMetWords(deckId);
  if (!deckBossReady(deckId)) { showCelebrateToast("🔒", "👑 Deck boss", `Meet all ${deckBossHp(deckId)} words of this deck first (${pool.length} so far)`); return; }
  // ❤️ Boss hearts (chest loot): bring up to 1 per 20 words — each one
  // forgives a mistake; losing the fight spends them all.
  const owned = (S.quests && S.quests.hearts) || 0;
  const bring = Math.min(owned, typeof deckHeartLimit === "function" ? deckHeartLimit(deckBossHp(deckId)) : 0);
  let use = 0;
  if (bring > 0) {
    const pick = await heartsChoice(bring, owned, deckHeartLimit(deckBossHp(deckId)));
    if (pick === null) return; // closed: no fight
    use = pick;
  }
  const opts = { pool, size: "full", bossMode: "deck", deck: deckId, bring: use };
  // 💀 Sudden death would leave the hearts you brought unused: with
  // hearts, the only twist a deck boss rolls is 🌟 Golden words.
  if (use) {
    let seen = true; try { seen = localStorage.getItem("gv_game_intro_boss") === "1"; } catch (e) {}
    opts.twist = seen && S.games.twists !== false && Math.random() < TWIST_CHANCE ? "golden" : null;
  }
  launchGame("boss", opts);
}
// Bring the hearts, fight flawless, or close (resolves null: no fight).
function heartsChoice(bring, owned, limit) {
  return new Promise(resolve => {
    const old = document.getElementById("hearts-choice"); if (old) old.remove();
    const m = document.createElement("div");
    m.className = "modal-overlay"; m.id = "hearts-choice";
    m.innerHTML = `<div class="modal-sheet confirm-sheet" role="dialog" aria-modal="true" aria-labelledby="hc-title">
      <div class="modal-title" id="hc-title">Bring ❤️ ×${bring}?</div>
      <div class="modal-sub">Each heart forgives one mistake (this deck allows ${limit}, you have ${owned}). Hearts used are gone — and if the boss wins, every heart you brought is lost.</div>
      <div class="modal-actions">
        <button class="modal-btn secondary" id="hc-no">Fight flawless</button>
        <button class="modal-btn primary" id="hc-yes">⚔️ Fight with ❤️ ×${bring}</button>
      </div></div>`;
    const done = v => { document.removeEventListener("keydown", key, true); m.remove(); resolve(v); };
    const key = e => { if (e.key === "Escape") { e.preventDefault(); e.stopPropagation(); done(null); } };
    document.addEventListener("keydown", key, true);
    m.onclick = e => { if (e.target === m) done(null); };
    document.body.appendChild(m);
    m.querySelector("#hc-no").onclick = () => done(0);
    m.querySelector("#hc-yes").onclick = () => done(bring);
    setTimeout(() => m.querySelector("#hc-yes").focus(), 50);
  });
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
// Games hub: one row for all bosses — the world boss's health and how
// many deck bosses are ready — opening the Bosses screen.
function bossSummaryRowHtml() {
  const W = worldBossState();
  const ready = deckBossesAvailable().filter(id => !(S.games.bestiary[id] || {}).wins).length;
  return `<button class="g-row" onclick="renderBestiary('games')">
    <span class="g-row-icon">⚔️</span>
    <span class="g-row-main"><b>Bosses</b>
      <small>${W.icon} ${W.defeated ? "World boss beaten ✓" : `<span class="g-mini-hp"><i style="width:${Math.round(W.hp / W.max * 100)}%"></i></span> ${W.hp}/${W.max}`}${ready ? ` · ${ready} deck boss${ready > 1 ? "es" : ""} ready` : ""}${S.quests && S.quests.keys > 0 ? ` · 🗝️ ${S.quests.keys}` : ""}</small></span>
    <span class="set-chev" aria-hidden="true">›</span>
  </button>`;
}
// ⚔️ Bosses: the world boss, minion keys, then every deck's boss as a
// small tile per level (the level you're on is open). Tap a tile for
// its details and Fight.
let _bestiaryFrom = "";
function renderBestiary(from) {
  if (from !== undefined) _bestiaryFrom = from;
  showGameScreen();
  if (typeof logScreen === "function") logScreen("bestiary");
  const W = worldBossState();
  const total = vocabGroups().reduce((s, g) => s + g.decks.length, 0);
  const beaten = Object.values(S.games.bestiary).filter(r => r.wins).length;
  // Open the level you're on: the first with an unbeaten boss and met
  // words — or simply the first level.
  const levels = vocabGroups();
  const cur = Math.max(0, levels.findIndex(g => g.decks.some(d => !(S.games.bestiary[d.id] || {}).wins && deckMetWords(d.id).length > 0)));
  const groups = levels.map((g, gi) => {
    const won = g.decks.filter(d => (S.games.bestiary[d.id] || {}).wins).length;
    const open = gi === cur;
    const tiles = g.decks.map(d => {
      const b = deckBoss(d.id), rec = S.games.bestiary[d.id] || {};
      const known = rec.wins > 0, ready = deckBossReady(d.id), seen = known || ready || rec.minions;
      return `<button class="bst-tile ${known ? "won" : ready ? "ready" : "locked"}" onclick="openBossSheet('${d.id}')" aria-label="${seen ? escapeHtml(b.name) : "Unknown boss"} · ${escapeHtml(d.name)}">
        <span class="bst-icon">${seen ? b.icon : "❔"}</span>
        <span class="bst-badge">${known ? "👑" : ready ? "⚔️" : ""}</span>
      </button>`;
    }).join("");
    return `<details class="bst-level" ${open ? "open" : ""}><summary><span>${g.icon} ${escapeHtml(g.name)}</span><small>${won} / ${g.decks.length} beaten</small></summary><div class="bst-grid">${tiles}</div></details>`;
  }).join("");
  const back = _bestiaryFrom === "games" ? "openGamesHub(null)" : _bestiaryFrom === "journey" ? "renderJourney()" : "";
  document.getElementById("main-screen").innerHTML = `<div class="screen">
    <div class="screen-top"><div class="screen-label">⚔️ Bosses · ${beaten}/${total}</div>${back ? `<button class="back-btn" onclick="${back}">← Back</button>` : backBtnHtml()}</div>
    <button class="boss-world ${W.defeated ? "done" : ""}" onclick="startWorldBoss()" ${W.defeated ? "disabled" : ""}>
      <span class="boss-world-icon">${W.icon}</span>
      <span class="boss-world-body"><b>World boss: ${escapeHtml(W.name)}</b>
        <span class="boss-world-bar"><i style="width:${Math.round(W.hp / W.max * 100)}%"></i></span>
        <small>${W.defeated ? "Defeated this week ✓ — a new one on Monday" : `HP ${W.hp}/${W.max} · chip away all week`}</small></span>
    </button>
    ${S.quests && S.quests.keys > 0 ? `<button class="boss-key-btn" onclick="useBossKey()">🗝️ Summon a minion <small>${S.quests.keys} key${S.quests.keys > 1 ? "s" : ""} · 10 words, 3 lives</small></button>` : ""}
    ${groups}
    <div class="p-sub" style="margin-top:12px">👑 A deck's boss unlocks once every word of it is met. One mistake and it escapes.</div>
  </div>`;
}
function openBossSheet(deckId) {
  const d = getDeck(deckId);
  if (!d) return;
  const b = deckBoss(deckId), rec = S.games.bestiary[deckId] || {};
  const met = deckMetWords(deckId).length, known = rec.wins > 0, ready = deckBossReady(deckId), seen = known || ready || rec.minions;
  openSheet({ title: "⚔️ Boss", html: `
    <div class="qs-head"><span class="qs-icon">${seen ? b.icon : "❔"}</span>
      <div><div class="qs-title">${seen ? escapeHtml(b.name) : "???"}</div><div class="qs-sub">${d.icon} ${escapeHtml(d.name)} · HP ${deckBossHp(deckId)}</div></div></div>
    <div class="qs-desc">${known ? `Beaten ${rec.wins}×${rec.minions ? ` · ${rec.minions} minion${rec.minions > 1 ? "s" : ""} defeated` : ""}. Fight it again for a rematch chest.`
      : ready ? "Every word of this deck is met — it's ready. The whole deck, one mistake and it escapes."
      : `Meet every word of this deck to unlock it: ${met} / ${d.words.length} so far.${rec.minions ? ` Its minions have shown up ${rec.minions}× already.` : ""}`}</div>
    ${ready ? `<button class="tc-start qs-play" onclick="closeSettings();startDeckBoss('${deckId}')">⚔️ Fight</button>`
      : `<div class="qs-prog"><span class="gm-q-bar"><i style="width:${Math.round(met / Math.max(1, d.words.length) * 100)}%"></i></span><b>${met} / ${d.words.length}</b></div>`}` });
}

// The ✗ / ✓ buttons of a Say-it boss round call in here.
let _bossSayGrade = null;
function bossSayGrade(v) { if (_bossSayGrade) _bossSayGrade(v); }

registerGame({
  id: "boss", name: "Boss Battle", icon: "👾", get skill() { return speakOn() ? "Recall out loud · counts for stages" : "Typed recall · counts for stages"; },
  inRuns: false, liveCredit: true, ranks: BOSS_RANKS, twists: ["sudden", "golden"],
  howTo: () => [speakOn() ? "Say each answer out loud and tap Show — every ✓ hits the boss, every miss costs a ❤️." : "Type each answer to hit the boss — every miss costs a ❤️."],
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
    // 👑 Deck boss: flawless — unless you brought ❤️ boss hearts, one
    // forgiven mistake each (spent as you make them). Minion: 3 lives.
    // A 💀 Sudden death twist added on the start card leaves them home.
    const bring = mode === "deck" && !ctx.sudden ? Math.max(0, Math.min(ctx.opts.bring || 0, (S.quests && S.quests.hearts) || 0)) : 0;
    const flawless = ctx.sudden || (mode === "deck" && !bring);
    const maxHearts = flawless ? 1 : mode === "deck" ? bring + 1 : mode === "minion" ? 3 : rp.hearts;
    let hearts = maxHearts, correct = 0, wrong = 0, combo = 0, maxCombo = 0, dealt = 0, typedOk = 0;
    const perWord = ctx.size === "full" && rp.timer ? rp.timer * ctx.timeScale : 0;
    let wordStart = 0;
    // Speak, don't spell: say it, Show, then ✗ / ✓ (say-it.js).
    const sayMode = speakOn();
    let revealed = false, shownAtMs = 0, revealAtMs = 0;
    sessionConsecutive = 0; // applyCorrect reads it for the best-combo record

    ctx.stage.innerHTML = `
      <div class="bb-arena" id="bb-arena">
        <div class="bb-boss" id="bb-boss">${boss.icon}</div>
        <div class="bb-name">${mode === "deck" ? "👑 " : ""}${escapeHtml(boss.name)}${mode === "world" ? " · 🌋 world boss" : mode === "deck" || mode === "minion" ? ` · ${escapeHtml(getDeck(ctx.opts.deck).name)}` : ""}</div>
        ${mode === "deck" ? `<div class="bb-rule">${bring ? `The whole deck — ❤️ ×${bring} brought, one per mistake` : "The whole deck — one mistake and it escapes"}</div>` : mode === "minion" ? `<div class="bb-rule">${MINION_WORDS} words · 3 lives</div>` : ""}
        <div class="bb-hp"><div class="bb-hp-fill" id="bb-hp"></div></div>
        <div class="bb-hp-label" id="bb-hp-label"></div>
      </div>
      <div class="word-display bb-prompt">
        <div class="english-word" id="bb-en"></div>
        <div class="word-hint" id="bb-hint"></div>
        ${sayMode ? `<div id="bb-steps"></div>` : ""}
      </div>
      <input type="text" class="german-input" id="bb-input" placeholder="type the answer…" ${sayMode ? `style="display:none" tabindex="-1"` : ""}
        autocomplete="off" autocorrect="off" autocapitalize="off" spellcheck="false" enterkeyhint="go"/>
      ${sayMode ? "" : accentBarHtml("bb-input")}
      <div class="bb-say" id="bb-say"></div>
      <div class="action-row" id="bb-actions">
        ${sayMode ? `<button class="g-big-btn say-show" id="bb-show">Show ▶</button>` : `<button class="check-btn" id="bb-attack">⚔️ Attack</button>`}
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
      if (mode === "deck") ctx.setLives(hearts - 1, maxHearts - 1); // spare hearts only
      else ctx.setLives(hearts, maxHearts);
      ctx.setBar(1 - hp / maxHp, "progress");
    };
    const show = () => {
      ctx.teach("");
      const w = queue[0];
      document.getElementById("bb-en").innerHTML = escapeHtml(gamePrompt(w)) + ctx.tag(w);
      document.getElementById("bb-hint").textContent = w.hint || "";
      input.value = "";
      input.className = "german-input";
      fb.innerHTML = "";
      if (sayMode) {
        revealed = false; shownAtMs = Date.now();
        document.getElementById("bb-steps").innerHTML = sayStepsHtml("word", w);
        document.getElementById("bb-say").innerHTML = "";
        document.getElementById("bb-actions").style.display = "";
      }
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
          if (typeof questQueueChest === "function") questQueueChest("world", "rare");
        }
      }
      if (mode === "deck" && won) {
        const rec = S.games.bestiary[ctx.opts.deck] || (S.games.bestiary[ctx.opts.deck] = { wins: 0 });
        rec.wins++; rec.last = todayISO(); rec.perfect = 1;
        // The 👑 Epic chest is a one-off per deck; a rematch win pays a
        // normal chest.
        if (typeof questQueueChest === "function") questQueueChest(rec.wins === 1 ? "boss" : "rematch", rec.wins === 1 ? "epic" : "common");
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
        note: mode === "world" ? (won ? "🌋 World boss defeated — a chest is waiting!" : hearts <= 0 ? "🌋 The world boss recovered — it's back to full HP." : `🌋 You dealt ${dealt} damage — the world boss has ${Math.max(0, hp)} HP left this week.`)
          : mode === "deck" ? (won ? `👑 ${boss.name} defeated — the whole deck${wrong ? ` (❤️ ×${wrong} used)` : ", flawless"}. ${(S.games.bestiary[ctx.opts.deck] || {}).wins > 1 ? "A rematch chest is waiting!" : "An Epic chest is waiting!"}`
            : `👑 ${boss.name} escaped. It's back to full strength${bring ? ` — the ❤️ ×${bring} you brought are spent` : ""}.`)
          : mode === "minion" && won ? `⚔️ Minion defeated — the 👑 ${deckBoss(ctx.opts.deck).name} still waits for the whole deck.` : "" });
    };

    const reveal = () => {
      if (!sayMode || revealed || ctx.busy || ctx.finished || ctx.paused || ctx.waiting || !queue.length) return;
      revealed = true; revealAtMs = Date.now();
      const w = queue[0];
      document.getElementById("bb-actions").style.display = "none";
      document.getElementById("bb-steps").innerHTML = "";
      document.getElementById("bb-say").innerHTML = sayRevealHtml(w, { noSentence: true, ask: "short" }) + sayGradeHtml("bossSayGrade", { close: false });
      speak(gameForm(w));
    };
    _bossSayGrade = v => { if (sayMode && revealed && !ctx.busy && !ctx.finished) attack(v !== true, v === true); };
    // said: true = ✓ Got it (the answer counts as right, no typing).
    const attack = (skip, said = false) => {
      if (ctx.waiting) { ctx.continueNow(); return; }
      if (ctx.busy || ctx.finished || !queue.length) return;
      if (sayMode && !revealed && !skip) { reveal(); return; }
      const w = queue[0];
      const val = input.value;
      if (!sayMode && !skip && !val.trim()) {
        // An accidental Enter on an empty box shouldn't cost a heart.
        shakeEl(input);
        ctx.say("Type an answer — or tap “Don't know”.");
        return;
      }
      const ok = sayMode ? said : !skip && (typedCorrect(val, w) || bossSynonyms(w).some(x => typedCorrect(val, x)));
      const near = !sayMode && !ok && !skip && isNearMiss(val, [w[WORD_KEY], gameForm(w)]);
      if (sayMode) document.getElementById("bb-say").innerHTML = "";
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
          applyCorrect(ws, { w, kind: sayMode ? sayKind(shownAtMs, revealAtMs) : "recall" });
          questEvent("answer", { mode: mode === "minion" ? "path" : "boss", ok: true, typed: true, w, said: sayMode });
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
        const cost = flawless ? hearts : mode === "deck" ? 1 : ctx.cost(w);
        wrong++; hearts = Math.max(0, hearts - cost); combo = ctx.comboAfterMiss(combo, w);
        // A brought ❤️ is spent the moment it saves you (so quitting can't
        // dodge it); the last miss — no heart left — loses the fight.
        if (mode === "deck" && bring && hearts > 0 && S.quests.hearts > 0) { S.quests.hearts--; logEvent("heart_used", { deck: ctx.opts.deck }); }
        if (!w.anki) { applyWrong(getWS(w.deckId, w.idx), { w }); questEvent("answer", { mode: mode === "minion" ? "path" : "boss", ok: false, typed: true, w }); }
        sessionConsecutive = 0;
        saveState();
        ctx.missed(w);
        queue.push(queue.shift());
        input.classList.add("wrong");
        fb.innerHTML = `<span class="bb-bad">${skip || sayMode ? "✗" : `<s>${escapeHtml(val.trim())}</s> →`} <strong>${colorArticleHtml(w[WORD_KEY])}</strong></span>
          <button class="audio-btn" ${speakBtnAttrs(w[WORD_KEY])} aria-label="Listen">🔊</button>`;
        if (!revealed) speak(w[WORD_KEY]);
        const arena = document.getElementById("bb-arena");
        arena.classList.remove("hurt"); void arena.offsetWidth; arena.classList.add("hurt");
        shakeEl(document.getElementById("game-screen"));
        playMiss(); haptic(cost < 1 ? "miss" : "heavy");
        ctx.setCombo(combo);
        ctx.say(`Ouch — it was ${w[WORD_KEY]}${cost < 1 && !ctx.sudden ? " (new word: half a heart)" : ""}`);
        updateHp();
        ctx.teach(wordLessonHtml(w), "bad");
        if (hearts <= 0) ctx.waitContinue(() => end(false), "See results");
        else ctx.waitContinue(show);
      }
    };

    // Buttons must not take focus from the input — on phones that would
    // close the keyboard between every word.
    ["bb-attack", "bb-skip", "bb-retreat"].forEach(id => { const b = document.getElementById(id); if (b && !sayMode) gListen(b, "pointerdown", e => e.preventDefault()); });
    if (sayMode) {
      document.getElementById("bb-show").onclick = reveal;
      sayKeys = { root: "bb-arena", close: false, state: () => ctx.waiting ? "done" : !revealed ? "prompt" : "revealed",
        reveal, grade: v => _bossSayGrade(v), next: () => { if (ctx.waiting) ctx.continueNow(); } };
    } else document.getElementById("bb-attack").onclick = () => { attack(false); input.focus({ preventScroll: true }); };
    document.getElementById("bb-skip").onclick = () => { attack(true); if (!sayMode) input.focus({ preventScroll: true }); };
    const rt = document.getElementById("bb-retreat");
    if (rt) rt.onclick = () => { if (!ctx.busy && !ctx.finished) end(false); };
    gListen(input, "keydown", e => { if (e.key === "Enter") { e.preventDefault(); attack(false); } });
    if (perWord) gInterval(() => {
      if (ctx.busy || ctx.paused || ctx.finished || !queue.length || (sayMode && revealed)) return;
      const left = Math.max(0, perWord - (ctx.clock.elapsed() - wordStart));
      ctx.setClock(Math.ceil(left / 1000) + "s", left < 4000);
      if (left <= 0) { input.value = ""; attack(true); }
    }, 200);

    ctx.setScore(0);
    updateHp();
    show();
  },
});
