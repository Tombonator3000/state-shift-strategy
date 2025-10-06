import { afterEach, beforeEach, describe, expect, it } from 'bun:test';

import '@/test/setupLocalStorage';
import { chooseTurnActions } from '@/ai/enhancedController';
import type { Difficulty } from '@/ai';
import { AIFactory } from '@/data/aiFactory';
import type { AIDifficulty, AIStrategist } from '@/data/aiStrategy';
import type { GameCard } from '@/rules/mvp';

const DIFFICULTIES: Difficulty[] = ['EASY', 'NORMAL', 'HARD', 'INSANE'];

const DIFFICULTY_TO_AI: Record<Difficulty, AIDifficulty> = {
  EASY: 'easy',
  NORMAL: 'medium',
  HARD: 'hard',
  INSANE: 'insane',
};

const MEDIA_CARD: GameCard = {
  id: 'broadcast-alpha',
  name: 'Signal Cascade',
  type: 'MEDIA',
  faction: 'truth',
  rarity: 'common',
  cost: 2,
  effects: { truthDelta: 4 },
};

const ZONE_CARD: GameCard = {
  id: 'zone-alpha',
  name: 'Pressure Grid',
  type: 'ZONE',
  faction: 'truth',
  rarity: 'common',
  cost: 3,
  effects: { pressureDelta: 2 },
};

const ATTACK_CARD: GameCard = {
  id: 'attack-alpha',
  name: 'Expose Network',
  type: 'ATTACK',
  faction: 'truth',
  rarity: 'uncommon',
  cost: 3,
  effects: { ipDelta: { opponent: 3 }, discardOpponent: 1 },
};

const HIGH_COST_ATTACK: GameCard = {
  id: 'attack-heavy',
  name: 'Cataclysm Leak',
  type: 'ATTACK',
  faction: 'truth',
  rarity: 'rare',
  cost: 6,
  effects: { ipDelta: { opponent: 6 }, discardOpponent: 2 },
};

const COMBO_MEDIA: GameCard = {
  id: 'broadcast-combo',
  name: 'Synchronized Reveal',
  type: 'MEDIA',
  faction: 'truth',
  rarity: 'rare',
  cost: 4,
  effects: { truthDelta: 5 },
};

const createPlanningState = () => ({
  aiHand: [MEDIA_CARD, ZONE_CARD, ATTACK_CARD, HIGH_COST_ATTACK, COMBO_MEDIA],
  aiIP: 12,
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
  players: {
    P1: {
      id: 'P1',
      faction: 'truth',
      deck: [],
      hand: [],
      discard: [],
      ip: 12,
      states: ['TX'],
    },
    P2: {
      id: 'P2',
      faction: 'government',
      deck: [],
      hand: [],
      discard: [],
      ip: 12,
      states: ['CA'],
    },
  },
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
  controlledStates: ['TX'],
  playerControlledStates: ['TX'],
  aiControlledStates: ['CA'],
  turnPlays: [],
  turnBuffer: [],
  log: [],
  headlineLog: [],
  extraExtraFeed: [],
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

  it.each(DIFFICULTIES)('produces a deterministic plan on %s difficulty', difficulty => {
    const strategist: AIStrategist = AIFactory.createStrategist(DIFFICULTY_TO_AI[difficulty]);
    const planningState = createPlanningState();

    const plan = chooseTurnActions({ strategist, gameState: planningState });

    expect(plan.sequenceDetails.length).toBeGreaterThan(0);
    expect(plan.actions.length).toBeGreaterThanOrEqual(0);
    const playableIds = new Set(planningState.aiHand.map(card => card.id));
    for (const action of plan.actions) {
      expect(playableIds.has(action.cardId)).toBe(true);
      if (action.strategyDetails) {
        for (const detail of action.strategyDetails) {
          expect(detail.length).toBeGreaterThan(0);
        }
      }
    }

    const requiresCommitment = difficulty === 'HARD' || difficulty === 'INSANE';
    if (requiresCommitment) {
      expect(plan.actions.length).toBeGreaterThan(0);
    }
  });

  it('leans on high-cost combo plays on INSANE difficulty', () => {
    const strategist = AIFactory.createStrategist('insane');
    const planningState = createPlanningState();

    const plan = chooseTurnActions({ strategist, gameState: planningState });
    expect(plan.actions.length).toBeGreaterThan(0);

    const prioritizedIds = plan.actions.map(action => action.cardId);
    expect(prioritizedIds).toContain(COMBO_MEDIA.id);
    expect(plan.actions.some(action => action.card.cost >= 4)).toBe(true);

    const sequenceSummary = plan.sequenceDetails.join(' ');
    expect(sequenceSummary).toContain('Bias profile active');
    expect(sequenceSummary).toContain('combos ×1.35');

    const snapshot = {
      sequenceDetails: plan.sequenceDetails,
      actions: plan.actions.map(action => ({
        id: action.cardId,
        cost: action.card.cost,
        type: action.card.type,
        strategyDetails: action.strategyDetails ?? [],
      })),
    };

    expect(snapshot).toMatchSnapshot();
  });
});
