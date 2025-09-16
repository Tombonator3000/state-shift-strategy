import type { CardType, Rarity } from "./types";

export const CARD_TYPES: CardType[] = ["ATTACK", "MEDIA", "ZONE"];
export const RARITIES: Rarity[] = ["common", "uncommon", "rare", "legendary"];

export const MVP_COST_TABLE: Record<CardType, Record<Rarity, number>> = {
  ATTACK: {
    common: 2,
    uncommon: 3,
    rare: 4,
    legendary: 5,
  },
  MEDIA: {
    common: 3,
    uncommon: 4,
    rare: 5,
    legendary: 6,
  },
  ZONE: {
    common: 4,
    uncommon: 5,
    rare: 6,
    legendary: 7,
  },
};

export const MVP_EFFECT_TABLE = {
  ATTACK: {
    common: 1,
    uncommon: 2,
    rare: 3,
    legendary: 4,
  },
  MEDIA: {
    common: 1,
    uncommon: 2,
    rare: 3,
    legendary: 4,
  },
  ZONE: {
    common: 1,
    uncommon: 2,
    rare: 3,
    legendary: 4,
  },
} as const;

export const MAX_PLAYS_PER_TURN = 3;
export const HAND_LIMIT = 5;
export const BASE_INCOME = 5;
export const EXTRA_DISCARD_COST = 1;
export const WIN_STATES_THRESHOLD = 10;
export const WIN_IP_THRESHOLD = 200;
export const WIN_TRUTH_TRUTH = 90;
export const WIN_TRUTH_GOV = 10;
