# Sync — tests and the two-device simulator

`js/sync-merge.js` (the merge rules, pure) and `js/sync.js` (when to read,
merge and write). These scripts check them.

    node test-merge.mjs        # streak days, today's quests, the path's day, piece-by-piece (3-way), old saves, the voice log (no browser)
    node test-voice-log.mjs    # the voice log on 4 devices (the app's own code, clocks ±30 s), random flags,
                               # notes, edits, copies and syncs: nothing written is lost, nothing copied comes back
                               # (SEED=13 TRACE="Satz 3" node test-voice-log.mjs follows one run and one phrase)

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
- `resume` — the phone isn't closed but left in the background while the
  web studies; it comes back into view on a slow network and draws today's
  plan before the sync is in (a "backlog" of the web's two days): once the
  sync is in, the plan is the one made from the real words, and the usage
  log's morning numbers and the brake's reading are the real ones (they
  kept the stale 301 overdue — 686/673 in the 2026-11-19 report)
- `resume-touched` — the same with 5 answers on the phone before the sync
  is in: its day wins the merge, so its plan used to stay (37 reviews, 279
  "left for later" instead of 72 and 0 — 2026-11-17); now it's made again
- `course` — a grammar section and a text on the web, another text on the
  offline phone: both texts and the section on both
- `voice` — the voice log (⚑ flags, phrases without a recording): entries
  from both devices (and the phone's old per-device lists) on both; copied
  out on the phone, nothing copied comes back from the web's stale offline
  copy, the flags made after the copy stay on both — one phrase flagged on
  both with both notes; a force download keeps a flag not sent yet

Each checks, on both devices: the streak, every Known word, the XP,
today's plan made from the real words, and that a setting, the daily goal
and game data changed only on the web survive the phone's old copy. `BASE=http://localhost:8766` runs
it against another checkout (e.g. an older version, to see it fail).
