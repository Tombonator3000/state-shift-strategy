declare const window: any;

export type TruthActorId = 'human' | 'ai' | 'player' | 'P1' | 'P2';

export interface TruthMutable {
  truth: number;
  log: string[];
}

export function clampTruth(x: number): number {
  return Math.max(0, Math.min(100, Math.round(x)));
}

export function applyTruthDelta<T extends TruthMutable>(
  gs: T,
  delta: number,
  _who: TruthActorId,
): T {
  if (!Number.isFinite(delta)) {
    return gs;
  }

  if (delta === 0) {
    gs.truth = clampTruth(gs.truth);
    return gs;
  }

  const before = gs.truth;
  const after = clampTruth(before + delta);
  gs.truth = after;
  const change = after - before;
  if (change !== 0 && typeof window !== 'undefined' && (window as any).uiToastTruth) {
    (window as any).uiToastTruth(change);
  }
  const arrow = delta >= 0 ? '↑' : '↓';
  gs.log.push(`Truth manipulation ${arrow} (${before}% → ${after}%)`);
  return gs;
}
