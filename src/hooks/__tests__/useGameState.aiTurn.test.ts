import { describe, expect, it } from 'bun:test';

import type { GameCard } from '@/rules/mvp';
import { applyAiCardPlay, type AiCardPlayParams } from '@/hooks/aiHelpers';
import type { GameState } from '@/hooks/gameStateTypes';
import type { AchievementTracker } from '@/systems/cardResolution';

const achievementsStub: AchievementTracker = {
  stats: {
    total_states_controlled: 0,
    max_states_controlled_single_game: 0,
    max_ip_reached: 0,
    max_truth_reached: 0,
    min_truth_reached: 100,
  },
  updateStats: () => {
    /* no-op for tests */
  },
};

const createBaseState = (overrides: Partial<GameState> = {}): GameState => ({
  faction: 'truth',
  phase: 'ai_turn',
  turn: 3,
  round: 1,
  currentPlayer: 'ai',
  aiDifficulty: 'medium',
  aiPersonality: undefined,
  truth: 50,
  ip: 12,
  aiIP: 10,
  hand: [],
  aiHand: [],
  isGameOver: false,
  deck: [],
  aiDeck: [],
  cardsPlayedThisTurn: 0,
  cardsPlayedThisRound: [],
  playHistory: [],
  controlledStates: [],
  aiControlledStates: [],
  states: [
    {
      id: 'CA',
      name: 'California',
      abbreviation: 'CA',
      baseIP: 6,
      defense: 4,
      pressure: 0,
      contested: false,
      owner: 'player',
    },
    {
      id: 'NV',
      name: 'Nevada',
      abbreviation: 'NV',
      baseIP: 3,
      defense: 3,
      pressure: 0,
      contested: false,
      owner: 'neutral',
    },
  ],
  currentEvents: [],
  eventManager: undefined,
  showNewspaper: false,
  log: [],
  agenda: undefined,
  secretAgenda: undefined,
  aiSecretAgenda: undefined,
  animating: false,
  aiTurnInProgress: true,
  selectedCard: null,
  targetState: null,
  aiStrategist: undefined,
  pendingCardDraw: 0,
  newCards: [],
  showNewCardsPresentation: false,
  drawMode: 'standard',
  cardDrawState: { cardsPlayedLastTurn: 0, lastTurnWithoutPlay: false },
  ...overrides,
});

describe('applyAiCardPlay', () => {
  it('executes a planned card that was drawn during the income step', () => {
    const drawnCard: GameCard = {
      id: 'ai-income-card',
      name: 'Crisis Broadcast',
      type: 'MEDIA',
      faction: 'government',
      rarity: 'common',
      cost: 2,
      effects: { truthDelta: -6 },
    };

    const initialState = createBaseState({
      aiHand: [drawnCard],
      log: ['AI income step completed.'],
    });

    const plan: AiCardPlayParams = {
      cardId: drawnCard.id,
      card: drawnCard,
      targetState: 'CA',
      reasoning: 'Exploit freshly drawn propaganda piece.',
      strategyDetails: ['AI Synergy Bonus: Momentum from new draws'],
    };

    const result = applyAiCardPlay(initialState, plan, achievementsStub);

    expect(result.failed).toBeUndefined();
    expect(result.card).toBe(drawnCard);
    expect(result.nextState.aiHand).toHaveLength(0);
    expect(result.nextState.cardsPlayedThisRound).toHaveLength(1);
    expect(result.nextState.cardsPlayedThisRound[0].card.id).toBe(drawnCard.id);
    expect(result.nextState.log.length).toBeGreaterThan(initialState.log.length);
    expect(result.nextState.log.some(entry => entry.includes(drawnCard.name))).toBe(true);
    expect(result.nextState.log.some(entry => entry.includes('AI focus'))).toBe(true);
  });

  it('logs a failure without strategy metadata when the planned card is missing', () => {
    const initialState = createBaseState();

    const plan: AiCardPlayParams = {
      cardId: 'missing-card',
      reasoning: 'Should not appear if the card vanished.',
      strategyDetails: ['AI focus: would have played the missing card'],
    };

    const result = applyAiCardPlay(initialState, plan, achievementsStub);

    expect(result.failed).toBe(true);
    expect(result.nextState.aiHand).toEqual(initialState.aiHand);
    expect(result.nextState.cardsPlayedThisRound).toEqual(initialState.cardsPlayedThisRound);
    expect(result.nextState.log.some(entry => entry.includes('missing-card'))).toBe(true);
    expect(result.nextState.log.some(entry => entry.includes('AI focus'))).toBe(false);
  });
});
