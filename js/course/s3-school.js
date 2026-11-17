// ── COURSE PACK · Stage 3 · 💬 School and study (studieren vs lernen) ──
// Book: chapter 31 "Schulen", "Im Klassenzimmer", "Studieren and lernen"
// (Übung 31•2 the missing line · 31•3 into the Perfekt · 31•4 a short
// conversation in order · 31•5 the words of a line in their right form).
// Our own dialogues, the Swiss way: Primarschule, Lehre, Gymnasium, Matura,
// grades where 6 is best; a German course for the classroom lines. It
// comes once Stage 1 is done (its checkpoint), so everything A2 is taught.
// 31•3 asks for the Perfekt; where its sentence has a modal, the mirror
// takes the Präteritum people say (musste, konnte) — the modal's Perfekt
// with two infinitives is a later lesson's (s2.modpf), and accepted too.
cxPack({
  id: "s3-school",
  sections: {
    "s3.school": {
      testout: { n: 7, miss: 1 },
      rules: {
        "school.types": "The schools: Primarschule, Lehre, Gymnasium, Matura, Uni",
        "school.who": "Schüler, Lehrling or Student; in die Schule gehen",
        "school.past": "School in the past: habe … gemacht, bin durchgefallen",
        "school.grade": "Grades: eine gute Note, in Switzerland 6 is best",
        "school.stud": "studieren (at university) or lernen (learn, revise)",
        "school.class": "In class: Können Sie das wiederholen? Was bedeutet …?",
        "school.subj": "Subjects and tests: Lieblingsfach, einen Test schreiben",
      },
      sheets: [
        { id: "cx.school1", title: "School, apprenticeship, university", qn: 3,
          struct: [["Ich habe", "aux"], ["eine Lehre", "who"], ["gemacht", "verb"]],
          why: "In Switzerland people often ask what you trained as and where. You need the names of the schools, the words for pupil, apprentice and student, and the Perfekt, because school is something you talk about in the past.",
          rid: ["school.types", "school.who", "school.past", "school.grade"],
          rules: [
            "The Swiss path: **der Kindergarten**, **die Primarschule**, **die Sekundarschule**, then **eine Lehre** (an apprenticeship, with **die Berufsschule**) or **das Gymnasium** and **die Matura**, then **die Uni** or **die ETH**. In Germany the Matura is **das Abitur**.",
            "A child at school is **ein Schüler** or **eine Schülerin**, someone in an apprenticeship **ein Lehrling**, someone at university **ein Student** or **eine Studentin**. You **gehen in die Schule**, **machen eine Lehre** and **studieren an der Uni**.",
            "Talk about school in the Perfekt: Ich **habe** die Matura **gemacht** · eine Prüfung **bestanden** (passed) · Ich **bin** **durchgefallen** (failed). With a modal, use the Präteritum: Ich **musste** viel lernen · Ich **konnte** kein Englisch.",
            "Grades are **Noten**: eine gute / schlechte Note **bekommen**, and **das Zeugnis** is the school report. In Switzerland **6 is the best** and 4 is a pass; in Germany **1** is the best. Ich hatte in Mathe **eine Fünf**.",
          ],
          lines: [
            ["Sara", "Was hast du eigentlich gelernt, Kemal?", "What did you actually train as, Kemal?"],
            ["Kemal", "Ich habe eine Lehre als Elektriker gemacht. Und du?", "I did an apprenticeship as an electrician. And you?"],
            ["Sara", "Ich war im Gymnasium und habe dann Biologie studiert.", "I went to the Gymnasium and then studied biology."],
            ["Kemal", "An der Uni Bern?", "At the University of Bern?"],
            ["Sara", "Nein, in Basel. Aber in Chemie bin ich einmal durchgefallen!", "No, in Basel. But I failed chemistry once!"],
            ["Kemal", "Ich auch, in der Berufsschule. In Mathe hatte ich oft eine Drei.", "Me too, at vocational school. In maths I often had a three."],
            ["Sara", "Eine Drei? Das ist ja ungenügend!", "A three? That's a fail!"],
            ["Kemal", "Genau. Aber am Ende habe ich die Abschlussprüfung bestanden.", "Exactly. But in the end I passed the final exam."],
            ["Sara", "Und heute? Machst du noch Weiterbildungen?", "And today? Do you still do further training?"],
            ["Kemal", "Ja, ich besuche jeden Montag einen Kurs. Ich muss viel lernen.", "Yes, I take a course every Monday. I have to study a lot."],
          ],
          ex: [
            ["Meine Tochter geht **in die** Primarschule, mein Sohn **ins** Gymnasium.", "My daughter goes to primary school, my son to the Gymnasium."],
            ["Ich **habe** eine Lehre als Köchin **gemacht**.", "I did an apprenticeship as a cook."],
            ["Er ist **Student** und **studiert** Informatik an der ETH.", "He's a student and studies computer science at the ETH."],
            ["In Französisch hatte ich immer **eine Sechs**!", "In French I always had a six — the top mark!"],
          ],
          trap: "A **Student** studies at a university; a child at school is a **Schüler**. And in Switzerland *Was hast du gelernt?* usually means *What did you train as?*: answer with your trade, Ich habe **Schreiner** gelernt.",
          quiz: [
            { at: "r1", k: "pick", q: "In Switzerland, the exam at the end of the Gymnasium is…", o: ["die Matura", "das Zeugnis", "die Lehre"], a: 0, why: "The school-leaving exam is **die Matura** (in Germany das Abitur)." },
            { at: "r1", k: "pick", q: "An apprenticeship is…", o: ["eine Lehre", "ein Studium", "eine Note"], a: 0, why: "An apprenticeship is **eine Lehre**." },
            { at: "r2", k: "pick", q: "A ten-year-old at school is ___.", o: ["ein Schüler", "ein Student", "ein Lehrling"], a: 0, why: "A child at school is **ein Schüler**." },
            { at: "r2", k: "pick", q: "Sie ___ Medizin an der Uni Zürich.", o: ["studiert", "lernt", "geht"], a: 0, why: "At a university you **studieren** a subject." },
            { at: "r3", k: "pick", q: "Ich ___ die Prüfung bestanden.", o: ["habe", "bin", "werde"], a: 0, why: "bestehen takes **haben**: Ich **habe** … bestanden." },
            { at: "r3", k: "pick", q: "Er ist in Mathe ___.", o: ["durchgefallen", "durchgefällt", "gefallen durch"], a: 0, why: "durchfallen → ist **durchgefallen**." },
            { at: "r4", k: "pick", q: "In a Swiss school, the best mark is…", o: ["eine Sechs", "eine Eins", "eine Vier"], a: 0, why: "In Switzerland **6** is the best mark, 4 a pass." },
            { at: "r4", k: "pick", q: "Ich habe eine gute Note ___.", o: ["bekommen", "genommen", "gelernt"], a: 0, why: "You **bekommen** a mark." },
            { at: "lines", k: "pick", q: "In the dialogue, what did Kemal train as?", o: ["Elektriker.", "Biologe.", "Lehrer."], a: 0, why: "He says: Ich habe eine Lehre als **Elektriker** gemacht." },
            { at: "trap", k: "pick", q: "Someone at the university is ___.", o: ["ein Student", "ein Schüler", "ein Lehrling"], a: 0, why: "At a university: **ein Student**." },
          ] },
        { id: "cx.school2", title: "studieren or lernen? In the classroom", qn: 3,
          struct: [["Ich lerne", "verb"], ["für die Prüfung", "mid"], ["— sie studiert Jura", "end"]],
          why: "English *study* is two German verbs: **studieren** is going to university, **lernen** is learning or revising. And in your German course a few lines get you through: asking someone to repeat, asking what a word means, asking which page you're on.",
          rid: ["school.stud", "school.class", "school.subj"],
          rules: [
            "**studieren** is studying a subject at a university: Sie **studiert** Jura. **lernen** is learning something, or revising: Ich **lerne** Deutsch · Ich **lerne** für den Test. A child at school **lernt**, never *studiert*.",
            "In class: **Wie bitte?** · **Können Sie das bitte wiederholen?** · **Was bedeutet** «Feierabend»? · **Wie schreibt man** das? · **Auf welcher Seite** sind wir? · **Ich habe das nicht verstanden.**",
            "School subjects are **Fächer**: Mathe, Deutsch, Geschichte, Biologie, Sport. **Mein Lieblingsfach ist …** · Am Montag **schreiben** wir **einen Test** (we have a test) · Die **Hausaufgaben** sind auf Seite 12.",
          ],
          lines: [
            ["Frau Weber", "Guten Morgen zusammen! Habt ihr die Hausaufgaben gemacht?", "Good morning, everyone! Did you do the homework?"],
            ["Diego", "Ja, aber eine Übung habe ich nicht verstanden.", "Yes, but I didn't understand one exercise."],
            ["Frau Weber", "Welche denn?", "Which one?"],
            ["Diego", "Auf Seite 24, die Nummer 3. Was bedeutet «Feierabend»?", "On page 24, number 3. What does «Feierabend» mean?"],
            ["Frau Weber", "Das ist die Zeit nach der Arbeit. Ihr habt Feierabend, wenn ihr nach Hause geht.", "It's the time after work. You have Feierabend when you go home."],
            ["Amina", "Können Sie das bitte langsamer sagen?", "Could you say that more slowly, please?"],
            ["Frau Weber", "Natürlich. Und nicht vergessen: Am Freitag schreiben wir einen Test.", "Of course. And don't forget: we have a test on Friday."],
            ["Amina", "Oh nein! Dann muss ich am Wochenende viel lernen.", "Oh no! Then I'll have to study a lot at the weekend."],
            ["Diego", "Ich auch. Mein Bruder studiert Germanistik, vielleicht hilft er uns.", "Me too. My brother studies German, maybe he'll help us."],
            ["Frau Weber", "Gute Idee! Lernt zusammen, das hilft immer.", "Good idea! Study together, it always helps."],
          ],
          ex: [
            ["Mein Bruder **studiert** Wirtschaft an der Uni St. Gallen.", "My brother studies economics at the University of St. Gallen."],
            ["Heute Abend **lerne** ich für die Prüfung.", "Tonight I'm revising for the exam."],
            ["Entschuldigung, **was bedeutet** «Znüni»?", "Excuse me, what does «Znüni» mean?"],
            ["Am Donnerstag **schreiben** wir **einen Test** in Deutsch.", "On Thursday we have a German test."],
          ],
          trap: "*I'm studying for the exam* is **Ich lerne für die Prüfung**, not ~~Ich studiere für die Prüfung~~. Use **studieren** only for a subject at university: Sie **studiert** Medizin.",
          quiz: [
            { at: "r1", k: "pick", q: "I'm revising for the test tonight: Ich ___ heute Abend für den Test.", o: ["lerne", "studiere", "mache"], a: 0, why: "Revising is **lernen**." },
            { at: "r1", k: "pick", q: "She's at university, doing law: Sie ___ Jura.", o: ["studiert", "lernt", "geht"], a: 0, why: "A subject at university: **studieren**." },
            { at: "r1", k: "pick", q: "Die Kinder ___ in der Schule lesen.", o: ["lernen", "studieren", "machen"], a: 0, why: "Children at school **lernen**." },
            { at: "r2", k: "pick", q: "You didn't catch what the teacher said:", o: ["Können Sie das bitte wiederholen?", "Können Sie das bitte verstehen?", "Ich habe das wiederholt."], a: 0, why: "*Could you repeat that?* is **Können Sie das bitte wiederholen?**" },
            { at: "r2", k: "pick", q: "___ «Feierabend»?", o: ["Was bedeutet", "Wie bedeutet", "Wer bedeutet"], a: 0, why: "*What does … mean?* is **Was bedeutet …?**" },
            { at: "r3", k: "pick", q: "My favourite subject is history: Mein ___ ist Geschichte.", o: ["Lieblingsfach", "Lieblingszeugnis", "Lieblingsseite"], a: 0, why: "A favourite subject is **das Lieblingsfach**." },
            { at: "r3", k: "pick", q: "We have a test on Monday: Am Montag ___ wir einen Test.", o: ["schreiben", "lesen", "studieren"], a: 0, why: "You **schreiben** a test." },
            { at: "lines", k: "pick", q: "In the dialogue, when is the test?", o: ["Am Freitag.", "Am Montag.", "Am Wochenende."], a: 0, why: "Frau Weber: **Am Freitag** schreiben wir einen Test." },
            { at: "trap", k: "pick", q: "*I'm studying for the exam:*", o: ["Ich lerne für die Prüfung.", "Ich studiere für die Prüfung.", "Ich lerne die Prüfung."], a: 0, why: "Revising for an exam is **lernen**: Ich lerne für die Prüfung." },
          ] },
      ],
      diag: [
        { t: "swap", from: "^(studiere|studierst|studiert|studieren)$", to: "^(lerne|lernst|lernt|lernen)$", rule: "school.stud", hard: true, msg: "Learning or revising is **lernen**: **{right}**. studieren is only for a subject at university." },
        { t: "swap", from: "^(lerne|lernst|lernt|lernen)$", to: "^(studiere|studierst|studiert|studieren)$", rule: "school.stud", hard: true, msg: "A subject at university is **studieren**: **{right}**." },
        { t: "swap", from: "^(hat|habe|hast|haben|habt)$", to: "^(ist|bin|bist|sind|seid)$", rule: "school.past", hard: true, msg: "A verb of movement or change takes **sein** in the Perfekt: **{right}** … (durchfallen, gehen, fahren)." },
        { t: "swap", from: "^(ist|bin|bist|sind|seid)$", to: "^(hat|habe|hast|haben|habt)$", rule: "school.past", hard: true, msg: "This verb takes **haben** in the Perfekt: **{right}** …" },
        { t: "swap", from: "^(verstehen|schreiben|lesen|machen|lernen|unterrichten|fahren|dauern|ubersetzen|bestehen)$", to: "^(verstanden|geschrieben|gelesen|gemacht|gelernt|unterrichtet|gefahren|gedauert|ubersetzt|bestanden)$", rule: "school.past", hard: true, msg: "The Perfekt ends with the Partizip II: **{right}**." },
        { t: "swap", from: "^(student|studentin|studenten)$", to: "^(schuler|schulerin|lehrling)$", rule: "school.who", msg: "A Student is at university: here it's **{right}**." },
        { t: "swap", from: "^(schuler|schulerin)$", to: "^(student|studentin)$", rule: "school.who", msg: "At a university it's **{right}**; a Schüler is at school." },
        { t: "swap", from: "^(wie|wer)$", to: "^was$", rule: "school.class", msg: "*What does … mean?* is **Was** bedeutet …?" },
        { t: "swap", from: "^(machen|haben|lernen)$", to: "^schreiben$", rule: "school.subj", msg: "You **schreiben** a test: Wir schreiben einen Test." },
      ],
      drills: [
        // ── our own: which word? ──
        { id: "dschool.p", t: "pick", title: "Which word?", how: "Pick the word that fits.", items: [
          { q: "Sie ___ Architektur an der ETH.", o: ["studiert", "lernt"], a: ["studiert"], r: ["school.stud"] },
          { q: "Ich ___ jeden Tag zehn neue Wörter.", o: ["lerne", "studiere"], a: ["lerne"], r: ["school.stud"] },
          { q: "Mein Sohn ist acht. Er ist ___.", o: ["Schüler", "Student", "Lehrling"], a: ["Schüler"], r: ["school.who"] },
          { q: "Sie macht eine Lehre und geht einmal pro Woche in die ___.", o: ["Berufsschule", "Primarschule", "Uni"], a: ["Berufsschule"], r: ["school.types"] },
          { q: "Er ___ die Prüfung nicht bestanden.", o: ["hat", "ist"], a: ["hat"], r: ["school.past"] },
          { q: "Sie ___ leider durchgefallen.", o: ["ist", "hat"], a: ["ist"], r: ["school.past"] },
          { q: "In der Schweiz ist eine ___ ungenügend. (a fail)", o: ["Drei", "Sechs", "Fünf"], a: ["Drei"], r: ["school.grade"] },
          { q: "___ bedeutet «Feierabend»?", o: ["Was", "Wie", "Wer"], a: ["Was"], r: ["school.class"] },
          { q: "Mein ___ ist Biologie.", o: ["Lieblingsfach", "Lieblingszeugnis", "Lieblingsseite"], a: ["Lieblingsfach"], r: ["school.subj"] },
        ] },
        // ── Übung 31•5: the right word, in its form ──
        { id: "d31.5", ex: "31.5", t: "type", title: "In the right form", how: "Write the missing word in its right form. The brackets say which word, or what it means.", items: [
          { q: "Mein Bruder ___ Medizin in Zürich. (studieren or lernen)", a: ["studiert"], r: ["school.stud"] },
          { q: "Heute Abend ___ ich für den Test. (studieren or lernen)", a: ["lerne"], r: ["school.stud"] },
          { q: "Die Kinder ___ in der Schule schwimmen. (studieren or lernen)", a: ["lernen"], r: ["school.stud"] },
          { q: "Was ___ du an der Uni? (studieren)", a: ["studierst"], r: ["school.stud"] },
          { q: "Morgen ___ du um acht in der Schule sein. (müssen)", a: ["musst"], r: ["school.subj"] },
          { q: "Ich habe die Prüfung ___. (bestehen)", a: ["bestanden"], r: ["school.past"], vf: [["bestehen", "p2only", "ich"]] },
          { q: "Er ___ in Mathe durchgefallen. (sein or haben)", a: ["ist"], r: ["school.past"] },
          { q: "In der Schweiz ist die ___ die beste Note. (six)", a: ["Sechs", "6"], r: ["school.grade"] },
          { q: "Nach der Sekundarschule macht sie eine ___ als Köchin. (apprenticeship)", a: ["Lehre"], r: ["school.types"] },
          { q: "Mit der ___ kann man an die Uni. (the exam after the Gymnasium)", a: ["Matura"], r: ["school.types"] },
          { q: "Er ist zehn und ___ in die vierte Klasse. (gehen)", a: ["geht"], r: ["school.who"] },
          { q: "Können Sie das bitte ___? (repeat)", a: ["wiederholen"], r: ["school.class"] },
          { q: "Was ___ «Znüni»? (mean)", a: ["bedeutet", "heißt"], r: ["school.class"] },
          { q: "Am Montag ___ wir einen Test in Englisch. (schreiben)", a: ["schreiben"], r: ["school.subj"] },
        ] },
        // ── Übung 31•4: a short conversation in order ──
        { id: "d31.4", ex: "31.4", t: "order", title: "At school", how: "Put the lines in order.", items: [
          { q: "The new pupil.", a: ["Der neue Schüler aus Genf ist sehr sportlich.", "Spielt er Fußball?", "Nein, Unihockey."], r: ["school.who"] },
          { q: "The tests.", a: ["Hat Herr Graf die Tests schon zurückgegeben?", "Nein, erst am Montag.", "Ich bin so nervös!"], r: ["school.grade"] },
          { q: "So much reading.", a: ["Wir müssen bis Freitag sechzig Seiten lesen.", "Sechzig? Das schaffe ich nie!", "Doch, du schaffst das."], r: ["school.subj"] },
          { q: "The timetable.", a: ["Was haben wir morgen?", "Zuerst Mathe, dann Französisch.", "Und am Nachmittag?", "Sport."], r: ["school.subj"] },
          { q: "Which page?", a: ["Auf welcher Seite ist die Übung?", "Auf Seite 32.", "Danke. Aber ich verstehe die Aufgabe nicht.", "Ich erkläre sie dir."], r: ["school.class"] },
          { q: "On the board.", a: ["Was steht dort an der Tafel?", "Die Hausaufgaben für morgen.", "Oh, so viele!"], r: ["school.subj"] },
          { q: "Revising together.", a: ["Lernst du heute Abend mit mir?", "Für den Test?", "Ja, er ist schon morgen!", "Okay, um sieben bei mir."], r: ["school.stud"] },
          { q: "University.", a: ["Was studiert deine Schwester?", "Jura, in Freiburg.", "Gefällt es ihr?", "Ja, sehr."], r: ["school.stud"] },
          { q: "Bad marks.", a: ["Ich bekomme ein schlechtes Zeugnis.", "Ich auch. Wir müssen mehr lernen.", "Ja, ab Montag!"], r: ["school.grade"] },
          { q: "No school.", a: ["Morgen ist schulfrei!", "Warum denn?", "Es ist ein Feiertag."], r: ["school.subj"] },
          { q: "A course.", a: ["Haben Sie einen Kurs für Anfänger?", "Ja, am Dienstagabend.", "Und wie viel kostet er?", "Dreihundert Franken."], r: ["school.class"] },
          { q: "After school.", a: ["Was möchtest du nach der Schule machen?", "Eine Lehre als Schreiner.", "Toll! Wo denn?", "Bei einer Schreinerei in Thun."], r: ["school.types"] },
        ] },
        // ── Übung 31•3: into the Perfekt ──
        { id: "d31.3", ex: "31.3", t: "transform", title: "Into the past", how: "Say it in the Perfekt, as you would when talking. With a modal (muss, kann, will), use the Präteritum: musste, konnte, wollte.", items: [
          { q: "Wir schreiben einen Test.", a: ["Wir haben einen Test geschrieben."], r: ["school.past"], vf: [["schreiben", "pf", "wir"]] },
          { q: "Ich lese das Kapitel.", a: ["Ich habe das Kapitel gelesen."], r: ["school.past"], vf: [["lesen", "pf", "ich"]] },
          { q: "Wer unterrichtet bei euch Englisch?", a: ["Wer hat bei euch Englisch unterrichtet?"], r: ["school.past"], vf: [["unterrichten", "pf", "er"]] },
          { q: "Sie muss eine Berufsschule besuchen.", a: ["Sie musste eine Berufsschule besuchen.", "Sie hat eine Berufsschule besuchen müssen."], r: ["school.past"] },
          { q: "Wie lange dauert der Kurs?", a: ["Wie lange hat der Kurs gedauert?"], r: ["school.past"], vf: [["dauern", "pf", "er"]] },
          { q: "Nora bekommt in Mathe eine Sechs.", a: ["Nora hat in Mathe eine Sechs bekommen."], r: ["school.past", "school.grade"], vf: [["bekommen", "pf", "er"]] },
          { q: "Mein Sohn kann schon lesen.", a: ["Mein Sohn konnte schon lesen.", "Mein Sohn hat schon lesen können."], r: ["school.past"] },
          { q: "Ich mache einen Deutschkurs.", a: ["Ich habe einen Deutschkurs gemacht."], r: ["school.past"], vf: [["machen", "pf", "ich"]] },
          { q: "Du übersetzt den Brief.", a: ["Du hast den Brief übersetzt."], r: ["school.past"], vf: [["übersetzen", "pf", "du"]] },
          { q: "Die Kinder lernen ein Gedicht auswendig.", a: ["Die Kinder haben ein Gedicht auswendig gelernt."], r: ["school.past"], vf: [["lernen", "pf", "sie"]] },
          { q: "Er will seine Note verbessern.", a: ["Er wollte seine Note verbessern.", "Er hat seine Note verbessern wollen."], r: ["school.past"] },
          { q: "Lea fällt in der Prüfung durch.", a: ["Lea ist in der Prüfung durchgefallen."], r: ["school.past"] },
          { q: "Wir fahren mit der Klasse nach Bern.", a: ["Wir sind mit der Klasse nach Bern gefahren."], r: ["school.past"], vf: [["fahren", "pf", "wir"]] },
          { q: "Ich verstehe die Aufgabe nicht.", a: ["Ich habe die Aufgabe nicht verstanden."], r: ["school.past"], vf: [["verstehen", "pf", "ich"]] },
        ] },
        // ── Übung 31•2: the missing line ──
        { id: "d31.2", ex: "31.2", t: "answer", title: "The missing line", how: "Write the missing line of the conversation, with what the brackets say.", items: [
          { q: "«Die Professorin unterrichtet an der ETH.» — «Was unterrichtet sie?» — ___ (physics)", a: ["Physik.", "Sie unterrichtet Physik."], r: ["school.subj"] },
          { q: "«Hast du die Matura schon gemacht?» — ___ — «Und was möchtest du studieren?» (yes, last year)", a: ["Ja, letztes Jahr.", "Ja, ich habe sie letztes Jahr gemacht.", "Ja, ich habe die Matura letztes Jahr gemacht.", "Ja, die habe ich letztes Jahr gemacht.", "Ja, letztes Jahr habe ich sie gemacht.", "Ja, ich habe sie letztes Jahr bestanden."], r: ["school.past"] },
          { q: "«In Chemie bekomme ich dieses Jahr eine schlechte Note.» — ___ — «Dann lernen wir zusammen!» (you too)", a: ["Ich auch.", "Ich auch!"], r: ["school.grade"] },
          { q: "«Wer steht dort vor der Schule?» — ___ — «Ah, sie unterrichtet also Lea.» (Lea's teacher)", a: ["Die Lehrerin von Lea.", "Das ist die Lehrerin von Lea.", "Leas Lehrerin.", "Das ist Leas Lehrerin."], r: ["school.who"] },
          { q: "«Nächstes Jahr kommt Mia in die Primarschule.» — ___ — «Im Mai wird sie sechs.» (ask how old she is now)", a: ["Wie alt ist sie jetzt?", "Wie alt ist sie denn?", "Wie alt ist sie?", "Wie alt ist sie denn jetzt?"], r: ["school.types"] },
          { q: "«Jan ist ein Kollege aus dem Kurs.» — ___ — «Nein, er macht eine Lehre als Koch.» (ask if he's a student too)", a: ["Ist er auch Student?", "Studiert er auch?", "Ist er Student?", "Studiert er?", "Studiert er auch an der Uni?"], r: ["school.who"] },
          { q: "«Meine Tochter macht eine Lehre.» — «Und mein Sohn geht ins Gymnasium.» — ___ (ask when he does the Matura)", a: ["Wann macht er die Matura?", "Wann macht er Matura?", "Wann macht er denn die Matura?", "Wann hat er die Matura?"], r: ["school.types"] },
          { q: "«Er kommt aus Kanada.» — «Spricht er Deutsch?» — ___ (a little — he's doing a course)", a: ["Ein bisschen, er macht einen Kurs.", "Ein bisschen. Er macht einen Kurs.", "Ein bisschen, er besucht einen Kurs.", "Ein bisschen, er macht einen Deutschkurs.", "Ein bisschen, er besucht einen Deutschkurs.", "Ja, ein bisschen, er macht einen Kurs.", "Ein bisschen, er macht gerade einen Kurs.", "Ein wenig, er macht einen Kurs."], r: ["school.class"] },
          { q: "«Gehst du gern in die Schule, Leo?» — «Ja, aber ich habe oft schlechte Noten.» — ___ (ask in which subject)", a: ["In welchem Fach?", "In welchen Fächern?"], r: ["school.subj"] },
          { q: "«Ich bin in der Prüfung durchgefallen.» — ___ — «Ja, im Juni kann ich sie noch einmal machen.» (ask if she can take it again)", a: ["Kannst du sie noch einmal machen?", "Kannst du die Prüfung noch einmal machen?", "Kannst du sie wiederholen?", "Kannst du die Prüfung wiederholen?", "Darfst du sie noch einmal machen?", "Kannst du sie nochmal machen?", "Darfst du die Prüfung wiederholen?", "Darfst du sie wiederholen?"], r: ["school.past"] },
        ] },
        // ── Production: say it ──
        { id: "dp.school", t: "translate", end: true, title: "Say it in German", how: "Translate it the way people say it.", items: [
          { q: "My sister studies medicine in Basel.", a: ["Meine Schwester studiert Medizin in Basel.", "Meine Schwester studiert in Basel Medizin."], r: ["school.stud"] },
          { q: "I'm revising for the test tonight.", a: ["Ich lerne heute Abend für den Test.", "Heute Abend lerne ich für den Test."], r: ["school.stud"] },
          { q: "I did an apprenticeship as an electrician.", a: ["Ich habe eine Lehre als Elektriker gemacht.", "Ich habe eine Lehre als Elektrikerin gemacht.", "Ich habe Elektriker gelernt.", "Ich habe Elektrikerin gelernt."], r: ["school.types", "school.past"] },
          { q: "She passed the Matura.", a: ["Sie hat die Matura bestanden.", "Sie hat die Matura gemacht.", "Sie hat die Matura geschafft."], r: ["school.past"] },
          { q: "He failed the exam.", a: ["Er ist in der Prüfung durchgefallen.", "Er ist bei der Prüfung durchgefallen.", "Er ist durch die Prüfung gefallen.", "Er hat die Prüfung nicht bestanden."], r: ["school.past"] },
          { q: "I had to learn a lot.", a: ["Ich musste viel lernen.", "Ich habe viel lernen müssen."], r: ["school.past"] },
          { q: "In Switzerland, six is the best mark.", a: ["In der Schweiz ist sechs die beste Note.", "In der Schweiz ist die Sechs die beste Note.", "In der Schweiz ist eine Sechs die beste Note.", "Die beste Note in der Schweiz ist die Sechs.", "Sechs ist in der Schweiz die beste Note.", "In der Schweiz ist die 6 die beste Note.", "In der Schweiz ist 6 die beste Note."], r: ["school.grade"] },
          { q: "Could you repeat that, please? (Sie)", a: ["Können Sie das bitte wiederholen?", "Könnten Sie das bitte wiederholen?", "Können Sie das wiederholen, bitte?", "Könnten Sie das wiederholen, bitte?", "Können Sie das bitte noch einmal sagen?"], r: ["school.class"] },
          { q: "What does Znüni mean?", a: ["Was bedeutet Znüni?", "Was heißt Znüni?"], r: ["school.class"] },
          { q: "My favourite subject is history.", a: ["Mein Lieblingsfach ist Geschichte.", "Geschichte ist mein Lieblingsfach."], r: ["school.subj"] },
          { q: "On Monday we have a German test.", a: ["Am Montag schreiben wir einen Test in Deutsch.", "Am Montag schreiben wir einen Deutschtest.", "Am Montag haben wir einen Test in Deutsch.", "Am Montag haben wir einen Deutschtest.", "Wir schreiben am Montag einen Test in Deutsch.", "Wir schreiben am Montag einen Deutschtest.", "Wir haben am Montag einen Deutschtest.", "Wir haben am Montag einen Test in Deutsch."], r: ["school.subj"] },
        ] },
        // ── Production: your own lines ──
        { id: "dw.school", t: "write", end: true, title: "Your own lines", how: "Write about yourself. Saved for Claude to correct.", items: [
          { q: "Which schools did you go to, and what did you do after them?", model: ["Ich bin in Lima in die Primarschule gegangen. Dann war ich im Gymnasium und habe Wirtschaft studiert."], r: ["school.types", "school.past"] },
          { q: "Your training or job in two sentences (Was hast du gelernt?).", model: ["Ich habe eine Lehre als Coiffeuse gemacht. Heute arbeite ich in einem Salon in Bern."], r: ["school.types"] },
          { q: "A subject you were good or bad at, with your marks.", model: ["In Mathe war ich schlecht, ich hatte oft eine Vier. Aber in Sprachen hatte ich immer eine Sechs."], r: ["school.grade"] },
          { q: "An exam you passed or failed, and what you had to do.", model: ["Ich bin einmal bei der Fahrprüfung durchgefallen. Ich musste noch zehn Fahrstunden nehmen, dann habe ich sie bestanden."], r: ["school.past"] },
          { q: "What do you «lernen»? Does someone you know «studieren»?", model: ["Ich lerne Deutsch, und jeden Abend lerne ich neue Wörter. Mein Cousin studiert Informatik an der Uni."], r: ["school.stud"] },
          { q: "You didn't understand the teacher. Write two things you can say.", model: ["Entschuldigung, können Sie das bitte wiederholen? Was bedeutet «Gemeinde»?"], r: ["school.class"] },
          { q: "Your German course: when and where it is, and what you do there.", model: ["Mein Deutschkurs ist jeden Dienstag und Donnerstag in Olten. Wir lesen, sprechen viel und schreiben jede Woche einen Test."], r: ["school.subj"] },
          { q: "Something you'd like to learn next year, and why.", model: ["Nächstes Jahr möchte ich einen Kurs in Buchhaltung machen, weil ich eine bessere Stelle suche."], r: ["school.stud"] },
        ] },
      ],
    },
  },
});

// Chapter 31's schools and classroom: every exercise here.
cxCover({ "31.2": "d31.2", "31.3": "d31.3", "31.4": "d31.4", "31.5": "d31.5" });

cxJournal([
  { id: "w.mytraining", th: "work", lv: "B1", de: "Meine Ausbildung", t: "Tell your school and training story: the schools you went to, what you learned or studied, an exam you remember, and what you are learning now.", help: ["Ich bin in … zur Schule gegangen.", "Danach habe ich … gemacht.", "Am schwierigsten war …", "Heute lerne ich …"], sec: "s3.school" },
]);
