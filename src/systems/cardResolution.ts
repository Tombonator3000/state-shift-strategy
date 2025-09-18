import { applyEffectsMvp, type PlayerId } from '@/engine/applyEffects-mvp';
import type { MediaResolutionOptions } from '@/mvp/media';
import { cloneGameState, type Card, type GameState as EngineGameState } from '@/mvp';
import type { GameCard } from '@/rules/mvp';
import { setStateOccupation } from '@/data/usaStates';
import type { PlayerStats } from '@/data/achievementSystem';

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
  defense: number;
  pressure: number;
  owner: StateOwner;
  specialBonus?: string;
  bonusValue?: number;
  occupierCardId?: string | null;
  occupierCardName?: string | null;
  occupierLabel?: string | null;
  occupierIcon?: string | null;
  occupierUpdatedAt?: number;
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
}

export interface CardPlayResolution {
  ip: number;
  aiIP: number;
  truth: number;
  states: StateForResolution[];
  controlledStates: string[];
  aiControlledStates: string[];
  targetState: string | null;
  selectedCard: string | null;
  logEntries: string[];
  damageDealt: number;
}

const PLAYER_ID: PlayerId = 'P1';
const AI_ID: PlayerId = 'P2';

export type CardActor = 'human' | 'ai';

const resolveTargetStateId = (
  snapshot: GameSnapshot,
  target?: string | null,
): string | undefined => {
  if (!target) {
    return undefined;
  }

  const match = snapshot.states.find(
    state =>
      state.id === target ||
      state.abbreviation === target ||
      state.name === target,
  );

  return match?.id;
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
    const pressure = Math.max(0, state.pressure ?? 0);
    const owner = state.owner;

    if (owner === 'player') {
      playerStates.add(state.id);
    } else if (owner === 'ai') {
      aiStates.add(state.id);
    }

    pressureByState[state.id] = {
      P1: owner === 'player' ? 0 : pressure,
      P2: owner === 'ai' ? pressure : 0,
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

  engineState.players[ownerId] = {
    ...engineState.players[ownerId],
    ip: Math.max(0, engineState.players[ownerId].ip - card.cost),
  };

  const beforeState = cloneGameState(engineState);
  const targetStateId = resolveTargetStateId(gameState, targetState);

  applyEffectsMvp(engineState, ownerId, card as Card, targetStateId, mediaOptions);

  const logEntries: string[] = engineLog.map(message => `${card.name}: ${message}`);
  const newStates = gameState.states.map(state => ({ ...state }));
  const nextControlledStates = new Set(gameState.controlledStates);
  const nextAiControlledStates = new Set(gameState.aiControlledStates ?? []);
  let capturedCount = 0;
  let nextTargetState: string | null = actor === 'human' && card.type === 'ZONE' ? targetState : null;
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
    state.pressure = Math.max(afterPressurePlayer, afterPressureAi);

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
      setStateOccupation(state, gameState.faction, { id: card.id, name: card.name }, false);
      logEntries.push(`🚨 ${card.name} captured ${state.name}!`);
      if (targetStateId === state.id) {
        nextTargetState = null;
      }
    } else if (previousOwner !== 'ai' && owner === 'ai') {
      const aiFaction = gameState.faction === 'truth' ? 'government' : 'truth';
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
  }

  const playerIPAfterEffects = engineState.players[PLAYER_ID].ip;
  const aiIPAfterEffects = engineState.players[AI_ID].ip;
  const truthAfterEffects = engineState.truth;
  const damageDealt = Math.max(0, beforeState.players[opponentId].ip - engineState.players[opponentId].ip);

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
    states: newStates,
    controlledStates: Array.from(nextControlledStates),
    aiControlledStates: Array.from(nextAiControlledStates),
    targetState: actor === 'human' ? nextTargetState : gameState.targetState,
    selectedCard: null,
    logEntries,
    damageDealt,
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
