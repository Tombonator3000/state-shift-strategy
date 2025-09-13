// Enhanced Card Effects Schema - Supporting Complex Interactions
// Extends the base CardEffects to support missing functionality

import { CardEffects, EffectConditional } from './cardEffects';

export type TriggerCondition = {
  // Opponent actions
  opponentPlaysMedia?: {
    targetingThisState?: boolean;
    anyTarget?: boolean;
    cost?: { min?: number; max?: number; };
  };
  
  // State-based triggers  
  playedOnThisState?: boolean;
  adjacentStateChanged?: boolean;
  
  // Turn-based triggers
  startOfTurn?: boolean;
  endOfTurn?: boolean;
  startOfOpponentTurn?: boolean;
  
  // Game state triggers
  statesCaptured?: { min?: number; max?: number; };
  truthReaches?: { value: number; direction: 'above' | 'below'; };
};

export type MovementEffect = {
  moveDefense?: {
    from: 'thisState' | 'anyControlled' | 'specific';
    to: 'thisState' | 'anyControlled' | 'adjacent' | 'specific';
    amount: number;
    fromStateId?: string;
    toStateId?: string;
  };
  
  relocateCard?: {
    from: 'hand' | 'discard' | 'deck';
    to: 'hand' | 'discard' | 'deck' | 'play';
    cardType?: string;
  };
};

export type StateTargetingEffect = {
  adjacentStates?: {
    effect: CardEffects;
    includeThis?: boolean;
  };
  
  connectedStates?: {
    effect: CardEffects;
    maxDistance?: number;
  };
  
  allControlledStates?: {
    effect: CardEffects;
    excludeThis?: boolean;
  };
};

export type ReplacementEffect = {
  replaces?: {
    trigger: string;
    with: CardEffects;
    duration?: 'thisTurn' | 'nextTurn' | 'permanent';
  };
  
  modifyCosts?: {
    cardType?: string;
    costDelta: number;
    duration?: 'thisTurn' | 'nextTurn' | 'permanent';
  };
};

export type DeckManipulation = {
  searchDeck?: {
    cardType?: string;
    count: number;
    putInHand?: boolean;
    shuffle?: boolean;
  };
  
  deckToBottom?: {
    count: number;
    fromTop?: boolean;
  };
  
  shuffleDeck?: boolean;
};

export type HandSizeEffect = {
  modifyHandSize?: {
    delta: number;
    duration?: 'thisTurn' | 'nextTurn' | 'permanent';
  };
  
  maxHandSize?: {
    value: number;
    duration?: 'thisTurn' | 'nextTurn' | 'permanent';
  };
};

// Enhanced card effects combining all functionality
export interface EnhancedCardEffects extends CardEffects {
  // Triggered effects
  triggers?: Array<{
    condition: TriggerCondition;
    effect: CardEffects;
    once?: boolean;
  }>;
  
  // Movement and relocation
  movement?: MovementEffect;
  
  // State-based effects
  stateTargeting?: StateTargetingEffect;
  
  // Replacement effects
  replacement?: ReplacementEffect;
  
  // Deck manipulation
  deckManipulation?: DeckManipulation;
  
  // Hand size effects
  handSize?: HandSizeEffect;
  
  // Complex conditions with enhanced logic
  enhancedConditional?: Array<{
    condition: EffectConditional & {
      // Enhanced condition checks
      opponentControls?: { min?: number; max?: number; states?: string[]; };
      playerControls?: { min?: number; max?: number; states?: string[]; };
      cardsInHand?: { player?: number; opponent?: number; };
      truthInRange?: { min: number; max: number; };
    };
    then: EnhancedCardEffects;
    else?: EnhancedCardEffects;
  }>;
  
  // Percentage-based truth changes (for legacy compatibility)
  truthPercentDelta?: number;
}

// Enhanced card interface
export interface EnhancedCard {
  id: string;
  name: string;
  type: "MEDIA" | "ZONE" | "ATTACK" | "DEFENSIVE";
  faction?: "Truth" | "Government";
  rarity?: "common" | "uncommon" | "rare" | "legendary";
  cost: number;
  
  // Text fields
  text?: string;
  flavorTruth?: string;
  flavorGov?: string;
  
  // Enhanced effects
  effects?: EnhancedCardEffects;
  enhancedEffects?: EnhancedCardEffects; // For migration
  
  // Targeting
  target?: {
    scope: "global" | "self" | "opponent" | "state" | "controlled" | "contested" | "adjacent";
    count?: number;
    optional?: boolean;
  };
}

// Processing context for enhanced effects
export interface EnhancedGameContext {
  // Current state
  truth: number;
  ip: number;
  aiIP: number;
  hand: any[];
  aiHand: any[];
  controlledStates: string[];
  aiControlledStates: string[];
  round: number;
  turn: number;
  faction: 'truth' | 'government';
  
  // Additional context for enhanced effects
  targetState?: string;
  adjacentStates?: string[];
  lastPlayedCard?: any;
  triggeredBy?: {
    cardId: string;
    player: 'player' | 'ai';
    action: string;
  };
}