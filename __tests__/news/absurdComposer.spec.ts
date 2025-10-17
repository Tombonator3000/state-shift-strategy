import { describe, expect, test } from 'bun:test';

import poolFixture from './fixtures/absurdPool.json';
import { composeCompositeStory, createComposerWithPool } from '../../src/systems/news/absurdComposer';

type FixtureArticle = (typeof poolFixture)['articles'][number];

const fixturePool: FixtureArticle[] = poolFixture.articles;

const composeWithFixture = createComposerWithPool(fixturePool);

describe('absurd composite composer', () => {
  test('prioritizes florida-man tags and reuses its image prompt', () => {
    const story = composeWithFixture(['TRUTH-A', 'TRUTH-B'], 'truth', 19);

    expect(story.tags[0]).toBe('florida-man');
    expect(story.tags).toContain('truth');
    expect(story.imagePrompt).toBe('retro newspaper illustration of florida man pirating swamp radio signals');
    expect(story.sources).toHaveLength(2);
  });

  test('threads faction connectors through copy', () => {
    const truthStory = composeWithFixture(['TRUTH-A'], 'truth', 88);
    const governmentStory = composeWithFixture(['GOV-A', 'GOV-B'], 'government', 88);

    expect(truthStory.headline).toMatch(/uncovers|broadcasts|amplifies|decrypts/);
    expect(governmentStory.headline).toMatch(/suppresses|redacts|obscures|counterspins/);
    expect(governmentStory.subhead).toMatch(/suppresses|redacts|obscures|counterspins/);
  });

  test('is deterministic for the same seed regardless of id order', () => {
    const a = composeWithFixture(['TRUTH-A', 'TRUTH-B'], 'truth', 1337);
    const b = composeWithFixture(['TRUTH-B', 'TRUTH-A'], 'truth', 1337);

    expect(b).toEqual(a);
  });

  test('falls back gracefully when no article ids are provided', () => {
    const fallback = composeWithFixture([], 'truth', 7);

    expect(fallback.tags).toEqual(['mystery']);
    expect(fallback.sources).toEqual([]);
    expect(fallback.imagePrompt).toBeUndefined();
    expect(fallback.byline).toBe('Composite Desk');
  });

  test('uses the full article pool when called through the default composer', () => {
    const story = composeCompositeStory(['TRUTH-001'], 'truth', 101);

    expect(story.byline).toBe('Composite Desk');
    expect(story.sources[0]?.id).toBe('TRUTH-001');
  });
});
