// ─────────────────────────────────────────────
// A2 DECKS
// Fields: id, name, icon, words[]
// Word fields: en, de, pl (optional), hint, examples (optional)
// examples: [{de, en}, {de, en}]
// ─────────────────────────────────────────────

const DECKS_A2 = {
  id: "a2", name: "A2", icon: "🌟",
  decks: [
    {
      id: "a2_verbs_poc", name: "Verbs (POC)", icon: "⚡",
      words: [
        { en:"to run",   de:"laufen",   hint:"infinitive — irregular", examples:[{de:"Ich laufe jeden Morgen im Park.",en:"I run in the park every morning."},{de:"Er läuft sehr schnell.",en:"He runs very fast."}] },
        { en:"to sleep", de:"schlafen", hint:"infinitive — irregular", examples:[{de:"Ich schlafe acht Stunden pro Nacht.",en:"I sleep eight hours per night."},{de:"Das Baby schläft gerade.",en:"The baby is sleeping right now."}] },
        { en:"to eat",   de:"essen",    hint:"infinitive — irregular", examples:[{de:"Wir essen um sieben Uhr zu Abend.",en:"We eat dinner at seven o'clock."},{de:"Was möchtest du essen?",en:"What would you like to eat?"}] },
        { en:"to drink", de:"trinken",  hint:"infinitive — irregular", examples:[{de:"Ich trinke jeden Morgen Kaffee.",en:"I drink coffee every morning."},{de:"Möchtest du etwas trinken?",en:"Would you like something to drink?"}] },
        { en:"to go",    de:"gehen",    hint:"infinitive — irregular", examples:[{de:"Ich gehe heute ins Kino.",en:"I am going to the cinema today."},{de:"Wir gehen zusammen spazieren.",en:"We are going for a walk together."}] },
      ]
    },
  ]
};
