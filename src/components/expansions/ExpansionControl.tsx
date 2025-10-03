import { useEffect, useMemo, useState, useCallback, useRef } from 'react';
import {
  Card as UICard,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Slider } from '@/components/ui/slider';
import { Separator } from '@/components/ui/separator';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible';
import { ChevronDown } from 'lucide-react';
import { buildDeck, buildSets, type Card, type MixMode } from '@/lib/decks/expansions';
import { summarizeSet } from '@/lib/decks/analytics';
import { discoverExpansions, type DiscoveredExpansion } from '@/lib/expansions/discover';
import { loadPrefs, savePrefs } from '@/lib/persist';
import { getCoreCards } from '@/data/cardDatabase';
import type { GameCard } from '@/rules/mvp';
import { cn } from '@/lib/utils';
import {
  setEditorsExpansionEnabled,
  updateEnabledExpansions,
} from '@/data/expansions/state';
import {
  getExpansionFeaturesSnapshot,
  hydrateExpansionFeatures,
  type ExpansionFeatureState,
} from '@/data/expansions/features';
import { useDistributionSettings } from '@/hooks/useDistributionSettings';
import type { DistributionMode } from '@/data/weightedCardDistribution';

const DEFAULT_MODE: MixMode = 'BALANCED_MIX';
const DEFAULT_WEIGHT = 100;
const SYNC_ERROR_MESSAGE = 'Failed to update enabled expansions. Please try again.';

const toCard = (card: GameCard): Card => ({
  ...(card as Card),
  extId: (card as Card).extId ?? 'core',
  _setId: (card as Card)._setId ?? 'core',
  _setName: (card as Card)._setName ?? 'Core Deck',
});

type StoredPrefs = {
  mode?: MixMode;
  enabled?: Record<string, boolean>;
  customWeights?: Record<string, number>;
  features?: Partial<ExpansionFeatureState>;
};

type ExpansionEntry = DiscoveredExpansion & {
  enabled: boolean;
  weight: number;
};

type PreviewState = {
  weights: Record<string, number>;
  poolsRemaining: Record<string, number>;
  deckSize: number;
};

interface ExpansionControlProps {
  onClose?: () => void;
}

const mixModes: Array<{ value: MixMode; label: string; description: string }> = [
  { value: 'CORE_ONLY', label: 'Core Only', description: 'Pure baseline experience.' },
  { value: 'BALANCED_MIX', label: 'Balanced Mix', description: 'Core floor with even expansion share.' },
  { value: 'EXPANSION_ONLY', label: 'Expansion Only', description: 'Only enabled packs.' },
  { value: 'CUSTOM_MIX', label: 'Custom Mix', description: 'Tune per-pack weights manually.' },
];

const buildEnabledMap = (entries: ExpansionEntry[]) =>
  entries.reduce<Record<string, boolean>>((acc, entry) => {
    acc[entry.id] = entry.enabled;
    return acc;
  }, {});

const buildWeightMap = (entries: ExpansionEntry[], coreWeight: number) => {
  const map: Record<string, number> = { core: coreWeight };
  for (const entry of entries) {
    map[entry.id] = entry.weight;
  }
  return map;
};

const coreCardsForPreview = (): Card[] => getCoreCards().map(toCard);

const mixModeToDistribution: Record<MixMode, DistributionMode> = {
  CORE_ONLY: 'core-only',
  BALANCED_MIX: 'balanced',
  EXPANSION_ONLY: 'expansion-only',
  CUSTOM_MIX: 'custom',
};

const distributionToMixMode = (mode?: DistributionMode): MixMode => {
  if (!mode) return DEFAULT_MODE;
  switch (mode) {
    case 'core-only':
      return 'CORE_ONLY';
    case 'expansion-only':
      return 'EXPANSION_ONLY';
    case 'custom':
      return 'CUSTOM_MIX';
    case 'balanced':
    default:
      return 'BALANCED_MIX';
  }
};

const toDistributionWeight = (uiWeight: number): number => {
  if (typeof uiWeight !== 'number' || !Number.isFinite(uiWeight)) {
    return 0;
  }
  return Math.max(0, uiWeight / DEFAULT_WEIGHT);
};

const fromDistributionWeight = (weight?: number): number | undefined => {
  if (typeof weight !== 'number' || !Number.isFinite(weight)) {
    return undefined;
  }
  return weight * DEFAULT_WEIGHT;
};

const buildPreview = (
  coreCards: Card[],
  expansions: ExpansionEntry[],
  mode: MixMode,
  weights: Record<string, number>,
): PreviewState => {
  const sets = buildSets(
    coreCards,
    expansions.map(expansion => ({
      id: expansion.id,
      name: expansion.name,
      enabled: expansion.enabled,
      weight: expansion.weight,
      cards: expansion.cards,
    })),
  );

  const result = buildDeck({ sets, mode, customWeights: weights, deckSize: 40 });

  return {
    weights: result.weights,
    poolsRemaining: result.poolsRemaining,
    deckSize: result.deck.length,
  };
};

const ExpansionControl = ({ onClose }: ExpansionControlProps) => {
  const { settings, setMode: setDistributionMode, setSetWeight } = useDistributionSettings();

  const [mode, setLocalMode] = useState<MixMode>(() => distributionToMixMode(settings.mode));
  const [coreWeight, setCoreWeight] = useState<number>(
    () => fromDistributionWeight(settings.setWeights.core) ?? DEFAULT_WEIGHT,
  );
  const [expansions, setExpansions] = useState<ExpansionEntry[]>([]);
  const [preview, setPreview] = useState<PreviewState>({ weights: {}, poolsRemaining: {}, deckSize: 0 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [editorsEnabled, setEditorsEnabled] = useState<boolean>(
    () => getExpansionFeaturesSnapshot().editors,
  );
  const initializedRef = useRef(false);

  const coreCards = useMemo(() => coreCardsForPreview(), []);

  const recalcPreview = useCallback(
    (nextMode: MixMode, nextEntries: ExpansionEntry[], customCoreWeight?: number) => {
      const weights = buildWeightMap(nextEntries, customCoreWeight ?? coreWeight);
      setPreview(buildPreview(coreCards, nextEntries, nextMode, weights));
    },
    [coreCards, coreWeight],
  );

  useEffect(() => {
    const nextMode = distributionToMixMode(settings.mode);
    setLocalMode(prev => (prev === nextMode ? prev : nextMode));
  }, [settings.mode]);

  useEffect(() => {
    const resolvedCoreWeight = fromDistributionWeight(settings.setWeights.core);
    if (typeof resolvedCoreWeight === 'number' && !Number.isNaN(resolvedCoreWeight)) {
      setCoreWeight(prev => (Math.abs(prev - resolvedCoreWeight) < 0.01 ? prev : resolvedCoreWeight));
    }
  }, [settings.setWeights.core]);

  useEffect(() => {
    setExpansions(prev => {
      if (prev.length === 0) {
        return prev;
      }

      let changed = false;
      const next = prev.map(entry => {
        const hookWeight = fromDistributionWeight(settings.setWeights[entry.id]);
        if (typeof hookWeight !== 'number') {
          return entry;
        }
        if (Math.abs(entry.weight - hookWeight) <= 0.5) {
          return entry;
        }
        changed = true;
        return { ...entry, weight: hookWeight };
      });

      return changed ? next : prev;
    });
  }, [settings.setWeights]);

  useEffect(() => {
    if (initializedRef.current) {
      return;
    }
    initializedRef.current = true;

    let cancelled = false;

    const init = async () => {
      setLoading(true);
      setError(null);

      try {
        const prefs = (loadPrefs<StoredPrefs>() ?? {}) as StoredPrefs;
        const enabled = prefs.enabled ?? {};
        const weights = prefs.customWeights ?? {};
        const features = hydrateExpansionFeatures(prefs.features);
        setEditorsEnabled(features.editors);
        const hookCoreWeight = fromDistributionWeight(settings.setWeights.core);
        const resolvedCoreWeight =
          typeof hookCoreWeight === 'number' ? hookCoreWeight : weights.core ?? DEFAULT_WEIGHT;
        setCoreWeight(resolvedCoreWeight);
        const initialMode = distributionToMixMode(settings.mode);

        const discovered = await discoverExpansions();
        if (cancelled) return;

        const entries: ExpansionEntry[] = discovered.map(expansion => ({
          ...expansion,
          enabled: Boolean(enabled[expansion.id]),
          weight:
            fromDistributionWeight(settings.setWeights[expansion.id]) ??
            (typeof weights[expansion.id] === 'number' ? weights[expansion.id] : DEFAULT_WEIGHT),
        }));

        setExpansions(entries);
        recalcPreview(initialMode, entries, resolvedCoreWeight);
      } catch (err) {
        console.warn('[ExpansionControl] failed to load expansions', err);
        if (!cancelled) {
          setError('Failed to load expansions.');
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    };

    void init();

    return () => {
      cancelled = true;
    };
  }, [recalcPreview, settings.mode, settings.setWeights]);

  const applyDistributionWeights = useCallback(
    (entries: ExpansionEntry[]) => {
      const distributionCoreWeight = toDistributionWeight(coreWeight);
      setSetWeight('core', distributionCoreWeight);
      for (const entry of entries) {
        if (!entry.enabled) continue;
        setSetWeight(entry.id, toDistributionWeight(entry.weight));
      }
    },
    [coreWeight, setSetWeight],
  );

  const persist = useCallback(
    (nextMode: MixMode, nextEntries: ExpansionEntry[]) => {
      const featurePrefs = getExpansionFeaturesSnapshot();
      const prefs: StoredPrefs = {
        mode: nextMode,
        enabled: buildEnabledMap(nextEntries),
        customWeights: buildWeightMap(nextEntries, coreWeight),
        features: featurePrefs,
      };
      savePrefs(prefs);
      applyDistributionWeights(nextEntries);
      const enabledIds = nextEntries.filter(entry => entry.enabled).map(entry => entry.id);
      void updateEnabledExpansions(enabledIds)
        .then(() => {
          applyDistributionWeights(nextEntries);
          setError(prev => (prev === SYNC_ERROR_MESSAGE ? null : prev));
        })
        .catch(err => {
          console.error('[ExpansionControl] failed to sync enabled expansions', err);
          setError(prev =>
            prev && prev !== SYNC_ERROR_MESSAGE ? prev : SYNC_ERROR_MESSAGE,
          );
        });
      recalcPreview(nextMode, nextEntries);
    },
    [applyDistributionWeights, coreWeight, recalcPreview],
  );

  const handleToggle = useCallback(
    (id: string) => {
      setExpansions(prev => {
        const next = prev.map(entry =>
          entry.id === id
            ? { ...entry, enabled: !entry.enabled }
            : entry,
        );
        persist(mode, next);
        return next;
      });
    },
    [mode, persist],
  );

  const handleWeightChange = useCallback(
    (id: string, value: number) => {
      setExpansions(prev => {
        const next = prev.map(entry =>
          entry.id === id
            ? { ...entry, weight: value }
            : entry,
        );
        persist(mode, next);
        return next;
      });
    },
    [mode, persist],
  );

  const handleModeChange = useCallback(
    (nextMode: MixMode) => {
      setLocalMode(nextMode);
      setDistributionMode(mixModeToDistribution[nextMode]);
      persist(nextMode, expansions);
    },
    [expansions, persist, setDistributionMode],
  );

  const handleEditorsToggle = useCallback(
    (nextEnabled: boolean) => {
      setEditorsEnabled(nextEnabled);
      setEditorsExpansionEnabled(nextEnabled);
      setError(prev => (prev === SYNC_ERROR_MESSAGE ? null : prev));
    },
    [],
  );

  useEffect(() => {
    recalcPreview(mode, expansions);
  }, [mode, expansions, recalcPreview]);

  const totalCards = useMemo(() => {
    const coreCount = coreCards.length;
    const expansionCount = expansions
      .filter(entry => entry.enabled)
      .reduce((sum, entry) => sum + entry.cards.length, 0);
    return { core: coreCount, expansions: expansionCount, total: coreCount + expansionCount };
  }, [coreCards.length, expansions]);

  const hasAnyExpansions = expansions.length > 0;
  const hasEnabledExpansions = expansions.some(entry => entry.enabled);

  // [EDITORS_EXPANSION_TOGGLE]
  const editorsToggleCard = (
    <UICard>
      <CardHeader>
        <CardTitle>Editors</CardTitle>
        <CardDescription>Gate the Editors mini-expansion behind a dedicated toggle.</CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="space-y-1 text-sm text-newspaper-text/70">
          <p>Require an Editor selection before a new campaign begins.</p>
          <p className="text-xs text-newspaper-text/60">
            Disable this to skip the newsroom modal during game setup.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-xs font-semibold uppercase tracking-wide text-newspaper-text/60">
            {editorsEnabled ? 'Enabled' : 'Disabled'}
          </span>
          <Switch
            checked={editorsEnabled}
            onCheckedChange={handleEditorsToggle}
            aria-label="Toggle Editors mini-expansion"
          />
        </div>
      </CardContent>
    </UICard>
  );

  return (
    <div className="min-h-screen bg-newspaper-bg py-8 px-4">
      <div className="mx-auto flex w-full max-w-5xl flex-col gap-6">
        <header className="flex items-start justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-newspaper-text">Expansion Control Room</h1>
            <p className="text-sm text-newspaper-text/70">
              Configure which packs feed deck construction and preview the resulting mix.
            </p>
          </div>
          {onClose && (
            <Button variant="outline" onClick={onClose} aria-label="Close Expansion Control Room">
              Close
            </Button>
          )}
        </header>

        {error && (
          <UICard className="border-red-500/60 bg-red-500/5">
            <CardContent className="py-4 text-sm text-red-600">{error}</CardContent>
          </UICard>
        )}

        <div className="grid gap-4 md:grid-cols-2">
          <UICard>
            <CardHeader>
              <CardTitle>Core Deck</CardTitle>
              <CardDescription>Always available and compliant with MVP rules.</CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col gap-3">
              <Badge variant="outline" className="w-fit">
                {coreCards.length} cards
              </Badge>
              <p className="text-sm text-newspaper-text/70">
                Baseline ATTACK / MEDIA / ZONE cards. This supply is always included to guarantee a stable foundation.
              </p>
            </CardContent>
          </UICard>

          <UICard>
            <CardHeader>
              <CardTitle>Mix Mode</CardTitle>
              <CardDescription>Select how the deck builder combines sets.</CardDescription>
            </CardHeader>
            <CardContent className="grid gap-2">
              {mixModes.map(option => (
                <Button
                  key={option.value}
                  variant={mode === option.value ? 'default' : 'outline'}
                  className={cn('justify-start text-left', mode === option.value ? '' : 'bg-transparent')}
                  onClick={() => handleModeChange(option.value)}
                  disabled={
                    (option.value === 'EXPANSION_ONLY' || option.value === 'CUSTOM_MIX') && !hasAnyExpansions
                  }
                  aria-pressed={mode === option.value}
                >
                  <div>
                    <div className="font-semibold">{option.label}</div>
                    <div className="text-xs text-newspaper-text/70">{option.description}</div>
                  </div>
                </Button>
              ))}
            </CardContent>
          </UICard>
        </div>

        {editorsToggleCard}

        <section>
          <div className="flex items-center justify-between gap-2">
            <h2 className="text-xl font-semibold text-newspaper-text">Expansion Packs</h2>
            <Badge variant="outline" className="whitespace-nowrap text-xs">
              {expansions.length} detected
            </Badge>
          </div>
          <p className="mt-1 text-sm text-newspaper-text/70">
            Toggle expansions on or off. Custom weights appear when using the Custom Mix mode.
          </p>

          {loading ? (
            <UICard className="mt-4">
              <CardContent className="py-6 text-center text-sm text-newspaper-text/70">Scanning extensions…</CardContent>
            </UICard>
          ) : (
            <div className="mt-4 grid gap-4 md:grid-cols-2">
              {expansions.map(entry => {
                const summary = summarizeSet(entry.cards);
                return (
                  <Collapsible key={entry.id} defaultOpen={entry.enabled}>
                    <UICard className="border-newspaper-text/20 bg-newspaper-bg">
                      <CardHeader className="flex flex-row items-start justify-between gap-3">
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <CollapsibleTrigger asChild>
                              <button
                                type="button"
                                className="flex items-center gap-2 text-left font-semibold text-newspaper-text"
                                aria-label={`Toggle details for ${entry.name}`}
                              >
                                <ChevronDown className="h-4 w-4" aria-hidden="true" />
                                <span>{entry.name}</span>
                              </button>
                            </CollapsibleTrigger>
                            <Badge variant="outline" className="text-xs">
                              {entry.cards.length} cards
                            </Badge>
                          </div>
                          <div className="text-xs text-newspaper-text/70">
                            {entry.description ?? 'No description provided.'}
                          </div>
                        </div>
                        <Switch
                          checked={entry.enabled}
                          onCheckedChange={() => handleToggle(entry.id)}
                          aria-label={`Enable ${entry.name}`}
                        />
                      </CardHeader>
                      <CollapsibleContent>
                        <CardContent className="space-y-4 text-sm text-newspaper-text/80">
                          <div className="grid grid-cols-2 gap-3 text-xs">
                            <div>
                              <div className="font-semibold text-newspaper-text">Type spread</div>
                              <div className="mt-1 space-y-1">
                                {(['ATTACK', 'MEDIA', 'ZONE'] as const).map(key => (
                                  <div key={key} className="flex justify-between">
                                    <span>{key}</span>
                                    <span className="tabular-nums">{summary.byType[key]}</span>
                                  </div>
                                ))}
                              </div>
                            </div>
                            <div>
                              <div className="font-semibold text-newspaper-text">Rarity</div>
                              <div className="mt-1 space-y-1">
                                {(['common', 'uncommon', 'rare', 'legendary'] as const).map(key => (
                                  <div key={key} className="flex justify-between">
                                    <span className="capitalize">{key}</span>
                                    <span className="tabular-nums">{summary.byRarity[key]}</span>
                                  </div>
                                ))}
                              </div>
                            </div>
                          </div>

                          <div className="text-xs text-newspaper-text/60">
                            File: {entry.fileName}
                            {entry.version ? ` • v${entry.version}` : ''}
                            {entry.author ? ` • ${entry.author}` : ''}
                          </div>

                          {mode === 'CUSTOM_MIX' && (
                            <div className="space-y-2">
                              <div className="flex items-center justify-between text-xs text-newspaper-text/70">
                                <span>Weight</span>
                                <span className="tabular-nums">{entry.weight}</span>
                              </div>
                              <Slider
                                value={[entry.weight]}
                                onValueChange={values => handleWeightChange(entry.id, values[0] ?? DEFAULT_WEIGHT)}
                                min={0}
                                max={300}
                                step={5}
                                aria-label={`Weight for ${entry.name}`}
                              />
                            </div>
                          )}
                        </CardContent>
                      </CollapsibleContent>
                    </UICard>
                  </Collapsible>
                );
              })}
            </div>
          )}
        </section>

        <UICard>
          <CardHeader>
            <CardTitle>Mix Preview</CardTitle>
            <CardDescription>
              Estimated share per set based on current selections. {preview.deckSize} unique cards available for draws.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-3">
              {[{ id: 'core', name: 'Core Deck' }, ...expansions.map(entry => ({ id: entry.id, name: entry.name }))]
                .filter(entry => preview.weights[entry.id] !== undefined)
                .map(entry => {
                  const weight = preview.weights[entry.id] ?? 0;
                  return (
                    <div key={entry.id} className="space-y-1">
                      <div className="flex items-center justify-between text-sm text-newspaper-text">
                        <span>{entry.name}</span>
                        <span className="tabular-nums">{Math.round(weight * 100)}%</span>
                      </div>
                      <div className="h-2 rounded-full bg-newspaper-text/10">
                        <div
                          className="h-full rounded-full bg-newspaper-text"
                          style={{ width: `${Math.max(4, weight * 100)}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
            </div>

            <Separator />

            <div className="text-xs text-newspaper-text/70">
              Cards remaining in pools after build:{' '}
              {Object.values(preview.poolsRemaining).reduce((sum, value) => sum + value, 0)}
            </div>
            <div className="text-xs text-newspaper-text/70">
              Active pool size: core {totalCards.core} • expansions {totalCards.expansions} • total {totalCards.total}
            </div>
          </CardContent>
        </UICard>

        <div className="flex justify-end">
          <Button variant="secondary" onClick={onClose} disabled={!onClose} aria-label="Close Expansion Control">
            {onClose ? 'Save & Close' : 'Done'}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default ExpansionControl;
