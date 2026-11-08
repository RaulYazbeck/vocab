// ── COURSE PACK · Stage 1 · zu + infinitive · um … zu, ohne … zu, anstatt … zu ──
// Book: chapter 24's infinitive clauses — "Infinitive clauses" (Übung
// 24•5: a sentence becomes a zu-part · 24•6: with a prefix — anzurufen ·
// 24•8: Es ist schwierig, … zu … · 24•9: anstatt, ohne, um … zu),
// "Formation of infinitive clauses" (24•10 · 24•11: completing an es-
// sentence), "Verbs that introduce infinitive clauses" (24•12: versuchen,
// vergessen, anfangen … + zu), "Infinitive clauses as nouns" (24•13:
// finish a sentence two ways) and "Um zu" (24•14: write your own endings).
// Two sheets: zu + the infinitive at the end — zu inside a separable verb,
// never zu after a modal · um … zu, ohne … zu, anstatt … zu, and the
// zu-part first. 24•7 is skipped (see the cover below). The chapter's
// opening part — the double infinitive, habe … kaufen wollen (24•1–24•4) —
// is B1: it goes to the lesson on modals in the Perfekt (Session 7).
cxPack({
  id: "s1-zu",
  sections: {
    "s1.zu": {
      testout: { n: 8, miss: 1 },
      rules: {
        "zu.end": "zu + the infinitive close the sentence — the rest comes before",
        "zu.sep": "a separable verb takes zu inside, one word: anzurufen",
        "zu.verbs": "zu after versuchen, vergessen, anfangen, Lust haben, Es ist wichtig …",
        "zu.modal": "never zu after a modal or werden: Ich muss arbeiten.",
        "zu.um": "um … zu = in order to",
        "zu.ohne": "ohne … zu = without …ing",
        "zu.statt": "(an)statt … zu = instead of …ing",
        "zu.front": "the zu-part first: a comma, then the verb — Um … zu …, fahre ich",
      },
      sheets: [
        { id: "cx.zu1", title: "zu + the infinitive — at the end", qn: 3,
          struct: [["Es ist wichtig,", "pre"], ["…", "mid"], ["zu", "aux"], ["infinitive", "inf"]],
          why: "English *to* + a verb is **zu** + the infinitive — at the very **end**: Es ist wichtig, Deutsch **zu lernen**. Many verbs and phrases bring it; a modal never does.",
          rid: ["zu.end", "zu.sep", "zu.verbs", "zu.modal"],
          rules: [
            "**zu** + the infinitive **close** the sentence; whatever belongs to the verb comes before: Es ist wichtig, jeden Tag ein bisschen Deutsch **zu lernen**. (A comma before the zu-part is usual.)",
            "A **separable** verb takes zu **inside**, written as one word: an**zu**rufen · auf**zu**stehen · mit**zu**kommen · ein**zu**kaufen. An inseparable one doesn't: **zu** besuchen · **zu** verstehen · **zu** vergessen.",
            "What brings zu: **versuchen, vergessen, anfangen, aufhören, hoffen, vorhaben, versprechen** · **Lust / Zeit / Angst haben** · **Es ist wichtig / schwierig / schön / verboten, …**: Ich habe keine Zeit, ein**zu**kaufen.",
            "**Never zu after a modal** (or werden, or möchte): Ich **muss** heute **arbeiten** · Ich **werde** dich **anrufen** — but: Ich **versuche**, heute **zu arbeiten**.",
          ],
          table: { head: ["", "… zu + infinitive"], rows: [
            ["lernen", "Deutsch **zu lernen**"],
            ["anrufen", "dich an**zu**rufen"],
            ["verstehen", "das **zu verstehen**"],
            ["müssen", "Ich muss **arbeiten**. (no zu)"],
          ] },
          ex: [
            ["Es ist nicht leicht, hier eine Wohnung **zu finden**.", "It isn't easy to find a flat here."],
            ["Vergiss nicht, den Hauswart **anzurufen**!", "Don't forget to call the caretaker!"],
            ["Hast du Lust, am Sonntag **mitzukommen**?", "Do you feel like coming along on Sunday?"],
            ["Wir versuchen, zu Hause nur Deutsch **zu sprechen**.", "We try to speak only German at home."],
          ],
          trap: "zu goes **inside** a separable verb: an**zu**rufen — never ~~zu anrufen~~. And after a modal there's no zu at all: Ich kann **kommen** — never ~~Ich kann zu kommen~~.",
          quiz: [
            { at: "r1", k: "pick", q: "Es ist wichtig, ___.", o: ["Deutsch zu lernen", "zu lernen Deutsch", "zu Deutsch lernen"], a: 0, why: "zu + the infinitive at the very end." },
            { at: "r1", k: "order", q: "Build it: It's difficult to understand the dialect.", a: ["Es ist schwierig,", "den Dialekt", "zu", "verstehen."], why: "The rest first, zu + the infinitive last." },
            { at: "r2", k: "pick", q: "Vergiss nicht, mich ___!", o: ["anzurufen", "zu anrufen", "anrufen"], a: 0, why: "A separable verb: zu inside — **anzurufen**." },
            { at: "r2", k: "type", cx: true, q: "(aufstehen) Es ist schwer, um fünf ___.", a: ["aufzustehen"], r: ["zu.sep"], why: "auf**zu**stehen — one word." },
            { at: "r2", k: "pick", q: "Es ist nicht leicht, alles ___.", o: ["zu verstehen", "verzustehen"], a: 0, why: "ver- is inseparable: **zu verstehen**." },
            { at: "r3", k: "pick", q: "Ich habe keine Zeit, ___.", o: ["einzukaufen", "einkaufen", "kaufe ein"], a: 0, why: "keine Zeit haben + **zu**." },
            { at: "r3", k: "pick", q: "Wir versuchen, pünktlich ___.", o: ["zu sein", "sein", "sind"], a: 0, why: "versuchen + **zu**." },
            { at: "r4", k: "pick", q: "Ich muss heute länger ___.", o: ["arbeiten", "zu arbeiten"], a: 0, why: "After a modal: **no zu**." },
            { at: "r4", k: "pick", q: "Ich werde dich morgen ___.", o: ["anrufen", "anzurufen"], a: 0, why: "After werden: **no zu**." },
            { at: "table", k: "pick", q: "mitkommen → with zu:", o: ["mitzukommen", "zu mitkommen", "mit zu kommen"], a: 0, why: "**mitzukommen** — one word." },
            { at: "trap", k: "pick", q: "Which is right?", o: ["Ich kann heute kommen.", "Ich kann heute zu kommen."], a: 0, why: "No zu after a modal." },
          ] },
        { id: "cx.zu2", title: "um … zu, ohne … zu, anstatt … zu", qn: 3,
          struct: [[", um · ohne · anstatt", "pre"], ["…", "mid"], ["zu", "aux"], ["infinitive", "inf"]],
          why: "Three words give a zu-part a meaning: **um … zu** *in order to*, **ohne … zu** *without …ing*, **anstatt … zu** *instead of …ing*. It can also come first.",
          rid: ["zu.um", "zu.ohne", "zu.statt", "zu.front"],
          rules: [
            "**um … zu** = *in order to* — why you do it: Ich lerne Deutsch, **um** eine bessere Stelle **zu finden**. (*Why?* — **Um** Geld **zu sparen**.)",
            "**ohne … zu** = *without …ing*: Er ist gegangen, **ohne** tschüss **zu sagen**. · Sie hat unterschrieben, **ohne** den Vertrag **zu lesen**.",
            "**anstatt … zu** (or **statt … zu**) = *instead of …ing*: Ich gehe zu Fuß, **anstatt** den Bus **zu nehmen**.",
            "The zu-part can come **first** — it takes the first place, so after its comma comes the **verb**, then the subject: **Um Geld zu sparen, fahre ich** Velo. · **Ohne zu fragen, hat er** mein Velo genommen.",
          ],
          table: { head: ["", "…, + … zu + infinitive"], rows: [
            ["um", "…, **um** Geld **zu sparen**."],
            ["ohne", "…, **ohne** tschüss **zu sagen**."],
            ["anstatt", "…, **anstatt** den Bus **zu nehmen**."],
          ] },
          ex: [
            ["Wir stehen früh auf, **um** den ersten Zug **zu nehmen**.", "We get up early to catch the first train."],
            ["Tom hat mein Velo genommen, **ohne** mich **zu fragen**.", "Tom took my bike without asking me."],
            ["**Anstatt** fernzusehen, lese ich ein Buch.", "Instead of watching TV, I read a book."],
            ["**Um** besser Deutsch **zu sprechen**, rede ich viel mit den Nachbarn.", "To speak better German, I talk a lot with the neighbours."],
          ],
          trap: "*in order to* needs **um** — not ~~für zu~~: …, **um** Geld **zu sparen**. And with the zu-part first, the verb comes right after the comma: Um Geld zu sparen, **fahre ich** — never ~~Um Geld zu sparen, ich fahre~~.",
          quiz: [
            { at: "r1", k: "pick", q: "Ich spare, ___ ein Auto zu kaufen.", o: ["um", "für", "ohne"], a: 0, why: "*in order to*: **um … zu**." },
            { at: "r1", k: "type", cx: true, q: "Warum fährst du Velo? — ___ Geld zu sparen.", a: ["Um"], r: ["zu.um"], why: "**Um** … zu." },
            { at: "r2", k: "pick", q: "He left without saying goodbye:", o: ["Er ist gegangen, ohne tschüss zu sagen.", "Er ist gegangen, ohne tschüss sagen.", "Er ist gegangen, ohne zu tschüss sagen."], a: 0, why: "**ohne** … **zu** + the infinitive last." },
            { at: "r2", k: "pick", q: "Sie unterschreibt, ___ den Vertrag zu lesen.", o: ["ohne", "um", "anstatt"], a: 0, why: "*without reading*: **ohne … zu**." },
            { at: "r3", k: "pick", q: "Ich gehe zu Fuß, ___ den Bus zu nehmen.", o: ["anstatt", "um", "ohne"], a: 0, why: "*instead of*: **anstatt … zu**." },
            { at: "r3", k: "pick", q: "instead of watching TV:", o: ["anstatt fernzusehen", "anstatt zu fernsehen", "anstatt fernsehen"], a: 0, why: "anstatt + **fernzusehen** (zu inside)." },
            { at: "r4", k: "pick", q: "Um Geld zu sparen, ___.", o: ["fahre ich Velo", "ich fahre Velo"], a: 0, why: "The zu-part first: the verb right after the comma." },
            { at: "r4", k: "order", q: "Build it: Instead of calling, I write an e-mail.", a: ["Anstatt anzurufen,", "schreibe", "ich", "eine E-Mail."], why: "The zu-part first, then the verb, then the subject." },
            { at: "table", k: "pick", q: "…, ___ Geld zu sparen. (in order to)", o: ["um", "für", "damit"], a: 0, why: "**um … zu**." },
            { at: "trap", k: "pick", q: "Which is right?", o: ["Um Deutsch zu lernen, besuche ich einen Kurs.", "Um Deutsch zu lernen, ich besuche einen Kurs.", "Für Deutsch zu lernen, besuche ich einen Kurs."], a: 0, why: "um … zu, then the verb first after the comma." },
          ] },
      ],
      diag: [
        // (the answer's an-zu-rufen word is what's missing — written apart, zu before it, or no zu:
        // a detector on that word alone, so «um zu Hause», «fängt an zu regnen» never set it off)
        { t: "missing", tok: "^(an|auf|aus|ein|mit|ab|vor|zuruck|um|weg|los|fern|kennen|wieder|nach|zusammen|hin|her)zu\\w+$", rule: "zu.sep", msg: "A separable verb takes zu **inside**, written as one word: an**zu**rufen, auf**zu**stehen — not zu anrufen, not an zu rufen." },
        { t: "swap", from: "^\\w+zu\\w+(en|n)$", to: "^(an|auf|aus|ein|mit|ab|vor|zuruck|um|weg|los|fern|kennen)\\w{3,}(en|n)$", rule: "zu.modal", hard: true, msg: "No zu after a modal or werden: **{right}**." },
        { t: "extra", tok: "^zu$", rule: "zu.modal", msg: "No zu after a modal, werden or möchte — just the infinitive: Ich muss **arbeiten**." },
        { t: "swap", from: "^(fur|damit|zum)$", to: "^um$", rule: "zu.um", msg: "*in order to* is **um … zu**: …, **um** Geld zu sparen." },
        { t: "missing", tok: "^um$", rule: "zu.um", msg: "*in order to* needs **um** at the start: …, **um** … zu + the infinitive." },
        { t: "missing", tok: "^zu$", rule: "", msg: "It needs **zu**, right before the infinitive: … Deutsch **zu** lernen." },
        { t: "pos", tok: "^zu$", rule: "zu.end", msg: "zu + the infinitive go to the very end — zu goes {where}." },
      ],
      drills: [
        // ── Übung 24•5: a sentence becomes a zu-part ──
        { id: "d24.5", ex: "24.5", t: "transform", title: "… zu + infinitive", how: "Make it a zu-part: the subject goes, the verb becomes zu + the infinitive, at the end.", items: [
          { q: "Wir lernen eine neue Sprache.", a: ["eine neue Sprache zu lernen"], r: ["zu.end"] },
          { q: "Ich gebe dir zehn Franken.", a: ["dir zehn Franken zu geben"], r: ["zu.end"] },
          { q: "Er bringt den Gästen einen Kaffee.", a: ["den Gästen einen Kaffee zu bringen"], r: ["zu.end"] },
          { q: "Du wartest an der Haltestelle.", a: ["an der Haltestelle zu warten"], r: ["zu.end"] },
          { q: "Ich habe mehr Zeit für meine Familie.", a: ["mehr Zeit für meine Familie zu haben"], r: ["zu.end"] },
          { q: "Wir helfen den Nachbarn beim Umzug.", a: ["den Nachbarn beim Umzug zu helfen"], r: ["zu.end"] },
          { q: "Ich arbeite in einem Spital.", a: ["in einem Spital zu arbeiten"], r: ["zu.end"] },
          { q: "Er spricht langsam und deutlich.", a: ["langsam und deutlich zu sprechen"], r: ["zu.end"] },
          { q: "Ich bin immer pünktlich.", a: ["immer pünktlich zu sein"], r: ["zu.end"] },
          { q: "Sie trinkt jeden Tag zwei Liter Wasser.", a: ["jeden Tag zwei Liter Wasser zu trinken"], r: ["zu.end"] },
          { q: "Wir kochen am Abend zusammen.", a: ["am Abend zusammen zu kochen"], r: ["zu.end"] },
        ] },
        // ── Übung 24•6: with a prefix ──
        { id: "d24.6", ex: "24.6", t: "transform", title: "anzurufen · zu verstehen", how: "Make it a zu-part — a separable verb takes zu inside: anzurufen.", items: [
          { q: "Wir besuchen am Samstag die Großeltern.", a: ["am Samstag die Großeltern zu besuchen"], r: ["zu.sep"] },
          { q: "Er vergisst das Passwort.", a: ["das Passwort zu vergessen"], r: ["zu.sep"] },
          { q: "Der Zug kommt um acht Uhr an.", a: ["um acht Uhr anzukommen"], r: ["zu.sep"] },
          { q: "Sie ziehen sich schnell um.", a: ["sich schnell umzuziehen"], r: ["zu.sep"] },
          { q: "Ihr kommt bald zurück.", a: ["bald zurückzukommen"], r: ["zu.sep"] },
          { q: "Ich empfehle das Restaurant.", a: ["das Restaurant zu empfehlen"], r: ["zu.sep"] },
          { q: "Sie bringt einen Kuchen mit.", a: ["einen Kuchen mitzubringen"], r: ["zu.sep"] },
          { q: "Er verkauft sein altes Velo.", a: ["sein altes Velo zu verkaufen"], r: ["zu.sep"] },
          { q: "Ich stelle meine Kollegin vor.", a: ["meine Kollegin vorzustellen"], r: ["zu.sep"] },
          { q: "Wir steigen am Bellevue aus.", a: ["am Bellevue auszusteigen"], r: ["zu.sep"] },
          { q: "Du rufst den Hauswart an.", a: ["den Hauswart anzurufen"], r: ["zu.sep"] },
          { q: "Ich räume die Küche auf.", a: ["die Küche aufzuräumen"], r: ["zu.sep"] },
          { q: "Er versteht die Frage nicht.", a: ["die Frage nicht zu verstehen"], r: ["zu.sep"] },
        ] },
        // ── our own: zu or not? ──
        { id: "dzu.modal", t: "pick", title: "zu or not?", how: "Pick: after a modal or werden no zu · after versuchen, vergessen, Lust haben, Es ist … : zu.", items: [
          { q: "Ich muss morgen früh ___.", o: ["aufstehen", "aufzustehen"], a: ["aufstehen"], r: ["zu.modal"] },
          { q: "Ich versuche, morgen früh ___.", o: ["aufzustehen", "aufstehen", "zu aufstehen"], a: ["aufzustehen"], r: ["zu.sep"] },
          { q: "Wir können leider nicht ___.", o: ["kommen", "zu kommen"], a: ["kommen"], r: ["zu.modal"] },
          { q: "Hast du Lust, ins Kino ___?", o: ["zu gehen", "gehen"], a: ["zu gehen"], r: ["zu.verbs"] },
          { q: "Du darfst hier nicht ___.", o: ["rauchen", "zu rauchen"], a: ["rauchen"], r: ["zu.modal"] },
          { q: "Es ist verboten, hier ___.", o: ["zu rauchen", "rauchen"], a: ["zu rauchen"], r: ["zu.verbs"] },
          { q: "Ich werde dich morgen ___.", o: ["anrufen", "anzurufen"], a: ["anrufen"], r: ["zu.modal"] },
          { q: "Vergiss nicht, mich ___!", o: ["anzurufen", "zu anrufen", "anrufen"], a: ["anzurufen"], r: ["zu.sep"] },
          { q: "Er will heute nicht ___.", o: ["mitkommen", "mitzukommen"], a: ["mitkommen"], r: ["zu.modal"] },
          { q: "Hör bitte auf, so laut ___!", o: ["zu singen", "singen"], a: ["zu singen"], r: ["zu.verbs"] },
          { q: "Möchtest du etwas ___?", o: ["trinken", "zu trinken"], a: ["trinken"], r: ["zu.modal"] },
          { q: "Ich habe heute keine Zeit, ___.", o: ["einzukaufen", "einkaufen", "zu einkaufen"], a: ["einzukaufen"], r: ["zu.sep"] },
        ] },
        // ── Übung 24•8: Es ist schwierig, … / Ist es leicht, …? ──
        { id: "d24.8", ex: "24.8", t: "transform", title: "Es ist schwierig, …", how: "Make the sentence in brackets the zu-part — its subject goes.", items: [
          { q: "Es ist schwierig, ___. (Ich finde eine Wohnung in Zürich.)", a: ["Es ist schwierig, eine Wohnung in Zürich zu finden."], r: ["zu.verbs"] },
          { q: "Es ist schwierig, ___. (Man versteht den Dialekt.)", a: ["Es ist schwierig, den Dialekt zu verstehen."], r: ["zu.verbs"] },
          { q: "Es ist schwierig, ___. (Wir parken in der Altstadt.)", a: ["Es ist schwierig, in der Altstadt zu parken."], r: ["zu.end"] },
          { q: "Es ist schwierig, ___. (Ich stehe um fünf Uhr auf.)", a: ["Es ist schwierig, um fünf Uhr aufzustehen."], r: ["zu.sep"] },
          { q: "Es ist schwierig, ___. (Er lernt ohne Lehrer.)", a: ["Es ist schwierig, ohne Lehrer zu lernen."], r: ["zu.end"] },
          { q: "Ist es leicht, ___? (Man bekommt einen Termin beim Arzt.)", a: ["Ist es leicht, einen Termin beim Arzt zu bekommen?"], r: ["zu.verbs"] },
          { q: "Ist es leicht, ___? (Du findest eine Stelle.)", a: ["Ist es leicht, eine Stelle zu finden?"], r: ["zu.verbs"] },
          { q: "Ist es leicht, ___? (Ihr wechselt die Krankenkasse.)", a: ["Ist es leicht, die Krankenkasse zu wechseln?"], r: ["zu.end"] },
          { q: "Ist es leicht, ___? (Man trennt den Abfall richtig.)", a: ["Ist es leicht, den Abfall richtig zu trennen?"], r: ["zu.end"] },
          { q: "Ist es leicht, ___? (Sie ist Lehrerin.)", a: ["Ist es leicht, Lehrerin zu sein?"], r: ["zu.end"] },
        ] },
        // ── Übung 24•10: it's healthy, necessary, forbidden … ──
        { id: "d24.10", ex: "24.10", t: "transform", title: "Es ist gesund, notwendig, verboten …", how: "Finish the sentence with the one in brackets as a zu-part (man → sich where it's reflexive).", items: [
          { q: "Es ist sehr gesund, ___. (Ich gehe jeden Tag spazieren.)", a: ["Es ist sehr gesund, jeden Tag spazieren zu gehen."], r: ["zu.verbs"] },
          { q: "Es ist sehr gesund, ___. (Man isst viel Gemüse.)", a: ["Es ist sehr gesund, viel Gemüse zu essen."], r: ["zu.verbs"] },
          { q: "Es ist sehr gesund, ___. (Wir fahren mit dem Velo zur Arbeit.)", a: ["Es ist sehr gesund, mit dem Velo zur Arbeit zu fahren."], r: ["zu.end"] },
          { q: "Es ist notwendig, ___. (Man meldet sich in der Gemeinde an.)", a: ["Es ist notwendig, sich in der Gemeinde anzumelden."], r: ["zu.sep"] },
          { q: "Es ist notwendig, ___. (Wir lesen den Vertrag genau.)", a: ["Es ist notwendig, den Vertrag genau zu lesen."], r: ["zu.end"] },
          { q: "Es ist notwendig, ___. (Sie bringen den Pass mit.)", a: ["Es ist notwendig, den Pass mitzubringen."], r: ["zu.sep"] },
          { q: "Es ist verboten, ___. (Man fährt hier schneller als 30.)", a: ["Es ist verboten, hier schneller als 30 zu fahren."], r: ["zu.end"] },
          { q: "Es ist verboten, ___. (Ihr spielt im Treppenhaus.)", a: ["Es ist verboten, im Treppenhaus zu spielen."], r: ["zu.verbs"] },
          { q: "Es ist verboten, ___. (Du wirfst Glas in den Abfall.)", a: ["Es ist verboten, Glas in den Abfall zu werfen."], r: ["zu.end"] },
          { q: "Es ist nicht möglich, ___. (Wir bezahlen mit Karte.)", a: ["Es ist nicht möglich, mit Karte zu bezahlen."], r: ["zu.verbs"] },
          { q: "Es ist nicht möglich, ___. (Ich komme vor acht Uhr.)", a: ["Es ist nicht möglich, vor acht Uhr zu kommen."], r: ["zu.end"] },
        ] },
        // ── Übung 24•11: it was a pity, a good idea, kind of you … ──
        { id: "d24.11", ex: "24.11", t: "transform", title: "Es war schade, … · eine gute Idee, …", how: "Finish the sentence with the one in brackets as a zu-part — zu + the infinitive at the end.", items: [
          { q: "Es war schade, ___. (Wir verpassen den letzten Zug.)", a: ["Es war schade, den letzten Zug zu verpassen."], r: ["zu.end"] },
          { q: "Es war schade, ___. (Ich sehe dich nur so kurz.)", a: ["Es war schade, dich nur so kurz zu sehen."], r: ["zu.end"] },
          { q: "Es war schade, ___. (Wir verlassen Lugano.)", a: ["Es war schade, Lugano zu verlassen."], r: ["zu.end"] },
          { q: "Es war eine gute Idee, ___. (Wir nehmen den Zug.)", a: ["Es war eine gute Idee, den Zug zu nehmen."], r: ["zu.verbs"] },
          { q: "Es war eine gute Idee, ___. (Ich rufe dich vorher an.)", a: ["Es war eine gute Idee, dich vorher anzurufen."], r: ["zu.sep"] },
          { q: "Es war eine gute Idee, ___. (Wir reservieren einen Tisch.)", a: ["Es war eine gute Idee, einen Tisch zu reservieren."], r: ["zu.verbs"] },
          { q: "Es war eine gute Idee, ___. (Sie macht einen Deutschkurs.)", a: ["Es war eine gute Idee, einen Deutschkurs zu machen."], r: ["zu.verbs"] },
          { q: "Es war nett von dir, ___. (Du hilfst mir.)", a: ["Es war nett von dir, mir zu helfen."], r: ["zu.end"] },
          { q: "Es war nett von dir, ___. (Du holst uns am Bahnhof ab.)", a: ["Es war nett von dir, uns am Bahnhof abzuholen."], r: ["zu.sep"] },
          { q: "Es war nett von Ihnen, ___. (Sie zeigen mir den Weg.)", a: ["Es war nett von Ihnen, mir den Weg zu zeigen."], r: ["zu.end"] },
          { q: "Es war ein Fehler, ___. (Ich vergesse den Schirm.)", a: ["Es war ein Fehler, den Schirm zu vergessen."], r: ["zu.end"] },
        ] },
        // ── Übung 24•12: versuchen, vergessen … + zu ──
        { id: "d24.12", ex: "24.12", t: "transform", title: "Ich versuche, …", how: "Make one sentence: the second becomes a zu-part after the first.", items: [
          { q: "Ich vergesse oft. Ich trinke genug Wasser.", a: ["Ich vergesse oft, genug Wasser zu trinken."], r: ["zu.verbs"] },
          { q: "Wir versuchen. Wir sprechen nur Deutsch.", a: ["Wir versuchen, nur Deutsch zu sprechen."], r: ["zu.verbs"] },
          { q: "Meine Eltern hoffen. Sie besuchen uns im Sommer.", a: ["Meine Eltern hoffen, uns im Sommer zu besuchen."], r: ["zu.verbs"] },
          { q: "Du musst aufhören. Du arbeitest so viel.", a: ["Du musst aufhören, so viel zu arbeiten."], r: ["zu.verbs"] },
          { q: "Es fängt an. Es regnet.", a: ["Es fängt an zu regnen.", "Es fängt an, zu regnen."], r: ["zu.verbs"] },
          { q: "Ich habe keine Lust. Ich putze das Bad.", a: ["Ich habe keine Lust, das Bad zu putzen."], r: ["zu.verbs"] },
          { q: "Lea hat keine Zeit. Lea kauft ein.", a: ["Lea hat keine Zeit einzukaufen.", "Lea hat keine Zeit, einzukaufen."], r: ["zu.sep"], cap: true },
          { q: "Wir haben vor. Wir ziehen nach Bern um.", a: ["Wir haben vor, nach Bern umzuziehen."], r: ["zu.sep"] },
          { q: "Vergiss nicht! Du schließt die Tür ab.", a: ["Vergiss nicht, die Tür abzuschließen!"], r: ["zu.sep"] },
          { q: "Herr Graf beginnt. Er lernt Italienisch.", a: ["Herr Graf beginnt, Italienisch zu lernen."], r: ["zu.verbs"], cap: true },
          { q: "Ich verspreche dir. Ich bin pünktlich.", a: ["Ich verspreche dir, pünktlich zu sein."], r: ["zu.verbs"] },
        ] },
        // ── Übung 24•9: anstatt, ohne, um … zu ──
        { id: "d24.9", ex: "24.9", t: "transform", title: "anstatt … zu, ohne … zu, um … zu", how: "Finish the sentence with the one in brackets — after anstatt, ohne or um, as a zu-part.", items: [
          { q: "Tom sitzt einfach da, anstatt ___. (Er hilft uns.)", a: ["Tom sitzt einfach da, anstatt uns zu helfen."], r: ["zu.statt"] },
          { q: "Tom sitzt einfach da, anstatt ___. (Er räumt sein Zimmer auf.)", a: ["Tom sitzt einfach da, anstatt sein Zimmer aufzuräumen."], r: ["zu.statt", "zu.sep"] },
          { q: "Tom sitzt einfach da, anstatt ___. (Er lernt für die Prüfung.)", a: ["Tom sitzt einfach da, anstatt für die Prüfung zu lernen."], r: ["zu.statt"] },
          { q: "Sie ist gegangen, ohne ___. (Sie sagt tschüss.)", a: ["Sie ist gegangen, ohne tschüss zu sagen."], r: ["zu.ohne"] },
          { q: "Sie ist gegangen, ohne ___. (Sie bezahlt den Kaffee.)", a: ["Sie ist gegangen, ohne den Kaffee zu bezahlen."], r: ["zu.ohne"] },
          { q: "Sie ist gegangen, ohne ___. (Sie schließt die Tür.)", a: ["Sie ist gegangen, ohne die Tür zu schließen."], r: ["zu.ohne"] },
          { q: "Wir sind in die Schweiz gekommen, um ___. (Wir arbeiten hier.)", a: ["Wir sind in die Schweiz gekommen, um hier zu arbeiten."], r: ["zu.um"] },
          { q: "Wir sind in die Schweiz gekommen, um ___. (Wir leben näher bei der Familie.)", a: ["Wir sind in die Schweiz gekommen, um näher bei der Familie zu leben."], r: ["zu.um"] },
          { q: "Wir sind in die Schweiz gekommen, um ___. (Wir lernen eine neue Sprache.)", a: ["Wir sind in die Schweiz gekommen, um eine neue Sprache zu lernen."], r: ["zu.um"] },
          { q: "Du bist jetzt alt genug, um ___. (Du fährst allein Zug.)", a: ["Du bist jetzt alt genug, um allein Zug zu fahren."], r: ["zu.um"] },
          { q: "Du bist jetzt alt genug, um ___. (Du kochst dein Essen selbst.)", a: ["Du bist jetzt alt genug, um dein Essen selbst zu kochen."], r: ["zu.um"] },
          { q: "Du bist jetzt alt genug, um ___. (Du bleibst allein zu Hause.)", a: ["Du bist jetzt alt genug, um allein zu Hause zu bleiben."], r: ["zu.um"] },
        ] },
        // ── our own: why? — um … zu ──
        { id: "dzu.um", t: "answer", title: "Why? — um … zu", how: "Answer with um … zu — the words in brackets are the reason.", items: [
          { q: "Warum lernst du Deutsch? (die Prüfung bestehen)", a: ["Ich lerne Deutsch, um die Prüfung zu bestehen.", "Um die Prüfung zu bestehen."], r: ["zu.um"] },
          { q: "Warum fährst du mit dem Velo? (Geld sparen)", a: ["Ich fahre mit dem Velo, um Geld zu sparen.", "Um Geld zu sparen."], r: ["zu.um"] },
          { q: "Warum gehst du zur Gemeinde? (mich anmelden)", a: ["Ich gehe zur Gemeinde, um mich anzumelden.", "Um mich anzumelden."], r: ["zu.um", "zu.sep"] },
          { q: "Warum steht ihr so früh auf? (den ersten Zug nehmen)", a: ["Wir stehen so früh auf, um den ersten Zug zu nehmen.", "Um den ersten Zug zu nehmen."], r: ["zu.um"] },
          { q: "Warum braucht Lea einen Laptop? (zu Hause arbeiten)", a: ["Lea braucht einen Laptop, um zu Hause zu arbeiten.", "Sie braucht einen Laptop, um zu Hause zu arbeiten.", "Um zu Hause zu arbeiten."], r: ["zu.um"] },
          { q: "Warum geht Tom in die Migros? (Milch kaufen)", a: ["Tom geht in die Migros, um Milch zu kaufen.", "Er geht in die Migros, um Milch zu kaufen.", "Um Milch zu kaufen."], r: ["zu.um"] },
          { q: "Warum rufst du den Hauswart an? (einen Termin vereinbaren)", a: ["Ich rufe den Hauswart an, um einen Termin zu vereinbaren.", "Um einen Termin zu vereinbaren."], r: ["zu.um"] },
          { q: "Warum spart ihr? (ein Auto kaufen)", a: ["Wir sparen, um ein Auto zu kaufen.", "Um ein Auto zu kaufen."], r: ["zu.um"] },
          { q: "Warum geht ihr in den Park? (Fußball spielen)", a: ["Wir gehen in den Park, um Fußball zu spielen.", "Um Fußball zu spielen."], r: ["zu.um"] },
          { q: "Warum nimmst du einen Schirm mit? (nicht nass werden)", a: ["Ich nehme einen Schirm mit, um nicht nass zu werden.", "Um nicht nass zu werden."], r: ["zu.um"] },
        ] },
        // ── our own: the zu-part first ──
        { id: "dzu.front", t: "transform", fixed: true, title: "The zu-part first", how: "Start with the zu-part — after its comma, the verb, then the subject.", items: [
          { q: "Ich fahre Velo, um Geld zu sparen.", a: ["Um Geld zu sparen, fahre ich Velo."], r: ["zu.front"] },
          { q: "Wir stehen früh auf, um den Zug nicht zu verpassen.", a: ["Um den Zug nicht zu verpassen, stehen wir früh auf."], r: ["zu.front"] },
          { q: "Er hat die Wohnung verlassen, ohne das Licht auszumachen.", a: ["Ohne das Licht auszumachen, hat er die Wohnung verlassen."], r: ["zu.front"] },
          { q: "Sie lernt jeden Abend, um die Prüfung zu bestehen.", a: ["Um die Prüfung zu bestehen, lernt sie jeden Abend."], r: ["zu.front"] },
          { q: "Ich schreibe eine E-Mail, anstatt anzurufen.", a: ["Anstatt anzurufen, schreibe ich eine E-Mail."], r: ["zu.front"] },
          { q: "Wir nehmen das Tram, um schneller zu sein.", a: ["Um schneller zu sein, nehmen wir das Tram."], r: ["zu.front"] },
          { q: "Tom isst sein Sandwich, ohne aufzuschauen.", a: ["Ohne aufzuschauen, isst Tom sein Sandwich."], r: ["zu.front"] },
          { q: "Ich gehe zu Fuß, anstatt den Bus zu nehmen.", a: ["Anstatt den Bus zu nehmen, gehe ich zu Fuß."], r: ["zu.front"] },
          { q: "Man muss sich anmelden, um mitzumachen.", a: ["Um mitzumachen, muss man sich anmelden."], r: ["zu.front"] },
          { q: "Die Kinder rennen nach Hause, um den Film zu sehen.", a: ["Um den Film zu sehen, rennen die Kinder nach Hause."], r: ["zu.front"] },
        ].map(it => ({ ...it, diag: [{ t: "pos", tok: "^(ich|du|er|sie|es|wir|ihr|man|tom|die)$", rule: "zu.front", msg: "The zu-part takes the first place: after its comma comes the **verb**, then the subject." }] })) },
        // ── Production ──
        { id: "dp.zu", t: "translate", end: true, title: "Say it in German", how: "Translate — zu + the infinitive at the end (inside a separable verb); no zu after a modal.", items: [
          { q: "It's important to be on time.", a: ["Es ist wichtig, pünktlich zu sein."], r: ["zu.verbs"] },
          { q: "I'm trying to speak German every day.", a: ["Ich versuche, jeden Tag Deutsch zu sprechen."], r: ["zu.verbs"] },
          { q: "Don't forget to call me! (du)", a: ["Vergiss nicht, mich anzurufen!"], r: ["zu.sep"] },
          { q: "We have no time to go shopping.", a: ["Wir haben keine Zeit einzukaufen.", "Wir haben keine Zeit, einzukaufen.", "Wir haben keine Zeit zum Einkaufen."], r: ["zu.sep"] },
          { q: "Do you feel like coming along? (du)", a: ["Hast du Lust mitzukommen?", "Hast du Lust, mitzukommen?"], r: ["zu.sep"] },
          { q: "I'm learning German in order to find a better job.", a: ["Ich lerne Deutsch, um eine bessere Stelle zu finden.", "Ich lerne Deutsch, um einen besseren Job zu finden.", "Ich lerne Deutsch, um eine bessere Arbeit zu finden."], r: ["zu.um"] },
          { q: "He left without saying goodbye.", a: ["Er ist gegangen, ohne tschüss zu sagen.", "Er ist gegangen, ohne sich zu verabschieden.", "Er ist gegangen, ohne auf Wiedersehen zu sagen.", "Er ging, ohne tschüss zu sagen.", "Er ging, ohne sich zu verabschieden."], r: ["zu.ohne"] },
          { q: "Instead of taking the bus, I walk.", a: ["Anstatt den Bus zu nehmen, gehe ich zu Fuß.", "Statt den Bus zu nehmen, gehe ich zu Fuß.", "Ich gehe zu Fuß, anstatt den Bus zu nehmen."], r: ["zu.statt", "zu.front"] },
          { q: "It's starting to rain.", a: ["Es fängt an zu regnen.", "Es beginnt zu regnen."], r: ["zu.verbs"] },
          { q: "I have to work tomorrow.", a: ["Ich muss morgen arbeiten.", "Morgen muss ich arbeiten."], r: ["zu.modal"] },
          { q: "Is it difficult to find a flat here?", a: ["Ist es schwierig, hier eine Wohnung zu finden?", "Ist es schwer, hier eine Wohnung zu finden?"], r: ["zu.verbs"] },
          { q: "Stop talking so loudly! (ihr)", a: ["Hört auf, so laut zu reden!", "Hört auf, so laut zu sprechen!"], r: ["zu.verbs"] },
          { q: "To save money, we cook at home.", a: ["Um Geld zu sparen, kochen wir zu Hause.", "Wir kochen zu Hause, um Geld zu sparen."], r: ["zu.um", "zu.front"] },
        ] },
        // ── Übung 24•13: finish it two ways ──
        { id: "d24.13", ex: "24.13", t: "write", end: true, title: "Finish it two ways", how: "Finish each sentence twice, with your own zu-parts — saved for Claude to correct.", items: [
          { q: "___ ist nicht leicht. (two ways — the zu-part first)", model: ["Eine Wohnung in Zürich zu finden ist nicht leicht. Jeden Morgen um fünf aufzustehen ist nicht leicht."], r: ["zu.end"] },
          { q: "Es ist wichtig, ___ (two things for life in Switzerland)", model: ["Es ist wichtig, pünktlich zu sein. Es ist auch wichtig, den Abfall richtig zu trennen."], r: ["zu.verbs"] },
          { q: "Mein Freund hat mir versprochen, ___ (two promises)", model: ["Mein Freund hat mir versprochen, beim Umzug zu helfen. Er hat auch versprochen, die Getränke mitzubringen."], r: ["zu.verbs", "zu.sep"] },
          { q: "Meine Tochter träumt davon, ___ (two dreams)", model: ["Meine Tochter träumt davon, Tierärztin zu werden. Sie träumt auch davon, einen Hund zu haben."], r: ["zu.end"] },
          { q: "Ich freue mich darauf, ___ (two things you look forward to)", model: ["Ich freue mich darauf, meine Familie wiederzusehen. Ich freue mich auch darauf, im Sommer am See zu baden."], r: ["zu.sep"] },
          { q: "Ich habe keine Lust, ___ (two things)", model: ["Ich habe keine Lust, heute zu kochen. Ich habe auch keine Lust, die Wäsche zu bügeln."], r: ["zu.verbs"] },
          { q: "Ich versuche jeden Tag, ___ (two habits)", model: ["Ich versuche jeden Tag, zwanzig Minuten Deutsch zu lernen. Ich versuche auch, früh ins Bett zu gehen."], r: ["zu.verbs"] },
          { q: "Hast du Zeit, ___? (two invitations)", model: ["Hast du am Samstag Zeit, mit uns zu wandern? Hast du Zeit, morgen einen Kaffee zu trinken?"], r: ["zu.verbs"] },
        ] },
        // ── Übung 24•14: your own endings — um, ohne, anstatt ──
        { id: "d24.14", ex: "24.14", t: "write", end: true, title: "Write your own endings", how: "Finish each sentence your way, with a zu-part — saved for Claude to correct.", items: [
          { q: "Mein Sohn spielt den ganzen Tag am Handy, anstatt … (three endings)", model: ["…, anstatt seine Hausaufgaben zu machen. · …, anstatt draußen zu spielen. · …, anstatt sein Zimmer aufzuräumen."], r: ["zu.statt"] },
          { q: "Unser Nachbar ist ausgezogen, ohne … (three endings)", model: ["…, ohne tschüss zu sagen. · …, ohne den Keller zu putzen. · …, ohne uns seine neue Adresse zu geben."], r: ["zu.ohne"] },
          { q: "Ich spare jeden Monat Geld, um … (three endings)", model: ["…, um im Sommer nach Portugal zu fliegen. · …, um ein neues Velo zu kaufen. · …, um später eine Wohnung zu kaufen."], r: ["zu.um"] },
          { q: "Vergiss bitte nicht, … (three reminders for a friend)", model: ["Vergiss bitte nicht, den Schlüssel mitzunehmen. Vergiss nicht, die Blumen zu gießen, und vergiss nicht, mich anzurufen!"], r: ["zu.sep"] },
          { q: "Ich lerne Deutsch, um … (three reasons)", model: ["…, um mit meinen Nachbarn zu sprechen. · …, um eine bessere Stelle zu finden. · …, um den fide-Test zu bestehen."], r: ["zu.um"] },
          { q: "Am Wochenende bleibe ich zu Hause, anstatt … (two endings)", model: ["…, anstatt in die Stadt zu fahren. · …, anstatt mit Freunden auszugehen."], r: ["zu.statt"] },
          { q: "Mein Vater träumt davon, … (two dreams)", model: ["Mein Vater träumt davon, ein Haus am Meer zu haben. Er träumt auch davon, noch einmal nach Kanada zu reisen."], r: ["zu.end"] },
          { q: "Start with Um … zu: what do you do to stay healthy? (two sentences)", model: ["Um gesund zu bleiben, gehe ich jeden Tag spazieren. Um gut zu schlafen, trinke ich abends keinen Kaffee."], r: ["zu.front", "zu.um"] },
        ] },
      ],
    },
  },
});

// What chapter 24 became. Its opening part (24•1–24•4: the double
// infinitive — habe … verkaufen wollen, werde … helfen können) is the lesson
// on modals in the Perfekt, which uploads chapter 24 again (Session 7).
cxCover({
  "24.5": "d24.5", "24.6": "d24.6", "24.8": "d24.8", "24.9": "d24.9", "24.10": "d24.10", "24.11": "d24.11",
  "24.12": "d24.12", "24.13": "d24.13", "24.14": "d24.14",
  // 24•11's own sentences are in the Perfekt and with modals (das Spiel verloren
  // zu haben); d24.11 mirrors its frames (Es war schade, eine gute Idee, …) with
  // sentences in the Präsens — the zu-part with a Perfekt is 24•7's point:
  "24.7": { st: "skipped", why: "a zu-part with a Perfekt or a modal (gemacht zu haben, helfen zu müssen) is written German above B1 — fide neither asks nor needs it; the simple zu-part is drilled in 24•5, 24•6, 24•10 and 24•11" },
  "24.1": { st: "planned", sec: "s2.modpf" }, "24.2": { st: "planned", sec: "s2.modpf" },
  "24.3": { st: "planned", sec: "s2.modpf" }, "24.4": { st: "planned", sec: "s2.modpf" },
});
// A writing prompt for once zu + infinitive is done.
cxJournal([
  { id: "w.why", th: "me", lv: "A2", de: "Warum ich hier bin", t: "Why you came to Switzerland, what is important for you here, and what you try to do to feel at home.", help: ["Ich bin in die Schweiz gekommen, um …", "Es ist wichtig, …", "Ich versuche, …", "Ich habe noch keine Zeit, …"], sec: "s1.zu" },
]);
