import { applyEffects } from './effects';
import { normalizeCard } from './normalizeEffects';

export function playCard(gs: any, who: 'player' | 'ai', rawCard: any, target: any) {
  if (gs[who].ip < rawCard.cost) {
    return { ok: false, reason: 'Not enough IP' };
  }
  gs[who].ip -= rawCard.cost;

  const card = normalizeCard(rawCard);
  gs.discards[who].push(card);
  applyEffects(gs, card.effects, { who, target });
  return { ok: true };
}

export default playCard;
