import { z } from 'zod';

import perCardArticlesJson from './paranoid_times_card_articles_ALL.json' assert { type: 'json' };
import comboBankJson from './story_combos.json' assert { type: 'json' };
import tripleBankJson from './extra_extra_triple_bank.json' assert { type: 'json' };

export type ArticleBlock = {
  id: string;
  tone: 'truth' | 'government';
  tags: string[];
  headline?: string;
  subhead?: string;
  byline?: string;
  body?: string;
  imagePrompt?: string;
};

export type ComboRule = {
  comboId: string;
  priority: number;
  exclusive: boolean;
  tags: string[];
  when: {
    minCards: number;
    anyIds: string[];
    anyTags: string[];
    opponentIds: string[];
    factions: Array<'truth' | 'government'>;
    requiresStateEvent: boolean;
  };
  headline: string;
  subhead: string;
  byline: string;
  body: string[];
  imagePrompt?: string;
};

export type TripleTemplateMatch = {
  tagsAny: string[];
  minCount: number;
  truthIdsAny: string[];
  govIdsAny: string[];
  govTagsAny: string[];
  types: string[];
  factions: Array<'truth' | 'government'>;
  typesAnyCount: Record<string, number>;
};

export type TripleTemplateRule = {
  id: string;
  match: Partial<TripleTemplateMatch>;
  headline: string;
  subhead?: string;
  imagePrompt?: string;
  body: string[];
  factionHint?: 'truth' | 'government' | 'mixed';
};

export type TripleTemplateBank = {
  defaults: {
    imageStyle: string;
    maxBodyParas: number;
    byline: string;
  };
  lexicon: Record<string, string[]>;
  rendering: {
    headlineFormat: string;
    subheadFormat: string;
    kickers: Record<'truth' | 'government' | 'mixed', string[]>;
    stingers: string[];
  };
  priority: string[];
  templates: Record<string, TripleTemplateRule[]>;
};

let cachedArticles: Map<string, ArticleBlock> | null = null;
let cachedComboBank: ComboRule[] | null = null;
let cachedTripleBank: TripleTemplateBank | null = null;

const buildPerCardArticleCache = (): Map<string, ArticleBlock> => {
  const parsed = perCardArticleSchema.parse(perCardArticlesJson);
  runTagParityCheck(parsed);
  const map = new Map<string, ArticleBlock>();

  for (const entry of parsed.articles) {
    const tone = entry.tone.trim().toLowerCase();
    if (tone !== 'truth' && tone !== 'gov' && tone !== 'government') {
      continue;
    }
    const normalisedTags = unique(entry.tags.map(normaliseTag).filter(Boolean));
    const record: ArticleBlock = {
      id: entry.id,
      tone: tone === 'truth' ? 'truth' : 'government',
      tags: normalisedTags,
      headline: entry.headline,
      subhead: entry.subhead,
      byline: entry.byline,
      body: entry.body,
      imagePrompt: entry.imagePrompt,
    } satisfies ArticleBlock;
    map.set(record.id, record);
  }

  return map;
};

const buildComboBankCache = (): ComboRule[] => {
  const parsed = comboBankSchema.parse(comboBankJson);

  const combos: ComboRule[] = parsed.combos.map(combo => {
    const tags = unique(combo.tags.map(normaliseTag).filter(Boolean));
    const factions = (combo.when.factions ?? []).map(value => value.trim().toLowerCase()).filter(Boolean);
    const normalizedFactions = factions.filter(
      (value): value is 'truth' | 'government' => value === 'truth' || value === 'government',
    );

    const when: ComboRule['when'] = {
      minCards: combo.when.minCards ?? 2,
      anyIds: unique((combo.when.anyIds ?? []).map(id => id.trim()).filter(Boolean)),
      anyTags: unique((combo.when.anyTags ?? []).map(normaliseTag).filter(Boolean)),
      opponentIds: unique((combo.when.opponentIds ?? []).map(id => id.trim()).filter(Boolean)),
      factions: normalizedFactions,
      requiresStateEvent: Boolean(combo.when.requiresStateEvent),
    };

    return {
      comboId: combo.comboId,
      priority: combo.priority ?? 0,
      exclusive: combo.exclusive ?? false,
      tags,
      when,
      headline: combo.headline,
      subhead: combo.subhead ?? '',
      byline: combo.byline ?? 'By: Composite Desk',
      body: combo.body ?? [],
      imagePrompt: combo.imagePrompt,
    } satisfies ComboRule;
  });

  combos.sort((a, b) => b.priority - a.priority);

  return combos;
};

const buildTripleBankCache = (): TripleTemplateBank => {
  const parsed = tripleBankSchema.parse(tripleBankJson);

  const templates: Record<string, TripleTemplateRule[]> = {};
  for (const [bucketId, rules] of Object.entries(parsed.templates)) {
    templates[bucketId] = rules.map(rule => {
      const match: Partial<TripleTemplateMatch> = {};
      if (rule.match.tagsAny) {
        match.tagsAny = unique(rule.match.tagsAny.map(normaliseTag).filter(Boolean));
      }
      if (rule.match.minCount) {
        match.minCount = rule.match.minCount;
      }
      if (rule.match.truthIdsAny) {
        match.truthIdsAny = unique(rule.match.truthIdsAny.map(id => id.trim()).filter(Boolean));
      }
      if (rule.match.govIdsAny) {
        match.govIdsAny = unique(rule.match.govIdsAny.map(id => id.trim()).filter(Boolean));
      }
      if (rule.match.govTagsAny) {
        match.govTagsAny = unique(rule.match.govTagsAny.map(normaliseTag).filter(Boolean));
      }
      if (rule.match.types) {
        match.types = rule.match.types.map(type => type.trim()).filter(Boolean);
      }
      if (rule.match.factions) {
        const factions = rule.match.factions
          .map(value => value.trim().toLowerCase())
          .filter((value): value is 'truth' | 'government' => value === 'truth' || value === 'government');
        if (factions.length === 3) {
          match.factions = factions;
        }
      }
      if (rule.match.typesAnyCount) {
        match.typesAnyCount = {};
        for (const [type, count] of Object.entries(rule.match.typesAnyCount)) {
          if (typeof count === 'number' && Number.isFinite(count) && count > 0) {
            match.typesAnyCount[type] = count;
          }
        }
      }

      return {
        id: rule.id,
        match,
        headline: rule.headline,
        subhead: rule.subhead,
        imagePrompt: rule.imagePrompt,
        body: rule.body,
        factionHint:
          rule.factionHint === 'truth' || rule.factionHint === 'government' || rule.factionHint === 'mixed'
            ? rule.factionHint
            : undefined,
      } satisfies TripleTemplateRule;
    });
  }

  return {
    defaults: {
      imageStyle: parsed.defaults.imageStyle,
      maxBodyParas: parsed.defaults.maxBodyParas,
      byline: parsed.defaults.byline,
    },
    lexicon: parsed.lexicon,
    rendering: {
      headlineFormat: parsed.rendering.headline_format,
      subheadFormat: parsed.rendering.subhead_format,
      kickers: parsed.rendering.kickers as any,
      stingers: parsed.rendering.stingers as any,
    },
    priority: parsed.priority,
    templates,
  } satisfies TripleTemplateBank;
};

const ensurePerCardArticles = (): Map<string, ArticleBlock> => {
  if (!cachedArticles) {
    cachedArticles = buildPerCardArticleCache();
  }
  return cachedArticles;
};

const ensureComboBank = (): ComboRule[] => {
  if (!cachedComboBank) {
    cachedComboBank = buildComboBankCache();
  }
  return cachedComboBank;
};

const ensureTripleBank = (): TripleTemplateBank => {
  if (!cachedTripleBank) {
    cachedTripleBank = buildTripleBankCache();
  }
  return cachedTripleBank;
};

const normaliseTag = (tag: string): string => tag.trim().toLowerCase().replace(/\s+/g, '-');

const unique = <T,>(values: T[]): T[] => Array.from(new Set(values));

const normaliseTagList = (input: unknown): string[] => {
  if (!Array.isArray(input)) {
    return [];
  }
  return unique(
    input
      .map(value => (typeof value === 'string' ? value : ''))
      .filter(Boolean)
      .map(normaliseTag),
  ).sort();
};

type PerCardArticlePayload = z.infer<typeof perCardArticleSchema>;

const canonicalArticleSchema = z.object({
  id: z.string().min(1),
  tags: z.array(z.string()).default([]),
});

const canonicalArticleFileSchema = z.object({
  articles: z.array(canonicalArticleSchema).default([]),
});

const isProdBuild = (() => {
  if (typeof import.meta !== 'undefined' && typeof import.meta.env !== 'undefined') {
    return Boolean(import.meta.env.PROD);
  }
  if (typeof process !== 'undefined' && typeof process.env !== 'undefined') {
    return process.env.NODE_ENV === 'production';
  }
  return false;
})();

const loadCanonicalTagMap: () => Promise<Map<string, string[]> | null> = isProdBuild
  ? async () => null
  : async () => {
      try {
        const canonicalArticlesModule = (await import(
          '../../../public/data/paranoid_times_card_articles_ALL.json',
          { assert: { type: 'json' } },
        )) as { default: unknown };
        const canonicalArticlesJson = canonicalArticlesModule?.default ?? canonicalArticlesModule;
        const parsed = canonicalArticleFileSchema.safeParse(canonicalArticlesJson);
        if (!parsed.success) {
          console.warn('[news-pools] Failed to parse canonical article tags', parsed.error);
          return null;
        }

        const map = new Map<string, string[]>();
        for (const article of parsed.data.articles) {
          map.set(article.id, normaliseTagList(article.tags));
        }
        return map;
      } catch (error) {
        console.warn('[news-pools] Failed to load canonical article tags', error);
        return null;
      }
    };

const runTagParityCheck = (() => {
  let executed = false;
  let canonicalTagMapPromise: Promise<Map<string, string[]> | null> | null = null;
  return (payload: PerCardArticlePayload): void => {
    if (executed) {
      return;
    }
    executed = true;
    if (isProdBuild) {
      return;
    }

    canonicalTagMapPromise ??= loadCanonicalTagMap();

    canonicalTagMapPromise
      .then(canonicalTagMap => {
        if (!canonicalTagMap || canonicalTagMap.size === 0) {
          return;
        }

        const divergences: string[] = [];
        for (const article of payload.articles) {
          const canonicalTags = canonicalTagMap.get(article.id);
          if (!canonicalTags) {
            continue;
          }
          const cachedTags = normaliseTagList(article.tags);
          if (!areTagListsEqual(cachedTags, canonicalTags)) {
            divergences.push(
              `${article.id}: cached=[${cachedTags.join(', ')}] canonical=[${canonicalTags.join(', ')}]`,
            );
          }
        }

        if (divergences.length > 0) {
          throw new Error(
            `newsPools cached tag regression detected. Ensure the generated cache copies canonical tags.\n${divergences.join('\n')}`,
          );
        }
      })
      .catch(error => {
        setTimeout(() => {
          throw error;
        }, 0);
      });
  };
})();

const areTagListsEqual = (a: string[], b: string[]): boolean => {
  if (a.length !== b.length) {
    return false;
  }
  return a.every((value, index) => value === b[index]);
};

const perCardArticleSchema = z.object({
  schemaVersion: z.number().optional(),
  articles: z
    .array(
      z.object({
        id: z.string().min(1),
        tone: z.string(),
        tags: z.array(z.string()).default([]),
        headline: z.string().optional(),
        subhead: z.string().optional(),
        byline: z.string().optional(),
        body: z.string().optional(),
        imagePrompt: z.string().optional(),
      }),
    )
    .default([]),
});

const comboBankSchema = z.object({
  schemaVersion: z.number().optional(),
  combos: z
    .array(
      z.object({
        comboId: z.string(),
        priority: z.number().default(0),
        exclusive: z.boolean().default(false),
        tags: z.array(z.string()).default([]),
        when: z
          .object({
            minCards: z.number().optional(),
            anyIds: z.array(z.string()).optional(),
            anyTags: z.array(z.string()).optional(),
            opponentIds: z.array(z.string()).optional(),
            factions: z.array(z.string()).optional(),
            requiresStateEvent: z.boolean().optional(),
          })
          .default({}),
        headline: z.string(),
        subhead: z.string().default(''),
        byline: z.string().default('By: Composite Desk'),
        body: z.array(z.string()).default([]),
        imagePrompt: z.string().optional(),
      }),
    )
    .default([]),
});

const tripleBankSchema = z.object({
  defaults: z.object({
    imageStyle: z.string().default('grainy photo'),
    maxBodyParas: z.number().default(3),
    byline: z.string().default('By: Composite Desk'),
  }),
  lexicon: z.record(z.string(), z.array(z.string())),
  rendering: z.object({
    headline_format: z.string(),
    subhead_format: z.string(),
    kickers: z.object({
      truth: z.array(z.string()).default([]),
      government: z.array(z.string()).default([]),
      mixed: z.array(z.string()).default([]),
    }),
    stingers: z.array(z.string()).default([]),
  }),
  priority: z.array(z.string()).default([]),
  templates: z.record(
    z.array(
      z.object({
        id: z.string(),
        match: z
          .object({
            tagsAny: z.array(z.string()).optional(),
            minCount: z.number().optional(),
            truthIdsAny: z.array(z.string()).optional(),
            govIdsAny: z.array(z.string()).optional(),
            govTagsAny: z.array(z.string()).optional(),
            types: z.array(z.string()).optional(),
            factions: z.array(z.string()).optional(),
            typesAnyCount: z.record(z.number()).optional(),
          })
          .default({}),
        headline: z.string(),
        subhead: z.string().optional(),
        imagePrompt: z.string().optional(),
        body: z.array(z.string()).default([]),
        factionHint: z.string().optional(),
      }),
    ),
  ),
});

export async function loadPerCardArticles(): Promise<Map<string, ArticleBlock>> {
  return ensurePerCardArticles();
}

export async function loadComboBank(): Promise<ComboRule[]> {
  return ensureComboBank();
}

export async function loadTripleBank(): Promise<TripleTemplateBank> {
  return ensureTripleBank();
}

export const getPerCardArticlesIfReady = (): Map<string, ArticleBlock> | null => {
  try {
    return ensurePerCardArticles();
  } catch (error) {
    console.warn('Failed to access per-card article cache', error);
    return null;
  }
};

export const getComboBankIfReady = (): ComboRule[] | null => {
  try {
    return ensureComboBank();
  } catch (error) {
    console.warn('Failed to access combo bank cache', error);
    return null;
  }
};

export const getTripleBankIfReady = (): TripleTemplateBank | null => {
  try {
    return ensureTripleBank();
  } catch (error) {
    console.warn('Failed to access triple headline bank cache', error);
    return null;
  }
};

export async function initNewsPools(): Promise<void> {
  await Promise.all([loadPerCardArticles(), loadComboBank(), loadTripleBank()]);
}
