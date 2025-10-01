import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import type { GameCard } from '@/rules/mvp';
import { CARD_DATABASE } from '@/data/cardDatabase';
import { USA_STATES } from '@/data/usaStates';
import {
  resolveCardMVP,
  type CardPlayResolution,
  type GameSnapshot,
  type StateForResolution,
} from '@/systems/cardResolution';
import {
  createAiStrategist,
  type AIStrategist,
  type AIDifficulty,
  type CardPlay,
  type GameStateEvaluation,
} from '@/data/aiStrategy';
import { EnhancedAIStrategist } from '@/data/enhancedAIStrategy';
import {
  DEFAULT_AI_TUNING,
  normalizeAiTuningConfig,
  type AiTuningConfig,
} from '@/data/aiTuning';

const SIDE_TO_NAME = {
  A: 'candidate',
  B: 'baseline',
} as const satisfies Record<'A' | 'B', 'candidate' | 'baseline'>;

type Side = keyof typeof SIDE_TO_NAME;
type SideName = typeof SIDE_TO_NAME[Side];

type SideRecord<T> = Record<Side, T>;

type Mutable<T> = {
  -readonly [K in keyof T]: T[K];
};

interface SimulationOptions {
  handSize: number;
  maxTurns: number;
  stateCount: number;
  initialControl: number;
  startingIp: number;
  startingTruth: number;
  territoryGoal: number;
  economicGoal: number;
  truthHighThreshold: number;
  truthLowThreshold: number;
  difficulty: AIDifficulty;
  useEnhanced: boolean;
  swapFactions: boolean;
}

interface SimulationPlayRecord {
  actor: Side;
  card: GameCard;
  play: CardPlay | null;
  targetState?: string | null;
  evaluation: GameStateEvaluation;
}

type SimulatedState = Omit<StateForResolution, 'owner'> & { owner: Side | 'neutral' };

interface SimulationState {
  truth: number;
  ip: SideRecord<number>;
  hands: SideRecord<GameCard[]>;
  states: SimulatedState[];
  round: number;
  turn: number;
  factions: SideRecord<'truth' | 'government'>;
  cardsPlayedThisRound: SimulationPlayRecord[];
  lastPlays: SimulationPlayRecord[];
}

interface EvaluationLogEntry {
  turn: number;
  actor: SideName;
  evaluation: GameStateEvaluation;
}

interface PlayLogEntry {
  turn: number;
  actor: SideName;
  cardId: string;
  cardName?: string;
  priority?: number;
  targetState?: string | null;
  reasoning?: string;
}

interface GameLog {
  id: number;
  startSide: SideName;
  winner: SideName | 'draw';
  reason: string;
  turns: number;
  factions: Record<SideName, 'truth' | 'government'>;
  truthHistory: number[];
  ipHistory: Array<{ turn: number; candidate: number; baseline: number }>;
  controlHistory: Array<{ turn: number; candidate: number; baseline: number }>;
  evaluations: EvaluationLogEntry[];
  plays: PlayLogEntry[];
  finalTruth: number;
  finalIp: { candidate: number; baseline: number };
  finalControl: { candidate: number; baseline: number };
}

interface BatchSummary {
  candidateWins: number;
  baselineWins: number;
  draws: number;
  games: number;
  averageTurns: number;
  averageTruthSwing: number;
  averageFinalIpDelta: number;
  averageFinalStateDelta: number;
  score: number;
}

interface BatchResult {
  summary: BatchSummary;
  games: GameLog[];
}

interface IterationSummary extends BatchSummary {
  iteration: number;
  intensity: number;
}

interface OptimizerReport {
  timestamp: string;
  options: CliOptions;
  baselineSummary: BatchSummary;
  bestSummary: BatchSummary | null;
  bestIteration: IterationSummary | null;
  baselineConfig: AiTuningConfig;
  bestConfig: AiTuningConfig;
  iterations: IterationSummary[];
  bestGames: GameLog[];
}

interface CliOptions {
  iterations: number;
  games: number;
  handSize: number;
  stateCount: number;
  initialControl: number;
  startingIp: number;
  startingTruth: number;
  maxTurns: number;
  difficulty: AIDifficulty;
  useEnhanced: boolean;
  swapFactions: boolean;
  intensity: number;
  seed: number;
  output: string;
  territoryGoal?: number;
  economicGoal: number;
  truthHighThreshold: number;
  truthLowThreshold: number;
  optimize: boolean;
}

const DEFAULT_OPTIONS: CliOptions = {
  iterations: 12,
  games: 12,
  handSize: 5,
  stateCount: 12,
  initialControl: 3,
  startingIp: 110,
  startingTruth: 50,
  maxTurns: 40,
  difficulty: 'hard',
  useEnhanced: true,
  swapFactions: true,
  intensity: 0.25,
  seed: Date.now(),
  output: path.join('tools', 'simulations', 'latest-results.json'),
  territoryGoal: undefined,
  economicGoal: 200,
  truthHighThreshold: 90,
  truthLowThreshold: 10,
  optimize: true,
};

function createRng(seed: number): () => number {
  let state = seed >>> 0;
  return () => {
    state = Math.imul(state + 0x6d2b79f5, 1);
    let t = state;
    t ^= t >>> 15;
    t = Math.imul(t | 1, t);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function cloneCard(card: GameCard): GameCard {
  return JSON.parse(JSON.stringify(card));
}

function drawRandomCard(rng: () => number): GameCard {
  const index = Math.floor(rng() * CARD_DATABASE.length) % CARD_DATABASE.length;
  return cloneCard(CARD_DATABASE[index]!);
}

function refillHand(hand: GameCard[], targetSize: number, rng: () => number): void {
  while (hand.length < targetSize) {
    hand.push(drawRandomCard(rng));
  }
}

function otherSide(side: Side): Side {
  return side === 'A' ? 'B' : 'A';
}

function selectStates(count: number, rng: () => number): SimulatedState[] {
  const shuffled = [...USA_STATES];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j]!, shuffled[i]!];
  }

  return shuffled.slice(0, count).map(state => ({
    id: state.id,
    name: state.name,
    abbreviation: state.abbreviation,
    baseIP: state.baseIP,
    defense: state.defense,
    pressure: 0,
    contested: false,
    owner: 'neutral',
    occupierCardId: null,
    occupierCardName: null,
    occupierIcon: null,
    occupierLabel: null,
    occupierUpdatedAt: undefined,
  }));
}

function initializeSimulationState(
  options: SimulationOptions,
  rng: () => number,
  factions: SideRecord<'truth' | 'government'>,
): SimulationState {
  const states = selectStates(options.stateCount, rng);
  const distribution = Math.min(options.initialControl, Math.floor(states.length / 3));

  for (let i = 0; i < distribution; i++) {
    states[i]!.owner = 'A';
  }
  for (let i = distribution; i < distribution * 2; i++) {
    states[i]!.owner = 'B';
  }

  const hands: SideRecord<GameCard[]> = {
    A: [],
    B: [],
  };

  refillHand(hands.A, options.handSize, rng);
  refillHand(hands.B, options.handSize, rng);

  return {
    truth: options.startingTruth,
    ip: { A: options.startingIp, B: options.startingIp },
    hands,
    states,
    round: 1,
    turn: 1,
    factions,
    cardsPlayedThisRound: [],
    lastPlays: [],
  };
}

function mapStatesForSnapshot(states: SimulatedState[], perspective: Side): StateForResolution[] {
  const opponent = otherSide(perspective);
  return states.map(state => ({
    ...state,
    owner: state.owner === perspective ? 'ai' : state.owner === opponent ? 'player' : 'neutral',
  }));
}

function buildSnapshot(state: SimulationState, perspective: Side): GameSnapshot {
  const opponent = otherSide(perspective);
  const resolutionStates = mapStatesForSnapshot(state.states, perspective);

  const controlledByOpponent = resolutionStates
    .filter(entry => entry.owner === 'player')
    .map(entry => entry.abbreviation);
  const controlledByPerspective = resolutionStates
    .filter(entry => entry.owner === 'ai')
    .map(entry => entry.abbreviation);

  return {
    truth: state.truth,
    ip: state.ip[opponent],
    aiIP: state.ip[perspective],
    hand: state.hands[opponent].map(cloneCard),
    aiHand: state.hands[perspective].map(cloneCard),
    controlledStates: controlledByOpponent,
    aiControlledStates: controlledByPerspective,
    round: state.round,
    turn: state.turn,
    faction: state.factions[perspective],
    states: resolutionStates,
  };
}

function toStrategistState(simulation: SimulationState, perspective: Side): Record<string, unknown> {
  const opponent = otherSide(perspective);
  const resolutionStates = mapStatesForSnapshot(simulation.states, perspective);

  const cardsPlayed = simulation.cardsPlayedThisRound.map(play => ({
    player: play.actor === perspective ? 'ai' : 'human',
    card: cloneCard(play.card),
    targetState: play.targetState ?? null,
  }));

  const lastCards = simulation.lastPlays.slice(-6).map(play => ({
    player: play.actor === perspective ? 'ai' : 'human',
    ...cloneCard(play.card),
  }));

  return {
    truth: simulation.truth,
    aiIP: simulation.ip[perspective],
    playerIp: simulation.ip[opponent],
    hand: simulation.hands[perspective].map(cloneCard),
    aiHand: simulation.hands[perspective].map(cloneCard),
    playerHand: simulation.hands[opponent].map(cloneCard),
    states: resolutionStates,
    round: simulation.round,
    turn: simulation.turn,
    faction: simulation.factions[perspective],
    cardsPlayedThisRound: cardsPlayed,
    lastPlayedCards: lastCards,
    ip: simulation.ip[perspective] - simulation.ip[opponent],
    aiControlledStates: resolutionStates
      .filter(state => state.owner === 'ai')
      .map(state => state.abbreviation),
    playerControlledStates: resolutionStates
      .filter(state => state.owner === 'player')
      .map(state => state.abbreviation),
  };
}

function countControlled(states: SimulatedState[], side: Side): number {
  return states.filter(state => state.owner === side).length;
}

function applyResolution(
  state: SimulationState,
  actor: Side,
  resolution: CardPlayResolution,
): void {
  const opponent = otherSide(actor);
  state.truth = resolution.truth;
  state.ip[actor] = resolution.aiIP;
  state.ip[opponent] = resolution.ip;
  state.states = resolution.states.map(resolved => ({
    ...resolved,
    owner: resolved.owner === 'ai' ? actor : resolved.owner === 'player' ? opponent : 'neutral',
  }));
}
function evaluateWinner(
  state: SimulationState,
  options: SimulationOptions,
): { winner: Side | null; reason: string } {
  const counts: SideRecord<number> = {
    A: countControlled(state.states, 'A'),
    B: countControlled(state.states, 'B'),
  };

  const territoryGoal = options.territoryGoal;
  const economicGoal = options.economicGoal;
  const highTruth = options.truthHighThreshold;
  const lowTruth = options.truthLowThreshold;

  const truth = state.truth;

  const territoryWin: SideRecord<boolean> = {
    A: counts.A >= territoryGoal,
    B: counts.B >= territoryGoal,
  };

  const economicWin: SideRecord<boolean> = {
    A: state.ip.A >= economicGoal,
    B: state.ip.B >= economicGoal,
  };

  const truthWin: SideRecord<boolean> = { A: false, B: false };

  (['A', 'B'] as Side[]).forEach(side => {
    if (state.factions[side] === 'truth') {
      truthWin[side] = truth >= highTruth || truth >= 100;
      if (truth <= 0) {
        truthWin[side] = false;
      }
    } else {
      truthWin[side] = truth <= lowTruth || truth <= 0;
      if (truth >= 100) {
        truthWin[side] = false;
      }
    }
  });

  const wins: SideRecord<boolean> = {
    A: territoryWin.A || economicWin.A || truthWin.A,
    B: territoryWin.B || economicWin.B || truthWin.B,
  };

  if (wins.A && !wins.B) {
    return { winner: 'A', reason: territoryWin.A ? 'territory' : economicWin.A ? 'economy' : 'truth' };
  }

  if (wins.B && !wins.A) {
    return { winner: 'B', reason: territoryWin.B ? 'territory' : economicWin.B ? 'economy' : 'truth' };
  }

  return { winner: null, reason: '' };
}

function finalTiebreaker(state: SimulationState, options: SimulationOptions): Side | null {
  const counts: SideRecord<number> = {
    A: countControlled(state.states, 'A'),
    B: countControlled(state.states, 'B'),
  };

  if (counts.A !== counts.B) {
    return counts.A > counts.B ? 'A' : 'B';
  }

  if (state.ip.A !== state.ip.B) {
    return state.ip.A > state.ip.B ? 'A' : 'B';
  }

  const truthScore: SideRecord<number> = {
    A: state.factions.A === 'truth' ? state.truth : 100 - state.truth,
    B: state.factions.B === 'truth' ? state.truth : 100 - state.truth,
  };

  if (truthScore.A !== truthScore.B) {
    return truthScore.A > truthScore.B ? 'A' : 'B';
  }

  return null;
}

function choosePlay(
  strategist: AIStrategist,
  gameState: Record<string, unknown>,
): CardPlay | null {
  if ('selectOptimalPlay' in strategist && typeof (strategist as EnhancedAIStrategist).selectOptimalPlay === 'function') {
    return (strategist as EnhancedAIStrategist).selectOptimalPlay(gameState);
  }
  return strategist.selectBestPlay(gameState);
}

function perturbConfig(
  base: AiTuningConfig,
  intensity: number,
  rng: () => number,
): AiTuningConfig {
  const mutate = (value: number): number => {
    const delta = (rng() * 2 - 1) * intensity;
    const candidate = value * (1 + delta);
    if (!Number.isFinite(candidate) || candidate <= 0) {
      return Math.max(0.001, Math.abs(value));
    }
    return candidate;
  };

  const walker = (record: Record<string, unknown>): Record<string, unknown> => {
    const entries = Object.entries(record).map(([key, value]) => {
      if (typeof value === 'number') {
        return [key, mutate(value)];
      }
      if (value && typeof value === 'object') {
        return [key, walker(value as Record<string, unknown>)];
      }
      return [key, value];
    });

    return Object.fromEntries(entries);
  };

  return normalizeAiTuningConfig(walker(base as any) as any);
}

function summarizeBatch(
  games: GameLog[],
  candidateWins: number,
  baselineWins: number,
  draws: number,
): BatchSummary {
  const totalTurns = games.reduce((sum, game) => sum + game.turns, 0);
  const truthSwing = games.reduce((sum, game) => {
    if (game.truthHistory.length === 0) return sum;
    const min = Math.min(...game.truthHistory);
    const max = Math.max(...game.truthHistory);
    return sum + (max - min);
  }, 0);
  const ipDelta = games.reduce((sum, game) => sum + (game.finalIp.candidate - game.finalIp.baseline), 0);
  const stateDelta = games.reduce((sum, game) => sum + (game.finalControl.candidate - game.finalControl.baseline), 0);
  const totalGames = games.length || 1;
  const score = (candidateWins - baselineWins) / (games.length || 1);

  return {
    candidateWins,
    baselineWins,
    draws,
    games: games.length,
    averageTurns: totalTurns / totalGames,
    averageTruthSwing: truthSwing / totalGames,
    averageFinalIpDelta: ipDelta / totalGames,
    averageFinalStateDelta: stateDelta / totalGames,
    score,
  };
}

function createStrategist(
  useEnhanced: boolean,
  difficulty: AIDifficulty,
  tuning: AiTuningConfig,
): AIStrategist {
  if (useEnhanced) {
    return new EnhancedAIStrategist(difficulty, tuning);
  }
  return createAiStrategist(difficulty, tuning);
}

function simulateMatch(
  matchId: number,
  candidateConfig: AiTuningConfig,
  baselineConfig: AiTuningConfig,
  options: SimulationOptions,
  rng: () => number,
  startSide: Side,
  factions: SideRecord<'truth' | 'government'>,
): { log: GameLog; winner: Side | 'draw'; reason: string } {
  const state = initializeSimulationState(options, rng, factions);
  const strategists: SideRecord<AIStrategist> = {
    A: createStrategist(options.useEnhanced, options.difficulty, candidateConfig),
    B: createStrategist(options.useEnhanced, options.difficulty, baselineConfig),
  };

  let active: Side = startSide;
  let turns = 0;
  let winner: Side | null = null;
  let reason = '';

  const truthHistory: number[] = [state.truth];
  const ipHistory: Array<{ turn: number; candidate: number; baseline: number }> = [
    { turn: 0, candidate: state.ip.A, baseline: state.ip.B },
  ];
  const controlHistory: Array<{ turn: number; candidate: number; baseline: number }> = [
    {
      turn: 0,
      candidate: countControlled(state.states, 'A'),
      baseline: countControlled(state.states, 'B'),
    },
  ];
  const evaluations: EvaluationLogEntry[] = [];
  const plays: PlayLogEntry[] = [];

  while (turns < options.maxTurns) {
    const strategist = strategists[active];
    const perspectiveState = toStrategistState(state, active);
    const evaluation = strategist.evaluateGameState(perspectiveState);
    evaluations.push({
      turn: state.turn,
      actor: SIDE_TO_NAME[active],
      evaluation,
    });

    const play = choosePlay(strategist, perspectiveState);

    if (play && play.cardId) {
      const cardIndex = state.hands[active].findIndex(handCard => handCard.id === play.cardId);
      const card = cardIndex >= 0
        ? state.hands[active][cardIndex]!
        : cloneCard(CARD_DATABASE.find(entry => entry.id === play.cardId) ?? drawRandomCard(rng));
      const snapshot = buildSnapshot(state, active);
      const resolution = resolveCardMVP(snapshot, card, play.targetState ?? null, 'ai');

      if (cardIndex >= 0) {
        state.hands[active].splice(cardIndex, 1);
      }

      applyResolution(state, active, resolution);

      const record: SimulationPlayRecord = {
        actor: active,
        card: cloneCard(card),
        play,
        targetState: play.targetState ?? null,
        evaluation,
      };
      state.cardsPlayedThisRound.push(record);
      state.lastPlays.push(record);
      if (state.lastPlays.length > 12) {
        state.lastPlays.splice(0, state.lastPlays.length - 12);
      }

      plays.push({
        turn: state.turn,
        actor: SIDE_TO_NAME[active],
        cardId: card.id,
        cardName: card.name,
        priority: play.priority,
        targetState: play.targetState ?? null,
        reasoning: play.reasoning,
      });
    } else {
      plays.push({
        turn: state.turn,
        actor: SIDE_TO_NAME[active],
        cardId: 'PASS',
        reasoning: 'No valid play',
      });
    }

    refillHand(state.hands[active], options.handSize, rng);

    const outcome = evaluateWinner(state, options);
    if (outcome.winner) {
      winner = outcome.winner;
      reason = outcome.reason;
      turns++;
      break;
    }

    const opponent = otherSide(active);
    active = opponent;
    turns++;
    state.turn++;
    if (active === 'A') {
      state.round++;
      state.cardsPlayedThisRound = [];
    }

    truthHistory.push(state.truth);
    ipHistory.push({ turn: turns, candidate: state.ip.A, baseline: state.ip.B });
    controlHistory.push({
      turn: turns,
      candidate: countControlled(state.states, 'A'),
      baseline: countControlled(state.states, 'B'),
    });
  }

  if (!winner) {
    const tiebreakWinner = finalTiebreaker(state, options);
    if (tiebreakWinner) {
      winner = tiebreakWinner;
      reason = 'tiebreaker';
    }
  }

  const winnerName = winner ? SIDE_TO_NAME[winner] : 'draw';

  const log: GameLog = {
    id: matchId,
    startSide: SIDE_TO_NAME[startSide],
    winner: winnerName,
    reason: reason || 'max_turns',
    turns,
    factions: {
      candidate: state.factions.A,
      baseline: state.factions.B,
    },
    truthHistory,
    ipHistory,
    controlHistory,
    evaluations,
    plays,
    finalTruth: state.truth,
    finalIp: { candidate: state.ip.A, baseline: state.ip.B },
    finalControl: {
      candidate: countControlled(state.states, 'A'),
      baseline: countControlled(state.states, 'B'),
    },
  };

  state.cardsPlayedThisRound = [];
  state.lastPlays = [];

  return { log, winner: winner ?? 'draw', reason: reason || 'max_turns' };
}
function runBatch(
  candidateConfig: AiTuningConfig,
  baselineConfig: AiTuningConfig,
  options: SimulationOptions,
  games: number,
  rng: () => number,
  factions: SideRecord<'truth' | 'government'>,
): BatchResult {
  const logs: GameLog[] = [];
  let candidateWins = 0;
  let baselineWins = 0;
  let draws = 0;

  for (let i = 0; i < games; i++) {
    const startSide: Side = i % 2 === 0 ? 'A' : 'B';
    const iterationFactions = options.swapFactions && i % 2 === 1
      ? { A: factions.B, B: factions.A }
      : factions;
    const { log, winner } = simulateMatch(
      i + 1,
      candidateConfig,
      baselineConfig,
      options,
      rng,
      startSide,
      iterationFactions,
    );

    logs.push(log);
    if (winner === 'A') {
      candidateWins++;
    } else if (winner === 'B') {
      baselineWins++;
    } else {
      draws++;
    }
  }

  return {
    summary: summarizeBatch(logs, candidateWins, baselineWins, draws),
    games: logs,
  };
}

function parseBoolean(value: string | undefined, defaultValue: boolean): boolean {
  if (value === undefined) return defaultValue;
  const normalized = value.toLowerCase();
  if (['true', '1', 'yes', 'on'].includes(normalized)) return true;
  if (['false', '0', 'no', 'off'].includes(normalized)) return false;
  return defaultValue;
}

function parseArgs(argv: string[]): CliOptions {
  const args = { ...DEFAULT_OPTIONS } satisfies Mutable<CliOptions>;

  for (let i = 0; i < argv.length; i++) {
    const arg = argv[i];
    if (!arg.startsWith('--')) continue;

    const [flag, rawValue] = arg.split('=');
    const key = flag.slice(2);
    const value = rawValue ?? argv[i + 1];

    switch (key) {
      case 'iterations':
        args.iterations = value ? Number.parseInt(value, 10) : args.iterations;
        if (rawValue === undefined) i++;
        break;
      case 'games':
        args.games = value ? Number.parseInt(value, 10) : args.games;
        if (rawValue === undefined) i++;
        break;
      case 'handSize':
        args.handSize = value ? Number.parseInt(value, 10) : args.handSize;
        if (rawValue === undefined) i++;
        break;
      case 'stateCount':
        args.stateCount = value ? Number.parseInt(value, 10) : args.stateCount;
        if (rawValue === undefined) i++;
        break;
      case 'initialControl':
        args.initialControl = value ? Number.parseInt(value, 10) : args.initialControl;
        if (rawValue === undefined) i++;
        break;
      case 'startingIp':
        args.startingIp = value ? Number.parseInt(value, 10) : args.startingIp;
        if (rawValue === undefined) i++;
        break;
      case 'startingTruth':
        args.startingTruth = value ? Number.parseInt(value, 10) : args.startingTruth;
        if (rawValue === undefined) i++;
        break;
      case 'maxTurns':
        args.maxTurns = value ? Number.parseInt(value, 10) : args.maxTurns;
        if (rawValue === undefined) i++;
        break;
      case 'difficulty':
        args.difficulty = (value ?? args.difficulty) as AIDifficulty;
        if (rawValue === undefined) i++;
        break;
      case 'useEnhanced':
        args.useEnhanced = parseBoolean(value, args.useEnhanced);
        if (rawValue === undefined) i++;
        break;
      case 'swapFactions':
        args.swapFactions = parseBoolean(value, args.swapFactions);
        if (rawValue === undefined) i++;
        break;
      case 'intensity':
        args.intensity = value ? Number.parseFloat(value) : args.intensity;
        if (rawValue === undefined) i++;
        break;
      case 'seed':
        args.seed = value ? Number.parseInt(value, 10) : args.seed;
        if (rawValue === undefined) i++;
        break;
      case 'output':
        args.output = value ?? args.output;
        if (rawValue === undefined) i++;
        break;
      case 'territoryGoal':
        args.territoryGoal = value ? Number.parseInt(value, 10) : args.territoryGoal;
        if (rawValue === undefined) i++;
        break;
      case 'economicGoal':
        args.economicGoal = value ? Number.parseInt(value, 10) : args.economicGoal;
        if (rawValue === undefined) i++;
        break;
      case 'truthHigh':
        args.truthHighThreshold = value ? Number.parseInt(value, 10) : args.truthHighThreshold;
        if (rawValue === undefined) i++;
        break;
      case 'truthLow':
        args.truthLowThreshold = value ? Number.parseInt(value, 10) : args.truthLowThreshold;
        if (rawValue === undefined) i++;
        break;
      case 'optimize':
        args.optimize = parseBoolean(value, args.optimize);
        if (rawValue === undefined) i++;
        break;
      default:
        break;
    }
  }

  return args;
}

async function readAiConfig(weightsPath: string): Promise<AiTuningConfig> {
  try {
    const raw = await fs.readFile(weightsPath, 'utf-8');
    const parsed = JSON.parse(raw) as AiTuningConfig;
    return normalizeAiTuningConfig(parsed);
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code === 'ENOENT') {
      return normalizeAiTuningConfig(DEFAULT_AI_TUNING);
    }
    throw error;
  }
}

async function ensureDirectory(filePath: string): Promise<void> {
  const dir = path.dirname(filePath);
  await fs.mkdir(dir, { recursive: true });
}

function buildSimulationOptions(cli: CliOptions): SimulationOptions {
  const territoryGoal = cli.territoryGoal ?? Math.max(5, Math.floor(cli.stateCount * 0.6));
  return {
    handSize: cli.handSize,
    maxTurns: cli.maxTurns,
    stateCount: cli.stateCount,
    initialControl: cli.initialControl,
    startingIp: cli.startingIp,
    startingTruth: cli.startingTruth,
    territoryGoal,
    economicGoal: cli.economicGoal,
    truthHighThreshold: cli.truthHighThreshold,
    truthLowThreshold: cli.truthLowThreshold,
    difficulty: cli.difficulty,
    useEnhanced: cli.useEnhanced,
    swapFactions: cli.swapFactions,
  };
}

async function main(): Promise<void> {
  const cli = parseArgs(process.argv.slice(2));
  const scriptDir = fileURLToPath(new URL('.', import.meta.url));
  const rootDir = path.resolve(scriptDir, '..');
  const weightsPath = path.resolve(rootDir, 'src/data/aiWeights.json');

  const baselineConfig = await readAiConfig(weightsPath);
  const simulationOptions = buildSimulationOptions(cli);
  const baseFactions: SideRecord<'truth' | 'government'> = { A: 'truth', B: 'government' };

  const baselineBatch = runBatch(
    baselineConfig,
    baselineConfig,
    simulationOptions,
    cli.games,
    createRng(cli.seed),
    baseFactions,
  );

  const iterations: IterationSummary[] = [];
  let bestConfig = baselineConfig;
  let bestSummary: BatchSummary | null = null;
  let bestGames = baselineBatch.games;
  let bestIteration: IterationSummary | null = null;

  if (cli.optimize && cli.iterations > 0) {
    for (let iteration = 0; iteration < cli.iterations; iteration++) {
      const sourceConfig = bestSummary ? bestConfig : baselineConfig;
      const candidate = perturbConfig(sourceConfig, cli.intensity, createRng(cli.seed + 97 + iteration));
      const batch = runBatch(
        candidate,
        baselineConfig,
        simulationOptions,
        cli.games,
        createRng(cli.seed + 997 + iteration),
        baseFactions,
      );

      const iterationSummary: IterationSummary = {
        iteration: iteration + 1,
        intensity: cli.intensity,
        ...batch.summary,
      };

      iterations.push(iterationSummary);

      if (!bestSummary || iterationSummary.score > bestSummary.score) {
        bestSummary = batch.summary;
        bestConfig = candidate;
        bestGames = batch.games;
        bestIteration = iterationSummary;
      }
    }
  }

  const improved = Boolean(bestIteration && bestSummary && bestSummary.score > baselineBatch.summary.score);

  if (!improved) {
    bestConfig = baselineConfig;
    bestSummary = baselineBatch.summary;
    bestGames = baselineBatch.games;
    bestIteration = null;
  } else {
    await fs.writeFile(weightsPath, JSON.stringify(bestConfig, null, 2), 'utf-8');
  }

  const report: OptimizerReport = {
    timestamp: new Date().toISOString(),
    options: cli,
    baselineSummary: baselineBatch.summary,
    bestSummary,
    bestIteration,
    baselineConfig,
    bestConfig,
    iterations,
    bestGames,
  };

  const outputPath = path.resolve(rootDir, cli.output);
  await ensureDirectory(outputPath);
  await fs.writeFile(outputPath, JSON.stringify(report, null, 2), 'utf-8');

  console.log(`Baseline score: ${baselineBatch.summary.score.toFixed(3)}`);
  if (improved && bestIteration) {
    console.log(
      `Best iteration ${bestIteration.iteration}: score=${bestIteration.score.toFixed(3)} wins=${bestIteration.candidateWins}/${cli.games}`,
    );
    console.log(`Weights file updated at ${weightsPath}`);
  } else {
    console.log('No improvement over baseline configuration.');
  }
  console.log(`Report written to ${outputPath}`);
}

await main().catch(error => {
  console.error('AI simulation failed:', error);
  process.exitCode = 1;
});
