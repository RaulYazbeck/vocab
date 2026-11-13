// ── COURSE PACK · Stage 2 · Short answers and words for emphasis ──
// Book: chapter 29's "Short responses" and "Words for emphasis" — also,
// gar, kaum, wie, zwar (29•18: fill in the word · 29•19: your own
// sentences). doch and mal as particles were the last lesson's (s2.part);
// the set responses (Gern! · Keine Ahnung. · 29•20, 29•21) were Stage 1's
// (s1.responses). One sheet: Doch! — yes to a negative question · the short
// replies that keep a conversation going (Ich auch. · Ich auch nicht. · Ich
// schon. · Genau. · Eben.) · also, gar, kaum, wie · zwar … aber and und zwar.
// Speaking-first: most drills are a line and your short reply.
cxPack({
  id: "s2-short",
  sections: {
    "s2.short": {
      testout: { n: 4, miss: 1 },
      rules: {
        "short.doch": "Doch! — yes to a negative question",
        "short.auch": "Ich auch. · Ich auch nicht. · Ich schon. · Ich nicht.",
        "short.emph": "also, gar, kaum, wie: so, at all, hardly, how",
        "short.zwar": "zwar … aber (admittedly … but) · und zwar (namely)",
      },
      sheets: [
        { id: "cx.short", title: "Doch! · Ich auch nicht. · zwar … aber", qn: 3,
          struct: [["Hast du keinen Hunger?", "thing"], ["—", "mid"], ["Doch!", "pre"]],
          why: "In a conversation, the shortest answers are the most natural. A few small words do most of the work: **Doch!**, **Ich auch nicht.**, **Genau.** And some words add weight: **kaum**, **gar**, **zwar**.",
          rid: ["short.doch", "short.auch", "short.emph", "short.zwar"],
          rules: [
            "To say **yes** to a question or remark with nicht or kein, answer **Doch!** — never Ja: Hast du **keinen** Hunger? — **Doch!** (I am hungry.) · Du kommst **nicht** mit? — **Doch**, ich komme!",
            "To agree or disagree in two words: **Ich auch.** (me too) · **Ich auch nicht.** (me neither, after a no) · **Ich schon.** (I do, after a no) · **Ich nicht.** (I don't). And: **Genau.** · **Stimmt.** · **Eben!** (that's what I said).",
            "**also** means *so, well*, not *also*: **Also**, gehen wir! · **gar** strengthens a no: **gar** nicht, **gar** nichts · **kaum** means *hardly*: **Kaum** zu glauben! · **wie** asks how: **Wie** bitte? · Und **wie**! (and how!)",
            "**zwar … aber** admits one point and then turns: Das Hotel ist **zwar** teuer, **aber** sehr schön. · **und zwar** gives the detail: Ich komme morgen, **und zwar** um acht.",
          ],
          table: { head: ["they say", "you say"], rows: [
            ["Ich mag Käse.", "**Ich auch.**"],
            ["Ich mag keinen Fisch.", "**Ich auch nicht.**"],
            ["Ich mag keinen Fisch.", "**Ich schon.**"],
            ["Du hast keine Zeit?", "**Doch!**"],
          ] },
          ex: [
            ["Kommst du nicht mit? — **Doch**, natürlich!", "Aren't you coming? — Yes, of course I am!"],
            ["Ich trinke keinen Kaffee. — **Ich auch nicht.**", "I don't drink coffee. — Me neither."],
            ["Er hat **kaum** geschlafen und ist **gar** nicht müde.", "He hardly slept and isn't tired at all."],
            ["Die Wohnung ist **zwar** klein, **aber** sie hat einen Balkon.", "The flat is small, admittedly, but it has a balcony."],
          ],
          trap: "**also** is not English *also* (that's **auch**): **Also**, wir sehen uns morgen means *so, see you tomorrow*. And *me too* after a no is **Ich auch nicht**, not ~~Ich auch~~.",
          quiz: [
            { at: "r1", k: "pick", q: "Hast du keine Zeit? — ___, ich habe Zeit.", o: ["Doch", "Ja", "Nein"], a: 0, why: "Yes to a question with kein: **Doch**." },
            { at: "r1", k: "pick", q: "Hast du Zeit? — ___, ich habe Zeit.", o: ["Ja", "Doch"], a: 0, why: "A plain question, so a plain **Ja**." },
            { at: "r2", k: "pick", q: "Ich esse kein Fleisch. — Me neither:", o: ["Ich auch nicht.", "Ich auch.", "Ich nicht auch."], a: 0, why: "After a no: **Ich auch nicht.**" },
            { at: "r2", k: "pick", q: "Ich spiele nicht Tennis. — I do:", o: ["Ich schon.", "Ich auch.", "Doch ich."], a: 0, why: "Against a no: **Ich schon.**" },
            { at: "r3", k: "pick", q: "Hardly to be believed:", o: ["Kaum zu glauben!", "Gar zu glauben!", "Also zu glauben!"], a: 0, why: "*hardly* is **kaum**." },
            { at: "r3", k: "pick", q: "So, let's go! → ___, gehen wir!", o: ["Also", "Auch", "Zwar"], a: 0, why: "*so, well* is **also**." },
            { at: "r4", k: "pick", q: "Das Auto ist ___ alt, aber es fährt gut.", o: ["zwar", "kaum", "also"], a: 0, why: "**zwar … aber**: admittedly … but." },
            { at: "r4", k: "order", q: "Build it: I'm coming tomorrow, at eight to be precise.", a: ["Ich komme morgen,", "und zwar", "um acht."], why: "**und zwar** gives the detail." },
            { at: "table", k: "pick", q: "Ich mag Käse. — Me too:", o: ["Ich auch.", "Ich auch nicht.", "Ich schon."], a: 0, why: "After a yes: **Ich auch.**" },
            { at: "trap", k: "pick", q: "*I also need a coffee:*", o: ["Ich brauche auch einen Kaffee.", "Ich brauche also einen Kaffee."], a: 0, why: "English *also* is **auch**." },
          ] },
      ],
      diag: [
        { t: "swap", from: "^ja$", to: "^doch$", rule: "short.doch", hard: true, msg: "The question has nicht or kein, so yes is **Doch!**" },
        { t: "swap", from: "^(doch|nein)$", to: "^ja$", rule: "short.doch", msg: "A plain question (no nicht, no kein): yes is **Ja**." },
        { t: "missing", whole: true, tok: "^nicht$", rule: "short.auch", msg: "After a no, *me neither* is Ich auch **nicht**." },
        { t: "extra", tok: "^nicht$", rule: "short.auch", msg: "After a yes, *me too* is just **Ich auch.**" },
        { t: "swap", from: "^auch$", to: "^(schon|also)$", rule: "", msg: "Here it's **{right}**." },
        { t: "swap", from: "^(auch|kaum|gar|also)$", to: "^zwar$", rule: "short.zwar", msg: "*admittedly … but* is **zwar** … aber." },
        { t: "missing", whole: true, tok: "^aber$", rule: "short.zwar", msg: "zwar needs its **aber**: zwar teuer, **aber** schön." },
      ],
      drills: [
        // ── our own: ja, nein or doch ──
        { id: "dshort.doch", t: "pick", title: "Ja, nein or doch?", how: "Answer yes or no as the second half says. Yes to a question with nicht or kein is Doch.", o: ["Ja", "Nein", "Doch"], items: [
          { q: "Hast du keinen Hunger? — ___, ich habe großen Hunger!", a: ["Doch"], r: ["short.doch"] },
          { q: "Hast du Hunger? — ___, ich habe großen Hunger!", a: ["Ja"], r: ["short.doch"] },
          { q: "Kommst du nicht mit? — ___, natürlich komme ich mit.", a: ["Doch"], r: ["short.doch"] },
          { q: "Kommst du nicht mit? — ___, ich muss leider arbeiten.", a: ["Nein"], r: ["short.doch"] },
          { q: "Gibt es hier keinen Bancomat? — ___, gleich um die Ecke.", a: ["Doch"], r: ["short.doch"] },
          { q: "Ist das dein Velo? — ___, das ist meins.", a: ["Ja"], r: ["short.doch"] },
          { q: "Du hast die Rechnung nicht bezahlt! — ___, gestern schon!", a: ["Doch"], r: ["short.doch"] },
          { q: "Magst du keine Schokolade? — ___, ich mag sie wirklich nicht.", a: ["Nein"], r: ["short.doch"] },
          { q: "Ist der Laden heute nicht offen? — ___, bis sechs Uhr.", a: ["Doch"], r: ["short.doch"] },
          { q: "Sprichst du Italienisch? — ___, ein bisschen.", a: ["Ja"], r: ["short.doch"] },
          { q: "Hast du den Schlüssel nicht? — ___, hier ist er.", a: ["Doch"], r: ["short.doch"] },
          { q: "Hast du keine Geschwister? — ___, ich bin Einzelkind.", a: ["Nein"], r: ["short.doch"] },
        ] },
        // ── our own: me too, me neither ──
        { id: "dshort.auch", t: "type", title: "Me too, me neither", how: "Answer in two or three words, as the English says.", items: [
          { q: "Ich trinke gern Tee. — (me too) ___", a: ["Ich auch."], r: ["short.auch"] },
          { q: "Ich trinke keinen Alkohol. — (me neither) ___", a: ["Ich auch nicht."], r: ["short.auch"] },
          { q: "Ich habe keine Lust auf Kino. — (I do) ___", a: ["Ich schon."], r: ["short.auch"] },
          { q: "Ich gehe gern wandern. — (I don't) ___", a: ["Ich nicht."], r: ["short.auch"] },
          { q: "Ich verstehe das nicht. — (me neither) ___", a: ["Ich auch nicht."], r: ["short.auch"] },
          { q: "Ich bin müde. — (me too) ___", a: ["Ich auch."], r: ["short.auch"] },
          { q: "Ich kann nicht Ski fahren. — (I can) ___", a: ["Ich schon."], r: ["short.auch"] },
          { q: "Ich arbeite am Samstag. — (I don't) ___", a: ["Ich nicht."], r: ["short.auch"] },
          { q: "Das Konzert war super. — (exactly) ___", a: ["Genau.", "Stimmt."], r: ["short.auch"] },
          { q: "Wir sollten früher losfahren. — (that's what I said) ___", a: ["Eben.", "Eben!", "Sag ich doch.", "Sag ich doch!"], r: ["short.auch"] },
        ] },
        // ── Übung 29•18: the word for emphasis ──
        { id: "d29.18", ex: "29.18", t: "pick", title: "Which word?", how: "also: so, well · gar: at all · kaum: hardly · wie: how · zwar: admittedly — and Doch!: yes, to a no.", o: ["also", "gar", "kaum", "wie", "zwar"], items: [
          { q: "___ lange dauert die Fahrt nach Chur?", a: ["wie"], r: ["short.emph"] },
          { q: "Ich kenne den Nachbarn ___, aber ich sehe ihn jeden Morgen.", a: ["kaum"], r: ["short.emph"] },
          { q: "Er ist erst zwanzig und schon Chef? ___ zu glauben!", a: ["kaum"], r: ["short.emph"] },
          { q: "Der Film war ___ nicht so schlecht.", a: ["gar"], r: ["short.emph"] },
          { q: "___, bis morgen! Schlaf gut!", a: ["also"], r: ["short.emph"] },
          { q: "Du hast keine Handschuhe dabei, oder? — ___! Sie sind in der Tasche.", o: ["Doch", "Gar", "Also"], a: ["Doch"], r: ["short.doch"] },
          { q: "Das Zimmer ist ___ klein, aber sehr hell.", a: ["zwar"], r: ["short.zwar"] },
          { q: "Ich habe heute ___ nichts gegessen.", a: ["gar"], r: ["short.emph"] },
          { q: "Ich komme am Freitag, und ___ mit dem Zug um sechs.", a: ["zwar"], r: ["short.zwar"] },
          { q: "Gefällt dir Bern? — Und ___!", a: ["wie"], r: ["short.emph"] },
          { q: "___, was machen wir jetzt?", a: ["also"], r: ["short.emph"] },
          { q: "Wir hatten ___ Zeit zum Essen, so viel Arbeit war es.", a: ["kaum"], r: ["short.emph"] },
        ] },
        // ── our own: zwar … aber ──
        { id: "dshort.zwar", t: "transform", fixed: true, title: "zwar … aber", how: "Join the two: admit the first point with zwar, then turn with aber.", items: [
          { q: "Die Wohnung ist teuer. Sie ist sehr schön.", a: ["Die Wohnung ist zwar teuer, aber sie ist sehr schön.", "Die Wohnung ist zwar teuer, aber sehr schön."], r: ["short.zwar"] },
          { q: "Das Auto ist alt. Es fährt gut.", a: ["Das Auto ist zwar alt, aber es fährt gut."], r: ["short.zwar"] },
          { q: "Ich habe wenig Zeit. Ich helfe dir.", a: ["Ich habe zwar wenig Zeit, aber ich helfe dir."], r: ["short.zwar"] },
          { q: "Der Kurs ist anstrengend. Er macht Spaß.", a: ["Der Kurs ist zwar anstrengend, aber er macht Spaß.", "Der Kurs ist zwar anstrengend, aber macht Spaß."], r: ["short.zwar"] },
          { q: "Es regnet. Wir gehen spazieren.", a: ["Es regnet zwar, aber wir gehen spazieren."], r: ["short.zwar"] },
          { q: "Mein Deutsch ist nicht perfekt. Ich verstehe viel.", a: ["Mein Deutsch ist zwar nicht perfekt, aber ich verstehe viel."], r: ["short.zwar"] },
          { q: "Das Hotel liegt weit weg. Es ist ruhig.", a: ["Das Hotel liegt zwar weit weg, aber es ist ruhig."], r: ["short.zwar"] },
          { q: "Sie wohnt in Basel. Sie arbeitet in Zürich.", a: ["Sie wohnt zwar in Basel, aber sie arbeitet in Zürich.", "Sie wohnt zwar in Basel, aber arbeitet in Zürich."], r: ["short.zwar"] },
          { q: "Ich komme morgen. Ich komme um acht. (und zwar)", a: ["Ich komme morgen, und zwar um acht."], r: ["short.zwar"] },
          { q: "Wir brauchen etwas. Wir brauchen Milch und Brot. (und zwar)", a: ["Wir brauchen etwas, und zwar Milch und Brot."], r: ["short.zwar"] },
        ] },
        // ── our own: the short reply ──
        { id: "dshort.resp", t: "respond", title: "Your reply", how: "Pick the short reply that fits.", items: [
          { q: "Du hast keine Zeit, oder?", o: ["Doch, für dich schon!", "Ja, für dich schon!", "Ich auch nicht."], a: ["Doch, für dich schon!"], r: ["short.doch"] },
          { q: "Ich habe gar keine Lust auf die Party.", o: ["Ich auch nicht.", "Ich auch.", "Doch!"], a: ["Ich auch nicht."], r: ["short.auch"] },
          { q: "Ich finde das Wetter heute herrlich!", o: ["Ich auch!", "Ich auch nicht!", "Doch!"], a: ["Ich auch!"], r: ["short.auch"] },
          { q: "Er hat die Prüfung mit einer Sechs bestanden!", o: ["Kaum zu glauben!", "Gar nicht!", "Ich auch nicht."], a: ["Kaum zu glauben!"], r: ["short.emph"] },
          { q: "Hat dir das Konzert gefallen?", o: ["Und wie!", "Ich auch nicht.", "Doch!"], a: ["Und wie!"], r: ["short.emph"] },
          { q: "Ich verstehe kein Wort Schweizerdeutsch.", o: ["Ich schon, ein bisschen.", "Doch, ein bisschen.", "Ich auch, ein bisschen."], a: ["Ich schon, ein bisschen."], r: ["short.auch"] },
          { q: "Wir müssen um sieben losfahren, sonst gibt es Stau.", o: ["Genau.", "Gar nicht.", "Ich auch nicht."], a: ["Genau."], r: ["short.auch"] },
          { q: "Bist du müde?", o: ["Gar nicht!", "Doch nicht!", "Und zwar!"], a: ["Gar nicht!"], r: ["short.emph"] },
          { q: "Hast du den Bus nicht verpasst?", o: ["Doch, leider.", "Ja, leider nicht.", "Ich auch."], a: ["Doch, leider."], r: ["short.doch"] },
          { q: "Wie bitte? Ich habe dich nicht verstanden.", o: ["Also, ich sage es noch einmal.", "Und wie!", "Ich schon."], a: ["Also, ich sage es noch einmal."], r: ["short.emph"] },
        ] },
        // ── Production ──
        { id: "dp.short", t: "translate", end: true, title: "Say it in German", how: "Translate. Keep it short, the way people talk.", items: [
          { q: "Aren't you hungry? — Yes, I am!", a: ["Hast du keinen Hunger? — Doch!", "Hast du keinen Hunger? — Doch, ich habe Hunger!"], r: ["short.doch"] },
          { q: "Me too.", a: ["Ich auch."], r: ["short.auch"] },
          { q: "Me neither.", a: ["Ich auch nicht."], r: ["short.auch"] },
          { q: "I do. (after a no)", a: ["Ich schon."], r: ["short.auch"] },
          { q: "Hard to believe!", a: ["Kaum zu glauben!"], r: ["short.emph"] },
          { q: "Not at all.", a: ["Gar nicht.", "Überhaupt nicht."], r: ["short.emph"] },
          { q: "So, see you tomorrow!", a: ["Also, bis morgen!", "Also, wir sehen uns morgen!"], r: ["short.emph"] },
          { q: "The flat is small, admittedly, but it's cheap.", a: ["Die Wohnung ist zwar klein, aber sie ist günstig.", "Die Wohnung ist zwar klein, aber günstig.", "Die Wohnung ist zwar klein, aber sie ist billig.", "Die Wohnung ist zwar klein, aber billig."], r: ["short.zwar"] },
          { q: "I'm coming on Monday, at nine to be precise.", a: ["Ich komme am Montag, und zwar um neun.", "Ich komme am Montag, und zwar um neun Uhr."], r: ["short.zwar"] },
          { q: "Did you like it? — And how!", a: ["Hat es dir gefallen? — Und wie!"], r: ["short.emph"] },
          { q: "I hardly slept.", a: ["Ich habe kaum geschlafen."], r: ["short.emph"] },
          { q: "Pardon? (I didn't hear you)", a: ["Wie bitte?"], r: ["short.emph"] },
        ] },
        // ── Übung 29•19: your own ──
        { id: "d29.19", ex: "29.19", t: "write", end: true, title: "Your own sentences", how: "Write a sentence or a short exchange with each word. Saved for Claude to correct.", items: [
          { q: "also", model: ["Also, ich fasse zusammen: Wir treffen uns um sieben am Bahnhof."], r: ["short.emph"] },
          { q: "doch (yes, to a no)", model: ["Du warst noch nie in Genf? — Doch, letztes Jahr!"], r: ["short.doch"] },
          { q: "gar", model: ["Ich habe gar keine Zeit, ich muss noch einkaufen."], r: ["short.emph"] },
          { q: "kaum", model: ["Der Bus war so voll, ich konnte mich kaum bewegen."], r: ["short.emph"] },
          { q: "wie", model: ["Wie lange wohnst du schon in der Schweiz?"], r: ["short.emph"] },
          { q: "zwar … aber", model: ["Mein Weg zur Arbeit ist zwar lang, aber ich kann im Zug lesen."], r: ["short.zwar"] },
          { q: "Ich auch nicht · Ich schon", model: ["Ich esse keinen Fisch. — Ich auch nicht. Aber Fleisch esse ich schon."], r: ["short.auch"] },
          { q: "und zwar", model: ["Ich brauche einen Termin, und zwar so schnell wie möglich."], r: ["short.zwar"] },
        ] },
      ],
    },
  },
});

// What chapter 29's emphasis words became (29•20 and 29•21, its set phrases, were Stage 1's).
cxCover({ "29.18": "d29.18", "29.19": "d29.19" });
