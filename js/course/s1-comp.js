// ── COURSE PACK · Stage 1 · Comparative and superlative ──
// Book: chapter 20 "Comparative and superlative" (Übung 20•8: the
// comparative of an adjective · 20•9: a comparison with als, then the
// superlative with am …sten) and chapter 31 "Comparatives and
// superlatives" (31•14 — the comparative and superlative in front of a
// noun, with endings: der bessere Wein, das größte Zimmer; it is mirrored
// in the adjective-endings lesson, which comes right after this one and
// teaches those endings — s1-adj.js, d31.14). Two sheets: -er + als and
// am …sten (with the umlaut of the short words) · so … wie, the irregular
// ones (gut → besser, viel → mehr) and gern → lieber → am liebsten.
cxPack({
  id: "s1-comp",
  sections: {
    "s1.comp": {
      testout: { n: 6, miss: 1 },
      rules: {
        "comp.er": "comparing two: add -er, then als (kleiner als)",
        "comp.uml": "short words often take an umlaut: älter, größer, jünger",
        "comp.am": "the most: am …sten (am ältesten after -t, -d, -s, -z)",
        "comp.wie": "as … as: so … wie (als only after -er)",
        "comp.irr": "irregular: besser (gut), mehr (viel), höher, näher",
        "comp.gern": "gern, lieber, am liebsten: like, prefer, like most",
      },
      sheets: [
        { id: "cx.comp1", title: "größer als · am größten", qn: 3,
          struct: [["adjective", "thing"], ["+ er", "end"], ["als …", "pre"], ["·", "mid"], ["am", "pre"], ["…sten", "end"]],
          why: "To compare two things, add **-er** to the adjective and use **als** for *than*. For the most of all, use **am** …**sten**. German never uses *more* or *most* here: interessant**er**.",
          rid: ["comp.er", "comp.uml", "comp.am"],
          rules: [
            "To compare two things, add **-er** and use **als**: klein**er als** · schnell**er als**. Long words work the same: interessant**er**, never ~~mehr interessant~~. Words in -el or -er drop an e: **dunkler**, **teurer**.",
            "Many short words also take an **umlaut**: alt → **älter** · groß → **größer** · jung → **jünger**. The same goes for warm, kalt, lang, kurz, stark, oft: **wärmer, kälter, länger, kürzer, stärker, öfter**.",
            "For the most of all, use **am** + **-sten**: am klein**sten** · am schnell**sten**. After -t, -d, -s, -ß or -z, add an **e**: am ält**esten** · am kürz**esten**. One exception: am **größten**.",
          ],
          table: { head: ["", "-er", "am …sten"], rows: [
            ["klein", "kleiner", "am kleinsten"], ["schnell", "schneller", "am schnellsten"],
            ["alt", "**ä**lter", "am **ä**ltesten"], ["kurz", "k**ü**rzer", "am k**ü**rzesten"], ["teuer", "teu**rer**", "am teuersten"],
          ] },
          ex: [
            ["Der Zug ist **schneller als** das Auto — und viel bequemer.", "The train is faster than the car — and much more comfortable."],
            ["Im Tessin ist es meistens **wärmer als** in Basel.", "In Ticino it's usually warmer than in Basel."],
            ["Im Dezember sind die Tage **am kürzesten**.", "In December the days are at their shortest."],
            ["Diese Wohnung ist **teurer**, aber auch **heller**.", "This flat is more expensive, but brighter too."],
          ],
          trap: "*Than* is always **als**, never ~~dann~~ or ~~wie~~: größer **als** Bern. And don't put *more* in front: **teurer**, not ~~mehr teuer~~.",
          quiz: [
            { at: "r1", k: "pick", q: "Bern ist ___ als Zürich. (klein)", o: ["kleiner", "mehr klein", "am kleinsten"], a: 0, why: "Comparing two things: add **-er**, then als." },
            { at: "r1", k: "type", cx: true, q: "(teuer) Ein Taxi ist ___ als der Bus.", a: ["teurer"], r: ["comp.er"], why: "teuer drops an e before -er: **teurer**." },
            { at: "r1", k: "pick", q: "more interesting:", o: ["interessanter", "mehr interessant"], a: 0, why: "Long words add -er too: **interessanter**." },
            { at: "r2", k: "pick", q: "Mein Bruder ist ___ als ich. (alt)", o: ["älter", "alter", "mehr alt"], a: 0, why: "alt takes an umlaut: **älter**." },
            { at: "r2", k: "type", cx: true, q: "(jung) Lea ist zwei Jahre ___ als Tom.", a: ["jünger"], r: ["comp.uml"], why: "jung takes an umlaut: **jünger**." },
            { at: "r2", k: "pick", q: "(lang) Im Juni sind die Tage ___.", o: ["länger", "langer", "mehr lang"], a: 0, why: "lang takes an umlaut: **länger**." },
            { at: "r3", k: "pick", q: "Im Juli ist es am ___. (heiß)", o: ["heißesten", "heißsten", "heißer"], a: 0, why: "heiß ends in -ß, so add an e: am **heißesten**." },
            { at: "r3", k: "type", cx: true, q: "(schnell) Wer läuft am ___?", a: ["schnellsten"], r: ["comp.am"], why: "After am, add -sten: am **schnellsten**." },
            { at: "table", k: "pick", q: "kurz → am ___", o: ["kürzesten", "kürzsten", "kurzen"], a: 0, why: "kurz ends in -z, so add an e (and an umlaut): am **kürzesten**." },
            { at: "trap", k: "pick", q: "bigger than Bern:", o: ["größer als Bern", "größer dann Bern", "größer wie Bern"], a: 0, why: "*Than* is always **als**." },
            { at: "trap", k: "pick", q: "more expensive:", o: ["teurer", "mehr teuer"], a: 0, why: "Don't use mehr; just add -er: **teurer**." },
          ] },
        { id: "cx.comp2", title: "so … wie · besser · lieber", qn: 3,
          struct: [["so", "pre"], ["adjective", "thing"], ["wie", "pre"], ["·", "mid"], ["gut", "thing"], ["besser", "end"], ["am besten", "end"]],
          why: "**so … wie** means *as … as*, and **nicht so … wie** means *not as … as*. A few common words are irregular: **gut, besser** · **viel, mehr** · **gern, lieber, am liebsten**.",
          rid: ["comp.wie", "comp.irr", "comp.gern"],
          rules: [
            "For *as … as*, use **so … wie**: **so** groß **wie** · **genauso** teuer **wie** · **nicht so** schnell **wie**. Use **als** only after an -er word: größer **als**.",
            "Some words are irregular: gut, **besser**, am **besten** · viel, **mehr**, am **meisten** · hoch, **höher**, am **höchsten** · nah, **näher**, am **nächsten**. *More and more* is **immer** + -er: immer besser.",
            "**gern**, **lieber** and **am liebsten** go with any verb and mean *like*, *prefer*, *like most*: Ich fahre **gern** Velo. · Ich trinke **lieber** Tee als Kaffee. · **Am liebsten** wandere ich.",
          ],
          table: { head: ["", "more", "the most"], rows: [
            ["gut", "besser", "am besten"], ["viel", "mehr", "am meisten"], ["gern", "lieber", "am liebsten"],
            ["hoch", "höher", "am höchsten"], ["nah", "näher", "am nächsten"],
          ] },
          ex: [
            ["Mein Velo ist **genauso alt wie** deins.", "My bike is just as old as yours."],
            ["Heute geht es mir schon **besser**.", "I'm already feeling better today."],
            ["Ich wohne **lieber** auf dem Land **als** in der Stadt.", "I'd rather live in the country than in town."],
            ["Was isst du **am liebsten**? — Raclette!", "What do you like eating most? — Raclette!"],
          ],
          trap: "After so it's **wie**, after -er it's **als**: so alt **wie** ich, älter **als** ich. Not ~~so alt als~~, not ~~älter wie~~. And *more* is **mehr**, not ~~vieler~~.",
          quiz: [
            { at: "r1", k: "pick", q: "Lena ist so groß ___ ihre Mutter.", o: ["wie", "als"], a: 0, why: "After so, use **wie**." },
            { at: "r1", k: "pick", q: "Heute ist es wärmer ___ gestern.", o: ["als", "wie"], a: 0, why: "After an -er word, use **als**." },
            { at: "r1", k: "pick", q: "not as expensive as the house:", o: ["nicht so teuer wie das Haus", "nicht so teuer als das Haus", "nicht teurer wie das Haus"], a: 0, why: "*Not as … as* is **nicht so … wie**." },
            { at: "r2", k: "type", cx: true, q: "(gut) Dein Deutsch wird immer ___.", a: ["besser"], r: ["comp.irr"], why: "gut is irregular: **besser**." },
            { at: "r2", k: "pick", q: "(viel) Wir brauchen ___ Zeit.", o: ["mehr", "vieler", "mehrere"], a: 0, why: "viel is irregular: **mehr**." },
            { at: "r2", k: "pick", q: "Welcher Berg ist am ___? (hoch)", o: ["höchsten", "hohesten", "hochesten"], a: 0, why: "hoch is irregular: höher, am **höchsten**." },
            { at: "r3", k: "pick", q: "I'd rather drink tea: Ich trinke ___ Tee.", o: ["lieber", "gerner", "mehr gern"], a: 0, why: "*Rather* is **lieber**, the comparative of gern." },
            { at: "r3", k: "type", cx: true, q: "(gern) Was machst du am ___?", a: ["liebsten"], r: ["comp.gern"], why: "*Like most* is am **liebsten**." },
            { at: "table", k: "pick", q: "viel → am ___", o: ["meisten", "vielsten", "mehrsten"], a: 0, why: "viel is irregular: mehr, am **meisten**." },
            { at: "trap", k: "pick", q: "Which is right?", o: ["Er ist so alt wie ich.", "Er ist so alt als ich.", "Er ist älter wie ich."], a: 0, why: "so … **wie**, but älter **als**." },
          ] },
      ],
      diag: [
        { t: "swap", from: "^wie$", to: "^als$", rule: "comp.er", msg: "After an -er word, *than* is **als**: größer als, besser als." },
        { t: "swap", from: "^als$", to: "^wie$", rule: "comp.wie", msg: "After so, genauso or nicht so, use **wie**: so groß wie." },
        { t: "seq", seq: ["^mehr$", "^(schon|interessant|teuer|wichtig|gross|klein|schnell|langsam|alt|jung|lang|kurz|gunstig|billig|warm|kalt|spannend|bequem|praktisch|gesund|hell|dunkel|ruhig|laut|schwer|leicht|einfach|gut|nah|hoch|stark)$"], rule: "comp.er", msg: "Don't use mehr here: add **-er** to the adjective, even a long one: teurer, interessanter." },
        { t: "swap", from: "^(guter|gutest\\w*|gutst\\w*|vieler|vielst\\w*|vielest\\w*|hocher|hochst\\w*|hohest\\w*|hochest\\w*|nahst\\w*|nahest\\w*|gerner|gernst\\w*|gernest\\w*)$", to: "^(besser|best\\w*|mehr|meist\\w*|hoher|hochst\\w*|naher|nachst\\w*)$", rule: "comp.irr", hard: true, msg: "This one is irregular: **{right}**. (gut, besser, am besten · viel, mehr, am meisten · hoch, höher, am höchsten · nah, näher, am nächsten)" },
        { t: "swap", from: "^(gern|gerne|gerner|gernst\\w*|mehr)$", to: "^(lieber|liebst\\w*)$", rule: "comp.gern", hard: true, msg: "gern is irregular: gern, **lieber**, am liebsten. Here it's **{right}**." },
        { t: "swap", from: "^(dunkel|edel|eitel|nobel|simpel|flexibel|sensibel|plausibel|komfortabel|miserabel|teuer|sauer|ungeheuer)er$", to: "^(dunkl|edl|eitl|nobl|simpl|flexibl|sensibl|plausibl|komfortabl|miserabl|teur|saur|ungeheur)er$", rule: "comp.er", hard: true, msg: "Words ending in -el or -er drop that e before the ending: **{right}** (dunkler, teurer)." },
        { t: "swap", from: "^\\w+[tdsz]sten$", to: "^\\w+esten$", rule: "comp.am", hard: true, msg: "After -t, -d, -s, -ß or -z, add an e: am **{right}**." },
        { t: "swap", from: "^\\w+[^tdszaeiouh]esten$", to: "^\\w+[^e]sten$", rule: "comp.am", hard: true, msg: "-esten is only for words ending in -t, -d, -s, -ß or -z. Here it's am **{right}**." },
        { t: "missing", tok: "^am$", rule: "comp.am", msg: "For *the most* after a verb, use **am** + -sten: am schnellsten." },
        { t: "ending", stem: "\\w+st", rule: "comp.am", msg: "After am, the superlative always ends in **-sten**: am **{right}**." },
        { t: "ending", stem: "(billig|teu|dunk|interessant|gross|alt|neu|schnell|langsam|schwer|leicht|kurz|lang|nah|warm|kalt|jung|stark|ruhig|fruh|spat|gesund|hell|laut|oft|praktisch|bequem|gemutlich|wichtig|suss|heiss|klein|fleissig)", rule: "", msg: "Right word, wrong form: **{right}**. To compare two, add -er; for the most, use am …sten." },
      ],
      drills: [
        // ── Übung 20•8: the comparative ──
        { id: "d20.8", ex: "20.8", t: "type", title: "-er", how: "Write the comparative: add -er (short words often take an umlaut).", items: [
          { q: "schnell → ___", a: ["schneller"], r: ["comp.er"] },
          { q: "langsam → ___", a: ["langsamer"], r: ["comp.er"] },
          { q: "billig → ___", a: ["billiger"], r: ["comp.er"] },
          { q: "teuer → ___", a: ["teurer"], r: ["comp.er"] },
          { q: "neu → ___", a: ["neuer"], r: ["comp.er"] },
          { q: "lang → ___", a: ["länger"], r: ["comp.uml"] },
          { q: "schwer → ___", a: ["schwerer"], r: ["comp.er"] },
          { q: "leicht → ___", a: ["leichter"], r: ["comp.er"] },
          { q: "kurz → ___", a: ["kürzer"], r: ["comp.uml"] },
          { q: "nah → ___", a: ["näher"], r: ["comp.uml"] },
          { q: "dunkel → ___", a: ["dunkler"], r: ["comp.er"] },
          { q: "alt → ___", a: ["älter"], r: ["comp.uml"] },
          { q: "fleißig → ___", a: ["fleißiger"], r: ["comp.er"] },
          { q: "warm → ___", a: ["wärmer"], r: ["comp.uml"] },
          { q: "praktisch → ___", a: ["praktischer"], r: ["comp.er"] },
        ] },
        // ── our own: the umlaut — picked (typing never asks for it) ──
        { id: "dcomp.uml", t: "pick", title: "älter or alter?", how: "Pick the comparative. Many short words take an umlaut.", items: [
          { q: "Mein Bruder ist zwei Jahre ___ als ich. (alt)", o: ["älter", "alter"], a: ["älter"], r: ["comp.uml"] },
          { q: "Zürich ist ___ als Bern. (groß)", o: ["größer", "großer"], a: ["größer"], r: ["comp.uml"] },
          { q: "Im Tessin ist es meistens ___ als in Basel. (warm)", o: ["wärmer", "warmer"], a: ["wärmer"], r: ["comp.uml"] },
          { q: "Meine Schwester ist ___ als mein Bruder. (jung)", o: ["jünger", "junger"], a: ["jünger"], r: ["comp.uml"] },
          { q: "Mit dem Velo bin ich ___ als mit dem Tram. (schnell)", o: ["schneller", "schnäller"], a: ["schneller"], r: ["comp.er"] },
          { q: "Im Januar ist der See ___ als im Mai. (kalt)", o: ["kälter", "kalter"], a: ["kälter"], r: ["comp.uml"] },
          { q: "Der Weg über den Hügel ist ___. (kurz)", o: ["kürzer", "kurzer"], a: ["kürzer"], r: ["comp.uml"] },
          { q: "Der Kaffee hier ist ___ als bei uns im Büro. (stark)", o: ["stärker", "starker"], a: ["stärker"], r: ["comp.uml"] },
          { q: "Das Konzert war ___ als der Film. (laut)", o: ["lauter", "läuter"], a: ["lauter"], r: ["comp.er"] },
          { q: "Ich gehe jetzt ___ ins Fitnessstudio. (oft)", o: ["öfter", "ofter"], a: ["öfter"], r: ["comp.uml"] },
        ] },
        // ── our own: compare two — -er + als ──
        { id: "dcomp.als", t: "type", title: "… als …", how: "Write the comparative of the word in brackets.", items: [
          { q: "(billig) Im Coop ist das Brot heute ___ als in der Migros.", a: ["billiger"], r: ["comp.er"] },
          { q: "(teuer) Ein Taxi ist viel ___ als der Bus.", a: ["teurer"], r: ["comp.er"] },
          { q: "(dunkel) Die neue Jacke ist ___ als die alte.", a: ["dunkler"], r: ["comp.er"] },
          { q: "(interessant) Der zweite Film war ___ als der erste.", a: ["interessanter"], r: ["comp.er"] },
          { q: "(groß) Unsere neue Wohnung ist ___ als die alte.", a: ["größer"], r: ["comp.uml"] },
          { q: "(alt) Mein Velo ist schon ___ als meine Tochter.", a: ["älter"], r: ["comp.uml"] },
          { q: "(ruhig) Auf dem Land ist es ___ als in der Stadt.", a: ["ruhiger"], r: ["comp.er"] },
          { q: "(lang) Die Reise mit dem Bus dauert ___ als mit dem Zug.", a: ["länger"], r: ["comp.uml"] },
          { q: "(schwer) Die Prüfung war ___ als der Test im Kurs.", a: ["schwerer"], r: ["comp.er"] },
          { q: "(früh) Im Sommer stehe ich ___ auf als im Winter.", a: ["früher"], r: ["comp.er"] },
          { q: "(gesund) Velofahren ist ___ als Autofahren.", a: ["gesünder"], r: ["comp.uml"] },
          { q: "(spät) Der Zug kommt heute zehn Minuten ___.", a: ["später"], r: ["comp.er"] },
        ] },
        // ── our own: the most — am …sten ──
        { id: "dcomp.am", t: "type", title: "am …sten", how: "Write the superlative after am: -sten, or -esten after -t, -d, -s, -ß, -z.", items: [
          { q: "(heiß) Im Juli ist es am ___.", a: ["heißesten"], r: ["comp.am"] },
          { q: "(bequem) Mit dem Zug reist man am ___.", a: ["bequemsten"], r: ["comp.am"] },
          { q: "(alt) In unserer Familie ist mein Opa am ___.", a: ["ältesten"], r: ["comp.am", "comp.uml"] },
          { q: "(kurz) Im Dezember sind die Tage am ___.", a: ["kürzesten"], r: ["comp.am", "comp.uml"] },
          { q: "(billig) Von den drei Velos ist dieses am ___.", a: ["billigsten"], r: ["comp.am"] },
          { q: "(schnell) Von allen Kollegen arbeitet Nina am ___.", a: ["schnellsten"], r: ["comp.am"] },
          { q: "(lang) Im Juni sind die Tage am ___.", a: ["längsten"], r: ["comp.am", "comp.uml"] },
          { q: "(ruhig) Welches Zimmer ist am ___?", a: ["ruhigsten"], r: ["comp.am"] },
          { q: "(teuer) Von den drei Wohnungen ist diese am ___.", a: ["teuersten"], r: ["comp.am"] },
          { q: "(gemütlich) Das kleine Café am Bahnhof ist am ___.", a: ["gemütlichsten"], r: ["comp.am"] },
          { q: "(wichtig) Was ist für dich am ___?", a: ["wichtigsten"], r: ["comp.am"] },
          { q: "(süß) Die Erdbeeren aus dem Wallis sind am ___.", a: ["süßesten"], r: ["comp.am"] },
        ] },
        // ── our own: als or wie? ──
        { id: "dcomp.wie", t: "pick", title: "als or wie?", how: "Pick als after an -er word, wie after so, genauso or nicht so.", o: ["als", "wie"], items: [
          { q: "Lena ist so groß ___ ihre Mutter.", a: ["wie"], r: ["comp.wie"] },
          { q: "Der Bus ist langsamer ___ der Zug.", a: ["als"], r: ["comp.er"] },
          { q: "Bern ist nicht so groß ___ Zürich.", a: ["wie"], r: ["comp.wie"] },
          { q: "Heute ist es wärmer ___ gestern.", a: ["als"], r: ["comp.er"] },
          { q: "Mein Deutsch ist besser ___ letztes Jahr.", a: ["als"], r: ["comp.irr"] },
          { q: "Das neue Velo ist genauso teuer ___ das alte.", a: ["wie"], r: ["comp.wie"] },
          { q: "Ich trinke lieber Tee ___ Kaffee.", a: ["als"], r: ["comp.gern"] },
          { q: "Er spricht so schnell ___ ein Radiomoderator.", a: ["wie"], r: ["comp.wie"] },
          { q: "Die Wohnung ist doppelt so groß ___ unsere.", a: ["wie"], r: ["comp.wie"] },
          { q: "Niemand kocht besser ___ meine Oma.", a: ["als"], r: ["comp.irr"] },
          { q: "Der Test war nicht so schwer ___ der letzte.", a: ["wie"], r: ["comp.wie"] },
        ] },
        // ── our own: besser, mehr, höher, näher ──
        { id: "dcomp.irr", t: "type", title: "besser, mehr, am höchsten", how: "Write the comparative or the superlative. These words are irregular.", items: [
          { q: "(gut) Dein Deutsch ist schon viel ___!", a: ["besser"], r: ["comp.irr"] },
          { q: "(viel) Im Sommer arbeite ich ___ als im Winter.", a: ["mehr"], r: ["comp.irr"] },
          { q: "(gut) Welcher Käse schmeckt dir am ___?", a: ["besten"], r: ["comp.irr"] },
          { q: "(hoch) Welcher Berg ist am ___?", a: ["höchsten"], r: ["comp.irr"] },
          { q: "(nah) Welche Haltestelle ist am ___?", a: ["nächsten"], r: ["comp.irr"] },
          { q: "(viel) Wer isst bei uns am ___?", a: ["meisten"], r: ["comp.irr"] },
          { q: "(hoch) Die Mieten in Genf sind ___ als in Biel.", a: ["höher"], r: ["comp.irr"] },
          { q: "(nah) Das Spital ist ___ als die Praxis.", a: ["näher"], r: ["comp.irr"] },
          { q: "(gut) Mit dem Zug geht es am ___.", a: ["besten"], r: ["comp.irr"] },
          { q: "(viel) Ich möchte ___ Zeit für meine Familie.", a: ["mehr"], r: ["comp.irr"] },
          { q: "(teuer) Alles wird immer ___!", a: ["teurer"], r: ["comp.irr", "comp.er"] },
        ] },
        // ── our own: gern, lieber, am liebsten ──
        { id: "dcomp.gern", t: "type", title: "gern, lieber, am liebsten", how: "Write gern, lieber or liebsten (like, prefer, like most).", items: [
          { q: "(gern) Ich trinke Kaffee, aber noch ___ Tee.", a: ["lieber"], r: ["comp.gern"] },
          { q: "(gern) Was machst du am Wochenende am ___?", a: ["liebsten"], r: ["comp.gern"] },
          { q: "(gern) Wir fahren ___ mit dem Zug als mit dem Auto.", a: ["lieber"], r: ["comp.gern"] },
          { q: "(gern) Ich esse sehr ___ Pasta.", a: ["gern", "gerne"], r: ["comp.gern"] },
          { q: "(gern) Am ___ wandere ich im Herbst.", a: ["liebsten"], r: ["comp.gern"] },
          { q: "(gern) Möchtest du ___ ins Kino oder ins Theater?", a: ["lieber"], r: ["comp.gern"] },
          { q: "(gern) Meine Kinder spielen am ___ draußen.", a: ["liebsten"], r: ["comp.gern"] },
          { q: "(gern) Ich bleibe heute ___ zu Hause — ich bin müde.", a: ["lieber"], r: ["comp.gern"] },
          { q: "(gern) Welches Fach hattest du in der Schule am ___?", a: ["liebsten"], r: ["comp.gern"] },
          { q: "(gern) Sie tanzt sehr ___.", a: ["gern", "gerne"], r: ["comp.gern"] },
        ] },
        // ── Übung 20•9: compare — then the most ──
        { id: "d20.9", ex: "20.9", t: "transform", title: "More — and the most", how: "With als, compare the sentence with the cue. With am …sten, the cue is the most of all.", items: [
          { q: "Basel ist groß. (Bern → als)", a: ["Basel ist größer als Bern."], r: ["comp.uml"] },
          { q: "Basel ist groß. (Zürich → am …sten)", a: ["Zürich ist am größten."], r: ["comp.am"] },
          { q: "Das Tram fährt schnell. (der Bus → als)", a: ["Das Tram fährt schneller als der Bus."], r: ["comp.er"] },
          { q: "Das Tram fährt schnell. (die S-Bahn → am …sten)", a: ["Die S-Bahn fährt am schnellsten."], r: ["comp.am"] },
          { q: "Lukas spricht gut Französisch. (seine Frau → als)", a: ["Lukas spricht besser Französisch als seine Frau.", "Lukas spricht Französisch besser als seine Frau."], r: ["comp.irr"], cap: true },
          { q: "Lukas spricht gut Französisch. (seine Tochter → am …sten)", a: ["Seine Tochter spricht am besten Französisch.", "Seine Tochter spricht Französisch am besten."], r: ["comp.irr"] },
          { q: "Der Juli war heiß. (der Juni → als)", a: ["Der Juli war heißer als der Juni."], r: ["comp.er"] },
          { q: "Der Juli war heiß. (der August → am …sten)", a: ["Der August war am heißesten."], r: ["comp.am"] },
          { q: "Die Miete in Thun ist teuer. (in Biel → als)", a: ["Die Miete in Thun ist teurer als in Biel."], r: ["comp.er"] },
          { q: "Die Miete in Thun ist teuer. (in Zürich → am …sten)", a: ["Die Miete in Zürich ist am teuersten.", "In Zürich ist die Miete am teuersten."], r: ["comp.am"] },
          { q: "Unsere Gäste sind früh gekommen. (die Nachbarn → als)", a: ["Unsere Gäste sind früher gekommen als die Nachbarn.", "Unsere Gäste sind früher als die Nachbarn gekommen."], r: ["comp.er"] },
          { q: "Unsere Gäste sind früh gekommen. (meine Eltern → am …sten)", a: ["Meine Eltern sind am frühesten gekommen."], r: ["comp.am"] },
        ] },
        // ── Production ──
        { id: "dp.comp", t: "translate", end: true, title: "Say it in German", how: "Translate: -er + als, so … wie, am …sten, and the irregular besser, mehr, lieber.", items: [
          { q: "Bern is smaller than Zürich.", a: ["Bern ist kleiner als Zürich."], r: ["comp.er"] },
          { q: "My sister is as tall as me.", a: ["Meine Schwester ist so groß wie ich.", "Meine Schwester ist genauso groß wie ich."], r: ["comp.wie"] },
          { q: "The train is faster than the car.", a: ["Der Zug ist schneller als das Auto."], r: ["comp.er"] },
          { q: "I'd rather drink tea.", a: ["Ich trinke lieber Tee."], r: ["comp.gern"] },
          { q: "Who runs the fastest?", a: ["Wer läuft am schnellsten?", "Wer rennt am schnellsten?"], r: ["comp.am"] },
          { q: "Your German is getting better and better. (du)", a: ["Dein Deutsch wird immer besser."], r: ["comp.irr"] },
          { q: "In Ticino it's warmer than in Bern.", a: ["Im Tessin ist es wärmer als in Bern."], r: ["comp.uml"] },
          { q: "The flat isn't as expensive as the house.", a: ["Die Wohnung ist nicht so teuer wie das Haus."], r: ["comp.wie"] },
          { q: "What do you like doing most? (du)", a: ["Was machst du am liebsten?"], r: ["comp.gern"] },
          { q: "We need more time.", a: ["Wir brauchen mehr Zeit."], r: ["comp.irr"] },
          { q: "In winter the days are the shortest.", a: ["Im Winter sind die Tage am kürzesten."], r: ["comp.am"] },
          { q: "My brother is older than me.", a: ["Mein Bruder ist älter als ich."], r: ["comp.uml"] },
        ] },
        { id: "dw.comp", t: "write", end: true, title: "Write your own", how: "In your own words — saved for Claude to correct.", items: [
          { q: "Compare two Swiss towns you know (größer, ruhiger, teurer …).", model: ["Luzern ist kleiner als Zürich, aber genauso schön. Zürich ist teurer, und in Luzern ist es ruhiger."], r: ["comp.er", "comp.wie"] },
          { q: "Your home country and Switzerland: three differences.", model: ["In meinem Land ist es wärmer als hier. Die Wohnungen sind billiger, aber die Züge sind langsamer."], r: ["comp.er", "comp.uml"] },
          { q: "Your family: who is the oldest, the youngest, the tallest?", model: ["Mein Vater ist am ältesten. Meine kleine Schwester ist am jüngsten, aber mein Bruder ist am größten."], r: ["comp.am"] },
          { q: "What do you like, prefer, like most? (gern, lieber, am liebsten)", model: ["Ich koche gern. Ich esse lieber Fisch als Fleisch, und am liebsten esse ich Rösti."], r: ["comp.gern"] },
          { q: "Train, bus, car or bike — which is best for you, and why?", model: ["Für mich ist der Zug am besten. Er ist schneller als der Bus und bequemer als das Velo."], r: ["comp.irr", "comp.er"] },
          { q: "Your German now and a year ago.", model: ["Mein Deutsch ist viel besser als letztes Jahr. Ich verstehe mehr und spreche schneller."], r: ["comp.irr"] },
          { q: "Two flats you have seen — compare them.", model: ["Die erste Wohnung ist heller und größer, aber die zweite ist nicht so teuer wie die erste."], r: ["comp.er", "comp.wie"] },
          { q: "The seasons: when is it the most beautiful where you live?", model: ["Im Herbst ist es am schönsten. Dann sind die Wälder bunt, und es ist nicht so heiß wie im Sommer."], r: ["comp.am", "comp.wie"] },
        ] },
      ],
    },
  },
});

// What chapter 20's comparative became (31•14, with endings: s1-adj.js).
cxCover({ "20.8": "d20.8", "20.9": "d20.9" });
// The rest of chapter 20 — the genitive — is Stage 2's (Session 6, which
// uploads chapter 20 again): its case and wessen (20•1, 20•2, 20•5, 20•6:
// its endings with an adjective), its prepositions wegen, trotz, während,
// anstatt (20•3, 20•7). 20•4 ("Possession") is the possessives lesson's.
cxCover({
  "20.1": { st: "planned", sec: "s2.gen" }, "20.2": { st: "planned", sec: "s2.gen" },
  "20.5": { st: "planned", sec: "s2.gen" }, "20.6": { st: "planned", sec: "s2.gen" },
  "20.3": { st: "planned", sec: "s2.genprep" }, "20.7": { st: "planned", sec: "s2.genprep" },
});
// Chapter 31 was uploaded for its comparatives (31•14, s1-adj.js); its
// dialogues and their exercises are the conversation units' (Session 8,
// which uploads it again) and the subjunctive review is Konjunktiv II's
// (Session 7).
cxCover({
  "31.1": { st: "planned", sec: "s3.bus" },
  "31.2": { st: "planned", sec: "s3.school" }, "31.3": { st: "planned", sec: "s3.school" },
  "31.4": { st: "planned", sec: "s3.school" }, "31.5": { st: "planned", sec: "s3.school" },
  "31.6": { st: "planned", sec: "s3.shop" }, "31.7": { st: "planned", sec: "s3.shop" }, "31.8": { st: "planned", sec: "s3.shop" },
  "31.10": { st: "planned", sec: "s3.shop" }, "31.11": { st: "planned", sec: "s3.shop" }, "31.12": { st: "planned", sec: "s3.shop" },
  "31.9": { st: "planned", sec: "s2.k2" },
  "31.13": { st: "planned", sec: "s3.travel" },
});
// A writing prompt for once comparison is done.
cxJournal([
  { id: "w.compare", th: "swiss", lv: "A2", de: "Hier und dort", t: "Compare life in your home country with life in Switzerland: prices, weather, transport, people — and what you like best here.", help: ["In der Schweiz ist … teurer als …", "… ist nicht so … wie …", "Hier fahre ich lieber …", "Am besten gefällt mir …"], sec: "s1.comp" },
]);
