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

    // Should have a truth-faction headline style
    expect(article.headline.toUpperCase()).toContain('MIDNIGHT TRAIL RUNNERS');
    // Body should contain tabloid-style content
    expect(article.body.length).toBeGreaterThan(100);
    expect(article.byline.startsWith('By:')).toBe(true);
  });

  it('leans on operation euphemisms for government suppression pieces', () => {
    const article = withFixedRandom(0, () =>
      generateProceduralArticle({
        card: govCard,
        player: 'ai',
      })
    );

    // Should have a gov-faction headline style
    expect(article.headline.toUpperCase()).toContain('OPERATION UMBRA FOLD');
    // Should contain government-style euphemisms somewhere
    const contentLower = (article.headline + article.body).toLowerCase();
    const hasGovSpeak = contentLower.includes('routine') ||
                        contentLower.includes('classified') ||
                        contentLower.includes('normal') ||
                        contentLower.includes('initiative') ||
                        contentLower.includes('protocol');
    expect(hasGovSpeak).toBe(true);
  });
});

describe('generateProceduralArticle article structure', () => {
  it('builds a moon-hoax truth spread with tabloid flourishes', () => {
    const article = withFixedRandom(0, () =>
      generateProceduralArticle({
        card: {
          id: 'moon-card',
          name: 'Apollo Leak Broadcast',
          type: 'MEDIA',
          faction: 'truth',
          cost: 3,
          tags: ['Moon Landing Hoax'],
        },
        player: 'human',
      })
    );

    // Verify article structure
    expect(article.headline.toUpperCase()).toContain('APOLLO LEAK BROADCAST');
    expect(article.body.length).toBeGreaterThan(200);
    expect(article.byline.startsWith('By:')).toBe(true);
    expect(article.imagePrompt).toBeTruthy();
    expect(article.subhead.length).toBeGreaterThan(10);
    expect(Array.isArray(article.tags)).toBe(true);
    expect(article.tags).toContain('#moon-landing-hoax');
  });

  it('renders a psychic hotline denial drenched in bureaucracy', () => {
    const article = withFixedRandom(0, () =>
      generateProceduralArticle({
        card: {
          id: 'psychic-gov-card',
          name: 'Psychic Hotline Compliance Blitz',
          type: 'OPERATION',
          faction: 'government',
          cost: 5,
          tags: ['Psychic Hotline'],
        },
        player: 'ai',
      })
    );

    // Verify article structure for government faction
    expect(article.headline.toUpperCase()).toContain('PSYCHIC HOTLINE COMPLIANCE BLITZ');
    expect(article.body.length).toBeGreaterThan(200);
    expect(article.byline.startsWith('By:')).toBe(true);
    expect(article.imagePrompt).toBeTruthy();
    expect(article.subhead.length).toBeGreaterThan(10);
    expect(Array.isArray(article.tags)).toBe(true);
    expect(article.tags).toContain('#psychic-hotline');
  });
});
