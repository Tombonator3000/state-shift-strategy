import type { GameCard } from '@/rules/mvp';
import { CARD_DATABASE } from './cardDatabase';

export type AIDifficulty = 'easy' | 'medium' | 'hard' | 'legendary';

export interface AIPersonality {
  name: string;
  description: string;
  aggressiveness: number; // 0-1, how likely to play attack cards
  defensiveness: number; // 0-1, how likely to play defensive cards
  territorial: number; // 0-1, focus on state control vs other strategies
  economical: number; // 0-1, focus on IP generation
  riskTolerance: number; // 0-1, willingness to take risks
  planningDepth: number; // 1-3, how many turns ahead to think
}

export const AI_PERSONALITIES: Record<AIDifficulty, AIPersonality> = {
  easy: {
    name: "Intern Agent",
    description: "New to the conspiracy, makes obvious mistakes",
    aggressiveness: 0.2,
    defensiveness: 0.1,
    territorial: 0.3,
    economical: 0.5,
    riskTolerance: 0.2,
    planningDepth: 1
  },
  medium: {
    name: "Field Operative",
    description: "Experienced agent with solid tactical understanding",
    aggressiveness: 0.5,
    defensiveness: 0.5,
    territorial: 0.5,
    economical: 0.6,
    riskTolerance: 0.4,
    planningDepth: 2
  },
  hard: {
    name: "Senior Handler",
    description: "Veteran strategist with deep understanding of the game",
    aggressiveness: 0.8,
    defensiveness: 0.8,
    territorial: 0.7,
    economical: 0.7,
    riskTolerance: 0.3,
    planningDepth: 3
  },
  legendary: {
    name: "Shadow Director",
    description: "Master manipulator who sees all angles",
    aggressiveness: 1.0,
    defensiveness: 0.95,
    territorial: 0.85,
    economical: 0.9,
    riskTolerance: 0.1,
    planningDepth: 4
  }
};

interface PressureInsight {
  stateId: string;
  stateName: string;
  abbreviation: string;
  owner: 'ai' | 'player' | 'neutral';
  pressure: number;
  defense: number;
  remaining: number;
  baseIP: number;
}

interface AgendaInsight {
  id: string;
  name: string;
  faction: 'ai' | 'player';
  progress: number;
  target: number;
  urgency: number;
}

interface DangerSignals {
  imminentCapture: PressureInsight[];
  imminentLoss: PressureInsight[];
  truthCrisis: number;
  resourceCrunch: number;
  opponentAggression: number;
}

export interface GameStateEvaluation {
  territorialControl: number;
  resourceAdvantage: number;
  handQuality: number;
  threatLevel: number;
  agendaProgress: number;
  pressureMomentum: number;
  truthObjective: number;
  opponentResourceThreat: number;
  opponentHandThreat: number;
  agendaSignals: AgendaInsight[];
  pressureSignals: {
    aiTargets: PressureInsight[];
    opponentTargets: PressureInsight[];
    contested: PressureInsight[];
  };
  dangerSignals: DangerSignals;
  planningWeight: number;
  overallScore: number;
}

interface CardPlay {
  cardId: string;
  targetState?: string;
  priority: number;
  reasoning: string;
}

export type { CardPlay };

export class AIStrategist {
  public personality: AIPersonality;
  private difficulty: AIDifficulty;

  constructor(difficulty: AIDifficulty = 'medium') {
    this.difficulty = difficulty;
    this.personality = AI_PERSONALITIES[difficulty];
  }

  // Factory method moved to AIFactory to avoid circular dependencies

  // Evaluate the current game state from AI perspective
  evaluateGameState(gameState: any): GameStateEvaluation {
    const aiControlledStates = gameState.states.filter((state: any) => state.owner === 'ai');
    const playerControlledStates = gameState.states.filter((state: any) => state.owner === 'player');

    const playerIp = this.getPlayerIp(gameState);
    const aiIp = typeof gameState.aiIP === 'number' ? gameState.aiIP : 0;
    const aiHand = Array.isArray(gameState.hand) ? gameState.hand : [];
    const opponentHandSize = this.estimateOpponentHandSize(gameState);

    // Territorial control (-1 to 1, negative means player advantage)
    const territorialControl = Math.tanh((aiControlledStates.length - playerControlledStates.length) / 5);

    // Resource advantage (normalized around typical mid-game values)
    const ipDifferential = aiIp - playerIp;
    const resourceAdvantage = Math.tanh(ipDifferential / 120);

    // Hand quality (simplified - count high-value cards)
    const handQuality = this.evaluateHandQuality(aiHand);

    // Threat level (how close player is to winning)
    const threatLevel = this.calculateThreatLevel(gameState);

    // Agenda progress (how close AI is to completing secret agenda)
    const agendaProgress = this.calculateAgendaProgress(gameState);

    const pressureSignals = this.analyzePressure(gameState);
    const pressureMomentum = this.calculatePressureMomentum(pressureSignals);

    const truthObjective = this.evaluateTruthObjective(gameState);

    const opponentResourceThreat = Math.max(0, Math.tanh(playerIp / 150) + Math.tanh((playerIp - aiIp) / 120));
    const opponentHandThreat = Math.max(0, Math.tanh((opponentHandSize - aiHand.length) / 3));

    const agendaSignals = this.buildAgendaSignals(gameState);
    const dangerSignals = this.buildDangerSignals({
      pressureSignals,
      truthObjective,
      opponentResourceThreat,
      threatLevel,
      opponentHandThreat,
      planningDepth: this.personality.planningDepth
    });

    const planningWeight = this.personality.planningDepth / 4;

    const weights = this.getDynamicWeights({
      planningWeight,
      territorialControl,
      resourceAdvantage,
      handQuality,
      threatLevel,
      agendaProgress,
      pressureMomentum,
      truthObjective,
      opponentResourceThreat,
      opponentHandThreat
    });

    const overallScore =
      territorialControl * weights.territorial +
      resourceAdvantage * weights.resource +
      handQuality * weights.hand +
      (1 - threatLevel) * weights.threatMitigation +
      agendaProgress * weights.agenda +
      pressureMomentum * weights.pressure +
      truthObjective * weights.truth +
      (1 - opponentResourceThreat) * weights.opponentEconomy +
      (1 - opponentHandThreat) * weights.opponentHand;

    return {
      territorialControl,
      resourceAdvantage,
      handQuality,
      threatLevel,
      agendaProgress,
      pressureMomentum,
      truthObjective,
      opponentResourceThreat,
      opponentHandThreat,
      agendaSignals,
      pressureSignals,
      dangerSignals,
      planningWeight,
      overallScore
    };
  }

  protected getPlayerIp(gameState: any): number {
    if (typeof gameState.playerIp === 'number') {
      return gameState.playerIp;
    }

    if (typeof gameState.playerIP === 'number') {
      return gameState.playerIP;
    }

    if (typeof gameState.ip === 'number') {
      // Strategist view flips the sign of player IP to represent advantage
      return Math.max(0, -gameState.ip);
    }

    return 0;
  }

  protected getAiFaction(gameState: any): 'government' | 'truth' {
    return gameState.faction === 'truth' ? 'government' : 'truth';
  }

  private estimateOpponentHandSize(gameState: any): number {
    if (Array.isArray(gameState.playerHand)) {
      return gameState.playerHand.length;
    }

    if (typeof gameState.opponentHandSize === 'number') {
      return gameState.opponentHandSize;
    }

    if (typeof gameState.playerHandSize === 'number') {
      return gameState.playerHandSize;
    }

    const baseline = 5;
    const cardsPlayedThisRound = (gameState.cardsPlayedThisRound ?? [])
      .filter((play: any) => play.player === 'human').length;

    return Math.max(0, baseline - cardsPlayedThisRound);
  }

  private calculateAgendaProgress(gameState: any): number {
    const aiAgenda = gameState.aiSecretAgenda ?? gameState.secretAgenda;
    const playerAgenda = gameState.secretAgenda;

    const aiTarget = Math.max(1, aiAgenda?.target ?? aiAgenda?.goal ?? 1);
    const playerTarget = Math.max(1, playerAgenda?.target ?? playerAgenda?.goal ?? 1);

    const aiProgress = aiAgenda ? Math.min(1, (aiAgenda.progress ?? 0) / aiTarget) : 0;
    const playerProgress = playerAgenda ? Math.min(1, (playerAgenda.progress ?? 0) / playerTarget) : 0;

    return aiProgress - playerProgress;
  }

  private buildAgendaSignals(gameState: any): AgendaInsight[] {
    const signals: AgendaInsight[] = [];
    const aiAgenda = gameState.aiSecretAgenda ?? gameState.secretAgenda;
    const playerAgenda = gameState.secretAgenda;

    if (aiAgenda) {
      const target = Math.max(1, aiAgenda.target ?? aiAgenda.goal ?? 1);
      const progress = Math.min(target, aiAgenda.progress ?? 0);
      const urgency = target > 0 ? progress / target : 0;
      signals.push({
        id: aiAgenda.id ?? 'ai-agenda',
        name: aiAgenda.title ?? 'AI Agenda',
        faction: 'ai',
        progress,
        target,
        urgency
      });
    }

    if (playerAgenda) {
      const target = Math.max(1, playerAgenda.target ?? playerAgenda.goal ?? 1);
      const progress = Math.min(target, playerAgenda.progress ?? 0);
      const urgency = target > 0 ? progress / target : 0;
      signals.push({
        id: playerAgenda.id ?? 'player-agenda',
        name: playerAgenda.title ?? 'Player Agenda',
        faction: 'player',
        progress,
        target,
        urgency
      });
    }

    return signals;
  }

  private analyzePressure(gameState: any): GameStateEvaluation['pressureSignals'] {
    const aiTargets: PressureInsight[] = [];
    const opponentTargets: PressureInsight[] = [];
    const contested: PressureInsight[] = [];

    for (const state of gameState.states ?? []) {
      const pressure = Math.max(0, state.pressure ?? 0);
      const defense = Math.max(1, state.defense ?? 1);
      const remaining = Math.max(0, defense - pressure);
      const insight: PressureInsight = {
        stateId: state.id,
        stateName: state.name,
        abbreviation: state.abbreviation,
        owner: state.owner,
        pressure,
        defense,
        remaining,
        baseIP: state.baseIP ?? 0
      };

      if (pressure === 0) {
        continue;
      }

      if (state.owner === 'player' || state.owner === 'neutral') {
        aiTargets.push(insight);
        if (state.owner === 'neutral') {
          contested.push(insight);
        }
      } else if (state.owner === 'ai') {
        opponentTargets.push(insight);
      } else {
        contested.push(insight);
      }
    }

    aiTargets.sort((a, b) => a.remaining - b.remaining);
    opponentTargets.sort((a, b) => a.remaining - b.remaining);
    contested.sort((a, b) => a.remaining - b.remaining);

    return { aiTargets, opponentTargets, contested };
  }

  private calculatePressureMomentum(pressureSignals: GameStateEvaluation['pressureSignals']): number {
    const aiScore = pressureSignals.aiTargets.reduce((sum, target) => {
      const ratio = 1 - target.remaining / Math.max(1, target.defense);
      return sum + Math.max(0, ratio);
    }, 0);

    const opponentScore = pressureSignals.opponentTargets.reduce((sum, target) => {
      const ratio = 1 - target.remaining / Math.max(1, target.defense);
      return sum + Math.max(0, ratio);
    }, 0);

    return Math.tanh((aiScore - opponentScore) / 3);
  }

  private evaluateTruthObjective(gameState: any): number {
    const truth = typeof gameState.truth === 'number' ? gameState.truth : 50;
    const aiFaction = this.getAiFaction(gameState);

    const desiredTruth = aiFaction === 'truth' ? 80 : 20;
    const direction = aiFaction === 'truth' ? truth - desiredTruth : desiredTruth - truth;

    return Math.tanh(direction / 25);
  }

  private buildDangerSignals(params: {
    pressureSignals: GameStateEvaluation['pressureSignals'];
    truthObjective: number;
    opponentResourceThreat: number;
    threatLevel: number;
    opponentHandThreat: number;
    planningDepth: number;
  }): DangerSignals {
    const { pressureSignals, truthObjective, opponentResourceThreat, threatLevel, opponentHandThreat, planningDepth } = params;

    const imminentLoss = pressureSignals.opponentTargets.filter(target => target.remaining <= 1 || target.pressure >= target.defense);
    const imminentCapture = pressureSignals.aiTargets.filter(target => target.remaining <= 1 || target.pressure >= target.defense);

    const truthCrisis = Math.max(0, -truthObjective);
    const resourceCrunch = Math.max(0, opponentResourceThreat - 0.4);
    const opponentAggression = Math.max(0, threatLevel * 0.6 + opponentHandThreat * 0.4);

    if (planningDepth >= 3) {
      imminentLoss.forEach(target => {
        target.remaining = Math.max(0, target.remaining - 0.25);
      });
    }

    return {
      imminentCapture,
      imminentLoss,
      truthCrisis,
      resourceCrunch,
      opponentAggression
    };
  }

  private getDynamicWeights(metrics: {
    planningWeight: number;
    territorialControl: number;
    resourceAdvantage: number;
    handQuality: number;
    threatLevel: number;
    agendaProgress: number;
    pressureMomentum: number;
    truthObjective: number;
    opponentResourceThreat: number;
    opponentHandThreat: number;
  }): {
    territorial: number;
    resource: number;
    hand: number;
    threatMitigation: number;
    agenda: number;
    pressure: number;
    truth: number;
    opponentEconomy: number;
    opponentHand: number;
  } {
    const planningBias = metrics.planningWeight;

    const weights = {
      territorial: 0.2 + this.personality.territorial * 0.25,
      resource: 0.15 + this.personality.economical * 0.25,
      hand: 0.15 + planningBias * 0.2,
      threatMitigation: 0.18 + this.personality.defensiveness * 0.3,
      agenda: 0.12 + planningBias * 0.25,
      pressure: 0.15 + this.personality.territorial * 0.2,
      truth: 0.1 + (1 - this.personality.territorial) * 0.2,
      opponentEconomy: 0.1 + this.personality.defensiveness * 0.15,
      opponentHand: 0.08 + planningBias * 0.15
    } as const;

    const total = Object.values(weights).reduce((sum, value) => sum + value, 0);

    return Object.fromEntries(
      Object.entries(weights).map(([key, value]) => [key, value / total])
    ) as {
      territorial: number;
      resource: number;
      hand: number;
      threatMitigation: number;
      agenda: number;
      pressure: number;
      truth: number;
      opponentEconomy: number;
      opponentHand: number;
    };
  }

  protected countRecentPlays(gameState: any, player: 'human' | 'ai', type?: GameCard['type']): number {
    return (gameState.cardsPlayedThisRound ?? []).filter((play: any) => {
      if (play.player !== player) return false;
      if (!type) return true;
      return play.card?.type === type;
    }).length;
  }

  protected getCardMetadata(cardId: string): GameCard | undefined {
    return CARD_DATABASE.find(card => card.id === cardId);
  }

  protected getFactionGoalBonus(cardMeta: GameCard | undefined, aiFaction: 'government' | 'truth'): number {
    if (!cardMeta?.effects) {
      return 0;
    }

    const effects = cardMeta.effects;
    let bonus = 0;

    if (typeof effects.truthDelta === 'number') {
      const truthShift = Math.abs(effects.truthDelta);
      if (aiFaction === 'government' && effects.truthDelta < 0) {
        bonus += Math.min(0.6, truthShift / 5);
      } else if (aiFaction === 'truth' && effects.truthDelta > 0) {
        bonus += Math.min(0.6, truthShift / 5);
      }
    }

    if (typeof effects.pressureDelta === 'number') {
      bonus += (effects.pressureDelta / 5) * this.personality.territorial;
    }

    if (effects.ipDelta?.self) {
      bonus += (effects.ipDelta.self / 10) * this.personality.economical;
    }

    if (effects.ipDelta?.opponent) {
      bonus += (effects.ipDelta.opponent / 8) * this.personality.aggressiveness;
    }

    if (effects.discardOpponent) {
      bonus += effects.discardOpponent * 0.08 * this.personality.defensiveness;
    }

    return bonus;
  }

  // Choose the best card to play based on strategy
  selectBestPlay(gameState: any): CardPlay | null {
    if (!gameState.hand || gameState.hand.length === 0) {
      return null;
    }

    const evaluation = this.evaluateGameState(gameState);
    const possiblePlays: CardPlay[] = [];

    // Evaluate each card in hand
    for (const card of gameState.hand) {
      const plays = this.generateCardPlays(card, gameState, evaluation);
      possiblePlays.push(...plays);
    }

    if (possiblePlays.length === 0) return null;

    // Sort by priority and add some randomness based on difficulty - ENHANCED DIFFICULTY SCALING
    const randomnessFactor = this.difficulty === 'easy' ? 0.5 : 
                           this.difficulty === 'medium' ? 0.25 : 
                           this.difficulty === 'hard' ? 0.1 : 0.02; // Legendary almost no randomness

    possiblePlays.sort((a, b) => {
      const randomA = a.priority + (Math.random() * randomnessFactor);
      const randomB = b.priority + (Math.random() * randomnessFactor);
      return randomB - randomA;
    });

    return possiblePlays[0];
  }

  private evaluateHandQuality(hand: GameCard[]): number {
    if (!hand || hand.length === 0) return 0;
    
    let qualityScore = 0;
    for (const card of hand) {
      // Higher cost cards generally more powerful
      qualityScore += card.cost * 0.1;
      
      // Bonus for rare cards
      if (card.rarity === 'rare') qualityScore += 0.2;
      if (card.rarity === 'legendary') qualityScore += 0.4;
      
      // Type bonuses based on personality
      if (card.type === 'ATTACK') qualityScore += this.personality.aggressiveness * 0.3;
      if (card.type === 'DEFENSIVE') qualityScore += this.personality.defensiveness * 0.3;
      if (card.type === 'ZONE') qualityScore += this.personality.territorial * 0.3;
      if (card.type === 'MEDIA') qualityScore += (1 - this.personality.territorial) * 0.3;
    }
    
    return Math.tanh(qualityScore / hand.length);
  }

  private calculateThreatLevel(gameState: any): number {
    let threat = 0;
    
    // Enhanced threat assessment based on difficulty
    const threatMultiplier = this.difficulty === 'legendary' ? 1.5 : 
                           this.difficulty === 'hard' ? 1.2 : 
                           this.difficulty === 'medium' ? 1.0 : 0.8;
    
    // Player state control threat - more aggressive on higher difficulties
    const playerStates = gameState.states.filter((s: any) => s.owner === 'player');
    if (playerStates.length >= 5) threat += 0.2 * threatMultiplier;
    if (playerStates.length >= 7) threat += 0.3 * threatMultiplier;
    if (playerStates.length >= 9) threat += 0.4 * threatMultiplier;
    
    // Player IP threat - better resource awareness on higher difficulties
    if (gameState.ip <= -100) threat += 0.3 * threatMultiplier;
    if (gameState.ip <= -150) threat += 0.4 * threatMultiplier;
    if (gameState.ip <= -200) threat += 0.6 * threatMultiplier;
    
    // Truth level threat (depends on player faction) - enhanced awareness
    if (gameState.faction === 'truth' && gameState.truth >= 70) threat += 0.3 * threatMultiplier;
    if (gameState.faction === 'truth' && gameState.truth >= 85) threat += 0.5 * threatMultiplier;
    if (gameState.faction === 'government' && gameState.truth <= 30) threat += 0.3 * threatMultiplier;
    if (gameState.faction === 'government' && gameState.truth <= 15) threat += 0.5 * threatMultiplier;
    
    // Advanced threats only on hard+ difficulties
    if (this.difficulty === 'hard' || this.difficulty === 'legendary') {
      // Combo threat detection
      if (playerStates.length >= 6 && gameState.ip <= -100) threat += 0.3;
      
      // Card synergy threat
      const dangerousCards = gameState.lastPlayedCards?.filter(
        (card: any) => card.rarity === 'rare' || card.rarity === 'legendary'
      );
      if (dangerousCards && dangerousCards.length > 0) threat += 0.2;
    }
    
    return Math.min(1, threat);
  }

  protected generateCardPlays(card: GameCard, gameState: any, evaluation: GameStateEvaluation): CardPlay[] {
    const plays: CardPlay[] = [];
    
    switch (card.type) {
      case 'ZONE':
        return this.generateZonePlays(card, gameState, evaluation);
      case 'MEDIA':
        return this.generateMediaPlays(card, gameState, evaluation);
      case 'ATTACK':
        return this.generateAttackPlays(card, gameState, evaluation);
      case 'DEFENSIVE':
        return this.generateDefensivePlays(card, gameState, evaluation);
      default:
        return [];
    }
  }

  private generateZonePlays(card: GameCard, gameState: any, evaluation: GameStateEvaluation): CardPlay[] {
    const plays: CardPlay[] = [];
    const cardMeta = this.getCardMetadata(card.id) ?? card;
    const pressureDelta = cardMeta.effects?.pressureDelta ?? card.effects?.pressureDelta ?? 0;
    const aiFaction = this.getAiFaction(gameState);

    const chainBonus = this.countRecentPlays(gameState, 'ai', 'ZONE') * 0.12;
    const factionBonus = this.getFactionGoalBonus(cardMeta, aiFaction);

    const signalLookup = new Map(
      evaluation.pressureSignals.aiTargets.map(signal => [signal.abbreviation, signal])
    );

    for (const state of gameState.states ?? []) {
      if (state.owner === 'ai') continue;

      const signal = signalLookup.get(state.abbreviation);
      let priority = this.personality.territorial + chainBonus + factionBonus;

      // High IP and strategic positions matter more for territorial personalities
      priority += (state.baseIP ?? 0) * 0.04 * (1 + this.personality.territorial);
      priority += this.getLocationBonus(state);

      if (state.specialBonus) {
        priority += 0.15;
      }

      if (state.owner === 'player') {
        priority += this.personality.aggressiveness * 0.3;
      } else if (state.owner === 'neutral') {
        priority += 0.1;
      }

      if (signal) {
        const remainingAfterPlay = Math.max(0, signal.remaining - pressureDelta);
        if (signal.remaining <= pressureDelta) {
          priority += 0.7;
        } else if (remainingAfterPlay <= 1) {
          priority += 0.5;
        } else {
          priority += Math.max(0, (pressureDelta / Math.max(1, signal.defense)) * 0.4);
        }
      } else if (pressureDelta > 0 && state.owner !== 'ai') {
        priority += (pressureDelta / Math.max(1, state.defense ?? 1)) * 0.25;
      }

      if (evaluation.dangerSignals.opponentAggression > 0.6 && state.owner === 'player') {
        priority += 0.1;
      }

      const reasoningParts = [`Pressure ${state.name}`];
      if (signal) {
        reasoningParts.push(`remaining ${signal.remaining}`);
      } else if (pressureDelta > 0) {
        reasoningParts.push(`apply +${pressureDelta} pressure`);
      }
      if (state.specialBonus) {
        reasoningParts.push('special bonus');
      }

      plays.push({
        cardId: card.id,
        targetState: state.abbreviation,
        priority,
        reasoning: reasoningParts.join(' | ')
      });
    }

    return plays;
  }

  private generateMediaPlays(card: GameCard, gameState: any, evaluation: GameStateEvaluation): CardPlay[] {
    const cardMeta = this.getCardMetadata(card.id) ?? card;
    const aiFaction = this.getAiFaction(gameState);
    const chainCount = this.countRecentPlays(gameState, 'ai', 'MEDIA');
    const chainBonus = chainCount * 0.1;
    const factionBonus = this.getFactionGoalBonus(cardMeta, aiFaction);

    let priority = (1 - this.personality.territorial) * 0.6 + chainBonus + factionBonus;

    const truthDelta = cardMeta.effects?.truthDelta ?? 0;
    if (evaluation.truthObjective < 0 && ((aiFaction === 'truth' && truthDelta > 0) || (aiFaction === 'government' && truthDelta < 0))) {
      priority += Math.min(0.5, Math.abs(evaluation.truthObjective));
    }

    if (evaluation.resourceAdvantage < -0.2 && cardMeta.effects?.ipDelta?.self) {
      priority += 0.2;
    }

    if (evaluation.opponentHandThreat > 0.4 && cardMeta.effects?.discardOpponent) {
      priority += cardMeta.effects.discardOpponent * 0.12;
    }

    if (cardMeta.effects?.draw) {
      priority += cardMeta.effects.draw * 0.05;
    }

    return [{
      cardId: card.id,
      priority,
      reasoning: `Media influence (truth ${gameState.truth}% | chain ${chainCount})`
    }];
  }

  private generateAttackPlays(card: GameCard, gameState: any, evaluation: GameStateEvaluation): CardPlay[] {
    const cardMeta = this.getCardMetadata(card.id) ?? card;
    const aiFaction = this.getAiFaction(gameState);
    const attackChain = this.countRecentPlays(gameState, 'ai', 'ATTACK');
    const chainBonus = attackChain * 0.1;
    const factionBonus = this.getFactionGoalBonus(cardMeta, aiFaction);

    let priority = this.personality.aggressiveness + chainBonus + factionBonus;

    if (evaluation.overallScore < -0.1) priority += 0.3;
    if (evaluation.opponentResourceThreat > 0.4) priority += 0.2;
    if (evaluation.dangerSignals.opponentAggression > 0.5) priority += 0.1;

    if (cardMeta.effects?.ipDelta?.opponent) {
      priority += (cardMeta.effects.ipDelta.opponent / 6) * (0.8 + this.personality.aggressiveness);
    }

    if (cardMeta.effects?.discardOpponent) {
      priority += cardMeta.effects.discardOpponent * 0.1 * (1 + evaluation.opponentHandThreat);
    }

    if (evaluation.overallScore > 0.3) {
      priority *= 0.7;
    }

    return [{
      cardId: card.id,
      priority,
      reasoning: `Attack pressure (Player IP: ${Math.abs(gameState.ip)} | chain ${attackChain} | hand threat ${evaluation.opponentHandThreat.toFixed(2)})`
    }];
  }

  private generateDefensivePlays(card: GameCard, gameState: any, evaluation: GameStateEvaluation): CardPlay[] {
    const cardMeta = this.getCardMetadata(card.id) ?? card;
    const aiFaction = this.getAiFaction(gameState);
    const defenseChain = this.countRecentPlays(gameState, 'ai', 'DEFENSIVE');
    const chainBonus = defenseChain * 0.1;
    const factionBonus = this.getFactionGoalBonus(cardMeta, aiFaction);

    let priority = this.personality.defensiveness + chainBonus + factionBonus;

    if (evaluation.threatLevel > 0.5) priority += 0.4;
    if (evaluation.dangerSignals.truthCrisis > 0.3 && cardMeta.effects?.truthDelta) {
      priority += Math.abs(cardMeta.effects.truthDelta) * 0.05;
    }

    const recentAttacks = (gameState.cardsPlayedThisRound ?? []).filter(
      (play: any) => play.player === 'human' && play.card.type === 'ATTACK'
    );
    if (recentAttacks.length > 0) {
      priority += 0.4 + Math.min(0.2, recentAttacks.length * 0.1);
    }

    if (evaluation.dangerSignals.imminentLoss.length > 0) {
      priority += 0.3;
    }

    return [{
      cardId: card.id,
      priority,
      reasoning: `Stabilize defenses (threat ${Math.round(evaluation.threatLevel * 100)}% | chain ${defenseChain} | danger ${evaluation.dangerSignals.imminentLoss.length})`
    }];
  }

  private getLocationBonus(state: any): number {
    let bonus = 0;
    
    // Bonus for strategic states
    const strategicStates = ['CA', 'TX', 'NY', 'FL', 'DC', 'VA', 'IL'];
    if (strategicStates.includes(state.abbreviation)) bonus += 0.2;
    
    // Bonus for coastal states (easier to defend)
    const coastalStates = ['CA', 'FL', 'NY', 'TX', 'WA', 'ME', 'OR', 'NC', 'SC', 'GA', 'VA', 'MD'];
    if (coastalStates.includes(state.abbreviation)) bonus += 0.1;
    
    return bonus;
  }

  // Get AI's strategic assessment for logging
  getStrategicAssessment(gameState: any): string {
    const evaluation = this.evaluateGameState(gameState);
    
    let assessment = `${this.personality.name} Analysis: `;
    
    if (evaluation.overallScore > 0.3) {
      assessment += "Situation favorable. ";
    } else if (evaluation.overallScore < -0.3) {
      assessment += "Behind in multiple areas. ";
    } else {
      assessment += "Balanced position. ";
    }
    
    if (evaluation.threatLevel > 0.6) {
      assessment += "HIGH THREAT DETECTED! ";
    }
    
    if (evaluation.territorialControl < -0.4) {
      assessment += "Need more territory. ";
    }
    
    return assessment;
  }
}