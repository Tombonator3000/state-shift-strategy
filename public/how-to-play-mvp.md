# How to Play ShadowGov (Operational Rules)

Welcome to the current ShadowGov ruleset. The game now layers secret agendas, paranormal events, and regional combos on top of the streamlined MVP core, so use this guide when teaching new operatives.

## Mission Objectives
Victory is evaluated in priority order at every checkpoint. Achieve any of the following to end the game:

1. **Complete your Secret Agenda** – each faction starts with a hidden objective; certain cards or tabloid events can expose the AI’s plan, and finishing yours ends the campaign instantly.
2. **Truth Extremes** – Truth Seekers win at ≥95% Truth, Government wins at ≤5%.
3. **Resource Dominance** – Bank 300 Influence Points (IP).
4. **Territorial Control** – Hold 10 U.S. states at once.

These same conditions apply to the AI, so watch its progress meters as closely as your own.

## Factions & Setup
1. **Choose a faction** (Truth Seekers or Government). Both sides begin at 50% Truth, 5 IP, and draw a five-card opening hand from a 40-card weighted deck tailored to their faction.
2. **Pick your Secret Agenda** from the curated list tied to the current Weekly Issue. Each entry shows its difficulty tier and requirements so you can lock in the objective that fits your plan. Progress and completion are tracked in the right-hand panel, with optional reveals triggered by specific cards or events.
3. **Map state control** starts neutral, so the first few turns focus on scouting, pressure, and setup plays.

Hand size is capped at five cards by default, though combo bonuses and events can temporarily raise the draw cap.

## Turn Flow
Each full round consists of alternating turns for the human player and the AI.

1. **Income Phase** – Gain 5 base IP plus income from every controlled state, combo bonuses, and neutral-state modifiers. Active state combinations can also reduce card costs or award extra draw charges.
2. **Action Phase** – Play up to three cards. Pay the IP cost up front; MEDIA manipulates Truth, ATTACK drains the enemy’s IP or hand, and ZONE adds pressure to targeted states.
3. **Capture & Resolution** – When pressure on a state meets or beats its defense, you immediately flip control and reset both sides’ pressure there. Combo trackers, streak counters, and secret agenda progress all update during this step.
4. **Events & Hotspots** – End-of-turn tabloids can trigger paranormal events, defense swings, bonus draws, or spawn hotspots that boost state defense while promising a Truth swing to whoever resolves them.
5. **Newspaper & Draw Step** – Review the round’s plays in the Extra Edition, archive highlights, then draw back to the hand limit (plus any earned bonus cards) before the next Action Phase.

## Card Types & Costs
Card costs are tied to rarity and enforced automatically.

- **MEDIA** – Truth manipulation and broadcast plays (Common 3 IP, Uncommon 4, Rare 5, Legendary 6).
- **ATTACK** – Resource denial, discard, and disruption (Common 2 IP, Uncommon 3, Rare 4, Legendary 5).
- **ZONE** – State pressure and occupation tools (Common 4 IP, Uncommon 5, Rare 6, Legendary 7).

Legendary cards hit hardest but quickly drain your IP economy, so pair them with high-income states or combo bonuses before committing.

## States, Pressure & Synergies
Every state has a base IP yield, a defense value, and often a special bonus (tech hubs, oil revenue, paranormal hotspots, etc.). ZONE cards add pressure; when your pressure meets the defense number you seize the state, reset pressure to zero, and immediately receive its income and bonus.

Controlling specific clusters (e.g., Silicon Valley or Military Triangle) unlocks State Combination rewards such as cheaper MEDIA cards, extra card draw, flat IP income, or bonus defense. Track these bonuses in the State Synergy panel and adapt your route accordingly.

## Secret Agendas
Agendas are faction-flavoured mini-campaigns ranging from holding themed regions to sustaining Truth streaks. Progress bars advance when you fulfil their listed triggers during play. Completing your agenda outranks every other win condition, so protect your own progress while scouting for the AI’s agenda tells. The roster has been expanded dramatically, so every faction and difficulty tier now surfaces multiple options during setup.

Some events, cards, or investigative plays can expose the opponent’s agenda, revealing its target so you can plan a counter-strategy. When you lock in an agenda at the start of the game, the AI receives one from the same difficulty tier to keep the campaign fair—if the opposing faction lacks that tier the selector falls back to the nearest match and flags the change in the round log.

## Campaign & Anomalies
Campaign storylines will occasionally override the random tabloids at the end of a round. When you see the 📖 log stamp in the Extra Edition, it means a campaign arc has advanced, and the next chapter is already queued to appear in a future paper—finale headlines close the loop and clear the queue entirely.【F:src/hooks/useGameState.ts†L204-L320】 State-themed bonuses resolve in the same window. Any state with an active bonus gets a glowing green intel panel in the map drawer that lists its icon, headline, and Truth/IP/pressure swings for the current round.【F:src/components/game/EnhancedUSAMap.tsx†L780-L820】 The blue “Current Anomalies” feed underneath only shows up while a faction actually controls the state, so neutral regions hide anomaly warnings until someone claims them.【F:src/components/game/EnhancedUSAMap.tsx†L821-L864】

## Events, Hotspots & Combos
- **Tabloid Events** fire at the end of turns, twisting Truth, IP, defense, or card draw. Legendary events can even reveal agendas or reshuffle state control.
- **Paranormal Hotspots** temporarily raise a state’s defense while promising a Truth swing to whichever faction resolves the anomaly first. When a hotspot appears you’ll see a flying UFO skim the affected state and leave a green glow around it, plus you’ll hear the UFO bulletin sting so you can react even while scanning other panels. If you’ve enabled reduced-motion mode, the UFO flashes in place without sweeping across the map, but the glow still locks on—and the sting still plays—so you can track the target. Drop pressure there immediately or sabotage your opponent’s attempt—the glow clears the moment someone resolves the anomaly.
- **Combo Engine** rewards coordinated turns with bonus IP, Truth swings, or additional card draws. Review combo summaries in the newspaper and adjust your play order to trigger the effects you need.

## Tactical Tips
- Spend early turns establishing IP-positive states before committing expensive legendary plays.
- Use MEDIA to push Truth toward your victory thresholds while denying the opponent their extremes.
- Stack pressure across neighbouring states to threaten multiple captures and force defensive reactions.
- Peek at agenda progress frequently; diverting a single play to deny the AI’s agenda can save the match.
- Watch the Objectives button in the HUD—it now pulses softly whenever new agenda progress or objectives are waiting for review. Reduced-motion mode swaps the pulse for a static highlight so you still get the cue without the animation.

Study the newspaper between rounds—the satire is optional, but the intel is real. Good luck, operative!
