import type { GameEvent } from '@/data/eventDatabase';

export interface EditionEventSnapshot {
  turn: number;
  round: number;
  currentEvents: GameEvent[];
}

export const buildEditionEvents = (
  state: EditionEventSnapshot,
  newEvents: GameEvent[],
): GameEvent[] => {
  const existing = [...state.currentEvents];
  if (!newEvents.length) {
    return existing;
  }

  const merged = [...existing];
  for (const event of newEvents) {
    const existingIndex = merged.findIndex(candidate => candidate.id === event.id);
    if (existingIndex === -1) {
      merged.push(event);
    } else {
      merged[existingIndex] = event;
    }
  }

  return merged;
};
