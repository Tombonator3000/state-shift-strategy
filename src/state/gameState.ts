import type { GameState } from '@/mvp';

export type UIGameState = GameState;

export const toEngineState = (state: UIGameState): GameState => state;

export const fromEngineState = (state: GameState): UIGameState => state;
