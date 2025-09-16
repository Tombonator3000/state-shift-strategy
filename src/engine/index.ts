import type { Card, Deck } from "@/types/public";

export type UIOnlyState = {
  playerHand: Card[];
  aiHand: Card[];
  deck: Deck;
  round: number;
  log: string[];
};

export function createState(seed: Deck = []): UIOnlyState {
  return {
    playerHand: seed.slice(0, 5),
    aiHand: seed.slice(5, 10),
    deck: seed.slice(10),
    round: 1,
    log: []
  };
}

export function playCard(state: UIOnlyState, handIndex: number) {
  const c = state.playerHand[handIndex];
  if (!c) return { toast: "No card at that slot." } as const;
  state.log.push(`Played: ${c.name}`);
  return { toast: `Played: ${c.name}`, newspaper: `"${c.name}" makes headlines` } as const;
}

export function endTurn(state: UIOnlyState) {
  state.round++;
  return { toast: `Round ${state.round}`, mapPulse: "CA" } as const;
}

export function aiAction(state: UIOnlyState) {
  const c = state.aiHand[0];
  if (!c) return { toast: "AI is idling..." } as const;
  state.log.push(`AI showcased: ${c.name}`);
  return { toast: `AI showcased: ${c.name}` } as const;
}
