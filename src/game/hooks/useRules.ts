import { useMemo } from 'react';
import {
  canPlay as canPlayMvp,
  endTurn as endTurnMvp,
  playCard as playCardMvp,
  resolve as resolveMvp,
  startTurn as startTurnMvp,
  winCheck as winCheckMvp,
  type Card,
} from '@/mvp';
import type { UIGameState } from '@/state/gameState';

type RulesAdapter = {
  startTurn: (state: UIGameState) => UIGameState;
  canPlay: (state: UIGameState, card: Card, targetStateId?: string) => { ok: boolean; reason?: string };
  playCard: (state: UIGameState, cardId: string, targetStateId?: string) => UIGameState;
  resolve: (state: UIGameState, owner: 'P1' | 'P2', card: Card, targetStateId?: string) => UIGameState;
  endTurn: (state: UIGameState, discards: string[]) => UIGameState;
  winCheck: (state: UIGameState) => ReturnType<typeof winCheckMvp>;
};

const MVP_RULES: RulesAdapter = {
  startTurn: state => startTurnMvp(state),
  canPlay: (state, card, targetStateId) => canPlayMvp(state, card, targetStateId),
  playCard: (state, cardId, targetStateId) => playCardMvp(state, cardId, targetStateId),
  resolve: (state, owner, card, targetStateId) => resolveMvp(state, owner, card, targetStateId),
  endTurn: (state, discards) => endTurnMvp(state, discards),
  winCheck: state => winCheckMvp(state),
};

export const useRules = (): RulesAdapter => {
  return useMemo(() => MVP_RULES, []);
};
