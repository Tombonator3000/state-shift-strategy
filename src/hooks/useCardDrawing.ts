import { useState, useEffect } from 'react';
import { calculateCardDraw, getStartingHandSize, type DrawMode, type CardDrawState } from '@/data/cardDrawingSystem';

export interface DrawingSettings {
  drawMode: DrawMode;
}

export const useCardDrawing = () => {
  const [settings, setSettings] = useState<DrawingSettings>({ drawMode: 'standard' });
  const [drawState, setDrawState] = useState<CardDrawState>({
    cardsPlayedLastTurn: 0,
    lastTurnWithoutPlay: false
  });

  // Load settings from localStorage
  useEffect(() => {
    const savedSettings = localStorage.getItem('gameSettings');
    if (savedSettings) {
      const parsed = JSON.parse(savedSettings);
      if (parsed.drawMode) {
        setSettings({ drawMode: parsed.drawMode });
      }
    }
  }, []);

  // Update draw state when cards are played
  const updateDrawState = (cardsPlayed: number) => {
    setDrawState(prev => ({
      cardsPlayedLastTurn: cardsPlayed,
      lastTurnWithoutPlay: cardsPlayed === 0
    }));
  };

  // Calculate how many cards to draw
  const calculateDraw = (
    currentTurn: number,
    currentHandSize: number,
    maxHandSize: number = 7,
    bonusCardDraw: number = 0
  ): number => {
    return calculateCardDraw(
      settings.drawMode,
      currentTurn,
      currentHandSize,
      maxHandSize,
      drawState,
      bonusCardDraw
    );
  };

  // Get starting hand size for faction
  const getStartingHand = (faction?: 'government' | 'truth'): number => {
    return getStartingHandSize(settings.drawMode, faction);
  };

  return {
    settings,
    drawState,
    updateDrawState,
    calculateDraw,
    getStartingHand
  };
};