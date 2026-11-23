// ── COURSE PACK · After B1 (bonus) · Konjunktiv II · past — its book exercises ──
// The lesson's sheets live in the verb track (k2p1: hätte / wäre + the
// Partizip II — would have, wenn I had, almost · k2p2: modals in the past,
// hätte … machen sollen, and hätte before the two infinitives in a side
// clause). These are the book's exercises for it: chapter 26's "The
// Past-Time Subjunctive II" (26•20), "Modal Verbs in the Past-Time
// Subjunctive II" (26•21) and "Speculation About the Past" / "Omitting wenn"
// (26•28), and chapter 27's past conditions (27•14) — our own sentences,
// every form the engine knows checked against it (vf … k2p). B2: the fide
// asks the present Konjunktiv II (hätte gern, könnte, würde — Stage 2); the
// unreal past is the bonus.
const CX_K2P_ORDER = [{ t: "order", rule: "gs:k2p1.r1", msg: "hätte or wäre is the verb second; the Partizip II goes to the very end: Ich **hätte** dich gern **gesehen**." }];
cxPack({
  id: "s4-k2p",
  sections: {
    "s4.k2p": {
      diag: [
        { t: "swap", from: "^(hatte|hattest|hatten|hattet)$", to: "^(ware|warst|waren|wart|waret)$", rule: "gs:k2p1.r1", hard: true, msg: "This verb takes sein in the Perfekt, so: **{right}** + the Partizip II." },
        { t: "swap", from: "^(ware|warst|waren|wart|waret)$", to: "^(hatte|hattest|hatten|hattet)$", rule: "gs:k2p1.r1", hard: true, msg: "This verb takes haben in the Perfekt, so: **{right}** + the Partizip II." },
        { t: "swap", from: "^(habe|hast|hat|haben|habt|bin|bist|ist|sind|seid)$", to: "^(hatte|hattest|hatten|hattet|ware|warst|waren|wart|waret)$", rule: "gs:k2p1.r1", hard: true, msg: "That's the Perfekt — it really happened. For *would have*: **{right}**." },
        { t: "swap", from: "^(wurde|wurdest|wurden|wurdet)$", to: "^(hatte|hattest|hatten|hattet|ware|warst|waren|wart|waret)$", rule: "gs:k2p1.trap", hard: true, msg: "For *would have* say **{right}** + the Partizip II — würde … haben is correct but nobody says it." },
        { t: "swap", from: "^ge\\w+$", to: "^(sollen|konnen|mussen|durfen|wollen)$", rule: "gs:k2p2.trap", hard: true, msg: "With another verb the modal stays an infinitive: … **{right}**, no Partizip II." },
      ],
      drills: [
        // ── Übung 26•20: would have ──
        { id: "d26.20", ex: "26.20", t: "transform", title: "Would have: hätte or wäre", how: "Say it in the unreal past: hätte or wäre + the Partizip II. (Das ist schön. → Das wäre schön gewesen.)", items: [
          { q: "Das ist eine tolle Überraschung.", a: ["Das wäre eine tolle Überraschung gewesen."], r: ["gs:k2p1.r1"], vf: [["sein", "k2p", "er"]] },
          { q: "Er kommt gern mit.", a: ["Er wäre gern mitgekommen."], r: ["gs:k2p1.r1"], vf: [["mitkommen", "k2p", "er"]] },
          { q: "Wir nehmen den früheren Zug.", a: ["Wir hätten den früheren Zug genommen."], r: ["gs:k2p1.r1"], vf: [["nehmen", "k2p", "wir"]] },
          { q: "Ich weiß das nicht.", a: ["Ich hätte das nicht gewusst."], r: ["gs:k2p1.r1"], vf: [["wissen", "k2p", "ich"]] },
          { q: "Die Kinder haben viel Spaß.", a: ["Die Kinder hätten viel Spaß gehabt."], r: ["gs:k2p1.r1"], vf: [["haben", "k2p", "sie"]] },
          { q: "Sie bleibt noch eine Woche.", a: ["Sie wäre noch eine Woche geblieben."], r: ["gs:k2p1.r1"], vf: [["bleiben", "k2p", "er"]] },
          { q: "Du kaufst die günstigere Wohnung.", a: ["Du hättest die günstigere Wohnung gekauft."], r: ["gs:k2p1.r1"], vf: [["kaufen", "k2p", "du"]] },
          { q: "Ich rufe dich sofort an.", a: ["Ich hätte dich sofort angerufen."], r: ["gs:k2p1.r1"], vf: [["anrufen", "k2p", "ich"]] },
          { q: "Ihr fahrt mit dem Velo.", a: ["Ihr wärt mit dem Velo gefahren.", "Ihr wäret mit dem Velo gefahren."], r: ["gs:k2p1.r1"] },
          { q: "Das ärgert meinen Chef.", a: ["Das hätte meinen Chef geärgert."], r: ["gs:k2p1.r1"] },
          { q: "Lukas besteht die Prüfung.", a: ["Lukas hätte die Prüfung bestanden."], r: ["gs:k2p1.r1"] },
          { q: "Er geht zu Fuß nach Hause.", a: ["Er wäre zu Fuß nach Hause gegangen."], r: ["gs:k2p1.r1"], vf: [["gehen", "k2p", "er"]] },
        ].map(it => ({ ...it, diag: CX_K2P_ORDER })) },
        // ── Übung 26•21: should have, could have ──
        { id: "d26.21", ex: "26.21", t: "transform", title: "Should have, could have", how: "Say it in the past: hätte + the infinitive + the modal's infinitive, last. (Ich müsste lernen. → Ich hätte lernen müssen.)", items: [
          { q: "Ich müsste mehr Wasser trinken.", a: ["Ich hätte mehr Wasser trinken müssen."], r: ["gs:k2p2.r1"] },
          { q: "Du solltest früher losfahren.", a: ["Du hättest früher losfahren sollen."], r: ["gs:k2p2.r1"] },
          { q: "Wir könnten im Garten essen.", a: ["Wir hätten im Garten essen können."], r: ["gs:k2p2.r2"] },
          { q: "Sie wollte den ganzen Film sehen.", a: ["Sie hätte den ganzen Film sehen wollen."], r: ["gs:k2p2.r2"] },
          { q: "Er dürfte länger bleiben.", a: ["Er hätte länger bleiben dürfen."], r: ["gs:k2p2.r2"] },
          { q: "Ihr müsstet nicht so früh aufstehen.", a: ["Ihr hättet nicht so früh aufstehen müssen."], r: ["gs:k2p2.r2"] },
          { q: "Die Ferien sollten länger sein.", a: ["Die Ferien hätten länger sein sollen."], r: ["gs:k2p2.r1"] },
          { q: "Ich könnte dir helfen.", a: ["Ich hätte dir helfen können."], r: ["gs:k2p2.r2"] },
          { q: "Man sollte vorher reservieren.", a: ["Man hätte vorher reservieren sollen."], r: ["gs:k2p2.r1"] },
          { q: "Wolltest du nicht mitkommen?", a: ["Hättest du nicht mitkommen wollen?"], r: ["gs:k2p2.r2"] },
        ].map(it => ({ ...it, diag: [{ t: "order", rule: "gs:k2p2.r1", msg: "hätte is the verb second; the two infinitives go to the very end, the modal last: Ich **hätte** mehr **lernen sollen**." }] })) },
        // ── Übung 26•28: if I'd had more time … ──
        { id: "d26.28", ex: "26.28", t: "transform", title: "If I'd had more time …", how: "Finish «Wenn ich mehr Zeit gehabt hätte, …» with the cue: hätte or wäre comes first, the Partizip II last.", items: [
          { q: "mehr Sport machen", a: ["Wenn ich mehr Zeit gehabt hätte, hätte ich mehr Sport gemacht."], r: ["gs:k2p1.r2"], vf: [["machen", "k2p", "ich"]] },
          { q: "öfter meine Großeltern besuchen", a: ["Wenn ich mehr Zeit gehabt hätte, hätte ich öfter meine Großeltern besucht.", "Wenn ich mehr Zeit gehabt hätte, hätte ich meine Großeltern öfter besucht."], r: ["gs:k2p1.r2"], vf: [["besuchen", "k2p", "ich"]] },
          { q: "ein Instrument lernen", a: ["Wenn ich mehr Zeit gehabt hätte, hätte ich ein Instrument gelernt."], r: ["gs:k2p1.r2"], vf: [["lernen", "k2p", "ich"]] },
          { q: "nach Neuseeland reisen", a: ["Wenn ich mehr Zeit gehabt hätte, wäre ich nach Neuseeland gereist."], r: ["gs:k2p1.r2"] },
          { q: "jeden Tag frisch kochen", a: ["Wenn ich mehr Zeit gehabt hätte, hätte ich jeden Tag frisch gekocht."], r: ["gs:k2p1.r2"], vf: [["kochen", "k2p", "ich"]] },
          { q: "länger in den Bergen bleiben", a: ["Wenn ich mehr Zeit gehabt hätte, wäre ich länger in den Bergen geblieben."], r: ["gs:k2p1.r2"], vf: [["bleiben", "k2p", "ich"]] },
          { q: "mehr Bücher lesen", a: ["Wenn ich mehr Zeit gehabt hätte, hätte ich mehr Bücher gelesen."], r: ["gs:k2p1.r2"], vf: [["lesen", "k2p", "ich"]] },
          { q: "den Garten pflegen", a: ["Wenn ich mehr Zeit gehabt hätte, hätte ich den Garten gepflegt."], r: ["gs:k2p1.r2"] },
          { q: "früher ins Bett gehen", a: ["Wenn ich mehr Zeit gehabt hätte, wäre ich früher ins Bett gegangen."], r: ["gs:k2p1.r2"], vf: [["gehen", "k2p", "ich"]] },
          { q: "mit dir ins Kino kommen", a: ["Wenn ich mehr Zeit gehabt hätte, wäre ich mit dir ins Kino gekommen."], r: ["gs:k2p1.r2"], vf: [["kommen", "k2p", "ich"]] },
        ].map(it => ({ ...it, diag: [{ t: "order", rule: "gs:k2p1.r2", msg: "After the wenn-clause the main clause starts with its verb: …, **hätte** ich mehr Sport **gemacht**." }] })) },
        // ── ours: hätte or wäre? ──
        { id: "dk2p.aux", t: "type", title: "hätte or wäre?", how: "Write hätte or wäre in the right form: wäre with the verbs that take sein in the Perfekt, hätte with all the others.", items: [
          { q: "Ich ___ gern länger geschlafen.", a: ["hätte"], r: ["gs:k2p1.r1"] },
          { q: "Wir ___ fast zu spät gekommen.", a: ["wären"], r: ["gs:k2p1.r3"] },
          { q: "Du ___ mich anrufen sollen.", a: ["hättest"], r: ["gs:k2p2.r1"] },
          { q: "Er ___ beinahe vom Velo gefallen.", a: ["wäre"], r: ["gs:k2p1.r3"] },
          { q: "Ohne dich ___ ich das nie geschafft.", a: ["hätte"], r: ["gs:k2p1.r1"] },
          { q: "___ ihr gern noch geblieben?", a: ["Wärt", "Wäret"], r: ["gs:k2p1.r1"] },
          { q: "Das ___ wirklich nicht nötig gewesen.", a: ["wäre"], r: ["gs:k2p1.r1"] },
          { q: "Sie ___ fast ihren Pass vergessen.", a: ["hätte"], r: ["gs:k2p1.r3"] },
          { q: "Wenn es geregnet ___, wären wir zu Hause geblieben.", a: ["hätte"], r: ["gs:k2p1.r2"] },
          { q: "Ich ___ dir gern geholfen, aber ich war krank.", a: ["hätte"], r: ["gs:k2p1.r1"] },
          { q: "Wir ___ beinahe den letzten Bus verpasst.", a: ["hätten"], r: ["gs:k2p1.r3"] },
        ] },
        // ── Übung 27•14: a condition in the past ──
        { id: "d27.14", ex: "27.14", t: "type", title: "If it had …", how: "Write the missing half in the unreal past from the cue: Wenn … gewesen wäre / gehabt hätte — or the main clause, hätte / wäre first.", items: [
          { q: "___, wären wir an den See gefahren. (das Wetter · schön sein)", a: ["Wenn das Wetter schön gewesen wäre", "Wäre das Wetter schön gewesen"], r: ["gs:k2p1.r2"] },
          { q: "___, hätte er länger bleiben können. (er · Zeit haben)", a: ["Wenn er Zeit gehabt hätte", "Hätte er Zeit gehabt"], r: ["gs:k2p1.r2"] },
          { q: "___, wäre ich nicht zu spät gekommen. (der Bus · pünktlich sein)", a: ["Wenn der Bus pünktlich gewesen wäre", "Wäre der Bus pünktlich gewesen"], r: ["gs:k2p1.r2"] },
          { q: "___, hätte ich die Prüfung bestanden. (ich · mehr lernen)", a: ["Wenn ich mehr gelernt hätte", "Hätte ich mehr gelernt"], r: ["gs:k2p1.r2"] },
          { q: "___, hätten wir das Spiel gewonnen. (unser Torwart · nicht verletzt sein)", a: ["Wenn unser Torwart nicht verletzt gewesen wäre", "Wäre unser Torwart nicht verletzt gewesen"], r: ["gs:k2p1.r2"] },
          { q: "Wenn Sara nicht krank gewesen wäre, ___. (sie · mitkommen)", a: ["wäre sie mitgekommen"], r: ["gs:k2p1.r1"] },
          { q: "Wenn wir den Wecker gehört hätten, ___. (wir · den Zug nicht verpassen)", a: ["hätten wir den Zug nicht verpasst"], r: ["gs:k2p1.r1"] },
          { q: "Wenn du mich gefragt hättest, ___. (ich · dir helfen)", a: ["hätte ich dir geholfen"], r: ["gs:k2p1.r1"] },
          { q: "Wenn das Restaurant offen gewesen wäre, ___. (wir · dort essen)", a: ["hätten wir dort gegessen"], r: ["gs:k2p1.r1"] },
          { q: "Wenn ich das gewusst hätte, ___. (ich · nichts sagen)", a: ["hätte ich nichts gesagt"], r: ["gs:k2p1.r1"] },
        ] },
        // ── ours: in a side clause ──
        { id: "dk2p.sub", t: "transform", title: "…, weil ich hätte arbeiten müssen", how: "Join the two sentences with the word in brackets. With two infinitives, hätte comes before them: …, weil ich hätte arbeiten müssen.", items: [
          { q: "Ich bin nicht gekommen. Ich hätte arbeiten müssen. (weil)", a: ["Ich bin nicht gekommen, weil ich hätte arbeiten müssen."], r: ["gs:k2p2.r3"] },
          { q: "Ich weiß. Ich hätte früher fragen sollen. (dass)", a: ["Ich weiß, dass ich früher hätte fragen sollen."], r: ["gs:k2p2.r3"] },
          { q: "Sie ärgert sich. Sie hätte das Angebot annehmen können. (weil)", a: ["Sie ärgert sich, weil sie das Angebot hätte annehmen können."], r: ["gs:k2p2.r3"] },
          { q: "Er gibt zu. Er hätte mehr trainieren müssen. (dass)", a: ["Er gibt zu, dass er mehr hätte trainieren müssen."], r: ["gs:k2p2.r3"] },
          { q: "Wir sind traurig. Wir hätten länger bleiben wollen. (weil)", a: ["Wir sind traurig, weil wir länger hätten bleiben wollen."], r: ["gs:k2p2.r3"] },
          { q: "Ich glaube. Du hättest das wissen müssen. (dass)", a: ["Ich glaube, dass du das hättest wissen müssen."], r: ["gs:k2p2.r3"] },
          { q: "Der Chef ist sauer. Wir hätten den Kunden informieren sollen. (weil)", a: ["Der Chef ist sauer, weil wir den Kunden hätten informieren sollen."], r: ["gs:k2p2.r3"] },
          { q: "Lea ist enttäuscht. Sie hätte die Stelle bekommen können. (weil)", a: ["Lea ist enttäuscht, weil sie die Stelle hätte bekommen können."], r: ["gs:k2p2.r3"] },
          { q: "Mein Vater meint. Ich hätte Arzt werden sollen. (dass)", a: ["Mein Vater meint, dass ich Arzt hätte werden sollen."], r: ["gs:k2p2.r3"] },
        ].map(it => ({ ...it, diag: [{ t: "order", rule: "gs:k2p2.r3", msg: "In a side clause with two infinitives, **hätte** comes before them: …, weil ich **hätte arbeiten müssen**." }] })) },
        // ── Production ──
        { id: "dp.k2p", t: "translate", end: true, title: "Say it in German", how: "Translate with hätte or wäre — and two infinitives with a modal.", items: [
          { q: "I should have called you.", a: ["Ich hätte dich anrufen sollen.", "Ich hätte Sie anrufen sollen."], r: ["gs:k2p2.r1"] },
          { q: "We would have come, but the train was cancelled.", a: ["Wir wären gekommen, aber der Zug ist ausgefallen.", "Wir wären gekommen, aber der Zug fiel aus."], r: ["gs:k2p1.r1"] },
          { q: "If I had known that, I would have helped you.", a: ["Wenn ich das gewusst hätte, hätte ich dir geholfen.", "Hätte ich das gewusst, hätte ich dir geholfen.", "Wenn ich das gewusst hätte, hätte ich Ihnen geholfen."], r: ["gs:k2p1.r2"] },
          { q: "You could have told me!", a: ["Du hättest es mir sagen können!", "Das hättest du mir sagen können!", "Du hättest mir das sagen können!"], r: ["gs:k2p2.r2"] },
          { q: "She almost missed the bus.", a: ["Sie hätte fast den Bus verpasst.", "Sie hätte den Bus fast verpasst.", "Sie hätte beinahe den Bus verpasst.", "Sie hätte den Bus beinahe verpasst."], r: ["gs:k2p1.r3"] },
          { q: "That would have been nice.", a: ["Das wäre schön gewesen.", "Das wäre nett gewesen."], r: ["gs:k2p1.r1"] },
          { q: "They would have liked to stay longer.", a: ["Sie wären gern länger geblieben.", "Sie wären gerne länger geblieben."], r: ["gs:k2p1.r1"] },
          { q: "He shouldn't have said that.", a: ["Er hätte das nicht sagen sollen.", "Das hätte er nicht sagen sollen."], r: ["gs:k2p2.r1"] },
          { q: "I would have had to work on Saturday.", a: ["Ich hätte am Samstag arbeiten müssen.", "Am Samstag hätte ich arbeiten müssen."], r: ["gs:k2p2.r2"] },
          { q: "If it hadn't rained, we would have gone to the lake.", a: ["Wenn es nicht geregnet hätte, wären wir an den See gegangen.", "Wenn es nicht geregnet hätte, wären wir an den See gefahren.", "Hätte es nicht geregnet, wären wir an den See gegangen.", "Hätte es nicht geregnet, wären wir an den See gefahren."], r: ["gs:k2p1.r2"] },
        ] },
        { id: "dw.k2p", t: "write", end: true, title: "Write your own", how: "Write in your own words. Saved for Claude to correct.", items: [
          { q: "Something you regret: what should you have done differently? (Ich hätte … sollen.)", model: ["Ich hätte früher mit Deutsch anfangen sollen. Und ich hätte am Anfang mehr mit meinen Nachbarn sprechen sollen."], r: ["gs:k2p2.r1"] },
          { q: "A day that went wrong: what would have happened if …? (Wenn …, hätte …)", model: ["Wenn ich den Wecker gehört hätte, hätte ich den Zug nicht verpasst. Dann wäre ich pünktlich bei der Arbeit gewesen."], r: ["gs:k2p1.r2"] },
          { q: "You almost missed something important. Tell it. (Ich hätte fast …)", model: ["Letzte Woche hätte ich fast meinen Termin beim Zahnarzt vergessen. Zum Glück hat die Praxis am Morgen angerufen."], r: ["gs:k2p1.r3"] },
          { q: "Give a friend gentle feedback on a party they organised. (Du hättest … können.)", model: ["Die Party war super! Du hättest vielleicht etwas mehr Essen kaufen können, und die Musik hätte etwas leiser sein dürfen."], r: ["gs:k2p2.r2"] },
          { q: "With a second chance, what would you have studied or learned?", model: ["Ich hätte gern Architektur studiert. Ich wäre auch gern ein Jahr ins Ausland gegangen."], r: ["gs:k2p1.r1"] },
          { q: "Your first weeks in Switzerland: what would you have done differently?", model: ["Ich hätte sofort ein Halbtax gekauft. Und ich hätte mich früher bei der Gemeinde angemeldet."], r: ["gs:k2p1.r1"] },
          { q: "Apologise for something you forgot. (Ich hätte daran denken müssen …)", model: ["Entschuldige, ich hätte an deinen Geburtstag denken müssen! Ich hätte dich wenigstens anrufen können."], r: ["gs:k2p2.r2"] },
          { q: "A trip that was cancelled: where would you have gone, and what would you have done?", model: ["Wir wären nach Lissabon geflogen. Wir hätten die Altstadt besichtigt und jeden Abend Fisch gegessen."], r: ["gs:k2p1.r1"] },
        ] },
      ],
    },
  },
});

// What chapters 26 and 27 became for this lesson.
cxCover({ "26.20": "d26.20", "26.21": "d26.21", "26.28": "d26.28", "27.14": "d27.14" });
