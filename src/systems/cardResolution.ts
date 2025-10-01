import { applyEffectsMvp, type PlayerId } from '@/engine/applyEffects-mvp';
import type { MediaResolutionOptions } from '@/mvp/media';
import { cloneGameState, type Card, type GameState as EngineGameState } from '@/mvp';
import type { GameCard } from '@/rules/mvp';
import { setStateOccupation } from '@/data/usaStates';
import {
  applyDefenseBonusToStates,
  createDefaultCombinationEffects,
  type StateCombinationEffects,
} from '@/data/stateCombinations';
import type { PlayerStats } from '@/data/achievementSystem';
import type {
  StateEventBonusSummary,
  StateParanormalHotspot,
  StateParanormalHotspotSummary,
} from '@/hooks/gameStateTypes';
import { applyTruthDelta } from '@/utils/truth';
import { trimParanormalHotspotHistory } from '@/hooks/stateEventHistory';

type Faction = 'government' | 'truth';

type StateOwner = 'player' | 'ai' | 'neutral';

export interface AchievementTracker {
  stats: Pick<
    PlayerStats,
    |
      'total_states_controlled'
      | 'max_states_controlled_single_game'
      | 'max_ip_reached'
      | 'max_truth_reached'
      | 'min_truth_reached'
  >;
  updateStats: (updates: Partial<PlayerStats>) => void;
}

export interface StateForResolution {
  id: string;
  name: string;
  abbreviation: string;
  baseIP: number;
  baseDefense: number;
  defense: number;
  pressure: number;
  pressurePlayer: number;
  pressureAi: number;
  contested: boolean;
  owner: StateOwner;
  occupierCardId?: string | null;
  occupierCardName?: string | null;
  occupierLabel?: string | null;
  occupierIcon?: string | null;
  occupierUpdatedAt?: number;
  paranormalHotspot?: StateParanormalHotspot;
  paranormalHotspotHistory?: StateParanormalHotspotSummary[];
  stateEventBonus?: StateEventBonusSummary;
  stateEventHistory?: StateEventBonusSummary[];
}

export interface GameSnapshot {
  truth: number;
  ip: number;
  aiIP: number;
  hand: GameCard[];
  aiHand: GameCard[];
  controlledStates: string[];
  aiControlledStates?: string[];
  round: number;
  turn: number;
  faction: Faction;
  states: StateForResolution[];
  stateCombinationEffects?: StateCombinationEffects;
}

export interface CardPlayResolution {
  ip: number;
  aiIP: number;
  truth: number;
  states: StateForResolution[];
  controlledStates: string[];
  aiControlledStates: string[];
  capturedStateIds: string[];
  targetState: string | null;
  selectedCard: string | null;
  logEntries: string[];
  damageDealt: number;
  aiSecretAgendaRevealed?: boolean;
  resolvedHotspots?: string[];
}

const PLAYER_ID: PlayerId = 'P1';
const AI_ID: PlayerId = 'P2';

export type CardActor = 'human' | 'ai';

/**
 * Resolves a target string to a state id, matching case-insensitively against
 * known identifiers. If no match is found we fall back to the trimmed input so
 * downstream logic can decide how to handle the value.
 */
const resolveTargetStateId = (
  snapshot: GameSnapshot,
  target?: string | null,
): string | undefined => {
  if (!target) {
    return undefined;
  }

  const trimmedTarget = target.trim();
  if (!trimmedTarget) {
    return undefined;
  }

  const normalizedTarget = trimmedTarget.toLowerCase();

  const normalize = (value: string) => value.trim().toLowerCase();

  const match = snapshot.states.find(state => {
    const candidates = [state.id, state.abbreviation, state.name].filter(
      Boolean,
    ) as string[];
    return candidates.some(candidate => normalize(candidate) === normalizedTarget);
  });

  return match ? match.id : trimmedTarget;
};

const buildStateLookups = (states: StateForResolution[]) => {
  const abbreviationToId = new Map<string, string>();

  for (const state of states) {
    abbreviationToId.set(state.abbreviation, state.id);
  }

  return { abbreviationToId };
};

const toEngineState = (
  snapshot: GameSnapshot,
  log: string[],
): EngineGameState => {
  const { abbreviationToId } = buildStateLookups(snapshot.states);

  const pressureByState: EngineGameState['pressureByState'] = {};
  const stateDefense: EngineGameState['stateDefense'] = {};
  const playerStates = new Set<string>();
  const aiStates = new Set<string>();

  for (const state of snapshot.states) {
    stateDefense[state.id] = state.defense;
    const owner = state.owner;
    const fallbackPressure = Math.max(0, state.pressure ?? 0);
    const playerPressure = Number.isFinite(state.pressurePlayer)
      ? Math.max(0, state.pressurePlayer)
      : owner === 'player'
        ? 0
        : fallbackPressure;
    const aiPressure = Number.isFinite(state.pressureAi)
      ? Math.max(0, state.pressureAi)
      : owner === 'ai'
        ? fallbackPressure
        : 0;

    if (owner === 'player') {
      playerStates.add(state.id);
    } else if (owner === 'ai') {
      aiStates.add(state.id);
    }

    pressureByState[state.id] = {
      P1: playerPressure,
      P2: aiPressure,
    };
  }

  for (const abbr of snapshot.controlledStates) {
    const id = abbreviationToId.get(abbr) ?? abbr;
    playerStates.add(id);
  }

  for (const abbr of snapshot.aiControlledStates ?? []) {
    const id = abbreviationToId.get(abbr) ?? abbr;
    aiStates.add(id);
  }

  return {
    turn: snapshot.turn,
    currentPlayer: PLAYER_ID,
    truth: snapshot.truth,
    players: {
      [PLAYER_ID]: {
        id: PLAYER_ID,
        faction: snapshot.faction,
        deck: [],
        hand: snapshot.hand as Card[],
        discard: [],
        ip: snapshot.ip,
        states: Array.from(playerStates),
      },
      [AI_ID]: {
        id: AI_ID,
        faction: snapshot.faction === 'truth' ? 'government' : 'truth',
        deck: [],
        hand: snapshot.aiHand as Card[],
        discard: [],
        ip: snapshot.aiIP,
        states: Array.from(aiStates),
      },
    },
    pressureByState,
    stateDefense,
    playsThisTurn: 0,
    turnPlays: [],
    log,
  };
};

const defaultAchievementTracker: AchievementTracker = {
  stats: {
    total_states_controlled: 0,
    max_states_controlled_single_game: 0,
    max_ip_reached: 0,
    max_truth_reached: 0,
    min_truth_reached: 100,
  },
  updateStats: () => {
    /* no-op */
  },
};

export function resolveCardMVP(
  gameState: GameSnapshot,
  card: GameCard,
  targetState: string | null,
  actor: CardActor,
  achievements: AchievementTracker = defaultAchievementTracker,
  mediaOptions: MediaResolutionOptions = {},
): CardPlayResolution {
  const engineLog: string[] = [];
  const engineState = toEngineState(gameState, engineLog);
  const ownerId = actor === 'human' ? PLAYER_ID : AI_ID;
  const opponentId = ownerId === PLAYER_ID ? AI_ID : PLAYER_ID;
  const comboEffects = gameState.stateCombinationEffects ?? createDefaultCombinationEffects();
  const revealsSecretAgenda =
    actor === 'human' &&
    Boolean((card.effects as { revealSecretAgenda?: boolean } | undefined)?.revealSecretAgenda);

  engineState.players[ownerId] = {
    ...engineState.players[ownerId],
    ip: Math.max(0, engineState.players[ownerId].ip - card.cost),
  };

  const beforeState = cloneGameState(engineState);
  const targetStateId = resolveTargetStateId(gameState, targetState);

  let effectiveCard: GameCard = card;

  if (actor === 'human' && comboEffects.attackIpBonus > 0 && card.type === 'ATTACK') {
    const extraDamage = comboEffects.attackIpBonus;
    const existingEffects = card.effects ?? {};
    const updatedIpDelta = {
      ...(existingEffects.ipDelta ?? {}),
      opponent: ((existingEffects.ipDelta?.opponent ?? 0) as number) + extraDamage,
    };
    const updatedEffects = { ...existingEffects, ipDelta: updatedIpDelta };
    effectiveCard = { ...card, effects: updatedEffects };
  }

  if (
    actor === 'ai' &&
    comboEffects.incomingPressureReduction > 0 &&
    card.type === 'ZONE' &&
    targetStateId
  ) {
    const targetStateData = gameState.states.find(candidate =>
      candidate.id === targetStateId || candidate.abbreviation === targetStateId,
    );
    const targetOwnedByPlayer = targetStateData?.owner === 'player' ||
      gameState.controlledStates.includes(targetStateData?.abbreviation ?? '');

    if (targetStateData && targetOwnedByPlayer) {
      const reduction = comboEffects.incomingPressureReduction;
      const existingEffects = effectiveCard.effects ?? {};
      const basePressure = (existingEffects.pressureDelta ?? 0) as number;
      if (basePressure > 0) {
        const adjustedPressure = Math.max(0, basePressure - reduction);
        if (adjustedPressure !== basePressure) {
          const updatedEffects = { ...existingEffects, pressureDelta: adjustedPressure };
          effectiveCard = { ...effectiveCard, effects: updatedEffects };
        }
      }
    }
  }

  let mediaOptionsWithCombos = mediaOptions;
  if (actor === 'human' && card.type === 'MEDIA' && comboEffects.truthSwingMultiplier > 1) {
    mediaOptionsWithCombos = {
      ...mediaOptions,
      truthMultiplier: comboEffects.truthSwingMultiplier,
      truthMultiplierSource: 'Academic Elite',
    };
  }

  applyEffectsMvp(engineState, ownerId, effectiveCard as Card, targetStateId, mediaOptionsWithCombos);

  const logEntries: string[] = engineLog.map(message => `${card.name}: ${message}`);
  let syncedEngineLogLength = engineLog.length;
  const flushEngineLog = () => {
    while (syncedEngineLogLength < engineLog.length) {
      logEntries.push(`${card.name}: ${engineLog[syncedEngineLogLength++]}`);
    }
  };
  const newStates = gameState.states.map(state => ({ ...state }));
  const nextControlledStates = new Set(gameState.controlledStates);
  const nextAiControlledStates = new Set(gameState.aiControlledStates ?? []);
  let capturedCount = 0;
  const capturedStateIds: string[] = [];
  let nextTargetState: string | null = actor === 'human' && card.type === 'ZONE' ? targetState : null;
  const resolvedHotspots: string[] = [];
  let truthBonusFromHotspots = 0;
  for (const state of newStates) {
    const beforePressurePlayer = beforeState.pressureByState[state.id]?.[PLAYER_ID] ?? 0;
    const afterPressurePlayer = engineState.pressureByState[state.id]?.[PLAYER_ID] ?? 0;
    const beforePressureAi = beforeState.pressureByState[state.id]?.[AI_ID] ?? 0;
    const afterPressureAi = engineState.pressureByState[state.id]?.[AI_ID] ?? 0;
    const playerOwns = engineState.players[PLAYER_ID].states.includes(state.id);
    const aiOwns = engineState.players[AI_ID].states.includes(state.id);

    const previousOwner = state.owner;
    const owner: StateOwner = playerOwns ? 'player' : aiOwns ? 'ai' : 'neutral';

    state.owner = owner;
    state.pressurePlayer = afterPressurePlayer;
    state.pressureAi = afterPressureAi;
    state.pressure = Math.max(afterPressurePlayer, afterPressureAi);
    const isContested = afterPressurePlayer > 0 && afterPressureAi > 0;
    state.contested = previousOwner !== owner ? false : isContested;

    if (owner === 'player') {
      nextControlledStates.add(state.abbreviation);
      nextAiControlledStates.delete(state.abbreviation);
    } else if (owner === 'ai') {
      nextControlledStates.delete(state.abbreviation);
      nextAiControlledStates.add(state.abbreviation);
    } else {
      nextControlledStates.delete(state.abbreviation);
      nextAiControlledStates.delete(state.abbreviation);
    }

    if (previousOwner !== 'player' && owner === 'player') {
      capturedCount += 1;
      capturedStateIds.push(state.id);
      setStateOccupation(state, gameState.faction, { id: card.id, name: card.name }, false);
      logEntries.push(`🚨 ${card.name} captured ${state.name}!`);
      if (targetStateId === state.id) {
        nextTargetState = null;
      }
    } else if (previousOwner !== 'ai' && owner === 'ai') {
      const aiFaction = gameState.faction === 'truth' ? 'government' : 'truth';
      capturedStateIds.push(state.id);
      setStateOccupation(state, aiFaction, { id: card.id, name: card.name }, false);
      logEntries.push(`⚠️ ${card.name} seized ${state.name} for the enemy!`);
      if (targetStateId === state.id) {
        nextTargetState = null;
      }
    } else if (targetStateId === state.id && card.type === 'ZONE') {
      const deltaPlayer = afterPressurePlayer - beforePressurePlayer;
      const deltaAi = afterPressureAi - beforePressureAi;
      if (actor === 'human' && deltaPlayer !== 0) {
        logEntries.push(
          `${card.name} added pressure to ${state.name} (${deltaPlayer > 0 ? '+' : ''}${deltaPlayer}, ${afterPressurePlayer}/${state.defense})`,
        );
      } else if (actor === 'ai' && deltaAi !== 0) {
        logEntries.push(
          `${card.name} increased enemy pressure on ${state.name} (${deltaAi > 0 ? '+' : ''}${deltaAi}, ${afterPressureAi}/${state.defense})`,
        );
      }
    }

    const hotspot = state.paranormalHotspot;
    if (hotspot && previousOwner !== owner && owner !== 'neutral') {
      const captureFaction: 'truth' | 'government' = owner === 'player'
        ? gameState.faction
        : gameState.faction === 'truth'
          ? 'government'
          : 'truth';
      const rawTruthReward = hotspot.truthReward;
      const truthDelta = Number.isFinite(rawTruthReward) ? rawTruthReward : 0;
      const directionalDelta = captureFaction === 'truth' ? truthDelta : -truthDelta;
      let actualTruthDelta = 0;
      if (directionalDelta !== 0) {
        const beforeTruth = engineState.truth;
        applyTruthDelta(engineState, directionalDelta, owner === 'player' ? 'human' : 'ai');
        flushEngineLog();
        const actualDelta = engineState.truth - beforeTruth;
        truthBonusFromHotspots += actualDelta;
        actualTruthDelta = actualDelta;
        if (actualDelta !== 0) {
          logEntries.push(
            `👻 ${hotspot.label} resolved in ${state.name}! Truth ${actualDelta > 0 ? '+' : ''}${actualDelta}.`,
          );
        } else {
          logEntries.push(`👻 ${hotspot.label} resolved in ${state.name}!`);
        }
      } else {
        logEntries.push(`👻 ${hotspot.label} resolved in ${state.name}!`);
      }

      const adjustedDefense = Math.max(1, state.defense - hotspot.defenseBoost);
      state.defense = Math.max(1, adjustedDefense);
      const resolvedSummary: StateParanormalHotspotSummary = {
        id: hotspot.id,
        label: hotspot.label,
        resolvedOnTurn: gameState.turn,
        faction: captureFaction,
        truthDelta: actualTruthDelta,
      };
      recordParanormalHotspotResolution(state, resolvedSummary);
      state.paranormalHotspot = undefined;
      resolvedHotspots.push(state.abbreviation);
    }
  }

  const playerIPAfterEffects = engineState.players[PLAYER_ID].ip;
  const aiIPAfterEffects = engineState.players[AI_ID].ip;
  flushEngineLog();
  const truthAfterEffects = engineState.truth;
  const damageDealt = Math.max(0, beforeState.players[opponentId].ip - engineState.players[opponentId].ip);

  const adjustedStates = applyDefenseBonusToStates(newStates, comboEffects.stateDefenseBonus);

  if (actor === 'human') {
    const achievementUpdates: Partial<PlayerStats> = {
      max_ip_reached: Math.max(achievements.stats.max_ip_reached, playerIPAfterEffects),
      max_truth_reached: Math.max(achievements.stats.max_truth_reached, truthAfterEffects),
      min_truth_reached: Math.min(achievements.stats.min_truth_reached, truthAfterEffects),
    };

    if (capturedCount > 0) {
      achievementUpdates.total_states_controlled = achievements.stats.total_states_controlled + capturedCount;
      achievementUpdates.max_states_controlled_single_game = Math.max(
        achievements.stats.max_states_controlled_single_game,
        nextControlledStates.size,
      );
    }

    achievements.updateStats(achievementUpdates);
  }

  return {
    ip: playerIPAfterEffects,
    aiIP: aiIPAfterEffects,
    truth: truthAfterEffects,
    states: adjustedStates,
    controlledStates: Array.from(nextControlledStates),
    aiControlledStates: Array.from(nextAiControlledStates),
    capturedStateIds,
    targetState: actor === 'human' ? nextTargetState : (gameState as any).targetState,
    selectedCard: null,
    logEntries,
    damageDealt,
    aiSecretAgendaRevealed: revealsSecretAgenda,
    resolvedHotspots: resolvedHotspots.length > 0 ? resolvedHotspots : undefined,
  };
}

export function resolveCardEffects(
  gameState: GameSnapshot,
  card: GameCard,
  targetState: string | null,
  achievements: AchievementTracker = defaultAchievementTracker,
  mediaOptions: MediaResolutionOptions = {},
): CardPlayResolution {
  return resolveCardMVP(gameState, card, targetState, 'human', achievements, mediaOptions);
}
export const recordParanormalHotspotResolution = (
  state: StateForResolution,
  summary: StateParanormalHotspotSummary,
) => {
  const existingHistory = Array.isArray(state.paranormalHotspotHistory)
    ? state.paranormalHotspotHistory
    : [];
  state.paranormalHotspotHistory = trimParanormalHotspotHistory([
    ...existingHistory,
    summary,
  ]);
};

