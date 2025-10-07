import rawEditors from '@/data/editors.json';
import { CARD_DATABASE } from '@/data/cardDatabase';

export type EditorId = string;
export type EditorFaction = 'truth' | 'government';
export type EditorEffectKind = 'bonus' | 'tradeoff' | 'modifier';

export interface EditorEffectConfig {
  ipIncomePerTurn?: number;
  mediaTruthModifier?: number;
  zonePressureBonus?: number;
  attackCostDelta?: number;
  startDiscardChance?: number;
  startIpDelta?: number;
  deckSizeDelta?: number;
  startCards?: string[];
}

export interface EditorDefinition {
  id: EditorId;
  name: string;
  faction: EditorFaction;
  quote?: string;
  bonuses?: EditorEffectConfig;
  tradeoffs?: EditorEffectConfig;
  modifiers?: EditorEffectConfig;
  aiPersonality?: string;
  banterPack?: string;
}

const editors: EditorDefinition[] = (rawEditors as EditorDefinition[]).map(editor => ({
  ...editor,
  faction: editor.faction === 'government' ? 'government' : 'truth',
  bonuses: editor.bonuses ?? {},
  tradeoffs: editor.tradeoffs ?? {},
  modifiers: editor.modifiers ?? {},
}));

export const EDITORS: readonly EditorDefinition[] = editors;

export const EDITOR_INDEX: Readonly<Record<EditorId, EditorDefinition>> = Object.freeze(
  editors.reduce<Record<EditorId, EditorDefinition>>((acc, editor) => {
    acc[editor.id] = editor;
    return acc;
  }, {}),
);

export const getEditors = (): EditorDefinition[] => [...editors];

export const getEditorsByFaction = (faction: EditorFaction): EditorDefinition[] =>
  editors.filter(editor => editor.faction === faction);

export const getEditorById = (id?: EditorId | null): EditorDefinition | undefined => {
  if (!id) return undefined;
  return EDITOR_INDEX[id];
};

type NumericEffectKey =
  | 'ipIncomePerTurn'
  | 'mediaTruthModifier'
  | 'zonePressureBonus'
  | 'attackCostDelta'
  | 'startDiscardChance'
  | 'startIpDelta'
  | 'deckSizeDelta';

const NUMERIC_EFFECT_KEYS: readonly NumericEffectKey[] = [
  'ipIncomePerTurn',
  'mediaTruthModifier',
  'zonePressureBonus',
  'attackCostDelta',
  'startDiscardChance',
  'startIpDelta',
  'deckSizeDelta',
];

export interface EditorAggregatedEffects {
  ipIncomePerTurn: number;
  mediaTruthModifier: number;
  zonePressureBonus: number;
  attackCostDelta: number;
  startDiscardChance: number;
  startIpDelta: number;
  deckSizeDelta: number;
  startCards: string[];
}

const EMPTY_EFFECTS: EditorAggregatedEffects = {
  ipIncomePerTurn: 0,
  mediaTruthModifier: 0,
  zonePressureBonus: 0,
  attackCostDelta: 0,
  startDiscardChance: 0,
  startIpDelta: 0,
  deckSizeDelta: 0,
  startCards: [],
};

const clampChance = (value: number): number => {
  if (!Number.isFinite(value)) {
    return 0;
  }
  return Math.max(0, Math.min(1, value));
};

const mergeEffectConfig = (
  target?: EditorAggregatedEffects,
  config?: EditorEffectConfig,
): EditorAggregatedEffects => {
  const next: EditorAggregatedEffects = {
    ...EMPTY_EFFECTS,
    ...(target ?? {}),
    startCards: Array.isArray(target?.startCards) ? [...target.startCards] : [],
  };

  if (!config) {
    return next;
  }

  for (const key of NUMERIC_EFFECT_KEYS) {
    const value = config[key];
    if (typeof value === 'number' && Number.isFinite(value) && value !== 0) {
      if (key === 'startDiscardChance') {
        next.startDiscardChance = clampChance(next.startDiscardChance + value);
      } else {
        next[key] = (next[key] ?? 0) + value;
      }
    }
  }

  if (Array.isArray(config.startCards) && config.startCards.length > 0) {
    next.startCards = [...next.startCards, ...config.startCards];
  }

  return next;
};

export const getEditorAggregatedEffects = (
  editor: EditorDefinition | null | undefined,
): EditorAggregatedEffects => {
  if (!editor) {
    return { ...EMPTY_EFFECTS };
  }

  const merged =
    mergeEffectConfig(
      mergeEffectConfig(mergeEffectConfig(undefined, editor.bonuses), editor.tradeoffs),
      editor.modifiers,
    ) ?? { ...EMPTY_EFFECTS };
  const startCards = Array.isArray(merged.startCards) ? merged.startCards : [];
  return {
    ...merged,
    startCards: Array.from(new Set(startCards)),
  };
};

export const getEditorEffectConfig = (
  editor: EditorDefinition | null | undefined,
  kind: EditorEffectKind,
): EditorEffectConfig => {
  if (!editor) {
    return {};
  }
  if (kind === 'bonus') return editor.bonuses ?? {};
  if (kind === 'tradeoff') return editor.tradeoffs ?? {};
  return editor.modifiers ?? {};
};

const CARD_NAME_LOOKUP = new Map<string, string>(
  CARD_DATABASE.map(card => [card.id, card.name] as const),
);

const formatSigned = (value: number): string => (value > 0 ? `+${value}` : `${value}`);

const describeDeckSize = (value: number): string =>
  value > 0 ? `Deck size ${formatSigned(value)}` : `Deck size ${formatSigned(value)}`;

const describeStartCards = (cards: string[]): string => {
  const names = cards.map(cardId => CARD_NAME_LOOKUP.get(cardId) ?? cardId);
  return `Start cards: ${names.join(', ')}`;
};

const describeAttackCostDelta = (value: number): string =>
  value === 0 ? '' : `Attack IP cost ${formatSigned(value)}`;

const describeMediaTruthModifier = (value: number): string =>
  value === 0 ? '' : `MEDIA truth ${formatSigned(value)}`;

const describeZonePressureBonus = (value: number): string =>
  value === 0 ? '' : `ZONE pressure ${formatSigned(value)}`;

const describeIpIncome = (value: number): string =>
  value === 0 ? '' : `IP income per turn ${formatSigned(value)}`;

const describeStartIpDelta = (value: number): string =>
  value === 0 ? '' : `Starting IP ${formatSigned(value)}`;

const describeStartDiscardChance = (value: number): string => {
  if (value <= 0) {
    return '';
  }
  const percent = Math.round(value * 100);
  return `Start of turn: ${percent}% discard 1 random card`;
};

export const describeEditorEffectConfig = (
  config?: EditorEffectConfig | null,
): string[] => {
  const descriptions: string[] = [];

  if (!config) {
    return descriptions;
  }

  if (Array.isArray(config.startCards) && config.startCards.length > 0) {
    descriptions.push(describeStartCards(config.startCards));
  }

  for (const key of NUMERIC_EFFECT_KEYS) {
    const value = config[key];
    if (typeof value !== 'number' || value === 0) {
      continue;
    }

    switch (key) {
      case 'attackCostDelta': {
        const text = describeAttackCostDelta(value);
        if (text) descriptions.push(text);
        break;
      }
      case 'mediaTruthModifier': {
        const text = describeMediaTruthModifier(value);
        if (text) descriptions.push(text);
        break;
      }
      case 'zonePressureBonus': {
        const text = describeZonePressureBonus(value);
        if (text) descriptions.push(text);
        break;
      }
      case 'ipIncomePerTurn': {
        const text = describeIpIncome(value);
        if (text) descriptions.push(text);
        break;
      }
      case 'startIpDelta': {
        const text = describeStartIpDelta(value);
        if (text) descriptions.push(text);
        break;
      }
      case 'deckSizeDelta': {
        descriptions.push(describeDeckSize(value));
        break;
      }
      case 'startDiscardChance': {
        const text = describeStartDiscardChance(value);
        if (text) descriptions.push(text);
        break;
      }
      default:
        break;
    }
  }

  return descriptions;
};

export const forEachEditorEffect = (
  editor: EditorDefinition | null | undefined,
  callback: (config: EditorEffectConfig, kind: EditorEffectKind) => void,
): void => {
  if (!editor) {
    return;
  }
  if (editor.bonuses) {
    callback(editor.bonuses, 'bonus');
  }
  if (editor.tradeoffs) {
    callback(editor.tradeoffs, 'tradeoff');
  }
  if (editor.modifiers) {
    callback(editor.modifiers, 'modifier');
  }
};

export const describeEditorEffect = (
  config?: EditorEffectConfig | null,
): string[] => describeEditorEffectConfig(config);
