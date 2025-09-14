import { useState, useCallback } from 'react';
import { Card, Context, GameState as EngineGameState } from '@/engine/types';
import { playCard, resolveReaction } from '@/engine/flow';
import { pickDefenseForAI } from '@/engine/simpleAI';
import { useNews } from '@/state/news';

interface ReactionState {
  attackCard: Card;
  attacker: "P1"|"P2";
  defender: "P1"|"P2";
  targetStateId?: string;
  ctx: Context;
}

export function useRuleEngine(){
  const [reactionState, setReactionState] = useState<ReactionState|null>(null);
  const [reactionOutcome, setReactionOutcome] = useState<"blocked"|"played"|null>(null);
  const [reactionBusy, setReactionBusy] = useState(false);
  const news = useNews();

  const convertToEngineState = useCallback((gameState:any): EngineGameState => {
    return {
      turn: gameState.round || 1,
      truth: gameState.truth || 50,
      currentPlayer: gameState.currentPlayer === 'human' ? "P1" : "P2",
      players: {
        "P1": {
          id: "P1",
          faction: gameState.faction === 'truth' ? "truth" : "government",
          deck: gameState.deck || [],
          hand: gameState.hand || [],
          discard: gameState.discard || [],
          ip: gameState.ip || 0,
          zones: gameState.controlledStates?.map((s:any)=>s.id||s.abbreviation) || [],
          zoneDefenseBonus: 0,
        },
        "P2": {
          id: "P2",
          faction: gameState.faction === 'truth' ? "government" : "truth",
          deck: gameState.aiDeck || [],
          hand: gameState.aiHand || [],
          discard: gameState.aiDiscard || [],
          ip: gameState.aiIP || 0,
          zones: gameState.states?.filter((s:any)=>s.owner==='ai').map((s:any)=>s.id||s.abbreviation) || [],
          zoneDefenseBonus: 0,
        }
      }
    };
  }, []);

  const createContext = useCallback((engineState:EngineGameState): Context => {
    const ctx: Context = {
      state: engineState,
      news,
      turnFlags: {},
      openReaction: (attackCard, attacker, defender) => {
        setReactionOutcome(null);
        if (defender === 'P1') {
          setReactionState({ attackCard, attacker, defender, ctx });
        } else {
          const def = pickDefenseForAI(ctx, defender, attackCard);
          const res = resolveReaction(ctx, { card: attackCard, attacker }, def);
          setReactionOutcome(res==="blocked"?"blocked":"played");
        }
      }
    };
    return ctx;
  }, [news]);

  const playCardWithEngine = useCallback((gameState:any, cardId:string, targetStateId?:string) => {
    const engineState = convertToEngineState(gameState);
    const ctx = createContext(engineState);
    const card = ctx.state.players.P1.hand.find(c=>c.id===cardId);
    if(!card) return null;
    const outcome = playCard(ctx, "P1", card, targetStateId);
    if (outcome !== 'reaction-pending') setReactionOutcome(outcome==='blocked'?"blocked":"played");
    return { outcome, updatedState: ctx.state };
  }, [convertToEngineState, createContext]);

  const handleDefenseSelection = useCallback((defense:Card|null) => {
    if(!reactionState) return;
    setReactionBusy(true);
    const res = resolveReaction(reactionState.ctx, { card: reactionState.attackCard, attacker: reactionState.attacker, targetStateId: reactionState.targetStateId }, defense);
    setReactionOutcome(res==='blocked'?"blocked":"played");
    setReactionState(null);
    setReactionBusy(false);
  }, [reactionState]);

  const getDefensiveCards = useCallback((gameState:any):Card[] => {
    const hand = gameState.hand || [];
    return hand.filter((c:any)=>c.type==="DEFENSIVE"||c.type==="INSTANT").map((card:any)=>({ id:card.id, name:card.name, type:card.type, cost:card.cost, faction:card.faction, effects:card.effects }));
  }, []);

  return { reactionState, reactionOutcome, reactionBusy, playCardWithEngine, handleDefenseSelection, getDefensiveCards, closeReactionModal:()=>setReactionState(null) };
}
