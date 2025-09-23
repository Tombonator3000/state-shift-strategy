import { afterAll, describe, expect, it } from 'bun:test';
import type { InitGameConfig } from '@/hooks/initGame';
import type { GameState } from '@/hooks/gameStateTypes';
import type { AIDifficulty } from '@/data/aiStrategy';
import { DEFAULT_DRAW_MODE } from '@/state/settings';

class LocalStorageMock implements Storage {
  private store = new Map<string, string>();

  get length(): number {
    return this.store.size;
  }

  clear(): void {
    this.store.clear();
  }

  getItem(key: string): string | null {
    return this.store.has(key) ? this.store.get(key) ?? null : null;
  }

  key(index: number): string | null {
    return Array.from(this.store.keys())[index] ?? null;
  }

  removeItem(key: string): void {
    this.store.delete(key);
  }

  setItem(key: string, value: string): void {
    this.store.set(key, value);
  }
}

const originalStorage = (globalThis as { localStorage?: Storage }).localStorage;
const bootstrapStorage = new LocalStorageMock();
(globalThis as { localStorage?: Storage }).localStorage = bootstrapStorage as Storage;

const { initGame } = await import('@/hooks/initGame');

afterAll(() => {
  if (originalStorage === undefined) {
    // eslint-disable-next-line @typescript-eslint/no-dynamic-delete
    delete (globalThis as { localStorage?: Storage }).localStorage;
  } else {
    globalThis.localStorage = originalStorage;
  }
});

describe('initGame', () => {
  it('falls back to the standard draw mode when saved settings are invalid JSON', () => {
    bootstrapStorage.clear();
    bootstrapStorage.setItem('gameSettings', '{"drawMode":invalid');

    const achievements = {
      onGameStart: () => {
        /* noop for test */
      },
      manager: {
        onNewGameStart: () => {
          /* noop for test */
        },
      },
    } satisfies InitGameConfig['achievements'];

    const aiDifficulty: AIDifficulty = 'medium';
    let resultingState: GameState | undefined;
    const setGameState: InitGameConfig['setGameState'] = updater => {
      const previousState = {} as GameState;
      resultingState = typeof updater === 'function'
        ? updater(previousState)
        : updater;
    };

    const originalWarn = console.warn;
    const warnings: unknown[][] = [];
    console.warn = (...args: unknown[]) => {
      warnings.push(args);
    };

    const savedSettings = bootstrapStorage.getItem('gameSettings');

    expect(() => initGame({
      faction: 'truth',
      aiDifficulty,
      achievements,
      setGameState,
      savedSettings,
    })).not.toThrow();

    console.warn = originalWarn;
    bootstrapStorage.clear();

    expect(resultingState?.drawMode).toBe(DEFAULT_DRAW_MODE);
    const cardsDrawnLog = resultingState?.log.find(entry => entry.startsWith('Cards drawn:'));
    expect(cardsDrawnLog).toBeDefined();
    expect(cardsDrawnLog).toContain(`(${DEFAULT_DRAW_MODE} mode)`);
    expect(warnings.length).toBeGreaterThan(0);
  });
});
