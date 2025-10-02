import hotspotsCatalog from '@/data/hotspots.catalog.json';
import hotspotsConfig from '@/data/hotspots.config.json';
import cryptidHomeStates from '@/data/cryptids.homestate.json';
import type { GameState } from '@/hooks/gameStateTypes';
import { getEnabledExpansionIdsSnapshot } from '@/data/expansions/state';

export interface HotspotWeightBreakdown {
  base: number;
  expansion: number;
  cryptid: number;
}

export type HotspotKind =
  | 'anomaly'
  | 'disturbance'
  | 'manifestation'
  | 'phenomenon'
  | 'encounter';

export interface Hotspot {
  id: string;
  name: string;
  kind: HotspotKind;
  location: string;
  intensity: number;
  status: 'spawning' | 'active' | 'resolved' | 'expired';
  tags: string[];
  stateId?: string;
  stateName?: string;
  stateAbbreviation?: string;
  totalWeight?: number;
  weightBreakdown?: HotspotWeightBreakdown;
  truthDelta?: number;
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

interface ExpansionModifierConfig {
  multiplier?: number;
  flat?: number;
  stateWeights: Record<string, number>;
}

interface SpawnConfig {
  baseWeights: {
    default: number;
    states: Record<string, number>;
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

const DEFAULT_BLURB_TEMPLATE = 'Sensorene melder {KIND}-anomali over {STATE}. Intensitet {INTENSITY}.';

interface TruthRewardRangeConfig {
  base?: number;
  min?: number;
  max?: number;
}

interface TruthRewardExpansionStateConfig extends TruthRewardRangeConfig {
  flat?: number;
  multiplier?: number;
  faction?: Partial<Record<'truth' | 'government', number>>;
}

interface TruthRewardExpansionConfig {
  flat?: number;
  multiplier?: number;
  faction?: Partial<Record<'truth' | 'government', number>>;
  states?: Record<string, number | TruthRewardExpansionStateConfig>;
}

interface TruthRewardsConfig {
  defaults?: TruthRewardRangeConfig;
  states?: Record<string, TruthRewardRangeConfig>;
  expansionBonuses?: Record<string, TruthRewardExpansionConfig>;
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

  const defaults = truthRewardsConfig.defaults ?? {};
  const stateOverrides = truthRewardsConfig.states ?? {};
  const stateConfig = stateOverrides[stateKey];

  const fallbackReward = toFiniteNumber(options.fallbackTruthReward) ?? 0;
  const baseReward = toFiniteNumber(stateConfig?.base)
    ?? toFiniteNumber(defaults.base)
    ?? fallbackReward;

  const minReward = toFiniteNumber(stateConfig?.min)
    ?? toFiniteNumber(defaults.min)
    ?? 0;
  const maxReward = toFiniteNumber(stateConfig?.max)
    ?? toFiniteNumber(defaults.max)
    ?? Number.POSITIVE_INFINITY;

  const expansionConfig = truthRewardsConfig.expansionBonuses ?? {};
  const enabledExpansions = new Set(
    options.enabledExpansions ?? getEnabledExpansionIdsSnapshot(),
  );

  let expansionBonus = 0;
  let totalMultiplier = 1;
  let factionBonus = 0;

  for (const expansionId of enabledExpansions) {
    const modifier = expansionConfig[expansionId];
    if (!modifier) {
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

  private cryptidHomeLookup: Map<string, number> | null = null;

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

  private normalizeSpawnConfig(config: HotspotConfig): SpawnConfig {
    const baseWeights: SpawnConfig['baseWeights'] = {
      default: 1,
      states: {},
    };
    const expansionModifiers: SpawnConfig['expansionModifiers'] = {};
    const cryptidHomeStateBoost: SpawnConfig['cryptidHomeStateBoost'] = {
      base: 0,
      perCryptid: 0,
      max: Number.POSITIVE_INFINITY,
    };

    const rawSpawn = (config as { spawn?: unknown }).spawn;
    if (rawSpawn && typeof rawSpawn === 'object') {
      const spawn = rawSpawn as {
        baseWeights?: { default?: unknown; states?: Record<string, unknown> };
        expansionModifiers?: Record<string, {
          multiplier?: unknown;
          flat?: unknown;
          stateWeights?: Record<string, unknown>;
        }>;
        cryptidHomeStateBoost?: { base?: unknown; perCryptid?: unknown; max?: unknown };
      };

      if (spawn.baseWeights && typeof spawn.baseWeights === 'object') {
        if (typeof spawn.baseWeights.default === 'number' && Number.isFinite(spawn.baseWeights.default)) {
          baseWeights.default = spawn.baseWeights.default;
        }
        if (spawn.baseWeights.states && typeof spawn.baseWeights.states === 'object') {
          for (const [key, value] of Object.entries(spawn.baseWeights.states)) {
            if (typeof value === 'number' && Number.isFinite(value)) {
              baseWeights.states[key.toUpperCase()] = value;
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

    return { baseWeights, expansionModifiers, cryptidHomeStateBoost };
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

  private formatBlurb(template: string, hotspot: Hotspot): string {
    const rawState = hotspot.stateName ?? hotspot.location ?? 'ukjent sone';
    const stateName = rawState.trim() || 'ukjent sone';
    const intensity = Math.max(1, Math.round(hotspot.intensity ?? 1));
    const kindLabel = (hotspot.kind ?? 'hotspot').toUpperCase();

    return template
      .replace(/\{STATE\}/g, stateName.toUpperCase())
      .replace(/\{STATE_TITLE\}/g, stateName)
      .replace(/\{INTENSITY\}/g, intensity.toString())
      .replace(/\{KIND\}/g, kindLabel);
  }

  buildHotspotExtraArticle(hotspot: Hotspot): HotspotExtraArticle {
    const normalizedKind: HotspotKind = hotspot.kind ?? 'phenomenon';
    const stateName = (hotspot.stateName ?? hotspot.location ?? 'Ukjent sone').trim() || 'Ukjent sone';
    const badgeClassName = this.getBadgeClass(normalizedKind);
    const badgeLabel = `${normalizedKind.toUpperCase()} • ${stateName.toUpperCase()}`;
    const headline = (hotspot.name ?? `${stateName} Hotspot`).toUpperCase();
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

  private resolveCryptidLookup(): Map<string, number> {
    if (this.cryptidHomeLookup) {
      return this.cryptidHomeLookup;
    }

    const lookup = new Map<string, number>();
    const entries = Array.isArray(this.cryptids?.cryptids) ? this.cryptids.cryptids : [];

    for (const cryptid of entries) {
      const rawStates = (cryptid as { homeStates?: unknown; states?: unknown }).homeStates
        ?? (cryptid as { states?: unknown }).states;

      if (!Array.isArray(rawStates)) {
        continue;
      }

      for (const state of rawStates) {
        if (typeof state !== 'string') {
          continue;
        }
        const key = state.trim().toUpperCase();
        if (!key) {
          continue;
        }
        const current = lookup.get(key) ?? 0;
        lookup.set(key, current + 1);
      }
    }

    this.cryptidHomeLookup = lookup;
    return lookup;
  }

  private getBaseWeight(stateId: string, stateAbbr: string): number {
    const { baseWeights } = this.spawnConfig;
    const statesMap = baseWeights.states;
    const defaultWeight = baseWeights.default;

    const abbrKey = stateAbbr.toUpperCase();
    const idKey = stateId.trim();

    const abbrWeight = statesMap[abbrKey];
    const idWeight = statesMap[idKey];

    return abbrWeight ?? idWeight ?? defaultWeight;
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

  private applyCryptidBoost(stateAbbr: string, currentWeight: number): { weight: number; bonus: number; tag?: string } {
    const lookup = this.resolveCryptidLookup();
    const homeCount = lookup.get(stateAbbr.toUpperCase()) ?? 0;
    if (homeCount <= 0) {
      return { weight: currentWeight, bonus: 0 };
    }

    const cryptidConfig = this.spawnConfig.cryptidHomeStateBoost;
    const base = cryptidConfig.base;
    const perCryptid = cryptidConfig.perCryptid;
    const max = cryptidConfig.max;

    const boost = Math.min(max, base + homeCount * perCryptid);
    return { weight: currentWeight + boost, bonus: boost, tag: 'cryptid-home' };
  }

  rollForSpawn(
    round: number,
    gameState: Pick<GameState, 'states' | 'paranormalHotspots'>,
    options: HotspotSpawnOptions = {},
  ): WeightedHotspotCandidate | null {
    const { enabledExpansions = [], rng = Math.random, excludeStates = [] } = options;
    const enabledSet = new Set(enabledExpansions);
    const exclusionSet = new Set(excludeStates.map(value => value.trim().toUpperCase()));
    const activeHotspots = new Set(Object.keys(gameState.paranormalHotspots ?? {}));

    const candidates: Array<{
      state: GameState['states'][number];
      weight: number;
      breakdown: HotspotWeightBreakdown;
      tags: string[];
    }> = [];

    for (const state of gameState.states) {
      const abbr = state.abbreviation?.toUpperCase?.() ?? '';
      if (!abbr) {
        continue;
      }

      if (activeHotspots.has(abbr) || exclusionSet.has(abbr)) {
        continue;
      }

      const baseWeight = this.getBaseWeight(state.id ?? abbr, abbr);
      if (!baseWeight || baseWeight <= 0) {
        continue;
      }

      const breakdown: HotspotWeightBreakdown = { base: baseWeight, expansion: 0, cryptid: 0 };
      const tags = ['auto-spawn'];

      const expansionResult = this.applyExpansionModifiers(baseWeight, abbr, enabledSet);
      breakdown.expansion = expansionResult.bonus;
      if (expansionResult.tags.length > 0) {
        tags.push(...expansionResult.tags);
      }

      const cryptidResult = this.applyCryptidBoost(abbr, expansionResult.weight);
      breakdown.cryptid = cryptidResult.bonus;
      if (cryptidResult.tag) {
        tags.push(cryptidResult.tag);
      }

      const totalWeight = cryptidResult.weight;
      if (!totalWeight || totalWeight <= 0) {
        continue;
      }

      candidates.push({ state, weight: totalWeight, breakdown, tags });
    }

    if (candidates.length === 0) {
      return null;
    }

    const total = candidates.reduce((sum, entry) => sum + entry.weight, 0);
    const roll = rng() * total;
    let accumulator = 0;
    let selected = candidates[0];
    for (const entry of candidates) {
      accumulator += entry.weight;
      if (roll <= accumulator) {
        selected = entry;
        break;
      }
    }

    const { state, breakdown, weight, tags } = selected;
    const timestamp = Date.now();
    const baseName = state.name ?? state.abbreviation;
    const hotspotId = `auto:${state.abbreviation}:${round}:${timestamp}`;

    return {
      id: hotspotId,
      name: `${baseName} Hotspot`,
      kind: 'phenomenon',
      location: baseName,
      intensity: Math.max(1, Math.round(weight * 5)),
      status: 'spawning',
      tags,
      stateId: state.id,
      stateName: baseName,
      stateAbbreviation: state.abbreviation,
      totalWeight: weight,
      weightBreakdown: breakdown,
    };
  }
}
