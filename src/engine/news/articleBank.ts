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
  hasArticles(): boolean;
};

const ARTICLE_BANK_PATH = '/data/paranoid_times_card_articles_ALL.json';
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

export async function loadArticleBank(jsonPath: string = ARTICLE_BANK_PATH): Promise<ArticleBank> {
  try {
    const response = await fetch(jsonPath);
    if (!response.ok) {
      console.error(`${ERROR_PREFIX} failed to fetch ${jsonPath}: ${response.status} ${response.statusText}`);
      return createEmptyArticleBank();
    }

    const payload = await response.json();
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
      console.warn(`${ERROR_PREFIX} loaded 0 articles from ${jsonPath}`);
      return createEmptyArticleBank();
    }

    return {
      getById(cardId: string): CardArticle | null {
        if (!cardId) {
          return null;
        }
        return map.get(cardId) ?? null;
      },
      hasArticles() {
        return map.size > 0;
      },
    } satisfies ArticleBank;
  } catch (error) {
    console.error(`${ERROR_PREFIX} unable to load ${jsonPath}`, error);
    return createEmptyArticleBank();
  }
}
