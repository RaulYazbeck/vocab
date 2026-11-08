// ── COURSE PACK · Stage 1 · Checkpoint: building sentences ──
// Opens once every other lesson of Stage 1 is done (the verb lessons too:
// their sheets passed — and verb + preposition, built in Session 6), asks
// the stage's rules mixed — typed where it can — and moves on at 80 %;
// below that the missed rules come back first in the reviews and the
// checkpoint returns the next day (3 tries at most). Stage 1 has five times
// Stage 0's rules: 24 questions, one rule each, drawn fresh every try.
cxPack({
  id: "s1-recap",
  sections: {
    "s1.recap": { checkpoint: { n: 24, pass: 0.8 } },
  },
});
