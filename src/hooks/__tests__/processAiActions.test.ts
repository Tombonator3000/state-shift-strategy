import { describe, expect, it } from 'bun:test';

import type { GameCard } from '@/rules/mvp';
import { applyAiCardPlay, type AiCardPlayParams } from '@/hooks/aiHelpers';
import { processAiActions, type ProcessAiActionsOptions } from '@/hooks/aiTurnActions';
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

const baseState = (overrides: Partial<GameState> = {}): GameState => ({
  faction: 'truth',
  phase: 'ai_turn',
  turn: 4,
  round: 1,
  currentPlayer: 'ai',
  aiDifficulty: 'medium',
  aiPersonality: undefined,
  truth: 42,
  ip: 15,
  aiIP: 18,
  hand: [],
  discardPile: [],
  aiHand: [],
  aiDiscardPile: [],
  isGameOver: false,
  deck: [],
  aiDeck: [],
  cardsPlayedThisTurn: 0,
  cardsPlayedThisRound: [],
  comboTruthDeltaThisRound: 0,
  playHistory: [],
  turnPlays: [],
  frontPageTriplet: null,
  controlledStates: [],
  aiControlledStates: [],
  states: [],
  currentEvents: [],
  pendingEditionEvents: [],
  eventManager: undefined,
  showNewspaper: false,
  log: [],
  agendaIssue: { id: 'ufo', label: 'Cosmic Cover Stories', description: 'Placeholder', tags: [] },
  agendaIssueCounters: {},
  agendaRoundCounters: {},
  completedSecretAgendaIds: [],
  completedAiSecretAgendaIds: [],
  secretAgenda: undefined,
  aiSecretAgenda: undefined,
  secretAgendaDifficulty: null,
  secretAgendasEnabled: false,
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
  stateCombinationBonusIP: 0,
  activeStateCombinationIds: [],
  stateCombinationEffects: {
    mediaCostModifier: 0,
    extraCardDraw: 0,
    ipPerStateBonus: 0,
    ipPerNeutralStateBonus: 0,
    flatTurnIpBonus: 0,
    attackIpBonus: 0,
    stateDefenseBonus: 0,
    incomingPressureReduction: 0,
    truthSwingMultiplier: 1,
  },
  truthAbove80Streak: 0,
  truthBelow20Streak: 0,
  timeBasedGoalCounters: {},
  paranormalHotspots: {},
  activeHotspot: null,
  stateRoundSeed: 0,
  lastStateBonusRound: 0,
  stateRoundEvents: {},
  activeCampaignArcs: [],
  pendingArcEvents: [],
  editorId: null,
  editorDef: null,
  editorRuntime: null,
  preGameAdditions: null,
  tabloidRelicsRuntime: null,
  ...overrides,
});

describe('processAiActions', () => {
  it('stops further plays when a card ends the game mid-turn', async () => {
    const finisher: GameCard = {
      id: 'finisher-card',
      name: 'Sudden Shutdown',
      type: 'MEDIA',
      faction: 'government',
      rarity: 'common',
      cost: 2,
      effects: { truthDelta: -12 },
    };

    const followUp: GameCard = {
      id: 'followup-card',
      name: 'Extra Spin',
      type: 'MEDIA',
      faction: 'government',
      rarity: 'common',
      cost: 1,
      effects: { truthDelta: -3 },
    };

    const playedParams: AiCardPlayParams[] = [];
    const readSnapshots: GameState[] = [baseState(), baseState({ isGameOver: false })];
    let waits = 0;

    const options: ProcessAiActionsOptions = {
      actions: [
        { cardId: finisher.id, card: finisher },
        { cardId: followUp.id, card: followUp },
      ],
      sequenceDetails: ['Initial strategic plan'],
      readLatestState: async () => {
        if (readSnapshots.length > 1) {
          return readSnapshots.shift()!;
        }
        return readSnapshots[0];
      },
      playCard: async params => {
        playedParams.push(params);
        return baseState({ isGameOver: true });
      },
      waitBetweenActions: async () => {
        waits += 1;
      },
    };

    const result = await processAiActions(options);

    expect(result.gameOver).toBe(true);
    expect(playedParams).toHaveLength(1);
    expect(playedParams[0].cardId).toBe(finisher.id);
    expect(playedParams[0].strategyDetails).toEqual(['Initial strategic plan']);
    expect(waits).toBe(0);
  });

  it('logs a failure and ends the turn gracefully when a zone plan lacks a valid target', async () => {
    const zoneCard: GameCard = {
      id: 'zone-card',
      name: 'Shadow Garrison',
      type: 'ZONE',
      faction: 'government',
      rarity: 'common',
      cost: 4,
      effects: { pressureDelta: 2 },
    };

    const initialState = baseState({
      aiHand: [zoneCard],
      log: ['AI turn planning initiated.'],
      states: [
        {
          id: 'CA',
          name: 'California',
          abbreviation: 'CA',
          baseIP: 6,
          baseDefense: 4,
          defense: 4,
          comboDefenseBonus: 0,
          pressure: 0,
          pressurePlayer: 0,
          pressureAi: 0,
          contested: false,
          owner: 'player',
          paranormalHotspotHistory: [],
          stateEventHistory: [],
          roundEvents: [],
        },
      ],
    });

    const stateHistory: GameState[] = [initialState];
    const playedParams: AiCardPlayParams[] = [];
    let waits = 0;

    const options: ProcessAiActionsOptions = {
      actions: [{ cardId: zoneCard.id, card: zoneCard }],
      sequenceDetails: ['Zone pressure gambit'],
      readLatestState: async () => stateHistory[stateHistory.length - 1],
      playCard: async params => {
        playedParams.push(params);
        const current = stateHistory[stateHistory.length - 1];
        const result = applyAiCardPlay(current, params, achievementsStub);
        stateHistory.push(result.nextState);
        return result.nextState;
      },
      waitBetweenActions: async () => {
        waits += 1;
      },
    };

    const result = await processAiActions(options);
    const finalState = stateHistory[stateHistory.length - 1];

    expect(result.gameOver).toBe(false);
    expect(playedParams).toHaveLength(1);
    expect(playedParams[0].targetState).toBeUndefined();
    expect(waits).toBe(0);

    expect(finalState.aiHand).toHaveLength(1);
    expect(finalState.cardsPlayedThisTurn).toBe(initialState.cardsPlayedThisTurn);
    expect(finalState.log.at(-1)).toContain(zoneCard.name);
    expect(finalState.log.at(-1)).toContain('target state');
  });
});
