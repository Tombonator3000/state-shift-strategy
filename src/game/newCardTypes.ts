import type { CardEffects } from '@/rules/mvp';

/**
 * New Card Type Definitions
 * HYBRID: Cost dynamically adjusted based on game state
 * TRAP: Set face-down, triggers when opponent acts
 * PERSISTENT: Effects last multiple turns
 */

export type ExtendedCardType = 'HYBRID' | 'TRAP' | 'PERSISTENT';

export interface HybridCardCondition {
  type: 'truth' | 'states_controlled' | 'ip' | 'turn';
  operator: '>=' | '<=' | '==' | '>' | '<';
  value: number;
  costModifier: number; // Can be negative for discounts
  label: string;
}

export interface HybridCardConfig {
  baseCost: number;
  conditions: HybridCardCondition[];
}

export interface TrapCardConfig {
  triggerOn: 'opponent_attack' | 'opponent_media' | 'opponent_zone' | 'state_capture' | 'any_card';
  effects: CardEffects;
  label: string;
  revealMessage: string;
}

export interface PersistentCardConfig {
  duration: number; // Number of turns
  perTurnEffect: CardEffects;
  onExpire?: CardEffects;
  label: string;
  icon?: string;
}

/**
 * Example Hybrid Cards
 */
export const HYBRID_CARD_EXAMPLES = {
  leaked_memo: {
    baseCost: 4,
    conditions: [
      {
        type: 'truth' as const,
        operator: '>=' as const,
        value: 60,
        costModifier: -2,
        label: 'Reduced when Truth > 60%',
      },
    ],
  },
  emergency_broadcast: {
    baseCost: 5,
    conditions: [
      {
        type: 'states_controlled' as const,
        operator: '<' as const,
        value: 3,
        costModifier: -5,
        label: 'Free when controlling < 3 states',
      },
    ],
  },
  viral_video: {
    baseCost: 3,
    conditions: [
      {
        type: 'turn' as const,
        operator: '>=' as const,
        value: 5,
        costModifier: -1,
        label: 'Cost reduces after turn 5',
      },
    ],
  },
};

/**
 * Example Trap Cards
 */
export const TRAP_CARD_EXAMPLES = {
  counter_intelligence: {
    triggerOn: 'opponent_attack' as const,
    effects: {
      ipDelta: { self: 1, opponent: -1 },
    },
    label: 'Counter-Intelligence',
    revealMessage: 'Trap triggered! Stealing IP from attack...',
  },
  false_flag: {
    triggerOn: 'state_capture' as const,
    effects: {
      truthDelta: 2,
    },
    label: 'False Flag Operation',
    revealMessage: 'Trap activated! State capture backfires...',
  },
  disinformation: {
    triggerOn: 'opponent_media' as const,
    effects: {
      truthDelta: 0, // Special: nullifies opponent media
    },
    label: 'Disinformation Campaign',
    revealMessage: 'Trap sprung! Media play has no effect...',
  },
};

/**
 * Example Persistent Effect Cards
 */
export const PERSISTENT_CARD_EXAMPLES = {
  chemtrail_protocol: {
    duration: 3,
    perTurnEffect: {
      truthDelta: -1,
    },
    label: 'Chemtrail Protocol',
    icon: '✈️',
  },
  disclosure_movement: {
    duration: 2,
    perTurnEffect: {
      truthDelta: 1,
    },
    label: 'Disclosure Movement',
    icon: '📢',
  },
  media_blackout: {
    duration: 1,
    perTurnEffect: {
      // Special: blocks MEDIA cards
    },
    label: 'Media Blackout',
    icon: '📵',
  },
  ongoing_investigation: {
    duration: 3,
    perTurnEffect: {
      ipDelta: { self: 1 },
    },
    onExpire: {
      truthDelta: 2,
    },
    label: 'Ongoing Investigation',
    icon: '🔍',
  },
};

/**
 * Calculate actual cost for a HYBRID card based on game state
 */
export function calculateHybridCost(
  config: HybridCardConfig,
  gameState: {
    truth: number;
    statesControlled: number;
    ip: number;
    turn: number;
  },
): { cost: number; appliedConditions: string[] } {
  let cost = config.baseCost;
  const appliedConditions: string[] = [];

  for (const condition of config.conditions) {
    let stateValue: number;
    
    switch (condition.type) {
      case 'truth':
        stateValue = gameState.truth;
        break;
      case 'states_controlled':
        stateValue = gameState.statesControlled;
        break;
      case 'ip':
        stateValue = gameState.ip;
        break;
      case 'turn':
        stateValue = gameState.turn;
        break;
      default:
        continue;
    }

    let conditionMet = false;
    switch (condition.operator) {
      case '>=':
        conditionMet = stateValue >= condition.value;
        break;
      case '<=':
        conditionMet = stateValue <= condition.value;
        break;
      case '==':
        conditionMet = stateValue === condition.value;
        break;
      case '>':
        conditionMet = stateValue > condition.value;
        break;
      case '<':
        conditionMet = stateValue < condition.value;
        break;
    }

    if (conditionMet) {
      cost += condition.costModifier;
      appliedConditions.push(condition.label);
    }
  }

  return { cost: Math.max(0, cost), appliedConditions };
}

export default {
  HYBRID_CARD_EXAMPLES,
  TRAP_CARD_EXAMPLES,
  PERSISTENT_CARD_EXAMPLES,
  calculateHybridCost,
};
