import type {
  HybridCardConfig,
  PersistentCardConfig,
  TrapCardConfig,
} from '@/game/newCardTypes';

export type Faction = 'truth' | 'government' | 'Truth' | 'Government';
export const MVP_CARD_TYPES = ['ATTACK', 'MEDIA', 'ZONE', 'HYBRID', 'TRAP', 'PERSISTENT'] as const;
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
  // Phase 2 conditional effects
  ifFewerStates?: {
    threshold: number;
    then: CardEffects;
    else?: CardEffects;
  };
  ifMoreStates?: {
    threshold: number;
    then: CardEffects;
    else?: CardEffects;
  };
  ifTruthAbove?: {
    threshold: number;
    then: CardEffects;
    else?: CardEffects;
  };
  ifTruthBelow?: {
    threshold: number;
    then: CardEffects;
    else?: CardEffects;
  };
  pressureToAllContested?: number;
  pressurePerControlledState?: { max?: number };
  truthPerControlledState?: { max?: number };
  preventHighCostCards?: { threshold: number; duration: number };
  defenseToAllStates?: number;
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
  tags?: string[];
  stateBonuses?: Record<string, CardStateBonusDefinition>;
  hybridConfig?: HybridCardConfig;
  trapConfig?: TrapCardConfig;
  persistentConfig?: PersistentCardConfig;
}

export type CardStateBonusDefinition =
  | CardEffects
  | {
      effects: CardEffects;
      label?: string;
    };

export const MVP_COST_TABLE: Record<MVPCardType, Record<Rarity, number>> = {
  ATTACK: { common: 2, uncommon: 3, rare: 4, legendary: 5 },
  MEDIA: { common: 3, uncommon: 4, rare: 5, legendary: 6 },
  ZONE: { common: 4, uncommon: 5, rare: 6, legendary: 7 },
  HYBRID: { common: 3, uncommon: 4, rare: 5, legendary: 6 },
  TRAP: { common: 2, uncommon: 3, rare: 4, legendary: 5 },
  PERSISTENT: { common: 3, uncommon: 4, rare: 5, legendary: 6 },
};

export function expectedCost(type: CardType, rarity: Rarity): number {
  const table = MVP_COST_TABLE[type as MVPCardType];
  if (!table) {
    throw new Error(`No MVP cost defined for card type: ${type}`);
  }
  return table[rarity];
}
