// Utility functions for integrating the newspaper system with the game

import { GameCard } from '@/types/cardTypes';
import { newspaper } from '@/systems/newspaper';

export const initializeNewspaperSystem = async () => {
  try {
    await newspaper.loadConfig();
    console.log('📰 Newspaper system initialized successfully');
    return true;
  } catch (error) {
    console.warn('📰 Failed to initialize newspaper system:', error);
    return false;
  }
};

export const shouldShowNewspaper = (gameState: any): boolean => {
  // Show newspaper when phase is 'newspaper' and there are cards played this round
  return gameState.phase === 'newspaper' && 
         gameState.showNewspaper && 
         gameState.cardsPlayedThisRound.length > 0;
};

export const buildRoundContext = (gameState: any) => {
  return {
    round: gameState.round,
    truth: gameState.truth,
    ip: { human: gameState.ip, ai: gameState.aiIP },
    states: gameState.states
  };
};