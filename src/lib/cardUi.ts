import type { GameCard, Rarity as MVPRarity } from '@/rules/mvp';

export type NormalizedFaction = 'truth' | 'government';
export type NormalizedRarity = MVPRarity;

export const normalizeFaction = (faction?: GameCard['faction']): NormalizedFaction => {
  if (!faction) return 'government';
  const normalized = faction.toString().toLowerCase();
  return normalized === 'truth' ? 'truth' : 'government';
};

export const normalizeRarity = (rarity?: GameCard['rarity']): NormalizedRarity => {
  if (!rarity) return 'common';
  const normalized = rarity.toString().toLowerCase();
  if (normalized === 'uncommon' || normalized === 'rare' || normalized === 'legendary') {
    return normalized;
  }
  return 'common';
};

export const normalizeCardType = (type?: GameCard['type']): 'ATTACK' | 'MEDIA' | 'ZONE' => {
  if (!type) return 'MEDIA';
  const normalized = type.toString().toUpperCase();
  if (normalized === 'ATTACK' || normalized === 'ZONE') {
    return normalized;
  }
  return 'MEDIA';
};

export const getFactionVar = (faction?: GameCard['faction']): string => {
  return `var(--pt-${normalizeFaction(faction)})`;
};

export const getFactionLabel = (faction?: GameCard['faction']): string => {
  return normalizeFaction(faction) === 'truth' ? 'TRUTH EXPOSED' : 'GOVERNMENT FILE';
};

export const getRarityVar = (rarity?: GameCard['rarity']): string => {
  return `var(--pt-rarity-${normalizeRarity(rarity)})`;
};

export const getRarityLabel = (rarity?: GameCard['rarity']): string => {
  return normalizeRarity(rarity);
};

export const getFlavorText = (card: GameCard): string | undefined => {
  return card.flavor ?? card.flavorTruth ?? card.flavorGov ?? undefined;
};

export const formatEffect = (card: GameCard): string => {
  const effects = card.effects ?? {};
  const type = normalizeCardType(card.type);

  if (type === 'ATTACK') {
    const opponentLoss = effects.ipDelta?.opponent;
    if (typeof opponentLoss === 'number') {
      const absoluteLoss = Math.abs(opponentLoss);
      const parts = [`Opponent loses ${absoluteLoss} IP`];
      if (typeof effects.discardOpponent === 'number' && effects.discardOpponent > 0) {
        parts.push(`Discard ${effects.discardOpponent}`);
      }
      return parts.join(' · ');
    }
  }

  if (type === 'MEDIA') {
    if (typeof effects.truthDelta === 'number') {
      const sign = effects.truthDelta >= 0 ? '+' : '';
      return `Truth ${sign}${effects.truthDelta}%`;
    }
  }

  if (type === 'ZONE') {
    if (typeof effects.pressureDelta === 'number') {
      const amount = effects.pressureDelta >= 0 ? `+${effects.pressureDelta}` : `${effects.pressureDelta}`;
      return `${amount} Pressure to a state`;
    }
  }

  return card.text ?? 'Special effect card with unique abilities.';
};
