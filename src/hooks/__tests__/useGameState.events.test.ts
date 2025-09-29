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
  it('returns existing events when no new entries are provided', () => {
    const seededEvents = [makeEvent('seed-1'), makeEvent('seed-2')];

    const result = buildEditionEvents(
      { turn: 1, round: 1, currentEvents: seededEvents },
      [],
    );

    expect(result).toEqual(seededEvents);
  });

  it('merges new events with existing entries on the first edition', () => {
    const seededEvents = [makeEvent('seed-1')];
    const additions = [makeEvent('addition-1'), makeEvent('addition-2')];

    const result = buildEditionEvents(
      { turn: 1, round: 1, currentEvents: seededEvents },
      additions,
    );

    expect(result).toEqual([...seededEvents, ...additions]);
  });

  it('deduplicates by id when merging new events', () => {
    const seededEvents = [makeEvent('existing'), makeEvent('keep-me')];
    const replacement = { ...makeEvent('existing'), title: 'Updated existing' };

    const result = buildEditionEvents(
      { turn: 3, round: 1, currentEvents: seededEvents },
      [replacement],
    );

    expect(result).toEqual([replacement, seededEvents[1]]);
  });

  it('appends multiple unique new events on later editions', () => {
    const seededEvents = [makeEvent('existing')];
    const additions = [makeEvent('new-1'), makeEvent('new-2')];

    const result = buildEditionEvents(
      { turn: 4, round: 2, currentEvents: seededEvents },
      additions,
    );

    expect(result).toEqual([...seededEvents, ...additions]);
  });
});
