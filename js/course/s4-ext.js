// ── COURSE PACK · After B1 (bonus) · Extended participle modifiers ──
// Book: chapter 29's "Extended modifiers" — a heading with no exercise of
// its own (the chapter's 29•14–29•17 practise it, and were mirrored with
// short modifiers by the participles lesson, s2.ptadj, at B1). This lesson
// is the step after: the long modifier of written German (die seit Jahren in
// Basel lebende Künstlerin) — built from a relative clause, read back into
// one, -end or the Partizip II, and zu + -end for what must be done (die bis
// Freitag zu bezahlende Rechnung). C1, mostly to read: newspapers, letters,
// instructions. All our own sentences. One sheet.
cxPack({
  id: "s4-ext",
  sections: {
    "s4.ext": {
      rules: {
        "ext.build": "Article · details · participle · noun (das an der Ecke stehende Haus)",
        "ext.which": "Active, happening: -end · passive or done: the Partizip II",
        "ext.read": "To read one: jump from the article to the noun",
        "ext.zu": "zu + -end: must or can be done (die zu bezahlende Rechnung)",
      },
      sheets: [
        { id: "cx.ext", title: "die im Garten spielenden Kinder", qn: 3,
          struct: [["die", "who"], ["im Garten", "mid"], ["spielenden", "p2"], ["Kinder", "thing"]],
          why: "Written German packs a whole relative clause **in front of a noun**: *die Kinder, die im Garten spielen* becomes **die im Garten spielenden Kinder**. You meet it in news, letters and instructions — mostly to **read**, sometimes to write.",
          rid: ["ext.build", "ext.which", "ext.read", "ext.zu"],
          rules: [
            "Between the **article** and the **noun** comes everything the relative clause had, with the **participle last**: das Haus, das an der Ecke steht → **das an der Ecke stehende Haus**. The participle takes the adjective ending.",
            "An active verb, something happening, becomes the **present participle** (-end): der Mann, der singt → der **singende** Mann. A passive verb, or something finished, becomes the **Partizip II**: das Lied, das gesungen wurde → das **gesungene** Lied · der Zug, der angekommen ist → der **angekommene** Zug.",
            "To **read** one, notice an article that isn't followed by its noun: **die** seit Jahren in Basel lebende **Künstlerin**. Jump from the article to the noun after the participle, then read the middle as a relative clause: *the artist who has lived in Basel for years*.",
            "**zu + the present participle** says that something **must** or **can be done**: die **zu bezahlende** Rechnung (the bill to be paid) · ein **nicht zu unterschätzendes** Problem (a problem not to be underestimated).",
          ],
          table: { head: ["… which", "before the noun"], rows: [
            ["singt", "der **singende** Mann"],
            ["kommt an", "der **ankommende** Zug"],
            ["wartet dort", "die dort **wartende** Frau"],
            ["wurde gebacken", "das **gebackene** Brot"],
            ["ist angekommen", "der **angekommene** Zug"],
            ["muss man zahlen", "die **zu zahlende** Summe"],
          ] },
          ex: [
            ["Die **seit Montag gesperrte** Brücke ist wieder offen.", "The bridge, closed since Monday, is open again."],
            ["Wir suchen eine **gut Deutsch sprechende** Verkäuferin.", "We're looking for a sales assistant who speaks good German."],
            ["Die **im Preis enthaltenen** Leistungen finden Sie unten.", "You'll find the services included in the price below."],
            ["Bitte beachten Sie die **bis Ende Monat zu bezahlende** Rechnung.", "Please note the bill to be paid by the end of the month."],
          ],
          trap: "The participle comes **last**, right before the noun, with its ending: das **seit langem geplante** Fest — not ~~das geplante seit langem Fest~~. In conversation a relative clause sounds more natural: das Fest, das wir seit langem planen.",
          quiz: [
            { at: "r1", k: "order", q: "Build it: the car parked in front of the house", a: ["das", "vor dem Haus", "parkierte", "Auto"], why: "The details first, the participle last, then the noun." },
            { at: "r1", k: "pick", q: "die Kinder, die im See schwimmen →", o: ["die im See schwimmenden Kinder", "die schwimmenden im See Kinder", "die im See schwimmen Kinder"], a: 0, why: "Details, then the participle with its ending: **im See schwimmenden**." },
            { at: "r2", k: "pick", q: "der Kuchen, der gebacken wurde →", o: ["der gebackene Kuchen", "der backende Kuchen"], a: 0, why: "Passive: the Partizip II, **gebackene**." },
            { at: "r2", k: "pick", q: "die Frau, die telefoniert →", o: ["die telefonierende Frau", "die telefonierte Frau"], a: 0, why: "Active, happening: **telefonierende**." },
            { at: "r3", k: "pick", q: "«der seit Jahren in Bern lebende Autor» is:", o: ["the author who has lived in Bern for years", "the author who lived in Bern years ago", "the years the author lived in Bern"], a: 0, why: "Jump to the noun (Autor), then read the middle: who has lived in Bern for years." },
            { at: "r3", k: "pick", q: "In «die von allen gelobte Lehrerin», who is praised?", o: ["the teacher", "everyone"], a: 0, why: "The noun after the participle: **die Lehrerin**, praised by everyone." },
            { at: "r4", k: "pick", q: "«die zu lösende Aufgabe» means:", o: ["the task that must be solved", "the task that was solved", "the task that is solving"], a: 0, why: "zu + -end: it must (or can) be done." },
            { at: "r4", k: "type", cx: true, q: "die Briefe, die man noch beantworten muss → die noch zu ___ Briefe", a: ["beantwortenden"], r: ["ext.zu"], why: "zu + the present participle with its ending: **beantwortenden**." },
            { at: "table", k: "pick", q: "der Zug, der angekommen ist →", o: ["der angekommene Zug", "der ankommende Zug"], a: 0, why: "Finished: the Partizip II, **angekommene**." },
            { at: "trap", k: "pick", q: "Which is right?", o: ["das seit langem geplante Fest", "das geplante seit langem Fest", "das seit langem planende Fest"], a: 0, why: "The participle last, right before the noun — and planned is the Partizip II." },
          ] },
      ],
      diag: [
        { t: "swap", from: "^ge\\w+$", to: "^\\w+end\\w*$", rule: "ext.which", hard: true, msg: "It's active and happening: the **-end** form, **{right}**." },
        { t: "swap", from: "^\\w+end\\w*$", to: "^(ge\\w+|\\w+(t|en)e[nrms]?)$", rule: "ext.which", hard: true, msg: "It's passive or already done: the Partizip II, **{right}**." },
        { t: "swap", from: "^(\\w+end|ge\\w+|\\w+iert)\\w*$", to: "^(\\w+end|ge\\w+|\\w+iert)(e|en|er|es|em)$", rule: "ext.build", msg: "Right word, wrong ending: **{right}** — it takes the adjective's ending." },
        { t: "order", rule: "", msg: "Everything from the relative clause goes between the article and the noun, with the participle last: das **an der Ecke stehende** Haus." },
      ],
      drills: [
        // ── ours: unpack it ──
        { id: "dext.read", t: "transform", title: "Unpack it", how: "Say it with a relative clause: …, der / die / das … + the verb at the end, …", items: [
          { q: "Die am Bahnhof wartenden Leute sind nervös.", a: ["Die Leute, die am Bahnhof warten, sind nervös."], r: ["ext.read"] },
          { q: "Das gestern gekaufte Brot ist schon hart.", a: ["Das Brot, das gestern gekauft wurde, ist schon hart.", "Das Brot, das gestern gekauft worden ist, ist schon hart.", "Das Brot, das ich gestern gekauft habe, ist schon hart.", "Das Brot, das wir gestern gekauft haben, ist schon hart."], r: ["ext.read"] },
          { q: "Der seit einer Stunde klingelnde Wecker nervt.", a: ["Der Wecker, der seit einer Stunde klingelt, nervt."], r: ["ext.read"] },
          { q: "Die von der Gemeinde geplante Straße wird teuer.", a: ["Die Straße, die von der Gemeinde geplant wird, wird teuer.", "Die Straße, die von der Gemeinde geplant wurde, wird teuer.", "Die Straße, die die Gemeinde plant, wird teuer.", "Die Straße, die die Gemeinde geplant hat, wird teuer."], r: ["ext.read"] },
          { q: "Wir sprechen mit dem im Rollstuhl sitzenden Mann.", a: ["Wir sprechen mit dem Mann, der im Rollstuhl sitzt."], r: ["ext.read"] },
          { q: "Das um acht Uhr abfahrende Schiff ist voll.", a: ["Das Schiff, das um acht Uhr abfährt, ist voll."], r: ["ext.read"] },
          { q: "Die schon angekommenen Gäste trinken Kaffee.", a: ["Die Gäste, die schon angekommen sind, trinken Kaffee."], r: ["ext.read"] },
          { q: "Ich lese den von meiner Tochter geschriebenen Brief.", a: ["Ich lese den Brief, den meine Tochter geschrieben hat.", "Ich lese den Brief, der von meiner Tochter geschrieben wurde.", "Ich lese den Brief, der von meiner Tochter geschrieben worden ist."], r: ["ext.read"] },
          { q: "Der laut bellende Hund gehört dem Nachbarn.", a: ["Der Hund, der laut bellt, gehört dem Nachbarn."], r: ["ext.read"] },
          { q: "Die im Preis enthaltene Versicherung ist gut.", a: ["Die Versicherung, die im Preis enthalten ist, ist gut."], r: ["ext.read"] },
        ] },
        // ── ours: pack it ──
        { id: "dext.build", t: "transform", title: "Pack it", how: "Write it the way a newspaper would: the details and the participle between the article and the noun.", items: [
          { q: "Die Frau, die im Café sitzt, ist meine Lehrerin.", a: ["Die im Café sitzende Frau ist meine Lehrerin."], r: ["ext.build"] },
          { q: "Das Auto, das falsch parkiert ist, bekommt eine Busse.", a: ["Das falsch parkierte Auto bekommt eine Busse."], r: ["ext.which"] },
          { q: "Die Kinder, die auf dem Spielplatz spielen, lachen.", a: ["Die auf dem Spielplatz spielenden Kinder lachen."], r: ["ext.build"] },
          { q: "Der Zug, der aus Genf kommt, hat Verspätung.", a: ["Der aus Genf kommende Zug hat Verspätung."], r: ["ext.build"] },
          { q: "Die Bücher, die zurückgegeben wurden, liegen auf dem Tisch.", a: ["Die zurückgegebenen Bücher liegen auf dem Tisch."], r: ["ext.which"] },
          { q: "Der Mann, der seinen Schlüssel sucht, ist nervös.", a: ["Der seinen Schlüssel suchende Mann ist nervös."], r: ["ext.build"] },
          { q: "Das Haus, das vor hundert Jahren gebaut wurde, wird renoviert.", a: ["Das vor hundert Jahren gebaute Haus wird renoviert."], r: ["ext.which"] },
          { q: "Wir helfen der Nachbarin, die allein lebt.", a: ["Wir helfen der allein lebenden Nachbarin.", "Wir helfen der alleinlebenden Nachbarin."], r: ["ext.build"] },
          { q: "Die Preise, die stark gestiegen sind, ärgern alle.", a: ["Die stark gestiegenen Preise ärgern alle."], r: ["ext.which"] },
          { q: "Der Brief, der gestern angekommen ist, ist von der Steuerverwaltung.", a: ["Der gestern angekommene Brief ist von der Steuerverwaltung."], r: ["ext.which"] },
        ] },
        // ── ours: -end or the Partizip II ──
        { id: "dext.which", t: "type", title: "-end or Partizip II?", how: "Write the participle with its ending: -end if it's happening, the Partizip II if it's been done.", items: [
          { q: "das ___ Wasser (kochen — it's boiling now)", a: ["kochende"], r: ["ext.which"] },
          { q: "die ___ Tür (schließen — someone has closed it)", a: ["geschlossene"], r: ["ext.which"] },
          { q: "ein ___ Kind (weinen — it's crying)", a: ["weinendes"], r: ["ext.which"] },
          { q: "der gestern ___ Film (zeigen — it was shown)", a: ["gezeigte"], r: ["ext.which"] },
          { q: "die bald ___ Gäste (ankommen — they arrive soon)", a: ["ankommenden"], r: ["ext.which"] },
          { q: "das schon ___ Paket (abholen — it has been picked up)", a: ["abgeholte"], r: ["ext.which"] },
          { q: "mit dem frisch ___ Kaffee (mahlen — it was ground)", a: ["gemahlenen"], r: ["ext.which"] },
          { q: "eine gut ___ Lehrerin (erklären — she explains well)", a: ["erklärende"], r: ["ext.which"] },
          { q: "die im Garten ___ Vögel (singen — they're singing)", a: ["singenden"], r: ["ext.which"] },
          { q: "der vor einer Woche ___ Brief (schicken — it was sent)", a: ["geschickte"], r: ["ext.which"] },
        ] },
        // ── ours: what must be done ──
        { id: "dext.zu", t: "transform", low: true, title: "What must be done", how: "Say it with zu + the present participle before the noun: die Rechnung, die man bezahlen muss → die zu bezahlende Rechnung.", items: [
          { q: "die Rechnung, die man bezahlen muss", a: ["die zu bezahlende Rechnung"], r: ["ext.zu"] },
          { q: "die Fragen, die man beantworten muss", a: ["die zu beantwortenden Fragen"], r: ["ext.zu"] },
          { q: "ein Problem, das man nicht unterschätzen darf", a: ["ein nicht zu unterschätzendes Problem"], r: ["ext.zu"] },
          { q: "die Arbeiten, die man noch erledigen muss", a: ["die noch zu erledigenden Arbeiten"], r: ["ext.zu"] },
          { q: "das Formular, das man ausfüllen muss", a: ["das auszufüllende Formular"], r: ["ext.zu"], note: "A separable verb takes zu inside: aus**zu**füllende." },
          { q: "die Medikamente, die man täglich nehmen muss", a: ["die täglich zu nehmenden Medikamente"], r: ["ext.zu"] },
          { q: "der Termin, den man nicht verschieben kann", a: ["der nicht zu verschiebende Termin"], r: ["ext.zu"] },
          { q: "die Pakete, die man abholen muss", a: ["die abzuholenden Pakete"], r: ["ext.zu"] },
          { q: "ein Fehler, den man vermeiden muss", a: ["ein zu vermeidender Fehler"], r: ["ext.zu"] },
          { q: "die Bücher, die man bis Montag lesen muss", a: ["die bis Montag zu lesenden Bücher"], r: ["ext.zu"] },
        ] },
        // ── Production ──
        { id: "dext.compose", t: "compose", low: true, end: true, title: "Build the phrase", how: "Build the phrase: the article, the details, the participle with its ending, then the noun.", items: [
          { w: ["der Zug", "aus Basel", "kommen"], a: ["der aus Basel kommende Zug"], r: ["ext.build"] },
          { w: ["das Brot", "frisch", "backen"], a: ["das frisch gebackene Brot"], r: ["ext.which"] },
          { w: ["die Kinder", "im Wald", "spielen"], a: ["die im Wald spielenden Kinder"], r: ["ext.build"] },
          { w: ["die Rechnung", "bis Freitag", "zu bezahlen"], a: ["die bis Freitag zu bezahlende Rechnung"], r: ["ext.zu"] },
          { w: ["das Haus", "1920", "bauen"], a: ["das 1920 gebaute Haus"], r: ["ext.which"] },
          { w: ["der Mann", "laut", "telefonieren"], a: ["der laut telefonierende Mann"], r: ["ext.build"] },
          { w: ["die Stelle", "gestern", "ausschreiben"], a: ["die gestern ausgeschriebene Stelle"], r: ["ext.which"] },
          { w: ["die Gäste", "spät", "ankommen", "(done)"], a: ["die spät angekommenen Gäste"], r: ["ext.which"] },
          { w: ["das Problem", "nicht", "zu unterschätzen"], a: ["das nicht zu unterschätzende Problem"], r: ["ext.zu"] },
        ] },
        { id: "dp.ext", t: "translate", low: true, end: true, title: "Say it in German", how: "Translate — with the participle before the noun. A relative clause is right too.", items: [
          { q: "the children playing in the garden", a: ["die im Garten spielenden Kinder", "die Kinder, die im Garten spielen"], r: ["ext.build"] },
          { q: "the bridge closed since Monday", a: ["die seit Montag gesperrte Brücke", "die seit Montag geschlossene Brücke", "die Brücke, die seit Montag gesperrt ist", "die Brücke, die seit Montag geschlossen ist"], r: ["ext.which"] },
          { q: "the bill to be paid", a: ["die zu bezahlende Rechnung", "die zu zahlende Rechnung", "die Rechnung, die bezahlt werden muss", "die Rechnung, die man bezahlen muss"], r: ["ext.zu"] },
          { q: "the train arriving from Zurich", a: ["der aus Zürich ankommende Zug", "der Zug, der aus Zürich ankommt"], r: ["ext.build"] },
          { q: "the flat renovated last year", a: ["die letztes Jahr renovierte Wohnung", "die im letzten Jahr renovierte Wohnung", "die Wohnung, die letztes Jahr renoviert wurde"], r: ["ext.which"] },
          { q: "a much discussed topic", a: ["ein viel diskutiertes Thema"], r: ["ext.which"] },
          { q: "the guests who have already left", a: ["die schon gegangenen Gäste", "die bereits gegangenen Gäste", "die schon abgereisten Gäste", "die Gäste, die schon gegangen sind"], r: ["ext.which"] },
          { q: "a problem not to be underestimated", a: ["ein nicht zu unterschätzendes Problem", "ein Problem, das man nicht unterschätzen darf"], r: ["ext.zu"] },
        ] },
        { id: "dw.ext", t: "write", end: true, title: "Write your own", how: "Write in your own words — newspaper style. Saved for Claude to correct.", items: [
          { q: "Write a small ad for a job or a flat, the way newspapers do.", model: ["Gesucht: zuverlässige, gut Deutsch sprechende Verkäuferin für unser seit 1950 bestehendes Geschäft in der Altstadt."], r: ["ext.build"] },
          { q: "Describe a photo: who is doing what? Use two -end participles before nouns.", model: ["Auf dem Foto sieht man die am See spielenden Kinder und einen lesenden Mann auf einer Bank."], r: ["ext.which"] },
          { q: "A notice for your building: what must be done? (die bis … abzugebenden …)", model: ["Die bis Ende Monat zu bezahlenden Nebenkosten sind auf dem beiliegenden Einzahlungsschein aufgeführt."], r: ["ext.zu"] },
          { q: "Two sentences in newspaper style about something in your town.", model: ["Die seit Monaten geplante Velostraße wird im Frühling eröffnet. Die von der Gemeinde geschätzten Kosten liegen bei zwei Millionen Franken."], r: ["ext.build"] },
          { q: "Your street in the morning: the people waiting, the bus arriving …", model: ["Um sieben Uhr stehen die auf den Bus wartenden Leute an der Haltestelle. Der pünktlich ankommende Bus ist immer voll."], r: ["ext.which"] },
          { q: "Something you bought that was a mistake: the online ordered …, the never used …", model: ["Der online bestellte Mixer war viel zu groß. Das nie benutzte Gerät steht jetzt im Keller."], r: ["ext.which"] },
          { q: "Your to-do list in one sentence: Die heute noch zu erledigenden Aufgaben sind …", model: ["Die heute noch zu erledigenden Aufgaben sind: die Steuererklärung, ein Anruf bei der Bank und der Einkauf für morgen."], r: ["ext.zu"] },
          { q: "Describe a festival: the decorated streets, the dancing people, the music played …", model: ["Die geschmückten Straßen waren voller tanzender Menschen. Die bis spät in die Nacht gespielte Musik hörte man bis zum See."], r: ["ext.build"] },
        ] },
      ],
    },
  },
});
