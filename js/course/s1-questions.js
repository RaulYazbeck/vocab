// ── COURSE PACK · Stage 1 · wer / wen / wem, welcher, was für ──
// Book: chapter 28 "Wer" and "Was" (Übung 28•13 · 28•14), chapter 7's
// wer or was (7•13), chapter 13's wessen (13•6). Two sheets: the question
// word takes the case of what it asks about (wer, wen, wem, wessen, was)
// — then welcher and was für ein. It comes right after the dative lessons:
// wem? is the dative's question. Chapter 13's other opening exercises go to
// the lessons they practise (below); 13•2 and 13•7 are drilled by the
// Stage 0 sets that ask the same (d7.4, d28.17).
cxPack({
  id: "s1-questions",
  sections: {
    "s1.wer": {
      // (no test-out after Stage 0 — sized so a check of every rule fits)
      testout: { n: 7, miss: 1 },
      rules: {
        "wer.case": "wer (subject) · wen (accusative) · wem (dative)",
        "wer.prep": "a preposition first: mit wem? für wen?",
        "wer.was": "was for things — wer and was take a singular verb",
        "wer.wessen": "wessen? whose? — the answer: mein, sein, ihr…",
        "wer.welch": "welcher takes der's endings: welchen, welchem…",
        "wer.wasfur": "was für ein = what kind of; ein takes the noun's case",
        "wer.answer": "welcher → point to one · was für → describe it",
      },
      sheets: [
        { id: "cx.wer1", title: "wer, wen, wem, wessen — the question takes the case", qn: 3,
          struct: [["wer?", "who"], ["wen?", "thing"], ["wem?", "aux"], ["wessen?", "pre"]],
          why: "The question word for a person changes like **der**: **wer** (der) → **wen** (den) → **wem** (dem) — and **wessen** (whose). Ask with the case of the part you ask about. For things it's simply **was**.",
          rid: ["wer.case", "wer.prep", "wer.was", "wer.wessen"],
          rules: [
            "Ask with the case of the part you replace — the subject: **wer** · the accusative: **wen** · the dative: **wem**: **Wer** hilft dir? — Mein Bruder. · **Wen** besuchst du? — Meinen Opa. · **Wem** gibst du das Buch? — Meiner Schwester.",
            "With a preposition, the preposition comes first and decides the case: **für wen** · **ohne wen** · **mit wem** · **bei wem** · **von wem**: **Mit wem** gehst du ins Kino? · **Für wen** sind die Blumen?",
            "For things: **was** — as the subject and as the object: **Was** ist passiert? · **Was** kaufst du? **wer** and **was** take a singular verb, even when the answer is plural: **Wer kommt** heute? — Anna und Tom.",
            "**wessen** asks *whose* — the answer is a possessive: **Wessen** Jacke ist das? — Das ist **meine** Jacke. (In everyday speech also: **Wem gehört** die Jacke?)",
          ],
          table: { head: ["you ask about…", "the question", "the answer"], rows: [
            ["the subject", "**Wer** ruft an?", "**Der** Chef."],
            ["the accusative", "**Wen** rufst du an?", "**Den** Chef."],
            ["the dative", "**Wem** schreibst du?", "**Dem** Chef."],
            ["a preposition + a person", "**Mit wem** sprichst du?", "Mit **dem** Chef."],
            ["the owner", "**Wessen** Auto ist das?", "**Sein** Auto."],
            ["a thing", "**Was** brauchst du?", "Einen Stift."],
          ] },
          ex: [
            ["**Wen** hast du gestern im Zug getroffen?", "Who did you meet on the train yesterday?"],
            ["**Wem** gehört dieser Rucksack?", "Who does this rucksack belong to?"],
            ["**Mit wem** fährst du in die Ferien?", "Who are you going on holiday with?"],
            ["**Wessen** Handy klingelt da?", "Whose phone is ringing there?"],
          ],
          trap: "English *who* covers all three — German doesn't: *Who did you see?* = **Wen** hast du gesehen? · *Who did you help?* = **Wem** hast du geholfen? (helfen + dative). And *Who with?* is **Mit wem?**, never ~~Wer mit?~~",
          quiz: [
            { at: "r1", k: "pick", q: "___ besuchst du am Sonntag? — Meine Großeltern.", o: ["Wen", "Wer", "Wem"], a: 0, why: "besuchen + accusative: **wen**." },
            { at: "r1", k: "pick", q: "___ hast du das Geld gegeben? — Dem Kellner.", o: ["Wem", "Wen", "Wer"], a: 0, why: "To whom? → the dative: **wem**." },
            { at: "r1", k: "pick", q: "___ hat angerufen? — Deine Mutter.", o: ["Wer", "Wen", "Wem"], a: 0, why: "The subject: **wer**." },
            { at: "r2", k: "pick", q: "___ gehst du ins Kino? — Mit Lisa.", o: ["Mit wem", "Mit wen", "Mit wer"], a: 0, why: "mit + dative: **mit wem**." },
            { at: "r2", k: "type", cx: true, q: "Für ___ ist der Kuchen? — Für dich.", a: ["wen"], r: ["wer.prep"], why: "für + accusative: **für wen**." },
            { at: "r3", k: "pick", q: "___ ist in der Tasche? — Ein Buch.", o: ["Was", "Wer", "Wen"], a: 0, why: "A thing: **was**." },
            { at: "r3", k: "pick", q: "Wer ___ heute Abend? — Tom und Lea.", o: ["kommt", "kommen"], a: 0, why: "wer takes the singular: **kommt**." },
            { at: "r4", k: "pick", q: "___ Schlüssel ist das? — Das ist meiner.", o: ["Wessen", "Wem", "Wer"], a: 0, why: "Whose: **wessen**." },
            { at: "table", k: "pick", q: "Who did you help? —", o: ["Wem hast du geholfen?", "Wen hast du geholfen?", "Wer hast du geholfen?"], a: 0, why: "helfen + dative: **wem**." },
            { at: "trap", k: "pick", q: "Who did you see? —", o: ["Wen hast du gesehen?", "Wer hast du gesehen?", "Wem hast du gesehen?"], a: 0, why: "sehen + accusative: **wen**." },
          ] },
        { id: "cx.wer2", title: "welcher? and was für ein?", qn: 3,
          struct: [["welcher?", "verb"], ["this one", "mid"], ["·", "mid"], ["was für ein?", "aux"], ["what kind", "mid"]],
          why: "**welcher** asks *which one* — out of a group you can see or name. **was für ein** asks *what kind of*. Both stand right before the noun and take its case.",
          rid: ["wer.welch", "wer.wasfur", "wer.answer"],
          rules: [
            "**welcher** takes der's endings, in every case: **Welcher** Bus fährt zum Bahnhof? · **Welchen** Film siehst du? · Mit **welchem** Zug kommst du? · **Welche** Schuhe nimmst du?",
            "**was für ein** = what kind of — **ein** takes the noun's case, as always: **Was für ein** Auto hast du? · In **was für einer** Wohnung wohnst du? In the plural, and with nouns you don't count, no ein: **Was für** Schuhe? · **Was für** Musik?",
            "Answer **welcher** by pointing to one: **den hier** · **diesen** · den um acht. Answer **was für ein** by describing it: **einen** mit Balkon · **ein** Elektroauto · **eine** für den Winter.",
          ],
          table: { head: ["", "m", "f", "n", "plural"], rows: [
            ["subject", "welch**er**", "welch**e**", "welch**es**", "welch**e**"],
            ["accusative", "welch**en**", "welch**e**", "welch**es**", "welch**e**"],
            ["dative", "welch**em**", "welch**er**", "welch**em**", "welch**en**"],
            ["what kind of", "was für ein(en)", "was für eine", "was für ein", "was für —"],
          ] },
          ex: [
            ["**Welcher** Zug fährt nach Luzern?", "Which train goes to Lucerne?"],
            ["Mit **welchem** Bus kommst du?", "Which bus are you coming on?"],
            ["**Was für eine** Wohnung sucht ihr?", "What kind of flat are you looking for?"],
            ["**Was für** Musik hörst du gern?", "What kind of music do you like?"],
          ],
          trap: "In **was für ein**, *für* takes no case of its own — **ein** follows its noun's role in the sentence: **Was für ein** Mann ist das? (the subject) · Mit **was für einem** Auto fährst du? (mit + dative).",
          quiz: [
            { at: "r1", k: "pick", q: "___ Bus nimmst du? — Den um acht.", o: ["Welchen", "Welcher", "Welchem"], a: 0, why: "der Bus as the object: **welchen**." },
            { at: "r1", k: "type", cx: true, q: "Mit ___ Zug fährst du? (welcher)", a: ["welchem"], r: ["wer.welch"], why: "mit + dative: **welchem**." },
            { at: "r1", k: "pick", q: "___ Jacke gefällt dir? — Die rote.", o: ["Welche", "Welchen", "Welcher"], a: 0, why: "die Jacke as the subject: **welche**." },
            { at: "r2", k: "pick", q: "___ Auto hast du? — Ein Elektroauto.", o: ["Was für ein", "Was für einen", "Welchen"], a: 0, why: "das Auto: **was für ein**." },
            { at: "r2", k: "pick", q: "___ Bücher liest du gern? — Krimis.", o: ["Was für", "Was für ein", "Welcher"], a: 0, why: "Plural: **was für** — no ein." },
            { at: "r3", k: "pick", q: "Welchen Pullover nimmst du? — ___", o: ["Diesen hier.", "Einen aus Wolle.", "Ein Pullover."], a: 0, why: "welcher → point to one." },
            { at: "r3", k: "pick", q: "Was für einen Hund habt ihr? — ___", o: ["Einen kleinen Terrier.", "Den da.", "Welchen?"], a: 0, why: "was für → describe it." },
            { at: "table", k: "pick", q: "___ Kind gehört das Velo?", o: ["Welchem", "Welches", "Welchen"], a: 0, why: "gehören + dative: **welchem**." },
            { at: "trap", k: "pick", q: "Mit ___ Auto fährst du?", o: ["was für einem", "was für ein", "was für einen"], a: 0, why: "mit + dative: **was für einem**." },
          ] },
      ],
      diag: [
        { t: "seq", seq: ["^(mit|bei|von|zu|nach|aus)$", "^(wen|wer)$"], rule: "wer.prep", msg: "«{typed}»: mit, bei, von, zu, nach and aus take the dative — **wem**." },
        { t: "seq", seq: ["^(fur|ohne|gegen|durch|um|auf)$", "^(wem|wer)$"], rule: "wer.prep", msg: "«{typed}»: für, ohne, gegen, durch and auf … warten take the accusative — **wen**." },
        { t: "swap", from: "^(wer|wem)$", to: "^wen$", rule: "wer.case", msg: "You're asking for the accusative (whom?): **wen**." },
        { t: "swap", from: "^(wer|wen)$", to: "^wem$", rule: "wer.case", msg: "You're asking for the dative (to whom? with whom?): **wem**." },
        { t: "swap", from: "^(wen|wem)$", to: "^wer$", rule: "wer.case", msg: "You're asking for the subject: **wer**." },
        { t: "swap", from: "^(wer|wen|wem)$", to: "^was$", rule: "wer.was", msg: "A thing: **was**." },
        { t: "swap", from: "^(wer|wen|wem|was)$", to: "^wessen$", rule: "wer.wessen", msg: "Whose: **wessen**." },
        { t: "ending", stem: "welch", rule: "wer.welch", msg: "welcher takes der's endings: **{right}**." },
        { t: "ending", stem: "k?ein", rule: "wer.wasfur", msg: "In was für ein, ein takes the noun's case: **{right}**." },
        { t: "swap", from: "^(haben|sind|kommen|wohnen|warten|kosten|stehen)$", to: "^(hat|ist|kommt|wohnt|wartet|kostet|steht)$", rule: "wer.was", msg: "wer and was take the singular: **{right}**." },
      ],
      drills: [
        // ── our own: which question word? ──
        { id: "dwer.p", t: "pick", title: "wer, wen or wem?", how: "Pick the question word the answer asks for.", items: [
          { q: "___ hilfst du? — Meiner Oma.", o: ["Wem", "Wen", "Wer"], a: ["Wem"], r: ["wer.case"] },
          { q: "___ suchst du? — Meinen Bruder.", o: ["Wen", "Wem", "Wer"], a: ["Wen"], r: ["wer.case"] },
          { q: "___ wohnt in dieser Wohnung? — Familie Huber.", o: ["Wer", "Wen", "Wem"], a: ["Wer"], r: ["wer.case"] },
          { q: "___ fährst du nach Genf? — Mit meiner Kollegin.", o: ["Mit wem", "Mit wen", "Mit was"], a: ["Mit wem"], r: ["wer.prep"] },
          { q: "___ ist der Brief? — Für Herrn Graf.", o: ["Für wen", "Für wem", "Für wer"], a: ["Für wen"], r: ["wer.prep"] },
          { q: "___ möchtest du trinken? — Einen Tee.", o: ["Was", "Wen", "Wer"], a: ["Was"], r: ["wer.was"] },
          { q: "___ gehört die Brille? — Dem Lehrer.", o: ["Wem", "Wessen", "Wen"], a: ["Wem"], r: ["wer.case"] },
          { q: "___ Brille ist das? — Die vom Lehrer.", o: ["Wessen", "Wem", "Wer"], a: ["Wessen"], r: ["wer.wessen"] },
          { q: "___ hast du am Wochenende gesprochen? — Mit niemandem.", o: ["Mit wem", "Wen", "Wer"], a: ["Mit wem"], r: ["wer.prep"] },
          { q: "Wer ___ heute mit? — Tom und Lea.", o: ["kommt", "kommen"], a: ["kommt"], r: ["wer.was"] },
          { q: "___ hast du gestern geholfen? — Meinem Nachbarn.", o: ["Wem", "Wen", "Wer"], a: ["Wem"], r: ["wer.case"] },
        ] },
        // ── Übung 7•13: wer or was? ──
        { id: "d7.13", ex: "7.13", t: "transform", low: true, title: "Ask with wer, wen or was", how: "Ask about the highlighted part — wer, wen or was.", items: [
          { q: "Sara kennt ihn nicht.", hl: "ihn", a: ["Wen kennt Sara nicht?"], r: ["wer.case"] },
          { q: "Tim kauft ein Geschenk für seine Mutter.", hl: "ein Geschenk", a: ["Was kauft Tim für seine Mutter?"], r: ["wer.was"] },
          { q: "Der Hauswart hat die Heizung repariert.", hl: "Der Hauswart", a: ["Wer hat die Heizung repariert?"], r: ["wer.case"] },
          { q: "Lena hat den Arzt angerufen.", hl: "den Arzt", a: ["Wen hat Lena angerufen?"], r: ["wer.case"] },
          { q: "Der Lärm stört die Nachbarn.", hl: "Der Lärm", a: ["Was stört die Nachbarn?"], r: ["wer.was"] },
          { q: "Anna und Ben treffen Paul am Bahnhof.", hl: "Paul", a: ["Wen treffen Anna und Ben am Bahnhof?"], r: ["wer.case"] },
          { q: "Mein Bruder sucht eine Wohnung.", hl: "Mein Bruder", a: ["Wer sucht eine Wohnung?"], r: ["wer.case"] },
          { q: "Die Kinder haben den Kuchen gegessen.", hl: "den Kuchen", a: ["Was haben die Kinder gegessen?"], r: ["wer.was"] },
          { q: "Die Lehrerin lobt den Schüler.", hl: "den Schüler", a: ["Wen lobt die Lehrerin?"], r: ["wer.case"] },
          { q: "Das Paket ist gestern angekommen.", hl: "Das Paket", a: ["Was ist gestern angekommen?"], r: ["wer.was"] },
          { q: "Herr Graf hat Frau Meier gesehen.", hl: "Herr Graf", a: ["Wer hat Frau Meier gesehen?"], r: ["wer.case"] },
        ] },
        // ── Übung 28•13: wer, wen, wem or wessen? ──
        { id: "d28.13", ex: "28.13", t: "transform", low: true, title: "wer, wen, wem or wessen?", how: "Ask about the highlighted part — with wer, wen, wem or wessen (a preposition stays in front).", items: [
          { q: "Lisa hilft ihrem Vater beim Umzug.", hl: "ihrem Vater", a: ["Wem hilft Lisa beim Umzug?"], r: ["wer.case"] },
          { q: "Tom tanzt mit der neuen Kollegin.", hl: "mit der neuen Kollegin", a: ["Mit wem tanzt Tom?"], r: ["wer.prep"] },
          { q: "Die Großeltern schicken den Kindern ein Paket.", hl: "den Kindern", a: ["Wem schicken die Großeltern ein Paket?"], r: ["wer.case"] },
          { q: "Die Blumen sind für Anna.", hl: "für Anna", a: ["Für wen sind die Blumen?"], r: ["wer.prep"] },
          { q: "Die Nachbarn haben Frau Kunz besucht.", hl: "Die Nachbarn", a: ["Wer hat Frau Kunz besucht?"], r: ["wer.case", "wer.was"] },
          { q: "Ihr Cousin ist Koch geworden.", hl: "Ihr", a: ["Wessen Cousin ist Koch geworden?"], r: ["wer.wessen"] },
          { q: "Die Kinder warten auf ihre Mutter.", hl: "auf ihre Mutter", a: ["Auf wen warten die Kinder?"], r: ["wer.prep"] },
          { q: "Der Chef hat Sandra gelobt.", hl: "Sandra", a: ["Wen hat der Chef gelobt?"], r: ["wer.case"] },
          { q: "Das Velo gehört meinem Nachbarn.", hl: "meinem Nachbarn", a: ["Wem gehört das Velo?"], r: ["wer.case"] },
          { q: "Ich gehe mit Lara ins Kino.", hl: "mit Lara", a: ["Mit wem gehst du ins Kino?"], r: ["wer.prep"] },
          { q: "Unsere Katze schläft auf dem Sofa.", hl: "Unsere", a: ["Wessen Katze schläft auf dem Sofa?"], r: ["wer.wessen"] },
        ] },
        // ── Übung 28•14: was, wem or wessen? ──
        { id: "d28.14", ex: "28.14", t: "transform", low: true, title: "was, wem or wessen?", how: "Ask about the highlighted part — was, wem or wessen.", items: [
          { q: "Ich habe die Jacke im Laden gesehen.", hl: "die Jacke", a: ["Was hast du im Laden gesehen?"], r: ["wer.was"] },
          { q: "Der Gärtner gibt den Blumen Wasser.", hl: "den Blumen", a: ["Wem gibt der Gärtner Wasser?"], r: ["wer.case"] },
          { q: "Die Bauern im Dorf halten Kühe.", hl: "Kühe", a: ["Was halten die Bauern im Dorf?"], r: ["wer.was"] },
          { q: "Unser Hund hat eine kalte Nase.", hl: "Unser", a: ["Wessen Hund hat eine kalte Nase?"], r: ["wer.wessen"] },
          { q: "Der Regen macht die Kinder müde.", hl: "Der Regen", a: ["Was macht die Kinder müde?"], r: ["wer.was"] },
          { q: "Die Kinder geben dem Hund einen Knochen.", hl: "dem Hund", a: ["Wem geben die Kinder einen Knochen?"], r: ["wer.case"] },
          { q: "Ihr Koffer ist sehr schwer.", hl: "Ihr", a: ["Wessen Koffer ist sehr schwer?"], r: ["wer.wessen"] },
          { q: "Diese Schuhe kosten achtzig Franken.", hl: "Diese Schuhe", a: ["Was kostet achtzig Franken?"], r: ["wer.was"], note: "was takes the singular: *Was kostet …?* — even for the shoes." },
          { q: "Im Kühlschrank stehen drei Flaschen.", hl: "drei Flaschen", a: ["Was steht im Kühlschrank?"], r: ["wer.was"] },
          { q: "Der Bäcker verkauft frisches Brot.", hl: "frisches Brot", a: ["Was verkauft der Bäcker?"], r: ["wer.was"] },
        ] },
        // ── our own: welcher in every case ──
        { id: "dwer.w", t: "type", title: "welcher, welchen, welchem…", how: "Write welcher with the ending the noun needs here.", items: [
          { q: "___ Bus fährt zum Bahnhof? (welcher)", a: ["Welcher"], r: ["wer.welch"] },
          { q: "___ Film möchtest du sehen? (welcher)", a: ["Welchen"], r: ["wer.welch"] },
          { q: "Mit ___ Zug kommst du? (welcher)", a: ["welchem"], r: ["wer.welch"] },
          { q: "___ Schuhe ziehst du an? (welcher)", a: ["Welche"], r: ["wer.welch"] },
          { q: "In ___ Stadt wohnt deine Schwester? (welcher)", a: ["welcher"], r: ["wer.welch"] },
          { q: "___ Kind hat heute Geburtstag? (welcher)", a: ["Welches"], r: ["wer.welch"] },
          { q: "___ Kollegen hast du eingeladen? (welcher — plural)", a: ["Welche"], r: ["wer.welch"] },
          { q: "___ Kollegin gibst du den Schlüssel? (welcher)", a: ["Welcher"], r: ["wer.welch"] },
          { q: "Für ___ Kurs hast du dich angemeldet? (welcher)", a: ["welchen"], r: ["wer.welch"] },
          { q: "Bei ___ Arzt bist du? (welcher)", a: ["welchem"], r: ["wer.welch"] },
        ] },
        // ── our own: which one, or what kind? ──
        { id: "dwer.f", t: "pick", title: "welcher or was für?", how: "Which one of these → welcher · what kind of → was für ein.", items: [
          { q: "___ Zug nimmst du — den um sieben oder den um acht?", o: ["Welchen", "Was für einen"], a: ["Welchen"], r: ["wer.wasfur"] },
          { q: "___ Auto möchtest du kaufen? — Ein kleines, für die Stadt.", o: ["Was für ein", "Welches"], a: ["Was für ein"], r: ["wer.wasfur"] },
          { q: "___ Wohnung sucht ihr? — Eine mit Balkon.", o: ["Was für eine", "Welche"], a: ["Was für eine"], r: ["wer.wasfur"] },
          { q: "___ von den zwei Jacken gefällt dir?", o: ["Welche", "Was für eine"], a: ["Welche"], r: ["wer.wasfur"] },
          { q: "___ Musik hörst du gern? — Am liebsten Jazz.", o: ["Was für", "Welcher"], a: ["Was für"], r: ["wer.wasfur"] },
          { q: "Mit ___ Bus fährst du? — Mit dem Vierer.", o: ["welchem", "was für einem"], a: ["welchem"], r: ["wer.wasfur"] },
          { q: "In ___ Haus wohnt ihr? — In einem alten Bauernhaus.", o: ["was für einem", "welchem"], a: ["was für einem"], r: ["wer.wasfur"] },
          { q: "Welchen Pullover nimmst du? — ___", o: ["Den blauen hier.", "Einen aus Wolle."], a: ["Den blauen hier."], r: ["wer.answer"] },
          { q: "Was für einen Hund habt ihr? — ___", o: ["Einen kleinen Terrier.", "Den da."], a: ["Einen kleinen Terrier."], r: ["wer.answer"] },
          { q: "Was für ein Mensch ist deine Chefin? — ___", o: ["Eine sehr nette Frau.", "Diese hier."], a: ["Eine sehr nette Frau."], r: ["wer.answer"] },
          { q: "Welcher Schlüssel ist für die Haustür? — ___", o: ["Der große hier.", "Ein alter."], a: ["Der große hier."], r: ["wer.answer"] },
        ] },
        // ── Übung 13•6: whose? ──
        { id: "d13.6", ex: "13.6", t: "answer", title: "Whose is it?", how: "Answer with the possessive of the person in brackets.", items: [
          { q: "Wessen Jacke ist das? (ich)", a: ["Das ist meine Jacke.", "Das ist meine."], r: ["wer.wessen"] },
          { q: "Wessen Hut ist das? (er)", a: ["Das ist sein Hut.", "Das ist seiner."], r: ["wer.wessen"] },
          { q: "Wessen Schlüssel ist das? (sie — she)", a: ["Das ist ihr Schlüssel.", "Das ist ihrer."], r: ["wer.wessen"] },
          { q: "Wessen Auto ist das? (wir)", a: ["Das ist unser Auto.", "Das ist unseres.", "Das ist unsers."], r: ["wer.wessen"] },
          { q: "Wessen Kinder sind das? (ihr)", a: ["Das sind eure Kinder.", "Das sind eure."], r: ["wer.wessen"] },
          { q: "Wessen Tasche ist das? (Sie)", a: ["Das ist Ihre Tasche.", "Das ist Ihre."], r: ["wer.wessen"] },
          { q: "Wessen Velo ist das? (du)", a: ["Das ist dein Velo.", "Das ist deins.", "Das ist deines."], r: ["wer.wessen"] },
          { q: "Wessen Eltern wohnen in Bern? (sie — they)", a: ["Ihre Eltern wohnen in Bern."], r: ["wer.wessen"] },
          { q: "Wessen Hund bellt so laut? (er)", a: ["Sein Hund bellt so laut."], r: ["wer.wessen"] },
          { q: "Wessen Freund kommt heute? (ich)", a: ["Mein Freund kommt heute."], r: ["wer.wessen"] },
        ] },
        // ── Production: say it ──
        { id: "dp.wer", t: "translate", end: true, title: "Ask it in German", how: "Translate the question — the question word in its case.", items: [
          { q: "Who did you see at the station? (du)", a: ["Wen hast du am Bahnhof gesehen?"], r: ["wer.case"] },
          { q: "Who are you writing to? (du)", a: ["Wem schreibst du?"], r: ["wer.case"] },
          { q: "Who are you going to the cinema with? (du)", a: ["Mit wem gehst du ins Kino?"], r: ["wer.prep"] },
          { q: "Who did you buy the cake for? (du)", a: ["Für wen hast du den Kuchen gekauft?"], r: ["wer.prep"] },
          { q: "Whose phone is that?", a: ["Wessen Handy ist das?", "Wem gehört das Handy?"], r: ["wer.wessen"] },
          { q: "Which train goes to Zurich?", a: ["Welcher Zug fährt nach Zürich?"], r: ["wer.welch"] },
          { q: "What kind of car do you have? (du)", a: ["Was für ein Auto hast du?"], r: ["wer.wasfur"] },
          { q: "Who's coming tonight?", a: ["Wer kommt heute Abend?"], r: ["wer.was"] },
          { q: "Who did you help? (ihr)", a: ["Wem habt ihr geholfen?"], r: ["wer.case"] },
          { q: "Which bus are you taking? (du)", a: ["Welchen Bus nimmst du?"], r: ["wer.welch"] },
        ] },
        { id: "dw.wer", t: "write", end: true, title: "Write your own", how: "In your own words — saved for Claude to correct.", items: [
          { q: "Five questions for a new colleague (wer, wen, wem, mit wem, was für).", model: ["Wer ist dein Chef? Mit wem arbeitest du zusammen? Was für eine Ausbildung hast du? Wen kennst du hier schon? Wem schickst du die Berichte?"], r: ["wer.case", "wer.prep", "wer.wasfur"] },
          { q: "You find a bag on the train. Ask whose it is — two ways.", model: ["Wessen Tasche ist das? Wem gehört diese Tasche?"], r: ["wer.wessen", "wer.case"] },
          { q: "Shopping with a friend: ask which one they'll take.", model: ["Welche Jacke nimmst du — die rote oder die schwarze?"], r: ["wer.welch"] },
          { q: "Planning a party: ask who is coming and who brings what.", model: ["Wer kommt zur Party? Wer bringt den Salat mit? Was brauchen wir noch?"], r: ["wer.was"] },
          { q: "Ask about a friend's new flat (was für…?).", model: ["Was für eine Wohnung habt ihr gefunden? In was für einem Haus ist sie?"], r: ["wer.wasfur"] },
          { q: "Ask your partner about the weekend: with whom, for whom?", model: ["Mit wem gehst du am Samstag wandern? Für wen kaufst du die Blumen?"], r: ["wer.prep"] },
          { q: "Your child came home late: ask who they were with, and whom they met.", model: ["Mit wem warst du unterwegs? Wen hast du getroffen?"], r: ["wer.prep", "wer.case"] },
          { q: "At the doctor's reception: ask which doctor, and what kind of appointment.", model: ["Bei welchem Arzt habe ich den Termin? Was für ein Termin ist das?"], r: ["wer.welch", "wer.wasfur"] },
        ] },
      ],
    },
  },
});

// What chapter 13's opening exercises and chapter 28's wer / was became.
// 13•1 · 13•3 · 13•4 · 13•8 (prepositions with für, ohne, gegen…) and
// 13•9–13•11 go to the accusative prepositions; 13•5 (warum? — …, denn …)
// to und, aber, oder, denn — both Session 4, which uploads chapter 13.
cxCover({
  "7.13": "d7.13", "28.13": "d28.13", "28.14": "d28.14", "13.6": "d13.6",
  "13.2": "d7.4", "13.7": "d28.17",
  "13.1": { st: "planned", sec: "s1.accprep" }, "13.3": { st: "planned", sec: "s1.accprep" }, "13.4": { st: "planned", sec: "s1.accprep" },
  "13.8": { st: "planned", sec: "s1.accprep" }, "13.9": { st: "planned", sec: "s1.accprep" }, "13.10": { st: "planned", sec: "s1.accprep" },
  "13.11": { st: "planned", sec: "s1.accprep" },
  "13.5": { st: "planned", sec: "s1.conj1" },
});
