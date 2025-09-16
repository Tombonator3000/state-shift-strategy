import { useCallback, useMemo, useState } from "react";
import { createInitialGameState } from "../data/initialState";
import { canPlay, endTurn, playCard, startTurn, winCheck } from "../engine/gameplay";
import type { Card, GameState, PlayerID } from "../engine/types";

export type WinnerResult = ReturnType<typeof winCheck>;

const prepareInitialState = (): GameState => startTurn(createInitialGameState());

export const useGameEngine = () => {
  const [state, setState] = useState<GameState>(() => prepareInitialState());
  const [winner, setWinner] = useState<WinnerResult>({});

  const resetGame = useCallback(() => {
    setWinner({});
    setState(prepareInitialState());
  }, []);

  const playCardFromHand = useCallback((cardId: string, targetStateId?: string) => {
    setState(prev => playCard(prev, cardId, targetStateId));
  }, []);

  const endCurrentTurn = useCallback((discards: string[]) => {
    setState(prev => {
      const ended = endTurn(prev, discards);
      const result = winCheck(ended);
      if (result.winner) {
        setWinner(result);
        return ended;
      }
      return startTurn(ended);
    });
  }, []);

  const playableChecker = useCallback(
    (card: Card, targetStateId?: string) => canPlay(state, card, targetStateId),
    [state],
  );

  const currentPlayer = useMemo<PlayerID>(() => state.currentPlayer, [state.currentPlayer]);

  return {
    state,
    winner,
    currentPlayer,
    resetGame,
    playCardFromHand,
    endCurrentTurn,
    canPlayCard: playableChecker,
  };
};
