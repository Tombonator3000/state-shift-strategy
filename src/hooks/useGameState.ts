import { useState, useCallback } from 'react';
import { CardEffectProcessor } from '@/systems/CardEffectProcessor';
import { EnhancedCardEffectProcessor } from "@/systems/EnhancedCardEffectProcessor";
import { CARD_DATABASE } from '@/data/cardDatabase';
import { EVENT_DATABASE } from '@/data/eventDatabase';
import { GameCard } from '@/types/cardTypes';
import { useAchievements } from '@/contexts/AchievementContext';
import type { EventManager, GameEvent } from '@/data/eventDatabase';
import { CardDrawState, DrawMode, calculateCardDraw } from '@/data/cardDrawingSystem';
import { AIFactory } from '@/data/aiFactory';
import { CardEffectMigrator } from '@/utils/cardEffectMigration';
import type { Card } from '@/types/cardEffects';
import { hasHarmfulEffect } from '@/utils/hasHarmfulEffect';

interface GameState {
  faction: 'government' | 'truth';
  phase: 'income' | 'action' | 'capture' | 'event' | 'newspaper' | 'victory' | 'ai_turn' | 'card_presentation';
  turn: number;
  round: number;
  currentPlayer: 'human' | 'ai';
  aiDifficulty: 'easy' | 'medium' | 'hard';
  aiPersonality?: string;
  truth: number;
  ip: number;
  aiIP: number;
  hand: GameCard[];
  aiHand: GameCard[];
  isGameOver: boolean;
  deck: GameCard[];
  aiDeck: GameCard[];
  cardsPlayedThisTurn: number;
  cardsPlayedThisRound: Array<{ card: GameCard; player: 'human' | 'ai' }>;
  controlledStates: string[];
  aiControlledStates: string[];
  states: Array<{
    id: string;
    name: string;
    abbreviation: string;
    baseIP: number;
    defense: number;
    pressure: number;
    owner: 'player' | 'ai' | 'neutral';
    specialBonus?: string;
    bonusValue?: number;
    occupierCardId?: string | null;
    occupierCardName?: string | null;
    occupierLabel?: string | null;
    occupierIcon?: string | null;
    occupierUpdatedAt?: number;
  }>;
  currentEvents: GameEvent[];
  eventManager?: EventManager;
  showNewspaper: boolean;
  log: string[];
  agenda?: any;
  secretAgenda?: any;
  aiSecretAgenda?: any;
  animating: boolean;
  aiTurnInProgress: boolean;
  selectedCard: string | null;
  targetState: string | null;
  aiStrategist?: any;
  pendingCardDraw?: number;
  newCards?: GameCard[];
  showNewCardsPresentation?: boolean;
  drawMode: DrawMode;
  cardDrawState: CardDrawState;
}

export const useGameState = (aiDifficulty: 'easy' | 'medium' | 'hard' = 'medium') => {
  const achievements = useAchievements();

  const [gameState, setGameState] = useState<GameState>({
    faction: 'government',
    phase: 'income',
    turn: 1,
    round: 1,
    currentPlayer: 'human',
    aiDifficulty,
    truth: 50,
    ip: 15,
    aiIP: 15,
    hand: [],
    aiHand: [],
    isGameOver: false,
    deck: [],
    aiDeck: [],
    cardsPlayedThisTurn: 0,
    cardsPlayedThisRound: [],
    controlledStates: [],
    aiControlledStates: [],
    states: [],
    currentEvents: [],
    showNewspaper: false,
    log: [],
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

  const initGame = useCallback((faction: 'government' | 'truth') => {
    // Basic game initialization
    const startingTruth = faction === 'government' ? 40 : 60;
    const startingIP = faction === 'government' ? 20 : 10;

    setGameState(prev => ({
      ...prev,
      faction,
      truth: startingTruth,
      ip: startingIP,
      log: [`Game started as ${faction} faction`]
    }));
  }, []);

  const playCard = useCallback((cardId: string) => {
    setGameState(prev => {
      const card = prev.hand.find(c => c.id === cardId);
      if (!card || prev.ip < card.cost || prev.cardsPlayedThisTurn >= 3 || prev.animating) {
        return prev;
      }

      // Simple card processing
      const processor = new CardEffectProcessor({
        truth: prev.truth,
        ip: prev.ip,
        aiIP: prev.aiIP,
        hand: prev.hand,
        aiHand: prev.aiHand,
        controlledStates: prev.controlledStates,
        aiControlledStates: prev.aiControlledStates || [],
        round: prev.round,
        turn: prev.turn,
        faction: prev.faction
      });

      const effectResult = processor.processCard(card as any, prev.targetState);
      
      return {
        ...prev,
        ...effectResult,
        hand: prev.hand.filter(c => c.id !== cardId),
        ip: prev.ip - card.cost,
        cardsPlayedThisTurn: prev.cardsPlayedThisTurn + 1,
        selectedCard: null,
        targetState: null
      };
    });
  }, []);

  const selectCard = useCallback((cardId: string) => {
    setGameState(prev => ({
      ...prev,
      selectedCard: prev.selectedCard === cardId ? null : cardId
    }));
  }, []);

  const selectTargetState = useCallback((stateId: string) => {
    setGameState(prev => ({
      ...prev,
      targetState: stateId
    }));
  }, []);

  const endTurn = useCallback(() => {
    setGameState(prev => ({
      ...prev,
      phase: 'ai_turn',
      currentPlayer: 'ai',
      cardsPlayedThisTurn: 0
    }));
  }, []);

  const executeAITurn = useCallback(() => {
    setGameState(prev => ({
      ...prev,
      phase: 'action',
      currentPlayer: 'human',
      turn: prev.turn + 1
    }));
  }, []);

  const closeNewspaper = useCallback(() => {
    setGameState(prev => ({
      ...prev,
      showNewspaper: false
    }));
  }, []);

  const confirmNewCards = useCallback(() => {
    setGameState(prev => ({
      ...prev,
      showNewCardsPresentation: false,
      newCards: undefined
    }));
  }, []);

  const saveGame = useCallback(() => {
    try {
      localStorage.setItem('shadowgov-save', JSON.stringify(gameState));
      return true;
    } catch (e) {
      console.error('Save failed:', e);
      return false;
    }
  }, [gameState]);

  const loadGame = useCallback(() => {
    try {
      const saved = localStorage.getItem('shadowgov-save');
      if (saved) {
        const data = JSON.parse(saved);
        setGameState(data);
        return true;
      }
      return false;
    } catch (e) {
      console.error('Load failed:', e);
      return false;
    }
  }, []);

  const getSaveInfo = useCallback(() => {
    try {
      const saved = localStorage.getItem('shadowgov-save');
      return saved ? JSON.parse(saved) : null;
    } catch (e) {
      return null;
    }
  }, []);

  const checkVictoryConditions = useCallback(() => {
    // Basic victory condition checking
    return null;
  }, []);

  const playCardAnimated = useCallback(async (cardId: string, animateCard?: any, explicitTargetState?: string) => {
    // Simple implementation that just calls playCard
    playCard(cardId);
  }, [playCard]);

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
    checkVictoryConditions
  };
};