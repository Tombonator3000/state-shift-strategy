import { useState, useEffect } from 'react';
import type { GameCard } from '@/rules/mvp';
import { CARD_DATABASE } from '@/data/cardDatabase';
import { safeGetLocalStorageItem, safeSetLocalStorageItem } from '@/utils/storage';

interface CardCollectionData {
  discoveredCards: Set<string>;
  playedCards: Map<string, number>; // cardId -> times played
  lastUpdated: number;
}

const STORAGE_KEY = 'shadowgov-card-collection';

let hasLoggedEmptyCardDatabaseWarning = false;

export const useCardCollection = () => {
  const [collection, setCollection] = useState<CardCollectionData>({
    discoveredCards: new Set(),
    playedCards: new Map(),
    lastUpdated: Date.now()
  });

  // Load from localStorage on mount
  useEffect(() => {
    try {
      const saved = safeGetLocalStorageItem(STORAGE_KEY, { logger: console });
      if (!saved) {
        return;
      }

      const data = JSON.parse(saved);
      setCollection({
        discoveredCards: new Set(data.discoveredCards || []),
        playedCards: new Map(Object.entries(data.playedCards || {})),
        lastUpdated: data.lastUpdated || Date.now()
      });
    } catch (error) {
      console.warn('Card collection storage unavailable; continuing without persistence.', error);
    }
  }, []);

  // Save to localStorage whenever collection changes
  useEffect(() => {
    try {
      const dataToSave = {
        discoveredCards: Array.from(collection.discoveredCards),
        playedCards: Object.fromEntries(collection.playedCards),
        lastUpdated: collection.lastUpdated
      };

      const serialized = JSON.stringify(dataToSave);
      safeSetLocalStorageItem(STORAGE_KEY, serialized, { logger: console });
    } catch (error) {
      console.warn('Failed to persist card collection; continuing without storage.', error);
    }
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
    const totalCards = CARD_DATABASE.length;

    if (totalCards === 0) {
      if (!hasLoggedEmptyCardDatabaseWarning && typeof console !== 'undefined' && typeof console.warn === 'function') {
        console.warn('[card-collection] Card database is empty; returning 0% completion.');
        hasLoggedEmptyCardDatabaseWarning = true;
      }

      return {
        totalCards,
        discoveredCards: collection.discoveredCards.size,
        completionPercentage: 0,
        totalPlays: Array.from(collection.playedCards.values()).reduce((sum, count) => sum + count, 0)
      };
    }

    return {
      totalCards,
      discoveredCards: collection.discoveredCards.size,
      completionPercentage: Math.round((collection.discoveredCards.size / totalCards) * 100),
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