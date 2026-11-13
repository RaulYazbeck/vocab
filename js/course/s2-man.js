// ── COURSE PACK · Stage 2 · man, the impersonal passive, and other ways around it ──
// Book: chapter 25's "Substitutes for the passive voice", "man" and
// "Impersonal passive constructions" (25•10, 25•13, 25•14, 25•19), and the
// dative in the passive (25•3, 25•23, 25•24 — Mir wurde geholfen). One
// sheet: man for people in general, the commonest way round the passive in
// speech · an activity with no subject (Hier wird gelacht · Es wird …) · the
// dative stays dative (Mir wurde geholfen) · which one to choose. Built on the
// passive's verb lesson (s2.pv: werden + Partizip II) and on man (Stage 0's
// man.verb — man takes the er-form). sich lassen is the lassen lesson's;
// sein … zu (Das ist leicht zu finden) is the post-B1 passive's.
cxPack({
  id: "s2-man",
  sections: {
    "s2.man": {
      testout: { n: 4, miss: 1 },
      rules: {
        "imp.man": "man instead of the passive: Hier spricht man Deutsch",
        "imp.es": "No subject: Hier wird gelacht · Es wird gelacht",
        "imp.dat": "The dative stays dative: Mir wurde geholfen",
        "imp.which": "Active, passive or man: who matters?",
      },
      sheets: [
        { id: "cx.pman", title: "man sagt · es wird gelacht · mir wurde geholfen", qn: 3,
          struct: [["Hier", "pre"], ["wird", "aux"], ["viel", "mid"], ["gelacht", "p2"]],
          why: "German has easy ways around the passive. In speech, **man** is the most common. And when only the activity matters, the passive needs no subject at all: Hier **wird** viel **gelacht**.",
          rid: ["imp.man", "imp.es", "imp.dat", "imp.which"],
          rules: [
            "**man** (people, you, they) says what people in general do, with the er-form of the verb. It is the usual way round the passive in speech: Wie **schreibt man** das? = Wie **wird** das **geschrieben**?",
            "When only the **activity** matters, the passive has no subject: Hier **wird** viel **gelacht**. · Am Sonntag **wird** nicht **gearbeitet**. If nothing else comes first, **es** fills the first place: **Es wird** viel gelacht.",
            "A **dative** object stays dative in the passive, and the verb stays in the er-form: Man hilft **mir**. → **Mir wird geholfen**. · **Dem Kind wurde** ein Geschenk **gegeben**. With helfen, danken, antworten, glauben there is no subject at all.",
            "Choose by what matters. **Who** does it: the active (Die Polizei sucht den Dieb). **What happens**: the passive (Der Dieb wird gesucht). **People in general**: man (Man sucht den Dieb).",
          ],
          table: { head: ["man", "passive"], rows: [
            ["man lacht viel", "es wird viel gelacht"],
            ["man fragt **mich**", "**ich** werde gefragt"],
            ["man hilft **mir**", "**mir** wird geholfen"],
          ] },
          ex: [
            ["In der Schweiz **trinkt man** viel Kaffee.", "People drink a lot of coffee in Switzerland."],
            ["Bei uns **wird** am Abend zusammen **gegessen**.", "At our place we eat together in the evening."],
            ["**Es wurde** bis drei Uhr morgens **getanzt**.", "There was dancing until three in the morning."],
            ["**Uns wurde** gesagt, dass der Zug ausfällt.", "We were told that the train is cancelled."],
          ],
          trap: "**man** is never replaced by er: ~~Man kauft ein Ticket, dann steigt er ein~~ — it stays man: …, dann steigt **man** ein. And the dative never becomes ich: ~~Ich wurde geholfen~~ is wrong; it's **Mir wurde geholfen**.",
          quiz: [
            { at: "r1", k: "pick", q: "Wie wird das gemacht? → Wie ___ das?", o: ["macht man", "man macht", "machen man"], a: 0, why: "man takes the er-form, and in a question the verb comes first: **macht man**." },
            { at: "r1", k: "type", cx: true, q: "Hier wird Deutsch gesprochen. → Hier ___ man Deutsch.", a: ["spricht"], r: ["imp.man"], why: "man + the er-form: **spricht**." },
            { at: "r2", k: "pick", q: "There is a lot of dancing:", o: ["Es wird viel getanzt.", "Es ist viel getanzt.", "Er wird viel getanzt."], a: 0, why: "No subject: **es** fills the first place, then **wird** + Partizip II." },
            { at: "r2", k: "pick", q: "Am Sonntag ___ nicht gearbeitet.", o: ["wird", "werden", "ist"], a: 0, why: "No subject: the verb stays in the er-form, **wird**." },
            { at: "r3", k: "pick", q: "Man hilft mir. →", o: ["Mir wird geholfen.", "Ich werde geholfen.", "Mich wird geholfen."], a: 0, why: "helfen takes the dative, and the dative stays: **Mir** wird geholfen." },
            { at: "r3", k: "order", q: "Build it: We were given a key.", a: ["Uns", "wurde", "ein Schlüssel", "gegeben."], why: "uns stays dative; ein Schlüssel is the subject." },
            { at: "r4", k: "pick", q: "People in general:", o: ["Man feiert den 1. August mit Feuerwerk.", "Der 1. August feiert mit Feuerwerk."], a: 0, why: "For people in general, use **man**." },
            { at: "r4", k: "pick", q: "Who does it matters:", o: ["Meine Nachbarin hat das Paket genommen.", "Das Paket ist genommen worden."], a: 0, why: "To say **who**, use the active." },
            { at: "table", k: "pick", q: "Man fragt mich. → ___ gefragt.", o: ["Ich werde", "Mich wird", "Mir wird"], a: 0, why: "fragen takes the accusative, so mich becomes the subject: **ich werde** gefragt. Only a dative stays (mir wird geholfen)." },
            { at: "trap", k: "pick", q: "Which is right?", o: ["Mir wurde geholfen.", "Ich wurde geholfen."], a: 0, why: "helfen takes the dative: **Mir** wurde geholfen." },
          ] },
      ],
      diag: [
        { t: "swap", from: "^(ich|du|er|sie|wir|ihr)$", to: "^(mir|dir|ihm|ihr|uns|euch|ihnen)$", rule: "imp.dat", hard: true, msg: "The dative stays dative in the passive: **{right}** wurde geholfen." },
        { t: "swap", from: "^(werde|wirst|werden|wurden|wurdest)$", to: "^(wird|wurde)$", rule: "imp.es", hard: true, msg: "With no subject, the verb stays in the er-form: **{right}**." },
        { t: "swap", from: "^(er|sie)$", to: "^man$", rule: "imp.man", hard: true, msg: "man stays **man** — it never becomes er." },
        { t: "swap", from: "^(machen|sagen|sprechen|schreiben|essen|trinken|kaufen|kochen|bezahlen|singen|lesen|feiern)$", to: "^(macht|sagt|spricht|schreibt|isst|trinkt|kauft|kocht|bezahlt|singt|liest|feiert)$", rule: "imp.man", msg: "man takes the er-form: **{right}**." },
        { t: "missing", whole: true, tok: "^es$", rule: "imp.es", msg: "With nothing else in first place, **es** fills it: **Es** wird …" },
      ],
      drills: [
        // ── Übung 25•13: from the passive to man ──
        { id: "d25.13", ex: "25.13", t: "transform", title: "Say it with man", how: "Say it the way people usually do: with man and the er-form of the verb.", items: [
          { q: "Wie wird das Wort ausgesprochen?", a: ["Wie spricht man das Wort aus?"], r: ["imp.man"] },
          { q: "Hier wird Deutsch gesprochen.", a: ["Hier spricht man Deutsch.", "Man spricht hier Deutsch."], r: ["imp.man"] },
          { q: "Das Fondue wird mit einer langen Gabel gegessen.", a: ["Man isst das Fondue mit einer langen Gabel.", "Das Fondue isst man mit einer langen Gabel."], r: ["imp.man"] },
          { q: "Die Bohnen werden langsam gekocht.", a: ["Man kocht die Bohnen langsam.", "Die Bohnen kocht man langsam."], r: ["imp.man"] },
          { q: "Wo werden die Billette gekauft?", a: ["Wo kauft man die Billette?"], r: ["imp.man"] },
          { q: "Im Bus wird nicht gegessen.", a: ["Im Bus isst man nicht.", "Man isst nicht im Bus."], r: ["imp.man"] },
          { q: "Die Rechnung wird an der Kasse bezahlt.", a: ["Man bezahlt die Rechnung an der Kasse.", "Die Rechnung bezahlt man an der Kasse."], r: ["imp.man"] },
          { q: "Wie wird das auf Englisch gesagt?", a: ["Wie sagt man das auf Englisch?"], r: ["imp.man"] },
          { q: "Früher wurden viele Briefe geschrieben.", a: ["Früher schrieb man viele Briefe.", "Früher hat man viele Briefe geschrieben."], r: ["imp.man"] },
          { q: "Am 1. August wird gefeiert.", a: ["Am 1. August feiert man.", "Man feiert am 1. August."], r: ["imp.man"] },
        ] },
        // ── Übung 25•14: from man to es wird ──
        { id: "d25.14", ex: "25.14", t: "transform", fixed: true, title: "Es wird …", how: "What happens in the German class? Say it in the passive, starting with Es wird.", items: [
          { q: "Man liest einen Text.", a: ["Es wird ein Text gelesen."], r: ["imp.es"] },
          { q: "Man spricht viel.", a: ["Es wird viel gesprochen."], r: ["imp.es"] },
          { q: "Man lacht oft.", a: ["Es wird oft gelacht."], r: ["imp.es"] },
          { q: "Man schreibt einen kurzen Brief.", a: ["Es wird ein kurzer Brief geschrieben."], r: ["imp.es"] },
          { q: "Man hört gut zu.", a: ["Es wird gut zugehört."], r: ["imp.es"] },
          { q: "Man macht eine Pause.", a: ["Es wird eine Pause gemacht."], r: ["imp.es"] },
          { q: "Man arbeitet in Gruppen.", a: ["Es wird in Gruppen gearbeitet."], r: ["imp.es"] },
          { q: "Man stellt viele Fragen.", a: ["Es werden viele Fragen gestellt."], r: ["imp.es"] },
          { q: "Man singt ein Lied.", a: ["Es wird ein Lied gesungen."], r: ["imp.es"] },
        ].map(it => ({ ...it, diag: [{ t: "order", rule: "imp.es", msg: "**Es** first, then **wird**, the rest, and the Partizip II at the very end: Es wird viel **gelacht**." }] })) },
        // ── Übung 25•10: start with es ──
        { id: "d25.10", ex: "25.10", t: "transform", fixed: true, title: "Start with Es", how: "Say it again starting with Es. The verb stays second.", items: [
          { q: "Am Abend wird musiziert.", a: ["Es wird am Abend musiziert."], r: ["imp.es"] },
          { q: "Hier wird hart gearbeitet.", a: ["Es wird hier hart gearbeitet."], r: ["imp.es"] },
          { q: "Im Sommer wurde viel gewandert.", a: ["Es wurde im Sommer viel gewandert."], r: ["imp.es"] },
          { q: "Bei uns wird viel gelacht.", a: ["Es wird bei uns viel gelacht."], r: ["imp.es"] },
          { q: "Gestern wurde lange gefeiert.", a: ["Es wurde gestern lange gefeiert."], r: ["imp.es"] },
          { q: "Am Sonntag wird nicht gearbeitet.", a: ["Es wird am Sonntag nicht gearbeitet."], r: ["imp.es"] },
          { q: "Auf der Hochzeit wurde bis zum Morgen getanzt.", a: ["Es wurde auf der Hochzeit bis zum Morgen getanzt."], r: ["imp.es"] },
          { q: "Im Zug wird nicht geraucht.", a: ["Es wird im Zug nicht geraucht."], r: ["imp.es"] },
          { q: "Bei der SBB wurde gestreikt.", a: ["Es wurde bei der SBB gestreikt."], r: ["imp.es"] },
        ] },
        // ── Übung 25•3: verbs with a dative ──
        { id: "d25.3", ex: "25.3", t: "transform", title: "Mir wurde geholfen", how: "Say it in the passive, in the same tense. The dative stays dative — there's no subject.", items: [
          { q: "Der Arzt half dem Patienten.", a: ["Dem Patienten wurde vom Arzt geholfen.", "Dem Patienten wurde von dem Arzt geholfen."], r: ["imp.dat"], vf: [["helfen", "pvpt", "er"]] },
          { q: "Man hilft uns.", a: ["Uns wird geholfen."], r: ["imp.dat"] },
          { q: "Niemand antwortete mir.", a: ["Mir wurde nicht geantwortet."], r: ["imp.dat"], vf: [["antworten", "pvpt", "er"]] },
          { q: "Man dankte den Helfern.", a: ["Den Helfern wurde gedankt."], r: ["imp.dat"], vf: [["danken", "pvpt", "er"]] },
          { q: "Alle gratulierten ihr.", a: ["Ihr wurde gratuliert.", "Ihr wurde von allen gratuliert."], r: ["imp.dat"], vf: [["gratulieren", "pvpt", "er"]] },
          { q: "Man glaubt ihm nicht.", a: ["Ihm wird nicht geglaubt."], r: ["imp.dat"] },
          { q: "Die Nachbarn halfen der alten Frau.", a: ["Der alten Frau wurde von den Nachbarn geholfen."], r: ["imp.dat"], vf: [["helfen", "pvpt", "er"]] },
          { q: "Man hat mir nicht geglaubt.", a: ["Mir ist nicht geglaubt worden.", "Mir wurde nicht geglaubt."], r: ["imp.dat"] },
          { q: "Man hilft dir sofort.", a: ["Dir wird sofort geholfen."], r: ["imp.dat"] },
          { q: "Die Kinder dankten der Lehrerin.", a: ["Der Lehrerin wurde von den Kindern gedankt."], r: ["imp.dat"], vf: [["danken", "pvpt", "er"]] },
        ] },
        // ── Übung 25•23: the dative passive in other tenses ──
        { id: "d25.23", ex: "25.23", t: "transform", title: "Ihm wurde geholfen", how: "Say it in the tense in brackets. The dative stays first; the verb stays in the er-form.", items: [
          { q: "Ihr wird nicht geglaubt. (Präteritum)", a: ["Ihr wurde nicht geglaubt."], r: ["imp.dat"], vf: [["glauben", "pvpt", "er"]] },
          { q: "Uns wird geholfen. (Perfekt)", a: ["Uns ist geholfen worden."], r: ["imp.dat"], vf: [["helfen", "pvpf", "er"]] },
          { q: "Mir wurde nicht geantwortet. (Präsens)", a: ["Mir wird nicht geantwortet."], r: ["imp.dat"], vf: [["antworten", "pvpr", "er"]] },
          { q: "Den Gästen wird gedankt. (Präteritum)", a: ["Den Gästen wurde gedankt."], r: ["imp.dat"], vf: [["danken", "pvpt", "er"]] },
          { q: "Dem Kind wird sofort geholfen. (Perfekt)", a: ["Dem Kind ist sofort geholfen worden."], r: ["imp.dat"], vf: [["helfen", "pvpf", "er"]] },
          { q: "Ihm ist gratuliert worden. (Präsens)", a: ["Ihm wird gratuliert."], r: ["imp.dat"], vf: [["gratulieren", "pvpr", "er"]] },
          { q: "Euch wird geholfen. (Präteritum)", a: ["Euch wurde geholfen."], r: ["imp.dat"], vf: [["helfen", "pvpt", "er"]] },
          { q: "Den Kindern wurde nicht geglaubt. (Perfekt)", a: ["Den Kindern ist nicht geglaubt worden."], r: ["imp.dat"], vf: [["glauben", "pvpf", "er"]] },
        ] },
        // ── Übung 25•24: an indirect object ──
        { id: "d25.24", ex: "25.24", t: "transform", title: "Mir wurde ein Paket geschickt", how: "Say it in the passive, in the same tense, without man. The dative stays dative; the thing becomes the subject.", items: [
          { q: "Man schickte mir ein Paket.", a: ["Mir wurde ein Paket geschickt.", "Ein Paket wurde mir geschickt."], r: ["imp.dat"] },
          { q: "Man zeigte uns die Wohnung.", a: ["Uns wurde die Wohnung gezeigt.", "Die Wohnung wurde uns gezeigt."], r: ["imp.dat"] },
          { q: "Man gibt den Kindern ein Geschenk.", a: ["Den Kindern wird ein Geschenk gegeben.", "Ein Geschenk wird den Kindern gegeben."], r: ["imp.dat"] },
          { q: "Man erklärte ihm den Weg.", a: ["Ihm wurde der Weg erklärt.", "Der Weg wurde ihm erklärt."], r: ["imp.dat"] },
          { q: "Man hat mir eine Stelle angeboten.", a: ["Mir ist eine Stelle angeboten worden.", "Eine Stelle ist mir angeboten worden."], r: ["imp.dat"] },
          { q: "Man empfiehlt den Gästen das Tagesmenü.", a: ["Den Gästen wird das Tagesmenü empfohlen.", "Das Tagesmenü wird den Gästen empfohlen."], r: ["imp.dat"] },
          { q: "Man schenkte ihr Blumen.", a: ["Ihr wurden Blumen geschenkt.", "Blumen wurden ihr geschenkt."], r: ["imp.dat"] },
          { q: "Man hat uns die Schlüssel gegeben.", a: ["Uns sind die Schlüssel gegeben worden.", "Die Schlüssel sind uns gegeben worden."], r: ["imp.dat"] },
          { q: "Man schickt Ihnen die Rechnung per Post.", a: ["Ihnen wird die Rechnung per Post geschickt.", "Die Rechnung wird Ihnen per Post geschickt."], r: ["imp.dat"] },
          { q: "Man sagte uns nichts.", a: ["Uns wurde nichts gesagt."], r: ["imp.dat"] },
        ] },
        // ── Übung 25•19: active, passive, state or man? ──
        { id: "d25.19", ex: "25.19", t: "pick", title: "Which way?", how: "The same news, four ways. Pick the one the brackets ask for.", items: [
          { q: "(active) ___", o: ["Die Gemeinde baute die Brücke.", "Die Brücke wurde gebaut.", "Man baute die Brücke.", "Die Brücke ist gebaut."], a: ["Die Gemeinde baute die Brücke."], r: ["imp.which"] },
          { q: "(passive) ___", o: ["Die Brücke wurde gebaut.", "Die Gemeinde baute die Brücke.", "Man baute die Brücke.", "Die Brücke ist gebaut."], a: ["Die Brücke wurde gebaut."], r: ["imp.which"] },
          { q: "(man) ___", o: ["Man baute die Brücke.", "Die Brücke wurde gebaut.", "Die Gemeinde baute die Brücke.", "Die Brücke ist gebaut."], a: ["Man baute die Brücke."], r: ["imp.man"] },
          { q: "(the state, the result) ___", o: ["Die Brücke ist gebaut.", "Die Brücke wurde gebaut.", "Man baute die Brücke.", "Die Gemeinde baute die Brücke."], a: ["Die Brücke ist gebaut."], r: ["imp.which"] },
          { q: "(passive) Der Brief ___", o: ["wurde geschrieben.", "ist geschrieben.", "schrieb man."], a: ["wurde geschrieben."], r: ["imp.which"] },
          { q: "(man) Den Brief ___", o: ["schrieb man.", "wurde geschrieben.", "ist geschrieben."], a: ["schrieb man."], r: ["imp.man"] },
          { q: "(passive, no subject) Hier ___", o: ["wird getanzt.", "tanzt man.", "tanzen alle."], a: ["wird getanzt."], r: ["imp.es"] },
          { q: "(man) Hier ___", o: ["tanzt man.", "wird getanzt.", "tanzen alle."], a: ["tanzt man."], r: ["imp.man"] },
          { q: "(passive) Dem Mann ___", o: ["wurde geholfen.", "half man.", "half die Polizei."], a: ["wurde geholfen."], r: ["imp.dat"] },
          { q: "(active) Dem Mann ___", o: ["half die Polizei.", "wurde geholfen.", "half man."], a: ["half die Polizei."], r: ["imp.which"] },
        ] },
        // ── Production ──
        { id: "dman.build", t: "compose", end: true, title: "Build it", how: "Build the sentence: man + the er-form, or the passive with no subject (es wird …, mir wird …).", items: [
          { w: ["in der Schweiz", "man", "viel Käse", "essen"], a: ["In der Schweiz isst man viel Käse.", "Man isst in der Schweiz viel Käse."], r: ["imp.man"] },
          { w: ["wie", "man", "das", "schreiben", "?"], a: ["Wie schreibt man das?"], r: ["imp.man"] },
          { w: ["hier", "nicht", "rauchen", "(passive)"], a: ["Hier wird nicht geraucht."], r: ["imp.es"] },
          { w: ["es", "bis Mitternacht", "tanzen", "(passive, past)"], a: ["Es wurde bis Mitternacht getanzt."], r: ["imp.es"] },
          { w: ["mir", "sofort", "helfen", "(passive, past)"], a: ["Mir wurde sofort geholfen."], r: ["imp.dat"] },
          { w: ["uns", "nichts", "sagen", "(passive, past)"], a: ["Uns wurde nichts gesagt."], r: ["imp.dat"] },
          { w: ["am Sonntag", "man", "nicht", "den Rasen", "mähen"], a: ["Am Sonntag mäht man den Rasen nicht.", "Am Sonntag mäht man nicht den Rasen.", "Man mäht am Sonntag den Rasen nicht.", "Am Sonntag mäht man keinen Rasen."], r: ["imp.man"] },
          { w: ["bei uns", "viel", "lachen", "(passive)"], a: ["Bei uns wird viel gelacht."], r: ["imp.es"] },
          { w: ["den Gästen", "das Zimmer", "zeigen", "(passive)"], a: ["Den Gästen wird das Zimmer gezeigt.", "Das Zimmer wird den Gästen gezeigt."], r: ["imp.dat"] },
        ] },
        { id: "dp.man", t: "translate", end: true, title: "Say it in German", how: "Translate with man, or the passive without a subject.", items: [
          { q: "How do you say that in Swiss German?", a: ["Wie sagt man das auf Schweizerdeutsch?"], r: ["imp.man"] },
          { q: "People eat late in Spain.", a: ["In Spanien isst man spät.", "Man isst in Spanien spät."], r: ["imp.man"] },
          { q: "There's no smoking here.", a: ["Hier wird nicht geraucht.", "Hier raucht man nicht.", "Es wird hier nicht geraucht."], r: ["imp.es"] },
          { q: "I was helped right away.", a: ["Mir wurde sofort geholfen.", "Mir ist sofort geholfen worden."], r: ["imp.dat"] },
          { q: "We were told nothing.", a: ["Uns wurde nichts gesagt.", "Uns ist nichts gesagt worden.", "Man hat uns nichts gesagt."], r: ["imp.dat"] },
          { q: "There was a lot of laughing.", a: ["Es wurde viel gelacht."], r: ["imp.es"] },
          { q: "Where can you buy tickets?", a: ["Wo kann man Billette kaufen?", "Wo kann man Tickets kaufen?", "Wo kann man Fahrkarten kaufen?"], r: ["imp.man"] },
          { q: "Nobody answered her. (passive)", a: ["Ihr wurde nicht geantwortet.", "Ihr ist nicht geantwortet worden."], r: ["imp.dat"] },
          { q: "On Sundays people don't work.", a: ["Am Sonntag arbeitet man nicht.", "Sonntags arbeitet man nicht.", "Am Sonntag wird nicht gearbeitet.", "Sonntags wird nicht gearbeitet."], r: ["imp.man"] },
          { q: "He was offered a job.", a: ["Ihm wurde eine Stelle angeboten.", "Ihm ist eine Stelle angeboten worden."], r: ["imp.dat"] },
          { q: "You don't do that!", a: ["Das macht man nicht!", "Das macht man nicht.", "So etwas macht man nicht!"], r: ["imp.man"] },
        ] },
        { id: "dw.man", t: "write", end: true, title: "Write your own", how: "Write in your own words. Saved for Claude to correct.", items: [
          { q: "What do people do in Switzerland that surprised you? (In der Schweiz … man …)", model: ["In der Schweiz trennt man den Abfall sehr genau. Am Sonntag mäht man keinen Rasen, und im Zug spricht man leise."], r: ["imp.man"] },
          { q: "A party you remember: what was done there? (Es wurde …)", model: ["Auf der Hochzeit meiner Cousine wurde viel gegessen und getrunken. Es wurde bis drei Uhr morgens getanzt."], r: ["imp.es"] },
          { q: "Someone helped you once. Tell it with Mir wurde …", model: ["Als ich neu in Bern war, wurde mir von einer Nachbarin sehr geholfen. Mir wurde gezeigt, wo man einkauft und wie man den Abfall trennt."], r: ["imp.dat"] },
          { q: "How do people celebrate a holiday in your country?", model: ["Bei uns wird Neujahr mit der Familie gefeiert. Man isst zusammen, und um Mitternacht wird gesungen."], r: ["imp.man"] },
          { q: "What is (not) allowed at your workplace or school? (Hier wird nicht …)", model: ["In unserem Büro wird nicht gegessen. Man darf aber Kaffee trinken, und am Freitag wird früher Feierabend gemacht."], r: ["imp.es"] },
          { q: "A recipe in a few steps, with man.", model: ["Zuerst schneidet man die Zwiebeln. Dann brät man sie in Butter und gibt den Reis dazu."], r: ["imp.man"] },
          { q: "Something you were told or promised. (Uns wurde gesagt … · Mir wurde versprochen …)", model: ["Uns wurde gesagt, dass die Heizung im Oktober repariert wird. Mir wurde auch ein neuer Schlüssel versprochen."], r: ["imp.dat"] },
          { q: "Active, passive or man: tell the same small event three ways.", model: ["Ein Dieb hat mein Velo gestohlen. Mein Velo ist gestohlen worden. Man hat mein Velo gestohlen."], r: ["imp.which"] },
        ] },
      ],
    },
  },
});

// What chapter 25 became for this lesson.
cxCover({ "25.3": "d25.3", "25.10": "d25.10", "25.13": "d25.13", "25.14": "d25.14", "25.19": "d25.19", "25.23": "d25.23", "25.24": "d25.24" });
cxJournal([
  { id: "w.ourway", th: "swiss", lv: "B1", de: "Bei uns macht man das so", t: "Compare a custom from where you grew up with how it's done in Switzerland — greeting people, a birthday, Sunday, eating together. Use man, and es wird … for what happens.", help: ["Bei uns macht man …", "In der Schweiz …", "Am Sonntag wird …", "Mir wurde gesagt, dass …"], sec: "s2.man" },
]);
