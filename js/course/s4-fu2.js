// ── COURSE PACK · After B1 (bonus) · Futur II ──
// Book: chapter 21's Futur II (21•1–21•6: the auxiliaries, what someone will
// have done in ten years, what people will probably have done, a sentence
// in every tense). One sheet: werden + Partizip II + haben / sein, the guess
// about the past (Er wird den Bus verpasst haben — the use you hear), done by
// a time in the future (Bis Freitag werde ich … geschrieben haben — in speech
// the Perfekt), and werden last in a side clause (…, dass er es vergessen
// haben wird). B2, rare in speech — a bonus after B1. Chapter 21 in our copy
// has only the Futur II; its negation and commands are taught in Stages 0–1.
cxPack({
  id: "s4-fu2",
  sections: {
    "s4.fu2": {
      rules: {
        "fut2.form": "werden + Partizip II + haben / sein",
        "fut2.guess": "A guess about the past: Er wird es vergessen haben",
        "fut2.done": "Done by then: Bis Freitag werde ich es gemacht haben",
        "fut2.order": "In a side clause: …, dass er es vergessen haben wird",
      },
      sheets: [
        { id: "cx.fut2", title: "Er wird es vergessen haben", qn: 3,
          struct: [["Er", "who"], ["wird", "aux"], ["es", "thing"], ["vergessen", "p2"], ["haben", "inf"]],
          why: "The **Futur II** — werden + Partizip II + haben or sein — is rare in speech, but you meet it for two things: a **guess about the past** (*he'll have forgotten*) and something **finished by a time in the future** (*by Friday I'll have done it*).",
          rid: ["fut2.form", "fut2.guess", "fut2.done", "fut2.order"],
          rules: [
            "The Futur II is **werden** + the **Partizip II** + **haben** or **sein**, the last two at the end: Ich **werde** es **gemacht haben**. · Sie **wird** schon **angekommen sein**. The verb takes the same haben or sein as in its Perfekt.",
            "Its most common use is a **guess about the past**, often with **wohl**, **sicher** or **bestimmt**: Lea ist nicht da — sie **wird** den Zug **verpasst haben**. (= She has probably missed the train.)",
            "It also says something will be **done by a time in the future**: Bis Freitag **werde** ich den Bericht **geschrieben haben**. In speech the Perfekt is enough: Bis Freitag **habe** ich den Bericht **geschrieben**.",
            "In a side clause, the conjugated **werden** goes to the very end: Ich glaube, dass er den Termin **vergessen haben wird**. · …, weil sie schon **gegangen sein wird**.",
          ],
          table: { head: ["Perfekt", "Futur II"], rows: [
            ["**hat** gesagt", "**wird** gesagt **haben**"],
            ["**ist** gegangen", "**wird** gegangen **sein**"],
            ["**hat** gegessen", "**wird** gegessen **haben**"],
            ["**ist** gekommen", "**wird** gekommen **sein**"],
          ] },
          ex: [
            ["Tim antwortet nicht — er **wird** schon **eingeschlafen sein**.", "Tim isn't answering — he'll have fallen asleep already."],
            ["Die Nachbarn **werden** den Lärm sicher **gehört haben**.", "The neighbours will surely have heard the noise."],
            ["Bis Ende Jahr **werden** wir das Auto **abbezahlt haben**.", "By the end of the year we'll have paid off the car."],
            ["Wenn du ankommst, **werde** ich schon **gegessen haben**.", "When you arrive, I'll already have eaten."],
          ],
          trap: "haben or sein at the end follows the Perfekt: er **ist** gegangen → er wird gegangen **sein**, not ~~gegangen haben~~. And keep the order — the Partizip II first, then haben or sein: not ~~er wird haben vergessen~~.",
          quiz: [
            { at: "r1", k: "pick", q: "gehen, er → Futur II:", o: ["er wird gegangen sein", "er wird gegangen haben", "er wird gehen sein"], a: 0, why: "gehen takes sein in the Perfekt: **gegangen sein**." },
            { at: "r1", k: "type", cx: true, q: "Lea ___ das Paket schon abgeholt haben. (werden)", a: ["wird"], r: ["fut2.form"], why: "werden, er / sie / es: **wird**." },
            { at: "r2", k: "pick", q: "Max isn't here. He's probably missed the bus: Er ___ den Bus verpasst haben.", o: ["wird", "würde", "hat"], a: 0, why: "A guess about the past: **wird** … verpasst haben." },
            { at: "r2", k: "pick", q: "«Sie wird wohl krank gewesen sein.» means:", o: ["She was probably ill.", "She will be ill.", "She would have been ill."], a: 0, why: "The Futur II with wohl: a guess about the past." },
            { at: "r3", k: "pick", q: "By Monday I'll have finished it: Bis Montag ___ ich es fertig gemacht haben.", o: ["werde", "würde", "habe"], a: 0, why: "Done by then: **werde** … gemacht haben." },
            { at: "r3", k: "pick", q: "In everyday speech, *By Friday I'll have read it* is usually:", o: ["Bis Freitag habe ich es gelesen.", "Bis Freitag lese ich es gehabt."], a: 0, why: "In speech the Perfekt is enough." },
            { at: "r4", k: "order", q: "Build it: I think he will have forgotten it.", a: ["Ich glaube,", "dass", "er", "es", "vergessen", "haben", "wird."], why: "In a side clause werden goes to the very end." },
            { at: "r4", k: "pick", q: "Ich glaube, dass sie schon ___.", o: ["gegangen sein wird", "wird gegangen sein", "gegangen wird sein"], a: 0, why: "werden last: **gegangen sein wird**." },
            { at: "table", k: "pick", q: "wir sind gekommen → Futur II:", o: ["wir werden gekommen sein", "wir werden gekommen haben", "wir sind gekommen werden"], a: 0, why: "sein stays sein: **gekommen sein**." },
            { at: "trap", k: "pick", q: "He'll probably have slept a lot:", o: ["Er wird viel geschlafen haben.", "Er wird viel geschlafen sein.", "Er wird haben viel geschlafen."], a: 0, why: "schlafen takes haben, and haben comes last." },
          ] },
      ],
      diag: [
        { t: "swap", from: "^haben$", to: "^sein$", rule: "fut2.form", hard: true, msg: "This verb takes sein in the Perfekt, so the Futur II ends in **sein**." },
        { t: "swap", from: "^sein$", to: "^haben$", rule: "fut2.form", hard: true, msg: "This verb takes haben in the Perfekt, so the Futur II ends in **haben**." },
        { t: "swap", from: "^(wurde|wurdest|wurden|wurdet)$", to: "^(werde|wird|wirst|werden|werdet)$", rule: "fut2.form", hard: true, msg: "The Futur II is made with **{right}** (werden in the present), not würde." },
        { t: "ending", stem: "w(e|i)r(d|s)", rule: "fut2.form", msg: "werden must match the subject: **{right}**. (ich werde, du wirst, er wird, wir werden, ihr werdet, sie werden)" },
        { t: "missing", tok: "^(haben|sein)$", rule: "fut2.form", msg: "The Futur II ends in **haben** or **sein**, after the Partizip II." },
      ],
      drills: [
        // ── Übung 21•1: the auxiliaries ──
        { id: "d21.1", ex: "21.1", t: "type", title: "werden … haben / sein", how: "The family's weekend in the mountains — what they'll probably have done. Write the missing part: the form of werden, or haben / sein at the end.", items: [
          { q: "Die Gäste ___ müde angekommen sein.", a: ["werden"], r: ["fut2.form"] },
          { q: "Am Samstag werden sie lange geschlafen ___.", a: ["haben"], r: ["fut2.form"] },
          { q: "Papa ___ Rösti zum Frühstück gemacht haben.", a: ["wird"], r: ["fut2.form"] },
          { q: "Die Kinder werden im Schnee gespielt ___.", a: ["haben"], r: ["fut2.form"] },
          { q: "Anna und Ben werden auf den Gipfel gestiegen ___.", a: ["sein"], r: ["fut2.form"] },
          { q: "Du ___ bestimmt viele Fotos gemacht haben.", a: ["wirst"], r: ["fut2.form"] },
          { q: "Der Käse wird allen gut geschmeckt ___.", a: ["haben"], r: ["fut2.form"] },
          { q: "Am Abend ___ ihr Karten gespielt haben.", a: ["werdet"], r: ["fut2.form"] },
          { q: "Opa wird früh ins Bett gegangen ___.", a: ["sein"], r: ["fut2.form"] },
          { q: "Das Wochenende wird allen gefallen ___.", a: ["haben"], r: ["fut2.form"] },
        ] },
        // ── Übung 21•2: in ten years ──
        { id: "d21.2", ex: "21.2", t: "compose", title: "In ten years", how: "Lea is eighteen. What will she have done ten years from now? Build the Futur II: Sie wird … haben / sein.", items: [
          { w: ["sie", "die Matura", "machen"], a: ["Sie wird die Matura gemacht haben."], r: ["fut2.done"], vf: [["machen", "p2only", "er"]] },
          { w: ["sie", "an der Uni", "studieren"], a: ["Sie wird an der Uni studiert haben."], r: ["fut2.done"] },
          { w: ["sie", "einen Beruf", "lernen"], a: ["Sie wird einen Beruf gelernt haben."], r: ["fut2.done"] },
          { w: ["sie", "nach Australien", "reisen"], a: ["Sie wird nach Australien gereist sein."], r: ["fut2.form"] },
          { w: ["sie", "eine eigene Wohnung", "finden"], a: ["Sie wird eine eigene Wohnung gefunden haben."], r: ["fut2.done"], vf: [["finden", "p2only", "er"]] },
          { w: ["sie", "den Führerausweis", "machen"], a: ["Sie wird den Führerausweis gemacht haben."], r: ["fut2.done"] },
          { w: ["sie", "sich", "verlieben"], a: ["Sie wird sich verliebt haben."], r: ["fut2.form"] },
          { w: ["sie", "in eine andere Stadt", "umziehen"], a: ["Sie wird in eine andere Stadt umgezogen sein."], r: ["fut2.form"] },
          { w: ["sie", "viel", "erleben"], a: ["Sie wird viel erlebt haben."], r: ["fut2.done"] },
          { w: ["sie", "vielleicht", "heiraten"], a: ["Sie wird vielleicht geheiratet haben.", "Vielleicht wird sie geheiratet haben."], r: ["fut2.done"] },
        ] },
        // ── Übung 21•3: they'll probably have … ──
        { id: "d21.3", ex: "21.3", t: "compose", title: "They'll probably have …", how: "Your friends are on holiday in Japan. Guess what they've probably done: Sie werden wohl … haben / sein.", items: [
          { w: ["sie", "wohl", "Sushi", "essen"], a: ["Sie werden wohl Sushi gegessen haben."], r: ["fut2.guess"], vf: [["essen", "p2only", "sie"]] },
          { w: ["sie", "wohl", "den Fuji", "sehen"], a: ["Sie werden wohl den Fuji gesehen haben.", "Sie werden den Fuji wohl gesehen haben."], r: ["fut2.guess"] },
          { w: ["sie", "wohl", "mit dem Schnellzug", "fahren"], a: ["Sie werden wohl mit dem Schnellzug gefahren sein."], r: ["fut2.guess"] },
          { w: ["sie", "wohl", "viele Tempel", "besuchen"], a: ["Sie werden wohl viele Tempel besucht haben."], r: ["fut2.guess"] },
          { w: ["sie", "wohl", "spät", "ankommen"], a: ["Sie werden wohl spät angekommen sein."], r: ["fut2.guess"] },
          { w: ["sie", "wohl", "zu viel", "einkaufen"], a: ["Sie werden wohl zu viel eingekauft haben."], r: ["fut2.guess"] },
          { w: ["sie", "wohl", "im Hotel", "schlafen"], a: ["Sie werden wohl im Hotel geschlafen haben."], r: ["fut2.guess"] },
          { w: ["sie", "wohl", "ein paar Wörter Japanisch", "lernen"], a: ["Sie werden wohl ein paar Wörter Japanisch gelernt haben."], r: ["fut2.guess"] },
          { w: ["sie", "wohl", "durch Kyoto", "spazieren"], a: ["Sie werden wohl durch Kyoto spaziert sein."], r: ["fut2.form"] },
          { w: ["sie", "uns", "wohl", "vermissen"], a: ["Sie werden uns wohl vermisst haben."], r: ["fut2.guess"] },
        ] },
        // ── Übung 21•4: back home, everyone will have … ──
        { id: "d21.4", ex: "21.4", t: "compose", title: "Back home", how: "You've been away for a week. What has everyone at home probably done? Build it with the person given: … wird / werden … haben / sein.", items: [
          { w: ["meine Eltern", "sich", "über die Postkarte", "freuen"], a: ["Meine Eltern werden sich über die Postkarte gefreut haben."], r: ["fut2.guess"] },
          { w: ["meine Schwester", "die Pflanzen", "gießen"], a: ["Meine Schwester wird die Pflanzen gegossen haben."], r: ["fut2.guess"] },
          { w: ["mein Bruder", "jeden Abend", "fernsehen"], a: ["Mein Bruder wird jeden Abend ferngesehen haben."], r: ["fut2.guess"] },
          { w: ["der Hund", "auf uns", "warten"], a: ["Der Hund wird auf uns gewartet haben."], r: ["fut2.guess"] },
          { w: ["Oma", "sich", "gut", "ausruhen"], a: ["Oma wird sich gut ausgeruht haben."], r: ["fut2.form"] },
          { w: ["Papa", "zur Arbeit", "gehen"], a: ["Papa wird zur Arbeit gegangen sein."], r: ["fut2.form"] },
          { w: ["die Nachbarn", "den Briefkasten", "leeren"], a: ["Die Nachbarn werden den Briefkasten geleert haben."], r: ["fut2.guess"] },
          { w: ["meine Mutter", "mit Tante Rosa", "telefonieren"], a: ["Meine Mutter wird mit Tante Rosa telefoniert haben."], r: ["fut2.guess"] },
          { w: ["alle", "uns", "vermissen"], a: ["Alle werden uns vermisst haben."], r: ["fut2.guess"] },
          { w: ["die Katze", "sich", "unter dem Bett", "verstecken"], a: ["Die Katze wird sich unter dem Bett versteckt haben."], r: ["fut2.form"] },
        ] },
        // ── Übung 21•5: into the Futur II ──
        { id: "d21.5", ex: "21.5", t: "transform", title: "Into the Futur II", how: "Say it in the Futur II: werden second, the Partizip II and haben / sein at the end.", items: [
          { q: "Wir fahren vier Stunden lang.", a: ["Wir werden vier Stunden lang gefahren sein."], r: ["fut2.form"], vf: [["fahren", "p2only", "wir"]] },
          { q: "Die Touristen reisen wohl nach Lugano.", a: ["Die Touristen werden wohl nach Lugano gereist sein."], r: ["fut2.guess"] },
          { q: "Die Jungs spielen Unihockey.", a: ["Die Jungs werden Unihockey gespielt haben."], r: ["fut2.form"], vf: [["spielen", "p2only", "sie"]] },
          { q: "Die Wanderer haben großen Durst.", a: ["Die Wanderer werden großen Durst gehabt haben."], r: ["fut2.form"] },
          { q: "Der Lehrling kauft ein Sandwich.", a: ["Der Lehrling wird ein Sandwich gekauft haben."], r: ["fut2.form"], vf: [["kaufen", "p2only", "er"]] },
          { q: "Du isst die ganze Torte.", a: ["Du wirst die ganze Torte gegessen haben."], r: ["fut2.form"], vf: [["essen", "p2only", "du"]] },
          { q: "Mara macht eine Lehre als Köchin.", a: ["Mara wird eine Lehre als Köchin gemacht haben."], r: ["fut2.form"] },
          { q: "Das Fest gefällt allen.", a: ["Das Fest wird allen gefallen haben."], r: ["fut2.form"] },
          { q: "Wir schlafen mehr als zehn Stunden.", a: ["Wir werden mehr als zehn Stunden geschlafen haben."], r: ["fut2.form"], vf: [["schlafen", "p2only", "wir"]] },
          { q: "Die Gäste kommen zu spät an.", a: ["Die Gäste werden zu spät angekommen sein."], r: ["fut2.form"], vf: [["ankommen", "p2only", "sie"]] },
        ].map(it => ({ ...it, diag: [{ t: "order", rule: "fut2.form", msg: "werden is the verb second; the Partizip II and then haben or sein go to the very end: Wir **werden** … **gefahren sein**." }] })) },
        // ── Übung 21•6: one sentence, every tense ──
        { id: "d21.6", ex: "21.6", t: "transform", title: "Every tense", how: "Say the sentence in the tense in brackets.", items: [
          { q: "Meine Tante zahlt die Rechnung. (Präteritum)", a: ["Meine Tante zahlte die Rechnung."], r: ["fut2.form"], vf: [["zahlen", "pt", "er"]] },
          { q: "Meine Tante zahlt die Rechnung. (Futur II)", a: ["Meine Tante wird die Rechnung gezahlt haben."], r: ["fut2.form"] },
          { q: "Die Kinder schwimmen im See. (Perfekt)", a: ["Die Kinder sind im See geschwommen.", "Die Kinder haben im See geschwommen."], r: ["fut2.form"] },
          { q: "Die Kinder schwimmen im See. (Futur II)", a: ["Die Kinder werden im See geschwommen sein.", "Die Kinder werden im See geschwommen haben."], r: ["fut2.form"] },
          { q: "Wir reden oft mit den Nachbarn. (Plusquamperfekt)", a: ["Wir hatten oft mit den Nachbarn geredet."], r: ["fut2.form"], vf: [["reden", "pq", "wir"]] },
          { q: "Wir reden oft mit den Nachbarn. (Futur I)", a: ["Wir werden oft mit den Nachbarn reden."], r: ["fut2.form"], vf: [["reden", "fu", "wir"]] },
          { q: "Ich arbeite für Frau Gerber. (Futur II)", a: ["Ich werde für Frau Gerber gearbeitet haben."], r: ["fut2.form"] },
          { q: "Sie zieht eine warme Jacke an. (Perfekt)", a: ["Sie hat eine warme Jacke angezogen."], r: ["fut2.form"] },
          { q: "Sie macht die Fensterläden zu. (Futur II)", a: ["Sie wird die Fensterläden zugemacht haben."], r: ["fut2.form"] },
          { q: "Sie macht die Fensterläden zu. (Präteritum)", a: ["Sie machte die Fensterläden zu."], r: ["fut2.form"] },
          { q: "Viele Familien wandern am Wochenende. (Plusquamperfekt)", a: ["Viele Familien waren am Wochenende gewandert."], r: ["fut2.form"] },
          { q: "Die Gäste essen zum ersten Mal Raclette. (Futur II)", a: ["Die Gäste werden zum ersten Mal Raclette gegessen haben."], r: ["fut2.form"] },
        ] },
        // ── ours: in a side clause ──
        { id: "dfut2.sub", t: "transform", title: "In a side clause", how: "Join the sentences with the word in brackets. After dass, wo or wann, werden goes to the very end: …, dass er es vergessen haben wird. denn changes nothing.", items: [
          { q: "Ich glaube. Er wird den Termin vergessen haben. (dass)", a: ["Ich glaube, dass er den Termin vergessen haben wird."], r: ["fut2.order"] },
          { q: "Sie ist sicher. Der Zug wird schon abgefahren sein. (dass)", a: ["Sie ist sicher, dass der Zug schon abgefahren sein wird."], r: ["fut2.order"] },
          { q: "Ich denke. Ihr werdet gut angekommen sein. (dass)", a: ["Ich denke, dass ihr gut angekommen sein werdet."], r: ["fut2.order"] },
          { q: "Ich vermute. Die Kinder werden schon gegessen haben. (dass)", a: ["Ich vermute, dass die Kinder schon gegessen haben werden."], r: ["fut2.order"] },
          { q: "Ich fürchte. Sie wird den Brief nicht bekommen haben. (dass)", a: ["Ich fürchte, dass sie den Brief nicht bekommen haben wird."], r: ["fut2.order"] },
          { q: "Mach dir keine Sorgen. Er wird den Weg gefunden haben. (denn)", a: ["Mach dir keine Sorgen, denn er wird den Weg gefunden haben."], r: ["fut2.order"] },
          { q: "Ich frage mich. Wo wird sie gewesen sein? (wo)", a: ["Ich frage mich, wo sie gewesen sein wird."], r: ["fut2.order"] },
          { q: "Wir nehmen an. Die Firma wird alles verkauft haben. (dass)", a: ["Wir nehmen an, dass die Firma alles verkauft haben wird."], r: ["fut2.order"] },
          { q: "Weißt du? Wann wird er angekommen sein? (wann)", a: ["Weißt du, wann er angekommen sein wird?"], r: ["fut2.order"] },
        ].map(it => ({ ...it, diag: [{ t: "order", rule: "fut2.order", msg: "In a side clause the conjugated werden goes to the very end: …, dass er es vergessen haben **wird**." }] })) },
        // ── Production ──
        { id: "dp.fut2", t: "translate", end: true, title: "Say it in German", how: "Translate with the Futur II — or, where speech would, the Perfekt.", items: [
          { q: "She'll probably have forgotten.", a: ["Sie wird es wohl vergessen haben.", "Sie wird es vergessen haben.", "Sie wird es sicher vergessen haben.", "Sie hat es wohl vergessen.", "Sie wird es wahrscheinlich vergessen haben.", "Sie hat es wahrscheinlich vergessen.", "Sie wird es bestimmt vergessen haben."], r: ["fut2.guess"] },
          { q: "By June I'll have finished the course.", a: ["Bis Juni werde ich den Kurs abgeschlossen haben.", "Bis Juni werde ich den Kurs beendet haben.", "Bis Juni habe ich den Kurs abgeschlossen.", "Bis Juni habe ich den Kurs beendet."], r: ["fut2.done"] },
          { q: "The train will already have left.", a: ["Der Zug wird schon abgefahren sein.", "Der Zug wird bereits abgefahren sein.", "Der Zug ist wohl schon abgefahren."], r: ["fut2.guess"] },
          { q: "They'll have been tired.", a: ["Sie werden müde gewesen sein.", "Sie werden wohl müde gewesen sein.", "Sie waren wohl müde."], r: ["fut2.form"] },
          { q: "He'll surely have heard it.", a: ["Er wird es sicher gehört haben.", "Er wird es bestimmt gehört haben.", "Er hat es sicher gehört.", "Er hat es bestimmt gehört."], r: ["fut2.guess"] },
          { q: "When you come home, I'll have cooked.", a: ["Wenn du nach Hause kommst, werde ich gekocht haben.", "Wenn du heimkommst, werde ich gekocht haben.", "Wenn du nach Hause kommst, habe ich gekocht."], r: ["fut2.done"] },
          { q: "I think he'll have got lost.", a: ["Ich glaube, er wird sich verlaufen haben.", "Ich glaube, dass er sich verlaufen haben wird.", "Ich glaube, er hat sich verlaufen.", "Ich glaube, er wird sich verirrt haben."], r: ["fut2.order"] },
          { q: "By the end of the month we'll have saved 200 francs.", a: ["Bis Ende Monat werden wir 200 Franken gespart haben.", "Bis Ende des Monats werden wir 200 Franken gespart haben.", "Bis Ende Monat haben wir 200 Franken gespart."], r: ["fut2.done"] },
        ] },
        { id: "dw.fut2", t: "write", end: true, title: "Write your own", how: "Write in your own words. Saved for Claude to correct.", items: [
          { q: "A friend is late for dinner. Write three guesses why. (Er wird … haben.)", model: ["Er wird den Bus verpasst haben. Vielleicht wird er länger im Büro geblieben sein. Oder er wird unsere neue Adresse vergessen haben."], r: ["fut2.guess"] },
          { q: "Your colleague hasn't answered your email. What will have happened?", model: ["Sie wird meine Mail nicht gesehen haben. Sie wird wohl den ganzen Tag in Sitzungen gewesen sein."], r: ["fut2.guess"] },
          { q: "What will you have finished by Friday? (Bis Freitag werde ich …)", model: ["Bis Freitag werde ich den Bericht geschrieben haben. Ich werde auch die Steuererklärung abgeschickt haben."], r: ["fut2.done"] },
          { q: "The park is full of rubbish on Monday morning. What will people have done at the weekend?", model: ["Viele Leute werden im Park gegrillt haben. Sie werden bis spät in die Nacht gefeiert und den Abfall liegen gelassen haben."], r: ["fut2.guess"] },
          { q: "Your neighbours' lights have been off all week. Where will they have gone?", model: ["Sie werden in die Ferien gefahren sein. Vielleicht werden sie ihre Familie in Italien besucht haben."], r: ["fut2.guess"] },
          { q: "On the day of your exam: what will you have learned by then?", model: ["Bis zur Prüfung werde ich alle Lektionen gemacht haben. Ich werde viel mit meiner Nachbarin gesprochen haben."], r: ["fut2.done"] },
          { q: "A cake has disappeared from the kitchen. Who will have eaten it?", model: ["Die Kinder werden den Kuchen gegessen haben. Oder der Hund wird auf den Tisch gesprungen sein!"], r: ["fut2.guess"] },
          { q: "In five years: what will you have done? Write three sentences.", model: ["In fünf Jahren werde ich den C-Ausweis bekommen haben. Ich werde eine größere Wohnung gefunden haben, und ich werde jeden Kanton besucht haben."], r: ["fut2.done"] },
        ] },
      ],
    },
  },
});

// What chapter 21 became.
cxCover({ "21.1": "d21.1", "21.2": "d21.2", "21.3": "d21.3", "21.4": "d21.4", "21.5": "d21.5", "21.6": "d21.6" });
