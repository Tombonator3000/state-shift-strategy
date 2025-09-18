import type { MVPCardType, Rarity } from '@/rules/mvp';
import type { PlayerId } from '@/mvp/validator';

export type TurnPlayStage = 'play' | 'resolve';

export interface TurnPlay {
  sequence: number;
  stage: TurnPlayStage;
  owner: PlayerId;
  cardId: string;
  cardName: string;
  cardType: MVPCardType;
  cardRarity: Rarity;
  cost: number;
  targetStateId?: string;
  metadata?: Record<string, number | string | undefined>;
}

export type ComboCategory = 'sequence' | 'count' | 'threshold' | 'state' | 'hybrid';

export interface SequenceTrigger {
  kind: 'sequence';
  sequence: MVPCardType[];
  allowGaps?: boolean;
}

export interface CountTrigger {
  kind: 'count';
  type: MVPCardType | 'ANY';
  count: number;
  rarity?: Rarity | 'ANY';
  operator?: '>=' | '<=' | '==';
}

export type ThresholdMetric =
  | 'ipSpent'
  | 'attackSpent'
  | 'mediaSpent'
  | 'zoneSpent'
  | 'uniqueStatesTargeted'
  | 'plays'
  | 'lowCostCount'
  | 'highCostCount';

export interface ThresholdTrigger {
  kind: 'threshold';
  metric: ThresholdMetric;
  value: number;
}

export interface StateTrigger {
  kind: 'state';
  sameStateCount?: number;
  uniqueStatesCount?: number;
  targetList?: string[];
  cardType?: MVPCardType | 'ANY';
}

export interface HybridTrigger {
  kind: 'hybrid';
  triggers: ComboTrigger[];
  mode?: 'all' | 'any';
}

export type ComboTrigger = SequenceTrigger | CountTrigger | ThresholdTrigger | StateTrigger | HybridTrigger;

export interface ComboReward {
  ip?: number;
  truth?: number;
  log?: string;
}

export interface ComboDefinition {
  id: string;
  name: string;
  description: string;
  category: ComboCategory;
  priority: number;
  cap?: number;
  enabledByDefault?: boolean;
  trigger: ComboTrigger;
  reward: ComboReward;
  fxText?: string;
}

export interface ComboResult {
  definition: ComboDefinition;
  reward: ComboReward;
  appliedReward: ComboReward;
  details: {
    matchedPlays: TurnPlay[];
    extra?: Record<string, number | string>;
  };
}

export interface ComboEvaluation {
  results: ComboResult[];
  totalReward: ComboReward;
  logs: string[];
}

export interface ComboSettings {
  enabled: boolean;
  fxEnabled: boolean;
  comboToggles: Record<string, boolean>;
  maxCombosPerTurn: number;
}

export interface ComboFXCallbacks {
  onComboTriggered?: (result: ComboResult) => void;
  onComboFx?: (result: ComboResult) => void;
}

export interface ComboOptions extends Partial<ComboSettings> {
  fxCallbacks?: ComboFXCallbacks;
  disabledCombos?: string[];
}

export interface ComboSummary extends ComboEvaluation {
  player: PlayerId;
  turn: number;
}
