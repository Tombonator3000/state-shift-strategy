// MVP Policy: Fixed Costs & Baseline Effects
// Simple cost table and effect baselines for easy balancing

import type { CardType, Rarity } from '@/types/mvp-types';

// Fixed cost table (IP) - Type × Rarity
export const MVP_COST_TABLE: Record<CardType, Record<Rarity, number>> = {
  ATTACK: {
    common: 2,
    uncommon: 3,
    rare: 4,
    legendary: 5
  },
  MEDIA: {
    common: 3,
    uncommon: 4,
    rare: 5,
    legendary: 6
  },
  ZONE: {
    common: 4,
    uncommon: 5,
    rare: 6,
    legendary: 7
  }
};

// Baseline effects (strength) by rarity
export const MVP_BASELINE_EFFECTS = {
  ATTACK: {
    common: { ipDelta: { opponent: 1 } },
    uncommon: { ipDelta: { opponent: 2 } },
    rare: { ipDelta: { opponent: 3 }, discardOpponent: 1 },      // Optional spice
    legendary: { ipDelta: { opponent: 4 }, discardOpponent: 2 }  // Optional spice
  },
  MEDIA: {
    common: { truthDelta: 1 },     // ±1 (player chooses sign)
    uncommon: { truthDelta: 2 },   // ±2
    rare: { truthDelta: 3 },       // ±3
    legendary: { truthDelta: 4 }   // ±4
  },
  ZONE: {
    common: { pressureDelta: 1 },
    uncommon: { pressureDelta: 2 },
    rare: { pressureDelta: 3 },
    legendary: { pressureDelta: 4 }
  }
} as const;

// Helper function to get cost for card
export function getMVPCost(type: CardType, rarity: Rarity): number {
  return MVP_COST_TABLE[type][rarity];
}

// Helper function to get baseline effects for card
export function getBaselineEffects(type: CardType, rarity: Rarity) {
  return MVP_BASELINE_EFFECTS[type][rarity];
}

// US State defense values (predefined)
export const STATE_DEFENSE: Record<string, number> = {
  // Major states - higher defense
  "CA": 4, "TX": 4, "FL": 4, "NY": 4,
  "PA": 3, "IL": 3, "OH": 3, "GA": 3, "NC": 3, "MI": 3,
  
  // Medium states
  "NJ": 3, "VA": 3, "WA": 3, "AZ": 3, "MA": 3, "TN": 3,
  "IN": 2, "MO": 2, "MD": 2, "WI": 2, "CO": 2, "MN": 2,
  
  // Smaller states
  "SC": 2, "AL": 2, "LA": 2, "KY": 2, "OR": 2, "OK": 2,
  "CT": 2, "UT": 2, "IA": 2, "NV": 2, "AR": 2, "MS": 2,
  "KS": 2, "NM": 2, "NE": 2, "WV": 2, "ID": 2, "HI": 2,
  "NH": 2, "ME": 2, "MT": 2, "RI": 2, "DE": 2, "SD": 2,
  "ND": 2, "AK": 2, "VT": 2, "WY": 2
};

// Victory conditions
export const MVP_VICTORY_CONDITIONS = {
  STATES_TO_WIN: 10,
  TRUTH_WIN_THRESHOLD: 90,      // Truth faction wins at ≥90%
  GOVERNMENT_WIN_THRESHOLD: 10, // Government wins at ≤10%
  IP_WIN_THRESHOLD: 200
};