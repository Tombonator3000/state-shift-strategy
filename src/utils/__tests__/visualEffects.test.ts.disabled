import { beforeEach, afterEach, describe, expect, it } from 'bun:test';
import { isNewspaperBlocked } from '@/components/game/newspaperGate';
import { FXState, playComboGlitchIfAny } from '@/utils/visualEffects';

class MockWindow extends EventTarget {
  innerWidth = 1024;
  innerHeight = 768;

  matchMedia(): MediaQueryList {
    return {
      matches: false,
      media: '',
      onchange: null,
      addListener: () => {},
      removeListener: () => {},
      addEventListener: () => {},
      removeEventListener: () => {},
      dispatchEvent: () => false,
    };
  }

  setTimeout(handler: (...args: unknown[]) => void, timeout?: number): number {
    return globalThis.setTimeout(handler, timeout) as unknown as number;
  }

  clearTimeout(handle?: number): void {
    globalThis.clearTimeout(handle);
  }
}

const ensureCustomEvent = () => {
  if (typeof globalThis.CustomEvent === 'function') {
    return;
  }

  class CustomEventPolyfill<T> extends Event {
    detail: T;

    constructor(event: string, params?: CustomEventInit<T>) {
      super(event, params);
      this.detail = params?.detail as T;
    }
  }

  (globalThis as any).CustomEvent = CustomEventPolyfill;
};

describe('playComboGlitchIfAny', () => {
  beforeEach(() => {
    ensureCustomEvent();
    const mockWindow = new MockWindow();
    (globalThis as any).window = mockWindow;
    (globalThis as any).document = undefined;
    FXState.__internalSetActive?.(false);
  });

  afterEach(() => {
    delete (globalThis as any).window;
    delete (globalThis as any).document;
    FXState.__internalSetActive?.(false);
  });

  it('resolves immediately when no combos are present', async () => {
    const windowMock = globalThis.window as unknown as EventTarget;
    let glitchEventFired = false;
    windowMock.addEventListener('comboGlitch', () => {
      glitchEventFired = true;
    });

    await playComboGlitchIfAny({ combos: [], magnitude: 0, messages: [] });

    expect(glitchEventFired).toBe(false);
  });

  it('waits for comboGlitchComplete before resolving', async () => {
    const windowMock = globalThis.window as unknown as EventTarget;
    let resolved = false;

    const promise = playComboGlitchIfAny({ combos: ['Chain'], magnitude: 3, messages: [] });
    void promise.then(() => {
      resolved = true;
    });

    await Promise.resolve();
    expect(resolved).toBe(false);

    windowMock.dispatchEvent(new Event('comboGlitchComplete'));
    await promise;

    expect(resolved).toBe(true);
  });
});

describe('Tabloid newspaper gate', () => {
  it('reports blocked status when a glitch is active', () => {
    FXState.__internalSetActive?.(true);
    expect(isNewspaperBlocked()).toBe(true);
    FXState.__internalSetActive?.(false);
  });
});
