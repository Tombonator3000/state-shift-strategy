import { applyEffects } from './effects/applyEffects';
import { normalizeCard } from './normalizeEffects';
import type { SideAbs } from './effects/types';

export async function playCard(gs: any, who: SideAbs, rawCard: any, target: any, ui?: any) {
  if (gs[who].ip < rawCard.cost) {
    return { ok: false, reason: 'Not enough IP' };
  }
  gs[who].ip -= rawCard.cost;

  const card = normalizeCard(rawCard);
  gs.discards[who].push(card);
  await applyEffects(gs, card.effects, { who, target, ui });
  return { ok: true };
}

export default playCard;
