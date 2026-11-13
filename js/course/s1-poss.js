// ── COURSE PACK · Stage 1 · Possessives; von + dative ──
// Book: chapter 2 "Ein-words" (Übung 2•9 — mirrored in Stage 0, d2.9) and
// chapter 20 "Possession" (Übung 20•4: say that he wants to buy someone's
// thing). Stage 0 met mein, dein, sein… in the nominative; this lesson
// takes them through every case and answers *whose?* the way it's
// spoken. Two sheets: sein or ihr — the owner decides the word, the noun
// its ending (meinen, meinem, meiner) · a name + s (Annas Velo), von +
// the dative (das Auto von meinem Bruder) and the possessive on its own
// (Ja, das ist meiner). The written genitive (das Auto meines Bruders)
// comes with the genitive lesson in Stage 2 — 20•4 is mirrored here the
// spoken way.
cxPack({
  id: "s1-poss",
  sections: {
    "s1.poss": {
      testout: { n: 6, miss: 1 },
      rules: {
        "poss.who": "sein for him or it, ihr for her or them",
        "poss.acc": "the noun sets the ending, as with ein: meinen Vater",
        "poss.dat": "in the dative: meinem, meiner, plural meinen + -n",
        "poss.name": "name + s: Annas Velo, no apostrophe, no article",
        "poss.von": "in speech, von + dative: das Auto von meinem Bruder",
        "poss.alone": "on its own: meiner, meine, meins (mine)",
      },
      sheets: [
        { id: "cx.poss1", title: "mein, sein, ihr — in every case", qn: 3,
          struct: [["sein · ihr", "who"], ["+ the ending", "end"], ["noun", "thing"]],
          why: "A possessive does two jobs. The **word** says whose it is: **sein** for him, **ihr** for her. The **ending** works exactly like ein's: **meinen** Vater, mit **meinem** Bruder.",
          rid: ["poss.who", "poss.acc", "poss.dat"],
          rules: [
            "The **owner** decides the word: **sein** for er and es, **ihr** for sie (she or they), **Ihr** for Sie. The thing owned doesn't change it: Tom und **seine** Mutter · Lea und **ihr** Vater.",
            "The **noun** decides the ending, just like ein: **mein** Vater · **meine** Mutter · **meine** Eltern. As the object, a der-noun takes **meinen** Vater; the rest stay the same. euer drops an e: **eure** Wohnung.",
            "After mit, bei, von, zu, aus and dative verbs, use the dative: **meinem** (der, das), **meiner** (die), **meinen** (plural, and the noun adds -n): mit **meinem** Bruder · bei **unseren** Kindern.",
          ],
          table: { head: ["", "nom.", "acc.", "dat."], rows: [
            ["der", "mein", "**meinen**", "**meinem**"],
            ["die", "meine", "meine", "**meiner**"],
            ["das", "mein", "mein", "**meinem**"],
            ["pl.", "meine", "meine", "**meinen**"],
          ] },
          ex: [
            ["Lea fährt mit **ihrem** Bruder nach Luzern.", "Lea is going to Lucerne with her brother."],
            ["Tom sucht **seine** Brille — schon wieder!", "Tom is looking for his glasses — again!"],
            ["Wir wohnen seit März bei **unseren** Freunden.", "We've been staying with our friends since March."],
            ["Habt ihr **euren** Hund mitgebracht?", "Did you bring your dog?"],
          ],
          trap: "The word follows the owner, as in English; the ending follows the noun. Lea besucht **ihren** Vater: *her*, so ihr; den Vater, so -en. Not ~~seinen~~: Lea is a woman.",
          quiz: [
            { at: "r1", k: "pick", q: "Lea ruft ___ Mutter an.", o: ["ihre", "seine"], a: 0, why: "The owner is Lea, a woman, so **ihre** Mutter." },
            { at: "r1", k: "pick", q: "Das Kind spielt mit ___ Ball.", o: ["seinem", "ihrem"], a: 0, why: "The owner is das Kind (es), so **seinem**." },
            { at: "r1", k: "pick", q: "Die Nachbarn verkaufen ___ Haus.", o: ["ihr", "sein"], a: 0, why: "The owners are plural (they), so **ihr**." },
            { at: "r2", k: "type", cx: true, q: "(mein) Ich suche ___ Schlüssel.", a: ["meinen"], r: ["poss.acc"], why: "Schlüssel is der, and here it's the object: **meinen**." },
            { at: "r2", k: "pick", q: "Habt ihr ___ Tickets?", o: ["eure", "euren", "euer"], a: 0, why: "Tickets is plural, and euer drops an e before an ending: **eure**." },
            { at: "r2", k: "pick", q: "Tom vergisst immer ___ Handy.", o: ["sein", "seinen", "seine"], a: 0, why: "Handy is das, so the object form doesn't change: **sein** Handy." },
            { at: "r3", k: "type", cx: true, q: "(mein) Ich fahre mit ___ Schwester.", a: ["meiner"], r: ["poss.dat"], why: "mit takes the dative; Schwester is die, so **meiner**." },
            { at: "r3", k: "pick", q: "Wir wohnen bei ___ Eltern.", o: ["unseren", "unsere", "unserem"], a: 0, why: "bei takes the dative; in the plural that's **unseren** Eltern." },
            { at: "table", k: "pick", q: "dative, das Kind: mit ___ Kind", o: ["meinem", "meinen", "meiner"], a: 0, why: "Kind is das, and the dative of das is dem: **meinem** Kind." },
            { at: "trap", k: "pick", q: "Lea visits her father:", o: ["Lea besucht ihren Vater.", "Lea besucht seinen Vater.", "Lea besucht ihre Vater."], a: 0, why: "*Her* is **ihr**; Vater is the object (den), so **ihren**." },
          ] },
        { id: "cx.poss2", title: "Whose? Annas · von meinem Bruder · meiner", qn: 3,
          struct: [["Annas", "who"], ["noun", "thing"], ["·", "mid"], ["noun", "thing"], ["von + dative", "end"]],
          why: "There are three common ways to say **whose**: a name + **s** (Annas Velo), **von** + the dative (das Velo von meinem Bruder), and the possessive **on its own** (Das ist meiner).",
          rid: ["poss.name", "poss.von", "poss.alone"],
          rules: [
            "A name takes **-s** and goes in front of the thing, with no apostrophe and no article: **Annas** Velo · **Toms** Eltern · **Frau Hubers** Garten. (English *Anna's* is German **Annas**.)",
            "In everyday speech, use **von + the dative** after the thing: das Auto **von meinem Bruder** · die Katze **von der Nachbarin**. To ask, use **Wessen**: Wessen Jacke ist das? — Leas.",
            "On its own, the possessive shows the gender of the noun it replaces: **meiner** (der), **meine** (die and plural), **meins** (das). Ist das dein Schirm? — Ja, das ist **meiner**.",
          ],
          table: { head: ["the thing", "on its own"], rows: [
            ["der Schirm", "**meiner**"], ["die Tasche", "**meine**"], ["das Handy", "**meins**"], ["die Schlüssel", "**meine**"],
          ] },
          ex: [
            ["**Ninas** Wohnung liegt direkt am See.", "Nina's flat is right on the lake."],
            ["Das Velo **von meinem Bruder** steht im Keller.", "My brother's bike is in the cellar."],
            ["Wessen Mantel ist das? — Das ist **meiner**.", "Whose coat is that? — It's mine."],
            ["Mein Handy ist leer. Darf ich **deins** benutzen?", "My phone is flat. May I use yours?"],
          ],
          trap: "With a name, use no apostrophe and no article: **Annas** Velo, not ~~Anna's Velo~~ or ~~das Annas Velo~~. And on its own, das needs **meins**: Das ist **meins**, not ~~mein~~.",
          quiz: [
            { at: "r1", k: "pick", q: "Tim's jacket:", o: ["Tims Jacke", "Tim's Jacke", "die Tims Jacke"], a: 0, why: "Name + s, with no apostrophe and no article: **Tims Jacke**." },
            { at: "r1", k: "type", cx: true, q: "Die Eltern von Marco → ___ Eltern", a: ["Marcos"], r: ["poss.name"], why: "The name + s goes in front: **Marcos** Eltern." },
            { at: "r1", k: "pick", q: "Ms Huber's garden:", o: ["Frau Hubers Garten", "der Garten Frau Huber", "Frau Huber's Garten"], a: 0, why: "The whole name + s goes in front: **Frau Hubers** Garten." },
            { at: "r2", k: "pick", q: "the car of my brother — spoken:", o: ["das Auto von meinem Bruder", "das Auto von mein Bruder", "das Auto von meinen Bruder"], a: 0, why: "von takes the dative; Bruder is der, so **meinem** Bruder." },
            { at: "r2", k: "type", cx: true, q: "(die Nachbarin) Die Katze von ___ ist weg.", a: ["der Nachbarin"], r: ["poss.von"], why: "von takes the dative, and die becomes **der**: von der Nachbarin." },
            { at: "r2", k: "pick", q: "the rooms of our children:", o: ["die Zimmer von unseren Kindern", "die Zimmer von unsere Kinder", "die Zimmer von unserem Kind"], a: 0, why: "Dative plural: **unseren**, and the noun adds -n: **Kindern**." },
            { at: "r3", k: "pick", q: "Ist das dein Schirm? — Ja, das ist ___.", o: ["meiner", "mein", "meins"], a: 0, why: "Schirm is der, so on its own it's **meiner**." },
            { at: "r3", k: "pick", q: "Ist das dein Handy? — Ja, das ist ___.", o: ["meins", "meiner", "mein"], a: 0, why: "Handy is das, so on its own it's **meins**." },
            { at: "table", k: "pick", q: "die Tasche — on its own:", o: ["meine", "meiner", "meins"], a: 0, why: "Tasche is die, so on its own it's **meine**." },
            { at: "trap", k: "pick", q: "Which is right?", o: ["Das ist Annas Velo.", "Das ist das Annas Velo.", "Das ist Anna's Velo."], a: 0, why: "No article and no apostrophe: **Annas Velo**." },
          ] },
      ],
      diag: [
        { t: "swap", from: "^sein\\w*$", to: "^ihr\\w*$", rule: "poss.who", msg: "The owner is female or plural, so it's **{right}**. sein is only for er and es." },
        { t: "swap", from: "^ihr\\w*$", to: "^sein\\w*$", rule: "poss.who", msg: "The owner is er or es (a man, a thing, a child), so it's **{right}**. ihr is for her or them." },
        { t: "swap", from: "^(eur|euer|ihr)\\w*$", to: "^unser\\w*$", rule: "poss.who", msg: "Match the owner: **{right}**. unser goes with wir, euer with ihr, Ihr with Sie." },
        { t: "swap", from: "^(unser|ihr)\\w*$", to: "^(eur|euer)\\w*$", rule: "poss.who", msg: "Match the owner: **{right}**. unser goes with wir, euer with ihr, Ihr with Sie." },
        { t: "swap", from: "^(unser|eur|euer)\\w*$", to: "^ihr\\w*$", rule: "poss.who", msg: "Match the owner: **{right}**. unser goes with wir, euer with ihr, Ihr with Sie." },
        { t: "swap", from: "^(mein|dein|sein|ihr|unser|euer)$", to: "^(meiner|meins|meines|deiner|deins|deines|seiner|seins|seines|ihrer|ihrs|ihres|unserer|unseres|unsers|eurer|eures)$", rule: "poss.alone", msg: "On its own, the possessive shows the noun's gender: **{right}**. For example meiner (der), meins (das)." },
        { t: "extra", tok: "^s$", rule: "poss.name", msg: "German uses no apostrophe: write the name and the **s** together, as in Annas, Toms." },
        { t: "swap", from: "^(mein|dein|sein|ihr|unser|euer|eur)(e|en)?$", to: "^(mein|dein|sein|ihr|unser|eur)(em|er)$", rule: "poss.dat", msg: "After mit, bei, von, zu and the like, use the dative: **{right}**. That's meinem for der and das, meiner for die." },
        { t: "ending", stem: "(kinder|freunde|grosseltern|leute|schuler|enkel)", rule: "poss.dat", msg: "In the dative plural, the noun adds an **-n** too: **{right}**." },
        { t: "ending", stem: "(mein|dein|sein|ihr|unser|eur|euer)", rule: "poss.acc", msg: "Right word, wrong ending. The ending follows the noun, as with ein: **{right}**." },
      ],
      drills: [
        // ── our own: sein or ihr? ──
        { id: "dposs.who", t: "pick", title: "sein or ihr?", how: "Pick the possessive. The owner decides which word.", items: [
          { q: "Lea ruft ___ Bruder an.", o: ["ihren", "seinen"], a: ["ihren"], r: ["poss.who"] },
          { q: "Tom wohnt noch bei ___ Eltern.", o: ["seinen", "ihren"], a: ["seinen"], r: ["poss.who"] },
          { q: "Die Kinder spielen mit ___ Hund.", o: ["ihrem", "seinem"], a: ["ihrem"], r: ["poss.who"] },
          { q: "Das Baby schläft in ___ Bett.", o: ["seinem", "ihrem"], a: ["seinem"], r: ["poss.who"] },
          { q: "Frau Graf sucht ___ Brille.", o: ["ihre", "seine"], a: ["ihre"], r: ["poss.who"] },
          { q: "Herr Meier fährt mit ___ Velo zur Arbeit.", o: ["seinem", "ihrem"], a: ["seinem"], r: ["poss.who"] },
          { q: "Meine Nachbarn verkaufen ___ Auto.", o: ["ihr", "sein"], a: ["ihr"], r: ["poss.who"] },
          { q: "Sara und Ben, wo ist ___ neue Wohnung?", o: ["eure", "ihre"], a: ["eure"], r: ["poss.who"] },
          { q: "Die Firma sucht Leute für ___ Büro in Zug.", o: ["ihr", "sein"], a: ["ihr"], r: ["poss.who"] },
          { q: "Herr und Frau Huber, ist das ___ Garage?", o: ["Ihre", "eure"], a: ["Ihre"], r: ["poss.who"] },
          { q: "Der Hund wartet auf ___ Futter.", o: ["sein", "ihr"], a: ["sein"], r: ["poss.who"] },
        ] },
        // ── our own: the ending — the subject and the object ──
        { id: "dposs.acc", t: "type", title: "mein, meine, meinen", how: "Write the possessive with its ending. Only a der-noun as the object changes: meinen.", items: [
          { q: "(mein) Ich suche ___ Schlüssel.", a: ["meinen"], r: ["poss.acc"] },
          { q: "(dein) Hast du ___ Ausweis dabei?", a: ["deinen"], r: ["poss.acc"] },
          { q: "(unser) Wir verkaufen ___ alte Wohnung.", a: ["unsere"], r: ["poss.acc"] },
          { q: "(euer) Habt ihr ___ Kinder schon angemeldet?", a: ["eure"], r: ["poss.acc"] },
          { q: "(sein) Tom vergisst immer ___ Handy.", a: ["sein"], r: ["poss.acc"] },
          { q: "(her) Lea besucht am Sonntag ___ Großvater.", a: ["ihren"], r: ["poss.acc", "poss.who"] },
          { q: "(your, polite) Frau Keller, brauchen Sie ___ Pass?", a: ["Ihren"], r: ["poss.acc"] },
          { q: "(mein) ___ Mann arbeitet bei der Post.", a: ["Mein"], r: ["poss.acc"] },
          { q: "(unser) ___ Kinder gehen in Thun zur Schule.", a: ["Unsere"], r: ["poss.acc"] },
          { q: "(their) Die Nachbarn suchen ___ Katze.", a: ["ihre"], r: ["poss.acc", "poss.who"] },
          { q: "(euer) Ist das ___ Velo?", a: ["euer"], r: ["poss.acc"] },
          { q: "(sein) Herr Huber ruft ___ Chef an.", a: ["seinen"], r: ["poss.acc"] },
        ] },
        // ── our own: the dative ──
        { id: "dposs.dat", t: "type", title: "mit meinem, bei meiner", how: "Write the possessive in the dative (after mit, bei, von, zu, or a dative verb).", items: [
          { q: "(mein) Ich fahre mit ___ Bruder nach Bern.", a: ["meinem"], r: ["poss.dat"] },
          { q: "(dein) Wohnst du noch bei ___ Eltern?", a: ["deinen"], r: ["poss.dat"] },
          { q: "(unser) Wir telefonieren oft mit ___ Tochter in London.", a: ["unserer"], r: ["poss.dat"] },
          { q: "(sein) Ben hilft ___ Nachbarin im Garten.", a: ["seiner"], r: ["poss.dat"] },
          { q: "(her) Lea schreibt ___ Freund eine Karte.", a: ["ihrem"], r: ["poss.dat", "poss.who"] },
          { q: "(euer) Was schenkt ihr ___ Lehrerin?", a: ["eurer"], r: ["poss.dat"] },
          { q: "(your, polite) Frau Brunner, wie geht es ___ Mann?", a: ["Ihrem"], r: ["poss.dat"] },
          { q: "(mein) Das Paket ist von ___ Großeltern.", a: ["meinen"], r: ["poss.dat"] },
          { q: "(their) Die Kinder spielen mit ___ Freunden.", a: ["ihren"], r: ["poss.dat", "poss.who"] },
          { q: "(sein) Tom geht mit ___ Hund spazieren.", a: ["seinem"], r: ["poss.dat"] },
          { q: "(unser) Wir sind zufrieden mit ___ neuen Wohnung.", a: ["unserer"], r: ["poss.dat"] },
        ] },
        // ── our own: someone else's ──
        { id: "dposs.mix", t: "transform", title: "Someone else's", how: "Say it for the person in brackets. Change both the verb and the possessive.", items: [
          { q: "Ich besuche meine Oma. (Tom)", a: ["Tom besucht seine Oma."], r: ["poss.who"], vf: [["besuchen", "pr", "er"]], cap: true },
          { q: "Ich rufe meinen Vater an. (Lea)", a: ["Lea ruft ihren Vater an."], r: ["poss.who", "poss.acc"], vf: [["anrufen", "pr", "er"]], cap: true },
          { q: "Ich wohne bei meiner Tante. (wir)", a: ["Wir wohnen bei unserer Tante."], r: ["poss.dat"], vf: [["wohnen", "pr", "wir"]] },
          { q: "Ich suche meinen Schlüssel. (du)", a: ["Du suchst deinen Schlüssel."], r: ["poss.acc"], vf: [["suchen", "pr", "du"]] },
          { q: "Ich fahre mit meinem Auto. (die Nachbarn)", a: ["Die Nachbarn fahren mit ihrem Auto."], r: ["poss.who", "poss.dat"], vf: [["fahren", "pr", "sie"]] },
          { q: "Ich helfe meinem Sohn. (ihr)", a: ["Ihr helft eurem Sohn."], r: ["poss.dat"], vf: [["helfen", "pr", "ihr"]] },
          { q: "Ich zeige meine Wohnung. (Herr Graf)", a: ["Herr Graf zeigt seine Wohnung."], r: ["poss.who"], vf: [["zeigen", "pr", "er"]], cap: true },
          { q: "Ich spreche mit meinen Kollegen. (Sara)", a: ["Sara spricht mit ihren Kollegen."], r: ["poss.who", "poss.dat"], vf: [["sprechen", "pr", "er"]], cap: true },
          { q: "Ich vergesse meine Jacke. (das Kind)", a: ["Das Kind vergisst seine Jacke."], r: ["poss.who"], vf: [["vergessen", "pr", "er"]] },
          { q: "Ich gehe mit meinem Freund ins Kino. (Sie, polite)", a: ["Sie gehen mit Ihrem Freund ins Kino."], r: ["poss.dat"], vf: [["gehen", "pr", "sie"]] },
          { q: "Ich bringe meinen Kindern Schokolade mit. (Mama)", a: ["Mama bringt ihren Kindern Schokolade mit."], r: ["poss.who", "poss.dat"], vf: [["mitbringen", "pr", "er"]], cap: true },
        ] },
        // ── our own: a name + s ──
        { id: "dposs.name", t: "transform", title: "Annas, Toms", how: "Put the name + s in front, with no apostrophe and no article.", items: [
          { q: "Das ist das Handy von Lea.", a: ["Das ist Leas Handy."], r: ["poss.name"] },
          { q: "Wo ist die Jacke von Tim?", a: ["Wo ist Tims Jacke?"], r: ["poss.name"] },
          { q: "Die Wohnung von Sara ist sehr hell.", a: ["Saras Wohnung ist sehr hell."], r: ["poss.name"], cap: true },
          { q: "Kennst du den Freund von Anna?", a: ["Kennst du Annas Freund?"], r: ["poss.name"] },
          { q: "Die Eltern von Marco wohnen in Chur.", a: ["Marcos Eltern wohnen in Chur."], r: ["poss.name"], cap: true },
          { q: "Das ist der Garten von Frau Huber.", a: ["Das ist Frau Hubers Garten."], r: ["poss.name"] },
          { q: "Ich nehme heute das Auto von Papa.", a: ["Ich nehme heute Papas Auto."], r: ["poss.name"] },
          { q: "Die Katze von Nina heißt Mimi.", a: ["Ninas Katze heißt Mimi."], r: ["poss.name"], cap: true },
          { q: "Wir feiern am Samstag den Geburtstag von Oma.", a: ["Wir feiern am Samstag Omas Geburtstag."], r: ["poss.name"] },
          { q: "Die Kinder von Petra gehen schon zur Schule.", a: ["Petras Kinder gehen schon zur Schule."], r: ["poss.name"], cap: true },
        ].map(it => ({ ...it, diag: [{ t: "seq", seq: ["^(der|die|das|den|dem)$", "^[a-z]+s$"], rule: "poss.name", msg: "A name + s takes no article: **Leas** Handy, **Tims** Jacke." }] })) },
        // ── our own: von + the dative ──
        { id: "dposs.von", t: "type", title: "von meinem, von der", how: "Write the words in brackets in the dative, after von.", items: [
          { q: "(mein Onkel) Das Ferienhaus von ___ steht im Wallis.", a: ["meinem Onkel"], r: ["poss.von"] },
          { q: "(die Nachbarin) Der Hund von ___ bellt die ganze Nacht.", a: ["der Nachbarin"], r: ["poss.von"] },
          { q: "(unsere Kinder) Die Zimmer von ___ sind nie aufgeräumt.", a: ["unseren Kindern"], r: ["poss.von", "poss.dat"] },
          { q: "(der Chef) Ist das das Büro von ___?", a: ["dem Chef"], r: ["poss.von"] },
          { q: "(meine Freundin) Ich trage heute die Jacke von ___.", a: ["meiner Freundin"], r: ["poss.von"] },
          { q: "(das Kind) Wo sind die Schuhe von ___?", a: ["dem Kind"], r: ["poss.von"] },
          { q: "(eine Kollegin) Das war die Idee von ___.", a: ["einer Kollegin"], r: ["poss.von"] },
          { q: "(ihre Eltern) Lea wohnt in der Wohnung von ___.", a: ["ihren Eltern"], r: ["poss.von", "poss.dat"] },
          { q: "(dein Bruder) Ist das das Velo von ___?", a: ["deinem Bruder"], r: ["poss.von"] },
          { q: "(die Gemeinde) Hier ist ein Brief von ___.", a: ["der Gemeinde"], r: ["poss.von"] },
        ] },
        // ── Übung 20•4: he wants to buy it ──
        { id: "d20.4", ex: "20.4", t: "compose", title: "He wants to buy it", how: "Say that he wants to buy it. Show whose it is: a name + s, or von + the dative.", items: [
          { w: ["er", "wollen", "kaufen", "das Velo", "Mia"], a: ["Er will Mias Velo kaufen.", "Er will das Velo von Mia kaufen."], r: ["poss.name"], vf: [["wollen", "pr", "er"]] },
          { w: ["er", "wollen", "kaufen", "das Auto", "von", "sein Onkel"], a: ["Er will das Auto von seinem Onkel kaufen."], r: ["poss.von"], vf: [["wollen", "pr", "er"]] },
          { w: ["er", "wollen", "kaufen", "die Lampe", "von", "diese Frau"], a: ["Er will die Lampe von dieser Frau kaufen."], r: ["poss.von"], vf: [["wollen", "pr", "er"]] },
          { w: ["er", "wollen", "kaufen", "der Tisch", "Ben"], a: ["Er will Bens Tisch kaufen.", "Er will den Tisch von Ben kaufen."], r: ["poss.name"], vf: [["wollen", "pr", "er"]] },
          { w: ["er", "wollen", "kaufen", "die Bücher", "von", "meine Lehrerin"], a: ["Er will die Bücher von meiner Lehrerin kaufen."], r: ["poss.von", "poss.dat"], vf: [["wollen", "pr", "er"]] },
          { w: ["er", "wollen", "kaufen", "der Kinderwagen", "von", "unsere Nachbarn"], a: ["Er will den Kinderwagen von unseren Nachbarn kaufen."], r: ["poss.von", "poss.dat"], vf: [["wollen", "pr", "er"]] },
          { w: ["er", "wollen", "kaufen", "die Skier", "Nina"], a: ["Er will Ninas Skier kaufen.", "Er will die Skier von Nina kaufen."], r: ["poss.name"], vf: [["wollen", "pr", "er"]] },
          { w: ["er", "wollen", "kaufen", "das Sofa", "von", "ihr Bruder"], a: ["Er will das Sofa von ihrem Bruder kaufen."], r: ["poss.von", "poss.dat"], vf: [["wollen", "pr", "er"]] },
          { w: ["er", "wollen", "kaufen", "der Computer", "von", "die Firma"], a: ["Er will den Computer von der Firma kaufen."], r: ["poss.von"], vf: [["wollen", "pr", "er"]] },
          { w: ["er", "wollen", "kaufen", "die Gitarre", "Frau Keller"], a: ["Er will Frau Kellers Gitarre kaufen.", "Er will die Gitarre von Frau Keller kaufen."], r: ["poss.name"], vf: [["wollen", "pr", "er"]] },
        ] },
        // ── our own: mine, yours ──
        { id: "dposs.alone", t: "type", title: "meiner, meins, meine", how: "Write the possessive on its own: meiner for der, meine for die, meins for das.", items: [
          { q: "Ist das dein Schirm? — Ja, das ist ___.", a: ["meiner"], r: ["poss.alone"] },
          { q: "Ist das deine Tasche? — Ja, das ist ___.", a: ["meine"], r: ["poss.alone"] },
          { q: "Ist das dein Handy? — Ja, das ist ___.", a: ["meins", "meines"], r: ["poss.alone"] },
          { q: "Sind das deine Schlüssel? — Ja, das sind ___.", a: ["meine"], r: ["poss.alone"] },
          { q: "Ist das Toms Jacke? — Ja, das ist ___.", a: ["seine"], r: ["poss.alone", "poss.who"] },
          { q: "Ist das Leas Velo? — Nein, ___ ist rot.", a: ["ihres", "ihrs"], r: ["poss.alone", "poss.who"] },
          { q: "Mein Auto ist kaputt. Kann ich ___ nehmen? (yours, du)", a: ["deins", "deines"], r: ["poss.alone"] },
          { q: "Ich habe keinen Stift. Kannst du mir ___ leihen? (yours, du)", a: ["deinen"], r: ["poss.alone"] },
          { q: "Wessen Koffer ist das? — Das ist ___. (ours)", a: ["unserer"], r: ["poss.alone"] },
          { q: "Ist das eure Katze? — Nein, ___ ist schwarz. (ours)", a: ["unsere"], r: ["poss.alone"] },
          { q: "Frau Graf, ist das Ihr Mantel? — Ja, das ist ___.", a: ["meiner"], r: ["poss.alone"] },
        ].map(it => ({ ...it, diag: [{ t: "ending", stem: "(mein|dein|sein|ihr|unser|eur)", rule: "poss.alone", msg: "On its own, the possessive shows the gender of the noun it replaces: **{right}**. meiner (der), meine (die), meins (das); as an object, meinen." }] })) },
        // ── Production: whose is it? ──
        { id: "dp.poss", t: "translate", end: true, title: "Say it in German", how: "Translate. The owner decides sein or ihr; the noun decides the ending.", items: [
          { q: "Is that your bike? (du)", a: ["Ist das dein Velo?", "Ist das dein Fahrrad?"], r: ["poss.acc"] },
          { q: "Lea is visiting her grandparents.", a: ["Lea besucht ihre Großeltern."], r: ["poss.who"] },
          { q: "Tom is going to the cinema with his sister.", a: ["Tom geht mit seiner Schwester ins Kino."], r: ["poss.who", "poss.dat"] },
          { q: "That's Mia's flat.", a: ["Das ist Mias Wohnung.", "Das ist die Wohnung von Mia."], r: ["poss.name"] },
          { q: "We live with our parents.", a: ["Wir wohnen bei unseren Eltern."], r: ["poss.dat"] },
          { q: "My colleague's car is broken. (she)", a: ["Das Auto von meiner Kollegin ist kaputt.", "Das Auto meiner Kollegin ist kaputt."], r: ["poss.von"] },
          { q: "Is this your key? — Yes, it's mine. (du)", a: ["Ist das dein Schlüssel? — Ja, das ist meiner."], r: ["poss.alone"] },
          { q: "The children are playing with their dog.", a: ["Die Kinder spielen mit ihrem Hund."], r: ["poss.who", "poss.dat"] },
          { q: "Ms Graf, where is your coat?", a: ["Frau Graf, wo ist Ihr Mantel?"], r: ["poss.acc"] },
          { q: "I'm writing to my brother.", a: ["Ich schreibe meinem Bruder.", "Ich schreibe an meinen Bruder."], r: ["poss.dat"] },
          { q: "Whose umbrella is that? — It's Anna's.", a: ["Wessen Schirm ist das? — Das ist Annas Schirm.", "Wessen Schirm ist das? — Das ist der Schirm von Anna.", "Wessen Schirm ist das? — Der gehört Anna.", "Wessen Schirm ist das? — Das ist Annas."], r: ["poss.name"] },
          { q: "Can I take yours? My phone is flat. (du, das Handy)", a: ["Kann ich deins nehmen? Mein Handy ist leer.", "Kann ich deines nehmen? Mein Handy ist leer."], r: ["poss.alone"] },
        ] },
        { id: "dw.poss", t: "write", end: true, title: "Write your own", how: "In your own words — saved for Claude to correct.", items: [
          { q: "Your family: three people and something of theirs (sein, ihr…).", model: ["Mein Bruder wohnt mit seiner Frau in Aarau. Meine Schwester fährt jeden Tag mit ihrem Velo zur Arbeit. Meine Eltern verkaufen ihr Haus."], r: ["poss.who"] },
          { q: "Who do you spend the weekend with? (mit meinem…, bei meiner…)", model: ["Am Samstag bin ich bei meiner Freundin. Am Sonntag gehe ich mit meinen Kindern an den See."], r: ["poss.dat"] },
          { q: "Lost property: describe two things and whose they are.", model: ["Das ist Toms Jacke, und der rote Schirm ist von meiner Kollegin."], r: ["poss.name", "poss.von"] },
          { q: "A friend's flat or house — what is it like?", model: ["Saras Wohnung ist klein, aber sehr gemütlich. Der Balkon von ihrer Wohnung ist toll."], r: ["poss.name", "poss.von"] },
          { q: "Two things you lend or borrow (Kann ich deins …?).", model: ["Mein Velo ist kaputt. Kann ich deins nehmen? Du kannst meinen Rucksack haben."], r: ["poss.alone"] },
          { q: "Introduce a colleague and their family.", model: ["Das ist meine Kollegin Nina. Ihr Mann arbeitet bei der SBB, und ihre Kinder gehen in Olten zur Schule."], r: ["poss.who", "poss.acc"] },
          { q: "Whose is it? Write a short dialogue (Wessen …? — Das ist …).", model: ["Wessen Handy ist das? — Das ist meins. — Und der Schlüssel? — Der ist von meinem Mann."], r: ["poss.alone", "poss.von"] },
          { q: "Your best friend's habits (seine / ihre …).", model: ["Mein Freund Marco vergisst immer seine Schlüssel. Er ruft jeden Abend seine Mutter an."], r: ["poss.who", "poss.acc"] },
        ] },
      ],
    },
  },
});

// What chapter 20's "Possession" became (2•9, the ein-words, is Stage 0's d2.9).
cxCover({ "20.4": "d20.4" });
