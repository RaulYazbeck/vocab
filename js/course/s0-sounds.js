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
        "snd.end": "b d g at the end · v, w, z, j",
      },
      sheets: [
        { id: "cx.snd1", title: "Sounds and spelling", qn: 3,
          struct: [["ei", "verb"], ["→ «eye»", "mid"], ["ie", "end"], ["→ «ee»", "mid"]],
          why: "German is spelled the way it sounds: a handful of letter pairs and you can read — and write — almost any word.",
          rid: ["snd.uml", "snd.ch", "snd.pair", "snd.end"],
          rules: [
            "**ä ö ü** are vowels of their own: **ä** ≈ the e in *bed* (spät) · **ö** = say *e* with round lips (schön) · **ü** = say *ee* with round lips (Tür, müde). **ß** is a sharp *ss* after a long vowel, ei or au: Straße, heiß.",
            "**sch** = *sh* (Schule). **sp / st** at the start of a word or word part = *shp / sht* (Sport, Stunde, ver**st**ehen). **ch** after a, o, u, au is rough, as in *loch* (acht, Buch, auch) — anywhere else soft (ich, Milch, Küche).",
            "**ei** = *eye* (mein, drei) · **ie** = *ee* (wie, vier): say the **second** letter's English name. **eu / äu** = *oy* (heute, Häuser) · **au** = *ow* (Haus, Frau).",
            "At the end of a word **b d g** sound **p t k**: gelb, Hund, Tag. **v** = *f* (Vater, viel) · **w** = *v* (Wasser, wo) · **z** = *ts* (zehn, Zug) · **j** = *y* (ja, Juni).",
          ],
          table: { head: ["Letters", "Sounds like", "Example"], rows: [
            ["ä · ö · ü", "e in *bed* · e with round lips · ee with round lips", "spät · schön · müde"],
            ["ß", "a sharp ss", "Straße · heiß"],
            ["ei · ie", "eye · ee", "mein · vier"],
            ["eu / äu · au", "oy · ow", "heute · Haus"],
            ["sch · sp- · st-", "sh · shp · sht", "Schule · Sport · Stunde"],
            ["ch", "rough after a o u au, else soft", "Buch · ich"],
            ["-b -d -g", "p t k", "gelb · Hund · Tag"],
            ["v · w · z · j", "f · v · ts · y", "viel · wo · Zug · ja"],
          ] },
          ex: [
            ["**Heute** ist es **heiß** — **zwei** Grad mehr als **gestern**.", "Today it's hot — two degrees more than yesterday."],
            ["Der **Zug** fährt um **vier** Uhr.", "The train leaves at four."],
            ["Der **Hund** schläft den ganzen **Tag**.", "The dog sleeps all day."],
            ["Wir **sprechen** mit der **Schülerin**.", "We're talking with the pupil."],
          ],
          trap: "**ei** and **ie** are the classic mix-up: **Wein** (wine, *vine*) ≠ **Wien** (Vienna, *veen*). Read the **second** letter: ie → *ee*, ei → *eye*.",
          quiz: [
            { at: "r1", k: "pick", q: "**ü** (Tür, müde) is said like…", o: ["ee, with round lips", "the u in *but*", "the oo in *food*"], a: 0, why: "Lips round as for *oo*, tongue saying *ee*." },
            { at: "r1", k: "pick", q: "Which word has the sharp **ß**?", o: ["Straße", "Strase", "Strabe"], a: 0, why: "A long vowel, then a sharp ss sound → **ß**: Straße." },
            { at: "r2", k: "pick", q: "**Sp**ort, **St**unde — the start sounds like…", o: ["shp, sht", "sp, st", "sb, sd"], a: 0, why: "sp / st at the start of a word: *shp / sht*." },
            { at: "r2", k: "pick", q: "In **ich** the ch is…", o: ["soft, as in *huge*", "rough, as in *loch*", "a k"], a: 0, why: "After i (not a, o, u, au) the ch is soft." },
            { at: "r3", k: "pick", q: "**vier** (four) sounds like…", o: ["*feer*", "*fire*", "*veer*"], a: 0, why: "v = f, ie = ee → *feer*." },
            { at: "r3", k: "type", cx: true, q: "ei or ie? dr___ (three)", a: ["ei"], r: ["snd.pair"], why: "*dry* → dr**ei**." },
            { at: "r4", k: "pick", q: "**Hund** ends with the sound…", o: ["t", "d", "nd as in *hand*"], a: 0, why: "A d at the end sounds t." },
            { at: "r4", k: "pick", q: "**W**asser starts like English…", o: ["v", "w", "f"], a: 0, why: "w = v." },
            { at: "table", k: "pick", q: "**eu** in *heute* sounds like…", o: ["oy", "you", "ay"], a: 0, why: "eu / äu = oy." },
            { at: "trap", k: "pick", q: "Wine is…", o: ["Wein", "Wien"], a: 0, why: "ei = eye: *vine*." },
            { at: "trap", k: "pick", q: "Vienna is…", o: ["Wien", "Wein"], a: 0, why: "ie = ee: *veen*." },
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
        { id: "dp.snd", t: "translate", end: true, title: "Spell it", how: "Write it in German — the spelling counts.", items: [
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
