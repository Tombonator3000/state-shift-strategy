import React from 'react';
import { describe, it, expect, beforeEach, afterEach, afterAll, mock } from 'bun:test';
import TestRenderer, { act } from 'react-test-renderer';

mock.module('@/ai/enhancedController', () => ({
  chooseTurnActions: () => {
    throw new Error('AI planning failed');
  },
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

import { useGameState } from '@/hooks/useGameState';

type HookResult<T> = {
  current: T | undefined;
};

const renderHook = <T,>(callback: () => T) => {
  const result: HookResult<T> = { current: undefined };

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

const originalSetTimeout = globalThis.setTimeout;
const originalClearTimeout = globalThis.clearTimeout;
const originalRandom = Math.random;

const timers = new Map<number, () => void>();
let nextTimerId = 1;

describe('useGameState AI error recovery', () => {
  beforeEach(() => {
    timers.clear();
    nextTimerId = 1;
    Math.random = () => 0;
    globalThis.localStorage = createLocalStorageMock();

    globalThis.setTimeout = ((callback: (...args: any[]) => void, _delay?: number, ...args: any[]) => {
      const id = nextTimerId++;
      const wrapped = () => callback(...args);
      timers.set(id, wrapped);
      queueMicrotask(() => {
        const pending = timers.get(id);
        if (pending) {
          timers.delete(id);
          pending();
        }
      });
      return id as unknown as ReturnType<typeof setTimeout>;
    }) as typeof setTimeout;

    globalThis.clearTimeout = ((id: number) => {
      timers.delete(Number(id));
    }) as typeof clearTimeout;
  });

  afterEach(() => {
    Math.random = originalRandom;
    globalThis.setTimeout = originalSetTimeout;
    globalThis.clearTimeout = originalClearTimeout;
    timers.clear();
    if (!Reflect.deleteProperty(globalThis as Record<string, unknown>, 'localStorage')) {
      (globalThis as Partial<typeof globalThis>).localStorage = undefined;
    }
  });

  afterAll(() => {
    mock.restore();
  });

  it('resets AI turn progress and returns control to the player when planning fails', async () => {
    const hook = renderHook(() => useGameState());

    await act(async () => {
      hook.result.current?.setGameState(prev => ({
        ...prev,
        phase: 'ai_turn',
        currentPlayer: 'ai' as const,
        aiTurnInProgress: false,
        aiStrategist: {
          personality: { name: 'Mock Strategist' },
          recordAiPlayOutcome: () => {},
        },
        aiDeck: [],
        aiHand: [],
        states: [],
        log: [],
      }));
    });

    let aiTurnPromise: Promise<void> | undefined;
    await act(async () => {
      aiTurnPromise = hook.result.current?.executeAITurn();
    });

    await expect(aiTurnPromise).resolves.toBeUndefined();

    const latestState = hook.result.current?.gameState;
    expect(latestState?.aiTurnInProgress).toBe(false);
    expect(latestState?.currentPlayer).toBe('human');
  });
});
