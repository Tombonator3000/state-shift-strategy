import React from 'react';
import { describe, expect, it, beforeEach, afterEach, afterAll, mock } from 'bun:test';
import TestRenderer, { act } from 'react-test-renderer';

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
const stateEventQueue: Array<{ stateId: string; event: MockGameEvent }> = [];

class MockEventManager {
  maybeSelectRandomEvent(): MockGameEvent | null {
    return eventQueue.shift() ?? null;
  }

  selectStateEvent(stateId: string, _capturingFaction?: string, _gameState?: any): MockGameEvent | null {
    if (!stateEventQueue.length) {
      return null;
    }

    const index = stateEventQueue.findIndex(entry => entry.stateId === stateId);
    const [match] = index >= 0 ? stateEventQueue.splice(index, 1) : stateEventQueue.splice(0, 1);
    return match?.event ?? null;
  }

  updateTurn() {}
}

const pushMockEvent = (event: MockGameEvent) => {
  eventQueue.push(event);
};

const pushMockStateEvent = (stateId: string, event: MockGameEvent) => {
  stateEventQueue.push({ stateId, event });
};

const resetMockEvents = () => {
  eventQueue.splice(0, eventQueue.length);
  stateEventQueue.splice(0, stateEventQueue.length);
};

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

mock.module('@/systems/cardResolution', () => ({
  resolveCardMVP: (prev: any, card: any, targetState: string | null, owner: 'human' | 'ai') => {
    const resolvedState = targetState
      ? prev.states.find(
          (state: any) =>
            state.id === targetState ||
            state.abbreviation === targetState ||
            state.name === targetState,
        )
      : undefined;

    const captureId = resolvedState?.id;
    const updatedStates = prev.states.map((state: any) => {
      if (captureId && state.id === captureId) {
        const ownerLabel = owner === 'human' ? 'player' : 'ai';
        return { ...state, owner: ownerLabel };
      }
      return { ...state };
    });

    const addControlledState = (states: string[], abbreviation: string | undefined) => {
      if (!abbreviation) return states;
      if (states.includes(abbreviation)) return states;
      return [...states, abbreviation];
    };

    const controlledStates = owner === 'human' && resolvedState
      ? addControlledState(prev.controlledStates, resolvedState.abbreviation)
      : prev.controlledStates;
    const aiControlledStates = owner === 'ai' && resolvedState
      ? addControlledState(prev.aiControlledStates, resolvedState.abbreviation)
      : prev.aiControlledStates;

    return {
      ip: prev.ip,
      aiIP: prev.aiIP,
      truth: prev.truth,
      states: updatedStates,
      controlledStates,
      aiControlledStates,
      capturedStateIds: captureId ? [captureId] : [],
      targetState: captureId ?? null,
      selectedCard: card?.id ?? null,
      logEntries: [],
      damageDealt: 0,
    };
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
  (globalThis as any).__pushMockEvent = pushMockEvent;
  (globalThis as any).__resetMockEvents = resetMockEvents;
  (globalThis as any).__pushMockStateEvent = pushMockStateEvent;

  return {
    EventManager: MockEventManager,
    pushMockEvent,
    pushMockStateEvent,
    resetMockEvents,
    EVENT_DATABASE: [] as MockGameEvent[],
    STATE_EVENTS_DATABASE: {} as Record<string, MockGameEvent[]>,
  };
});

mock.module('@/hooks/useStateEvents', () => ({
  useStateEvents: () => {
    const eventManager = new MockEventManager();
    return {
      triggerStateEvent: (
        stateId: string,
        capturingFaction: 'truth' | 'government',
        gameState: any,
      ) => {
        const event = eventManager.selectStateEvent(stateId, capturingFaction, gameState);
        if (!event) {
          return null;
        }

        return {
          stateId,
          event,
          capturingFaction,
          triggeredOnTurn: typeof gameState.turn === 'number' ? Math.max(1, gameState.turn) : 1,
        };
      },
      triggerContestedStateEffects: () => {},
      updateEventManagerTurn: () => {},
      eventManager,
    };
  },
}));

declare module '@/data/eventDatabase' {
  export function pushMockEvent(event: any): void;
  export function resetMockEvents(): void;
  export function pushMockStateEvent(stateId: string, event: any): void;
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
  let pushMockStateEvent: (stateId: string, event: GameEvent) => void;
  let resetMockEvents: () => void;

  beforeEach(() => {
    globalThis.localStorage = createLocalStorageMock();
    pushMockEvent = (globalThis as any).__pushMockEvent as (event: GameEvent) => void;
    pushMockStateEvent = (globalThis as any).__pushMockStateEvent as (stateId: string, event: GameEvent) => void;
    resetMockEvents = (globalThis as any).__resetMockEvents as () => void;
    resetMockEvents();
    Math.random = () => 0;
  });

  afterEach(() => {
    Math.random = originalRandom;
    resetMockEvents();
    if (!Reflect.deleteProperty(globalThis as Record<string, unknown>, 'localStorage')) {
      (globalThis as Partial<typeof globalThis>).localStorage = undefined;
    }
  });

  afterAll(() => {
    mock.restore();
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

  it('records multiple state events in history when captures trigger bonuses', async () => {
    const hook = renderHook(() => useGameState());

    const initialHand = hook.result.current?.gameState.hand ?? [];
    expect(initialHand.length).toBeGreaterThanOrEqual(2);
    const [firstCard, secondCard] = initialHand;
    expect(firstCard).toBeDefined();
    expect(secondCard).toBeDefined();

    await act(async () => {
      hook.result.current?.setGameState(prev => ({
        ...prev,
        ip: 50,
        hand: prev.hand.map((card, index) =>
          index === 0 || index === 1 ? { ...card, cost: 0 } : card,
        ),
      }));
    });

    const eventOne: GameEvent = {
      id: 'history_event_1',
      title: 'Liberty Beacon Ignites',
      content: 'Local truth surge reshapes the narrative.',
      type: 'state',
      rarity: 'common',
      weight: 1,
    };

    const eventTwo: GameEvent = {
      id: 'history_event_2',
      title: 'Counter-Intel Collapse',
      content: 'Government cells routed overnight.',
      type: 'state',
      rarity: 'common',
      weight: 1,
    };

    pushMockStateEvent('CA', eventOne);
    await act(async () => {
      hook.result.current?.playCard(firstCard!.id, 'CA');
    });

    pushMockStateEvent('CA', eventTwo);
    await act(async () => {
      hook.result.current?.playCard(secondCard!.id, 'CA');
    });

    const latestState = hook.result.current?.gameState;
    expect(latestState).toBeDefined();
    if (!latestState) return;

    const california = latestState.states.find(state => state.abbreviation === 'CA');
    expect(california).toBeDefined();
    if (!california) return;

    expect(california.stateEventHistory.length).toBeGreaterThanOrEqual(2);
    const [firstRecent, secondRecent] = california.stateEventHistory.slice(-2);
    expect(firstRecent.eventId).toBe('history_event_1');
    expect(secondRecent.eventId).toBe('history_event_2');
    expect(california.stateEventHistory[1].faction).toBe(latestState.faction);
    expect(california.stateEventBonus?.eventId).toBe('history_event_2');
  });
});

