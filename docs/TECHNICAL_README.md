# Paranoid Times Technical Overview

## Table of contents
- [Game loop fundamentals](#game-loop-fundamentals)
- [MVP card schema](#mvp-card-schema)
- [State map and territorial control](#state-map-and-territorial-control)
- [Combo engine integration](#combo-engine-integration)
- [Card data normalization pipeline](#card-data-normalization-pipeline)
- [Audio systems](#audio-systems)

## Game loop fundamentals
The MVP design defines a duel between the Truth Seekers and the Government, each managing Influence Points (IP), a shared Truth meter, and pressure on individual U.S. states. Win conditions include controlling 10 states, pushing Truth to faction-specific thresholds, or accumulating 300 IP.【F:DESIGN_DOC_MVP.md†L7-L63】 These core concepts are implemented directly in the runtime engine:

- **Turn start:** `startTurn` clones game state, awards `5 + controlledStates` IP to the active player, and refills their hand to five cards.【F:src/mvp/engine.ts†L50-L68】
- **Card play gating:** `canPlay` enforces the three-card-per-turn limit, IP costs, and ZONE targeting rules before a card resolves.【F:src/mvp/engine.ts†L71-L99】
- **Playing a card:** `playCard` removes the card from hand, deducts IP, logs the play, and calls `resolve` to apply effects.【F:src/mvp/engine.ts†L101-L215】
- **Effect resolution:** `resolve` relies on `applyEffectsMvp` to adjust IP, Truth, and pressure while tracking capture metadata for end-of-turn summaries.【F:src/mvp/engine.ts†L157-L215】【F:src/engine/applyEffects-mvp.ts†L53-L157】
- **Turn end:** Discards are processed with the “first one free, extras cost 1 IP each” rule, combo hooks are evaluated, logs are appended, and control passes to the other player.【F:src/mvp/engine.ts†L217-L348】
- **Victory checks:** `winCheck` confirms state, Truth, and IP victory thresholds after every turn wrap-up, matching the MVP specification but using 95%/5% Truth buffers for runtime tuning.【F:src/mvp/engine.ts†L367-L395】【F:DESIGN_DOC_MVP.md†L55-L63】

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

## Combo engine integration
After discards resolve, `endTurn` invokes `evaluateCombos` to detect synergies, logs any triggered definitions, applies rewards (e.g., extra IP) through `applyComboRewards`, and optionally fires VFX callbacks controlled by `ComboOptions`. The resulting `ComboSummary` is surfaced in the turn log for UI consumption.【F:src/mvp/engine.ts†L289-L333】 Components such as the main game page respond to these events with particle effects and SFX when a combo grants bonus resources.【F:src/pages/Index.tsx†L508-L544】

## Card data normalization pipeline
The card database wraps multiple sources behind `CARD_DATABASE`, loading fallback MVP cards immediately, attempting to import the core set asynchronously, and merging extension packs. Every card flows through `repairToMVP` and `validateCardMVP` during ingestion so gameplay always operates on sanitized MVP-compliant records. Normalization warnings and cost adjustments are logged in development builds for quick author feedback.【F:src/data/cardDatabase.ts†L1-L200】 Extension authors can rely on this pipeline to auto-correct casing, default targets, and baseline costs without hand-tuning individual files.

## Audio systems
The `useAudio` hook centralizes music playlists, SFX loading, and playback APIs. It loads thematic track lists for the start menu, faction selection, in-game loops, and end credits, while registering a library of sound keys for UI and event feedback.【F:src/hooks/useAudio.ts†L171-L268】 Notable integration points include:

- **Menu and UI actions:** Start screen buttons and game menus trigger the shared `click` key, while hover states reuse the quieter `lightClick` variant to avoid audio fatigue.【F:src/components/start/StartScreen.tsx†L59-L108】【F:src/components/game/EnhancedUSAMap.tsx†L237-L263】
- **Gameplay feedback:** The main game page plays `cardPlay`, `flash`, `turnEnd`, `cardDraw`, `newspaper`, `state-capture`, `hover`, and `error` cues during card deployment, Truth surges, turn transitions, and targeting workflows.【F:src/pages/Index.tsx†L919-L1025】【F:src/pages/Index.tsx†L520-L544】
- **Advanced effects:** `CardAnimationLayer` triggers paranormal SFX (`ufo-elvis`, `cryptid-rumble`) when optional overlays fire, and `TabloidNewspaperV2` plays `radio-static` when fresh sightings enter the log.【F:src/components/game/CardAnimationLayer.tsx†L128-L177】【F:src/components/game/TabloidNewspaperV2.tsx†L310-L336】

### SFX inventory and coverage
| Key | Purpose | Primary triggers |
| --- | --- | --- |
| `cardPlay` / `flash` | Card resolution feedback | Main game page during ATTACK/MEDIA plays【F:src/pages/Index.tsx†L946-L992】 |
| `cardDraw` / `turnEnd` | Turn wrap-up | End turn handler on the main page【F:src/pages/Index.tsx†L1013-L1019】 |
| `state-capture` | Combo/state capture events | Combo reward handling in main page logic【F:src/pages/Index.tsx†L520-L533】 |
| `newspaper` | Opening/closing the tabloid view | Main page newspaper toggle【F:src/pages/Index.tsx†L1022-L1025】 |
| `hover` / `lightClick` | Targeting and map hover cues | Zone targeting UX on EnhancedUSAMap【F:src/components/game/EnhancedUSAMap.tsx†L237-L263】 |
| `click` | Standard UI confirmation | Start screen actions and menus【F:src/components/start/StartScreen.tsx†L59-L108】 |
| `error` | Validation failures | IP/limit guards in the main game page【F:src/pages/Index.tsx†L900-L916】 |
| `typewriter` | Text ambience | Loaded for future UI animations (not yet invoked)【F:src/hooks/useAudio.ts†L225-L243】 |
| `victory` / `defeat` | Game over stingers | Preloaded; hook for victory modal integration【F:src/hooks/useAudio.ts†L225-L243】 |
| `ufo-elvis` | Paranormal broadcast overlay | Triggered when Truth meltdowns broadcast and effects enabled【F:src/components/game/CardAnimationLayer.tsx†L128-L151】 |
| `cryptid-rumble` | Cryptid sighting overlay | Triggered on cryptid events with effects enabled【F:src/components/game/CardAnimationLayer.tsx†L154-L177】 |
| `radio-static` | Tabloid sighting alert | Plays when new sightings arrive【F:src/components/game/TabloidNewspaperV2.tsx†L310-L336】 |

The hook currently falls back to placeholder audio for `ufo-elvis`, `cryptid-rumble`, and `radio-static`, but no dedicated assets exist in `public/audio/`. Contributors should source royalty-free replacements—e.g., UFO ambience, low-frequency rumble, and shortwave static—from providers listed in the audio README, ensure MP3 format under the recommended size limits, and drop them into `public/audio/` with filenames that match the SFX keys. Update `existingSfxFiles` if the final filenames differ and verify licensing records per the project’s royalty-free guidance.【F:src/hooks/useAudio.ts†L225-L243】【F:public/audio/README.md†L1-L28】【F:public/audio/README.md†L30-L36】

Music playback is orchestrated through stateful helpers (`setMenuMusic`, `setFactionMusic`, `setGameplayMusic`, `setEndCreditsMusic`) so UI layers can switch playlists without reinitializing the hook.【F:src/hooks/useAudio.ts†L320-L420】 Future contributors should call these helpers instead of manipulating HTMLAudioElements directly to keep crossfade and unlock logic intact.
