# Paranoid Times Gap Analysis and Improvement Plan

## Current MVP snapshot
- **Core loop:** The MVP pits Truth Seekers against the Government in a two-player duel that tracks Influence Points (IP), the shared Truth meter, and pressure on U.S. states, with victory triggered by 10 captured states, Truth thresholds, or 300 IP.【F:DESIGN_DOC_MVP.md†L7-L63】【F:docs/TECHNICAL_README.md†L11-L19】
- **Economy:** Each turn grants 5 IP plus 1 IP per controlled state before players can spend resources to play up to three cards.【F:DESIGN_DOC_MVP.md†L99-L134】【F:src/mvp/engine.ts†L50-L99】
- **Card catalog:** Cards are limited to three types (ATTACK, MEDIA, ZONE) with tightly scripted effects and costs that peak at four IP removed, four percent Truth swing, or four pressure per play.【F:DESIGN_DOC_MVP.md†L25-L189】
- **Combo hooks:** The runtime already supports lightweight combo detection that can reward extra IP or visual flourishes after turn wrap-up.【F:docs/TECHNICAL_README.md†L35-L36】

## Benchmarking against leading digital card games
- **Content breadth & mechanics:** Hearthstone fields multiple card classes with distinct hero powers, rotating keywords, and frequent expansion sets that continually reshape constructed, Arena, Battlegrounds, and single-player modes.【ae32eb†L1-L26】 Legends of Runeterra similarly differentiates ten regions, champion leveling, and introduces battle-pass cadence without booster packs.【04bdbe†L13-L52】【2eff0a†L1-L10】 Marvel Snap keeps matches short but layers random location rules, the Snap betting mechanic, and cosmetics-driven collection progression across ranked, Battle Mode, and Conquest ladders.【8b6c7a†L1-L29】【8b6c7a†L30-L44】 Paranoid Times’ MVP lacks faction-specific mechanics, keywords, or expansion hooks beyond the three basic effect families.
- **Progression & rewards:** Hearthstone and Marvel Snap pair ranked ladders with seasonal resets and cosmetics, while Legends of Runeterra uses a generous battle pass and crafting-friendly economy to keep players engaged without steep paywalls.【3144b3†L1-L21】【8b6c7a†L30-L44】【2eff0a†L6-L10】 Paranoid Times currently has no progression, cosmetics, or deck-ownership incentives beyond the raw duel loop.
- **Mode variety & social play:** Popular digital card games offer casual vs ranked queues, rotating events (Tavern Brawl, limited-time modes), and direct challenges such as Marvel Snap’s Battle Mode.【3144b3†L1-L24】【8b6c7a†L30-L38】 Paranoid Times only supports the standard two-player duel specified in the MVP rules.【F:DESIGN_DOC_MVP.md†L15-L137】
- **Narrative & world-building:** Competitors expand their IP through lore drops, cross-media tie-ins, and regular PvE adventures, whereas Paranoid Times currently expresses its satire via card text but lacks campaign beats or recurring narrative events.

## IP economy assessment
- **Current pacing:** Players generate at least 5 IP per turn plus state bonuses, so midgame incomes commonly reach 8–10 IP when several states are held.【F:src/mvp/engine.ts†L50-L58】 Attack cards max out at stripping 4 IP (5 with discard) based on rarity tables, making it easy for a wealthy opponent to shrug off losses.【F:DESIGN_DOC_MVP.md†L169-L189】
- **Resulting issue:** Once a player snowballs IP, ATTACK cards represent less than a single turn’s income, so they rarely break momentum unless chained with discard or combo rewards. This undermines counterplay and makes MEDIA or ZONE plays comparatively more efficient for closing games.
- **Opportunities:** Introduce scaling mechanics—e.g., percentage-based siphons, maintenance costs on high IP, or bonus triggers when targets exceed thresholds—to keep disruption meaningful. Alternatively, diversify ATTACK designs with tempo effects (stun a state, block draw) that matter even when raw IP swing is small.

## Strategic improvement plan
### Short term (1–2 sprints)
1. **Rebalance ATTACK cards for late-game relevance:** Prototype scaling IP loss (e.g., `max(4, floor(opponentIP * 0.15))`) or add secondary effects like temporary cost inflation when the target exceeds 20 IP, then validate via automated turn simulations.【F:src/engine/applyEffects-mvp.ts†L53-L72】
2. **Expand card keywords within existing schema:** Add low-scope modifiers (e.g., "Expose" for extra Truth damage, "Sabotage" forcing discard draw penalties) to differentiate plays without abandoning MVP validation.【F:src/mvp/validator.ts†L5-L22】
3. **Surface lightweight progression hooks:** Track match streaks or first-win bonuses to mimic the daily quest cadence seen in larger titles, using combo logs as a foundation for achievements.【F:docs/TECHNICAL_README.md†L35-L36】

### Mid term (quarter)
1. **Deck-building depth:** Introduce faction subthemes or state-based synergies (e.g., region bonuses) so decks feel distinct like Hearthstone classes or Runeterra regions.【DESIGN_DOC_MVP.md†L25-L189】【ae32eb†L1-L19】【04bdbe†L13-L38】
2. **Progression & cosmetics roadmap:** Build a seasonal reward track and cosmetic card frames inspired by battle passes and variant systems to keep engagement without pay-to-win pressure.【2eff0a†L6-L10】【8b6c7a†L30-L44】
3. **Alternate modes:** Pilot a weekly mutation mode (random map rules, asymmetric objectives) to echo Tavern Brawls/Marvel Snap events and test infrastructure for future PvE scenarios.【3144b3†L1-L24】【8b6c7a†L30-L38】

### Long term
1. **Narrative PvE arc:** Develop a "Tabloid Investigations" campaign that leverages existing newspaper logs for branching missions, paralleling Hearthstone adventures and Runeterra’s Path of Champions.【3144b3†L9-L21】【04bdbe†L13-L52】
2. **Competitive ecosystem:** Layer ranked tiers, spectator tools, and periodic tournaments to support esports-style events similar to Hearthstone and Marvel Snap communities.【3144b3†L1-L21】【8b6c7a†L40-L44】
3. **Live operations cadence:** Establish quarterly card expansions introducing new keywords, balance passes, and state map variations to keep the meta fresh, matching the rapid content cadence of market leaders.【ae32eb†L1-L26】【8b6c7a†L1-L29】

## Next steps
- Validate the proposed IP scaling changes through targeted playtests and telemetry to confirm ATTACK relevance at high incomes.
- Prioritize one player-facing progression feature (daily bonus or cosmetic unlock) for rapid deployment while scoping larger seasonal systems.
- Draft a live-ops calendar that sequences card expansion milestones, rotating modes, and narrative drops to sustain player interest beyond the MVP loop.
