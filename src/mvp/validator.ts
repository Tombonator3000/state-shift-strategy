import type { Faction, GameCard, MVPCardType, Rarity } from '@/rules/mvp';
import { expectedCost, MVP_CARD_TYPES } from '@/rules/mvp';

export type EffectsATTACK = {
  ipDelta: { opponent: number };
  discardOpponent?: 0 | 1 | 2;
};

export type EffectsMEDIA = {
  truthDelta: number;
};

export type EffectsZONE = {
  pressureDelta: number;
};

export type MVPGameCard = GameCard & {
  rarity: Rarity;
  type: MVPCardType;
  effects: EffectsATTACK | EffectsMEDIA | EffectsZONE;
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
};

export type GameState = {
  turn: number;
  currentPlayer: PlayerId;
  truth: number;
  players: Record<PlayerId, PlayerState>;
  pressureByState: Record<string, { P1: number; P2: number }>;
  stateDefense: Record<string, number>;
  playsThisTurn: number;
  log: string[];
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

const sanitizeAttackEffects = (
  rawEffects: unknown,
  changes: string[],
  warnings: string[],
): EffectsATTACK => {
  const source = (typeof rawEffects === 'object' && rawEffects !== null
    ? (rawEffects as Record<string, unknown>)
    : {}) as Record<string, unknown>;

  let opponentDelta: number | null = null;

  if (typeof source.ipDelta === 'number') {
    opponentDelta = source.ipDelta;
    changes.push('normalized ATTACK ipDelta from number to object form');
  } else if (typeof source.ipDelta === 'object' && source.ipDelta !== null) {
    opponentDelta = toNumber((source.ipDelta as Record<string, unknown>).opponent);
  }

  if (opponentDelta === null || opponentDelta <= 0) {
    warnings.push('ATTACK cards require ipDelta.opponent > 0; defaulting to 1');
    opponentDelta = 1;
  }

  const attack: EffectsATTACK = {
    ipDelta: { opponent: clampInteger(opponentDelta, 1, 9) },
  };

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

  const allowedKeys = new Set(['ipDelta', 'discardOpponent']);
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

  const extraKeys =
    rawEffects && typeof rawEffects === 'object'
      ? Object.keys(rawEffects as Record<string, unknown>).filter(key => key !== 'truthDelta')
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
      key => key !== 'pressureDelta',
    );
    if (extraKeys.length > 0) {
      changes.push(`removed unsupported ZONE effect keys: ${extraKeys.join(', ')}`);
    }
  }

  if (delta === null || delta <= 0) {
    warnings.push('ZONE cards require pressureDelta > 0; defaulting to 1');
    delta = 1;
  }

  return { pressureDelta: clampInteger(delta, 1, 9) };
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
      if (attack.discardOpponent && attack.discardOpponent > 0) {
        parts.push(
          attack.discardOpponent === 1
            ? 'Opponent discards 1 card'
            : `Opponent discards ${attack.discardOpponent} cards`,
        );
      }
      return `${parts.join('. ')}.`;
    }
    case 'MEDIA': {
      const media = effects as EffectsMEDIA;
      const value = media.truthDelta;
      const sign = value >= 0 ? '+' : '';
      return `${sign}${value}% Truth.`;
    }
    case 'ZONE': {
      const zone = effects as EffectsZONE;
      return `+${zone.pressureDelta} Pressure to a state.`;
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
  let effects: EffectsATTACK | EffectsMEDIA | EffectsZONE;
  if (type === 'ATTACK') {
    effects = sanitizeAttackEffects(source.effects, changes, warnings);
  } else if (type === 'MEDIA') {
    effects = sanitizeMediaEffects(source.effects, changes, warnings);
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

  const card: MVPGameCard = {
    id,
    name,
    faction,
    type,
    rarity,
    cost: expectedCost(type, rarity),
    effects,
  };

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

  const autoText = createMvpText(type, effects);
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

  if (ALLOWED_TYPES.includes(card.type) && ALLOWED_RARITIES.includes(card.rarity)) {
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
  return {
    ...state,
    log: [...state.log],
    players: {
      P1: clonePlayer(state.players.P1),
      P2: clonePlayer(state.players.P2),
    },
    pressureByState: Object.fromEntries(
      Object.entries(state.pressureByState).map(([id, value]) => [id, { ...value }]),
    ),
    stateDefense: { ...state.stateDefense },
  };
}

