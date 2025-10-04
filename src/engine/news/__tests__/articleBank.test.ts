import { afterEach, describe, expect, mock, test } from 'bun:test';

import {
  loadArticleBank,
  getById,
  has,
  type CardArticle,
  __setArticleBankLoader,
  __resetArticleBankCache,
} from '../articleBank';

const sampleArticle = (overrides: Partial<CardArticle> = {}): CardArticle => ({
  id: overrides.id ?? 'alpha',
  tone: overrides.tone ?? 'truth',
  tags: overrides.tags ?? ['#Signal'],
  headline: overrides.headline ?? 'ALPHA SIGNAL DETECTED',
  subhead: overrides.subhead ?? 'Operatives intercept classified broadcast.',
  byline: overrides.byline ?? 'By: Field Unit 27-B/6',
  body: overrides.body ?? 'Field report notes unusual readings across the grid.',
  imagePrompt: overrides.imagePrompt,
});

afterEach(() => {
  __resetArticleBankCache();
});

describe('loadArticleBank', () => {
  test('successfully loads data and exposes lookup helpers', async () => {
    const article = sampleArticle();
    __setArticleBankLoader(async () => ({ articles: [article] }));

    const bank = await loadArticleBank();

    expect(bank.articles).toHaveLength(1);
    expect(bank.byId.get(article.id)).toEqual(article);
    expect(getById(bank, article.id)).toEqual(article);
    expect(getById(bank, null)).toBeNull();
    expect(has(bank, article.id)).toBe(true);
    expect(has(bank, undefined)).toBe(false);
  });

  test('throws when the incoming data fails schema validation', async () => {
    __setArticleBankLoader(async () => ({ invalid: true }));

    await expect(loadArticleBank()).rejects.toThrow(/articles/i);
  });

  test('reuses the cached promise across multiple invocations', async () => {
    const loader = mock(async () => ({ articles: [sampleArticle({ id: 'cached' })] }));
    __setArticleBankLoader(loader);

    const first = await loadArticleBank();
    const second = await loadArticleBank();

    expect(loader).toHaveBeenCalledTimes(1);
    expect(second).toBe(first);
    expect(has(second, 'cached')).toBe(true);
  });
});
