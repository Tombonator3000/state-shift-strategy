import type { GameCard } from '@/types/cardTypes';
import { extensionManager } from './extensionSystem';
import { expectedCost, sanitizeCard, validateCard } from '@/mvp/validator';
import type { Card, CardType, Rarity } from '@/mvp/types';

const MVP_TYPES: readonly CardType[] = ['ATTACK', 'MEDIA', 'ZONE'];
const MVP_RARITIES: readonly Rarity[] = ['common', 'uncommon', 'rare', 'legendary'];

function toMvpType(type: string | undefined): CardType {
  const upper = String(type ?? 'MEDIA').toUpperCase();
  return MVP_TYPES.includes(upper as CardType) ? (upper as CardType) : 'MEDIA';
}

function toMvpRarity(rarity: string | undefined): Rarity {
  const lower = String(rarity ?? 'common').toLowerCase();
  return MVP_RARITIES.includes(lower as Rarity) ? (lower as Rarity) : 'common';
}

function fallbackNormalize(card: GameCard): GameCard {
  const faction = String(card.faction ?? 'truth').toLowerCase() === 'government' ? 'government' : 'truth';
  const type = toMvpType(card.type);
  const rarity = toMvpRarity(card.rarity as string | undefined);
  const flavorFallback = card.flavor ?? card.flavorTruth ?? card.flavorGov ?? card.text ?? '';

  const normalized: GameCard = {
    ...card,
    faction,
    type,
    rarity,
    name: card.name || 'Unnamed Card',
    text: card.text ?? '',
    flavor: card.flavor ?? card.text ?? undefined,
    flavorTruth: card.flavorTruth ?? flavorFallback,
    flavorGov: card.flavorGov ?? flavorFallback,
    cost: expectedCost(type, rarity)
  };

  if (normalized.type === 'ZONE') {
    normalized.target = normalized.target ?? { scope: 'state', count: 1 };
  }

  return normalized;
}

function mergeMetadata(original: GameCard, sanitized: Card): GameCard {
  const base = fallbackNormalize(original);
  const flavorFallback = original.flavor ?? base.flavor ?? '';

  const merged: GameCard = {
    ...base,
    ...sanitized,
    effects: sanitized.effects as GameCard['effects'],
    cost: sanitized.cost,
    flavor: original.flavor ?? sanitized.flavor,
    flavorTruth: original.flavorTruth ?? flavorFallback,
    flavorGov: original.flavorGov ?? flavorFallback,
    text: original.text ?? base.text ?? ''
  };

  if (original.target) {
    merged.target = original.target;
  } else if (merged.type === 'ZONE' && (!merged.target || merged.target.scope !== 'state')) {
    merged.target = { scope: 'state', count: 1 };
  }

  if (original.extId) {
    merged.extId = original.extId;
  }

  return merged;
}

function normalize(card: GameCard): GameCard {
  const { card: sanitized, errors, changes } = sanitizeCard(card);

  if (!sanitized) {
    if (errors.length > 0) {
      console.warn(`[CARD DATABASE] Falling back for ${card.id ?? 'unknown-card'}: ${errors.join('; ')}`);
    }
    return fallbackNormalize(card);
  }

  const validation = validateCard(sanitized);
  if (!validation.ok && import.meta.env?.DEV) {
    console.warn(
      `[CARD DATABASE] Validation warnings for ${sanitized.id}: ${validation.errors.join('; ')}`
    );
  }

  if (changes.length > 0 && import.meta.env?.DEV) {
    console.info(`[CARD DATABASE] Normalized ${sanitized.id}: ${changes.join('; ')}`);
  }

  return mergeMetadata(card, sanitized);
}

const FALLBACK_CARDS: GameCard[] = [
  {
    id: 'truth-media-mvp',
    faction: 'truth',
    name: 'Community Broadcast',
    type: 'MEDIA',
    rarity: 'common',
    cost: expectedCost('MEDIA', 'common'),
    text: '+2 Truth.',
    flavor: 'Neighbors pass along the real story.',
    effects: { truthDelta: 2 }
  },
  {
    id: 'truth-attack-mvp',
    faction: 'truth',
    name: 'Expose Scandal',
    type: 'ATTACK',
    rarity: 'uncommon',
    cost: expectedCost('ATTACK', 'uncommon'),
    text: 'Opponent loses 1 IP and discards 1 card.',
    flavor: 'Evidence hits the airwaves at the worst possible time.',
    effects: { ipDelta: { opponent: 1 }, discardOpponent: 1 }
  },
  {
    id: 'truth-zone-mvp',
    faction: 'truth',
    name: 'Grassroots Network',
    type: 'ZONE',
    rarity: 'rare',
    cost: expectedCost('ZONE', 'rare'),
    text: 'Add 2 pressure to a targeted state.',
    flavor: 'Community organizers cover every block.',
    target: { scope: 'state', count: 1 },
    effects: { pressureDelta: 2 }
  },
  {
    id: 'gov-media-mvp',
    faction: 'government',
    name: 'Official Statement',
    type: 'MEDIA',
    rarity: 'common',
    cost: expectedCost('MEDIA', 'common'),
    text: '-2 Truth.',
    flavor: 'A polished briefing calms the headlines.',
    effects: { truthDelta: -2 }
  },
  {
    id: 'gov-attack-mvp',
    faction: 'government',
    name: 'Asset Freeze',
    type: 'ATTACK',
    rarity: 'uncommon',
    cost: expectedCost('ATTACK', 'uncommon'),
    text: 'Opponent loses 1 IP.',
    flavor: 'Compliance teams lock the accounts instantly.',
    effects: { ipDelta: { opponent: 1 } }
  },
  {
    id: 'gov-zone-mvp',
    faction: 'government',
    name: 'Security Lockdown',
    type: 'ZONE',
    rarity: 'rare',
    cost: expectedCost('ZONE', 'rare'),
    text: 'Add 2 pressure to a targeted state.',
    flavor: 'Checkpoints appear on every road overnight.',
    target: { scope: 'state', count: 1 },
    effects: { pressureDelta: 2 }
  }
];

// Lazy loading function to get core cards
let _coreCards: GameCard[] | null = null;
let _coreCardsPromise: Promise<GameCard[]> | null = null;

async function loadCoreCards(): Promise<GameCard[]> {
  if (_coreCards) {
    return _coreCards;
  }

  if (_coreCardsPromise) {
    return _coreCardsPromise;
  }

  _coreCardsPromise = (async () => {
    try {
      const coreModule = await import('./core');
      const rawCards: GameCard[] = coreModule.CARD_DATABASE_CORE || [];
      console.log(`✅ [RUNTIME RECOVERY] Loaded ${rawCards.length} cards from core collector`);
      const normalized = rawCards.map(normalize);
      _coreCards = normalized;
      return normalized;
    } catch (error) {
      console.warn('⚠️ [RUNTIME RECOVERY] Core collector not available, using minimal MVP fallback');
      const normalizedFallback = FALLBACK_CARDS.map(normalize);
      _coreCards = normalizedFallback;
      return normalizedFallback;
    }
  })();

  return _coreCardsPromise;
}

let CORE_CARDS: GameCard[] = FALLBACK_CARDS.map(normalize);

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
    }
  }
}).catch(error => {
  console.error('Failed to load core cards:', error);
});

// Export normalized cards with extension integration
export const CARD_DATABASE: GameCard[] = new Proxy([], {
  get(target, prop) {
    // Get extension cards at runtime
    const extensionCards = extensionManager.getAllExtensionCards();
    const allCards = [...CORE_CARDS, ...extensionCards];
    
    if (prop === 'length') {
      return allCards.length;
    }
    if (typeof prop === 'string' && !isNaN(Number(prop))) {
      const index = Number(prop);
      const card = allCards[index];
      return card ? normalize(card) : undefined;
    }
    if (prop === Symbol.iterator) {
      return function* () {
        for (let i = 0; i < allCards.length; i++) {
          yield normalize(allCards[i]);
        }
      };
    }
    // Handle array methods
    if (prop === 'filter') {
      return function(callback: (card: GameCard, index: number, array: GameCard[]) => boolean) {
        const normalized = allCards.map(normalize);
        return normalized.filter(callback);
      };
    }
    if (prop === 'map') {
      return function(callback: (card: GameCard, index: number, array: GameCard[]) => any) {
        const normalized = allCards.map(normalize);
        return normalized.map(callback);
      };
    }
    if (prop === 'find') {
      return function(callback: (card: GameCard, index: number, array: GameCard[]) => boolean) {
        const normalized = allCards.map(normalize);
        return normalized.find(callback);
      };
    }
    if (prop === 'slice') {
      return function(start?: number, end?: number) {
        const normalized = allCards.map(normalize);
        return normalized.slice(start, end);
      };
    }
    return (allCards as any)[prop];
  }
});

// Generate random cards function
export function getRandomCards(count: number, options?: { faction?: 'truth' | 'government' }): GameCard[] {
  // Include extension cards
  const extensionCards = extensionManager.getAllExtensionCards();
  let pool = [...CORE_CARDS, ...extensionCards].map(normalize);
  
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
  // Include extension cards  
  const extensionCards = extensionManager.getAllExtensionCards();
  let pool = [...CORE_CARDS, ...extensionCards].map(normalize);
  
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