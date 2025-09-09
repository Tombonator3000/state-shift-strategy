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
import AIStatus from '@/components/game/AIStatus';
import BalancingDashboard from '@/components/game/BalancingDashboard';
import EventViewer from '@/components/game/EventViewer';
import TutorialOverlay from '@/components/game/TutorialOverlay';
import AchievementPanel from '@/components/game/AchievementPanel';
import ZoneTargetingHelper from '@/components/game/ZoneTargetingHelper';
import { AudioControls } from '@/components/ui/audio-controls';
import { useGameState } from '@/hooks/useGameState';
import { useAudio } from '@/hooks/useAudio';
import { useCardAnimation } from '@/hooks/useCardAnimation';
import CardAnimationLayer from '@/components/game/CardAnimationLayer';
import { Maximize, Minimize } from 'lucide-react';
import { getRandomAgenda } from '@/data/agendaDatabase';
import toast, { Toaster } from 'react-hot-toast';

const Index = () => {
  const [showMenu, setShowMenu] = useState(true);
  const [showIntro, setShowIntro] = useState(true);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showBalancing, setShowBalancing] = useState(false);
  const [showEvents, setShowEvents] = useState(false);
  const [showTutorial, setShowTutorial] = useState(false);
  const [showAchievements, setShowAchievements] = useState(false);
  const [loadingCard, setLoadingCard] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const { gameState, initGame, playCard, playCardAnimated, selectCard, selectTargetState, endTurn, closeNewspaper, executeAITurn } = useGameState();
  const audio = useAudio();
  const { animatePlayCard, isAnimating } = useCardAnimation();

  // Handle AI turns
  useEffect(() => {
    if (gameState.phase === 'ai_turn' && gameState.currentPlayer === 'ai' && !gameState.aiTurnInProgress) {
      executeAITurn();
    }
  }, [gameState.phase, gameState.currentPlayer, gameState.aiTurnInProgress, executeAITurn]);

  const startNewGame = (faction: 'government' | 'truth') => {
    initGame(faction);
    setShowMenu(false);
    setShowIntro(false);
    audio.setGameplayMusic(faction);
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
        const targetState = gameState.states.find(s => s.abbreviation === stateId || s.id === stateId);
        
        // Validate target - cannot target own states with zone cards
        if (targetState?.owner === 'player') {
          toast.error('🚫 Cannot target your own states with zone cards!', {
            duration: 3000,
            style: { background: '#1f2937', color: '#f3f4f6', border: '1px solid #ef4444' }
          });
          audio.playSFX('error');
          return;
        }
        
        selectTargetState(stateId);
        audio.playSFX('click');
        toast.success(`🎯 Targeting ${targetState?.name}! Deploying zone card...`, {
          duration: 2000,
          style: { background: '#1f2937', color: '#f3f4f6', border: '1px solid #10b981' }
        });
        
        // Auto-play the card once target is selected
        setLoadingCard(gameState.selectedCard);
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

    // Check if player can afford the card
    if (gameState.ip < card.cost) {
      toast.error(`💰 Insufficient IP! Need ${card.cost}, have ${gameState.ip}`, {
        duration: 3000,
        style: { background: '#1f2937', color: '#f3f4f6', border: '1px solid #ef4444' }
      });
      audio.playSFX('error');
      return;
    }

    // Check if max cards played this turn
    if (gameState.cardsPlayedThisTurn >= 3) {
      toast.error('📋 Maximum 3 cards per turn!', {
        duration: 3000,
        style: { background: '#1f2937', color: '#f3f4f6', border: '1px solid #ef4444' }
      });
      audio.playSFX('error');
      return;
    }

    // If it's a ZONE card that requires targeting
    if (card.type === 'ZONE' && !gameState.targetState) {
      selectCard(cardId);
      audio.playSFX('hover');
      toast('🎯 Zone card selected - click a state to target it!', {
        duration: 4000,
        style: { background: '#1f2937', color: '#f3f4f6', border: '1px solid #eab308' }
      });
      return;
    }

    // Show loading state
    setLoadingCard(cardId);
    audio.playSFX('cardPlay');
    
    try {
      // Use animated card play
      await playCardAnimated(cardId, animatePlayCard);
      toast.success(`✅ ${card.name} deployed successfully!`, {
        duration: 2000,
        style: { background: '#1f2937', color: '#f3f4f6', border: '1px solid #10b981' }
      });
    } catch (error) {
      toast.error('❌ Card deployment failed!', {
        duration: 3000,
        style: { background: '#1f2937', color: '#f3f4f6', border: '1px solid #ef4444' }
      });
      audio.playSFX('error');
    } finally {
      setLoadingCard(null);
    }
  };

  const handleEndTurn = () => {
    endTurn();
    audio.playSFX('turnEnd');
    // Play card draw sound after a short delay
    setTimeout(() => {
      audio.playSFX('cardDraw');
    }, 500);
  };

  const handleCloseNewspaper = () => {
    closeNewspaper();
    audio.playSFX('newspaper');
  };

  const toggleFullscreen = async () => {
    try {
      if (!document.fullscreenElement) {
        await document.documentElement.requestFullscreen();
        setIsFullscreen(true);
      } else {
        await document.exitFullscreen();
        setIsFullscreen(false);
      }
      audio.playSFX('click');
    } catch (error) {
      console.error('Fullscreen error:', error);
    }
  };

  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };

    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => document.removeEventListener('fullscreenchange', handleFullscreenChange);
  }, []);

  // Start menu music when component first mounts
  useEffect(() => {
    audio.setMenuMusic();
  }, [audio]);

  if (showIntro) {
    return (
      <div 
        className="min-h-screen bg-government-dark flex items-center justify-center cursor-pointer"
        onClick={() => {
          setShowIntro(false);
          audio.setMenuMusic();
        }}
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

  if (showAchievements) {
    return <AchievementPanel onClose={() => setShowAchievements(false)} />;
  }

  if (showTutorial) {
    return <TutorialOverlay onClose={() => setShowTutorial(false)} />;
  }

  if (showEvents) {
    return <EventViewer onClose={() => setShowEvents(false)} />;
  }

  if (showBalancing) {
    return <BalancingDashboard onClose={() => setShowBalancing(false)} />;
  }

  if (showMenu) {
    return <GameMenu onStartGame={startNewGame} onFactionHover={(faction) => {
      if (faction) {
        audio.setFactionMusic(faction);
      } else {
        audio.setMenuMusic();
      }
    }} audio={audio} />;
  }

  return (
    <div className="min-h-screen bg-newspaper-bg">
      {/* Newspaper Header */}
      <div className="bg-newspaper-bg border-b-4 border-newspaper-border">
        <div className="container mx-auto px-4 py-2">
          <div className="text-center border-b-2 border-newspaper-border pb-2 mb-2">
            <h1 className="text-3xl md:text-4xl font-bold text-newspaper-text" style={{ fontFamily: 'serif' }}>
              THE PARANOID TIMES
            </h1>
            <div className="text-xs md:text-sm font-medium text-newspaper-text mt-1">
              Truth Seeker Operative
            </div>
          </div>
          <div className="bg-newspaper-text text-newspaper-bg p-1 rounded">
            <div className="flex flex-wrap justify-center items-center gap-2 md:gap-4 text-xs font-mono">
              <div className="text-center">
                <div className="font-bold">ROUND</div>
                <div className="text-sm">{gameState.turn}</div>
              </div>
              <div className="text-center">
                <div className="font-bold">YOUR IP</div>
                <div className="text-sm">{gameState.ip}</div>
              </div>
              <div className="text-center">
                <div className="font-bold">TRUTH</div>
                <div className="text-sm">{gameState.truth}%</div>
              </div>
              <div className="text-center">
                <div className="font-bold">YOUR STATES</div>
                <div className="text-sm">{gameState.controlledStates.length}</div>
              </div>
              <div className="text-center">
                <div className="font-bold">AI IP</div>
                <div className="text-sm">{gameState.aiIP}</div>
              </div>
              <div className="text-center">
                <div className="font-bold">AI STATES</div>
                <div className="text-sm">{gameState.states.filter(s => s.owner === 'ai').length}</div>
              </div>
              <div className="absolute top-2 right-2 flex gap-2">
                <button
                  onClick={toggleFullscreen}
                  className="bg-newspaper-text text-newspaper-bg p-1 rounded hover:bg-newspaper-text/80 transition-colors"
                  title={isFullscreen ? "Exit Fullscreen" : "Enter Fullscreen"}
                >
                  {isFullscreen ? <Minimize size={16} /> : <Maximize size={16} />}
                </button>
                <button
                  onClick={() => setShowBalancing(true)}
                  className="bg-blue-600 text-white p-1 rounded hover:bg-blue-700 transition-colors"
                  title="Card Balancing Dashboard"
                >
                  ⚖️
                </button>
                <button
                  onClick={() => setShowEvents(true)}
                  className="bg-purple-600 text-white p-1 rounded hover:bg-purple-700 transition-colors"
                  title="Event Database"
                >
                  📰
                </button>
                <button
                  onClick={() => setShowTutorial(true)}
                  className="bg-green-600 text-white p-1 rounded hover:bg-green-700 transition-colors"
                  title="Tutorial & Training"
                >
                  🎓
                </button>
                <button
                  onClick={() => setShowAchievements(true)}
                  className="bg-yellow-600 text-white p-1 rounded hover:bg-yellow-700 transition-colors"
                  title="Achievements"
                >
                  🏆
                </button>
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
      <div className="flex flex-col xl:flex-row h-[calc(100vh-140px)] overflow-hidden">
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

          {/* AI Status */}
          <div className="mb-3">
            <AIStatus 
              difficulty={gameState.aiDifficulty}
              personalityName={gameState.aiStrategist?.personality.name}
              isThinking={gameState.phase === 'ai_turn'}
              currentPlayer={gameState.currentPlayer}
              aiControlledStates={gameState.states.filter(s => s.owner === 'ai').length}
              assessmentText={gameState.aiStrategist?.getStrategicAssessment(gameState)}
            />
          </div>

          {/* AI Secret Agenda */}
          <div className="mb-3">
            <SecretAgenda 
              agenda={{
                ...gameState.aiSecretAgenda,
                progress: gameState.aiSecretAgenda.progress,
                completed: gameState.aiSecretAgenda.completed,
                revealed: gameState.aiSecretAgenda.revealed
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
        <div className="flex-1 p-1 relative bg-newspaper-bg border-x-2 border-newspaper-border" id="map-container">
        {/* Enhanced targeting overlay for ZONE cards */}
        {gameState.selectedCard && gameState.hand.find(c => c.id === gameState.selectedCard)?.type === 'ZONE' && !gameState.targetState && (
          <div className="absolute inset-0 bg-black/30 z-10 flex items-center justify-center pointer-events-none">
            <div className="bg-newspaper-text text-newspaper-bg p-6 border-2 border-newspaper-border font-mono text-xl shadow-2xl animate-pulse max-w-md text-center">
              <div className="text-2xl mb-2">🎯 ZONE CARD ACTIVE</div>
              <div className="text-base mb-4">
                Click any <span className="text-yellow-400 font-bold">NEUTRAL</span> or <span className="text-red-500 font-bold">ENEMY</span> state to target
              </div>
              <div className="text-sm bg-black/20 p-2 rounded">
                Card will deploy automatically when target is selected
              </div>
              <div className="text-xs mt-2 text-yellow-400">
                ⚠️ Cannot target your own states
              </div>
            </div>
          </div>
        )}
          <div className="h-full border-2 border-newspaper-border bg-white/80 relative overflow-hidden">
            <div className="w-full h-full">
              <EnhancedUSAMap 
                states={gameState.states} 
                onStateClick={handleStateClick}
                selectedZoneCard={gameState.selectedCard}
                selectedState={gameState.targetState}
                audio={audio}
              />
            </div>
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
              <div>Hand Size: {gameState.aiHand.length}</div>
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
              loadingCard={loadingCard}
            />
          </div>

          {/* Controls */}
          <div className="space-y-2 flex-shrink-0">
            <Button 
              onClick={handleEndTurn}
              className="w-full bg-newspaper-text text-newspaper-bg hover:bg-newspaper-text/80 hover:scale-105 transition-all duration-200 h-8 text-xs font-bold"
              disabled={gameState.phase !== 'action' || gameState.animating || gameState.currentPlayer !== 'human'}
            >
              {gameState.currentPlayer === 'ai' ? (
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-current rounded-full animate-pulse"></div>
                  AI Thinking...
                </div>
              ) : (
                'End Turn'
              )}
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

      {/* Zone Targeting Helper */}
      <ZoneTargetingHelper 
        selectedZoneCard={gameState.selectedCard}
        onCancel={() => {
          selectCard(null);
          audio.playSFX('click');
          toast('🚫 Zone targeting canceled', {
            duration: 2000,
            style: { background: '#1f2937', color: '#f3f4f6', border: '1px solid #6b7280' }
          });
        }}
      />

      {/* Toast notifications */}
      <Toaster 
        position="top-right"
        toastOptions={{
          duration: 3000,
          style: {
            background: '#1f2937',
            color: '#f3f4f6',
            border: '1px solid #374151',
            fontFamily: 'monospace'
          }
        }}
      />

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