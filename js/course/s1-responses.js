// ── COURSE PACK · Stage 1 · Set responses and greetings ──
// Book: chapter 29 "Short responses" and "Pat phrases" (Übung 29•20 ·
// 29•21); chapter 30's "Greetings and introductions" has no exercise —
// its dialogues are the conversation units' (Session 8). Two sheets, early
// on purpose: they feed the speaking sessions. Hello, thanks, sorry and
// good wishes — then the short answers (Gern! Leider nicht. Keine Ahnung.).
// The rest of chapter 29 waits for its lessons (below).
cxPack({
  id: "s1-responses",
  sections: {
    "s1.resp": {
      // (no test-out after Stage 0 — sized so a check of every rule fits)
      testout: { n: 7, miss: 1 },
      rules: {
        "resp.hello": "hello and goodbye: Guten Tag, Tschüss, bis bald",
        "resp.how": "Wie geht es Ihnen? — Gut, danke. Und Ihnen?",
        "resp.thanks": "Danke — bitte · Entschuldigung — kein Problem",
        "resp.wish": "good wishes — Danke, gleichfalls!",
        "resp.yes": "yes, gladly: Gern! Klar! Natürlich!",
        "resp.no": "no, or not sure: Leider nicht. Keine Ahnung.",
        "resp.react": "reacting: Super! Echt? Schade! Das tut mir leid.",
      },
      sheets: [
        { id: "cx.resp1", title: "Hello, thanks, sorry — and good wishes", qn: 3,
          struct: [["they say …", "verb"], ["→", "mid"], ["you answer …", "who"]],
          why: "Every conversation opens and closes with a few fixed lines. Learn them as pairs: what people say — and what you say back.",
          rid: ["resp.hello", "resp.how", "resp.thanks", "resp.wish"],
          rules: [
            "Hello: **Guten Morgen · Guten Tag · Guten Abend · Hallo** (friends). Goodbye: **Auf Wiedersehen · Tschüss** (friends) · **Bis später · Bis morgen · Bis bald**. Going to bed: **Gute Nacht**.",
            "**Wie geht es Ihnen?** (Sie) · **Wie geht's?** (du) — **Gut, danke. Und Ihnen? / Und dir?** · Sehr gut · Es geht (so-so) · Nicht so gut. Meeting someone new: **Freut mich!** — Mich auch.",
            "Thanks: **Danke (schön)!** — **Bitte (schön)!** · **Gern geschehen!** · **Keine Ursache!** Sorry: **Entschuldigung!** · **Es tut mir leid.** — **Kein Problem!** · **Das macht nichts.**",
            "Wishes — and the answer: **Schönes Wochenende! · Schönen Abend!** — **Danke, gleichfalls!** (or ebenfalls). **Gute Besserung!** (get well) · **Viel Glück!** · **Viel Spaß!** · **Gute Reise!** · **Herzlichen Glückwunsch!** · **Guten Appetit!**",
          ],
          table: { head: ["they say", "you answer"], rows: [
            ["Wie geht es Ihnen?", "Gut, danke. Und **Ihnen**?"],
            ["Danke für die Hilfe!", "**Gern geschehen!**"],
            ["Entschuldigung, ich bin spät.", "**Kein Problem.**"],
            ["Schönes Wochenende!", "Danke, **gleichfalls**!"],
            ["Ich bin krank.", "Oh, **gute Besserung**!"],
          ] },
          ex: [
            ["Guten Tag, Frau Meier! Wie geht es Ihnen?", "Hello, Mrs Meier! How are you?"],
            ["Danke für die Blumen! — **Gern geschehen.**", "Thank you for the flowers! — You're welcome."],
            ["Entschuldigung, ist hier noch frei? — Ja, bitte.", "Excuse me, is this seat free? — Yes, please."],
            ["Schönen Abend noch! — **Danke, gleichfalls!**", "Have a nice evening! — Thanks, you too!"],
          ],
          trap: "**Bitte** does three jobs: *please* (Einen Kaffee, **bitte**), *you're welcome* (Danke! — **Bitte!**) and *here you are* (**Bitte schön**). And **Gute Nacht** is only for going to bed — in the evening you say **Guten Abend**.",
          quiz: [
            { at: "r1", k: "pick", q: "It's eight in the morning, at the office. You say…", o: ["Guten Morgen!", "Gute Nacht!", "Guten Abend!"], a: 0, why: "In the morning: **Guten Morgen**." },
            { at: "r1", k: "pick", q: "You leave a friend you'll see tomorrow:", o: ["Bis morgen!", "Guten Tag!", "Freut mich!"], a: 0, why: "See you tomorrow: **Bis morgen!**" },
            { at: "r2", k: "pick", q: "Wie geht es Ihnen? — Gut, danke. Und ___?", o: ["Ihnen", "dir", "Sie"], a: 0, why: "Back to someone you call Sie: **Und Ihnen?**" },
            { at: "r2", k: "pick", q: "Wie geht's? — ___ (so-so)", o: ["Es geht.", "Es tut mir leid.", "Gern geschehen."], a: 0, why: "So-so: **Es geht.**" },
            { at: "r3", k: "pick", q: "Vielen Dank für die Hilfe! — ___", o: ["Gern geschehen!", "Gleichfalls!", "Gute Besserung!"], a: 0, why: "The answer to thanks: **Gern geschehen!**" },
            { at: "r3", k: "pick", q: "Entschuldigung, ich bin zu spät. — ___", o: ["Kein Problem.", "Gern geschehen.", "Viel Glück!"], a: 0, why: "The answer to sorry: **Kein Problem.**" },
            { at: "r4", k: "pick", q: "Schönes Wochenende! — ___", o: ["Danke, gleichfalls!", "Bitte schön!", "Freut mich!"], a: 0, why: "Wish it back: **gleichfalls**." },
            { at: "r4", k: "pick", q: "Your colleague has a cold. You say…", o: ["Gute Besserung!", "Guten Appetit!", "Viel Spaß!"], a: 0, why: "Get well soon: **Gute Besserung!**" },
            { at: "table", k: "type", cx: true, q: "Danke! — ___! (you're welcome)", a: ["Bitte", "Bitte schön", "Gern geschehen", "Gern", "Gerne", "Keine Ursache"], r: ["resp.thanks"], why: "**Bitte!** or **Gern geschehen!**" },
            { at: "trap", k: "pick", q: "Seven in the evening, you meet your neighbour:", o: ["Guten Abend!", "Gute Nacht!"], a: 0, why: "Gute Nacht is for going to bed." },
          ] },
        { id: "cx.resp2", title: "Short answers: Gern! Leider nicht. Keine Ahnung.", qn: 3,
          struct: [["Gern!", "who"], ["·", "mid"], ["Leider nicht.", "end"], ["·", "mid"], ["Echt?", "aux"]],
          why: "In conversation most answers are two words long. A handful of short replies make you sound natural — and buy you time to think.",
          rid: ["resp.yes", "resp.no", "resp.react"],
          rules: [
            "Yes, gladly: **Gern! · Gerne! · Klar! · Natürlich! · Selbstverständlich!** (of course — polite) · **Genau!** (exactly) · **Stimmt!** (that's right) · **Einverstanden.** (agreed)",
            "No, or not sure: **Leider nicht.** · **Nein, danke.** · **Überhaupt nicht.** · **Keine Ahnung.** (no idea) · **Das kommt darauf an.** (it depends) · **Vielleicht.** · **Mal sehen.** (we'll see)",
            "Reacting to news — good: **Super! · Toll! · Wunderbar! · Das freut mich!** · surprising: **Wirklich? · Echt? · Unglaublich!** · bad: **Schade! · Oh nein! · Das tut mir leid.**",
          ],
          table: { head: ["they say", "you can answer"], rows: [
            ["Kommst du mit ins Kino?", "**Gern!** · **Leider nicht.**"],
            ["Wann fährt der letzte Bus?", "**Keine Ahnung.**"],
            ["Gehst du am Samstag wandern?", "**Das kommt darauf an.**"],
            ["Ich habe eine neue Stelle!", "**Super!** · **Das freut mich!**"],
            ["Das Konzert fällt aus.", "**Schade!**"],
          ] },
          ex: [
            ["Hilfst du mir kurz? — **Klar!**", "Will you help me for a moment? — Sure!"],
            ["Weißt du, wo Tom ist? — **Keine Ahnung.**", "Do you know where Tom is? — No idea."],
            ["Wir haben eine Wohnung gefunden! — **Toll!**", "We've found a flat! — Great!"],
            ["Der Zug fällt aus. — **Echt?** So ein Pech!", "The train is cancelled. — Really? What bad luck!"],
          ],
          trap: "**Das tut mir leid** is for bad news — not for *excuse me* on the tram: to get past or to ask, say **Entschuldigung**. And **Schade** (what a pity) is for small letdowns; to really sad news you say **Das tut mir leid.**",
          quiz: [
            { at: "r1", k: "pick", q: "Möchtest du einen Kaffee? — ___", o: ["Gern!", "Schade!", "Keine Ahnung."], a: 0, why: "Yes, please: **Gern!**" },
            { at: "r1", k: "pick", q: "Kannst du mir helfen? — ___", o: ["Klar!", "Gute Besserung!", "Unglaublich!"], a: 0, why: "Sure: **Klar!**" },
            { at: "r2", k: "pick", q: "Wie viel kostet das Ticket? — ___", o: ["Keine Ahnung.", "Gern geschehen.", "Gleichfalls."], a: 0, why: "No idea: **Keine Ahnung.**" },
            { at: "r2", k: "pick", q: "Gehst du morgen joggen? — Das ___ darauf an.", o: ["kommt", "geht", "ist"], a: 0, why: "It depends: Das **kommt** darauf an." },
            { at: "r3", k: "pick", q: "Ich habe die Prüfung bestanden! — ___", o: ["Super!", "Schade!", "Das tut mir leid."], a: 0, why: "Good news: **Super!**" },
            { at: "r3", k: "pick", q: "Jemand hat mein Velo gestohlen. — ___", o: ["Oh nein! Das tut mir leid.", "Toll!", "Gern!"], a: 0, why: "Bad news: **Das tut mir leid.**" },
            { at: "table", k: "pick", q: "Das Konzert fällt aus. — ___", o: ["Schade!", "Gern!", "Genau!"], a: 0, why: "A small letdown: **Schade!**" },
            { at: "trap", k: "pick", q: "You want to get past someone on the tram:", o: ["Entschuldigung!", "Das tut mir leid!", "Schade!"], a: 0, why: "Excuse me: **Entschuldigung!**" },
            { at: "trap", k: "pick", q: "A friend's grandmother has died. You say…", o: ["Das tut mir sehr leid.", "Schade!", "Keine Ahnung."], a: 0, why: "Sad news: **Das tut mir leid.**" },
          ] },
      ],
      diag: [
        { t: "swap", from: "^(dir|sie)$", to: "^ihnen$", rule: "resp.how", msg: "To someone you call Sie: **Und Ihnen?**" },
        { t: "swap", from: "^(ihnen|sie)$", to: "^dir$", rule: "resp.how", msg: "To someone you call du: **Und dir?**" },
      ],
      drills: [
        // ── Übung 29•20: the fitting answer ──
        { id: "d29.20", ex: "29.20", t: "respond", title: "What do you say?", how: "Pick the answer that fits.", items: [
          { q: "Wir haben gestern ein Baby bekommen!", o: ["Herzlichen Glückwunsch!", "Gute Besserung!", "Keine Ursache."], a: ["Herzlichen Glückwunsch!"], r: ["resp.wish"] },
          { q: "Ich habe im Lotto gewonnen!", o: ["Unglaublich!", "Schade!", "Gleichfalls!"], a: ["Unglaublich!"], r: ["resp.react"] },
          { q: "Fährt der Bus auch am Sonntag?", o: ["Keine Ahnung.", "Gute Reise!", "Freut mich!"], a: ["Keine Ahnung."], r: ["resp.no"] },
          { q: "Kommst du heute Abend mit?", o: ["Leider nicht.", "Gern geschehen.", "Guten Appetit!"], a: ["Leider nicht."], r: ["resp.no"] },
          { q: "Hast du Lust auf eine Pizza?", o: ["Gerne!", "Das tut mir leid.", "Gute Nacht!"], a: ["Gerne!"], r: ["resp.yes"] },
          { q: "Meine Mutter ist wieder gesund.", o: ["Das freut mich!", "Schade!", "Keine Ahnung."], a: ["Das freut mich!"], r: ["resp.react"] },
          { q: "Ich fliege morgen nach Lissabon.", o: ["Gute Reise!", "Gute Besserung!", "Kein Problem."], a: ["Gute Reise!"], r: ["resp.wish"] },
          { q: "Ich habe leider meine Stelle verloren.", o: ["Oh nein, das tut mir leid.", "Toll!", "Gleichfalls!"], a: ["Oh nein, das tut mir leid."], r: ["resp.react"] },
          { q: "Gehst du am Wochenende wandern?", o: ["Das kommt darauf an.", "Herzlichen Glückwunsch!", "Bitte schön!"], a: ["Das kommt darauf an."], r: ["resp.no"] },
          { q: "Schönen Feierabend!", o: ["Danke, gleichfalls!", "Gern geschehen!", "Freut mich!"], a: ["Danke, gleichfalls!"], r: ["resp.wish"] },
          { q: "Danke für den schönen Abend!", o: ["Gern geschehen!", "Gute Besserung!", "Echt?"], a: ["Gern geschehen!"], r: ["resp.thanks"] },
          { q: "Entschuldigung, ich habe Ihren Platz genommen.", o: ["Das macht nichts.", "Herzlichen Glückwunsch!", "Super!"], a: ["Das macht nichts."], r: ["resp.thanks"] },
        ] },
        // ── our own: the reply ──
        { id: "dresp.t", t: "type", title: "The reply", how: "Write the missing word of the reply.", items: [
          { q: "Danke schön! — ___! (you're welcome)", a: ["Bitte", "Bitte schön", "Gern geschehen", "Gern", "Gerne", "Keine Ursache"], r: ["resp.thanks"] },
          { q: "Wie geht es dir? — Gut, danke. Und ___?", a: ["dir"], r: ["resp.how"] },
          { q: "Wie geht es Ihnen? — Gut, danke. Und ___?", a: ["Ihnen"], r: ["resp.how"] },
          { q: "Schönes Wochenende! — Danke, ___!", a: ["gleichfalls", "ebenfalls"], r: ["resp.wish"] },
          { q: "Ich habe Kopfschmerzen. — Oh, gute ___!", a: ["Besserung"], r: ["resp.wish"] },
          { q: "Weißt du, wo der Schlüssel ist? — Keine ___.", a: ["Ahnung"], r: ["resp.no"] },
          { q: "Mein Zug hat eine Stunde Verspätung. — Oh, wie ___! (what a pity)", a: ["schade"], r: ["resp.react"] },
          { q: "Entschuldigung! — Das macht ___.", a: ["nichts"], r: ["resp.thanks"] },
          { q: "Kommst du mit? — ___ nicht, ich muss arbeiten. (unfortunately)", a: ["Leider"], r: ["resp.no"] },
          { q: "Wir heiraten im Mai! — Herzlichen ___!", a: ["Glückwunsch"], r: ["resp.wish"] },
          { q: "Freut mich! — Mich ___.", a: ["auch"], r: ["resp.how"] },
          { q: "Hilfst du mir mit dem Koffer? — ___! (sure)", a: ["Klar", "Natürlich", "Gern", "Gerne", "Sicher"], r: ["resp.yes"] },
        ] },
        // ── our own: a short conversation in order ──
        { id: "dresp.o", t: "order", title: "The conversation", how: "Put the lines in order.", items: [
          { q: "At the bakery.", a: ["Guten Morgen!", "Guten Morgen! Was darf es sein?", "Ein Brot, bitte.", "Bitte schön. Das macht vier Franken."], r: ["resp.hello"] },
          { q: "A new colleague.", a: ["Hallo, ich bin Sandra.", "Hallo Sandra, ich heiße Marco. Freut mich!", "Mich auch!", "Willkommen im Team!"], r: ["resp.how"] },
          { q: "A neighbour on the stairs.", a: ["Guten Abend, Herr Kunz! Wie geht es Ihnen?", "Danke, gut. Und Ihnen?", "Auch gut, danke.", "Schönen Abend noch!", "Danke, gleichfalls!"], r: ["resp.how", "resp.wish"] },
          { q: "You bump into someone.", a: ["Oh, Entschuldigung!", "Kein Problem.", "Ist alles in Ordnung?", "Ja, alles gut."], r: ["resp.thanks"] },
          { q: "A friend helped you move house.", a: ["Vielen Dank für deine Hilfe!", "Gern geschehen!", "Darf ich dich zum Essen einladen?", "Gern!"], r: ["resp.thanks", "resp.yes"] },
          { q: "Friday afternoon at work.", a: ["Tschüss, bis Montag!", "Tschüss! Schönes Wochenende!", "Danke, gleichfalls!"], r: ["resp.hello", "resp.wish"] },
          { q: "An invitation.", a: ["Hast du am Samstag Zeit?", "Das kommt darauf an. Warum?", "Wir machen ein Grillfest.", "Super! Ich komme gern."], r: ["resp.no", "resp.react"] },
          { q: "Good news.", a: ["Rate mal: Ich habe eine neue Wohnung!", "Echt? Wo denn?", "In Winterthur, mit Balkon.", "Toll! Das freut mich!"], r: ["resp.react"] },
          { q: "A colleague is ill.", a: ["Ich habe Fieber, ich gehe nach Hause.", "Oh, das tut mir leid. Gute Besserung!", "Danke! Bis bald."], r: ["resp.wish"] },
        ] },
        // ── Production: say it ──
        { id: "dp.resp", t: "translate", end: true, title: "Say it in German", how: "Translate — the short way people say it.", items: [
          { q: "Good evening, Mr Graf! How are you?", a: ["Guten Abend, Herr Graf! Wie geht es Ihnen?", "Guten Abend, Herr Graf! Wie geht's Ihnen?"], r: ["resp.hello", "resp.how"] },
          { q: "Thanks, you too!", a: ["Danke, gleichfalls!", "Danke, ebenfalls!", "Danke, Ihnen auch!", "Danke, dir auch!"], r: ["resp.wish"] },
          { q: "No idea.", a: ["Keine Ahnung."], r: ["resp.no"] },
          { q: "I'm sorry, I can't come.", a: ["Es tut mir leid, ich kann nicht kommen.", "Tut mir leid, ich kann nicht kommen.", "Leider kann ich nicht kommen."], r: ["resp.thanks"] },
          { q: "Get well soon!", a: ["Gute Besserung!"], r: ["resp.wish"] },
          { q: "You're welcome!", a: ["Gern geschehen!", "Bitte!", "Bitte schön!", "Keine Ursache!", "Gerne!", "Gern!"], r: ["resp.thanks"] },
          { q: "That depends.", a: ["Das kommt darauf an.", "Kommt darauf an.", "Das kommt drauf an."], r: ["resp.no"] },
          { q: "Really? That's great!", a: ["Wirklich? Das ist toll!", "Echt? Das ist toll!", "Wirklich? Das ist super!", "Echt? Das ist super!", "Wirklich? Toll!", "Echt? Toll!", "Wirklich? Super!", "Echt? Super!"], r: ["resp.react"] },
          { q: "Nice to meet you!", a: ["Freut mich!", "Freut mich sehr!", "Sehr erfreut!"], r: ["resp.how"] },
          { q: "Of course! (polite)", a: ["Selbstverständlich!", "Natürlich!"], r: ["resp.yes"] },
        ] },
        // ── Production · Übung 29•21: what was said before? ──
        { id: "d29.21", ex: "29.21", t: "write", end: true, title: "What was said before?", how: "Write a line that the answer fits. Saved for Claude to correct.", items: [
          { q: "The answer: «Das kommt darauf an.»", model: ["Fährst du am Samstag mit uns nach Luzern?"], r: ["resp.no"] },
          { q: "The answer: «Echt?»", model: ["Unsere Lehrerin hat Zwillinge bekommen!"], r: ["resp.react"] },
          { q: "The answer: «Keine Ahnung.»", model: ["Weißt du, wann das Museum aufmacht?"], r: ["resp.no"] },
          { q: "The answer: «Wunderbar!»", model: ["Morgen scheint endlich wieder die Sonne."], r: ["resp.react"] },
          { q: "The answer: «Leider nicht.»", model: ["Hast du heute Abend Zeit?"], r: ["resp.no"] },
          { q: "The answer: «Gute Besserung!»", model: ["Ich bin erkältet und bleibe heute im Bett."], r: ["resp.wish"] },
          { q: "The answer: «Danke, gleichfalls!»", model: ["Schönen Feierabend!"], r: ["resp.wish"] },
          { q: "The answer: «Schade!»", model: ["Das Fest im Park fällt wegen Regen aus."], r: ["resp.react"] },
        ] },
      ],
    },
  },
});

// What chapter 29's exercises became: the pat phrases here; the rest wait
// for the lessons that teach them (all of them upload chapter 29).
cxCover({
  "29.20": "d29.20", "29.21": "d29.21",
  "29.1": { st: "planned", sec: "s1.conj1" }, "29.2": { st: "planned", sec: "s1.conj1" }, "29.3": { st: "planned", sec: "s1.conj1" }, "29.4": { st: "planned", sec: "s1.conj1" },
  "29.5": { st: "planned", sec: "s2.alswenn" }, "29.6": { st: "planned", sec: "s2.alswenn" }, "29.7": { st: "planned", sec: "s2.alswenn" }, "29.8": { st: "planned", sec: "s2.alswenn" },
  "29.9": { st: "planned", sec: "s2.indq" }, "29.10": { st: "planned", sec: "s2.indq" },
  "29.11": { st: "planned", sec: "s2.ptadj" }, "29.12": { st: "planned", sec: "s2.ptadj" }, "29.13": { st: "planned", sec: "s2.ptadj" }, "29.14": { st: "planned", sec: "s2.ptadj" },
  "29.15": { st: "planned", sec: "s2.ptadj" }, "29.16": { st: "planned", sec: "s2.ptadj" }, "29.17": { st: "planned", sec: "s2.ptadj" },
  "29.18": { st: "planned", sec: "s2.short" }, "29.19": { st: "planned", sec: "s2.short" },
});
