// Example batch file for truth cards
// This demonstrates the structure the core collector expects

import type { GameCard } from '../../types/cardTypes';

export const CORE_BATCH_TRUTH_1: GameCard[] = [
  {
    id: "truth-batch-101",
    faction: "truth",
    name: "Emergency Broadcast",
    type: "MEDIA",
    rarity: "common",
    cost: 4,
    text: "+3% Truth. If Truth >= 70%, draw 1 card.",
    flavorTruth: "The airwaves belong to the people.",
    flavorGov: "Unauthorized transmission detected.",
    target: { scope: "global", count: 0 },
    effects: { 
      truthDelta: 3,
      conditional: {
        ifTruthAtLeast: 70,
        then: { draw: 1 }
      }
    }
  },
  {
    id: "truth-batch-102",
    faction: "truth",
    name: "Grassroots Network",
    type: "DEFENSIVE",
    rarity: "uncommon", 
    cost: 5,
    text: "Gain +2 IP. If controlling 3+ states, gain +1 additional IP.",
    flavorTruth: "The revolution starts at the roots.",
    flavorGov: "Domestic surveillance enhanced.",
    target: { scope: "global", count: 0 },
    effects: {
      ipDelta: { self: 2 },
      conditional: {
        ifZonesControlledAtLeast: 3,
        then: { ipDelta: { self: 1 } }
      }
    }
  }
];

export const CORE_BATCH_TRUTH_2: GameCard[] = [
  {
    id: "truth-batch-201", 
    faction: "truth",
    name: "Data Liberation",
    type: "ATTACK",
    rarity: "rare",
    cost: 8,
    text: "+4% Truth. Target a state; reduce its Defense by 3. Draw 1 card.",
    flavorTruth: "Information wants to be free.",
    flavorGov: "Security breach contained.",
    target: { scope: "state", count: 1 },
    effects: { truthDelta: 4, zoneDefense: -3, draw: 1 }
  }
];