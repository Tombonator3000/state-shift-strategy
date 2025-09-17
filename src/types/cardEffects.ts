// Card Effect System - Type Definitions
// This file defines the unified schema for card effects

export type EffectConditional = {
  // Condition triggers
  ifTruthAtLeast?: number;
  ifTruthAtMost?: number;
  ifZonesControlledAtLeast?: number;
  ifZonesControlledAtMost?: number;
  ifIPAtLeast?: number;
  ifIPAtMost?: number;
  ifOpponentIPAtLeast?: number;
  ifOpponentIPAtMost?: number;
  ifHandSizeAtLeast?: number;
  ifHandSizeAtMost?: number;
  ifRoundAtLeast?: number;
  ifTargetStateIs?: string;
  
  // Effects to apply if condition is met
  then?: CardEffects;
  // Effects to apply if condition is not met
  else?: CardEffects;
};

export type CardEffects = {
  // Resource changes
  truthDelta?: number;              // +/- Truth percentage
  ipDelta?: {                       // IP changes
    self?: number;                  // Player IP change
    opponent?: number;              // Opponent IP change
  };
  
  // Card draw/discard
  draw?: number;                    // Cards to draw
  discardSelf?: number;             // Cards player must discard
  discardOpponent?: number;         // Cards opponent must discard
  
  // Zone/state effects
  pressureDelta?: number;           // Pressure to add to target state
  zoneDefense?: number;             // Defense bonus to controlled states
  captureBonus?: number;            // Extra IP when capturing states
  
  // Combat
  damage?: {                        // Direct damage
    min?: number;                   // Minimum damage
    max?: number;                   // Maximum damage
    fixed?: number;                 // Fixed damage amount
  };
  
  // Conditional effects
  conditional?: EffectConditional | EffectConditional[];
  
  // Duration and persistence
  duration?: "instant" | "thisTurn" | "nextTurn" | "permanent";
  
  // Tags for categorization and interaction
  tags?: string[];
  
  // Special mechanics
  repeatable?: boolean;             // Can be played multiple times per turn
  requiresTarget?: boolean;         // Requires state selection
  
  // Resource generation
  incomeBonus?: {                   // Bonus income
    ip?: number;                    // IP per turn
    duration?: number;              // How many turns
  };
};

// Re-export v2.1E types for backward compatibility
export type { GameCard as Card, Faction, CardType } from '@/rules/mvp';

// Effect processing result
export interface EffectResult {
  truthDelta: number;
  ipDelta: { self: number; opponent: number; };
  cardsToDraw: number;
  cardsToDiscardSelf: number;
  cardsToDiscardOpponent: number;
  pressureDelta: number;
  damage: number;
  zoneDefenseBonus: number;
  captureBonus: number;
  incomeEffects: Array<{
    type: 'ip';
    amount: number;
    duration: number;
  }>;
  
  // Metadata
  requiresTarget: boolean;
  appliedConditionals: string[];
  logMessages: string[];
}

// Ongoing effect tracking
export interface OngoingEffect {
  id: string;
  cardId: string;
  cardName: string;
  effects: CardEffects;
  duration: "thisTurn" | "nextTurn" | "permanent";
  turnsRemaining?: number;
  appliedBy: 'player' | 'ai';
}

// Game state extension for ongoing effects
export interface EffectGameState {
  ongoingEffects: OngoingEffect[];
  effectHistory: Array<{
    cardId: string;
    cardName: string;
    effects: EffectResult;
    turn: number;
    appliedBy: 'player' | 'ai';
  }>;
}