import { USA_STATES, type StateData } from '@/data/usaStates';
import type { CardEffects } from '@/rules/mvp';

/**
 * State Bonus System - Phase 2
 * Provides passive bonuses for controlling specific states
 */

export interface StateBonus {
  stateId: string;
  stateName: string;
  stateAbbr: string;
  bonus: CardEffects;
  label: string;
  tier: 'major' | 'strategic' | 'regional';
}

export const STATE_BONUSES: StateBonus[] = [
  // Tier 1 - Major States (High IP)
  {
    stateId: '06',
    stateName: 'California',
    stateAbbr: 'CA',
    tier: 'major',
    label: '+1 Card Draw',
    bonus: { draw: 1 }
  },
  {
    stateId: '48',
    stateName: 'Texas',
    stateAbbr: 'TX',
    tier: 'major',
    label: '+2 IP Income',
    bonus: { ipDelta: { self: 2 } }
  },
  {
    stateId: '36',
    stateName: 'New York',
    stateAbbr: 'NY',
    tier: 'major',
    label: 'Truth +20% Effective',
    bonus: { truthDelta: 0 } // Applied as multiplier in resolution
  },
  {
    stateId: '12',
    stateName: 'Florida',
    stateAbbr: 'FL',
    tier: 'major',
    label: 'ZONE Cards -1 IP',
    bonus: {} // Applied as cost reduction in resolution
  },
  
  // Tier 2 - Strategic States
  {
    stateId: '32',
    stateName: 'Nevada',
    stateAbbr: 'NV',
    tier: 'strategic',
    label: 'Area 51: Paranormal +2 Turns',
    bonus: {} // Applied to paranormal events
  },
  {
    stateId: '35',
    stateName: 'New Mexico',
    stateAbbr: 'NM',
    tier: 'strategic',
    label: 'Roswell: +1 Defense to All States',
    bonus: { defenseToAllStates: 1 }
  },
  {
    stateId: '53',
    stateName: 'Washington',
    stateAbbr: 'WA',
    tier: 'strategic',
    label: 'Seattle: Tech Cards -1 IP',
    bonus: {} // Applied as cost reduction for tech-tagged cards
  },
  {
    stateId: '25',
    stateName: 'Massachusetts',
    stateAbbr: 'MA',
    tier: 'strategic',
    label: 'Boston: +1 Card on MEDIA',
    bonus: {} // Applied when playing MEDIA cards
  }
];

/**
 * Get all state bonuses for controlled states
 */
export function getActiveStateBonuses(controlledStateIds: string[]): StateBonus[] {
  return STATE_BONUSES.filter(bonus => controlledStateIds.includes(bonus.stateId));
}

/**
 * Get regional bonuses based on state control patterns
 */
export interface RegionalBonus {
  id: string;
  name: string;
  requiredStates: string[];
  bonus: CardEffects;
  label: string;
}

export const REGIONAL_BONUSES: RegionalBonus[] = [
  {
    id: 'southern_stronghold',
    name: 'Southern Stronghold',
    requiredStates: ['48', '01', '22', '28'], // TX, AL, LA, MS
    bonus: { ipDelta: { opponent: -1 } }, // ATTACK cards deal +1 damage
    label: 'ATTACK Cards +1 Damage'
  },
  {
    id: 'midwest_defense',
    name: 'Midwest Defense Line',
    requiredStates: ['17', '26', '39', '55'], // IL, MI, OH, WI
    bonus: { defenseToAllStates: 1 },
    label: 'All States +1 Defense'
  },
  {
    id: 'northeast_media',
    name: 'Northeast Media Corridor',
    requiredStates: ['36', '25', '34', '42'], // NY, MA, NJ, PA
    bonus: { truthDelta: 1 }, // Truth cards +1% more effective
    label: 'Truth Cards +1% Bonus'
  },
  {
    id: 'western_expansion',
    name: 'Western Expansion',
    requiredStates: ['06', '53', '41', '32'], // CA, WA, OR, NV
    bonus: { pressureDelta: 1 }, // ZONE cards +1 pressure
    label: 'ZONE Cards +1 Pressure'
  }
];

/**
 * Get active regional bonuses
 */
export function getActiveRegionalBonuses(controlledStateIds: string[]): RegionalBonus[] {
  return REGIONAL_BONUSES.filter(regional => {
    const controlled = regional.requiredStates.filter(id => controlledStateIds.includes(id));
    return controlled.length >= 3; // Need at least 3 out of 4 states
  });
}

/**
 * Apply state bonuses to card effects
 */
export function applyStateBonuses(
  baseEffects: CardEffects,
  controlledStateIds: string[],
  cardType?: string,
  cardTags?: string[]
): CardEffects {
  const result = { ...baseEffects };
  const activeBonuses = getActiveStateBonuses(controlledStateIds);
  const regionalBonuses = getActiveRegionalBonuses(controlledStateIds);
  
  // Apply individual state bonuses
  for (const bonus of activeBonuses) {
    if (bonus.bonus.draw) {
      result.draw = (result.draw || 0) + bonus.bonus.draw;
    }
    if (bonus.bonus.ipDelta?.self) {
      result.ipDelta = result.ipDelta || {};
      result.ipDelta.self = (result.ipDelta.self || 0) + bonus.bonus.ipDelta.self;
    }
    if (bonus.bonus.defenseToAllStates) {
      result.defenseToAllStates = (result.defenseToAllStates || 0) + bonus.bonus.defenseToAllStates;
    }
    
    // New York: Truth effects +20%
    if (bonus.stateAbbr === 'NY' && result.truthDelta) {
      result.truthDelta = Math.round(result.truthDelta * 1.2);
    }
  }
  
  // Apply regional bonuses
  for (const regional of regionalBonuses) {
    if (regional.bonus.truthDelta && result.truthDelta) {
      result.truthDelta += regional.bonus.truthDelta;
    }
    if (regional.bonus.pressureDelta && result.pressureDelta && cardType === 'ZONE') {
      result.pressureDelta += regional.bonus.pressureDelta;
    }
    if (regional.bonus.ipDelta?.opponent && cardType === 'ATTACK') {
      result.ipDelta = result.ipDelta || {};
      result.ipDelta.opponent = (result.ipDelta.opponent || 0) + (regional.bonus.ipDelta.opponent || 0);
    }
    if (regional.bonus.defenseToAllStates) {
      result.defenseToAllStates = (result.defenseToAllStates || 0) + regional.bonus.defenseToAllStates;
    }
  }
  
  return result;
}

/**
 * Calculate card cost with state bonuses
 */
export function calculateCardCost(
  baseCost: number,
  controlledStateIds: string[],
  cardType?: string,
  cardTags?: string[]
): number {
  let cost = baseCost;
  
  // Florida: ZONE cards cost -1 IP
  if (controlledStateIds.includes('12') && cardType === 'ZONE') {
    cost = Math.max(1, cost - 1);
  }
  
  // Washington: Tech-tagged cards cost -1 IP
  if (controlledStateIds.includes('53') && cardTags?.includes('tech')) {
    cost = Math.max(1, cost - 1);
  }
  
  return cost;
}
