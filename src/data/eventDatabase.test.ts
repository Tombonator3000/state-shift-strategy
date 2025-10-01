import { describe, expect, it } from 'bun:test';

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

