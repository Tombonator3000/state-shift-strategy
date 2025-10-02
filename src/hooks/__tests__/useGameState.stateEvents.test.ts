import React from 'react';
import { describe, expect, it, beforeEach, afterEach, afterAll, mock } from 'bun:test';
import TestRenderer, { act } from 'react-test-renderer';
import { JSDOM } from 'jsdom';

type MockGameEvent = {
  id: string;
  title: string;
  content: string;
  type: string;
  rarity: string;
  weight: number;
  effects?: {
    truth?: number;
    truthChange?: number;
  };
};

const eventQueue: MockGameEvent[] = [];
const stateEventQueue: Array<{ stateId: string; event: MockGameEvent }> = [];

class MockEventManager {
  maybeSelectRandomEvent(): MockGameEvent | null {
    return eventQueue.shift() ?? null;
  }

  selectStateEvent(stateId: string): MockGameEvent | null {
    if (!stateEventQueue.length) {
      return null;
    }

    const index = stateEventQueue.findIndex(entry => entry.stateId === stateId);
    const [match] = index >= 0 ? stateEventQueue.splice(index, 1) : stateEventQueue.splice(0, 1);
    return match?.event ?? null;
  }

  updateTurn() {}

  reset() {}
}

const pushMockStateEvent = (stateId: string, event: MockGameEvent) => {
  stateEventQueue.push({ stateId, event });
};

const resetMockEvents = () => {
  eventQueue.splice(0, eventQueue.length);
  stateEventQueue.splice(0, stateEventQueue.length);
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

if (typeof (globalThis as Partial<typeof globalThis>).localStorage === 'undefined') {
  (globalThis as Partial<typeof globalThis>).localStorage = createLocalStorageMock();
}

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
  (globalThis as any).__pushMockStateEvent = pushMockStateEvent;
  (globalThis as any).__resetMockEvents = resetMockEvents;

  return {
    EventManager: MockEventManager,
    EVENT_DATABASE: [] as MockGameEvent[],
    STATE_EVENTS_DATABASE: {} as Record<string, MockGameEvent[]>,
    pushMockStateEvent,
    resetMockEvents,
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
        const event = eventManager.selectStateEvent(stateId);
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
      resetStateEvents: () => {},
      eventManager,
    };
  },
}));

mock.module('@/systems/cardResolution', () => ({
  resolveCardMVP: (prev: any, card: any, targetState: string | null, owner: 'human' | 'ai') => {
    const resolvedState = targetState
      ? prev.states.find(
          (state: any) =>
            state.id === targetState
            || state.abbreviation === targetState
            || state.name === targetState,
        )
      : undefined;

    const captureId = resolvedState?.id;
    const updatedStates = prev.states.map((state: any) => {
      if (captureId && state.id === captureId) {
        const ownerLabel = owner === 'human' ? 'player' : 'ai';
        return { ...state, owner: ownerLabel, paranormalHotspot: undefined };
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

    const truthDelta = 0;
    const truth = prev.truth;

    const hotspotResolutions = captureId && resolvedState?.paranormalHotspot
      ? [{
        stateId: resolvedState.id,
        stateAbbreviation: resolvedState.abbreviation,
        stateName: resolvedState.name,
        hotspotId: resolvedState.paranormalHotspot.id,
        label: resolvedState.paranormalHotspot.label,
        defenseBoost: resolvedState.paranormalHotspot.defenseBoost ?? 0,
        truthReward: 0,
        truthDelta,
        expectedTruthDelta: truthDelta,
        faction: owner === 'human' ? prev.faction : prev.faction === 'truth' ? 'government' : 'truth',
        source: resolvedState.paranormalHotspot.source ?? 'neutral',
      }]
      : undefined;

    const resolvedHotspots = captureId && resolvedState?.paranormalHotspot
      ? [resolvedState.abbreviation ?? resolvedState.id]
      : undefined;

    return {
      ip: prev.ip,
      aiIP: prev.aiIP,
      truth,
      states: updatedStates,
      controlledStates,
      aiControlledStates,
      capturedStateIds: captureId ? [captureId] : [],
      targetState: captureId ?? null,
      selectedCard: card?.id ?? null,
      logEntries: [],
      damageDealt: 0,
      resolvedHotspots,
      hotspotResolutions,
    };
  },
}));

declare module '@/data/eventDatabase' {
  export function pushMockStateEvent(stateId: string, event: any): void;
  export function resetMockEvents(): void;
}

import { useGameState } from '@/hooks/useGameState';
import type { GameEvent, ParanormalHotspotPayload } from '@/data/eventDatabase';
import type { GameState } from '@/hooks/gameStateTypes';
import { featureFlags } from '@/state/featureFlags';
import { getEnabledExpansionIdsSnapshot } from '@/data/expansions/state';
import {
  deriveHotspotIcon,
  resolveHotspot,
  type WeightedHotspotCandidate,
} from '@/systems/paranormalHotspots';

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

const createSeededRng = (seed: number) => {
  let state = seed >>> 0;
  return () => {
    state = (state + 0x6d2b79f5) | 0;
    let t = Math.imul(state ^ (state >>> 15), 1 | state);
    t ^= t + Math.imul(t ^ (t >>> 7), 61 | t);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
};

const ensureDomEnvironment = () => {
  const globalScope = globalThis as {
    window?: Window;
    document?: Document;
    navigator?: Navigator;
    Event?: typeof Event;
    CustomEvent?: typeof CustomEvent;
  };

  const hadWindow = 'window' in globalScope;
  const hadDocument = 'document' in globalScope;
  const hadNavigator = 'navigator' in globalScope;
  const hadEvent = 'Event' in globalScope;
  const hadCustomEvent = 'CustomEvent' in globalScope;

  if (hadWindow && hadDocument) {
    return () => {};
  }

  const dom = new JSDOM('<!doctype html><html><body></body></html>', { url: 'http://localhost' });

  const previousWindow = globalScope.window;
  const previousDocument = globalScope.document;
  const previousNavigator = globalScope.navigator;
  const previousEvent = globalScope.Event;
  const previousCustomEvent = globalScope.CustomEvent;

  globalScope.window = dom.window as unknown as Window;
  globalScope.document = dom.window.document as unknown as Document;
  globalScope.navigator = dom.window.navigator as unknown as Navigator;
  globalScope.Event = dom.window.Event as unknown as typeof Event;
  globalScope.CustomEvent = dom.window.CustomEvent as unknown as typeof CustomEvent;

  return () => {
    if (hadWindow) {
      globalScope.window = previousWindow;
    } else {
      delete globalScope.window;
    }

    if (hadDocument) {
      globalScope.document = previousDocument;
    } else {
      delete globalScope.document;
    }

    if (hadNavigator) {
      globalScope.navigator = previousNavigator;
    } else {
      delete globalScope.navigator;
    }

    if (hadEvent) {
      globalScope.Event = previousEvent;
    } else {
      delete globalScope.Event;
    }

    if (hadCustomEvent) {
      globalScope.CustomEvent = previousCustomEvent;
    } else {
      delete globalScope.CustomEvent;
    }
  };
};

const buildLegacyHotspotEntries = (params: {
  candidate: WeightedHotspotCandidate;
  state: GameState['states'][number];
  currentTurn: number;
  enabledExpansions: string[];
}): {
  active: GameState['paranormalHotspots'][string];
  stateHotspot: NonNullable<GameState['states'][number]['paranormalHotspot']>;
  payload: ParanormalHotspotPayload;
} => {
  const { candidate, state, currentTurn, enabledExpansions } = params;

  const stateAbbreviation = state.abbreviation ?? candidate.stateAbbreviation ?? '';
  const stateId = state.id ?? candidate.stateId ?? stateAbbreviation;

  const truthResolution = resolveHotspot(stateId, 'truth', {
    stateId,
    stateAbbreviation,
    enabledExpansions,
    hotspotKind: candidate.kind,
  });

  const rawIntensity = typeof candidate.intensity === 'number' && Number.isFinite(candidate.intensity)
    ? candidate.intensity
    : 3;
  const defenseBoost = Math.max(1, Math.round(rawIntensity / 2));
  const duration = Math.max(2, Math.min(4, Math.round(rawIntensity / 2) + 1));
  const truthReward = Math.max(1, Math.round(Math.abs(truthResolution.truthDelta)));

  const icon = deriveHotspotIcon({
    icon: candidate.icon,
    tags: candidate.tags,
    expansionTag: candidate.expansionTag,
    kind: candidate.kind,
  });
  const label = candidate.name ?? `${state.name} Hotspot`;
  const description = candidate.summary ?? candidate.location ?? `${state.name} hotspot`;

  const payload: ParanormalHotspotPayload = {
    stateId,
    label,
    description,
    icon,
    duration,
    truthReward,
    defenseBoost,
    source: 'neutral',
    kind: candidate.kind,
  };

  const expiresOnTurn = currentTurn + duration;
  const id = `${candidate.id}:${stateAbbreviation}:${currentTurn}`;

  const active = {
    id,
    eventId: candidate.id,
    stateId,
    stateName: state.name,
    stateAbbreviation,
    label,
    description,
    icon,
    duration,
    defenseBoost,
    truthReward,
    expiresOnTurn,
    createdOnTurn: currentTurn,
    source: payload.source ?? 'neutral',
    kind: candidate.kind,
  } satisfies GameState['paranormalHotspots'][string];

  const stateHotspot = {
    id,
    eventId: candidate.id,
    label,
    description,
    icon,
    defenseBoost,
    truthReward,
    expiresOnTurn,
    turnsRemaining: Math.max(0, expiresOnTurn - currentTurn),
    source: payload.source ?? 'neutral',
    kind: candidate.kind,
  } satisfies NonNullable<GameState['states'][number]['paranormalHotspot']>;

  return { active, stateHotspot, payload };
};

describe('useGameState state event truth adjustments', () => {
  const originalRandom = Math.random;

  let pushStateEvent: (stateId: string, event: GameEvent) => void;
  let resetEvents: () => void;

  beforeEach(() => {
    globalThis.localStorage = createLocalStorageMock();
    pushStateEvent = (globalThis as any).__pushMockStateEvent as (stateId: string, event: GameEvent) => void;
    resetEvents = (globalThis as any).__resetMockEvents as () => void;
    resetEvents();
    Math.random = () => 0;
  });

  afterEach(() => {
    Math.random = originalRandom;
    resetEvents();
    if (!Reflect.deleteProperty(globalThis as Record<string, unknown>, 'localStorage')) {
      (globalThis as Partial<typeof globalThis>).localStorage = undefined;
    }
  });

  afterAll(() => {
    mock.restore();
  });

  it('raises truth for the Truth faction when capturing a bonus state event', async () => {
    const hook = renderHook(() => useGameState());

    await act(async () => {
      hook.result.current?.initGame('truth');
    });

    const initialState = hook.result.current?.gameState;
    expect(initialState).toBeDefined();
    if (!initialState) return;

    const [firstCard] = initialState.hand;
    expect(firstCard).toBeDefined();
    if (!firstCard) return;

    await act(async () => {
      hook.result.current?.setGameState(prev => ({
        ...prev,
        ip: 50,
        hand: prev.hand.map((card, index) => (index === 0 ? { ...card, cost: 0 } : card)),
      }));
    });

    const event: GameEvent = {
      id: 'truth_rally',
      title: 'Truth Rally',
      content: 'Grassroots support surges.',
      type: 'state',
      rarity: 'common',
      weight: 1,
      effects: {
        truth: 5,
      },
    } as GameEvent;

    pushStateEvent('CA', event);

    await act(async () => {
      hook.result.current?.playCard(firstCard.id, 'CA');
    });

    const latestState = hook.result.current?.gameState;
    expect(latestState).toBeDefined();
    if (!latestState) return;

    expect(latestState.truth).toBe(55);
    expect(latestState.log.some(entry => entry.includes('Truth manipulation ↑'))).toBe(true);

    const california = latestState.states.find(state => state.abbreviation === 'CA');
    expect(california).toBeDefined();
    if (!california) return;

    const summaryEntry = california.stateEventHistory[california.stateEventHistory.length - 1];
    expect(summaryEntry.effectSummary).toBeDefined();
    expect(summaryEntry.effectSummary).toContain('Truth +5%');
  });

  it('reduces truth for the Government faction when capturing a bonus state event', async () => {
    const hook = renderHook(() => useGameState());

    await act(async () => {
      hook.result.current?.initGame('government');
    });

    const initialState = hook.result.current?.gameState;
    expect(initialState).toBeDefined();
    if (!initialState) return;

    const [firstCard] = initialState.hand;
    expect(firstCard).toBeDefined();
    if (!firstCard) return;

    await act(async () => {
      hook.result.current?.setGameState(prev => ({
        ...prev,
        ip: 50,
        hand: prev.hand.map((card, index) => (index === 0 ? { ...card, cost: 0 } : card)),
      }));
    });

    const event: GameEvent = {
      id: 'ut_antechamber_checkpoint',
      title: 'Antechamber Checkpoint',
      content: 'Clamp down on dissenters.',
      type: 'state',
      rarity: 'common',
      weight: 1,
      effects: {
        truthChange: -5,
      },
    } as GameEvent;

    pushStateEvent('CA', event);

    await act(async () => {
      hook.result.current?.playCard(firstCard.id, 'CA');
    });

    const latestState = hook.result.current?.gameState;
    expect(latestState).toBeDefined();
    if (!latestState) return;

    expect(latestState.truth).toBe(45);
    expect(latestState.log.some(entry => entry.includes('Truth manipulation ↓'))).toBe(true);

    const california = latestState.states.find(state => state.abbreviation === 'CA');
    expect(california).toBeDefined();
    if (!california) return;

    const summaryEntry = california.stateEventHistory[california.stateEventHistory.length - 1];
    expect(summaryEntry.effectSummary).toBeDefined();
    expect(summaryEntry.effectSummary).toContain('Truth -5%');
  });

  it('keeps pressure fields finite when applying a pressure delta to a state without faction pressure', async () => {
    const hook = renderHook(() => useGameState());

    await act(async () => {
      hook.result.current?.initGame('truth');
    });

    const initialState = hook.result.current?.gameState;
    expect(initialState).toBeDefined();
    if (!initialState) return;

    const [firstCard] = initialState.hand;
    expect(firstCard).toBeDefined();
    if (!firstCard) return;

    await act(async () => {
      hook.result.current?.setGameState(prev => ({
        ...prev,
        ip: 50,
        hand: prev.hand.map((card, index) => (index === 0 ? { ...card, cost: 0 } : card)),
        states: prev.states.map(state => {
          if (state.abbreviation !== 'CA') {
            return state;
          }

          const sanitizedState = { ...state } as typeof state & Record<string, unknown>;
          delete sanitizedState.pressurePlayer;
          delete sanitizedState.pressureAi;
          delete sanitizedState.pressure;
          return sanitizedState as typeof state;
        }),
      }));
    });

    const event: GameEvent = {
      id: 'pressure_surge',
      title: 'Pressure Surge',
      content: 'A sudden wave of activism grips the state.',
      type: 'state',
      rarity: 'common',
      weight: 1,
      effects: {
        stateEffects: {
          pressure: 4,
        },
      },
    } as GameEvent;

    pushStateEvent('CA', event);

    await act(async () => {
      hook.result.current?.playCard(firstCard.id, 'CA');
    });

    const latestState = hook.result.current?.gameState;
    expect(latestState).toBeDefined();
    if (!latestState) return;

    const california = latestState.states.find(state => state.abbreviation === 'CA');
    expect(california).toBeDefined();
    if (!california) return;

    expect(Number.isFinite(california.pressure)).toBe(true);
    expect(Number.isFinite(california.pressurePlayer)).toBe(true);
    expect(Number.isFinite(california.pressureAi)).toBe(true);
    expect(california.pressure).toBeGreaterThanOrEqual(0);
    expect(california.pressurePlayer ?? 0).toBeGreaterThan(0);
    expect(california.pressureAi ?? 0).toBeGreaterThanOrEqual(0);
    expect(california.pressure).toBeGreaterThanOrEqual(california.pressurePlayer ?? 0);
  });

  it('spawns director hotspots matching legacy hotspot entries when closing the newspaper', async () => {
    const originalHotspotFlag = featureFlags.hotspotDirectorEnabled;
    const hook = renderHook(() => useGameState());

    await act(async () => {
      hook.result.current?.initGame('truth');
    });

    const director = hook.result.current?.hotspotDirector;
    expect(director).toBeDefined();
    if (!director) return;

    const seededRng = createSeededRng(1337);
    const originalRollForSpawn = director.rollForSpawn;
    let capturedCandidate: WeightedHotspotCandidate | null = null;

    const stubbedRoll: typeof director.rollForSpawn = (round, gameState, options = {}) => {
      const result = originalRollForSpawn.call(director, round, gameState, { ...options, rng: seededRng });
      capturedCandidate = result;
      return result;
    };

    director.rollForSpawn = stubbedRoll;
    featureFlags.hotspotDirectorEnabled = true;

    const beforeCloseState = JSON.parse(JSON.stringify(hook.result.current!.gameState)) as GameState;

    try {
      await act(async () => {
        hook.result.current?.closeNewspaper();
      });
    } finally {
      director.rollForSpawn = originalRollForSpawn;
      featureFlags.hotspotDirectorEnabled = originalHotspotFlag;
    }

    expect(capturedCandidate).not.toBeNull();
    if (!capturedCandidate) return;

    const finalState = hook.result.current?.gameState;
    expect(finalState).toBeDefined();
    if (!finalState) return;

    const targetAbbreviation = capturedCandidate.stateAbbreviation;
    expect(typeof targetAbbreviation).toBe('string');
    if (!targetAbbreviation) return;

    const beforeTargetState = beforeCloseState.states.find(state => state.abbreviation === targetAbbreviation);
    const afterTargetState = finalState.states.find(state => state.abbreviation === targetAbbreviation);

    expect(beforeTargetState).toBeDefined();
    expect(afterTargetState).toBeDefined();
    if (!beforeTargetState || !afterTargetState) return;

    const enabledExpansions = getEnabledExpansionIdsSnapshot();
    const legacyEntries = buildLegacyHotspotEntries({
      candidate: capturedCandidate,
      state: beforeTargetState,
      currentTurn: beforeCloseState.turn,
      enabledExpansions,
    });

    expect(afterTargetState.paranormalHotspot).toEqual(legacyEntries.stateHotspot);
    expect(finalState.paranormalHotspots[targetAbbreviation]).toEqual(legacyEntries.active);
    expect(afterTargetState.defense).toBe(beforeTargetState.defense + legacyEntries.payload.defenseBoost);
    expect(legacyEntries.payload.truthReward).toBe(afterTargetState.paranormalHotspot.truthReward);
    expect(legacyEntries.payload.defenseBoost).toBe(afterTargetState.paranormalHotspot.defenseBoost);
    expect(finalState.paranormalHotspots[targetAbbreviation].icon).toBe(legacyEntries.active.icon);
    expect(finalState.paranormalHotspots[targetAbbreviation].expiresOnTurn).toBe(
      legacyEntries.active.expiresOnTurn,
    );
  });

  it('emits hotspot visuals centered on the target state when closing the newspaper', async () => {
    const originalHotspotFlag = featureFlags.hotspotDirectorEnabled;
    const hook = renderHook(() => useGameState());

    await act(async () => {
      hook.result.current?.initGame('truth');
    });

    const director = hook.result.current?.hotspotDirector;
    expect(director).toBeDefined();
    if (!director) {
      return;
    }

    const gameState = hook.result.current?.gameState;
    expect(gameState).toBeDefined();
    if (!gameState) {
      return;
    }

    const targetState = gameState.states.find(state => state.id && state.abbreviation && state.name);
    expect(targetState).toBeDefined();
    if (!targetState) {
      return;
    }

    const restoreDom = ensureDomEnvironment();

    const candidate: WeightedHotspotCandidate = {
      id: 'test-hotspot',
      name: 'Centered Signal',
      kind: 'ghost',
      location: 'Test Site',
      intensity: 4,
      status: 'spawning',
      tags: [],
      icon: undefined,
      expansionTag: undefined,
      stateId: targetState.id,
      stateName: targetState.name,
      stateAbbreviation: targetState.abbreviation,
      totalWeight: 1,
      weightBreakdown: { base: 1, catalog: 0, type: 0, expansion: 0, cryptid: 0 },
    };

    const originalRollForSpawn = director.rollForSpawn;
    director.rollForSpawn = () => candidate;

    const stateElement = document.createElement('div');
    stateElement.setAttribute('data-state-id', targetState.id);
    stateElement.setAttribute('data-state-abbr', targetState.abbreviation);
    stateElement.getBoundingClientRect = () => ({
      width: 120,
      height: 80,
      top: 300,
      left: 400,
      right: 520,
      bottom: 380,
      x: 400,
      y: 300,
      toJSON: () => ({}),
    }) as DOMRect;
    document.body.appendChild(stateElement);

    let listener: ((event: Event) => void) | null = null;
    const hotspotDetailPromise = new Promise<{
      position: { x: number; y: number };
    }>(resolve => {
      const localListener = (event: Event) => {
        window.removeEventListener('paranormalHotspot', localListener as EventListener);
        const detail = (event as CustomEvent<{ position: { x: number; y: number } }>).detail;
        resolve(detail);
      };
      listener = localListener;
      window.addEventListener('paranormalHotspot', localListener as EventListener);
    });

    featureFlags.hotspotDirectorEnabled = true;

    try {
      await act(async () => {
        hook.result.current?.closeNewspaper();
      });

      const detail = await hotspotDetailPromise;
      expect(detail.position).toEqual({ x: 460, y: 340 });
    } finally {
      if (listener) {
        window.removeEventListener('paranormalHotspot', listener as EventListener);
      }
      if (stateElement.parentElement) {
        stateElement.parentElement.removeChild(stateElement);
      }
      director.rollForSpawn = originalRollForSpawn;
      featureFlags.hotspotDirectorEnabled = originalHotspotFlag;
      restoreDom();
    }
  });
});

