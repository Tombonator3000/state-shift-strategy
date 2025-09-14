import type { SideAbs, SideAny } from './types';

export function resolveWho(who: SideAny, actor: SideAbs): SideAbs {
  if (who === 'player' || who === 'ai') return who; // absolute (back-compat)
  return who === 'self' ? actor : (actor === 'player' ? 'ai' : 'player');
}
