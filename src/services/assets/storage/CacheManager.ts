const FALLBACK_TTL = 1000 * 60 * 60; // 1 hour

type CacheEntry<T> = {
  value: T;
  expiresAt: number;
};

const memoryCache = new Map<string, CacheEntry<unknown>>();

const isBrowser = () => typeof window !== 'undefined' && typeof window.document !== 'undefined';

function storageKey(namespace: string, key: string) {
  return `shadowgov:cache:${namespace}:${key}`;
}

export class CacheManager<T = unknown> {
  constructor(private namespace: string) {}

  private getStorage(): Storage | null {
    if (!isBrowser()) {
      return null;
    }

    try {
      return window.localStorage;
    } catch {
      return null;
    }
  }

  get(key: string): T | undefined {
    const storage = this.getStorage();
    const now = Date.now();

    if (storage) {
      try {
        const raw = storage.getItem(storageKey(this.namespace, key));
        if (raw) {
          const parsed = JSON.parse(raw) as CacheEntry<T>;
          if (parsed.expiresAt > now) {
            return parsed.value;
          }
          storage.removeItem(storageKey(this.namespace, key));
        }
      } catch (error) {
        console.warn(`[CacheManager:${this.namespace}] Failed to read item`, error);
      }
    }

    const memoryKey = storageKey(this.namespace, key);
    const entry = memoryCache.get(memoryKey) as CacheEntry<T> | undefined;
    if (entry) {
      if (entry.expiresAt > now) {
        return entry.value;
      }
      memoryCache.delete(memoryKey);
    }

    return undefined;
  }

  set(key: string, value: T, ttl: number = FALLBACK_TTL) {
    const entry: CacheEntry<T> = {
      value,
      expiresAt: Date.now() + Math.max(1000, ttl),
    };

    const storage = this.getStorage();
    const serialized = JSON.stringify(entry);

    if (storage) {
      try {
        storage.setItem(storageKey(this.namespace, key), serialized);
      } catch (error) {
        console.warn(`[CacheManager:${this.namespace}] Failed to persist item`, error);
      }
    }

    memoryCache.set(storageKey(this.namespace, key), entry);
  }

  clear(key?: string) {
    const storage = this.getStorage();
    if (key) {
      const fullKey = storageKey(this.namespace, key);
      if (storage) {
        storage.removeItem(fullKey);
      }
      memoryCache.delete(fullKey);
      return;
    }

    const prefix = storageKey(this.namespace, '');
    if (storage) {
      const toDelete: string[] = [];
      for (let i = 0; i < storage.length; i += 1) {
        const storageKeyItem = storage.key(i);
        if (storageKeyItem && storageKeyItem.startsWith(prefix)) {
          toDelete.push(storageKeyItem);
        }
      }
      toDelete.forEach(keyToRemove => storage.removeItem(keyToRemove));
    }

    for (const keyEntry of memoryCache.keys()) {
      if (keyEntry.startsWith(prefix)) {
        memoryCache.delete(keyEntry);
      }
    }
  }
}
