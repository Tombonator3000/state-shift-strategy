// happy-dom globals are installed via the bun:test preload (see
// __tests__/__setup__/preload.ts referenced from bunfig.toml). Re-installing a
// fresh Window here would invalidate the document/window already captured by
// @testing-library/react during its module init.
import { afterEach, describe, expect, it } from 'bun:test';
import { cleanup, render, screen } from '@testing-library/react';
import type { PageBuilderData } from '@/components/game/TabloidNewspaperV2Pages';

const createPageData = (overrides: Partial<PageBuilderData> = {}): PageBuilderData => ({
  heroHeadline: 'Shadow networks sync the midnight briefing',
  heroSubhead: 'Intercepted whispers hint at a time-spliced directive still under wraps.',
  heroBody: [
    'Operatives traced the jittery signal through three mirrored relays before filing their report under psychic quarantine.',
    'Desk analysts scrubbed the metadata twice and still flagged cross-faction ghost signatures haunting the logs.',
  ],
  heroTags: ['midnight relay', 'time-glitch'],
  heroPrimaryCardId: null,
  heroPrimaryCardName: null,
  heroPrimaryCardFaction: null,
  byline: 'By: Composite Desk',
  sourceLine: 'Source: Encrypted Dispatch',
  truthProgress: 48,
  truthDeltaLabel: '+3',
  playerCards: { length: 5 },
  opponentCards: { length: 4 },
  narrativeContext: { capturedStates: ['Nevada'], truthDeltaTotal: 3 },
  events: [],
  runnerDispatches: [],
  eventStories: [],
  comboNarrative: null,
  hotspotExtraArticle: null,
  ads: [],
  conspiracies: [],
  weatherLine: 'Weather: Static drizzle over Site Theta.',
  formattedAgendaQuotes: [],
  campaignArcGroups: [],
  ...overrides,
});

afterEach(() => {
  cleanup();
});

describe('buildNewspaperPages hero art integration', () => {
  it('renders hero card artwork and caption details when metadata is provided', async () => {
    const { buildNewspaperPages } = await import('@/components/game/TabloidNewspaperV2Pages');
    const pages = buildNewspaperPages(
      createPageData({
        heroPrimaryCardId: 'truth_network_card',
        heroPrimaryCardName: 'Network Tapline Escalation',
        heroPrimaryCardFaction: 'TRUTH',
      }),
    );

    const { container } = render(<>{pages[0]}</>);

    expect(screen.getByAltText('Card art for truth_network_card')).toBeTruthy();
    expect(screen.getByText('Network Tapline Escalation • TRUTH faction')).toBeTruthy();
    expect(container.querySelector('.newspaper-columns')).toBeTruthy();
  });

  it('omits hero artwork when no card metadata exists while preserving article layout', async () => {
    const { buildNewspaperPages } = await import('@/components/game/TabloidNewspaperV2Pages');
    const pages = buildNewspaperPages(createPageData());

    const { container } = render(<>{pages[0]}</>);

    expect(screen.queryByAltText(/Card art for/)).toBeNull();
    expect(screen.getByText('Intercepted whispers hint at a time-spliced directive still under wraps.')).toBeTruthy();
    expect(container.querySelector('.newspaper-columns')).toBeTruthy();
  });
});
