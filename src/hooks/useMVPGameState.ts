import { useState, useCallback } from 'react';
import type { MVPCard, MVPGameState, MVPPlayerState } from '@/types/mvp-types';
import { MVPEngine, type PlayResult } from '@/engine/mvp-engine';
import { CARD_DATABASE_CORE } from '@/data/core_legacy';
import { STATE_DEFENSE, MVP_VICTORY_CONDITIONS } from '@/rules/mvp-policy';

interface UseMVPGameStateReturn {
  gameState: MVPGameState | null;
  initGame: (faction: 'truth' | 'government') => void;
  playCard: (cardId: string, targetStateId?: string) => void;
  endTurn: () => void;
  discardCard: (cardId: string) => void;
}

// Create a shuffled deck of cards for a faction
function createDeck(faction: 'truth' | 'government'): MVPCard[] {
  const factionCards = (CARD_DATABASE_CORE as MVPCard[]).filter(c => c.faction === faction);
  
  // Shuffle the deck
  const shuffled = [...factionCards];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  
  return shuffled;
}

// Create initial game state
function createInitialState(humanFaction: 'truth' | 'government'): MVPGameState {
  const aiFaction = humanFaction === 'truth' ? 'government' : 'truth';
  
  const humanDeck = createDeck(humanFaction);
  const aiDeck = createDeck(aiFaction);
  
  const humanPlayer: MVPPlayerState = {
    id: "P1",
    faction: humanFaction,
    deck: humanDeck.slice(5), // Remove starting hand
    hand: humanDeck.slice(0, 5), // Starting hand of 5
    discard: [],
    ip: 10, // Starting IP
    states: [], // No states controlled initially
    playsThisTurn: 0
  };
  
  const aiPlayer: MVPPlayerState = {
    id: "P2", 
    faction: aiFaction,
    deck: aiDeck.slice(5),
    hand: aiDeck.slice(0, 5),
    discard: [],
    ip: 10,
    states: [],
    playsThisTurn: 0
  };
  
  // Initialize pressure for all states
  const pressureByState: Record<string, { P1: number; P2: number }> = {};
  Object.keys(STATE_DEFENSE).forEach(stateId => {
    pressureByState[stateId] = { P1: 0, P2: 0 };
  });
  
  return {
    turn: 1,
    truth: 50, // Start at neutral
    currentPlayer: "P1", // Human goes first
    players: { P1: humanPlayer, P2: aiPlayer },
    pressureByState,
    stateDefense: STATE_DEFENSE
  };
}

export function useMVPGameState(): UseMVPGameStateReturn {
  const [gameState, setGameState] = useState<MVPGameState | null>(null);
  
  const initGame = useCallback((faction: 'truth' | 'government') => {
    const initialState = createInitialState(faction);
    setGameState(initialState);
  }, []);
  
  const playCard = useCallback((cardId: string, targetStateId?: string) => {
    if (!gameState) return;
    
    const result: PlayResult = MVPEngine.playCard(gameState, cardId, targetStateId);
    
    if (result.success && result.updatedState) {
      setGameState(result.updatedState);
      
      // Check for victory
      const victoryResult = MVPEngine.checkVictory(result.updatedState);
      if (victoryResult.winner) {
        console.log(`Victory: ${victoryResult.winner} - ${victoryResult.reason}`);
        // Handle victory state in UI
      }
    } else {
      console.warn(`Cannot play card: ${result.reason}`);
    }
  }, [gameState]);
  
  const endTurn = useCallback(() => {
    if (!gameState) return;
    
    let newState = MVPEngine.endTurn(gameState);
    
    // If it's now AI turn, execute AI logic
    if (newState.currentPlayer === "P2") {
      newState = MVPEngine.startTurn(newState);
      
      // Simple AI: play cards randomly until out of IP or plays
      const aiPlayer = newState.players.P2;
      const maxPlays = 3;
      
      for (let i = 0; i < maxPlays && aiPlayer.playsThisTurn < maxPlays && aiPlayer.hand.length > 0; i++) {
        // Find a playable card
        const playableCard = aiPlayer.hand.find(card => {
          const canPlayResult = MVPEngine.canPlay(newState, card.id);
          return canPlayResult.canPlay;
        });
        
        if (playableCard) {
          // For ZONE cards, pick a random state
          let targetState: string | undefined;
          if (playableCard.type === 'ZONE') {
            const stateIds = Object.keys(STATE_DEFENSE);
            targetState = stateIds[Math.floor(Math.random() * stateIds.length)];
          }
          
          const playResult = MVPEngine.playCard(newState, playableCard.id, targetState);
          if (playResult.success && playResult.updatedState) {
            newState = playResult.updatedState;
          } else {
            break; // Stop if we can't play
          }
        } else {
          break; // No playable cards
        }
      }
      
      // End AI turn and return to human
      newState = MVPEngine.endTurn(newState);
      newState = MVPEngine.startTurn(newState);
    } else {
      // Start human turn
      newState = MVPEngine.startTurn(newState);
    }
    
    setGameState(newState);
  }, [gameState]);
  
  const discardCard = useCallback((cardId: string) => {
    if (!gameState) return;
    
    const result = MVPEngine.discardFromHand(gameState, cardId, true); // Free discard
    if (result.success && result.updatedState) {
      setGameState(result.updatedState);
    }
  }, [gameState]);
  
  return {
    gameState,
    initGame,
    playCard,
    endTurn,
    discardCard
  };
}