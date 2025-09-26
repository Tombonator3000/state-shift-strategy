import { useCallback, useEffect, useMemo, useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  analyzeCardBalanceForCards,
  runBalanceSimulationForCards,
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
import { Switch } from '@/components/ui/switch';
import { Slider } from '@/components/ui/slider';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import type { GameCard } from '@/rules/mvp';

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
  const [expansionState, setExpansionState] = useState(() => ({
    ids: getEnabledExpansionIdsSnapshot(),
    cards: getExpansionCardsSnapshot(),
  }));
  const [includeExpansions, setIncludeExpansions] = useState(
    () => getEnabledExpansionIdsSnapshot().length > 0,
  );
  const [simulationIterations, setSimulationIterations] = useState(500);
  const [typeFilters, setTypeFilters] = useState<Record<GameCard['type'], boolean>>({
    ATTACK: true,
    MEDIA: true,
    ZONE: true,
  });

  useEffect(() => {
    const unsubscribe = subscribeToExpansionChanges(payload => {
      setExpansionState(payload);
    });
    return unsubscribe;
  }, []);

  useEffect(() => {
    if (expansionState.ids.length === 0) {
      setIncludeExpansions(false);
    }
  }, [expansionState.ids.length]);

  const activeTypes = useMemo(
    () =>
      (Object.entries(typeFilters) as Array<[GameCard['type'], boolean]>).
        filter(([, enabled]) => enabled).
        map(([type]) => type),
    [typeFilters],
  );

  const filterByTypes = useCallback(
    (cards: GameCard[]) => {
      if (activeTypes.length === 0) {
        return [];
      }
      return cards.filter(card => activeTypes.includes(card.type));
    },
    [activeTypes],
  );

  const filteredCoreCards = useMemo(
    () => filterByTypes(CARD_DATABASE_CORE as GameCard[]),
    [filterByTypes],
  );

  const filteredExpansionCards = useMemo(
    () => filterByTypes(expansionState.cards),
    [filterByTypes, expansionState.cards],
  );

  const activePool = useMemo(
    () =>
      includeExpansions
        ? [...filteredCoreCards, ...filteredExpansionCards]
        : filteredCoreCards,
    [includeExpansions, filteredCoreCards, filteredExpansionCards],
  );

  const filteredCoreCount = filteredCoreCards.length;
  const report = useMemo(
    () => analyzeCardBalanceForCards(activePool),
    [activePool],
  );
  const simulation = useMemo(
    () => runBalanceSimulationForCards(activePool, simulationIterations),
    [activePool, simulationIterations],
  );

  const metrics = useMemo(
    () => computeMvpMetrics(activePool, filteredCoreCount),
    [activePool, filteredCoreCount],
  );

  const effectSection = MVP_RULES_SECTIONS.find(
    section => section.title === 'Effect Whitelist (MVP)'
  );

  const cardRolesSection = MVP_RULES_SECTIONS.find(
    section => section.title === 'Card Roles'
  );

  const expansionCount = Math.max(0, metrics.counts.exp);
  const totalCount = metrics.counts.total;
  const activeExpansionNames = expansionState.ids
    .map(id => EXPANSION_MANIFEST.find(pack => pack.id === id)?.title ?? id)
    .filter(Boolean)
    .join(', ');
  const hasEnabledExpansions = expansionState.ids.length > 0;
  const hasActiveTypes = activeTypes.length > 0;
  const hasCardData = activePool.length > 0;
  const poolScopeLabel = includeExpansions ? 'Core + enabled expansions' : 'Core set only';
  const actionableRecommendations = report.totalCards > 0
    ? report.globalRecommendations
    : ['No cards match the current filters yet. Adjust scope to view analysis.'];

  const typeOptions: Array<{
    type: GameCard['type'];
    label: string;
    description: string;
    accent: string;
  }> = [
    { type: 'ATTACK', label: 'Attack', description: 'IP pressure & tempo hits', accent: 'text-sky-300' },
    { type: 'MEDIA', label: 'Media', description: 'Truth swings & narrative wins', accent: 'text-emerald-300' },
    { type: 'ZONE', label: 'Zone', description: 'Board presence & pressure', accent: 'text-amber-300' },
  ];

  const costOutliers = useMemo(() => {
    return report.cardAnalysis
      .filter(card => card.costStatus !== 'On Curve' && card.costDelta !== null)
      .sort((a, b) => Math.abs((b.costDelta ?? 0)) - Math.abs((a.costDelta ?? 0)))
      .slice(0, 6);
  }, [report.cardAnalysis]);

  const winDrivers = useMemo(
    () =>
      [...simulation.winConditionBreakdown].sort((a, b) => b.weight - a.weight),
    [simulation.winConditionBreakdown],
  );
  const filteredWinDrivers = hasCardData ? winDrivers : [];

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

  const expansionStatusMessage = useMemo(() => {
    if (!includeExpansions) {
      return 'Expansion cards excluded from calculations.';
    }
    if (!hasEnabledExpansions) {
      return 'Enable an expansion pack to include it in analysis.';
    }
    return activeExpansionNames
      ? `Active packs: ${activeExpansionNames}.`
      : 'Expansions toggle is on with no packs selected.';
  }, [includeExpansions, hasEnabledExpansions, activeExpansionNames]);

  const typeSummary = useMemo(
    () => (hasActiveTypes ? activeTypes.join(', ') : 'None selected'),
    [activeTypes, hasActiveTypes],
  );

  const handleExpansionToggle = (checked: boolean) => {
    if (!hasEnabledExpansions) return;
    setIncludeExpansions(Boolean(checked));
  };

  const handleIterationsChange = (value: number[]) => {
    const next = value[0];
    if (typeof next === 'number' && Number.isFinite(next)) {
      setSimulationIterations(Math.round(next));
    }
  };

  const handleTypeFilterChange = (
    type: GameCard['type'],
    checked: boolean | 'indeterminate',
  ) => {
    setTypeFilters(prev => ({
      ...prev,
      [type]: Boolean(checked),
    }));
  };

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
          <section className="grid gap-3 md:grid-cols-3">
            <div className="bg-gray-900/60 border border-gray-800 rounded-lg p-4 space-y-3">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <div className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                    Card pool scope
                  </div>
                  <p className="text-xs text-slate-400">{poolScopeLabel}. {expansionStatusMessage}</p>
                </div>
                <Switch
                  checked={includeExpansions && hasEnabledExpansions}
                  onCheckedChange={handleExpansionToggle}
                  disabled={!hasEnabledExpansions}
                />
              </div>
              {!hasEnabledExpansions && (
                <p className="text-[11px] text-amber-400">
                  Enable packs in Deck Lab to pull their cards into this analysis.
                </p>
              )}
            </div>
            <div className="bg-gray-900/60 border border-gray-800 rounded-lg p-4 space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                    Simulation passes
                  </div>
                  <p className="text-xs text-slate-400">Adjust win-condition weighting sample size.</p>
                </div>
                <span className="text-sm font-mono text-slate-200">
                  {simulationIterations.toLocaleString()}
                </span>
              </div>
              <Slider
                value={[simulationIterations]}
                min={100}
                max={5000}
                step={100}
                onValueChange={handleIterationsChange}
              />
            </div>
            <div className="bg-gray-900/60 border border-gray-800 rounded-lg p-4 space-y-3">
              <div>
                <div className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                  Card type filters
                </div>
                <p className="text-xs text-slate-400">
                  Focus the dashboard on specific MVP lanes.
                </p>
              </div>
              <div className="space-y-2">
                {typeOptions.map(option => {
                  const checkboxId = `type-filter-${option.type.toLowerCase()}`;
                  return (
                    <div key={option.type} className="flex items-start gap-2">
                      <Checkbox
                        id={checkboxId}
                        checked={typeFilters[option.type]}
                        onCheckedChange={value => handleTypeFilterChange(option.type, value)}
                      />
                      <Label
                        htmlFor={checkboxId}
                        className="cursor-pointer text-xs text-slate-300 leading-tight"
                      >
                        <span className={`block font-semibold uppercase tracking-wide ${option.accent}`}>
                          {option.label}
                        </span>
                        <span className="text-[11px] text-slate-500">{option.description}</span>
                      </Label>
                    </div>
                  );
                })}
              </div>
              {!hasActiveTypes && (
                <p className="text-[11px] text-amber-400">
                  Select at least one card type to populate the dashboard.
                </p>
              )}
            </div>
          </section>

          <section className="grid gap-3 md:grid-cols-4">
            <div className="bg-gray-900/60 border border-gray-800 rounded-lg p-4 space-y-1">
              <div className="text-xs font-semibold uppercase tracking-wide text-slate-400">Card pool</div>
              <div className="text-2xl font-bold text-emerald-300">
                {metrics.counts.core}/{expansionCount}/{totalCount}
              </div>
              <p className="text-xs text-slate-400">
                Core / Expansions / Total. Type focus: {typeSummary}.
              </p>
              <p className="text-xs text-slate-500">
                {includeExpansions && hasEnabledExpansions
                  ? activeExpansionNames
                    ? `Expansions: ${activeExpansionNames}.`
                    : 'Expansions enabled but no packs active.'
                  : 'Expansions excluded.'}
              </p>
            </div>
            <div className="bg-gray-900/60 border border-gray-800 rounded-lg p-4 space-y-1">
              <div className="text-xs font-semibold uppercase tracking-wide text-slate-400">Cost table conformity</div>
              <div className="text-2xl font-bold text-emerald-300">{metrics.costConformity.pct.toFixed(0)}%</div>
              <p className="text-xs text-slate-400">
                {metrics.costConformity.ok} of {metrics.costConformity.total} cards match MVP expectations.
              </p>
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

          {actionableRecommendations.length > 0 && (
            <section className="space-y-3">
              <h3 className="text-lg font-semibold text-white font-mono">Action Items</h3>
              <ul className="space-y-2 text-slate-300">
                {actionableRecommendations.map(rec => (
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
            {!hasCardData ? (
              <p className="text-slate-300">No cards match the current filters.</p>
            ) : costOutliers.length === 0 ? (
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
            <p className="text-xs text-slate-500">
              Model weighted across {simulation.iterations.toLocaleString()} passes.
            </p>
            <div className="flex flex-wrap gap-2">
              {filteredWinDrivers.map(driver => (
                <Badge key={driver.condition} variant="outline" className="uppercase tracking-wide text-xs">
                  {driver.condition.toUpperCase()}: {driver.weight.toFixed(1)}%
                </Badge>
              ))}
            </div>
            {!hasCardData && (
              <p className="text-xs text-amber-400">
                Add at least one card type above to surface win condition signals.
              </p>
            )}
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
