// ── COURSE PACK · Stage 2 · Participles as adjectives ──
// Book: chapter 29's "Attributive adjectives", "Present participles" and
// "Past participles" (29•11–29•17). One sheet: the present participle
// (infinitive + d: lachend — doing it now) and the Partizip II (gekocht —
// done; angekommen — has happened) used as adjectives, with the adjective
// endings of Stage 1 (s1.adj) before a noun and none after sein; and a
// participle in place of a short relative clause (die Frau, die schläft →
// die schlafende Frau), an adverb in front (frisch gebacken). The book goes
// on to long extended modifiers (die im Wohnzimmer sitzende Frau): that is
// written German above B1 — the post-B1 lesson's (s4.ext). Our 29•14–29•17
// keep the book's frames with one word or a short adverb before the
// participle.
cxPack({
  id: "s2-ptadj",
  sections: {
    "s2.ptadj": {
      testout: { n: 4, miss: 1 },
      rules: {
        "pta.pres": "Infinitive + d: lachend (-ing, happening now)",
        "pta.past": "The Partizip II as an adjective: gekocht, geschlossen",
        "pta.end": "Before a noun: the adjective endings (das lachende Kind)",
        "pta.rel": "Instead of a relative clause: die schlafenden Kinder",
      },
      sheets: [
        { id: "cx.pta", title: "das lachende Kind · das gekochte Ei", qn: 3,
          struct: [["das", "who"], ["frisch", "mid"], ["gebackene", "p2"], ["Brot", "thing"]],
          why: "Verbs can describe nouns. Add **-d** to the infinitive and you have *-ing*: **lachend**. The Partizip II says it's **done**: **gekocht**. Before a noun, both take the normal adjective endings.",
          rid: ["pta.pres", "pta.past", "pta.end", "pta.rel"],
          rules: [
            "The **present participle** is the infinitive + **d**. It means *-ing*: something happening at that moment. lachen → **lachend** · schlafen → **schlafend** · ankommen → **ankommend**.",
            "The **Partizip II** works as an adjective too. With most verbs it means *done*: das **gekochte** Ei (the boiled egg), die **geschlossene** Tür. With a sein-verb it means *has happened*: der **angekommene** Zug.",
            "Before a noun, both take the normal **adjective endings**: das lach**ende** Kind · ein spannend**er** Film · mit gebroch**enem** Bein. After sein, no ending: Der Film ist **spannend**. · Die Tür ist **geschlossen**.",
            "A participle can replace a short **relative clause**: die Kinder, die schlafen → die **schlafenden** Kinder · das Brot, das frisch gebacken ist → das **frisch gebackene** Brot. An adverb goes right before it.",
          ],
          table: { head: ["verb", "as an adjective"], rows: [
            ["lachen", "das **lachende** Kind"],
            ["fahren", "der **fahrende** Zug"],
            ["kochen", "ein **gekochtes** Ei"],
            ["schließen", "die **geschlossene** Tür"],
            ["ankommen", "der **angekommene** Zug"],
          ] },
          ex: [
            ["Das war ein **spannendes** Spiel!", "That was an exciting game!"],
            ["Ich nehme die **gebratenen** Kartoffeln.", "I'll have the fried potatoes."],
            ["Vorsicht, **fahrender** Zug!", "Careful, moving train!"],
            ["Wir essen **frisch gebackenes** Brot zum Frühstück.", "We have freshly baked bread for breakfast."],
          ],
          trap: "The endings are the adjective's, not the verb's: ein spannend**er** Film, not ~~ein spannend Film~~. And *-ing* before a noun is the **-d** form: das schlaf**ende** Baby, not ~~das schlafen Baby~~.",
          quiz: [
            { at: "r1", k: "pick", q: "weinen → (crying)", o: ["weinend", "weinen", "geweint"], a: 0, why: "The infinitive + d: **weinend**." },
            { at: "r1", k: "type", cx: true, q: "singen → ___ (singing)", a: ["singend"], r: ["pta.pres"], why: "singen + d = **singend**." },
            { at: "r2", k: "pick", q: "the closed door:", o: ["die geschlossene Tür", "die schließende Tür", "die schließen Tür"], a: 0, why: "Done: the Partizip II, **geschlossene**." },
            { at: "r2", k: "pick", q: "the boiling water:", o: ["das kochende Wasser", "das gekochte Wasser"], a: 0, why: "Happening now: **kochend**. (gekocht: already boiled.)" },
            { at: "r3", k: "pick", q: "Das ist ein ___ Buch.", o: ["spannendes", "spannend", "spannende"], a: 0, why: "ein + das: **-es**." },
            { at: "r3", k: "pick", q: "Das Buch ist ___.", o: ["spannend", "spannendes"], a: 0, why: "After sein, no ending." },
            { at: "r4", k: "pick", q: "die Kinder, die spielen →", o: ["die spielenden Kinder", "die gespielten Kinder", "die spielen Kinder"], a: 0, why: "Happening now: **spielend**, with the ending -en." },
            { at: "r4", k: "order", q: "Build it: the freshly baked bread", a: ["das", "frisch", "gebackene", "Brot"], why: "The adverb right before the participle." },
            { at: "table", k: "pick", q: "der ___ Zug (the train that has arrived)", o: ["angekommene", "ankommende"], a: 0, why: "It has happened: the Partizip II, **angekommene**." },
            { at: "trap", k: "pick", q: "the sleeping baby:", o: ["das schlafende Baby", "das schlafen Baby", "das geschlafene Baby"], a: 0, why: "*-ing* before a noun: **schlafende**." },
          ] },
      ],
      diag: [
        { t: "grow", add: "d\\w*", rule: "pta.pres", hard: true, msg: "*-ing* is the infinitive + **d**, with its ending: **{right}**." },
        { t: "swap", from: "^ge\\w+$", to: "^\\w+end\\w*$", rule: "pta.pres", hard: true, msg: "It is happening at that moment: the **-d** form, **{right}**." },
        { t: "swap", from: "^\\w+end\\w*$", to: "^ge\\w+$|^\\w+(t|en)e[nrms]?$", rule: "pta.past", hard: true, msg: "It is done already: the Partizip II, **{right}**." },
        { t: "ending", stem: "(\\w+end|ge\\w+)", rule: "pta.end", msg: "Right word, wrong ending: **{right}**. It takes the adjective's ending." },
        { t: "grow", add: "(e|en|er|es|em)", rule: "pta.end", msg: "Before a noun it needs the adjective's ending: **{right}**." },
      ],
      drills: [
        // ── Übung 29•11: the present participle ──
        { id: "d29.11", ex: "29.11", t: "type", title: "-ing: the -d form", how: "Write the present participle: the infinitive + d.", items: [
          { q: "lachen → ___ (laughing)", a: ["lachend"], r: ["pta.pres"] },
          { q: "kommen → ___ (coming)", a: ["kommend"], r: ["pta.pres"] },
          { q: "ankommen → ___ (arriving)", a: ["ankommend"], r: ["pta.pres"] },
          { q: "schlafen → ___ (sleeping)", a: ["schlafend"], r: ["pta.pres"] },
          { q: "überraschen → ___ (surprising)", a: ["überraschend"], r: ["pta.pres"] },
          { q: "steigen → ___ (rising)", a: ["steigend"], r: ["pta.pres"] },
          { q: "folgen → ___ (following)", a: ["folgend"], r: ["pta.pres"] },
          { q: "anstrengen → ___ (tiring)", a: ["anstrengend"], r: ["pta.pres"] },
          { q: "fließen → ___ (flowing)", a: ["fließend"], r: ["pta.pres"] },
          { q: "entscheiden → ___ (deciding)", a: ["entscheidend"], r: ["pta.pres"] },
        ] },
        // ── our own: the ending ──
        { id: "dpta.end", t: "type", title: "The ending", how: "Write the word in brackets with its adjective ending — or none after sein.", items: [
          { q: "Das war ein ___ Tag. (anstrengend)", a: ["anstrengender"], r: ["pta.end"] },
          { q: "Der Tag war ___. (anstrengend)", a: ["anstrengend"], r: ["pta.end"] },
          { q: "Ich suche eine ___ Wohnung. (möbliert)", a: ["möblierte"], r: ["pta.end"] },
          { q: "Mit ___ Bein kann er nicht Ski fahren. (gebrochen)", a: ["gebrochenem"], r: ["pta.end"] },
          { q: "Hast du den ___ Film gesehen? (spannend)", a: ["spannenden"], r: ["pta.end"] },
          { q: "Wir hatten eine ___ Nachricht für euch. (überraschend)", a: ["überraschende"], r: ["pta.end"] },
          { q: "Das ___ Zimmer ist nicht mehr frei. (reserviert)", a: ["reservierte"], r: ["pta.end"] },
          { q: "Im ___ Jahr ziehen wir um. (kommend)", a: ["kommenden"], r: ["pta.end"] },
          { q: "Die Tür ist ___. (geschlossen)", a: ["geschlossen"], r: ["pta.end"] },
          { q: "Ich kaufe ___ Gemüse. (gefroren)", a: ["gefrorenes"], r: ["pta.end"] },
          { q: "Sie bringt einen ___ Korb mit. (gefüllt)", a: ["gefüllten"], r: ["pta.end"] },
        ] },
        // ── Übung 29•12: -ing before a noun ──
        { id: "d29.12", ex: "29.12", t: "translate", title: "-ing before a noun", how: "Translate the phrase: the -d form with its adjective ending.", items: [
          { q: "the sleeping baby", a: ["das schlafende Baby"], r: ["pta.pres"] },
          { q: "the laughing children", a: ["die lachenden Kinder"], r: ["pta.end"] },
          { q: "an exciting film", a: ["ein spannender Film"], r: ["pta.end"] },
          { q: "with a smiling face", a: ["mit einem lächelnden Gesicht", "mit lächelndem Gesicht"], r: ["pta.end"] },
          { q: "the following week", a: ["die folgende Woche"], r: ["pta.pres"] },
          { q: "in the moving train", a: ["im fahrenden Zug", "in dem fahrenden Zug"], r: ["pta.end"] },
          { q: "a tiring day", a: ["ein anstrengender Tag"], r: ["pta.end"] },
          { q: "running water", a: ["fließendes Wasser"], r: ["pta.end"] },
          { q: "the barking dog", a: ["der bellende Hund"], r: ["pta.pres"] },
          { q: "next to the crying girl", a: ["neben dem weinenden Mädchen"], r: ["pta.end"] },
        ] },
        // ── Übung 29•13: done — the Partizip II before a noun ──
        { id: "d29.13", ex: "29.13", t: "translate", title: "Done: the Partizip II", how: "Translate the phrase: the Partizip II with its adjective ending.", items: [
          { q: "a boiled egg", a: ["ein gekochtes Ei"], r: ["pta.past"] },
          { q: "the closed door", a: ["die geschlossene Tür", "die geschlossene Türe"], r: ["pta.past"] },
          { q: "with a broken arm", a: ["mit einem gebrochenen Arm", "mit gebrochenem Arm"], r: ["pta.end"] },
          { q: "the stolen bike", a: ["das gestohlene Velo", "das gestohlene Fahrrad"], r: ["pta.past"] },
          { q: "fried potatoes", a: ["gebratene Kartoffeln"], r: ["pta.end"] },
          { q: "the train that has arrived", a: ["der angekommene Zug"], r: ["pta.past"] },
          { q: "a well-paid job", a: ["eine gut bezahlte Stelle", "ein gut bezahlter Job", "eine gut bezahlte Arbeit"], r: ["pta.rel"] },
          { q: "the reserved table", a: ["der reservierte Tisch"], r: ["pta.past"] },
          { q: "with the invited guests", a: ["mit den eingeladenen Gästen"], r: ["pta.end"] },
          { q: "a freshly painted wall", a: ["eine frisch gestrichene Wand"], r: ["pta.rel"] },
        ] },
        // ── Übung 29•14: instead of a relative clause ──
        { id: "d29.14", ex: "29.14", t: "transform", title: "Shorter: the participle", how: "Say it shorter: put the participle before the noun instead of the relative clause.", items: [
          { q: "Die Frau, die schläft, ist meine Schwester.", a: ["Die schlafende Frau ist meine Schwester."], r: ["pta.rel"] },
          { q: "Das Kind, das weint, hat Hunger.", a: ["Das weinende Kind hat Hunger."], r: ["pta.rel"] },
          { q: "Wir hören die Vögel, die singen.", a: ["Wir hören die singenden Vögel."], r: ["pta.rel"] },
          { q: "Der Zug, der ankommt, ist aus Genf.", a: ["Der ankommende Zug ist aus Genf."], r: ["pta.rel"] },
          { q: "Ich nehme das Ei, das gekocht ist.", a: ["Ich nehme das gekochte Ei."], r: ["pta.rel"] },
          { q: "Das Velo, das gestohlen wurde, ist wieder da.", a: ["Das gestohlene Velo ist wieder da."], r: ["pta.rel"] },
          { q: "Die Gäste, die eingeladen sind, kommen um sieben.", a: ["Die eingeladenen Gäste kommen um sieben."], r: ["pta.rel"] },
          { q: "Wir essen die Kartoffeln, die gebraten sind.", a: ["Wir essen die gebratenen Kartoffeln."], r: ["pta.rel"] },
          { q: "Der Hund, der bellt, gehört dem Nachbarn.", a: ["Der bellende Hund gehört dem Nachbarn."], r: ["pta.rel"] },
          { q: "Kennst du die Frau, die lacht?", a: ["Kennst du die lachende Frau?"], r: ["pta.rel"] },
        ] },
        // ── Übung 29•15: with an adverb ──
        { id: "d29.15", ex: "29.15", t: "transform", title: "Add the adverb", how: "Put the word in brackets right before the participle.", items: [
          { q: "Sie bekam einen geschriebenen Brief. (schön)", a: ["Sie bekam einen schön geschriebenen Brief."], r: ["pta.rel"] },
          { q: "Wir essen gebackenes Brot. (frisch)", a: ["Wir essen frisch gebackenes Brot."], r: ["pta.rel"] },
          { q: "Er hat eine bezahlte Stelle. (gut)", a: ["Er hat eine gut bezahlte Stelle."], r: ["pta.rel"] },
          { q: "Das ist ein bekanntes Restaurant. (sehr)", a: ["Das ist ein sehr bekanntes Restaurant."], r: ["pta.rel"] },
          { q: "Wir wohnen in einer renovierten Wohnung. (neu)", a: ["Wir wohnen in einer neu renovierten Wohnung."], r: ["pta.rel"] },
          { q: "Hörst du den bellenden Hund? (laut)", a: ["Hörst du den laut bellenden Hund?"], r: ["pta.rel"] },
          { q: "Das war ein spannendes Spiel. (unglaublich)", a: ["Das war ein unglaublich spannendes Spiel."], r: ["pta.rel"] },
          { q: "Sie trägt ein gemachtes Kleid. (selbst)", a: ["Sie trägt ein selbst gemachtes Kleid.", "Sie trägt ein selbstgemachtes Kleid."], r: ["pta.rel"] },
          { q: "Wir trinken gepressten Orangensaft. (frisch)", a: ["Wir trinken frisch gepressten Orangensaft."], r: ["pta.rel"] },
        ] },
        // ── Production ──
        // ── Übung 29•16: build the phrase ──
        { id: "d29.16", ex: "29.16", t: "compose", end: true, title: "Build the phrase", how: "Build a phrase with der, die or das: the adverb, the participle with its ending, then the noun.", items: [
          { w: ["laut", "bellen", "Hund"], a: ["der laut bellende Hund"], r: ["pta.rel"] },
          { w: ["frisch", "backen", "Brot"], a: ["das frisch gebackene Brot"], r: ["pta.rel"] },
          { w: ["schön", "singen", "Vogel"], a: ["der schön singende Vogel"], r: ["pta.rel"] },
          { w: ["gut", "bezahlen", "Stelle"], a: ["die gut bezahlte Stelle"], r: ["pta.rel"] },
          { w: ["langsam", "fahren", "Zug"], a: ["der langsam fahrende Zug"], r: ["pta.rel"] },
          { w: ["neu", "eröffnen", "Café"], a: ["das neu eröffnete Café"], r: ["pta.rel"] },
          { w: ["laut", "lachen", "Kinder"], a: ["die laut lachenden Kinder"], r: ["pta.rel"] },
          { w: ["frisch", "streichen", "Wand"], a: ["die frisch gestrichene Wand"], r: ["pta.rel"] },
          { w: ["leise", "spielen", "Musik"], a: ["die leise spielende Musik"], r: ["pta.rel"] },
        ] },
        { id: "dp.ptadj", t: "translate", end: true, title: "Say it in German", how: "Translate, with a participle before the noun.", items: [
          { q: "That was an exciting film.", a: ["Das war ein spannender Film."], r: ["pta.end"] },
          { q: "The coming weeks will be tiring.", a: ["Die kommenden Wochen werden anstrengend.", "Die kommenden Wochen werden anstrengend sein."], r: ["pta.end"] },
          { q: "I'd like a boiled egg.", a: ["Ich möchte ein gekochtes Ei.", "Ich hätte gern ein gekochtes Ei."], r: ["pta.past"] },
          { q: "The work was very tiring.", a: ["Die Arbeit war sehr anstrengend."], r: ["pta.end"] },
          { q: "We're looking for a furnished flat.", a: ["Wir suchen eine möblierte Wohnung."], r: ["pta.past"] },
          { q: "Careful, the train is moving! (a sign: moving train)", a: ["Vorsicht, fahrender Zug!"], r: ["pta.pres"] },
          { q: "The stolen car was found.", a: ["Das gestohlene Auto wurde gefunden.", "Das gestohlene Auto ist gefunden worden."], r: ["pta.past"] },
          { q: "He has a well-paid job.", a: ["Er hat eine gut bezahlte Stelle.", "Er hat einen gut bezahlten Job.", "Er hat eine gut bezahlte Arbeit."], r: ["pta.rel"] },
          { q: "I love freshly baked bread.", a: ["Ich liebe frisch gebackenes Brot."], r: ["pta.rel"] },
          { q: "The door is closed.", a: ["Die Tür ist geschlossen.", "Die Türe ist geschlossen."], r: ["pta.end"] },
          { q: "The sleeping children didn't hear anything.", a: ["Die schlafenden Kinder haben nichts gehört.", "Die schlafenden Kinder hörten nichts."], r: ["pta.end"] },
        ] },
        // ── Übung 29•17: your own ──
        { id: "d29.17", ex: "29.17", t: "write", end: true, title: "Your own", how: "Write a sentence with a participle before the noun, from the words given. Saved for Claude to correct.", items: [
          { q: "der Zug, der ankommt", model: ["Auf Gleis 3 steht der ankommende Zug aus Lugano."], r: ["pta.rel"] },
          { q: "das Brot, das frisch gebacken ist", model: ["Am Sonntag hole ich frisch gebackenes Brot beim Bäcker."], r: ["pta.rel"] },
          { q: "die Kinder, die spielen", model: ["Vom Balkon sehe ich die spielenden Kinder im Hof."], r: ["pta.rel"] },
          { q: "eine Arbeit, die anstrengt", model: ["Ich habe eine anstrengende Arbeit, aber ich mag sie."], r: ["pta.pres"] },
          { q: "ein Zimmer, das reserviert ist", model: ["Wir haben ein reserviertes Zimmer im Hotel am See."], r: ["pta.past"] },
          { q: "ein Film, der spannend ist", model: ["Gestern habe ich einen sehr spannenden Film gesehen."], r: ["pta.end"] },
          { q: "eine Stelle, die gut bezahlt ist", model: ["Mein Bruder sucht eine gut bezahlte Stelle in Zürich."], r: ["pta.rel"] },
          { q: "ein Velo, das gestohlen wurde", model: ["Die Polizei hat mein gestohlenes Velo gefunden."], r: ["pta.past"] },
        ] },
      ],
    },
  },
});

// What chapter 29's participles became (their long extended modifiers are s4.ext's).
cxCover({ "29.11": "d29.11", "29.12": "d29.12", "29.13": "d29.13", "29.14": "d29.14", "29.15": "d29.15", "29.16": "d29.16", "29.17": "d29.17" });
