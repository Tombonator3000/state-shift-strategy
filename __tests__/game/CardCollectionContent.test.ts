// happy-dom globals come from the bun:test preload (see
// __tests__/__setup__/preload.ts referenced from bunfig.toml). The component
// renders shadcn Select via React portals, which need a real document — so we
// use @testing-library/react instead of react-test-renderer.
import { afterAll, afterEach, beforeEach, describe, expect, it, mock } from 'bun:test';
import React from 'react';
import { cleanup, render } from '@testing-library/react';
import type { GameCard } from '../../src/rules/mvp';
import type * as UseCardCollectionModule from '../../src/hooks/useCardCollection';

const cardWithoutText: GameCard = {
  id: 'card-without-text',
  name: 'Silent Broadcast',
  type: 'MEDIA',
  faction: 'Truth',
  rarity: 'common',
  cost: 3,
};

// bun:test's `mock.module` registrations persist for the entire test process,
// so the stub below would otherwise leak into __tests__/hooks/useCardCollection
// and pre-populate that suite's "empty database" expectations. We capture the
// real hook from the bun:test preload and only divert to the stub while this
// file's tests are running.
const TEST_REAL_MODULES = (globalThis as typeof globalThis & {
  __TEST_REAL_MODULES__?: { useCardCollection: typeof UseCardCollectionModule };
}).__TEST_REAL_MODULES__;

if (!TEST_REAL_MODULES) {
  throw new Error('Test preload did not stash real modules. Check bunfig.toml preload setup.');
}

const realUseCardCollection = TEST_REAL_MODULES.useCardCollection;

let useStub = false;

mock.module('@/hooks/useCardCollection', () => ({
  ...realUseCardCollection,
  useCardCollection: (...args: Parameters<typeof realUseCardCollection.useCardCollection>) => {
    if (!useStub) {
      return realUseCardCollection.useCardCollection(...args);
    }
    return {
      getDiscoveredCards: () => [cardWithoutText],
      getCardStats: () => ({ discovered: true, timesPlayed: 0 }),
      getCollectionStats: () => ({
        totalCards: 1,
        discoveredCards: 1,
        completionPercentage: 100,
        totalPlays: 0,
      }),
    };
  },
}));

beforeEach(() => {
  useStub = true;
});

afterAll(() => {
  useStub = false;
});

const loadCardCollectionContent = async () => {
  const module = await import('../../src/components/game/CardCollection');
  return module.CardCollectionContent;
};

afterEach(() => {
  cleanup();
});

describe('CardCollectionContent', () => {
  it('renders without crashing when card text is missing', async () => {
    const CardCollectionContent = await loadCardCollectionContent();

    expect(() => {
      render(React.createElement(CardCollectionContent));
    }).not.toThrow();
  });

  it('shows a fallback description when card text is missing', async () => {
    const CardCollectionContent = await loadCardCollectionContent();

    const { container } = render(React.createElement(CardCollectionContent));

    expect(container.innerHTML).toContain('No description available.');
  });
});
