import type { GameCard, MVPCardType } from '@/rules/mvp';
import { MVP_CARD_TYPES, expectedCost } from '@/rules/mvp';

export interface MvpEffectSummary {
  truthDelta: number;
  ipDeltaOpponent: number;
  ipDeltaOpponentPercent: number;
  ipDeltaOpponentExpected: number;
  pressureDelta: number;
}

export const LATE_GAME_REFERENCE_IP = 50;

export type MvpCostStatus = 'On Curve' | 'Undercosted' | 'Overcosted';

export function getMvpEffectSummary(card: GameCard): MvpEffectSummary {
  const effects = card.effects ?? {};
  const truthDelta = effects.truthDelta ?? 0;
  const ipDeltaOpponent = effects.ipDelta?.opponent ?? 0;
  const ipPercentRaw = effects.ipDelta?.opponentPercent ?? 0;
  const ipDeltaOpponentPercent = Math.max(0, Math.min(1, Number(ipPercentRaw) || 0));
  const scaledLoss =
    ipDeltaOpponentPercent > 0 ? Math.floor(ipDeltaOpponentPercent * LATE_GAME_REFERENCE_IP) : 0;
  const pressureDelta = effects.pressureDelta ?? 0;

  return {
    truthDelta,
    ipDeltaOpponent,
    ipDeltaOpponentPercent,
    ipDeltaOpponentExpected: ipDeltaOpponent + scaledLoss,
    pressureDelta,
  };
}

export function getExpectedMvpCost(card: GameCard): number | null {
  const rarity = card.rarity;
  const type = card.type;

  if (!rarity || !MVP_CARD_TYPES.includes(type as MVPCardType)) {
    return null;
  }

  try {
    return expectedCost(type, rarity);
  } catch (error) {
    return null;
  }
}

export function classifyMvpCost(
  card: GameCard,
  expected: number | null,
  tolerance: number = 1
): { status: MvpCostStatus; delta: number | null } {
  if (expected === null) {
    return { status: 'On Curve', delta: null };
  }

  const delta = card.cost - expected;
  if (Math.abs(delta) <= tolerance) {
    return { status: 'On Curve', delta };
  }

  if (delta < 0) {
    return { status: 'Undercosted', delta };
  }

  return { status: 'Overcosted', delta };
}

export function computeMvpEffectScore(summary: MvpEffectSummary): number {
  const truthWeight = Math.abs(summary.truthDelta);
  const ipWeight = Math.abs(summary.ipDeltaOpponentExpected);
  const pressureWeight = Math.abs(summary.pressureDelta) * 5;

  return truthWeight + ipWeight + pressureWeight;
}

export function normalizeFaction(
  faction: GameCard['faction']
): 'truth' | 'government' | 'neutral' {
  if (!faction) return 'neutral';
  const normalized = faction.toString().toLowerCase();

  if (normalized === 'truth') return 'truth';
  if (normalized === 'government') return 'government';
  return 'neutral';
}

export function summarizeFactionCounts(cards: GameCard[]): {
  truth: number;
  government: number;
  neutral: number;
} {
  return cards.reduce(
    (acc, card) => {
      const faction = normalizeFaction(card.faction);
      acc[faction]++;
      return acc;
    },
    { truth: 0, government: 0, neutral: 0 } as {
      truth: number;
      government: number;
      neutral: number;
    }
  );
}
