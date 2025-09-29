import React from 'react';
import { describe, expect, it, beforeEach, afterEach, mock } from 'bun:test';
import TestRenderer, { act } from 'react-test-renderer';

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

import { useGameState } from '@/hooks/useGameState';

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

type TimerEntry = {
  callback: () => void;
  delay: number;
};

const timers = new Map<number, TimerEntry>();
let nextTimerId = 1;

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

const timersWithDelay = (delay: number) => {
  return [...timers.entries()].filter(([, timer]) => timer.delay === delay);
};

const flushTimersByDelay = async (delay: number) => {
  const entries = timersWithDelay(delay);
  for (const [id, timer] of entries) {
    timers.delete(id);
    await act(async () => {
      timer.callback();
    });
  }
};

const originalSetTimeout = globalThis.setTimeout;
const originalClearTimeout = globalThis.clearTimeout;
const originalRandom = Math.random;

describe('useGameState AI turn scheduling', () => {
  beforeEach(() => {
    timers.clear();
    nextTimerId = 1;
    Math.random = () => 0;
    globalThis.localStorage = createLocalStorageMock();

    globalThis.setTimeout = ((cb: (...args: any[]) => void, delay?: number, ...args: any[]) => {
      const id = nextTimerId++;
      timers.set(id, {
        callback: () => cb(...args),
        delay: typeof delay === 'number' ? delay : 0,
      });
      return id as unknown as ReturnType<typeof setTimeout>;
    }) as typeof setTimeout;

    globalThis.clearTimeout = ((id: unknown) => {
      const numericId = Number(id);
      timers.delete(numericId);
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

  it('runs a single AI completion timeout and does not skip the human turn', async () => {
    const hook = renderHook(() => useGameState());
    const aiPhaseSetup = {
      phase: 'ai_turn' as const,
      currentPlayer: 'ai' as const,
      aiTurnInProgress: false,
    };

    await act(async () => {
      hook.result.current?.setGameState(prev => ({
        ...prev,
        ...aiPhaseSetup,
      }));
    });

    let initialRun: Promise<void> | undefined;
    let redundantRun: Promise<void> | undefined;
    await act(async () => {
      initialRun = hook.result.current?.executeAITurn();
      redundantRun = hook.result.current?.executeAITurn();
    });

    expect(timersWithDelay(1000)).toHaveLength(0);
    await flushTimersByDelay(500);
    await initialRun;
    await redundantRun;

    expect(timersWithDelay(1000)).toHaveLength(1);

    const scheduledIds = timersWithDelay(1000).map(([id]) => id);

    await act(async () => {
      await hook.result.current?.executeAITurn();
    });

    expect(timersWithDelay(1000).map(([id]) => id)).toEqual(scheduledIds);

    await act(async () => {
      hook.result.current?.setGameState(prev => ({
        ...prev,
        phase: 'action',
        currentPlayer: 'human',
        aiTurnInProgress: false,
      }));
    });

    await flushTimersByDelay(1000);

    const latestState = hook.result.current?.gameState;
    expect(latestState?.currentPlayer).toBe('human');
    expect(latestState?.aiTurnInProgress).toBe(false);
    expect(timersWithDelay(1000)).toHaveLength(0);
  });

  it('ignores AI completion from a previous session after starting a new game', async () => {
    const hook = renderHook(() => useGameState());
    const aiPhaseSetup = {
      phase: 'ai_turn' as const,
      currentPlayer: 'ai' as const,
      aiTurnInProgress: false,
    };

    await act(async () => {
      hook.result.current?.setGameState(prev => ({
        ...prev,
        ...aiPhaseSetup,
      }));
    });

    let aiTurnPromise: Promise<void> | undefined;
    await act(async () => {
      aiTurnPromise = hook.result.current?.executeAITurn();
    });

    expect(timersWithDelay(1000)).toHaveLength(0);
    await flushTimersByDelay(500);

    await aiTurnPromise;

    expect(timersWithDelay(1000)).toHaveLength(1);

    await act(async () => {
      hook.result.current?.initGame('truth');
    });

    const postRestartState = hook.result.current?.gameState;
    expect(postRestartState?.turn).toBe(1);
    expect(postRestartState?.phase).toBe('action');
    expect(postRestartState?.currentPlayer).toBe('human');
    expect(postRestartState?.aiTurnInProgress).toBe(false);

    expect(timersWithDelay(1000)).toHaveLength(0);

    await flushTimersByDelay(1000);

    const finalState = hook.result.current?.gameState;
    expect(finalState?.turn).toBe(1);
    expect(finalState?.phase).toBe('action');
    expect(finalState?.currentPlayer).toBe('human');
    expect(finalState?.aiTurnInProgress).toBe(false);
    expect(timersWithDelay(1000)).toHaveLength(0);
  });
});
