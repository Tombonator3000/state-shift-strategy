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

const stagedPlaceholderArticle = {
  id: 'TRUTH-NEW-017',
  faction: 'truth' as const,
  tags: ['media'],
  headline: 'PASTOR REX HOSTS QUIET CLINIC',
  subhead: 'Stage-zero placeholder remains intentionally bland.',
  byline: 'By Paranoid Times Placeholder Desk',
  body: 'An empty clinic visit with no levitating tent in sight.',
  imagePrompt: 'Minimal newsprint filler art',
  statesMentioned: ['Oklahoma'],
  recurringCharacter: 'Pastor Rex',
  followUpHooks: [],
  articleVariant: 'pastor_rex_stage_0',
  preferredTone: null,
};

mock.module('@/engine/newspaper/CardLexicon', () => ({
  loadCardLexicon: async () => ({
    'TRUTH-NEW-017': {
      id: 'TRUTH-NEW-017',
      name: 'Implant Removal Surgery',
      type: 'MEDIA',
      faction: 'truth',
      rarity: 'rare',
      cost: 5,
      setId: 'truth-expansion',
      setName: 'Truth Expansion',
      baseTags: ['#implant'],
      gagTags: ['#LeakSeason'],
      artHint: 'Surgical theater awash in tabloid spotlights.',
      effects: { truthDelta: 3, ipOpponent: null, pressureDelta: null },
    },
  }),
}));

mock.module('@/news/articleBank', () => {
  const bank = new Map([[stagedPlaceholderArticle.id, stagedPlaceholderArticle]]);
  return {
    loadArticleBank: async () => bank,
    getArticleById: (id: string) => bank.get(id) ?? null,
  };
});

const loadGenerator = () => import('../IssueGenerator');

describe('generateIssue recurring character integration', () => {
  it('upgrades articles using stored recurring character stage data', async () => {
    const { generateIssue } = await loadGenerator();

    const supportCard: Card = {
      id: 'TRUTH-001',
      name: 'Blurry Bigfoot Photo Goes Viral',
      type: 'MEDIA',
      faction: 'truth',
      rarity: 'common',
      cost: 3,
      text: 'A trusty truth opener.',
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
      tags: ['media', 'truth', 'implant'],
    } as Card;

    const issue = await generateIssue({
      dataset: minimalDataset,
      playedCards: [
        {
          card: supportCard,
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
      gameState: {
        recurringCharacters: {
          pastor_rex: {
            appearances: 5,
            currentStage: 2,
            lastArticleVariant: 'pastor_rex_stage_2',
          },
        },
      },
    });

    expect(issue.generatedStory.articles.length).toBeGreaterThanOrEqual(1);
    const article = issue.generatedStory.articles.find(entry => entry.cardId === 'TRUTH-NEW-017');

    expect(article).toBeDefined();
    if (!article) {
      return;
    }

    expect(article.articleId).toBe('TRUTH-NEW-017');
    expect(article.body.join(' ')).toContain('midair sermon');
    expect(article.body.join(' ')).not.toContain('empty clinic visit');
  });
});
