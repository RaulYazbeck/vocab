// ── COURSE PACK · Stage 1 · Modals: position, and in a side sentence ──
// Book: chapter 17 "Modals used with infinitives" (Übung 17•8–17•12),
// "Modal position in a subordinate clause" (17•13) and "Omission of the
// infinitive" (17•14 · 17•15). The modals' forms were met in the A1 verb
// lesson (pr5, pt12); this lesson is about where they go and what they
// say. Two sheets: the modal second, the infinitive last (and what each
// one means — nicht müssen ≠ nicht dürfen) · the modal at the end of a
// weil / dass / wenn sentence, and a modal on its own. Chapter 11's
// "Position and form of modals" (11•10–11•13) is the future with werden —
// the future lesson's (Session 5).
cxPack({
  id: "s1-modal",
  sections: {
    "s1.modal": {
      testout: { n: 6, miss: 1 },
      rules: {
        "mod.end": "The modal second, the infinitive at the end",
        "mod.mean": "What können, dürfen, müssen, sollen, wollen mean",
        "mod.neg": "nicht müssen: don't have to; nicht dürfen: mustn't",
        "mod.sub": "After weil, dass, wenn: the infinitive, then the modal",
        "mod.alone": "A modal can stand alone: Ich kann das.",
        "mod.form": "ich and er have the same form: ich will, er will",
      },
      sheets: [
        { id: "cx.mod1", title: "The modal second, the infinitive last", qn: 3,
          struct: [["Who", "who"], ["modal", "modal"], ["…", "mid"], ["infinitive", "inf"]],
          why: "A modal (**können, müssen, dürfen, sollen, wollen, möchten**) takes second place and sends the main verb to the **end** as an infinitive. The two verbs frame the sentence.",
          rid: ["mod.end", "mod.mean", "mod.neg"],
          rules: [
            "The modal is conjugated and goes **second**; the other verb goes to the **end** as an infinitive: Ich **muss** heute länger **arbeiten**. · **Darfst** du **ausgehen**? A separable verb stays in one piece: Ich muss um sechs **aufstehen**.",
            "Each modal has its own meaning: **können** can · **dürfen** may, be allowed to · **müssen** have to · **sollen** be supposed to (someone else wants it) · **wollen** want to · **möchten** would like to · **mögen** like: Ich **mag** Käse.",
            "**nicht müssen** means *don't have to*; **nicht dürfen** means *mustn't*: Du **musst** nicht kommen (there's no need). · Hier **darf** man nicht parken (it's not allowed).",
          ],
          table: { head: ["", "2nd", "…", "end"], rows: [
            ["Ich", "**kann**", "heute nicht", "**kommen**."],
            ["Wir", "**müssen**", "jetzt", "**gehen**."],
            ["", "**Darf** ich", "hier", "**parken**?"],
            ["Sie", "**möchte**", "Kaffee", "**trinken**."],
          ] },
          ex: [
            ["Ich **kann** leider nicht **mitkommen**.", "Unfortunately I can't come along."],
            ["Hier **darf** man nicht **rauchen**.", "You're not allowed to smoke here."],
            ["Du **musst** nicht **warten** — ich komme allein.", "You don't have to wait — I'll come on my own."],
            ["**Sollen** wir dich am Bahnhof **abholen**?", "Shall we pick you up at the station?"],
          ],
          trap: "**muss nicht** is not *must not*. Du musst nicht kommen means you don't **have** to. *You mustn't* is **darfst nicht**: Du darfst nicht kommen.",
          quiz: [
            { at: "r1", k: "pick", q: "Which is right?", o: ["Ich muss heute arbeiten.", "Ich muss arbeiten heute.", "Ich heute muss arbeiten."], a: 0, why: "The modal goes second, the infinitive at the end." },
            { at: "r1", k: "order", q: "Build it: Can you help me tomorrow?", a: ["Kannst", "du", "mir", "morgen", "helfen?"], why: "In a yes/no question the modal comes first, the infinitive at the end." },
            { at: "r1", k: "pick", q: "Ich muss morgen früh ___.", o: ["aufstehen", "stehe auf", "auf stehen"], a: 0, why: "A separable verb stays in one piece at the end: **aufstehen**." },
            { at: "r2", k: "pick", q: "You're allowed to park here: Hier ___ man parken.", o: ["darf", "muss", "soll"], a: 0, why: "*Allowed to* is **dürfen**." },
            { at: "r2", k: "pick", q: "The doctor wants me to rest: Ich ___ mich ausruhen.", o: ["soll", "darf", "mag"], a: 0, why: "Someone else wants it: **sollen**." },
            { at: "r2", k: "type", cx: true, q: "I'd like a coffee: Ich ___ einen Kaffee. (möchten)", a: ["möchte"], r: ["mod.mean"], why: "*Would like* is **möchte**." },
            { at: "r3", k: "pick", q: "There's no need to come: Du ___ nicht kommen.", o: ["musst", "darfst"], a: 0, why: "There's no need: **nicht müssen**." },
            { at: "r3", k: "pick", q: "It's not allowed: Hier ___ man nicht baden.", o: ["darf", "muss"], a: 0, why: "It isn't allowed: **nicht dürfen**." },
            { at: "table", k: "pick", q: "Wir ___ um sechs aufstehen.", o: ["müssen", "muss", "müsst"], a: 0, why: "With wir: **müssen**." },
            { at: "trap", k: "pick", q: "You mustn't touch that:", o: ["Das darfst du nicht anfassen.", "Das musst du nicht anfassen."], a: 0, why: "*Mustn't* is **darfst nicht**." },
          ] },
        { id: "cx.mod2", title: "At the end of a weil sentence — and on its own", qn: 3,
          struct: [[", weil · dass", "pre"], ["…", "mid"], ["infinitive", "inf"], ["modal", "modal"]],
          why: "In a side sentence (after weil, dass, wenn), the modal goes to the very end, after the infinitive. And when the meaning is clear, a modal can stand on its own.",
          rid: ["mod.sub", "mod.alone", "mod.form"],
          rules: [
            "After **weil, dass, wenn**, the modal is the very last word, right after the infinitive: …, weil ich früh **aufstehen muss** · …, dass man hier nicht **parken darf** · …, wenn du **mitkommen willst**.",
            "When the meaning is clear, you can leave out the infinitive: Ich **kann** das nicht. · **Musst** du schon? · Ich **will** nach Hause. · Sie **kann** gut Deutsch. · **Darf** ich?",
            "With ich and er, sie, es, a modal has no ending, so the two forms are the same: ich **mag**, er **mag** · ich **will**, sie **will** · ich **möchte**, er **möchte**. With du: magst, willst, möchtest.",
          ],
          table: { head: ["", "… the infinitive, the modal"], rows: [
            ["weil", "…, weil ich früh **aufstehen muss**."],
            ["dass", "…, dass man hier **parken darf**."],
            ["wenn", "…, wenn du **mitkommen willst**."],
          ] },
          ex: [
            ["Es tut mir leid, dass ich nicht **kommen kann**.", "I'm sorry that I can't come."],
            ["Wir nehmen ein Taxi, weil wir den Zug nicht **verpassen wollen**.", "We're taking a taxi because we don't want to miss the train."],
            ["Kannst du Auto fahren? — Ja, ich **kann**.", "Can you drive? — Yes, I can."],
            ["Ich **mag** keine Pilze.", "I don't like mushrooms."],
          ],
          trap: "In a side sentence, the modal comes **after** the infinitive: …, weil ich arbeiten **muss**, never ~~weil ich muss arbeiten~~.",
          quiz: [
            { at: "r1", k: "pick", q: "Ich bleibe hier, weil ich ___.", o: ["arbeiten muss", "muss arbeiten"], a: 0, why: "After weil: the infinitive, then the modal." },
            { at: "r1", k: "pick", q: "Er sagt, dass man hier nicht ___.", o: ["parken darf", "darf parken"], a: 0, why: "After dass, the modal comes last." },
            { at: "r1", k: "order", q: "Build it: I'm sorry that I can't come.", a: ["Es tut mir leid,", "dass", "ich", "nicht", "kommen kann."], why: "After dass: the infinitive, then the modal." },
            { at: "r2", k: "pick", q: "She speaks good German: Sie ___ gut Deutsch.", o: ["kann", "weiß", "kennt"], a: 0, why: "For a language you know, **können** stands alone." },
            { at: "r2", k: "pick", q: "Musst du schon gehen? — Ja, ich ___ leider.", o: ["muss", "musst", "müsse"], a: 0, why: "The modal stands alone: **ich muss**." },
            { at: "r3", k: "type", cx: true, q: "Was ___ du trinken? (möchten)", a: ["möchtest"], r: ["mod.form"], why: "With du: **möchtest**." },
            { at: "r3", k: "pick", q: "Er ___ Schokolade. (mögen)", o: ["mag", "mögt", "magt"], a: 0, why: "With er, there is no ending: **mag**." },
            { at: "r3", k: "pick", q: "Lea ___ Ärztin werden. (wollen)", o: ["will", "willt", "wollt"], a: 0, why: "With sie (she), there is no ending: **will**." },
            { at: "table", k: "pick", q: "Ruf mich an, wenn du ___.", o: ["mitkommen willst", "willst mitkommen", "mit willst kommen"], a: 0, why: "The infinitive in one piece, then the modal." },
            { at: "trap", k: "pick", q: "Which is right?", o: ["…, weil ich arbeiten muss.", "…, weil ich muss arbeiten."], a: 0, why: "After weil, the modal goes last." },
          ] },
      ],
      diag: [
        { t: "swap", from: "^(muss|musst|mussen|musst)$", to: "^(darf|darfst|durfen|durft)$", rule: "mod.neg", msg: "*Mustn't* is **nicht dürfen**: **{right}**. nicht müssen only means there's no need." },
        { t: "swap", from: "^(darf|darfst|durfen|durft)$", to: "^(muss|musst|mussen|musst)$", rule: "mod.neg", msg: "*Don't have to* is **nicht müssen**: **{right}**. nicht dürfen means it's not allowed." },
        { t: "swap", from: "^(mag|magst|mogen|mogt)$", to: "^(mochte|mochtest|mochten|mochtet)$", rule: "mod.mean", msg: "For *would like* (now), use **{right}**. mögen means *like* in general." },
        { t: "swap", from: "^(kann|kannst|konnen)$", to: "^(darf|darfst|durfen)$", rule: "mod.mean", msg: "For *allowed to*, use **{right}** (dürfen). können means *can* or *be able to*." },
        { t: "ending", stem: "(moch|wol|wil|sol|ma|mog|kan|kon|mus|dar|dur)", rule: "mod.form", msg: "Right modal, wrong form: **{right}**. ich and er have no ending (ich mag, er will); du adds -st (magst, willst)." },
        { t: "pos", tok: "^(muss|musst|mussen|kann|kannst|konnen|will|willst|wollen|soll|sollst|sollen|darf|darfst|durfen|mochte|mochtest|mochten|mag)$", rule: "mod.sub", msg: "After weil, dass and wenn, the modal is the very last word: it goes {where}." },
        { t: "pos", tok: "^(arbeiten|kommen|gehen|fahren|bleiben|sein|machen|helfen|essen|trinken|schlafen|warten|parken|lernen|kaufen|sehen|lesen|aufstehen|mitkommen|abholen|einkaufen|anrufen|umziehen|sprechen|bezahlen)$", rule: "mod.end", msg: "The infinitive goes to the end: {where}." },
      ],
      drills: [
        // ── our own: which modal? ──
        { id: "dmod.p", t: "pick", title: "Which modal?", how: "Pick the modal that matches the hint in brackets.", items: [
          { q: "Hier ___ man nicht rauchen. (not allowed)", o: ["darf", "muss", "will"], a: ["darf"], r: ["mod.neg"] },
          { q: "Ich ___ morgen um sechs aufstehen. (no choice)", o: ["muss", "darf", "mag"], a: ["muss"], r: ["mod.mean"] },
          { q: "___ du gut kochen? (able to)", o: ["Kannst", "Darfst", "Sollst"], a: ["Kannst"], r: ["mod.mean"] },
          { q: "Die Kinder ___ heute länger aufbleiben. (allowed)", o: ["dürfen", "müssen", "sollen"], a: ["dürfen"], r: ["mod.mean"] },
          { q: "Du ___ nicht kommen — ich schaffe das allein. (no need)", o: ["musst", "darfst"], a: ["musst"], r: ["mod.neg"] },
          { q: "Mein Chef sagt, ich ___ den Bericht heute schicken. (he wants it)", o: ["soll", "will", "darf"], a: ["soll"], r: ["mod.mean"] },
          { q: "Ich ___ einen Kaffee, bitte. (would like)", o: ["möchte", "mag", "darf"], a: ["möchte"], r: ["mod.mean"] },
          { q: "Wir ___ dieses Jahr nach Island reisen. (want)", o: ["wollen", "sollen", "dürfen"], a: ["wollen"], r: ["mod.mean"] },
          { q: "Ich ___ überhaupt keinen Fisch. (like)", o: ["mag", "kann", "darf"], a: ["mag"], r: ["mod.mean"] },
          { q: "Morgen ist ein Feiertag: Ich ___ nicht früh aufstehen. (no need)", o: ["muss", "darf"], a: ["muss"], r: ["mod.neg"] },
          { q: "Im Spital ___ man nicht laut telefonieren. (not allowed)", o: ["darf", "muss"], a: ["darf"], r: ["mod.neg"] },
        ] },
        // ── Übung 17•8: dürfen and können for someone else ──
        { id: "d17.8", ex: "17.8", t: "transform", title: "Someone else", how: "Say it for the person in brackets. The modal changes; the infinitive stays at the end.", items: [
          { q: "Wir dürfen heute länger bleiben. (ich)", a: ["Ich darf heute länger bleiben."], r: ["mod.end"], vf: [["dürfen", "pr", "ich"]] },
          { q: "Ich darf im Garten spielen. (ihr)", a: ["Ihr dürft im Garten spielen."], r: ["mod.end"], vf: [["dürfen", "pr", "ihr"]] },
          { q: "Man darf hier nicht parken. (die Gäste)", a: ["Die Gäste dürfen hier nicht parken."], r: ["mod.end"], vf: [["dürfen", "pr", "sie"]] },
          { q: "Lena kann gut Ski fahren. (ich)", a: ["Ich kann gut Ski fahren."], r: ["mod.end"], vf: [["können", "pr", "ich"]] },
          { q: "Tom kann schon lesen. (wir)", a: ["Wir können schon lesen."], r: ["mod.end"], vf: [["können", "pr", "wir"]] },
          { q: "Ihr könnt viel erzählen. (der Opa)", a: ["Der Opa kann viel erzählen."], r: ["mod.end"], vf: [["können", "pr", "er"]] },
          { q: "Ich kann die Karte nicht lesen. (die Touristen)", a: ["Die Touristen können die Karte nicht lesen."], r: ["mod.end"], vf: [["können", "pr", "sie"]] },
          { q: "Wir können am Freitag nicht kommen. (du)", a: ["Du kannst am Freitag nicht kommen."], r: ["mod.end"], vf: [["können", "pr", "du"]] },
          { q: "Anna darf am Samstag ausgehen. (du)", a: ["Du darfst am Samstag ausgehen."], r: ["mod.end"], vf: [["dürfen", "pr", "du"]] },
          { q: "Können wir hier bezahlen? (ich)", a: ["Kann ich hier bezahlen?"], r: ["mod.end"], vf: [["können", "pr", "ich"]] },
          { q: "Könnt ihr Schach spielen? (du)", a: ["Kannst du Schach spielen?"], r: ["mod.end"], vf: [["können", "pr", "du"]] },
          { q: "Ich darf keinen Zucker essen. (Herr Meier)", a: ["Herr Meier darf keinen Zucker essen."], r: ["mod.end"], vf: [["dürfen", "pr", "er"]], cap: true },
        ] },
        // ── Übung 17•9: because I have to ──
        { id: "d17.9", ex: "17.9", t: "answer", title: "Because I have to", how: "Answer with müssen. The verb from the question goes to the end.", items: [
          { q: "Warum arbeitest du am Samstag?", a: ["Ich muss am Samstag arbeiten.", "Am Samstag muss ich arbeiten."], r: ["mod.end"], vf: [["müssen", "pr", "ich"]] },
          { q: "Warum steht ihr so früh auf?", a: ["Wir müssen so früh aufstehen."], r: ["mod.end"], vf: [["müssen", "pr", "wir"]] },
          { q: "Warum rennen die Kinder zum Bus?", a: ["Sie müssen zum Bus rennen.", "Die Kinder müssen zum Bus rennen."], r: ["mod.end"], vf: [["müssen", "pr", "sie"]] },
          { q: "Warum bleibt Papa so lange im Büro?", a: ["Er muss so lange im Büro bleiben.", "Papa muss so lange im Büro bleiben."], r: ["mod.end"], vf: [["müssen", "pr", "er"]] },
          { q: "Warum gehen wir zum Hauswart?", a: ["Wir müssen zum Hauswart gehen.", "Ihr müsst zum Hauswart gehen."], r: ["mod.end"] },
          { q: "Frau Graf, warum fahren Sie nach Bern?", a: ["Ich muss nach Bern fahren."], r: ["mod.end"], vf: [["müssen", "pr", "ich"]] },
          { q: "Herr Meier, warum verkaufen Sie Ihr Auto?", a: ["Ich muss mein Auto verkaufen."], r: ["mod.end"], vf: [["müssen", "pr", "ich"]] },
          { q: "Muss ich zum Arzt gehen? — Ja, …", a: ["Ja, du musst zum Arzt gehen."], r: ["mod.end"], vf: [["müssen", "pr", "du"]] },
          { q: "Warum wartest du hier?", a: ["Ich muss hier warten."], r: ["mod.end"], vf: [["müssen", "pr", "ich"]] },
        ] },
        // ── Übung 17•10: möchten and sollen ──
        { id: "d17.10", ex: "17.10", t: "type", title: "möchten and sollen", how: "Write the form of the modal in brackets.", items: [
          { q: "Mia und Jan ___ heute essen gehen. (möchten)", a: ["möchten"], r: ["mod.form"], vf: [["möchten", "pr", "sie"]] },
          { q: "Mia ___ Sushi essen. (möchten)", a: ["möchte"], r: ["mod.form"], vf: [["möchten", "pr", "er"]] },
          { q: "Jan ___ aber lieber eine Pizza. (möchten)", a: ["möchte"], r: ["mod.form"], vf: [["möchten", "pr", "er"]] },
          { q: "Was ___ sie jetzt machen? (sollen — they)", a: ["sollen"], r: ["mod.form"], vf: [["sollen", "pr", "sie"]] },
          { q: "Ich finde, sie ___ zum Italiener gehen — da gibt es beides. (sollen)", a: ["sollen"], r: ["mod.form"], vf: [["sollen", "pr", "sie"]] },
          { q: "___ du auch mitkommen? (möchten)", a: ["Möchtest"], r: ["mod.form"], vf: [["möchten", "pr", "du"]] },
          { q: "Was ___ ihr trinken? (möchten)", a: ["möchtet"], r: ["mod.form"], vf: [["möchten", "pr", "ihr"]] },
          { q: "Der Kellner fragt: «___ ich Ihnen die Karte bringen?» (sollen)", a: ["Soll"], r: ["mod.form"], vf: [["sollen", "pr", "ich"]] },
          { q: "Du ___ nicht so viel Salz nehmen, sagt der Arzt. (sollen)", a: ["sollst"], r: ["mod.form"], vf: [["sollen", "pr", "du"]] },
          { q: "Wir ___ um acht dort sein. (sollen)", a: ["sollen"], r: ["mod.form"], vf: [["sollen", "pr", "wir"]] },
        ] },
        // ── Übung 17•11: mögen, often on its own ──
        { id: "d17.11", ex: "17.11", t: "type", title: "mögen", how: "Write the form of mögen. It often stands alone.", items: [
          { q: "___ du Fondue? (mögen)", a: ["Magst"], r: ["mod.form", "mod.alone"], vf: [["mögen", "pr", "du"]] },
          { q: "Ja, ich ___ es sehr. (mögen)", a: ["mag"], r: ["mod.form", "mod.alone"], vf: [["mögen", "pr", "ich"]] },
          { q: "Mein Mann ___ auch Fondue. (mögen)", a: ["mag"], r: ["mod.form"], vf: [["mögen", "pr", "er"]] },
          { q: "Die Kinder ___ lieber Raclette. (mögen)", a: ["mögen"], r: ["mod.form"], vf: [["mögen", "pr", "sie"]] },
          { q: "Lea und Tom, ___ ihr Käse? (mögen)", a: ["mögt"], r: ["mod.form"], vf: [["mögen", "pr", "ihr"]] },
          { q: "Nein, wir ___ keinen Käse. (mögen)", a: ["mögen"], r: ["mod.form"], vf: [["mögen", "pr", "wir"]] },
          { q: "Und Sie, Frau Huber, ___ Sie Fondue? (mögen)", a: ["mögen"], r: ["mod.form"], vf: [["mögen", "pr", "sie"]] },
          { q: "Meine Kollegin ___ keine Pilze. (mögen)", a: ["mag"], r: ["mod.form"], vf: [["mögen", "pr", "er"]] },
          { q: "Ich ___ den Winter nicht. (mögen)", a: ["mag"], r: ["mod.form", "mod.alone"], vf: [["mögen", "pr", "ich"]] },
        ] },
        // ── Übung 17•12: wollen ──
        { id: "d17.12", ex: "17.12", t: "type", title: "wollen", how: "Write the form of wollen.", items: [
          { q: "Lisa, was ___ du heute machen? (wollen)", a: ["willst"], r: ["mod.form"], vf: [["wollen", "pr", "du"]] },
          { q: "Ich ___ an den See gehen. (wollen)", a: ["will"], r: ["mod.form"], vf: [["wollen", "pr", "ich"]] },
          { q: "Mein Bruder ___ auch mitkommen. (wollen)", a: ["will"], r: ["mod.form"], vf: [["wollen", "pr", "er"]] },
          { q: "Ben und Noah, ___ ihr baden gehen? (wollen)", a: ["wollt"], r: ["mod.form"], vf: [["wollen", "pr", "ihr"]] },
          { q: "Nein, wir ___ nicht. (wollen)", a: ["wollen"], r: ["mod.form", "mod.alone"], vf: [["wollen", "pr", "wir"]] },
          { q: "Wir ___ lieber Velo fahren. (wollen)", a: ["wollen"], r: ["mod.form"], vf: [["wollen", "pr", "wir"]] },
          { q: "Was ___ Sie essen, Herr Graf? (wollen)", a: ["wollen"], r: ["mod.form"], vf: [["wollen", "pr", "sie"]] },
          { q: "Die Kinder ___ ein Eis. (wollen)", a: ["wollen"], r: ["mod.form", "mod.alone"], vf: [["wollen", "pr", "sie"]] },
          { q: "Er ___ nach Kanada ziehen. (wollen)", a: ["will"], r: ["mod.form"], vf: [["wollen", "pr", "er"]] },
        ] },
        // ── Übung 17•13: the modal at the end of a side sentence ──
        { id: "d17.13", ex: "17.13", t: "transform", title: "In a side sentence", how: "Join the two with the word in brackets. The modal goes to the very end.", items: [
          { q: "(weil) Ich gehe früh ins Bett. Ich muss um fünf aufstehen.", a: ["Ich gehe früh ins Bett, weil ich um fünf aufstehen muss."], r: ["mod.sub"] },
          { q: "(weil) Ich spare jeden Monat. Ich möchte ein Velo kaufen.", a: ["Ich spare jeden Monat, weil ich ein Velo kaufen möchte."], r: ["mod.sub"] },
          { q: "(weil) Sie lernt Italienisch. Sie will in Rom studieren.", a: ["Sie lernt Italienisch, weil sie in Rom studieren will."], r: ["mod.sub"] },
          { q: "(dass) Ich hoffe es. Du kannst am Samstag kommen.", a: ["Ich hoffe, dass du am Samstag kommen kannst."], r: ["mod.sub"] },
          { q: "(wenn) Ruf mich an. Du willst mitkommen.", a: ["Ruf mich an, wenn du mitkommen willst."], r: ["mod.sub"] },
          { q: "(dass) Wusstest du das? Man darf hier nicht grillen.", a: ["Wusstest du, dass man hier nicht grillen darf?"], r: ["mod.sub"] },
          { q: "(weil) Wir sind ganz still. Das Baby muss schlafen.", a: ["Wir sind ganz still, weil das Baby schlafen muss."], r: ["mod.sub"] },
          { q: "(dass) Der Chef sagt es. Wir sollen pünktlich sein.", a: ["Der Chef sagt, dass wir pünktlich sein sollen."], r: ["mod.sub"] },
          { q: "(weil) Lea nimmt den Bus. Sie kann nicht Auto fahren.", a: ["Lea nimmt den Bus, weil sie nicht Auto fahren kann."], r: ["mod.sub"], cap: true },
          { q: "(wenn) Nimm ein Taxi. Du musst schnell da sein.", a: ["Nimm ein Taxi, wenn du schnell da sein musst."], r: ["mod.sub"] },
        ] },
        // ── Übung 17•14: the modal on its own ──
        { id: "d17.14", ex: "17.14", t: "translate", title: "On its own", how: "Say it in German, with the modal on its own and no infinitive.", items: [
          { q: "I have to.", a: ["Ich muss."], r: ["mod.alone"] },
          { q: "Can you ski? — No, I can't. (du)", a: ["Kannst du Ski fahren? — Nein, ich kann nicht.", "Kannst du Ski fahren? — Nein, das kann ich nicht."], r: ["mod.alone"] },
          { q: "She speaks good French.", a: ["Sie kann gut Französisch.", "Sie spricht gut Französisch."], r: ["mod.alone"] },
          { q: "I don't want to.", a: ["Ich will nicht.", "Ich möchte nicht."], r: ["mod.alone"] },
          { q: "May I?", a: ["Darf ich?"], r: ["mod.alone"] },
          { q: "Do you have to go already? (du)", a: ["Musst du schon gehen?", "Musst du schon?"], r: ["mod.alone"] },
          { q: "I want to go home.", a: ["Ich will nach Hause.", "Ich will nach Hause gehen.", "Ich möchte nach Hause.", "Ich möchte nach Hause gehen."], r: ["mod.alone"] },
          { q: "He can't do that.", a: ["Er kann das nicht.", "Das kann er nicht."], r: ["mod.alone"] },
          { q: "Would you like some more? (Sie)", a: ["Möchten Sie noch etwas?", "Möchten Sie noch mehr?", "Möchten Sie mehr?"], r: ["mod.alone"] },
          { q: "We like it. (mögen)", a: ["Wir mögen das.", "Wir mögen es.", "Das mögen wir."], r: ["mod.alone"] },
          { q: "You don't have to. (du)", a: ["Du musst nicht."], r: ["mod.alone", "mod.neg"] },
        ] },
        // ── Übung 17•15: moving day — build it ──
        { id: "d17.15", ex: "17.15", t: "compose", end: true, title: "Moving day", how: "Make a sentence from the words: the modal second, the infinitive at the end.", items: [
          { w: ["wir", "müssen", "morgen", "umziehen"], a: ["Wir müssen morgen umziehen."], r: ["mod.end"], vf: [["müssen", "pr", "wir"]] },
          { w: ["meine Freunde", "wollen", "uns", "helfen"], a: ["Meine Freunde wollen uns helfen."], r: ["mod.end"], vf: [["wollen", "pr", "sie"]] },
          { w: ["sie", "sollen", "um acht Uhr", "kommen"], a: ["Sie sollen um acht Uhr kommen."], r: ["mod.end"] },
          { w: ["ich", "müssen", "noch", "viele Kisten", "packen"], a: ["Ich muss noch viele Kisten packen."], r: ["mod.end"], vf: [["müssen", "pr", "ich"]] },
          { w: ["mein Mann", "können", "das Sofa", "nicht", "allein", "tragen"], a: ["Mein Mann kann das Sofa nicht allein tragen."], r: ["mod.end"], vf: [["können", "pr", "er"]] },
          { w: ["die Kinder", "dürfen", "ihre Zimmer", "selbst", "einrichten"], a: ["Die Kinder dürfen ihre Zimmer selbst einrichten."], r: ["mod.end"], vf: [["dürfen", "pr", "sie"]] },
          { w: ["wir", "möchten", "am Abend", "eine Pizza", "bestellen"], a: ["Wir möchten am Abend eine Pizza bestellen."], r: ["mod.end"], vf: [["möchten", "pr", "wir"]] },
          { w: ["du", "können", "mir", "die Lampe", "geben", "?"], a: ["Kannst du mir die Lampe geben?"], r: ["mod.end"], vf: [["können", "pr", "du"]] },
          { w: ["der Hauswart", "sagen", "dass", "wir", "die Kisten", "im Keller", "lassen", "dürfen"], a: ["Der Hauswart sagt, dass wir die Kisten im Keller lassen dürfen."], r: ["mod.sub"] },
          { w: ["ich", "mögen", "die neue Wohnung", "sehr"], a: ["Ich mag die neue Wohnung sehr."], r: ["mod.alone"], vf: [["mögen", "pr", "ich"]] },
          { w: ["morgen", "wir", "können", "endlich", "lange", "schlafen"], a: ["Morgen können wir endlich lange schlafen."], r: ["mod.end"] },
          { w: ["ich", "wollen", "nie mehr", "umziehen", "!"], a: ["Ich will nie mehr umziehen!"], r: ["mod.end"], vf: [["wollen", "pr", "ich"]] },
        ] },
        { id: "dw.mod", t: "write", end: true, title: "Write your own", how: "Write in your own words. It is saved for Claude to correct.", items: [
          { q: "Rules at work or at home: what must you, may you, mustn't you do?", model: ["Im Büro muss ich um acht da sein. Ich darf manchmal von zu Hause arbeiten, aber ich darf nicht zu spät kommen."], r: ["mod.end", "mod.neg"] },
          { q: "What can you do well — and what can't you do?", model: ["Ich kann gut kochen, aber ich kann nicht singen."], r: ["mod.mean"] },
          { q: "Plans: what do you want to do this year?", model: ["Dieses Jahr will ich die B1-Prüfung machen, und im Sommer möchte ich nach Portugal reisen."], r: ["mod.end"] },
          { q: "Advice from your doctor or a friend: what should you do?", model: ["Meine Ärztin sagt, ich soll mehr Sport machen und weniger Kaffee trinken."], r: ["mod.mean"] },
          { q: "Why are you doing something today? (weil … muss / will)", model: ["Ich gehe heute früh nach Hause, weil ich noch einkaufen muss."], r: ["mod.sub"] },
          { q: "Food: what do you like, and what don't you like?", model: ["Ich mag Raclette, aber ich mag keine Oliven."], r: ["mod.alone", "mod.form"] },
          { q: "Invite a friend: what can you do together?", model: ["Wollen wir am Samstag wandern? Wir können mit dem Zug nach Luzern fahren."], r: ["mod.end"] },
          { q: "What are the children (or you, as a child) allowed to do — and what not?", model: ["Unsere Kinder dürfen am Wochenende länger aufbleiben, aber sie dürfen nicht am Tisch spielen."], r: ["mod.neg"] },
        ] },
      ],
    },
  },
});

// What chapter 17's exercises for this lesson became.
cxCover({
  "17.8": "d17.8", "17.9": "d17.9", "17.10": "d17.10", "17.11": "d17.11", "17.12": "d17.12",
  "17.13": "d17.13", "17.14": "d17.14", "17.15": "d17.15",
});
