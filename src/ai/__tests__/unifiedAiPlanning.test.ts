import { afterEach, beforeEach, describe, expect, it } from 'bun:test';

import '@/test/setupLocalStorage';
import { AI_PRESETS } from '@/ai/difficulty';
import { chooseTurnActions } from '@/ai/enhancedController';
import type { Difficulty } from '@/ai';
import { AIFactory, toEnhancedProfile } from '@/data/aiFactory';
import type { AIDifficulty, AIStrategist, CardPlay, GameStateEvaluation } from '@/data/aiStrategy';
import { EnhancedAIStrategist, type EnhancedCardPlay } from '@/data/enhancedAIStrategy';
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

const GRASSROOTS_A: GameCard = {
  id: 'grassroots-alpha',
  name: 'Grassroots Network',
  type: 'ZONE',
  faction: 'truth',
  rarity: 'rare',
  cost: 4,
  effects: { pressureDelta: 2 },
};

const GRASSROOTS_B: GameCard = {
  ...GRASSROOTS_A,
  id: 'grassroots-beta',
};

const createTruthUrgencyScenario = () => {
  const aiHand = [COMBO_MEDIA, MEDIA_CARD];
  const matchContext = {
    truthHighThreshold: 60,
    truthLowThreshold: 20,
    economicGoal: 180,
  };

  return {
    aiHand,
    hand: aiHand,
    aiIP: 42,
    ip: 18,
    truth: 47,
    truthHighThreshold: matchContext.truthHighThreshold,
    truthLowThreshold: matchContext.truthLowThreshold,
    economicGoal: matchContext.economicGoal,
    matchContext,
    faction: 'government' as const,
    currentPlayer: 'ai' as const,
    turn: 5,
    round: 2,
    cardsPlayedThisRound: [],
    players: {
      P1: {
        id: 'P1',
        faction: 'truth',
        deck: [],
        hand: [],
        discard: [],
        ip: 18,
        states: ['TX'],
      },
      P2: {
        id: 'P2',
        faction: 'government',
        deck: [],
        hand: [],
        discard: [],
        ip: 42,
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
    ],
    controlledStates: ['CA'],
    playerControlledStates: ['TX'],
    aiControlledStates: ['CA'],
    turnPlays: [],
    turnBuffer: [],
    log: [],
    headlineLog: [],
    extraExtraFeed: [],
  };
};

const createGrassrootsScenario = () => ({
  aiHand: [GRASSROOTS_A, GRASSROOTS_B],
  hand: [GRASSROOTS_A, GRASSROOTS_B],
  aiIP: 12,
  ip: 10,
  truth: 52,
  faction: 'government' as const,
  currentPlayer: 'ai' as const,
  turn: 6,
  round: 2,
  cardsPlayedThisRound: [],
  players: {
    P1: {
      id: 'P1',
      faction: 'truth',
      deck: [],
      hand: [],
      discard: [],
      ip: 10,
      states: ['SD'],
    },
    P2: {
      id: 'P2',
      faction: 'government',
      deck: [],
      hand: [],
      discard: [],
      ip: 12,
      states: ['NE'],
    },
  },
  states: [
    {
      id: 'SD',
      name: 'South Dakota',
      abbreviation: 'SD',
      baseIP: 3,
      defense: 4,
      pressure: 3,
      contested: false,
      owner: 'player' as const,
    },
    {
      id: 'NE',
      name: 'Nebraska',
      abbreviation: 'NE',
      baseIP: 2,
      defense: 3,
      pressure: 0,
      contested: false,
      owner: 'ai' as const,
    },
  ],
  controlledStates: ['NE'],
  playerControlledStates: ['SD'],
  aiControlledStates: ['NE'],
  turnPlays: [],
  turnBuffer: [],
  log: [],
  headlineLog: [],
  extraExtraFeed: [],
});

const createNeutralPressureShowdown = () => ({
  aiHand: [GRASSROOTS_A, GRASSROOTS_B],
  hand: [GRASSROOTS_A, GRASSROOTS_B],
  aiIP: 18,
  ip: 14,
  truth: 40,
  faction: 'government' as const,
  currentPlayer: 'ai' as const,
  turn: 3,
  round: 1,
  cardsPlayedThisRound: [],
  players: {
    P1: {
      id: 'P1',
      faction: 'truth' as const,
      deck: [],
      hand: [],
      discard: [],
      ip: 14,
      states: [],
    },
    P2: {
      id: 'P2',
      faction: 'government' as const,
      deck: [],
      hand: [],
      discard: [],
      ip: 18,
      states: [],
    },
  },
  states: [
    {
      id: 'NY',
      name: 'New York',
      abbreviation: 'NY',
      baseIP: 5,
      defense: 5,
      pressure: 0,
      contested: false,
      owner: 'neutral' as const,
    },
    {
      id: 'WY',
      name: 'Wyoming',
      abbreviation: 'WY',
      baseIP: 1,
      defense: 1,
      pressure: 0,
      contested: false,
      owner: 'neutral' as const,
    },
  ],
  controlledStates: [],
  playerControlledStates: [],
  aiControlledStates: [],
  turnPlays: [],
  turnBuffer: [],
  log: [],
  headlineLog: [],
  extraExtraFeed: [],
});

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

  it('assigns increasing rollout budgets with difficulty presets', () => {
    const mediumProfile = toEnhancedProfile(AI_PRESETS.NORMAL);
    const hardProfile = toEnhancedProfile(AI_PRESETS.HARD);
    const insaneProfile = toEnhancedProfile(AI_PRESETS.INSANE);

    const mediumRollouts = Math.round(mediumProfile.rollouts ?? 0);
    const hardRollouts = Math.round(hardProfile.rollouts ?? 0);
    const insaneRollouts = Math.round(insaneProfile.rollouts ?? 0);

    expect(hardRollouts).toBeGreaterThan(mediumRollouts);
    expect(insaneRollouts).toBeGreaterThan(hardRollouts);
    expect(hardRollouts).toBeGreaterThanOrEqual(48);
    expect(insaneRollouts).toBeGreaterThanOrEqual(120);
    expect(mediumRollouts).toBeLessThan(200);
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
    const comboMatch = sequenceSummary.match(/combos ×([0-9.]+)/);
    expect(comboMatch).not.toBeNull();
    if (comboMatch) {
      expect(Number.parseFloat(comboMatch[1]!)).toBeGreaterThanOrEqual(1.35);
    }

    const actionSummary = plan.actions.map(action => ({
      id: action.cardId,
      cost: action.card.cost,
      type: action.card.type,
    }));

    expect(actionSummary).toEqual([
      expect.objectContaining({ id: COMBO_MEDIA.id, type: 'MEDIA', cost: 4 }),
      expect.objectContaining({ id: HIGH_COST_ATTACK.id, type: 'ATTACK' }),
      expect.objectContaining({ id: MEDIA_CARD.id, type: 'MEDIA' }),
    ]);
  });

  it('funnels surplus IP into truth media plays when the truth meter is midrange', () => {
    const strategist = AIFactory.createStrategist('hard');
    const planningState = createTruthUrgencyScenario();

    const plan = chooseTurnActions({ strategist, gameState: planningState, maxActions: 1 });

    expect(plan.actions.length).toBe(1);
    const firstAction = plan.actions[0]!;
    expect(firstAction.card.type).toBe('MEDIA');
    expect(firstAction.card.effects?.truthDelta ?? 0).toBeGreaterThan(0);
    expect([COMBO_MEDIA.id, MEDIA_CARD.id]).toContain(firstAction.cardId);
  });

  it('downranks repeated Grassroots Network targeting once a plan is queued', () => {
    (EnhancedAIStrategist as unknown as {
      globalTargetMemory: Map<string, unknown>;
      globalMemoryTick: number;
    }).globalTargetMemory.clear();
    (EnhancedAIStrategist as unknown as { globalMemoryTick: number }).globalMemoryTick = 0;
    const strategist = AIFactory.createStrategist('hard') as EnhancedAIStrategist;
    const planningState = createGrassrootsScenario();

    strategist.updateBiasModifiers({ combo: 0.05, income: 0.8 });
    strategist.personality = {
      ...strategist.personality,
      territorial: 0.1,
      aggressiveness: 0.1,
    };

    const firstPlay = strategist.selectOptimalPlay(planningState) as EnhancedCardPlay | null;
    expect(firstPlay).not.toBeNull();
    expect(firstPlay?.targetState).toBe('SD');
    expect(firstPlay?.priority).toBeGreaterThanOrEqual(0.3);
    const firstPriority = firstPlay!.priority;

    strategist.registerPlannedTarget(firstPlay!.targetState ?? null, planningState.turn);

    const remainingCard = firstPlay!.cardId === GRASSROOTS_A.id ? GRASSROOTS_B : GRASSROOTS_A;
    const secondView = {
      ...planningState,
      aiHand: [remainingCard],
      hand: [remainingCard],
    };

    const secondEvaluation = strategist.evaluateGameState(secondView);
    const secondPlays = strategist.generateCardPlays(remainingCard, secondView, secondEvaluation);
    expect(secondPlays.length).toBeGreaterThan(0);

    const enhancer = strategist as unknown as {
      enhancePlay: (
        play: CardPlay,
        state: Record<string, unknown>,
        evaluation: GameStateEvaluation,
      ) => EnhancedCardPlay;
    };

    const enhancedSecond = enhancer.enhancePlay(
      secondPlays[0],
      secondView as Record<string, unknown>,
      secondEvaluation,
    );
    const secondPriority = enhancedSecond.priority;
    expect(firstPriority - secondPriority).toBeCloseTo(0.22, 2);
    expect(secondPriority).toBeLessThan(0.3);
  });

  it('prefers higher-IP neutral targets when pressure cards tie on hard difficulty', () => {
    const strategist = AIFactory.createStrategist('hard');
    const planningState = createNeutralPressureShowdown();

    const plan = chooseTurnActions({
      strategist: strategist as EnhancedAIStrategist,
      gameState: planningState,
      maxActions: 1,
      priorityThreshold: 0.18,
    });

    expect(plan.actions.length).toBe(1);
    const action = plan.actions[0]!;
    expect(action.card.type).toBe('ZONE');
    expect(action.targetState).toBe('NY');
  });
});
