import { afterEach, describe, expect, mock, test } from 'bun:test';

import {
  __resetArticleBankCache,
  __setArticleBankLoader,
  loadArticleBank,
  type CardArticle,
} from '../articleBank';

const sampleArticle = (overrides: Partial<CardArticle> = {}): CardArticle => ({
  id: overrides.id ?? 'alpha',
  tone: overrides.tone ?? 'truth',
  tags: overrides.tags ?? ['signal'],
  headline: overrides.headline,
  subhead: overrides.subhead,
  byline: overrides.byline,
  body: overrides.body,
  imagePrompt: overrides.imagePrompt,
});

afterEach(() => {
  __resetArticleBankCache();
});

describe('loadArticleBank', () => {
  test('provides lookup access for parsed articles', async () => {
    const article = sampleArticle({ id: 'story-1', tags: ['cryptid'] });
    __setArticleBankLoader(async () => ({ articles: [article] }));

    const bank = await loadArticleBank();

    expect(bank.getById('story-1')).toEqual(article);
    expect(bank.getById('missing')).toBeNull();
  });

  test('validates incoming payload shape', async () => {
    __setArticleBankLoader(async () => ({ invalid: true }));

    await expect(loadArticleBank()).rejects.toThrow(/articles/i);
  });

  test('caches the resolved bank per loader key', async () => {
    const loader = mock(async () => ({ articles: [sampleArticle({ id: 'cached' })] }));
    __setArticleBankLoader(loader);

    const first = await loadArticleBank();
    const second = await loadArticleBank();

    expect(loader).toHaveBeenCalledTimes(1);
    expect(second.getById('cached')).toEqual(first.getById('cached'));
  });

  test('separates cache entries for distinct urls', async () => {
    const payloads: Record<string, { articles: CardArticle[] }> = {
      'https://example.com/alpha.json': { articles: [sampleArticle({ id: 'one' })] },
      'https://example.com/beta.json': { articles: [sampleArticle({ id: 'two' })] },
    };

    const originalFetch = globalThis.fetch;
    const fetchMock = mock(async (input: RequestInfo | URL) => {
      const url = typeof input === 'string' ? input : input.toString();
      const payload = payloads[url];
      if (!payload) {
        return {
          ok: false,
          status: 404,
          statusText: 'Not Found',
          json: async () => ({}),
        } as Response;
      }
      return {
        ok: true,
        status: 200,
        statusText: 'OK',
        json: async () => payload,
      } as Response;
    });

    (globalThis as { fetch: typeof fetch }).fetch = fetchMock as unknown as typeof fetch;

    try {
      const first = await loadArticleBank('https://example.com/alpha.json');
      const second = await loadArticleBank('https://example.com/beta.json');

      expect(first.getById('one')?.id).toBe('one');
      expect(second.getById('two')?.id).toBe('two');
      expect(fetchMock).toHaveBeenCalledTimes(2);
    } finally {
      (globalThis as { fetch: typeof fetch }).fetch = originalFetch;
    }
  });
});
