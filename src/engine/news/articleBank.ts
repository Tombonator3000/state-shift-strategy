import { z } from 'zod';

// Static fallback so the article bank still works even if network paths fail.
import fallbackArticleJson from '../paranoid_times_card_articles_ALL.json' assert { type: 'json' };

export type CardArticle = {
  id: string;
  faction: 'truth' | 'government';
  tags: string[];
  headline?: string;
  subhead?: string;
  byline?: string;
  body?: string;
  imagePrompt?: string;
  statesMentioned?: string[];
  recurringCharacter?: string | null;
  followUpHooks?: string[];
  articleVariant?: string | null;
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

const factionSchema = z.preprocess(
  (value: unknown) => {
    if (typeof value !== 'string') {
      return value;
    }
    const normalised = value.trim().toLowerCase();
    if (normalised === 'truth') {
      return 'truth';
    }
    if (normalised === 'gov' || normalised === 'government') {
      return 'government';
    }
    return value;
  },
  z.union([z.literal('truth'), z.literal('government')]),
);

const cardArticleSchema = z.object({
  id: z.string(),
  faction: factionSchema,
  tags: z.array(z.string()).default([]),
  headline: z.string().optional(),
  subhead: z.string().optional(),
  byline: z.string().optional(),
  body: z.string().optional(),
  imagePrompt: z.string().optional(),
  statesMentioned: z.array(z.string()).optional(),
  recurringCharacter: z.string().optional(),
  followUpHooks: z.array(z.string()).optional(),
  articleVariant: z.string().optional(),
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

const normaliseStringList = (input: string[] | undefined): string[] => {
  if (!Array.isArray(input)) {
    return [];
  }
  const values: string[] = [];
  for (const raw of input) {
    const value = typeof raw === 'string' ? raw.trim() : '';
    if (!value) {
      continue;
    }
    values.push(value);
  }
  return values;
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
      if (!article.id || !article.faction) continue;
      const normalised: CardArticle = {
        id: article.id,
        faction: article.faction,
        tags: normaliseTags(article.tags),
        headline: article.headline,
        subhead: article.subhead,
        byline: article.byline,
        body: article.body,
        imagePrompt: article.imagePrompt,
        statesMentioned: normaliseStringList(article.statesMentioned),
        recurringCharacter: article.recurringCharacter ? article.recurringCharacter.trim() || null : null,
        followUpHooks: normaliseStringList(article.followUpHooks),
        articleVariant: article.articleVariant ? article.articleVariant.trim() || null : null,
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
