import type { CardArticle, ArticleBank } from './articleBank';
import { getById } from './articleBank';
import {
  BYLINE_POOLS,
  DEFAULT_TAGS,
  STORY_TEMPLATES,
  VERB_POOLS,
  type StoryCardLike,
  type StoryTemplate,
  type StoryTone,
} from './templates';

export interface MainStoryOptions {
  bank: ArticleBank;
  cards: StoryCardLike[];
  activeFaction?: StoryCardLike['faction'];
}

export interface MainStoryDebugData {
  fallback: boolean;
  selectedCardId: string | null;
  templateId: string | null;
  verbChoices: {
    pool: string[];
    selected: string | null;
    seed: string;
  };
  commonTags: string[];
}

export interface MainStoryResult {
  article: CardArticle;
  cardId: string | null;
  debug: MainStoryDebugData;
}

const normalizeTone = (faction: StoryCardLike['faction']): StoryTone => {
  const value = (typeof faction === 'string' ? faction : '').toLowerCase();
  if (value.includes('gov')) {
    return 'government';
  }
  return 'truth';
};

const normalizeTag = (value: string | null | undefined): string => {
  if (!value) {
    return '';
  }
  return value
    .toString()
    .trim()
    .replace(/^#/, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
};

const formatTagLabel = (value: string): string => {
  const trimmed = value.trim();
  const withoutHash = trimmed.startsWith('#') ? trimmed.slice(1) : trimmed;
  const clean = withoutHash.replace(/[^a-z0-9]+/gi, ' ').trim();
  if (!clean) {
    return '#ParanoidPress';
  }
  const words = clean
    .split(/\s+/)
    .filter(Boolean)
    .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase());
  return `#${words.join('')}`;
};

const tagToWords = (value: string): string => {
  const trimmed = value.trim();
  const withoutHash = trimmed.startsWith('#') ? trimmed.slice(1) : trimmed;
  return withoutHash.replace(/[^a-z0-9]+/gi, ' ').replace(/\s+/g, ' ').trim();
};

const formatList = (items: string[]): string => {
  const filtered = items.map(item => item.trim()).filter(Boolean);
  if (filtered.length === 0) {
    return '';
  }
  if (filtered.length === 1) {
    return filtered[0];
  }
  if (filtered.length === 2) {
    return `${filtered[0]} and ${filtered[1]}`;
  }
  return `${filtered.slice(0, -1).join(', ')}, and ${filtered[filtered.length - 1]}`;
};

const ensureSentence = (value: string): string => {
  const trimmed = value.trim();
  if (!trimmed) {
    return trimmed;
  }
  if (/[.!?]$/.test(trimmed)) {
    return trimmed;
  }
  return `${trimmed}.`;
};

const hashString = (value: string): number => {
  let hash = 0;
  for (let index = 0; index < value.length; index += 1) {
    hash = Math.imul(31, hash) + value.charCodeAt(index);
    hash |= 0;
  }
  return hash >>> 0;
};

const pickDeterministicIndex = (length: number, seed: string, salt: string): number => {
  if (length <= 0) {
    return 0;
  }
  const hashed = hashString(`${seed}:${salt}`);
  return hashed % length;
};

const dedupeStrings = (values: Array<string | null | undefined>): string[] => {
  const seen = new Set<string>();
  const result: string[] = [];
  for (const value of values) {
    if (!value) {
      continue;
    }
    const trimmed = value.trim();
    if (!trimmed) {
      continue;
    }
    if (!seen.has(trimmed)) {
      seen.add(trimmed);
      result.push(trimmed);
    }
  }
  return result;
};

const applyTemplate = (template: string, context: Record<string, string>): string => {
  return template.replace(/\{([^}]+)\}/g, (_match, key) => {
    const replacement = context[key];
    return replacement !== undefined ? replacement : _match;
  });
};

const buildBaseSeed = (tone: StoryTone, cards: StoryCardLike[]): string => {
  const ids = cards.map(card => card.id).filter(Boolean).sort();
  const idSeed = ids.length ? ids.join('|') : 'no-cards';
  return `${tone}|${idSeed}`;
};

const collectTagData = (
  cards: StoryCardLike[],
  articleByCard: Map<string, CardArticle>,
): {
  common: string[];
  all: string[];
  labelMap: Map<string, string>;
} => {
  const normalizedSets: Array<Set<string>> = [];
  const union = new Set<string>();
  const labelMap = new Map<string, string>();

  for (const card of cards) {
    const article = articleByCard.get(card.id);
    const combined = [
      ...((Array.isArray(card.tags) ? card.tags : []) ?? []),
      ...((article?.tags ?? []) as string[]),
    ];
    const set = new Set<string>();
    for (const raw of combined) {
      if (!raw) {
        continue;
      }
      const normalized = normalizeTag(raw);
      if (!normalized) {
        continue;
      }
      set.add(normalized);
      union.add(normalized);
      if (!labelMap.has(normalized)) {
        labelMap.set(normalized, raw);
      }
    }
    if (set.size > 0) {
      normalizedSets.push(set);
    }
  }

  let intersection = new Set<string>();
  if (normalizedSets.length > 0) {
    intersection = new Set<string>(normalizedSets[0]);
    for (let index = 1; index < normalizedSets.length; index += 1) {
      const current = normalizedSets[index];
      intersection = new Set<string>([...intersection].filter(tag => current.has(tag)));
      if (intersection.size === 0) {
        break;
      }
    }
  }

  const common = [...intersection].sort();
  const all = [...union].sort();

  return { common, all, labelMap };
};

const buildContext = (
  tone: StoryTone,
  cards: StoryCardLike[],
  selectedCard: StoryCardLike | null,
  commonTags: string[],
  labelMap: Map<string, string>,
  verb: string,
): {
  context: Record<string, string>;
  articleTags: string[];
} => {
  const defaultHashtag = tone === 'truth' ? '#LeakSeason' : '#NarrativeContainment';
  const tagLabels = commonTags.map(tag => formatTagLabel(labelMap.get(tag) ?? tag));
  const tagWords = tagLabels.map(tag => tagToWords(tag));
  const fallbackTagLabel = tagLabels[0] ?? defaultHashtag;
  const fallbackWords = tagWords[0] ?? tagToWords(defaultHashtag);

  const cardNames = cards
    .map(card => card.name ?? card.id)
    .filter((name): name is string => Boolean(name && name.trim()));
  const cardNamesUpper = cardNames.map(name => name.toUpperCase());
  const cardListPlain = cardNames.length ? formatList(cardNames) : 'field operatives';
  const cardListUpper = cardNamesUpper.length ? formatList(cardNamesUpper) : 'FIELD OPERATIVES';

  const primaryName = (selectedCard?.name ?? cardNames[0] ?? 'Classified Operation').trim() || 'Classified Operation';
  const primaryNameUpper = primaryName.toUpperCase();

  const tagHeadline = fallbackWords ? fallbackWords.toUpperCase() : fallbackTagLabel.replace(/^#/, '').toUpperCase();
  const tagSummary = tagLabels.length
    ? tagLabels.join(', ')
    : tone === 'truth'
      ? '#HotLead'
      : '#SituationNormal';
  const tagPhrase = tagWords.length
    ? formatList(tagWords.map(word => word.toLowerCase()))
    : tone === 'truth'
      ? 'classified transmissions'
      : 'containment protocols';

  const context: Record<string, string> = {
    primaryName,
    primaryNameUpper,
    cardListPlain,
    cardList: cardListUpper,
    verb,
    tagLine: fallbackTagLabel,
    tagHeadline,
    tagSummary,
    tagPhrase,
  };

  const articleTagSet = new Set<string>();
  for (const tag of labelMap.values()) {
    const formatted = formatTagLabel(tag);
    articleTagSet.add(formatted);
  }
  if (articleTagSet.size === 0) {
    for (const tag of DEFAULT_TAGS[tone]) {
      articleTagSet.add(tag);
    }
  }

  return {
    context,
    articleTags: Array.from(articleTagSet),
  };
};

const buildFallbackArticle = (
  tone: StoryTone,
  template: StoryTemplate,
  context: Record<string, string>,
  byline: string,
  seed: string,
  articleTags: string[],
): CardArticle => {
  const headline = applyTemplate(template.headline, context).toUpperCase();
  const deck = ensureSentence(applyTemplate(template.deck, context));
  const bodySentences = template.body.map(sentence => ensureSentence(applyTemplate(sentence, context)));
  const body = bodySentences.join(' ');
  const imagePrompt = applyTemplate(template.imagePrompt, context);

  return {
    id: `generated-${tone}-${hashString(`${seed}:${headline}`)}`,
    tone,
    tags: dedupeStrings([...articleTags, ...DEFAULT_TAGS[tone]]),
    headline,
    subhead: deck,
    byline,
    body,
    imagePrompt,
  } satisfies CardArticle;
};

export function generateMainStory(options: MainStoryOptions): MainStoryResult {
  const cards = Array.isArray(options.cards) ? options.cards.filter(card => Boolean(card?.id)) : [];
  const tone = normalizeTone(options.activeFaction ?? cards[0]?.faction);
  const seed = buildBaseSeed(tone, cards);

  const articleByCard = new Map<string, CardArticle>();
  for (const card of cards) {
    const article = getById(options.bank, card.id);
    if (article) {
      articleByCard.set(card.id, article);
    }
  }

  const tagData = collectTagData(cards, articleByCard);
  const verbPool = VERB_POOLS[tone] ?? [];
  const verbSeed = `${seed}:verb`;
  const verbIndex = pickDeterministicIndex(verbPool.length || 1, seed, 'verb');
  const selectedVerb = verbPool.length ? verbPool[verbIndex] : tone === 'truth' ? 'EXPOSES' : 'CONTAINS';

  const articleCandidates = cards
    .map(card => ({ card, article: articleByCard.get(card.id) }))
    .filter((entry): entry is { card: StoryCardLike; article: CardArticle } => Boolean(entry.article))
    .sort((a, b) => a.card.id.localeCompare(b.card.id));

  let selectedCard: StoryCardLike | null = null;
  let selectedArticle: CardArticle | null = null;
  if (articleCandidates.length > 0) {
    const index = pickDeterministicIndex(articleCandidates.length, seed, 'article');
    const choice = articleCandidates[index];
    selectedCard = choice.card;
    selectedArticle = choice.article;
  } else if (cards.length > 0) {
    const fallbackIndex = pickDeterministicIndex(cards.length, seed, 'fallback-card');
    selectedCard = cards.slice().sort((a, b) => a.id.localeCompare(b.id))[fallbackIndex];
  }

  const bylinePool = BYLINE_POOLS[tone] ?? [];
  const bylineIndex = pickDeterministicIndex(bylinePool.length || 1, seed, 'byline');
  const fallbackByline = bylinePool.length ? bylinePool[bylineIndex] : tone === 'truth' ? 'By: Field Operatives' : 'By: Clearance Desk';

  const debugBase: MainStoryDebugData = {
    fallback: false,
    selectedCardId: selectedCard?.id ?? null,
    templateId: null,
    verbChoices: {
      pool: verbPool,
      selected: null,
      seed: verbSeed,
    },
    commonTags: tagData.common.map(tag => formatTagLabel(tagData.labelMap.get(tag) ?? tag)),
  };

  if (selectedArticle) {
    const mergedTags = dedupeStrings([
      ...selectedArticle.tags,
      ...tagData.all.map(tag => formatTagLabel(tagData.labelMap.get(tag) ?? tag)),
      ...DEFAULT_TAGS[tone],
    ]);
    const article: CardArticle = {
      ...selectedArticle,
      tone,
      tags: mergedTags,
      subhead: selectedArticle.subhead?.trim() || ensureSentence(selectedArticle.body.slice(0, 120)),
      byline: selectedArticle.byline?.trim() || fallbackByline,
      imagePrompt:
        selectedArticle.imagePrompt ??
        (tone === 'truth'
          ? `tabloid collage spotlighting ${selectedArticle.headline}`
          : `sterile dossier photography referencing ${selectedArticle.headline}`),
    };
    return {
      article,
      cardId: selectedCard?.id ?? null,
      debug: debugBase,
    } satisfies MainStoryResult;
  }

  const templatePool = STORY_TEMPLATES[tone] ?? [];
  const templateIndex = pickDeterministicIndex(templatePool.length || 1, seed, 'template');
  const template = templatePool.length ? templatePool[templateIndex] : STORY_TEMPLATES[tone === 'truth' ? 'truth' : 'government'][0];

  const { context, articleTags } = buildContext(
    tone,
    cards,
    selectedCard,
    tagData.common,
    tagData.labelMap,
    selectedVerb,
  );

  const fallbackArticle = buildFallbackArticle(
    tone,
    template,
    context,
    fallbackByline,
    seed,
    articleTags,
  );

  return {
    article: fallbackArticle,
    cardId: selectedCard?.id ?? null,
    debug: {
      ...debugBase,
      fallback: true,
      templateId: template.id,
      verbChoices: {
        pool: verbPool,
        selected: selectedVerb,
        seed: verbSeed,
      },
    },
  } satisfies MainStoryResult;
}
