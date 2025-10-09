import { afterEach, describe, expect, it } from 'bun:test';
import React from 'react';
import TestRenderer, { act } from 'react-test-renderer';
import type { ReactTestRenderer } from 'react-test-renderer';

import { useParapediaEntries, useParapediaStatePayload } from '../useParapediaEntries';

type HookResult<T> = {
  current: T | undefined;
};

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

describe('useParapediaEntries', () => {
  let unmount: (() => void) | undefined;

  afterEach(() => {
    if (unmount) {
      unmount();
      unmount = undefined;
    }
  });

  it('returns categories and trending data sorted by entry count', async () => {
    const hook = await renderHook(() => useParapediaEntries());
    unmount = hook.unmount;

    const { categories, landingData } = hook.result.current;
    expect(categories).toEqual(['cryptid', 'ufo', 'haunting', 'conspiracy']);
    expect(landingData.trendingCategories[0]).toEqual({ category: 'cryptid', count: 3 });
    expect(landingData.trendingCategories.map(item => item.category)).toEqual(['cryptid', 'ufo', 'haunting']);
  });

  it('filters search results by category and query', async () => {
    const hook = await renderHook(() => useParapediaEntries());
    unmount = hook.unmount;

    const { queryEntries } = hook.result.current;
    const results = queryEntries('relay', { category: 'cryptid' });
    expect(results.map(entry => entry.id)).toContain('wa-bigfoot-1974');
    expect(results.every(entry => entry.category === 'cryptid')).toBe(true);
  });
});

describe('useParapediaStatePayload', () => {
  it('returns summary and entries for a selected state', async () => {
    const { result, unmount } = await renderHook(() => useParapediaStatePayload('NM'));
    expect(result.current?.summary.stateId).toBe('NM');
    expect(result.current?.entries.length).toBeGreaterThan(0);
    unmount();
  });

  it('returns null when state is unknown', async () => {
    const { result, unmount } = await renderHook(() => useParapediaStatePayload('XX'));
    expect(result.current).toBeNull();
    unmount();
  });
});
