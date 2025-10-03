import type { GameEvent } from '@/data/eventDatabase';
import type { CardPlayRecord } from '@/hooks/gameStateTypes';

export type RelicRarity = 'common' | 'uncommon' | 'rare' | 'legendary';

export interface RelicTrigger {
  readonly truthBelow?: number;
  readonly truthAbove?: number;
  readonly ipBelow?: number;
  readonly ipAbove?: number;
  readonly aiIpAbove?: number;
  readonly comboTruthDeltaBelow?: number;
  readonly comboTruthDeltaAbove?: number;
  readonly eventTruthLossAtLeast?: number;
  readonly eventTruthGainAtLeast?: number;
  readonly playerMediaPlaysAtLeast?: number;
  readonly aiAttackPlaysAtLeast?: number;
  readonly requiresFaction?: 'truth' | 'government';
  readonly requiresEditors?: boolean;
}

export interface RelicClampAxis {
  readonly min?: number;
  readonly max?: number;
}

export interface RelicClampDefinition {
  readonly truth?: RelicClampAxis;
  readonly ip?: RelicClampAxis;
  readonly aiIp?: RelicClampAxis;
}

export interface RelicEffectDefinition {
  readonly truthPerRound?: number;
  readonly ipPerRound?: number;
  readonly aiIpPerRound?: number;
  readonly cardDrawBonus?: number;
}

export interface RelicAmplifyConfig {
  readonly editorMultiplier?: number;
}

export interface RelicRuleDefinition {
  readonly id: string;
  readonly label: string;
  readonly rarity: RelicRarity;
  readonly duration: number;
  readonly priority?: number;
  readonly trigger: RelicTrigger;
  readonly effects: RelicEffectDefinition;
  readonly summary: string;
  readonly detail?: string;
  readonly clamp?: RelicClampDefinition;
  readonly amplify?: RelicAmplifyConfig;
}

export interface RelicRulesFile {
  readonly version: number;
  readonly relics: RelicRuleDefinition[];
}

export interface TabloidRelicRuntimeEntry {
  readonly uid: string;
  readonly ruleId: string;
  readonly label: string;
  readonly rarity: RelicRarity;
  readonly summary: string;
  readonly detail?: string;
  readonly duration: number;
  readonly remaining: number;
  readonly status: 'queued' | 'active';
  readonly triggeredOnRound: number;
  readonly clamp?: RelicClampDefinition;
  readonly effects: RelicEffectDefinition;
}

export interface TabloidRelicRuntimeState {
  readonly entries: TabloidRelicRuntimeEntry[];
  readonly lastIssueRound: number;
  readonly lastUpdatedTurn?: number;
}

export interface RelicHostState {
  readonly faction: 'truth' | 'government';
  readonly truth: number;
  readonly ip: number;
  readonly aiIP: number;
  readonly round: number;
  readonly turn: number;
  readonly editorId?: string | null;
  readonly editorDef?: unknown;
  readonly tabloidRelicsRuntime?: TabloidRelicRuntimeState | null;
}

export interface RelicIssueSnapshot {
  readonly round: number;
  readonly turn: number;
  readonly truth: number;
  readonly ip: number;
  readonly aiIP: number;
  readonly comboTruthDelta: number;
  readonly faction: 'truth' | 'government';
  readonly events: GameEvent[];
  readonly plays: CardPlayRecord[];
  readonly runtime: TabloidRelicRuntimeState | null;
  readonly editorActive: boolean;
}

export interface RelicIngestResult {
  readonly runtime: TabloidRelicRuntimeState | null;
  readonly logEntries: string[];
}

export interface RelicRoundStartPayload {
  readonly state: RelicHostState;
}

export interface RelicRoundStartResult {
  readonly runtime: TabloidRelicRuntimeState | null;
  readonly truth: number;
  readonly ip: number;
  readonly aiIp: number;
  readonly bonusCardDraw: number;
  readonly logEntries: string[];
  readonly truthDelta: number;
  readonly ipDelta: number;
  readonly aiIpDelta: number;
}
