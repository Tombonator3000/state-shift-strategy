import type { GameEvent } from '@/data/eventDatabase';
import { resolvePoolForState, type ThemedEffect } from '@/data/stateThemedPools';
import type { ActiveStateBonus, StateRoundEventLogEntry } from '@/hooks/gameStateTypes';

const LCG_A = 1664525;
const LCG_C = 1013904223;
const UINT32_MAX = 0xffffffff;

const clamp = (value: number, min: number, max: number): number => {
  if (!Number.isFinite(value)) return 0;
  return Math.max(min, Math.min(max, Math.trunc(value)));
};

const EFFECT_LIMITS = {
  truth: { min: -8, max: 8 },
  ip: { min: -5, max: 5 },
  pressure: { min: -3, max: 3 },
} as const;

export class StateRoundRNG {
  private state: number;

  constructor(seed: number) {
    this.state = seed >>> 0 || 0x1f123bb5;
  }

  nextInt(): number {
    this.state = (Math.imul(this.state, LCG_A) + LCG_C) >>> 0;
    return this.state;
  }

  nextFloat(): number {
    return this.nextInt() / UINT32_MAX;
  }

  pickWeighted<T>(items: Array<{ weight: number; value: T }>): T | null {
    if (!items.length) {
      return null;
    }
    const total = items.reduce((sum, item) => sum + Math.max(0, item.weight), 0);
    if (total <= 0) {
      return items[0]?.value ?? null;
    }
    const roll = this.nextFloat() * total;
    let cursor = 0;
    for (const item of items) {
      const weight = Math.max(0, item.weight);
      cursor += weight;
      if (roll <= cursor) {
        return item.value;
      }
    }
    return items[items.length - 1]?.value ?? null;
  }

  chance(probability: number): boolean {
    if (probability <= 0) return false;
    if (probability >= 1) return true;
    return this.nextFloat() < probability;
  }
}

export const STATE_EVENT_CHANCE = 0.35;

export const computeRoundSeed = (baseSeed: number, round: number): number => {
  const normalizedBase = baseSeed >>> 0;
  const normalizedRound = Math.max(1, round) >>> 0;
  const mixed = Math.imul(normalizedRound ^ 0x9e3779b9, 0x7f4a7c15) ^ normalizedBase;
  const hashed = Math.imul(mixed ^ 0xa511e9b3, 0x632be5ab) >>> 0;
  return hashed || 0x9b9773e5;
};

interface AssignStateBonusesOptions {
  states: Array<{
    id: string;
    abbreviation: string;
    name: string;
    owner?: 'player' | 'ai' | 'neutral' | null;
  }>;
  baseSeed: number;
  round: number;
  playerFaction: 'truth' | 'government';
  eventChance?: number;
  existingBonuses?: Record<string, ActiveStateBonus | null | undefined>;
}

export interface AssignStateBonusesResult {
  bonuses: Record<string, ActiveStateBonus>;
  roundEvents: Record<string, StateRoundEventLogEntry[]>;
  logs: string[];
  playerTruthDelta: number;
  aiTruthDelta: number;
  playerIpDelta: number;
  aiIpDelta: number;
  pressureAdjustments: Record<string, { player: number; ai: number }>;
  newspaperEvents: GameEvent[];
  debug: {
    seed: number;
    rolls: Array<{ state: string; bonusId: string | null; eventId: string | null }>;
  };
}

const toBonus = (
  themed: ThemedEffect,
  state: AssignStateBonusesOptions['states'][number],
  round: number,
): ActiveStateBonus => {
  return {
    source: 'state-themed',
    id: themed.id,
    stateId: state.id,
    stateName: state.name,
    stateAbbreviation: state.abbreviation,
    round,
    label: themed.label,
    summary: themed.summary,
    headline: themed.headline,
    subhead: themed.subhead,
    icon: themed.icon,
    truthDelta: clamp(themed.effect.truthDelta ?? 0, EFFECT_LIMITS.truth.min, EFFECT_LIMITS.truth.max),
    ipDelta: clamp(themed.effect.ipDelta ?? 0, EFFECT_LIMITS.ip.min, EFFECT_LIMITS.ip.max),
    pressureDelta: clamp(
      themed.effect.pressureDelta ?? 0,
      EFFECT_LIMITS.pressure.min,
      EFFECT_LIMITS.pressure.max,
    ),
  } satisfies ActiveStateBonus;
};

const toRoundEvent = (
  themed: ThemedEffect,
  state: AssignStateBonusesOptions['states'][number],
  round: number,
): StateRoundEventLogEntry => {
  return {
    source: 'state-themed',
    id: themed.id,
    stateId: state.id,
    stateName: state.name,
    stateAbbreviation: state.abbreviation,
    round,
    headline: themed.headline,
    summary: themed.summary,
    subhead: themed.subhead,
    icon: themed.icon,
    truthDelta: clamp(themed.effect.truthDelta ?? 0, EFFECT_LIMITS.truth.min, EFFECT_LIMITS.truth.max),
    ipDelta: clamp(themed.effect.ipDelta ?? 0, EFFECT_LIMITS.ip.min, EFFECT_LIMITS.ip.max),
    pressureDelta: clamp(
      themed.effect.pressureDelta ?? 0,
      EFFECT_LIMITS.pressure.min,
      EFFECT_LIMITS.pressure.max,
    ),
  } satisfies StateRoundEventLogEntry;
};

const toGameEvent = (
  themed: ThemedEffect,
  state: AssignStateBonusesOptions['states'][number],
  round: number,
  probability: number,
): GameEvent => {
  const truthDelta = clamp(themed.effect.truthDelta ?? 0, EFFECT_LIMITS.truth.min, EFFECT_LIMITS.truth.max);
  const ipDelta = clamp(themed.effect.ipDelta ?? 0, EFFECT_LIMITS.ip.min, EFFECT_LIMITS.ip.max);
  const pressureDelta = clamp(
    themed.effect.pressureDelta ?? 0,
    EFFECT_LIMITS.pressure.min,
    EFFECT_LIMITS.pressure.max,
  );

  const effects: NonNullable<GameEvent['effects']> = {};
  let hasEffect = false;
  if (truthDelta) {
    effects.truth = truthDelta;
    hasEffect = true;
  }
  if (ipDelta) {
    effects.ip = ipDelta;
    hasEffect = true;
  }
  if (pressureDelta) {
    effects.stateEffects = {
      stateId: state.abbreviation,
      pressure: pressureDelta,
    };
    hasEffect = true;
  }

  return {
    id: `state-themed:${state.abbreviation}:${themed.id}:${round}`,
    title: themed.label,
    headline: themed.headline,
    content: themed.summary,
    type: 'conspiracy',
    rarity: 'uncommon',
    faction: 'truth',
    ...(hasEffect ? { effects } : {}),
    weight: Math.max(1, themed.weight),
    flavorText: themed.subhead,
    triggerChance: probability,
    conditionalChance: Math.min(1, probability / Math.max(1, themed.weight)),
  } satisfies GameEvent;
};

export const assignStateBonuses = (
  options: AssignStateBonusesOptions,
): AssignStateBonusesResult => {
  const seed = computeRoundSeed(options.baseSeed, options.round);
  const rng = new StateRoundRNG(seed);
  const bonuses: Record<string, ActiveStateBonus> = {};
  const roundEvents: Record<string, StateRoundEventLogEntry[]> = {};
  const logs: string[] = [];
  const newspaperEvents: GameEvent[] = [];
  const pressureAdjustments: Record<string, { player: number; ai: number }> = {};
  const rolls: Array<{ state: string; bonusId: string | null; eventId: string | null }> = [];

  let playerTruthDelta = 0;
  let aiTruthDelta = 0;
  let playerIpDelta = 0;
  let aiIpDelta = 0;

  const sortedStates = [...options.states].sort((a, b) => a.abbreviation.localeCompare(b.abbreviation));
  const eventChance = options.eventChance ?? STATE_EVENT_CHANCE;

  for (const state of sortedStates) {
    const owner = state.owner === 'player' || state.owner === 'ai' ? state.owner : 'neutral';

    const pool = resolvePoolForState({ id: state.id, abbreviation: state.abbreviation });
    if (!pool) {
      rolls.push({ state: state.abbreviation, bonusId: null, eventId: null });
      continue;
    }

    const existingBonus = options.existingBonuses?.[state.abbreviation] ?? null;
    const normalizedExistingBonus =
      existingBonus && existingBonus.stateAbbreviation === state.abbreviation
        ? existingBonus
        : null;

    const bonusRecord = normalizedExistingBonus
      ? { ...normalizedExistingBonus, round: options.round }
      : (() => {
          const bonus =
            rng.pickWeighted(pool.bonuses.map(entry => ({ weight: entry.weight, value: entry }))) ?? null;
          return bonus ? toBonus(bonus, state, options.round) : null;
        })();

    let selectedEvent: ThemedEffect | null = null;
    if (rng.chance(eventChance)) {
      selectedEvent = rng.pickWeighted(pool.events.map(entry => ({ weight: entry.weight, value: entry }))) ?? null;
    }

    rolls.push({
      state: state.abbreviation,
      bonusId: bonusRecord?.id ?? null,
      eventId: selectedEvent?.id ?? null,
    });

    if (bonusRecord) {
      bonuses[state.abbreviation] = bonusRecord;
      if (owner !== 'neutral') {
        if (owner === 'player') {
          playerTruthDelta += bonusRecord.truthDelta ?? 0;
          playerIpDelta += bonusRecord.ipDelta ?? 0;
        } else if (owner === 'ai') {
          aiTruthDelta += bonusRecord.truthDelta ?? 0;
          aiIpDelta += bonusRecord.ipDelta ?? 0;
        }
        if (bonusRecord.pressureDelta) {
          const existing = pressureAdjustments[state.abbreviation] ?? { player: 0, ai: 0 };
          pressureAdjustments[state.abbreviation] = {
            player: existing.player + (owner === 'player' ? bonusRecord.pressureDelta : 0),
            ai: existing.ai + (owner === 'ai' ? bonusRecord.pressureDelta : 0),
          };
        }
      }
    }

    if (selectedEvent) {
      const eventEntry = toRoundEvent(selectedEvent, state, options.round);
      if (owner !== 'neutral') {
        roundEvents[state.abbreviation] = [...(roundEvents[state.abbreviation] ?? []), eventEntry];
        if (owner === 'player') {
          playerTruthDelta += eventEntry.truthDelta ?? 0;
          playerIpDelta += eventEntry.ipDelta ?? 0;
        } else if (owner === 'ai') {
          aiTruthDelta += eventEntry.truthDelta ?? 0;
          aiIpDelta += eventEntry.ipDelta ?? 0;
        }
        if (eventEntry.pressureDelta) {
          const existing = pressureAdjustments[state.abbreviation] ?? { player: 0, ai: 0 };
          pressureAdjustments[state.abbreviation] = {
            player: existing.player + (owner === 'player' ? eventEntry.pressureDelta : 0),
            ai: existing.ai + (owner === 'ai' ? eventEntry.pressureDelta : 0),
          };
        }
      }
      logs.push(`${eventEntry.icon ?? '🗞️'} ${state.name} reports: ${eventEntry.headline}`);
      newspaperEvents.push(toGameEvent(selectedEvent, state, options.round, eventChance));
    }
  }

  return {
    bonuses,
    roundEvents,
    logs,
    playerTruthDelta,
    aiTruthDelta,
    playerIpDelta,
    aiIpDelta,
    pressureAdjustments,
    newspaperEvents,
    debug: {
      seed,
      rolls,
    },
  } satisfies AssignStateBonusesResult;
};
