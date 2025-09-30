export type Faction = 'truth' | 'government' | 'Truth' | 'Government';
export const MVP_CARD_TYPES = ['ATTACK', 'MEDIA', 'ZONE'] as const;
export type MVPCardType = (typeof MVP_CARD_TYPES)[number];
export type CardType = MVPCardType | 'DEFENSIVE';
export type Rarity = 'common' | 'uncommon' | 'rare' | 'legendary';

export interface CardEffects {
  truthDelta?: number;
  ipDelta?: {
    self?: number;
    opponent?: number;
    opponentPercent?: number;
  };
  draw?: number;
  discardOpponent?: number;
  pressureDelta?: number;
  zoneDefense?: number;
  reduceFactor?: number;
  /** Reveals the opponent's secret agenda to the player when triggered. */
  revealSecretAgenda?: boolean;
  conditional?: {
    ifTruthAtLeast?: number;
    ifZonesControlledAtLeast?: number;
    ifTargetStateIs?: string;
    then?: CardEffects;
    else?: CardEffects;
  };
}

export interface CardTarget {
  scope: 'global' | 'state' | 'controlled' | 'contested';
  count: number;
}

export interface GameCard {
  id: string;
  name: string;
  type: CardType;
  faction: Faction;
  rarity?: Rarity;
  cost: number;
  text?: string;
  flavor?: string;
  flavorTruth?: string;
  flavorGov?: string;
  effects?: CardEffects;
  target?: CardTarget;
  extId?: string;
  artId?: string;
  artPolicy?: 'manual' | 'autofill';
  artTags?: string[];
  artAttribution?: string;
}

export const MVP_COST_TABLE: Record<MVPCardType, Record<Rarity, number>> = {
  ATTACK: { common: 2, uncommon: 3, rare: 4, legendary: 5 },
  MEDIA: { common: 3, uncommon: 4, rare: 5, legendary: 6 },
  ZONE: { common: 4, uncommon: 5, rare: 6, legendary: 7 },
};

export function expectedCost(type: CardType, rarity: Rarity): number {
  const table = MVP_COST_TABLE[type as MVPCardType];
  if (!table) {
    throw new Error(`No MVP cost defined for card type: ${type}`);
  }
  return table[rarity];
}
