import { useEffect, useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import USAMap from '@/components/game/USAMap';
import GameHand from '@/components/game/GameHand';
import EnhancedUSAMap from '@/components/game/EnhancedUSAMap';
import EnhancedGameHand from '@/components/game/EnhancedGameHand';
import TruthMeter from '@/components/game/TruthMeter';
import Newspaper from '@/components/game/Newspaper';
import GameMenu from '@/components/game/GameMenu';
import SecretAgenda from '@/components/game/SecretAgenda';
import { AudioControls } from '@/components/ui/audio-controls';
import { useGameState } from '@/hooks/useGameState';
import { useAudio } from '@/hooks/useAudio';
import { useCardAnimation } from '@/hooks/useCardAnimation';
import CardAnimationLayer from '@/components/game/CardAnimationLayer';

const Index = () => {
  const [showMenu, setShowMenu] = useState(true);
  const [showIntro, setShowIntro] = useState(true);
  const { gameState, initGame, playCard, playCardAnimated, selectCard, selectTargetState, endTurn, closeNewspaper } = useGameState();
  const audio = useAudio();
  const { animatePlayCard, isAnimating } = useCardAnimation();

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
      selectCard(cardId);
      audio.playSFX('click');
    }
  };

  const handleStateClick = (stateId: string) => {
    if (gameState.selectedCard && !isAnimating()) {
      const card = gameState.hand.find(c => c.id === gameState.selectedCard);
      if (card?.type === 'ZONE') {
        selectTargetState(stateId);
        audio.playSFX('click');
        // Auto-play the card once target is selected
        handlePlayCard(gameState.selectedCard);
      }
    } else {
      audio.playSFX('hover');
    }
  };

  const handleSelectCard = (cardId: string) => {
    selectCard(cardId);
    audio.playSFX('hover');
  };

  const handlePlayCard = async (cardId: string) => {
    const card = gameState.hand.find(c => c.id === cardId);
    if (!card || isAnimating()) return;

    // If it's a ZONE card that requires targeting
    if (card.type === 'ZONE' && !gameState.targetState) {
      selectCard(cardId);
      audio.playSFX('hover');
      return;
    }

    audio.playSFX('cardPlay');
    
    // Use animated card play
    await playCardAnimated(cardId, animatePlayCard);
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
    <div className="min-h-screen bg-newspaper-bg">
      {/* Newspaper Header */}
      <div className="bg-newspaper-bg border-b-4 border-newspaper-border">
        <div className="container mx-auto px-4 py-4">
          <div className="text-center border-b-2 border-newspaper-border pb-4 mb-4">
            <h1 className="text-4xl md:text-6xl font-bold text-newspaper-text" style={{ fontFamily: 'serif' }}>
              THE PARANOID TIMES
            </h1>
            <div className="text-sm md:text-base font-medium text-newspaper-text mt-2">
              Truth Seeker Operative
            </div>
          </div>
          <div className="bg-newspaper-text text-newspaper-bg p-2 rounded">
            <div className="flex flex-wrap justify-center items-center gap-4 md:gap-8 text-xs md:text-sm font-mono">
              <div className="text-center">
                <div className="font-bold">ROUND</div>
                <div className="text-lg">{gameState.turn}</div>
              </div>
              <div className="text-center">
                <div className="font-bold">YOUR IP</div>
                <div className="text-lg">{gameState.ip}</div>
              </div>
              <div className="text-center">
                <div className="font-bold">TRUTH</div>
                <div className="text-lg">{gameState.truth}%</div>
              </div>
              <div className="text-center">
                <div className="font-bold">YOUR STATES</div>
                <div className="text-lg">{gameState.controlledStates.length}</div>
              </div>
              <div className="text-center">
                <div className="font-bold">AI IP</div>
                <div className="text-lg">3</div>
              </div>
              <div className="text-center">
                <div className="font-bold">AI STATES</div>
                <div className="text-lg">{50 - gameState.controlledStates.length}</div>
              </div>
              <div className="absolute top-4 right-4">
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
            </div>
          </div>
        </div>
      </div>

      {/* Main Game Area */}
      <div className="flex flex-col xl:flex-row h-[calc(100vh-180px)] overflow-hidden">
        {/* Left sidebar - Victory Conditions & Classified Intel */}
        <div className="hidden xl:block w-52 bg-newspaper-bg border-r-2 border-newspaper-border p-2 overflow-y-auto">
          <div className="bg-newspaper-text text-newspaper-bg p-2 mb-3 border border-newspaper-border">
            <h3 className="font-bold text-xs mb-2 text-center">VICTORY CONDITIONS</h3>
            <div className="text-xs space-y-1 font-mono">
              <div>• Control 10 states</div>
              <div>• Reach 200 IP</div>
              <div>• Truth ≥90%</div>
              <div className="border-t border-newspaper-bg/30 pt-1 mt-1">
                <div className="text-center text-xs">States: {gameState.controlledStates.length}/10</div>
                <div className="text-center text-xs">Truth: {gameState.truth}%</div>
                <div className="text-center text-xs">IP: {gameState.ip}/200</div>
              </div>
            </div>
          </div>

          {/* Player Secret Agenda */}
          <div className="mb-3">
            <SecretAgenda agenda={gameState.secretAgenda} isPlayer={true} />
          </div>

          {/* AI Secret Agenda */}
          <div className="mb-3">
            <SecretAgenda 
              agenda={{
                id: 'ai-agenda',
                description: 'Hidden AI objective',
                progress: 3,
                target: 10,
                completed: false,
                revealed: false
              }} 
              isPlayer={false} 
            />
          </div>
          
          <div className="bg-newspaper-bg border-2 border-newspaper-border p-2">
            <h3 className="font-bold text-xs mb-1 text-newspaper-text">CLASSIFIED INTEL</h3>
            <div className="text-xs space-y-1 max-h-32 overflow-y-auto">
              {gameState.log.map((entry, i) => (
                <div key={i} className="text-newspaper-text/80 animate-fade-in" style={{ animationDelay: `${i * 0.1}s` }}>
                  <span className="font-mono">▲</span> {entry}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Center - Map */}
        <div className="flex-1 p-2 relative bg-newspaper-bg border-x-2 border-newspaper-border" id="map-container">
          {gameState.selectedCard && gameState.hand.find(c => c.id === gameState.selectedCard)?.type === 'ZONE' && !gameState.targetState && (
            <div className="absolute top-4 left-4 z-10 bg-newspaper-text text-newspaper-bg p-2 border border-newspaper-border font-mono text-sm">
              Click a state to target with zone card
            </div>
          )}
          <div className="h-full border-2 border-newspaper-border bg-white/80 relative">
            <EnhancedUSAMap 
              states={gameState.states} 
              onStateClick={handleStateClick}
              selectedZoneCard={gameState.selectedCard}
            />
          </div>
        </div>

        {/* Right sidebar - AI Intel & Your Hand */}
        <div className="w-full xl:w-64 bg-newspaper-bg border-l-2 border-newspaper-border p-2 flex flex-col max-h-full">
          {/* Mobile victory conditions - shown at top on mobile */}
          <div className="xl:hidden mb-3">
            <div className="bg-newspaper-text text-newspaper-bg p-2 border border-newspaper-border">
              <h3 className="font-bold text-xs mb-1 text-center">VICTORY CONDITIONS</h3>
              <div className="text-xs font-mono">
                States: {gameState.controlledStates.length}/10 | Truth: {gameState.truth}% | IP: {gameState.ip}/200
              </div>
            </div>
          </div>

          {/* AI Intel */}
          <div className="bg-newspaper-text text-newspaper-bg p-2 mb-3 border border-newspaper-border flex-shrink-0">
            <h3 className="font-bold text-xs mb-1">AI INTEL</h3>
            <div className="text-xs font-mono space-y-1">
              <div>Hand Size: 5</div>
              <div>Strategy: Suppressing Truth</div>
              <div>Threat Level: LOW</div>
            </div>
          </div>

          {/* Your Hand - Takes remaining space */}
          <div className="bg-newspaper-text text-newspaper-bg p-2 mb-3 border border-newspaper-border flex-1 min-h-0">
            <h3 className="font-bold text-xs mb-2">YOUR HAND</h3>
            <EnhancedGameHand 
              cards={gameState.hand}
              onPlayCard={handlePlayCard}
              onSelectCard={handleSelectCard}
              selectedCard={gameState.selectedCard}
              disabled={gameState.cardsPlayedThisTurn >= 3 || gameState.phase !== 'action' || gameState.animating}
              currentIP={gameState.ip}
            />
          </div>

          {/* Controls */}
          <div className="space-y-2 flex-shrink-0">
            <Button 
              onClick={handleEndTurn}
              className="w-full bg-newspaper-text text-newspaper-bg hover:bg-newspaper-text/80 h-8 text-xs"
              disabled={gameState.phase !== 'action' || gameState.animating}
            >
              End Turn
            </Button>
          </div>

          {/* Mobile Log - Collapsible */}
          <div className="xl:hidden mt-2 flex-shrink-0">
            <div className="bg-newspaper-bg border-2 border-newspaper-border p-2">
              <h3 className="font-bold text-xs mb-1 text-newspaper-text">INTEL LOG</h3>
              <div className="text-xs space-y-1 max-h-16 overflow-y-auto">
                {gameState.log.slice(-3).map((entry, i) => (
                  <div key={i} className="text-newspaper-text/80">
                    <span className="font-mono">▲</span> {entry}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Card Animation Layer */}
      <CardAnimationLayer />

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