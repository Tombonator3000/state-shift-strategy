import { generateProceduralArticle } from '../proceduralArticleGenerator';
import type { Card } from '@/types';

const withFixedRandom = <T>(value: number, fn: () => T): T => {
  const originalRandom = Math.random;
  Math.random = () => value;
  try {
    return fn();
  } finally {
    Math.random = originalRandom;
  }
};

describe('generateProceduralArticle tags', () => {
  const baseCard: Card = {
    id: 'test-card',
    name: 'Signal Boost Protocol',
    type: 'MEDIA',
    faction: 'truth',
    cost: 3,
  };

  it('prioritizes normalized card tags when available', () => {
    const article = generateProceduralArticle({
      card: {
        ...baseCard,
        tags: ['  Signal   Boost  ', 'Contact   Protocol', 'Signal   Boost'],
      },
      player: 'human',
    });

    expect(article.tags.slice(0, 2)).toEqual(['#signal-boost', '#contact-protocol']);
    expect(article.tags).toEqual(
      expect.arrayContaining(['#signal-boost', '#contact-protocol', 'media', 'coverage'])
    );
  });

  it('falls back to base faction/type tags when metadata is missing', () => {
    const article = generateProceduralArticle({
      card: {
        ...baseCard,
        id: 'fallback-card',
        type: 'ATTACK',
        faction: 'government',
        tags: ['   ', '', ' \t '],
      },
      player: 'ai',
    });

    expect(article.tags).toEqual(expect.arrayContaining(['attack', 'scandal']));
    expect(article.tags.some(tag => tag.startsWith('#'))).toBe(false);
  });
});

describe('generateProceduralArticle thematic word banks', () => {
  const truthCard: Card = {
    id: 'cryptid-card',
    name: 'Midnight Trail Runners',
    type: 'SCHEME',
    faction: 'truth',
    cost: 2,
    tags: ['Cryptid Watch'],
  };

  const govCard: Card = {
    id: 'op-card',
    name: 'Operation Umbra Fold',
    type: 'OPERATION',
    faction: 'government',
    cost: 4,
    tags: ['Covert Operation'],
  };

  it('switches to cryptid-focused pools when cryptid metadata is present', () => {
    const article = withFixedRandom(0, () =>
      generateProceduralArticle({
        card: truthCard,
        player: 'human',
      })
    );

    expect(article.headline).toContain('TRACKS APPALACHIAN HOWLER');
    expect(article.body).toContain('APPALACHIAN HOWLER');
    expect(article.body).toContain('misty pine barrens watchtower');
  });

  it('leans on operation euphemisms for government suppression pieces', () => {
    const article = withFixedRandom(0, () =>
      generateProceduralArticle({
        card: govCard,
        player: 'ai',
      })
    );

    expect(article.headline).toContain('DECOMMISSIONS');
    expect(article.headline).toContain('strategic reclassification initiative');
    expect(article.body).toContain('binder swap conducted in the windowless logistics wing');
  });
});
