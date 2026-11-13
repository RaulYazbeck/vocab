// ── COURSE PACK · Stage 0 · Sounds and spelling ──
// Book: chapter 1, "Pronunciation" (Übung 1•1). Our own sheet and items;
// the book gives the structure only. No listening here (PLAN.md §2): the
// sound is described, and the spelling is what gets typed.
cxPack({
  id: "s0-sounds",
  sections: {
    "s0.sounds": {
      testout: { n: 8, miss: 1 },
      rules: {
        "snd.uml": "ä, ö, ü and ß",
        "snd.ch": "sch, sp, st and ch",
        "snd.pair": "ei, ie, eu, au",
        "snd.end": "b, d, g at the end; v, w, z, j",
      },
      sheets: [
        { id: "cx.snd1", title: "Sounds and spelling", qn: 3,
          struct: [["ei", "verb"], ["→ «eye»", "mid"], ["ie", "end"], ["→ «ee»", "mid"]],
          why: "German is spelled almost exactly as it sounds. Learn these few letter groups and you can read, and write, nearly any word.",
          rid: ["snd.uml", "snd.ch", "snd.pair", "snd.end"],
          rules: [
            "**ä, ö, ü** are vowels of their own: **ä** like the e in *bed* (spät), **ö** an *e* said with rounded lips (schön), **ü** an *ee* said with rounded lips (Tür). **ß** is a sharp *ss* (Straße); Swiss spelling writes ss (Strasse).",
            "**sch** sounds like *sh* (Schule), and **sp, st** at the start of a word or word part sound like *shp, sht* (Sport, ver**st**ehen). **ch** is rough after a, o, u, au (Buch, auch) and soft everywhere else (ich, Milch).",
            "**ei** sounds like *eye* and **ie** like *ee*: say the English name of the second letter (mein, vier). **eu** and **äu** sound like *oy* (heute, Häuser), **au** like *ow* (Haus).",
            "At the end of a word, **b, d, g** sound like **p, t, k**: gelb, Hund, Tag. **v** sounds like *f* (Vater), **w** like *v* (Wasser), **z** like *ts* (Zug), **j** like *y* (ja).",
          ],
          table: { head: ["Letters", "Sounds like", "Example"], rows: [
            ["ä · ö · ü", "e in *bed* · e with rounded lips · ee with rounded lips", "spät · schön · müde"],
            ["ß", "a sharp ss (Swiss spelling: ss)", "Straße · heiß"],
            ["ei · ie", "eye · ee", "mein · vier"],
            ["eu / äu · au", "oy · ow", "heute · Haus"],
            ["sch · sp- · st-", "sh · shp · sht", "Schule · Sport · Stunde"],
            ["ch", "rough after a, o, u, au; soft elsewhere", "Buch · ich"],
            ["-b -d -g", "p t k", "gelb · Hund · Tag"],
            ["v · w · z · j", "f · v · ts · y", "viel · wo · Zug · ja"],
          ] },
          ex: [
            ["**Heute** ist es **heiß** — **zwei** Grad mehr als **gestern**.", "Today it's hot — two degrees more than yesterday."],
            ["Der **Zug** fährt um **vier** Uhr.", "The train leaves at four."],
            ["Der **Hund** schläft den ganzen **Tag**.", "The dog sleeps all day."],
            ["Wir **sprechen** mit der **Schülerin**.", "We're talking with the pupil."],
          ],
          trap: "**ei** and **ie** are easy to mix up: **Wein** (wine, said *vine*) is not **Wien** (Vienna, said *veen*). The second letter gives the sound: ie is *ee*, ei is *eye*.",
          quiz: [
            { at: "r1", k: "pick", q: "**ü** (Tür, müde) is said like…", o: ["ee, with round lips", "the u in *but*", "the oo in *food*"], a: 0, why: "Round your lips as for *oo*, but say *ee*." },
            { at: "r1", k: "pick", q: "Which word has the sharp **ß**?", o: ["Straße", "Strase", "Strabe"], a: 0, why: "A sharp ss after a long vowel is written **ß** (Swiss: ss): Straße." },
            { at: "r2", k: "pick", q: "**Sp**ort, **St**unde — the start sounds like…", o: ["shp, sht", "sp, st", "sb, sd"], a: 0, why: "At the start of a word, sp and st sound like *shp* and *sht*." },
            { at: "r2", k: "pick", q: "In **ich** the ch is…", o: ["soft, as in *huge*", "rough, as in *loch*", "a k"], a: 0, why: "After i (not after a, o, u, au) the ch is soft." },
            { at: "r3", k: "pick", q: "**vier** (four) sounds like…", o: ["*feer*", "*fire*", "*veer*"], a: 0, why: "v sounds like f, and ie like ee: *feer*." },
            { at: "r3", k: "type", cx: true, q: "ei or ie? dr___ (three)", a: ["ei"], r: ["snd.pair"], why: "dr**ei** sounds like *dry*, and ei is *eye*." },
            { at: "r4", k: "pick", q: "**Hund** ends with the sound…", o: ["t", "d", "nd as in *hand*"], a: 0, why: "A d at the end of a word sounds like t." },
            { at: "r4", k: "pick", q: "**W**asser starts like English…", o: ["v", "w", "f"], a: 0, why: "German w sounds like English v." },
            { at: "table", k: "pick", q: "**eu** in *heute* sounds like…", o: ["oy", "you", "ay"], a: 0, why: "eu and äu both sound like *oy*." },
            { at: "trap", k: "pick", q: "Wine is…", o: ["Wein", "Wien"], a: 0, why: "ei sounds like *eye*, so Wein is said *vine*." },
            { at: "trap", k: "pick", q: "Vienna is…", o: ["Wien", "Wein"], a: 0, why: "ie sounds like *ee*, so Wien is said *veen*." },
          ] },
      ],
      drills: [
        // ── Übung 1•1: match the sound ──
        { id: "d1.1", ex: "1.1", t: "pick", title: "How does it sound?", how: "Pick the sound of the letters in bold.", items: [
          { q: "**V**orname — the V sounds like ___", o: ["f", "v", "w"], a: ["f"], r: ["snd.end"] },
          { q: "**Sp**iel — the sp sounds like ___", o: ["shp", "sp", "sb"], a: ["shp"], r: ["snd.ch"] },
          { q: "Br**ie**f — the ie sounds like ___", o: ["ee", "eye", "ay"], a: ["ee"], r: ["snd.pair"] },
          { q: "Gel**d** — the d at the end sounds like ___", o: ["t", "d"], a: ["t"], r: ["snd.end"] },
          { q: "Bu**ch** — the ch sounds ___", o: ["rough, as in loch", "soft, as in huge", "like k"], a: ["rough, as in loch"], r: ["snd.ch"] },
          { q: "**W**etter — the W sounds like ___", o: ["v", "w", "f"], a: ["v"], r: ["snd.end"] },
          { q: "**St**unde — the st sounds like ___", o: ["sht", "st", "ts"], a: ["sht"], r: ["snd.ch"] },
          { q: "Fr**eu**nd — the eu sounds like ___", o: ["oy", "you", "ay"], a: ["oy"], r: ["snd.pair"] },
          { q: "**Z**eitung — the Z sounds like ___", o: ["ts", "z", "s"], a: ["ts"], r: ["snd.end"] },
          { q: "Ta**g** — the g at the end sounds like ___", o: ["k", "g", "ch"], a: ["k"], r: ["snd.end"] },
          { q: "K**ü**che — the ü sounds like ___", o: ["ee with round lips", "oo", "the u in but"], a: ["ee with round lips"], r: ["snd.uml"] },
          { q: "Gr**ö**ße — the ö sounds like ___", o: ["e with round lips", "o", "oh-ee"], a: ["e with round lips"], r: ["snd.uml"] },
        ] },
        // ── our own: the letters you type ──
        { id: "dsnd.t", t: "type", title: "Write the missing letters", how: "Type the letters that fill the gap.", items: [
          { q: "v___r (four) — ei or ie?", a: ["ie"], r: ["snd.pair"] },
          { q: "zw___ (two) — ei or ie?", a: ["ei"], r: ["snd.pair"] },
          { q: "h___te (today) — eu or ei?", a: ["eu"], r: ["snd.pair"] },
          { q: "Fr___ (woman) — au or eu?", a: ["au"], r: ["snd.pair"] },
          { q: "___ule (school) — sch or sh?", a: ["sch"], r: ["snd.ch"] },
          { q: "Z___t (time) — ei or ie?", a: ["ei"], r: ["snd.pair"] },
          { q: "w___ (how) — ei or ie?", a: ["ie"], r: ["snd.pair"] },
          { q: "Fr___nd (friend) — eu or oi?", a: ["eu"], r: ["snd.pair"] },
          { q: "H___s (house) — au or ou?", a: ["au"], r: ["snd.pair"] },
          { q: "Mil___ (milk) — ch or sch?", a: ["ch"], r: ["snd.ch"] },
          { q: "___ön (beautiful) — sch or sh?", a: ["sch"], r: ["snd.ch"] },
        ] },
        // ── Production: write the word ──
        { id: "dp.snd", t: "translate", end: true, title: "Spell it", how: "Write it in German. The spelling counts.", items: [
          { q: "four", a: ["vier"], r: ["snd.pair"] },
          { q: "today", a: ["heute"], r: ["snd.pair"] },
          { q: "the street", a: ["die Straße"], r: ["snd.uml"] },
          { q: "the train", a: ["der Zug"], r: ["snd.end"] },
          { q: "the school", a: ["die Schule"], r: ["snd.ch"] },
          { q: "the friend (a man)", a: ["der Freund"], r: ["snd.pair"] },
          { q: "the day", a: ["der Tag"], r: ["snd.end"] },
          { q: "the kitchen", a: ["die Küche"], r: ["snd.uml", "snd.ch"] },
          { q: "the father", a: ["der Vater"], r: ["snd.end"] },
          { q: "to speak", a: ["sprechen"], r: ["snd.ch"] },
          { q: "white", a: ["weiß"], r: ["snd.uml", "snd.pair"] },
          { q: "beautiful", a: ["schön"], r: ["snd.uml", "snd.ch"] },
        ] },
      ],
    },
  },
});

cxCover({ "1.1": "d1.1" });
