import type { GameCard } from '@/components/game/GameHand';
import { extensionManager } from './extensionSystem';

// NEW CORE CARD SET - 400 Cards Total
// Truth Seekers: 200 cards (Weekly World News parody - Bigfoot, Elvis, Bat Boy, UFOs, ghost-hunting grandmas)
// Government: 200 cards (X-Files/Men in Black parody - Illuminati, lizard people, psy-ops, Roswell cover-ups)
//
// 📦 BATCH INTEGRATION STATUS:
// Batch 1 (Truth Seekers 1-50): ✅ Complete
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
  // ===== BATCH 1: TRUTH SEEKERS (1-50) ===== 
  // MEDIA (18)
  {
    id: "TS-001",
    faction: "Truth",
    name: "Blurry Bigfoot Photo Goes Viral",
    type: "MEDIA",
    rarity: "common",
    cost: 6,
    text: "+5% Truth. Draw 1 card.",
    flavor: "Experts confirm: pixels don't lie.",
    target: { scope: "global" },
    effects: { truthDelta: +5, draw: 1 }
  },
  {
    id: "TS-002",
    faction: "Truth",
    name: "Elvis Spotted at 3 A.M. Diner",
    type: "MEDIA",
    rarity: "uncommon",
    cost: 8,
    text: "+6% Truth. Gain +1 IP.",
    flavor: "The King recommends the midnight pancakes.",
    target: { scope: "global" },
    effects: { truthDelta: +6, ipDelta: { self: +1 } }
  },
  {
    id: "TS-003",
    faction: "Truth",
    name: "Pastor Rex's Apocalypse Podcast",
    type: "MEDIA",
    rarity: "rare",
    cost: 12,
    text: "+8% Truth. If Truth ≥ 70%, gain +2 IP.",
    flavor: "Sponsored by Doomsday Beans™.",
    target: { scope: "global" },
    effects: { truthDelta: +8, conditional: { ifTruthAtLeast: 70, ipDelta: { self: +2 } } }
  },
  {
    id: "TS-004",
    faction: "Truth",
    name: "Bat Boy Endorses Transparency",
    type: "MEDIA",
    rarity: "uncommon",
    cost: 9,
    text: "+7% Truth.",
    flavor: "His platform: windows with no curtains.",
    target: { scope: "global" },
    effects: { truthDelta: +7 }
  },
  {
    id: "TS-005",
    faction: "Truth",
    name: "Alien Wedding Blocks Traffic",
    type: "MEDIA",
    rarity: "common",
    cost: 6,
    text: "+5% Truth. Opponent loses 1 IP.",
    flavor: "Rice thrown… immediately abducted.",
    target: { scope: "opponent" },
    effects: { truthDelta: +5, ipDelta: { opponent: -1 } }
  },
  {
    id: "TS-006",
    faction: "Truth",
    name: "Local Grandma Sees Two Ghosts",
    type: "MEDIA",
    rarity: "common",
    cost: 5,
    text: "+4% Truth.",
    flavor: "They politely asked for tea.",
    target: { scope: "global" },
    effects: { truthDelta: +4 }
  },
  {
    id: "TS-007",
    faction: "Truth",
    name: "UFO Over High School Football Game",
    type: "MEDIA",
    rarity: "uncommon",
    cost: 8,
    text: "+6% Truth. Draw 1 if you control any Zone.",
    flavor: "Halftime show beamed in from Andromeda.",
    target: { scope: "global" },
    effects: { truthDelta: +6, conditional: { ifControlAnyZone: true, draw: 1 } }
  },
  {
    id: "TS-008",
    faction: "Truth",
    name: "Cryptid Selfie Goes Mainstream",
    type: "MEDIA",
    rarity: "common",
    cost: 6,
    text: "+5% Truth.",
    flavor: "#NoFilter #DefinitelyReal",
    target: { scope: "global" },
    effects: { truthDelta: +5 }
  },
  {
    id: "TS-009",
    faction: "Truth",
    name: "Elvis Opens Community Garden",
    type: "MEDIA",
    rarity: "uncommon",
    cost: 9,
    text: "+6% Truth. Gain +1 IP.",
    flavor: "He composts the tabloids.",
    target: { scope: "global" },
    effects: { truthDelta: +6, ipDelta: { self: +1 } }
  },
  {
    id: "TS-010",
    faction: "Truth",
    name: "Tabloid Thunder Special Edition",
    type: "MEDIA",
    rarity: "rare",
    cost: 13,
    text: "+8% Truth. Opponent discards 1 card.",
    flavor: "Ink smudges reveal more than black bars.",
    target: { scope: "opponent" },
    effects: { truthDelta: +8, discardOpponent: 1 }
  },
  {
    id: "TS-011",
    faction: "Truth",
    name: "Mothership Livestream Crashes App",
    type: "MEDIA",
    rarity: "rare",
    cost: 14,
    text: "+9% Truth.",
    flavor: "Chat: 'first!'",
    target: { scope: "global" },
    effects: { truthDelta: +9 }
  },
  {
    id: "TS-012",
    faction: "Truth",
    name: "Florida Man Joins the Resistance",
    type: "MEDIA",
    rarity: "common",
    cost: 6,
    text: "+5% Truth. Gain +1 IP if you played a MEDIA this turn.",
    flavor: "He brought snacks. Questionable snacks.",
    target: { scope: "global" },
    effects: { truthDelta: +5, conditional: { ifPlayedTypeThisTurn: "MEDIA", ipDelta: { self: +1 } } }
  },
  {
    id: "TS-013",
    faction: "Truth",
    name: "Elvis Busks in Area 51 Parking Lot",
    type: "MEDIA",
    rarity: "uncommon",
    cost: 9,
    text: "+7% Truth. Opponent -1 IP.",
    flavor: "Tip jar shaped like a saucer.",
    target: { scope: "opponent" },
    effects: { truthDelta: +7, ipDelta: { opponent: -1 } }
  },
  {
    id: "TS-014",
    faction: "Truth",
    name: "Citizen Journalist Scoop",
    type: "MEDIA",
    rarity: "common",
    cost: 5,
    text: "+4% Truth. Draw 1 card.",
    flavor: "Phones are better than binoculars.",
    target: { scope: "global" },
    effects: { truthDelta: +4, draw: 1 }
  },
  {
    id: "TS-015",
    faction: "Truth",
    name: "Crop Circle Art Festival",
    type: "MEDIA",
    rarity: "uncommon",
    cost: 8,
    text: "+6% Truth.",
    flavor: "BYO tractor.",
    target: { scope: "global" },
    effects: { truthDelta: +6 }
  },
  {
    id: "TS-016",
    faction: "Truth",
    name: "Tabloid Whistleblower",
    type: "MEDIA",
    rarity: "rare",
    cost: 12,
    text: "+8% Truth. Look at opponent's hand.",
    flavor: "The squeak heard round the world.",
    target: { scope: "opponent" },
    effects: { truthDelta: +8, revealOpponentHand: true }
  },
  {
    id: "TS-017",
    faction: "Truth",
    name: "Bat Boy Meets Bigfoot",
    type: "MEDIA",
    rarity: "rare",
    cost: 14,
    text: "+9% Truth. If you control any Zone, draw 1.",
    flavor: "Historic handshake, very furry.",
    target: { scope: "global" },
    effects: { truthDelta: +9, conditional: { ifControlAnyZone: true, draw: 1 } }
  },
  {
    id: "TS-018",
    faction: "Truth",
    name: "Elvis the UFO Pilot",
    type: "MEDIA",
    rarity: "rare",
    cost: 15,
    text: "+10% Truth.",
    flavor: "Thank you, interstellar much.",
    target: { scope: "global" },
    effects: { truthDelta: +10 }
  },

  // ZONE (12)
  {
    id: "TS-019",
    faction: "Truth",
    name: "Haunted Walmart",
    type: "ZONE",
    rarity: "uncommon",
    cost: 12,
    text: "Place in a state. +1 Pressure there. If you own it, +1 IP/turn.",
    flavor: "Rollback prices on cursed dolls.",
    target: { scope: "state" },
    effects: { pressure: { state: "target", amount: 1 }, zone: { perTurn: { ip: { self: +1 } } } }
  },
  {
    id: "TS-020",
    faction: "Truth",
    name: "Cornfield Abduction Site",
    type: "ZONE",
    rarity: "rare",
    cost: 18,
    text: "Place in a state. Counts as +2 Pressure there.",
    flavor: "Free tractor rides included.",
    target: { scope: "state" },
    effects: { pressure: { state: "target", amount: 2 } }
  },
  {
    id: "TS-021",
    faction: "Truth",
    name: "Bigfoot Campground",
    type: "ZONE",
    rarity: "rare",
    cost: 17,
    text: "Place in a state. On capture: +6% Truth.",
    flavor: "Please don't feed the senator.",
    target: { scope: "state" },
    effects: { pressure: { state: "target", amount: 1 }, capture: { state: "target", onCapture: { truthDelta: +6 } } }
  },
  {
    id: "TS-022",
    faction: "Truth",
    name: "Elvis Shrine in Vegas",
    type: "ZONE",
    rarity: "uncommon",
    cost: 13,
    text: "Place in Nevada. If you own it, +2 IP/turn.",
    flavor: "Burning love, steady income.",
    target: { scope: "state", restrict: ["Nevada"] },
    effects: { pressure: { state: "target", amount: 1 }, zone: { perTurn: { ip: { self: +2 } } } }
  },
  {
    id: "TS-023",
    faction: "Truth",
    name: "Grandma's Haunted Basement",
    type: "ZONE",
    rarity: "uncommon",
    cost: 12,
    text: "Place in a state. On capture: +4% Truth.",
    flavor: "Knitting needles levitate on Tuesdays.",
    target: { scope: "state" },
    effects: { pressure: { state: "target", amount: 1 }, capture: { state: "target", onCapture: { truthDelta: +4 } } }
  },
  {
    id: "TS-024",
    faction: "Truth",
    name: "Tabloid Printing Warehouse",
    type: "ZONE",
    rarity: "uncommon",
    cost: 14,
    text: "Place in a state. If you own it, your MEDIA cost -1 IP.",
    flavor: "Ink stains reveal hidden messages.",
    target: { scope: "state" },
    effects: { pressure: { state: "target", amount: 1 }, zone: { aura: { mediaCostDelta: -1 } } }
  },
  {
    id: "TS-025",
    faction: "Truth",
    name: "Ghost Hunter Motel",
    type: "ZONE",
    rarity: "uncommon",
    cost: 12,
    text: "Place in a state. +1 Pressure there. Draw 1 on capture.",
    flavor: "Room service knocks itself.",
    target: { scope: "state" },
    effects: { pressure: { state: "target", amount: 1 }, capture: { state: "target", onCapture: { draw: 1 } } }
  },
  {
    id: "TS-026",
    faction: "Truth",
    name: "Community Radio Tower",
    type: "ZONE",
    rarity: "uncommon",
    cost: 12,
    text: "Place in a state. If you own it, +1 IP/turn and +1% Truth on your turn.",
    flavor: "Static carries secrets.",
    target: { scope: "state" },
    effects: { pressure: { state: "target", amount: 1 }, zone: { perTurn: { ip: { self: +1 }, truthDelta: +1 } } }
  },
  {
    id: "TS-027",
    faction: "Truth",
    name: "Conspiracy Bookstore",
    type: "ZONE",
    rarity: "rare",
    cost: 16,
    text: "Place in a state. If you own it, your draw +1 each turn.",
    flavor: "Stamped 'definitely not a front'.",
    target: { scope: "state" },
    effects: { pressure: { state: "target", amount: 1 }, zone: { perTurn: { draw: 1 } } }
  },
  {
    id: "TS-028",
    faction: "Truth",
    name: "Lake Monster Pier",
    type: "ZONE",
    rarity: "uncommon",
    cost: 13,
    text: "Place in a state with water. On capture: +5% Truth.",
    flavor: "No refunds on splash damage.",
    target: { scope: "state", requireTag: "coastal_or_lake" },
    effects: { pressure: { state: "target", amount: 1 }, capture: { state: "target", onCapture: { truthDelta: +5 } } }
  },
  {
    id: "TS-029",
    faction: "Truth",
    name: "Roadside Elvis Museum",
    type: "ZONE",
    rarity: "uncommon",
    cost: 12,
    text: "Place in a state. If you own it, +1 IP/turn. MEDIA you play named 'Elvis' cost -1.",
    flavor: "Wax figures hum suspiciously on Thursdays.",
    target: { scope: "state" },
    effects: { pressure: { state: "target", amount: 1 }, zone: { perTurn: { ip: { self: +1 } }, tagDiscount: { includes: "Elvis", mediaCostDelta: -1 } } }
  },
  {
    id: "TS-030",
    faction: "Truth",
    name: "Paranormal Fairgrounds",
    type: "ZONE",
    rarity: "rare",
    cost: 17,
    text: "Place in a state. Counts as +2 Pressure there.",
    flavor: "Tilt-a-Whirl screams back.",
    target: { scope: "state" },
    effects: { pressure: { state: "target", amount: 2 } }
  },

  // ATTACK / OPS (10)
  {
    id: "TS-031",
    faction: "Truth",
    name: "Tinfoil Hat Distribution Drive",
    type: "ATTACK",
    rarity: "common",
    cost: 5,
    text: "Cancel 1 Government MEDIA card.",
    flavor: "Family-pack protection.",
    target: { scope: "stack", type: "MEDIA", faction: "Government" },
    effects: { cancel: { type: "MEDIA", faction: "Government" } }
  },
  {
    id: "TS-032",
    faction: "Truth",
    name: "Midnight Radio Broadcast",
    type: "ATTACK",
    rarity: "uncommon",
    cost: 8,
    text: "Opponent -3 IP. Draw 1 card.",
    flavor: "AM band, PM truths.",
    target: { scope: "opponent" },
    effects: { ipDelta: { opponent: -3 }, draw: 1 }
  },
  {
    id: "TS-033",
    faction: "Truth",
    name: "Tabloid Exposé",
    type: "ATTACK",
    rarity: "uncommon",
    cost: 9,
    text: "Target state: -1 Defense this turn.",
    flavor: "Front page beats front line.",
    target: { scope: "state" },
    effects: { defenseDelta: { state: "target", amount: -1, duration: "turn" } }
  },
  {
    id: "TS-034",
    faction: "Truth",
    name: "Ghost Hunter Raid",
    type: "ATTACK",
    rarity: "uncommon",
    cost: 8,
    text: "Opponent discards 1 card at random.",
    flavor: "They ain't afraid of your hand size.",
    target: { scope: "opponent" },
    effects: { discardOpponent: 1, random: true }
  },
  {
    id: "TS-035",
    faction: "Truth",
    name: "UFOlogist Convention",
    type: "ATTACK",
    rarity: "rare",
    cost: 12,
    text: "+5% Truth. Opponent skips next draw.",
    flavor: "Keynote featuring laser pointer to Orion.",
    target: { scope: "opponent" },
    effects: { truthDelta: +5, skipNextDraw: { opponent: true } }
  },
  {
    id: "TS-036",
    faction: "Truth",
    name: "Citizen Tipline Surge",
    type: "ATTACK",
    rarity: "common",
    cost: 6,
    text: "Opponent reveals hand. You may discard one MEDIA from it.",
    flavor: "Hold, your call is very important to justice.",
    target: { scope: "opponent" },
    effects: { revealOpponentHand: true, discardOpponentType: { type: "MEDIA", amount: 1 } }
  },
  {
    id: "TS-037",
    faction: "Truth",
    name: "Phantom File Dump",
    type: "ATTACK",
    rarity: "rare",
    cost: 12,
    text: "Draw 2 cards. Opponent -2 IP.",
    flavor: "Uploaded by user 'ghost_admin'.",
    target: { scope: "opponent" },
    effects: { draw: 2, ipDelta: { opponent: -2 } }
  },
  {
    id: "TS-038",
    faction: "Truth",
    name: "Witness Parade",
    type: "ATTACK",
    rarity: "uncommon",
    cost: 9,
    text: "Target state: +1 Pressure this turn.",
    flavor: "Everybody saw something.",
    target: { scope: "state" },
    effects: { pressure: { state: "target", amount: 1, duration: "turn" } }
  },
  {
    id: "TS-039",
    faction: "Truth",
    name: "Freedom of Information Blitz",
    type: "ATTACK",
    rarity: "rare",
    cost: 13,
    text: "Look at top 3 of your deck. Keep 1, discard 2.",
    flavor: "Heavily unredacted, lightly folded.",
    target: { scope: "self" },
    effects: { scryPick: { self: 3, keep: 1, discard: 2 } }
  },
  {
    id: "TS-040",
    faction: "Truth",
    name: "Mothman Public Warning",
    type: "ATTACK",
    rarity: "uncommon",
    cost: 8,
    text: "Cancel a Government ATTACK.",
    flavor: "Those wings weren't for show.",
    target: { scope: "stack", type: "ATTACK", faction: "Government" },
    effects: { cancel: { type: "ATTACK", faction: "Government" } }
  },

  // DEFENSIVE (5)
  {
    id: "TS-041",
    faction: "Truth",
    name: "Alien Foil Shield",
    type: "DEFENSIVE",
    rarity: "common",
    cost: 5,
    text: "Block the next effect that would reduce Truth this turn.",
    flavor: "Cranial shine, divine design.",
    target: { scope: "self" },
    effects: { protectTruthReduction: { duration: "turn" } }
  },
  {
    id: "TS-042",
    faction: "Truth",
    name: "Community Watch",
    type: "DEFENSIVE",
    rarity: "uncommon",
    cost: 7,
    text: "Cancel a Government ZONE placement.",
    flavor: "Neighborhood eyes beat satellite spies.",
    target: { scope: "stack", type: "ZONE", faction: "Government" },
    effects: { cancel: { type: "ZONE", faction: "Government" } }
  },
  {
    id: "TS-043",
    faction: "Truth",
    name: "Paranoia Rally",
    type: "DEFENSIVE",
    rarity: "uncommon",
    cost: 7,
    text: "Prevent all Truth reduction this turn.",
    flavor: "Chant louder, doubt quieter.",
    target: { scope: "self" },
    effects: { protectTruthReduction: { duration: "turn", global: true } }
  },
  {
    id: "TS-044",
    faction: "Truth",
    name: "Ghostly Intervention",
    type: "DEFENSIVE",
    rarity: "rare",
    cost: 10,
    text: "When opponent makes you discard: cancel that discard.",
    flavor: "Invisible hands hold your hand.",
    target: { scope: "self" },
    effects: { cancelIncomingDiscard: true }
  },
  {
    id: "TS-045",
    faction: "Truth",
    name: "Mothership Umbrella",
    type: "DEFENSIVE",
    rarity: "uncommon",
    cost: 8,
    text: "Cancel a Government MEDIA that reduces Truth.",
    flavor: "Broadcast jammed by cosmic drizzle.",
    target: { scope: "stack", type: "MEDIA", faction: "Government" },
    effects: { cancel: { type: "MEDIA", faction: "Government", onlyIf: { reducesTruth: true } } }
  },

  // DEVELOPMENT / TECH (4)
  {
    id: "TS-046",
    faction: "Truth",
    name: "Citizen Journalism Network",
    type: "DEVELOPMENT",
    rarity: "rare",
    cost: 12,
    text: "At start of your turn: draw +1.",
    flavor: "Many eyes, fewer lies.",
    target: { scope: "self" },
    effects: { ongoing: { perTurn: { draw: 1 } } }
  },
  {
    id: "TS-047",
    faction: "Truth",
    name: "Tabloid Press Alliance",
    type: "DEVELOPMENT",
    rarity: "uncommon",
    cost: 10,
    text: "Your MEDIA cost -1 IP (min 4).",
    flavor: "Coupons clipped from reality.",
    target: { scope: "self" },
    effects: { ongoing: { mediaCostFloor: 4, mediaCostDelta: -1 } }
  },
  {
    id: "TS-048",
    faction: "Truth",
    name: "Bigfoot Merchandise Store",
    type: "DEVELOPMENT",
    rarity: "uncommon",
    cost: 10,
    text: "At start of your turn: +2 IP.",
    flavor: "Socks for enormous feet sell out instantly.",
    target: { scope: "self" },
    effects: { ongoing: { perTurn: { ip: { self: +2 } } } }
  },
  {
    id: "TS-049",
    faction: "Truth",
    name: "Elvis Pirate Radio",
    type: "DEVELOPMENT",
    rarity: "rare",
    cost: 12,
    text: "Your Truth increases from MEDIA are +1% (cap still applies).",
    flavor: "All shook up… and tuned in.",
    target: { scope: "self" },
    effects: { ongoing: { mediaTruthBonus: +1, truthCap: 100 } }
  },

  // LEGENDARY (1)
  {
    id: "TS-050",
    faction: "Truth",
    name: "Bat Boy Returns",
    type: "LEGENDARY",
    rarity: "legendary",
    cost: 30,
    text: "+12% Truth. This round, your ZONE cards cost -2 IP (min 8).",
    flavor: "Running for Senate (again).",
    target: { scope: "global" },
    effects: { truthDelta: +12, roundModifier: { zoneCostDelta: -2, floor: 8 } }
  }
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
