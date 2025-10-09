import { describe, expect, it, mock } from 'bun:test';

mock.module('@/game/comboEngine', () => ({
  applyComboRewards: (state: unknown) => state,
  evaluateCombos: () => ({ results: [], totalReward: {}, logs: [] }),
  getComboSettings: () => ({ enabled: false, fxEnabled: false, comboToggles: {}, maxCombosPerTurn: 0 }),
  formatComboReward: () => '',
}));

const loadFinalEdition = () => import('../../src/utils/finalEdition');

const createArticle = (overrides: Partial<{ tone: 'truth' | 'government' | 'draw' } & {
  hed: string;
  dek: string;
  kicker?: string;
  byline?: string;
  source?: string;
}> = {}) => ({
  tone: 'truth' as const,
  hed: 'Truth Operatives Crack Final Case',
  dek: 'Agents trace the last anomaly and broadcast the receipts.',
  kicker: 'Truth Network · Truth Threshold',
  byline: 'Operative Dispatch',
  source: 'Truth Relay',
  bullets: [],
  ...overrides,
});

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

  it('populates a front page article when bulletins exist', async () => {
    const { buildFinalEdition } = await loadFinalEdition();

    const bulletin = createArticle({
      tone: 'truth',
      hed: 'Truth Strike Ends The Cover-Up',
      dek: 'Field teams beam out the finale confession.',
      kicker: 'Truth Network · Finale Frequency',
      byline: 'Field Desk',
      source: 'Truth Signal',
    });

    const report = buildFinalEdition({
      state: { ...baseState, extraExtraFeed: [bulletin] },
      winner: 'truth',
      victoryType: 'truth',
    });

    expect(report.frontPage).toEqual({
      tone: 'truth',
      hed: 'Truth Strike Ends The Cover-Up',
      dek: 'Field teams beam out the finale confession.',
      kicker: 'Truth Network · Finale Frequency',
      byline: 'Field Desk',
      source: 'Truth Signal',
    });
  });

  it('falls back to legacy copy when no bulletins were captured', async () => {
    const { buildFinalEdition } = await loadFinalEdition();

    const report = buildFinalEdition({
      state: { ...baseState, extraExtraFeed: [] },
      winner: 'truth',
      victoryType: 'truth',
    });

    expect(report.frontPage).toEqual({
      tone: 'truth',
      hed: 'TRUTH SURGE SHATTERS COVER-UP',
      dek: 'Truth Network closes the season via truth meter swing after 5 rounds; monitors register 100% truth.',
      kicker: 'Truth Network · Truth Threshold',
    });
  });
});
