import type { Card, Deck } from "@/types/public";

export const ALL_CARDS: Card[] = [];

export const SHOWCASE_DECK: Deck = Array.from({ length: 12 }, (_, i) => ({
  id: `DEMO-${i + 1}`,
  name: i % 2 ? "Press Briefing" : "Witness Hotline",
  faction: i % 2 ? "government" : "truth",
  type: (["MEDIA", "ATTACK", "ZONE"] as const)[i % 3],
  rarity: (["common", "uncommon", "rare", "legendary"] as const)[i % 4],
  cost: (i % 4) + 2,
  flavor: "Showcase card (UI-only).",
  set: "core"
}));

export function getInitialDeck(): Deck {
  return SHOWCASE_DECK;
}
