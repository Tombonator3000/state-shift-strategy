import { describe, expect, it } from 'bun:test';
import { act, renderHook } from '@testing-library/react';
import { Window as HappyDOMWindow } from 'happy-dom';

import { useCampaignProgress } from '../../src/hooks/useCampaignProgress';

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

describe('useCampaignProgress', () => {
  it('returns new progress state and nested arrays when completing the same mission twice', () => {
    const { result } = renderHook(() => useCampaignProgress());

    const initialProgress = result.current.progress;

    act(() => {
      result.current.completeMission('mission-01', true);
    });

    const afterFirstCompletion = result.current.progress;

    expect(afterFirstCompletion).not.toBe(initialProgress);
    expect(afterFirstCompletion.completedMissions).toEqual(['mission-01']);

    const firstCompletedMissionsRef = afterFirstCompletion.completedMissions;
    const firstUnlockedCardsRef = afterFirstCompletion.unlockedCards;
    const firstUnlockedPersonasRef = afterFirstCompletion.unlockedPersonas;

    act(() => {
      result.current.completeMission('mission-01', true);
    });

    const afterSecondCompletion = result.current.progress;

    expect(afterSecondCompletion).not.toBe(afterFirstCompletion);
    expect(afterSecondCompletion.completedMissions).toEqual(['mission-01']);
    expect(afterSecondCompletion.completedMissions).not.toBe(firstCompletedMissionsRef);
    expect(afterSecondCompletion.unlockedCards).not.toBe(firstUnlockedCardsRef);
    expect(afterSecondCompletion.unlockedPersonas).not.toBe(firstUnlockedPersonasRef);
  });
});
