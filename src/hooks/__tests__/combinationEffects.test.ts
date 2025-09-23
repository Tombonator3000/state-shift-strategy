import { describe, expect, it } from 'bun:test';
import {
  calculateComboIncome,
  deriveCombinationEffectSummaries,
  getEffectiveCardCost,
} from '@/game/combinationEffectUtils';
import { expectedCost, type GameCard } from '@/rules/mvp';

describe('combination effect utilities', () => {
  it('applies Silicon Valley Network bonuses to cost and income', () => {
    const summaries = deriveCombinationEffectSummaries({
      faction: 'truth',
      controlledStates: ['CA', 'WA', 'OR'],
      aiControlledStates: [],
    });

    const humanSummary = summaries.human;
    const siliconActive = humanSummary.activeCombinations.some(
      combo => combo.id === 'silicon_valley_network',
    );
    expect(siliconActive).toBe(true);
    expect(humanSummary.breakdown.mediaCostModifier).toBe(-1);

    const baseCost = expectedCost('MEDIA', 'common');
    const mediaCard: GameCard = {
      id: 'test-media',
      name: 'Test Media',
      type: 'MEDIA',
      faction: 'truth',
      cost: baseCost,
    };

    expect(getEffectiveCardCost(mediaCard, humanSummary.breakdown)).toBe(baseCost - 1);
    expect(calculateComboIncome(humanSummary)).toBe(4);
  });
});
