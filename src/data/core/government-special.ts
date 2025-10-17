import type { GameCard } from '@/rules/mvp';

/**
 * Government Faction Special Cards - Phase 2
 * Cards with unique mechanics and conditional effects
 */

export const governmentSpecialCards: GameCard[] = [
  {
    id: "GOV-SPECIAL-001",
    name: "Damage Control Protocol",
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
    flavor: "Emergency protocols authorized."
  },
  {
    id: "GOV-SPECIAL-002",
    name: "Consolidation Sweep",
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
    flavor: "Power consolidates itself."
  },
  {
    id: "GOV-SPECIAL-003",
    name: "Narrative Control",
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
    flavor: "Control the story, control reality."
  },
  {
    id: "GOV-SPECIAL-004",
    name: "Suppression Network",
    faction: "government",
    type: "ZONE",
    rarity: "uncommon",
    cost: 4,
    effects: {
      pressureDelta: 1,
      defenseToAllStates: 1
    },
    flavor: "Every position reinforces the others."
  },
  {
    id: "GOV-SPECIAL-005",
    name: "Bureaucratic Tangle",
    faction: "government",
    type: "ATTACK",
    rarity: "common",
    cost: 3,
    effects: {
      preventHighCostCards: { threshold: 5, duration: 1 }
    },
    flavor: "Red tape stops everything."
  },
  {
    id: "GOV-SPECIAL-006",
    name: "Deep State Leverage",
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
    flavor: "The machine runs on influence."
  },
  {
    id: "GOV-SPECIAL-007",
    name: "Media Blackout",
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
    flavor: "When truth spreads too far, cut all channels."
  },
  {
    id: "GOV-SPECIAL-008",
    name: "Fortified Position",
    faction: "government",
    type: "ZONE",
    rarity: "uncommon",
    cost: 5,
    effects: {
      pressureDelta: 2,
      defenseToAllStates: 1
    },
    flavor: "Every stronghold becomes a fortress."
  },
  {
    id: "GOV-SPECIAL-009",
    name: "Overwhelming Force",
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
    flavor: "The strong devour the weak."
  },
  {
    id: "GOV-SPECIAL-010",
    name: "Total Information Awareness",
    faction: "government",
    type: "MEDIA",
    rarity: "legendary",
    cost: 6,
    effects: {
      truthDelta: -2,
      truthPerControlledState: { max: -8 }
    },
    flavor: "Every controlled state becomes a surveillance hub."
  }
];

export default governmentSpecialCards;
