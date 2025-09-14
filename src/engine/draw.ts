import { normalizeCard } from './normalizeEffects';

export function safePushToHand(gs: any, who: 'player' | 'ai', rawCard: any) {
  const card = normalizeCard(rawCard);
  if (gs.hands[who].length < 7) gs.hands[who].push(card);
  else gs.discards[who].push(card);
}

