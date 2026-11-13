// ── COURSE PACK · Stage 2 · the passive — its book exercises ──
// The lesson's sheets live in the verb track (pv1: werden + Partizip II ·
// pv2: wurde, the past passive · pv3: the Perfekt passive (ist … worden) and
// with a modal (muss … werden) · pv4: von, durch and the state passive (ist
// geschlossen)). These are the book's exercises for it, chapter 25: the
// tenses (25•1, 25•6, 25•20), active into passive (25•2, 25•17, 25•18,
// 25•21), with a modal (25•4), von and durch (25•7, 25•8, 25•22), a Saturday
// of chores without who does them (25•9), the state passive (25•11, 25•12)
// and the choice (25•25). Our own sentences, every passive form the engine
// has checked (vf: wird / wurde / ist … worden / muss … werden). The book also
// asks the future passive (wird gebaut werden): nobody says it — our tense
// sets keep to the Präsens, the Präteritum and the Perfekt. The dative in the
// passive (Mir wurde geholfen · 25•3, 25•23, 25•24), es wird … and man are
// the next lesson's (s2.man); sich lassen is lassen's (s2.lassen).
cxPack({
  id: "s2-passive",
  sections: {
    "s2.pv": {
      diag: [
        { t: "swap", from: "^geworden$", to: "^worden$", rule: "gs:pv3.trap", hard: true, msg: "In the passive it is **worden**, never geworden: ist repariert **worden**." },
        { t: "swap", from: "^(hat|haben|habe|hast|habt)$", to: "^(ist|sind|bin|bist|seid)$", rule: "gs:pv3.r1", hard: true, msg: "The Perfekt passive is built with **sein**: **{right}** … worden." },
        { t: "swap", from: "^(von|vom)$", to: "^durch$", rule: "gs:pv4.r2", hard: true, msg: "A cause that is not a person (a storm, an accident) takes **durch** + accusative." },
        { t: "swap", from: "^durch$", to: "^(von|vom)$", rule: "gs:pv4.r1", hard: true, msg: "The person or group who does it takes **von** + dative." },
        { t: "ending", stem: "wurd", rule: "gs:pv2.r1", msg: "wurde must match the subject: **{right}** (er wurde, sie wurden)." },
        { t: "ending", stem: "(wird|werd)", rule: "gs:pv1.r2", msg: "werden must match the subject: **{right}** (es wird, sie werden)." },
        { t: "swap", from: "^(?!ge)\\w+(en|ern|eln)$", to: "^(ge\\w+|\\w+iert|\\w+ge\\w+|(be|ver|er|ent|zer|ge|unter|uber)\\w+(t|en))$", rule: "gs:pv1.trap", msg: "werden + an infinitive is the future. The passive takes the **Partizip II**: **{right}**." },
        { t: "pos", tok: "^(werden|worden)$", rule: "gs:pv3.r3", msg: "At the end, the Partizip II comes first and werden or worden last: put it {where}." },
      ],
      drills: [
        // ── Übung 25•1: into the past ──
        { id: "d25.1", ex: "25.1", t: "transform", title: "Into the past: wurde", how: "Say it in the Präteritum: wurde or wurden + the Partizip II.", items: [
          { q: "Die Brücke wird neu gebaut.", a: ["Die Brücke wurde neu gebaut."], r: ["gs:pv2.r1"], vf: [["bauen", "pvpt", "er"]] },
          { q: "Der Patient wird am Morgen operiert.", a: ["Der Patient wurde am Morgen operiert."], r: ["gs:pv2.r1"], vf: [["operieren", "pvpt", "er"]] },
          { q: "Das Fest wird wegen des Regens abgesagt.", a: ["Das Fest wurde wegen des Regens abgesagt."], r: ["gs:pv2.r1"], vf: [["absagen", "pvpt", "er"]] },
          { q: "Die Fenster werden geputzt.", a: ["Die Fenster wurden geputzt."], r: ["gs:pv2.r1"], vf: [["putzen", "pvpt", "sie"]] },
          { q: "Das Paket wird auf der Post abgeholt.", a: ["Das Paket wurde auf der Post abgeholt."], r: ["gs:pv2.r1"], vf: [["abholen", "pvpt", "er"]] },
          { q: "Der Schlüssel wird nicht gefunden.", a: ["Der Schlüssel wurde nicht gefunden."], r: ["gs:pv2.r1"], vf: [["finden", "pvpt", "er"]] },
          { q: "Die Gäste werden herzlich begrüßt.", a: ["Die Gäste wurden herzlich begrüßt."], r: ["gs:pv2.r1"], vf: [["begrüßen", "pvpt", "sie"]] },
          { q: "Das Essen wird um sieben gekocht.", a: ["Das Essen wurde um sieben gekocht."], r: ["gs:pv2.r1"], vf: [["kochen", "pvpt", "er"]] },
          { q: "Die Fragen werden sofort beantwortet.", a: ["Die Fragen wurden sofort beantwortet."], r: ["gs:pv2.r1"], vf: [["beantworten", "pvpt", "sie"]] },
          { q: "Die alten Möbel werden verkauft.", a: ["Die alten Möbel wurden verkauft."], r: ["gs:pv2.r1"], vf: [["verkaufen", "pvpt", "sie"]] },
        ] },
        // ── Übung 25•6: the Perfekt passive ──
        { id: "d25.6", ex: "25.6", t: "transform", title: "ist … worden", how: "Say it in the Perfekt: ist or sind + the Partizip II + worden.", items: [
          { q: "Das Paket wird geliefert.", a: ["Das Paket ist geliefert worden."], r: ["gs:pv3.r1"], vf: [["liefern", "pvpf", "er"]] },
          { q: "Die Rechnungen werden bezahlt.", a: ["Die Rechnungen sind bezahlt worden."], r: ["gs:pv3.r1"], vf: [["bezahlen", "pvpf", "sie"]] },
          { q: "Der Vertrag wird unterschrieben.", a: ["Der Vertrag ist unterschrieben worden."], r: ["gs:pv3.r1"], vf: [["unterschreiben", "pvpf", "er"]] },
          { q: "Die Kinder werden um vier abgeholt.", a: ["Die Kinder sind um vier abgeholt worden."], r: ["gs:pv3.r3"], vf: [["abholen", "pvpf", "sie"]] },
          { q: "Ein Zimmer wird für uns reserviert.", a: ["Ein Zimmer ist für uns reserviert worden."], r: ["gs:pv3.r1"], vf: [["reservieren", "pvpf", "er"]] },
          { q: "Die Heizung wird endlich repariert.", a: ["Die Heizung ist endlich repariert worden."], r: ["gs:pv3.r1"], vf: [["reparieren", "pvpf", "er"]] },
          { q: "Die Termine werden verschoben.", a: ["Die Termine sind verschoben worden."], r: ["gs:pv3.r1"], vf: [["verschieben", "pvpf", "sie"]] },
          { q: "Das Formular wird falsch ausgefüllt.", a: ["Das Formular ist falsch ausgefüllt worden."], r: ["gs:pv3.r3"], vf: [["ausfüllen", "pvpf", "er"]] },
          { q: "Die Wohnung wird gekündigt.", a: ["Die Wohnung ist gekündigt worden."], r: ["gs:pv3.r1"], vf: [["kündigen", "pvpf", "er"]] },
          { q: "Alle Fotos werden gelöscht.", a: ["Alle Fotos sind gelöscht worden."], r: ["gs:pv3.r1"], vf: [["löschen", "pvpf", "sie"]] },
        ] },
        // ── Übung 25•20: the tense in brackets ──
        { id: "d25.20", ex: "25.20", t: "transform", title: "Change the tense", how: "Say it in the tense in brackets: wird (Präsens), wurde (Präteritum), ist … worden (Perfekt).", items: [
          { q: "Das Museum wird um zehn geöffnet. (Präteritum)", a: ["Das Museum wurde um zehn geöffnet."], r: ["gs:pv2.r1"], vf: [["öffnen", "pvpt", "er"]] },
          { q: "Die Wohnung wurde renoviert. (Perfekt)", a: ["Die Wohnung ist renoviert worden."], r: ["gs:pv3.r1"], vf: [["renovieren", "pvpf", "er"]] },
          { q: "Der Müll ist abgeholt worden. (Präsens)", a: ["Der Müll wird abgeholt."], r: ["gs:pv1.r1"], vf: [["abholen", "pvpr", "er"]] },
          { q: "Die Kinder werden zum Essen gerufen. (Perfekt)", a: ["Die Kinder sind zum Essen gerufen worden."], r: ["gs:pv3.r1"], vf: [["rufen", "pvpf", "sie"]] },
          { q: "Mein Name wurde falsch geschrieben. (Perfekt)", a: ["Mein Name ist falsch geschrieben worden."], r: ["gs:pv3.r1"], vf: [["schreiben", "pvpf", "er"]] },
          { q: "Mein Velo ist gestohlen worden. (Präteritum)", a: ["Mein Velo wurde gestohlen."], r: ["gs:pv2.r1"], vf: [["stehlen", "pvpt", "er"]] },
          { q: "Die Briefe werden übersetzt. (Präteritum)", a: ["Die Briefe wurden übersetzt."], r: ["gs:pv2.r1"], vf: [["übersetzen", "pvpt", "sie"]] },
          { q: "Die Häuser wurden verkauft. (Präsens)", a: ["Die Häuser werden verkauft."], r: ["gs:pv1.r2"], vf: [["verkaufen", "pvpr", "sie"]] },
          { q: "Der Text wird ins Englische übersetzt. (Perfekt)", a: ["Der Text ist ins Englische übersetzt worden."], r: ["gs:pv3.r3"], vf: [["übersetzen", "pvpf", "er"]] },
          { q: "Das Konzert ist abgesagt worden. (Präsens)", a: ["Das Konzert wird abgesagt."], r: ["gs:pv1.r1"], vf: [["absagen", "pvpr", "er"]] },
        ] },
        // ── Übung 25•4: with a modal ──
        { id: "d25.4", ex: "25.4", t: "transform", title: "With a modal", how: "Add the modal in brackets: the modal second, then the Partizip II + werden at the end.", items: [
          { q: "Die Rechnung wird bezahlt. (müssen)", a: ["Die Rechnung muss bezahlt werden."], r: ["gs:pv3.r2"], vf: [["bezahlen", "pvmod", "er"]] },
          { q: "Das Velo wird repariert. (können)", a: ["Das Velo kann repariert werden."], r: ["gs:pv3.r2"] },
          { q: "Hier wird nicht geraucht. (dürfen)", a: ["Hier darf nicht geraucht werden."], r: ["gs:pv3.r2"] },
          { q: "Die Pakete werden abgeholt. (müssen)", a: ["Die Pakete müssen abgeholt werden."], r: ["gs:pv3.r2"], vf: [["abholen", "pvmod", "sie"]] },
          { q: "Das Zimmer wird jeden Tag geputzt. (sollen)", a: ["Das Zimmer soll jeden Tag geputzt werden."], r: ["gs:pv3.r3"] },
          { q: "Der Termin wird verschoben. (können)", a: ["Der Termin kann verschoben werden."], r: ["gs:pv3.r2"] },
          { q: "Die Formulare werden bis Freitag abgegeben. (müssen)", a: ["Die Formulare müssen bis Freitag abgegeben werden."], r: ["gs:pv3.r3"], vf: [["abgeben", "pvmod", "sie"]] },
          { q: "Der Hund wird nicht allein gelassen. (dürfen)", a: ["Der Hund darf nicht allein gelassen werden."], r: ["gs:pv3.r2"] },
          { q: "Das Problem wird schnell gelöst. (können)", a: ["Das Problem kann schnell gelöst werden."], r: ["gs:pv3.r2"] },
          { q: "Die Fenster werden am Morgen geöffnet. (sollen)", a: ["Die Fenster sollen am Morgen geöffnet werden."], r: ["gs:pv3.r3"] },
        ] },
        // ── Übung 25•2: active into passive ──
        { id: "d25.2", ex: "25.2", t: "transform", title: "Active into passive", how: "Say it in the passive, in the same tense. The person who does it comes with von.", items: [
          { q: "Der Mechaniker repariert das Auto.", a: ["Das Auto wird vom Mechaniker repariert."], r: ["gs:pv1.r3"], vf: [["reparieren", "pvpr", "er"]] },
          { q: "Die Nachbarin gießt die Blumen.", a: ["Die Blumen werden von der Nachbarin gegossen."], r: ["gs:pv1.r2"], vf: [["gießen", "pvpr", "sie"]] },
          { q: "Ein Dieb stahl mein Velo.", a: ["Mein Velo wurde von einem Dieb gestohlen."], r: ["gs:pv2.r1"], vf: [["stehlen", "pvpt", "er"]] },
          { q: "Die Gemeinde baut eine neue Schule.", a: ["Eine neue Schule wird von der Gemeinde gebaut."], r: ["gs:pv1.r3"], vf: [["bauen", "pvpr", "er"]] },
          { q: "Meine Großmutter backte den Kuchen.", a: ["Der Kuchen wurde von meiner Großmutter gebacken."], r: ["gs:pv2.r1"], vf: [["backen", "pvpt", "er"]] },
          { q: "Die Ärztin untersucht den Patienten.", a: ["Der Patient wird von der Ärztin untersucht."], r: ["gs:pv1.r3"], vf: [["untersuchen", "pvpr", "er"]] },
          { q: "Die Polizei kontrollierte die Autos.", a: ["Die Autos wurden von der Polizei kontrolliert."], r: ["gs:pv2.r1"], vf: [["kontrollieren", "pvpt", "sie"]] },
          { q: "Viele Touristen besuchen das Schloss.", a: ["Das Schloss wird von vielen Touristen besucht."], r: ["gs:pv1.r3"], vf: [["besuchen", "pvpr", "er"]] },
          { q: "Die Briefträgerin bringt die Pakete.", a: ["Die Pakete werden von der Briefträgerin gebracht."], r: ["gs:pv1.r2"], vf: [["bringen", "pvpr", "sie"]] },
          { q: "Der Chef unterschrieb den Vertrag.", a: ["Der Vertrag wurde vom Chef unterschrieben."], r: ["gs:pv2.r1"], vf: [["unterschreiben", "pvpt", "er"]] },
        ].map(it => ({ ...it, a: [...new Set(it.a.flatMap(x => [x, x.replace(/\bvom\b/, "von dem")]))] })) },
        // ── Übung 25•21: keep the tense ──
        { id: "d25.21", ex: "25.21", t: "transform", title: "Keep the tense", how: "Say it in the passive, same tense (Perfekt: ist … worden). The object becomes the subject.", items: [
          { q: "Der Hauswart hat die Heizung repariert.", a: ["Die Heizung ist vom Hauswart repariert worden."], r: ["gs:pv3.r1"], vf: [["reparieren", "pvpf", "er"]] },
          { q: "Die Firma sucht neue Mitarbeiter.", a: ["Neue Mitarbeiter werden von der Firma gesucht."], r: ["gs:pv1.r2"], vf: [["suchen", "pvpr", "sie"]] },
          { q: "Ein Kollege hat mich angerufen.", a: ["Ich bin von einem Kollegen angerufen worden."], r: ["gs:pv1.r3"] },
          { q: "Die Lehrerin lobte die Kinder.", a: ["Die Kinder wurden von der Lehrerin gelobt."], r: ["gs:pv2.r1"], vf: [["loben", "pvpt", "sie"]] },
          { q: "Der Zahnarzt hat den Zahn gezogen.", a: ["Der Zahn ist vom Zahnarzt gezogen worden."], r: ["gs:pv3.r1"], vf: [["ziehen", "pvpf", "er"]] },
          { q: "Die Stadt renoviert den Bahnhof.", a: ["Der Bahnhof wird von der Stadt renoviert."], r: ["gs:pv1.r3"], vf: [["renovieren", "pvpr", "er"]] },
          { q: "Meine Kolleginnen haben mich eingeladen.", a: ["Ich bin von meinen Kolleginnen eingeladen worden."], r: ["gs:pv1.r3"] },
          { q: "Die Kinder malten die Bilder.", a: ["Die Bilder wurden von den Kindern gemalt."], r: ["gs:pv2.r1"], vf: [["malen", "pvpt", "sie"]] },
          { q: "Der Sturm hat das Dach beschädigt.", a: ["Das Dach ist durch den Sturm beschädigt worden.", "Das Dach ist vom Sturm beschädigt worden."], r: ["gs:pv4.r2"], vf: [["beschädigen", "pvpf", "er"]] },
          { q: "Eine Studentin übersetzte den Text.", a: ["Der Text wurde von einer Studentin übersetzt."], r: ["gs:pv2.r1"], vf: [["übersetzen", "pvpt", "er"]] },
        ].map(it => ({ ...it, a: [...new Set(it.a.flatMap(x => [x, x.replace(/\bvom\b/, "von dem")]))] })) },
        // ── Übung 25•17: how the Swiss eat ──
        { id: "d25.17", ex: "25.17", t: "transform", title: "How the Swiss eat", how: "Say it in the passive. man disappears: nobody is named.", items: [
          { q: "Man trinkt viel Kaffee.", a: ["Es wird viel Kaffee getrunken.", "Viel Kaffee wird getrunken."], r: ["gs:pv1.r3"], vf: [["trinken", "pvpr", "er"]] },
          { q: "Im Winter isst man Fondue.", a: ["Im Winter wird Fondue gegessen.", "Fondue wird im Winter gegessen."], r: ["gs:pv1.r3"], vf: [["essen", "pvpr", "er"]] },
          { q: "Man macht Rösti aus Kartoffeln.", a: ["Rösti wird aus Kartoffeln gemacht.", "Rösti werden aus Kartoffeln gemacht."], r: ["gs:pv1.r1"] },
          { q: "Man kauft das Brot beim Bäcker.", a: ["Das Brot wird beim Bäcker gekauft."], r: ["gs:pv1.r3"], vf: [["kaufen", "pvpr", "er"]] },
          { q: "Zum Raclette trinkt man Weißwein oder Tee.", a: ["Zum Raclette wird Weißwein oder Tee getrunken."], r: ["gs:pv1.r1"], vf: [["trinken", "pvpr", "er"]] },
          { q: "Man isst das Birchermüesli zum Frühstück.", a: ["Das Birchermüesli wird zum Frühstück gegessen."], r: ["gs:pv1.r3"], vf: [["essen", "pvpr", "er"]] },
          { q: "Man schneidet den Käse in dünne Scheiben.", a: ["Der Käse wird in dünne Scheiben geschnitten."], r: ["gs:pv1.r3"], vf: [["schneiden", "pvpr", "er"]] },
          { q: "Man bestellt die Getränke an der Bar.", a: ["Die Getränke werden an der Bar bestellt."], r: ["gs:pv1.r2"], vf: [["bestellen", "pvpr", "sie"]] },
          { q: "Man kocht die Kartoffeln mit der Schale.", a: ["Die Kartoffeln werden mit der Schale gekocht."], r: ["gs:pv1.r2"], vf: [["kochen", "pvpr", "sie"]] },
          { q: "Am 1. August grillt man Würste.", a: ["Am 1. August werden Würste grilliert.", "Würste werden am 1. August grilliert.", "Am 1. August werden Würste gegrillt.", "Würste werden am 1. August gegrillt."], r: ["gs:pv1.r2"] },
        ] },
        // ── Übung 25•18: when Grandma was young ──
        { id: "d25.18", ex: "25.18", t: "transform", title: "When Grandma was young", how: "How things were done on the farm: say it in the past passive (wurde).", items: [
          { q: "Man wusch die Wäsche von Hand.", a: ["Die Wäsche wurde von Hand gewaschen."], r: ["gs:pv2.r2"], vf: [["waschen", "pvpt", "er"]] },
          { q: "Man heizte das Haus mit Holz.", a: ["Das Haus wurde mit Holz geheizt."], r: ["gs:pv2.r2"], vf: [["heizen", "pvpt", "er"]] },
          { q: "Man holte das Wasser am Brunnen.", a: ["Das Wasser wurde am Brunnen geholt."], r: ["gs:pv2.r2"], vf: [["holen", "pvpt", "er"]] },
          { q: "Die Kinder brachten die Milch in die Käserei.", a: ["Die Milch wurde von den Kindern in die Käserei gebracht."], r: ["gs:pv2.r1"], vf: [["bringen", "pvpt", "er"]] },
          { q: "Die Großmutter nähte alle Kleider selbst.", a: ["Alle Kleider wurden von der Großmutter selbst genäht."], r: ["gs:pv2.r1"], vf: [["nähen", "pvpt", "sie"]] },
          { q: "Man machte die Butter selbst.", a: ["Die Butter wurde selbst gemacht."], r: ["gs:pv2.r2"], vf: [["machen", "pvpt", "er"]] },
          { q: "Man feierte die Feste im ganzen Dorf.", a: ["Die Feste wurden im ganzen Dorf gefeiert."], r: ["gs:pv2.r1"], vf: [["feiern", "pvpt", "sie"]] },
          { q: "Der Bäcker brachte das Brot ins Haus.", a: ["Das Brot wurde vom Bäcker ins Haus gebracht.", "Das Brot wurde von dem Bäcker ins Haus gebracht."], r: ["gs:pv2.r1"], vf: [["bringen", "pvpt", "er"]] },
          { q: "Man aß Fleisch nur am Sonntag.", a: ["Fleisch wurde nur am Sonntag gegessen."], r: ["gs:pv2.r2"], vf: [["essen", "pvpt", "er"]] },
          { q: "Man kaufte die Schuhe beim Schuhmacher.", a: ["Die Schuhe wurden beim Schuhmacher gekauft."], r: ["gs:pv2.r1"], vf: [["kaufen", "pvpt", "sie"]] },
        ] },
        // ── Übung 25•9: Saturday at the Kellers' ──
        { id: "d25.9", ex: "25.9", t: "compose", title: "Saturday at the Kellers'", how: "What is done on Saturday? Say it in the passive — nobody is named: wird / werden + Partizip II.", items: [
          { w: ["am Morgen", "die Wohnung", "putzen"], a: ["Am Morgen wird die Wohnung geputzt.", "Die Wohnung wird am Morgen geputzt."], r: ["gs:pv1.r1"], vf: [["putzen", "pvpr", "er"]] },
          { w: ["dann", "die Wäsche", "waschen"], a: ["Dann wird die Wäsche gewaschen.", "Die Wäsche wird dann gewaschen."], r: ["gs:pv1.r1"], vf: [["waschen", "pvpr", "er"]] },
          { w: ["um elf", "auf dem Markt", "Gemüse", "kaufen"], a: ["Um elf wird auf dem Markt Gemüse gekauft.", "Gemüse wird um elf auf dem Markt gekauft.", "Auf dem Markt wird um elf Gemüse gekauft."], r: ["gs:pv1.r1"], vf: [["kaufen", "pvpr", "er"]] },
          { w: ["am Mittag", "Spaghetti", "kochen"], a: ["Am Mittag werden Spaghetti gekocht.", "Spaghetti werden am Mittag gekocht."], r: ["gs:pv1.r2"], vf: [["kochen", "pvpr", "sie"]] },
          { w: ["nach dem Essen", "das Geschirr", "abwaschen"], a: ["Nach dem Essen wird das Geschirr abgewaschen.", "Das Geschirr wird nach dem Essen abgewaschen."], r: ["gs:pv1.r1"] },
          { w: ["am Nachmittag", "die Blumen", "gießen"], a: ["Am Nachmittag werden die Blumen gegossen.", "Die Blumen werden am Nachmittag gegossen."], r: ["gs:pv1.r2"], vf: [["gießen", "pvpr", "sie"]] },
          { w: ["dann", "das Altpapier", "bündeln"], a: ["Dann wird das Altpapier gebündelt.", "Das Altpapier wird dann gebündelt."], r: ["gs:pv1.r1"] },
          { w: ["am Abend", "mit Freunden", "essen"], a: ["Am Abend wird mit Freunden gegessen.", "Mit Freunden wird am Abend gegessen."], r: ["gs:pv1.r1"] },
          { w: ["bis Mitternacht", "Karten", "spielen"], a: ["Bis Mitternacht werden Karten gespielt.", "Karten werden bis Mitternacht gespielt."], r: ["gs:pv1.r2"] },
        ] },
        // ── Übung 25•7: who does it? von ──
        { id: "d25.7", ex: "25.7", t: "answer", title: "Who does it? — von", how: "Answer in the passive with von + the person in brackets.", items: [
          { q: "Wer repariert die Heizung? (der Hauswart)", a: ["Die Heizung wird vom Hauswart repariert."], r: ["gs:pv4.r1"], vf: [["reparieren", "pvpr", "er"]] },
          { q: "Wer bringt die Post? (die Briefträgerin)", a: ["Die Post wird von der Briefträgerin gebracht."], r: ["gs:pv4.r1"], vf: [["bringen", "pvpr", "er"]] },
          { q: "Wer wäscht das Auto? (mein Sohn)", a: ["Das Auto wird von meinem Sohn gewaschen."], r: ["gs:pv4.r1"], vf: [["waschen", "pvpr", "er"]] },
          { q: "Wer kocht das Abendessen? (mein Mann)", a: ["Das Abendessen wird von meinem Mann gekocht."], r: ["gs:pv4.r1"], vf: [["kochen", "pvpr", "er"]] },
          { q: "Wer organisiert das Fest? (der Verein)", a: ["Das Fest wird vom Verein organisiert."], r: ["gs:pv4.r1"], vf: [["organisieren", "pvpr", "er"]] },
          { q: "Wer hat das Bild gemalt? (meine Tochter)", a: ["Das Bild ist von meiner Tochter gemalt worden.", "Das Bild wurde von meiner Tochter gemalt."], r: ["gs:pv4.r1"] },
          { q: "Wer bezahlt die Reise? (die Firma)", a: ["Die Reise wird von der Firma bezahlt."], r: ["gs:pv4.r1"], vf: [["bezahlen", "pvpr", "er"]] },
          { q: "Wer unterrichtet die Klasse? (eine neue Lehrerin)", a: ["Die Klasse wird von einer neuen Lehrerin unterrichtet."], r: ["gs:pv4.r1"], vf: [["unterrichten", "pvpr", "er"]] },
          { q: "Wer putzt das Treppenhaus? (die Nachbarn)", a: ["Das Treppenhaus wird von den Nachbarn geputzt."], r: ["gs:pv4.r1"], vf: [["putzen", "pvpr", "er"]] },
          { q: "Wer hat dich eingeladen? (eine Kollegin)", a: ["Ich bin von einer Kollegin eingeladen worden.", "Ich wurde von einer Kollegin eingeladen."], r: ["gs:pv4.r1"] },
        ].map(it => ({ ...it, a: [...new Set(it.a.flatMap(x => [x, x.replace(/\bvom\b/, "von dem")]))] })) },
        // ── Übung 25•8: what caused it? durch ──
        { id: "d25.8", ex: "25.8", t: "answer", title: "What caused it? — durch", how: "Answer in the passive with durch + the cause in brackets.", items: [
          { q: "Wodurch wurde das Dach beschädigt? (der Sturm)", a: ["Das Dach wurde durch den Sturm beschädigt."], r: ["gs:pv4.r2"], vf: [["beschädigen", "pvpt", "er"]] },
          { q: "Wodurch wurde der Keller überschwemmt? (das Hochwasser)", a: ["Der Keller wurde durch das Hochwasser überschwemmt."], r: ["gs:pv4.r2"] },
          { q: "Wodurch wurde die Straße blockiert? (ein Unfall)", a: ["Die Straße wurde durch einen Unfall blockiert."], r: ["gs:pv4.r2"] },
          { q: "Wodurch wurde das Feuer gelöscht? (der Regen)", a: ["Das Feuer wurde durch den Regen gelöscht."], r: ["gs:pv4.r2"], vf: [["löschen", "pvpt", "er"]] },
          { q: "Wodurch wurde der Fehler gefunden? (eine Kontrolle)", a: ["Der Fehler wurde durch eine Kontrolle gefunden."], r: ["gs:pv4.r2"], vf: [["finden", "pvpt", "er"]] },
          { q: "Wodurch wurde der Wald zerstört? (ein Feuer)", a: ["Der Wald wurde durch ein Feuer zerstört."], r: ["gs:pv4.r2"], vf: [["zerstören", "pvpt", "er"]] },
          { q: "Wodurch wurde die Brücke beschädigt? (das Erdbeben)", a: ["Die Brücke wurde durch das Erdbeben beschädigt."], r: ["gs:pv4.r2"], vf: [["beschädigen", "pvpt", "er"]] },
          { q: "Wodurch wurden die Bürger informiert? (ein Brief der Gemeinde)", a: ["Die Bürger wurden durch einen Brief der Gemeinde informiert."], r: ["gs:pv4.r2"] },
          { q: "Wodurch wurde die Ernte zerstört? (der Hagel)", a: ["Die Ernte wurde durch den Hagel zerstört."], r: ["gs:pv4.r2"], vf: [["zerstören", "pvpt", "er"]] },
        ] },
        // ── Übung 25•22: von or durch? ──
        { id: "d25.22", ex: "25.22", t: "type", title: "von or durch?", how: "Add von or durch with the words in brackets, in the right case.", items: [
          { q: "Das Dorf wurde ___ zerstört. (eine Lawine)", a: ["durch eine Lawine"], r: ["gs:pv4.r2"] },
          { q: "Das Paket wurde ___ gebracht. (ein Kurier)", a: ["von einem Kurier"], r: ["gs:pv4.r1"] },
          { q: "Die Straße wurde ___ gesperrt. (die Polizei)", a: ["von der Polizei", "durch die Polizei"], r: ["gs:pv4.r1"] },
          { q: "Der Baum wurde ___ umgeworfen. (der Sturm)", a: ["durch den Sturm"], r: ["gs:pv4.r2"] },
          { q: "Das Kind wurde ___ gerettet. (eine Nachbarin)", a: ["von einer Nachbarin"], r: ["gs:pv4.r1"] },
          { q: "Die Ernte wurde ___ zerstört. (der Hagel)", a: ["durch den Hagel"], r: ["gs:pv4.r2"] },
          { q: "Das Konzert wurde ___ organisiert. (meine Schwester)", a: ["von meiner Schwester"], r: ["gs:pv4.r1"] },
          { q: "Viele Häuser wurden ___ beschädigt. (das Erdbeben)", a: ["durch das Erdbeben"], r: ["gs:pv4.r2"] },
          { q: "Die Rechnung wurde ___ bezahlt. (meine Eltern)", a: ["von meinen Eltern"], r: ["gs:pv4.r1"] },
          { q: "Der Fehler wurde ___ entdeckt. (ein Zufall)", a: ["durch einen Zufall", "durch Zufall"], r: ["gs:pv4.r2"] },
        ] },
        // ── Übung 25•11: everything is ready ──
        { id: "d25.11", ex: "25.11", t: "compose", title: "Everything is ready", how: "Lea's party is tonight. Say that it is done already: ist / sind + Partizip II.", items: [
          { w: ["die Wohnung", "schon", "putzen"], a: ["Die Wohnung ist schon geputzt."], r: ["gs:pv4.r3"] },
          { w: ["der Tisch", "schon", "decken"], a: ["Der Tisch ist schon gedeckt."], r: ["gs:pv4.r3"] },
          { w: ["die Gläser", "schon", "waschen"], a: ["Die Gläser sind schon gewaschen.", "Die Gläser sind schon gespült."], r: ["gs:pv4.r3"] },
          { w: ["das Fleisch", "schon", "marinieren"], a: ["Das Fleisch ist schon mariniert."], r: ["gs:pv4.r3"] },
          { w: ["die Einladungen", "schon", "schicken"], a: ["Die Einladungen sind schon verschickt.", "Die Einladungen sind schon geschickt."], r: ["gs:pv4.r3"] },
          { w: ["der Kuchen", "schon", "backen"], a: ["Der Kuchen ist schon gebacken."], r: ["gs:pv4.r3"] },
          { w: ["die Musik", "schon", "auswählen"], a: ["Die Musik ist schon ausgewählt."], r: ["gs:pv4.r3"] },
          { w: ["die Stühle", "schon", "aufstellen"], a: ["Die Stühle sind schon aufgestellt."], r: ["gs:pv4.r3"] },
          { w: ["der Salat", "schon", "machen"], a: ["Der Salat ist schon gemacht."], r: ["gs:pv4.r3"] },
          { w: ["alles", "schon", "vorbereiten"], a: ["Alles ist schon vorbereitet.", "Es ist schon alles vorbereitet."], r: ["gs:pv4.r3"] },
        ].map(it => ({ ...it, diag: [{ t: "swap", from: "^(wird|werden|wurde|wurden)$", to: "^(ist|sind|war|waren)$", rule: "gs:pv4.r3", msg: "This describes a state, the result: **{right}** + Partizip II. werden would say that someone is doing it now." }] })) },
        // ── Übung 25•12: before we left ──
        { id: "d25.12", ex: "25.12", t: "translate", title: "Before we left", how: "Before you left for the holidays, everything was done. Translate: war / waren + Partizip II.", items: [
          { q: "The windows were closed.", a: ["Die Fenster waren geschlossen.", "Die Fenster waren zu."], r: ["gs:pv4.r3"] },
          { q: "The lights were switched off.", a: ["Die Lichter waren ausgeschaltet.", "Das Licht war ausgeschaltet.", "Die Lampen waren ausgeschaltet."], r: ["gs:pv4.r3"] },
          { q: "The dishes were washed.", a: ["Das Geschirr war gespült.", "Das Geschirr war abgewaschen."], r: ["gs:pv4.r3"] },
          { q: "The bed was made.", a: ["Das Bett war gemacht."], r: ["gs:pv4.r3"] },
          { q: "The bags were packed.", a: ["Die Taschen waren gepackt.", "Die Koffer waren gepackt."], r: ["gs:pv4.r3"] },
          { q: "The door was locked.", a: ["Die Tür war abgeschlossen.", "Die Türe war abgeschlossen.", "Die Tür war zugeschlossen."], r: ["gs:pv4.r3"] },
          { q: "The plants were watered.", a: ["Die Pflanzen waren gegossen.", "Die Blumen waren gegossen."], r: ["gs:pv4.r3"] },
          { q: "The bills were paid.", a: ["Die Rechnungen waren bezahlt."], r: ["gs:pv4.r3"] },
          { q: "The fridge was empty and cleaned.", a: ["Der Kühlschrank war leer und geputzt.", "Der Kühlschrank war leer und gereinigt.", "Der Kühlschrank war leer und sauber gemacht."], r: ["gs:pv4.r3"] },
        ].map(it => ({ ...it, diag: [{ t: "swap", from: "^(wird|werden|wurde|wurden)$", to: "^(ist|sind|war|waren)$", rule: "gs:pv4.r3", msg: "This describes a state, the result: **{right}** + Partizip II. werden would say that someone is doing it now." }] })) },
        // ── Übung 25•25: which form? ──
        { id: "d25.25", ex: "25.25", t: "pick", title: "Which form?", how: "Pick the form that completes the sentence.", items: [
          { q: "Ich ___ von meinen Eltern abgeholt.", o: ["werde", "wird", "worden"], a: ["werde"], r: ["gs:pv1.r1"] },
          { q: "Das Haus ist 1950 gebaut ___.", o: ["worden", "geworden", "werden"], a: ["worden"], r: ["gs:pv3.trap"] },
          { q: "Die Pakete ___ gestern geliefert.", o: ["wurden", "wurde", "werden"], a: ["wurden"], r: ["gs:pv2.r1"] },
          { q: "Das muss heute noch erledigt ___.", o: ["werden", "worden", "wird"], a: ["werden"], r: ["gs:pv3.r2"] },
          { q: "Wir sind zum Essen eingeladen ___.", o: ["worden", "geworden", "wurden"], a: ["worden"], r: ["gs:pv3.r1"] },
          { q: "___ du schon gefragt worden?", o: ["Bist", "Hast", "Wirst"], a: ["Bist"], r: ["gs:pv3.r1"] },
          { q: "Das Lied wurde ___ einem Kinderchor gesungen.", o: ["von", "durch", "mit"], a: ["von"], r: ["gs:pv4.r1"] },
          { q: "Die Straße wurde ___ den Schnee blockiert.", o: ["durch", "von", "mit"], a: ["durch"], r: ["gs:pv4.r2"] },
          { q: "Die Kinder ___ von der Lehrerin gelobt.", o: ["wurden", "wurde", "worden"], a: ["wurden"], r: ["gs:pv2.r1"] },
          { q: "Morgen ___ die Heizung repariert.", o: ["wird", "wurde", "ist worden"], a: ["wird"], r: ["gs:pv1.r1"] },
          { q: "Es ist zu spät, die Post ___ schon geschlossen.", o: ["ist", "wird", "werden"], a: ["ist"], r: ["gs:pv4.r3"] },
          { q: "Das Formular kann online ausgefüllt ___.", o: ["werden", "worden", "wird"], a: ["werden"], r: ["gs:pv3.r2"] },
        ] },

        // ── Production ──
        { id: "dp.pv", t: "translate", end: true, title: "What happened?", how: "Translate: wird for what happens, wurde for the past, ist … worden for the Perfekt, ist + Partizip II for a state.", items: [
          { q: "My bike was stolen.", a: ["Mein Velo wurde gestohlen.", "Mein Fahrrad wurde gestohlen.", "Mein Velo ist gestohlen worden.", "Mein Fahrrad ist gestohlen worden."], r: ["gs:pv2.r2"] },
          { q: "The rubbish is collected on Tuesdays.", a: ["Der Müll wird am Dienstag abgeholt.", "Der Abfall wird am Dienstag abgeholt.", "Der Müll wird dienstags abgeholt.", "Der Abfall wird dienstags abgeholt.", "Am Dienstag wird der Müll abgeholt.", "Am Dienstag wird der Abfall abgeholt.", "Der Kehricht wird am Dienstag abgeholt.", "Der Kehricht wird dienstags abgeholt.", "Der Müll wird jeden Dienstag abgeholt.", "Der Abfall wird jeden Dienstag abgeholt."], r: ["gs:pv1.r1"] },
          { q: "The school was built in 1960.", a: ["Die Schule wurde 1960 gebaut.", "Die Schule ist 1960 gebaut worden.", "Die Schule wurde im Jahr 1960 gebaut."], r: ["gs:pv2.r2"] },
          { q: "The form must be signed.", a: ["Das Formular muss unterschrieben werden."], r: ["gs:pv3.r2"], vf: [["unterschreiben", "pvmod", "er"]] },
          { q: "We were invited by our neighbours.", a: ["Wir wurden von unseren Nachbarn eingeladen.", "Wir sind von unseren Nachbarn eingeladen worden."], r: ["gs:pv4.r1"] },
          { q: "The road was closed because of an accident.", a: ["Die Straße wurde wegen eines Unfalls gesperrt.", "Die Straße wurde wegen einem Unfall gesperrt.", "Die Straße ist wegen eines Unfalls gesperrt worden.", "Die Straße ist wegen einem Unfall gesperrt worden."], r: ["gs:pv2.r1"] },
          { q: "The shop is closed.", a: ["Das Geschäft ist geschlossen.", "Der Laden ist geschlossen.", "Das Geschäft ist zu.", "Der Laden ist zu."], r: ["gs:pv4.r3"] },
          { q: "The heating has been repaired.", a: ["Die Heizung ist repariert worden.", "Die Heizung wurde repariert."], r: ["gs:pv3.r1"] },
          { q: "The house was damaged by the storm.", a: ["Das Haus wurde durch den Sturm beschädigt.", "Das Haus ist durch den Sturm beschädigt worden.", "Das Haus wurde vom Sturm beschädigt.", "Das Haus ist vom Sturm beschädigt worden."], r: ["gs:pv4.r2"] },
          { q: "German is spoken here.", a: ["Hier wird Deutsch gesprochen.", "Deutsch wird hier gesprochen."], r: ["gs:pv1.r1"] },
          { q: "The tickets can be bought online.", a: ["Die Tickets können online gekauft werden.", "Die Billette können online gekauft werden.", "Die Karten können online gekauft werden."], r: ["gs:pv3.r2"] },
          { q: "The children were picked up at four.", a: ["Die Kinder wurden um vier abgeholt.", "Die Kinder wurden um vier Uhr abgeholt.", "Die Kinder sind um vier abgeholt worden.", "Die Kinder sind um vier Uhr abgeholt worden."], r: ["gs:pv2.r1"] },
        ] },
        { id: "dw.pv", t: "write", end: true, title: "Write your own", how: "Write in your own words, in the passive. It is saved for Claude to correct.", items: [
          { q: "Your town or village: what was built there, and when? What is being built now?", model: ["Unser Dorf wurde im 12. Jahrhundert gegründet. Die Kirche wurde 1650 gebaut. Zurzeit wird ein neues Schulhaus gebaut."], r: ["gs:pv2.r2"] },
          { q: "A dish from your country: how is it made?", model: ["Zuerst werden die Kartoffeln geschält und geschnitten. Dann werden sie in Öl gebraten. Am Schluss wird alles gesalzen und serviert."], r: ["gs:pv1.r1"] },
          { q: "Something that was stolen, broken or lost. What happened?", model: ["Letztes Jahr wurde mein Velo vor dem Bahnhof gestohlen. Es ist nie gefunden worden."], r: ["gs:pv3.r1"] },
          { q: "At work or at home: what must be done this week?", model: ["Diese Woche muss die Steuererklärung ausgefüllt werden. Die Wohnung muss geputzt werden, und die Rechnungen müssen bezahlt werden."], r: ["gs:pv3.r2"] },
          { q: "A festival in Switzerland: what is done on that day?", model: ["Am 1. August wird gefeiert. Am Abend wird Feuerwerk gezündet, und es werden Würste grilliert."], r: ["gs:pv1.r2"] },
          { q: "Before a trip: what is already done? (ist / sind + Partizip II)", model: ["Die Koffer sind gepackt. Das Hotel ist reserviert, und die Billette sind schon gekauft."], r: ["gs:pv4.r3"] },
          { q: "A storm or bad weather you remember. What was damaged?", model: ["Im Sommer gab es einen starken Sturm. Viele Bäume wurden durch den Wind umgeworfen, und unser Dach wurde beschädigt."], r: ["gs:pv4.r2"] },
          { q: "Who was your favourite teacher? What were you taught?", model: ["Wir wurden von Frau Rossi in Mathematik unterrichtet. Bei ihr wurde viel gelacht, aber auch viel gelernt."], r: ["gs:pv4.r1"] },
        ] },
      ],
    },
  },
});

// What chapter 25 became for this lesson (25•3, 25•10, 25•13, 25•14, 25•19,
// 25•23 and 25•24 are the man lesson's, 25•5 and 25•16 lassen's).
cxCover({
  "25.1": "d25.1", "25.2": "d25.2", "25.4": "d25.4", "25.6": "d25.6", "25.7": "d25.7", "25.8": "d25.8",
  "25.9": "d25.9", "25.11": "d25.11", "25.12": "d25.12", "25.17": "d25.17", "25.18": "d25.18",
  "25.20": "d25.20", "25.21": "d25.21", "25.22": "d25.22", "25.25": "d25.25",
  // sein … zu + infinitive (Das ist leicht zu finden) is the post-B1 passive's
  "25.15": { st: "planned", sec: "s4.pvx" },
});
cxJournal([
  { id: "w.done", th: "food", lv: "B1", de: "So wird es gemacht", t: "Explain how something is made or done, step by step — a dish from your country, a festival, or a job you know well. Say what is done, not who does it.", help: ["Zuerst wird …", "Dann werden die … geschnitten.", "Danach muss alles … werden.", "Am Schluss ist alles fertig."], sec: "s2.pv" },
]);
