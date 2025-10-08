# Continuity Overtime Protocol Cheat Sheet

The sim harness and in-game victory manager now share a high-priority "Continuity Overtime Protocol" condition. Once the current turn meets or exceeds the configured cap, the match ends immediately using the following evaluation order:

1. **Truth momentum check.** Compare current Truth standing against the configured pivot (defaults to the starting Truth). Positive momentum awards the win to the Truth Seekers; negative momentum gives the Shadow Government the broadcast.
2. **Territorial audit.** If momentum is neutral within the tolerance window, compare secured states. The faction with more territory claims the win.
3. **Economic fallback.** Persistent ties fall back to total IP to reward whoever actually banked the stronger narrative budget.
4. **Continuity failsafe.** As a last resort, the configured default faction receives the nod (defaults to Truth) so we never drift back into the old deterministic coin flip.

The new CLI knobs for `tools/ai-simulation.ts` expose the rule to campaign scripts:

- `--overtimePivot=<number>` sets the Truth pivot (defaults to the starting Truth).
- `--overtimeTolerance=<number>` defines how much momentum counts as "neutral" before we fall back to territory.
- `--overtimeMargin=<number>` requires a minimum state lead before territory decides the match.
- `--overtimeDefault=<truth|government>` selects the continuity failsafe faction.

Sim logs now record reasons such as `overtime_truth_momentum`, `overtime_territory`, or `overtime_ip`, and include a small `overtime` payload summarizing the resolution method. Campaign analysts can scan for those tags to verify whether the AI is banking on momentum pushes or map control to close games.

For quick experiments, try:

```
bunx tsx tools/ai-simulation.ts --games 6 --iterations 0 --maxTurns 28 \
  --overtimePivot=52 --overtimeTolerance=1.5 --overtimeMargin=1
```

The command forces overtime resolution after 28 turns, rewards the Truth only if they finish at least ~1.5 points above their pivot, and demands a one-state lead to win by territory.
