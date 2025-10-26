import type { CardEffects, Faction, GameCard, MVPCardType, Rarity } from '@/rules/mvp';
import type { EditorId } from '@/game/editors';
import type { TurnPlay } from '@/game/combo.types';
import type { ArticleBlock, PlayedLite } from '@/news/types';
import type { CompositeStory, ExtraExtraFeedEntry } from '@/types/news';
import type { TabloidRelicRuntimeState } from '@/expansions/tabloidRelics/RelicTypes';
import { expectedCost, MVP_CARD_TYPES } from '@/rules/mvp';
import type {
  HybridCardConfig,
  HybridCardCondition,
  PersistentCardConfig,
  TrapCardConfig,
} from '@/game/newCardTypes';

type BaseEffects = {
  revealSecretAgenda?: boolean;
};

export type EffectsATTACK = {
  ipDelta: { opponent: number; opponentPercent?: number };
  discardOpponent?: 0 | 1 | 2;
} & BaseEffects;

export type EffectsMEDIA = {
  truthDelta: number;
} & BaseEffects;

export type EffectsZONE = {
  pressureDelta: number;
} & BaseEffects;

export type EffectsHYBRID = CardEffects;
export type EffectsTRAP = CardEffects;
export type EffectsPERSISTENT = CardEffects;

export type MVPGameCard = GameCard & {
  rarity: Rarity;
  type: MVPCardType;
  effects:
    | EffectsATTACK
    | EffectsMEDIA
    | EffectsZONE
    | EffectsHYBRID
    | EffectsTRAP
    | EffectsPERSISTENT;
  hybridConfig?: HybridCardConfig;
  trapConfig?: TrapCardConfig;
  persistentConfig?: PersistentCardConfig;
};

export type Card = MVPGameCard;

export type PlayerId = 'P1' | 'P2';

export type PlayerState = {
  id: PlayerId;
  faction: Faction;
  deck: Card[];
  hand: Card[];
  discard: Card[];
  ip: number;
  states: string[];
  nextAttackMultiplier?: number;
  activeEditorId?: EditorId | null;
};

export interface TrapRuntimeState {
  owner: PlayerId;
  cardId: string;
  cardName: string;
  triggerOn: TrapCardConfig['triggerOn'];
  effects: CardEffects;
  label: string;
  revealMessage: string;
}

export interface PersistentRuntimeState {
  owner: PlayerId;
  cardId: string;
  cardName: string;
  remaining: number;
  perTurnEffect: CardEffects;
  onExpire?: CardEffects;
  label: string;
  icon?: string;
}

export type GameState = {
  turn: number;
  currentPlayer: PlayerId;
  truth: number;
  players: Record<PlayerId, PlayerState>;
  pressureByState: Record<string, { P1: number; P2: number }>;
  stateDefense: Record<string, number>;
  playsThisTurn: number;
  turnPlays: TurnPlay[];
  log: string[];
  headlineLog: CompositeStory[];
  extraExtraFeed: ExtraExtraFeedEntry[];
  turnBuffer: PlayedLite[];
  traps: TrapRuntimeState[];
  persistentEffects: PersistentRuntimeState[];
  winner: PlayerId | 'draw' | null;
  victoryType: 'states' | 'truth' | 'ip' | null;
  finalEdition?: unknown | null;
  tabloidRelicsRuntime?: TabloidRelicRuntimeState | null;
};

export const ALLOWED_FACTIONS: readonly Faction[] = ['truth', 'government'];
export const ALLOWED_TYPES: readonly MVPCardType[] = MVP_CARD_TYPES;
export const ALLOWED_RARITIES: readonly Rarity[] = ['common', 'uncommon', 'rare', 'legendary'];

const DEV = typeof import.meta !== 'undefined' && (import.meta as any)?.env?.DEV;

const toTrimmedString = (value: unknown): string | null => {
  if (typeof value === 'string') {
    const trimmed = value.trim();
    return trimmed.length > 0 ? trimmed : null;
  }
  if (typeof value === 'number' && Number.isFinite(value)) {
    return String(value);
  }
  return null;
};

const toFaction = (value: unknown, changes: string[]): Faction => {
  const text = toTrimmedString(value)?.toLowerCase();
  if (text === 'government') {
    return 'government';
  }
  if (text === 'truth') {
    return 'truth';
  }
  if (text === 'Truth' || text === 'Government') {
    changes.push(`coerced faction '${value}' to lowercase`);
  } else if (value !== undefined) {
    changes.push(`replaced invalid faction '${value}' with 'truth'`);
  }
  return 'truth';
};

const toType = (value: unknown, changes: string[]): MVPCardType => {
  const text = toTrimmedString(value)?.toUpperCase();
  if (text && ALLOWED_TYPES.includes(text as MVPCardType)) {
    return text as MVPCardType;
  }
  if (value !== undefined && value !== null) {
    changes.push(`replaced invalid type '${value}' with 'MEDIA'`);
  }
  return 'MEDIA';
};

const toRarity = (value: unknown, changes: string[]): Rarity => {
  const text = toTrimmedString(value)?.toLowerCase();
  if (text && ALLOWED_RARITIES.includes(text as Rarity)) {
    return text as Rarity;
  }
  if (value !== undefined && value !== null) {
    changes.push(`replaced invalid rarity '${value}' with 'common'`);
  }
  return 'common';
};

const toNumber = (value: unknown): number | null => {
  if (typeof value === 'number' && Number.isFinite(value)) {
    return value;
  }
  if (typeof value === 'string') {
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : null;
  }
  return null;
};

const clampInteger = (value: number, min: number, max: number): number => {
  if (!Number.isFinite(value)) {
    return min;
  }
  const rounded = Math.round(value);
  return Math.max(min, Math.min(max, rounded));
};

const clampFraction = (value: number, min: number, max: number): number => {
  if (!Number.isFinite(value)) {
    return min;
  }
  return Math.max(min, Math.min(max, value));
};

const sanitizeAttackEffects = (
  rawEffects: unknown,
  changes: string[],
  warnings: string[],
): EffectsATTACK => {
  const source = (typeof rawEffects === 'object' && rawEffects !== null
    ? (rawEffects as Record<string, unknown>)
    : {}) as Record<string, unknown>;

  let opponentDelta: number | null = null;
  let opponentPercent: number | null = null;

  if (typeof source.ipDelta === 'number') {
    opponentDelta = source.ipDelta;
    changes.push('normalized ATTACK ipDelta from number to object form');
  } else if (typeof source.ipDelta === 'object' && source.ipDelta !== null) {
    const ipDeltaSource = source.ipDelta as Record<string, unknown>;
    opponentDelta = toNumber(ipDeltaSource.opponent);

    if (Object.prototype.hasOwnProperty.call(ipDeltaSource, 'opponentPercent')) {
      const rawPercent = toNumber(ipDeltaSource.opponentPercent);
      if (rawPercent === null) {
        warnings.push('ATTACK cards treat ipDelta.opponentPercent as number; removing invalid value');
      } else {
        const clamped = clampFraction(rawPercent, 0, 1);
        if (clamped !== rawPercent) {
          changes.push(`clamped opponentPercent from ${rawPercent} to ${clamped}`);
        }
        if (clamped > 0) {
          opponentPercent = clamped;
        }
      }
    }
  }

  if (opponentDelta === null || opponentDelta <= 0) {
    warnings.push('ATTACK cards require ipDelta.opponent > 0; defaulting to 1');
    opponentDelta = 1;
  }

  const attack: EffectsATTACK = {
    ipDelta: { opponent: clampInteger(opponentDelta, 1, 9) },
  };

  if (opponentPercent !== null) {
    attack.ipDelta.opponentPercent = clampFraction(opponentPercent, 0, 1);
  }

  if ((source as { revealSecretAgenda?: unknown }).revealSecretAgenda) {
    attack.revealSecretAgenda = true;
  }

  if (Object.prototype.hasOwnProperty.call(source, 'discardOpponent')) {
    const discard = toNumber(source.discardOpponent);
    if (discard === null) {
      warnings.push('discardOpponent must be a number; removing value');
    } else {
      const normalized = clampInteger(discard, 0, 2) as 0 | 1 | 2;
      if (normalized !== discard) {
        changes.push(`clamped discardOpponent from ${discard} to ${normalized}`);
      }
      if (normalized > 0) {
        attack.discardOpponent = normalized;
      }
    }
  }

  const allowedKeys = new Set(['ipDelta', 'discardOpponent', 'revealSecretAgenda']);
  if (typeof source.ipDelta === 'object' && source.ipDelta !== null) {
    const allowedIpKeys = new Set(['opponent', 'opponentPercent']);
    const ipKeys = Object.keys(source.ipDelta as Record<string, unknown>);
    const extraIpKeys = ipKeys.filter(key => !allowedIpKeys.has(key));
    if (extraIpKeys.length > 0) {
      changes.push(`removed unsupported ATTACK ipDelta keys: ${extraIpKeys.join(', ')}`);
    }
  }
  const extraKeys = Object.keys(source).filter(key => !allowedKeys.has(key));
  if (extraKeys.length > 0) {
    changes.push(`removed unsupported ATTACK effect keys: ${extraKeys.join(', ')}`);
  }

  return attack;
};

const sanitizeMediaEffects = (
  rawEffects: unknown,
  changes: string[],
  warnings: string[],
): EffectsMEDIA => {
  let delta: number | null = null;

  if (typeof rawEffects === 'number') {
    delta = rawEffects;
    changes.push('normalized MEDIA effects from number to object form');
  } else if (typeof rawEffects === 'object' && rawEffects !== null) {
    delta = toNumber((rawEffects as Record<string, unknown>).truthDelta);
  }

  if (delta === null) {
    warnings.push('MEDIA cards require truthDelta; defaulting to 1');
    delta = 1;
  }

  const media: EffectsMEDIA = { truthDelta: Math.round(delta) };

  if ((rawEffects as { revealSecretAgenda?: unknown })?.revealSecretAgenda) {
    media.revealSecretAgenda = true;
  }

  const extraKeys =
    rawEffects && typeof rawEffects === 'object'
      ? Object.keys(rawEffects as Record<string, unknown>).filter(
          key => !['truthDelta', 'revealSecretAgenda'].includes(key),
        )
      : [];
  if (extraKeys.length > 0) {
    changes.push(`removed unsupported MEDIA effect keys: ${extraKeys.join(', ')}`);
  }

  return media;
};

const sanitizeZoneEffects = (
  rawEffects: unknown,
  changes: string[],
  warnings: string[],
): EffectsZONE => {
  let delta: number | null = null;

  if (typeof rawEffects === 'number') {
    delta = rawEffects;
    changes.push('normalized ZONE effects from number to object form');
  } else if (typeof rawEffects === 'object' && rawEffects !== null) {
    delta = toNumber((rawEffects as Record<string, unknown>).pressureDelta);
    const extraKeys = Object.keys(rawEffects as Record<string, unknown>).filter(
      key => !['pressureDelta', 'revealSecretAgenda'].includes(key),
    );
    if (extraKeys.length > 0) {
      changes.push(`removed unsupported ZONE effect keys: ${extraKeys.join(', ')}`);
    }
  }

  if (delta === null || delta <= 0) {
    warnings.push('ZONE cards require pressureDelta > 0; defaulting to 1');
    delta = 1;
  }

  const zone: EffectsZONE = { pressureDelta: clampInteger(delta, 1, 9) };

  if ((rawEffects as { revealSecretAgenda?: unknown })?.revealSecretAgenda) {
    zone.revealSecretAgenda = true;
  }

  return zone;
};

const sanitizeGenericCardEffects = (
  rawEffects: unknown,
  changes: string[],
  warnings: string[],
): CardEffects => {
  if (typeof rawEffects !== 'object' || rawEffects === null) {
    if (typeof rawEffects !== 'undefined') {
      warnings.push('card effects must be an object; removing invalid value');
    }
    return {};
  }

  const source = rawEffects as Record<string, unknown>;
  const effects: CardEffects = {};

  if (source.revealSecretAgenda) {
    effects.revealSecretAgenda = true;
  }

  if (Object.prototype.hasOwnProperty.call(source, 'truthDelta')) {
    const truthDelta = toNumber(source.truthDelta);
    if (truthDelta === null) {
      warnings.push('truthDelta must be numeric; removing invalid value');
    } else {
      effects.truthDelta = Math.trunc(truthDelta);
    }
  }

  if (Object.prototype.hasOwnProperty.call(source, 'pressureDelta')) {
    const pressureDelta = toNumber(source.pressureDelta);
    if (pressureDelta === null) {
      warnings.push('pressureDelta must be numeric; removing invalid value');
    } else {
      effects.pressureDelta = pressureDelta;
    }
  }

  if (Object.prototype.hasOwnProperty.call(source, 'pressureToAllContested')) {
    const value = toNumber(source.pressureToAllContested);
    if (value === null) {
      warnings.push('pressureToAllContested must be numeric; removing invalid value');
    } else {
      effects.pressureToAllContested = Math.trunc(value);
    }
  }

  if (Object.prototype.hasOwnProperty.call(source, 'zoneDefense')) {
    const value = toNumber(source.zoneDefense);
    if (value === null) {
      warnings.push('zoneDefense must be numeric; removing invalid value');
    } else {
      effects.zoneDefense = Math.trunc(value);
    }
  }

  if (Object.prototype.hasOwnProperty.call(source, 'reduceFactor')) {
    const value = toNumber(source.reduceFactor);
    if (value === null) {
      warnings.push('reduceFactor must be numeric; removing invalid value');
    } else {
      effects.reduceFactor = value;
    }
  }

  if (Object.prototype.hasOwnProperty.call(source, 'ipDelta')) {
    const ipDelta = source.ipDelta;
    if (typeof ipDelta === 'number') {
      effects.ipDelta = { opponent: clampInteger(ipDelta, -99, 99) };
      changes.push('normalized ipDelta number to opponent field');
    } else if (typeof ipDelta === 'object' && ipDelta !== null) {
      const payload = ipDelta as Record<string, unknown>;
      const normalized: CardEffects['ipDelta'] = {};

      if (Object.prototype.hasOwnProperty.call(payload, 'self')) {
        const value = toNumber(payload.self);
        if (value === null) {
          warnings.push('ipDelta.self must be numeric; removing invalid value');
        } else {
          normalized.self = Math.trunc(value);
        }
      }

      if (Object.prototype.hasOwnProperty.call(payload, 'opponent')) {
        const value = toNumber(payload.opponent);
        if (value === null) {
          warnings.push('ipDelta.opponent must be numeric; removing invalid value');
        } else {
          normalized.opponent = Math.trunc(value);
        }
      }

      if (Object.prototype.hasOwnProperty.call(payload, 'opponentPercent')) {
        const value = toNumber(payload.opponentPercent);
        if (value === null) {
          warnings.push('ipDelta.opponentPercent must be numeric; removing invalid value');
        } else {
          normalized.opponentPercent = clampFraction(value, 0, 1);
        }
      }

      if (Object.keys(normalized).length > 0) {
        effects.ipDelta = normalized;
      }
    }
  }

  if (Object.prototype.hasOwnProperty.call(source, 'draw')) {
    const value = toNumber(source.draw);
    if (value === null) {
      warnings.push('draw must be numeric; removing invalid value');
    } else {
      effects.draw = clampInteger(value, 0, 9);
    }
  }

  if (Object.prototype.hasOwnProperty.call(source, 'discardOpponent')) {
    const value = toNumber(source.discardOpponent);
    if (value === null) {
      warnings.push('discardOpponent must be numeric; removing invalid value');
    } else {
      effects.discardOpponent = clampInteger(value, 0, 9);
    }
  }

  const objectKeys: (keyof CardEffects)[] = [
    'conditional',
    'ifFewerStates',
    'ifMoreStates',
    'ifTruthAbove',
    'ifTruthBelow',
    'pressurePerControlledState',
    'truthPerControlledState',
    'preventHighCostCards',
    'defenseToAllStates',
  ];

  for (const key of objectKeys) {
    const value = source[key as string];
    if (typeof value === 'object' && value !== null) {
      effects[key] = value as never;
    }
  }

  return effects;
};

const allowedHybridTypes = new Set<HybridCardCondition['type']>([
  'truth',
  'states_controlled',
  'ip',
  'turn',
]);

const allowedHybridOperators = new Set<HybridCardCondition['operator']>(['>=', '<=', '==', '>', '<']);

const sanitizeHybridCondition = (
  rawCondition: unknown,
  index: number,
  changes: string[],
  errors: string[],
): HybridCardCondition => {
  const source =
    typeof rawCondition === 'object' && rawCondition !== null
      ? (rawCondition as Record<string, unknown>)
      : {};

  const typeText = toTrimmedString(source.type)?.toLowerCase();
  const normalizedType = allowedHybridTypes.has(typeText as HybridCardCondition['type'])
    ? (typeText as HybridCardCondition['type'])
    : 'truth';
  if (!allowedHybridTypes.has(typeText as HybridCardCondition['type'])) {
    errors.push(
      `hybrid condition ${index} has invalid type "${source.type ?? 'unknown'}"; defaulting to 'truth'`,
    );
  }

  const operatorText = toTrimmedString(source.operator) ?? '>=';
  const normalizedOperator = allowedHybridOperators.has(operatorText as HybridCardCondition['operator'])
    ? (operatorText as HybridCardCondition['operator'])
    : '>=';
  if (!allowedHybridOperators.has(operatorText as HybridCardCondition['operator'])) {
    errors.push(
      `hybrid condition ${index} has invalid operator "${source.operator ?? 'unknown'}"; defaulting to '>='`,
    );
  }

  const value = toNumber(source.value);
  const costModifier = toNumber(source.costModifier);
  if (value === null) {
    errors.push(`hybrid condition ${index} missing numeric value; defaulting to 0`);
  }
  if (costModifier === null) {
    errors.push(`hybrid condition ${index} missing costModifier; defaulting to 0`);
  }

  const label = toTrimmedString(source.label) ?? `Condition ${index + 1}`;
  if (!toTrimmedString(source.label)) {
    changes.push(`added default label for hybrid condition ${index + 1}`);
  }

  return {
    type: normalizedType,
    operator: normalizedOperator,
    value: value ?? 0,
    costModifier: costModifier ?? 0,
    label,
  } satisfies HybridCardCondition;
};

const sanitizeHybridConfig = (
  rawConfig: unknown,
  rarity: Rarity,
  changes: string[],
  errors: string[],
  warnings: string[],
): HybridCardConfig => {
  const source =
    typeof rawConfig === 'object' && rawConfig !== null
      ? (rawConfig as Record<string, unknown>)
      : {};

  const baseCostValue = toNumber(source.baseCost);
  if (baseCostValue === null) {
    errors.push('hybrid cards require baseCost; using expected rarity cost');
  }

  const baseCost = baseCostValue ?? expectedCost('HYBRID', rarity);

  const conditionsSource = Array.isArray(source.conditions) ? source.conditions : [];
  if (!Array.isArray(source.conditions)) {
    warnings.push('hybrid cards expect an array of conditions; defaulting to empty array');
  }
  const conditions = conditionsSource.map((condition, index) =>
    sanitizeHybridCondition(condition, index, changes, errors),
  );

  return {
    baseCost,
    conditions,
  } satisfies HybridCardConfig;
};

const allowedTrapTriggers: TrapCardConfig['triggerOn'][] = [
  'opponent_attack',
  'opponent_media',
  'opponent_zone',
  'state_capture',
  'any_card',
];

const sanitizeTrapConfig = (
  rawConfig: unknown,
  changes: string[],
  errors: string[],
  warnings: string[],
): TrapCardConfig => {
  const source =
    typeof rawConfig === 'object' && rawConfig !== null
      ? (rawConfig as Record<string, unknown>)
      : {};

  const triggerRaw = toTrimmedString(source.triggerOn)?.toLowerCase();
  const trigger = allowedTrapTriggers.includes(triggerRaw as TrapCardConfig['triggerOn'])
    ? (triggerRaw as TrapCardConfig['triggerOn'])
    : 'any_card';
  if (!allowedTrapTriggers.includes(triggerRaw as TrapCardConfig['triggerOn'])) {
    errors.push(
      `invalid trap trigger "${source.triggerOn ?? 'unknown'}"; defaulting to 'any_card'`,
    );
  }

  const label = toTrimmedString(source.label) ?? 'Trap';
  if (!toTrimmedString(source.label)) {
    changes.push('added default trap label');
  }

  const revealMessage = toTrimmedString(source.revealMessage) ?? 'Trap triggered!';
  if (!toTrimmedString(source.revealMessage)) {
    changes.push('added default trap reveal message');
  }

  const effects = sanitizeGenericCardEffects(source.effects, changes, warnings);

  return {
    triggerOn: trigger,
    effects,
    label,
    revealMessage,
  } satisfies TrapCardConfig;
};

const sanitizePersistentConfig = (
  rawConfig: unknown,
  changes: string[],
  errors: string[],
  warnings: string[],
): PersistentCardConfig => {
  const source =
    typeof rawConfig === 'object' && rawConfig !== null
      ? (rawConfig as Record<string, unknown>)
      : {};

  const durationRaw = toNumber(source.duration);
  if (durationRaw === null || durationRaw <= 0) {
    errors.push('persistent cards require duration > 0; defaulting to 1');
  }
  const duration = clampInteger(durationRaw ?? 1, 1, 12);

  const perTurnEffect = sanitizeGenericCardEffects(source.perTurnEffect, changes, warnings);
  if (Object.keys(perTurnEffect).length === 0) {
    warnings.push('persistent cards without perTurnEffect will have no impact');
  }

  let onExpire: CardEffects | undefined;
  if (Object.prototype.hasOwnProperty.call(source, 'onExpire')) {
    onExpire = sanitizeGenericCardEffects(source.onExpire, changes, warnings);
  }

  const label = toTrimmedString(source.label) ?? 'Persistent Effect';
  if (!toTrimmedString(source.label)) {
    changes.push('added default persistent label');
  }

  const icon = toTrimmedString(source.icon) ?? undefined;

  return {
    duration,
    perTurnEffect,
    onExpire,
    label,
    ...(icon ? { icon } : {}),
  } satisfies PersistentCardConfig;
};

const normalizeFlavor = (value: unknown): string | undefined => {
  const text = toTrimmedString(value);
  return text ?? undefined;
};

const normalizeTarget = (type: MVPCardType, value: unknown, changes: string[]) => {
  if (type !== 'ZONE') {
    return undefined;
  }

  if (typeof value === 'object' && value !== null) {
    const scope = toTrimmedString((value as Record<string, unknown>).scope)?.toLowerCase();
    const count = toNumber((value as Record<string, unknown>).count);

    const normalizedScope = scope === 'state' ? 'state' : 'state';
    if (scope !== 'state' && scope !== undefined) {
      changes.push(`normalized ZONE target scope from '${scope}' to 'state'`);
    }

    const normalizedCount = clampInteger(count ?? 1, 1, 3);
    if (!count || normalizedCount !== count) {
      changes.push(`normalized ZONE target count to ${normalizedCount}`);
    }

    return { scope: normalizedScope as 'state', count: normalizedCount };
  }

  changes.push('added default ZONE target { scope: "state", count: 1 }');
  return { scope: 'state' as const, count: 1 };
};

const createMvpText = (
  type: MVPCardType,
  effects: EffectsATTACK | EffectsMEDIA | EffectsZONE,
): string | undefined => {
  switch (type) {
    case 'ATTACK': {
      const attack = effects as EffectsATTACK;
      const parts = [`Opponent -${attack.ipDelta.opponent} IP`];
      if (attack.ipDelta.opponentPercent && attack.ipDelta.opponentPercent > 0) {
        parts.push(`Opponent -${Math.round(attack.ipDelta.opponentPercent * 100)}% current IP`);
      }
      if (attack.discardOpponent && attack.discardOpponent > 0) {
        parts.push(
          attack.discardOpponent === 1
            ? 'Opponent discards 1 card'
            : `Opponent discards ${attack.discardOpponent} cards`,
        );
      }
      if (attack.revealSecretAgenda) {
        parts.push('Reveal enemy secret agenda');
      }
      return `${parts.join('. ')}.`;
    }
    case 'MEDIA': {
      const media = effects as EffectsMEDIA;
      const value = media.truthDelta;
      const sign = value >= 0 ? '+' : '';
      const parts = [`${sign}${value}% Truth`];
      if (media.revealSecretAgenda) {
        parts.push('Reveal enemy secret agenda');
      }
      return `${parts.join('. ')}.`;
    }
    case 'ZONE': {
      const zone = effects as EffectsZONE;
      const parts = [`+${zone.pressureDelta} Pressure to a state`];
      if (zone.revealSecretAgenda) {
        parts.push('Reveal enemy secret agenda');
      }
      return `${parts.join('. ')}.`;
    }
    default:
      return undefined;
  }
};

export type MVPRepairResult = {
  card: MVPGameCard;
  errors: string[];
  changes: string[];
};

export function repairToMVP(raw: unknown): MVPRepairResult {
  const changes: string[] = [];
  const errors: string[] = [];

  if (typeof raw !== 'object' || raw === null) {
    errors.push('card is not an object');
    const card: MVPGameCard = {
      id: `mvp-card-${Math.random().toString(36).slice(2, 10)}`,
      name: 'Unknown Card',
      faction: 'truth',
      type: 'MEDIA',
      rarity: 'common',
      cost: expectedCost('MEDIA', 'common'),
      effects: { truthDelta: 1 },
    };
    return { card, errors, changes };
  }

  const source = raw as Record<string, unknown>;

  const id = toTrimmedString(source.id) ?? `mvp-card-${Math.random().toString(36).slice(2, 10)}`;
  if (!toTrimmedString(source.id)) {
    errors.push('missing id; generated placeholder id');
    changes.push(`generated id ${id}`);
  }

  const name = toTrimmedString(source.name) ?? 'Unnamed Card';
  if (!toTrimmedString(source.name)) {
    errors.push('missing name; defaulted to "Unnamed Card"');
  }

  const faction = toFaction(source.faction, changes);
  const type = toType(source.type, changes);
  const rarity = toRarity(source.rarity, changes);

  const warnings: string[] = [];
  let effects: MVPGameCard['effects'];
  let hybridConfig: HybridCardConfig | undefined;
  let trapConfig: TrapCardConfig | undefined;
  let persistentConfig: PersistentCardConfig | undefined;

  if (type === 'ATTACK') {
    effects = sanitizeAttackEffects(source.effects, changes, warnings);
  } else if (type === 'MEDIA') {
    effects = sanitizeMediaEffects(source.effects, changes, warnings);
  } else if (type === 'ZONE') {
    effects = sanitizeZoneEffects(source.effects, changes, warnings);
  } else if (type === 'HYBRID') {
    effects = sanitizeGenericCardEffects(source.effects, changes, warnings);
    hybridConfig = sanitizeHybridConfig(
      (source.hybridConfig ?? source.hybrid) as unknown,
      rarity,
      changes,
      errors,
      warnings,
    );
  } else if (type === 'TRAP') {
    effects = sanitizeGenericCardEffects(source.effects, changes, warnings);
    trapConfig = sanitizeTrapConfig(
      (source.trapConfig ?? source.trap) as unknown,
      changes,
      errors,
      warnings,
    );
  } else if (type === 'PERSISTENT') {
    effects = sanitizeGenericCardEffects(source.effects, changes, warnings);
    persistentConfig = sanitizePersistentConfig(
      (source.persistentConfig ?? source.persistent) as unknown,
      changes,
      errors,
      warnings,
    );
  } else {
    effects = sanitizeZoneEffects(source.effects, changes, warnings);
  }

  warnings.forEach(message => {
    errors.push(message);
  });

  const flavor = normalizeFlavor(source.flavor);
  const flavorTruth = normalizeFlavor(source.flavorTruth) ?? flavor;
  const flavorGov = normalizeFlavor(source.flavorGov) ?? flavor;

  const target = normalizeTarget(type, source.target, changes);

  if (source.text) {
    changes.push('removed deprecated text field');
  }

  let cost = expectedCost(type, rarity);
  if (type === 'HYBRID' && hybridConfig) {
    cost = hybridConfig.baseCost;
  }

  const card: MVPGameCard = {
    id,
    name,
    faction,
    type,
    rarity,
    cost,
    effects,
  };

  if (hybridConfig) {
    card.hybridConfig = hybridConfig;
  }
  if (trapConfig) {
    card.trapConfig = trapConfig;
  }
  if (persistentConfig) {
    card.persistentConfig = persistentConfig;
  }

  if (flavor) {
    card.flavor = flavor;
  }
  if (flavorTruth) {
    card.flavorTruth = flavorTruth;
  }
  if (flavorGov) {
    card.flavorGov = flavorGov;
  }
  if (target) {
    card.target = target;
  }

  if (typeof source.extId === 'string' && source.extId.trim().length > 0) {
    card.extId = source.extId.trim();
  }

  const autoText =
    type === 'ATTACK' || type === 'MEDIA' || type === 'ZONE'
      ? createMvpText(type, effects as EffectsATTACK | EffectsMEDIA | EffectsZONE)
      : undefined;
  if (autoText) {
    card.text = autoText;
  }

  return { card, errors, changes };
}

export function validateCardMVP(card: MVPGameCard): { ok: boolean; errors: string[] } {
  const validationErrors: string[] = [];

  if (!ALLOWED_FACTIONS.includes(card.faction)) {
    validationErrors.push(`invalid faction: ${card.faction}`);
  }

  if (!ALLOWED_TYPES.includes(card.type)) {
    validationErrors.push(`invalid type: ${card.type}`);
  }

  if (!ALLOWED_RARITIES.includes(card.rarity)) {
    validationErrors.push(`invalid rarity: ${card.rarity}`);
  }

  if (card.type === 'HYBRID') {
    if (!card.hybridConfig) {
      validationErrors.push('HYBRID cards require hybridConfig');
    } else if (card.cost !== card.hybridConfig.baseCost) {
      validationErrors.push(`HYBRID cost should match baseCost ${card.hybridConfig.baseCost}`);
    }
  } else if (ALLOWED_TYPES.includes(card.type) && ALLOWED_RARITIES.includes(card.rarity)) {
    const expected = expectedCost(card.type, card.rarity);
    if (card.cost !== expected) {
      validationErrors.push(`cost should be ${expected}`);
    }
  }

  switch (card.type) {
    case 'ATTACK': {
      const effects = card.effects as EffectsATTACK;
      if (effects.ipDelta.opponent <= 0) {
        validationErrors.push('ATTACK cards require ipDelta.opponent > 0');
      }
      if (
        typeof effects.ipDelta.opponentPercent !== 'undefined' &&
        (typeof effects.ipDelta.opponentPercent !== 'number' ||
          Number.isNaN(effects.ipDelta.opponentPercent) ||
          effects.ipDelta.opponentPercent < 0 ||
          effects.ipDelta.opponentPercent > 1)
      ) {
        validationErrors.push('ipDelta.opponentPercent must be between 0 and 1 when present');
      }
      if (
        typeof effects.discardOpponent !== 'undefined' &&
        ![0, 1, 2].includes(effects.discardOpponent)
      ) {
        validationErrors.push('discardOpponent must be 0, 1 or 2 when present');
      }
      break;
    }
    case 'MEDIA': {
      const effects = card.effects as EffectsMEDIA;
      if (typeof effects.truthDelta !== 'number' || Number.isNaN(effects.truthDelta)) {
        validationErrors.push('MEDIA cards require numeric truthDelta');
      }
      break;
    }
    case 'ZONE': {
      const effects = card.effects as EffectsZONE;
      if (effects.pressureDelta <= 0) {
        validationErrors.push('ZONE cards require pressureDelta > 0');
      }
      if (!card.target || card.target.scope !== 'state') {
        validationErrors.push('ZONE cards require state target');
      }
      break;
    }
    case 'HYBRID': {
      const config = card.hybridConfig;
      if (!config) {
        validationErrors.push('HYBRID cards require hybridConfig');
      } else {
        if (config.conditions.length === 0) {
          validationErrors.push('HYBRID cards require at least one cost condition');
        }
      }
      break;
    }
    case 'TRAP': {
      const config = card.trapConfig;
      if (!config) {
        validationErrors.push('TRAP cards require trapConfig');
      }
      break;
    }
    case 'PERSISTENT': {
      const config = card.persistentConfig;
      if (!config) {
        validationErrors.push('PERSISTENT cards require persistentConfig');
      } else if (config.duration <= 0) {
        validationErrors.push('persistentConfig.duration must be > 0');
      }
      break;
    }
  }

  if (DEV && validationErrors.length > 0) {
    console.warn('[MVP VALIDATOR]', card.id, validationErrors);
  }

  return { ok: validationErrors.length === 0, errors: validationErrors };
}

export function clonePlayer(player: PlayerState): PlayerState {
  return {
    ...player,
    deck: [...player.deck],
    hand: [...player.hand],
    discard: [...player.discard],
    states: [...player.states],
  };
}

export function cloneGameState(state: GameState): GameState {
  const clonedRuntime = state.tabloidRelicsRuntime
    ? {
        entries: state.tabloidRelicsRuntime.entries.map((entry: TabloidRelicRuntimeState['entries'][number]) => ({ ...entry })),
        lastIssueRound: state.tabloidRelicsRuntime.lastIssueRound,
        lastUpdatedTurn: state.tabloidRelicsRuntime.lastUpdatedTurn,
        selectionHistory: [...(state.tabloidRelicsRuntime.selectionHistory ?? [])],
      }
    : state.tabloidRelicsRuntime ?? null;

  const cloneArticle = (article: ArticleBlock | null): ArticleBlock | null => {
    if (!article) {
      return null;
    }
    return {
      tone: article.tone,
      hed: article.hed,
      dek: article.dek,
      bullets: [...article.bullets],
      byline: article.byline,
      source: article.source,
      ...(article.body ? { body: [...article.body] } : {}),
      ...(article.imagePrompt ? { imagePrompt: article.imagePrompt } : {}),
      ...(article.kicker ? { kicker: article.kicker } : {}),
      ...(article.stinger ? { stinger: article.stinger } : {}),
      ...(article.templateId ? { templateId: article.templateId } : {}),
      ...(article.comboId ? { comboId: article.comboId } : {}),
    } satisfies ArticleBlock;
  };

  const cloneArticleStrict = (article: ArticleBlock): ArticleBlock => cloneArticle(article)!;

  const cloneCompositeStory = (entry: CompositeStory): CompositeStory => ({
    tone: entry.tone,
    tags: [...entry.tags],
    headline: entry.headline,
    subhead: entry.subhead,
    byline: 'Composite Desk',
    body: [...entry.body],
    ...(entry.imagePrompt ? { imagePrompt: entry.imagePrompt } : {}),
    sources: entry.sources.map((source: any) => ({
      id: source.id,
      headline: source.headline,
      ...(source.subhead ? { subhead: source.subhead } : {}),
    })),
  });

  const cloneExtraExtraEntry = (entry: ExtraExtraFeedEntry): ExtraExtraFeedEntry => {
    if (entry.kind === 'composite') {
      return { kind: 'composite', data: cloneCompositeStory(entry.data) };
    }

    return { kind: entry.kind, data: cloneArticleStrict(entry.data) } as ExtraExtraFeedEntry;
  };

  return {
    ...state,
    log: [...state.log],
    headlineLog: state.headlineLog.map(cloneCompositeStory),
    extraExtraFeed: state.extraExtraFeed.map(cloneExtraExtraEntry),
    turnBuffer: state.turnBuffer.map(play => ({ ...play })),
    turnPlays: state.turnPlays.map(play => ({
      ...play,
      metadata: play.metadata ? { ...play.metadata } : undefined,
    })),
    traps: (state.traps ?? []).map(trap => ({
      ...trap,
      effects: { ...(trap.effects ?? {}) },
    })),
    persistentEffects: (state.persistentEffects ?? []).map(effect => ({
      ...effect,
      perTurnEffect: { ...(effect.perTurnEffect ?? {}) },
      ...(effect.onExpire ? { onExpire: { ...effect.onExpire } } : {}),
    })),
    players: {
      P1: clonePlayer(state.players.P1),
      P2: clonePlayer(state.players.P2),
    },
    pressureByState: Object.fromEntries(
      Object.entries(state.pressureByState).map(([id, value]) => [id, { ...value }]),
    ),
    stateDefense: { ...state.stateDefense },
    tabloidRelicsRuntime: clonedRuntime,
  };
}

