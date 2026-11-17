// ── COURSE PACK · Stage 3 · 💬 At the bus stop ──
// Book: chapter 31, the conversation "An der Bushaltestelle" (Übung 31•1:
// answers about it). Our own dialogues: a stranger at a Zurich stop, two
// friends at the tram stop talking about who's who. It comes right after
// verb + preposition (warten auf), so weil / dass, the modals, wissen or
// kennen and the reflexives are taught — and nothing later: no relative
// clauses (the book's dialogue opens with one), no strong Präteritum, no
// Konjunktiv II, no adjective endings to work out (der nächste Bus is a
// set phrase), no indirect questions.
cxPack({
  id: "s3-bus",
  sections: {
    "s3.bus": {
      testout: { n: 7, miss: 1 },
      rules: {
        "bus.when": "When it leaves: Wann fährt der Bus ab? — In fünf Minuten.",
        "bus.wait": "Waiting: warten auf + accusative, seit, Verspätung haben",
        "bus.change": "Getting on, off, changing: einsteigen, aussteigen, umsteigen",
        "bus.ticket": "Tickets: ein Billett, eine Tageskarte, das Halbtax",
        "bus.who": "Who's that? Job and nationality without ein",
        "bus.know": "kennen a person, wissen a fact; Woher kennst du sie?",
        "bus.talk": "Small talk: Kalt heute, nicht? — Ja, stimmt.",
      },
      sheets: [
        { id: "cx.bus1", title: "At the stop: when, where, how long", qn: 3,
          struct: [["Ich warte", "who"], ["seit zehn Minuten", "mid"], ["auf den Bus", "end"]],
          why: "At a stop you ask three things: when it comes, where it goes, and where to change. The key verbs are separable (abfahren, umsteigen, aussteigen), and waiting is always warten auf.",
          rid: ["bus.when", "bus.wait", "bus.change", "bus.ticket"],
          rules: [
            "Ask **Wann fährt der Bus nach …?** or **Wann kommt der nächste?** The answer comes with **um** 8.15 (acht Uhr fünfzehn), **in** fünf Minuten, or **alle** zehn Minuten (every ten minutes). **abfahren** splits: Der Bus **fährt** um acht **ab**.",
            "Waiting is **warten auf** + the accusative: Ich warte **auf den** Bus. Still waiting: **seit** + the present — Wir warten **seit** zehn Minuten (*have been waiting*). Late: Der Bus **hat** fünf Minuten **Verspätung**.",
            "Getting on, off and changing: **einsteigen**, **aussteigen**, **umsteigen**. The prefix goes to the end: Wir **steigen** am Bahnhof **um**. After a modal the verb stays whole at the end: Wo **muss** ich **aussteigen**?",
            "Tickets: **ein Billett** (Swiss for eine Fahrkarte — you **lösen** or buy it), **eine Tageskarte**, **ein Abo** (a pass), **das Halbtax** (the half-fare card). You buy it **am Automaten** or **in der App**.",
          ],
          lines: [
            ["Frau Meier", "Entschuldigung, fährt dieser Bus zum Bahnhof?", "Excuse me, does this bus go to the station?"],
            ["Herr Okafor", "Nein, der fährt nur bis zum Spital. Zum Bahnhof fährt die Nummer 7.", "No, this one only goes as far as the hospital. Number 7 goes to the station."],
            ["Frau Meier", "Und wann kommt die Nummer 7?", "And when does number 7 come?"],
            ["Herr Okafor", "Normalerweise alle zehn Minuten. Aber ich warte schon seit einer Viertelstunde.", "Usually every ten minutes. But I've been waiting for a quarter of an hour already."],
            ["Frau Meier", "Oh nein! Hat sie Verspätung?", "Oh no! Is it late?"],
            ["Herr Okafor", "Ja, in der App steht: zwölf Minuten Verspätung.", "Yes, the app says: twelve minutes late."],
            ["Frau Meier", "Dann komme ich zu spät zum Zug!", "Then I'll be late for my train!"],
            ["Herr Okafor", "Wohin fahren Sie denn?", "Where are you going, then?"],
            ["Frau Meier", "Nach Basel. Mein Zug fährt um neun Uhr zweiunddreißig ab.", "To Basel. My train leaves at nine thirty-two."],
            ["Herr Okafor", "Da kommt sie ja! Haben Sie schon ein Billett?", "Here it comes! Do you have a ticket already?"],
            ["Frau Meier", "Ja, in der App. Vielen Dank und schönen Tag!", "Yes, in the app. Thanks a lot, and have a nice day!"],
          ],
          ex: [
            ["Wann **fährt** der Bus nach Wil **ab**? — **In** fünf Minuten.", "When does the bus to Wil leave? — In five minutes."],
            ["Ich warte **seit** zehn Minuten **auf den** Bus.", "I've been waiting for the bus for ten minutes."],
            ["Wo **muss** ich **umsteigen**? — **Am** Bahnhof Oerlikon.", "Where do I have to change? — At Oerlikon station."],
            ["Ich möchte eine **Tageskarte**, bitte. — Mit Halbtax?", "I'd like a day ticket, please. — With a half-fare card?"],
          ],
          trap: "**warten auf** + the accusative: *for* is never **für** here. Ich warte **auf** meine Freundin, not ~~für~~. And *for ten minutes* (still waiting) is **seit** zehn Minuten, not ~~für~~ zehn Minuten.",
          quiz: [
            { at: "r1", k: "pick", q: "The train leaves at eight: Der Zug fährt um acht ___.", o: ["ab", "an", "aus"], a: 0, why: "To leave is **abfahren**: Der Zug fährt um acht **ab**." },
            { at: "r1", k: "pick", q: "Every ten minutes: Das Tram kommt ___ zehn Minuten.", o: ["alle", "jede", "seit"], a: 0, why: "*Every ten minutes* is **alle** zehn Minuten." },
            { at: "r2", k: "pick", q: "Ich warte ___ den Bus.", o: ["auf", "für", "nach"], a: 0, why: "Waiting is **warten auf**." },
            { at: "r2", k: "pick", q: "We've been waiting for twenty minutes: Wir warten ___ zwanzig Minuten.", o: ["seit", "für", "vor"], a: 0, why: "Still waiting: **seit** + the present." },
            { at: "r3", k: "pick", q: "Wo muss ich ___?", o: ["umsteigen", "steigen um", "umsteige"], a: 0, why: "After a modal the separable verb stays whole at the end: muss ich **umsteigen**." },
            { at: "r4", k: "pick", q: "Where do I buy a ticket? — ___ Automaten dort.", o: ["Am", "Im", "Zum"], a: 0, why: "You buy it **am** Automaten." },
            { at: "lines", k: "pick", q: "In the dialogue, which bus goes to the station?", o: ["Die Nummer 7.", "Der Bus zum Spital.", "Die Nummer 12."], a: 0, why: "Herr Okafor says: Zum Bahnhof fährt **die Nummer 7**." },
            { at: "trap", k: "pick", q: "Ich warte ___ meinen Bruder.", o: ["auf", "für", "an"], a: 0, why: "Waiting for someone: **warten auf**." },
          ] },
        { id: "cx.bus2", title: "Who's that? Talking about people", qn: 3,
          struct: [["Das ist", "verb"], ["Sofia", "who"], ["Sie ist Pflegefachfrau", "end"]],
          why: "Small talk at the stop is often about other people: who they are, where they're from, what they do. Jobs and nationalities come without ein, and kennen or wissen says whether you know a person or a fact.",
          rid: ["bus.who", "bus.know", "bus.talk"],
          rules: [
            "Say who someone is with **Das ist** + the name. A job or a nationality takes **sein** and no article: Er ist **Student**. Sie ist **Österreicherin** (a woman's word often adds **-in**). Studies: Er **studiert** Medizin.",
            "Use **kennen** for a person or a place (Kennst du die Frau dort?) and **wissen** for a fact (Ich **weiß** es nicht · Weißt du, **dass** sie Lehrerin ist?). Ask **Woher kennst du sie?** — Aus dem Deutschkurs.",
            "Keep a short chat going: talk about the weather (**Kalt heute, nicht?**) or ask **Fahren Sie auch nach …?** Agree with **Ja, stimmt.** or **Ich auch.**, and leave with **Da kommt mein Bus. Schönen Tag noch!**",
          ],
          lines: [
            ["Nina", "Schau mal, wer ist der Mann dort beim Kiosk?", "Look, who's the man over there by the kiosk?"],
            ["Luca", "Das ist Tom. Er kommt aus Irland und macht ein Praktikum bei uns.", "That's Tom. He's from Ireland and is doing an internship with us."],
            ["Nina", "Ah, und woher kennst du ihn?", "Ah, and how do you know him?"],
            ["Luca", "Aus dem Büro. Er spricht schon gut Deutsch, aber mit Akzent.", "From the office. He already speaks good German, but with an accent."],
            ["Nina", "Und die Frau neben ihm? Ist das seine Freundin?", "And the woman next to him? Is that his girlfriend?"],
            ["Luca", "Ja, das ist Sofia. Sie ist Griechin und arbeitet als Pflegefachfrau im Spital.", "Yes, that's Sofia. She's Greek and works as a nurse at the hospital."],
            ["Nina", "Weißt du, dass meine Schwester auch im Spital arbeitet?", "Did you know that my sister works at the hospital too?"],
            ["Luca", "Echt? Dann kennen sie sich vielleicht!", "Really? Then maybe they know each other!"],
            ["Nina", "Kalt heute, nicht? Wo bleibt nur das Tram?", "Cold today, isn't it? Where's the tram got to?"],
            ["Luca", "Es kommt in zwei Minuten. Ja, wir warten schon lange.", "It's coming in two minutes. Yes, we've been waiting a long time."],
          ],
          ex: [
            ["Er ist **Student** und kommt **aus** Irland.", "He's a student and comes from Ireland."],
            ["**Kennst** du die Frau dort? — Ja, aber nur vom Sehen.", "Do you know the woman over there? — Yes, but only by sight."],
            ["Woher kennst du ihn? — **Aus dem** Deutschkurs.", "How do you know him? — From the German course."],
            ["Kalt heute, **nicht**? — Ja, **stimmt**.", "Cold today, isn't it? — Yes, it is."],
          ],
          trap: "No **ein** with a job or a nationality: Er ist **Student**, sie ist **Griechin** (not ~~ein Student~~). And a fact is always **wissen**: Ich **weiß**, dass er Ire ist (not ~~Ich kenne, dass …~~).",
          quiz: [
            { at: "r1", k: "pick", q: "Anna is from Austria: Sie ist ___.", o: ["Österreicherin", "Österreicher", "Österreich"], a: 0, why: "A woman from Austria is **Österreicherin** — no ein." },
            { at: "r1", k: "pick", q: "Er kommt ___ Irland.", o: ["aus", "von", "nach"], a: 0, why: "Where someone is from takes **aus**." },
            { at: "r2", k: "pick", q: "___ du die Frau dort?", o: ["Kennst", "Weißt", "Kannst"], a: 0, why: "A person: **kennen**." },
            { at: "r2", k: "pick", q: "«Wo wohnt Tom?» — «Das ___ ich nicht.»", o: ["weiß", "kenne", "kann"], a: 0, why: "A fact: **wissen** — das weiß ich nicht." },
            { at: "r3", k: "pick", q: "Kalt heute, ___?", o: ["nicht", "nein", "kein"], a: 0, why: "*…, isn't it?* is **…, nicht?** (or oder?)." },
            { at: "lines", k: "pick", q: "In the dialogue, where does Sofia work?", o: ["Im Spital.", "Im Büro.", "Beim Kiosk."], a: 0, why: "Luca says she works as a nurse **im Spital**." },
            { at: "trap", k: "pick", q: "Tom is a student: Tom ist ___.", o: ["Student", "einen Studenten", "Studentin"], a: 0, why: "No article with a job or studies: Tom ist **Student**." },
          ] },
      ],
      diag: [
        { t: "swap", from: "^(fur|nach|an)$", to: "^auf$", rule: "bus.wait", msg: "Waiting for someone or something is **warten auf**." },
        { t: "swap", from: "^(fur|vor|ab)$", to: "^seit$", rule: "bus.wait", msg: "Still waiting after ten minutes: **seit** + the present." },
        { t: "swap", from: "^(an|um|aus)$", to: "^ab$", rule: "bus.when", msg: "To leave is **abfahren**: … fährt um acht **ab**." },
        { t: "swap", from: "^(jede|jeden|jedes)$", to: "^alle$", rule: "bus.when", msg: "*Every ten minutes* is **alle** zehn Minuten." },
        { t: "extra", tok: "^(ein|eine)$", rule: "bus.who", msg: "No **ein** with a job or a nationality: Sie ist **Lehrerin**." },
        { t: "swap", from: "^(kenne|kennst|kennt|kennen)$", to: "^(weiss|weisst|wissen|wisst)$", rule: "bus.know", hard: true, msg: "A fact is **wissen**: **{right}**. kennen is for people and places." },
        { t: "swap", from: "^(weiss|weisst|wissen|wisst)$", to: "^(kenne|kennst|kennt|kennen)$", rule: "bus.know", hard: true, msg: "A person or a place is **kennen**: **{right}**." },
        { t: "swap", from: "^(nein|kein)$", to: "^nicht$", rule: "bus.talk", msg: "*…, isn't it?* is **…, nicht?**" },
        { t: "swap", from: "^(abfahrt|abfahre|umsteigt|umsteige|aussteigt|aussteige|einsteigt|ankommt)$", to: "^(fahrt|fahre|steigt|steige|kommt)$", rule: "", msg: "In a main sentence the prefix splits off and goes to the end: … fährt … **ab**, … steigt … **um**." },
      ],
      drills: [
        // ── our own: the reply ──
        { id: "dbus.r", t: "respond", title: "What fits?", how: "Pick the reply that fits.", items: [
          { q: "Wann fährt der Bus nach Uster ab?", o: ["In fünf Minuten.", "Seit fünf Minuten.", "Fünf Minuten lang."], a: ["In fünf Minuten."], r: ["bus.when"] },
          { q: "Wie lange wartest du schon?", o: ["Seit zehn Minuten.", "In zehn Minuten.", "Um zehn Minuten."], a: ["Seit zehn Minuten."], r: ["bus.wait"] },
          { q: "Hat der Zug Verspätung?", o: ["Ja, fünf Minuten.", "Ja, fünf Uhr.", "Nein, zu Fuß."], a: ["Ja, fünf Minuten."], r: ["bus.wait"] },
          { q: "Wo muss ich umsteigen?", o: ["Am Bahnhof Altstetten.", "Mit dem Bus.", "Um acht Uhr."], a: ["Am Bahnhof Altstetten."], r: ["bus.change"] },
          { q: "Wo steigen Sie aus?", o: ["Bei der Post.", "Mit Karte.", "Seit gestern."], a: ["Bei der Post."], r: ["bus.change"] },
          { q: "Haben Sie ein Billett?", o: ["Ja, ein Abo.", "Ja, gern geschehen.", "Nein, ich warte."], a: ["Ja, ein Abo."], r: ["bus.ticket"] },
          { q: "Wer ist der Mann dort?", o: ["Das ist mein Kollege.", "Er ist dort.", "Ich weiß es."], a: ["Das ist mein Kollege."], r: ["bus.who"] },
          { q: "Kennst du ihn?", o: ["Ja, aus dem Deutschkurs.", "Ja, ich weiß.", "Ja, ich kann."], a: ["Ja, aus dem Deutschkurs."], r: ["bus.know"] },
          { q: "Kalt heute, nicht?", o: ["Ja, stimmt. Und windig!", "Nein, ich heiße Lea.", "Gern geschehen!"], a: ["Ja, stimmt. Und windig!"], r: ["bus.talk"] },
          { q: "Da kommt mein Bus. Schönen Tag noch!", o: ["Danke, gleichfalls!", "Herzlich willkommen!", "Ich auch nicht."], a: ["Danke, gleichfalls!"], r: ["bus.talk"] },
        ] },
        // ── our own: the missing word ──
        { id: "dbus.t", t: "type", title: "At the stop", how: "Write the missing word.", items: [
          { q: "Ich warte ___ den Bus.", a: ["auf"], r: ["bus.wait"] },
          { q: "Wir warten ___ zwanzig Minuten. (and still are)", a: ["seit", "schon", "schon seit"], r: ["bus.wait"] },
          { q: "Der Zug hat zehn Minuten ___. (is late)", a: ["Verspätung"], r: ["bus.wait"] },
          { q: "Der Bus fährt um acht Uhr fünfzehn ___. (leaves)", a: ["ab"], r: ["bus.when"] },
          { q: "Das Tram kommt ___ zehn Minuten. (every)", a: ["alle"], r: ["bus.when"] },
          { q: "Wo muss ich ___? (change)", a: ["umsteigen"], r: ["bus.change"] },
          { q: "Wir steigen am Bahnhof ___. (get off)", a: ["aus"], r: ["bus.change"] },
          { q: "Ich kaufe das Billett ___ Automaten.", a: ["am"], r: ["bus.ticket"] },
          { q: "Mit dem ___ zahle ich nur die Hälfte. (the half-fare card)", a: ["Halbtax", "Halbtaxabo", "Halbtax-Abo"], r: ["bus.ticket"] },
          { q: "Meine Nachbarin ist ___. (a teacher)", a: ["Lehrerin"], r: ["bus.who"] },
          { q: "___ du die Frau dort? (kennen)", a: ["Kennst"], r: ["bus.know"] },
          { q: "Nein, das ___ ich nicht. (wissen)", a: ["weiß"], r: ["bus.know"] },
          { q: "Kalt heute, ___?", a: ["nicht", "oder", "gell"], r: ["bus.talk"] },
        ] },
        // ── our own: a conversation at the stop in order ──
        { id: "dbus.o", t: "order", title: "At the stop", how: "Put the lines in order.", items: [
          { q: "Which bus?", a: ["Fährt dieser Bus nach Wallisellen?", "Nein, nehmen Sie die Nummer 4.", "Und wo hält die?", "Gleich dort drüben."], r: ["bus.when"] },
          { q: "Late again.", a: ["Wo bleibt der Bus?", "Er hat zehn Minuten Verspätung.", "Schon wieder!", "Ja, das ist jeden Tag so."], r: ["bus.wait"] },
          { q: "Changing.", a: ["Muss ich umsteigen?", "Ja, am Hauptbahnhof.", "Und dann?", "Dann nehmen Sie die S-Bahn."], r: ["bus.change"] },
          { q: "A ticket.", a: ["Wo kann ich ein Billett kaufen?", "Am Automaten oder in der App.", "Nimmt der Automat auch Karten?", "Ja, natürlich."], r: ["bus.ticket"] },
          { q: "Who's that?", a: ["Wer ist die Frau dort?", "Das ist meine Nachbarin.", "Was macht sie?", "Sie ist Lehrerin."], r: ["bus.who"] },
          { q: "Do you know him?", a: ["Kennst du den Mann mit dem Hund?", "Ja, vom Sehen.", "Wohnt er hier?", "Ja, im Haus gegenüber."], r: ["bus.know"] },
          { q: "The weather.", a: ["Kalt heute, nicht?", "Ja, bald schneit es sicher.", "Fahren Sie auch in die Stadt?", "Ja, zur Arbeit."], r: ["bus.talk"] },
          { q: "The last bus.", a: ["Wann fährt der letzte Bus?", "Um Mitternacht.", "Und am Wochenende?", "Dann fährt ein Nachtbus."], r: ["bus.when"] },
          { q: "A friend.", a: ["Hallo! Wartest du auch auf die Nummer 3?", "Ja, seit zehn Minuten.", "Ich glaube, sie kommt gleich.", "Hoffentlich!"], r: ["bus.wait", "bus.talk"] },
        ] },
        // ── Übung 31•1: answers about the conversations ──
        { id: "d31.1", ex: "31.1", t: "answer", title: "At the stop: your answers", how: "Answer the line with what the brackets say. A short answer is fine.", items: [
          { q: "«Welcher Bus fährt zum Bahnhof?» (number 7)", a: ["Die Nummer 7.", "Die Nummer sieben.", "Die Nummer 7 fährt zum Bahnhof.", "Der Bus Nummer 7.", "Nummer 7.", "Die 7.", "Der Bus Nummer 7 fährt zum Bahnhof."], r: ["bus.when"] },
          { q: "«Seit wann warten Sie schon?» (for a quarter of an hour)", a: ["Seit einer Viertelstunde.", "Ich warte seit einer Viertelstunde.", "Ich warte schon seit einer Viertelstunde.", "Seit fünfzehn Minuten.", "Ich warte seit fünfzehn Minuten.", "Schon seit einer Viertelstunde.", "Seit 15 Minuten."], r: ["bus.wait"] },
          { q: "«Wie viel Verspätung hat der Bus?» (twelve minutes)", a: ["Zwölf Minuten.", "Er hat zwölf Minuten Verspätung.", "Der Bus hat zwölf Minuten Verspätung.", "12 Minuten.", "Zwölf Minuten Verspätung."], r: ["bus.wait"] },
          { q: "«Wohin fahren Sie?» (to Basel)", a: ["Nach Basel.", "Ich fahre nach Basel."], r: ["bus.when"] },
          { q: "«Wann fährt Ihr Zug ab?» (at half past nine)", a: ["Um halb zehn.", "Mein Zug fährt um halb zehn ab.", "Er fährt um halb zehn ab."], r: ["bus.when"] },
          { q: "«Haben Sie schon ein Billett?» (yes, in the app)", a: ["Ja, in der App.", "Ja, ich habe ein Billett in der App.", "Ja, ich habe eins in der App."], r: ["bus.ticket"] },
          { q: "«Wer ist der Mann dort beim Kiosk?» (Tom, a colleague)", a: ["Das ist Tom, ein Kollege.", "Das ist Tom, mein Kollege.", "Das ist mein Kollege Tom.", "Das ist Tom. Er ist ein Kollege.", "Das ist Tom. Er ist mein Kollege."], r: ["bus.who"] },
          { q: "«Woher kommt er?» (from Ireland)", a: ["Aus Irland.", "Er kommt aus Irland."], r: ["bus.who"] },
          { q: "«Woher kennst du ihn?» (from the office)", a: ["Aus dem Büro.", "Ich kenne ihn aus dem Büro."], r: ["bus.know"] },
          { q: "«Was ist Sofia von Beruf?» (a nurse)", a: ["Pflegefachfrau.", "Sie ist Pflegefachfrau.", "Sie arbeitet als Pflegefachfrau.", "Krankenschwester.", "Sie ist Krankenschwester.", "Sie ist Pflegerin."], r: ["bus.who"] },
          { q: "«Wann kommt das Tram?» (in two minutes)", a: ["In zwei Minuten.", "Es kommt in zwei Minuten."], r: ["bus.when"] },
        ] },
        // ── Production: build the sentence ──
        { id: "dbus.c", t: "compose", low: true, end: true, title: "Build the sentence", how: "Build the sentence or question. Put the verb in its form; a separable prefix goes to the end.", items: [
          { w: ["ich", "warten", "seit", "zehn Minuten", "auf", "der Bus"], a: ["Ich warte seit zehn Minuten auf den Bus.", "Seit zehn Minuten warte ich auf den Bus."], r: ["bus.wait"] },
          { w: ["der Bus", "abfahren", "um", "acht Uhr"], a: ["Der Bus fährt um acht Uhr ab.", "Um acht Uhr fährt der Bus ab."], r: ["bus.when"] },
          { w: ["das Tram", "haben", "fünf Minuten", "Verspätung"], a: ["Das Tram hat fünf Minuten Verspätung."], r: ["bus.wait"] },
          { w: ["wir", "müssen", "am Bahnhof", "umsteigen"], a: ["Wir müssen am Bahnhof umsteigen.", "Am Bahnhof müssen wir umsteigen."], r: ["bus.change"], diag: [{ t: "seq", seq: ["^steigen$", "^(aus|ein|um)$"], rule: "bus.change", msg: "After a modal the separable verb stays whole at the very end: **aussteigen**, **umsteigen**." }] },
          { w: ["wo", "ich", "aussteigen", "müssen"], a: ["Wo muss ich aussteigen?"], r: ["bus.change"], diag: [{ t: "seq", seq: ["^steigen$", "^(aus|ein|um)$"], rule: "bus.change", msg: "After a modal the separable verb stays whole at the very end: **aussteigen**, **umsteigen**." }] },
          { w: ["wo", "können", "ich", "ein Billett", "kaufen"], a: ["Wo kann ich ein Billett kaufen?"], r: ["bus.ticket"] },
          { w: ["meine Nachbarin", "sein", "Lehrerin"], a: ["Meine Nachbarin ist Lehrerin."], r: ["bus.who"] },
          { w: ["Tom", "studieren", "Geschichte", "an der Uni"], a: ["Tom studiert Geschichte an der Uni.", "Tom studiert an der Uni Geschichte."], r: ["bus.who"], cap: true },
          { w: ["du", "kennen", "die Frau", "mit dem Hund"], a: ["Kennst du die Frau mit dem Hund?", "Du kennst die Frau mit dem Hund."], r: ["bus.know"] },
          { w: ["ich", "wissen", "dass", "er", "aus Irland", "kommen"], a: ["Ich weiß, dass er aus Irland kommt."], r: ["bus.know"] },
        ] },
        // ── Production: say it ──
        { id: "dp.bus", t: "translate", end: true, title: "Say it in German", how: "Translate it the way people say it.", items: [
          { q: "I've been waiting for the bus for twenty minutes.", a: ["Ich warte seit zwanzig Minuten auf den Bus.", "Seit zwanzig Minuten warte ich auf den Bus.", "Ich warte schon seit zwanzig Minuten auf den Bus.", "Ich warte schon zwanzig Minuten auf den Bus."], r: ["bus.wait"] },
          { q: "When does the next bus to Baden leave?", a: ["Wann fährt der nächste Bus nach Baden ab?", "Wann fährt der nächste Bus nach Baden?", "Wann geht der nächste Bus nach Baden?", "Wann fährt der nächste Bus nach Baden los?"], r: ["bus.when"] },
          { q: "The train is ten minutes late.", a: ["Der Zug hat zehn Minuten Verspätung.", "Der Zug ist zehn Minuten zu spät."], r: ["bus.wait"] },
          { q: "Where do I have to change?", a: ["Wo muss ich umsteigen?"], r: ["bus.change"], diag: [{ t: "seq", seq: ["^steigen$", "^(aus|ein|um)$"], rule: "bus.change", msg: "After a modal the separable verb stays whole at the very end: **aussteigen**, **umsteigen**." }] },
          { q: "We get off at the post office.", a: ["Wir steigen bei der Post aus.", "Wir steigen an der Post aus."], r: ["bus.change"] },
          { q: "A day ticket, please.", a: ["Eine Tageskarte, bitte."], r: ["bus.ticket"] },
          { q: "She's a nurse and comes from Greece.", a: ["Sie ist Pflegefachfrau und kommt aus Griechenland.", "Sie ist Krankenschwester und kommt aus Griechenland.", "Sie ist Pflegerin und kommt aus Griechenland.", "Sie ist Krankenpflegerin und kommt aus Griechenland."], r: ["bus.who"] },
          { q: "Do you know the man over there? (du)", a: ["Kennst du den Mann dort?", "Kennst du den Mann da drüben?", "Kennst du den Mann dort drüben?", "Kennst du den Mann da?"], r: ["bus.know"] },
          { q: "How do you know her? (du)", a: ["Woher kennst du sie?"], r: ["bus.know"] },
          { q: "Cold today, isn't it?", a: ["Kalt heute, nicht?", "Kalt heute, oder?", "Heute ist es kalt, nicht?", "Es ist kalt heute, nicht?", "Es ist heute kalt, nicht?", "Heute ist es kalt, oder?", "Es ist heute kalt, oder?", "Kalt heute, gell?", "Heute ist es kalt, gell?"], r: ["bus.talk"] },
        ] },
        // ── Production: your own lines ──
        { id: "dw.bus", t: "write", end: true, title: "Your own lines", how: "Write what you would say. Saved for Claude to correct.", items: [
          { q: "You're not sure you're at the right stop. Ask a stranger whether this bus goes to the station and when the next one comes.", model: ["Entschuldigung, fährt dieser Bus zum Bahnhof? Und wann kommt der nächste?"], r: ["bus.when"] },
          { q: "Text a friend that your bus is late and how long you've been waiting.", model: ["Sorry, mein Bus hat Verspätung. Ich warte schon seit zwanzig Minuten! Ich komme etwa um acht."], r: ["bus.wait"] },
          { q: "Tell a visitor where to change and where to get off.", model: ["Du musst am Hauptbahnhof umsteigen. Nimm dann das Tram 11 und steig beim Zoo aus."], r: ["bus.change"] },
          { q: "At the counter: ask for a return ticket to Bern with your half-fare card.", model: ["Ein Billett nach Bern und zurück, bitte. Ich habe ein Halbtax."], r: ["bus.ticket"] },
          { q: "Describe someone you often see at your stop: where they're from and what they do.", model: ["An meiner Haltestelle sehe ich oft eine Frau. Sie kommt aus Eritrea und ist Köchin in einem Restaurant."], r: ["bus.who"] },
          { q: "Say how you know a person, and one thing you know about them.", model: ["Ich kenne Marta aus dem Deutschkurs. Ich weiß, dass sie zwei Kinder hat."], r: ["bus.know"] },
          { q: "Start a short chat at the stop, and end it when your bus comes.", model: ["Kalt heute, nicht? — Ja, sehr. — Fahren Sie auch in die Stadt? — Nein, nach Hause. Oh, da kommt mein Bus. Schönen Tag noch!"], r: ["bus.talk"] },
          { q: "Your tram is cancelled. Say so to someone, and ask how you can get to the station now.", model: ["Das Tram fällt heute aus. Wie komme ich jetzt zum Bahnhof? Gibt es einen Bus?"], r: ["bus.change"] },
        ] },
      ],
    },
  },
});

// Chapter 31, "An der Bushaltestelle": its one exercise here.
cxCover({ "31.1": "d31.1" });

cxJournal([
  { id: "w.commute", th: "day", lv: "A2", de: "Mein Weg zur Arbeit", t: "How you get to work or to your course: which bus or train, when it leaves, where you change, how long you sometimes wait — and who you meet on the way.", help: ["Ich nehme jeden Tag …", "Der Bus fährt um … ab.", "In … steige ich um.", "Manchmal warte ich …"], sec: "s3.bus" },
]);
