# Shadow Government - Critical Fixes Plan

## Phase 1: Type System Consolidation (IMMEDIATE)
- [ ] Consolidate all GameCard interfaces into single source of truth
- [ ] Fix type mismatches between engine and UI systems  
- [ ] Ensure all cards have required fields (flavorTruth, flavorGov)
- [ ] Update validation system to catch type issues

## Phase 2: State Synchronization Fix (HIGH PRIORITY)
- [ ] Fix useRuleEngine state conversion logic
- [ ] Ensure engine state changes properly update UI
- [ ] Fix card removal from hand synchronization
- [ ] Fix played cards appearing in tray

## Phase 3: Effect System Repairs (HIGH PRIORITY)  
- [ ] Fix effect normalization gaps
- [ ] Ensure all card effects properly applied
- [ ] Fix conditional effect processing
- [ ] Add missing effect types to whitelist

## Phase 4: Integration Improvements (MEDIUM PRIORITY)
- [ ] Improve error handling in playCard flow
- [ ] Add fallback logic for engine failures
- [ ] Fix animation/state update race conditions
- [ ] Add better debugging and logging

## Phase 5: Performance & Cleanup (LOW PRIORITY)
- [ ] Remove dead code and unused imports
- [ ] Optimize state update patterns
- [ ] Clean up console warnings
- [ ] Add comprehensive error boundaries

## Files Requiring Changes:
- src/types/cardTypes.ts (consolidate interfaces)
- src/hooks/useRuleEngine.ts (fix conversion logic)  
- src/pages/Index.tsx (fix handlePlayCard)
- src/engine/playCard.ts (ensure hand removal)
- src/engine/effects.ts (fix effect application)
- src/systems/CardEffectValidator.ts (update validation)
- Multiple component files (type fixes)

## Testing Priority:
1. Card playing and hand removal
2. Card effects application  
3. Played cards tray display
4. State synchronization
5. Edge cases and error handling