// v2.1E Card Type System - Strict Enforcement
// This replaces the legacy mixed types with v2.1E compliant definitions

export type Faction = 'truth' | 'government' | 'Truth' | 'Government'; // Allow both cases during transition
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
  discardRandom?: number; // Legacy support
  pressureDelta?: number | { state: string; who?: 'player' | 'ai' | 'self' | 'opponent'; v: number; }; // Support both formats
  zoneDefense?: number;
  reduceFactor?: number; // For partial blocking defensive cards (0-1)
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

// v2.1E Compliant Card Interface - SINGLE SOURCE OF TRUTH
export interface GameCard {
  id: string;
  name: string;
  type: CardType;
  faction: Faction;
  rarity: CardRarity; // Required for proper validation
  cost: number;
  
  // Text fields - ensure both exist with fallbacks
  text: string;         // Main card text
  flavorTruth: string;  // Required - Truth faction flavor
  flavorGov: string;    // Required - Government faction flavor
  
  // Gameplay
  effects?: CardEffects;
  target?: CardTarget;
  
  // Extension tracking
  extId?: string;
}