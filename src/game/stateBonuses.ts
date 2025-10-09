import type { CardEffects } from '@/rules/mvp';
import type { GameState, ActiveStateBonus, StateRoundEventLogEntry } from '@/hooks/gameStateTypes';
import type { GameEvent } from '@/data/eventDatabase';

/**
 * State-Specific Card Bonuses
 * Cards get additional effects when played in thematically appropriate states.
 */

export interface AssignStateBonusesResult {
  bonuses: Record<string, ActiveStateBonus | null>;
  roundEvents: Record<string, StateRoundEventLogEntry[]>;
  pressureAdjustments: Record<string, { player: number; ai: number }>;
  playerTruthDelta: number;
  aiTruthDelta: number;
  playerIpDelta: number;
  aiIpDelta: number;
  logs: string[];
  newspaperEvents: GameEvent[];
  debug?: Record<string, unknown>;
}

export interface StateBonusConfig {
  stateIds: string[]; // State abbreviations like 'NM', 'NV', 'TX'
  cardPatterns: {
    nameIncludes?: string[];
    tagsAny?: string[];
    cardIds?: string[];
  };
  bonus: CardEffects;
  label: string;
}

export const STATE_BONUS_CONFIGS: StateBonusConfig[] = [
  {
    stateIds: ['NM'],
    cardPatterns: {
      nameIncludes: ['roswell', 'alien', 'ufo'],
      tagsAny: ['roswell', 'alien', 'ufo'],
    },
    bonus: {
      pressureDelta: 1,
      truthDelta: 1,
    },
    label: 'Roswell Resonance',
  },
  {
    stateIds: ['NV'],
    cardPatterns: {
      nameIncludes: ['area 51', 'area51', 'groom lake'],
      tagsAny: ['area-51', 'nevada-test-site'],
    },
    bonus: {
      truthDelta: 2,
    },
    label: 'Nevada Hotspot',
  },
  {
    stateIds: ['FL'],
    cardPatterns: {
      nameIncludes: ['florida man', 'florida'],
      tagsAny: ['florida', 'florida-man'],
    },
    bonus: {
      ipDelta: { self: 1 },
      pressureDelta: 1,
    },
    label: 'Florida Chaos Multiplier',
  },
  {
    stateIds: ['TN'],
    cardPatterns: {
      nameIncludes: ['elvis'],
      tagsAny: ['elvis', 'memphis'],
    },
    bonus: {
      truthDelta: 1,
    },
    label: 'Memphis Magic',
  },
  {
    stateIds: ['TX'],
    cardPatterns: {
      nameIncludes: ['chupacabra'],
      tagsAny: ['chupacabra', 'texas'],
    },
    bonus: {
      pressureDelta: 1,
    },
    label: 'Texas Legend',
  },
  {
    stateIds: ['WA'],
    cardPatterns: {
      nameIncludes: ['bigfoot', 'sasquatch'],
      tagsAny: ['bigfoot', 'sasquatch', 'pacific-northwest'],
    },
    bonus: {
      truthDelta: 1,
    },
    label: 'Pacific Northwest Mystery',
  },
  {
    stateIds: ['WV'],
    cardPatterns: {
      nameIncludes: ['mothman'],
      tagsAny: ['mothman', 'point-pleasant'],
    },
    bonus: {
      truthDelta: 1,
      pressureDelta: 1,
    },
    label: 'Mothman Country',
  },
  {
    stateIds: ['NJ'],
    cardPatterns: {
      nameIncludes: ['jersey devil'],
      tagsAny: ['jersey-devil', 'pine-barrens'],
    },
    bonus: {
      pressureDelta: 1,
    },
    label: 'Pine Barrens Terror',
  },
  {
    stateIds: ['DC'],
    cardPatterns: {
      nameIncludes: ['conspiracy', 'cover-up', 'classified', 'government'],
      tagsAny: ['conspiracy', 'cover-up', 'classified', 'leak'],
    },
    bonus: {
      truthDelta: 1,
    },
    label: 'Capital Exposure',
  },
  {
    stateIds: ['AZ'],
    cardPatterns: {
      nameIncludes: ['phoenix lights', 'desert'],
      tagsAny: ['phoenix-lights', 'arizona'],
    },
    bonus: {
      truthDelta: 1,
    },
    label: 'Phoenix Phenomenon',
  },
];

/**
 * Check if a card qualifies for state bonuses
 */
export function checkStateBonuses(
  cardName: string,
  cardTags: string[] = [],
  cardId: string,
  targetStateId: string | null,
): { bonus: CardEffects; label: string } | null {
  if (!targetStateId) return null;

  for (const config of STATE_BONUS_CONFIGS) {
    if (!config.stateIds.includes(targetStateId)) continue;

    const { nameIncludes, tagsAny, cardIds } = config.cardPatterns;

    // Check card ID match
    if (cardIds?.includes(cardId)) {
      return { bonus: config.bonus, label: config.label };
    }

    // Check name patterns
    if (nameIncludes) {
      const nameLower = cardName.toLowerCase();
      const matches = nameIncludes.some(pattern => 
        nameLower.includes(pattern.toLowerCase())
      );
      if (matches) {
        return { bonus: config.bonus, label: config.label };
      }
    }

    // Check tag patterns
    if (tagsAny && cardTags.length > 0) {
      const tagLower = cardTags.map(t => t.toLowerCase());
      const matches = tagsAny.some(pattern => 
        tagLower.includes(pattern.toLowerCase())
      );
      if (matches) {
        return { bonus: config.bonus, label: config.label };
      }
    }
  }

  return null;
}

/**
 * Assign state bonuses for the current round
 * This is a placeholder implementation - the real logic would evaluate
 * state ownership, round progression, and bonus eligibility
 */
export function assignStateBonuses(
  state: GameState,
): AssignStateBonusesResult {
  // Placeholder implementation
  return {
    bonuses: {},
    roundEvents: {},
    pressureAdjustments: {},
    playerTruthDelta: 0,
    aiTruthDelta: 0,
    playerIpDelta: 0,
    aiIpDelta: 0,
    logs: [],
    newspaperEvents: [],
  };
}

export default STATE_BONUS_CONFIGS;
