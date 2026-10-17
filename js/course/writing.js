// The writing journal: free-writing prompts, our own. A prompt asks for at
// least `min` words on an everyday situation (the fide topics of life in
// Switzerland); what I write is saved, never graded here, and goes into
// the learning log for a tutor (Claude) to correct.
//   { id, lv: "A1" | "A2" | "B1", t: the situation (English), de: a title,
//     help: a few starters, min?: words (else by level), sec?: only once
//     this section is done (it practises that section's grammar) }
// Later packs may add their own with cxJournal([...]).
cxJournal([
  // ── A1 · about 30 words ──
  { id: "w.me", lv: "A1", de: "Über mich", t: "Introduce yourself: your name, where you come from, where you live now, your work, and what you like.", help: ["Ich heiße …", "Ich komme aus …", "Ich wohne in …", "Ich arbeite als …"] },
  { id: "w.flat", lv: "A1", de: "Meine Wohnung", t: "Describe your flat: the rooms, what it has — and what it doesn't have.", help: ["Meine Wohnung hat …", "Es gibt …", "Wir haben keinen …", "Die Küche ist nicht …"], sec: "s0.neg" },
  { id: "w.notlike", lv: "A1", de: "Das mag ich nicht", t: "Three things you don't like, or don't have, and what you prefer instead.", help: ["Ich trinke keinen …", "Ich mag … nicht.", "… sondern …", "Lieber …"], sec: "s0.neg" },
  { id: "w.day", lv: "A1", de: "Mein Tag", t: "A normal weekday: when you get up, what you do in the morning, at lunch and in the evening.", help: ["Um 7 Uhr stehe ich auf.", "Dann …", "Am Mittag …", "Am Abend …"] },
  { id: "w.family", lv: "A1", de: "Meine Familie", t: "Your family or the people close to you: who they are, where they live, what they do.", help: ["Ich habe …", "Mein Bruder heißt …", "Er wohnt in …", "Sie arbeitet …"] },
  { id: "w.shop", lv: "A1", de: "Einkaufen", t: "Your shopping list for the weekend and where you buy it (Migros, Coop, the market…).", help: ["Ich brauche …", "Ich kaufe … bei …", "Wir haben keine … mehr."] },
  { id: "w.weekend", lv: "A1", de: "Am Wochenende", t: "What you like to do on the weekend — and what you never do.", help: ["Am Samstag …", "Am Sonntag …", "Ich gehe gern …", "Ich arbeite nie …"] },
  { id: "w.food", lv: "A1", de: "Essen", t: "What you eat in a normal day: breakfast, lunch, dinner. What you don't eat.", help: ["Zum Frühstück esse ich …", "Ich esse kein …", "Am liebsten …"] },
  { id: "w.town", lv: "A1", de: "Meine Stadt", t: "Your town or neighbourhood: what there is, what's missing, what you like.", help: ["In meiner Stadt gibt es …", "Es gibt kein …", "Ich finde …"] },
  { id: "w.weather", lv: "A1", de: "Das Wetter", t: "The weather today and what you do in this weather.", help: ["Heute ist es …", "Es regnet / schneit …", "Bei Regen …"] },
  // ── A2 · about 60 words ──
  { id: "w.lastwe", lv: "A2", de: "Letztes Wochenende", t: "What you did last weekend: where you went, with whom, what was good or not.", help: ["Am Samstag bin ich … gegangen.", "Wir haben … gemacht.", "Es war …", "Leider …"] },
  { id: "w.sick", lv: "A2", de: "Krank", t: "Write to your boss or teacher: you are ill, since when, what you have, when you'll be back.", help: ["Sehr geehrte …", "Leider bin ich krank.", "Seit gestern habe ich …", "Freundliche Grüsse"] },
  { id: "w.invite", lv: "A2", de: "Eine Einladung", t: "Invite a friend to dinner: when, where, who else comes, what to bring.", help: ["Liebe … / Lieber …", "Hast du am … Zeit?", "Kannst du … mitbringen?", "Bis bald!"] },
  { id: "w.doctor", lv: "A2", de: "Beim Arzt", t: "Tell about your last visit to a doctor: why you went, what the doctor said, what you had to do.", help: ["Ich hatte …", "Der Arzt hat gesagt, dass …", "Ich musste …"] },
  { id: "w.neighbour", lv: "A2", de: "Die Nachbarn", t: "Your neighbours: who they are, how you get along, a small problem or a nice moment.", help: ["Meine Nachbarn …", "Einmal …", "Wir grüssen uns …"] },
  { id: "w.holiday", lv: "A2", de: "Ferien", t: "Your last holiday: where, how you travelled, where you stayed, what you saw.", help: ["Letzten Sommer …", "Wir sind mit dem Zug …", "Wir haben in … gewohnt.", "Das Schönste war …"] },
  { id: "w.work", lv: "A2", de: "Meine Arbeit", t: "Your job or your studies: what you do, your colleagues, what you like and what's hard.", help: ["Ich arbeite bei …", "Jeden Tag …", "Mir gefällt …", "Schwierig ist …"] },
  { id: "w.complain", lv: "A2", de: "Eine Reklamation", t: "Something you bought doesn't work. Write to the shop: what, when, the problem, what you want.", help: ["Am … habe ich … gekauft.", "Leider funktioniert … nicht.", "Ich möchte …"] },
  { id: "w.learn", lv: "A2", de: "Deutsch lernen", t: "How you learn German: what helps, what's difficult, your goals.", help: ["Ich lerne Deutsch, weil …", "Am schwierigsten ist …", "Mein Ziel ist …"] },
  { id: "w.move", lv: "A2", de: "Umziehen", t: "Your move to Switzerland, or to your flat: how it went, what you had to organise.", help: ["Als ich … gekommen bin, …", "Zuerst musste ich …", "Dann …"] },
  { id: "w.appoint", lv: "A2", de: "Einen Termin verschieben", t: "Write to move an appointment (doctor, hairdresser, Gemeinde): why, and when you could come.", help: ["Ich habe am … einen Termin.", "Leider kann ich nicht kommen, weil …", "Ginge es auch am …?"] },
  // ── B1 · about 90 words ──
  { id: "w.opinion", lv: "B1", de: "Meine Meinung", t: "Should shops be open on Sundays in Switzerland? Give your opinion with reasons and an example.", help: ["Meiner Meinung nach …", "Einerseits … andererseits …", "Zum Beispiel …", "Deshalb …"] },
  { id: "w.integration", lv: "B1", de: "Integration", t: "What helps someone feel at home in a new country? Tell from your own experience.", help: ["Für mich war wichtig, dass …", "Am Anfang …", "Heute …", "Ich würde empfehlen, …"] },
  { id: "w.problemflat", lv: "B1", de: "Ein Problem in der Wohnung", t: "Write to your landlord (Verwaltung): something is broken, since when, what you have tried, what you ask.", help: ["Sehr geehrte Damen und Herren", "Seit … funktioniert … nicht mehr.", "Ich habe schon versucht, …", "Könnten Sie bitte …"] },
  { id: "w.future", lv: "B1", de: "In fünf Jahren", t: "Your plans for the next five years: work, home, family, language — and what could get in the way.", help: ["In fünf Jahren möchte ich …", "Dafür muss ich …", "Falls …", "Ich hoffe, dass …"] },
  { id: "w.experience", lv: "B1", de: "Ein besonderes Erlebnis", t: "A moment in Switzerland that surprised you (good or bad): what happened and what you learned.", help: ["Einmal ist mir passiert, dass …", "Ich war überrascht, weil …", "Seitdem …"] },
  { id: "w.compare", lv: "B1", de: "Hier und dort", t: "Compare life in Switzerland with life in your home country: one thing better, one worse, one just different.", help: ["In der Schweiz … , während …", "Besser finde ich …", "Was mir fehlt, ist …"] },
  { id: "w.volunteer", lv: "B1", de: "Freiwillig helfen", t: "Would you work as a volunteer (Verein, school, neighbourhood)? Where, why, and how much time?", help: ["Ich könnte mir vorstellen, …", "Es wäre sinnvoll, weil …", "Allerdings …"] },
  { id: "w.school", lv: "B1", de: "Schule und Kinder", t: "What should children learn at school that they don't learn today? Give reasons.", help: ["Ich finde, Kinder sollten …", "Heute lernen sie …, aber …", "Das wäre wichtig, damit …"] },
  { id: "w.phone", lv: "B1", de: "Das Handy", t: "Smartphones: how they help in your daily life, and when they are a problem.", help: ["Ohne Handy könnte ich nicht …", "Ein Nachteil ist, dass …", "Ich versuche, …"] },
]);
