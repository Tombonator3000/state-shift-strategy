import { useEffect, useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import USAMap from '@/components/game/USAMap';
import GameHand from '@/components/game/GameHand';
import TruthMeter from '@/components/game/TruthMeter';
import Newspaper from '@/components/game/Newspaper';
import GameMenu from '@/components/game/GameMenu';
import SecretAgenda from '@/components/game/SecretAgenda';
import { AudioControls } from '@/components/ui/audio-controls';
import { useGameState } from '@/hooks/useGameState';
import { useAudio } from '@/hooks/useAudio';

const Index = () => {
  const [showMenu, setShowMenu] = useState(true);
  const [showIntro, setShowIntro] = useState(true);
  const [selectedZoneCard, setSelectedZoneCard] = useState<string | null>(null);
  const { gameState, initGame, playCard, endTurn, closeNewspaper } = useGameState();
  const audio = useAudio();

  const startNewGame = (faction: 'government' | 'truth') => {
    initGame(faction);
    setShowMenu(false);
    setShowIntro(false);
    audio.playMusic();
    audio.playSFX('click');
  };

  const handleZoneCardSelect = (cardId: string) => {
    const card = gameState.hand.find(c => c.id === cardId);
    if (card?.type === 'ZONE') {
      setSelectedZoneCard(cardId);
      audio.playSFX('click');
    }
  };

  const handleStateClick = (stateId: string) => {
    if (selectedZoneCard) {
      // Apply zone card to selected state
      playCard(selectedZoneCard);
      setSelectedZoneCard(null);
      audio.playSFX('stateCapture');
      console.log(`Applied zone card ${selectedZoneCard} to ${stateId}`);
    } else {
      audio.playSFX('hover');
    }
  };

  const handlePlayCard = (cardId: string) => {
    const card = gameState.hand.find(c => c.id === cardId);
    if (card?.type === 'ZONE') {
      handleZoneCardSelect(cardId);
    } else {
      playCard(cardId);
      audio.playSFX('cardPlay');
    }
  };

  const handleEndTurn = () => {
    endTurn();
    audio.playSFX('turnEnd');
  };

  const handleCloseNewspaper = () => {
    closeNewspaper();
    audio.playSFX('newspaper');
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
      {/* Responsive Header */}
      <div className="h-16 md:h-24 bg-card border-b">
        <div className="container mx-auto px-2 md:px-4 py-2">
          <div className="flex items-center justify-between mb-2">
            <h1 className="text-lg md:text-2xl font-bold font-mono text-secret-red">
              THE SHADOW TIMES
            </h1>
            <AudioControls
              volume={audio.config.volume}
              muted={audio.config.muted}
              musicEnabled={audio.config.musicEnabled}
              sfxEnabled={audio.config.sfxEnabled}
              onVolumeChange={audio.setVolume}
              onToggleMute={audio.toggleMute}
              onToggleMusic={audio.toggleMusic}
              onToggleSFX={audio.toggleSFX}
            />
          </div>
          <div className="flex flex-col md:flex-row md:justify-between items-start md:items-center gap-2">
            <TruthMeter value={gameState.truth} />
            <div className="flex gap-2 md:gap-4 text-xs md:text-sm font-mono">
              <span>IP: {gameState.ip}</span>
              <span>States: {gameState.controlledStates.length}/50</span>
              <span>Turn: {gameState.turn}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Responsive Main Game Area */}
      <div className="flex flex-col lg:flex-row h-[calc(100vh-4rem)] md:h-[calc(100vh-6rem)]">
        {/* Left sidebar - Hidden on mobile, shown on desktop */}
        <div className="hidden lg:block w-72 bg-government-dark border-r border-secret-red/30 p-4 overflow-y-auto">
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

        {/* Center - Map (responsive) */}
        <div className="flex-1 p-2 md:p-4 relative min-h-0">
          {selectedZoneCard && (
            <div className="absolute top-2 md:top-4 left-2 md:left-4 z-10 bg-secret-red text-white p-2 rounded font-mono text-xs md:text-sm">
              Click a state to apply zone card
            </div>
          )}
          <div className="h-full">
            <USAMap 
              states={gameState.states}
              onStateClick={handleStateClick}
            />
          </div>
        </div>

        {/* Right sidebar - Mobile: Bottom sheet, Desktop: Fixed sidebar */}
        <div className="lg:w-80 bg-card border-l p-2 md:p-4 lg:overflow-y-auto">
          {/* Mobile victory conditions - shown at top on mobile */}
          <div className="lg:hidden mb-4">
            <Card className="p-3 bg-yellow-500/90 text-black border-2 border-black">
              <h3 className="font-bold text-xs mb-2 text-center">VICTORY CONDITIONS</h3>
              <div className="text-xs space-y-1 font-mono">
                <div className="flex justify-between">
                  <span>States: {gameState.controlledStates.length}/10</span>
                  <span>Truth: {gameState.truth}%</span>
                  <span>IP: {gameState.ip}/200</span>
                </div>
              </div>
            </Card>
          </div>

          {/* AI Opponent */}
          <Card className="mb-4 p-3">
            <h3 className="font-bold text-sm mb-2">AI Opponent</h3>
            <div className="text-xs font-mono">
              <div>Faction: Deep State</div>
              <div>States: {50 - gameState.controlledStates.length}</div>
              <div className="text-government-blue">Plotting...</div>
            </div>
          </Card>

          {/* Game Hand */}
          <GameHand 
            cards={gameState.hand}
            onPlayCard={handlePlayCard}
            disabled={gameState.phase !== 'action'}
          />

          {/* Controls */}
          <div className="mt-4 space-y-2">
            <Button 
              onClick={handleEndTurn}
              className="w-full"
              disabled={gameState.phase !== 'action'}
            >
              End Turn
            </Button>
          </div>

          {/* Mobile Log - Collapsible */}
          <div className="lg:hidden mt-4">
            <Card className="p-3 bg-card/50 border border-secret-red/30">
              <h3 className="font-bold text-xs mb-2 text-secret-red font-mono">INTEL LOG</h3>
              <div className="text-xs font-mono space-y-1 max-h-20 overflow-y-auto">
                {gameState.log.slice(-3).map((entry, i) => (
                  <div key={i} className="text-muted-foreground">
                    • {entry}
                  </div>
                ))}
              </div>
            </Card>
          </div>
        </div>
      </div>

      {/* Newspaper overlay */}
      {gameState.showNewspaper && (
        <Newspaper 
          events={gameState.currentEvents}
          playedCards={gameState.cardsPlayedThisRound}
          faction={gameState.faction}
          onClose={handleCloseNewspaper}
        />
      )}
    </div>
  );
};

export default Index;