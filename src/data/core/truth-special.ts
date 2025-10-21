import type { GameCard } from '@/rules/mvp';

/**
 * Truth Faction Special Cards - Phase 2
 * Cards with unique mechanics and conditional effects
 */

export const truthSpecialCards: GameCard[] = [
  {
    id: "TRUTH-SPECIAL-001",
    name: "Anonymous Parking Garage Tip-Off",
    faction: "truth",
    type: "MEDIA",
    rarity: "rare",
    cost: 4,
    effects: {
      ifMoreStates: {
        threshold: 5,
        then: { truthDelta: 4 },
        else: { truthDelta: 2 }
      }
    },
    flavor: "Meet me where the pigeons gather. Bring photocopies."
  },
  {
    id: "TRUTH-SPECIAL-002",
    name: "Bigfoot Voter Registration Drive",
    faction: "truth",
    type: "ZONE",
    rarity: "uncommon",
    cost: 3,
    effects: {
      ifFewerStates: {
        threshold: 0, // if you control fewer states than opponent
        then: { pressureDelta: 4 },
        else: { pressureDelta: 2 }
      }
    },
    flavor: "Finally, representation for the cryptid-American community."
  },
  {
    id: "TRUTH-SPECIAL-003",
    name: "Exposure Chain",
    faction: "truth",
    type: "MEDIA",
    rarity: "rare",
    cost: 5,
    effects: {
      truthDelta: 3,
      ifTruthAbove: {
        threshold: 60,
        then: { draw: 1 }
      }
    },
    flavor: "Truth begets more truth."
  },
  {
    id: "TRUTH-SPECIAL-004",
    name: "Neighborhood Watch (For UFOs)",
    faction: "truth",
    type: "ZONE",
    rarity: "uncommon",
    cost: 4,
    effects: {
      pressureToAllContested: 1
    },
    flavor: "Carol saw three last week. Carl saw four. Nobody called."
  },
  {
    id: "TRUTH-SPECIAL-005",
    name: "Viral Evidence",
    faction: "truth",
    type: "MEDIA",
    rarity: "common",
    cost: 3,
    effects: {
      truthPerControlledState: { max: 5 }
    },
    flavor: "Every territory amplifies the signal."
  },
  {
    id: "TRUTH-SPECIAL-006",
    name: "Tinfoil Hat Supply Co-Op",
    faction: "truth",
    type: "ZONE",
    rarity: "common",
    cost: 4,
    effects: {
      pressureDelta: 2,
      ifFewerStates: {
        threshold: 0,
        then: { truthDelta: 1 }
      }
    },
    flavor: "Bulk discounts for prepper communes. Rolled or crumpled available."
  },
  {
    id: "TRUTH-SPECIAL-007",
    name: "Critical Mass Event",
    faction: "truth",
    type: "MEDIA",
    rarity: "rare",
    cost: 6,
    effects: {
      ifTruthAbove: {
        threshold: 70,
        then: { truthDelta: 5, draw: 1 },
        else: { truthDelta: 3 }
      }
    },
    flavor: "When the dam breaks, the flood follows."
  },
  {
    id: "TRUTH-SPECIAL-008",
    name: "Coordinated Disclosure",
    faction: "truth",
    type: "ZONE",
    rarity: "uncommon",
    cost: 5,
    effects: {
      pressureDelta: 2,
      pressurePerControlledState: { max: 3 }
    },
    flavor: "Every controlled state becomes a broadcast tower."
  },
  {
    id: "TRUTH-SPECIAL-009",
    name: "Underground Railroad",
    faction: "truth",
    type: "ZONE",
    rarity: "rare",
    cost: 5,
    effects: {
      pressureDelta: 3,
      ifFewerStates: {
        threshold: 0,
        then: { defenseToAllStates: 1 }
      }
    },
    flavor: "The resistance protects its safe houses."
  },
  {
    id: "TRUTH-SPECIAL-010",
    name: "Truth Cascade",
    faction: "truth",
    type: "MEDIA",
    rarity: "legendary",
    cost: 6,
    effects: {
      truthDelta: 2,
      truthPerControlledState: { max: 8 }
    },
    flavor: "Each liberated state becomes a beacon of truth."
  }
];

export default truthSpecialCards;
