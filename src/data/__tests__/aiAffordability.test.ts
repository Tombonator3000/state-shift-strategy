import { describe, expect, it } from 'bun:test';
import { AIStrategist, type CardPlay } from '@/data/aiStrategy';
import { EnhancedAIStrategist } from '@/data/enhancedAIStrategy';
import type { GameCard } from '@/rules/mvp';

class TestStrategist extends AIStrategist {
  protected override generateCardPlays(card: GameCard): CardPlay[] {
    const priority = card.id === 'expensive-card' ? 1 : 0.6;
    return [{ cardId: card.id, priority, reasoning: 'test priority' }];
  }
}

class TestEnhancedStrategist extends EnhancedAIStrategist {
  protected override generateCardPlays(card: GameCard): CardPlay[] {
    const priority = card.id === 'expensive-card' ? 1 : 0.6;
    return [{ cardId: card.id, priority, reasoning: 'test priority' }];
  }
}

describe('AI affordability heuristics', () => {
  const expensiveCard: GameCard = {
    id: 'expensive-card',
    name: 'Expensive Card',
    type: 'ATTACK',
    faction: 'truth',
    cost: 5,
  };

  const cheapCard: GameCard = {
    id: 'cheap-card',
    name: 'Cheap Card',
    type: 'ATTACK',
    faction: 'truth',
    cost: 2,
  };

  const createGameState = () => ({
    aiIP: 3,
    ip: 0,
    truth: 50,
    faction: 'government' as const,
    hand: [expensiveCard, cheapCard],
    aiHand: [expensiveCard, cheapCard],
    states: [],
    cardsPlayedThisRound: [],
    turn: 1,
    round: 1,
  });

  it('prefers an affordable card in the basic strategist', () => {
    const strategist = new TestStrategist('medium');
    const play = strategist.selectBestPlay(createGameState());

    expect(play?.cardId).toBe('cheap-card');
  });

  it('prefers an affordable card in the enhanced strategist', () => {
    const strategist = new TestEnhancedStrategist('easy');
    const originalRandom = Math.random;
    Math.random = () => 0;

    try {
      const play = strategist.selectOptimalPlay(createGameState());
      expect(play?.cardId).toBe('cheap-card');
    } finally {
      Math.random = originalRandom;
    }
  });
});
