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

const { render, screen, waitFor, cleanup } = await import('@testing-library/react');

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

const generatedStory: NarrativeIssue['generatedStory'] = {
  headline: 'Combined Headline Assembled',
  subhead: 'Operatives align messaging across the theater.',
  byline: 'By: Field Desk',
  isFallback: false,
  articles: [
    {
      cardId: 'card-1',
      cardName: 'Alpha Agent',
      cardType: 'attack',
      player: 'human',
      articleId: 'story-1',
      headline: 'Side Story One',
      subhead: 'Lead operatives breach the signal vault.',
      byline: 'By: Operative Pulse',
      body: ['Field team confirmed the breach before dawn.'],
      tags: ['#Signal'],
      imagePrompt: null,
      isFallback: false,
    },
    {
      cardId: 'card-2',
      cardName: 'Beta Analyst',
      cardType: 'media',
      player: 'human',
      articleId: 'story-2',
      headline: 'Side Story Two',
      subhead: 'Analysts flood feeds with decoded memos.',
      byline: 'By: Resonance Bureau',
      body: ['Network nodes amplify the recovered intel.'],
      tags: ['#Broadcast'],
      imagePrompt: null,
      isFallback: false,
    },
    {
      cardId: 'card-3',
      cardName: 'Gamma Operative',
      cardType: 'zone',
      player: 'human',
      articleId: 'story-3',
      headline: 'Side Story Three',
      subhead: 'Containment perimeter reroutes civilian traffic.',
      byline: 'By: Field Desk',
      body: ['Logistics teams confirm minimal collateral noise.'],
      tags: ['#Containment'],
      imagePrompt: null,
      isFallback: false,
    },
  ],
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
  playedCards: [],
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
});

afterAll(() => {
  delete (globalThis as { requestAnimationFrame?: typeof requestAnimationFrame }).requestAnimationFrame;
  delete (globalThis as { cancelAnimationFrame?: typeof cancelAnimationFrame }).cancelAnimationFrame;
});

describe('TabloidNewspaperV2 front page integration', () => {
  test('renders combined headline and three side dispatches', async () => {
    render(<TabloidNewspaperV2 {...baseProps} />);

    await waitFor(() => {
      expect(screen.getByText('Combined Headline Assembled')).toBeTruthy();
    });

    expect(screen.getByText('Operatives align messaging across the theater.')).toBeTruthy();

    const sideStories = ['Side Story One', 'Side Story Two', 'Side Story Three'];
    for (const headline of sideStories) {
      expect(screen.getByText(headline)).toBeTruthy();
    }

    expect(screen.getAllByText(/Side Story/)).toHaveLength(3);
  });
});
