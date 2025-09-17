import type { Card } from './expansions';

type TypeKey = 'ATTACK' | 'MEDIA' | 'ZONE';
type RarityKey = 'common' | 'uncommon' | 'rare' | 'legendary';

type Summary = {
  byType: Record<TypeKey, number>;
  byRarity: Record<RarityKey, number>;
  total: number;
};

export function summarizeSet(cards: Card[]): Summary {
  const byType: Summary['byType'] = { ATTACK: 0, MEDIA: 0, ZONE: 0 };
  const byRarity: Summary['byRarity'] = {
    common: 0,
    uncommon: 0,
    rare: 0,
    legendary: 0,
  };

  for (const card of cards) {
    const type = card.type as TypeKey;
    if (type in byType) {
      byType[type] += 1;
    }

    const rarity = card.rarity as RarityKey;
    if (rarity in byRarity) {
      byRarity[rarity] += 1;
    }
  }

  return {
    byType,
    byRarity,
    total: cards.length,
  };
}
