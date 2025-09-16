// MVP Core Types - Paranoid Times Simplified System
// Only 3 card types, fixed costs, baseline effects

export type Faction = "truth" | "government";
export type CardType = "ATTACK" | "MEDIA" | "ZONE";
export type Rarity = "common" | "uncommon" | "rare" | "legendary";

// Type-specific effect interfaces (strict whitelist)
export type EffectsATTACK = {
  ipDelta: { opponent: number };     // > 0, takes IP from opponent
  discardOpponent?: number;          // 0..2 optional spice
};

export type EffectsMEDIA = {
  truthDelta: number;                // can be ± (player chooses sign when playing)
};

export type EffectsZONE = {
  pressureDelta: number;             // > 0, requires targetStateId when played
};

// Main card interface - Compatible with GameCard
export type MVPCard = {
  id: string;
  name: string;
  faction: Faction;
  type: CardType;
  rarity: Rarity;
  cost: number;                      // set from cost table
  effects: EffectsATTACK | EffectsMEDIA | EffectsZONE;
  
  // GameCard compatibility fields
  text: string;                      // main card text describing effects
  flavorTruth: string;              // truth faction flavor text
  flavorGov: string;                // government faction flavor text
  
  // Optional fields
  target?: { scope: 'global' | 'state' | 'controlled' | 'contested'; count: number };
  artId?: string;
  tags?: string[];
  extId?: string;
};

// Game state for MVP
export type MVPGameState = {
  turn: number;
  truth: number;                     // 0..100
  currentPlayer: "P1" | "P2";
  players: Record<"P1" | "P2", MVPPlayerState>;
  pressureByState: Record<string, { P1: number; P2: number }>;
  stateDefense: Record<string, number>;  // predefined per state
  playsThisTurn: number;            // 0..3 max plays per turn
  skipAIActionNext?: boolean;
};

export type MVPPlayerState = {
  id: "P1" | "P2";
  faction: Faction;
  deck: MVPCard[];
  hand: MVPCard[];
  discard: MVPCard[];
  ip: number;
  states: string[];                 // controlled states (USPS codes)
  freeDiscardsLeft: number;         // 1 free discard per turn
};