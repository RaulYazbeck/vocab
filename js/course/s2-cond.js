// ── COURSE PACK · Stage 2 · If and wishes: wenn-sentences, wishes, als ob ──
// Book: chapter 26's "Conditional Sentences" (a condition of fact, the
// present unreal one, starting with the conclusion, leaving out wenn) and
// "Expressing a Wish", chapter 27's "Subjunctive II with wenn-clauses",
// "Als ob, als wenn" and "Wenn". Two sheets: if — real (Präsens) or not
// real (Konjunktiv II), either part first · wishes (Wenn ich nur …! · Hätte
// ich doch …! · Ich wünschte …) and als ob. Built on the Konjunktiv II's
// verb lesson (s2.k2: würde, wäre, hätte, könnte) and on wenn sending the
// verb to the end (s1.conj2). The past unreal (Wenn ich das gewusst hätte,
// 26•28, 27•14) is the post-B1 Konjunktiv II · past's (s4.k2p).
// Wishes accept nur or doch, and als ob accepts als wenn, wherever one is asked.
// (a wish without its nur / doch is named on the wish items only: in «Wenn Sie Zeit
// haben, kommen Sie doch vorbei!» the doch is no wish word)
const CX_WISH_DIAG = [{ t: "missing", whole: true, tok: "^(nur|doch)$", rule: "wish.wenn", msg: "A wish needs **nur** or **doch**: Wenn ich **nur** … hätte!" }];
cxPack({
  id: "s2-cond",
  sections: {
    "s2.cond": {
      testout: { n: 8, miss: 1 },
      rules: {
        "cond.real": "A real possibility: wenn + the Präsens",
        "cond.unreal": "Not real now: the Konjunktiv II in both parts",
        "cond.forms": "hätte, wäre, könnte — else würde + infinitive",
        "cond.order": "wenn-part first: verb, comma, verb",
        "wish.wenn": "A wish: Wenn ich nur … hätte!",
        "wish.verb": "Without wenn, the verb comes first: Hätte ich doch …!",
        "wish.ich": "Ich wünschte, … · Es wäre schön, wenn …",
        "wish.alsob": "als ob + Konjunktiv II: as if",
      },
      sheets: [
        { id: "cx.cond1", title: "Wenn ich Zeit hätte … — real or not?", qn: 3,
          struct: [["Wenn", "pre"], ["ich", "who"], ["Zeit", "mid"], ["hätte,", "verb"], ["würde", "aux"], ["ich", "who"], ["kommen", "inf"]],
          why: "A **wenn**-sentence can be about something real or something only imagined. With the **Präsens** it may well happen. With the **Konjunktiv II** it is not true now — you only imagine it.",
          rid: ["cond.real", "cond.unreal", "cond.forms", "cond.order"],
          rules: [
            "Something that may well happen takes the **Präsens** in both parts: **Wenn** es morgen **regnet**, **bleiben** wir zu Hause.",
            "Something imagined, or not true now, takes the **Konjunktiv II** in both parts: **Wenn** ich mehr Geld **hätte**, **würde** ich ein Haus **kaufen**. (But I don't have the money.)",
            "Use the one-word forms of haben, sein, wissen and the modals (**hätte**, **wäre**, **wüsste**, **könnte**); for most other verbs use **würde** + the infinitive. In the wenn-part, würde goes last: wenn du mir **helfen würdest**.",
            "The wenn-part can come first or second. If it comes first, it fills the first place, so the main part starts with its verb: Wenn ich Zeit **hätte**, **würde** ich kommen. If second: Ich **würde** kommen, wenn ich Zeit **hätte**.",
          ],
          table: { head: ["real: may happen", "not real: imagined"], rows: [
            ["ich **habe** Zeit", "ich **hätte** Zeit"],
            ["es **ist** möglich", "es **wäre** möglich"],
            ["ich **kann** kommen", "ich **könnte** kommen"],
            ["ich **komme**", "ich **würde** kommen"],
            ["es **gibt**", "es **gäbe**"],
          ] },
          ex: [
            ["**Wenn** du Hunger **hast**, **ist** noch Suppe im Kühlschrank.", "If you're hungry, there's still soup in the fridge."],
            ["**Wenn** ich mehr Zeit **hätte**, **würde** ich Italienisch **lernen**.", "If I had more time, I would learn Italian."],
            ["**Wenn** das Wetter besser **wäre**, **könnten** wir wandern.", "If the weather were better, we could go hiking."],
            ["Ich **würde** dir gern **helfen**, wenn ich **könnte**.", "I'd like to help you if I could."],
          ],
          trap: "In the wenn-part say **hätte** and **wäre**, not ~~haben würde~~ or ~~sein würde~~: Wenn ich Zeit **hätte**, … And after the wenn-part the main part starts with its verb: Wenn ich reich wäre, **würde ich** … — not ~~ich würde~~.",
          quiz: [
            { at: "r1", k: "pick", q: "Wenn es morgen schön ___, gehen wir an den See.", o: ["ist", "wäre"], a: 0, why: "It may well happen: the Präsens, **ist**." },
            { at: "r1", k: "pick", q: "Which one may well happen?", o: ["Wenn ich Zeit habe, komme ich.", "Wenn ich Zeit hätte, käme ich."], a: 0, why: "The Präsens says it is possible. The Konjunktiv II says it isn't true now." },
            { at: "r2", k: "pick", q: "I have no car. → Wenn ich ein Auto ___, würde ich dich abholen.", o: ["hätte", "habe", "hatte"], a: 0, why: "Not true now: the Konjunktiv II, **hätte**." },
            { at: "r2", k: "pick", q: "Wenn ich du ___, würde ich das nicht machen.", o: ["wäre", "bin", "war"], a: 0, why: "I am not you — imagined: **wäre**." },
            { at: "r3", k: "pick", q: "Wenn du mir ___, wäre ich schneller fertig.", o: ["helfen würdest", "würdest helfen", "hilfst"], a: 0, why: "In the wenn-part, würde goes to the very end: helfen **würdest**." },
            { at: "r3", k: "type", cx: true, q: "Wenn ich Zeit ___, würde ich mitkommen. (haben)", a: ["hätte"], r: ["cond.forms"], why: "haben has its own form: **hätte**." },
            { at: "r4", k: "pick", q: "Wenn ich reich wäre, ___ eine Weltreise.", o: ["würde ich", "ich würde"], a: 0, why: "The wenn-part comes first, so the verb comes next: **würde ich**." },
            { at: "r4", k: "order", q: "Build it: I would come if I had time.", a: ["Ich", "würde", "kommen,", "wenn ich Zeit hätte."], why: "The main part first, as usual; the wenn-part after the comma." },
            { at: "table", k: "pick", q: "Wenn es keinen Schnee ___, könnten wir nicht Ski fahren.", o: ["gäbe", "gibt", "gab"], a: 0, why: "Imagined: es **gäbe**." },
            { at: "trap", k: "pick", q: "Which is better?", o: ["Wenn ich Zeit hätte, …", "Wenn ich Zeit haben würde, …"], a: 0, why: "haben has its own form: Wenn ich Zeit **hätte**." },
          ] },
        { id: "cx.cond2", title: "Wenn ich nur …! — wishes and als ob", qn: 3,
          struct: [["Wenn", "pre"], ["ich", "who"], ["nur", "mid"], ["mehr Zeit", "thing"], ["hätte!", "verb"]],
          why: "The Konjunktiv II also says what you **wish** were different, and what only **seems** to be so: Wenn ich **nur** mehr Zeit **hätte**! · Er tut so, **als ob** er nichts **wüsste**.",
          rid: ["wish.wenn", "wish.verb", "wish.ich", "wish.alsob"],
          rules: [
            "A wish can be a wenn-part on its own, with **nur** or **doch** and the verb at the end: **Wenn** ich **nur** mehr Zeit **hätte**! · **Wenn** er **doch** endlich anrufen **würde**!",
            "You can also leave out **wenn**: then the verb comes **first**: **Hätte** ich **doch** mehr Zeit! · **Wäre** das Wetter **nur** besser! An if-sentence can do the same: **Hätte** ich Zeit, **würde** ich kommen.",
            "Two more ways to wish: **Ich wünschte**, ich **hätte** mehr Zeit. · **Es wäre schön**, **wenn** du **kommen würdest**.",
            "**als ob** means *as if*. It takes the Konjunktiv II, and the verb goes to the end: Er tut so, **als ob** er mich nicht **kennen würde**. · Du siehst aus, **als ob** du müde **wärst**. **als wenn** means the same.",
          ],
          table: { head: ["", "example"], rows: [
            ["wenn", "Wenn ich **nur** Zeit **hätte**!"],
            ["no wenn", "**Hätte** ich **doch** Zeit!"],
            ["wünschte", "Ich **wünschte**, ich **wäre** …"],
            ["als ob", "als ob er krank **wäre**"],
          ] },
          ex: [
            ["**Wenn** ich **nur** besser Deutsch **sprechen könnte**!", "If only I could speak better German!"],
            ["**Wäre** ich **doch** schon in den Ferien!", "If only I were on holiday already!"],
            ["Ich **wünschte**, du **wärst** hier.", "I wish you were here."],
            ["Er redet, **als ob** er alles **wüsste**.", "He talks as if he knew everything."],
          ],
          trap: "A wish never takes the Präsens: not ~~Wenn ich nur Zeit habe!~~ but Wenn ich nur Zeit **hätte**! And after als ob, the verb goes to the end: als ob er krank **wäre**.",
          quiz: [
            { at: "r1", k: "pick", q: "I have no car. A wish:", o: ["Wenn ich nur ein Auto hätte!", "Wenn ich nur ein Auto habe!", "Wenn ich nur hätte ein Auto!"], a: 0, why: "A wish takes the Konjunktiv II, the verb at the end." },
            { at: "r1", k: "type", cx: true, q: "Wenn es doch nicht so kalt ___! (sein)", a: ["wäre"], r: ["wish.wenn"], why: "A wish: the Konjunktiv II, **wäre**, at the end." },
            { at: "r2", k: "pick", q: "Without wenn:", o: ["Hätte ich doch mehr Geld!", "Ich hätte doch mehr Geld!", "Doch hätte ich mehr Geld!"], a: 0, why: "Without wenn, the verb comes first: **Hätte** ich doch …" },
            { at: "r2", k: "order", q: "Build it: If only the weather were better!", a: ["Wäre", "das Wetter", "nur", "besser!"], why: "No wenn, so the verb comes first." },
            { at: "r3", k: "pick", q: "I wish I could fly.", o: ["Ich wünschte, ich könnte fliegen.", "Ich wünsche, ich kann fliegen."], a: 0, why: "**Ich wünschte** + the Konjunktiv II." },
            { at: "r3", k: "pick", q: "Es wäre schön, wenn du mich ___.", o: ["besuchen würdest", "würdest besuchen", "besuchst"], a: 0, why: "After wenn, würde goes to the end." },
            { at: "r4", k: "pick", q: "Er tut so, als ob er krank ___.", o: ["wäre", "ist", "war"], a: 0, why: "als ob + the Konjunktiv II at the end: **wäre**." },
            { at: "r4", k: "pick", q: "Sie nickt, ___ sie alles verstehen würde.", o: ["als ob", "wenn", "ob"], a: 0, why: "*as if* is **als ob**." },
            { at: "table", k: "pick", q: "Er ruft nicht an. → Wenn er doch ___!", o: ["anrufen würde", "anruft", "würde anrufen"], a: 0, why: "A wish: würde + infinitive, würde last." },
            { at: "trap", k: "pick", q: "Which is right?", o: ["Du siehst aus, als ob du müde wärst.", "Du siehst aus, als ob du wärst müde."], a: 0, why: "After als ob the verb goes to the end." },
          ] },
      ],
      diag: [
        { t: "swap", from: "^(habe|hast|hat|haben|habt|bin|bist|ist|sind|seid|kann|kannst|konnen|konnt|muss|musst|mussen|darf|darfst|durfen|weiss|weisst|wissen|gibt|geht|kommt|komme|kommst|kommen)$", to: "^(hatte\\w*|ware\\w*|wart|konnte\\w*|musste\\w*|durfte\\w*|wusste\\w*|gabe|ginge|kame\\w*|wurde\\w*)$", rule: "", hard: true, msg: "It isn't real, so it takes the Konjunktiv II: **{right}**. The Präsens would say it may well happen." },
        { t: "swap", from: "^(hatte\\w*|ware\\w*|konnte\\w*|musste\\w*|wurde\\w*|gabe|kame\\w*)$", to: "^(habe|hast|hat|haben|habt|bin|bist|ist|sind|seid|kann|kannst|konnen|muss|musst|mussen|gibt|kommt|komme|kommst|kommen|bleiben|bleibe|gehen|gehe|ziehe|zieht)$", rule: "cond.real", hard: true, msg: "This may well happen, so it takes the Präsens: **{right}**." },
        { t: "swap", from: "^(wurde|wurdest|wurden|wurdet)$", to: "^(hatte\\w*|ware\\w*|wart|konnte\\w*|musste\\w*|durfte\\w*|wusste\\w*)$", rule: "cond.forms", hard: true, msg: "sein, haben and the modals have their own form: **{right}** — not würde + the infinitive." },
        { t: "ending", stem: "(wurd|hatt|war(?=(e|st|en|et|t|est)?$)|konnt|musst)", rule: "", msg: "Right form, wrong person: **{right}**." },
        { t: "swap", from: "^(wenn|ob|wie)$", to: "^als$", rule: "wish.alsob", msg: "*as if* is **als ob** (or als wenn)." },
        { t: "missing", whole: true, tok: "^als$", rule: "wish.alsob", msg: "*as if* is **als ob** (or als wenn)." },
      ],
      drills: [
        // ── Übung 26•25: a real condition ──
        { id: "d26.25", ex: "26.25", t: "transform", fixed: true, title: "If it happens", how: "Join the two with Wenn. It may well happen, so the Präsens stays: verb, comma, verb.", items: [
          { q: "Es regnet. Wir bleiben zu Hause.", a: ["Wenn es regnet, bleiben wir zu Hause."], r: ["cond.real"] },
          { q: "Du hast Hunger. Im Kühlschrank ist noch Suppe.", a: ["Wenn du Hunger hast, ist im Kühlschrank noch Suppe.", "Wenn du Hunger hast, ist noch Suppe im Kühlschrank."], r: ["cond.real"] },
          { q: "Der Zug hat Verspätung. Ich rufe dich an.", a: ["Wenn der Zug Verspätung hat, rufe ich dich an."], r: ["cond.order"] },
          { q: "Das Wetter ist schön. Wir grillen am See.", a: ["Wenn das Wetter schön ist, grillen wir am See."], r: ["cond.real"] },
          { q: "Lea ist müde. Sie geht früh ins Bett.", a: ["Wenn Lea müde ist, geht sie früh ins Bett."], r: ["cond.order"] },
          { q: "Ihr habt Fragen. Ihr könnt mir schreiben.", a: ["Wenn ihr Fragen habt, könnt ihr mir schreiben."], r: ["cond.order"] },
          { q: "Es schneit. Die Kinder bauen einen Schneemann.", a: ["Wenn es schneit, bauen die Kinder einen Schneemann."], r: ["cond.real"] },
          { q: "Ich finde eine Wohnung. Ich ziehe nach Bern.", a: ["Wenn ich eine Wohnung finde, ziehe ich nach Bern."], r: ["cond.real"] },
          { q: "Sie haben Zeit. Kommen Sie doch vorbei!", a: ["Wenn Sie Zeit haben, kommen Sie doch vorbei!"], r: ["cond.order"] },
          { q: "Der Laden ist zu. Wir kaufen morgen ein.", a: ["Wenn der Laden zu ist, kaufen wir morgen ein."], r: ["cond.real"] },
        ].map(it => ({ ...it, diag: [{ t: "order", rule: "cond.order", msg: "The wenn-part comes first, its verb at the end; after the comma comes the main verb: Wenn es regnet, **bleiben** wir …" }] })) },
        // ── Übung 26•8: not real ──
        { id: "d26.8", ex: "26.8", t: "transform", fixed: true, title: "If it were so", how: "It isn't true now. Join the two with Wenn, in the Konjunktiv II: Wenn … hätte, würde …", items: [
          { q: "Ich habe mehr Zeit. Ich lerne Italienisch.", a: ["Wenn ich mehr Zeit hätte, würde ich Italienisch lernen."], r: ["cond.unreal"] },
          { q: "Wir haben einen Garten. Wir pflanzen Tomaten.", a: ["Wenn wir einen Garten hätten, würden wir Tomaten pflanzen."], r: ["cond.unreal"] },
          { q: "Das Wetter ist besser. Wir gehen wandern.", a: ["Wenn das Wetter besser wäre, würden wir wandern gehen.", "Wenn das Wetter besser wäre, gingen wir wandern."], r: ["cond.forms"] },
          { q: "Marco hat ein Auto. Er holt uns ab.", a: ["Wenn Marco ein Auto hätte, würde er uns abholen."], r: ["cond.unreal"] },
          { q: "Die Wohnung ist größer. Wir nehmen sie.", a: ["Wenn die Wohnung größer wäre, würden wir sie nehmen."], r: ["cond.forms"] },
          { q: "Ich bin reich. Ich höre auf zu arbeiten.", a: ["Wenn ich reich wäre, würde ich aufhören zu arbeiten.", "Wenn ich reich wäre, würde ich nicht mehr arbeiten."], r: ["cond.unreal"] },
          { q: "Du bist hier. Wir trinken zusammen einen Kaffee.", a: ["Wenn du hier wärst, würden wir zusammen einen Kaffee trinken.", "Wenn du hier wärest, würden wir zusammen einen Kaffee trinken."], r: ["cond.forms"] },
          { q: "Es gibt keinen Stau. Wir sind schon da.", a: ["Wenn es keinen Stau gäbe, wären wir schon da."], r: ["cond.forms"] },
          { q: "Ihr habt ein Halbtax. Die Reise ist billiger.", a: ["Wenn ihr ein Halbtax hättet, wäre die Reise billiger."], r: ["cond.forms"] },
          { q: "Sara spricht Deutsch. Sie findet schneller eine Stelle.", a: ["Wenn Sara Deutsch sprechen würde, würde sie schneller eine Stelle finden.", "Wenn Sara Deutsch spräche, würde sie schneller eine Stelle finden.", "Wenn Sara Deutsch sprechen würde, fände sie schneller eine Stelle."], r: ["cond.unreal"] },
        ].map(it => ({ ...it, diag: [{ t: "order", rule: "cond.order", msg: "The wenn-part first, its verb at the end (hätte, wäre); after the comma comes the main verb: …, **würde** ich … lernen." }] })) },
        // ── Übung 27•7: not real — with a modal ──
        { id: "d27.7", ex: "27.7", t: "transform", fixed: true, title: "If I could …", how: "It isn't true now. Join the two with Wenn, in the Konjunktiv II: könnte, müsste, dürfte for a modal.", items: [
          { q: "Ich kann gut kochen. Ich lade euch ein.", a: ["Wenn ich gut kochen könnte, würde ich euch einladen."], r: ["cond.forms"] },
          { q: "Ich muss nicht arbeiten. Ich komme mit.", a: ["Wenn ich nicht arbeiten müsste, würde ich mitkommen.", "Wenn ich nicht arbeiten müsste, käme ich mit."], r: ["cond.forms"] },
          { q: "Die Kinder dürfen länger aufbleiben. Sie sind glücklich.", a: ["Wenn die Kinder länger aufbleiben dürften, wären sie glücklich."], r: ["cond.forms"] },
          { q: "Wir können Deutsch. Wir verstehen die Nachbarn.", a: ["Wenn wir Deutsch könnten, würden wir die Nachbarn verstehen.", "Wenn wir Deutsch sprechen könnten, würden wir die Nachbarn verstehen."], r: ["cond.forms"] },
          { q: "Du weißt die Antwort. Du sagst es mir.", a: ["Wenn du die Antwort wüsstest, würdest du es mir sagen.", "Wenn du die Antwort wüsstest, würdest du sie mir sagen."], r: ["cond.forms"] },
          { q: "Er kommt pünktlich. Wir können anfangen.", a: ["Wenn er pünktlich kommen würde, könnten wir anfangen.", "Wenn er pünktlich käme, könnten wir anfangen."], r: ["cond.unreal"] },
          { q: "Ich kann Ski fahren. Ich fahre im Winter nach Davos.", a: ["Wenn ich Ski fahren könnte, würde ich im Winter nach Davos fahren.", "Wenn ich Ski fahren könnte, führe ich im Winter nach Davos."], r: ["cond.forms"] },
          { q: "Man darf hier parken. Wir bleiben länger.", a: ["Wenn man hier parken dürfte, würden wir länger bleiben."], r: ["cond.forms"] },
          { q: "Ihr müsst nicht so früh aufstehen. Ihr seid nicht so müde.", a: ["Wenn ihr nicht so früh aufstehen müsstet, wärt ihr nicht so müde.", "Wenn ihr nicht so früh aufstehen müsstet, wäret ihr nicht so müde."], r: ["cond.forms"] },
          { q: "Ich habe ein Velo. Ich fahre damit zur Arbeit.", a: ["Wenn ich ein Velo hätte, würde ich damit zur Arbeit fahren."], r: ["cond.unreal"] },
        ].map(it => ({ ...it, diag: [{ t: "order", rule: "cond.order", msg: "In the wenn-part the verb goes to the very end (kochen **könnte**); after the comma comes the main verb (**würde** ich …)." }] })) },
        // ── Übung 26•27: from real to not real ──
        { id: "d26.27", ex: "26.27", t: "transform", fixed: true, title: "Real → not real", how: "Say it as something only imagined: the Konjunktiv II in both parts.", items: [
          { q: "Wenn ich Zeit habe, besuche ich meine Oma.", a: ["Wenn ich Zeit hätte, würde ich meine Oma besuchen."], r: ["cond.unreal"] },
          { q: "Wenn es warm ist, schwimmen wir im See.", a: ["Wenn es warm wäre, würden wir im See schwimmen."], r: ["cond.unreal"] },
          { q: "Wenn du mitkommst, ist es lustiger.", a: ["Wenn du mitkommen würdest, wäre es lustiger.", "Wenn du mitkämest, wäre es lustiger.", "Wenn du mitkämst, wäre es lustiger."], r: ["cond.forms"] },
          { q: "Wenn wir Geld haben, kaufen wir ein neues Sofa.", a: ["Wenn wir Geld hätten, würden wir ein neues Sofa kaufen."], r: ["cond.unreal"] },
          { q: "Wenn er anruft, bin ich froh.", a: ["Wenn er anrufen würde, wäre ich froh."], r: ["cond.forms"] },
          { q: "Wenn das Kino offen ist, gehen wir hin.", a: ["Wenn das Kino offen wäre, würden wir hingehen.", "Wenn das Kino offen wäre, gingen wir hin."], r: ["cond.unreal"] },
          { q: "Wenn ich kann, helfe ich dir.", a: ["Wenn ich könnte, würde ich dir helfen."], r: ["cond.forms"] },
          { q: "Wenn ihr Lust habt, machen wir ein Picknick.", a: ["Wenn ihr Lust hättet, würden wir ein Picknick machen."], r: ["cond.unreal"] },
          { q: "Wenn der Bus kommt, sind wir pünktlich.", a: ["Wenn der Bus kommen würde, wären wir pünktlich.", "Wenn der Bus käme, wären wir pünktlich."], r: ["cond.forms"] },
          { q: "Wenn es keinen Schnee gibt, fahren wir nicht in die Berge.", a: ["Wenn es keinen Schnee gäbe, würden wir nicht in die Berge fahren."], r: ["cond.forms"] },
        ] },
        // ── Übung 26•29: if I had no car … ──
        { id: "d26.29", ex: "26.29", t: "transform", fixed: true, title: "Without a car", how: "Start with: Wenn ich kein Auto hätte, … and say what you would do.", items: [
          { q: "mit dem Velo zur Arbeit fahren", a: ["Wenn ich kein Auto hätte, würde ich mit dem Velo zur Arbeit fahren."], r: ["cond.order"] },
          { q: "ein Generalabonnement kaufen", a: ["Wenn ich kein Auto hätte, würde ich ein Generalabonnement kaufen."], r: ["cond.order"] },
          { q: "früher aufstehen", a: ["Wenn ich kein Auto hätte, würde ich früher aufstehen."], r: ["cond.order"] },
          { q: "mehr Geld sparen", a: ["Wenn ich kein Auto hätte, würde ich mehr Geld sparen."], r: ["cond.order"] },
          { q: "den Bus nehmen", a: ["Wenn ich kein Auto hätte, würde ich den Bus nehmen."], r: ["cond.order"] },
          { q: "näher am Bahnhof wohnen", a: ["Wenn ich kein Auto hätte, würde ich näher am Bahnhof wohnen."], r: ["cond.order"] },
          { q: "im Dorf einkaufen", a: ["Wenn ich kein Auto hätte, würde ich im Dorf einkaufen."], r: ["cond.order"] },
          { q: "fitter sein", a: ["Wenn ich kein Auto hätte, wäre ich fitter."], r: ["cond.forms"] },
          { q: "weniger Stress haben", a: ["Wenn ich kein Auto hätte, hätte ich weniger Stress."], r: ["cond.forms"] },
        ].map(it => ({ ...it, diag: [{ t: "order", rule: "cond.order", msg: "After the wenn-part, the main part starts with its verb: …, **würde** ich … fahren." }] })) },
        // ── Übung 26•30: a free year ──
        { id: "d26.30", ex: "26.30", t: "transform", fixed: true, title: "A free year", how: "The Meiers dream: Wenn wir ein Jahr frei hätten, … Say what they would do.", items: [
          { q: "um die Welt reisen", a: ["Wenn wir ein Jahr frei hätten, würden wir um die Welt reisen."], r: ["cond.unreal"] },
          { q: "ein Haus im Tessin mieten", a: ["Wenn wir ein Jahr frei hätten, würden wir ein Haus im Tessin mieten."], r: ["cond.unreal"] },
          { q: "jeden Tag lange schlafen", a: ["Wenn wir ein Jahr frei hätten, würden wir jeden Tag lange schlafen."], r: ["cond.unreal"] },
          { q: "Spanisch lernen", a: ["Wenn wir ein Jahr frei hätten, würden wir Spanisch lernen."], r: ["cond.unreal"] },
          { q: "unsere Familie in Brasilien besuchen", a: ["Wenn wir ein Jahr frei hätten, würden wir unsere Familie in Brasilien besuchen."], r: ["cond.unreal"] },
          { q: "ein Buch schreiben", a: ["Wenn wir ein Jahr frei hätten, würden wir ein Buch schreiben."], r: ["cond.unreal"] },
          { q: "viel Zeit mit den Kindern verbringen", a: ["Wenn wir ein Jahr frei hätten, würden wir viel Zeit mit den Kindern verbringen."], r: ["cond.unreal"] },
          { q: "glücklich sein", a: ["Wenn wir ein Jahr frei hätten, wären wir glücklich."], r: ["cond.forms"] },
          { q: "nicht ans Büro denken", a: ["Wenn wir ein Jahr frei hätten, würden wir nicht ans Büro denken."], r: ["cond.unreal"] },
        ] },
        // ── Übung 26•6: if only … ──
        { id: "d26.6", ex: "26.6", t: "transform", fixed: true, title: "If only …", how: "Make it a wish: Wenn … nur / doch …! — the Konjunktiv II at the end.", items: [
          { q: "Ich habe keine Zeit.", a: ["Wenn ich nur Zeit hätte!", "Wenn ich nur mehr Zeit hätte!"], r: ["wish.wenn"] },
          { q: "Es ist so kalt.", a: ["Wenn es nur nicht so kalt wäre!", "Wenn es nur wärmer wäre!"], r: ["wish.wenn"] },
          { q: "Mein Bruder wohnt so weit weg.", a: ["Wenn mein Bruder nur nicht so weit weg wohnen würde!", "Wenn mein Bruder nur näher wohnen würde!"], r: ["wish.wenn"] },
          { q: "Ich kann nicht schwimmen.", a: ["Wenn ich nur schwimmen könnte!"], r: ["wish.wenn"] },
          { q: "Die Miete ist so hoch.", a: ["Wenn die Miete nur nicht so hoch wäre!"], r: ["wish.wenn"] },
          { q: "Wir haben kein Auto.", a: ["Wenn wir nur ein Auto hätten!"], r: ["wish.wenn"] },
          { q: "Du bist nicht hier.", a: ["Wenn du nur hier wärst!", "Wenn du nur hier wärest!"], r: ["wish.wenn"] },
          { q: "Ich verstehe den Dialekt nicht.", a: ["Wenn ich nur den Dialekt verstehen würde!", "Wenn ich den Dialekt nur verstehen würde!", "Wenn ich nur den Dialekt verstehen könnte!", "Wenn ich den Dialekt nur verstehen könnte!"], r: ["wish.wenn"] },
          { q: "Der Bus kommt nicht.", a: ["Wenn der Bus nur kommen würde!", "Wenn der Bus nur käme!", "Wenn der Bus nur endlich kommen würde!", "Wenn der Bus nur endlich käme!"], r: ["wish.wenn"] },
          { q: "Es regnet schon wieder.", a: ["Wenn es nur nicht schon wieder regnen würde!", "Wenn es nur nicht regnen würde!"], r: ["wish.wenn"] },
        ].map(it => ({ ...it, a: [...new Set(it.a.flatMap(x => [x, x.replace(/\bnur\b/, "doch"), x.replace(/\bnur\b/, "doch nur")]))], diag: CX_WISH_DIAG })) },
        // ── Übung 26•26: a flatmate's wishes ──
        { id: "d26.26", ex: "26.26", t: "transform", fixed: true, title: "If only he would …", how: "Tim's flatmate drives him crazy. Make Tim's wishes: Wenn er nur … würde! (or hätte, wäre)", items: [
          { q: "das Geschirr abwaschen", a: ["Wenn er nur das Geschirr abwaschen würde!"], r: ["wish.wenn"] },
          { q: "nicht so laut Musik hören", a: ["Wenn er nur nicht so laut Musik hören würde!"], r: ["wish.wenn"] },
          { q: "den Abfall rausbringen", a: ["Wenn er nur den Abfall rausbringen würde!"], r: ["wish.wenn"] },
          { q: "die Miete pünktlich bezahlen", a: ["Wenn er nur die Miete pünktlich bezahlen würde!"], r: ["wish.wenn"] },
          { q: "nicht so lange duschen", a: ["Wenn er nur nicht so lange duschen würde!"], r: ["wish.wenn"] },
          { q: "seine Schuhe wegräumen", a: ["Wenn er nur seine Schuhe wegräumen würde!"], r: ["wish.wenn"] },
          { q: "ordentlicher sein", a: ["Wenn er nur ordentlicher wäre!"], r: ["cond.forms"] },
          { q: "mehr Zeit für den Haushalt haben", a: ["Wenn er nur mehr Zeit für den Haushalt hätte!"], r: ["cond.forms"] },
          { q: "am Wochenende nicht bis Mittag schlafen", a: ["Wenn er nur am Wochenende nicht bis Mittag schlafen würde!"], r: ["wish.wenn"] },
        ].map(it => ({ ...it, a: [...new Set(it.a.flatMap(x => [x, x.replace(/\bnur\b/, "doch"), x.replace(/\bnur\b/, "doch nur")]))], diag: CX_WISH_DIAG })) },
        // ── Übung 27•6: wishes from a phrase ──
        { id: "d27.6", ex: "27.6", t: "transform", fixed: true, title: "Make a wish", how: "Make a wish about yourself from the phrase: Wenn ich nur …!", items: [
          { q: "(mehr Geld haben)", a: ["Wenn ich nur mehr Geld hätte!"], r: ["wish.wenn"] },
          { q: "(schneller lernen)", a: ["Wenn ich nur schneller lernen würde!", "Wenn ich nur schneller lernen könnte!"], r: ["wish.wenn"] },
          { q: "(besser schlafen können)", a: ["Wenn ich nur besser schlafen könnte!"], r: ["wish.wenn"] },
          { q: "(nicht so müde sein)", a: ["Wenn ich nur nicht so müde wäre!"], r: ["wish.wenn"] },
          { q: "(eine größere Wohnung finden)", a: ["Wenn ich nur eine größere Wohnung finden würde!", "Wenn ich nur eine größere Wohnung finden könnte!", "Wenn ich nur eine größere Wohnung fände!"], r: ["wish.wenn"] },
          { q: "(morgen nicht arbeiten müssen)", a: ["Wenn ich nur morgen nicht arbeiten müsste!", "Wenn ich morgen nur nicht arbeiten müsste!"], r: ["wish.wenn"] },
          { q: "(die Antwort wissen)", a: ["Wenn ich nur die Antwort wüsste!"], r: ["wish.wenn"] },
          { q: "(schon in den Ferien sein)", a: ["Wenn ich nur schon in den Ferien wäre!"], r: ["wish.wenn"] },
          { q: "(Schweizerdeutsch verstehen)", a: ["Wenn ich nur Schweizerdeutsch verstehen würde!", "Wenn ich nur Schweizerdeutsch verstehen könnte!"], r: ["wish.wenn"] },
        ].map(it => ({ ...it, a: [...new Set(it.a.flatMap(x => [x, x.replace(/\bnur\b/, "doch"), x.replace(/\bnur\b/, "doch nur")]))], diag: CX_WISH_DIAG })) },
        // ── Übung 27•12: without wenn ──
        { id: "d27.12", ex: "27.12", t: "transform", fixed: true, title: "Without wenn", how: "Say it again without wenn: the verb comes first.", items: [
          { q: "Wenn ich nur mehr Zeit hätte!", a: ["Hätte ich nur mehr Zeit!", "Hätte ich doch nur mehr Zeit!"], r: ["wish.verb"] },
          { q: "Wenn es doch wärmer wäre!", a: ["Wäre es doch wärmer!", "Wäre es doch nur wärmer!"], r: ["wish.verb"] },
          { q: "Wenn du nur hier wärst!", a: ["Wärst du nur hier!", "Wärest du nur hier!"], r: ["wish.verb"] },
          { q: "Wenn wir doch ein Auto hätten!", a: ["Hätten wir doch ein Auto!", "Hätten wir doch nur ein Auto!"], r: ["wish.verb"] },
          { q: "Wenn ich nur besser singen könnte!", a: ["Könnte ich nur besser singen!", "Könnte ich doch nur besser singen!"], r: ["wish.verb"] },
          { q: "Wenn er doch anrufen würde!", a: ["Würde er doch anrufen!", "Würde er doch nur anrufen!"], r: ["wish.verb"] },
          { q: "Wenn die Prüfung nur schon vorbei wäre!", a: ["Wäre die Prüfung nur schon vorbei!", "Wäre die Prüfung doch nur schon vorbei!"], r: ["wish.verb"] },
          { q: "Wenn ich doch nicht arbeiten müsste!", a: ["Müsste ich doch nicht arbeiten!", "Müsste ich doch nur nicht arbeiten!"], r: ["wish.verb"] },
          { q: "Wenn ich Zeit hätte, würde ich kommen.", a: ["Hätte ich Zeit, würde ich kommen."], r: ["wish.verb"] },
          { q: "Wenn das Wetter schön wäre, könnten wir grillen.", a: ["Wäre das Wetter schön, könnten wir grillen."], r: ["wish.verb"] },
        ].map(it => ({ ...it, diag: [{ t: "order", rule: "wish.verb", msg: "Without wenn, the verb takes the first place: **Hätte** ich nur …!" }] })) },
        // ── Übung 26•7: as if ──
        { id: "d26.7", ex: "26.7", t: "transform", fixed: true, title: "As if …", how: "Start with: Er tut so, als ob … — the Konjunktiv II at the end.", items: [
          { q: "Er ist krank.", a: ["Er tut so, als ob er krank wäre."], r: ["wish.alsob"] },
          { q: "Er hat keine Zeit.", a: ["Er tut so, als ob er keine Zeit hätte."], r: ["wish.alsob"] },
          { q: "Er versteht kein Wort.", a: ["Er tut so, als ob er kein Wort verstehen würde.", "Er tut so, als ob er kein Wort verstünde."], r: ["wish.alsob"] },
          { q: "Er kennt mich nicht.", a: ["Er tut so, als ob er mich nicht kennen würde.", "Er tut so, als ob er mich nicht kennte."], r: ["wish.alsob"] },
          { q: "Er weiß alles.", a: ["Er tut so, als ob er alles wüsste."], r: ["wish.alsob"] },
          { q: "Er kann nicht kochen.", a: ["Er tut so, als ob er nicht kochen könnte."], r: ["wish.alsob"] },
          { q: "Er ist der Chef.", a: ["Er tut so, als ob er der Chef wäre."], r: ["wish.alsob"] },
          { q: "Er hört mich nicht.", a: ["Er tut so, als ob er mich nicht hören würde.", "Er tut so, als ob er mich nicht hörte."], r: ["wish.alsob"] },
          { q: "Er muss die ganze Arbeit allein machen.", a: ["Er tut so, als ob er die ganze Arbeit allein machen müsste."], r: ["wish.alsob"] },
        ].map(it => ({ ...it, a: [...new Set(it.a.flatMap(x => [x, x.replace("als ob", "als wenn")]))], diag: [{ t: "order", rule: "wish.alsob", msg: "After als ob, the verb goes to the very end: als ob er krank **wäre**." }] })) },
        // ── Übung 27•8: it looks as if … ──
        { id: "d27.8", ex: "27.8", t: "transform", fixed: true, title: "It looks as if …", how: "Start with the words given, then als ob + the sentence in the Konjunktiv II.", items: [
          { q: "Du siehst aus, als ob … (Du bist müde.)", a: ["Du siehst aus, als ob du müde wärst.", "Du siehst aus, als ob du müde wärest."], r: ["wish.alsob"] },
          { q: "Es sieht aus, als ob … (Es regnet bald.)", a: ["Es sieht aus, als ob es bald regnen würde.", "Es sieht aus, als ob es bald regnete."], r: ["wish.alsob"] },
          { q: "Sie lacht, als ob … (Sie findet das lustig.)", a: ["Sie lacht, als ob sie das lustig finden würde.", "Sie lacht, als ob sie das lustig fände."], r: ["wish.alsob"] },
          { q: "Der Hund bellt, als ob … (Jemand ist an der Tür.)", a: ["Der Hund bellt, als ob jemand an der Tür wäre."], r: ["wish.alsob"] },
          { q: "Mein Sohn isst, als ob … (Er bekommt nie etwas zu essen.)", a: ["Mein Sohn isst, als ob er nie etwas zu essen bekommen würde.", "Mein Sohn isst, als ob er nie etwas zu essen bekäme."], r: ["wish.alsob"] },
          { q: "Er fährt, als ob … (Die Straße gehört ihm.)", a: ["Er fährt, als ob die Straße ihm gehören würde.", "Er fährt, als ob ihm die Straße gehören würde.", "Er fährt, als ob die Straße ihm gehörte.", "Er fährt, als ob ihm die Straße gehörte."], r: ["wish.alsob"] },
          { q: "Sie spricht Deutsch, als ob … (Sie ist Schweizerin.)", a: ["Sie spricht Deutsch, als ob sie Schweizerin wäre."], r: ["wish.alsob"] },
          { q: "Es ist so warm, als ob … (Es ist schon Sommer.)", a: ["Es ist so warm, als ob schon Sommer wäre.", "Es ist so warm, als ob es schon Sommer wäre."], r: ["wish.alsob"] },
          { q: "Der Kollege schaut mich an, als ob … (Ich bin verrückt.)", a: ["Der Kollege schaut mich an, als ob ich verrückt wäre."], r: ["wish.alsob"] },
        ].map(it => ({ ...it, a: [...new Set(it.a.flatMap(x => [x, x.replace("als ob", "als wenn")]))] })) },
        // ── Production ──
        // ── Übung 27•15: if … then ──
        { id: "d27.15", ex: "27.15", t: "compose", end: true, title: "Build the if-sentence", how: "Build an if-sentence from the words. It isn't real: the Konjunktiv II in both parts.", items: [
          { w: ["wenn", "Andrea", "mit mir tanzen", "ich", "sich freuen"], a: ["Wenn Andrea mit mir tanzen würde, würde ich mich freuen.", "Wenn Andrea mit mir tanzte, würde ich mich freuen.", "Ich würde mich freuen, wenn Andrea mit mir tanzen würde."], r: ["cond.unreal"] },
          { w: ["wenn", "ich", "mehr Geld", "haben", "ich", "ein Haus kaufen"], a: ["Wenn ich mehr Geld hätte, würde ich ein Haus kaufen.", "Ich würde ein Haus kaufen, wenn ich mehr Geld hätte."], r: ["cond.forms"] },
          { w: ["wenn", "es", "nicht regnen", "wir", "wandern gehen"], a: ["Wenn es nicht regnen würde, würden wir wandern gehen.", "Wenn es nicht regnete, würden wir wandern gehen.", "Wenn es nicht regnen würde, gingen wir wandern.", "Wir würden wandern gehen, wenn es nicht regnen würde."], r: ["cond.unreal"] },
          { w: ["wenn", "du", "hier sein", "wir", "zusammen kochen"], a: ["Wenn du hier wärst, würden wir zusammen kochen.", "Wenn du hier wärest, würden wir zusammen kochen.", "Wir würden zusammen kochen, wenn du hier wärst."], r: ["cond.forms"] },
          { w: ["ich", "dir helfen", "wenn", "ich", "können"], a: ["Ich würde dir helfen, wenn ich könnte.", "Wenn ich könnte, würde ich dir helfen."], r: ["cond.order"] },
          { w: ["wenn", "der Zug", "pünktlich sein", "wir", "nicht warten müssen"], a: ["Wenn der Zug pünktlich wäre, müssten wir nicht warten.", "Wir müssten nicht warten, wenn der Zug pünktlich wäre.", "Wenn der Zug pünktlich wäre, würden wir nicht warten müssen."], r: ["cond.forms"] },
          { w: ["wenn", "ich", "du", "sein", "ich", "das nicht machen"], a: ["Wenn ich du wäre, würde ich das nicht machen.", "Ich würde das nicht machen, wenn ich du wäre."], r: ["cond.forms"] },
          { w: ["es", "schön sein", "wenn", "ihr", "kommen"], a: ["Es wäre schön, wenn ihr kommen würdet.", "Es wäre schön, wenn ihr kämt.", "Es wäre schön, wenn ihr kämet."], r: ["wish.ich"] },
          { w: ["ich", "wünschte", "ich", "mehr Zeit", "haben"], a: ["Ich wünschte, ich hätte mehr Zeit."], r: ["wish.ich"] },
        ] },
        { id: "dp.cond", t: "translate", end: true, title: "Say it in German", how: "Translate. Real: the Präsens. Imagined: the Konjunktiv II.", items: [
          { q: "If it rains, we'll stay at home.", a: ["Wenn es regnet, bleiben wir zu Hause.", "Wir bleiben zu Hause, wenn es regnet.", "Wenn es regnet, bleiben wir daheim.", "Wenn es regnet, bleiben wir zuhause."], r: ["cond.real"] },
          { q: "If I had time, I would come.", a: ["Wenn ich Zeit hätte, würde ich kommen.", "Wenn ich Zeit hätte, käme ich.", "Ich würde kommen, wenn ich Zeit hätte."], r: ["cond.unreal"] },
          { q: "If I were you, I would wait.", a: ["Wenn ich du wäre, würde ich warten.", "Ich würde warten, wenn ich du wäre.", "An deiner Stelle würde ich warten."], r: ["cond.forms"] },
          { q: "If only I could sleep!", a: ["Wenn ich nur schlafen könnte!", "Wenn ich doch schlafen könnte!", "Könnte ich nur schlafen!", "Könnte ich doch schlafen!", "Wenn ich doch nur schlafen könnte!", "Könnte ich doch nur schlafen!"], r: ["wish.wenn"], diag: CX_WISH_DIAG },
          { q: "If only the weather were better!", a: ["Wenn das Wetter nur besser wäre!", "Wenn das Wetter doch besser wäre!", "Wäre das Wetter nur besser!", "Wäre das Wetter doch besser!", "Wenn das Wetter doch nur besser wäre!", "Wäre das Wetter doch nur besser!"], r: ["wish.verb"], diag: CX_WISH_DIAG },
          { q: "I wish I had more money.", a: ["Ich wünschte, ich hätte mehr Geld.", "Ich wünschte mir, ich hätte mehr Geld."], r: ["wish.ich"] },
          { q: "He acts as if he knew everything.", a: ["Er tut so, als ob er alles wüsste.", "Er tut so, als wenn er alles wüsste.", "Er tut, als ob er alles wüsste.", "Er tut so, als wüsste er alles."], r: ["wish.alsob"] },
          { q: "It would be nice if you came along. (du)", a: ["Es wäre schön, wenn du mitkommen würdest.", "Es wäre schön, wenn du mitkämst.", "Es wäre nett, wenn du mitkommen würdest."], r: ["wish.ich"] },
          { q: "If you have questions, call me. (du)", a: ["Wenn du Fragen hast, ruf mich an.", "Wenn du Fragen hast, ruf mich an!", "Ruf mich an, wenn du Fragen hast."], r: ["cond.real"] },
          { q: "If we had a garden, we would grow vegetables.", a: ["Wenn wir einen Garten hätten, würden wir Gemüse anpflanzen.", "Wenn wir einen Garten hätten, würden wir Gemüse pflanzen.", "Wenn wir einen Garten hätten, würden wir Gemüse anbauen."], r: ["cond.unreal"] },
          { q: "You look as if you were tired. (du)", a: ["Du siehst aus, als ob du müde wärst.", "Du siehst aus, als wenn du müde wärst.", "Du siehst aus, als ob du müde wärest.", "Du siehst aus, als wärst du müde."], r: ["wish.alsob"] },
          { q: "If I could, I would help you. (dir)", a: ["Wenn ich könnte, würde ich dir helfen.", "Ich würde dir helfen, wenn ich könnte."], r: ["cond.forms"] },
        ] },
        // ── Übung 27•13: set the condition ──
        { id: "d27.13", ex: "27.13", t: "write", end: true, title: "What would it take?", how: "Write the wenn-part that makes each sentence true for you. Saved for Claude to correct.", items: [
          { q: "…, würde ich am Meer wohnen.", model: ["Wenn ich nicht in der Schweiz arbeiten würde, würde ich am Meer wohnen."], r: ["cond.unreal"] },
          { q: "…, würden wir jeden Abend zusammen essen.", model: ["Wenn wir nicht so viel arbeiten müssten, würden wir jeden Abend zusammen essen."], r: ["cond.unreal"] },
          { q: "…, hätte ich mehr Freunde hier.", model: ["Wenn ich besser Deutsch sprechen könnte, hätte ich mehr Freunde hier."], r: ["cond.forms"] },
          { q: "…, wäre ich sehr glücklich.", model: ["Wenn meine Familie hier wohnen würde, wäre ich sehr glücklich."], r: ["cond.forms"] },
          { q: "…, würde ich nie mehr Auto fahren.", model: ["Wenn der Zug auch nachts fahren würde, würde ich nie mehr Auto fahren."], r: ["cond.unreal"] },
          { q: "…, könnte ich ein Instrument lernen.", model: ["Wenn ich am Abend mehr Zeit hätte, könnte ich ein Instrument lernen."], r: ["cond.forms"] },
          { q: "…, würde ich sofort umziehen.", model: ["Wenn ich eine günstige Wohnung in Zürich finden würde, würde ich sofort umziehen."], r: ["cond.unreal"] },
          { q: "…, müsste ich nicht so früh aufstehen.", model: ["Wenn mein Büro näher wäre, müsste ich nicht so früh aufstehen."], r: ["cond.forms"] },
        ] },
        // ── Übung 27•11: as if — your own ──
        { id: "d27.11", ex: "27.11", t: "write", end: true, title: "Your own: wishes and as if", how: "Write in your own words. Saved for Claude to correct.", items: [
          { q: "Three things you wish were different in your life. (Wenn ich nur … · Ich wünschte, …)", model: ["Wenn ich nur mehr Zeit für Sport hätte! Ich wünschte, meine Familie würde näher wohnen. Wäre die Miete doch nicht so hoch!"], r: ["wish.wenn"] },
          { q: "Someone who acts as if … (Mein Chef tut so, als ob …)", model: ["Mein Nachbar tut so, als ob ihm das ganze Haus gehören würde. Er redet, als ob er alles wüsste."], r: ["wish.alsob"] },
          { q: "What would you do with a million francs?", model: ["Wenn ich eine Million Franken hätte, würde ich zuerst meine Eltern einladen. Dann würde ich ein kleines Haus kaufen und weniger arbeiten."], r: ["cond.unreal"] },
          { q: "If you could live anywhere, where would it be? Why?", model: ["Wenn ich wohnen könnte, wo ich will, würde ich in Lugano wohnen. Dort wäre es wärmer, und ich könnte jeden Tag im See schwimmen."], r: ["cond.forms"] },
          { q: "Your plans for the weekend: what you'll do if the weather is good, and if it rains.", model: ["Wenn das Wetter schön ist, gehen wir wandern. Wenn es regnet, besuchen wir ein Museum in Basel."], r: ["cond.real"] },
          { q: "Give a friend advice: Wenn ich du wäre, …", model: ["Wenn ich du wäre, würde ich die Stelle nehmen. Ich würde aber zuerst noch mit deiner Familie sprechen."], r: ["cond.forms"] },
          { q: "A day that felt as if … (Es war, als ob …)", model: ["Der erste Schnee war wunderschön. Es war, als ob die ganze Stadt schlafen würde."], r: ["wish.alsob"] },
          { q: "What would be different if you spoke perfect German?", model: ["Wenn ich perfekt Deutsch sprechen würde, hätte ich eine bessere Stelle. Ich könnte mit allen Nachbarn reden und müsste nie mehr nachfragen."], r: ["cond.unreal"] },
        ] },
      ],
    },
  },
});

// What chapters 26 and 27 became for this lesson. 26•28 (Wenn ich klug gewesen
// wäre, …), 27•14 (a condition in the past) and the past half of 27•15 are the
// Konjunktiv II · past's (post-B1); 27•1, 27•2 and 27•10 (Konjunktiv I,
// indirect discourse) are the bonus lesson's (s4.k1).
cxCover({
  "26.6": "d26.6", "26.7": "d26.7", "26.8": "d26.8", "26.25": "d26.25", "26.26": "d26.26", "26.27": "d26.27",
  "26.29": "d26.29", "26.30": "d26.30",
  "27.6": "d27.6", "27.7": "d27.7", "27.8": "d27.8", "27.11": "d27.11", "27.12": "d27.12", "27.13": "d27.13", "27.15": "d27.15",
  "27.14": { st: "planned", sec: "s4.k2p" },
  "27.1": { st: "planned", sec: "s4.k1" }, "27.2": { st: "planned", sec: "s4.k1" }, "27.10": { st: "planned", sec: "s4.k1" },
});
cxJournal([
  { id: "w.ifonly", th: "opinion", lv: "B1", de: "Wenn ich könnte …", t: "Imagine your life a little different: what would you change if you could — where you live, your work, your free time? Say what you would do, and one thing you wish were different now.", help: ["Wenn ich könnte, würde ich …", "Wenn ich mehr Zeit hätte, …", "Ich wünschte, …", "Es wäre schön, wenn …"], sec: "s2.cond" },
]);
