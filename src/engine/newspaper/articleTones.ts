import type { CardArticle } from '@/engine/news/articleBank';

export const ARTICLE_TONES = [
  'STRAIGHT_NEWS',
  'TABLOID_SENSATIONAL',
  'LOCAL_COLOR',
  'HARD_HITTING_EXPOSE',
  'CLASSIFIED_REDACTED',
] as const;

export type ArticleTone = (typeof ARTICLE_TONES)[number];

export interface ToneTransform {
  headlineTransform: (headline: string) => string;
  bylineTransform: (byline: string) => string;
  bodyTransform: (body: string) => string;
}

const PLACEHOLDER_PATTERN = /{[^}]+}/g;
const PLACEHOLDER_TOKEN_PATTERN = /⟦\d+⟧/g;
const PLACEHOLDER_TOKEN = (index: number): string => `⟦${index}⟧`;

const protectPlaceholders = (value: string, transform: (input: string) => string): string => {
  if (!value) {
    return value;
  }

  const matches = Array.from(value.matchAll(PLACEHOLDER_PATTERN));
  if (!matches.length) {
    return transform(value);
  }

  let working = value;
  matches.forEach((match, index) => {
    working = working.replace(match[0], PLACEHOLDER_TOKEN(index));
  });

  let transformed = transform(working);

  matches.forEach((match, index) => {
    transformed = transformed.replace(PLACEHOLDER_TOKEN(index), match[0]);
  });

  return transformed;
};

const toSentenceCase = (value: string): string => {
  if (!value) {
    return value;
  }

  const lower = value.toLowerCase();
  return lower.charAt(0).toUpperCase() + lower.slice(1);
};

const ensureLocalColorCloser = (body: string): string => {
  const note = 'Local residents declined to comment.';
  if (!body.trim()) {
    return body;
  }
  if (body.trim().endsWith(note)) {
    return body;
  }
  return `${body}\n\n${note}`;
};

const redactEveryOtherSentence = (body: string): string => {
  if (!body.trim()) {
    return body;
  }
  const sentences = body.split(/(?<=\.)\s+/);
  if (!sentences.length) {
    return body;
  }
  return sentences
    .map((sentence, index) => {
      if (index % 2 === 0) {
        return sentence.trim().endsWith('.') ? sentence.trim() : `${sentence.trim()}.`;
      }
      const tokens = sentence.match(PLACEHOLDER_TOKEN_PATTERN) ?? [];
      return tokens.length ? `█████████████ ${tokens.join(' ')}` : '█████████████';
    })
    .join(' ');
};

const replaceOfficials = (body: string): string => {
  return body
    .replace(/officials/gi, 'sources familiar with the matter')
    .replace(/said/gi, 'allegedly stated');
};

export const TONE_TRANSFORMS: Record<ArticleTone, ToneTransform> = {
  STRAIGHT_NEWS: {
    headlineTransform: headline => protectPlaceholders(headline, toSentenceCase),
    bylineTransform: byline => byline,
    bodyTransform: body => body,
  },

  TABLOID_SENSATIONAL: {
    headlineTransform: headline =>
      protectPlaceholders(headline, value => {
        const emphatic = value.toUpperCase();
        return emphatic.endsWith('!!!') ? emphatic : `${emphatic}!!!`;
      }),
    bylineTransform: byline => protectPlaceholders(byline, value => value.replace(/^By\b/i, 'BREAKING:')),
    bodyTransform: body => protectPlaceholders(body, value => value.replace(/\./g, '!')),
  },

  LOCAL_COLOR: {
    headlineTransform: headline => headline,
    bylineTransform: byline => protectPlaceholders(byline, value => value.replace(/Correspondent/gi, 'Staff Writer')),
    bodyTransform: body => protectPlaceholders(body, ensureLocalColorCloser),
  },

  HARD_HITTING_EXPOSE: {
    headlineTransform: headline => headline,
    bylineTransform: () => 'By Anonymous Insider',
    bodyTransform: body => protectPlaceholders(body, replaceOfficials),
  },

  CLASSIFIED_REDACTED: {
    headlineTransform: headline =>
      protectPlaceholders(headline, value =>
        value
          .split(' ')
          .map((word, index) => (index % 3 === 0 ? '█████' : word))
          .join(' '),
      ),
    bylineTransform: () => 'By [REDACTED]',
    bodyTransform: body => protectPlaceholders(body, redactEveryOtherSentence),
  },
};

export function applyTone(article: CardArticle, tone: ArticleTone): CardArticle {
  const transform = TONE_TRANSFORMS[tone];

  const headline = typeof article.headline === 'string'
    ? transform.headlineTransform(article.headline)
    : article.headline;

  const byline = typeof article.byline === 'string'
    ? transform.bylineTransform(article.byline)
    : article.byline;

  const body = typeof article.body === 'string'
    ? transform.bodyTransform(article.body)
    : article.body;

  return {
    ...article,
    headline,
    byline,
    body,
  } satisfies CardArticle;
}
