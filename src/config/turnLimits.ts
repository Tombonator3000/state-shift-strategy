export const DEFAULT_MAX_CARDS_PER_TURN = 3;

export function normalizeMaxCardsPerTurn(value: number | undefined | null): number {
  if (typeof value !== 'number' || !Number.isFinite(value)) {
    return DEFAULT_MAX_CARDS_PER_TURN;
  }
  return Math.max(1, Math.floor(value));
}
