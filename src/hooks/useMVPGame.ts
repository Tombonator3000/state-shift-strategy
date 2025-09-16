// MVP Game Hook - Simplified game state management
// Handles 3-type card system with direct resolution

import { useState, useCallback, useRef } from 'react';
import type { MVPCard, MVPGameState, MVPPlayerState } from '@/types/mvp-types';
import { MVPGameEngine } from '@/engine/mvp-engine';
import { MVP_CORE_CARDS } from '@/data/core/mvp-core';
import { STATE_DEFENSE } from '@/rules/mvp-policy';

// Shuffle utility
function shuffleArray<T>(array: T[]): T[] {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

// Create starting deck
function createDeck(faction: "truth" | "government"): MVPCard[] {
  const factionCards = MVP_CORE_CARDS.filter(card => card.faction === faction);
  
  // Build a balanced deck: 20 cards total
  const deck: MVPCard[] = [];
  
  // Add cards by rarity distribution
  const commons = factionCards.filter(c => c.rarity === 'common');
  const uncommons = factionCards.filter(c => c.rarity === 'uncommon');
  const rares = factionCards.filter(c => c.rarity === 'rare');
  const legendaries = factionCards.filter(c => c.rarity === 'legendary');
  
  // Distribution: 10 common, 6 uncommon, 3 rare, 1 legendary
  for (let i = 0; i < Math.min(10, commons.length); i++) {
    deck.push(commons[i % commons.length]);
  }
  for (let i = 0; i < Math.min(6, uncommons.length); i++) {
    deck.push(uncommons[i % uncommons.length]);
  }
  for (let i = 0; i < Math.min(3, rares.length); i++) {
    deck.push(rares[i % rares.length]);
  }
  if (legendaries.length > 0) {
    deck.push(legendaries[0]);
  }
  
  return shuffleArray(deck);
}

function createInitialState(): MVPGameState {
  const truthDeck = createDeck('truth');
  const govDeck = createDeck('government');
  
  const initialState: MVPGameState = {
    turn: 1,
    truth: 50,
    currentPlayer: 'P1',
    playsThisTurn: 0,
    players: {
      P1: {
        id: 'P1',
        faction: 'truth',
        deck: truthDeck.slice(5), // Remove starting hand
        hand: truthDeck.slice(0, 5), // Starting hand
        discard: [],
        ip: 10, // Starting IP
        states: [],
        freeDiscardsLeft: 1
      },
      P2: {
        id: 'P2', 
        faction: 'government',
        deck: govDeck.slice(5),
        hand: govDeck.slice(0, 5),
        discard: [],
        ip: 10,
        states: [],
        freeDiscardsLeft: 1
      }
    },
    pressureByState: {},
    stateDefense: STATE_DEFENSE
  };
  
  return initialState;
}

export function useMVPGame() {
  const [gameState, setGameState] = useState<MVPGameState>(createInitialState);
  const [selectedCard, setSelectedCard] = useState<MVPCard | null>(null);
  const [selectedState, setSelectedState] = useState<string | null>(null);
  const [gameLog, setGameLog] = useState<string[]>([]);
  const [winner, setWinner] = useState<{ winner: "P1" | "P2"; reason: string } | null>(null);
  
  const engineRef = useRef<MVPGameEngine | null>(null);
  
  // Initialize engine
  const getEngine = useCallback(() => {
    if (!engineRef.current) {
      const logger = (msg: string) => {
        setGameLog(prev => [...prev.slice(-20), msg]); // Keep last 20 log entries
      };
      engineRef.current = new MVPGameEngine(gameState, logger);
    }
    return engineRef.current;
  }, [gameState]);

  // Update game state from engine
  const syncState = useCallback(() => {
    const engine = getEngine();
    const newState = engine.getState();
    setGameState(newState);
    
    // Check victory
    const victoryResult = engine.checkVictory();
    if (victoryResult.winner) {
      setWinner(victoryResult as any);
    }
  }, [getEngine]);

  // Start new game
  const startNewGame = useCallback(() => {
    const newState = createInitialState();
    setGameState(newState);
    engineRef.current = null;
    setSelectedCard(null);
    setSelectedState(null);
    setGameLog([]);
    setWinner(null);
  }, []);

  // Card selection
  const selectCard = useCallback((card: MVPCard | null) => {
    setSelectedCard(card);
    if (card?.type !== 'ZONE') {
      setSelectedState(null); // Clear state selection for non-ZONE cards
    }
  }, []);

  // State selection
  const selectState = useCallback((stateId: string | null) => {
    setSelectedState(stateId);
  }, []);

  // Play card
  const playCard = useCallback((card: MVPCard, targetStateId?: string) => {
    const engine = getEngine();
    const currentPlayer = engine.getCurrentPlayer();
    
    const result = engine.playCard(currentPlayer, card, targetStateId);
    
    if (result.success) {
      syncState();
      setSelectedCard(null);
      setSelectedState(null);
      return { success: true, message: result.message };
    } else {
      return { success: false, message: result.success ? result.message : "Cannot play card" };
    }
  }, [getEngine, syncState]);

  // Check if card can be played
  const canPlayCard = useCallback((card: MVPCard, targetStateId?: string) => {
    const engine = getEngine();
    const currentPlayer = engine.getCurrentPlayer();
    return engine.canPlayCard(currentPlayer, card, targetStateId);
  }, [getEngine]);

  // Discard cards
  const discardCards = useCallback((cardIds: string[]) => {
    const engine = getEngine();
    const currentPlayer = engine.getCurrentPlayer();
    
    const result = engine.discardCards(currentPlayer, cardIds);
    syncState();
    
    return result;
  }, [getEngine, syncState]);

  // End turn
  const endTurn = useCallback(() => {
    const engine = getEngine();
    const currentPlayer = engine.getCurrentPlayer();
    
    engine.endTurn(currentPlayer);
    
    // Start next player's turn
    const nextPlayer = engine.getCurrentPlayer();
    engine.startTurn(nextPlayer);
    
    syncState();
  }, [getEngine, syncState]);

  // Start turn (called at game start and after turn switch)
  const startTurn = useCallback(() => {
    const engine = getEngine();
    const currentPlayer = engine.getCurrentPlayer();
    engine.startTurn(currentPlayer);
    syncState();
  }, [getEngine, syncState]);

  // Get current player
  const currentPlayer = gameState.currentPlayer;
  const currentPlayerData = gameState.players[currentPlayer];
  const opponentData = gameState.players[currentPlayer === 'P1' ? 'P2' : 'P1'];

  return {
    // Game state
    gameState,
    currentPlayer,
    currentPlayerData,
    opponentData,
    winner,
    gameLog,
    
    // UI state
    selectedCard,
    selectedState,
    
    // Actions
    startNewGame,
    selectCard,
    selectState,
    playCard,
    canPlayCard,
    discardCards,
    endTurn,
    startTurn,
    
    // Computed values
    playsRemaining: 3 - gameState.playsThisTurn,
    canEndTurn: gameState.playsThisTurn > 0,
    
    // Helper methods
    getStateDefense: (stateId: string) => STATE_DEFENSE[stateId] || 2,
    getStatePressure: (stateId: string, playerId: "P1" | "P2") => 
      gameState.pressureByState[stateId]?.[playerId] || 0
  };
}