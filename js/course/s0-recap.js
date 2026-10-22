// ── COURSE PACK · Stage 0 · Checkpoint: the basics ──
// Opens once every other lesson of Stage 0 is done (the verb lesson too:
// its sheets passed), asks the stage's rules mixed — typed where it can —
// and moves on at 80 %; below that the missed rules come back first in
// the reviews and the checkpoint returns the next day (3 tries at most).
cxPack({
  id: "s0-recap",
  sections: {
    "s0.recap": { checkpoint: { n: 20, pass: 0.8 } },
  },
});
