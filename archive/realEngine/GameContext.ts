import { createContext } from 'react';

export interface PressureRecord {
  [stateId: string]: { P1: number; P2: number };
}

export interface GameContextValue {
  state: {
    pressureByState: PressureRecord;
  };
}

export const GameContext = createContext<GameContextValue | null>(null);
