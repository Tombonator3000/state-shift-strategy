// Example batch file for government cards
// This demonstrates the structure the core collector expects

import type { GameCard } from '../../types/cardTypes';

export const CORE_BATCH_GOV_1: GameCard[] = [
  {
    id: "gov-batch-101",
    faction: "government",
    name: "Strategic Disinformation",
    type: "MEDIA",
    rarity: "common",
    cost: 4,
    text: "-3% Truth. If Truth <= 30%, draw 1 card.",
    flavorTruth: "The lies spread like wildfire.",
    flavorGov: "Narrative control established.",
    target: { scope: "global", count: 0 },
    effects: { 
      truthDelta: -3,
      conditional: {
        ifTruthAtLeast: 30,
        else: { draw: 1 }
      }
    }
  },
  {
    id: "gov-batch-102",
    faction: "government",
    name: "Black Budget Operations",
    type: "DEFENSIVE",
    rarity: "uncommon", 
    cost: 5,
    text: "Gain +2 IP. If controlling 3+ states, gain +1 additional IP.",
    flavorTruth: "Money flows in dark channels.",
    flavorGov: "Funding secured through unofficial channels.",
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

export const CORE_BATCH_GOV_2: GameCard[] = [
  {
    id: "gov-batch-201", 
    faction: "government",
    name: "Coordinated Suppression",
    type: "ATTACK",
    rarity: "rare",
    cost: 8,
    text: "-4% Truth. Target a state; reduce its Defense by 3. Opponent discards 1 card.",
    flavorTruth: "Silence enforced through overwhelming force.",
    flavorGov: "Information containment protocol activated.",
    target: { scope: "state", count: 1 },
    effects: { truthDelta: -4, zoneDefense: -3, discardOpponent: 1 }
  }
];