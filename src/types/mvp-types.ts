// MVP Card System - 3 Types Only
// Strict type definitions for MVP phase

export type Faction = "truth" | "government";
export type CardType = "ATTACK" | "MEDIA" | "ZONE";
export type Rarity = "common" | "uncommon" | "rare" | "legendary";

// Strict effect types per card type
export interface EffectsATTACK {
  ipDelta: { opponent: number };  // > 0
  discardOpponent?: number;      // 0..2 (optional spice)
}

export interface EffectsMEDIA {
  truthDelta: number;            // can be ± (player chooses sign when playing)
}

export interface EffectsZONE {
  pressureDelta: number;         // > 0, requires targetStateId when playing
}

// MVP Card interface with strict effect typing
export interface MVPCard {
  id: string;
  name: string;
  faction: Faction;
  type: CardType;
  rarity: Rarity;
  cost: number;
  effects: EffectsATTACK | EffectsMEDIA | EffectsZONE;
  
  // Required fields for compatibility
  text: string;
  flavorTruth: string;
  flavorGov: string;
  
  // Optional fields
  artId?: string;
  flavor?: string;
  tags?: string[];
}

// Type guards for effect checking
export function isATTACKCard(card: MVPCard): card is MVPCard & { effects: EffectsATTACK } {
  return card.type === "ATTACK";
}

export function isMEDIACard(card: MVPCard): card is MVPCard & { effects: EffectsMEDIA } {
  return card.type === "MEDIA";
}

export function isZONECard(card: MVPCard): card is MVPCard & { effects: EffectsZONE } {
  return card.type === "ZONE";
}

// MVP Game State extensions
export interface MVPPlayerState {
  id: "P1" | "P2";
  faction: Faction;
  deck: MVPCard[];
  hand: MVPCard[];
  discard: MVPCard[];
  ip: number;
  states: string[];           // Controlled states
  playsThisTurn: number;     // 0..3 max
}

export interface MVPGameState {
  turn: number;
  truth: number;             // 0..100
  currentPlayer: "P1" | "P2";
  players: Record<"P1" | "P2", MVPPlayerState>;
  pressureByState: Record<string, { P1: number; P2: number }>;
  stateDefense: Record<string, number>;  // Predefined per state
}