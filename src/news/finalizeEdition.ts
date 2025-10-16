import type { ArticleBlock, TurnComposite } from './types';

interface FinalizeEditionOptions {
  headlineLog?: TurnComposite[];
  bulletins?: ArticleBlock[];
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

const normalizeCompositeArticle = (entry: TurnComposite): ArticleBlock | null => {
  if (!entry.main) {
    return null;
  }

  const base = entry.main;
  return {
    ...base,
    tone: base.tone ?? entry.tone,
    hed: sanitize(base.hed) || 'Composite desk files encrypted brief.',
    dek:
      sanitize(base.dek)
      || 'Turn log stitched from operative maneuvers and redacted dispatches.',
    bullets: ensureBullets(base),
    byline: sanitize(base.byline) || 'By: Composite Desk',
    source: sanitize(base.source) || 'Source: Composite Turn Desk',
    kicker: sanitize(base.kicker) || `Turn ${entry.turn} Dispatch`,
    body: Array.isArray(base.body) ? [...base.body] : base.body,
  } satisfies ArticleBlock;
};

const normalizeBulletin = (article: ArticleBlock): ArticleBlock => ({
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
});

export const finalizeEdition = ({
  headlineLog = [],
  bulletins = [],
}: FinalizeEditionOptions): ArticleBlock[] => {
  const compositeEntries = headlineLog
    .map((entry, index) => {
      const article = normalizeCompositeArticle(entry);
      if (!article) {
        return null;
      }
      const metricScore = entry.metrics?.total ?? 0;
      const score = Math.round(metricScore * 100) + entry.round * 10 + entry.turn;
      const timestamp = entry.round * 1000 + entry.turn + index / 100;
      return { article, score, timestamp };
    })
    .filter((value): value is { article: ArticleBlock; score: number; timestamp: number } => Boolean(value));

  const bulletinEntries = bulletins.map((article, index) => {
    const normalized = normalizeBulletin(article);
    const score = 1000 + index;
    const timestamp = 1_000_000 + index;
    return { article: normalized, score, timestamp };
  });

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
