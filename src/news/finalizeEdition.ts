import type { ArticleBlock } from './types';
import type { CompositeStory, ExtraExtraFeedEntry } from '@/types/news';

interface FinalizeEditionOptions {
  headlineLog?: CompositeStory[];
  bulletins?: ExtraExtraFeedEntry[];
}

const sanitize = (value: string | null | undefined): string => {
  return typeof value === 'string' ? value.trim() : '';
};

const ensureBullets = (article: ArticleBlock): string[] => {
  if (Array.isArray(article.bullets) && article.bullets.length > 0) {
    return [...article.bullets];
  }
  const fallback = sanitize(article.dek) || sanitize(article.hed);
  return fallback ? [fallback] : ['No summary available.'];
};

const normalizeCompositeArticle = (entry: CompositeStory, index: number): ArticleBlock => {
  const hed = sanitize(entry.headline) || 'Composite desk files encrypted brief.';
  const dek = sanitize(entry.subhead)
    || 'Turn log stitched from operative maneuvers and redacted dispatches.';
  const baseBody = entry.body.map(line => sanitize(line)).filter(Boolean);
  const sourceLines = entry.sources.map(source => sanitize(source.headline)).filter(Boolean);
  const bullets = ensureBullets({
    tone: entry.tone,
    hed,
    dek,
    bullets: baseBody.length ? baseBody.slice(0, 3) : sourceLines.slice(0, 3),
    byline: 'Composite Desk',
    source: 'Composite Desk Archives',
  });

  const kickerTags = entry.tags.length ? entry.tags.join(' • ') : `Composite File ${index + 1}`;

  return {
    tone: entry.tone,
    hed,
    dek,
    bullets,
    byline: 'By: Composite Desk',
    source: 'Source: Composite Story Engine',
    kicker: kickerTags,
    body: baseBody.length ? baseBody : undefined,
  } satisfies ArticleBlock;
};

const normalizeBulletin = (entry: ExtraExtraFeedEntry, index: number): ArticleBlock | null => {
  if (entry.kind === 'composite') {
    return normalizeCompositeArticle(entry.data, index);
  }

  const article = entry.data;
  return {
    ...article,
    hed: sanitize(article.hed) || 'Headline withheld for operational security.',
    dek:
      sanitize(article.dek)
      || 'Field operatives report classified developments behind the curtain.',
    bullets: ensureBullets(article),
    byline: sanitize(article.byline) || 'By: Extra Extra Desk',
    source: sanitize(article.source) || 'Source: Field Operatives',
    kicker: sanitize(article.kicker) || 'Extra Extra Bulletin',
    body: Array.isArray(article.body) ? [...article.body] : article.body,
  } satisfies ArticleBlock;
};

export const finalizeEdition = ({
  headlineLog = [],
  bulletins = [],
}: FinalizeEditionOptions): ArticleBlock[] => {
  const compositeEntries = headlineLog.map((entry, index) => {
    const article = normalizeCompositeArticle(entry, index);
    const tagScore = entry.tags.length * 10;
    const score = 2000 + tagScore - index;
    const timestamp = index / 100;
    return { article, score, timestamp };
  });

  const bulletinEntries = bulletins
    .map((entry, index) => {
      if (entry.kind !== 'article' && entry.kind !== 'bulletin') {
        return null;
      }
      const normalized = normalizeBulletin(entry, index);
      if (!normalized) {
        return null;
      }
      const score = 1000 + index;
      const timestamp = 1_000_000 + index;
      return { article: normalized, score, timestamp };
    })
    .filter((value): value is { article: ArticleBlock; score: number; timestamp: number } => Boolean(value));

  const combined = [...bulletinEntries, ...compositeEntries]
    .sort((a, b) => {
      if (b.score !== a.score) {
        return b.score - a.score;
      }
      return b.timestamp - a.timestamp;
    });

  const deduped: ArticleBlock[] = [];
  const seen = new Set<string>();
  for (const entry of combined) {
    const { article } = entry;
    const key = `${article.hed}::${article.dek ?? ''}`;
    if (seen.has(key)) {
      continue;
    }
    seen.add(key);
    deduped.push(article);
  }

  return deduped;
};

export type { FinalizeEditionOptions };
