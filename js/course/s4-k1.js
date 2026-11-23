// ── COURSE PACK · After B1 (bonus) · Konjunktiv I and reported speech ──
// Book: chapter 26's "Subjunctive I", "Use and Formation of the Subjunctive
// I", "Present-Time" and "Past-Time Subjunctive I" and "Expressing a Wish"
// (26•1, 26•4, 26•5, 26•9, 26•10, 26•13, 26•14) and chapter 27's
// "Subjunctive I" and "Indirect discourse" (27•1, 27•2, 27•10). Two sheets:
// the forms and where they live (er sei, er habe, er komme — the news,
// reports, minutes; in speech the indicative or the Konjunktiv II) and the
// Konjunktiv II where the Konjunktiv I looks like the present (sie hätten) ·
// the times of reported speech (sei gewesen, habe gemacht, werde kommen),
// reported questions and commands (ob …, ich solle …) and the set phrases
// everyone says (Gott sei Dank, es sei denn). B2: learned mostly to read
// and to write; the fide asks for none of it — a bonus after B1.
// The book's 26•11 and 26•12 (questions and commands passed on) were
// mirrored in everyday German by the indirect questions (s2.indq); 27•3 and
// 27•9's Konjunktiv I half sit with their Konjunktiv II half (s2.k2). Here
// the same frames come back in the written form.
// Both orders of a reported statement are right: «Er sagt, er sei krank.»
// and «Er sagt, dass er krank sei.» — cxKjBoth lists the two.
function cxKjBoth(lead, v2, vEnd) { return [`${lead} ${v2}.`, `${lead} dass ${vEnd}.`]; }
cxPack({
  id: "s4-k1",
  sections: {
    "s4.k1": {
      rules: {
        "kj.form": "Konjunktiv I: the stem + e (er komme, er habe, er könne)",
        "kj.sein": "sein: ich sei, du seist, er sei, wir seien",
        "kj.use": "Reported speech in writing — the news, reports, letters",
        "kj.swap": "Looks like the present? The Konjunktiv II (sie hätten)",
        "kj.past": "The past: habe / sei + Partizip II",
        "kj.fut": "Later: werde + infinitive (wir, sie: würden)",
        "kj.ask": "Questions with ob or a W-word · commands with solle",
        "kj.fixed": "Set phrases: Gott sei Dank, es sei denn, Man nehme …",
      },
      sheets: [
        { id: "cx.kj1", title: "Er sagt, er sei krank", qn: 3,
          struct: [["Er sagt,", "who"], ["er", "who"], ["sei", "verb"], ["krank", "mid"]],
          why: "The **Konjunktiv I** is the form of **reported speech** in written German: the news, reports, minutes, official letters. It passes on what someone said without saying it is true. You need it mainly to **read** — in conversation people use the normal forms.",
          rid: ["kj.form", "kj.sein", "kj.use", "kj.swap"],
          rules: [
            "The **Konjunktiv I** is the stem of the infinitive + the endings **-e, -est, -e, -en, -et, -en**: er **komme**, er **habe**, er **könne**, er **wisse**. There is no vowel change: er **fahre**, er **nehme**. You will meet it mostly with **er, sie** and **es**, where it differs from the present: er hat → er **habe**.",
            "**sein** is the one verb with a Konjunktiv I in every person: ich **sei**, du **seist**, er **sei**, wir **seien**, ihr **seiet**, sie **seien**. It is the form you will see most often: Der Minister sagte, er **sei** zufrieden.",
            "Use the Konjunktiv I to **report** what someone said or wrote, mostly **in writing** — the news, reports, letters: Die Polizei teilt mit, der Fahrer **sei** verletzt. When you speak, use the normal present (sie sagt, er **ist** krank) or the Konjunktiv II (er **wäre** krank).",
            "When the Konjunktiv I looks just like the present — ich **habe**, wir **kommen**, sie **haben** — use the **Konjunktiv II** instead: Sie sagen, sie **hätten** keine Zeit. · Er meint, wir **kämen** zu spät. (würde + the infinitive works too: wir **würden** zu spät **kommen**.)",
          ],
          table: { head: ["present", "Konjunktiv I"], rows: [
            ["er ist", "er **sei**"],
            ["er hat", "er **habe**"],
            ["er kommt", "er **komme**"],
            ["er kann", "er **könne**"],
            ["er fährt", "er **fahre**"],
            ["sie sind", "sie **seien**"],
            ["sie haben", "sie **hätten** (K II)"],
          ] },
          ex: [
            ["Die Firma teilt mit, der Chef **sei** in den Ferien.", "The company says the boss is on holiday."],
            ["Im Bericht steht, die Brücke **müsse** saniert werden.", "The report says the bridge has to be renovated."],
            ["Lea schreibt, sie **komme** erst am Montag zurück.", "Lea writes that she won't be back until Monday."],
            ["Die Nachbarn sagen, sie **hätten** am Samstag keine Zeit.", "The neighbours say they have no time on Saturday."],
          ],
          trap: "Don't use the Konjunktiv I in conversation — it sounds like the news. At the counter say: Sie sagt, sie **ist** krank (or sie **wäre** krank). And the vowel never changes: er **fahre**, er **nehme** — not ~~er fähre~~, ~~er nimme~~.",
          quiz: [
            { at: "r1", k: "pick", q: "In the news: Der Sprecher sagt, der Zug ___ Verspätung.", o: ["habe", "hat", "hätte"], a: 0, why: "Written reported speech: the Konjunktiv I, **habe** — the stem + e." },
            { at: "r1", k: "type", cx: true, q: "Sie schreibt, sie ___ morgen. (kommen)", a: ["komme"], r: ["kj.form"], why: "The stem + e: **komme**." },
            { at: "r1", k: "pick", q: "er fährt → Konjunktiv I:", o: ["er fahre", "er fähre", "er führe"], a: 0, why: "No vowel change: the stem **fahr** + e." },
            { at: "r2", k: "pick", q: "In a report: Die Ärztin sagt, die Kinder ___ gesund.", o: ["seien", "sind", "sein"], a: 0, why: "sein, plural: **seien**." },
            { at: "r2", k: "type", cx: true, q: "Laut Bericht ___ das Wasser sauber. (sein)", a: ["sei"], r: ["kj.sein"], why: "sein, er / sie / es: **sei**." },
            { at: "r3", k: "pick", q: "Telling a friend what Mia said, you say:", o: ["Mia sagt, sie ist krank.", "Mia sagt, sie sei krank."], a: 0, why: "In conversation, the normal present (or wäre). The Konjunktiv I is for writing." },
            { at: "r3", k: "pick", q: "Where do you meet the Konjunktiv I most?", o: ["in the news and in reports", "at the bakery", "in commands"], a: 0, why: "It is the written form of reported speech." },
            { at: "r4", k: "pick", q: "In a report: Sie sagen, sie ___ keine Zeit.", o: ["hätten", "haben", "habe"], a: 0, why: "sie haben looks like the present: the Konjunktiv II, **hätten**." },
            { at: "r4", k: "type", cx: true, q: "Die Kinder sagen, sie ___ Hunger. (haben)", a: ["hätten"], r: ["kj.swap"], why: "sie haben would be the present: **hätten**." },
            { at: "table", k: "pick", q: "er weiß → Konjunktiv I:", o: ["er wisse", "er weiße", "er weiß"], a: 0, why: "The stem **wiss** + e: **wisse**." },
            { at: "trap", k: "pick", q: "nehmen, er → Konjunktiv I:", o: ["er nehme", "er nimme", "er nimmt"], a: 0, why: "No vowel change: **nehme**." },
          ] },
        { id: "cx.kj2", title: "Sie sagte, sie habe ihn gesehen", qn: 3,
          struct: [["Sie sagte,", "who"], ["sie", "who"], ["habe", "aux"], ["ihn", "thing"], ["gesehen", "p2"]],
          why: "Reported speech has only three times: **now** (er sei), **before** (er sei gewesen, er habe gemacht) and **later** (er werde kommen). Questions keep **ob** or their W-word; commands become **sollen**.",
          rid: ["kj.past", "kj.fut", "kj.ask", "kj.fixed"],
          rules: [
            "Anything **in the past** — Präteritum, Perfekt or Plusquamperfekt — becomes **habe** or **sei** + the Partizip II: «Ich war krank.» → Er sagte, er **sei** krank **gewesen**. · «Wir kauften ein Haus.» → Sie sagten, sie **hätten** ein Haus **gekauft**.",
            "The **future** becomes **werde** + the infinitive: «Ich werde anrufen.» → Sie sagte, sie **werde anrufen**. With wir and sie (they), werden looks like the present, so use **würden**: Sie sagten, sie **würden** später **kommen**.",
            "A reported **question** keeps **ob** or its W-word, with the verb at the end: Er fragte, **ob** ich Zeit **hätte**. · Sie wollte wissen, **wo** der Bahnhof **sei**. A reported **command** takes **sollen**: «Warten Sie!» → Er sagte, ich **solle** warten.",
            "A few **set phrases** use the Konjunktiv I, and everyone says them: **Gott sei Dank!** · **Es lebe** die Freiheit! · Wir kommen, **es sei denn**, es regnet. · **Wie dem auch sei** … · in recipes: **Man nehme** zwei Eier.",
          ],
          table: { head: ["they said", "reported"], rows: [
            ["«Ich bin müde.»", "er **sei** müde"],
            ["«Ich war müde.»", "er **sei** müde **gewesen**"],
            ["«Ich habe gewartet.»", "er **habe** **gewartet**"],
            ["«Ich werde kommen.»", "er **werde kommen**"],
            ["«Hast du Zeit?»", "**ob** ich Zeit **hätte**"],
            ["«Warte!»", "ich **solle** warten"],
          ] },
          ex: [
            ["Der Zeuge sagte, er **habe** nichts **gesehen**.", "The witness said he hadn't seen anything."],
            ["Die SBB teilte mit, der Zug **werde** um zehn Uhr **fahren**.", "SBB announced that the train would leave at ten."],
            ["Meine Chefin fragte, **ob** ich am Samstag arbeiten **könne**.", "My boss asked whether I could work on Saturday."],
            ["Der Arzt meinte, ich **solle** mehr trinken.", "The doctor said I should drink more."],
          ],
          trap: "There is no Präteritum in reported speech: «Er kam spät.» → er **sei** spät **gekommen**, not ~~er käme spät~~ (that means *he would come late*). And a reported question never takes dass: Er fragte, **ob** …",
          quiz: [
            { at: "r1", k: "pick", q: "«Ich war in Bern.» → Sie sagte, sie ___ in Bern gewesen.", o: ["sei", "habe", "war"], a: 0, why: "gewesen goes with sein: **sei** gewesen." },
            { at: "r1", k: "type", cx: true, q: "«Ich habe den Bus verpasst.» → Er sagte, er ___ den Bus verpasst. (haben)", a: ["habe"], r: ["kj.past"], why: "The past: **habe** + the Partizip II." },
            { at: "r1", k: "order", q: "Build it: She said she had gone home.", a: ["Sie sagte,", "sie", "sei", "nach Hause", "gegangen."], why: "sei second, the Partizip II at the end." },
            { at: "r2", k: "pick", q: "In a report: «Ich werde anrufen.» → Er sagte, er ___ anrufen.", o: ["werde", "wird", "habe"], a: 0, why: "Later: **werde** + the infinitive." },
            { at: "r2", k: "type", cx: true, q: "«Wir werden später kommen.» → Sie sagten, sie ___ später kommen.", a: ["würden"], r: ["kj.fut"], why: "sie werden would look like the present: **würden**." },
            { at: "r3", k: "pick", q: "«Hast du Hunger?» → Er fragte, ___ ich Hunger hätte.", o: ["ob", "dass", "wenn"], a: 0, why: "A yes/no question, reported: **ob**." },
            { at: "r3", k: "pick", q: "In a report: «Fahren Sie langsamer!» → Der Polizist sagte, ich ___ langsamer fahren.", o: ["solle", "werde", "könne"], a: 0, why: "A command, reported: **solle**." },
            { at: "r4", k: "pick", q: "Thank God! → Gott ___ Dank!", o: ["sei", "ist", "wäre"], a: 0, why: "A set phrase with the Konjunktiv I: Gott **sei** Dank." },
            { at: "r4", k: "pick", q: "Unless it rains: Wir gehen wandern, es ___ denn, es regnet.", o: ["sei", "ist", "wäre"], a: 0, why: "*unless* is **es sei denn**." },
            { at: "table", k: "pick", q: "«Warte hier!» → Sie sagte, ich ___ hier warten.", o: ["solle", "warte", "wartete"], a: 0, why: "A command, reported: **solle** + the infinitive." },
            { at: "trap", k: "pick", q: "«Er kam spät.» → reported:", o: ["Sie sagte, er sei spät gekommen.", "Sie sagte, er käme spät.", "Sie sagte, er kam spät."], a: 0, why: "Any past becomes **sei / habe** + the Partizip II." },
          ] },
      ],
      diag: [
        { t: "swap", from: "^dass$", to: "^ob$", rule: "kj.ask", hard: true, msg: "A reported yes/no question takes **ob**, never dass." },
        { t: "swap", from: "^(soll|sollst|sollen|muss)$", to: "^(solle|sollten)$", rule: "kj.ask", msg: "A reported command takes the Konjunktiv I of sollen: **{right}**." },
        { t: "swap", from: "^(war|warst|waren|wart|kam|ging|fuhr|lief|machte|kaufte|sagte|gab|sah|las|schrieb|zog|stand|wurde)$", to: "^(sei|seien|habe|hatten|seist)$", rule: "kj.past", hard: true, msg: "Reported speech has no Präteritum: **{right}** + the Partizip II (er sei gekommen, er habe gesagt)." },
        { t: "swap", from: "^(wird|wirst|werdet)$", to: "^(werde|wurden)$", rule: "kj.fut", hard: true, msg: "Later, reported: **{right}** + the infinitive." },
        { t: "swap", from: "^(haben|kommen|gehen|konnen|mussen|wollen|werden|wissen|geben|steigen|spielen|sollen)$", to: "^(hatten|kamen|gingen|konnten|mussten|wollten|wurden|wussten|gaben|stiegen|spielten|sollten)$", rule: "kj.swap", hard: true, msg: "With wir and sie (they) the Konjunktiv I looks like the present: use the Konjunktiv II, **{right}**." },
        { t: "swap", from: "^(ist|bin|bist|sind|seid|ware|waren)$", to: "^(sei|seist|seiest|seien|seiet)$", rule: "kj.sein", hard: true, msg: "sein, reported in writing: **{right}** (ich sei, du seist, er sei, wir seien, sie seien)." },
        { t: "swap", from: "^(hat|kann|muss|will|darf|soll|weiss|kommt|gibt|fahrt|nimmt|geht|macht|arbeitet|bleibt|braucht|kennt|lauft|isst|tritt)$", to: "^(habe|konne|musse|wolle|durfe|solle|wisse|komme|gebe|fahre|nehme|gehe|mache|arbeite|bleibe|brauche|kenne|laufe|esse|trete)$", rule: "kj.form", hard: true, msg: "In written reported speech: the Konjunktiv I, **{right}** — the stem + e." },
        { t: "swap", from: "^(hatte|konnte|musste|kame|ginge|wusste)$", to: "^(habe|konne|musse|komme|gehe|wisse)$", rule: "kj.use", msg: "That's the spoken way (the Konjunktiv II). In writing, the Konjunktiv I: **{right}**." },
        { t: "order", rule: "", msg: "After dass, ob or a question word the verb goes to the very end; without dass it stays second: Er sagt, er **sei** krank · Er sagt, dass er krank **sei**." },
      ],
      drills: [
        // ── Übung 26•1: the forms ──
        { id: "d26.1", ex: "26.1", t: "type", title: "The Konjunktiv I: the forms", how: "Write the Konjunktiv I: the stem of the infinitive + e (er komme, er könne). sein: ich sei, du seist, er sei, wir seien.", items: [
          { q: "Er sagt, er ___ heute länger arbeiten. (müssen)", a: ["müsse"], r: ["kj.form"] },
          { q: "Sie schreibt, sie ___ jeden Morgen am See. (laufen)", a: ["laufe"], r: ["kj.form"] },
          { q: "Der Chef sagt, er ___ das Projekt bis Juni abschließen. (wollen)", a: ["wolle"], r: ["kj.form"] },
          { q: "Mein Nachbar meint, er ___ zu viel Geld aus. (ausgeben)", a: ["gebe"], r: ["kj.form"] },
          { q: "Laut Lea ___ niemand die Antwort. (wissen)", a: ["wisse"], r: ["kj.form"] },
          { q: "Die Bank teilt mit, es ___ keine Probleme. (geben)", a: ["gebe"], r: ["kj.form"] },
          { q: "Sie meint, ihr Sohn ___ schon gut Deutsch. (können)", a: ["könne"], r: ["kj.form"] },
          { q: "Im Brief steht, Herr Meier ___ das Formular noch nicht. (haben)", a: ["habe"], r: ["kj.form"] },
          { q: "Er glaubt, ich ___ sein Chef. (sein)", a: ["sei"], r: ["kj.sein"] },
          { q: "Die Kinder sagen, sie ___ müde. (sein)", a: ["seien"], r: ["kj.sein"] },
          { q: "Laut Wetterbericht ___ der Sommer zu trocken. (sein)", a: ["sei"], r: ["kj.sein"] },
        ] },
        // ── Übung 26•9: he says … ──
        { id: "d26.9", ex: "26.9", t: "transform", title: "What he says", how: "Report what Jonas, your new colleague, says. Start with «Er sagt,» — the verb stays second (or with dass, at the end). ich → er · du → ich.", items: [
          { q: "«Ich arbeite gern im Team.»", a: cxKjBoth("Er sagt,", "er arbeite gern im Team", "er gern im Team arbeite"), r: ["kj.form"] },
          { q: "«Ich komme aus dem Wallis.»", a: cxKjBoth("Er sagt,", "er komme aus dem Wallis", "er aus dem Wallis komme"), r: ["kj.form"] },
          { q: "«Ich bin erst seit Mai hier.»", a: cxKjBoth("Er sagt,", "er sei erst seit Mai hier", "er erst seit Mai hier sei"), r: ["kj.sein"] },
          { q: "«Ich habe zwei kleine Kinder.»", a: cxKjBoth("Er sagt,", "er habe zwei kleine Kinder", "er zwei kleine Kinder habe"), r: ["kj.form"] },
          { q: "«Ich fahre jeden Tag mit dem Velo.»", a: cxKjBoth("Er sagt,", "er fahre jeden Tag mit dem Velo", "er jeden Tag mit dem Velo fahre"), r: ["kj.form"] },
          { q: "«Ich kann dir am Freitag helfen.»", a: cxKjBoth("Er sagt,", "er könne mir am Freitag helfen", "er mir am Freitag helfen könne"), r: ["kj.form"] },
          { q: "«Du hast ein schönes Büro.»", a: [...cxKjBoth("Er sagt,", "ich hätte ein schönes Büro", "ich ein schönes Büro hätte"), ...cxKjBoth("Er sagt,", "ich habe ein schönes Büro", "ich ein schönes Büro habe")], r: ["kj.swap"] },
          { q: "«Ich nehme immer den Zug um sieben.»", a: cxKjBoth("Er sagt,", "er nehme immer den Zug um sieben", "er immer den Zug um sieben nehme"), r: ["kj.form"] },
          { q: "«Die Kantine ist richtig gut.»", a: cxKjBoth("Er sagt,", "die Kantine sei richtig gut", "die Kantine richtig gut sei"), r: ["kj.sein"] },
          { q: "«Ich weiß noch nicht, wo der Drucker steht.»", a: ["Er sagt, er wisse noch nicht, wo der Drucker steht.", "Er sagt, er wisse noch nicht, wo der Drucker stehe.", "Er sagt, dass er noch nicht wisse, wo der Drucker steht.", "Er sagt, dass er noch nicht wisse, wo der Drucker stehe."], r: ["kj.form"] },
        ] },
        // ── Übung 26•4: as the news reports it ──
        { id: "d26.4", ex: "26.4", t: "transform", title: "As the news reports it", how: "Report it as the news would: «Die Zeitung schreibt, dass …» — the Konjunktiv I, the verb at the end. A question: «Die Journalistin fragt, ob …» or with its W-word.", items: [
          { q: "«Der Bahnhof wird bis 2028 umgebaut.»", a: cxKjBoth("Die Zeitung schreibt,", "der Bahnhof werde bis 2028 umgebaut", "der Bahnhof bis 2028 umgebaut werde"), r: ["kj.use"] },
          { q: "«Die Gemeinde hat kein Geld für ein neues Hallenbad.»", a: cxKjBoth("Die Zeitung schreibt,", "die Gemeinde habe kein Geld für ein neues Hallenbad", "die Gemeinde kein Geld für ein neues Hallenbad habe"), r: ["kj.use"] },
          { q: "«Der Präsident der Firma tritt zurück.»", a: cxKjBoth("Die Zeitung schreibt,", "der Präsident der Firma trete zurück", "der Präsident der Firma zurücktrete"), r: ["kj.form"] },
          { q: "«Das schöne Wetter bleibt bis Sonntag.»", a: cxKjBoth("Die Zeitung schreibt,", "das schöne Wetter bleibe bis Sonntag", "das schöne Wetter bis Sonntag bleibe"), r: ["kj.use"] },
          { q: "«Niemand kennt die Ursache des Unfalls.»", a: cxKjBoth("Die Zeitung schreibt,", "niemand kenne die Ursache des Unfalls", "niemand die Ursache des Unfalls kenne"), r: ["kj.form"] },
          { q: "«Die Mieten in Zürich steigen weiter.»", a: [...cxKjBoth("Die Zeitung schreibt,", "die Mieten in Zürich würden weiter steigen", "die Mieten in Zürich weiter steigen würden"), ...cxKjBoth("Die Zeitung schreibt,", "die Mieten in Zürich stiegen weiter", "die Mieten in Zürich weiter stiegen")], r: ["kj.swap"] },
          { q: "«Die Schule braucht mehr Lehrerinnen und Lehrer.»", a: cxKjBoth("Die Zeitung schreibt,", "die Schule brauche mehr Lehrerinnen und Lehrer", "die Schule mehr Lehrerinnen und Lehrer brauche"), r: ["kj.use"] },
          { q: "«Ist die Passstraße wieder offen?»", a: ["Die Journalistin fragt, ob die Passstraße wieder offen sei."], r: ["kj.use"] },
          { q: "«Kann man die Tickets auch online kaufen?»", a: ["Die Journalistin fragt, ob man die Tickets auch online kaufen könne."], r: ["kj.form"] },
          { q: "«Wann fährt der erste Zug wieder?»", a: ["Die Journalistin fragt, wann der erste Zug wieder fahre."], r: ["kj.form"] },
        ] },
        // ── Übung 27•1: now, before, later — reported ──
        { id: "d27.1", ex: "27.1", t: "transform", title: "Reported: now and before", how: "Report it with dass, in writing: now → sei / habe / komme · before → sei / habe + Partizip II. The verb goes to the end.", items: [
          { q: "Der Hauswart sagte: «Die Heizung ist kaputt.»", a: cxKjBoth("Der Hauswart sagte,", "die Heizung sei kaputt", "die Heizung kaputt sei"), r: ["kj.sein"] },
          { q: "Die Ärztin sagte: «Das Kind hat Fieber gehabt.»", a: cxKjBoth("Die Ärztin sagte,", "das Kind habe Fieber gehabt", "das Kind Fieber gehabt habe"), r: ["kj.past"] },
          { q: "Die Polizei teilte mit: «Der Dieb ist gestern verhaftet worden.»", a: cxKjBoth("Die Polizei teilte mit,", "der Dieb sei gestern verhaftet worden", "der Dieb gestern verhaftet worden sei"), r: ["kj.past"] },
          { q: "Der Trainer sagte: «Die Mannschaft wird immer besser.»", a: cxKjBoth("Der Trainer sagte,", "die Mannschaft werde immer besser", "die Mannschaft immer besser werde"), r: ["kj.form"] },
          { q: "Meine Schwester erzählte: «Ich habe eine neue Stelle gefunden.»", a: cxKjBoth("Meine Schwester erzählte,", "sie habe eine neue Stelle gefunden", "sie eine neue Stelle gefunden habe"), r: ["kj.past"] },
          { q: "Der Vermieter schrieb: «Die Wohnung wird im März renoviert.»", a: cxKjBoth("Der Vermieter schrieb,", "die Wohnung werde im März renoviert", "die Wohnung im März renoviert werde"), r: ["kj.form"] },
          { q: "Die Lehrerin sagte: «Der Ausflug muss leider ausfallen.»", a: cxKjBoth("Die Lehrerin sagte,", "der Ausflug müsse leider ausfallen", "der Ausflug leider ausfallen müsse"), r: ["kj.form"] },
          { q: "Lukas schrieb: «Ich bin gut in Kanada angekommen.»", a: cxKjBoth("Lukas schrieb,", "er sei gut in Kanada angekommen", "er gut in Kanada angekommen sei"), r: ["kj.past"] },
          { q: "Herr Frei erklärte: «Ich gehe nächstes Jahr in Pension.»", a: cxKjBoth("Herr Frei erklärte,", "er gehe nächstes Jahr in Pension", "er nächstes Jahr in Pension gehe"), r: ["kj.form"] },
          { q: "Der Bürgermeister sagte: «Wir haben ein neues Altersheim gebaut.»", a: cxKjBoth("Der Bürgermeister sagte,", "sie hätten ein neues Altersheim gebaut", "sie ein neues Altersheim gebaut hätten"), r: ["kj.swap"] },
        ] },
        // ── Übung 26•5: it happened — habe or sei ──
        { id: "d26.5", ex: "26.5", t: "transform", title: "It happened: habe or sei", how: "Report what the witness said: «Der Zeuge sagte, dass …». Präteritum, Perfekt or Plusquamperfekt — all become habe or sei + the Partizip II. ich → er.", items: [
          { q: "«Ein Velofahrer fuhr bei Rot über die Kreuzung.»", a: cxKjBoth("Der Zeuge sagte,", "ein Velofahrer sei bei Rot über die Kreuzung gefahren", "ein Velofahrer bei Rot über die Kreuzung gefahren sei"), r: ["kj.past"] },
          { q: "«Das Auto hat nicht gebremst.»", a: cxKjBoth("Der Zeuge sagte,", "das Auto habe nicht gebremst", "das Auto nicht gebremst habe"), r: ["kj.past"] },
          { q: "«Eine Frau war sofort zum Telefon gelaufen.»", a: cxKjBoth("Der Zeuge sagte,", "eine Frau sei sofort zum Telefon gelaufen", "eine Frau sofort zum Telefon gelaufen sei"), r: ["kj.past"] },
          { q: "«Ich stand an der Haltestelle.»", a: [...cxKjBoth("Der Zeuge sagte,", "er habe an der Haltestelle gestanden", "er an der Haltestelle gestanden habe"), ...cxKjBoth("Der Zeuge sagte,", "er sei an der Haltestelle gestanden", "er an der Haltestelle gestanden sei")], r: ["kj.past"] },
          { q: "«Der Bus kam zwei Minuten später.»", a: cxKjBoth("Der Zeuge sagte,", "der Bus sei zwei Minuten später gekommen", "der Bus zwei Minuten später gekommen sei"), r: ["kj.past"] },
          { q: "«Niemand wurde verletzt.»", a: cxKjBoth("Der Zeuge sagte,", "niemand sei verletzt worden", "niemand verletzt worden sei"), r: ["kj.past"] },
          { q: "«Ein Mann hat ein Foto gemacht.»", a: cxKjBoth("Der Zeuge sagte,", "ein Mann habe ein Foto gemacht", "ein Mann ein Foto gemacht habe"), r: ["kj.past"] },
          { q: "«Die Polizei war nach fünf Minuten da.»", a: cxKjBoth("Der Zeuge sagte,", "die Polizei sei nach fünf Minuten da gewesen", "die Polizei nach fünf Minuten da gewesen sei"), r: ["kj.past"] },
          { q: "«Ich habe alles genau gesehen.»", a: cxKjBoth("Der Zeuge sagte,", "er habe alles genau gesehen", "er alles genau gesehen habe"), r: ["kj.past"] },
          { q: "«Die Ampel war kaputt.»", a: cxKjBoth("Der Zeuge sagte,", "die Ampel sei kaputt gewesen", "die Ampel kaputt gewesen sei"), r: ["kj.past"] },
        ] },
        // ── Übung 27•2: what the neighbour told us ──
        { id: "d27.2", ex: "27.2", t: "transform", title: "What the neighbour told us", how: "Report it: «Die Nachbarin erzählte, …» — habe or sei + the Partizip II. Where haben looks like the present (sie haben), use hätten.", items: [
          { q: "«Mein Sohn lebte zwei Jahre in Kanada.»", a: cxKjBoth("Die Nachbarin erzählte,", "ihr Sohn habe zwei Jahre in Kanada gelebt", "ihr Sohn zwei Jahre in Kanada gelebt habe"), r: ["kj.past"] },
          { q: "«Die Familie Rossi zog letztes Jahr nach Lugano.»", a: cxKjBoth("Die Nachbarin erzählte,", "die Familie Rossi sei letztes Jahr nach Lugano gezogen", "die Familie Rossi letztes Jahr nach Lugano gezogen sei"), r: ["kj.past"] },
          { q: "«Der Hund hatte die ganze Nacht gebellt.»", a: cxKjBoth("Die Nachbarin erzählte,", "der Hund habe die ganze Nacht gebellt", "der Hund die ganze Nacht gebellt habe"), r: ["kj.past"] },
          { q: "«Ich war noch nie im Ausland.»", a: cxKjBoth("Die Nachbarin erzählte,", "sie sei noch nie im Ausland gewesen", "sie noch nie im Ausland gewesen sei"), r: ["kj.past"] },
          { q: "«Wir bekamen einen Brief von der Gemeinde.»", a: cxKjBoth("Die Nachbarin erzählte,", "sie hätten einen Brief von der Gemeinde bekommen", "sie einen Brief von der Gemeinde bekommen hätten"), r: ["kj.swap"] },
          { q: "«Der alte Bäcker schloss seinen Laden.»", a: cxKjBoth("Die Nachbarin erzählte,", "der alte Bäcker habe seinen Laden geschlossen", "der alte Bäcker seinen Laden geschlossen habe"), r: ["kj.past"] },
          { q: "«Früher gab es hier einen Bahnhof.»", a: [...cxKjBoth("Die Nachbarin erzählte,", "früher habe es hier einen Bahnhof gegeben", "es früher hier einen Bahnhof gegeben habe"), "Die Nachbarin erzählte, es habe früher hier einen Bahnhof gegeben."], r: ["kj.past"] },
          { q: "«Mein Mann vergaß den Schlüssel.»", a: cxKjBoth("Die Nachbarin erzählte,", "ihr Mann habe den Schlüssel vergessen", "ihr Mann den Schlüssel vergessen habe"), r: ["kj.past"] },
          { q: "«Die Kinder spielten den ganzen Tag draußen.»", a: cxKjBoth("Die Nachbarin erzählte,", "die Kinder hätten den ganzen Tag draußen gespielt", "die Kinder den ganzen Tag draußen gespielt hätten"), r: ["kj.swap"] },
          { q: "«Ich hatte das Paket schon abgeholt.»", a: cxKjBoth("Die Nachbarin erzählte,", "sie habe das Paket schon abgeholt", "sie das Paket schon abgeholt habe"), r: ["kj.past"] },
        ] },
        // ── Übung 26•10: she said she had … ──
        { id: "d26.10", ex: "26.10", t: "transform", title: "She said she had …", how: "At the Apéro, the new neighbour likes to talk about herself. Report it: «Sie sagte, …» — now: habe, sei … · before: habe / sei + the Partizip II.", items: [
          { q: "«Ich habe drei Jahre in New York gewohnt.»", a: cxKjBoth("Sie sagte,", "sie habe drei Jahre in New York gewohnt", "sie drei Jahre in New York gewohnt habe"), r: ["kj.past"] },
          { q: "«Ich bin schon zweimal Marathon gelaufen.»", a: cxKjBoth("Sie sagte,", "sie sei schon zweimal Marathon gelaufen", "sie schon zweimal Marathon gelaufen sei"), r: ["kj.past"] },
          { q: "«Mein Mann kocht jeden Abend.»", a: cxKjBoth("Sie sagte,", "ihr Mann koche jeden Abend", "ihr Mann jeden Abend koche"), r: ["kj.form"] },
          { q: "«Ich habe die Wohnung selbst renoviert.»", a: cxKjBoth("Sie sagte,", "sie habe die Wohnung selbst renoviert", "sie die Wohnung selbst renoviert habe"), r: ["kj.past"] },
          { q: "«Unsere Tochter spricht vier Sprachen.»", a: cxKjBoth("Sie sagte,", "ihre Tochter spreche vier Sprachen", "ihre Tochter vier Sprachen spreche"), r: ["kj.form"] },
          { q: "«Ich war früher Pilotin.»", a: cxKjBoth("Sie sagte,", "sie sei früher Pilotin gewesen", "sie früher Pilotin gewesen sei"), r: ["kj.past"] },
          { q: "«Wir haben ein Ferienhaus im Tessin.»", a: cxKjBoth("Sie sagte,", "sie hätten ein Ferienhaus im Tessin", "sie ein Ferienhaus im Tessin hätten"), r: ["kj.swap"] },
          { q: "«Ich habe letztes Jahr im Lotto gewonnen.»", a: cxKjBoth("Sie sagte,", "sie habe letztes Jahr im Lotto gewonnen", "sie letztes Jahr im Lotto gewonnen habe"), r: ["kj.past"] },
          { q: "«Mein Sohn ist der beste Schüler der Klasse.»", a: cxKjBoth("Sie sagte,", "ihr Sohn sei der beste Schüler der Klasse", "ihr Sohn der beste Schüler der Klasse sei"), r: ["kj.sein"] },
          { q: "«Ich backe jeden Sonntag einen Zopf.»", a: cxKjBoth("Sie sagte,", "sie backe jeden Sonntag einen Zopf", "sie jeden Sonntag einen Zopf backe"), r: ["kj.form"] },
        ] },
        // ── Übung 26•14: a letter from Berlin — now or before? ──
        { id: "d26.14", ex: "26.14", t: "transform", title: "A letter from Berlin", how: "Mia writes from her exchange year in Berlin. Report it: «Sie schreibt, …» — now: sei, habe, komme … · before: sei / habe + the Partizip II.", items: [
          { q: "«Ich bin gut in Berlin angekommen.»", a: cxKjBoth("Sie schreibt,", "sie sei gut in Berlin angekommen", "sie gut in Berlin angekommen sei"), r: ["kj.past"] },
          { q: "«Die Stadt ist riesig.»", a: cxKjBoth("Sie schreibt,", "die Stadt sei riesig", "die Stadt riesig sei"), r: ["kj.sein"] },
          { q: "«Ich habe ein Zimmer in Kreuzberg gefunden.»", a: cxKjBoth("Sie schreibt,", "sie habe ein Zimmer in Kreuzberg gefunden", "sie ein Zimmer in Kreuzberg gefunden habe"), r: ["kj.past"] },
          { q: "«Meine Mitbewohnerin kommt aus Polen.»", a: cxKjBoth("Sie schreibt,", "ihre Mitbewohnerin komme aus Polen", "ihre Mitbewohnerin aus Polen komme"), r: ["kj.form"] },
          { q: "«Ich fahre überall mit der U-Bahn.»", a: cxKjBoth("Sie schreibt,", "sie fahre überall mit der U-Bahn", "sie überall mit der U-Bahn fahre"), r: ["kj.form"] },
          { q: "«Am Wochenende war ich im Museum.»", a: [...cxKjBoth("Sie schreibt,", "sie sei am Wochenende im Museum gewesen", "sie am Wochenende im Museum gewesen sei"), "Sie schreibt, am Wochenende sei sie im Museum gewesen."], r: ["kj.past"] },
          { q: "«Das Essen ist hier billiger als in Zürich.»", a: [...cxKjBoth("Sie schreibt,", "das Essen sei dort billiger als in Zürich", "das Essen dort billiger als in Zürich sei"), ...cxKjBoth("Sie schreibt,", "das Essen sei hier billiger als in Zürich", "das Essen hier billiger als in Zürich sei")], r: ["kj.sein"] },
          { q: "«Ich habe schon viele Leute kennengelernt.»", a: cxKjBoth("Sie schreibt,", "sie habe schon viele Leute kennengelernt", "sie schon viele Leute kennengelernt habe"), r: ["kj.past"] },
          { q: "«Ich vermisse euch sehr.»", a: cxKjBoth("Sie schreibt,", "sie vermisse uns sehr", "sie uns sehr vermisse"), r: ["kj.form"] },
          { q: "«Ich komme an Weihnachten nach Hause.»", a: cxKjBoth("Sie schreibt,", "sie komme an Weihnachten nach Hause", "sie an Weihnachten nach Hause komme"), r: ["kj.form"] },
        ] },
        // ── ours: later — werde + infinitive ──
        { id: "dkj.fut", t: "transform", title: "Later: werde + infinitive", how: "Report it: the future becomes werde + the infinitive. With wir and sie (they), werden looks like the present: würden.", items: [
          { q: "Der Wetterdienst meldet: «Morgen wird es schneien.»", a: [...cxKjBoth("Der Wetterdienst meldet,", "morgen werde es schneien", "es morgen schneien werde"), "Der Wetterdienst meldet, es werde morgen schneien."], r: ["kj.fut"] },
          { q: "Die SBB teilt mit: «Der Zug wird später abfahren.»", a: cxKjBoth("Die SBB teilt mit,", "der Zug werde später abfahren", "der Zug später abfahren werde"), r: ["kj.fut"] },
          { q: "Mein Bruder schreibt: «Ich werde im Juli heiraten.»", a: cxKjBoth("Mein Bruder schreibt,", "er werde im Juli heiraten", "er im Juli heiraten werde"), r: ["kj.fut"] },
          { q: "Die Firma erklärt: «Wir werden fünfzig neue Stellen schaffen.»", a: cxKjBoth("Die Firma erklärt,", "sie werde fünfzig neue Stellen schaffen", "sie fünfzig neue Stellen schaffen werde"), r: ["kj.fut"], note: "die Firma is **sie** (singular): sie **werde** …" },
          { q: "Die Kinder versprechen: «Wir werden pünktlich sein.»", a: cxKjBoth("Die Kinder versprechen,", "sie würden pünktlich sein", "sie pünktlich sein würden"), r: ["kj.fut"] },
          { q: "Die Chefin sagt: «Die Sitzung wird nicht lange dauern.»", a: cxKjBoth("Die Chefin sagt,", "die Sitzung werde nicht lange dauern", "die Sitzung nicht lange dauern werde"), r: ["kj.fut"] },
          { q: "Lea schreibt: «Ich werde dich am Bahnhof abholen.»", a: cxKjBoth("Lea schreibt,", "sie werde mich am Bahnhof abholen", "sie mich am Bahnhof abholen werde"), r: ["kj.fut"] },
          { q: "Der Minister verspricht: «Die Steuern werden nicht steigen.»", a: cxKjBoth("Der Minister verspricht,", "die Steuern würden nicht steigen", "die Steuern nicht steigen würden"), r: ["kj.fut"] },
          { q: "Meine Eltern sagen: «Wir werden euch im Mai besuchen.»", a: cxKjBoth("Meine Eltern sagen,", "sie würden uns im Mai besuchen", "sie uns im Mai besuchen würden"), r: ["kj.fut"] },
        ] },
        // ── ours: questions and commands, reported ──
        { id: "dkj.ask", t: "transform", title: "Questions and commands", how: "Report it: a yes/no question with ob, a W-question with its W-word, a command with solle — the verb at the end. Sie → ich.", items: [
          { q: "Die Vermieterin fragte: «Haben Sie ein Haustier?»", a: ["Die Vermieterin fragte, ob ich ein Haustier hätte.", "Die Vermieterin fragte, ob ich ein Haustier habe."], r: ["kj.ask"] },
          { q: "Der Kontrolleur fragte: «Wo sind Sie eingestiegen?»", a: ["Der Kontrolleur fragte, wo ich eingestiegen sei."], r: ["kj.ask"] },
          { q: "Die Lehrerin fragte: «Hat Tim seine Hausaufgaben gemacht?»", a: ["Die Lehrerin fragte, ob Tim seine Hausaufgaben gemacht habe."], r: ["kj.ask"] },
          { q: "Mein Chef fragte: «Wann kommt der Techniker?»", a: ["Mein Chef fragte, wann der Techniker komme."], r: ["kj.ask"] },
          { q: "Ein Tourist fragte: «Warum ist der Zug so voll?»", a: ["Ein Tourist fragte, warum der Zug so voll sei."], r: ["kj.ask"] },
          { q: "Der Nachbar fragte: «Können Sie meine Katze füttern?»", a: ["Der Nachbar fragte, ob ich seine Katze füttern könne.", "Der Nachbar fragte, ob ich seine Katze füttern könnte."], r: ["kj.ask"] },
          { q: "Die Ärztin sagte: «Bleiben Sie zwei Tage im Bett!»", a: cxKjBoth("Die Ärztin sagte,", "ich solle zwei Tage im Bett bleiben", "ich zwei Tage im Bett bleiben solle"), r: ["kj.ask"] },
          { q: "Der Polizist sagte: «Zeigen Sie mir Ihren Ausweis!»", a: cxKjBoth("Der Polizist sagte,", "ich solle ihm meinen Ausweis zeigen", "ich ihm meinen Ausweis zeigen solle"), r: ["kj.ask"] },
          { q: "Meine Mutter schrieb: «Ruf mich am Sonntag an!»", a: cxKjBoth("Meine Mutter schrieb,", "ich solle sie am Sonntag anrufen", "ich sie am Sonntag anrufen solle"), r: ["kj.ask"] },
          { q: "Der Trainer sagte: «Trinkt genug Wasser!»", a: [...cxKjBoth("Der Trainer sagte,", "wir sollten genug Wasser trinken", "wir genug Wasser trinken sollten"), ...cxKjBoth("Der Trainer sagte,", "wir sollen genug Wasser trinken", "wir genug Wasser trinken sollen")], r: ["kj.ask"] },
        ] },
        // ── Übung 26•13: the set phrases ──
        { id: "d26.13", ex: "26.13", t: "type", title: "Set phrases", how: "These old wishes are still everyday German. Write the missing word — the Konjunktiv I.", items: [
          { q: "Gott ___ Dank, der Zug fährt wieder! (sein)", a: ["sei"], r: ["kj.fixed"] },
          { q: "Es ___ die Freiheit! (leben)", a: ["lebe"], r: ["kj.fixed"] },
          { q: "Hoch ___ das Brautpaar! (leben)", a: ["lebe"], r: ["kj.fixed"] },
          { q: "Man ___ 500 Gramm Mehl und zwei Eier. (nehmen)", a: ["nehme"], r: ["kj.fixed"] },
          { q: "Gott ___ euch! (segnen)", a: ["segne"], r: ["kj.fixed"] },
          { q: "___ das neue Jahr dir viel Glück bringen! (mögen)", a: ["Möge"], r: ["kj.fixed"] },
          { q: "Wie dem auch ___, wir fahren morgen. (sein)", a: ["sei"], r: ["kj.fixed"] },
          { q: "Koste es, was es ___: ich will diese Wohnung! (wollen)", a: ["wolle"], r: ["kj.fixed"] },
          { q: "Wir gehen wandern, es ___ denn, es regnet. (sein)", a: ["sei"], r: ["kj.fixed"] },
          { q: "Ich helfe dir gern, es ___ denn, ich muss arbeiten. (sein)", a: ["sei"], r: ["kj.fixed"] },
        ] },
        // ── Production: Übung 27•10 — your own reports ──
        { id: "d27.10", ex: "27.10", t: "compose", end: true, title: "Build the report", how: "Build the reported sentence: the opening, then the Konjunktiv I. (before) — it happened · (later) — it will happen.", items: [
          { w: ["die Zeitung schrieb", "der Präsident", "zurücktreten", "(later)"], a: cxKjBoth("Die Zeitung schrieb,", "der Präsident werde zurücktreten", "der Präsident zurücktreten werde"), r: ["kj.fut"] },
          { w: ["Professor Weber fragte", "ob", "jemand", "die Aufgabe", "lösen können"], a: ["Professor Weber fragte, ob jemand die Aufgabe lösen könne."], r: ["kj.ask"] },
          { w: ["sie teilte mit", "das Museum", "zerstört werden", "(before)"], a: cxKjBoth("Sie teilte mit,", "das Museum sei zerstört worden", "das Museum zerstört worden sei"), r: ["kj.past"] },
          { w: ["Frau Huber erzählte", "ihr Sohn", "zu viel Geld", "ausgeben"], a: cxKjBoth("Frau Huber erzählte,", "ihr Sohn gebe zu viel Geld aus", "ihr Sohn zu viel Geld ausgebe"), r: ["kj.form"] },
          { w: ["der Sprecher sagte", "der Zug", "Verspätung", "haben"], a: cxKjBoth("Der Sprecher sagte,", "der Zug habe Verspätung", "der Zug Verspätung habe"), r: ["kj.form"] },
          { w: ["die Polizei meldete", "der Fahrer", "zu schnell", "fahren", "(before)"], a: cxKjBoth("Die Polizei meldete,", "der Fahrer sei zu schnell gefahren", "der Fahrer zu schnell gefahren sei"), r: ["kj.past"] },
          { w: ["meine Chefin sagte", "ich", "den Bericht", "bis Freitag schicken", "sollen"], a: cxKjBoth("Meine Chefin sagte,", "ich solle den Bericht bis Freitag schicken", "ich den Bericht bis Freitag schicken solle"), r: ["kj.ask"] },
          { w: ["der Arzt meinte", "das Bein", "nicht gebrochen", "sein"], a: cxKjBoth("Der Arzt meinte,", "das Bein sei nicht gebrochen", "das Bein nicht gebrochen sei"), r: ["kj.sein"] },
          { w: ["die Gäste sagten", "sie", "keinen Hunger", "haben"], a: cxKjBoth("Die Gäste sagten,", "sie hätten keinen Hunger", "sie keinen Hunger hätten"), r: ["kj.swap"] },
        ] },
        { id: "dp.kj", t: "translate", end: true, title: "Write it like the news", how: "Translate into written German — reported speech in the Konjunktiv I.", items: [
          { q: "The minister said he was satisfied.", a: cxKjBoth("Der Minister sagte,", "er sei zufrieden", "er zufrieden sei"), r: ["kj.sein"] },
          { q: "The police report that nobody was injured.", a: [...cxKjBoth("Die Polizei meldet,", "niemand sei verletzt worden", "niemand verletzt worden sei"), ...cxKjBoth("Die Polizei berichtet,", "niemand sei verletzt worden", "niemand verletzt worden sei")], r: ["kj.past"] },
          { q: "She asked whether the shop was open on Sunday.", a: ["Sie fragte, ob der Laden am Sonntag offen sei.", "Sie fragte, ob das Geschäft am Sonntag offen sei.", "Sie fragte, ob der Laden am Sonntag geöffnet sei.", "Sie fragte, ob das Geschäft am Sonntag geöffnet sei."], r: ["kj.ask"] },
          { q: "He wrote that he would come in June.", a: [...cxKjBoth("Er schrieb,", "er werde im Juni kommen", "er im Juni kommen werde"), ...cxKjBoth("Er schrieb,", "er komme im Juni", "er im Juni komme")], r: ["kj.fut"] },
          { q: "The doctor said I should rest.", a: [...cxKjBoth("Der Arzt sagte,", "ich solle mich ausruhen", "ich mich ausruhen solle"), ...cxKjBoth("Die Ärztin sagte,", "ich solle mich ausruhen", "ich mich ausruhen solle"), ...cxKjBoth("Der Arzt sagte,", "ich solle mich erholen", "ich mich erholen solle")], r: ["kj.ask"] },
          { q: "My neighbours say they have no time.", a: cxKjBoth("Meine Nachbarn sagen,", "sie hätten keine Zeit", "sie keine Zeit hätten"), r: ["kj.swap"] },
          { q: "The newspaper writes that the bridge was built in 1890.", a: [...cxKjBoth("Die Zeitung schreibt,", "die Brücke sei 1890 gebaut worden", "die Brücke 1890 gebaut worden sei"), ...cxKjBoth("Die Zeitung schreibt,", "die Brücke sei im Jahr 1890 gebaut worden", "die Brücke im Jahr 1890 gebaut worden sei")], r: ["kj.past"] },
          { q: "Thank God it's Friday!", a: ["Gott sei Dank ist Freitag!", "Gott sei Dank ist es Freitag!", "Gott sei Dank, es ist Freitag!"], r: ["kj.fixed"] },
          { q: "We'll go hiking, unless it rains.", a: ["Wir gehen wandern, es sei denn, es regnet.", "Wir gehen wandern, es sei denn es regnet.", "Wir werden wandern gehen, es sei denn, es regnet."], r: ["kj.fixed"] },
        ] },
        { id: "dw.kj", t: "write", end: true, title: "Write your own", how: "Write in your own words — in writing, reported speech takes the Konjunktiv I. Saved for Claude to correct.", items: [
          { q: "Report a piece of news you read this week, as a newspaper would. (Die Zeitung schreibt, …)", model: ["Die Zeitung schreibt, die Gemeinde baue ein neues Schulhaus. Es werde im Herbst eröffnet. Der Gemeindepräsident sagte, das Projekt sei teuer, aber wichtig."], r: ["kj.use"] },
          { q: "Your doctor gave you three pieces of advice. Report them. (Sie sagte, ich solle …)", model: ["Die Ärztin sagte, ich solle mehr Wasser trinken. Ich solle auch jeden Tag spazieren gehen. Und sie meinte, ich würde zu viel arbeiten."], r: ["kj.ask"] },
          { q: "A friend told you about a holiday. Write what they said. (Er erzählte, er sei … / habe …)", model: ["Marco erzählte, er sei zwei Wochen in Portugal gewesen. Das Wetter sei fantastisch gewesen, und er habe jeden Tag frischen Fisch gegessen."], r: ["kj.past"] },
          { q: "Your landlord sent a letter about repairs. Report what it says.", model: ["Der Vermieter schreibt, die Fenster würden im Mai ersetzt. Die Arbeiten dauerten etwa zwei Tage. Wir sollten an diesen Tagen zu Hause sein."], r: ["kj.swap"] },
          { q: "Write the minutes of a short meeting: who said what.", model: ["Frau Huber sagte, das Budget sei zu klein. Herr Kunz meinte, man könne im nächsten Jahr mehr investieren. Alle waren einverstanden, dass man im März wieder darüber spreche."], r: ["kj.use"] },
          { q: "On your first day, a colleague asked you three questions. Report them. (Sie fragte, ob … / wo …)", model: ["Meine neue Kollegin wollte wissen, ob ich schon lange in der Schweiz sei und wo meine Familie wohne. Dann fragte sie, ob ich am Freitag Zeit für einen Apéro hätte."], r: ["kj.ask"] },
          { q: "Use the set phrases: Gott sei Dank, es sei denn, wie dem auch sei — one sentence each.", model: ["Gott sei Dank ist der Winter bald vorbei. Am Sonntag gehen wir an den See, es sei denn, es regnet. Wie dem auch sei, ich freue mich auf den Frühling."], r: ["kj.fixed"] },
          { q: "Sum up what a politician promised. (Er versprach, er werde …)", model: ["Die Politikerin versprach, sie werde die Steuern senken. Außerdem werde sie mehr Geld für die Schulen ausgeben. Ob das stimmt, werden wir sehen."], r: ["kj.fut"] },
        ] },
      ],
    },
  },
});

// What chapters 26 and 27 became for this lesson.
cxCover({
  "26.1": "d26.1", "26.4": "d26.4", "26.5": "d26.5", "26.9": "d26.9", "26.10": "d26.10", "26.13": "d26.13", "26.14": "d26.14",
  "27.1": "d27.1", "27.2": "d27.2", "27.10": "d27.10",
});

// The writing prompt that opens with the lesson.
cxJournal([
  { id: "w.news", th: "opinion", lv: "B1", de: "Die Nachricht der Woche", t: "Retell a piece of news from this week as a newspaper would: what happened, who said what about it, and what will happen next — reported speech in the Konjunktiv I.", help: ["Die Zeitung schreibt, …", "Laut … sei …", "Der Sprecher sagte, man werde …", "Es heißt, …"], sec: "s4.k1" },
]);
