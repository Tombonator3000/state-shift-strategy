import type { GameCard } from '@/rules/mvp';
export const requiresStateTarget = (card: Pick<GameCard, 'type' | 'effects' | 'target'>) =>
  card.type === 'ZONE' || (card.type === 'HYBRID' && typeof card.effects?.pressureDelta === 'number' && card.effects.pressureDelta !== 0);
export function findStateTarget<T extends { id: string; name: string; abbreviation: string; owner: string }>(states: T[], value?: string | null): T | null {
  const key = value?.trim().toLowerCase();
  return key ? states.find(state => [state.id, state.name, state.abbreviation].some(id => id.toLowerCase() === key)) ?? null : null;
}
export function validStateTarget<T extends { id: string; name: string; abbreviation: string; owner: string }>(states: T[], value?: string | null, actor: 'human' | 'ai' = 'human') {
  const target = findStateTarget(states, value);
  return target && target.owner !== (actor === 'human' ? 'player' : 'ai') ? target : null;
}
