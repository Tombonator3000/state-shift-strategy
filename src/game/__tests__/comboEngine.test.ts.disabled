import { describe, expect, test } from 'bun:test';

import { applyComboRewards, evaluateCombos, formatComboReward } from '../comboEngine';
import type { GameState, TurnPlay } from '../combo.types';

const buildMediaPlay = (sequence: number): TurnPlay => ({
  sequence,
  stage: 'resolve',
  owner: 'P2',
  cardId: `media_${sequence}`,
  cardName: `Media Blast ${sequence}`,
  cardType: 'MEDIA',
  cardRarity: 'common',
  cost: 1,
});

describe('comboEngine truth formatting', () => {
  test('government combos display signed truth change', () => {
    const turnPlays: TurnPlay[] = [buildMediaPlay(1), buildMediaPlay(2), buildMediaPlay(3)];

    const state: GameState = {
      turn: 3,
      currentPlayer: 'P2',
      truth: 50,
      players: {
        P1: { id: 'P1', faction: 'truth', deck: [], hand: [], discard: [], ip: 0, states: [] },
        P2: {
          id: 'P2',
          faction: 'government',
          deck: [],
          hand: [],
          discard: [],
          ip: 0,
          states: [],
        },
      },
      pressureByState: {},
      stateDefense: {},
      playsThisTurn: turnPlays.length,
      turnPlays,
      log: [],
    } satisfies GameState;

    const initialTruth = state.truth;
    const evaluation = evaluateCombos(state, 'P2');
    expect(evaluation.results.length).toBeGreaterThan(0);

    const formattedTruthValues = evaluation.results
      .map(result => formatComboReward(result.appliedReward, { faction: 'government' }))
      .map(text => {
        const match = text.match(/([+-]\d+)\s+Truth/);
        return match ? Number(match[1]) : 0;
      })
      .filter(value => value !== 0);

    expect(formattedTruthValues.length).toBeGreaterThan(0);

    const updated = applyComboRewards(state, 'P2', evaluation);
    const actualTruthDelta = updated.truth - initialTruth;
    const displayedTruthDelta = formattedTruthValues.reduce((sum, value) => sum + value, 0);

    expect(displayedTruthDelta).toBe(actualTruthDelta);
  });
});
