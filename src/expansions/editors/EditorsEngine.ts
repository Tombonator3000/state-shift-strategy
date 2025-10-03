import rawEditors from './editors.json';
import type { EditorDef, EditorEffect, EditorId } from './EditorsTypes';

const EDITORS: EditorDef[] = rawEditors as EditorDef[];

export const FEATURE_EDITORS_MINIDRAFT = false;

export interface ResolveEditorOptions {
  readonly editorId?: EditorId | null;
  readonly fallbackId?: EditorId | null;
}

export type EditorEffectKind = 'bonus' | 'penalty';

export const getEditors = (): EditorDef[] => [...EDITORS];

export const getEditorById = (id?: EditorId | null): EditorDef | undefined => {
  if (!id) return undefined;
  return EDITORS.find(editor => editor.id === id);
};

export const resolveEditor = (id?: EditorId | null): EditorDef | undefined => getEditorById(id);

export const resolveActiveEditor = (options?: ResolveEditorOptions): EditorDef | undefined => {
  if (!options) return undefined;
  const { editorId, fallbackId } = options;
  return getEditorById(editorId ?? undefined) ?? getEditorById(fallbackId ?? undefined);
};

export const forEachEditorEffect = (
  editor: EditorDef | null | undefined,
  callback: (effect: EditorEffect, kind: EditorEffectKind) => void,
): void => {
  if (!editor) return;
  if (editor.penalty) {
    callback(editor.penalty, 'penalty');
  }
  if (editor.bonus) {
    callback(editor.bonus, 'bonus');
  }
};

export interface EditorSetupAdjustments {
  ipDelta: number;
  deckSizeDelta: number;
  addCardIds: string[];
}

export const gatherEditorSetupAdjustments = (editor: EditorDef | null | undefined): EditorSetupAdjustments => {
  const result: EditorSetupAdjustments = {
    ipDelta: 0,
    deckSizeDelta: 0,
    addCardIds: [],
  };

  forEachEditorEffect(editor, effect => {
    if (typeof effect.start_ipDelta === 'number') {
      result.ipDelta += effect.start_ipDelta;
    }
    if (typeof effect.onSetup_deckSizeDelta === 'number') {
      result.deckSizeDelta += effect.onSetup_deckSizeDelta;
    }
    if (Array.isArray(effect.onSetup_addCardIds)) {
      result.addCardIds.push(...effect.onSetup_addCardIds);
    }
  });

  return result;
};

export interface EditorTurnStartAdjustments {
  roundOneDrawBonus: number;
  scandalChance: number;
  scandalEffect?: 'randomDiscard:1';
}

export const gatherEditorTurnStartAdjustments = (
  editor: EditorDef | null | undefined,
): EditorTurnStartAdjustments => {
  const result: EditorTurnStartAdjustments = {
    roundOneDrawBonus: 0,
    scandalChance: 0,
    scandalEffect: undefined,
  };

  forEachEditorEffect(editor, effect => {
    if (typeof effect.round1_drawDelta === 'number') {
      result.roundOneDrawBonus += effect.round1_drawDelta;
    }
    if (typeof effect.turnStart_scandalChance === 'number' && effect.turnStart_scandalChance > 0) {
      result.scandalChance += effect.turnStart_scandalChance;
      if (effect.scandal_effect) {
        result.scandalEffect = effect.scandal_effect;
      }
    }
  });

  return result;
};

export interface EditorPlayCardAdjustments {
  mediaTruthDelta: number;
  attackIpCostDelta: number;
}

export const gatherEditorPlayCardAdjustments = (
  editor: EditorDef | null | undefined,
): EditorPlayCardAdjustments => {
  const result: EditorPlayCardAdjustments = {
    mediaTruthDelta: 0,
    attackIpCostDelta: 0,
  };

  forEachEditorEffect(editor, effect => {
    if (typeof effect.onMediaPlay_truthDelta === 'number') {
      result.mediaTruthDelta += effect.onMediaPlay_truthDelta;
    }
    if (typeof effect.attack_ipCostDelta === 'number') {
      result.attackIpCostDelta += effect.attack_ipCostDelta;
    }
  });

  return result;
};

const EFFECT_LABELS: Partial<Record<keyof EditorEffect, string>> = {
  start_ipDelta: 'Start IP',
  onSetup_addCardIds: 'Start cards',
  onSetup_deckSizeDelta: 'Deck size',
  round1_drawDelta: 'Round 1 draw',
  turnStart_scandalChance: 'Turn start',
  onMediaPlay_truthDelta: 'Media truth',
  attack_ipCostDelta: 'Attack IP cost',
};

export const describeEditorEffect = (effect: EditorEffect): string[] => {
  const parts: string[] = [];

  if (typeof effect.start_ipDelta === 'number' && effect.start_ipDelta !== 0) {
    parts.push(`${EFFECT_LABELS.start_ipDelta}: ${effect.start_ipDelta > 0 ? '+' : ''}${effect.start_ipDelta}`);
  }
  if (typeof effect.onSetup_deckSizeDelta === 'number' && effect.onSetup_deckSizeDelta !== 0) {
    parts.push(`${EFFECT_LABELS.onSetup_deckSizeDelta}: ${effect.onSetup_deckSizeDelta > 0 ? '+' : ''}${effect.onSetup_deckSizeDelta}`);
  }
  if (Array.isArray(effect.onSetup_addCardIds) && effect.onSetup_addCardIds.length > 0) {
    parts.push(`${EFFECT_LABELS.onSetup_addCardIds}: ${effect.onSetup_addCardIds.join(', ')}`);
  }
  if (typeof effect.round1_drawDelta === 'number' && effect.round1_drawDelta !== 0) {
    parts.push(`${EFFECT_LABELS.round1_drawDelta}: ${effect.round1_drawDelta > 0 ? '+' : ''}${effect.round1_drawDelta}`);
  }
  if (typeof effect.turnStart_scandalChance === 'number' && effect.turnStart_scandalChance > 0) {
    const percent = Math.round(effect.turnStart_scandalChance * 100);
    const effectLabel = effect.scandal_effect === 'randomDiscard:1' ? 'random discard' : 'scandal';
    parts.push(`${EFFECT_LABELS.turnStart_scandalChance}: ${percent}% ${effectLabel}`);
  }
  if (typeof effect.onMediaPlay_truthDelta === 'number' && effect.onMediaPlay_truthDelta !== 0) {
    parts.push(`${EFFECT_LABELS.onMediaPlay_truthDelta}: ${effect.onMediaPlay_truthDelta > 0 ? '+' : ''}${effect.onMediaPlay_truthDelta}`);
  }
  if (typeof effect.attack_ipCostDelta === 'number' && effect.attack_ipCostDelta !== 0) {
    parts.push(`${EFFECT_LABELS.attack_ipCostDelta}: ${effect.attack_ipCostDelta > 0 ? '+' : ''}${effect.attack_ipCostDelta}`);
  }

  return parts;
};
