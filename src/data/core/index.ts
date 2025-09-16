// AUTO-GENERATED (MVP rewrite) - temporary bootstrapped version
// This will be replaced by the migration script

import type { MVPCard } from '@/types/mvp-types';

// Bootstrap minimal cards to get the system working
export const CARD_DATABASE_CORE: MVPCard[] = [
  {
    id: "truth-bootstrap-1",
    name: "Bootstrap Truth Attack",
    faction: "truth",
    type: "ATTACK", 
    rarity: "common",
    cost: 2,
    text: "Bootstrap attack card",
    flavorTruth: "Truth flavor",
    flavorGov: "Government flavor",
    effects: { ipDelta: { opponent: 1 } }
  },
  {
    id: "truth-bootstrap-2", 
    name: "Bootstrap Truth Media",
    faction: "truth",
    type: "MEDIA",
    rarity: "common", 
    cost: 3,
    text: "Bootstrap media card",
    flavorTruth: "Truth flavor",
    flavorGov: "Government flavor", 
    effects: { truthDelta: 1 }
  },
  {
    id: "truth-bootstrap-3",
    name: "Bootstrap Truth Zone",
    faction: "truth",
    type: "ZONE",
    rarity: "common",
    cost: 4, 
    text: "Bootstrap zone card",
    flavorTruth: "Truth flavor",
    flavorGov: "Government flavor",
    effects: { pressureDelta: 1 }
  },
  {
    id: "government-bootstrap-1",
    name: "Bootstrap Government Attack", 
    faction: "government",
    type: "ATTACK",
    rarity: "common",
    cost: 2,
    text: "Bootstrap attack card", 
    flavorTruth: "Truth flavor",
    flavorGov: "Government flavor",
    effects: { ipDelta: { opponent: 1 } }
  },
  {
    id: "government-bootstrap-2",
    name: "Bootstrap Government Media",
    faction: "government", 
    type: "MEDIA",
    rarity: "common",
    cost: 3,
    text: "Bootstrap media card",
    flavorTruth: "Truth flavor", 
    flavorGov: "Government flavor",
    effects: { truthDelta: -1 }
  },
  {
    id: "government-bootstrap-3", 
    name: "Bootstrap Government Zone",
    faction: "government",
    type: "ZONE",
    rarity: "common", 
    cost: 4,
    text: "Bootstrap zone card",
    flavorTruth: "Truth flavor",
    flavorGov: "Government flavor",
    effects: { pressureDelta: 1 }
  }
] as const;

export type { MVPCard as CoreCard } from "@/types/mvp-types";