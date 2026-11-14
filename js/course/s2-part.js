// ── COURSE PACK · Stage 2 · Modal particles: doch, mal, ja, halt ──
// Book: chapter 29's "Doch" and "Mal" (no exercise of their own: chapter
// 29's fill-in of also, doch, gar, kaum, mal, wie, zwar — 29•18, 29•19 — is
// the next lesson's, short answers and emphasis). One sheet: the small
// words that give a sentence its tone — mal (friendlier), doch (come on!,
// as you know), ja (we both know · surprise), halt / eben (that's how it
// is), and denn in a question. They change no grammar and are never
// stressed; they stand after the verb and its pronouns. Our own drills:
// which word fits, putting it in, making a request friendlier, and saying
// it. The answer Doch! (yes, to a negative question) is the next lesson's.
cxPack({
  id: "s2-part",
  sections: {
    "s2.part": {
      testout: { n: 4, miss: 1 },
      rules: {
        "part.mal": "mal: a friendlier request (Komm mal her!)",
        "part.doch": "doch: come on! — and a protest (Das ist doch klar!)",
        "part.ja": "ja: we both know it · surprise (Das ist ja toll!)",
        "part.halt": "halt, eben: that's how it is · denn in a question",
      },
      sheets: [
        { id: "cx.part", title: "doch, mal, ja, halt — the tone", qn: 3,
          struct: [["Kannst", "verb"], ["du", "who"], ["mir", "mid"], ["mal", "pre"], ["helfen?", "inf"]],
          why: "These small words change no grammar, only the **tone**: a request sounds friendlier, a remark more natural. They come **after the verb and its pronouns**, and they are never stressed.",
          rid: ["part.mal", "part.doch", "part.ja", "part.halt"],
          rules: [
            "**mal** (from einmal) makes a request or a command softer and friendlier: Komm **mal** her! · Kannst du **mal** kurz helfen? · Schau **mal**!",
            "**doch** in a request says *come on, why not*: Komm **doch** mit! · Setzen Sie sich **doch**! In a statement it protests — *you should know that!*: Das ist **doch** klar! · Ich habe es dir **doch** gesagt!",
            "**ja** mentions something you both know, calmly, with no protest: Du weißt **ja**, dass ich keine Zeit habe. It also shows surprise: Das ist **ja** toll! · Du bist **ja** schon da!",
            "**halt** and **eben** say *that's just how it is* — you can't change it: Das ist **halt** so. · Dann nehmen wir **eben** den Bus. In a question, **denn** makes it sound interested and natural: Was ist **denn** los? · Wo wohnst du **denn**?",
          ],
          table: { head: ["word", "example"], rows: [
            ["mal", "Hör **mal**!"],
            ["doch", "Komm **doch** mit!"],
            ["doch", "Das ist **doch** klar!"],
            ["ja", "Das ist **ja** super!"],
            ["halt", "Das ist **halt** so."],
            ["denn", "Was ist **denn** los?"],
          ] },
          ex: [
            ["Kannst du **mal** das Fenster aufmachen?", "Could you open the window?"],
            ["Bleib **doch** noch ein bisschen!", "Stay a bit longer, why don't you!"],
            ["Du kennst **ja** meinen Bruder.", "You know my brother, of course."],
            ["Der Zug ist weg. Dann gehen wir **halt** zu Fuß.", "The train has gone. Then we'll just walk."],
          ],
          trap: "These words never come first and are never stressed: not ~~Mal kannst du helfen?~~ but Kannst du **mal** helfen? And they come after a pronoun: Kannst du **mir mal** helfen? — not ~~du mal mir~~.",
          quiz: [
            { at: "r1", k: "pick", q: "A friendly request: Kannst du ___ kurz warten?", o: ["mal", "halt", "ja"], a: 0, why: "**mal** makes a request friendlier." },
            { at: "r1", k: "order", q: "Build it: Can you just wait a moment?", a: ["Kannst", "du", "mal", "kurz warten?"], why: "mal comes after the verb and the pronoun." },
            { at: "r2", k: "pick", q: "Come along, why not! → Komm ___ mit!", o: ["doch", "ja", "denn"], a: 0, why: "**doch** in a request: *come on, why not*." },
            { at: "r2", k: "pick", q: "I told you so! → Ich habe es dir ___ gesagt!", o: ["doch", "mal", "denn"], a: 0, why: "**doch** in a statement: *as you know* / protest." },
            { at: "r3", k: "pick", q: "Surprised: Du bist ___ schon da!", o: ["ja", "mal", "halt"], a: 0, why: "**ja** shows surprise." },
            { at: "r3", k: "pick", q: "You know I have no car. → Du weißt ___, dass ich kein Auto habe.", o: ["ja", "mal", "denn"], a: 0, why: "**ja**: something we both know." },
            { at: "r4", k: "pick", q: "That's just how it is. → Das ist ___ so.", o: ["halt", "mal", "denn"], a: 0, why: "**halt** (or eben): you can't change it." },
            { at: "r4", k: "pick", q: "What's the matter? → Was ist ___ los?", o: ["denn", "halt", "mal"], a: 0, why: "**denn** in a question sounds interested and natural." },
            { at: "table", k: "pick", q: "Hör ___! (listen, friendly)", o: ["mal", "ja", "halt"], a: 0, why: "Hör **mal**!" },
            { at: "trap", k: "pick", q: "Which is right?", o: ["Kannst du mir mal helfen?", "Kannst du mal mir helfen?", "Mal kannst du mir helfen?"], a: 0, why: "After the verb **and** its pronoun: du **mir mal**." },
          ] },
      ],
      diag: [
        { t: "swap", from: "^(ja|halt|eben|denn)$", to: "^mal$", rule: "part.mal", msg: "A friendly request takes **mal**." },
        { t: "swap", from: "^(mal|ja|halt|eben|denn)$", to: "^doch$", rule: "part.doch", msg: "*come on, why not* — or *as you know* — is **doch**." },
        { t: "swap", from: "^(mal|doch|halt|eben|denn)$", to: "^ja$", rule: "part.ja", msg: "Something we both know, or surprise, takes **ja**." },
        { t: "swap", from: "^(mal|doch|ja|denn)$", to: "^(halt|eben)$", rule: "part.halt", msg: "*That's just how it is* is **halt** or **eben**." },
        { t: "swap", from: "^(mal|doch|ja|halt|eben)$", to: "^denn$", rule: "part.halt", msg: "In a question, the natural word is **denn**." },
        { t: "pos", tok: "^(mal|doch|ja|halt|eben|denn)$", rule: "part.mal", msg: "These words come after the verb and its pronouns, never first: put it {where}." },
      ],
      drills: [
        // ── our own: which word? ──
        { id: "dpart.pick", t: "pick", title: "Which little word?", how: "mal: friendlier · doch: come on! / you should know! · ja: we both know, or surprise · halt: that's how it is · denn: in a question.", o: ["mal", "doch", "ja", "halt", "denn"], items: [
          { q: "Kannst du mir ___ das Salz geben? (friendly)", a: ["mal"], r: ["part.mal"] },
          { q: "Wo wohnst du ___? (interested)", a: ["denn"], r: ["part.halt"] },
          { q: "Bleib ___ noch zum Essen! (why not)", a: ["doch"], r: ["part.doch"] },
          { q: "Wow, das Wetter ist heute ___ wunderschön! (surprised)", a: ["ja"], r: ["part.ja"] },
          { q: "Der Bus kommt nicht. Dann gehen wir ___ zu Fuß. (that's how it is)", a: ["halt"], r: ["part.halt"] },
          { q: "Schau ___, da drüben ist ein Reh! (friendly)", a: ["mal"], r: ["part.mal"] },
          { q: "Das stimmt nicht! Ich habe ___ angerufen! (protest)", a: ["doch"], r: ["part.doch"] },
          { q: "Du kennst ___ meine Schwester, sie wohnt in Genf. (just mentioning it, no protest)", a: ["ja"], r: ["part.ja"] },
          { q: "Was ist ___ passiert?", a: ["denn"], r: ["part.halt"] },
          { q: "Es ist ein bisschen verbrannt. Ich bin ___ kein Koch. (that's how it is)", a: ["halt"], r: ["part.halt"] },
          { q: "Setzen Sie sich ___! (please do)", a: ["doch"], r: ["part.doch"] },
          { q: "Hör ___ zu, das ist wichtig! (friendly)", a: ["mal"], r: ["part.mal"] },
        ] },
        // ── our own: put the word in ──
        { id: "dpart.place", t: "transform", fixed: true, title: "Put it in", how: "Put the word in brackets into the sentence: after the verb and its pronouns.", items: [
          { q: "Kannst du mir helfen? (mal)", a: ["Kannst du mir mal helfen?"], r: ["part.mal"] },
          { q: "Komm her! (mal)", a: ["Komm mal her!"], r: ["part.mal"] },
          { q: "Ruf mich an! (doch)", a: ["Ruf mich doch an!"], r: ["part.doch"] },
          { q: "Das ist toll! (ja)", a: ["Das ist ja toll!"], r: ["part.ja"] },
          { q: "Was machst du hier? (denn)", a: ["Was machst du denn hier?"], r: ["part.halt"] },
          { q: "Das ist so. (halt)", a: ["Das ist halt so."], r: ["part.halt"] },
          { q: "Du weißt, dass ich am Montag arbeite. (ja)", a: ["Du weißt ja, dass ich am Montag arbeite."], r: ["part.ja"] },
          { q: "Nehmen Sie Platz! (doch)", a: ["Nehmen Sie doch Platz!"], r: ["part.doch"] },
          { q: "Zeig mir das Foto! (mal)", a: ["Zeig mir mal das Foto!", "Zeig mir das Foto mal!"], r: ["part.mal"] },
          { q: "Wie heißt du? (denn)", a: ["Wie heißt du denn?"], r: ["part.halt"] },
        ] },
        // ── our own: friendlier ──
        { id: "dpart.soft", t: "transform", title: "Say it friendlier", how: "Make the request friendlier with mal or doch, as the brackets say.", items: [
          { q: "Gib mir den Schlüssel! (mal)", a: ["Gib mir mal den Schlüssel!", "Gib mir den Schlüssel mal!"], r: ["part.mal"] },
          { q: "Komm mit! (doch)", a: ["Komm doch mit!"], r: ["part.doch"] },
          { q: "Mach das Fenster auf! (mal)", a: ["Mach mal das Fenster auf!", "Mach das Fenster mal auf!"], r: ["part.mal"] },
          { q: "Bleibt noch ein bisschen! (doch)", a: ["Bleibt doch noch ein bisschen!"], r: ["part.doch"] },
          { q: "Warte kurz! (mal)", a: ["Warte mal kurz!", "Wart mal kurz!"], r: ["part.mal"] },
          { q: "Probier den Kuchen! (doch)", a: ["Probier doch den Kuchen!", "Probier den Kuchen doch!"], r: ["part.doch"] },
          { q: "Hör zu! (mal)", a: ["Hör mal zu!"], r: ["part.mal"] },
          { q: "Frag den Lehrer! (doch)", a: ["Frag doch den Lehrer!", "Frag den Lehrer doch!"], r: ["part.doch"] },
          { q: "Schau dir das an! (mal)", a: ["Schau dir das mal an!"], r: ["part.mal"] },
          { q: "Kommen Sie herein! (doch)", a: ["Kommen Sie doch herein!"], r: ["part.doch"] },
        ] },
        // ── Production ──
        { id: "dp.part", t: "translate", end: true, title: "Say it naturally", how: "Translate, with the little word that gives the tone: mal, doch, ja, halt or denn.", items: [
          { q: "Can you just help me for a second? (du)", a: ["Kannst du mir mal kurz helfen?", "Kannst du mir kurz mal helfen?", "Kannst du mal kurz helfen?", "Könntest du mir mal kurz helfen?", "Kannst du mir bitte mal kurz helfen?"], r: ["part.mal"] },
          { q: "Come along, why don't you! (du)", a: ["Komm doch mit!", "Komm doch auch mit!"], r: ["part.doch"] },
          { q: "That's great! (surprised)", a: ["Das ist ja toll!", "Das ist ja super!", "Das ist ja wunderbar!"], r: ["part.ja"] },
          { q: "That's just the way it is.", a: ["Das ist halt so.", "Das ist eben so.", "So ist es halt.", "Das ist nun mal so."], r: ["part.halt"] },
          { q: "What's the matter?", a: ["Was ist denn los?"], r: ["part.halt"] },
          { q: "Do sit down! (Sie)", a: ["Setzen Sie sich doch!", "Nehmen Sie doch Platz!"], r: ["part.doch"] },
          { q: "Have a look! (du)", a: ["Schau mal!", "Guck mal!"], r: ["part.mal"] },
          { q: "You know I have no time. (du)", a: ["Du weißt ja, dass ich keine Zeit habe.", "Du weißt doch, dass ich keine Zeit habe."], r: ["part.ja"] },
          { q: "Listen! (du)", a: ["Hör mal!", "Hör mal zu!"], r: ["part.mal"] },
          { q: "Come on, that's obvious!", a: ["Das ist doch klar!"], r: ["part.doch"] },
          { q: "Then we'll just take the bus.", a: ["Dann nehmen wir halt den Bus.", "Dann nehmen wir eben den Bus."], r: ["part.halt"] },
          { q: "Where do you come from, then? (du)", a: ["Woher kommst du denn?", "Wo kommst du denn her?"], r: ["part.halt"] },
        ] },
        { id: "dw.part", t: "write", end: true, title: "Write your own", how: "Write short lines with the little words. Saved for Claude to correct.", items: [
          { q: "Ask three family members for a small favour, in a friendly way. (mal)", model: ["Kannst du mal den Tisch decken? Gib mir bitte mal das Brot! Mach mal das Licht aus, bitte."], r: ["part.mal"] },
          { q: "Invite a neighbour in, warmly. (doch)", model: ["Kommen Sie doch herein! Setzen Sie sich doch. Möchten Sie einen Kaffee?"], r: ["part.doch"] },
          { q: "You meet a friend you haven't seen for years. What do you say?", model: ["Das ist ja eine Überraschung! Was machst du denn hier? Du siehst ja super aus!"], r: ["part.ja"] },
          { q: "Something you can't change — accept it. (halt)", model: ["Im Winter ist es hier halt früh dunkel. Dann gehe ich eben am Mittag spazieren."], r: ["part.halt"] },
          { q: "Ask a new colleague three friendly questions. (denn)", model: ["Woher kommst du denn? Wie lange arbeitest du denn schon hier? Und wo wohnst du denn?"], r: ["part.halt"] },
          { q: "Someone forgot something again. React. (doch)", model: ["Ich habe dir doch gesagt, dass wir um acht gehen! Das weißt du doch!"], r: ["part.doch"] },
          { q: "Remind a friend of something you both know. (ja)", model: ["Du weißt ja, dass ich am Freitag Geburtstag habe. Du kennst ja das Restaurant am See."], r: ["part.ja"] },
          { q: "Write a short text message to a friend with mal and doch.", model: ["Hallo Sara! Schau mal, am Samstag gibt es ein Konzert im Park, und es ist gratis. Komm doch mit! Ruf mich mal an."], r: ["part.mal"] },
        ] },
      ],
    },
  },
});
