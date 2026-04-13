// Bun test preload. Installs happy-dom globals BEFORE any test module is
// evaluated, so @testing-library/react/dom can capture a valid document.body
// at module init time.
import { Window } from 'happy-dom';
import * as realApplyEffectsMvp from '../../src/engine/applyEffects-mvp';
import * as realComboEngine from '../../src/game/comboEngine';
import * as realUseCardCollection from '../../src/hooks/useCardCollection';

// Stash the genuine implementations BEFORE any test file gets a chance to
// install bun:test module mocks. We capture the function references by value
// (not the live module namespace) because ES module bindings are live —
// reading `.applyEffectsMvp` from the namespace AFTER a mock would yield the
// mocked function and cause infinite recursion.
(globalThis as typeof globalThis & {
  __TEST_REAL_MODULES__?: Record<string, unknown>;
}).__TEST_REAL_MODULES__ = {
  applyEffectsMvp: { ...realApplyEffectsMvp },
  comboEngine: { ...realComboEngine },
  useCardCollection: { ...realUseCardCollection },
};

const happyWindow = new Window();
const globalRecord = globalThis as typeof globalThis & Record<string, unknown>;
const propagateKeys = Object.getOwnPropertyNames(happyWindow).filter(
  key => !(key in globalRecord),
);
for (const key of propagateKeys) {
  globalRecord[key] = (happyWindow as Record<string, unknown>)[key];
}

const globalWithDom = globalThis as typeof globalThis & {
  window: Window;
  document: typeof happyWindow.document;
  navigator: typeof happyWindow.navigator;
  HTMLElement: typeof happyWindow.HTMLElement;
  Node: typeof happyWindow.Node;
};

globalWithDom.window = happyWindow;
globalWithDom.document = happyWindow.document;
globalWithDom.navigator = happyWindow.navigator;
globalWithDom.HTMLElement = happyWindow.HTMLElement;
globalWithDom.Node = happyWindow.Node;

// Minimal localStorage shim so modules that touch persistent storage at import
// time (see src/data/extensionSystem.ts) don't crash the suite.
if (typeof globalThis.localStorage === 'undefined') {
  const store = new Map<string, string>();
  Object.defineProperty(globalThis, 'localStorage', {
    value: {
      getItem: (key: string) => (store.has(key) ? store.get(key) ?? null : null),
      setItem: (key: string, value: string) => {
        store.set(key, value);
      },
      removeItem: (key: string) => {
        store.delete(key);
      },
      clear: () => {
        store.clear();
      },
      key: (index: number) => Array.from(store.keys())[index] ?? null,
      get length() {
        return store.size;
      },
    },
    writable: true,
  });
}
