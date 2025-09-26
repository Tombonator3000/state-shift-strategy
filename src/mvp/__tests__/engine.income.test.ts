import { describe, expect, it } from 'bun:test';

import {
  DEFAULT_IP_MAINTENANCE,
  computeTurnIpIncome,
  startTurn,
} from '@/mvp/engine';
import type { GameState, PlayerState } from '@/mvp/validator';

type PartialPlayer = Partial<PlayerState> & Pick<PlayerState, 'ip'>;

const makePlayer = (partial: PartialPlayer): PlayerState => ({
  id: partial.id ?? 'P1',
  faction: partial.faction ?? 'truth',
  deck: partial.deck ?? [],
  hand: partial.hand ?? [],
  discard: partial.discard ?? [],
  ip: partial.ip,
  states: partial.states ?? [],
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
});

describe('computeTurnIpIncome', () => {
  it('returns full base income when under the maintenance threshold', () => {
    const player = makePlayer({ id: 'P1', ip: 20, states: ['ca', 'ny'] });

    const result = computeTurnIpIncome(player);

    expect(result).toEqual({ baseIncome: 7, maintenance: 0, netIncome: 7 });
  });

  it('applies maintenance when reserves exceed the threshold', () => {
    const player = makePlayer({ id: 'P1', ip: 65, states: ['tx'] });

    const result = computeTurnIpIncome(player);

    expect(result).toEqual({ baseIncome: 6, maintenance: 2, netIncome: 4 });
  });

  it('never yields negative net income even with massive reserves', () => {
    const player = makePlayer({ id: 'P1', ip: 200, states: [] });

    const result = computeTurnIpIncome(player);

    expect(result.netIncome).toBe(0);
    expect(result.maintenance).toBeGreaterThanOrEqual(DEFAULT_IP_MAINTENANCE.divisor);
  });
});

describe('startTurn upkeep integration', () => {
  it('adds log entries and reduces income when maintenance applies', () => {
    const player = makePlayer({ id: 'P1', ip: 65, states: ['fl'] });
    const state = makeState(player);

    const updated = startTurn(state);
    const updatedPlayer = updated.players.P1;

    expect(updatedPlayer.ip).toBe(65 + 4);
    const maintenanceLog = updated.log.at(-1);
    expect(maintenanceLog).toBeDefined();
    expect(maintenanceLog).toContain('maintenance -2 IP');
    expect(maintenanceLog).toContain(`threshold ${DEFAULT_IP_MAINTENANCE.threshold}`);
    expect(maintenanceLog).toContain(`divisor ${DEFAULT_IP_MAINTENANCE.divisor}`);
  });
});
