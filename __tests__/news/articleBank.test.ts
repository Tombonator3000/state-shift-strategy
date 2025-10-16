import { afterEach, beforeEach, describe, expect, it } from 'bun:test';

import {
  clearArticleBankCache,
  getArticleById,
  loadArticleBank,
} from '../../src/news/articleBank';

const networkErrorFetch: typeof fetch = async () => {
  throw new Error('network disabled');
};

let originalFetch: typeof fetch | undefined;

describe('articleBank loader', () => {
  beforeEach(() => {
    originalFetch = globalThis.fetch;
    // Force the loader to exercise the bundled fallback copy.
    globalThis.fetch = networkErrorFetch;
    clearArticleBankCache();
  });

  afterEach(() => {
    clearArticleBankCache();
    if (originalFetch) {
      globalThis.fetch = originalFetch;
    } else {
      delete (globalThis as { fetch?: typeof fetch }).fetch;
    }
  });

  it('loads TRUTH-150 from the article bank with truth tone', async () => {
    const bank = await loadArticleBank();
    const article = getArticleById('TRUTH-150', bank);

    expect(article).toBeTruthy();
    expect(article?.id).toBe('TRUTH-150');
    expect(article?.faction).toBe('truth');
    expect(article?.tone).toBe('truth');
    expect(article?.tags).toContain('truth');
    expect(article?.headline).toBeDefined();
  });

  it('loads GOV-001 from the article bank with government tone', async () => {
    const bank = await loadArticleBank();
    const article = getArticleById('GOV-001', bank);

    expect(article).toBeTruthy();
    expect(article?.id).toBe('GOV-001');
    expect(article?.faction).toBe('government');
    expect(article?.tone).toBe('government');
    expect(article?.tags).toContain('government');
    expect(article?.headline).toBeDefined();
  });
});
