import { afterEach, describe, expect, it } from 'bun:test';

import type { GameCard } from '@/rules/mvp';
import { weightedDistribution } from '../weightedCardDistribution';

type CardSet = {
  id: string;
  name: string;
  cards: GameCard[];
  isCore: boolean;
};

const createCard = (id: string, overrides: Partial<GameCard> = {}): GameCard => ({
  id,
  name: `Test Card ${id}`,
  type: 'MEDIA',
  faction: 'truth',
  rarity: 'common',
  cost: 1,
  effects: {},
  ...overrides,
});

describe('weightedCardDistribution core-only mode', () => {
  const originalGetAvailable = (weightedDistribution as any).getAvailableCardSets as () => CardSet[];
  const baselineSettings = JSON.parse(JSON.stringify(weightedDistribution.getSettings()));

  afterEach(() => {
    (weightedDistribution as any).getAvailableCardSets = originalGetAvailable;
    weightedDistribution.updateSettings(JSON.parse(JSON.stringify(baselineSettings)));
  });

  it('only emits core cards when mode is core-only', () => {
    weightedDistribution.updateSettings(JSON.parse(JSON.stringify(baselineSettings)));

    const coreCards: GameCard[] = [];
    const rarities: GameCard['rarity'][] = ['common', 'uncommon', 'rare', 'legendary'];
    const types: GameCard['type'][] = ['ATTACK', 'MEDIA', 'ZONE'];

    for (const rarity of rarities) {
      for (const type of types) {
        coreCards.push(createCard(`${rarity}-${type}`, { rarity, type }));
      }
    }

    const expansionCards: GameCard[] = [
      createCard('expansion-card', { extId: 'expansion-alpha', type: 'MEDIA', rarity: 'common' }),
    ];

    (weightedDistribution as any).getAvailableCardSets = () => [
      { id: 'core', name: 'Core Set', cards: coreCards, isCore: true },
      { id: 'expansion-alpha', name: 'Expansion Alpha', cards: expansionCards, isCore: false },
    ];

    weightedDistribution.updateSettings({
      mode: 'core-only',
      setWeights: { core: 2, 'expansion-alpha': 5 },
      duplicateLimit: 40,
      typeBalancing: { enabled: false, maxTypeRatio: 1 },
    });

    const { setDistribution } = weightedDistribution.simulateDeckComposition(10);

    expect(setDistribution.get('core')).toBeGreaterThan(0);
    expect(setDistribution.has('expansion-alpha')).toBe(false);
  });
});
