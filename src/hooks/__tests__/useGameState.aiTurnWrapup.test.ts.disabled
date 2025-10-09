import React from 'react';
import { describe, expect, it, beforeEach, afterEach, afterAll, mock } from 'bun:test';
import TestRenderer, { act } from 'react-test-renderer';

mock.module('@/ai/enhancedController', () => ({
  chooseTurnActions: () => ({
    actions: [
      { cardId: 'ai-card-1', reasoning: 'Open with a broadcast.' },
      { cardId: 'ai-card-2', reasoning: 'Follow up with an expose.' },
      { cardId: 'ai-card-3', reasoning: 'Secure a foothold.' },
    ],
    sequenceDetails: ['Execute three-card plan'],
  }),
}));

mock.module('@/hooks/aiTurnActions', () => ({
  processAiActions: async ({ actions, playCard }: any) => {
    for (const action of actions) {
      await playCard({
        cardId: action.cardId,
        reasoning: action.reasoning,
        targetState: action.targetState,
      });
    }
    return { gameOver: false };
  },
}));

mock.module('@/hooks/aiHelpers', () => {
  const applyAiCardPlay = (prev: any, params: any) => {
    const card =
      prev.aiHand.find((entry: any) => entry.id === params.cardId) || {
        id: params.cardId,
        name: params.cardId,
        type: 'MEDIA',
        cost: 0,
        faction: 'government',
      };
    const nextState = {
      ...prev,
      aiHand: prev.aiHand.filter((entry: any) => entry.id !== card.id),
      log: [...prev.log, `AI played ${card.name}`],
      cardsPlayedThisTurn: prev.cardsPlayedThisTurn + 1,
    };
    return {
      nextState,
      card,
      resolution: {
        ip: prev.ip,
        aiIP: prev.aiIP,
        truth: prev.truth,
        states: prev.states,
        controlledStates: prev.controlledStates,
        aiControlledStates: prev.aiControlledStates,
        capturedStateIds: [],
        targetState: params.targetState ?? null,
        selectedCard: null,
        logEntries: [`AI played ${card.name}`],
        damageDealt: 0,
      },
    };
  };

  return {
    applyAiCardPlay,
    buildStrategyLogEntries: () => [],
    createPlayedCardRecord: () => ({
      card: {
        id: 'record-card',
        name: 'Recorded Card',
        type: 'MEDIA',
        faction: 'truth',
        cost: 0,
      },
      player: 'ai',
      faction: 'truth',
      targetState: null,
      truthDelta: 0,
      ipDelta: 0,
      aiIpDelta: 0,
      capturedStates: [],
      capturedStateIds: [],
      damageDealt: 0,
      round: 1,
      turn: 1,
      timestamp: Date.now(),
      logEntries: [],
    }),
    createTurnPlayEntries: () => [],
    toPlayedLite: () => null,
  };
});

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

import type { GameCard } from '@/rules/mvp';
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

type TimerEntry = {
  callback: () => void;
  delay: number;
};

const timers = new Map<number, TimerEntry>();
let nextTimerId = 1;

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

describe('useGameState AI turn wrap-up', () => {
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

  it('keeps the AI turn active until wrap-up finishes and then returns control to the player', async () => {
    const hook = renderHook(() => useGameState());

    const aiCards: GameCard[] = [
      {
        id: 'ai-card-1',
        name: 'Signal Boost',
        type: 'MEDIA',
        faction: 'government',
        cost: 0,
      },
      {
        id: 'ai-card-2',
        name: 'Expose Fraud',
        type: 'ATTACK',
        faction: 'government',
        cost: 0,
      },
      {
        id: 'ai-card-3',
        name: 'Secure Zone',
        type: 'ZONE',
        faction: 'government',
        cost: 0,
      },
    ];

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
        aiHand: aiCards,
        cardsPlayedThisTurn: 0,
        log: [],
      }));
    });

    let aiTurnPromise: Promise<void> | undefined;
    await act(async () => {
      aiTurnPromise = hook.result.current?.executeAITurn();
    });

    expect(aiTurnPromise).toBeDefined();

    await flushTimersByDelay(500);
    await aiTurnPromise;

    const midTurnState = hook.result.current?.gameState;
    expect(midTurnState?.cardsPlayedThisTurn).toBe(3);
    expect(midTurnState?.aiTurnInProgress).toBe(true);
    expect(timersWithDelay(1000)).toHaveLength(1);

    const scheduledIds = timersWithDelay(1000).map(([id]) => id);

    await act(async () => {
      await hook.result.current?.executeAITurn();
    });

    expect(timersWithDelay(1000).map(([id]) => id)).toEqual(scheduledIds);

    await flushTimersByDelay(1000);

    const finalState = hook.result.current?.gameState;
    expect(finalState?.currentPlayer).toBe('human');
    expect(finalState?.aiTurnInProgress).toBe(false);
  });
});
