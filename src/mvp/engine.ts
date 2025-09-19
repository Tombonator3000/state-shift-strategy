import { applyEffectsMvp, type PlayerId } from '@/engine/applyEffects-mvp';
import { applyComboRewards, evaluateCombos, getComboSettings, formatComboReward } from '@/game/comboEngine';
import type { ComboEvaluation, ComboOptions, ComboSummary, TurnPlay } from '@/game/combo.types';
import { cloneGameState } from './validator';
import type { Card, EffectsATTACK, EffectsMEDIA, EffectsZONE, GameState, PlayerState } from './validator';
import type { MediaResolutionOptions } from './media';

const otherPlayer = (id: PlayerId): PlayerId => (id === 'P1' ? 'P2' : 'P1');

const drawUpToFive = (player: PlayerState): PlayerState => {
  const deck = [...player.deck];
  const hand = [...player.hand];
  while (hand.length < 5 && deck.length > 0) {
    hand.push(deck.shift()!);
  }
  return {
    ...player,
    deck,
    hand,
  };
};

export type WinResult = { winner?: PlayerId; reason?: 'states' | 'truth' | 'ip' };

export interface EndTurnOptions {
  combo?: ComboOptions;
}

export interface EndTurnSummary {
  player: PlayerId;
  turn: number;
  combos: ComboSummary;
  discarded: {
    requested: number;
    discarded: number;
    extraCost: number;
  };
  captureEvents: string[];
  logEntries: string[];
  winCheck: WinResult | null;
}

export interface EndTurnResult {
  state: GameState;
  summary: EndTurnSummary;
}

export function startTurn(state: GameState): GameState {
  const cloned = cloneGameState(state);
  const currentId = cloned.currentPlayer;
  const me = cloned.players[currentId];
  const ipGain = 5 + me.states.length;
  const updatedPlayer: PlayerState = {
    ...drawUpToFive(me),
    ip: me.ip + ipGain,
  };

  return {
    ...cloned,
    players: {
      ...cloned.players,
      [currentId]: updatedPlayer,
    },
    playsThisTurn: 0,
    turnPlays: [],
  };
}

export function canPlay(
  state: GameState,
  card: Card,
  targetStateId?: string,
): { ok: boolean; reason?: string } {
  if (state.playsThisTurn >= 3) {
    return { ok: false, reason: 'play-limit' };
  }

  const player = state.players[state.currentPlayer];
  if (!player) {
    return { ok: false, reason: 'invalid-player' };
  }

  if (player.ip < card.cost) {
    return { ok: false, reason: 'insufficient-ip' };
  }

  if (card.type === 'ZONE') {
    if (!targetStateId) {
      return { ok: false, reason: 'missing-target' };
    }
    if (!state.pressureByState[targetStateId]) {
      return { ok: false, reason: 'invalid-target' };
    }
  }

  return { ok: true };
}

export function playCard(
  state: GameState,
  cardId: string,
  targetStateId?: string,
  opts: MediaResolutionOptions = {},
  rng: () => number = Math.random,
): GameState {
  const cloned = cloneGameState(state);
  const currentId = cloned.currentPlayer;
  const player = cloned.players[currentId];
  const cardIndex = player.hand.findIndex(card => card.id === cardId);
  if (cardIndex === -1) {
    throw new Error(`card ${cardId} not found in hand`);
  }

  const card = player.hand[cardIndex];
  const eligibility = canPlay(cloned, card, targetStateId);
  if (!eligibility.ok) {
    throw new Error(eligibility.reason ?? 'cannot-play');
  }

  const newHand = [...player.hand];
  newHand.splice(cardIndex, 1);

  const updatedPlayer: PlayerState = {
    ...player,
    hand: newHand,
    discard: [...player.discard, card],
    ip: player.ip - card.cost,
  };

  const playEntry: TurnPlay = {
    sequence: cloned.turnPlays.length,
    stage: 'play',
    owner: currentId,
    cardId: card.id,
    cardName: card.name,
    cardType: card.type,
    cardRarity: card.rarity,
    cost: card.cost,
    targetStateId,
  };

  const interimState: GameState = {
    ...cloned,
    turnPlays: [...cloned.turnPlays, playEntry],
    players: {
      ...cloned.players,
      [currentId]: updatedPlayer,
    },
    playsThisTurn: cloned.playsThisTurn + 1,
  };

  return resolve(interimState, currentId, card, targetStateId, opts, rng);
}

export function resolve(
  state: GameState,
  owner: 'P1' | 'P2',
  card: Card,
  targetStateId?: string,
  opts: MediaResolutionOptions = {},
  rng: () => number = Math.random,
): GameState {
  const cloned = cloneGameState(state);
  const beforeStates = new Set(cloned.players[owner].states);
  const resolved = applyEffectsMvp(cloned, owner, card, targetStateId, opts, rng);

  const metadata: Record<string, number | string | undefined> = {};
  if (card.type === 'ATTACK') {
    const effects = card.effects as EffectsATTACK | undefined;
    if (effects?.ipDelta?.opponent) {
      metadata.damage = effects.ipDelta.opponent;
    }
    if (effects?.discardOpponent) {
      metadata.discard = effects.discardOpponent;
    }
  } else if (card.type === 'MEDIA') {
    const effects = card.effects as EffectsMEDIA | undefined;
    if (typeof effects?.truthDelta === 'number') {
      metadata.truth = effects.truthDelta;
    }
  } else if (card.type === 'ZONE') {
    const effects = card.effects as EffectsZONE | undefined;
    if (effects?.pressureDelta) {
      metadata.pressure = effects.pressureDelta;
    }
    if (targetStateId) {
      metadata.target = targetStateId;
    }
    const afterStates = resolved.players[owner].states;
    const captured = afterStates.filter(stateId => !beforeStates.has(stateId));
    if (captured.length > 0) {
      metadata.captured = captured.join(',');
    }
  }

  const resolveEntry: TurnPlay = {
    sequence: resolved.turnPlays.length,
    stage: 'resolve',
    owner,
    cardId: card.id,
    cardName: card.name,
    cardType: card.type,
    cardRarity: card.rarity,
    cost: card.cost,
    targetStateId,
    metadata: Object.keys(metadata).length > 0 ? metadata : undefined,
  };

  return {
    ...resolved,
    turnPlays: [...resolved.turnPlays, resolveEntry],
  };
}

export function endTurn(
  state: GameState,
  discards: string[],
  options: EndTurnOptions = {},
): EndTurnResult {
  const cloned = cloneGameState(state);
  const currentId = cloned.currentPlayer;
  const player = cloned.players[currentId];
  const turnNumber = cloned.turn;

  const captureEvents: string[] = [];
  const turnLog: string[] = [];

  for (const play of cloned.turnPlays) {
    if (play.stage !== 'resolve' || play.owner !== currentId) {
      continue;
    }
    const captured = play.metadata?.captured;
    if (typeof captured === 'string' && captured.length > 0) {
      const states = captured
        .split(',')
        .map(entry => entry.trim())
        .filter(entry => entry.length > 0);
      for (const stateId of states) {
        const message = `Captured ${stateId}`;
        captureEvents.push(message);
        turnLog.push(message);
      }
    }
  }

  const discardCounts = new Map<string, number>();
  for (const id of discards) {
    discardCounts.set(id, (discardCounts.get(id) ?? 0) + 1);
  }

  const newHand: Card[] = [];
  const newDiscard = [...player.discard];
  let discarded = 0;

  for (const card of player.hand) {
    const count = discardCounts.get(card.id) ?? 0;
    if (count > 0) {
      discardCounts.set(card.id, count - 1);
      newDiscard.push(card);
      discarded += 1;
    } else {
      newHand.push(card);
    }
  }

  const extraDiscards = Math.max(0, discarded - 1);
  const ipCost = extraDiscards;
  const updatedIP = Math.max(0, player.ip - ipCost);

  const updatedPlayer: PlayerState = {
    ...player,
    hand: newHand,
    discard: newDiscard,
    ip: updatedIP,
  };

  cloned.players = {
    ...cloned.players,
    [currentId]: updatedPlayer,
  };

  const discardMessage = `Discarded ${discarded} card${discarded === 1 ? '' : 's'}${
    ipCost > 0 ? ` (paid ${ipCost} IP)` : ''
  }`;
  turnLog.push(discardMessage.trim());

  const comboEvaluation = evaluateCombos(cloned, currentId, options.combo);
  const comboSummary: ComboSummary = {
    ...comboEvaluation,
    player: currentId,
    turn: turnNumber,
  };

  if (comboEvaluation.results.length > 0) {
    const summaryText = comboEvaluation.results
      .map(result => {
        const rewardText = formatComboReward(result.appliedReward);
        return rewardText ? `${result.definition.name} ${rewardText}` : result.definition.name;
      })
      .join('; ');
    turnLog.push(`Combos triggered: ${summaryText}`);
  }

  const rewardedState = applyComboRewards(cloned, currentId, comboEvaluation);

  const callbacks = options.combo?.fxCallbacks;
  for (const result of comboEvaluation.results) {
    callbacks?.onComboTriggered?.(result);
  }

  let fxEnabled = getComboSettings().fxEnabled;
  if (options.combo?.fxEnabled !== undefined) {
    fxEnabled = options.combo.fxEnabled;
  }
  if (options.combo?.enabled === false) {
    fxEnabled = false;
  }

  if (fxEnabled && comboEvaluation.results.length > 0) {
    for (const result of comboEvaluation.results) {
      callbacks?.onComboFx?.(result);
      if (typeof window !== 'undefined' && typeof window.uiComboToast === 'function') {
        const rewardText = formatComboReward(result.appliedReward);
        window.uiComboToast(
          rewardText ? `${result.definition.name} ${rewardText}` : result.definition.name,
        );
      }
    }
  }

  const logEnhancedState: GameState = {
    ...rewardedState,
    log: [...rewardedState.log, ...turnLog],
  };

  const winResult = winCheck(logEnhancedState);

  const nextPlayer = otherPlayer(currentId);

  const finalState: GameState = {
    ...logEnhancedState,
    currentPlayer: nextPlayer,
    turn: logEnhancedState.turn + 1,
    playsThisTurn: 0,
    turnPlays: [],
  };

  const summary: EndTurnSummary = {
    player: currentId,
    turn: turnNumber,
    combos: comboSummary,
    discarded: {
      requested: discards.length,
      discarded,
      extraCost: ipCost,
    },
    captureEvents,
    logEntries: turnLog,
    winCheck: winResult.winner ? winResult : null,
  };

  return { state: finalState, summary };
}

export function winCheck(
  state: GameState,
): { winner?: 'P1' | 'P2'; reason?: 'states' | 'truth' | 'ip' } {
  const { players } = state;
  if (players.P1.states.length >= 10) {
    return { winner: 'P1', reason: 'states' };
  }
  if (players.P2.states.length >= 10) {
    return { winner: 'P2', reason: 'states' };
  }

  if (state.truth >= 90) {
    const truthPlayer = players.P1.faction === 'truth' ? 'P1' : 'P2';
    return { winner: truthPlayer, reason: 'truth' };
  }

  if (state.truth <= 10) {
    const governmentPlayer = players.P1.faction === 'government' ? 'P1' : 'P2';
    return { winner: governmentPlayer, reason: 'truth' };
  }

  if (players.P1.ip >= 300) {
    return { winner: 'P1', reason: 'ip' };
  }
  if (players.P2.ip >= 300) {
    return { winner: 'P2', reason: 'ip' };
  }

  return {};
}
