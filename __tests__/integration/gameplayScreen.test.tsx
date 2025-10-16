import { beforeAll, describe, it, expect, mock } from 'bun:test';
import { dispatchBreakingNews } from '@/lib/newsEventHelpers';
import type { GameCard } from '@/rules/mvp';
import { buildFinalEdition as buildGameOverReport } from '@/utils/finalEdition';
import type { GameState } from '@/hooks/gameStateTypes';
import type { ArticleBlock, TurnComposite } from '@/news/types';
import { Window } from 'happy-dom';

let render: typeof import('@testing-library/react').render;
let screen: typeof import('@testing-library/react').screen;
let act: typeof import('@testing-library/react').act;
let fireEvent: typeof import('@testing-library/react').fireEvent;

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
  ({ render, screen, act, fireEvent } = testingLibrary);
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
    const { ArticlePreviewOverlay } = await import('@/components/newspaper/ArticlePreviewOverlay');

    render(
      <ArticlePreviewOverlay
        cardId="TRUTH-NEW-017"
        cardName="Implant Removal Surgery"
        onClose={() => {}}
      />,
    );

    expect(
      await screen.findByText('TORNADO CHASERS FIND REVIVAL TENT FLOATING BETWEEN OKLAHOMA AND TEXAS—PASTOR REX & SMITHERSON ARGUE ABOUT WIND RIGHTS'),
    ).toBeTruthy();
    expect(
      screen.getByText('Mobile sermon collides with federal no-fly zone paperwork mid-air'),
    ).toBeTruthy();
  });

  it('surfaces strategy insights from the help overlay', async () => {
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

    const { default: ContextualHelp } = await import('@/components/game/ContextualHelp');

    render(
      <ContextualHelp
        gamePhase="action"
        currentPlayer="human"
        selectedCard={undefined}
        playerIP={5}
        controlledStates={2}
        hand={hand}
        targetStateId="ny"
      />,
    );

    expect(screen.queryByText('Strategy Insights')).toBeNull();

    const helpButton = screen.getByRole('button', { name: /help/i });
    act(() => {
      fireEvent.click(helpButton);
    });

    expect(await screen.findByText('Strategy Insights')).toBeTruthy();
    const comboBadges = screen.getAllByText(/Cryptid Summit/i);
    expect(comboBadges.length).toBeGreaterThan(0);
    expect(screen.getByText(/gets bonus in this state/i)).toBeTruthy();
  });

  it('builds final edition feed from headline log and bulletins', () => {
    const composite: TurnComposite = {
      round: 2,
      turn: 3,
      plays: [],
      focus: [],
      tone: 'truth',
      main: {
        tone: 'truth',
        hed: 'Signal Lock Achieved',
        dek: 'Operatives intercept clandestine broadcast.',
        bullets: ['Operatives intercept clandestine broadcast.'],
        byline: 'By: Composite Desk',
        source: 'Source: Dispatch Relay',
        kicker: 'Turn 3 Dispatch',
      },
      runnersUp: [],
      metrics: {
        cards: 3,
        truth: { raw: 6, weighted: 3 },
        ip: { raw: 2, weighted: 1 },
        captures: { raw: 0, weighted: 0 },
        damage: { raw: 0, weighted: 0 },
        typeBonus: 1,
        total: 5,
      },
      signature: 'alpha,beta,gamma',
      seed: 123,
    } satisfies TurnComposite;

    const bulletin: ArticleBlock = {
      tone: 'government',
      hed: 'Legacy Bulletin',
      dek: 'Government issues late-night rebuttal.',
      bullets: ['Government issues late-night rebuttal.'],
      byline: 'By: Official Bulletin Desk',
      source: 'Source: Control Wire',
      kicker: 'Extra Extra Bulletin',
    } satisfies ArticleBlock;

    const state: Pick<
      GameState,
      'round' | 'truth' | 'ip' | 'aiIP' | 'states' | 'faction' | 'playHistory' | 'extraExtraFeed' | 'recurringCharacters' | 'headlineLog'
    > & { currentEvents?: GameState['currentEvents'] } = {
      round: 2,
      truth: 68,
      ip: 12,
      aiIP: 9,
      states: [
        {
          id: 'ny',
          name: 'New York',
          abbreviation: 'NY',
          baseIP: 2,
          baseDefense: 2,
          defense: 2,
          pressure: 0,
          pressurePlayer: 0,
          pressureAi: 0,
          contested: false,
          owner: 'player',
          paranormalHotspotHistory: [],
          stateEventHistory: [],
          roundEvents: [],
        },
      ],
      faction: 'truth',
      playHistory: [],
      extraExtraFeed: [bulletin],
      recurringCharacters: {},
      headlineLog: [composite],
      currentEvents: [],
    };

    const report = buildGameOverReport({
      state,
      winner: 'truth',
      victoryType: 'truth',
      playerSecretAgenda: undefined,
      aiSecretAgenda: undefined,
      arcSummaries: undefined,
      paranormalSightings: [],
      comboSummary: null,
    });

    expect(report.extraExtraFeed).toHaveLength(2);
    expect(report.extraExtraFeed[0].hed).toBe('Legacy Bulletin');
    expect(report.extraExtraFeed[1].hed).toBe('Signal Lock Achieved');
    expect(report.frontPage?.hed).toBe('Signal Lock Achieved');
    expect(report.frontPage?.tone).toBe('truth');
  });
});
