import React from 'react';
import { describe, it, expect, beforeEach, afterEach, afterAll, mock } from 'bun:test';
import TestRenderer, { act } from 'react-test-renderer';

import type { GameCard } from '@/rules/mvp';

type TriggerCall = [string, 'truth' | 'government'];

const triggerStateEventCalls: TriggerCall[] = [];
let nextTriggeredEvent: any = null;

let resolveCardMvpImpl: (
  prevState: any,
  card: GameCard,
  targetState: string | null,
) => any = () => {
  throw new Error('resolveCardMvpImpl not configured');
};

const triggerStateEventMock = (
  stateId: string,
  capturingFaction: 'truth' | 'government',
  gameState: any,
) => {
  triggerStateEventCalls.push([stateId, capturingFaction]);

  if (!nextTriggeredEvent) {
    return null;
  }

  return {
    stateId,
    capturingFaction,
    event: nextTriggeredEvent,
    triggeredOnTurn: typeof gameState.turn === 'number' && Number.isFinite(gameState.turn)
      ? Math.max(1, Math.floor(gameState.turn))
      : 1,
  };
};

class MockEventManager {
  reset() {}
  updateTurn() {}
  maybeSelectRandomEvent() {
    return null;
  }
  triggerEvent() {}
  getAvailableEvents() {
    return [] as any[];
  }
}

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

mock.module('@/systems/cardResolution', () => ({
  resolveCardMVP: (
    prev: any,
    card: GameCard,
    targetState: string | null,
  ) => resolveCardMvpImpl(prev, card, targetState),
}));

mock.module('@/data/eventDatabase', () => ({
  EventManager: MockEventManager,
  EVENT_DATABASE: [] as any[],
  STATE_EVENTS_DATABASE: {} as Record<string, any[]>,
}));

mock.module('@/hooks/useStateEvents', () => ({
  useStateEvents: () => ({
    triggerStateEvent: (
      stateId: string,
      capturingFaction: 'truth' | 'government',
      gameState: any,
    ) => triggerStateEventMock(stateId, capturingFaction, gameState),
    triggerContestedStateEffects: () => {},
    updateEventManagerTurn: () => {},
    resetStateEvents: () => {},
    eventManager: new MockEventManager(),
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

const buildCaptureResolution = (
  prev: any,
  card: GameCard,
  captureAbbr: string,
) => {
  const resolvedState = prev.states.find((state: any) => {
    const identifiers = [state.abbreviation, state.id, state.name].filter(Boolean) as string[];
    return identifiers.some(identifier => identifier === captureAbbr);
  });

  if (!resolvedState) {
    throw new Error(`State ${captureAbbr} not found in resolution`);
  }

  const captureId = resolvedState.id;
  const abbreviation = resolvedState.abbreviation ?? captureAbbr;
  const controlledStates = Array.isArray(prev.controlledStates)
    ? prev.controlledStates.includes(abbreviation)
      ? prev.controlledStates
      : [...prev.controlledStates, abbreviation]
    : [abbreviation];
  const aiControlledSource = Array.isArray(prev.aiControlledStates)
    ? prev.aiControlledStates
    : [];
  const aiControlledStates = aiControlledSource.filter((abbr: string) => abbr !== abbreviation);

  const states = prev.states.map((state: any) => {
    const history = Array.isArray(state.stateEventHistory)
      ? [...state.stateEventHistory]
      : state.stateEventBonus
        ? [state.stateEventBonus]
        : [];

    if (state.id === captureId) {
      return {
        ...state,
        owner: 'player',
        stateEventBonus: undefined,
        stateEventHistory: history,
      };
    }

    return {
      ...state,
      stateEventHistory: history,
    };
  });

  return {
    ip: prev.ip,
    aiIP: prev.aiIP,
    truth: prev.truth,
    states,
    controlledStates,
    aiControlledStates,
    capturedStateIds: [captureId],
    targetState: abbreviation,
    selectedCard: card.id,
    logEntries: ['Captured state'],
    damageDealt: 0,
  };
};

describe('useGameState state event truth handling', () => {
  const originalRandom = Math.random;

  const truthCaptureCard: GameCard = {
    id: 'truth-capture-card',
    name: 'Truth Capture',
    type: 'ATTACK',
    faction: 'truth',
    cost: 0,
  };

  const governmentCaptureCard: GameCard = {
    id: 'government-capture-card',
    name: 'Government Capture',
    type: 'ATTACK',
    faction: 'government',
    cost: 0,
  };

  beforeEach(() => {
    triggerStateEventCalls.length = 0;
    nextTriggeredEvent = null;
    Math.random = () => 0;
    globalThis.localStorage = createLocalStorageMock();
  });

  afterEach(() => {
    Math.random = originalRandom;
    triggerStateEventCalls.length = 0;
    nextTriggeredEvent = null;
    resolveCardMvpImpl = () => {
      throw new Error('resolveCardMvpImpl not configured');
    };
    if (!Reflect.deleteProperty(globalThis as Record<string, unknown>, 'localStorage')) {
      (globalThis as Partial<typeof globalThis>).localStorage = undefined;
    }
  });

  afterAll(() => {
    mock.restore();
  });

  it('awards positive truth for player truth captures and records the summary', async () => {
    const hook = renderHook(() => useGameState());

    nextTriggeredEvent = {
      id: 'lobster-wiretap-coop',
      title: 'Lobster Wiretap Coop',
      content: 'Government surveillance exposed.',
      type: 'state',
      rarity: 'common',
      weight: 1,
      effects: {
        truth: 2,
      },
    };

    resolveCardMvpImpl = (prev, card) => buildCaptureResolution(prev, card, 'ME');

    await act(async () => {
      hook.result.current?.setGameState(prev => ({
        ...prev,
        faction: 'truth' as const,
        truth: 50,
        ip: 10,
        hand: [truthCaptureCard],
        states: prev.states.map(state => state.abbreviation === 'ME'
          ? { ...state, owner: 'ai' as const, stateEventBonus: undefined, stateEventHistory: [] }
          : state
        ),
        aiControlledStates: ['ME'],
        controlledStates: prev.controlledStates.filter(abbr => abbr !== 'ME'),
      }));
    });

    await act(async () => {
      hook.result.current?.playCard(truthCaptureCard.id, 'ME');
    });

    const latestState = hook.result.current?.gameState;
    expect(latestState).toBeDefined();
    if (!latestState) return;

    expect(latestState.truth).toBe(52);
    expect(triggerStateEventCalls.length).toBe(1);
    expect(triggerStateEventCalls[0][1]).toBe('truth');

    const maine = latestState.states.find(state => state.abbreviation === 'ME');
    expect(maine).toBeDefined();
    if (!maine) return;

    const summaryLine = maine.stateEventBonus?.effectSummary?.find(line => line.startsWith('Truth'));
    expect(summaryLine).toBe('Truth +2%');

    const historySummary = maine.stateEventHistory?.at(-1)?.effectSummary?.find(line => line.startsWith('Truth'));
    expect(historySummary).toBe('Truth +2%');

    hook.unmount();
  });

  it('deducts truth for government captures and inverts the summary sign', async () => {
    const hook = renderHook(() => useGameState());

    nextTriggeredEvent = {
      id: 'lobster-wiretap-coop',
      title: 'Lobster Wiretap Coop',
      content: 'Government surveillance exposed.',
      type: 'state',
      rarity: 'common',
      weight: 1,
      effects: {
        truth: 2,
      },
    };

    resolveCardMvpImpl = (prev, card) => buildCaptureResolution(prev, card, 'ME');

    await act(async () => {
      hook.result.current?.setGameState(prev => ({
        ...prev,
        faction: 'government' as const,
        truth: 50,
        ip: 10,
        hand: [governmentCaptureCard],
        states: prev.states.map(state => state.abbreviation === 'ME'
          ? { ...state, owner: 'ai' as const, stateEventBonus: undefined, stateEventHistory: [] }
          : state
        ),
        aiControlledStates: ['ME'],
        controlledStates: prev.controlledStates.filter(abbr => abbr !== 'ME'),
      }));
    });

    await act(async () => {
      hook.result.current?.playCard(governmentCaptureCard.id, 'ME');
    });

    const latestState = hook.result.current?.gameState;
    expect(latestState).toBeDefined();
    if (!latestState) return;

    expect(latestState.truth).toBe(48);
    expect(triggerStateEventCalls.length).toBe(1);
    expect(triggerStateEventCalls[0][1]).toBe('government');

    const maine = latestState.states.find(state => state.abbreviation === 'ME');
    expect(maine).toBeDefined();
    if (!maine) return;

    const summaryLine = maine.stateEventBonus?.effectSummary?.find(line => line.startsWith('Truth'));
    expect(summaryLine).toBe('Truth -2%');

    const historySummary = maine.stateEventHistory?.at(-1)?.effectSummary?.find(line => line.startsWith('Truth'));
    expect(historySummary).toBe('Truth -2%');

    hook.unmount();
  });
});
