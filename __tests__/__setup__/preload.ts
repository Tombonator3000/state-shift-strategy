// Bun test preload. Installs happy-dom globals BEFORE any test module is
// evaluated, so @testing-library/react/dom can capture a valid document.body
// at module init time.
import { Window } from 'happy-dom';

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

// Static imports run before the setup above. Await real modules only AFTER DOM
// and storage exist, then capture their bindings before any test can mock them.
const realApplyEffectsMvp = await import('../../src/engine/applyEffects-mvp');
const realComboEngine = await import('../../src/game/comboEngine');
const realUseCardCollection = await import('../../src/hooks/useCardCollection');
(globalThis as typeof globalThis & {
  __TEST_REAL_MODULES__?: Record<string, unknown>;
}).__TEST_REAL_MODULES__ = {
  applyEffectsMvp: { ...realApplyEffectsMvp },
  comboEngine: { ...realComboEngine },
  useCardCollection: { ...realUseCardCollection },
};
