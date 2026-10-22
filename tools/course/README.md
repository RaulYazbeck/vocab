# The course — data, validator and tests

The grammar course (PLAN.md) lives in `js/course-de.js` (the model: registry,
checker, the day's parts, the planner), `js/course-ui.js` (the drill runner and
the 📖 Course / 🧩 Practise / 📚 By chapter / ✍️ Writing screens) and its data in `js/course/`:

    js/course/plan.js          the skeleton: stages, chapters, every section in order
    js/course/s0-negation.js   a content pack: the pilot section "nicht or kein?"
    js/course/s0-*.js          Stage 0 (Session 2): sounds, gender, articles, plurals,
                               pronouns, questions (verb second · W-questions), numbers,
                               the accusative (articles · pronouns and man), the A1 verb
                               lesson's book exercises (s0-verbs.js) and the checkpoint
    js/course/writing.js       the writing themes (cxJournalThemes) and prompts (cxJournal)

German app only (`de/index.html` loads them; the French app never does).

## What a build session builds and uploads

Every section in `plan.js` names its build session (`ses`). From that:

    node session.mjs 3                # Session 3 — the chapters to upload, the lessons it builds

At the end of a session, raise `DONE` in `session.mjs` to that session: the
validator then requires every exercise of its chapters to be covered (mirrored,
generated, skipped with a reason) — and every exercise still planned to point at
a later session that uploads its chapter.

## Adding a section (every later build session)

1. Write a pack in `js/course/` that calls `cxPack({ id, sections: { "<section id>": { … } } })`
   for sections already in `plan.js`, and `cxCover({ "<Übung>": … })` for the book's
   exercises — copy the shape of `s0-negation.js`:
   - `sheets`: the existing sheet format (`grammar-sheets-de.js`) plus `rid` (one rule id
     per rule, `area.name`, no `_`) and `qn: 3` (the quiz draws 3 from 5+). Typed quiz
     questions carry `cx: true`.
   - `rules`: a short title per rule id.
   - `drills`: one set per mirrored exercise, `id: "d<ch>.<n>"`, `ex: "<ch>.<n>"`,
     8–10 items of our own, each with `r: [rule ids]`; the last set(s) `end: true` and a
     production kind (compose · translate · answer · write · open).
     Kinds: pick · type · transform (tiles, then typed) · compose · answer · translate ·
     write / open (model + checklist, self-graded) · respond · order (a = the lines in order).
     `hl` highlights the part to negate/change; `fixed: true` on a set when its order is
     the point (fronting drills) — otherwise the checker also accepts the verb-second
     reordering of a time phrase and a pronoun subject by rule. `low: true` on a set
     writes every first tile small (questions, commands: the capital would give the
     start away) — its items that start with a noun or a name say `cap: true`.
   - Verb forms: `vf: [[inf, tense, person]]` on an item makes the validator check that
     every accepted answer holds the engine's form (`pr` · `pt` · `im`), its words in
     order — `ruf … an` passes in *Ruf mich morgen an!*. Pure tables are generated, never
     written: `gen: { kind: "conj", verbs, tense: "pr" | "pt" | "im", persons? }` (a
     command asks du · ihr · Sie and wants the whole command: *kommen Sie*).
     In the app the same `vf` feeds the learning log's verbs (`learnNoteVerb`): the form
     counts right when it's in what was written, and a miss logs the word written in its
     place. Umlauts are never typed (agreed): a missing one is never a mistake; when the
     plain spelling is another real form (*fahrt*: fährt or fahrt?) the drill asks the verb
     track's 1 / 2 choice (`cxUmlautChoice`) — picking the other form is the miss.
   - A verb lesson's book exercises (its sheets live in the verb track): a pack for the
     verb section with drills only, their rules the verb sheets' points (`gs:pr4.r2` —
     a miss names that sheet's rule; the verb track keeps its own reviews). They're
     practised from the lesson's page (🧩 Practise), 📚 By chapter, and mixed into the
     contrast days and 🔀 Mixed once the lesson is done. A section with more sets than
     a drill has room for gives the least-asked ones in turn, its production last.
   - `diag`: detectors that name the rule a wrong answer broke (swap · ending · seq ·
     pos · missing · extra).
   - `testout: { n, miss }` for Stage 0 sections.
   - Several sheets: list them in order, each with its own `rid`. Each sheet's rules go
     into review when it's passed, that day's drill keeps to them, and the section is done
     after the last sheet and its drill (one sheet a day, on consecutive study days).
   - **`n` in plan.js is only an estimate.** It is the planner's guess of a lesson's
     sheets while the lesson isn't built, so the pace counts the course as if it were
     complete (PLAN.md §9, the lesson clock). It is **not** a target: write as many
     sheets as the topic needs — 1 or 6 — and don't bend a lesson to match the number.
     Once the pack is loaded the real count replaces it and the clock adjusts the next
     day. (The estimates are generous on purpose and average out.)
   - `after` in plan.js names the lessons this one builds on: it waits until they are
     done, so a lesson built ahead of an earlier one it needs never comes too early.
   - A stage's recap section: `checkpoint: { n: 20, pass: 0.8 }` (a sheet is optional). It
     opens once every other section of the stage is done, asks the stage's rules mixed,
     and comes back the next day when missed — after 3 tries the stage moves on anyway.
   - Scenario units (Stage 3): a sheet holding the dialogue (`lines`), key phrases as
     rules, drill sets of kinds `order` (the conversation), `respond` and `type`, and a
     `write` set — no new code needed.
   - Writing prompts tied to the section (optional): `cxJournal([{ id: "w.<name>", th, lv, de,
     t, help, sec: "<section id>" }])` — they open once the section is done. Free writing,
     never graded: saved to `S.writing` (kept forever, one cloud doc a year) and listed in the learning log for correction.
2. Add its `<script>` tag to `de/index.html`, after `js/course/plan.js` and before
   `js/course-ui.js`.
3. Run the checks below.

## Checks

    node validate.mjs                 # the format, rules ↔ sheets, coverage (every exercise has a status and a session,
                                      # every line of the book's contents a lesson), the checker on every
                                      # answer, tiles, diagnosis, engine forms, one name per global
    BOOK=<dir> node validate.mjs      # + none of our sentences of 5+ words is a sentence of the book (a short simple one is anyone's German) — the items,
                                      #   the sheets' examples and quizzes, and every whole sentence in
                                      #   their rules, tables and traps (<dir>: pdftotext -layout of the
                                      #   chapters — never in the repo)
    node t-unit.mjs                   # sync merge, planner, the day's parts, answers, word orders
    node t-course.mjs                 # the real app (serve the repo root on :8765 first, and
                                      # npm install once in tools/audio/tests): progress intact,
                                      # Today with the course (test-out → sheet → drill, the count),
                                      # a test-out passed, every format and screen on phone + desktop,
                                      # the parts opening in place, By chapter and its Übungen, back
                                      # buttons, ✍️ Writing, 📚 My dues (list + a round of only
                                      # what's due), the Journey's grammar block and days,
                                      # the French app untouched
    node t-fixes.mjs                  # the fixes after the first week: the length is the length (Quick 15 keeps
                                      # a lesson that doesn't fit out), the Präsens lesson's last sheet in a Long
                                      # 60, ✍️ starters typed at the cursor, the Journey's days and "out of reach"
                                      # with the course, twist rounds ranking up (never with Golden words)
    node t-fixes2.mjs                 # the fixes of 21 Oct: "+5" only once today's are met, its round brings
                                      # exactly 5 in deck order, its undo (and the undo through a sync), the
                                      # count never going down, Shift+Enter 5 a day, no "rules to review"
                                      # line, drag & drop on the tiles (phone + desktop, no listeners left)
    node t-edge.mjs                   # edge cases: the real keyboard, ✕ mid-drill, HTML typed in, a damaged
                                      # state, Grandma / Speak mode, another device, the day rolling over, a peek
    node sim.mjs [--acc 0.6 --testout 0 --skip 0.3 --break 60:21 --late 150 --deadline 2027-12-15 --due 40:120]
                                      # the whole journey to the finish date on the real scheduler (fake clock),
                                      # every section filled with synthetic packs; checked every day: no new
                                      # section before the pace allows, never two unless behind, one text at
                                      # most; at the end: done by the target, every rule Known, no long gaps
    node sim.mjs --matrix             # 18 scenarios × 3 seeds (struggling, strong, skipped days, breaks, a late
                                      # start, earlier / later dates, heavy word days, the lessons arriving with
                                      # their build sessions with 30 % more / fewer sheets than estimated),
                                      # each checked as above — the lesson clock: one lesson at a time, its sheets
                                      # on study days in a row, no new lesson before its break is over
    node sim.mjs --arrive --grow 1.3  # the lessons arrive session by session, each 30 % bigger than its estimate
    node sim-app.mjs [--days 45 --acc 0.85 --skip 0.25]
                                      # the real app on a fake clock, the test profile, the course at full size:
                                      # every Today session played card by card — the count never grows, the
                                      # course is done each day, the plan is met when every answer is right,
                                      # the state and the cloud docs round-trip, the logs agree with what was done

The older browser scripts (`tools/verb-track`, `tools/quests`) count Today's cards
without the course: `openApp()` loads it off unless `COURSE=1` or `{ course: true }`.
