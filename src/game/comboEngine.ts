import { clampIP } from '@/engine/applyEffects-mvp';
import { applyTruthDelta } from '@/utils/truth';
import type { GameState, PlayerId } from '@/mvp/validator';
import { COMBO_DEFINITIONS, DEFAULT_COMBO_SETTINGS } from './combo.config';
import {
  type ComboDefinition,
  type ComboEvaluation,
  type ComboOptions,
  type ComboResult,
  type ComboSettings,
  type ComboSummary,
  type ComboTrigger,
  type ComboReward,
  type TurnPlay,
} from './combo.types';

interface ComboMetrics {
  ipSpent: number;
  attackSpent: number;
  mediaSpent: number;
  zoneSpent: number;
  plays: number;
  lowCostCount: number;
  highCostCount: number;
  uniqueStatesTargeted: number;
  stateCounts: Map<string, number>;
  lowCostPlays: TurnPlay[];
  highCostPlays: TurnPlay[];
  attackPlays: TurnPlay[];
  mediaPlays: TurnPlay[];
  zonePlays: TurnPlay[];
  targetedPlays: TurnPlay[];
}

let comboSettings: ComboSettings = ensureToggleCoverage({
  ...DEFAULT_COMBO_SETTINGS,
  comboToggles: { ...DEFAULT_COMBO_SETTINGS.comboToggles },
});

let currentComboRng: () => number = comboSettings.rng ?? Math.random;

let lastComboSummary: ComboSummary | null = null;

function ensureToggleCoverage(settings: ComboSettings): ComboSettings {
  const toggles = { ...settings.comboToggles };
  for (const def of COMBO_DEFINITIONS) {
    if (typeof toggles[def.id] === 'undefined') {
      toggles[def.id] = def.enabledByDefault ?? true;
    }
  }
  const rng = settings.rng ?? DEFAULT_COMBO_SETTINGS.rng ?? Math.random;
  return { ...settings, comboToggles: toggles, rng };
}

export function getComboSettings(): ComboSettings {
  return ensureToggleCoverage(comboSettings);
}

export function getComboRng(): () => number {
  return currentComboRng;
}

export function setComboSettings(update: Partial<ComboSettings>): ComboSettings {
  const base = ensureToggleCoverage(comboSettings);
  const next: ComboSettings = {
    ...base,
    ...update,
    comboToggles: { ...base.comboToggles },
  };

  if (update.comboToggles) {
    for (const [key, value] of Object.entries(update.comboToggles)) {
      next.comboToggles[key] = value;
    }
  }

  next.maxCombosPerTurn = Number.isFinite(next.maxCombosPerTurn)
    ? Math.max(0, Math.floor(next.maxCombosPerTurn))
    : base.maxCombosPerTurn;

  comboSettings = ensureToggleCoverage(next);
  currentComboRng = comboSettings.rng ?? currentComboRng;
  return comboSettings;
}

function resolveSettings(overrides?: ComboOptions): ComboSettings {
  const base = ensureToggleCoverage(comboSettings);
  if (!overrides) {
    return base;
  }

  const merged: ComboSettings = {
    ...base,
    ...overrides,
    comboToggles: { ...base.comboToggles },
  } satisfies ComboSettings;

  if (overrides.comboToggles) {
    for (const [key, value] of Object.entries(overrides.comboToggles)) {
      merged.comboToggles[key] = value;
    }
  }

  if (overrides.disabledCombos) {
    for (const id of overrides.disabledCombos) {
      merged.comboToggles[id] = false;
    }
  }

  if (overrides.maxCombosPerTurn !== undefined) {
    merged.maxCombosPerTurn = Math.max(0, Math.floor(overrides.maxCombosPerTurn));
  }

  merged.rng = overrides.rng ?? base.rng ?? DEFAULT_COMBO_SETTINGS.rng ?? Math.random;

  return ensureToggleCoverage(merged);
}

function computeMetrics(plays: TurnPlay[]): ComboMetrics {
  const attackPlays = plays.filter(play => play.cardType === 'ATTACK');
  const mediaPlays = plays.filter(play => play.cardType === 'MEDIA');
  const zonePlays = plays.filter(play => play.cardType === 'ZONE');
  const targetedPlays = zonePlays.filter(play => typeof play.targetStateId === 'string' && play.targetStateId.length > 0);

  const stateCounts = new Map<string, number>();
  for (const play of targetedPlays) {
    const key = play.targetStateId!;
    stateCounts.set(key, (stateCounts.get(key) ?? 0) + 1);
  }

  const lowCostPlays = plays.filter(play => play.cost <= 2);
  const highCostPlays = plays.filter(play => play.cost >= 6);

  return {
    ipSpent: plays.reduce((acc, play) => acc + play.cost, 0),
    attackSpent: attackPlays.reduce((acc, play) => acc + play.cost, 0),
    mediaSpent: mediaPlays.reduce((acc, play) => acc + play.cost, 0),
    zoneSpent: zonePlays.reduce((acc, play) => acc + play.cost, 0),
    plays: plays.length,
    lowCostCount: lowCostPlays.length,
    highCostCount: highCostPlays.length,
    uniqueStatesTargeted: new Set(targetedPlays.map(play => play.targetStateId)).size,
    stateCounts,
    lowCostPlays,
    highCostPlays,
    attackPlays,
    mediaPlays,
    zonePlays,
    targetedPlays,
  } satisfies ComboMetrics;
}

function matchesRarity(actual: string, required?: string | null): boolean {
  if (!required || required === 'ANY') {
    return true;
  }

  if (required === 'rare') {
    return actual === 'rare' || actual === 'legendary';
  }

  return actual === required;
}

interface TriggerMatchResult {
  success: boolean;
  matchedPlays: TurnPlay[];
  extra?: Record<string, number | string>;
}

function mergeMatchResults(results: TriggerMatchResult[]): TriggerMatchResult {
  const matched = new Map<number, TurnPlay>();
  for (const result of results) {
    for (const play of result.matchedPlays) {
      matched.set(play.sequence, play);
    }
  }
  const extra: Record<string, number | string> = {};
  for (const result of results) {
    if (result.extra) {
      Object.assign(extra, result.extra);
    }
  }
  return {
    success: true,
    matchedPlays: Array.from(matched.values()).sort((a, b) => a.sequence - b.sequence),
    extra: Object.keys(extra).length > 0 ? extra : undefined,
  };
}

function matchSequence(
  trigger: Extract<ComboTrigger, { kind: 'sequence' }>,
  plays: TurnPlay[],
): TriggerMatchResult {
  const { sequence, allowGaps } = trigger;
  if (sequence.length === 0) {
    return { success: true, matchedPlays: [] };
  }

  if (allowGaps) {
    const matched: TurnPlay[] = [];
    let index = 0;
    for (const play of plays) {
      if (play.cardType === sequence[index]) {
        matched.push(play);
        index += 1;
        if (index >= sequence.length) {
          return { success: true, matchedPlays: matched };
        }
      }
    }
    return { success: false, matchedPlays: [] };
  }

  for (let i = 0; i <= plays.length - sequence.length; i++) {
    const window = plays.slice(i, i + sequence.length);
    if (window.every((play, idx) => play.cardType === sequence[idx])) {
      return { success: true, matchedPlays: window };
    }
  }

  return { success: false, matchedPlays: [] };
}

function matchCount(
  trigger: Extract<ComboTrigger, { kind: 'count' }>,
  plays: TurnPlay[],
): TriggerMatchResult {
  const filtered = plays.filter(play => (trigger.type === 'ANY' || play.cardType === trigger.type) && matchesRarity(play.cardRarity, trigger.rarity));
  const count = filtered.length;
  const operator = trigger.operator ?? '>=';
  let success = false;
  if (operator === '>=' && count >= trigger.count) {
    success = true;
  } else if (operator === '<=' && count <= trigger.count) {
    success = true;
  } else if (operator === '==' && count === trigger.count) {
    success = true;
  }

  return {
    success,
    matchedPlays: success ? filtered.slice(0, trigger.count) : [],
    extra: success ? { count } : undefined,
  };
}

function matchThreshold(
  trigger: Extract<ComboTrigger, { kind: 'threshold' }>,
  metrics: ComboMetrics,
): TriggerMatchResult {
  let success = false;
  let matched: TurnPlay[] = [];
  let actual = 0;

  switch (trigger.metric) {
    case 'ipSpent':
      actual = metrics.ipSpent;
      matched = metrics.attackPlays.concat(metrics.mediaPlays, metrics.zonePlays);
      success = actual >= trigger.value;
      break;
    case 'attackSpent':
      actual = metrics.attackSpent;
      matched = metrics.attackPlays;
      success = actual >= trigger.value;
      break;
    case 'mediaSpent':
      actual = metrics.mediaSpent;
      matched = metrics.mediaPlays;
      success = actual >= trigger.value;
      break;
    case 'zoneSpent':
      actual = metrics.zoneSpent;
      matched = metrics.zonePlays;
      success = actual >= trigger.value;
      break;
    case 'uniqueStatesTargeted':
      actual = metrics.uniqueStatesTargeted;
      matched = metrics.targetedPlays;
      success = actual >= trigger.value;
      break;
    case 'plays':
      actual = metrics.plays;
      matched = metrics.attackPlays.concat(metrics.mediaPlays, metrics.zonePlays);
      success = actual >= trigger.value;
      break;
    case 'lowCostCount':
      actual = metrics.lowCostCount;
      matched = metrics.lowCostPlays;
      success = actual >= trigger.value;
      break;
    case 'highCostCount':
      actual = metrics.highCostCount;
      matched = metrics.highCostPlays;
      success = actual >= trigger.value;
      break;
  }

  return {
    success,
    matchedPlays: success ? matched : [],
    extra: success ? { value: actual } : undefined,
  };
}

function matchState(
  trigger: Extract<ComboTrigger, { kind: 'state' }>,
  metrics: ComboMetrics,
): TriggerMatchResult {
  const { cardType, targetList, sameStateCount, uniqueStatesCount } = trigger;

  let candidates = metrics.targetedPlays;
  if (cardType && cardType !== 'ANY') {
    candidates = candidates.filter(play => play.cardType === cardType);
  }

  if (targetList && targetList.length > 0) {
    const set = new Set(targetList);
    candidates = candidates.filter(play => play.targetStateId && set.has(play.targetStateId));
  }

  const counts = new Map<string, number>();
  for (const play of candidates) {
    const key = play.targetStateId!;
    counts.set(key, (counts.get(key) ?? 0) + 1);
  }

  if (sameStateCount && sameStateCount > 0) {
    for (const [state, value] of counts.entries()) {
      if (value >= sameStateCount) {
        const matched = candidates.filter(play => play.targetStateId === state).slice(0, sameStateCount);
        return {
          success: true,
          matchedPlays: matched,
          extra: { state },
        };
      }
    }
    return { success: false, matchedPlays: [] };
  }

  if (uniqueStatesCount && uniqueStatesCount > 0) {
    const unique = new Set(candidates.map(play => play.targetStateId));
    if (unique.size >= uniqueStatesCount) {
      const matched: TurnPlay[] = [];
      const taken = new Set<string>();
      for (const play of candidates) {
        if (!play.targetStateId) continue;
        if (taken.has(play.targetStateId)) continue;
        matched.push(play);
        taken.add(play.targetStateId);
        if (taken.size >= uniqueStatesCount) {
          break;
        }
      }
      return {
        success: true,
        matchedPlays: matched,
        extra: { unique: unique.size },
      };
    }
    return { success: false, matchedPlays: [] };
  }

  return { success: candidates.length > 0, matchedPlays: candidates };
}

function evaluateTrigger(
  trigger: ComboTrigger,
  plays: TurnPlay[],
  metrics: ComboMetrics,
): TriggerMatchResult {
  switch (trigger.kind) {
    case 'sequence':
      return matchSequence(trigger, plays);
    case 'count':
      return matchCount(trigger, plays);
    case 'threshold':
      return matchThreshold(trigger, metrics);
    case 'state':
      return matchState(trigger, metrics);
    case 'hybrid': {
      const { triggers, mode = 'all' } = trigger;
      const results: TriggerMatchResult[] = [];
      let anySuccess = false;
      for (const inner of triggers) {
        const res = evaluateTrigger(inner, plays, metrics);
        results.push(res);
        if (res.success) {
          anySuccess = true;
        } else if (mode === 'all') {
          return { success: false, matchedPlays: [] };
        }
      }

      if (mode === 'any') {
        const winners = results.filter(result => result.success);
        if (winners.length === 0) {
          return { success: false, matchedPlays: [] };
        }
        return mergeMatchResults(winners);
      }

      if (!anySuccess) {
        return { success: false, matchedPlays: [] };
      }

      return mergeMatchResults(results.filter(result => result.success));
    }
    default:
      return { success: false, matchedPlays: [] };
  }
}

function formatReward(reward: ComboReward): string {
  const parts: string[] = [];
  const ip = reward.ip;
  if (typeof ip === 'number' && ip !== 0) {
    parts.push(`${ip > 0 ? '+' : ''}${ip} IP`);
  }

  const truth = reward.truth;
  if (typeof truth === 'number' && truth !== 0) {
    parts.push(`${truth > 0 ? `±${truth}` : truth} Truth`);
  }

  const nextAttackMultiplier = reward.nextAttackMultiplier;
  if (typeof nextAttackMultiplier === 'number' && nextAttackMultiplier > 1) {
    parts.push(`Next attack x${nextAttackMultiplier}`);
  }
  return parts.length > 0 ? `(${parts.join(', ')})` : '';
}

function clampReward(def: ComboDefinition, reward: ComboReward): ComboReward {
  if (!def.cap) {
    return { ...reward };
  }

  const capped: ComboReward = { ...reward };
  if (typeof reward.ip === 'number' && reward.ip > 0) {
    capped.ip = Math.min(reward.ip, def.cap);
  }
  if (typeof reward.truth === 'number' && reward.truth > 0) {
    capped.truth = Math.min(reward.truth, def.cap);
  }
  return capped;
}

export function evaluateCombos(
  state: GameState,
  player: PlayerId,
  options?: ComboOptions,
): ComboEvaluation {
  const settings = resolveSettings(options);
  currentComboRng = settings.rng ?? currentComboRng;
  const plays = state.turnPlays
    .filter(play => play.stage === 'resolve' && play.owner === player)
    .sort((a, b) => a.sequence - b.sequence);

  if (!settings.enabled || plays.length === 0) {
    const empty: ComboEvaluation = { results: [], totalReward: {}, logs: [] };
    lastComboSummary = { ...empty, player, turn: state.turn };
    return empty;
  }

  const metrics = computeMetrics(plays);
  const sortedDefs = [...COMBO_DEFINITIONS].sort((a, b) => b.priority - a.priority);
  const results: ComboResult[] = [];
  const logs: string[] = [];
  const totalReward: ComboReward = {};

  for (const def of sortedDefs) {
    if (!settings.comboToggles[def.id]) {
      continue;
    }
    if (results.length >= settings.maxCombosPerTurn) {
      break;
    }

    const match = evaluateTrigger(def.trigger, plays, metrics);
    if (!match.success) {
      continue;
    }

    const applied = clampReward(def, def.reward);
    if (typeof applied.ip === 'number') {
      totalReward.ip = (totalReward.ip ?? 0) + applied.ip;
    }
    if (typeof applied.truth === 'number') {
      totalReward.truth = (totalReward.truth ?? 0) + applied.truth;
    }

    results.push({
      definition: def,
      reward: def.reward,
      appliedReward: applied,
      details: { matchedPlays: match.matchedPlays, extra: match.extra },
    });

    const text = formatReward(applied);
    logs.push(text ? `${def.name} ${text}` : def.name);
  }

  const summary: ComboEvaluation = { results, totalReward, logs };
  lastComboSummary = { ...summary, player, turn: state.turn };
  return summary;
}

export function applyComboRewards(
  state: GameState,
  player: PlayerId,
  evaluation: ComboEvaluation,
): GameState {
  if (evaluation.results.length === 0) {
    return state;
  }

  const updated = state;
  if (evaluation.totalReward.ip && evaluation.totalReward.ip !== 0) {
    const playerState = updated.players[player];
    updated.players[player] = {
      ...playerState,
      ip: clampIP(playerState.ip + evaluation.totalReward.ip),
    };
  }

  const truthReward = evaluation.totalReward.truth ?? 0;
  if (truthReward !== 0) {
    const playerState = updated.players[player];
    const faction = playerState?.faction ?? 'truth';
    const signedTruthDelta = faction === 'government' ? -truthReward : truthReward;
    applyTruthDelta(updated, signedTruthDelta, player);
  }

  let pendingAttackMultiplier: number | undefined;

  for (const result of evaluation.results) {
    if (result.reward.log) {
      updated.log.push(result.reward.log);
    }

    const multiplier = result.appliedReward.nextAttackMultiplier;
    if (typeof multiplier === 'number' && multiplier > 0) {
      pendingAttackMultiplier = Math.max(pendingAttackMultiplier ?? 0, multiplier);
    }
  }

  if (pendingAttackMultiplier !== undefined) {
    const playerState = updated.players[player];
    const existing = playerState.nextAttackMultiplier;
    const effective = Math.max(existing ?? 0, pendingAttackMultiplier);
    updated.players[player] = {
      ...playerState,
      nextAttackMultiplier: effective > 0 ? effective : undefined,
    };
  }

  return updated;
}

export function getLastComboSummary(): ComboSummary | null {
  return lastComboSummary;
}

export function formatComboReward(reward: ComboReward): string {
  return formatReward(reward);
}
