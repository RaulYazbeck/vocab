// ── THE COURSE: THE SKELETON ──────────────────
// Every section of the course in the order the learner meets it
// (PLAN.md §6), with its level, priority (MoSCoW — the planner's only)
// and the book sections it draws on. A section without a content pack
// shows as "coming". Sections linked to the verb track (verb: sheet ids)
// are done when those sheets are passed.
//   prio  M must · S should · C could (post-B1)
//   n     sheets the section will have (for the planner)
//   kind  lesson (default) · contrast · recap · verb · scenario
cxDefine({
  stages: [
    { id: 0, name: "Stage 0 · A1 sweep", sub: "test out what you know, learn the rest" },
    { id: 1, name: "Stage 1 · A2 core", sub: "word order, cases, prepositions, clauses" },
    { id: 2, name: "Stage 2 · B1", sub: "relative clauses, Konjunktiv, passive, particles" },
    { id: 3, name: "Stage 3 · Conversation", sub: "six everyday scenarios" },
    { id: 4, name: "Post-B1", sub: "for later — only if time allows" },
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
  sections: [
    // ── Stage 0 — A1 sweep ──
    { id: "s0.sounds", stage: 0, level: "A1", prio: "S", title: "Sounds and spelling", book: [["c1", "Pronunciation"]] },
    { id: "s0.gender", stage: 0, level: "A1", prio: "M", title: "Gender: der/die/das and the clues", book: [["c1", "Gender"]] },
    { id: "s0.art", stage: 0, level: "A1", prio: "M", title: "Articles: der-words and ein-words", book: [["c2", "Definite articles"], ["c2", "Indefinite articles"], ["c2", "Der-words"], ["c2", "Ein-words"], ["c2", "Ein/eine with questions"]] },
    { id: "s0.plural", stage: 0, level: "A1", prio: "M", title: "Plurals", book: [["c3", ""]] },
    { id: "s0.pron", stage: 0, level: "A1", prio: "M", title: "Personal pronouns; du / ihr / Sie", book: [["c3", "Pronouns in the nominative case"], ["c6", "Personal Pronouns"]] },
    { id: "s0.v2q", stage: 0, level: "A1", prio: "M", title: "Verb second and yes/no questions", book: [["c6", "Verb Position"], ["c6", "Verb Position in General Questions"], ["c28", "Interrogative sentences"]] },
    { id: "s0.wq", stage: 0, level: "A1", prio: "M", title: "W-questions (basic)", book: [["c4", "Titles, locations, and interrogatives"], ["c6", "Verb Position with Question Words"]] },
    { id: "s0.neg", stage: 0, level: "A1", prio: "M", title: "nicht or kein?", book: [["c5", ""], ["c5", "Negation"], ["c5", "Nicht"], ["c5", "Kein"], ["c28", "Negation"]] },
    { id: "s0.num", stage: 0, level: "A1", prio: "M", title: "Numbers, time, dates", book: [["c4", "Titles"], ["c6", "Numbers"], ["c6", "Ordinals"]] },
    { id: "s0.acc", stage: 0, level: "A1", prio: "M", title: "Accusative: the articles", book: [["c7", "Accusative case"]] },
    { id: "s0.accpron", stage: 0, level: "A1", prio: "M", title: "Accusative pronouns and man", book: [["c7", "Accusative case form of personal pronouns"], ["c7", "Pronouns in the accusative case"], ["c7", "Man"]] },
    { id: "s0.verbs", stage: 0, level: "A1", prio: "M", kind: "verb", title: "Präsens · Imperativ · the Perfekt's structure", verb: ["pr1", "pr2", "pr3", "pr4", "pr5", "pr7", "im1", "im2", "im3", "pf1"],
      book: [["c6", "The present tense"], ["c6", "Formation of the Present Tense"], ["c6", "The Present Tense of haben, sein, and werden"], ["c8", ""], ["c9", ""], ["c10", "Formation of the present perfect tense"]] },
    { id: "s0.recap", stage: 0, level: "A1", prio: "M", kind: "recap", title: "Recap: Stage 0" },

    // ── Stage 1 — A2 core ──
    { id: "s1.front", stage: 1, level: "A2", prio: "M", title: "Fronting; time – manner – place", book: [["c14", "Word order"], ["c28", "Word order"]] },
    { id: "s1.neg2", stage: 1, level: "A2", prio: "M", title: "niemand, nichts, nie, gar nicht", book: [["c5", "Gar"], ["c5", "Nie and nichts"], ["c28", "Niemand, nichts, and niemals"]] },
    { id: "s1.wer", stage: 1, level: "A2", prio: "M", title: "wer / wen / wem, welcher, was für", book: [["c13", ""], ["c28", "Interrogative words"], ["c28", "Wer"], ["c28", "Was"]] },
    { id: "s1.resp", stage: 1, level: "A2", prio: "M", title: "Set responses and greetings", book: [["c29", "Short responses"], ["c29", "Pat phrases"], ["c30", "Greetings and introductions"]] },
    { id: "s1.pf", stage: 1, level: "A2", prio: "M", kind: "verb", title: "Perfekt complete", verb: ["pf2", "pf3", "pf4", "pf5", "pf6"], book: [["c10", ""]] },
    { id: "s1.sep", stage: 1, level: "A2", prio: "M", kind: "verb", title: "Separable vs inseparable", verb: ["pr6"], book: [["c12", "Inseparable prefixes"], ["c12", "Separable prefixes"]] },
    { id: "s1.dat", stage: 1, level: "A2", prio: "M", title: "Dative: articles and the indirect object", book: [["c15", "Dative case"], ["c15", "Indirect objects"], ["c15", "Nouns used as indirect objects"]] },
    { id: "s1.datpron", stage: 1, level: "A2", prio: "M", title: "Dative pronouns; the order of two objects", book: [["c15", "Pronouns used as indirect objects"]] },
    { id: "s1.datverb", stage: 1, level: "A2", prio: "M", title: "Dative verbs (helfen, gefallen, gehören…)", book: [["c15", "Dative verbs"]] },
    { id: "s1.accdat", stage: 1, level: "A2", prio: "M", kind: "contrast", title: "Contrast: accusative vs dative", book: [["c7", "Accusative case"], ["c15", "Dative case"]] },
    { id: "s1.accprep", stage: 1, level: "A2", prio: "M", title: "Accusative prepositions", book: [["c7", "Accusative prepositions"], ["c13", "Accusative prepositions"]] },
    { id: "s1.datprep", stage: 1, level: "A2", prio: "M", title: "Dative prepositions", book: [["c15", "Dative prepositions"], ["appB", "Dative"]] },
    { id: "s1.twoway", stage: 1, level: "A2", prio: "M", title: "Two-way prepositions", book: [["c19", "Dative-accusative prepositions"]] },
    { id: "s1.wowohin", stage: 1, level: "A2", prio: "M", kind: "contrast", title: "Contrast: wo? vs wohin?", book: [["c19", "Dative case"], ["c19", "Accusative case"]] },
    { id: "s1.modal", stage: 1, level: "A2", prio: "M", title: "Modals: position, and in subordinate clauses", book: [["c17", "Modals used with infinitives"], ["c17", "Modal position in a subordinate clause"], ["c17", "Omission of the infinitive"]] },
    { id: "s1.conj1", stage: 1, level: "A2", prio: "M", title: "und, aber, oder, denn, sondern", book: [["c29", "Coordinating conjunctions"]] },
    { id: "s1.conj2", stage: 1, level: "A2", prio: "M", title: "weil, dass, wenn — the verb goes last", book: [["c29", "Subordinating conjunctions"], ["c29", "Using subordinating conjunctions"]] },
    { id: "s1.pt21", stage: 1, level: "A2", prio: "S", kind: "verb", title: "Regular Präteritum", verb: ["pt21"], book: [["c14", "Regular past tense"], ["c14", "Weak verbs"]] },
    { id: "s1.wissen", stage: 1, level: "A2", prio: "M", title: "wissen vs kennen", book: [["c18", ""]] },
    { id: "s1.refl", stage: 1, level: "A2", prio: "M", title: "Reflexive pronouns (accusative and dative)", book: [["c23", "Reflexive pronouns"]] },
    { id: "s1.fu", stage: 1, level: "A2", prio: "S", kind: "verb", title: "Future with werden", verb: ["fu1", "fu2"], book: [["c11", "Future tense"], ["c11", "The future tense"]] },
    { id: "s1.comp", stage: 1, level: "A2", prio: "M", title: "Comparative and superlative", book: [["c20", "Comparative and superlative"]] },
    { id: "s1.poss", stage: 1, level: "A2", prio: "M", title: "Possessives; von + dative", book: [["c2", "Ein-words"], ["c20", "Possession"]] },
    { id: "s1.adj", stage: 1, level: "A2", prio: "M", n: 3, title: "Adjective endings (after der-words · after ein-words · no article)", book: [["c23", "Modifiers"], ["appC", "Declension with der-words"], ["appC", "Declension with ein-words"]] },
    { id: "s1.zu", stage: 1, level: "A2", prio: "M", n: 2, title: "zu + infinitive · um…zu, ohne…zu, anstatt…zu", book: [["c24", ""]] },
    { id: "s1.recap", stage: 1, level: "A2", prio: "M", kind: "recap", title: "Recap and checkpoint: Stage 1" },

    // ── Stage 2 — B1 ──
    { id: "s2.conj3", stage: 2, level: "B1", prio: "M", n: 2, title: "obwohl, bevor, nachdem, während, damit, bis, seit", book: [["c23", "Conjunctions"], ["c29", "Subordinating conjunctions"]] },
    { id: "s2.alswenn", stage: 2, level: "B1", prio: "M", kind: "contrast", title: "als vs wenn vs wann", book: [["c29", "When as a conjunction"]] },
    { id: "s2.indq", stage: 2, level: "B1", prio: "M", n: 2, title: "Indirect questions · dass vs ob", book: [["c29", "Interrogatives"]] },
    { id: "s2.rel", stage: 2, level: "B1", prio: "M", n: 2, title: "Relative pronouns (nominative/accusative · dative)", book: [["c22", "Definite article form of relative pronouns"], ["c22", "Der/die/das"]] },
    { id: "s2.relprep", stage: 2, level: "B1", prio: "M", title: "Relative clauses with prepositions; wo, was, wer", book: [["c22", "Was"], ["c22", "Wer and der"]] },
    { id: "s2.gen", stage: 2, level: "B1", prio: "S", title: "Genitive and wessen", book: [["c20", "Genitive case"], ["c28", "Wer"]] },
    { id: "s2.genprep", stage: 2, level: "B1", prio: "S", title: "Genitive prepositions (wegen, trotz, während…)", book: [["appB", "Genitive"]] },
    { id: "s2.verbprep", stage: 2, level: "B1", prio: "M", title: "Verb + preposition (warten auf, denken an…)", book: [["c19", ""]] },
    { id: "s2.woda", stage: 2, level: "B1", prio: "M", title: "wo- / da- compounds (woran, daran)", book: [["c19", "Pronouns and prepositional adverbs"], ["c28", "Prepositional adverbs"]] },
    { id: "s2.adv", stage: 2, level: "B1", prio: "S", title: "Adverbs: types and position", book: [["c23", "Adverbs"]] },
    { id: "s2.pt2", stage: 2, level: "B1", prio: "S", kind: "verb", title: "Strong and mixed Präteritum · Plusquamperfekt", verb: ["pt22", "pt23", "pt24", "pq1", "pq2"], book: [["c11", "Past perfect tense"], ["c16", ""]] },
    { id: "s2.k2", stage: 2, level: "B1", prio: "M", kind: "verb", title: "Konjunktiv II", verb: ["k21", "k22", "k23", "k25", "k24"], book: [["c26", "The Present-Time Subjunctive II"], ["c27", "Subjunctive II"]] },
    { id: "s2.cond", stage: 2, level: "B1", prio: "M", title: "Conditional sentences with wenn", book: [["c27", "Subjunctive II with wenn-clauses"], ["c27", "Wenn"]] },
    { id: "s2.pv", stage: 2, level: "B1", prio: "S", kind: "verb", title: "The passive", verb: ["pv1", "pv2", "pv3", "pv4"], book: [["c25", "Formation of the passive voice"], ["c25", "von or durch"]] },
    { id: "s2.man", stage: 2, level: "B1", prio: "S", title: "man and other ways around the passive", book: [["c25", "Substitutes for the passive voice"], ["c25", "man"]] },
    { id: "s2.modpf", stage: 2, level: "B1", prio: "S", title: "Modals in the Perfekt (double infinitive basics)", book: [["c17", "Modal auxiliaries and double infinitives"]] },
    { id: "s2.lassen", stage: 2, level: "B1", prio: "S", title: "lassen", book: [["c25", "sich lassen + Infinitive"]] },
    { id: "s2.part", stage: 2, level: "B1", prio: "S", title: "Modal particles: doch, mal, ja, halt", book: [["c29", "Doch"], ["c29", "Mal"]] },
    { id: "s2.short", stage: 2, level: "B1", prio: "S", title: "Short answers and words for emphasis", book: [["c29", "Short responses"], ["c29", "Words for emphasis"]] },
    { id: "s2.ptadj", stage: 2, level: "B1", prio: "S", title: "Participles as adjectives", book: [["c29", "Present participles"], ["c29", "Past participles"]] },
    { id: "s2.ndecl", stage: 2, level: "B1", prio: "S", title: "n-declension nouns; adjectives used as nouns", book: [["appC", "Masculine nouns requiring an -(e)n ending"], ["appC", "Adjectives and participles used as nouns"]] },
    { id: "s2.recap", stage: 2, level: "B1", prio: "M", kind: "recap", title: "Recap and checkpoint: Stage 2" },

    // ── Stage 3 — conversation ──
    { id: "s3.greet", stage: 3, level: "B1", prio: "M", kind: "scenario", title: "Greetings and introductions", book: [["c30", "Greetings and introductions"]] },
    { id: "s3.way", stage: 3, level: "B1", prio: "M", kind: "scenario", title: "Asking the way", book: [["c30", "Conversation: In der Hauptstraße (On Main"]] },
    { id: "s3.bus", stage: 3, level: "B1", prio: "M", kind: "scenario", title: "At the bus stop", book: [["c31", "Conversation: An der Bushaltestelle (At the bus"]] },
    { id: "s3.school", stage: 3, level: "B1", prio: "S", kind: "scenario", title: "School and study (studieren vs lernen)", book: [["c31", "Schulen"], ["c31", "Studieren and lernen"]] },
    { id: "s3.shop", stage: 3, level: "B1", prio: "M", kind: "scenario", title: "Shopping and prices", book: [["c31", "Shopping"], ["c31", "Euro und Cent"]] },
    { id: "s3.travel", stage: 3, level: "B1", prio: "M", kind: "scenario", title: "Travel", book: [["c31", "Travel"]] },

    // ── Post-B1 (Could) ──
    { id: "s4.k1", stage: 4, level: "B2", prio: "C", title: "Konjunktiv I and indirect speech", book: [["c26", "Subjunctive I"], ["c27", "Indirect discourse"]] },
    { id: "s4.ext", stage: 4, level: "C1", prio: "C", title: "Extended participle modifiers", book: [["c29", "Extended modifiers"]] },
    { id: "s4.fu2", stage: 4, level: "B2", prio: "C", title: "Futur II", book: [["c21", ""]] },
    { id: "s4.pvx", stage: 4, level: "B2", prio: "C", title: "Advanced passive: sein … zu, sich lassen", book: [["c25", "sein...zu + Infinitive"]] },
    { id: "s4.prefix", stage: 4, level: "B2", prio: "C", title: "Prefixes both separable and inseparable", book: [["c12", "Prefixes that are inseparable and separable"]] },
    { id: "s4.k2p", stage: 4, level: "B2", prio: "C", kind: "verb", title: "Konjunktiv II · past", verb: ["k2p1", "k2p2"], book: [["c26", "The Past-Time Subjunctive II"]] },
  ],
});
