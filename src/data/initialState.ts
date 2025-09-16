import { buildDeck } from "./cards";
import { createEmptyPressure, STATE_DEFENSE } from "./states";
import type { Faction, GameState } from "../engine/types";

const DEFAULT_FACTIONS: Record<"P1" | "P2", Faction> = {
  P1: "truth",
  P2: "government",
};

export const createInitialGameState = (): GameState => {
  return {
    turn: 1,
    currentPlayer: "P1",
    truth: 50,
    players: {
      P1: {
        id: "P1",
        faction: DEFAULT_FACTIONS.P1,
        deck: buildDeck(DEFAULT_FACTIONS.P1),
        hand: [],
        discard: [],
        ip: 0,
        states: [],
      },
      P2: {
        id: "P2",
        faction: DEFAULT_FACTIONS.P2,
        deck: buildDeck(DEFAULT_FACTIONS.P2),
        hand: [],
        discard: [],
        ip: 0,
        states: [],
      },
    },
    pressureByState: createEmptyPressure(),
    stateDefense: { ...STATE_DEFENSE },
    playsThisTurn: 0,
  };
};
