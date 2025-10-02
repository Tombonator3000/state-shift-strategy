declare const window: any;

import { applyEffectsMvp, type PlayerId } from '@/engine/applyEffects-mvp';
import { applyComboRewards, evaluateCombos, getComboSettings, formatComboReward } from '@/game/comboEngine';
import type { ComboEvaluation, ComboOptions, ComboSummary, TurnPlay } from '@/game/combo.types';
import { getStateByAbbreviation, getStateById } from '@/data/usaStates';
import { cloneGameState } from './validator';
import { auditGameState } from './gameStateAudit';
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

export interface IpMaintenanceSettings {
  threshold: number;
  divisor: number;
}

export interface IpIncomeBreakdown {
  baseIncome: number;
  maintenance: number;
  swingTax: number;
  catchUpBonus: number;
  netIncome: number;
  ipGap: number;
  stateGap: number;
  stateIncomeDetails: StateIncomeContribution[];
}

export interface StateIncomeContribution {
  state: string;
  abbreviation: string;
  count: number;
  fallback: boolean;
}

export const DEFAULT_IP_MAINTENANCE: IpMaintenanceSettings = {
  threshold: 40,
  divisor: 10,
};

export interface CatchUpSettings {
  ipGrace: number;
  ipStep: number;
  stateGrace: number;
  maxModifier: number;
}

export const DEFAULT_CATCH_UP_SETTINGS: CatchUpSettings = {
  ipGrace: 10,
  ipStep: 5,
  stateGrace: 1,
  maxModifier: 4,
};

export interface CatchUpEvaluation {
  swingTax: number;
  catchUpBonus: number;
  ipGap: number;
  stateGap: number;
}

/**
 * Computes turn income modifiers for the swing-tax / catch-up system.
 *
 * Let `Δip = playerIp - opponentIp` and `Δstates = playerStates - opponentStates`.
 * We ignore small advantages within the configured grace windows. For IP this means
 * no modifier while `Δip <= graceIp`. Every *full* `ipStep` beyond the grace adds
 * 1 point of swing tax (or bonus when trailing). State leads follow the same logic:
 * no change while `Δstates <= graceStates`, then +1 per extra controlled state.
 *
 * The resulting modifier is capped symmetrically by `maxModifier`, yielding a final
 * income of `5 + controlledStates - swingTax + catchUpBonus`.
 */
export const evaluateCatchUpAdjustments = (
  ipGap: number,
  stateGap: number,
  settings: CatchUpSettings = DEFAULT_CATCH_UP_SETTINGS,
): CatchUpEvaluation => {
  const normalizedSettings = {
    ipGrace: Math.max(0, settings.ipGrace),
    ipStep: Math.max(1, settings.ipStep),
    stateGrace: Math.max(0, settings.stateGrace),
    maxModifier: Math.max(0, settings.maxModifier),
  };

  const computeIpModifier = (gap: number): number => {
    if (gap <= normalizedSettings.ipGrace) {
      return 0;
    }
    return Math.floor((gap - normalizedSettings.ipGrace) / normalizedSettings.ipStep);
  };

  const computeStateModifier = (gap: number): number => {
    if (gap <= normalizedSettings.stateGrace) {
      return 0;
    }
    return gap - normalizedSettings.stateGrace;
  };

  let swingTax = 0;
  let catchUpBonus = 0;

  if (ipGap > 0) {
    swingTax += computeIpModifier(ipGap);
  } else if (ipGap < 0) {
    catchUpBonus += computeIpModifier(-ipGap);
  }

  if (stateGap > 0) {
    swingTax += computeStateModifier(stateGap);
  } else if (stateGap < 0) {
    catchUpBonus += computeStateModifier(-stateGap);
  }

  swingTax = Math.min(normalizedSettings.maxModifier, Math.max(0, swingTax));
  catchUpBonus = Math.min(normalizedSettings.maxModifier, Math.max(0, catchUpBonus));

  return {
    swingTax,
    catchUpBonus,
    ipGap,
    stateGap,
  };
};

const computeStateIncomeDetails = (states: string[]): StateIncomeContribution[] => {
  const contributions = new Map<string, StateIncomeContribution>();

  for (const stateId of states) {
    const trimmed = stateId.trim();
    if (!trimmed) {
      continue;
    }
    const upper = trimmed.toUpperCase();
    const metadata = getStateByAbbreviation(upper) ?? getStateById(trimmed);

    const abbreviation = metadata?.abbreviation ?? (upper || trimmed || 'UNKNOWN');
    const key = abbreviation;
    const entry = contributions.get(key);

    if (entry) {
      entry.count += 1;
      entry.state = metadata?.name ?? trimmed;
      entry.fallback = entry.fallback && !metadata;
      continue;
    }

    contributions.set(key, {
      state: metadata?.name ?? trimmed,
      abbreviation,
      count: 1,
      fallback: !metadata,
    });
  }

  return Array.from(contributions.values());
};

export function computeTurnIpIncome(
  player: PlayerState,
  opponent: PlayerState,
  maintenanceSettings: IpMaintenanceSettings = DEFAULT_IP_MAINTENANCE,
  catchUpSettings: CatchUpSettings = DEFAULT_CATCH_UP_SETTINGS,
): IpIncomeBreakdown {
  const stateIncomeDetails = computeStateIncomeDetails(player.states);
  const stateIncomeTotal = stateIncomeDetails.length;
  const baseIncome = 5 + stateIncomeTotal;
  const overage = Math.max(0, player.ip - maintenanceSettings.threshold);
  const rawMaintenance = maintenanceSettings.divisor > 0 ? Math.floor(overage / maintenanceSettings.divisor) : 0;
  const maintenance = Math.max(0, rawMaintenance);
  const catchUp = evaluateCatchUpAdjustments(player.ip - opponent.ip, player.states.length - opponent.states.length, catchUpSettings);
  const grossIncome = baseIncome - maintenance - catchUp.swingTax + catchUp.catchUpBonus;
  const netIncome = Math.max(0, grossIncome);

  return {
    baseIncome,
    maintenance,
    swingTax: catchUp.swingTax,
    catchUpBonus: catchUp.catchUpBonus,
    netIncome,
    ipGap: catchUp.ipGap,
    stateGap: catchUp.stateGap,
    stateIncomeDetails,
  };
}

export function startTurn(state: GameState): GameState {
  const cloned = cloneGameState(state);
  const currentId = cloned.currentPlayer;
  const me = cloned.players[currentId];
  const opponent = cloned.players[otherPlayer(currentId)];
  const { baseIncome, maintenance, swingTax, catchUpBonus, netIncome, ipGap, stateGap, stateIncomeDetails } = computeTurnIpIncome(
    me,
    opponent,
  );
  const logEntries = [...cloned.log];

  const baseComponents: string[] = ['base 5'];
  if (stateIncomeDetails.length > 0) {
    const formattedStates = stateIncomeDetails.map(detail => {
      const quantity = detail.count > 1 ? ` x${detail.count}` : '';
      if (detail.fallback) {
        return `${detail.abbreviation}${quantity} (fallback)`;
      }
      return `${detail.abbreviation}${quantity}`;
    });
    baseComponents.push(`states ${formattedStates.join(', ')}`);
  }
  logEntries.push(`${currentId} income +${baseIncome} IP (${baseComponents.join('; ')})`);

  if (maintenance > 0) {
    logEntries.push(
      `${currentId} maintenance -${maintenance} IP (reserves ${me.ip} > threshold ${DEFAULT_IP_MAINTENANCE.threshold}, divisor ${DEFAULT_IP_MAINTENANCE.divisor})`,
    );
  }
  if (swingTax > 0) {
    const leadParts: string[] = [];
    if (ipGap > 0) {
      leadParts.push(`lead ${ipGap} IP`);
    }
    if (stateGap > 0) {
      const label = stateGap === 1 ? 'state' : 'states';
      leadParts.push(`lead ${stateGap} ${label}`);
    }
    const reason = leadParts.length ? ` (${leadParts.join(', ')})` : '';
    logEntries.push(`${currentId} swing tax -${swingTax} IP${reason}`);
  }
  if (catchUpBonus > 0) {
    const deficitParts: string[] = [];
    if (ipGap < 0) {
      deficitParts.push(`behind ${Math.abs(ipGap)} IP`);
    }
    if (stateGap < 0) {
      const deficit = Math.abs(stateGap);
      const label = deficit === 1 ? 'state' : 'states';
      deficitParts.push(`behind ${deficit} ${label}`);
    }
    const reason = deficitParts.length ? ` (${deficitParts.join(', ')})` : '';
    logEntries.push(`${currentId} catch-up bonus +${catchUpBonus} IP${reason}`);
  }
  const updatedPlayer: PlayerState = {
    ...drawUpToFive(me),
    ip: me.ip + netIncome,
  };

  return {
    ...cloned,
    players: {
      ...cloned.players,
      [currentId]: updatedPlayer,
    },
    playsThisTurn: 0,
    turnPlays: [],
    log: logEntries,
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
    if (typeof effects?.ipDelta?.opponent === 'number') {
      metadata.damage = effects.ipDelta.opponent;
    }
    if (typeof effects?.ipDelta?.opponentPercent === 'number') {
      metadata.damagePercent = effects.ipDelta.opponentPercent;
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
  const comboPlayerFaction = cloned.players[currentId]?.faction === 'government' ? 'government' : 'truth';
  const comboSummary: ComboSummary = {
    ...comboEvaluation,
    player: currentId,
    playerFaction: comboPlayerFaction,
    turn: turnNumber,
  };

  if (comboEvaluation.results.length > 0) {
    const summaryText = comboEvaluation.results
      .map(result => {
        const rewardText = formatComboReward(result.appliedReward, { faction: comboPlayerFaction });
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
      if (typeof window !== 'undefined' && typeof (window as any).uiComboToast === 'function') {
        const rewardText = formatComboReward(result.appliedReward, { faction: comboPlayerFaction });
        (window as any).uiComboToast(
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

  auditGameState(finalState);

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

  if (state.truth >= 95) {
    const truthPlayer = players.P1.faction === 'truth' ? 'P1' : 'P2';
    return { winner: truthPlayer, reason: 'truth' };
  }

  if (state.truth <= 5) {
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
