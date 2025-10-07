# Updates Log

This document provides a chronological record of gameplay-impacting changes merged into State Shift Strategy. Each entry should include the merge date and a brief, human-readable summary so future contributors can quickly understand how the game has evolved.

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

## 2025-10-08 – Diversify generated card articles
- Expand card article generator pools with new tag-aware headlines, subheads, and body segments to reduce repetition.
- Compose longer faction articles by layering tag-specific follow-ups, escalations, and closers for each card.

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
