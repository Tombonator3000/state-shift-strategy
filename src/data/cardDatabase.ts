import type { GameCard } from '@/components/game/GameHand';
import { extensionManager } from './extensionSystem';

// NEW CORE CARD SET - 400 Cards Total
// Truth Seekers: 200 cards (Weekly World News parody - Bigfoot, Elvis, Bat Boy, UFOs, ghost-hunting grandmas)
// Government: 200 cards (X-Files/Men in Black parody - Illuminati, lizard people, psy-ops, Roswell cover-ups)
//
// 📦 BATCH INTEGRATION STATUS:
// Batch 1 (Truth Seekers 1-50): ⏳ Pending
// Batch 2 (Truth Seekers 51-100): ⏳ Pending  
// Batch 3 (Truth Seekers 101-150): ⏳ Pending
// Batch 4 (Truth Seekers 151-200): ⏳ Pending
// Batch 5 (Government 1-50): ⏳ Pending
// Batch 6 (Government 51-100): ⏳ Pending
// Batch 7 (Government 101-150): ⏳ Pending
// Batch 8 (Government 151-200): ⏳ Pending
//
// ⚡ MIGRATION RULES:
// - Truth changes: max ±15% (Legendary only)
// - Legendary minimum cost: 25 IP  
// - Truth clamped 0-100, IP ≥ 0
// - Hand limit: 7 cards
// - Zone captures: Pressure ≥ Defense

export const CARD_DATABASE: GameCard[] = [
  // 🚨 AWAITING BATCH INTEGRATION
  // This array will be populated with 400 cards across 8 batches
  // Current status: Empty, ready for first batch
];

// Helper functions for card management
export const getCardsByType = (type: GameCard['type']) => 
  CARD_DATABASE.filter(card => card.type === type);

export const getCardsByRarity = (rarity: GameCard['rarity']) => {
  const allCards = [...CARD_DATABASE, ...extensionManager.getAllExtensionCards()];
  return allCards.filter(card => card.rarity === rarity);
};

export const getRandomCards = (count: number, filters?: {
  type?: GameCard['type'];
  rarity?: GameCard['rarity'];
}): GameCard[] => {
  const allCards = [...CARD_DATABASE, ...extensionManager.getAllExtensionCards()];
  let pool = allCards;
  
  if (filters?.type) {
    pool = pool.filter(card => card.type === filters.type);
  }
  
  if (filters?.rarity) {
    pool = pool.filter(card => card.rarity === filters.rarity);
  }
  
  const shuffled = [...pool].sort(() => Math.random() - 0.5);
  return shuffled.slice(0, count);
};

export const getCardById = (id: string): GameCard | undefined => {
  const allCards = [...CARD_DATABASE, ...extensionManager.getAllExtensionCards()];
  return allCards.find(card => card.id === id);
};

// Rarity distribution for deck building
export const RARITY_WEIGHTS = {
  common: 0.70,
  uncommon: 0.20,
  rare: 0.08,
  legendary: 0.02
};

export const generateRandomDeck = (size: number = 40): GameCard[] => {
  const deck: GameCard[] = [];
  
  // Combine core cards with extension cards
  const allCards = [...CARD_DATABASE, ...extensionManager.getAllExtensionCards()];
  
  for (let i = 0; i < size; i++) {
    const rand = Math.random();
    let rarity: GameCard['rarity'];
    
    if (rand < RARITY_WEIGHTS.common) {
      rarity = 'common';
    } else if (rand < RARITY_WEIGHTS.common + RARITY_WEIGHTS.uncommon) {
      rarity = 'uncommon';
    } else if (rand < RARITY_WEIGHTS.common + RARITY_WEIGHTS.uncommon + RARITY_WEIGHTS.rare) {
      rarity = 'rare';
    } else {
      rarity = 'legendary';
    }
    
    const cardsOfRarity = allCards.filter(card => card.rarity === rarity);
    if (cardsOfRarity.length > 0) {
      const randomCard = cardsOfRarity[Math.floor(Math.random() * cardsOfRarity.length)];
      deck.push(randomCard);
    }
  }
  
  return deck;
};
