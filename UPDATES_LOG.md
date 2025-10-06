# Updates Log

This document provides a chronological record of gameplay-impacting changes merged into State Shift Strategy. Each entry should include the merge date and a brief, human-readable summary so future contributors can quickly understand how the game has evolved.

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

## 2025-10-08 – Diversify generated card articles
- Expand card article generator pools with new tag-aware headlines, subheads, and body segments to reduce repetition.
- Compose longer faction articles by layering tag-specific follow-ups, escalations, and closers for each card.

## 2025-10-07 – Chronicle agenda signals in hub
- Route the live agenda moment feed into the Player Hub overlay and surface a chronological timeline of stages and outcomes.
- Add status filters, timeline styling, and empty-state messaging to help players review agenda advances, setbacks, and completions at a glance.

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
