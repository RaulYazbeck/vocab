// ── COURSE PACK · Stage 2 · Checkpoint: longer sentences ──
// Opens once every other lesson of Stage 2 is done (the verb lessons too:
// their sheets passed), asks the stage's rules mixed — typed where it can —
// and moves on at 80 %; below that the missed rules come back first in the
// reviews and the checkpoint returns the next day (3 tries at most). 20
// questions, one rule each, drawn fresh every try — as Stages 0 and 1 (20
// fit a Regular 30 session; more would need a Long 60).
cxPack({
  id: "s2-recap",
  sections: {
    "s2.recap": { checkpoint: { n: 20, pass: 0.8 } },
  },
});
