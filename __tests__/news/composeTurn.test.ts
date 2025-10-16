import { describe, expect, it } from 'bun:test';

import { composeTurn, TURN_METRIC_WEIGHTS } from '../../src/news/composeTurn';
import type { TurnLog } from '../../src/news/types';
import type { ArticleBlock as CardArticle } from '../../src/engine/news/newsPools';

const createCardArticle = (id: string, overrides: Partial<CardArticle> = {}): CardArticle => ({
  id,
  tone: 'truth',
  tags: [],
  headline: `${id.toUpperCase()} Headline`,
  subhead: `${id.toUpperCase()} Sub`,
  byline: `By: ${id.toUpperCase()} Desk`,
  body: `${id.toUpperCase()} dossier`,
  imagePrompt: undefined,
  ...overrides,
});

describe('composeTurn', () => {
  it('caps focus to the top three plays and merges their copy into a composite article', () => {
    const log: TurnLog = {
      round: 1,
      turn: 2,
      plays: [
        { id: 'alpha', name: 'Alpha Broadcast', type: 'MEDIA', faction: 'truth', truth: 3 },
        { id: 'bravo', name: 'Bravo Raid', type: 'ATTACK', faction: 'government', ip: 5 },
        { id: 'charlie', name: 'Charlie Sweep', type: 'ZONE', faction: 'truth', captures: 1 },
        { id: 'delta', name: 'Delta Cleanup', type: 'ATTACK', faction: 'government', damage: 4 },
      ],
    } satisfies TurnLog;

    const articles = new Map<string, CardArticle>([
      ['alpha', createCardArticle('alpha')],
      ['bravo', createCardArticle('bravo', { imagePrompt: 'Bravo prompt' })],
      ['charlie', createCardArticle('charlie', { subhead: 'Charlie Sub', body: 'Charlie dossier' })],
      ['delta', createCardArticle('delta', { body: 'Delta dossier' })],
    ]);

    const composite = composeTurn(log, { seed: 'test-seed', articleCache: articles });

    expect(composite).not.toBeNull();
    expect(composite?.focus.map(entry => entry.id)).toEqual(['alpha', 'bravo', 'charlie']);
    expect(composite?.runnersUp).toHaveLength(1);
    expect(composite?.runnersUp[0]?.hed).toBe('DELTA Headline');
    expect(composite?.runnersUp[0]?.bullets[0]).toContain('impact score 5.3');
    expect(composite?.main?.hed).toBe('ALPHA Headline + BRAVO Headline + CHARLIE Headline');
    expect(composite?.main?.imagePrompt).toBe('Bravo prompt');
    expect(composite?.main?.body).toEqual([
      'Alpha Broadcast: ALPHA dossier',
      'Charlie Sweep: CHARLIE dossier',
    ]);
    expect(composite?.tone).toBe('truth');
    expect(composite?.signature).toBe('alpha,bravo,charlie');

    const metrics = composite?.metrics;
    expect(metrics?.cards).toBe(3);
    expect(metrics?.truth).toEqual({ raw: 3, weighted: 3 * TURN_METRIC_WEIGHTS.truth });
    expect(metrics?.ip).toEqual({ raw: 5, weighted: 5 * TURN_METRIC_WEIGHTS.ip });
    expect(metrics?.captures).toEqual({ raw: 1, weighted: 1 * TURN_METRIC_WEIGHTS.captures });
    expect(metrics?.damage).toEqual({ raw: 0, weighted: 0 });
    expect(metrics?.total).toBeCloseTo(30, 5);
  });

  it('returns null when no plays are present', () => {
    const emptyLog: TurnLog = { round: 1, turn: 1, plays: [] };
    expect(composeTurn(emptyLog)).toBeNull();
  });
});
