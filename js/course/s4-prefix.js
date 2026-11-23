// ── COURSE PACK · After B1 (bonus) · Prefixes both separable and inseparable ──
// Book: chapter 12's "Prefixes that are inseparable and separable" (12•11:
// ich, er, wir with the stress marked) and the conjugation of 12•5 (one verb
// that splits, one that doesn't). The plain separable / inseparable prefixes
// are the A2 verb lesson's (s1.sep, pr6). One sheet: durch-, über-, um-,
// unter-, wider-, wieder- go either way, and the stress tells which (úmziehen ·
// übersétzen) · a separable one splits and takes ge- and zu in the middle ·
// an inseparable one stays together, no ge- · the pairs with two meanings
// (úmfahren / umfáhren). The book lists *widerrufen* as separable: it is
// inseparable (er widerruft, hat widerrufen) — our items leave it out. B2 —
// a bonus after B1. Written by hand: the verb engine guesses these prefixes
// from a table (um- separable, durch- not), so it can't check them.
const CX_PFX_GE = [
  { t: "swap", from: "^(uber|unter|um|durch|wieder|wider)ge\\w+$", to: "^(uber|unter|um|durch|wieder|wider)(?!ge)\\w+$", rule: "pfx.insep", hard: true, msg: "The stress is on the verb, so it stays together with no ge-: **{right}**." },
  { t: "swap", from: "^(uber|unter|um|durch|wieder|wider)(?!ge)\\w+$", to: "^(uber|unter|um|durch|wieder|wider)ge\\w+$", rule: "pfx.sep", hard: true, msg: "The stress is on the prefix, so ge- goes in the middle: **{right}**." },
];
cxPack({
  id: "s4-prefix",
  sections: {
    "s4.prefix": {
      rules: {
        "pfx.stress": "durch-, über-, um-, unter-, wider-, wieder-: the stress decides",
        "pfx.sep": "Stress on the prefix: it splits (ich ziehe um, umgezogen)",
        "pfx.insep": "Stress on the verb: it stays (ich übersetze, übersetzt)",
        "pfx.pairs": "Two verbs, two meanings: úmfahren · umfáhren",
      },
      sheets: [
        { id: "cx.pfx", title: "Ich ziehe um · Ich übersetze", qn: 3,
          struct: [["Ich", "who"], ["ziehe", "verb"], ["im März", "mid"], ["um", "inf"]],
          why: "Six prefixes — **durch, über, um, unter, wider, wieder** — can split off or stay. The **stress** tells you: on the prefix, it splits (**úm**ziehen: ich ziehe **um**); on the verb, it stays (über**sét**zen: ich **übersetze**). Some verbs exist both ways, with two meanings.",
          rid: ["pfx.stress", "pfx.sep", "pfx.insep", "pfx.pairs"],
          rules: [
            "The prefixes **durch-, über-, um-, unter-, wider-** and **wieder-** can go either way, and the stress decides. Stress on the **prefix**: separable (**úm**ziehen, **wíeder**sehen). Stress on the **verb**: inseparable (über**sét**zen, wieder**hól**en).",
            "A **separable** one works like *anrufen*: the prefix goes to the end, and **ge-** and **zu** go in the middle. Ich ziehe nächsten Monat **um**. · Ich bin **umgezogen**. · Ich habe vor, **umzuziehen**. Its meaning is often literal: over, through, round, under.",
            "An **inseparable** one stays together and takes **no ge-**: Ich **übersetze** den Brief. · Ich habe ihn **übersetzt**. · Ich versuche, ihn zu **übersetzen**. Its meaning is often figurative.",
            "A few verbs exist **both ways**, with two meanings: **úmfahren** (knock over) — Er hat das Schild **umgefahren** · **umfáhren** (drive round) — Wir haben den Stau **umfahren**. The same with **úmgehen** (handle: Er geht gut mit Kindern **um**) and **umgéhen** (avoid: Er **umgeht** die Frage).",
          ],
          table: { head: ["separable", "inseparable"], rows: [
            ["ich ziehe **um**", "ich **umarme**"],
            ["**umgezogen**", "**umarmt**"],
            ["ich sehe dich **wieder**", "ich **wiederhole**"],
            ["ich falle **durch**", "ich **durchsuche**"],
            ["die Sonne geht **unter**", "ich **unterbreche**"],
            ["es spiegelt … **wider**", "ich **widerspreche**"],
          ] },
          ex: [
            ["Wir **ziehen** im März nach Bern **um**.", "We're moving to Bern in March."],
            ["Kannst du den Satz bitte **wiederholen**?", "Can you repeat the sentence, please?"],
            ["Leider ist er bei der Prüfung **durchgefallen**.", "Unfortunately he failed the exam."],
            ["Darf ich kurz **unterbrechen**?", "May I interrupt for a moment?"],
          ],
          trap: "ge- goes only into the separable ones: **umgezogen**, **durchgefallen** — but **übersetzt**, **wiederholt**, **unterbrochen**. Not ~~übergesetzt~~ for *translated*, not ~~wiedergeholt~~ for *repeated*.",
          quiz: [
            { at: "r1", k: "pick", q: "Which one splits off? (stress on the prefix)", o: ["úmziehen", "übersétzen", "wiederhólen"], a: 0, why: "Stress on **um**: it splits — ich ziehe **um**." },
            { at: "r1", k: "pick", q: "Ich ___ den Text ins Englische.", o: ["übersetze", "setze über", "übersetzt"], a: 0, why: "*translate*: über**sét**zen stays together — ich **übersetze**." },
            { at: "r2", k: "type", cx: true, q: "Wir sind letztes Jahr nach Basel ___. (umziehen)", a: ["umgezogen"], r: ["pfx.sep"], why: "Separable: ge- in the middle, **umgezogen**." },
            { at: "r2", k: "pick", q: "Er ist bei der Prüfung ___.", o: ["durchgefallen", "durchfallen", "gedurchfallen"], a: 0, why: "**dúrch**fallen splits: **durchgefallen**." },
            { at: "r3", k: "pick", q: "Hast du den Brief schon ___?", o: ["übersetzt", "übergesetzt", "geübersetzt"], a: 0, why: "Inseparable: no ge- — **übersetzt**." },
            { at: "r3", k: "type", cx: true, q: "Der Lehrer hat die Frage zweimal ___. (wiederholen)", a: ["wiederholt"], r: ["pfx.insep"], why: "wieder**hól**en stays together, no ge-: **wiederholt**." },
            { at: "r4", k: "pick", q: "He knocked the sign over: Er hat das Schild ___.", o: ["umgefahren", "umfahren"], a: 0, why: "*knock over* is **úm**fahren — it splits: **umgefahren**." },
            { at: "r4", k: "pick", q: "We drove round the traffic jam: Wir haben den Stau ___.", o: ["umfahren", "umgefahren"], a: 0, why: "*drive round* is um**fáh**ren — no ge-: **umfahren**." },
            { at: "table", k: "pick", q: "Ich ___ dir nicht. (I don't contradict you.)", o: ["widerspreche", "spreche wider"], a: 0, why: "wider**sprech**en stays together: ich **widerspreche**." },
            { at: "trap", k: "pick", q: "unterbrechen, Perfekt:", o: ["hat unterbrochen", "hat untergebrochen", "hat unterbrecht"], a: 0, why: "Inseparable: no ge- — **unterbrochen**." },
          ] },
      ],
      diag: [
        ...CX_PFX_GE,
        { t: "order", rule: "", msg: "A separable prefix goes to the very end of the clause: Ich ziehe im März **um**. An inseparable one stays on its verb: Ich **übersetze** den Brief." },
      ],
      drills: [
        // ── Übung 12•5: one splits, one doesn't ──
        { id: "d12.5", ex: "12.5", t: "type", title: "One splits, one doesn't", how: "Write the verb in the Präsens: úmsteigen splits (ich steige … um), übernáchten and unterbréchen stay together.", items: [
          { q: "Ich ___ in Olten um. (umsteigen)", a: ["steige"], r: ["pfx.sep"] },
          { q: "Du ___ in Olten um. (umsteigen)", a: ["steigst"], r: ["pfx.sep"] },
          { q: "Wo ___ wir um? (umsteigen)", a: ["steigen"], r: ["pfx.sep"] },
          { q: "Ihr ___ in Bern um. (umsteigen)", a: ["steigt"], r: ["pfx.sep"] },
          { q: "Ich ___ im Hotel am See. (übernachten)", a: ["übernachte"], r: ["pfx.insep"] },
          { q: "Lea ___ bei ihrer Tante. (übernachten)", a: ["übernachtet"], r: ["pfx.insep"] },
          { q: "___ ihr im Zelt? (übernachten)", a: ["Übernachtet"], r: ["pfx.insep"] },
          { q: "Man ___ die Lehrerin nicht. (unterbrechen)", a: ["unterbricht"], r: ["pfx.insep"] },
          { q: "Bitte ___ Sie mich nicht! (unterbrechen)", a: ["unterbrechen"], r: ["pfx.insep"] },
          { q: "Niemand ___ den Redner. (unterbrechen)", a: ["unterbricht"], r: ["pfx.insep"] },
        ] },
        // ── Übung 12•11: where does the prefix go? ──
        { id: "d12.11", ex: "12.11", t: "type", title: "Follow the stress", how: "The stress is marked. On the prefix: it splits and goes to the end. On the verb: it stays. Write the verb's form.", items: [
          { q: "Ich ___ immer ein bisschen. (übertréiben)", a: ["übertreibe"], r: ["pfx.stress"] },
          { q: "Wir ___ uns nächste Woche wieder. (wíedersehen)", a: ["sehen"], r: ["pfx.stress"] },
          { q: "Wir ___ die Lektion. (wiederhólen)", a: ["wiederholen"], r: ["pfx.stress"] },
          { q: "Ich ___ bei Freunden unter. (únterkommen)", a: ["komme"], r: ["pfx.stress"] },
          { q: "Er ___ an der Tankstelle voll. (vólltanken)", a: ["tankt"], r: ["pfx.stress"] },
          { q: "Wir ___ bei der Prüfung nicht durch. (dúrchfallen)", a: ["fallen"], r: ["pfx.stress"] },
          { q: "Ich ___ meine Freundin zum Abschied. (umármen)", a: ["umarme"], r: ["pfx.stress"] },
          { q: "Er ___ den Wald zu Fuß. (durchquéren)", a: ["durchquert"], r: ["pfx.stress"] },
          { q: "Wir ___ das alte Haus um. (úmbauen)", a: ["bauen"], r: ["pfx.stress"] },
          { q: "Er ___ seinem Chef nie. (widerspréchen)", a: ["widerspricht"], r: ["pfx.stress"] },
        ] },
        // ── ours: the Perfekt — ge- or not ──
        { id: "dpfx.pf", t: "type", title: "Perfekt: ge- or not?", how: "Write the Partizip II. Separable (stress on the prefix): ge- in the middle. Inseparable: no ge-.", items: [
          { q: "Wir sind im Mai ___. (umziehen)", a: ["umgezogen"], r: ["pfx.sep"] },
          { q: "Hast du den Vertrag schon ___? (übersetzen)", a: ["übersetzt"], r: ["pfx.insep"] },
          { q: "Er ist zweimal ___. (durchfallen)", a: ["durchgefallen"], r: ["pfx.sep"] },
          { q: "Die Lehrerin hat den Satz ___. (wiederholen)", a: ["wiederholt"], r: ["pfx.insep"] },
          { q: "Wir haben ihn mitten in der Rede ___. (unterbrechen)", a: ["unterbrochen"], r: ["pfx.insep"] },
          { q: "Sie hat ihre Mutter lange ___. (umarmen)", a: ["umarmt"], r: ["pfx.insep"] },
          { q: "Ich bin in Zürich ___. (umsteigen)", a: ["umgestiegen"], r: ["pfx.sep"] },
          { q: "Der Zoll hat unser Auto ___. (durchsuchen)", a: ["durchsucht"], r: ["pfx.insep"] },
          { q: "Die Sonne ist schon ___. (untergehen)", a: ["untergegangen"], r: ["pfx.sep"] },
          { q: "Habt ihr im Hotel ___? (übernachten)", a: ["übernachtet"], r: ["pfx.insep"] },
          { q: "Er hat mir nie ___. (widersprechen)", a: ["widersprochen"], r: ["pfx.insep"] },
        ].map(it => ({ ...it, diag: CX_PFX_GE })) },
        // ── ours: two meanings ──
        { id: "dpfx.pairs", t: "pick", title: "Which meaning?", how: "The English says which verb it is. Pick the form.", items: [
          { q: "He knocked a cyclist over: Er hat einen Velofahrer ___.", o: ["umgefahren", "umfahren"], a: ["umgefahren"], r: ["pfx.pairs"] },
          { q: "We drove round the city centre: Wir haben die Innenstadt ___.", o: ["umfahren", "umgefahren"], a: ["umfahren"], r: ["pfx.pairs"] },
          { q: "He's good with children: Er ___ gut mit Kindern um.", o: ["geht", "umgeht"], a: ["geht"], r: ["pfx.pairs"] },
          { q: "She avoids the question: Sie ___ die Frage.", o: ["umgeht", "geht"], a: ["umgeht"], r: ["pfx.pairs"] },
          { q: "I see through you: Ich ___ dich.", o: ["durchschaue", "schaue"], a: ["durchschaue"], r: ["pfx.pairs"] },
          { q: "The ferryman takes us across: Der Fährmann setzt uns ___.", o: ["über", "übersetzt"], a: ["über"], r: ["pfx.pairs"] },
          { q: "I'm rewriting the letter: Ich ___ den Brief um.", o: ["schreibe", "umschreibe"], a: ["schreibe"], r: ["pfx.pairs"] },
          { q: "He describes the word without saying it: Er ___ das Wort.", o: ["umschreibt", "schreibt"], a: ["umschreibt"], r: ["pfx.pairs"] },
          { q: "I've overdrawn my account: Ich habe mein Konto ___.", o: ["überzogen", "übergezogen"], a: ["überzogen"], r: ["pfx.pairs"] },
          { q: "Put a jacket on over it: Zieh eine Jacke ___!", o: ["über", "überzieh"], a: ["über"], r: ["pfx.pairs"] },
        ] },
        // ── Production ──
        { id: "dp.pfx", t: "translate", end: true, title: "Say it in German", how: "Translate. Mind where the prefix goes, and whether the Partizip II takes ge-.", items: [
          { q: "We're moving to Lucerne next month.", a: ["Wir ziehen nächsten Monat nach Luzern um.", "Nächsten Monat ziehen wir nach Luzern um.", "Wir ziehen im nächsten Monat nach Luzern um.", "Im nächsten Monat ziehen wir nach Luzern um."], r: ["pfx.sep"] },
          { q: "Can you repeat that, please?", a: ["Können Sie das bitte wiederholen?", "Kannst du das bitte wiederholen?", "Könnten Sie das bitte wiederholen?", "Könntest du das bitte wiederholen?"], r: ["pfx.insep"] },
          { q: "She failed the driving test.", a: ["Sie ist bei der Fahrprüfung durchgefallen.", "Sie ist durch die Fahrprüfung gefallen."], r: ["pfx.sep"] },
          { q: "Don't interrupt me! (du)", a: ["Unterbrich mich nicht!"], r: ["pfx.insep"] },
          { q: "I've translated the letter.", a: ["Ich habe den Brief übersetzt."], r: ["pfx.insep"] },
          { q: "Where do I have to change trains?", a: ["Wo muss ich umsteigen?"], r: ["pfx.sep"] },
          { q: "He contradicts his boss.", a: ["Er widerspricht seinem Chef.", "Er widerspricht seiner Chefin."], r: ["pfx.insep"] },
          { q: "The sun has set.", a: ["Die Sonne ist untergegangen."], r: ["pfx.sep"] },
          { q: "She hugged her son.", a: ["Sie hat ihren Sohn umarmt.", "Sie umarmte ihren Sohn."], r: ["pfx.insep"] },
          { q: "A car knocked the sign over.", a: ["Ein Auto hat das Schild umgefahren.", "Ein Auto fuhr das Schild um."], r: ["pfx.pairs"] },
        ] },
        { id: "dw.pfx", t: "write", end: true, title: "Write your own", how: "Write in your own words. Saved for Claude to correct.", items: [
          { q: "Tell the story of your last move. (umziehen, die Kartons, …)", model: ["Vor zwei Jahren sind wir nach Winterthur umgezogen. Wir haben alles selbst gepackt, aber die Möbel hat eine Firma transportiert."], r: ["pfx.sep"] },
          { q: "A meeting where someone kept interrupting. (unterbrechen, widersprechen)", model: ["In der Sitzung hat mich ein Kollege dreimal unterbrochen. Er widerspricht immer, auch wenn er keine bessere Idee hat."], r: ["pfx.insep"] },
          { q: "An exam you remember: passed, failed or repeated? (bestehen, durchfallen, wiederholen)", model: ["Bei der ersten Fahrprüfung bin ich durchgefallen. Ich habe sie einen Monat später wiederholt und bestanden."], r: ["pfx.sep"] },
          { q: "A train trip with changes: where did you change? (umsteigen)", model: ["Nach Lugano bin ich in Arth-Goldau umgestiegen. Der Anschluss war knapp, aber ich habe den Zug erwischt."], r: ["pfx.sep"] },
          { q: "You translated something for a friend or neighbour. Tell it. (übersetzen)", model: ["Ich habe für meine Nachbarin einen Brief von der Versicherung übersetzt. Sie war sehr froh."], r: ["pfx.insep"] },
          { q: "How do you handle stress? (mit … umgehen)", model: ["Ich gehe mit Stress besser um, wenn ich jeden Tag spazieren gehe. Am Abend lese ich und schalte das Handy aus."], r: ["pfx.pairs"] },
          { q: "A night away from home. (übernachten)", model: ["Letzten Sommer haben wir in einer SAC-Hütte übernachtet. Am Morgen sind wir um fünf Uhr aufgestanden."], r: ["pfx.insep"] },
          { q: "A sunset you remember. (die Sonne ging unter)", model: ["Am Genfersee habe ich den schönsten Sonnenuntergang gesehen. Die Sonne ging hinter den Bergen unter, und alles war rot."], r: ["pfx.sep"] },
        ] },
      ],
    },
  },
});

// What chapter 12 became for this lesson.
cxCover({ "12.5": "d12.5", "12.11": "d12.11" });
