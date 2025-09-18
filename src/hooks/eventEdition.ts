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
  const events: GameEvent[] = [];

  const isFirstEdition = state.turn === 1 && state.round === 1;
  if (isFirstEdition && state.currentEvents.length > 0) {
    events.push(...state.currentEvents);
  }

  if (triggeredEvent) {
    events.push(triggeredEvent);
  }

  return events;
};
