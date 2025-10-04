import { z } from 'zod';

const cardArticleSchema = z.object({
  id: z.string(),
  tone: z.string(),
  tags: z.array(z.string()),
  headline: z.string(),
  subhead: z.string(),
  byline: z.string(),
  body: z.string(),
  imagePrompt: z.string().optional(),
});

const articleFileSchema = z.object({
  articles: z.array(cardArticleSchema),
});

export type CardArticle = z.infer<typeof cardArticleSchema>;

export interface ArticleBank {
  articles: CardArticle[];
  byId: Map<string, CardArticle>;
}

let cachedArticleBank: Promise<ArticleBank> | null = null;
type ArticleDataLoader = () => Promise<unknown>;

let customArticleLoader: ArticleDataLoader | null = null;

const resolveArticleLoader = (): ArticleDataLoader => {
  return customArticleLoader ?? importArticleData;
};

async function importArticleData() {
  const module = await import('../../../paranoid_times_card_articles_ALL.json');
  return (module as { default?: unknown }).default ?? module;
}

export async function loadArticleBank(): Promise<ArticleBank> {
  if (!cachedArticleBank) {
    const loader = resolveArticleLoader();
    cachedArticleBank = loader().then((rawData) => {
      const { articles } = articleFileSchema.parse(rawData);
      const byId = new Map<string, CardArticle>();

      for (const article of articles) {
        byId.set(article.id, article);
      }

      return { articles, byId } satisfies ArticleBank;
    });
  }

  return cachedArticleBank;
}

export function __setArticleBankLoader(loader: ArticleDataLoader | null): void {
  customArticleLoader = loader;
  cachedArticleBank = null;
}

export function __resetArticleBankCache(): void {
  customArticleLoader = null;
  cachedArticleBank = null;
}

export function getById(bank: ArticleBank, id: string | null | undefined): CardArticle | null {
  if (!id) {
    return null;
  }

  return bank.byId.get(id) ?? null;
}

export function has(bank: ArticleBank, id: string | null | undefined): boolean {
  if (!id) {
    return false;
  }

  return bank.byId.has(id);
}
