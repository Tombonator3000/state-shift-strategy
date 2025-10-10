import type { ArticleBlock } from '@/news/headlineEngine';
import templatesJson from '@/news/finalFrontPageTemplates.json';

export interface FrontPageTemplateFormat {
  id: string;
  subjects: string[];
  events: string[];
}

export interface FrontPageTemplateData {
  kickers: string[];
  connectors: string[];
  headlineFormats: FrontPageTemplateFormat[];
  dekSnippets: string[];
}

export interface FrontPageBulletin {
  kicker?: string | null;
  hed?: string | null;
  dek?: string | null;
}

export interface SanitizedFrontPageBulletin {
  kicker?: string;
  hed?: string;
  dek?: string;
  mutations: {
    kicker: boolean;
    hed: boolean;
    dek: boolean;
  };
}

export interface FrontPageComposition extends Pick<ArticleBlock, 'hed' | 'dek'> {
  kicker: string;
  metadata?: {
    templateId?: string;
    usedBulletinHed: boolean;
    usedBulletinDek: boolean;
    sanitizedHed: boolean;
    sanitizedDek: boolean;
    fallback: boolean;
  };
}

export interface ComposeFrontPageOptions {
  bulletin?: FrontPageBulletin | null;
  seed?: string | number;
}

const LEGACY_FALLBACK: FrontPageComposition = {
  kicker: 'Paranoid Times Exclusive',
  hed: 'You Won\'t Believe What Happens Next...',
  dek: 'Shadow bureau insiders spill every last secret.',
  metadata: {
    templateId: 'legacy-fallback',
    usedBulletinHed: false,
    usedBulletinDek: false,
    sanitizedHed: false,
    sanitizedDek: false,
    fallback: true,
  },
};

const FOOD_TERMS = [
  'apple',
  'apples',
  'banana',
  'bananas',
  'bread',
  'bagel',
  'bagels',
  'burger',
  'burgers',
  'cake',
  'cakes',
  'candy',
  'cocoa',
  'coffee',
  'cookie',
  'cookies',
  'croissant',
  'croissants',
  'doughnut',
  'doughnuts',
  'donut',
  'donuts',
  'dumpling',
  'dumplings',
  'egg',
  'eggs',
  'fries',
  'fry',
  'grape',
  'grapes',
  'ham',
  'honey',
  'juice',
  'kale',
  'kebab',
  'kebabs',
  'latte',
  'lattes',
  'meat',
  'muffin',
  'muffins',
  'noodle',
  'noodles',
  'orange',
  'oranges',
  'pancake',
  'pancakes',
  'pasta',
  'peach',
  'peaches',
  'pear',
  'pears',
  'pepper',
  'peppers',
  'pie',
  'pies',
  'pizza',
  'pretzel',
  'pretzels',
  'rice',
  'salad',
  'salads',
  'sandwich',
  'sandwiches',
  'soda',
  'steak',
  'steaks',
  'stew',
  'stews',
  'sushi',
  'taco',
  'tacos',
  'tea',
  'toast',
  'tomato',
  'tomatoes',
  'vegetable',
  'vegetables',
  'yogurt',
];

const FOOD_PATTERN = new RegExp(`\\b(${FOOD_TERMS.join('|')})\\b`, 'gi');

let cachedTemplates: FrontPageTemplateData | null = null;

const toTemplateData = (raw: unknown): FrontPageTemplateData | null => {
  if (!raw || typeof raw !== 'object') {
    return null;
  }

  const data = raw as FrontPageTemplateData;
  const normalizeList = (value: unknown): string[] => {
    return Array.isArray(value) ? value.map(item => String(item)) : [];
  };

  const normalizeFormats = (value: unknown): FrontPageTemplateFormat[] => {
    if (!Array.isArray(value)) {
      return [];
    }

    return value
      .map(entry => {
        if (!entry || typeof entry !== 'object') {
          return null;
        }
        const candidate = entry as FrontPageTemplateFormat;
        return {
          id: String(candidate.id ?? ''),
          subjects: normalizeList(candidate.subjects),
          events: normalizeList(candidate.events),
        } satisfies FrontPageTemplateFormat;
      })
      .filter((entry): entry is FrontPageTemplateFormat => Boolean(entry?.id));
  };

  return {
    kickers: normalizeList((data as { kickers?: unknown }).kickers),
    connectors: normalizeList((data as { connectors?: unknown }).connectors),
    headlineFormats: normalizeFormats((data as { headlineFormats?: unknown }).headlineFormats),
    dekSnippets: normalizeList((data as { dekSnippets?: unknown }).dekSnippets),
  };
};

export const getFinalFrontPageTemplates = (): FrontPageTemplateData | null => {
  if (cachedTemplates) {
    return cachedTemplates;
  }

  const parsed = toTemplateData(templatesJson);
  cachedTemplates = parsed;
  return parsed;
};

const coerceToString = (value: string | number | undefined): string | undefined => {
  if (typeof value === 'number' && Number.isFinite(value)) {
    return value.toString(10);
  }
  if (typeof value === 'string' && value.trim().length) {
    return value;
  }
  return undefined;
};

const computeSeedValue = (seed: string | number | undefined): number => {
  const base = coerceToString(seed);
  const source = base ?? '';
  let hash = 1779033703 ^ source.length;
  for (let i = 0; i < source.length; i += 1) {
    hash = Math.imul(hash ^ source.charCodeAt(i), 3432918353);
    hash = (hash << 13) | (hash >>> 19);
  }
  hash = Math.imul(hash ^ (hash >>> 16), 2246822507);
  hash = Math.imul(hash ^ (hash >>> 13), 3266489909);
  hash ^= hash >>> 16;
  return hash >>> 0;
};

const pickFromList = <T,>(list: readonly T[], seed: number, salt: number): T | undefined => {
  if (list.length === 0) {
    return undefined;
  }
  const index = Number((((seed >>> 0) + salt) % list.length + list.length) % list.length);
  return list[index];
};

export const sanitizeFrontPageText = (value: string | null | undefined): { value?: string; mutated: boolean } => {
  if (typeof value !== 'string') {
    return { value: undefined, mutated: false };
  }

  const trimmed = value.trim();
  if (!trimmed) {
    return { value: undefined, mutated: false };
  }

  const cleaned = trimmed
    .replace(FOOD_PATTERN, '')
    .replace(/\s{2,}/g, ' ')
    .replace(/\s+([,.;:!?])/g, '$1')
    .trim();

  return {
    value: cleaned.length ? cleaned : undefined,
    mutated: cleaned !== trimmed,
  };
};

const sanitizeBulletin = (bulletin?: FrontPageBulletin | null): SanitizedFrontPageBulletin => {
  if (!bulletin) {
    return {
      mutations: {
        kicker: false,
        hed: false,
        dek: false,
      },
    };
  }

  const kickerResult = sanitizeFrontPageText(bulletin.kicker ?? undefined);
  const hedResult = sanitizeFrontPageText(bulletin.hed ?? undefined);
  const dekResult = sanitizeFrontPageText(bulletin.dek ?? undefined);

  return {
    kicker: kickerResult.value,
    hed: hedResult.value,
    dek: dekResult.value,
    mutations: {
      kicker: kickerResult.mutated,
      hed: hedResult.mutated,
      dek: dekResult.mutated,
    },
};
};

export const sanitizeFrontPageBulletin = (
  bulletin?: FrontPageBulletin | null,
): SanitizedFrontPageBulletin => sanitizeBulletin(bulletin);

const splitIntoParagraphs = (body: string): string[] =>
  body
    .split(/\r?\n\s*\r?\n/g)
    .map(chunk => sanitizeFrontPageText(chunk).value?.trim())
    .filter((value): value is string => Boolean(value));

export const extractArticleParagraphs = (body?: string | null): string[] => {
  if (typeof body !== 'string') {
    return [];
  }

  return splitIntoParagraphs(body);
};

const buildFromTemplate = (
  templates: FrontPageTemplateData,
  seed: number,
): { hed?: string; dek?: string; templateId?: string } => {
  if (!templates.headlineFormats.length) {
    return {};
  }

  const template = pickFromList(templates.headlineFormats, seed, 0);
  if (!template) {
    return {};
  }

  const subject = pickFromList(template.subjects, seed, 11);
  const connector = pickFromList(templates.connectors, seed, 23);
  const event = pickFromList(template.events, seed, 37);

  const hedParts = [subject, connector, event].filter(Boolean) as string[];
  const hed = hedParts.length ? hedParts.join(' ') : undefined;
  const dek = pickFromList(templates.dekSnippets, seed, 53);

  return {
    hed,
    dek,
    templateId: template.id,
  };
};

export const composeFinalFrontPage = (
  options: ComposeFrontPageOptions = {},
): FrontPageComposition => {
  const templates = getFinalFrontPageTemplates();
  const sanitized = sanitizeBulletin(options.bulletin ?? null);

  const fallback: FrontPageComposition = {
    ...LEGACY_FALLBACK,
    kicker: sanitized.kicker ?? LEGACY_FALLBACK.kicker,
    hed: sanitized.hed ?? LEGACY_FALLBACK.hed,
    dek: sanitized.dek ?? LEGACY_FALLBACK.dek,
    metadata: {
      ...LEGACY_FALLBACK.metadata,
      usedBulletinHed: Boolean(sanitized.hed),
      usedBulletinDek: Boolean(sanitized.dek),
      sanitizedHed: sanitized.mutations.hed,
      sanitizedDek: sanitized.mutations.dek,
      fallback: true,
    },
  };

  if (!templates) {
    return fallback;
  }

  const seedSource = options.seed ?? sanitized.hed ?? sanitized.dek ?? sanitized.kicker ?? templates.kickers[0] ?? 'front-page';
  const seed = computeSeedValue(seedSource);

  const { hed: generatedHed, dek: generatedDek, templateId } = buildFromTemplate(templates, seed);

  const kicker = sanitized.kicker ?? pickFromList(templates.kickers, seed, 71) ?? fallback.kicker;
  const hed = sanitized.hed ?? generatedHed ?? fallback.hed;
  const dek = sanitized.dek ?? generatedDek ?? fallback.dek;

  const missingGeneratedCopy = (!sanitized.hed && !generatedHed) || (!sanitized.dek && !generatedDek);

  if (!hed || !dek || missingGeneratedCopy) {
    return fallback;
  }

  return {
    kicker,
    hed,
    dek,
    metadata: {
      templateId: sanitized.hed ? undefined : templateId ?? fallback.metadata?.templateId,
      usedBulletinHed: Boolean(sanitized.hed),
      usedBulletinDek: Boolean(sanitized.dek),
      sanitizedHed: sanitized.mutations.hed,
      sanitizedDek: sanitized.mutations.dek,
      fallback: false,
    },
  };
};

export const getLegacyFrontPageFallback = (): FrontPageComposition => ({ ...LEGACY_FALLBACK });
