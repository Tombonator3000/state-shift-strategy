import { afterEach, beforeEach, describe, expect, it } from 'bun:test';

import { chooseTurnActions } from '@/ai/enhancedController';
import type { Difficulty } from '@/ai';
import { AIFactory } from '@/data/aiFactory';
import type { AIDifficulty, AIStrategist } from '@/data/aiStrategy';
import type { GameCard } from '@/rules/mvp';

const DIFFICULTIES: Difficulty[] = ['EASY', 'NORMAL', 'HARD', 'TOP_SECRET_PLUS'];

const DIFFICULTY_TO_AI: Record<Difficulty, AIDifficulty> = {
  EASY: 'easy',
  NORMAL: 'medium',
  HARD: 'hard',
  TOP_SECRET_PLUS: 'legendary',
};

const MEDIA_CARD: GameCard = {
  id: 'test-media',
  name: 'Test Broadcast',
  type: 'MEDIA',
  faction: 'truth',
  rarity: 'common',
  cost: 2,
  effects: { truthDelta: 4 },
};

const ZONE_CARD: GameCard = {
  id: 'test-zone',
  name: 'Test Pressure',
  type: 'ZONE',
  faction: 'truth',
  rarity: 'common',
  cost: 3,
  effects: { pressureDelta: 2 },
};

const ATTACK_CARD: GameCard = {
  id: 'test-attack',
  name: 'Test Exposé',
  type: 'ATTACK',
  faction: 'truth',
  rarity: 'uncommon',
  cost: 3,
  effects: { ipDelta: { opponent: 3 }, discardOpponent: 1 },
};

const createPlanningState = () => ({
  aiHand: [MEDIA_CARD, ZONE_CARD, ATTACK_CARD],
  aiIP: 8,
  ip: 12,
  truth: 55,
  faction: 'government' as const,
  currentPlayer: 'ai' as const,
  turn: 4,
  round: 2,
  cardsPlayedThisRound: [
    {
      card: ATTACK_CARD,
      player: 'human' as const,
      targetState: 'TX',
      truthDelta: 0,
      capturedStates: [],
    },
  ],
  states: [
    {
      id: 'CA',
      name: 'California',
      abbreviation: 'CA',
      baseIP: 6,
      defense: 4,
      pressure: 1,
      contested: false,
      owner: 'ai' as const,
    },
    {
      id: 'TX',
      name: 'Texas',
      abbreviation: 'TX',
      baseIP: 5,
      defense: 5,
      pressure: 2,
      contested: false,
      owner: 'player' as const,
    },
    {
      id: 'NV',
      name: 'Nevada',
      abbreviation: 'NV',
      baseIP: 3,
      defense: 3,
      pressure: 0,
      contested: false,
      owner: 'neutral' as const,
    },
  ],
});

describe('Unified AI planning', () => {
  let originalRandom: () => number;

  beforeEach(() => {
    originalRandom = Math.random;
    Math.random = () => 0;
  });

  afterEach(() => {
    Math.random = originalRandom;
  });

  for (const difficulty of DIFFICULTIES) {
    it(`plays at least one card on ${difficulty}`, () => {
      const strategist: AIStrategist = AIFactory.createStrategist(DIFFICULTY_TO_AI[difficulty]);
      const planningState = createPlanningState();

      const turnPlan = chooseTurnActions({
        strategist,
        gameState: planningState,
        maxActions: 3,
        priorityThreshold: 0.2,
      });

      expect(turnPlan.actions.length).toBeGreaterThan(0);
      expect(turnPlan.sequenceDetails.length).toBeGreaterThan(0);
      const playedIds = new Set(planningState.aiHand.map(card => card.id));
      turnPlan.actions.forEach(action => {
        expect(playedIds.has(action.cardId)).toBe(true);
      });

      turnPlan.sequenceDetails.forEach(entry => {
        expect(entry.length).toBeLessThanOrEqual(140);
      });
    });
  }

  it('returns an empty plan when no affordable cards are available', () => {
    for (const difficulty of DIFFICULTIES) {
      const strategist = AIFactory.createStrategist(DIFFICULTY_TO_AI[difficulty]);
      const baseState = createPlanningState();
      const expensiveHand = baseState.aiHand.map(card => ({
        ...card,
        cost: (card.cost ?? 0) + 10,
      }));

      const planningState = {
        ...baseState,
        aiIP: 0,
        aiHand: expensiveHand,
      };

      let plan: ReturnType<typeof chooseTurnActions> | null = null;
      expect(() => {
        plan = chooseTurnActions({
          strategist,
          gameState: planningState,
          maxActions: 3,
          priorityThreshold: 0.2,
        });
      }).not.toThrow();

      expect(plan).not.toBeNull();
      expect(plan!.actions.length).toBe(0);
      expect(plan!.sequenceDetails.length).toBeGreaterThan(0);
    }
  });
});
