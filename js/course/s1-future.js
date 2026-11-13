// ── COURSE PACK · Stage 1 · the future with werden — its book exercises ──
// The lesson's sheets live in the verb track (fu1: werden + the infinitive
// at the end · fu2: what the Futur I is for — a plan with a time word needs
// only the Präsens, a prediction or a promise takes werden, and werden +
// wohl is a guess about now). These are the book's exercises for it:
// chapter 11, Übung 11•6–11•13 — next week in two ways (11•6), one
// sentence in three tenses (11•7), into the future (11•8), the future
// only where it's needed (11•9 · 11•11, a family's week in Ticino), a
// modal in the future — werde … arbeiten müssen (11•10), a guess with
// wohl (11•12) and building future sentences (11•13). Our own sentences,
// every verb form checked against the engine (vf). Their rules are the
// verb sheets' points (gs:fu1.r1…): a miss names the sheet's rule; the
// verb track keeps its own reviews. 11•7's past tenses use only what the
// learner has by then: war / hatte, the modals' past, the -te Präteritum
// and the Perfekt — never a modal in the Perfekt (that's B1, Session 7).
// The past perfect (11•1–11•5) waits for the strong Präteritum's lesson.
cxPack({
  id: "s1-future",
  sections: {
    "s1.fu": {
      diag: [
        { t: "ending", stem: "(werd|wir[dst])", rule: "gs:fu1.r1", msg: "The form of werden must match the subject: here **{right}**. (ich werde, du wirst, er wird, wir werden, ihr werdet, sie werden)" },
        { t: "seq", seq: ["(mussen|konnen|durfen|sollen|wollen)", "\\w+(en|n)"], rule: "gs:fu1.r2", msg: "With two infinitives at the end, the modal comes **last**: … arbeiten **müssen**, … kommen **können**." },
        { t: "missing", tok: "^(wohl|sicher|bestimmt)$", rule: "gs:fu2.r3", msg: "A guess about now needs **wohl** (or sicher) with werden: Sie **wird wohl** im Büro **sein**." },
        { t: "missing", tok: "^(mussen|konnen|durfen|sollen|wollen)$", rule: "gs:fu1.r2", msg: "Keep the modal. It goes to the very end as an infinitive, after the other verb: … arbeiten **müssen**." },
        { t: "missing", tok: "^(werde|wirst|wird|werden|werdet)$", rule: "gs:fu1.r2", msg: "The future needs **werden** in second place, and the other verb at the end as an infinitive." },
        { t: "pos", tok: "^(werde|wirst|wird|werden|werdet)$", rule: "gs:fu1.r2", msg: "**werden** belongs in second place (first in a yes/no question): put it {where}." },
        { t: "pos", tok: "^(kommen|gehen|fahren|bleiben|sein|haben|machen|kaufen|arbeiten|helfen|anrufen|abholen|aufraumen|auspacken|ankommen|verstehen|finden|klappen|kochen|baden|lesen|spielen|schmecken|gefallen|regnen|schneien|treffen|beginnen|bekommen|ziehen|fliegen|wandern|warten|vergessen|tragen|waschen|erzahlen|reisen|bauen|suchen|sprechen|sehen|parken|ausfullen|schlafen|kosten|gehoren|freuen|essen|trinken)$", rule: "gs:fu1.r2", msg: "With werden, the other verb goes to the very end as an infinitive: put it {where}." },
        { t: "swap", from: "^\\w+(st|t|e)$", to: "^(kommen|gehen|fahren|bleiben|sein|haben|machen|kaufen|arbeiten|helfen|anrufen|abholen|aufraumen|auspacken|ankommen|verstehen|finden|klappen|kochen|baden|lesen|spielen|schmecken|gefallen|regnen|schneien|treffen|beginnen|bekommen|ziehen|fliegen|wandern|warten|vergessen|tragen|waschen|erzahlen|reisen|bauen|suchen|sprechen|sehen|parken|ausfullen|schlafen|kosten|gehoren|freuen|essen|trinken|sprechen|aufbleiben|bauen|bringen|ausfullen|mahen|regnen|funktionieren|kennenlernen)$", rule: "gs:fu1.r2", msg: "With werden, the verb at the end stays in the **infinitive**: **{right}**." },
      ],
      drills: [
        // ── Übung 11•8: into the future ──
        { id: "d11.8", ex: "11.8", t: "transform", low: true, title: "Into the future", how: "Say it in the future: werden in second place, the other verb at the end as an infinitive.", items: [
          { q: "Wir kaufen ein neues Sofa.", a: ["Wir werden ein neues Sofa kaufen."], r: ["gs:fu1.r2"], vf: [["kaufen", "fu", "wir"]] },
          { q: "Lea macht die Prüfung.", a: ["Lea wird die Prüfung machen."], r: ["gs:fu1.r2"], vf: [["machen", "fu", "er"]], cap: true },
          { q: "Hast du genug Zeit?", a: ["Wirst du genug Zeit haben?"], r: ["gs:fu1.r1"], vf: [["haben", "fu", "du"]] },
          { q: "Die Gemeinde baut eine neue Schule.", a: ["Die Gemeinde wird eine neue Schule bauen."], r: ["gs:fu1.r2"], vf: [["bauen", "fu", "er"]] },
          { q: "Seid ihr pünktlich?", a: ["Werdet ihr pünktlich sein?"], r: ["gs:fu1.r1"], vf: [["sein", "fu", "ihr"]] },
          { q: "Das Wetter bleibt schön.", a: ["Das Wetter wird schön bleiben."], r: ["gs:fu1.r2"], vf: [["bleiben", "fu", "er"]] },
          { q: "Ich rufe dich an.", a: ["Ich werde dich anrufen."], r: ["gs:fu1.r2"], vf: [["anrufen", "fu", "ich"]] },
          { q: "Meine Eltern ziehen ins Tessin.", a: ["Meine Eltern werden ins Tessin ziehen."], r: ["gs:fu1.table"], vf: [["ziehen", "fu", "sie"]] },
          { q: "Du verstehst das.", a: ["Du wirst das verstehen."], r: ["gs:fu1.r1"], vf: [["verstehen", "fu", "du"]] },
          { q: "Wir räumen die Küche auf.", a: ["Wir werden die Küche aufräumen."], r: ["gs:fu1.r2"], vf: [["aufräumen", "fu", "wir"]] },
          { q: "Herr Keller, sind Sie zufrieden?", a: ["Herr Keller, werden Sie zufrieden sein?"], r: ["gs:fu1.table"], vf: [["sein", "fu", "sie"]], cap: true },
          { q: "Ihr bekommt eine Antwort.", a: ["Ihr werdet eine Antwort bekommen."], r: ["gs:fu1.r1"], vf: [["bekommen", "fu", "ihr"]] },
        ] },
        // ── Übung 11•6: next week — two ways ──
        { id: "d11.6", ex: "11.6", t: "transform", fixed: true, title: "Next week — two ways", how: "Start with Nächste Woche. Use the Präsens or werden, as the brackets say.", items: [
          { q: "Ich habe Ferien. (Präsens)", a: ["Nächste Woche habe ich Ferien."], r: ["gs:fu2.r1"], vf: [["haben", "pr", "ich"]] },
          { q: "Der Kurs beginnt. (werden)", a: ["Nächste Woche wird der Kurs beginnen."], r: ["gs:fu1.r2"], vf: [["beginnen", "fu", "er"]] },
          { q: "Wir fahren ins Engadin. (Präsens)", a: ["Nächste Woche fahren wir ins Engadin."], r: ["gs:fu2.r1"], vf: [["fahren", "pr", "wir"]] },
          { q: "Du bekommst den neuen Ausweis. (werden)", a: ["Nächste Woche wirst du den neuen Ausweis bekommen."], r: ["gs:fu1.r2"], vf: [["bekommen", "fu", "du"]] },
          { q: "Herr Brunner arbeitet in Genf. (Präsens)", a: ["Nächste Woche arbeitet Herr Brunner in Genf."], r: ["gs:fu2.r1"], vf: [["arbeiten", "pr", "er"]] },
          { q: "Ihr trefft die neuen Kollegen. (werden)", a: ["Nächste Woche werdet ihr die neuen Kollegen treffen."], r: ["gs:fu1.r2"], vf: [["treffen", "fu", "ihr"]] },
          { q: "Die Kinder gehen wieder zur Schule. (Präsens)", a: ["Nächste Woche gehen die Kinder wieder zur Schule."], r: ["gs:fu2.r1"], vf: [["gehen", "pr", "sie"]] },
          { q: "Es schneit in den Bergen. (werden)", a: ["Nächste Woche wird es in den Bergen schneien."], r: ["gs:fu1.r2"], vf: [["schneien", "fu", "er"]] },
          { q: "Mein Bruder kommt aus Kanada zurück. (Präsens)", a: ["Nächste Woche kommt mein Bruder aus Kanada zurück."], r: ["gs:fu2.r1"] },
          { q: "Ich hole das Paket auf der Post ab. (werden)", a: ["Nächste Woche werde ich das Paket auf der Post abholen."], r: ["gs:fu1.r2"], vf: [["abholen", "fu", "ich"]] },
          { q: "Meine Schwester besucht uns. (Präsens)", a: ["Nächste Woche besucht uns meine Schwester.", "Nächste Woche besucht meine Schwester uns."], r: ["gs:fu2.r1"] },
          { q: "Wir lernen die Nachbarn kennen. (werden)", a: ["Nächste Woche werden wir die Nachbarn kennenlernen."], r: ["gs:fu1.r2"], vf: [["kennenlernen", "fu", "wir"]] },
        ].map(it => ({ ...it, diag: [{ t: "pos", tok: "^(ich|du|er|sie|es|wir|ihr|der|die|herr|mein|meine)$", rule: it.r[0], msg: "**Nächste Woche** comes first, so the verb stays second and the subject comes right after it." }] })) },
        // ── Übung 11•9: the future — only where it's needed ──
        { id: "d11.9", ex: "11.9", t: "transform", title: "Only where it's needed", how: "Use werden for the future. If a time word already says when, the Präsens is enough.", items: [
          { q: "Das Konzert ist super.", a: ["Das Konzert wird super sein."], r: ["gs:fu2.r2"], vf: [["sein", "fu", "er"]] },
          { q: "Ich koche heute Abend ein Risotto.", a: ["Ich koche heute Abend ein Risotto.", "Ich werde heute Abend ein Risotto kochen."], r: ["gs:fu2.r1"] },
          { q: "Du findest bestimmt eine Lösung.", a: ["Du wirst bestimmt eine Lösung finden."], r: ["gs:fu2.r2"], vf: [["finden", "fu", "du"]] },
          { q: "Morgen bringe ich dir das Buch.", a: ["Morgen bringe ich dir das Buch.", "Morgen werde ich dir das Buch bringen."], r: ["gs:fu2.r1"] },
          { q: "Der Chef ist nicht zufrieden.", a: ["Der Chef wird nicht zufrieden sein."], r: ["gs:fu2.r2"], vf: [["sein", "fu", "er"]] },
          { q: "Am Freitag gehen wir ins Kino.", a: ["Am Freitag gehen wir ins Kino.", "Am Freitag werden wir ins Kino gehen."], r: ["gs:fu2.r1"] },
          { q: "Die Wohnung gefällt euch.", a: ["Die Wohnung wird euch gefallen."], r: ["gs:fu2.r2"], vf: [["gefallen", "fu", "er"]] },
          { q: "Übermorgen fliegt Sara nach Lissabon.", a: ["Übermorgen fliegt Sara nach Lissabon.", "Übermorgen wird Sara nach Lissabon fliegen."], r: ["gs:fu2.r1"] },
          { q: "Alles klappt.", a: ["Alles wird klappen."], r: ["gs:fu2.r2"], vf: [["klappen", "fu", "er"]] },
          { q: "Ab Montag fahre ich mit dem Velo zur Arbeit.", a: ["Ab Montag fahre ich mit dem Velo zur Arbeit.", "Ab Montag werde ich mit dem Velo zur Arbeit fahren."], r: ["gs:fu2.r1"] },
          { q: "Ihr versteht das später.", a: ["Ihr versteht das später.", "Ihr werdet das später verstehen."], r: ["gs:fu2.r1"] },
        ] },
        // ── Übung 11•11: a week in Ticino ──
        { id: "d11.11", ex: "11.11", t: "transform", title: "A week in Ticino", how: "The Graf family's week in Ticino: use werden, unless a time word already says when.", items: [
          { q: "Papa fährt das Auto.", a: ["Papa wird das Auto fahren."], r: ["gs:fu1.r2"], vf: [["fahren", "fu", "er"]], cap: true },
          { q: "Am ersten Tag schlafen alle lange.", a: ["Am ersten Tag schlafen alle lange.", "Am ersten Tag werden alle lange schlafen."], r: ["gs:fu2.r1"] },
          { q: "Mama kocht eine Polenta.", a: ["Mama wird eine Polenta kochen."], r: ["gs:fu1.r2"], vf: [["kochen", "fu", "er"]], cap: true },
          { q: "Die Kinder baden im Lago Maggiore.", a: ["Die Kinder werden im Lago Maggiore baden."], r: ["gs:fu1.table"], vf: [["baden", "fu", "sie"]] },
          { q: "Opa liest auf dem Balkon.", a: ["Opa wird auf dem Balkon lesen."], r: ["gs:fu1.r2"], vf: [["lesen", "fu", "er"]], cap: true },
          { q: "Abends spielen wir Karten.", a: ["Abends spielen wir Karten.", "Abends werden wir Karten spielen."], r: ["gs:fu2.r1"] },
          { q: "Alle haben großen Hunger.", a: ["Alle werden großen Hunger haben."], r: ["gs:fu1.table"], vf: [["haben", "fu", "sie"]] },
          { q: "Am Mittwoch wandern wir auf den Monte Generoso.", a: ["Am Mittwoch wandern wir auf den Monte Generoso.", "Am Mittwoch werden wir auf den Monte Generoso wandern."], r: ["gs:fu2.r1"] },
          { q: "Das Essen schmeckt allen.", a: ["Das Essen wird allen schmecken."], r: ["gs:fu2.r2"], vf: [["schmecken", "fu", "er"]] },
          { q: "Die Ferien gefallen uns sicher.", a: ["Die Ferien werden uns sicher gefallen."], r: ["gs:fu2.r2"], vf: [["gefallen", "fu", "sie"]] },
          { q: "Lukas und Mia spielen jeden Tag Fußball.", a: ["Lukas und Mia werden jeden Tag Fußball spielen."], r: ["gs:fu1.table"], vf: [["spielen", "fu", "sie"]], cap: true },
          { q: "Nächsten Sommer fahren wir wieder ins Tessin.", a: ["Nächsten Sommer fahren wir wieder ins Tessin.", "Nächsten Sommer werden wir wieder ins Tessin fahren."], r: ["gs:fu2.r1"] },
        ] },
        // ── Übung 11•10: a modal in the future ──
        { id: "d11.10", ex: "11.10", t: "transform", title: "A modal in the future", how: "Say it in the future: two infinitives at the end, the modal last (… arbeiten müssen).", items: [
          { q: "Ich muss am Samstag arbeiten.", a: ["Ich werde am Samstag arbeiten müssen."], r: ["gs:fu1.r2"], vf: [["müssen", "fu", "ich"]] },
          { q: "Du kannst bald gut Deutsch sprechen.", a: ["Du wirst bald gut Deutsch sprechen können."], r: ["gs:fu1.r2"], vf: [["können", "fu", "du"]] },
          { q: "Die Kinder dürfen länger aufbleiben.", a: ["Die Kinder werden länger aufbleiben dürfen."], r: ["gs:fu1.r2"], vf: [["dürfen", "fu", "sie"]] },
          { q: "Wir müssen ein Formular ausfüllen.", a: ["Wir werden ein Formular ausfüllen müssen."], r: ["gs:fu1.r2"], vf: [["müssen", "fu", "wir"]] },
          { q: "Kann Lukas uns helfen?", a: ["Wird Lukas uns helfen können?"], r: ["gs:fu1.r2"], vf: [["können", "fu", "er"]] },
          { q: "Ihr müsst lange warten.", a: ["Ihr werdet lange warten müssen."], r: ["gs:fu1.r1"], vf: [["müssen", "fu", "ihr"]] },
          { q: "Man darf hier nicht mehr parken.", a: ["Man wird hier nicht mehr parken dürfen."], r: ["gs:fu1.r2"], vf: [["dürfen", "fu", "er"]] },
          { q: "Ich kann dich leider nicht abholen.", a: ["Ich werde dich leider nicht abholen können."], r: ["gs:fu1.r2"], vf: [["können", "fu", "ich"]] },
          { q: "Frau Huber muss eine neue Wohnung suchen.", a: ["Frau Huber wird eine neue Wohnung suchen müssen."], r: ["gs:fu1.r2"], vf: [["müssen", "fu", "er"]], cap: true },
          { q: "Ohne Brille kann er nichts sehen.", a: ["Ohne Brille wird er nichts sehen können."], r: ["gs:fu1.r2"], vf: [["können", "fu", "er"]] },
        ] },
        // ── Übung 11•7: one sentence, three tenses ──
        { id: "d11.7", ex: "11.7", t: "transform", title: "Past, Perfekt, future", how: "Say it in the tense in brackets: the Präteritum, the Perfekt or the future with werden.", items: [
          { q: "Lena arbeitet in einer Bank. (Präteritum)", a: ["Lena arbeitete in einer Bank."], r: ["gs:pt21.r3"], vf: [["arbeiten", "pt", "er"]], cap: true },
          { q: "Lena arbeitet in einer Bank. (Perfekt)", a: ["Lena hat in einer Bank gearbeitet."], r: ["gs:pf1.r1"], vf: [["arbeiten", "pf", "er"]], cap: true },
          { q: "Lena arbeitet in einer Bank. (Futur)", a: ["Lena wird in einer Bank arbeiten."], r: ["gs:fu1.r2"], vf: [["arbeiten", "fu", "er"]], cap: true },
          { q: "Ich habe keine Zeit. (Präteritum)", a: ["Ich hatte keine Zeit."], r: ["gs:pt11.r2"], vf: [["haben", "pt", "ich"]] },
          { q: "Ich habe keine Zeit. (Perfekt)", a: ["Ich habe keine Zeit gehabt."], r: ["gs:pf1.r1"], vf: [["haben", "pf", "ich"]] },
          { q: "Ich habe keine Zeit. (Futur)", a: ["Ich werde keine Zeit haben."], r: ["gs:fu1.r2"], vf: [["haben", "fu", "ich"]] },
          { q: "Wir müssen früh aufstehen. (Präteritum)", a: ["Wir mussten früh aufstehen."], r: ["gs:pt12.r1"], vf: [["müssen", "pt", "wir"]] },
          { q: "Wir müssen früh aufstehen. (Futur)", a: ["Wir werden früh aufstehen müssen."], r: ["gs:fu1.r2"], vf: [["müssen", "fu", "wir"]] },
          { q: "Bist du wieder in Lugano? (Präteritum)", a: ["Warst du wieder in Lugano?"], r: ["gs:pt11.r1"], vf: [["sein", "pt", "du"]] },
          { q: "Bist du wieder in Lugano? (Perfekt)", a: ["Bist du wieder in Lugano gewesen?"], r: ["gs:pf2.r3"], vf: [["sein", "pf", "du"]] },
          { q: "Bist du wieder in Lugano? (Futur)", a: ["Wirst du wieder in Lugano sein?"], r: ["gs:fu1.r1"], vf: [["sein", "fu", "du"]] },
          { q: "Der Zug kommt pünktlich an. (Perfekt)", a: ["Der Zug ist pünktlich angekommen."], r: ["gs:pf2.r1"], vf: [["ankommen", "pf", "er"]] },
          { q: "Der Zug kommt pünktlich an. (Futur)", a: ["Der Zug wird pünktlich ankommen."], r: ["gs:fu1.r2"], vf: [["ankommen", "fu", "er"]] },
        ] },
        // ── Übung 11•12: probably… ──
        { id: "d11.12", ex: "11.12", t: "answer", title: "Probably…", how: "Answer with a guess: werden + wohl (or sicher). The words in brackets are your guess.", items: [
          { q: "Wo sind die Nachbarn? (in den Ferien)", a: ["Sie werden wohl in den Ferien sein.", "Sie werden sicher in den Ferien sein.", "Die Nachbarn werden wohl in den Ferien sein."], r: ["gs:fu2.r3"], vf: [["sein", "fu", "sie"]] },
          { q: "Warum ist Tom so müde? (zu wenig schlafen)", a: ["Er wird wohl zu wenig schlafen.", "Er wird sicher zu wenig schlafen.", "Tom wird wohl zu wenig schlafen."], r: ["gs:fu2.r3"], vf: [["schlafen", "fu", "er"]] },
          { q: "Wie spät ist es? (schon acht Uhr)", a: ["Es wird wohl schon acht Uhr sein.", "Es wird sicher schon acht Uhr sein."], r: ["gs:fu2.r3"], vf: [["sein", "fu", "er"]] },
          { q: "Wem gehört der Schlüssel? (dem Hauswart)", a: ["Er wird wohl dem Hauswart gehören.", "Er wird sicher dem Hauswart gehören.", "Der Schlüssel wird wohl dem Hauswart gehören."], r: ["gs:fu2.r3"], vf: [["gehören", "fu", "er"]] },
          { q: "Wo ist mein Handy? (im Auto)", a: ["Es wird wohl im Auto sein.", "Es wird sicher im Auto sein.", "Dein Handy wird wohl im Auto sein."], r: ["gs:fu2.r3"], vf: [["sein", "fu", "er"]] },
          { q: "Warum kommt der Bus nicht? (Verspätung haben)", a: ["Er wird wohl Verspätung haben.", "Er wird sicher Verspätung haben.", "Der Bus wird wohl Verspätung haben."], r: ["gs:fu2.r3"], vf: [["haben", "fu", "er"]] },
          { q: "Was macht Sara gerade? (arbeiten)", a: ["Sie wird wohl arbeiten.", "Sie wird sicher arbeiten.", "Sara wird wohl arbeiten."], r: ["gs:fu2.r3"], vf: [["arbeiten", "fu", "er"]] },
          { q: "Wie viel kostet das Velo? (etwa 500 Franken)", a: ["Es wird wohl etwa 500 Franken kosten.", "Es wird sicher etwa 500 Franken kosten.", "Das Velo wird wohl etwa 500 Franken kosten."], r: ["gs:fu2.r3"], vf: [["kosten", "fu", "er"]] },
          { q: "Wer klingelt da? (der Pöstler)", a: ["Das wird wohl der Pöstler sein.", "Das wird sicher der Pöstler sein.", "Es wird wohl der Pöstler sein."], r: ["gs:fu2.r3"], vf: [["sein", "fu", "er"]] },
          { q: "Warum antwortet Ben nicht? (krank sein)", a: ["Er wird wohl krank sein.", "Er wird sicher krank sein.", "Ben wird wohl krank sein."], r: ["gs:fu2.r3"], vf: [["sein", "fu", "er"]] },
          { q: "Wo spielen die Kinder? (im Garten)", a: ["Sie werden wohl im Garten spielen.", "Sie werden sicher im Garten spielen.", "Die Kinder werden wohl im Garten spielen."], r: ["gs:fu2.r3"], vf: [["spielen", "fu", "sie"]] },
        ] },
        // ── Übung 11•13: build it — back home after the holiday ──
        { id: "d11.13", ex: "11.13", t: "compose", end: true, title: "Back home", how: "The Grafs come home tomorrow. Say what will happen: werden, or the Präsens with a time word.", items: [
          { w: ["morgen", "wir", "sein", "wieder", "zu Hause"], a: ["Morgen sind wir wieder zu Hause.", "Morgen werden wir wieder zu Hause sein."], r: ["gs:fu2.r1"] },
          { w: ["Papa", "auspacken", "das Auto"], a: ["Papa wird das Auto auspacken."], r: ["gs:fu1.r2"], vf: [["auspacken", "fu", "er"]], cap: true },
          { w: ["wir", "tragen", "die Koffer", "in die Wohnung"], a: ["Wir werden die Koffer in die Wohnung tragen."], r: ["gs:fu1.table"], vf: [["tragen", "fu", "wir"]] },
          { w: ["Mama", "waschen", "die Wäsche"], a: ["Mama wird die Wäsche waschen."], r: ["gs:fu1.r2"], vf: [["waschen", "fu", "er"]], cap: true },
          { w: ["alle", "wohl", "müde", "sein"], a: ["Alle werden wohl müde sein."], r: ["gs:fu2.r3"], vf: [["sein", "fu", "sie"]] },
          { w: ["Lea", "anrufen", "ihre Freundin"], a: ["Lea wird ihre Freundin anrufen."], r: ["gs:fu1.r2"], vf: [["anrufen", "fu", "er"]], cap: true },
          { w: ["Tim", "den Rasen", "mähen", "müssen"], a: ["Tim wird den Rasen mähen müssen."], r: ["gs:fu1.r2"], vf: [["müssen", "fu", "er"]], cap: true },
          { w: ["übermorgen", "Papa", "wieder", "arbeiten gehen"], a: ["Übermorgen geht Papa wieder arbeiten.", "Übermorgen wird Papa wieder arbeiten gehen."], r: ["gs:fu2.r1"] },
          { w: ["die Katze", "sich freuen", "bestimmt"], a: ["Die Katze wird sich bestimmt freuen."], r: ["gs:fu2.r2"] },
          { w: ["wir", "erzählen", "den Nachbarn", "von den Ferien"], a: ["Wir werden den Nachbarn von den Ferien erzählen."], r: ["gs:fu1.r2"], vf: [["erzählen", "fu", "wir"]] },
        ] },
        // ── Production: promises, predictions, guesses ──
        { id: "dp.fu", t: "translate", end: true, title: "Say it in German", how: "Translate. A promise or a prediction takes werden; a guess takes werden + wohl.", items: [
          { q: "I'll help you, I promise. (du)", a: ["Ich werde dir helfen, versprochen!", "Ich werde dir helfen, das verspreche ich!"], r: ["gs:fu2.r2"], vf: [["helfen", "fu", "ich"]] },
          { q: "It will rain tomorrow.", a: ["Morgen wird es regnen.", "Morgen regnet es."], r: ["gs:fu2.r1"] },
          { q: "That will work, for sure.", a: ["Das wird sicher klappen.", "Das wird bestimmt klappen.", "Das wird sicher funktionieren.", "Das wird bestimmt funktionieren."], r: ["gs:fu2.r2"] },
          { q: "He's probably at home (a guess).", a: ["Er wird wohl zu Hause sein.", "Er ist wohl zu Hause."], r: ["gs:fu2.r3"] },
          { q: "We'll have to wait.", a: ["Wir werden warten müssen."], r: ["gs:fu1.r2"], vf: [["müssen", "fu", "wir"]] },
          { q: "Will you be able to come? (ihr)", a: ["Werdet ihr kommen können?"], r: ["gs:fu1.r1"], vf: [["können", "fu", "ihr"]] },
          { q: "Next year I'll take the fide test.", a: ["Nächstes Jahr mache ich den fide-Test.", "Nächstes Jahr werde ich den fide-Test machen.", "Nächstes Jahr mache ich die fide-Prüfung.", "Nächstes Jahr werde ich die fide-Prüfung machen."], r: ["gs:fu2.r1"] },
          { q: "The children will be happy.", a: ["Die Kinder werden sich freuen.", "Die Kinder werden glücklich sein.", "Die Kinder werden froh sein."], r: ["gs:fu2.r2"] },
          { q: "I won't forget that.", a: ["Ich werde das nicht vergessen.", "Das werde ich nicht vergessen."], r: ["gs:fu2.r2"], vf: [["vergessen", "fu", "ich"]] },
          { q: "It's probably already late (a guess).", a: ["Es wird wohl schon spät sein.", "Es ist wohl schon spät."], r: ["gs:fu2.r3"] },
          { q: "My sister is becoming a nurse.", a: ["Meine Schwester wird Pflegefachfrau.", "Meine Schwester wird Krankenschwester.", "Meine Schwester wird Pflegerin."], r: ["gs:fu1.trap"] },
          { q: "You'll like the flat. (du)", a: ["Die Wohnung wird dir gefallen.", "Die Wohnung wird dir sicher gefallen."], r: ["gs:fu2.r2"], vf: [["gefallen", "fu", "er"]] },
        ] },
        { id: "dw.fu", t: "write", end: true, title: "Write your own", how: "In your own words — saved for Claude to correct.", items: [
          { q: "Your plans for next weekend — three of them (the Präsens is enough with a time word).", model: ["Am Samstag gehe ich auf den Markt. Am Nachmittag besuche ich meine Freundin, und am Sonntag fahren wir an den See."], r: ["gs:fu2.r1"] },
          { q: "Promise someone three things (Ich werde …).", model: ["Ich werde dich jeden Sonntag anrufen. Ich werde pünktlich sein. Ich werde dir beim Umzug helfen."], r: ["gs:fu2.r2"] },
          { q: "Switzerland in 2050: three predictions.", model: ["Im Jahr 2050 werden die Züge noch schneller sein. Es wird weniger Schnee geben, und viele Leute werden zu Hause arbeiten."], r: ["gs:fu2.r2", "gs:fu1.r2"] },
          { q: "Your neighbour's lights are off all week. Guess why (wird wohl …).", model: ["Sie wird wohl in den Ferien sein. Oder sie wird bei ihrer Tochter in Bern sein."], r: ["gs:fu2.r3"] },
          { q: "After the fide test: what will you be able to do? (werde … können)", model: ["Nach dem Test werde ich mit den Nachbarn besser sprechen können. Ich werde auch eine bessere Stelle finden können."], r: ["gs:fu1.r2"] },
          { q: "Someone you know is becoming something (werden = become).", model: ["Mein Sohn wird Koch. Er macht eine Lehre in einem Hotel in Interlaken."], r: ["gs:fu1.trap"] },
          { q: "What will you have to do next month? (werde … müssen)", model: ["Nächsten Monat werde ich die Steuererklärung ausfüllen müssen. Ich werde auch den Mietvertrag verlängern müssen."], r: ["gs:fu1.r2"] },
          { q: "The weather tomorrow — your forecast.", model: ["Morgen wird es am Vormittag regnen, aber am Nachmittag wird die Sonne scheinen."], r: ["gs:fu2.r2"] },
        ] },
      ],
    },
  },
});

// What chapter 11's future part became (11•1–11•5, the past perfect, wait
// for the strong Präteritum's lesson: s1-perfekt.js).
cxCover({
  "11.6": "d11.6", "11.7": "d11.7", "11.8": "d11.8", "11.9": "d11.9",
  "11.10": "d11.10", "11.11": "d11.11", "11.12": "d11.12", "11.13": "d11.13",
});
// A writing prompt for once the future's sheets are passed.
cxJournal([
  { id: "w.fiveyears", th: "work", lv: "A2", de: "In fünf Jahren", t: "Your life in five years: where you will live, what you will do, what will be different — and one promise to yourself.", help: ["In fünf Jahren werde ich …", "Ich werde wohl …", "Nächstes Jahr mache ich …", "Ich werde nie …"], sec: "s1.fu" },
]);
