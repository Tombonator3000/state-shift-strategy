import { useCallback, useEffect, useMemo, useState } from "react";
import { Hand } from "./components/Hand";
import { PlayerSummary } from "./components/PlayerSummary";
import { StatePressureTable } from "./components/StatePressureTable";
import { TruthTracker } from "./components/TruthTracker";
import { WinnerBanner } from "./components/WinnerBanner";
import { STATES } from "./data/states";
import { useGameEngine } from "./hooks/useGameEngine";
import type { Card } from "./engine/types";

const useDiscardSelection = () => {
  const [selection, setSelection] = useState<Set<string>>(new Set());
  const toggle = useCallback((cardId: string) => {
    setSelection(prev => {
      const next = new Set(prev);
      if (next.has(cardId)) {
        next.delete(cardId);
      } else {
        next.add(cardId);
      }
      return next;
    });
  }, []);
  const clear = useCallback(() => setSelection(new Set()), []);
  const sync = useCallback((ids: string[]) => {
    setSelection(prev => {
      const filtered = new Set(ids.filter(id => prev.has(id)));
      if (filtered.size === prev.size) {
        return prev;
      }
      return filtered;
    });
  }, []);
  return { selection, toggle, clear, sync };
};

const App = () => {
  const { state, currentPlayer, winner, resetGame, playCardFromHand, endCurrentTurn, canPlayCard } = useGameEngine();
  const { selection: discardSelection, toggle: toggleDiscard, clear: clearDiscard, sync } = useDiscardSelection();

  const currentHand = state.players[currentPlayer].hand;

  useEffect(() => {
    sync(currentHand.map(card => card.id));
  }, [currentHand, sync]);

  const canPlayWrapper = (card: Card, target?: string) => {
    if (winner.winner) {
      return { ok: false, reason: "Game over" };
    }
    return canPlayCard(card, target);
  };

  const handlePlay = (cardId: string, target?: string) => {
    if (winner.winner) return;
    playCardFromHand(cardId, target);
  };

  const handleEndTurn = () => {
    if (winner.winner) return;
    endCurrentTurn(Array.from(discardSelection));
    clearDiscard();
  };

  const discardCost = Math.max(0, discardSelection.size - 1);

  const info = useMemo(() => ({
    plays: state.playsThisTurn,
    limit: state.playsThisTurn >= 3,
  }), [state.playsThisTurn]);

  return (
    <div className="app">
      <header className="app-header">
        <div>
          <h1>Paranoid Times · MVP Engine</h1>
          <p>Current Player: {currentPlayer}</p>
          <p>Truth Level: {state.truth.toFixed(0)}%</p>
          <p>Plays this turn: {info.plays} / 3</p>
        </div>
        <div className="controls">
          <button type="button" onClick={resetGame}>Reset Game</button>
          <button type="button" onClick={handleEndTurn} disabled={!!winner.winner}>
            End Turn (discard {discardSelection.size} · cost {discardCost} IP)
          </button>
        </div>
      </header>

      <WinnerBanner winner={winner} />

      <TruthTracker value={state.truth} />

      <div className="board">
        <div className="column">
          <PlayerSummary player={state.players.P1} />
          <PlayerSummary player={state.players.P2} />
          <StatePressureTable game={state} />
        </div>
        <div className="column">
          <h2>Hand</h2>
          {info.limit && <p className="warning">Play limit reached this turn.</p>}
          <Hand
            cards={currentHand}
            playable={canPlayWrapper}
            states={STATES}
            discardSelection={discardSelection}
            onPlay={handlePlay}
            onToggleDiscard={toggleDiscard}
          />
        </div>
      </div>
    </div>
  );
};

export default App;
