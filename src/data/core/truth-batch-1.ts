// Truth Batch 1 - v2.1E Compliant Cards
// TRUTH-001 to TRUTH-025

import type { GameCard } from '../../types/cardTypes';

export const CORE_BATCH_TRUTH_1: GameCard[] = [
  {
    id: "TRUTH-001",
    faction: "truth",
    name: "Blurry Bigfoot Photo Goes Viral",
    type: "MEDIA",
    rarity: "common",
    cost: 6,
    text: "+5% Truth. Draw 1 card.",
    flavorTruth: "Experts confirm: pixels don't lie.",
    flavorGov: "Experts confirm: pixels don't lie.",
    target: { scope: "global", count: 0 },
    effects: { truthDelta: 5, draw: 1 }
  },
  {
    id: "TRUTH-002",
    faction: "truth",
    name: "Elvis Spotted at 3 A.M. Diner",
    type: "MEDIA",
    rarity: "uncommon",
    cost: 8,
    text: "+6% Truth. Gain +1 IP.",
    flavorTruth: "The King recommends the midnight pancakes.",
    flavorGov: "The King recommends the midnight pancakes.",
    target: { scope: "global", count: 0 },
    effects: { truthDelta: 6, ipDelta: { self: 1 } }
  },
  {
    id: "TRUTH-003",
    faction: "truth",
    name: "Pastor Rex's Apocalypse Podcast",
    type: "MEDIA",
    rarity: "rare",
    cost: 12,
    text: "+8% Truth. If Truth ≥ 70%, gain +2 IP.",
    flavorTruth: "Sponsored by Doomsday Beans™.",
    flavorGov: "Sponsored by Doomsday Beans™.",
    target: { scope: "global", count: 0 },
    effects: { 
      truthDelta: 8,
      conditional: {
        ifTruthAtLeast: 70,
        then: { ipDelta: { self: 2 } }
      }
    }
  },
  {
    id: "TRUTH-004",
    faction: "truth",
    name: "Bat Boy Endorses Transparency",
    type: "MEDIA",
    rarity: "uncommon",
    cost: 9,
    text: "+7% Truth.",
    flavorTruth: "His platform: windows with no curtains.",
    flavorGov: "His platform: windows with no curtains.",
    target: { scope: "global", count: 0 },
    effects: { truthDelta: 7 }
  },
  {
    id: "TRUTH-005",
    faction: "truth",
    name: "Alien Wedding Blocks Traffic",
    type: "MEDIA",
    rarity: "common",
    cost: 6,
    text: "+5% Truth. Opponent loses 1 IP.",
    flavorTruth: "Rice thrown… immediately abducted.",
    flavorGov: "Rice thrown… immediately abducted.",
    target: { scope: "global", count: 0 },
    effects: { truthDelta: 5, ipDelta: { opponent: -1 } }
  },
  {
    id: "TRUTH-006",
    faction: "truth",
    name: "Local Grandma Sees Two Ghosts",
    type: "MEDIA",
    rarity: "common",
    cost: 5,
    text: "+4% Truth.",
    flavorTruth: "They politely asked for tea.",
    flavorGov: "They politely asked for tea.",
    target: { scope: "global", count: 0 },
    effects: { truthDelta: 4 }
  },
  {
    id: "TRUTH-007",
    faction: "truth",
    name: "UFO Over High School Football Game",
    type: "MEDIA",
    rarity: "uncommon",
    cost: 8,
    text: "+6% Truth. Draw 1 if you control 1+ zones.",
    flavorTruth: "Halftime show beamed in from Andromeda.",
    flavorGov: "Halftime show beamed in from Andromeda.",
    target: { scope: "global", count: 0 },
    effects: { 
      truthDelta: 6,
      conditional: {
        ifZonesControlledAtLeast: 1,
        then: { draw: 1 }
      }
    }
  },
  {
    id: "TRUTH-008",
    faction: "truth",
    name: "Cryptid Selfie Goes Mainstream",
    type: "MEDIA",
    rarity: "common",
    cost: 6,
    text: "+5% Truth.",
    flavorTruth: "#NoFilter #DefinitelyReal",
    flavorGov: "#NoFilter #DefinitelyReal",
    target: { scope: "global", count: 0 },
    effects: { truthDelta: 5 }
  },
  {
    id: "TRUTH-009",
    faction: "truth",
    name: "Elvis Opens Community Garden",
    type: "MEDIA",
    rarity: "uncommon",
    cost: 9,
    text: "+6% Truth. Gain +1 IP.",
    flavorTruth: "He composts the tabloids.",
    flavorGov: "He composts the tabloids.",
    target: { scope: "global", count: 0 },
    effects: { truthDelta: 6, ipDelta: { self: 1 } }
  },
  {
    id: "TRUTH-010",
    faction: "truth",
    name: "Tabloid Thunder Special Edition",
    type: "MEDIA",
    rarity: "rare",
    cost: 13,
    text: "+8% Truth. Opponent discards 1 card.",
    flavorTruth: "Ink smudges reveal more than black bars.",
    flavorGov: "Ink smudges reveal more than black bars.",
    target: { scope: "global", count: 0 },
    effects: { truthDelta: 8, discardOpponent: 1 }
  },
  {
    id: "TRUTH-011",
    faction: "truth",
    name: "Mothership Livestream Crashes App",
    type: "MEDIA",
    rarity: "rare",
    cost: 14,
    text: "+9% Truth.",
    flavorTruth: "Chat: 'first!'",
    flavorGov: "Chat: 'first!'",
    target: { scope: "global", count: 0 },
    effects: { truthDelta: 9 }
  },
  {
    id: "TRUTH-012",
    faction: "truth",
    name: "Florida Man Joins the Resistance",
    type: "MEDIA",
    rarity: "common",
    cost: 6,
    text: "+5% Truth. Gain +1 IP if Truth ≥ 50%.",
    flavorTruth: "He brought snacks. Questionable snacks.",
    flavorGov: "He brought snacks. Questionable snacks.",
    target: { scope: "global", count: 0 },
    effects: { 
      truthDelta: 5,
      conditional: {
        ifTruthAtLeast: 50,
        then: { ipDelta: { self: 1 } }
      }
    }
  },
  {
    id: "TRUTH-013",
    faction: "truth",
    name: "Elvis Busks in Area 51 Parking Lot",
    type: "MEDIA",
    rarity: "uncommon",
    cost: 9,
    text: "+7% Truth. Opponent -1 IP.",
    flavorTruth: "Tip jar shaped like a saucer.",
    flavorGov: "Tip jar shaped like a saucer.",
    target: { scope: "global", count: 0 },
    effects: { truthDelta: 7, ipDelta: { opponent: -1 } }
  },
  {
    id: "TRUTH-014",
    faction: "truth",
    name: "Citizen Journalist Scoop",
    type: "MEDIA",
    rarity: "common",
    cost: 5,
    text: "+4% Truth. Draw 1 card.",
    flavorTruth: "Phones are better than binoculars.",
    flavorGov: "Phones are better than binoculars.",
    target: { scope: "global", count: 0 },
    effects: { truthDelta: 4, draw: 1 }
  },
  {
    id: "TRUTH-015",
    faction: "truth",
    name: "Crop Circle Art Festival",
    type: "MEDIA",
    rarity: "uncommon",
    cost: 8,
    text: "+6% Truth.",
    flavorTruth: "BYO tractor.",
    flavorGov: "BYO tractor.",
    target: { scope: "global", count: 0 },
    effects: { truthDelta: 6 }
  },
  {
    id: "TRUTH-016",
    faction: "truth",
    name: "Tabloid Whistleblower",
    type: "MEDIA",
    rarity: "rare",
    cost: 12,
    text: "+8% Truth. Draw 1 card.",
    flavorTruth: "The squeak heard round the world.",
    flavorGov: "The squeak heard round the world.",
    target: { scope: "global", count: 0 },
    effects: { truthDelta: 8, draw: 1 }
  },
  {
    id: "TRUTH-017",
    faction: "truth",
    name: "Bat Boy Meets Bigfoot",
    type: "MEDIA",
    rarity: "rare",
    cost: 14,
    text: "+9% Truth. If you control 1+ zones, draw 1.",
    flavorTruth: "Historic handshake, very furry.",
    flavorGov: "Historic handshake, very furry.",
    target: { scope: "global", count: 0 },
    effects: { 
      truthDelta: 9,
      conditional: {
        ifZonesControlledAtLeast: 1,
        then: { draw: 1 }
      }
    }
  },
  {
    id: "TRUTH-018",
    faction: "truth",
    name: "Elvis the UFO Pilot",
    type: "MEDIA",
    rarity: "rare",
    cost: 15,
    text: "+10% Truth.",
    flavorTruth: "Thank you, interstellar much.",
    flavorGov: "Thank you, interstellar much.",
    target: { scope: "global", count: 0 },
    effects: { truthDelta: 10 }
  },
  {
    id: "TRUTH-019",
    faction: "truth",
    name: "Haunted Walmart",
    type: "ZONE",
    rarity: "uncommon",
    cost: 12,
    text: "+2 Zone Defense. Gain 1 IP when played.",
    flavorTruth: "Rollback prices on cursed dolls.",
    flavorGov: "Rollback prices on cursed dolls.",
    target: { scope: "state", count: 1 },
    effects: { zoneDefense: 2, ipDelta: { self: 1 } }
  },
  {
    id: "TRUTH-020",
    faction: "truth",
    name: "Cornfield Abduction Site",
    type: "ZONE",
    rarity: "rare",
    cost: 18,
    text: "+4 Zone Defense.",
    flavorTruth: "Free tractor rides included.",
    flavorGov: "Free tractor rides included.",
    target: { scope: "state", count: 1 },
    effects: { zoneDefense: 4 }
  },
  {
    id: "TRUTH-021",
    faction: "truth",
    name: "Bigfoot Campground",
    type: "ZONE",
    rarity: "rare",
    cost: 17,
    text: "+3 Zone Defense. +6% Truth when played.",
    flavorTruth: "Please don't feed the senator.",
    flavorGov: "Please don't feed the senator.",
    target: { scope: "state", count: 1 },
    effects: { zoneDefense: 3, truthDelta: 6 }
  },
  {
    id: "TRUTH-022",
    faction: "truth",
    name: "Elvis Shrine in Vegas",
    type: "ZONE",
    rarity: "uncommon",
    cost: 13,
    text: "+2 Zone Defense. Gain 2 IP when played.",
    flavorTruth: "Burning love, steady income.",
    flavorGov: "Burning love, steady income.",
    target: { scope: "state", count: 1 },
    effects: { zoneDefense: 2, ipDelta: { self: 2 } }
  },
  {
    id: "TRUTH-023",
    faction: "truth",
    name: "Grandma's Haunted Basement",
    type: "ZONE",
    rarity: "uncommon",
    cost: 12,
    text: "+2 Zone Defense. +4% Truth when played.",
    flavorTruth: "Knitting needles levitate on Tuesdays.",
    flavorGov: "Knitting needles levitate on Tuesdays.",
    target: { scope: "state", count: 1 },
    effects: { zoneDefense: 2, truthDelta: 4 }
  },
  {
    id: "TRUTH-024",
    faction: "truth",
    name: "Tabloid Printing Warehouse",
    type: "ZONE",
    rarity: "uncommon",
    cost: 14,
    text: "+3 Zone Defense.",
    flavorTruth: "Ink stains reveal hidden messages.",
    flavorGov: "Ink stains reveal hidden messages.",
    target: { scope: "state", count: 1 },
    effects: { zoneDefense: 3 }
  },
  {
    id: "TRUTH-025",
    faction: "truth",
    name: "Ghost Hunter Motel",
    type: "ZONE",
    rarity: "uncommon",
    cost: 12,
    text: "+2 Zone Defense. Draw 1 when played.",
    flavorTruth: "Room service knocks itself.",
    flavorGov: "Room service knocks itself.",
    target: { scope: "state", count: 1 },
    effects: { zoneDefense: 2, draw: 1 }
  }
];