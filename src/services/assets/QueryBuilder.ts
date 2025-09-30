import type { AssetContext, QueryPlan } from './types';

const STOP_WORDS = new Set(['the', 'a', 'an', 'of', 'and', 'or']);

function tokenize(text: string): string[] {
  return text
    .split(/[^a-z0-9]+/i)
    .map(token => token.trim())
    .filter(token => token.length > 1 && !STOP_WORDS.has(token.toLowerCase()));
}

export function buildQuery(context: AssetContext): QueryPlan {
  const terms = new Set<string>();
  const includeTags = new Set<string>();
  const excludeTerms = new Set<string>(['logo', 'watermark']);
  let licensePreference: QueryPlan['licensePreference'] = 'cc';

  if (context.card) {
    tokenize(context.card.name).forEach(term => terms.add(term));
    if (context.card.faction) {
      terms.add(`${context.card.faction} faction`);
    }
    if (context.card.type) {
      terms.add(`${context.card.type.toLowerCase()} card art`);
    }
    (context.card.artTags ?? []).forEach(tag => includeTags.add(tag));
    if (context.card.artPolicy === 'manual') {
      licensePreference = 'any';
    }
  }

  if (context.event) {
    tokenize(context.event.title).forEach(term => terms.add(term));
    tokenize(context.event.headline ?? '').forEach(term => terms.add(term));
    (context.event.tags ?? []).forEach(tag => includeTags.add(tag));
    licensePreference = 'public-domain';
  }

  if (context.article) {
    tokenize(context.article.title).forEach(term => terms.add(term));
    tokenize(context.article.headline).forEach(term => terms.add(term));
    (context.article.tags ?? []).forEach(tag => includeTags.add(tag));
  }

  (context.tags ?? []).forEach(tag => includeTags.add(tag));

  const cleanedTerms = Array.from(terms).slice(0, 12);
  const cleanedTags = Array.from(includeTags).slice(0, 8);

  return {
    terms: cleanedTerms,
    includeTags: cleanedTags,
    excludeTerms: Array.from(excludeTerms),
    licensePreference,
  };
}
