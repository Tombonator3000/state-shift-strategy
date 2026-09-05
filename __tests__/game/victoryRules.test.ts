import { describe, expect, it } from 'bun:test';
import { evaluateStandardVictory } from '@/game/victoryRules';
import { endTurn, winCheck } from '@/mvp/engine';
import type { GameState } from '@/mvp/validator';

function match(faction: 'truth' | 'government' = 'truth'): GameState {
  return {
    turn: 1, currentPlayer: 'P1', truth: 50, playsThisTurn: 0, turnPlays: [], turnBuffer: [], log: [],
    headlineLog: [], extraExtraFeed: [], winner: null, victoryType: null, finalEdition: null,
    traps: [], persistentEffects: [], tabloidRelicsRuntime: null, pressureByState: {}, stateDefense: {},
    players: {
      P1: { id: 'P1', faction, deck: [], hand: [], discard: [], ip: 5, states: [] },
      P2: { id: 'P2', faction: faction === 'truth' ? 'government' : 'truth', deck: [], hand: [], discard: [], ip: 5, states: [] },
    },
  };
}

describe('live and simulation victory parity', () => {
  for (const faction of ['truth', 'government'] as const) {
    for (const truth of [10, 90]) {
      it(`${faction} player at ${truth}% awards the correct faction`, () => {
        const state = match(faction);
        state.truth = truth;
        const expected = (truth === 90 ? 'truth' : 'government') === faction ? 'P1' : 'P2';
        expect(winCheck(state)).toEqual({ winner: expected, reason: 'truth' });
        const live = evaluateStandardVictory({ truth, contenders: Object.values(state.players).map(player => ({ ...player, states: player.states.length })) });
        expect(live).toEqual({ winner: expected, victoryType: 'truth' });
      });
    }
  }

  it('keeps a match running inside both boundaries and below 200 IP', () => {
    for (const truth of [10.01, 89.99]) {
      const state = match(); state.truth = truth; state.players.P1.ip = 199;
      expect(winCheck(state)).toEqual({});
    }
  });

  it('awards exactly 200 IP and gives Truth priority over IP and territory', () => {
    const state = match(); state.players.P2.ip = 200;
    expect(winCheck(state)).toEqual({ winner: 'P2', reason: 'ip' });
    state.truth = 90; state.players.P2.states = Array.from({ length: 10 }, (_, index) => String(index));
    expect(winCheck(state)).toEqual({ winner: 'P1', reason: 'truth' });
  });

  it('requires ten distinct territories and honors scenario thresholds', () => {
    const state = match(); state.players.P1.states = Array(10).fill('CA');
    expect(winCheck(state)).toEqual({});
    state.players.P1.states = Array.from({ length: 10 }, (_, index) => String(index));
    expect(winCheck(state)).toEqual({ winner: 'P1', reason: 'states' });
    expect(evaluateStandardVictory({ truth: 80, truthHigh: 80, contenders: [{ id: 'human', faction: 'truth', ip: 0, states: 0 }] })).toEqual({ winner: 'human', victoryType: 'truth' });
  });

  it('does not discard paid cards the player cannot afford at turn end', () => {
    const state = match(); state.players.P1.ip = 9;
    state.players.P1.hand = ['a', 'b', 'c'].map(id => ({ id, name: id, faction: 'truth', type: 'MEDIA', rarity: 'common', cost: 3, effects: { truthDelta: 1 } }));
    const result = endTurn(state, ['a', 'b', 'c']);
    expect(result.summary.discarded).toEqual({ requested: 3, discarded: 1, extraCost: 0 });
    expect(result.state.players.P1.hand.map(card => card.id)).toEqual(['b', 'c']);
    expect(state.players.P1.hand.length).toBe(3);
  });
});
