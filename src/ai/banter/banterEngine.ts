import { getBanterBank } from './index';
import { getEditor, type EditorId } from '../editors';

export type TriggerKey =
  | 'onCardPlay_media_self' | 'onCardPlay_media_opponent'
  | 'onCardPlay_attack_self'| 'onCardPlay_attack_opponent'
  | 'onCardPlay_zone_self'  | 'onCardPlay_zone_opponent'
  | 'onStateCaptured_self'  | 'onStateCaptured_opponent'
  | 'onStateLost_self'      | 'onStateLost_opponent'
  | 'onTruthThreshold_75'   | 'onTruthThreshold_95'
  | 'onComboActivated_self' | 'onComboActivated_opponent'
  | 'onVictory_self'        | 'onDefeat_self'
  | 'idle';

type CardPlayCategory = 'ATTACK' | 'MEDIA' | 'ZONE';

type BanterRateLimit = { minTurnGap?: number; maxPerTurn?: number };

export type BanterUi = (message: string) => void;

export const defaultBanterUi: BanterUi = message => {
  if (typeof window !== 'undefined') {
    const toast = (window as unknown as { uiToastBanter?: (msg: string) => void }).uiToastBanter;
    if (typeof toast === 'function') {
      toast(message);
      return;
    }
  }
  if (typeof console !== 'undefined' && typeof console.warn === 'function') {
    console.warn(message);
  }
};

const defaultRateLimit: Required<BanterRateLimit> = { minTurnGap: 1, maxPerTurn: 2 };

const cardPlayTriggers: Record<'self' | 'opponent', Record<CardPlayCategory, TriggerKey>> = {
  self: {
    ATTACK: 'onCardPlay_attack_self',
    MEDIA: 'onCardPlay_media_self',
    ZONE: 'onCardPlay_zone_self',
  },
  opponent: {
    ATTACK: 'onCardPlay_attack_opponent',
    MEDIA: 'onCardPlay_media_opponent',
    ZONE: 'onCardPlay_zone_opponent',
  },
};

const stateChangeTriggers: Record<'captured' | 'lost', Record<'self' | 'opponent', TriggerKey>> = {
  captured: {
    self: 'onStateCaptured_self',
    opponent: 'onStateCaptured_opponent',
  },
  lost: {
    self: 'onStateLost_self',
    opponent: 'onStateLost_opponent',
  },
};

let lastTurnSpoken = -999;
let spokenThisTurn = 0;

const resolveRateLimit = (rateLimit?: BanterRateLimit) => {
  const min = Number.isFinite(rateLimit?.minTurnGap)
    ? Math.max(0, Math.trunc(rateLimit?.minTurnGap as number))
    : defaultRateLimit.minTurnGap;
  const max = Number.isFinite(rateLimit?.maxPerTurn)
    ? Math.max(0, Math.trunc(rateLimit?.maxPerTurn as number))
    : defaultRateLimit.maxPerTurn;
  return { minTurnGap: min, maxPerTurn: max };
};

export const getCardPlayTrigger = (
  category: CardPlayCategory,
  perspective: 'self' | 'opponent',
): TriggerKey => cardPlayTriggers[perspective][category];

export const getStateChangeTrigger = (
  change: 'captured' | 'lost',
  perspective: 'self' | 'opponent',
): TriggerKey => stateChangeTriggers[change][perspective];

export async function emitBanter(
  editorId: string,
  trigger: TriggerKey,
  turn: number,
  ui: BanterUi,
): Promise<void> {
  try {
    const bank = await getBanterBank(editorId as EditorId);
    const rateLimit = resolveRateLimit(bank.rateLimit);
    if (turn !== lastTurnSpoken) {
      lastTurnSpoken = turn;
      spokenThisTurn = 0;
    }
    if (spokenThisTurn >= rateLimit.maxPerTurn) {
      return;
    }
    if (spokenThisTurn > 0 && turn - lastTurnSpoken < rateLimit.minTurnGap) {
      return;
    }
    const options = bank.triggers?.[trigger] ?? [];
    if (!options.length) {
      return;
    }
    const choice = options[Math.floor(Math.random() * options.length)];
    const name = getEditor(editorId as EditorId)?.name ?? 'Editor';
    ui(`[${name}] ${choice}`);
    spokenThisTurn += 1;
  } catch {
    // no-op by design – banter should never block gameplay
  }
}
