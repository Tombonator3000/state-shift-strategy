import { describe, expect, test } from 'bun:test';

import { generateMainStory } from '../mainStory';
import type { ArticleBank, CardArticle } from '../articleBank';
import type { StoryCardLike } from '../templates';

const createArticle = (overrides: Partial<CardArticle> = {}): CardArticle => ({
  id: overrides.id ?? 'card-alpha',
  tone: overrides.tone ?? 'truth',
  tags: overrides.tags ?? ['#Signal'],
  headline: overrides.headline ?? 'ALPHA DISCOVERY CONFIRMED',
  subhead: overrides.subhead ?? 'Operatives race to verify leaked intel.',
  byline: overrides.byline ?? 'By: Field Unit 27-B/6',
  body: overrides.body ?? 'Agents report unusual spikes across the grid.',
  imagePrompt: overrides.imagePrompt,
});

const createBank = (articles: CardArticle[]): ArticleBank => ({
  articles,
  byId: new Map(articles.map(article => [article.id, article])),
});

const createCard = (overrides: Partial<StoryCardLike> & Pick<StoryCardLike, 'id'>): StoryCardLike => ({
  id: overrides.id,
  name: overrides.name ?? overrides.id,
  faction: overrides.faction ?? 'truth',
  tags: overrides.tags ?? [],
});

describe('generateMainStory', () => {
  test('normalizes tone based on faction input', () => {
    const truthCard = createCard({ id: 'truth-1', faction: 'Truth Coalition' });
    const truthArticle = createArticle({ id: 'truth-1' });
    const truthResult = generateMainStory({ bank: createBank([truthArticle]), cards: [truthCard], activeFaction: 'Truth Coalition' });

    expect(truthResult.article.tone).toBe('truth');
    expect(truthResult.debug.fallback).toBe(false);

    const govCard = createCard({ id: 'gov-1', faction: 'GOV OPS' });
    const govArticle = createArticle({ id: 'gov-1', tone: 'government', headline: 'DIRECTORATE RETAINS CONTROL' });
    const govResult = generateMainStory({ bank: createBank([govArticle]), cards: [govCard], activeFaction: 'Gov Directorate' });

    expect(govResult.article.tone).toBe('government');
    expect(govResult.debug.fallback).toBe(false);
  });

  test('surfaces shared tags across cards in fallback stories', () => {
    const cards = [
      createCard({ id: 'alpha', name: 'Alpha Agent', tags: ['Mystery Signal', '#Network'] }),
      createCard({ id: 'beta', name: 'Beta Analyst', tags: ['mystery signal', 'Countermeasure'] }),
    ];

    const result = generateMainStory({ bank: createBank([]), cards, activeFaction: 'Truth' });

    expect(result.debug.fallback).toBe(true);
    expect(result.debug.commonTags).toContain('#MysterySignal');
    expect(result.article.tags).toContain('#MysterySignal');
  });

  test('builds a mythic fallback article when no cards provide headlines', () => {
    const result = generateMainStory({ bank: createBank([]), cards: [], activeFaction: undefined });

    expect(result.debug.fallback).toBe(true);
    expect(result.debug.templateId).not.toBeNull();
    expect(result.article.id).toMatch(/^generated-truth-/);
    expect(result.article.headline).toBe(result.article.headline.toUpperCase());
  });

  test('produces deterministic output for identical inputs', () => {
    const cards = [
      createCard({ id: 'alpha', faction: 'truth', tags: ['Signal'] }),
      createCard({ id: 'beta', faction: 'truth', tags: ['Counter'] }),
    ];
    const articles = [createArticle({ id: 'alpha', headline: 'ALPHA FIELD REPORT' })];
    const bank = createBank(articles);

    const first = generateMainStory({ bank, cards, activeFaction: 'truth' });
    const second = generateMainStory({ bank, cards, activeFaction: 'truth' });

    expect(second).toEqual(first);
  });

  test('falls back when referenced card articles are missing', () => {
    const cards = [createCard({ id: 'missing', faction: 'gov force', tags: ['Containment'] })];

    const result = generateMainStory({ bank: createBank([]), cards, activeFaction: 'gov force' });

    expect(result.debug.fallback).toBe(true);
    expect(result.article.tone).toBe('government');
    expect(result.article.tags).toEqual(expect.arrayContaining(['#NarrativeContainment', '#OfficialChannel']));
    expect(result.article.byline).toMatch(/By:/);
  });
});
