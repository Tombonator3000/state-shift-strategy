import { describe, expect, it } from 'bun:test';
import { planDiscardOutcome } from '../src/utils/discardPlanner';
import type { GameCard } from '../src/rules/mvp';

const createCard = (id: string, overrides: Partial<GameCard> = {}): GameCard => ({
  id,
  name: id.toUpperCase(),
  type: 'MEDIA',
  cost: 1,
  faction: 'truth',
  rarity: 'common',
  text: '',
  ...overrides,
});

describe('planDiscardOutcome', () => {
  it('retains unaffordable cards after IP is spent, and permits the first free discard at zero IP', () => {
    const hand = ['a', 'b', 'c'].map(id => createCard(id));
    expect(planDiscardOutcome(hand, [], ['a', 'b', 'c'], 0).discardedCount).toBe(1);
    const plan = planDiscardOutcome(hand, [], ['a', 'b', 'c'], 24);
    expect(plan.discardedCount).toBe(2);
    expect(plan.ipCost).toBe(10);
    expect(plan.remainingHand.map(card => card.id)).toEqual(['c']);
  });
  it('moves multiple queued cards to the discard pile and charges escalating IP', () => {
    const hand = [createCard('alpha'), createCard('bravo'), createCard('charlie')];
    const discardPile = [createCard('legacy')];

    const outcome = planDiscardOutcome(hand, discardPile, ['alpha', 'charlie']);

    expect(outcome.discardedCount).toBe(2);
    expect(outcome.ipCost).toBe(10);
    expect(outcome.costBreakdown).toEqual([0, 10]);
    expect(outcome.remainingHand.map(card => card.id)).toEqual(['bravo']);
    expect(outcome.updatedDiscardPile.map(card => card.id)).toEqual(['legacy', 'alpha', 'charlie']);
    expect(outcome.logEntry).toContain('Discarded 2 cards');
  });

  it('ignores unknown ids and never reduces IP when nothing is queued', () => {
    const hand = [createCard('delta'), createCard('echo')];
    const discardPile: GameCard[] = [];

    const outcome = planDiscardOutcome(hand, discardPile, ['unknown', 'delta']);

    expect(outcome.discardedCount).toBe(1);
    expect(outcome.ipCost).toBe(0);
    expect(outcome.remainingHand.map(card => card.id)).toEqual(['echo']);
    expect(outcome.updatedDiscardPile.map(card => card.id)).toEqual(['delta']);
    expect(outcome.logEntry).toContain('first free');
  });
});
