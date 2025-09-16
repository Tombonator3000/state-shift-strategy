// v2.1E Effect Whitelisting Utility
// Ensures only approved effects make it into the game

import type { CardEffects } from '@/types/cardTypes';

export function whitelistEffects(effects: any = {}): CardEffects {
  const whitelisted: CardEffects = {};
  
  // Basic effects
  if (typeof effects.truthDelta === 'number') {
    whitelisted.truthDelta = effects.truthDelta;
  }
  
  if (effects.ipDelta && typeof effects.ipDelta === 'object') {
    whitelisted.ipDelta = {};
    if (typeof effects.ipDelta.self === 'number') {
      whitelisted.ipDelta.self = effects.ipDelta.self;
    }
    if (typeof effects.ipDelta.opponent === 'number') {
      whitelisted.ipDelta.opponent = effects.ipDelta.opponent;
    }
  }
  
  if (typeof effects.draw === 'number') {
    whitelisted.draw = effects.draw;
  }
  
  if (typeof effects.discardOpponent === 'number') {
    whitelisted.discardOpponent = effects.discardOpponent;
  }
  
  if (typeof effects.pressureDelta === 'number') {
    whitelisted.pressureDelta = effects.pressureDelta;
  }
  
  if (typeof effects.zoneDefense === 'number') {
    whitelisted.zoneDefense = effects.zoneDefense;
  }
  
  // Conditional effects (recursive whitelisting)
  if (effects.conditional && typeof effects.conditional === 'object') {
    const c = effects.conditional;
    whitelisted.conditional = {};
    
    // Whitelisted conditions
    if (typeof c.ifTruthAtLeast === 'number') {
      whitelisted.conditional.ifTruthAtLeast = c.ifTruthAtLeast;
    }
    if (typeof c.ifZonesControlledAtLeast === 'number') {
      whitelisted.conditional.ifZonesControlledAtLeast = c.ifZonesControlledAtLeast;
    }
    if (typeof c.ifTargetStateIs === 'string') {
      whitelisted.conditional.ifTargetStateIs = c.ifTargetStateIs;
    }
    
    // Recursive whitelisting for then/else
    if (c.then) {
      whitelisted.conditional.then = whitelistEffects(c.then);
    }
    if (c.else) {
      whitelisted.conditional.else = whitelistEffects(c.else);
    }
  }
  
  return whitelisted;
}

// Validate that card conforms to v2.1E rules
export function validateCard(card: any): {
  isValid: boolean;
  errors: string[];
} {
  const errors: string[] = [];
  
  // Check faction casing
  if (!['truth', 'government'].includes(card.faction)) {
    errors.push(`Invalid faction: ${card.faction}. Must be 'truth' or 'government' (lowercase)`);
  }
  
  // Check card type whitelist
  if (!['MEDIA', 'ZONE', 'ATTACK', 'DEFENSIVE'].includes(card.type)) {
    errors.push(`Invalid type: ${card.type}. Must be MEDIA, ZONE, ATTACK, or DEFENSIVE`);
  }
  
  // Check ZONE targeting
  if (card.type === 'ZONE') {
    if (!card.target || card.target.scope !== 'state' || card.target.count !== 1) {
      errors.push('ZONE cards must have target: { scope: "state", count: 1 }');
    }
  }
  
  // Check cost minimums
  if (typeof card.cost !== 'number' || card.cost < 4) {
    errors.push('All cards must cost ≥ 4 IP');
  }
  
  if (card.rarity === 'legendary' && card.cost < 25) {
    errors.push('Legendary cards must cost ≥ 25 IP');
  }
  
  // Check flavor fields
  if (!('flavorTruth' in card) || !('flavorGov' in card)) {
    errors.push('Cards must have both flavorTruth and flavorGov fields');
  }
  
  return {
    isValid: errors.length === 0,
    errors
  };
}