// ── COURSE PACK · After B1 (bonus) · Advanced passive: sein … zu, -bar ──
// Book: chapter 25's "sein...zu + Infinitive" (25•15: yes, it's easy to
// find). The rest of the chapter's substitutes for the passive are taught
// in Stage 2: man and the impersonal passive (s2.man), sich lassen (s2.lassen).
// One sheet: sein + zu + infinitive — it can be done (Das ist leicht zu
// lösen) and, in rules, letters and forms, it must be done (Die Rechnung ist
// bis Ende Monat zu bezahlen; zu inside a separable verb: vorzuzeigen) ·
// the adjectives in -bar (lösbar, trinkbar, unbezahlbar) · and the three
// ways to say it can be done, side by side (ist zu machen · lässt sich
// machen · kann gemacht werden). B2 — a bonus after B1; the forms and letters
// that use it are everyday Swiss paperwork, so it pays to read it.
cxPack({
  id: "s4-pvx",
  sections: {
    "s4.pvx": {
      rules: {
        "pvx.zu": "sein + zu + infinitive: it can be done (ist leicht zu lösen)",
        "pvx.must": "In rules and forms: it must be done (ist bis … zu bezahlen)",
        "pvx.bar": "-bar: lösbar, trinkbar — and unbezahlbar",
        "pvx.three": "Three ways: ist zu machen · lässt sich machen · kann gemacht werden",
      },
      sheets: [
        { id: "cx.pvx", title: "Das ist leicht zu lösen", qn: 3,
          struct: [["Das Problem", "who"], ["ist", "verb"], ["leicht", "mid"], ["zu lösen", "inf"]],
          why: "German has short ways to say *can be done* or *must be done* without the passive: **sein + zu + infinitive** (Das ist leicht **zu lösen**) and the adjectives in **-bar** (lös**bar**). Forms, letters and signs are full of them.",
          rid: ["pvx.zu", "pvx.must", "pvx.bar", "pvx.three"],
          rules: [
            "**sein + zu + the infinitive** says that something **can be done**: Das Problem **ist** leicht **zu lösen**. (= Man kann es leicht lösen.) With nicht or kaum it can't: Die Schrift **ist** kaum **zu lesen**.",
            "In rules, letters and forms the same pattern says that something **must be done**: Die Rechnung **ist** bis Ende Monat **zu bezahlen**. · Der Ausweis **ist** an der Kasse **vorzuzeigen**. With a separable verb, zu goes inside: vor**zu**zeigen.",
            "An adjective in **-bar** says *can be done* in one word: lösen → **lösbar**, trinken → **trinkbar**, machen → **machbar**. Its opposite takes **un-**: **unlösbar**, **unbezahlbar**.",
            "So *it can be done* has three forms: Das **ist** leicht **zu reparieren** · Das **lässt sich** leicht **reparieren** · Das **kann** leicht **repariert werden**. They mean the same; the first two are shorter.",
          ],
          table: { head: ["can be done", "-bar"], rows: [
            ["ist zu lösen", "**lösbar**"],
            ["ist zu trinken", "**trinkbar**"],
            ["ist zu machen", "**machbar**"],
            ["ist zu essen", "**essbar**"],
            ["ist zu waschen", "**waschbar**"],
            ["ist nicht zu bezahlen", "**unbezahlbar**"],
          ] },
          ex: [
            ["Die Aufgabe **ist** in zehn Minuten **zu schaffen**.", "The task can be done in ten minutes."],
            ["Das Formular **ist** bis Freitag **zurückzuschicken**.", "The form must be sent back by Friday."],
            ["Ist das Wasser hier **trinkbar**?", "Is the water here drinkable?"],
            ["Die Wohnungen in Zürich sind fast **unbezahlbar**.", "The flats in Zurich are almost unaffordable."],
          ],
          trap: "This zu + infinitive goes with **sein**, never with werden: Das **ist** zu machen — not ~~Das wird zu machen~~. And the thing is the subject: **Die Tür** ist nicht zu öffnen — the person who opens it isn't there at all.",
          quiz: [
            { at: "r1", k: "pick", q: "The road is easy to find: Die Straße ist leicht ___.", o: ["zu finden", "finden", "gefunden"], a: 0, why: "sein + **zu** + the infinitive: it can be found." },
            { at: "r1", k: "type", cx: true, q: "Sein Akzent ist schwer ___ verstehen.", a: ["zu"], r: ["pvx.zu"], why: "sein + **zu** + the infinitive." },
            { at: "r2", k: "pick", q: "On a form: Das Formular ___ bis Montag zurückzuschicken.", o: ["ist", "wird", "hat"], a: 0, why: "It must be done: **ist** … zurückzuschicken." },
            { at: "r2", k: "pick", q: "The ID must be shown: Der Ausweis ist ___.", o: ["vorzuzeigen", "zu vorzeigen", "vorgezeigt"], a: 0, why: "A separable verb takes zu inside: **vorzuzeigen**." },
            { at: "r3", k: "pick", q: "Man kann das Wasser trinken. Das Wasser ist ___.", o: ["trinkbar", "getrunken", "trinkend"], a: 0, why: "*can be drunk*: **trinkbar**." },
            { at: "r3", k: "type", cx: true, q: "Man kann das Problem nicht lösen. Es ist ___.", a: ["unlösbar", "nicht lösbar"], r: ["pvx.bar"], why: "*can't be solved*: **unlösbar**." },
            { at: "r4", k: "pick", q: "Which does NOT mean *the bike can be repaired*?", o: ["Das Velo wird repariert.", "Das Velo ist zu reparieren.", "Das Velo lässt sich reparieren."], a: 0, why: "**wird repariert** says it is being repaired." },
            { at: "r4", k: "order", q: "Build it: The door can't be opened.", a: ["Die Tür", "lässt sich", "nicht", "öffnen."], why: "sich lassen + the infinitive at the end." },
            { at: "table", k: "pick", q: "Man kann die Jacke waschen. Sie ist ___.", o: ["waschbar", "waschlich", "gewaschen"], a: 0, why: "waschen → **waschbar**." },
            { at: "trap", k: "pick", q: "Which is right?", o: ["Das ist leicht zu machen.", "Das wird leicht zu machen.", "Das ist leicht machen."], a: 0, why: "**sein** + zu + the infinitive." },
          ] },
      ],
      diag: [
        { t: "swap", from: "^(wird|werden)$", to: "^(ist|sind)$", rule: "pvx.zu", hard: true, msg: "zu + infinitive goes with **sein**: **{right}** … zu …" },
        { t: "missing", tok: "^zu$", whole: true, rule: "pvx.zu", msg: "sein needs **zu** before the infinitive: … ist leicht **zu** finden." },
        { t: "seq", seq: ["^zu$", "^(vor|ab|an|auf|aus|ein|mit|zuruck|bereit|weg|zu)\\w+en$"], rule: "pvx.must", msg: "With a separable verb, zu goes inside: vor**zu**zeigen, ab**zu**geben." },
        { t: "grow", add: "bar$", rule: "pvx.bar", msg: "In one word: **{right}**." },
      ],
      drills: [
        // ── Übung 25•15: yes, it's easy ──
        { id: "d25.15", ex: "25.15", t: "answer", title: "Yes, it can be done", how: "Answer yes with sein + zu + the infinitive: Kann man …? → Ja, es ist … zu …", items: [
          { q: "Kann man den Bahnhof leicht finden?", a: ["Ja, er ist leicht zu finden.", "Ja, der Bahnhof ist leicht zu finden."], r: ["pvx.zu"] },
          { q: "Kann man die Tür leise schließen?", a: ["Ja, sie ist leise zu schließen.", "Ja, die Tür ist leise zu schließen."], r: ["pvx.zu"] },
          { q: "Kann man diese Sprache schnell lernen?", a: ["Ja, sie ist schnell zu lernen.", "Ja, diese Sprache ist schnell zu lernen."], r: ["pvx.zu"] },
          { q: "Kann man das alte Haus noch verkaufen?", a: ["Ja, es ist noch zu verkaufen.", "Ja, das alte Haus ist noch zu verkaufen."], r: ["pvx.zu"] },
          { q: "Kann man den Text gut verstehen?", a: ["Ja, er ist gut zu verstehen.", "Ja, der Text ist gut zu verstehen."], r: ["pvx.zu"] },
          { q: "Kann man den Gipfel in drei Stunden erreichen?", a: ["Ja, er ist in drei Stunden zu erreichen.", "Ja, der Gipfel ist in drei Stunden zu erreichen."], r: ["pvx.zu"] },
          { q: "Kann man die Waschmaschine noch reparieren?", a: ["Ja, sie ist noch zu reparieren.", "Ja, die Waschmaschine ist noch zu reparieren."], r: ["pvx.zu"] },
          { q: "Kann man das Museum mit dem Bus erreichen?", a: ["Ja, es ist mit dem Bus zu erreichen.", "Ja, das Museum ist mit dem Bus zu erreichen."], r: ["pvx.zu"] },
          { q: "Kann man den Fleck noch entfernen?", a: ["Ja, er ist noch zu entfernen.", "Ja, der Fleck ist noch zu entfernen."], r: ["pvx.zu"] },
          { q: "Kann man die Kosten genau berechnen?", a: ["Ja, sie sind genau zu berechnen.", "Ja, die Kosten sind genau zu berechnen."], r: ["pvx.zu"] },
        ] },
        // ── ours: rules and letters ──
        { id: "dpvx.must", t: "transform", title: "Rules and letters", how: "Say it like an official letter or a sign: … ist / sind … zu + the infinitive. A separable verb takes zu inside: abzugeben.", items: [
          { q: "Man muss die Rechnung innerhalb von 30 Tagen bezahlen.", a: ["Die Rechnung ist innerhalb von 30 Tagen zu bezahlen."], r: ["pvx.must"] },
          { q: "Man muss den Ausweis am Eingang zeigen.", a: ["Der Ausweis ist am Eingang zu zeigen."], r: ["pvx.must"] },
          { q: "Man muss das Formular bis Freitag abgeben.", a: ["Das Formular ist bis Freitag abzugeben."], r: ["pvx.must"] },
          { q: "Man muss die Schuhe im Flur ausziehen.", a: ["Die Schuhe sind im Flur auszuziehen."], r: ["pvx.must"] },
          { q: "Man muss Hunde an der Leine führen.", a: ["Hunde sind an der Leine zu führen."], r: ["pvx.must"] },
          { q: "Man muss den Kehricht am Dienstag bereitstellen.", a: ["Der Kehricht ist am Dienstag bereitzustellen."], r: ["pvx.must"] },
          { q: "Man muss Änderungen sofort melden.", a: ["Änderungen sind sofort zu melden."], r: ["pvx.must"] },
          { q: "Man muss die Medikamente kühl lagern.", a: ["Die Medikamente sind kühl zu lagern."], r: ["pvx.must"] },
          { q: "Man muss die Waschküche nach dem Waschen reinigen.", a: ["Die Waschküche ist nach dem Waschen zu reinigen."], r: ["pvx.must"] },
          { q: "Man muss den Schlüssel beim Hauswart abholen.", a: ["Der Schlüssel ist beim Hauswart abzuholen."], r: ["pvx.must"] },
        ] },
        // ── ours: one word, -bar ──
        { id: "dpvx.bar", t: "type", title: "In one word: -bar", how: "Write the adjective in -bar (or un…bar when it can't be done).", items: [
          { q: "Man kann das Wasser trinken. Es ist ___.", a: ["trinkbar"], r: ["pvx.bar"] },
          { q: "Man kann die Pilze essen. Sie sind ___.", a: ["essbar"], r: ["pvx.bar"] },
          { q: "Man kann den Plan umsetzen. Er ist ___.", a: ["machbar", "umsetzbar"], r: ["pvx.bar"] },
          { q: "Man kann die Decke waschen. Sie ist ___.", a: ["waschbar"], r: ["pvx.bar"] },
          { q: "Man kann das Problem nicht lösen. Es ist ___.", a: ["unlösbar", "nicht lösbar"], r: ["pvx.bar"] },
          { q: "Man kann die Wohnung nicht bezahlen. Sie ist ___.", a: ["unbezahlbar", "nicht bezahlbar"], r: ["pvx.bar"] },
          { q: "Man kann das Hotel online buchen. Es ist online ___.", a: ["buchbar"], r: ["pvx.bar"] },
          { q: "Man kann den Unterschied kaum sehen. Er ist kaum ___.", a: ["sichtbar"], r: ["pvx.bar"], note: "sehen → **sichtbar** (from die Sicht)." },
          { q: "Man kann das Gerät überall benutzen. Es ist überall ___.", a: ["benutzbar", "nutzbar"], r: ["pvx.bar"] },
          { q: "Man kann den Fehler nicht vermeiden. Er ist ___.", a: ["unvermeidbar", "nicht vermeidbar"], r: ["pvx.bar"] },
        ] },
        // ── ours: three ways ──
        { id: "dpvx.three", t: "transform", title: "Three ways, one meaning", how: "Say it with sein + zu instead: … ist / sind … zu + the infinitive.", items: [
          { q: "Das Velo lässt sich reparieren.", a: ["Das Velo ist zu reparieren."], r: ["pvx.three"] },
          { q: "Der Text kann leicht übersetzt werden.", a: ["Der Text ist leicht zu übersetzen."], r: ["pvx.three"] },
          { q: "Die Kiste lässt sich nicht öffnen.", a: ["Die Kiste ist nicht zu öffnen."], r: ["pvx.three"] },
          { q: "Das Ziel kann in einer Stunde erreicht werden.", a: ["Das Ziel ist in einer Stunde zu erreichen."], r: ["pvx.three"] },
          { q: "Die Schrift kann kaum gelesen werden.", a: ["Die Schrift ist kaum zu lesen."], r: ["pvx.three"] },
          { q: "Der Lärm lässt sich nicht mehr ertragen.", a: ["Der Lärm ist nicht mehr zu ertragen."], r: ["pvx.three"] },
          { q: "Das Haus kann nicht mehr gerettet werden.", a: ["Das Haus ist nicht mehr zu retten."], r: ["pvx.three"] },
          { q: "Die Tickets können online gekauft werden.", a: ["Die Tickets sind online zu kaufen."], r: ["pvx.three"] },
          { q: "Die Fehler lassen sich leicht finden.", a: ["Die Fehler sind leicht zu finden."], r: ["pvx.three"] },
        ] },
        // ── Production ──
        { id: "dp.pvx", t: "translate", end: true, title: "Say it in German", how: "Translate with sein + zu, sich lassen or -bar.", items: [
          { q: "The problem is easy to solve.", a: ["Das Problem ist leicht zu lösen.", "Das Problem lässt sich leicht lösen.", "Das Problem ist leicht lösbar."], r: ["pvx.zu"] },
          { q: "The bill must be paid by Friday.", a: ["Die Rechnung ist bis Freitag zu bezahlen.", "Die Rechnung muss bis Freitag bezahlt werden."], r: ["pvx.must"] },
          { q: "Is the water drinkable?", a: ["Ist das Wasser trinkbar?"], r: ["pvx.bar"] },
          { q: "His handwriting is hard to read.", a: ["Seine Schrift ist schwer zu lesen.", "Seine Handschrift ist schwer zu lesen.", "Seine Schrift lässt sich schwer lesen.", "Seine Handschrift lässt sich schwer lesen."], r: ["pvx.zu"] },
          { q: "That can't be changed.", a: ["Das ist nicht zu ändern.", "Das lässt sich nicht ändern.", "Das kann nicht geändert werden."], r: ["pvx.three"] },
          { q: "The village can only be reached on foot.", a: ["Das Dorf ist nur zu Fuß zu erreichen.", "Das Dorf ist nur zu Fuß erreichbar.", "Das Dorf kann nur zu Fuß erreicht werden.", "Das Dorf lässt sich nur zu Fuß erreichen."], r: ["pvx.zu"] },
          { q: "Flats in Geneva are almost unaffordable.", a: ["Wohnungen in Genf sind fast unbezahlbar.", "Die Wohnungen in Genf sind fast unbezahlbar."], r: ["pvx.bar"] },
          { q: "The form must be signed.", a: ["Das Formular ist zu unterschreiben.", "Das Formular muss unterschrieben werden."], r: ["pvx.must"] },
          { q: "That's doable!", a: ["Das ist machbar!", "Das ist zu machen!", "Das lässt sich machen!"], r: ["pvx.bar"] },
        ] },
        { id: "dw.pvx", t: "write", end: true, title: "Write your own", how: "Write in your own words. Saved for Claude to correct.", items: [
          { q: "Write three rules for your building's laundry room. (… ist … zu …)", model: ["Die Waschküche ist nach dem Waschen zu reinigen. Die Wäsche ist am gleichen Tag abzuhängen. Am Sonntag ist die Waschmaschine nicht zu benutzen."], r: ["pvx.must"] },
          { q: "Something broke at home. Can it be fixed? (… ist zu reparieren / lässt sich …)", model: ["Unser Kühlschrank ist kaputt. Der Techniker sagt, er ist nicht mehr zu reparieren. Ein neuer ist leider teuer."], r: ["pvx.three"] },
          { q: "A short notice for your team: what must be done by Friday?", model: ["Liebes Team, die Berichte sind bis Freitag abzugeben. Die Spesen sind bis Ende Monat einzureichen. Danke!"], r: ["pvx.must"] },
          { q: "Describe your town for a visitor: what is easy to reach, what's worth seeing?", model: ["Der See ist vom Bahnhof in fünf Minuten zu erreichen. Die Altstadt ist gut zu Fuß zu besichtigen, und die Burg ist von überall sichtbar."], r: ["pvx.zu"] },
          { q: "A plan of yours: is it doable? (machbar, unmöglich, schwer zu …)", model: ["Ich möchte nächsten Sommer mit dem Velo bis nach Genf fahren. Mit etwas Training ist das machbar."], r: ["pvx.bar"] },
          { q: "Rate a book or a film: was it easy to understand?", model: ["Der Film war gut zu verstehen, aber die Musik war manchmal kaum zu ertragen."], r: ["pvx.zu"] },
          { q: "Write a recipe step by step with ist … zu … (Die Zwiebeln sind klein zu schneiden.)", model: ["Die Zwiebeln sind klein zu schneiden. Die Kartoffeln sind zwanzig Minuten zu kochen. Zum Schluss ist alles mit Käse zu bestreuen."], r: ["pvx.must"] },
          { q: "Something that can't be changed — and how you live with it.", model: ["Das Wetter in der Schweiz ist nicht zu ändern. Ich habe immer einen Schirm dabei."], r: ["pvx.three"] },
        ] },
      ],
    },
  },
});

// What chapter 25 became for this lesson.
cxCover({ "25.15": "d25.15" });
