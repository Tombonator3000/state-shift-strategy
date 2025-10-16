import { beforeEach, describe, expect, it, mock } from 'bun:test';
import * as actualFrontendNewsPools from '../../src/news/newsPools';
import * as actualArticleBank from '../../src/news/articleBank';
import type { TurnLog, TurnTotals, PlayedLite } from '../../src/news/types';

const stubPools = {
  mastheads: ['Test Masthead'],
  ads: ['Ad A', 'Ad B', 'Ad C', 'Ad D'],
  subheads: {
    generic: ['Generic Sub'],
    attack: ['Attack Sub'],
    media: ['Media Sub'],
    zone: ['Zone Sub'],
  },
  bylines: ['Byline'],
  sources: ['Source'],
  attackVerbs: ['EXPOSE'],
  mediaVerbs: ['AMPLIFIES'],
  zoneVerbs: ['SURGES'],
  weather: ['Calm Skies'],
} as const;

const createMockFn = <Args extends unknown[], Return>(
  implementation: (...args: Args) => Return,
) => {
  const fn = ((...args: Args) => {
    fn.mock.calls.push(args);
    return fn.mock.impl(...args);
  }) as ((...args: Args) => Return) & {
    mock: { calls: Args[]; impl: (...innerArgs: Args) => Return };
    mockImplementation: (impl: (...innerArgs: Args) => Return) => void;
    mockReset: () => void;
  };

  fn.mock = { calls: [] as Args[], impl: implementation };
  fn.mockImplementation = (impl: (...innerArgs: Args) => Return) => {
    fn.mock.impl = impl;
  };
  fn.mockReset = () => {
    fn.mock.calls = [];
    fn.mock.impl = implementation;
  };

  return fn;
};

const getPoolsMock = createMockFn(() => stubPools);
const getPoolsIfReadyMock = createMockFn(() => stubPools);

const perCardArticles = new Map(
  [
    [
      't1',
      {
        id: 't1',
        tone: 'truth' as const,
        tags: ['ghost'],
        headline: 'Spectral Scoop',
        subhead: 'Phantom radio callers jam the switchboard.',
        byline: 'By: Phantom Desk',
        body: 'Apparitions confirm the lead is extremely credible.',
      },
    ],
    [
      't2',
      {
        id: 't2',
        tone: 'truth' as const,
        tags: ['ufo'],
        headline: 'Runway Lights Beckon',
        subhead: 'Strobe-lit landing strips welcome midnight arrivals.',
        byline: 'By: Hologram Bureau',
        body: 'Hangars shuffle to make room for three chrome saucers.',
      },
    ],
    [
      't3',
      {
        id: 't3',
        tone: 'truth' as const,
        tags: ['coverup'],
        headline: 'Archivists Blow the Gasket',
        subhead: 'Dusty cabinets finally cough up the microfilm.',
        byline: 'By: Records Desk',
        body: 'Clerks report the files hummed ominously before opening.',
      },
    ],
  ],
);

const getArticleBankIfReadyMock = createMockFn(() => perCardArticles);

const createTripleArticle = () => ({
  tone: 'truth' as const,
  hed: 'TRIPLE PLAY HITS FRONT PAGE',
  dek: 'Composite deck weaves a unified broadcast.',
  bullets: ['Operatives align their leads into a single flame.'],
  byline: 'By: Composite Desk',
  source: 'Source: News Vault',
  body: ['Three signals sync inside the newsroom nerve center.'],
  imagePrompt: 'Collaged news clippings swirling in red string',
  kicker: 'EXTRA EXTRA',
  stinger: 'Filed at 03:13',
  comboId: 'combo-test',
});

const composeTripleHeadlineMock = createMockFn(() => createTripleArticle());

mock.module('@/news/newsPools', () => ({
  ...actualFrontendNewsPools,
  getPools: getPoolsMock,
  getPoolsIfReady: getPoolsIfReadyMock,
}));

mock.module('@/news/articleBank', () => ({
  ...actualArticleBank,
  getArticleBankIfReady: getArticleBankIfReadyMock,
}));

mock.module('@/engine/news/composeTriple', () => ({
  composeTripleHeadline: composeTripleHeadlineMock,
}));

const loadEngine = () => import('../../src/news/headlineEngine');

beforeEach(() => {
  getPoolsMock.mockReset();
  getPoolsIfReadyMock.mockReset();
  getPoolsMock.mockImplementation(() => stubPools);
  getPoolsIfReadyMock.mockImplementation(() => stubPools);
  getArticleBankIfReadyMock.mockReset();
  getArticleBankIfReadyMock.mockImplementation(() => perCardArticles);
  composeTripleHeadlineMock.mockReset();
  composeTripleHeadlineMock.mockImplementation(() => createTripleArticle());
});

describe('evaluateExtraExtra', () => {
  it('returns no trigger when neither faction plays three cards', async () => {
    const { evaluateExtraExtra } = await loadEngine();

    const outcome = evaluateExtraExtra([]);

    expect(outcome.trigger).toBe(false);
    expect(outcome.truthDelta).toBe(0);
    expect(outcome.focusPlays).toEqual([]);
  });

  it('declares truth winner when only truth reaches three plays', async () => {
    const { evaluateExtraExtra } = await loadEngine();

    const plays: PlayedLite[] = [
      { id: 't1', name: 'Truth Broadcast', type: 'MEDIA', faction: 'truth', truth: 2 },
      { id: 't2', name: 'Truth Broadcast 2', type: 'MEDIA', faction: 'truth', truth: 1 },
      { id: 't3', name: 'Truth Broadcast 3', type: 'MEDIA', faction: 'truth', truth: 4 },
      { id: 'g1', name: 'Gov Teaser', type: 'MEDIA', faction: 'government', truth: -1 },
    ];

    const outcome = evaluateExtraExtra(plays);

    expect(outcome.trigger).toBe(true);
    expect(outcome.winningFaction).toBe('truth');
    expect(outcome.truthDelta).toBe(3);
    expect(outcome.focusPlays).toHaveLength(3);
    expect(outcome.focusPlays.every(play => play.faction === 'truth')).toBe(true);
  });

  it('breaks ties with a draw when top card values match', async () => {
    const { evaluateExtraExtra } = await loadEngine();

    const plays: PlayedLite[] = [
      { id: 't1', name: 'Truth Wave', type: 'MEDIA', faction: 'truth', truth: 3 },
      { id: 't2', name: 'Truth Echo', type: 'MEDIA', faction: 'truth', truth: 1 },
      { id: 't3', name: 'Truth Finale', type: 'MEDIA', faction: 'truth', truth: 2 },
      { id: 'g1', name: 'Gov Silence', type: 'MEDIA', faction: 'government', truth: -3 },
      { id: 'g2', name: 'Gov Clamp', type: 'MEDIA', faction: 'government', truth: -2 },
      { id: 'g3', name: 'Gov Sweep', type: 'MEDIA', faction: 'government', truth: -1 },
    ];

    const outcome = evaluateExtraExtra(plays);

    expect(outcome.trigger).toBe(true);
    expect(outcome.winningFaction).toBe('draw');
    expect(outcome.truthDelta).toBe(0);
    expect(outcome.focusPlays).toHaveLength(6);
  });

  it('prefers the combined trio impact over a single massive play', async () => {
    const { evaluateExtraExtra } = await loadEngine();

    const plays: PlayedLite[] = [
      { id: 't1', name: 'Truth Signal', type: 'MEDIA', faction: 'truth', truth: 4 },
      { id: 't2', name: 'Truth Relay', type: 'ATTACK', faction: 'truth', ip: 3 },
      { id: 't3', name: 'Truth Sweep', type: 'ZONE', faction: 'truth', captures: 3 },
      { id: 'g1', name: 'Gov Hammer', type: 'ATTACK', faction: 'government', damage: 9 },
      { id: 'g2', name: 'Gov Silence', type: 'MEDIA', faction: 'government' },
      { id: 'g3', name: 'Gov Drift', type: 'ZONE', faction: 'government' },
    ];

    const outcome = evaluateExtraExtra(plays);

    expect(outcome.trigger).toBe(true);
    expect(outcome.winningFaction).toBe('truth');
    expect(outcome.focusPlays.map(play => play.id)).toEqual(['t1', 't2', 't3']);
  });

  it('falls back to the truth-delta safeguard when trio impacts tie', async () => {
    const { evaluateExtraExtra } = await loadEngine();

    const plays: PlayedLite[] = [
      { id: 't1', name: 'Truth Accord', type: 'MEDIA', faction: 'truth', truth: 3 },
      { id: 't2', name: 'Truth Broadcast', type: 'MEDIA', faction: 'truth', ip: 2 },
      { id: 't3', name: 'Truth Sweep', type: 'MEDIA', faction: 'truth', captures: 1 },
      { id: 'g1', name: 'Gov Accord', type: 'MEDIA', faction: 'government', truth: -3 },
      { id: 'g2', name: 'Gov Broadcast', type: 'MEDIA', faction: 'government', ip: -2 },
      { id: 'g3', name: 'Gov Sweep', type: 'MEDIA', faction: 'government', captures: 1 },
    ];

    const outcome = evaluateExtraExtra(plays);

    expect(outcome.trigger).toBe(true);
    expect(outcome.winningFaction).toBe('draw');
    expect(outcome.truthDelta).toBe(0);
    expect(outcome.focusPlays).toHaveLength(6);
  });

  it('captures composed triple headline data for qualifying trio', async () => {
    const { evaluateExtraExtra, generateExtraExtra, summarize } = await loadEngine();

    const plays: PlayedLite[] = [
      { id: 't1', name: 'Ghost Signal', type: 'MEDIA', faction: 'truth', truth: 4 },
      { id: 't2', name: 'Saucer Scoop', type: 'ATTACK', faction: 'truth', truth: 2 },
      { id: 't3', name: 'Archive Leak', type: 'ZONE', faction: 'truth', truth: 1 },
    ];

    const evaluation = evaluateExtraExtra(plays, { seed: 'unit-test' });

    expect(composeTripleHeadlineMock.mock.calls.length).toBe(1);
    expect(evaluation.composedMain?.hed).toBe('TRIPLE PLAY HITS FRONT PAGE');
    expect(evaluation.composeSignature).toBe('t1,t2,t3');
    expect(evaluation.winnerCards?.map(card => card.id)).toEqual(['t1', 't2', 't3']);

    const focusLog: TurnLog = { round: 1, turn: 1, plays: evaluation.focusPlays };
    const totals = summarize([focusLog]);
    const article = generateExtraExtra('unit-test', [focusLog], totals, evaluation);

    expect(article.hed).toBe('TRIPLE PLAY HITS FRONT PAGE');
    expect(article.dek).toBe('Composite deck weaves a unified broadcast.');
    expect(article.bullets).toEqual(['Operatives align their leads into a single flame.']);
    expect(article.comboId).toBe('combo-test');
  });

  it('falls back to per-card dispatch headline when composer returns null', async () => {
    composeTripleHeadlineMock.mockImplementation(() => null);

    const { evaluateExtraExtra, generateExtraExtra, summarize } = await loadEngine();

    const plays: PlayedLite[] = [
      { id: 't1', name: 'Ghost Signal', type: 'MEDIA', faction: 'truth', truth: 4 },
      { id: 't2', name: 'Saucer Scoop', type: 'ATTACK', faction: 'truth', truth: 2 },
      { id: 't3', name: 'Archive Leak', type: 'ZONE', faction: 'truth', truth: 1 },
    ];

    const evaluation = evaluateExtraExtra(plays, { seed: 'fallback-test' });

    expect(evaluation.composedMain).toBeNull();
    expect(evaluation.dispatches.length).toBeGreaterThan(0);

    const focusLog: TurnLog = { round: 1, turn: 1, plays: evaluation.focusPlays };
    const totals = summarize([focusLog]);
    const article = generateExtraExtra('fallback-test', [focusLog], totals, evaluation);

    expect(article.hed).toBe('Spectral Scoop');
    expect(article.dek).toBe('Phantom radio callers jam the switchboard.');
    expect(article.byline).toBe('By: Phantom Desk');
    expect(article.bullets.length).toBeGreaterThan(0);
  });
});

describe('headlineEngine utilities', () => {
  it('summarize aggregates faction totals and ignores invalid values', async () => {
    const { summarize } = await loadEngine();
    const turns: TurnLog[] = [
      {
        round: 1,
        turn: 1,
        plays: [
          {
            id: 't1',
            name: 'Truth Strike',
            type: 'ATTACK',
            faction: 'truth',
            truth: 2,
            ip: 1,
            captures: 1,
            damage: 3,
          },
          {
            id: 'g1',
            name: 'Gov Briefing',
            type: 'MEDIA',
            faction: 'government',
            truth: -2,
            ip: 4,
          },
        ],
      },
      {
        round: 1,
        turn: 2,
        plays: [
          {
            id: 't2',
            name: 'Truth Rally',
            type: 'MEDIA',
            faction: 'truth',
            truth: 1.5,
            ip: NaN,
          },
          {
            id: 'g2',
            name: 'Gov Sweep',
            type: 'ZONE',
            faction: 'government',
            captures: 2,
            damage: -4,
          },
        ],
      },
    ];

    const totals = summarize(turns);

    expect(totals.truth).toEqual({
      plays: 2,
      attack: 1,
      media: 1,
      zone: 0,
      truth: 3.5,
      ip: 1,
      captures: 1,
      damage: 3,
    });
    expect(totals.government).toEqual({
      plays: 2,
      attack: 0,
      media: 1,
      zone: 1,
      truth: 0,
      ip: 4,
      captures: 2,
      damage: 0,
    });
  });

  it('dominantFromTotals selects leading tone or draw for small deltas', async () => {
    const { dominantFromTotals } = await loadEngine();

    const truthEdge: TurnTotals = {
      truth: {
        plays: 3,
        attack: 2,
        media: 1,
        zone: 0,
        truth: 6,
        ip: 0,
        captures: 0,
        damage: 0,
      },
      government: {
        plays: 3,
        attack: 0,
        media: 2,
        zone: 1,
        truth: 1,
        ip: 0,
        captures: 0,
        damage: 0,
      },
    };

    const nearDraw: TurnTotals = {
      truth: {
        plays: 1,
        attack: 0,
        media: 1,
        zone: 0,
        truth: 0.5,
        ip: 0,
        captures: 0,
        damage: 0,
      },
      government: {
        plays: 1,
        attack: 0,
        media: 1,
        zone: 0,
        truth: 0.4,
        ip: 0,
        captures: 0,
        damage: 0,
      },
    };

    expect(dominantFromTotals(truthEdge)).toBe('truth');
    expect(dominantFromTotals(nearDraw)).toBe('draw');
    expect(
      dominantFromTotals({
        truth: truthEdge.government,
        government: truthEdge.truth,
      }),
    ).toBe('government');
  });

  it('buildHed formats tone-specific headlines', async () => {
    const { buildHed } = await loadEngine();
    const totals: TurnTotals = {
      truth: {
        plays: 4,
        attack: 2,
        media: 1,
        zone: 1,
        truth: 4,
        ip: 6,
        captures: 2,
        damage: 0,
      },
      government: {
        plays: 3,
        attack: 1,
        media: 2,
        zone: 0,
        truth: 1,
        ip: 3,
        captures: 0,
        damage: 0,
      },
    };
    const rng = () => 0;

    expect(buildHed('truth', totals, rng)).toBe('OPERATIVES EXPOSE 2 STATES');
    expect(buildHed('government', totals, rng)).toBe('PRESS OFFICE FILES “AMPLIFIES” GRID');
    expect(buildHed('draw', totals, rng)).toBe('STANDOFF CALLS IT “EXPOSE” 2 STATES');
  });

  it('generateExtraExtra produces deterministic articles for identical seeds', async () => {
    const { generateExtraExtra, summarize } = await loadEngine();
    const turns: TurnLog[] = [
      {
        round: 2,
        turn: 1,
        plays: [
          {
            id: 't1',
            name: 'Truth Broadcast',
            type: 'MEDIA',
            faction: 'truth',
            truth: 2,
            ip: 1,
          },
          {
            id: 't2',
            name: 'Truth Broadcast 2',
            type: 'MEDIA',
            faction: 'truth',
            truth: 2,
          },
          {
            id: 'g1',
            name: 'Gov Counter',
            type: 'ATTACK',
            faction: 'government',
            damage: 1,
          },
        ],
      },
    ];

    const totals = summarize(turns);

    const first = generateExtraExtra('seed:alpha', turns, totals);
    const second = generateExtraExtra('seed:alpha', turns, totals);

    expect(second).toEqual(first);
    expect(first).toMatchObject({
      tone: 'truth',
      hed: 'TRUTH NETWORK AMPLIFIES TRUTH +4%',
      dek: 'Media Sub',
      byline: 'Byline',
      source: 'Source',
    });
    expect(first.bullets.length).toBeGreaterThan(0);
  });

  it('generateExtraExtra returns a placeholder article when pools are unavailable', async () => {
    const originalWarn = console.warn;
    const warnings: unknown[][] = [];
    console.warn = (...args: unknown[]) => {
      warnings.push(args);
    };

    getPoolsIfReadyMock.mockImplementation(() => null);
    getPoolsMock.mockImplementation(() => {
      throw new Error('getPools should not be invoked when pools are unavailable');
    });

    try {
      const { generateExtraExtra, summarize } = await loadEngine();
      const turns: TurnLog[] = [
        {
          round: 1,
          turn: 1,
          plays: [
            { id: 'a', name: 'Truth Play', type: 'MEDIA', faction: 'truth', truth: 2 },
            { id: 'b', name: 'Gov Play', type: 'ATTACK', faction: 'government', damage: 1 },
            { id: 'c', name: 'Truth Followup', type: 'ZONE', faction: 'truth', captures: 1 },
          ],
        },
      ];

      const totals = summarize(turns);
      const article = generateExtraExtra('seed:fallback', turns, totals);

      expect(article.tone).toBe('truth');
      expect(article.hed).toContain('[WIRE DELAY]');
      expect(article.dek).toMatch(/Archive uplink pending|Wire desk files a placeholder/);
      expect(article.byline).toMatch(/Standby Desk|Emergency Editor/);
      expect(article.source).toMatch(/Archive sync pending|Classified spool offline/);
      expect(article.bullets.length).toBeGreaterThan(0);
      expect(warnings.length).toBeGreaterThan(0);
      expect(String(warnings[0]?.[0])).toContain('generateExtraExtra');
    } finally {
      console.warn = originalWarn;
    }
  });
});
