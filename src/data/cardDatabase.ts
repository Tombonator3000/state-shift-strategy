import type { GameCard } from '@/types/cardTypes';
import { extensionManager } from './extensionSystem';
import { computeV21ECost } from '@/systems/cost/v21e';
import { whitelistEffects } from '@/utils/whitelistEffects';
import { loadCoreBundled } from '@/engine/loadCoreBundled';

// Normalize cards to v2.1E format
function normalize(card: GameCard): GameCard {
  const faction = String(card.faction || '').toLowerCase() as 'truth' | 'government';
  const type = String(card.type || 'MEDIA').toUpperCase() as GameCard['type'];
  
  const normalizedCard: GameCard = { 
    ...card, 
    faction, 
    type,
    // Ensure required fields
    name: card.name || 'Unnamed Card',
    rarity: card.rarity || 'common',
    text: card.text || '',
    flavorTruth: card.flavorTruth || card.text || '',
    flavorGov: card.flavorGov || card.text || ''
  };
  
  // ZONE cards must have state targeting
  if (normalizedCard.type === 'ZONE') {
    normalizedCard.target = { scope: 'state', count: 1, ...(normalizedCard.target || {}) };
  }
  
  // Whitelist and normalize effects
  normalizedCard.effects = whitelistEffects(normalizedCard.effects || {});
  
  // Recompute cost using v2.1E engine
  normalizedCard.cost = computeV21ECost({ 
    rarity: normalizedCard.rarity as any, 
    effects: normalizedCard.effects 
  });
  
  return normalizedCard;
}

// Lazy loading function to get core cards
let _coreCards: GameCard[] | null = null;
let _coreCardsPromise: Promise<GameCard[]> | null = null;

async function loadCoreCards(): Promise<GameCard[]> {
  if (_coreCards) return _coreCards;
  if (_coreCardsPromise) return _coreCardsPromise;
  _coreCardsPromise = (async () => {
    const data = await loadCoreBundled();
    _coreCards = data.cards;
    return _coreCards;
  })();
  return _coreCardsPromise;
}

// Initialize with fallback cards synchronously, then upgrade async
let CORE_CARDS: GameCard[] = [
  // Essential minimal cards for immediate use
  {
    id: "truth-startup-1",
    faction: "truth",
    name: "Emergency Broadcast",
    type: "MEDIA",
    rarity: "common",
    cost: 4,
    text: "+3% Truth.",
    flavorTruth: "The airwaves belong to the people.",
    flavorGov: "Unauthorized transmission detected.",
    target: { scope: "global", count: 0 },
    effects: { truthDelta: 3 }
  },
  {
    id: "gov-startup-1",
    faction: "government",
    name: "Media Control",
    type: "MEDIA",
    rarity: "common",
    cost: 4,
    text: "-3% Truth.",
    flavorTruth: "The narrative shifts.",
    flavorGov: "Information secured.",
    target: { scope: "global", count: 0 },
    effects: { truthDelta: -3 }
  }
];

// Async upgrade of cards
loadCoreCards().then(coreCards => {
  CORE_CARDS = coreCards;
  
  // Development logging
  if (import.meta.env.DEV) {
    const truthCount = CORE_CARDS.filter(c => c.faction === 'truth').length;
    const governmentCount = CORE_CARDS.filter(c => c.faction === 'government').length;
    console.log('[CORE RECOVERY]', { 
      total: CORE_CARDS.length, 
      truth: truthCount, 
      government: governmentCount 
    });
    
    if (CORE_CARDS.length < 100) {
      console.warn('⚠️ Core database seems incomplete. Expected ~400 cards, got', CORE_CARDS.length);
      console.warn('💡 Run: npx tsx scripts/rebuild-core-db.ts');
    }
  }
}).catch(error => {
  console.error('Failed to load core cards:', error);
});

// Export normalized cards
export const CARD_DATABASE: GameCard[] = new Proxy([], {
  get(target, prop) {
    if (prop === 'length') {
      return CORE_CARDS.length;
    }
    if (typeof prop === 'string' && !isNaN(Number(prop))) {
      const index = Number(prop);
      const card = CORE_CARDS[index];
      return card ? normalize(card) : undefined;
    }
    if (prop === Symbol.iterator) {
      return function* () {
        for (let i = 0; i < CORE_CARDS.length; i++) {
          yield normalize(CORE_CARDS[i]);
        }
      };
    }
    // Handle array methods
    if (prop === 'filter') {
      return function(callback: (card: GameCard, index: number, array: GameCard[]) => boolean) {
        const normalized = CORE_CARDS.map(normalize);
        return normalized.filter(callback);
      };
    }
    if (prop === 'map') {
      return function(callback: (card: GameCard, index: number, array: GameCard[]) => any) {
        const normalized = CORE_CARDS.map(normalize);
        return normalized.map(callback);
      };
    }
    if (prop === 'find') {
      return function(callback: (card: GameCard, index: number, array: GameCard[]) => boolean) {
        const normalized = CORE_CARDS.map(normalize);
        return normalized.find(callback);
      };
    }
    if (prop === 'slice') {
      return function(start?: number, end?: number) {
        const normalized = CORE_CARDS.map(normalize);
        return normalized.slice(start, end);
      };
    }
    return (CORE_CARDS as any)[prop];
  }
});

// Generate random cards function
export function getRandomCards(count: number, options?: { faction?: 'truth' | 'government' }): GameCard[] {
  let pool = CORE_CARDS.map(normalize);
  
  if (options?.faction) {
    pool = pool.filter(card => card.faction === options.faction);
  }
  
  const selected: GameCard[] = [];
  
  for (let i = 0; i < count && pool.length > 0; i++) {
    const randomIndex = Math.floor(Math.random() * pool.length);
    selected.push(pool[randomIndex]);
  }
  
  return selected;
}

// Generate random deck function  
export function generateRandomDeck(size: number = 40, faction?: 'truth' | 'government'): GameCard[] {
  let pool = CORE_CARDS.map(normalize);
  
  if (faction) {
    pool = pool.filter(card => card.faction === faction);
  }
  
  const deck: GameCard[] = [];
  
  for (let i = 0; i < size; i++) {
    const randomIndex = Math.floor(Math.random() * pool.length);
    deck.push(pool[randomIndex]);
  }
  
  return deck;
}