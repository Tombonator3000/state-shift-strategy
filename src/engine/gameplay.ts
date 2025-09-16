import { BASE_INCOME, EXTRA_DISCARD_COST, HAND_LIMIT, MAX_PLAYS_PER_TURN, WIN_IP_THRESHOLD, WIN_STATES_THRESHOLD, WIN_TRUTH_GOV, WIN_TRUTH_TRUTH } from "./constants";
import type { Card, EffectsATTACK, EffectsMEDIA, EffectsZONE, GameState, PlayerID } from "./types";
import { assertState, cloneState, ensureValidTruth, validateCard } from "./validation";

const opponentOf = (player: PlayerID): PlayerID => (player === "P1" ? "P2" : "P1");

const shuffle = <T>(items: T[]): T[] => {
  const copy = [...items];
  for (let i = copy.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
};

const drawCard = (state: GameState, player: PlayerID) => {
  const me = state.players[player];
  if (me.deck.length === 0 && me.discard.length > 0) {
    me.deck = shuffle(me.discard);
    me.discard = [];
  }
  if (me.deck.length > 0) {
    const [next, ...rest] = me.deck;
    me.deck = rest;
    me.hand = [...me.hand, next];
  }
};

const drawToLimit = (state: GameState, player: PlayerID) => {
  while (state.players[player].hand.length < HAND_LIMIT) {
    const before = state.players[player].hand.length;
    drawCard(state, player);
    if (state.players[player].hand.length === before) {
      break;
    }
  }
};

export const startTurn = (s: GameState): GameState => {
  const state = cloneState(s);
  const current = state.currentPlayer;
  const me = state.players[current];
  me.ip += BASE_INCOME + me.states.length;
  drawToLimit(state, current);
  state.playsThisTurn = 0;
  return state;
};

export const canPlay = (s: GameState, card: Card, targetStateId?: string): { ok: boolean; reason?: string } => {
  try {
    validateCard(card);
  } catch (error) {
    return { ok: false, reason: (error as Error).message };
  }

  const player = s.players[s.currentPlayer];
  if (!player.hand.some(c => c.id === card.id)) {
    return { ok: false, reason: "Card not in hand" };
  }

  if (s.playsThisTurn >= MAX_PLAYS_PER_TURN) {
    return { ok: false, reason: "Play limit reached" };
  }

  if (player.ip < card.cost) {
    return { ok: false, reason: "Not enough IP" };
  }

  if (card.faction !== player.faction) {
    return { ok: false, reason: "Wrong faction" };
  }

  if (card.type === "ZONE") {
    if (!targetStateId) {
      return { ok: false, reason: "Select a target state" };
    }
    if (!s.stateDefense[targetStateId]) {
      return { ok: false, reason: "Unknown state" };
    }
  }

  return { ok: true };
};

export const resolve = (s: GameState, owner: PlayerID, card: Card, targetStateId?: string): GameState => {
  const state = cloneState(s);
  const me = state.players[owner];
  const opponent = state.players[opponentOf(owner)];

  switch (card.type) {
    case "ATTACK": {
      const effect = card.effects as EffectsATTACK;
      opponent.ip = Math.max(0, opponent.ip - effect.ipDelta.opponent);
      const discardCount = effect.discardOpponent ?? 0;
      if (discardCount > 0 && opponent.hand.length > 0) {
        const indices = shuffle(opponent.hand).slice(0, Math.min(discardCount, opponent.hand.length));
        const selected = new Set(indices.map(cardInHand => cardInHand.id));
        const remaining: typeof opponent.hand = [];
        const moved: typeof opponent.discard = [];
        for (const cardInHand of opponent.hand) {
          if (selected.has(cardInHand.id)) {
            moved.push(cardInHand);
          } else {
            remaining.push(cardInHand);
          }
        }
        opponent.hand = remaining;
        opponent.discard = [...opponent.discard, ...moved];
      }
      break;
    }
    case "MEDIA": {
      const effect = card.effects as EffectsMEDIA;
      state.truth = ensureValidTruth(state.truth + effect.truthDelta);
      break;
    }
    case "ZONE": {
      if (!targetStateId) {
        throw new Error("ZONE card requires a target state");
      }
      if (!state.stateDefense[targetStateId]) {
        throw new Error(`Unknown state ${targetStateId}`);
      }
      const effect = card.effects as EffectsZONE;
      const pressure = state.pressureByState[targetStateId] ?? { P1: 0, P2: 0 };
      pressure[owner] = (pressure[owner] ?? 0) + effect.pressureDelta;
      state.pressureByState[targetStateId] = pressure;
      const defense = state.stateDefense[targetStateId];
      if (pressure[owner] >= defense) {
        pressure.P1 = 0;
        pressure.P2 = 0;
        state.pressureByState[targetStateId] = pressure;
        if (!me.states.includes(targetStateId)) {
          me.states = [...me.states, targetStateId];
        }
        opponent.states = opponent.states.filter(stateId => stateId !== targetStateId);
      }
      break;
    }
    default:
      throw new Error(`Unsupported card type ${(card as Card).type}`);
  }

  return state;
};

export const playCard = (s: GameState, cardId: string, targetStateId?: string): GameState => {
  const state = cloneState(s);
  const current = state.currentPlayer;
  const me = state.players[current];
  const cardIndex = me.hand.findIndex(card => card.id === cardId);
  if (cardIndex === -1) {
    throw new Error(`Card ${cardId} not found in hand`);
  }
  const card = me.hand[cardIndex];

  const check = canPlay(state, card, targetStateId);
  if (!check.ok) {
    throw new Error(check.reason ?? "Cannot play card");
  }

  me.hand = me.hand.filter(c => c.id !== cardId);
  me.ip -= card.cost;
  state.playsThisTurn += 1;
  const resolved = resolve(state, current, card, targetStateId);
  resolved.players[current].discard = [...resolved.players[current].discard, card];
  assertState(resolved);
  return resolved;
};

export const endTurn = (s: GameState, discards: string[]): GameState => {
  const state = cloneState(s);
  const current = state.currentPlayer;
  const me = state.players[current];
  const uniqueDiscards = Array.from(new Set(discards));
  const discardedCards: Card[] = [];

  uniqueDiscards.forEach((id, index) => {
    const cardIndex = me.hand.findIndex(card => card.id === id);
    if (cardIndex === -1) {
      throw new Error(`Cannot discard ${id}: card not in hand`);
    }
    const [card] = me.hand.splice(cardIndex, 1);
    discardedCards.push(card);
    if (index >= 1) {
      me.ip = Math.max(0, me.ip - EXTRA_DISCARD_COST);
    }
  });

  me.discard = [...me.discard, ...discardedCards];
  state.currentPlayer = opponentOf(current);
  state.turn += 1;
  state.playsThisTurn = 0;
  assertState(state);
  return state;
};

export const winCheck = (s: GameState): { winner?: PlayerID; reason?: "states" | "truth" | "ip" } => {
  if (s.players.P1.states.length >= WIN_STATES_THRESHOLD) {
    return { winner: "P1", reason: "states" };
  }
  if (s.players.P2.states.length >= WIN_STATES_THRESHOLD) {
    return { winner: "P2", reason: "states" };
  }

  const truthPlayer = Object.values(s.players).find(player => player.faction === "truth");
  const governmentPlayer = Object.values(s.players).find(player => player.faction === "government");

  if (s.truth >= WIN_TRUTH_TRUTH && truthPlayer) {
    return { winner: truthPlayer.id, reason: "truth" };
  }
  if (s.truth <= WIN_TRUTH_GOV && governmentPlayer) {
    return { winner: governmentPlayer.id, reason: "truth" };
  }

  if (s.players.P1.ip >= WIN_IP_THRESHOLD) {
    return { winner: "P1", reason: "ip" };
  }
  if (s.players.P2.ip >= WIN_IP_THRESHOLD) {
    return { winner: "P2", reason: "ip" };
  }

  return {};
};
