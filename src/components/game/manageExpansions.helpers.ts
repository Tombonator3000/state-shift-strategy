import { EXPANSION_MANIFEST } from '@/data/expansions';
import type { GameCard } from '@/rules/mvp';

export const summarizeExpansionCards = (cards: GameCard[]): Record<string, number> => {
  const counts: Record<string, number> = {};
  const validIds = new Set(EXPANSION_MANIFEST.map(pack => pack.id));

  cards.forEach(card => {
    const extId = card.extId;
    if (!extId || !validIds.has(extId)) {
      return;
    }
    counts[extId] = (counts[extId] ?? 0) + 1;
  });

  return counts;
};
