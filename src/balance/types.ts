export type Faction = "Truth" | "Government";
export type CardType =
  | "MEDIA"
  | "ZONE"
  | "ATTACK"
  | "TECH"
  | "DEVELOPMENT"
  | "DEFENSIVE"
  | "INSTANT"
  | "LEGENDARY";
export type Rarity = "common" | "uncommon" | "rare" | "legendary";

export interface Card {
  id: string;
  name: string;
  type: CardType;
  faction?: Faction;
  rarity?: Rarity;
  cost: number;
  text?: string;
  flavor?: string;
  flavorTruth?: string;
  flavorGov?: string;
  target?: any;
  effects: Record<string, any>;
  art?: string; // optional, used by other exporters
}

export interface ExportRow {
  id: string;
  name: string;
  faction: string;
  type: string;
  rarity: string;
  cost: number;
  effects: string; // JSON-stringify
}
