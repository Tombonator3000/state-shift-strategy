import { describe, expect, it } from 'bun:test';
import { buildEditionEvents } from '@/hooks/eventEdition';
import type { GameEvent } from '@/data/eventDatabase';

const makeEvent = (id: string): GameEvent => ({
  id,
  title: `Event ${id}`,
  content: 'Placeholder content',
  type: 'random',
  rarity: 'common',
  weight: 1,
});

describe('buildEditionEvents', () => {
  it('returns seeded events on the first edition when no trigger occurs', () => {
    const seededEvents = [makeEvent('seed-1'), makeEvent('seed-2')];

    const result = buildEditionEvents(
      { turn: 1, round: 1, currentEvents: seededEvents },
      null,
    );

    expect(result).toEqual(seededEvents);
    expect(result).not.toBe(seededEvents);
  });

  it('appends triggered events to the seeded first edition', () => {
    const seededEvents = [makeEvent('seed-1')];
    const triggered = makeEvent('triggered');

    const result = buildEditionEvents(
      { turn: 1, round: 1, currentEvents: seededEvents },
      triggered,
    );

    expect(result).toEqual([...seededEvents, triggered]);
  });

  it('returns no events when no trigger fires on later editions', () => {
    const seededEvents = [makeEvent('seed-1')];

    const firstEdition = buildEditionEvents(
      { turn: 1, round: 1, currentEvents: seededEvents },
      null,
    );

    const result = buildEditionEvents(
      { turn: 2, round: 1, currentEvents: firstEdition },
      null,
    );

    expect(result).toEqual([]);
  });

  it('returns only the triggered event on later editions', () => {
    const triggered = makeEvent('triggered');

    const result = buildEditionEvents(
      { turn: 3, round: 1, currentEvents: [] },
      triggered,
    );

    expect(result).toEqual([triggered]);
  });
});
