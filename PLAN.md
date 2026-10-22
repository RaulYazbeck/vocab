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
runs short it drops from the bottom, *Could* first. *Could* = post-B1.

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
| N | wer / wen / wem, welcher, was für | 13, 28 |
| N | Set responses and greetings (early: they feed the speaking sessions) | 29, 30 |
| ◐ | pf2–pf6 — Perfekt complete | 10 |
| ◐ | pr6 — separable vs inseparable | 12 |
| N | Dative: articles and the indirect object | 15 |
| N | Dative pronouns; the order of two objects | 15 |
| N | Dative verbs (helfen, gefallen, gehören…) | 15 |
| N | Contrast: accusative vs dative | 7, 15 |
| N | Accusative prepositions | 7, 13 |
| N | Dative prepositions | 15, B |
| N | Two-way prepositions | 19 |
| N | Contrast: wo? vs wohin? | 19 |
| N | Modals: position, and in subordinate clauses (pr5, pt12 ✓) | 17 |
| N | und, aber, oder, denn, sondern | 14, 29 |
| N | weil, dass, wenn — the verb goes last | 29 |
| ◐ | pt21 — regular Präteritum | 14 |
| N | wissen vs kennen | 18 |
| N | Reflexive pronouns (accusative and dative) | 23 |
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
| N | Verb + preposition (warten auf, denken an…) | 19 |
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
response, fill the missing line) and a short writing prompt.

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

### Session 4 — Stage 1B

**Upload:** chapters 7, 11, 13, 14, 15, 17, 18, 19, 23, 29, appendix B. *(from the course map: `node tools/course/session.mjs 4`)*
**Builds:** prepositions ×3 (accusative, dative, two-way) · contrast wo? vs
wohin? · modal position · und/aber/oder/denn/sondern · weil/dass/wenn ·
wissen vs kennen · reflexive pronouns · drills for pt21.

### Session 5 — Stage 1C

**Upload:** chapters 2, 11, 20, 23, 24, 31, appendix C. *(from the course map: `node tools/course/session.mjs 5`)*
**Builds:** comparative and superlative · possessives and von + dative ·
adjective endings ×3 · zu-infinitive ×2 · drills for fu1–fu2 · Stage 1 recap
and checkpoint.

### Session 6 — Stage 2A

**Upload:** chapters 19, 20, 22, 23, 26, 28, 29, appendix B. *(from the course map: `node tools/course/session.mjs 6`)*
**Builds:** conjunctions II ×2 · als/wenn/wann · indirect questions + dass vs
ob · relative clauses ×3 · genitive ×2 · verb + preposition · wo-/da- compounds · adverbs.

### Session 7 — Stage 2B

**Upload:** chapters 11, 16, 17, 25, 26, 27, 29, 31, appendix C. *(from the course map: `node tools/course/session.mjs 7`)*
**Builds:** drills for pt22–pt24, pq1–pq2, k21–k25, pv1–pv4 · conditional
sentences · *man* instead of the passive · modals in the Perfekt · lassen ·
modal particles · short answers and emphasis · participles as adjectives ·
n-declension and adjectives as nouns · Stage 2 recap and checkpoint.

### Session 8 — Stage 3, conversation

**Upload:** chapters 30, 31. *(from the course map: `node tools/course/session.mjs 8`)*
**Builds:** the 6 scenario units (dialogue, key phrases, drills, a writing prompt each).

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
- **Lesson clock (19 Oct 2026):** lesson, consolidate, lesson, consolidate — a lesson's sheets on consecutive study days, then the same break G after every lesson, G = (study days left − sheets left) ÷ lessons left, recomputed daily; verb lessons included. Sheet counts of unbuilt lessons are generous estimates, never a target when building. The next lesson is the first built one whose prerequisites are done; an earlier one built later fills the gap first.
- **Table-of-contents audit (Session 1 follow-up 4):** every line of the book's contents (243 headings + 8 chapter openings) is named by a lesson — taught there, in the verb track the lesson links to, or as part of it; the validator fails on any line without one. Most of the 79 lines that had no lesson were already covered (the verb track teaches the state passive, polite Konjunktiv II, modal forms, imperatives); real changes: conditionals and wishes got a second sheet (wenn-clauses · wishes and als ob), the impersonal passive joins *man*, *welcher* joins relative clauses. Order: Stage 1 now starts und/aber/denn early and takes accusative prepositions before the dative; possessives follow the dative prepositions (von + dative). Stage 2 brings Konjunktiv II and conditionals (fide speaking) and verb + preposition first; the genitive, participles and n-declension (*Should*) last.
- Writing comes at least every 4 days. After a long time away (twice the gap), the next sheet comes at once.
- Screens stay as light as the rest of the app: a miss is the answer with the fix marked, one line of why, the rule's name as a link to its sheet.
- The word-order checker accepts the verb-second reordering of a time phrase and a pronoun subject by rule; other orders are listed per item; `fixed` sets accept only theirs.
- **Session 2 (21 Oct 2026):** a verb lesson's book exercises are drills of the verb section, tagged with the verb sheets' points (`gs:…`); they don't add review cards of their own (the verb track reviews its verbs) and come in through the lesson's Practise card, By chapter and the mixed days. A test-out asks 6–8 questions covering every rule of the lesson, one miss allowed. Sentences of five words or more that happen to be the book's are rephrased; the book check covers the sheets' rule texts too. *(22 Oct: a short, simple sentence — four words or fewer, like* Wer ist das? — *is anyone's German, not the book's: it's fine.)*
- **Session 2 audit (21 Oct 2026):** every new sheet and item proofread (15 fixes: a rule that put *die Mutter* among the masculine plurals, a few stiff sentences, missing natural answers in translations). The verb lessons' own sentences now feed the learning log's verbs (before, only generated items did). *(22 Oct: umlauts are never typed, as agreed — a missing one is never a mistake, in the drills or the log; the course's drills now ask the verb track's small 1 / 2 choice when the plain spelling is another real form: fahrt → fährt or fahrt?)* 📚 a chapter's Übungen render their *italics*; on a verb lesson page 🧩 Practise sits right under the sheets. The logs test's fake cloud gained `batch` (its one failure was the test, not the app). Known and left as agreed: the quest test's late-deficit stress day can end one ledger form short (extra practice asks for exactly what a quest lacks).
