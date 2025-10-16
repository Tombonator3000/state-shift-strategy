import { z } from 'zod';

import { ARTICLE_TONES, type ArticleTone } from '@/engine/newspaper/articleTones';
import fallbackArticleJson from '../../paranoid_times_card_articles_ALL.json' assert { type: 'json' };

export type CardArticleTone = 'truth' | 'government';

export type CardArticle = {
  id: string;
  faction: CardArticleTone;
  tone: CardArticleTone;
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
  preferredTone?: ArticleTone | null;
};

export type ArticleBank = Map<string, CardArticle>;

const BASE_URL =
  typeof import.meta !== 'undefined'
  && typeof import.meta.env?.BASE_URL === 'string'
    ? import.meta.env.BASE_URL
    : '/';
const CANDIDATE_PATHS = [
  `${BASE_URL}data/paranoid_times_card_articles_ALL.json`,
  `${BASE_URL}paranoid_times_card_articles_ALL.json`,
];

let cachedBank: ArticleBank | null = null;
let loadingPromise: Promise<ArticleBank> | null = null;

const factionSchema = z.preprocess(
  value => {
    if (typeof value !== 'string') {
      return value;
    }
    const normalised = value.trim().toLowerCase();
    if (normalised === 'truth') {
      return 'truth';
    }
    if (normalised === 'government' || normalised === 'gov') {
      return 'government';
    }
    return value;
  },
  z.union([z.literal('truth'), z.literal('government')]),
);

const toneSchema = z.enum(ARTICLE_TONES);

const articleSchema = z.object({
  id: z.string().min(1),
  faction: factionSchema,
  tags: z.array(z.string()).optional(),
  headline: z.string().optional(),
  subhead: z.string().optional(),
  byline: z.string().optional(),
  body: z.string().optional(),
  imagePrompt: z.string().optional(),
  statesMentioned: z.array(z.string()).optional(),
  recurringCharacter: z.string().optional(),
  followUpHooks: z.array(z.string()).optional(),
  articleVariant: z.string().optional(),
  preferredTone: toneSchema.optional().nullable(),
});

const articleFileSchema = z.object({
  schemaVersion: z.number().optional(),
  articles: z.array(articleSchema).default([]),
});

type NormaliseStringOptions = {
  unique?: boolean;
  lower?: boolean;
};

const normaliseStrings = (
  input: string[] | undefined,
  options: NormaliseStringOptions = {},
): string[] => {
  const { unique = false, lower = false } = options;
  if (!Array.isArray(input)) {
    return [];
  }
  const seen = new Set<string>();
  const results: string[] = [];
  for (const raw of input) {
    if (typeof raw !== 'string') {
      continue;
    }
    let value = raw.trim();
    if (!value) {
      continue;
    }
    if (lower) {
      value = value.toLowerCase();
    }
    if (unique) {
      if (seen.has(value)) {
        continue;
      }
      seen.add(value);
    }
    results.push(value);
  }
  return results;
};

const toCardArticle = (raw: z.infer<typeof articleSchema>): CardArticle => {
  const faction = raw.faction;
  const tags = normaliseStrings(raw.tags, { unique: true, lower: true });

  return {
    id: raw.id,
    faction,
    tone: faction,
    tags,
    headline: raw.headline?.trim() || undefined,
    subhead: raw.subhead?.trim() || undefined,
    byline: raw.byline?.trim() || undefined,
    body: raw.body?.trim() || undefined,
    imagePrompt: raw.imagePrompt?.trim() || undefined,
    statesMentioned: normaliseStrings(raw.statesMentioned, { unique: true }),
    recurringCharacter: raw.recurringCharacter?.trim() || null,
    followUpHooks: normaliseStrings(raw.followUpHooks, { unique: true }),
    articleVariant: raw.articleVariant?.trim() || null,
    preferredTone: raw.preferredTone ?? null,
  } satisfies CardArticle;
};

const buildArticleBank = (payload: unknown): ArticleBank => {
  const parsed = articleFileSchema.parse(payload);
  const bank: ArticleBank = new Map();
  for (const article of parsed.articles) {
    try {
      const entry = toCardArticle(article);
      bank.set(entry.id, entry);
    } catch (error) {
      console.warn('[article-bank] failed to parse article entry', article?.id, error);
    }
  }
  return bank;
};

const fallbackArticleBank: ArticleBank = buildArticleBank(fallbackArticleJson as unknown);

cachedBank = fallbackArticleBank;

const fetchCanonical = async (): Promise<unknown | null> => {
  if (typeof fetch !== 'function') {
    return null;
  }
  for (const path of CANDIDATE_PATHS) {
    try {
      const response = await fetch(path, { cache: 'no-store' });
      if (response.ok) {
        return await response.json();
      }
      console.warn('[article-bank] fetch failed', path, response.status, response.statusText);
    } catch (error) {
      console.warn('[article-bank] network error', path, error);
    }
  }
  return null;
};

export const getArticleBankIfReady = (): ArticleBank | null => cachedBank;

export const clearArticleBankCache = (): void => {
  cachedBank = fallbackArticleBank;
  loadingPromise = null;
};

export async function loadArticleBank(): Promise<ArticleBank> {
  if (cachedBank && cachedBank !== fallbackArticleBank) {
    return cachedBank;
  }

  if (loadingPromise) {
    return loadingPromise;
  }

  loadingPromise = (async () => {
    const payload = await fetchCanonical();
    if (payload) {
      cachedBank = buildArticleBank(payload);
    } else {
      cachedBank = fallbackArticleBank;
    }
    loadingPromise = null;
    return cachedBank;
  })();

  return loadingPromise;
}

export const getArticleById = (id: string, bank: ArticleBank | null = cachedBank): CardArticle | null => {
  if (!id) {
    return null;
  }
  return bank?.get(id) ?? null;
};

if (typeof window !== 'undefined' && typeof fetch === 'function') {
  void loadArticleBank().catch(error => {
    console.warn('[article-bank] initial load failed', error);
  });
}
