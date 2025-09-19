import { afterEach, beforeEach, describe, expect, it } from 'bun:test';
import type { Extension } from '@/data/extensionSystem';

type FetchType = typeof globalThis.fetch;

function createMockLocalStorage(): Storage {
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
}

describe('extension persistence', () => {
  let originalLocalStorage: Storage | undefined;
  let originalFetch: FetchType | undefined;

  beforeEach(() => {
    originalLocalStorage = globalThis.localStorage;
    (globalThis as any).localStorage = createMockLocalStorage();

    originalFetch = globalThis.fetch;
    globalThis.fetch = async () => new Response('Not found', { status: 404 });
  });

  afterEach(() => {
    if (originalLocalStorage === undefined) {
      delete (globalThis as any).localStorage;
    } else {
      globalThis.localStorage = originalLocalStorage;
    }

    if (originalFetch) {
      globalThis.fetch = originalFetch;
    } else {
      delete (globalThis as any).fetch;
    }
  });

  it('restores stored cards for enabled local extensions during initialization', async () => {
    const { ExtensionManager } = await import('@/data/extensionSystem');

    const firstSessionManager = new ExtensionManager();
    const localExtension: Extension = {
      id: 'local-ext',
      name: 'Local Extension',
      version: '1.0.0',
      author: 'Test Author',
      description: 'Ensures local extensions persist across sessions.',
      factions: ['truth'],
      count: 1,
      cards: [
        {
          id: 'local-card-1',
          name: 'Local Signal',
          type: 'MEDIA',
          faction: 'truth',
          rarity: 'common',
          cost: 3,
          text: 'Gain 2 truth.',
          effects: { truthDelta: 2 },
        },
      ],
    };

    firstSessionManager.enableExtension(localExtension, 'file');
    expect(firstSessionManager.getAllExtensionCards()).toHaveLength(1);

    const restartedManager = new ExtensionManager();
    expect(restartedManager.getAllExtensionCards()).toHaveLength(0);

    await restartedManager.initializeExtensions();

    const restoredCards = restartedManager.getAllExtensionCards();
    expect(restoredCards).toHaveLength(1);
    expect(restoredCards[0]?.id).toBe('local-card-1');
    expect(restoredCards[0]?.extId).toBe(localExtension.id);
    expect(restartedManager.isExtensionEnabled(localExtension.id)).toBe(true);
  });
});
