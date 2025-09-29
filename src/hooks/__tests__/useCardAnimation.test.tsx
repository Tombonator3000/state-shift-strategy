import React from 'react';
import { describe, it, expect, beforeEach, afterEach } from 'bun:test';
import TestRenderer, { act } from 'react-test-renderer';
import { useCardAnimation, type PlayResult } from '../useCardAnimation';
import type { GameCard } from '@/rules/mvp';

type Rect = { x: number; y: number; width: number; height: number };

const createRect = (x: number, y: number, width: number, height: number): Rect => ({
  x,
  y,
  width,
  height,
});

class MockElement {
  id?: string;
  dataset: Record<string, string> = {};
  style: Record<string, string> = {};
  parent: MockElement | null = null;
  children: MockElement[] = [];
  private rect: Rect;
  private classSet = new Set<string>();
  private attributes: Record<string, string> = {};

  constructor(rect: Rect) {
    this.rect = rect;
  }

  appendChild(child: MockElement) {
    child.parent = this;
    this.children.push(child);
    return child;
  }

  removeChild(child: MockElement) {
    const index = this.children.indexOf(child);
    if (index >= 0) {
      this.children.splice(index, 1);
      child.parent = null;
    }
  }

  remove() {
    if (this.parent) {
      this.parent.removeChild(this);
    }
  }

  setAttribute(name: string, value: string) {
    this.attributes[name] = value;
    if (name === 'id') {
      this.id = value;
    }
    if (name.startsWith('data-')) {
      const key = name
        .slice(5)
        .replace(/-([a-z])/g, (_, letter: string) => letter.toUpperCase());
      this.dataset[key] = value;
    }
  }

  getBoundingClientRect() {
    const { x, y, width, height } = this.rect;
    return {
      x,
      y,
      width,
      height,
      left: x,
      top: y,
      right: x + width,
      bottom: y + height,
      toJSON() {
        return { x, y, width, height };
      },
    } as DOMRect;
  }

  cloneNode() {
    const clone = new MockElement(this.rect);
    clone.dataset = { ...this.dataset };
    clone.style = { ...this.style };
    return clone;
  }

  get classList() {
    return {
      add: (value: string) => {
        this.classSet.add(value);
      },
      remove: (value: string) => {
        this.classSet.delete(value);
      },
    };
  }
}

describe('useCardAnimation', () => {
  let originalWindow: typeof globalThis.window | undefined;
  let originalDocument: typeof globalThis.document | undefined;
  let renderer: TestRenderer.ReactTestRenderer | null = null;
  let cardElement: MockElement;
  let playedPile: MockElement;
  let cardLayer: MockElement;
  let mapContainer: MockElement;

  const elementsById = new Map<string, MockElement>();
  const dataCardElements = new Map<string, MockElement>();

  const createMockElement = (rect: Rect) => new MockElement(rect);

  beforeEach(() => {
    originalWindow = globalThis.window;
    originalDocument = globalThis.document;

    const eventTarget = new EventTarget();
    const mockWindow = {
      matchMedia: (query: string) => ({
        matches: true,
        media: query,
        onchange: null,
        addListener: () => {},
        removeListener: () => {},
        addEventListener: () => {},
        removeEventListener: () => {},
        dispatchEvent: () => false,
      }),
      addEventListener: eventTarget.addEventListener.bind(eventTarget),
      removeEventListener: eventTarget.removeEventListener.bind(eventTarget),
      dispatchEvent: eventTarget.dispatchEvent.bind(eventTarget),
    } as unknown as Window;

    const body = createMockElement(createRect(0, 0, 800, 600));
    Object.defineProperty(body, 'innerHTML', {
      get: () => '',
      set: () => {
        body.children.splice(0, body.children.length);
      },
    });

    const mockDocument = {
      body,
      createElement: (tag: string) => createMockElement(createRect(0, 0, 0, 0)),
      querySelector: (selector: string) => {
        const match = selector.match(/\[data-card-id="(.+)"\]/);
        if (match) {
          return dataCardElements.get(match[1]) ?? null;
        }
        return null;
      },
      querySelectorAll: () => [] as unknown as NodeListOf<Element>,
      getElementById: (id: string) => elementsById.get(id) ?? null,
    } as unknown as Document;

    globalThis.window = mockWindow;
    globalThis.document = mockDocument;

    cardLayer = createMockElement(createRect(0, 0, 0, 0));
    cardLayer.id = 'card-play-layer';
    elementsById.set('card-play-layer', cardLayer);
    body.appendChild(cardLayer);

    mapContainer = createMockElement(createRect(100, 100, 400, 400));
    mapContainer.id = 'map-container';
    elementsById.set('map-container', mapContainer);
    body.appendChild(mapContainer);

    playedPile = createMockElement(createRect(600, 100, 300, 300));
    playedPile.id = 'played-pile';
    elementsById.set('played-pile', playedPile);
    body.appendChild(playedPile);

    cardElement = createMockElement(createRect(10, 10, 200, 280));
    cardElement.dataset.cardId = 'test-card';
    dataCardElements.set('test-card', cardElement);
    body.appendChild(cardElement);
  });

  afterEach(() => {
    if (renderer) {
      renderer.unmount();
      renderer = null;
    }

    if (originalWindow) {
      globalThis.window = originalWindow;
    } else {
      delete (globalThis as Record<string, unknown>).window;
    }

    if (originalDocument) {
      globalThis.document = originalDocument;
    } else {
      delete (globalThis as Record<string, unknown>).document;
    }

    elementsById.clear();
    dataCardElements.clear();
  });

  it('dispatches counter effects when the resolver flags the play as countered', async () => {
    const card: GameCard = {
      id: 'test-card',
      name: 'Mock Counter Test',
      type: 'ATTACK',
      faction: 'truth',
      cost: 2,
      effects: { ipDelta: { opponent: 2 } },
    };

    cardElement.dataset.cardData = JSON.stringify(card);

    let animationApi: ReturnType<typeof useCardAnimation> | null = null;
    const Wrapper = () => {
      animationApi = useCardAnimation();
      return null;
    };

    await act(async () => {
      renderer = TestRenderer.create(<Wrapper />);
    });

    if (!animationApi) {
      throw new Error('Failed to initialize animation hook');
    }

    const events: Array<{ type: string }> = [];
    const handler = (event: Event) => {
      const detail = (event as CustomEvent).detail;
      if (detail) {
        events.push(detail);
      }
    };
    window.addEventListener('cardDeployed', handler);

    let result: PlayResult | null = null;
    await act(async () => {
      result = await animationApi!.animatePlayCard(card.id, card, {
        onResolve: async () => ({ countered: true }),
      });
    });

    window.removeEventListener('cardDeployed', handler);

    expect(result?.countered).toBe(true);
    expect(result?.cancelled).toBe(false);
    expect(events.at(-1)?.type).toBe('counter');
    expect(playedPile.children.length).toBeGreaterThanOrEqual(1);
  });
});
