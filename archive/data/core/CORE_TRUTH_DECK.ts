import type { Card } from "../../types/mvpCard";

export const CORE_TRUTH_DECK: Card[] = [
  {
    id: "truth-1",
    name: "Leaked Documents",
    faction: "truth",
    type: "MEDIA",
    rarity: "legendary",
    cost: 6,
    effects: {
      truthDelta: 4
    },
    flavor: "The people have a right to know.",
  },
  {
    id: "truth-2",
    name: "Investigative Report",
    faction: "truth",
    type: "MEDIA",
    rarity: "legendary",
    cost: 6,
    effects: {
      truthDelta: 4
    },
    flavor: "Facts speak louder than fiction.",
  }
];
