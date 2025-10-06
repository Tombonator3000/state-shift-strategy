import type { AIBanterCooldownEntry, AIBanterCooldownState } from '@/hooks/gameStateTypes';

export interface BanterTriggerRateLimit {
  minTurnGap?: number;
  maxPerTurn?: number;
}

export interface BanterTriggerRequest extends BanterTriggerRateLimit {
  category: string;
  lineId?: string | null;
}

export type BanterTriggerBlockReason = 'cooldown' | 'perTurnLimit' | 'invalidCategory';

export interface BanterTriggerResult {
  emitted: boolean;
  reason?: BanterTriggerBlockReason;
}

const normalizeCategory = (category: string): string => category.trim().toLowerCase();

const sanitizeTurn = (value: number): number => {
  if (!Number.isFinite(value)) {
    return 0;
  }
  return Math.max(0, Math.floor(value));
};

const getEntry = (
  state: AIBanterCooldownState,
  category: string,
): AIBanterCooldownEntry => {
  const existing = state.categories[category];
  if (existing) {
    return existing;
  }

  const created: AIBanterCooldownEntry = { availableAt: 0 };
  state.categories[category] = created;
  return created;
};

const computeNextAvailability = (currentTurn: number, minTurnGap?: number): number => {
  if (!minTurnGap || !Number.isFinite(minTurnGap) || minTurnGap <= 0) {
    return currentTurn;
  }
  const gap = Math.floor(minTurnGap);
  return currentTurn + Math.max(1, gap);
};

export const createEmptyCooldownState = (): AIBanterCooldownState => ({ categories: {} });

export const tryConsumeBanterTrigger = (
  state: AIBanterCooldownState,
  request: BanterTriggerRequest,
  turn: number,
): BanterTriggerResult => {
  const normalizedCategory = normalizeCategory(request.category ?? '');
  if (!normalizedCategory) {
    return { emitted: false, reason: 'invalidCategory' };
  }

  const currentTurn = sanitizeTurn(turn);
  const entry = getEntry(state, normalizedCategory);
  const availableTurn = sanitizeTurn(entry.availableAt ?? 0);

  if (currentTurn < availableTurn) {
    return { emitted: false, reason: 'cooldown' };
  }

  const lastEmittedTurn = sanitizeTurn(entry.lastEmittedTurn ?? -1);
  const sameTurn = lastEmittedTurn === currentTurn;
  const previousCount = sameTurn ? sanitizeTurn(entry.countThisTurn ?? 0) : 0;
  const maxPerTurn = request.maxPerTurn && request.maxPerTurn > 0 ? Math.floor(request.maxPerTurn) : Infinity;

  if (previousCount >= maxPerTurn) {
    return { emitted: false, reason: 'perTurnLimit' };
  }

  const nextCount = sameTurn ? previousCount + 1 : 1;
  const nextAvailable = computeNextAvailability(currentTurn, request.minTurnGap);

  entry.availableAt = Math.max(nextAvailable, currentTurn);
  entry.lastEmittedTurn = currentTurn;
  entry.countThisTurn = nextCount;
  if (request.lineId !== undefined) {
    entry.lastLineId = request.lineId;
  }

  return { emitted: true };
};
