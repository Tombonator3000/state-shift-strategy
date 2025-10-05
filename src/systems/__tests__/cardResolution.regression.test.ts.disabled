import { describe, expect, it } from 'bun:test';

import type { GameCard } from '@/rules/mvp';

import {
  resolveCardMVP,
  type CardActor,
  type GameSnapshot,
} from '../cardResolution';

const createBaseSnapshot = (overrides: Partial<GameSnapshot> = {}): GameSnapshot => ({
  truth: 50,
  ip: 10,
  aiIP: 10,
  hand: [],
  aiHand: [],
  controlledStates: [],
  aiControlledStates: [],
  round: 1,
  turn: 1,
  faction: 'truth',
  states: [
    {
      id: 'NY',
      name: 'New York',
      abbreviation: 'NY',
      baseIP: 3,
      baseDefense: 1,
      defense: 1,
      pressure: 0,
      pressurePlayer: 0,
      pressureAi: 0,
      contested: false,
      owner: 'neutral',
    },
  ],
  ...overrides,
});

describe('resolveCardMVP regression', () => {
  const actor: CardActor = 'human';

  it('clears enemy pressure when the player already controls the state', () => {
    const gameState = createBaseSnapshot({
      controlledStates: ['NY'],
      states: [
        {
          id: 'NY',
          name: 'New York',
          abbreviation: 'NY',
          baseIP: 3,
          baseDefense: 1,
          defense: 1,
          pressure: 3,
          pressurePlayer: 0,
          pressureAi: 3,
          contested: false,
          owner: 'player',
        },
      ],
    });
    const card: GameCard = {
      id: 'noop',
      name: 'No-Op',
      type: 'MEDIA',
      faction: 'truth',
      rarity: 'common',
      cost: 0,
    };

    let result: ReturnType<typeof resolveCardMVP> | undefined;
    expect(() => {
      result = resolveCardMVP(gameState, card, null, actor);
    }).not.toThrow();

    expect(result).toBeDefined();
    const [state] = result!.states;
    expect(state?.pressureAi).toBe(0);
    expect(state?.pressurePlayer).toBe(0);
  });

  it('clears ai pressure for ai-controlled states sourced from aiControlledStates', () => {
    const gameState = createBaseSnapshot({
      aiControlledStates: ['CA'],
      states: [
        {
          id: 'CA',
          name: 'California',
          abbreviation: 'CA',
          baseIP: 3,
          baseDefense: 1,
          defense: 1,
          pressure: 4,
          pressurePlayer: 0,
          pressureAi: 4,
          contested: false,
          owner: 'ai',
        },
      ],
    });
    const card: GameCard = {
      id: 'noop',
      name: 'No-Op',
      type: 'MEDIA',
      faction: 'truth',
      rarity: 'common',
      cost: 0,
    };

    expect(() => {
      resolveCardMVP(gameState, card, null, actor);
    }).not.toThrow();
  });
});
