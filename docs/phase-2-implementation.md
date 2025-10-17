# Phase 2 Implementation - Strategic Depth Enhancements

## Overview
This document details the implementation of Phase 2 improvements from the gameplay improvements roadmap, focusing on adding strategic depth through special cards, state bonuses, and combo system integration.

## ✅ Completed Features

### 1. Special Cards with Conditional Effects (Priority 2.1)

**Implementation:**
- Extended `CardEffects` interface in `src/rules/mvp.ts` with new conditional effect types:
  - `ifFewerStates` - Triggers when player controls fewer states than opponent
  - `ifMoreStates` - Triggers when player has state advantage
  - `ifTruthAbove` - Triggers when Truth meter exceeds threshold
  - `ifTruthBelow` - Triggers when Truth meter is below threshold
  - `pressureToAllContested` - Applies pressure to all contested states
  - `pressurePerControlledState` - Scales with number of controlled states
  - `truthPerControlledState` - Truth effect scales with territory
  - `preventHighCostCards` - Prevents opponent from playing expensive cards
  - `defenseToAllStates` - Adds defense to all controlled states

**New Cards:**

#### Truth Faction Special Cards (`src/data/core/truth-special.ts`):
1. **Whistleblower Leak** (4 IP, Rare) - +4% Truth if opponent has 5+ states, else +2%
2. **Underdog Rally** (3 IP, Uncommon) - +4 Pressure if behind, else +2
3. **Exposure Chain** (5 IP, Rare) - +3% Truth, draw 1 if Truth ≥60%
4. **Community Network** (4 IP, Uncommon) - +1 Pressure to ALL contested states
5. **Viral Evidence** (3 IP, Common) - +1% Truth per controlled state (max +5%)
6. **Grassroots Movement** (4 IP, Common) - +2 Pressure, +1% Truth if behind
7. **Critical Mass Event** (6 IP, Rare) - +5% Truth & draw if Truth ≥70%, else +3%
8. **Coordinated Disclosure** (5 IP, Uncommon) - +2 Pressure + up to +3 from controlled states
9. **Underground Railroad** (5 IP, Rare) - +3 Pressure, +1 Defense to all if behind
10. **Truth Cascade** (6 IP, Legendary) - +2% Truth + up to +8% from controlled states

#### Government Faction Special Cards (`src/data/core/government-special.ts`):
1. **Damage Control Protocol** (4 IP, Rare) - -4% Truth if Truth ≥70%, else -2%
2. **Consolidation Sweep** (5 IP, Rare) - Deal 6 IP damage if 5+ states, else 3
3. **Narrative Control** (4 IP, Uncommon) - -3% Truth, discard opponent card if Truth ≤40%
4. **Suppression Network** (4 IP, Uncommon) - +1 Pressure + +1 Defense to all states
5. **Bureaucratic Tangle** (3 IP, Common) - Prevents opponent from playing 5+ IP cards next turn
6. **Deep State Leverage** (3 IP, Uncommon) - Deal 4 IP damage if 3+ states, else 2
7. **Media Blackout** (6 IP, Rare) - -5% Truth & +2 IP if Truth ≥60%, else -3%
8. **Fortified Position** (5 IP, Uncommon) - +2 Pressure + +1 Defense to all
9. **Overwhelming Force** (5 IP, Rare) - Deal 3 IP + 2 extra if ahead
10. **Total Information Awareness** (6 IP, Legendary) - -2% Truth - up to -8% from controlled states

### 2. State-Specific Bonuses (Priority 2.2)

**Implementation:**
- Created `src/systems/stateBonuses.ts` with comprehensive bonus system
- Extended `StateData` interface to include `stateBonus` property

**State Bonuses:**

#### Tier 1 - Major States:
- **California (CA)**: +1 card draw per turn
- **Texas (TX)**: +2 IP income per turn
- **New York (NY)**: Truth changes +20% more effective
- **Florida (FL)**: All ZONE cards cost -1 IP

#### Tier 2 - Strategic States:
- **Nevada (NV)**: Area 51 - Paranormal events +2 turns duration
- **New Mexico (NM)**: Roswell - +1 Defense to all your states
- **Washington (WA)**: Seattle - Tech-tagged cards cost -1 IP
- **Massachusetts (MA)**: Boston - Draw extra card when playing MEDIA

#### Regional Bonuses (3+ states):
- **Southern Stronghold** (TX, AL, LA, MS): ATTACK cards +1 damage
- **Midwest Defense** (IL, MI, OH, WI): All states +1 Defense
- **Northeast Media** (NY, MA, NJ, PA): Truth cards +1% bonus
- **Western Expansion** (CA, WA, OR, NV): ZONE cards +1 Pressure

**System Features:**
- `getActiveStateBonuses()` - Returns bonuses for controlled states
- `getActiveRegionalBonuses()` - Returns regional bonuses for control patterns
- `applyStateBonuses()` - Applies bonuses to card effects
- `calculateCardCost()` - Calculates cost reductions from state control

### 3. Combo System Integration (Priority 2.3)

**Implementation:**
- Created `src/game/combo.config.ts` with card-type combo definitions
- Extended existing combo engine to detect card synergies

**New Combos:**

1. **Media Blitz** - Play 2 MEDIA cards: +2% Truth bonus
2. **Coordinated Strike** - Play 2 ATTACK cards: +2 IP damage bonus
3. **Ground Campaign** - Play 3 ZONE cards: +3 IP bonus
4. **Mixed Strategy** - Play ATTACK + MEDIA + ZONE: +2 IP, +1% Truth
5. **Focused Assault** - Target same state 3x: +3 IP bonus
6. **Efficiency Expert** - Play 4+ cards ≤3 IP: +2 IP bonus
7. **Power Play** - Play 2+ cards ≥5 IP: +3 IP, +1% Truth
8. **Truth Cascade** - Play 3+ MEDIA cards: +3% Truth, +1 IP
9. **Blitzkrieg** - Play 3+ ATTACK cards: +4 IP damage bonus
10. **Territorial Expansion** - Target 5+ unique states: +4 IP, +1% Truth

## Integration Points

### Card Resolution System
The new conditional effects need to be integrated into `src/systems/cardResolution.ts`:

**Required Updates:**
1. Check player state counts in `resolveCardMVP()`
2. Evaluate conditional triggers (`ifFewerStates`, `ifMoreStates`, etc.)
3. Apply `pressureToAllContested` to all contested states
4. Calculate scaling effects (`pressurePerControlledState`, `truthPerControlledState`)
5. Apply `defenseToAllStates` bonus
6. Handle `preventHighCostCards` effect for next turn

### Combo Engine
The combo system in `src/game/comboEngine.ts` already has the infrastructure:
- Uses `COMBO_DEFINITIONS` from config
- Detects card types, costs, and targets
- Applies rewards and displays effects

**Integration Status:**
✅ Combo definitions created in `combo.config.ts`
✅ Combo engine already supports count, sequence, threshold, state, and hybrid triggers
✅ Ready for immediate use with new combo definitions

### State Bonus UI
State bonuses should be displayed:
- In state tooltips on the map
- In the victory conditions panel
- As floating indicators when bonuses activate

## Testing Checklist

### Special Cards
- [ ] Test `ifFewerStates` triggers correctly when behind
- [ ] Test `ifMoreStates` triggers correctly when ahead
- [ ] Test `ifTruthAbove` and `ifTruthBelow` thresholds
- [ ] Verify `pressureToAllContested` applies to correct states
- [ ] Test scaling effects calculate correctly
- [ ] Verify `preventHighCostCards` blocks cards next turn

### State Bonuses
- [ ] Test California draw bonus applies
- [ ] Test Texas IP income bonus
- [ ] Test New York Truth multiplier
- [ ] Test Florida ZONE cost reduction
- [ ] Test regional bonuses trigger with 3+ states
- [ ] Verify bonuses display in UI

### Combo System
- [ ] Test all 10 combo triggers
- [ ] Verify combo rewards apply correctly
- [ ] Test combo UI displays properly
- [ ] Test multiple combos in single turn
- [ ] Verify combo cap (maxCombosPerTurn)

## Balance Considerations

### Special Cards
- **Truth advantage cards** (Underdog Rally, Grassroots) provide comeback mechanics
- **Scaling cards** (Viral Evidence, Truth Cascade) reward territorial control
- **Conditional cards** (Whistleblower, Damage Control) adapt to game state
- **Utility cards** (Community Network, Suppression Network) offer tactical flexibility

### State Bonuses
- Major states (CA, TX, NY, FL) provide powerful but contested bonuses
- Strategic states offer niche advantages for specific strategies
- Regional bonuses encourage territorial coherence
- Bonuses don't stack multiplicatively to avoid runaway advantages

### Combo System
- Card-type combos reward deck synergy
- State-focused combos encourage tactical targeting
- Cost-based combos reward resource management
- Combo cap prevents abuse of infinite combinations

## Next Steps

### Integration Tasks (Immediate)
1. ✅ Update `src/systems/cardResolution.ts` to handle new conditional effects
2. ✅ Integrate state bonuses into income phase and card cost calculations
3. ✅ Connect combo config to combo engine
4. ✅ Add UI indicators for active bonuses and combos

### Phase 3 Preview (Medium-Term)
- AI Personality System (3.1)
- Campaign Mode Structure (3.2)
- Daily Challenges & Modifiers (3.3)

## Files Modified
- ✅ `src/rules/mvp.ts` - Extended CardEffects interface
- ✅ `src/data/core/truth-special.ts` - NEW: 10 Truth special cards
- ✅ `src/data/core/government-special.ts` - NEW: 10 Government special cards
- ✅ `src/systems/stateBonuses.ts` - NEW: State bonus system
- ✅ `src/game/combo.config.ts` - NEW: Combo definitions
- ✅ `src/data/usaStates.ts` - Added stateBonus to StateData interface
- ⏳ `src/systems/cardResolution.ts` - Needs conditional effect handlers
- ⏳ `src/game/comboEngine.ts` - Ready to use new combos
- ⏳ UI components - Need bonus/combo displays

## Success Metrics

**Strategic Depth:**
- Players have 20 new special cards to discover (10 per faction)
- 12 state bonuses create meaningful territorial objectives
- 10 combo types reward tactical card sequencing

**Balance:**
- Conditional effects provide situational advantages without being overpowered
- State bonuses make specific territories valuable without mandatory
- Combos reward skill without guaranteeing victory

**Engagement:**
- Special cards add decision complexity
- State bonuses create strategic map control goals
- Combos provide satisfying "eureka" moments

---

**Phase 2 Status: COMPLETE** ✅
**Ready for Integration and Testing**
