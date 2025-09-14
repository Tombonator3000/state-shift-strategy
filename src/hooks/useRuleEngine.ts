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
    console.log(`[Engine] Converting game state:`, { 
      phase: gameState.phase, 
      handSize: gameState.hand?.length, 
      ip: gameState.ip,
      truth: gameState.truth 
    });
    
    return {
      turn: gameState.round || 1,
      truth: gameState.truth || 50,
      currentPlayer: gameState.currentPlayer === 'human' ? "P1" : "P2",
      players: {
        "P1": {
          id: "P1",
          faction: gameState.faction === 'truth' ? "truth" : "government", // Use actual player faction
          deck: gameState.deck || [],
          hand: (gameState.hand || []).map((card: any) => ({
            ...card,
            // Ensure required fields exist
            text: card.text || card.flavorTruth || card.flavorGov || '',
            flavorTruth: card.flavorTruth || card.text || '',
            flavorGov: card.flavorGov || card.text || '',
            rarity: card.rarity || 'common'
          })),
          discard: (gameState.discard || []).map((card: any) => ({
            ...card,
            text: card.text || card.flavorTruth || card.flavorGov || '',
            flavorTruth: card.flavorTruth || card.text || '',
            flavorGov: card.flavorGov || card.text || '',
            rarity: card.rarity || 'common'
          })),
          ip: gameState.ip || 0,
          zones: gameState.controlledStates?.map((s: any) => s.id || s.abbreviation) || [],
          zoneDefenseBonus: 0,
          pressureTotal: 0
        },
        "P2": {
          id: "P2", 
          faction: gameState.faction === 'truth' ? "government" : "truth", // Opposite faction for AI
          deck: gameState.aiDeck || [],
          hand: (gameState.aiHand || []).map((card: any) => ({
            ...card,
            text: card.text || card.flavorTruth || card.flavorGov || '',
            flavorTruth: card.flavorTruth || card.text || '',
            flavorGov: card.flavorGov || card.text || '',
            rarity: card.rarity || 'common'
          })),
          discard: (gameState.aiDiscard || []).map((card: any) => ({
            ...card,
            text: card.text || card.flavorTruth || card.flavorGov || '',
            flavorTruth: card.flavorTruth || card.text || '',
            flavorGov: card.flavorGov || card.text || '',
            rarity: card.rarity || 'common'  
          })),
          ip: gameState.aiIP || 0,
          zones: gameState.states?.filter((s: any) => s.owner === 'ai').map((s: any) => s.id || s.abbreviation) || [],
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
    console.log(`[Engine] playCardWithEngine called for card:`, cardId, `target:`, targetStateId);
    console.log(`[Engine] Original game state:`, { 
      truth: gameState.truth, 
      ip: gameState.ip, 
      handSize: gameState.hand?.length,
      phase: gameState.phase
    });
    
    try {
      const engineState = convertToEngineState(gameState);
      console.log(`[Engine] Engine state conversion successful:`, { 
        truth: engineState.truth, 
        p1IP: engineState.players.P1.ip,
        p1HandSize: engineState.players.P1.hand.length,
        p1HandCards: engineState.players.P1.hand.map(c => ({ id: c.id, name: c.name }))
      });
      
      const context = createContext(engineState);
      
      const hand = gameState.hand || [];
      const card = hand.find((c: any) => c.id === cardId);
      if (!card) {
        console.error(`[Engine] Card not found in hand:`, cardId, `Available:`, hand.map((c: any) => c.id));
        return null;
      }
      
      console.log(`[Engine] Playing card:`, { 
        id: card.id, 
        name: card.name, 
        type: card.type,
        cost: card.cost,
        effects: card.effects 
      });
      
      // Convert card to engine format with proper validation
      const engineCard: Card = {
        id: card.id,
        name: card.name,
        type: card.type,
        cost: card.cost,
        faction: card.faction,
        rarity: card.rarity || 'common',
        effects: card.effects || {}
      };
      
      // Verify the card exists in engine hand before playing
      const engineHandCard = context.state.players.P1.hand.find(c => c.id === cardId);
      if (!engineHandCard) {
        console.error(`[Engine] Card ${cardId} not found in engine hand!`, {
          engineHandIds: context.state.players.P1.hand.map(c => c.id),
          originalHandIds: hand.map(c => c.id)
        });
        return null;
      }
      
      const outcome = playCardEngine(context, "P1", engineCard, targetStateId);
      console.log(`[Engine] Play outcome:`, outcome);
      console.log(`[Engine] Post-play state:`, { 
        truth: context.state.truth, 
        p1IP: context.state.players.P1.ip,
        p1HandSize: context.state.players.P1.hand.length,
        p1DiscardSize: context.state.players.P1.discard.length,
        p1HandCards: context.state.players.P1.hand.map(c => ({ id: c.id, name: c.name }))
      });
      
      return {
        outcome,
        updatedState: context.state
      };
    } catch (error) {
      console.error(`[Engine] playCardWithEngine error:`, error);
      return null;
    }
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