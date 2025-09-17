// src/ai/policy.ts
import { AI_PRESETS, type AiConfig, type Difficulty } from "./difficulty";
import {
  cloneGameState,
  canPlay,
  playCard,
  endTurn,
  type GameState,
  type Card,
} from "../mvp";

const AI_DEBUG = false;

type PlayerId = keyof GameState["players"];

type PlayCardAction = {
  type: "play-card";
  cardId: string;
  targetStateId?: string;
  cardType?: Card["type"];
};

type EndTurnAction = {
  type: "end-turn";
  discards?: string[];
};

type Action = PlayCardAction | EndTurnAction;

type Node = { state: GameState; actions: Action[]; score: number; depth: number };

export function chooseTurnActions(state: GameState, level: Difficulty): Action[] {
  const cfg = AI_PRESETS[level];
  const root: Node = {
    state: cloneState(state),
    actions: [],
    score: evaluate(state, cfg),
    depth: 0,
  };

  const rootPlayer = state.currentPlayer as PlayerId;

  let frontier: Node[] = [root];
  for (let d = 0; d < cfg.lookaheadDepth; d++) {
    const layer: Node[] = [];
    for (const node of frontier) {
      const chains = generateActionSequences(node.state, cfg, rootPlayer);
      for (const seq of chains) {
        const s2 = simulateSequence(node.state, seq);
        const score = rolloutEstimate(s2, cfg);
        layer.push({ state: s2, actions: [...node.actions, ...seq], score, depth: d + 1 });
      }
    }
    layer.sort((a, b) => b.score - a.score);
    frontier = layer.slice(0, Math.max(1, cfg.beamWidth));
    if (!frontier.length) break;
  }

  const pick = frontier[0] ?? root;
  if (Math.random() < cfg.randomness && frontier.length > 1) {
    const randomIndex = Math.min(1, frontier.length - 1);
    return frontier[randomIndex].actions;
  }
  if (AI_DEBUG) {
    console.info(
      "[AI]",
      level,
      "→",
      pick.actions
        .map(action => (action.type === "play-card" ? action.cardId : action.type))
        .join(" → "),
      pick.score.toFixed(2),
    );
  }
  return pick.actions;
}

export function evaluate(s: GameState, cfg: AiConfig): number {
  const me = s.currentPlayer as PlayerId;
  const opp: PlayerId = me === "P1" ? "P2" : "P1";
  const myState = s.players?.[me];
  const oppState = s.players?.[opp];
  const truth = s.truth ?? 50;

  const myTruth = factionTruth(truth, myState?.faction);
  const opTruth = factionTruth(truth, oppState?.faction);
  const myBoard = (myState?.states?.length ?? 0) - (oppState?.states?.length ?? 0);
  const ip = myState?.ip ?? 0;
  const hand = myState?.hand?.length ?? 0;
  const tempo = 0; // Placeholder until tempo tracking exists in the engine
  const risk = expectedCounterRisk(s, cfg);

  let score =
    cfg.valueTruthSwing * (myTruth - opTruth) +
    0.6 * myBoard +
    cfg.resourceValue * (ip * 0.2 + Math.min(hand, 5) * 0.4) +
    0.2 * tempo -
    0.8 * risk;

  if (opTruth >= 60) score += cfg.denialPriority * 8;
  if (myTruth >= 60) score += cfg.aggression * 5;
  return score;
}

function generateActionSequences(s: GameState, cfg: AiConfig, rootPlayer: PlayerId): Action[][] {
  const singles = legalActionsFor(s, rootPlayer)
    .sort((a, b) => scoreAction(s, b, cfg) - scoreAction(s, a, cfg))
    .slice(0, 6);
  const chains: Action[][] = [];

  for (const a of singles) {
    const s1 = applyAction(cloneState(s), a);
    chains.push([a]);

    if (s1.currentPlayer !== rootPlayer) continue;

    const seconds = legalActionsFor(s1, rootPlayer)
      .sort((x, y) => scoreAction(s1, y, cfg) - scoreAction(s1, x, cfg))
      .slice(0, 4);

    for (const b of seconds) {
      const s2 = applyAction(cloneState(s1), b);
      chains.push([a, b]);

      if (s2.currentPlayer !== rootPlayer) continue;

      const thirds = legalActionsFor(s2, rootPlayer)
        .sort((x, y) => scoreAction(s2, y, cfg) - scoreAction(s2, x, cfg))
        .slice(0, 2);

      for (const c of thirds) chains.push([a, b, c]);
    }
  }

  return dedupeAndFilter(chains, s.players?.[s.currentPlayer as PlayerId]?.ip ?? 0);
}

function scoreAction(s: GameState, a: Action, cfg: AiConfig) {
  const after = applyAction(cloneState(s), a);
  return evaluate(after, cfg) - evaluate(s, cfg);
}

function simulateSequence(s: GameState, seq: Action[]) {
  let cur = cloneState(s);
  for (const a of seq) cur = applyAction(cur, a);
  return cur;
}

function rolloutEstimate(s: GameState, cfg: AiConfig): number {
  const runs = cfg.rolloutsPerBranch | 0;
  if (runs <= 0) return evaluate(s, cfg);
  let acc = 0;
  for (let i = 0; i < runs; i++) acc += evaluate(s, cfg); // cheap 0-ply rollout (can upgrade later)
  return acc / runs;
}

function cloneState(state: GameState): GameState {
  return cloneGameState(state);
}

function applyAction(state: GameState, action: Action): GameState {
  if (action.type === "play-card") {
    return playCard(state, action.cardId, action.targetStateId);
  }
  if (action.type === "end-turn") {
    return endTurn(state, action.discards ?? []);
  }
  return state;
}

function legalActionsFor(state: GameState, rootPlayer: PlayerId): Action[] {
  if (state.currentPlayer !== rootPlayer) return [];

  const player = state.players?.[state.currentPlayer as PlayerId];
  if (!player) return [];

  const actions: Action[] = [];
  const seen = new Set<string>();
  const targetCandidates = collectZoneTargets(state, player.states);

  for (const card of player.hand ?? []) {
    if (card.type === "ZONE") {
      for (const target of targetCandidates) {
        const key = `${card.id}:${target}`;
        if (seen.has(key)) continue;
        const eligibility = canPlay(state, card, target);
        if (eligibility.ok) {
          actions.push({ type: "play-card", cardId: card.id, targetStateId: target, cardType: card.type });
          seen.add(key);
        }
      }
    } else {
      const key = card.id;
      if (seen.has(key)) continue;
      const eligibility = canPlay(state, card);
      if (eligibility.ok) {
        actions.push({ type: "play-card", cardId: card.id, cardType: card.type });
        seen.add(key);
      }
    }
  }

  if (!actions.length) {
    actions.push({ type: "end-turn", discards: [] });
  }

  return actions;
}

function collectZoneTargets(state: GameState, ownedStates: string[] = []): string[] {
  const defensiveEntries = Object.entries(state.stateDefense ?? {});
  const sorted = defensiveEntries
    .filter(([id]) => !ownedStates.includes(id))
    .sort(([, aDefense], [, bDefense]) => aDefense - bDefense)
    .map(([id]) => id);

  const filler = Object.keys(state.stateDefense ?? {});
  const combined = sorted.length ? sorted : filler;
  return combined.slice(0, 6);
}

function factionTruth(truth: number, faction?: Card["faction"]): number {
  if (!faction) return truth;
  return faction === "truth" ? truth : 100 - truth;
}

// Stubs to keep template compile-safe (replace with real logic if available)
function expectedCounterRisk(_s: GameState, _cfg: AiConfig): number {
  return 0;
}

function dedupeAndFilter(chains: Action[][], _ipBudget: number) {
  const seen = new Set<string>();
  const results: Action[][] = [];
  for (const chain of chains) {
    const key = chain
      .map(action =>
        action.type === "play-card"
          ? `${action.type}:${action.cardId}:${action.targetStateId ?? "*"}`
          : action.type,
      )
      .join("|");
    if (seen.has(key)) continue;
    seen.add(key);
    results.push(chain);
  }
  return results;
}

export type { Action };
