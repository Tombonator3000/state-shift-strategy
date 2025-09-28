// State Combination Effects System
import { StateData, getStateByAbbreviation } from './usaStates';

export interface StateCombination {
  id: string;
  name: string;
  description: string;
  requiredStates: string[]; // State abbreviations
  bonusIP: number;
  bonusEffect?: string;
  category: 'economic' | 'military' | 'intelligence' | 'cultural' | 'energy' | 'transport';
}

export interface StateCombinationEffects {
  mediaCostModifier: number;
  extraCardDraw: number;
  ipPerStateBonus: number;
  ipPerNeutralStateBonus: number;
  flatTurnIpBonus: number;
  attackIpBonus: number;
  stateDefenseBonus: number;
  incomingPressureReduction: number;
}

export const DEFAULT_STATE_COMBINATION_EFFECTS: StateCombinationEffects = {
  mediaCostModifier: 0,
  extraCardDraw: 0,
  ipPerStateBonus: 0,
  ipPerNeutralStateBonus: 0,
  flatTurnIpBonus: 0,
  attackIpBonus: 0,
  stateDefenseBonus: 0,
  incomingPressureReduction: 0,
};

export const createDefaultCombinationEffects = (): StateCombinationEffects => ({
  ...DEFAULT_STATE_COMBINATION_EFFECTS,
});

export const STATE_COMBINATIONS: StateCombination[] = [
  // Economic Powerhouses
  {
    id: 'wall_street_empire',
    name: 'Wall Street Empire',
    description: 'Control the financial capitals of America',
    requiredStates: ['NY', 'CT', 'NJ'],
    bonusIP: 5,
    bonusEffect: 'Additional +2 IP per turn from financial manipulation',
    category: 'economic'
  },
  {
    id: 'silicon_valley_network',
    name: 'Silicon Valley Network',
    description: 'Dominate the tech industry',
    requiredStates: ['CA', 'WA', 'OR'],
    bonusIP: 4,
    bonusEffect: 'All MEDIA cards cost -1 IP',
    category: 'economic'
  },
  {
    id: 'oil_cartel',
    name: 'Oil Cartel',
    description: 'Control America\'s energy resources',
    requiredStates: ['TX', 'AK', 'ND', 'OK'],
    bonusIP: 6,
    bonusEffect: 'Generate +1 IP for each state you control',
    category: 'energy'
  },

  // Military Industrial Complex
  {
    id: 'military_triangle',
    name: 'Military Triangle',
    description: 'Pentagon, CIA, and NSA under your control',
    requiredStates: ['VA', 'MD', 'DC'],
    bonusIP: 4,
    bonusEffect: 'All ATTACK cards deal +1 pressure',
    category: 'military'
  },
  {
    id: 'nuclear_triad',
    name: 'Nuclear Triad',
    description: 'Control the nuclear arsenal',
    requiredStates: ['WY', 'MT', 'ND'],
    bonusIP: 3,
    bonusEffect: 'Defense of all your states +1',
    category: 'military'
  },
  {
    id: 'space_program',
    name: 'Space Program',
    description: 'Control space operations',
    requiredStates: ['FL', 'TX', 'AL', 'CA'],
    bonusIP: 5,
    bonusEffect: 'Can see AI hand once per turn',
    category: 'military'
  },

  // Intelligence Networks
  {
    id: 'intel_web',
    name: 'Intelligence Web',
    description: 'Total information awareness',
    requiredStates: ['VA', 'MD', 'UT', 'NV'],
    bonusIP: 4,
    bonusEffect: 'Draw +1 card per turn',
    category: 'intelligence'
  },
  {
    id: 'academic_elite',
    name: 'Academic Elite',
    description: 'Control the ivory towers',
    requiredStates: ['MA', 'CT', 'NY', 'CA'],
    bonusIP: 3,
    bonusEffect: 'All cards give +50% Truth/Government effect',
    category: 'cultural'
  },

  // Regional Dominance
  {
    id: 'midwest_backbone',
    name: 'Midwest Backbone',
    description: 'America\'s industrial heartland',
    requiredStates: ['IL', 'OH', 'MI', 'IN', 'WI'],
    bonusIP: 4,
    bonusEffect: 'States are harder to capture (-1 pressure from enemy)',
    category: 'economic'
  },
  {
    id: 'deep_south',
    name: 'Deep South Network',
    description: 'Traditional power structures',
    requiredStates: ['GA', 'AL', 'MS', 'SC', 'LA'],
    bonusIP: 3,
    bonusEffect: 'Government cards are more effective (+2 Truth manipulation)',
    category: 'cultural'
  },
  {
    id: 'new_england_conspiracy',
    name: 'New England Conspiracy',
    description: 'Old money, old secrets',
    requiredStates: ['MA', 'NH', 'VT', 'ME', 'RI', 'CT'],
    bonusIP: 4,
    bonusEffect: 'Secret societies activated - draw rare cards more often',
    category: 'cultural'
  },

  // Transportation Networks
  {
    id: 'transport_control',
    name: 'Transport Control',
    description: 'Control the flow of goods and people',
    requiredStates: ['IL', 'MO', 'IN', 'OH'],
    bonusIP: 3,
    bonusEffect: 'Can move pressure between adjacent states once per turn',
    category: 'transport'
  },

  // Border Control
  {
    id: 'southern_border',
    name: 'Southern Border',
    description: 'Control immigration and smuggling',
    requiredStates: ['CA', 'AZ', 'NM', 'TX'],
    bonusIP: 4,
    bonusEffect: 'Generate +1 IP for each neutral state',
    category: 'military'
  },

  // Agricultural Control
  {
    id: 'food_supply',
    name: 'Food Supply Chain',
    description: 'Control America\'s breadbasket',
    requiredStates: ['IA', 'NE', 'KS', 'MO', 'IL'],
    bonusIP: 3,
    bonusEffect: 'Population unrest immunity - no pressure loss from events',
    category: 'economic'
  }
];

export class StateCombinationManager {
  private activeCombinations: Set<string> = new Set();

  checkCombinations(controlledStates: string[]): StateCombination[] {
    const newActiveCombinations: StateCombination[] = [];
    
    for (const combination of STATE_COMBINATIONS) {
      const hasAllStates = combination.requiredStates.every(state => 
        controlledStates.includes(state)
      );
      
      if (hasAllStates && !this.activeCombinations.has(combination.id)) {
        newActiveCombinations.push(combination);
        this.activeCombinations.add(combination.id);
      } else if (!hasAllStates && this.activeCombinations.has(combination.id)) {
        this.activeCombinations.delete(combination.id);
      }
    }
    
    return newActiveCombinations;
  }

  getActiveCombinations(): StateCombination[] {
    return STATE_COMBINATIONS.filter(combo => 
      this.activeCombinations.has(combo.id)
    );
  }

  getTotalBonusIP(): number {
    return this.getActiveCombinations().reduce((total, combo) => 
      total + combo.bonusIP, 0
    );
  }

  hasEffect(effectType: string): boolean {
    return this.getActiveCombinations().some(combo => 
      combo.bonusEffect?.toLowerCase().includes(effectType.toLowerCase())
    );
  }

  reset(): void {
    this.activeCombinations.clear();
  }

  // Get combinations that are close to being achieved
  getPotentialCombinations(controlledStates: string[]): Array<{
    combination: StateCombination;
    missing: string[];
    progress: number;
  }> {
    return STATE_COMBINATIONS
      .filter(combo => !this.activeCombinations.has(combo.id))
      .map(combo => {
        const missing = combo.requiredStates.filter(state => 
          !controlledStates.includes(state)
        );
        const progress = Math.round(
          ((combo.requiredStates.length - missing.length) / combo.requiredStates.length) * 100
        );
        
        return { combination: combo, missing, progress };
      })
      .filter(item => item.progress > 0)
      .sort((a, b) => b.progress - a.progress);
  }
}

export const aggregateStateCombinationEffects = (
  combinations: StateCombination[],
): StateCombinationEffects => {
  return combinations.reduce<StateCombinationEffects>((effects, combo) => {
    switch (combo.id) {
      case 'silicon_valley_network': {
        effects.mediaCostModifier -= 1;
        break;
      }
      case 'intel_web': {
        effects.extraCardDraw += 1;
        break;
      }
      case 'oil_cartel': {
        effects.ipPerStateBonus += 1;
        break;
      }
      case 'southern_border': {
        effects.ipPerNeutralStateBonus += 1;
        break;
      }
      case 'wall_street_empire': {
        effects.flatTurnIpBonus += 2;
        break;
      }
      case 'military_triangle': {
        effects.attackIpBonus += 1;
        break;
      }
      case 'nuclear_triad': {
        effects.stateDefenseBonus += 1;
        break;
      }
      case 'midwest_backbone': {
        effects.incomingPressureReduction += 1;
        break;
      }
      default:
        break;
    }

    return effects;
  }, createDefaultCombinationEffects());
};

export const calculateDynamicIpBonus = (
  effects: StateCombinationEffects,
  controlledStatesCount: number,
  neutralStatesCount: number,
): number => {
  const perState = effects.ipPerStateBonus * controlledStatesCount;
  const perNeutral = effects.ipPerNeutralStateBonus * neutralStatesCount;
  const flat = effects.flatTurnIpBonus;
  return flat + perState + perNeutral;
};

export const applyStateCombinationCostModifiers = (
  baseCost: number,
  cardType: string,
  owner: 'human' | 'ai',
  effects: StateCombinationEffects,
): number => {
  let cost = baseCost;

  if (owner === 'human' && cardType === 'MEDIA') {
    cost += effects.mediaCostModifier;
  }

  return Math.max(0, Math.floor(cost));
};

export interface CombinationDefenseState {
  defense: number;
  owner: 'player' | 'ai' | 'neutral';
  comboDefenseBonus?: number;
}

export const applyDefenseBonusToStates = <T extends CombinationDefenseState>(
  states: T[],
  bonus: number,
): T[] => {
  const normalizedBonus = Number.isFinite(bonus) ? Math.max(0, Math.floor(bonus)) : 0;
  let mutated = false;

  const nextStates = states.map(state => {
    const previousBonus = typeof state.comboDefenseBonus === 'number' ? state.comboDefenseBonus : 0;
    const baseDefense = Math.max(1, state.defense - previousBonus);

    if (state.owner === 'player') {
      const desiredDefense = Math.max(1, baseDefense + normalizedBonus);
      if (desiredDefense !== state.defense || previousBonus !== normalizedBonus) {
        mutated = true;
        return {
          ...state,
          defense: desiredDefense,
          comboDefenseBonus: normalizedBonus,
        };
      }

      if (state.comboDefenseBonus !== normalizedBonus) {
        mutated = true;
        return {
          ...state,
          comboDefenseBonus: normalizedBonus,
        };
      }

      return state;
    }

    if (previousBonus !== 0 || state.comboDefenseBonus) {
      const resetDefense = Math.max(1, baseDefense);
      if (resetDefense !== state.defense || previousBonus !== 0 || state.comboDefenseBonus) {
        mutated = true;
        return {
          ...state,
          defense: resetDefense,
          comboDefenseBonus: 0,
        };
      }
    }

    if (state.comboDefenseBonus) {
      mutated = true;
      return {
        ...state,
        comboDefenseBonus: 0,
      };
    }

    return state;
  });

  return mutated ? nextStates : states;
};