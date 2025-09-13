export type PlayerID = "P1" | "P2" | "human" | "ai";

export interface Card {
  id: string;
  name: string;
  type: "MEDIA" | "ZONE" | "ATTACK" | "DEFENSIVE" | "DEVELOPMENT" | "INSTANT" | "LEGENDARY";
  cost: number;
  faction?: "Truth" | "Government";
  rarity?: "common" | "uncommon" | "rare" | "legendary";
  tags?: {
    defensive?: boolean;      // UI hint
    reactive?: boolean;       // Legendary exception (can play outside window)
    partialBlock?: boolean;   // UI hint
  };
  effects: any; // Our effect engine interprets this
}

export interface ClashState {
  open: boolean;
  attacker?: PlayerID;
  defender?: PlayerID;
  attackCard?: Card;
  defenseCard?: Card;
  expiresAt?: number;   // Date.now() + windowMs
  windowMs: number;     // default 4000
}

export interface EngineState {
  phase: "IDLE" | "REACTION_WINDOW_OPEN" | "RESOLVING" | "income" | "action" | "capture" | "event" | "newspaper" | "victory" | "ai_turn" | "card_presentation" | "clash_window" | "clash_resolving";
  clash: ClashState;
  hands: Record<PlayerID, Card[]>;
  ip: Record<PlayerID, number>;
  truthPercent: number;
  // ...rest of the state you already have
}
