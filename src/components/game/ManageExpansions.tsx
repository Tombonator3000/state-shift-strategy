import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { Switch } from '@/components/ui/switch';
import { Progress } from '@/components/ui/progress';
import type { GameCard } from '@/rules/mvp';
import { getCoreCards } from '@/data/cardDatabase';
import { normalizeFaction } from '@/data/mvpAnalysisUtils';
import { EXPANSION_MANIFEST } from '@/data/expansions';
import {
  getExpansionCardsSnapshot,
  getStoredExpansionIds,
  subscribeToExpansionChanges,
  updateEnabledExpansions,
} from '@/data/expansions/state';
import { useDistributionSettings } from '@/hooks/useDistributionSettings';
import type { DistributionMode } from '@/data/weightedCardDistribution';

interface ManageExpansionsProps {
  onClose: () => void;
}

interface StatBlock {
  totalCards: number;
  types: Array<[string, number]>;
  factions: { truth: number; government: number; neutral: number };
  rarities: Array<[string, number]>;
}

type SimulationTypeKey = 'ATTACK' | 'MEDIA' | 'ZONE';

interface SimulationResult {
  setDistribution: Map<string, number>;
  rarityDistribution: Map<string, number>;
  typeDistribution: Map<SimulationTypeKey, number>;
}

const RARITY_ORDER: Array<'common' | 'uncommon' | 'rare' | 'legendary'> = [
  'common',
  'uncommon',
  'rare',
  'legendary',
];

const computeStats = (cards: GameCard[]): StatBlock => {
  const typeCounts = new Map<string, number>();
  const rarityCounts = new Map<string, number>();
  const factions = { truth: 0, government: 0, neutral: 0 };

  cards.forEach(card => {
    typeCounts.set(card.type, (typeCounts.get(card.type) ?? 0) + 1);
    const faction = normalizeFaction(card.faction);
    factions[faction] += 1;
    if (card.rarity) {
      rarityCounts.set(card.rarity, (rarityCounts.get(card.rarity) ?? 0) + 1);
    }
  });

  return {
    totalCards: cards.length,
    types: Array.from(typeCounts.entries()),
    factions,
    rarities: Array.from(rarityCounts.entries()),
  };
};

const EXPANSION_ID_SET = new Set(EXPANSION_MANIFEST.map(pack => pack.id));

const summarizeExpansionCards = (cards: GameCard[]): Record<string, number> => {
  const counts: Record<string, number> = {};
  cards.forEach(card => {
    const extId = card.extId;
    if (!extId || !EXPANSION_ID_SET.has(extId)) {
      return;
    }
    counts[extId] = (counts[extId] ?? 0) + 1;
  });
  return counts;
};

const ManageExpansions = ({ onClose }: ManageExpansionsProps) => {
  const [coreCards] = useState<GameCard[]>(() => getCoreCards());
  const [enabledExpansions, setEnabledExpansions] = useState<string[]>(() => getStoredExpansionIds());
  const [expansionCards, setExpansionCards] = useState<GameCard[]>(() => getExpansionCardsSnapshot());
  const [expansionCounts, setExpansionCounts] = useState<Record<string, number>>(() =>
    summarizeExpansionCards(getExpansionCardsSnapshot()),
  );
  const [pendingUpdates, setPendingUpdates] = useState<Record<string, boolean>>({});
  const [updateError, setUpdateError] = useState<string | null>(null);

  const {
    settings,
    isLoading: distributionLoading,
    setMode,
    setSetWeight,
    setRarityTarget,
    toggleTypeBalancing,
    setDuplicateLimit,
    setEarlySeedCount,
    resetToDefaults,
    getSimulation,
  } = useDistributionSettings();

  const getSimulationRef = useRef(getSimulation);

  useEffect(() => {
    getSimulationRef.current = getSimulation;
  }, [getSimulation]);

  const [simulationResults, setSimulationResults] = useState<SimulationResult | null>(null);
  const [isSimulating, setIsSimulating] = useState(false);

  const refreshSimulation = useCallback((trials = 200) => {
    setIsSimulating(true);
    try {
      const results = getSimulationRef.current(trials);
      setSimulationResults(results);
    } catch (error) {
      console.error('Failed to simulate distribution preview:', error);
      setSimulationResults(null);
    } finally {
      setIsSimulating(false);
    }
  }, []);

  useEffect(() => {
    const unsubscribe = subscribeToExpansionChanges(({ ids, cards }) => {
      setEnabledExpansions(ids);
      setExpansionCards(cards);
      setExpansionCounts(summarizeExpansionCards(cards));
    });
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    if (distributionLoading) {
      return;
    }
    refreshSimulation(200);
  }, [distributionLoading, settings, enabledExpansions, refreshSimulation]);

  const coreStats = useMemo(() => computeStats(coreCards), [coreCards]);
  const expansionStats = useMemo(() => computeStats(expansionCards), [expansionCards]);
  const combinedStats = useMemo(
    () => computeStats([...coreCards, ...expansionCards]),
    [coreCards, expansionCards],
  );

  const expansionTotal = useMemo(
    () => Object.values(expansionCounts).reduce((sum, value) => sum + value, 0),
    [expansionCounts],
  );

  const expansionDetails = useMemo(
    () =>
      EXPANSION_MANIFEST.map(pack => ({
        id: pack.id,
        title: pack.title,
        enabled: enabledExpansions.includes(pack.id),
        count: expansionCounts[pack.id] ?? 0,
      })),
    [enabledExpansions, expansionCounts],
  );

  type ActiveSet = {
    id: string;
    name: string;
    count: number;
    isCore: boolean;
  };

  const activeSets = useMemo<ActiveSet[]>(() => {
    const sets: ActiveSet[] = [
      {
        id: 'core',
        name: 'Core Set',
        count: coreStats.totalCards,
        isCore: true,
      },
    ];

    expansionDetails
      .filter(detail => detail.enabled && detail.count > 0)
      .forEach(detail => {
        sets.push({
          id: detail.id,
          name: detail.title,
          count: detail.count,
          isCore: false,
        });
      });

    return sets;
  }, [coreStats.totalCards, expansionDetails]);

  const hasActiveExpansions = useMemo(() => activeSets.some(set => !set.isCore), [activeSets]);

  const typeKeys = useMemo(() => {
    const keys = new Set<string>();
    coreStats.types.forEach(([type]) => keys.add(type));
    expansionStats.types.forEach(([type]) => keys.add(type));
    return Array.from(keys).sort();
  }, [coreStats.types, expansionStats.types]);

  const rarityKeys = useMemo(() => {
    const keys = new Set<string>();
    coreStats.rarities.forEach(([rarity]) => keys.add(rarity));
    expansionStats.rarities.forEach(([rarity]) => keys.add(rarity));
    return Array.from(keys).sort();
  }, [coreStats.rarities, expansionStats.rarities]);

  const coreTypeMap = useMemo(() => new Map(coreStats.types), [coreStats.types]);
  const expansionTypeMap = useMemo(
    () => new Map(expansionStats.types),
    [expansionStats.types],
  );
  const coreRarityMap = useMemo(() => new Map(coreStats.rarities), [coreStats.rarities]);
  const expansionRarityMap = useMemo(
    () => new Map(expansionStats.rarities),
    [expansionStats.rarities],
  );

  const activeExpansionNames = expansionDetails
    .filter(detail => detail.enabled && detail.count > 0)
    .map(detail => detail.title)
    .join(', ');

  const hasPendingUpdates = useMemo(
    () => Object.values(pendingUpdates).some(Boolean),
    [pendingUpdates],
  );

  const modeOptions = useMemo(
    () => [
      {
        value: 'core-only' as DistributionMode,
        label: 'Core Only',
        description: 'Restrict draws to the recovered base inventory.',
        disabled: false,
      },
      {
        value: 'balanced' as DistributionMode,
        label: 'Balanced Mix',
        description: 'Blend core with active expansions using default ratios.',
        disabled: !hasActiveExpansions,
      },
      {
        value: 'expansion-only' as DistributionMode,
        label: 'Expansion Only',
        description: 'Use only the enabled expansion packs for draws.',
        disabled: !hasActiveExpansions,
      },
      {
        value: 'custom' as DistributionMode,
        label: 'Custom Mix',
        description: 'Tune per-set weights manually for bespoke scenarios.',
        disabled: false,
      },
    ],
    [hasActiveExpansions],
  );

  const currentModeLabel = useMemo(() => {
    const active = modeOptions.find(option => option.value === settings.mode);
    return active?.label ?? settings.mode;
  }, [modeOptions, settings.mode]);

  const getSetTitle = useCallback((setId: string) => {
    if (setId === 'core') {
      return 'Core Set';
    }
    const manifest = EXPANSION_MANIFEST.find(pack => pack.id === setId);
    return manifest?.title ?? setId;
  }, []);

  const handleExpansionToggle = async (expansionId: string) => {
    setUpdateError(null);
    const nextIds = enabledExpansions.includes(expansionId)
      ? enabledExpansions.filter(id => id !== expansionId)
      : [...enabledExpansions, expansionId];

    setEnabledExpansions(nextIds);
    setPendingUpdates(prev => ({ ...prev, [expansionId]: true }));

    try {
      const cards = await updateEnabledExpansions(nextIds);
      setExpansionCards(cards);
      setExpansionCounts(summarizeExpansionCards(cards));
    } catch (error) {
      console.error('Failed to update expansions:', error);
      setUpdateError('Failed to update expansion selection. Restoring previous state.');
      const storedIds = getStoredExpansionIds();
      const storedCards = getExpansionCardsSnapshot();
      setEnabledExpansions(storedIds);
      setExpansionCards(storedCards);
      setExpansionCounts(summarizeExpansionCards(storedCards));
    } finally {
      setPendingUpdates(prev => {
        const next = { ...prev };
        delete next[expansionId];
        return next;
      });
    }
  };

  const simulationSetRows = useMemo(() => {
    if (!simulationResults) {
      return [] as Array<{ id: string; label: string; percent: number; average: number }>;
    }

    const entries = Array.from(simulationResults.setDistribution.entries());
    if (entries.length === 0) {
      return [];
    }

    const total = entries.reduce((sum, [, count]) => sum + count, 0);
    if (total === 0) {
      return [];
    }

    return entries
      .map(([setId, count]) => ({
        id: setId,
        label: getSetTitle(setId),
        percent: (count / total) * 100,
        average: (count / total) * 40,
      }))
      .sort((a, b) => b.percent - a.percent);
  }, [simulationResults, getSetTitle]);

  const simulationRarityRows = useMemo(() => {
    if (!simulationResults) {
      return [] as Array<{ rarity: string; percent: number }>;
    }

    const totals = Array.from(simulationResults.rarityDistribution.values()).reduce(
      (sum, value) => sum + value,
      0,
    );

    if (totals === 0) {
      return [];
    }

    return RARITY_ORDER.map(rarity => {
      const count = simulationResults.rarityDistribution.get(rarity) ?? 0;
      return {
        rarity,
        percent: totals > 0 ? (count / totals) * 100 : 0,
      };
    });
  }, [simulationResults]);

  const simulationTypeRows = useMemo(() => {
    if (!simulationResults) {
      return [] as Array<{ type: SimulationTypeKey; percent: number; average: number }>;
    }

    const order: SimulationTypeKey[] = ['ATTACK', 'MEDIA', 'ZONE'];
    const totals = Array.from(simulationResults.typeDistribution.values()).reduce(
      (sum, value) => sum + value,
      0,
    );

    if (totals === 0) {
      return [];
    }

    return order.map(type => {
      const count = simulationResults.typeDistribution.get(type) ?? 0;
      return {
        type,
        percent: totals > 0 ? (count / totals) * 100 : 0,
        average: totals > 0 ? (count / totals) * 40 : 0,
      };
    });
  }, [simulationResults]);

  return (
    <div className="min-h-screen bg-newspaper-bg flex items-center justify-center p-8 relative overflow-hidden">
      <div className="absolute inset-0 opacity-5">
        {Array.from({ length: 30 }).map((_, i) => (
          <div
            key={i}
            className="absolute bg-newspaper-text h-6"
            style={{
              width: `${Math.random() * 300 + 100}px`,
              top: `${Math.random() * 100}%`,
              left: `${Math.random() * 100}%`,
              transform: `rotate(${Math.random() * 4 - 2}deg)`
            }}
          />
        ))}
      </div>

      <Card className="max-w-4xl w-full p-8 bg-newspaper-bg border-4 border-newspaper-text animate-redacted-reveal relative" style={{ fontFamily: 'serif' }}>
        <div className="absolute top-4 right-4 text-red-600 font-mono text-xs transform rotate-12 border-2 border-red-600 p-2">
          TOP SECRET
        </div>
        <div className="absolute bottom-4 left-4 text-red-600 font-mono text-xs transform -rotate-12 border-2 border-red-600 p-2">
          EYES ONLY
        </div>

        <Button
          onClick={onClose}
          variant="outline"
          className="absolute top-4 left-4 border-newspaper-text text-newspaper-text hover:bg-newspaper-text/10"
        >
          ← BACK TO BASE
        </Button>

        <div className="text-center mb-8 mt-8">
          <h1 className="text-4xl font-bold text-newspaper-text mb-2">
            EXPANSION CONTROL ROOM
          </h1>
          <p className="text-sm text-newspaper-text/80">
            Review the core inventory and MVP-approved expansion packs.
          </p>
          <p className="text-xs text-newspaper-text/60 mt-2">
            Enable or disable packs below. Only ATTACK, MEDIA and ZONE cards that pass the MVP whitelist are eligible for deployment.
          </p>
        </div>

        <div className="grid gap-4 md:grid-cols-3">
          <Card className="p-4 border-2 border-newspaper-text bg-newspaper-bg">
            <div className="text-xs uppercase text-newspaper-text/70">Core Set</div>
            <div className="text-2xl font-bold text-newspaper-text">{coreStats.totalCards}</div>
            <div className="text-xs text-newspaper-text/60">Recovered MVP-ready cards</div>
          </Card>
          <Card className="p-4 border-2 border-newspaper-text bg-newspaper-bg">
            <div className="text-xs uppercase text-newspaper-text/70">Expansions</div>
            <div className="text-2xl font-bold text-newspaper-text">{expansionStats.totalCards}</div>
            <div className="text-xs text-newspaper-text/60">
              {activeExpansionNames ? `Active packs: ${activeExpansionNames}` : 'No expansion packs enabled'}
            </div>
          </Card>
          <Card className="p-4 border-2 border-newspaper-text bg-newspaper-bg">
            <div className="text-xs uppercase text-newspaper-text/70">Total Pool</div>
            <div className="text-2xl font-bold text-newspaper-text">{combinedStats.totalCards}</div>
            <div className="text-xs text-newspaper-text/60">Core + expansions feeding deck builders</div>
          </Card>
        </div>

        <Card className="mt-6 p-6 border-2 border-newspaper-text bg-newspaper-bg">
          <h2 className="font-bold text-xl text-newspaper-text mb-4">Expansion Packs</h2>
          <div className="space-y-3 text-sm text-newspaper-text">
            {expansionDetails.map(detail => {
              const isUpdating = pendingUpdates[detail.id];
              return (
                <div key={detail.id} className="flex flex-col gap-1 border border-dashed border-newspaper-text/30 p-3 rounded">
                  <div className="flex items-center justify-between">
                    <span className="font-semibold">{detail.title}</span>
                    <div className="flex items-center gap-3">
                      <Badge variant="outline">{detail.count} cards</Badge>
                      <Checkbox
                        checked={detail.enabled}
                        onCheckedChange={() => handleExpansionToggle(detail.id)}
                        disabled={!!isUpdating}
                        aria-label={`Toggle ${detail.title}`}
                      />
                    </div>
                  </div>
                  <div className="text-xs text-newspaper-text/70">
                    {detail.enabled
                      ? 'Included in MVP deck construction.'
                      : 'Disabled — excluded from automated deck builders.'}
                  </div>
                  {isUpdating && <div className="text-xs text-newspaper-text/60">Updating expansion pool…</div>}
                </div>
              );
            })}
          </div>
          <div className="mt-3 text-xs text-newspaper-text/70 space-y-1">
            <div>Total expansion cards loaded: {expansionTotal}</div>
            {updateError && <div className="text-red-600">{updateError}</div>}
            {hasPendingUpdates && <div>Synchronizing selection…</div>}
          </div>
        </Card>

        <Card className="mt-6 p-6 border-2 border-newspaper-text bg-newspaper-bg">
          <div className="flex items-center justify-between gap-3 mb-4">
            <h2 className="font-bold text-xl text-newspaper-text">Distribution Controls</h2>
            {!distributionLoading && (
              <Badge variant="outline" className="uppercase tracking-wide">
                Mode: {currentModeLabel}
              </Badge>
            )}
          </div>
          {distributionLoading ? (
            <div className="text-sm text-newspaper-text/70">Loading deck distribution controls…</div>
          ) : (
            <Tabs defaultValue="mode" className="w-full">
              <TabsList className="grid w-full grid-cols-4 bg-newspaper-bg border border-newspaper-text text-newspaper-text">
                <TabsTrigger
                  value="mode"
                  className="data-[state=active]:bg-newspaper-text data-[state=active]:text-newspaper-bg"
                >
                  Mode
                </TabsTrigger>
                <TabsTrigger
                  value="weights"
                  className="data-[state=active]:bg-newspaper-text data-[state=active]:text-newspaper-bg"
                >
                  Weights
                </TabsTrigger>
                <TabsTrigger
                  value="balance"
                  className="data-[state=active]:bg-newspaper-text data-[state=active]:text-newspaper-bg"
                >
                  Balance
                </TabsTrigger>
                <TabsTrigger
                  value="preview"
                  className="data-[state=active]:bg-newspaper-text data-[state=active]:text-newspaper-bg"
                >
                  Preview
                </TabsTrigger>
              </TabsList>

              <TabsContent value="mode" className="mt-4">
                <div className="space-y-4 text-sm text-newspaper-text">
                  <p className="text-xs text-newspaper-text/70">
                    Choose which sets feed automated deck construction.
                  </p>
                  <RadioGroup
                    value={settings.mode}
                    onValueChange={value => setMode(value as DistributionMode)}
                    className="space-y-3"
                  >
                    {modeOptions.map(option => {
                      const optionId = `distribution-mode-${option.value}`;
                      return (
                        <div
                          key={option.value}
                          className={`flex items-start gap-3 rounded border border-newspaper-text/30 p-3 ${
                            option.disabled ? 'opacity-60' : ''
                          }`}
                        >
                          <RadioGroupItem value={option.value} id={optionId} disabled={option.disabled} />
                          <div>
                            <Label
                              htmlFor={optionId}
                              className="text-sm font-semibold uppercase tracking-wide text-newspaper-text"
                            >
                              {option.label}
                            </Label>
                            <p className="text-xs text-newspaper-text/70 mt-1">{option.description}</p>
                          </div>
                        </div>
                      );
                    })}
                  </RadioGroup>
                  {!hasActiveExpansions && (
                    <div className="text-xs text-newspaper-text/60 border border-dashed border-newspaper-text/40 rounded p-3">
                      Enable at least one expansion pack to unlock cross-set strategies.
                    </div>
                  )}
                </div>
              </TabsContent>

              <TabsContent value="weights" className="mt-4">
                <div className="space-y-5 text-sm text-newspaper-text">
                  <p className="text-xs text-newspaper-text/70">
                    {settings.mode === 'custom'
                      ? 'Adjust the weighting per set to bias upcoming simulations.'
                      : 'Switch to Custom Mix mode to edit per-set weights.'}
                  </p>
                  <div className="space-y-4">
                    {activeSets.map(set => {
                      const sliderId = `set-weight-${set.id}`;
                      const value = settings.setWeights[set.id] ?? 0;
                      const disabled = settings.mode !== 'custom';
                      return (
                        <div key={set.id} className="space-y-2">
                          <div className="flex items-center justify-between gap-3">
                            <div>
                              <Label
                                htmlFor={sliderId}
                                className="font-semibold uppercase tracking-wide text-newspaper-text"
                              >
                                {set.name}
                              </Label>
                              <p className="text-xs text-newspaper-text/60">
                                {set.isCore ? 'Baseline core supply' : 'Expansion supply'}
                              </p>
                            </div>
                            <Badge variant="outline">{value.toFixed(2)}×</Badge>
                          </div>
                          <Slider
                            id={sliderId}
                            value={[value]}
                            min={0}
                            max={3}
                            step={0.05}
                            disabled={disabled}
                            onValueChange={([val]) => setSetWeight(set.id, val)}
                          />
                        </div>
                      );
                    })}
                  </div>
                  {!hasActiveExpansions && (
                    <div className="text-xs text-newspaper-text/60 border border-dashed border-newspaper-text/40 rounded p-3">
                      Expansion sliders appear once a pack is active.
                    </div>
                  )}
                  <div className="border border-dashed border-newspaper-text/30 rounded p-4 space-y-3">
                    <div className="text-xs font-semibold uppercase text-newspaper-text/70">Rarity Mix</div>
                    {RARITY_ORDER.map(rarity => {
                      const sliderId = `rarity-target-${rarity}`;
                      const value = settings.rarityTargets[rarity] ?? 0;
                      return (
                        <div key={rarity} className="space-y-2">
                          <div className="flex items-center justify-between gap-3">
                            <Label htmlFor={sliderId} className="uppercase text-newspaper-text">
                              {rarity}
                            </Label>
                            <Badge variant="outline">{Math.round(value * 100)}%</Badge>
                          </div>
                          <Slider
                            id={sliderId}
                            value={[value]}
                            min={0}
                            max={1}
                            step={0.01}
                            onValueChange={([val]) => setRarityTarget(rarity, val)}
                          />
                        </div>
                      );
                    })}
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="balance" className="mt-4">
                <div className="space-y-5 text-sm text-newspaper-text">
                  <div className="flex flex-col gap-3 rounded border border-newspaper-text/30 p-4 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                      <div className="text-sm font-semibold uppercase text-newspaper-text">Type Balancing</div>
                      <p className="text-xs text-newspaper-text/60">
                        Prevent any MVP type from exceeding {Math.round(settings.typeBalancing.maxTypeRatio * 100)}% of the deck.
                      </p>
                    </div>
                    <Switch
                      checked={settings.typeBalancing.enabled}
                      onCheckedChange={() => toggleTypeBalancing()}
                    />
                  </div>

                  <div className="space-y-3">
                    <Label className="uppercase text-newspaper-text">
                      Duplicate Limit: {settings.duplicateLimit}
                    </Label>
                    <Slider
                      value={[settings.duplicateLimit]}
                      min={1}
                      max={5}
                      step={1}
                      onValueChange={([val]) => setDuplicateLimit(val)}
                    />
                  </div>

                  <div className="space-y-3">
                    <Label className="uppercase text-newspaper-text">
                      Early Seed Count: {settings.earlySeedCount}
                    </Label>
                    <Slider
                      value={[settings.earlySeedCount]}
                      min={0}
                      max={10}
                      step={1}
                      onValueChange={([val]) => setEarlySeedCount(val)}
                    />
                  </div>

                  <div className="flex flex-wrap items-center gap-3 text-xs text-newspaper-text/70">
                    <Badge variant="outline">Type Balancing: {settings.typeBalancing.enabled ? 'On' : 'Off'}</Badge>
                    <Badge variant="outline">Duplicate Cap: {settings.duplicateLimit}</Badge>
                    <Badge variant="outline">Early Seeds: {settings.earlySeedCount}</Badge>
                  </div>

                  <Button
                    variant="outline"
                    onClick={() => resetToDefaults()}
                    className="border-newspaper-text text-newspaper-text hover:bg-newspaper-text/10"
                  >
                    Reset Distribution Defaults
                  </Button>
                </div>
              </TabsContent>

              <TabsContent value="preview" className="mt-4">
                <div className="space-y-5 text-sm text-newspaper-text">
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <p className="text-xs text-newspaper-text/70">
                      Preview the simulated deck mix using the current configuration.
                    </p>
                    <Button
                      variant="outline"
                      onClick={() => refreshSimulation(500)}
                      disabled={isSimulating}
                      className="border-newspaper-text text-newspaper-text hover:bg-newspaper-text/10"
                    >
                      {isSimulating ? 'Simulating…' : 'Refresh Preview'}
                    </Button>
                  </div>

                  {!simulationResults && (
                    <div className="text-xs text-newspaper-text/60">
                      Simulation results will populate after the first run completes.
                    </div>
                  )}

                  {simulationResults && (
                    <div className="space-y-4">
                      <div>
                        <div className="text-xs font-semibold uppercase text-newspaper-text/70 mb-2">Set Mix</div>
                        {simulationSetRows.length === 0 ? (
                          <div className="text-xs text-newspaper-text/60">No cards available for preview.</div>
                        ) : (
                          <div className="space-y-2">
                            {simulationSetRows.map(row => (
                              <div key={row.id} className="space-y-1">
                                <div className="flex items-center justify-between text-xs">
                                  <span className="font-semibold">{row.label}</span>
                                  <span>
                                    {row.average.toFixed(1)} cards / deck ({row.percent.toFixed(1)}%)
                                  </span>
                                </div>
                                <Progress value={row.percent} className="h-2 bg-newspaper-text/10" />
                              </div>
                            ))}
                          </div>
                        )}
                      </div>

                      <div>
                        <div className="text-xs font-semibold uppercase text-newspaper-text/70 mb-2">Type Spread</div>
                        {simulationTypeRows.length === 0 ? (
                          <div className="text-xs text-newspaper-text/60">No MVP type data yet.</div>
                        ) : (
                          <div className="grid gap-2 sm:grid-cols-3 text-xs">
                            {simulationTypeRows.map(row => (
                              <div key={row.type} className="border border-newspaper-text/30 rounded p-3 space-y-1">
                                <div className="font-semibold uppercase">{row.type}</div>
                                <div>{row.average.toFixed(1)} cards / deck</div>
                                <div>{row.percent.toFixed(1)}%</div>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>

                      <div>
                        <div className="text-xs font-semibold uppercase text-newspaper-text/70 mb-2">Rarity Outlook</div>
                        {simulationRarityRows.length === 0 ? (
                          <div className="text-xs text-newspaper-text/60">Rarity data unavailable.</div>
                        ) : (
                          <div className="space-y-2">
                            {simulationRarityRows.map(row => (
                              <div key={row.rarity} className="space-y-1">
                                <div className="flex items-center justify-between text-xs">
                                  <span className="uppercase">{row.rarity}</span>
                                  <span>{row.percent.toFixed(1)}%</span>
                                </div>
                                <Progress value={row.percent} className="h-2 bg-newspaper-text/10" />
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              </TabsContent>
            </Tabs>
          )}
        </Card>

        <div className="grid gap-6 md:grid-cols-2 mt-6">
          <Card className="p-6 border-2 border-newspaper-text bg-newspaper-bg">
            <h2 className="font-bold text-xl text-newspaper-text mb-4">Faction Breakdown</h2>
            <div className="grid gap-4 md:grid-cols-2 text-sm text-newspaper-text">
              <div>
                <div className="text-xs uppercase text-newspaper-text/60 mb-2">Core</div>
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span>Truth Seekers</span>
                    <Badge variant="outline">{coreStats.factions.truth}</Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>Government</span>
                    <Badge variant="outline">{coreStats.factions.government}</Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>Neutral</span>
                    <Badge variant="outline">{coreStats.factions.neutral}</Badge>
                  </div>
                </div>
              </div>
              <div>
                <div className="text-xs uppercase text-newspaper-text/60 mb-2">Expansions</div>
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span>Truth Seekers</span>
                    <Badge variant="outline">{expansionStats.factions.truth}</Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>Government</span>
                    <Badge variant="outline">{expansionStats.factions.government}</Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>Neutral</span>
                    <Badge variant="outline">{expansionStats.factions.neutral}</Badge>
                  </div>
                </div>
              </div>
            </div>
          </Card>

          <Card className="p-6 border-2 border-newspaper-text bg-newspaper-bg">
            <h2 className="font-bold text-xl text-newspaper-text mb-4">Type Inventory</h2>
            <div className="space-y-3 text-sm text-newspaper-text">
              {typeKeys.map(type => (
                <div key={type} className="flex items-center justify-between">
                  <span className="uppercase">{type}</span>
                  <div className="flex items-center gap-2">
                    <Badge variant="outline">Core {coreTypeMap.get(type) ?? 0}</Badge>
                    <Badge variant="outline">Exp {expansionTypeMap.get(type) ?? 0}</Badge>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </div>

        <Card className="mt-6 p-6 border-2 border-newspaper-text bg-newspaper-bg">
          <h2 className="font-bold text-xl text-newspaper-text mb-4">Rarity Spread</h2>
          <div className="space-y-3 text-sm text-newspaper-text">
            {rarityKeys.length === 0 && <div>No rarities assigned yet.</div>}
            {rarityKeys.map(rarity => (
              <div key={rarity} className="flex items-center justify-between">
                <span className="uppercase font-semibold">{rarity}</span>
                <div className="flex items-center gap-2">
                  <Badge variant="outline">Core {coreRarityMap.get(rarity) ?? 0}</Badge>
                  <Badge variant="outline">Exp {expansionRarityMap.get(rarity) ?? 0}</Badge>
                </div>
              </div>
            ))}
          </div>
        </Card>

        <div className="mt-6 text-sm text-newspaper-text/80 space-y-2">
          <p>Total MVP-ready cards: {combinedStats.totalCards}</p>
          <p>
            Expansion selections persist locally. Deck builders draw from the combined pool once packs are enabled.
          </p>
          <p>
            Keep new content within the MVP whitelist—ATTACK, MEDIA, and ZONE templates with baseline costs—to stay compatible with automated validation.
          </p>
        </div>
      </Card>
    </div>
  );
};

export default ManageExpansions;
