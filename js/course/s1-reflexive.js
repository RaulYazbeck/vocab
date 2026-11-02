// ── COURSE PACK · Stage 1 · Reflexive pronouns ──
// Book: chapter 23 "Reflexive pronouns" (Übung 23•4–23•10). Two sheets:
// sich — when the object is the subject itself (and the verbs that always
// have it: sich freuen, sich beeilen…) · mir or mich? — the dative
// reflexive when there's a thing as well (Ich wasche mir die Hände), and
// after a preposition (für sich). The rest of chapter 23 belongs to later
// lessons: its adjective endings (23•1 · 23•2) to the adjective lesson
// (Session 5), its modifiers (23•3) to adverbs, and its conjunctions
// (23•11 indirect questions, 23•13 obwohl, während, da…) to Session 6 —
// all of them upload chapter 23 again. 23•12 (aber, denn, oder, sondern)
// went to und, aber, oder, denn, sondern (s1-conj.js).
cxPack({
  id: "s1-reflexive",
  sections: {
    "s1.refl": {
      testout: { n: 6, miss: 1 },
      rules: {
        "refl.forms": "mich · dich · sich · uns · euch · sich",
        "refl.vs": "another person: ihn · the same person: sich",
        "refl.verbs": "sich freuen, sich beeilen, sich erkälten — right after the verb",
        "refl.dat": "with a thing as well: mir · dir (Ich kaufe mir …)",
        "refl.body": "body and clothes: Ich putze mir die Zähne",
        "refl.prep": "after a preposition: für sich · bei dir",
      },
      sheets: [
        { id: "cx.refl1", title: "sich: the object is the subject", qn: 3,
          struct: [["Who", "who"], ["verb", "verb"], ["mich · sich", "refl"], ["…", "mid"]],
          why: "When you do something to **yourself**, the object is the same person as the subject — and German uses a reflexive pronoun: Ich wasche **mich**. Most of them you know already; only one is new: **sich**.",
          rid: ["refl.forms", "refl.vs", "refl.verbs"],
          rules: [
            "The reflexive pronouns are the accusative ones — **mich · dich · uns · euch** — except for er, sie, es, man, sie (they) and Sie, which all take **sich**: Ich wasche **mich**. · Er wäscht **sich**. · Die Kinder freuen **sich**.",
            "Another person → the normal pronoun; the same person → the reflexive: Lea fragt **sie** (her — someone else). · Lea fragt **sich** (herself). · Ich stelle **ihn** vor. · Ich stelle **mich** vor.",
            "Some verbs always have it — learn them with *sich*: **sich freuen · sich beeilen · sich erkälten · sich setzen · sich treffen**. It comes right after the verb (or a pronoun subject): Ich **freue mich**. · Heute **freue ich mich**.",
          ],
          table: { head: ["", "someone else", "the same"], rows: [
            ["ich", "Er sieht **mich**.", "Ich sehe **mich**."],
            ["du", "Er sieht **dich**.", "Du siehst **dich**."],
            ["er · sie", "Ich sehe **ihn**.", "Er sieht **sich**."],
            ["wir", "Er sieht **uns**.", "Wir sehen **uns**."],
            ["ihr", "Er sieht **euch**.", "Ihr seht **euch**."],
            ["sie · Sie", "Ich sehe **sie**.", "Sie sehen **sich**."],
          ] },
          ex: [
            ["Ich **freue mich** auf das Wochenende.", "I'm looking forward to the weekend."],
            ["Wir **treffen uns** um sieben am Bahnhof.", "We're meeting at seven at the station."],
            ["Bitte **setzen Sie sich**!", "Please sit down."],
            ["Mein Sohn hat **sich** schon wieder erkältet.", "My son has caught a cold again."],
          ],
          trap: "**sich** is only for er, sie, es, man, sie (they) and Sie: ich wasche **mich**, wir waschen **uns** — never ~~wir waschen sich~~.",
          quiz: [
            { at: "r1", k: "pick", q: "Er wäscht ___.", o: ["sich", "ihn", "er"], a: 0, why: "er: **sich**." },
            { at: "r1", k: "pick", q: "Wir freuen ___ auf die Ferien.", o: ["uns", "sich", "euch"], a: 0, why: "wir: **uns**." },
            { at: "r1", k: "type", cx: true, q: "Beeil ___! (du)", a: ["dich"], r: ["refl.forms"], why: "du: **dich**." },
            { at: "r2", k: "pick", q: "Tom sieht ___ im Spiegel. (himself)", o: ["sich", "ihn"], a: 0, why: "The same person: **sich**." },
            { at: "r2", k: "pick", q: "Lea sieht ihre Freundin und ruft ___. (her friend)", o: ["sie", "sich"], a: 0, why: "Another person: **sie**." },
            { at: "r3", k: "pick", q: "Darf ich ___ vorstellen? Ich bin Tom.", o: ["mich", "mir", "sich"], a: 0, why: "ich: **mich**." },
            { at: "r3", k: "order", q: "Build it: Today I'm looking forward to the film.", a: ["Heute", "freue", "ich", "mich", "auf den Film."], why: "The verb, the subject — and the reflexive right after." },
            { at: "table", k: "pick", q: "Ihr seht ___ im Spiegel.", o: ["euch", "sich", "uns"], a: 0, why: "ihr: **euch**." },
            { at: "trap", k: "pick", q: "Which is right?", o: ["Wir waschen uns.", "Wir waschen sich."], a: 0, why: "wir: **uns** — sich is for er, sie, es and Sie." },
          ] },
        { id: "cx.refl2", title: "mir or mich? — with a thing as well", qn: 3,
          struct: [["Who", "who"], ["verb", "verb"], ["mir · dir · sich", "refl"], ["the thing", "thing"]],
          why: "When the sentence has a **thing** as the object, the person becomes **dative**: Ich wasche **mich** — but Ich wasche **mir** die Hände. Only *ich* and *du* look different; the rest stay the same.",
          rid: ["refl.dat", "refl.body", "refl.prep"],
          rules: [
            "With a thing as well, the reflexive is dative: **mir · dir · sich · uns · euch · sich**: Ich kaufe **mir** ein Velo. · Bestellst du **dir** einen Kaffee? · Er nimmt **sich** ein Stück Kuchen. Only ich and du change: mich → **mir**, dich → **dir**.",
            "Body and clothes: German says **mir die** where English says *my*: Ich putze **mir die** Zähne. · Zieh **dir** eine Jacke an! — with nothing else it's the accusative: Ich ziehe **mich** an.",
            "After a preposition, the reflexive too: Sie kauft das nur für **sich**. · Hast du Geld bei **dir**? · Er spricht gern über **sich**.",
          ],
          table: { head: ["Ich wasche …", "alone", "with a thing"], rows: [
            ["ich", "**mich**", "**mir** die Hände"],
            ["du", "**dich**", "**dir** die Hände"],
            ["er · sie · es", "**sich**", "**sich** die Hände"],
            ["wir", "**uns**", "**uns** die Hände"],
            ["ihr", "**euch**", "**euch** die Hände"],
            ["sie · Sie", "**sich**", "**sich** die Hände"],
          ] },
          ex: [
            ["Ich kaufe **mir** einen neuen Laptop.", "I'm buying myself a new laptop."],
            ["Putz **dir** bitte die Zähne!", "Brush your teeth, please."],
            ["Ich kann **mir** das gut vorstellen.", "I can easily imagine that."],
            ["Hast du einen Schirm **bei dir**?", "Have you got an umbrella with you?"],
          ],
          trap: "**sich vorstellen** has two meanings: Ich stelle **mich** vor (I introduce myself) · Ich stelle **mir** das vor (I imagine it — a thing as well, so dative).",
          quiz: [
            { at: "r1", k: "pick", q: "Ich kaufe ___ ein Eis.", o: ["mir", "mich"], a: 0, why: "A thing as well (ein Eis): **mir**." },
            { at: "r1", k: "pick", q: "Ich wasche ___.", o: ["mich", "mir"], a: 0, why: "Nothing else: **mich**." },
            { at: "r1", k: "type", cx: true, q: "Du wäschst ___ die Hände.", a: ["dir"], r: ["refl.dat"], why: "A thing as well (die Hände): **dir**." },
            { at: "r2", k: "pick", q: "Ich putze ___ die Zähne.", o: ["mir", "mich", "meine"], a: 0, why: "The body: **mir die** Zähne." },
            { at: "r2", k: "pick", q: "It's cold — put a jacket on! (du)", o: ["Zieh dir eine Jacke an!", "Zieh dich eine Jacke an!"], a: 0, why: "A thing as well (eine Jacke): **dir**." },
            { at: "r3", k: "pick", q: "Sie kauft das nur für ___. (herself)", o: ["sich", "sie", "ihr"], a: 0, why: "After a preposition, the same person: **sich**." },
            { at: "r3", k: "pick", q: "Hast du Geld bei ___?", o: ["dir", "dich", "sich"], a: 0, why: "bei + dative, du: **dir**." },
            { at: "table", k: "pick", q: "Wir waschen ___ die Hände.", o: ["uns", "sich", "unsere"], a: 0, why: "wir: **uns**, either way." },
            { at: "trap", k: "pick", q: "I'm imagining it:", o: ["Ich stelle es mir vor.", "Ich stelle mich es vor."], a: 0, why: "A thing as well (es): **mir**." },
          ] },
      ],
      diag: [
        { t: "swap", from: "^(mich|dich)$", to: "^(mir|dir)$", rule: "refl.dat", msg: "There's a thing as well, so the person is dative: **{right}**." },
        { t: "swap", from: "^(mir|dir)$", to: "^(mich|dich)$", rule: "refl.dat", msg: "Nothing else is the object here: the accusative **{right}**." },
        { t: "swap", from: "^(ihn|sie|ihm|ihr|ihnen|er)$", to: "^sich$", rule: "refl.vs", msg: "The same person as the subject: **sich**." },
        { t: "swap", from: "^sich$", to: "^(mich|dich|uns|euch|mir|dir)$", rule: "refl.forms", msg: "**sich** is only for er, sie, es, man and Sie — here: **{right}**." },
        { t: "swap", from: "^sich$", to: "^(ihn|sie|ihm|ihr|ihnen)$", rule: "refl.vs", msg: "Another person, not the subject: **{right}** — no sich." },
        { t: "swap", from: "^(ich|du|er|wir|ihr)$", to: "^(mich|dich|sich|uns|euch|mir|dir)$", rule: "refl.forms", msg: "As the object: **{right}**." },
        { t: "swap", from: "^(meine|meinen|deine|deinen|seine|seinen|ihre|ihren|unsere|eure)$", to: "^(die|den|das)$", rule: "refl.body", msg: "Body and clothes: **mir die** … — the reflexive already says whose." },
        { t: "pos", tok: "^(mich|dich|sich|uns|euch)$", rule: "refl.verbs", msg: "The reflexive goes right after the verb (or after a pronoun subject) — it goes {where}." },
      ],
      drills: [
        // ── our own: which pronoun? ──
        { id: "drefl.p", t: "pick", title: "mich, dich, sich…", how: "Pick the pronoun.", items: [
          { q: "Ich freue ___ auf den Sommer.", o: ["mich", "mir", "sich"], a: ["mich"], r: ["refl.forms"] },
          { q: "Er setzt ___ neben mich.", o: ["sich", "ihn", "er"], a: ["sich"], r: ["refl.forms"] },
          { q: "Wir treffen ___ morgen.", o: ["uns", "sich", "euch"], a: ["uns"], r: ["refl.forms"] },
          { q: "Beeilt ___, der Zug fährt gleich!", o: ["euch", "sich", "uns"], a: ["euch"], r: ["refl.forms"] },
          { q: "Habt ihr ___ schon angezogen?", o: ["euch", "sich", "ihr"], a: ["euch"], r: ["refl.verbs"] },
          { q: "Die Kinder freuen ___ auf Weihnachten.", o: ["sich", "ihnen", "uns"], a: ["sich"], r: ["refl.forms"] },
          { q: "Sie hat ___ erkältet. (she)", o: ["sich", "ihr", "sie"], a: ["sich"], r: ["refl.verbs"] },
          { q: "Tom sieht seine Schwester und ruft ___. (her)", o: ["sie", "sich"], a: ["sie"], r: ["refl.vs"] },
          { q: "Tom sieht ___ im Schaufenster. (himself)", o: ["sich", "ihn"], a: ["sich"], r: ["refl.vs"] },
          { q: "Darf ich ___ kurz vorstellen?", o: ["mich", "mir", "sich"], a: ["mich"], r: ["refl.verbs"] },
          { q: "Herr Meier, setzen Sie ___ doch!", o: ["sich", "Sie", "Ihnen"], a: ["sich"], r: ["refl.forms"] },
        ] },
        // ── Übung 23•5: the object becomes the subject itself ──
        { id: "d23.5", ex: "23.5", t: "transform", title: "Do it to yourself", how: "Replace the highlighted object with a reflexive pronoun — the subject does it to itself.", items: [
          { q: "Ich stelle meinen Kollegen vor.", hl: "meinen Kollegen", a: ["Ich stelle mich vor."], r: ["refl.vs"] },
          { q: "Wir haben den Chef geärgert.", hl: "den Chef", a: ["Wir haben uns geärgert."], r: ["refl.vs"] },
          { q: "Du musst das Kind vor der Sonne schützen.", hl: "das Kind", a: ["Du musst dich vor der Sonne schützen."], r: ["refl.vs"] },
          { q: "Habt ihr die Kinder angezogen?", hl: "die Kinder", a: ["Habt ihr euch angezogen?"], r: ["refl.verbs"] },
          { q: "Tom fragt seine Frau: Wo ist mein Handy?", hl: "seine Frau", a: ["Tom fragt sich: Wo ist mein Handy?"], r: ["refl.vs"], cap: true },
          { q: "Frau Kunz setzt die Katze auf das Sofa.", hl: "die Katze", a: ["Frau Kunz setzt sich auf das Sofa."], r: ["refl.vs"], cap: true },
          { q: "Ich wasche den Hund.", hl: "den Hund", a: ["Ich wasche mich."], r: ["refl.forms"] },
          { q: "Sie kämmt ihre Tochter.", hl: "ihre Tochter", a: ["Sie kämmt sich."], r: ["refl.forms"] },
          { q: "Wir legen das Baby ins Bett.", hl: "das Baby", a: ["Wir legen uns ins Bett."], r: ["refl.forms"] },
          { q: "Die Eltern beruhigen die Kinder.", hl: "die Kinder", a: ["Die Eltern beruhigen sich."], r: ["refl.forms"] },
        ] },
        // ── Übung 23•6: the dative object becomes the subject itself ──
        { id: "d23.6", ex: "23.6", t: "transform", title: "Something for yourself", how: "Replace the highlighted person with a reflexive pronoun — there's a thing as well, so it's dative.", items: [
          { q: "Papa wäscht dem Baby die Haare.", hl: "dem Baby", a: ["Papa wäscht sich die Haare."], r: ["refl.body"], cap: true },
          { q: "Ich kaufe meinem Sohn ein Velo.", hl: "meinem Sohn", a: ["Ich kaufe mir ein Velo."], r: ["refl.dat"] },
          { q: "Tom und Lea wollen uns ein Auto kaufen.", hl: "uns", a: ["Tom und Lea wollen sich ein Auto kaufen."], r: ["refl.dat"], cap: true },
          { q: "Bestellst du deiner Freundin einen Kaffee?", hl: "deiner Freundin", a: ["Bestellst du dir einen Kaffee?"], r: ["refl.dat"] },
          { q: "Ich kämme meiner Tochter die Haare.", hl: "meiner Tochter", a: ["Ich kämme mir die Haare."], r: ["refl.body"] },
          { q: "Darf ich meinem Bruder noch ein Glas Wasser holen?", hl: "meinem Bruder", a: ["Darf ich mir noch ein Glas Wasser holen?"], r: ["refl.dat"] },
          { q: "Meine Schwester hat mir ein Buch ausgeliehen.", hl: "mir", a: ["Meine Schwester hat sich ein Buch ausgeliehen."], r: ["refl.dat"] },
          { q: "Er schenkt seiner Frau eine Uhr.", hl: "seiner Frau", a: ["Er schenkt sich eine Uhr."], r: ["refl.dat"] },
          { q: "Wir machen den Kindern ein Sandwich.", hl: "den Kindern", a: ["Wir machen uns ein Sandwich."], r: ["refl.dat"] },
          { q: "Zieht ihr den Kindern die Jacken an?", hl: "den Kindern", a: ["Zieht ihr euch die Jacken an?"], r: ["refl.body"] },
        ] },
        // ── Übung 23•7: accusative or dative — make it reflexive ──
        { id: "d23.7", ex: "23.7", t: "transform", title: "Mich or mir?", how: "Replace the highlighted person with a reflexive pronoun — accusative or dative, as the sentence needs.", items: [
          { q: "Er kann seinem Nachbarn nicht helfen.", hl: "seinem Nachbarn", a: ["Er kann sich nicht helfen."], r: ["refl.dat"] },
          { q: "Wir haben den neuen Kollegen vorgestellt.", hl: "den neuen Kollegen", a: ["Wir haben uns vorgestellt."], r: ["refl.vs"] },
          { q: "Sie erinnert ihren Mann an den Termin.", hl: "ihren Mann", a: ["Sie erinnert sich an den Termin."], r: ["refl.vs"] },
          { q: "Du sollst deine Schwester nicht ärgern.", hl: "deine Schwester", a: ["Du sollst dich nicht ärgern."], r: ["refl.forms"] },
          { q: "Herr Graf hat seiner Tochter ein Auto gekauft.", hl: "seiner Tochter", a: ["Herr Graf hat sich ein Auto gekauft."], r: ["refl.dat"], cap: true },
          { q: "Lea zieht ihren Sohn warm an.", hl: "ihren Sohn", a: ["Lea zieht sich warm an."], r: ["refl.verbs"], cap: true },
          { q: "Ich mache dir einen Tee.", hl: "dir", a: ["Ich mache mir einen Tee."], r: ["refl.dat"] },
          { q: "Wer holt den Kindern etwas zu trinken?", hl: "den Kindern", a: ["Wer holt sich etwas zu trinken?"], r: ["refl.dat"] },
          { q: "Ihr schützt die Kinder vor der Sonne.", hl: "die Kinder", a: ["Ihr schützt euch vor der Sonne."], r: ["refl.forms"] },
          { q: "Die Kinder holen uns ein Glace.", hl: "uns", a: ["Die Kinder holen sich ein Glace."], r: ["refl.dat"] },
        ] },
        // ── Übung 23•4: make the highlighted part reflexive — after a preposition too ──
        { id: "d23.4", ex: "23.4", t: "transform", title: "For yourself", how: "Replace the highlighted part with a reflexive pronoun — after a verb or after a preposition.", items: [
          { q: "Jonas kocht etwas für seine Eltern.", hl: "seine Eltern", a: ["Jonas kocht etwas für sich."], r: ["refl.prep"], cap: true },
          { q: "Du redest nur über deinen Hund.", hl: "deinen Hund", a: ["Du redest nur über dich."], r: ["refl.prep"] },
          { q: "Ich hole meinem Mann eine Decke.", hl: "meinem Mann", a: ["Ich hole mir eine Decke."], r: ["refl.dat"] },
          { q: "Mama setzt den Kleinen auf die Bank.", hl: "den Kleinen", a: ["Mama setzt sich auf die Bank."], r: ["refl.vs"], cap: true },
          { q: "Wer holt ihm ein Glas Wasser?", hl: "ihm", a: ["Wer holt sich ein Glas Wasser?"], r: ["refl.dat"] },
          { q: "Lea schaut ihre Schwester im Spiegel an.", hl: "ihre Schwester", a: ["Lea schaut sich im Spiegel an."], r: ["refl.vs"], cap: true },
          { q: "Föhnst du deiner Tochter die Haare?", hl: "deiner Tochter", a: ["Föhnst du dir die Haare?"], r: ["refl.body"] },
          { q: "Ich frage meine Kollegin, wie spät es ist.", hl: "meine Kollegin", a: ["Ich frage mich, wie spät es ist."], r: ["refl.vs"] },
          { q: "Die Oma kauft der Nachbarin Blumen.", hl: "der Nachbarin", a: ["Die Oma kauft sich Blumen."], r: ["refl.dat"] },
          { q: "Wir suchen ein Hotel für unsere Eltern.", hl: "unsere Eltern", a: ["Wir suchen ein Hotel für uns."], r: ["refl.prep"] },
          { q: "Erinnerst du deinen Mann an den Geburtstag?", hl: "deinen Mann", a: ["Erinnerst du dich an den Geburtstag?"], r: ["refl.verbs"] },
          { q: "Kann ich das Kind hier umziehen?", hl: "das Kind", a: ["Kann ich mich hier umziehen?"], r: ["refl.verbs"] },
        ] },
        // ── Übung 23•8: the same sentence, a new subject ──
        { id: "d23.8", ex: "23.8", t: "transform", title: "A new subject", how: "Say it for the person in brackets — the verb changes, and the pronoun becomes reflexive.", items: [
          { q: "(ich) Mia kauft das nur für ihn.", a: ["Ich kaufe das nur für mich."], r: ["refl.prep"], vf: [["kaufen", "pr", "ich"]] },
          { q: "(du) Mia kauft das nur für ihn.", a: ["Du kaufst das nur für dich."], r: ["refl.prep"], vf: [["kaufen", "pr", "du"]] },
          { q: "(wir) Mia kauft das nur für ihn.", a: ["Wir kaufen das nur für uns."], r: ["refl.prep"], vf: [["kaufen", "pr", "wir"]] },
          { q: "(die Kinder) Mia kauft das nur für ihn.", a: ["Die Kinder kaufen das nur für sich."], r: ["refl.prep"], vf: [["kaufen", "pr", "sie"]] },
          { q: "(ich) Papa bestellt mir eine Pizza.", a: ["Ich bestelle mir eine Pizza."], r: ["refl.dat"], vf: [["bestellen", "pr", "ich"]] },
          { q: "(er) Papa bestellt mir eine Pizza.", a: ["Er bestellt sich eine Pizza."], r: ["refl.dat"], vf: [["bestellen", "pr", "er"]] },
          { q: "(ihr) Papa bestellt mir eine Pizza.", a: ["Ihr bestellt euch eine Pizza."], r: ["refl.dat"], vf: [["bestellen", "pr", "ihr"]] },
          { q: "(du) Papa bestellt mir eine Pizza.", a: ["Du bestellst dir eine Pizza."], r: ["refl.dat"], vf: [["bestellen", "pr", "du"]] },
          { q: "(ich) Lea zieht ihre Tochter an.", a: ["Ich ziehe mich an."], r: ["refl.forms"] },
          { q: "(wir) Lea zieht ihre Tochter an.", a: ["Wir ziehen uns an."], r: ["refl.forms"] },
          { q: "(Tom) Lea zieht ihre Tochter an.", a: ["Tom zieht sich an."], r: ["refl.forms"], cap: true },
          { q: "(Sie) Lea zieht ihre Tochter an.", a: ["Sie ziehen sich an."], r: ["refl.forms"] },
        ] },
        // ── Übung 23•10: which pronoun? ──
        { id: "d23.10", ex: "23.10", t: "pick", title: "Which pronoun?", how: "Pick the pronoun that completes the sentence.", items: [
          { q: "Ich habe ___ ein neues Handy gekauft.", o: ["mir", "mich", "sich"], a: ["mir"], r: ["refl.dat"] },
          { q: "Hast du ___ schon wieder erkältet?", o: ["dich", "dir", "sich"], a: ["dich"], r: ["refl.verbs"] },
          { q: "Nina möchte ___ einen Hund kaufen.", o: ["sich", "sie", "ihr"], a: ["sich"], r: ["refl.dat"] },
          { q: "Habt ihr ___ gut ausgeruht?", o: ["euch", "sich", "uns"], a: ["euch"], r: ["refl.verbs"] },
          { q: "Ich möchte ___ kurz vorstellen: Ich bin die neue Lehrerin.", o: ["mich", "mir", "sich"], a: ["mich"], r: ["refl.verbs"] },
          { q: "Ich ziehe ___ schnell die Schuhe aus.", o: ["mir", "mich", "sich"], a: ["mir"], r: ["refl.body"] },
          { q: "Hast du ___ die Hände gewaschen?", o: ["dir", "dich", "sich"], a: ["dir"], r: ["refl.body"] },
          { q: "Zieh ___ schnell um, wir gehen gleich!", o: ["dich", "dir", "sich"], a: ["dich"], r: ["refl.verbs"] },
          { q: "Wir kochen ___ heute etwas Feines.", o: ["uns", "sich", "euch"], a: ["uns"], r: ["refl.dat"] },
          { q: "Sie hat das Geschenk nur für ___ gekauft. (herself)", o: ["sich", "sie", "ihr"], a: ["sich"], r: ["refl.prep"] },
          { q: "Hast du deinen Ausweis bei ___?", o: ["dir", "dich", "sich"], a: ["dir"], r: ["refl.prep"] },
        ] },
        // ── Production: build it, say it ──
        { id: "dp.refl", t: "compose", end: true, title: "Build it yourself", how: "Make a sentence — sich becomes mich, dich, uns… as the subject needs.", d: ["sich", "mich"], items: [
          { w: ["ich", "sich freuen", "auf", "das Wochenende"], a: ["Ich freue mich auf das Wochenende.", "Ich freue mich aufs Wochenende."], r: ["refl.verbs"] },
          { w: ["wir", "sich treffen", "um sieben", "vor dem Kino"], a: ["Wir treffen uns um sieben vor dem Kino."], r: ["refl.forms"] },
          { w: ["du", "sich beeilen", "müssen"], a: ["Du musst dich beeilen."], r: ["refl.forms"] },
          { w: ["er", "sich", "die Hände", "waschen"], a: ["Er wäscht sich die Hände."], r: ["refl.body"], vf: [["waschen", "pr", "er"]] },
          { w: ["ich", "sich", "ein neues Velo", "kaufen"], a: ["Ich kaufe mir ein neues Velo."], r: ["refl.dat"] },
          { k: "translate", q: "Sit down, please. (Sie)", a: ["Setzen Sie sich bitte!", "Bitte setzen Sie sich!", "Setzen Sie sich, bitte!"], r: ["refl.forms"] },
          { k: "translate", q: "I've caught a cold.", a: ["Ich habe mich erkältet."], r: ["refl.verbs"] },
          { k: "translate", q: "Brush your teeth! (du)", a: ["Putz dir die Zähne!", "Putze dir die Zähne!"], r: ["refl.body"] },
          { k: "translate", q: "May I introduce myself? I'm Ana.", a: ["Darf ich mich vorstellen? Ich bin Ana.", "Darf ich mich vorstellen? Ich heiße Ana."], r: ["refl.verbs"] },
          { k: "translate", q: "She's buying herself a coat.", a: ["Sie kauft sich einen Mantel."], r: ["refl.dat"] },
          { k: "translate", q: "We're looking forward to the holidays.", a: ["Wir freuen uns auf die Ferien."], r: ["refl.verbs"] },
        ] },
        // ── Übung 23•9: the other way round — a noun for the reflexive ──
        { id: "d23.9", ex: "23.9", t: "write", end: true, title: "For someone else", how: "Make it about someone else — a noun instead of the reflexive. Saved for Claude to correct.", items: [
          { q: "Ich kaufe mir einen warmen Pullover. — for whom else?", model: ["Ich kaufe meinem Vater einen warmen Pullover."], r: ["refl.dat"] },
          { q: "Braucht ihr das Geld für euch? — for whom else?", model: ["Braucht ihr das Geld für eure Kinder?"], r: ["refl.prep"] },
          { q: "Sie setzt sich auf die Bank. — whom does she put there?", model: ["Sie setzt ihren kleinen Sohn auf die Bank."], r: ["refl.vs"] },
          { q: "Er stellt sich neben die Tür. — what does he put there?", model: ["Er stellt den Koffer neben die Tür."], r: ["refl.vs"] },
          { q: "Meine Eltern haben sich ein Haus gekauft. — for whom?", model: ["Meine Eltern haben meinem Bruder ein Haus gekauft."], r: ["refl.dat"] },
          { q: "Ich frage mich, wie das geht. — whom do you ask?", model: ["Ich frage meine Nachbarin, wie das geht."], r: ["refl.vs"] },
          { q: "Wir machen uns einen Kaffee. — for whom?", model: ["Wir machen unseren Gästen einen Kaffee."], r: ["refl.dat"] },
          { q: "Du ziehst dich warm an. — whom do you dress?", model: ["Du ziehst die Kinder warm an."], r: ["refl.vs"] },
          { q: "Er wäscht sich die Hände. — whose hands?", model: ["Er wäscht seinem Sohn die Hände."], r: ["refl.body"] },
          { q: "Ich stelle mich vor. — whom do you introduce?", model: ["Ich stelle meinen neuen Kollegen vor."], r: ["refl.vs"] },
        ] },
        { id: "dw.refl", t: "write", end: true, title: "Write your own", how: "In your own words — saved for Claude to correct.", items: [
          { q: "Your morning routine (sich waschen, sich anziehen, sich die Zähne putzen…).", model: ["Ich stehe um sechs auf, dusche und ziehe mich an. Dann putze ich mir die Zähne."], r: ["refl.forms", "refl.body"] },
          { q: "What are you looking forward to? (sich freuen auf)", model: ["Ich freue mich auf die Ferien und auf den Besuch meiner Schwester."], r: ["refl.verbs"] },
          { q: "Introduce yourself to a new colleague.", model: ["Darf ich mich vorstellen? Ich heiße Ana und arbeite seit Montag hier."], r: ["refl.verbs"] },
          { q: "Something you treated yourself to recently.", model: ["Letzte Woche habe ich mir ein neues Velo gekauft."], r: ["refl.dat"] },
          { q: "Were you ill this year? What happened?", model: ["Im Januar habe ich mich erkältet und musste mich eine Woche ausruhen."], r: ["refl.verbs"] },
          { q: "Meeting friends: where and when do you meet? (sich treffen)", model: ["Wir treffen uns jeden Freitag um sieben im Café am See."], r: ["refl.forms"] },
          { q: "Your life in five years — what do you imagine? (Ich stelle mir vor, …)", model: ["Ich stelle mir vor, dass ich in einem kleinen Haus mit Garten wohne."], r: ["refl.dat"] },
          { q: "When do you have to hurry? (sich beeilen)", model: ["Am Morgen muss ich mich immer beeilen, weil der Bus um sieben fährt."], r: ["refl.verbs"] },
        ] },
      ],
    },
  },
});

// What chapter 23 became.
cxCover({
  "23.4": "d23.4", "23.5": "d23.5", "23.6": "d23.6", "23.7": "d23.7", "23.8": "d23.8", "23.9": "d23.9", "23.10": "d23.10",
  // the rest of chapter 23: later lessons, which upload it again
  "23.1": { st: "planned", sec: "s1.adj" }, "23.2": { st: "planned", sec: "s1.adj" },
  "23.3": { st: "planned", sec: "s2.adv" },
  "23.11": { st: "planned", sec: "s2.indq" }, "23.13": { st: "planned", sec: "s2.conj3" },
});
