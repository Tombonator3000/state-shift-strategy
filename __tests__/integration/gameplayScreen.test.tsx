// happy-dom + localStorage globals come from the bun:test preload (see
// __tests__/__setup__/preload.ts referenced from bunfig.toml). Re-installing
// here would invalidate the document/window @testing-library/react captured at
// module init.
import { describe, it, expect, mock } from 'bun:test';
import { act, fireEvent, render, screen } from '@testing-library/react';
import { dispatchBreakingNews } from '@/lib/newsEventHelpers';
import type { GameCard } from '@/rules/mvp';
import { buildFinalEdition as buildGameOverReport } from '@/utils/finalEdition';
import type { GameState } from '@/hooks/gameStateTypes';
import type { ArticleBlock } from '@/news/types';
import type { CompositeStory, ExtraExtraFeedEntry } from '@/types/news';

const globalWithStorage = globalThis as typeof globalThis & {
  sessionStorage: Storage;
};

if (typeof globalWithStorage.sessionStorage === 'undefined') {
  const store = new Map<string, string>();
  globalWithStorage.sessionStorage = {
    getItem: (key: string) => (store.has(key) ? store.get(key)! : null),
    setItem: (key: string, value: string) => { store.set(key, String(value)); },
    removeItem: (key: string) => { store.delete(key); },
    clear: () => { store.clear(); },
    key: (index: number) => Array.from(store.keys())[index] ?? null,
    get length() { return store.size; },
  } satisfies Storage;
}

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
    const composite: CompositeStory = {
      tone: 'truth',
      tags: ['Signal', 'Intercept'],
      headline: 'Signal Lock Achieved',
      subhead: 'Operatives intercept clandestine broadcast.',
      byline: 'Composite Desk',
      body: ['Operatives intercept clandestine broadcast.', 'Broadcast decrypted and archived.'],
      sources: [
        { id: 'alpha', headline: 'Alpha Relay' },
        { id: 'beta', headline: 'Beta Transmission' },
      ],
    } satisfies CompositeStory;

    const bulletin: ArticleBlock = {
      tone: 'government',
      hed: 'Legacy Bulletin',
      dek: 'Government issues late-night rebuttal.',
      bullets: ['Government issues late-night rebuttal.'],
      byline: 'By: Official Bulletin Desk',
      source: 'Source: Control Wire',
      kicker: 'Extra Extra Bulletin',
    } satisfies ArticleBlock;

    const extraExtraEntry: ExtraExtraFeedEntry = { kind: 'article', data: bulletin };

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
      extraExtraFeed: [extraExtraEntry],
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
    expect(report.extraExtraFeed[0].hed).toBe('Signal Lock Achieved');
    expect(report.extraExtraFeed[1].hed).toBe('Legacy Bulletin');
    expect(report.frontPage?.hed).toBe('Signal Lock Achieved');
    expect(report.frontPage?.tone).toBe('truth');
  });
});
