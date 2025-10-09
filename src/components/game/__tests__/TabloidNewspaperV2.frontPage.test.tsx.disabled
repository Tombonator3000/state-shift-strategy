import { afterAll, afterEach, beforeAll, beforeEach, describe, expect, mock, test } from 'bun:test';
import { Window } from 'happy-dom';

import type { NarrativeArticle, NarrativeIssue } from '@/engine/newspaper/IssueGenerator';
import type { PlayedCardMeta } from '@/engine/news/mainStory';
import type { TabloidNewspaperProps } from '../TabloidNewspaperLegacy';

const windowRef = new Window();

const matchMediaStub = () => ({
  matches: false,
  addEventListener: () => {},
  removeEventListener: () => {},
});

if (!('matchMedia' in windowRef)) {
  (windowRef as unknown as { matchMedia: typeof matchMediaStub }).matchMedia = matchMediaStub;
}

globalThis.window = windowRef as unknown as typeof globalThis.window;
globalThis.document = windowRef.document as unknown as Document;
globalThis.navigator = windowRef.navigator as Navigator;
globalThis.HTMLElement = windowRef.HTMLElement as unknown as typeof globalThis.HTMLElement;
globalThis.CustomEvent = windowRef.CustomEvent as unknown as typeof globalThis.CustomEvent;

const { render, screen, cleanup } = await import('@testing-library/react');

mock.module('@/lib/newspaperData', () => ({
  loadNewspaperData: async () => ({
    mastheads: ['The Paranoid Times'],
    ads: [],
    subheads: { generic: ['Officials refuse comment.'] },
    bylines: ['By: Field Desk'],
    sources: ['Source: Anonymous Courier'],
    conspiracyCorner: [],
    weather: ['Cloud cover classified.'],
    attackVerbs: [],
    mediaVerbs: [],
    zoneVerbs: [],
    stamps: { breaking: [], classified: [] },
  }),
  pick: <T,>(options: T[] | undefined, fallback: T): T => {
    if (Array.isArray(options) && options.length) {
      return options[0]!;
    }
    return fallback;
  },
  shuffle: <T,>(values: T[]): T[] => [...values],
}));

const articleFixtures = [
  {
    cardId: 'card-1',
    cardName: 'Alpha Agent',
    cardType: 'ATTACK',
    player: 'human' as const,
    articleId: 'story-1',
    headline: 'Hero Entry Overrides Prime Time',
    subhead: 'Lead operatives breach the signal vault.',
    body: 'Field team confirmed the breach before dawn.',
  },
  {
    cardId: 'card-2',
    cardName: 'Beta Analyst',
    cardType: 'MEDIA',
    player: 'human' as const,
    articleId: 'story-2',
    headline: 'Dispatch Two Surges Signal',
    subhead: 'Analysts flood feeds with decoded memos.',
    body: 'Network nodes amplify the recovered intel.',
  },
  {
    cardId: 'card-3',
    cardName: 'Gamma Operative',
    cardType: 'ZONE',
    player: 'human' as const,
    articleId: 'story-3',
    headline: 'Dispatch Three Containment Grid',
    subhead: 'Containment perimeter reroutes civilian traffic.',
    body: 'Logistics teams confirm minimal collateral noise.',
  },
];

const heroArticle: NarrativeArticle = {
  id: articleFixtures[0]!.cardId,
  cardId: articleFixtures[0]!.cardId,
  player: 'human',
  headline: articleFixtures[0]!.headline,
  deck: articleFixtures[0]!.subhead,
  paragraphs: [articleFixtures[0]!.body],
  tags: ['#Signal'],
  artHint: 'Hero operative sketch',
  debug: {
    templateId: 'test-template',
    verb: {
      pool: ['OVERRIDES PRIME TIME'],
      selected: 'OVERRIDES PRIME TIME',
      tone: 'ATTACK',
    },
    tagPool: ['signal'],
  },
  typeLabel: '[ATTACK]',
  factionLabel: 'Truth Network',
  truthDeltaLabel: null,
  ipDeltaLabel: null,
  pressureDeltaLabel: null,
  stateLabel: null,
  capturedStates: [],
};

type BankArticle = {
  id: string;
  tone: 'truth' | 'gov';
  tags: string[];
  headline?: string;
  subhead?: string;
  body?: string;
};

let bankArticles = new Map<string, BankArticle>();
let activeIssue = buildIssue();

const loadArticleBankMock = mock(async () => ({
  getById(id: string) {
    return bankArticles.get(id) ?? null;
  },
  hasArticles() {
    return bankArticles.size > 0;
  },
}));

mock.module('@/engine/news/articleBank', () => ({
  loadArticleBank: loadArticleBankMock,
}));

const buildGeneratedStory = (): NarrativeIssue['generatedStory'] => ({
  main: null,
  cards: articleFixtures.slice(1).map(
    (entry): PlayedCardMeta => ({
      id: entry.cardId,
      name: entry.cardName,
      type: entry.cardType,
      faction: 'TRUTH',
    }),
  ),
  articles: articleFixtures.slice(1).map(entry => ({
    cardId: entry.cardId,
    cardName: entry.cardName,
    cardType: entry.cardType,
    player: entry.player,
    articleId: entry.articleId,
    headline: entry.headline,
    subhead: entry.subhead,
    byline: 'By: Field Desk',
    body: [entry.body],
    tags: ['#Signal'],
    imagePrompt: null,
    isFallback: false,
  })),
  fallbackHeadline: 'SPECIAL EDITION: PRINTING GREMLINS AT WORK',
  fallbackSubhead: 'Article vault temporarily unavailable — dispatch desk investigating.',
  articleBankReady: true,
});

const buildIssue = (): NarrativeIssue => ({
  hero: heroArticle,
  playerArticles: [],
  oppositionArticles: [],
  comboArticle: null,
  byline: 'By: Field Desk',
  sourceLine: 'Source: Anonymous Courier',
  stamps: { breaking: null, classified: null },
  supplements: { ads: [], conspiracies: [], weather: 'Cloud cover classified.' },
  generatedStory: buildGeneratedStory(),
});

mock.module('@/engine/newspaper/IssueGenerator', () => ({
  generateIssue: async () => activeIssue,
}));

mock.module('@/contexts/AudioContext', () => ({
  useAudioContext: () => ({
    play: () => {},
  }),
}));

import TabloidNewspaperV2 from '../TabloidNewspaperV2';

const baseProps: TabloidNewspaperProps = {
  events: [],
  playedCards: articleFixtures.map(entry => ({
    card: {
      id: entry.cardId,
      name: entry.cardName,
      type: entry.cardType,
      faction: 'truth',
      cost: 1,
    },
    player: entry.player,
  })),
  faction: 'truth',
  truth: 55,
  onClose: () => {},
  comboTruthDelta: 0,
};

beforeAll(() => {
  globalThis.requestAnimationFrame = cb => setTimeout(() => cb(Date.now()), 0);
  globalThis.cancelAnimationFrame = id => clearTimeout(id);
});

beforeEach(() => {
  activeIssue = buildIssue();
  bankArticles = new Map();
});

afterEach(() => {
  cleanup();
  loadArticleBankMock.mockClear();
});

afterAll(() => {
  delete (globalThis as { requestAnimationFrame?: typeof requestAnimationFrame }).requestAnimationFrame;
  delete (globalThis as { cancelAnimationFrame?: typeof cancelAnimationFrame }).cancelAnimationFrame;
});

describe('TabloidNewspaperV2 front page integration', () => {
  test('renders hero headline without duplicating dispatch headlines', async () => {
    bankArticles = new Map(
      articleFixtures.slice(1).map(entry => [
        entry.cardId,
        {
          id: entry.cardId,
          tone: 'truth',
          tags: ['signal'],
          headline: entry.headline,
          subhead: entry.subhead,
          body: entry.body,
        } satisfies BankArticle,
      ]),
    );

    render(<TabloidNewspaperV2 {...baseProps} />);

    const heroHeading = await screen.findByRole('heading', { level: 2 });
    const heroHeadlineText = heroHeading.textContent ?? '';
    expect(heroHeadlineText).toContain('Hero Entry Overrides Prime Time');

    expect(screen.queryByRole('heading', { name: /Extra Extra Dispatch/i })).toBeNull();
  });

  test('does not render dispatch column when article bank is empty', async () => {
    loadArticleBankMock.mockImplementationOnce(async () => ({
      getById() {
        return null;
      },
      hasArticles() {
        return false;
      },
    }));

    activeIssue.generatedStory.articles = activeIssue.generatedStory.articles.map(article => ({
      ...article,
      body: [],
    }));

    render(<TabloidNewspaperV2 {...baseProps} />);

    const headline = await screen.findByRole('heading', { level: 2 });
    expect(headline.textContent ?? '').toContain('Hero Entry Overrides Prime Time');

    expect(screen.queryByRole('heading', { name: /Extra Extra Dispatch/i })).toBeNull();
  });
});
