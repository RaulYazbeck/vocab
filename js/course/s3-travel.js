// ── COURSE PACK · Stage 3 · 💬 Travel ──
// Book: chapter 31 "Travel", the conversation "Die Ferienreise" (Übung
// 31•13: answers about it; 31•14 under the next heading — comparatives —
// is the adjective endings', s1-adj.js). Our own dialogues: a couple
// planning their holidays, the hotel desk. It comes right after the
// Konjunktiv II (verb track) and the joining words, so ich würde gern,
// hätte gern, könnte, wäre, als and the strong Präteritum are taught — and
// nothing later: no if-sentences of the unreal (s2.cond, next), no relative
// clauses, no indirect questions (Könnten Sie mir sagen, wo …? waits for
// s2.indq), no genitive (the book's jenseits des Mittelmeers).
cxPack({
  id: "s3-travel",
  sections: {
    "s3.travel": {
      testout: { n: 7, miss: 1 },
      rules: {
        "travel.wish": "Wishes: Ich würde gern … fahren · Ich möchte lieber …",
        "travel.idea": "Ideas: Wie wäre es mit …? · Wir könnten …",
        "travel.where": "Where to: nach Rom, in die Türkei, ans Meer — and where: am Meer",
        "travel.compare": "Reasons: billiger als, am schönsten, lieber",
        "travel.book": "Booking: Ich hätte gern ein Billett / ein Zimmer …",
        "travel.polite": "Polite requests and problems: Könnten Sie …? Der Zug ist ausgefallen.",
        "travel.tell": "Telling the trip: Perfekt, war and hatte, als",
      },
      sheets: [
        { id: "cx.travel1", title: "Planning a trip: wishes and ideas", qn: 3,
          struct: [["Ich würde gern", "aux"], ["ans Meer", "mid"], ["fahren", "verb"]],
          why: "Planning together means wishing, suggesting and comparing, politely. The Konjunktiv II does it: ich würde gern …, Wie wäre es mit …?, Wir könnten … And the place you go to needs nach, in or an.",
          rid: ["travel.wish", "travel.idea", "travel.where", "travel.compare"],
          rules: [
            "Say what you'd like with **Ich würde gern** + the infinitive at the end: Ich würde gern nach Rom **fahren**. Or use **Ich möchte** … and, for *I'd rather*, **Ich möchte lieber** …: Ich möchte lieber in die Berge.",
            "Suggest something with **Wie wäre es mit** + the dative (Wie wäre es mit dem Tessin?), **Wir könnten** … fahren, or **Sollen wir** …? Answer **Gute Idee!**, **Ich weiß nicht** or **Lieber nicht.**",
            "Going: **nach** Rom, **nach** Italien (no article), but **in die** Türkei, **ins** Tessin, **in die** Berge and **ans** Meer. Being there: **in** Italien, **in der** Türkei, **im** Tessin, **am** Meer.",
            "Give reasons by comparing: Rom ist **teurer als** Lissabon · Der Zug ist **bequemer** · **Am schönsten** ist es im Herbst. For *rather*, use **lieber**: Ich fahre **lieber** mit dem Zug.",
          ],
          lines: [
            ["Lara", "Wohin fahren wir dieses Jahr in die Ferien?", "Where shall we go on holiday this year?"],
            ["Ben", "Ich würde gern wieder in die Berge fahren, ins Engadin.", "I'd like to go to the mountains again, to the Engadine."],
            ["Lara", "Schon wieder? Ich würde lieber in eine Stadt fahren.", "Again? I'd rather go to a city."],
            ["Ben", "Wie wäre es mit Lissabon? Da ist es im Mai schon warm.", "How about Lisbon? It's already warm there in May."],
            ["Lara", "Gute Idee! Aber der Flug ist teurer als der Zug nach Wien.", "Good idea! But the flight is more expensive than the train to Vienna."],
            ["Ben", "Wir könnten auch mit dem Nachtzug nach Wien fahren. Das wäre bequemer.", "We could also take the night train to Vienna. That would be more comfortable."],
            ["Lara", "Stimmt, und wir müssten kein Hotel für die erste Nacht zahlen.", "True, and we wouldn't have to pay for a hotel the first night."],
            ["Ben", "Und das Meer? Ich möchte unbedingt einmal ans Meer.", "And the sea? I really want to go to the sea for once."],
            ["Lara", "Dann fahren wir nach Wien und danach nach Kroatien, an die Küste.", "Then we'll go to Vienna and after that to Croatia, to the coast."],
            ["Ben", "Perfekt. Ich schaue heute Abend die Preise an.", "Perfect. I'll look at the prices this evening."],
          ],
          ex: [
            ["Ich **würde** gern einmal nach Island **fahren**.", "I'd like to go to Iceland one day."],
            ["**Wie wäre es mit** einem Wochenende im Tessin?", "How about a weekend in Ticino?"],
            ["Wir fahren **in die** Türkei. Unsere Freunde wohnen **in der** Türkei.", "We're going to Turkey. Our friends live in Turkey."],
            ["Ich fahre **lieber** mit dem Zug, das ist **bequemer als** das Auto.", "I prefer going by train, it's more comfortable than the car."],
          ],
          trap: "A country with an article (die Schweiz, die Türkei, die USA) takes **in**, not nach: Wir fahren **in die** Schweiz, not ~~nach die Schweiz~~. And *to the seaside* is **ans Meer**, not ~~nach dem Meer~~.",
          quiz: [
            { at: "r1", k: "pick", q: "Ich würde gern nach Paris ___.", o: ["fahren", "fahre", "gefahren"], a: 0, why: "After würde, the infinitive goes to the end: würde … **fahren**." },
            { at: "r1", k: "pick", q: "I'd rather go to the mountains: Ich ___ lieber in die Berge.", o: ["möchte", "möchtest", "möchten"], a: 0, why: "ich **möchte** lieber …" },
            { at: "r2", k: "pick", q: "How about Ticino? — ___ es mit dem Tessin?", o: ["Wie wäre", "Wie ist", "Was wäre"], a: 0, why: "*How about …?* is **Wie wäre es mit …?**" },
            { at: "r2", k: "pick", q: "A suggestion: we could camp. — Wir ___ auch zelten.", o: ["könnten", "hätten", "wären"], a: 0, why: "*We could* is **wir könnten**." },
            { at: "r3", k: "pick", q: "Wir fahren ___ Türkei.", o: ["in die", "nach", "nach der"], a: 0, why: "A country with an article: **in die** Türkei." },
            { at: "r3", k: "pick", q: "Im Sommer fahren wir ___ Meer.", o: ["ans", "am", "nach"], a: 0, why: "To the sea: **ans** Meer (an + das)." },
            { at: "r4", k: "pick", q: "Der Zug ist bequemer ___ das Auto.", o: ["als", "wie", "dann"], a: 0, why: "After a comparative, *than* is **als**." },
            { at: "lines", k: "pick", q: "In the dialogue, where does Ben want to go first?", o: ["In die Berge, ins Engadin.", "Nach Lissabon.", "Nach Wien."], a: 0, why: "Ben: Ich würde gern wieder **in die Berge** fahren, **ins Engadin**." },
            { at: "trap", k: "pick", q: "*We're going to Switzerland:*", o: ["Wir fahren in die Schweiz.", "Wir fahren nach die Schweiz.", "Wir fahren nach Schweiz."], a: 0, why: "die Schweiz has an article: **in die** Schweiz." },
          ] },
        { id: "cx.travel2", title: "On the way: tickets, the hotel, telling it", qn: 3,
          struct: [["Ich hätte gern", "aux"], ["ein Doppelzimmer", "who"], ["für zwei Nächte", "end"]],
          why: "At the counter and the hotel desk, Ich hätte gern … and Könnten Sie …? make every request polite. Back home you tell the story in the Perfekt, with war and hatte, and als for something that happened then.",
          rid: ["travel.book", "travel.polite", "travel.tell"],
          rules: [
            "Ask for what you want with **Ich hätte gern** + the accusative: Ich hätte gern **ein Billett** nach Lugano, **hin und zurück** (return), zweite Klasse · **ein Doppelzimmer** für zwei Nächte. Ask **Ist das Frühstück inbegriffen?**",
            "Polite questions: **Könnten Sie** mir helfen? · **Würden Sie** bitte ein Foto machen? · **Wäre es möglich**, früher einzuchecken? Problems: Der Zug **ist ausgefallen** (cancelled) · Ich **habe** den Anschluss **verpasst**.",
            "Tell the trip in the Perfekt, with **war** and **hatte**: Wir **sind** nach Wien **gefahren**, das Hotel **war** toll, wir **hatten** Glück mit dem Wetter. For *when* at one moment in the past, use **als** + the verb last: **Als** wir ankamen, regnete es.",
          ],
          lines: [
            ["Rezeption", "Guten Abend! Kann ich Ihnen helfen?", "Good evening! Can I help you?"],
            ["Frau Roth", "Guten Abend. Ich habe ein Zimmer reserviert. Mein Name ist Roth.", "Good evening. I've booked a room. My name is Roth."],
            ["Rezeption", "Ja, ein Doppelzimmer für zwei Nächte. Darf ich Ihren Ausweis sehen?", "Yes, a double room for two nights. May I see your ID?"],
            ["Frau Roth", "Hier, bitte. Ist das Frühstück inbegriffen?", "Here you are. Is breakfast included?"],
            ["Rezeption", "Ja, von sieben bis zehn Uhr, im ersten Stock.", "Yes, from seven to ten, on the first floor."],
            ["Frau Roth", "Wunderbar. Und wo kann ich parkieren?", "Wonderful. And where can I park?"],
            ["Rezeption", "In der Garage hinter dem Hotel. Das kostet zwanzig Franken pro Nacht.", "In the garage behind the hotel. It's twenty francs a night."],
            ["Frau Roth", "Gut. Wir hätten gern ein ruhiges Zimmer, wenn möglich.", "Fine. We'd like a quiet room, if possible."],
            ["Rezeption", "Kein Problem, Ihr Zimmer geht auf den Garten.", "No problem, your room looks onto the garden."],
            ["Frau Roth", "Perfekt. Könnten Sie uns morgen um sechs wecken? Unser Zug fährt früh.", "Perfect. Could you wake us at six tomorrow? Our train leaves early."],
            ["Rezeption", "Gern. Ich wünsche Ihnen einen schönen Aufenthalt!", "Of course. I hope you enjoy your stay!"],
          ],
          ex: [
            ["**Ich hätte gern** ein Billett nach Chur, hin und zurück.", "I'd like a return ticket to Chur."],
            ["**Könnten Sie** mir bitte helfen? Mein Koffer ist so schwer.", "Could you help me, please? My suitcase is so heavy."],
            ["Der Zug **ist ausgefallen**, und ich **habe** den Anschluss **verpasst**.", "The train was cancelled, and I missed my connection."],
            ["**Als** wir in Lugano **ankamen**, **war** es schon dunkel.", "When we arrived in Lugano, it was already dark."],
          ],
          trap: "**Ich hätte gern** is the polite *I'd like*, not ~~Ich würde gern haben~~. And *when* for one moment in the past is **als**, not ~~wenn~~: **Als** wir ankamen, …",
          quiz: [
            { at: "r1", k: "pick", q: "At the counter: Ich ___ gern ein Billett nach Bern.", o: ["hätte", "habe", "würde"], a: 0, why: "Polite *I'd like*: **Ich hätte gern** …" },
            { at: "r1", k: "pick", q: "*A return ticket*:", o: ["hin und zurück", "hin und her", "zurück und hin"], a: 0, why: "Return is **hin und zurück**." },
            { at: "r2", k: "pick", q: "Polite: ___ Sie mir bitte helfen?", o: ["Könnten", "Hätten", "Wären"], a: 0, why: "*Could you …?* is **Könnten Sie …?**" },
            { at: "r2", k: "pick", q: "The train was cancelled: Der Zug ist ___.", o: ["ausgefallen", "abgefallen", "umgefallen"], a: 0, why: "Cancelled is **ausgefallen**." },
            { at: "r3", k: "pick", q: "Letzten Sommer ___ wir in Wien.", o: ["waren", "sind", "wären"], a: 0, why: "In the past: **waren**." },
            { at: "r3", k: "pick", q: "___ wir ankamen, war es dunkel.", o: ["Als", "Wenn", "Wann"], a: 0, why: "One moment in the past: **Als**." },
            { at: "lines", k: "pick", q: "In the dialogue, when is breakfast?", o: ["Von sieben bis zehn Uhr.", "Um sechs Uhr.", "Es gibt kein Frühstück."], a: 0, why: "**Von sieben bis zehn Uhr**, im ersten Stock." },
            { at: "trap", k: "pick", q: "Polite: *I'd like a double room.*", o: ["Ich hätte gern ein Doppelzimmer.", "Ich würde gern ein Doppelzimmer haben.", "Ich habe gern ein Doppelzimmer."], a: 0, why: "Not würde … haben: **Ich hätte gern** ein Doppelzimmer." },
          ] },
      ],
      diag: [
        { t: "swap", from: "^nach$", to: "^in$", rule: "travel.where", msg: "A country with an article takes **in** + the accusative: **in die** Türkei, in die USA, in die Schweiz." },
        { t: "swap", from: "^(in|zu)$", to: "^nach$", rule: "travel.where", msg: "A town or a country without article takes **nach**: nach Rom, nach Italien." },
        { t: "swap", from: "^(am|zum|nach|zu)$", to: "^ans$", rule: "travel.where", msg: "To the sea or a lake: **ans** Meer, an den See." },
        { t: "swap", from: "^(ins|ans)$", to: "^(im|am)$", rule: "travel.where", msg: "Being there (wo?) takes the dative: **{right}**." },
        { t: "swap", from: "^(im|am)$", to: "^(ins|ans)$", rule: "travel.where", msg: "Going there (wohin?) takes the accusative: **{right}**." },
        { t: "swap", from: "^(wie|dann|denn)$", to: "^als$", rule: "", msg: "After a comparative, *than* is **als**; for one moment in the past, *when* is **als** too." },
        { t: "swap", from: "^(wenn|wann)$", to: "^als$", rule: "travel.tell", msg: "One moment in the past: **als**." },
        { t: "swap", from: "^(habe|hab|hatte)$", to: "^hatte$", rule: "travel.book", hard: true, msg: "Polite *I'd like*: **Ich hätte gern …**." },
        { t: "extra", tok: "^haben$", rule: "travel.book", msg: "Not würde … haben: say **hätte**: Ich hätte gern …" },
        { t: "swap", from: "^(konnen|kann|konnten)$", to: "^konnten$", rule: "travel.polite", msg: "Polite *could*: **Könnten** Sie …?" },
        { t: "swap", from: "^(werde|wurde|will)$", to: "^wurde$", rule: "travel.wish", msg: "*I'd like to* is **ich würde gern** + the infinitive at the end." },
        { t: "swap", from: "^(mehr|sehr)$", to: "^lieber$", rule: "travel.compare", msg: "*Rather* is **lieber**: Ich fahre lieber mit dem Zug." },
      ],
      drills: [
        // ── our own: the reply ──
        { id: "dtravel.r", t: "respond", title: "What fits?", how: "Pick the reply that fits.", items: [
          { q: "Wohin fahrt ihr in die Ferien?", o: ["In die Türkei.", "In der Türkei.", "Nach die Türkei."], a: ["In die Türkei."], r: ["travel.where"] },
          { q: "Wo wart ihr letzten Sommer?", o: ["Im Tessin.", "Ins Tessin.", "Nach Tessin."], a: ["Im Tessin."], r: ["travel.where"] },
          { q: "Wie wäre es mit einem Wochenende in Paris?", o: ["Gute Idee!", "Gute Reise!", "Gern geschehen!"], a: ["Gute Idee!"], r: ["travel.idea"] },
          { q: "Was würdest du gern einmal sehen?", o: ["Ich würde gern einmal Island sehen.", "Ich würde gern einmal Island gesehen.", "Ich werde einmal Island gesehen."], a: ["Ich würde gern einmal Island sehen."], r: ["travel.wish"] },
          { q: "Warum fährst du lieber mit dem Zug?", o: ["Er ist bequemer als das Auto.", "Er ist bequem wie das Auto.", "Er ist am bequemer."], a: ["Er ist bequemer als das Auto."], r: ["travel.compare"] },
          { q: "Einfach oder hin und zurück?", o: ["Hin und zurück, bitte.", "Mit Karte, bitte.", "Zweite Woche, bitte."], a: ["Hin und zurück, bitte."], r: ["travel.book"] },
          { q: "Für wie viele Nächte?", o: ["Für drei Nächte.", "Seit drei Nächten.", "Vor drei Nächten."], a: ["Für drei Nächte."], r: ["travel.book"] },
          { q: "Könnten Sie mir bitte mit dem Koffer helfen?", o: ["Natürlich, gern!", "Gleichfalls!", "Gute Besserung!"], a: ["Natürlich, gern!"], r: ["travel.polite"] },
          { q: "Wie waren die Ferien?", o: ["Super, das Hotel war sehr schön.", "Super, wir fahren morgen.", "Super, das wäre schön."], a: ["Super, das Hotel war sehr schön."], r: ["travel.tell"] },
        ] },
        // ── our own: the missing word ──
        { id: "dtravel.t", t: "type", title: "Plans and bookings", how: "Write the missing word or words.", items: [
          { q: "Ich ___ gern nach Island fahren. (I'd like to)", a: ["würde"], r: ["travel.wish"] },
          { q: "Wie ___ es mit einem Ausflug nach Luzern?", a: ["wäre"], r: ["travel.idea"] },
          { q: "Wir ___ mit dem Velo fahren. (could)", a: ["könnten"], r: ["travel.idea"] },
          { q: "Wir fahren ___ Italien.", a: ["nach"], r: ["travel.where"] },
          { q: "Sie fahren ___ Türkei.", a: ["in die"], r: ["travel.where"] },
          { q: "Im August fahren wir ___ Meer.", a: ["ans"], r: ["travel.where"] },
          { q: "Ich fahre ___ mit dem Zug als mit dem Auto. (rather)", a: ["lieber"], r: ["travel.compare"] },
          { q: "Der Zug ist schneller ___ der Bus.", a: ["als"], r: ["travel.compare"] },
          { q: "Ich ___ gern ein Einzelzimmer. (polite: I'd like)", a: ["hätte"], r: ["travel.book"] },
          { q: "Ein Billett nach Basel, hin und ___, bitte.", a: ["zurück"], r: ["travel.book"] },
          { q: "___ Sie mir bitte den Weg zeigen? (could)", a: ["Könnten"], r: ["travel.polite"] },
          { q: "Ich habe meinen Anschluss ___. (missed)", a: ["verpasst"], r: ["travel.polite"] },
          { q: "Letztes Jahr ___ wir in Kroatien. (sein)", a: ["waren"], r: ["travel.tell"] },
          { q: "___ wir ankamen, war das Hotel schon zu.", a: ["Als"], r: ["travel.tell"] },
        ] },
        // ── our own: a conversation in order ──
        { id: "dtravel.o", t: "order", title: "On holiday", how: "Put the lines in order.", items: [
          { q: "Planning.", a: ["Wohin fahren wir im Sommer?", "Wie wäre es mit Sardinien?", "Gute Idee! Dort ist das Meer so schön.", "Dann buche ich die Fähre."], r: ["travel.idea"] },
          { q: "Mountains or sea?", a: ["Fährst du lieber ans Meer oder in die Berge?", "Lieber in die Berge.", "Warum?", "Am Meer ist es mir zu heiß."], r: ["travel.compare", "travel.where"] },
          { q: "At the counter.", a: ["Ich hätte gern ein Billett nach Lugano.", "Einfach oder hin und zurück?", "Hin und zurück, bitte.", "Mit Halbtax?", "Ja."], r: ["travel.book"] },
          { q: "The hotel.", a: ["Haben Sie noch ein Zimmer frei?", "Für wie viele Nächte?", "Für zwei Nächte.", "Ja, ein Doppelzimmer ist noch frei."], r: ["travel.book"] },
          { q: "Breakfast.", a: ["Ist das Frühstück inbegriffen?", "Ja, es ist im Preis inbegriffen.", "Und ab wann gibt es Frühstück?", "Ab sieben Uhr."], r: ["travel.book"] },
          { q: "Cancelled.", a: ["Mein Zug ist ausgefallen!", "Wohin müssen Sie denn?", "Nach Genf.", "Nehmen Sie den nächsten, auf Gleis 7."], r: ["travel.polite"] },
          { q: "A photo.", a: ["Entschuldigung, würden Sie ein Foto von uns machen?", "Gern. Lächeln, bitte!", "Vielen Dank!"], r: ["travel.polite"] },
          { q: "Back home.", a: ["Wie waren eure Ferien?", "Super! Wir waren zwei Wochen in Portugal.", "Hattet ihr gutes Wetter?", "Ja, nur einmal hat es geregnet."], r: ["travel.tell"] },
          { q: "The night train.", a: ["Wie seid ihr nach Wien gefahren?", "Mit dem Nachtzug.", "War das bequem?", "Ja, wir haben gut geschlafen."], r: ["travel.tell"] },
        ] },
        // ── Übung 31•13: answers about the trip ──
        { id: "d31.13", ex: "31.13", t: "answer", title: "Lara and Ben's holidays", how: "Answer about the first conversation, or answer the line yourself. A short answer is fine.", items: [
          { q: "«Wohin möchte Ben fahren?»", a: ["In die Berge.", "Ins Engadin.", "In die Berge, ins Engadin.", "Er möchte in die Berge fahren.", "Er möchte ins Engadin fahren.", "Er würde gern in die Berge fahren.", "Er würde gern ins Engadin fahren."], r: ["travel.where"] },
          { q: "«Was würde Lara lieber machen?»", a: ["Sie würde lieber in eine Stadt fahren.", "In eine Stadt fahren.", "Lieber in eine Stadt fahren."], r: ["travel.wish"] },
          { q: "«Warum schlägt Ben Lissabon vor?»", a: ["Weil es dort im Mai schon warm ist.", "Dort ist es im Mai schon warm.", "Da ist es im Mai schon warm.", "Im Mai ist es dort schon warm."], r: ["travel.idea"] },
          { q: "«Was ist teurer, der Flug oder der Zug?»", a: ["Der Flug.", "Der Flug ist teurer.", "Der Flug ist teurer als der Zug."], r: ["travel.compare"] },
          { q: "«Wie könnten sie nach Wien fahren?»", a: ["Mit dem Nachtzug.", "Sie könnten mit dem Nachtzug fahren.", "Mit dem Nachtzug nach Wien."], r: ["travel.idea"] },
          { q: "«Wohin möchte Ben unbedingt einmal?»", a: ["Ans Meer.", "Er möchte unbedingt ans Meer."], r: ["travel.where"] },
          { q: "«Wohin fahren sie nach Wien?»", a: ["Nach Kroatien.", "Nach Kroatien, an die Küste.", "An die Küste, nach Kroatien."], r: ["travel.where"] },
          { q: "«Eine Stadt ist viel interessanter als die Berge!» (agree)", a: ["Da hast du recht.", "Stimmt.", "Ja, das finde ich auch.", "Das finde ich auch.", "Ja, stimmt."], r: ["travel.compare"] },
          { q: "«Was kostet die Garage?»", a: ["Zwanzig Franken pro Nacht.", "Sie kostet zwanzig Franken pro Nacht.", "Zwanzig Franken."], r: ["travel.book"] },
          { q: "«Warum muss Frau Roth um sechs aufstehen?»", a: ["Weil ihr Zug früh fährt.", "Ihr Zug fährt früh.", "Weil ihr Zug früh abfährt."], r: ["travel.polite"] },
        ] },
        // ── Production: build the sentence ──
        { id: "dtravel.c", t: "compose", low: true, end: true, title: "Build the sentence", how: "Build the sentence. Put each word in its form; the brackets say the tense where it isn't the present.", items: [
          { w: ["ich", "würden", "gern", "nach Norwegen", "fahren"], a: ["Ich würde gern nach Norwegen fahren."], r: ["travel.wish"] },
          { w: ["wir", "könnten", "ans Meer", "fahren"], a: ["Wir könnten ans Meer fahren."], r: ["travel.idea"] },
          { w: ["wie wäre es", "mit", "ein Ausflug", "in die Berge"], a: ["Wie wäre es mit einem Ausflug in die Berge?"], r: ["travel.idea"] },
          { w: ["wir", "fahren", "dieses Jahr", "in", "die USA"], a: ["Wir fahren dieses Jahr in die USA.", "Dieses Jahr fahren wir in die USA."], r: ["travel.where"] },
          { w: ["der Zug", "sein", "bequem", "als", "das Flugzeug"], a: ["Der Zug ist bequemer als das Flugzeug."], r: ["travel.compare"] },
          { w: ["ich", "fahren", "lieber", "in", "die Berge"], a: ["Ich fahre lieber in die Berge."], r: ["travel.compare"] },
          { w: ["ich", "hätte gern", "ein Zimmer", "mit", "Balkon"], a: ["Ich hätte gern ein Zimmer mit Balkon."], r: ["travel.book"] },
          { w: ["unser Zug", "ausfallen", "(Perfekt)"], a: ["Unser Zug ist ausgefallen."], r: ["travel.polite"] },
          { w: ["wir", "sein", "zwei Wochen", "in Portugal", "(Präteritum)"], a: ["Wir waren zwei Wochen in Portugal."], r: ["travel.tell"] },
          { w: ["als", "wir", "in Wien", "ankommen", "es", "regnen", "(Präteritum)"], a: ["Als wir in Wien ankamen, regnete es."], r: ["travel.tell"], diag: [{ t: "pos", tok: "^es$", rule: "travel.tell", msg: "After the als part comes the verb, then the subject: es goes {where}." }] },
        ] },
        // ── Production: say it ──
        { id: "dp.travel", t: "translate", end: true, title: "Say it in German", how: "Translate it the way people say it.", items: [
          { q: "I'd like to go to Japan one day.", a: ["Ich würde gern einmal nach Japan fahren.", "Ich würde gern einmal nach Japan reisen.", "Ich würde gern einmal nach Japan fliegen.", "Ich würde gern mal nach Japan fahren.", "Ich würde gern mal nach Japan reisen.", "Ich möchte einmal nach Japan fahren.", "Ich möchte einmal nach Japan reisen.", "Ich möchte gern einmal nach Japan reisen."], r: ["travel.wish"] },
          { q: "How about Ticino?", a: ["Wie wäre es mit dem Tessin?", "Wie wär's mit dem Tessin?"], r: ["travel.idea"] },
          { q: "We're going to Turkey.", a: ["Wir fahren in die Türkei.", "Wir reisen in die Türkei.", "Wir fliegen in die Türkei."], r: ["travel.where"] },
          { q: "In summer I prefer going to the seaside.", a: ["Im Sommer fahre ich lieber ans Meer.", "Ich fahre im Sommer lieber ans Meer."], r: ["travel.compare", "travel.where"] },
          { q: "The train is cheaper than the plane.", a: ["Der Zug ist billiger als das Flugzeug.", "Der Zug ist günstiger als das Flugzeug."], r: ["travel.compare"] },
          { q: "I'd like a return ticket to Zug, please.", a: ["Ich hätte gern ein Billett nach Zug, hin und zurück, bitte.", "Ich hätte gern ein Billett nach Zug und zurück, bitte.", "Ich hätte gern ein Billett hin und zurück nach Zug, bitte."], r: ["travel.book"] },
          { q: "Is breakfast included?", a: ["Ist das Frühstück inbegriffen?", "Ist Frühstück inbegriffen?", "Ist das Frühstück dabei?"], r: ["travel.book"] },
          { q: "Could you help me, please?", a: ["Könnten Sie mir bitte helfen?", "Könnten Sie mir helfen, bitte?", "Würden Sie mir bitte helfen?", "Können Sie mir bitte helfen?"], r: ["travel.polite"] },
          { q: "I missed my connection.", a: ["Ich habe meinen Anschluss verpasst.", "Ich habe den Anschluss verpasst."], r: ["travel.polite"] },
          { q: "Last year we were in Greece.", a: ["Letztes Jahr waren wir in Griechenland.", "Wir waren letztes Jahr in Griechenland."], r: ["travel.tell"] },
          { q: "When we arrived, it was raining.", a: ["Als wir ankamen, regnete es.", "Als wir angekommen sind, hat es geregnet.", "Als wir ankamen, hat es geregnet."], r: ["travel.tell"], diag: [{ t: "pos", tok: "^es$", rule: "travel.tell", msg: "After the als part comes the verb, then the subject: es goes {where}." }] },
        ] },
        // ── Production: your own lines ──
        { id: "dw.travel", t: "write", end: true, title: "Your own lines", how: "Write what you would say. Saved for Claude to correct.", items: [
          { q: "Say where you'd like to go one day, and what you'd do there.", model: ["Ich würde gern einmal nach Kanada fahren. Dort würde ich wandern und Bären sehen."], r: ["travel.wish"] },
          { q: "Suggest a weekend trip to a friend, and say why it's a good idea.", model: ["Wie wäre es mit einem Wochenende in Luzern? Wir könnten mit dem Schiff fahren, das wäre schön."], r: ["travel.idea"] },
          { q: "Three trips: where you went (wohin?) and where you were (wo?).", model: ["Ich bin nach Spanien gefahren, in die Türkei und ans Meer. Ich war in Spanien, in der Türkei und am Meer."], r: ["travel.where"] },
          { q: "Compare two places for a holiday, and choose one.", model: ["Die Berge sind ruhiger als das Meer, aber am Meer ist es wärmer. Ich fahre lieber ans Meer."], r: ["travel.compare"] },
          { q: "Buy a ticket at the counter: where to, return or not, which class.", model: ["Grüezi, ich hätte gern ein Billett nach Interlaken, hin und zurück, zweite Klasse. Ich habe ein Halbtax."], r: ["travel.book"] },
          { q: "Your train was cancelled. Ask politely at the counter what you can do.", model: ["Entschuldigung, mein Zug ist ausgefallen. Welchen Zug könnte ich jetzt nehmen?"], r: ["travel.polite"] },
          { q: "Your last holiday in three sentences.", model: ["Letzten Sommer waren wir zwei Wochen in Portugal. Wir sind mit dem Zug gereist. Das Wetter war super, nur einmal hat es geregnet."], r: ["travel.tell"] },
          { q: "What happened when you arrived somewhere? Use als.", model: ["Als wir in Rom ankamen, war unser Hotel schon voll. Zum Glück hatten sie noch ein Zimmer im Hotel nebenan."], r: ["travel.tell"] },
        ] },
      ],
    },
  },
});

// Chapter 31, "Travel": its one exercise here.
cxCover({ "31.13": "d31.13" });

cxJournal([
  { id: "w.tripplan", th: "travel", lv: "B1", de: "Unsere nächste Reise", t: "Plan a trip with someone in writing: where you'd like to go and why, two ideas you compare, how you would travel, and what you would book.", help: ["Ich würde gern …", "Wie wäre es mit …?", "… ist günstiger als …", "Wir könnten …"], sec: "s3.travel" },
]);
