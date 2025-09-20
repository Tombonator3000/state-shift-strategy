import type { GameCard } from '@/rules/mvp';
import { resolveCardMVP, type CardPlayResolution, type GameSnapshot } from '@/systems/cardResolution';
import { CARD_DATABASE } from './cardDatabase';
import { getAiTuningConfig, type AiTuningConfig } from './aiTuning';
import {
  createAiStrategist,
  type AIStrategist,
  type AIDifficulty,
  type AIPersonality,
  type CardPlay,
  type GameStateEvaluation,
} from './aiStrategy';

export interface EnhancedAiDifficultyProfile {
  planningDepth: number;
  randomness: number;
  aggression: number;
  riskTolerance: number;
  rollouts?: number;
}

const clamp = (value: number, min: number, max: number): number => {
  if (Number.isNaN(value)) {
    return min;
  }
  return Math.min(max, Math.max(min, value));
};

const CAPTURE_REGEX = /(captured|seized)\s+([^!]+)!/i;

type BluffOutcome = 'capture' | 'truth_gain' | 'resource_gain' | 'pressure' | 'setback' | 'neutral';

interface TargetRecord {
  turn: number;
  state: string;
}

interface BluffRecord {
  turn: number;
  cardType: string;
  outcome: BluffOutcome;
  target?: string;
}

interface BehaviorRecord {
  turn: number;
  outcome: BluffOutcome;
}

interface AdaptiveSnapshot {
  averageThreat: number;
  aggressionTrend: number;
  bluffSuccessRate: number;
}

// Monte Carlo Tree Search Node
interface MCTSNode {
  gameState: any;
  move: CardPlay | null;
  parent: MCTSNode | null;
  children: MCTSNode[];
  visits: number;
  wins: number;
  unexploredMoves: CardPlay[];
}

// Card Synergy System
interface CardSynergy {
  cardIds: string[];
  synergyType: 'combo' | 'sequence' | 'counter';
  bonusValue: number;
  description: string;
}

// Deception State
interface DeceptionState {
  fakeTargets: string[];
  misdirectionLevel: number;
  bluffHistory: string[];
  playerPattern: string[];
}

// Enhanced Card Play with synergy info
export type EnhancedCardPlay = CardPlay & {
  synergies: CardSynergy[];
  deceptionValue: number;
  threatResponse: boolean;
};

export class EnhancedAIStrategist implements AIStrategist {
  private readonly base: AIStrategist;
  public readonly difficulty: AIDifficulty;
  private _personality: AIPersonality;
  private _tuning: AiTuningConfig;
  private cardSynergies: CardSynergy[] = [];
  private deceptionState: DeceptionState;
  private playerBehaviorPattern: string[] = [];
  private difficultyProfile: EnhancedAiDifficultyProfile;
  private threatHistory: {
    turn: number;
    threat: number;
    response: string;
    opponentAggression: number;
    bluffSuccessRate: number;
  }[] = [];
  private recentTargetHistory: TargetRecord[] = [];
  private bluffOutcomeHistory: BluffRecord[] = [];
  private behaviorOutcomeHistory: BehaviorRecord[] = [];
  private adaptiveSnapshot: AdaptiveSnapshot = {
    averageThreat: 0,
    aggressionTrend: 0,
    bluffSuccessRate: 0,
  };
  private lastProcessedTurn = -1;
  private totalRecordedBluffs = 0;
  private successfulRecordedBluffs = 0;

  constructor(
    difficulty: AIDifficulty = 'medium',
    tuning: AiTuningConfig = getAiTuningConfig(),
    difficultyProfileOverrides?: Partial<EnhancedAiDifficultyProfile>,
  ) {
    this.base = createAiStrategist(difficulty, tuning);
    this.difficulty = difficulty;
    this._personality = this.base.personality;
    this._tuning = this.base.tuning;

    const basePersonality = this.personality;
    this.difficultyProfile = this.buildDifficultyProfile(basePersonality, difficultyProfileOverrides);
    this.personality = {
      ...basePersonality,
      planningDepth: this.difficultyProfile.planningDepth,
      aggressiveness: this.difficultyProfile.aggression,
      riskTolerance: this.difficultyProfile.riskTolerance,
    };

    this.initializeCardSynergies();
    this.deceptionState = {
      fakeTargets: [],
      misdirectionLevel: this.personality.riskTolerance * 0.3,
      bluffHistory: [],
      playerPattern: []
    };
  }

  public get personality(): AIPersonality {
    return this._personality;
  }

  public set personality(value: AIPersonality) {
    this._personality = value;
    this.base.personality = value;
  }

  public get tuning(): AiTuningConfig {
    return this._tuning;
  }

  public set tuning(value: AiTuningConfig) {
    this._tuning = value;
    this.base.tuning = value;
  }

  private syncBase(): void {
    this.base.personality = this._personality;
    this.base.tuning = this._tuning;
  }

  public evaluateGameState(gameState: any): GameStateEvaluation {
    this.syncBase();
    return this.base.evaluateGameState(gameState);
  }

  public selectBestPlay(gameState: any): CardPlay | null {
    return this.selectOptimalPlay(gameState);
  }

  public getStrategicAssessment(gameState: any): string {
    this.syncBase();
    return this.base.getStrategicAssessment(gameState);
  }

  public getPlayerIp(gameState: any): number {
    return this.base.getPlayerIp(gameState);
  }

  public getAiFaction(gameState: any): 'government' | 'truth' {
    return this.base.getAiFaction(gameState);
  }

  public countRecentPlays(gameState: any, player: 'human' | 'ai', type?: GameCard['type']): number {
    return this.base.countRecentPlays(gameState, player, type);
  }

  public getCardMetadata(cardId: string): GameCard | undefined {
    return this.base.getCardMetadata(cardId);
  }

  public getFactionGoalBonus(cardMeta: GameCard | undefined, aiFaction: 'government' | 'truth'): number {
    return this.base.getFactionGoalBonus(cardMeta, aiFaction);
  }

  public generateCardPlays(card: GameCard, gameState: any, evaluation: GameStateEvaluation): CardPlay[] {
    return this.base.generateCardPlays(card, gameState, evaluation);
  }

  private buildDifficultyProfile(
    basePersonality: AIPersonality,
    overrides?: Partial<EnhancedAiDifficultyProfile>,
  ): EnhancedAiDifficultyProfile {
    const defaultProfile: EnhancedAiDifficultyProfile = {
      planningDepth: clamp(basePersonality.planningDepth, 1, 4),
      randomness: basePersonality.planningDepth >= 3 ? 0.2 : 0.4,
      aggression: clamp(basePersonality.aggressiveness, 0, 1),
      riskTolerance: clamp(basePersonality.riskTolerance, 0, 1),
      rollouts: basePersonality.planningDepth >= 3 ? basePersonality.planningDepth * 500 : 0,
    };

    if (!overrides) {
      return defaultProfile;
    }

    return {
      planningDepth: clamp(overrides.planningDepth ?? defaultProfile.planningDepth, 1, 4),
      randomness: clamp(overrides.randomness ?? defaultProfile.randomness, 0, 1),
      aggression: clamp(overrides.aggression ?? defaultProfile.aggression, 0, 1),
      riskTolerance: clamp(overrides.riskTolerance ?? defaultProfile.riskTolerance, 0, 1),
      rollouts: overrides.rollouts !== undefined
        ? Math.max(0, Math.round(overrides.rollouts))
        : defaultProfile.rollouts,
    };
  }

  // Monte Carlo Tree Search for optimal play selection
  public selectOptimalPlay(gameState: any): EnhancedCardPlay | null {
    this.syncBase();
    if (!gameState.hand || gameState.hand.length === 0) return null;

    const evaluation = this.evaluateGameState(gameState);
    this.updateAdaptiveMemory(gameState, evaluation);

    // Use MCTS only on hard+ difficulties due to computational cost
    if (this.personality.planningDepth >= 3) {
      const iterations = this.difficultyProfile.rollouts && this.difficultyProfile.rollouts > 0
        ? Math.max(200, Math.round(this.difficultyProfile.rollouts))
        : this.personality.planningDepth * 500;
      return this.runMCTS(gameState, iterations, evaluation); // iterations
    }

    // Fallback to enhanced heuristic search
    return this.selectBestPlayWithSynergies(gameState, evaluation);
  }

  private runMCTS(
    gameState: any,
    iterations: number,
    baseEvaluation?: GameStateEvaluation
  ): EnhancedCardPlay | null {
    const root = this.createMCTSNode(gameState, null);

    if (root.unexploredMoves.length === 0) {
      return this.selectBestPlayWithSynergies(gameState, baseEvaluation);
    }

    for (let i = 0; i < iterations; i++) {
      // Selection
      let node = this.selectNode(root);

      if (node.unexploredMoves.length === 0) {
        break;
      }

      // Expansion
      if (node.unexploredMoves.length > 0 && node.visits > 0) {
        node = this.expandNode(node);
      }

      // Simulation
      const reward = this.simulateGame(node.gameState);

      // Backpropagation
      this.backpropagate(node, reward);
    }

    // Return best move
    if (root.children.length === 0) {
      return this.selectBestPlayWithSynergies(gameState);
    }

    const bestChild = root.children.reduce((best, child) =>
      child.visits > best.visits ? child : best
    );

    if (!bestChild?.move) {
      return this.selectBestPlayWithSynergies(gameState, baseEvaluation);
    }

    const evaluation = baseEvaluation ?? this.evaluateGameState(gameState);
    return this.enhancePlay(bestChild.move, gameState, evaluation);
  }

  private createMCTSNode(gameState: any, move: CardPlay | null): MCTSNode {
    const possibleMoves = this.generateAllPossiblePlays(gameState);
    
    return {
      gameState: { ...gameState },
      move,
      parent: null,
      children: [],
      visits: 0,
      wins: 0,
      unexploredMoves: possibleMoves
    };
  }

  private selectNode(node: MCTSNode): MCTSNode {
    while (node.unexploredMoves.length === 0 && node.children.length > 0) {
      // UCB1 selection
      node = node.children.reduce((best, child) => {
        const ucb1 = (child.wins / child.visits) + 
                     Math.sqrt(2 * Math.log(node.visits) / child.visits);
        const bestUcb1 = (best.wins / best.visits) + 
                         Math.sqrt(2 * Math.log(node.visits) / best.visits);
        return ucb1 > bestUcb1 ? child : best;
      });
    }
    return node;
  }

  private expandNode(node: MCTSNode): MCTSNode {
    if (node.unexploredMoves.length === 0) {
      return node;
    }

    const move = node.unexploredMoves.pop()!;
    const newGameState = this.simulateMove(node.gameState, move);
    
    const child = this.createMCTSNode(newGameState, move);
    child.parent = node;
    node.children.push(child);
    
    return child;
  }

  private simulateGame(gameState: any): number {
    // Quick simulation to estimate win probability
    let currentState = this.cloneSimulationState(gameState);
    let moves = 0;
    const maxMoves = 10; // Limit simulation depth
    let evaluation = this.evaluateGameState(currentState);

    while (moves < maxMoves && !this.isGameOver(currentState)) {
      const move = this.selectRandomMove(currentState, evaluation);
      if (move) {
        currentState = this.simulateMove(currentState, move);
        evaluation = this.evaluateGameState(currentState);

        if (evaluation.dangerSignals.imminentLoss.length > 2 && this.personality.planningDepth >= 3) {
          break;
        }
      } else {
        break;
      }
      moves++;
    }

    const finalEvaluation = this.evaluateGameState(currentState);
    const reward = this.calculateReward(currentState);
    const dangerPenalty =
      finalEvaluation.dangerSignals.imminentLoss.length * 2 +
      finalEvaluation.dangerSignals.truthCrisis * 4 +
      finalEvaluation.dangerSignals.opponentAggression * 2 +
      finalEvaluation.dangerSignals.resourceCrunch * 1.5;

    return reward - dangerPenalty;
  }

  private backpropagate(node: MCTSNode, reward: number): void {
    while (node) {
      node.visits++;
      if (reward > 0) node.wins += reward;
      node = node.parent!;
    }
  }

  // Enhanced play selection with synergy recognition
  private selectBestPlayWithSynergies(
    gameState: any,
    baseEvaluation?: GameStateEvaluation
  ): EnhancedCardPlay | null {
    const possiblePlays = this.generateAllPossiblePlays(gameState);
    const evaluation = baseEvaluation ?? this.evaluateGameState(gameState);

    // Enhance each play with synergy and deception analysis
    const enhancedPlays: EnhancedCardPlay[] = possiblePlays.map(play =>
      this.enhancePlay(play, gameState, evaluation)
    );

    if (enhancedPlays.length === 0) return null;

    // Add controlled randomness based on difficulty
    const randomnessFactor = Math.min(0.35, 0.05 + this.difficultyProfile.randomness * 0.5);
    
    enhancedPlays.sort((a, b) => {
      const randomA = a.priority + (Math.random() * randomnessFactor);
      const randomB = b.priority + (Math.random() * randomnessFactor);
      return randomB - randomA;
    });

    return enhancedPlays[0];
  }

  private enhancePlay(
    play: CardPlay,
    gameState: any,
    evaluation: GameStateEvaluation
  ): EnhancedCardPlay {
    const synergies = this.findCardSynergies(play.cardId, gameState.hand, evaluation, gameState, play);
    const threatResponse = this.isThreatResponse(play, gameState, evaluation);
    const deceptionValue = this.calculateDeceptionValue(play, gameState, evaluation);
    const cardMeta = this.getCardMetadata(play.cardId);

    let adjustedPriority = play.priority;

    // Synergy bonuses
    synergies.forEach(synergy => {
      adjustedPriority += synergy.bonusValue;
    });

    // Deception bonus for higher difficulties
    if (this.personality.planningDepth >= 3) {
      adjustedPriority += deceptionValue * 0.2;
    }

    // Threat response bonus
    if (threatResponse) {
      adjustedPriority += 0.3;
    }

    if (cardMeta) {
      const aggressionModifier = (this.difficultyProfile.aggression - 0.5) * 0.25;
      if (cardMeta.type === 'DEFENSIVE' && this.adaptiveSnapshot.averageThreat > 0.5) {
        adjustedPriority += this.adaptiveSnapshot.averageThreat * 0.2;
      }

      if (cardMeta.type === 'ATTACK' && this.adaptiveSnapshot.aggressionTrend < 0.35) {
        adjustedPriority += 0.1;
      }

      if (cardMeta.type === 'MEDIA' && this.adaptiveSnapshot.bluffSuccessRate < 0.3) {
        adjustedPriority -= 0.05;
      }

      if (cardMeta.type === 'ATTACK') {
        adjustedPriority += aggressionModifier;
      }

      if (cardMeta.type === 'DEFENSIVE') {
        adjustedPriority -= aggressionModifier * 0.6;
      }
    }

    return {
      ...play,
      synergies,
      deceptionValue,
      threatResponse,
      priority: adjustedPriority,
    } as EnhancedCardPlay;
  }

  private updateAdaptiveMemory(gameState: any, evaluation: GameStateEvaluation): void {
    const currentTurn = typeof gameState.turn === 'number' ? gameState.turn : 0;

    if (this.lastProcessedTurn === currentTurn) {
      return;
    }

    this.lastProcessedTurn = currentTurn;

    const response = evaluation.threatLevel > 0.65
      ? 'fortify defenses'
      : evaluation.pressureMomentum > 0.2
        ? 'press advantage'
        : 'probe for openings';

    this.threatHistory.push({
      turn: currentTurn,
      threat: evaluation.threatLevel,
      response,
      opponentAggression: evaluation.dangerSignals.opponentAggression,
      bluffSuccessRate: this.adaptiveSnapshot.bluffSuccessRate,
    });

    if (this.threatHistory.length > 12) {
      this.threatHistory.splice(0, this.threatHistory.length - 12);
    }

    this.pruneHistories(currentTurn);
    this.updateAdaptiveSnapshot();
  }

  private pruneHistories(currentTurn: number): void {
    const freshnessWindow = 4;

    this.recentTargetHistory = this.recentTargetHistory.filter(
      record => currentTurn - record.turn <= freshnessWindow
    );

    this.bluffOutcomeHistory = this.bluffOutcomeHistory.filter(
      record => currentTurn - record.turn <= freshnessWindow
    );

    this.behaviorOutcomeHistory = this.behaviorOutcomeHistory.filter(
      record => currentTurn - record.turn <= freshnessWindow
    );

    const clampHistory = <T>(history: T[], limit: number): T[] => {
      if (history.length > limit) {
        return history.slice(history.length - limit);
      }
      return history;
    };

    this.recentTargetHistory = clampHistory(this.recentTargetHistory, 10);
    this.bluffOutcomeHistory = clampHistory(this.bluffOutcomeHistory, 12);
    this.behaviorOutcomeHistory = clampHistory(this.behaviorOutcomeHistory, 12);

    this.syncDeceptionTracking();
  }

  private syncDeceptionTracking(): void {
    this.deceptionState.fakeTargets = this.recentTargetHistory.map(record => record.state);
    this.deceptionState.bluffHistory = this.bluffOutcomeHistory.map(
      record => `${record.cardType}:${record.outcome}`
    );
    this.playerBehaviorPattern = this.behaviorOutcomeHistory.map(record => record.outcome);
    this.deceptionState.playerPattern = [...this.playerBehaviorPattern];
  }

  private updateAdaptiveSnapshot(): void {
    const recentThreats = this.threatHistory.slice(-6);

    if (recentThreats.length > 0) {
      const totalThreat = recentThreats.reduce((sum, entry) => sum + entry.threat, 0);
      const totalAggression = recentThreats.reduce(
        (sum, entry) => sum + entry.opponentAggression,
        0
      );

      this.adaptiveSnapshot.averageThreat = totalThreat / recentThreats.length;
      this.adaptiveSnapshot.aggressionTrend = totalAggression / recentThreats.length;
    } else {
      this.adaptiveSnapshot.averageThreat = 0;
      this.adaptiveSnapshot.aggressionTrend = 0;
    }
  }

  private isPositiveOutcome(outcome: BluffOutcome): boolean {
    return outcome === 'capture'
      || outcome === 'truth_gain'
      || outcome === 'resource_gain'
      || outcome === 'pressure';
  }

  private updateMisdirectionLevel(): void {
    if (this.totalRecordedBluffs === 0) {
      this.deceptionState.misdirectionLevel = this.personality.riskTolerance * 0.3;
      this.adaptiveSnapshot.bluffSuccessRate = 0;
      return;
    }

    const overallSuccessRate = this.successfulRecordedBluffs / Math.max(1, this.totalRecordedBluffs);
    const recentWindow = this.bluffOutcomeHistory.slice(-5);
    const recentSuccess = recentWindow.filter(record => this.isPositiveOutcome(record.outcome)).length;
    const recentRate = recentWindow.length > 0
      ? recentSuccess / recentWindow.length
      : overallSuccessRate;

    const baseLevel = this.personality.riskTolerance * 0.3;
    const modifier = (recentRate - 0.5) * 0.4;

    this.deceptionState.misdirectionLevel = Math.min(1, Math.max(0.1, baseLevel + modifier));
    this.adaptiveSnapshot.bluffSuccessRate = overallSuccessRate;
  }

  private classifyOutcome(params: {
    resolution: CardPlayResolution;
    previousState: any;
    card: GameCard;
    targetState?: string | null;
  }): BluffOutcome {
    const { resolution, previousState, card, targetState } = params;
    const previousTruth = typeof previousState.truth === 'number' ? previousState.truth : 50;
    const previousAiIp = typeof previousState.aiIP === 'number' ? previousState.aiIP : 0;
    const truthDelta = (resolution.truth ?? previousTruth) - previousTruth;
    const aiIpDelta = (resolution.aiIP ?? previousAiIp) - previousAiIp;
    const aiFaction = this.getAiFaction(previousState);

    if (resolution.logEntries.some(entry => CAPTURE_REGEX.test(entry))) {
      return 'capture';
    }

    if (truthDelta !== 0) {
      const truthImproved =
        (aiFaction === 'government' && truthDelta < 0) ||
        (aiFaction === 'truth' && truthDelta > 0);

      if (truthImproved) {
        return 'truth_gain';
      }

      return 'setback';
    }

    if (aiIpDelta > 0) {
      return 'resource_gain';
    }

    if (resolution.damageDealt > 0 || (targetState && card.type === 'ATTACK')) {
      return 'pressure';
    }

    if (aiIpDelta < 0) {
      return 'setback';
    }

    return 'neutral';
  }

  public recordAiPlayOutcome(params: {
    card: GameCard;
    targetState?: string | null;
    resolution: CardPlayResolution;
    previousState: any;
  }): void {
    const { card, targetState, resolution, previousState } = params;
    const currentTurn = typeof previousState.turn === 'number' ? previousState.turn : 0;
    const recordedTarget = targetState ?? 'none';

    this.recentTargetHistory.push({ turn: currentTurn, state: recordedTarget });

    const outcome = this.classifyOutcome({
      resolution,
      previousState,
      card,
      targetState,
    });

    this.bluffOutcomeHistory.push({
      turn: currentTurn,
      cardType: card.type ?? 'UNKNOWN',
      outcome,
      target: targetState ?? undefined,
    });

    this.behaviorOutcomeHistory.push({ turn: currentTurn, outcome });
    this.totalRecordedBluffs += 1;

    if (this.isPositiveOutcome(outcome)) {
      this.successfulRecordedBluffs += 1;
    }

    this.pruneHistories(currentTurn);
    this.updateMisdirectionLevel();
  }

  public getAdaptiveSummary(): string[] {
    if (this.threatHistory.length === 0) {
      return [];
    }

    const summary: string[] = [];
    const avgThreatPercent = Math.round(this.adaptiveSnapshot.averageThreat * 100);
    const aggressionPercent = Math.round(this.adaptiveSnapshot.aggressionTrend * 100);
    const bluffSuccessPercent = Math.round(this.adaptiveSnapshot.bluffSuccessRate * 100);

    summary.push(
      `Adaptive trend: threat ${avgThreatPercent}%, opponent aggression ${aggressionPercent}%, bluff success ${bluffSuccessPercent}%.`
    );

    const latest = this.threatHistory[this.threatHistory.length - 1];
    if (latest?.response) {
      summary.push(`Long-term response: ${latest.response}.`);
    }

    return summary;
  }

  // Card Synergy Recognition System
  private initializeCardSynergies(): void {
    this.cardSynergies = [
      // Media Combos
      {
        cardIds: ['social-media-campaign', 'viral-conspiracy'],
        synergyType: 'combo',
        bonusValue: 0.3,
        description: 'Social media amplification combo'
      },
      {
        cardIds: ['classified-leak', 'whistleblower-protection'],
        synergyType: 'sequence',
        bonusValue: 0.4,
        description: 'Protected leak sequence'
      },
      // Zone Control Combos
      {
        cardIds: ['surveillance-network', 'data-mining-operation'],
        synergyType: 'combo',
        bonusValue: 0.25,
        description: 'Intelligence gathering combo'
      },
      // Defensive Synergies
      {
        cardIds: ['counter-intelligence', 'disinformation-campaign'],
        synergyType: 'counter',
        bonusValue: 0.35,
        description: 'Counter-narrative defense'
      }
    ];
  }

  private findCardSynergies(
    cardId: string,
    hand: GameCard[],
    evaluation: GameStateEvaluation,
    gameState: any,
    play?: CardPlay
  ): CardSynergy[] {
    const synergies: CardSynergy[] = [];
    const handIds = hand.map(c => c.id);

    this.cardSynergies.forEach(synergy => {
      if (synergy.cardIds.includes(cardId)) {
        const otherCards = synergy.cardIds.filter(id => id !== cardId);
        const hasSynergyCards = otherCards.some(otherId => handIds.includes(otherId));

        if (hasSynergyCards) {
          synergies.push(synergy);
        }
      }
    });

    const cardMeta = this.getCardMetadata(cardId);
    const aiFaction = this.getAiFaction(gameState);

    if (cardMeta) {
      const factionBonus = this.getFactionGoalBonus(cardMeta, aiFaction);
      if (factionBonus > 0.2) {
        synergies.push({
          cardIds: [cardId],
          synergyType: 'sequence',
          bonusValue: Math.min(0.3, factionBonus),
          description: 'Aligns with faction objective'
        });
      }
    }

    const recentAiPlays = (gameState.cardsPlayedThisRound ?? []).filter(
      (record: any) => record.player === 'ai'
    );

    if (play?.targetState && cardMeta) {
      const stateChain = recentAiPlays.filter(
        (record: any) => record.targetState === play.targetState && record.card.type === cardMeta.type
      ).length;

      if (stateChain > 0) {
        synergies.push({
          cardIds: [cardId],
          synergyType: 'combo',
          bonusValue: Math.min(0.35, 0.15 + stateChain * 0.1),
          description: `Extends ${cardMeta.type?.toLowerCase()} chain on ${play.targetState}`
        });
      }

      const pressureSignal = evaluation.pressureSignals.aiTargets.find(
        signal => signal.abbreviation === play.targetState
      );

      if (pressureSignal && cardMeta.effects?.pressureDelta) {
        const remainingAfterPlay = Math.max(0, pressureSignal.remaining - cardMeta.effects.pressureDelta);
        synergies.push({
          cardIds: [cardId],
          synergyType: 'sequence',
          bonusValue: remainingAfterPlay <= 0 ? 0.45 : 0.25,
          description: `Sets up capture on ${pressureSignal.stateName}`
        });
      }

      const imminentThreat = evaluation.dangerSignals.imminentLoss.find(
        signal => signal.abbreviation === play.targetState
      );

      if (imminentThreat && cardMeta.type === 'DEFENSIVE') {
        synergies.push({
          cardIds: [cardId],
          synergyType: 'counter',
          bonusValue: 0.4,
          description: `Reinforces threatened ${imminentThreat.stateName}`
        });
      }
    }

    const recentPlayerPattern = (gameState.cardsPlayedThisRound ?? []).slice(-3);
    const consecutiveAttacks = recentPlayerPattern.every(
      (record: any) => record.player === 'human' && record.card.type === 'ATTACK'
    );

    if (consecutiveAttacks && cardMeta?.type === 'DEFENSIVE') {
      synergies.push({
        cardIds: [cardId],
        synergyType: 'counter',
        bonusValue: 0.3,
        description: 'Counters sustained attack pattern'
      });
    }

    return synergies;
  }

  // Advanced Threat Assessment
  private isThreatResponse(play: CardPlay, gameState: any, evaluation: GameStateEvaluation): boolean {
    const recentPlayerMoves = gameState.cardsPlayedThisRound?.filter(
      (p: any) => p.player === 'human'
    ) || [];

    const cardMeta = this.getCardMetadata(play.cardId);

    const imminentDefense = play.targetState ?
      evaluation.dangerSignals.imminentLoss.some(signal => signal.abbreviation === play.targetState) :
      false;

    if (imminentDefense && cardMeta?.type === 'DEFENSIVE') {
      return true;
    }

    if (evaluation.dangerSignals.truthCrisis > 0.4 && cardMeta?.effects?.truthDelta) {
      const aiFaction = this.getAiFaction(gameState);
      const truthDelta = cardMeta.effects.truthDelta;
      if ((aiFaction === 'truth' && truthDelta > 0) || (aiFaction === 'government' && truthDelta < 0)) {
        return true;
      }
    }

    if (recentPlayerMoves.length === 0) {
      return false;
    }

    const lastPlayerCard = recentPlayerMoves[recentPlayerMoves.length - 1];

    if (lastPlayerCard.card.type === 'ATTACK' && cardMeta?.type === 'DEFENSIVE') {
      return true;
    }

    if (lastPlayerCard.card.type === 'MEDIA' && cardMeta?.type === 'MEDIA' && cardMeta.effects?.truthDelta) {
      const aiFaction = this.getAiFaction(gameState);
      const truthDelta = cardMeta.effects.truthDelta;
      if ((aiFaction === 'government' && truthDelta < 0) || (aiFaction === 'truth' && truthDelta > 0)) {
        return true;
      }
    }

    if (lastPlayerCard.card.type === 'ZONE' && play.targetState === lastPlayerCard.targetState) {
      return true;
    }

    const repeatedAggression = recentPlayerMoves.slice(-3).every((move: any) => move.card.type === 'ATTACK');
    if (repeatedAggression && cardMeta?.type === 'DEFENSIVE') {
      return true;
    }

    if (evaluation.dangerSignals.opponentAggression > 0.6 && cardMeta?.type !== 'MEDIA') {
      return true;
    }

    const latestThreat = this.threatHistory[this.threatHistory.length - 1];
    if (latestThreat) {
      if (latestThreat.threat > 0.65 && cardMeta?.type === 'DEFENSIVE') {
        return true;
      }

      if (latestThreat.opponentAggression > 0.7 && cardMeta?.type === 'ATTACK') {
        return true;
      }
    }

    if (this.adaptiveSnapshot.averageThreat > 0.7 && cardMeta?.type === 'DEFENSIVE') {
      return true;
    }

    return false;
  }

  // Deception and Bluffing Mechanics
  private calculateDeceptionValue(play: CardPlay, gameState: any, evaluation: GameStateEvaluation): number {
    let deceptionValue = 0;

    // Only use deception on harder difficulties
    if (this.personality.planningDepth < 3) return 0;

    const cardMeta = this.getCardMetadata(play.cardId);

    // Misdirection value - play cards that don't reveal true strategy
    if (play.targetState && this.deceptionState.fakeTargets.includes(play.targetState)) {
      deceptionValue += 0.2;
    }

    // Bluffing - play unexpected cards based on player pattern
    const playerPattern = this.analyzePlayerPattern(gameState);
    if (this.isUnexpectedPlay(play, playerPattern)) {
      deceptionValue += 0.15;
    }

    // Counter-expectation plays
    if (this.isCounterExpectationPlay(play, gameState, evaluation)) {
      deceptionValue += 0.25;
    }

    const recentAiPlays = (gameState.cardsPlayedThisRound ?? []).filter(
      (record: any) => record.player === 'ai'
    );

    const lastTwoTypes = recentAiPlays.slice(-2).map((record: any) => record.card.type);
    if (lastTwoTypes.length === 2 && lastTwoTypes.every(type => type === lastTwoTypes[0])) {
      if (cardMeta?.type && cardMeta.type !== lastTwoTypes[0]) {
        deceptionValue += 0.1;
      }
    }

    if (evaluation.dangerSignals.opponentAggression > 0.5 && cardMeta?.type === 'MEDIA') {
      deceptionValue += 0.1;
    }

    if (play.targetState) {
      const opponentFocus = evaluation.pressureSignals.opponentTargets.some(
        signal => signal.abbreviation === play.targetState
      );
      if (!opponentFocus && evaluation.pressureSignals.opponentTargets.length > 0) {
        deceptionValue += 0.08;
      }
    }

    const recentBluffs = this.deceptionState.bluffHistory.slice(-3);
    if (recentBluffs.length > 0) {
      const successfulBluffs = recentBluffs.filter(entry =>
        entry.includes('capture') ||
        entry.includes('truth_gain') ||
        entry.includes('resource_gain') ||
        entry.includes('pressure')
      ).length;

      deceptionValue += (successfulBluffs / recentBluffs.length) * 0.05;
    }

    const recentOutcomes = this.playerBehaviorPattern.slice(-3);
    if (recentOutcomes.length === 3 && recentOutcomes.every(outcome => outcome === 'setback')) {
      deceptionValue *= 0.75;
    }

    if (this.adaptiveSnapshot.bluffSuccessRate > 0.6) {
      deceptionValue *= 1.1;
    } else if (this.adaptiveSnapshot.bluffSuccessRate < 0.3) {
      deceptionValue *= 0.8;
    }

    deceptionValue = Math.max(0, deceptionValue);

    return deceptionValue * this.deceptionState.misdirectionLevel;
  }

  private analyzePlayerPattern(gameState: any): string {
    // Analyze recent player moves to identify patterns
    const recentMoves = gameState.cardsPlayedThisRound?.filter(
      (p: any) => p.player === 'human'
    ) || [];

    if (recentMoves.length < 2) {
      if (this.playerBehaviorPattern.length >= 3) {
        const storedOutcomes = this.playerBehaviorPattern.slice(-3);
        const setbacks = storedOutcomes.filter(outcome => outcome === 'setback').length;
        if (setbacks >= 2) {
          return 'player_countering';
        }

        const truthPress = storedOutcomes.filter(outcome => outcome === 'truth_gain').length;
        if (truthPress >= 2) {
          return 'propaganda_focus';
        }
      }

      return 'insufficient_data';
    }

    const moveTypes = recentMoves.map((m: any) => m.card.type);

    // Detect patterns
    if (moveTypes.every((t: string) => t === 'ZONE')) return 'territorial_focus';
    if (moveTypes.every((t: string) => t === 'MEDIA')) return 'propaganda_focus';
    if (moveTypes.every((t: string) => t === 'ATTACK')) return 'aggressive_focus';
    if (moveTypes.includes('ATTACK') && moveTypes.includes('ZONE')) return 'aggressive_expansion';

    if (this.adaptiveSnapshot.aggressionTrend > 0.6) {
      return 'aggressive_focus';
    }

    return 'mixed_strategy';
  }

  private isUnexpectedPlay(play: CardPlay, playerPattern: string): boolean {
    // Play cards that go against expected responses to player patterns
    switch (playerPattern) {
      case 'territorial_focus':
        return play.cardId.includes('media') || play.cardId.includes('attack');
      case 'propaganda_focus':
        return play.cardId.includes('zone') || play.cardId.includes('defensive');
      case 'aggressive_focus':
        return !play.cardId.includes('defensive') && !play.cardId.includes('counter');
      case 'player_countering':
        return play.cardId.includes('media') || play.cardId.includes('zone');
      default:
        return false;
    }
  }

  private isCounterExpectationPlay(play: CardPlay, gameState: any, evaluation?: GameStateEvaluation): boolean {
    // Advanced psychological play - do the opposite of what player expects
    const currentEvaluation = evaluation ?? this.evaluateGameState(gameState);

    // When winning, play unexpectedly aggressive moves
    if (currentEvaluation.overallScore > 0.3 && play.cardId.includes('attack')) {
      return true;
    }

    // When losing, play unexpectedly defensive moves
    if (currentEvaluation.overallScore < -0.3 && play.cardId.includes('defensive')) {
      return true;
    }

    return false;
  }

  // Helper methods for MCTS
  private generateAllPossiblePlays(gameState: any): CardPlay[] {
    const plays: CardPlay[] = [];
    const evaluation = this.evaluateGameState(gameState);
    const availableIp = typeof gameState.aiIP === 'number' ? gameState.aiIP : 0;

    for (const card of gameState.hand || []) {
      const cardCost =
        typeof card.cost === 'number'
          ? card.cost
          : this.getCardMetadata(card.id)?.cost ?? 0;

      if (cardCost > availableIp) {
        continue;
      }

      const cardPlays = this.generateCardPlays(card, gameState, evaluation);
      plays.push(...cardPlays);
    }

    return plays;
  }

  private simulateMove(gameState: any, move: CardPlay): any {
    const newState = this.cloneSimulationState(gameState);
    const card =
      newState.hand.find((c: GameCard) => c.id === move.cardId) ||
      newState.aiHand?.find((c: GameCard) => c.id === move.cardId) ||
      CARD_DATABASE.find(c => c.id === move.cardId);

    if (!card) {
      return newState;
    }

    const snapshot = this.buildResolutionSnapshot(newState);
    const resolution = resolveCardMVP(snapshot, card, move.targetState ?? null, 'ai');

    newState.hand = (newState.hand ?? []).filter((c: GameCard) => c.id !== move.cardId);
    if (Array.isArray(newState.aiHand)) {
      newState.aiHand = newState.aiHand.filter((c: GameCard) => c.id !== move.cardId);
    }

    const playRecord = {
      card: { ...card },
      player: 'ai' as const,
      targetState: move.targetState ?? null,
      truthDelta: card.effects?.truthDelta,
    };
    const history = Array.isArray(newState.cardsPlayedThisRound)
      ? newState.cardsPlayedThisRound
      : [];
    newState.cardsPlayedThisRound = [...history, playRecord];

    newState.aiIP = resolution.aiIP;
    newState.truth = resolution.truth;
    newState.states = resolution.states.map(state => ({ ...state }));
    newState.controlledStates = [...resolution.controlledStates];
    newState.playerControlledStates = [...resolution.controlledStates];
    newState.aiControlledStates = [...resolution.aiControlledStates];
    newState.ip = -resolution.ip;
    newState.targetState = resolution.targetState;
    newState.selectedCard = resolution.selectedCard;

    return newState;
  }

  private selectRandomMove(gameState: any, evaluation?: GameStateEvaluation): CardPlay | null {
    const moves = this.generateAllPossiblePlays(gameState);
    if (moves.length === 0) return null;

    if (evaluation) {
      const urgentStates = new Set(
        evaluation.dangerSignals.imminentLoss.map(signal => signal.abbreviation)
      );

      const urgentMoves = moves.filter(move => move.targetState && urgentStates.has(move.targetState));
      if (urgentMoves.length > 0) {
        return urgentMoves[Math.floor(Math.random() * urgentMoves.length)];
      }

      const highPriority = moves
        .filter(move => move.priority >= 0.8)
        .sort((a, b) => b.priority - a.priority)
        .slice(0, 3);

      if (highPriority.length > 0) {
        return highPriority[Math.floor(Math.random() * highPriority.length)];
      }
    }

    const sortedMoves = [...moves].sort((a, b) => b.priority - a.priority);
    const randomnessWindow = Math.max(
      1,
      Math.min(sortedMoves.length, Math.round(1 + this.difficultyProfile.randomness * 5)),
    );
    return sortedMoves[Math.floor(Math.random() * randomnessWindow)];
  }

  private isGameOver(gameState: any): boolean {
    const { aiWon, playerWon } = this.evaluateOutcome(gameState);
    return aiWon || playerWon;
  }

  private cloneSimulationState(gameState: any): any {
    const states = (gameState.states ?? []).map((state: any) => ({ ...state }));

    const playerControlledStates = Array.isArray(gameState.playerControlledStates)
      ? [...gameState.playerControlledStates]
      : Array.isArray(gameState.controlledStates)
        ? [...gameState.controlledStates]
        : states
            .filter((state: any) => state.owner === 'player')
            .map((state: any) => state.abbreviation);

    const aiControlledStates = Array.isArray(gameState.aiControlledStates)
      ? [...gameState.aiControlledStates]
      : states
          .filter((state: any) => state.owner === 'ai')
          .map((state: any) => state.abbreviation);

    const clone: any = {
      ...gameState,
      states,
      hand: (gameState.hand ?? []).map((card: GameCard) => ({ ...card })),
      aiHand: (gameState.aiHand ?? []).map((card: GameCard) => ({ ...card })),
      controlledStates: playerControlledStates,
      playerControlledStates,
      aiControlledStates,
    };

    if (Array.isArray(gameState.playerHand)) {
      clone.playerHand = gameState.playerHand.map((card: GameCard) => ({ ...card }));
    }

    if (Array.isArray(gameState.cardsPlayedThisRound)) {
      clone.cardsPlayedThisRound = gameState.cardsPlayedThisRound.map((record: any) => ({
        ...record,
        card: record.card ? { ...record.card } : record.card,
      }));
    } else {
      clone.cardsPlayedThisRound = [];
    }

    return clone;
  }

  private buildResolutionSnapshot(gameState: any): GameSnapshot {
    const states = (gameState.states ?? []).map((state: any) => ({ ...state }));
    const playerHand = Array.isArray(gameState.playerHand)
      ? gameState.playerHand.map((card: GameCard) => ({ ...card }))
      : [];
    const aiHand = Array.isArray(gameState.aiHand)
      ? gameState.aiHand.map((card: GameCard) => ({ ...card }))
      : (gameState.hand ?? []).map((card: GameCard) => ({ ...card }));

    const playerControlledStates = Array.isArray(gameState.playerControlledStates)
      ? [...gameState.playerControlledStates]
      : Array.isArray(gameState.controlledStates)
        ? [...gameState.controlledStates]
        : states
            .filter((state: any) => state.owner === 'player')
            .map((state: any) => state.abbreviation);

    const aiControlledStates = Array.isArray(gameState.aiControlledStates)
      ? [...gameState.aiControlledStates]
      : states
          .filter((state: any) => state.owner === 'ai')
          .map((state: any) => state.abbreviation);

    return {
      truth: gameState.truth ?? 0,
      ip: this.getPlayerIp(gameState),
      aiIP: gameState.aiIP ?? 0,
      hand: playerHand,
      aiHand,
      controlledStates: playerControlledStates,
      aiControlledStates,
      round: gameState.round ?? 0,
      turn: gameState.turn ?? 0,
      faction: gameState.faction ?? 'truth',
      states,
    };
  }

  /** @internal - exposed for verification in tests */
  public simulateMoveForTesting(gameState: any, move: CardPlay): any {
    return this.simulateMove(gameState, move);
  }

  private evaluateOutcome(gameState: any): { aiWon: boolean; playerWon: boolean } {
    const aiStates = gameState.states?.filter((s: any) => s.owner === 'ai').length ?? 0;
    const playerStates = gameState.states?.filter((s: any) => s.owner === 'player').length ?? 0;
    const aiIp = gameState.aiIP ?? 0;
    const playerIp = this.getPlayerIp(gameState);
    const truth = gameState.truth ?? 0;
    const aiFaction = this.getAiFaction(gameState);

    const aiTerritorialWin = aiStates >= 10;
    const playerTerritorialWin = playerStates >= 10;
    const aiEconomicWin = aiIp >= 300;
    const playerEconomicWin = playerIp >= 300;

    let aiTruthWin = false;
    let playerTruthWin = false;

    if (aiFaction === 'government') {
      aiTruthWin = truth <= 5;
      playerTruthWin = truth >= 95;
      if (truth <= 0) {
        aiTruthWin = true;
      }
      if (truth >= 100) {
        playerTruthWin = true;
      }
    } else {
      aiTruthWin = truth >= 95;
      playerTruthWin = truth <= 5;
      if (truth >= 100) {
        aiTruthWin = true;
      }
      if (truth <= 0) {
        playerTruthWin = true;
      }
    }

    const aiWon = aiTerritorialWin || aiEconomicWin || aiTruthWin;
    const playerWon = playerTerritorialWin || playerEconomicWin || playerTruthWin;

    return { aiWon, playerWon };
  }

  private calculateReward(gameState: any): number {
    const { aiWon, playerWon } = this.evaluateOutcome(gameState);

    if (aiWon && !playerWon) {
      return 100;
    }

    if (playerWon && !aiWon) {
      return -100;
    }

    const aiStates = gameState.states?.filter((s: any) => s.owner === 'ai').length ?? 0;
    const playerStates = gameState.states?.filter((s: any) => s.owner === 'player').length ?? 0;
    const stateControlScore = Math.max(-1, Math.min(1, (aiStates - playerStates) / 10));

    const aiIp = gameState.aiIP ?? 0;
    const playerIp = this.getPlayerIp(gameState);
    const ipScore = Math.max(-1, Math.min(1, (aiIp - playerIp) / 300));

    const aiFaction = this.getAiFaction(gameState);
    const truthValue = gameState.truth ?? 50;
    let truthScore = aiFaction === 'government'
      ? (50 - truthValue) / 40
      : (truthValue - 50) / 40;
    truthScore = Math.max(-1, Math.min(1, truthScore));

    const heuristicScore = this.evaluateGameState(gameState).overallScore;

    const reward =
      stateControlScore * 0.5 +
      ipScore * 0.2 +
      truthScore * 0.3 +
      heuristicScore * 0.2;

    return Math.max(-10, Math.min(10, reward));
  }

  // Enhanced strategic assessment with deception awareness
  public getEnhancedStrategicAssessment(gameState: any): string {
    const baseAssessment = this.getStrategicAssessment(gameState);
    const deceptionLevel = Math.round(this.deceptionState.misdirectionLevel * 100);
    
    let enhanced = baseAssessment;
    
    if (this.personality.planningDepth >= 3) {
      enhanced += `Deception level: ${deceptionLevel}%. `;
      
      if (this.deceptionState.bluffHistory.length > 0) {
        enhanced += "Running psychological operations. ";
      }
      
      const playerPattern = this.analyzePlayerPattern(gameState);
      if (playerPattern !== 'insufficient_data') {
        enhanced += `Player pattern: ${playerPattern.replace('_', ' ')}. `;
      }
    }
    
    return enhanced;
  }
}