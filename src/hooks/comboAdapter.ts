import { applyComboRewards, evaluateCombos, formatComboReward } from '@/game/comboEngine';
import type { ComboEvaluation } from '@/game/combo.types';
import type { GameState as EngineGameState, PlayerId, PlayerState as EnginePlayerState } from '@/mvp/validator';

import type { GameState } from './gameStateTypes';

const HUMAN_PLAYER: PlayerId = 'P1';
const AI_PLAYER: PlayerId = 'P2';

const otherPlayer = (id: PlayerId): PlayerId => (id === HUMAN_PLAYER ? AI_PLAYER : HUMAN_PLAYER);

const normalizeControlledStates = (state: GameState, abbreviations: string[]): string[] => {
  const result: string[] = [];
  const seen = new Set<string>();
  for (const entry of abbreviations) {
    const match = state.states.find(candidate =>
      candidate.abbreviation === entry || candidate.id === entry || candidate.name === entry,
    );
    const resolved = match?.id ?? entry;
    if (!seen.has(resolved)) {
      seen.add(resolved);
      result.push(resolved);
    }
  }
  return result;
};

const buildPlayerState = (state: GameState, owner: 'human' | 'ai'): EnginePlayerState => {
  const id = owner === 'human' ? HUMAN_PLAYER : AI_PLAYER;
  const faction = owner === 'human'
    ? state.faction
    : state.faction === 'truth'
      ? 'government'
      : 'truth';
  const ip = owner === 'human' ? state.ip : state.aiIP;
  const controlled = owner === 'human' ? state.controlledStates : state.aiControlledStates;

  return {
    id,
    faction,
    deck: [],
    hand: [],
    discard: [],
    ip,
    states: normalizeControlledStates(state, controlled),
  } satisfies EnginePlayerState;
};

const buildPressureByState = (state: GameState): EngineGameState['pressureByState'] => {
  const map: EngineGameState['pressureByState'] = {};
  for (const entry of state.states) {
    map[entry.id] = { P1: 0, P2: 0 };
  }
  return map;
};

const buildStateDefense = (state: GameState): EngineGameState['stateDefense'] => {
  const map: EngineGameState['stateDefense'] = {};
  for (const entry of state.states) {
    map[entry.id] = entry.defense;
  }
  return map;
};

export interface ComboAdapterResult {
  evaluation: ComboEvaluation;
  updatedTruth: number;
  truthDelta: number;
  updatedPlayerIp: number;
  updatedOpponentIp: number;
  logEntries: string[];
  fxMessages: string[];
}

export const evaluateCombosForTurn = (
  state: GameState,
  owner: 'human' | 'ai',
): ComboAdapterResult => {
  const playerId = owner === 'human' ? HUMAN_PLAYER : AI_PLAYER;
  const opponentId = otherPlayer(playerId);

  const engineState: EngineGameState = {
    turn: state.turn,
    currentPlayer: playerId,
    truth: state.truth,
    players: {
      [HUMAN_PLAYER]: buildPlayerState(state, 'human'),
      [AI_PLAYER]: buildPlayerState(state, 'ai'),
    },
    pressureByState: buildPressureByState(state),
    stateDefense: buildStateDefense(state),
    playsThisTurn: state.cardsPlayedThisTurn,
    turnPlays: state.turnPlays.map(play => ({ ...play })),
    log: [...state.log],
  } satisfies EngineGameState;

  const logStart = engineState.log.length;
  const evaluation = evaluateCombos(engineState, playerId);
  const rewardedState = applyComboRewards(engineState, playerId, evaluation);
  const rewardLogs = rewardedState.log.slice(logStart);
  const truthDelta = rewardedState.truth - state.truth;
  const comboPlayerFaction = engineState.players[playerId]?.faction === 'government' ? 'government' : 'truth';

  const comboMessages = evaluation.results.map(result => {
    const rewardText = formatComboReward(result.appliedReward, { faction: comboPlayerFaction });
    return rewardText ? `${result.definition.name} ${rewardText}` : result.definition.name;
  });

  const summaryEntry = comboMessages.length > 0
    ? `Combos triggered: ${comboMessages.join('; ')}`
    : null;

  const logEntries = summaryEntry
    ? [summaryEntry, ...rewardLogs]
    : rewardLogs;

  return {
    evaluation,
    updatedTruth: rewardedState.truth,
    truthDelta,
    updatedPlayerIp: rewardedState.players[playerId].ip,
    updatedOpponentIp: rewardedState.players[opponentId].ip,
    logEntries,
    fxMessages: comboMessages,
  };
};
