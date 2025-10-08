# Opponent AI Audit & Roadmap

## Current State Assessment
- **Difficulty adherence:** The strategist now derives its difficulty profile from `AI_PRESETS`, ensuring aggression, randomness, and simulation depth scale appropriately for `easy`, `medium`, `hard`, and `insane` tiers.
- **Rule parity with players:** Card resolution and income forecasts share the same MVP rules pipeline via `resolveCardMVP`, so the AI no longer relies on bespoke shortcuts.
- **Adaptive insights:** Existing memory systems track threat trends, bluff outcomes, and player aggression, but prior builds lacked an explicit agenda-response layer and routinely repeated target states within a single turn.

## Enhancements Delivered in this Pass
- Added an **agenda counter-plan evaluator** that boosts or redirects priorities when the human agenda is exposed or approaching completion. The planner detects agenda categories, extracts referenced states, and reports the resulting focus to the turn log.
- Introduced **state rotation penalties** that discourage targeting the same region repeatedly and synchronize with per-turn planning memory, leading to varied openings across games.
- Recorded planned targets during turn sequencing so momentum carries through the post-play learning hooks, tightening the feedback loop between plan, execution, and learning.

## Follow-up Tasks & Owners
1. **Agenda parsing hardening** *(AI Systems)* – Expand `extractAgendaFocusStates` to use structured metadata instead of regex parsing once agenda definitions expose explicit target lists.
2. **Simulation budget telemetry** *(Tooling)* – Emit profiling data for MCTS iterations per difficulty so designers can tune `rolloutsPerBranch` without manual instrumentation.
3. **Counter-play tutorialization** *(Narrative Design)* – Update in-game tooltips to explain how the AI reacts when the player’s hidden agenda is exposed, reinforcing the new behaviour diegetically.
4. **Cross-turn memory persistence** *(AI Systems)* – Persist a compressed snapshot of `recentTargetHistory` between games to improve long-form campaign variety while keeping single-match focus fresh.

> **Paranoia Intent:** These changes aim to let the AI sniff out exposed agendas like a newsroom mole while rotating pressure vectors so each replay feels like a different shadow briefing.
