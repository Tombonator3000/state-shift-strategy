// v2.1E Card Type System - Strict Enforcement
// This replaces the legacy mixed types with v2.1E compliant definitions

export type Faction = 'truth' | 'government'; // v2.1E: lowercase only
export type CardType = 'MEDIA' | 'ZONE' | 'ATTACK' | 'DEFENSIVE'; // v2.1E: 4 types only
export type CardRarity = 'common' | 'uncommon' | 'rare' | 'legendary';

// v2.1E Effect Whitelist - Only these effects are allowed in extensions
export interface CardEffects {
  truthDelta?: number;
  ipDelta?: { 
    self?: number; 
    opponent?: number; 
  };
  draw?: number;
  discardOpponent?: number;
  pressureDelta?: number;
  zoneDefense?: number;
  conditional?: {
    ifTruthAtLeast?: number;
    ifZonesControlledAtLeast?: number;
    ifTargetStateIs?: string;
    then?: CardEffects;
    else?: CardEffects;
  };
}

// v2.1E Target Requirements
export interface CardTarget {
  scope: 'global' | 'state' | 'controlled' | 'contested';
  count: number;
}

// v2.1E Compliant Card Interface
export interface GameCard {
  id: string;
  name: string;
  type: CardType;
  faction: Faction;
  rarity?: CardRarity;
  cost: number;
  
  // Text fields - both must exist for flavor routing
  text?: string;
  flavorTruth: string;  // Required
  flavorGov: string;    // Required
  
  // Gameplay
  effects?: CardEffects;
  target?: CardTarget;
  
  // Extension tracking
  extId?: string;
}