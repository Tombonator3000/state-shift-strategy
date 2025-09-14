import { useState, useCallback } from 'react';
import { Card, Context, GameState as EngineGameState, PlayerState } from '@/engine/types';
import { playCard as playCardEngine, resolveReaction, canAfford } from '@/engine/flow';
import { pickDefenseForAI } from '@/engine/simpleAI';

interface ReactionState {
  attackCard: Card;
  attacker: "P1" | "P2";
  defender: "P1" | "P2";
  targetStateId?: string;
}

export function useRuleEngine() {
  const [reactionState, setReactionState] = useState<ReactionState | null>(null);
  
  // Convert game state from existing format to engine format
  const convertToEngineState = useCallback((gameState: any): EngineGameState => {
    return {
      turn: gameState.round || 1,
      truth: gameState.truth || 50,
      currentPlayer: gameState.currentPlayer === 'human' ? "P1" : "P2",
      players: {
        "P1": {
          id: "P1",
          faction: "truth",
          deck: gameState.deck || [],
          hand: gameState.hand || [],
          discard: gameState.discard || [],
          ip: gameState.ip || 0,
          zones: gameState.zonesControlled || [],
          zoneDefenseBonus: 0,
          pressureTotal: 0
        },
        "P2": {
          id: "P2", 
          faction: "government",
          deck: gameState.aiDeck || [],
          hand: gameState.aiHand || [],
          discard: gameState.aiDiscard || [],
          ip: gameState.aiIP || 0,
          zones: gameState.aiZonesControlled || [],
          zoneDefenseBonus: 0,
          pressureTotal: 0
        }
      }
    };
  }, []);

  // Create engine context
  const createContext = useCallback((engineState: EngineGameState): Context => {
    return {
      state: engineState,
      log: (message: string) => console.log(`[Engine] ${message}`),
      turnFlags: {},
      openReaction: (attackCard: Card, attacker: "P1" | "P2", defender: "P1" | "P2") => {
        const isHumanDefender = defender === "P1";
        
        if (isHumanDefender) {
          setReactionState({ attackCard, attacker, defender });
        } else {
          // AI auto-defend
          const defense = pickDefenseForAI({ state: engineState } as Context, defender, attackCard);
          resolveReaction(
            { state: engineState } as Context,
            { card: attackCard, attacker },
            defense
          );
        }
      }
    };
  }, []);

  // Play a card using the new engine
  const playCardWithEngine = useCallback((gameState: any, cardId: string, targetStateId?: string) => {
    const engineState = convertToEngineState(gameState);
    const context = createContext(engineState);
    
    const hand = gameState.hand || [];
    const card = hand.find((c: any) => c.id === cardId);
    if (!card) return null;
    
    // Convert card to engine format
    const engineCard: Card = {
      id: card.id,
      name: card.name,
      type: card.type,
      cost: card.cost,
      faction: card.faction,
      rarity: card.rarity,
      effects: card.effects
    };
    
    const outcome = playCardEngine(context, "P1", engineCard, targetStateId);
    
    return {
      outcome,
      updatedState: context.state
    };
  }, [convertToEngineState, createContext]);

  // Handle defense selection from modal
  const handleDefenseSelection = useCallback((defenseCard: Card | null) => {
    if (!reactionState) return;
    
    console.log(`[Engine] Defense choice:`, defenseCard?.name || 'No defense');
    
    // Close the modal - in a full implementation this would:
    // 1. Get current engine state 
    // 2. Call resolveReaction with the defense choice
    // 3. Update game state with results
    setReactionState(null);
    
    // Log the resolution for now
    if (defenseCard) {
      console.log(`[Engine] ${reactionState.defender} played defense: ${defenseCard.name}`);
    } else {
      console.log(`[Engine] ${reactionState.defender} chose not to defend`);
    }
  }, [reactionState]);

  // Get defensive cards from hand
  const getDefensiveCards = useCallback((gameState: any): Card[] => {
    const hand = gameState.hand || [];
    return hand
      .filter((card: any) => card.type === "DEFENSIVE" && gameState.ip >= card.cost)
      .map((card: any): Card => ({
        id: card.id,
        name: card.name,
        type: card.type,
        cost: card.cost,
        faction: card.faction,
        rarity: card.rarity,
        effects: card.effects
      }));
  }, []);

  return {
    reactionState,
    playCardWithEngine,
    handleDefenseSelection,
    getDefensiveCards,
    closeReactionModal: () => setReactionState(null)
  };
}