import type { Card as PublicCard, CardType as PublicCardType, Faction as PublicFaction, Rarity as PublicRarity } from "@/types/public";

export type Faction = PublicFaction;
export type CardType = PublicCardType | "DEFENSIVE";
export type CardRarity = PublicRarity;

export interface GameCard extends PublicCard {
  text?: string;
  flavorTruth?: string;
  flavorGov?: string;
}
