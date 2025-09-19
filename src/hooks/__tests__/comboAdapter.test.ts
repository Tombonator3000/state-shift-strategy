import { describe, expect, it } from 'bun:test';

import type { GameState } from '@/hooks/gameStateTypes';
import { evaluateCombosForTurn } from '@/hooks/comboAdapter';
import type { TurnPlay } from '@/game/combo.types';
import { getLastComboSummary } from '@/game/comboEngine';

const makeTurnPlays = (): TurnPlay[] => {
  const plays: TurnPlay[] = [];
  for (let index = 0; index < 3; index += 1) {
    const playSequence = index * 2;
    const resolveSequence = playSequence + 1;
    const base = {
      owner: 'P1' as const,
      cardId: `media-${index + 1}`,
      cardName: `Media Play ${index + 1}`,
      cardType: 'MEDIA' as const,
      cardRarity: 'common' as const,
      cost: 2,
      targetStateId: undefined,
    } satisfies Omit<TurnPlay, 'sequence' | 'stage' | 'metadata'>;

    plays.push({ sequence: playSequence, stage: 'play', ...base });
    plays.push({ sequence: resolveSequence, stage: 'resolve', ...base });
  }
  return plays;
};

const createState = (overrides: Partial<GameState> = {}): GameState => ({
  faction: 'truth',
  phase: 'action',
  turn: 3,
  round: 1,
  currentPlayer: 'human',
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
  cardsPlayedThisTurn: 3,
  cardsPlayedThisRound: [],
  playHistory: [],
  turnPlays: makeTurnPlays(),
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
      owner: 'neutral' as const,
    },
    {
      id: 'NY',
      name: 'New York',
      abbreviation: 'NY',
      baseIP: 5,
      defense: 3,
      pressure: 0,
      contested: false,
      owner: 'neutral' as const,
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
  aiTurnInProgress: false,
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

describe('evaluateCombosForTurn', () => {
  it('applies combo rewards to the active player and updates the summary', () => {
    const state = createState();
    const result = evaluateCombosForTurn(state, 'human');

    expect(result.evaluation.results.length).toBeGreaterThan(0);
    expect(result.updatedTruth).toBeGreaterThan(state.truth);
    expect(result.fxMessages.length).toBe(result.evaluation.results.length);
    expect(result.logEntries[0]).toContain('Combos triggered');

    const summary = getLastComboSummary();
    expect(summary).not.toBeNull();
    expect(summary?.player).toBe('P1');
    expect(summary?.turn).toBe(state.turn);
  });
});
