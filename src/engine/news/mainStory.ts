import type { CardArticle } from './articleBank';
import { govTemplates, truthTemplates, type HeadlineTemplate } from './templates';

export type PlayedCardMeta = {
  id: string;
  name: string;
  type: 'ATTACK' | 'MEDIA' | 'ZONE';
  faction: 'TRUTH' | 'GOV';
};

export type GeneratedStory = {
  headline: string;
  subhead?: string;
  tone: 'truth' | 'gov';
  usedCards: string[];
  debug?: { commonTags: string[]; subject: string; parts: string[]; templateId: string };
};

export function generateMainStory(
  played: PlayedCardMeta[],
  lookup: (id: string) => CardArticle | null,
): GeneratedStory {
  if (played.length === 0) {
    return {
      headline: 'SPECIAL DISPATCH: PRINTING GREMLINS AT WORK',
      subhead: 'Witnesses report escalating weirdness. Officials baffled.',
      tone: 'truth',
      usedCards: [],
      debug: { commonTags: [], subject: 'FRONT PAGE', parts: [], templateId: 'fallback:none' },
    } satisfies GeneratedStory;
  }

  const normalizedCards = [...played].sort((a, b) => a.id.localeCompare(b.id));
  const tone: 'truth' | 'gov' = (normalizedCards[0]?.faction ?? played[0]?.faction) === 'GOV' ? 'gov' : 'truth';
  const articles = normalizedCards.map(card => lookup(card.id));

  const tagData = collectTagData(articles);
  const subjectIndex = resolveSubjectIndex(normalizedCards, tagData);
  const orderedCards = reorderBySubject(normalizedCards, subjectIndex);
  const orderedArticles = reorderBySubject(articles, subjectIndex);
  const subjectCard = orderedCards[0] ?? normalizedCards[0];

  const baseSeed = buildSeed(played);
  const pick = createPicker(baseSeed);

  const templates = tone === 'truth' ? truthTemplates : govTemplates;
  const template = templates.length ? pick(templates, 'template') : null;

  const { headline, templateId, parts, explicitSubhead } = composeHeadline(
    template,
    orderedCards,
    orderedArticles,
    tagData.common,
    pick,
    tone,
  );

  const commonTagDisplays = tagData.common.map(tag => tagData.display.get(tag) ?? formatTagForDisplay(tag));
  const subjectName = (subjectCard?.name ?? 'Front Page').toUpperCase();
  const subhead = explicitSubhead ?? formatSubhead(tone, commonTagDisplays);

  return {
    headline,
    subhead,
    tone,
    usedCards: orderedCards.map(card => card.id),
    debug: {
      commonTags: commonTagDisplays,
      subject: subjectName,
      parts,
      templateId,
    },
  } satisfies GeneratedStory;
}

const TECHNICAL_TAGS = new Set(['attack', 'media', 'zone']);
const MYTHIC_TAGS = new Set(['alien', 'ufo', 'ghost', 'cryptid', 'bigfoot', 'mothman', 'bat-boy', 'elvis']);

const normalizeTag = (tag: string): string => {
  return tag.trim().replace(/^#/u, '').toLowerCase();
};

const formatTagForDisplay = (tag: string): string => {
  return normalizeTag(tag).replace(/[-_]+/g, ' ');
};

const collectTagData = (articles: (CardArticle | null)[]) => {
  const perCard: string[][] = [];
  const display = new Map<string, string>();

  for (const article of articles) {
    const set = new Set<string>();
    for (const raw of article?.tags ?? []) {
      const normalized = normalizeTag(raw);
      if (!normalized || TECHNICAL_TAGS.has(normalized)) {
        continue;
      }
      set.add(normalized);
      if (!display.has(normalized)) {
        display.set(normalized, formatTagForDisplay(raw));
      }
    }
    perCard.push(Array.from(set));
  }

  let common = new Set<string>();
  if (perCard.length > 0) {
    common = new Set(perCard[0]);
    for (let index = 1; index < perCard.length; index += 1) {
      const current = new Set(perCard[index]);
      for (const tag of Array.from(common)) {
        if (!current.has(tag)) {
          common.delete(tag);
        }
      }
      if (common.size === 0) {
        break;
      }
    }
  }

  return {
    perCard,
    common: Array.from(common),
    display,
  } satisfies {
    perCard: string[][];
    common: string[];
    display: Map<string, string>;
  };
};

const resolveSubjectIndex = (played: PlayedCardMeta[], tagData: ReturnType<typeof collectTagData>): number => {
  if (played.length === 0) {
    return 0;
  }

  const names = played.map(card => card.name.toLowerCase());
  const commonMythic = tagData.common.filter(tag => MYTHIC_TAGS.has(tag));

  for (const mythicTag of commonMythic) {
    const normalized = mythicTag.replace(/[-_]+/g, ' ');
    const compact = normalized.replace(/\s+/g, '');
    for (let index = 0; index < names.length; index += 1) {
      const name = names[index];
      if (name.includes(normalized) || name.replace(/\s+/g, '').includes(compact)) {
        return index;
      }
    }
  }

  if (commonMythic.length > 0) {
    return 0;
  }

  let subjectIndex = 0;
  let bestScore = -1;

  for (let index = 0; index < played.length; index += 1) {
    const tags = tagData.perCard[index] ?? [];
    const score = tags.reduce((total, tag) => total + (MYTHIC_TAGS.has(tag) ? 1 : 0), 0);
    if (score > bestScore) {
      bestScore = score;
      subjectIndex = index;
    }
  }

  return subjectIndex;
};

const reorderBySubject = <T>(items: T[], subjectIndex: number): T[] => {
  if (!items.length) {
    return items;
  }
  const subject = items[subjectIndex];
  const rest = items.filter((_item, index) => index !== subjectIndex);
  return subject !== undefined ? [subject, ...rest] : [...items];
};

const hashString = (value: string): number => {
  let hash = 0;
  for (let index = 0; index < value.length; index += 1) {
    hash = Math.imul(31, hash) + value.charCodeAt(index);
    hash |= 0;
  }
  return hash >>> 0;
};

const createPicker = (seed: string) => {
  return <T>(arr: T[], seedKey: string): T => {
    if (!Array.isArray(arr) || arr.length === 0) {
      throw new Error('Cannot pick from an empty array');
    }
    const key = `${seed}:${seedKey}`;
    const index = hashString(key) % arr.length;
    return arr[index] as T;
  };
};

const buildSeed = (played: PlayedCardMeta[]): string => {
  const ids = played.map(card => card.id).sort();
  return ids.join('|') || 'no-cards';
};

const composeHeadline = (
  template: HeadlineTemplate | null,
  cards: PlayedCardMeta[],
  articles: (CardArticle | null)[],
  commonTags: string[],
  pick: <T>(arr: T[], seedKey: string) => T,
  tone: 'truth' | 'gov',
): { headline: string; templateId: string; parts: string[]; explicitSubhead?: string } => {
  if (!template) {
    const subjectName = (cards[0]?.name ?? 'Front Page').toUpperCase();
    const fallback = tone === 'truth' ? 'ALERTED' : 'STATUS REPORT';
    const headline = `${subjectName} ${fallback}`;
    return { headline, templateId: 'fallback:none', parts: [] };
  }

  try {
    const result = template.compose({ cards, articles, commonTags, pick });
    const parts = result.debugNote ? result.debugNote.split('|').filter(Boolean) : [];
    return {
      headline: result.headline.trim(),
      templateId: template.id,
      parts,
      explicitSubhead: result.subhead?.trim(),
    };
  } catch (error) {
    console.warn('Failed to compose headline via template', template.id, error);
    const subjectName = (cards[0]?.name ?? 'Front Page').toUpperCase();
    return { headline: `${subjectName} STATUS UPDATE`, templateId: `${template.id}:error`, parts: [] };
  }
};

const formatSubhead = (tone: 'truth' | 'gov', tags: string[]): string => {
  if (tone === 'truth') {
    const snippet = tags.slice(0, 2).filter(Boolean).map(tag => tag.toLowerCase()).join(', ');
    const tagPart = snippet ? ` (${snippet})` : '';
    return `Witnesses report escalating weirdness${tagPart}. Officials baffled.`;
  }
  return 'Transparency achieved via prudent opacity. Further questions will be taken later, retroactively.';
};
