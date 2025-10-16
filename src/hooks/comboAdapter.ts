import { applyComboRewards, evaluateCombos, formatComboReward } from '@/game/comboEngine';
import type { ComboEvaluation } from '@/game/combo.types';
import type { GameState as EngineGameState, PlayerId, PlayerState as EnginePlayerState } from '@/mvp/validator';

import type { GameState } from './gameStateTypes';
import type { TurnComposite } from '@/news/types';

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

const cloneCompositeArticle = (article: TurnComposite['main']): TurnComposite['main'] => {
  if (!article) {
    return null;
  }
  return {
    tone: article.tone,
    hed: article.hed,
    dek: article.dek,
    bullets: [...article.bullets],
    byline: article.byline,
    source: article.source,
    ...(article.body ? { body: [...article.body] } : {}),
    ...(article.imagePrompt ? { imagePrompt: article.imagePrompt } : {}),
    ...(article.kicker ? { kicker: article.kicker } : {}),
    ...(article.stinger ? { stinger: article.stinger } : {}),
    ...(article.templateId ? { templateId: article.templateId } : {}),
    ...(article.comboId ? { comboId: article.comboId } : {}),
  };
};

const cloneTurnComposite = (entry: TurnComposite): TurnComposite => ({
  round: entry.round,
  turn: entry.turn,
  plays: entry.plays.map(play => ({ ...play })),
  focus: entry.focus.map(play => ({ ...play })),
  tone: entry.tone,
  main: cloneCompositeArticle(entry.main),
  runnersUp: entry.runnersUp.map(article => cloneCompositeArticle(article)!).filter((article): article is NonNullable<TurnComposite['main']> => article != null),
  metrics: {
    cards: entry.metrics.cards,
    truth: { ...entry.metrics.truth },
    ip: { ...entry.metrics.ip },
    captures: { ...entry.metrics.captures },
    damage: { ...entry.metrics.damage },
    typeBonus: entry.metrics.typeBonus,
    total: entry.metrics.total,
  },
  signature: entry.signature,
  seed: entry.seed,
});

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
    turnPlays: state.turnPlays.map(play => ({
      ...play,
      metadata: (play as any).metadata ? { ...(play as any).metadata } : undefined,
    })),
    turnBuffer: state.turnBuffer.map(play => ({
      ...play,
      metadata: (play as any).metadata ? { ...(play as any).metadata } : undefined,
    })),
    log: [...state.log],
    headlineLog: state.headlineLog.map(cloneTurnComposite),
    extraExtraFeed: state.extraExtraFeed.map(article => ({
      ...article,
      bullets: [...article.bullets],
    })),
    winner: state.winner as any,
    victoryType: state.victoryType as any,
    finalEdition: state.finalEdition ?? null,
  } satisfies EngineGameState as any;

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
