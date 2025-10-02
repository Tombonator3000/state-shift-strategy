import React, { useEffect } from 'react';
import { afterAll, afterEach, beforeAll, beforeEach, describe, expect, test } from 'bun:test';
import { cleanup, render, waitFor } from '@testing-library/react';
import { JSDOM } from 'jsdom';

import type { GameState } from '@/hooks/gameStateTypes';
import {
  HotspotDirector,
  deriveHotspotIcon,
  resolveHotspot,
  type WeightedHotspotCandidate,
} from '@/systems/paranormalHotspots';

type MinimalState = Pick<NonNullable<GameState['states']>[number], 'id' | 'name' | 'abbreviation' | 'owner' | 'defense' | 'baseDefense' | 'baseIP' | 'pressure'>;

const dom = new JSDOM('<!doctype html><html><body></body></html>', { url: 'http://localhost' });
const { window } = dom;

const originalWindow = globalThis.window;
const originalDocument = globalThis.document;
const originalNavigator = globalThis.navigator;

const originalFetch = globalThis.fetch;

const installDomGlobals = () => {
  (globalThis as typeof globalThis & { window: Window; document: Document; navigator: Navigator }).window = window as unknown as Window;
  globalThis.document = window.document as unknown as Document;
  globalThis.navigator = window.navigator as unknown as Navigator;

  (globalThis as unknown as { HTMLElement: typeof HTMLElement }).HTMLElement = window.HTMLElement as unknown as typeof HTMLElement;
  (globalThis as unknown as { SVGElement: typeof SVGElement }).SVGElement = window.SVGElement as unknown as typeof SVGElement;
  (globalThis as unknown as { SVGSVGElement: typeof SVGSVGElement }).SVGSVGElement = window.SVGSVGElement as unknown as typeof SVGSVGElement;
  (globalThis as unknown as { Element: typeof Element }).Element = window.Element as unknown as typeof Element;
};

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
};

type HarnessProps = {
  state: MinimalState & {
    paranormalHotspot?: {
      icon?: string;
      id: string;
    };
  };
};

const TestMapHarness: React.FC<HarnessProps> = ({ state }) => {
  useEffect(() => {
    const svg = document.getElementById('harness-map') as SVGSVGElement | null;
    if (!svg) {
      return;
    }

    svg.innerHTML = '';

    const pathElement = document.createElementNS('http://www.w3.org/2000/svg', 'path');
    let classes = `state-path ${state.owner}`;
    if (state.paranormalHotspot) {
      classes += ' hotspot-active';
    }
    pathElement.setAttribute('class', classes);
    pathElement.setAttribute('data-state-id', state.abbreviation);
    pathElement.setAttribute('data-state-abbr', state.abbreviation);
    svg.appendChild(pathElement);

    if (state.paranormalHotspot) {
      const iconNode = document.createElementNS('http://www.w3.org/2000/svg', 'text');
      iconNode.setAttribute('class', 'paranormal-hotspot-icon');
      iconNode.textContent = state.paranormalHotspot.icon ?? '';
      svg.appendChild(iconNode);
    }
  }, [state]);

  return <svg id="harness-map" />;
};

describe('EnhancedUSAMap hotspot harness', () => {
  beforeAll(() => {
    installDomGlobals();
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
    cleanup();
  });

  afterEach(() => {
    cleanup();
  });

  test('applies hotspot-active styling and icon when director spawns a hotspot', async () => {
    const director = new HotspotDirector();
    const baseState: MinimalState = {
      id: '53',
      name: 'Washington',
      abbreviation: 'WA',
      owner: 'player',
      defense: 6,
      baseDefense: 6,
      baseIP: 5,
      pressure: 0,
    };

    const directorGameState: Pick<GameState, 'states' | 'paranormalHotspots'> = {
      states: [baseState] as unknown as GameState['states'],
      paranormalHotspots: {} as GameState['paranormalHotspots'],
    };

    const candidate = director.rollForSpawn(1, directorGameState, { rng: () => 0 });
    expect(candidate).not.toBeNull();

    const hotspotCandidate = candidate as WeightedHotspotCandidate;
    const truthResolution = resolveHotspot(baseState.id, 'truth', {
      stateId: baseState.id,
      stateAbbreviation: baseState.abbreviation,
      enabledExpansions: [],
    });

    const intensity = typeof hotspotCandidate.intensity === 'number' && Number.isFinite(hotspotCandidate.intensity)
      ? hotspotCandidate.intensity
      : 3;
    const defenseBoost = Math.max(1, Math.round(intensity / 2));
    const duration = Math.max(2, Math.min(4, Math.round(intensity / 2) + 1));
    const truthReward = Math.max(1, Math.round(Math.abs(truthResolution.truthDelta)));
    const icon = deriveHotspotIcon({
      icon: hotspotCandidate.icon,
      tags: hotspotCandidate.tags,
      expansionTag: hotspotCandidate.expansionTag,
    });

    const enhancedState = {
      ...baseState,
      paranormalHotspot: {
        id: hotspotCandidate.id,
        icon,
        defenseBoost,
        truthReward,
        expiresOnTurn: duration + 1,
        turnsRemaining: duration,
        source: 'neutral' as const,
      },
    };

    const { container } = render(<TestMapHarness state={enhancedState} />);

    await waitFor(() => {
      const pathElement = container.querySelector('path[data-state-abbr="WA"]');
      expect(pathElement).not.toBeNull();
      expect(pathElement?.classList.contains('hotspot-active')).toBe(true);
    });

    await waitFor(() => {
      const iconNode = container.querySelector('.paranormal-hotspot-icon');
      expect(iconNode).not.toBeNull();
      expect(iconNode?.textContent?.trim()).toBe(icon);
    });
  });
});
