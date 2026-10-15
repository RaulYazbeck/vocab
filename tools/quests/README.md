# Quests — tests

`t-quests.mjs` drives the real app in Chromium (same setup as `tools/verb-track`: serve the
repo root with `python3 -m http.server 8765`, `npm install` once in `tools/audio/tests`).

    node t-quests.mjs                 # SEEDS=n (default 3), EXTRA_ROUNDS=n (default 2), APP=fr
    NOPRACTICE=1 node t-quests.mjs    # control run: no verb practice — the late-deficit days must fail

The rule: a quest is finished by your effort — the daily plus a little extra — never for you.

- **rules**: nothing is auto-completed (Today empty, quest short → it stays open); a hinted right form
  counts for the verb-forms quest but not for first-try / ledger / repair; targets are sized by recent
  accuracy and never exceed what Today holds; a short verb quest is topped up by verb forms in the spare
  room of a session / extra practice (ledger forms first, then known items as practice — no step up or
  down; never one verb twice in a row; the session keeps its length); ▶ on a quest with Today empty opens
  extra practice, not "All caught up"; the end-of-session list of open focus / verb quests with Go.
- **days**: whole Today days played with random wrong answers and hints (5–40% wrong), six quest sets
  per seed, including targets pushed above what the day gives and a "late deficit" (10 forms short
  after the daily): once Today is empty, every verb quest is done within two quick extra rounds.
- **summary**: the real session summary lists open focus / verb quests, Go starts that session, a focus
  session fills the quest.
