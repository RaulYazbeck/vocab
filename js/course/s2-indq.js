// ── COURSE PACK · Stage 2 · Indirect questions · dass or ob? ──
// Book: chapter 23's "Conjunctions" (Übung 23•11: a question after "Wir
// wussten nicht, … / Können Sie mir sagen, …"), chapter 29's
// "Interrogatives" (29•9: after "Ich weiß nicht" — with ob where it's
// needed) and chapter 26's "Indirect Questions" and "sollen in Commands"
// (26•11: someone's many questions, passed on · 26•12: what you were told
// to do). The book writes 26•11 and 26•12 in the Konjunktiv I (…, wie alt
// sie sei · …, ich solle …) — written, reported speech above B1 (the bonus
// lesson s4.k1); the mirrors keep the exercises' frames in everyday German:
// Er fragt, wie alt sie ist. · Der Arzt sagt, ich soll mehr schlafen.
// Two sheets: a W-question inside a sentence (the verb last, polite
// openings, the preposition with its W-word) · ob for a yes/no question,
// dass or ob, ob or wenn, and passing on a request with sollen.
cxPack({
  id: "s2-indq",
  sections: {
    "s2.indq": {
      testout: { n: 8, miss: 1 },
      rules: {
        "iq.w": "A W-question inside a sentence: the verb last",
        "iq.two": "Two verbs: the conjugated one goes last",
        "iq.polite": "Polite openings: Können Sie mir sagen, …",
        "iq.prep": "The preposition stays with its W-word",
        "iq.ob": "A yes/no question inside a sentence: ob",
        "iq.dassob": "dass for a fact, ob for an open question",
        "iq.wenn": "ob (whether) or wenn (on that condition)?",
        "iq.soll": "Passing on a request: Er sagt, ich soll …",
      },
      sheets: [
        { id: "cx.iq1", title: "Ich weiß nicht, wo er wohnt", qn: 3,
          struct: [["Weißt du,", "thing"], ["wo", "pre"], ["er", "who"], ["…", "mid"], ["wohnt", "verb"], ["?", "mid"]],
          why: "A question can sit **inside** a sentence: *I don't know where he lives.* The W-word stays, but now it starts a side sentence, so the verb goes to the **end**. It's also how you ask strangers politely.",
          rid: ["iq.w", "iq.two", "iq.polite", "iq.prep"],
          rules: [
            "Inside a sentence, the W-word comes first, then the subject, and the conjugated verb goes **last**. Wo **wohnt** er? → Ich weiß nicht, **wo** er **wohnt**. · Was **kostet** das? → Weißt du, **was** das **kostet**?",
            "With two verbs, the conjugated one goes last of all, and a separable verb joins up again. Wann **fährt** der Zug **ab**? → …, wann der Zug **abfährt**. · Was **hat** sie gesagt? → …, was sie gesagt **hat**.",
            "To ask a stranger politely, start with **Können Sie mir sagen, …** or **Wissen Sie, …**. Use a question mark only if the opening itself asks: **Wissen Sie**, wo die Post ist**?** But: Ich weiß nicht, wo die Post ist**.**",
            "A preposition stays in front of its W-word. Mit wem spricht sie? → Ich weiß nicht, **mit wem** sie spricht. · …, **für wen** das Paket ist · …, **um wie viel Uhr** der Kurs beginnt.",
          ],
          table: { head: ["the question", "inside a sentence"], rows: [
            ["Wo **ist** die Post?", "…, wo die Post **ist**."],
            ["Wann **kommt** er **an**?", "…, wann er **ankommt**."],
            ["Was **hat** er gesagt?", "…, was er gesagt **hat**."],
            ["Mit wem **wohnt** sie?", "…, mit wem sie **wohnt**."],
          ] },
          ex: [
            ["Entschuldigung, wissen Sie, **wo** der Bahnhof **ist**?", "Excuse me, do you know where the station is?"],
            ["Ich habe keine Ahnung, **warum** der Zug so spät **kommt**.", "I have no idea why the train is so late."],
            ["Können Sie mir sagen, **wie viel** das Billett **kostet**?", "Can you tell me how much the ticket costs?"],
            ["Weißt du, **mit wem** Tom gestern im Kino **war**?", "Do you know who Tom was at the cinema with yesterday?"],
          ],
          trap: "Don't keep the question's word order inside a sentence: ~~Weißt du, wo ist die Post?~~ is wrong. The verb goes to the end: Weißt du, wo die Post **ist**?",
          quiz: [
            { at: "r1", k: "pick", q: "Ich weiß nicht, wo ___.", o: ["er wohnt", "wohnt er"], a: 0, why: "Inside a sentence the verb goes last: er **wohnt**." },
            { at: "r1", k: "order", q: "Build it: Do you know what that costs?", a: ["Weißt du,", "was", "das", "kostet?"], why: "The W-word, then the subject, then the verb last." },
            { at: "r2", k: "pick", q: "Weißt du, wann der Zug ___?", o: ["abfährt", "fährt ab", "ab fährt"], a: 0, why: "At the end, a separable verb joins up: **abfährt**." },
            { at: "r2", k: "pick", q: "Ich möchte wissen, was er ___.", o: ["gesagt hat", "hat gesagt"], a: 0, why: "The conjugated verb goes last: gesagt **hat**." },
            { at: "r2", k: "type", cx: true, q: "Wo kann ich parkieren? → Wissen Sie, wo ich parkieren ___?", a: ["kann"], r: ["iq.two"], why: "The modal verb goes last: parkieren **kann**." },
            { at: "r3", k: "pick", q: "The polite way to ask a stranger:", o: ["Können Sie mir sagen, wo die Toilette ist?", "Wo ist Toilette?", "Sagen Sie, wo ist die Toilette?"], a: 0, why: "**Können Sie mir sagen, …** with the verb last is the polite way." },
            { at: "r3", k: "pick", q: "Which one ends with a question mark?", o: ["Wissen Sie, wie spät es ist", "Ich weiß nicht, wie spät es ist", "Ich möchte wissen, wie spät es ist"], a: 0, why: "Only **Wissen Sie, …** asks. The others state something, so they end with a full stop." },
            { at: "r4", k: "pick", q: "Weißt du, ___ sie telefoniert?", o: ["mit wem", "wem mit", "wer mit"], a: 0, why: "The preposition stays in front: **mit wem**." },
            { at: "r4", k: "pick", q: "Ich weiß nicht, ___ das Geschenk ist.", o: ["für wen", "wen für", "für wem"], a: 0, why: "für takes the accusative: **für wen**." },
            { at: "table", k: "pick", q: "Was hat er gekauft? → Ich weiß nicht, was er ___.", o: ["gekauft hat", "hat gekauft", "kauft hat"], a: 0, why: "The conjugated verb goes last: gekauft **hat**." },
            { at: "trap", k: "pick", q: "Which is right?", o: ["Wissen Sie, wo die Post ist?", "Wissen Sie, wo ist die Post?"], a: 0, why: "Inside the sentence the verb goes last: die Post **ist**." },
          ] },
        { id: "cx.iq2", title: "ob — and dass or ob?", qn: 3,
          struct: [["Ich weiß nicht,", "thing"], ["ob", "pre"], ["er", "who"], ["…", "mid"], ["kommt", "verb"]],
          why: "A yes/no question has no W-word to start the side sentence, so **ob** (whether, if) does that job. And to pass on what someone told you to do, you use **sollen**.",
          rid: ["iq.ob", "iq.dassob", "iq.wenn", "iq.soll"],
          rules: [
            "A **yes/no** question inside a sentence starts with **ob**, and the verb goes last. **Kommt** er heute? → Ich weiß nicht, **ob** er heute **kommt**. · **Ist** der Laden offen? → Weißt du, **ob** er offen **ist**?",
            "Use **dass** for a fact and **ob** for something still open (yes or no?). Ich weiß, **dass** er kommt. · Ich weiß nicht, **ob** er kommt. · Ich bin nicht sicher, **ob** es klappt.",
            "English *if* is **ob** when it means *whether*, and **wenn** when it means *on that condition*. Ich frage ihn, **ob** er Zeit hat. · Ich komme, **wenn** ich Zeit habe. If you can add *or not*, it's ob.",
            "To pass on what someone wants you to do, use **sollen**. «Trinken Sie viel!» → Der Arzt sagt, ich **soll** viel **trinken**. · «Ruf mich an!» → Sie sagt, du **sollst** sie **anrufen**.",
          ],
          table: { head: ["", "example"], rows: [
            ["**ob**", "Weißt du, **ob** er kommt?"],
            ["**dass**", "Ich weiß, **dass** er kommt."],
            ["**wenn**", "Ich komme, **wenn** ich kann."],
            ["**sollen**", "Er sagt, ich **soll** warten."],
          ] },
          ex: [
            ["Ich bin nicht sicher, **ob** ich am Samstag Zeit **habe**.", "I'm not sure whether I have time on Saturday."],
            ["Können Sie mir sagen, **ob** dieser Zug nach Bern **fährt**?", "Can you tell me if this train goes to Bern?"],
            ["Meine Frau fragt, **ob** du mit uns essen **möchtest**.", "My wife is asking whether you'd like to eat with us."],
            ["Die Lehrerin sagt, wir **sollen** jeden Tag zehn Wörter **lernen**.", "The teacher says we should learn ten words every day."],
          ],
          trap: "*I don't know if …* is **ob**, never wenn: ~~Ich weiß nicht, wenn er kommt~~ should be Ich weiß nicht, **ob** er kommt. *Ich wusste nicht, dass …* is fine: there it's a fact.",
          quiz: [
            { at: "r1", k: "pick", q: "Kommt Lea mit? → Ich weiß nicht, ___ Lea mitkommt.", o: ["ob", "dass", "wenn"], a: 0, why: "A yes/no question inside a sentence: **ob**." },
            { at: "r1", k: "order", q: "Build it: Do you know if the shop is open?", a: ["Weißt du,", "ob", "der Laden", "offen", "ist?"], why: "ob, then the subject, then the verb last." },
            { at: "r2", k: "pick", q: "Ich weiß, ___ der Kurs um acht beginnt.", o: ["dass", "ob"], a: 0, why: "You know it, so it's a fact: **dass**." },
            { at: "r2", k: "pick", q: "Ich bin nicht sicher, ___ der Kurs heute stattfindet.", o: ["ob", "dass"], a: 0, why: "It's still open (yes or no?), so **ob**." },
            { at: "r3", k: "pick", q: "Ich frage den Chef, ___ ich morgen frei haben kann.", o: ["ob", "wenn"], a: 0, why: "It means *whether (or not)*: **ob**." },
            { at: "r3", k: "pick", q: "Ich komme mit, ___ ich morgen frei habe.", o: ["wenn", "ob"], a: 0, why: "A condition: **wenn**." },
            { at: "r4", k: "pick", q: "«Warten Sie hier!» → Er sagt, ich ___ hier warten.", o: ["soll", "will", "bin"], a: 0, why: "A request passed on: **soll**." },
            { at: "r4", k: "type", cx: true, q: "«Ruf mich bitte an!» → Mama sagt, du ___ sie anrufen.", a: ["sollst"], r: ["iq.soll"], why: "With du, sollen becomes **sollst**." },
            { at: "table", k: "pick", q: "Weißt du, ___ der Bus schon weg ist?", o: ["ob", "wenn", "was"], a: 0, why: "A yes/no question: **ob**." },
            { at: "trap", k: "pick", q: "Which is right?", o: ["Ich weiß nicht, ob er heute kommt.", "Ich weiß nicht, wenn er heute kommt."], a: 0, why: "*if* here means *whether*: **ob**." },
          ] },
      ],
      diag: [
        { t: "swap", from: "^wenn$", to: "^ob$", rule: "iq.wenn", hard: true, msg: "*if* here means *whether (or not)*, so it's **ob**. wenn is for a condition." },
        { t: "swap", from: "^ob$", to: "^wenn$", rule: "iq.wenn", hard: true, msg: "This is a condition (*if that happens*), so it's **wenn**. ob means *whether or not*." },
        { t: "swap", from: "^dass$", to: "^ob$", rule: "iq.dassob", hard: true, msg: "It's still open (yes or no?), so it's **ob**. dass states a fact." },
        { t: "swap", from: "^ob$", to: "^dass$", rule: "iq.dassob", hard: true, msg: "It's a fact and nothing is open, so it's **dass**." },
        { t: "swap", from: "^wen$", to: "^wem$", rule: "iq.prep", hard: true, msg: "This preposition takes the dative: **wem**." },
        { t: "swap", from: "^wem$", to: "^wen$", rule: "iq.prep", hard: true, msg: "This preposition takes the accusative: **wen**." },
        { t: "missing", whole: true, tok: "^ob$", rule: "iq.ob", msg: "A yes/no question needs **ob** to join it on, with the verb last: …, **ob** er kommt." },
        { t: "extra", tok: "^ob$", rule: "iq.w", msg: "There's a W-word already, and it joins the question on its own: no ob." },
        { t: "missing", whole: true, tok: "^(soll|sollst|sollen|sollt)$", rule: "iq.soll", msg: "Pass the request on with **sollen**: …, ich **soll** …, with the infinitive at the end." },
        { t: "pos", tok: "^(bin|bist|ist|sind|seid|habe|hast|hat|haben|habt|muss|musst|mussen|kann|kannst|konnen|will|willst|wollen|darf|darfst|durfen|mochte|mochtest|mochten|war|waren|hatte|hatten|wird|werden)$", rule: "", msg: "The verb is out of place: it goes {where}. It's second in a main sentence and at the end of a side sentence." },
        { t: "order", rule: "", msg: "Right words, wrong order: inside a sentence the question's verb goes **last**: …, wo er **wohnt**." },
      ],
      drills: [
        // ── our own: where the verb goes ──
        { id: "diq.verb", t: "pick", title: "Where does the verb go?", how: "Pick the ending with the verb in its place: last.", items: [
          { q: "Weißt du, wo ___?", o: ["mein Handy ist", "ist mein Handy"], a: ["mein Handy ist"], r: ["iq.w"] },
          { q: "Ich weiß nicht, warum ___.", o: ["sie nicht kommt", "sie kommt nicht", "kommt sie nicht"], a: ["sie nicht kommt"], r: ["iq.w"] },
          { q: "Können Sie mir sagen, wann ___?", o: ["der Zug ankommt", "der Zug kommt an", "kommt der Zug an"], a: ["der Zug ankommt"], r: ["iq.two"] },
          { q: "Ich möchte wissen, was ___.", o: ["du gekauft hast", "du hast gekauft", "hast du gekauft"], a: ["du gekauft hast"], r: ["iq.two"] },
          { q: "Wissen Sie, wie ___?", o: ["man zum Bahnhof kommt", "man kommt zum Bahnhof", "kommt man zum Bahnhof"], a: ["man zum Bahnhof kommt"], r: ["iq.w"] },
          { q: "Er fragt, wo ___.", o: ["er parkieren kann", "er kann parkieren", "kann er parkieren"], a: ["er parkieren kann"], r: ["iq.two"] },
          { q: "Ich habe vergessen, wie ___.", o: ["der neue Kollege heißt", "heißt der neue Kollege", "der neue Kollege heißen"], a: ["der neue Kollege heißt"], r: ["iq.w"] },
          { q: "Weißt du, ob ___?", o: ["die Bäckerei offen ist", "ist die Bäckerei offen", "die Bäckerei ist offen"], a: ["die Bäckerei offen ist"], r: ["iq.ob"] },
          { q: "Sag mir bitte, wann ___.", o: ["du nach Hause kommst", "kommst du nach Hause", "du kommst nach Hause"], a: ["du nach Hause kommst"], r: ["iq.w"] },
          { q: "Ich bin nicht sicher, ob ___.", o: ["ich das richtig verstanden habe", "ich habe das richtig verstanden", "habe ich das richtig verstanden"], a: ["ich das richtig verstanden habe"], r: ["iq.ob"] },
          { q: "Niemand weiß, wem ___.", o: ["dieses Velo gehört", "gehört dieses Velo"], a: ["dieses Velo gehört"], r: ["iq.w"] },
        ] },
        // ── our own: the word that joins ──
        { id: "diq.type", t: "type", title: "The joining word", how: "Write the W-word that fits the answer, or ob for a yes/no question.", items: [
          { q: "Weißt du, ___ der Kurs kostet? — 300 Franken.", a: ["wie viel", "was"], r: ["iq.w"] },
          { q: "Ich weiß nicht, ___ der Hauswart wohnt. — Im ersten Stock.", a: ["wo"], r: ["iq.w"] },
          { q: "Können Sie mir sagen, ___ der Bus fährt? — In fünf Minuten.", a: ["wann"], r: ["iq.w"] },
          { q: "Weißt du, ___ Lea heute kommt? — Nein, sie ist krank.", a: ["ob"], r: ["iq.ob"] },
          { q: "Ich möchte wissen, ___ du so spät kommst. — Weil der Zug Verspätung hatte.", a: ["warum", "wieso", "weshalb"], r: ["iq.w"] },
          { q: "Wissen Sie, ___ dieser Schlüssel gehört? — Dem Nachbarn.", a: ["wem"], r: ["iq.w"] },
          { q: "Er fragt, ___ wir Kinder haben. — Ja, zwei.", a: ["ob"], r: ["iq.ob"] },
          { q: "Ich habe keine Ahnung, ___ das gemacht hat. — Tom.", a: ["wer"], r: ["iq.w"] },
          { q: "Kannst du mir sagen, ___ dieses Wort bedeutet?", a: ["was"], r: ["iq.w"] },
          { q: "Ich weiß nicht, mit ___ sie verheiratet ist. — Mit einem Arzt.", a: ["wem"], r: ["iq.prep"] },
          { q: "Sie möchte wissen, ___ das Zimmer einen Balkon hat. — Ja, einen kleinen.", a: ["ob"], r: ["iq.ob"] },
          { q: "Weißt du, für ___ die Blumen sind? — Für Oma.", a: ["wen"], r: ["iq.prep"] },
          { q: "Ich frage mich, ___ der Zug kommt. — Aus Genf.", a: ["woher"], r: ["iq.w"] },
        ] },
        // ── Übung 23•11: the question after an opening ──
        { id: "d23.11", ex: "23.11", t: "transform", title: "Wir wissen nicht, …", how: "Put the question after the words in brackets. The W-word stays; the verb goes to the end.", items: [
          { q: "Warum ist Sara früher gegangen? (Wir wissen nicht, …)", a: ["Wir wissen nicht, warum Sara früher gegangen ist."], r: ["iq.two"] },
          { q: "Was hat er in der Stadt gekauft? (Wir wissen nicht, …)", a: ["Wir wissen nicht, was er in der Stadt gekauft hat."], r: ["iq.two"] },
          { q: "Mit wem hat Lea Tennis gespielt? (Wir wissen nicht, …)", a: ["Wir wissen nicht, mit wem Lea Tennis gespielt hat."], r: ["iq.prep"] },
          { q: "Wie lange müssen sie im Spital bleiben? (Wir wissen nicht, …)", a: ["Wir wissen nicht, wie lange sie im Spital bleiben müssen."], r: ["iq.two"] },
          { q: "Für wen hat Tom den Kuchen gebacken? (Jemand fragt, …)", a: ["Jemand fragt, für wen Tom den Kuchen gebacken hat."], r: ["iq.prep"] },
          { q: "Wann ist das Tram abgefahren? (Jemand fragt, …)", a: ["Jemand fragt, wann das Tram abgefahren ist."], r: ["iq.two"] },
          { q: "Wohin sind die Kinder gelaufen? (Jemand fragt, …)", a: ["Jemand fragt, wohin die Kinder gelaufen sind."], r: ["iq.two"] },
          { q: "Wem gehört der rote Rucksack? (Jemand fragt, …)", a: ["Jemand fragt, wem der rote Rucksack gehört."], r: ["iq.w"] },
          { q: "Um wie viel Uhr kommt der Zug an? (Können Sie mir sagen, …)", a: ["Können Sie mir sagen, um wie viel Uhr der Zug ankommt?"], r: ["iq.prep", "iq.polite"] },
          { q: "Wo finde ich einen Geldautomaten? (Können Sie mir sagen, …)", a: ["Können Sie mir sagen, wo ich einen Geldautomaten finde?"], r: ["iq.polite"] },
          { q: "Was ist passiert? (Können Sie mir sagen, …)", a: ["Können Sie mir sagen, was passiert ist?"], r: ["iq.polite", "iq.two"] },
          { q: "Wie viel kosten diese Schuhe? (Können Sie mir sagen, …)", a: ["Können Sie mir sagen, wie viel diese Schuhe kosten?"], r: ["iq.polite"] },
          { q: "Aus welchem Land kommt der neue Nachbar? (Weißt du, …)", a: ["Weißt du, aus welchem Land der neue Nachbar kommt?"], r: ["iq.prep"] },
        ] },
        // ── our own: asking a stranger politely ──
        { id: "diq.polite", t: "transform", title: "Wissen Sie, …?", how: "Ask it politely, starting with Wissen Sie, … The verb goes to the end.", items: [
          { q: "Wo ist die Toilette?", a: ["Wissen Sie, wo die Toilette ist?"], r: ["iq.polite"] },
          { q: "Wann fährt der nächste Zug nach Bern?", a: ["Wissen Sie, wann der nächste Zug nach Bern fährt?"], r: ["iq.polite"] },
          { q: "Wie komme ich zum Bahnhof?", a: ["Wissen Sie, wie ich zum Bahnhof komme?"], r: ["iq.polite"] },
          { q: "Wo kann man hier parkieren?", a: ["Wissen Sie, wo man hier parkieren kann?"], r: ["iq.polite", "iq.two"] },
          { q: "Wie lange hat die Apotheke offen?", a: ["Wissen Sie, wie lange die Apotheke offen hat?"], r: ["iq.polite"] },
          { q: "Welcher Bus fährt zum Spital?", a: ["Wissen Sie, welcher Bus zum Spital fährt?"], r: ["iq.polite"] },
          { q: "Wo muss ich umsteigen?", a: ["Wissen Sie, wo ich umsteigen muss?"], r: ["iq.polite", "iq.two"] },
          { q: "Was kostet ein Billett nach Luzern?", a: ["Wissen Sie, was ein Billett nach Luzern kostet?"], r: ["iq.polite"] },
          { q: "Wo gibt es hier einen Supermarkt?", a: ["Wissen Sie, wo es hier einen Supermarkt gibt?"], r: ["iq.polite"] },
          { q: "Wann macht die Post auf?", a: ["Wissen Sie, wann die Post aufmacht?"], r: ["iq.polite", "iq.two"] },
        ] },
        // ── Übung 29•9: after "Ich weiß nicht" — ob where it's needed ──
        { id: "d29.9", ex: "29.9", t: "transform", title: "Ich weiß nicht, …", how: "Start with Ich weiß nicht, … A yes/no question needs ob; a W-word stays.", items: [
          { q: "Ist die Post weit von hier?", a: ["Ich weiß nicht, ob die Post weit von hier ist."], r: ["iq.ob"] },
          { q: "Wer wohnt in der Wohnung über uns?", a: ["Ich weiß nicht, wer in der Wohnung über uns wohnt."], r: ["iq.w"] },
          { q: "Hat Tom den Schlüssel gefunden?", a: ["Ich weiß nicht, ob Tom den Schlüssel gefunden hat."], r: ["iq.ob", "iq.two"] },
          { q: "Kommt der Bus pünktlich?", a: ["Ich weiß nicht, ob der Bus pünktlich kommt."], r: ["iq.ob"] },
          { q: "Wie viel verdient ein Koch?", a: ["Ich weiß nicht, wie viel ein Koch verdient."], r: ["iq.w"] },
          { q: "Können wir hier mit Karte bezahlen?", a: ["Ich weiß nicht, ob wir hier mit Karte bezahlen können."], r: ["iq.ob", "iq.two"] },
          { q: "Warum ist der Laden heute zu?", a: ["Ich weiß nicht, warum der Laden heute zu ist."], r: ["iq.w"] },
          { q: "Spricht die neue Kollegin Französisch?", a: ["Ich weiß nicht, ob die neue Kollegin Französisch spricht."], r: ["iq.ob"] },
          { q: "Wem hat sie das Geld gegeben?", a: ["Ich weiß nicht, wem sie das Geld gegeben hat."], r: ["iq.w", "iq.two"] },
          { q: "Muss man einen Termin machen?", a: ["Ich weiß nicht, ob man einen Termin machen muss."], r: ["iq.ob", "iq.two"] },
          { q: "Regnet es morgen?", a: ["Ich weiß nicht, ob es morgen regnet."], r: ["iq.ob"] },
          { q: "Wohin fahren die Nachbarn in den Ferien?", a: ["Ich weiß nicht, wohin die Nachbarn in den Ferien fahren."], r: ["iq.w"] },
          { q: "Ist das Museum am Montag geöffnet?", a: ["Ich weiß nicht, ob das Museum am Montag geöffnet ist."], r: ["iq.ob"] },
          { q: "Gibt es hier ein Schwimmbad?", a: ["Ich weiß nicht, ob es hier ein Schwimmbad gibt."], r: ["iq.ob"] },
        ] },
        // ── Übung 26•11: someone's many questions, passed on ──
        { id: "d26.11", ex: "26.11", t: "transform", title: "Er fragt mich, …", how: "A new colleague asks you a lot. Pass each question on: Er fragt mich, … (du → ich, mir → ihm).", items: [
          { q: "Woher kommst du?", a: ["Er fragt mich, woher ich komme."], r: ["iq.w"] },
          { q: "Wie lange wohnst du schon hier?", a: ["Er fragt mich, wie lange ich schon hier wohne."], r: ["iq.w"] },
          { q: "Bist du verheiratet?", a: ["Er fragt mich, ob ich verheiratet bin."], r: ["iq.ob"] },
          { q: "Hast du Kinder?", a: ["Er fragt mich, ob ich Kinder habe."], r: ["iq.ob"] },
          { q: "Wo hast du Deutsch gelernt?", a: ["Er fragt mich, wo ich Deutsch gelernt habe."], r: ["iq.two"] },
          { q: "Was machst du am Wochenende?", a: ["Er fragt mich, was ich am Wochenende mache."], r: ["iq.w"] },
          { q: "Kannst du Auto fahren?", a: ["Er fragt mich, ob ich Auto fahren kann."], r: ["iq.ob", "iq.two"] },
          { q: "Mit wem wohnst du zusammen?", a: ["Er fragt mich, mit wem ich zusammenwohne.", "Er fragt mich, mit wem ich zusammen wohne."], r: ["iq.prep"] },
          { q: "Gefällt dir die Arbeit?", a: ["Er fragt mich, ob mir die Arbeit gefällt.", "Er fragt mich, ob die Arbeit mir gefällt."], r: ["iq.ob"] },
          { q: "Warum bist du in die Schweiz gekommen?", a: ["Er fragt mich, warum ich in die Schweiz gekommen bin."], r: ["iq.two"] },
          { q: "Trinkst du nach der Arbeit einen Kaffee mit mir?", a: ["Er fragt mich, ob ich nach der Arbeit einen Kaffee mit ihm trinke.", "Er fragt mich, ob ich nach der Arbeit mit ihm einen Kaffee trinke."], r: ["iq.ob"] },
        ] },
        // ── our own: dass or ob ──
        { id: "diq.dassob", t: "pick", title: "dass or ob?", how: "dass: it's a fact. ob: it's still open, yes or no.", o: ["dass", "ob"], items: [
          { q: "Ich weiß, ___ der Zug um acht fährt.", a: ["dass"], r: ["iq.dassob"] },
          { q: "Ich weiß nicht, ___ der Zug heute fährt.", a: ["ob"], r: ["iq.dassob"] },
          { q: "Er fragt, ___ wir Hilfe brauchen.", a: ["ob"], r: ["iq.dassob"] },
          { q: "Sie sagt, ___ sie morgen keine Zeit hat.", a: ["dass"], r: ["iq.dassob"] },
          { q: "Ich bin sicher, ___ du die Prüfung bestehst.", a: ["dass"], r: ["iq.dassob"] },
          { q: "Ich bin nicht sicher, ___ ich die Tür abgeschlossen habe.", a: ["ob"], r: ["iq.dassob"] },
          { q: "Können Sie mir sagen, ___ hier noch frei ist?", a: ["ob"], r: ["iq.dassob"] },
          { q: "Es ist schön, ___ ihr gekommen seid.", a: ["dass"], r: ["iq.dassob"] },
          { q: "Wir wissen noch nicht, ___ wir im Sommer wegfahren.", a: ["ob"], r: ["iq.dassob"] },
          { q: "Ich hoffe, ___ es dir bald besser geht.", a: ["dass"], r: ["iq.dassob"] },
          { q: "Schau bitte nach, ___ das Fenster zu ist.", a: ["ob"], r: ["iq.dassob"] },
          { q: "Tut mir leid, ___ ich zu spät bin.", a: ["dass"], r: ["iq.dassob"] },
        ] },
        // ── our own: ob or wenn ──
        { id: "diq.wenn", t: "pick", title: "ob or wenn?", how: "Both mean *if*. ob: whether (or not). wenn: on that condition.", o: ["ob", "wenn"], items: [
          { q: "Ich weiß nicht, ___ ich morgen kommen kann.", a: ["ob"], r: ["iq.wenn"] },
          { q: "Ich komme morgen, ___ ich nicht arbeiten muss.", a: ["wenn"], r: ["iq.wenn"] },
          { q: "Frag den Verkäufer, ___ es die Jacke auch in Blau gibt.", a: ["ob"], r: ["iq.wenn"] },
          { q: "Ich kaufe die Jacke, ___ es sie in Blau gibt.", a: ["wenn"], r: ["iq.wenn"] },
          { q: "Kannst du schauen, ___ noch Milch im Kühlschrank ist?", a: ["ob"], r: ["iq.wenn"] },
          { q: "Kauf bitte Milch, ___ keine mehr im Kühlschrank ist.", a: ["wenn"], r: ["iq.wenn"] },
          { q: "Sie möchte wissen, ___ der Platz noch frei ist.", a: ["ob"], r: ["iq.wenn"] },
          { q: "Setzen Sie sich, ___ der Platz frei ist!", a: ["wenn"], r: ["iq.wenn"] },
          { q: "Es ist mir egal, ___ es regnet oder nicht.", a: ["ob"], r: ["iq.wenn"] },
          { q: "Wir bleiben zu Hause, ___ es regnet.", a: ["wenn"], r: ["iq.wenn"] },
          { q: "Der Arzt fragt, ___ ich Schmerzen habe.", a: ["ob"], r: ["iq.wenn"] },
          { q: "Nehmen Sie eine Tablette, ___ Sie Schmerzen haben.", a: ["wenn"], r: ["iq.wenn"] },
        ] },
        // ── Übung 26•12: what you were told to do ──
        { id: "d26.12", ex: "26.12", t: "transform", title: "Der Arzt sagt, ich soll …", how: "Tell a friend what the doctor said: Der Arzt sagt, ich soll …, with the infinitive at the end.", items: [
          { q: "«Trinken Sie viel Wasser!»", a: ["Der Arzt sagt, ich soll viel Wasser trinken.", "Der Arzt sagt, ich solle viel Wasser trinken."], r: ["iq.soll"] },
          { q: "«Bleiben Sie drei Tage im Bett!»", a: ["Der Arzt sagt, ich soll drei Tage im Bett bleiben.", "Der Arzt sagt, ich solle drei Tage im Bett bleiben."], r: ["iq.soll"] },
          { q: "«Rauchen Sie nicht!»", a: ["Der Arzt sagt, ich soll nicht rauchen.", "Der Arzt sagt, ich solle nicht rauchen."], r: ["iq.soll"] },
          { q: "«Nehmen Sie die Tabletten nach dem Essen!»", a: ["Der Arzt sagt, ich soll die Tabletten nach dem Essen nehmen.", "Der Arzt sagt, ich solle die Tabletten nach dem Essen nehmen."], r: ["iq.soll"] },
          { q: "«Gehen Sie jeden Tag spazieren!»", a: ["Der Arzt sagt, ich soll jeden Tag spazieren gehen.", "Der Arzt sagt, ich solle jeden Tag spazieren gehen."], r: ["iq.soll"] },
          { q: "«Essen Sie weniger Zucker!»", a: ["Der Arzt sagt, ich soll weniger Zucker essen.", "Der Arzt sagt, ich solle weniger Zucker essen."], r: ["iq.soll"] },
          { q: "«Kommen Sie in zwei Wochen wieder!»", a: ["Der Arzt sagt, ich soll in zwei Wochen wiederkommen.", "Der Arzt sagt, ich solle in zwei Wochen wiederkommen.", "Der Arzt sagt, ich soll in zwei Wochen wieder kommen."], r: ["iq.soll"] },
          { q: "«Schlafen Sie mehr!»", a: ["Der Arzt sagt, ich soll mehr schlafen.", "Der Arzt sagt, ich solle mehr schlafen."], r: ["iq.soll"] },
          { q: "«Rufen Sie an, wenn es nicht besser wird!»", a: ["Der Arzt sagt, ich soll anrufen, wenn es nicht besser wird.", "Der Arzt sagt, ich solle anrufen, wenn es nicht besser wird."], r: ["iq.soll"] },
          { q: "«Arbeiten Sie diese Woche nicht!»", a: ["Der Arzt sagt, ich soll diese Woche nicht arbeiten.", "Der Arzt sagt, ich solle diese Woche nicht arbeiten."], r: ["iq.soll"] },
          { q: "«Machen Sie einen Termin für die Kontrolle!»", a: ["Der Arzt sagt, ich soll einen Termin für die Kontrolle machen.", "Der Arzt sagt, ich solle einen Termin für die Kontrolle machen."], r: ["iq.soll"] },
        ] },
        // ── Übung 27•5 (27•4): what the doctor asked — as you'd say it ──
        // (the book writes 27•4 in the Konjunktiv; 27•5 asks it "as said in the spoken
        // language": the indicative, as here — the Konjunktiv I is the bonus lesson's)
        { id: "d27.5", ex: "27.5", also: ["27.4"], t: "transform", fixed: true, title: "Die Ärztin hat gefragt, …", how: "What did the doctor ask about your child? Die Ärztin hat gefragt, … — ob for yes/no, the verb last.", items: [
          { q: "«Hat das Kind Fieber?»", a: ["Die Ärztin hat gefragt, ob das Kind Fieber hat."], r: ["iq.ob"] },
          { q: "«Seit wann hustet es?»", a: ["Die Ärztin hat gefragt, seit wann es hustet."], r: ["iq.w"] },
          { q: "«Nimmt es Medikamente?»", a: ["Die Ärztin hat gefragt, ob es Medikamente nimmt."], r: ["iq.ob"] },
          { q: "«Wie viel wiegt das Kind?»", a: ["Die Ärztin hat gefragt, wie viel das Kind wiegt."], r: ["iq.w"] },
          { q: "«Hat es gut geschlafen?»", a: ["Die Ärztin hat gefragt, ob es gut geschlafen hat."], r: ["iq.two"] },
          { q: "«Wann hat es zuletzt gegessen?»", a: ["Die Ärztin hat gefragt, wann es zuletzt gegessen hat."], r: ["iq.two"] },
          { q: "«Kann das Kind gut schlucken?»", a: ["Die Ärztin hat gefragt, ob das Kind gut schlucken kann."], r: ["iq.two"] },
          { q: "«Wo tut es weh?»", a: ["Die Ärztin hat gefragt, wo es wehtut.", "Die Ärztin hat gefragt, wo es weh tut."], r: ["iq.w"] },
          { q: "«Mit wem hat es gespielt?»", a: ["Die Ärztin hat gefragt, mit wem es gespielt hat."], r: ["iq.prep"] },
          { q: "«Warum ist es so müde?»", a: ["Die Ärztin hat gefragt, warum es so müde ist."], r: ["iq.w"] },
        ].map(it => ({ ...it, diag: [{ t: "order", rule: "iq.w", msg: "A question inside a sentence has its verb at the very end: …, ob das Kind Fieber **hat**." }] })) },
        // ── Production ──
        { id: "dp.iq", t: "translate", end: true, title: "Say it in German", how: "Translate. A question inside a sentence has its verb last; a yes/no question takes ob.", items: [
          { q: "I don't know where he lives.", a: ["Ich weiß nicht, wo er wohnt."], r: ["iq.w"] },
          { q: "Do you know when the train arrives? (du)", a: ["Weißt du, wann der Zug ankommt?", "Weißt du, wann der Zug kommt?"], r: ["iq.two"] },
          { q: "Can you tell me where the station is? (Sie)", a: ["Können Sie mir sagen, wo der Bahnhof ist?"], r: ["iq.polite"] },
          { q: "I don't know if she's coming.", a: ["Ich weiß nicht, ob sie kommt."], r: ["iq.ob"] },
          { q: "He's asking whether we have time.", a: ["Er fragt, ob wir Zeit haben."], r: ["iq.ob"] },
          { q: "I know that the shop is closed.", a: ["Ich weiß, dass der Laden zu ist.", "Ich weiß, dass der Laden geschlossen ist.", "Ich weiß, dass das Geschäft zu ist.", "Ich weiß, dass das Geschäft geschlossen ist."], r: ["iq.dassob"] },
          { q: "I'm not sure if the shop is open.", a: ["Ich bin nicht sicher, ob der Laden offen ist.", "Ich bin nicht sicher, ob der Laden geöffnet ist.", "Ich bin nicht sicher, ob das Geschäft offen ist.", "Ich bin mir nicht sicher, ob der Laden offen ist.", "Ich bin nicht sicher, ob das Geschäft geöffnet ist."], r: ["iq.dassob"] },
          { q: "Do you know who she's talking to? (du)", a: ["Weißt du, mit wem sie spricht?", "Weißt du, mit wem sie redet?"], r: ["iq.prep"] },
          { q: "I'd like to know how much that costs.", a: ["Ich möchte wissen, wie viel das kostet.", "Ich möchte wissen, was das kostet.", "Ich möchte gern wissen, wie viel das kostet.", "Ich würde gern wissen, wie viel das kostet."], r: ["iq.polite"] },
          { q: "I'll come if I have time.", a: ["Ich komme, wenn ich Zeit habe.", "Wenn ich Zeit habe, komme ich."], r: ["iq.wenn"] },
          { q: "Ask him if he has time. (du)", a: ["Frag ihn, ob er Zeit hat.", "Frag ihn, ob er Zeit hat!", "Frage ihn, ob er Zeit hat."], r: ["iq.wenn"] },
          { q: "The doctor says I should sleep more.", a: ["Der Arzt sagt, ich soll mehr schlafen.", "Der Arzt sagt, ich solle mehr schlafen.", "Der Arzt sagt, dass ich mehr schlafen soll.", "Die Ärztin sagt, ich soll mehr schlafen."], r: ["iq.soll"] },
          { q: "I don't know what he said.", a: ["Ich weiß nicht, was er gesagt hat."], r: ["iq.two"] },
          { q: "Do you know if this bus goes to the hospital? (Sie)", a: ["Wissen Sie, ob dieser Bus zum Spital fährt?", "Wissen Sie, ob dieser Bus zum Krankenhaus fährt?", "Wissen Sie, ob dieser Bus ins Spital fährt?", "Wissen Sie, ob dieser Bus ins Krankenhaus fährt?"], r: ["iq.ob", "iq.polite"] },
        ] },
        { id: "diq.write", t: "write", end: true, title: "Ask and wonder", how: "Write your own sentences. They're saved for Claude to correct.", items: [
          { q: "You're new in town. Ask a stranger three things politely. (Können Sie mir sagen, … / Wissen Sie, …)", model: ["Entschuldigung, können Sie mir sagen, wo die Post ist? Wissen Sie, wann sie aufmacht? Und wissen Sie, ob es hier einen Geldautomaten gibt?"], r: ["iq.polite"] },
          { q: "Three things you don't know yet about next year. (Ich weiß noch nicht, ob / wo / wann …)", model: ["Ich weiß noch nicht, ob ich nächstes Jahr eine neue Stelle habe. Ich weiß nicht, wohin wir in die Ferien fahren, und ich weiß auch nicht, wann ich die Prüfung mache."], r: ["iq.ob"] },
          { q: "What did the teacher (or your boss) tell you to do this week? (Sie sagt, ich soll …)", model: ["Meine Lehrerin sagt, ich soll jeden Tag zehn Minuten laut lesen. Sie sagt auch, ich soll mehr mit den Nachbarn sprechen."], r: ["iq.soll"] },
          { q: "A friend visits Switzerland. What does he ask you? (Er fragt, ob / wie / was …)", model: ["Er fragt, ob die Züge wirklich immer pünktlich sind. Er fragt auch, wie viel ein Kaffee kostet und was man am Wochenende machen kann."], r: ["iq.w"] },
          { q: "Two things you are sure about and two you are not. (Ich bin sicher, dass … / Ich bin nicht sicher, ob …)", model: ["Ich bin sicher, dass mein Deutsch besser wird. Ich bin nicht sicher, ob ich im Sommer in die Heimat fahre."], r: ["iq.dassob"] },
          { q: "At the station: ask about a train — when, which platform, and whether you have to change.", model: ["Können Sie mir sagen, wann der nächste Zug nach Basel fährt? Wissen Sie, auf welchem Gleis er fährt und ob ich umsteigen muss?"], r: ["iq.prep"] },
          { q: "You only want to go out on one condition, and you don't know yet whether it holds. (wenn … / ob …)", model: ["Ich komme mit, wenn ich früh Feierabend habe. Aber ich weiß noch nicht, ob mein Chef mich gehen lässt."], r: ["iq.wenn"] },
          { q: "Something you've forgotten: a name, a place, a time. (Ich habe vergessen, wie / wo / wann …)", model: ["Ich habe vergessen, wie die neue Nachbarin heißt und wann wir uns treffen wollten."], r: ["iq.two"] },
        ] },
      ],
    },
  },
});

// What the exercises became. 26•11 and 26•12 are written with the
// Konjunktiv I in the book (sei, solle): their frames are mirrored in the
// indicative — the Konjunktiv I itself is the bonus lesson's (s4.k1).
cxCover({ "23.11": "d23.11", "29.9": "d29.9", "26.11": "d26.11", "26.12": "d26.12", "27.4": "d27.5", "27.5": "d27.5" });
// The rest of chapter 26 waits for its lessons (Sessions 7 and 9 upload the
// chapter again): the Konjunktiv II's forms, wishes and requests, würde →
// s2.k2 · wenn-sentences, wishes with wenn, als ob → s2.cond · the Konjunktiv
// I and reported speech → s4.k1 · the Konjunktiv II of the past → s4.k2p.
cxCover({
  "26.2": { st: "planned", sec: "s2.k2" }, "26.3": { st: "planned", sec: "s2.k2" }, "26.15": { st: "planned", sec: "s2.k2" }, "26.16": { st: "planned", sec: "s2.k2" }, "26.17": { st: "planned", sec: "s2.k2" }, "26.18": { st: "planned", sec: "s2.k2" }, "26.19": { st: "planned", sec: "s2.k2" }, "26.22": { st: "planned", sec: "s2.k2" }, "26.23": { st: "planned", sec: "s2.k2" }, "26.24": { st: "planned", sec: "s2.k2" },
  "26.6": { st: "planned", sec: "s2.cond" }, "26.7": { st: "planned", sec: "s2.cond" }, "26.8": { st: "planned", sec: "s2.cond" }, "26.25": { st: "planned", sec: "s2.cond" }, "26.26": { st: "planned", sec: "s2.cond" }, "26.27": { st: "planned", sec: "s2.cond" }, "26.29": { st: "planned", sec: "s2.cond" }, "26.30": { st: "planned", sec: "s2.cond" },
  "26.1": { st: "planned", sec: "s4.k1" }, "26.4": { st: "planned", sec: "s4.k1" }, "26.5": { st: "planned", sec: "s4.k1" }, "26.9": { st: "planned", sec: "s4.k1" }, "26.10": { st: "planned", sec: "s4.k1" }, "26.13": { st: "planned", sec: "s4.k1" }, "26.14": { st: "planned", sec: "s4.k1" },
  "26.20": { st: "planned", sec: "s4.k2p" }, "26.21": { st: "planned", sec: "s4.k2p" }, "26.28": { st: "planned", sec: "s4.k2p" },
});
cxJournal([
  { id: "w.askway", th: "swiss", lv: "B1", de: "Fragen an die Gemeinde", t: "You write to your town's office with questions about a course, a permit or a service: ask politely what you want to know, and say what you aren't sure about.", help: ["Können Sie mir sagen, …", "Ich möchte wissen, ob …", "Ich bin nicht sicher, ob …", "Wissen Sie, wann …"], sec: "s2.indq" },
]);
