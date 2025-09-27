import React from 'react';
import { describe, expect, it, beforeEach, afterEach, mock } from 'bun:test';
import TestRenderer, { act } from 'react-test-renderer';

mock.module('@/hooks/comboAdapter', () => ({
  evaluateCombosForTurn: (state: any, owner: 'human' | 'ai') => ({
    evaluation: { results: [] },
    updatedTruth: state.truth,
    truthDelta: 0,
    updatedPlayerIp: owner === 'human' ? state.ip : state.aiIP,
    updatedOpponentIp: owner === 'human' ? state.aiIP : state.ip,
    logEntries: [],
    fxMessages: [],
  }),
}));

mock.module('@/ai/enhancedController', () => ({
  chooseTurnActions: () => ({ actions: [], sequenceDetails: [] }),
}));

mock.module('@/hooks/aiTurnActions', () => ({
  processAiActions: async () => ({ gameOver: false }),
}));

mock.module('@/data/aiFactory', () => ({
  AIFactory: {
    createStrategist: () => ({
      personality: { name: 'Mock Strategist' },
      recordAiPlayOutcome: () => {},
    }),
  },
}));

mock.module('@/contexts/AchievementContext', () => ({
  useAchievements: () => ({
    manager: {
      onNewGameStart: () => {},
    },
    stats: {
      total_states_controlled: 0,
      max_states_controlled_single_game: 0,
      max_ip_reached: 0,
      max_truth_reached: 0,
      min_truth_reached: 100,
    },
    unlockedAchievements: [],
    lockedAchievements: [],
    newlyUnlocked: [],
    updateStats: () => {},
    onGameStart: () => {},
    onGameEnd: () => {},
    onCardPlayed: () => {},
    onCombosResolved: () => {},
    exportData: () => ({}),
    importData: () => true,
    resetProgress: () => {},
    clearNewlyUnlocked: () => {},
  }),
}));

mock.module('@/data/eventDatabase', () => {
  type MockGameEvent = {
    id: string;
    title: string;
    content: string;
    type: string;
    rarity: string;
    weight: number;
    effects?: {
      truth?: number;
      ip?: number;
      cardDraw?: number;
      truthChange?: number;
      ipChange?: number;
      defenseChange?: number;
      stateEffects?: {
        stateId?: string;
        pressure?: number;
        defense?: number;
      };
      revealSecretAgenda?: boolean;
    };
    conditions?: {
      requiresState?: string;
    };
  };

  const eventQueue: MockGameEvent[] = [];

  class MockEventManager {
    maybeSelectRandomEvent(): MockGameEvent | null {
      return eventQueue.shift() ?? null;
    }

    updateTurn() {}
  }

  const pushMockEvent = (event: MockGameEvent) => {
    eventQueue.push(event);
  };

  const resetMockEvents = () => {
    eventQueue.splice(0, eventQueue.length);
  };

  (globalThis as any).__pushMockEvent = pushMockEvent;
  (globalThis as any).__resetMockEvents = resetMockEvents;

  return {
    EventManager: MockEventManager,
    pushMockEvent,
    resetMockEvents,
    EVENT_DATABASE: [] as MockGameEvent[],
    STATE_EVENTS_DATABASE: {} as Record<string, MockGameEvent[]>,
  };
});

declare module '@/data/eventDatabase' {
  export function pushMockEvent(event: any): void;
  export function resetMockEvents(): void;
}

import { useGameState } from '@/hooks/useGameState';
import type { GameEvent } from '@/data/eventDatabase';

const renderHook = <T,>(callback: () => T) => {
  const result: { current: T | undefined } = { current: undefined };

  const TestComponent = () => {
    result.current = callback();
    return null;
  };

  const renderer = TestRenderer.create(React.createElement(TestComponent));

  return {
    result,
    rerender: () => renderer.update(React.createElement(TestComponent)),
    unmount: () => renderer.unmount(),
  };
};

const createLocalStorageMock = (): Storage => {
  const store = new Map<string, string>();
  return {
    get length() {
      return store.size;
    },
    clear: () => {
      store.clear();
    },
    getItem: (key: string) => (store.has(key) ? store.get(key)! : null),
    key: (index: number) => Array.from(store.keys())[index] ?? null,
    removeItem: (key: string) => {
      store.delete(key);
    },
    setItem: (key: string, value: string) => {
      store.set(key, value);
    },
  } as Storage;
};

describe('useGameState event effects', () => {
  const originalRandom = Math.random;

  let pushMockEvent: (event: GameEvent) => void;
  let resetMockEvents: () => void;

  beforeEach(() => {
    globalThis.localStorage = createLocalStorageMock();
    pushMockEvent = (globalThis as any).__pushMockEvent as (event: GameEvent) => void;
    resetMockEvents = (globalThis as any).__resetMockEvents as () => void;
    resetMockEvents();
    Math.random = () => 0;
  });

  afterEach(() => {
    Math.random = originalRandom;
    resetMockEvents();
    // eslint-disable-next-line @typescript-eslint/no-dynamic-delete
    delete (globalThis as Partial<typeof globalThis>).localStorage;
  });

  it('applies truth, IP, and state modifiers from event effects', async () => {
    const hook = renderHook(() => useGameState());

    const event: GameEvent = {
      id: 'test_event',
      title: 'Stacked Signals',
      content: 'Combined truth/IP shifts with state impact.',
      type: 'random',
      rarity: 'common',
      weight: 1,
      effects: {
        truth: 2,
        truthChange: -3,
        ip: 1,
        ipChange: -4,
        defenseChange: 2,
        stateEffects: {
          stateId: 'CA',
          pressure: 3,
          defense: 1,
        },
      },
    };

    pushMockEvent(event);

    await act(async () => {
      hook.result.current?.endTurn();
    });

    const latestState = hook.result.current?.gameState;
    expect(latestState).toBeDefined();
    if (!latestState) return;

    expect(latestState.truth).toBe(49);
    expect(latestState.ip).toBe(7);

    const california = latestState.states.find(state => state.abbreviation === 'CA');
    expect(california).toBeDefined();
    expect(california?.defense).toBe(7);
    expect(california?.pressure).toBe(3);

    expect(latestState.log).toContain('EVENT: Stacked Signals triggered!');
    expect(latestState.log).toContain('Truth -1%');
    expect(latestState.log).toContain('IP -3');
    expect(latestState.log).toContain('California defense +3');
    expect(latestState.log).toContain('California pressure +3');
  });
});

