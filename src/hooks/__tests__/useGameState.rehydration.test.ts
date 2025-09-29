import React from 'react';
import { describe, it, expect, beforeEach, afterEach, afterAll, mock } from 'bun:test';
import TestRenderer, { act } from 'react-test-renderer';

import type { GameCard } from '@/rules/mvp';

const triggerStateEventCalls: Array<[string, 'truth' | 'government', any]> = [];
let resolveCardMvpImpl: (
  prevState: any,
  card: GameCard,
  targetState: string | null,
  actor?: 'human' | 'ai',
  achievements?: any,
) => any = () => {
  throw new Error('resolveCardMvpImpl not configured');
};

const triggerStateEventMock = (
  stateId: string,
  capturingFaction: 'truth' | 'government',
  gameState: any,
) => {
  triggerStateEventCalls.push([stateId, capturingFaction, gameState]);
  return {
    stateId,
    capturingFaction,
    triggeredOnTurn: typeof gameState.turn === 'number' ? Math.max(1, gameState.turn) : 1,
    event: {
      id: 'test-state-event',
      title: 'Test State Event',
      content: 'Bonus activated.',
      type: 'random',
      rarity: 'common',
      weight: 1,
      effects: {},
    },
  };
};

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
    prevState: any,
    card: GameCard,
    targetState: string | null,
    actor?: 'human' | 'ai',
    achievements?: any,
  ) => resolveCardMvpImpl(prevState, card, targetState, actor ?? 'human', achievements),
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
    eventManager: {
      updateTurn: () => {},
      maybeSelectRandomEvent: () => null,
    },
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

describe('useGameState save rehydration', () => {
  const originalRandom = Math.random;
  const testCard: GameCard = {
    id: 'capture-card',
    name: 'Capture Card',
    type: 'ATTACK',
    faction: 'truth',
    cost: 0,
  };

  beforeEach(() => {
    triggerStateEventCalls.length = 0;
    Math.random = () => 0;
    globalThis.localStorage = createLocalStorageMock();

    const savedState = {
      version: '1.0',
      faction: 'truth',
      phase: 'action',
      turn: 5,
      round: 2,
      currentPlayer: 'human',
      aiDifficulty: 'medium' as const,
      truth: 50,
      ip: 12,
      aiIP: 9,
      hand: [testCard],
      aiHand: [],
      deck: [],
      aiDeck: [],
      states: [
        {
          id: '51',
          name: 'Virginia',
          owner: 'ai',
          baseIP: 3,
          baseDefense: 3,
          defense: 3,
          pressure: 0,
          pressurePlayer: 0,
          pressureAi: 0,
          contested: false,
          comboDefenseBonus: 0,
          // Intentionally omit abbreviation to force ID-based lookup
          stateEventBonus: {
            source: 'state-event' as const,
            eventId: 'existing-event',
            label: 'Existing Bonus',
            triggeredOnTurn: 4,
            faction: 'government' as const,
          },
        },
      ],
      controlledStates: [],
      aiControlledStates: ['VA'],
      log: [],
      currentEvents: [],
      agendaIssueCounters: {},
      agendaRoundCounters: {},
      cardsPlayedThisRound: [],
      playHistory: [],
      turnPlays: [],
      stateCombinationEffects: { stateDefenseBonus: 0 },
    };

    localStorage.setItem('shadowgov-savegame', JSON.stringify(savedState));

    resolveCardMvpImpl = (prevState) => {
      const updatedStates = prevState.states.map((state: any) => {
        if (state.id !== '51') {
          return state;
        }
        return {
          ...state,
          owner: 'player',
          abbreviation: 'VA',
          stateEventBonus: undefined,
        };
      });

      const playerControlled = new Set(prevState.controlledStates);
      playerControlled.add('VA');

      const aiControlled = prevState.aiControlledStates.filter((abbr: string) => abbr !== 'VA');

      return {
        ip: prevState.ip,
        aiIP: prevState.aiIP,
        truth: prevState.truth,
        states: updatedStates,
        controlledStates: Array.from(playerControlled),
        aiControlledStates: aiControlled,
        capturedStateIds: ['51'],
        targetState: null,
        selectedCard: null,
        logEntries: ['Captured Virginia!'],
        damageDealt: 0,
      };
    };
  });

  afterEach(() => {
    Math.random = originalRandom;
    // eslint-disable-next-line @typescript-eslint/no-dynamic-delete
    delete (globalThis as Partial<typeof globalThis>).localStorage;
  });

  afterAll(() => {
    mock.restore();
  });

  it('restores canonical abbreviations and preserves state event bonuses after capture', async () => {
    const hook = renderHook(() => useGameState());

    await act(async () => {
      const loaded = hook.result.current?.loadGame();
      expect(loaded).toBe(true);
    });

    const beforeCapture = hook.result.current?.gameState.states.find(state => state.id === '51');
    expect(beforeCapture?.abbreviation).toBe('VA');
    expect(beforeCapture?.stateEventBonus?.eventId).toBe('existing-event');

    await act(async () => {
      hook.result.current?.playCard('capture-card');
    });

    const afterCapture = hook.result.current?.gameState.states.find(state => state.id === '51');
    expect(afterCapture?.abbreviation).toBe('VA');
    expect(afterCapture?.stateEventBonus).toBeDefined();
    expect(afterCapture?.stateEventBonus?.eventId).toBe('test-state-event');
    expect(triggerStateEventCalls.length).toBe(1);
    expect(triggerStateEventCalls[0][0]).toBe('VA');
  });

  it('captures states when save data uses lowercase identifiers', async () => {
    triggerStateEventCalls.length = 0;
    localStorage.clear();

    const lowercaseSavedState = {
      version: '1.0',
      faction: 'truth',
      phase: 'action',
      turn: 5,
      round: 2,
      currentPlayer: 'human' as const,
      aiDifficulty: 'medium' as const,
      truth: 50,
      ip: 12,
      aiIP: 9,
      hand: [testCard],
      aiHand: [],
      deck: [],
      aiDeck: [],
      states: [
        {
          id: 'va',
          name: 'virginia',
          owner: 'ai' as const,
          baseIP: 3,
          baseDefense: 3,
          defense: 3,
          pressure: 0,
          pressurePlayer: 0,
          pressureAi: 0,
          contested: false,
          comboDefenseBonus: 0,
          abbreviation: 'va',
        },
      ],
      controlledStates: [],
      aiControlledStates: ['va'],
      log: [],
      currentEvents: [],
      agendaIssueCounters: {},
      agendaRoundCounters: {},
      cardsPlayedThisRound: [],
      playHistory: [],
      turnPlays: [],
      stateCombinationEffects: { stateDefenseBonus: 0 },
    };

    localStorage.setItem('shadowgov-savegame', JSON.stringify(lowercaseSavedState));

    resolveCardMvpImpl = (prevState) => {
      const updatedStates = prevState.states.map((state: any) => {
        if (typeof state.id === 'string' && state.id.trim().toLowerCase() === 'va') {
          return {
            ...state,
            owner: 'player',
            abbreviation: 'VA',
            stateEventBonus: undefined,
          };
        }
        if (typeof state.abbreviation === 'string' && state.abbreviation.trim().toLowerCase() === 'va') {
          return {
            ...state,
            owner: 'player',
            abbreviation: 'VA',
            stateEventBonus: undefined,
          };
        }
        return state;
      });

      const playerControlled = new Set(prevState.controlledStates);
      playerControlled.add('VA');

      const aiControlled = prevState.aiControlledStates.filter((abbr: string) => abbr.toUpperCase() !== 'VA');

      return {
        ip: prevState.ip,
        aiIP: prevState.aiIP,
        truth: prevState.truth,
        states: updatedStates,
        controlledStates: Array.from(playerControlled),
        aiControlledStates: aiControlled,
        capturedStateIds: ['va'],
        targetState: null,
        selectedCard: null,
        logEntries: ['Captured lowercase Virginia!'],
        damageDealt: 0,
      };
    };

    const hook = renderHook(() => useGameState());

    await act(async () => {
      const loaded = hook.result.current?.loadGame();
      expect(loaded).toBe(true);
    });

    const beforeCapture = hook.result.current?.gameState.states.find(state => state.abbreviation === 'VA');
    expect(beforeCapture?.id?.toLowerCase()).toBe('va');

    await act(async () => {
      hook.result.current?.playCard('capture-card');
    });

    const afterCapture = hook.result.current?.gameState.states.find(state => state.abbreviation === 'VA');
    expect(afterCapture?.stateEventBonus).toBeDefined();
    expect(afterCapture?.stateEventBonus?.eventId).toBe('test-state-event');
    expect(triggerStateEventCalls.length).toBe(1);
    expect(triggerStateEventCalls[0][0]).toBe('VA');
  });
});
