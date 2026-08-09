// ─────────────────────────────────────────────
// B1 DECKS — Goethe-/ÖSD-Zertifikat B1 word list
// Source: "Goethe-Zertifikat B1 Wortliste" (Goethe-Institut / ÖSD /
// Universität Freiburg, Hueber 2016). German example sentences are the
// list's own; English translations are ours.
//
// Only words that are new at B1 appear here — anything already covered
// by DECKS_A1 or DECKS_A2 is deliberately left out.
//
// Format: { en, de, pl (nouns), hint, examples:[{de,en}] }
//   · `de` is the typed answer and always has exactly ONE accepted form
//     (no slashes — isCorrect() would read them as alternatives).
//   · All disambiguation therefore lives in `en`: where two German words
//     share an English gloss, the parenthetical names the actual
//     difference, so the prompt alone determines the answer.
//   · Nouns carry their article in `de`, so "the mood" → "die Laune".
// ─────────────────────────────────────────────

const DECKS_B1 = {
  id: "b1", name: "B1", icon: "💫",
  decks: [

    // ── 1. EVERYDAY EXPRESSIONS & REACTIONS ────────────────────────
    {
      id: "b1_expressions", name: "Everyday Expressions & Reactions", icon: "💬",
      words: [

        // Discourse adverbs & particles
        { en:"however / mind you (adds a restriction)", de:"allerdings", hint:"adverb — softens what you just said", examples:[{de:"Wir können uns morgen treffen, allerdings habe ich erst ab Mittag Zeit.",en:"We can meet tomorrow, however I only have time from midday."}] },
        { en:"admittedly (paired with aber)", de:"zwar", hint:"adverb — always sets up a following aber", examples:[{de:"Diese Schuhe sind zwar teuer, aber gut.",en:"These shoes are admittedly expensive, but good."}] },
        { en:"presumably (my guess, no proof)", de:"vermutlich", hint:"adverb — from vermuten, to suppose", examples:[{de:"Vermutlich sagt er die Wahrheit.",en:"Presumably he is telling the truth."}] },
        { en:"apparently (going by the evidence)", de:"offenbar", hint:"adverb — something visible points to it", examples:[{de:"Das Restaurant ist heute offenbar geschlossen.",en:"The restaurant is apparently closed today."}] },
        { en:"surely / I'm sure (speaker's confidence)", de:"bestimmt", hint:"adverb — stronger than vermutlich", examples:[{de:"Das hat Nancy bestimmt nicht so gemeint.",en:"Nancy surely did not mean it that way."}] },
        { en:"in fact / really (contrary to how it looks)", de:"tatsächlich", hint:"adverb — corrects an appearance", examples:[{de:"Die Hose ist tatsächlich zu klein, obwohl sie so groß aussieht.",en:"The trousers are in fact too small, although they look so big."}] },
        { en:"anyway (it was happening regardless)", de:"sowieso", hint:"adverb — the action was already planned", examples:[{de:"Willst du mir den Brief mitgeben? Ich gehe sowieso zur Post.",en:"Do you want to give me the letter? I'm going to the post office anyway."}] },
        { en:"by the way (opens a new topic)", de:"übrigens", hint:"adverb — changes the subject", examples:[{de:"Übrigens, kennst du schon die neuen Nachbarn?",en:"By the way, do you already know the new neighbours?"}] },
        { en:"in the end / eventually", de:"schließlich", hint:"adverb — after a long wait", examples:[{de:"Ich musste lange warten. Aber schließlich habe ich den Job doch noch bekommen.",en:"I had to wait a long time. But in the end I did get the job after all."}] },
        { en:"sooner / earlier (than someone else)", de:"eher", hint:"adverb — comparative of früh", examples:[{de:"Ich stehe meist eher auf als mein Mann.",en:"I usually get up earlier than my husband."}] },
        { en:"fine by me / as far as I'm concerned", de:"meinetwegen", hint:"adverb — grudging permission", examples:[{de:"Meinetwegen kannst du heute das Auto haben.",en:"As far as I'm concerned you can have the car today."}] },
        { en:"just / merely (spoken alternative to nur)", de:"bloß", hint:"adverb — colloquial, same sense as nur", examples:[{de:"Ich möchte nichts kaufen. Ich möchte mich bloß umsehen.",en:"I don't want to buy anything. I just want to look around."}] },
        { en:"nevertheless / even so", de:"trotzdem", hint:"adverb — concedes the previous sentence", examples:[{de:"Es war ziemlich kalt. Trotzdem bin ich schwimmen gegangen.",en:"It was quite cold. Even so, I went swimming."}] },
        { en:"that is why (the -wegen form)", de:"deswegen", hint:"adverb — synonym of deshalb, learned at A1", examples:[{de:"Ich habe falsch geparkt. Deswegen habe ich einen Strafzettel bekommen.",en:"I parked wrongly. That is why I got a parking ticket."}] },
        { en:"you see (gives the reason afterwards)", de:"nämlich", hint:"adverb — never starts the sentence", examples:[{de:"Ich muss leider gehen. Ich habe nämlich noch einen Termin beim Zahnarzt.",en:"I have to go, I'm afraid. I still have a dentist's appointment, you see."}] },
        { en:"hardly / barely", de:"kaum", hint:"adverb — almost not at all", examples:[{de:"Ich kann Sie kaum verstehen. Bitte sprechen Sie lauter.",en:"I can hardly understand you. Please speak louder."}] },
        { en:"at all (reinforces a negation)", de:"überhaupt", hint:"adverb — überhaupt nicht = not at all", examples:[{de:"Die Suppe schmeckt mir überhaupt nicht.",en:"I do not like the soup at all."}] },
        { en:"sometime / at some point", de:"irgendwann", hint:"adverb — unspecified time", examples:[{de:"Ich habe Sie irgendwann schon mal gesehen.",en:"I have seen you sometime before."}] },
        { en:"of course / it goes without saying", de:"selbstverständlich", hint:"adverb — polite, formal", examples:[{de:"Selbstverständlich sagen wir Ihnen sofort Bescheid.",en:"Of course we will let you know immediately."}] },
        { en:"exactly the same / just like", de:"genauso", hint:"adverb — genauso … wie", examples:[{de:"Katarina sieht genauso aus wie ihre Schwester.",en:"Katarina looks exactly the same as her sister."}] },
        { en:"likewise / you too (the -falls form)", de:"ebenfalls", hint:"adverb — synonym of ebenso", examples:[{de:"Ich wünsche Ihnen ein schönes Wochenende. – Danke, ebenfalls.",en:"I wish you a nice weekend. – Thanks, likewise."}] },
        { en:"likewise / you too (the -so form)", de:"ebenso", hint:"adverb — synonym of ebenfalls", examples:[{de:"Schöne Feiertage. – Danke, ebenso.",en:"Happy holidays. – Thanks, likewise."}] },
        { en:"all the same to me / doesn't matter", de:"egal", hint:"adjective — es ist mir egal", examples:[{de:"Es ist mir ganz egal, was die Leute denken.",en:"It is all the same to me what people think."}] },

        // Luck, trouble and mood
        { en:"the luck (good fortune)", de:"das Glück", hint:"neuter noun — no plural", examples:[{de:"Du hast dich nicht verletzt. Da hast du Glück gehabt.",en:"You did not hurt yourself. You were lucky there."}] },
        { en:"the bad luck", de:"das Pech", hint:"neuter noun — opposite of Glück", examples:[{de:"Es regnet. Unser Picknick fällt leider aus. – So ein Pech!",en:"It is raining. Our picnic is cancelled. – What bad luck!"}] },
        { en:"the trouble / the aggravation", de:"der Ärger", hint:"masculine noun — no plural", examples:[{de:"Ich hatte heute Ärger im Büro. Ich habe mich mit einem Kollegen gestritten.",en:"I had trouble at the office today. I argued with a colleague."}] },
        { en:"the argument / the quarrel", de:"der Streit", hint:"masculine noun", examples:[{de:"Ich möchte keinen Streit mit den Nachbarn.",en:"I do not want an argument with the neighbours."}] },
        { en:"the mood (one person's temper)", de:"die Laune", pl:"die Launen", hint:"feminine noun — gute/schlechte Laune", examples:[{de:"Heute geht es mir besser, aber gestern hatte ich richtig schlechte Laune.",en:"I feel better today, but yesterday I was in a really bad mood."}] },
        { en:"the mood (atmosphere of a place or group)", de:"die Stimmung", pl:"die Stimmungen", hint:"feminine noun — of a party, a room, a crowd", examples:[{de:"Es war eine tolle Party. Die Stimmung war sehr gut.",en:"It was a great party. The atmosphere was very good."}] },
        { en:"the impression", de:"der Eindruck", pl:"die Eindrücke", hint:"masculine noun — umlaut plural", examples:[{de:"Ich finde die Leute auf der Straße ziemlich unfreundlich. Wie ist dein Eindruck?",en:"I find the people in the street rather unfriendly. What is your impression?"}] },
        { en:"the coincidence", de:"der Zufall", pl:"die Zufälle", hint:"masculine noun — umlaut plural", examples:[{de:"So ein Zufall, dass ich dich hier treffe.",en:"What a coincidence that I meet you here."}] },
        { en:"the exception", de:"die Ausnahme", pl:"die Ausnahmen", hint:"feminine noun", examples:[{de:"Normalerweise muss ich am Wochenende arbeiten. Aber heute ist eine Ausnahme.",en:"Normally I have to work at the weekend. But today is an exception."}] },
        { en:"the intention", de:"die Absicht", pl:"die Absichten", hint:"feminine noun — mit Absicht = on purpose", examples:[{de:"Entschuldigen Sie bitte. Meine Tochter hat das nicht mit Absicht gemacht.",en:"Please excuse us. My daughter did not do that on purpose."}] },
        { en:"the emergency", de:"der Notfall", pl:"die Notfälle", hint:"masculine noun — umlaut plural", examples:[{de:"Wir haben einen Notfall. Bitte schicken Sie einen Krankenwagen.",en:"We have an emergency. Please send an ambulance."}] },
        { en:"the miracle / the wonder", de:"das Wunder", pl:"die Wunder", hint:"neuter noun — plural unchanged", examples:[{de:"Ich bin mit dem Fahrrad gestürzt. Es war ein Wunder, dass nichts Schlimmes passiert ist.",en:"I fell off my bicycle. It was a miracle that nothing bad happened."}] },

        // Getting along with people
        { en:"the patience", de:"die Geduld", hint:"feminine noun — no plural", examples:[{de:"Bitte haben Sie etwas Geduld.",en:"Please have a little patience."}] },
        { en:"the understanding (sympathy for someone)", de:"das Verständnis", hint:"neuter noun — no plural", examples:[{de:"Wir bitten um Ihr Verständnis.",en:"We ask for your understanding."}] },
        { en:"the consideration (for other people)", de:"die Rücksicht", pl:"die Rücksichten", hint:"feminine noun — Rücksicht nehmen auf", examples:[{de:"Nehmen Sie bitte Rücksicht auf die anderen Gäste.",en:"Please show consideration for the other guests."}] },
        { en:"the trust", de:"das Vertrauen", hint:"neuter noun — no plural", examples:[{de:"Ich habe Vertrauen zu Ihnen.",en:"I have trust in you."}] },
        { en:"the effort / the trouble taken", de:"die Mühe", hint:"feminine noun", examples:[{de:"Vielen Dank für Ihre Mühe.",en:"Many thanks for your effort."}] },
        { en:"the reproach / the accusation", de:"der Vorwurf", pl:"die Vorwürfe", hint:"masculine noun — jemandem Vorwürfe machen", examples:[{de:"Eva kann nichts dafür. Mach ihr keine Vorwürfe.",en:"It is not Eva's fault. Do not reproach her."}] },
        { en:"the compromise", de:"der Kompromiss", pl:"die Kompromisse", hint:"masculine noun — einen Kompromiss finden", examples:[{de:"Alle wollen etwas anderes. Wir müssen einen Kompromiss finden.",en:"Everyone wants something different. We have to find a compromise."}] },

        // Opinions, advice and outcomes
        { en:"the opinion (what you think)", de:"die Meinung", pl:"die Meinungen", hint:"feminine noun — der Meinung sein, dass", examples:[{de:"Ich bin der Meinung, dass du recht hast.",en:"I am of the opinion that you are right."}] },
        { en:"the point of view (the position you argue from)", de:"der Standpunkt", pl:"die Standpunkte", hint:"masculine noun — more formal than Meinung", examples:[{de:"Von seinem Standpunkt aus hat er recht.",en:"From his point of view he is right."}] },
        { en:"the suggestion / the proposal", de:"der Vorschlag", pl:"die Vorschläge", hint:"masculine noun — einen Vorschlag machen", examples:[{de:"Ich mache dir einen Vorschlag: Du hilfst mir beim Deutschlernen, und ich lade dich zum Essen ein.",en:"I'll make you a suggestion: you help me learn German, and I'll take you out for a meal."}] },
        { en:"the advice (a serious recommendation)", de:"der Rat", hint:"masculine noun — einen Rat geben", examples:[{de:"Was soll ich machen? Können Sie mir einen Rat geben?",en:"What should I do? Can you give me some advice?"}] },
        { en:"the tip (a practical hint)", de:"der Tipp", pl:"die Tipps", hint:"masculine noun — lighter than Rat", examples:[{de:"Kannst du mir einen Tipp geben? Wo finde ich billige Möbel?",en:"Can you give me a tip? Where do I find cheap furniture?"}] },
        { en:"the meaning / the sense (what something means)", de:"der Sinn", hint:"masculine noun — es hat keinen Sinn", examples:[{de:"Es hat keinen Sinn, noch ein Spiel zu beginnen. Es ist schon spät.",en:"There is no sense in starting another game. It is already late."}] },
        { en:"the purpose (what something is for)", de:"der Zweck", pl:"die Zwecke", hint:"masculine noun — the aim behind an action", examples:[{de:"Ich glaube, es hat keinen Zweck, sich zu bewerben. Der Job ist sicher schon weg.",en:"I think there is no purpose in applying. The job is surely already gone."}] },
        { en:"the opportunity (the occasion to do something)", de:"die Gelegenheit", pl:"die Gelegenheiten", hint:"feminine noun — a moment that suits", examples:[{de:"Das Fest ist eine gute Gelegenheit, unsere Freunde zu sehen.",en:"The party is a good opportunity to see our friends."}] },
        { en:"the condition (a term you must accept)", de:"die Bedingung", pl:"die Bedingungen", hint:"feminine noun — of a contract or an offer", examples:[{de:"Wenn Sie unsere Bedingungen akzeptieren, können wir einen Vertrag machen.",en:"If you accept our conditions, we can make a contract."}] },
        { en:"the success", de:"der Erfolg", pl:"die Erfolge", hint:"masculine noun", examples:[{de:"Der Film war ein großer Erfolg.",en:"The film was a great success."}] },
        { en:"the official decision (letter from an authority)", de:"der Bescheid", pl:"die Bescheide", hint:"masculine noun — not the phrase Bescheid geben", examples:[{de:"Den endgültigen Bescheid erhalten Sie in etwa vier Wochen.",en:"You will receive the final decision in about four weeks."}] },
      ]
    },

  ]
};
