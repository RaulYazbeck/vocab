# The study day — travel tests

`js/config.js` (THE STUDY DAY): the day rolls over at 4 AM on the device's
clock, in whatever time zone it is in now. When the clock reads an earlier
day than the one in progress (flying west, or a laptop opened on a plane
before its time zone switched), a day with anything done on it is kept until
the clock reaches it again (at most 2 days ahead), and a day with nothing done
is taken back: the day before returns as it was, with any 🧊 freeze the early
rollover spent.

These scripts need `playwright-core` (`npm install` once in `tools/audio/tests`).
Each one serves the repo itself, so there's no server to start.

    node t-travel.mjs            # all scenarios, or name some: mexico plane …
    APP=fr node t-travel.mjs     # the same in the French app
    SEED=3 RUNS=8 node t-travel.mjs fuzz

- `home` — in 9 time zones (half-hour and 45-minute offsets, the date line,
  both daylight-saving nights), every hour: the day, its start, tomorrow's
  start and the usage log's day are exactly the clock's, and nothing is held or
  taken back
- `mexico` — Tuesday studied in Zurich; the laptop opened on the plane at 5 AM
  Zurich time (Wednesday starts, Tuesday takes the freeze); landing at 11 PM in
  Mexico City, Tuesday comes back with its quests, progress, plan and freeze;
  the change is saved at once and survives a reload; Wednesday starts at 4 AM
  Mexico time
- `untouched` — the same with nothing done on Tuesday before the flight
- `plane` — studied on the plane: Wednesday is kept after landing and runs until
  4 AM Thursday Mexico time; a word answered then is due on a later day
- `reviews` — review dates (`js/srs.js`, REVIEW DATES AFTER A TIME-ZONE
  CHANGE): reviews set for 4 AM Zurich are, after landing in Mexico, for 4 AM
  Mexico time on the same day — Wednesday's words aren't due on Tuesday
  evening, and on Wednesday morning they are today's, not a backlog (the plan
  spread such a "backlog" over a week: a smaller target while the sessions kept
  serving the words); a relearning step keeps its moment; back home they are
  on 4 AM Zurich again, same days
- `wrongonly` — a single wrong answer, or a word answered anywhere, is enough
  to keep the day
- `tokyo` — flying east: the next day starts, nothing is skipped or repeated,
  and Monday's answers stay Monday's
- `dateline` — UTC+14 → UTC−12 (the clock goes back 26 h, two days): kept
- `wrongclock` — a clock set years ahead and put right
- `fuzz` — random hours, time-zone hops round the world, study, reloads: the
  day is never behind the clock or more than 2 days ahead, a studied day never
  goes back, the quests are on the day, freezes stay within 0–2, and no counted
  day is in the future

At home nothing changes — the state after 12 simulated days (fixed clock,
seeded randomness) is byte-for-byte the same as before this change:

    OUT=/tmp/new.json node t-home-ab.mjs     # TZ_ID=America/Mexico_City …
    # then the same on the previous version → OUT=/tmp/old.json, and cmp

Two more browser tests (served by `run-suite.mjs`, below):

    node run-suite.mjs t-report.mjs   # the usage report's game times and quest counts
    node run-suite.mjs t-leave.mjs    # leaving a Today session: asked, Keep going by default

- `t-report` — game times: a game left open before the 10-minute cap counts
  10 min; days before times were logged don't thin the averages (no "active"
  time above the whole game's); new games count themselves. Quests: a day's
  quests drawn again count once; a reroll's, the weekend's and a swapped-in
  quest count as offered; on older days no quest is done more often than
  offered
- `t-leave` — a ☰ screen, the games menu or a quest's ▶ Go mid-session asks
  before leaving (they ended the session without a word); Enter = Keep going;
  an Esc that closes the accent picker isn't a Leave; the usage log and
  report say how each session was left

The older browser suites expect the repo served on :8765; `run-suite.mjs` serves
it and runs them in turn:

    node run-suite.mjs ../sync/sim-two-devices.mjs ../quests/t-quests.mjs ../verb-track/t-drill.mjs …
