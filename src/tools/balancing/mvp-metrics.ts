import type { GameCard } from '@/rules/mvp';

export type MvpMetrics = {
  counts: {
    total: number;
    core: number;
    exp: number;
    truth: number;
    government: number;
  };
  costConformity: { ok: number; total: number; pct: number };
  avgMvpWeight: number;
  hist: {
    truthDelta: Record<number, number>;
    attackIp: Record<number, number>;
    pressure: Record<number, number>;
  };
};

export function computeMvpMetrics(cards: GameCard[], coreCount: number): MvpMetrics {
  const res: MvpMetrics = {
    counts: {
      total: cards.length,
      core: coreCount,
      exp: cards.length - coreCount,
      truth: 0,
      government: 0,
    },
    costConformity: { ok: 0, total: cards.length, pct: 0 },
    avgMvpWeight: 0,
    hist: { truthDelta: {}, attackIp: {}, pressure: {} },
  };

  let weightSum = 0;
  for (const card of cards) {
    if (card.faction === 'truth') res.counts.truth++;
    if (card.faction === 'government') res.counts.government++;

    res.costConformity.ok++;

    if (card.type === 'MEDIA') {
      const delta = (card.effects as any).truthDelta | 0;
      weightSum += Math.abs(delta);
      res.hist.truthDelta[delta] = (res.hist.truthDelta[delta] ?? 0) + 1;
    } else if (card.type === 'ATTACK') {
      const ip = (card.effects as any).ipDelta?.opponent | 0;
      weightSum += ip;
      res.hist.attackIp[ip] = (res.hist.attackIp[ip] ?? 0) + 1;
    } else if (card.type === 'ZONE') {
      const pressure = (card.effects as any).pressureDelta | 0;
      weightSum += pressure;
      res.hist.pressure[pressure] = (res.hist.pressure[pressure] ?? 0) + 1;
    }
  }

  res.avgMvpWeight = +(
    weightSum / Math.max(1, cards.length)
  ).toFixed(1);
  res.costConformity.pct = +(
    (100 * res.costConformity.ok) /
    Math.max(1, res.costConformity.total)
  ).toFixed(1);

  return res;
}
