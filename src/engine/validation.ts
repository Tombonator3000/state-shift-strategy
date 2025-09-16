import { CARD_TYPES, MVP_COST_TABLE, MVP_EFFECT_TABLE, RARITIES } from "./constants";
import type { Card, EffectsATTACK, EffectsMEDIA, EffectsZONE, GameState } from "./types";

const ID_PREFIX: Record<Card["faction"], string> = {
  truth: "TR-",
  government: "GV-",
};

const clamp = (value: number, min: number, max: number) => Math.max(min, Math.min(max, value));

export const ensureValidTruth = (value: number) => clamp(value, 0, 100);

export const validateCard = (card: Card): Card => {
  if (!CARD_TYPES.includes(card.type)) {
    throw new Error(`Card ${card.id}: invalid type ${card.type}`);
  }

  if (!RARITIES.includes(card.rarity)) {
    throw new Error(`Card ${card.id}: invalid rarity ${card.rarity}`);
  }

  if (!ID_PREFIX[card.faction]) {
    throw new Error(`Card ${card.id}: invalid faction ${card.faction}`);
  }

  if (!card.id.startsWith(ID_PREFIX[card.faction])) {
    throw new Error(`Card ${card.id}: id must start with ${ID_PREFIX[card.faction]}`);
  }

  const expectedCost = MVP_COST_TABLE[card.type][card.rarity];
  if (card.cost !== expectedCost) {
    throw new Error(`Card ${card.id}: cost ${card.cost} does not match MVP table (${expectedCost})`);
  }

  const effects = card.effects as EffectsATTACK | EffectsMEDIA | EffectsZONE;
  const effectKeys = Object.keys(effects);

  switch (card.type) {
    case "ATTACK": {
      const attack = effects as EffectsATTACK;
      if (!attack.ipDelta || typeof attack.ipDelta.opponent !== "number") {
        throw new Error(`Card ${card.id}: ATTACK must have effects.ipDelta.opponent`);
      }
      const expected = MVP_EFFECT_TABLE.ATTACK[card.rarity];
      if (attack.ipDelta.opponent !== expected) {
        throw new Error(`Card ${card.id}: ATTACK ipDelta.opponent must be ${expected}`);
      }
      const discard = attack.discardOpponent;
      if (discard !== undefined) {
        if (!Number.isInteger(discard) || discard < 0 || discard > 2) {
          throw new Error(`Card ${card.id}: discardOpponent must be an integer between 0 and 2`);
        }
        if (card.rarity === "rare" && discard !== 1) {
          throw new Error(`Card ${card.id}: rare ATTACK may only discard 1 card`);
        }
        if (card.rarity === "legendary" && discard !== 1 && discard !== 2) {
          throw new Error(`Card ${card.id}: legendary ATTACK discardOpponent must be 1 or 2`);
        }
        if (card.rarity === "common" || card.rarity === "uncommon") {
          throw new Error(`Card ${card.id}: discardOpponent not allowed for ${card.rarity} ATTACK`);
        }
      }
      if (effectKeys.some(key => key !== "ipDelta" && key !== "discardOpponent")) {
        throw new Error(`Card ${card.id}: ATTACK effects contain forbidden keys`);
      }
      break;
    }
    case "MEDIA": {
      const media = effects as EffectsMEDIA;
      if (effectKeys.length !== 1 || effectKeys[0] !== "truthDelta") {
        throw new Error(`Card ${card.id}: MEDIA effects must only include truthDelta`);
      }
      if (typeof media.truthDelta !== "number") {
        throw new Error(`Card ${card.id}: MEDIA truthDelta must be a number`);
      }
      const expected = MVP_EFFECT_TABLE.MEDIA[card.rarity];
      if (Math.abs(media.truthDelta) !== expected) {
        throw new Error(`Card ${card.id}: MEDIA truthDelta magnitude must be ${expected}`);
      }
      break;
    }
    case "ZONE": {
      const zone = effects as EffectsZONE;
      if (effectKeys.length !== 1 || effectKeys[0] !== "pressureDelta") {
        throw new Error(`Card ${card.id}: ZONE effects must only include pressureDelta`);
      }
      if (typeof zone.pressureDelta !== "number" || zone.pressureDelta <= 0) {
        throw new Error(`Card ${card.id}: ZONE pressureDelta must be a positive number`);
      }
      const expected = MVP_EFFECT_TABLE.ZONE[card.rarity];
      if (zone.pressureDelta !== expected) {
        throw new Error(`Card ${card.id}: ZONE pressureDelta must be ${expected}`);
      }
      break;
    }
    default:
      throw new Error(`Card ${card.id}: unsupported type ${card.type}`);
  }

  return card;
};

export const validateCards = (cards: Card[]): Card[] => cards.map(validateCard);

export const cloneState = <T>(value: T): T => {
  if (typeof structuredClone === "function") {
    return structuredClone(value);
  }
  return JSON.parse(JSON.stringify(value));
};

export const assertState = (state: GameState) => {
  const players = Object.values(state.players);
  for (const player of players) {
    for (const card of [...player.deck, ...player.hand, ...player.discard]) {
      validateCard(card);
    }
  }
};
