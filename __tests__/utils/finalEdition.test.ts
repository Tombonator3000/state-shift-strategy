import { describe, expect, it, mock } from 'bun:test';

mock.module('@/game/comboEngine', () => ({
  applyComboRewards: (state: unknown) => state,
  evaluateCombos: () => ({ results: [], totalReward: {}, logs: [] }),
  getComboSettings: () => ({ enabled: false, fxEnabled: false, comboToggles: {}, maxCombosPerTurn: 0 }),
  formatComboReward: () => '',
}));

const loadFinalEdition = () => import('../../src/utils/finalEdition');

const createState = (id: string, owner: 'player' | 'ai' | 'neutral') => ({
  id,
  name: id,
  abbreviation: id,
  owner,
});

describe('buildFinalEdition report summary', () => {
  const baseState = {
    round: 5,
    truth: 100,
    ip: 0,
    aiIP: 0,
    states: [createState('AL', 'player'), createState('AK', 'player'), createState('AZ', 'ai')],
    faction: 'truth',
    playHistory: [],
    extraExtraFeed: [],
  } as const;

  it('reports a Truth victory with final stats when the player wins', async () => {
    const { buildFinalEdition } = await loadFinalEdition();

    const report = buildFinalEdition({
      state: baseState,
      winner: 'truth',
      victoryType: 'truth',
    });

    expect(report.winner).toBe('truth');
    expect(report.victoryType).toBe('truth');
    expect(report.finalTruth).toBe(100);
    expect(report.ipPlayer).toBe(0);
    expect(report.ipAI).toBe(0);
    expect(report.statesTruth).toBe(2);
    expect(report.statesGov).toBe(1);
    expect(report.playerFaction).toBe('truth');
    expect(report.extraExtraFeed).toEqual([]);
  });

  it('reports a Government victory with the same base stats when the player loses', async () => {
    const { buildFinalEdition } = await loadFinalEdition();

    const report = buildFinalEdition({
      state: baseState,
      winner: 'government',
      victoryType: 'truth',
    });

    expect(report.winner).toBe('government');
    expect(report.victoryType).toBe('truth');
    expect(report.finalTruth).toBe(100);
    expect(report.ipPlayer).toBe(0);
    expect(report.ipAI).toBe(0);
    expect(report.statesTruth).toBe(2);
    expect(report.statesGov).toBe(1);
    expect(report.extraExtraFeed).toEqual([]);
  });
});
