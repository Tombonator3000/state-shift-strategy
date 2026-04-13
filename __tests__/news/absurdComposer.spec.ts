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

  test('threads faction connectors through copy when articles lack content', () => {
    // When articles have real headlines/bodies, the composer prefers that
    // copy over template-generated text. To exercise the connector/template
    // fallback path we build stub articles with empty headlines and bodies.
    const stubPool: FixtureArticle[] = [
      {
        id: 'STUB-TRUTH-A',
        faction: 'truth',
        tags: ['florida-man', 'swamp', 'truth', 'broadcast'],
        headline: '',
        subhead: '',
        byline: '',
        body: '',
        imagePrompt: '',
      },
      {
        id: 'STUB-GOV-A',
        faction: 'government',
        tags: ['ufo', 'government', 'disinformation'],
        headline: '',
        subhead: '',
        byline: '',
        body: '',
        imagePrompt: '',
      },
      {
        id: 'STUB-GOV-B',
        faction: 'government',
        tags: ['ghost', 'government', 'containment'],
        headline: '',
        subhead: '',
        byline: '',
        body: '',
        imagePrompt: '',
      },
    ];
    const composeStub = createComposerWithPool(stubPool);

    const truthStory = composeStub(['STUB-TRUTH-A'], 'truth', 88);
    const governmentStory = composeStub(['STUB-GOV-A', 'STUB-GOV-B'], 'government', 88);

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
