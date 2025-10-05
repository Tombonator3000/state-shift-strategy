import { describe, expect, test } from 'bun:test';
import { create } from 'react-test-renderer';

import type { GameCard } from '@/rules/mvp';

const ensureLocalStorage = () => {
  if (typeof globalThis.localStorage !== 'undefined') {
    return;
  }

  const storage = new Map<string, string>();
  globalThis.localStorage = {
    getItem: key => (storage.has(key) ? storage.get(key)! : null),
    setItem: (key, value) => {
      storage.set(key, value);
    },
    removeItem: key => {
      storage.delete(key);
    },
    clear: () => {
      storage.clear();
    },
    key: index => Array.from(storage.keys())[index] ?? null,
    get length() {
      return storage.size;
    },
  } as Storage;
};

describe('BaseCard flavor text rendering', () => {
  test('renders only a single CLASSIFIED INTELLIGENCE line for Chupacabra Protocol', async () => {
    ensureLocalStorage();

    const { BaseCard } = await import('../BaseCard');

    const mockCard: GameCard = {
      id: 'gov_chupacabra_protocol',
      name: 'Chupacabra Protocol',
      type: 'ATTACK',
      faction: 'government',
      rarity: 'uncommon',
      cost: 7,
      text: 'Opponent loses 3 IP.',
      flavor: '"CLASSIFIED INTELLIGENCE: Chupacabra looked straight into the lens."',
      effects: {
        ipDelta: { opponent: -3 },
      },
    };

    const renderer = create(<BaseCard card={mockCard} />);
    const serialized = JSON.stringify(renderer.toJSON());

    const occurrences = serialized.match(/CLASSIFIED INTELLIGENCE:/g)?.length ?? 0;

    expect(occurrences).toBe(1);
    expect(serialized).toContain('Chupacabra looked straight into the lens.');

    renderer.unmount();
  });
});
