import { describe, expect, it } from 'bun:test';
import { HAND_LIMIT, prepareHumanTurnStart, prepareAITurnStart } from '@/state/turnPreparation';
import type { GameState } from '@/state/gameState';
import type { GameCard } from '@/types/cardTypes';
import { getTotalIPFromStates } from '@/data/usaStates';

const createCard = (id: string, faction: 'truth' | 'government' = 'truth'): GameCard => ({
  id,
  name: id,
  type: 'MEDIA',
  faction,
  cost: 1,
  flavorTruth: 'flavor',
  flavorGov: 'flavor',
});

const createGameState = (overrides: Partial<GameState> = {}): GameState => ({
  faction: 'truth',
  phase: 'newspaper',
  turn: 2,
  round: 1,
  currentPlayer: 'human',
  aiDifficulty: 'medium',
  aiPersonality: undefined,
  truth: 55,
  ip: 18,
  aiIP: 20,
  hand: [],
  aiHand: [],
  isGameOver: false,
  deck: [],
  discardPile: [],
  aiDeck: [],
  aiDiscardPile: [],
  cardsPlayedThisTurn: 0,
  cardsPlayedThisRound: [],
  controlledStates: [],
  aiControlledStates: [],
  states: [
    {
      id: 'CA',
      name: 'California',
      abbreviation: 'CA',
      baseIP: 6,
      defense: 3,
      pressure: 0,
      owner: 'neutral' as const,
      specialBonus: undefined,
      bonusValue: 0,
    },
  ],
  currentEvents: [],
  eventManager: undefined,
  showNewspaper: true,
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

describe('prepareHumanTurnStart', () => {
  it('refills the player hand from discard after newspaper and logs the reshuffle', () => {
    const startingHand = [createCard('h1'), createCard('h2')];
    const discardPile = [createCard('d1'), createCard('d2'), createCard('d3'), createCard('d4')];

    const state = createGameState({
      hand: startingHand,
      deck: [],
      discardPile,
      currentPlayer: 'human',
      pendingCardDraw: 0,
    });

    const result = prepareHumanTurnStart(state);

    expect(result.patch.hand?.length).toBe(HAND_LIMIT);
    expect(result.patch.deck?.length).toBe(discardPile.length - (HAND_LIMIT - startingHand.length));
    expect(result.patch.discardPile).toEqual([]);
    expect(result.patch.pendingCardDraw).toBe(0);
    expect(result.patch.cardsPlayedThisTurn).toBe(0);
    expect(result.patch.phase).toBe('action');
    expect(result.patch.currentPlayer).toBe('human');

    expect(result.logEntries.some(entry => entry.includes('Deck reshuffled from discard pile'))).toBe(true);
    expect(result.logEntries.some(entry => entry.includes(`Drew ${HAND_LIMIT - startingHand.length} card`))).toBe(true);
    expect(result.logEntries.some(entry => entry.includes('Deck exhausted'))).toBe(false);
  });
});

describe('prepareAITurnStart', () => {
  it('grants AI income, refills hand from discard, and logs the draw summary', () => {
    const aiStartingHand = [createCard('a1', 'government'), createCard('a2', 'government')];
    const aiDiscard = [
      createCard('ad1', 'government'),
      createCard('ad2', 'government'),
      createCard('ad3', 'government'),
      createCard('ad4', 'government'),
    ];

    const state = createGameState({
      currentPlayer: 'ai',
      aiHand: aiStartingHand,
      aiDeck: [],
      aiDiscardPile: aiDiscard,
      aiIP: 30,
      states: [
        {
          id: 'CA',
          name: 'California',
          abbreviation: 'CA',
          baseIP: 6,
          defense: 3,
          pressure: 0,
          owner: 'ai' as const,
          specialBonus: undefined,
          bonusValue: 0,
        },
      ],
    });

    const result = prepareAITurnStart(state);
    const expectedIncome = 5 + getTotalIPFromStates(['CA']);

    expect(result.patch.aiHand?.length).toBe(HAND_LIMIT);
    expect(result.patch.aiDeck?.length).toBe(aiDiscard.length - (HAND_LIMIT - aiStartingHand.length));
    expect(result.patch.aiDiscardPile).toEqual([]);
    expect(result.patch.aiIP).toBe(state.aiIP + expectedIncome);
    expect(result.patch.cardsPlayedThisTurn).toBe(0);

    expect(result.logEntries[0]).toContain('AI Income');
    expect(result.logEntries.some(entry => entry.includes('AI reshuffled discard into new deck'))).toBe(true);
    expect(result.logEntries.some(entry => entry.includes(`AI drew ${HAND_LIMIT - aiStartingHand.length} card`))).toBe(true);
    expect(result.logEntries.some(entry => entry.includes('AI deck exhausted'))).toBe(false);
  });
});
