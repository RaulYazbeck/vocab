// What a typed answer may differ in, in both apps' real code: word
// answers (Today, Drill, Timer, the typing games) and verb forms (verb
// cards, grammar quizzes). ✓ right · ≈ almost (one more try) · ✗ wrong.
import { openApp } from "./browser.mjs";
let pass = 0, fail = 0;
const ok = (c, m, x = "") => { if (c) pass++; else { fail++; console.log("  ✗", m, x); } };
const CASES = {
  de: {
    words: [
      ["das Mädchen", "das Mädchen", "✓"], ["das Mädchen", "das Madchen", "✓"], ["das Mädchen", "das Maedchen", "✓"], ["das Mädchen", "DAS MÄDCHEN", "✓"],
      ["der Müller", "der Mueller", "✓"], ["die Brüder", "die Brueder", "✓"], ["schön", "schoen", "✓"], ["das Feuer", "das Feur", "✗"],
      ["die Straße", "die Strasse", "✓"], ["der Fluss", "der Fluß", "✓"], ["die Straße", "die strase", "✗"],
      ["die Katze", "Katze", "✗"], ["die Katze", "der Katze", "✗"], ["die Katze", "die  katze", "✓"],
      ["E-Mail", "e mail", "✓"], ["E-Mail", "email", "≈"], ["wie geht's?", "wie geht’s?", "✓"], ["wie geht's?", "wie geht‘s?", "✓"],
      ["wie geht's?", "wie geht s?", "✓"], ["Anrufbeantworter", "Anrufbeatnworter", "≈"],
    ],
    verbs: [["fahren", "pr", "du", "fährst", "✓"], ["fahren", "pr", "du", "fahrst", "✓"], ["fahren", "pr", "du", "faehrst", "✓"], ["haben", "k2o", "ich", "hatte", "✓"],
      ["heißen", "pr", "du", "heisst", "✓"], ["heißen", "pr", "du", "heist", "✗"], ["anrufen", "pr", "ich", "rufe-an", "✓"], ["anrufen", "pr", "ich", "rufe", "✗"],
      ["vermieten", "im", "Sie", "vermieten sie", "✓"], ["vermieten", "im", "Sie", "Sie vermieten", "✗"]],
  },
  fr: {
    words: [
      ["le café", "le cafe", "✓"], ["le café", "LE CAFÉ", "✓"], ["où", "ou", "✓"], ["le garçon", "le garcon", "✓"],
      ["l'eau", "l'eau", "✓"], ["l'eau", "l’eau", "✓"], ["l'eau", "l‘eau", "✓"], ["l'eau", "l eau", "✓"], ["l'eau", "eau", "✗"],
      ["aujourd'hui", "aujourd’hui", "✓"], ["l'œuf", "l'oeuf", "✓"], ["l'œuf", "l’œuf", "✓"], ["la sœur", "la soeur", "✓"], ["un ex æquo", "un ex aequo", "✓"],
      ["peut-être", "peut etre", "✓"], ["peut-être", "peutetre", "≈"], ["la rue", "le rue", "✗"], ["bleue", "bleu", "✗"],
    ],
    verbs: [["aimer", "pr", "je", "j’aime", "✓"], ["aimer", "pr", "je", "j aime", "✓"], ["aimer", "pr", "je", "je aime", "✓"],
      ["s'habiller", "pr", "je", "m habille", "✓"], ["s'habiller", "pr", "je", "me habille", "✓"], ["s'habiller", "pr", "je", "habille", "✗"],
      ["parler", "pc", "je", "ai parle", "✓"], ["aller", "pc", "elle", "est allé", "✗"], ["se lever", "ip", "tu", "tu lève-toi", "✗"],
      ["aller", "sj", "je", "que j aille", "✓"], ["commencer", "pr", "nous", "commencons", "✓"]],
  },
};
for (const app of ["de", "fr"]) {
  const { browser, page, errors } = await openApp({ app });
  const r = await page.evaluate(([c]) => {
    const W = (a, t) => isCorrect(t, a) ? "✓" : isNearMiss(t, [a]) ? "≈" : "✗";
    const G = (inf, k, p, t) => { const form = vxForm(vxVerb(inf), k, p), g = vxGrade(t, { kind: k, form }); return g === true ? "✓" : g === "near" ? "≈" : "✗"; };
    // the typing games grade through gradeTyped too
    const games = c.words.map(([a, t, want]) => { const g = gradeTyped(t, [a]); return [a, t, want, g === true ? "✓" : g === "near" ? "≈" : "✗"]; });
    return { words: c.words.map(([a, t, want]) => [a, t, want, W(a, t)]), games, verbs: c.verbs.map(([inf, k, p, t, want]) => [`${inf} ${k} ${p}`, t, want, G(inf, k, p, t)]) };
  }, [CASES[app]]);
  r.words.forEach(([a, t, want, got]) => ok(got === want, `${app} word: ${a} ← "${t}" ${want}`, got));
  r.games.forEach(([a, t, want, got]) => ok(got === want, `${app} game: ${a} ← "${t}" ${want}`, got));
  r.verbs.forEach(([v, t, want, got]) => ok(got === want, `${app} verb: ${v} ← "${t}" ${want}`, got));
  ok(!errors.length, `${app}: no page errors`, errors.slice(0, 3).join(" | "));
  await browser.close();
}
console.log(`typing: ${pass} passed, ${fail} failed`);
process.exit(fail ? 1 : 0);
