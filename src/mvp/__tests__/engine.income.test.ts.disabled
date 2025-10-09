import { describe, expect, it } from 'bun:test';

import {
  DEFAULT_IP_MAINTENANCE,
  DEFAULT_CATCH_UP_SETTINGS,
  computeTurnIpIncome,
  evaluateCatchUpAdjustments,
  startTurn,
} from '@/mvp/engine';
import type { Card, GameState, PlayerState } from '@/mvp/validator';

type PartialPlayer = Partial<PlayerState> & Pick<PlayerState, 'ip'>;

const makePlayer = (partial: PartialPlayer): PlayerState => ({
  id: partial.id ?? 'P1',
  faction: partial.faction ?? 'truth',
  deck: partial.deck ?? [],
  hand: partial.hand ?? [],
  discard: partial.discard ?? [],
  ip: partial.ip,
  states: partial.states ?? [],
  nextAttackMultiplier: partial.nextAttackMultiplier,
});

const makeCard = (id: string, faction: 'truth' | 'government' = 'truth'): Card => ({
  id,
  name: id,
  type: 'ATTACK',
  rarity: 'common',
  cost: 0,
  faction,
  effects: { ipDelta: { opponent: 0 } },
});

const makeState = (currentPlayer: PlayerState, opponentIp = 0): GameState => ({
  turn: 1,
  currentPlayer: currentPlayer.id,
  truth: 50,
  players: {
    P1: currentPlayer.id === 'P1' ? currentPlayer : makePlayer({ id: 'P1', ip: opponentIp }),
    P2: currentPlayer.id === 'P2' ? currentPlayer : makePlayer({ id: 'P2', faction: 'government', ip: opponentIp }),
  },
  pressureByState: {},
  stateDefense: {},
  playsThisTurn: 0,
  turnPlays: [],
  log: [],
  headlineLog: [],
  extraExtraFeed: [],
  turnBuffer: [],
  winner: null,
  victoryType: null,
  tabloidRelicsRuntime: null,
});

describe('evaluateCatchUpAdjustments', () => {
  it('ignores small gaps within the grace windows', () => {
    const result = evaluateCatchUpAdjustments(8, 1);
    expect(result).toEqual({ swingTax: 0, catchUpBonus: 0, ipGap: 8, stateGap: 1 });
  });

  it('applies swing tax in steps and respects the cap', () => {
    const bigLead = evaluateCatchUpAdjustments(35, 4);
    expect(bigLead.swingTax).toBe(DEFAULT_CATCH_UP_SETTINGS.maxModifier);
    expect(bigLead.catchUpBonus).toBe(0);
  });

  it('awards catch-up bonuses symmetrically for large deficits', () => {
    const trailer = evaluateCatchUpAdjustments(-28, -3);
    expect(trailer.catchUpBonus).toBe(DEFAULT_CATCH_UP_SETTINGS.maxModifier);
    expect(trailer.swingTax).toBe(0);
  });
});

describe('computeTurnIpIncome', () => {
  it('returns full base income when under the maintenance threshold', () => {
    const player = makePlayer({ id: 'P1', ip: 20, states: ['ca', 'ny'] });
    const opponent = makePlayer({ id: 'P2', faction: 'government', ip: 25, states: ['tx'] });

    const result = computeTurnIpIncome(player, opponent);

    expect(result).toEqual({
      baseIncome: 7,
      maintenance: 0,
      swingTax: 0,
      catchUpBonus: 0,
      netIncome: 7,
      ipGap: -5,
      stateGap: 1,
      stateIncomeDetails: [
        {
          state: 'California',
          abbreviation: 'CA',
          count: 1,
          fallback: false,
        },
        {
          state: 'New York',
          abbreviation: 'NY',
          count: 1,
          fallback: false,
        },
      ],
    });
  });

  it('applies maintenance when reserves exceed the threshold', () => {
    const player = makePlayer({ id: 'P1', ip: 65, states: ['tx'] });
    const opponent = makePlayer({ id: 'P2', faction: 'government', ip: 60, states: ['ca', 'ny'] });

    const result = computeTurnIpIncome(player, opponent);

    expect(result).toEqual({
      baseIncome: 6,
      maintenance: 2,
      swingTax: 0,
      catchUpBonus: 0,
      netIncome: 4,
      ipGap: 5,
      stateGap: -1,
      stateIncomeDetails: [
        {
          state: 'Texas',
          abbreviation: 'TX',
          count: 1,
          fallback: false,
        },
      ],
    });
  });

  it('never yields negative net income even with massive reserves', () => {
    const player = makePlayer({ id: 'P1', ip: 200, states: [] });
    const opponent = makePlayer({ id: 'P2', faction: 'government', ip: 50, states: ['wa', 'or', 'ca'] });

    const result = computeTurnIpIncome(player, opponent);

    expect(result.netIncome).toBe(0);
    expect(result.maintenance).toBeGreaterThanOrEqual(DEFAULT_IP_MAINTENANCE.divisor);
    expect(result.swingTax).toBeLessThanOrEqual(DEFAULT_CATCH_UP_SETTINGS.maxModifier);
    expect(result.stateIncomeDetails).toEqual([]);
  });

  it('grants a catch-up bonus when trailing significantly', () => {
    const player = makePlayer({ id: 'P1', ip: 18, states: ['nm'] });
    const opponent = makePlayer({ id: 'P2', faction: 'government', ip: 60, states: ['ca', 'ny', 'tx', 'wa'] });

    const result = computeTurnIpIncome(player, opponent);

    expect(result.catchUpBonus).toBeGreaterThan(0);
    expect(result.swingTax).toBe(0);
    expect(result.netIncome).toBe(result.baseIncome + result.catchUpBonus);
    expect(result.stateIncomeDetails).toEqual([
      {
        state: 'New Mexico',
        abbreviation: 'NM',
        count: 1,
        fallback: false,
      },
    ]);
  });

  it('applies swing tax when leading by IP and states', () => {
    const player = makePlayer({ id: 'P1', ip: 90, states: ['ca', 'ny', 'tx', 'wa', 'fl'] });
    const opponent = makePlayer({ id: 'P2', faction: 'government', ip: 20, states: ['nm'] });

    const result = computeTurnIpIncome(player, opponent);

    expect(result.swingTax).toBeGreaterThan(0);
    expect(result.catchUpBonus).toBe(0);
    expect(result.netIncome).toBeLessThan(result.baseIncome);
    expect(result.stateIncomeDetails).toEqual([
      {
        state: 'California',
        abbreviation: 'CA',
        count: 1,
        fallback: false,
      },
      {
        state: 'New York',
        abbreviation: 'NY',
        count: 1,
        fallback: false,
      },
      {
        state: 'Texas',
        abbreviation: 'TX',
        count: 1,
        fallback: false,
      },
      {
        state: 'Washington',
        abbreviation: 'WA',
        count: 1,
        fallback: false,
      },
      {
        state: 'Florida',
        abbreviation: 'FL',
        count: 1,
        fallback: false,
      },
    ]);
  });
});

describe('startTurn upkeep integration', () => {
  it('adds log entries and reduces income when maintenance applies', () => {
    const player = makePlayer({ id: 'P1', ip: 65, states: ['fl'] });
    const state = makeState(player, 60);

    const updated = startTurn(state);
    const updatedPlayer = updated.players.P1;

    expect(updatedPlayer.ip).toBe(69);
    const incomeLog = updated.log.at(-2);
    expect(incomeLog).toBeDefined();
    expect(incomeLog).toContain('income +6 IP');
    expect(incomeLog).toContain('base 5');
    expect(incomeLog).toContain('states FL');

    const maintenanceLog = updated.log.at(-1);
    expect(maintenanceLog).toBeDefined();
    expect(maintenanceLog).toContain('maintenance -2 IP');
    expect(maintenanceLog).toContain(`threshold ${DEFAULT_IP_MAINTENANCE.threshold}`);
    expect(maintenanceLog).toContain(`divisor ${DEFAULT_IP_MAINTENANCE.divisor}`);
  });

  it('logs swing tax and catch-up bonus explanations', () => {
    const leader = makePlayer({ id: 'P1', ip: 80, states: ['ca', 'ny', 'tx', 'wa'] });
    const trailer = makePlayer({ id: 'P2', ip: 18, states: ['nm'] });
    const leaderState = makeState(leader, trailer.ip);
    leaderState.players.P2 = trailer;

    const leaderTurn = startTurn(leaderState);
    expect(leaderTurn.log.at(-1)).toContain('swing tax');
    expect(leaderTurn.log.at(-1)).toMatch(/lead/);

    const trailerState = { ...leaderState, currentPlayer: 'P2' as const };
    const trailerTurn = startTurn(trailerState);
    expect(trailerTurn.log.at(-1)).toContain('catch-up bonus');
    expect(trailerTurn.log.at(-1)).toMatch(/behind/);
  });

  it('reshuffles the discard pile when the deck is exhausted while drawing', () => {
    const player = makePlayer({
      id: 'P1',
      ip: 10,
      hand: [makeCard('hand-1'), makeCard('hand-2')],
      deck: [makeCard('deck-1')],
      discard: [makeCard('discard-1'), makeCard('discard-2'), makeCard('discard-3')],
    });
    const state = makeState(player, 0);

    const originalRandom = Math.random;
    const sequence = [0.42, 0.18, 0.73];
    let index = 0;
    Math.random = () => {
      const value = sequence[index];
      index = Math.min(sequence.length, index + 1);
      return value ?? 0.5;
    };

    try {
      const updated = startTurn(state);
      const updatedPlayer = updated.players.P1;

      expect(updatedPlayer.hand).toHaveLength(5);
      expect(updatedPlayer.discard).toHaveLength(0);
      expect(updatedPlayer.deck).toHaveLength(1);

      const reshuffleLog = updated.log.find(entry => entry.includes('reshuffles discard into deck'));
      expect(reshuffleLog).toBeDefined();

      const originalHandIds = new Set(player.hand.map(card => card.id));
      const originalDeckIds = new Set(player.deck.map(card => card.id));
      const originalDiscardIds = new Set(player.discard.map(card => card.id));

      const drawnIds = updatedPlayer.hand
        .map(card => card.id)
        .filter(id => !originalHandIds.has(id));
      expect(drawnIds).toHaveLength(3);

      const drawnFromDiscard = drawnIds.filter(id => originalDiscardIds.has(id));
      expect(drawnFromDiscard.length).toBeGreaterThanOrEqual(2);

      const remainingDeckIds = updatedPlayer.deck.map(card => card.id);
      remainingDeckIds.forEach(id => {
        expect(originalDeckIds.has(id) || originalDiscardIds.has(id)).toBe(true);
      });
    } finally {
      Math.random = originalRandom;
    }
  });
});
