# Core Card Database Recovery System

This system automatically recovers the missing 400 core cards that were uploaded in batches.

## 🚀 Quick Recovery (Runtime)

The system is now active! The `src/data/core/index.ts` collector automatically gathers all batch files from `src/data/core/**/*.ts` and makes them available as `CARD_DATABASE`.

### Current Status
- ✅ Core collector active
- ✅ MVP repair + validation (`repairToMVP` → `validateCardMVP`)
- ✅ Fallback protection (20 minimal cards if batches fail)
- ✅ Enhanced Balancing Dashboard updated with proper counts

## 📂 Adding Batch Files

Place your batch files in `src/data/core/` with this structure (the canonical MVP card and engine types now live in `src/mvp/validator.ts`):

```typescript
// src/data/core/truth-batch-X.ts
import type { GameCard } from '@/rules/mvp';

export const CORE_BATCH_TRUTH_X: GameCard[] = [
  {
    id: 'unique-id',
    faction: 'truth', // or 'government'
    name: 'Card Name',
    type: 'MEDIA', // MEDIA, ZONE, ATTACK
    rarity: 'common', // common, uncommon, rare, legendary
    effects: {
      truthDelta: 1,
    },
    flavor: 'Optional shared flavor line',
    // For ZONE cards include: target: { scope: 'state', count: 1 }, effects: { pressureDelta: N }
  },
  // ... more cards
];
```
- `repairToMVP` fills in MVP costs automatically based on type/rarity.
- Skip legacy `text` fields—only the MVP effect whitelist is preserved.

## 🔧 Manual Recovery (CLI)

### Validate Database
```bash
# Check every MVP batch (core + extensions) for schema issues
npm run validate:mvp
```

## 🛡️ Safeguards

1. **Runtime Recovery**: Automatic batch collection on startup
2. **Fallback Protection**: 20 minimal cards prevent complete failure
3. **Validation Scripts**: Ensure MVP rules + counts in CI/CD (run `npm run validate:mvp`)
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
- Stick to MVP effects: `truthDelta`, `pressureDelta`, `ipDelta.opponent` (+ optional `discardOpponent`)
- Check TypeScript syntax in batch files

### "Duplicates or validation fails"
```bash
npm run validate:mvp  # Shows specific issues
```

## 💡 Next Steps

1. **Add your 400 batch files** to `src/data/core/`
2. **Run validation** with `npm run validate:mvp`
3. **Test gameplay** - you should now have full card variety
4. **Setup CI validation** to prevent regression

The system is now resilient and will automatically collect all your batch files!
