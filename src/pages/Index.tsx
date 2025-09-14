import { useEffect, useState, useCallback } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import USAMap from '@/components/game/USAMap';
import GameHand from '@/components/game/GameHand';
import EnhancedUSAMap from '@/components/game/EnhancedUSAMap';
import EnhancedGameHand from '@/components/game/EnhancedGameHand';
import PlayedCardsDock from '@/components/game/PlayedCardsDock';
import TruthMeter from '@/components/game/TruthMeter';
import TabloidNewspaper from '@/components/game/TabloidNewspaper';
import GameMenu from '@/components/game/GameMenu';
import SecretAgenda from '@/components/game/SecretAgenda';
import AIStatus from '@/components/game/AIStatus';
import EnhancedBalancingDashboard from '@/components/game/EnhancedBalancingDashboard';
import { EngineTestPanel } from '@/components/dev/EngineTestPanel';
import EventViewer from '@/components/game/EventViewer';
import TutorialOverlay from '@/components/game/TutorialOverlay';
import AchievementPanel from '@/components/game/AchievementPanel';
import { ClashArenaIntegrated } from '@/components/game/ClashArenaIntegrated';
import { canPlayDefensively } from '@/utils/clashHelpers';
import { AudioControls } from '@/components/ui/audio-controls';
import Options from '@/components/game/Options';
import { useGameState } from '@/hooks/useGameState';
import { useAudioContext } from '@/contexts/AudioContext';
import { useCardAnimation } from '@/hooks/useCardAnimation';
import { useRuleEngine } from '@/hooks/useRuleEngine';
import { ReactionModal } from '@/components/game/ReactionModal';
import CardAnimationLayer from '@/components/game/CardAnimationLayer';
import FloatingNumbers from '@/components/effects/FloatingNumbers';
import TabloidVictoryScreen from '@/components/effects/TabloidVictoryScreen';
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
import InGameOptions from '@/components/game/InGameOptions';
import EnhancedNewspaper from '@/components/game/EnhancedNewspaper';
import EnhancedExpansionManager from '@/components/game/EnhancedExpansionManager';
import MinimizedHand from '@/components/game/MinimizedHand';
import { VictoryConditions } from '@/components/game/VictoryConditions';
import toast, { Toaster } from 'react-hot-toast';
import { useIsMobile } from '@/hooks/use-mobile';
import MobileGameLayout from '@/components/game/MobileGameLayout';
import MobileGameHand from '@/components/game/MobileGameHand';
import ResponsiveNewspaper from '@/components/game/ResponsiveNewspaper';

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
  const isMobile = useIsMobile();
  
  // Visual effects state
  const [floatingNumbers, setFloatingNumbers] = useState<{ 
    value: number; 
    type: 'ip' | 'truth' | 'damage' | 'synergy' | 'combo' | 'chain';
    x?: number;
    y?: number;
  } | null>(null);
  const [previousPhase, setPreviousPhase] = useState('');
  const [hoveredCard, setHoveredCard] = useState<any>(null);
  const [victoryState, setVictoryState] = useState<{ isVictory: boolean; type: 'states' | 'ip' | 'truth' | 'agenda' | null }>({ isVictory: false, type: null });
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [showInGameOptions, setShowInGameOptions] = useState(false);
  const [showCardCollection, setShowCardCollection] = useState(false);
  const [gameOverReport, setGameOverReport] = useState<any>(null);
  const [showExtraEdition, setShowExtraEdition] = useState(false);
  
  const [showHowToPlay, setShowHowToPlay] = useState(false);
  const [showMinimizedHand, setShowMinimizedHand] = useState(false);
  
  const { gameState, initGame, playCard, playCardAnimated, selectCard, selectTargetState, endTurn, closeNewspaper, executeAITurn, confirmNewCards, setGameState, saveGame, loadGame, getSaveInfo, playDefensiveCard, resolveClash, closeClashWindow } = useGameState();
  const audio = useAudioContext();
  const { animatePlayCard, isAnimating } = useCardAnimation();
  const { discoverCard, playCard: recordCardPlay } = useCardCollection();
  const { reactionState, playCardWithEngine, handleDefenseSelection, getDefensiveCards, closeReactionModal } = useRuleEngine();
  const { checkSynergies, getActiveCombinations, getTotalBonusIP } = useSynergyDetection();

  // Handle AI turns
  useEffect(() => {
    if (gameState.phase === 'ai_turn' && gameState.currentPlayer === 'ai' && !gameState.aiTurnInProgress) {
      executeAITurn();
    }
  }, [gameState.phase, gameState.currentPlayer, gameState.aiTurnInProgress, executeAITurn]);

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

  // Track phase changes for context
  useEffect(() => {
    setPreviousPhase(gameState.phase);
  }, [gameState.phase]);

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
          audio?.playSFX?.('state-capture');
          
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

  const toggleFullscreen = useCallback(async () => {
    try {
      if (!document.fullscreenEnabled) {
        toast.error('Fullskjerm støttes ikke i denne nettleseren');
        audio.playSFX('click');
        return;
      }
      
      if (!document.fullscreenElement) {
        await document.documentElement.requestFullscreen();
        setIsFullscreen(true);
        toast.success('Fullskjerm aktivert!');
      } else {
        await document.exitFullscreen();
        setIsFullscreen(false);
        toast.success('Fullskjerm deaktivert');
      }
      audio.playSFX('click');
    } catch (error) {
      console.error('Fullscreen error:', error);
      if (error.name === 'NotAllowedError') {
        toast.error('Fullskjerm ble blokkert av nettleseren. Prøv F11 eller tillat fullskjerm i nettleserinnstillingene.');
      } else {
        toast.error('Kunne ikke bytte fullskjerm-modus');
      }
      audio.playSFX('click');
    }
  }, [audio]);

  // Update Index.tsx to use enhanced components and add keyboard shortcuts
  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      if (showMenu || showIntro || showInGameOptions || showHowToPlay) return;
      
      // Number keys for playing cards (1-9)
      const cardNumber = parseInt(e.key);
      if (cardNumber >= 1 && cardNumber <= 9 && gameState.hand[cardNumber - 1]) {
        const card = gameState.hand[cardNumber - 1];
        handlePlayCard(card.id);
        return;
      }
      
      switch (e.key.toLowerCase()) {
        case 'f11':
          e.preventDefault();
          toggleFullscreen();
          break;
        case 'escape':
          setShowInGameOptions(true);
          audio.playSFX('click');
          break;
        case 's':
          if (e.ctrlKey || e.metaKey) {
            e.preventDefault();
            handleSaveGame();
          }
          break;
        case 'l':
          if (e.ctrlKey || e.metaKey) {
            e.preventDefault();
            handleLoadGame();
          }
          break;
        case 'h':
          setShowHowToPlay(true);
          audio.playSFX('click');
          break;
        case ' ':
          e.preventDefault();
          if (gameState.phase === 'action' && !gameState.animating) {
            handleEndTurn();
          }
          break;
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [showMenu, showIntro, showInGameOptions, showHowToPlay, gameState.phase, gameState.animating, gameState.hand, audio]);

  const handleSaveGame = () => {
    if (saveGame) {
      const success = saveGame();
      const indicator = document.createElement('div');
      indicator.textContent = success ? '✓ GAME SAVED' : '❌ SAVE FAILED';
      indicator.className = `fixed top-4 right-4 ${success ? 'bg-green-600' : 'bg-red-600'} text-white px-4 py-2 rounded z-[70] animate-fade-in`;
      document.body.appendChild(indicator);
      setTimeout(() => indicator.remove(), 2000);
    }
  };

  const handleLoadGame = () => {
    if (loadGame && getSaveInfo?.()) {
      const success = loadGame();
      const indicator = document.createElement('div');
      indicator.textContent = success ? '✓ GAME LOADED' : '❌ LOAD FAILED';
      indicator.className = `fixed top-4 right-4 ${success ? 'bg-green-600' : 'bg-red-600'} text-white px-4 py-2 rounded z-[70] animate-fade-in`;
      document.body.appendChild(indicator);
      setTimeout(() => indicator.remove(), 2000);
    }
  };

  const startNewGame = async (faction: 'government' | 'truth') => {
    console.log('🎵 Index: Starting new game with faction:', faction);
    await initGame(faction);
    setShowMenu(false);
    setShowIntro(false);
    audio.setGameplayMusic(faction);
    audio.playSFX('click');
    
    // Auto-enter fullscreen when game starts
    try {
      if (document.fullscreenEnabled && !document.fullscreenElement) {
        await document.documentElement.requestFullscreen();
        setIsFullscreen(true);
        toast.success('Fullskjerm aktivert!');
      }
    } catch (error) {
      console.log('Fullscreen auto-entry failed:', error);
      toast.error('Kunne ikke aktivere fullskjerm automatisk');
    }
  };

  const handleZoneCardSelect = (cardId: string) => {
    const card = gameState.hand.find(c => c.id === cardId);
    if (card?.type === 'ZONE') {
      selectCard(cardId);
      audio.playSFX('click');
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
          audio.playSFX('error');
          return;
        }
        
        selectTargetState(stateId); // keep state in store for logs/UX
        audio.playSFX('click');
        toast.success(`🎯 Targeting ${targetState?.name}! Deploying zone card...`, {
          duration: 2000,
          style: { background: '#1f2937', color: '#f3f4f6', border: '1px solid #10b981' }
        });
        
        // Play immediately with explicit target (no extra clicks)
        setLoadingCard(gameState.selectedCard);
        await handlePlayCard(gameState.selectedCard, stateId);
      }
    } else {
      audio.playSFX('hover');
    }
  };

  const handleSelectCard = (cardId: string) => {
    selectCard(cardId);
    audio.playSFX('hover');
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
    if (card.type === 'ZONE' && !gameState.targetState && !targetState) {
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
      // Use new rule engine for effect processing and reaction windows
      const engineResult = playCardWithEngine(gameState, cardId, targetState);
      
      if (engineResult) {
        const { outcome, updatedState } = engineResult;
        
        if (outcome === 'reaction-pending') {
          // Reaction modal will handle the rest automatically
          console.log(`[Engine] ${card.name} triggered reaction window`);
          return; // Don't continue with old system
        } else if (outcome === 'played') {
          // Update UI game state with engine results
          console.log(`[Engine] ${card.name} played successfully, updating UI state`);
          
          // Convert engine Cards back to GameCards for UI compatibility
          const convertCardToGameCard = (engineCard: any) => ({
            ...engineCard,
            flavorTruth: engineCard.flavorTruth || '',
            flavorGov: engineCard.flavorGov || ''
          });
          
          // Apply engine state changes to UI game state
          setGameState(prevState => ({
            ...prevState,
            truth: updatedState.truth,
            ip: updatedState.players.P1.ip,
            hand: updatedState.players.P1.hand.map(convertCardToGameCard),
            discard: updatedState.players.P1.discard.map(convertCardToGameCard),
            zonesControlled: updatedState.players.P1.zones,
            // Update AI state too
            aiIP: updatedState.players.P2.ip,
            aiHand: updatedState.players.P2.hand.map(convertCardToGameCard),
            aiDiscard: updatedState.players.P2.discard.map(convertCardToGameCard),
            aiZonesControlled: updatedState.players.P2.zones
          }));
          
          // Still do visual animation for the card play
          await animatePlayCard(cardId, card);
        } else if (outcome === 'blocked') {
          toast('🛡️ Attack was blocked!', {
            duration: 2000,
            style: { background: '#1f2937', color: '#f3f4f6', border: '1px solid #3b82f6' }
          });
          return;
        } else if (outcome === 'failed') {
          throw new Error('Card failed to play');
        }
      } else {
        // Fallback to old system if engine fails
        await playCardAnimated(cardId, animatePlayCard, targetState);
      }
      
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
      console.error('[Engine] Card play error:', error);
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
    console.log('🔴 END TURN CLICKED - Phase:', gameState.phase, 'Player:', gameState.currentPlayer, 'Animating:', gameState.animating);
    
    try {
      endTurn();
      audio.playSFX('turnEnd');
      // Play card draw sound after a short delay
      setTimeout(() => {
        audio.playSFX('cardDraw');
      }, 500);
    } catch (error) {
      console.error('🔴 END TURN ERROR:', error);
      // Ensure game continues even if audio fails
      endTurn();
    }
  };

  const handleCloseNewspaper = () => {
    console.log('🔴 NEWSPAPER CLOSE CLICKED - Current phase:', gameState.phase);
    
    try {
      closeNewspaper();
      audio.playSFX('newspaper');
    } catch (error) {
      console.error('🔴 NEWSPAPER CLOSE ERROR:', error);
      // Ensure newspaper closes even if audio fails
      closeNewspaper();
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
      audio.setMenuMusic();
    }
  }, [showIntro, showMenu, audio]);

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
    return (
      <div className="space-y-4">
        <EnhancedBalancingDashboard onClose={() => setShowBalancing(false)} />
        <EngineTestPanel />
      </div>
    );
  }

  if (showMenu) {
    return <GameMenu 
      onStartGame={startNewGame} 
      onFactionHover={(faction) => {
        // Play light hover sound effect instead of changing music
        if (faction) {
          audio.playSFX('hover');
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
          audio.setMenuMusic();
        }}
        onSaveGame={() => saveGame()}
      />
    );
  }

  // Create responsive layout based on device type
  console.log('🔍 Index.tsx - isMobile:', isMobile, 'window.innerWidth:', typeof window !== 'undefined' ? window.innerWidth : 'SSR');
  
  // Force mobile for testing - remove this line later
  const forceMobile = typeof window !== 'undefined' && window.innerWidth < 900;
  
  if (isMobile || forceMobile) {
    console.log('🔍 Rendering Mobile Layout - isMobile:', isMobile, 'forceMobile:', forceMobile);
    // Mobile layout with MobileGameLayout wrapper
    return (
      <MobileGameLayout
        controlledStates={gameState.controlledStates.length}
        truth={gameState.truth}
        ip={gameState.ip}
        aiIP={gameState.aiIP}
        aiDifficulty={gameState.aiDifficulty}
        aiPersonalityName={gameState.aiStrategist?.personality.name}
        isAIThinking={gameState.phase === 'ai_turn'}
        currentPlayer={gameState.currentPlayer}
        aiControlledStates={gameState.states.filter(s => s.owner === 'ai').length}
        assessmentText={gameState.aiStrategist?.getStrategicAssessment(gameState)}
        aiHandSize={gameState.aiHand.length}
        aiObjectiveProgress={gameState.aiSecretAgenda ? (gameState.aiSecretAgenda.progress / gameState.aiSecretAgenda.target) * 100 : 0}
        playerAgenda={gameState.secretAgenda}
        aiAgenda={gameState.aiSecretAgenda}
        gameLog={gameState.log}
        onShowInGameOptions={() => setShowInGameOptions(true)}
        onShowAchievements={() => setShowAchievements(true)}
        onShowCardCollection={() => setShowCardCollection(true)}
        onShowTutorial={() => setShowTutorial(true)}
      >
        {/* Mobile Game Content */}
        <div className="flex flex-col h-full bg-[#f5f5f5]">
          {/* Map Area */}
          <div className="flex-1 border-2 border-black bg-white/80 relative overflow-auto">
            <CardPreviewOverlay card={hoveredCard} />
            
            {/* Zone targeting overlay for mobile */}
            {gameState.selectedCard && gameState.hand.find(c => c.id === gameState.selectedCard)?.type === 'ZONE' && !gameState.targetState && (
              <div className="absolute top-4 left-4 right-4 z-20 pointer-events-none">
                <div className="bg-black text-white p-3 border-2 border-white font-mono shadow-2xl animate-pulse text-center">
                  <div className="text-lg mb-1 flex items-center justify-center gap-2">
                    🎯 <span className="font-bold">TAP TO TARGET</span>
                  </div>
                  <div className="text-sm">
                    Tap any <span className="text-yellow-400 font-bold">NEUTRAL</span> or <span className="text-red-500 font-bold">ENEMY</span> state
                  </div>
                </div>
              </div>
            )}
            
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

          {/* Mobile Game Hand */}
          <MobileGameHand
            cards={gameState.hand}
            onPlayCard={(cardId) => {
              if (gameState.clash.open && gameState.clash.defender === 'human') {
                const card = gameState.hand.find(c => c.id === cardId);
                if (card && canPlayDefensively(card, gameState.ip, gameState.clash.open)) {
                  playDefensiveCard(cardId);
                  return;
                }
              }
              handlePlayCard(cardId);
            }}
            onSelectCard={handleSelectCard}
            selectedCard={gameState.selectedCard}
            currentIP={gameState.ip}
            disabled={gameState.cardsPlayedThisTurn >= 3 || gameState.phase !== 'action' || gameState.animating}
            loadingCard={loadingCard}
          />

          {/* End Turn Button */}
          <div className="p-4 bg-white border-t-2 border-black">
            <Button 
              onClick={handleEndTurn}
              className="w-full bg-black text-white hover:bg-gray-800 min-h-[56px] text-lg font-bold"
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
        </div>
      </MobileGameLayout>
    );
  }

  // Desktop layout (existing design)
  console.log('🔍 Rendering Desktop Layout');
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
                    audio.playSFX('click');
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
                    audio.playSFX('click');
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
          <VictoryConditions
            controlledStates={gameState.controlledStates.length}
            truth={gameState.truth}
            ip={gameState.ip}
          />

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
              aiHandSize={gameState.aiHand.length}
              aiObjectiveProgress={gameState.aiSecretAgenda ? (gameState.aiSecretAgenda.progress / gameState.aiSecretAgenda.target) * 100 : 0}
            />
          </div>

          {/* AI Secret Agenda - Now integrated into AIStatus component */}
          {/* This section has been moved to the expandable AI Opponent component */}
          
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
            <VictoryConditions
              controlledStates={gameState.controlledStates.length}
              truth={gameState.truth}
              ip={gameState.ip}
              isMobile={true}
            />
          </div>

          {/* AI Intel - Now integrated into AIStatus component */}
          {/* This section has been moved to the expandable AI Opponent component on the left */}

          {/* Your Hand - Takes remaining space */}
          <div className="bg-newspaper-text text-newspaper-bg p-2 mb-3 border border-newspaper-border flex-1 min-h-0">
            <h3 className="font-bold text-xs mb-2">YOUR HAND</h3>
            <EnhancedGameHand 
          cards={gameState.hand}
          onPlayCard={(cardId) => {
            if (gameState.clash.open && gameState.clash.defender === 'human') {
              const card = gameState.hand.find(c => c.id === cardId);
              if (card && canPlayDefensively(card, gameState.ip, gameState.clash.open)) {
                playDefensiveCard(cardId);
                return;
              }
            }
            handlePlayCard(cardId);
          }}
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
            audio.playMusic('theme');
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
        cards={gameState.newCards?.map(card => ({...card, rarity: card.rarity || 'common', text: card.text || ''})) || []}
        isVisible={gameState.showNewCardsPresentation || false}
        onConfirm={confirmNewCards}
      />

      {/* Responsive Newspaper overlay */}
      {gameState.showNewspaper && (
        isMobile ? (
          <ResponsiveNewspaper 
            events={gameState.currentEvents.map(event => ({
              type: event.type || 'Breaking News',
              description: (event as any).description || (event as any).text || 'Important event occurred',
              impact: (event as any).impact
            }))}
            playedCards={gameState.cardsPlayedThisRound.map(played => ({
              card: played.card,
              playedBy: played.player === 'human' ? 'player' : played.player
            }))}
            faction={gameState.faction}
            truth={gameState.truth}
            onClose={handleCloseNewspaper}
          />
        ) : (
          <TabloidNewspaper 
            events={gameState.currentEvents}
            playedCards={gameState.cardsPlayedThisRound}
            faction={gameState.faction}
            truth={gameState.truth}
            onClose={handleCloseNewspaper}
          />
        )
      )}

      {/* Reaction Modal for card engine */}
      {reactionState && (
        <ReactionModal
          open={!!reactionState}
          onOpenChange={(open) => !open && closeReactionModal()}
          attackCard={reactionState.attackCard}
          defenseHand={getDefensiveCards(gameState)}
          onDefend={handleDefenseSelection}
        />
      )}

    </div>
  );
};

export default Index;