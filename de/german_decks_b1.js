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

  ]
};
