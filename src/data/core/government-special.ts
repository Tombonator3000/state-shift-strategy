import type { GameCard } from '@/rules/mvp';

/**
 * Government Faction Special Cards - Phase 2
 * Cards with unique mechanics and conditional effects
 */

export const governmentSpecialCards: GameCard[] = [
  {
    id: "GOV-SPECIAL-001",
    name: "Deputy Walsh's Calm Clarifier",
    faction: "government",
    type: "MEDIA",
    rarity: "rare",
    cost: 4,
    effects: {
      ifTruthAbove: {
        threshold: 70,
        then: { truthDelta: -4 },
        else: { truthDelta: -2 }
      }
    },
    flavor: "Memo 47-B: \"All anomalies downgraded to clerical typos.\""
  },
  {
    id: "GOV-SPECIAL-002",
    name: "General Thompson's Territory Audit",
    faction: "government",
    type: "ATTACK",
    rarity: "rare",
    cost: 5,
    effects: {
      ifMoreStates: {
        threshold: 5,
        then: { ipDelta: { opponent: -6 } },
        else: { ipDelta: { opponent: -3 } }
      }
    },
    flavor: "He circles rebellious counties in patriotic highlighter No. 5."
  },
  {
    id: "GOV-SPECIAL-003",
    name: "Agent Smitherson's Press Harmonizer",
    faction: "government",
    type: "MEDIA",
    rarity: "uncommon",
    cost: 4,
    effects: {
      truthDelta: -3,
      ifTruthBelow: {
        threshold: 40,
        then: { discardOpponent: 1 }
      }
    },
    flavor: "\"Suggested talking points\" arrive with pre-checked consent boxes."
  },
  {
    id: "GOV-SPECIAL-004",
    name: "Lizard Liaison's Quiet Grid",
    faction: "government",
    type: "ZONE",
    rarity: "uncommon",
    cost: 4,
    effects: {
      pressureDelta: 1,
      defenseToAllStates: 1
    },
    flavor: "Stamped \"routine lighting upgrade\"; tail-signed in green ink."
  },
  {
    id: "GOV-SPECIAL-005",
    name: "Intern Vega's Lost Forms",
    faction: "government",
    type: "ATTACK",
    rarity: "common",
    cost: 3,
    effects: {
      preventHighCostCards: { threshold: 5, duration: 1 }
    },
    flavor: "Any request over five credits vanishes into Vault 404-B."
  },
  {
    id: "GOV-SPECIAL-006",
    name: "Czar Pierce's Favor Ledger",
    faction: "government",
    type: "ATTACK",
    rarity: "uncommon",
    cost: 3,
    effects: {
      ifMoreStates: {
        threshold: 3,
        then: { ipDelta: { opponent: -4 } },
        else: { ipDelta: { opponent: -2 } }
      }
    },
    flavor: "Column A lists senators; Column B lists photos nobody saw."
  },
  {
    id: "GOV-SPECIAL-007",
    name: "Night Division's Media Nightfall",
    faction: "government",
    type: "MEDIA",
    rarity: "rare",
    cost: 6,
    effects: {
      ifTruthAbove: {
        threshold: 60,
        then: { truthDelta: -5, ipDelta: { self: 2 } },
        else: { truthDelta: -3 }
      }
    },
    flavor: "Timer set to 02:17; every anchor gets decaf and a blindfold."
  },
  {
    id: "GOV-SPECIAL-008",
    name: "Denver Bunker Hospitality Suite",
    faction: "government",
    type: "ZONE",
    rarity: "uncommon",
    cost: 5,
    effects: {
      pressureDelta: 2,
      defenseToAllStates: 1
    },
    flavor: "\"Guest amenities\" include leaded tap water and zero windows."
  },
  {
    id: "GOV-SPECIAL-009",
    name: "Operation Gentle Avalanche",
    faction: "government",
    type: "ATTACK",
    rarity: "rare",
    cost: 5,
    effects: {
      ipDelta: { opponent: -3 },
      ifMoreStates: {
        threshold: 0, // if you control more states than opponent
        then: { ipDelta: { opponent: -2 } }
      }
    },
    flavor: "Volunteers initial the tank treads before rolling out."
  },
  {
    id: "GOV-SPECIAL-010",
    name: "Panopticon Budget Justification",
    faction: "government",
    type: "MEDIA",
    rarity: "legendary",
    cost: 6,
    effects: {
      truthDelta: -2,
      truthPerControlledState: { max: -8 }
    },
    flavor: "Line item 77B: \"civic wellness sensors\" wired into every lamppost."
  }
];

export default governmentSpecialCards;
