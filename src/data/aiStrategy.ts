import type { GameCard } from '@/components/game/GameHand';
import { CARD_DATABASE } from './cardDatabase';
import { USA_STATES } from './usaStates';
import { EnhancedAIStrategist } from './enhancedAIStrategy';

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

interface GameStateEvaluation {
  territorialControl: number;
  resourceAdvantage: number;
  handQuality: number;
  threatLevel: number;
  agendaProgress: number;
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

  // Factory method to create appropriate AI strategist based on difficulty
  public static createStrategist(difficulty: AIDifficulty): AIStrategist {
    // Use enhanced AI for hard+ difficulties
    if (difficulty === 'hard' || difficulty === 'legendary') {
      return new EnhancedAIStrategist(difficulty);
    }
    return new AIStrategist(difficulty);
  }

  // Evaluate the current game state from AI perspective
  evaluateGameState(gameState: any): GameStateEvaluation {
    const aiControlledStates = gameState.states.filter((state: any) => state.owner === 'ai');
    const playerControlledStates = gameState.states.filter((state: any) => state.owner === 'player');
    
    // Territorial control (-1 to 1, negative means player advantage)
    const territorialControl = (aiControlledStates.length - playerControlledStates.length) / 25;
    
    // Resource advantage (normalized around typical mid-game values)
    const resourceAdvantage = Math.tanh((gameState.ip - 50) / 100);
    
    // Hand quality (simplified - count high-value cards)
    const handQuality = this.evaluateHandQuality(gameState.hand);
    
    // Threat level (how close player is to winning)
    const threatLevel = this.calculateThreatLevel(gameState);
    
    // Agenda progress (how close AI is to completing secret agenda)
    const agendaProgress = gameState.secretAgenda ? 
      (gameState.secretAgenda.progress / gameState.secretAgenda.target) : 0;
    
    const overallScore = territorialControl * 0.3 + 
                        resourceAdvantage * 0.2 + 
                        handQuality * 0.2 + 
                        -threatLevel * 0.2 + 
                        agendaProgress * 0.1;

    return {
      territorialControl,
      resourceAdvantage,
      handQuality,
      threatLevel,
      agendaProgress,
      overallScore
    };
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
    
    // Identify strategic targets
    const neutralStates = gameState.states.filter((s: any) => s.owner === 'neutral');
    const playerStates = gameState.states.filter((s: any) => s.owner === 'player');
    
    // Prioritize high-value neutral states
    for (const state of neutralStates) {
      let priority = this.personality.territorial;
      
      // Bonus for high IP states
      priority += state.baseIP * 0.1;
      
      // Bonus for states with special bonuses
      if (state.specialBonus) priority += 0.2;
      
      // Penalty for high defense (harder to capture)
      priority -= state.defense * 0.05;
      
      // Strategic location bonuses
      priority += this.getLocationBonus(state);
      
      plays.push({
        cardId: card.id,
        targetState: state.abbreviation,
        priority,
        reasoning: `Target ${state.name} for territorial expansion (IP: ${state.baseIP}, Defense: ${state.defense})`
      });
    }

    // Consider contesting player states if aggressive enough
    if (this.personality.aggressiveness > 0.6) {
      for (const state of playerStates) {
        let priority = this.personality.aggressiveness * 0.7;
        priority += state.baseIP * 0.05;
        
        plays.push({
          cardId: card.id,
          targetState: state.abbreviation,
          priority,
          reasoning: `Contest player control of ${state.name}`
        });
      }
    }

    return plays;
  }

  private generateMediaPlays(card: GameCard, gameState: any, evaluation: GameStateEvaluation): CardPlay[] {
    let priority = (1 - this.personality.territorial) * 0.8;
    
    // Higher priority if we're behind in resources
    if (evaluation.resourceAdvantage < -0.3) priority += 0.3;
    
    // Higher priority if it helps our win condition
    if (gameState.faction === 'government' && gameState.truth > 50) priority += 0.4;
    if (gameState.faction === 'truth' && gameState.truth < 50) priority += 0.4;

    return [{
      cardId: card.id,
      priority,
      reasoning: `Media play to influence public opinion (Current Truth: ${gameState.truth}%)`
    }];
  }

  private generateAttackPlays(card: GameCard, gameState: any, evaluation: GameStateEvaluation): CardPlay[] {
    let priority = this.personality.aggressiveness;
    
    // Higher priority if player is ahead
    if (evaluation.overallScore < -0.2) priority += 0.3;
    
    // Higher priority if player has high IP
    if (gameState.ip < -100) priority += 0.4;
    
    // Lower priority if we're already winning
    if (evaluation.overallScore > 0.3) priority *= 0.6;

    return [{
      cardId: card.id,
      priority,
      reasoning: `Attack to disrupt player advantage (Player IP: ${Math.abs(gameState.ip)})`
    }];
  }

  private generateDefensivePlays(card: GameCard, gameState: any, evaluation: GameStateEvaluation): CardPlay[] {
    let priority = this.personality.defensiveness;
    
    // Much higher priority if under high threat
    if (evaluation.threatLevel > 0.5) priority += 0.5;
    
    // Higher priority if player just played an attack
    const recentAttacks = gameState.cardsPlayedThisRound?.filter(
      (play: any) => play.player === 'human' && play.card.type === 'ATTACK'
    );
    if (recentAttacks && recentAttacks.length > 0) priority += 0.4;

    return [{
      cardId: card.id,
      priority,
      reasoning: `Defensive play to counter threats (Threat Level: ${Math.round(evaluation.threatLevel * 100)}%)`
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