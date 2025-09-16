import { useState, useCallback } from 'react';
import type { GameCard } from '@/types/cardTypes';
import { CARD_DATABASE } from '@/data/cardDatabase';
import { extensionManager } from '@/data/extensionSystem';
import { generateWeightedDeck } from '@/data/weightedCardDistribution';
import { USA_STATES, getInitialStateControl, getTotalIPFromStates, type StateData } from '@/data/usaStates';
import { getRandomAgenda, SecretAgenda } from '@/data/agendaDatabase';
import { type AIDifficulty } from '@/data/aiStrategy';
import { AIFactory } from '@/data/aiFactory';
import { EventManager, type GameEvent, EVENT_DATABASE } from '@/data/eventDatabase';
import { getStartingHandSize, type DrawMode } from '@/data/cardDrawingSystem';
import type { GameState } from '@/state/gameState';
import {
  HAND_LIMIT,
  prepareAITurnStart,
  prepareHumanTurnStart,
  refillHandFromStacks,
} from '@/state/turnPreparation';
import { useAchievements } from '@/contexts/AchievementContext';
import { resolveCardEffects as resolveCardEffectsCore, type CardPlayResolution } from '@/systems/cardResolution';

const generateInitialEvents = (eventManager: EventManager): GameEvent[] => {
  // Start with some common events for the first newspaper
  const initialEvents = EVENT_DATABASE.filter(event =>
    event.rarity === 'common' && !event.conditions
  ).slice(0, 3);

  return initialEvents;
};

const omitClashKey = (key: string, value: unknown) => (key === 'clash' ? undefined : value);
export const useGameState = (aiDifficulty: AIDifficulty = 'medium') => {
  const [eventManager] = useState(() => new EventManager());
  const achievements = useAchievements();
  
  // Ensure extensions are enabled for proper card variety
  const coreCards = CARD_DATABASE;
  const extensionCards = extensionManager.getAllExtensionCards();
  const allCards = [...coreCards, ...extensionCards];

  console.log(`📊 Card Database Stats:
  - Core cards: ${coreCards.length}
  - Extension cards: ${extensionCards.length}
  - Total available: ${allCards.length}`);

  const initialPlayerDeck = generateWeightedDeck(40, 'truth');
  const initialPlayerSetup = refillHandFromStacks(
    { hand: [], deck: initialPlayerDeck, discard: [] },
    'truth',
    3,
  );
  const initialAIDeck = generateWeightedDeck(40, 'government');
  const initialAISetup = refillHandFromStacks(
    { hand: [], deck: initialAIDeck, discard: [] },
    'government',
    3,
  );

  const [gameState, setGameState] = useState<GameState>({
    faction: 'truth',
    phase: 'action',
    turn: 1,
    round: 1,
    currentPlayer: 'human',
    aiDifficulty,
    truth: 60,
    ip: 15,
    aiIP: 15,
    // Use all available cards to ensure proper deck building
    hand: initialPlayerSetup.hand,
    discardPile: initialPlayerSetup.discard,
    aiHand: initialAISetup.hand,
    aiDiscardPile: initialAISetup.discard,
    isGameOver: false,
    deck: initialPlayerSetup.deck,
    aiDeck: initialAISetup.deck,
    cardsPlayedThisTurn: 0,
    cardsPlayedThisRound: [],
    controlledStates: [],
    aiControlledStates: [],
    states: USA_STATES.map(state => {
      return {
        id: state.id,
        name: state.name,
        abbreviation: state.abbreviation,
        baseIP: state.baseIP,
        defense: state.defense,
        pressure: 0,
        owner: 'neutral' as const,
        specialBonus: state.specialBonus,
        bonusValue: state.bonusValue
      };
    }),
    currentEvents: generateInitialEvents(eventManager),
    eventManager,
    showNewspaper: false,
    log: [
      'Game started - Truth Seekers faction selected',
      'Starting Truth: 60%',
      'Cards drawn: 3',
      `AI Difficulty: ${aiDifficulty}`
    ],
    agenda: {
      ...getRandomAgenda('truth'),
      progress: 0,
      complete: false,
      revealed: false
    },
    secretAgenda: {
      ...getRandomAgenda('truth'),
      progress: 0,
      completed: false,
      revealed: false
    },
    aiSecretAgenda: {
      ...getRandomAgenda('government'),
      progress: 0,
      completed: false,
      revealed: false
    },
    animating: false,
    aiTurnInProgress: false,
    selectedCard: null,
    targetState: null,
    aiStrategist: AIFactory.createStrategist(aiDifficulty),
    drawMode: 'standard',
    cardDrawState: {
      cardsPlayedLastTurn: 0,
      lastTurnWithoutPlay: false
    }
  });

  const resolveCardEffects = useCallback(
    (
      prev: GameState,
      card: GameCard,
      targetState: string | null,
    ): CardPlayResolution => {
      return resolveCardEffectsCore(prev, card, targetState, achievements);
    },
    [achievements],
  );

  const initGame = useCallback((faction: 'government' | 'truth') => {
    const startingTruth = faction === 'government' ? 40 : 60;
    const startingIP = faction === 'government' ? 20 : 10; // Player IP
    const aiStartingIP = faction === 'government' ? 10 : 20; // AI starts as the opposite faction
    
    // Get draw mode from localStorage
    const savedSettings = localStorage.getItem('gameSettings');
    const drawMode: DrawMode = savedSettings ? 
      (JSON.parse(savedSettings).drawMode || 'standard') : 'standard';
    
    const handSize = getStartingHandSize(drawMode, faction);
    // CRITICAL: Pass faction to deck generation
    const newDeck = generateWeightedDeck(40, faction);
    const playerSetup = refillHandFromStacks(
      { hand: [], deck: newDeck, discard: [] },
      faction,
      handSize,
    );
    const initialControl = getInitialStateControl(faction);

    // Track game start in achievements
    achievements.onGameStart(faction, aiDifficulty);
    achievements.manager.onNewGameStart();

    const aiFaction = faction === 'government' ? 'truth' : 'government';
    const aiDeck = generateWeightedDeck(40, aiFaction);
    const aiSetup = refillHandFromStacks(
      { hand: [], deck: aiDeck, discard: [] },
      aiFaction,
      handSize,
    );

    setGameState(prev => ({
      ...prev,
      faction,
      truth: startingTruth,
      ip: startingIP,
      aiIP: aiStartingIP,
      hand: playerSetup.hand,
      deck: playerSetup.deck,
      discardPile: playerSetup.discard,
      // AI gets opposite faction cards
      aiHand: aiSetup.hand,
      aiDeck: aiSetup.deck,
      aiDiscardPile: aiSetup.discard,
      controlledStates: initialControl.player,
      isGameOver: false, // CRITICAL: Reset game over state
      phase: 'action', // Reset to proper starting phase
      turn: 1,
      round: 1,
      cardsPlayedThisTurn: 0,
      cardsPlayedThisRound: [],
      animating: false,
      aiTurnInProgress: false,
      selectedCard: null,
      targetState: null,
      states: USA_STATES.map(state => {
        let owner: 'player' | 'ai' | 'neutral' = 'neutral';
        
        if (initialControl.player.includes(state.abbreviation)) owner = 'player';
        else if (initialControl.ai.includes(state.abbreviation)) owner = 'ai';
        
        return {
          id: state.id,
          name: state.name,
          abbreviation: state.abbreviation,
          baseIP: state.baseIP,
          defense: state.defense,
          pressure: 0,
          owner,
          specialBonus: state.specialBonus,
          bonusValue: state.bonusValue
        };
      }),
      log: [
        `Game started - ${faction} faction selected`,
        `Starting Truth: ${startingTruth}%`,
        `Starting IP: ${startingIP}`,
        `Cards drawn: ${handSize} (${drawMode} mode)`,
        `Controlled states: ${initialControl.player.join(', ')}`
      ],
      drawMode,
      cardDrawState: {
        cardsPlayedLastTurn: 0,
        lastTurnWithoutPlay: false
      }
    }));
  }, [achievements, aiDifficulty]);

  const playCard = useCallback((cardId: string, targetOverride?: string | null) => {
    setGameState(prev => {
      const card = prev.hand.find(c => c.id === cardId);
      if (!card || prev.ip < card.cost || prev.cardsPlayedThisTurn >= 3 || prev.animating) {
        return prev;
      }

      achievements.onCardPlayed(cardId, card.type);

      const targetState = targetOverride ?? prev.targetState ?? null;
      const resolution = resolveCardEffects(prev, card, targetState);

      return {
        ...prev,
        hand: prev.hand.filter(c => c.id !== cardId),
        discardPile: [...prev.discardPile, card],
        ip: resolution.ip,
        aiIP: resolution.aiIP,
        truth: resolution.truth,
        states: resolution.states,
        controlledStates: resolution.controlledStates,
        cardsPlayedThisTurn: prev.cardsPlayedThisTurn + 1,
        cardsPlayedThisRound: [...prev.cardsPlayedThisRound, { card, player: 'human' }],
        targetState: resolution.targetState,
        selectedCard: resolution.selectedCard,
        log: [...prev.log, ...resolution.logEntries]
      };
    });
  }, [achievements, resolveCardEffects]);

  const playCardAnimated = useCallback(async (
    cardId: string,
    animateCard: (cardId: string, card: any, options?: any) => Promise<any>,
    explicitTargetState?: string
  ) => {
    const card = gameState.hand.find(c => c.id === cardId);
    if (!card || gameState.ip < card.cost || gameState.cardsPlayedThisTurn >= 3 || gameState.animating) {
      return;
    }

    achievements.onCardPlayed(cardId, card.type);

    const targetState = explicitTargetState ?? gameState.targetState ?? null;

    setGameState(prev => {
      if (prev.animating) {
        return prev;
      }

      const resolution = resolveCardEffects(prev, card, targetState);

      return {
        ...prev,
        animating: true,
        ip: resolution.ip,
        aiIP: resolution.aiIP,
        truth: resolution.truth,
        states: resolution.states,
        controlledStates: resolution.controlledStates,
        targetState: resolution.targetState,
        selectedCard: resolution.selectedCard,
        log: [...prev.log, ...resolution.logEntries]
      };
    });

    try {
      await animateCard(cardId, card, {
        targetState,
        onResolve: async () => Promise.resolve()
      });

      setGameState(prev => ({
        ...prev,
        hand: prev.hand.filter(c => c.id !== cardId),
        discardPile: [...prev.discardPile, card],
        cardsPlayedThisTurn: prev.cardsPlayedThisTurn + 1,
        cardsPlayedThisRound: [...prev.cardsPlayedThisRound, { card, player: 'human' }],
        selectedCard: null,
        targetState: null,
        animating: false
      }));
    } catch (error) {
      console.error('Card animation failed:', error);
      setGameState(prev => ({
        ...prev,
        hand: prev.hand.filter(c => c.id !== cardId),
        discardPile: [...prev.discardPile, card],
        cardsPlayedThisTurn: prev.cardsPlayedThisTurn + 1,
        cardsPlayedThisRound: [...prev.cardsPlayedThisRound, { card, player: 'human' }],
        selectedCard: null,
        targetState: null,
        animating: false
      }));
    }
  }, [gameState, achievements, resolveCardEffects]);

  const selectCard = useCallback((cardId: string | null) => {
    setGameState(prev => ({ 
      ...prev, 
      selectedCard: prev.selectedCard === cardId ? null : cardId 
    }));
  }, []);

  const selectTargetState = useCallback((stateId: string | null) => {
    setGameState(prev => ({ ...prev, targetState: stateId }));
  }, []);

  const endTurn = useCallback(() => {
    setGameState(prev => {
      // Don't allow turn ending if game is over
      if (prev.isGameOver) return prev;
      
      if (prev.currentPlayer === 'human') {
        // Human player ending turn - switch to AI (no card draw here anymore)
        // Card drawing will happen after newspaper at start of new turn
        
        // Calculate IP income from controlled states
        const stateIncome = getTotalIPFromStates(prev.controlledStates);
        const baseIncome = 5;
        const totalIncome = baseIncome + stateIncome;

        // Update event manager with current turn
        prev.eventManager?.updateTurn(prev.turn);

        // Trigger random event (30% chance)
        let newEvents = [...prev.currentEvents];
        let eventEffectLog: string[] = [];
        let truthModifier = 0;
        let ipModifier = 0;
        let bonusCardDraw = 0;
        
        if (Math.random() < 0.3 && prev.eventManager) {
          const triggeredEvent = prev.eventManager.selectRandomEvent(prev);
          if (triggeredEvent) {
            newEvents = [triggeredEvent];
            
            // Apply event effects
            if (triggeredEvent.effects) {
              const effects = triggeredEvent.effects;
              if (effects.truth) truthModifier = effects.truth;
              if (effects.ip) ipModifier = effects.ip;
              if (effects.cardDraw) bonusCardDraw = effects.cardDraw;
              
              eventEffectLog.push(`EVENT: ${triggeredEvent.title} triggered!`);
              if (effects.truth) eventEffectLog.push(`Truth ${effects.truth > 0 ? '+' : ''}${effects.truth}%`);
              if (effects.ip) eventEffectLog.push(`IP ${effects.ip > 0 ? '+' : ''}${effects.ip}`);
              if (effects.cardDraw) eventEffectLog.push(`Draw ${effects.cardDraw} extra cards`);
            }
          }
        }

        // Store pending card draw for after newspaper
        const pendingCardDraw = bonusCardDraw;
        
        return {
          ...prev,
          turn: prev.turn + 1,
          phase: 'ai_turn',
          currentPlayer: 'ai',
          showNewspaper: false,
          cardsPlayedThisTurn: 0,
          truth: Math.max(0, Math.min(100, prev.truth + truthModifier)),
          ip: prev.ip + totalIncome + ipModifier,
          pendingCardDraw,
          currentEvents: newEvents,
          cardDrawState: {
            cardsPlayedLastTurn: prev.cardsPlayedThisTurn,
            lastTurnWithoutPlay: prev.cardsPlayedThisTurn === 0
          },
          log: [...prev.log, 
            `Turn ${prev.turn} ended`, 
            `Base income: ${baseIncome} IP`,
            `State income: ${stateIncome} IP (${prev.controlledStates.length} states)`,
            `Total income: ${totalIncome + ipModifier} IP`, 
            ...eventEffectLog,
            `AI ${prev.aiStrategist?.personality.name} is thinking...`
          ]
        };
      } else {
        // AI turn ending - switch back to human
        return {
          ...prev,
          phase: 'newspaper',
          currentPlayer: 'human',
          showNewspaper: true,
          log: [...prev.log, `AI turn completed`]
        };
      }
    });
  }, []);

  // AI Turn Management
  const executeAITurn = useCallback(async () => {
    const preparedState = await new Promise<GameState | null>(resolve => {
      setGameState(prev => {
        if (!prev.aiStrategist || prev.currentPlayer !== 'ai' || prev.aiTurnInProgress) {
          resolve(null);
          return prev;
        }

        const { patch, logEntries } = prepareAITurnStart(prev);
        const nextState: GameState = {
          ...prev,
          ...patch,
          aiTurnInProgress: true,
          log: [...prev.log, ...logEntries],
        };

        resolve(nextState);
        return nextState;
      });
    });

    if (!preparedState || !preparedState.aiStrategist) {
      return;
    }

    // Give AI time to "think" (for better UX)
    await new Promise(resolve => setTimeout(resolve, Math.random() * 1000 + 500));

    const maxCardsPerTurn = 3;

    for (let i = 0; i < maxCardsPerTurn; i++) {
      const freshState = await new Promise<GameState>(resolve => {
        setGameState(prev => {
          resolve(prev);
          return prev;
        });
      });

      if (
        freshState.currentPlayer !== 'ai' ||
        !freshState.aiStrategist ||
        freshState.aiHand.length === 0
      ) {
        break;
      }

      const bestPlay = freshState.aiStrategist.selectBestPlay({
        ...freshState,
        // Provide AI-relative IP metric expected by strategist (negative = player advantage)
        ip: -freshState.ip,
        hand: freshState.aiHand,
        controlledStates: freshState.states
          .filter(state => state.owner === 'ai')
          .map(state => state.abbreviation),
      });

      if (!bestPlay || bestPlay.priority < 0.3) {
        break; // AI decides not to play more cards
      }

      const cardToPlay = freshState.aiHand.find(c => c.id === bestPlay.cardId);
      if (!cardToPlay) {
        break;
      }

      if (freshState.aiIP < cardToPlay.cost) {
        continue; // Can't afford, try next
      }

      await playAICard(bestPlay.cardId, bestPlay.targetState, bestPlay.reasoning);

      // Brief pause between AI card plays
      await new Promise(resolve => setTimeout(resolve, 800 + Math.random() * 400));
    }

    // End AI turn
    setTimeout(() => {
      endTurn();
      // Clear in-progress flag after AI ends turn
      setGameState(prev => ({ ...prev, aiTurnInProgress: false }));
    }, 1000);
  }, [endTurn, playAICard, setGameState]);

  const playAICard = useCallback(async (cardId: string, targetState?: string, reasoning?: string) => {
    const card = gameState.aiHand.find(c => c.id === cardId);
    if (!card) return;

    setGameState(prev => {
      let newTruth = prev.truth;
      let newStates = [...prev.states];
      const newLog = [...prev.log];

      // Apply card effects
      switch (card.type) {
        case 'MEDIA':
          // AI government faction tries to lower truth
          newTruth = Math.max(0, prev.truth - 12);
          newLog.push(`AI played ${card.name}: Truth manipulation (${prev.truth}% → ${newTruth}%)`);
          break;
        case 'ZONE':
          if (targetState) {
            const stateIndex = newStates.findIndex(s => s.abbreviation === targetState);
            if (stateIndex !== -1) {
              // Parse pressure value from card text
              const pressureMatch = card.text?.match(/\+(\d+) Pressure/);
              const pressureGain = pressureMatch ? parseInt(pressureMatch[1]) : 1;
              
              newStates[stateIndex] = {
                ...newStates[stateIndex],
                pressure: newStates[stateIndex].pressure + pressureGain,
                owner: newStates[stateIndex].pressure + pressureGain >= newStates[stateIndex].defense ? 'ai' : newStates[stateIndex].owner
              };
              newLog.push(`AI played ${card.name} on ${targetState}: Added pressure (+${pressureGain})`);
              if (newStates[stateIndex].owner === 'ai') {
                newLog.push(`🚨 AI captured ${newStates[stateIndex].name}!`);
              }
            }
          }
          break;
        case 'ATTACK':
          const damage = 15 + Math.floor(Math.random() * 10);
          newLog.push(`AI played ${card.name}: Attack for ${damage} IP damage`);
          // Player loses IP (which is positive), so we subtract
          const newIP = Math.max(0, prev.ip - damage);
          if (reasoning) newLog.push(`AI Strategy: ${reasoning}`);
          return {
            ...prev,
            truth: newTruth,
            states: newStates,
            ip: newIP,
            aiIP: Math.max(0, prev.aiIP - card.cost),
            aiHand: prev.aiHand.filter(c => c.id !== cardId),
            aiDiscardPile: [...prev.aiDiscardPile, card],
            cardsPlayedThisTurn: prev.cardsPlayedThisTurn + 1,
            cardsPlayedThisRound: [...prev.cardsPlayedThisRound, { card, player: 'ai' }],
            log: newLog
          };
        case 'DEFENSIVE':
          newLog.push(`AI played ${card.name}: Defensive preparations`);
          break;
      }

      if (reasoning) newLog.push(`AI Strategy: ${reasoning}`);

      return {
        ...prev,
        truth: newTruth,
        states: newStates,
        aiIP: Math.max(0, prev.aiIP - card.cost),
        aiHand: prev.aiHand.filter(c => c.id !== cardId),
        aiDiscardPile: [...prev.aiDiscardPile, card],
        cardsPlayedThisTurn: prev.cardsPlayedThisTurn + 1,
        cardsPlayedThisRound: [...prev.cardsPlayedThisRound, { card, player: 'ai' }],
        log: newLog
      };
    });
  }, [gameState]);

  const closeNewspaper = useCallback(() => {
    setGameState(prev => {
      const { patch, logEntries } = prepareHumanTurnStart(prev);

      return {
        ...prev,
        ...patch,
        log: [...prev.log, ...logEntries],
      };
    });
  }, []);

  const confirmNewCards = useCallback(() => {
    setGameState(prev => ({
      ...prev,
      phase: 'action',
      hand: [...prev.hand, ...(prev.newCards || [])],
      showNewCardsPresentation: false,
      newCards: [],
      log: [...prev.log, `Added ${prev.newCards?.length || 0} cards to hand`]
    }));
  }, []);

  const checkVictoryConditions = useCallback((state: GameState) => {
    // Check for victory conditions and update achievements
    let victoryType = '';
    let playerWon = false;

    // Truth-based victories
    if (state.truth >= 90 && state.faction === 'truth') {
      victoryType = 'truth_high';
      playerWon = true;
    } else if (state.truth <= 10 && state.faction === 'government') {
      victoryType = 'truth_low';
      playerWon = true;
    }
    // Territorial victory (10+ states)
    else if (state.controlledStates.length >= 10) {
      victoryType = 'territorial';
      playerWon = true;
    }
    // Economic victory (200+ IP)
    else if (state.ip >= 200) {
      victoryType = 'economic';
      playerWon = true;
    }
    // Secret agenda completion
    else if (state.secretAgenda?.completed) {
      victoryType = 'agenda';
      playerWon = true;
    }
    // AI victory conditions (similar checks for AI)
    else if (state.aiIP >= 200 || state.controlledStates.filter(s => state.states.find(st => st.abbreviation === s)?.owner === 'ai').length >= 10) {
      playerWon = false;
    }

    // If victory condition met, track in achievements
    if (victoryType && playerWon) {
      achievements.onGameEnd(true, victoryType, {
        turns: state.turn,
        finalIP: state.ip,
        finalTruth: state.truth,
        statesControlled: state.controlledStates.length
      });
    } else if (!playerWon && (state.aiIP >= 200 || state.truth <= 0 || state.truth >= 100)) {
      achievements.onGameEnd(false, 'defeat', {
        turns: state.turn,
        finalIP: state.ip,
        finalTruth: state.truth,
        statesControlled: state.controlledStates.length
      });
    }

    return { victoryType, playerWon };
  }, [achievements]);
  const saveGame = useCallback(() => {
    const saveData = {
      ...gameState,
      timestamp: Date.now(),
      version: '1.0'
    };

    try {
      localStorage.setItem('shadowgov-savegame', JSON.stringify(saveData, omitClashKey));
      return true;
    } catch (error) {
      console.error('Failed to save game:', error);
      return false;
    }
  }, [gameState]);

  const loadGame = useCallback(() => {
    try {
      const savedData = localStorage.getItem('shadowgov-savegame');
      if (!savedData) return false;

      const saveData = JSON.parse(savedData, omitClashKey);

      // Validate save data structure
      if (!saveData.faction || !saveData.phase || saveData.version !== '1.0') {
        console.warn('Invalid or incompatible save data');
        return false;
      }
      
      // Reconstruct the game state
      setGameState(prev => ({
        ...prev,
        ...saveData,
        discardPile: Array.isArray(saveData.discardPile) ? saveData.discardPile : (prev.discardPile ?? []),
        aiDiscardPile: Array.isArray(saveData.aiDiscardPile) ? saveData.aiDiscardPile : (prev.aiDiscardPile ?? []),
        // Ensure objects are properly reconstructed
        eventManager: prev.eventManager, // Keep the current event manager
        aiStrategist: prev.aiStrategist || AIFactory.createStrategist(saveData.aiDifficulty || 'medium')
      }));
      
      return true;
    } catch (error) {
      console.error('Failed to load game:', error);
      return false;
    }
  }, []);

  const getSaveInfo = useCallback(() => {
    try {
      const savedData = localStorage.getItem('shadowgov-savegame');
      if (!savedData) return null;

      const saveData = JSON.parse(savedData, omitClashKey);
      return {
        faction: saveData.faction,
        turn: saveData.turn,
        round: saveData.round,
        phase: saveData.phase,
        truth: saveData.truth,
        timestamp: saveData.timestamp,
        exists: true
      };
    } catch {
      return null;
    }
  }, []);

  const deleteSave = useCallback(() => {
    try {
      localStorage.removeItem('shadowgov-savegame');
      return true;
    } catch (error) {
      console.error('Failed to delete save:', error);
      return false;
    }
  }, []);

  return {
    gameState,
    initGame,
    playCard,
    playCardAnimated,
    selectCard,
    selectTargetState,
    endTurn,
    closeNewspaper,
    executeAITurn,
    confirmNewCards,
    setGameState,
    saveGame,
    loadGame,
    getSaveInfo,
    deleteSave,
    checkVictoryConditions
  };
};