import { describe, expect, test } from 'bun:test';
import type { ParanormalSighting } from '@/types/paranormal';
import { upsertParanormalSighting } from '../paranormalSightings';

describe('upsertParanormalSighting', () => {
  const baseSighting: ParanormalSighting = {
    id: 'sighting-1',
    timestamp: 1,
    category: 'cryptid',
    headline: 'Initial headline',
    subtext: 'Original subtext',
    metadata: {
      stateId: 'CA',
      bonusIP: 1,
      source: 'truth',
    },
  };

  test('replaces an existing sighting with the same id and merges metadata', () => {
    const updatedSighting: ParanormalSighting = {
      id: 'sighting-1',
      timestamp: 2,
      category: 'cryptid',
      headline: 'Updated headline',
      subtext: 'New details emerge',
      metadata: {
        bonusIP: 3,
        stateName: 'California',
      },
    };

    const result = upsertParanormalSighting([baseSighting], updatedSighting);

    expect(result).toHaveLength(1);
    expect(result[0]).toEqual({
      id: 'sighting-1',
      timestamp: 2,
      category: 'cryptid',
      headline: 'Updated headline',
      subtext: 'New details emerge',
      metadata: {
        stateId: 'CA',
        source: 'truth',
        bonusIP: 3,
        stateName: 'California',
      },
    });
  });

  test('appends new sightings while enforcing the entry cap', () => {
    const sightings = Array.from({ length: 12 }, (_, index) => ({
      ...baseSighting,
      id: `sighting-${index + 1}`,
      timestamp: index,
    }));

    const newEntry: ParanormalSighting = {
      ...baseSighting,
      id: 'sighting-13',
      timestamp: 99,
    };

    const result = upsertParanormalSighting(sightings, newEntry);

    expect(result).toHaveLength(12);
    expect(result[11].id).toBe('sighting-13');
    expect(result[0].id).toBe('sighting-2');
  });
});
