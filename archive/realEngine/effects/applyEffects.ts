import type { Effect, SideAbs } from './types';
import { resolveWho } from './helpers';
import { drawCards, discardRandom, discardChoice } from './runtime';
import { normalizeCard } from '../normalizeEffects';

export async function applyEffects(gs:any, effects:Effect[] = [], ctx:{ who: SideAbs; target?:any; ui?:any }) {
  for (const eff of effects) {
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
        const w = resolveWho(eff.who, ctx.who);
        gs.pressure[eff.state][w] = (gs.pressure[eff.state][w] ?? 0) + eff.v;
        break;
      }
      case 'defense': {
        gs.states[eff.state].defense = Math.max(1, (gs.states[eff.state].defense ?? 1) + eff.v);
        break;
      }
      case 'addCard': {
        const w = resolveWho(eff.who, ctx.who);
        const card = normalizeCard(gs.cardLibrary?.[eff.cardId]);
        if (card) {
          if (gs.hands[w].length < 7) gs.hands[w].push(card);
          else gs.discards[w].push(card);
        }
        break;
      }
      case 'flag': {
        gs.flags[eff.name] = eff.on ?? true;
        break;
      }
      case 'conditional': {
        const ok = eff.if(gs, ctx.target);
        await applyEffects(gs, ok ? eff.then : (eff.else ?? []), ctx);
        break;
      }
      case 'special': {
        eff.fn(gs, ctx.target);
        break;
      }
      default:
        console.warn('Unknown effect', eff);
    }
  }
}
