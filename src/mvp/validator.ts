import type {
  Card,
  CardType,
  EffectsATTACK,
  EffectsMEDIA,
  EffectsZONE,
  Faction,
  GameState,
  PlayerState,
  Rarity,
} from './types';

export const ALLOWED_FACTIONS: readonly Faction[] = ['truth', 'government'];
export const ALLOWED_TYPES: readonly CardType[] = ['ATTACK', 'MEDIA', 'ZONE'];
export const ALLOWED_RARITIES: readonly Rarity[] = ['common', 'uncommon', 'rare', 'legendary'];

export const COST_TABLE: Record<CardType, Record<Rarity, number>> = {
  ATTACK: { common: 2, uncommon: 3, rare: 4, legendary: 5 },
  MEDIA: { common: 3, uncommon: 4, rare: 5, legendary: 6 },
  ZONE: { common: 4, uncommon: 5, rare: 6, legendary: 7 },
};

export function expectedCost(type: CardType, rarity: Rarity): number {
  return COST_TABLE[type][rarity];
}

const isNonEmptyString = (value: unknown): value is string =>
  typeof value === 'string' && value.trim().length > 0;

const toNumber = (value: unknown): number | null => {
  if (typeof value === 'number' && Number.isFinite(value)) {
    return value;
  }
  if (typeof value === 'string' && value.trim().length > 0) {
    const parsed = Number(value);
    if (!Number.isNaN(parsed) && Number.isFinite(parsed)) {
      return parsed;
    }
  }
  return null;
};

const CARD_ALLOWED_KEYS = new Set([
  'id',
  'name',
  'faction',
  'type',
  'rarity',
  'cost',
  'effects',
  'artId',
  'flavor',
  'tags',
]);

const ATTACK_EFFECT_KEYS = new Set(['ipDelta', 'discardOpponent']);
const MEDIA_EFFECT_KEYS = new Set(['truthDelta']);
const ZONE_EFFECT_KEYS = new Set(['pressureDelta']);

export type CardValidationResult = {
  card?: Card;
  errors: string[];
  changes: string[];
};

export function sanitizeCard(raw: unknown): CardValidationResult {
  const errors: string[] = [];
  const changes: string[] = [];

  if (typeof raw !== 'object' || raw === null) {
    return { errors: ['card is not an object'], changes };
  }

  const input = raw as Record<string, unknown>;

  if (!isNonEmptyString(input.id)) {
    errors.push('missing id');
  }
  if (!isNonEmptyString(input.name)) {
    errors.push('missing name');
  }

  const faction = input.faction;
  if (!ALLOWED_FACTIONS.includes(faction as Faction)) {
    errors.push(`invalid faction: ${faction}`);
  }

  const type = input.type;
  if (!ALLOWED_TYPES.includes(type as CardType)) {
    errors.push(`invalid type: ${type}`);
  }

  const rarity = input.rarity;
  if (!ALLOWED_RARITIES.includes(rarity as Rarity)) {
    errors.push(`invalid rarity: ${rarity}`);
  }

  if (errors.length > 0) {
    return { errors, changes };
  }

  const typedType = type as CardType;
  const typedRarity = rarity as Rarity;
  const typedFaction = faction as Faction;

  const extraCardKeys = Object.keys(input).filter(key => !CARD_ALLOWED_KEYS.has(key));
  if (extraCardKeys.length > 0) {
    changes.push(`removed unsupported card keys: ${extraCardKeys.join(', ')}`);
  }

  const sanitizeAttack = (value: unknown): EffectsATTACK | null => {
    if (typeof value !== 'object' || value === null) {
      errors.push('ATTACK card requires effects object');
      return null;
    }
    const effects = value as Record<string, unknown>;

    let opponentDelta: number | null = null;
    if (typeof effects.ipDelta === 'number') {
      opponentDelta = effects.ipDelta;
      changes.push('normalized ipDelta to object form');
    } else if (typeof effects.ipDelta === 'object' && effects.ipDelta !== null) {
      opponentDelta = toNumber((effects.ipDelta as Record<string, unknown>).opponent);
      const extra = Object.keys(effects.ipDelta as Record<string, unknown>).filter(
        key => key !== 'opponent',
      );
      if (extra.length > 0) {
        changes.push(`removed unsupported ipDelta keys: ${extra.join(', ')}`);
      }
    }

    if (opponentDelta === null || opponentDelta <= 0) {
      errors.push('ATTACK card requires ipDelta.opponent > 0');
      return null;
    }

    const extraKeys = Object.keys(effects).filter(key => !ATTACK_EFFECT_KEYS.has(key));
    if (extraKeys.length > 0) {
      changes.push(`removed unsupported ATTACK effect keys: ${extraKeys.join(', ')}`);
    }

    const attackEffects: EffectsATTACK = {
      ipDelta: { opponent: opponentDelta },
    };

    if (Object.prototype.hasOwnProperty.call(effects, 'discardOpponent')) {
      const discard = toNumber(effects.discardOpponent);
      if (discard === null || !Number.isInteger(discard) || discard < 0 || discard > 2) {
        errors.push('discardOpponent must be 0, 1 or 2');
      } else if (discard > 0) {
        attackEffects.discardOpponent = discard as 0 | 1 | 2;
      }
    }

    return attackEffects;
  };

  const sanitizeMedia = (value: unknown): EffectsMEDIA | null => {
    const delta = toNumber((value as Record<string, unknown>)?.truthDelta);
    if (delta === null) {
      errors.push('MEDIA card requires truthDelta');
      return null;
    }
    const extraKeys =
      value && typeof value === 'object'
        ? Object.keys(value as Record<string, unknown>).filter(
            key => !MEDIA_EFFECT_KEYS.has(key),
          )
        : [];
    if (extraKeys.length > 0) {
      changes.push(`removed unsupported MEDIA effect keys: ${extraKeys.join(', ')}`);
    }
    return { truthDelta: delta };
  };

  const sanitizeZone = (value: unknown): EffectsZONE | null => {
    const delta = toNumber((value as Record<string, unknown>)?.pressureDelta);
    if (delta === null || delta <= 0) {
      errors.push('ZONE card requires pressureDelta > 0');
      return null;
    }
    const extraKeys =
      value && typeof value === 'object'
        ? Object.keys(value as Record<string, unknown>).filter(
            key => !ZONE_EFFECT_KEYS.has(key),
          )
        : [];
    if (extraKeys.length > 0) {
      changes.push(`removed unsupported ZONE effect keys: ${extraKeys.join(', ')}`);
    }
    return { pressureDelta: delta };
  };

  let effects: EffectsATTACK | EffectsMEDIA | EffectsZONE | null = null;
  if (typedType === 'ATTACK') {
    effects = sanitizeAttack(input.effects);
  } else if (typedType === 'MEDIA') {
    effects = sanitizeMedia(input.effects);
  } else {
    effects = sanitizeZone(input.effects);
  }

  if (effects === null) {
    return { errors, changes };
  }

  const card: Card = {
    id: (input.id as string).trim(),
    name: (input.name as string).trim(),
    faction: typedFaction,
    type: typedType,
    rarity: typedRarity,
    cost: expectedCost(typedType, typedRarity),
    effects,
  };

  if (input.cost !== card.cost) {
    changes.push(`cost set to ${card.cost}`);
  }

  if (isNonEmptyString(input.artId)) {
    card.artId = input.artId;
  }
  if (isNonEmptyString(input.flavor)) {
    card.flavor = input.flavor;
  }
  if (Array.isArray(input.tags)) {
    const tags = input.tags.filter(tag => typeof tag === 'string' && tag.trim().length > 0);
    if (tags.length > 0) {
      card.tags = tags;
    }
  }

  return { card, errors, changes };
}

export function validateCard(card: Card): { ok: boolean; errors: string[] } {
  const errors: string[] = [];

  if (!ALLOWED_FACTIONS.includes(card.faction)) {
    errors.push(`invalid faction: ${card.faction}`);
  }

  if (!ALLOWED_TYPES.includes(card.type)) {
    errors.push(`invalid type: ${card.type}`);
  }

  if (!ALLOWED_RARITIES.includes(card.rarity)) {
    errors.push(`invalid rarity: ${card.rarity}`);
  }

  const expected = expectedCost(card.type, card.rarity);
  if (card.cost !== expected) {
    errors.push(`cost should be ${expected}`);
  }

  switch (card.type) {
    case 'ATTACK': {
      const effects = card.effects as EffectsATTACK;
      if (!effects?.ipDelta || effects.ipDelta.opponent <= 0) {
        errors.push('ATTACK cards require ipDelta.opponent > 0');
      }
      if (
        typeof effects.discardOpponent !== 'undefined' &&
        ![0, 1, 2].includes(effects.discardOpponent)
      ) {
        errors.push('discardOpponent must be 0, 1 or 2 when present');
      }
      break;
    }
    case 'MEDIA': {
      const effects = card.effects as EffectsMEDIA;
      if (typeof effects.truthDelta !== 'number' || Number.isNaN(effects.truthDelta)) {
        errors.push('MEDIA cards require numeric truthDelta');
      }
      break;
    }
    case 'ZONE': {
      const effects = card.effects as EffectsZONE;
      if (!effects || effects.pressureDelta <= 0) {
        errors.push('ZONE cards require pressureDelta > 0');
      }
      break;
    }
  }

  return { ok: errors.length === 0, errors };
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
