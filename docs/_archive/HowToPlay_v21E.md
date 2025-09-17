# ShadowGov Rules v2.1E

## Core Game Mechanics

### Card Types
- **MEDIA**: Global influence cards that affect Truth percentage
- **ZONE**: State-targeting cards that control specific regions
- **ATTACK**: Aggressive cards that reduce opponent defenses
- **DEFENSIVE**: Protective cards that provide resources and advantages

**Note**: "Legendary" is a rarity level, not a card type.

### Cost System (v2.1E)
Cards use an **effect-based cost calculation** rather than fixed type costs:

- **Truth Effects**: Cost increases with Truth percentage change
- **IP Effects**: Resource manipulation has high cost
- **Card Draw**: Very expensive (3 IP per card)
- **Conditional Effects**: Receive ~20% cost discount
- **Legendary Minimum**: All legendary cards cost at least 25 IP

### Faction System
Factions are always written in **lowercase**:
- `truth` - Seeks to increase public awareness
- `government` - Works to maintain control

Both data files and UI use this consistent casing.

### Targeting Rules
- **ZONE cards**: Must always target exactly one state (`target: {scope: "state", count: 1}`)
- **MEDIA/ATTACK/DEFENSIVE**: Global by default, but may have conditional state effects
- **Conditional Targeting**: Cards can have effects like "If targeting Texas: +2 Zone Defense"

### Flavor Text System
All cards have both `flavorTruth` and `flavorGov` fields:
- UI automatically selects appropriate flavor based on current player's faction
- Ensures consistent narrative perspective regardless of who plays the card

## Effect System

### Whitelisted Effects
Only these effect types are allowed:

```typescript
{
  truthDelta: number,           // Change in Truth percentage
  ipDelta: {                   // Influence Point changes
    self?: number,             // IP for current player
    opponent?: number          // IP for opponent
  },
  draw: number,                // Cards to draw
  discardOpponent: number,     // Cards opponent must discard
  pressureDelta: number,       // Pressure change on target state
  zoneDefense: number,         // Defense bonus for controlled states
  conditional: {               // Conditional effects
    ifTruthAtLeast?: number,
    ifZonesControlledAtLeast?: number,
    ifTargetStateIs?: string,
    then: CardEffects,
    else?: CardEffects
  }
}
```

### Conditional Effects
State-targeting conditionals display as: "If targeting [State]: [Effect]. Else: [Alternate Effect]"

Example:
```json
{
  "truthDelta": -4,
  "conditional": {
    "ifTargetStateIs": "South Carolina", 
    "then": {"truthDelta": -2}
  }
}
```

Renders as: "-4% Truth. If targeting South Carolina: -2% Truth."

## Expansion Guidelines

### Data Requirements
- All faction values must be lowercase (`"truth"` or `"government"`)
- ZONE cards require state targeting
- Use only whitelisted effect properties
- Legendary cards automatically enforce 25 IP minimum cost

### Validation
The v2.1E system includes automatic validation for:
- Faction casing consistency
- Effect property whitelisting
- ZONE targeting requirements
- Legendary cost minimums

Run validation with: `bun tsx scripts/validate-v21e.ts`

### Migration
To migrate existing data to v2.1E:
```bash
bun tsx scripts/migrate-v21e.ts
```

This will:
- Normalize all faction casing to lowercase
- Add missing flavor fields
- Ensure ZONE cards have proper targeting
- Recalculate costs using v2.1E engine
- Remove non-whitelisted effect properties

## Special Cards

### Wildlife Advisory
Fixed as ZONE card with:
- State targeting requirement
- Base zone defense bonus
- Additional bonus when targeting home state
- Implemented via conditional effect system