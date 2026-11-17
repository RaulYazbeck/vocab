// ── COURSE PACK · Stage 3 · 💬 Shopping and prices ──
// Book: chapter 31 "Shopping", "Einkaufen", "Euro und Cent", "Im Kaufhaus"
// (Übung 31•6 · 31•7 answers about a shopping trip and short shop talk ·
// 31•8 the words of a line in their right form · 31•10 prices · 31•11
// sizes and amounts · 31•12 the conversation rewritten) and 31•9 (it
// stands under "Subjunctive review" but answers questions about a
// conversation before going shopping — Session 7 gave it to this unit).
// Our own dialogues: a jacket in a Zurich shop, the cheese counter at the
// market. Swiss money: francs and Rappen, CHF 4.50 said vier Franken
// fünfzig. It comes right after the adjective endings (after comparison,
// the possessives and the modals), so die rote Jacke, eine Nummer größer,
// Den nehme ich are taught — and nothing later: no zu-infinitive, no
// Konjunktiv II (Ich hätte gern is the travel unit's), no passive — the
// book's «Hier werden … eröffnet» is mirrored with es gibt.
cxPack({
  id: "s3-shop",
  sections: {
    "s3.shop": {
      testout: { n: 7, miss: 1 },
      rules: {
        "shop.help": "In the shop: Ich suche … · Danke, ich schaue nur.",
        "shop.try": "Trying on: anprobieren; passen, stehen, gefallen + dative",
        "shop.size": "Size and colour: eine Nummer größer, die rote Jacke",
        "shop.take": "Deciding: Den nehme ich. · Ich überlege es mir noch.",
        "shop.price": "Prices: Was kostet …? — vier Franken fünfzig",
        "shop.amount": "Amounts and sizes: 200 Gramm Käse, zwei Meter lang",
        "shop.pay": "Paying: Sonst noch etwas? · Bar oder mit Karte?",
      },
      sheets: [
        { id: "cx.shop1", title: "In the shop: trying on, size, colour", qn: 3,
          struct: [["Haben Sie", "verb"], ["die Jacke", "who"], ["eine Nummer größer?", "end"]],
          why: "Buying clothes is a short script: say what you're looking for, try it on, ask for another size or colour, decide. Use the adjective endings you've learned: die rote Jacke, einen warmen Pulli.",
          rid: ["shop.help", "shop.try", "shop.size", "shop.take"],
          rules: [
            "The assistant asks **Kann ich Ihnen helfen?** You answer **Ich suche …** or **Ich möchte …** + the accusative: Ich suche **einen** warmen Pulli. If you're only looking: **Danke, ich schaue nur.**",
            "Ask **Darf ich das anprobieren?** — **Die Kabine ist dort hinten.** Then say how it is with the dative: Die Hose **passt mir** (fits me) · Die Farbe **steht mir** (suits me) · Der Pulli **gefällt mir** (I like it).",
            "Ask **Haben Sie das eine Nummer größer / kleiner?** · **Gibt es die Jacke auch in Schwarz?** Before a noun a colour takes its ending (die **rote** Jacke, den **blauen** Pulli); after sein, none: Die Jacke ist **rot**.",
            "To decide, use a pronoun for the thing, by its gender, in the accusative. First in the sentence: **den / die / das** — Der Pulli? **Den** nehme ich. After the verb: **ihn / sie / es** — Ich nehme **ihn**. Not yet? **Ich überlege es mir noch.**",
          ],
          lines: [
            ["Verkäuferin", "Grüezi! Kann ich Ihnen helfen?", "Hello! Can I help you?"],
            ["Herr Rossi", "Ja, gern. Ich suche eine warme Jacke für den Winter.", "Yes, please. I'm looking for a warm jacket for the winter."],
            ["Verkäuferin", "Welche Größe haben Sie?", "What size are you?"],
            ["Herr Rossi", "Normalerweise L.", "Usually L."],
            ["Verkäuferin", "Wie gefällt Ihnen diese hier, die graue?", "How do you like this one here, the grey one?"],
            ["Herr Rossi", "Nicht schlecht. Darf ich sie anprobieren?", "Not bad. May I try it on?"],
            ["Verkäuferin", "Natürlich, die Kabine ist dort hinten.", "Of course, the changing room is at the back there."],
            ["Herr Rossi", "Hm, sie ist ein bisschen zu eng. Haben Sie sie eine Nummer größer?", "Hm, it's a bit too tight. Do you have it a size bigger?"],
            ["Verkäuferin", "In Grau leider nicht. Aber in Dunkelblau, hier.", "Not in grey, I'm afraid. But in dark blue, here."],
            ["Herr Rossi", "Die passt mir gut, und die Farbe gefällt mir. Was kostet sie?", "That one fits me well, and I like the colour. How much is it?"],
            ["Verkäuferin", "Diese Woche ist sie im Ausverkauf: 89 Franken statt 129.", "This week it's in the sale: 89 francs instead of 129."],
            ["Herr Rossi", "Super, die nehme ich!", "Great, I'll take it!"],
          ],
          ex: [
            ["Ich suche **einen** warmen Pulli. — Welche Größe?", "I'm looking for a warm jumper. — What size?"],
            ["Die Hose **passt mir** nicht. Haben Sie sie **eine Nummer kleiner**?", "The trousers don't fit me. Do you have them a size smaller?"],
            ["Gibt es das Hemd auch **in Weiß**?", "Is the shirt also available in white?"],
            ["Die Schuhe? **Die** nehme ich.", "The shoes? I'll take them."],
          ],
          trap: "**passen**, **stehen** and **gefallen** take the dative: Das Hemd **passt mir** (not ~~mich~~). And *it* for a thing follows its gender, in the accusative: die Jacke → **sie**, der Rock → **ihn** / **den** (Ich nehme ihn · Den nehme ich), das Kleid → **es**.",
          quiz: [
            { at: "r1", k: "pick", q: "Kann ich Ihnen helfen? — Danke, ich ___ nur.", o: ["schaue", "suche", "helfe"], a: 0, why: "*I'm just looking* is **Ich schaue nur.**" },
            { at: "r1", k: "pick", q: "Ich suche ___ Mantel.", o: ["einen", "ein", "einem"], a: 0, why: "suchen takes the accusative: **einen** Mantel." },
            { at: "r2", k: "pick", q: "Die Hose passt ___ nicht.", o: ["mir", "mich", "ich"], a: 0, why: "passen takes the dative: **mir**." },
            { at: "r2", k: "pick", q: "Where can I try it on? — Die ___ ist dort hinten.", o: ["Kabine", "Kasse", "Küche"], a: 0, why: "The changing room is **die Kabine**." },
            { at: "r3", k: "pick", q: "Haben Sie die Jacke eine Nummer ___?", o: ["größer", "mehr groß", "am größten"], a: 0, why: "*A size bigger* is **eine Nummer größer**." },
            { at: "r3", k: "pick", q: "Ich nehme den ___ Pulli.", o: ["blauen", "blaue", "blauer"], a: 0, why: "After den, the adjective ends in -en: den **blauen** Pulli." },
            { at: "r4", k: "pick", q: "Der Rock? ___ nehme ich.", o: ["Den", "Der", "Dem"], a: 0, why: "der Rock is the object here: **Den** nehme ich." },
            { at: "lines", k: "pick", q: "In the dialogue, why does Herr Rossi want another jacket?", o: ["Die graue ist zu eng.", "Die graue ist zu teuer.", "Die Farbe gefällt ihm nicht."], a: 0, why: "He says: sie ist ein bisschen **zu eng**." },
            { at: "trap", k: "pick", q: "Das Kleid steht ___ gut.", o: ["dir", "dich", "du"], a: 0, why: "stehen (to suit) takes the dative: **dir**." },
          ] },
        { id: "cx.shop2", title: "Prices, amounts, paying", qn: 3,
          struct: [["Das macht", "verb"], ["vierzehn Franken", "who"], ["fünfzig", "end"]],
          why: "At the counter you need numbers: prices in francs and Rappen, amounts like 200 Gramm or ein Kilo, and a few lines for paying. In Switzerland a price is written CHF 14.50 and said vierzehn Franken fünfzig.",
          rid: ["shop.price", "shop.amount", "shop.pay"],
          rules: [
            "Ask **Was kostet …?** with a singular noun and **Was kosten …?** with a plural: Die Schuhe **kosten** 80 Franken. Say CHF 14.50 as **vierzehn Franken fünfzig**. Then: **Das ist günstig** (good value) or **Das ist zu teuer.**",
            "An amount comes straight before the thing, with no *of*: **200 Gramm** Käse, **einen Liter** Milch. Kilo, Gramm, Liter, Meter stay singular: drei **Kilo** (but zwei **Flaschen** Wein). A size: Der Tisch ist **zwei Meter lang**.",
            "At the till: **Sonst noch etwas?** — **Nein, danke, das ist alles.** Then **Das macht …** (that's …), **Bar oder mit Karte?**, and **Brauchen Sie eine Quittung?** (a receipt).",
          ],
          lines: [
            ["Verkäufer", "Grüezi! Was darf es sein?", "Hello! What can I get you?"],
            ["Frau Amini", "Ich möchte 300 Gramm Bergkäse, bitte.", "I'd like 300 grams of mountain cheese, please."],
            ["Verkäufer", "Am Stück oder in Scheiben?", "In one piece or sliced?"],
            ["Frau Amini", "Am Stück, bitte. Und was kosten die Äpfel?", "In one piece, please. And how much are the apples?"],
            ["Verkäufer", "Vier Franken zwanzig das Kilo.", "Four francs twenty a kilo."],
            ["Frau Amini", "Dann nehme ich zwei Kilo.", "Then I'll take two kilos."],
            ["Verkäufer", "Gern. Sonst noch etwas?", "Sure. Anything else?"],
            ["Frau Amini", "Ja, einen Liter Milch. Das ist alles.", "Yes, a litre of milk. That's all."],
            ["Verkäufer", "Das macht zusammen achtzehn Franken sechzig.", "That's eighteen francs sixty altogether."],
            ["Frau Amini", "Kann ich mit Karte zahlen?", "Can I pay by card?"],
            ["Verkäufer", "Natürlich. Brauchen Sie eine Tasche?", "Of course. Do you need a bag?"],
            ["Frau Amini", "Nein, danke, ich habe eine dabei.", "No, thanks, I've got one with me."],
          ],
          ex: [
            ["Was **kosten** die Tomaten? — Drei Franken **das Kilo**.", "How much are the tomatoes? — Three francs a kilo."],
            ["Ich möchte **200 Gramm** Schinken und **einen Liter** Milch.", "I'd like 200 grams of ham and a litre of milk."],
            ["Das macht **vierzehn Franken fünfzig**. — Mit Karte, bitte.", "That's fourteen francs fifty. — By card, please."],
            ["Das Sofa ist **zwei Meter lang** und 90 Zentimeter tief.", "The sofa is two metres long and 90 centimetres deep."],
          ],
          trap: "No *of* after an amount: **ein Kilo Äpfel** (not ~~ein Kilo von Äpfeln~~), and Kilo, Liter, Meter stay singular: **zwei Kilo**, **drei Liter**. In Germany prices are in euros and cents with a comma (4,50 €); in Switzerland, francs and Rappen with a point (CHF 4.50).",
          quiz: [
            { at: "r1", k: "pick", q: "Was ___ die Schuhe?", o: ["kosten", "kostet", "kostest"], a: 0, why: "Several things: **kosten**." },
            { at: "r1", k: "pick", q: "CHF 12.80 = ___", o: ["zwölf Franken achtzig", "zwölf achtzig Franken", "achtzig Franken zwölf"], a: 0, why: "The francs first, then the Rappen: **zwölf Franken achtzig**." },
            { at: "r2", k: "pick", q: "*A kilo of apples, please:*", o: ["Ein Kilo Äpfel, bitte.", "Ein Kilo von Äpfeln, bitte.", "Ein Kilo mit Äpfeln, bitte."], a: 0, why: "No *of* after an amount: **ein Kilo Äpfel**." },
            { at: "r2", k: "pick", q: "Ich kaufe drei ___ Kartoffeln.", o: ["Kilo", "Kilos", "Kilogramme"], a: 0, why: "The measure stays singular: drei **Kilo**." },
            { at: "r3", k: "pick", q: "Sonst noch etwas? — ___", o: ["Nein, danke, das ist alles.", "Ja, gern geschehen.", "Das macht nichts."], a: 0, why: "*No thanks, that's all* is **Nein, danke, das ist alles.**" },
            { at: "r3", k: "pick", q: "Bar oder mit Karte? — ___", o: ["Mit Karte, bitte.", "Mit Kasse, bitte.", "Bar Karte, bitte."], a: 0, why: "By card is **mit Karte**." },
            { at: "lines", k: "pick", q: "In the dialogue, how much does Frau Amini pay?", o: ["Achtzehn Franken sechzig.", "Vier Franken zwanzig.", "Acht Franken vierzig."], a: 0, why: "Das macht zusammen **achtzehn Franken sechzig**." },
            { at: "trap", k: "pick", q: "*Two litres of milk:*", o: ["zwei Liter Milch", "zwei Liters Milch", "zwei Liter von Milch"], a: 0, why: "No *of*, and the measure stays singular: **zwei Liter Milch**." },
          ] },
      ],
      diag: [
        { t: "swap", from: "^(mich|dich|ihn|ich|du|er)$", to: "^(mir|dir|ihm)$", rule: "shop.try", msg: "passen, stehen and gefallen take the dative: **{right}**." },
        { t: "swap", from: "^(sie|ihr)$", to: "^ihnen$", rule: "shop.try", msg: "With Sie, *to you* is **Ihnen**: Gefällt **Ihnen** …?" },
        { t: "swap", from: "^kostet$", to: "^kosten$", rule: "shop.price", msg: "A plural takes **kosten**: Die Schuhe kosten …" },
        { t: "swap", from: "^kosten$", to: "^kostet$", rule: "shop.price", msg: "A singular noun takes **kostet**: Das Brot kostet …" },
        { t: "extra", tok: "^von$", rule: "shop.amount", msg: "No *of* after an amount: ein Kilo Äpfel, 200 Gramm Käse." },
        { t: "swap", from: "^(kilos|liters|meters|gramms)$", to: "^(kilo|liter|meter|gramm)$", rule: "shop.amount", hard: true, msg: "The measure stays singular: **{right}**." },
        { t: "swap", from: "^(der|die|das)$", to: "^den$", rule: "", msg: "It's the object here, so a masculine (der) noun takes **den**." },
        { t: "ending", stem: "(blau|rot|schwarz|weiss|grau|braun|grun|gelb|warm|neu|gross|grosser|billig|klein|kleiner|teur|bunt|gestreift)", rule: "", hard: true, msg: "Right word, wrong ending: **{right}**." },
        { t: "ending", stem: "(k?ein|dies|mein|dein|sein|ihr|unser|eu)", rule: "", hard: true, msg: "Right word, wrong ending: **{right}**." },
      ],
      drills: [
        // ── our own: which word? ──
        { id: "dshop.p", t: "pick", title: "Which word?", how: "Pick the word that fits.", items: [
          { q: "Ich suche ___ warmen Mantel.", o: ["einen", "ein", "einem"], a: ["einen"], r: ["shop.help"] },
          { q: "Die Hose passt ___ nicht. (me)", o: ["mir", "mich", "ich"], a: ["mir"], r: ["shop.try"] },
          { q: "Gefällt ___ die Farbe? (you, Sie)", o: ["Ihnen", "Sie", "Ihr"], a: ["Ihnen"], r: ["shop.try"] },
          { q: "Haben Sie die Schuhe eine Nummer ___?", o: ["größer", "mehr groß", "am größten"], a: ["größer"], r: ["shop.size"] },
          { q: "Ich nehme die ___ Schuhe.", o: ["schwarzen", "schwarze", "schwarzer"], a: ["schwarzen"], r: ["shop.size"] },
          { q: "Der Rock? ___ nehme ich.", o: ["Den", "Der", "Dem"], a: ["Den"], r: ["shop.take"] },
          { q: "Die Jacke? Ich nehme ___.", o: ["sie", "ihn", "es"], a: ["sie"], r: ["shop.take"] },
          { q: "Was ___ die Socken?", o: ["kosten", "kostet"], a: ["kosten"], r: ["shop.price"] },
          { q: "Ich möchte zwei ___ Äpfel.", o: ["Kilo", "Kilos", "Kilogramme"], a: ["Kilo"], r: ["shop.amount"] },
          { q: "Einen Liter ___, bitte.", o: ["Milch", "von Milch", "mit Milch"], a: ["Milch"], r: ["shop.amount"] },
          { q: "Zahlen Sie bar oder mit ___?", o: ["Karte", "Kasse", "Kabine"], a: ["Karte"], r: ["shop.pay"] },
        ] },
        // ── our own: a conversation in the shop, in order ──
        { id: "dshop.o", t: "order", title: "In the shop", how: "Put the lines in order.", items: [
          { q: "Winter shoes.", a: ["Grüezi, kann ich Ihnen helfen?", "Ja, ich suche Winterschuhe.", "Welche Größe haben Sie?", "Größe 39."], r: ["shop.help"] },
          { q: "Too small.", a: ["Wie passen die Schuhe?", "Sie sind leider zu klein.", "Möchten Sie sie eine Nummer größer?", "Ja, gern."], r: ["shop.try", "shop.size"] },
          { q: "The colour.", a: ["Gibt es den Pulli auch in Grün?", "Nein, nur in Rot und Blau.", "Dann nehme ich den blauen.", "Gute Wahl!"], r: ["shop.size", "shop.take"] },
          { q: "Just looking.", a: ["Kann ich Ihnen helfen?", "Danke, ich schaue nur.", "Gern. Sagen Sie einfach, wenn Sie Fragen haben.", "Danke."], r: ["shop.help"] },
          { q: "Not sure.", a: ["Und, nehmen Sie die Jacke?", "Ich weiß nicht, sie ist ziemlich teuer.", "Diese Woche gibt es zwanzig Prozent Rabatt.", "Gut, dann nehme ich sie."], r: ["shop.take"] },
          { q: "Too expensive.", a: ["Wie gefällt dir das Kleid?", "Sehr gut, aber es kostet 200 Franken.", "Das ist zu teuer!", "Ja, leider."], r: ["shop.try", "shop.price"] },
          { q: "At the market.", a: ["Was kosten die Erdbeeren?", "Sechs Franken das Kilo.", "Dann ein halbes Kilo, bitte.", "Gern. Sonst noch etwas?"], r: ["shop.price", "shop.amount"] },
          { q: "The deli counter.", a: ["Was darf es sein?", "200 Gramm Schinken, bitte.", "Darf es ein bisschen mehr sein?", "Ja, kein Problem."], r: ["shop.amount"] },
          { q: "At the till.", a: ["Das macht zweiundzwanzig Franken.", "Kann ich mit Karte zahlen?", "Natürlich. Brauchen Sie eine Quittung?", "Nein, danke."], r: ["shop.pay"] },
        ] },
        // ── Übung 31•8: the words in brackets, in their form ──
        { id: "d31.8", ex: "31.8", t: "type", title: "In the right form", how: "Write the words in brackets as they go in the gap. Change the endings if needed.", items: [
          { q: "(dieser Regenmantel) Warum hast du ___ gekauft?", a: ["diesen Regenmantel"], r: ["shop.size"] },
          { q: "(eine blaue Bluse) Warum hast du ___ gekauft?", a: ["eine blaue Bluse"], r: ["shop.size"] },
          { q: "(ein roter Rock) Warum hast du ___ gekauft?", a: ["einen roten Rock"], r: ["shop.size"] },
          { q: "(der blaue Pulli) Sie können ___ anprobieren.", a: ["den blauen Pulli"], r: ["shop.size"] },
          { q: "(ein größerer Rock) Haben Sie auch ___?", a: ["einen größeren Rock"], r: ["shop.size"] },
          { q: "(die billigen Handschuhe) Ich nehme ___.", a: ["die billigen Handschuhe"], r: ["shop.take"] },
          { q: "(ein schwarzer Hut) In diesem Laden gibt es ___.", a: ["einen schwarzen Hut"], r: ["shop.size"] },
          { q: "(die neue Bäckerei) Ich gehe schnell in ___.", a: ["die neue Bäckerei"], r: ["shop.size"] },
          { q: "(sein Mantel) Er zieht ___ aus.", a: ["seinen Mantel"], r: ["shop.help"] },
          { q: "(ich) Das gestreifte Hemd steht ___ nicht.", a: ["mir"], r: ["shop.try"] },
          { q: "(dein Vater) Die Krawatte steht ___ gut.", a: ["deinem Vater"], r: ["shop.try"] },
          { q: "(der Verkäufer) Die Farbe gefällt ___ auch.", a: ["dem Verkäufer"], r: ["shop.try"] },
          { q: "(ihr) Zieht ___ schnell um!", a: ["euch"], r: ["shop.try"] },
          { q: "(ziehen) Warum ___ du die neue Jacke nicht an?", a: ["ziehst"], r: ["shop.try"] },
        ] },
        // ── Übung 31•7: the missing line at the shop ──
        { id: "d31.7", ex: "31.7", t: "answer", title: "The missing line", how: "Write the missing line of the conversation, with what the brackets say.", items: [
          { q: "«Gehen wir heute ins Shoppingcenter?» — ___ — «Ich auch, ich brauche Schuhe.» (yes — you need a new jacket)", a: ["Ja, ich brauche eine neue Jacke.", "Gern, ich brauche eine neue Jacke.", "Ja, gern. Ich brauche eine neue Jacke.", "Ja, ich brauche nämlich eine neue Jacke."], r: ["shop.help"] },
          { q: "«Passt mir das Kleid?» — ___ — «Dann probiere ich es eine Nummer kleiner.» (no, it's too big)", a: ["Nein, es ist zu groß.", "Nein, das ist zu groß.", "Nein, es ist dir zu groß.", "Nein, es ist ein bisschen zu groß.", "Nein, zu groß.", "Nein, es ist leider zu groß."], r: ["shop.try"] },
          { q: "«Wie gefällt dir der Mantel?» — ___ — «Echt? Ich finde ihn schön.» (not at all)", a: ["Er gefällt mir gar nicht.", "Gar nicht.", "Er gefällt mir überhaupt nicht.", "Überhaupt nicht.", "Der gefällt mir gar nicht."], r: ["shop.try"] },
          { q: "«Haben Sie diese Hose auch in Schwarz?» — ___ — «Super, dann probiere ich sie an.» (yes — here it is)", a: ["Ja, hier.", "Ja, hier ist sie.", "Ja, hier, bitte.", "Ja, natürlich, hier."], r: ["shop.size"] },
          { q: "«Der rote Pulli oder der blaue?» — ___ — «Gute Wahl, der steht dir gut.» (the blue one)", a: ["Der blaue.", "Ich nehme den blauen.", "Den blauen.", "Der blaue, bitte.", "Den blauen, bitte."], r: ["shop.take"] },
          { q: "«Was kosten diese Socken?» — ___ — «Das ist mir zu teuer.» (twelve francs)", a: ["Zwölf Franken.", "Sie kosten zwölf Franken.", "12 Franken.", "Sie kosten 12 Franken.", "Die kosten zwölf Franken."], r: ["shop.price"] },
          { q: "«Die Bohrmaschine kostet nur 49 Franken.» — «Haben Sie sie noch?» — ___ (yes, two more)", a: ["Ja, wir haben noch zwei.", "Ja, noch zwei.", "Ja, wir haben noch zwei Stück.", "Ja, noch zwei Stück."], r: ["shop.price"] },
          { q: "«Was macht das zusammen?» — ___ — «Mit Karte, bitte.» (34.50 — and ask: cash or card?)", a: ["Vierunddreißig Franken fünfzig. Bar oder mit Karte?", "Das macht vierunddreißig Franken fünfzig. Bar oder mit Karte?", "Vierunddreißig fünfzig. Bar oder mit Karte?", "Das macht vierunddreißig Franken fünfzig. Zahlen Sie bar oder mit Karte?", "Vierunddreißig Franken fünfzig. Bar oder Karte?", "Das macht vierunddreißig Franken fünfzig. Bar oder Karte?"], r: ["shop.pay"] },
          { q: "«Sonst noch etwas?» — ___ — «Gut, das macht neun Franken.» (no, that's all)", a: ["Nein, danke, das ist alles.", "Nein, das ist alles.", "Nein, danke. Das ist alles."], r: ["shop.pay"] },
          { q: "«Ich möchte jetzt einen Kaffee.» — ___ — «Wir haben genug Zeit, es ist erst zehn.» (now already? — we still have a lot to buy)", a: ["Jetzt schon? Wir müssen noch viel einkaufen.", "Jetzt schon? Wir müssen noch viel kaufen.", "Schon jetzt? Wir müssen noch viel einkaufen.", "Schon jetzt? Wir müssen noch viel kaufen."], r: ["shop.help"] },
        ] },
        // ── Übung 31•6: questions about the jacket ──
        { id: "d31.6", ex: "31.6", t: "answer", title: "In the clothes shop: your answers", how: "Answer the line with what the brackets say. A short answer is fine.", items: [
          { q: "«Kann ich Ihnen helfen?» (you're just looking)", a: ["Danke, ich schaue nur.", "Nein, danke, ich schaue nur.", "Danke, ich schaue mich nur um."], r: ["shop.help"] },
          { q: "«Was suchen Sie?» (a warm jacket for the winter)", a: ["Eine warme Jacke für den Winter.", "Ich suche eine warme Jacke für den Winter.", "Eine warme Jacke.", "Ich suche eine warme Jacke."], r: ["shop.help"] },
          { q: "«Welche Größe haben Sie?» (L)", a: ["Größe L.", "Ich habe Größe L.", "Normalerweise L.", "Ich trage Größe L.", "L."], r: ["shop.size"] },
          { q: "«Passt Ihnen die Jacke?» (no, it's a bit too tight)", a: ["Nein, sie ist ein bisschen zu eng.", "Nein, sie ist zu eng.", "Nein, sie passt mir nicht, sie ist zu eng.", "Nein, sie ist mir zu eng.", "Nein, sie ist mir ein bisschen zu eng."], r: ["shop.try"] },
          { q: "«Haben Sie sie eine Nummer größer?» (you're the assistant: not in grey, but in dark blue)", a: ["In Grau leider nicht, aber in Dunkelblau.", "Nicht in Grau, aber in Dunkelblau.", "In Grau nicht, aber in Dunkelblau.", "Leider nicht in Grau, aber in Dunkelblau."], r: ["shop.size"] },
          { q: "«Gefällt Ihnen der Pulli?» (yes, very much)", a: ["Ja, er gefällt mir sehr.", "Ja, sehr.", "Ja, er gefällt mir sehr gut.", "Ja, sehr gut.", "Ja, der gefällt mir sehr."], r: ["shop.try"] },
          { q: "«Passen Ihnen die Schuhe?» (no, they're too small)", a: ["Nein, sie sind zu klein.", "Nein, sie passen mir nicht. Sie sind zu klein.", "Nein, zu klein.", "Nein, sie sind mir zu klein.", "Nein, die sind zu klein.", "Nein, sie sind leider zu klein."], r: ["shop.try"] },
          { q: "«Der Pulli oder das Hemd?» (you take the jumper)", a: ["Den Pulli.", "Ich nehme den Pulli.", "Den Pulli, bitte.", "Der Pulli.", "Der Pulli, bitte.", "Den Pulli nehme ich."], r: ["shop.take"] },
          { q: "«Und, nehmen Sie die Jacke?» (yes)", a: ["Ja, ich nehme sie.", "Ja, die nehme ich.", "Ja, gern.", "Ja, ich nehme sie gern."], r: ["shop.take"] },
          { q: "«Wo kann ich das anprobieren?» (you're the assistant: the changing room is at the back)", a: ["Die Kabine ist dort hinten.", "Dort hinten.", "Die Kabine ist hinten.", "Dort hinten ist die Kabine."], r: ["shop.try"] },
        ] },
        // ── Übung 31•9: questions about the market ──
        { id: "d31.9", ex: "31.9", t: "answer", title: "At the market: your answers", how: "Answer the line with what the brackets say. A short answer is fine.", items: [
          { q: "«Grüezi! Was darf es sein?» (300 grams of mountain cheese)", a: ["300 Gramm Bergkäse, bitte.", "Dreihundert Gramm Bergkäse, bitte.", "Ich möchte 300 Gramm Bergkäse.", "Ich möchte dreihundert Gramm Bergkäse.", "Ich möchte 300 Gramm Bergkäse, bitte.", "Ich möchte dreihundert Gramm Bergkäse, bitte."], r: ["shop.amount"] },
          { q: "«Am Stück oder in Scheiben?» (in one piece)", a: ["Am Stück, bitte.", "Am Stück."], r: ["shop.amount"] },
          { q: "«Was kosten die Äpfel?» (you're the seller: 4.20 a kilo)", a: ["Vier Franken zwanzig das Kilo.", "Das Kilo kostet vier Franken zwanzig.", "Ein Kilo kostet vier Franken zwanzig.", "Vier Franken zwanzig."], r: ["shop.price"] },
          { q: "«Wie viele Äpfel möchten Sie?» (two kilos)", a: ["Zwei Kilo, bitte.", "Zwei Kilo.", "Ich nehme zwei Kilo.", "Ich möchte zwei Kilo."], r: ["shop.amount"] },
          { q: "«Sonst noch etwas?» (a litre of milk)", a: ["Einen Liter Milch, bitte.", "Ja, einen Liter Milch.", "Ja, einen Liter Milch, bitte.", "Einen Liter Milch."], r: ["shop.amount", "shop.pay"] },
          { q: "«Was macht das zusammen?» (you're the seller: CHF 18.60)", a: ["Achtzehn Franken sechzig.", "Das macht achtzehn Franken sechzig.", "Das macht zusammen achtzehn Franken sechzig."], r: ["shop.price"] },
          { q: "«Kann ich mit Karte zahlen?» (you're the seller: of course)", a: ["Natürlich.", "Ja, natürlich.", "Ja, klar.", "Klar.", "Ja, gern."], r: ["shop.pay"] },
          { q: "«Brauchen Sie eine Tasche?» (no thanks — you have one with you)", a: ["Nein, danke, ich habe eine dabei.", "Nein, danke, ich habe eine.", "Nein danke, ich habe eine dabei."], r: ["shop.pay"] },
          { q: "«Brauchen Sie eine Quittung?» (yes, please)", a: ["Ja, bitte.", "Ja, gern.", "Ja, gerne."], r: ["shop.pay"] },
        ] },
        // ── Übung 31•10: prices, in words ──
        { id: "d31.10", ex: "31.10", t: "compose", title: "How much is it?", how: "Make a sentence with kosten. Say the price in words, as you would at the counter: francs, then Rappen.", items: [
          { w: ["das Brot", "kosten", "Fr. 4.20"], a: ["Das Brot kostet vier Franken zwanzig."], r: ["shop.price"] },
          { w: ["dieses Velo", "kosten", "Fr. 650.–"], a: ["Dieses Velo kostet sechshundertfünfzig Franken."], r: ["shop.price"] },
          { w: ["ein Stück Kuchen", "kosten", "Fr. 5.80"], a: ["Ein Stück Kuchen kostet fünf Franken achtzig."], r: ["shop.price"] },
          { w: ["diese Handschuhe", "kosten", "Fr. 24.90"], a: ["Diese Handschuhe kosten vierundzwanzig Franken neunzig."], r: ["shop.price"] },
          { w: ["ihre neue Wohnung", "kosten", "Fr. 2100.–", "im Monat"], a: ["Ihre neue Wohnung kostet zweitausendeinhundert Franken im Monat.", "Ihre neue Wohnung kostet zweitausendhundert Franken im Monat.", "Ihre neue Wohnung kostet im Monat zweitausendeinhundert Franken.", "Ihre neue Wohnung kostet im Monat zweitausendhundert Franken."], r: ["shop.price"] },
          { w: ["die Tickets", "kosten", "Fr. 45.–"], a: ["Die Tickets kosten fünfundvierzig Franken."], r: ["shop.price"] },
          { w: ["die Schuhe", "kosten", "Fr. 119.–"], a: ["Die Schuhe kosten hundertneunzehn Franken.", "Die Schuhe kosten einhundertneunzehn Franken."], r: ["shop.price"] },
          { w: ["zwei Kaffee", "kosten", "Fr. 9.40"], a: ["Zwei Kaffee kosten neun Franken vierzig."], r: ["shop.price"] },
          { w: ["der Haarschnitt", "kosten", "Fr. 38.50"], a: ["Der Haarschnitt kostet achtunddreißig Franken fünfzig."], r: ["shop.price"] },
          { w: ["ein Kilo Tomaten", "kosten", "Fr. 3.90"], a: ["Ein Kilo Tomaten kostet drei Franken neunzig."], r: ["shop.price", "shop.amount"] },
        ] },
        // ── Übung 31•11: sizes and amounts ──
        { id: "d31.11", ex: "31.11", t: "compose", title: "How big? How much?", how: "Make a sentence. Say the numbers in words; with breit, lang, hoch or tief the verb is sein.", items: [
          { w: ["das Wohnzimmer", "5 m", "breit"], a: ["Das Wohnzimmer ist fünf Meter breit."], r: ["shop.amount"] },
          { w: ["dieses Brett", "80 cm", "lang"], a: ["Dieses Brett ist achtzig Zentimeter lang."], r: ["shop.amount"] },
          { w: ["der Tisch", "75 cm", "hoch"], a: ["Der Tisch ist fünfundsiebzig Zentimeter hoch."], r: ["shop.amount"] },
          { w: ["der Pool", "2 m", "tief"], a: ["Der Pool ist zwei Meter tief."], r: ["shop.amount"] },
          { w: ["der Zürichsee", "136 m", "tief"], a: ["Der Zürichsee ist hundertsechsunddreißig Meter tief.", "Der Zürichsee ist einhundertsechsunddreißig Meter tief."], r: ["shop.amount"] },
          { w: ["ich", "kaufen", "2 kg", "Kartoffeln"], a: ["Ich kaufe zwei Kilo Kartoffeln.", "Ich kaufe zwei Kilogramm Kartoffeln."], r: ["shop.amount"] },
          { w: ["unser Hund", "wiegen", "12 kg"], a: ["Unser Hund wiegt zwölf Kilo.", "Unser Hund wiegt zwölf Kilogramm."], r: ["shop.amount"] },
          { w: ["wir", "brauchen", "3 m", "Stoff"], a: ["Wir brauchen drei Meter Stoff."], r: ["shop.amount"] },
          { w: ["die neue Wohnung", "haben", "85 m²"], a: ["Die neue Wohnung hat fünfundachtzig Quadratmeter."], r: ["shop.amount"] },
          { w: ["ich", "möchten", "500 g", "Hackfleisch"], a: ["Ich möchte fünfhundert Gramm Hackfleisch.", "Ich möchte ein Pfund Hackfleisch.", "Ich möchte fünfhundert Gramm Hackfleisch, bitte.", "Ich möchte ein halbes Kilo Hackfleisch."], r: ["shop.amount"] },
        ] },
        // ── Production: say it ──
        { id: "dp.shop", t: "translate", end: true, title: "Say it in German", how: "Translate it the way people say it in a shop.", items: [
          { q: "I'm looking for a warm jacket.", a: ["Ich suche eine warme Jacke."], r: ["shop.help"] },
          { q: "Can I try this on?", a: ["Darf ich das anprobieren?", "Kann ich das anprobieren?", "Kann ich es anprobieren?", "Darf ich es anprobieren?"], r: ["shop.try"] },
          { q: "The trousers don't fit me.", a: ["Die Hose passt mir nicht.", "Die Hosen passen mir nicht."], r: ["shop.try"] },
          { q: "Do you have it a size bigger?", a: ["Haben Sie das eine Nummer größer?", "Haben Sie es eine Nummer größer?", "Haben Sie sie eine Nummer größer?", "Haben Sie ihn eine Nummer größer?", "Gibt es das eine Nummer größer?"], r: ["shop.size"] },
          { q: "The blue shirt? I'll take it.", a: ["Das blaue Hemd? Ich nehme es.", "Das blaue Hemd? Das nehme ich."], r: ["shop.take", "shop.size"] },
          { q: "How much are the shoes?", a: ["Was kosten die Schuhe?", "Wie viel kosten die Schuhe?"], r: ["shop.price"] },
          { q: "That's too expensive.", a: ["Das ist zu teuer.", "Das ist mir zu teuer."], r: ["shop.price"] },
          { q: "A kilo of tomatoes, please.", a: ["Ein Kilo Tomaten, bitte."], r: ["shop.amount"] },
          { q: "The table is two metres long.", a: ["Der Tisch ist zwei Meter lang."], r: ["shop.amount"] },
          { q: "No thanks, that's all.", a: ["Nein, danke, das ist alles.", "Nein danke, das ist alles."], r: ["shop.pay"] },
          { q: "Can I pay by card?", a: ["Kann ich mit Karte zahlen?", "Kann ich mit Karte bezahlen?", "Kann ich mit der Karte zahlen?", "Kann ich mit der Karte bezahlen?"], r: ["shop.pay"] },
        ] },
        // ── Production · Übung 31•12: the conversation rewritten ──
        { id: "d31.12", ex: "31.12", t: "write", end: true, title: "Your own shop talk", how: "Write the lines for the situation. Saved for Claude to correct.", items: [
          { q: "In a shoe shop the assistant asks if she can help. Answer: you're looking for walking shoes for the summer.", model: ["Grüezi! Kann ich Ihnen helfen? — Ja, gern. Ich suche Wanderschuhe für den Sommer."], r: ["shop.help"] },
          { q: "Ask to try on a dress. The assistant says where the changing room is.", model: ["Darf ich das Kleid anprobieren? — Natürlich, die Kabine ist dort links."], r: ["shop.try"] },
          { q: "You take size 42 and the shoes are too small. Say so, and ask for a size bigger.", model: ["Ich habe Größe 42, aber die Schuhe sind ein bisschen zu klein. Haben Sie sie eine Nummer größer?"], r: ["shop.size"] },
          { q: "You're the assistant: the jacket isn't there in brown, only in black.", model: ["In Braun leider nicht. Aber in Schwarz, hier."], r: ["shop.size"] },
          { q: "Decide: you take the shoes — or say you'll think about it.", model: ["Die Schuhe? Die nehme ich! — Oder: Danke, ich überlege es mir noch."], r: ["shop.take"] },
          { q: "You're the assistant: the shoes are on sale this week, 59 francs instead of 99.", model: ["Diese Woche sind sie im Ausverkauf: 59 Franken statt 99."], r: ["shop.price"] },
          { q: "At the market: buy three things with their amounts, and ask what it comes to.", model: ["Ich möchte ein Kilo Tomaten, 200 Gramm Käse und einen Liter Milch. Was macht das zusammen?"], r: ["shop.amount"] },
          { q: "At the till: ask whether you can pay by card, and say you don't need a bag.", model: ["Kann ich mit Karte zahlen? Eine Tasche brauche ich nicht, danke."], r: ["shop.pay"] },
        ] },
      ],
    },
  },
});

// Chapter 31's shopping: every exercise here (31•9 from "Subjunctive review"
// too, as Session 7 planned; 31•14, the comparatives, is the adjective
// endings' — s1-adj.js).
cxCover({
  "31.6": "d31.6", "31.7": "d31.7", "31.8": "d31.8", "31.9": "d31.9",
  "31.10": "d31.10", "31.11": "d31.11", "31.12": "d31.12",
});

cxJournal([
  { id: "w.buyclothes", th: "shop", lv: "A2", de: "Im Kleidergeschäft", t: "You bought something to wear — or tried it on and didn't. Write the scene: what you were looking for, the size and colour, what fitted or didn't, the price, and what you decided.", help: ["Ich habe … gesucht.", "Die … war mir zu …", "Die Verkäuferin hat gesagt: …", "Am Ende habe ich …"], sec: "s3.shop" },
]);
