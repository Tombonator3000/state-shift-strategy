import type { RoundContext } from '@/features/newspaper/generate';
import type { Card } from '@/types';
import type { TabloidPlayedCard } from './TabloidNewspaperLegacy';

export const formatTruthDelta = (value?: number) => {
  if (value === undefined || Number.isNaN(value) || value === 0) {
    return null;
  }
  const rounded = Math.abs(value) < 1 ? Math.round(value * 10) / 10 : Math.round(value);
  const sign = value > 0 ? '+' : value < 0 ? '−' : '';
  return `${sign}${Math.abs(rounded)}%`;
};

export const buildRoundContext = (
  playerCards: TabloidPlayedCard[],
  opponentCards: TabloidPlayedCard[],
  eventsTruthDelta: number,
  comboTruthDelta = 0,
): RoundContext => {
  const truthFromPlayer = playerCards.reduce((sum, entry) => sum + (entry.truthDelta ?? 0), 0);
  const truthFromOpponent = opponentCards.reduce((sum, entry) => sum + (entry.truthDelta ?? 0), 0);
  const capturedStates = playerCards.flatMap(entry => entry.capturedStates ?? []);

  return {
    truthDeltaTotal: truthFromPlayer + truthFromOpponent + eventsTruthDelta + comboTruthDelta,
    capturedStates,
    cardsPlayedByYou: playerCards.map(entry => entry.card as Card),
    cardsPlayedByOpp: opponentCards.map(entry => entry.card as Card),
  };
};
