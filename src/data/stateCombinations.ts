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