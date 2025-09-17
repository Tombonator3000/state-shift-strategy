// v2.1E Effect-Based Cost Engine
// Replaces type-based costing with effect-based scoring

import type { CardEffects } from '@/types/cardTypes';

export function scoreEffectsV21E(effects: CardEffects): number {
  let score = 0;
  
  // Base cost for having any effect
  const hasAnyEffect = Object.keys(effects).length > 0;
  if (hasAnyEffect) {
    score += 3; // Base effect cost
  }
  
  // Truth effects (expensive due to win condition)
  if (effects.truthDelta) {
    if (effects.truthDelta > 0) {
      score += effects.truthDelta * 0.8; // Truth gain expensive
    } else {
      score += Math.abs(effects.truthDelta) * 0.6; // Truth loss slightly cheaper
    }
  }
  
  // IP effects
  if (effects.ipDelta) {
    if (effects.ipDelta.self) {
      score += effects.ipDelta.self > 0 ? effects.ipDelta.self * 0.5 : 0;
    }
    if (effects.ipDelta.opponent) {
      const opponent = effects.ipDelta.opponent;
      score += opponent > 0 ? opponent * 0.7 : 0;
    }
  }
  
  // Card advantage
  if (effects.draw) {
    score += effects.draw * 2.5; // Card draw is valuable
  }
  
  if (effects.discardOpponent) {
    score += effects.discardOpponent * 3; // Disruption is expensive
  }
  
  // Zone control
  if (effects.pressureDelta) {
    score += effects.pressureDelta * 1.2; // Zone pressure
  }
  
  if (effects.zoneDefense) {
    score += effects.zoneDefense * 1.5; // Defense is valuable
  }
  
  // Conditional effects (multiplier based on complexity)
  if (effects.conditional) {
    const baseEffectCost = scoreEffectsV21E(effects.conditional.then || {});
    const conditionalMultiplier = 1.3; // Conditional effects are more expensive
    score += baseEffectCost * conditionalMultiplier;
    
    if (effects.conditional.else) {
      score += scoreEffectsV21E(effects.conditional.else) * 0.8; // Else clause cheaper
    }
  }
  
  // Round to nearest integer, minimum 1
  return Math.max(1, Math.round(score));
}

export function calculateCardCost(effects: CardEffects, rarity?: string): number {
  const baseCost = scoreEffectsV21E(effects);
  const minCost = rarity === 'legendary' ? 25 : 4;
  return Math.max(minCost, baseCost);
}