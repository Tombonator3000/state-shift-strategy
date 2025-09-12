# v2.1E Rule Engine Migration Guide

// v2.1E Rule Engine Implementation Complete

I've implemented the complete v2.1E rule engine sync with the following changes:

## Core Updates ✅

**Schema & Types (`src/types/cardTypes.ts`)**:
- Lowercase factions: `'truth' | 'government'`
- 4 card types only: `'MEDIA' | 'ZONE' | 'ATTACK' | 'DEFENSIVE'`
- Strict effect whitelist for extensions

**Effect Whitelisting (`src/utils/whitelistEffects.ts`)**:
- Only v2.1E approved effects allowed
- Recursive conditional whitelisting
- Card validation with detailed error reporting

**v2.1E Cost Engine (`src/systems/cost/v21e/scorer.ts`)**:
- Effect-based costing replaces type-based costs
- All cards ≥4 IP, legendary ≥25 IP
- Truth effects weighted higher (expensive leaning)

## System Updates ✅

**Extension System (`src/data/extensionSystem.ts`)**:
- Automatic card normalization on load
- Faction casing enforcement
- ZONE targeting requirements
- Flavor field standardization

**Distribution System (`src/data/weightedCardDistribution.ts`)**:
- Removed keyword heuristics (no more faction bleeding)
- Exact faction matching only
- Clean card pool filtering

**Text Generation (`src/systems/CardTextGenerator.ts`)**:
- Guard against empty `ifTargetStateIs` conditions
- Proper "If targeting State:" rendering

**UI Updates (`src/components/game/CardDetailOverlay.tsx`)**:
- Faction-aware flavor text routing
- Fallback to ensure text always displays

## Migration & Validation Tools ✅

**Migration Script (`tools/migrate-v21e.ts`)**:
- One-shot migrator for all extension files
- Automatic cost recalculation
- Validation with detailed error reporting

**Validation Script (`tools/validate-v21e.ts`)**:
- Hard enforcement of v2.1E rules
- Comprehensive error reporting
- Exit codes for CI integration

**Apply Script (`src/scripts/apply-v21e-migration.ts`)**:
- One-click migration with backup
- Automatic rollback on validation failure

## Next Steps 📋

1. **Run Migration**: `npx ts-node src/scripts/apply-v21e-migration.ts`
2. **Test Extensions**: Load cryptids.json and verify cards work
3. **Verify Distribution**: Test faction-specific deck generation
4. **Update Documentation**: Rules, How to Play, etc.

The system now enforces v2.1E compliance throughout the entire pipeline.

## Quick Start

1. **Run Migration**:
   ```bash
   npx ts-node tools/migrate-v21e.ts
   ```

2. **Validate Results**:
   ```bash
   npx ts-node tools/validate-v21e.ts
   ```

3. **Test In-Game**: Load extensions and verify they work correctly

## Key Changes

### Card Types (BREAKING)
- **Before**: `MEDIA | ZONE | ATTACK | DEFENSIVE | LEGENDARY`
- **After**: `MEDIA | ZONE | ATTACK | DEFENSIVE` (legendary is rarity)

### Faction Casing (BREAKING)
- **Before**: `"Truth" | "Government"` (titlecase)
- **After**: `"truth" | "government"` (lowercase)

### Cost Model (BREAKING)
- **Before**: Type-based defaults (MEDIA=4, ZONE=5, etc.)
- **After**: Effect-based scoring with minimums (all ≥4, legendary ≥25)

### Targeting Requirements
- **ZONE cards**: Must have `target: { scope: "state", count: 1 }`
- **Other types**: Default to global scope

### Effect Whitelist
Only these effects are allowed in extensions:
- `truthDelta`, `ipDelta.{self,opponent}`, `draw`, `discardOpponent`
- `pressureDelta`, `zoneDefense`
- `conditional.{ifTruthAtLeast, ifZonesControlledAtLeast, ifTargetStateIs}`

### Flavor Text
- All cards must have both `flavorTruth` and `flavorGov` fields
- UI selects based on active faction with fallback

## Migration Checklist

- [ ] Run migration script on all extension files
- [ ] Validate all cards pass v2.1E compliance
- [ ] Test card distribution without faction bleeding
- [ ] Verify flavor text displays correctly for both factions
- [ ] Test ZONE card targeting works properly
- [ ] Verify cost engine produces reasonable values

## Troubleshooting

### "Invalid type" Errors
Cards with non-whitelisted types are defaulted to MEDIA. Check if this is intended.

### "Missing flavor" Errors
Add both `flavorTruth` and `flavorGov` fields to all cards.

### Faction Bleeding
The migration removes keyword heuristics. Cards must have explicit `faction` field.

### High Costs
The new cost engine may price some cards higher. This is expected (v2.1E is "dyrere leaning").

## Files Modified

- `src/types/cardTypes.ts` - New v2.1E type definitions
- `src/utils/whitelistEffects.ts` - Effect validation
- `src/systems/cost/v21e/scorer.ts` - New cost engine
- `src/data/extensionSystem.ts` - Card normalization
- `src/data/weightedCardDistribution.ts` - Removes heuristics
- `tools/migrate-v21e.ts` - Migration script
- `tools/validate-v21e.ts` - Validation script

## Next Steps

1. Update game documentation to reflect v2.1E rules
2. Consider running cost analysis on migrated cards
3. Update tutorial/help text for new rules
4. Test with multiple extensions enabled