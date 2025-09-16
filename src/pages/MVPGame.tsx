import React from 'react';
import { useMVPGameState } from '@/hooks/useMVPGameState';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import type { MVPCard } from '@/types/mvp-types';

export default function MVPGame() {
  const { gameState, initGame, playCard, endTurn, discardCard } = useMVPGameState();

  if (!gameState) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Card className="p-6">
          <h1 className="text-2xl font-bold mb-4">Shadow Government MVP</h1> 
          <p className="mb-4">Choose your faction:</p>
          <div className="flex gap-4">
            <Button onClick={() => initGame('truth')}>
              Play as Truth
            </Button>
            <Button onClick={() => initGame('government')}>
              Play as Government
            </Button>
          </div>
        </Card>
      </div>
    );
  }

  const humanPlayer = gameState.players.P1;
  const aiPlayer = gameState.players.P2;

  return (
    <div className="min-h-screen bg-background p-4">
      <div className="max-w-6xl mx-auto">
        {/* Game Status */}
        <div className="mb-4 p-4 bg-card rounded-lg">
          <div className="flex justify-between items-center">
            <div>
              <h2 className="text-xl font-bold">Turn {gameState.turn}</h2>
              <p>Player: {humanPlayer.faction} | Truth: {gameState.truth}%</p>
            </div>
            <div className="text-right">
              <p>Your IP: {humanPlayer.ip} | AI IP: {aiPlayer.ip}</p>
              <p>Your States: {humanPlayer.states.length} | AI States: {aiPlayer.states.length}</p>
            </div>
          </div>
        </div>

        {/* Current Player Indicator */}
        <div className="mb-4 p-2 bg-accent rounded text-center">
          {gameState.currentPlayer === "P1" ? "Your Turn" : "AI Turn"}
          {gameState.currentPlayer === "P1" && (
            <span className="ml-2 text-sm">
              (Plays this turn: {humanPlayer.playsThisTurn}/3)
            </span>
          )}
        </div>

        {/* Hand */}
        <div className="mb-6">
          <h3 className="text-lg font-semibold mb-2">Your Hand ({humanPlayer.hand.length})</h3>
          <div className="flex gap-2 overflow-x-auto pb-2">
            {humanPlayer.hand.map((card: MVPCard) => (
              <Card key={card.id} className="min-w-[200px] p-3">
                <div className="text-sm font-medium">{card.name}</div>
                <div className="text-xs text-muted-foreground mb-2">
                  {card.type} | {card.rarity} | Cost: {card.cost}
                </div> 
                <div className="text-xs mb-2">{card.text}</div>
                <div className="text-xs text-muted-foreground mb-2">
                  Effects: {JSON.stringify(card.effects)}
                </div>
                <div className="flex gap-1">
                  <Button 
                    size="sm" 
                    onClick={() => playCard(card.id)}
                    disabled={gameState.currentPlayer !== "P1" || humanPlayer.ip < card.cost || humanPlayer.playsThisTurn >= 3}
                  >
                    Play
                  </Button>
                  {card.type === 'ZONE' && (
                    <Button 
                      size="sm" 
                      variant="outline"
                      onClick={() => playCard(card.id, 'CA')} // Example: target California
                      disabled={gameState.currentPlayer !== "P1" || humanPlayer.ip < card.cost || humanPlayer.playsThisTurn >= 3}
                    >
                      Play (CA)
                    </Button>
                  )}
                  <Button 
                    size="sm" 
                    variant="ghost"
                    onClick={() => discardCard(card.id)}
                  >
                    Discard
                  </Button>
                </div>
              </Card>
            ))}
          </div>
        </div>

        {/* AI Hand Info */}
        <div className="mb-4">
          <h3 className="text-lg font-semibold mb-2">AI Hand</h3>
          <p className="text-sm text-muted-foreground">
            AI has {aiPlayer.hand.length} cards (Plays this turn: {aiPlayer.playsThisTurn}/3)
          </p>
        </div>

        {/* Controls */}
        <div className="flex gap-2">
          <Button 
            onClick={endTurn}
            disabled={gameState.currentPlayer !== "P1"}
          >
            End Turn
          </Button>
          <Button 
            variant="outline"
            onClick={() => initGame(humanPlayer.faction)}
          >
            New Game
          </Button>
        </div>

        {/* State Pressure (simplified display) */}
        <div className="mt-6">
          <h3 className="text-lg font-semibold mb-2">State Pressure (Sample)</h3>
          <div className="grid grid-cols-4 gap-2 text-xs">
            {Object.entries(gameState.pressureByState).slice(0, 8).map(([stateId, pressure]) => (
              <Card key={stateId} className="p-2">
                <div className="font-medium">{stateId}</div>
                <div>P1: {pressure.P1} | P2: {pressure.P2}</div>
                <div>Defense: {gameState.stateDefense[stateId]}</div>
              </Card>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}