import { applyEffects } from './effects/applyEffects';
import { normalizeCard } from './normalizeEffects';
import type { SideAbs } from './effects/types';

export async function playCard(gs:any, actor: SideAbs, rawCard:any, target:any, ui?:any) {
  if (gs[actor].ip < rawCard.cost) return { ok:false, reason:'Not enough IP' };
  gs[actor].ip -= rawCard.cost;

  // Remove card from hand
  const handIndex = gs.hands[actor].findIndex((c: any) => c.id === rawCard.id);
  if (handIndex >= 0) {
    gs.hands[actor].splice(handIndex, 1);
  }

  const card = normalizeCard(rawCard);
  gs.discards[actor].push(card); // unless persistent by rule
  await applyEffects(gs, card.effects, { who: actor, target, ui });
  return { ok:true };
}
