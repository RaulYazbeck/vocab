# Verb track — tests and the journey simulator

The German verb track lives in `js/verb-track.js` (model), `js/grammar-sheets-de.js`
(the 37 sheets) and `js/grammar-ui.js` (screens). These scripts check it.

Content (no browser):

    node test-content.mjs   # every sheet: well-formed; every quiz answer, table and line = the verb engine
    node test-sync.mjs      # S.verb merges between two devices

In the real app (Chromium via playwright-core from `../audio/tests`; run
`npm install` there once, and serve the repo root: `python3 -m http.server 8765`):

    node t-flows.mjs        # switch, preview, gating, mirrors, game credit, reports, switching back
    node t-french.mjs       # the French app is unchanged
    node t-switch.mjs       # what switching on does to the test profile (numbers, first session)
    OUT=/tmp/shots node t-ui.mjs   # walks every new screen, phone + desktop screenshots
    node sim.mjs            # the whole journey to the finish date, verb track on vs off

`profile.js` is the test profile: shaped like the real one on 2026-10-10
(A1 done, 13 A2 words met, finish date 2027-08-15).
