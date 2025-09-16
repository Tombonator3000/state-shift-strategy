import { useMemo } from 'react';
import {
  USE_MVP_RULES,
  canPlay as canPlayMvp,
  endTurn as endTurnMvp,
  playCard as playCardMvp,
  resolve as resolveMvp,
  startTurn as startTurnMvp,
  winCheck as winCheckMvp,
  type Card,
} from '@/mvp';
import { fromEngineState, toEngineState, type UIGameState } from '@/state/gameState';

type RulesAdapter = {
  startTurn: (state: UIGameState) => UIGameState;
  canPlay: (state: UIGameState, card: Card, targetStateId?: string) => { ok: boolean; reason?: string };
  playCard: (state: UIGameState, cardId: string, targetStateId?: string) => UIGameState;
  resolve: (state: UIGameState, owner: 'P1' | 'P2', card: Card, targetStateId?: string) => UIGameState;
  endTurn: (state: UIGameState, discards: string[]) => UIGameState;
  winCheck: (state: UIGameState) => ReturnType<typeof winCheckMvp>;
};

const createMvpAdapter = (): RulesAdapter => ({
  startTurn: state => fromEngineState(startTurnMvp(toEngineState(state))),
  canPlay: (state, card, targetStateId) => canPlayMvp(toEngineState(state), card, targetStateId),
  playCard: (state, cardId, targetStateId) =>
    fromEngineState(playCardMvp(toEngineState(state), cardId, targetStateId)),
  resolve: (state, owner, card, targetStateId) =>
    fromEngineState(resolveMvp(toEngineState(state), owner, card, targetStateId)),
  endTurn: (state, discards) => fromEngineState(endTurnMvp(toEngineState(state), discards)),
  winCheck: state => winCheckMvp(toEngineState(state)),
});

export const useRules = (): RulesAdapter => {
  return useMemo(() => {
    const adapter = createMvpAdapter();
    return USE_MVP_RULES ? adapter : adapter;
  }, []);
};
