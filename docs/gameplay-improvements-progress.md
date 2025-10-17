# Gameplay Improvement Plan Progress Log

This log tracks implementation progress for the roadmap outlined in `docs/gameplay-improvements.md` and identifies follow-up work required to finish each priority. Status reflects repository state as of 2025-10-17.

## Priority 1 – Critical Fixes

### 1.1 Simplify Victory Conditions – *Partial*
- **Implemented:** Victory HUD now highlights state and truth progress more prominently and includes an IP tie-breaker readout.
- **Missing:** Data layer still treats IP as a primary win path (`disabled` flag absent); `checkVictoryConditions` in `src/hooks/useGameState.ts` continues to award an outright economic victory at 300 IP; UI lacks "turns to win" projections and urgency color-coding.
- **Next Steps:**
  1. Update `src/data/victoryConditions.ts` to demote IP, add a `disabled` flag, and ensure only states/truth are surfaced as primary conditions.
  2. Update the `checkVictoryConditions` logic in `src/hooks/useGameState.ts` to respect the disabled flag and treat IP strictly as a tie-breaker.
  3. Extend `src/components/game/VictoryConditions.tsx` to calculate projected "turns to win" and apply urgency theming.

### 1.2 Balance Faction Rarity Distribution – *Not Started*
- **Implemented:** No relevant changes detected in Truth faction card data; ZONE cards remain predominantly uncommon 5-IP plays.
- **Missing:** Planned rebalancing to 4-IP commons with tuned effects.
- **Next Steps:**
  1. Audit Truth ZONE entries in `src/data/core/truth.ts`, adjusting cost/rarity and pressure values.
  2. Cross-check `src/data/core/government.ts` to maintain parity.
  3. Add regression tests or validation scripts covering rarity/cost distributions.

### 1.3 Improve Victory Progress UI – *Partial*
- **Implemented:** Progress bars and "closest condition" callout are present.
- **Missing:** No "turns to win" projection, urgency color coding, or dynamic prominence shifts beyond the callout.
- **Next Steps:**
  1. Implement projected turns calculations inside `VictoryConditions.tsx` using momentum heuristics outlined in the doc.
  2. Introduce tiered color tokens in the Tailwind theme for low/medium/high urgency states.
  3. Add unit/UI tests to verify display logic for each urgency tier.

## Priority 2 – Strategic Depth Enhancements

### 2.1 Add Conditional/Special Cards – *Partial*
- **Implemented:** New conditional fields exist in the card schema and card definitions include 10 special entries per faction.
- **Missing:** `resolveCardMVP` does not consume the new effect fields, leaving the special mechanics inert.
- **Next Steps:**
  1. Expand `src/rules/mvp.ts` and `src/systems/cardResolution.ts` to parse and resolve conditional effects (`ifFewerStates`, `pressureToAllContested`, `preventHighCostCards`, etc.).
  2. Add targeted tests covering each new effect path.
  3. Update UI tooltips to explain when conditional bonuses trigger.

### 2.2 State-Specific Bonuses – *Not Started*
- **Implemented:** `STATE_BONUSES` scaffolding exists but is not referenced by the game state.
- **Missing:** States lack `stateBonus` assignments; no resolver applies bonuses; UI omits bonus surfacing.
- **Next Steps:**
  1. Annotate relevant entries in `src/data/usaStates.ts` with the planned bonus identifiers.
  2. Implement `src/systems/stateBonuses.ts` to evaluate bonuses each turn and during card resolution.
  3. Wire bonus outputs into income, combat, and tooltip components (e.g., `src/components/game/EnhancedUSAMap.tsx`).

### 2.3 Combo System Integration – *Partial*
- **Implemented:** Six combo definitions exist in configuration and are evaluated server-side each turn.
- **Missing:** Mixed Strategy and Conspiracy Complete combos from the plan are absent; there is no dedicated combo tracker UI.
- **Next Steps:**
  1. Add the missing combo definitions to `src/game/comboEngine.ts`.
  2. Create a `src/components/game/ComboDisplay.tsx` widget (and associated hook) to show active combos.
  3. Ensure combo events feed into the newspaper and log systems.

## Priority 3 – AI & Replayability

### 3.1 AI Personality System – *Not Started*
- **Implemented:** Current AI still maps directly to difficulty presets with no persona differentiation.
- **Missing:** Persona data, banter integration, and selection UI.
- **Next Steps:**
  1. Define persona profiles in `src/data/enhancedAIStrategy.ts` (priorities, decision weights, banter keys).
  2. Hook personas into the AI behavior tree and banter engine.
  3. Add persona selection controls to `src/components/GameSetup.tsx` and persist the choice.

### 3.2 Campaign Mode – *Not Started*
- **Implemented:** No campaign data or UI exists.
- **Missing:** Mission definitions, modifiers, progression storage, and UI.
- **Next Steps:**
  1. Create campaign data in `src/data/campaign.ts` with mission rules.
  2. Build UI components (`CampaignMenu`, `MissionBriefing`) and connect them to match setup.
  3. Persist progress via `src/hooks/useCampaignProgress.ts` using localStorage.

### 3.3 Daily Challenges & Modifiers – *Not Started*
- **Implemented:** No modifier system or daily challenge loop is in place.
- **Missing:** Modifier definitions, daily seed generation, challenge UI, and leaderboard support.
- **Next Steps:**
  1. Stand up modifier data in `src/data/gameModifiers.ts` and implement application logic during game initialization.
  2. Add daily seed rotation and challenge selection service.
  3. Build `src/components/DailyChallengeMenu.tsx` and wire leaderboard persistence.

## Priority 4 – Polish & UX

### 4.1 Dynamic Newspaper System – *Complete*
- **Implemented:** Issue generator now normalizes card data, resolves state mentions, supports follow-up hooks, and uses recurring characters with templated copy.
- **Next Steps:** Monitor telemetry to ensure new hooks continue to populate without regressions.

### 4.2 Tutorial System – *Not Started*
- **Implemented:** Tutorial flow absent.
- **Missing:** First-run onboarding, contextual tips, and tutorial AI behavior.
- **Next Steps:**
  1. Prototype `src/components/Tutorial.tsx` with guided turns.
  2. Add onboarding flag to player profile storage.
  3. Script tutorial dialogues referencing existing lore templates.

### 4.3 State Map Interactivity – *Not Started*
- **Implemented:** Map remains limited to defense/pressure hover info.
- **Missing:** Bonus tooltips, capture progress bars, contested highlighting.
- **Next Steps:**
  1. Enhance map component to display capture progress and contested overlays.
  2. Surface state bonus summaries alongside existing stats.
  3. Add automated visual regression coverage for the new overlays.

---

### Immediate Action Plan
1. **Finish Priority 1:** Resolve remaining victory condition work and Truth faction balancing to deliver the promised clarity improvements.
2. **Integrate Conditional Effects:** Activate special card mechanics and add supporting tests so the new content meaningfully changes gameplay.
3. **Stand Up State Bonuses:** Assign bonuses in state data, implement the resolver, and surface the bonuses in UI to realize the promised strategic depth.
4. **Extend Combo Coverage:** Add missing combos and expose combo tracking to players to reinforce synergistic play.

Document prepared for engineering leadership review.
