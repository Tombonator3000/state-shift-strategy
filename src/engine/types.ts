export type PlayerID = "P1" | "P2";
export type Faction = "truth" | "government";
export type CardType = "MEDIA" | "ZONE" | "ATTACK" | "DEFENSIVE" | "TECH" | "DEVELOPMENT" | "INSTANT" | "LEGENDARY";

export interface Card {
  id: string;
  name: string;
  type: CardType;
  cost: number;
  faction?: Faction;
  rarity?: "common" | "uncommon" | "rare" | "legendary";
  tags?: {
    defensive?: boolean;
    reactive?: boolean;
    partialBlock?: boolean;
  };
  // Can be flat object OR JSON-string (list-based mini-language)
  effects: any;
}

export interface PlayerState {
  id: "P1" | "P2";
  faction: Faction;
  deck: Card[];
  hand: Card[];
  discard: Card[];
  ip: number;
  zones: string[];
  zoneDefenseBonus: number;
  pressureTotal?: number;
  // persistent modifiers/income
  costMods?: { zone?: number; media?: number };
  passiveIncome?: number;
}

export interface GameState {
  turn: number;
  truth: number; // 0..100
  currentPlayer: "P1" | "P2";
  players: Record<"P1" | "P2", PlayerState>;
  // NEW: trykk per stat per side
  pressureByState: Record<string, { P1: number; P2: number }>;
  skipAIActionNext?: boolean;
  skipNextAction?: { P1: number; P2: number };
  // optional: map med statnavn/aliaser -> id
  stateAliases?: Record<string, string>; // "Minnesota"|"MN" -> "MN"
}

export interface Context {
  state: GameState;
  rng?: () => number;
  log?: (m: string) => void;
  // Reaction hook – UI sets this to open modal when needed
  openReaction?: (
    attackCard: Card,
    attacker: "P1" | "P2",
    defender: "P1" | "P2",
    targetStateId?: string
  ) => void;
  // Turn flags (immune/block) – per side
  turnFlags?: Partial<Record<"P1" | "P2", { immune?: boolean; blockAttack?: boolean }>>;
}

export interface ClashState {
  open: boolean;
  attacker?: PlayerID;
  defender?: PlayerID;
  attackCard?: Card;
  defenseCard?: Card;
  expiresAt?: number;
  windowMs: number;
}

export interface EngineState {
  phase: "IDLE" | "REACTION_WINDOW_OPEN" | "RESOLVING";
  clash: ClashState;
  hands: Record<PlayerID, Card[]>;
  ip: Record<PlayerID, number>;
  truthPercent: number;
  // ...rest of the state you already have
}
