import { useEffect, useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import USAMap from '@/components/game/USAMap';
import GameHand from '@/components/game/GameHand';
import EnhancedUSAMap from '@/components/game/EnhancedUSAMap';
import EnhancedGameHand from '@/components/game/EnhancedGameHand';
import PlayedCardsDock from '@/components/game/PlayedCardsDock';
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
import Options from '@/components/game/Options';
import { useGameState } from '@/hooks/useGameState';
import { useAudioManager } from '@/hooks/useAudioManager';
import { useCardAnimation } from '@/hooks/useCardAnimation';
import CardAnimationLayer from '@/components/game/CardAnimationLayer';
import FloatingNumbers from '@/components/effects/FloatingNumbers';
import PhaseTransition from '@/components/effects/PhaseTransition';
import TabloidVictoryScreen from '@/components/effects/TabloidVictoryScreen';
import ActionPhasePopup from '@/components/game/ActionPhasePopup';
import CardPreviewOverlay from '@/components/game/CardPreviewOverlay';
import ContextualHelp from '@/components/game/ContextualHelp';
import InteractiveOnboarding from '@/components/game/InteractiveOnboarding';
import MechanicsTooltip from '@/components/game/MechanicsTooltip';
import CardCollection from '@/components/game/CardCollection';
import NewCardsPresentation from '@/components/game/NewCardsPresentation';
import { Maximize, Minimize } from 'lucide-react';
import { getRandomAgenda } from '@/data/agendaDatabase';
import { useCardCollection } from '@/hooks/useCardCollection';
import { useSynergyDetection } from '@/hooks/useSynergyDetection';
import { VisualEffectsCoordinator } from '@/utils/visualEffects';
import ExtraEditionNewspaper from '@/components/game/ExtraEditionNewspaper';
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
  const [subtitle, setSubtitle] = useState('Truth Seeker Operative');
  
  // Visual effects state
  const [floatingNumbers, setFloatingNumbers] = useState<{ 
    value: number; 
    type: 'ip' | 'truth' | 'damage' | 'synergy' | 'combo' | 'chain';
    x?: number;
    y?: number;
  } | null>(null);
  const [previousPhase, setPreviousPhase] = useState('');
  const [showPhaseTransition, setShowPhaseTransition] = useState(false);
  const [hoveredCard, setHoveredCard] = useState<any>(null);
  const [victoryState, setVictoryState] = useState<{ isVictory: boolean; type: 'states' | 'ip' | 'truth' | 'agenda' | null }>({ isVictory: false, type: null });
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [showInGameOptions, setShowInGameOptions] = useState(false);
  const [showCardCollection, setShowCardCollection] = useState(false);
  const [gameOverReport, setGameOverReport] = useState<any>(null);
  const [showExtraEdition, setShowExtraEdition] = useState(false);
  const [showActionPhase, setShowActionPhase] = useState(false);
  
  const { gameState, initGame, playCard, playCardAnimated, selectCard, selectTargetState, endTurn, closeNewspaper, executeAITurn, confirmNewCards, setGameState, saveGame, loadGame, getSaveInfo } = useGameState();
  const audio = useAudioManager();
  const { animatePlayCard, isAnimating } = useCardAnimation();
  const { discoverCard, playCard: recordCardPlay } = useCardCollection();
  const { checkSynergies, getActiveCombinations, getTotalBonusIP } = useSynergyDetection();

  // Handle AI turns
  useEffect(() => {
    if (gameState.phase === 'ai_turn' && gameState.currentPlayer === 'ai' && !gameState.aiTurnInProgress) {
      executeAITurn();
    }
  }, [gameState.phase, gameState.currentPlayer, gameState.aiTurnInProgress, executeAITurn]);

  // Enable audio on first user interaction
  useEffect(() => {
    const enableAudioOnFirstClick = () => {
      console.log('First user interaction detected');
      if (!audio.canPlay) {
        audio.enableAudio();
      }
    };

    // Listen for any user interaction to enable audio
    document.addEventListener('click', enableAudioOnFirstClick, { once: true });
    document.addEventListener('keydown', enableAudioOnFirstClick, { once: true });
    document.addEventListener('touchstart', enableAudioOnFirstClick, { once: true });

    return () => {
      document.removeEventListener('click', enableAudioOnFirstClick);
      document.removeEventListener('keydown', enableAudioOnFirstClick);
      document.removeEventListener('touchstart', enableAudioOnFirstClick);
    };
  }, [audio]);

  // Track IP changes for floating numbers
  useEffect(() => {
    const currentIP = gameState.ip;
    const prevIP = parseInt(localStorage.getItem('prevIP') || '0');
    
    if (currentIP !== prevIP && prevIP > 0) {
      const change = currentIP - prevIP;
      setFloatingNumbers({ value: change, type: 'ip' });
      setTimeout(() => setFloatingNumbers(null), 100);
    }
    
    localStorage.setItem('prevIP', currentIP.toString());
  }, [gameState.ip]);

  // Track phase changes
  useEffect(() => {
    if (gameState.phase !== previousPhase && previousPhase) {
      setShowPhaseTransition(true);
    }
    setPreviousPhase(gameState.phase);
  }, [gameState.phase, previousPhase]);

  // Check victory conditions and trigger game over
  useEffect(() => {
    // Don't check victory if game is already over or during animations
    if (gameState.isGameOver || gameState.animating) return;

    let winner: "government" | "truth" | "draw" | null = null;
    let victoryType: 'states' | 'ip' | 'truth' | 'agenda' | null = null;

    // Only evaluate victory conditions at proper timing:
    // - After card effects are fully resolved
    // - After AI turn completion
    // - After round end (newspaper phase)
    const shouldEvaluate = gameState.phase === 'action' || 
                          gameState.phase === 'newspaper' ||
                          (gameState.phase === 'ai_turn' && !gameState.aiTurnInProgress);

    if (!shouldEvaluate) return;

    // Priority 1: Secret Agenda (highest priority)
    if (gameState.agenda?.complete) {
      winner = gameState.agenda.faction === 'truth' ? 'truth' : 'government';
      victoryType = 'agenda';
    }
    
    // Priority 2: Truth thresholds (Truth ≥ 90% for Truth Seekers, Truth ≤ 10% for Government)
    else if (gameState.truth >= 90 && gameState.faction === 'truth') {
      winner = 'truth';
      victoryType = 'truth';
    } else if (gameState.truth <= 10 && gameState.faction === 'government') {
      winner = 'government';
      victoryType = 'truth';
    }
    
    // Priority 3: IP victory (200 IP)
    else if (gameState.ip >= 200) {
      winner = gameState.faction;
      victoryType = 'ip';
    } else if (gameState.aiIP >= 200) {
      winner = gameState.faction === 'government' ? 'truth' : 'government';
      victoryType = 'ip';
    }
    
    // Priority 4: State control (10 states)
    else if (gameState.controlledStates.length >= 10) {
      winner = gameState.faction;
      victoryType = 'states';
    } else {
      const aiControlledStates = gameState.states.filter(s => s.owner === 'ai').length;
      if (aiControlledStates >= 10) {
        winner = gameState.faction === 'government' ? 'truth' : 'government';
        victoryType = 'states';
      }
    }

    if (winner && victoryType) {
      // Stop the game immediately
      setGameState(prev => ({ ...prev, isGameOver: true }));
      
      // Build game over report
      const report = {
        winner,
        rounds: gameState.round,
        finalTruth: Math.round(gameState.truth),
        ipPlayer: gameState.ip,
        ipAI: gameState.aiIP,
        statesGov: gameState.states.filter(s => s.owner === (gameState.faction === 'government' ? 'player' : 'ai')).length,
        statesTruth: gameState.states.filter(s => s.owner === (gameState.faction === 'truth' ? 'player' : 'ai')).length,
        agenda: gameState.agenda ? {
          side: gameState.agenda.faction === 'truth' ? 'truth' : 'government',
          name: gameState.agenda.title,
          success: gameState.agenda.complete
        } : undefined,
        mvpCard: gameState.cardsPlayedThisRound.length > 0 ? gameState.cardsPlayedThisRound[gameState.cardsPlayedThisRound.length - 1]?.card?.name : undefined,
        legendaryUsed: gameState.cardsPlayedThisRound.filter(c => c.card.rarity === 'legendary').map(c => c.card.name)
      };

      setGameOverReport(report);
      setVictoryState({ isVictory: true, type: victoryType });
    }
  }, [gameState.controlledStates.length, gameState.ip, gameState.aiIP, gameState.truth, gameState.agenda?.complete, gameState.states, gameState.faction, gameState.isGameOver]);

  // Enhanced synergy detection with coordinated visual effects
  useEffect(() => {
    if (gameState.controlledStates.length > 0) {
      const newCombinations = checkSynergies(
        gameState.controlledStates,
        (combo, position) => {
          // Synergy activation callback
          console.log(`🔗 New synergy activated: ${combo.name} (+${combo.bonusIP} IP)`);
          
          // Play audio feedback
          audio?.playSfx?.('state-capture');
          
          // Toast notification for synergy activation
          toast.success(`🔗 Synergy Activated: ${combo.name} (+${combo.bonusIP} IP)`, {
            duration: 3000,
            position: 'top-center'
          });
        },
        (type, x, y) => {
          // Particle effect callback
          VisualEffectsCoordinator.triggerParticleEffect(type as any, { x, y });
        },
        (value, type, x, y) => {
          // Floating number callback
          if (x && y) {
            VisualEffectsCoordinator.showFloatingNumber(value, type as any, { x, y });
          }
        }
      );

      // Log active combinations for debugging
      const activeCombos = getActiveCombinations();
      if (activeCombos.length > 0) {
        console.log('🎯 Active synergies:', activeCombos.map(c => `${c.name} (+${c.bonusIP})`).join(', '));
        console.log('💰 Total bonus IP:', getTotalBonusIP());
      }
    }
  }, [gameState.controlledStates, checkSynergies, getActiveCombinations, getTotalBonusIP, audio]);

  // Track cards being drawn to hand for collection discovery
  useEffect(() => {
    gameState.hand.forEach(card => {
      discoverCard(card.id);
    });
  }, [gameState.hand]);

  // Check if first-time player
  useEffect(() => {
    const hasSeenOnboarding = localStorage.getItem('shadowgov-onboarding-complete') || localStorage.getItem('shadowgov-onboarding-skipped');
    if (!hasSeenOnboarding && !showMenu && !showIntro) {
      setShowOnboarding(true);
    }
  }, [showMenu, showIntro]);

  // Update subtitle based on faction and add glitching effect
  useEffect(() => {
    if (gameState.faction) {
      const baseSubtitle = gameState.faction === 'truth' ? 'Truth Seeker Operative' : 'Deep State Agent';
      setSubtitle(baseSubtitle);

      // Add glitching effect
      const glitchInterval = setInterval(() => {
        if (Math.random() < 0.1) { // 10% chance to glitch
          const glitchTexts = [
            'CLASSIFIED AGENT',
            'REDACTED OPERATIVE', 
            'SHADOW OPERATIVE',
            '[DATA EXPUNGED]',
            'UNKNOWN ENTITY',
            'CONSPIRACY THEORIST'
          ];
          setSubtitle(glitchTexts[Math.floor(Math.random() * glitchTexts.length)]);
          setTimeout(() => setSubtitle(baseSubtitle), 600);
        }
      }, 3000);

      return () => clearInterval(glitchInterval);
    }
  }, [gameState.faction]);

  const startNewGame = async (faction: 'government' | 'truth') => {
    // Enable audio on first user interaction
    if (!audio.canPlay) {
      audio.enableAudio();
    }
    
    await initGame(faction);
    setShowMenu(false);
    setShowIntro(false);
    audio.startGameplay(faction);
    audio.playSfx('click');
    
    // Auto-enter fullscreen when game starts (skip in iframes or when not allowed)
    try {
      const canFullscreen = document.fullscreenEnabled && window.top === window.self;
      if (canFullscreen && !document.fullscreenElement) {
        await document.documentElement.requestFullscreen();
        setIsFullscreen(true);
      }
    } catch (error) {
      console.log('Fullscreen auto-entry skipped or failed:', error);
    }
  };

  const handleZoneCardSelect = (cardId: string) => {
    const card = gameState.hand.find(c => c.id === cardId);
    if (card?.type === 'ZONE') {
      selectCard(cardId);
      audio.playSfx('click');
    }
  };

  const handleStateClick = async (stateId: string) => {
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
          audio.playSfx('error');
          return;
        }
        
        selectTargetState(stateId); // keep state in store for logs/UX
        audio.playSfx('click');
        toast.success(`🎯 Targeting ${targetState?.name}! Deploying zone card...`, {
          duration: 2000,
          style: { background: '#1f2937', color: '#f3f4f6', border: '1px solid #10b981' }
        });
        
        // Play immediately with explicit target (no extra clicks)
        setLoadingCard(gameState.selectedCard);
        await handlePlayCard(gameState.selectedCard, stateId);
      }
    } else {
      audio.playSfx('hover');
    }
  };

  const handleSelectCard = (cardId: string) => {
    selectCard(cardId);
    audio.playSfx('hover');
  };

  const handlePlayCard = async (cardId: string, targetState?: string) => {
    const card = gameState.hand.find(c => c.id === cardId);
    if (!card || isAnimating()) return;

    // Check if player can afford the card
    if (gameState.ip < card.cost) {
      toast.error(`💰 Insufficient IP! Need ${card.cost}, have ${gameState.ip}`, {
        duration: 3000,
        style: { background: '#1f2937', color: '#f3f4f6', border: '1px solid #ef4444' }
      });
      audio.playSfx('error');
      return;
    }

    // Check if max cards played this turn
    if (gameState.cardsPlayedThisTurn >= 3) {
      toast.error('📋 Maximum 3 cards per turn!', {
        duration: 3000,
        style: { background: '#1f2937', color: '#f3f4f6', border: '1px solid #ef4444' }
      });
      audio.playSfx('error');
      return;
    }

    // If it's a ZONE card that requires targeting
    if (card.type === 'ZONE' && !gameState.targetState && !targetState) {
      selectCard(cardId);
      audio.playSfx('hover');
      toast('🎯 Zone card selected - click a state to target it!', {
        duration: 4000,
        style: { background: '#1f2937', color: '#f3f4f6', border: '1px solid #eab308' }
      });
      return;
    }

    // Show loading state
    setLoadingCard(cardId);
    audio.playSfx('card-play');
    
    try {
      // Use animated card play
      await playCardAnimated(cardId, animatePlayCard, targetState);
      
      // Track card in collection
      recordCardPlay(cardId);
      
      // Enhanced visual effects for successful card play
      const cardElement = document.querySelector(`[data-card-id="${cardId}"]`);
      if (cardElement) {
        const position = VisualEffectsCoordinator.getElementCenter(cardElement);
        
        // Trigger deploy particle effect
        VisualEffectsCoordinator.triggerParticleEffect('deploy', position);
        
        // Show floating number for IP cost
        if (card.cost > 0) {
          VisualEffectsCoordinator.showFloatingNumber(-card.cost, 'ip', {
            x: position.x - 30,
            y: position.y - 20
          });
        }
      }
      
      toast.success(`✅ ${card.name} deployed successfully!`, {
        duration: 2000,
        style: { background: '#1f2937', color: '#f3f4f6', border: '1px solid #10b981' }
      });
    } catch (error) {
      toast.error('❌ Card deployment failed!', {
        duration: 3000,
        style: { background: '#1f2937', color: '#f3f4f6', border: '1px solid #ef4444' }
      });
      audio.playSfx('error');
    } finally {
      setLoadingCard(null);
    }
  };

  const handleEndTurn = () => {
    endTurn();
    audio.playSfx('turn-end');
    // Play card draw sound after a short delay
    setTimeout(() => {
      audio.playSfx('card-draw');
    }, 500);
  };

  const handleCloseNewspaper = () => {
    closeNewspaper();
    audio.playSfx('newspaper');
  };

  const toggleFullscreen = async () => {
    try {
      const canFullscreen = document.fullscreenEnabled && window.top === window.self;
      if (!canFullscreen) {
        console.log('Fullscreen not permitted in this environment (likely in iframe).');
        audio.playSfx('click');
        return;
      }
      if (!document.fullscreenElement) {
        await document.documentElement.requestFullscreen();
        setIsFullscreen(true);
      } else {
        await document.exitFullscreen();
        setIsFullscreen(false);
      }
      audio.playSfx('click');
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

  // Start menu music after user interaction
  useEffect(() => {
    // Only start music when user clicks to dismiss intro
    if (!showIntro && showMenu) {
      audio.setScene('start-menu');
    }
  }, [showIntro, showMenu, audio]);

  if (showIntro) {
    return (
      <div 
        className="min-h-screen bg-government-dark flex items-center justify-center cursor-pointer"
        onClick={() => {
          setShowIntro(false);
          audio.enableAudio();
          audio.setScene('start-menu');
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
    return <GameMenu 
      onStartGame={startNewGame} 
      onFactionHover={(faction) => {
        // Play light hover sound effect instead of changing music
        if (faction) {
          audio.playSfx('hover');
        }
      }}
      audio={audio}
      onShowCardCollection={() => setShowCardCollection(true)}
      onBackToMainMenu={() => {
        setShowMenu(true);
        // Reset any game state if needed
      }}
        onSaveGame={saveGame}
      getSaveInfo={getSaveInfo}
      onLoadGame={() => {
        const success = loadGame();
        if (success) {
          setShowMenu(false);
        }
        return success;
      }}
    />;
  }

  if (showInGameOptions) {
    return (
      <Options
        onClose={() => setShowInGameOptions(false)}
        onBackToMainMenu={() => {
          setShowInGameOptions(false);
          setShowMenu(true);
          audio.setScene('start-menu');
        }}
        onSaveGame={() => saveGame()}
      />
    );
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
              {subtitle}
            </div>
          </div>
          <div className="bg-newspaper-text text-newspaper-bg p-1 rounded">
            <div className="flex flex-wrap justify-center items-center gap-2 md:gap-4 text-xs font-mono">
              <div className="text-center">
                <div className="font-bold">ROUND</div>
                <div className="text-sm">{gameState.turn}</div>
              </div>
              <MechanicsTooltip mechanic="ip">
                <div className="text-center">
                  <div className="font-bold">YOUR IP</div>
                  <div className="text-sm">{gameState.ip}</div>
                </div>
              </MechanicsTooltip>
              <MechanicsTooltip mechanic="truth">
                <div className="text-center">
                  <div className="font-bold">TRUTH</div>
                  <div className="text-sm">{gameState.truth}%</div>
                </div>
              </MechanicsTooltip>
              <MechanicsTooltip mechanic="zone">
                <div className="text-center">
                  <div className="font-bold">YOUR STATES</div>
                  <div className="text-sm">{gameState.controlledStates.length}</div>
                </div>
              </MechanicsTooltip>
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
                <button
                  onClick={() => {
                    setShowCardCollection(true);
                    audio.playSfx('click');
                  }}
                  className="bg-indigo-600 text-white p-1 rounded hover:bg-indigo-700 transition-colors"
                  title="Card Collection"
                >
                  📚
                </button>
                <button
                  onClick={() => {
                    console.log('In-game options button clicked');
                    setShowInGameOptions(true);
                    console.log('showInGameOptions set to true');
                    audio.playSfx('click');
                  }}
                  className="bg-gray-600 text-white p-1 rounded hover:bg-gray-700 transition-colors"
                  title="Options & Settings"
                >
                  ⚙️
                </button>
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

        {/* Center - Map with proper spacing for card dock */}
        <div className="flex-1 p-1 bg-newspaper-bg border-x-2 border-newspaper-border flex flex-col relative" id="map-container">
          {/* Enhanced targeting overlay for ZONE cards - repositioned to upper right */}
          {gameState.selectedCard && gameState.hand.find(c => c.id === gameState.selectedCard)?.type === 'ZONE' && !gameState.targetState && (
            <div className="absolute top-4 right-4 z-20 pointer-events-none">
              <div className="bg-newspaper-text text-newspaper-bg p-4 border-2 border-newspaper-border font-mono shadow-2xl animate-pulse max-w-sm">
                <div className="text-lg mb-2 flex items-center gap-2">
                  🎯 <span className="font-bold">ZONE CARD ACTIVE</span>
                </div>
                <div className="text-sm mb-3">
                  Click any <span className="text-yellow-400 font-bold">NEUTRAL</span> or <span className="text-red-500 font-bold">ENEMY</span> state to target
                </div>
                <div className="text-xs bg-black/20 p-2 rounded mb-2">
                  Card will deploy automatically when target is selected
                </div>
                <div className="text-xs text-yellow-400 flex items-center gap-1">
                  ⚠️ Cannot target your own states
                </div>
              </div>
            </div>
          )}
          
          {/* Map Area - flex-1 takes remaining space above card dock */}
          <div className="flex-1 border-2 border-newspaper-border bg-white/80 relative overflow-auto min-h-[360px]">
            {/* Card preview overlay */}
            <CardPreviewOverlay card={hoveredCard} />
            
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

          {/* Played Cards Dock - fixed height at bottom */}
          <div className="flex-shrink-0 h-[200px] md:h-[220px] lg:h-[240px] xl:h-[260px] bg-newspaper-bg border-t-2 border-newspaper-border relative z-50">
            <PlayedCardsDock playedCards={gameState.cardsPlayedThisRound} />
          </div>
        </div>

        {/* Right sidebar - AI Intel & Your Hand */}
        <div className="w-full xl:w-64 bg-newspaper-bg border-l-2 border-newspaper-border p-2 flex flex-col max-h-full" data-right-sidebar="true">
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
              onCardHover={setHoveredCard}
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
          audio.playSfx('click');
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

      {/* Card Animation Layer with integrated effects */}
      <CardAnimationLayer />
      
      {showPhaseTransition && (
        <PhaseTransition 
          phase={gameState.phase}
          previousPhase={previousPhase}
          truth={gameState.truth}
          round={gameState.round}
          faction={gameState.faction}
          onComplete={() => setShowPhaseTransition(false)}
        />
      )}
      
      <TabloidVictoryScreen 
        isVisible={victoryState.isVictory}
        isVictory={gameState.faction === (gameOverReport?.winner || 'truth')}
        victoryType={victoryState.type}
        playerFaction={gameState.faction}
        gameStats={{
          rounds: gameState.round,
          finalTruth: Math.round(gameState.truth),
          playerIP: gameState.ip,
          aiIP: gameState.aiIP,
          playerStates: gameState.states.filter(s => s.owner === 'player').length,
          aiStates: gameState.states.filter(s => s.owner === 'ai').length,
          mvpCard: gameOverReport?.mvpCard,
          agenda: gameState.agenda ? {
            name: gameState.agenda.title,
            complete: gameState.agenda.complete || false
          } : undefined
        }}
        onClose={() => {
          setVictoryState({ isVictory: false, type: null });
          setGameOverReport(null);
          setShowMenu(true);
          setShowIntro(true);
        }}
        onMainMenu={() => {
          setVictoryState({ isVictory: false, type: null });
          setGameOverReport(null);
          setShowMenu(true);
          setShowIntro(true);
        }}
      />

      {/* Extra Edition Newspaper */}
      {showExtraEdition && gameOverReport && (
        <ExtraEditionNewspaper
          report={gameOverReport}
          onClose={() => {
            setShowExtraEdition(false);
            setGameOverReport(null);
            // Reset to start screen
            setShowMenu(true);
            setGameState(prev => ({ ...prev, isGameOver: false }));
            audio.setScene('start-menu');
          }}
        />
      )}

      {/* Contextual Help System */}
      <ContextualHelp
        gamePhase={gameState.phase}
        currentPlayer={gameState.currentPlayer}
        selectedCard={gameState.selectedCard}
        playerIP={gameState.ip}
        controlledStates={gameState.controlledStates.length}
        onSuggestMove={(suggestion) => {
          toast(suggestion, {
            duration: 4000,
            style: { background: '#1f2937', color: '#f3f4f6', border: '1px solid #10b981' }
          });
        }}
      />

      {/* Interactive Onboarding */}
      <InteractiveOnboarding
        isActive={showOnboarding}
        onComplete={() => setShowOnboarding(false)}
        onSkip={() => setShowOnboarding(false)}
        gameState={gameState}
      />

      {/* Card Collection */}
      <CardCollection 
        open={showCardCollection}
        onOpenChange={setShowCardCollection}
      />

      {/* New Cards Presentation */}
      <NewCardsPresentation
        cards={gameState.newCards || []}
        isVisible={gameState.showNewCardsPresentation || false}
        onConfirm={confirmNewCards}
      />

      {/* Newspaper overlay */}
      {gameState.showNewspaper && (
        <Newspaper 
          events={gameState.currentEvents}
          playedCards={gameState.cardsPlayedThisRound}
          faction={gameState.faction}
          onClose={handleCloseNewspaper}
        />
      )}

      {/* Action Phase Popup */}
      <ActionPhasePopup
        isVisible={showActionPhase}
        truthLevel={gameState.truth}
        onClose={() => setShowActionPhase(false)}
      />
    </div>
  );
};

export default Index;