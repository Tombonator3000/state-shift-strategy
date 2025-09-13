import { applyEffects } from './effects';

export function playCard(gs: any, who: 'player' | 'ai', card: any, target: any) {
  if (gs[who].ip < card.cost) {
    return { ok: false, reason: 'Not enough IP' };
  }
  gs[who].ip -= card.cost;
  gs.discards[who].push(card);

  applyEffects(gs, card.effects, { gs, who, target });

  return { ok: true };
}

export default playCard;
