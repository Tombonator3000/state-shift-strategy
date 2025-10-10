import type { CardEffects, CardStateBonusDefinition } from '@/rules/mvp';
import type { ActiveStateBonus, StateRoundEventLogEntry } from '@/hooks/gameStateTypes';
import type { GameEvent } from '@/data/eventDatabase';
import { DEFAULT_EVENT_TRIGGER_CHANCE } from '@/data/eventDatabase';
import { STATE_THEMED_POOLS, type ThemedEffect } from '@/data/stateThemedPools';
import { USA_STATES } from '@/data/usaStates';

/**
 * State-Specific Card Bonuses
 * Cards get additional effects when played in thematically appropriate states.
 */

export interface AssignStateBonusesResult {
  bonuses: Record<string, ActiveStateBonus | null>;
  roundEvents: Record<string, StateRoundEventLogEntry[]>;
  pressureAdjustments: Record<string, { player: number; ai: number }>;
  playerTruthDelta: number;
  aiTruthDelta: number;
  playerIpDelta: number;
  aiIpDelta: number;
  logs: string[];
  newspaperEvents: GameEvent[];
  debug?: AssignStateBonusDebugInfo;
}

export interface StateBonusConfig {
  stateIds: string[]; // State abbreviations like 'NM', 'NV', 'TX'
  cardPatterns: {
    nameIncludes?: string[];
    tagsAny?: string[];
    cardIds?: string[];
  };
  bonus: CardEffects;
  label: string;
}

export const STATE_BONUS_CONFIGS: StateBonusConfig[] = [
  {
    stateIds: ['NM'],
    cardPatterns: {
      nameIncludes: ['roswell', 'alien', 'ufo'],
      tagsAny: ['roswell', 'alien', 'ufo'],
    },
    bonus: {
      pressureDelta: 1,
      truthDelta: 1,
    },
    label: 'Roswell Resonance',
  },
  {
    stateIds: ['NV'],
    cardPatterns: {
      nameIncludes: ['area 51', 'area51', 'groom lake'],
      tagsAny: ['area-51', 'nevada-test-site'],
    },
    bonus: {
      truthDelta: 2,
    },
    label: 'Nevada Hotspot',
  },
  {
    stateIds: ['FL'],
    cardPatterns: {
      nameIncludes: ['florida man', 'florida'],
      tagsAny: ['florida', 'florida-man'],
    },
    bonus: {
      ipDelta: { self: 1 },
      pressureDelta: 1,
    },
    label: 'Florida Chaos Multiplier',
  },
  {
    stateIds: ['TN'],
    cardPatterns: {
      nameIncludes: ['elvis'],
      tagsAny: ['elvis', 'memphis'],
    },
    bonus: {
      truthDelta: 1,
    },
    label: 'Memphis Magic',
  },
  {
    stateIds: ['TX'],
    cardPatterns: {
      nameIncludes: ['chupacabra'],
      tagsAny: ['chupacabra', 'texas'],
    },
    bonus: {
      pressureDelta: 1,
    },
    label: 'Texas Legend',
  },
  {
    stateIds: ['WA'],
    cardPatterns: {
      nameIncludes: ['bigfoot', 'sasquatch'],
      tagsAny: ['bigfoot', 'sasquatch', 'pacific-northwest'],
    },
    bonus: {
      truthDelta: 1,
    },
    label: 'Pacific Northwest Mystery',
  },
  {
    stateIds: ['WV'],
    cardPatterns: {
      nameIncludes: ['mothman'],
      tagsAny: ['mothman', 'point-pleasant'],
    },
    bonus: {
      truthDelta: 1,
      pressureDelta: 1,
    },
    label: 'Mothman Country',
  },
  {
    stateIds: ['NJ'],
    cardPatterns: {
      nameIncludes: ['jersey devil'],
      tagsAny: ['jersey-devil', 'pine-barrens'],
    },
    bonus: {
      pressureDelta: 1,
    },
    label: 'Pine Barrens Terror',
  },
  {
    stateIds: ['DC'],
    cardPatterns: {
      nameIncludes: ['conspiracy', 'cover-up', 'classified', 'government'],
      tagsAny: ['conspiracy', 'cover-up', 'classified', 'leak'],
    },
    bonus: {
      truthDelta: 1,
    },
    label: 'Capital Exposure',
  },
  {
    stateIds: ['AZ'],
    cardPatterns: {
      nameIncludes: ['phoenix lights', 'desert'],
      tagsAny: ['phoenix-lights', 'arizona'],
    },
    bonus: {
      truthDelta: 1,
    },
    label: 'Phoenix Phenomenon',
  },
];

type Owner = 'player' | 'ai' | 'neutral';
type OwnerFaction = 'truth' | 'government' | 'neutral';

interface StateContext {
  id: string;
  abbreviation: string;
  name: string;
}

const STATE_CONTEXT_LOOKUP = (() => {
  const lookup = new Map<string, StateContext>();
  for (const state of USA_STATES) {
    const context: StateContext = {
      id: state.id,
      abbreviation: state.abbreviation,
      name: state.name,
    };
    const keys = [state.id, state.abbreviation, state.name];
    for (const key of keys) {
      if (typeof key === 'string' && key.trim().length > 0) {
        lookup.set(key.trim().toLowerCase(), context);
      }
    }
  }
  return lookup;
})();

const normalizeStateKey = (value: string): string => value.trim().toLowerCase();

const resolveStateContext = (identifier: string | null | undefined): StateContext | null => {
  if (!identifier) return null;
  const normalized = normalizeStateKey(identifier);
  return STATE_CONTEXT_LOOKUP.get(normalized) ?? null;
};

const normalizeCardStateBonusDefinition = (
  definition: CardStateBonusDefinition,
): { effects: CardEffects; label?: string } => {
  if (!definition || typeof definition !== 'object') {
    return { effects: {} };
  }

  if ('effects' in definition) {
    const effects = definition.effects ?? {};
    return { effects, label: definition.label ?? undefined };
  }

  return { effects: definition as CardEffects };
};

const matchConfigPatterns = (
  cardPatterns: StateBonusConfig['cardPatterns'],
  cardName: string,
  cardTags: string[],
  cardId: string,
): boolean => {
  const { nameIncludes, tagsAny, cardIds } = cardPatterns;

  if (cardIds?.some(entry => entry === cardId)) {
    return true;
  }

  if (nameIncludes && nameIncludes.length > 0) {
    const lower = cardName.toLowerCase();
    if (nameIncludes.some(pattern => lower.includes(pattern.toLowerCase()))) {
      return true;
    }
  }

  if (tagsAny && tagsAny.length > 0 && cardTags.length > 0) {
    const normalizedTags = cardTags.map(tag => tag.toLowerCase());
    if (tagsAny.some(pattern => normalizedTags.includes(pattern.toLowerCase()))) {
      return true;
    }
  }

  return false;
};

const deriveConfigLabelForState = (
  stateContext: StateContext | null,
  cardName: string,
  cardTags: string[],
  cardId: string,
): string | undefined => {
  if (!stateContext) return undefined;
  const candidateIds = new Set<string>([
    stateContext.id,
    stateContext.abbreviation,
  ]);

  for (const config of STATE_BONUS_CONFIGS) {
    if (!config.stateIds.some(id => candidateIds.has(id))) continue;
    if (matchConfigPatterns(config.cardPatterns, cardName, cardTags, cardId)) {
      return config.label;
    }
  }

  return undefined;
};

const resolveConfigMatch = (
  targetStateId: string,
  cardName: string,
  cardTags: string[],
  cardId: string,
): { bonus: CardEffects; label: string } | null => {
  const stateContext = resolveStateContext(targetStateId);
  const candidateIds = new Set<string>([targetStateId]);
  if (stateContext) {
    candidateIds.add(stateContext.abbreviation);
    candidateIds.add(stateContext.id);
  }

  for (const config of STATE_BONUS_CONFIGS) {
    if (!config.stateIds.some(id => candidateIds.has(id))) continue;
    if (!matchConfigPatterns(config.cardPatterns, cardName, cardTags, cardId)) {
      continue;
    }

    return { bonus: config.bonus, label: config.label };
  }

  return null;
};

/**
 * Check if a card qualifies for state bonuses
 */
export function checkStateBonuses(
  cardName: string,
  cardTags: string[] = [],
  cardId: string,
  targetStateId: string | null,
  cardStateBonuses?: Record<string, CardStateBonusDefinition>,
): { bonus: CardEffects; label: string } | null {
  if (!targetStateId) return null;

  const stateContext = resolveStateContext(targetStateId);
  const synonyms = new Set<string>([normalizeStateKey(targetStateId)]);
  if (stateContext) {
    synonyms.add(normalizeStateKey(stateContext.name));
    synonyms.add(normalizeStateKey(stateContext.abbreviation));
    synonyms.add(normalizeStateKey(stateContext.id));
  }

  if (cardStateBonuses) {
    for (const [rawKey, definition] of Object.entries(cardStateBonuses)) {
      const normalizedKey = normalizeStateKey(rawKey);
      if (!synonyms.has(normalizedKey)) {
        continue;
      }

      const normalized = normalizeCardStateBonusDefinition(definition);
      const label = normalized.label
        ?? deriveConfigLabelForState(stateContext, cardName, cardTags, cardId)
        ?? (stateContext ? `${stateContext.name} Bonus` : 'State Bonus');

      return { bonus: normalized.effects, label };
    }
  }

  const configMatch = resolveConfigMatch(targetStateId, cardName, cardTags, cardId);
  if (configMatch) {
    return configMatch;
  }

  return null;
}

export interface AssignStateBonusesParams {
  states: Array<{
    id: string;
    abbreviation: string;
    name: string;
    owner?: Owner;
  }>;
  baseSeed: number;
  round: number;
  playerFaction: 'truth' | 'government';
  existingBonuses?: Record<string, ActiveStateBonus | null | undefined>;
  eventChance?: number;
}

const clampSeed = (value: number): number => (value >>> 0) & 0xffffffff;

const FNV_OFFSET_BASIS = 0x811c9dc5;
const FNV_PRIME = 0x01000193;

const hashSeed = (input: string): number => {
  let hash = FNV_OFFSET_BASIS;
  for (let index = 0; index < input.length; index += 1) {
    hash ^= input.charCodeAt(index);
    hash = Math.imul(hash, FNV_PRIME);
    hash >>>= 0;
  }
  return hash >>> 0;
};

const mulberry32 = (seed: number): (() => number) => {
  let state = clampSeed(seed);
  return () => {
    state = clampSeed(state + 0x6d2b79f5);
    let t = state;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
};

export const computeRoundSeed = (baseSeed: number, round: number): number => {
  const normalizedBase = clampSeed(baseSeed);
  const normalizedRound = clampSeed(round);
  return hashSeed(`${normalizedBase}:${normalizedRound}`);
};

const resolveOwnerFaction = (
  owner: Owner,
  playerFaction: 'truth' | 'government',
): OwnerFaction => {
  if (owner === 'neutral') {
    return 'neutral';
  }

  if (owner === 'player') {
    return playerFaction;
  }

  return playerFaction === 'truth' ? 'government' : 'truth';
};

const adjustTruthDeltaForFaction = (baseTruth: number, faction: OwnerFaction): number => {
  if (faction === 'neutral') {
    return 0;
  }
  const normalized = Math.trunc(baseTruth);
  return faction === 'truth' ? normalized : -normalized;
};

const extractBonusEffects = (effect: ThemedEffect['effect']) => ({
  truth: Math.trunc(effect.truthDelta ?? 0),
  ip: Math.trunc(effect.ipDelta ?? 0),
  pressure: Math.trunc(effect.pressureDelta ?? 0),
});

const formatEffectDelta = (value: number, label: string): string | null => {
  if (!value) {
    return null;
  }
  const prefix = value > 0 ? '+' : '';
  return `${label} ${prefix}${value}`;
};

const formatBonusSummary = (bonus: ActiveStateBonus): string | null => {
  const parts: (string | null)[] = [
    formatEffectDelta(bonus.truthDelta ?? 0, 'Truth'),
    formatEffectDelta(bonus.ipDelta ?? 0, 'IP'),
    formatEffectDelta(bonus.pressureDelta ?? 0, 'Pressure'),
  ];
  const filtered = parts.filter((part): part is string => Boolean(part));
  return filtered.length > 0 ? filtered.join(', ') : null;
};

const selectWeightedEffect = (effects: ThemedEffect[], rng: () => number): ThemedEffect | null => {
  if (effects.length === 0) {
    return null;
  }

  const normalized = effects.map(effect => ({
    effect,
    weight: Math.max(1, Math.trunc(effect.weight ?? 1)),
  }));

  const totalWeight = normalized.reduce((sum, entry) => sum + entry.weight, 0);
  if (totalWeight <= 0) {
    return normalized[0]?.effect ?? null;
  }

  const roll = rng() * totalWeight;
  let accumulator = 0;
  for (const entry of normalized) {
    accumulator += entry.weight;
    if (roll <= accumulator) {
      return entry.effect;
    }
  }

  return normalized[normalized.length - 1]?.effect ?? null;
};

const gatherStatePools = (state: { id: string; abbreviation: string }): { bonuses: ThemedEffect[]; events: ThemedEffect[] } => {
  const bonuses: ThemedEffect[] = [];
  const events: ThemedEffect[] = [];
  for (const pool of STATE_THEMED_POOLS) {
    const matches = pool.tag.states.some(candidate => {
      const normalized = candidate.trim().toUpperCase();
      return normalized === state.abbreviation || normalized === state.id;
    });
    if (!matches) continue;
    bonuses.push(...pool.bonuses);
    events.push(...pool.events);
  }
  return { bonuses, events };
};

const createActiveBonusFromEffect = (
  effect: ThemedEffect,
  params: {
    state: { id: string; name: string; abbreviation: string };
    ownerFaction: OwnerFaction;
    round: number;
  },
): ActiveStateBonus => {
  const { state, ownerFaction, round } = params;
  const { truth, ip, pressure } = extractBonusEffects(effect.effect);
  const adjustedTruth = adjustTruthDeltaForFaction(truth, ownerFaction);

  return {
    source: 'state-themed',
    id: effect.id,
    stateId: state.id,
    stateName: state.name,
    stateAbbreviation: state.abbreviation,
    round,
    label: effect.label,
    summary: effect.summary,
    headline: effect.headline,
    subhead: effect.subhead,
    icon: effect.icon,
    truthDelta: adjustedTruth,
    ipDelta: ip,
    pressureDelta: pressure,
  } satisfies ActiveStateBonus;
};

const createRoundEventEntry = (
  effect: ThemedEffect,
  params: {
    state: { id: string; name: string; abbreviation: string };
    ownerFaction: OwnerFaction;
    round: number;
  },
): { entry: StateRoundEventLogEntry; truth: number; ip: number; pressure: number } => {
  const { state, ownerFaction, round } = params;
  const { truth, ip, pressure } = extractBonusEffects(effect.effect);
  const adjustedTruth = adjustTruthDeltaForFaction(truth, ownerFaction);

  return {
    entry: {
      source: 'state-themed',
      id: `${effect.id}:r${round}`,
      stateId: state.id,
      stateName: state.name,
      stateAbbreviation: state.abbreviation,
      round,
      headline: effect.headline,
      summary: effect.summary,
      subhead: effect.subhead,
      icon: effect.icon,
      truthDelta: adjustedTruth,
      ipDelta: ip,
      pressureDelta: pressure,
    },
    truth: adjustedTruth,
    ip,
    pressure,
  };
};

const createNewspaperEventFromEffect = (
  effect: ThemedEffect,
  params: {
    state: { id: string; name: string; abbreviation: string };
    ownerFaction: OwnerFaction;
    round: number;
    eventChance: number;
  },
): GameEvent => {
  const { state, ownerFaction, round, eventChance } = params;
  const { truth, ip, pressure } = extractBonusEffects(effect.effect);
  const adjustedTruth = adjustTruthDeltaForFaction(truth, ownerFaction);
  const weight = Math.max(1, Math.trunc(effect.weight ?? 1));
  const conditionalChance = Math.min(1, eventChance / weight);

  return {
    id: `state-themed:${effect.id}:${state.abbreviation}:r${round}`,
    title: effect.label,
    headline: effect.headline,
    content: effect.summary,
    type: 'random',
    rarity: 'uncommon',
    faction: ownerFaction === 'neutral' ? 'neutral' : ownerFaction,
    effects: {
      truthChange: adjustedTruth,
      ipChange: ip,
      stateEffects: pressure ? { stateId: state.id, pressure } : undefined,
    },
    weight,
    triggerChance: eventChance,
    conditionalChance,
    flavorText: effect.subhead,
  } satisfies GameEvent;
};

const DEFAULT_OWNER: Owner = 'neutral';

const normalizeOwner = (owner: Owner | undefined): Owner => {
  if (owner === 'player' || owner === 'ai') {
    return owner;
  }
  return DEFAULT_OWNER;
};

interface AssignStateBonusDebugStateEntry {
  seed: number;
  reused: boolean;
  bonusId: string | null;
  eventIds: string[];
  owner: Owner;
}

interface AssignStateBonusDebugInfo {
  seed: number;
  eventChance: number;
  states: Record<string, AssignStateBonusDebugStateEntry>;
}

/**
 * Assign state bonuses for the current round
 * This is a placeholder implementation - the real logic would evaluate
 * state ownership, round progression, and bonus eligibility
 */
export function assignStateBonuses(
  params: AssignStateBonusesParams,
): AssignStateBonusesResult {
  const {
    states,
    baseSeed,
    round,
    playerFaction,
    existingBonuses = {},
    eventChance = DEFAULT_EVENT_TRIGGER_CHANCE,
  } = params;

  const normalizedStates = [...states]
    .map(state => ({
      id: state.id,
      abbreviation: state.abbreviation ?? state.id,
      name: state.name ?? state.abbreviation ?? state.id,
      owner: normalizeOwner(state.owner),
    }))
    .sort((a, b) => a.abbreviation.localeCompare(b.abbreviation));

  const seed = computeRoundSeed(baseSeed, round);
  const debugStates: Record<string, AssignStateBonusDebugStateEntry> = {};

  const bonuses: Record<string, ActiveStateBonus | null> = {};
  const roundEvents: Record<string, StateRoundEventLogEntry[]> = {};
  const pressureAdjustments: Record<string, { player: number; ai: number }> = {};
  const logs: string[] = [];
  const newspaperEvents: GameEvent[] = [];

  let playerTruthDelta = 0;
  let aiTruthDelta = 0;
  let playerIpDelta = 0;
  let aiIpDelta = 0;

  for (const state of normalizedStates) {
    const stateSeed = hashSeed(`${seed}:${state.abbreviation}`);
    const rng = mulberry32(stateSeed);
    const ownerFaction = resolveOwnerFaction(state.owner, playerFaction);
    const pools = gatherStatePools(state);

    const existing = existingBonuses[state.abbreviation] ?? null;
    let activeBonus: ActiveStateBonus | null = existing ? { ...existing } : null;
    let bonusTruth = activeBonus?.truthDelta ?? 0;
    let bonusIp = activeBonus?.ipDelta ?? 0;
    let bonusPressure = activeBonus?.pressureDelta ?? 0;
    let reused = Boolean(existing);

    if (!activeBonus && pools.bonuses.length > 0) {
      const selectedEffect = selectWeightedEffect(pools.bonuses, rng);
      if (selectedEffect) {
        activeBonus = createActiveBonusFromEffect(selectedEffect, {
          state,
          ownerFaction,
          round,
        });
        bonusTruth = activeBonus.truthDelta ?? 0;
        bonusIp = activeBonus.ipDelta ?? 0;
        bonusPressure = activeBonus.pressureDelta ?? 0;
        reused = false;

        const summary = formatBonusSummary(activeBonus);
        const summarySuffix = summary ? ` (${summary})` : '';
        logs.push(`🗺️ ${state.name} preps ${activeBonus.label}${summarySuffix}`);
      }
    }

    bonuses[state.abbreviation] = activeBonus ?? null;

    const stateRoundEvents: StateRoundEventLogEntry[] = [];
    let accumulatedTruth = bonusTruth;
    let accumulatedIp = bonusIp;
    let accumulatedPressure = bonusPressure;

    if (pools.events.length > 0) {
      const triggerRoll = rng();
      if (triggerRoll < eventChance) {
        const selectedEvent = selectWeightedEffect(pools.events, rng);
        if (selectedEvent) {
          const { entry, truth, ip, pressure } = createRoundEventEntry(selectedEvent, {
            state,
            ownerFaction,
            round,
          });
          stateRoundEvents.push(entry);
          accumulatedTruth += truth;
          accumulatedIp += ip;
          accumulatedPressure += pressure;

          logs.push(`🗞️ ${state.name} reports: ${entry.headline ?? entry.summary ?? entry.id}`);

          const newspaperEvent = createNewspaperEventFromEffect(selectedEvent, {
            state,
            ownerFaction,
            round,
            eventChance,
          });
          newspaperEvents.push(newspaperEvent);
        }
      }
    }

    if (stateRoundEvents.length > 0) {
      roundEvents[state.abbreviation] = stateRoundEvents;
    }

    if (state.owner === 'player') {
      playerTruthDelta += accumulatedTruth;
      playerIpDelta += accumulatedIp;
    } else if (state.owner === 'ai') {
      aiTruthDelta += accumulatedTruth;
      aiIpDelta += accumulatedIp;
    }

    if (accumulatedPressure !== 0) {
      if (state.owner === 'player') {
        pressureAdjustments[state.abbreviation] = {
          player: accumulatedPressure,
          ai: 0,
        };
      } else if (state.owner === 'ai') {
        pressureAdjustments[state.abbreviation] = {
          player: 0,
          ai: accumulatedPressure,
        };
      }
    }

    debugStates[state.abbreviation] = {
      seed: stateSeed,
      reused,
      bonusId: activeBonus?.id ?? null,
      eventIds: stateRoundEvents.map(event => event.id),
      owner: state.owner,
    } satisfies AssignStateBonusDebugStateEntry;
  }

  const debug: AssignStateBonusDebugInfo = {
    seed,
    eventChance,
    states: debugStates,
  };

  if (playerTruthDelta !== 0 || aiTruthDelta !== 0) {
    logs.push(
      `Truth sway: player ${playerTruthDelta >= 0 ? '+' : ''}${playerTruthDelta}, AI ${aiTruthDelta >= 0 ? '+' : ''}${aiTruthDelta}`,
    );
  }

  if (playerIpDelta !== 0 || aiIpDelta !== 0) {
    logs.push(
      `IP adjustments: player ${playerIpDelta >= 0 ? '+' : ''}${playerIpDelta}, AI ${aiIpDelta >= 0 ? '+' : ''}${aiIpDelta}`,
    );
  }

  return {
    bonuses,
    roundEvents,
    pressureAdjustments,
    playerTruthDelta,
    aiTruthDelta,
    playerIpDelta,
    aiIpDelta,
    logs,
    newspaperEvents,
    debug,
  } satisfies AssignStateBonusesResult;
}

export default STATE_BONUS_CONFIGS;
