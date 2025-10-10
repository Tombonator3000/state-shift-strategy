import { beforeEach, describe, expect, it, mock } from 'bun:test';
import type { CardPlayRecord } from '@/hooks/gameStateTypes';
import { getArticleForCard } from '@/data/cardArticles/articleDatabase';
import { extractArticleParagraphs, sanitizeFrontPageText } from '@/news/finalFrontPageComposer';

const setupComboModuleMock = () => {
  mock.module('@/game/comboEngine', () => ({
    applyComboRewards: (state: unknown) => state,
    evaluateCombos: () => ({ results: [], totalReward: {}, logs: [] }),
    getComboSettings: () => ({ enabled: false, fxEnabled: false, comboToggles: {}, maxCombosPerTurn: 0 }),
    formatComboReward: () => '',
  }));
};

setupComboModuleMock();

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

const createPlayRecord = (
  overrides: Partial<CardPlayRecord> = {},
): CardPlayRecord => {
  const { card: cardOverride, ...rest } = overrides;
  const card = cardOverride ?? {
    id: 'TRUTH-001',
    name: 'Operative One',
    type: 'MEDIA',
    faction: 'truth',
    cost: 0,
  };

  return {
    card,
    player: 'human',
    faction: 'truth',
    targetState: null,
    truthDelta: 5,
    ipDelta: 2,
    aiIpDelta: -2,
    capturedStates: [],
    capturedStateIds: [],
    damageDealt: 0,
    round: 3,
    turn: 1,
    timestamp: 1700000000000,
    logEntries: [],
    ...rest,
  };
};

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

beforeEach(() => {
  setupComboModuleMock();
});

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

  it('includes MVP article paragraphs when available', async () => {
    const { buildFinalEdition } = await loadFinalEdition();

    const mvpArticle = getArticleForCard('TRUTH-017');
    const runnerArticle = getArticleForCard('TRUTH-019');
    if (!mvpArticle || !runnerArticle) {
      throw new Error('Expected fixture articles to exist for TRUTH-017 and TRUTH-019');
    }

    const expectedMvpHeadline = sanitizeFrontPageText(mvpArticle.headline).value ?? mvpArticle.headline;
    const expectedMvpSubhead = sanitizeFrontPageText(mvpArticle.subhead).value ?? mvpArticle.subhead;
    const expectedMvpParagraphs = extractArticleParagraphs(mvpArticle.body);

    const expectedRunnerHeadline = sanitizeFrontPageText(runnerArticle.headline).value ?? runnerArticle.headline;
    const expectedRunnerSubhead = sanitizeFrontPageText(runnerArticle.subhead).value ?? runnerArticle.subhead;
    const expectedRunnerParagraphs = extractArticleParagraphs(runnerArticle.body);

    const mvpPlay = createPlayRecord({
      card: {
        id: mvpArticle.cardId ?? 'TRUTH-017',
        name: 'Bat Boy Broadcast',
        type: 'MEDIA',
        faction: 'truth',
        cost: 3,
      },
      truthDelta: 12,
      ipDelta: 4,
      capturedStates: ['Ohio'],
      capturedStateIds: ['OH'],
      round: 6,
      turn: 1,
    });

    const runnerUpPlay = createPlayRecord({
      card: {
        id: runnerArticle.cardId ?? 'TRUTH-019',
        name: 'Pastor Rex Encore',
        type: 'MEDIA',
        faction: 'truth',
        cost: 3,
      },
      truthDelta: 8,
      ipDelta: 3,
      round: 5,
      turn: 2,
    });

    const report = buildFinalEdition({
      state: { ...baseState, playHistory: [mvpPlay, runnerUpPlay] },
      winner: 'truth',
      victoryType: 'truth',
    });

    expect(report.mvp?.cardId).toBe(mvpPlay.card.id);
    expect(report.runnerUp?.cardId).toBe(runnerUpPlay.card.id);
    expect(report.mvp?.article).toEqual({
      headline: expectedMvpHeadline,
      subhead: expectedMvpSubhead,
      paragraphs: expectedMvpParagraphs,
    });
    expect(report.runnerUp?.article).toEqual({
      headline: expectedRunnerHeadline,
      subhead: expectedRunnerSubhead,
      paragraphs: expectedRunnerParagraphs,
    });
  });

  it('falls back to MVP highlight when no article is available', async () => {
    const { buildFinalEdition } = await loadFinalEdition();

    const mvpPlay = createPlayRecord({
      truthDelta: 10,
      ipDelta: 5,
      card: {
        id: 'UNPUBLISHED-CARD',
        name: 'Silent Uplink',
        type: 'MEDIA',
        faction: 'truth',
        cost: 2,
      },
    });

    const report = buildFinalEdition({
      state: { ...baseState, playHistory: [mvpPlay] },
      winner: 'truth',
      victoryType: 'truth',
    });

    expect(report.mvp?.cardId).toBe('UNPUBLISHED-CARD');
    expect(report.mvp?.article).toBeNull();
    expect(report.mvp?.highlight).toBeTruthy();
  });
});
