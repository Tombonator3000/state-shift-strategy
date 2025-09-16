import type { GameCard } from '@/types/cardTypes';
import { CARD_DATABASE } from './cardDatabase';
import { AIStrategist, type AIDifficulty, type AIPersonality, type CardPlay } from './aiStrategy';

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
interface EnhancedCardPlay {
  cardId: string;
  targetState?: string;
  priority: number;
  reasoning: string;
  synergies: CardSynergy[];
  deceptionValue: number;
  threatResponse: boolean;
}

export class EnhancedAIStrategist extends AIStrategist {
  private cardSynergies: CardSynergy[] = [];
  private deceptionState: DeceptionState;
  private playerBehaviorPattern: string[] = [];
  private threatHistory: { turn: number; threat: number; response: string }[] = [];

  constructor(difficulty: AIDifficulty = 'medium') {
    super(difficulty);
    this.initializeCardSynergies();
    this.deceptionState = {
      fakeTargets: [],
      misdirectionLevel: this.personality.riskTolerance * 0.3,
      bluffHistory: [],
      playerPattern: []
    };
  }

  // Monte Carlo Tree Search for optimal play selection
  public selectOptimalPlay(gameState: any): EnhancedCardPlay | null {
    if (!gameState.hand || gameState.hand.length === 0) return null;

    // Use MCTS only on hard+ difficulties due to computational cost
    if (this.personality.planningDepth >= 3) {
      return this.runMCTS(gameState, this.personality.planningDepth * 500); // iterations
    }

    // Fallback to enhanced heuristic search
    return this.selectBestPlayWithSynergies(gameState);
  }

  private runMCTS(gameState: any, iterations: number): EnhancedCardPlay | null {
    const root = this.createMCTSNode(gameState, null);
    
    for (let i = 0; i < iterations; i++) {
      // Selection
      let node = this.selectNode(root);
      
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
    const bestChild = root.children.reduce((best, child) => 
      child.visits > best.visits ? child : best
    );

    return bestChild?.move as EnhancedCardPlay;
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
    const move = node.unexploredMoves.pop()!;
    const newGameState = this.simulateMove(node.gameState, move);
    
    const child = this.createMCTSNode(newGameState, move);
    child.parent = node;
    node.children.push(child);
    
    return child;
  }

  private simulateGame(gameState: any): number {
    // Quick simulation to estimate win probability
    let currentState = { ...gameState };
    let moves = 0;
    const maxMoves = 10; // Limit simulation depth
    
    while (moves < maxMoves && !this.isGameOver(currentState)) {
      const move = this.selectRandomMove(currentState);
      if (move) {
        currentState = this.simulateMove(currentState, move);
      }
      moves++;
    }
    
    return this.evaluateGameState(currentState).overallScore;
  }

  private backpropagate(node: MCTSNode, reward: number): void {
    while (node) {
      node.visits++;
      if (reward > 0) node.wins += reward;
      node = node.parent!;
    }
  }

  // Enhanced play selection with synergy recognition
  private selectBestPlayWithSynergies(gameState: any): EnhancedCardPlay | null {
    const possiblePlays = this.generateAllPossiblePlays(gameState);
    
    // Enhance each play with synergy and deception analysis
    const enhancedPlays: EnhancedCardPlay[] = possiblePlays.map(play => {
      const synergies = this.findCardSynergies(play.cardId, gameState.hand);
      const deceptionValue = this.calculateDeceptionValue(play, gameState);
      const threatResponse = this.isThreatResponse(play, gameState);
      
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
      
      return {
        ...play,
        synergies,
        deceptionValue,
        threatResponse,
        priority: adjustedPriority
      } as EnhancedCardPlay;
    });

    if (enhancedPlays.length === 0) return null;

    // Add controlled randomness based on difficulty
    const randomnessFactor = this.personality.planningDepth >= 4 ? 0.05 : 0.15;
    
    enhancedPlays.sort((a, b) => {
      const randomA = a.priority + (Math.random() * randomnessFactor);
      const randomB = b.priority + (Math.random() * randomnessFactor);
      return randomB - randomA;
    });

    return enhancedPlays[0];
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

  private findCardSynergies(cardId: string, hand: GameCard[]): CardSynergy[] {
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
    
    return synergies;
  }

  // Advanced Threat Assessment
  private isThreatResponse(play: CardPlay, gameState: any): boolean {
    const evaluation = this.evaluateGameState(gameState);
    
    // Check if this play directly counters a recent player action
    const recentPlayerMoves = gameState.cardsPlayedThisRound?.filter(
      (p: any) => p.player === 'human'
    ) || [];
    
    if (recentPlayerMoves.length === 0) return false;
    
    // Enhanced threat pattern recognition
    const lastPlayerCard = recentPlayerMoves[recentPlayerMoves.length - 1];
    
    // Direct counter patterns
    if (lastPlayerCard.card.type === 'ATTACK' && play.cardId.includes('defensive')) return true;
    if (lastPlayerCard.card.type === 'MEDIA' && play.cardId.includes('counter')) return true;
    if (lastPlayerCard.card.type === 'ZONE' && play.targetState === lastPlayerCard.targetState) return true;
    
    // Indirect threat response
    if (evaluation.threatLevel > 0.6 && (play.cardId.includes('defensive') || play.cardId.includes('counter'))) {
      return true;
    }
    
    return false;
  }

  // Deception and Bluffing Mechanics
  private calculateDeceptionValue(play: CardPlay, gameState: any): number {
    let deceptionValue = 0;
    
    // Only use deception on harder difficulties
    if (this.personality.planningDepth < 3) return 0;
    
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
    if (this.isCounterExpectationPlay(play, gameState)) {
      deceptionValue += 0.25;
    }
    
    return deceptionValue * this.deceptionState.misdirectionLevel;
  }

  private analyzePlayerPattern(gameState: any): string {
    // Analyze recent player moves to identify patterns
    const recentMoves = gameState.cardsPlayedThisRound?.filter(
      (p: any) => p.player === 'human'
    ) || [];
    
    if (recentMoves.length < 2) return 'insufficient_data';
    
    const moveTypes = recentMoves.map((m: any) => m.card.type);
    
    // Detect patterns
    if (moveTypes.every((t: string) => t === 'ZONE')) return 'territorial_focus';
    if (moveTypes.every((t: string) => t === 'MEDIA')) return 'propaganda_focus';
    if (moveTypes.every((t: string) => t === 'ATTACK')) return 'aggressive_focus';
    if (moveTypes.includes('ATTACK') && moveTypes.includes('ZONE')) return 'aggressive_expansion';
    
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
      default:
        return false;
    }
  }

  private isCounterExpectationPlay(play: CardPlay, gameState: any): boolean {
    // Advanced psychological play - do the opposite of what player expects
    const evaluation = this.evaluateGameState(gameState);
    
    // When winning, play unexpectedly aggressive moves
    if (evaluation.overallScore > 0.3 && play.cardId.includes('attack')) {
      return true;
    }
    
    // When losing, play unexpectedly defensive moves
    if (evaluation.overallScore < -0.3 && play.cardId.includes('defensive')) {
      return true;
    }
    
    return false;
  }

  // Helper methods for MCTS
  private generateAllPossiblePlays(gameState: any): CardPlay[] {
    const plays: CardPlay[] = [];
    const evaluation = this.evaluateGameState(gameState);
    
    for (const card of gameState.hand || []) {
      const cardPlays = this.generateCardPlays(card, gameState, evaluation);
      plays.push(...cardPlays);
    }
    
    return plays;
  }

  private simulateMove(gameState: any, move: CardPlay): any {
    // Simplified simulation of game state after move
    const newState = { ...gameState };
    
    // Remove card from hand
    newState.hand = newState.hand.filter((c: any) => c.id !== move.cardId);
    
    // Apply move effects (simplified)
    if (move.targetState) {
      const state = newState.states.find((s: any) => s.abbreviation === move.targetState);
      if (state) {
        state.pressure = (state.pressure || 0) + 1;
        if (state.pressure >= 2 && state.owner === 'neutral') {
          state.owner = 'ai';
        }
      }
    }
    
    // Adjust IP (simplified)
    const card = CARD_DATABASE.find(c => c.id === move.cardId);
    if (card) {
      newState.aiIP = (newState.aiIP || 0) - card.cost;
    }
    
    return newState;
  }

  private selectRandomMove(gameState: any): CardPlay | null {
    const moves = this.generateAllPossiblePlays(gameState);
    return moves.length > 0 ? moves[Math.floor(Math.random() * moves.length)] : null;
  }

  private isGameOver(gameState: any): boolean {
    // Simplified game over detection
    const aiStates = gameState.states?.filter((s: any) => s.owner === 'ai').length || 0;
    const playerStates = gameState.states?.filter((s: any) => s.owner === 'player').length || 0;
    
    return aiStates >= 10 || playerStates >= 10 || gameState.truth <= 0 || gameState.truth >= 100;
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