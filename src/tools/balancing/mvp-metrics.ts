import type { GameCard } from '@/rules/mvp';
import {
  classifyMvpCost,
  computeMvpEffectScore,
  getExpectedMvpCost,
  getMvpEffectSummary,
} from '@/data/mvpAnalysisUtils';

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

    const expectedCost = getExpectedMvpCost(card);
    const { status } = classifyMvpCost(card, expectedCost);
    if (status === 'On Curve') {
      res.costConformity.ok++;
    }

    const summary = getMvpEffectSummary(card);
    weightSum += computeMvpEffectScore(summary);

    if (card.type === 'MEDIA') {
      const delta = summary.truthDelta | 0;
      res.hist.truthDelta[delta] = (res.hist.truthDelta[delta] ?? 0) + 1;
    } else if (card.type === 'ATTACK') {
      const ip = summary.ipDeltaOpponent | 0;
      res.hist.attackIp[ip] = (res.hist.attackIp[ip] ?? 0) + 1;
    } else if (card.type === 'ZONE') {
      const pressure = summary.pressureDelta | 0;
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
