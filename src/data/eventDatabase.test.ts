import { afterEach, describe, expect, it } from 'bun:test';

import { featureFlags } from '@/state/featureFlags';

import type { GameEvent } from './eventDatabase';
import { EventManager } from './eventDatabase';

describe('EventManager.selectStateEvent', () => {
  it('rotates through capture events without using fallback when only history blocks selection', () => {
    const manager = new EventManager();
    const stateId = 'test_state';
    const capturingFaction = 'truth';

    const truthCaptureEvents: GameEvent[] = [
      {
        id: 'test_truth_event_1',
        title: 'Truth Capture 1',
        content: 'Event 1',
        type: 'capture',
        rarity: 'common',
        weight: 1,
        conditions: { capturedBy: 'truth' },
      },
      {
        id: 'test_truth_event_2',
        title: 'Truth Capture 2',
        content: 'Event 2',
        type: 'capture',
        rarity: 'common',
        weight: 1,
        conditions: { capturedBy: 'truth' },
      },
      {
        id: 'test_truth_event_3',
        title: 'Truth Capture 3',
        content: 'Event 3',
        type: 'capture',
        rarity: 'common',
        weight: 1,
        conditions: { capturedBy: 'truth' },
      },
    ];

    (manager as unknown as { activeStateEvents: Map<string, GameEvent[]> }).activeStateEvents.set(
      stateId,
      truthCaptureEvents
    );
    (manager as unknown as { stateEventHistoryByState: Map<string, string[]> }).stateEventHistoryByState.set(
      stateId,
      []
    );

    const selectedIds: string[] = [];

    for (let attempt = 0; attempt < 4; attempt += 1) {
      const selectedEvent = manager.selectStateEvent(stateId, capturingFaction, { states: [] });
      expect(selectedEvent).not.toBeNull();
      expect(selectedEvent?.id.startsWith('fallback_')).toBe(false);
      if (selectedEvent) {
        selectedIds.push(selectedEvent.id);
      }
    }

    expect(selectedIds.length).toBe(4);
    expect(new Set(selectedIds).size).toBe(3);
    expect(selectedIds[0]).toBe(selectedIds[3]);
  });
});

describe('EventManager.maybeSelectRandomEvent', () => {
  const originalHotspotFlag = featureFlags.hotspotDirectorEnabled;

  afterEach(() => {
    featureFlags.hotspotDirectorEnabled = originalHotspotFlag;
  });

  it('considers paranormal hotspot pool when the director is disabled', () => {
    featureFlags.hotspotDirectorEnabled = false;

    const manager = new EventManager();
    const paranormalEvent: GameEvent = {
      id: 'paranormal-test',
      title: 'Paranormal Test Event',
      content: 'Spawns a hotspot when allowed.',
      type: 'random',
      rarity: 'rare',
      weight: 1,
      paranormalHotspot: {
        label: 'Test Hotspot',
        duration: 2,
        truthReward: 4,
        defenseBoost: 2,
      },
    };
    const fallbackEvent: GameEvent = {
      id: 'standard-test',
      title: 'Standard Event',
      content: 'No hotspot payload.',
      type: 'random',
      rarity: 'common',
      weight: 1,
    };

    const pools: Array<{ pool: GameEvent[]; chanceFactor: number }> = [];
    (manager as unknown as { getAvailableEvents(): GameEvent[] }).getAvailableEvents = () => [
      paranormalEvent,
      fallbackEvent,
    ];
    (manager as unknown as {
      selectEventFromPool(pool: GameEvent[], chanceFactor: number): GameEvent | null;
    }).selectEventFromPool = (pool: GameEvent[], chanceFactor: number) => {
      pools.push({ pool, chanceFactor });
      return pool[0] ?? null;
    };

    const originalRandom = Math.random;
    let callCount = 0;
    Math.random = () => {
      callCount += 1;
      return callCount === 1 ? 0.05 : 0.01;
    };

    try {
      const result = manager.maybeSelectRandomEvent({});
      expect(result).toBe(paranormalEvent);
      expect(pools).toHaveLength(1);
      expect(pools[0]?.chanceFactor).toBeCloseTo(0.2);
      expect(pools[0]?.pool).toContain(paranormalEvent);
    } finally {
      Math.random = originalRandom;
    }
  });

  it('skips the paranormal hotspot pool when the director is enabled', () => {
    featureFlags.hotspotDirectorEnabled = true;

    const manager = new EventManager();
    const paranormalEvent: GameEvent = {
      id: 'paranormal-test',
      title: 'Paranormal Test Event',
      content: 'Spawns a hotspot when allowed.',
      type: 'random',
      rarity: 'rare',
      weight: 1,
      paranormalHotspot: {
        label: 'Test Hotspot',
        duration: 2,
        truthReward: 4,
        defenseBoost: 2,
      },
    };
    const fallbackEvent: GameEvent = {
      id: 'standard-test',
      title: 'Standard Event',
      content: 'No hotspot payload.',
      type: 'random',
      rarity: 'common',
      weight: 1,
    };

    const pools: Array<{ pool: GameEvent[]; chanceFactor: number }> = [];
    (manager as unknown as { getAvailableEvents(): GameEvent[] }).getAvailableEvents = () => [
      paranormalEvent,
      fallbackEvent,
    ];
    (manager as unknown as {
      selectEventFromPool(pool: GameEvent[], chanceFactor: number): GameEvent | null;
    }).selectEventFromPool = (pool: GameEvent[], chanceFactor: number) => {
      pools.push({ pool, chanceFactor });
      return pool[0] ?? null;
    };

    const originalRandom = Math.random;
    let callCount = 0;
    Math.random = () => {
      callCount += 1;
      return callCount === 1 ? 0.05 : 0.01;
    };

    try {
      const result = manager.maybeSelectRandomEvent({});
      expect(result).toBe(paranormalEvent);
      expect(pools).toHaveLength(1);
      expect(pools[0]?.chanceFactor).toBeCloseTo(0.12);
      expect(pools[0]?.pool).toContain(paranormalEvent);
    } finally {
      Math.random = originalRandom;
    }
  });
});

