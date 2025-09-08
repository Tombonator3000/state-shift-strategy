import { useEffect, useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import GameMap from '@/components/game/GameMap';
import GameHand from '@/components/game/GameHand';
import TruthMeter from '@/components/game/TruthMeter';
import Newspaper from '@/components/game/Newspaper';
import GameMenu from '@/components/game/GameMenu';
import SecretAgenda from '@/components/game/SecretAgenda';
import { useGameState } from '@/hooks/useGameState';

const Index = () => {
  const [showMenu, setShowMenu] = useState(true);
  const [showIntro, setShowIntro] = useState(true);
  const { gameState, initGame, playCard, endTurn } = useGameState();

  const startNewGame = (faction: 'government' | 'truth') => {
    initGame(faction);
    setShowMenu(false);
    setShowIntro(false);
  };

  if (showIntro) {
    return (
      <div 
        className="min-h-screen bg-government-dark flex items-center justify-center cursor-pointer"
        onClick={() => setShowIntro(false)}
      >
        <div className="text-center space-y-8">
          <div className="bg-secret-red/20 border-2 border-secret-red p-8 transform -rotate-2">
            <h1 className="text-6xl font-mono font-bold text-secret-red">
              [CLASSIFIED]
            </h1>
            <div className="mt-4 text-xl font-mono text-foreground">
              SHADOW GOVERNMENT
            </div>
            <div className="text-sm font-mono text-muted-foreground mt-2">
              TOP SECRET - EYES ONLY
            </div>
          </div>
          <p className="text-muted-foreground font-mono">
            Click to open folder...
          </p>
        </div>
      </div>
    );
  }

  if (showMenu) {
    return <GameMenu onStartGame={startNewGame} />;
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header with newspaper */}
      <div className="h-24 bg-card border-b">
        <div className="container mx-auto px-4 py-2">
          <h1 className="text-2xl font-bold font-mono text-secret-red">
            THE SHADOW TIMES
          </h1>
          <div className="flex justify-between items-center">
            <TruthMeter value={gameState.truth} />
            <div className="flex gap-4 text-sm font-mono">
              <span>IP: {gameState.ip}</span>
              <span>States: {gameState.controlledStates.length}/50</span>
              <span>Turn: {gameState.turn}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Main game area */}
      <div className="flex h-[calc(100vh-6rem)]">
        {/* Left sidebar - Victory conditions & log */}
        <div className="w-72 bg-government-dark border-r border-secret-red/30 p-4">
          <Card className="mb-4 p-4 bg-yellow-500/90 text-black border-2 border-black">
            <h3 className="font-bold text-sm mb-3 text-center">VICTORY CONDITIONS</h3>
            <div className="text-xs space-y-2 font-mono">
              <div className="flex justify-between">
                <span>States:</span>
                <span className="font-bold">{gameState.controlledStates.length}/10</span>
              </div>
              <div className="flex justify-between">
                <span>Truth:</span>
                <span className="font-bold">{gameState.truth}%</span>
              </div>
              <div className="flex justify-between">
                <span>IP:</span>
                <span className="font-bold">{gameState.ip}/200</span>
              </div>
              <div className="border-t border-black/20 pt-2 text-center">
                <div className="text-xs">The government opposes you</div>
                <div className="text-xs">You are the OPPOSITION</div>
                <div className="text-xs font-bold text-red-600">SHADOW GOVERNMENT ACTIVATED!</div>
              </div>
            </div>
          </Card>

          {/* Secret Agenda */}
          <div className="mb-4">
            <SecretAgenda agenda={gameState.secretAgenda} />
          </div>
          
          <Card className="p-3 bg-card/50 border border-secret-red/30">
            <h3 className="font-bold text-sm mb-2 text-secret-red font-mono">CLASSIFIED INTEL</h3>
            <div className="text-xs font-mono space-y-1 max-h-40 overflow-y-auto">
              {gameState.log.map((entry, i) => (
                <div key={i} className="text-muted-foreground animate-fade-in" style={{ animationDelay: `${i * 0.1}s` }}>
                  • {entry}
                </div>
              ))}
            </div>
          </Card>
        </div>

        {/* Center - Map */}
        <div className="flex-1 p-4">
          <GameMap 
            states={gameState.states}
            onStateClick={(stateId) => console.log('State clicked:', stateId)}
          />
        </div>

        {/* Right sidebar - Hand & AI status */}
        <div className="w-80 bg-card border-l p-4">
          <Card className="mb-4 p-3">
            <h3 className="font-bold text-sm mb-2">AI Opponent</h3>
            <div className="text-xs font-mono">
              <div>Faction: Deep State</div>
              <div>States: {50 - gameState.controlledStates.length}</div>
              <div className="text-government-blue">Plotting...</div>
            </div>
          </Card>

          <GameHand 
            cards={gameState.hand}
            onPlayCard={playCard}
            disabled={gameState.phase !== 'action'}
          />

          <div className="mt-4 space-y-2">
            <Button 
              onClick={endTurn}
              className="w-full"
              disabled={gameState.phase !== 'action'}
            >
              End Turn
            </Button>
          </div>
        </div>
      </div>

      {/* Newspaper overlay */}
      {gameState.showNewspaper && (
        <Newspaper 
          events={gameState.currentEvents}
          onClose={() => {/* handle close */}}
        />
      )}
    </div>
  );
};

export default Index;