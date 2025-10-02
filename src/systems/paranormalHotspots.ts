import hotspotsCatalog from '@/data/hotspots.catalog.json';
import hotspotsConfig from '@/data/hotspots.config.json';
import cryptidHomeStates from '@/data/cryptids.homestate.json';
import type { GameState } from '@/hooks/gameStateTypes';

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
