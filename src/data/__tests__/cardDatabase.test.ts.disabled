import { beforeAll, afterAll, describe, expect, it } from 'bun:test';

type GetRandomCards = typeof import('@/data/cardDatabase').getRandomCards;

let getRandomCards: GetRandomCards;
let originalLocalStorage: Storage | undefined;

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

describe('getRandomCards', () => {
  beforeAll(async () => {
    originalLocalStorage = globalThis.localStorage;
    (globalThis as any).localStorage = createMockLocalStorage();

    ({ getRandomCards } = await import('@/data/cardDatabase'));
  });

  afterAll(() => {
    if (originalLocalStorage === undefined) {
      delete (globalThis as any).localStorage;
    } else {
      globalThis.localStorage = originalLocalStorage;
    }
  });

  it('returns unique cards until the pool is exhausted', () => {
    const originalRandom = Math.random;
    const sequence = [0, 0, 0, 0];
    let callCount = 0;

    Math.random = () => sequence[callCount++] ?? 0;

    try {
      const cards = getRandomCards(5, { faction: 'truth' });
      expect(cards).toHaveLength(3);

      const uniqueIds = new Set(cards.map(card => card.id));
      expect(uniqueIds.size).toBe(cards.length);
    } finally {
      Math.random = originalRandom;
    }
  });
});
