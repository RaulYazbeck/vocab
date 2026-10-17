# The course — data, validator and tests

The grammar course (PLAN.md) lives in `js/course-de.js` (the model: registry,
checker, the day's parts, the planner), `js/course-ui.js` (the drill runner and
the 📖 Course / 🧩 Drills / 📚 book map screens) and its data in `js/course/`:

    js/course/plan.js          the skeleton: stages, chapters, every section in order
    js/course/s0-negation.js   a content pack: the pilot section "nicht or kein?"
    js/course/writing.js       the writing journal's prompts (cxJournal)

German app only (`de/index.html` loads them; the French app never does).

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
     reordering of a time phrase and a pronoun subject by rule.
   - `diag`: detectors that name the rule a wrong answer broke (swap · ending · seq ·
     pos · missing · extra).
   - `testout: { n, miss }` for Stage 0 sections.
   - Several sheets (`n: 2` or `3` in plan.js): list them in order, each with its own `rid`.
     Each sheet's rules go into review when it's passed, that day's drill keeps to them,
     and the section is done after the last sheet and its drill (one sheet a day).
   - A stage's recap section: `checkpoint: { n: 20, pass: 0.8 }` (a sheet is optional). It
     opens once every other section of the stage is done, asks the stage's rules mixed,
     and comes back the next day when missed — after 3 tries the stage moves on anyway.
   - Scenario units (Stage 3): a sheet holding the dialogue (`lines`), key phrases as
     rules, drill sets of kinds `order` (the conversation), `respond` and `type`, and a
     `write` set — no new code needed.
   - Writing prompts tied to the section (optional): `cxJournal([{ id: "w.<name>", lv, de,
     t, help, sec: "<section id>" }])` — they open once the section is done. Free writing,
     never graded: saved to `S.writing` (kept forever, one cloud doc a year) and listed in the learning log for correction.
2. Add its `<script>` tag to `de/index.html`, after `js/course/plan.js` and before
   `js/course-ui.js`.
3. Run the checks below.

## Checks

    node validate.mjs                 # the format, rules ↔ sheets, coverage, the checker on every
                                      # answer, tiles, diagnosis, engine forms, one name per global
    BOOK=<dir> node validate.mjs      # + none of our sentences is a sentence of the book
                                      #   (<dir>: pdftotext -layout of the chapters — never in the repo)
    node t-unit.mjs                   # sync merge, planner, the day's parts, answers, word orders
    node t-course.mjs                 # the real app (serve the repo root on :8765 first, and
                                      # npm install once in tools/audio/tests): progress intact,
                                      # Today with the course (test-out → sheet → drill, the count),
                                      # a test-out passed, every format and screen on phone + desktop,
                                      # the book map, the French app untouched
    node t-edge.mjs                   # edge cases: the real keyboard, ✕ mid-drill, HTML typed in, a damaged
                                      # state, Grandma / Speak mode, another device, the day rolling over, a peek
    node sim.mjs [--acc 0.6 --testout 0 --skip 0.3 --break 60:21 --late 150 --deadline 2027-12-15 --due 40:120]
                                      # the whole journey to the finish date on the real scheduler (fake clock),
                                      # every section filled with synthetic packs; checked every day: no new
                                      # section before the pace allows, never two unless behind, one text at
                                      # most; at the end: done by the target, every rule Known, no long gaps
    node sim.mjs --matrix             # 13 scenarios × 3 seeds (struggling, strong, skipped days, breaks, a late
                                      # start, earlier / later dates, heavy word days), each checked as above
    node sim-app.mjs [--days 45 --acc 0.85 --skip 0.25]
                                      # the real app on a fake clock, the test profile, the course at full size:
                                      # every Today session played card by card — the count never grows, the
                                      # course is done each day, the plan is met when every answer is right,
                                      # the state and the cloud docs round-trip, the logs agree with what was done

The older browser scripts (`tools/verb-track`, `tools/quests`) count Today's cards
without the course: `openApp()` loads it off unless `COURSE=1` or `{ course: true }`.
