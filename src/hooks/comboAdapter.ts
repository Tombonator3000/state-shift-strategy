import { applyComboRewards, evaluateCombos, formatComboReward } from '@/game/comboEngine';
import type { ComboEvaluation, TurnPlay } from '@/game/combo.types';
import { ComboThemeMap, type ComboKind } from '@/data/combos/themes';
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
  comboKinds: ComboKind[];
  primaryComboKind?: ComboKind;
  comboThemeId?: string;
  rewardSummary: {
    ipGain: number;
    truthGain: number;
    totalMagnitude: number;
  };
  uniqueCardTypes: number;
  totalCardsInvolved: number;
  affectedStateIds: string[];
}

const COMBO_KIND_PRIORITY: ComboKind[] = [
  'MEGA_SPREAD',
  'TIMELINE_FRAGMENT',
  'MEDIA_CAMPAIGN',
  'COVER_OPERATION',
  'CLOAK_AND_SIGNAL',
  'CHAIN_REACTION',
  'MEDIA_WAVE',
  'ZONE_LOCKDOWN',
];

const normalizeKindFromName = (name?: string): ComboKind | null => {
  if (!name) {
    return null;
  }
  const normalized = name.toLowerCase();
  if (normalized.includes('timeline')) return 'TIMELINE_FRAGMENT';
  if (normalized.includes('mega') || normalized.includes('yield')) return 'MEGA_SPREAD';
  if (normalized.includes('campaign') || normalized.includes('media')) return 'MEDIA_CAMPAIGN';
  if (normalized.includes('chain')) return 'CHAIN_REACTION';
  if (normalized.includes('lock')) return 'ZONE_LOCKDOWN';
  if (normalized.includes('cover')) return 'COVER_OPERATION';
  if (normalized.includes('cloak') || normalized.includes('signal')) return 'CLOAK_AND_SIGNAL';
  if (normalized.includes('wave')) return 'MEDIA_WAVE';
  return null;
};

const determineComboKind = (plays: TurnPlay[], fallbackName?: string): ComboKind => {
  const counts = { ATTACK: 0, MEDIA: 0, ZONE: 0 } as Record<'ATTACK' | 'MEDIA' | 'ZONE', number>;
  for (const play of plays) {
    if (play.cardType === 'ATTACK' || play.cardType === 'MEDIA' || play.cardType === 'ZONE') {
      counts[play.cardType] += 1;
    }
  }

  const totalCards = plays.length;
  const uniqueTypes = (counts.ATTACK > 0 ? 1 : 0) + (counts.MEDIA > 0 ? 1 : 0) + (counts.ZONE > 0 ? 1 : 0);

  if (totalCards >= 4) {
    return 'MEGA_SPREAD';
  }

  if (uniqueTypes >= 3) {
    return 'TIMELINE_FRAGMENT';
  }

  if (counts.ATTACK > 0 && counts.MEDIA > 0) {
    if (counts.ZONE > 0) {
      return 'TIMELINE_FRAGMENT';
    }
    return 'MEDIA_CAMPAIGN';
  }

  if (counts.ATTACK > 0 && counts.ZONE > 0) {
    return 'COVER_OPERATION';
  }

  if (counts.MEDIA > 0 && counts.ZONE > 0) {
    return 'CLOAK_AND_SIGNAL';
  }

  if (counts.MEDIA >= 2) {
    return 'MEDIA_WAVE';
  }

  if (counts.ATTACK >= 2) {
    return 'CHAIN_REACTION';
  }

  if (counts.ZONE >= 2) {
    return 'ZONE_LOCKDOWN';
  }

  if (counts.MEDIA > 0) {
    return 'MEDIA_WAVE';
  }

  if (counts.ATTACK > 0) {
    return 'CHAIN_REACTION';
  }

  if (counts.ZONE > 0) {
    return 'ZONE_LOCKDOWN';
  }

  return normalizeKindFromName(fallbackName) ?? 'CHAIN_REACTION';
};

const sortKindsByPriority = (kinds: Iterable<ComboKind>): ComboKind[] => {
  const unique = Array.from(new Set(kinds));
  return unique.sort((a, b) => COMBO_KIND_PRIORITY.indexOf(a) - COMBO_KIND_PRIORITY.indexOf(b));
};

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

  const comboKindsUnsorted = evaluation.results.map(result =>
    determineComboKind(result.details.matchedPlays, result.definition.name),
  );
  const comboKinds = sortKindsByPriority(comboKindsUnsorted);

  const aggregatedPlays = evaluation.results.reduce((map, result) => {
    for (const play of result.details.matchedPlays) {
      map.set(play.sequence, play);
    }
    return map;
  }, new Map<number, TurnPlay>());

  const aggregatedPlayList = Array.from(aggregatedPlays.values());
  const primaryComboKind = aggregatedPlayList.length > 0
    ? determineComboKind(aggregatedPlayList, evaluation.results[0]?.definition.name)
    : comboKinds[0];
  const comboThemeId = primaryComboKind ? ComboThemeMap[primaryComboKind]?.id : undefined;

  const ipGain = evaluation.results.reduce((acc, result) => acc + (result.appliedReward.ip ?? 0), 0);
  const truthGain = evaluation.results.reduce((acc, result) => acc + (result.appliedReward.truth ?? 0), 0);
  const totalMagnitude = evaluation.results.reduce((acc, result) => {
    const reward = result.appliedReward ?? {};
    return acc + Math.abs(reward.ip ?? 0) + Math.abs(reward.truth ?? 0);
  }, 0);

  const uniqueCardTypes = new Set(aggregatedPlayList.map(play => play.cardType)).size;
  const totalCardsInvolved = aggregatedPlayList.length;
  const affectedStateIds = Array.from(new Set(
    aggregatedPlayList
      .map(play => play.targetStateId)
      .filter((value): value is string => typeof value === 'string' && value.length > 0),
  ));

  const comboMessages = evaluation.results.map(result => {
    const rewardText = formatComboReward(result.appliedReward);
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
    comboKinds,
    primaryComboKind: primaryComboKind ?? comboKinds[0],
    comboThemeId,
    rewardSummary: {
      ipGain,
      truthGain,
      totalMagnitude,
    },
    uniqueCardTypes,
    totalCardsInvolved,
    affectedStateIds,
  };
};
