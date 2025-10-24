import { generateProceduralArticle } from '../proceduralArticleGenerator';
import type { Card } from '@/types';

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
