import type { Card } from "../../types/mvpCard";

export const CORE_GOV_DECK: Card[] = [
  {
    id: "gov-1",
    name: "Propaganda Broadcast",
    faction: "government",
    type: "MEDIA",
    rarity: "common",
    cost: 3,
    effects: {
      truthDelta: 1
    },
    flavor: "They twist the truth again.",
  },
  {
    id: "gov-2",
    name: "Security Crackdown",
    faction: "government",
    type: "ATTACK",
    rarity: "common",
    cost: 2,
    effects: {
      ipDelta: { opponent: 1 }
    },
    flavor: "A dark day for free speech.",
  }
];
