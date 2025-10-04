import { afterEach, expect, mock, test } from 'bun:test';

import { loadArticleBank, type CardArticle } from '../articleBank';

const createResponse = (payload: unknown, init?: Partial<Response>): Response => {
  return {
    ok: true,
    status: 200,
    statusText: 'OK',
    json: async () => payload,
    ...init,
  } as Response;
};

const originalFetch = globalThis.fetch;

afterEach(() => {
  (globalThis as { fetch: typeof fetch }).fetch = originalFetch;
});

test('provides lookup access for parsed articles', async () => {
  const article: CardArticle = {
    id: 'story-1',
    tone: 'truth',
    tags: ['cryptid', ' cryptid ', 'attack'],
    headline: 'Side Story One',
    subhead: 'Lead operatives breach the signal vault.',
    body: 'Field team confirmed the breach before dawn.',
    byline: 'Field Desk',
  };

  const fetchMock = mock(async () => createResponse({ articles: [article] })) as unknown as typeof fetch;
  (globalThis as { fetch: typeof fetch }).fetch = fetchMock;

  const bank = await loadArticleBank('https://example.com/articles.json');

  expect(fetchMock).toHaveBeenCalledTimes(1);
  const resolved = bank.getById('story-1');
  expect(resolved?.headline).toBe(article.headline);
  expect(resolved?.tags).toEqual(['cryptid', 'attack']);
  expect(bank.getById('missing')).toBeNull();
  expect(bank.hasArticles()).toBe(true);
});

test('returns empty bank when fetch fails', async () => {
  const fetchMock = mock(async () =>
    createResponse(
      {},
      {
        ok: false,
        status: 404,
        statusText: 'Not Found',
      },
    ),
  ) as unknown as typeof fetch;
  (globalThis as { fetch: typeof fetch }).fetch = fetchMock;

  const bank = await loadArticleBank('https://example.com/missing.json');

  expect(bank.getById('missing')).toBeNull();
  expect(bank.hasArticles()).toBe(false);
});

test('handles payloads without articles gracefully', async () => {
  const fetchMock = mock(async () => createResponse({})) as unknown as typeof fetch;
  (globalThis as { fetch: typeof fetch }).fetch = fetchMock;

  const bank = await loadArticleBank('https://example.com/empty.json');

  expect(bank.getById('any')).toBeNull();
  expect(bank.hasArticles()).toBe(false);
});
