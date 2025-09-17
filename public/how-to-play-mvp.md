# How to Play ShadowGov (MVP Rules)

Welcome to the streamlined MVP ruleset for ShadowGov. This version focuses on the core loop that powers the prototype and removes legacy mechanics from the 2.1E era.

## Objective
Win by pushing national Truth to 100 or by reducing your opponent's Influence Points (IP) to zero. Control states with pressure to accelerate your plan.

## Turn Structure
1. **Start of Turn** – Draw up to 5 cards and gain IP (5 + number of states you control).
2. **Main Phase** – Play up to three cards, targeting states when required.
3. **End Phase** – Resolve ongoing effects and pass the turn.

## Card Types
- **MEDIA** – Adjust Truth directly. Costs are fixed by rarity (Common 3, Uncommon 4, Rare 5, Legendary 6).
- **ATTACK** – Spend IP to damage your opponent's IP or force discards. Costs follow rarity (2/3/4/5).
- **ZONE** – Add pressure to specific states to claim control. Costs follow rarity (4/5/6/7).

## Rarity & Costs
Each rarity has a predefined cost curve. When importing cards, costs automatically snap to the expected value based on type and rarity. Legendary cards are powerful but expensive.

## Effects
The MVP ruleset supports a focused effect set:
- `truthDelta` for MEDIA cards.
- `ipDelta.opponent` and optional `discardOpponent` for ATTACK cards.
- `pressureDelta` for ZONE cards.

Any legacy effect keys are ignored by the sanitiser during import.

## Deck Building Tips
- Keep a balance of card types so you can react to board state changes.
- ZONE cards win games when backed by MEDIA momentum.
- ATTACK cards are most efficient when the opponent banks IP for big plays.

## Extensions
Extension packs are still supported. The runtime automatically sanitises uploaded cards to match the MVP rules above.

Have fun playtesting and iterate quickly!
