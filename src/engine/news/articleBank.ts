import { z } from 'zod';

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
};

type ArticleDataLoader = () => Promise<unknown>;

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
  articles: z.array(cardArticleSchema),
});

let cachedArticleBank: Promise<ArticleBank> | null = null;
let cacheKey: string | null = null;
let loaderOverride: ArticleDataLoader | null = null;

const importArticleData: ArticleDataLoader = async () => {
  const module = await import('../../../paranoid_times_card_articles_ALL.json');
  return (module as { default?: unknown }).default ?? module;
};

const fetchArticleData = async (url: string): Promise<unknown> => {
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`Failed to load article bank from ${url}: ${response.status} ${response.statusText}`);
  }
  return response.json();
};

const resolveLoader = (jsonUrl?: string): { loader: ArticleDataLoader; key: string } => {
  if (loaderOverride) {
    return { loader: loaderOverride, key: 'override' };
  }

  if (jsonUrl) {
    return { loader: () => fetchArticleData(jsonUrl), key: jsonUrl };
  }

  return { loader: importArticleData, key: 'default' };
};

const buildArticleBank = (articles: CardArticle[]): ArticleBank => {
  const byId = new Map<string, CardArticle>();
  for (const article of articles) {
    const normalized: CardArticle = {
      ...article,
      tags: Array.isArray(article.tags) ? article.tags : [],
    };
    byId.set(normalized.id, normalized);
  }

  return {
    getById(cardId: string) {
      if (!cardId) {
        return null;
      }
      return byId.get(cardId) ?? null;
    },
  } satisfies ArticleBank;
};

export async function loadArticleBank(jsonUrl?: string): Promise<ArticleBank> {
  const { loader, key } = resolveLoader(jsonUrl);

  if (!cachedArticleBank || cacheKey !== key) {
    cacheKey = key;
    cachedArticleBank = loader().then(raw => {
      const { articles } = articleFileSchema.parse(raw);
      return buildArticleBank(articles);
    });
  }

  return cachedArticleBank;
}

export function __setArticleBankLoader(loader: ArticleDataLoader | null): void {
  loaderOverride = loader;
  cacheKey = null;
  cachedArticleBank = null;
}

export function __resetArticleBankCache(): void {
  loaderOverride = null;
  cacheKey = null;
  cachedArticleBank = null;
}
