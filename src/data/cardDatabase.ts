import type { Card } from "@/types/public";
import type { GameCard } from "@/types/cardTypes";
import { ALL_CARDS, SHOWCASE_DECK, getInitialDeck } from "@/data/CARD_DATABASE";

function toGameCard(card: Card): GameCard {
  return {
    ...card,
    text: card.flavor ?? "Showcase card",
    flavorTruth: card.flavor ?? "Showcase card",
    flavorGov: card.flavor ?? "Showcase card"
  };
}

export const CARD_DATABASE: GameCard[] = ALL_CARDS.map(toGameCard);

export function getRandomCards(count: number, options?: { faction?: "truth" | "government" }): GameCard[] {
  const pool = SHOWCASE_DECK.filter(card => {
    if (!options?.faction) return true;
    return card.faction === options.faction;
  });

  return pool.slice(0, count).map(toGameCard);
}

export function generateRandomDeck(size: number = 40, faction?: "truth" | "government"): GameCard[] {
  const deckSource = faction ? SHOWCASE_DECK.filter(card => card.faction === faction) : SHOWCASE_DECK;
  const slice = deckSource.length >= size ? deckSource.slice(0, size) : [...deckSource];

  while (slice.length < size && deckSource.length > 0) {
    slice.push(deckSource[slice.length % deckSource.length]);
  }

  return slice.slice(0, size).map(toGameCard);
}

export function getShowcaseDeck(): GameCard[] {
  return getInitialDeck().map(toGameCard);
}
