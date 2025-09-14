import { SideAbs, SideAny } from './types';

export function resolveWho(who: SideAny, ctxWho: SideAbs): SideAbs {
  if (who === 'player' || who === 'ai') return who;
  if (who === 'self') return ctxWho;
  return ctxWho === 'player' ? 'ai' : 'player';
}
