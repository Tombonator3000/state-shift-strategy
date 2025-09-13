import coreData from '../data/core.json';
import type { GameCard } from '../types/cardTypes';
import { normalizeEffects } from './normalizeEffects';

export interface CoreData {
  cards: GameCard[];
  deck: string[];
}

export async function loadCoreBundled(): Promise<CoreData> {
  const data = coreData as any;
  const cards = (data.cards as any[]).map(c => ({ ...c, effects: normalizeEffects(c.effects) }));
  const deck = Array.isArray(data.deck) ? data.deck.slice() : [];
  return { cards, deck };
}

export default loadCoreBundled;
