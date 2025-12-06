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

    // Should contain embellishments (rumor mill, footnotes, or redacted asides)
    const hasEmbellishment = article.body.includes('Rumor Mill Pings:') ||
                             article.body.includes('[FOOTNOTE') ||
                             article.body.includes('[REDACTED ASIDE');
    expect(hasEmbellishment).toBe(true);

    const paragraphs = article.body.split('\n\n');
    expect(paragraphs.length).toBeGreaterThanOrEqual(4);

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

    // Should contain gov-style embellishments (clarifications, footnotes, or addendums)
    const hasGovEmbellishment = article.body.includes('Authorized Clarifications:') ||
                                article.body.includes('[AUTHORIZED FOOTNOTE') ||
                                article.body.includes('[REDACTED ADDENDUM');
    expect(hasGovEmbellishment).toBe(true);

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

describe('proceduralArticleGenerator contextual hooks', () => {
  it('threads turn, delta, and territory info through truth faction articles', () => {
    useSeededRandom(17);

    const article = generateProceduralArticle({
      card: createCard({ name: 'Ohio Frequency Breach' }),
      player: 'human',
      targetState: 'Ohio',
      truthDelta: 3,
      gameState: { truth: 71, turn: 5, controlledStates: ['Ohio', 'Pennsylvania', 'Michigan'] },
    });

    expect(article.headline).toContain('TRUTH INDEX +3');
    expect(article.headline).toContain('OHIO');
    expect(article.headline).toContain('TURN 5');
    // Body should reference turn and territory in some form
    expect(article.body.toLowerCase()).toMatch(/turn 5/);
    // Check that state/territory info is included in body
    const bodyLower = article.body.toLowerCase();
    const hasStateReference = bodyLower.includes('ohio') ||
                              bodyLower.includes('cells') ||
                              bodyLower.includes('territory') ||
                              bodyLower.includes('controlled');
    expect(hasStateReference).toBe(true);
    expect(article.tags).toEqual(
      expect.arrayContaining(['#state-ohio', '#turn-5', '#truth-surge-3', '#cell-ohio']),
    );
  });

  it('announces calm metrics and jurisdictions for government rebuttals', () => {
    useSeededRandom(22);

    const article = generateProceduralArticle({
      card: createCard({ faction: 'government', name: 'Containment Audit 47-B' }),
      player: 'ai',
      targetState: 'Ohio',
      truthDelta: -2,
      gameState: { truth: 45, turn: 8, controlledStates: ['Ohio', 'Indiana'] },
    });

    expect(article.headline).toContain('CALM INDEX -2');
    expect(article.headline).toContain('OHIO');
    expect(article.headline).toContain('TURN 8');
    expect(article.subhead.toLowerCase()).toContain('turn 8');
    // Body should reference turn and jurisdiction in some form
    expect(article.body.toLowerCase()).toMatch(/turn 8/);
    const bodyLower = article.body.toLowerCase();
    const hasJurisdictionReference = bodyLower.includes('ohio') ||
                                     bodyLower.includes('indiana') ||
                                     bodyLower.includes('coverage') ||
                                     bodyLower.includes('jurisdiction');
    expect(hasJurisdictionReference).toBe(true);
    expect(article.tags).toEqual(
      expect.arrayContaining(['#state-ohio', '#turn-8', '#truth-dip-2', '#cell-ohio']),
    );
  });
});
