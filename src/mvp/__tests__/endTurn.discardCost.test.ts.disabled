import { describe, expect, it } from 'bun:test';

import { endTurn } from '../engine';
import type { Card, GameState, PlayerId, PlayerState } from '../validator';

const createCard = (id: string): Card => ({
  id,
  name: id,
  type: 'MEDIA',
  faction: 'truth',
  rarity: 'common',
  cost: 1,
  effects: { truthDelta: 0 },
});

const createPlayer = (id: PlayerId, overrides: Partial<PlayerState> = {}): PlayerState => ({
  id,
  faction: overrides.faction ?? (id === 'P1' ? 'truth' : 'government'),
  deck: overrides.deck ?? [],
  hand: overrides.hand ?? [],
  discard: overrides.discard ?? [],
  ip: overrides.ip ?? 0,
  states: overrides.states ?? [],
  nextAttackMultiplier: overrides.nextAttackMultiplier,
});

const createState = (player: PlayerState, opponent: PlayerState): GameState => ({
  turn: 1,
  currentPlayer: player.id,
  truth: 50,
  players: {
    [player.id]: player,
    [opponent.id]: opponent,
  } as Record<PlayerId, PlayerState>,
  pressureByState: {},
  stateDefense: {},
  playsThisTurn: 0,
  turnPlays: [],
  log: [],
});

describe('endTurn discard IP scaling', () => {
  it('charges 10 IP for the second discard', () => {
    const hand = [createCard('c1'), createCard('c2'), createCard('c3')];
    const player = createPlayer('P1', { hand, ip: 50 });
    const opponent = createPlayer('P2', { ip: 20 });
    const state = createState(player, opponent);

    const result = endTurn(state, ['c1', 'c2']);

    expect(result.summary.discarded.extraCost).toBe(10);
    expect(result.state.players.P1.ip).toBe(40);
  });

  it('charges 25 IP total for discarding three cards', () => {
    const hand = [createCard('c1'), createCard('c2'), createCard('c3'), createCard('c4')];
    const player = createPlayer('P1', { hand, ip: 80 });
    const opponent = createPlayer('P2', { ip: 20 });
    const state = createState(player, opponent);

    const result = endTurn(state, ['c1', 'c2', 'c3']);

    expect(result.summary.discarded.extraCost).toBe(25);
    expect(result.state.players.P1.ip).toBe(55);
  });

  it('never reduces IP below zero even with large discard costs', () => {
    const hand = [createCard('c1'), createCard('c2'), createCard('c3'), createCard('c4')];
    const player = createPlayer('P1', { hand, ip: 5 });
    const opponent = createPlayer('P2', { ip: 20 });
    const state = createState(player, opponent);

    const result = endTurn(state, ['c1', 'c2', 'c3']);

    expect(result.summary.discarded.extraCost).toBe(25);
    expect(result.state.players.P1.ip).toBe(0);
  });
});

