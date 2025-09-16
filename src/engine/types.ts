export type Faction = "truth" | "government";
export type CardType = "ATTACK" | "MEDIA" | "ZONE";
export type Rarity = "common" | "uncommon" | "rare" | "legendary";

export type PlayerID = "P1" | "P2";

export type EffectsATTACK = {
  ipDelta: { opponent: number };
  discardOpponent?: number;
};

export type EffectsMEDIA = {
  truthDelta: number;
};

export type EffectsZONE = {
  pressureDelta: number;
};

export type Card = {
  id: string;
  name: string;
  faction: Faction;
  type: CardType;
  rarity: Rarity;
  cost: number;
  effects: EffectsATTACK | EffectsMEDIA | EffectsZONE;
  artId?: string;
  flavor?: string;
  tags?: string[];
};

export type PlayerState = {
  id: PlayerID;
  faction: Faction;
  deck: Card[];
  hand: Card[];
  discard: Card[];
  ip: number;
  states: string[];
};

export type GameState = {
  turn: number;
  currentPlayer: PlayerID;
  truth: number;
  players: Record<PlayerID, PlayerState>;
  pressureByState: Record<string, { P1: number; P2: number }>;
  stateDefense: Record<string, number>;
  playsThisTurn: number;
};
