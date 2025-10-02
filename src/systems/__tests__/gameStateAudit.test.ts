import { describe, expect, it } from 'bun:test';

import { auditGameState, GameStateAuditError } from '@/mvp/gameStateAudit';
import type { GameState, PlayerState } from '@/mvp/validator';

const createPlayer = (overrides: Partial<PlayerState> = {}): PlayerState => ({
  id: 'P1',
  faction: 'truth',
  deck: [],
  hand: [],
  discard: [],
  ip: 10,
  states: [],
  ...overrides,
});

const createGameState = (overrides: Partial<GameState> = {}): GameState => ({
  turn: 1,
  currentPlayer: 'P1',
  truth: 50,
  players: {
    P1: createPlayer(),
    P2: createPlayer({ id: 'P2', faction: 'government' }),
  },
  pressureByState: {},
  stateDefense: {},
  playsThisTurn: 0,
  turnPlays: [],
  log: [],
  ...overrides,
});

describe('auditGameState', () => {
  it('accepts a valid state and returns findings', () => {
    const state = createGameState({
      players: {
        P1: createPlayer({ id: 'P1', faction: 'truth', states: ['NV'], ip: 24 }),
        P2: createPlayer({ id: 'P2', faction: 'government', states: ['OR'], ip: 18 }),
      },
      pressureByState: {
        NV: { P1: 0, P2: 0 },
        OR: { P1: 0, P2: 0 },
      },
      stateDefense: { NV: 2, OR: 3 },
    });

    const findings = auditGameState(state);

    expect(findings).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          level: 'info',
          message: expect.stringContaining('Turn 1 audit completed'),
        }),
      ]),
    );
  });

  it('throws when truth is outside the allowed range', () => {
    const state = createGameState({ truth: 120 });

    expect(() => auditGameState(state)).toThrow(GameStateAuditError);
    expect(() => auditGameState(state)).toThrow(/Truth value 120/);
  });

  it('throws when a controlled state lacks pressure tracking', () => {
    const state = createGameState({
      players: {
        P1: createPlayer({ id: 'P1', faction: 'truth', states: ['NV'] }),
        P2: createPlayer({ id: 'P2', faction: 'government' }),
      },
      pressureByState: {},
      stateDefense: {},
    });

    expect(() => auditGameState(state)).toThrow(/Missing pressure entry/);
  });

  it('throws when player IP becomes negative', () => {
    const state = createGameState({
      players: {
        P1: createPlayer({ id: 'P1', faction: 'truth', ip: -1 }),
        P2: createPlayer({ id: 'P2', faction: 'government' }),
      },
    });

    expect(() => auditGameState(state)).toThrow(/IP cannot be negative/);
  });
});
