// ── COURSE PACK · Stage 0 · nicht or kein? (the pilot) ──
// Book: chapter 5 (Übung 5•4–5•10) and chapter 28 (28•2–28•4). Our own
// sheet and sentences; the book gives the structure only. Each drill set
// mirrors one book exercise ("d5.4" ↔ Übung 5•4), 10 items each; the
// section ends with its production drills (dp.neg, dw.neg).
//
// Item: { q, a: [accepted answers], r: [rules], hl?: the part to negate,
// o?: options (pick), w?: cue words (compose), model? / check? (write) }.
cxPack({
  id: "s0-negation",
  sections: {
    "s0.neg": {
      testout: { n: 8, miss: 1 },
      rules: {
        "neg.kein": "kein where ein or no article would be",
        "neg.kein-end": "kein takes ein's ending",
        "neg.nicht-pos": "where nicht goes",
        "neg.sondern": "nicht X, sondern Y",
      },
      sheets: [
        { id: "cx.neg1", title: "nicht or kein?", qn: 3,
          struct: [["ein … / no article", "thing"], ["→ kein", "end"], ["everything else", "verb"], ["→ nicht", "aux"]],
          why: "Two words for *not*: **kein** negates a noun that has **ein** or **no article** — it's the *not a / no* word. **nicht** negates everything else.",
          rid: ["neg.kein", "neg.kein-end", "neg.nicht-pos", "neg.sondern"],
          rules: [
            "**kein** goes where **ein** — or **no article** — would be: ein Auto → **kein** Auto · Zeit → **keine** Zeit · Ich bin Lehrer → Ich bin **kein** Lehrer. With der/die/das, mein…, a name, a verb or an adjective: **nicht**.",
            "kein takes the ending **ein** would have: einen Termin → **keinen** Termin · einem Kind → **keinem** Kind — and in the plural, where there's no ein: Kinder → **keine** Kinder.",
            "**nicht** goes **after** the verb, the object and the time — so a simple sentence often ends with it: Ich arbeite heute **nicht**. It goes **before** an adjective, a *how*, a place, a phrase with a preposition and the verb's second part: **nicht** teuer · **nicht** gut · **nicht** in Bern · **nicht** gekommen.",
            "To correct one thing, put **nicht** right **before it** and give the right one after **sondern**: Ich komme **nicht** heute, **sondern** morgen.",
          ],
          table: { head: ["You negate…", "nicht goes…", "Example"], rows: [
            ["the whole action", "at the end", "Heute arbeite ich **nicht**."],
            ["the object (den…, mein…)", "after it", "Ich kenne den Mann **nicht**."],
            ["the time (heute, morgen)", "after it", "Er kommt morgen **nicht**."],
            ["an adjective / how", "before it", "Das ist **nicht** teuer. · Sie fährt **nicht** schnell."],
            ["a place / a preposition", "before it", "Wir sind **nicht** zu Hause."],
            ["the verb's 2nd part", "before it", "Ich habe **nicht** geschlafen. · Ich kann **nicht** kommen."],
          ] },
          ex: [
            ["Ich habe **kein** Auto — ich fahre mit dem Zug.", "I don't have a car — I take the train."],
            ["Das ist **nicht** mein Handy.", "That's not my phone."],
            ["Am Sonntag arbeite ich **nicht**.", "I'm not working on Sunday."],
            ["Der Bus kommt heute **nicht** pünktlich.", "The bus isn't on time today."],
            ["Wir fahren **nicht** nach Bern, **sondern** nach Basel.", "We're not going to Bern but to Basel."],
          ],
          trap: "Never **nicht ein**: ~~Ich habe nicht ein Auto~~ → Ich habe **kein** Auto. And never **kein** before der/die/das: Das ist **nicht der** Bus nach Zürich.",
          quiz: [
            { at: "r1", k: "pick", q: "Heute habe ich ___ Zeit für Sport.", o: ["keine", "nicht", "nicht eine"], a: 0, why: "Zeit has no article → **keine** Zeit." },
            { at: "r1", k: "pick", q: "Ist das ___ dein Pass?", o: ["nicht", "kein", "keinen"], a: 0, why: "dein… is not ein: **nicht** dein Pass." },
            { at: "r1", k: "why", q: "Why **kein** in *Er ist kein Lehrer*?", o: ["A job said without an article is negated with kein", "Koch is masculine", "kein always goes before a person"], a: 0, why: "Er ist Lehrer — no article → kein Lehrer." },
            { at: "r2", k: "pick", q: "Wir haben ___ Hund. (der Hund · einen Hund)", o: ["keinen", "kein", "keine"], a: 0, why: "einen → **keinen**." },
            { at: "r2", k: "type", cx: true, q: "Sie hat Geschwister. → Sie hat ___ Geschwister.", a: ["keine"], r: ["neg.kein-end"], why: "Plural, no ein → **keine**." },
            { at: "r3", k: "order", q: "Build it: I'm not working today.", a: ["Heute", "arbeite", "ich", "nicht"], why: "The whole action: nicht at the end." },
            { at: "r3", k: "pick", q: "Which is right?", o: ["Wir sind heute nicht zu Hause.", "Wir sind heute zu Hause nicht."], a: 0, why: "nicht goes **before** a place." },
            { at: "r3", k: "pick", q: "Which is right?", o: ["Ich habe den Film nicht gesehen.", "Ich habe nicht den Film gesehen."], a: 0, why: "After the object, before the participle. (*nicht den Film* only with sondern …)" },
            { at: "r4", k: "pick", q: "Ich fahre ___ nach Bern, sondern nach Basel.", o: ["nicht", "kein", "keinen"], a: 0, why: "nicht right before the part you correct." },
            { at: "r4", k: "order", q: "Build it: I'm coming not today but tomorrow.", a: ["Ich", "komme", "nicht", "heute,", "sondern", "morgen"], why: "nicht before *heute*, then sondern + the right one." },
            { at: "table", k: "pick", q: "Which is right?", o: ["Das Essen ist nicht teuer.", "Das Essen ist teuer nicht."], a: 0, why: "Before an adjective." },
            { at: "table", k: "pick", q: "Which is right?", o: ["Ich kenne die Frau nicht.", "Ich kenne nicht die Frau."], a: 0, why: "After the object." },
            { at: "trap", k: "pick", q: "I don't have a car.", o: ["Ich habe kein Auto.", "Ich habe nicht ein Auto.", "Ich habe nicht Auto."], a: 0, why: "nicht + ein → **kein**." },
            { at: "trap", k: "pick", q: "That's not the bus to Zürich.", o: ["Das ist nicht der Bus nach Zürich.", "Das ist kein der Bus nach Zürich."], a: 0, why: "der Bus → **nicht** der Bus." },
          ] },
      ],
      // What a wrong answer gives away — the first that fits names the rule.
      diag: [
        { t: "seq", seq: ["nicht", "^(ein|eine|einen|einem|einer)$"], rule: "neg.kein", msg: "**nicht + ein** becomes **kein**: «{typed}» → kein…" },
        { t: "swap", from: "nicht", to: "^kein\\w*$", rule: "neg.kein", msg: "This noun has ein or no article: it's negated with **{right}**, not nicht." },
        { t: "swap", from: "^kein\\w*$", to: "nicht", rule: "neg.kein", msg: "**kein** only stands for ein (or no article). With der/die/das, mein…, a name or the verb: **nicht**." },
        { t: "ending", stem: "kein", rule: "neg.kein-end", msg: "Right word, wrong ending: **{right}** — kein takes the ending ein would have." },
        { t: "missing", tok: "sondern", rule: "neg.sondern", msg: "Correcting one thing: nicht X, **sondern** Y." },
        { t: "pos", tok: "nicht", rule: "neg.nicht-pos", msg: "**nicht** goes {where}." },
        { t: "missing", tok: "^(nicht|kein\\w*)$", rule: "neg.kein", msg: "It needs its negative: **nicht** or **kein**." },
      ],
      drills: [
        // ── Übung 5•6: fill in kein / nicht ──
        { id: "d5.6", ex: "5.6", t: "pick", title: "kein, keine, keinen or nicht?", how: "Fill the gap.", o: ["nicht", "kein", "keine", "keinen"], items: [
          { q: "Heute habe ich ___ Zeit für Sport.", a: ["keine"], r: ["neg.kein"] },
          { q: "Ist das ___ dein Pass?", a: ["nicht"], r: ["neg.kein"] },
          { q: "Meine Schwester ist ___ Ärztin, sie ist Lehrerin.", a: ["keine"], r: ["neg.kein"] },
          { q: "Meine Eltern leben ___ in der Schweiz.", a: ["nicht"], r: ["neg.kein", "neg.nicht-pos"] },
          { q: "Das ist ___ Problem!", a: ["kein"], r: ["neg.kein"] },
          { q: "Die Suppe ist ___ heiß genug.", a: ["nicht"], r: ["neg.kein", "neg.nicht-pos"] },
          { q: "Hast du ___ Hunger?", a: ["keinen"], r: ["neg.kein", "neg.kein-end"] },
          { q: "Ich kaufe heute ___ Brot, wir haben noch genug.", a: ["kein"], r: ["neg.kein"] },
          { q: "Fährt dieser Zug ___ nach Bern?", a: ["nicht"], r: ["neg.kein"] },
          { q: "In unserer Straße gibt es ___ Bäckerei.", a: ["keine"], r: ["neg.kein"] },
        ] },
        // ── Übung 5•10: kein with ein's ending ──
        { id: "d5.10", ex: "5.10", t: "type", title: "kein with the right ending", how: "Write the form of kein.", items: [
          { q: "Ich habe einen Termin. → Ich habe ___ Termin.", a: ["keinen"], r: ["neg.kein-end"] },
          { q: "Er hat eine Wohnung in Bern. → Er hat ___ Wohnung in Bern.", a: ["keine"], r: ["neg.kein-end"] },
          { q: "Wir haben ein Auto. → Wir haben ___ Auto.", a: ["kein"], r: ["neg.kein-end"] },
          { q: "Sie hilft einem Kind. → Sie hilft ___ Kind.", a: ["keinem"], r: ["neg.kein-end"] },
          { q: "Ich schreibe einer Freundin. → Ich schreibe ___ Freundin.", a: ["keiner"], r: ["neg.kein-end"] },
          { q: "Hier gibt es einen Bahnhof. → Hier gibt es ___ Bahnhof.", a: ["keinen"], r: ["neg.kein-end"] },
          { q: "Er trinkt Bier. → Er trinkt ___ Bier.", a: ["kein"], r: ["neg.kein", "neg.kein-end"] },
          { q: "Wir kaufen Äpfel. → Wir kaufen ___ Äpfel.", a: ["keine"], r: ["neg.kein-end"] },
          { q: "Wir haben einen Balkon. → Wir haben ___ Balkon.", a: ["keinen"], r: ["neg.kein-end"] },
          { q: "Sie hat eine Katze. → Sie hat ___ Katze.", a: ["keine"], r: ["neg.kein-end"] },
        ] },
        // ── Übung 5•4: add kein ──
        { id: "d5.4", ex: "5.4", t: "transform", title: "Say it with kein", how: "Make it negative with kein.", d: ["nicht", "keinen", "keine", "kein"], items: [
          { q: "Ich habe ein Fahrrad.", a: ["Ich habe kein Fahrrad."], r: ["neg.kein"] },
          { q: "Mein Bruder ist Lehrer.", a: ["Mein Bruder ist kein Lehrer."], r: ["neg.kein"], cap: true },
          { q: "Am Abend habe ich Zeit.", a: ["Am Abend habe ich keine Zeit."], r: ["neg.kein"] },
          { q: "Das ist eine gute Idee.", a: ["Das ist keine gute Idee."], r: ["neg.kein"] },
          { q: "Sie hat Kinder.", a: ["Sie hat keine Kinder."], r: ["neg.kein", "neg.kein-end"] },
          { q: "Ich brauche einen Stuhl.", a: ["Ich brauche keinen Stuhl."], r: ["neg.kein", "neg.kein-end"] },
          { q: "Hast du heute Unterricht?", a: ["Hast du heute keinen Unterricht?"], r: ["neg.kein", "neg.kein-end"] },
          { q: "Meine Schwester ist Studentin.", a: ["Meine Schwester ist keine Studentin."], r: ["neg.kein"] },
          { q: "In der Küche gibt es ein Fenster.", a: ["In der Küche gibt es kein Fenster."], r: ["neg.kein"] },
          { q: "Morgen habe ich einen Arzttermin.", a: ["Morgen habe ich keinen Arzttermin."], r: ["neg.kein", "neg.kein-end"] },
        ] },
        // ── Übung 5•5: add nicht ──
        { id: "d5.5", ex: "5.5", t: "transform", title: "Say it with nicht", how: "Make it negative with nicht.", d: ["kein", "keine"], items: [
          { q: "Der Zug ist pünktlich.", a: ["Der Zug ist nicht pünktlich."], r: ["neg.nicht-pos"] },
          { q: "Meine Eltern wohnen in Basel.", a: ["Meine Eltern wohnen nicht in Basel."], r: ["neg.nicht-pos"] },
          { q: "Das ist mein Schlüssel.", a: ["Das ist nicht mein Schlüssel."], r: ["neg.kein", "neg.nicht-pos"] },
          { q: "Ich finde meinen Schlüssel.", a: ["Ich finde meinen Schlüssel nicht."], r: ["neg.nicht-pos"] },
          { q: "Das Wetter wird besser.", a: ["Das Wetter wird nicht besser."], r: ["neg.nicht-pos"] },
          { q: "Ist der Arzt heute in der Praxis?", a: ["Ist der Arzt heute nicht in der Praxis?"], r: ["neg.nicht-pos"] },
          { q: "Ich kenne die Frau.", a: ["Ich kenne die Frau nicht."], r: ["neg.nicht-pos"] },
          { q: "Der neue Kollege heißt Marco.", a: ["Der neue Kollege heißt nicht Marco."], r: ["neg.kein", "neg.nicht-pos"] },
          { q: "Mein Urlaub ist im Juli.", a: ["Mein Urlaub ist nicht im Juli."], r: ["neg.nicht-pos"] },
          { q: "Sie arbeitet heute.", a: ["Sie arbeitet heute nicht."], r: ["neg.nicht-pos"] },
        ] },
        // ── Übung 28•2: negate the highlighted part with nicht ──
        { id: "d28.2", ex: "28.2", t: "transform", title: "nicht for the highlighted part", how: "Negate the highlighted part with nicht.", d: ["kein", "keinen"], items: [
          { q: "Wir haben den richtigen Bus genommen.", hl: "den richtigen Bus", a: ["Wir haben nicht den richtigen Bus genommen."], r: ["neg.nicht-pos"] },
          { q: "Der Brief ist gestern angekommen.", hl: "angekommen", a: ["Der Brief ist gestern nicht angekommen."], r: ["neg.nicht-pos"] },
          { q: "Er will mir helfen.", hl: "helfen", a: ["Er will mir nicht helfen."], r: ["neg.nicht-pos"] },
          { q: "Die Kinder spielen im Garten.", hl: "im Garten", a: ["Die Kinder spielen nicht im Garten."], r: ["neg.nicht-pos"] },
          { q: "Das Hotel ist teuer.", hl: "teuer", a: ["Das Hotel ist nicht teuer."], r: ["neg.nicht-pos"] },
          { q: "Der Laden ist sonntags offen.", hl: "offen", a: ["Der Laden ist sonntags nicht offen."], r: ["neg.nicht-pos"] },
          { q: "Sie hat ihren Freund angerufen.", hl: "angerufen", a: ["Sie hat ihren Freund nicht angerufen."], r: ["neg.nicht-pos"] },
          { q: "Das Wasser ist warm genug.", hl: "warm genug", a: ["Das Wasser ist nicht warm genug."], r: ["neg.nicht-pos"] },
          { q: "Wir gehen heute ins Kino.", hl: "ins Kino", a: ["Wir gehen heute nicht ins Kino."], r: ["neg.nicht-pos"] },
          { q: "Ich verstehe die Frage.", hl: "verstehe", a: ["Ich verstehe die Frage nicht."], r: ["neg.nicht-pos"] },
        ] },
        // ── Übung 28•3: negate the highlighted part with kein ──
        { id: "d28.3", ex: "28.3", t: "transform", title: "kein for the highlighted part", how: "Negate the highlighted part with the right form of kein.", d: ["nicht", "kein", "keine", "keinen"], items: [
          { q: "Am Abend trinke ich Kaffee.", hl: "Kaffee", a: ["Am Abend trinke ich keinen Kaffee."], r: ["neg.kein", "neg.kein-end"] },
          { q: "Wir haben Bücher gekauft.", hl: "Bücher", a: ["Wir haben keine Bücher gekauft."], r: ["neg.kein", "neg.kein-end"] },
          { q: "Meine Freundin hat einen Bruder in Genf.", hl: "einen Bruder", a: ["Meine Freundin hat keinen Bruder in Genf."], r: ["neg.kein-end"] },
          { q: "Sie hat ein Wort verstanden.", hl: "ein Wort", a: ["Sie hat kein Wort verstanden."], r: ["neg.kein"] },
          { q: "Im Dorf gibt es eine Apotheke.", hl: "eine Apotheke", a: ["Im Dorf gibt es keine Apotheke."], r: ["neg.kein"] },
          { q: "Am Samstag haben wir viel Zeit.", hl: "viel Zeit", a: ["Am Samstag haben wir keine Zeit."], r: ["neg.kein"], note: "viel goes: *keine Zeit* is already all of it." },
          { q: "Sie isst Fleisch.", hl: "Fleisch", a: ["Sie isst kein Fleisch."], r: ["neg.kein"] },
          { q: "Wir brauchen eine Pause.", hl: "eine Pause", a: ["Wir brauchen keine Pause."], r: ["neg.kein"] },
          { q: "Hier gibt es einen Supermarkt.", hl: "einen Supermarkt", a: ["Hier gibt es keinen Supermarkt."], r: ["neg.kein-end"] },
          { q: "Er hat Hunger.", hl: "Hunger", a: ["Er hat keinen Hunger."], r: ["neg.kein", "neg.kein-end"] },
        ] },
        // ── Übung 28•4: kein or nicht, whichever fits ──
        { id: "d28.4", ex: "28.4", t: "transform", title: "kein or nicht?", how: "Negate the highlighted part — with kein or nicht, whichever fits.", d: ["nicht", "kein", "keine", "keinen"], items: [
          { q: "Meine Kollegin kommt heute mit.", hl: "kommt", a: ["Meine Kollegin kommt heute nicht mit."], r: ["neg.kein", "neg.nicht-pos"] },
          { q: "Wir gehen in die Bibliothek.", hl: "in die Bibliothek", a: ["Wir gehen nicht in die Bibliothek."], r: ["neg.kein", "neg.nicht-pos"] },
          { q: "Ich habe einen Computer zu Hause.", hl: "einen Computer", a: ["Ich habe keinen Computer zu Hause."], r: ["neg.kein", "neg.kein-end"] },
          { q: "Das ist der schnellste Zug.", hl: "der schnellste Zug", a: ["Das ist nicht der schnellste Zug."], r: ["neg.kein"] },
          { q: "Ein Kunde hat angerufen.", hl: "Ein Kunde", a: ["Kein Kunde hat angerufen."], r: ["neg.kein"], cap: true },
          { q: "Das Internet ist schnell.", hl: "schnell", a: ["Das Internet ist nicht schnell."], r: ["neg.kein", "neg.nicht-pos"] },
          { q: "Er braucht eine neue Wohnung.", hl: "eine neue Wohnung", a: ["Er braucht keine neue Wohnung."], r: ["neg.kein"] },
          { q: "Wir wohnen in der Nähe.", hl: "in der Nähe", a: ["Wir wohnen nicht in der Nähe."], r: ["neg.kein", "neg.nicht-pos"] },
          { q: "Ich trinke Milch.", hl: "Milch", a: ["Ich trinke keine Milch."], r: ["neg.kein"] },
          { q: "Sie hat den Termin vergessen.", hl: "vergessen", a: ["Sie hat den Termin nicht vergessen."], r: ["neg.kein", "neg.nicht-pos"] },
        ] },
        // ── Übung 5•8: nicht in longer sentences ──
        { id: "d5.8", ex: "5.8", t: "transform", title: "nicht in longer sentences", how: "Put nicht in the right place.", d: ["kein"], items: [
          { q: "Wir können am Abend lange draußen sitzen.", a: ["Wir können am Abend nicht lange draußen sitzen."], r: ["neg.nicht-pos"] },
          { q: "Wir haben den Film gesehen.", a: ["Wir haben den Film nicht gesehen."], r: ["neg.nicht-pos"] },
          { q: "Er spricht gut Deutsch.", a: ["Er spricht nicht gut Deutsch."], r: ["neg.nicht-pos"] },
          { q: "Sie will am Wochenende arbeiten.", a: ["Sie will am Wochenende nicht arbeiten."], r: ["neg.nicht-pos"] },
          { q: "Der Bus fährt schnell.", a: ["Der Bus fährt nicht schnell."], r: ["neg.nicht-pos"] },
          { q: "Ich rufe dich morgen an.", a: ["Ich rufe dich morgen nicht an."], r: ["neg.nicht-pos"] },
          { q: "Die Kinder sind gestern in die Schule gegangen.", a: ["Die Kinder sind gestern nicht in die Schule gegangen."], r: ["neg.nicht-pos"] },
          { q: "Du musst das Formular ausfüllen.", a: ["Du musst das Formular nicht ausfüllen."], r: ["neg.nicht-pos"] },
          { q: "Wir fahren im Sommer nach Italien.", a: ["Wir fahren im Sommer nicht nach Italien."], r: ["neg.nicht-pos"] },
          { q: "Ich habe gut geschlafen.", a: ["Ich habe nicht gut geschlafen."], r: ["neg.nicht-pos"] },
        ] },
        // ── Übung 5•9: nicht …, sondern … ──
        { id: "d5.9", ex: "5.9", t: "transform", title: "nicht …, sondern …", how: "Correct it: nicht before the wrong part, then sondern and the cue.", d: ["aber", "kein"], items: [
          { q: "Ich komme am Montag. (→ am Freitag)", a: ["Ich komme nicht am Montag, sondern am Freitag."], r: ["neg.sondern"] },
          { q: "Wir fahren nach Bern. (→ nach Luzern)", a: ["Wir fahren nicht nach Bern, sondern nach Luzern."], r: ["neg.sondern"] },
          { q: "Sie trinkt den Kaffee. (→ den Tee)", a: ["Sie trinkt nicht den Kaffee, sondern den Tee."], r: ["neg.sondern"] },
          { q: "Er arbeitet in Zürich. (→ in Winterthur)", a: ["Er arbeitet nicht in Zürich, sondern in Winterthur."], r: ["neg.sondern"] },
          { q: "Das ist mein Handy. (→ dein Handy)", a: ["Das ist nicht mein Handy, sondern dein Handy.", "Das ist nicht mein Handy, sondern deins."], r: ["neg.sondern"] },
          { q: "Ich nehme den Bus. (→ den Zug)", a: ["Ich nehme nicht den Bus, sondern den Zug."], r: ["neg.sondern"] },
          { q: "Der Kurs beginnt um acht. (→ um neun)", a: ["Der Kurs beginnt nicht um acht, sondern um neun."], r: ["neg.sondern"] },
          { q: "Wir essen heute zu Hause. (→ im Restaurant)", a: ["Wir essen heute nicht zu Hause, sondern im Restaurant."], r: ["neg.sondern", "neg.nicht-pos"] },
          { q: "Sie wohnt bei ihren Eltern. (→ bei einer Freundin)", a: ["Sie wohnt nicht bei ihren Eltern, sondern bei einer Freundin."], r: ["neg.sondern"] },
          { q: "Ich trinke Tee. (→ Kaffee)", a: ["Ich trinke keinen Tee, sondern Kaffee."], r: ["neg.sondern", "neg.kein", "neg.kein-end"], note: "Tee has no article — so it's **keinen** Tee, sondern …" },
        ] },
        // ── Übung 5•7: answer with Nein ──
        { id: "d5.7", ex: "5.7", t: "answer", title: "Answer with Nein", how: "Answer in a whole sentence, starting with Nein — kein or nicht.", items: [
          { q: "Hast du ein Auto?", a: ["Nein, ich habe kein Auto.", "Nein, ich habe keins."], r: ["neg.kein"] },
          { q: "Ist das dein Schlüssel?", a: ["Nein, das ist nicht mein Schlüssel.", "Nein, das ist nicht meiner."], r: ["neg.kein"] },
          { q: "Ist sie Lehrerin?", a: ["Nein, sie ist keine Lehrerin."], r: ["neg.kein"] },
          { q: "Wohnt ihr in Bern?", a: ["Nein, wir wohnen nicht in Bern.", "Nein, wir wohnen nicht dort."], r: ["neg.kein", "neg.nicht-pos"] },
          { q: "Hast du am Wochenende Zeit?", a: ["Nein, ich habe am Wochenende keine Zeit.", "Nein, am Wochenende habe ich keine Zeit.", "Nein, ich habe keine Zeit."], r: ["neg.kein"] },
          { q: "Kommt der Zug pünktlich?", a: ["Nein, der Zug kommt nicht pünktlich.", "Nein, er kommt nicht pünktlich.", "Nein, der Zug ist nicht pünktlich.", "Nein, er ist nicht pünktlich."], r: ["neg.nicht-pos"] },
          { q: "Habt ihr Kinder?", a: ["Nein, wir haben keine Kinder."], r: ["neg.kein", "neg.kein-end"] },
          { q: "Kennst du den Mann?", a: ["Nein, ich kenne den Mann nicht.", "Nein, ich kenne ihn nicht."], r: ["neg.nicht-pos"] },
          { q: "Ist es heute kalt?", a: ["Nein, es ist heute nicht kalt.", "Nein, heute ist es nicht kalt.", "Nein, es ist nicht kalt."], r: ["neg.nicht-pos"] },
          { q: "Möchten Sie einen Kaffee?", a: ["Nein, ich möchte keinen Kaffee.", "Nein, danke, ich möchte keinen Kaffee."], r: ["neg.kein", "neg.kein-end"] },
        ] },
        // ── Production: build and translate ──
        { id: "dp.neg", t: "compose", end: true, title: "Build it yourself", how: "Make a sentence from the words — conjugate, add the endings.", d: ["kein", "keine", "keinen", "nicht"], items: [
          { w: ["heute", "ich", "haben", "kein", "Zeit"], a: ["Ich habe heute keine Zeit.", "Heute habe ich keine Zeit."], r: ["neg.kein", "neg.kein-end"] },
          { w: ["wir", "fahren", "morgen", "nicht", "nach Luzern"], a: ["Wir fahren morgen nicht nach Luzern.", "Morgen fahren wir nicht nach Luzern."], r: ["neg.nicht-pos"] },
          { w: ["mein Bruder", "sein", "kein", "Student"], a: ["Mein Bruder ist kein Student."], r: ["neg.kein"], cap: true },
          { w: ["ich", "kennen", "die Lehrerin", "nicht"], a: ["Ich kenne die Lehrerin nicht."], r: ["neg.nicht-pos"] },
          { w: ["er", "können", "heute", "nicht", "kommen"], a: ["Er kann heute nicht kommen.", "Heute kann er nicht kommen."], r: ["neg.nicht-pos"] },
          { k: "translate", q: "I don't have a car.", a: ["Ich habe kein Auto.", "Ich habe keinen Wagen."], r: ["neg.kein"] },
          { k: "translate", q: "We're not at home today.", a: ["Wir sind heute nicht zu Hause.", "Heute sind wir nicht zu Hause."], r: ["neg.nicht-pos"] },
          { k: "translate", q: "That's not my ticket.", a: ["Das ist nicht mein Ticket.", "Das ist nicht meine Fahrkarte."], r: ["neg.kein"] },
          { k: "translate", q: "She doesn't drink coffee, but tea.", a: ["Sie trinkt keinen Kaffee, sondern Tee.", "Sie trinkt nicht Kaffee, sondern Tee."], r: ["neg.sondern", "neg.kein-end"] },
          { k: "translate", q: "I didn't sleep well.", a: ["Ich habe nicht gut geschlafen."], r: ["neg.nicht-pos"] },
        ] },
        // ── Production: write your own ──
        { id: "dw.neg", t: "write", end: true, title: "Write your own", how: "In your own words — saved for Claude to correct.", items: [
          { q: "Three things you don't have at home — use kein.", model: ["Ich habe keinen Fernseher, kein Auto und keine Katze."], check: ["kein / keine / keinen fits each noun", "no ein next to kein", "the verb is second"], r: ["neg.kein", "neg.kein-end"] },
          { q: "Tell a friend two things you're NOT doing this weekend — with nicht.", model: ["Am Samstag arbeite ich nicht. Ich fahre nicht nach Zürich, ich bleibe zu Hause."], check: ["nicht at the end, or before the place", "the verb is second"], r: ["neg.nicht-pos"] },
          { q: "Someone thinks you live in Bern. Correct them (nicht …, sondern …).", model: ["Ich wohne nicht in Bern, sondern in Zürich."], check: ["nicht right before in Bern", "a comma before sondern"], r: ["neg.sondern"] },
          { q: "Describe your street: one thing it has, two it doesn't.", model: ["In meiner Straße gibt es einen Supermarkt, aber keine Apotheke und keinen Park."], check: ["es gibt + kein…", "kein takes ein's ending"], r: ["neg.kein", "neg.kein-end"] },
          { q: "At the doctor's: say two symptoms you DON'T have.", model: ["Ich habe kein Fieber und keine Kopfschmerzen."], check: ["kein + noun", "keine for plural / feminine"], r: ["neg.kein", "neg.kein-end"] },
          { q: "Your train is late. Write two sentences about it with nicht.", model: ["Der Zug kommt nicht pünktlich. Ich komme heute nicht pünktlich ins Büro."], check: ["nicht before pünktlich / the place", "the verb is second"], r: ["neg.nicht-pos"] },
          { q: "Answer an invitation: you can't come on Friday, but on Saturday.", model: ["Am Freitag kann ich leider nicht kommen, aber am Samstag habe ich Zeit."], check: ["nicht before kommen", "the verb is second after Am Freitag"], r: ["neg.nicht-pos"] },
          { q: "Say what you don't eat or drink, and what you have instead (sondern).", model: ["Ich esse kein Fleisch, sondern Gemüse, und ich trinke keinen Wein."], check: ["kein + noun", "sondern after a negative"], r: ["neg.kein", "neg.sondern"] },
        ] },
      ],
    },
    // The verb track's Präsens sheets: what the engine generates for them.
    "s0.verbs": {
      drills: [
        { id: "d5.1", ex: "5.1", also: ["5.3"], t: "type", title: "sein · haben · werden", how: "Write the verb's form.", gen: { kind: "conj", verbs: ["sein", "haben", "werden"], tense: "pr" }, n: 10, r: ["gs:pr3.r1", "gs:pr3.r2", "gs:pr5.lines"] },
      ],
    },
  },
});

// What each exercise of chapters 5 and 28 became (the book map).
cxCover({
  "5.1": { st: "generated", set: "d5.1" },
  "5.2": { st: "planned", sec: "s0.v2q" }, "5.3": { st: "generated", set: "d5.1" },
  "5.4": "d5.4", "5.5": "d5.5", "5.6": "d5.6", "5.7": "d5.7", "5.8": "d5.8", "5.9": "d5.9", "5.10": "d5.10",
  "5.11": { st: "planned", sec: "s1.neg2" },
  "28.1": { st: "planned", sec: "s1.front" },
  "28.2": "d28.2", "28.3": "d28.3", "28.4": "d28.4",
  "28.5": { st: "planned", sec: "s1.neg2" },
  "28.6": { st: "planned", sec: "s1.front" }, "28.7": { st: "planned", sec: "s1.front" }, "28.8": { st: "planned", sec: "s1.front" },
  "28.9": { st: "planned", sec: "s1.front" }, "28.10": { st: "planned", sec: "s1.front" },
  "28.11": { st: "planned", sec: "s0.v2q" }, "28.12": { st: "planned", sec: "s0.v2q" },
  "28.13": { st: "planned", sec: "s1.wer" }, "28.14": { st: "planned", sec: "s1.wer" },
  "28.15": { st: "planned", sec: "s2.woda" }, "28.16": { st: "planned", sec: "s0.wq" }, "28.17": { st: "planned", sec: "s0.wq" },
  "28.18": { st: "planned", sec: "s2.woda" }, "28.19": { st: "planned", sec: "s2.woda" }, "28.20": { st: "planned", sec: "s2.woda" }, "28.21": { st: "planned", sec: "s2.woda" },
});
