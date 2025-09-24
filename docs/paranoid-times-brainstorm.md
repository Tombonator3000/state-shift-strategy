# Paranoid Times – Gameplay & Layout Brainstorm

> **Purpose.** This document extends the tone bible in *Humor Template – Paranoid Times.md* and the systems in *DESIGN_DOC_MVP.md*. The aim is to stage future features, UI beats, and card content in a way that complements (not replaces) the working MVP card game that already tracks IP, Truth %, and State Pressure.

## Thematic Pillars
- **Weekly World News x X-Files tone:** Blend deadpan government denial with gonzo tabloid exposés. Every interaction should feel like leafing through a cheaply printed conspiracy rag, matching the flavor patterns already captured in the Humor Template.
- **Absurdist humor as mechanics:** Reinforce jokes by using mechanics that exaggerate cover-ups, leaked documents, and outrageous sightings—always respecting the Government vs. Truth voice guides in the style bible.
- **Dual narrative tug-of-war:** Highlight the push-pull between the Government "Spin Division" and the Truth "Paranoid Press" using asymmetric abilities, but keep the core MVP victory conditions (Truth %, IP, State control) intact.

## Alignment Snapshot
| Brainstorm Idea | Where it plugs into MVP today |
| --- | --- |
| Front-page headline race | Reskins the existing "play up to 3 cards" turn into clearly labeled headline slots using the same card resolution rules. |
| Evidence vs. Red Tape | Uses the Truth (0–100%) track from the MVP, adding optional threshold triggers. |
| Location stunts | Builds on the Pressure-per-state system; "stunt" is new flavor for ZONE card effects. |
| Deck archetypes | Groups future card lists so they follow the Humor Template voices while still using ATTACK/MEDIA/ZONE behaviors. |
| Public Frenzy meter | A temporary modifier layered on top of existing IP / Truth swings; never replaces core victory math. |

## Core Gameplay Concepts (Building on MVP Systems)
### 1. Headline Wrestling (Primary Loop)
- Reframe each MVP turn as a fight for the *Paranoid Times* front page. When a player spends IP to play a card (ATTACK, MEDIA, or ZONE), the UI drops it into a themed slot (Top Banner = MEDIA, Main Photo = ZONE, Sidebar = ATTACK by default).
- Keep simultaneous stakes by revealing the opponent's queued cards as they resolve in initiative order already defined in *DESIGN_DOC_MVP.md* (current game alternates action resolution; this treatment simply surfaces it through layout).
- Replace the brainstormed "Circulation" resource with existing metrics: MEDIA cards that win their slot award bonus Truth %, while ATTACK cards drain opposing IP, and ZONE cards increase Pressure exactly as the MVP prescribes.

### 2. Evidence vs. Red Tape Track (Secondary Loop)
- Treat "Evidence" and "Red Tape" as narrative wrappers for the shared Truth slider (0–100%). Truth player pushes toward the "Smoking Gun" threshold at 90%; Government drags toward "Classified" at 10%.
- Add two stretch thresholds at ~70% and ~30%: hitting them unlocks a one-time **Expose!** (Truth) or **Obfuscate** (Government) card discount or extra draw, but the underlying Truth math still controls win conditions exactly as before.

### 3. Location Stunts (Tertiary Loop)
- Map the brainstormed "Stunt tokens" directly to existing Pressure in states. ZONE cards can tag their Pressure gains as stunts (e.g., "Bureaucracy Blitz" = +2 Pressure + forced discard) without changing the underlying capture check.
- Regional flavor (Roswell, Pentagon, Everglades) slots into state metadata already referenced in *DESIGN_DOC_MVP.md*. The persistent modifiers described here become state-specific passive abilities unlocked when a faction crosses the Pressure ≥ Defense threshold.

### 4. Deck Identity Hooks
- **Truth Deck Archetypes** — keep using ATTACK/MEDIA/ZONE cards, but curate lists according to Humor Template beats:
  - *Bat Boy Beat*: MEDIA-heavy deck that stacks Truth % swings and combos when multiple cryptid-tagged cards resolve in a turn.
  - *Tin Foil Taskforce*: ZONE cards that chain Pressure increases by referencing the red-string conspiracy joke from the tone bible; pairs with MEDIA cards that search the deck (already legal in MVP design).
  - *Florida Man Bureau*: ATTACK bursts with push-your-luck riders; on misses they hand IP (existing currency) back to Government via card text.
- **Government Deck Archetypes**
  - *Paperwork Tsunami*: ATTACK toolkit leaning on discardOpponent effects already whitelisted in the MVP.
  - *Black Budget Boom*: MEDIA/ATTACK mix that generates IP spikes (the MVP already allows +IP effects) before spending them on high-cost control plays.
  - *Reptilian HR*: ZONE disruption that adds junk cards (1-cost ATTACK with no effect) into the Truth deck, echoing the Humor Template's classified ads gag.

### 5. Momentum & Public Perception
- Track **Public Frenzy** as a short-term meter that reacts to Truth swings of ±10%. When the Truth player pushes the track past 60%, they gain a one-turn bonus headline slot (a fourth card play) — no new resource needed.
- When the Government suppresses Truth below 40%, they unlock initiative (resolving first for one round) or can stamp a state "Under Review" (opponent ZONE card Pressure halved that turn). Both outcomes are implemented via existing action resolution hooks.

## Layout & Presentation Ideas
### Front Page Interface
- **Center Spread:** Oversized main headline card with grainy halftone art; flickering neon caption reading "WE GUARANTEE IT'S TRUE (PROBABLY)."
- **Side Columns:** Stack of mini-headlines using ransom-note typography for Truth side, and clipboard memos for Government interventions.
- **Ticker Tape Footer:** Rotating absurd updates ("Bat Boy appointed to Federal Reserve") triggered by card effects.

### Deck & Hand Presentation
- Truth hand rendered as messy polaroids clipped to a corkboard.
- Government hand displayed as classified folders stamped "TOP SECRET" with coffee stains.
- Drag-and-drop interactions should leave "ink smudge" trails or falling paper scraps.

### Map/Operations Panel
- Fold-out map styled like a gas-station road map with red string pinned between hotspots.
- Government overlays appear as redacted overlays and caution tape.

### Feedback & Humor Beats
- Success animations: tabloid printing presses spitting out copies, or the DoD stamping DENIED across the screen.
- Failure beats: headlines literally catch fire or get shredded while a deadpan voice mutters "clerical error."

## Tone & Writing Alignment
- Pull flavor lines, running gags, and visual jokes straight from *Humor Template – Paranoid Times.md* when scripting new cards or UI copy.
- Keep Government text to one-line deadpan denials and Truth text to screaming tabloid quotes; use the sample phrases in the style bible as reusable snippets.
- When in doubt, run new content through the quick checklist in the Humor Template so both factions stay on-brand even as new systems land.

## Implementation Plan
1. **Narrative System Foundations**
   - Extend existing card metadata (see `src/data/cardDatabase.ts`) with an optional `frontPageSlot` tag; fall back to type-based defaults so current decks remain valid.
   - Update the MVP turn resolver to emit UI events for "slot revealed" without altering underlying timing.
2. **Evidence vs. Red Tape Track**
   - Skin the current Truth meter component with the Evidence/Red Tape framing and add milestone callbacks when crossing 70%/30%.
   - Implement the optional **Expose!**/**Obfuscate** triggers as scripted modifiers that consume on use, respecting the current Truth win checks.
3. **Location Stunts Module**
   - Annotate `usaStates.ts` entries with flavor hotspots and passive bonuses unlocked on capture.
   - Create a lightweight `StuntBadge` UI element that displays when a ZONE card adds Pressure so existing logic simply toggles presentation.
4. **Deck Archetype Content Pass**
   - Curate decklists that follow the Humor Template voice, using the ATTACK/MEDIA/ZONE whitelist already enforced in `cardBalancing.ts`.
   - Write punchline text for each archetype card and route it through the localization/flavor helpers in `content/`.
5. **UX Skinning**
   - Build reusable front-page grid, sidebar, and ticker components in `src/features/ui/frontPage/`, powered by Tailwind tokens already defined in `styles/`.
   - Apply faction-specific wrappers to existing hand components so the Truth corkboard vs. Government dossier styling matches the tone bible.
6. **Polish & Humor Delivery**
   - Pipe success/failure events into the humor banks defined in *Humor Template – Paranoid Times.md* to keep running gags consistent.
   - Add lightweight audio hooks (typewriter clacks, fax screeches) via the shared SFX system in `src/systems/audio` (or create if absent).

## Stretch Ideas
- **Co-op Investigations:** Optional mode where both players collaborate to beat a countdown timer representing "Imminent Cover-Up."
- **Community Headlines:** Allow user-submitted absurd headlines that rotate into daily challenges.
- **Augmented Reality Blips:** Companion mobile AR that overlays "classified" stickers on real-world locations for bonus in-game rewards.
