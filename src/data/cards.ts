import truthCardsJson from "./cards/truth.json";
import governmentCardsJson from "./cards/government.json";
import { validateCards } from "../engine/validation";
import type { Card, Faction } from "../engine/types";

export const TRUTH_CARDS: Card[] = validateCards(truthCardsJson as Card[]);
export const GOVERNMENT_CARDS: Card[] = validateCards(governmentCardsJson as Card[]);

export const getCardPoolForFaction = (faction: Faction): Card[] => {
  return faction === "truth" ? TRUTH_CARDS : GOVERNMENT_CARDS;
};

export const buildDeck = (faction: Faction): Card[] => {
  const pool = getCardPoolForFaction(faction);
  // Duplicate the pool for a fuller deck then shuffle
  const copies = [...pool, ...pool];
  const shuffled = [...copies];
  for (let i = shuffled.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
};
