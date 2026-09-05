import type { GameState } from './gameStateTypes';

export function isHumanActionWindow(state: Pick<GameState, 'phase' | 'currentPlayer' | 'animating' | 'isGameOver'>): boolean {
  return state.phase === 'action' && state.currentPlayer === 'human' && !state.animating && !state.isGameOver;
}
