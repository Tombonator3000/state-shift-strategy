import hotspotsCatalog from '@/data/hotspots.catalog.json';
import hotspotsConfig from '@/data/hotspots.config.json';
import cryptidHomeStates from '@/data/cryptids.homestate.json';
import { USA_STATES } from '@/data/usaStates';
import type { GameState } from '@/hooks/gameStateTypes';
import { getEnabledExpansionIdsSnapshot } from '@/data/expansions/state';

export interface HotspotWeightBreakdown {
  base: number;
  catalog: number;
  type: number;
  expansion: number;
  cryptid: number;
}

export type HotspotKind =
  | 'normal'
  | 'ufo'
  | 'ghost'
  | 'elvis'
  | 'cryptid';

export interface Hotspot {
  id: string;
  name: string;
  kind: HotspotKind;
  location: string;
  intensity: number;
  status: 'spawning' | 'active' | 'resolved' | 'expired';
  tags: string[];
  icon?: string;
  expansionTag?: string;
  stateId?: string;
  stateName?: string;
  stateAbbreviation?: string;
  totalWeight?: number;
  weightBreakdown?: HotspotWeightBreakdown;
  truthDelta?: number;
  summary?: string;
  truthRewardHint?: number;
}

export interface HotspotExtraArticle {
  id: string;
  kind: HotspotKind;
  stateName: string;
  stateAbbreviation?: string;
  badgeLabel: string;
  badgeClassName: string;
  headline: string;
  blurb: string;
  intensity: number;
}

type HotspotCatalog = typeof hotspotsCatalog;
type HotspotConfig = typeof hotspotsConfig;
type CryptidHomeState = typeof cryptidHomeStates;

interface CryptidSignatureRecord {
  stateName: string;
  abbreviation?: string;
  name: string;
  slug: string;
}

const STATE_NAME_TO_ABBR = new Map<string, string>();
for (const state of USA_STATES) {
  if (!state || typeof state.name !== 'string' || typeof state.abbreviation !== 'string') {
    continue;
  }
  const nameKey = state.name.trim().toUpperCase();
  const abbrValue = state.abbreviation.trim().toUpperCase();
  if (!nameKey || !abbrValue) {
    continue;
  }
  STATE_NAME_TO_ABBR.set(nameKey, abbrValue);
}

interface ExpansionModifierConfig {
  multiplier?: number;
  flat?: number;
  stateWeights: Record<string, number>;
}

type SpawnKindKey = HotspotKind | 'default';

type SpawnKindWeights = Partial<Record<SpawnKindKey, number>>;

interface SpawnConfig {
  defaults?: {
    spawnRate?: number;
  };
  baseWeights: {
    default: SpawnKindWeights;
    states: Record<string, SpawnKindWeights>;
  };
  expansionModifiers: Record<string, ExpansionModifierConfig>;
  cryptidHomeStateBoost: {
    base: number;
    perCryptid: number;
    max: number;
  };
}

interface HotspotBadgeDefinition {
  className: string;
}

interface HotspotUiConfig {
  badges: Record<string, HotspotBadgeDefinition>;
  blurbs: Record<string, string[]>;
}

const DEFAULT_BADGE_CLASS = 'bg-purple-950/80 border-purple-400/70 text-purple-100';

const DEFAULT_BLURB_TEMPLATE = 'Sensors flag a {KIND} ripple over {STATE_TITLE}. Intensity {INTENSITY}.';

interface TruthRewardRangeConfig {
  base?: number;
  min?: number;
  max?: number;
}

interface TruthRewardKindConfig extends TruthRewardRangeConfig {
  basePercent?: number;
  minPercent?: number;
  maxPercent?: number;
  expansionBonus?: Partial<Record<string, number>>;
}

interface TruthRewardExpansionLegacyStateConfig extends TruthRewardRangeConfig {
  flat?: number;
  multiplier?: number;
  faction?: Partial<Record<'truth' | 'government', number>>;
}

interface TruthRewardExpansionConfig {
  flat?: number;
  multiplier?: number;
  faction?: Partial<Record<'truth' | 'government', number>>;
  states?: Record<string, number | TruthRewardExpansionLegacyStateConfig>;
}

interface TruthRewardsConfig {
  defaults?: TruthRewardRangeConfig;
  states?: Record<string, TruthRewardRangeConfig>;
  byKind?: Record<string, TruthRewardKindConfig>;
}

export interface ResolveHotspotOptions {
  /**
   * Explicit state abbreviation to use when looking up configuration.
   * Falls back to the provided state id if omitted.
   */
  stateAbbreviation?: string;
  /**
   * Explicit state identifier to include in the result metadata.
   */
  stateId?: string;
  /**
   * Optional fallback reward to use when configuration does not provide a value.
   */
  fallbackTruthReward?: number;
  /**
   * Override the enabled expansion identifiers. Defaults to the global snapshot.
   */
  enabledExpansions?: string[];
  /**
   * Optional hotspot kind to resolve specialized payouts.
   */
  hotspotKind?: HotspotKind;
}

export interface HotspotResolutionOutcome {
  stateId: string;
  stateAbbreviation: string;
  winnerFaction: 'truth' | 'government';
  baseReward: number;
  expansionBonus: number;
  factionBonus: number;
  totalMultiplier: number;
  rewardBeforeClamp: number;
  minReward: number;
  maxReward: number;
  finalReward: number;
  truthDelta: number;
  enabledExpansions: string[];
}

const toFiniteNumber = (value: unknown): number | undefined =>
  typeof value === 'number' && Number.isFinite(value) ? value : undefined;

let testEnabledExpansionOverride: string[] | null = null;

export const __setTestEnabledExpansions = (ids: string[] | null): void => {
  if (Array.isArray(ids)) {
    testEnabledExpansionOverride = ids
      .filter((id): id is string => typeof id === 'string')
      .map(id => id);
  } else {
    testEnabledExpansionOverride = null;
  }
};

const resolveTruthRewardsConfig = (): TruthRewardsConfig => {
  const rawResolution = (hotspotsConfig as { resolution?: unknown }).resolution;
  if (!rawResolution || typeof rawResolution !== 'object') {
    return {};
  }

  const truthRewards = (rawResolution as { truthRewards?: unknown }).truthRewards;
  if (!truthRewards || typeof truthRewards !== 'object') {
    return {};
  }

  return truthRewards as TruthRewardsConfig;
};

const clampValue = (value: number, min: number, max: number): number => {
  if (Number.isNaN(value)) return 0;
  if (!Number.isFinite(min)) min = 0;
  if (!Number.isFinite(max)) max = Number.POSITIVE_INFINITY;
  if (max < min) {
    max = min;
  }
  return Math.min(Math.max(value, min), max);
};

export function resolveHotspot(
  stateId: string,
  winnerFaction: 'truth' | 'government',
  options: ResolveHotspotOptions = {},
): HotspotResolutionOutcome {
  const truthRewardsConfig = resolveTruthRewardsConfig();
  const stateKey = (options.stateAbbreviation ?? stateId).trim().toUpperCase();
  const normalizedStateId = options.stateId ?? stateId;
  const normalizedKindKey = (options.hotspotKind ?? 'default').toLowerCase();

  const byKindConfig = truthRewardsConfig.byKind ?? {};
  const defaultKindConfig = byKindConfig.default ?? {};
  const specificKindConfig = byKindConfig[normalizedKindKey] ?? {};

  const pickKindValue = (getter: (config: TruthRewardKindConfig) => number | undefined): number | undefined => {
    const specificValue = getter(specificKindConfig);
    if (typeof specificValue === 'number' && Number.isFinite(specificValue)) {
      return specificValue;
    }
    const defaultValue = getter(defaultKindConfig);
    if (typeof defaultValue === 'number' && Number.isFinite(defaultValue)) {
      return defaultValue;
    }
    return undefined;
  };

  const toAbsoluteValue = (value: number | undefined): number | undefined => {
    if (typeof value !== 'number' || !Number.isFinite(value)) {
      return undefined;
    }
    if (Math.abs(value) <= 1) {
      return value * 100;
    }
    return value;
  };

  const defaults = truthRewardsConfig.defaults ?? {};
  const stateOverrides = truthRewardsConfig.states ?? {};
  const stateConfig = stateOverrides[stateKey];

  const fallbackReward = toFiniteNumber(options.fallbackTruthReward) ?? 0;
  let baseReward = toFiniteNumber(stateConfig?.base)
    ?? toFiniteNumber(defaults.base)
    ?? fallbackReward;

  const kindBase = pickKindValue(config => config.base);
  const kindBasePercent = pickKindValue(config => config.basePercent);
  const resolvedKindBase = toAbsoluteValue(kindBase ?? kindBasePercent);
  if (typeof resolvedKindBase === 'number') {
    baseReward = resolvedKindBase;
  }

  const minCandidates: number[] = [];
  const resolvedStateMin = toFiniteNumber(stateConfig?.min);
  if (typeof resolvedStateMin === 'number') {
    minCandidates.push(resolvedStateMin);
  }
  const resolvedDefaultMin = toFiniteNumber(defaults.min);
  if (typeof resolvedDefaultMin === 'number') {
    minCandidates.push(resolvedDefaultMin);
  }
  const resolvedKindMin = toAbsoluteValue(
    pickKindValue(config => config.min) ?? pickKindValue(config => config.minPercent),
  );
  if (typeof resolvedKindMin === 'number') {
    minCandidates.push(resolvedKindMin);
  }
  const minReward = minCandidates.length > 0 ? Math.max(...minCandidates) : 0;

  const maxCandidates: number[] = [];
  const resolvedStateMax = toFiniteNumber(stateConfig?.max);
  if (typeof resolvedStateMax === 'number') {
    maxCandidates.push(resolvedStateMax);
  }
  const resolvedDefaultMax = toFiniteNumber(defaults.max);
  if (typeof resolvedDefaultMax === 'number') {
    maxCandidates.push(resolvedDefaultMax);
  }
  const resolvedKindMax = toAbsoluteValue(
    pickKindValue(config => config.max) ?? pickKindValue(config => config.maxPercent),
  );
  if (typeof resolvedKindMax === 'number') {
    maxCandidates.push(resolvedKindMax);
  }
  const maxReward = maxCandidates.length > 0 ? Math.min(...maxCandidates) : Number.POSITIVE_INFINITY;

  const resolveKindExpansionBonus = (expansionId: string): number => {
    const normalized = expansionId.trim().toLowerCase();
    if (!normalized) {
      return 0;
    }
    const fromConfig = pickKindValue(config => {
      if (!config.expansionBonus) {
        return undefined;
      }
      const direct = config.expansionBonus[normalized];
      if (typeof direct === 'number' && Number.isFinite(direct)) {
        return direct;
      }
      const defaultBonus = config.expansionBonus.default;
      if (typeof defaultBonus === 'number' && Number.isFinite(defaultBonus)) {
        return defaultBonus;
      }
      return undefined;
    });
    const absolute = toAbsoluteValue(fromConfig);
    return typeof absolute === 'number' ? absolute : 0;
  };

  const legacyExpansionConfig = (truthRewardsConfig as { expansionBonuses?: Record<string, unknown> }).expansionBonuses ?? {};
  const enabledExpansionIds = options.enabledExpansions
    ?? testEnabledExpansionOverride
    ?? getEnabledExpansionIdsSnapshot();
  const enabledExpansions = new Set(enabledExpansionIds);

  let expansionBonus = 0;
  let totalMultiplier = 1;
  let factionBonus = 0;

  for (const expansionId of enabledExpansions) {
    const modifier = legacyExpansionConfig[expansionId] as TruthRewardExpansionConfig | undefined;
    if (!modifier) {
      expansionBonus += resolveKindExpansionBonus(expansionId);
      continue;
    }

    if (typeof modifier.flat === 'number' && Number.isFinite(modifier.flat)) {
      expansionBonus += modifier.flat;
    }
    if (typeof modifier.multiplier === 'number' && Number.isFinite(modifier.multiplier)) {
      totalMultiplier *= modifier.multiplier;
    }
    if (modifier.faction && typeof modifier.faction[winnerFaction] === 'number') {
      const factionValue = modifier.faction[winnerFaction];
      if (Number.isFinite(factionValue)) {
        factionBonus += factionValue as number;
      }
    }

    const stateSpecific = modifier.states ?? {};
    const stateEntry = stateSpecific[stateKey];
    if (typeof stateEntry === 'number') {
      expansionBonus += stateEntry;
    } else if (stateEntry && typeof stateEntry === 'object') {
      if (typeof stateEntry.flat === 'number' && Number.isFinite(stateEntry.flat)) {
        expansionBonus += stateEntry.flat;
      }
      if (typeof stateEntry.multiplier === 'number' && Number.isFinite(stateEntry.multiplier)) {
        totalMultiplier *= stateEntry.multiplier;
      }
      if (stateEntry.faction && typeof stateEntry.faction[winnerFaction] === 'number') {
        const factionValue = stateEntry.faction[winnerFaction];
        if (Number.isFinite(factionValue)) {
          factionBonus += factionValue as number;
        }
      }
    }

    expansionBonus += resolveKindExpansionBonus(expansionId);
  }

  const rewardBeforeClamp = (baseReward ?? 0) * totalMultiplier + expansionBonus + factionBonus;
  const clampedReward = clampValue(rewardBeforeClamp, minReward, maxReward);
  const finalReward = Math.round(clampedReward);
  const normalizedFinalReward = Number.isFinite(finalReward) ? finalReward : 0;
  const truthDelta = winnerFaction === 'truth'
    ? normalizedFinalReward
    : -normalizedFinalReward;

  return {
    stateId: normalizedStateId,
    stateAbbreviation: stateKey,
    winnerFaction,
    baseReward: Number.isFinite(baseReward) ? baseReward : 0,
    expansionBonus,
    factionBonus,
    totalMultiplier,
    rewardBeforeClamp,
    minReward,
    maxReward,
    finalReward: normalizedFinalReward,
    truthDelta,
    enabledExpansions: Array.from(enabledExpansions),
  } satisfies HotspotResolutionOutcome;
}

export interface HotspotSpawnOptions {
  enabledExpansions?: string[];
  rng?: () => number;
  excludeStates?: string[];
}

const HOTSPOT_KIND_VALUES: readonly HotspotKind[] = ['normal', 'ufo', 'ghost', 'elvis', 'cryptid'] as const;

const HOTSPOT_KIND_ICON_MAP: Record<HotspotKind, string> = {
  normal: '👻',
  ufo: '🛸',
  ghost: '🎃',
  elvis: '🕺',
  cryptid: '🦶',
};

const normalizeHotspotKind = (value: unknown): HotspotKind | undefined => {
  if (typeof value !== 'string') {
    return undefined;
  }

  const normalized = value.trim().toLowerCase();
  return HOTSPOT_KIND_VALUES.find(kind => kind === normalized);
};

export const DEFAULT_HOTSPOT_ICON = HOTSPOT_KIND_ICON_MAP.normal;

export function deriveHotspotIcon(metadata: {
  icon?: string;
  tags?: string[];
  expansionTag?: string;
  kind?: HotspotKind | string;
}): string {
  const { icon, tags = [], expansionTag, kind } = metadata;

  if (typeof icon === 'string' && icon.trim().length > 0) {
    return icon;
  }

  const normalizedKind = normalizeHotspotKind(kind);
  if (normalizedKind) {
    return HOTSPOT_KIND_ICON_MAP[normalizedKind];
  }

  const normalizedTags = tags
    .filter((tag): tag is string => typeof tag === 'string')
    .map(tag => tag.trim().toLowerCase())
    .filter(tag => tag.length > 0);
  const normalizedTagSet = new Set(normalizedTags);

  const normalizedExpansionTag = (expansionTag ?? '')
    .toString()
    .trim()
    .toLowerCase();

  if (
    normalizedTagSet.has('cryptid-home')
    || normalizedTagSet.has('expansion:cryptids')
    || normalizedExpansionTag === 'cryptids'
  ) {
    return HOTSPOT_KIND_ICON_MAP.cryptid;
  }

  if (
    normalizedTagSet.has('halloween')
    || normalizedTagSet.has('expansion:halloween')
    || normalizedExpansionTag === 'halloween'
  ) {
    return HOTSPOT_KIND_ICON_MAP.ghost;
  }

  return HOTSPOT_KIND_ICON_MAP.normal;
}

type CatalogEntry = HotspotCatalog['hotspots'][number];

const HOTSPOT_KIND_WEIGHT_MULTIPLIER: Record<HotspotKind, number> = {
  normal: 1,
  ufo: 1.1,
  ghost: 1.05,
  elvis: 1.02,
  cryptid: 1.2,
};

export interface WeightedHotspotCandidate extends Hotspot {
  stateId: string;
  stateName: string;
  stateAbbreviation: string;
  totalWeight: number;
  weightBreakdown: HotspotWeightBreakdown;
}

export class HotspotDirector {
  private readonly catalog: HotspotCatalog;

  private readonly config: HotspotConfig;

  private readonly cryptids: CryptidHomeState;

  private readonly spawnConfig: SpawnConfig;

  private readonly uiConfig: HotspotUiConfig;

  private cryptidHomeLookup: Map<string, CryptidSignatureRecord> | null = null;

  constructor(
    catalog: HotspotCatalog = hotspotsCatalog,
    config: HotspotConfig = hotspotsConfig,
    cryptids: CryptidHomeState = cryptidHomeStates,
  ) {
    this.catalog = catalog;
    this.config = config;
    this.cryptids = cryptids;
    this.spawnConfig = this.normalizeSpawnConfig(config);
    this.uiConfig = this.normalizeUiConfig(config);
  }

  initialize(): void {
    // TODO: Hydrate working sets, indexes, and orchestration timers.
  }

  getCatalog(): HotspotCatalog {
    return this.catalog;
  }

  getConfig(): HotspotConfig {
    return this.config;
  }

  getCryptids(): CryptidHomeState {
    return this.cryptids;
  }

  private getSpawnRate(): number {
    const spawnDefaultsRate = toFiniteNumber(this.spawnConfig.defaults?.spawnRate);
    const configDefaultsRate = toFiniteNumber((this.config as { defaults?: { spawnRate?: unknown } }).defaults?.spawnRate);

    const resolved = typeof spawnDefaultsRate === 'number'
      ? spawnDefaultsRate
      : typeof configDefaultsRate === 'number'
        ? configDefaultsRate
        : undefined;

    if (typeof resolved === 'number') {
      return Math.min(Math.max(resolved, 0), 1);
    }

    return 0.2;
  }

  private ensureStringTags(tags: unknown): string[] {
    if (!Array.isArray(tags)) {
      return [];
    }

    return tags
      .filter((tag): tag is string => typeof tag === 'string')
      .map(tag => tag.trim())
      .filter(tag => tag.length > 0);
  }

  private resolveCryptidSlug(tags: string[]): string | null {
    for (const tag of tags) {
      const normalized = tag.toLowerCase();
      if (!normalized.startsWith('cryptid:')) {
        continue;
      }
      const value = tag.slice(tag.indexOf(':') + 1).trim();
      if (value.length === 0) {
        continue;
      }
      return value.toLowerCase();
    }

    return null;
  }

  private resolveEntryStateAbbreviation(entry: CatalogEntry): string | undefined {
    if (entry && typeof entry === 'object') {
      const direct = (entry as { stateAbbreviation?: unknown }).stateAbbreviation;
      if (typeof direct === 'string' && direct.trim().length > 0) {
        return direct.trim().toUpperCase();
      }

      const tags = this.ensureStringTags((entry as { tags?: unknown }).tags);
      for (const tag of tags) {
        const normalized = tag.toLowerCase();
        if (normalized.startsWith('state:')) {
          const value = tag.slice(tag.indexOf(':') + 1).trim().toUpperCase();
          if (value) {
            return value;
          }
        }
      }
    }

    return undefined;
  }

  private resolveCatalogKind(entry: CatalogEntry): HotspotKind {
    const tags = this.ensureStringTags((entry as { tags?: unknown }).tags).map(tag => tag.toLowerCase());
    const id = typeof (entry as { id?: unknown }).id === 'string' ? (entry as { id: string }).id.toLowerCase() : '';
    const name = typeof (entry as { name?: unknown }).name === 'string' ? (entry as { name: string }).name.toLowerCase() : '';
    const expansionTag = typeof (entry as { expansionTag?: unknown }).expansionTag === 'string'
      ? ((entry as { expansionTag: string }).expansionTag.trim().toLowerCase())
      : '';

    if (tags.includes('cryptid') || expansionTag === 'cryptids' || id.includes('cryptid')) {
      return 'cryptid';
    }

    if (tags.includes('halloween') || expansionTag === 'halloween' || id.includes('halloween')) {
      return 'ghost';
    }

    if (tags.some(tag => tag.includes('elvis')) || id.includes('elvis') || name.includes('elvis')) {
      return 'elvis';
    }

    if (tags.some(tag => tag.includes('ufo') || tag.includes('alien')) || id.includes('ufo') || name.includes('ufo') || name.includes('alien')) {
      return 'ufo';
    }

    return 'normal';
  }

  private getCatalogWeightMultiplier(entry: CatalogEntry): number {
    const rawIntensity = toFiniteNumber((entry as { intensity?: unknown }).intensity);
    const intensity = typeof rawIntensity === 'number' ? Math.min(Math.max(rawIntensity, 1), 5) : 3;
    const intensityMultiplier = intensity / 3;

    const rawTruthDelta = toFiniteNumber((entry as { truthDelta?: unknown }).truthDelta);
    const truthMagnitude = rawTruthDelta ? Math.abs(rawTruthDelta) : 0;
    const truthMultiplier = truthMagnitude > 0 ? 1 + truthMagnitude / 12 : 1;

    const multiplier = intensityMultiplier * truthMultiplier;
    return Math.min(Math.max(multiplier, 0.5), 3);
  }

  private getTypeMultiplier(kind: HotspotKind): number {
    return HOTSPOT_KIND_WEIGHT_MULTIPLIER[kind] ?? 1;
  }

  private computeCatalogIntensity(entry: CatalogEntry, fallback: number): number {
    const rawIntensity = toFiniteNumber((entry as { intensity?: unknown }).intensity);
    if (typeof rawIntensity === 'number') {
      return Math.max(1, Math.round(rawIntensity));
    }
    return Math.max(1, Math.round(fallback));
  }

  private resolveCatalogExpansion(entry: CatalogEntry): string | undefined {
    const expansionTag = typeof (entry as { expansionTag?: unknown }).expansionTag === 'string'
      ? (entry as { expansionTag: string }).expansionTag.trim().toLowerCase()
      : undefined;
    return expansionTag && expansionTag.length > 0 ? expansionTag : undefined;
  }

  private normalizeSpawnConfig(config: HotspotConfig): SpawnConfig {
    const baseWeights: SpawnConfig['baseWeights'] = {
      default: { default: 1 },
      states: {},
    };
    const expansionModifiers: SpawnConfig['expansionModifiers'] = {};
    const cryptidHomeStateBoost: SpawnConfig['cryptidHomeStateBoost'] = {
      base: 0,
      perCryptid: 0,
      max: Number.POSITIVE_INFINITY,
    };
    const defaults: NonNullable<SpawnConfig['defaults']> = {};

    const rawSpawn = (config as { spawn?: unknown }).spawn;
    if (rawSpawn && typeof rawSpawn === 'object') {
      const spawn = rawSpawn as {
        defaults?: { spawnRate?: unknown };
        baseWeights?: { default?: unknown; states?: Record<string, unknown> };
        expansionModifiers?: Record<string, {
          multiplier?: unknown;
          flat?: unknown;
          stateWeights?: Record<string, unknown>;
        }>;
        cryptidHomeStateBoost?: { base?: unknown; perCryptid?: unknown; max?: unknown };
      };

      if (spawn.defaults && typeof spawn.defaults === 'object') {
        if (typeof spawn.defaults.spawnRate === 'number' && Number.isFinite(spawn.defaults.spawnRate)) {
          defaults.spawnRate = spawn.defaults.spawnRate;
        }
      }

      if (spawn.baseWeights && typeof spawn.baseWeights === 'object') {
        const normalizeKindWeights = (value: unknown): SpawnKindWeights => {
          const weights: SpawnKindWeights = {};
          if (!value || typeof value !== 'object') {
            if (typeof value === 'number' && Number.isFinite(value)) {
              weights.default = value;
            }
            return weights;
          }

          for (const [kindKey, kindValue] of Object.entries(value as Record<string, unknown>)) {
            if (typeof kindValue === 'number' && Number.isFinite(kindValue)) {
              weights[(kindKey.trim().toLowerCase() || 'default') as SpawnKindKey] = kindValue;
            }
          }
          return weights;
        };

        const rawDefaultWeights = normalizeKindWeights(spawn.baseWeights.default);
        if (Object.keys(rawDefaultWeights).length > 0) {
          baseWeights.default = { ...baseWeights.default, ...rawDefaultWeights };
        }

        if (spawn.baseWeights.states && typeof spawn.baseWeights.states === 'object') {
          for (const [key, value] of Object.entries(spawn.baseWeights.states)) {
            const normalizedKey = key.toUpperCase();
            if (!normalizedKey) {
              continue;
            }
            const normalizedWeights = normalizeKindWeights(value);
            if (Object.keys(normalizedWeights).length > 0) {
              baseWeights.states[normalizedKey] = {
                ...(baseWeights.states[normalizedKey] ?? {}),
                ...normalizedWeights,
              };
            }
          }
        }
      }

      if (spawn.expansionModifiers && typeof spawn.expansionModifiers === 'object') {
        for (const [expansionId, modifier] of Object.entries(spawn.expansionModifiers)) {
          if (!modifier || typeof modifier !== 'object') {
            continue;
          }

          const normalized: ExpansionModifierConfig = {
            stateWeights: {},
          };

          if (typeof modifier.multiplier === 'number' && Number.isFinite(modifier.multiplier)) {
            normalized.multiplier = modifier.multiplier;
          }

          if (typeof modifier.flat === 'number' && Number.isFinite(modifier.flat)) {
            normalized.flat = modifier.flat;
          }

          if (modifier.stateWeights && typeof modifier.stateWeights === 'object') {
            for (const [stateKey, stateValue] of Object.entries(modifier.stateWeights)) {
              if (typeof stateValue === 'number' && Number.isFinite(stateValue)) {
                normalized.stateWeights[stateKey.toUpperCase()] = stateValue;
              }
            }
          }

          expansionModifiers[expansionId] = normalized;
        }
      }

      if (spawn.cryptidHomeStateBoost && typeof spawn.cryptidHomeStateBoost === 'object') {
        const boost = spawn.cryptidHomeStateBoost;
        if (typeof boost.base === 'number' && Number.isFinite(boost.base)) {
          cryptidHomeStateBoost.base = boost.base;
        }
        if (typeof boost.perCryptid === 'number' && Number.isFinite(boost.perCryptid)) {
          cryptidHomeStateBoost.perCryptid = boost.perCryptid;
        }
        if (typeof boost.max === 'number' && Number.isFinite(boost.max)) {
          cryptidHomeStateBoost.max = boost.max;
        }
      }
    }

    const normalized: SpawnConfig = { baseWeights, expansionModifiers, cryptidHomeStateBoost };
    if (Object.keys(defaults).length > 0) {
      normalized.defaults = defaults;
    }

    return normalized;
  }

  private normalizeUiConfig(config: HotspotConfig): HotspotUiConfig {
    const uiConfig: HotspotUiConfig = { badges: {}, blurbs: {} };
    const rawUi = (config as { ui?: unknown }).ui;
    if (!rawUi || typeof rawUi !== 'object') {
      return uiConfig;
    }

    const rawBadges = (rawUi as { badges?: unknown }).badges;
    if (rawBadges && typeof rawBadges === 'object') {
      for (const [key, value] of Object.entries(rawBadges as Record<string, unknown>)) {
        if (typeof value === 'string' && value.trim()) {
          uiConfig.badges[key] = { className: value.trim() };
          continue;
        }

        if (value && typeof value === 'object') {
          const className = (value as { className?: unknown }).className;
          if (typeof className === 'string' && className.trim()) {
            uiConfig.badges[key] = { className: className.trim() };
          }
        }
      }
    }

    const rawBlurbs = (rawUi as { blurbs?: unknown }).blurbs;
    if (rawBlurbs && typeof rawBlurbs === 'object') {
      for (const [key, value] of Object.entries(rawBlurbs as Record<string, unknown>)) {
        if (!Array.isArray(value)) {
          continue;
        }
        const blurbs = value
          .filter((entry): entry is string => typeof entry === 'string' && entry.trim().length > 0)
          .map(entry => entry.trim());
        if (blurbs.length > 0) {
          uiConfig.blurbs[key] = blurbs;
        }
      }
    }

    return uiConfig;
  }

  private getBadgeClass(kind: HotspotKind | string | undefined): string {
    const normalized = typeof kind === 'string' ? kind.toLowerCase() : '';
    if (normalized && this.uiConfig.badges[normalized]) {
      return this.uiConfig.badges[normalized].className;
    }
    if (this.uiConfig.badges.default) {
      return this.uiConfig.badges.default.className;
    }
    return DEFAULT_BADGE_CLASS;
  }

  private getBlurbs(kind: HotspotKind | string | undefined): string[] {
    const normalized = typeof kind === 'string' ? kind.toLowerCase() : '';
    const specific = normalized && this.uiConfig.blurbs[normalized]
      ? this.uiConfig.blurbs[normalized]
      : [];
    const defaults = this.uiConfig.blurbs.default ?? [];
    const combined = [...specific, ...defaults];
    return combined.length > 0 ? combined : [DEFAULT_BLURB_TEMPLATE];
  }

  private getSeededIndex(seed: string, length: number): number {
    if (length <= 0) {
      return 0;
    }
    let hash = 0;
    for (let index = 0; index < seed.length; index += 1) {
      hash = ((hash << 5) - hash) + seed.charCodeAt(index);
      hash |= 0;
    }
    const normalized = Math.abs(hash);
    return normalized % length;
  }

  private pickTemplate(templates: string[], seed: string): string {
    if (!templates.length) {
      return DEFAULT_BLURB_TEMPLATE;
    }
    const index = this.getSeededIndex(seed, templates.length);
    return templates[index] ?? templates[0];
  }

  private formatKindLabel(kind: HotspotKind | string | undefined): string {
    if (!kind) {
      return 'Hotspot';
    }
    const normalized = kind.toString().trim();
    if (!normalized) {
      return 'Hotspot';
    }
    if (normalized.toLowerCase() === 'ufo') {
      return 'UFO';
    }
    return normalized.charAt(0).toUpperCase() + normalized.slice(1);
  }

  private formatBlurb(template: string, hotspot: Hotspot): string {
    const rawState = hotspot.stateName ?? hotspot.location ?? 'Unknown Zone';
    const stateName = rawState.trim() || 'Unknown Zone';
    const intensity = Math.max(1, Math.round(hotspot.intensity ?? 1));
    const kindLabel = this.formatKindLabel(hotspot.kind);
    const headline = typeof hotspot.name === 'string' && hotspot.name.trim().length > 0
      ? hotspot.name.trim()
      : `${stateName} Hotspot`;

    return template
      .replace(/\{STATE\}/g, stateName.toUpperCase())
      .replace(/\{STATE_TITLE\}/g, stateName)
      .replace(/\{INTENSITY\}/g, intensity.toString())
      .replace(/\{KIND\}/g, kindLabel)
      .replace(/\{HEADLINE\}/g, headline);
  }

  buildHotspotExtraArticle(hotspot: Hotspot): HotspotExtraArticle {
    const normalizedKind: HotspotKind = hotspot.kind ?? 'normal';
    const stateName = (hotspot.stateName ?? hotspot.location ?? 'Unknown Zone').trim() || 'Unknown Zone';
    const badgeClassName = this.getBadgeClass(normalizedKind);
    const badgeLabel = `${this.formatKindLabel(normalizedKind)} • ${stateName}`;
    const headline = (hotspot.name ?? `${stateName} Hotspot`).toString().trim() || `${stateName} Hotspot`;
    const templates = this.getBlurbs(normalizedKind);
    const template = this.pickTemplate(templates, hotspot.id ?? `${stateName}-${normalizedKind}`);
    const blurb = this.formatBlurb(template, hotspot);
    const intensity = Math.max(1, Math.round(hotspot.intensity ?? 1));

    return {
      id: hotspot.id,
      kind: normalizedKind,
      stateName,
      stateAbbreviation: hotspot.stateAbbreviation,
      badgeLabel,
      badgeClassName,
      headline,
      blurb,
      intensity,
    } satisfies HotspotExtraArticle;
  }

  private slugifyCryptidName(name: string): string {
    return name
      .normalize('NFKD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-zA-Z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '')
      .toLowerCase();
  }

  private resolveCryptidLookup(): Map<string, CryptidSignatureRecord> {
    if (this.cryptidHomeLookup) {
      return this.cryptidHomeLookup;
    }

    const lookup = new Map<string, CryptidSignatureRecord>();
    const entries = this.cryptids && typeof this.cryptids === 'object'
      ? Object.entries(this.cryptids as Record<string, unknown>)
      : [];

    for (const [rawStateName, rawCryptidName] of entries) {
      if (typeof rawStateName !== 'string' || typeof rawCryptidName !== 'string') {
        continue;
      }

      const stateName = rawStateName.trim();
      const cryptidName = rawCryptidName.trim();

      if (!stateName || !cryptidName) {
        continue;
      }

      const slug = this.slugifyCryptidName(cryptidName);
      if (!slug) {
        continue;
      }

      const key = stateName.toUpperCase();
      const abbreviation = STATE_NAME_TO_ABBR.get(key);

      const record: CryptidSignatureRecord = {
        stateName,
        abbreviation,
        name: cryptidName,
        slug,
      };

      lookup.set(key, record);
      if (abbreviation) {
        lookup.set(abbreviation, record);
      }
    }

    this.cryptidHomeLookup = lookup;
    return lookup;
  }

  private getBaseWeight(stateId: string, stateAbbr: string, kind: HotspotKind): number {
    const { baseWeights } = this.spawnConfig;
    const kindKey = (kind ?? 'normal').toLowerCase() as SpawnKindKey;

    const resolveWeight = (weights: SpawnKindWeights | undefined): number | undefined => {
      if (!weights) {
        return undefined;
      }
      return weights[kindKey] ?? weights.default;
    };

    const abbrKey = stateAbbr.toUpperCase();
    const idKey = stateId.trim().toUpperCase();

    const abbrWeight = resolveWeight(baseWeights.states[abbrKey]);
    const idWeight = resolveWeight(baseWeights.states[idKey]);
    const defaultWeight = resolveWeight(baseWeights.default);

    return abbrWeight ?? idWeight ?? defaultWeight ?? 1;
  }

  private applyExpansionModifiers(
    baseWeight: number,
    stateAbbr: string,
    enabledExpansions: Set<string>,
  ): { weight: number; bonus: number; tags: string[] } {
    if (enabledExpansions.size === 0) {
      return { weight: baseWeight, bonus: 0, tags: [] };
    }

    const modifiers = this.spawnConfig.expansionModifiers;
    let weight = baseWeight;
    let bonus = 0;
    const modifierTags: string[] = [];

    for (const expansionId of enabledExpansions) {
      const modifier = modifiers[expansionId];
      if (!modifier) {
        continue;
      }

      const multiplier = typeof modifier.multiplier === 'number' && Number.isFinite(modifier.multiplier)
        ? modifier.multiplier
        : 1;
      const flat = typeof modifier.flat === 'number' && Number.isFinite(modifier.flat)
        ? modifier.flat
        : 0;
      const stateWeights = modifier.stateWeights ?? {};
      const stateKey = stateAbbr.toUpperCase();
      const stateBonus = stateWeights[stateKey] ?? 0;

      const before = weight;
      weight = weight * multiplier + flat + stateBonus;
      bonus += weight - before;
      modifierTags.push(`expansion:${expansionId}`);
    }

    return { weight, bonus, tags: modifierTags };
  }

  private applyCryptidBoost(
    stateAbbr: string,
    stateName: string | undefined,
    cryptidSlug: string | null,
    currentWeight: number,
  ): { weight: number; bonus: number; tag?: string } {
    if (!cryptidSlug) {
      return { weight: currentWeight, bonus: 0 };
    }

    const lookup = this.resolveCryptidLookup();
    const normalizedAbbr = stateAbbr.toUpperCase();
    const normalizedStateName = typeof stateName === 'string'
      ? stateName.trim().toUpperCase()
      : undefined;

    const signature = lookup.get(normalizedAbbr)
      ?? (normalizedStateName ? lookup.get(normalizedStateName) : undefined);

    if (!signature || signature.slug !== cryptidSlug) {
      return { weight: currentWeight, bonus: 0 };
    }

    const cryptidConfig = this.spawnConfig.cryptidHomeStateBoost;
    const base = cryptidConfig.base;
    const perCryptid = cryptidConfig.perCryptid;
    const max = cryptidConfig.max;

    const homeCount = 1;
    const boost = Math.min(max, base + homeCount * perCryptid);
    return { weight: currentWeight + boost, bonus: boost, tag: 'cryptid-home' };
  }

  private resolveExpansionTag(tags: string[]): string | undefined {
    for (const tag of tags) {
      if (typeof tag !== 'string') {
        continue;
      }
      const trimmed = tag.trim();
      if (!trimmed.toLowerCase().startsWith('expansion:')) {
        continue;
      }
      const value = trimmed.slice(trimmed.indexOf(':') + 1).trim();
      if (value.length > 0) {
        return value.toLowerCase();
      }
    }
    return undefined;
  }

  rollForSpawn(
    round: number,
    gameState: Pick<GameState, 'states' | 'paranormalHotspots'>,
    options: HotspotSpawnOptions = {},
  ): WeightedHotspotCandidate | null {
    const { enabledExpansions = [], rng = Math.random, excludeStates = [] } = options;
    const spawnRoll = rng();
    if (spawnRoll >= this.getSpawnRate()) {
      return null;
    }

    const enabledSet = new Set(
      enabledExpansions
        .map(value => (typeof value === 'string' ? value.trim().toLowerCase() : ''))
        .filter(value => value.length > 0),
    );
    const exclusionSet = new Set(
      excludeStates
        .map(value => (typeof value === 'string' ? value.trim().toUpperCase() : ''))
        .filter(value => value.length > 0),
    );
    const activeHotspots = new Set(
      Object.keys(gameState.paranormalHotspots ?? {})
        .map(key => key.toUpperCase()),
    );

    const stateLookup = new Map<string, GameState['states'][number]>();
    for (const state of gameState.states ?? []) {
      const abbr = state.abbreviation?.toUpperCase?.() ?? '';
      if (!abbr) {
        continue;
      }
      stateLookup.set(abbr, state);
    }

    const catalogEntries = Array.isArray(this.catalog?.hotspots) ? this.catalog.hotspots : [];

    const candidates: Array<{
      state: GameState['states'][number];
      entry: CatalogEntry;
      weight: number;
      breakdown: HotspotWeightBreakdown;
      tags: string[];
      expansionTag?: string;
      icon: string;
      kind: HotspotKind;
    }> = [];

    for (const entry of catalogEntries) {
      const stateAbbr = this.resolveEntryStateAbbreviation(entry);
      if (!stateAbbr) {
        continue;
      }

      if (exclusionSet.has(stateAbbr) || activeHotspots.has(stateAbbr)) {
        continue;
      }

      const state = stateLookup.get(stateAbbr);
      if (!state) {
        continue;
      }

      const catalogExpansion = this.resolveCatalogExpansion(entry);
      if (catalogExpansion && !enabledSet.has(catalogExpansion)) {
        continue;
      }

      const kind = this.resolveCatalogKind(entry);
      const stateId = (state.id ?? stateAbbr).toString();
      const baseWeight = this.getBaseWeight(stateId, stateAbbr, kind);
      if (!baseWeight || baseWeight <= 0) {
        continue;
      }
      const breakdown: HotspotWeightBreakdown = {
        base: baseWeight,
        catalog: 0,
        type: 0,
        expansion: 0,
        cryptid: 0,
      };

      let totalWeight = baseWeight;

      const catalogMultiplier = this.getCatalogWeightMultiplier(entry);
      const weightAfterCatalog = totalWeight * catalogMultiplier;
      breakdown.catalog = weightAfterCatalog - totalWeight;
      totalWeight = weightAfterCatalog;

      const typeMultiplier = this.getTypeMultiplier(kind);
      const weightAfterType = totalWeight * typeMultiplier;
      breakdown.type = weightAfterType - totalWeight;
      totalWeight = weightAfterType;

      const expansionResult = this.applyExpansionModifiers(totalWeight, stateAbbr, enabledSet);
      breakdown.expansion = expansionResult.bonus;
      totalWeight = expansionResult.weight;

      let tags = this.ensureStringTags((entry as { tags?: unknown }).tags);
      if (expansionResult.tags.length > 0) {
        tags = [...tags, ...expansionResult.tags];
      }

      const cryptidSlug = this.resolveCryptidSlug(tags);
      const stateNameCandidate = typeof state.name === 'string' ? state.name.trim() : '';
      const entryStateNameCandidate = typeof (entry as { stateName?: unknown }).stateName === 'string'
        ? ((entry as { stateName: string }).stateName.trim())
        : '';
      const resolvedStateName = stateNameCandidate || entryStateNameCandidate || undefined;

      const cryptidResult = this.applyCryptidBoost(
        stateAbbr,
        resolvedStateName,
        cryptidSlug,
        totalWeight,
      );
      breakdown.cryptid = cryptidResult.bonus;
      totalWeight = cryptidResult.weight;
      if (cryptidResult.tag) {
        tags = [...tags, cryptidResult.tag];
      }

      if (!totalWeight || totalWeight <= 0) {
        continue;
      }

      const normalizedTags = Array.from(new Set(['auto-spawn', ...tags]));
      const resolvedExpansionTag = catalogExpansion ?? this.resolveExpansionTag(normalizedTags);
      const icon = deriveHotspotIcon({
        icon: (entry as { icon?: unknown }).icon as string | undefined,
        tags: normalizedTags,
        expansionTag: resolvedExpansionTag,
        kind,
      });

      candidates.push({
        state,
        entry,
        weight: totalWeight,
        breakdown,
        tags: normalizedTags,
        expansionTag: resolvedExpansionTag,
        icon,
        kind,
      });
    }

    if (candidates.length === 0) {
      return null;
    }

    const totalWeight = candidates.reduce((sum, entry) => sum + entry.weight, 0);
    const selectionRoll = rng() * totalWeight;
    let accumulator = 0;
    let selected = candidates[0];
    for (const candidate of candidates) {
      accumulator += candidate.weight;
      if (selectionRoll <= accumulator) {
        selected = candidate;
        break;
      }
    }

    const { state, entry, breakdown, weight, tags, expansionTag, icon, kind } = selected;
    const stateAbbr = state.abbreviation?.toUpperCase?.() ?? this.resolveEntryStateAbbreviation(entry) ?? '';
    const rawStateId = state.id ?? (entry as { stateId?: unknown }).stateId ?? stateAbbr;
    const stateId = typeof rawStateId === 'string' ? rawStateId : String(rawStateId ?? stateAbbr);
    const stateName = (state.name ?? (entry as { stateName?: unknown }).stateName ?? stateAbbr).toString();

    const baseId = typeof (entry as { id?: unknown }).id === 'string' && (entry as { id: string }).id.trim().length > 0
      ? (entry as { id: string }).id.trim()
      : `auto:${stateAbbr}`;
    const hotspotId = `${baseId}:${round}:${Date.now()}`;

    const enabledList = Array.from(enabledSet);
    const truthOutcome = resolveHotspot(stateId, 'truth', {
      stateId,
      stateAbbreviation: stateAbbr,
      enabledExpansions: enabledList,
      hotspotKind: kind,
    });
    const truthRewardHint = Math.max(1, Math.round(Math.abs(truthOutcome.truthDelta)));

    const summary = typeof (entry as { summary?: unknown }).summary === 'string'
      ? (entry as { summary: string }).summary
      : undefined;
    const location = typeof (entry as { location?: unknown }).location === 'string'
      ? (entry as { location: string }).location
      : stateName;
    const name = typeof (entry as { name?: unknown }).name === 'string'
      ? (entry as { name: string }).name
      : `${stateName} Hotspot`;

    return {
      id: hotspotId,
      name,
      kind,
      location,
      summary: summary ?? location,
      intensity: this.computeCatalogIntensity(entry, weight * 5),
      status: 'spawning',
      tags,
      icon,
      expansionTag,
      stateId,
      stateName,
      stateAbbreviation: stateAbbr,
      totalWeight: weight,
      weightBreakdown: breakdown,
      truthDelta: truthOutcome.truthDelta,
      truthRewardHint,
    } satisfies WeightedHotspotCandidate;
  }
}
