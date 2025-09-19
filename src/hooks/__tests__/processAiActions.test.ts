import { describe, expect, it } from 'bun:test';

import type { GameCard } from '@/rules/mvp';
import type { GameState } from '@/hooks/gameStateTypes';
import { processAiActions, type ProcessAiActionsOptions } from '@/hooks/aiTurnActions';
import type { AiCardPlayParams } from '@/hooks/aiHelpers';

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
  aiHand: [],
  isGameOver: false,
  deck: [],
  aiDeck: [],
  cardsPlayedThisTurn: 0,
  cardsPlayedThisRound: [],
  playHistory: [],
  turnPlays: [],
  controlledStates: [],
  aiControlledStates: [],
  states: [],
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
});
