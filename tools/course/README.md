# The course — data, validator and tests

The grammar course (PLAN.md) lives in `js/course-de.js` (the model: registry,
checker, the day's parts, the planner), `js/course-ui.js` (the drill runner and
the 📖 Course / 🧩 Drills / 📚 book map screens) and its data in `js/course/`:

    js/course/plan.js          the skeleton: stages, chapters, every section in order
    js/course/s0-negation.js   a content pack: the pilot section "nicht or kein?"

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
    node sim.mjs [--acc 0.6 --testout 0 --days 300]
                                      # the whole journey on the real scheduler (fake clock), every lesson
                                      # section filled with synthetic packs: sections done by when, grammar
                                      # questions a day, the rule review load, rules Known, speed at full size

The older browser scripts (`tools/verb-track`, `tools/quests`) count Today's cards
without the course: `openApp()` loads it off unless `COURSE=1` or `{ course: true }`.
