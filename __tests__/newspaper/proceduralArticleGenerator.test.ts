import { afterEach, describe, expect, it } from 'bun:test';
import { generateProceduralArticle } from '@/engine/newspaper/proceduralArticleGenerator';
import type { Card } from '@/types';

const originalRandom = Math.random;

const useSeededRandom = (seed: number) => {
  let value = seed;
  Math.random = () => {
    value = (value * 48271) % 2147483647;
    return value / 2147483647;
  };
};

const restoreRandom = () => {
  Math.random = originalRandom;
};

afterEach(() => {
  restoreRandom();
});

const createCard = (overrides: Partial<Card> = {}): Card => ({
  id: 'test-card',
  name: 'Chrono Gator Broadcast',
  type: 'MEDIA',
  faction: 'truth',
  rarity: 'common',
  cost: 2,
  tags: ['chrononaut-leak', 'truthline'],
  ...overrides,
});

const trimTokenEdges = (value: string): string => {
  const removable = new Set(["'", '"', '`', '>', '•', '-', '[', ']', '(', ')']);
  let result = value.trim();

  while (result.length > 0 && (removable.has(result[0]) || result[0] === ' ')) {
    result = result.slice(1).trimStart();
  }

  while (result.length > 0 && (removable.has(result[result.length - 1]) || result.endsWith(' '))) {
    result = result.slice(0, -1).trimEnd();
  }

  return result.toLowerCase();
};

const normalizeTokens = (body: string): string[] => {
  const tokens: string[] = [];

  for (const paragraph of body.split('\n\n')) {
    const sentenceMatches = paragraph.match(/[^.!?\n]+[.!?]/g);
    if (sentenceMatches && sentenceMatches.length > 0) {
      for (const match of sentenceMatches) {
        tokens.push(match);
      }
      const trailing = paragraph.replace(/[^.!?\n]+[.!?]/g, '').trim();
      if (trailing) {
        tokens.push(...trailing.split('\n'));
      }
    } else {
      tokens.push(...paragraph.split('\n'));
    }
  }

  return tokens.map(trimTokenEdges).filter(Boolean);
};

describe('proceduralArticleGenerator body assembly', () => {
  it('creates a truth body with embellishments and no duplicate sentences', () => {
    useSeededRandom(3);

    const article = generateProceduralArticle({
      card: createCard(),
      player: 'human',
      targetState: 'Florida Panhandle',
      truthDelta: 4,
      gameState: { truth: 68, turn: 5, controlledStates: ['Florida', 'Georgia'] },
    });

    expect(article.body.includes('Rumor Mill Pings:')).toBe(true);
    expect(article.body.includes('[FOOTNOTE')).toBe(true);

    const paragraphs = article.body.split('\n\n');
    expect(paragraphs.length).toBeGreaterThanOrEqual(6);

    const tokens = normalizeTokens(article.body);
    expect(new Set(tokens).size).toBe(tokens.length);
  });

  it('creates a government body with authorized clarifications and optional flavor', () => {
    useSeededRandom(12);

    const article = generateProceduralArticle({
      card: createCard({ faction: 'government', name: 'Containment Audit 47-B' }),
      player: 'ai',
      targetState: 'Gulf Coast',
      truthDelta: -2,
      gameState: { truth: 42, turn: 8, controlledStates: ['Alabama'] },
    });

    expect(article.body.includes('Authorized Clarifications:')).toBe(true);
    expect(article.body.includes('[AUTHORIZED FOOTNOTE')).toBe(true);

    const tokens = normalizeTokens(article.body);
    expect(new Set(tokens).size).toBe(tokens.length);
  });

  it('omits embellishments when random threshold is not met', () => {
    Math.random = () => 0.99;

    const article = generateProceduralArticle({
      card: createCard(),
      player: 'human',
      targetState: 'Everglades District',
      truthDelta: 1,
      gameState: { truth: 55, turn: 3 },
    });

    expect(article.body.includes('Rumor Mill Pings:')).toBe(false);
    expect(article.body.includes('[REDACTED ASIDE')).toBe(false);

    const paragraphs = article.body.split('\n\n');
    expect(paragraphs.length).toBeGreaterThanOrEqual(5);

    const tokens = normalizeTokens(article.body);
    expect(new Set(tokens).size).toBe(tokens.length);
  });
});
