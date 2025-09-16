import { describe, expect, it, beforeEach, afterEach } from "bun:test";
import { canPlay, endTurn, playCard, resolve, winCheck } from "../engine/gameplay";
import type { Card, GameState } from "../engine/types";
import { TRUTH_CARDS, GOVERNMENT_CARDS } from "../data/cards";
import { validateCard } from "../engine/validation";

const attackCard = TRUTH_CARDS.find(card => card.type === "ATTACK" && card.rarity === "common")!;
const zoneCard = TRUTH_CARDS.find(card => card.type === "ZONE" && card.rarity === "legendary")!;
const mediaCard = TRUTH_CARDS.find(card => card.type === "MEDIA" && card.rarity === "rare")!;
const attackDiscardCard = TRUTH_CARDS.find(card => card.type === "ATTACK" && "discardOpponent" in card.effects)! as Card;
const mediaNegativeCard = GOVERNMENT_CARDS.find(card => card.type === "MEDIA" && card.rarity === "legendary")!;
const zoneCaptureCard = TRUTH_CARDS.find(card => card.type === "ZONE" && card.rarity === "legendary")!;

const createState = (): GameState => ({
  turn: 1,
  currentPlayer: "P1",
  truth: 50,
  players: {
    P1: {
      id: "P1",
      faction: "truth",
      deck: [],
      hand: [],
      discard: [],
      ip: 10,
      states: [],
    },
    P2: {
      id: "P2",
      faction: "government",
      deck: [],
      hand: [],
      discard: [],
      ip: 10,
      states: [],
    },
  },
  pressureByState: {
    CA: { P1: 0, P2: 0 },
    NY: { P1: 0, P2: 0 },
  },
  stateDefense: {
    CA: 3,
    NY: 4,
  },
  playsThisTurn: 0,
});

describe("canPlay", () => {
  it("rejects a fourth play in the same turn", () => {
    const state = createState();
    state.players.P1.hand = [attackCard];
    state.playsThisTurn = 3;
    const result = canPlay(state, attackCard);
    expect(result.ok).toBeFalse();
    expect(result.reason).toBe("Play limit reached");
  });

  it("rejects plays when IP is insufficient", () => {
    const state = createState();
    state.players.P1.hand = [mediaCard];
    state.players.P1.ip = mediaCard.cost - 1;
    const result = canPlay(state, mediaCard);
    expect(result.ok).toBeFalse();
    expect(result.reason).toBe("Not enough IP");
  });

  it("requires a target state for ZONE cards", () => {
    const state = createState();
    state.players.P1.hand = [zoneCard];
    const noTarget = canPlay(state, zoneCard);
    expect(noTarget.ok).toBeFalse();
    expect(noTarget.reason).toBe("Select a target state");
    const withTarget = canPlay(state, zoneCard, "CA");
    expect(withTarget.ok).toBeTrue();
  });
});

describe("resolve", () => {
  let originalRandom: typeof Math.random;

  beforeEach(() => {
    originalRandom = Math.random;
  });

  afterEach(() => {
    Math.random = originalRandom;
  });

  it("prevents ATTACK cards from reducing IP below zero and discards opponents", () => {
    Math.random = () => 0;
    const state = createState();
    state.players.P1.hand = [attackDiscardCard];
    state.players.P2.hand = [attackCard, mediaCard, zoneCard];
    state.players.P2.ip = 3;

    const afterPlay = playCard(state, attackDiscardCard.id);

    expect(afterPlay.players.P2.ip).toBe(0);
    expect(afterPlay.players.P2.hand.length).toBe(2);
    expect(afterPlay.players.P2.discard.length).toBe(1);

  });

  it("clamps truth when MEDIA cards resolve", () => {
    const highTruthState = createState();
    highTruthState.truth = 98;
    const afterPositive = resolve(highTruthState, "P1", mediaCard);
    expect(afterPositive.truth).toBe(100);

    const lowTruthState = createState();
    lowTruthState.truth = 2;
    const afterNegative = resolve(lowTruthState, "P2", mediaNegativeCard);
    expect(afterNegative.truth).toBe(0);
  });

  it("captures states when pressure meets defense", () => {
    const state = createState();
    state.players.P1.hand = [zoneCaptureCard];
    const after = resolve(state, "P1", zoneCaptureCard, "CA");
    expect(after.players.P1.states).toContain("CA");
    expect(after.players.P2.states).not.toContain("CA");
    expect(after.pressureByState.CA.P1).toBe(0);
    expect(after.pressureByState.CA.P2).toBe(0);
  });
});

describe("endTurn", () => {
  it("charges IP for discards beyond the first", () => {
    const state = createState();
    const handCards = [attackCard, mediaCard, zoneCard];
    state.players.P1.hand = handCards;
    state.players.P1.ip = 10;

    const ended = endTurn(state, handCards.map(card => card.id));

    expect(ended.players.P1.hand.length).toBe(0);
    expect(ended.players.P1.discard.length).toBe(3);
    expect(ended.players.P1.ip).toBe(8);
    expect(ended.currentPlayer).toBe("P2");
    expect(ended.playsThisTurn).toBe(0);
  });
});

describe("winCheck", () => {
  it("detects state victories", () => {
    const state = createState();
    state.players.P1.states = [
      "CA", "NY", "PA", "IL", "OH", "GA", "NC", "MI", "WA", "AZ",
    ];
    const result = winCheck(state);
    expect(result).toEqual({ winner: "P1", reason: "states" });
  });

  it("detects truth victories", () => {
    const state = createState();
    state.truth = 95;
    const truthResult = winCheck(state);
    expect(truthResult).toEqual({ winner: "P1", reason: "truth" });

    state.truth = 5;
    const govResult = winCheck(state);
    expect(govResult).toEqual({ winner: "P2", reason: "truth" });
  });

  it("detects IP victories", () => {
    const state = createState();
    state.players.P2.ip = 200;
    const result = winCheck(state);
    expect(result).toEqual({ winner: "P2", reason: "ip" });
  });
});

describe("card validation", () => {
  it("rejects unknown effect keys", () => {
    const invalid = {
      ...attackCard,
      id: "TR-AT-C-999",
      effects: { ipDelta: { opponent: 1 }, bonus: 2 },
    } as Card;
    expect(() => validateCard(invalid)).toThrow();
  });

  it("rejects cards with mismatched cost", () => {
    const invalid = {
      ...zoneCard,
      id: "TR-ZO-L-999",
      cost: zoneCard.cost + 1,
    } as Card;
    expect(() => validateCard(invalid)).toThrow();
  });
});
