// Chest economy simulator — run with `node tools/chest-sim.js`.
// Mirrors CHEST_LOOT / rollRarity (js/quests.js) and every chest source,
// pity timers included, for a player who finishes all quests every day.
// Edit the assumptions below to see how the rates move.

const A = {
  days: 400000,
  events: 4,          // finished Today sessions + game rounds a day (each rolls 🍀 lucky)
  earlyCore: 0.10,    // days the "Core before noon" quest makes the daily chest Rare
  double: 0.25,       // ✨ double-reward quest (one quest a day pays a chest)
  flash: 0.20 * 0.8,  // ⚡ flash quest offered (20%) × finished in time
  minion: 0.10,       // ⚔️ surprise minion offered and beaten
  deckBoss: 0.07,     // 👑 deck-boss wins a day (rematches pay too)
  keyWin: 0.7,        // 🗝️ minion summoned with a key and beaten
};
const R = ["common", "rare", "epic", "legendary"];
const LOOT = {
  common:    { xp: 20,  items: [[0.35, "reroll"], [0.15, "boost"]] },
  rare:      { xp: 50,  items: [[0.28, "reroll"], [0.22, "boost"], [0.14, "shield"], [0.135, "key"]] },
  epic:      { xp: 100, items: [[0.10, "freeze"]], coll: true },
  legendary: { xp: 250, items: [[0.30, "freeze"]], coll: true },
};
const CAP_XP = { reroll: 15, freeze: 50, shield: 30 }; // what an item past its cap turns into

function run(capped) {
  const C = { sinceRare: 0, sinceEpic: 0, sinceLeg: 0 };
  const t = {}; const add = (k, n = 1) => { t[k] = (t[k] || 0) + n; };
  let lucky = 0, keys = 0; const bySrc = {};
  const roll = min => {
    const r = Math.random() * 100;
    let rar = r < 2 ? "legendary" : r < 12 ? "epic" : r < 40 ? "rare" : "common";
    if (C.sinceLeg >= 29) rar = "legendary";
    else if (C.sinceEpic >= 9 && R.indexOf(rar) < 2) rar = "epic";
    else if (C.sinceRare >= 2 && R.indexOf(rar) < 1) rar = "rare";
    if (R.indexOf(rar) < R.indexOf(min)) rar = min;
    const i = R.indexOf(rar);
    C.sinceRare = i >= 1 ? 0 : C.sinceRare + 1;
    C.sinceEpic = i >= 2 ? 0 : C.sinceEpic + 1;
    C.sinceLeg = i === 3 ? 0 : C.sinceLeg + 1;
    return rar;
  };
  const open = (min, src) => {
    add("chests"); add("src " + src);
    const rar = roll(min), L = LOOT[rar];
    bySrc[src] = bySrc[src] || { n: 0, common: 0, rare: 0, epic: 0, legendary: 0 };
    bySrc[src].n++; bySrc[src][rar]++;
    add(rar); add("xp", L.xp); if (L.coll) add("collectible");
    let x = Math.random();
    for (const [p, it] of L.items) {
      if (x >= p) { x -= p; continue; }
      if (capped && CAP_XP[it]) { add("xp", CAP_XP[it]); add(it + " → XP (cap)"); }
      else { add(it); if (it === "key") keys++; }
      break;
    }
  };
  for (let d = 0; d < A.days; d++) {
    const wd = d % 7; // 0 Mon … 6 Sun
    open(Math.random() < A.earlyCore ? "rare" : "common", "daily");
    if (Math.random() < A.double) open("common", "double");
    if (Math.random() < A.flash) open("common", "flash");
    if (wd >= 5) open("rare", "weekend");
    if (wd === 4) open("epic", "weekly");        // 5th full day of the week
    if (wd === 0) open("epic", "world");         // world boss, once a week
    if (Math.random() < A.minion) open("common", "minion");
    if (Math.random() < A.deckBoss) open("epic", "deck boss");
    while (keys > 0) { keys--; if (Math.random() < A.keyWin) open("common", "key minion"); }
    for (let e = 0; e < A.events; e++) { lucky++; if (lucky >= 7 || Math.random() < 0.1) { lucky = 0; open("common", "lucky"); } }
  }
  console.log(capped ? "\n== 🎟️ rerolls (5), 🧊 freezes (2) and 🛡️ shields (2) all at their cap ==" : "== below the caps ==");
  for (const k of Object.keys(t).sort()) {
    const per = t[k] / A.days;
    const every = ["reroll", "boost", "shield", "key", "freeze"].includes(k) ? `  ≈ one every ${(1 / per).toFixed(1)} days` : "";
    console.log(`${k.padEnd(22)} ${per.toFixed(3)} /day${every}`);
  }
  if (capped) return;
  console.log("\n== rarity of each chest (guarantees included) ==");
  console.log("source".padEnd(12), "common  rare    epic    legendary");
  for (const [src, b] of Object.entries(bySrc))
    console.log(src.padEnd(12), R.map(r => (b[r] / b.n * 100).toFixed(1).padStart(5) + "%").join("  "));
}
run(false);
run(true);
