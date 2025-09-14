import { resolveWho } from './helpers';
import { drawCards, discardRandom, discardChoice, addCardToHand } from './runtime';
import { Effect, SideAbs, SideAny } from './types';

export async function applyEffects(gs: any, effects: any[], ctx: { who: SideAbs; target?: any; ui?: any }) {
  if (!effects) return;
  const effList = typeof effects === 'function' ? effects(ctx) : effects;
  for (const eff of effList ?? []) {
    switch (eff.k) {
      case 'truth': {
        gs.truth = Math.max(0, Math.min(100, (gs.truth ?? 0) + eff.v));
        break;
      }
      case 'ip': {
        const w = resolveWho(eff.who, ctx.who);
        gs[w].ip = Math.max(0, (gs[w].ip ?? 0) + eff.v);
        break;
      }
      case 'draw': {
        const w = resolveWho(eff.who, ctx.who);
        drawCards(gs, w, eff.n);
        break;
      }
      case 'discardRandom': {
        const w = resolveWho(eff.who, ctx.who);
        discardRandom(gs, w, eff.n);
        break;
      }
      case 'discardChoice': {
        const w = resolveWho(eff.who, ctx.who);
        await discardChoice(gs, w, eff.n, ctx);
        break;
      }
      case 'pressure': {
        const w = resolveWho(eff.who as SideAny, ctx.who);
        if (!gs.pressure[eff.state]) gs.pressure[eff.state] = { player: 0, ai: 0 };
        gs.pressure[eff.state][w] = (gs.pressure[eff.state][w] || 0) + eff.v;
        break;
      }
      case 'defense': {
        gs.states[eff.state].defense = Math.max(1, gs.states[eff.state].defense + eff.v);
        break;
      }
      case 'addCard': {
        const w = resolveWho(eff.who as SideAny, ctx.who);
        addCardToHand(gs, w, eff.cardId);
        break;
      }
      case 'flag': {
        gs.flags = gs.flags || {};
        gs.flags[eff.name] = eff.on ?? true;
        break;
      }
      case 'conditional': {
        if (eff.if(gs, ctx?.target)) await applyEffects(gs, eff.then, ctx);
        else if (eff.else) await applyEffects(gs, eff.else, ctx);
        break;
      }
      case 'special': {
        eff.fn(gs, ctx?.target);
        break;
      }
      default:
        console.warn('Unknown effect', eff);
    }
  }
}
