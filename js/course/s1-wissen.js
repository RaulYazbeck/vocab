// ── COURSE PACK · Stage 1 · wissen or kennen? ──
// Book: chapter 18 (Übung 18•1–18•3). One sheet: wissen's forms (like a
// modal: ich weiß, er weiß), wissen for a fact, kennen for a person, a
// place, a thing. The chapter's last exercise (18•4) practises commands
// in the du, ihr and Sie forms — it is mirrored with the A1 verb lesson's
// commands (s0-verbs.js, d18.4).
cxPack({
  id: "s1-wissen",
  sections: {
    "s1.wissen": {
      rules: {
        "wk.forms": "ich weiß · du weißt · er weiß · wir wissen · ihr wisst",
        "wk.fact": "wissen: a fact — wo, wie, dass … · das, es, nichts",
        "wk.kennen": "kennen: a person, a place, a thing you've met",
      },
      sheets: [
        { id: "cx.wk1", title: "wissen or kennen?", qn: 3,
          struct: [["wissen", "verb"], ["+ wo · wie · dass · das", "mid"], ["kennen", "aux"], ["+ a person, a place", "thing"]],
          why: "English has one *know*; German has two. **wissen** is knowing a fact — what, where, that something is so. **kennen** is knowing a person, a place or a thing because you've met it.",
          rid: ["wk.forms", "wk.fact", "wk.kennen"],
          rules: [
            "**wissen** is irregular, like a modal: ich **weiß** · du **weißt** · er **weiß** · wir **wissen** · ihr **wisst** · sie **wissen**. ich and er are the same — no -t.",
            "**wissen** = know a **fact** — mostly before wo, wie, wann, was, dass…, or with das, es, nichts, alles: Ich **weiß**, wo der Bahnhof ist. · **Weißt** du, wie spät es ist? · Das **weiß** ich nicht.",
            "**kennen** = know a **person, a place, a thing** — you've met it, you're familiar with it; a noun follows: Ich **kenne** deinen Bruder. · **Kennst** du Luzern? · Wir **kennen** das Restaurant. It's regular: ich kenne, du kennst, er kennt.",
          ],
          table: { head: ["", "wissen", "kennen"], rows: [
            ["ich", "**weiß**", "kenne"], ["du", "**weißt**", "kennst"], ["er · sie · es", "**weiß**", "kennt"],
            ["wir", "wissen", "kennen"], ["ihr", "wisst", "kennt"], ["sie · Sie", "wissen", "kennen"],
          ] },
          ex: [
            ["**Weißt** du, wann der Zug fährt?", "Do you know when the train leaves?"],
            ["Ich **kenne** eine gute Bäckerei in der Nähe.", "I know a good bakery nearby."],
            ["Das **weiß** ich leider nicht.", "Unfortunately I don't know that."],
            ["**Kennen** Sie Frau Meier? — Ja, ich **weiß** sogar, wo sie wohnt.", "Do you know Ms Meier? — Yes, I even know where she lives."],
          ],
          trap: "A language is neither: Er **kann** gut Deutsch (or: Er spricht gut Deutsch). And it's **ich weiß** — never ~~ich weiße~~, never ~~er weißt~~.",
          quiz: [
            { at: "r1", k: "pick", q: "Er ___ es nicht.", o: ["weiß", "weißt", "wisst"], a: 0, why: "er = ich, no ending: **weiß**." },
            { at: "r1", k: "type", cx: true, q: "___ ihr, wo der Bahnhof ist? (wissen)", a: ["Wisst"], r: ["wk.forms"], why: "ihr: **wisst**." },
            { at: "r1", k: "pick", q: "ich ___ (wissen)", o: ["weiß", "weiße", "wisse"], a: 0, why: "**ich weiß** — no ending." },
            { at: "r2", k: "pick", q: "Ich ___, wo das Museum ist.", o: ["weiß", "kenne"], a: 0, why: "A fact (where it is): **wissen**." },
            { at: "r2", k: "pick", q: "___ du, wie spät es ist?", o: ["Weißt", "Kennst"], a: 0, why: "A fact: **wissen**." },
            { at: "r3", k: "pick", q: "Ich ___ deine Schwester.", o: ["kenne", "weiß"], a: 0, why: "A person: **kennen**." },
            { at: "r3", k: "pick", q: "___ du Basel?", o: ["Kennst", "Weißt"], a: 0, why: "A place: **kennen**." },
            { at: "r3", k: "type", cx: true, q: "Wir ___ das Restaurant gut. (kennen)", a: ["kennen"], r: ["wk.kennen"], why: "A place you've been: **kennen**." },
            { at: "table", k: "pick", q: "sie (she) ___ (kennen)", o: ["kennt", "kennst", "kenne"], a: 0, why: "kennen is regular: **sie kennt**." },
            { at: "trap", k: "pick", q: "He speaks good German:", o: ["Er kann gut Deutsch.", "Er weiß gut Deutsch.", "Er kennt gut Deutsch."], a: 0, why: "A language: **können**." },
          ] },
      ],
      diag: [
        { t: "swap", from: "^(kenne|kennst|kennt|kennen)$", to: "^(weiss|weisst|wissen|wisst)$", rule: "wk.fact", msg: "A fact — where, how, that…: **{right}** (wissen)." },
        { t: "swap", from: "^(weiss|weisst|wissen|wisst)$", to: "^(kenne|kennst|kennt|kennen)$", rule: "wk.kennen", msg: "A person, a place, a thing you've met: **{right}** (kennen)." },
        { t: "ending", stem: "(weiss|wiss)", rule: "wk.forms", msg: "wissen: ich weiß · du weißt · er weiß · ihr wisst — here **{right}**." },
        { t: "swap", from: "^(wisse|weisse|wissst)$", to: "^(weiss|weisst|wisst)$", rule: "wk.forms", msg: "wissen: ich weiß · du weißt · er weiß · ihr wisst — here **{right}**." },
        { t: "ending", stem: "kenn", rule: "wk.kennen", msg: "kennen is regular: **{right}**." },
      ],
      drills: [
        // ── Übung 18•1: the forms of wissen ──
        { id: "d18.1", ex: "18.1", t: "type", title: "weiß, weißt, wisst", how: "Write the form of wissen.", items: [
          { q: "___ du, wo die Post ist? (wissen)", a: ["Weißt"], r: ["wk.forms"], vf: [["wissen", "pr", "du"]] },
          { q: "Klar, ich ___ es genau. (wissen)", a: ["weiß"], r: ["wk.forms"], vf: [["wissen", "pr", "ich"]] },
          { q: "___ Lukas, wann der Kurs beginnt? (wissen)", a: ["Weiß"], r: ["wk.forms"], vf: [["wissen", "pr", "er"]] },
          { q: "Mia und Lukas ___ es auch nicht. (wissen)", a: ["wissen"], r: ["wk.forms"], vf: [["wissen", "pr", "sie"]] },
          { q: "Lena und Sara, ___ ihr, wo der Schlüssel ist? (wissen)", a: ["wisst"], r: ["wk.forms"], vf: [["wissen", "pr", "ihr"]] },
          { q: "Wir ___, dass er im Auto liegt. (wissen)", a: ["wissen"], r: ["wk.forms"], vf: [["wissen", "pr", "wir"]] },
          { q: "Frau Graf, ___ Sie, wie das Wetter morgen wird? (wissen)", a: ["wissen"], r: ["wk.forms"], vf: [["wissen", "pr", "sie"]] },
          { q: "Niemand ___ das. (wissen)", a: ["weiß"], r: ["wk.forms"], vf: [["wissen", "pr", "er"]] },
          { q: "Du ___ doch alles! (wissen)", a: ["weißt"], r: ["wk.forms"], vf: [["wissen", "pr", "du"]] },
          { q: "Ich ___ nicht, was ich sagen soll. (wissen)", a: ["weiß"], r: ["wk.forms"], vf: [["wissen", "pr", "ich"]] },
        ] },
        // ── our own: wissen or kennen? ──
        { id: "dwk.p", t: "pick", title: "weiß or kenne?", how: "Pick the verb: a fact → wissen · a person, a place, a thing → kennen.", items: [
          { q: "Ich ___ nicht, wo mein Handy ist.", o: ["weiß", "kenne"], a: ["weiß"], r: ["wk.fact"] },
          { q: "___ du meinen Mann?", o: ["Kennst", "Weißt"], a: ["Kennst"], r: ["wk.kennen"] },
          { q: "Wir ___ Zürich sehr gut.", o: ["kennen", "wissen"], a: ["kennen"], r: ["wk.kennen"] },
          { q: "___ Sie, wie viel das kostet?", o: ["Wissen", "Kennen"], a: ["Wissen"], r: ["wk.fact"] },
          { q: "Ich ___, dass du recht hast.", o: ["weiß", "kenne"], a: ["weiß"], r: ["wk.fact"] },
          { q: "Sie ist neu hier und ___ noch niemanden.", o: ["kennt", "weiß"], a: ["kennt"], r: ["wk.kennen"] },
          { q: "___ ihr ein gutes Hotel in Bern?", o: ["Kennt", "Wisst"], a: ["Kennt"], r: ["wk.kennen"] },
          { q: "Mein Sohn ___ alles über Fußball.", o: ["weiß", "kennt"], a: ["weiß"], r: ["wk.fact"] },
          { q: "Ich ___ das Buch, aber ich habe es nicht gelesen.", o: ["kenne", "weiß"], a: ["kenne"], r: ["wk.kennen"] },
          { q: "Niemand ___, wann der Zug kommt.", o: ["weiß", "kennt"], a: ["weiß"], r: ["wk.fact"] },
          { q: "Kennst du die neue Nachbarin? — Nein, ich ___ sie nicht.", o: ["kenne", "weiß"], a: ["kenne"], r: ["wk.kennen"] },
        ] },
        // ── Übung 18•2: the right verb, the right form ──
        { id: "d18.2", ex: "18.2", t: "type", title: "wissen or kennen?", how: "Write wissen or kennen in the right form.", items: [
          { q: "Meine Eltern ___ das Tessin gut.", a: ["kennen"], r: ["wk.kennen"], vf: [["kennen", "pr", "sie"]] },
          { q: "Ich ___, wo Chur liegt.", a: ["weiß"], r: ["wk.fact"], vf: [["wissen", "pr", "ich"]] },
          { q: "___ du das Kunstmuseum in Basel?", a: ["Kennst"], r: ["wk.kennen"], vf: [["kennen", "pr", "du"]] },
          { q: "Er ___ nicht, was er will.", a: ["weiß"], r: ["wk.fact"], vf: [["wissen", "pr", "er"]] },
          { q: "Meine Chefin denkt, sie ___ alles.", a: ["weiß"], r: ["wk.fact"], vf: [["wissen", "pr", "er"]] },
          { q: "___ ihr, wo Familie Huber wohnt?", a: ["Wisst"], r: ["wk.fact"], vf: [["wissen", "pr", "ihr"]] },
          { q: "Du ___ den Film nicht? Er ist super!", a: ["kennst"], r: ["wk.kennen"], vf: [["kennen", "pr", "du"]] },
          { q: "Frau Graf, ___ Sie, wie der neue Kollege heißt?", a: ["wissen"], r: ["wk.fact"], vf: [["wissen", "pr", "sie"]] },
          { q: "___ Sie den neuen Kollegen schon?", a: ["Kennen"], r: ["wk.kennen"], vf: [["kennen", "pr", "sie"]] },
          { q: "Wir ___ uns schon lange.", a: ["kennen"], r: ["wk.kennen"], vf: [["kennen", "pr", "wir"]] },
          { q: "___ du, wann die Party anfängt?", a: ["Weißt"], r: ["wk.fact"], vf: [["wissen", "pr", "du"]] },
          { q: "Ich ___ ein gutes Restaurant am See.", a: ["kenne"], r: ["wk.kennen"], vf: [["kennen", "pr", "ich"]] },
        ] },
        // ── Übung 18•3: say it in German ──
        { id: "d18.3", ex: "18.3", t: "translate", end: true, title: "Say it in German", how: "Translate — a fact: wissen · a person, a place: kennen.", items: [
          { q: "Do you know where the station is? (du)", a: ["Weißt du, wo der Bahnhof ist?"], r: ["wk.fact"] },
          { q: "I don't know anything.", a: ["Ich weiß nichts."], r: ["wk.fact"] },
          { q: "Mr Huber knows Geneva well.", a: ["Herr Huber kennt Genf gut."], r: ["wk.kennen"] },
          { q: "She knows my brother.", a: ["Sie kennt meinen Bruder."], r: ["wk.kennen"] },
          { q: "Ms Graf, do you know Lucerne?", a: ["Frau Graf, kennen Sie Luzern?"], r: ["wk.kennen"] },
          { q: "Children, do you know how much that costs?", a: ["Kinder, wisst ihr, wie viel das kostet?"], r: ["wk.fact", "wk.forms"] },
          { q: "We don't know that.", a: ["Das wissen wir nicht.", "Wir wissen das nicht."], r: ["wk.fact"] },
          { q: "I know a good doctor.", a: ["Ich kenne einen guten Arzt.", "Ich kenne eine gute Ärztin."], r: ["wk.kennen"] },
          { q: "Does anybody know her name?", a: ["Weiß jemand ihren Namen?", "Weiß jemand, wie sie heißt?", "Kennt jemand ihren Namen?"], r: ["wk.fact"] },
          { q: "We know the town well.", a: ["Wir kennen die Stadt gut."], r: ["wk.kennen"] },
          { q: "I know that you're tired. (du)", a: ["Ich weiß, dass du müde bist."], r: ["wk.fact"] },
        ] },
        { id: "dw.wk", t: "write", end: true, title: "Write your own", how: "In your own words — saved for Claude to correct.", items: [
          { q: "Your town: three places you know well (kennen).", model: ["Ich kenne in Bern ein gutes Café, den Rosengarten und einen kleinen Markt."], r: ["wk.kennen"] },
          { q: "Three things you know about Switzerland (Ich weiß, dass …).", model: ["Ich weiß, dass die Schweiz vier Landessprachen hat und dass Bern die Hauptstadt ist."], r: ["wk.fact"] },
          { q: "Someone at work or school: do you know them well? What do you know about them?", model: ["Ich kenne meine Kollegin Sara gut. Ich weiß, dass sie aus Lugano kommt."], r: ["wk.kennen", "wk.fact"] },
          { q: "Ask a stranger two questions (Wissen Sie …? Kennen Sie …?).", model: ["Entschuldigung, wissen Sie, wo die Post ist? Kennen Sie ein gutes Restaurant hier?"], r: ["wk.fact", "wk.kennen"] },
          { q: "Something you don't know yet — and want to find out.", model: ["Ich weiß noch nicht, wo ich im Sommer Ferien mache."], r: ["wk.fact"] },
          { q: "A film or a book everyone knows — do you know it?", model: ["Alle kennen den Film, aber ich kenne ihn nicht."], r: ["wk.kennen"] },
          { q: "Your neighbours: do you know them?", model: ["Ich kenne meine Nachbarn nicht gut, aber ich weiß, wie sie heißen."], r: ["wk.kennen", "wk.fact"] },
          { q: "A city you'd like to get to know — and what you know about it already.", model: ["Ich kenne Genf noch nicht, aber ich weiß, dass der See dort sehr schön ist."], r: ["wk.kennen", "wk.fact"] },
        ] },
      ],
    },
  },
});

// What chapter 18 became (18•4, commands, is in s0-verbs.js).
cxCover({ "18.1": "d18.1", "18.2": "d18.2", "18.3": "d18.3" });
