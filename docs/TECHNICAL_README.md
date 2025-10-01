# Paranoid Times Technical Overview

## Table of contents
- [Game loop fundamentals](#game-loop-fundamentals)
- [MVP card schema](#mvp-card-schema)
- [State map and territorial control](#state-map-and-territorial-control)
- [Combo engine integration](#combo-engine-integration)
- [Card data normalization pipeline](#card-data-normalization-pipeline)
- [Audio systems](#audio-systems)
- [Campaign arc progress telemetry](#campaign-arc-progress-telemetry)
- [Secret agenda cookbook grid](#secret-agenda-cookbook-grid)

## Game loop fundamentals
The MVP design defines a duel between the Truth Seekers and the Government, each managing Influence Points (IP), a shared Truth meter, and pressure on individual U.S. states. Win conditions include controlling 10 states, pushing Truth to faction-specific thresholds, or accumulating 300 IP.【F:DESIGN_DOC_MVP.md†L7-L63】 These core concepts are implemented directly in the runtime engine:

- **Turn start:** `startTurn` clones game state, uses `computeTurnIpIncome` to award `5 + controlledStates` IP, applies reserve maintenance, evaluates the swing-tax/catch-up module, logs every adjustment, and refills the active player's hand to five cards.【F:src/mvp/engine.ts†L50-L114】
- **Card play gating:** `canPlay` enforces the three-card-per-turn limit, IP costs, and ZONE targeting rules before a card resolves.【F:src/mvp/engine.ts†L71-L99】
- **Playing a card:** `playCard` removes the card from hand, deducts IP, logs the play, and calls `resolve` to apply effects.【F:src/mvp/engine.ts†L101-L215】
- **Effect resolution:** `resolve` relies on `applyEffectsMvp` to adjust IP, Truth, and pressure while tracking capture metadata for end-of-turn summaries.【F:src/mvp/engine.ts†L157-L215】【F:src/engine/applyEffects-mvp.ts†L53-L157】
- **Turn end:** Discards are processed with the “first one free, extras cost 1 IP each” rule, combo hooks are evaluated, logs are appended, and control passes to the other player.【F:src/mvp/engine.ts†L217-L348】
- **Victory checks:** `winCheck` confirms state, Truth, and IP victory thresholds after every turn wrap-up, matching the MVP specification but using 95%/5% Truth buffers for runtime tuning.【F:src/mvp/engine.ts†L367-L395】【F:DESIGN_DOC_MVP.md†L55-L63】

### Campaign event manager and state bonuses
The runtime promotes story arcs and state-themed bonuses during the same end-of-round bookkeeping. When a campaign event fires, `updateCampaignArcProgress` copies the existing `activeCampaignArcs`, marks the matching arc as active or completed based on the event’s `resolution`, queues the next chapter by seeding `pendingArcEvents`, and emits a 📖 log entry for the Extra Edition.【F:src/hooks/useGameState.ts†L204-L290】 Both lists live directly on the game state, so new sessions start with empty `activeCampaignArcs`/`pendingArcEvents` arrays and persist them in saves until the finale event clears the queue.【F:src/hooks/useGameState.ts†L1320-L1494】【F:src/hooks/useGameState.ts†L3152-L3154】 The event manager then pulls from `pendingArcEvents` before sampling random tabloids, guaranteeing that forced chapters override RNG once they are unlocked.【F:src/hooks/useGameState.ts†L293-L320】

State-themed bonuses use the same round gate. Each new round re-seeds the deterministic `stateRoundSeed`, builds a snapshot of existing bonuses, and only re-rolls assignments if the round counter has advanced.【F:src/hooks/useGameState.ts†L1483-L1494】【F:src/hooks/useGameState.ts†L2598-L2635】 `assignStateBonuses` hashes the base seed with the round number, reuses any `existingBonuses` for stability, and otherwise drafts weighted effects and anomaly events from each state’s themed pool while recording pressure/IP/Truth adjustments for the owning faction.【F:src/game/stateBonuses.ts†L63-L120】【F:src/game/stateBonuses.ts†L214-L284】 Finally, `applyStateBonusAssignmentToState` fans those results back into `GameState`: it extends the turn log, applies Truth/IP adjustments, updates per-state pressure and anomaly feeds, stamps `lastStateBonusRound`, and pipes any newspaper-ready events into the edition queue for UI consumption.【F:src/hooks/stateBonusAssignment.ts†L1-L83】 Debug hooks expose the seeded rolls in development builds so designers can verify reproducible outcomes across sessions.【F:src/hooks/useGameState.ts†L2624-L2632】

### Catch-up swing math
`computeTurnIpIncome` now layers a swing-tax/catch-up module on top of the existing reserve maintenance. The routine compares the active player's reserves and state holdings to their opponent and scores two separate gaps: IP and controlled states. Full steps beyond the grace windows generate modifiers according to the piecewise formula

```
swingTax   = clamp₀⁴( floor(max(Δip - 10, 0) / 5) + max(Δstates - 1, 0) )
catchUp    = clamp₀⁴( floor(max(-Δip - 10, 0) / 5) + max(-Δstates - 1, 0) )
netIncome  = max(0, 5 + controlledStates - swingTax + catchUp)
```

where `Δip = playerIp - opponentIp` and `Δstates = playerStates - opponentStates`. This keeps small leads untouched, taxes runaway economies by up to 4 IP per turn, and grants the same ceiling as a comeback bonus when significantly behind.【F:src/mvp/engine.ts†L56-L207】

#### FAQ: Why did my income swing this turn?
- **You were ahead:** A positive `Δip` or `Δstates` beyond the grace windows triggers a swing tax. The log entry spells out the lead size so the reason is transparent.【F:src/mvp/engine.ts†L213-L272】
- **You were behind:** Large deficits flip the same magnitude into a catch-up bonus, letting the underdog earn up to +4 IP until parity is restored.【F:src/mvp/engine.ts†L213-L272】

## MVP card schema
MVP cards belong to the Truth or Government factions and are typed as ATTACK, MEDIA, or ZONE with rarities from common to legendary. The baseline design restricts each type to a concise whitelist of effect keys and ties costs to a rarity table.【F:DESIGN_DOC_MVP.md†L25-L178】【F:src/rules/mvp.ts†L1-L60】 The runtime validator codifies the schema:

- **Effects:** `EffectsATTACK`, `EffectsMEDIA`, and `EffectsZONE` narrow MVP cards to the permitted keys (`ipDelta.opponent` plus optional `discardOpponent`, `truthDelta`, or `pressureDelta`).【F:src/mvp/validator.ts†L5-L22】
- **Normalization:** `repairToMVP` coerces faction/type casing, fills missing IDs and names, clamps numeric ranges, adds default ZONE targets, and generates standard rules text while recording change logs.【F:src/mvp/validator.ts†L324-L395】
- **Validation:** `validateCardMVP` enforces factions, types, rarities, baseline costs, and per-type effect constraints before a card is accepted into decks.【F:src/mvp/validator.ts†L398-L458】
- **Runtime resolution:** `applyEffectsMvp` translates the sanitized card into gameplay effects—deducting IP and forcing discards for ATTACKs, adjusting the shared Truth meter for MEDIA, or adding pressure and checking captures for ZONE cards.【F:src/engine/applyEffects-mvp.ts†L53-L155】

### Cost baseline
`MVP_COST_TABLE` ties each type/rarity pair to a canonical IP cost. `expectedCost` is shared by the validator and database loader so card definitions that drift from the baseline are corrected automatically.【F:src/rules/mvp.ts†L48-L60】【F:src/mvp/validator.ts†L363-L393】

## State map and territorial control
`src/data/usaStates.ts` enumerates every state with base IP income, defense ratings, and thematic bonuses, plus helpers for lookups and occupation labels. These values populate the `stateDefense` map that ZONE cards challenge and govern income bonuses when `startTurn` tallies controlled states.【F:src/data/usaStates.ts†L1-L178】【F:src/mvp/engine.ts†L52-L58】 Helper utilities such as `buildOccupierLabel` and `setStateOccupation` standardize capture messaging, ensuring UI layers can display faction-flavored control markers.【F:src/data/usaStates.ts†L115-L169】

### Hotspot lifecycle and map VFX
Hotspots originate from end-of-turn tabloids and immediately mark their host state as contested: defense rises, the Truth reward is logged, and the UI posts a “resolve me” badge. While a hotspot is active, the Enhanced USA Map watches for three inputs:

1. **Activation pulse** – the first frame after a hotspot spawns pings `CardAnimationLayer`, which queues the paranormal “flying saucer” sprite to traverse the targeted state. With full effects enabled, the UFO animates across the board and leaves a neon vapor trail; reduced-motion mode swaps this for a single-frame overlay and audio ping so photosensitive players still receive clear notice without camera movement.
2. **State glow** – the owning map tile flips to a green phosphorescent outline as long as the hotspot flag is set. This glow persists for both animation profiles; in reduced-motion mode the glow fades in instantly instead of pulsing.
3. **Resolution reset** – when either faction clears the hotspot, the glow, animation queues, and boosted defense are torn down, and the state reverts to its regular control palette. The animation stack also emits a final “resolved” flash (again single-frame in reduced-motion mode) to confirm the payout.

These hooks let designers adjust paranormal pacing without rewriting the map: the lifecycle is just `spawn → animate → glow → resolve`, with each phase mirrored by a low-motion equivalent so accessibility settings never hide critical information.

## Combo engine integration
After discards resolve, `endTurn` invokes `evaluateCombos` to detect synergies, logs any triggered definitions, applies rewards (e.g., extra IP) through `applyComboRewards`, and optionally fires VFX callbacks controlled by `ComboOptions`. The resulting `ComboSummary` is surfaced in the turn log for UI consumption.【F:src/mvp/engine.ts†L289-L333】 Components such as the main game page respond to these events with particle effects and SFX when a combo grants bonus resources.【F:src/pages/Index.tsx†L508-L544】

### State combination bonuses
The state-combination manager aggregates multiple passive bonuses in addition to each combo’s printed IP stipend. Economic powerhouses now deliver flat IP surges (`Wall Street Empire` adds +2 IP each turn), while energy and border cartels scale income per controlled or neutral territory.【F:src/data/stateCombinations.ts†L225-L288】 Military synergies extend beyond IP: `Military Triangle` injects +1 IP damage into every player ATTACK card, `Nuclear Triad` grants +1 defense to every player-held state, and `Midwest Backbone` trims 1 pressure from each AI ZONE strike against liberated regions.【F:src/data/stateCombinations.ts†L225-L340】【F:src/systems/cardResolution.ts†L230-L330】 The UI surfaces the running totals so players can see their media cost discounts, extra draws, flat IP income, and defensive perks at a glance.【F:src/components/game/StateCombinationsPanel.tsx†L13-L116】

## Card data normalization pipeline
The card database wraps multiple sources behind `CARD_DATABASE`, loading fallback MVP cards immediately, attempting to import the core set asynchronously, and merging extension packs. Every card flows through `repairToMVP` and `validateCardMVP` during ingestion so gameplay always operates on sanitized MVP-compliant records. Normalization warnings and cost adjustments are logged in development builds for quick author feedback.【F:src/data/cardDatabase.ts†L1-L200】 Extension authors can rely on this pipeline to auto-correct casing, default targets, and baseline costs without hand-tuning individual files.

## Audio systems
The `useAudio` hook centralizes music playlists, SFX loading, and playback APIs. It loads thematic track lists for the start menu, faction selection, in-game loops, and end credits, while registering a library of sound keys for UI and event feedback.【F:src/hooks/useAudio.ts†L171-L268】 Notable integration points include:

- **Menu and UI actions:** Start screen buttons and game menus trigger the shared `click` key, while hover states reuse the quieter `lightClick` variant to avoid audio fatigue.【F:src/components/start/StartScreen.tsx†L59-L108】【F:src/components/game/EnhancedUSAMap.tsx†L237-L263】
- **Gameplay feedback:** The main game page plays `cardPlay`, `flash`, `turnEnd`, `cardDraw`, `newspaper`, `state-capture`, `hover`, and `error` cues during card deployment, Truth surges, turn transitions, and targeting workflows.【F:src/pages/Index.tsx†L919-L1025】【F:src/pages/Index.tsx†L520-L544】
- **Advanced effects:** `CardAnimationLayer` triggers paranormal SFX (`ufo-elvis`, `cryptid-rumble`) when optional overlays fire, and `TabloidNewspaperV2` plays `radio-static` when fresh sightings enter the log.【F:src/components/game/CardAnimationLayer.tsx†L128-L177】【F:src/components/game/TabloidNewspaperV2.tsx†L310-L336】

### SFX inventory and coverage
| Keys | Asset | Usage |
| --- | --- | --- |
| `cardPlay`, `flash` | `/audio/card-play.mp3` | Fired when a card deploys or a Truth flash resolves, pairing the shared asset with visual effects on the main game board.【F:src/hooks/useAudio.ts†L406-L418】【F:src/pages/Index.tsx†L1694-L1745】 |
| `cardDraw`, `turnEnd` | `/audio/card-draw.mp3`, `/audio/turn-end.mp3` | Wrap up turns by pinging the end-turn button and the delayed card draw cue in sequence.【F:src/hooks/useAudio.ts†L406-L413】【F:src/pages/Index.tsx†L1424-L1431】 |
| `stateCapture` / `state-capture` | `/audio/state-capture.mp3` | Registered as `stateCapture` in the loader but invoked from combo logic as `'state-capture'` to celebrate new synergies with an animated capture flare.【F:src/hooks/useAudio.ts†L406-L414】【F:src/pages/Index.tsx†L900-L907】 |
| `newspaper` | `/audio/newspaper.mp3` | Plays when the player closes or archives the in-game tabloid to emphasize the paper shuffling animation.【F:src/hooks/useAudio.ts†L406-L413】【F:src/pages/Index.tsx†L1766-L1769】 |
| `hover`, `lightClick`, `click` | `/audio/hover.mp3`, `/audio/click.mp3` | Provides low-volume hover feedback on the map and card grid while reusing the stronger click for selections and surveillance overlays.【F:src/hooks/useAudio.ts†L415-L419】【F:src/components/game/EnhancedUSAMap.tsx†L302-L320】【F:src/components/game/EnhancedGameHand.tsx†L182-L211】【F:src/components/game/CardAnimationLayer.tsx†L299-L315】 |
| `error` | `/audio/click.mp3` (fallback) | Signals invalid targets, unaffordable plays, and other rule violations during card handling.【F:src/hooks/useAudio.ts†L418-L419】【F:src/pages/Index.tsx†L1561-L1566】【F:src/pages/Index.tsx†L1600-L1605】 |
| `typewriter` | `/audio/typewriter.mp3` | Reserved for dossier-style overlays triggered by the animation layer’s typewriter reveal events.【F:src/hooks/useAudio.ts†L417-L418】【F:src/components/game/CardAnimationLayer.tsx†L325-L335】 |
| `victory`, `defeat` | `/audio/victory.mp3`, `/audio/defeat.mp3` | Preloaded stingers that the endgame modal can trigger once victory and defeat flows ship.【F:src/hooks/useAudio.ts†L412-L414】 |
| `ufo-elvis`, `cryptid-rumble`, `radio-static` | Procedurally generated cues | Paranormal overlays request these clips for broadcasts, cryptid sightings, and static interference across the board and the newspaper feed.【F:src/hooks/useAudio.ts†L420-L423】【F:src/components/game/CardAnimationLayer.tsx†L214-L354】【F:src/components/game/TabloidNewspaperV2.tsx†L300-L315】 |

The loader currently falls back to placeholder audio for `ufo-elvis`, `cryptid-rumble`, and `radio-static`, so contributors should source royalty-free replacements—e.g., UFO ambience, low-frequency rumble, and shortwave static—from providers listed in the audio README, ensure MP3 format under the recommended size limits, and drop them into `public/audio/` with filenames that match the SFX keys. Update `existingSfxFiles` if the final filenames differ and verify licensing records per the project’s royalty-free guidance.【F:src/hooks/useAudio.ts†L406-L423】【F:public/audio/README.md†L1-L28】【F:public/audio/README.md†L30-L36】

Music playback is orchestrated through stateful helpers (`setMenuMusic`, `setFactionMusic`, `setGameplayMusic`, `setEndCreditsMusic`) so UI layers can switch playlists without reinitializing the hook.【F:src/hooks/useAudio.ts†L320-L420】 Future contributors should call these helpers instead of manipulating HTMLAudioElements directly to keep crossfade and unlock logic intact.

## Campaign arc progress telemetry
`TabloidNewspaperV2` now groups every campaign storyline into `CampaignArcGroup` buckets as it assembles the nightly paper. Each group tracks the latest unlocked chapter, total chapter count, resolution status (active, cliffhanger, or finale), a progress bar percentage, and a generated status tagline derived from the most recent story beats.【F:src/components/game/TabloidNewspaperV2.tsx†L783-L865】 Those groups are distilled into lightweight `ArcProgressSummary` objects that capture the active chapter metadata and the top arc-aligned headlines. Whenever the overlay resolves a fresh batch of summaries it calls the optional `onArcProgress` callback so downstream systems can persist arc telemetry outside of the newspaper UI.【F:src/components/game/TabloidNewspaperV2.tsx†L824-L873】

`Index.tsx` subscribes to that callback with `handleArcProgress`, merging each payload into a stateful cache keyed by `arcId` so progress persists across multiple newspaper issues and into the post-game flow.【F:src/pages/Index.tsx†L691-L750】 When a match ends, the same file folds the cached summaries into `summarizeEventForFinalEdition`, which tags each high-impact event highlight with the matching arc snapshot if the headline advanced the same chapter that emitted the summary.【F:src/pages/Index.tsx†L269-L309】 This keeps the final edition report aware of how a given play moved its broader storyline.

`FinalEditionLayout` renders those annotated highlights in the Key Events panel. If an event includes `arcSummary` data, the panel adds chapter counters, finale/cliffhanger badges, a progress bar, the generated tagline, and the first few arc headlines so the endgame recap shows exactly how the campaign arc evolved.【F:src/components/game/FinalEditionLayout.tsx†L165-L229】 Future contributors who need real-time arc progress can tap the `onArcProgress` emission on the newspaper overlay, while post-game dashboards can reuse the cached summaries exposed alongside event highlights to surface chapter status, completion percentage, and narrative flavor text.

## Toast notification catalog
The UI surfaces a consistent set of toast banners to reinforce player feedback. The table below maps each emitting module to its messages and why they appear.

| Module | Messages | Purpose |
| --- | --- | --- |
| State event feed | <ul><li>`🗞️ BREAKING: ${event.title}`</li></ul> | Announces tabloid headlines whenever a state event is triggered by territory swings.【F:src/hooks/useStateEvents.ts†L31-L47】 |
| Achievement lifecycle | <ul><li>`🏆 Achievement Unlocked!`</li><li>`Import Successful`</li><li>`Import Failed`</li><li>`Progress Reset`</li></ul> | Celebrates new achievements and reports import/export outcomes inside the provider that manages persistent stats.【F:src/contexts/AchievementContext.tsx†L58-L140】 |
| Achievement control panel | <ul><li>`Progress Exported`</li><li>`Import Failed`</li></ul> | Confirms manual exports and flags invalid files from the achievements dashboard overlay.【F:src/components/game/AchievementPanel.tsx†L94-L118】 |
| Hand interactions | <ul><li>`❌ Insufficient IP`</li><li>`❌ Deployment Failed`</li></ul> | Blocks unaffordable cards and warns about interrupted deployments when playing from the enhanced hand UI.【F:src/components/game/EnhancedGameHand.tsx†L52-L78】 |
| USA map targeting | <ul><li>`❌ Invalid Target`</li></ul> | Reminds players that they cannot aim zone cards at states they already control when clicking on the map.【F:src/components/game/EnhancedUSAMap.tsx†L302-L318】 |
| Archive & synergy updates | <ul><li>`Edition already in archive`</li><li>`Final newspaper archived to Player Hub`</li><li>`🔗 Synergy Activated: … (+IP)`</li></ul> | Handles press archive deduplication and highlights bonus IP when new state combinations form on the main board.【F:src/pages/Index.tsx†L612-L908】 |
| Fullscreen controls | <ul><li>`Fullskjerm støttes ikke i denne nettleseren`</li><li>`Fullskjerm aktivert!`</li><li>`Fullskjerm deaktivert`</li><li>`Fullskjerm ble blokkert av nettleseren…`</li><li>`Kunne ikke bytte fullskjerm-modus`</li><li>`Kunne ikke aktivere fullskjerm automatisk`</li></ul> | Covers every manual and automatic fullscreen toggle outcome so players know why the mode changed or failed.【F:src/pages/Index.tsx†L1390-L1542】 |
| Card gating & targeting | <ul><li>`🚫 Cannot target your own states with zone cards!`</li><li>`🎯 Targeting …! Deploying zone card...`</li><li>`💰 Insufficient IP! Need …`</li><li>`📋 Maximum 3 cards per turn!`</li><li>`🎯 Zone card selected - click a state to target it!`</li><li>`🎯 Select a valid state target before deploying this zone card!`</li></ul> | Guides the targeting workflow, enforcing cost and turn limits while steering players toward valid zone card selections.【F:src/pages/Index.tsx†L1545-L1687】 |
| Card resolution results | <ul><li>`✅ ${card.name} deployed successfully!`</li><li>`❌ Card deployment failed!`</li></ul> | Summarizes the outcome of each play once animation completes or throws, mirroring the audio cues.【F:src/pages/Index.tsx†L1694-L1755】 |
| Contextual guidance | <ul><li>Dynamic suggestions from `ContextualHelp`</li></ul> | Surfaces turn-by-turn hints from the contextual helper when the player requests assistance.【F:src/pages/Index.tsx†L2443-L2454】 |
| Tutorial overlay | <ul><li>`Tutorial Started`</li><li>`Tutorial Unavailable`</li></ul> | Signals which tutorial sequence just launched or why the request was rejected from the training vault UI.【F:src/components/game/TutorialOverlay.tsx†L39-L55】 |

## Secret agenda cookbook grid
The secret agenda database now leans into the “Paranoid Times” tabloid-cookbook tone. Each faction’s entries pair a pulp trope with concrete telemetry pulled from `GameState` snapshots, ensuring the themed goals remain trackable by AI and UI layers alike.

### Truth Seekers menu
| Agenda | Theme hook | Progress trigger |
| --- | --- | --- |
| Bat Boy’s Brunch Brigade | Bat Boy sightings go brunch-core | Counts Appalachian control via `controlledStates` to confirm WV/KY/TN/PA brunch venues. |
| Moonbeam Marmalade Slow-Cook | Lunar jam session | Reads `truthAbove80Streak` / `timeBasedGoalCounters` to require three glowing turns. |
| UFO Retrieval Mise en Place | Crash-site mise en place | Filters `factionPlayHistory` for ZONE plays targeting desert crash states (NV/NM/AZ/UT). |
| Tabloid Taste Test Kitchen | Recipe-column media blitz | Tallies MEDIA cards from `factionPlayHistory` to model serialized taste tests. |
| Cryptid Potluck Planning | Monster potluck RSVPs | Uses `controlledStates` to corral cryptid-haunted states like WA/OR/WV/NJ/MT/NH. |
| Abduction Bake-Off | Levitation soufflé contest | Aggregates captured states reported in `factionPlayHistory.capturedStates`. |
| Cosmic Conserve Drive | Nebula jam fundraiser | Sums positive `truthDelta` values from `factionPlayHistory` to bottle 25% Truth. |

### Government test kitchen
| Agenda | Theme hook | Progress trigger |
| --- | --- | --- |
| Capitol Cafeteria Stew | Beltway cafeteria chow | Requires `controlledStates` coverage of DC/VA/MD/CO ladles. |
| Field-Ration Redactions | Press-release seasoning | Counts MEDIA plays from `factionPlayHistory` to keep the placemats censored. |
| Supply Chain Soup | Heartland ration routing | Monitors agricultural depot control (IA/NE/KS/MO/OK/AR) via `controlledStates`. |
| UFO Recall Paperwork | Crash-site compliance | Uses `capturedStates` extracted from `factionPlayHistory` to confirm confiscations in NV/NM/AZ/UT. |
| Cover-Up Casserole | Lid-on truth suppression | Leans on `truthBelow20Streak` / `timeBasedGoalCounters` for streak-style baking. |
| Spice Rack Surveillance | Coast-to-coast shakers | Checks `controlledStates` for NY/CA/TX/FL coverage. |
| Black-Budget Barbecue | Classified cookout | Tracks raw IP reserves through the snapshot `ip` value. |

### Shared potluck platter
| Agenda | Theme hook | Progress trigger |
| --- | --- | --- |
| Paranoid Picnic Tour | Roadside oddities tailgate | Validates four foodie-state holdings (WI/MN/NJ/LA/NM) from `controlledStates`. |
| Midnight Press Run | Alternating outrage courses | Uses paired MEDIA/ATTACK counts from `factionPlayHistory` (`Math.min` pairing). |
| Combo Platter Column | Buffet-table resonance | Reads `activeStateCombinationIds.length` to demand two simultaneous combo bonuses. |
