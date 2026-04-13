// happy-dom globals come from the bun:test preload (see
// __tests__/__setup__/preload.ts referenced from bunfig.toml).
import { describe, expect, it, mock, spyOn } from 'bun:test';
import { renderHook } from '@testing-library/react';

mock.module('@/data/cardDatabase', () => ({
  CARD_DATABASE: []
}));

describe('useCardCollection', () => {
  it('returns a finite completion percentage and logs a warning when the database is empty', async () => {
    const warnSpy = spyOn(console, 'warn');

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
