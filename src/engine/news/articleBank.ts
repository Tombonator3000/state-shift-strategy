import { z } from 'zod';

// Static fallback so the article bank still works even if network paths fail.
import fallbackArticleJson from '../paranoid_times_card_articles_ALL.json' assert { type: 'json' };

export type CardArticle = {
  id: string;
  tone: 'truth' | 'gov';
  tags: string[];
  headline?: string;
  subhead?: string;
  byline?: string;
  body?: string;
  imagePrompt?: string;
};

export type ArticleBank = {
  getById(cardId: string): CardArticle | null;
  hasArticles(): boolean;
};

// Resolve a base-relative URL that works in dev and prod.
// In dev BASE_URL === '/', in prod it may be '/app/' etc.
const BASE_URL = (import.meta as any)?.env?.BASE_URL ?? '/';
const CANDIDATE_PATHS = [
  `${BASE_URL}data/paranoid_times_card_articles_ALL.json`,
  `${BASE_URL}assets/data/paranoid_times_card_articles_ALL.json`,
];
const ERROR_PREFIX = '[article-bank]';

const createEmptyArticleBank = (): ArticleBank => ({
  getById() {
    return null;
  },
  hasArticles() {
    return false;
  },
});

const cardArticleSchema: z.ZodType<CardArticle> = z.object({
  id: z.string(),
  tone: z.union([z.literal('truth'), z.literal('gov')]),
  tags: z.array(z.string()).default([]),
  headline: z.string().optional(),
  subhead: z.string().optional(),
  byline: z.string().optional(),
  body: z.string().optional(),
  imagePrompt: z.string().optional(),
});

const articleFileSchema = z.object({
  articles: z.array(cardArticleSchema).default([]),
});

const normaliseTags = (tags: string[] | undefined): string[] => {
  if (!Array.isArray(tags)) {
    return [];
  }
  const seen = new Set<string>();
  for (const raw of tags) {
    const value = typeof raw === 'string' ? raw.trim() : '';
    if (!value) {
      continue;
    }
    seen.add(value);
  }
  return Array.from(seen);
};

export async function loadArticleBank(): Promise<ArticleBank> {
  // Try candidates first; on any failure, fall back to bundled JSON.
  const tryFetch = async (): Promise<unknown | null> => {
    for (const url of CANDIDATE_PATHS) {
      try {
        const res = await fetch(url, { cache: 'no-store' });
        if (res.ok) return await res.json();
        console.warn(`${ERROR_PREFIX} fetch failed ${url}: ${res.status} ${res.statusText}`);
      } catch (e) {
        console.warn(`${ERROR_PREFIX} network error for ${url}`, e);
      }
    }
    return null;
  };

  try {
    const payload = (await tryFetch()) ?? (fallbackArticleJson as unknown);
    const { articles } = articleFileSchema.parse(payload);

    const map = new Map<string, CardArticle>();
    for (const article of articles) {
      const normalised: CardArticle = {
        ...article,
        tags: normaliseTags(article.tags),
      };
      map.set(normalised.id, normalised);
    }

    if (!map.size) {
      console.warn(`${ERROR_PREFIX} loaded 0 articles (network+fallback)`);
      return createEmptyArticleBank();
    }

    return {
      getById(cardId: string) {
        return cardId ? map.get(cardId) ?? null : null;
      },
      hasArticles() {
        return map.size > 0;
      },
    } satisfies ArticleBank;
  } catch (error) {
    console.error(`${ERROR_PREFIX} unable to load article bank`, error);
    return createEmptyArticleBank();
  }
}
