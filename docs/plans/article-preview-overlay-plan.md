# Article Preview Overlay Stability Plan

## Objective
Eliminate the flickering behavior in the `ArticlePreviewOverlay` while keeping deliberate dismissal pathways intact, so hovering a card produces a steady lore preview that closes only when the player leaves the hand area or clicks the overlay's close control.

## Approach Overview
1. Refine pointer-leave handling in `EnhancedGameHand` so the overlay is not closed the instant it appears.
2. Validate interaction flows manually and through automated tests to ensure regressions are caught.
3. Document coverage in tests so future contributors understand the expectation for stable previews.

## Task Breakdown

### 1. Input handling adjustments
- Remove or gate the per-card `onPointerLeave` callback that currently calls `onCardHover(null)` immediately.
- Prefer relying on the hand-level `onPointerLeave`, or introduce a slight timeout/debounce before clearing the hovered card reference.
- Confirm cards still highlight or respond to hover states as intended after the change.

### 2. Overlay dismissal verification
- Ensure the overlay continues to close when:
  - The pointer leaves the hand region entirely (via container-level handler).
  - The player clicks the overlay's explicit close button.
- Perform a manual smoke test in the browser to observe pointer interactions and confirm no accessibility regressions (e.g., keyboard users can still dismiss the overlay).

### 3. Automated test coverage
- Extend `__tests__/integration/gameplayScreen.test.tsx` (or add a sibling spec) to simulate hovering a card and assert that the overlay remains mounted until `closePreview` is dispatched.
- Cover the close conditions by simulating pointer leave of the hand container and invoking the overlay close control.
- Keep assertions resilient to timing by awaiting UI updates after hover events.

### 4. Regression safety nets (optional enhancements)
- Consider adding a utility in `useCardPreview` to centralize hover state transitions and reuse it across future UI components.
- Monitor for additional hover-triggered overlays that might need the same treatment, and document shared patterns in the technical README if generalized.

## Deliverables
- Updated pointer event logic in `src/components/game/EnhancedGameHand.tsx`.
- Strengthened integration test ensuring overlay stability.
- (Optional) shared utilities if abstraction becomes beneficial.
- PR summary noting the fix and a line item in QA checklist to manually verify hover previews when relevant UI changes occur.
