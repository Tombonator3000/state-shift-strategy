import { afterEach, describe, expect, it } from 'bun:test';

import { featureFlags } from '@/state/featureFlags';

import type { GameEvent } from './eventDatabase';
import { EventManager, getTruthDelta } from './eventDatabase';

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

  it('restores legacy paranormal spawns when the director flag is toggled off mid-session', () => {
    featureFlags.hotspotDirectorEnabled = true;

    const manager = new EventManager();
    const paranormalEvent: GameEvent = {
      id: 'legacy-paranormal',
      title: 'Legacy Paranormal Hotspot',
      content: 'Hotspot payload from legacy events.',
      type: 'random',
      rarity: 'rare',
      weight: 1,
      paranormalHotspot: {
        label: 'Legacy Rift',
        duration: 3,
        truthReward: 5,
        defenseBoost: 2,
      },
    };
    const fallbackEvent: GameEvent = {
      id: 'legacy-standard',
      title: 'Legacy Standard Event',
      content: 'Non-hotspot payload.',
      type: 'random',
      rarity: 'common',
      weight: 1,
    };

    const pools: Array<{ ids: string[]; chance: number }> = [];
    (manager as unknown as { getAvailableEvents(): GameEvent[] }).getAvailableEvents = () => [
      paranormalEvent,
      fallbackEvent,
    ];
    (manager as unknown as {
      selectEventFromPool(pool: GameEvent[], chanceFactor: number): GameEvent | null;
    }).selectEventFromPool = (pool: GameEvent[], chanceFactor: number) => {
      pools.push({ ids: pool.map(event => event.id), chance: chanceFactor });
      return pool[0] ?? null;
    };

    manager.setEventChance(1);

    const originalRandom = Math.random;
    const randomValues = [0.99, 0.05];
    Math.random = () => {
      const next = randomValues.shift();
      return typeof next === 'number' ? next : 0;
    };

    try {
      const initialSelection = manager.maybeSelectRandomEvent({});
      expect(initialSelection).toBe(paranormalEvent);
      expect(pools).toHaveLength(1);
      expect(pools[0]?.ids).toEqual(['legacy-paranormal', 'legacy-standard']);
      expect(pools[0]?.chance).toBeCloseTo(1);

      featureFlags.hotspotDirectorEnabled = false;

      const toggledSelection = manager.maybeSelectRandomEvent({});
      expect(toggledSelection).toBe(paranormalEvent);
      expect(pools).toHaveLength(2);
      expect(pools[1]?.ids).toEqual(['legacy-paranormal']);
      expect(pools[1]?.chance).toBeCloseTo(0.2);
    } finally {
      Math.random = originalRandom;
    }
  });
});

describe('EventManager truth balance heuristics', () => {
  const originalHotspotFlag = featureFlags.hotspotDirectorEnabled;

  afterEach(() => {
    featureFlags.hotspotDirectorEnabled = originalHotspotFlag;
  });

  it('keeps positive and negative truth selections within tolerance', () => {
    featureFlags.hotspotDirectorEnabled = true;

    const manager = new EventManager();
    manager.setEventChance(1);

    const positiveEvent: GameEvent = {
      id: 'balance-positive',
      title: 'Positive Truth',
      content: 'Boosts truth slightly.',
      type: 'random',
      rarity: 'common',
      weight: 1,
      effects: { truth: 1 },
    };

    const negativeEvent: GameEvent = {
      id: 'balance-negative',
      title: 'Negative Truth',
      content: 'Reduces truth slightly.',
      type: 'random',
      rarity: 'common',
      weight: 1,
      effects: { truthChange: -1 },
    };

    const neutralEvent: GameEvent = {
      id: 'balance-neutral',
      title: 'Neutral Truth',
      content: 'No truth change.',
      type: 'random',
      rarity: 'common',
      weight: 1,
    };

    (manager as unknown as { getAvailableEvents(): GameEvent[] }).getAvailableEvents = () => [
      positiveEvent,
      negativeEvent,
      neutralEvent,
    ];

    const selectionCounts = {
      positive: 0,
      negative: 0,
      neutral: 0,
    };

    const originalRandom = Math.random;
    Math.random = () => 0;

    try {
      const trials = 300;
      for (let attempt = 0; attempt < trials; attempt += 1) {
        const selection = manager.maybeSelectRandomEvent({});
        expect(selection).not.toBeNull();
        if (!selection) {
          continue;
        }

        const truthDelta = getTruthDelta(selection);
        if (truthDelta > 0) {
          selectionCounts.positive += 1;
        } else if (truthDelta < 0) {
          selectionCounts.negative += 1;
        } else {
          selectionCounts.neutral += 1;
        }
      }
    } finally {
      Math.random = originalRandom;
    }

    const signedTotal = selectionCounts.positive + selectionCounts.negative;
    expect(signedTotal).toBeGreaterThan(0);

    const positiveRatio = selectionCounts.positive / signedTotal;
    expect(positiveRatio).toBeGreaterThan(0.4);
    expect(positiveRatio).toBeLessThan(0.6);
  });
});

