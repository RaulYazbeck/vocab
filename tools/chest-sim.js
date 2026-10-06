// Chest economy simulator — run with `node tools/chest-sim.js`.
// Mirrors CHEST_ODDS / CHEST_LOOT / rollRarity (js/quests.js) and every
// chest source, pity timers included, for a player who finishes all
// quests every day. Also estimates how long the collection (cosmetics +
// idiom cards) takes to complete. Edit the assumptions to see the rates move.

const A = {
  days: 400000,
  events: 4,          // finished Today sessions + game rounds a day (each rolls 🍀 lucky)
  earlyCore: 0.10,    // days the "Core before noon" quest makes the daily chest Rare
  double: 0.25,       // ✨ double-reward quest (one quest a day pays a chest)
  flash: 0.20 * 0.8,  // ⚡ flash quest offered (20%) × finished in time
  minion: 0.10,       // ⚔️ surprise minion offered and beaten
  deckBoss: 0.10,     // 👑 first win over a deck's boss: Epic chest (~95 decks)
  rematch: 0.05,      // 👑 rematch wins a day: a normal chest
  keyWin: 0.7,        // 🗝️ minion summoned with a key and beaten
  saga: 0.85,         // 📜 weekly saga finished (gives an Epic cosmetic)
};
// Keep in sync with js/quests.js.
const ODDS = { legendary: 1.5, epic: 8, rare: 28, pityRare: 3, pityEpic: 10, pityLeg: 40 }; // % / chests
const LOOT = {
  common:    { xp: 17,  items: [[0.38, "reroll"], [0.15, "boost"], [0.02, "shield"], [0.01, "key"], [0.05, "heart"]] },
  rare:      { xp: 42,  items: [[0.19, "reroll"], [0.175, "boost"], [0.10, "shield"], [0.11, "key"], [0.16, "heart"]] },
  epic:      { xp: 83,  items: [[0.12, "freeze"], [0.15, "heart"]], coll: 1 },  // coll: chance of a collectible
  legendary: { xp: 208, items: [[0.37, "freeze"]], coll: 1 },
};
const CAP_XP = { reroll: 13, freeze: 42, shield: 25 }; // what an item past its cap turns into
// Collection sizes (js/quests.js COSMETICS, js/idioms.js — per language).
const POOL = { epicCos: 36, legCos: 10, epicIdiom: 64, legIdiom: 16 };
const R = ["common", "rare", "epic", "legendary"];

// One simulated player. `onChest(rar, src)` sees every chest.
function play(days, onChest, onDay = () => {}) {
  const C = { sinceRare: 0, sinceEpic: 0, sinceLeg: 0 };
  let lucky = 0, keys = 0;
  const roll = min => {
    const r = Math.random() * 100;
    let rar = r < ODDS.legendary ? "legendary" : r < ODDS.legendary + ODDS.epic ? "epic" : r < ODDS.legendary + ODDS.epic + ODDS.rare ? "rare" : "common";
    if (C.sinceLeg >= ODDS.pityLeg - 1) rar = "legendary";
    else if (C.sinceEpic >= ODDS.pityEpic - 1 && R.indexOf(rar) < 2) rar = "epic";
    else if (C.sinceRare >= ODDS.pityRare - 1 && R.indexOf(rar) < 1) rar = "rare";
    if (R.indexOf(rar) < R.indexOf(min)) rar = min;
    const i = R.indexOf(rar);
    C.sinceRare = i >= 1 ? 0 : C.sinceRare + 1;
    C.sinceEpic = i >= 2 ? 0 : C.sinceEpic + 1;
    C.sinceLeg = i === 3 ? 0 : C.sinceLeg + 1;
    return rar;
  };
  const open = (min, src) => { if (onChest(roll(min), src) === "key") keys++; };
  for (let d = 0; d < days; d++) {
    const wd = d % 7; // 0 Mon … 6 Sun
    open(Math.random() < A.earlyCore ? "rare" : "common", "daily");
    if (Math.random() < A.double) open("common", "double");
    if (Math.random() < A.flash) open("common", "flash");
    if (wd >= 5) open("rare", "weekend");
    if (wd === 4) open("epic", "weekly");        // 5th full day of the week
    if (wd === 0) open("rare", "world");         // world boss, once a week
    if (Math.random() < A.minion) open("common", "minion");
    if (Math.random() < A.deckBoss) open("epic", "deck boss");
    if (Math.random() < A.rematch) open("common", "rematch");
    while (keys > 0) { keys--; if (Math.random() < A.keyWin) open("common", "key minion"); }
    for (let e = 0; e < A.events; e++) { lucky++; if (lucky >= 7 || Math.random() < 0.1) { lucky = 0; open("common", "lucky"); } }
    if (onDay(d, wd) === "stop") return d + 1;
  }
  return days;
}

function rates(capped) {
  const t = {}; const add = (k, n = 1) => { t[k] = (t[k] || 0) + n; };
  const bySrc = {};
  play(A.days, (rar, src) => {
    add("chests"); add("src " + src); add(rar);
    bySrc[src] = bySrc[src] || { n: 0, common: 0, rare: 0, epic: 0, legendary: 0 };
    bySrc[src].n++; bySrc[src][rar]++;
    const L = LOOT[rar];
    add("xp", L.xp);
    if (L.coll && Math.random() < L.coll) add("collectible");
    let x = Math.random();
    for (const [p, it] of L.items) {
      if (x >= p) { x -= p; continue; }
      if (capped && CAP_XP[it]) { add("xp", CAP_XP[it]); add(it + " → XP (cap)"); return; }
      add(it); return it;
    }
  });
  console.log(capped ? "\n== 🎟️ rerolls (5), 🧊 freezes (2) and 🛡️ shields (2) all at their cap ==" : "== below the caps ==");
  for (const k of Object.keys(t).sort()) {
    const per = t[k] / A.days;
    const every = ["reroll", "boost", "shield", "key", "freeze", "heart"].includes(k) ? `  ≈ one every ${(1 / per).toFixed(1)} days` : "";
    console.log(`${k.padEnd(22)} ${per.toFixed(3)} /day${every}`);
  }
  if (capped) return;
  console.log("\n== rarity of each chest (guarantees included) ==");
  console.log("source".padEnd(12), "common  rare    epic    legendary");
  for (const [src, b] of Object.entries(bySrc))
    console.log(src.padEnd(12), R.map(r => (b[r] / b.n * 100).toFixed(1).padStart(5) + "%").join("  "));
}

// Days until every cosmetic and idiom card is owned (same fallbacks as
// grantCollectible / grantCosmetic: an empty Legendary pool hands out an
// Epic piece; the saga takes an Epic cosmetic, else a Legendary one).
function collection(runs = 2000) {
  const out = [];
  for (let k = 0; k < runs; k++) {
    const P = { ...POOL };
    const left = () => P.epicCos + P.legCos + P.epicIdiom + P.legIdiom;
    const take = (cos, idiom) => {
      if (!P[cos] && !P[idiom]) return false;
      if (P[idiom] && Math.random() < P[idiom] / (P[idiom] + P[cos])) P[idiom]--; else P[cos]--;
      return true;
    };
    const days = play(3000, (rar, src) => {
      const L = LOOT[rar];
      if (!L.coll || Math.random() >= L.coll) return;
      if (rar === "legendary") { if (!take("legCos", "legIdiom")) take("epicCos", "epicIdiom"); }
      else take("epicCos", "epicIdiom");
    }, (d, wd) => {
      if (wd === 6 && Math.random() < A.saga) { if (P.epicCos) P.epicCos--; else if (P.legCos) P.legCos--; }
      return left() ? "" : "stop";
    });
    out.push(days);
  }
  out.sort((a, b) => a - b);
  const m = d => `${d} days (${(d / 30.4).toFixed(1)} months)`;
  console.log(`\n== collection (${Object.values(POOL).reduce((a, b) => a + b)} pieces) ==`);
  console.log(`median ${m(out[runs >> 1])} · luckiest 10% ${m(out[Math.floor(runs * 0.1)])} · unluckiest 10% ${m(out[Math.floor(runs * 0.9)])}`);
}

rates(false);
rates(true);
collection();
