import { afterEach, beforeEach, describe, expect, it, mock } from 'bun:test';
import React from 'react';
import TestRenderer, { act } from 'react-test-renderer';
import type { ReactTestRenderer } from 'react-test-renderer';
import { Window as HappyWindow } from 'happy-dom';

import { usePressArchive } from '../usePressArchive';

type MutableGlobal = typeof globalThis & {
  window?: Window & typeof globalThis;
  document?: Document;
  navigator?: Navigator;
  HTMLElement?: typeof HTMLElement;
  CustomEvent?: typeof CustomEvent;
  Event?: typeof Event;
};

type HookResult<T> = {
  current: T | undefined;
};

const getMutableGlobal = (): MutableGlobal => globalThis as MutableGlobal;

let originalWindow: (Window & typeof globalThis) | undefined;
let originalDocument: Document | undefined;
let originalNavigator: Navigator | undefined;
let originalHTMLElement: typeof HTMLElement | undefined;
let originalCustomEvent: typeof CustomEvent | undefined;
let originalEvent: typeof Event | undefined;
let originalConsoleWarn: typeof console.warn;

const renderHook = async <T,>(callback: () => T) => {
  const result: HookResult<T> = { current: undefined };

  const TestComponent = () => {
    result.current = callback();
    return null;
  };

  let renderer: ReactTestRenderer;

  await act(async () => {
    renderer = TestRenderer.create(React.createElement(TestComponent));
  });

  return {
    result: result as { current: T },
    unmount: () => renderer.unmount(),
  };
};

beforeEach(() => {
  const globalRef = getMutableGlobal();
  originalWindow = globalRef.window;
  originalDocument = globalRef.document;
  originalNavigator = globalRef.navigator;
  originalHTMLElement = globalRef.HTMLElement;
  originalCustomEvent = globalRef.CustomEvent;
  originalEvent = globalRef.Event;
  originalConsoleWarn = console.warn;

  const happyWindow = new HappyWindow();
  globalRef.window = happyWindow as unknown as Window & typeof globalThis;
  globalRef.document = happyWindow.document;
  globalRef.navigator = happyWindow.navigator;
  globalRef.HTMLElement = happyWindow.HTMLElement;
  globalRef.CustomEvent = happyWindow.CustomEvent;
  globalRef.Event = happyWindow.Event;
});

afterEach(() => {
  const globalRef = getMutableGlobal();
  if (originalWindow) {
    globalRef.window = originalWindow;
  } else {
    delete globalRef.window;
  }

  if (originalDocument) {
    globalRef.document = originalDocument;
  } else {
    delete globalRef.document;
  }

  if (originalNavigator) {
    globalRef.navigator = originalNavigator;
  } else {
    delete globalRef.navigator;
  }

  if (originalHTMLElement) {
    globalRef.HTMLElement = originalHTMLElement;
  } else {
    delete globalRef.HTMLElement;
  }

  if (originalCustomEvent) {
    globalRef.CustomEvent = originalCustomEvent;
  } else {
    delete globalRef.CustomEvent;
  }

  if (originalEvent) {
    globalRef.Event = originalEvent;
  } else {
    delete globalRef.Event;
  }

  console.warn = originalConsoleWarn;
});

describe('usePressArchive', () => {
  it('returns an empty archive when localStorage throws', async () => {
    const warn = mock(() => {});
    console.warn = warn;

    const failingStorage = {
      getItem: () => {
        throw new Error('blocked');
      },
      setItem: () => {
        throw new Error('blocked');
      },
      removeItem: () => {
        throw new Error('blocked');
      },
      clear: () => {
        /* noop */
      },
      key: () => null,
      length: 0,
    } as unknown as Storage;

    const globalRef = getMutableGlobal();
    Object.defineProperty(globalRef.window!, 'localStorage', {
      configurable: true,
      value: failingStorage,
    });

    const { result } = await renderHook(() => usePressArchive());

    expect(result.current.issues).toEqual([]);
    expect(result.current.agendaMoments).toEqual([]);
    expect(warn.mock.calls.length).toBeGreaterThan(0);
  });
});
