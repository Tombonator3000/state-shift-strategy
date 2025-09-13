import type { GameCard } from '../types/cardTypes';
import { normalizeEffects } from './normalizeEffects';

export interface CoreData {
  cards: GameCard[];
  deck: string[];
}

export async function loadCoreFromJson(url: string, integrity?: string): Promise<CoreData> {
  const res = await fetch(url, integrity ? { integrity } : undefined);
  if (!res.ok) throw new Error(`Failed to load core json: ${res.status}`);
  const data = await res.json();
  const cards = (data.cards as any[]).map(c => ({ ...c, effects: normalizeEffects(c.effects) }));
  const deck = Array.isArray(data.deck) ? data.deck.slice() : [];
  return { cards, deck };
}
