export type PlayerID = "P1" | "P2";

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

export interface EngineState {
  phase: "IDLE" | "RESOLVING";
  hands: Record<PlayerID, Card[]>;
  ip: Record<PlayerID, number>;
  truthPercent: number;
  // ...rest of the state you already have
}
