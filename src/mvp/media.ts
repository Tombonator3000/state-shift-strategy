import type { Faction } from '@/rules/mvp';
import type { Card, EffectsMEDIA, PlayerState } from './validator';

export interface MediaResolutionOptions {
  overrideSign?: 1 | -1;
}

export interface MediaActor {
  faction: Faction;
  isAI?: boolean;
}

type MediaCardLike = Pick<Card, 'id' | 'type' | 'effects'>;

const getMediaEffects = (card?: MediaCardLike | null): EffectsMEDIA | undefined => {
  if (!card || card.type !== 'MEDIA') return undefined;
  return card.effects as EffectsMEDIA | undefined;
};

export function computeMediaTruthDelta_MVP(
  acting: MediaActor | Pick<PlayerState, 'faction'>,
  card: MediaCardLike | null | undefined,
  opts: MediaResolutionOptions = {},
): number {
  const effects = getMediaEffects(card);
  const base = Math.abs(effects?.truthDelta ?? 0);
  if (!base) return 0;

  if (opts.overrideSign === 1 || opts.overrideSign === -1) {
    return opts.overrideSign * base;
  }

  const sign = acting.faction === 'truth' ? 1 : -1;
  return sign * base;
}

let _mvpWarned = false;

export function warnIfMediaScaling(card: MediaCardLike | null | undefined, delta: number): void {
  if (!card) return;
  const effects = getMediaEffects(card);
  const magnitude = Math.abs(effects?.truthDelta ?? 0);
  if (!_mvpWarned && magnitude > 0 && Math.abs(delta) > magnitude) {
    console.warn(
      `[MVP] MEDIA scaling detected on ${card.id}. Expected ±${magnitude}, got ${delta}. Stripping multipliers.`,
    );
    _mvpWarned = true;
  }
}
