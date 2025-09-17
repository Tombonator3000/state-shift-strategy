import type { GameCard } from '@/types/cardTypes';
import { extensionManager } from './extensionSystem';
import { computeV21ECost } from '@/systems/cost/v21e';
import { whitelistEffects } from '@/utils/whitelistEffects';

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
  if (_coreCards !== null) {
    return _coreCards;
  }
  
  if (_coreCardsPromise !== null) {
    return _coreCardsPromise;
  }
  
  _coreCardsPromise = (async () => {
    try {
      // Try to import core collector
      const coreModule = await import('./core');
      const coreCards = coreModule.CARD_DATABASE_CORE || [];
      console.log(`✅ [RUNTIME RECOVERY] Loaded ${coreCards.length} cards from core collector`);
      _coreCards = coreCards;
      return coreCards;
    } catch (error) {
      console.warn('⚠️ [RUNTIME RECOVERY] Core collector not available, using minimal fallback');
      
      // Minimal fallback cards to prevent complete failure
      const fallbackCards: GameCard[] = [
        // Truth cards
        {
          id: "truth-1",
          faction: "truth",
          name: "Leaked Documents",
          type: "MEDIA",
          rarity: "common",
          cost: 6,
          text: "+5% Truth. Draw 1 card.",
          flavorTruth: "The people have a right to know.",
          flavorGov: "Unauthorized disclosure detected.",
          target: { scope: "global", count: 0 },
          effects: { truthDelta: 5, draw: 1 }
        },
        {
          id: "truth-2", 
          faction: "truth",
          name: "Investigative Report",
          type: "MEDIA",
          rarity: "common",
          cost: 5,
          text: "+4% Truth.",
          flavorTruth: "Facts speak louder than fiction.", 
          flavorGov: "Misinformation campaign detected.",
          target: { scope: "global", count: 0 },
          effects: { truthDelta: 4 }
        },
        {
          id: "truth-3",
          faction: "truth", 
          name: "Whistleblower",
          type: "MEDIA",
          rarity: "uncommon",
          cost: 8,
          text: "+6% Truth. Opponent loses 1 IP.",
          flavorTruth: "Courage in the face of corruption.",
          flavorGov: "Security breach contained.",
          target: { scope: "global", count: 0 },
          effects: { truthDelta: 6, ipDelta: { opponent: -1 } }
        },
        {
          id: "truth-4",
          faction: "truth",
          name: "Freedom Rally",
          type: "ATTACK",
          rarity: "common",
          cost: 2,
          text: "+5% Truth. Target a state; reduce its Defense by 2.",
          flavor: "The people unite for transparency.",
          flavorTruth: "The people unite for transparency.",
          flavorGov: "Domestic unrest contained.",
          target: {
            count: 1,
            scope: "state"
          },
          effects: {
            truthDelta: 5,
            ipDelta: {
              opponent: 1
            },
            zoneDefense: -2
          }
        },
        {
          id: "truth-5",
          faction: "truth",
          name: "Information Network", 
          type: "DEFENSIVE",
          rarity: "uncommon",
          cost: 6,
          text: "Gain +3 IP. If Truth >= 60%, gain +1 additional IP.",
          flavorTruth: "Knowledge is our shield.",
          flavorGov: "Intelligence network disrupted.",
          target: { scope: "global", count: 0 },
          effects: { 
            ipDelta: { self: 3 }, 
            conditional: { 
              ifTruthAtLeast: 60, 
              then: { ipDelta: { self: 1 } } 
            } 
          }
        },
        {
          id: "truth-6",
          faction: "truth",
          name: "Citizen Journalist",
          type: "MEDIA",
          rarity: "common",
          cost: 4,
          text: "+3% Truth.",
          flavorTruth: "Truth needs no credentials.",
          flavorGov: "Unlicensed journalism detected.",
          target: { scope: "global", count: 0 },
          effects: { truthDelta: 3 }
        },
        {
          id: "truth-7",
          faction: "truth",
          name: "Underground Press",
          type: "MEDIA",
          rarity: "rare",
          cost: 10,
          text: "+8% Truth. Draw 1 card.",
          flavorTruth: "Hidden truths find their way to light.",
          flavorGov: "Unauthorized publication suppressed.",
          target: { scope: "global", count: 0 },
          effects: { truthDelta: 8, draw: 1 }
        },
        {
          id: "truth-8",
          faction: "truth",
          name: "Protest Movement",
          type: "ATTACK",
          rarity: "uncommon",
          cost: 3,
          text: "+6% Truth. Target a state; reduce its Defense by 1. Opponent discards 1 card.",
          flavor: "Voices cannot be silenced forever.",
          flavorTruth: "Voices cannot be silenced forever.",
          flavorGov: "Civil disturbance contained.",
          target: {
            count: 1,
            scope: "state"
          },
          effects: {
            truthDelta: 6,
            ipDelta: {
              opponent: 2
            },
            discardOpponent: 1,
            zoneDefense: -1
          }
        },
        {
          id: "truth-9",
          faction: "truth",
          name: "Digital Activist",
          type: "MEDIA",
          rarity: "uncommon",
          cost: 7,
          text: "+5% Truth. Gain +1 IP.",
          flavorTruth: "Information wants to be free.",
          flavorGov: "Cyber threat neutralized.",
          target: { scope: "global", count: 0 },
          effects: { truthDelta: 5, ipDelta: { self: 1 } }
        },
        {
          id: "truth-10",
          faction: "truth",
          name: "Safe House Network",
          type: "DEFENSIVE",
          rarity: "rare",
          cost: 9,
          text: "Gain +4 IP. Draw 1 card.",
          flavorTruth: "Sanctuary for those who speak truth.",
          flavorGov: "Safe house location compromised.",
          target: { scope: "global", count: 0 },
          effects: { ipDelta: { self: 4 }, draw: 1 }
        },
        
        // Government cards
        {
          id: "gov-1",
          faction: "government",
          name: "Classified Operation", 
          type: "MEDIA",
          rarity: "common",
          cost: 6,
          text: "-5% Truth. Draw 1 card.",
          flavorTruth: "The shadow grows deeper.",
          flavorGov: "Operation proceeding as planned.",
          target: { scope: "global", count: 0 },
          effects: { truthDelta: -5, draw: 1 }
        },
        {
          id: "gov-2",
          faction: "government", 
          name: "Media Blackout",
          type: "MEDIA",
          rarity: "common", 
          cost: 5,
          text: "-4% Truth.",
          flavorTruth: "Silence speaks volumes.",
          flavorGov: "Information contained successfully.",
          target: { scope: "global", count: 0 },
          effects: { truthDelta: -4 }
        },
        {
          id: "gov-3",
          faction: "government",
          name: "Disinformation Campaign",
          type: "MEDIA", 
          rarity: "uncommon",
          cost: 8,
          text: "-6% Truth. Opponent loses 1 IP.",
          flavorTruth: "Lies spread faster than truth.",
          flavorGov: "Counter-narrative deployed.",
          target: { scope: "global", count: 0 },
          effects: { truthDelta: -6, ipDelta: { opponent: -1 } }
        },
        {
          id: "gov-4",
          faction: "government",
          name: "Federal Raid",
          type: "ATTACK",
          rarity: "common",
          cost: 2,
          text: "-5% Truth. Target a state; reduce its Defense by 2.",
          flavor: "Authority silences dissent.",
          flavorTruth: "Authority silences dissent.",
          flavorGov: "National security maintained.",
          target: {
            count: 1,
            scope: "state"
          },
          effects: {
            truthDelta: -5,
            ipDelta: {
              opponent: 1
            },
            zoneDefense: -2
          }
        },
        {
          id: "gov-5", 
          faction: "government",
          name: "Security Apparatus",
          type: "DEFENSIVE",
          rarity: "uncommon",
          cost: 6,
          text: "Gain +3 IP. If Truth <= 40%, gain +1 additional IP.",
          flavorTruth: "Power protects itself.",
          flavorGov: "Defenses strengthened.",
          target: { scope: "global", count: 0 },
          effects: { 
            ipDelta: { self: 3 }, 
            conditional: { 
              ifTruthAtLeast: 40, 
              else: { ipDelta: { self: 1 } } 
            } 
          }
        },
        {
          id: "gov-6",
          faction: "government",
          name: "Propaganda Bureau",
          type: "MEDIA",
          rarity: "common",
          cost: 4,
          text: "-3% Truth.",
          flavorTruth: "History is written by the winners.",
          flavorGov: "Narrative control established.",
          target: { scope: "global", count: 0 },
          effects: { truthDelta: -3 }
        },
        {
          id: "gov-7",
          faction: "government",
          name: "Shadow Operations",
          type: "MEDIA",
          rarity: "rare",
          cost: 10,
          text: "-8% Truth. Draw 1 card.",
          flavorTruth: "What they don't know won't hurt them.",
          flavorGov: "Black operations successful.",
          target: { scope: "global", count: 0 },
          effects: { truthDelta: -8, draw: 1 }
        },
        {
          id: "gov-8",
          faction: "government",
          name: "Surveillance State",
          type: "ATTACK",
          rarity: "uncommon",
          cost: 3,
          text: "-6% Truth. Target a state; reduce its Defense by 1. Opponent discards 1 card.",
          flavor: "Big Brother is always watching.",
          flavorTruth: "Big Brother is always watching.",
          flavorGov: "Enhanced monitoring operational.",
          target: {
            count: 1,
            scope: "state"
          },
          effects: {
            truthDelta: -6,
            ipDelta: {
              opponent: 2
            },
            discardOpponent: 1,
            zoneDefense: -1
          }
        },
        {
          id: "gov-9",
          faction: "government",
          name: "Corporate Allies",
          type: "MEDIA",
          rarity: "uncommon",
          cost: 7,
          text: "-5% Truth. Gain +1 IP.",
          flavorTruth: "Money speaks louder than truth.",
          flavorGov: "Private sector cooperation secured.",
          target: { scope: "global", count: 0 },
          effects: { truthDelta: -5, ipDelta: { self: 1 } }
        },
        {
          id: "gov-10",
          faction: "government",
          name: "Intelligence Network",
          type: "DEFENSIVE",
          rarity: "rare",
          cost: 9,
          text: "Gain +4 IP. Draw 1 card.",
          flavorTruth: "They know more than you think.",
          flavorGov: "Intelligence superiority maintained.",
          target: { scope: "global", count: 0 },
          effects: { ipDelta: { self: 4 }, draw: 1 }
        }
      ];
      
      _coreCards = fallbackCards;
      return fallbackCards;
    }
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