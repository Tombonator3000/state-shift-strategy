import { beforeEach, describe, expect, it, mock } from 'bun:test';
import type { TurnLog, TurnTotals } from '../../src/news/headlineEngine';

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

const getPoolsMock = mock.fn(() => stubPools);
const getPoolsIfReadyMock = mock.fn(() => stubPools);

mock.module('@/news/newsPools', () => ({
  getPools: getPoolsMock,
  getPoolsIfReady: getPoolsIfReadyMock,
}));

const loadEngine = () => import('../../src/news/headlineEngine');

beforeEach(() => {
  getPoolsMock.mockReset();
  getPoolsIfReadyMock.mockReset();
  getPoolsMock.mockImplementation(() => stubPools);
  getPoolsIfReadyMock.mockImplementation(() => stubPools);
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
    const warnMock = mock.method(console, 'warn');

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
      expect(warnMock).toHaveBeenCalled();
      expect(String(warnMock.mock.calls[0]?.[0])).toContain('generateExtraExtra');
    } finally {
      warnMock.mockRestore();
    }
  });
});
