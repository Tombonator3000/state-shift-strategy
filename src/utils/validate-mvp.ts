import type { GameCard, MVPCardType, Rarity } from '@/rules/mvp';
import { MVP_CARD_TYPES, expectedCost } from '@/rules/mvp';

const MVP_FACTIONS = ['truth', 'government'] as const;
const MVP_RARITIES: readonly Rarity[] = ['common', 'uncommon', 'rare', 'legendary'];

export const EFFECT_WHITELIST: Record<MVPCardType, ReadonlySet<string>> = {
  ATTACK: new Set(['ipDelta', 'discardOpponent']),
  MEDIA: new Set(['truthDelta']),
  ZONE: new Set(['pressureDelta']),
};

type IssueCode =
  | 'invalid-faction'
  | 'invalid-type'
  | 'invalid-rarity'
  | 'missing-effects'
  | 'invalid-effect-key'
  | 'invalid-effect-value'
  | 'invalid-zone-target'
  | 'invalid-cost';

export interface ValidationIssue {
  code: IssueCode;
  message: string;
}

export interface ValidationResult {
  cardId: string;
  cardName: string;
  cardType: string | undefined;
  rarity: string | undefined;
  faction: string | undefined;
  ok: boolean;
  issues: ValidationIssue[];
  checks: {
    factionOk: boolean;
    typeOk: boolean;
    rarityOk: boolean;
    effectWhitelistOk: boolean;
    effectValuesOk: boolean;
    targetOk: boolean;
    costOk: boolean;
  };
}

export interface ValidationSummary {
  totalCards: number;
  validCards: number;
  invalidCards: number;
  successCount: number;
  errorCount: number;
  successRate: number;
  results: ValidationResult[];
  allResults: ValidationResult[];
}

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === 'object' && value !== null;

const normalizeFaction = (value: unknown): (typeof MVP_FACTIONS)[number] | null => {
  if (typeof value !== 'string') {
    return null;
  }
  const normalized = value.toLowerCase();
  return MVP_FACTIONS.includes(normalized as (typeof MVP_FACTIONS)[number])
    ? (normalized as (typeof MVP_FACTIONS)[number])
    : null;
};

const normalizeType = (value: unknown): MVPCardType | null => {
  if (typeof value !== 'string') {
    return null;
  }
  const normalized = value.toUpperCase();
  return MVP_CARD_TYPES.includes(normalized as MVPCardType)
    ? (normalized as MVPCardType)
    : null;
};

const normalizeRarity = (value: unknown): Rarity | null => {
  if (typeof value !== 'string') {
    return null;
  }
  const normalized = value.toLowerCase();
  return MVP_RARITIES.includes(normalized as Rarity) ? (normalized as Rarity) : null;
};

const toNumber = (value: unknown): number | null => {
  if (typeof value === 'number' && Number.isFinite(value)) {
    return value;
  }
  if (typeof value === 'string') {
    const parsed = Number(value);
    if (Number.isFinite(parsed)) {
      return parsed;
    }
  }
  return null;
};

export function validateMvpCard(card: GameCard): ValidationResult {
  const issues: ValidationIssue[] = [];

  const faction = normalizeFaction(card.faction);
  const type = normalizeType(card.type);
  const rarity = normalizeRarity(card.rarity);

  const factionOk = faction !== null;
  if (!factionOk) {
    issues.push({
      code: 'invalid-faction',
      message: `Invalid faction "${card.faction ?? 'unknown'}". Expected: truth or government.`,
    });
  }

  const typeOk = type !== null;
  if (!typeOk) {
    issues.push({
      code: 'invalid-type',
      message: `Invalid type "${card.type ?? 'unknown'}". MVP allows ATTACK, MEDIA or ZONE.`,
    });
  }

  const rarityOk = rarity !== null;
  if (!rarityOk) {
    issues.push({
      code: 'invalid-rarity',
      message: `Invalid rarity "${card.rarity ?? 'unknown'}". Expected: common, uncommon, rare or legendary.`,
    });
  }

  const effects = card.effects;
  const hasEffects = isRecord(effects) && Object.keys(effects).length > 0;
  let effectWhitelistOk = true;
  let effectValuesOk = true;
  let targetOk = true;

  if (!hasEffects) {
    effectValuesOk = false;
    issues.push({
      code: 'missing-effects',
      message: 'Card is missing MVP effects.',
    });
  }

  if (hasEffects && typeOk) {
    const allowedKeys = EFFECT_WHITELIST[type as MVPCardType];
    const effectKeys = Object.keys(effects as Record<string, unknown>);
    const invalidKeys = effectKeys.filter(key => !allowedKeys.has(key));
    if (invalidKeys.length > 0) {
      effectWhitelistOk = false;
      issues.push({
        code: 'invalid-effect-key',
        message: `Invalid effect keys: ${invalidKeys.join(', ')}. Allowed: ${Array.from(allowedKeys).join(', ')}.`,
      });
    }

    switch (type) {
      case 'ATTACK': {
        const ipDelta = isRecord((effects as Record<string, unknown>).ipDelta)
          ? ((effects as Record<string, unknown>).ipDelta as Record<string, unknown>)
          : null;
        if (!ipDelta) {
          effectValuesOk = false;
          issues.push({
            code: 'invalid-effect-value',
            message: 'ATTACK cards require effects.ipDelta with opponent damage.',
          });
          break;
        }

        const extraKeys = Object.keys(ipDelta).filter(key => key !== 'opponent');
        if (extraKeys.length > 0) {
          effectValuesOk = false;
          issues.push({
            code: 'invalid-effect-key',
            message: `ipDelta may only include "opponent". Found: ${extraKeys.join(', ')}.`,
          });
        }

        const opponentDelta = toNumber(ipDelta.opponent);
        if (opponentDelta === null || opponentDelta <= 0 || !Number.isInteger(opponentDelta)) {
          effectValuesOk = false;
          issues.push({
            code: 'invalid-effect-value',
            message: `ipDelta.opponent must be a positive integer. Found: ${ipDelta.opponent ?? 'missing'}.`,
          });
        }

        if ('discardOpponent' in (effects as Record<string, unknown>)) {
          const discardValue = toNumber((effects as Record<string, unknown>).discardOpponent);
          if (discardValue === null || ![0, 1, 2].includes(discardValue)) {
            effectValuesOk = false;
            issues.push({
              code: 'invalid-effect-value',
              message: `discardOpponent must be 0, 1 or 2 when present. Found: ${(effects as Record<string, unknown>).discardOpponent ?? 'missing'}.`,
            });
          }
        }
        break;
      }
      case 'MEDIA': {
        const truthDelta = toNumber((effects as Record<string, unknown>).truthDelta);
        if (truthDelta === null) {
          effectValuesOk = false;
          issues.push({
            code: 'invalid-effect-value',
            message: 'MEDIA cards require numeric truthDelta.',
          });
        }
        break;
      }
      case 'ZONE': {
        const pressureDelta = toNumber((effects as Record<string, unknown>).pressureDelta);
        if (pressureDelta === null || pressureDelta <= 0) {
          effectValuesOk = false;
          issues.push({
            code: 'invalid-effect-value',
            message: 'ZONE cards require pressureDelta > 0.',
          });
        }
        targetOk = card.target?.scope === 'state' && card.target?.count === 1;
        if (!targetOk) {
          issues.push({
            code: 'invalid-zone-target',
            message: 'ZONE cards must target a single state: { scope: "state", count: 1 }.',
          });
        }
        break;
      }
      default:
        break;
    }
  }

  const costValue = toNumber(card.cost);
  let costOk = costValue !== null;
  if (!costOk) {
    issues.push({
      code: 'invalid-cost',
      message: `Invalid cost "${card.cost ?? 'missing'}". MVP cards require numeric cost.`,
    });
  } else if (typeOk && rarityOk) {
    const expected = expectedCost(type as MVPCardType, rarity as Rarity);
    if (costValue !== expected) {
      costOk = false;
      issues.push({
        code: 'invalid-cost',
        message: `Cost ${costValue} does not match MVP expectation ${expected} for ${type} ${rarity}.`,
      });
    }
  }

  const ok =
    factionOk &&
    typeOk &&
    rarityOk &&
    effectWhitelistOk &&
    effectValuesOk &&
    targetOk &&
    costOk;

  return {
    cardId: card.id,
    cardName: card.name ?? 'Unnamed Card',
    cardType: card.type,
    rarity: card.rarity as string | undefined,
    faction: card.faction as string | undefined,
    ok,
    issues,
    checks: {
      factionOk,
      typeOk,
      rarityOk,
      effectWhitelistOk,
      effectValuesOk,
      targetOk,
      costOk,
    },
  };
}

export function validateMvpCards(cards: GameCard[]): ValidationSummary {
  const results = cards.map(validateMvpCard);
  const validCards = results.filter(result => result.ok).length;
  const invalidCards = results.length - validCards;
  const successRate = cards.length === 0 ? 100 : (validCards / cards.length) * 100;

  return {
    totalCards: cards.length,
    validCards,
    invalidCards,
    successCount: validCards,
    errorCount: invalidCards,
    successRate,
    results: results.filter(result => !result.ok),
    allResults: results,
  };
}
