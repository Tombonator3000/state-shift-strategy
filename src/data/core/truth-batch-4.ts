// Truth Batch 4 - v2.1E Compliant Cards
// TRUTH-076 to TRUTH-077 (final cards)

import type { GameCard } from '../../types/cardTypes';

export const CORE_BATCH_TRUTH_4: GameCard[] = [
  {
    id: "TRUTH-076",
    faction: "truth",
    name: "Florida Roadside Attraction",
    type: "ZONE",
    rarity: "uncommon",
    cost: 13,
    text: "+2 Zone Defense. Gain 2 IP when played.",
    flavorTruth: "Gator wrestling, Elvis impersonator optional.",
    flavorGov: "Gator wrestling, Elvis impersonator optional.",
    target: { scope: "state", count: 1 },
    effects: { zoneDefense: 2, ipDelta: { self: 2 } }
  },
  {
    id: "TRUTH-077",
    faction: "truth",
    name: "Ghost Town Saloon",
    type: "ZONE",
    rarity: "uncommon",
    cost: 12,
    text: "+2 Zone Defense. Draw 1 when played.",
    flavorTruth: "Bartender vanished in 1893, still pouring.",
    flavorGov: "Bartender vanished in 1893, still pouring.",
    target: { scope: "state", count: 1 },
    effects: { zoneDefense: 2, draw: 1 }
  }
];