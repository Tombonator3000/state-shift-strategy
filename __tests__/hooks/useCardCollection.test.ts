import { describe, expect, it, mock } from 'bun:test';
import { renderHook } from '@testing-library/react';
import { Window as HappyDOMWindow } from 'happy-dom';

type MutableGlobal = typeof globalThis & {
  window?: Window & typeof globalThis;
  document?: Document;
  navigator?: Navigator;
};

const happyDom = new HappyDOMWindow();
const mutableGlobal = globalThis as MutableGlobal;

mutableGlobal.window = happyDom as unknown as Window & typeof globalThis;
mutableGlobal.document = happyDom.document;
mutableGlobal.navigator = happyDom.navigator;

mock.module('@/data/cardDatabase', () => ({
  CARD_DATABASE: []
}));

describe('useCardCollection', () => {
  it('returns a finite completion percentage and logs a warning when the database is empty', async () => {
    const warnSpy = mock.spy(console, 'warn');

    const { useCardCollection } = await import('../../src/hooks/useCardCollection');
    const { result } = renderHook(() => useCardCollection());

    const stats = result.current.getCollectionStats();

    expect(stats.totalCards).toBe(0);
    expect(stats.completionPercentage).toBe(0);
    expect(Number.isFinite(stats.completionPercentage)).toBe(true);
    expect(
      warnSpy.mock.calls.some(([message]) => typeof message === 'string' && message.includes('Card database is empty'))
    ).toBe(true);

    warnSpy.mockRestore();
  });
});
