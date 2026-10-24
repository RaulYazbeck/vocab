// ── THE COURSE: THE SKELETON ──────────────────
// Every section of the course in the order the learner meets it
// (PLAN.md §6), with its level, priority (MoSCoW — the planner's only)
// and the book sections it draws on. A section without a content pack
// shows as "coming". Sections linked to the verb track (verb: sheet ids)
// are done when those sheets are passed.
//   prio  M must · S should · C could (post-B1)
//   n     sheets the lesson will have — an ESTIMATE for the planner while
//         it isn't built (generous on purpose; the built lesson counts its
//         real sheets). Not a target: write what the topic needs.
//   after the lessons it builds on — it waits until they're done (so a
//         lesson built early never comes before what it needs)
//   kind  lesson (default) · contrast · recap · verb · scenario
cxDefine({
  stages: [
    { id: 0, name: "The basics", sign: "A1" },
    { id: 1, name: "Building sentences", sign: "A2" },
    { id: 2, name: "Longer sentences", sign: "B1" },
    { id: 3, name: "Conversation", sign: "💬" },
    { id: 4, name: "After B1 · bonus", sign: "✦" },
  ],
  chapters: {
    c1: "Pronunciation and gender", c2: "Definite and indefinite articles", c3: "Pronouns, plurals, and the verb sein",
    c4: "Titles, location, and interrogatives", c5: "The verbs haben and werden and negation", c6: "The present tense and numbers",
    c7: "Direct objects and the accusative case", c8: "Irregular verbs in the present tense", c9: "Imperatives",
    c10: "The present perfect tense", c11: "Past perfect and future tense", c12: "Separable and inseparable prefixes and imperatives",
    c13: "Accusative prepositions and interrogatives", c14: "Regular verbs in the past tense and word order", c15: "Indirect objects and the dative case",
    c16: "Irregular verbs in the past tense", c17: "Modal auxiliaries in the present and past tenses", c18: "Wissen and kennen",
    c19: "The accusative-dative prepositions", c20: "Genitive case, the comparative, and the superlative", c21: "The future perfect, negation, and imperatives",
    c22: "Relative pronouns", c23: "Modifiers, adverbs, reflexive pronouns, and conjunctions", c24: "Double infinitive structures (infinitive clauses)",
    c25: "The passive voice", c26: "The subjunctive", c27: "More on the subjunctive mood", c28: "Building sentences", c29: "Building more sentences",
    c30: "Conversation", c31: "More conversation", appA: "Appendix A · Principal parts", appB: "Appendix B · Prepositions and cases", appC: "Appendix C · Declensions",
  },
  // ses: the build session that makes the lesson (PLAN.md §12) — what to
  // upload for a session follows from it: node tools/course/session.mjs N
  sections: [
    // ── Stage 0 — A1 grammar (each lesson opens with a test-out) ──
    { id: "s0.sounds", ses: 2, stage: 0, level: "A1", prio: "S", n: 1, title: "Sounds and spelling", book: [["c1", "Pronunciation"]] },
    { id: "s0.gender", ses: 2, stage: 0, level: "A1", prio: "M", n: 2, title: "Gender: der/die/das and the clues", book: [["c1", "Gender"]] },
    { id: "s0.art", ses: 2, stage: 0, level: "A1", prio: "M", n: 2, after: ["s0.gender"], title: "Articles: der-words and ein-words", book: [["c2", "Definite articles"], ["c2", "Indefinite articles"], ["c2", "Der-words"], ["c2", "Ein-words"], ["c2", "Ein/eine with questions"]] },
    { id: "s0.plural", ses: 2, stage: 0, level: "A1", prio: "M", n: 2, after: ["s0.gender"], title: "Plurals", book: [["c3", ""]] },
    { id: "s0.pron", ses: 2, stage: 0, level: "A1", prio: "M", n: 2, title: "Personal pronouns; du / ihr / Sie", book: [["c3", "Pronouns in the nominative case"], ["c6", "Personal Pronouns"], ["c4", "Titles"]] },
    { id: "s0.v2q", ses: 2, stage: 0, level: "A1", prio: "M", n: 2, title: "Verb second and yes/no questions", book: [["c6", "Verb Position"], ["c6", "Verb Position in General Questions"], ["c28", "Interrogative sentences"], ["c28", "Declarative sentences and word order"]] },
    { id: "s0.wq", ses: 2, stage: 0, level: "A1", prio: "M", n: 1, after: ["s0.v2q"], title: "W-questions (basic)", book: [["c4", "Titles, locations, and interrogatives"], ["c6", "Verb Position with Question Words"]] },
    { id: "s0.neg", ses: 1, stage: 0, level: "A1", prio: "M", title: "nicht or kein?", book: [["c5", ""], ["c5", "Negation"], ["c5", "Nicht"], ["c5", "Kein"], ["c28", "Negation"]] },
    { id: "s0.num", ses: 2, stage: 0, level: "A1", prio: "M", n: 2, title: "Numbers, time, dates", book: [["c6", "Numbers"], ["c6", "Ordinals"]] },
    { id: "s0.acc", ses: 2, stage: 0, level: "A1", prio: "M", n: 2, after: ["s0.art"], title: "Accusative: the articles", book: [["c7", "Accusative case"], ["c7", ""]] },
    { id: "s0.accpron", ses: 2, stage: 0, level: "A1", prio: "M", n: 2, after: ["s0.acc", "s0.pron"], title: "Accusative pronouns and man", book: [["c7", "Accusative case form of personal pronouns"], ["c7", "Pronouns in the accusative case"], ["c7", "Man"], ["c7", "Pronouns"]] },
    { id: "s0.verbs", ses: 2, stage: 0, level: "A1", prio: "M", kind: "verb", title: "Präsens · Imperativ · the Perfekt's structure · war & hatte", verb: ["pr1", "pr2", "pr3", "pr4", "pr5", "pr7", "im1", "im2", "im3", "pf1", "pt11", "pt12", "pt13"],
      book: [["c6", "The present tense"], ["c6", "Formation of the Present Tense"], ["c6", "The Present Tense of haben, sein, and werden"], ["c8", ""], ["c9", ""], ["c10", "Formation of the present perfect tense"], ["c6", "The Infinitive"], ["c6", "Present Tense Forms"], ["c6", "fragen"], ["c6", "kaufen"], ["c6", "machen"], ["c6", "Verb Stems Ending in -t, -d, or -n"], ["c6", "Verb Stems Ending in -el or -er"], ["c8", "Irregular verbs in the present tense"], ["c8", "The addition of an umlaut"], ["c8", "Vowel change e to i"], ["c8", "Vowel change e to ie"], ["c9", "Addressing groups"], ["c9", "Imperatives with wir"], ["c9", "Imperatives"], ["c12", "Imperative verbs"], ["c12", "Formal commands"], ["c12", "Familiar commands"], ["c12", "Singular"], ["c12", "Plural"], ["c12", "Exhortations (mild commands, inclusive"], ["c12", "The command forms of sein and werden"], ["c17", ""], ["c17", "Modal auxiliaries"], ["c17", "Conjugation of the modal auxiliaries"]] },
    { id: "s0.recap", ses: 2, stage: 0, level: "A1", prio: "M", kind: "recap", title: "Checkpoint: the basics" },

    // ── Stage 1 — A2 core ──
    { id: "s1.front", ses: 3, stage: 1, level: "A2", prio: "M", n: 2, after: ["s0.v2q"], title: "Fronting; time – manner – place", book: [["c14", "Word order"], ["c28", "Word order"], ["c11", "Adverbs of time"]] },
    { id: "s1.conj1", ses: 4, stage: 1, level: "A2", prio: "M", n: 1, after: ["s0.v2q"], title: "und, aber, oder, denn, sondern", book: [["c29", "Coordinating conjunctions"]] },
    { id: "s1.neg2", ses: 3, stage: 1, level: "A2", prio: "M", n: 1, after: ["s0.neg"], title: "niemand, nichts, nie, gar nicht", book: [["c5", "Gar"], ["c5", "Nie and nichts"], ["c28", "Niemand, nichts, and niemals"]] },
    { id: "s1.wer", ses: 3, stage: 1, level: "A2", prio: "M", n: 2, after: ["s0.wq", "s0.acc"], title: "wer / wen / wem, welcher, was für", book: [["c13", ""], ["c28", "Interrogative words"], ["c28", "Wer"], ["c28", "Was"]] },
    { id: "s1.resp", ses: 3, stage: 1, level: "A2", prio: "M", n: 1, title: "Set responses and greetings", book: [["c29", "Short responses"], ["c29", "Pat phrases"], ["c30", "Greetings and introductions"]] },
    { id: "s1.pf", ses: 3, stage: 1, level: "A2", prio: "M", after: ["s0.verbs"], kind: "verb", title: "Perfekt complete", verb: ["pf2", "pf3", "pf4", "pf5", "pf6"], book: [["c10", ""], ["c10", "Usage of the present perfect tense"], ["c10", "Present perfect tense of weak verbs"], ["c10", "haben or sein as the Auxiliary Verb in Perfect"], ["c10", "sein with a Change of Position"], ["c10", "sein with a Change of Condition"], ["c10", "sein with Verbs of Rest"], ["c10", "haben with Some Verbs of Motion"], ["c10", "Present perfect tense of mixed verbs"], ["c10", "Present perfect tense with separable prefixes"], ["c10", "Present perfect tense with inseparable prefixes"], ["c10", "Present perfect tense with verbs ending in -ieren"], ["c10", "Subordinate clauses and the present perfect tense"]] },
    { id: "s1.sep", ses: 3, stage: 1, level: "A2", prio: "M", after: ["s0.verbs"], kind: "verb", title: "Separable vs inseparable", verb: ["pr6"], book: [["c12", "Inseparable prefixes"], ["c12", "Separable prefixes"], ["c12", "Prefixes"], ["c12", "Verbs that combine with both separable and"]] },
    { id: "s1.accprep", ses: 4, stage: 1, level: "A2", prio: "M", n: 2, after: ["s0.acc"], title: "Accusative prepositions", book: [["c7", "Accusative prepositions"], ["c13", "Accusative prepositions"], ["c13", "Multiple usages"], ["c13", "Bis"], ["c13", "Durch"], ["c13", "Für"], ["c13", "Gegen"], ["c13", "Ohne"], ["c13", "Um"], ["c13", "Wider"], ["c13", "Der-words"], ["c13", "Ein-words"], ["appB", "Accusative"]] },
    // Moved here (Oct 2026), before the dative lessons, as in the book (c13
    // accusative prepositions → c14 regular past → c15 dative). As a "Should"
    // it used to wait until after the possessives (≈ day 112 of the clock);
    // the verb track opens a tense's every-verb forms (cells) and items only
    // once its lessons are passed, so a late lesson piles all of them into the
    // last weeks before the finish date. Its level stays A2.
    { id: "s1.pt21", ses: 4, stage: 1, level: "A2", prio: "S", after: ["s0.verbs"], kind: "verb", title: "Regular Präteritum", verb: ["pt21"], book: [["c14", "Regular past tense"], ["c14", "Weak verbs"], ["c14", "Regular verbs in the past tense and"], ["c14", "The past tense"], ["c14", "Usage of the past tense"]] },
    { id: "s1.dat", ses: 3, stage: 1, level: "A2", prio: "M", n: 2, after: ["s0.acc"], title: "Dative: articles and the indirect object", book: [["c15", "Dative case"], ["c15", "Indirect objects"], ["c15", "Nouns used as indirect objects"], ["c15", "Indirect objects and the dative case"]] },
    { id: "s1.datpron", ses: 3, stage: 1, level: "A2", prio: "M", n: 2, after: ["s1.dat", "s0.accpron"], title: "Dative pronouns; the order of two objects", book: [["c15", "Pronouns used as indirect objects"]] },
    { id: "s1.datverb", ses: 3, stage: 1, level: "A2", prio: "M", n: 1, after: ["s1.dat"], title: "Dative verbs (helfen, gefallen, gehören…)", book: [["c15", "Dative verbs"]] },
    { id: "s1.accdat", ses: 3, stage: 1, level: "A2", prio: "M", n: 1, after: ["s1.dat", "s1.datverb"], kind: "contrast", title: "Contrast: accusative vs dative", book: [["c7", "Accusative case"], ["c15", "Dative case"]] },
    { id: "s1.datprep", ses: 4, stage: 1, level: "A2", prio: "M", n: 2, after: ["s1.dat"], title: "Dative prepositions", book: [["c15", "Dative prepositions"], ["appB", "Dative"]] },
    { id: "s1.twoway", ses: 4, stage: 1, level: "A2", prio: "M", n: 2, after: ["s1.accprep", "s1.datprep"], title: "Two-way prepositions", book: [["c19", "Dative-accusative prepositions"], ["c19", ""], ["appB", "Dative/Accusative"]] },
    // A B1 lesson taught here, among the A2 ones (Oct 2026): strong and mixed
    // Präteritum (+ Plusquamperfekt) a month after the regular Präteritum — time
    // to settle the -te forms and the Perfekt first — instead of near the end
    // of stage 2 (≈ day 195, May). Präteritum II (every verb, ≈ 660 forms)
    // opens with it, so those forms spread over Feb–May at ≈ 5–6 a day instead
    // of ≈ 26 a day crammed into May. The book has it right after the dative
    // (c16); it comes a little later here, after the two-way prepositions, to
    // leave that month between the two Präteritum lessons. Level and stage stay
    // B1 (it is listed under B1 in the course map).
    { id: "s2.pt2", ses: 7, stage: 2, level: "B1", prio: "S", after: ["s1.pf", "s1.pt21"], kind: "verb", title: "Strong and mixed Präteritum · Plusquamperfekt", verb: ["pt22", "pt23", "pt24", "pq1", "pq2"], book: [["c11", "Past perfect tense"], ["c16", ""], ["c11", "The past perfect tense"], ["c16", "Strong verbs"], ["c16", "e to a"], ["c16", "a to u"], ["c16", "gehen"], ["c16", "trinken"], ["c16", "tun"], ["c16", "essen"], ["c16", "Mixed verbs"], ["c16", "haben, sein, and werden"], ["c16", "Irregular past tense"], ["c16", "The verbs haben, sein, and werden"]] },
    { id: "s1.wowohin", ses: 4, stage: 1, level: "A2", prio: "M", n: 1, after: ["s1.twoway"], kind: "contrast", title: "Contrast: wo? vs wohin?", book: [["c19", "Dative case"], ["c19", "Accusative case"]] },
    { id: "s1.modal", ses: 4, stage: 1, level: "A2", prio: "M", n: 2, after: ["s0.verbs", "s0.v2q"], title: "Modals: position, and in subordinate clauses", book: [["c17", "Modals used with infinitives"], ["c17", "Modal position in a subordinate clause"], ["c17", "Omission of the infinitive"], ["c11", "Position and form of modals"]] },
    { id: "s1.conj2", ses: 4, stage: 1, level: "A2", prio: "M", n: 2, after: ["s0.v2q"], title: "weil, dass, wenn — the verb goes last", book: [["c29", "Subordinating conjunctions"], ["c29", "Using subordinating conjunctions"]] },
    { id: "s1.poss", ses: 5, stage: 1, level: "A2", prio: "M", n: 2, after: ["s1.datprep"], title: "Possessives; von + dative", book: [["c2", "Ein-words"], ["c20", "Possession"]] },
    { id: "s1.wissen", ses: 4, stage: 1, level: "A2", prio: "M", n: 1, after: ["s0.verbs"], title: "wissen vs kennen", book: [["c18", ""], ["c18", "Conjugation of wissen"], ["c18", "Meanings of wissen and kennen"]] },
    { id: "s1.refl", ses: 4, stage: 1, level: "A2", prio: "M", n: 2, after: ["s1.datpron"], title: "Reflexive pronouns (accusative and dative)", book: [["c23", "Reflexive pronouns"]] },
    { id: "s1.fu", ses: 5, stage: 1, level: "A2", prio: "S", after: ["s0.verbs"], kind: "verb", title: "Future with werden", verb: ["fu1", "fu2"], book: [["c11", "Future tense"], ["c11", "The future tense"], ["c11", "Modal auxiliaries in the future tense"]] },
    { id: "s1.comp", ses: 5, stage: 1, level: "A2", prio: "M", n: 2, after: ["s0.art"], title: "Comparative and superlative", book: [["c20", "Comparative and superlative"], ["c31", "Comparatives and superlatives"]] },
    { id: "s1.adj", ses: 5, stage: 1, level: "A2", prio: "M", n: 3, after: ["s1.dat", "s0.acc"], title: "Adjective endings (after der-words · after ein-words · no article)", book: [["c23", "Modifiers"], ["appC", "Declension with der-words"], ["appC", "Declension with ein-words"]] },
    { id: "s1.zu", ses: 5, stage: 1, level: "A2", prio: "M", n: 2, after: ["s1.modal", "s1.conj2"], title: "zu + infinitive · um…zu, ohne…zu, anstatt…zu", book: [["c24", ""], ["c24", "Infinitive clauses"], ["c24", "Formation of infinitive clauses"], ["c24", "Verbs that introduce infinitive clauses"], ["c24", "Infinitive clauses as nouns"], ["c24", "Prepositions commonly used with infinitive"], ["c24", "Anstatt zu"], ["c24", "Ohne zu"], ["c24", "Um zu"]] },
    { id: "s1.recap", ses: 5, stage: 1, level: "A2", prio: "M", kind: "recap", title: "Checkpoint: building sentences" },

    // ── Stage 2 — B1 ──
    { id: "s2.conj3", ses: 6, stage: 2, level: "B1", prio: "M", n: 2, after: ["s1.conj2"], title: "obwohl, bevor, nachdem, während, damit, bis, seit", book: [["c23", "Conjunctions"], ["c29", "Subordinating conjunctions"]] },
    { id: "s2.alswenn", ses: 6, stage: 2, level: "B1", prio: "M", n: 1, after: ["s2.conj3"], kind: "contrast", title: "als vs wenn vs wann", book: [["c29", "When as a conjunction"]] },
    { id: "s2.k2", ses: 7, stage: 2, level: "B1", prio: "M", after: ["s1.pt21", "s1.modal"], kind: "verb", title: "Konjunktiv II", verb: ["k21", "k22", "k23", "k25", "k24"], book: [["c26", "The Present-Time Subjunctive II"], ["c27", "Subjunctive II"], ["c26", "Forming the subjunctive"], ["c26", "Mood: Indicative and Subjunctive"], ["c26", "Modal Verbs in the Subjunctive II"], ["c26", "The würde Construction"], ["c27", "The subjunctive mood"], ["c27", "Subjunctive conjugations"], ["c31", "Subjunctive review"]] },
    { id: "s2.cond", ses: 7, stage: 2, level: "B1", prio: "M", n: 2, after: ["s2.k2", "s1.conj2"], title: "If and wishes (wenn-clauses · wishes and als ob)", book: [["c27", "Subjunctive II with wenn-clauses"], ["c27", "Wenn"], ["c26", "Conditional Sentences"], ["c26", "Conditions of Fact"], ["c26", "Present"], ["c26", "Starting with the Conclusion"], ["c26", "Omitting wenn"], ["c26", "Expressing a Wish"], ["c27", "or"], ["c27", "Als ob, als wenn"]] },
    { id: "s2.indq", ses: 6, stage: 2, level: "B1", prio: "M", n: 2, after: ["s1.conj2", "s0.wq"], title: "Indirect questions · dass vs ob", book: [["c29", "Interrogatives"], ["c26", "Indirect Questions"], ["c26", "sollen in Commands"]] },
    { id: "s2.verbprep", ses: 6, stage: 2, level: "B1", prio: "M", n: 2, after: ["s1.twoway"], title: "Verb + preposition (warten auf, denken an…)", book: [] },
    { id: "s2.woda", ses: 6, stage: 2, level: "B1", prio: "M", n: 1, after: ["s2.verbprep"], title: "wo- / da- compounds (woran, daran)", book: [["c19", "Pronouns and prepositional adverbs"], ["c28", "Prepositional adverbs"]] },
    { id: "s2.rel", ses: 6, stage: 2, level: "B1", prio: "M", n: 2, after: ["s1.dat", "s1.conj2"], title: "Relative pronouns (nominative/accusative · dative)", book: [["c22", "Definite article form of relative pronouns"], ["c22", "Der/die/das"], ["c22", ""], ["c22", "Relative pronouns that replace nouns in the"], ["c22", "Nominative masculine singular"]] },
    { id: "s2.relprep", ses: 6, stage: 2, level: "B1", prio: "M", n: 2, after: ["s2.rel", "s1.twoway"], title: "Relative clauses with prepositions; wo, was, wer, welcher", book: [["c22", "Was"], ["c22", "Wer and der"], ["c22", "Using welcher as a relative pronoun"], ["c22", "Welcher"], ["c22", "Two types of relative pronouns"]] },
    { id: "s2.modpf", ses: 7, stage: 2, level: "B1", prio: "S", n: 1, after: ["s1.pf", "s1.modal"], title: "Modals in the Perfekt (double infinitive basics)", book: [["c17", "Modal auxiliaries and double infinitives"], ["c10", "Present perfect tense of modal auxiliaries and of"]] },
    { id: "s2.part", ses: 7, stage: 2, level: "B1", prio: "S", n: 1, title: "Modal particles: doch, mal, ja, halt", book: [["c29", "Doch"], ["c29", "Mal"]] },
    { id: "s2.short", ses: 7, stage: 2, level: "B1", prio: "S", n: 1, title: "Short answers and words for emphasis", book: [["c29", "Short responses"], ["c29", "Words for emphasis"], ["c29", "Also"], ["c29", "Gar"], ["c29", "Kaum"], ["c29", "Wie"], ["c29", "Zwar"]] },
    { id: "s2.pv", ses: 7, stage: 2, level: "B1", prio: "S", after: ["s1.pf", "s1.datprep"], kind: "verb", title: "The passive", verb: ["pv1", "pv2", "pv3", "pv4"], book: [["c25", "Formation of the passive voice"], ["c25", "von or durch"], ["c25", ""], ["c25", "The passive voice"], ["c25", "Passive voice"], ["c25", "Active voice versus passive voice"], ["c25", "sein and the Passive Voice"], ["c25", "The preposition durch"], ["c25", "Expressing an indirect object with the dative case"]] },
    { id: "s2.man", ses: 7, stage: 2, level: "B1", prio: "S", n: 1, after: ["s2.pv"], title: "man, the impersonal passive, and other ways around it", book: [["c25", "Substitutes for the passive voice"], ["c25", "man"], ["c25", "Impersonal passive constructions"]] },
    { id: "s2.lassen", ses: 7, stage: 2, level: "B1", prio: "S", n: 1, after: ["s1.modal"], title: "lassen", book: [["c25", "sich lassen + Infinitive"]] },
    { id: "s2.gen", ses: 6, stage: 2, level: "B1", prio: "S", n: 2, after: ["s1.dat"], title: "Genitive and wessen", book: [["c20", "Genitive case"], ["c28", "Wer"], ["c20", "Genitive case, the comparative, and"], ["c20", "Adjectives"]] },
    { id: "s2.genprep", ses: 6, stage: 2, level: "B1", prio: "S", n: 1, after: ["s2.gen"], title: "Genitive prepositions (wegen, trotz, während…)", book: [["appB", "Genitive"]] },
    { id: "s2.adv", ses: 6, stage: 2, level: "B1", prio: "S", n: 1, after: ["s1.front"], title: "Adverbs: types and position", book: [["c23", "Adverbs"]] },
    { id: "s2.ptadj", ses: 7, stage: 2, level: "B1", prio: "S", n: 1, after: ["s1.adj", "s1.pf"], title: "Participles as adjectives", book: [["c29", "Present participles"], ["c29", "Past participles"], ["c29", "Attributive adjectives"]] },
    { id: "s2.ndecl", ses: 7, stage: 2, level: "B1", prio: "S", n: 2, after: ["s1.adj", "s2.gen"], title: "n-declension nouns; adjectives used as nouns", book: [["appC", "Masculine nouns requiring an -(e)n ending"], ["appC", "Adjectives and participles used as nouns"], ["appC", "Neuter noun Herz requiring an -en ending"]] },
    { id: "s2.recap", ses: 7, stage: 2, level: "B1", prio: "M", kind: "recap", title: "Checkpoint: longer sentences" },

    // ── Stage 3 — conversation ──
    { id: "s3.greet", ses: 8, stage: 3, level: "B1", prio: "M", n: 2, after: ["s1.recap"], kind: "scenario", title: "Greetings and introductions", book: [["c30", "Greetings and introductions"]] },
    { id: "s3.way", ses: 8, stage: 3, level: "B1", prio: "M", n: 2, after: ["s1.recap"], kind: "scenario", title: "Asking the way", book: [["c30", "Conversation: In der Hauptstraße (On Main"], ["c30", "Commands"]] },
    { id: "s3.bus", ses: 8, stage: 3, level: "B1", prio: "M", n: 2, after: ["s1.recap"], kind: "scenario", title: "At the bus stop", book: [["c31", "Conversation: An der Bushaltestelle (At the bus"]] },
    { id: "s3.school", ses: 8, stage: 3, level: "B1", prio: "S", n: 2, after: ["s1.recap"], kind: "scenario", title: "School and study (studieren vs lernen)", book: [["c31", "Schulen"], ["c31", "Studieren and lernen"], ["c31", "Im Klassenzimmer"]] },
    { id: "s3.shop", ses: 8, stage: 3, level: "B1", prio: "M", n: 2, after: ["s1.recap"], kind: "scenario", title: "Shopping and prices", book: [["c31", "Shopping"], ["c31", "Euro und Cent"], ["c31", "Einkaufen"], ["c31", "Im Kaufhaus"]] },
    { id: "s3.travel", ses: 8, stage: 3, level: "B1", prio: "M", n: 2, after: ["s1.recap"], kind: "scenario", title: "Travel", book: [["c31", "Travel"]] },

    // ── Post-B1 (Could) ──
    { id: "s4.k1", ses: 9, stage: 4, level: "B2", prio: "C", n: 2, after: ["s2.recap"], title: "Konjunktiv I and indirect speech", book: [["c26", "Subjunctive I"], ["c27", "Indirect discourse"], ["c26", "Use and Formation of the Subjunctive I"], ["c26", "Present-Time Subjunctive I"], ["c26", "Past-Time Subjunctive I"], ["c27", "Subjunctive I"]] },
    { id: "s4.ext", ses: 9, stage: 4, level: "C1", prio: "C", n: 1, after: ["s2.recap"], title: "Extended participle modifiers", book: [["c29", "Extended modifiers"]] },
    { id: "s4.fu2", ses: 9, stage: 4, level: "B2", prio: "C", n: 1, after: ["s2.recap"], title: "Futur II", book: [["c21", ""]] },
    { id: "s4.pvx", ses: 9, stage: 4, level: "B2", prio: "C", n: 1, after: ["s2.recap", "s2.pv"], title: "Advanced passive: sein … zu, sich lassen", book: [["c25", "sein...zu + Infinitive"]] },
    { id: "s4.prefix", ses: 9, stage: 4, level: "B2", prio: "C", n: 1, after: ["s2.recap"], title: "Prefixes both separable and inseparable", book: [["c12", "Prefixes that are inseparable and separable"]] },
    { id: "s4.k2p", ses: 9, stage: 4, level: "B2", prio: "C", after: ["s2.k2"], kind: "verb", title: "Konjunktiv II · past", verb: ["k2p1", "k2p2"], book: [["c26", "The Past-Time Subjunctive II"], ["c26", "Speculation About the Past"], ["c26", "Modal Verbs in the Past-Time Subjunctive II"]] },
  ],
});
