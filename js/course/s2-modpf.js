// ── COURSE PACK · Stage 2 · Modals in the Perfekt (the double infinitive) ──
// Book: chapter 17's "Modal auxiliaries and double infinitives" (17•16,
// 17•17) and chapter 24's opening part (24•1, 24•3, 24•4: a modal in the
// Perfekt, the past perfect and the future). One sheet: in speech the
// modals' past is the Präteritum (Ich musste arbeiten — the A1 verb lesson's
// pt12); the Perfekt with another verb is haben + two infinitives, the
// modal last (Ich habe arbeiten müssen); a modal alone takes its Partizip
// II (Ich habe das nicht gewollt); in a side sentence haben comes before the
// two infinitives (…, weil ich habe arbeiten müssen). lassen, sehen, hören
// and helfen do the same (24•2): that's the lassen lesson's (s2.lassen).
// The future with a modal (werde … arbeiten müssen) was the future's (s1.fu).
cxPack({
  id: "s2-modpf",
  sections: {
    "s2.modpf": {
      testout: { n: 4, miss: 1 },
      rules: {
        "mpf.prat": "In speech: Ich musste arbeiten (Präteritum)",
        "mpf.dbl": "Perfekt: haben + two infinitives, the modal last",
        "mpf.alone": "A modal alone: hat gekonnt, hat gewollt",
        "mpf.sub": "In a side sentence: …, weil ich habe arbeiten müssen",
      },
      sheets: [
        { id: "cx.mpf", title: "Ich habe arbeiten müssen", qn: 3,
          struct: [["Ich", "who"], ["habe", "aux"], ["gestern", "mid"], ["arbeiten", "inf"], ["müssen", "modal"]],
          why: "In speech, the modals' past is usually the **Präteritum**: Ich **musste** arbeiten. But you will also meet the **Perfekt**, and it looks odd at first: **two infinitives** at the end, and no ge-.",
          rid: ["mpf.prat", "mpf.dbl", "mpf.alone", "mpf.sub"],
          rules: [
            "In speech, the modals' past is usually the **Präteritum**: Ich **musste** gestern lange arbeiten. · **Konntest** du gut schlafen? · Wir **wollten** dich anrufen.",
            "In the **Perfekt**, a modal with another verb takes **haben** and **two infinitives** at the end, the modal last: Ich **habe** lange **arbeiten müssen**. · Er **hat** nicht **kommen können**. No ge-, no Partizip II.",
            "A modal **on its own**, with no other verb, takes its Partizip II: Ich **habe** das nicht **gewollt**. · Sie **hat** es nicht **gekonnt**. · Das **hat** er **gemusst**.",
            "In a side sentence, **haben** goes **before** the two infinitives: …, weil ich **habe arbeiten müssen**. · …, dass er nicht **hat kommen können**. In speech the Präteritum is easier: …, weil ich arbeiten **musste**.",
          ],
          table: { head: ["Präteritum", "Perfekt"], rows: [
            ["**musste** gehen", "**hat** gehen **müssen**"],
            ["**konnte** kommen", "**hat** kommen **können**"],
            ["**wollte** bleiben", "**hat** bleiben **wollen**"],
            ["**wollte** es nicht", "**hat** es nicht **gewollt**"],
          ] },
          ex: [
            ["Ich **musste** am Samstag arbeiten.", "I had to work on Saturday."],
            ["Wir **haben** zwei Stunden auf den Zug **warten müssen**.", "We had to wait two hours for the train."],
            ["Das **habe** ich nicht **gewollt** — es tut mir leid.", "I didn't mean that — I'm sorry."],
            ["Er ist nicht gekommen, weil er **hat arbeiten müssen**.", "He didn't come because he had to work."],
          ],
          trap: "With another verb there is no Partizip II: Ich habe arbeiten **müssen**, not ~~arbeiten gemusst~~. And haben stays haben, even with a sein-verb: Ich **habe** nach Hause **gehen müssen**, not ~~bin~~.",
          quiz: [
            { at: "r1", k: "pick", q: "In speech: *I had to wait.*", o: ["Ich musste warten.", "Ich muss warten.", "Ich müsste warten."], a: 0, why: "The modals' past in speech is the Präteritum: **musste**." },
            { at: "r1", k: "type", cx: true, q: "Gestern ___ ich nicht kommen. (können, Präteritum)", a: ["konnte"], r: ["mpf.prat"], why: "können → **konnte**, no umlaut." },
            { at: "r2", k: "pick", q: "Ich habe lange ___.", o: ["warten müssen", "gewartet müssen", "warten gemusst"], a: 0, why: "Two infinitives, the modal last: warten **müssen**." },
            { at: "r2", k: "order", q: "Build it: She couldn't come.", a: ["Sie", "hat", "nicht", "kommen", "können."], why: "haben second, then the two infinitives, the modal last." },
            { at: "r2", k: "pick", q: "Wir ___ nach Hause gehen müssen.", o: ["haben", "sind"], a: 0, why: "A modal in the Perfekt always takes **haben**." },
            { at: "r3", k: "pick", q: "Das habe ich nicht ___. (without another verb)", o: ["gewollt", "wollen"], a: 0, why: "A modal on its own takes its Partizip II: **gewollt**." },
            { at: "r3", k: "type", cx: true, q: "Hast du die Aufgabe lösen können? — Nein, ich habe es nicht ___. (können)", a: ["gekonnt"], r: ["mpf.alone"], why: "On its own: **gekonnt**." },
            { at: "r4", k: "pick", q: "…, weil ich ___.", o: ["habe arbeiten müssen", "arbeiten müssen habe", "arbeiten habe müssen"], a: 0, why: "In a side sentence, haben comes before the two infinitives." },
            { at: "table", k: "pick", q: "Präteritum → Perfekt: er konnte kommen →", o: ["er hat kommen können", "er hat gekonnt kommen", "er ist kommen können"], a: 0, why: "haben + the two infinitives, the modal last." },
            { at: "trap", k: "pick", q: "Which is right?", o: ["Ich habe arbeiten müssen.", "Ich habe arbeiten gemusst."], a: 0, why: "With another verb, no Partizip II: arbeiten **müssen**." },
          ] },
      ],
      diag: [
        { t: "swap", from: "^ge(musst|konnt|durft|sollt|wollt|mocht)$", to: "^(mussen|konnen|durfen|sollen|wollen|mogen)$", rule: "mpf.dbl", hard: true, msg: "With another verb, the modal stays an infinitive: **{right}** — no ge-." },
        { t: "swap", from: "^(mussen|konnen|durfen|sollen|wollen|mogen)$", to: "^ge(musst|konnt|durft|sollt|wollt|mocht)$", rule: "mpf.alone", hard: true, msg: "On its own, with no other verb, the modal takes its Partizip II: **{right}**." },
        { t: "swap", from: "^(bin|bist|ist|sind|seid|war|waren)$", to: "^(habe|hast|hat|haben|habt|hatte|hatten)$", rule: "mpf.dbl", hard: true, msg: "A modal in the Perfekt always takes **haben**: **{right}**." },
        { t: "swap", from: "^ge\\w+(t|en)$", to: "^(?!ge)\\w+(en|n)$", rule: "mpf.dbl", msg: "Two infinitives at the end: the other verb stays an infinitive too — **{right}**." },
        { t: "seq", seq: ["(mussen|konnen|durfen|sollen|wollen)", "\\w+(en|n)$"], rule: "mpf.dbl", msg: "The modal comes **last**: … arbeiten **müssen**." },
      ],
      drills: [
        // ── Übung 17•16: add the modal, in the Perfekt ──
        { id: "d17.16", ex: "17.16", t: "transform", title: "Add the modal", how: "Add the modal in brackets, in the Perfekt: haben + two infinitives, the modal last.", items: [
          { q: "Sie hat Deutsch gesprochen. (können)", a: ["Sie hat Deutsch sprechen können."], r: ["mpf.dbl"] },
          { q: "Ich habe lange gewartet. (müssen)", a: ["Ich habe lange warten müssen."], r: ["mpf.dbl"] },
          { q: "Wir haben das Formular unterschrieben. (müssen)", a: ["Wir haben das Formular unterschreiben müssen."], r: ["mpf.dbl"] },
          { q: "Die Kinder haben draußen gespielt. (dürfen)", a: ["Die Kinder haben draußen spielen dürfen."], r: ["mpf.dbl"] },
          { q: "Hast du gut geschlafen? (können)", a: ["Hast du gut schlafen können?"], r: ["mpf.dbl"] },
          { q: "Er hat seine Schwester besucht. (wollen)", a: ["Er hat seine Schwester besuchen wollen."], r: ["mpf.dbl"] },
          { q: "Ich bin früh nach Hause gegangen. (müssen)", a: ["Ich habe früh nach Hause gehen müssen."], r: ["mpf.dbl"] },
          { q: "Ihr habt nichts gesagt. (dürfen)", a: ["Ihr habt nichts sagen dürfen."], r: ["mpf.dbl"] },
          { q: "Lea ist mit dem Zug gefahren. (wollen)", a: ["Lea hat mit dem Zug fahren wollen."], r: ["mpf.dbl"], cap: true },
          { q: "Wir haben das Problem gelöst. (können)", a: ["Wir haben das Problem lösen können."], r: ["mpf.dbl"] },
        ] },
        // ── Übung 17•17: the modal alone ──
        { id: "d17.17", ex: "17.17", t: "type", title: "The modal on its own", how: "The modal stands alone. Write it in the Präteritum or the Perfekt, as the brackets say.", items: [
          { q: "Er will das nicht. → Er ___ das nicht. (Präteritum)", a: ["wollte"], r: ["mpf.prat"] },
          { q: "Er will das nicht. → Er hat das nicht ___. (Perfekt)", a: ["gewollt"], r: ["mpf.alone"] },
          { q: "Wir müssen nach Hause. → Wir ___ nach Hause. (Präteritum)", a: ["mussten"], r: ["mpf.prat"] },
          { q: "Wir müssen nach Hause. → Wir haben nach Hause ___. (Perfekt)", a: ["gemusst"], r: ["mpf.alone"] },
          { q: "Kannst du das? → ___ du das? (Präteritum)", a: ["Konntest"], r: ["mpf.prat"] },
          { q: "Kannst du das? → Hast du das ___? (Perfekt)", a: ["gekonnt"], r: ["mpf.alone"] },
          { q: "Ich mag ihn nicht. → Ich ___ ihn nicht. (Präteritum)", a: ["mochte"], r: ["mpf.prat"] },
          { q: "Ich mag ihn nicht. → Ich habe ihn nicht ___. (Perfekt)", a: ["gemocht"], r: ["mpf.alone"] },
          { q: "Darf sie das? → ___ sie das? (Präteritum)", a: ["Durfte"], r: ["mpf.prat"] },
          { q: "Darf sie das? → Hat sie das ___? (Perfekt)", a: ["gedurft"], r: ["mpf.alone"] },
        ] },
        // ── Übung 24•1: into the Perfekt ──
        { id: "d24.1", ex: "24.1", t: "transform", title: "Into the Perfekt", how: "Say it in the Perfekt: haben + the infinitive + the modal at the end. A modal alone takes its Partizip II (gewollt).", items: [
          { q: "Ich muss am Wochenende arbeiten.", a: ["Ich habe am Wochenende arbeiten müssen."], r: ["mpf.dbl"] },
          { q: "Er kann nicht schwimmen.", a: ["Er hat nicht schwimmen können."], r: ["mpf.dbl"] },
          { q: "Wir dürfen das Museum besuchen.", a: ["Wir haben das Museum besuchen dürfen."], r: ["mpf.dbl"] },
          { q: "Niemand will mir helfen.", a: ["Niemand hat mir helfen wollen."], r: ["mpf.dbl"] },
          { q: "Kannst du die Berge sehen?", a: ["Hast du die Berge sehen können?"], r: ["mpf.dbl"] },
          { q: "Die Kinder müssen früh ins Bett.", a: ["Die Kinder haben früh ins Bett gemusst.", "Die Kinder haben früh ins Bett gehen müssen."], r: ["mpf.alone"] },
          { q: "Sie soll den Arzt anrufen.", a: ["Sie hat den Arzt anrufen sollen."], r: ["mpf.dbl"] },
          { q: "Ihr müsst lange warten.", a: ["Ihr habt lange warten müssen."], r: ["mpf.dbl"] },
          { q: "Ich will das nicht.", a: ["Ich habe das nicht gewollt."], r: ["mpf.alone"] },
          { q: "Wir können die Wohnung nicht mieten.", a: ["Wir haben die Wohnung nicht mieten können."], r: ["mpf.dbl"] },
          { q: "Meine Mutter muss nach Bern fahren.", a: ["Meine Mutter hat nach Bern fahren müssen."], r: ["mpf.dbl"] },
          { q: "Darfst du mitkommen?", a: ["Hast du mitkommen dürfen?"], r: ["mpf.dbl"] },
        ] },
        // ── Übung 24•3: one phrase, four tenses ──
        { id: "d24.3", ex: "24.3", t: "transform", title: "Four tenses", how: "Say it in the tense in brackets: musste · hat … müssen · wird … müssen.", items: [
          { q: "Ich will die Wohnung verkaufen. (Präteritum)", a: ["Ich wollte die Wohnung verkaufen."], r: ["mpf.prat"] },
          { q: "Ich will die Wohnung verkaufen. (Perfekt)", a: ["Ich habe die Wohnung verkaufen wollen."], r: ["mpf.dbl"] },
          { q: "Ich will die Wohnung verkaufen. (Futur)", a: ["Ich werde die Wohnung verkaufen wollen."], r: ["mpf.dbl"] },
          { q: "Sie kann den Dialekt nicht verstehen. (Präteritum)", a: ["Sie konnte den Dialekt nicht verstehen."], r: ["mpf.prat"] },
          { q: "Sie kann den Dialekt nicht verstehen. (Perfekt)", a: ["Sie hat den Dialekt nicht verstehen können."], r: ["mpf.dbl"] },
          { q: "Du musst ins Ausland reisen. (Präteritum)", a: ["Du musstest ins Ausland reisen."], r: ["mpf.prat"] },
          { q: "Du musst ins Ausland reisen. (Perfekt)", a: ["Du hast ins Ausland reisen müssen."], r: ["mpf.dbl"] },
          { q: "Du musst ins Ausland reisen. (Futur)", a: ["Du wirst ins Ausland reisen müssen."], r: ["mpf.dbl"] },
          { q: "Der kranke Mann darf nicht nach Hause. (Präteritum)", a: ["Der kranke Mann durfte nicht nach Hause."], r: ["mpf.prat"] },
          { q: "Der kranke Mann darf nicht nach Hause. (Perfekt)", a: ["Der kranke Mann hat nicht nach Hause gedurft.", "Der kranke Mann hat nicht nach Hause gehen dürfen."], r: ["mpf.alone"] },
          { q: "Wir sollen eine neue Schule suchen. (Perfekt)", a: ["Wir haben eine neue Schule suchen sollen."], r: ["mpf.dbl"] },
          { q: "Wir sollen eine neue Schule suchen. (Futur)", a: ["Wir werden eine neue Schule suchen sollen."], r: ["mpf.dbl"] },
        ] },
        // ── Übung 24•4: which form? ──
        { id: "d24.4", ex: "24.4", t: "pick", title: "Which form?", how: "Pick the form that completes the sentence.", items: [
          { q: "Ich habe gestern nicht ___ können.", o: ["kommen", "gekommen", "komme"], a: ["kommen"], r: ["mpf.dbl"] },
          { q: "Er hat das Formular ausfüllen ___.", o: ["müssen", "gemusst", "muss"], a: ["müssen"], r: ["mpf.dbl"] },
          { q: "Das habe ich nicht ___.", o: ["gewollt", "wollen", "gewollen"], a: ["gewollt"], r: ["mpf.alone"] },
          { q: "Wir ___ lange warten müssen.", o: ["haben", "sind", "wurden"], a: ["haben"], r: ["mpf.dbl"] },
          { q: "Die Sängerin wird in Zürich singen ___.", o: ["wollen", "gewollt", "will"], a: ["wollen"], r: ["mpf.dbl"] },
          { q: "Ich ___ gestern leider nicht anrufen.", o: ["konnte", "könnte", "kann"], a: ["konnte"], r: ["mpf.prat"] },
          { q: "Sie ist gegangen, weil sie ___.", o: ["hat arbeiten müssen", "arbeiten müssen hat", "hat müssen arbeiten"], a: ["hat arbeiten müssen"], r: ["mpf.sub"] },
          { q: "Hast du Ski fahren ___?", o: ["dürfen", "gedurft", "darfst"], a: ["dürfen"], r: ["mpf.dbl"] },
          { q: "Die Kinder haben das nicht ___.", o: ["gedurft", "dürfen", "durften"], a: ["gedurft"], r: ["mpf.alone"] },
          { q: "Letzten Montag ___ wir zum Arzt.", o: ["mussten", "müssten", "gemusst"], a: ["mussten"], r: ["mpf.prat"] },
        ] },
        // ── our own: Präteritum or Perfekt? ──
        { id: "dmpf.prat", t: "transform", title: "As people say it", how: "Say it the way people usually do: the modal in the Präteritum.", items: [
          { q: "Ich habe lange arbeiten müssen.", a: ["Ich musste lange arbeiten."], r: ["mpf.prat"] },
          { q: "Wir haben nicht kommen können.", a: ["Wir konnten nicht kommen."], r: ["mpf.prat"] },
          { q: "Hast du das Velo reparieren können?", a: ["Konntest du das Velo reparieren?"], r: ["mpf.prat"] },
          { q: "Die Kinder haben nicht schlafen wollen.", a: ["Die Kinder wollten nicht schlafen."], r: ["mpf.prat"] },
          { q: "Er hat zum Zahnarzt gehen müssen.", a: ["Er musste zum Zahnarzt gehen."], r: ["mpf.prat"] },
          { q: "Ich habe dich anrufen wollen.", a: ["Ich wollte dich anrufen."], r: ["mpf.prat"] },
          { q: "Habt ihr lange warten müssen?", a: ["Musstet ihr lange warten?"], r: ["mpf.prat"] },
          { q: "Sie hat das Auto nicht nehmen dürfen.", a: ["Sie durfte das Auto nicht nehmen."], r: ["mpf.prat"] },
          { q: "Wir haben den Film nicht sehen können.", a: ["Wir konnten den Film nicht sehen."], r: ["mpf.prat"] },
          { q: "Ich habe ihn noch nie gemocht.", a: ["Ich mochte ihn noch nie.", "Ich mochte ihn nie."], r: ["mpf.prat"] },
        ] },
        // ── our own: in a side sentence ──
        { id: "dmpf.sub", t: "transform", fixed: true, title: "…, weil ich habe arbeiten müssen", how: "Join with weil or dass, in the Perfekt: haben goes before the two infinitives.", items: [
          { q: "Ich bin zu spät gekommen. (weil) Ich habe den Bus nehmen müssen.", a: ["Ich bin zu spät gekommen, weil ich den Bus habe nehmen müssen."], r: ["mpf.sub"] },
          { q: "Er ist nicht gekommen. (weil) Er hat arbeiten müssen.", a: ["Er ist nicht gekommen, weil er hat arbeiten müssen."], r: ["mpf.sub"] },
          { q: "Es tut mir leid. (dass) Ich habe nicht anrufen können.", a: ["Es tut mir leid, dass ich nicht habe anrufen können."], r: ["mpf.sub"] },
          { q: "Sie war traurig. (weil) Sie hat nicht mitkommen dürfen.", a: ["Sie war traurig, weil sie nicht hat mitkommen dürfen."], r: ["mpf.sub"] },
          { q: "Ich weiß. (dass) Du hast lange warten müssen.", a: ["Ich weiß, dass du lange hast warten müssen."], r: ["mpf.sub"] },
          { q: "Wir sind müde. (weil) Wir haben früh aufstehen müssen.", a: ["Wir sind müde, weil wir früh haben aufstehen müssen."], r: ["mpf.sub"] },
          { q: "Schade! (dass) Ihr habt nicht bleiben können.", a: ["Schade, dass ihr nicht habt bleiben können."], r: ["mpf.sub"] },
          { q: "Er ist sauer. (weil) Er hat das Spiel nicht sehen dürfen.", a: ["Er ist sauer, weil er das Spiel nicht hat sehen dürfen."], r: ["mpf.sub"] },
        ].map(it => ({ ...it, a: [...it.a, it.a[0].replace(/ (habe|hat|haben|hast|habt) (\w+) (müssen|können|dürfen|wollen)\.$/, (m, h, v, mod) => " " + v + " " + ({ müssen: "musste", können: "konnte", dürfen: "durfte", wollen: "wollte" })[mod] + ({ habe: "", hat: "", haben: "n", hast: "st", habt: "t" })[h] + ".")] })).map(it => ({ ...it, diag: [{ t: "order", rule: "mpf.sub", msg: "In a side sentence, haben comes **before** the two infinitives: …, weil ich den Bus **habe nehmen müssen**." }] })) },
        // ── Production ──
        { id: "dmpf.build", t: "compose", end: true, title: "Build it", how: "Build the sentence in the Perfekt: haben + two infinitives, the modal last.", items: [
          { w: ["ich", "gestern", "lange", "arbeiten", "müssen"], a: ["Ich habe gestern lange arbeiten müssen.", "Gestern habe ich lange arbeiten müssen."], r: ["mpf.dbl"] },
          { w: ["wir", "den Zug", "nicht", "nehmen", "können"], a: ["Wir haben den Zug nicht nehmen können."], r: ["mpf.dbl"] },
          { w: ["du", "gut", "schlafen", "können", "?"], a: ["Hast du gut schlafen können?"], r: ["mpf.dbl"] },
          { w: ["die Kinder", "länger", "aufbleiben", "dürfen"], a: ["Die Kinder haben länger aufbleiben dürfen."], r: ["mpf.dbl"] },
          { w: ["ich", "das", "nicht", "wollen"], a: ["Ich habe das nicht gewollt.", "Das habe ich nicht gewollt."], r: ["mpf.alone"] },
          { w: ["er", "zum Arzt", "gehen", "müssen"], a: ["Er hat zum Arzt gehen müssen."], r: ["mpf.dbl"] },
          { w: ["sie", "mich", "anrufen", "wollen"], a: ["Sie hat mich anrufen wollen."], r: ["mpf.dbl"] },
          { w: ["ihr", "lange", "warten", "müssen", "?"], a: ["Habt ihr lange warten müssen?"], r: ["mpf.dbl"] },
          { w: ["ich", "weiß", "dass", "du", "nicht", "kommen", "können"], a: ["Ich weiß, dass du nicht hast kommen können.", "Ich weiß, dass du nicht kommen konntest."], r: ["mpf.sub"] },
        ] },
        { id: "dp.mpf", t: "translate", end: true, title: "Say it in German", how: "Translate. In speech the Präteritum (musste) is usual; the Perfekt (habe … müssen) is right too.", items: [
          { q: "I had to work on Saturday.", a: ["Ich musste am Samstag arbeiten.", "Ich habe am Samstag arbeiten müssen.", "Am Samstag musste ich arbeiten.", "Am Samstag habe ich arbeiten müssen."], r: ["mpf.prat"] },
          { q: "We couldn't find a flat.", a: ["Wir konnten keine Wohnung finden.", "Wir haben keine Wohnung finden können."], r: ["mpf.dbl"] },
          { q: "She wanted to call you. (dich)", a: ["Sie wollte dich anrufen.", "Sie hat dich anrufen wollen."], r: ["mpf.prat"] },
          { q: "I didn't mean that.", a: ["Das habe ich nicht gewollt.", "Ich habe das nicht gewollt.", "Das wollte ich nicht.", "Ich wollte das nicht."], r: ["mpf.alone"] },
          { q: "Were you allowed to stay longer? (du)", a: ["Durftest du länger bleiben?", "Hast du länger bleiben dürfen?"], r: ["mpf.dbl"] },
          { q: "He couldn't come because he had to work.", a: ["Er konnte nicht kommen, weil er arbeiten musste.", "Er hat nicht kommen können, weil er hat arbeiten müssen.", "Er konnte nicht kommen, weil er hat arbeiten müssen.", "Er hat nicht kommen können, weil er arbeiten musste."], r: ["mpf.sub"] },
          { q: "We had to wait an hour.", a: ["Wir mussten eine Stunde warten.", "Wir haben eine Stunde warten müssen."], r: ["mpf.dbl"] },
          { q: "The children didn't want to sleep.", a: ["Die Kinder wollten nicht schlafen.", "Die Kinder haben nicht schlafen wollen."], r: ["mpf.prat"] },
          { q: "I'm sorry that I couldn't help you. (dir)", a: ["Es tut mir leid, dass ich dir nicht helfen konnte.", "Es tut mir leid, dass ich dir nicht habe helfen können.", "Tut mir leid, dass ich dir nicht helfen konnte."], r: ["mpf.sub"] },
          { q: "Could you sleep well? (du)", a: ["Konntest du gut schlafen?", "Hast du gut schlafen können?"], r: ["mpf.prat"] },
          { q: "He has never been able to do that.", a: ["Das hat er nie gekonnt.", "Er hat das nie gekonnt.", "Das konnte er nie.", "Er konnte das nie.", "Das hat er noch nie gekonnt.", "Er hat das noch nie gekonnt.", "Das konnte er noch nie.", "Er konnte das noch nie."], r: ["mpf.alone"] },
        ] },
        { id: "dw.mpf", t: "write", end: true, title: "Write your own", how: "Write in your own words, about the past. Saved for Claude to correct.", items: [
          { q: "Last week: what did you have to do, what couldn't you do?", model: ["Letzte Woche musste ich jeden Tag lange arbeiten. Am Mittwoch konnte ich nicht ins Training gehen, weil ich auf einen Handwerker warten musste."], r: ["mpf.prat"] },
          { q: "When you were a child: what were you allowed to do, what not?", model: ["Als Kind durfte ich im Sommer lange draußen spielen. Ich durfte aber nie allein in die Stadt fahren."], r: ["mpf.prat"] },
          { q: "Something you wanted to do but couldn't. Why?", model: ["Ich wollte letztes Jahr nach Island reisen, aber ich habe keine Ferien nehmen können. Vielleicht klappt es nächstes Jahr."], r: ["mpf.dbl"] },
          { q: "Apologise for something you couldn't do. (Es tut mir leid, dass …)", model: ["Es tut mir leid, dass ich gestern nicht anrufen konnte. Ich musste meine Tochter vom Training abholen."], r: ["mpf.sub"] },
          { q: "Your first weeks in Switzerland: what did you have to organise?", model: ["Ich musste mich bei der Gemeinde anmelden und eine Krankenkasse suchen. Ein Bankkonto habe ich erst nach drei Wochen eröffnen können."], r: ["mpf.dbl"] },
          { q: "Something you never liked or never could do. (gemocht · gekonnt)", model: ["Ich habe Spinat nie gemocht. Und Mathe habe ich auch nie gekonnt."], r: ["mpf.alone"] },
          { q: "A bad trip: what went wrong? Use mussten and konnten.", model: ["Unser Flug hatte Verspätung, und wir mussten fünf Stunden warten. Im Hotel konnten wir nicht schlafen, weil es so laut war."], r: ["mpf.prat"] },
          { q: "Tell a friend why you couldn't come to the party.", model: ["Ich konnte leider nicht kommen, weil ich arbeiten musste. Mein Chef hat mich am Freitagabend noch angerufen."], r: ["mpf.sub"] },
        ] },
      ],
    },
  },
});

// What chapters 17 and 24 became (24•2 — lassen, hören, sehen, helfen — is lassen's).
cxCover({
  "17.16": "d17.16", "17.17": "d17.17", "24.1": "d24.1", "24.3": "d24.3", "24.4": "d24.4",
  "24.2": { st: "planned", sec: "s2.lassen" },
});
