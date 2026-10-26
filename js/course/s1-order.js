// ── COURSE PACK · Stage 1 · Fronting; time – manner – place ──
// Book: chapter 14 "Word order" (Übung 14•7) and chapter 28 "Word order"
// (28•6–28•10). Two sheets: one thing first, then the verb (an object, a
// linking word like deshalb) — then the middle of the sentence: when,
// how, where. 14•8 (und, aber, oder, denn) and 14•9 · 14•10 (dass, weil,
// the chapter's mixed review) wait for the conjunction lessons (Session 4);
// chapter 11's "Adverbs of time" (11•8 · 11•9: the future with werden)
// for the future lesson (Session 5); 28•1 (one sentence in every tense) is
// drilled with the Perfekt lesson (s1-perfekt.js).
cxPack({
  id: "s1-order",
  sections: {
    "s1.front": {
      // (no test-out after Stage 0 — sized so a check of every rule fits)
      testout: { n: 6, miss: 1 },
      rules: {
        "front.one": "one element first — then the verb, then the subject",
        "front.obj": "the object first: its ending shows who does what",
        "front.conn": "deshalb, trotzdem, dann, leider… take the first place",
        "tmp.order": "the middle: when → how → where",
        "tmp.front": "any one of them first — the rest keep their order",
        "tmp.end": "the verb's second part still closes it",
      },
      sheets: [
        { id: "cx.front1", title: "One thing first — then the verb", qn: 3,
          struct: [["one thing", "thing"], ["verb", "verb"], ["subject", "who"], ["the rest …", "mid"]],
          why: "The first place is the spotlight: put there what you're talking about — a time, a place, an object, a word like *leider*. Exactly **one** thing fits there; the verb follows at once, then the subject.",
          rid: ["front.one", "front.obj", "front.conn"],
          rules: [
            "Exactly **one** element stands before the verb — but it can be long: [**Am Montag um halb acht**] **beginnt** der Kurs. · [**Nach der Arbeit**] **gehe** ich einkaufen. The subject comes right after the verb. Never two things first: ~~Morgen ich fahre~~ → Morgen **fahre ich**.",
            "The **object** can go first, to stress it — its ending still shows who does what: **Den** Kuchen hat mein Vater gebacken (the father baked it). **Das** weiß ich nicht. — *Das* first is everywhere in speech.",
            "Linking words take the first place too, and the verb comes straight after them: **dann · danach · deshalb · trotzdem · außerdem · leider · zum Glück · vielleicht**: Es regnet, **deshalb nehme** ich den Bus.",
          ],
          table: { head: ["first", "verb", "the rest"], rows: [
            ["Ich", "**habe**", "heute leider keine Zeit."],
            ["Heute", "**habe**", "ich leider keine Zeit."],
            ["Leider", "**habe**", "ich heute keine Zeit."],
            ["Zeit", "**habe**", "ich heute leider nicht."],
          ] },
          ex: [
            ["**Nach dem Mittagessen** trinken wir noch einen Kaffee.", "After lunch we have another coffee."],
            ["**Diesen Film** habe ich schon zweimal gesehen.", "I've already seen this film twice."],
            ["Der Zug hatte Verspätung, **deshalb** bin ich zu spät gekommen.", "The train was late, so I came late."],
            ["**Zum Glück** hat die Apotheke noch offen.", "Luckily the pharmacy is still open."],
          ],
          trap: "**und, aber, oder, denn** don't take the first place — they stand before it, and the subject comes first as usual: …, **aber** ich **habe** keine Zeit. Only words like **deshalb** and **trotzdem** pull the verb forward: …, **deshalb habe** ich keine Zeit.",
          quiz: [
            { at: "r1", k: "pick", q: "Which is right?", o: ["Am Samstagabend gehen wir ins Kino.", "Am Samstagabend wir gehen ins Kino."], a: 0, why: "One thing first (Am Samstagabend), then the verb." },
            { at: "r1", k: "order", q: "Build it: Every morning at seven I drink a coffee.", a: ["Jeden Morgen um sieben", "trinke", "ich", "einen Kaffee."], why: "The whole time phrase is one element; then the verb." },
            { at: "r1", k: "pick", q: "Which is right?", o: ["Nach der Arbeit gehe ich einkaufen.", "Nach der Arbeit ich gehe einkaufen.", "Ich nach der Arbeit gehe einkaufen."], a: 0, why: "One element, the verb, then the subject." },
            { at: "r2", k: "pick", q: "**Den Hund** füttert meine Tochter. — Who feeds whom?", o: ["My daughter feeds the dog.", "The dog feeds my daughter."], a: 0, why: "**Den** Hund is the object — the ending tells, not the place." },
            { at: "r2", k: "pick", q: "I don't know that. — the usual way to say it:", o: ["Das weiß ich nicht.", "Das ich weiß nicht.", "Das weiß nicht ich."], a: 0, why: "Das first, the verb, then ich." },
            { at: "r3", k: "pick", q: "Es regnet. ___ nehme ich den Bus.", o: ["Deshalb", "Denn", "Und"], a: 0, why: "deshalb takes the first place: **deshalb nehme ich**." },
            { at: "r3", k: "order", q: "Build it: Unfortunately I have no time today.", a: ["Leider", "habe", "ich", "heute", "keine Zeit."], why: "leider first, then the verb." },
            { at: "table", k: "pick", q: "Zeit ___ ich heute leider nicht.", o: ["habe", "ich habe", "haben"], a: 0, why: "Whatever comes first, the verb is second." },
            { at: "trap", k: "pick", q: "Which is right?", o: ["Ich bin müde, aber ich komme mit.", "Ich bin müde, aber komme ich mit."], a: 0, why: "aber doesn't count: the subject, then the verb." },
            { at: "trap", k: "pick", q: "Which is right?", o: ["Ich bin müde, trotzdem komme ich mit.", "Ich bin müde, trotzdem ich komme mit."], a: 0, why: "trotzdem takes the first place: the verb follows at once." },
          ] },
        { id: "cx.front2", title: "Time – manner – place", qn: 3,
          struct: [["verb", "verb"], ["when?", "who"], ["how? · with whom?", "aux"], ["where?", "end"]],
          why: "In the middle of a sentence the details come in a fixed order: **when**, then **how** (or with whom), then **where**. English likes the place first — German keeps it for last.",
          rid: ["tmp.order", "tmp.front", "tmp.end"],
          rules: [
            "After the verb and the subject: **when → how → where**: Ich fahre **morgen** **mit dem Zug** **nach Bern**. · Sie geht **jeden Tag** **zu Fuß** **zur Arbeit**.",
            "Any one of them can go **first** — the others keep their order: **Morgen** fahre ich mit dem Zug nach Bern. · **Mit dem Zug** fahre ich morgen nach Bern.",
            "The verb's second part still closes the sentence, after the place: Ich bin gestern mit dem Velo zur Arbeit **gefahren**. · Wir wollen am Sonntag zu Hause **bleiben**.",
          ],
          table: { head: ["verb", "when?", "how?", "where?", "end"], rows: [
            ["Ich **fahre**", "morgen", "mit dem Zug", "nach Bern.", ""],
            ["Sie **geht**", "jeden Tag", "zu Fuß", "zur Arbeit.", ""],
            ["Wir **sind**", "gestern", "mit Freunden", "in die Berge", "**gefahren**."],
            ["Er **muss**", "heute", "allein", "im Büro", "**arbeiten**."],
          ] },
          ex: [
            ["Ich gehe **am Samstag** **mit meiner Schwester** **ins Kino**.", "I'm going to the cinema with my sister on Saturday."],
            ["Er fährt **jeden Morgen** **mit dem Tram** **ins Büro**.", "He takes the tram to the office every morning."],
            ["**Im Sommer** sind wir **mit dem Zelt** **ans Meer** gefahren.", "In summer we went to the sea with a tent."],
            ["Wir treffen uns **um sechs** **vor dem Kino**.", "We're meeting at six in front of the cinema."],
          ],
          trap: "Don't copy the English order (*I go to work by bus every day*): Ich fahre **jeden Tag** **mit dem Bus** **zur Arbeit**. — ~~Ich fahre zur Arbeit mit dem Bus jeden Tag.~~",
          quiz: [
            { at: "r1", k: "pick", q: "Which is right?", o: ["Ich fahre morgen mit dem Velo zur Arbeit.", "Ich fahre zur Arbeit mit dem Velo morgen.", "Ich fahre mit dem Velo zur Arbeit morgen."], a: 0, why: "When (morgen) → how (mit dem Velo) → where (zur Arbeit)." },
            { at: "r1", k: "order", q: "Build it: We're eating at home with friends tonight.", a: ["Wir", "essen", "heute Abend", "mit Freunden", "zu Hause."], why: "When → with whom → where." },
            { at: "r2", k: "pick", q: "Start with the place — which is right?", o: ["Nach Bern fahre ich morgen mit dem Zug.", "Nach Bern ich fahre morgen mit dem Zug.", "Nach Bern fahre ich mit dem Zug morgen."], a: 0, why: "The verb second; the rest keep their order: when → how." },
            { at: "r2", k: "order", q: "Build it: Tomorrow I'm going to Basel by train.", a: ["Morgen", "fahre", "ich", "mit dem Zug", "nach Basel."], why: "The time first, the verb; then how → where." },
            { at: "r3", k: "pick", q: "Which is right?", o: ["Ich bin gestern mit dem Bus nach Hause gefahren.", "Ich bin gestern gefahren mit dem Bus nach Hause."], a: 0, why: "The participle closes the sentence, after the place." },
            { at: "r3", k: "pick", q: "Which is right?", o: ["Wir wollen am Sonntag zu Hause bleiben.", "Wir wollen bleiben am Sonntag zu Hause."], a: 0, why: "The infinitive goes to the very end." },
            { at: "table", k: "pick", q: "Er muss heute ___ arbeiten.", o: ["allein im Büro", "im Büro allein"], a: 0, why: "How (allein) before where (im Büro)." },
            { at: "trap", k: "pick", q: "I take the bus to work every day.", o: ["Ich fahre jeden Tag mit dem Bus zur Arbeit.", "Ich fahre zur Arbeit mit dem Bus jeden Tag."], a: 0, why: "Not the English order: when → how → where." },
          ] },
      ],
      diag: [
        { t: "seq", seq: ["^(deshalb|trotzdem|dann|danach|ausserdem|leider|vielleicht|glueck|gluck)$", "^(ich|du|er|sie|es|wir|ihr|man)$"], rule: "front.conn", msg: "«{typed}»: after deshalb, trotzdem, dann… the **verb** comes straight away, then the subject." },
        { t: "swap", from: "^der$", to: "^den$", rule: "front.obj", msg: "First place, still the object: **den** — its ending shows who does what." },
        { t: "ending", stem: "(k?ein|dies|jed|mein|dein|sein|ihr|unser|eu)", rule: "front.obj", msg: "First place, still the object: **{right}**." },
        { t: "pos", tok: "^(ich|du|er|sie|es|wir|ihr|man)$", rule: "front.one", msg: "One thing first, then the **verb**, then the subject — it goes {where}." },
      ],
      drills: [
        // ── our own: which order? ──
        { id: "dfront.p", t: "pick", title: "Which order is right?", how: "Pick the sentence with the verb in second place.", items: [
          { q: "After work I go to training. ___", o: ["Nach der Arbeit gehe ich ins Training.", "Nach der Arbeit ich gehe ins Training."], a: ["Nach der Arbeit gehe ich ins Training."], r: ["front.one"] },
          { q: "Every Sunday we call grandma. ___", o: ["Jeden Sonntag rufen wir Oma an.", "Jeden Sonntag wir rufen Oma an."], a: ["Jeden Sonntag rufen wir Oma an."], r: ["front.one"] },
          { q: "The cake — my father baked it. ___", o: ["Den Kuchen hat mein Vater gebacken.", "Der Kuchen hat mein Vater gebacken."], a: ["Den Kuchen hat mein Vater gebacken."], r: ["front.obj"] },
          { q: "I don't understand that. ___", o: ["Das verstehe ich nicht.", "Das ich verstehe nicht."], a: ["Das verstehe ich nicht."], r: ["front.obj"] },
          { q: "It's raining, so I'm staying at home. ___", o: ["Es regnet, deshalb bleibe ich zu Hause.", "Es regnet, deshalb ich bleibe zu Hause."], a: ["Es regnet, deshalb bleibe ich zu Hause."], r: ["front.conn"] },
          { q: "I'm ill, but I'm working. ___", o: ["Ich bin krank, aber ich arbeite.", "Ich bin krank, aber arbeite ich."], a: ["Ich bin krank, aber ich arbeite."], r: ["front.conn"] },
          { q: "Unfortunately the shop is closed. ___", o: ["Leider ist der Laden zu.", "Leider der Laden ist zu."], a: ["Leider ist der Laden zu."], r: ["front.conn"] },
          { q: "In Bern I have a lot of friends. ___", o: ["In Bern habe ich viele Freunde.", "In Bern ich habe viele Freunde."], a: ["In Bern habe ich viele Freunde."], r: ["front.one"] },
          { q: "Then we went home. ___", o: ["Dann sind wir nach Hause gegangen.", "Dann wir sind nach Hause gegangen."], a: ["Dann sind wir nach Hause gegangen."], r: ["front.conn"] },
          { q: "This dress I'm not buying. ___", o: ["Dieses Kleid kaufe ich nicht.", "Dieses Kleid ich kaufe nicht."], a: ["Dieses Kleid kaufe ich nicht."], r: ["front.obj"] },
        ] },
        // ── Übung 14•7: the phrase in brackets first ──
        { id: "d14.7", ex: "14.7", t: "transform", fixed: true, low: true, title: "Put it first", how: "Start with the words in brackets — the verb stays second.", items: [
          { q: "(im Winter) Wir fahren jedes Wochenende Ski.", a: ["Im Winter fahren wir jedes Wochenende Ski."], r: ["front.one"] },
          { q: "(am Montag) Der Deutschkurs fängt wieder an.", a: ["Am Montag fängt der Deutschkurs wieder an."], r: ["front.one"] },
          { q: "(um halb sieben) Ich stehe auf.", a: ["Um halb sieben stehe ich auf."], r: ["front.one"] },
          { q: "(in Zürich) Die Wohnungen sind sehr teuer.", a: ["In Zürich sind die Wohnungen sehr teuer."], r: ["front.one"] },
          { q: "(gestern) Wir haben lange im Garten gesessen.", a: ["Gestern haben wir lange im Garten gesessen."], r: ["front.one"] },
          { q: "(nach dem Essen) Die Kinder spielen draußen.", a: ["Nach dem Essen spielen die Kinder draußen."], r: ["front.one"] },
          { q: "(heute Abend) Ich koche für meine Freunde.", a: ["Heute Abend koche ich für meine Freunde."], r: ["front.one"] },
          { q: "(jeden Freitag) Meine Mutter ruft mich an.", a: ["Jeden Freitag ruft mich meine Mutter an.", "Jeden Freitag ruft meine Mutter mich an."], r: ["front.one"], note: "A short pronoun likes to come early: *ruft mich meine Mutter an* — both are right." },
          { q: "(letzte Woche) Mein Bruder ist nach Kanada geflogen.", a: ["Letzte Woche ist mein Bruder nach Kanada geflogen."], r: ["front.one"] },
          { q: "(im Sommer) Die Bäckerei hat nur am Morgen offen.", a: ["Im Sommer hat die Bäckerei nur am Morgen offen."], r: ["front.one"] },
        ] },
        // ── Übung 28•6: the highlighted part first ──
        { id: "d28.6", ex: "28.6", t: "transform", fixed: true, low: true, title: "Start with the highlighted part", how: "Begin with the highlighted part — the verb stays second.", items: [
          { q: "Ich habe am Abend leider keine Zeit.", hl: "leider", a: ["Leider habe ich am Abend keine Zeit."], r: ["front.conn"] },
          { q: "Wir fahren im Herbst in die Berge.", hl: "im Herbst", a: ["Im Herbst fahren wir in die Berge."], r: ["front.one"] },
          { q: "Sie trinkt am Morgen nur einen Tee.", hl: "am Morgen", a: ["Am Morgen trinkt sie nur einen Tee."], r: ["front.one"] },
          { q: "Ich habe meine Brille in der Küche gefunden.", hl: "in der Küche", a: ["In der Küche habe ich meine Brille gefunden."], r: ["front.one"] },
          { q: "Er arbeitet seit drei Jahren in Basel.", hl: "seit drei Jahren", a: ["Seit drei Jahren arbeitet er in Basel."], r: ["front.one"] },
          { q: "Wir bleiben bei Regen zu Hause.", hl: "bei Regen", a: ["Bei Regen bleiben wir zu Hause."], r: ["front.one"] },
          { q: "Das Kind ist zum Glück nicht krank.", hl: "zum Glück", a: ["Zum Glück ist das Kind nicht krank."], r: ["front.conn"] },
          { q: "Ich besuche nach der Arbeit meine Oma.", hl: "nach der Arbeit", a: ["Nach der Arbeit besuche ich meine Oma."], r: ["front.one"] },
          { q: "Man kann im Park gut joggen.", hl: "im Park", a: ["Im Park kann man gut joggen."], r: ["front.one"] },
          { q: "Wir sind vielleicht am Sonntag in Bern.", hl: "vielleicht", a: ["Vielleicht sind wir am Sonntag in Bern."], r: ["front.conn"] },
        ] },
        // ── Übung 28•7: the object first ──
        { id: "d28.7", ex: "28.7", t: "transform", fixed: true, low: true, title: "The object first", how: "Start with the highlighted object — the verb stays second, the subject follows it.", items: [
          { q: "Ich habe den Schlüssel im Auto vergessen.", hl: "den Schlüssel", a: ["Den Schlüssel habe ich im Auto vergessen."], r: ["front.obj"] },
          { q: "Meine Tochter füttert den Hund.", hl: "den Hund", a: ["Den Hund füttert meine Tochter."], r: ["front.obj"] },
          { q: "Ich verstehe das nicht.", hl: "das", a: ["Das verstehe ich nicht."], r: ["front.obj"] },
          { q: "Wir kennen diesen Weg gut.", hl: "diesen Weg", a: ["Diesen Weg kennen wir gut."], r: ["front.obj"] },
          { q: "Mein Vater hat den Kuchen gebacken.", hl: "den Kuchen", a: ["Den Kuchen hat mein Vater gebacken."], r: ["front.obj"] },
          { q: "Ich weiß das schon.", hl: "das", a: ["Das weiß ich schon."], r: ["front.obj"] },
          { q: "Die Kinder lieben dieses Spiel.", hl: "dieses Spiel", a: ["Dieses Spiel lieben die Kinder."], r: ["front.obj"] },
          { q: "Sie trinkt den Wein nicht.", hl: "den Wein", a: ["Den Wein trinkt sie nicht."], r: ["front.obj"] },
          { q: "Du musst diese Rechnung bis Freitag bezahlen.", hl: "diese Rechnung", a: ["Diese Rechnung musst du bis Freitag bezahlen."], r: ["front.obj"] },
          { q: "Ich habe meinen Nachbarn lange nicht gesehen.", hl: "meinen Nachbarn", a: ["Meinen Nachbarn habe ich lange nicht gesehen."], r: ["front.obj"] },
        ] },
        // ── our own: linking words take the first place ──
        { id: "dfront.c", t: "transform", fixed: true, low: true, title: "deshalb, trotzdem, dann…", how: "Join the two — the word in brackets starts the second part, the verb right after it.", d: ["und", "aber"], items: [
          { q: "Es regnet. Ich nehme den Bus. (deshalb)", a: ["Es regnet, deshalb nehme ich den Bus."], r: ["front.conn"] },
          { q: "Ich bin müde. Ich gehe ins Training. (trotzdem)", a: ["Ich bin müde, trotzdem gehe ich ins Training."], r: ["front.conn"] },
          { q: "Wir essen zuerst. Wir gehen spazieren. (dann)", a: ["Wir essen zuerst, dann gehen wir spazieren."], r: ["front.conn"] },
          { q: "Der Laden ist zu. Ich kaufe das Brot morgen. (deshalb)", a: ["Der Laden ist zu, deshalb kaufe ich das Brot morgen."], r: ["front.conn"] },
          { q: "Die Wohnung ist hell. Sie hat einen Balkon. (außerdem)", a: ["Die Wohnung ist hell, außerdem hat sie einen Balkon."], r: ["front.conn"] },
          { q: "Ich habe den Zug verpasst. Ich bin zu spät gekommen. (deshalb)", a: ["Ich habe den Zug verpasst, deshalb bin ich zu spät gekommen."], r: ["front.conn"] },
          { q: "Es war kalt. Wir sind schwimmen gegangen. (trotzdem)", a: ["Es war kalt, trotzdem sind wir schwimmen gegangen."], r: ["front.conn"] },
          { q: "Zuerst kaufe ich ein. Ich koche. (danach)", a: ["Zuerst kaufe ich ein, danach koche ich."], r: ["front.conn"] },
          { q: "Mein Handy war kaputt. Ich konnte dich nicht anrufen. (deshalb)", a: ["Mein Handy war kaputt, deshalb konnte ich dich nicht anrufen."], r: ["front.conn"] },
          { q: "Die Prüfung war schwer. Ich habe bestanden. (zum Glück)", a: ["Die Prüfung war schwer, zum Glück habe ich bestanden."], r: ["front.conn"] },
        ] },
        // ── our own: add the details in their place ──
        { id: "dtmp.add", t: "transform", title: "When – how – where", how: "Add the words in brackets where they belong: when → how → where.", items: [
          { q: "Ich fahre nach Bern. (morgen · mit dem Zug)", a: ["Ich fahre morgen mit dem Zug nach Bern."], r: ["tmp.order"] },
          { q: "Sie geht zur Arbeit. (jeden Tag · zu Fuß)", a: ["Sie geht jeden Tag zu Fuß zur Arbeit.", "Jeden Tag geht sie zu Fuß zur Arbeit."], r: ["tmp.order"] },
          { q: "Wir essen im Restaurant. (heute Abend · mit Kollegen)", a: ["Wir essen heute Abend mit Kollegen im Restaurant."], r: ["tmp.order"] },
          { q: "Er fährt in die Stadt. (am Samstag · mit dem Velo)", a: ["Er fährt am Samstag mit dem Velo in die Stadt."], r: ["tmp.order"] },
          { q: "Die Kinder spielen im Garten. (am Nachmittag · fröhlich)", a: ["Die Kinder spielen am Nachmittag fröhlich im Garten.", "Am Nachmittag spielen die Kinder fröhlich im Garten."], r: ["tmp.order"] },
          { q: "Wir fliegen nach Lissabon. (im Mai · mit Freunden)", a: ["Wir fliegen im Mai mit Freunden nach Lissabon."], r: ["tmp.order"] },
          { q: "Ich bin ins Kino gegangen. (gestern · allein)", a: ["Ich bin gestern allein ins Kino gegangen."], r: ["tmp.order", "tmp.end"] },
          { q: "Er muss im Büro arbeiten. (heute · lange)", a: ["Er muss heute lange im Büro arbeiten."], r: ["tmp.order", "tmp.end"] },
          { q: "Wir sind nach Italien gefahren. (letzten Sommer · mit dem Auto)", a: ["Wir sind letzten Sommer mit dem Auto nach Italien gefahren."], r: ["tmp.order", "tmp.end"] },
          { q: "Sie kommt nach Hause. (um sechs · müde)", a: ["Sie kommt um sechs müde nach Hause."], r: ["tmp.order"] },
        ] },
        // ── our own: any one of them first ──
        { id: "dtmp.f", t: "transform", fixed: true, low: true, title: "Another one first", how: "Start with the highlighted part — the others keep their order.", items: [
          { q: "Ich fahre morgen mit dem Zug nach Bern.", hl: "mit dem Zug", a: ["Mit dem Zug fahre ich morgen nach Bern."], r: ["tmp.front"] },
          { q: "Wir gehen am Samstag mit den Kindern in den Zoo.", hl: "am Samstag", a: ["Am Samstag gehen wir mit den Kindern in den Zoo."], r: ["tmp.front"] },
          { q: "Sie geht jeden Morgen zu Fuß ins Büro.", hl: "jeden Morgen", a: ["Jeden Morgen geht sie zu Fuß ins Büro."], r: ["tmp.front"] },
          { q: "Ich war gestern mit Lena im Kino.", hl: "mit Lena", a: ["Mit Lena war ich gestern im Kino."], r: ["tmp.front"] },
          { q: "Er ist letzte Woche allein nach Paris gefahren.", hl: "letzte Woche", a: ["Letzte Woche ist er allein nach Paris gefahren."], r: ["tmp.front", "tmp.end"] },
          { q: "Wir essen heute Abend bei meinen Eltern.", hl: "bei meinen Eltern", a: ["Bei meinen Eltern essen wir heute Abend."], r: ["tmp.front"] },
          { q: "Ich kann morgen mit dem Auto zum Flughafen fahren.", hl: "morgen", a: ["Morgen kann ich mit dem Auto zum Flughafen fahren."], r: ["tmp.front", "tmp.end"] },
          { q: "Die Kinder fahren im Winter mit der Schule ins Skilager.", hl: "im Winter", a: ["Im Winter fahren die Kinder mit der Schule ins Skilager."], r: ["tmp.front"] },
        ] },
        // ── our own: build it in order ──
        { id: "dtmp.c", t: "compose", title: "Build it: when – how – where", how: "Make a sentence from the words — conjugate, and put the details in order.", items: [
          { w: ["wir", "fahren", "nach Genf", "am Freitag", "mit dem Zug"], a: ["Wir fahren am Freitag mit dem Zug nach Genf."], r: ["tmp.order"] },
          { w: ["ich", "gehen", "zur Arbeit", "zu Fuß", "jeden Morgen"], a: ["Ich gehe jeden Morgen zu Fuß zur Arbeit.", "Jeden Morgen gehe ich zu Fuß zur Arbeit."], r: ["tmp.order"] },
          { w: ["meine Eltern", "wohnen", "in Spanien", "seit zwei Jahren"], a: ["Meine Eltern wohnen seit zwei Jahren in Spanien.", "Seit zwei Jahren wohnen meine Eltern in Spanien."], r: ["tmp.order"], cap: true },
          { w: ["Lisa", "arbeiten", "zu Hause", "heute"], a: ["Lisa arbeitet heute zu Hause.", "Heute arbeitet Lisa zu Hause."], r: ["tmp.order"], cap: true },
          { w: ["wir", "sein", "nach Hause", "gestern", "mit dem Bus", "fahren"], a: ["Wir sind gestern mit dem Bus nach Hause gefahren."], r: ["tmp.order", "tmp.end"], vf: [["fahren", "pf", "wir"]] },
          { w: ["ich", "können", "morgen", "nicht", "ins Büro", "kommen"], a: ["Ich kann morgen nicht ins Büro kommen."], r: ["tmp.end"] },
          { w: ["die Kinder", "fahren", "zur Schule", "mit dem Velo", "jeden Tag"], a: ["Die Kinder fahren jeden Tag mit dem Velo zur Schule.", "Jeden Tag fahren die Kinder mit dem Velo zur Schule."], r: ["tmp.order"], cap: true },
          { w: ["wir", "essen", "bei meiner Oma", "am Sonntag"], a: ["Wir essen am Sonntag bei meiner Oma."], r: ["tmp.order"] },
          { w: ["mein Kollege", "fliegen", "nach London", "nächste Woche", "allein"], a: ["Mein Kollege fliegt nächste Woche allein nach London.", "Nächste Woche fliegt mein Kollege allein nach London."], r: ["tmp.order"], cap: true },
          { w: ["sie", "wollen", "im Sommer", "mit dem Zelt", "nach Schweden", "reisen"], a: ["Sie wollen im Sommer mit dem Zelt nach Schweden reisen."], r: ["tmp.order", "tmp.end"] },
        ] },
        // ── Production · Übung 28•9: build it, adding the little words ──
        { id: "d28.9", ex: "28.9", t: "compose", end: true, low: true, title: "Build it — add the little words", how: "Make a sentence from the words: conjugate, put them in order, and add the article or kein the noun needs.", d: ["der", "einen", "ein"], items: [
          { w: ["morgen", "wir", "fahren", "mit dem Auto", "nach Lugano"], a: ["Morgen fahren wir mit dem Auto nach Lugano."], r: ["front.one", "tmp.order"] },
          { w: ["am Abend", "ich", "sehen", "Film", "im Kino"], a: ["Am Abend sehe ich einen Film im Kino.", "Am Abend sehe ich im Kino einen Film."], r: ["front.one"] },
          { w: ["im Sommer", "die Kinder", "schwimmen", "jeden Tag", "im See"], a: ["Im Sommer schwimmen die Kinder jeden Tag im See.", "Die Kinder schwimmen im Sommer jeden Tag im See."], r: ["front.one", "tmp.order"] },
          { w: ["gestern", "ich", "sein", "mit dem Bus", "zur Arbeit", "fahren"], a: ["Gestern bin ich mit dem Bus zur Arbeit gefahren."], r: ["front.one", "tmp.order", "tmp.end"], vf: [["fahren", "pf", "ich"]] },
          { w: ["Film", "ich", "haben", "schon", "zweimal", "sehen"], a: ["Den Film habe ich schon zweimal gesehen.", "Ich habe den Film schon zweimal gesehen."], r: ["front.obj"], vf: [["sehen", "pf", "ich"]] },
          { w: ["nach der Arbeit", "Anna", "kaufen", "Geschenk", "für ihre Mutter"], a: ["Nach der Arbeit kauft Anna ein Geschenk für ihre Mutter.", "Nach der Arbeit kauft Anna für ihre Mutter ein Geschenk.", "Anna kauft nach der Arbeit ein Geschenk für ihre Mutter.", "Anna kauft nach der Arbeit für ihre Mutter ein Geschenk."], r: ["front.one"] },
          { w: ["es", "regnen", "deshalb", "wir", "bleiben", "zu Hause"], a: ["Es regnet, deshalb bleiben wir zu Hause."], r: ["front.conn"] },
          { w: ["am Wochenende", "mein Bruder", "fahren", "mit dem Velo", "in die Berge"], a: ["Am Wochenende fährt mein Bruder mit dem Velo in die Berge.", "Mein Bruder fährt am Wochenende mit dem Velo in die Berge."], r: ["front.one", "tmp.order"] },
          { w: ["leider", "ich", "haben", "heute", "kein", "Zeit"], a: ["Leider habe ich heute keine Zeit.", "Ich habe heute leider keine Zeit."], r: ["front.conn"] },
          { w: ["um acht Uhr", "Zug", "abfahren", "von Gleis drei"], a: ["Um acht Uhr fährt der Zug von Gleis drei ab.", "Der Zug fährt um acht Uhr von Gleis drei ab."], r: ["front.one", "tmp.end"] },
        ] },
        // ── Production: say it ──
        { id: "dp.front", t: "translate", end: true, title: "Say it in German", how: "Translate — the verb second, the details in their order.", items: [
          { q: "After work I'm going to the supermarket.", a: ["Nach der Arbeit gehe ich in den Supermarkt.", "Ich gehe nach der Arbeit in den Supermarkt.", "Nach der Arbeit gehe ich zum Supermarkt.", "Ich gehe nach der Arbeit zum Supermarkt."], r: ["front.one"] },
          { q: "I don't know that.", a: ["Das weiß ich nicht.", "Ich weiß das nicht."], r: ["front.obj"] },
          { q: "It's raining, so I'm taking the bus.", a: ["Es regnet, deshalb nehme ich den Bus.", "Es regnet, deshalb fahre ich mit dem Bus."], r: ["front.conn"] },
          { q: "Unfortunately I don't have time today.", a: ["Leider habe ich heute keine Zeit.", "Ich habe heute leider keine Zeit.", "Heute habe ich leider keine Zeit."], r: ["front.conn"] },
          { q: "I'm going to Basel by train tomorrow.", a: ["Ich fahre morgen mit dem Zug nach Basel.", "Morgen fahre ich mit dem Zug nach Basel."], r: ["tmp.order"] },
          { q: "She walks to work every day.", a: ["Sie geht jeden Tag zu Fuß zur Arbeit.", "Jeden Tag geht sie zu Fuß zur Arbeit."], r: ["tmp.order"] },
          { q: "Yesterday I went home by bus.", a: ["Gestern bin ich mit dem Bus nach Hause gefahren.", "Ich bin gestern mit dem Bus nach Hause gefahren."], r: ["tmp.order", "tmp.end"] },
          { q: "We're eating at home with friends on Sunday.", a: ["Wir essen am Sonntag mit Freunden zu Hause.", "Am Sonntag essen wir mit Freunden zu Hause.", "Wir essen am Sonntag mit Freunden daheim.", "Am Sonntag essen wir mit Freunden daheim."], r: ["tmp.order"] },
          { q: "The cake — my brother baked it. (Start with the cake.)", a: ["Den Kuchen hat mein Bruder gebacken."], r: ["front.obj"] },
          { q: "Luckily the train was on time.", a: ["Zum Glück war der Zug pünktlich.", "Der Zug war zum Glück pünktlich."], r: ["front.conn"] },
        ] },
        // ── Production · Übung 28•8: one sentence, three beginnings ──
        { id: "d28.8", ex: "28.8", t: "write", end: true, title: "Three ways to start", how: "Write the sentence three times — each time with something else first. Saved for Claude to correct.", items: [
          { q: "«Wir gehen spazieren.» — start with a time, a phrase (nach…, mit…, bei…), then *leider* or *deshalb*.", model: ["Heute gehen wir spazieren. Nach dem Essen gehen wir spazieren. Leider gehen wir heute nicht spazieren."], r: ["front.one", "front.conn"] },
          { q: "«Ich lerne Deutsch.» — start with a time, a place, then *deshalb*.", model: ["Jeden Abend lerne ich Deutsch. Im Zug lerne ich Deutsch. Ich wohne in Zürich, deshalb lerne ich Deutsch."], r: ["front.one", "front.conn"] },
          { q: "«Meine Freundin kauft ein Velo.» — start with a time, the object, then *vielleicht*.", model: ["Morgen kauft meine Freundin ein Velo. Ein Velo kauft meine Freundin. Vielleicht kauft meine Freundin ein Velo."], r: ["front.one", "front.obj", "front.conn"] },
          { q: "«Der Kurs beginnt.» — start with a day, a time of the clock, then *leider*.", model: ["Am Montag beginnt der Kurs. Um neun Uhr beginnt der Kurs. Leider beginnt der Kurs erst im März."], r: ["front.one", "front.conn"] },
          { q: "«Ich rufe meine Mutter an.» — start with a time, the object, then *dann*.", model: ["Am Sonntag rufe ich meine Mutter an. Meine Mutter rufe ich jeden Tag an. Dann rufe ich meine Mutter an."], r: ["front.one", "front.obj", "front.conn"] },
          { q: "«Wir treffen unsere Nachbarn.» — start with a time, a place, then *zum Glück*.", model: ["Am Abend treffen wir unsere Nachbarn. Im Treppenhaus treffen wir unsere Nachbarn. Zum Glück treffen wir unsere Nachbarn oft."], r: ["front.one", "front.conn"] },
          { q: "«Ich fahre nach Hause.» — add *morgen*, *mit dem Zug*; then start with each of them.", model: ["Ich fahre morgen mit dem Zug nach Hause. Morgen fahre ich mit dem Zug nach Hause. Mit dem Zug fahre ich morgen nach Hause."], r: ["tmp.order", "tmp.front"] },
          { q: "«Die Kinder spielen.» — add when, how and where; then start with the place.", model: ["Die Kinder spielen am Nachmittag ruhig im Garten. Im Garten spielen die Kinder am Nachmittag ruhig."], r: ["tmp.order", "tmp.front"] },
        ] },
        // ── Production · Übung 28•10: your own sentence from a cue ──
        { id: "d28.10", ex: "28.10", t: "write", end: true, title: "Start with the cue", how: "Write your own sentence starting with the words given. Saved for Claude to correct.", items: [
          { q: "(Am Wochenende …)", model: ["Am Wochenende schlafe ich lange und gehe mit Freunden wandern."], r: ["front.one"] },
          { q: "(Nach dem Deutschkurs …)", model: ["Nach dem Deutschkurs trinke ich mit meiner Kollegin einen Kaffee."], r: ["front.one"] },
          { q: "(Diesen Film / dieses Buch …)", model: ["Dieses Buch habe ich im Urlaub gelesen."], r: ["front.obj"] },
          { q: "(… , deshalb …)", model: ["Mein Velo ist kaputt, deshalb fahre ich mit dem Bus."], r: ["front.conn"] },
          { q: "(Zum Glück …)", model: ["Zum Glück habe ich meinen Schlüssel wieder gefunden."], r: ["front.conn"] },
          { q: "(Jeden Morgen …) — with when, how and where.", model: ["Jeden Morgen fahre ich mit dem Tram zur Arbeit."], r: ["tmp.order"] },
          { q: "(Letzten Sommer …) — in the Perfekt.", model: ["Letzten Sommer sind wir mit dem Zug nach Wien gefahren."], r: ["tmp.order", "tmp.end"] },
          { q: "(Leider …)", model: ["Leider kann ich heute Abend nicht kommen."], r: ["front.conn"] },
        ] },
      ],
    },
  },
});

// What chapter 14's and 28's word-order exercises became; chapter 11's
// "Adverbs of time" are future-tense drills, for the future lesson.
cxCover({
  "14.7": "d14.7",
  "14.8": { st: "planned", sec: "s1.conj1" }, "14.9": { st: "planned", sec: "s1.conj2" }, "14.10": { st: "planned", sec: "s1.conj2" },
  "28.6": "d28.6", "28.7": "d28.7", "28.8": "d28.8", "28.9": "d28.9", "28.10": "d28.10",
  "11.8": { st: "planned", sec: "s1.fu" }, "11.9": { st: "planned", sec: "s1.fu" },
});
