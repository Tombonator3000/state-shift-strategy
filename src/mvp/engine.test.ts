import { describe, expect, it } from 'bun:test';
import { canPlay, endTurn, resolve, winCheck } from './engine';
import type { Card, GameState, PlayerState } from './types';

const createPlayer = (id: 'P1' | 'P2', overrides: Partial<PlayerState> = {}): PlayerState => ({
  id,
  faction: overrides.faction ?? (id === 'P1' ? 'truth' : 'government'),
  deck: overrides.deck ?? [],
  hand: overrides.hand ?? [],
  discard: overrides.discard ?? [],
  ip: overrides.ip ?? 0,
  states: overrides.states ?? [],
});

const createState = (overrides: Partial<GameState> = {}): GameState => ({
  turn: overrides.turn ?? 1,
  currentPlayer: overrides.currentPlayer ?? 'P1',
  truth: overrides.truth ?? 50,
  players: overrides.players ?? {
    P1: createPlayer('P1', overrides.players?.P1),
    P2: createPlayer('P2', overrides.players?.P2),
  },
  pressureByState: overrides.pressureByState ?? { CA: { P1: 0, P2: 0 } },
  stateDefense: overrides.stateDefense ?? { CA: 2 },
  playsThisTurn: overrides.playsThisTurn ?? 0,
});

const attackCard: Card = {
  id: 'attack',
  name: 'Attack',
  faction: 'truth',
  type: 'ATTACK',
  rarity: 'common',
  cost: 2,
  effects: { ipDelta: { opponent: 3 } },
};

const mediaCard: Card = {
  id: 'media',
  name: 'Media',
  faction: 'truth',
  type: 'MEDIA',
  rarity: 'common',
  cost: 3,
  effects: { truthDelta: 5 },
};

const zoneCard: Card = {
  id: 'zone',
  name: 'Zone',
  faction: 'truth',
  type: 'ZONE',
  rarity: 'common',
  cost: 4,
  effects: { pressureDelta: 3 },
};

describe('canPlay', () => {
  it('blocks playing more than three cards per turn', () => {
    const state = createState({ playsThisTurn: 3 });
    const result = canPlay(state, attackCard);
    expect(result.ok).toBeFalse();
    expect(result.reason).toBe('play-limit');
  });

  it('requires enough IP to play a card', () => {
    const state = createState({
      players: {
        P1: createPlayer('P1', { ip: 1 }),
        P2: createPlayer('P2'),
      },
    });
    const result = canPlay(state, attackCard);
    expect(result.ok).toBeFalse();
    expect(result.reason).toBe('insufficient-ip');
  });

  it('requires a valid target state for ZONE cards', () => {
    const state = createState({
      players: {
        P1: createPlayer('P1', { ip: 10 }),
        P2: createPlayer('P2'),
      },
    });
    const result = canPlay(state, zoneCard);
    expect(result.ok).toBeFalse();
    expect(result.reason).toBe('missing-target');
  });
});

describe('resolve', () => {
  it('prevents opponent IP from dropping below zero', () => {
    const state = createState({
      players: {
        P1: createPlayer('P1', { ip: 10 }),
        P2: createPlayer('P2', { ip: 2 }),
      },
    });

    const result = resolve(state, 'P1', attackCard);
    expect(result.players.P2.ip).toBe(0);
    expect(state.players.P2.ip).toBe(2);
  });

  it('discards the correct number of opponent cards', () => {
    const originalRandom = Math.random;
    Math.random = () => 0;
    try {
      const opponentHand: Card[] = [
        { ...attackCard, id: 'opp-1' },
        { ...attackCard, id: 'opp-2' },
      ];
      const attackWithDiscard: Card = {
        ...attackCard,
        effects: { ipDelta: { opponent: 1 }, discardOpponent: 2 },
      };
      const state = createState({
        players: {
          P1: createPlayer('P1'),
          P2: createPlayer('P2', { hand: opponentHand, discard: [] }),
        },
      });

      const result = resolve(state, 'P1', attackWithDiscard);
      expect(result.players.P2.hand.length).toBe(0);
      expect(result.players.P2.discard.length).toBe(2);
    } finally {
      Math.random = originalRandom;
    }
  });

  it('clamps truth between 0 and 100 for MEDIA cards', () => {
    const state = createState({ truth: 98 });
    const result = resolve(state, 'P1', mediaCard);
    expect(result.truth).toBe(100);
    const lowerState = createState({ truth: 3 });
    const negativeMedia: Card = { ...mediaCard, effects: { truthDelta: -10 } };
    const lowerResult = resolve(lowerState, 'P1', negativeMedia);
    expect(lowerResult.truth).toBe(0);
  });

  it('captures a state when pressure meets or exceeds defense', () => {
    const state = createState({
      pressureByState: { CA: { P1: 0, P2: 0 } },
      stateDefense: { CA: 2 },
      players: {
        P1: createPlayer('P1', { states: [] }),
        P2: createPlayer('P2', { states: ['CA'] }),
      },
    });

    const result = resolve(state, 'P1', zoneCard, 'CA');
    expect(result.pressureByState.CA).toEqual({ P1: 0, P2: 0 });
    expect(result.players.P1.states).toContain('CA');
    expect(result.players.P2.states).not.toContain('CA');
  });
});

describe('endTurn', () => {
  const cardA: Card = { ...attackCard, id: 'A' };
  const cardB: Card = { ...attackCard, id: 'B' };

  it('allows one free discard without IP cost', () => {
    const state = createState({
      players: {
        P1: createPlayer('P1', { hand: [cardA, cardB], discard: [], ip: 5 }),
        P2: createPlayer('P2'),
      },
    });

    const result = endTurn(state, ['A']);
    expect(result.players.P1.ip).toBe(5);
    expect(result.players.P1.hand.map(card => card.id)).toEqual(['B']);
    expect(result.players.P1.discard.map(card => card.id)).toContain('A');
    expect(result.currentPlayer).toBe('P2');
  });

  it('charges IP for additional discards', () => {
    const state = createState({
      players: {
        P1: createPlayer('P1', { hand: [cardA, cardB], discard: [], ip: 5 }),
        P2: createPlayer('P2'),
      },
    });

    const result = endTurn(state, ['A', 'B']);
    expect(result.players.P1.ip).toBe(4);
    expect(result.players.P1.hand.length).toBe(0);
    expect(result.players.P1.discard.length).toBe(2);
  });
});

describe('winCheck', () => {
  it('detects a state-control victory', () => {
    const state = createState({
      players: {
        P1: createPlayer('P1', { states: Array.from({ length: 10 }, (_, idx) => `S${idx}`) }),
        P2: createPlayer('P2'),
      },
    });
    const result = winCheck(state);
    expect(result).toEqual({ winner: 'P1', reason: 'states' });
  });

  it('detects a truth-track victory for the truth faction', () => {
    const state = createState({ truth: 92 });
    const result = winCheck(state);
    expect(result).toEqual({ winner: 'P1', reason: 'truth' });
  });

  it('detects a truth-track victory for the government faction', () => {
    const state = createState({
      truth: 8,
      players: {
        P1: createPlayer('P1', { faction: 'truth' }),
        P2: createPlayer('P2', { faction: 'government' }),
      },
    });
    const result = winCheck(state);
    expect(result).toEqual({ winner: 'P2', reason: 'truth' });
  });

  it('detects an IP victory', () => {
    const state = createState({ players: { P1: createPlayer('P1'), P2: createPlayer('P2', { ip: 205 }) } });
    const result = winCheck(state);
    expect(result).toEqual({ winner: 'P2', reason: 'ip' });
  });
});
