# Sync — tests and the two-device simulator

`js/sync-merge.js` (the merge rules, pure) and `js/sync.js` (when to read,
merge and write). These scripts check them.

    node test-merge.mjs        # streak days, today's quests, the path's day, piece-by-piece (3-way), old saves (no browser)

In the real app (Chromium via playwright-core from `../audio/tests`; run
`npm install` there once, and serve the repo root: `python3 -m http.server 8765`):

    node sim-two-devices.mjs   # web + phone on one fake Firestore, every scenario
    node sim-two-devices.mjs tap timeout   # just some

Scenarios: the web studies two days (days kept, not all quests) while the
phone's copy gets old; then the phone opens today —

- `plain` — and syncs
- `tap` — on a slow network, Long is tapped while it's still syncing
- `timeout` — its first cloud read hangs (iOS resume), Long tapped
- `offline` — it can't read the cloud, 25 answers on it, then it can
- `repair` — the state the 2026-10-11 sync left behind (kept days gone, a
  plan made from the phone's old words) is put right on open
- `outdated` — the cloud was saved by newer sync rules than the phone
  runs: it reloads once for the new code, then writes nothing

Each checks, on both devices: the streak, every Known word, the XP,
today's plan made from the real words, and that a setting, the daily goal
and game data changed only on the web survive the phone's old copy. `BASE=http://localhost:8766` runs
it against another checkout (e.g. an older version, to see it fail).
