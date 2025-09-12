# Core Card Database Recovery System

This system automatically recovers the missing 400 core cards that were uploaded in batches.

## 🚀 Quick Recovery (Runtime)

The system is now active! The `src/data/core/index.ts` collector automatically gathers all batch files from `src/data/core/**/*.ts` and makes them available as `CARD_DATABASE`.

### Current Status
- ✅ Core collector active
- ✅ Runtime normalization (v2.1E format)
- ✅ Fallback protection (20 minimal cards if batches fail)
- ✅ Enhanced Balancing Dashboard updated with proper counts

## 📂 Adding Batch Files

Place your batch files in `src/data/core/` with this structure:

```typescript
// src/data/core/truth-batch-X.ts
import type { GameCard } from '../../types/cardTypes';

export const CORE_BATCH_TRUTH_X: GameCard[] = [
  {
    id: "unique-id",
    faction: "truth", // or "government"
    name: "Card Name",
    type: "MEDIA", // MEDIA, ZONE, ATTACK, DEFENSIVE
    rarity: "common", // common, uncommon, rare, legendary
    cost: 5, // Will be recalculated by v2.1E engine
    text: "Card effect description",
    flavorTruth: "Flavor text for truth perspective",
    flavorGov: "Flavor text for government perspective", 
    target: { scope: "global", count: 0 }, // or state targeting for ZONE
    effects: {
      truthDelta: 3,
      draw: 1,
      // ... other v2.1E effects
    }
  }
  // ... more cards
];
```

## 🔧 Manual Recovery (CLI)

### Rebuild Database
```bash
# Generate static cardDatabase.ts from all batch files
cd scripts
npm run rebuild-core
```

### Validate Database
```bash
# Check that we have 400 cards (200 truth + 200 government)
cd scripts  
npm run validate-core
```

## 🛡️ Safeguards

1. **Runtime Recovery**: Automatic batch collection on startup
2. **Fallback Protection**: 20 minimal cards prevent complete failure
3. **Validation Scripts**: Ensure 400 card count in CI/CD
4. **Enhanced Dashboard**: Shows real card counts with core/extension breakdown

## 📊 Expected Results

After recovery, you should see:
- **Enhanced Balancing Dashboard**: ~400 total cards (400 core + 300 extensions when enabled)
- **Gameplay**: Proper deck generation with full card variety  
- **Console Logs**: `[CORE RECOVERY] { total: 400, truth: 200, government: 200 }`

## 🚨 Troubleshooting

### "Only 20 cards loaded"
Your batch files aren't being found. Check:
- Files are in `src/data/core/**/*.ts` 
- Exports are named like `CORE_BATCH_TRUTH_X`
- Files follow the proper TypeScript format

### "Build errors"
- Ensure all cards have required fields (id, faction, name, type, rarity)
- Use proper v2.1E effect structure
- Check TypeScript syntax in batch files

### "Duplicates or validation fails"
```bash
cd scripts
npm run validate-core  # Shows specific issues
```

## 💡 Next Steps

1. **Add your 400 batch files** to `src/data/core/`
2. **Run validation** with `npm run validate-core` 
3. **Test gameplay** - you should now have full card variety
4. **Setup CI validation** to prevent regression

The system is now resilient and will automatically collect all your batch files!
