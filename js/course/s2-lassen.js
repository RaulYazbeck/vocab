// ── COURSE PACK · Stage 2 · lassen ──
// Book: chapter 25's "sich lassen + Infinitive" (25•5, 25•16), chapter 17's
// lassen and the verbs of the senses (17•5, 17•6) and chapter 24's double
// infinitive with lassen, hören, sehen, helfen (24•2). Two sheets: lassen +
// infinitive — have it done, let, Lass uns …, leave · the Perfekt with two
// infinitives (habe … reparieren lassen), sehen / hören / helfen +
// infinitive (Ich höre ihn singen), and sich lassen: it can be done (Das
// lässt sich machen). Built on the modals (s1.modal) and on their Perfekt
// (s2.modpf), which works the same way.
// (sich missing is named only where sich lassen is the point: in «Lea lässt sich
// die Haare schneiden» the sich is another one)
const CX_LASS_SICH = [{ t: "missing", whole: true, tok: "^sich$", rule: "lass.sich", msg: "*It can be done* is **sich** lassen: Das lässt **sich** machen." }];
cxPack({
  id: "s2-lassen",
  sections: {
    "s2.lassen": {
      testout: { n: 7, miss: 1 },
      rules: {
        "lass.do": "lassen + infinitive: have it done (Ich lasse das Auto reparieren)",
        "lass.let": "lassen: let, allow — and Lass uns …! (let's)",
        "lass.leave": "lassen alone: leave something somewhere, stop",
        "lass.form": "du lässt, er lässt · Präteritum ließ",
        "lass.pf": "Perfekt: habe … reparieren lassen (two infinitives)",
        "lass.sense": "sehen, hören, helfen + infinitive, no zu",
        "lass.sich": "sich lassen: it can be done (Das lässt sich machen)",
      },
      sheets: [
        { id: "cx.lass1", title: "Ich lasse mein Velo reparieren", qn: 3,
          struct: [["Ich", "who"], ["lasse", "verb"], ["mein Velo", "thing"], ["reparieren", "inf"]],
          why: "**lassen** works like a modal: lassen comes second, the other verb goes to the end as an infinitive. It says that **someone else** does it for you, or that you **let** someone do it.",
          rid: ["lass.do", "lass.let", "lass.leave", "lass.form"],
          rules: [
            "**lassen** + an infinitive means you **have it done** by someone else: Ich **lasse** mein Velo **reparieren**. (I don't repair it myself.) · Sie **lässt** sich die Haare **schneiden**.",
            "**lassen** also means **let** or **allow**: **Lass** mich **helfen**! · Meine Eltern **lassen** mich nicht allein **reisen**. **Lass uns** … (let's) makes a suggestion: **Lass uns** ins Kino **gehen**!",
            "With no other verb, **lassen** means **leave** something somewhere, or **stop** something: Ich **lasse** das Auto heute zu Hause. · **Lass** das! (Stop that!)",
            "lassen changes its vowel with du and er: ich lasse, du **lässt**, er **lässt**. Its Präteritum is **ließ**: Er **ließ** den Arzt kommen.",
          ],
          table: { head: ["", "lassen"], rows: [
            ["ich", "lasse"],
            ["du", "**lässt**"],
            ["er / sie / es", "**lässt**"],
            ["wir / sie / Sie", "lassen"],
            ["ihr", "lasst"],
            ["Präteritum", "**ließ**"],
          ] },
          ex: [
            ["Wir **lassen** die Wohnung neu **streichen**.", "We're having the flat repainted."],
            ["**Lässt** du mich bitte **ausreden**?", "Will you let me finish, please?"],
            ["**Lass uns** am Samstag **wandern gehen**!", "Let's go hiking on Saturday!"],
            ["Ich **lasse** den Schirm im Büro — es regnet nicht mehr.", "I'll leave the umbrella at the office — it's stopped raining."],
          ],
          trap: "The infinitive at the end decides the meaning: Ich **repariere** das Auto means you do it yourself; Ich **lasse** das Auto **reparieren** means a mechanic does it. And no zu: ~~lasse … zu reparieren~~.",
          quiz: [
            { at: "r1", k: "pick", q: "A hairdresser cuts her hair:", o: ["Sie lässt sich die Haare schneiden.", "Sie schneidet sich die Haare.", "Sie lässt sich die Haare zu schneiden."], a: 0, why: "Someone else does it: **lassen** + infinitive, no zu." },
            { at: "r1", k: "order", q: "Build it: I'm having my bike repaired.", a: ["Ich", "lasse", "mein Velo", "reparieren."], why: "lassen second, the infinitive at the end." },
            { at: "r2", k: "pick", q: "Let me help! (du)", o: ["Lass mich helfen!", "Lass mir helfen!", "Lass mich zu helfen!"], a: 0, why: "**Lass** + mich (accusative) + the infinitive." },
            { at: "r2", k: "pick", q: "Let's go!", o: ["Lass uns gehen!", "Lassen wir uns gehen!", "Lass gehen uns!"], a: 0, why: "*Let's* is **Lass uns** + the infinitive." },
            { at: "r3", k: "pick", q: "Ich ___ das Auto heute zu Hause.", o: ["lasse", "lässt", "lass"], a: 0, why: "ich **lasse**: here it means *leave*." },
            { at: "r3", k: "pick", q: "Stop that! (du)", o: ["Lass das!", "Lässt das!", "Lass das zu machen!"], a: 0, why: "**Lass das!** means *stop it*." },
            { at: "r4", k: "type", cx: true, q: "Er ___ sein Auto waschen. (lassen)", a: ["lässt"], r: ["lass.form"], why: "er **lässt**, with ä." },
            { at: "r4", k: "type", cx: true, q: "Gestern ___ sie den Arzt kommen. (lassen, Präteritum)", a: ["ließ"], r: ["lass.form"], why: "The Präteritum is **ließ**." },
            { at: "table", k: "pick", q: "___ du mich bitte ausreden?", o: ["Lässt", "Lasst", "Lasse"], a: 0, why: "du **lässt**." },
            { at: "trap", k: "pick", q: "A mechanic does it:", o: ["Ich lasse das Auto reparieren.", "Ich repariere das Auto.", "Ich lasse das Auto zu reparieren."], a: 0, why: "Someone else does it: **lassen** + the infinitive, no zu." },
          ] },
        { id: "cx.lass2", title: "Ich habe es reparieren lassen · Ich höre ihn singen", qn: 3,
          struct: [["Ich", "who"], ["habe", "aux"], ["mein Velo", "thing"], ["reparieren", "inf"], ["lassen", "modal"]],
          why: "Like the modals, **lassen**, **sehen**, **hören** and **helfen** take an infinitive without zu, and lassen ends in two infinitives in the Perfekt. **sich lassen** is an easy way to say *it can be done*.",
          rid: ["lass.pf", "lass.sense", "lass.sich"],
          rules: [
            "In the Perfekt, lassen with another verb works like a modal: **haben** + **two infinitives**, lassen last: Ich **habe** mein Velo **reparieren lassen**. Alone, it takes its Partizip II: Ich **habe** den Schirm im Zug **gelassen**.",
            "**sehen**, **hören** and **helfen** also take an infinitive without zu: Ich **sehe** die Kinder im Garten **spielen**. · Wir **hören** die Nachbarn **streiten**. · Er **hilft** mir die Kisten **tragen**.",
            "**sich lassen** + an infinitive says that something **can be done** — like man kann: Das Fenster **lässt sich** nicht **öffnen**. · Das **lässt sich** machen! (That can be done!)",
          ],
          table: { head: ["Präsens", "Perfekt"], rows: [
            ["**lässt** es **machen**", "**hat** es **machen lassen**"],
            ["**lässt** es hier", "**hat** es hier **gelassen**"],
            ["**lässt sich** ändern", "**hat sich ändern lassen**"],
          ] },
          ex: [
            ["Ich **habe** mir die Haare **schneiden lassen**.", "I've had my hair cut."],
            ["Hast du die Kinder **singen hören**?", "Did you hear the children singing?"],
            ["Sie **sieht** den Bus **kommen** und beginnt zu rennen.", "She sees the bus coming and starts to run."],
            ["Der Fleck **lässt sich** leicht **entfernen**.", "The stain can easily be removed."],
          ],
          trap: "With another verb there is no Partizip II: Ich habe das Auto waschen **lassen**, not ~~waschen gelassen~~. And sich lassen needs its sich: Das **lässt sich** machen — not ~~Das lässt machen~~.",
          quiz: [
            { at: "r1", k: "pick", q: "I've had my car repaired.", o: ["Ich habe mein Auto reparieren lassen.", "Ich habe mein Auto reparieren gelassen.", "Ich bin mein Auto reparieren lassen."], a: 0, why: "haben + two infinitives, lassen last." },
            { at: "r1", k: "pick", q: "I left my umbrella on the train. Ich habe meinen Schirm im Zug ___.", o: ["gelassen", "lassen"], a: 0, why: "No other verb: the Partizip II, **gelassen**." },
            { at: "r1", k: "order", q: "Build it: We had the flat painted.", a: ["Wir", "haben", "die Wohnung", "streichen", "lassen."], why: "haben second, then the two infinitives." },
            { at: "r2", k: "pick", q: "I hear him singing.", o: ["Ich höre ihn singen.", "Ich höre ihn zu singen.", "Ich höre ihn singend."], a: 0, why: "hören + the infinitive, no zu." },
            { at: "r2", k: "pick", q: "Er hilft mir die Kisten ___.", o: ["tragen", "getragen", "trägt"], a: 0, why: "helfen + the infinitive, no zu: tragen. (With a comma: Er hilft mir, die Kisten zu tragen.)" },
            { at: "r3", k: "pick", q: "The window can't be opened.", o: ["Das Fenster lässt sich nicht öffnen.", "Das Fenster lässt nicht öffnen.", "Das Fenster lässt sich nicht zu öffnen."], a: 0, why: "**sich lassen** + the infinitive: it can (not) be done." },
            { at: "r3", k: "type", cx: true, q: "Das Problem ___ sich leicht lösen. (lassen)", a: ["lässt"], r: ["lass.sich"], why: "es **lässt** sich: it can be solved." },
            { at: "table", k: "pick", q: "Er hat das Auto hier ___. (left it)", o: ["gelassen", "lassen", "ließ"], a: 0, why: "Alone: **gelassen**." },
            { at: "trap", k: "pick", q: "Which is right?", o: ["Das lässt sich machen.", "Das lässt machen."], a: 0, why: "sich lassen needs its **sich**." },
          ] },
      ],
      diag: [
        { t: "swap", from: "^gelassen$", to: "^lassen$", rule: "lass.pf", hard: true, msg: "With another verb, lassen stays an infinitive: … reparieren **lassen** — no ge-." },
        { t: "swap", from: "^lassen$", to: "^gelassen$", rule: "lass.pf", hard: true, msg: "lassen alone, with no other verb, takes its Partizip II: **gelassen**." },
        { t: "extra", tok: "^zu$", rule: "lass.do", msg: "After lassen, sehen, hören and helfen comes the bare infinitive — no **zu**." },
        { t: "ending", stem: "(lass|lies)", rule: "lass.form", msg: "lassen must match the subject: **{right}**. (ich lasse, du lässt, er lässt · ließ)" },
        { t: "swap", from: "^(bin|bist|ist|sind|seid)$", to: "^(habe|hast|hat|haben|habt)$", rule: "lass.pf", hard: true, msg: "lassen, sehen and hören take **haben** in the Perfekt: **{right}**." },
        { t: "swap", from: "^mir$", to: "^mich$", rule: "lass.let", hard: true, msg: "lassen takes the accusative: Lass **mich** …" },
      ],
      drills: [
        // ── our own: have it done ──
        { id: "dlass.do", t: "transform", title: "Not myself: lassen", how: "They don't do it themselves. Say it with lassen + the infinitive at the end.", items: [
          { q: "Ich repariere das Velo nicht selbst.", a: ["Ich lasse das Velo reparieren."], r: ["lass.do"], vf: [["lassen", "pr", "ich"]] },
          { q: "Lea schneidet ihre Haare nicht selbst.", a: ["Lea lässt sich die Haare schneiden.", "Lea lässt ihre Haare schneiden."], r: ["lass.form"], vf: [["lassen", "pr", "er"]], cap: true },
          { q: "Wir streichen die Wohnung nicht selbst.", a: ["Wir lassen die Wohnung streichen."], r: ["lass.do"], vf: [["lassen", "pr", "wir"]] },
          { q: "Du wäschst das Auto nicht selbst.", a: ["Du lässt das Auto waschen."], r: ["lass.form"], vf: [["lassen", "pr", "du"]] },
          { q: "Herr Brunner macht seine Steuererklärung nicht selbst.", a: ["Herr Brunner lässt seine Steuererklärung machen."], r: ["lass.do"], vf: [["lassen", "pr", "er"]], cap: true },
          { q: "Ich backe die Torte nicht selbst.", a: ["Ich lasse die Torte backen."], r: ["lass.do"], vf: [["lassen", "pr", "ich"]] },
          { q: "Meine Eltern bauen das Haus nicht selbst.", a: ["Meine Eltern lassen das Haus bauen."], r: ["lass.do"], vf: [["lassen", "pr", "sie"]] },
          { q: "Er bringt die Möbel nicht selbst.", a: ["Er lässt die Möbel bringen."], r: ["lass.form"], vf: [["lassen", "pr", "er"]] },
          { q: "Ihr übersetzt die Dokumente nicht selbst.", a: ["Ihr lasst die Dokumente übersetzen."], r: ["lass.do"], vf: [["lassen", "pr", "ihr"]] },
          { q: "Ich putze die Fenster nicht selbst.", a: ["Ich lasse die Fenster putzen."], r: ["lass.do"], vf: [["lassen", "pr", "ich"]] },
        ].map(it => ({ ...it, diag: [{ t: "order", rule: "lass.do", msg: "lassen is the verb second; the other verb goes to the very end: Ich **lasse** das Velo **reparieren**." }] })) },
        // ── our own: let, let's, leave ──
        { id: "dlass.let", t: "type", title: "Let, let's, leave", how: "Write the form of lassen. du: lass! ihr: lasst! — and Lass uns … for let's.", items: [
          { q: "(let me) ___ mich bitte ausreden!", a: ["Lass"], r: ["lass.let"] },
          { q: "(let's) ___ uns nach Luzern fahren!", a: ["Lass", "Lasst"], r: ["lass.let"] },
          { q: "Meine Eltern ___ mich nicht allein in die Stadt gehen. (let)", a: ["lassen"], r: ["lass.let"] },
          { q: "(du: stop that) ___ das bitte!", a: ["Lass"], r: ["lass.leave"] },
          { q: "Ich ___ das Auto heute zu Hause. (leave)", a: ["lasse"], r: ["lass.leave"] },
          { q: "Kinder, ___ den Hund in Ruhe! (leave)", a: ["lasst"], r: ["lass.leave"] },
          { q: "___ du mich bitte durch? (let)", a: ["Lässt"], r: ["lass.form"] },
          { q: "Der Chef ___ uns heute früher gehen. (let)", a: ["lässt"], r: ["lass.form"] },
          { q: "Wo hast du deine Jacke ___? (left)", a: ["gelassen"], r: ["lass.pf"] },
          { q: "Gestern ___ sie den Arzt kommen. (Präteritum)", a: ["ließ"], r: ["lass.form"] },
        ] },
        // ── Übung 17•5: lassen, now and in the past ──
        { id: "d17.5", ex: "17.5", t: "transform", title: "Now and then", how: "Präsens → Präteritum, Präteritum → Präsens.", items: [
          { q: "Sie lässt ein neues Kleid nähen.", a: ["Sie ließ ein neues Kleid nähen."], r: ["lass.form"], vf: [["lassen", "pt", "er"]] },
          { q: "Wir ließen das Auto in der Garage.", a: ["Wir lassen das Auto in der Garage."], r: ["lass.leave"], vf: [["lassen", "pr", "wir"]] },
          { q: "Der Lehrer lässt die Kinder früher gehen.", a: ["Der Lehrer ließ die Kinder früher gehen."], r: ["lass.let"], vf: [["lassen", "pt", "er"]] },
          { q: "Ich ließ meine Brille reparieren.", a: ["Ich lasse meine Brille reparieren."], r: ["lass.do"], vf: [["lassen", "pr", "ich"]] },
          { q: "Lässt du den Hund allein?", a: ["Ließest du den Hund allein?", "Ließt du den Hund allein?"], r: ["lass.leave"] },
          { q: "Die Firma ließ ein neues Büro bauen.", a: ["Die Firma lässt ein neues Büro bauen."], r: ["lass.do"], vf: [["lassen", "pr", "er"]] },
          { q: "Meine Eltern lassen mich nicht ausgehen.", a: ["Meine Eltern ließen mich nicht ausgehen."], r: ["lass.let"], vf: [["lassen", "pt", "sie"]] },
          { q: "Er ließ seine Schlüssel im Auto.", a: ["Er lässt seine Schlüssel im Auto."], r: ["lass.leave"], vf: [["lassen", "pr", "er"]] },
          { q: "Ihr lasst die Fenster offen.", a: ["Ihr ließt die Fenster offen."], r: ["lass.leave"] },
          { q: "Ich lasse mir die Haare schneiden.", a: ["Ich ließ mir die Haare schneiden."], r: ["lass.do"], vf: [["lassen", "pt", "ich"]] },
        ] },
        // ── Übung 17•6: I hear them, I see them ──
        { id: "d17.6", ex: "17.6", t: "transform", title: "I see them coming", how: "Add the person and the verb in brackets: sehen, hören or helfen + the infinitive, no zu.", items: [
          { q: "Die Kinder spielen im Hof. (ich, sehen)", a: ["Ich sehe die Kinder im Hof spielen."], r: ["lass.sense"] },
          { q: "Die Nachbarn streiten. (wir, hören)", a: ["Wir hören die Nachbarn streiten."], r: ["lass.sense"] },
          { q: "Der Zug kommt. (Mia, sehen)", a: ["Mia sieht den Zug kommen."], r: ["lass.sense"], cap: true },
          { q: "Das Baby weint. (du, hören)", a: ["Du hörst das Baby weinen."], r: ["lass.sense"] },
          { q: "Ich trage die Kisten. (mein Bruder, helfen)", a: ["Mein Bruder hilft mir die Kisten tragen.", "Mein Bruder hilft mir, die Kisten zu tragen."], r: ["lass.sense"] },
          { q: "Jemand kommt die Treppe herauf. (sie, hören)", a: ["Sie hört jemanden die Treppe heraufkommen.", "Sie hört jemand die Treppe heraufkommen."], r: ["lass.sense"] },
          { q: "Die Sonne geht unter. (wir, sehen)", a: ["Wir sehen die Sonne untergehen."], r: ["lass.sense"] },
          { q: "Mein Mann kocht. (ich, helfen)", a: ["Ich helfe meinem Mann kochen.", "Ich helfe meinem Mann beim Kochen."], r: ["lass.sense"] },
          { q: "Der Hund bellt. (ihr, hören)", a: ["Ihr hört den Hund bellen."], r: ["lass.sense"] },
          { q: "Die Vögel singen. (ich, hören)", a: ["Ich höre die Vögel singen."], r: ["lass.sense"] },
        ] },
        // ── Übung 24•2: the Perfekt and the future ──
        { id: "d24.2", ex: "24.2", t: "transform", title: "Perfekt with two infinitives", how: "Say it in the tense in brackets: hat … waschen lassen · wird … waschen lassen. Alone: gelassen.", items: [
          { q: "Er lässt das Auto waschen. (Perfekt)", a: ["Er hat das Auto waschen lassen."], r: ["lass.pf"] },
          { q: "Er lässt das Auto waschen. (Futur)", a: ["Er wird das Auto waschen lassen."], r: ["lass.pf"] },
          { q: "Ich höre die Kinder lachen. (Perfekt)", a: ["Ich habe die Kinder lachen hören.", "Ich habe die Kinder lachen gehört."], r: ["lass.pf"] },
          { q: "Wir sehen den Ballon über dem See fliegen. (Perfekt)", a: ["Wir haben den Ballon über dem See fliegen sehen.", "Wir haben den Ballon über dem See fliegen gesehen."], r: ["lass.pf"] },
          { q: "Frau Keller lässt einen neuen Pass machen. (Perfekt)", a: ["Frau Keller hat einen neuen Pass machen lassen."], r: ["lass.pf"], cap: true },
          { q: "Frau Keller lässt einen neuen Pass machen. (Futur)", a: ["Frau Keller wird einen neuen Pass machen lassen."], r: ["lass.pf"], cap: true },
          { q: "Mein Sohn hilft mir das Velo reparieren. (Perfekt)", a: ["Mein Sohn hat mir das Velo reparieren helfen.", "Mein Sohn hat mir das Velo reparieren geholfen.", "Mein Sohn hat mir geholfen, das Velo zu reparieren."], r: ["lass.pf"] },
          { q: "Ich lasse mir die Haare kurz schneiden. (Perfekt)", a: ["Ich habe mir die Haare kurz schneiden lassen."], r: ["lass.pf"] },
          { q: "Wir lassen die Kinder bei den Großeltern. (Perfekt)", a: ["Wir haben die Kinder bei den Großeltern gelassen."], r: ["lass.pf"] },
          { q: "Die Gemeinde lässt eine neue Brücke bauen. (Futur)", a: ["Die Gemeinde wird eine neue Brücke bauen lassen."], r: ["lass.pf"] },
        ] },
        // ── Übung 25•16: it can be done — sich lassen ──
        { id: "d25.16", ex: "25.16", t: "transform", title: "It can be done", how: "Say it with sich lassen: the thing becomes the subject. (man kann → lässt sich · man konnte → ließ sich)", items: [
          { q: "Man kann den Stuhl reparieren.", a: ["Der Stuhl lässt sich reparieren."], r: ["lass.sich"] },
          { q: "Man kann das Fenster nicht öffnen.", a: ["Das Fenster lässt sich nicht öffnen."], r: ["lass.sich"] },
          { q: "Man kann das Problem leicht lösen.", a: ["Das Problem lässt sich leicht lösen."], r: ["lass.sich"] },
          { q: "Kann man den Termin verschieben?", a: ["Lässt sich der Termin verschieben?"], r: ["lass.sich"] },
          { q: "Man kann diese Jacke in der Maschine waschen.", a: ["Diese Jacke lässt sich in der Maschine waschen."], r: ["lass.sich"] },
          { q: "Man kann das nicht ändern.", a: ["Das lässt sich nicht ändern."], r: ["lass.sich"] },
          { q: "Konnte man den Fleck entfernen?", a: ["Ließ sich der Fleck entfernen?"], r: ["lass.sich"] },
          { q: "Man konnte die Tür nicht abschließen.", a: ["Die Tür ließ sich nicht abschließen."], r: ["lass.sich"] },
          { q: "Man kann den Text gut lesen.", a: ["Der Text lässt sich gut lesen."], r: ["lass.sich"] },
          { q: "Man konnte das Auto nicht mehr reparieren.", a: ["Das Auto ließ sich nicht mehr reparieren."], r: ["lass.sich"] },
        ].map(it => ({ ...it, diag: CX_LASS_SICH })) },
        // ── Übung 25•5: sich lassen in the past ──
        { id: "d25.5", ex: "25.5", t: "transform", title: "sich lassen, then", how: "Say it in the tense in brackets: Präteritum (ließ sich) or Perfekt (hat sich … lassen).", items: [
          { q: "Das lässt sich nicht leicht ändern. (Präteritum)", a: ["Das ließ sich nicht leicht ändern."], r: ["lass.sich"] },
          { q: "Das lässt sich nicht leicht ändern. (Perfekt)", a: ["Das hat sich nicht leicht ändern lassen."], r: ["lass.pf"] },
          { q: "Die Tür lässt sich nicht öffnen. (Präteritum)", a: ["Die Tür ließ sich nicht öffnen."], r: ["lass.sich"] },
          { q: "Die Tür lässt sich nicht öffnen. (Perfekt)", a: ["Die Tür hat sich nicht öffnen lassen."], r: ["lass.pf"] },
          { q: "Der Fehler lässt sich schnell finden. (Präteritum)", a: ["Der Fehler ließ sich schnell finden."], r: ["lass.sich"] },
          { q: "Der Termin lässt sich verschieben. (Perfekt)", a: ["Der Termin hat sich verschieben lassen."], r: ["lass.pf"] },
          { q: "Das Wort lässt sich schwer übersetzen. (Präteritum)", a: ["Das Wort ließ sich schwer übersetzen."], r: ["lass.sich"] },
          { q: "Die Heizung lässt sich nicht reparieren. (Perfekt)", a: ["Die Heizung hat sich nicht reparieren lassen."], r: ["lass.pf"] },
        ].map(it => ({ ...it, diag: CX_LASS_SICH })) },
        // ── Production ──
        { id: "dlass.build", t: "compose", end: true, title: "Build it", how: "Build the sentence with lassen, sehen or hören: the infinitive at the end, no zu.", items: [
          { w: ["ich", "lassen", "mein Auto", "reparieren"], a: ["Ich lasse mein Auto reparieren."], r: ["lass.do"] },
          { w: ["du", "lassen", "mich", "bitte", "ausreden", "?"], a: ["Lässt du mich bitte ausreden?"], r: ["lass.let"] },
          { w: ["lass uns", "am Samstag", "wandern gehen"], a: ["Lass uns am Samstag wandern gehen!", "Lass uns am Samstag wandern gehen.", "Lasst uns am Samstag wandern gehen!"], r: ["lass.let"] },
          { w: ["wir", "die Wohnung", "streichen", "lassen", "(Perfekt)"], a: ["Wir haben die Wohnung streichen lassen."], r: ["lass.pf"] },
          { w: ["ich", "die Kinder", "im Garten", "lachen", "hören"], a: ["Ich höre die Kinder im Garten lachen."], r: ["lass.sense"] },
          { w: ["das", "sich lassen", "machen"], a: ["Das lässt sich machen."], r: ["lass.sich"], diag: CX_LASS_SICH },
          { w: ["sie", "sich", "die Haare", "schneiden", "lassen", "(Perfekt)"], a: ["Sie hat sich die Haare schneiden lassen."], r: ["lass.pf"] },
          { w: ["ich", "meinen Schirm", "im Bus", "lassen", "(Perfekt)"], a: ["Ich habe meinen Schirm im Bus gelassen."], r: ["lass.pf"] },
          { w: ["wir", "den Zug", "kommen", "sehen"], a: ["Wir sehen den Zug kommen."], r: ["lass.sense"] },
        ] },
        { id: "dp.lass", t: "translate", end: true, title: "Say it in German", how: "Translate with lassen, sehen or hören.", items: [
          { q: "I'm having my hair cut tomorrow.", a: ["Ich lasse mir morgen die Haare schneiden.", "Morgen lasse ich mir die Haare schneiden.", "Ich lasse morgen meine Haare schneiden.", "Morgen lasse ich meine Haare schneiden."], r: ["lass.do"] },
          { q: "Let me help you! (du)", a: ["Lass mich dir helfen!", "Lass mich dir helfen."], r: ["lass.let"] },
          { q: "Let's go to the cinema!", a: ["Lass uns ins Kino gehen!", "Lasst uns ins Kino gehen!", "Lass uns ins Kino gehen."], r: ["lass.let"] },
          { q: "We had the kitchen renovated.", a: ["Wir haben die Küche renovieren lassen.", "Wir ließen die Küche renovieren."], r: ["lass.pf"] },
          { q: "I left my phone at home.", a: ["Ich habe mein Handy zu Hause gelassen.", "Ich habe mein Telefon zu Hause gelassen.", "Ich ließ mein Handy zu Hause.", "Ich habe mein Handy zu Hause liegen lassen.", "Ich habe mein Handy zu Hause liegen gelassen.", "Ich habe mein Handy zuhause gelassen."], r: ["lass.leave"] },
          { q: "Can the appointment be moved?", a: ["Lässt sich der Termin verschieben?", "Kann der Termin verschoben werden?", "Kann man den Termin verschieben?"], r: ["lass.sich"], diag: CX_LASS_SICH },
          { q: "I hear the neighbours singing.", a: ["Ich höre die Nachbarn singen."], r: ["lass.sense"] },
          { q: "She sees the bus coming.", a: ["Sie sieht den Bus kommen."], r: ["lass.sense"] },
          { q: "Stop that! (du)", a: ["Lass das!", "Lass das sein!"], r: ["lass.leave"] },
          { q: "My parents don't let me go out alone.", a: ["Meine Eltern lassen mich nicht allein ausgehen.", "Meine Eltern lassen mich nicht alleine ausgehen.", "Meine Eltern lassen mich nicht allein rausgehen."], r: ["lass.let"] },
          { q: "That can be done.", a: ["Das lässt sich machen."], r: ["lass.sich"], diag: CX_LASS_SICH },
          { q: "He has the documents translated.", a: ["Er lässt die Dokumente übersetzen."], r: ["lass.do"] },
        ] },
        { id: "dw.lass", t: "write", end: true, title: "Write your own", how: "Write in your own words. Saved for Claude to correct.", items: [
          { q: "What do you have done by others? (the hairdresser, the garage …)", model: ["Ich lasse mir alle zwei Monate die Haare schneiden. Mein Auto lasse ich jeden Herbst in der Garage kontrollieren."], r: ["lass.do"] },
          { q: "Suggest three things to do with a friend this weekend. (Lass uns …)", model: ["Lass uns am Samstag auf den Markt gehen! Lass uns danach zusammen kochen. Und am Sonntag lass uns an den See fahren!"], r: ["lass.let"] },
          { q: "What did your parents let you do as a child, and what not?", model: ["Meine Eltern ließen mich jeden Tag draußen spielen. Sie ließen mich aber nie allein in die Stadt fahren."], r: ["lass.let"] },
          { q: "Something you had done recently. (Ich habe … lassen.)", model: ["Letzte Woche habe ich meine Brille reparieren lassen. Ich habe auch einen neuen Schlüssel machen lassen."], r: ["lass.pf"] },
          { q: "What do you hear and see from your window in the morning?", model: ["Am Morgen höre ich die Vögel singen. Ich sehe die Kinder zur Schule gehen und den Bus um die Ecke kommen."], r: ["lass.sense"] },
          { q: "A problem at home: can it be repaired? (lässt sich …)", model: ["Unsere Waschmaschine ist kaputt. Der Techniker sagt, sie lässt sich nicht mehr reparieren."], r: ["lass.sich"] },
          { q: "Something you always leave at home or forget somewhere.", model: ["Ich lasse meinen Schirm immer irgendwo liegen. Letzte Woche habe ich ihn im Zug gelassen."], r: ["lass.leave"] },
          { q: "Tell someone politely to let you finish speaking.", model: ["Entschuldigung, lassen Sie mich bitte ausreden. Ich bin gleich fertig."], r: ["lass.let"] },
        ] },
      ],
    },
  },
});

// What chapters 17, 24 and 25 became for lassen.
cxCover({ "17.5": "d17.5", "17.6": "d17.6", "24.2": "d24.2", "25.5": "d25.5", "25.16": "d25.16" });
