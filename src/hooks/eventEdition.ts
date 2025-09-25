import type { GameEvent } from '@/data/eventDatabase';

export interface EditionEventSnapshot {
  turn: number;
  round: number;
  currentEvents: GameEvent[];
}

export const buildEditionEvents = (
  state: EditionEventSnapshot,
  triggeredEvent: GameEvent | null,
): GameEvent[] => {
  const isFirstEdition = state.turn === 1 && state.round === 1;

  if (!triggeredEvent) {
    return [];
  }

  if (isFirstEdition) {
    return [triggeredEvent];
  }

  const wasAlreadyPresent = state.currentEvents.some(event => event.id === triggeredEvent.id);
  return wasAlreadyPresent ? state.currentEvents : [triggeredEvent];
};
