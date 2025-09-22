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
import { DEFAULT_MAX_CARDS_PER_TURN, normalizeMaxCardsPerTurn } from "@/config/turnLimits";

const AI_DEBUG = false;

type PlayerId = keyof GameState["players"];

type PlayCardAction = {
  type: "play-card";
  kind: "PLAY";
  cardId: string;
  targetStateId?: string;
  cardType?: Card["type"];
  card: Card;
};

type EndTurnAction = {
  type: "end-turn";
  kind: "END";
  discards?: string[];
};

type Action = PlayCardAction | EndTurnAction;

type Node = { state: GameState; actions: Action[]; score: number; depth: number };

// === Helpers for goal-aware bursts (Truth ≥95 / Gov ≤5) ===
function availableIPAfterSeq(gs: GameState, me: PlayerId, seq: Action[]): number {
  const start = gs.players?.[me]?.ip ?? 0;
  const spent = seq.reduce((acc, a) => acc + (a.type === 'play-card' ? a.card?.cost ?? 0 : 0), 0);
  return start - spent;
}

function canAfford(gs: GameState, me: PlayerId, seq: Action[], next: Action): boolean {
  const ipLeft = availableIPAfterSeq(gs, me, seq);
  const cost = next.type === 'play-card' ? next.card?.cost ?? 0 : 0;
  return ipLeft >= cost;
}

/** Picks MEDIA cards up to the per-turn limit to reach Truth goals. */
function planMediaBurstToGoal(ctx: { state: GameState; legal: Action[] }): Action[] | null {
  const gs = ctx.state;
  const me = gs.currentPlayer as PlayerId;
  const faction = gs.players?.[me]?.faction; // "truth" | "government"
  const curTruth = gs.truth;
  const maxBurstSize = normalizeMaxCardsPerTurn(gs.maxPlaysPerTurn ?? DEFAULT_MAX_CARDS_PER_TURN);

  // Partition medias by sign
  const medias = ctx.legal.filter(
    a => a.kind === "PLAY" && a.card?.type === "MEDIA" && typeof a.card?.effects?.truthDelta === "number",
  );
  if (medias.length === 0) return null;

  if (faction === "truth") {
    // Need Δ+ to reach 95
    const need = 95 - curTruth;
    if (need <= 0) return null;
    // Sort descending by +truthDelta
    const plus = medias
      .filter(a => a.type === 'play-card' && (a.card!.effects!.truthDelta || 0) > 0)
      .sort((a, b) => {
        const deltaB = b.type === 'play-card' ? (b.card!.effects!.truthDelta || 0) : 0;
        const deltaA = a.type === 'play-card' ? (a.card!.effects!.truthDelta || 0) : 0;
        return deltaB - deltaA;
      });
    let acc = 0;
    const seq: Action[] = [];
    for (const a of plus) {
      if (seq.length === maxBurstSize) break;
      if (!canAfford(gs, me, seq, a)) continue;
      seq.push(a);
      acc += a.type === 'play-card' ? (a.card!.effects!.truthDelta || 0) : 0;
      if (curTruth + acc >= 95) return seq;
    }
    return null;
  }

  if (faction === "government") {
    // Need Δ- to reach 5 (i.e., reduce by >= (curTruth - 5))
    const needDown = curTruth - 5;
    if (needDown <= 0) return null;
    // Sort ascending by truthDelta (most negative first)
    const minus = medias
      .filter(a => a.type === 'play-card' && (a.card!.effects!.truthDelta || 0) < 0)
      .sort((a, b) => {
        const deltaA = a.type === 'play-card' ? (a.card!.effects!.truthDelta || 0) : 0;
        const deltaB = b.type === 'play-card' ? (b.card!.effects!.truthDelta || 0) : 0;
        return deltaA - deltaB;
      });
    let acc = 0;
    const seq: Action[] = [];
    for (const a of minus) {
      if (seq.length === maxBurstSize) break;
      if (!canAfford(gs, me, seq, a)) continue;
      seq.push(a);
      acc += Math.abs(a.type === 'play-card' ? (a.card!.effects!.truthDelta || 0) : 0);
      if (curTruth - acc <= 5) return seq;
    }
    return null;
  }

  return null;
}

// === Action Bias helpers (Truth/Government aware) ===
function resolvePlayerId(p: PlayerId | number): PlayerId {
  return (typeof p === "number" ? (p === 0 ? "P1" : "P2") : p) as PlayerId;
}

function isTruthFaction(s: GameState, p: PlayerId | number) {
  const pid = resolvePlayerId(p);
  return (s.players?.[pid]?.faction ?? "truth") === "truth";
}
function isGovFaction(s: GameState, p: PlayerId | number) {
  const pid = resolvePlayerId(p);
  return (s.players?.[pid]?.faction ?? "truth") === "government";
}

function truthDistanceToGoal(s: GameState, p: PlayerId | number) {
  const t = s.truth ?? 50;
  return isTruthFaction(s, p) ? Math.max(0, 95 - t) : Math.max(0, t - 5);
}

function nearCaptureScore(s: GameState, p: PlayerId | number): number {
  const pid = resolvePlayerId(p);
  // Teller antall stater der vi er nær capture (mangler ≤2 pressure)
  const pb = s.pressureByState ?? {};
  const def = s.stateDefense ?? {};
  let near = 0;
  for (const sid in pb) {
    const mine = pb[sid]?.[pid] ?? 0;
    const need = Math.max(0, (def[sid] ?? 0) - mine);
    if (need > 0 && need <= 2) near++;
  }
  // Skaler svakt (ingen “hard commit”; bare bias)
  return Math.min(5, near); // 0..5
}

function opponentIpHigh(s: GameState, p: PlayerId | number): boolean {
  const pid = resolvePlayerId(p);
  const opp = pid === "P1" ? "P2" : "P1";
  const ip = s.players?.[opp]?.ip ?? 0;
  return ip >= 20; // terskel; justér om ønskelig
}

function actionBias(a: Action, s: GameState): number {
  // Positivt tall = mer attraktivt
  const me = s.currentPlayer;
  const t = s.truth ?? 50;
  const dist = truthDistanceToGoal(s, me); // hvor langt fra målet
  const nearCap = nearCaptureScore(s, me);
  const oppHighIP = opponentIpHigh(s, me);

  const type = a.type === 'play-card' ? a.card?.type : a.kind;
  const tDelta = a.type === 'play-card' ? ((a.card?.effects?.truthDelta as number) ?? 0) : 0;
  const cost = a.type === 'play-card' ? (a.card?.cost ?? 0) : 0;

  let bias = 0;

  // 1) MEDIA (Truth/ Gov forskjellig retning)
  if (type === "MEDIA") {
    if (isTruthFaction(s, me)) {
      // Langt unna 95 → preferér +truth (smått); nær 95 → hard push
      if (tDelta > 0) {
        bias += dist >= 20 ? 0.6 : 1.2; // nærmere mål => større bias
        if (t + tDelta >= 95) bias += 0.8; // direkte måltreff
      } else {
        bias -= 0.2; // Truth-AI liker ikke −truth
      }
    } else if (isGovFaction(s, me)) {
      // Høy Truth → preferér −truth; nær ≤5 → hard push
      if (tDelta < 0) {
        bias += t >= 50 ? 0.8 : 0.4;
        if (t + tDelta <= 5) bias += 0.8;
      } else {
        bias -= 0.2; // Gov-AI liker ikke +truth
      }
    }
  }

  // 2) ZONE (nær capture = mer attraktivt)
  if (type === "ZONE") {
    // Når flere stater er nær capture, lønner det seg å følge opp
    if (nearCap > 0) bias += 0.3 + 0.1 * nearCap; // +0.3..+0.8
    // Hvis vi er svært langt fra sannhetsmålet, la ZONE få litt lavere prioritet enn MEDIA
    if (dist >= 25) bias -= 0.1;
  }

  // 3) ATTACK (whittle IP når målet er relativt trygt)
  if (type === "ATTACK") {
    // Truth-AI: hvis t >= 75 (relativt trygt) og motstander har mye IP → litt bias
    if (isTruthFaction(s, me) && t >= 75 && oppHighIP) bias += 0.35;
    // Gov-AI: hvis t <= 25 (relativt trygt) og motstander har mye IP → litt bias
    if (isGovFaction(s, me) && t <= 25 && oppHighIP) bias += 0.35;
  }

  // 4) Kost: svakt preferér lavere kost for bedre kjedebygging (flere kort innen 3-grensen)
  bias += Math.max(0, 10 - Math.min(10, cost)) * 0.02; // +0..+0.2

  return bias;
}

function biasedSort(s: GameState, cfg: AiConfig) {
  return (a: Action, b: Action) => {
    // scoreAction + actionBias
    const sab = scoreAction(s, b, cfg) + actionBias(b, s);
    const saa = scoreAction(s, a, cfg) + actionBias(a, s);
    if (sab !== saa) return sab - saa;
    // tie-breaker: billigere kort først for lettere sekvenser
    const cb = b.type === 'play-card' ? (b.card?.cost ?? 0) : 0;
    const ca = a.type === 'play-card' ? (a.card?.cost ?? 0) : 0;
    return ca - cb;
  };
}

/**
 * @deprecated Use chooseTurnActions from enhancedController instead.
 */
export function legacyChooseTurnActions(state: GameState, level: Difficulty): Action[] {
  const cfg = AI_PRESETS[level];
  // Try a direct goal burst first (Truth ≥95 for truth / ≤5 for government)
  const legalNow = legalActionsFor(state);
  const burst = planMediaBurstToGoal({ state, legal: legalNow });
  if (burst && burst.length > 0) {
    if (AI_DEBUG) console.info("[AI] Goal-burst chosen:", burst.map(x => x.type === 'play-card' ? (x.card?.name ?? x.type) : x.kind));
    return burst;
  }
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
  // Small faction-goal bias
  const faction = s.players?.[s.currentPlayer as PlayerId]?.faction;
  if (faction === "truth") {
    // push upwards a bit more if below 95
    const gapUp = Math.max(0, 95 - (s.truth ?? 50));
    score += 0.05 * gapUp * cfg.valueTruthSwing;
  } else if (faction === "government") {
    // push downwards a bit more if above 5
    const gapDown = Math.max(0, (s.truth ?? 50) - 5);
    score += 0.05 * gapDown * cfg.valueTruthSwing; // positive term, but since lower truth also boosts (myTruth - opTruth) component in your eval, this acts as bias toward reducing Truth
  }
  return score;
}

function generateActionSequences(s: GameState, cfg: AiConfig, rootPlayer: PlayerId): Action[][] {
  const singles = legalActionsFor(s, rootPlayer)
    .sort(biasedSort(s, cfg))
    .slice(0, 6);
  const chains: Action[][] = [];

  for (const a of singles) {
    const s1 = applyAction(cloneState(s), a);
    chains.push([a]);

    if (s1.currentPlayer !== rootPlayer) continue;

    const seconds = legalActionsFor(s1, rootPlayer)
      .sort(biasedSort(s1, cfg))
      .slice(0, 4);

    for (const b of seconds) {
      const s2 = applyAction(cloneState(s1), b);
      chains.push([a, b]);

      if (s2.currentPlayer !== rootPlayer) continue;

      const thirds = legalActionsFor(s2, rootPlayer)
        .sort(biasedSort(s2, cfg))
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
    return endTurn(state, action.discards ?? []).state;
  }
  return state;
}

function legalActionsFor(state: GameState, rootPlayer: PlayerId = state.currentPlayer as PlayerId): Action[] {
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
          actions.push({
            type: "play-card",
            kind: "PLAY",
            cardId: card.id,
            targetStateId: target,
            cardType: card.type,
            card,
          });
          seen.add(key);
        }
      }
    } else {
      const key = card.id;
      if (seen.has(key)) continue;
      const eligibility = canPlay(state, card);
      if (eligibility.ok) {
        actions.push({ type: "play-card", kind: "PLAY", cardId: card.id, cardType: card.type, card });
        seen.add(key);
      }
    }
  }

  if (!actions.length) {
    actions.push({ type: "end-turn", kind: "END", discards: [] });
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
