// MVP Policy - Fixed Costs & Baseline Effects
// Simple, balanced, easy to maintain

import type { CardType, Rarity, EffectsATTACK, EffectsMEDIA, EffectsZONE } from '@/types/mvp-types';

// Fixed cost table (IP cost per type × rarity)
export const COST_TABLE: Record<CardType, Record<Rarity, number>> = {
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

// Baseline effects (strength per rarity)
export const BASELINE_EFFECTS = {
  ATTACK: {
    common: { ipDelta: { opponent: 1 } } as EffectsATTACK,
    uncommon: { ipDelta: { opponent: 2 } } as EffectsATTACK,
    rare: { ipDelta: { opponent: 3 }, discardOpponent: 1 } as EffectsATTACK,
    legendary: { ipDelta: { opponent: 4 }, discardOpponent: 2 } as EffectsATTACK
  },
  MEDIA: {
    common: { truthDelta: 1 } as EffectsMEDIA,
    uncommon: { truthDelta: 2 } as EffectsMEDIA,
    rare: { truthDelta: 3 } as EffectsMEDIA,
    legendary: { truthDelta: 4 } as EffectsMEDIA
  },
  ZONE: {
    common: { pressureDelta: 1 } as EffectsZONE,
    uncommon: { pressureDelta: 2 } as EffectsZONE,
    rare: { pressureDelta: 3 } as EffectsZONE,
    legendary: { pressureDelta: 4 } as EffectsZONE
  }
};

// Effect whitelists per type (only these keys allowed)
export const TYPE_WHITELIST: Record<CardType, string[]> = {
  ATTACK: ['ipDelta', 'discardOpponent'],
  MEDIA: ['truthDelta'],
  ZONE: ['pressureDelta']
};

// Victory conditions
export const VICTORY_CONDITIONS = {
  STATES_TO_WIN: 10,
  TRUTH_THRESHOLD: { truth: 90, government: 10 },
  IP_THRESHOLD: 200
};

// Game mechanics constants
export const GAME_CONSTANTS = {
  BASE_IP_PER_TURN: 5,
  IP_PER_CONTROLLED_STATE: 1,
  MAX_PLAYS_PER_TURN: 3,
  HAND_SIZE_LIMIT: 5,
  FREE_DISCARDS_PER_TURN: 1,
  EXTRA_DISCARD_COST: 1 // IP per extra discard
};

// State defense values (predefined)
export const STATE_DEFENSE: Record<string, number> = {
  // High-value strategic states
  'CA': 4, 'TX': 4, 'NY': 4, 'FL': 4,
  // Medium states  
  'PA': 3, 'IL': 3, 'OH': 3, 'GA': 3, 'NC': 3, 'MI': 3,
  // Standard states
  'WA': 2, 'OR': 2, 'NV': 2, 'AZ': 2, 'UT': 2, 'CO': 2, 'NM': 2,
  'WY': 2, 'MT': 2, 'ND': 2, 'SD': 2, 'NE': 2, 'KS': 2, 'OK': 2,
  'AR': 2, 'LA': 2, 'MS': 2, 'AL': 2, 'TN': 2, 'KY': 2, 'IN': 2,
  'WI': 2, 'MN': 2, 'IA': 2, 'MO': 2, 'VA': 2, 'WV': 2, 'MD': 2,
  'DE': 2, 'NJ': 2, 'CT': 2, 'RI': 2, 'MA': 2, 'VT': 2, 'NH': 2,
  'ME': 2, 'SC': 2, 'ID': 2, 'AK': 2, 'HI': 2
};