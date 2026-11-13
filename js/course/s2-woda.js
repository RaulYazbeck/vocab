// ── COURSE PACK · Stage 2 · wo- / da- compounds (worauf? — darauf) ──
// Book: chapter 19's "Pronouns and prepositional adverbs" (Übung 19•8: a
// question for the prepositional phrase — a person: auf wen? · a thing:
// worauf?, or simply wo? / wohin? for a place) and chapter 28's
// "Prepositional adverbs" (28•15: the highlighted part becomes a wo-word ·
// 28•18: build questions from word lists · 28•19: your own sentences from
// a cue · 28•20: build the question, then answer it · 28•21: your own
// questions and answers). 28•16 and 28•17 (wann, warum, wie viel …) were
// Stage 0's. Two sheets: a thing after a preposition — darauf, worauf, the
// r before a vowel, wo? for a place · da- pointing ahead (darauf, dass …)
// and back (Daran habe ich nicht gedacht).
// The verbs and their prepositions are the lesson before (s1-verbprep.js);
// dafür / damit were first met with the prepositions (s1-prep.js).
cxPack({
  id: "s2-woda",
  sections: {
    "s2.woda": {
      testout: { n: 6, miss: 1 },
      rules: {
        "wd.da": "A thing after a preposition: darauf, damit …",
        "wd.wo": "Asking about a thing: worauf? womit? …",
        "wd.r": "An r before a vowel: darauf, woran (but damit)",
        "wd.place": "For a place, ask wo? or wohin?",
        "wd.dass": "A da-word pointing ahead: darauf, dass …",
        "wd.back": "A da-word pointing back: Daran habe ich nicht gedacht",
      },
      sheets: [
        { id: "cx.wd1", title: "worauf? — darauf: a thing", qn: 3,
          struct: [["Worauf", "pre"], ["wartest", "verb"], ["du", "who"], ["? — Ich warte", "mid"], ["darauf", "thing"]],
          why: "After a preposition, a **person** becomes a pronoun: auf **ihn**, mit **ihr**. A **thing** doesn't: instead of ~~auf es~~ German says **darauf**, and asks **worauf?** This works for every preposition.",
          rid: ["wd.da", "wd.wo", "wd.r", "wd.place"],
          rules: [
            "A **thing** or idea after a preposition becomes **da + preposition**; a **person** stays a pronoun. Ich warte auf den Bus. → Ich warte **darauf**. · Ich warte auf Tom. → Ich warte auf **ihn**.",
            "To ask about a **thing**, put **wo + preposition** at the start of the question: **Worauf** wartest du? · **Wofür** interessierst du dich? For a **person**, use the preposition with wen or wem: **Auf wen** wartest du?",
            "If the preposition starts with a **vowel**, add an **r**: da**r**auf, da**r**an, da**r**über, wo**r**auf, wo**r**an. Before a consonant there's no r: damit, dafür, davon, womit, wofür. (ohne, seit and außer have no such words.)",
            "For a **place**, just ask **wo?** or **wohin?** Das Handy liegt auf dem Tisch. → **Wo** liegt das Handy? · Ich lege es in die Tasche. → **Wohin** legst du es?",
          ],
          table: { head: ["a thing", "a person"], rows: [
            ["**darauf** · worauf?", "auf ihn · auf wen?"],
            ["**daran** · woran?", "an sie · an wen?"],
            ["**darüber** · worüber?", "über ihn · über wen?"],
            ["**damit** · womit?", "mit ihr · mit wem?"],
            ["**dafür** · wofür?", "für sie · für wen?"],
            ["**davon** · wovon?", "von ihm · von wem?"],
          ] },
          ex: [
            ["**Worauf** freust du dich? — Auf die Ferien. Ich freue mich schon lange **darauf**.", "What are you looking forward to? — The holidays. I've been looking forward to them for a long time."],
            ["**Womit** fährst du zur Arbeit? — Mit dem Velo.", "How (with what) do you get to work? — By bike."],
            ["Das ist mein Problem. Ich möchte nicht **darüber** sprechen.", "That's my problem. I don't want to talk about it."],
            ["**Woran** denkst du? — An das Wochenende.", "What are you thinking about? — About the weekend."],
          ],
          trap: "A thing is never ~~auf es~~, ~~mit das~~ or ~~für es~~: say **darauf**, **damit**, **dafür**. And a person never gets a da-word: Ich warte auf meinen Bruder, so auf **ihn**, not ~~darauf~~.",
          quiz: [
            { at: "r1", k: "pick", q: "Ich warte auf den Zug. → Ich warte ___.", o: ["darauf", "auf ihn", "auf es"], a: 0, why: "The train is a thing: **darauf**." },
            { at: "r1", k: "pick", q: "Ich warte auf meinen Bruder. → Ich warte ___.", o: ["auf ihn", "darauf", "auf es"], a: 0, why: "A person: the preposition and a pronoun, **auf ihn**." },
            { at: "r2", k: "pick", q: "___ interessierst du dich? — Für Musik.", o: ["Wofür", "Für wen", "Was für"], a: 0, why: "Music is a thing: **wofür**." },
            { at: "r2", k: "pick", q: "___ sprecht ihr? — Über den neuen Chef.", o: ["Über wen", "Worüber", "Wen über"], a: 0, why: "The boss is a person: **über wen**." },
            { at: "r2", k: "order", q: "Build it: What are you waiting for?", a: ["Worauf", "wartest", "du?"], why: "wo, r and auf make **Worauf**, at the start of the question." },
            { at: "r3", k: "pick", q: "an + das → ?", o: ["daran", "daan", "dan"], a: 0, why: "an starts with a vowel, so an **r** goes in between: **daran**." },
            { at: "r3", k: "pick", q: "mit + was → ?", o: ["womit", "wormit", "mit wo"], a: 0, why: "mit starts with a consonant, so there's no r: **womit**." },
            { at: "r3", k: "type", cx: true, q: "Ich denke oft an die Ferien. → Ich denke oft ___.", a: ["daran"], r: ["wd.r"], why: "da, r and an make **daran**." },
            { at: "r4", k: "pick", q: "Der Schlüssel liegt auf dem Tisch. — the everyday question:", o: ["Wo liegt der Schlüssel?", "Auf wem liegt der Schlüssel?", "Wohin liegt der Schlüssel?"], a: 0, why: "For a place, just ask **wo?**" },
            { at: "table", k: "pick", q: "Er erzählt von seiner Reise. → Er erzählt ___.", o: ["davon", "darvon", "von ihr"], a: 0, why: "A thing, and von starts with a consonant: **davon**." },
            { at: "trap", k: "pick", q: "Which is right?", o: ["Das Geschenk ist toll. Ich freue mich sehr darüber.", "Das Geschenk ist toll. Ich freue mich sehr über es."], a: 0, why: "The present is a thing: **darüber**, never über es." },
          ] },
        { id: "cx.wd2", title: "darauf, dass … · Daran habe ich nicht gedacht", qn: 3,
          struct: [["Ich freue mich", "who"], ["darauf,", "thing"], ["dass", "pre"], ["du", "who"], ["kommst", "verb"]],
          why: "A da-word can also stand for a whole **sentence**. It points **ahead** to a dass-sentence or a zu-part, or **back** to what was just said.",
          rid: ["wd.dass", "wd.back"],
          rules: [
            "Before a dass-sentence or a zu-part, the verb's preposition becomes a da-word that points **ahead**. Ich warte **darauf, dass** der Regen aufhört. · Ich habe Angst **davor**, einen Fehler **zu machen**.",
            "A da-word can point **back** to what was just said, often at the start, with the verb right after it. Morgen ist Feiertag. — **Daran** habe ich nicht gedacht. · Er kommt immer zu spät. **Darüber** ärgere ich mich.",
          ],
          table: { head: ["points ahead", "points back"], rows: [
            ["**darauf, dass** …", "**Darauf** freue ich mich."],
            ["**daran, dass** …", "**Daran** denke ich."],
            ["**davor,** … zu …", "**Davor** habe ich Angst."],
          ] },
          ex: [
            ["Wir freuen uns **darauf**, euch bald **zu sehen**.", "We're looking forward to seeing you soon."],
            ["Ich ärgere mich **darüber, dass** der Zug schon wieder Verspätung hat.", "I'm annoyed that the train is late yet again."],
            ["Kannst du mir bitte **dabei** helfen?", "Can you please help me with that?"],
            ["Ein Haus am See? **Davon** träume ich schon lange.", "A house by the lake? I've been dreaming of that for a long time."],
          ],
          trap: "A bare preposition can't come before dass: ~~Ich warte auf, dass er anruft~~ is wrong; say **darauf**, dass. Also: sich freuen **darauf**, dass … is *look forward to*; sich freuen, dass … is *be glad*.",
          quiz: [
            { at: "r1", k: "pick", q: "Ich freue mich ___, dass du kommst.", o: ["darauf", "auf", "worauf"], a: 0, why: "sich freuen auf, before a sentence: **darauf**, dass …" },
            { at: "r1", k: "pick", q: "Denk bitte ___, den Schlüssel mitzunehmen!", o: ["daran", "an", "darauf"], a: 0, why: "denken an, before a zu-part: **daran**, … zu …" },
            { at: "r1", k: "type", cx: true, q: "Ich warte ___, dass er anruft.", a: ["darauf"], r: ["wd.dass"], why: "warten auf, before a sentence: **darauf**, dass …" },
            { at: "r2", k: "pick", q: "Morgen ist Feiertag. — ___ habe ich nicht gedacht.", o: ["Daran", "An es", "Woran"], a: 0, why: "It points back, and the verb is denken an: **daran**." },
            { at: "r2", k: "pick", q: "Er ist immer unpünktlich. ___ ärgere ich mich.", o: ["Darüber", "Über es", "Worüber"], a: 0, why: "sich ärgern über, pointing back: **darüber**." },
            { at: "r2", k: "order", q: "Build it: I have no time for that.", a: ["Dafür", "habe", "ich", "keine Zeit."], why: "The da-word first, then the verb: Dafür **habe** ich …" },
            { at: "table", k: "pick", q: "Die Prüfung ist morgen. ___ habe ich Angst.", o: ["Davor", "Darvor", "Vor es"], a: 0, why: "Angst haben vor: **davor**, with no r." },
            { at: "trap", k: "pick", q: "Which is right?", o: ["Ich freue mich darauf, dass ihr kommt.", "Ich freue mich auf, dass ihr kommt."], a: 0, why: "Before a dass-sentence, the preposition goes inside a da-word: **darauf**." },
          ] },
      ],
      diag: [
        { t: "swap", from: "^(da|wo)(auf|uber|an|in|um|aus)$", to: "^(da|wo)r(auf|uber|an|in|um|aus)$", rule: "wd.r", hard: true, msg: "The preposition starts with a vowel, so an **r** goes in between: **{right}**." },
        { t: "swap", from: "^(da|wo)r(fur|mit|von|vor|nach|zu|bei|durch|gegen)$", to: "^(da|wo)(fur|mit|von|vor|nach|zu|bei|durch|gegen)$", rule: "wd.r", hard: true, msg: "No r before a consonant: **{right}**." },
        { t: "swap", from: "^(ihn|ihm|sie|es|ihr|ihnen|das|dem|den)$", to: "^dar?(auf|uber|an|in|um|aus|fur|mit|von|vor|nach|zu|bei|durch|gegen)$", rule: "wd.da", hard: true, msg: "It's a thing, so use da + the preposition: **{right}**. auf ihn, mit ihr and so on are for people." },
        { t: "swap", from: "^dar?(auf|uber|an|in|um|aus|fur|mit|von|vor|nach|zu|bei|durch|gegen)$", to: "^(ihn|ihm|sie|ihr|ihnen|mich|dich|uns|euch)$", rule: "wd.da", hard: true, msg: "It's a person, so use the preposition and a pronoun: … **{right}**. da-words are for things." },
        { t: "swap", from: "^was$", to: "^wor?(auf|uber|an|in|um|aus|fur|mit|von|vor|nach|zu|bei|durch|gegen)$", rule: "wd.wo", hard: true, msg: "Use one word: **{right}** (wo + the preposition). *auf was* is only heard in casual speech." },
        { t: "swap", from: "^(wen|wem)$", to: "^wor?(auf|uber|an|in|um|aus|fur|mit|von|vor|nach|zu|bei|durch|gegen)$", rule: "wd.wo", hard: true, msg: "It's a thing, so it's **{right}**. wen and wem ask about people." },
        { t: "swap", from: "^wor?(auf|uber|an|in|um|aus|fur|mit|von|vor|nach|zu|bei|durch|gegen)$", to: "^(wen|wem)$", rule: "wd.wo", hard: true, msg: "It's a person, so use the preposition and **{right}**. wo-words ask about things." },
        { t: "swap", from: "^(da|wo)r?(auf|uber|an|in|um|aus|fur|mit|von|vor|nach|zu|bei|durch|gegen)$", to: "^(da|wo)r?(auf|uber|an|in|um|aus|fur|mit|von|vor|nach|zu|bei|durch|gegen)$", rule: "", hard: true, msg: "The verb's own preposition goes into the word: **{right}**." },
        { t: "swap", from: "^(auf|uber|an|in|um|aus|fur|mit|von|vor|nach|zu|bei)$", to: "^dar?(auf|uber|an|in|um|aus|fur|mit|von|vor|nach|zu|bei)$", rule: "wd.dass", hard: true, msg: "Before a whole sentence, the preposition goes inside a da-word: **{right}**, dass … or … zu …" },
        { t: "missing", whole: true, tok: "^dar?(auf|uber|an|in|um|aus|fur|mit|von|vor|nach|zu|bei)$", rule: "", msg: "The verb keeps its preposition, inside a da-word: darauf, daran, davon …" },
      ],
      drills: [
        // ── our own: person or thing ──
        { id: "dwd.pick", t: "pick", title: "darauf or auf ihn?", how: "A thing: da + preposition. A person: the preposition and a pronoun.", items: [
          { q: "Ich warte auf den Bus. → Ich warte ___.", o: ["darauf", "auf ihn"], a: ["darauf"], r: ["wd.da"] },
          { q: "Ich warte auf den Arzt. → Ich warte ___.", o: ["auf ihn", "darauf"], a: ["auf ihn"], r: ["wd.da"] },
          { q: "Wir sprechen über das Wetter. → Wir sprechen ___.", o: ["darüber", "über es", "über ihn"], a: ["darüber"], r: ["wd.da"] },
          { q: "Wir sprechen über die Nachbarin. → Wir sprechen ___.", o: ["über sie", "darüber"], a: ["über sie"], r: ["wd.da"] },
          { q: "Lea ist mit dem Kurs zufrieden. → Lea ist ___ zufrieden.", o: ["damit", "mit ihm", "darmit"], a: ["damit"], r: ["wd.da"] },
          { q: "Lea ist mit dem Lehrer zufrieden. → Lea ist ___ zufrieden.", o: ["mit ihm", "damit"], a: ["mit ihm"], r: ["wd.da"] },
          { q: "Ich denke an die Ferien. → Ich denke ___.", o: ["daran", "an sie", "an es"], a: ["daran"], r: ["wd.da"] },
          { q: "Ich denke an meine Eltern. → Ich denke ___.", o: ["an sie", "daran"], a: ["an sie"], r: ["wd.da"] },
          { q: "Er hat Angst vor der Prüfung. → Er hat Angst ___.", o: ["davor", "vor ihr", "darvor"], a: ["davor"], r: ["wd.da"] },
          { q: "Sie kümmert sich um den Garten. → Sie kümmert sich ___.", o: ["darum", "um ihn", "dafür"], a: ["darum"], r: ["wd.da"] },
          { q: "Sie kümmert sich um ihre Großmutter. → Sie kümmert sich ___.", o: ["um sie", "darum"], a: ["um sie"], r: ["wd.da"] },
          { q: "Danke für das Geschenk! → Danke ___!", o: ["dafür", "für es", "darfür"], a: ["dafür"], r: ["wd.da"] },
        ] },
        // ── our own: the wo-word ──
        { id: "dwd.wo", t: "type", title: "Worauf? Womit? Wofür?", how: "Write the wo-word: wo + the preposition in brackets (an r before a vowel).", items: [
          { q: "(auf) ___ wartest du? — Auf das Tram.", a: ["Worauf"], r: ["wd.wo", "wd.r"] },
          { q: "(für) ___ interessiert sich deine Tochter? — Für Pferde.", a: ["Wofür"], r: ["wd.wo"] },
          { q: "(mit) ___ schreibst du? — Mit einem Bleistift.", a: ["Womit"], r: ["wd.wo"] },
          { q: "(über) ___ lacht ihr? — Über einen Witz.", a: ["Worüber"], r: ["wd.wo", "wd.r"] },
          { q: "(an) ___ denkst du gerade? — An das Abendessen.", a: ["Woran"], r: ["wd.wo", "wd.r"] },
          { q: "(von) ___ träumst du? — Von einer langen Reise.", a: ["Wovon"], r: ["wd.wo"] },
          { q: "(vor) ___ hast du Angst? — Vor Spinnen.", a: ["Wovor"], r: ["wd.wo"] },
          { q: "(um) ___ geht es in dem Film? — Um eine Familie in Bern.", a: ["Worum"], r: ["wd.wo", "wd.r"] },
          { q: "(nach) ___ hat der Mann gefragt? — Nach dem Weg.", a: ["Wonach"], r: ["wd.wo"] },
          { q: "(zu) ___ brauchst du den Hammer? — Zum Aufhängen der Bilder.", a: ["Wozu"], r: ["wd.wo"] },
          { q: "(über) ___ ärgert sich der Chef? — Über die vielen Fehler.", a: ["Worüber"], r: ["wd.wo", "wd.r"] },
          { q: "(auf) ___ freuen sich die Kinder? — Auf den Schnee.", a: ["Worauf"], r: ["wd.wo", "wd.r"] },
        ] },
        // ── our own: the thing → a da-word (a person stays a pronoun) ──
        { id: "dwd.da", t: "transform", title: "darauf · daran · damit", how: "Replace the highlighted part with a da-word, or for a person, preposition + pronoun.", items: [
          { q: "Ich denke oft an die Ferien.", hl: "an die Ferien", a: ["Ich denke oft daran."], r: ["wd.da", "wd.r"] },
          { q: "Wir freuen uns auf das Wochenende.", hl: "auf das Wochenende", a: ["Wir freuen uns darauf."], r: ["wd.da", "wd.r"] },
          { q: "Tom ist mit seinem Lohn zufrieden.", hl: "mit seinem Lohn", a: ["Tom ist damit zufrieden."], r: ["wd.da"], cap: true },
          { q: "Sie hat lange von der Reise erzählt.", hl: "von der Reise", a: ["Sie hat lange davon erzählt."], r: ["wd.da"] },
          { q: "Ich ärgere mich über den Lärm.", hl: "über den Lärm", a: ["Ich ärgere mich darüber."], r: ["wd.da", "wd.r"] },
          { q: "Wir warten auf den Hauswart.", hl: "auf den Hauswart", a: ["Wir warten auf ihn."], r: ["wd.da"] },
          { q: "Ich habe keine Zeit für das Training.", hl: "für das Training", a: ["Ich habe keine Zeit dafür.", "Ich habe dafür keine Zeit."], r: ["wd.da"] },
          { q: "Er interessiert sich nicht für Politik.", hl: "für Politik", a: ["Er interessiert sich nicht dafür."], r: ["wd.da"] },
          { q: "Kannst du mir bei den Hausaufgaben helfen?", hl: "bei den Hausaufgaben", a: ["Kannst du mir dabei helfen?"], r: ["wd.da"] },
          { q: "Ich erinnere mich gut an meine erste Lehrerin.", hl: "an meine erste Lehrerin", a: ["Ich erinnere mich gut an sie."], r: ["wd.da"] },
          { q: "Hast du etwas gegen meinen Plan?", hl: "gegen meinen Plan", a: ["Hast du etwas dagegen?"], r: ["wd.da"] },
          { q: "Die Kinder haben Angst vor dem Gewitter.", hl: "vor dem Gewitter", a: ["Die Kinder haben Angst davor."], r: ["wd.da"] },
          { q: "Ich habe lange über deine Frage nachgedacht.", hl: "über deine Frage", a: ["Ich habe lange darüber nachgedacht."], r: ["wd.da", "wd.r"] },
        ] },
        // ── Übung 28•15: the highlighted part becomes the question word ──
        { id: "d28.15", ex: "28.15", t: "transform", low: true, title: "Worüber? — or über wen?", how: "Ask about the highlighted part. A thing: a wo-word. A person: preposition + wen / wem.", items: [
          { q: "Herr Roth interessiert sich für Geschichte.", hl: "für Geschichte", a: ["Wofür interessiert sich Herr Roth?"], r: ["wd.wo"] },
          { q: "Die Kinder warten auf den Schulbus.", hl: "auf den Schulbus", a: ["Worauf warten die Kinder?"], r: ["wd.wo", "wd.r"] },
          { q: "Sara spricht über ihre neue Stelle.", hl: "über ihre neue Stelle", a: ["Worüber spricht Sara?"], r: ["wd.wo", "wd.r"] },
          { q: "Tom ärgert sich über seinen Bruder.", hl: "über seinen Bruder", a: ["Über wen ärgert sich Tom?"], r: ["wd.wo"] },
          { q: "Wir fahren mit dem Zug nach Genf.", hl: "mit dem Zug", a: ["Womit fahrt ihr nach Genf?", "Womit fahren Sie nach Genf?", "Womit fahren wir nach Genf?"], r: ["wd.wo"] },
          { q: "Die Suppe schmeckt nach Knoblauch.", hl: "nach Knoblauch", a: ["Wonach schmeckt die Suppe?"], r: ["wd.wo"] },
          { q: "Er denkt nur an seine Arbeit.", hl: "an seine Arbeit", a: ["Woran denkt er nur?", "Woran denkt er?"], r: ["wd.wo", "wd.r"] },
          { q: "Lea träumt von einem eigenen Laden.", hl: "von einem eigenen Laden", a: ["Wovon träumt Lea?"], r: ["wd.wo"] },
          { q: "Opa erzählt von seinem alten Freund.", hl: "von seinem alten Freund", a: ["Von wem erzählt Opa?"], r: ["wd.wo"] },
          { q: "Ich brauche das Geld für die Miete.", hl: "für die Miete", a: ["Wofür brauchst du das Geld?", "Wofür brauchen Sie das Geld?"], r: ["wd.wo"] },
          { q: "Der Hund hat Angst vor dem Staubsauger.", hl: "vor dem Staubsauger", a: ["Wovor hat der Hund Angst?"], r: ["wd.wo"] },
          { q: "Sie bittet um einen Termin am Montag.", hl: "um einen Termin am Montag", a: ["Worum bittet sie?"], r: ["wd.wo", "wd.r"] },
        ] },
        // ── Übung 19•8: a question for the prepositional phrase — wo? / wohin? for a place ──
        { id: "d19.8", ex: "19.8", t: "transform", low: true, title: "Wo? Wohin? — or neben wem?", how: "Ask about the highlighted part. A place: wo? or wohin? A person: preposition + wen / wem.", items: [
          { q: "Das Handy liegt auf dem Küchentisch.", hl: "auf dem Küchentisch", a: ["Wo liegt das Handy?", "Worauf liegt das Handy?"], r: ["wd.place"] },
          { q: "Die Katze springt auf das Sofa.", hl: "auf das Sofa", a: ["Wohin springt die Katze?", "Worauf springt die Katze?"], r: ["wd.place"] },
          { q: "Lea sitzt neben ihrer Freundin.", hl: "neben ihrer Freundin", a: ["Neben wem sitzt Lea?"], r: ["wd.wo"] },
          { q: "Die Schuhe stehen unter dem Bett.", hl: "unter dem Bett", a: ["Wo stehen die Schuhe?", "Worunter stehen die Schuhe?"], r: ["wd.place"] },
          { q: "Ich stelle die Blumen auf den Balkon.", hl: "auf den Balkon", a: ["Wohin stellst du die Blumen?", "Wohin stellen Sie die Blumen?"], r: ["wd.place"] },
          { q: "Das Kind versteckt sich hinter seiner Mutter.", hl: "hinter seiner Mutter", a: ["Hinter wem versteckt sich das Kind?"], r: ["wd.wo"] },
          { q: "Das Bild hängt über dem Sofa.", hl: "über dem Sofa", a: ["Wo hängt das Bild?", "Worüber hängt das Bild?"], r: ["wd.place"] },
          { q: "Er legt den Brief in die Schublade.", hl: "in die Schublade", a: ["Wohin legt er den Brief?"], r: ["wd.place"] },
          { q: "Der Bus hält vor dem Bahnhof.", hl: "vor dem Bahnhof", a: ["Wo hält der Bus?", "Wovor hält der Bus?"], r: ["wd.place"] },
          { q: "Tom steht zwischen seinen Eltern.", hl: "zwischen seinen Eltern", a: ["Zwischen wem steht Tom?"], r: ["wd.wo"] },
          { q: "Wir fahren am Sonntag an den See.", hl: "an den See", a: ["Wohin fahrt ihr am Sonntag?", "Wohin fahren Sie am Sonntag?", "Wohin fahren wir am Sonntag?"], r: ["wd.place"] },
        ] },
        // ── our own: da- pointing ahead ──
        { id: "dwd.dass", t: "transform", title: "darauf, dass …", how: "Join the two with the da-word in brackets and dass.", items: [
          { q: "Ich freue mich. Du besuchst uns. (darauf)", a: ["Ich freue mich darauf, dass du uns besuchst."], r: ["wd.dass"] },
          { q: "Wir warten. Der Regen hört auf. (darauf)", a: ["Wir warten darauf, dass der Regen aufhört."], r: ["wd.dass"] },
          { q: "Ich ärgere mich. Der Zug hat Verspätung. (darüber)", a: ["Ich ärgere mich darüber, dass der Zug Verspätung hat."], r: ["wd.dass"] },
          { q: "Denk bitte! Wir haben morgen Besuch. (daran)", a: ["Denk bitte daran, dass wir morgen Besuch haben!"], r: ["wd.dass"] },
          { q: "Sie hat Angst. Sie verliert ihre Stelle. (davor)", a: ["Sie hat Angst davor, dass sie ihre Stelle verliert."], r: ["wd.dass"] },
          { q: "Ich bin froh. Du hast mir geholfen. (darüber)", a: ["Ich bin froh darüber, dass du mir geholfen hast."], r: ["wd.dass"] },
          { q: "Er träumt. Seine Kinder studieren später einmal. (davon)", a: ["Er träumt davon, dass seine Kinder später einmal studieren."], r: ["wd.dass"] },
          { q: "Wir sind stolz. Unsere Tochter hat die Prüfung bestanden. (darauf)", a: ["Wir sind stolz darauf, dass unsere Tochter die Prüfung bestanden hat."], r: ["wd.dass"] },
          { q: "Ich erinnere mich. Es hat an dem Tag geschneit. (daran)", a: ["Ich erinnere mich daran, dass es an dem Tag geschneit hat."], r: ["wd.dass"] },
          { q: "Die Nachbarn beschweren sich. Die Musik ist zu laut. (darüber)", a: ["Die Nachbarn beschweren sich darüber, dass die Musik zu laut ist."], r: ["wd.dass"] },
        ] },
        // ── our own: da- pointing back ──
        { id: "dwd.back", t: "type", title: "Daran habe ich nicht gedacht", how: "Write the da-word that points back, with the verb's own preposition.", items: [
          { q: "Morgen ist die Prüfung. — ___ habe ich große Angst.", a: ["Davor"], r: ["wd.back"] },
          { q: "Wir brauchen noch Brot. — Stimmt, ___ habe ich nicht gedacht.", a: ["daran"], r: ["wd.back"] },
          { q: "Im Sommer fliegen wir nach Portugal. ___ freue ich mich schon.", a: ["Darauf"], r: ["wd.back"] },
          { q: "Der Nachbar hört bis Mitternacht Musik. ___ ärgern wir uns sehr.", a: ["Darüber"], r: ["wd.back"] },
          { q: "Ein eigenes Restaurant? ___ träumt mein Bruder schon lange.", a: ["Davon"], r: ["wd.back"] },
          { q: "Kannst du den Schrank tragen? — Nein, ___ brauche ich Hilfe.", a: ["dabei", "dafür", "dazu"], r: ["wd.back"] },
          { q: "Fußball? ___ interessiere ich mich überhaupt nicht.", a: ["Dafür"], r: ["wd.back"] },
          { q: "Der Film war sehr traurig. Ich habe noch lange ___ nachgedacht.", a: ["darüber"], r: ["wd.back"] },
          { q: "Die Miete wird teurer. Hast du schon ___ gehört?", a: ["davon"], r: ["wd.back"] },
          { q: "Sie haben uns zum Essen eingeladen. Was sagst du ___?", a: ["dazu"], r: ["wd.back"] },
          { q: "Das Formular ist kompliziert. Kannst du mir ___ helfen?", a: ["dabei", "damit"], r: ["wd.back"] },
        ] },
        // ── Übung 28•18: build the question from the words ──
        { id: "d28.18", ex: "28.18", t: "compose", low: true, end: true, title: "Build the question", how: "Build the question. After a preposition, was becomes a wo-word; wer takes its case.", items: [
          { w: ["über + was", "sprechen", "ihr", "?"], a: ["Worüber sprecht ihr?"], r: ["wd.wo", "wd.r"] },
          { w: ["mit + wer", "fahren", "du", "nach Bern", "?"], a: ["Mit wem fährst du nach Bern?"], r: ["wd.wo"] },
          { w: ["auf + was", "warten", "die Leute", "?"], a: ["Worauf warten die Leute?"], r: ["wd.wo", "wd.r"] },
          { w: ["für + was", "brauchen", "Sie", "das Formular", "?"], a: ["Wofür brauchen Sie das Formular?"], r: ["wd.wo"] },
          { w: ["an + wer", "schreiben", "du", "die Karte", "?"], a: ["An wen schreibst du die Karte?"], r: ["wd.wo"] },
          { w: ["mit + was", "bezahlen", "man", "hier", "?"], a: ["Womit bezahlt man hier?"], r: ["wd.wo"] },
          { w: ["von + was", "leben", "er", "?"], a: ["Wovon lebt er?"], r: ["wd.wo"] },
          { w: ["wo / wohin", "legen", "du", "der Schlüssel", "?"], a: ["Wohin legst du den Schlüssel?"], r: ["wd.place"] },
          { w: ["um + was", "gehen", "es", "in dem Brief", "?"], a: ["Worum geht es in dem Brief?", "Worum geht es im Brief?"], r: ["wd.wo", "wd.r"] },
          { w: ["wo / wohin", "sein", "meine Brille", "?"], a: ["Wo ist meine Brille?"], r: ["wd.place"] },
          { w: ["vor + was", "haben", "dein Sohn", "Angst", "?"], a: ["Wovor hat dein Sohn Angst?"], r: ["wd.wo"] },
        ] },
        // ── Übung 28•20: the question — and its answer ──
        { id: "d28.20", ex: "28.20", t: "answer", end: true, title: "Answer the question", how: "Answer in a whole sentence with the words in brackets. The preposition sets the case.", items: [
          { q: "Worauf wartest du? (der Bus)", a: ["Ich warte auf den Bus."], r: ["wd.wo"] },
          { q: "Woran denkst du? (das Wochenende)", a: ["Ich denke an das Wochenende.", "Ich denke ans Wochenende."], r: ["wd.wo"] },
          { q: "Wofür interessiert sich Lea? (alte Autos)", a: ["Lea interessiert sich für alte Autos.", "Sie interessiert sich für alte Autos."], r: ["wd.wo"] },
          { q: "Womit fährst du zur Arbeit? (das Tram)", a: ["Ich fahre mit dem Tram zur Arbeit."], r: ["wd.wo"] },
          { q: "Auf wen wartet ihr? (unsere Lehrerin)", a: ["Wir warten auf unsere Lehrerin."], r: ["wd.wo"] },
          { q: "Wovon träumt dein Bruder? (ein eigenes Geschäft)", a: ["Mein Bruder träumt von einem eigenen Geschäft.", "Er träumt von einem eigenen Geschäft."], r: ["wd.wo"] },
          { q: "Worüber ärgert sich der Nachbar? (der Lärm)", a: ["Der Nachbar ärgert sich über den Lärm.", "Er ärgert sich über den Lärm."], r: ["wd.wo"] },
          { q: "Wo liegt die Zeitung? (der Tisch)", a: ["Die Zeitung liegt auf dem Tisch.", "Sie liegt auf dem Tisch."], r: ["wd.place"] },
          { q: "Wohin stellst du die Flaschen? (der Keller)", a: ["Ich stelle die Flaschen in den Keller.", "Ich stelle sie in den Keller."], r: ["wd.place"] },
          { q: "Mit wem sprichst du Deutsch? (meine Kollegen)", a: ["Ich spreche mit meinen Kollegen Deutsch.", "Ich spreche Deutsch mit meinen Kollegen."], r: ["wd.wo"] },
          { q: "Wovor hast du Angst? (die Prüfung)", a: ["Ich habe Angst vor der Prüfung."], r: ["wd.wo"] },
        ] },
        // ── Production ──
        { id: "dp.wd", t: "translate", end: true, title: "Say it in German", how: "Translate. A thing after a preposition: a da- or wo-word. A person: a pronoun.", items: [
          { q: "What are you waiting for? (du)", a: ["Worauf wartest du?"], r: ["wd.wo", "wd.r"] },
          { q: "Who are you waiting for? (du)", a: ["Auf wen wartest du?"], r: ["wd.wo"] },
          { q: "What are you thinking about? (du)", a: ["Woran denkst du?", "Worüber denkst du nach?"], r: ["wd.wo", "wd.r"] },
          { q: "I'm looking forward to it.", a: ["Ich freue mich darauf."], r: ["wd.da", "wd.r"] },
          { q: "I don't want to talk about it.", a: ["Ich will nicht darüber sprechen.", "Ich möchte nicht darüber sprechen.", "Ich will nicht darüber reden.", "Ich möchte nicht darüber reden.", "Ich will darüber nicht sprechen.", "Ich möchte darüber nicht sprechen.", "Darüber möchte ich nicht sprechen.", "Darüber will ich nicht sprechen."], r: ["wd.da", "wd.r"] },
          { q: "I have no time for that.", a: ["Ich habe keine Zeit dafür.", "Dafür habe ich keine Zeit.", "Ich habe dafür keine Zeit."], r: ["wd.back"] },
          { q: "What are you interested in? (du)", a: ["Wofür interessierst du dich?"], r: ["wd.wo"] },
          { q: "I didn't think of that.", a: ["Daran habe ich nicht gedacht.", "Ich habe nicht daran gedacht."], r: ["wd.back", "wd.r"] },
          { q: "I'm looking forward to you coming. (du)", a: ["Ich freue mich darauf, dass du kommst."], r: ["wd.dass"] },
          { q: "Where is my key?", a: ["Wo ist mein Schlüssel?"], r: ["wd.place"] },
          { q: "What do you need the money for? (du)", a: ["Wofür brauchst du das Geld?", "Wozu brauchst du das Geld?"], r: ["wd.wo"] },
          { q: "Can you help me with that? (du)", a: ["Kannst du mir dabei helfen?", "Kannst du mir damit helfen?"], r: ["wd.da"] },
          { q: "I'm afraid of it.", a: ["Ich habe Angst davor.", "Davor habe ich Angst."], r: ["wd.da"] },
        ] },
        // ── Übung 28•19 and 28•21: your own questions — and answers ──
        { id: "d28.19", ex: "28.19", also: ["28.21"], t: "write", end: true, title: "Your own questions and answers", how: "Write a question starting with the cue, then answer it. Saved for Claude to correct.", items: [
          { q: "(Worauf …?)", model: ["Worauf freust du dich am meisten? — Ich freue mich auf den Besuch meiner Schwester."], r: ["wd.wo"] },
          { q: "(Auf wen …?)", model: ["Auf wen wartest du? — Ich warte auf meinen Sohn, er kommt gleich aus der Schule."], r: ["wd.wo"] },
          { q: "(Womit …?)", model: ["Womit fährst du in die Stadt? — Ich fahre meistens mit dem Bus."], r: ["wd.wo"] },
          { q: "(Worüber …?)", model: ["Worüber sprecht ihr in der Pause? — Wir sprechen über das Wochenende und über die Arbeit."], r: ["wd.wo"] },
          { q: "(Mit wem …?)", model: ["Mit wem lernst du Deutsch? — Ich lerne mit einer Kollegin aus Brasilien."], r: ["wd.wo"] },
          { q: "(Wofür …?)", model: ["Wofür sparst du? — Ich spare für die Ferien im Sommer."], r: ["wd.wo"] },
          { q: "(Wo …? / Wohin …?) — one of each", model: ["Wo ist mein Handy? — Es liegt auf dem Sofa. Wohin gehst du heute Abend? — Ich gehe ins Kino."], r: ["wd.place"] },
          { q: "Something you look forward to and something you're afraid of — each with darauf, dass … / davor, … zu …", model: ["Ich freue mich darauf, dass meine Eltern im Mai kommen. Ich habe ein bisschen Angst davor, die Prüfung zu machen."], r: ["wd.dass"] },
        ] },
      ],
    },
  },
});

// What the exercises became (28•16 and 28•17 — wann, warum, wie viel … —
// were Stage 0's: d28.16, d28.17).
cxCover({ "19.8": "d19.8", "28.15": "d28.15", "28.18": "d28.18", "28.19": "d28.19", "28.20": "d28.20", "28.21": "d28.19" });
