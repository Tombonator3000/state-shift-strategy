import { useState, useEffect } from 'react';
import type { GameCard } from '@/types/cardTypes';
import { CARD_DATABASE } from '@/data/cardDatabase';

interface CardCollectionData {
  discoveredCards: Set<string>;
  playedCards: Map<string, number>; // cardId -> times played
  lastUpdated: number;
}

const STORAGE_KEY = 'shadowgov-card-collection';

export const useCardCollection = () => {
  const [collection, setCollection] = useState<CardCollectionData>({
    discoveredCards: new Set(),
    playedCards: new Map(),
    lastUpdated: Date.now()
  });

  // Load from localStorage on mount
  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      try {
        const data = JSON.parse(saved);
        setCollection({
          discoveredCards: new Set(data.discoveredCards || []),
          playedCards: new Map(Object.entries(data.playedCards || {})),
          lastUpdated: data.lastUpdated || Date.now()
        });
      } catch (error) {
        console.error('Failed to load card collection:', error);
      }
    }
  }, []);

  // Save to localStorage whenever collection changes
  useEffect(() => {
    const dataToSave = {
      discoveredCards: Array.from(collection.discoveredCards),
      playedCards: Object.fromEntries(collection.playedCards),
      lastUpdated: collection.lastUpdated
    };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(dataToSave));
  }, [collection]);

  const discoverCard = (cardId: string) => {
    setCollection(prev => ({
      ...prev,
      discoveredCards: new Set([...prev.discoveredCards, cardId]),
      lastUpdated: Date.now()
    }));
  };

  const playCard = (cardId: string) => {
    setCollection(prev => {
      const newPlayedCards = new Map(prev.playedCards);
      newPlayedCards.set(cardId, (newPlayedCards.get(cardId) || 0) + 1);
      
      return {
        ...prev,
        discoveredCards: new Set([...prev.discoveredCards, cardId]),
        playedCards: newPlayedCards,
        lastUpdated: Date.now()
      };
    });
  };

  const getDiscoveredCards = (): GameCard[] => {
    return CARD_DATABASE.filter(card => collection.discoveredCards.has(card.id));
  };

  const getCardStats = (cardId: string) => {
    return {
      discovered: collection.discoveredCards.has(cardId),
      timesPlayed: collection.playedCards.get(cardId) || 0
    };
  };

  const getCollectionStats = () => {
    return {
      totalCards: CARD_DATABASE.length,
      discoveredCards: collection.discoveredCards.size,
      completionPercentage: Math.round((collection.discoveredCards.size / CARD_DATABASE.length) * 100),
      totalPlays: Array.from(collection.playedCards.values()).reduce((sum, count) => sum + count, 0)
    };
  };

  return {
    collection,
    discoverCard,
    playCard,
    getDiscoveredCards,
    getCardStats,
    getCollectionStats
  };
};