# Truth Mechanics Audit Report

## Executive Summary
Complete audit of truth mechanics in Paranoid Times game. All systems verified to follow correct faction-based truth adjustments.

## Core Rules ✅
- **Truth Faction**: All actions give POSITIVE truth (+)
- **Government Faction**: All actions give NEGATIVE truth (-)

## Systems Audited

### 1. MEDIA Cards (VERIFIED ✅)
**File**: `src/mvp/media.ts` line 35-36
```typescript
const sign = acting.faction === 'truth' ? 1 : -1;
return sign * base;
```
- Truth faction: multiplies by +1 → positive truth
- Government faction: multiplies by -1 → negative truth
- **Status**: CORRECT

### 2. State Bonuses (VERIFIED ✅)
**File**: `src/game/stateBonuses.ts` line 126, 158
```typescript
truthDelta: ownerFaction === 'government' ? -truthDeltaBase : truthDeltaBase
```
- Government owner: negates truth delta → negative truth
- Truth owner: keeps positive truth delta
- **Status**: CORRECT

### 3. Paranormal Hotspots (VERIFIED ✅)
**File**: `src/systems/paranormalHotspots.ts` line 394-396
```typescript
const truthDelta = winnerFaction === 'truth'
  ? normalizedFinalReward
  : -normalizedFinalReward;
```
- Truth winner: positive reward
- Government winner: negative reward
- **Status**: CORRECT

### 4. Secret Agendas (VERIFIED ✅)
**File**: `src/hooks/useGameState.ts` line 1802
```typescript
const signedMagnitude = faction === 'truth' ? magnitude : -magnitude;
```
- Truth faction: positive reward
- Government faction: negative reward
- **Status**: CORRECT

### 5. State Bonus Ownership Transfer (VERIFIED ✅)
**File**: `src/hooks/useGameState.ts` line 685-696
```typescript
const resolveOwnerFaction = (owner, playerFaction) => {
  if (owner === 'player') return playerFaction;
  if (owner === 'ai') return playerFaction === 'truth' ? 'government' : 'truth';
  return null;
};
```
- Player-owned states: use player's faction
- AI-owned states: use opposite faction (correctly flips)
- **Status**: CORRECT

### 6. Combo System Truth Rewards (VERIFIED ✅)
**File**: `src/game/comboEngine.ts` line 560
```typescript
const signedTruthDelta = faction === 'government' ? -truthReward : truthReward;
```
- Government: negates reward
- Truth: keeps positive reward
- **Status**: CORRECT

## Improvements Made

### Added Debug Logging
Added audit logging to key systems for debugging:
```typescript
if (typeof window !== 'undefined' && (window as any).DEBUG_TRUTH) {
  console.log('[TRUTH AUDIT] ...');
}
```

To enable debug mode in browser console:
```javascript
window.DEBUG_TRUTH = true;
```

### Fixed Build Errors
1. Exported missing `EditorId` and `EditorDef` types from `EditorsEngine.ts`
2. Added defensive comments marking critical truth logic

## Testing Recommendations

### Manual Testing Steps
1. **As Truth Faction**:
   - Play MEDIA cards → Should increase truth meter
   - Capture states with bonuses → Should increase truth
   - Trigger hotspots → Should increase truth
   
2. **As Government Faction**:
   - Play MEDIA cards → Should decrease truth meter
   - Capture states with bonuses → Should decrease truth
   - Trigger hotspots → Should decrease truth

### Enable Debug Mode
```javascript
// In browser console
window.DEBUG_TRUTH = true;
```
Then play cards and watch console for audit logs showing faction, base values, and final deltas.

## Conclusion
All truth mechanics are correctly implemented. Truth faction gets positive truth, Government faction gets negative truth across all systems:
- ✅ MEDIA cards
- ✅ State bonuses
- ✅ Paranormal hotspots
- ✅ Secret agendas
- ✅ Combo rewards
- ✅ State ownership transfers

The game correctly follows the rule: "Government skal gi minus truth til trurhseekers, og pluss truth til Government" by inverting all truth deltas based on faction.
