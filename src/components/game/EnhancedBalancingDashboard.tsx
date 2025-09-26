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

const BalanceGauge = ({
  score,
  label,
}: {
  score: number;
  label: string;
}) => {
  const normalized = Math.min(100, Math.max(0, Math.round(score)));
  const hue = normalized > 70 ? 150 : normalized > 40 ? 45 : 0;
  const gradient = `conic-gradient(hsl(${hue} 70% 60%) ${normalized * 3.6}deg, rgba(30,41,59,0.35) ${normalized * 3.6}deg)`;

  return (
    <div className="flex flex-col items-center gap-2">
      <div className="relative h-28 w-28 rounded-full border border-emerald-500/40 bg-gray-950 shadow-[0_0_40px_rgba(16,185,129,0.2)]">
        <div
          className="absolute inset-2 rounded-full border border-emerald-500/20 bg-gray-950"
          style={{ backgroundImage: gradient }}
        />
        <div className="absolute inset-7 rounded-full bg-gray-950/95 border border-gray-800 flex flex-col items-center justify-center">
          <span className="text-2xl font-bold text-emerald-200">{normalized}</span>
          <span className="text-[10px] uppercase tracking-wide text-slate-500">Score</span>
        </div>
      </div>
      <span className="text-xs uppercase tracking-wide text-slate-400">{label}</span>
    </div>
  );
};

const VictorySpectrum = ({
  truth,
  government,
  stalemate,
}: {
  truth: number;
  government: number;
  stalemate: number;
}) => {
  const total = Math.max(1, truth + government + stalemate);
  const truthPct = (truth / total) * 100;
  const govPct = (government / total) * 100;
  const stalePct = (stalemate / total) * 100;

  return (
    <div className="bg-gray-900/60 border border-gray-800 rounded-lg p-4 space-y-3">
      <div>
        <div className="text-xs font-semibold uppercase tracking-wide text-slate-400">Victory Spectrum</div>
        <p className="text-xs text-slate-500">Projected win slice split across {total.toLocaleString()} simulations.</p>
      </div>
      <div className="h-3 rounded-full overflow-hidden border border-gray-800">
        <div className="flex h-full w-full">
          <div className="h-full bg-emerald-400/80" style={{ width: `${truthPct}%` }} />
          <div className="h-full bg-rose-400/80" style={{ width: `${govPct}%` }} />
          <div className="h-full bg-slate-500/80" style={{ width: `${stalePct}%` }} />
        </div>
      </div>
      <div className="grid grid-cols-3 text-[11px] uppercase tracking-wide text-center text-slate-400 gap-2">
        <span className="bg-emerald-500/10 border border-emerald-500/30 rounded-md py-1">Truth {truth.toFixed(1)}%</span>
        <span className="bg-rose-500/10 border border-rose-500/30 rounded-md py-1">Gov {government.toFixed(1)}%</span>
        <span className="bg-slate-500/10 border border-slate-500/30 rounded-md py-1">Stalemate {stalemate.toFixed(1)}%</span>
      </div>
    </div>
  );
};

const SystemsDiagram = ({
  activeTypes,
}: {
  activeTypes: string[];
}) => {
  const nodes = [
    { key: 'truth', label: 'Truth Ops', accent: 'text-emerald-300', active: activeTypes.includes('MEDIA') },
    { key: 'attack', label: 'Influence Pressure', accent: 'text-sky-300', active: activeTypes.includes('ATTACK') },
    { key: 'zone', label: 'Zone Control', accent: 'text-amber-300', active: activeTypes.includes('ZONE') },
  ];

  return (
    <div className="bg-gray-900/60 border border-gray-800 rounded-lg p-4">
      <div className="text-xs font-semibold uppercase tracking-wide text-slate-400">Systems Map</div>
      <p className="text-xs text-slate-500">Hover grid outlines how MVP lanes feed the balance core.</p>
      <div className="mt-4 grid grid-cols-3 gap-3 relative">
        <div className="absolute left-1/2 top-0 bottom-0 w-px bg-emerald-500/20" />
        <div className="absolute top-1/2 left-0 right-0 h-px bg-emerald-500/20" />
        {nodes.map(node => (
          <div
            key={node.key}
            className={`relative bg-gray-950/80 border rounded-lg p-3 transition-all duration-500 hover:border-emerald-400/60 hover:shadow-[0_0_30px_rgba(16,185,129,0.35)] ${
              node.active ? 'border-emerald-400/50' : 'border-gray-800'
            }`}
          >
            <span className={`text-[11px] uppercase tracking-[0.2em] ${node.accent}`}>{node.label}</span>
            <p className="text-xs text-slate-300 mt-2 leading-relaxed">
              {node.key === 'truth'
                ? 'Media cards adjust narrative deltas and truth control.'
                : node.key === 'attack'
                  ? 'Attack suite drains influence through direct IP attrition.'
                  : 'Zone presence modulates pressure lanes and staging tempo.'}
            </p>
            <div className="absolute -inset-0.5 border border-emerald-500/10 rounded-lg" />
          </div>
        ))}
      </div>
    </div>
  );
};

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

  const neutralTruthEntries = metrics.hist.truthDelta?.[0] ?? 0;
  const highIpSwings = (metrics.hist.attackIp?.[3] ?? 0) + (metrics.hist.attackIp?.[4] ?? 0);
  const pressurePeak = useMemo(() => {
    const entries = Object.keys(metrics.hist.pressure ?? {}).map(value => Number(value));
    if (entries.length === 0) return 0;
    return Math.max(...entries.filter(value => Number.isFinite(value)));
  }, [metrics.hist.pressure]);

  const latestIntelEntries = useMemo(
    () => logEntries.slice(-20).reverse(),
    [logEntries],
  );

  const winSpread = Math.abs(simulation.truthWinRate - simulation.governmentWinRate);
  const balanceHealthScore = useMemo(() => {
    const costScore = metrics.costConformity.pct;
    const winBalanceScore = Math.max(0, 100 - winSpread * 2);
    const pressureScore = Math.min(100, Math.max(0, metrics.avgMvpWeight * 18));
    return (costScore * 0.5 + winBalanceScore * 0.3 + pressureScore * 0.2) / 1;
  }, [metrics.avgMvpWeight, metrics.costConformity.pct, winSpread]);

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
          <section className="relative overflow-hidden rounded-xl border border-emerald-500/20 bg-gradient-to-br from-emerald-900/40 via-gray-950 to-slate-950 p-6">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(34,197,94,0.25),transparent_55%)]" />
            <div className="absolute inset-0 opacity-30 mix-blend-screen" style={{ backgroundImage: 'linear-gradient(120deg, transparent 0%, rgba(56,189,248,0.15) 50%, transparent 100%)' }} />
            <div className="relative grid gap-6 md:grid-cols-5 items-center">
              <div className="md:col-span-3 space-y-3">
                <Badge variant="outline" className="uppercase tracking-[0.3em] text-xs">Real-time Analysis Uplink</Badge>
                <h3 className="text-2xl md:text-3xl font-semibold text-emerald-100 font-mono leading-tight">
                  Balance Health Synopsis
                </h3>
                <p className="text-sm text-emerald-200/80 leading-relaxed">
                  Monitoring MVP deltas across truth, influence and staging pressure. Adaptive sampling calibrates against
                  enabled expansion packs to surface emergent imbalances before they hit the table.
                </p>
                <div className="grid gap-3 sm:grid-cols-3 text-xs uppercase tracking-wide">
                  <div className="bg-gray-900/60 border border-emerald-500/30 rounded-lg p-3">
                    <div className="text-[11px] text-emerald-300">Cost Integrity</div>
                    <div className="text-lg font-bold text-white">{metrics.costConformity.pct.toFixed(0)}%</div>
                    <p className="text-[11px] text-emerald-200/70 mt-1">{metrics.costConformity.ok} aligned entries</p>
                  </div>
                  <div className="bg-gray-900/60 border border-sky-500/30 rounded-lg p-3">
                    <div className="text-[11px] text-sky-300">Avg MVP Weight</div>
                    <div className="text-lg font-bold text-white">{metrics.avgMvpWeight.toFixed(1)}</div>
                    <p className="text-[11px] text-sky-200/70 mt-1">Truth/IP/Pressure composite</p>
                  </div>
                  <div className="bg-gray-900/60 border border-amber-500/30 rounded-lg p-3">
                    <div className="text-[11px] text-amber-300">Win Delta Spread</div>
                    <div className="text-lg font-bold text-white">{winSpread.toFixed(1)}%</div>
                    <p className="text-[11px] text-amber-200/70 mt-1">Truth vs Government gap</p>
                  </div>
                </div>
              </div>
              <div className="md:col-span-2 flex flex-col items-center gap-4">
                <BalanceGauge score={balanceHealthScore} label="Balance Health" />
                <div className="w-full max-w-xs">
                  <VictorySpectrum
                    truth={simulation.truthWinRate}
                    government={simulation.governmentWinRate}
                    stalemate={simulation.drawRate}
                  />
                </div>
              </div>
            </div>
          </section>

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

          <section className="grid gap-3 md:grid-cols-3">
            <SystemsDiagram activeTypes={activeTypes} />
            <div className="md:col-span-2 bg-gray-900/60 border border-gray-800 rounded-lg p-4 space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-xs font-semibold uppercase tracking-wide text-slate-400">Operational Directives</div>
                  <p className="text-xs text-slate-500">Use these readouts to rebalance lanes before escalation.</p>
                </div>
                <Badge variant="outline" className="uppercase tracking-wide text-[11px]">Deck Lab Feed</Badge>
              </div>
              <div className="grid gap-2 md:grid-cols-2 text-[13px] text-slate-200">
                <div className="bg-gray-950/70 border border-emerald-500/20 rounded-lg p-3">
                  <p className="font-semibold text-emerald-300 uppercase tracking-wide text-[11px]">Truth Control</p>
                  <p className="mt-1 leading-relaxed text-slate-300">
                    Media deltas net {neutralTruthEntries} neutral entries. Track spikes beyond ±2 for targeted edits.
                  </p>
                </div>
                <div className="bg-gray-950/70 border border-sky-500/20 rounded-lg p-3">
                  <p className="font-semibold text-sky-300 uppercase tracking-wide text-[11px]">IP Attrition</p>
                  <p className="mt-1 leading-relaxed text-slate-300">
                    Attack suites average {highIpSwings} high IP swings. Ensure counterplay exists in the enabled packs.
                  </p>
                </div>
                <div className="bg-gray-950/70 border border-amber-500/20 rounded-lg p-3">
                  <p className="font-semibold text-amber-300 uppercase tracking-wide text-[11px]">Zone Pressure</p>
                  <p className="mt-1 leading-relaxed text-slate-300">
                    Pressure curve peaks at +{pressurePeak} stacks. Highlight zone locks during playtest briefings.
                  </p>
                </div>
                <div className="bg-gray-950/70 border border-rose-500/20 rounded-lg p-3">
                  <p className="font-semibold text-rose-300 uppercase tracking-wide text-[11px]">Expansion Pulse</p>
                  <p className="mt-1 leading-relaxed text-slate-300">
                    {includeExpansions && hasEnabledExpansions
                      ? activeExpansionNames
                        ? `Active packs broadcasting: ${activeExpansionNames}.`
                        : 'Expansions enabled — awaiting pack selection.'
                      : 'Core-only mode, expansions muted for this pass.'}
                  </p>
                </div>
              </div>
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
