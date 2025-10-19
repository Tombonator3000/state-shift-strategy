# Updates Log

This document provides a chronological record of gameplay-impacting changes merged into State Shift Strategy. Each entry should include the merge date and a brief, human-readable summary so future contributors can quickly understand how the game has evolved.

## 2025-10-26 – Restore Lovable preview builds
- Timestamp: 2025-10-26T00:00:00Z
- Files:
  - `vite.config.ts`
- Summary: Reordered the Vite alias configuration so the Lovable public asset shortcut resolves correctly during production
  builds, restoring the hosted preview that previously failed while trying to load the article database bundle.

## 2025-10-25 – Composite turn edition headlines go live
- Timestamp: 2025-10-25T02:50:00Z
- Files:
  - `src/components/newspaper/TurnEdition.tsx`
  - `src/components/game/TabloidNewspaperV2.tsx`
  - `src/components/game/TabloidNewspaperLegacy.tsx`
  - `__tests__/newspaper/TurnEdition.test.tsx`
  - `components.json`
- Summary: Introduced a dedicated TurnEdition hero component that renders composite stories with faction connectors, updated the tabloid newspaper to consume `{ kind: 'composite' }` feed entries instead of legacy article blocks, and added targeted tests ensuring tone-specific presentation and image prompt fallbacks behave correctly.

## 2025-10-24 – Article combiner powers live newsroom column
- Timestamp: 2025-10-24T11:30:00Z
- Files:
  - `src/components/game/TabloidNewspaperV2.tsx`
  - `docs/ARTICLE_COMBINER.md`
  - `UPDATES_LOG.md`
- Summary: Wired the in-game Tabloid newspaper to call the article combiner for a new Newsroom Collation column that fuses two or more front-page dossiers, added faction-aware badges and loading feedback, and documented how the live integration mirrors the dev demo.


## 2025-10-23 – Unified roadmap now authoritative
- Timestamp: 2025-10-23T10:15:00Z
- Files:
  - `docs/roadmap.md`
  - `docs/paranoid_times_analysis_and_roadmap.md`
  - `docs/analysis/paranoid-times-gap-analysis.md`
  - `docs/gameplay-loop-overview.md`
  - `UPDATES_LOG.md`
- Summary: Consolidated every roadmap thread into the central planning doc, reorganised goals by timeframe and pillar, trimmed the duplicate timelines from the analysis dossiers, and updated cross-references so contributors consult the unified plan.

## 2025-10-22 – Menu playlist honors selected track
- Timestamp: 2025-10-22T12:56:38Z
- Files:
  - `src/pages/Index.tsx`
  - `UPDATES_LOG.md`
- Summary: Ensured the main menu only initializes its music once when the intro hands off control so player-selected tracks fro
m the options panel persist instead of resetting to the default playlist.

## 2025-10-19 – Accordion briefing modernizes How-to-Play
- Timestamp: 2025-10-19T13:17:05Z
- Files:
  - `src/components/game/HowToPlay.tsx`
  - `src/components/game/WhatIsParanoidTimes.tsx`
  - `components.json`
- Summary: Rebuilt the How-to-Play overlay around a pulp-styled accordion that introduces the Paranoid Times newsroom fantasy before expanding into the MVP ruleset, added a dedicated intro component, and cataloged the new surface for designers.

## 2025-10-18 – Final edition borrows live card articles for MVP coverage
- Timestamp: 2025-10-18T09:45:00Z
- Files:
  - `src/components/news/NewspaperFrontPage.tsx`
  - `src/components/news/NewspaperInsidePages.tsx`
  - `src/styles/newspaperLayout.css`
  - `src/utils/finalEdition.ts`
  - `src/news/finalFrontPageComposer.ts`
  - `src/types/finalEdition.ts`
  - `__tests__/utils/finalEdition.test.ts`
- Summary: Front page and inside spread now render full MVP and runner-up copy pulled from the card article bank, fall back to existing report highlights when no article exists, and the game-over report captures sanitized paragraphs for downstream UIs with regression coverage for both pathways.

## 2025-10-17 – Gameplay improvement status audit logged
- Timestamp: 2025-10-17T14:05:00Z
- Files:
  - `docs/gameplay-improvements-progress.md`
  - `UPDATES_LOG.md`
- Summary: Captured the real implementation status of the 40-point gameplay improvement plan, documented which fixes are complete, partial, or missing, and outlined concrete next steps so engineering can prioritize the remaining roadmap work.

## 2025-10-16 – Tabloid overlay consumes stored composites
- Timestamp: 2025-10-16T18:10:00Z
- Files:
  - `src/components/game/TabloidNewspaperV2.tsx`
  - `src/components/game/TabloidNewspaperLegacy.tsx`
  - `src/news/finalizeEdition.ts`
  - `src/utils/finalEdition.ts`
  - `src/pages/Index.tsx`
  - `__tests__/integration/gameplayScreen.test.tsx`
  - `__tests__/integration/extraExtra.test.ts`
- Summary: Refactored the nightly tabloid to read the latest turn composite and runners-up directly from saved state, introduced a final-edition helper that ranks composites alongside bulletins, updated overlays to consume the ranked feed, and extended integration coverage for per-turn headlines and Extra Extra updates.

## 2025-10-16T10:15:08+00:00 – Migrated article bank to shared loader
- Shifted newspaper systems to the shared `src/news/articleBank.ts` Map loader and aligned IssueGenerator, composeTurn, and headline previews with the new API.
- Added regression coverage for canonical cards and tone normalization while updating UI consumers to the Map-based article lookups.
- Files: `src/news/articleBank.ts`, `src/engine/newspaper/IssueGenerator.ts`, `src/news/composeTurn.ts`, `src/news/headlineEngine.ts`, `src/components/news/NewspaperFrontPage.tsx`, `src/ui/newspaper/FrontPage.tsx`, `src/utils/sensationalistHeadlines.ts`, `__tests__/news/articleBank.test.ts`, `__tests__/news/headlineEngine.test.ts`, `__tests__/news/composeTurn.test.ts`, `src/engine/newspaper/__tests__/IssueGenerator.staticArticles.test.ts`, `src/engine/newspaper/__tests__/IssueGenerator.recurringCharacters.test.ts`, `src/components/game/__tests__/TabloidNewspaperV2.frontPage.test.tsx.disabled`, `src/engine/newspaper/__tests__/IssueGenerator.safety.test.ts.disabled`.
## 2025-10-21 – Article overlay stays open until dismissed
- Timestamp: 2025-10-21T12:00:00Z
- Files:
  - `src/components/game/EnhancedGameHand.tsx`
  - `src/pages/Index.tsx`
  - `docs/INTEGRATION_GUIDE.md`
- Summary: Locked the hand hover handlers so the newsroom article overlay no longer clears itself when the pointer leaves, removed the hover-to-open wiring from the gameplay screen, and extended the QA checklist to cover long-read stability for the article preview.

## 2025-10-17 – Strategy insights migrate to help overlay
- Timestamp: 2025-10-17T08:45:00Z
- Files:
  - `src/components/game/ContextualHelp.tsx`
  - `src/components/gameplay/StrategyHelper.tsx`
  - `src/pages/Index.tsx`
  - `__tests__/integration/gameplayScreen.test.tsx`
- Summary: Routed the strategy insight engine into the contextual help drawer, removed the standalone panel from the main layout, and updated integration coverage to confirm insights surface when agents open the overlay.

## 2025-10-16 – Newsroom previews and ticker integration
- Timestamp: 2025-10-16T09:00:00Z
- Files:
  - `src/pages/Index.tsx`
  - `src/components/newspaper/BreakingNewsTicker.tsx`
  - `src/components/game/ExtraEditionNewspaper.tsx`
  - `src/components/newspaper/EnhancedFinalEdition.tsx`
  - `src/components/game/CardAnimationLayer.tsx`
  - `src/utils/visualEffects.ts`
  - `__tests__/integration/gameplayScreen.test.tsx`
- Summary: Routed hover previews through the newsroom article overlay, promoted the breaking-news ticker to a global event feed, upgraded the final-edition layout, and added integration coverage for the new UI flows.

## 2025-10-10 – End-turn newspaper now prints curated card articles
- Timestamp: 2025-10-10T12:28:15Z
- Files:
  - `src/engine/newspaper/IssueGenerator.ts`
  - `src/engine/newspaper/__tests__/IssueGenerator.staticArticles.test.ts`
  - `UPDATES_LOG.md`
- Summary: Reordered the newspaper article resolver so the curated card copy used in the article preview overlay appears in the between-turn newspaper, added regression coverage to lock in the new priority, and documented the change.

## 2025-10-10 – Article previews now require explicit activation
- Timestamp: 2025-10-10T11:22:50Z
- Files:
  - `src/components/game/EnhancedGameHand.tsx`
  - `src/components/game/CardDetailOverlay.tsx`
  - `src/components/newspaper/ArticlePreviewOverlay.tsx`
  - `src/pages/Index.tsx`
  - `docs/INTEGRATION_GUIDE.md`
  - `UPDATES_LOG.md`
- Summary: Rewired the newsroom article overlay to launch from a Read Article action instead of hover, locked hover exits from clearing the preview while it is open, added Escape-key support to the overlay, and documented manual QA steps to confirm the preview remains readable until dismissed.

## 2025-10-10 – Start menu radio previews for every broadcast
- Timestamp: 2025-10-10T11:14:39Z
- Files:
  - `src/components/game/Options.tsx`
- Summary: Refreshed the options screen so players can audition government, truth, end credits, and theme playlists right from the start menu with quick-select buttons and clearer playlist labels.

## 2025-10-10 – Safeguarded hotspot source labels on the map
- Timestamp: 2025-10-10T10:50:57Z
- Files:
  - `src/components/game/EnhancedUSAMap.tsx`
- Summary: Hardened the enhanced USA map overlay so hotspot sources and event factions default to an "UNKNOWN" tag instead of crashing when saved data lacks a faction string.

## 2025-10-15 – Built-in expansions join MVP rotation
- 09:18 UTC – Wired the builtin expansion manifest so Truth Vanguard and Government Countermeasures decks import through the MVP normalizer. Files: `src/data/expansions/index.ts`, `src/data/expansions/builtin.ts`, `src/lib/expansions/discover.ts`.
- 09:18 UTC – Realigned expansion article IDs and UI summaries so new packs display correctly in management panels. Files: `src/data/cardArticles/expansionArticles.ts`, `src/components/game/ManageExpansions.tsx`.
- 09:18 UTC – Added regression coverage to confirm the builtin packs validate cleanly and feed random draws. Files: `src/data/__tests__/builtinExpansions.test.ts`.
## 2025-10-15 – Recurring character persistence and staged epilogues
- Timestamp: 2025-10-15T14:30:00Z
- Files:
  - `src/components/game/TabloidNewspaperLegacy.tsx`
  - `src/components/game/TabloidNewspaperV2.tsx`
  - `src/components/news/NewspaperInsidePages.tsx`
  - `src/components/newspaper/EnhancedFinalEdition.tsx`
  - `src/data/characterArcs.json`
  - `src/data/characterArcs.ts`
  - `src/engine/newspaper/IssueGenerator.ts`
  - `src/engine/newspaper/__tests__/IssueGenerator.recurringCharacters.test.ts`
  - `src/game/__tests__/recurringCharacterArticles.test.ts`
  - `src/game/__tests__/recurringCharacters.test.ts`
  - `src/game/recurringCharacterArticles.ts`
  - `src/game/recurringCharacters.ts`
  - `src/hooks/aiHelpers.ts`
  - `src/hooks/gameStateTypes.ts`
  - `src/hooks/useGameState.ts`
  - `src/pages/Index.tsx`
  - `src/types/finalEdition.ts`
  - `src/utils/finalEdition.ts`
  - `UPDATES_LOG.md`
- Summary: Persisted recurring character progression through saves, fed staged appearances into newspaper generation, and surfaced “Where Are They Now?” epilogues in final editions.

## 2025-10-14 – State-themed bonus engine
- Implemented a seeded `assignStateBonuses` pipeline that drafts weighted regional effects, logs per-state anomalies, and feeds matching newspaper events for the round.
- Wired round start to apply state bonuses, refresh state event history for UI badges, and surface card-level `stateBonuses` metadata in strategy helpers.

## 2025-10-13 – Extra Extra stamp honors true triple headlines
- Updated the newspaper overlay so the Extra Extra masthead stamp appears only when a faction lands a legitimate triple headline with a shared front-page trio.
- Ensured faction mismatches or filler fallbacks no longer surface the Extra Extra branding, keeping the tabloid's flair tied to real combo victories.

## 2025-10-12 – Extra Extra toast mirrors headline wins
- Triggered the Extra Extra toast alongside article generation, reusing the logged winning faction and headline so players get an immediate pop-up summary.
- Added a window guard so the notification hook remains safe to call during Storybook or server-side rendering where no DOM exists.

## 2025-10-11 – Truth faction archive completed
- Authored and imported narrative articles for Truth cards `TRUTH-001` through `TRUTH-200`, giving every legacy card a bespoke Paranoid Times report.
- Added a generation script for the tail-end entries so future lore passes can iterate without hand-editing 100+ records.
- Refreshed the coverage dashboard to confirm Truth now has zero gaps while Government remains the next writing focus.

## 2025-10-11 – Article cache + fallback guardrails
- Implemented cached lookups for `CARD_ARTICLE_DATABASE` so repeated issue generation avoids full scans and tolerates missing IDs with null memoization.
- Wired `IssueGenerator` to request `getArticleOrFallback`, blending remote bank data, static TypeScript articles, and generated copy when gaps remain.
- QA sweep confirmed variable substitution, tone transforms, and <200 ms issue builds under fallback data; flagged remaining coverage gaps in MVP card set and environment-only loaders for follow-up.

## 2025-10-10 – Editor banter anchors below the masthead
- Repositioned the editor banter toast feed so it materializes beneath the Paranoid Times masthead instead of hovering near the
  bottom HUD, making quips unmissable during high-alert turns.
- Locked the overlay to the safe-area offsets so handheld agents still see the editor's whispers tucked under the newsroom mast
  head badge.

## 2025-10-10 – Newspaper tone transforms
- Added placeholder-safe tone transforms and an `applyTone` helper so newspaper copy can shift between straight news, tabloid, local color, exposé, and classified styles.
- Extended card article metadata with `preferredTone` overrides and updated the issue generator to select and apply tones before front-page rendering.

## 2025-10-09 – Recurring Character Story Arc Variants
- Added story arc metadata and stage progression tracking for Pastor Rex, Agent Smitherson, Florida Man, Bat Boy, Maria Chen, and Coach Terry Hammond.
- Tagged stage-specific article variants across truth and expansion coverage, authoring new pieces to ensure at least three appearances per character.
- Implemented a selector that advances recurring character stages after each article use, enabling narrative escalation in the newspaper system.

## 2025-10-09 – Dynamic Newspaper Variable Injection
- Added `GameStateContext` templating so generated headlines and bodies swap in live turn, score, IP, and faction data.
- Plumbed Tabloid newsroom UI to forward round metrics into the issue generator for accurate article context.
- Annotated eleven Paranoid Times articles with `{TURN_NUMBER}`, `{STATES_CONTROLLED}`, `{IP_REMAINING}`, and related placeholders to validate substitution.

## 2025-10-09 – Expansion Newspaper Batch & Coverage Audit
- Added ten missing Truth faction articles (TRUTH-009 through TRUTH-020) and forty expansion-era features spanning every US state.
- Authored new `expansionArticles.ts` covering TRUTH-NEW and GOV-NEW cards with balanced recurring-character ratios and crossover hooks.
- Consolidated all article sources via `ALL_CARD_ARTICLES` and published `docs/cardArticles/article-coverage.md` to document remaining ID gaps.

## 2025-01-09 – Phase 5: UI/UX Enhancements Complete
- **Article Preview Overlay:** Created full-screen article preview with newspaper-style layout, scrollable content, and related information display
- **Breaking News Ticker:** Implemented real-time news ticker at top of screen showing card plays, captures, and game events with auto-dismiss
- **Strategy Helper:** Added smart assistant showing combo opportunities, state bonuses, and tactical suggestions based on current hand
- **Enhanced Final Edition:** Complete newspaper redesign with MVP article, runner-up story, state-by-state results, Extra Extra callouts, classified ads, and letters to the editor
- **News Event System:** Created helper library for dispatching breaking news during gameplay with templates for card plays, captures, combos, and turn events
- **Card Preview Hook:** Custom React hook for managing article preview state across components
- **Components Created:**
  - `src/components/newspaper/ArticlePreviewOverlay.tsx` - Full article preview modal
  - `src/components/newspaper/BreakingNewsTicker.tsx` - Real-time news ticker
  - `src/components/gameplay/StrategyHelper.tsx` - Tactical assistance panel
  - `src/components/newspaper/EnhancedFinalEdition.tsx` - Multi-section final newspaper
  - `src/hooks/useCardPreview.ts` - Preview state management hook
  - `src/lib/newsEventHelpers.ts` - News event dispatch utilities

## 2025-01-09 – Gameplay & Content Expansion (Phases 2-4 Complete)
- **Article Database:** Created card-specific newspaper articles with coherent narratives, recurring characters, and follow-up hooks for 5 existing cards (Bigfoot, Elvis, Pastor Rex, Bat Boy, UFO Football Game)
- **40 New Cards:** Added 20 Truth faction and 20 Government faction expansion cards with full effects, flavor text, and strategic depth
- **Two-Card Combos:** Implemented 10 mini-combo definitions (Elvis + Alien Wedding, Bigfoot + Mothman, UFO + Weather Balloon, etc.)
- **State-Specific Bonuses:** Cards now get thematic bonuses in appropriate states (Roswell cards in New Mexico, Elvis in Tennessee, Bigfoot in Washington, etc.)
- **Recurring Characters:** Added character tracking system for Pastor Rex, Agent Smitherson, Florida Man, Bat Boy, Darlene Hobbs, and Coach Terry Hammond
- **New Card Types:** Defined HYBRID (dynamic cost), TRAP (face-down triggers), and PERSISTENT (multi-turn effects) card mechanics
- **Files Created:**
  - `src/data/cardArticles/articleDatabase.ts` - Article database with query helpers
  - `src/data/expansion/newTruthCards.json` - 20 new Truth cards
  - `src/data/expansion/newGovernmentCards.json` - 20 new Government cards
  - `src/game/twoCardCombos.ts` - Mini-combo definitions
  - `src/game/stateBonuses.ts` - State-specific bonus system
  - `src/game/recurringCharacters.ts` - Character tracking
  - `src/game/newCardTypes.ts` - Advanced card type definitions
- **Roadmap:** Comprehensive 6-phase development plan saved to `docs/roadmap.md`

## 2025-01-09 – Phase 1: TypeScript build configuration modernized
- Removed deprecated `baseUrl` option from `tsconfig.node.json` that was causing TS5102 build errors.
- Retained modern `paths` configuration for proper module resolution with @ imports.
- Created comprehensive development roadmap (`docs/roadmap.md`) outlining 6-phase improvement plan for gameplay mechanics, card content, and newspaper article quality.

## 2025-12-08 – Credits go full projector paranoia
- Swapped the endgame overlay for a full-screen cinema roll packed with in-universe easter eggs, department gags, and paranoid stingers.
- Added rotating evidence snapshots from the card archive so the credits parade flashes actual tabloids while the music swells.

## 2025-12-07 – Cryptid combos ignite the tabloids
- Added a suite of tag-aware combo triggers for the Cryptids expansion so Bigfoot–Elvis tours, Bat Boy coalitions, and other Appendix A pairings now pay out in-game rewards.
- Wired the dripping-blood typographic treatment into cryptid combo headlines and ensured every state (plus DC) reports a homestate cryptid bonus with fresh idle copy.

## 2025-12-06 – Campaign HUD no longer implodes on return from menus
- Reordered the AI dossier hook stack so slipping back from the menu no longer triggers React's hook-order panic mid-mission.
- Kept the rival editor portraits and agenda intel wired into the overlay so agents still clock who's orchestrating the cover-up when they re-enter the briefing room.

## 2025-12-05 – AI dossiers spotlight opponent portraits
- The AI opponent status panels now surface the rival editor's portrait so agents can clock who is orchestrating the cover-up at a glance.
- The overlay dossier reuses the shared portrait pipeline, ensuring fresh art drops instantly sync across the HUD.

## 2025-12-04 – ParaPedia atlas wired into Player Hub
- Introduced a curated ParaPedia dataset with state dossiers, featured quotes, and reference trails so leaksters can trace every anomaly from the hub.
- Upgraded the ParaPedia panel with atlas navigation, codex search, and state-specific detail views driven by the new hook layer.

## 2025-10-09 – Player Hub gains backtrack control
- Added a Back button to the Player Hub dossier header so agents can slip out of the archive without relying on the tiny kill-switch.
- Styled the control to stay faithful to the classified parchment palette whether agents fly Truth colors or government badges.
## 2025-10-09 – Player Hub dossier metadata stripped out
- Removed the case file metadata banner so the Player Hub reserves more real estate for active dossiers and lore feeds.
- Kept the faction stamp treatment so agents still clock whether they're rifling through leaked or cleared records at a glance.

## 2025-10-09 – Cryptid hotspots now echo local legends
- Rewrote the cryptid hotspot summaries so each state briefing references the folklore dossiers—Altie coils along the Altamaha, Chessie corrals Chesapeake patrols, and Jackalope permits go feral in souvenir rows.
- Grounded the new copy in the expansion readme to keep the Paranoid Times lore web dense while giving operators state-specific paranoia levers.

## 2025-10-09 – Classified dossier overlay retired during reveals
- Retired the typewriter dossier pop-up that blanketed the map when conspiracies flipped so players can keep reading the board state during dramatic reveals.
- Documented the change in the contextual effect switch to prevent future overlays from eclipsing mission interactions.

## 2025-10-09 – Cryptid idle reports rotate onto the map
- Replaced the generic paranormal sweep idle message with rotation through Fangoria-sourced state cryptid briefings so the USA map and event log stay steeped in regional folklore even when hotspots are dormant.
- Expanded the idle report roster with Appendix C homestate dossiers and tuned the fallback copy to reference the Cryptids expansion field guide when the feed hiccups.

## 2025-12-03 – ParaPedia knowledge vault opens
- Truth agents now land on a dedicated ParaPedia tab inside the Player Hub, complete with lore-forward metrics and a leak-fed
  recap reel.
- The dossier navigation adds a Truth-only folder so leaksters can jump back into the codex without wading through government
  paperwork.

## 2025-12-02 – Desk editor briefings show case file portraits
- The in-game editor dossier now pulls each editor's portrait into the status popover so newsroom briefings match the selection screen.
- Ensured the portrait respects the `/public/images/editors` pathing helper so new art drops automatically appear across the HUD.

## 2025-12-01 – Tabloid turn-end crash neutralized
- Fixed a missing `useCallback` import in the enhanced tabloid newspaper so the bundle no longer throws a reference error when resolving end-of-turn events.
- Verified the newsroom edition overlay renders without blinking to a white screen after AI or player turns conclude.

## 2025-10-09 – Banter toasts surface editor quips
- Wired the banter engine into a dedicated HUD toast lane so editors' conspiratorial asides flare on screen instead of hiding in console logs.
- Added a public window helper for banter toasts, mirroring combo behavior so other systems can drop sly transmissions into the overlay.

## 2025-10-09 – ParaPedia dossier cleared for all agents
- Opened the ParaPedia knowledge vault to government operatives so both factions can access the paranormal atlas from the Player Hub.
- Updated the dossier navigation to surface the ParaPedia tab alongside existing folders regardless of faction alignment.

## 2025-10-09 – Tabloid front page hero goes full broadsheet
- Rebuilt the Final Edition hero into a split-column tabloid spread with oversized type, accent stripes, and a full-bleed art well that honors victory tones.
- Upgraded MVP card handling so the front page art now escalates to a dramatic border treatment and gracefully falls back to runner-up footage when needed.

## 2025-10-09 – Map scouting untethered from zoom locks
- Added padded panning bounds so agents can right-drag the US map at any zoom level, keeping recon smooth even when fully zoomed in or out.
- Confirmed context-menu suppression still works so long-press sleuthing never trips a browser pop-up mid-investigation.

## 2025-10-09 – Paranoid Times masthead joins the spin wars
- Rebuilt the live edition masthead with a halftone wash, serif title, and equal-opportunity propaganda copy for loyalists and leaksters alike.
- Updated the final report layout to trade the ShadowGov stamp for the new joint spin bureau branding so both factions share the same sardonic headline wrapper.

## 2025-10-09 – Completed Fangoria + NAC ingestion
- Rebuilt Appendix C with all fifty state creatures, region notes, and explicit ops hooks drawn from Fangoria’s survey.
- Authored a 57-entry NorthAmericanCryptids field guide so designers have ready deck hooks for every listed monster.

## 2025-10-09 – Cataloged cryptid intel for expansion docs
- Expanded the Cryptids expansion README with state-by-state lore harvested from Fangoria, plus play hooks for each hometown monster.
- Imported the northamericancryptids.com bestiary into a new field guide section so designers can wire in regionally accurate ops beats.
## 2025-11-30 – Editor dossiers display real portraits
- Desk editor dossiers now pull their case file photos from `/public/images/editors`, replacing the placeholder blocks.
- The selection modal and preview cards render those portraits directly so newsroom briefings feel grounded in the conspiracy canon.

## 2025-11-29 – Paranoid Times masthead anchored
- Locked the newspaper masthead to Paranoid Times with short-lived glitches that flash rival tabloid titles before snapping back.
- Wired the glitch cadence to respect reduced-motion preferences so accessibility settings freeze the masthead when needed.

## 2025-11-28 – Finale headline composer locked in
- Added regression coverage for the finale front-page composer, ensuring bulletin fusion, sanitized food-word stripping, and graceful fallbacks.
- Final edition layout tests now confirm the composed kicker/headline/dek render on the masthead even without bulletins, giving narrative QA a Weekly World News-style north star.

## 2025-11-27 – Final edition front page surfaces
- Final edition reports now capture a front-page article derived from the Extra Extra feed with victory-aware fallbacks.
- The Paranoid Times masthead renders that article’s kicker/headline/dek, reverting to legacy copy only when no article is available.

## 2025-11-26 – Loggable self-training runs for the campaign AI
- Wired the AI simulator to dump every match into an NDJSON dataset so tuning sessions double as training fodder.
- Added a convenience npm script and workflow doc covering how to iterate on weights while committing the resulting evidence trail.

## 2025-11-25 – Keep enhanced MCTS exploring terminal leaves
- Taught the enhanced strategist to score and backpropagate terminal rollouts instead of bailing out of the search loop when a branch dead-ends mid-iteration.
- Added a regression harness that forces a terminal child and confirms the planner still evaluates the remaining branch.

## 2025-11-24 – Calibrate enhanced AI rollout budgets
- Let enhanced MCTS difficulties respect the tuned rollout budgets (medium ≈16, hard ≈48, insane ≈120) instead of forcing a 200-iteration floor.
- Documented the rollout multiplier in the AI factory so future tuning can bump the shared budget knob intentionally.

## 2025-11-23 – Hard AI reprioritizes neutral captures
- Weighted ZONE capture pressure by combined IP value, location leverage, and defense so neutral haymakers outshine low-importance grabs.
- Tuned pressure heuristics to respect that valuation during turn planning, keeping Hard difficulty focused on high-IP swing states.

## 2025-11-22 – Instant triple-headline tabloid surges
- Primed the Extra Extra headline caches at module load so triple-card combos deliver tabloid-grade headlines without waiting for async preload hooks.
- Added defensive cache access guards to fall back gracefully if JSON parsing ever fails during startup.

## 2025-11-21 – Harden extension index build for previews
- Added a Bun fallback to the extension index prebuild script so Lovable GIR previews succeed even when Node isn't available.
- Confirmed the extensions manifest continues to regenerate before dev and production builds.

## 2025-11-20 – Stabilize touch drag controls
- Locked card buttons and the map stage into drag-only mode while a touch pointer is active so iPad browsers don't trigger selection or long-press callouts during card drops.
- Added touch-action failsafes so map highlighting and drop validation remain reliable across Safari's pointer events.

## 2025-11-19 – Truth threshold urgency tuning
- Routed truth high/low caps plus the economic goal into the AI planning view, penalizing idle IP stockpiles and escalating urgency within 15 points of a truth victory.
- Boosted media truth multipliers so conversion plays surface earlier in planning, with regression coverage enforcing the new behavior around 45–55 truth matches.

## 2025-11-18 – Continuity overtime protocol and sim hooks
- Added the Continuity Overtime Protocol as the top-priority victory condition so capped matches resolve via Truth momentum, territorial control, or resource edge instead of the deterministic coin flip.
- Threaded max-turn metadata and overtime configuration through the AI simulation harness, exposing new CLI knobs and logging the overtime method in batch reports.

## 2025-11-17 – Baseline AI mirror simulations
- Ran government-versus-truth mirror scrimmages with the enhanced strategist to document stalemates, territory snowballs, and deck homogeny in `docs/analysis/2025-11-17-ai-sim-log.md`.
- Captured raw telemetry in `docs/analysis/data/2025-11-17-ai-sim-baseline.json` for future tuning passes on pressure heuristics and truth pacing.

## 2025-11-16 – Agenda-aware opponent rotations
- Added agenda exposure counter-plans so the AI escalates into the player’s revealed objectives instead of repeating stale plays.
- Penalized repeated state targets during turn planning to keep territorial pressure rotating across match replays.

## 2025-11-15 – Surface opponent editor identity
- Updated the AI opponent HUD to show the active editor's name instead of generic handler titles in both desktop and mobile panels.
- Synced the opponent status card to share that editor label so players can cross-check difficulty context at a glance.

## 2025-11-14 – Editors react to state swings
- Routed editor banter through the state change logs so players hear from their editor when territories flip or fall back to neutral.
- Added mirrored "state lost" callouts for AI takeovers to mirror the existing capture chatter and keep newsfeeds lively.

## 2025-11-13 – Wire AI editor runtime hooks into MVP engine
- Bound the AI editor selection helper defensively at turn start, scaling income, attack costs, and MEDIA/ZONE payoffs by the active editor's modifiers.
- Ensured the MVP resolver respects editor difficulty scalars even when AI expansions are toggled lazily for older save data.

## 2025-11-12 – Calibrate AI editor roster data
- Added canonical editor profiles with difficulty tiers, personalities, and runtime modifiers so AI selection stays coherent.
- Introduced difficulty multipliers, recommendation helpers, image URL utilities, and banter loaders for every roster member.

## 2025-11-11 – Editors comment on plays and captures
- Introduced a banter engine with rate limits so player editors react to card plays, state flips, and match outcomes without flooding the log.
- Added a temporary console fallback while waiting on a dedicated toast surface for editor chatter.

## 2025-11-10 – Paranoid flavor realignment across pools
- Refreshed state pool, agenda issue, and hotspot flavor to emphasize conspiracy levers over food motifs and documented paranoia intents inline.
- Updated copy-driven fixtures to remove culinary phrasing and reflagged QR loyalty checks, maritime leaks, and dimensional portals.

## 2025-11-09 – Rebalance Extra Extra trio scoring
- Extra Extra now compares full trio impact totals (truth, IP, captures, damage) so a coordinated newsroom push can defeat a lone government haymaker.
- Deterministic tie breakers fall back to the existing truth-delta safeguards, keeping deadlocks aligned with the draw flow while preserving dispatch selection.

## 2025-11-08 – Separate hero dispatch from front page rotation
- Decouple the hero briefing from the dispatch carousel so the generated front page only features non-hero headlines while backfilling up to three supporting stories.
- Added regression coverage ensuring TabloidNewspaperV2 renders unique hero headlines against the dispatch list.
- Confirmed hero dispatch absences fall back to redacted copy instead of duplicating the main headline.

## 2025-10-08 – Truth main story subhead retuned
- Replaced the snack-quality aside in truth main stories with a reality-anchor status update to keep front page copy conspiratorially grounded.

## 2025-10-08 – Pressure-sensitive target rotation tuning
- Reweighted per-turn target penalties with pressure signal ownership and remaining defense so stacked zone plays hit the 0.22 ceiling after the first commitment.
- Ensured fallback plans and regression coverage record planned targets, keeping AI memory synced with queued repeats and documenting the tuning in the November 17 analysis log.

## 2025-10-08 – Opponent adapts economy and global memory
- Persisted the strategist’s target history between matches so repeated harassment of the same state now draws escalating rotation penalties.
- Added IP economy heuristics and contested-state bonuses so the AI banks resources when behind and presses momentum where the map is hottest.

## 2025-10-08 – Difficulty-aware AI editor binding
- Map AI difficulty settings to the new editor roster, falling back from legacy IDs and automatically selecting the correct partner at game start.
- Added runtime safety nets so MVP engines auto-bind an editor before applying difficulty-scaled modifiers.

## 2025-10-08 – Deck reshuffle safeguards at turn start
- MVP turn upkeep now shuffles the discard pile into a fresh deck whenever the draw step would otherwise stall, guaranteeing hands refill to five cards.
- Added debug logging and regression coverage to confirm reshuffles clear the discard and keep leftover cards in the new deck.

## 2025-10-08 – Established AI editor roster and banter stubs
- Replaced legacy editor prototypes with faction-aligned profiles including difficulty tiers, personalities, and runtime modifiers.
- Published shared difficulty multipliers, recommendation helpers, and banter bank loader typings to anchor AI selection.
- Stubbed banter JSONs plus image placeholders for every editor to keep future art hooks wired in.

## 2025-10-07 – Normalize AI state control audits
- Hardened the MVP resolver to strip duplicate control flags before auditing so AI rollouts never claim the same state as both factions.

## 2025-10-07 – Block context menus during map pans
- Right-click panning on the USA map now suppresses the browser context menu so conspirators can glide without interruptions.

## 2025-11-07 – Mouse-native map navigation
- Let agents zoom the USA map with the scroll wheel instead of hunting the UI buttons.
- Hold the right mouse button to drag and pan the conspiracy overlay like a proper blacksite analyst.

## 2025-11-06 – Restore fixed Newsroom Desk grid
- Remove the collapsible MinimizedHand overlay so the Newsroom Desk stays permanently expanded.
- Keep the original three-card row layout in the desk by leaning solely on the full-sized hand view.

## 2025-11-05 – Right-size board minis and retone played dock
- Board mini card frames now render at 45% scale to keep played-card layouts breathing and prevent clipping.
- Opponent slots lean into a blue halftone while the player stack stays red, with section headers picking up matching tones.

## 2025-11-04 – Align tooltip truth deltas with faction perspective
- USA map tooltips now flip truth gain/loss signage for government players across hotspot history, active bonuses, and anomaly logs.

## 2025-11-03 – Reset map tooltip state during redraws
- Clear pending tooltip timeouts and hovered state when the USA map SVG rebuilds so refreshed state data no longer leaves ghost tooltips hanging over the board.

## 2025-11-02 – Hue-shift the Truth Index feedback
- Progress bars now shift from red at 0% to deep indigo at 100%, clamping undefined inputs to the midpoint so every overlay broadcasts a clear heat reading.
- Tabloid Truth Index wrappers lean on a translucent white track to keep the new gradient legible against the broadsheet texture, with documentation for designers in the technical overview.

## 2025-11-01 – Mirror relic truth polarity by host faction
- Tabloid relic truth pulses now invert for government-controlled hosts while preserving clamp guards.
- Added round-start logging for the signed truth delta along with regression coverage for faction parity.

## 2025-10-31 – Guard editor effect descriptions
- Hardened the editor effect descriptor so dossiers without optional blocks no longer crash when summarizing start cards on the index page.
- Synced the expansion wrapper to pass through nullable configs, ensuring runtime callers never dereference missing effect data.

## 2025-10-30 – Fix desk editor summary crash
- Updated the campaign HUD’s editor summary to read bonuses, tradeoffs, and modifiers from the dossier configs so the start-card descriptors always receive a valid effect block.
- Surfaced modifier bullet points and preferred dossier quotes to keep the popover copy consistent after the data model shift.

## 2025-10-29 – Prevent minimalist dossiers from crashing setup
- Hardened the editor effect merger to clone default values when bonuses, tradeoffs, or modifiers are missing so start-card lookups stay safe.
- Normalized the setup adjustment helper and added regression coverage to ensure `initGame` proceeds cleanly when a dossier omits those blocks.

## 2025-10-28 – Stabilize editor start-card dossiers
- Patched the editor effect aggregation and setup adjustments to tolerate dossiers missing `startCards`, preventing crash loops
  when launching a run with minimalist government handlers.

## 2025-10-27 – Harden editor start-card dossiers
- Guarded the editor effect merger so dossiers without explicit start-card arrays no longer crash the run phase when ops flip
  between classified profiles.

## 2025-10-26 – Wire Desk Editors into MVP runtime
- Replaced the temporary editor roster with faction-specific dossiers in `src/data/editors.json`, updated the selector UI to
  filter by faction, surface quotes and tradeoffs, and persist the chosen editor via the hardened storage helpers.
- Patched the MVP engine and effect pipeline so editor bonuses now adjust turn income, attack costs, MEDIA truth swings, and
  ZONE pressure in live games, with new tests covering signature cases.

## 2025-10-25 – Restore broadsheet rarity badges
- Centralized the broadsheet rarity tone helper so achievement and card archives share the same palette without runtime errors.
- Confirmed the broadsheet card catalogue loads without the missing `getBroadsheetRarityTone` reference.

## 2025-10-24 – Dress the editor dossiers for assignment
- Restyled the editor selection flow as an opened case file—complete with photo placeholders—so players feel like they are
  thumbing through a classified suspect folder before launch.
- Recolored actions and dossier cards to lean into the Paranoid Times manila-folder aesthetic while keeping mechanics unchanged.

## 2025-10-07 – Stabilize USA map framing and zoom
- Locked the USA map stage to its full aspect ratio so viewport changes no longer squeeze the SVG or hide coasts mid-turn.
- Added zoom controls with a per-turn reset so operatives can inspect contested states up close without leaving the default view misaligned.

## 2025-10-07 – Move discard cost reminder into tooltip
- Removed the Newsroom Desk footer notice above the "Go to Press" button so the action bar stays focused on the turn control.
- Expanded the Discards hover tooltip to always include the free-first-discard reminder and added a no-queue message for clarity.

## 2025-10-07 – Safeguard zone pressure audits
- Stop ZONE cards from stacking pressure on states the acting player already controls so game-state audits no longer trip controlled-state invariants.
- Harden the broadsheet rarity helper with normalized inputs and a global fallback to silence missing-function errors in archive views.

## 2025-10-07 – Compose triple-card Extra Extra headlines
- Added a seeded triple-headline composer that braids the turn’s first three plays into a main story using combo rules, holiday buckets, and a generic fallback so every trigger prints a bespoke lead.
- Hooked turn resolution and the MVP simulator into the new pools, preserving truth-delta math while logging the composed template or combo for debugging.

## 2025-10-06 – Restore card collection scroll rigging
- Patched the broadsheet card collection overlay to import its shadcn scroll wrapper so the panel renders without tripping a `ScrollArea` reference error.
- Verified the catalogue view no longer blanks out when the government archivists unroll their dossiers mid-session.

## 2025-10-07 – Document Extra Extra win logic for players
- Expanded the How to Play briefing with a rundown of the Extra Extra showdown rules so operatives know how triple-card turns award Truth swings and headlines.
- Highlighted how the newsroom calculates winners, resolves ties, and pushes the Truth meter to keep players watching the paper between turns.

## 2025-10-06 – Rewire AI difficulties and editor bias
- Replaced the retired TOP_SECRET_PLUS tier with the new INSANE difficulty, updating presets, UI labels, and save normalization so the option flows stay coherent.
- Routed each editor profile’s combo and income bias scalars into the enhanced strategist and planner, letting targeting, income forecasts, and combo scoring honor newsroom tuning.

## 2025-10-23 – Track rival editors across campaigns
- Game state now persists separate player and AI editor assignments (plus AI banter cooldowns) so new runs and resume flows remember newsroom loadouts.
- Legacy saves hydrate with faction-aware AI editors—falling back to The Redactor on easy—to keep campaign starts consistent after the split.

## 2025-10-22 – Safeguard the evidence archive controls
- Split the evidence archive filter reset from the full archive wipe so players only delete entries when they deliberately hit the new clear-archive control.
- Styled the destructive action as a red-alert button in both classic and broadsheet layouts to telegraph its impact.

## 2025-10-06 – Float the discard toggle on card overlays
- Removed the orange queue discard button and replaced it with a floating trash icon anchored to the card edge for quicker access.
- Highlight the icon when a discard is queued so players see the state directly on the card art.

## 2025-10-21 – Tabloidize the Player Hub intel desks
- Finished broadsheet variants for tutorials, evidence, press archives, and the state intel board so every hub tab now reads like a Paranoid Times spread.
- Unified archive filters, badges, and ticker data to match the new typewriter-and-ink styling while preserving existing default layouts.

## 2025-10-20 – Plot the Player Hub tabloid takeover
- Drafted a broadsheet-style blueprint for re-skinning the Player Hub so every tab reads like a leaked Paranoid Times edition, complete with masthead shell, kicker/dek templates, and tab-specific print treatments.
- Outlined phased implementation tasks covering asset delivery, layout refactors, and atmospheric flourishes to guide art, frontend, audio, and QA contributors.

## 2025-10-19 – Harden relic runtime rehydration
- Sanitize tabloid relic runtime data before applying round effects so corrupted saves or old runtime payloads no longer crash when a new round starts.

## 2025-10-18 – Rig extra extra showdowns
- End-of-turn bulletins now spotlight the faction with the strongest triple-play, granting a faction-sensitive ±3% Truth swing and crowning their cards as the Extra Extra main story.
- Added deterministic tiebreakers and regression coverage so rival triple-plays resolve cleanly even when both sides flood the presses.

## 2025-10-17 – Sync real-world weather with tabloids
- Replaced the start screen weather badge with live, conspiratorial forecasts sourced from the player's location (with caching for repeat visits).
- Routed the end-of-turn newspaper weather column through the same live feed so evening editions echo the player's local conditions.

## 2025-10-16 – Synkroniser spilloppsett med MVP-loop
- Publiserte en bordklar gameplay-loop-guide med oppsett, modulvalg og sjekklister for MVP-reglene.
- Fremhevet sammenhengen mellom catch-up/maintenance-modulene og standard tursekvens slik at digitale prototyper speiler bordspillet.

## 2025-10-16 – Synchronize newspaper narrative systems
- Routed the tabloid issue generator and front page widget through a shared newspaper dataset and prefetched story payload so copy stays consistent without duplicate fetches.
- Enriched fallback hero stories with captured states, truth swings, and combo highlights, and extended article metadata with optional lore hooks for future writers.

## 2025-10-15 – Align lore ops with conspiratorial canon
- Publish a Paranoid Times world lore quickstart, card template, and anomaly naming guide to harmonize future writing sprints.
- Enforce tone-safe lint rules and introduce a lore cross-linking prototype so non-diegetic jokes and continuity gaps surface fast.

## 2025-10-14 – Restore paranormal sighting flavor pools
- Reintroduce missing tagline templates for synergy, broadcast, cryptid, and hotspot events so sightings no longer crash.
- Wire templates into the index page with a resilient filler to keep paranormal notifications descriptive.

## 2025-10-13 – Stabilize AI triple-play headlines
- Allow the Extra! Extra! generator and final edition builder to emit deterministic `[WIRE DELAY]` placeholders when news pools are still loading.
- Kick off news pool loading from the game state hook and add regression coverage so three-card turns no longer crash while assets hydrate.

## 2025-10-12 – Harden press archive persistence
- Switch the press archive hook to the safe storage helpers so localStorage errors no longer crash the hub.
- Add regression coverage that verifies the archive stays empty when storage access fails.

## 2025-10-11 – Stabilize AI turn wrap-up
- Keep the AI turn progress flag active until the scheduled hand-off completes so the planner no longer loops.
- Add regression coverage to confirm control returns to the player after the wrap-up timeout resolves.

## 2025-10-10 – Harden press archive imports
- Normalize archived victory reports to ensure legendary deployments always load as arrays and avoid Player Hub crashes when old saves are opened.
- Guard Player Hub archive and final edition readers against malformed legendary data so future saves remain resilient.

## 2025-10-09 – Reprioritize front page coverage
- Teach the newspaper issue generator to spotlight captured states, major truth swings, and rotating highlights on the dispatch archive.
- Keep hero articles in sync with the front-page package so combo main stories continue to render correctly.

## 2025-10-08 – Gate Extra Extra coverage behind triple plays
- Removed the standing “Extra Extra Dispatch” column from the turn newspaper so the bonus headline only appears when a faction actually lands three plays.
- Hid the final edition bulletin module whenever no triple-play articles were filed to avoid implying a bonus that never triggered.

## 2025-10-08 – Diversify generated card articles
- Expand card article generator pools with new tag-aware headlines, subheads, and body segments to reduce repetition.
- Compose longer faction articles by layering tag-specific follow-ups, escalations, and closers for each card.

## 2025-10-08 – Enable touch-friendly card deployment
- Added pointer-aware drag-and-drop controls to the newsroom desk so tablet operatives can sling cards directly onto the U.S. map.
- Highlighted valid state targets, previewed the lifted card in-flight, and surfaced error toasts when drops hit protected territory.

## 2025-10-07 – Chronicle agenda signals in hub
- Route the live agenda moment feed into the Player Hub overlay and surface a chronological timeline of stages and outcomes.
- Add status filters, timeline styling, and empty-state messaging to help players review agenda advances, setbacks, and completions at a glance.

## 2025-10-06 – Stabilize Extra Extra truth swings
- Ensure the Extra Extra truth adjustment looks at the active UI factions when legacy MVP player data is missing so post-turn articles no longer crash.
- Fall back to the player's faction to decide which side gains or loses truth when bulletins trigger without engine player metadata.

## 2025-10-06 – Harden turn newspaper handoff
- Sanitize end-of-turn played card logs before printing so corrupted save data no longer crashes the Resolve-phase newspaper reveal.
- Add regression coverage that verifies malformed records are ignored while valid cards still headline the post-turn bulletin.

## 2025-10-06 – Surface agenda history in player hub
- Add an agendas tab to the Player Hub that highlights the current secret agenda when enabled.
- Surface completed agendas with descriptions, issue themes, and difficulty badges for quick review.

## 2025-10-06 – Newsroom discard tooltip
- Replace the Newsroom Desk IP label with a discard counter that surfaces queued cards and IP impact via tooltip.
- Move the discard cost breakdown into the tooltip and leave the footer with the free-first-discard reminder when the queue is empty.

## 2025-10-06 – Delay final editions until news pools load
- Load news article pools on app startup to prevent empty or stale final editions when the archives are still initializing.
- Skip composing the final newspaper until pool data is ready and clear the preview to avoid stale spreads during loading.

## 2025-10-05 – Bundle offline US topo data
- Package the United States state topology with the client so the Player Hub map renders without network access.
- Update the map view to prioritise bundled geometry, retain legacy fallbacks for metadata-free saves, and cover the offline path with tests.

## 2025-10-05 – Harden AI turn recovery
- Reset the AI turn progress flag when planning fails so the player immediately regains control.
- Invoke a safe end-turn fallback if the AI remains the active player after an error to avoid stalled sessions.

## 2025-10-05 – Harden card collection fallbacks
- Guard the card collection search filters against missing descriptions so textless cards no longer crash the overlay.
- Show a friendly placeholder description when a discovered card lacks rules text and cover it with regression tests.

## 2025-10-05 – Rotate tabloid relic triggers
- Teach the Tabloid Relic engine to rotate between matching rules so consecutive issues queue different relics when possible.
- Persist selection history and surface rotation logs to keep relic selection balanced across rounds.

## 2025-10-05 – Modularize truth strike reporting
- Swap the truth-faction attack and media body banks for modular templates with dynamic motives, settings, and reactions to reduce repetition.
- Teach the newspaper composer to render templated story segments alongside legacy string entries.

## 2025-10-05 – Surface extra bulletins in final editions
- Retire the in-play Extra Extra strip so the primary board regains vertical space during matches.
- Feed archived bulletin articles into the final edition builder and render them in the victory newspaper spread with fallback copy.

## 2025-10-05 – Rebuild Paranoid Times article bank
- Replace the templated article dump with bespoke Truth and Government stories for every card across core sets and expansions.
- Switch article metadata to the `faction` field and normalise legacy values inside the loader so the UI matches card factions.
- Add a scripted generator to keep the article JSON in sync with card data and populate tags plus image prompts.

## 2025-10-05 – Lower IP victory threshold to 200
- Drop the economic victory target from 300 IP to 200 across rules, tutorial copy, and in-game HUD messaging.
- Update the IP victory condition logic, onboarding flows, and documentation so both factions now race to 200 IP.

## 2025-10-05 – Launch Extra Feed and final overlay refresh
- Replace the legacy victory screen with a final edition overlay that pairs the campaign recap with a live-generated newspaper spread.
- Surface turn-driven Extra Extra bulletins beside the main board using full `ArticleBlock` data instead of strings.
- Persist structured extra feed entries across engines and saves so weather, ads, and bullet lists render consistently.

## 2025-10-05 – Sync victory overlays with final editions
- Persist MVP win checks into the game state so victory screens know the winner and trigger type automatically.
- Build final newspaper reports through the shared helper and surface them via the victory overlay and extra edition reader.

## 2025-10-05 – Summarize turn headlines and extras
- Record per-turn highlights for both MVP engine and the main hook so news systems can consume consistent `PlayedLite` buffers.
- Generate turn headline summaries and trigger Extra Extra bulletins after three plays to populate `headlineLog` and `extraExtraFeed`.

## 2025-10-05 – Expand game state tracking buffers
- Add headline, extra edition, and turn buffer placeholders to both MVP and main game state models so upcoming newspaper flows
  can read consistent structures.
- Ensure clones, reducers, and initializers keep the new arrays in sync and persist them through saves.

## 2025-10-05 – Unify newspaper data pools
- Move the public newspaper dataset to the new root location and expose shared pool loading helpers so newspaper generators can read the expanded copy deck consistently.

## 2025-10-05 – Guard difficulty storage access
- Use the safe localStorage helpers for difficulty reads and writes so blocked storage falls back to the NORMAL difficulty without crashing callers.

## 2025-10-05 – Harden options storage reads
- Use the safe localStorage helper when loading saved options so the game falls back to defaults when storage is unavailable.

## 2025-10-05 – Harden tutorial progress storage
- Ensure the tutorial manager uses safe localStorage helpers so blocked storage falls back to in-memory defaults without breaking onboarding.
- Wrap tutorial reset logic in guards so clearing progress never crashes when storage access fails.

## 2025-10-05 – Harden onboarding storage writes
- Use the safe localStorage setter for onboarding completion and skip flags so the tutorial still dismisses when storage access is blocked and logs a warning when persistence fails.

## 2025-10-05 – Index onboarding storage safeguards
- Use the safe storage helpers for faction selection, IP tracking, and onboarding checks so the intro flow still works when localStorage is blocked.

## 2025-10-05 – Weather badge storage safety
- Use the safe localStorage helper for the start screen weather badge so blocked storage no longer breaks the intro UI.

## 2025-10-05 – Stabilize discard toggling during menus
- Move the discard hook and related gating logic before intro/menu early returns so switching between intro and menu no longer triggers React hook order errors.

## 2025-10-05 – Harden local storage fallbacks
- Guard settings and faction persistence against blocked storage so new games keep default options without crashing.
- Add helper coverage to verify localStorage failures resolve safely.

## 2025-10-05 – Safeguard AI zone plays without targets
- Prevent the AI from resolving zone cards that lack a valid target state and add regression coverage to keep turns flowing.

## 2025-10-05 – Planned discard feature
- Track the upcoming discard mechanic update so we remember to document its implementation details when the feature ships.
## 2024-06-15 – Deterministic composite headlines seed Extra Extra feed
- Timestamp: 2024-06-15T00:00:00Z
- Files:
  - `src/hooks/gameStateTypes.ts`
  - `src/hooks/useGameState.ts`
  - `src/hooks/comboAdapter.ts`
  - `src/mvp/engine.ts`
  - `src/mvp/validator.ts`
  - `src/data/enhancedAIStrategy.ts`
  - `src/news/finalizeEdition.ts`
  - `src/news/types.ts`
  - `src/types/news.ts`
  - `src/components/game/TabloidNewspaperV2.tsx`
  - `src/components/game/TabloidNewspaperLegacy.tsx`
  - `src/utils/compositeStory.ts`
  - `src/news/composeTurn.ts`
  - `__tests__/integration/extraExtra.test.ts`
  - `__tests__/integration/gameplayScreen.test.tsx`
  - `__tests__/news/compositeStorySeed.test.ts`
  - `__tests__/utils/finalEdition.test.ts`
  - `UPDATES_LOG.md`
- Summary: Replaced the old turn headline generator with seeded composite stories, pushed discriminated Extra Extra entries for composite, article, and bulletin updates, refit MVP validators and analytics to the new types, and refreshed integration coverage to confirm deterministic story seeding at end of turn.

