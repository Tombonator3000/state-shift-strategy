import { cloneGameState } from './validator';
import { computeMediaTruthDelta_MVP, warnIfMediaScaling, type MediaResolutionOptions } from './media';
import { applyTruthDelta } from '@/utils/truth';
import type {
  Card,
  EffectsATTACK,
  EffectsZONE,
  GameState,
  PlayerState,
} from './validator';

const otherPlayer = (id: 'P1' | 'P2'): 'P1' | 'P2' => (id === 'P1' ? 'P2' : 'P1');

type PlayerId = 'P1' | 'P2';

function clampIP(x: number) {
  return Math.max(0, Math.floor(x));
}

function discardRandom(gs: GameState, who: PlayerId, count: number) {
  let remaining = Math.max(0, Math.floor(count));
  if (remaining <= 0) return;

  const target = gs.players[who];
  const hand = [...target.hand];
  const discard = [...target.discard];

  while (remaining > 0 && hand.length > 0) {
    const index = Math.floor(Math.random() * hand.length);
    const [card] = hand.splice(index, 1);
    discard.push(card);
    remaining -= 1;
  }

  gs.players[who] = {
    ...target,
    hand,
    discard,
  };
}

function applyAttackEffect(
  gs: GameState,
  who: PlayerId,
  eff: { ipDelta?: { opponent?: number }; discardOpponent?: number },
) {
  const opp: PlayerId = who === 'P1' ? 'P2' : 'P1';
  const dmg = Math.max(0, eff.ipDelta?.opponent ?? 0);
  const before = gs.players[opp].ip;
  gs.players[opp].ip = clampIP(before - dmg);
  gs.log.push(`Opponent loses ${dmg} IP (${before} → ${gs.players[opp].ip})`);
  if ((eff.discardOpponent ?? 0) > 0) {
    discardRandom(gs, opp, eff.discardOpponent!);
  }
}

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

  const interimState: GameState = {
    ...cloned,
    players: {
      ...cloned.players,
      [currentId]: updatedPlayer,
    },
    playsThisTurn: cloned.playsThisTurn + 1,
  };

  return resolve(interimState, currentId, card, targetStateId, opts);
}

export function resolve(
  state: GameState,
  owner: 'P1' | 'P2',
  card: Card,
  targetStateId?: string,
  opts: MediaResolutionOptions = {},
): GameState {
  const cloned = cloneGameState(state);
  const opponentId = otherPlayer(owner);
  const me = cloned.players[owner];
  const opponent = cloned.players[opponentId];

  if (card.type === 'ATTACK') {
    const effects = card.effects as EffectsATTACK;
    applyAttackEffect(cloned, owner, effects);
    return cloned;
  }

  if (card.type === 'MEDIA') {
    const delta = computeMediaTruthDelta_MVP(me, card, opts);
    warnIfMediaScaling(card, delta);
    const updated = {
      ...cloned,
      log: [...cloned.log],
    };
    applyTruthDelta(updated, delta, owner);
    return updated;
  }

  if (!targetStateId) {
    throw new Error('ZONE card requires target state');
  }

  const effects = card.effects as EffectsZONE;
  const currentPressure = cloned.pressureByState[targetStateId] ?? { P1: 0, P2: 0 };
  const ownerPressure = currentPressure[owner] + effects.pressureDelta;
  let pressureByState = {
    ...cloned.pressureByState,
    [targetStateId]: { ...currentPressure, [owner]: ownerPressure },
  };

  let updatedPlayers: Record<'P1' | 'P2', PlayerState> = {
    ...cloned.players,
    [owner]: { ...me },
    [opponentId]: { ...opponent },
  };

  const defense = cloned.stateDefense[targetStateId] ?? Infinity;
  if (ownerPressure >= defense) {
    pressureByState = {
      ...pressureByState,
      [targetStateId]: { P1: 0, P2: 0 },
    };

    const ownerStates = new Set(updatedPlayers[owner].states);
    ownerStates.add(targetStateId);
    const opponentStates = updatedPlayers[opponentId].states.filter(stateId => stateId !== targetStateId);

    updatedPlayers = {
      ...updatedPlayers,
      [owner]: {
        ...updatedPlayers[owner],
        states: Array.from(ownerStates),
      },
      [opponentId]: {
        ...updatedPlayers[opponentId],
        states: opponentStates,
      },
    };
  }

  return {
    ...cloned,
    players: updatedPlayers,
    pressureByState,
  };
}

export function endTurn(state: GameState, discards: string[]): GameState {
  const cloned = cloneGameState(state);
  const currentId = cloned.currentPlayer;
  const player = cloned.players[currentId];

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

  const nextPlayer = otherPlayer(currentId);

  return {
    ...cloned,
    currentPlayer: nextPlayer,
    turn: cloned.turn + 1,
    playsThisTurn: 0,
    players: {
      ...cloned.players,
      [currentId]: updatedPlayer,
    },
  };
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

  if (players.P1.ip >= 200) {
    return { winner: 'P1', reason: 'ip' };
  }
  if (players.P2.ip >= 200) {
    return { winner: 'P2', reason: 'ip' };
  }

  return {};
}
