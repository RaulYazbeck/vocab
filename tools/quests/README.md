# Quests — tests

`t-quests.mjs` drives the real app in Chromium (same setup as `tools/verb-track`: serve the
repo root with `python3 -m http.server 8765`, `npm install` once in `tools/audio/tests`).

    node t-quests.mjs            # SEEDS=n (default 4), APP=fr
    NOFIT=1 node t-quests.mjs    # control run: the fix off — days should end with stuck quests (it fails on purpose)

- **rules**: the `finite` quests (the ones only Today can feed) are finished when the Today card says
  "All caught up" — and not before (work due, new words, verb reviews/items, a sheet waiting, no
  answers yet today); done quests, games, focus, time-of-day and Mystery quests untouched; no
  double XP, day completes once, never 0/0 or NaN; the verb-forms target never exceeds what Today
  holds; the end-of-session list of open focus quests (and its Go buttons).
- **days**: whole Today days played to the end with random right/wrong answers, four quest sets
  per seed — every finite quest ends done, no target ever rises.
- **summary**: the real session summary lists open focus quests, Go starts that deck's session,
  and a focus session fills the quest.
