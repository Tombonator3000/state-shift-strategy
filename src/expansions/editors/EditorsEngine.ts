import {
  describeEditorEffect as describeEffectConfig,
  forEachEditorEffect as iterateEditorEffects,
  getEditorAggregatedEffects,
  getEditorById as lookupEditorById,
  getEditorEffectConfig,
  getEditors as listEditors,
  type EditorAggregatedEffects,
  type EditorDefinition,
  type EditorEffectConfig,
  type EditorEffectKind,
  type EditorId,
} from '@/game/editors';

// Re-export types for external use
export type { EditorDefinition as EditorDef, EditorEffectConfig as EditorEffect, EditorId } from '@/game/editors';

export const FEATURE_EDITORS_MINIDRAFT = false;

export interface ResolveEditorOptions {
  readonly editorId?: EditorId | null;
  readonly fallbackId?: EditorId | null;
}

export type { EditorEffectKind };

export const getEditors = (): EditorDefinition[] => [...listEditors()];

export const getEditorById = (id?: EditorId | null): EditorDefinition | undefined =>
  lookupEditorById(id ?? undefined);

export const resolveEditor = (id?: EditorId | null): EditorDefinition | undefined => getEditorById(id);

export const resolveActiveEditor = (options?: ResolveEditorOptions): EditorDefinition | undefined => {
  if (!options) return undefined;
  const { editorId, fallbackId } = options;
  return (
    getEditorById(editorId ?? undefined)
    ?? getEditorById(fallbackId ?? undefined)
  );
};

export const forEachEditorEffect = (
  editor: EditorDefinition | null | undefined,
  callback: (effect: EditorEffectConfig, kind: EditorEffectKind) => void,
): void => {
  iterateEditorEffects(editor ?? undefined, callback);
};

export const getEditorEffectByKind = (
  editor: EditorDefinition | null | undefined,
  kind: EditorEffectKind,
): EditorEffectConfig => getEditorEffectConfig(editor ?? undefined, kind);

export interface EditorSetupAdjustments {
  ipDelta: number;
  deckSizeDelta: number;
  addCardIds: string[];
}

export const gatherEditorSetupAdjustments = (
  editor: EditorDefinition | null | undefined,
): EditorSetupAdjustments => {
  const aggregated = getEditorAggregatedEffects(editor ?? undefined);
  const safeAggregated: EditorAggregatedEffects = aggregated ?? {
    ipIncomePerTurn: 0,
    mediaTruthModifier: 0,
    zonePressureBonus: 0,
    attackCostDelta: 0,
    startDiscardChance: 0,
    startIpDelta: 0,
    deckSizeDelta: 0,
    startCards: [],
  };
  const startCards = Array.isArray(safeAggregated?.startCards)
    ? safeAggregated.startCards
    : [];
  return {
    ipDelta: typeof safeAggregated?.startIpDelta === 'number' && Number.isFinite(safeAggregated.startIpDelta)
      ? safeAggregated.startIpDelta
      : 0,
    deckSizeDelta:
      typeof safeAggregated?.deckSizeDelta === 'number' && Number.isFinite(safeAggregated.deckSizeDelta)
        ? safeAggregated.deckSizeDelta
        : 0,
    addCardIds: [...new Set(startCards)],
  };
};

export interface EditorTurnStartAdjustments {
  roundOneDrawBonus: number;
  scandalChance: number;
  scandalEffect?: 'randomDiscard:1';
  ipIncomePerTurn: number;
  startDiscardChance: number;
}

export const gatherEditorTurnStartAdjustments = (
  editor: EditorDefinition | null | undefined,
): EditorTurnStartAdjustments => {
  const aggregated = getEditorAggregatedEffects(editor ?? undefined);
  return {
    roundOneDrawBonus: 0,
    scandalChance: aggregated.startDiscardChance,
    scandalEffect: aggregated.startDiscardChance > 0 ? 'randomDiscard:1' : undefined,
    ipIncomePerTurn: aggregated.ipIncomePerTurn,
    startDiscardChance: aggregated.startDiscardChance,
  };
};

export interface EditorPlayCardAdjustments {
  mediaTruthDelta: number;
  attackIpCostDelta: number;
  zonePressureBonus: number;
}

export const gatherEditorPlayCardAdjustments = (
  editor: EditorDefinition | null | undefined,
): EditorPlayCardAdjustments => {
  const aggregated: EditorAggregatedEffects = getEditorAggregatedEffects(editor ?? undefined);
  return {
    mediaTruthDelta: aggregated.mediaTruthModifier,
    attackIpCostDelta: aggregated.attackCostDelta,
    zonePressureBonus: aggregated.zonePressureBonus,
  };
};

export const describeEditorEffect = (
  effect?: EditorEffectConfig | null,
): string[] => describeEffectConfig(effect ?? null);
