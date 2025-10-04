import { afterAll, afterEach, beforeAll, describe, expect, mock, test } from 'bun:test';
import { Window } from 'happy-dom';

import type { NarrativeIssue } from '@/engine/newspaper/IssueGenerator';
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

const { render, screen, waitFor, cleanup, within } = await import('@testing-library/react');

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
    headline: 'Side Story One',
    subhead: 'Lead operatives breach the signal vault.',
    body: 'Field team confirmed the breach before dawn.',
  },
  {
    cardId: 'card-2',
    cardName: 'Beta Analyst',
    cardType: 'MEDIA',
    player: 'human' as const,
    articleId: 'story-2',
    headline: 'Side Story Two',
    subhead: 'Analysts flood feeds with decoded memos.',
    body: 'Network nodes amplify the recovered intel.',
  },
  {
    cardId: 'card-3',
    cardName: 'Gamma Operative',
    cardType: 'ZONE',
    player: 'human' as const,
    articleId: 'story-3',
    headline: 'Side Story Three',
    subhead: 'Containment perimeter reroutes civilian traffic.',
    body: 'Logistics teams confirm minimal collateral noise.',
  },
];

type BankArticle = {
  id: string;
  tone: 'truth' | 'gov';
  tags: string[];
  headline?: string;
  subhead?: string;
  body?: string;
};

let bankArticles = new Map<string, BankArticle>();

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

const generatedStory: NarrativeIssue['generatedStory'] = {
  main: null,
  articles: articleFixtures.map(entry => ({
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
};

const issue: NarrativeIssue = {
  hero: null,
  playerArticles: [],
  oppositionArticles: [],
  comboArticle: null,
  byline: 'By: Field Desk',
  sourceLine: 'Source: Anonymous Courier',
  stamps: { breaking: null, classified: null },
  supplements: { ads: [], conspiracies: [], weather: 'Cloud cover classified.' },
  generatedStory,
};

mock.module('@/engine/newspaper/IssueGenerator', () => ({
  generateIssue: async () => issue,
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

afterEach(() => {
  cleanup();
  bankArticles = new Map();
  loadArticleBankMock.mockClear();
});

afterAll(() => {
  delete (globalThis as { requestAnimationFrame?: typeof requestAnimationFrame }).requestAnimationFrame;
  delete (globalThis as { cancelAnimationFrame?: typeof cancelAnimationFrame }).cancelAnimationFrame;
});

describe('TabloidNewspaperV2 front page integration', () => {
  test('renders combined headline and three side dispatches', async () => {
    bankArticles = new Map(
      articleFixtures.map(entry => [
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

    await waitFor(() => {
      const headline = screen.getByRole('heading', { level: 1 });
      expect(headline.textContent ?? '').toMatch(/ALPHA AGENT/);
    });

    expect(screen.getByText(/snacks remain excellent/i)).toBeTruthy();

    const secondaryHeading = await screen.findByText('SECONDARY REPORTS');
    const secondarySection = secondaryHeading.closest('section');
    expect(secondarySection).not.toBeNull();
    expect(within(secondarySection as HTMLElement).getAllByText(/Side Story/)).toHaveLength(3);
  });

  test('shows fallback headline and simple list when article bank is empty', async () => {
    loadArticleBankMock.mockImplementationOnce(async () => ({
      getById() {
        return null;
      },
      hasArticles() {
        return false;
      },
    }));

    render(<TabloidNewspaperV2 {...baseProps} />);

    const headline = await screen.findByRole('heading', { level: 1 });
    expect(headline.textContent ?? '').toMatch(/ALPHA AGENT/);

    const lists = await screen.findAllByRole('list');
    const items = within(lists[0] as HTMLElement).getAllByRole('listitem');
    expect(items).toHaveLength(3);
    expect(items[0]?.textContent).toContain('[ATTACK]');
  });
});
