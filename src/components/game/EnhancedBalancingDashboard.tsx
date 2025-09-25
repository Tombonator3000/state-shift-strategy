import { useEffect, useMemo, useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  analyzeCardBalanceEnhanced,
  runBalanceSimulationEnhanced,
  type EnhancedCardAnalysis,
} from '@/data/enhancedCardBalancing';
import { MVP_COST_TABLE_ROWS, MVP_RULES_SECTIONS } from '@/content/mvpRules';
import { CARD_DATABASE_CORE } from '@/data/core';
import { EXPANSION_MANIFEST } from '@/data/expansions';
import {
  getEnabledExpansionIdsSnapshot,
  getExpansionCardsSnapshot,
  subscribeToExpansionChanges,
} from '@/data/expansions/state';
import { computeMvpMetrics } from '@/tools/balancing/mvp-metrics';

type HistogramBin = { label: string; count: number };

const HistogramCard = ({
  title,
  subtitle,
  bins,
  barClassName,
}: {
  title: string;
  subtitle: string;
  bins: HistogramBin[];
  barClassName: string;
}) => {
  const max = Math.max(1, ...bins.map(bin => bin.count));
  return (
    <div className="bg-gray-900/60 border border-gray-800 rounded-lg p-4 space-y-3">
      <div>
        <div className="text-xs font-semibold uppercase tracking-wide text-slate-400">{title}</div>
        <p className="text-xs text-slate-500">{subtitle}</p>
      </div>
      <div className="space-y-2">
        {bins.map(bin => {
          const width = max > 0 ? Math.round((bin.count / max) * 100) : 0;
          return (
            <div key={bin.label}>
              <div className="flex justify-between text-xs text-slate-400 mb-1">
                <span>{bin.label}</span>
                <span>{bin.count}</span>
              </div>
              <div className="h-2 bg-gray-800 rounded">
                <div
                  className={`h-full rounded ${barClassName}`}
                  style={{ width: `${width}%` }}
                />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

interface EnhancedBalancingDashboardProps {
  onClose: () => void;
  logEntries: string[];
}

const EnhancedBalancingDashboard = ({ onClose, logEntries }: EnhancedBalancingDashboardProps) => {
  const report = useMemo(() => analyzeCardBalanceEnhanced(false), []);
  const simulation = useMemo(() => runBalanceSimulationEnhanced(500, false), []);
  const [expansionState, setExpansionState] = useState(() => ({
    ids: getEnabledExpansionIdsSnapshot(),
    cards: getExpansionCardsSnapshot(),
  }));

  useEffect(() => {
    const unsubscribe = subscribeToExpansionChanges(payload => {
      setExpansionState(payload);
    });
    return unsubscribe;
  }, []);

  const effectSection = MVP_RULES_SECTIONS.find(
    section => section.title === 'Effect Whitelist (MVP)'
  );

  const cardRolesSection = MVP_RULES_SECTIONS.find(
    section => section.title === 'Card Roles'
  );

  const costOutliers = useMemo(() => {
    return report.cardAnalysis
      .filter(card => card.costStatus !== 'On Curve' && card.costDelta !== null)
      .sort((a, b) => Math.abs((b.costDelta ?? 0)) - Math.abs((a.costDelta ?? 0)))
      .slice(0, 6);
  }, [report.cardAnalysis]);

  const winDrivers = simulation.winConditionBreakdown.sort((a, b) => b.weight - a.weight);

  const coreCount = CARD_DATABASE_CORE.length;
  const combinedCards = useMemo(
    () => [...CARD_DATABASE_CORE, ...expansionState.cards],
    [expansionState.cards],
  );
  const metrics = useMemo(
    () => computeMvpMetrics(combinedCards, coreCount),
    [combinedCards, coreCount],
  );
  const expansionCount = Math.max(0, metrics.counts.exp);
  const totalCount = metrics.counts.total;
  const activeExpansionNames = expansionState.ids
    .map(id => EXPANSION_MANIFEST.find(pack => pack.id === id)?.title ?? id)
    .filter(Boolean)
    .join(', ');

  const truthBins = useMemo(() => {
    const bins: HistogramBin[] = [];
    for (let delta = -4; delta <= 4; delta++) {
      const label = delta > 0 ? `+${delta}` : `${delta}`;
      bins.push({ label, count: metrics.hist.truthDelta[delta] ?? 0 });
    }
    return bins;
  }, [metrics.hist.truthDelta]);

  const attackBins = useMemo(() => {
    const bins: HistogramBin[] = [];
    for (let ip = 1; ip <= 5; ip++) {
      bins.push({ label: `${ip} IP`, count: metrics.hist.attackIp[ip] ?? 0 });
    }
    return bins;
  }, [metrics.hist.attackIp]);

  const pressureBins = useMemo(() => {
    const bins: HistogramBin[] = [];
    for (let pressure = 1; pressure <= 4; pressure++) {
      bins.push({ label: `+${pressure}`, count: metrics.hist.pressure[pressure] ?? 0 });
    }
    return bins;
  }, [metrics.hist.pressure]);

  const latestIntelEntries = useMemo(
    () => logEntries.slice(-20).reverse(),
    [logEntries],
  );

  const formatDelta = (card: EnhancedCardAnalysis) => {
    if (card.costDelta === null) return '—';
    const symbol = card.costDelta > 0 ? '+' : '';
    return `${symbol}${card.costDelta.toFixed(1)} IP`;
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4">
      <Card className="w-full max-w-5xl max-h-[90vh] bg-gray-950 border border-gray-700 overflow-hidden flex flex-col">
        <div className="flex items-center justify-between p-4 border-b border-gray-800 bg-gray-900/80">
          <div>
            <h2 className="text-lg font-semibold text-white font-mono tracking-wide">
              MVP BALANCING BRIEFING
            </h2>
            <p className="text-xs text-emerald-400 mt-1 font-mono">
              Truth • IP Attrition • Pressure — real-time cost health
            </p>
          </div>
          <Button onClick={onClose} variant="outline" size="sm">
            Close
          </Button>
        </div>

        <div className="flex-1 overflow-y-auto p-6 space-y-6 text-sm text-slate-200">
        <section className="grid gap-3 md:grid-cols-4">
          <div className="bg-gray-900/60 border border-gray-800 rounded-lg p-4 space-y-1">
            <div className="text-xs font-semibold uppercase tracking-wide text-slate-400">Card pool</div>
            <div className="text-2xl font-bold text-emerald-300">
              {metrics.counts.core}/{expansionCount}/{totalCount}
            </div>
            <p className="text-xs text-slate-400">
              Core / Expansions / Total.{' '}
              {activeExpansionNames ? `Active packs: ${activeExpansionNames}.` : 'No expansions enabled.'}
            </p>
          </div>
          <div className="bg-gray-900/60 border border-gray-800 rounded-lg p-4 space-y-1">
            <div className="text-xs font-semibold uppercase tracking-wide text-slate-400">Cost table conformity</div>
            <div className="text-2xl font-bold text-emerald-300">{metrics.costConformity.pct.toFixed(0)}%</div>
            <p className="text-xs text-slate-400">{metrics.costConformity.ok} of {metrics.costConformity.total} cards match MVP expectations.</p>
          </div>
            <div className="bg-gray-900/60 border border-gray-800 rounded-lg p-4 space-y-1">
              <div className="text-xs font-semibold uppercase tracking-wide text-slate-400">Average MVP score</div>
              <div className="text-2xl font-bold text-sky-300">{metrics.avgMvpWeight.toFixed(1)}</div>
              <p className="text-xs text-slate-400">Aggregate weight from truth, IP and pressure deltas.</p>
            </div>
            <div className="bg-gray-900/60 border border-gray-800 rounded-lg p-4 space-y-1">
              <div className="text-xs font-semibold uppercase tracking-wide text-slate-400">Faction spread</div>
              <div className="text-2xl font-bold text-amber-300">
                {metrics.counts.truth}/{metrics.counts.government}
              </div>
              <p className="text-xs text-slate-400">Truth / Government card counts in the active pool.</p>
            </div>
          </section>

          <section className="space-y-3">
            <h3 className="text-lg font-semibold text-white font-mono">Intel Log</h3>
            <div className="bg-gray-900/60 border border-gray-800 rounded-lg p-4 max-h-60 overflow-y-auto space-y-2">
              {latestIntelEntries.length > 0 ? (
                latestIntelEntries.map((entry, index) => (
                  <div
                    key={`${entry}-${index}`}
                    className="flex items-start gap-3 text-xs text-slate-300"
                  >
                    <span className="font-mono text-emerald-400 mt-0.5">▲</span>
                    <span className="leading-snug flex-1">{entry}</span>
                  </div>
                ))
              ) : (
                <p className="text-xs text-slate-500 italic">No intel recorded yet.</p>
              )}
            </div>
          </section>

          <section className="space-y-3">
            <h3 className="text-lg font-semibold text-white font-mono">MVP Effect Distribution</h3>
            <div className="grid gap-3 md:grid-cols-3">
              <HistogramCard
                title="Truth delta"
                subtitle="MEDIA cards and their truth adjustments"
                barClassName="bg-emerald-400/80"
                bins={truthBins}
              />
              <HistogramCard
                title="IP pressure"
                subtitle="ATTACK cards vs opponent influence points"
                barClassName="bg-sky-400/80"
                bins={attackBins}
              />
              <HistogramCard
                title="Zone pressure"
                subtitle="ZONE cards modifying state pressure"
                barClassName="bg-amber-400/80"
                bins={pressureBins}
              />
            </div>
          </section>

          {report.globalRecommendations.length > 0 && (
            <section className="space-y-3">
              <h3 className="text-lg font-semibold text-white font-mono">Action Items</h3>
              <ul className="space-y-2 text-slate-300">
                {report.globalRecommendations.map(rec => (
                  <li key={rec} className="pl-4 relative">
                    <span className="absolute left-0 text-emerald-400">•</span>
                    <span>{rec}</span>
                  </li>
                ))}
              </ul>
            </section>
          )}

          {effectSection && (
            <section className="space-y-3">
              <h3 className="text-lg font-semibold text-white font-mono">{effectSection.title}</h3>
              <ul className="space-y-2 text-slate-300">
                {effectSection.bullets?.map(bullet => (
                  <li key={bullet} className="pl-4 relative">
                    <span className="absolute left-0 text-emerald-400">•</span>
                    <span>{bullet}</span>
                  </li>
                ))}
              </ul>
            </section>
          )}

          <section className="space-y-3">
            <h3 className="text-lg font-semibold text-white font-mono">Cost Table Reference</h3>
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs md:text-sm">
                <thead>
                  <tr className="bg-gray-900 text-slate-200">
                    <th className="border border-gray-800 px-3 py-2 font-mono uppercase tracking-wide">Rarity</th>
                    <th className="border border-gray-800 px-3 py-2 font-mono uppercase tracking-wide">Attack</th>
                    <th className="border border-gray-800 px-3 py-2 font-mono uppercase tracking-wide">Media</th>
                    <th className="border border-gray-800 px-3 py-2 font-mono uppercase tracking-wide">Zone</th>
                  </tr>
                </thead>
                <tbody>
                  {MVP_COST_TABLE_ROWS.map(row => (
                    <tr key={row.rarity} className="odd:bg-gray-900/40">
                      <td className="border border-gray-800 px-3 py-2 font-semibold uppercase text-slate-100">
                        {row.rarity}
                      </td>
                      <td className="border border-gray-800 px-3 py-2 text-slate-200">
                        <div className="font-semibold text-emerald-300">{row.attack.effect}</div>
                        <div className="text-xs text-slate-400">Cost {row.attack.cost}</div>
                      </td>
                      <td className="border border-gray-800 px-3 py-2 text-slate-200">
                        <div className="font-semibold text-sky-300">{row.media.effect}</div>
                        <div className="text-xs text-slate-400">Cost {row.media.cost}</div>
                      </td>
                      <td className="border border-gray-800 px-3 py-2 text-slate-200">
                        <div className="font-semibold text-amber-300">{row.zone.effect}</div>
                        <div className="text-xs text-slate-400">Cost {row.zone.cost}</div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>

          {cardRolesSection && (
            <section className="space-y-3">
              <h3 className="text-lg font-semibold text-white font-mono">{cardRolesSection.title}</h3>
              <div className="grid gap-3 md:grid-cols-3">
                {cardRolesSection.bullets?.map(bullet => {
                  const [label, summary] = bullet.split(':');
                  return (
                    <div key={bullet} className="bg-gray-900/60 border border-gray-800 rounded-lg p-3">
                      <div className="text-xs font-semibold text-emerald-300 uppercase tracking-wide">{label?.trim()}</div>
                      <div className="text-sm text-slate-200 mt-1 leading-relaxed">{summary?.trim()}</div>
                    </div>
                  );
                })}
              </div>
            </section>
          )}

          <section className="space-y-3">
            <h3 className="text-lg font-semibold text-white font-mono">Top Cost Deviations</h3>
            {costOutliers.length === 0 ? (
              <p className="text-slate-300">All cards are currently on curve.</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse text-xs md:text-sm">
                  <thead>
                    <tr className="bg-gray-900 text-slate-200">
                      <th className="border border-gray-800 px-3 py-2">Card</th>
                      <th className="border border-gray-800 px-3 py-2">Faction</th>
                      <th className="border border-gray-800 px-3 py-2">Status</th>
                      <th className="border border-gray-800 px-3 py-2">Δ Cost</th>
                      <th className="border border-gray-800 px-3 py-2">MVP Score</th>
                    </tr>
                  </thead>
                  <tbody>
                    {costOutliers.map(card => (
                      <tr key={card.cardId} className="odd:bg-gray-900/40">
                        <td className="border border-gray-800 px-3 py-2 font-semibold text-slate-100">{card.name}</td>
                        <td className="border border-gray-800 px-3 py-2">
                          <Badge variant="outline" className="uppercase tracking-wide text-xs">
                            {card.faction}
                          </Badge>
                        </td>
                        <td className="border border-gray-800 px-3 py-2 text-slate-200">{card.costStatus}</td>
                        <td className="border border-gray-800 px-3 py-2 text-slate-200">{formatDelta(card)}</td>
                        <td className="border border-gray-800 px-3 py-2 text-slate-200">{card.mvpScore.toFixed(1)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </section>

          <section className="space-y-3">
            <h3 className="text-lg font-semibold text-white font-mono">Win Condition Signals</h3>
            <div className="grid gap-3 md:grid-cols-3">
              <div className="bg-gray-900/60 border border-gray-800 rounded-lg p-4">
                <div className="text-xs font-semibold uppercase tracking-wide text-slate-400">Truth-aligned win rate</div>
                <div className="text-2xl font-bold text-emerald-300">{simulation.truthWinRate.toFixed(1)}%</div>
              </div>
              <div className="bg-gray-900/60 border border-gray-800 rounded-lg p-4">
                <div className="text-xs font-semibold uppercase tracking-wide text-slate-400">Government win rate</div>
                <div className="text-2xl font-bold text-rose-300">{simulation.governmentWinRate.toFixed(1)}%</div>
              </div>
              <div className="bg-gray-900/60 border border-gray-800 rounded-lg p-4">
                <div className="text-xs font-semibold uppercase tracking-wide text-slate-400">Stalemate window</div>
                <div className="text-2xl font-bold text-slate-200">{simulation.drawRate.toFixed(1)}%</div>
              </div>
            </div>
            <div className="flex flex-wrap gap-2">
              {winDrivers.map(driver => (
                <Badge key={driver.condition} variant="outline" className="uppercase tracking-wide text-xs">
                  {driver.condition.toUpperCase()}: {driver.weight.toFixed(1)}%
                </Badge>
              ))}
            </div>
          </section>

          <section className="space-y-2">
            <h3 className="text-lg font-semibold text-white font-mono">Next Steps</h3>
            <ul className="list-disc list-inside text-slate-300 space-y-1">
              <li>Use the outlier table to target manual reviews before the next playtest.</li>
              <li>Truth/IP/Pressure drivers highlight which win condition needs more coverage.</li>
              <li>Legacy export formats and extension data have been retired for the MVP build.</li>
            </ul>
          </section>
        </div>
      </Card>
    </div>
  );
};

export default EnhancedBalancingDashboard;
