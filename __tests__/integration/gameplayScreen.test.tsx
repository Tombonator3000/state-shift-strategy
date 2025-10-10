import { beforeAll, describe, it, expect, mock } from 'bun:test';
import { dispatchBreakingNews } from '@/lib/newsEventHelpers';
import type { GameCard } from '@/rules/mvp';
import { Window } from 'happy-dom';

let render: typeof import('@testing-library/react').render;
let screen: typeof import('@testing-library/react').screen;
let act: typeof import('@testing-library/react').act;

const happyWindow = new Window();
const windowRecord = happyWindow as unknown as Record<string, unknown>;
const globalRecord = globalThis as typeof globalThis & Record<string, unknown>;
const propagateKeys = Object.getOwnPropertyNames(happyWindow).filter(key => !(key in globalRecord));
for (const key of propagateKeys) {
  globalRecord[key] = windowRecord[key];
}

const globalWithDom = globalThis as typeof globalThis & {
  window: Window;
  document: typeof happyWindow.document;
  navigator: typeof happyWindow.navigator;
  HTMLElement: typeof happyWindow.HTMLElement;
  Node: typeof happyWindow.Node;
};

globalWithDom.window = happyWindow;
globalWithDom.document = happyWindow.document;
globalWithDom.navigator = happyWindow.navigator;
globalWithDom.HTMLElement = happyWindow.HTMLElement;
globalWithDom.Node = happyWindow.Node;

const createStorage = () => {
  const store = new Map<string, string>();
  return {
    getItem(key: string) {
      return store.has(key) ? store.get(key)! : null;
    },
    setItem(key: string, value: string) {
      store.set(key, String(value));
    },
    removeItem(key: string) {
      store.delete(key);
    },
    clear() {
      store.clear();
    },
    key(index: number) {
      return Array.from(store.keys())[index] ?? null;
    },
    get length() {
      return store.size;
    },
  } satisfies Storage;
};

const globalWithStorage = globalThis as typeof globalThis & {
  localStorage: Storage;
  sessionStorage: Storage;
};

globalWithStorage.localStorage = createStorage();
globalWithStorage.sessionStorage = createStorage();

beforeAll(async () => {
  const testingLibrary = await import('@testing-library/react');
  ({ render, screen, act } = testingLibrary);
});

describe('gameplay screen integrations', () => {
  it('surfaces breaking news from dispatched events', async () => {
    const { BreakingNewsTicker } = await import('@/components/newspaper/BreakingNewsTicker');
    render(<BreakingNewsTicker />);

    act(() => {
      dispatchBreakingNews('Test scoop reaches newsroom', 'urgent');
    });

    expect(await screen.findByText('Test scoop reaches newsroom')).toBeTruthy();
  });

  it('renders article preview overlay with fetched copy', async () => {
    const stubArticle = {
      headline: 'Anomaly Confirmed in Test State',
      subhead: 'Investigators trace signal to abandoned radar array.',
      byline: 'By Paranoid Times Staff',
      body: 'First paragraph.\n\nSecond paragraph.',
      statesMentioned: ['Test State'],
      recurringCharacter: 'Agent Lorem Ipsum',
      followUpHooks: ['Request surveillance logs', 'Debrief the informant'],
    } as const;

    mock.module('@/data/cardArticles/articleDatabase', () => ({
      getArticleForCard: () => stubArticle,
    }));

    const { ArticlePreviewOverlay } = await import('@/components/newspaper/ArticlePreviewOverlay');

    render(<ArticlePreviewOverlay cardId="test-card" cardName="Test Card" onClose={() => {}} />);

    expect(await screen.findByText(stubArticle.headline)).toBeTruthy();
    expect(screen.getByText(stubArticle.subhead)).toBeTruthy();
  });

  it('highlights combos and state bonuses in the strategy helper', async () => {
    const hand: GameCard[] = [
      {
        id: 'bigfoot',
        name: 'Bigfoot Signal Boost',
        type: 'MEDIA',
        faction: 'truth',
        cost: 2,
        tags: ['bigfoot'],
        stateBonuses: {
          ny: { label: 'Empire Truth Surge', effects: { truthDelta: 1 } },
        },
      },
      {
        id: 'mothman',
        name: 'Mothman Warning Sirens',
        type: 'MEDIA',
        faction: 'truth',
        cost: 3,
        tags: ['mothman'],
      },
      {
        id: 'press-kit',
        name: 'Rapid Response Press Kit',
        type: 'MEDIA',
        faction: 'truth',
        cost: 1,
      },
    ];

    const { StrategyHelper } = await import('@/components/gameplay/StrategyHelper');

    render(
      <StrategyHelper
        hand={hand}
        targetStateId="ny"
        className="border"
      />,
    );

    expect(screen.getByText('Strategy Insights')).toBeTruthy();
    const comboBadges = screen.getAllByText(/Cryptid Summit/i);
    expect(comboBadges.length).toBeGreaterThan(0);
    expect(screen.getByText(/gets bonus in this state/i)).toBeTruthy();
  });
});
