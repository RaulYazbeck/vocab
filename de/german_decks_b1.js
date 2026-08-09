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

    // ── 2. PEOPLE & RELATIONSHIPS ──────────────────────────────────
    {
      id: "b1_people", name: "People & Relationships", icon: "👥",
      words: [

        // Family, couples and life stages
        { en:"the marriage", de:"die Ehe", pl:"die Ehen", hint:"feminine noun", examples:[{de:"Sie hat zwei Kinder aus erster Ehe.",en:"She has two children from her first marriage."}] },
        { en:"the married couple", de:"das Ehepaar", pl:"die Ehepaare", hint:"neuter noun", examples:[{de:"Das Ehepaar unter uns hat zwei Kinder.",en:"The married couple below us has two children."}] },
        { en:"the separation (splitting up)", de:"die Trennung", pl:"die Trennungen", hint:"feminine noun — from trennen", examples:[{de:"Die Trennung von der Familie war schwierig.",en:"The separation from the family was difficult."}] },
        { en:"the divorce (the legal act)", de:"die Scheidung", pl:"die Scheidungen", hint:"feminine noun — stronger than Trennung", examples:[{de:"Wann war die Scheidung?",en:"When was the divorce?"}] },
        { en:"the birth", de:"die Geburt", pl:"die Geburten", hint:"feminine noun", examples:[{de:"Wir gratulieren zur Geburt eures Kindes!",en:"We congratulate you on the birth of your child!"}] },
        { en:"the pregnancy", de:"die Schwangerschaft", pl:"die Schwangerschaften", hint:"feminine noun", examples:[{de:"Sie dürfen während der Schwangerschaft nicht rauchen.",en:"You must not smoke during pregnancy."}] },
        { en:"the death", de:"der Tod", hint:"masculine noun — no plural", examples:[{de:"Ich habe ihn vor seinem Tod noch einmal gesehen.",en:"I saw him once more before his death."}] },
        { en:"the childhood", de:"die Kindheit", hint:"feminine noun — no plural", examples:[{de:"In meiner Kindheit war ich oft auf dem Land bei meinen Großeltern.",en:"In my childhood I was often in the country at my grandparents'."}] },
        { en:"the youth (period of one's life)", de:"die Jugend", hint:"feminine noun — no plural", examples:[{de:"In meiner Jugend habe ich mich sehr für Musik interessiert.",en:"In my youth I was very interested in music."}] },
        { en:"the generation", de:"die Generation", pl:"die Generationen", hint:"feminine noun", examples:[{de:"In diesem Haus wohnen drei Generationen zusammen.",en:"Three generations live together in this house."}] },
        { en:"the offspring / the next generation", de:"der Nachwuchs", hint:"masculine noun — no plural", examples:[{de:"Der Nachwuchs bei Forschern soll gefördert werden.",en:"The next generation of researchers should be supported."}] },
        { en:"the senior citizens", de:"die Senioren", hint:"plural noun", examples:[{de:"Dieser Computerkurs ist für Senioren.",en:"This computer course is for senior citizens."}] },
        { en:"the grandma (informal)", de:"die Oma", pl:"die Omas", hint:"feminine noun — informal for Großmutter", examples:[{de:"Meine Oma ist achtzig Jahre alt geworden.",en:"My grandma turned eighty years old."}] },
        { en:"the grandpa (informal)", de:"der Opa", pl:"die Opas", hint:"masculine noun — informal for Großvater", examples:[{de:"Mein Opa heißt Hans.",en:"My grandpa is called Hans."}] },
        { en:"the nephew", de:"der Neffe", pl:"die Neffen", hint:"masculine noun — n-declension", examples:[{de:"Meine Schwester hat zwei Kinder. Meine Neffen sind drei und fünf Jahre alt.",en:"My sister has two children. My nephews are three and five years old."}] },
        { en:"the niece", de:"die Nichte", pl:"die Nichten", hint:"feminine noun", examples:[{de:"Die Tasche ist ein Geschenk von meiner Nichte.",en:"The bag is a present from my niece."}] },
        { en:"the relative (family member)", de:"der Angehörige", pl:"die Angehörigen", hint:"masculine noun — declines like an adjective", examples:[{de:"Der Arzt darf nur mit den Angehörigen sprechen.",en:"The doctor may only speak with the relatives."}] },
        { en:"the upbringing", de:"die Erziehung", hint:"feminine noun — no plural", examples:[{de:"Heute kümmern sich auch viele Väter um die Erziehung der Kinder.",en:"Today many fathers also take care of the children's upbringing."}] },

        // Ties between people
        { en:"the relationship (link between people or groups)", de:"die Beziehung", pl:"die Beziehungen", hint:"feminine noun — also a romantic relationship", examples:[{de:"Wir haben gute Beziehungen zu unseren Nachbarn.",en:"We have good relations with our neighbours."}] },
        { en:"the relation (how well two people get on)", de:"das Verhältnis", pl:"die Verhältnisse", hint:"neuter noun — ein gutes Verhältnis zu jemandem", examples:[{de:"Ich habe ein gutes Verhältnis zu meinen Eltern.",en:"I have a good relationship with my parents."}] },
        { en:"the friendship", de:"die Freundschaft", pl:"die Freundschaften", hint:"feminine noun", examples:[{de:"Deine Freundschaft ist mir sehr wichtig.",en:"Your friendship is very important to me."}] },
        { en:"the arrangement to meet", de:"die Verabredung", pl:"die Verabredungen", hint:"feminine noun — from sich verabreden", examples:[{de:"Ich habe um 15 Uhr eine Verabredung mit Klaus.",en:"I have an arrangement to meet Klaus at 3 p.m."}] },
        { en:"the visit", de:"der Besuch", pl:"die Besuche", hint:"masculine noun — also the visitors themselves", examples:[{de:"Wir bekommen Besuch.",en:"We are having visitors."}] },
        { en:"the farewell / the parting", de:"der Abschied", pl:"die Abschiede", hint:"masculine noun", examples:[{de:"Der Abschied von meinen Freunden fiel mir schwer.",en:"The farewell from my friends was hard for me."}] },
        { en:"the homesickness", de:"das Heimweh", hint:"neuter noun — no plural", examples:[{de:"Ich habe oft Heimweh nach meiner Familie.",en:"I often feel homesick for my family."}] },
        { en:"the respect", de:"der Respekt", hint:"masculine noun — no plural", examples:[{de:"Ich habe großen Respekt vor meinem Lehrer.",en:"I have great respect for my teacher."}] },
        { en:"the behaviour (how someone acts)", de:"das Verhalten", hint:"neuter noun — no plural", examples:[{de:"Ich bewundere dein Verhalten in der schwierigen Situation.",en:"I admire your behaviour in the difficult situation."}] },
        { en:"the habit", de:"die Gewohnheit", pl:"die Gewohnheiten", hint:"feminine noun", examples:[{de:"Er hat die Gewohnheit, morgens zuerst die Post zu erledigen.",en:"He has the habit of dealing with the post first thing in the morning."}] },

        // Society
        { en:"the society (people as a whole)", de:"die Gesellschaft", pl:"die Gesellschaften", hint:"feminine noun", examples:[{de:"Er will die Gesellschaft verändern.",en:"He wants to change society."}] },
        { en:"the community (a group living or acting together)", de:"die Gemeinschaft", pl:"die Gemeinschaften", hint:"feminine noun — smaller than Gesellschaft", examples:[{de:"Rauchen ist in den Gemeinschaftsräumen nicht erlaubt.",en:"Smoking is not allowed in the communal rooms."}] },
        { en:"the population", de:"die Bevölkerung", hint:"feminine noun — no plural", examples:[{de:"11 % der Bevölkerung wurden nicht im Inland geboren.",en:"11% of the population were not born in the country."}] },
        { en:"the citizen (member of a state)", de:"der Bürger", pl:"die Bürger", hint:"masculine noun — rights and duties", examples:[{de:"EU-Bürgerinnen und Bürger können überall in Europa arbeiten.",en:"EU citizens can work anywhere in Europe."}] },
        { en:"the inhabitant (of a town or country)", de:"der Einwohner", pl:"die Einwohner", hint:"masculine noun — counted in statistics", examples:[{de:"Berlin hat über drei Millionen Einwohner.",en:"Berlin has over three million inhabitants."}] },
        { en:"the resident (of a building or area)", de:"der Bewohner", pl:"die Bewohner", hint:"masculine noun — smaller scale than Einwohner", examples:[{de:"Ich kenne die anderen Hausbewohner nicht.",en:"I do not know the other residents of the building."}] },
        { en:"the foreigner", de:"der Ausländer", pl:"die Ausländer", hint:"masculine noun", examples:[{de:"Viele Ausländer lernen in der Volkshochschule Deutsch.",en:"Many foreigners learn German at the adult education centre."}] },
        { en:"the migrant", de:"der Migrant", pl:"die Migranten", hint:"masculine noun — n-declension", examples:[{de:"Viele Migranten kommen aus Osteuropa.",en:"Many migrants come from Eastern Europe."}] },
        { en:"the migration", de:"die Migration", hint:"feminine noun — no plural", examples:[{de:"Gestern gab es im Fernsehen eine Diskussion zum Thema Migration.",en:"Yesterday there was a discussion on television about migration."}] },
        { en:"the integration", de:"die Integration", pl:"die Integrationen", hint:"feminine noun", examples:[{de:"Gute Deutschkenntnisse sollen bei der Integration helfen.",en:"Good German skills are meant to help with integration."}] },
        { en:"the majority", de:"die Mehrheit", pl:"die Mehrheiten", hint:"feminine noun", examples:[{de:"Die Mehrheit der Menschen in Deutschland besitzt ein Handy.",en:"The majority of people in Germany own a mobile phone."}] },
        { en:"the minority", de:"die Minderheit", pl:"die Minderheiten", hint:"feminine noun", examples:[{de:"Frauen sind in unserer Firma in der Minderheit.",en:"Women are in the minority in our company."}] },
        { en:"the member (of a club or organisation)", de:"das Mitglied", pl:"die Mitglieder", hint:"neuter noun — even for a person", examples:[{de:"Für Mitglieder ist der Eintritt zum Konzert gratis.",en:"For members, entry to the concert is free."}] },
        { en:"the origin (where someone comes from)", de:"die Herkunft", hint:"feminine noun — no plural", examples:[{de:"Viele Leute fragen mich nach meiner Herkunft.",en:"Many people ask me about my origin."}] },
        { en:"the mother tongue", de:"die Muttersprache", pl:"die Muttersprachen", hint:"feminine noun", examples:[{de:"Was ist Ihre Muttersprache?",en:"What is your mother tongue?"}] },
        { en:"the second language", de:"die Zweitsprache", pl:"die Zweitsprachen", hint:"feminine noun", examples:[{de:"Deutsch ist seine Zweitsprache.",en:"German is his second language."}] },
        { en:"the sex / the gender (on a form)", de:"das Geschlecht", pl:"die Geschlechter", hint:"neuter noun", examples:[{de:"Bitte kreuzen Sie an: Geschlecht männlich oder weiblich.",en:"Please tick: sex male or female."}] },
        { en:"the personal details (name, address, date of birth)", de:"die Personalien", hint:"plural noun only", examples:[{de:"Mein Kollege wird Ihre Personalien aufnehmen.",en:"My colleague will take down your personal details."}] },
        { en:"the hero", de:"der Held", pl:"die Helden", hint:"masculine noun — n-declension", examples:[{de:"Er spielt gern den Helden.",en:"He likes to play the hero."}] },
        { en:"the victim", de:"das Opfer", pl:"die Opfer", hint:"neuter noun — plural unchanged", examples:[{de:"Bei der Schiffskatastrophe gab es viele Opfer.",en:"There were many victims in the ship disaster."}] },
        { en:"the opponent", de:"der Gegner", pl:"die Gegner", hint:"masculine noun — plural unchanged", examples:[{de:"Er ist ein Gegner von Tierversuchen.",en:"He is an opponent of animal testing."}] },

        // Verbs that belong to this topic
        { en:"to bring up (raise a child)", de:"erziehen", hint:"verb irregular · erzog · hat erzogen", examples:[{de:"Kinder zu erziehen ist nicht leicht.",en:"Bringing up children is not easy."}] },
        { en:"to accompany (go along with someone)", de:"begleiten", hint:"verb regular · begleitete · hat begleitet", examples:[{de:"Ich begleite dich ein Stück.",en:"I'll accompany you part of the way."}] },
        { en:"to arrange to meet", de:"verabreden", hint:"verb regular · verabredete · hat verabredet", examples:[{de:"Wir haben uns mit Freunden verabredet. Wir wollen zusammen essen.",en:"We have arranged to meet friends. We want to eat together."}] },
        { en:"to address someone formally (as Sie)", de:"siezen", hint:"verb regular · siezte · hat gesiezt", examples:[{de:"Obwohl sie sich schon lange kennen, siezen sie sich.",en:"Although they have known each other a long time, they address each other formally."}] },
        { en:"to separate (split two things apart)", de:"trennen", hint:"verb regular · trennte · hat getrennt", examples:[{de:"Wir leben getrennt.",en:"We live separately."}] },
      ]
    },

    // ── 3. FEELINGS, MIND & CHARACTER ──────────────────────────────
    {
      id: "b1_feelings", name: "Feelings, Mind & Character", icon: "😊",
      words: [

        // Feelings
        { en:"the fear", de:"die Angst", pl:"die Ängste", hint:"feminine noun — Angst haben vor", examples:[{de:"Du brauchst keine Angst zu haben. Der Hund tut dir nichts.",en:"You need not be afraid. The dog will not hurt you."}] },
        { en:"the worry", de:"die Sorge", pl:"die Sorgen", hint:"feminine noun — sich Sorgen machen", examples:[{de:"Um Ihre Zukunft brauchen Sie sich keine Sorgen zu machen.",en:"You need not worry about your future."}] },
        { en:"the joy", de:"die Freude", hint:"feminine noun — no plural", examples:[{de:"Diese Arbeit macht mir viel Freude.",en:"This work gives me a lot of joy."}] },
        { en:"the pleasure (enjoyment of doing something)", de:"das Vergnügen", pl:"die Vergnügen", hint:"neuter noun — plural unchanged", examples:[{de:"Es ist ein Vergnügen, den Kindern beim Spielen zuzusehen.",en:"It is a pleasure to watch the children playing."}] },
        { en:"the disappointment", de:"die Enttäuschung", pl:"die Enttäuschungen", hint:"feminine noun", examples:[{de:"Das Endspiel war eine große Enttäuschung.",en:"The final was a great disappointment."}] },
        { en:"the surprise", de:"die Überraschung", pl:"die Überraschungen", hint:"feminine noun", examples:[{de:"Ich habe eine Überraschung für dich.",en:"I have a surprise for you."}] },
        { en:"the hope", de:"die Hoffnung", pl:"die Hoffnungen", hint:"feminine noun", examples:[{de:"Man darf die Hoffnung nicht verlieren.",en:"One must not lose hope."}] },
        { en:"the courage", de:"der Mut", hint:"masculine noun — no plural", examples:[{de:"Man braucht viel Mut, um in einem fremden Land ganz neu anzufangen.",en:"You need a lot of courage to start all over in a foreign country."}] },
        { en:"the fright (sudden shock)", de:"der Schreck", hint:"masculine noun — einen Schreck bekommen", examples:[{de:"Ich habe einen großen Schreck bekommen.",en:"I got a big fright."}] },
        { en:"the calm / the quiet", de:"die Ruhe", hint:"feminine noun — no plural", examples:[{de:"Ruhe, bitte!",en:"Quiet, please!"}] },
        { en:"the boredom", de:"die Langeweile", hint:"feminine noun — no plural", examples:[{de:"Das Kind ist aus Langeweile eingeschlafen.",en:"The child fell asleep out of boredom."}] },
        { en:"the feeling", de:"das Gefühl", pl:"die Gefühle", hint:"neuter noun", examples:[{de:"Ich glaube, ich schaffe die Prüfung. Ich habe ein gutes Gefühl.",en:"I think I'll pass the exam. I have a good feeling."}] },
        { en:"the sense of humour", de:"der Humor", hint:"masculine noun — no plural", examples:[{de:"Wir mögen Paul, weil er so viel Humor hat.",en:"We like Paul because he has such a good sense of humour."}] },
        { en:"the tear (from crying)", de:"die Träne", pl:"die Tränen", hint:"feminine noun", examples:[{de:"Sie trocknet dem Kind die Tränen.",en:"She dries the child's tears."}] },
        { en:"the desire (feeling like doing something)", de:"die Lust", hint:"feminine noun — Lust auf etwas haben", examples:[{de:"Ich habe keine Lust zu grillen.",en:"I do not feel like having a barbecue."}] },
        { en:"the relaxation / the recovery", de:"die Erholung", pl:"die Erholungen", hint:"feminine noun — rest after effort", examples:[{de:"Ich habe zu viel gearbeitet. Jetzt brauche ich etwas Erholung.",en:"I have worked too much. Now I need some rest."}] },
        { en:"the hurry", de:"die Eile", hint:"feminine noun — in Eile sein", examples:[{de:"Ich bin sehr in Eile.",en:"I am in a great hurry."}] },
        { en:"the fault / the blame", de:"die Schuld", hint:"feminine noun — es ist meine Schuld", examples:[{de:"Es ist nicht meine Schuld, dass das nicht geklappt hat.",en:"It is not my fault that it did not work out."}] },
        { en:"the conscience", de:"das Gewissen", hint:"neuter noun — no plural", examples:[{de:"Ich habe deinen Geburtstag vergessen. Ich habe ein ganz schlechtes Gewissen.",en:"I forgot your birthday. I have a really bad conscience."}] },

        // Thinking, remembering, believing
        { en:"the thought", de:"der Gedanke", pl:"die Gedanken", hint:"masculine noun — n-declension", examples:[{de:"Ich muss zuerst meine Gedanken sammeln.",en:"First I have to collect my thoughts."}] },
        { en:"the memory (something you remember)", de:"die Erinnerung", pl:"die Erinnerungen", hint:"feminine noun — Erinnerung an", examples:[{de:"An diese Zeit habe ich viele schöne Erinnerungen.",en:"I have many happy memories of that time."}] },
        { en:"the conviction (a firmly held belief)", de:"die Überzeugung", pl:"die Überzeugungen", hint:"feminine noun", examples:[{de:"Wie bist du zu dieser Überzeugung gekommen?",en:"How did you come to this conviction?"}] },
        { en:"the doubt", de:"der Zweifel", pl:"die Zweifel", hint:"masculine noun — plural unchanged", examples:[{de:"Das ist ohne Zweifel die beste Lösung.",en:"That is without doubt the best solution."}] },
        { en:"the suspicion", de:"der Verdacht", hint:"masculine noun — no plural", examples:[{de:"Wer hat das Geld genommen? Ich weiß es nicht, aber ich habe einen Verdacht.",en:"Who took the money? I don't know, but I have a suspicion."}] },
        { en:"the imagination", de:"die Fantasie", pl:"die Fantasien", hint:"feminine noun — also spelt Phantasie", examples:[{de:"Mein Sohn malt sehr gut. Er hat viel Fantasie.",en:"My son paints very well. He has a lot of imagination."}] },
        { en:"the secret", de:"das Geheimnis", pl:"die Geheimnisse", hint:"neuter noun", examples:[{de:"Das kann ich dir nicht sagen. Das ist ein Geheimnis.",en:"I cannot tell you that. It is a secret."}] },
        { en:"the decision", de:"die Entscheidung", pl:"die Entscheidungen", hint:"feminine noun — eine Entscheidung treffen", examples:[{de:"Diese wichtige Entscheidung möchte ich zuerst mit meinem Mann besprechen.",en:"I would like to discuss this important decision with my husband first."}] },
        { en:"the bright idea (sudden thought)", de:"der Einfall", pl:"die Einfälle", hint:"masculine noun — comes to you suddenly", examples:[{de:"Frag einfach meine Freundin. Sie hat immer gute Einfälle.",en:"Just ask my friend. She always has good ideas."}] },
        { en:"the wish", de:"der Wunsch", pl:"die Wünsche", hint:"masculine noun", examples:[{de:"Haben Sie sonst noch einen Wunsch?",en:"Do you have any other wish?"}] },

        // Ability and character
        { en:"the intelligence", de:"die Intelligenz", hint:"feminine noun — no plural", examples:[{de:"Meine Kinder haben in der Schule einen Intelligenztest gemacht.",en:"My children did an intelligence test at school."}] },
        { en:"the talent", de:"das Talent", pl:"die Talente", hint:"neuter noun — Talent für etwas", examples:[{de:"Sie hat großes Talent für Musik.",en:"She has great talent for music."}] },
        { en:"the ability (being able to do something)", de:"die Fähigkeit", pl:"die Fähigkeiten", hint:"feminine noun", examples:[{de:"In seiner Position braucht man die Fähigkeit, andere zu überzeugen.",en:"In his position you need the ability to convince others."}] },

        // Time as an idea, and what is real
        { en:"the past", de:"die Vergangenheit", hint:"feminine noun — no plural", examples:[{de:"In der Vergangenheit war das anders.",en:"In the past that was different."}] },
        { en:"the future", de:"die Zukunft", hint:"feminine noun — no plural", examples:[{de:"Du musst mehr für die Schule lernen. Denk an die Zukunft.",en:"You must study more for school. Think of the future."}] },
        { en:"the reality (the way things actually are)", de:"die Wirklichkeit", hint:"feminine noun — no plural", examples:[{de:"Das Buch beschreibt die Wirklichkeit um 1900 sehr gut.",en:"The book describes the reality around 1900 very well."}] },
        { en:"the reality (the facts you have to accept)", de:"die Realität", pl:"die Realitäten", hint:"feminine noun — the Latin-rooted twin of Wirklichkeit", examples:[{de:"Das gefällt dir nicht? Aber das ist die Realität.",en:"You do not like that? But that is reality."}] },
        { en:"the experience (a single thing you lived through)", de:"das Erlebnis", pl:"die Erlebnisse", hint:"neuter noun — one memorable occasion", examples:[{de:"Die Reise war ein tolles Erlebnis.",en:"The trip was a great experience."}] },
        { en:"the event (something that happens)", de:"das Ereignis", pl:"die Ereignisse", hint:"neuter noun — reported, often public", examples:[{de:"Alle Zeitungen haben über diese Ereignisse berichtet.",en:"All the newspapers reported on these events."}] },

        // Verbs that belong to this topic
        { en:"to be afraid of (with sich, + vor)", de:"fürchten", hint:"verb regular · fürchtete · hat gefürchtet", examples:[{de:"Sie fürchtet sich vor Schlangen.",en:"She is afraid of snakes."}] },
        { en:"to annoy / to wind up", de:"aufregen", hint:"verb separable · regte auf · hat aufgeregt", examples:[{de:"Es regt mich auf, dass ich schon wieder Überstunden machen muss.",en:"It annoys me that I have to work overtime again."}] },
        { en:"to calm down", de:"beruhigen", hint:"verb regular · beruhigte · hat beruhigt", examples:[{de:"Beruhigen Sie sich bitte. Es ist alles in Ordnung.",en:"Please calm down. Everything is fine."}] },
        { en:"to get a fright", de:"erschrecken", hint:"verb irregular · erschrak · ist erschrocken", examples:[{de:"Du hast richtig krank ausgesehen. Ich war ganz erschrocken.",en:"You looked really ill. I got quite a fright."}] },
        { en:"to suffer (from an illness, + an)", de:"leiden", hint:"verb irregular · litt · hat gelitten", examples:[{de:"Er leidet an einer schweren Krankheit.",en:"He suffers from a serious illness."}] },
      ]
    },

    // ── 4. BODY, HEALTH & MEDICINE ─────────────────────────────────
    {
      id: "b1_health", name: "Body, Health & Medicine", icon: "🏥",
      words: [

        // Parts of the body
        { en:"the chest", de:"die Brust", hint:"feminine noun", examples:[{de:"Ich habe Schmerzen in der Brust.",en:"I have pain in my chest."}] },
        { en:"the blood", de:"das Blut", hint:"neuter noun — no plural", examples:[{de:"Der Verletzte hat viel Blut verloren.",en:"The injured man lost a lot of blood."}] },
        { en:"the breath", de:"der Atem", hint:"masculine noun — no plural", examples:[{de:"Bitte den Atem anhalten.",en:"Please hold your breath."}] },
        { en:"the skin", de:"die Haut", hint:"feminine noun", examples:[{de:"Haben Sie eine Creme für trockene Haut?",en:"Do you have a cream for dry skin?"}] },
        { en:"the nerve", de:"der Nerv", pl:"die Nerven", hint:"masculine noun", examples:[{de:"Er leidet an einer Nervenkrankheit.",en:"He suffers from a nerve disease."}] },
        { en:"the muscle", de:"der Muskel", pl:"die Muskeln", hint:"masculine noun", examples:[{de:"Im Fitness-Studio trainieren wir unsere Muskeln.",en:"At the gym we train our muscles."}] },
        { en:"the bone", de:"der Knochen", pl:"die Knochen", hint:"masculine noun — plural unchanged", examples:[{de:"Ich bin hingefallen. Jetzt tun mir alle Knochen weh.",en:"I fell over. Now all my bones hurt."}] },
        { en:"the heart", de:"das Herz", pl:"die Herzen", hint:"neuter noun — irregular declension", examples:[{de:"Ich bin ganz nervös. Mir klopft das Herz.",en:"I am very nervous. My heart is pounding."}] },
        { en:"the lip", de:"die Lippe", pl:"die Lippen", hint:"feminine noun", examples:[{de:"Es ist sehr kalt. Meine Lippen sind ganz trocken.",en:"It is very cold. My lips are quite dry."}] },
        { en:"the shoulder", de:"die Schulter", pl:"die Schultern", hint:"feminine noun", examples:[{de:"Ich habe Schmerzen in der rechten Schulter.",en:"I have pain in my right shoulder."}] },
        { en:"the knee", de:"das Knie", pl:"die Knie", hint:"neuter noun — plural unchanged", examples:[{de:"Ich habe mich am Knie verletzt. Jetzt kann ich nicht laufen.",en:"I hurt my knee. Now I cannot walk."}] },
        { en:"the finger", de:"der Finger", pl:"die Finger", hint:"masculine noun — plural unchanged", examples:[{de:"Alessandro hat sich in den Finger geschnitten.",en:"Alessandro cut his finger."}] },
        { en:"the nose", de:"die Nase", pl:"die Nasen", hint:"feminine noun", examples:[{de:"Haben Sie Nasentropfen? Ich bin stark erkältet.",en:"Do you have nose drops? I have a bad cold."}] },
        { en:"the beard", de:"der Bart", pl:"die Bärte", hint:"masculine noun — umlaut plural", examples:[{de:"John trägt jetzt einen Bart.",en:"John now wears a beard."}] },
        { en:"the figure (shape of the body)", de:"die Figur", pl:"die Figuren", hint:"feminine noun", examples:[{de:"Lars hat eine gute Figur.",en:"Lars has a good figure."}] },
        { en:"the hairstyle", de:"die Frisur", pl:"die Frisuren", hint:"feminine noun", examples:[{de:"Du hast eine tolle Frisur! Warst du beim Friseur?",en:"You have a great hairstyle! Have you been to the hairdresser?"}] },

        // Injury and illness
        { en:"the wound", de:"die Wunde", pl:"die Wunden", hint:"feminine noun", examples:[{de:"Die Wunde müssen wir sofort verbinden.",en:"We have to bandage the wound immediately."}] },
        { en:"the injury", de:"die Verletzung", pl:"die Verletzungen", hint:"feminine noun — from verletzen", examples:[{de:"Keine Angst. Die Verletzung ist nicht so schlimm.",en:"Don't worry. The injury is not that bad."}] },
        { en:"the cold (the illness)", de:"die Erkältung", pl:"die Erkältungen", hint:"feminine noun — the whole illness", examples:[{de:"Du hast eine schlimme Erkältung!",en:"You have a bad cold!"}] },
        { en:"the runny nose / the sniffles", de:"der Schnupfen", hint:"masculine noun — just the blocked nose", examples:[{de:"Ich habe Schnupfen. Welches Medikament empfehlen Sie?",en:"I have a runny nose. Which medicine do you recommend?"}] },
        { en:"the infection", de:"die Infektion", pl:"die Infektionen", hint:"feminine noun", examples:[{de:"Sie haben eine Infektion. Sie müssen Tabletten nehmen.",en:"You have an infection. You have to take tablets."}] },
        { en:"the virus", de:"der Virus", pl:"die Viren", hint:"masculine noun — irregular plural", examples:[{de:"Ich habe mal wieder einen Virus auf meinem Computer.",en:"I've got a virus on my computer again."}] },
        { en:"the addiction", de:"die Sucht", pl:"die Süchte", hint:"feminine noun — umlaut plural", examples:[{de:"Die Sucht nach Medikamenten nimmt zu.",en:"Addiction to medication is increasing."}] },
        { en:"the recovery (get well soon)", de:"die Besserung", hint:"feminine noun — Gute Besserung!", examples:[{de:"Gute Besserung!",en:"Get well soon!"}] },

        // Treatment
        { en:"the examination (by a doctor)", de:"die Untersuchung", pl:"die Untersuchungen", hint:"feminine noun", examples:[{de:"Ich habe morgen eine Untersuchung im Krankenhaus.",en:"I have an examination at the hospital tomorrow."}] },
        { en:"the operation", de:"die Operation", pl:"die Operationen", hint:"feminine noun", examples:[{de:"Seit der Operation kann ich mein Knie nicht mehr bewegen.",en:"Since the operation I can no longer move my knee."}] },
        { en:"the therapy", de:"die Therapie", pl:"die Therapien", hint:"feminine noun", examples:[{de:"Die Therapie hat geholfen. Es geht mir schon viel besser.",en:"The therapy helped. I am already feeling much better."}] },
        { en:"the ointment", de:"die Salbe", pl:"die Salben", hint:"feminine noun — you rub it on", examples:[{de:"Diese Salbe gibt es nur auf Rezept.",en:"This ointment is only available on prescription."}] },
        { en:"the injection", de:"die Spritze", pl:"die Spritzen", hint:"feminine noun", examples:[{de:"Ich habe heute vom Arzt eine Spritze gegen die Schmerzen bekommen.",en:"Today the doctor gave me an injection for the pain."}] },
        { en:"the pill", de:"die Pille", pl:"die Pillen", hint:"feminine noun", examples:[{de:"Der Arzt hat mir neue Pillen verschrieben.",en:"The doctor prescribed me new pills."}] },
        { en:"the drops (liquid medicine)", de:"die Tropfen", hint:"plural noun only", examples:[{de:"Hast du die Tropfen schon genommen?",en:"Have you already taken the drops?"}] },
        { en:"the plaster (for a cut)", de:"das Pflaster", pl:"die Pflaster", hint:"neuter noun — plural unchanged", examples:[{de:"Hast du ein Pflaster? Ich habe mich geschnitten.",en:"Do you have a plaster? I have cut myself."}] },
        { en:"the painkiller", de:"das Schmerzmittel", pl:"die Schmerzmittel", hint:"neuter noun — plural unchanged", examples:[{de:"Sie haben Zahnschmerzen? Ich verschreibe Ihnen ein Schmerzmittel.",en:"You have toothache? I'll prescribe you a painkiller."}] },
        { en:"the medicine (the substance you take)", de:"die Medizin", hint:"feminine noun — no plural", examples:[{de:"Du musst noch deine Medizin nehmen.",en:"You still have to take your medicine."}] },
        { en:"the vitamin", de:"das Vitamin", pl:"die Vitamine", hint:"neuter noun", examples:[{de:"Der Arzt sagt, ich soll viele Vitamine essen.",en:"The doctor says I should eat plenty of vitamins."}] },

        // Where you go and who treats you
        { en:"the clinic", de:"die Klinik", pl:"die Kliniken", hint:"feminine noun", examples:[{de:"Ich muss in die Klinik, um meinen kranken Onkel zu besuchen.",en:"I have to go to the clinic to visit my sick uncle."}] },
        { en:"the emergency department", de:"die Notaufnahme", pl:"die Notaufnahmen", hint:"feminine noun", examples:[{de:"Die Notaufnahme ist gleich hier links.",en:"The emergency department is just here on the left."}] },
        { en:"the ambulance", de:"der Krankenwagen", pl:"die Krankenwagen", hint:"masculine noun — plural unchanged", examples:[{de:"Wir mussten einen Krankenwagen rufen.",en:"We had to call an ambulance."}] },
        { en:"the emergency call", de:"der Notruf", hint:"masculine noun", examples:[{de:"Der Notruf hat die Nummer 110.",en:"The emergency number is 110."}] },
        { en:"the health insurance card", de:"die Versichertenkarte", pl:"die Versichertenkarten", hint:"feminine noun", examples:[{de:"Haben Sie Ihre Versichertenkarte dabei?",en:"Do you have your health insurance card with you?"}] },
        { en:"the patient", de:"der Patient", pl:"die Patienten", hint:"masculine noun — n-declension", examples:[{de:"Ich bin Patient bei Dr. Hausner. Ich möchte bitte einen Termin.",en:"I am a patient of Dr Hausner. I would like an appointment, please."}] },
        { en:"the carer / the nurse", de:"der Pfleger", pl:"die Pfleger", hint:"masculine noun — plural unchanged", examples:[{de:"Mein Freund ist Pfleger in einem Altersheim.",en:"My friend is a carer in a retirement home."}] },
        { en:"the smoker", de:"der Raucher", pl:"die Raucher", hint:"masculine noun — plural unchanged", examples:[{de:"Gibt es hier ein Zimmer für Raucher?",en:"Is there a room for smokers here?"}] },
        { en:"the non-smoker", de:"der Nichtraucher", pl:"die Nichtraucher", hint:"masculine noun — plural unchanged", examples:[{de:"In unserer Familie sind alle Nichtraucher.",en:"In our family everyone is a non-smoker."}] },

        // Eating for health
        { en:"the diet (slimming plan)", de:"die Diät", hint:"feminine noun — eine Diät machen", examples:[{de:"Ich möchte abnehmen. Deshalb mache ich eine Diät.",en:"I want to lose weight. That is why I am on a diet."}] },
        { en:"the nutrition (the way you eat)", de:"die Ernährung", hint:"feminine noun — no plural", examples:[{de:"Ich finde eine gesunde Ernährung wichtig.",en:"I think healthy nutrition is important."}] },

        // Verbs that belong to this topic
        { en:"to treat (a patient)", de:"behandeln", hint:"verb regular · behandelte · hat behandelt", examples:[{de:"Welcher Arzt hat Sie bis jetzt behandelt?",en:"Which doctor has treated you until now?"}] },
        { en:"to operate on", de:"operieren", hint:"verb regular · operierte · hat operiert", examples:[{de:"Wir müssen das Knie sofort operieren.",en:"We have to operate on the knee immediately."}] },
        { en:"to care for (look after a sick person)", de:"pflegen", hint:"verb regular · pflegte · hat gepflegt", examples:[{de:"Meine Mutter ist sehr krank. Ich muss sie pflegen.",en:"My mother is very ill. I have to care for her."}] },
        { en:"to breathe", de:"atmen", hint:"verb regular · atmete · hat geatmet", examples:[{de:"Er hat eine Erkältung und kann nicht durch die Nase atmen.",en:"He has a cold and cannot breathe through his nose."}] },
        { en:"to bleed", de:"bluten", hint:"verb regular · blutete · hat geblutet", examples:[{de:"Ich habe mich verletzt. Meine Hand blutet.",en:"I have hurt myself. My hand is bleeding."}] },
        { en:"to sweat", de:"schwitzen", hint:"verb regular · schwitzte · hat geschwitzt", examples:[{de:"Es war sehr heiß. Wir haben alle sehr geschwitzt.",en:"It was very hot. We all sweated a lot."}] },
      ]
    },

    // ── 5. HOUSING & LIVING ────────────────────────────────────────
    {
      id: "b1_housing", name: "Housing & Living", icon: "🏡",
      words: [

        // The building
        { en:"the building", de:"das Gebäude", pl:"die Gebäude", hint:"neuter noun — plural unchanged", examples:[{de:"In diesem Gebäude sind nur Büros.",en:"There are only offices in this building."}] },
        { en:"the roof", de:"das Dach", pl:"die Dächer", hint:"neuter noun — umlaut plural", examples:[{de:"Wir müssen das Dach reparieren lassen.",en:"We have to have the roof repaired."}] },
        { en:"the ceiling", de:"die Decke", pl:"die Decken", hint:"feminine noun — also means blanket", examples:[{de:"Im Wohnzimmer haben wir keine Lampe an der Decke.",en:"In the living room we have no lamp on the ceiling."}] },
        { en:"the wall (outside, of stone)", de:"die Mauer", pl:"die Mauern", hint:"feminine noun — free-standing, not a room wall", examples:[{de:"Die Kinder sind über die Mauer geklettert.",en:"The children climbed over the wall."}] },
        { en:"the floor / the storey", de:"die Etage", pl:"die Etagen", hint:"feminine noun — level of a building", examples:[{de:"Das Büro ist in der dritten Etage.",en:"The office is on the third floor."}] },
        { en:"the hallway (inside a flat or office)", de:"der Flur", pl:"die Flure", hint:"masculine noun", examples:[{de:"Wir warten draußen im Flur.",en:"We are waiting outside in the hallway."}] },
        { en:"the stairwell (shared, in a block)", de:"das Treppenhaus", pl:"die Treppenhäuser", hint:"neuter noun — umlaut plural", examples:[{de:"Im Treppenhaus ist kein Licht.",en:"There is no light in the stairwell."}] },
        { en:"the terrace", de:"die Terrasse", pl:"die Terrassen", hint:"feminine noun", examples:[{de:"Setzen wir uns auf die Terrasse!",en:"Let's sit on the terrace!"}] },
        { en:"the courtyard", de:"der Hof", pl:"die Höfe", hint:"masculine noun — umlaut plural", examples:[{de:"Die Kinder spielen am liebsten im Hof.",en:"The children like playing in the courtyard best."}] },
        { en:"the plot of land", de:"das Grundstück", pl:"die Grundstücke", hint:"neuter noun", examples:[{de:"Wir wollen ein Haus bauen und suchen ein günstiges Grundstück.",en:"We want to build a house and are looking for an affordable plot."}] },
        { en:"the hole", de:"das Loch", pl:"die Löcher", hint:"neuter noun — umlaut plural", examples:[{de:"Ich habe ein Loch im Zahn. Ich muss zum Zahnarzt.",en:"I have a hole in my tooth. I have to go to the dentist."}] },

        // Where you live
        { en:"the tenant", de:"der Mieter", pl:"die Mieter", hint:"masculine noun — plural unchanged", examples:[{de:"Sie hat heute neue Mieter für die Wohnung gefunden.",en:"She found new tenants for the flat today."}] },
        { en:"the caretaker", de:"der Hausmeister", pl:"die Hausmeister", hint:"masculine noun — plural unchanged", examples:[{de:"Der Hausmeister hat mir geholfen, den Schrank in die Wohnung zu tragen.",en:"The caretaker helped me carry the wardrobe into the flat."}] },
        { en:"the home (the place you feel at home)", de:"das Zuhause", hint:"neuter noun — no plural", examples:[{de:"Ich fühle mich hier wohl. Das ist mein Zuhause.",en:"I feel comfortable here. This is my home."}] },
        { en:"the home (an institution — for the elderly, for children)", de:"das Heim", pl:"die Heime", hint:"neuter noun — Seniorenheim, Kinderheim", examples:[{de:"Meine Oma wohnt in einem Seniorenheim.",en:"My grandma lives in a retirement home."}] },
        { en:"the place of residence (which town you live in)", de:"der Wohnort", pl:"die Wohnorte", hint:"masculine noun — the town itself", examples:[{de:"Tragen Sie bitte auch Ihren Wohnort ein.",en:"Please also enter your place of residence."}] },
        { en:"the registered address (official, on documents)", de:"der Wohnsitz", pl:"die Wohnsitze", hint:"masculine noun — the legal term", examples:[{de:"Er hat einen festen Wohnsitz in dieser Stadt.",en:"He has a permanent address in this city."}] },
        { en:"the suburb", de:"der Vorort", pl:"die Vororte", hint:"masculine noun", examples:[{de:"Mein Bruder wohnt in einem Vorort von Hamburg.",en:"My brother lives in a suburb of Hamburg."}] },
        { en:"the surrounding area", de:"die Umgebung", pl:"die Umgebungen", hint:"feminine noun", examples:[{de:"In der Umgebung von Berlin kann man schöne Ausflüge machen.",en:"You can take lovely trips in the area around Berlin."}] },
        { en:"the location (where a property sits)", de:"die Lage", hint:"feminine noun — zentrale Lage", examples:[{de:"Wir suchen eine Wohnung in zentraler Lage.",en:"We are looking for a flat in a central location."}] },
        { en:"the view (what you can see from a window)", de:"die Aussicht", pl:"die Aussichten", hint:"feminine noun", examples:[{de:"Von diesem Turm hat man eine tolle Aussicht.",en:"From this tower you have a great view."}] },
        { en:"the furnishings (how a home is fitted out)", de:"die Einrichtung", pl:"die Einrichtungen", hint:"feminine noun — from einrichten", examples:[{de:"Deine Wohnung ist sehr gemütlich, die Einrichtung gefällt mir sehr gut.",en:"Your flat is very cosy, I really like the furnishings."}] },

        // Things in the home
        { en:"the shelf", de:"das Regal", pl:"die Regale", hint:"neuter noun", examples:[{de:"Das Buch steht im Regal oben rechts.",en:"The book is on the shelf at the top right."}] },
        { en:"the cushion / the pillow", de:"das Kissen", pl:"die Kissen", hint:"neuter noun — plural unchanged", examples:[{de:"Ohne Kopfkissen kann ich nicht schlafen.",en:"I cannot sleep without a pillow."}] },
        { en:"the carpet / the rug", de:"der Teppich", pl:"die Teppiche", hint:"masculine noun", examples:[{de:"Ich habe mir einen neuen Teppich gekauft.",en:"I bought myself a new carpet."}] },
        { en:"the couch", de:"die Couch", pl:"die Couchs", hint:"feminine noun — English loanword", examples:[{de:"Wir haben uns eine Couch und neue Sessel gekauft.",en:"We bought ourselves a couch and new armchairs."}] },
        { en:"the vase", de:"die Vase", pl:"die Vasen", hint:"feminine noun", examples:[{de:"Hast du eine Vase für die Blumen?",en:"Do you have a vase for the flowers?"}] },
        { en:"the candle", de:"die Kerze", pl:"die Kerzen", hint:"feminine noun", examples:[{de:"Für den Geburtstagstisch brauchen wir viele Blumen und Kerzen.",en:"For the birthday table we need lots of flowers and candles."}] },
        { en:"the mirror", de:"der Spiegel", pl:"die Spiegel", hint:"masculine noun — plural unchanged", examples:[{de:"Ich möchte gerne sehen, wie mein Kleid sitzt. Hast du einen Spiegel?",en:"I would like to see how my dress fits. Do you have a mirror?"}] },
        { en:"the bathtub", de:"die Badewanne", pl:"die Badewannen", hint:"feminine noun", examples:[{de:"Nach einem langen Arbeitstag setzte sie sich in die Badewanne.",en:"After a long day at work she got into the bathtub."}] },
        { en:"the wardrobe / the cloakroom", de:"die Garderobe", pl:"die Garderoben", hint:"feminine noun — where coats are left", examples:[{de:"Die Mäntel bitte an der Garderobe abgeben.",en:"Please leave your coats at the cloakroom."}] },
        { en:"the crate / the box (sturdy, for bottles)", de:"der Kasten", pl:"die Kästen", hint:"masculine noun — umlaut plural", examples:[{de:"Ich habe zwei Kästen Bier gekauft.",en:"I bought two crates of beer."}] },
        { en:"the bowl", de:"die Schüssel", pl:"die Schüsseln", hint:"feminine noun", examples:[{de:"Gibst du mir bitte eine Schüssel für den Salat?",en:"Would you give me a bowl for the salad, please?"}] },

        // Power, sockets and services
        { en:"the socket (in the wall)", de:"die Steckdose", pl:"die Steckdosen", hint:"feminine noun — the wall side", examples:[{de:"Es gibt drei Steckdosen in diesem Zimmer.",en:"There are three sockets in this room."}] },
        { en:"the plug (on the cable)", de:"der Stecker", pl:"die Stecker", hint:"masculine noun — the cable side", examples:[{de:"Der Stecker passt nicht in diese Steckdose.",en:"The plug does not fit into this socket."}] },
        { en:"the cable", de:"das Kabel", pl:"die Kabel", hint:"neuter noun — plural unchanged", examples:[{de:"Wo ist das Kabel für das Aufnahmegerät?",en:"Where is the cable for the recording device?"}] },
        { en:"the electricity", de:"der Strom", hint:"masculine noun — no plural", examples:[{de:"Wie kann ich im Haushalt Strom sparen?",en:"How can I save electricity in the household?"}] },
        { en:"the gas", de:"das Gas", hint:"neuter noun", examples:[{de:"Wir kochen mit Gas.",en:"We cook with gas."}] },
        { en:"the air conditioning", de:"die Klimaanlage", pl:"die Klimaanlagen", hint:"feminine noun", examples:[{de:"Im Sommer brauchen wir eine Klimaanlage.",en:"In summer we need air conditioning."}] },
        { en:"the doorbell", de:"die Klingel", pl:"die Klingeln", hint:"feminine noun", examples:[{de:"Drück bitte auf die Klingel!",en:"Please press the doorbell!"}] },
        { en:"the letterbox", de:"der Briefkasten", pl:"die Briefkästen", hint:"masculine noun — umlaut plural", examples:[{de:"Ist hier in der Nähe ein Briefkasten?",en:"Is there a letterbox nearby?"}] },
        { en:"the noise (loud and unwanted)", de:"der Lärm", hint:"masculine noun — no plural", examples:[{de:"Die Flugzeuge machen einen schrecklichen Lärm.",en:"The planes make a terrible noise."}] },
        { en:"the disturbance (interrupting someone)", de:"die Störung", pl:"die Störungen", hint:"feminine noun — from stören", examples:[{de:"Entschuldigen Sie bitte die Störung.",en:"Please excuse the disturbance."}] },
        { en:"the rubbish collection", de:"die Müllabfuhr", hint:"feminine noun — the service", examples:[{de:"Die Müllabfuhr kommt zweimal pro Woche.",en:"The rubbish collection comes twice a week."}] },
        { en:"the wheelie bin", de:"die Mülltonne", pl:"die Mülltonnen", hint:"feminine noun — the large outdoor bin", examples:[{de:"Die Mülltonne ist voll.",en:"The wheelie bin is full."}] },
        { en:"the waste (what you throw away)", de:"der Abfall", pl:"die Abfälle", hint:"masculine noun — umlaut plural", examples:[{de:"Werfen Sie den Bioabfall bitte nicht zum normalen Müll.",en:"Please do not throw the organic waste in with the normal rubbish."}] },
        { en:"the wastepaper basket", de:"der Abfalleimer", pl:"die Abfalleimer", hint:"masculine noun — the small indoor bin", examples:[{de:"Wirf das bitte in den Abfalleimer!",en:"Please throw that in the wastepaper basket!"}] },

        // Building materials
        { en:"the wood", de:"das Holz", hint:"neuter noun", examples:[{de:"Möchten Sie ein Regal aus Holz oder aus Metall?",en:"Would you like a shelf made of wood or of metal?"}] },
        { en:"the leather", de:"das Leder", hint:"neuter noun — no plural", examples:[{de:"Ist die Tasche aus Leder?",en:"Is the bag made of leather?"}] },
        { en:"the wool", de:"die Wolle", hint:"feminine noun — no plural", examples:[{de:"Dieser Pullover ist aus reiner Wolle.",en:"This pullover is made of pure wool."}] },
      ]
    },

    // ── 6. HOUSEHOLD, TOOLS & REPAIRS ──────────────────────────────
    {
      id: "b1_household", name: "Household, Tools & Repairs", icon: "🔧",
      words: [

        // Tools
        { en:"the tool", de:"das Werkzeug", pl:"die Werkzeuge", hint:"neuter noun", examples:[{de:"Wir hatten kein Werkzeug für die Reparatur dabei.",en:"We had no tool with us for the repair."}] },
        { en:"the hammer", de:"der Hammer", pl:"die Hämmer", hint:"masculine noun — umlaut plural", examples:[{de:"Ich möchte ein Bild aufhängen. Hast du einen Hammer für mich?",en:"I want to hang up a picture. Do you have a hammer for me?"}] },
        { en:"the nail (for the wall)", de:"der Nagel", pl:"die Nägel", hint:"masculine noun — umlaut plural", examples:[{de:"Kannst du mir den Nagel in die Wand schlagen?",en:"Can you knock the nail into the wall for me?"}] },
        { en:"the pliers", de:"die Zange", pl:"die Zangen", hint:"feminine noun — singular in German", examples:[{de:"Um das Fahrrad zu reparieren, brauchst du eine Zange.",en:"To repair the bicycle you need pliers."}] },
        { en:"the needle", de:"die Nadel", pl:"die Nadeln", hint:"feminine noun", examples:[{de:"Hast du eine Nadel für mich? Ich muss einen Knopf annähen.",en:"Do you have a needle for me? I have to sew on a button."}] },
        { en:"the brush (stiff, for scrubbing)", de:"die Bürste", pl:"die Bürsten", hint:"feminine noun — not a paintbrush", examples:[{de:"Hast du eine Bürste? Meine Schuhe sind so schmutzig.",en:"Do you have a brush? My shoes are so dirty."}] },
        { en:"the button (on clothing)", de:"der Knopf", pl:"die Knöpfe", hint:"masculine noun — umlaut plural", examples:[{de:"An meiner Jacke fehlt ein Knopf.",en:"A button is missing from my jacket."}] },

        // Dirt, damage and repair
        { en:"the dirt (on clothes or shoes)", de:"der Schmutz", hint:"masculine noun — no plural", examples:[{de:"Du hast Schmutz an deinen Schuhen.",en:"You have dirt on your shoes."}] },
        { en:"the muck (dirt, more colloquial)", de:"der Dreck", hint:"masculine noun — stronger, spoken", examples:[{de:"Iss den Apfel nicht! Der lag im Dreck.",en:"Do not eat the apple! It was lying in the muck."}] },
        { en:"the dust", de:"der Staub", hint:"masculine noun — no plural", examples:[{de:"Ich habe überall Staub gewischt.",en:"I dusted everywhere."}] },
        { en:"the stain", de:"der Fleck", pl:"die Flecken", hint:"masculine noun", examples:[{de:"Du hast einen Fleck auf der Bluse.",en:"You have a stain on your blouse."}] },
        { en:"the damage", de:"der Schaden", pl:"die Schäden", hint:"masculine noun — umlaut plural", examples:[{de:"Ich hatte einen Unfall mit dem Auto. Jetzt muss ich den Schaden der Versicherung melden.",en:"I had an accident with the car. Now I have to report the damage to the insurance company."}] },
        { en:"the repair", de:"die Reparatur", pl:"die Reparaturen", hint:"feminine noun", examples:[{de:"Eine Reparatur wäre zu teuer.",en:"A repair would be too expensive."}] },
        { en:"the breakdown (of a car)", de:"die Panne", pl:"die Pannen", hint:"feminine noun — the car stops working", examples:[{de:"Kurz vor München hatten wir eine Panne mit dem Auto.",en:"Shortly before Munich we had a breakdown with the car."}] },
        { en:"the replacement", de:"der Ersatz", hint:"masculine noun — no plural", examples:[{de:"Sie bekommen von unserer Firma einen Ersatz für das kaputte Gerät.",en:"You will receive a replacement from our company for the broken device."}] },
        { en:"the guarantee", de:"die Garantie", hint:"feminine noun", examples:[{de:"Auf die Waschmaschine haben Sie ein Jahr Garantie.",en:"You have a one-year guarantee on the washing machine."}] },

        // Instructions
        { en:"the operating instructions (for a device)", de:"die Bedienungsanleitung", pl:"die Bedienungsanleitungen", hint:"feminine noun — how to operate it", examples:[{de:"Die Bedienungsanleitung verstehe ich nicht.",en:"I do not understand the operating instructions."}] },
        { en:"the directions for use (on a product)", de:"die Gebrauchsanweisung", pl:"die Gebrauchsanweisungen", hint:"feminine noun — how to use it safely", examples:[{de:"Lesen Sie bitte zuerst die Gebrauchsanweisung.",en:"Please read the directions for use first."}] },
        { en:"the instructions (general, e.g. for a game)", de:"die Anleitung", pl:"die Anleitungen", hint:"feminine noun — the plain word", examples:[{de:"In der Anleitung steht, dass bei diesem Spiel der Älteste beginnt.",en:"The instructions say that in this game the oldest player begins."}] },

        // Devices
        { en:"the battery", de:"die Batterie", pl:"die Batterien", hint:"feminine noun", examples:[{de:"Bringst du bitte Batterien für die Kamera mit?",en:"Would you bring batteries for the camera, please?"}] },
        { en:"the loudspeaker", de:"der Lautsprecher", pl:"die Lautsprecher", hint:"masculine noun — plural unchanged", examples:[{de:"Bitte achten Sie auch auf die Lautsprecher-Ansagen am Bahnhof.",en:"Please also pay attention to the loudspeaker announcements at the station."}] },
        { en:"the remote control", de:"die Fernbedienung", pl:"die Fernbedienungen", hint:"feminine noun", examples:[{de:"Hast du die Fernbedienung gesehen?",en:"Have you seen the remote control?"}] },
        { en:"the alarm clock", de:"der Wecker", pl:"die Wecker", hint:"masculine noun — plural unchanged", examples:[{de:"Hast du den Wecker schon gestellt?",en:"Have you already set the alarm clock?"}] },
        { en:"the lighter", de:"das Feuerzeug", pl:"die Feuerzeuge", hint:"neuter noun", examples:[{de:"Ist das Feuerzeug neu?",en:"Is the lighter new?"}] },
        { en:"the match (for lighting a fire)", de:"das Streichholz", pl:"die Streichhölzer", hint:"neuter noun — umlaut plural", examples:[{de:"Ich hätte gern eine Schachtel Streichhölzer.",en:"I would like a box of matches."}] },
        { en:"the barbecue", de:"der Grill", hint:"masculine noun", examples:[{de:"Kannst du mir deinen Grill leihen? Wir wollen am Wochenende ein Picknick machen.",en:"Can you lend me your barbecue? We want to have a picnic at the weekend."}] },
        { en:"the detergent", de:"das Waschmittel", pl:"die Waschmittel", hint:"neuter noun — plural unchanged", examples:[{de:"Diese Bluse darfst du nicht mit jedem Waschmittel waschen.",en:"You must not wash this blouse with just any detergent."}] },
        { en:"the toothbrush", de:"die Zahnbürste", pl:"die Zahnbürsten", hint:"feminine noun", examples:[{de:"Ich brauche eine neue Zahnbürste.",en:"I need a new toothbrush."}] },
        { en:"the toothpaste", de:"die Zahncreme", pl:"die Zahncremes", hint:"feminine noun — also die Zahnpasta", examples:[{de:"Die neue Zahncreme riecht sehr gut.",en:"The new toothpaste smells very good."}] },

        // Containers and packaging
        { en:"the frying pan", de:"die Pfanne", pl:"die Pfannen", hint:"feminine noun", examples:[{de:"Hast du keine größere Pfanne?",en:"Don't you have a bigger frying pan?"}] },
        { en:"the tin / the can", de:"die Dose", pl:"die Dosen", hint:"feminine noun — sealed food tin", examples:[{de:"Ich habe noch eine Dose Bohnen.",en:"I still have a tin of beans."}] },
        { en:"the pot (for tea or coffee)", de:"die Kanne", pl:"die Kannen", hint:"feminine noun — you pour from it", examples:[{de:"Das ist aber eine schöne Teekanne.",en:"That really is a lovely teapot."}] },
        { en:"the box (small cardboard packet)", de:"die Schachtel", pl:"die Schachteln", hint:"feminine noun — of cigarettes, of matches", examples:[{de:"Ich hätte gern eine Schachtel Zigaretten.",en:"I would like a packet of cigarettes."}] },
        { en:"the carrier bag (plastic or paper)", de:"die Tüte", pl:"die Tüten", hint:"feminine noun — from a shop", examples:[{de:"Brauchen Sie eine Tüte für den Salat?",en:"Do you need a bag for the salad?"}] },
        { en:"the sack", de:"der Sack", pl:"die Säcke", hint:"masculine noun — umlaut plural", examples:[{de:"Ich hätte gern einen Sack Kartoffeln.",en:"I would like a sack of potatoes."}] },
        { en:"the cloth", de:"das Tuch", pl:"die Tücher", hint:"neuter noun — umlaut plural", examples:[{de:"Wo hast du dieses schöne Tuch gekauft?",en:"Where did you buy this lovely cloth?"}] },
        { en:"the handkerchief / the tissue", de:"das Taschentuch", pl:"die Taschentücher", hint:"neuter noun — umlaut plural", examples:[{de:"Hast du ein Taschentuch für mich?",en:"Do you have a tissue for me?"}] },
        { en:"the slice", de:"die Scheibe", pl:"die Scheiben", hint:"feminine noun — of bread, cheese, sausage", examples:[{de:"Fünf Scheiben Käse, bitte.",en:"Five slices of cheese, please."}] },

        // Materials
        { en:"the plastic (everyday word)", de:"das Plastik", hint:"neuter noun — no plural", examples:[{de:"Was für ein Spielzeug möchten Sie? Aus Plastik oder aus Holz?",en:"What kind of toy would you like? Made of plastic or of wood?"}] },
        { en:"the synthetic material (technical word)", de:"der Kunststoff", pl:"die Kunststoffe", hint:"masculine noun — the formal term for plastic", examples:[{de:"Der Stuhl ist aus Kunststoff.",en:"The chair is made of synthetic material."}] },
        { en:"the metal", de:"das Metall", pl:"die Metalle", hint:"neuter noun", examples:[{de:"Dieser Tisch hier ist ganz aus Metall.",en:"This table here is made entirely of metal."}] },
        { en:"the fabric (cloth a garment is made of)", de:"der Stoff", pl:"die Stoffe", hint:"masculine noun — wool, cotton, silk", examples:[{de:"Was für ein Stoff ist das? – Wolle.",en:"What kind of fabric is that? – Wool."}] },
        { en:"the material (what an object is made of)", de:"das Material", hint:"neuter noun — the general word", examples:[{de:"Aus welchem Material ist der Schrank? – Aus Holz.",en:"What material is the cupboard made of? – Of wood."}] },

        // Verbs that belong to this topic
        { en:"to wash up (do the dishes)", de:"spülen", hint:"verb regular · spülte · hat gespült", examples:[{de:"Hast du das Geschirr gespült?",en:"Have you washed up the dishes?"}] },
        { en:"to stick / to glue", de:"kleben", hint:"verb regular · klebte · hat geklebt", examples:[{de:"Die Briefmarke klebt nicht mehr.",en:"The stamp does not stick any more."}] },
      ]
    },

    // ── 7. FOOD, DRINK & EATING OUT ────────────────────────────────
    {
      id: "b1_food", name: "Food, Drink & Eating Out", icon: "🍽️",
      words: [

        // Ingredients
        { en:"the flour", de:"das Mehl", hint:"neuter noun — no plural", examples:[{de:"Ich möchte einen Kuchen backen. Ist noch genug Mehl da?",en:"I want to bake a cake. Is there still enough flour?"}] },
        { en:"the vinegar", de:"der Essig", hint:"masculine noun — no plural", examples:[{de:"Am Salat fehlt noch etwas Essig.",en:"The salad still needs a little vinegar."}] },
        { en:"the pepper (the spice)", de:"der Pfeffer", hint:"masculine noun — no plural", examples:[{de:"Bringen Sie uns bitte Pfeffer und Salz.",en:"Please bring us pepper and salt."}] },
        { en:"the spice", de:"das Gewürz", pl:"die Gewürze", hint:"neuter noun", examples:[{de:"Von den scharfen Gewürzen bekommt man Durst.",en:"The hot spices make you thirsty."}] },
        { en:"the margarine", de:"die Margarine", hint:"feminine noun — no plural", examples:[{de:"Meine Frau isst nur Margarine und keine Butter.",en:"My wife eats only margarine and no butter."}] },
        { en:"the honey", de:"der Honig", hint:"masculine noun — no plural", examples:[{de:"Ich esse gern Brötchen mit Honig und Butter zum Frühstück.",en:"I like eating rolls with honey and butter for breakfast."}] },
        { en:"the sauce / the gravy", de:"die Soße", pl:"die Soßen", hint:"feminine noun — also spelt Sauce", examples:[{de:"Gibst du mir bitte mal die Soße?",en:"Would you pass me the sauce, please?"}] },
        { en:"the ingredients", de:"die Zutaten", hint:"plural noun only", examples:[{de:"Welche Zutaten braucht man für diesen Kuchen?",en:"Which ingredients do you need for this cake?"}] },
        { en:"the liquid", de:"die Flüssigkeit", pl:"die Flüssigkeiten", hint:"feminine noun", examples:[{de:"Dieses Medikament mit viel Flüssigkeit einnehmen.",en:"Take this medicine with plenty of liquid."}] },
        { en:"the foodstuff", de:"das Nahrungsmittel", pl:"die Nahrungsmittel", hint:"neuter noun — plural unchanged", examples:[{de:"In diesen Ländern fehlen vor allem Nahrungsmittel.",en:"In these countries foodstuffs above all are lacking."}] },

        // Fruit and vegetables
        { en:"the carrot (the Latin-rooted word)", de:"die Karotte", pl:"die Karotten", hint:"feminine noun — synonym of Möhre", examples:[{de:"Hasen fressen gern Karotten.",en:"Rabbits like eating carrots."}] },
        { en:"the carrot (the native German word)", de:"die Möhre", pl:"die Möhren", hint:"feminine noun — synonym of Karotte", examples:[{de:"Hasen fressen gern Möhren.",en:"Rabbits like eating carrots."}] },
        { en:"the plum", de:"die Pflaume", pl:"die Pflaumen", hint:"feminine noun", examples:[{de:"Ich esse gern Pflaumen und noch lieber Pflaumenkuchen.",en:"I like eating plums, and plum cake even more."}] },
        { en:"the mushroom", de:"der Pilz", pl:"die Pilze", hint:"masculine noun", examples:[{de:"Haben Sie frische Pilze?",en:"Do you have fresh mushrooms?"}] },
        { en:"the fruit (a single piece, botanically)", de:"die Frucht", pl:"die Früchte", hint:"feminine noun — countable, unlike das Obst", examples:[{de:"Welche Früchte kann man essen?",en:"Which fruits can you eat?"}] },

        // Dishes
        { en:"the noodle / the pasta", de:"die Nudel", pl:"die Nudeln", hint:"feminine noun — usually plural", examples:[{de:"Möchten Sie Nudeln oder Reis? – Lieber Nudeln.",en:"Would you like pasta or rice? – Pasta, preferably."}] },
        { en:"the dumpling", de:"der Kloß", pl:"die Klöße", hint:"masculine noun — umlaut plural", examples:[{de:"Möchten Sie zum Fleisch Kartoffeln oder Klöße?",en:"Would you like potatoes or dumplings with the meat?"}] },
        { en:"the schnitzel", de:"das Schnitzel", pl:"die Schnitzel", hint:"neuter noun — plural unchanged", examples:[{de:"Bitte ein Schnitzel mit Kartoffeln und Salat.",en:"A schnitzel with potatoes and salad, please."}] },
        { en:"the chips / the fries", de:"die Pommes", hint:"plural noun — short for Pommes frites", examples:[{de:"Die Kinder essen gern Würstchen mit Pommes frites.",en:"The children like eating sausages with chips."}] },
        { en:"the pastries / the baked goods", de:"das Gebäck", hint:"neuter noun — no plural", examples:[{de:"Das Gebäck ist ganz frisch.",en:"The pastries are quite fresh."}] },
        { en:"the dessert", de:"das Dessert", pl:"die Desserts", hint:"neuter noun", examples:[{de:"Nach dem Essen gab es noch ein Dessert.",en:"After the meal there was also a dessert."}] },
        { en:"the muesli", de:"das Müsli", pl:"die Müslis", hint:"neuter noun", examples:[{de:"Zum Frühstück gibt es Müsli mit Obst.",en:"For breakfast there is muesli with fruit."}] },
        { en:"the lemonade", de:"die Limonade", pl:"die Limonaden", hint:"feminine noun", examples:[{de:"Die Limonade ist sehr süß.",en:"The lemonade is very sweet."}] },
        { en:"the cocoa / the hot chocolate", de:"der Kakao", pl:"die Kakaos", hint:"masculine noun", examples:[{de:"Zum Frühstück trinke ich immer einen Kakao.",en:"For breakfast I always drink a hot chocolate."}] },

        // Meals and eating out
        { en:"the meal (one of the day's eating occasions)", de:"die Mahlzeit", pl:"die Mahlzeiten", hint:"feminine noun — breakfast, lunch, dinner", examples:[{de:"Die Tropfen bitte immer nach den Mahlzeiten einnehmen.",en:"Please always take the drops after meals."}] },
        { en:"the set menu (a fixed combination)", de:"das Menü", pl:"die Menüs", hint:"neuter noun — not the list of dishes", examples:[{de:"Nimm doch das Menü, das sieht gut aus.",en:"Why not take the set menu, it looks good."}] },
        { en:"the buffet", de:"das Buffet", pl:"die Buffets", hint:"neuter noun", examples:[{de:"Das Buffet ist eröffnet!",en:"The buffet is open!"}] },
        { en:"the snack", de:"der Imbiss", pl:"die Imbisse", hint:"masculine noun — also a snack bar", examples:[{de:"Es ist Zeit für einen kleinen Imbiss.",en:"It is time for a small snack."}] },
        { en:"the picnic", de:"das Picknick", pl:"die Picknicks", hint:"neuter noun", examples:[{de:"Am Sonntag machen wir ein Picknick.",en:"On Sunday we are having a picnic."}] },
        { en:"the restaurant (plain, traditional)", de:"die Gaststätte", pl:"die Gaststätten", hint:"feminine noun — a simple eating house", examples:[{de:"Ich arbeite seit einem Monat in einer Gaststätte.",en:"I have been working in a restaurant for a month."}] },
        { en:"the pub", de:"die Kneipe", pl:"die Kneipen", hint:"feminine noun — you go there to drink", examples:[{de:"Gehen wir noch in eine Kneipe ein Bier trinken?",en:"Shall we go to a pub for a beer?"}] },
        { en:"the staff canteen (at a workplace)", de:"die Kantine", pl:"die Kantinen", hint:"feminine noun — in a firm", examples:[{de:"In unserer Kantine kann man günstig essen.",en:"You can eat cheaply in our canteen."}] },
        { en:"the student canteen (at a university)", de:"die Mensa", pl:"die Mensen", hint:"feminine noun — only at a university", examples:[{de:"Ich esse fast jeden Tag in der Mensa.",en:"I eat in the student canteen almost every day."}] },
        { en:"the dining car (on a train)", de:"der Speisewagen", pl:"die Speisewagen", hint:"masculine noun — plural unchanged", examples:[{de:"Wo ist der Speisewagen?",en:"Where is the dining car?"}] },
        { en:"the tip (money for the waiter)", de:"das Trinkgeld", pl:"die Trinkgelder", hint:"neuter noun", examples:[{de:"Ich habe dem Kellner zwei Euro Trinkgeld gegeben.",en:"I gave the waiter two euros as a tip."}] },
        { en:"the butcher", de:"der Metzger", pl:"die Metzger", hint:"masculine noun — plural unchanged", examples:[{de:"Dieser Metzger hat sehr gute Wurst.",en:"This butcher has very good sausage."}] },

        // Taste and hunger
        { en:"the appetite", de:"der Appetit", hint:"masculine noun — no plural", examples:[{de:"Ich habe heute keinen Appetit. Ich mag nichts essen.",en:"I have no appetite today. I do not want to eat anything."}] },
        { en:"the taste (the flavour of something)", de:"der Geschmack", hint:"masculine noun — no plural", examples:[{de:"Ich möchte bitte Kaugummi mit Erdbeergeschmack.",en:"I would like chewing gum with a strawberry taste, please."}] },
      ]
    },

    // ── 8. SHOPPING, PRODUCTS & CONSUMER ───────────────────────────
    {
      id: "b1_shopping", name: "Shopping, Products & Consumer", icon: "🛒",
      words: [

        // Buying and selling
        { en:"the purchase", de:"der Kauf", hint:"masculine noun", examples:[{de:"Der neue Esstisch war ein guter Kauf.",en:"The new dining table was a good purchase."}] },
        { en:"the buyer", de:"der Käufer", pl:"die Käufer", hint:"masculine noun — plural unchanged", examples:[{de:"Ich habe schon einen Käufer für den alten Tisch.",en:"I already have a buyer for the old table."}] },
        { en:"the dealer (person who sells)", de:"der Händler", pl:"die Händler", hint:"masculine noun — plural unchanged", examples:[{de:"Ich gehe zum Gemüsehändler, soll ich dir etwas mitbringen?",en:"I'm going to the vegetable dealer, shall I bring you something?"}] },
        { en:"the trade (buying and selling as a business)", de:"der Handel", hint:"masculine noun — no plural", examples:[{de:"Der Handel mit Computern ist ein gutes Geschäft.",en:"Trade in computers is a good business."}] },
        { en:"the goods (what a firm sells)", de:"die Ware", pl:"die Waren", hint:"feminine noun", examples:[{de:"Wir liefern Ihnen die Ware direkt ins Haus.",en:"We deliver the goods directly to your home."}] },
        { en:"the supplier / the provider", de:"der Anbieter", pl:"die Anbieter", hint:"masculine noun — offers the service", examples:[{de:"Ist das ein privater Telefonanbieter?",en:"Is that a private telephone provider?"}] },
        { en:"the manufacturer", de:"der Hersteller", pl:"die Hersteller", hint:"masculine noun — makes the product", examples:[{de:"Ihr Handy ist kaputt? Wir schicken es an den Hersteller zurück.",en:"Your mobile is broken? We'll send it back to the manufacturer."}] },
        { en:"the brand", de:"die Marke", pl:"die Marken", hint:"feminine noun — the maker's name", examples:[{de:"Welche Marke ist dein Auto?",en:"What brand is your car?"}] },
        { en:"the demand (how much people want to buy)", de:"die Nachfrage", pl:"die Nachfragen", hint:"feminine noun — the market term", examples:[{de:"Die Nachfrage für dieses Produkt ist groß.",en:"The demand for this product is great."}] },
        { en:"the consumption (how much is used up)", de:"der Konsum", hint:"masculine noun — no plural", examples:[{de:"Der Konsum von Lebensmitteln steigt.",en:"The consumption of food is rising."}] },
        { en:"the quantity", de:"die Menge", pl:"die Mengen", hint:"feminine noun", examples:[{de:"Diesen Preis gibt es nur, wenn Sie große Mengen kaufen.",en:"This price is only available if you buy large quantities."}] },

        // Prices, receipts, returns
        { en:"the special offer", de:"das Sonderangebot", pl:"die Sonderangebote", hint:"neuter noun", examples:[{de:"Das ist ein Sonderangebot: 25 % reduziert.",en:"That is a special offer: 25% off."}] },
        { en:"the discount", de:"der Rabatt", pl:"die Rabatte", hint:"masculine noun", examples:[{de:"Sie bekommen zehn Prozent Rabatt.",en:"You get ten percent discount."}] },
        { en:"the receipt (the -ung word)", de:"die Quittung", pl:"die Quittungen", hint:"feminine noun — synonym of Beleg", examples:[{de:"Brauchen Sie eine Quittung?",en:"Do you need a receipt?"}] },
        { en:"the receipt (the Beleg- word)", de:"der Beleg", pl:"die Belege", hint:"masculine noun — synonym of Quittung", examples:[{de:"Brauchen Sie einen Beleg?",en:"Do you need a receipt?"}] },
        { en:"the exchange (returning goods to a shop)", de:"der Umtausch", hint:"masculine noun", examples:[{de:"Ein Umtausch ist leider nicht möglich.",en:"An exchange is unfortunately not possible."}] },
        { en:"the delivery", de:"die Lieferung", pl:"die Lieferungen", hint:"feminine noun", examples:[{de:"Sie bezahlen erst bei der Lieferung.",en:"You only pay on delivery."}] },
        { en:"the reminder (demand to pay an overdue bill)", de:"die Mahnung", pl:"die Mahnungen", hint:"feminine noun", examples:[{de:"Wenn du die Rechnung nicht pünktlich bezahlst, bekommst du eine Mahnung.",en:"If you do not pay the bill on time, you will get a reminder."}] },
        { en:"the shortage / the lack", de:"der Mangel", pl:"die Mängel", hint:"masculine noun — umlaut plural", examples:[{de:"In dieser Stadt gibt es einen großen Mangel an Wohnungen.",en:"In this city there is a great shortage of flats."}] },
        { en:"the selection (the choice on offer)", de:"die Auswahl", hint:"feminine noun", examples:[{de:"Wir müssen eine Auswahl aus den Büchern treffen.",en:"We have to make a selection from the books."}] },
        { en:"the catalogue", de:"der Katalog", pl:"die Kataloge", hint:"masculine noun", examples:[{de:"Ich habe mir ein Kleid aus dem Katalog bestellt.",en:"I ordered a dress from the catalogue."}] },
        { en:"the shop window", de:"das Schaufenster", pl:"die Schaufenster", hint:"neuter noun — plural unchanged", examples:[{de:"Ich habe im Schaufenster eine schicke Bluse gesehen.",en:"I saw a smart blouse in the shop window."}] },

        // Advertising — four words, four different jobs
        { en:"the advertising (commercials on TV and radio)", de:"die Werbung", pl:"die Werbungen", hint:"feminine noun — the industry and its output", examples:[{de:"Ich sehe gern Werbung im Fernsehen.",en:"I like watching adverts on television."}] },
        { en:"the advertising leaflets (junk mail)", de:"die Reklame", pl:"die Reklamen", hint:"feminine noun — the older word, often unwanted", examples:[{de:"Ich möchte keine Reklame im Briefkasten.",en:"I do not want advertising leaflets in my letterbox."}] },
        { en:"the newspaper advert (one you pay to place)", de:"das Inserat", pl:"die Inserate", hint:"neuter noun — from the advertiser's side", examples:[{de:"Was kostet ein Inserat in der Zeitung?",en:"What does an advert in the newspaper cost?"}] },
        { en:"the classified ad (a small ad you read)", de:"die Annonce", pl:"die Annoncen", hint:"feminine noun — from the reader's side", examples:[{de:"Ich habe alle Annoncen gelesen, aber die Wohnungen sind zu teuer.",en:"I read all the classified ads, but the flats are too expensive."}] },

        // Shops
        { en:"the bookshop", de:"die Buchhandlung", pl:"die Buchhandlungen", hint:"feminine noun", examples:[{de:"In der Buchhandlung in der Stadt haben sie das Buch sicher.",en:"They will surely have the book in the bookshop in town."}] },
        { en:"the chemist's (toiletries, no prescriptions)", de:"die Drogerie", pl:"die Drogerien", hint:"feminine noun — not die Apotheke", examples:[{de:"Waschmittel bekommst du in der Drogerie.",en:"You can get detergent at the chemist's."}] },

        // Clothes and things you buy
        { en:"the costume (worn in a film or at carnival)", de:"das Kostüm", pl:"die Kostüme", hint:"neuter noun", examples:[{de:"In dem Film tragen die Leute bunte Kostüme.",en:"In the film the people wear colourful costumes."}] },
        { en:"the sock (short)", de:"die Socke", pl:"die Socken", hint:"feminine noun — ankle length", examples:[{de:"Im Winter brauche ich warme Socken.",en:"In winter I need warm socks."}] },
        { en:"the stocking (long)", de:"der Strumpf", pl:"die Strümpfe", hint:"masculine noun — umlaut plural, knee length or higher", examples:[{de:"Wo sind meine roten Strümpfe?",en:"Where are my red stockings?"}] },
        { en:"the hat (with a brim)", de:"der Hut", pl:"die Hüte", hint:"masculine noun — umlaut plural", examples:[{de:"Sie sollten im Sommer nicht ohne Hut in die Sonne gehen.",en:"You should not go into the sun without a hat in summer."}] },
        { en:"the jewellery", de:"der Schmuck", hint:"masculine noun — no plural", examples:[{de:"Dieser Schmuck ist von meiner Großmutter.",en:"This jewellery is from my grandmother."}] },
        { en:"the uniform", de:"die Uniform", pl:"die Uniformen", hint:"feminine noun", examples:[{de:"In der Schule, die sie besucht, trägt man Uniformen.",en:"At the school she attends, people wear uniforms."}] },
        { en:"the toy", de:"das Spielzeug", pl:"die Spielzeuge", hint:"neuter noun", examples:[{de:"Zu Weihnachten wünschen sich die Kinder vor allem Spielzeug.",en:"At Christmas the children mostly wish for toys."}] },
        { en:"the doll", de:"die Puppe", pl:"die Puppen", hint:"feminine noun", examples:[{de:"Unsere kleine Tochter bekommt zum Geburtstag eine Puppe.",en:"Our little daughter is getting a doll for her birthday."}] },

        // Verbs that belong to this topic
        { en:"to exchange (take goods back to a shop)", de:"umtauschen", hint:"verb separable · tauschte um · hat umgetauscht", examples:[{de:"Ich möchte diese Bluse umtauschen. Sie passt mir nicht.",en:"I would like to exchange this blouse. It does not fit me."}] },
      ]
    },

    // ── 9. MONEY, BANKING & INSURANCE ──────────────────────────────
    {
      id: "b1_money", name: "Money, Banking & Insurance", icon: "💶",
      words: [

        // Cash
        { en:"the cash", de:"das Bargeld", hint:"neuter noun — no plural", examples:[{de:"Ich habe kein Bargeld mehr.",en:"I have no cash left."}] },
        { en:"the coin", de:"die Münze", pl:"die Münzen", hint:"feminine noun", examples:[{de:"Der Automat nimmt nur Münzen.",en:"The machine only takes coins."}] },
        { en:"the note (paper money)", de:"der Schein", pl:"die Scheine", hint:"masculine noun", examples:[{de:"Kannst du einen Schein in Kleingeld wechseln?",en:"Can you change a note into small coins?"}] },
        { en:"the purse (small, for coins)", de:"das Portemonnaie", pl:"die Portemonnaies", hint:"neuter noun — French loanword", examples:[{de:"Ich habe nur Kleingeld in meinem Portemonnaie.",en:"I only have small change in my purse."}] },
        { en:"the wallet (flat, for notes and cards)", de:"die Brieftasche", pl:"die Brieftaschen", hint:"feminine noun", examples:[{de:"Ich habe nur Kleingeld in meiner Brieftasche.",en:"I only have small change in my wallet."}] },

        // Cards and accounts
        { en:"the current account", de:"das Girokonto", pl:"die Girokonten", hint:"neuter noun — irregular plural", examples:[{de:"Mein Girokonto kostet gar nichts.",en:"My current account costs nothing at all."}] },
        { en:"the credit card", de:"die Kreditkarte", pl:"die Kreditkarten", hint:"feminine noun", examples:[{de:"Kann ich mit Kreditkarte zahlen?",en:"Can I pay by credit card?"}] },
        { en:"the chip card", de:"die Chipkarte", pl:"die Chipkarten", hint:"feminine noun", examples:[{de:"Ich habe eine Chipkarte für diesen Automaten.",en:"I have a chip card for this machine."}] },
        { en:"the bank sort code", de:"die Bankleitzahl", pl:"die Bankleitzahlen", hint:"feminine noun", examples:[{de:"Bitte geben Sie Ihre Bankleitzahl an.",en:"Please state your bank sort code."}] },

        // Paying
        { en:"the payment (paying in general)", de:"die Zahlung", pl:"die Zahlungen", hint:"feminine noun — any way of paying", examples:[{de:"Bitte geben Sie bei der Zahlung die Rechnungsnummer an.",en:"Please state the invoice number when making the payment."}] },
        { en:"the deposit (paying cash into an account)", de:"die Einzahlung", pl:"die Einzahlungen", hint:"feminine noun — money goes into the account", examples:[{de:"Sie sollten die Einzahlung pünktlich machen.",en:"You should make the deposit on time."}] },
        { en:"the bank transfer", de:"die Überweisung", pl:"die Überweisungen", hint:"feminine noun — account to account", examples:[{de:"Sie können bar oder per Überweisung bezahlen.",en:"You can pay in cash or by bank transfer."}] },
        { en:"the amount (the figure to be paid)", de:"der Betrag", pl:"die Beträge", hint:"masculine noun — on a bill or transfer", examples:[{de:"Bitte überweisen Sie den Betrag auf unser Konto.",en:"Please transfer the amount to our account."}] },
        { en:"the sum (the total when things are added up)", de:"die Summe", pl:"die Summen", hint:"feminine noun — the result of adding", examples:[{de:"Die Summe scheint mir zu hoch!",en:"The sum seems too high to me!"}] },
        { en:"the fee / the charge", de:"die Gebühr", pl:"die Gebühren", hint:"feminine noun — what an authority or bank charges", examples:[{de:"Die Gebühr liegt bei 60 Euro.",en:"The fee is 60 euros."}] },
        { en:"the contribution (regular payment to a scheme)", de:"der Beitrag", pl:"die Beiträge", hint:"masculine noun — to insurance or a club", examples:[{de:"Die Krankenkasse hat die Beiträge erhöht.",en:"The health insurance company raised the contributions."}] },
        { en:"the debts", de:"die Schulden", hint:"plural noun only", examples:[{de:"Jetzt habe ich alle meine Schulden bezahlt.",en:"Now I have paid all my debts."}] },
        { en:"the interest (paid on savings)", de:"die Zinsen", hint:"plural noun only", examples:[{de:"Wie viele Zinsen bekomme ich für mein Sparkonto?",en:"How much interest do I get on my savings account?"}] },

        // Tax, income and results
        { en:"the tax", de:"die Steuer", pl:"die Steuern", hint:"feminine noun", examples:[{de:"Wir müssen immer mehr Steuern zahlen.",en:"We have to pay more and more taxes."}] },
        { en:"the VAT (value added tax)", de:"die Mehrwertsteuer", hint:"feminine noun — no plural", examples:[{de:"Die Mehrwertsteuer bei diesem Produkt beträgt 20 %.",en:"The VAT on this product is 20%."}] },
        { en:"the income (all the money you receive)", de:"das Einkommen", pl:"die Einkommen", hint:"neuter noun — plural unchanged", examples:[{de:"Bei einem höheren Einkommen muss man mehr Steuern zahlen.",en:"With a higher income you have to pay more tax."}] },
        { en:"the wage (paid for work done)", de:"der Lohn", pl:"die Löhne", hint:"masculine noun — umlaut plural", examples:[{de:"Sie bekommen Ihren Lohn immer am Ende des Monats.",en:"You always get your wage at the end of the month."}] },
        { en:"the expenses (money going out)", de:"die Ausgabe", pl:"die Ausgaben", hint:"feminine noun — usually plural", examples:[{de:"Wie hoch sind Ihre Ausgaben in einem Monat?",en:"How high are your expenses in a month?"}] },
        { en:"the takings (money coming in)", de:"die Einnahme", pl:"die Einnahmen", hint:"feminine noun — usually plural", examples:[{de:"Unsere Einnahmen waren in diesem Monat höher als im letzten.",en:"Our takings were higher this month than last."}] },
        { en:"the profit / the winnings", de:"der Gewinn", pl:"die Gewinne", hint:"masculine noun", examples:[{de:"Ich habe bei einem Ratespiel mitgemacht. Der Hauptgewinn ist ein Auto.",en:"I took part in a quiz. The main prize is a car."}] },
        { en:"the loss", de:"der Verlust", pl:"die Verluste", hint:"masculine noun", examples:[{de:"Der Verlust meiner Uhr ärgert mich sehr.",en:"The loss of my watch annoys me a lot."}] },
      ]
    },

    // ── 10. WORK, JOBS & APPLICATIONS ──────────────────────────────
    {
      id: "b1_work", name: "Work, Jobs & Applications", icon: "💼",
      words: [

        // Looking for work
        { en:"the job (the post itself)", de:"die Arbeitsstelle", pl:"die Arbeitsstellen", hint:"feminine noun — the position", examples:[{de:"Meine Frau hat eine neue Arbeitsstelle gefunden.",en:"My wife has found a new job."}] },
        { en:"the work permit", de:"die Arbeitserlaubnis", hint:"feminine noun", examples:[{de:"Haben Sie eine Arbeitserlaubnis?",en:"Do you have a work permit?"}] },
        { en:"the unemployment (the level of it)", de:"die Arbeitslosigkeit", hint:"feminine noun — no plural", examples:[{de:"Die Arbeitslosigkeit ist gesunken.",en:"Unemployment has fallen."}] },
        { en:"the CV", de:"der Lebenslauf", pl:"die Lebensläufe", hint:"masculine noun — umlaut plural", examples:[{de:"Hast du den Lebenslauf für die Bewerbung schon geschrieben?",en:"Have you already written the CV for the application?"}] },
        { en:"the job interview", de:"das Vorstellungsgespräch", pl:"die Vorstellungsgespräche", hint:"neuter noun", examples:[{de:"Wann hast du dein Vorstellungsgespräch?",en:"When is your job interview?"}] },
        { en:"the qualification", de:"die Qualifikation", pl:"die Qualifikationen", hint:"feminine noun", examples:[{de:"Für diese Arbeit haben Sie gute Qualifikationen.",en:"You have good qualifications for this work."}] },

        // Training and contracts
        { en:"the apprenticeship (the training itself)", de:"die Lehre", hint:"feminine noun", examples:[{de:"Mein Cousin will eine dreijährige Lehre machen.",en:"My cousin wants to do a three-year apprenticeship."}] },
        { en:"the apprentice (the person)", de:"der Lehrling", pl:"die Lehrlinge", hint:"masculine noun", examples:[{de:"Als Lehrling verdient man nicht sehr viel Geld.",en:"As an apprentice you do not earn very much money."}] },
        { en:"the apprenticeship place (the vacancy)", de:"die Lehrstelle", pl:"die Lehrstellen", hint:"feminine noun — the position to apply for", examples:[{de:"Es sind noch viele Lehrstellen frei.",en:"There are still many apprenticeship places free."}] },
        { en:"the intern", de:"der Praktikant", pl:"die Praktikanten", hint:"masculine noun — n-declension", examples:[{de:"Bei dieser Firma habe ich zwei Jahre als Praktikant gearbeitet.",en:"I worked at this company as an intern for two years."}] },
        { en:"the temporary helper", de:"die Aushilfe", pl:"die Aushilfen", hint:"feminine noun", examples:[{de:"Wir suchen eine freundliche Aushilfe für unser Geschäft.",en:"We are looking for a friendly temporary helper for our shop."}] },
        { en:"the part-time work", de:"die Teilzeit", hint:"feminine noun — no plural", examples:[{de:"Ich arbeite im Moment nur Teilzeit.",en:"At the moment I only work part-time."}] },
        { en:"the full-time work", de:"die Vollzeit", hint:"feminine noun — no plural", examples:[{de:"Ich möchte gerne Vollzeit arbeiten.",en:"I would like to work full-time."}] },
        { en:"the overtime hour", de:"die Überstunde", pl:"die Überstunden", hint:"feminine noun — usually plural", examples:[{de:"Ich muss heute Überstunden machen.",en:"I have to work overtime today."}] },
        { en:"the notice (given to end a job)", de:"die Kündigung", pl:"die Kündigungen", hint:"feminine noun — either side can give it", examples:[{de:"Ich habe die Kündigung bekommen. Jetzt bin ich arbeitslos.",en:"I received my notice. Now I am unemployed."}] },
        { en:"the dismissal (being let go by the employer)", de:"die Entlassung", pl:"die Entlassungen", hint:"feminine noun — only from the employer", examples:[{de:"Seine Entlassung aus der Firma kam überraschend.",en:"His dismissal from the company came as a surprise."}] },
        { en:"the employment / the occupation", de:"die Beschäftigung", hint:"feminine noun", examples:[{de:"Ich suche eine Halbtagsbeschäftigung, weil ich ein kleines Kind habe.",en:"I am looking for part-time employment because I have a small child."}] },
        { en:"the activity (what you actually do)", de:"die Tätigkeit", pl:"die Tätigkeiten", hint:"feminine noun", examples:[{de:"Welche Tätigkeit würde Ihnen Spaß machen?",en:"Which activity would you enjoy?"}] },
        { en:"the career", de:"die Karriere", pl:"die Karrieren", hint:"feminine noun — Karriere machen", examples:[{de:"Mein Bruder hat große Pläne. Er will Karriere machen.",en:"My brother has big plans. He wants to make a career."}] },
        { en:"the further training (the -fort- word)", de:"die Fortbildung", pl:"die Fortbildungen", hint:"feminine noun — synonym of Weiterbildung", examples:[{de:"Die Fortbildung, die ich machen will, ist sehr teuer.",en:"The further training I want to do is very expensive."}] },
        { en:"the further training (the -weiter- word)", de:"die Weiterbildung", pl:"die Weiterbildungen", hint:"feminine noun — synonym of Fortbildung", examples:[{de:"Ich möchte eine Weiterbildung machen.",en:"I would like to do further training."}] },

        // Workforce and representation
        { en:"the staff (all the employees)", de:"das Personal", hint:"neuter noun — no plural", examples:[{de:"Dieser Eingang ist nur für das Personal.",en:"This entrance is only for staff."}] },
        { en:"the works council", de:"der Betriebsrat", pl:"die Betriebsräte", hint:"masculine noun — umlaut plural", examples:[{de:"Der Betriebsrat wird Sie über die neuen Arbeitszeiten informieren.",en:"The works council will inform you about the new working hours."}] },
        { en:"the trade union", de:"die Gewerkschaft", pl:"die Gewerkschaften", hint:"feminine noun", examples:[{de:"Die Gewerkschaft vertritt die Interessen der Arbeitnehmer.",en:"The trade union represents the employees' interests."}] },
        { en:"the strike", de:"der Streik", pl:"die Streiks", hint:"masculine noun", examples:[{de:"Es gab einen Streik am Flughafen. Deshalb hatte unsere Maschine Verspätung.",en:"There was a strike at the airport. That is why our plane was delayed."}] },
        { en:"the stand-in (someone covering for you)", de:"die Vertretung", pl:"die Vertretungen", hint:"feminine noun — the arrangement", examples:[{de:"Herr Dr. Meyer macht für mich die Vertretung.",en:"Dr Meyer is standing in for me."}] },
        { en:"the representative (person acting for another)", de:"der Vertreter", pl:"die Vertreter", hint:"masculine noun — plural unchanged", examples:[{de:"Als Herr Dr. Müller in Urlaub war, bin ich zu seinem Vertreter gegangen.",en:"When Dr Müller was on holiday, I went to his stand-in."}] },

        // Jobs
        { en:"the manual worker", de:"der Arbeiter", pl:"die Arbeiter", hint:"masculine noun — plural unchanged", examples:[{de:"Mario ist seit zwei Jahren Arbeiter bei Siemens.",en:"Mario has been a worker at Siemens for two years."}] },
        { en:"the master craftsman", de:"der Meister", pl:"die Meister", hint:"masculine noun — the highest trade qualification", examples:[{de:"Ich weiß nicht, wie man das macht. – Dann frag doch den Meister.",en:"I do not know how to do that. – Then ask the master craftsman."}] },
        { en:"the skilled tradesman", de:"der Fachmann", pl:"die Fachleute", hint:"masculine noun — irregular plural", examples:[{de:"Für diese Reparatur brauchen wir einen Fachmann.",en:"For this repair we need a skilled tradesman."}] },
        { en:"the expert (someone with deep knowledge)", de:"der Experte", pl:"die Experten", hint:"masculine noun — n-declension", examples:[{de:"Ich verstehe ein bisschen was von Computern. Aber ich bin kein Experte.",en:"I know a little about computers. But I am not an expert."}] },
        { en:"the specialist (in one narrow field)", de:"der Spezialist", pl:"die Spezialisten", hint:"masculine noun — n-declension", examples:[{de:"Mein Arzt hat mich zum Spezialisten geschickt.",en:"My doctor sent me to a specialist."}] },
        { en:"the entrepreneur", de:"der Unternehmer", pl:"die Unternehmer", hint:"masculine noun — plural unchanged", examples:[{de:"Er ist ein erfolgreicher Unternehmer.",en:"He is a successful entrepreneur."}] },
        { en:"the secretary", de:"der Sekretär", pl:"die Sekretäre", hint:"masculine noun", examples:[{de:"Der neue Sekretär hat sich gestern vorgestellt.",en:"The new secretary introduced himself yesterday."}] },
        { en:"the course tutor", de:"der Kursleiter", pl:"die Kursleiter", hint:"masculine noun — plural unchanged", examples:[{de:"Der Kursleiter erklärt die Grammatik sehr gut.",en:"The course tutor explains the grammar very well."}] },
        { en:"the carer / the support worker", de:"der Betreuer", pl:"die Betreuer", hint:"masculine noun — plural unchanged", examples:[{de:"Der Betreuer der Kinder ist sehr nett.",en:"The children's carer is very nice."}] },
        { en:"the social worker", de:"der Sozialarbeiter", pl:"die Sozialarbeiter", hint:"masculine noun — plural unchanged", examples:[{de:"Der Sozialarbeiter kommt einmal in der Woche.",en:"The social worker comes once a week."}] },
        { en:"the postman", de:"der Briefträger", pl:"die Briefträger", hint:"masculine noun — plural unchanged", examples:[{de:"War der Briefträger schon da?",en:"Has the postman already been?"}] },
        { en:"the painter and decorator", de:"der Maler", pl:"die Maler", hint:"masculine noun — also an artist", examples:[{de:"Wir haben die Maler im Haus. Wir lassen die Wände neu streichen.",en:"We have the decorators in. We are having the walls repainted."}] },
        { en:"the photographer", de:"der Fotograf", pl:"die Fotografen", hint:"masculine noun — n-declension", examples:[{de:"Der Fotograf hat sehr schöne Fotos gemacht.",en:"The photographer took very nice photos."}] },
        { en:"the engineer", de:"der Ingenieur", pl:"die Ingenieure", hint:"masculine noun", examples:[{de:"Hans will Bauingenieur werden.",en:"Hans wants to become a civil engineer."}] },
        { en:"the architect", de:"der Architekt", pl:"die Architekten", hint:"masculine noun — n-declension", examples:[{de:"Dieses Haus hat ein berühmter Architekt gebaut.",en:"A famous architect built this house."}] },
        { en:"the lawyer", de:"der Anwalt", pl:"die Anwälte", hint:"masculine noun — umlaut plural", examples:[{de:"Ich werde das nicht bezahlen. Ich möchte zuerst mit meinem Anwalt sprechen.",en:"I will not pay that. I would like to speak to my lawyer first."}] },
        { en:"the judge", de:"der Richter", pl:"die Richter", hint:"masculine noun — plural unchanged", examples:[{de:"Der Richter hat noch kein Urteil gesprochen.",en:"The judge has not yet passed judgement."}] },
        { en:"the professor", de:"der Professor", pl:"die Professoren", hint:"masculine noun", examples:[{de:"Unser Nachbar ist Professor an der Universität.",en:"Our neighbour is a professor at the university."}] },
        { en:"the pro (someone who does it professionally)", de:"der Profi", pl:"die Profis", hint:"masculine noun — short for Professioneller", examples:[{de:"Mein Bruder kann die Heizung bestimmt reparieren. Er ist doch ein Profi.",en:"My brother can surely repair the heating. He is a pro, after all."}] },
        { en:"the civil servant", de:"der Beamte", pl:"die Beamten", hint:"masculine noun — declines like an adjective", examples:[{de:"Mein Mann ist Beamter bei der Polizei.",en:"My husband is a civil servant with the police."}] },
        { en:"the farmer", de:"der Bauer", pl:"die Bauern", hint:"masculine noun — n-declension", examples:[{de:"Wir kaufen unser Gemüse beim Bauern.",en:"We buy our vegetables from the farmer."}] },

        // Verbs that belong to this topic
        { en:"to take on (hire an employee)", de:"einstellen", hint:"verb separable · stellte ein · hat eingestellt", examples:[{de:"Die Firma wird in diesem Jahr drei neue Leute einstellen.",en:"The company will take on three new people this year."}] },
      ]
    },

    // ── 11. OFFICE, BUSINESS & ECONOMY ─────────────────────────────
    {
      id: "b1_business", name: "Office, Business & Economy", icon: "🗂️",
      words: [

        // The organisation
        { en:"the department", de:"die Abteilung", pl:"die Abteilungen", hint:"feminine noun", examples:[{de:"Meine Freundin arbeitet in der Abteilung von Frau Kaufmann.",en:"My friend works in Mrs Kaufmann's department."}] },
        { en:"the business / the plant (a working company)", de:"der Betrieb", pl:"die Betriebe", hint:"masculine noun — the operating firm", examples:[{de:"In diesem Betrieb arbeiten zehn Leute.",en:"Ten people work in this business."}] },
        { en:"the factory", de:"die Fabrik", pl:"die Fabriken", hint:"feminine noun — where things are made", examples:[{de:"Ich arbeite in einer Autofabrik.",en:"I work in a car factory."}] },
        { en:"the field / the area (of activity)", de:"der Bereich", pl:"die Bereiche", hint:"masculine noun", examples:[{de:"In welchem Bereich möchten Sie arbeiten?",en:"In which field would you like to work?"}] },
        { en:"the administration", de:"die Verwaltung", pl:"die Verwaltungen", hint:"feminine noun", examples:[{de:"Sprechen Sie bitte mit der Verwaltung. Die können Ihnen helfen.",en:"Please speak to the administration. They can help you."}] },
        { en:"the cooperation (working together)", de:"die Zusammenarbeit", hint:"feminine noun — no plural", examples:[{de:"Sie sind der neue Kollege? Auf gute Zusammenarbeit!",en:"You are the new colleague? Here's to good cooperation!"}] },
        { en:"the competition (rival firms)", de:"die Konkurrenz", hint:"feminine noun — no plural", examples:[{de:"Die Reparatur ist mir hier zu teuer. Bei der Konkurrenz bekomme ich sie für die Hälfte.",en:"The repair is too expensive here. At the competition I get it for half."}] },
        { en:"the warehouse / the stockroom", de:"das Lager", pl:"die Lager", hint:"neuter noun — plural unchanged", examples:[{de:"Ich sehe mal im Lager nach, ob wir diesen Schuh in Ihrer Größe haben.",en:"I'll check in the stockroom whether we have this shoe in your size."}] },

        // Meetings and orders
        { en:"the meeting (a work discussion)", de:"die Besprechung", pl:"die Besprechungen", hint:"feminine noun — internal, informal", examples:[{de:"Tut mir leid, Herr Schmidt ist noch in einer Besprechung.",en:"I'm sorry, Mr Schmidt is still in a meeting."}] },
        { en:"the conference (a formal, larger event)", de:"die Konferenz", pl:"die Konferenzen", hint:"feminine noun — bigger than a Besprechung", examples:[{de:"Die Konferenz findet in Raum 19 statt.",en:"The conference takes place in room 19."}] },
        { en:"the order / the assignment", de:"der Auftrag", pl:"die Aufträge", hint:"masculine noun — umlaut plural", examples:[{de:"Ich komme im Auftrag von Frau Müller und soll Ihnen diesen Brief geben.",en:"I come on behalf of Mrs Müller and am to give you this letter."}] },
        { en:"the deadline", de:"die Frist", pl:"die Fristen", hint:"feminine noun", examples:[{de:"Die Frist für die Anmeldung zum Deutschkurs ist abgelaufen.",en:"The deadline for registering for the German course has passed."}] },
        { en:"the confirmation (in writing)", de:"die Bestätigung", pl:"die Bestätigungen", hint:"feminine noun", examples:[{de:"Ich brauche eine schriftliche Bestätigung für das Amt.",en:"I need a written confirmation for the authorities."}] },
        { en:"the recommendation", de:"die Empfehlung", pl:"die Empfehlungen", hint:"feminine noun — from empfehlen", examples:[{de:"Ich rufe auf Empfehlung von Herrn Weber an.",en:"I am calling on Mr Weber's recommendation."}] },
        { en:"the advisory service", de:"die Beratung", hint:"feminine noun — from beraten", examples:[{de:"Beratungen für Familien gibt es jeden Dienstag zwischen 14 und 16 Uhr.",en:"Advisory sessions for families are held every Tuesday between 2 and 4 p.m."}] },
        { en:"the planning", de:"die Planung", pl:"die Planungen", hint:"feminine noun", examples:[{de:"Unsere Planung für das Sommerfest steht schon lange.",en:"Our planning for the summer party has been settled for a long time."}] },

        // On the desk
        { en:"the diary (for appointments)", de:"der Terminkalender", pl:"die Terminkalender", hint:"masculine noun — plural unchanged", examples:[{de:"Hast du unser Treffen schon in deinen Terminkalender eingetragen?",en:"Have you already entered our meeting in your diary?"}] },
        { en:"the business card", de:"die Visitenkarte", pl:"die Visitenkarten", hint:"feminine noun", examples:[{de:"Darf ich Ihnen meine Visitenkarte geben?",en:"May I give you my business card?"}] },
        { en:"the documents (a set of papers)", de:"die Unterlagen", hint:"plural noun only", examples:[{de:"Ich schicke Ihnen alle Unterlagen mit der Post zu.",en:"I will send you all the documents by post."}] },
        { en:"the ring binder", de:"der Ordner", pl:"die Ordner", hint:"masculine noun — also a computer folder", examples:[{de:"Für meine Übungen im Deutschkurs habe ich mir einen Ordner gekauft.",en:"I bought a ring binder for my German course exercises."}] },
        { en:"the folder (soft, for carrying papers)", de:"die Mappe", pl:"die Mappen", hint:"feminine noun", examples:[{de:"Mein Pass ist in dieser Mappe.",en:"My passport is in this folder."}] },
        { en:"the copy (a duplicate)", de:"die Kopie", pl:"die Kopien", hint:"feminine noun", examples:[{de:"Machst du mir bitte eine Kopie?",en:"Would you make me a copy, please?"}] },
        { en:"the photocopier", de:"der Kopierer", pl:"die Kopierer", hint:"masculine noun — plural unchanged", examples:[{de:"Der Kopierer ist schon wieder kaputt.",en:"The photocopier is broken again."}] },
        { en:"the stamp (the ink mark)", de:"der Stempel", pl:"die Stempel", hint:"masculine noun — not a postage stamp", examples:[{de:"Der Poststempel trägt das Datum von letzter Woche.",en:"The postmark bears last week's date."}] },
        { en:"the note (something written down)", de:"die Notiz", pl:"die Notizen", hint:"feminine noun", examples:[{de:"Ich habe Ihnen eine Notiz geschrieben.",en:"I wrote you a note."}] },
        { en:"the slip of paper", de:"der Zettel", pl:"die Zettel", hint:"masculine noun — plural unchanged", examples:[{de:"Hast du einen Zettel für mich? Ich muss etwas aufschreiben.",en:"Do you have a slip of paper for me? I have to write something down."}] },
        { en:"the biro", de:"der Kuli", pl:"die Kulis", hint:"masculine noun — short for Kugelschreiber", examples:[{de:"Hast du einen Kuli für mich?",en:"Do you have a biro for me?"}] },
        { en:"the sheet (of paper, e.g. an answer sheet)", de:"der Bogen", pl:"die Bögen", hint:"masculine noun", examples:[{de:"Bitte schreiben Sie Ihren Namen auf den Antwortbogen.",en:"Please write your name on the answer sheet."}] },
        { en:"the table (rows and columns)", de:"die Tabelle", pl:"die Tabellen", hint:"feminine noun — not a piece of furniture", examples:[{de:"Tragen Sie die richtige Information in die Tabelle ein.",en:"Enter the correct information in the table."}] },
        { en:"the statistics", de:"die Statistik", pl:"die Statistiken", hint:"feminine noun", examples:[{de:"Die Statistik zeigt, dass jeder Zweite ein Fahrrad besitzt.",en:"The statistics show that every second person owns a bicycle."}] },
        { en:"the list", de:"die Liste", pl:"die Listen", hint:"feminine noun", examples:[{de:"Was brauchen wir für die Party? – Mach doch eine Einkaufsliste.",en:"What do we need for the party? – Why not make a shopping list."}] },

        // Presenting
        { en:"the presentation (with slides)", de:"die Präsentation", pl:"die Präsentationen", hint:"feminine noun", examples:[{de:"Die Schülerin hat für ihre Präsentation eine gute Note bekommen.",en:"The pupil got a good mark for her presentation."}] },
        { en:"the talk (a lecture to an audience)", de:"der Vortrag", pl:"die Vorträge", hint:"masculine noun — einen Vortrag halten", examples:[{de:"Ihr Vortrag war sehr interessant.",en:"Your talk was very interesting."}] },
        { en:"the class presentation (given by a student)", de:"das Referat", pl:"die Referate", hint:"neuter noun — at school or university", examples:[{de:"Vielen Dank für dieses interessante Referat.",en:"Many thanks for this interesting presentation."}] },

        // The economy
        { en:"the economy", de:"die Wirtschaft", hint:"feminine noun — no plural", examples:[{de:"In der Schule lernen die Kinder viel über Wirtschaft und Politik.",en:"At school the children learn a lot about the economy and politics."}] },
        { en:"the industry", de:"die Industrie", pl:"die Industrien", hint:"feminine noun", examples:[{de:"In dieser Gegend gibt es viel Industrie.",en:"There is a lot of industry in this area."}] },
        { en:"the production", de:"die Produktion", hint:"feminine noun — no plural", examples:[{de:"Die Produktion von Käse dauert oft viele Wochen.",en:"The production of cheese often takes many weeks."}] },
        { en:"the export", de:"der Export", pl:"die Exporte", hint:"masculine noun — goods going out", examples:[{de:"Hier ist die Firma Schulz, Import und Export.",en:"This is the Schulz company, import and export."}] },
        { en:"the import", de:"der Import", pl:"die Importe", hint:"masculine noun — goods coming in", examples:[{de:"Im dritten Stock ist die Firma Schmidt & Co, Import und Export.",en:"On the third floor is the firm Schmidt & Co, import and export."}] },
        { en:"the need / the requirement (for a product)", de:"der Bedarf", hint:"masculine noun — no plural", examples:[{de:"An diesem Produkt besteht großer Bedarf.",en:"There is a great need for this product."}] },
        { en:"the system", de:"das System", pl:"die Systeme", hint:"neuter noun", examples:[{de:"Welches Betriebssystem hast du?",en:"Which operating system do you have?"}] },
        { en:"the model (a version of a product)", de:"das Modell", pl:"die Modelle", hint:"neuter noun", examples:[{de:"Wie findest du dieses Auto? – Dieses Modell gefällt mir nicht.",en:"What do you think of this car? – I do not like this model."}] },
        { en:"the method", de:"die Methode", pl:"die Methoden", hint:"feminine noun", examples:[{de:"Weißt du eine gute Methode, um schnell gut Deutsch zu lernen?",en:"Do you know a good method for learning German well quickly?"}] },
        { en:"the reform", de:"die Reform", pl:"die Reformen", hint:"feminine noun", examples:[{de:"Die Regierung plant für nächstes Jahr eine Reform.",en:"The government is planning a reform for next year."}] },
        { en:"the progress (advances made)", de:"der Fortschritt", pl:"die Fortschritte", hint:"masculine noun — Fortschritte machen", examples:[{de:"Ich habe beim Deutschlernen große Fortschritte gemacht.",en:"I have made great progress in learning German."}] },
        { en:"the development", de:"die Entwicklung", pl:"die Entwicklungen", hint:"feminine noun", examples:[{de:"Genug Schlaf ist wichtig für die Entwicklung Ihres Kindes.",en:"Enough sleep is important for your child's development."}] },
        { en:"the increase (a rise that was brought about)", de:"die Erhöhung", pl:"die Erhöhungen", hint:"feminine noun — from erhöhen", examples:[{de:"Wir streiken für eine Lohnerhöhung.",en:"We are striking for a wage increase."}] },
        { en:"the performance / the achievement", de:"die Leistung", pl:"die Leistungen", hint:"feminine noun", examples:[{de:"Meine Leistungen in der Schule sind ganz gut.",en:"My performance at school is quite good."}] },
        { en:"the advantage", de:"der Vorteil", pl:"die Vorteile", hint:"masculine noun", examples:[{de:"Der Vorteil von dieser Wohnung ist, dass sie direkt im Zentrum liegt.",en:"The advantage of this flat is that it is right in the centre."}] },
        { en:"the disadvantage", de:"der Nachteil", pl:"die Nachteile", hint:"masculine noun", examples:[{de:"Einen Nachteil hat die Wohnung. Sie liegt nicht zentral.",en:"The flat has one disadvantage. It is not centrally located."}] },
      ]
    },

    // ── 12. EDUCATION, STUDY & LANGUAGE ────────────────────────────
    {
      id: "b1_education", name: "Education, Study & Language", icon: "🎓",
      words: [

        // Courses and qualifications
        { en:"the semester", de:"das Semester", pl:"die Semester", hint:"neuter noun — plural unchanged", examples:[{de:"Mein Neffe studiert im dritten Semester.",en:"My nephew is in his third semester."}] },
        { en:"the seminar", de:"das Seminar", pl:"die Seminare", hint:"neuter noun", examples:[{de:"Ich möchte dieses Seminar unbedingt besuchen.",en:"I definitely want to attend this seminar."}] },
        { en:"the intensive course", de:"der Intensivkurs", pl:"die Intensivkurse", hint:"masculine noun", examples:[{de:"Der Intensivkurs findet täglich von 9 bis 12 Uhr statt.",en:"The intensive course takes place daily from 9 to 12."}] },
        { en:"the private tuition", de:"die Nachhilfe", pl:"die Nachhilfen", hint:"feminine noun — extra help outside school", examples:[{de:"Der Schüler braucht Nachhilfe in Mathematik.",en:"The pupil needs private tuition in mathematics."}] },
        { en:"the class test", de:"die Klassenarbeit", pl:"die Klassenarbeiten", hint:"feminine noun — written, in school", examples:[{de:"Mein Sohn schreibt morgen eine Klassenarbeit.",en:"My son is writing a class test tomorrow."}] },
        { en:"the diploma", de:"das Diplom", pl:"die Diplome", hint:"neuter noun — a university degree", examples:[{de:"Wo kann ich mein Diplom abholen?",en:"Where can I collect my diploma?"}] },
        { en:"the certificate (proof of a course passed)", de:"das Zertifikat", pl:"die Zertifikate", hint:"neuter noun — e.g. Zertifikat B1", examples:[{de:"Wenn ich die Prüfung schaffe, bekomme ich ein Zertifikat.",en:"If I pass the exam, I will get a certificate."}] },
        { en:"the school-leaving qualification", de:"der Abschluss", pl:"die Abschlüsse", hint:"masculine noun — umlaut plural", examples:[{de:"Ein guter Schulabschluss ist sehr wichtig.",en:"A good school-leaving qualification is very important."}] },
        { en:"the participant", de:"der Teilnehmer", pl:"die Teilnehmer", hint:"masculine noun — plural unchanged", examples:[{de:"Die Teilnehmer aus unserem Kurs kommen aus verschiedenen Ländern.",en:"The participants from our course come from various countries."}] },
        { en:"the participation", de:"die Teilnahme", pl:"die Teilnahmen", hint:"feminine noun", examples:[{de:"Die Teilnahme am Gewinnspiel ist kostenlos.",en:"Participation in the prize draw is free."}] },
        { en:"the student (at university, gender-neutral form)", de:"der Studierende", pl:"die Studierenden", hint:"masculine noun — declines like an adjective", examples:[{de:"Zehn Studierende besuchen das Seminar.",en:"Ten students attend the seminar."}] },
        { en:"the learner", de:"der Lerner", pl:"die Lerner", hint:"masculine noun — plural unchanged", examples:[{de:"Er ist ein fleißiger Lerner.",en:"He is a diligent learner."}] },

        // Language
        { en:"the foreign language", de:"die Fremdsprache", pl:"die Fremdsprachen", hint:"feminine noun", examples:[{de:"Ich spreche drei Fremdsprachen.",en:"I speak three foreign languages."}] },
        { en:"the pronunciation", de:"die Aussprache", hint:"feminine noun — no plural", examples:[{de:"Ali hat eine gute Aussprache.",en:"Ali has good pronunciation."}] },
        { en:"the dialect", de:"der Dialekt", pl:"die Dialekte", hint:"masculine noun", examples:[{de:"Ich verstehe dich besser, wenn du nicht Dialekt sprichst.",en:"I understand you better when you do not speak dialect."}] },
        { en:"the alphabet", de:"das Alphabet", pl:"die Alphabete", hint:"neuter noun", examples:[{de:"Wie viele Buchstaben hat das Alphabet in Ihrer Sprache?",en:"How many letters does the alphabet have in your language?"}] },
        { en:"the meaning (what a word means)", de:"die Bedeutung", pl:"die Bedeutungen", hint:"feminine noun", examples:[{de:"Das Wort Maus hat inzwischen zwei Bedeutungen.",en:"The word mouse now has two meanings."}] },
        { en:"the handwriting", de:"die Schrift", pl:"die Schriften", hint:"feminine noun", examples:[{de:"Ich kann leider deine Schrift nicht lesen.",en:"Unfortunately I cannot read your handwriting."}] },

        // Working through a text
        { en:"the encyclopaedia", de:"das Lexikon", pl:"die Lexika", hint:"neuter noun — irregular plural", examples:[{de:"Wir könnten im Lexikon nachsehen.",en:"We could look it up in the encyclopaedia."}] },
        { en:"the exercise", de:"die Übung", pl:"die Übungen", hint:"feminine noun", examples:[{de:"Diese Übung war sehr schwer.",en:"This exercise was very difficult."}] },
        { en:"the repetition / the revision", de:"die Wiederholung", pl:"die Wiederholungen", hint:"feminine noun", examples:[{de:"Eine Wiederholung der Prüfung ist möglich.",en:"A repeat of the exam is possible."}] },
        { en:"the explanation", de:"die Erklärung", pl:"die Erklärungen", hint:"feminine noun — from erklären", examples:[{de:"Die Erklärung des Lehrers war sehr klar.",en:"The teacher's explanation was very clear."}] },
        { en:"the introduction (opening part of a course or text)", de:"die Einführung", pl:"die Einführungen", hint:"feminine noun", examples:[{de:"Leider habe ich die Einführung des Kurses verpasst.",en:"Unfortunately I missed the introduction to the course."}] },
        { en:"the chapter", de:"das Kapitel", pl:"die Kapitel", hint:"neuter noun — plural unchanged", examples:[{de:"Die Lehrerin hat gesagt, wir sollen zwei Kapitel im Buch wiederholen.",en:"The teacher said we should revise two chapters in the book."}] },
        { en:"the section (part of a text)", de:"der Abschnitt", pl:"die Abschnitte", hint:"masculine noun", examples:[{de:"Lesen Sie bitte den zweiten Abschnitt.",en:"Please read the second section."}] },
        { en:"the headline / the heading", de:"die Überschrift", pl:"die Überschriften", hint:"feminine noun", examples:[{de:"Der Artikel erschien unter einer langen Überschrift.",en:"The article appeared under a long headline."}] },
        { en:"the line (of text)", de:"die Zeile", pl:"die Zeilen", hint:"feminine noun", examples:[{de:"Das Wort steht in der fünften Zeile von oben.",en:"The word is in the fifth line from the top."}] },

        // Research and science
        { en:"the research (the activity)", de:"die Forschung", pl:"die Forschungen", hint:"feminine noun — scientific work", examples:[{de:"Er arbeitet in der Forschung.",en:"He works in research."}] },
        { en:"the research (looking information up)", de:"die Recherche", pl:"die Recherchen", hint:"feminine noun — a journalist's digging", examples:[{de:"Für diesen Bericht waren viele Recherchen nötig.",en:"A lot of research was necessary for this report."}] },
        { en:"the science", de:"die Wissenschaft", pl:"die Wissenschaften", hint:"feminine noun", examples:[{de:"Vertreter von Kunst und Wissenschaft treffen sich heute in Berlin.",en:"Representatives of art and science are meeting in Berlin today."}] },
        { en:"the scientist", de:"der Wissenschaftler", pl:"die Wissenschaftler", hint:"masculine noun — plural unchanged", examples:[{de:"Er ist Wissenschaftler an der Universität.",en:"He is a scientist at the university."}] },
        { en:"the institute", de:"das Institut", pl:"die Institute", hint:"neuter noun", examples:[{de:"Ich besuche einen Sprachkurs in einem kleinen Sprachinstitut.",en:"I attend a language course at a small language institute."}] },
        { en:"the theory", de:"die Theorie", pl:"die Theorien", hint:"feminine noun", examples:[{de:"Das ist die Theorie. In der Praxis ist vieles ganz anders.",en:"That is the theory. In practice much is quite different."}] },

        // Reading
        { en:"the reader (a person who reads)", de:"der Leser", pl:"die Leser", hint:"masculine noun — plural unchanged", examples:[{de:"Die Leser sind mit der Zeitung zufrieden.",en:"The readers are satisfied with the newspaper."}] },
        { en:"the literature", de:"die Literatur", hint:"feminine noun — no plural", examples:[{de:"Ich interessiere mich für Literatur.",en:"I am interested in literature."}] },
        { en:"the novel", de:"der Roman", pl:"die Romane", hint:"masculine noun", examples:[{de:"Ich lese gern Romane.",en:"I like reading novels."}] },
        { en:"the short story", de:"die Erzählung", pl:"die Erzählungen", hint:"feminine noun — shorter than a Roman", examples:[{de:"Diese Erzählung ist sehr berühmt. Du musst sie lesen.",en:"This short story is very famous. You must read it."}] },
        { en:"the poem", de:"das Gedicht", pl:"die Gedichte", hint:"neuter noun", examples:[{de:"Kennst du ein schönes Gedicht?",en:"Do you know a nice poem?"}] },
        { en:"the fairy tale", de:"das Märchen", pl:"die Märchen", hint:"neuter noun — plural unchanged", examples:[{de:"Meine Großmutter hat uns viele Märchen erzählt.",en:"My grandmother told us many fairy tales."}] },
      ]
    },

    // ── 13. LAW, CRIME & AUTHORITIES ───────────────────────────────
    {
      id: "b1_law", name: "Law, Crime & Authorities", icon: "⚖️",
      words: [

        // Offices and paperwork
        { en:"the public office (a particular one)", de:"das Amt", pl:"die Ämter", hint:"neuter noun — Arbeitsamt, Finanzamt", examples:[{de:"Das Arbeitsamt befindet sich neben dem Busbahnhof.",en:"The employment office is next to the bus station."}] },
        { en:"the authority (an official body in general)", de:"die Behörde", pl:"die Behörden", hint:"feminine noun — the institution as such", examples:[{de:"Sie erhalten ein Schreiben von der zuständigen Behörde.",en:"You will receive a letter from the responsible authority."}] },
        { en:"the application (a form you submit)", de:"der Antrag", pl:"die Anträge", hint:"masculine noun — umlaut plural", examples:[{de:"Haben Sie schon einen Antrag für das Wohngeld ausgefüllt?",en:"Have you already filled in an application for housing benefit?"}] },
        { en:"the official certificate (birth, marriage)", de:"die Urkunde", pl:"die Urkunden", hint:"feminine noun — an official document", examples:[{de:"Wenn wir das Spiel gewinnen, bekommen wir eine Urkunde.",en:"If we win the game we get a certificate."}] },
        { en:"the visa", de:"das Visum", pl:"die Visa", hint:"neuter noun — irregular plural", examples:[{de:"Das Visum ist für drei Monate gültig.",en:"The visa is valid for three months."}] },
        { en:"the consulate", de:"das Konsulat", pl:"die Konsulate", hint:"neuter noun — the smaller office", examples:[{de:"Ein Visum bekommst du auch im Konsulat.",en:"You can also get a visa at the consulate."}] },
        { en:"the embassy", de:"die Botschaft", pl:"die Botschaften", hint:"feminine noun — the main mission, in the capital", examples:[{de:"Das Visum habe ich von der Botschaft bekommen.",en:"I got the visa from the embassy."}] },
        { en:"the asylum", de:"das Asyl", hint:"neuter noun — no plural", examples:[{de:"Die Menschen sind auf der Flucht und bitten um Asyl.",en:"The people are fleeing and are asking for asylum."}] },
        { en:"the marital status (on a form)", de:"der Personenstand", hint:"masculine noun — no plural", examples:[{de:"Bei Personenstand musst du ledig ankreuzen.",en:"Under marital status you have to tick single."}] },
        { en:"the justification (reasons given)", de:"die Begründung", pl:"die Begründungen", hint:"feminine noun — from begründen", examples:[{de:"Die Miete wurde ohne Begründung erhöht.",en:"The rent was raised without any justification."}] },
        { en:"the formal request (telling you to act)", de:"die Aufforderung", pl:"die Aufforderungen", hint:"feminine noun — an official demand", examples:[{de:"Sie erhalten eine Aufforderung, den Betrag bis Juni zu zahlen.",en:"You will receive a formal request to pay the amount by June."}] },

        // Rules and rights
        { en:"the law (a single piece of legislation)", de:"das Gesetz", pl:"die Gesetze", hint:"neuter noun — passed by parliament", examples:[{de:"Das Parlament hat ein neues Gesetz beschlossen.",en:"Parliament passed a new law."}] },
        { en:"the law / the right (the system, or an entitlement)", de:"das Recht", pl:"die Rechte", hint:"neuter noun — the body of law", examples:[{de:"Nach deutschem Recht kann er dafür nicht bestraft werden.",en:"Under German law he cannot be punished for that."}] },
        { en:"the regulation (a rule you must follow)", de:"die Vorschrift", pl:"die Vorschriften", hint:"feminine noun — smaller than a Gesetz", examples:[{de:"Beachten Sie bitte die Vorschriften für das Benutzen der Bibliothek.",en:"Please observe the regulations for using the library."}] },
        { en:"the ban", de:"das Verbot", pl:"die Verbote", hint:"neuter noun — from verbieten", examples:[{de:"Ich bin für das Verbot dieses neuen Videospiels.",en:"I am in favour of a ban on this new video game."}] },
        { en:"the duty (what you are obliged to do)", de:"die Pflicht", pl:"die Pflichten", hint:"feminine noun", examples:[{de:"Als Autofahrer müssen Sie eine Versicherung haben. Das ist Pflicht.",en:"As a driver you must have insurance. That is a duty."}] },
        { en:"the responsibility", de:"die Verantwortung", hint:"feminine noun — no plural", examples:[{de:"Sie tragen die Verantwortung für Ihre Kinder.",en:"You bear the responsibility for your children."}] },
        { en:"the entitlement (a claim you can make)", de:"der Anspruch", pl:"die Ansprüche", hint:"masculine noun — Anspruch auf etwas haben", examples:[{de:"Sie wohnen im Stadtzentrum. Deshalb haben Sie keinen Anspruch auf Fahrgeld.",en:"You live in the city centre. That is why you have no entitlement to travel money."}] },
        { en:"the demand (what one side insists on)", de:"die Forderung", pl:"die Forderungen", hint:"feminine noun — from fordern", examples:[{de:"Alle Forderungen der Arbeitnehmer kann man in dieser E-Mail lesen.",en:"All the employees' demands can be read in this email."}] },
        { en:"the precondition", de:"die Voraussetzung", pl:"die Voraussetzungen", hint:"feminine noun — must be true first", examples:[{de:"Gesunde Ernährung ist die Voraussetzung für ein langes Leben.",en:"Healthy nutrition is the precondition for a long life."}] },

        // Court
        { en:"the trial (the court proceedings)", de:"der Prozess", pl:"die Prozesse", hint:"masculine noun", examples:[{de:"Der Prozess wird direkt aus dem Gerichtssaal im Fernsehen übertragen.",en:"The trial is broadcast live from the courtroom on television."}] },
        { en:"the verdict / the judgement", de:"das Urteil", pl:"die Urteile", hint:"neuter noun — also a personal opinion", examples:[{de:"Dein Urteil ist für mich sehr wichtig.",en:"Your judgement is very important to me."}] },
        { en:"the punishment / the fine", de:"die Strafe", pl:"die Strafen", hint:"feminine noun", examples:[{de:"Schwarzfahren kostet 60 Euro Strafe.",en:"Fare-dodging costs a 60-euro fine."}] },
        { en:"the parking ticket", de:"der Strafzettel", pl:"die Strafzettel", hint:"masculine noun — plural unchanged", examples:[{de:"So ein Pech! Ich habe einmal falsch geparkt und sofort einen Strafzettel bekommen.",en:"What bad luck! I parked wrongly once and immediately got a parking ticket."}] },
        { en:"the proof / the evidence", de:"der Beweis", pl:"die Beweise", hint:"masculine noun", examples:[{de:"Haben Sie dafür Beweise?",en:"Do you have evidence for that?"}] },
        { en:"the witness", de:"der Zeuge", pl:"die Zeugen", hint:"masculine noun — n-declension", examples:[{de:"Die Polizei sucht noch Zeugen für den Unfall.",en:"The police are still looking for witnesses to the accident."}] },
        { en:"the check / the inspection", de:"die Kontrolle", pl:"die Kontrollen", hint:"feminine noun", examples:[{de:"An den Grenzen gibt es kaum noch Kontrollen.",en:"There are hardly any checks at the borders any more."}] },
        { en:"the prison", de:"das Gefängnis", pl:"die Gefängnisse", hint:"neuter noun", examples:[{de:"Er wurde zu fünf Jahren Gefängnis verurteilt.",en:"He was sentenced to five years in prison."}] },

        // Crime
        { en:"the perpetrator (whoever did it)", de:"der Täter", pl:"die Täter", hint:"masculine noun — the neutral legal term", examples:[{de:"Die Polizei hat den Täter endlich gefasst.",en:"The police finally caught the perpetrator."}] },
        { en:"the criminal", de:"der Verbrecher", pl:"die Verbrecher", hint:"masculine noun — plural unchanged", examples:[{de:"Die Polizei hat den Verbrecher verhaftet.",en:"The police arrested the criminal."}] },
        { en:"the thief", de:"der Dieb", pl:"die Diebe", hint:"masculine noun — steals without breaking in", examples:[{de:"Ein Dieb hat mir auf dem Markt die Tasche gestohlen.",en:"A thief stole my bag at the market."}] },
        { en:"the burglar", de:"der Einbrecher", pl:"die Einbrecher", hint:"masculine noun — breaks into buildings", examples:[{de:"Die Einbrecher haben nichts gestohlen.",en:"The burglars stole nothing."}] },
        { en:"the burglary", de:"der Einbruch", pl:"die Einbrüche", hint:"masculine noun — umlaut plural", examples:[{de:"In der Urlaubszeit gibt es viele Wohnungseinbrüche.",en:"During the holiday season there are many break-ins."}] },
        { en:"the violence", de:"die Gewalt", hint:"feminine noun", examples:[{de:"Ich mag keine Filme, in denen Gewalt vorkommt.",en:"I do not like films in which violence occurs."}] },
        { en:"the criminal investigation department", de:"die Kriminalpolizei", hint:"feminine noun — no plural", examples:[{de:"Die Kriminalpolizei untersucht den Fall.",en:"The criminal investigation department is investigating the case."}] },

        // Verbs that belong to this topic
        { en:"to report (notify an authority)", de:"melden", hint:"verb regular · meldete · hat gemeldet", examples:[{de:"Sie müssen den Unfall der Versicherung melden.",en:"You have to report the accident to the insurance company."}] },
      ]
    },

    // ── 14. POLITICS, SOCIETY & EVENTS ─────────────────────────────
    {
      id: "b1_politics", name: "Politics, Society & Events", icon: "🏛️",
      words: [

        // Politics
        { en:"the politics", de:"die Politik", hint:"feminine noun — no plural", examples:[{de:"Ich interessiere mich nicht für Politik.",en:"I am not interested in politics."}] },
        { en:"the politician", de:"der Politiker", pl:"die Politiker", hint:"masculine noun — plural unchanged", examples:[{de:"Weißt du, wie dieser Politiker heißt?",en:"Do you know what this politician is called?"}] },
        { en:"the choice / the election", de:"die Wahl", pl:"die Wahlen", hint:"feminine noun — both senses", examples:[{de:"Sie haben die Wahl: mit Vollpension oder Halbpension?",en:"You have the choice: with full board or half board?"}] },
        { en:"the speech", de:"die Rede", pl:"die Reden", hint:"feminine noun — eine Rede halten", examples:[{de:"Der Präsident hat eine Rede gehalten.",en:"The president gave a speech."}] },
        { en:"the protest", de:"der Protest", pl:"die Proteste", hint:"masculine noun", examples:[{de:"Alle Proteste haben nichts genützt.",en:"All the protests were of no use."}] },
        { en:"the assembly / the gathering", de:"die Versammlung", pl:"die Versammlungen", hint:"feminine noun", examples:[{de:"Der Minister hielt bei der Versammlung eine Rede.",en:"The minister gave a speech at the assembly."}] },
        { en:"the criticism", de:"die Kritik", pl:"die Kritiken", hint:"feminine noun", examples:[{de:"Es gibt viel Kritik an der Politik der Regierung.",en:"There is a lot of criticism of the government's policy."}] },
        { en:"the discussion", de:"die Diskussion", pl:"die Diskussionen", hint:"feminine noun", examples:[{de:"Im Fernsehen gab es eine Diskussion zum Thema Kinderbetreuung.",en:"On television there was a discussion on the subject of childcare."}] },
        { en:"the survey / the opinion poll", de:"die Umfrage", pl:"die Umfragen", hint:"feminine noun", examples:[{de:"Wir machen eine Umfrage zum Thema Umweltschutz.",en:"We are conducting a survey on the subject of environmental protection."}] },
        { en:"the freedom", de:"die Freiheit", hint:"feminine noun", examples:[{de:"Wir wollen die Freiheit haben, unsere Meinung sagen zu können.",en:"We want the freedom to be able to say our opinion."}] },
        { en:"the general public", de:"die Öffentlichkeit", hint:"feminine noun — no plural", examples:[{de:"Von solchen Dingen erfährt die Öffentlichkeit nur selten.",en:"The general public rarely learns about such things."}] },
        { en:"the organisation", de:"die Organisation", pl:"die Organisationen", hint:"feminine noun — also the act of organising", examples:[{de:"Die Organisation des Festes war sehr gut.",en:"The organisation of the party was very good."}] },
        { en:"the king", de:"der König", pl:"die Könige", hint:"masculine noun", examples:[{de:"Der spanische König ist in Deutschland zu Besuch.",en:"The Spanish king is visiting Germany."}] },
        { en:"the god", de:"der Gott", pl:"die Götter", hint:"masculine noun — umlaut plural", examples:[{de:"Glaubst du an Gott?",en:"Do you believe in God?"}] },
        { en:"the tradition", de:"die Tradition", pl:"die Traditionen", hint:"feminine noun", examples:[{de:"Eine große Hochzeit mit vielen Leuten ist bei uns Tradition.",en:"A big wedding with lots of people is a tradition with us."}] },

        // Conflict and safety
        { en:"the war", de:"der Krieg", pl:"die Kriege", hint:"masculine noun", examples:[{de:"Es herrscht noch immer Krieg in diesem Land.",en:"There is still war in this country."}] },
        { en:"the peace", de:"der Frieden", hint:"masculine noun — no plural", examples:[{de:"Endlich ist hier Frieden!",en:"At last there is peace here!"}] },
        { en:"the fight / the struggle", de:"der Kampf", pl:"die Kämpfe", hint:"masculine noun — umlaut plural", examples:[{de:"Im Schulbus gibt es immer einen Kampf um die Sitzplätze.",en:"On the school bus there is always a fight over the seats."}] },
        { en:"the victory", de:"der Sieg", pl:"die Siege", hint:"masculine noun", examples:[{de:"Unsere Mannschaft hat gewonnen. Wir freuen uns über den Sieg.",en:"Our team won. We are delighted with the victory."}] },
        { en:"the winner", de:"der Sieger", pl:"die Sieger", hint:"masculine noun — plural unchanged", examples:[{de:"Wer hat gewonnen? Wie heißt der Sieger?",en:"Who won? What is the winner called?"}] },
        { en:"the loser", de:"der Verlierer", pl:"die Verlierer", hint:"masculine noun — plural unchanged", examples:[{de:"Er ist ein guter Verlierer.",en:"He is a good loser."}] },
        { en:"the border", de:"die Grenze", pl:"die Grenzen", hint:"feminine noun", examples:[{de:"An der Grenze musst du deinen Ausweis zeigen.",en:"At the border you have to show your ID."}] },
        { en:"the safety / the security", de:"die Sicherheit", hint:"feminine noun", examples:[{de:"Sicherheit ist für mich sehr wichtig.",en:"Safety is very important to me."}] },
        { en:"the protection", de:"der Schutz", hint:"masculine noun — no plural", examples:[{de:"Das ist ein guter Schutz gegen Kälte.",en:"That is good protection against the cold."}] },

        // When things go wrong
        { en:"the crisis", de:"die Krise", pl:"die Krisen", hint:"feminine noun", examples:[{de:"Die Wirtschaft steckt in einer schweren Krise.",en:"The economy is in a severe crisis."}] },
        { en:"the disaster", de:"die Katastrophe", pl:"die Katastrophen", hint:"feminine noun", examples:[{de:"Der Urlaub war eine Katastrophe. Es hat nur geregnet.",en:"The holiday was a disaster. It only rained."}] },
        { en:"the accident / the misfortune", de:"das Unglück", pl:"die Unglücke", hint:"neuter noun — also plain bad luck", examples:[{de:"Bei dem Unglück gab es viele Verletzte.",en:"There were many injured in the accident."}] },
        { en:"the news item / the announcement", de:"die Meldung", pl:"die Meldungen", hint:"feminine noun — one report on radio or TV", examples:[{de:"Hast du die Meldung im Radio gehört? Es wird starken Sturm geben.",en:"Did you hear the announcement on the radio? There will be a strong storm."}] },

        // Places on the map
        { en:"the region", de:"die Region", pl:"die Regionen", hint:"feminine noun — a named part of a country", examples:[{de:"In der Rhein-Main-Region sind die Mieten sehr hoch.",en:"In the Rhine-Main region the rents are very high."}] },
        { en:"the area / the territory", de:"das Gebiet", pl:"die Gebiete", hint:"neuter noun — a stretch of land", examples:[{de:"In diesem Gebiet gibt es kaum Industrie.",en:"In this area there is hardly any industry."}] },
        { en:"the metropolis", de:"die Metropole", pl:"die Metropolen", hint:"feminine noun — a major city", examples:[{de:"Berlin und Wien sind Metropolen.",en:"Berlin and Vienna are metropolises."}] },

        // Verbs that belong to this topic
        { en:"to fight (for a cause, + für)", de:"kämpfen", hint:"verb regular · kämpfte · hat gekämpft", examples:[{de:"Die Frauen kämpfen für mehr Rechte.",en:"The women are fighting for more rights."}] },
      ]
    },

    // ── 15. MEDIA, INTERNET & TECHNOLOGY ───────────────────────────
    {
      id: "b1_media", name: "Media, Internet & Technology", icon: "💻",
      words: [

        // The press and broadcasting
        { en:"the media", de:"die Medien", hint:"plural noun only", examples:[{de:"Umweltschutz ist in den Medien ein großes Thema.",en:"Environmental protection is a big topic in the media."}] },
        { en:"the press", de:"die Presse", hint:"feminine noun — no plural", examples:[{de:"Darüber konnte sich jeder in der Presse informieren.",en:"Everyone could inform themselves about that in the press."}] },
        { en:"the magazine", de:"das Magazin", pl:"die Magazine", hint:"neuter noun", examples:[{de:"Jugendliche lesen dieses Magazin gern.",en:"Young people like reading this magazine."}] },
        { en:"the channel / the broadcaster", de:"der Sender", pl:"die Sender", hint:"masculine noun — plural unchanged", examples:[{de:"Welchen Sender siehst du am liebsten?",en:"Which channel do you like watching most?"}] },
        { en:"the TV series", de:"die Serie", pl:"die Serien", hint:"feminine noun", examples:[{de:"Meine Tochter liebt es, im Fernsehen Serien zu schauen.",en:"My daughter loves watching series on television."}] },
        { en:"the documentary report", de:"die Reportage", pl:"die Reportagen", hint:"feminine noun — a filmed or written feature", examples:[{de:"Hast du die Reportage über Afrika gesehen?",en:"Did you see the documentary about Africa?"}] },
        { en:"the report (an account of something)", de:"der Bericht", pl:"die Berichte", hint:"masculine noun — the plain word", examples:[{de:"Ich habe gestern einen interessanten Bericht gelesen.",en:"Yesterday I read an interesting report."}] },
        { en:"the reporter", de:"der Reporter", pl:"die Reporter", hint:"masculine noun — plural unchanged", examples:[{de:"Der Reporter macht gerade ein Interview.",en:"The reporter is doing an interview right now."}] },
        { en:"the publishing house", de:"der Verlag", pl:"die Verlage", hint:"masculine noun", examples:[{de:"Von welchem Verlag ist dieses Buch?",en:"Which publishing house is this book from?"}] },
        { en:"the writer / the author", de:"der Schriftsteller", pl:"die Schriftsteller", hint:"masculine noun — plural unchanged", examples:[{de:"Kennst du diesen Schriftsteller? Ich liebe seine Bücher.",en:"Do you know this writer? I love his books."}] },
        { en:"the listener (radio)", de:"der Hörer", pl:"die Hörer", hint:"masculine noun — also a telephone receiver", examples:[{de:"Die Sendung hat viele Hörer.",en:"The programme has many listeners."}] },
        { en:"the piece of news", de:"die Neuigkeit", pl:"die Neuigkeiten", hint:"feminine noun", examples:[{de:"In dieser Sache gibt es keine Neuigkeiten.",en:"There is no news in this matter."}] },

        // Screens and computers
        { en:"the screen (the display surface)", de:"der Bildschirm", pl:"die Bildschirme", hint:"masculine noun — what you look at", examples:[{de:"Ich brauche einen größeren Bildschirm für meinen Computer.",en:"I need a bigger screen for my computer."}] },
        { en:"the monitor (the device on the desk)", de:"der Monitor", pl:"die Monitore", hint:"masculine noun — the physical unit", examples:[{de:"Ich habe mir einen größeren Monitor gekauft. Das ist besser für meine Augen.",en:"I bought a bigger monitor. That is better for my eyes."}] },
        { en:"the computer (the German word)", de:"der Rechner", pl:"die Rechner", hint:"masculine noun — native word for Computer", examples:[{de:"Mein Rechner ist kaputt.",en:"My computer is broken."}] },
        { en:"the keyboard", de:"die Tastatur", pl:"die Tastaturen", hint:"feminine noun — the whole keyboard", examples:[{de:"Die Tastatur an meinem Computer ist ganz neu.",en:"The keyboard on my computer is brand new."}] },
        { en:"the key / the button (one on a device)", de:"die Taste", pl:"die Tasten", hint:"feminine noun — a single key", examples:[{de:"An der Fernbedienung ist eine Taste kaputt.",en:"One key on the remote control is broken."}] },
        { en:"the click", de:"der Klick", pl:"die Klicks", hint:"masculine noun", examples:[{de:"Um das Wort zu markieren, genügt ein Doppelklick.",en:"To select the word, a double click is enough."}] },
        { en:"the hard disk", de:"die Festplatte", pl:"die Festplatten", hint:"feminine noun", examples:[{de:"Mein Computer hat eine große Festplatte.",en:"My computer has a large hard disk."}] },
        { en:"the drive (in a computer)", de:"das Laufwerk", pl:"die Laufwerke", hint:"neuter noun", examples:[{de:"Für meinen Computer habe ich mir ein neues Laufwerk gekauft.",en:"I bought a new drive for my computer."}] },
        { en:"the network (mobile or computer coverage)", de:"das Netz", pl:"die Netze", hint:"neuter noun — also a physical net", examples:[{de:"Hier im Keller habe ich kein Netz.",en:"Down here in the cellar I have no network."}] },
        { en:"the network (a set of connected people or machines)", de:"das Netzwerk", pl:"die Netzwerke", hint:"neuter noun — soziale Netzwerke", examples:[{de:"Soziale Netzwerke sind wichtig.",en:"Social networks are important."}] },
        { en:"the online forum", de:"das Forum", pl:"die Foren", hint:"neuter noun — irregular plural", examples:[{de:"Ich melde mich heute bei diesem Forum an.",en:"I am registering with this forum today."}] },
        { en:"the access", de:"der Zugang", pl:"die Zugänge", hint:"masculine noun — umlaut plural", examples:[{de:"Der Zugang zu diesem Haus ist schwierig.",en:"Access to this house is difficult."}] },

        // Phones
        { en:"the voicemail box", de:"die Mobilbox", pl:"die Mobilboxen", hint:"feminine noun", examples:[{de:"Ich habe zwei Nachrichten auf meiner Mobilbox.",en:"I have two messages on my voicemail."}] },
        { en:"the phone number (the formal word)", de:"die Rufnummer", pl:"die Rufnummern", hint:"feminine noun — used on forms", examples:[{de:"Wir möchten Sie gerne anrufen. Wie ist Ihre Rufnummer?",en:"We would like to call you. What is your phone number?"}] },
        { en:"the communication", de:"die Kommunikation", hint:"feminine noun — no plural", examples:[{de:"Die Kommunikation zwischen den Abteilungen ist gut.",en:"Communication between the departments is good."}] },

        // Content
        { en:"the contents (what is inside)", de:"der Inhalt", pl:"die Inhalte", hint:"masculine noun", examples:[{de:"Geben Sie den Inhalt der Packung in einen Liter kochendes Wasser.",en:"Put the contents of the packet into a litre of boiling water."}] },
        { en:"the detail supplied (name, address, date)", de:"die Angabe", pl:"die Angaben", hint:"feminine noun — usually plural", examples:[{de:"Wir brauchen von Ihnen folgende Angaben: Name, Adresse, Geburtsdatum.",en:"We need the following details from you: name, address, date of birth."}] },
        { en:"the data", de:"die Daten", hint:"plural noun only", examples:[{de:"Wir haben alle Ihre Daten im Computer.",en:"We have all your data in the computer."}] },
        { en:"the document (a paper or a file)", de:"das Dokument", pl:"die Dokumente", hint:"neuter noun", examples:[{de:"Hast du alle Dokumente für die Anmeldung dabei?",en:"Do you have all the documents for the registration with you?"}] },
        { en:"the original (as opposed to the copy)", de:"das Original", pl:"die Originale", hint:"neuter noun", examples:[{de:"Das Original ist für Sie. Wir bekommen die Kopie.",en:"The original is for you. We get the copy."}] },
        { en:"the description", de:"die Beschreibung", pl:"die Beschreibungen", hint:"feminine noun — from beschreiben", examples:[{de:"Eine Beschreibung des Geräts liegt bei.",en:"A description of the device is enclosed."}] },
        { en:"the account / the portrayal (how something is presented)", de:"die Darstellung", pl:"die Darstellungen", hint:"feminine noun — the way it is set out", examples:[{de:"Ihr Buch enthält eine klare Darstellung dieser Probleme.",en:"Your book contains a clear account of these problems."}] },
        { en:"the recording", de:"die Aufnahme", pl:"die Aufnahmen", hint:"feminine noun — from aufnehmen", examples:[{de:"Bitte seid leise! – Ich starte die Aufnahme.",en:"Please be quiet! – I'm starting the recording."}] },
        { en:"the video", de:"das Video", pl:"die Videos", hint:"neuter noun", examples:[{de:"Ich habe den Film auf Video aufgenommen.",en:"I recorded the film on video."}] },
        { en:"the cassette", de:"die Kassette", pl:"die Kassetten", hint:"feminine noun", examples:[{de:"Meine Eltern besitzen noch viele Musikkassetten.",en:"My parents still own many music cassettes."}] },
        { en:"the chart / the graphic", de:"die Grafik", pl:"die Grafiken", hint:"feminine noun", examples:[{de:"Die Grafik zeigt die Temperaturen im letzten Jahr.",en:"The chart shows the temperatures over the past year."}] },
        { en:"the drawing", de:"die Zeichnung", pl:"die Zeichnungen", hint:"feminine noun — from zeichnen", examples:[{de:"Das ist eine schöne Zeichnung.",en:"That is a lovely drawing."}] },
        { en:"the sign / the signal", de:"das Zeichen", pl:"die Zeichen", hint:"neuter noun — plural unchanged", examples:[{de:"Bitte fangen Sie erst an, wenn ich Ihnen ein Zeichen gebe.",en:"Please do not start until I give you a sign."}] },
        { en:"the symbol", de:"das Symbol", pl:"die Symbole", hint:"neuter noun", examples:[{de:"Das Herz ist ein Symbol für die Liebe.",en:"The heart is a symbol of love."}] },

        // Technology and energy
        { en:"the technology (practical, the machines)", de:"die Technik", pl:"die Techniken", hint:"feminine noun — the equipment and know-how", examples:[{de:"Ich verstehe nicht viel von Technik.",en:"I do not understand much about technology."}] },
        { en:"the technology (the field of advanced development)", de:"die Technologie", pl:"die Technologien", hint:"feminine noun — the scientific field", examples:[{de:"Große Fortschritte gab es in der Technologie.",en:"There were great advances in technology."}] },
        { en:"the invention", de:"die Erfindung", pl:"die Erfindungen", hint:"feminine noun — from erfinden", examples:[{de:"Die Erfindung des Buchdrucks war sehr wichtig für die Menschen.",en:"The invention of printing was very important for people."}] },
        { en:"the energy", de:"die Energie", pl:"die Energien", hint:"feminine noun", examples:[{de:"Wir müssen Energie sparen.",en:"We have to save energy."}] },
        { en:"the power station", de:"das Kraftwerk", pl:"die Kraftwerke", hint:"neuter noun", examples:[{de:"Die Menschen protestieren gegen das Kraftwerk.",en:"The people are protesting against the power station."}] },
      ]
    },

    // ── 16. TRANSPORT, TRAFFIC & TRAVEL ────────────────────────────
    {
      id: "b1_transport", name: "Transport, Traffic & Travel", icon: "🚆",
      words: [

        // Vehicles
        { en:"the vehicle (any means of transport)", de:"das Fahrzeug", pl:"die Fahrzeuge", hint:"neuter noun — the general word", examples:[{de:"Wem gehört das Fahrzeug?",en:"Who does the vehicle belong to?"}] },
        { en:"the motor vehicle (the official term)", de:"das Kraftfahrzeug", pl:"die Kraftfahrzeuge", hint:"neuter noun — engine-driven, abbreviated Kfz", examples:[{de:"Auf dieser Straße sind Kraftfahrzeuge nicht erlaubt.",en:"Motor vehicles are not allowed on this road."}] },
        { en:"the lorry", de:"der Laster", pl:"die Laster", hint:"masculine noun — short for Lastwagen", examples:[{de:"Auf der Autobahn waren so viele Laster. Deshalb hat es so lange gedauert.",en:"There were so many lorries on the motorway. That is why it took so long."}] },
        { en:"the motorbike", de:"das Motorrad", pl:"die Motorräder", hint:"neuter noun — umlaut plural", examples:[{de:"Oskar fährt jeden Tag mit dem Motorrad zur Arbeit.",en:"Oskar rides his motorbike to work every day."}] },
        { en:"the wheel", de:"das Rad", pl:"die Räder", hint:"neuter noun — umlaut plural, also short for Fahrrad", examples:[{de:"Ich bin durch Glas gefahren und jetzt ist mein Rad kaputt.",en:"I drove through glass and now my wheel is broken."}] },
        { en:"the boat", de:"das Boot", pl:"die Boote", hint:"neuter noun", examples:[{de:"An diesem See kann man Boote mieten.",en:"You can hire boats at this lake."}] },
        { en:"the ferry", de:"die Fähre", pl:"die Fähren", hint:"feminine noun", examples:[{de:"Wir nehmen die Fähre über den Bodensee.",en:"We are taking the ferry across Lake Constance."}] },
        { en:"the railway (the system)", de:"die Eisenbahn", pl:"die Eisenbahnen", hint:"feminine noun", examples:[{de:"Die Kinder wünschen sich eine elektrische Eisenbahn.",en:"The children want an electric railway."}] },
        { en:"the underground", de:"die U-Bahn", pl:"die U-Bahnen", hint:"feminine noun", examples:[{de:"Die letzte U-Bahn geht um 23.15 Uhr.",en:"The last underground train goes at 11.15 p.m."}] },

        // Road users
        { en:"the cyclist", de:"der Radfahrer", pl:"die Radfahrer", hint:"masculine noun — plural unchanged", examples:[{de:"Achtung! Da kommt ein Radfahrer.",en:"Watch out! A cyclist is coming."}] },
        { en:"the pedestrian", de:"der Fußgänger", pl:"die Fußgänger", hint:"masculine noun — plural unchanged", examples:[{de:"Dieser Weg ist nur für Fußgänger.",en:"This path is only for pedestrians."}] },
        { en:"the pedestrian zone", de:"die Fußgängerzone", pl:"die Fußgängerzonen", hint:"feminine noun", examples:[{de:"Wir treffen uns um 15 Uhr in der Fußgängerzone.",en:"We are meeting at 3 p.m. in the pedestrian zone."}] },
        { en:"the passenger (on a plane or ship)", de:"der Passagier", pl:"die Passagiere", hint:"masculine noun", examples:[{de:"Die Passagiere Schulz und Kaufmann sollen bitte zur Information kommen.",en:"Would passengers Schulz and Kaufmann please come to the information desk."}] },

        // The road
        { en:"the one-way street", de:"die Einbahnstraße", pl:"die Einbahnstraßen", hint:"feminine noun", examples:[{de:"Die Goethestraße ist jetzt eine Einbahnstraße.",en:"Goethestraße is now a one-way street."}] },
        { en:"the carriageway (the road surface itself)", de:"die Fahrbahn", pl:"die Fahrbahnen", hint:"feminine noun", examples:[{de:"Fahren Sie bitte vorsichtig. Es sind Kühe auf der Fahrbahn.",en:"Please drive carefully. There are cows on the carriageway."}] },
        { en:"the lane (one of several on a road)", de:"die Spur", pl:"die Spuren", hint:"feminine noun", examples:[{de:"Fahren Sie bitte auf der linken Spur, wenn Sie schneller fahren.",en:"Please drive in the left lane if you are driving faster."}] },
        { en:"the bend", de:"die Kurve", pl:"die Kurven", hint:"feminine noun", examples:[{de:"Fahr bitte nicht so schnell in die Kurven.",en:"Please do not drive so fast into the bends."}] },
        { en:"the route / the stretch", de:"die Strecke", pl:"die Strecken", hint:"feminine noun", examples:[{de:"Sind Sie die ganze Strecke zu Fuß gegangen?",en:"Did you walk the whole stretch?"}] },
        { en:"the diversion", de:"die Umleitung", pl:"die Umleitungen", hint:"feminine noun", examples:[{de:"Es gibt wegen des Unfalls eine Umleitung.",en:"There is a diversion because of the accident."}] },
        { en:"the exit (from a motorway or car park)", de:"die Ausfahrt", pl:"die Ausfahrten", hint:"feminine noun — driving out", examples:[{de:"Hier ist eine Ausfahrt, da dürfen Sie nicht parken.",en:"This is an exit, you may not park here."}] },
        { en:"the entrance (for vehicles)", de:"die Einfahrt", pl:"die Einfahrten", hint:"feminine noun — driving in", examples:[{de:"Da parkt wieder jemand vor unserer Einfahrt.",en:"Someone is parking in front of our entrance again."}] },
        { en:"the right of way", de:"die Vorfahrt", hint:"feminine noun — no plural", examples:[{de:"Achtung! Das Auto rechts hat Vorfahrt!",en:"Watch out! The car on the right has right of way!"}] },
        { en:"the road sign", de:"das Verkehrszeichen", pl:"die Verkehrszeichen", hint:"neuter noun — plural unchanged", examples:[{de:"Meine Kinder lernen in der Schule gerade die Verkehrszeichen.",en:"My children are currently learning the road signs at school."}] },
        { en:"the number plate", de:"das Kennzeichen", pl:"die Kennzeichen", hint:"neuter noun — plural unchanged", examples:[{de:"Das Auto hat ein Schweizer Kennzeichen.",en:"The car has a Swiss number plate."}] },
        { en:"the traffic jam", de:"der Stau", pl:"die Staus", hint:"masculine noun", examples:[{de:"Auf der A3 gibt es wegen eines Unfalls 5 km Stau.",en:"On the A3 there is a 5 km traffic jam because of an accident."}] },

        // Driving
        { en:"the speed (how fast, measured)", de:"die Geschwindigkeit", pl:"die Geschwindigkeiten", hint:"feminine noun — the technical word", examples:[{de:"Das Auto fuhr mit zu hoher Geschwindigkeit.",en:"The car was driving at too high a speed."}] },
        { en:"the speed limit (as a number on a sign)", de:"das Tempo", hint:"neuter noun — Tempo 30", examples:[{de:"Hier darfst du nur Tempo 30 fahren.",en:"Here you may only drive at 30."}] },
        { en:"the brake", de:"die Bremse", pl:"die Bremsen", hint:"feminine noun", examples:[{de:"Du musst unbedingt die Bremsen kontrollieren lassen.",en:"You really must have the brakes checked."}] },
        { en:"the petrol", de:"das Benzin", hint:"neuter noun — no plural", examples:[{de:"Das Benzin soll wieder teurer werden.",en:"Petrol is said to be getting more expensive again."}] },
        { en:"the petrol station", de:"die Tankstelle", pl:"die Tankstellen", hint:"feminine noun", examples:[{de:"Wo ist die nächste Tankstelle?",en:"Where is the nearest petrol station?"}] },

        // Stations and stops
        { en:"the main station", de:"der Hauptbahnhof", pl:"die Hauptbahnhöfe", hint:"masculine noun — umlaut plural", examples:[{de:"Treffen wir uns am Hauptbahnhof?",en:"Shall we meet at the main station?"}] },
        { en:"the stop (a train or bus stopping)", de:"der Halt", hint:"masculine noun — the act of stopping", examples:[{de:"Nächster Halt ist am Südbahnhof.",en:"The next stop is at the south station."}] },
        { en:"the route number (of a bus or tram)", de:"die Linie", pl:"die Linien", hint:"feminine noun — die Linie 8", examples:[{de:"Zum Hauptbahnhof können Sie mit der Linie 8 fahren.",en:"You can take the number 8 to the main station."}] },
        { en:"the emergency exit", de:"der Notausgang", pl:"die Notausgänge", hint:"masculine noun — umlaut plural", examples:[{de:"Der Notausgang ist gleich hier bei der Treppe.",en:"The emergency exit is right here by the stairs."}] },
        { en:"the meeting point", de:"der Treffpunkt", pl:"die Treffpunkte", hint:"masculine noun", examples:[{de:"Unser Treffpunkt ist um 17 Uhr am Hauptbahnhof.",en:"Our meeting point is at 5 p.m. at the main station."}] },
        { en:"the harbour", de:"der Hafen", pl:"die Häfen", hint:"masculine noun — umlaut plural", examples:[{de:"Wenn du in Hamburg bist, musst du dir unbedingt den Hafen ansehen.",en:"When you are in Hamburg you really must see the harbour."}] },
        { en:"the landing (of a plane)", de:"die Landung", pl:"die Landungen", hint:"feminine noun", examples:[{de:"Bei der Landung müssen Sie sich anschnallen.",en:"During the landing you have to fasten your seatbelt."}] },
        { en:"the cabin / the booth", de:"die Kabine", pl:"die Kabinen", hint:"feminine noun — a small closed space", examples:[{de:"Um zu wählen, gehen Sie bitte in diese Kabine.",en:"To vote, please go into this booth."}] },

        // Journeys
        { en:"the round trip / the sightseeing tour", de:"die Rundfahrt", pl:"die Rundfahrten", hint:"feminine noun — you come back where you started", examples:[{de:"Am zweiten Tag haben wir eine Rundfahrt durch den Hafen gemacht.",en:"On the second day we took a tour around the harbour."}] },
        { en:"the return journey", de:"die Rückfahrt", pl:"die Rückfahrten", hint:"feminine noun — the way back", examples:[{de:"Auf der Rückfahrt besuche ich meine Eltern.",en:"On the return journey I am visiting my parents."}] },
        { en:"the transport (moving goods)", de:"der Transport", pl:"die Transporte", hint:"masculine noun", examples:[{de:"Was kostet der Transport?",en:"What does the transport cost?"}] },
        { en:"the distance (how far away something is)", de:"die Entfernung", pl:"die Entfernungen", hint:"feminine noun — the everyday word", examples:[{de:"Aus dieser Entfernung ist das nicht zu erkennen.",en:"From this distance you cannot make it out."}] },
        { en:"the distance (a span to be covered, technical)", de:"die Distanz", pl:"die Distanzen", hint:"feminine noun — the Latin-rooted twin of Entfernung", examples:[{de:"Diese Firma transportiert Waren auch über große Distanzen.",en:"This company also transports goods over great distances."}] },
        { en:"the reservation", de:"die Reservierung", pl:"die Reservierungen", hint:"feminine noun", examples:[{de:"Was kostet eine Reservierung?",en:"What does a reservation cost?"}] },
        { en:"the overnight stay", de:"die Übernachtung", pl:"die Übernachtungen", hint:"feminine noun", examples:[{de:"In diesem Hotel kostet die Übernachtung mit Frühstück 90 Euro.",en:"In this hotel the overnight stay with breakfast costs 90 euros."}] },
        { en:"the guest house", de:"die Pension", pl:"die Pensionen", hint:"feminine noun — smaller than a hotel", examples:[{de:"Im Urlaub haben wir in einer kleinen Pension gewohnt.",en:"On holiday we stayed in a small guest house."}] },
        { en:"the season (the busy time of year)", de:"die Saison", pl:"die Saisons", hint:"feminine noun — for tourism or trade", examples:[{de:"Urlaub in den Schulferien ist immer teurer. Das ist die Saison mit den höchsten Preisen.",en:"Holidays in the school break are always dearer. That is the season with the highest prices."}] },
        { en:"the tourism", de:"der Tourismus", hint:"masculine noun — no plural", examples:[{de:"In dieser Gegend gibt es viel Tourismus.",en:"There is a lot of tourism in this area."}] },
        { en:"the souvenir", de:"das Souvenir", pl:"die Souvenirs", hint:"neuter noun", examples:[{de:"Ich habe ein paar Souvenirs aus dem Urlaub mitgebracht.",en:"I brought a few souvenirs back from the holiday."}] },

        // Verbs that belong to this topic
        { en:"to brake", de:"bremsen", hint:"verb regular · bremste · hat gebremst", examples:[{de:"Der Mann ist plötzlich über die Straße gegangen. Ich musste stark bremsen.",en:"The man suddenly walked across the road. I had to brake hard."}] },
      ]
    },

  ]
};
