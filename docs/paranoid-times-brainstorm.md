# Paranoid Times – Gameplay & Layout Brainstorm

## Thematic Pillars
- **Weekly World News x X-Files tone:** Blend deadpan government denial with gonzo tabloid exposés. Every interaction should feel like leafing through a cheaply printed conspiracy rag.
- **Absurdist humor as mechanics:** Use mechanics that exaggerate cover-ups, leaked documents, and outrageous sightings. Mechanics must reinforce the feeling that the truth is always half a joke away.
- **Dual narrative tug-of-war:** Highlight the push-pull between a Government "Spin Division" and Truth "Paranoid Press" through asymmetric abilities and UI framing.

## Core Gameplay Concepts
### 1. Headline Wrestling (Primary Loop)
- Each round represents both factions rushing to control the front page of the *Paranoid Times*.
- Players secretly slot headline cards into a shared layout grid (e.g., Top Banner, Main Photo, Sidebar, Footer Stinger) then reveal simultaneously.
- Card placement determines turn order and triggers card-specific punchlines ("Government files under subsection 12-C" vs. "Florida Man romances Mothman").
- Winning the headline slot awards **Circulation** (victory points) or **Cover-Up** (defensive resource) depending on faction.

### 2. Evidence vs. Red Tape Track (Secondary Loop)
- Shared slider where Truth pushes toward "Smoking Gun" while Government drags back to "Classified." Crossing thresholds unlocks power plays:
  - Truth unlocks **Expose!** combos that let them chain additional headlines or leak mini-events.
  - Government unlocks **Obfuscate** effects like stamping a zone "Nothing to see here" for a round.

### 3. Location Stunts (Tertiary Loop)
- Map of US states (or hotspots like Area 51, Roswell, Florida Everglades) where players drop **Stunt tokens** representing field operations.
- Truth stunts spawn eye-witnesses or viral faxes; Government stunts deploy Men-in-Black or Bureaucracy Blitz.
- Control of a location provides persistent modifiers (e.g., "Roswell – Truth cards played here gain +1 Evidence"; "Pentagon – Government denies one tabloid bonus per round").

### 4. Deck Identity Hooks
- **Truth Deck Archetypes**
  - *Bat Boy Beat*: Focus on rapid circulation boosts when stacking multiple cryptid headlines.
  - *Tin Foil Taskforce*: Engine building around connecting red-string clue cards for cascading Evidence.
  - *Florida Man Bureau*: High-risk gambles that spike Truth percentage but may feed Government cover-ups if they whiff.
- **Government Deck Archetypes**
  - *Paperwork Tsunami*: Drains opponent resources by forcing retractions and mandatory reprints.
  - *Black Budget Boom*: Generates surge IP to deploy high-cost censorship cards.
  - *Reptilian HR*: Adds sleeper agents into Truth deck as junk draws that read like ridiculous classified ads.

### 5. Momentum & Public Perception
- Track **Public Frenzy** as a meter that rises with outrageous headlines and drops with successful cover-ups.
- When Frenzy peaks, tabloids gain temporary buffs (extra headline slot, viral multiplier). When subdued, Government gains initiative (play first, enforce discard).

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

## Implementation Plan
1. **Narrative System Foundations**
   - Design data schema for headline slots (position, faction bonuses, reveal timing).
   - Implement simultaneous reveal logic with priority resolution based on slot weight.
2. **Evidence vs. Red Tape Track**
   - Add shared slider component with threshold triggers and UI states for each faction.
   - Script unlockable abilities tied to slider milestones.
3. **Location Stunts Module**
   - Build map component with selectable hotspots and tooltips.
   - Define control effects and persistent modifiers via configuration (JSON/TS constants).
4. **Deck Archetype Content Pass**
   - Write 10–12 card concepts per archetype with cost, effect, and humor line.
   - Prototype interactions to ensure each archetype expresses unique humor beats.
5. **UX Skinning**
   - Create reusable layout primitives (front page grid, sidebar list, ticker) styled via Tailwind.
   - Apply faction-specific styling wrappers for hands, animations, and feedback.
6. **Polish & Humor Delivery**
   - Integrate randomized flavor text banks for success/failure states.
   - Add audio stingers (typewriter clacks, fax screeches) triggered by key events.

## Stretch Ideas
- **Co-op Investigations:** Optional mode where both players collaborate to beat a countdown timer representing "Imminent Cover-Up."
- **Community Headlines:** Allow user-submitted absurd headlines that rotate into daily challenges.
- **Augmented Reality Blips:** Companion mobile AR that overlays "classified" stickers on real-world locations for bonus in-game rewards.
