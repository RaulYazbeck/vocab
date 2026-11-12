# PLAN — the grammar book inside the German app

The agreed plan for turning the German app into a complete A1 → B1 course,
with a grammar book as its backbone. Every build session starts by reading
this file and `tools/book/blueprint.json`. Agreed 17 October 2026.

---

## 1. Goal

- **Exam:** the Swiss **fide** test — **oral B1, written A1–A2** (early C permit).
  The real goal is to *learn German*; the test is the yardstick.
- **Hard date: 15 August 2027.** This is the finish date set in the app.
  The app keeps the margin itself (§9): the learner never sets a fake date.
- **Budget:** **60 minutes a day in the app**, plus about **3 hours a week
  speaking with a native** — on top of the hour, outside the app.
- **Rule:** the date is fixed; the scope flexes, silently, from the least
  important end (§5).

### Where the learner is (from the backup of 17 Oct 2026)

| | |
|---|---|
| Words | A1 **1,001 / 1,001 met**; A2 105 / 959; B1 0 / 2,146 — about **3,000 words to go** |
| Strength | 871 of the 1,106 met words are 🌳 Known or ⭐ Strong |
| Verb track | on since 11 Oct; sheets **passed**: pr1–pr5, pr7, im1–im3, pf1, pt11–pt13 |
| Pace | 15 new words/day set, plan pace ≈ 11/day, about 90 reviews due on a busy day |

The A1 vocabulary is done; the grammar beyond verbs has never been taught.
Building sentences ("what comes before what") is the learner's main pain.

---

## 2. Principles

1. **The book is the backbone, never the content.** It gives the grammar
   checklist (nothing missed), the topic structure and the exercise blueprints.
2. **All content is ours.** Our sheets, our sentences, our stories. **No book
   text is ever committed** — the repo is served publicly by GitHub Pages.
   Only the blueprint (headings, exercise numbers/types/counts) is kept.
   The book doesn't own the German language: a short, simple everyday
   sentence (four words or fewer — *Wer ist das?*) is fine even if the book
   happens to use it; from five words on, ours must differ.
3. **Drilling is central.** Every sheet leads straight into its drills; misses
   go back to their *rule*; a rule counts as learned only when it holds over time.
4. **Production first.** fide oral measures speaking, not gap-filling. Drills
   climb towards *producing* sentences, and **every section ends with at least
   one production drill** (build or write a sentence).
5. **Teach by level, organised by chapter.** The book is ordered by topic, not
   level (chapter 29 runs from A2 conjunctions to C1 extended modifiers), so the
   unit of learning is the **section**, scheduled by level across chapters.
6. **Scalable from day one.** Session 1 builds the system; every later session
   only *adds data*. A missing section shows as "coming", never breaks the app.
7. **Existing progress is sacred.** Words, verb sheets, stages, quests, sync —
   nothing a learner earned is lost or reset. Passed sheets count as done.
8. **German app only.** Every course entry point is inert in the French app
   (same pattern as `grammar-de.js`: `WORD_KEY === "fr"` → nothing).
9. **Out of scope:** dictation and anything listening-specific (done outside
   the app), Swiss-German notes, speaking evaluation.

---

## 3. The book

*Practice Makes Perfect: Complete German Grammar* — 31 chapters, appendices A–C,
answer key. 959 pages, so it is never uploaded whole.

| # | Chapter | # | Chapter |
|---|---|---|---|
| 1 | Pronunciation and gender | 17 | Modal auxiliaries in the present and past tenses |
| 2 | Definite and indefinite articles | 18 | *Wissen* and *kennen* |
| 3 | Pronouns, plurals, and the verb *sein* | 19 | The accusative-dative prepositions |
| 4 | Titles, location, and interrogatives | 20 | Genitive case, the comparative, and the superlative |
| 5 | The verbs *haben* and *werden* and negation | 21 | The future perfect, negation, and imperatives |
| 6 | The present tense and numbers | 22 | Relative pronouns |
| 7 | Direct objects and the accusative case | 23 | Modifiers, adverbs, reflexive pronouns, and conjunctions |
| 8 | Irregular verbs in the present tense | 24 | Double infinitive structures (infinitive clauses) |
| 9 | Imperatives | 25 | The passive voice |
| 10 | The present perfect tense | 26 | The subjunctive |
| 11 | Past perfect and future tense | 27 | More on the subjunctive mood |
| 12 | Separable and inseparable prefixes and imperatives | 28 | Building sentences |
| 13 | Accusative prepositions and interrogatives | 29 | Building more sentences |
| 14 | Regular verbs in the past tense and word order | 30 | Conversation |
| 15 | Indirect objects and the dative case | 31 | More conversation |
| 16 | Irregular verbs in the past tense | A–C | Principal parts · prepositions and cases · declensions |

### The blueprint — `tools/book/blueprint.json`

A map of the book **without its text**, made by `tools/book/blueprint.py`
from the chapter PDFs:

```
{ "c28": { "sections": ["Declarative sentences and word order", "Niemand, nichts, and niemals", …],
           "exercises": [ { "id": "28.6", "section": "Niemand, nichts, and niemals",
                            "type": "transform", "items": 7 }, … ] }, … }
```

- **445 exercises, about 4,900 items** across 31 chapters.
- Exercise types (from the instruction): `fill` ≈ 45 %, `transform` ≈ 25 %,
  `compose`/`combine`/`order`, `question`, `negate`, `answer`, `translate`,
  `write-own`, `read`, `other`. Item counts are approximate (the parser counts
  numbered lines); headings are thin for chapters 3 and 21.
- It drives three things: **what to mirror** in each build session, the
  **coverage report** (every exercise ends up *mirrored*, *generated* or
  *skipped*), and **fewer uploads** (structure is known; only the chapters
  being built are uploaded, for their explanations).

### Uploads

PDFs never carry over between chats. Each session needs **only its own
chapters** (§12). Extract with `pdftotext -layout`, read the explanations,
skip the exercise items (the blueprint already has their structure), and keep
the extracted text out of the repo.

---

## 4. Structure of the course

```
Stage (0 = A1 sweep · 1 = A2 · 2 = B1 · 3 = conversation · post-B1)
 └─ Section  { level, priority (background), book: ["c28", "Interrogative words"] }
     ├─ Sheet(s)   our lesson — the existing sheet format (grammar-sheets-de.js) + new fields
     ├─ Rules      one ID per rule on the sheet (e.g. "neg.kein-noun")
     └─ Drill sets one per mirrored book exercise ("d28.6" ↔ Übung 28•6),
                   our own items, each tagged with the rule(s) it tests
```

- **Existing verb sheets** (`pr`, `pf`, `im`, `pt1`, `fu`, `k2a`, `pt2`, `pq`,
  `pv`, `k2p`) stay exactly as they are; they are *linked* to their book
  sections and get mirrored drills. They are never rewritten.
- **One data file per stage** (or per chapter pack if a stage grows big),
  discovered by a registry — adding content never needs code changes.
- **Checks run on every file:** the format is valid; every item points to a
  real rule; every rule belongs to a sheet; every blueprint exercise of a
  built section has a status; engine-checkable answers (verb forms) agree with
  the verb engine (`grammar-de.js`), as `tools/verb-track` already does for sheets.

---

## 5. Order and priority

**What the learner sees is the order.** Priority lives in the background
(MoSCoW: *Must* / *Should* / *Could*) and is used only by the planner: if time
runs short it drops from the bottom, *Could* first. *Could* = post-B1 (it waits
for every other lesson). *Should*, when behind (since 2 Nov 2026): while the
pace is red (more sheets left than study days), a *Should* lesson not begun
gives its place to the *Must* ones — it comes as soon as no *Must* lesson is
ready, so nothing is skipped; if the date comes first, it is what's left. A
stage's checkpoint stops waiting for it. Never a verb lesson (it paces the verb
track), never a lesson under way; caught up, the usual order returns.

Order rule: foundations and the most-used structures first; within a level,
what the next sections build on comes first; speaking-useful phrases early.

---

## 6. The sheet skeleton

✓ = existing, already passed · ◐ = existing, not reached yet · **N** = new sheet ·
(ch) = book chapters it draws from. One sheet = one idea, 3–4 rules.

### Stage 0 — A1 sweep (test-out first)

Each section opens with a short **test-out quiz**: pass → marked done, light
review only; miss → the sheet is scheduled.

| | Sheet | ch |
|---|---|---|
| N | Sounds and spelling (ä ö ü, ch/sch, ei/ie, final -d) | 1 |
| N | Gender: der/die/das and the clues | 1 |
| N | Articles: definite, indefinite, der-words, ein-words | 2 |
| N | Plurals | 3 |
| N | Personal pronouns; du / ihr / Sie | 3 |
| N | Verb second and yes/no questions | 3, 6, 28 |
| N | W-questions (basic) | 4, 6 |
| N | nicht vs kein *(the Session 1 pilot)* | 5, 28 |
| N | Numbers, time, dates | 4, 6 |
| N | Accusative: the articles | 7 |
| N | Accusative pronouns and *man* | 7 |
| ✓ | pr1–pr5, pr7 (Präsens) · im1–im3 (Imperativ) · pf1 (Perfekt structure) · pt11–pt13 (war & hatte, the modals' past) | 6, 8, 9, 10, 12, 17 |
| N | Recap: Stage 0 | — |

### Stage 1 — A2 core

| | Sheet | ch |
|---|---|---|
| N | Fronting; time – manner – place | 14, 28 |
| N | niemand, nichts, nie, gar nicht | 5, 28 |
| N | Set responses and greetings (early: they feed the speaking sessions) | 29, 30 |
| ◐ | pf2–pf6 — Perfekt complete | 10 |
| ◐ | pr6 — separable vs inseparable | 12 |
| N | Dative: articles and the indirect object | 15 |
| N | Dative pronouns; the order of two objects | 15 |
| N | Dative verbs (helfen, gefallen, gehören…) | 15 |
| N | Contrast: accusative vs dative | 7, 15 |
| N | wer / wen / wem, welcher, was für *(after the dative since Session 3: wem? is its question)* | 13, 28 |
| N | Accusative prepositions | 7, 13 |
| N | Dative prepositions | 15, B |
| N | Two-way prepositions | 19 |
| N | Contrast: wo? vs wohin? | 19 |
| N | und, aber, oder, denn, sondern | 14, 29 |
| N | weil, dass, wenn — the verb goes last *(before the modals since Session 4: the modal lesson puts the modal at the end of a weil clause)* | 14, 29 |
| N | Modals: position, and in subordinate clauses (pr5, pt12 ✓) | 17 |
| ◐ | pt21 — regular Präteritum | 14 |
| N | wissen vs kennen | 18 |
| N | Reflexive pronouns (accusative and dative) | 23 |
| N | Verb + preposition (warten auf, sich freuen auf, denken an…) *(in Stage 1 since 2 Nov 2026: everyday spoken A2)* | 19 |
| ◐ | fu1–fu2 — future with werden | 11 |
| N | Comparative and superlative | 20 |
| N | Possessives; von + dative | 2, 20 |
| N | Adjective endings ×3 — after der-words · after ein-words · without article | 23, C |
| N | zu + infinitive · um…zu, ohne…zu, anstatt…zu (×2) | 24 |
| N | Recap and checkpoint: Stage 1 | — |

### Stage 2 — B1

| | Sheet | ch |
|---|---|---|
| N | obwohl, bevor, nachdem, während, damit, bis, seit (×2) | 23, 29 |
| N | als vs wenn vs wann (contrast) | 29 |
| N | Indirect questions (ob and W-words) · contrast dass vs ob | 23, 29 |
| N | Relative pronouns ×2 — nominative/accusative · dative | 22 |
| N | Relative clauses with prepositions; wo, was, wer | 22 |
| N | Genitive and wessen | 13, 20 |
| N | Genitive prepositions (wegen, trotz, während…) | B |
| N | wo- / da- compounds (woran, daran) | 19, 28 |
| N | Adverbs: types and position | 23 |
| ◐ | pt22–pt24 — strong and mixed Präteritum · pq1–pq2 — Plusquamperfekt | 11, 16 |
| ◐ | k21–k25 — Konjunktiv II | 26, 27 |
| N | Conditional sentences with wenn (unless k24 already covers them) | 26, 27 |
| ◐ | pv1–pv4 — passive | 25 |
| N | *man* and other ways around the passive | 25 |
| N | Modals in the Perfekt (double infinitive basics) | 17, 24 |
| N | lassen | 25 |
| N | Modal particles: doch, mal, ja, halt | 29 |
| N | Short answers and words for emphasis | 29 |
| N | Participles as adjectives | 29 |
| N | n-declension nouns; adjectives used as nouns | C |
| N | Recap and checkpoint: Stage 2 | — |

### Stage 3 — conversation (chapters 30–31)

Six **scenario units** — greetings and introductions · asking the way · at the
bus stop · school and study (studieren vs lernen) · shopping and prices ·
travel. Each: a dialogue, key phrases, drills (order the conversation, pick the
response, fill the missing line) and a short writing prompt. Small — about two
sheets each.

**Where they come (since 2 Nov 2026):** not at the end — each right after the
grammar its dialogue needs, among the Stage 1 and 2 lessons: greetings and
introductions after the dative prepositions (*ich komme aus …, wohne seit …*,
≈ early Jan) · asking the way after wo? vs wohin? (≈ mid Jan) · the bus stop after
verb + preposition (*warten auf den Bus*, ≈ Feb) · shopping after the adjective
endings (*ich möchte …, eine Nummer größer, die rote Jacke, Ist das Ihrer?* — moved
there on 8 Nov 2026 from after the modals, ≈ Mar) · school and study after the
Stage 1 checkpoint · travel after Konjunktiv II (*ich hätte gern …*). They stay
their own part (💬) and outside the stages' checkpoints; five are *Must*,
school and study *Should*.

### Post-B1 (background, *Could*)

Konjunktiv I and indirect speech (26, 27) · extended participle modifiers (29) ·
Futur II (21) · advanced passive (sein…zu, sich lassen; 25) · prefixes both
separable and inseparable (12) · k2p1–k2p2.

**Size:** about **60 new sheets + 6 scenario units + ~10 contrast/recap
sheets**; with the ~25 existing sheets not yet reached, **≈ 95–100 sheets
ahead** — at one a day, all new material is in by about March–April.

---

## 7. Sheets and exercises

### Sheet format

The existing one (`js/grammar-sheets-de.js`): coloured structure blocks
(`struct`), one *why* line, up to 4 rules, a table or list, examples, the trap,
and a quiz (3 drawn from 5+). New fields: `level`, `prio`, `book`
(chapter + section), `rules` (IDs), `drills` (linked drill sets).
Kinds: **lesson** (one idea) · **contrast** (two things that get confused) ·
**recap** (one screen at the end of a stage).

### Exercise types

| # | Book format | App format | Checked by |
|---|---|---|---|
| 1 | Fill the blank from a closed set (haben/sein, als/wenn/wann, doch/mal) | pick → type | answer list |
| 2 | Supply a form (participle, auxiliary + participle, conjugation) | type | verb engine |
| 3 | Transform: tense change, negate, statement → question, W-word for the highlighted part, fronting, joining with a conjunction, direct → indirect question | tiles first, then typed | word-order rule checker + answer variants |
| 4 | Compose from a word list (`morgen / kommen / er / mit / Freund / nach Hause`) | sentence builder: order the tiles, add the missing articles and endings | rule checker + engine |
| 5 | Complete freely (`Er starb, als ___`) | open answer + model answers | self-check with a checklist |
| 6 | Translate short phrases or questions | type | answer variants |
| 7 | Write original sentences from a cue | short writing | self-check |
| 8 | Choose the right response / order a conversation | pick / order | answer list |

- **Highlighted element:** "negate the underlined part" becomes a coloured highlight.
- **Tolerance:** capitals, ß/ss, a missing umlaut is a *soft* slip (as the
  learning log already does), several valid word orders accepted by the rule
  checker rather than one fixed string.
- **Open answers** (5, 7) are scored by the learner against a model and a
  checklist; they never count against review unless marked wrong.
- **Stage ladder per rule:** pick → type → build from tiles → free production.
- **Volume:** **8–10 hand-written items per mirrored book exercise**, our own
  sentences in everyday Swiss-life settings, built from words the learner
  knows where possible. Pure conjugation tables (chapters 6, 8, 14, 16) are
  *generated* by the engine, not hand-written. Generators top up any drill
  whose items run out. The book's exercises are the model for format and
  difficulty, never for wording.

---

## 8. How sheets and drills work together — the daily loop

| Block | Min | What |
|---|---|---|
| Words | 15 | the existing Path (new + reviews) |
| Warm-up | 5 | yesterday's grammar misses |
| Sheet | 10 | the next sheet in order + its 3-question quiz |
| Drill | 15 | the drill set linked to *this* sheet, 10–15 items, same day |
| Review | 10 | due rule items + mixed drill items from earlier sheets |
| Writing | 5 | short writing prompt (rotating, light) |

- **A wrong answer** names the rule and shows the sheet's *why*; the rule
  enters review until it holds. **Learned** = right twice on separate days.
- **Every 5th day** is a contrast day: mixed items across several sheets, no
  new sheet.
- **End of a stage:** a checkpoint; ≥ 80 % moves on, below that the learner
  gets targeted drills on the weakest rules only.

What exists today and what is new:

| | |
|---|---|
| Exists | Path with words and reviews · verb sheets + quiz in Today · verb rules (`vx_r:`) in review · games (scramble, builder, cloze, cases…) · mastery quiz per verb unit · mistake types (learning log) |
| New | sheets beyond verbs · drill sets linked to sheets · non-verb rules in review · test-out · contrast days · stage checkpoints · writing prompts · course menu and coverage |

---

## 9. The date

- **Finish date in the app stays 15 August 2027.** The word planner already
  keeps a margin: it aims to *meet* every word about 75 days early
  (`PLAN.LAG`) and allows ~30 days to reach Known (`KNOWN_LAG`, `js/path.js`).
- **The grammar planner gets the same behaviour:** it aims to have every
  sheet passed with a similar margin (≈ early July), leaving the summer for
  consolidation, mocks and the exam.
- **Balance:** the planner weighs word reviews, new words and grammar so the
  hour is not eaten by reviews; in heavy grammar weeks it may ease new words
  (within what the date allows).
- **If behind**, levers in order: two sheets on easy days → drop *Could* →
  sample drills instead of all → more minutes. *Must* is never cut.
  *As built (Session 1 follow-up 2; the spacing per sheet is replaced by the
  lesson clock below):* **the finish date sets the pace** —
  no minutes to pick. The course's sheets still to learn are spread evenly
  over the days left to the target (a new sheet every ⌊days ÷ sheets⌋ days,
  1–7, recomputed daily), so they don't come every day until done and then
  stop: the days between bring the reviews, mixed practice and writing. A
  later date spaces them out, an earlier one brings them closer; a missed
  sheet, a drill or a missed checkpoint carries on the next day anyway.
  Simulated: the last section lands 1–6 days before the target with every
  rhythm tried (30 % of days skipped, a 30-day break, a start 5–6 months
  late, 15 Jul / 15 Aug / 15 Dec dates); every rule 🌳 Known by mid-August.
  The gap counts *study days* (the days I open the app): my rhythm over
  the last 4 weeks scales it, so coming every other day spaces sheets by
  study days and still lands on the date. Mixed (contrast) days fall on the
  days between sheets. A passed test-out takes its sheet and drill out of
  today's plan. Verified (Session 1 follow-up 3): `sim.mjs --matrix` (39
  runs, all pass) and `sim-app.mjs` (the real app, 150 days, ~29,000
  answers: the count never grows, the plan is met on perfect days, state,
  cloud docs and logs agree) — and the two-device sync with texts.
  *Then, when behind:* tight (≤ 1 sheet a day needed) — the
  contrast days bring a sheet too; behind — a second sheet every other day,
  never while rules are failing (more than 8 to fix) or the reviews pile
  past 90; past 1.5 a day the planner says to pick a later date. My own
  pace (sheets a day over the last 4 weeks, days with nothing built not
  counted) tells when I'd finish, and the planner shows it when it's late.
- **Status** is shown next to the existing word planner: green / amber / red.

### The lesson clock (agreed 19 Oct 2026 — replaces "a new sheet every N days")

The course runs **lesson, consolidate, lesson, consolidate**. The verb
lessons are lessons of the course like any other (they follow the same clock;
their sheets still live in the verb track).

- **Lesson:** one of the 73 in `js/course/plan.js` (course lessons, verb
  lessons, checkpoints, the post-B1 bonus). *nᵢ* = its sheets (a checkpoint
  counts 1).
- **Study day:** a day I open the app.
1. **One lesson at a time**, in course order.
2. **Inside a lesson:** one sheet per study day, on consecutive study days,
   until its *nᵢ* sheets are done (each course sheet with its drill the same
   day). A lesson of *n* sheets takes *n* study days.
3. **Between two lessons:** a break of *G* study days — no new sheet; the
   drill, reviews, mixed practice and writing of what I learned.
4. **The same G after every lesson**, 1 sheet or 10:
   *G = (study days left − sheets left) ÷ lessons left*, the study days
   counted to the target (finish date − 40 days ≈ 6 July for 15 Aug) and
   scaled by my rhythm (the share of days I open the app). Capped at 7.
5. **x ± 1:** the fraction is carried, so the breaks alternate around G
   (2.3 → 2, 2, 3, 2, 2, 3…) and the average is exact.
6. **Recomputed every day** — with missed days, my progress and every lesson
   added — but only during a break: a lesson under way is never stretched.
7. A day missed mid-lesson: the lesson carries on at the next study day. A
   sheet quiz failed: the same sheet the next day (the lesson takes a day
   more). A passed test-out ends the lesson that day. Back after a long time
   away (twice the break in the calendar): the next lesson starts at once.
8. **Behind** (more sheets than study days): no breaks; then a second sheet
   on every other day (never while rules are failing or reviews pile up);
   past that the planner says to pick a later date.
9. The post-B1 bonus lessons aren't paced to the target: after the rest,
   spread to the finish date itself.

**Sheet counts are estimates until a lesson is built.** `n` in `plan.js` is a
deliberately generous guess (from the book headings the lesson covers) so the
pace counts the course as if it were complete; a built lesson counts its real
sheets. While building a chapter the estimate is **not** a target — write as
many sheets as the topic needs; the clock adjusts the next day. Once every
lesson is built, the counts are exact.

**Order with an incomplete app:** the next lesson is the first one in course
order that is built and whose prerequisites (`after` in `plan.js`) are done.
So when every built A1 lesson is done, a built A2 lesson comes next (today:
the A2 verb lessons); a lesson that depends on one not built yet waits. When
an earlier lesson is built later, it comes next (it fills the gap) before the
order moves on. If nothing built is ready, the break simply continues
("waiting for new lessons") and the next day's recalculation absorbs it.

---

## 10. Menu and screens

- **Today** stays one button that runs the whole loop.
- **📖 Course** (replaces 📐 Grammar), built like the verb track's screens:
  the next lesson · one line on the pace · the parts (A1 · A2 · B1 ·
  Conversation · bonus) as cards that open their numbered lessons in place,
  one part at a time → a lesson (its sheet, one Practise card, its rules "in
  your reviews", the book chapters).
  Words on screen: part · lesson · rule. The verb track keeps its own screens
  (📐 Verbs), linked from the Course and shown in the parts at their level;
  back always returns to where you came from.
- **📚 By chapter:** the book's chapters, each with the lessons that teach it
  and your progress, then its **Übungen** that have their drill, in the
  book's order — each one runs on its own (to work along the book); the only
  place a single exercise is picked. What each exercise became (mirrored ·
  generated · planned) is build data: `tools/course`, never on screen.
- **🧩 Practise:** three rows that never grow — ✅ **Due today** (today's
  share of what's due: words, verbs, rules; the backlog the plan spreads over
  later days isn't in it; at 0 it reads "Done for today", closed) · 📏 weak
  spots · 🔀 mixed. One lesson: its page; one Übung or a chapter's Übungen
  mixed: 📚 By chapter.
- **🗺️ Journey (German):** few words — the goal date, the tiers as icons and
  numbers, "📖 Grammar · 0/73 · 🟢" and the next 7 days with the lesson days
  lit, then "Coming up" (the graph, a short legend).
- **✍️ Writing:** a level (A1 · A2 · B1), a theme (13, one line per level,
  or 🎲) and one Write button; my texts below, kept forever, copied for Claude.
- **🎓 Exam** (Session 9): fide countdown, monthly mock, readiness hint.
- **Plan settings:** the finish date (exists) sets the grammar pace.

---

## 11. Fitting into the existing app

Read before building (Session 1): `js/verb-track.js` (how sheets enter Today,
units, rule items, the ledger), `js/path.js` (plan, pace, finish date),
`js/grammar-sheets-de.js` and `js/grammar-ui.js` (sheet format and screens),
`js/grammar-de.js` (verb engine, cases), `js/srs.js` (stages), `js/quests.js`,
`js/sync.js` / `js/sync-merge.js` (what syncs), `js/learning-log.js`, and the
tests in `tools/verb-track`, `tools/quests`, `tools/sync`.

- New item records live next to the existing ones in `S.words` with their own
  prefix, on the same 0–7 stages, so review, sync and stats keep working.
- The 13 passed sheets are counted as done; their book sections go straight
  to drills.
- Nothing in the French app changes.
- The learner keeps a backup (`gv5_de`, exported 17 Oct 2026) before Session 1.

---

## 12. Build order — 9 sessions

Each session: a **new chat**, upload the files listed, paste the **shared
prompt** + that session's line, build, test, push. After each session the
learner tests in the app and brings the issues to the next one.

**No chapter is guessed.** A session starts by checking the uploaded
chapters against `node tools/course/session.mjs N`. If one is missing (for
example chapter 5 in Session 2), Claude names the missing chapters and waits
for them; it never writes a lesson or drill from a chapter it wasn't given.

**No exercise is dropped between sessions.** Every lesson in
`js/course/plan.js` names the session that builds it (`ses`), and
`node tools/course/session.mjs N` derives what Session N uploads: the
chapters of its lessons, plus every chapter holding an exercise planned for
them. An exercise a session can't build yet (it belongs to another lesson)
is marked `planned` with that lesson; the validator fails if that lesson's
session is already done, or doesn't upload the exercise's chapter. Each
session ends by raising `DONE` in `session.mjs`, which makes the validator
demand that every exercise of the lessons built so far is covered (mirrored,
generated, or skipped with a reason).

### Shared prompt (paste first, every session)

> Read `PLAN.md` and `tools/book/blueprint.json` first; they hold the agreed
> plan. This is **Session N of 9** (PLAN.md §12). I've uploaded this session's
> book chapters. **Before anything else**, run `node tools/course/session.mjs N`
> and compare its list with what I uploaded: if a chapter is missing, stop and
> tell me which ones — never build from a chapter you don't have, and never
> invent its exercises. Then extract them with `pdftotext`, never commit book text, and
> write our own sheets and drill items that mirror the blueprint's exercise
> structure. Every section ends with at least one production drill. Every
> exercise of the uploaded chapters gets a status; one left "planned" names
> a lesson of a later session that uploads its chapter (no exercise dropped).
> Raise `DONE` in `tools/course/session.mjs` to N before the checks. My
> existing progress must stay intact. Follow CLAUDE.md, run the checks and
> tests, then tell me exactly what was pushed and give me a short test checklist.
> Issues from my last test: *(list, or "none")*

### Session 1 — the system (scalable from day one)

**Upload:** chapters 5, 28. **Line:** "Session 1: build the course system, piloted on nicht vs kein."

**Builds:** the course registry (stages → sections → sheet + rules + drill
sets; data files discovered automatically) · sheets beyond verbs · the drill
runner with all 8 exercise types · checkers (answer variants with tolerance,
verb engine, word-order rule checker) · misses → rule review · test-out quiz ·
grammar block in Today next to the verb sheets · grammar planner with margin
and balance (§9) · 📖 Course menu with the book map and coverage from the
blueprint · the validator and tests every later session reuses · **pilot
content:** the nicht vs kein section (sheet + drills mirroring 5.x and 28.2–28.4).

**Test:** the pilot appears in Today and in 📖 Course; a miss shows its rule;
old progress and verb sheets are intact; the French app is unchanged.

**Built (17 Oct 2026):** `js/course-de.js`, `js/course-ui.js`, `js/course/plan.js`
(the whole skeleton, 73 sections), `js/course/s0-negation.js` (the pilot: 1 sheet,
4 rules, 12 drill sets — 5•4–5•10, 28•2–28•4 mirrored, 5•1 generated, two
production sets); the validator and tests in `tools/course` (README there says
how a later session adds a section). The blueprint parser now also finds a
heading right after an exercise (chapter 28's *Negation* and *Word order*).
Not yet: easing new words in heavy grammar weeks (the planner trims the
grammar block's review and writing first and brings two sheets on easy days).
Verified the same day: a simulated year at full size (55 lesson sections,
220 rules, 6,490 items) — every rule reaches 🌳 Known, ~12–15 grammar
questions a day, 39–41 on the busiest; rule reviews get 6–30 a day (all the
room a day without a new sheet leaves). Content kept to A1 words met.
Follow-up the same week: the logs (usage report: per-day course column,
course answers with their time; learning log: the course's misses with what
I wrote → the right answer, its JSON); the planner follows my pace and the
levers above (simulated: 30 % of days skipped, a 30-day break, a start 5–7
months late); stage checkpoints and multi-sheet sections; the **writing
journal** — `js/course/writing.js` (30 prompts, A1 30 words · A2 60 · B1 90,
Swiss-life situations, some tied to a section), the day's writing part, a
live word count, saved as written ("good job", always done, no score) to
`S.writing` (one cloud doc a year, every text kept with its date, merged
across devices) and listed in the learning log for Claude to correct (the
corrected ones stay listed by date); ☰ › 📖 Course › ✍️ Writing shows them all,
copies them all, and ticks a text as corrected. Writing comes on the days
between new sheets, on mixed days, and on light days.

**Fixes after the first week (agreed 19 Oct 2026):**
1. **The session length is the length:** the grammar cards' questions count
   inside Quick 15 / Regular 30 / Long 60 — they take room from word reviews,
   never from new words. A lesson that doesn't fit a session waits for the
   next session (the session stays 15).
2. **✍️ Writing:** tapping a starter types it into the text, at the cursor.
3. The Journey's "x/73" counts lessons done (+1 for each full lesson; a verb
   lesson once all its verb sheets are passed) — unchanged.
4. The Journey's coming days include the course's questions, and the
   "out of reach" warning counts the course too.
5. **Twists:** a twist round counts for stars and rank-ups when it is neutral
   or harder (🪞 Mirror, 💀 Sudden death, 🚀 Turbo); 🌟 Golden words makes
   it easier, so it doesn't.
6. **The lesson clock** (§9).

### Session 2 — Stage 0, the A1 sweep

**Upload:** chapters 1, 2, 3, 4, 5, 6, 7, 8, 9, 12, 17, 28. *(from the course map: `node tools/course/session.mjs 2`)*
**Builds:** the remaining 10 Stage 0 sheets with test-out quizzes and mirrored
drills; links from the passed verb sheets to chapters 6, 8, 9, 10, 12; Stage 0 recap.
**Test:** test-out — passing skips a sheet, missing schedules it.

**Built (21 Oct 2026):** the ten Stage 0 lessons, in `js/course/s0-*.js` — Sounds and
spelling (1 sheet) · Gender (2) · Articles: der-words and ein-words (2) · Plurals (2) ·
Personal pronouns; du/ihr/Sie (2) · Verb second and yes/no questions (2) · W-questions (1)
· Numbers, time, dates (2) · the accusative's articles (2) · its pronouns and *man* (2):
18 sheets, 61 rules, 77 drill sets (~770 items of our own, Swiss-life sentences), each
lesson ending with its production drills (translate / build / write your own) and opening
with its test-out (6–8 questions covering every rule, one miss allowed — the lesson
page says how many). The **A1 verb lesson's book exercises** (`s0-verbs.js`, 36
sets: chapter 6's present, 8's stem changes, 9 and 12's commands, 17's modals and their
past, plus pf1 and war/hatte): 8 generated by the engine (the present, the Präteritum and
commands), 28 our own with every verb form checked against the engine; their rules are
the verb sheets' own points, so a miss names the sheet's rule. They come from the
lesson's page (🧩 Practise), 📚 By chapter, and mixed into the contrast days and 🔀 Mixed
(the verb sheets were already passed: their book sections go straight to drills). The
**Stage 0 checkpoint** (20 questions, 80 %). Every exercise of the uploaded chapters has a
status — 98 mirrored, 22 generated, 40 planned with the later lesson that uploads its
chapter (7•10 → accusative prepositions, 7•13 → wer/wen/wem, 12•1–12•10 → separable vs
inseparable, 12•11 → post-B1 prefixes, 17•5–17•6 → lassen, 17•8–17•15 → modal position,
17•16–17•17 → modals in the Perfekt); `DONE` = 2. Small engine changes the content
needed: the generator also gives the Präteritum and commands; the word-order rule moves
*um acht Uhr* whole (it used to leave *Uhr* behind); a question set's tiles start small
(`low`); a set too big for one drill gives its least-asked sets in turn; the validator
checks verb forms with a separable prefix in place and every whole sentence of a sheet
against the book. **My progress:** nothing reset — the pilot and the A1 verb lesson stay
done; the new lessons come next in Today (earlier in course order, they fill the gap
before the A2 verb lessons), each with its test-out first; an A2 verb lesson already
under way finishes first. Tests: 20 new unit tests (where the progress lands, a two-sheet
test-out, the verb lesson's rotation and mixed days, the engine's forms); the browser
tests follow the lesson the clock gives, and run every drill set through the real runner.

### Session 3 — Stage 1A

**Upload:** chapters 5, 7, 10, 11, 12, 13, 14, 15, 28, 29. *(from the course map: `node tools/course/session.mjs 3`)*
**Builds:** fronting / time–manner–place · niemand, nichts, nie · wer/wen/wem,
welcher, was für · set responses and greetings · dative ×3 · contrast
accusative vs dative · drills for pf2–pf6 (ch 10) and pr6 (ch 12).

**Built (26 Oct 2026):** the eight Stage 1A lessons, in `js/course/s1-*.js` — Fronting;
time – manner – place (2 sheets: one thing first — the object, deshalb / trotzdem…; then
when → how → where) · niemand, nichts, nie, gar nicht (2: the words that negate alone;
gar nicht · noch nicht · nicht mehr) · Set responses and greetings (2: hello, thanks, sorry,
good wishes; Gern! · Leider nicht. · Keine Ahnung.) · the dative's articles and the indirect
object (2) · its pronouns and the order of two objects (2) · the dative verbs (1, with
*Mir ist kalt*, *Das tut mir leid*) · the accusative/dative contrast (1) · wer / wen / wem /
wessen, welcher, was für (2): 14 sheets, 44 rules, 59 drill sets (589 items of our own,
Swiss-life sentences), each lesson ending with its production drills (build · translate ·
write your own). No test-out after Stage 0 (as planned): each lesson opens with its sheet.
The **A2 verb lessons' book exercises**: the Perfekt (`s1-perfekt.js`, 25 sets — chapter 10
whole, 28•1, the Perfekt after weil / dass, the tricky haben / sein) and separable vs
inseparable (`s1-prefixes.js`, 12 sets — chapter 12's prefix exercises); their tables are
generated by the engine (the generator now gives the Perfekt too: *hat gegessen*), every other
verb form checked against it (319 items). Every exercise of the uploaded chapters has a status
— of their 158: 86 mirrored, 9 generated, 63 planned with the later lesson that uploads its
chapter; `DONE` = 3. **Changes to the map:** wer / wen / wem moved after the dative lessons
(*wem?* is the dative's question; the lesson teaches wer, wen, wem and wessen together);
chapter 11's "Adverbs of time" went to the future lesson (its 11•8 · 11•9 are future-tense
drills), so this session needed no chapter 11 after all; chapter 14's 14•8–14•10 (und / aber /
denn, dass / weil, the chapter's mixed review) went to the conjunction lessons (Session 4);
28•1 (one sentence in every tense) is drilled with the tenses the learner has (present ↔
Perfekt, war / hatte); 13•2 and 13•7 are covered by the Stage 0 sets that ask the same (d7.4,
d28.17); the dative verbs and the contrast lesson also wait for the dative pronouns. Chapter
30 wasn't needed: its "Greetings and introductions" has no exercise (the greetings sheet is
our own; the chapter's dialogues are Session 8's). **Diagnosis:** each lesson names the rule a
typical mistake breaks — the Perfekt and prefix drills too (*haben … gegangen* → sein;
*geverloren* → no ge-; *Du zumachst* → the prefix goes last) — 22 such cases are now checks in
the validator; the book check also catches a sentence after a " · " in a sheet's rules.
**My progress:** nothing reset. Stage 0 keeps coming first; once it and its checkpoint are
done, the A2 lessons come in course order: fronting, niemand / nichts, set responses, the
Perfekt (verb lesson), separable vs inseparable, the regular Präteritum (verb lesson), the
dative ×4, wer / wen / wem. A lesson under way always finishes first. Tests: a Session 3 block
in `t-unit` (the order the lessons come in, what waits for what, no test-out, the generated
Perfekt, participles in the verb log, the Perfekt lesson's practice); the clock test takes the
lessons of Sessions 2–3 out to replay Session 1; `t-course` runs every new drill set through the
real runner and lists chapters 5 and 28's new Übungen.
**Review the same day:** fixed — a wrong ending (*den Leute*, *nette*) counted as "almost, check the
spelling" and was credited on the retry (now a mistake, its rule named); the checker moved *heute*
out of *bis heute*; a sheet missed in Today brought a drill on the whole lesson (now that sheet's
rules: Stage 0's two-sheet lessons had it too); 28•9 asked for dative words before the dative
(now prepositional phrases come as chunks); a few proofreading fixes, small first tiles, two tables
narrowed. New: `t-stage1.mjs` (Stage 1 in the real app, day by day, the lessons as built). Also
(an older bug, Session 1's): an answer wrong all the way through, in the nicht/kein lesson, was
blamed on *kein* ("it needs its negative") — a *missing* or *extra* detector now names its rule only
when that word is (nearly) all that differs; otherwise the item's own rule takes the miss.
That bug also flattered the sim: its placeholder lessons (copies of the pilot) carried the pilot's
detectors, so every miss on them went to *kein* and the placeholder rules never took one — the
"struggling (60 %)" scenario passed at 98 % Known only because of it. Without it the sim showed a
real planner bug (older, Session 1's): with more rules waiting than a day holds, the slips came in the
course's order every day and the rules due lowest stage first, so some waited weeks unasked (0 of 17
review places went to rules due). Now the longest waiting come first (slips by when last asked, rules
due by their due date) and the rules due keep a third of the review. A learner who stays near 60 %
can't have every rule Known by the finish date: the sim asks of them half Known at least and none
waiting unasked for two weeks; 75 % and up still have to have every rule Known (98 %).
And two older bugs of the day's plan, which `sim-app` only meets after about four months (it now
runs 150 days and names each failing day's cards): the plan sized the course's reviews against the
morning's bare scan, every session afterwards against the plan's own reviews (the verb items' too) —
up to 15 questions apart; now the course makes its morning numbers against the plan's figures. And a
review cut over two sessions counted, in the plan, only up to the longer card (the second card's own
length) — now each card's questions count; a card left and opened again still counts once.
(The drill kept to the sheets read is sometimes shorter than 14: the plan now counts a drill by its
real length.)

### Session 4 — Stage 1B

**Upload:** chapters 7, 11, 13, 14, 15, 17, 18, 19, 23, 29, appendix B. *(from the course map: `node tools/course/session.mjs 4`)*
**Builds:** prepositions ×3 (accusative, dative, two-way) · contrast wo? vs
wohin? · modal position · und/aber/oder/denn/sondern · weil/dass/wenn ·
wissen vs kennen · reflexive pronouns · drills for pt21.

**Built (1 Nov 2026):** the nine Stage 1B lessons, in `js/course/s1-*.js` — the prepositions
(`s1-prep.js`): accusative (2 sheets: für, ohne, durch… + den · um 8 Uhr, bis Freitag, für
20 Franken, and *dafür* for a thing), dative (2: mit, bei, zu… + dem, zum / zur · zu, nach or
bei? aus, von, seit, gegenüber, *damit*), two-way (2: wo? + dative, im / am · wohin? +
accusative, ins / ans, and time: am Montag, vor einem Jahr), the contrast wo? or wohin? (1:
stellen → stehen, legen → liegen, hängen); joining sentences (`s1-conj.js`): und, aber, oder,
denn, sondern (1) · weil, dass, wenn — the verb last (2: weil and dass · wenn, and the side
sentence first: verb, comma, verb); the modals' position (`s1-modal.js`, 2: the modal second,
the infinitive last, nicht müssen ≠ nicht dürfen · the modal at the end of a weil / dass
clause, and on its own); wissen or kennen (`s1-wissen.js`, 1); reflexive pronouns
(`s1-reflexive.js`, 2: sich · mir or mich?). 15 sheets, 48 rules, 85 drill sets (848 items of
our own, Swiss-life sentences), each lesson ending with its production drills. No test-out
after Stage 0. The **regular Präteritum's book exercises** (`s1-praeteritum.js`): its four
tables generated by the engine (14•1–14•4, prefixes too: *holte ab*), into the past (14•5) and
Opa's farm childhood (14•6), every verb form checked against the engine. Every exercise of the
uploaded chapters has a status — of their 131: 86 mirrored, 6 generated, 39 planned with the
later lesson that uploads its chapter; `DONE` = 4. **Changes to the map:** weil / dass / wenn
now comes before the modals (the modal lesson's second sheet puts the modal at the end of a
weil clause); chapter 11's "Position and form of modals" (11•10–11•13) is the future with
*werden* — it went to the future lesson (Session 5, which uploads chapter 11 anyway), so this
session needed no chapter 11 after all; 18•4 practises commands (the blueprint has no
"Imperatives" heading for chapter 18) — it is mirrored with the A1 verb lesson's commands
(`d18.4`); 23•12 (finish a sentence after aber, denn, oder, sondern) is mirrored with 29•4;
19•8 waits for the wo- / da- compounds, 19•9 for verb + preposition, 23•1–23•3 for adjective
endings and adverbs, 23•11 and 23•13 for Session 6's conjunctions. **The checker:** a modal's
or wissen's form is grammar, never "almost" (*mögst* for *magst*); the fix is shown as it's
spelt (*möchte*, not *mochte*); a gap that closes a sentence («…, aber ___.») takes the missing
part alone or the whole sentence. **Diagnosis:** 38 typical mistakes of the new lessons are now
checks in the validator (*mit den Bus*, *für ihm*, *im Kino* for a movement, *Die Milch stellt*,
*weil ich muss arbeiten*, *Mögst*, *seit … gewohnt*…). **Screens:** every new sheet's table fits
a phone whole — no sideways scrolling to find a column (a browser check from Session 4 on).
**My progress:** nothing reset. A lesson under way finishes first; then the course order: after
fronting comes und, aber, oder… (built now, earlier in the order: it fills the gap), then
niemand / nichts, set responses, the Perfekt and prefix lessons, the accusative prepositions,
the regular Präteritum, the dative ×4, wer / wen / wem, the dative and two-way prepositions,
wo? or wohin?, the strong Präteritum (B1, there on purpose), weil / dass, the modals, wissen,
the reflexives. Tests: a Session 4 block in `t-unit`; `t-course` runs every new drill set
through the real runner, lists chapters 14, 18 and 19's Übungen and checks the tables fit.
**Left as found:** `sim.mjs --matrix` — "half the days skipped", seed 2 — ends 7 rules short of
🌳 Known (338/345, the mark is 98 %). The rules short are all placeholders of the very last
lessons (Stage 3's conversations, adjective endings), met in the final weeks; none of Session
4's. The code before this session had the same 7 short in seed 3 (350/357) and passed only
because its placeholders carried more rules. The mark was not lowered.
**Review (2 Nov 2026):** fixed — the checker turned down right German in three ways: a time word
in a sentence with a comma never moved (*Heute gehe ich nicht joggen, weil es regnet* was wrong —
now the main clause in front moves as any other; a side clause in front, and the sets where the
order is the point, keep theirs), *jeden Tag* didn't move like *jeden Morgen*, and in all 572
type-the-gap items of the course the whole sentence typed was a mistake even when right (now
the words in the gap are checked — a slip still names its rule, and the answer is shown whole).
The answer cards hinted "Nein, …" in every set (in d2.10 even for a *Ja*): now only where every
answer starts with Nein. A few more right answers listed (*wo … hin?*, *bezahlen*, *Seit einem
Jahr wohnen wir…*), the six longest rule texts cut back to Session 3's length, one odd sentence
rewritten. **Order:** the strong Präteritum (B1) moved one place, after wo? vs wohin?, so the
contrast comes straight after the two-way lesson (it had come two weeks later); the month after
the regular Präteritum stays. Checked and left as they are: each lesson's day climbs pick →
type → build → produce and ends in production (day 1 of a two-sheet lesson keeps to sheet 1);
the logs (a miss: what I wrote → right under its rule; Präteritum forms in the verb log; drill
writing in "My writing"); the clock (the built lessons have the sheets estimated, the pace
green: all passed ≈ 28 May 2027 for a target of 6 Jul); the size (the course's data ≈ 900 KB,
170 KB zipped; a day's plan in well under a millisecond).
The matrix's "half the days skipped" is borderline on its own, not because of Session 4: over 8
seeds it ends 325–345 rules 🌳 Known of 345 (the same in the old lesson order, seed 6 at 325 in
both); the rules short are always the last lessons' (Stage 3's conversations, the last of Stage
2), met in the final weeks — every other day leaves too few review days for them to reach Known.
Which of the three seeds the matrix runs decides its colour. Left for a later session to decide
(a bigger margin when attendance is low, or Known counted at the finish date itself).

### Session 5 — Stage 1C

**Upload:** chapters 2, 11, 20, 23, 24, 31, appendix C. *(from the course map: `node tools/course/session.mjs 5`)*
**Builds:** comparative and superlative · possessives and von + dative ·
adjective endings ×3 · zu-infinitive ×2 · drills for fu1–fu2 · Stage 1 recap
and checkpoint.

**Built (7 Nov 2026):** the four Stage 1C lessons and the future's book exercises, in `js/course/s1-*.js` —
possessives (`s1-poss.js`, 2 sheets: sein or ihr — the owner decides the word, the noun its ending,
meinen · meinem · meiner · meinen + -n · whose? Annas Velo, das Velo von meinem Bruder, and on its own:
meiner · meine · meins) · comparison (`s1-comp.js`, 2: -er + als and am …sten, the umlaut of the short
words, -el / -er drop their e · so … wie, gut → besser, viel → mehr, hoch, nah, gern → lieber → am
liebsten) · adjective endings (`s1-adj.js`, 3: after der, dieser, jeder: -e or -en, none after sein ·
after ein, mein, kein: -er, -es where ein says nothing · no article: the article's ending, mit warmer
Milch, Liebe Sara — and der bessere, das größte before a noun) · zu + infinitive (`s1-zu.js`, 2: zu +
the infinitive at the end, zu inside a separable verb, never after a modal · um … zu, ohne … zu,
anstatt … zu, the zu-part first). 9 sheets, 29 rules, 43 drill sets (486 items of our own, Swiss-life
sentences), each lesson ending with its production drills. The **future's book exercises**
(`s1-future.js`, 10 sets, 111 items: next week in two ways, past · Perfekt · future, the future only
where it's needed, a modal in the future — werde … arbeiten müssen, a guess with wohl, building it; every
verb form checked against the engine — 102 items with `vf`; their rules are fu1 / fu2's points). The
**Stage 1 checkpoint** (`s1-recap.js`, 20 questions, one rule each, 80 % — as Stage 0's; 24 were tried and fit only a Long 60 session): it waits for every Stage 1
lesson — verb + preposition too, built in Session 6. Four writing prompts that open with their lesson
(In fünf Jahren · Hier und dort · Ein Mensch, den ich mag · Warum ich hier bin). Every exercise of the
uploaded chapters has a status — of their 73: 41 mirrored (23 of them new: 11•6–11•13, 20•4, 20•8,
20•9, 23•1, 23•2, 24•5, 24•6, 24•8–24•14, 31•14), 31 planned with the later lesson that uploads their
chapter (20•1–20•3, 20•5–20•7 → the genitive lessons; 31•1–31•13 → the conversation units and
Konjunktiv II; 24•1–24•4 → modals in the Perfekt; 11•1–11•5 stay with the strong Präteritum), 1 skipped:
24•7 (a zu-part with a Perfekt or a modal — *gemacht zu haben* — is written German above B1; 24•11's
frames are mirrored with Präsens sentences); `DONE` = 5. **Changes to the map:** chapter 24's opening
part (the double infinitive, *habe … kaufen wollen*, 24•1–24•4) went from the zu lesson to modals in the
Perfekt — so Session 7 now uploads chapter 24; adjective endings wait for comparison (their third sheet
puts *der bessere, das größte* before a noun — 31•14, chapter 31's comparatives exercise, is drilled
there); 20•4 (he wants to buy someone's thing) is mirrored the spoken way — a name + s or von + the
dative; the written genitive is Stage 2's; 23•2 (one phrase through the cases) without the genitive, for
the same reason; 11•7's past tenses keep to what the learner has (no modal in the Perfekt). **The
checker:** a detector can be `hard` — what it finds is the grammar, never "almost, check the spelling"
(*teuerer*, *am altsten*, *nahsten*, *teueres* are one letter off but they're the rule); a verb pack's
detector now names its own verb-sheet rule (*Lea werdet* → werde · wirst · wird; before, the miss went to
the item's rule while showing the detector's message — the Präteritum lesson's *Ich wohnt* now goes to
"stem + te", whose message it already showed). Umlauts stay untyped, as agreed (*alter* for *älter* is
right, the spelling shown): the comparative's umlaut is asked in its own pick set (*älter or alter?*).
**Diagnosis:** 43 typical mistakes of the new lessons are now checks in the validator (*Wir werden kaufen
ein Sofa*, *Lea besucht seinen Vater*, *das Leas Handy*, *kleiner wie*, *mehr schnell*, *ein gute
Freund*, *die am größten Stadt*, *zu anrufen*, *Ich muss zu arbeiten*, *Um Geld zu sparen, ich fahre*…).
**Found on the way:** a Session 2 item (*Die Kinder stehen früh auf.*, d28.11) is a sentence of chapter
24 — the book check couldn't see it before chapter 24 was uploaded; rephrased (*… am Samstag früh auf*).
`t-fixes` failed before this session's changes, on today's date: its check of the Journey's daily number
used fixed answer rates where the app uses the ones it measures (`planRate`) — the test now uses the
app's rates (the app was right). **My progress:** nothing reset. The new lessons come where the course
puts them: the possessives right after the modals (before wissen / kennen and the reflexives); after the
reflexives the future, comparison, adjective endings, zu + the infinitive (verb + preposition and the bus
stop sit before them in the course but aren't built yet, so the clock takes the built ones; once built —
Sessions 6 and 8 — they come in wherever I am then, as an earlier lesson built later does); a lesson under
way always finishes first. Tests: a Session 5 block in `t-unit` (the order,
what waits for what, the checkpoint waiting for verb + preposition and then asking 20 different rules,
each sheet's day on the sheets read with production last — six days of the rotation each, the future's
forms in the verb log, the hard detectors); `t-course` checks every new table fits the phone (two were
too wide at first and were narrowed) and lists chapters 11, 20, 23, 24 and 31's Übungen. All green:
the validator (with the book check: 5,901 of our sentences against chapters 2, 11, 20, 23, 24, 31 and
appendix C), `t-unit`, `t-course`, `t-fixes` ×3, `t-stage1`, `t-edge`, `sim.mjs`, `--arrive --grow 1.3`,
`--matrix` (54/54 — Session 4's borderline "half the days skipped" passes on every seed now) and
`sim-app` over 45 and 150 days.

**Review (8 Nov 2026):** every new item read again and every detector fuzzed — 13,923 wrong variants of
the new items (each word's ending changed, zu / am / um / wohl / werden dropped): none accepted, none
"almost". Fixed: three detectors that fired too widely (*an zu kommen* also fired on *um zu Hause*, *fängt
an zu regnen*; "-el and -er drop their e" on *unsere*, *bessere*; "the verb at the end is the infinitive"
on *Am erst Tag*) — narrowed, each with its case in the tests; the possessive on its own took an ending
slip as "like ein" (now its own rule). **Older, every lesson's:** an umlaut typed where none belongs was
forgiven as a missing one — *müssten* passed for *mussten*, *schön* for *schon* — and the verb log
counted *müssten* as a right *mussten*; now it's a miss in both, as in the verb track (a missing umlaut
stays forgiven, as agreed). Content: the greetings (*Lieber Marco, Guten Tag, Vielen Dank*) were under the
no-article dative rule — moved to rule 1, where their ending belongs; a few more right answers accepted
(*Französisch besser als*, *keine Zeit zum Einkaufen*, *Er ging, ohne …*), one unidiomatic sentence
rewritten (*am meisten Punkte*); the sheets' introductions and the drills' instructions cut back to the
earlier lessons' length (222 → 164 and 79 → 71 characters on average). The **checkpoint** went back to 20
questions: 24 fit only a Long 60 session, 20 fit a Regular 30 (checked in the app; a lesson day — sheet 3
+ drill 14 — fits Regular and Long, as before). `t-stage1` run long enough to meet Stage 1C in the real
app (140 days: possessives 8 Feb · future 22 Feb · comparison 26 Feb · adjective endings 3 Mar · zu 11 Mar,
121/121 rules in review; a 70 % learner over 160 days: the invariants hold) — its default 70 days stop
before them. The learning log has a new lesson's miss under its rule (*"nette" → netten*), the verb log
the future's forms (*werden … haben* as the Futur I). All green again — validator (book check too),
`t-unit` (322), `t-course`, `t-fixes` ×3, `t-edge`, `t-stage1` (70 and 140 days), `sim.mjs`, `--arrive`,
`sim-app` (45 and 150 days) — except, in the matrix, the parked low-attendance case once more: "half the
days skipped", seed 2, 331/338 Known (the mark is 331.2); the 7 short are the last Stage 2 lessons'
(genitive 1, its prepositions 1, adverbs 2, n-declension 3), none of Session 5's — `sim.mjs` now names
them when it fails. (The same matrix passed 54/54 earlier the same day: it flips with the seed, as noted
on 2 Nov.)

**UI review (8 Nov 2026):** every card of the new lessons looked at on a phone (390 px) — each format
(pick, type, build-it tiles, answer, translate, write), right, wrong, "almost", the extra umlaut, a
sheet's steps, its quiz, the drill's result. Fixed: a gap answered alone with a slip (*um fünf Uhr zu
aufstehen*) was compared with the whole sentence — the sentence's other words showed as missing and a
wrong rule fired ("no zu after a modal"); now the gap's own words are compared (*um fünf Uhr
aufzustehen*, zu goes inside) — every lesson's gap items with whole-sentence answers (Session 4's
*…, aber ___.* too). Two titles cut to one line (*Adjective endings*, *zu + infinitive; um … zu*;
the lesson ids are unchanged, so is the progress), one sheet title shortened, one instruction that
split at a hyphen reworded. **Order:** shopping (Session 8's unit) moved from after the modals to right
after the adjective endings — *eine Nummer größer, die rote Jacke, billiger, Ist das Ihrer?* need
comparison, the possessives and the endings.
**Found on the way (older, the vocabulary's):** on some days "+5 new" brought 4 new words plus a
review: with the brake on (🐢), the day's base drops a little as words are met (its pace floor follows the
words left), so the base could fall under what was already met and the +5 filled that gap first. Now a
+5 counts from the words met when it was first pressed (`extraAt`, path.js) — exactly 5, as agreed on 21
Oct. `t-fixes2` caught it once the date rolled over (its test profile has fixed dates); the quests,
sync, plan, session, flows, logs, umlaut, review and typing suites pass with it.

### Session 6 — Stage 2A

**Upload:** chapters 19, 20, 22, 23, 26, 28, 29, appendix B. *(from the course map: `node tools/course/session.mjs 6`)*
**Builds:** conjunctions II ×2 · als/wenn/wann · indirect questions + dass vs
ob · relative clauses ×3 · genitive ×2 · verb + preposition · wo-/da- compounds · adverbs.

**Built (12 Nov 2026):** the ten Session 6 lessons — verb + preposition (`s1-verbprep.js`, A2, 2 sheets: the
verb picks its preposition and the preposition its case — warten auf den Bus, träumen von einem Haus,
sich freuen auf / über · sich with many of them, Auf wen? — auf ihn, stolz auf, zufrieden mit) · more
joining words (`s2-conj.js`, 2: bevor, nachdem, während, bis, seit, sobald, and vor or bevor? · obwohl
or trotzdem, damit or um … zu, falls, da) and the contrast als / wenn / wann (1) · indirect questions
(`s2-indq.js`, 2: Ich weiß nicht, wo er wohnt — the verb last, Können Sie mir sagen, …, mit wem · ob,
dass or ob, ob or wenn, and passing on a request: Der Arzt sagt, ich soll …) · wo- / da- compounds
(`s2-woda.js`, 2: worauf? — darauf, the r before a vowel, auf ihn for a person, wo? for a place ·
darauf, dass … and Daran habe ich nicht gedacht) · relative clauses (`s2-rel.js`: the pronouns, 2 — der
Mann, der … / den ich kenne · dem, der, denen, the case from its own clause; with prepositions, 2 — mit
dem, für die, wo · was, wer, dessen / deren, welcher to recognise) · the genitive (`s2-gen.js`: 2 — des
Mannes, der Frau, the noun's -s, the owner second, von in speech · wessen?, the adjective's -en, Ende des
Monats, einer meiner Freunde; its prepositions, 1 — wegen, trotz, während, statt, innerhalb, wegen or
weil, the dative you hear) · adverbs (`s2-adv.js`, 2: sehr, ziemlich, gar nicht, zu and genug, sehr or
viel · leider, vielleicht, oft: first place or after the verb; oben or nach oben). **18 sheets, 66 rules,
109 drill sets (1,215 items of our own, Swiss-life sentences)**, each lesson ending with its production
drills (build · answer · translate · write your own), six writing prompts that open with their lessons.
Every exercise of the uploaded chapters has a status — of their 123: 86 mirrored (51 of them new: 19•8,
19•9, 20•1–20•3, 20•5–20•7, all twenty of chapter 22, 23•3, 23•11, 23•13, 26•11, 26•12, 28•15, 28•18–28•21,
29•5–29•10), 37 planned with the later lesson that uploads their chapter (chapter 26's Konjunktiv II →
`s2.k2`, wenn-sentences and wishes → `s2.cond`, Konjunktiv I → `s4.k1`, the past Konjunktiv II → `s4.k2p`;
29•11–29•19 stay with participles and short answers); `DONE` = 6. **Changes to the map:** 29•7, 29•8 and
29•10 stand under "When as a conjunction" and "Interrogatives" but practise bevor, obwohl, während, damit
— mirrored with the joining words; 26•11 and 26•12 are written in the Konjunktiv I in the book (wie alt
sie sei · ich solle …): their frames are mirrored in everyday German (Er fragt, wie alt sie ist · Der Arzt
sagt, ich soll …), the Konjunktiv I itself stays the bonus lesson's; chapter 22's dessen / deren and
welcher sit in the second relative lesson (welcher only to recognise — it is written German); the genitive
lessons never ask for an -n noun (des Kollegen): that is `s2.ndecl`'s; wo- / da- and the adverbs got two
sheets each (the estimate was one). **The checker** (four small additions, used by the new lessons, the old
ones unchanged): a detector `order` — the lesson's own words for "the right words, another order" (the verb
last in a side sentence); `grow` — the right word is the typed one plus an ending (des Auto → des Autos);
`missing` / `extra` with `count` — a word left out or too many although another of its kind is there (der
Schirm, ich gekauft habe · Wessen die Jacke); a fix now shows a noun with its capital (Hauses). Fixed on
the way: a gap followed by a comma («Der Zug, ___, hat Verspätung.») didn't take the gap's words alone;
the word-order rule took the joining word in «Immer wenn es …» for the verb and accepted a scrambled
sentence; **a sheet, rule or drill-set id used twice now fails the validator** — the genitive had first
been given the gender lesson's sheet ids (`cx.gen1`, `cx.gen2`), which carry its progress; it is `cx.geni1`
· `cx.geni2` · `geni.*`. **Diagnosis:** 75 typical mistakes of the new lessons are checks in the validator
(*warten für*, *auf dem Bus*, *Mit wen*, *Vor ich esse*, *trotzdem er geht*, *wenn ich ein Kind war*, *Ich
weiß nicht, wenn …*, *wo wohnt er*, *auf es*, *Woauf*, *der Mann, wer*, *den* for *denen*, *alles, das*,
*des Auto*, *Wessen die Jacke*, *wegen dem Regen*, *sehr besser*, *genug groß*…), found by the item's text,
not its number. **Proofread** by four independent readers (German, answers, distractors, explanations):
about 90 fixes — two nachdem sentences in the wrong tense, *unterrichten* with a dative, nine pick items
where a second option was defensible, some forty right answers that weren't accepted (the other clause
order, aufs, übers, des Jahrs, wohin), a few rules stated too absolutely (-es after one syllable, ganz,
denken von, dass after Ich weiß nicht). **My progress:** nothing reset. A lesson under way finishes
first; then verb + preposition comes wherever I am (it is earlier in the course than the future,
comparison and the endings — an earlier lesson built later fills the gap first), the Stage 1 checkpoint
once every Stage 1 lesson is done (it can now open — it was waiting for verb + preposition), then Stage 2
in course order: the joining words, als / wenn / wann, Konjunktiv II (verb track), indirect questions,
wo- / da-, the relative clauses, the passive (verb track), the genitive ×2, adverbs. Tests: a Session 6
block in `t-unit` (the order, what waits for what, each sheet's day on the sheets read with production
last — six days of the rotation, three checked items or more to review every rule, the new detectors, both
clause orders, the gap alone); `t-course` lists chapters 19, 20, 22, 23, 26, 28 and 29's Übungen, runs every
new drill set through the real runner and checks every new table fits the phone (nine were too wide at
first and were narrowed).

**Bug hunt (12 Nov 2026, after the push):** searched four ways. (1) The old checker against the new
one on every item of the older lessons with 71,000 wrong variants (each word dropped, its ending changed,
neighbours swapped, the gap alone): **no answer changed sides and no diagnosis changed** — the engine
changes touch the new lessons only (the one difference: 22•2's gap now takes its words alone, as meant).
(2) 100,000 wrong variants of the new items: none accepted; "almost" only for real slips of the keyboard.
(3) The feedback grouped by the kind of mistake that set it off — four cases said the wrong thing and are
fixed: a misspelt word (*mic* for mich, *sol* for soll, *dran*) was called "missing" (a `missing` detector
can now be `whole`: really absent — opt-in, because zu + a separable verb leans on the looser check); the
noun's article left out was called "the relative pronoun can't be left out" (`comma`: only the one after
the comma); a main verb moved was blamed on the side sentence (the message now says "out of place — second
in a main sentence, last in a side sentence"); any reordered genitive sentence was told "the owner comes
second" (now only where the owner is the point). (4) A structural audit of the 1,215 items (two gaps,
capitals at a sentence's start, options, punctuation, pronoun cues, every spoken text): clean. Also: *ich
solle …* (the Konjunktiv I the book writes) is accepted in 26•12 — right German is never a mistake; its 11
sentences are recorded (65,751 / 65,751 texts; 666,531 characters this month). Nine tests pin the fixes.
`sim-app` over 150 days, which the build had not run (its server had stopped), is run now.

### Session 7 — Stage 2B

**Upload:** chapters 11, 16, 17, 24, 25, 26, 27, 29, 31, appendix C. *(from the course map: `node tools/course/session.mjs 7` — chapter 24 since Session 5: its double infinitive, 24•1–24•4, is the modals-in-the-Perfekt lesson's)*
**Builds:** drills for pt22–pt24, pq1–pq2, k21–k25, pv1–pv4 · conditional
sentences · *man* instead of the passive · modals in the Perfekt · lassen ·
modal particles · short answers and emphasis · participles as adjectives ·
n-declension and adjectives as nouns · Stage 2 recap and checkpoint.

### Session 8 — Stage 3, conversation

**Upload:** chapters 30, 31. *(from the course map: `node tools/course/session.mjs 8`)*
**Builds:** the 6 scenario units (dialogue, key phrases, drills, a writing prompt each).
Each unit's dialogue and drills use only the grammar taught before its slot (§6,
Stage 3: greetings and the way and shopping and the bus stop are A2 — no
Präteritum of strong verbs, no Konjunktiv II, no relative clauses; travel may use
*hätte gern / würde gern*).

### Session 9 — polish

**Upload:** chapters 12, 21, 25, 26, 27. *(from the course map: `node tools/course/session.mjs 9`)*
**Builds:** the monthly mock (mixed checkpoint across all stages) · 🎓 Exam
screen · coverage report at 100 % (every blueprint exercise *mirrored*,
*generated* or *skipped*) · the parked post-B1 list · fixes from testing.

### Definition of done (every session)

- Every built section has its sheet(s), rules, mirrored drills and at least
  one production drill; every blueprint exercise of those sections has a status.
- Validator and all existing tests pass; existing progress loads unchanged.
- Committed and pushed; the reply says exactly what was pushed and gives a
  test checklist.

---

## 13. Risks

| Risk | Answer |
|---|---|
| Grammar-heavy for an oral test | production-first drills; the native sessions carry the oral score |
| Word reviews eat the hour as 3,000 words arrive | the planner balances reviews, new words and grammar (§9) |
| The Today/verb-track code is large and tightly built | Session 1 reads it first, extends rather than rewrites, tests carefully; backup kept |
| Writing thousands of items | 8–10 per exercise, generators for the rest, quality over count |
| German correctness of non-verb items | careful writing; the native speaker spot-checks; verb forms checked by the engine |
| Several valid word orders | rule-based order checker, not fixed strings |
| Over-building | the core is sheets + linked drills + review + Today; extras wait if time is short |

---

## 14. Decisions log

- Book used for structure, grammar checklist and exercise blueprints; all content ours.
- Unit of learning = section, ordered by level; MoSCoW kept in the background.
- Finish date stays 15 Aug 2027; the app keeps the margin (words ≈ 75 days, grammar ≈ early July).
- Speaking is on top of the daily hour; it happens outside the app.
- *Could* = post-B1.
- No dictation, no listening features, no Swiss notes.
- Production drill required in every section; 8–10 hand-written items per mirrored exercise.
- 9 build sessions, tested in between; Session 1 builds the system and pilots nicht vs kein.
- Rules are review items `cx_<rule>` in `S.words` (same stages); a rule is learned at stage 2.
- A Today session carries the grammar block as cards: warm-up, test-out, sheet and drill a third of the way in, reviews and writing two thirds in.
- Writing is free and ungraded in the app: a prompt with a word minimum, saved for a tutor (Claude) to correct from the learning log; the drill sets' write/open items stay as model + checklist. Texts are never deleted.
- The finish date is the only pace setting: grammar sheets are spread evenly to it (no "minutes a day" choice).
- A drill's "write your own" is saved for Claude like the journal (one model line to compare; no checklist, no self-grading, no rule moves).
- Post-B1 ("Could") sections aren't paced to the date: they come after the rest, spread to the finish date.
- **Präteritum in three steps (19 Oct 2026):** war & hatte and the modals' past (pt11–pt13) belong to the A1 verb lesson, the regular Präteritum to A2, the strong and mixed Präteritum to B1. The book teaches war/hatte with the strong verbs (chapter 16); we take them earlier on purpose, as the verb track always did — the book's headings stay with the lessons that cover them in full. Every verb sheet now belongs to exactly one lesson.
- **Fixes of 21 Oct 2026 (before phase two):** "+5 new" only once today's new words are met, and its round brings exactly those 5 (a Quick round, your length kept); a "+5" can be undone for the words not met yet (counted apart, so a sync never brings it back). A Today session's count never goes down: a 📖 card that asks fewer questions than planned hands the rest to word reviews. The course's tiles take drag & drop (the games' engine). Shift+Enter ×3: 5 a day. The Today card no longer has a "rules to review" line (they're in 📚 due).
- **The day's plan = the day's work (24 Oct 2026):** the plan quest's count is the morning's estimate, in right answers, of exactly what Today will ask that day, plus a safety distance (+5 %, then rounded up to the next 5) so it lands just past the day's work rather than before it; a quest is a quest — it is done at its count, never before. Its rates (`PLAN_K`, path.js) come from how a session asks things, not from how much was answered: a new word 3, a new verb item 1, a ledger form 1, a course question 1; a word due and a verb item due take what your own finished days measured (`planRate`: the reviews, fixes, repairs and warm-ups of words — of verb items, their answers and repairs — nothing asked on top — over the morning's word reviews / verb items due, the middle of the last 14 such days; 1.15 and 1.1 until 5 are recorded). "What's owed today" (`pathOwed`: the words' reviews less the backlog the plan leaves for later days, the new words, the verbs' due items, new items, ledger forms and sheets, the course's parts) decides "All caught up". Sessions: no fixed share for the verbs any more (it was a quarter, which left the verb ledger's forms out on heavy verb days while still counting them): every part of the day's work gets its share of each session (`pathShares`) — the words' owed reviews, the verbs' due items, new items and ledger forms — then the words' deferred backlog. Padding is the margin only: once the day's work runs out, a session is topped up with practice only as far as the plan's count still needs, and "All caught up · N more for today's plan" brings exactly that N (without a finish date, a session keeps the length you picked). Every Today answer is logged with where it came from (usage `src`), the day that finished what it owed (`owed0`) and the morning's snapshot of words met / forms filled / items started (`plan.snap`), for the logs; the pace check: 🟠 when 2 of the last 7 days didn't finish what they owed (or weren't studied) or the date needs close to the most a day may ask; red stays "out of reach at the fastest pace". (Asked-vs-delivered was tried and dropped: the verb track often has nothing new to give until more verbs are met, which read as falling behind.)
- **Präteritum lessons moved earlier (24 Oct 2026):** the regular Präteritum right after the accusative prepositions (≈ 5 Jan for the 15 Aug date), the strong and mixed Präteritum (+ Plusquamperfekt) after the two-way prepositions (≈ 4 Feb), a month apart. As "Should" lessons they came after every "Must" of their stage (≈ day 112 and ≈ day 195, May), and the verb track opens a tense's every-verb forms and items only once its lessons are passed: ≈ 660 Präteritum forms would have come in the last weeks before the date, at ≈ 26 a day. Now they spread over Feb–May at ≈ 5–6 a day. Levels and stages stay (A2 · B1); the order is now close to the book's (c13 → c14 regular past → c15 dative → c16 strong past, here after c19).
- **Verbs lean in; three Konjunktiv II past cards stay words (24 Oct 2026):** new words are drawn with a deck's verbs weighing half again (`PATH.VERB_LEAN`), so a level's verbs come a little ahead of its other words — measured on the real journey: forms left mid-May halved, the words Known five days sooner, the same daily load. *hätte gemacht · wäre gekommen · hätte gewusst* (B1 deck) were taken over by the Konjunktiv II · past rule, a post-B1 lesson that opens in August: they kept the B1 words from being Known by the date (≈ 29 Aug). They're word cards again, met with their deck once Konjunktiv II opens; the past subjunctive itself stays a bonus (B2 grammar; FIDE asks for the present one — *hätte gern, könnte, würde* — which the course teaches in B1).
- **Lesson clock (19 Oct 2026):** lesson, consolidate, lesson, consolidate — a lesson's sheets on consecutive study days, then the same break G after every lesson, G = (study days left − sheets left) ÷ lessons left, recomputed daily; verb lessons included. Sheet counts of unbuilt lessons are generous estimates, never a target when building. The next lesson is the first built one whose prerequisites are done; an earlier one built later fills the gap first.
- **Table-of-contents audit (Session 1 follow-up 4):** every line of the book's contents (243 headings + 8 chapter openings) is named by a lesson — taught there, in the verb track the lesson links to, or as part of it; the validator fails on any line without one. Most of the 79 lines that had no lesson were already covered (the verb track teaches the state passive, polite Konjunktiv II, modal forms, imperatives); real changes: conditionals and wishes got a second sheet (wenn-clauses · wishes and als ob), the impersonal passive joins *man*, *welcher* joins relative clauses. Order: Stage 1 now starts und/aber/denn early and takes accusative prepositions before the dative; possessives follow the dative prepositions (von + dative). Stage 2 brings Konjunktiv II and conditionals (fide speaking) and verb + preposition first; the genitive, participles and n-declension (*Should*) last.
- Writing comes at least every 4 days. After a long time away (twice the gap), the next sheet comes at once.
- Screens stay as light as the rest of the app: a miss is the answer with the fix marked, one line of why, the rule's name as a link to its sheet.
- The word-order checker accepts the verb-second reordering of a time phrase and a pronoun subject by rule; other orders are listed per item; `fixed` sets accept only theirs.
- **Session 2 (21 Oct 2026):** a verb lesson's book exercises are drills of the verb section, tagged with the verb sheets' points (`gs:…`); they don't add review cards of their own (the verb track reviews its verbs) and come in through the lesson's Practise card, By chapter and the mixed days. A test-out asks 6–8 questions covering every rule of the lesson, one miss allowed. Sentences of five words or more that happen to be the book's are rephrased; the book check covers the sheets' rule texts too. *(22 Oct: a short, simple sentence — four words or fewer, like* Wer ist das? — *is anyone's German, not the book's: it's fine.)*
- **Session 3 (26 Oct 2026):** the question words come after the dative (wer / wen / wem / wessen in one lesson, since *wem?* needs the dative); an exercise goes to the lesson that teaches what it practises even when its heading is another lesson's (chapter 11's time adverbs → the future, chapter 14's conjunctions → Session 4, chapter 13's prepositions → the accusative prepositions), so a session may need fewer chapters than its first list; a verb lesson's pack has its own detectors (`gs:` rules) so a miss in the Perfekt says *sein*, not just the rule's name.
- **Session 4 (1 Nov 2026):** weil / dass / wenn comes before the modals (their second sheet needs it); the strong Präteritum comes after wo? vs wohin? (review, 2 Nov: a contrast follows its lesson at once — the month after the regular Präteritum stays); an exercise whose heading is a modal's but which practises the future (11•10–11•13) goes to the future lesson; a chapter's last exercise that practises something else (18•4: commands) is mirrored with the lesson that teaches that; a person after a preposition is a pronoun (*für ihn*), a thing *da-* (*dafür*) — taught with each preposition lesson, the wo- / da- compounds' own lesson (Session 6) builds on it; *zu dem* → *zum* is drilled as the usual form (the long form counts as a mistake with its reason, not as wrong German); from Session 4 on a sheet's table fits a phone whole.
- **Conversations earlier, Should gives way when behind (2 Nov 2026):** the six scenario units come right after the grammar each needs (§6 Stage 3), not after Stage 2 — they are the closest thing to the oral exam and are small. When behind, what gives way first is the *Should* grammar (modal particles, participles as adjectives, n-declension, genitive prepositions, the Perfekt of modals, lassen, man, adverbs, short answers; and school and study), not the conversations (§5). I suggested the conversations should fall off first and asked Claude's view; Claude chose *Should* instead (reason above) — confirmed 3 Nov 2026: keep it.
- **Known shortcoming, parked (2 Nov 2026):** with low attendance (every other day) the lessons met in the last weeks can't all reach 🌳 Known by the date — up to 20 of 345 rules short in the simulation, the last lessons'. The app does warn (pace red) and shortens the breaks. The fix, if ever needed: a margin that grows when attendance drops (40 days at full attendance, ≈ 70 at every other day, capped), verified on 8 seeds of "half the days skipped", the matrix, t-stage1 and the 150-day sim-app. Not done: I study every day and I'm the only user.
- **Session 5 (7 Nov 2026):** an exercise goes to the lesson that teaches what it practises, also across stages — chapter 24's double infinitive (24•1–24•4) to modals in the Perfekt (B1), chapter 31's comparatives with endings (31•14) to the adjective endings, which now wait for comparison; where the book practises a form the learner hasn't met yet, the mirror keeps the exercise's frame with the forms they have (20•4 the spoken *von* + dative instead of the genitive, 23•2 without the genitive, 11•7 without a modal in the Perfekt, 24•11 with Präsens sentences); an exercise is skipped only when its whole point is above B1 and fide doesn't ask it (24•7), with the reason in its status. Stage 1's checkpoint asks 20 questions, one rule each, as Stage 0's (24 fit only a Long 60 session — a Regular 30 has room for 20). A checker detector can be `hard`: a one-letter slip that is the rule itself is a mistake, never "almost".
- **Session 6 (12 Nov 2026):** an exercise the book writes in a form above B1 keeps its frame in everyday German (26•11, 26•12: indirect questions and reported requests in the indicative — the Konjunktiv I is the bonus lesson's); welcher as a relative pronoun is taught to recognise, never drilled as the form to say; the genitive is taught as the written form with von + dative beside it as the spoken one, and no item asks for an -n noun before its lesson; ids are unique across packs and the validator enforces it (a sheet's id carries the learner's progress); a diagnosis case in the validator names its item by its text, so adding or moving items doesn't break it.
- **Verb + preposition in Stage 1 (2 Nov 2026):** *warten auf, sich freuen auf, denken an* are everyday spoken A2 — the lesson (now `s1.verbprep`, A2) comes right after the reflexive pronouns (≈ late Feb) instead of mid-April in Stage 2; still built in Session 6, the wo- / da- compounds stay in Stage 2 right after it.
- **Session 2 audit (21 Oct 2026):** every new sheet and item proofread (15 fixes: a rule that put *die Mutter* among the masculine plurals, a few stiff sentences, missing natural answers in translations). The verb lessons' own sentences now feed the learning log's verbs (before, only generated items did). *(22 Oct: umlauts are never typed, as agreed — a missing one is never a mistake, in the drills or the log; the course's drills now ask the verb track's small 1 / 2 choice when the plain spelling is another real form: fahrt → fährt or fahrt?)* 📚 a chapter's Übungen render their *italics*; on a verb lesson page 🧩 Practise sits right under the sheets. The logs test's fake cloud gained `batch` (its one failure was the test, not the app). Known and left as agreed: the quest test's late-deficit stress day can end one ledger form short (extra practice asks for exactly what a quest lacks).

---

## Voice: what's left

*(kept up to date by the voice sessions; the pipeline is in `tools/audio/README.md`)*

**12 Nov 2026 — Session 6's lessons recorded.** Everything the ten new lessons say once a question is
answered (every drill item's whole right sentence for each accepted answer, the writing models, the
sheets' examples, their tables' German and their quizzes' right sentences): **1,983 clips, 83,040
characters, 0 refused** (Google Chirp 3 HD "Aoede"). The German pack has **65,740 / 65,740 texts**
(`status.mjs --strict` passes; the pack, games, flag, say and runtime tests pass). The update is 18 of
95 shards, ≈80 MB for a phone that has the old pack — offered with the banner, on Wi-Fi.
**Characters this month (November 2026): 665,971** (the limit set for this run: 950,000; `run_all.py`'s
own default guard stays 900,000). ≈284,000 left under the 950,000 limit.
What will be missing next: Sessions 7 and 8 (≈150k + ≈40k characters) — record right after they're built.

**8 Nov 2026 — the course, the sheets and every B1 verb recorded; voice inside the exercises.**

- **Recorded this session (German, Google Chirp 3 HD "Aoede"), 0 refused:**
  1. everything the 📖 course says once a question is answered — every drill item's
     whole right sentence for each accepted answer (the gap filled in, cues left out), the
     conversations' lines, the lines you answer or transform, the writing models, the
     generated conjugation items — plus every course sheet's examples, and for every
     sheet (the verb track's too) the German sentences of its table and its quiz's right
     sentences: **5,763 clips, 183,361 characters**;
  2. **every B1 verb's forms** (verb cards, 🎰 Conjugation Slots, 🧵 Verb Thread and its 🎧
     rounds — `runtime.mjs --levels a1,a2,b1`): **24,375 clips, ≈381,000 characters**;
  3. main's re-take of *lies* (its new IPA hint) and its new phrase *was ist los*;
  4. after an audit of every place the app speaks (below): 154 clips, mostly bare
     participles a verb sheet's quiz asks ("Partizip II of danken" → *gedankt*).
- **The German pack now has 63,757 / 63,757 texts** (`status.mjs --strict` passes): every
  deck A1–B1, every verb form A1–B1, the grammar sheets and their tables and quizzes, the
  idioms, the course as built (Stages 0 and 1). The update is big (81 of 95 shards,
  ≈165 MB for a phone that has the old pack): the app offers it with the banner, on Wi-Fi.
- **Characters this month (November 2026):** **582,931 of the 900,000 cap**
  (`tools/audio/state/usage.json`; includes main's 36). ≈317,000 left this month.
- **Audit (8 Nov, after the recording):** every place the app speaks or plays on a tap was
  listed and every text it can produce checked against the pack in the real app — deck
  words in every form the games use, examples, plurals, cloze answers, conjugation cards,
  idioms, the verb chips, the course, and every verb sheet's quiz question for every verb ×
  person (249,240 drawn): **no gaps**. Fixed on the way: a verb sheet's quiz made from your
  verbs would have said its English label and a wrong word order ("ich habe gedankt
  Perfekt", "ich werde mich treffen mit Anna") with the phone voice — it now says the form
  as the verb track does (recorded); English quiz options ("mixed", "oy", "soft, as in
  huge") were recorded and would have been read with the German voice — they now say
  nothing and their clips left the pack; "Advice: …" / "Plusquamperfekt: …" labels are left
  out of what is said.
- **Still missing, in priority order:** nothing the app says today. What will be missing next:
  1. *(done 12 Nov: Session 6's lessons — 83k characters, less than the ≈180k guessed)*
  2. **Sessions 7 and 8** (Stage 2B, the conversation units): ≈150k + ≈40k.
  3. New words or verbs added to the decks: a few hundred characters each.
  4. Phrases in the voice log (Settings → Sound & voice → Copy voice log) — e.g. a gap item
     whose prompt has two gaps or English inside the word ("ei or ie? dr___ (three)") says
     nothing on purpose; anything a game makes up falls back to the phone voice and lands there.
- **Resume / routine** (after building lessons or editing decks):

  ```bash
  node tools/audio/runtime.mjs --lang de            # the course, sheets and verbs as the app says them now
  node tools/audio/extract.mjs --lang de            # what's new; ⚠ warns about texts read literally
  python tools/audio/run_all.py full --langs de     # record only the new ones, pack (resumable; >2 h: run again)
  node tools/audio/status.mjs --lang de --strict
  node tools/audio/tests/run.mjs pack games flag say runtime
  git add audio tools/audio/state && git commit -m "Update voice packs"
  ```
  A run longer than a session's 2-hour command limit stops mid-way: run the same command
  again (made clips are kept; `run_all.py pack --langs de` if only the pack step was cut).
- **In the exercises (German app):** once answered — never before — the whole right
  sentence plays once (Next stops it), and every revealed German word or sentence plays
  again on a tap (🔊 after it): the course's miss card, "Also right", models, conversation
  lines, the sheet quiz, the sheets' table sentences, the games' lesson card and miss list,
  Today's answer, the verb track's form. Selecting German in a sheet or an answered
  question's feedback says the selection. The French app is unchanged.
- **Principal-part hints:** main's `askHintText` (hint.js, merged 8 Nov) masks them — and a
  word's stem or gender — while a card asks, and puts the whole hint back after the answer;
  this branch's own shortening was dropped in its favour. The games' lesson card after a
  miss now shows the whole hint when it was masked.
