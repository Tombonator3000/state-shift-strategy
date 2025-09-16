// Game State Adapter for v2.1E Compatibility
// Bridges between old GameCard interface and new v2.1E types

import type { GameCard as LegacyGameCard } from '@/types/cardTypes';
import type { GameCard, Faction, CardType } from '@/types/cardTypes';
import { whitelistEffects } from '@/utils/whitelistEffects';

export function adaptLegacyCard(legacyCard: LegacyGameCard): GameCard {
  // Normalize faction to lowercase
  const faction = String(legacyCard.faction || 'truth').toLowerCase() as Faction;
  
  // Normalize type and enforce whitelist
  let type = String(legacyCard.type || 'MEDIA').toUpperCase();
  if (!['MEDIA', 'ZONE', 'ATTACK', 'DEFENSIVE'].includes(type)) {
    type = 'MEDIA';
  }

  // Ensure both flavor fields exist
  const flavorTruth = legacyCard.flavorTruth || (legacyCard as any).flavor || '';
  const flavorGov = legacyCard.flavorGov || (legacyCard as any).flavor || '';

  // Whitelist effects if they exist
  const effects = legacyCard.effects ? whitelistEffects(legacyCard.effects) : undefined;

  const adapted: GameCard = {
    id: legacyCard.id,
    name: legacyCard.name,
    type: type as CardType,
    faction,
    rarity: legacyCard.rarity,
    cost: legacyCard.cost,
    text: legacyCard.text,
    flavorTruth,
    flavorGov,
    effects,
    extId: (legacyCard as any).extId
  };

  // Enforce ZONE targeting
  if (adapted.type === 'ZONE') {
    adapted.target = { scope: 'state', count: 1 };
  }

  return adapted;
}

export function adaptLegacyCards(legacyCards: LegacyGameCard[]): GameCard[] {
  return legacyCards.map(adaptLegacyCard);
}