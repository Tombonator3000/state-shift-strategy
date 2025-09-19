import { describe, expect, it } from 'bun:test';
import type { CardPlay } from '@/data/aiStrategy';
import { EnhancedAIStrategist } from '@/data/enhancedAIStrategy';
import type { GameCard } from '@/rules/mvp';

describe('EnhancedAIStrategist MCTS simulation cloning', () => {
  const captureCard: GameCard = {
    id: 'test-zone-capture',
    name: 'Test Zone Capture',
    type: 'ZONE',
    faction: 'government',
    cost: 0,
    effects: {
      pressureDelta: 5,
    },
  };

  const createBaseState = () => ({
    truth: 50,
    ip: 0,
    aiIP: 10,
    faction: 'truth' as const,
    round: 1,
    turn: 1,
    hand: [captureCard],
    aiHand: [captureCard],
    cardsPlayedThisRound: [],
    states: [
      {
        id: 'ca',
        name: 'California',
        abbreviation: 'CA',
        baseIP: 5,
        defense: 1,
        pressure: 0,
        contested: false,
        owner: 'ai' as const,
      },
      {
        id: 'ny',
        name: 'New York',
        abbreviation: 'NY',
        baseIP: 5,
        defense: 1,
        pressure: 0,
        contested: false,
        owner: 'player' as const,
      },
    ],
    controlledStates: ['NY'],
    playerControlledStates: ['NY'],
    aiControlledStates: ['CA'],
  });

  it('keeps player and AI control arrays distinct after a capture simulation', () => {
    const strategist = new EnhancedAIStrategist('hard');
    const move: CardPlay = {
      cardId: captureCard.id,
      targetState: 'NY',
      priority: 1,
      reasoning: 'force capture',
    };

    const gameState = createBaseState();
    const result = strategist.simulateMoveForTesting(gameState, move);

    expect(result).not.toBe(gameState);
    expect(gameState.controlledStates).toEqual(['NY']);
    expect(gameState.aiControlledStates).toEqual(['CA']);
    expect(result.controlledStates).toEqual([]);
    expect(result.playerControlledStates).toEqual([]);
    expect(result.aiControlledStates).toHaveLength(2);
    expect(result.aiControlledStates).toEqual(expect.arrayContaining(['CA', 'NY']));
    expect(result.aiControlledStates).not.toEqual(result.controlledStates);
    expect(result.controlledStates).toEqual(result.playerControlledStates);
    expect(result.controlledStates).not.toBe(result.aiControlledStates);
    expect(result.playerControlledStates).not.toBe(result.aiControlledStates);
    expect(result.controlledStates).not.toBe(gameState.controlledStates);
  });
});
