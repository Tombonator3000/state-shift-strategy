import { afterEach, describe, expect, it, mock } from 'bun:test';
import { safeGetLocalStorageItem, safeSetLocalStorageItem } from '../src/utils/storage';

type MutableGlobal = typeof globalThis & {
  window?: Window & typeof globalThis;
};

const getMutableGlobal = (): MutableGlobal => globalThis as MutableGlobal;

const originalWindow = getMutableGlobal().window;

afterEach(() => {
  const globalRef = getMutableGlobal();
  if (originalWindow === undefined) {
    delete globalRef.window;
  } else {
    globalRef.window = originalWindow;
  }
});

describe('safe localStorage helpers', () => {
  it('returns null when window is not available', () => {
    const globalRef = getMutableGlobal();
    delete globalRef.window;

    expect(safeGetLocalStorageItem('missing')).toBeNull();
    expect(safeSetLocalStorageItem('missing', 'value')).toBe(false);
  });

  it('reads and writes when localStorage is available', () => {
    const store = new Map<string, string>();
    const fakeWindow = {
      localStorage: {
        getItem: (key: string) => store.get(key) ?? null,
        setItem: (key: string, value: string) => {
          store.set(key, value);
        },
        clear: () => {
          store.clear();
        },
        removeItem: (key: string) => {
          store.delete(key);
        },
        key: (index: number) => Array.from(store.keys())[index] ?? null,
        length: 0,
      },
    } as unknown as Window & typeof globalThis;

    const globalRef = getMutableGlobal();
    globalRef.window = fakeWindow;

    expect(safeSetLocalStorageItem('alpha', 'bravo')).toBe(true);
    expect(safeGetLocalStorageItem('alpha')).toBe('bravo');
  });

  it('swallows getItem errors and logs a warning', () => {
    const warn = mock(() => {});
    const logger: Pick<Console, 'warn'> = { warn };
    const error = new Error('blocked');
    const fakeWindow = {
      localStorage: {
        getItem: () => {
          throw error;
        },
      },
    } as unknown as Window & typeof globalThis;

    const globalRef = getMutableGlobal();
    globalRef.window = fakeWindow;

    expect(safeGetLocalStorageItem('alpha', { logger })).toBeNull();
    expect(warn.mock.calls.length).toBe(1);
  });

  it('swallows setItem errors and logs a warning', () => {
    const warn = mock(() => {});
    const logger: Pick<Console, 'warn'> = { warn };
    const error = new Error('denied');
    const fakeWindow = {
      localStorage: {
        setItem: () => {
          throw error;
        },
      },
    } as unknown as Window & typeof globalThis;

    const globalRef = getMutableGlobal();
    globalRef.window = fakeWindow;

    expect(safeSetLocalStorageItem('alpha', 'bravo', { logger })).toBe(false);
    expect(warn.mock.calls.length).toBe(1);
  });
});
