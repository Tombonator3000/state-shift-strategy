import type { GameCard } from '@/components/game/GameHand';
import { CARD_DATABASE } from './cardDatabase';

export interface CardMetrics {
  id: string;
  name: string;
  type: string;
  rarity: string;
  currentCost: number;
  powerScore: number;
  recommendedCost: number;
  costAdjustment: number;
  usageRate: number;
  winRateWhenPlayed: number;
  balanceStatus: 'balanced' | 'underpowered' | 'overpowered';
  issues: string[];
}

export interface BalancingReport {
  totalCards: number;
  balancedCards: number;
  underpoweredCards: number;
  overpoweredCards: number;
  averageCostByType: Record<string, number>;
  averageCostByRarity: Record<string, number>;
  recommendations: string[];
  mostProblematicCards: CardMetrics[];
}

export class CardBalancer {
  private usageStats: Map<string, { timesPlayed: number; wins: number; games: number }>;
  
  constructor() {
    this.usageStats = new Map();
    this.initializeUsageStats();
  }

  private initializeUsageStats() {
    // Initialize with some baseline stats (would come from actual gameplay data)
    CARD_DATABASE.forEach(card => {
      this.usageStats.set(card.id, {
        timesPlayed: Math.floor(Math.random() * 100) + 10,
        wins: Math.floor(Math.random() * 50) + 5,
        games: Math.floor(Math.random() * 200) + 50
      });
    });
  }

  // Calculate power score based on card effects and properties
  calculatePowerScore(card: GameCard): number {
    let powerScore = 0;

    // Base power by type
    const typePowerBase: Record<string, number> = {
      'MEDIA': 3.0,     // Affects truth meter
      'ZONE': 3.5,      // Territory control
      'ATTACK': 4.0,    // Direct damage/disruption
      'DEFENSIVE': 2.5  // Reactive/protective
    };

    powerScore += typePowerBase[card.type] || 2.0;

    // Rarity multiplier
    const rarityMultiplier: Record<string, number> = {
      'common': 1.0,
      'uncommon': 1.3,
      'rare': 1.7,
      'legendary': 2.2
    };

    powerScore *= rarityMultiplier[card.rarity] || 1.0;

    // Text analysis for additional effects
    const text = card.text.toLowerCase();
    
    // Positive effects
    if (text.includes('draw')) powerScore += 0.8;
    if (text.includes('truth +')) powerScore += 1.2;
    if (text.includes('ip +') || text.includes('gain')) powerScore += 1.0;
    if (text.includes('control') || text.includes('capture')) powerScore += 1.5;
    if (text.includes('destroy') || text.includes('remove')) powerScore += 1.8;
    if (text.includes('all') || text.includes('every')) powerScore += 1.0;
    if (text.includes('opponent')) powerScore += 0.7;
    
    // Card selection/tutoring effects
    if (text.includes('search') || text.includes('choose')) powerScore += 1.2;
    if (text.includes('hand') && text.includes('return')) powerScore += 0.6;
    
    // Permanent effects
    if (text.includes('permanent') || text.includes('ongoing')) powerScore += 1.5;
    if (text.includes('each turn') || text.includes('every turn')) powerScore += 2.0;

    // Conditional effects (generally weaker)
    if (text.includes('if') || text.includes('when')) powerScore *= 0.85;
    if (text.includes('may') || text.includes('can')) powerScore *= 0.9;

    // Multiple targets
    const targetCount = (text.match(/target/g) || []).length;
    powerScore += targetCount * 0.3;

    // Numerical values in text (damage, IP, etc.)
    const numbers = text.match(/\d+/g);
    if (numbers) {
      const maxNumber = Math.max(...numbers.map(n => parseInt(n)));
      powerScore += maxNumber * 0.1;
    }

    return Math.round(powerScore * 10) / 10;
  }

  // Calculate recommended cost based on power score
  calculateRecommendedCost(powerScore: number, rarity: string): number {
    // Base cost curve
    let baseCost = Math.max(1, Math.round(powerScore * 1.2));

    // Rarity adjustments
    const rarityAdjustment: Record<string, number> = {
      'common': 0,
      'uncommon': 0.5,
      'rare': 1.0,
      'legendary': 1.5
    };

    baseCost += rarityAdjustment[rarity] || 0;

    // Ensure reasonable cost range
    return Math.max(1, Math.min(12, Math.round(baseCost)));
  }

  // Get usage statistics for a card
  getCardUsageStats(cardId: string) {
    const stats = this.usageStats.get(cardId);
    if (!stats) return { usageRate: 0, winRate: 0 };

    const usageRate = (stats.timesPlayed / stats.games) * 100;
    const winRate = stats.wins > 0 ? (stats.wins / stats.timesPlayed) * 100 : 0;

    return { usageRate, winRate };
  }

  // Analyze a single card
  analyzeCard(card: GameCard): CardMetrics {
    const powerScore = this.calculatePowerScore(card);
    const recommendedCost = this.calculateRecommendedCost(powerScore, card.rarity);
    const costAdjustment = recommendedCost - card.cost;
    const { usageRate, winRate } = this.getCardUsageStats(card.id);

    const issues: string[] = [];
    let balanceStatus: 'balanced' | 'underpowered' | 'overpowered' = 'balanced';

    // Determine balance status
    if (Math.abs(costAdjustment) <= 1) {
      balanceStatus = 'balanced';
    } else if (costAdjustment > 1) {
      balanceStatus = 'underpowered';
      issues.push(`Cost too low (should be ${recommendedCost} instead of ${card.cost})`);
    } else {
      balanceStatus = 'overpowered';
      issues.push(`Cost too high (should be ${recommendedCost} instead of ${card.cost})`);
    }

    // Check usage rates
    if (usageRate < 20) {
      issues.push(`Low usage rate (${usageRate.toFixed(1)}%)`);
      if (balanceStatus === 'balanced') balanceStatus = 'underpowered';
    } else if (usageRate > 80) {
      issues.push(`Very high usage rate (${usageRate.toFixed(1)}%)`);
      if (balanceStatus === 'balanced') balanceStatus = 'overpowered';
    }

    // Check win rates
    if (winRate < 35) {
      issues.push(`Low win rate when played (${winRate.toFixed(1)}%)`);
    } else if (winRate > 70) {
      issues.push(`High win rate when played (${winRate.toFixed(1)}%)`);
      if (balanceStatus === 'balanced') balanceStatus = 'overpowered';
    }

    // Type-specific issues
    if (card.type === 'MEDIA' && card.cost !== 4) {
      issues.push('Media cards should generally cost 4 for consistency');
    }

    return {
      id: card.id,
      name: card.name,
      type: card.type,
      rarity: card.rarity,
      currentCost: card.cost,
      powerScore,
      recommendedCost,
      costAdjustment,
      usageRate,
      winRateWhenPlayed: winRate,
      balanceStatus,
      issues
    };
  }

  // Generate comprehensive balancing report
  generateBalancingReport(): BalancingReport {
    const allMetrics = CARD_DATABASE.map(card => this.analyzeCard(card));
    
    const balanced = allMetrics.filter(m => m.balanceStatus === 'balanced').length;
    const underpowered = allMetrics.filter(m => m.balanceStatus === 'underpowered').length;
    const overpowered = allMetrics.filter(m => m.balanceStatus === 'overpowered').length;

    // Calculate average costs by type and rarity
    const avgCostByType: Record<string, number> = {};
    const avgCostByRarity: Record<string, number> = {};

    ['MEDIA', 'ZONE', 'ATTACK', 'DEFENSIVE'].forEach(type => {
      const typeCards = allMetrics.filter(m => m.type === type);
      avgCostByType[type] = typeCards.length > 0 
        ? typeCards.reduce((sum, card) => sum + card.currentCost, 0) / typeCards.length 
        : 0;
    });

    ['common', 'uncommon', 'rare', 'legendary'].forEach(rarity => {
      const rarityCards = allMetrics.filter(m => m.rarity === rarity);
      avgCostByRarity[rarity] = rarityCards.length > 0 
        ? rarityCards.reduce((sum, card) => sum + card.currentCost, 0) / rarityCards.length 
        : 0;
    });

    // Generate recommendations
    const recommendations: string[] = [];
    
    if (underpowered > overpowered * 1.5) {
      recommendations.push('Many cards appear underpowered - consider reducing costs or buffing effects');
    } else if (overpowered > underpowered * 1.5) {
      recommendations.push('Many cards appear overpowered - consider increasing costs or reducing effects');
    }

    if (avgCostByType['ATTACK'] < avgCostByType['DEFENSIVE']) {
      recommendations.push('Attack cards should generally cost more than defensive cards');
    }

    if (avgCostByRarity['legendary'] < avgCostByRarity['rare'] + 1) {
      recommendations.push('Legendary cards should have significantly higher costs than rare cards');
    }

    const highUsageCards = allMetrics.filter(m => m.usageRate > 80);
    if (highUsageCards.length > allMetrics.length * 0.1) {
      recommendations.push(`${highUsageCards.length} cards have usage rates >80% - consider nerfing`);
    }

    const lowUsageCards = allMetrics.filter(m => m.usageRate < 20);
    if (lowUsageCards.length > allMetrics.length * 0.2) {
      recommendations.push(`${lowUsageCards.length} cards have usage rates <20% - consider buffing`);
    }

    // Find most problematic cards
    const mostProblematic = allMetrics
      .filter(m => m.balanceStatus !== 'balanced')
      .sort((a, b) => {
        const aScore = Math.abs(a.costAdjustment) + (a.issues.length * 0.5);
        const bScore = Math.abs(b.costAdjustment) + (b.issues.length * 0.5);
        return bScore - aScore;
      })
      .slice(0, 10);

    return {
      totalCards: allMetrics.length,
      balancedCards: balanced,
      underpoweredCards: underpowered,
      overpoweredCards: overpowered,
      averageCostByType: avgCostByType,
      averageCostByRarity: avgCostByRarity,
      recommendations,
      mostProblematicCards: mostProblematic
    };
  }

  // Generate balanced card costs (returns updated card database)
  generateBalancedCards(): GameCard[] {
    return CARD_DATABASE.map(card => {
      const metrics = this.analyzeCard(card);
      
      // Apply cost adjustments for significantly imbalanced cards
      if (Math.abs(metrics.costAdjustment) > 1) {
        return {
          ...card,
          cost: metrics.recommendedCost
        };
      }
      
      return card;
    });
  }

  // Record card play for statistics
  recordCardPlay(cardId: string, won: boolean) {
    const stats = this.usageStats.get(cardId);
    if (stats) {
      stats.timesPlayed++;
      if (won) stats.wins++;
      stats.games++;
      this.usageStats.set(cardId, stats);
    }
  }

  // Get cards that need attention
  getCardsNeedingAttention(): CardMetrics[] {
    return CARD_DATABASE
      .map(card => this.analyzeCard(card))
      .filter(metrics => 
        metrics.balanceStatus !== 'balanced' || 
        metrics.issues.length > 0
      )
      .sort((a, b) => {
        const aPriority = Math.abs(a.costAdjustment) + a.issues.length;
        const bPriority = Math.abs(b.costAdjustment) + b.issues.length;
        return bPriority - aPriority;
      });
  }

  // Export balancing data for analysis
  exportBalancingData() {
    const report = this.generateBalancingReport();
    const cardAnalysis = CARD_DATABASE.map(card => this.analyzeCard(card));
    
    return {
      report,
      cardAnalysis,
      timestamp: new Date().toISOString(),
      version: "1.0"
    };
  }
}