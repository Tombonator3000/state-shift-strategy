import { afterEach, beforeEach, describe, expect, mock, test } from 'bun:test';
import { render, waitFor } from '@testing-library/react';
import { Window } from 'happy-dom';

import PlayerHubMapView from '../PlayerHubMapView';
import type { PlayerStateIntel } from '../PlayerHubOverlay';

type MutableGlobal = typeof globalThis & {
  window?: Window & typeof globalThis;
  document?: Document;
  navigator?: Navigator;
  ResizeObserver?: typeof ResizeObserver;
};

const globalRef = globalThis as MutableGlobal;

if (!globalRef.window || !globalRef.document) {
  const happyWindow = new Window();
  globalRef.window = happyWindow as unknown as Window & typeof globalThis;
  globalRef.document = happyWindow.document;
  globalRef.navigator = happyWindow.navigator;
}

const sampleIntel: PlayerStateIntel = {
  generatedAtTurn: 6,
  round: 3,
  totals: {
    player: 12,
    ai: 8,
    neutral: 5,
    contested: 3,
  },
  states: [
    {
      id: 'ca',
      name: 'California',
      abbreviation: 'CA',
      owner: 'player',
      contested: false,
      pressure: 2,
      defense: 3,
      pressurePlayer: 3,
      pressureAi: 1,
      stateEventHistory: [
        {
          source: 'state-event',
          eventId: 'event-001',
          label: 'Signal Uplink Established',
          description: 'Operatives stabilized broadcasting nodes.',
          triggeredOnTurn: 2,
          faction: 'truth',
        },
      ],
      paranormalHotspotHistory: [],
    },
    {
      id: 'ny',
      name: 'New York',
      abbreviation: 'NY',
      owner: 'ai',
      contested: true,
      pressure: 4,
      defense: 5,
      pressurePlayer: 1,
      pressureAi: 4,
      stateEventHistory: [],
      paranormalHotspotHistory: [],
    },
  ],
  eventHistory: [],
  recentEvents: [
    {
      stateId: 'ny',
      stateName: 'New York',
      abbreviation: 'NY',
      owner: 'ai',
      contested: true,
      pressure: 4,
      defense: 5,
      pressurePlayer: 1,
      pressureAi: 4,
      event: {
        source: 'state-event',
        eventId: 'event-ny',
        label: 'Counter Surge Detected',
        description: 'Government agents retaliated overnight.',
        triggeredOnTurn: 5,
        faction: 'government',
      },
    },
  ],
};

const originalResizeObserver = (globalThis as MutableGlobal).ResizeObserver;

beforeEach(() => {
  class StubResizeObserver {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    constructor(private readonly callback: ResizeObserverCallback) {}
    observe() {}
    unobserve() {}
    disconnect() {}
  }

  (globalThis as MutableGlobal).ResizeObserver = StubResizeObserver as unknown as typeof ResizeObserver;
});

afterEach(() => {
  if (originalResizeObserver) {
    (globalThis as MutableGlobal).ResizeObserver = originalResizeObserver;
  } else {
    delete (globalThis as MutableGlobal).ResizeObserver;
  }
});

describe('PlayerHubMapView', () => {
  test('renders the offline map when fetch fails', async () => {
    const originalFetch = globalThis.fetch;
    const failingFetch = mock(() => {
      throw new Error('Network access disabled');
    });
    globalThis.fetch = failingFetch as unknown as typeof fetch;

    const { container, unmount } = render(
      <PlayerHubMapView faction="truth" intel={sampleIntel} className="h-96 w-96" />,
    );

    try {
      await waitFor(() => {
        const renderedStates = container.querySelectorAll('path.state-path');
        expect(renderedStates.length).toBeGreaterThan(0);
      });

      expect(failingFetch.mock.calls.length).toBe(0);
    } finally {
      unmount();
      globalThis.fetch = originalFetch;
    }
  });
});
