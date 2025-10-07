import { describe, expect, it } from 'bun:test';

import { auditGameState, GameStateAuditError } from '@/mvp/gameStateAudit';
import type { GameState, PlayerState } from '@/mvp/validator';
import { resolveCardMVP, type GameSnapshot } from '@/systems/cardResolution';
import type { GameCard } from '@/rules/mvp';

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
          message: expect.stringContaining("Player P1 controls 1 state"),
        }),
        expect.objectContaining({
          level: 'info',
          message: expect.stringContaining('Turn 1 audit completed'),
        }),
      ]),
    );
  });

  it('returns a warning when a controlled state is contested by opponent pressure', () => {
    const state = createGameState({
      players: {
        P1: createPlayer({ id: 'P1', faction: 'truth', states: ['CA'] }),
        P2: createPlayer({ id: 'P2', faction: 'government' }),
      },
      pressureByState: {
        CA: { P1: 0, P2: 3 },
      },
      stateDefense: { CA: 1 },
    });

    const findings = auditGameState(state);

    expect(findings).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          level: 'warning',
          message: "State 'CA' controlled by P1 is contested by P2 pressure 3",
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

  it('throws when pressure values are invalid', () => {
    const state = createGameState({
      players: {
        P1: createPlayer({ id: 'P1', faction: 'truth', states: ['AZ'] }),
        P2: createPlayer({ id: 'P2', faction: 'government' }),
      },
      pressureByState: {
        AZ: { P1: -1, P2: 0 },
      },
      stateDefense: { AZ: 1 },
    });

    expect(() => auditGameState(state)).toThrow(/cannot be negative/);
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

  it('normalizes conflicting state control before auditing resolved plays', () => {
    const snapshot: GameSnapshot = {
      truth: 50,
      ip: 12,
      aiIP: 15,
      hand: [],
      aiHand: [],
      controlledStates: ['NV'],
      aiControlledStates: ['NV'],
      round: 1,
      turn: 1,
      faction: 'truth',
      states: [
        {
          id: 'NV',
          name: 'Nevada',
          abbreviation: 'NV',
          baseIP: 2,
          baseDefense: 3,
          defense: 3,
          pressure: 0,
          pressurePlayer: 0,
          pressureAi: 0,
          contested: false,
          owner: 'player',
        },
      ],
    };

    const mediaCard: GameCard = {
      id: 'test-media',
      name: 'Test Broadcast',
      type: 'MEDIA',
      faction: 'truth',
      rarity: 'common',
      cost: 0,
      effects: { truthDelta: 0 },
    };

    const resolution = resolveCardMVP(snapshot, mediaCard, null, 'human');

    expect(resolution.controlledStates).toContain('NV');
    expect(resolution.aiControlledStates).not.toContain('NV');
  });
});
