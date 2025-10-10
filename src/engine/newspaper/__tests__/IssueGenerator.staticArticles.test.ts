import { describe, expect, it, mock } from 'bun:test';

import type { NewspaperData } from '@/lib/newspaperData';
import type { Card } from '@/types';

const minimalDataset: NewspaperData = {
  mastheads: ['The Paranoid Times'],
  ads: ['Classified ads temporarily unavailable.'],
  subheads: {
    generic: ['Officials refuse to comment.'],
    attack: ['Officials refuse to comment.'],
    media: ['Officials refuse to comment.'],
    zone: ['Officials refuse to comment.'],
  },
  bylines: ['By: Anonymous Insider'],
  sources: ['Source: Redacted'],
  conspiracyCorner: ['All rumors currently sealed in vault storage.'],
  weather: ['Forecast withheld pending clearance.'],
  attackVerbs: ['EXPOSED'],
  mediaVerbs: ['GOES VIRAL'],
  zoneVerbs: ['SURGE'],
  stamps: {
    breaking: ['BREAKING'],
    classified: ['CLASSIFIED'],
  },
};

const placeholderBankArticle = {
  id: 'TRUTH-NEW-017',
  faction: 'truth' as const,
  tags: ['media'],
  headline: 'CARD LOGS PLACEHOLDER ENTRY',
  subhead: 'Wordsalad filler remains in circulation.',
  byline: 'By Placeholder Desk',
  body: 'Generic lorem ipsum copy.',
  imagePrompt: 'Dull stock image of filing cabinet',
  statesMentioned: ['Oklahoma'],
  recurringCharacter: null,
  followUpHooks: [],
  articleVariant: null,
  preferredTone: null,
};

mock.module('@/engine/newspaper/CardLexicon', () => ({
  loadCardLexicon: async () => ({
    'TRUTH-SUPPORT-001': {
      id: 'TRUTH-SUPPORT-001',
      name: 'Signal Flare Warmup',
      type: 'MEDIA',
      faction: 'truth',
      rarity: 'common',
      cost: 2,
      setId: 'truth-expansion',
      setName: 'Truth Expansion',
      baseTags: ['media'],
      gagTags: ['#prep'],
      artHint: 'Field operatives testing broadcast rigs.',
      effects: { truthDelta: 5, ipOpponent: null, pressureDelta: null },
    },
    'TRUTH-NEW-017': {
      id: 'TRUTH-NEW-017',
      name: 'Implant Removal Surgery',
      type: 'MEDIA',
      faction: 'truth',
      rarity: 'rare',
      cost: 5,
      setId: 'truth-expansion',
      setName: 'Truth Expansion',
      baseTags: ['media'],
      gagTags: ['#whisper'],
      artHint: 'Pastor Rex sermon duel mid-air.',
      effects: { truthDelta: 3, ipOpponent: null, pressureDelta: null },
    },
  }),
}));

mock.module('@/engine/news/articleBank', () => ({
  loadArticleBank: async () => ({
    getById: () => placeholderBankArticle,
    hasArticles: () => true,
  }),
}));

const loadGenerator = () => import('../IssueGenerator');

describe('generateIssue static article preference', () => {
  it('prefers curated static articles over placeholder bank entries', async () => {
    const { generateIssue } = await loadGenerator();

    const setupCard: Card = {
      id: 'TRUTH-SUPPORT-001',
      name: 'Signal Flare Warmup',
      type: 'MEDIA',
      faction: 'truth',
      rarity: 'common',
      cost: 2,
      text: 'Calibration broadcast primes the feed.',
      tags: ['media', 'truth'],
    } as Card;

    const card: Card = {
      id: 'TRUTH-NEW-017',
      name: 'Implant Removal Surgery',
      type: 'MEDIA',
      faction: 'truth',
      rarity: 'rare',
      cost: 5,
      text: 'Truth surge tied to whispered implants.',
      tags: ['media', 'truth'],
    } as Card;

    const issue = await generateIssue({
      dataset: minimalDataset,
      playedCards: [
        {
          card: setupCard,
          player: 'human',
          truthDelta: 5,
          targetState: 'NM',
          capturedStates: ['NM'],
        },
        {
          card,
          player: 'human',
          truthDelta: 3,
          targetState: 'OK',
          capturedStates: [],
        },
      ],
    });

    const article = issue.generatedStory.articles.find(entry => entry.cardId === card.id);

    expect(article).toBeDefined();
    if (!article) {
      return;
    }

    expect(article.articleId).toBe('TRUTH-NEW-017');
    expect(article.headline).toContain('TORNADO CHASERS');
    expect(article.byline).toContain('Caleb Monroe, Boundary Layer Bureau');
    expect(article.body.join(' ')).toContain('midair sermon');
    expect(article.body.join(' ')).not.toContain('Generic lorem ipsum copy');
  });
});
