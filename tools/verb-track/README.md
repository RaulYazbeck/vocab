# Verb track — tests and the journey simulator

The verb track lives in `js/verb-track.js` (model), `js/grammar-quiz.js` (quizzes)
and `js/grammar-ui.js` (screens), shared by both apps. German: `js/grammar-sheets-de.js`
(the 37 sheets). French: `js/verb-track-fr.js` (its tenses, rules, forms, grading and
the Spanish screen texts) and `js/grammar-sheets-fr.js` (38 sheets in Spanish, for a
speaker from México). These scripts check it.

Content (no browser):

    node test-content.mjs   # every sheet: well-formed; every quiz answer, table and line = the verb engine;
                            # every point has questions; thousands of drawn quizzes checked against the engine
    node test-sync.mjs      # S.verb merges between two devices
    node test-content-fr.mjs   # the same for French (load-fr.mjs): sheets in Spanish only, every
                               # answer / table / list = the engine, Subjonctif and participles
                               # against the deck cards, every Spanish screen string present

In the real app (Chromium via playwright-core from `../audio/tests`; run
`npm install` there once, and serve the repo root: `python3 -m http.server 8765`):

    node t-flows.mjs        # switch, preview, gating, mirrors, game credit, reports, switching back
    node t-quiz.mjs         # sheet quizzes (size, every point, 100%, re-ask) and mastery quizzes
    node t-review.mjs       # a miss → the sheet → back to the quiz, nothing lost (every kind, menu + Today)
    node t-logs.mjs         # what the usage report, learning log and sync get from the quizzes
    node t-forms.mjs        # every form × person: whole verb asked, graded right, nothing shown in the prompt
    node t-screens.mjs      # every screen and card drawn, phone + desktop: no errors, no broken text
    node t-buttons.mjs      # every button pressed for real (taps, keys, edge cases), phone + desktop
    node t-french.mjs       # the French app: switch, preview, gating, every sheet through the
                            # screens, a miss and the way back, mastery, Today's verb cards,
                            # game credit, reports, the Spanish screens, switching back
    APP=fr node t-forms.mjs / APP=fr node t-screens.mjs   # the same audits in the French app
    node t-session.mjs      # whole Today sessions, right and wrong, repair round: the count (x/N) never
                            # grows, the same word (or verb) never twice in a row  (SEED=, DAYS=, APP=fr)
    node t-tense.mjs        # the tense as the card's title; a right form of another tense is named and
                            # gets one more try (right then = right); ich hätte for ich hatte  (APP=fr)
    node t-plural.mjs       # a plural missed in Plural Hunt is repaired as its plural (der Tisch → die ___)
    node t-typing.mjs       # what a typed answer may differ in (accents, ß, œ, ae/oe/ue, apostrophes,
                            # hyphens, elision), word answers and verb forms, both apps
    node t-switch.mjs       # what switching on does to the test profile (numbers, first session)
    OUT=/tmp/shots node t-ui.mjs   # walks every new screen, phone + desktop screenshots
    node sim.mjs            # the whole journey to the finish date, verb track on vs off
    node sim.mjs --app fr --on   # the same journey in the French app

`profile.js` is the test profile: shaped like the real one on 2026-10-10
(A1 done, 13 A2 words met, finish date 2027-08-15).

Every browser script can run on a real saved state instead: extract the
`gv5_de` value of a backup file to a JSON file and pass it as `REAL_STATE`
(never commit it):

    REAL_STATE=/path/state.json node sim.mjs
    REAL_STATE=/path/state.json OUT=/tmp/dump.txt node dump.mjs   # every exercise the track would ask, for review
