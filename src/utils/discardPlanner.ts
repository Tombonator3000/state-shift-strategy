import type { GameCard } from '@/rules/mvp';

export interface DiscardPlanOutcome {
  remainingHand: GameCard[];
  updatedDiscardPile: GameCard[];
  discardedCards: GameCard[];
  discardedCount: number;
  ipCost: number;
  costBreakdown: number[];
  logEntry: string | null;
}

const FIRST_EXTRA_DISCARD_COST = 10;
const ADDITIONAL_DISCARD_STEP = 5;

const normalizeDiscards = (ids: string[]): string[] => ids.filter(id => typeof id === 'string' && id.trim().length > 0);

export const planDiscardOutcome = (
  hand: GameCard[],
  discardPile: GameCard[],
  discards: string[],
): DiscardPlanOutcome => {
  const plannedIds = normalizeDiscards(discards);
  if (plannedIds.length === 0) {
    return {
      remainingHand: [...hand],
      updatedDiscardPile: [...discardPile],
      discardedCards: [],
      discardedCount: 0,
      ipCost: 0,
      costBreakdown: [],
      logEntry: null,
    };
  }

  const discardCounts = new Map<string, number>();
  for (const id of plannedIds) {
    discardCounts.set(id, (discardCounts.get(id) ?? 0) + 1);
  }

  const remainingHand: GameCard[] = [];
  const updatedDiscardPile: GameCard[] = [...discardPile];
  const discardedCards: GameCard[] = [];

  for (const card of hand) {
    const count = discardCounts.get(card.id) ?? 0;
    if (count > 0) {
      discardCounts.set(card.id, count - 1);
      discardedCards.push(card);
      updatedDiscardPile.push(card);
    } else {
      remainingHand.push(card);
    }
  }

  const discardedCount = discardedCards.length;
  if (discardedCount === 0) {
    return {
      remainingHand,
      updatedDiscardPile,
      discardedCards,
      discardedCount: 0,
      ipCost: 0,
      costBreakdown: [],
      logEntry: null,
    };
  }

  const costBreakdown: number[] = [];
  for (let index = 0; index < discardedCount; index += 1) {
    if (index === 0) {
      costBreakdown.push(0);
      continue;
    }
    const incrementalCost = FIRST_EXTRA_DISCARD_COST + (index - 1) * ADDITIONAL_DISCARD_STEP;
    costBreakdown.push(incrementalCost);
  }

  const ipCost = costBreakdown.reduce((total, cost) => total + cost, 0);
  const logEntry = `Discarded ${discardedCount} card${discardedCount === 1 ? '' : 's'}${
    ipCost > 0 ? ` (paid ${ipCost} IP)` : ' (first free)'
  }`;

  return {
    remainingHand,
    updatedDiscardPile,
    discardedCards,
    discardedCount,
    ipCost,
    costBreakdown,
    logEntry,
  };
};

export const previewDiscardCost = (plannedDiscards: string[]): { totalCost: number; breakdown: number[] } => {
  const normalized = normalizeDiscards(plannedDiscards);
  if (normalized.length <= 1) {
    return { totalCost: 0, breakdown: normalized.map(() => 0) };
  }

  const breakdown: number[] = [];
  for (let index = 0; index < normalized.length; index += 1) {
    if (index === 0) {
      breakdown.push(0);
      continue;
    }
    breakdown.push(FIRST_EXTRA_DISCARD_COST + (index - 1) * ADDITIONAL_DISCARD_STEP);
  }

  const totalCost = breakdown.reduce((total, value) => total + value, 0);
  return { totalCost, breakdown };
};
