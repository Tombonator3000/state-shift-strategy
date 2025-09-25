import { describe, expect, it } from 'bun:test';

import { canPlay, playCard, startTurn, winCheck } from '@/mvp/engine';
import type { Card, GameState, PlayerState } from '@/mvp/validator';

const createCard = (overrides: Partial<Card>): Card => ({
  id: 'card-1',
  name: 'Test Card',
  type: 'MEDIA',
  faction: 'truth',
  rarity: 'common',
  cost: 2,
  effects: { truthDelta: 2 },
  ...overrides,
});

const createPlayer = (overrides: Partial<PlayerState> = {}): PlayerState => ({
  id: 'P1',
  faction: 'truth',
  deck: [],
  hand: [],
  discard: [],
  ip: 0,
  states: [],
  ...overrides,
});

const createState = (overrides: Partial<GameState> = {}): GameState => {
  const { players: playerOverrides, ...restOverrides } = overrides;
  return {
    turn: 1,
    currentPlayer: 'P1',
    truth: 50,
    players: {
      P1: createPlayer({ id: 'P1', faction: 'truth', ...(playerOverrides?.P1 ?? {}) }),
      P2: createPlayer({ id: 'P2', faction: 'government', ...(playerOverrides?.P2 ?? {}) }),
    },
    pressureByState: { CA: { P1: 0, P2: 0 } },
    stateDefense: { CA: 3 },
    playsThisTurn: 0,
    turnPlays: [],
    log: [],
    ...restOverrides,
  };
};

describe('MVP engine turn flow', () => {
  it('awards start-of-turn income and refills hand', () => {
    const deckCard = createCard({ id: 'deck-card', name: 'Deck Card' });
    const baseState = createState({
      players: {
        P1: createPlayer({
          id: 'P1',
          ip: 10,
          states: ['CA', 'NV'],
          hand: [createCard({ id: 'hand-1' }), createCard({ id: 'hand-2' })],
          deck: [deckCard, deckCard, deckCard],
        }),
      },
    });

    const result = startTurn(baseState);
    const player = result.players.P1;

    expect(player.ip).toBe(10 + 5 + 2); // base 5 + states controlled
    expect(player.hand).toHaveLength(5);
    expect(result.playsThisTurn).toBe(0);
    expect(result.turnPlays).toHaveLength(0);
  });

  it('enforces play limits and affordability checks', () => {
    const card = createCard({ cost: 4 });
    const state = createState({
      playsThisTurn: 3,
      players: {
        P1: createPlayer({ id: 'P1', hand: [card], ip: 10 }),
      },
    });

    const limitResult = canPlay(state, card);
    expect(limitResult.ok).toBe(false);
    expect(limitResult.reason).toBe('play-limit');

    const poorState = createState({
      players: {
        P1: createPlayer({ id: 'P1', hand: [card], ip: 1 }),
      },
    });
    const affordResult = canPlay(poorState, card);
    expect(affordResult.ok).toBe(false);
    expect(affordResult.reason).toBe('insufficient-ip');
  });

  it('requires zone targets and captures when pressure meets defense', () => {
    const zoneCard = createCard({
      id: 'zone',
      name: 'Pressure Play',
      type: 'ZONE',
      cost: 3,
      effects: { pressureDelta: 3 },
    });

    const before = createState({
      players: {
        P1: createPlayer({ id: 'P1', ip: 6, hand: [zoneCard], states: [] }),
        P2: createPlayer({ id: 'P2', ip: 0, states: ['CA'] }),
      },
      pressureByState: { CA: { P1: 0, P2: 0 } },
      stateDefense: { CA: 3 },
    });

    expect(() => playCard(before, 'zone')).toThrow('missing-target');

    const after = playCard(before, 'zone', 'CA');
    const player = after.players.P1;

    expect(player.ip).toBe(3);
    expect(player.discard.map(card => card.id)).toContain('zone');
    expect(player.hand).toHaveLength(0);
    expect(after.players.P1.states).toContain('CA');
    expect(after.players.P2.states).not.toContain('CA');
    expect(after.playsThisTurn).toBe(1);
    expect(after.turnPlays).toHaveLength(2); // play + resolve entries
  });
});

describe('MVP engine win conditions', () => {
  it('detects state control victories', () => {
    const result = winCheck(
      createState({
        players: {
          P1: createPlayer({ id: 'P1', states: Array.from({ length: 10 }, (_, i) => `S${i}`) }),
          P2: createPlayer({ id: 'P2', states: [] }),
        },
      }),
    );

    expect(result).toEqual({ winner: 'P1', reason: 'states' });
  });

  it('detects truth and IP thresholds for both factions', () => {
    const truthWin = winCheck(
      createState({
        truth: 96,
        players: {
          P1: createPlayer({ id: 'P1', faction: 'truth' }),
          P2: createPlayer({ id: 'P2', faction: 'government' }),
        },
      }),
    );
    expect(truthWin).toEqual({ winner: 'P1', reason: 'truth' });

    const truthLoss = winCheck(
      createState({
        truth: 4,
        players: {
          P1: createPlayer({ id: 'P1', faction: 'truth' }),
          P2: createPlayer({ id: 'P2', faction: 'government' }),
        },
      }),
    );
    expect(truthLoss).toEqual({ winner: 'P2', reason: 'truth' });

    const ipWin = winCheck(
      createState({
        players: {
          P1: createPlayer({ id: 'P1', ip: 50 }),
          P2: createPlayer({ id: 'P2', ip: 305 }),
        },
      }),
    );
    expect(ipWin).toEqual({ winner: 'P2', reason: 'ip' });
  });
});
