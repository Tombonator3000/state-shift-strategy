import { CardEffects } from '@/types/cardEffects';

export type CostCtx = {
  rarity: 'common' | 'uncommon' | 'rare' | 'legendary';
  effects: CardEffects;
};

export function computeV21ECost({ rarity, effects }: CostCtx): number {
  let cost = 0;

  // Truth % - dyrere-leaning
  if (typeof effects.truthDelta === 'number') {
    const v = Math.abs(effects.truthDelta);
    cost += Math.ceil(v * 0.9);
  }

  // IP effects
  if (effects.ipDelta?.self) {
    cost += Math.ceil(Math.max(0, effects.ipDelta.self) * 2.0);
  }
  if (effects.ipDelta?.opponent) {
    cost += Math.ceil(Math.max(0, -effects.ipDelta.opponent) * 1.5);
  }

  // Card flow effects
  if (effects.draw) {
    cost += effects.draw * 3;
  }
  if (effects.discardOpponent) {
    cost += effects.discardOpponent * 2;
  }

  // State pressure and defense
  if (effects.pressureDelta) {
    cost += Math.ceil(Math.abs(effects.pressureDelta) * 0.75);
  }
  if (effects.zoneDefense) {
    cost += Math.ceil(Math.abs(effects.zoneDefense) * 0.6);
  }

  // Conditionals get discount (not always active)
  if (effects.conditional) {
    cost = Math.ceil(cost * 0.8);
  }

  // Rarity multipliers
  const multipliers = {
    common: 1,
    uncommon: 1.05,
    rare: 1.15,
    legendary: 1.25
  };
  
  cost = Math.ceil(cost * multipliers[rarity]);
  
  // Legendary minimum cost enforcement
  if (rarity === 'legendary') {
    cost = Math.max(25, cost);
  }

  // Minimum cost of 1
  return Math.max(1, cost);
}