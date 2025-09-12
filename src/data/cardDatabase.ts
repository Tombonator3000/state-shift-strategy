import type { GameCard } from '@/types/cardTypes';
import { extensionManager } from './extensionSystem';

// Working card database with correct v2.1E types
export const CARD_DATABASE: GameCard[] = [
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
    cost: 7,
    text: "+5% Truth. Target a state; reduce its Defense by 2.",
    flavorTruth: "The people unite for transparency.",
    flavorGov: "Domestic unrest contained.",
    target: { scope: "state", count: 1 },
    effects: { truthDelta: 5, zoneDefense: -2 }
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
    cost: 8,
    text: "+6% Truth. Target a state; reduce its Defense by 1. Opponent discards 1 card.",
    flavorTruth: "Voices cannot be silenced forever.",
    flavorGov: "Civil disturbance contained.",
    target: { scope: "state", count: 1 },
    effects: { truthDelta: 6, zoneDefense: -1, discardOpponent: 1 }
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
    cost: 7,
    text: "-5% Truth. Target a state; reduce its Defense by 2.",
    flavorTruth: "Authority silences dissent.",
    flavorGov: "National security maintained.",
    target: { scope: "state", count: 1 },
    effects: { truthDelta: -5, zoneDefense: -2 }
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
    cost: 8,
    text: "-6% Truth. Target a state; reduce its Defense by 1. Opponent discards 1 card.",
    flavorTruth: "Big Brother is always watching.",
    flavorGov: "Enhanced monitoring operational.",
    target: { scope: "state", count: 1 },
    effects: { truthDelta: -6, zoneDefense: -1, discardOpponent: 1 }
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

// Generate random cards function
export function getRandomCards(count: number, options?: { faction?: 'truth' | 'government' }): GameCard[] {
  let pool = CARD_DATABASE;
  
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
  let pool = CARD_DATABASE;
  
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