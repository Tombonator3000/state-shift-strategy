import React from 'react';
import {
  afterAll,
  afterEach,
  beforeAll,
  beforeEach,
  describe,
  expect,
  mock,
  test,
  vi,
} from 'bun:test';
import { act } from 'react';
import { createRoot, type Root } from 'react-dom/client';
import { JSDOM } from 'jsdom';
import type { ActiveParanormalHotspot, GameState } from '@/hooks/gameStateTypes';
import { VisualEffectsCoordinator } from '@/utils/visualEffects';

let EnhancedUSAMap: typeof import('../EnhancedUSAMap').default;
let deriveHotspotIcon: typeof import('@/systems/paranormalHotspots').deriveHotspotIcon;
let resolveHotspot: typeof import('@/systems/paranormalHotspots').resolveHotspot;
type WeightedHotspotCandidate = import('@/systems/paranormalHotspots').WeightedHotspotCandidate;

mock.module('@/data/extensionSystem', () => ({
  extensionManager: {
    getEnabledExtensions: () => [],
    getAllExtensionCards: () => [],
    getExtension: () => undefined,
  },
  getExtensionCardsSnapshot: () => [],
}));

const dom = new JSDOM('<!doctype html><html><body></body></html>', { url: 'http://localhost' });
const { window } = dom;

const originalWindow = globalThis.window;
const originalDocument = globalThis.document;
const originalNavigator = globalThis.navigator;
const originalFetch = globalThis.fetch;
const originalResizeObserver = (globalThis as { ResizeObserver?: typeof ResizeObserver }).ResizeObserver;
const originalMatchMedia = originalWindow?.matchMedia;
const originalRequestAnimationFrame = originalWindow?.requestAnimationFrame;
const originalCancelAnimationFrame = originalWindow?.cancelAnimationFrame;
const originalLocalStorage = (globalThis as { localStorage?: Storage }).localStorage;
const originalSessionStorage = (globalThis as { sessionStorage?: Storage }).sessionStorage;
const existingSVGElement = (globalThis as { SVGElement?: typeof window.SVGElement }).SVGElement;
const existingSVGSVGElement = (globalThis as { SVGSVGElement?: typeof window.SVGSVGElement }).SVGSVGElement;
const hadOriginalSVGElement = typeof existingSVGElement !== 'undefined';
const hadOriginalSVGSVGElement = typeof existingSVGSVGElement !== 'undefined';
const originalGetBoundingClientRect = existingSVGElement?.prototype.getBoundingClientRect;
const originalCreateSVGPoint = existingSVGSVGElement?.prototype.createSVGPoint;
const originalGetScreenCTM = existingSVGSVGElement?.prototype.getScreenCTM;

const createMemoryStorage = (): Storage => {
  const store = new Map<string, string>();
  return {
    get length() {
      return store.size;
    },
    clear() {
      store.clear();
    },
    getItem(key: string) {
      return store.has(key) ? store.get(key)! : null;
    },
    key(index: number) {
      return Array.from(store.keys())[index] ?? null;
    },
    removeItem(key: string) {
      store.delete(key);
    },
    setItem(key: string, value: string) {
      store.set(key, value);
    },
  } as Storage;
};

if (!originalLocalStorage) {
  (globalThis as { localStorage: Storage }).localStorage = createMemoryStorage();
}
if (!originalSessionStorage) {
  (globalThis as { sessionStorage: Storage }).sessionStorage = createMemoryStorage();
}

const installDomGlobals = () => {
  (globalThis as typeof globalThis & { window: Window; document: Document; navigator: Navigator }).window = window as unknown as Window;
  globalThis.document = window.document as unknown as Document;
  globalThis.navigator = window.navigator as unknown as Navigator;

  (globalThis as unknown as { HTMLElement: typeof HTMLElement }).HTMLElement = window.HTMLElement as unknown as typeof HTMLElement;
  (globalThis as unknown as { SVGElement: typeof SVGElement }).SVGElement = window.SVGElement as unknown as typeof SVGElement;
  (globalThis as unknown as { SVGSVGElement: typeof SVGSVGElement }).SVGSVGElement = window.SVGSVGElement as unknown as typeof SVGSVGElement;
  (globalThis as unknown as { Element: typeof Element }).Element = window.Element as unknown as typeof Element;
  (globalThis as unknown as { localStorage: Storage }).localStorage = window.localStorage as unknown as Storage;
  (globalThis as unknown as { sessionStorage: Storage }).sessionStorage = window.sessionStorage as unknown as Storage;
};

installDomGlobals();
(globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean }).IS_REACT_ACT_ENVIRONMENT = true;

const restoreDomGlobals = () => {
  if (originalWindow) {
    (globalThis as typeof globalThis & { window: Window }).window = originalWindow;
  }
  if (originalDocument) {
    globalThis.document = originalDocument;
  }
  if (originalNavigator) {
    globalThis.navigator = originalNavigator;
  }
  if (typeof originalResizeObserver !== 'undefined') {
    (globalThis as { ResizeObserver?: typeof ResizeObserver }).ResizeObserver = originalResizeObserver;
  } else {
    delete (globalThis as { ResizeObserver?: typeof ResizeObserver }).ResizeObserver;
  }
  if (originalMatchMedia) {
    originalWindow!.matchMedia = originalMatchMedia;
  }
  if (originalRequestAnimationFrame) {
    originalWindow!.requestAnimationFrame = originalRequestAnimationFrame;
  }
  if (originalCancelAnimationFrame) {
    originalWindow!.cancelAnimationFrame = originalCancelAnimationFrame;
  }

  if (hadOriginalSVGElement && existingSVGElement) {
    (globalThis as { SVGElement?: typeof window.SVGElement }).SVGElement = existingSVGElement;
    if (originalGetBoundingClientRect) {
      existingSVGElement.prototype.getBoundingClientRect = originalGetBoundingClientRect;
    } else {
      delete existingSVGElement.prototype.getBoundingClientRect;
    }
  } else {
    delete (globalThis as { SVGElement?: typeof window.SVGElement }).SVGElement;
  }

  if (hadOriginalSVGSVGElement && existingSVGSVGElement) {
    (globalThis as { SVGSVGElement?: typeof window.SVGSVGElement }).SVGSVGElement = existingSVGSVGElement;
    if (originalCreateSVGPoint) {
      existingSVGSVGElement.prototype.createSVGPoint = originalCreateSVGPoint;
    } else {
      delete existingSVGSVGElement.prototype.createSVGPoint;
    }

    if (originalGetScreenCTM) {
      existingSVGSVGElement.prototype.getScreenCTM = originalGetScreenCTM;
    } else {
      delete existingSVGSVGElement.prototype.getScreenCTM;
    }
  } else {
    delete (globalThis as { SVGSVGElement?: typeof window.SVGSVGElement }).SVGSVGElement;
  }

  if (originalLocalStorage) {
    (globalThis as { localStorage?: Storage }).localStorage = originalLocalStorage;
  } else {
    delete (globalThis as { localStorage?: Storage }).localStorage;
  }

  if (originalSessionStorage) {
    (globalThis as { sessionStorage?: Storage }).sessionStorage = originalSessionStorage;
  } else {
    delete (globalThis as { sessionStorage?: Storage }).sessionStorage;
  }
};

type MinimalState = Pick<NonNullable<GameState['states']>[number], 'id' | 'name' | 'abbreviation' | 'owner' | 'defense' | 'baseDefense' | 'baseIP' | 'pressure'>;

type EnhancedTestState = MinimalState & {
  paranormalHotspot?: {
    id: string;
    eventId: string;
    label: string;
    description?: string;
    icon?: string;
    defenseBoost: number;
    truthReward: number;
    expiresOnTurn: number;
    turnsRemaining: number;
    source: 'truth' | 'government' | 'neutral';
  };
};

const identityRect = () => ({
  x: 0,
  y: 0,
  top: 0,
  left: 0,
  bottom: 600,
  right: 975,
  width: 975,
  height: 600,
  toJSON: () => ({})
});

const ensureSvgGeometryHelpers = () => {
  SVGElement.prototype.getBoundingClientRect = identityRect;

  (SVGSVGElement.prototype as unknown as { createSVGPoint?: () => SVGPoint }).createSVGPoint = function createSVGPoint() {
    return {
      x: 0,
      y: 0,
      matrixTransform(this: DOMPointInit & { x: number; y: number }) {
        return { x: this.x, y: this.y } as DOMPoint;
      }
    } as unknown as SVGPoint;
  };

  (SVGSVGElement.prototype as unknown as { getScreenCTM?: () => DOMMatrix }).getScreenCTM = () => ({
    a: 1,
    b: 0,
    c: 0,
    d: 1,
    e: 0,
    f: 0,
    inverse() {
      return this as unknown as DOMMatrix;
    }
  }) as unknown as DOMMatrix;
};

const createState = (
  id: string,
  name: string,
  abbreviation: string,
  owner: MinimalState['owner'] = 'player',
): MinimalState => ({
  id,
  name,
  abbreviation,
  owner,
  defense: 6,
  baseDefense: 6,
  baseIP: 5,
  pressure: 0,
});

const createDirectorStyleHotspot = (params: {
  candidate: WeightedHotspotCandidate;
  state: MinimalState;
  currentTurn: number;
  enabledExpansions?: string[];
}): { active: ActiveParanormalHotspot; stateHotspot: EnhancedTestState['paranormalHotspot'] } => {
  const { candidate, state, currentTurn, enabledExpansions = [] } = params;

  const truthResolution = resolveHotspot(state.id, 'truth', {
    stateId: state.id,
    stateAbbreviation: state.abbreviation,
    enabledExpansions,
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
  });
  const label = candidate.name ?? `${state.name} Hotspot`;

  const active: ActiveParanormalHotspot = {
    id: `${candidate.id}:${state.abbreviation}:${currentTurn}`,
    eventId: candidate.id,
    stateId: state.id,
    stateName: state.name,
    stateAbbreviation: state.abbreviation,
    label,
    description: candidate.location,
    icon,
    duration,
    defenseBoost,
    truthReward,
    expiresOnTurn: currentTurn + duration,
    createdOnTurn: currentTurn,
    source: 'neutral',
  };

  return {
    active,
    stateHotspot: {
      id: active.id,
      eventId: active.eventId,
      label: active.label,
      description: active.description,
      icon: active.icon,
      defenseBoost: active.defenseBoost,
      truthReward: active.truthReward,
      expiresOnTurn: active.expiresOnTurn,
      turnsRemaining: duration,
      source: active.source,
    },
  };
};

const waitFor = async (assertion: () => void, timeout = 2000, interval = 20) => {
  const start = Date.now();
  // eslint-disable-next-line no-constant-condition
  while (true) {
    try {
      assertion();
      return;
    } catch (error) {
      if (Date.now() - start > timeout) {
        throw error;
      }
      await new Promise(resolve => setTimeout(resolve, interval));
    }
  }
};

const renderComponent = (element: React.ReactElement) => {
  const container = document.createElement('div');
  document.body.appendChild(container);
  const root: Root = createRoot(container);

  act(() => {
    root.render(element);
  });

  return {
    container,
    rerender: (nextElement: React.ReactElement) => {
      act(() => {
        root.render(nextElement);
      });
    },
    unmount: () => {
      act(() => {
        root.unmount();
      });
      if (container.parentNode) {
        container.parentNode.removeChild(container);
      }
    }
  };
};

let activeCleanup: (() => void) | null = null;

describe('EnhancedUSAMap paranormal hotspots', () => {
  beforeAll(async () => {
    ensureSvgGeometryHelpers();
    (globalThis as { ResizeObserver?: typeof ResizeObserver }).ResizeObserver = class {
      constructor(private readonly callback: ResizeObserverCallback) {
        const contentRect = { width: 975, height: 600 } as DOMRectReadOnly;
        const entry = { contentRect } as ResizeObserverEntry;
        callback([entry], this);
      }
      observe() {}
      unobserve() {}
      disconnect() {}
    } as unknown as typeof ResizeObserver;

    window.matchMedia = vi.fn().mockReturnValue({
      matches: false,
      media: '',
      addListener: vi.fn(),
      removeListener: vi.fn(),
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      dispatchEvent: vi.fn(),
    });

    window.requestAnimationFrame = (cb: FrameRequestCallback): number => setTimeout(() => cb(Date.now()), 0);
    window.cancelAnimationFrame = (id: number) => clearTimeout(id);

    ({ default: EnhancedUSAMap } = await import('../EnhancedUSAMap'));
    const hotspotsModule = await import('@/systems/paranormalHotspots');
    deriveHotspotIcon = hotspotsModule.deriveHotspotIcon;
    resolveHotspot = hotspotsModule.resolveHotspot;
  });

  afterAll(() => {
    restoreDomGlobals();
    if (originalFetch) {
      globalThis.fetch = originalFetch;
    } else {
      delete (globalThis as { fetch?: typeof fetch }).fetch;
    }
  });

  beforeEach(() => {
    globalThis.fetch = vi.fn().mockRejectedValue(new Error('Map fetch blocked for test')) as unknown as typeof fetch;
  });

  afterEach(() => {
    if (activeCleanup) {
      activeCleanup();
      activeCleanup = null;
    }
    vi.restoreAllMocks();
  });

  test('activates director-spawned hotspots, mirrors derived icons, and triggers hotspot effect on id change', async () => {
    const triggerSpy = vi
      .spyOn(VisualEffectsCoordinator, 'triggerParanormalHotspot')
      .mockImplementation(() => {});

    const currentTurn = 7;

    const washington = createState('53', 'Washington', 'WA', 'player');
    const oregon = createState('41', 'Oregon', 'OR', 'ai');
    const california = createState('06', 'California', 'CA', 'neutral');

    const baseWeight = { base: 1, expansion: 0, cryptid: 0 };

    const defaultCandidate: WeightedHotspotCandidate = {
      id: 'ufo-sighting',
      name: 'Cascade Lights',
      kind: 'anomaly',
      location: 'Seattle Skyline',
      intensity: 4,
      status: 'spawning',
      tags: [],
      icon: undefined,
      expansionTag: undefined,
      stateId: washington.id,
      stateName: washington.name,
      stateAbbreviation: washington.abbreviation,
      totalWeight: 1,
      weightBreakdown: baseWeight,
    };

    const cryptidCandidate: WeightedHotspotCandidate = {
      ...defaultCandidate,
      id: 'sasquatch-cam',
      name: 'Forest Footprints',
      location: 'Mt. Hood National Forest',
      tags: ['cryptid-home'],
      stateId: oregon.id,
      stateName: oregon.name,
      stateAbbreviation: oregon.abbreviation,
    };

    const halloweenCandidate: WeightedHotspotCandidate = {
      ...defaultCandidate,
      id: 'spirit-parade',
      name: 'Spirit Parade',
      location: 'Hollywood Hills',
      tags: ['halloween'],
      stateId: california.id,
      stateName: california.name,
      stateAbbreviation: california.abbreviation,
    };

    const washingtonHotspot = createDirectorStyleHotspot({
      candidate: defaultCandidate,
      state: washington,
      currentTurn,
    });
    const oregonHotspot = createDirectorStyleHotspot({
      candidate: cryptidCandidate,
      state: oregon,
      currentTurn,
    });
    const californiaHotspot = createDirectorStyleHotspot({
      candidate: halloweenCandidate,
      state: california,
      currentTurn,
    });

    const states: EnhancedTestState[] = [
      { ...washington, paranormalHotspot: washingtonHotspot.stateHotspot },
      { ...oregon, paranormalHotspot: oregonHotspot.stateHotspot },
      { ...california, paranormalHotspot: californiaHotspot.stateHotspot },
    ];

    const { container, rerender, unmount } = renderComponent(
      <EnhancedUSAMap
        states={states as unknown as any}
        onStateClick={() => {}}
        playerFaction="truth"
      />,
    );

    activeCleanup = unmount;

    await act(async () => {
      await new Promise(resolve => setTimeout(resolve, 0));
    });

    await waitFor(() => {
      const statePaths = container.querySelectorAll('path.state-path');
      expect(statePaths.length).toBeGreaterThanOrEqual(3);
    });

    for (const state of [washington, oregon, california]) {
      await waitFor(() => {
        const path = container.querySelector(`path[data-state-abbr="${state.abbreviation}"]`);
        expect(path).not.toBeNull();
        expect(path?.classList.contains('hotspot-active')).toBe(true);
      });
    }

    await waitFor(() => {
      const hotspotMarkers = container.querySelectorAll('.paranormal-hotspot-marker .paranormal-hotspot-icon');
      expect(hotspotMarkers.length).toBe(3);
    });

    const hotspotIcons = Array.from(
      container.querySelectorAll('.paranormal-hotspot-marker .paranormal-hotspot-icon'),
    ).map(node => node.textContent?.trim());

    expect(hotspotIcons).toEqual(expect.arrayContaining(['🛸', '🦶', '🎃']));

    await waitFor(() => {
      expect(triggerSpy).toHaveBeenCalledTimes(3);
    });

    triggerSpy.mockClear();

    const updatedWashingtonHotspot = createDirectorStyleHotspot({
      candidate: { ...defaultCandidate, id: 'ufo-sighting-v2' },
      state: washington,
      currentTurn: currentTurn + 1,
    });

    const updatedStates: EnhancedTestState[] = [
      { ...states[0], paranormalHotspot: updatedWashingtonHotspot.stateHotspot },
      states[1],
      states[2],
    ];

    rerender(
      <EnhancedUSAMap
        states={updatedStates as unknown as any}
        onStateClick={() => {}}
        playerFaction="truth"
      />,
    );

    await act(async () => {
      await new Promise(resolve => setTimeout(resolve, 0));
    });

    await waitFor(() => {
      expect(triggerSpy).toHaveBeenCalledTimes(1);
    });
  });
});
