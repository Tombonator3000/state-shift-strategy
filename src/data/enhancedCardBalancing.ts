// Enhanced Card Balancing System for Shadow Government v2.1E
// Updated for new type system with GameCard and CardEffects

import type { GameCard } from '@/types/cardTypes';
import type { CardEffects } from '@/types/cardEffects';
import { CARD_DATABASE } from './cardDatabase';
import { extensionManager } from './extensionSystem';

// Enhanced interfaces for the new system
export interface EnhancedCardAnalysis {
  cardId: string;
  name: string;
  type: string;
  faction: string;
  rarity: string;
  cost: number;
  
  // Analysis results
  totalUtility: number;
  utilityBreakdown: {
    truth: number;
    ip: number;
    pressure: number;
    draw: number;
    flags: number;
    developments: number;
  };
  
  classification: 'On Curve' | 'Undercosted' | 'Overcosted';
  severity: 'Low' | 'Medium' | 'High' | 'Severe';
  
  factionAlignment: {
    alignment: 'Aligned' | 'Mixed' | 'Misaligned';
    reason: string;
  };
  
  recommendation: {
    cost: number | null;
    rarity: string | null;
    reasoning: string;
  };
}

export interface EnhancedBalanceReport {
  totalCards: number;
  onCurve: number;
  undercosted: number;  
  overcosted: number;
  
  // Faction distribution
  truthCards: number;
  governmentCards: number;
  neutralCards: number;
  misalignedCards: number;
  
  // Statistics
  averageCost: number;
  averageUtility: number;
  averageCostByType: Record<string, number>;
  averageCostByRarity: Record<string, number>;
  
  // Card analyses
  cardAnalysis: EnhancedCardAnalysis[];
  
  // Global recommendations
  globalRecommendations: string[];
}

export interface SimulationReport {
  iterations: number;
  truthWinRate: number;
  governmentWinRate: number;
  drawRate: number;
  
  // Performance metrics
  averageGameLength: number;
  overusedCards: Array<{ name: string; usageRate: number; }>;
  underusedCards: Array<{ name: string; usageRate: number; }>;
  
  // Card performance data
  cardPerformance: Array<{
    cardId: string;
    name: string;
    winRate: number;
    usageRate: number;
    totalUtility: number;
  }>;
}

export interface PatchEntry {
  cardId: string;
  cardName: string;
  currentCost: number;
  recommendedCost: number;
  reasoning: string;
  severity: string;
}

// IP-equivalent utility weights for different effects
const IP_EQUIVALENT_WEIGHTS = {
  // Core effects
  truthBase: 0.8,           // Truth effects worth 0.8 IP per point
  truthDiminishing: 0.4,    // Diminishing returns after cap
  ipBase: 1.0,              // IP effects at face value
  pressureBase: 1.2,        // Pressure slightly more valuable
  drawBase: 4.0,            // Card draw worth 4 IP per card
  drawDiminishing: 2.0,     // Diminishing returns after 2 cards
  
  // Special effects
  forceDiscard: 3.0,        // Forcing opponent discard
  zoneDefenseBase: 2.0,     // Zone defense per point
  skipAction: 8.0,          // Skip opponent action
  blockAttack: 6.0,         // Block an attack
  immune: 5.0,              // Immunity effects
  zoneCostReduction: 3.0,   // Zone cost reduction
  
  // Multipliers
  developmentMultiplier: 0.7, // Permanent effects get discount
};

// Rarity-based cost budgets (IP-equivalent utility expected)
const RARITY_BUDGETS = {
  common: { min: 4, max: 8, baseline: 6 },
  uncommon: { min: 6, max: 12, baseline: 9 },
  rare: { min: 10, max: 18, baseline: 14 },
  legendary: { min: 20, max: 30, baseline: 25 }
};

// Balancing constraints
const BALANCING_CONSTRAINTS = {
  costChangeLimit: 3,       // Max ±3 IP cost change
  truthEffectCap: 15,       // Truth effects over 15% get diminishing returns
  onCurveThreshold: 0.15,   // ±15% considered "on curve"
  severeThreshold: 0.35,    // ±35% considered "severe"
  
  // Threshold scaling for Truth effects
  truthThresholdRange: 15,    // ±15 p.p. from relevant thresholds
  truthMaxScale: 2.0         // Max 2x multiplier near thresholds
};

export class EnhancedCardBalancer {
  private cards: GameCard[];

  constructor(includeExtensions: boolean = true) {
    if (includeExtensions) {
      const extensionCards = extensionManager.getAllExtensionCards();
      this.cards = [...CARD_DATABASE, ...extensionCards];
    } else {
      this.cards = CARD_DATABASE;
    }
    
    // Normalize encoding issues in text fields
    this.cards = this.cards.map(card => ({
      ...card,
      name: this.normalizeText(card.name),
      text: this.normalizeText(card.text),
      flavorTruth: this.normalizeText(card.flavorTruth),
      flavorGov: this.normalizeText(card.flavorGov)
    }));
  }

  private normalizeText(text: string | undefined): string {
    if (!text) return '';
    return text
      .replace(/Ã©/g, 'é')
      .replace(/Ã¡/g, 'á')
      .replace(/Ã­/g, 'í')
      .replace(/Ã³/g, 'ó')
      .replace(/Ãº/g, 'ú')
      .replace(/Ã±/g, 'ñ')
      .replace(/Ã /g, 'à');
  }

  private determineFaction(card: GameCard): 'Truth' | 'Government' | 'Neutral' {
    // Use the actual faction field from v2.1E system
    if (card.faction === 'truth' || card.faction === 'Truth') return 'Truth';
    if (card.faction === 'government' || card.faction === 'Government') return 'Government';
    return 'Neutral';
  }

  private analyzeCardEffects(card: GameCard): { totalUtility: number; breakdown: any } {
    const breakdown = {
      truth: 0,
      ip: 0,
      pressure: 0,
      draw: 0,
      flags: 0,
      developments: 0
    };

    const effects = card.effects;
    if (!effects) {
      return { totalUtility: 0, breakdown };
    }

    // Truth effects - use v2.1E structured data
    if (effects.truthDelta) {
      const truthValue = Math.abs(effects.truthDelta);
      const baseValue = Math.min(truthValue, BALANCING_CONSTRAINTS.truthEffectCap) * IP_EQUIVALENT_WEIGHTS.truthBase;
      const overageValue = Math.max(0, truthValue - BALANCING_CONSTRAINTS.truthEffectCap) * IP_EQUIVALENT_WEIGHTS.truthDiminishing;
      breakdown.truth = baseValue + overageValue;
    }

    // IP effects
    if (effects.ipDelta) {
      if (effects.ipDelta.self) {
        breakdown.ip += effects.ipDelta.self * IP_EQUIVALENT_WEIGHTS.ipBase;
      }
      if (effects.ipDelta.opponent) {
        // Negative IP for opponent is positive for us
        breakdown.ip += Math.abs(effects.ipDelta.opponent) * IP_EQUIVALENT_WEIGHTS.ipBase;
      }
    }

    // Pressure effects  
    if (effects.pressureDelta) {
      breakdown.pressure += Math.abs(effects.pressureDelta) * IP_EQUIVALENT_WEIGHTS.pressureBase;
    }

    // Draw effects
    if (effects.draw) {
      const drawValue = effects.draw;
      if (drawValue <= 2) {
        breakdown.draw += drawValue * IP_EQUIVALENT_WEIGHTS.drawBase;
      } else {
        breakdown.draw += 2 * IP_EQUIVALENT_WEIGHTS.drawBase + 
                        (drawValue - 2) * IP_EQUIVALENT_WEIGHTS.drawDiminishing;
      }
    }

    // Discard effects
    if (effects.discardOpponent) {
      breakdown.flags += effects.discardOpponent * IP_EQUIVALENT_WEIGHTS.forceDiscard;
    }

    // Zone defense effects
    if (effects.zoneDefense) {
      breakdown.flags += effects.zoneDefense * IP_EQUIVALENT_WEIGHTS.zoneDefenseBase;
    }

    // Conditional effects - simplified evaluation
    if (effects.conditional) {
      const conditionalEffects = Array.isArray(effects.conditional) ? effects.conditional : [effects.conditional];
      for (const condition of conditionalEffects) {
        if (condition.then) {
          const subAnalysis = this.analyzeCardEffects({ ...card, effects: condition.then });
          // Conditional effects get 60% value due to uncertainty
          Object.keys(breakdown).forEach(key => {
            breakdown[key] += subAnalysis.breakdown[key] * 0.6;
          });
        }
      }
    }

    const totalUtility = Object.values(breakdown).reduce((sum, val) => sum + val, 0);
    
    return { totalUtility, breakdown };
  }

  private analyzeFactionAlignment(card: GameCard): { alignment: string; reason: string } {
    const faction = this.determineFaction(card);
    const { totalUtility } = this.analyzeCardEffects(card);
    const effects = card.effects;

    if (!effects) {
      return { alignment: 'Aligned', reason: 'No effects to analyze' };
    }

    // Check for severe misalignment using structured effects
    if (faction === 'Truth' && effects.truthDelta && effects.truthDelta < 0) {
      if (totalUtility <= 0) {
        return { 
          alignment: 'Misaligned' as const, 
          reason: 'Truth card with negative Truth effect and insufficient compensation' 
        };
      } else if (totalUtility < 5) {
        return { 
          alignment: 'Mixed' as const, 
          reason: 'Truth card with negative Truth effect but some compensating utility' 
        };
      }
    }

    if (faction === 'Government' && effects.truthDelta && effects.truthDelta > 0) {
      if (totalUtility <= 0) {
        return { 
          alignment: 'Misaligned' as const, 
          reason: 'Government card with positive Truth effect and insufficient compensation' 
        };
      } else if (totalUtility < 5) {
        return { 
          alignment: 'Mixed' as const, 
          reason: 'Government card with positive Truth effect but some compensating utility' 
        };
      }
    }

    return { alignment: 'Aligned' as const, reason: 'Effects align with faction goals' };
  }

  private calculateOptimalCost(card: GameCard, totalUtility: number): number {
    const budget = RARITY_BUDGETS[card.rarity as keyof typeof RARITY_BUDGETS];
    if (!budget) return card.cost;

    // Convert utility to cost (IP)
    const optimalCost = Math.round(totalUtility);
    
    // Constrain to rarity bounds
    return Math.max(budget.min, Math.min(budget.max, optimalCost));
  }

  private generateRecommendation(card: GameCard, analysis: any): { cost: number | null; rarity: string | null; reasoning: string } {
    const { totalUtility } = this.analyzeCardEffects(card);
    const currentBudget = RARITY_BUDGETS[card.rarity as keyof typeof RARITY_BUDGETS];
    
    if (!currentBudget) {
      return { cost: null, rarity: null, reasoning: 'Unknown rarity' };
    }

    const utilityDifference = totalUtility - currentBudget.baseline;
    const percentageDiff = Math.abs(utilityDifference) / currentBudget.baseline;

    if (percentageDiff <= BALANCING_CONSTRAINTS.onCurveThreshold) {
      return { cost: null, rarity: null, reasoning: 'Card is balanced within acceptable range' };
    }

    const optimalCost = this.calculateOptimalCost(card, totalUtility);
    const costChange = optimalCost - card.cost;

    if (Math.abs(costChange) > BALANCING_CONSTRAINTS.costChangeLimit) {
      const cappedChange = Math.sign(costChange) * BALANCING_CONSTRAINTS.costChangeLimit;
      const newCost = card.cost + cappedChange;
      return { 
        cost: newCost, 
        rarity: null, 
        reasoning: `Major rebalancing needed: utility suggests ${optimalCost} IP, but limited to ±${BALANCING_CONSTRAINTS.costChangeLimit} change` 
      };
    }

    return { 
      cost: optimalCost, 
      rarity: null, 
      reasoning: `Utility analysis suggests ${costChange > 0 ? 'increase' : 'decrease'} of ${Math.abs(costChange)} IP` 
    };
  }

  private classifyCard(card: GameCard, totalUtility: number): 'On Curve' | 'Undercosted' | 'Overcosted' {
    const budget = RARITY_BUDGETS[card.rarity as keyof typeof RARITY_BUDGETS];
    if (!budget) return 'On Curve';

    const utilityDifference = totalUtility - budget.baseline;
    const percentageDiff = utilityDifference / budget.baseline;

    if (Math.abs(percentageDiff) <= BALANCING_CONSTRAINTS.onCurveThreshold) {
      return 'On Curve';
    }

    if (percentageDiff > 0) {
      return 'Undercosted';
    }

    return 'Overcosted';
  }

  public generateEnhancedReport(): EnhancedBalanceReport {
    const cardAnalyses: EnhancedCardAnalysis[] = [];
    
    for (const card of this.cards) {
      const { totalUtility, breakdown } = this.analyzeCardEffects(card);
      const faction = this.determineFaction(card);
      const alignment = this.analyzeFactionAlignment(card);
      const classification = this.classifyCard(card, totalUtility);
      const recommendation = this.generateRecommendation(card, { totalUtility, classification });
      
      // Determine severity
      let severity: 'Low' | 'Medium' | 'High' | 'Severe' = 'Low';
      if (alignment.alignment === 'Misaligned') {
        severity = 'Severe';
      } else {
        const budget = RARITY_BUDGETS[card.rarity as keyof typeof RARITY_BUDGETS];
        if (budget) {
          const percentageDiff = Math.abs(totalUtility - budget.baseline) / budget.baseline;
          if (percentageDiff > BALANCING_CONSTRAINTS.severeThreshold) {
            severity = 'Severe';
          } else if (percentageDiff > 0.25) {
            severity = 'High';
          } else if (percentageDiff > BALANCING_CONSTRAINTS.onCurveThreshold) {
            severity = 'Medium';
          }
        }
      }

      cardAnalyses.push({
        cardId: card.id,
        name: card.name,
        type: card.type,
        faction: faction,
        rarity: card.rarity || 'common',
        cost: card.cost,
        totalUtility,
        utilityBreakdown: breakdown,
        classification,
        severity,
        factionAlignment: {
          alignment: alignment.alignment as 'Aligned' | 'Mixed' | 'Misaligned',
          reason: alignment.reason
        },
        recommendation
      });
    }

    // Calculate report statistics
    const onCurve = cardAnalyses.filter(c => c.classification === 'On Curve').length;
    const undercosted = cardAnalyses.filter(c => c.classification === 'Undercosted').length;
    const overcosted = cardAnalyses.filter(c => c.classification === 'Overcosted').length;
    
    const truthCards = cardAnalyses.filter(c => c.faction === 'Truth').length;
    const governmentCards = cardAnalyses.filter(c => c.faction === 'Government').length;
    const neutralCards = cardAnalyses.filter(c => c.faction === 'Neutral').length;
    const misalignedCards = cardAnalyses.filter(c => c.factionAlignment.alignment === 'Misaligned').length;

    const averageCost = cardAnalyses.reduce((sum, c) => sum + c.cost, 0) / cardAnalyses.length;
    const averageUtility = cardAnalyses.reduce((sum, c) => sum + c.totalUtility, 0) / cardAnalyses.length;

    // Group by type and rarity for averages
    const costByType: Record<string, number> = {};
    const costByRarity: Record<string, number> = {};
    const typeGroups: Record<string, number[]> = {};
    const rarityGroups: Record<string, number[]> = {};

    cardAnalyses.forEach(card => {
      if (!typeGroups[card.type]) typeGroups[card.type] = [];
      if (!rarityGroups[card.rarity]) rarityGroups[card.rarity] = [];
      
      typeGroups[card.type].push(card.cost);
      rarityGroups[card.rarity].push(card.cost);
    });

    Object.keys(typeGroups).forEach(type => {
      costByType[type] = typeGroups[type].reduce((sum, cost) => sum + cost, 0) / typeGroups[type].length;
    });

    Object.keys(rarityGroups).forEach(rarity => {
      costByRarity[rarity] = rarityGroups[rarity].reduce((sum, cost) => sum + cost, 0) / rarityGroups[rarity].length;
    });

    // Generate global recommendations
    const globalRecommendations = [];
    
    if (undercosted > overcosted * 1.5) {
      globalRecommendations.push('Many cards are undercosted - consider global cost increases');
    }
    if (overcosted > undercosted * 1.5) {
      globalRecommendations.push('Many cards are overcosted - consider global cost reductions');
    }
    if (misalignedCards > cardAnalyses.length * 0.1) {
      globalRecommendations.push('High faction misalignment detected - review card design');
    }

    return {
      totalCards: cardAnalyses.length,
      onCurve,
      undercosted,
      overcosted,
      truthCards,
      governmentCards,
      neutralCards,
      misalignedCards,
      averageCost,
      averageUtility,
      averageCostByType: costByType,
      averageCostByRarity: costByRarity,
      cardAnalysis: cardAnalyses,
      globalRecommendations
    };
  }

  public runEnhancedSimulation(iterations: number = 1000): SimulationReport {
    const cardUsage: Record<string, { played: number; wonWithCard: number; }> = {};
    
    // Initialize usage tracking
    this.cards.forEach(card => {
      cardUsage[card.id] = { played: 0, wonWithCard: 0 };
    });

    let truthWins = 0;
    let governmentWins = 0;
    let draws = 0;
    let totalGameLength = 0;

    for (let i = 0; i < iterations; i++) {
      // Simulate a game
      let truthLevel = 50; // Start at neutral
      let gameLength = 0;
      const maxTurns = 20;
      const cardsPlayedThisGame: string[] = [];

      for (let turn = 0; turn < maxTurns; turn++) {
        gameLength++;
        
        // Simulate 2-3 card plays per turn
        const cardsThisTurn = 2 + Math.floor(Math.random() * 2);
        
        for (let play = 0; play < cardsThisTurn; play++) {
          const randomCard = this.cards[Math.floor(Math.random() * this.cards.length)];
          cardsPlayedThisGame.push(randomCard.id);
          cardUsage[randomCard.id].played++;
          
          // Apply effects based on enhanced analysis
          const { totalUtility, breakdown } = this.analyzeCardEffects(randomCard);
          
          // Apply truth effects
          if (breakdown.truth !== 0) {
            const truthChange = breakdown.truth / IP_EQUIVALENT_WEIGHTS.truthBase;
            truthLevel = Math.max(0, Math.min(100, truthLevel + truthChange));
          }
          
          // Check for game end conditions
          if (truthLevel >= 85) {
            truthWins++;
            cardsPlayedThisGame.forEach(cardId => cardUsage[cardId].wonWithCard++);
            break;
          } else if (truthLevel <= 15) {
            governmentWins++;
            cardsPlayedThisGame.forEach(cardId => cardUsage[cardId].wonWithCard++);
            break;
          }
        }

        // Early exit if game ended
        if (truthLevel >= 85 || truthLevel <= 15) break;
      }

      // If no winner after max turns, it's a draw
      if (truthLevel < 85 && truthLevel > 15) {
        draws++;
      }

      totalGameLength += gameLength;
    }

    // Analyze card performance
    const cardPerformanceData = Object.entries(cardUsage).map(([cardId, stats]) => {
      const card = this.cards.find(c => c.id === cardId);
      const { totalUtility } = this.analyzeCardEffects(card!);
      const winRate = stats.played > 0 ? stats.wonWithCard / stats.played : 0;
      const usageRate = stats.played / iterations;
      
      return {
        cardId,
        name: card?.name || 'Unknown',
        totalUtility,
        winRate,
        usageRate,
      };
    });

    const overusedCards = cardPerformanceData
      .filter(c => c.usageRate > 0.8) // High usage threshold
      .sort((a, b) => b.usageRate - a.usageRate)
      .slice(0, 10)
      .map(c => ({ name: c.name, usageRate: c.usageRate }));

    const underusedCards = cardPerformanceData
      .filter(c => c.usageRate < 0.1) // Low usage threshold
      .sort((a, b) => a.usageRate - b.usageRate)
      .slice(0, 10)
      .map(c => ({ name: c.name, usageRate: c.usageRate }));

    return {
      iterations,
      truthWinRate: (truthWins / iterations) * 100,
      governmentWinRate: (governmentWins / iterations) * 100,
      drawRate: (draws / iterations) * 100,
      averageGameLength: totalGameLength / iterations,
      overusedCards,
      underusedCards,
      cardPerformance: cardPerformanceData
    };
  }

  public generatePatchExport(format: 'json' | 'csv' | 'txt' = 'json'): string {
    const report = this.generateEnhancedReport();
    const patches = report.cardAnalysis
      .filter(card => card.recommendation.cost !== null)
      .map(card => ({
        cardId: card.cardId,
        cardName: card.name,
        currentCost: card.cost,
        recommendedCost: card.recommendation.cost!,
        reasoning: card.recommendation.reasoning,
        severity: card.severity
      }));

    switch (format) {
      case 'csv':
        const csvHeader = 'cardId,cardName,currentCost,recommendedCost,reasoning,severity';
        const csvRows = patches.map(p => 
          `${p.cardId},"${p.cardName}",${p.currentCost},${p.recommendedCost},"${p.reasoning}",${p.severity}`
        );
        return [csvHeader, ...csvRows].join('\n');

      case 'txt':
        return patches.map(p => 
          `${p.cardName} (${p.cardId}): ${p.currentCost} → ${p.recommendedCost} IP\n` +
          `  Reason: ${p.reasoning}\n` +
          `  Severity: ${p.severity}\n`
        ).join('\n');

      default:
        return JSON.stringify(patches, null, 2);
    }
  }

  public exportFullAnalysis(): any {
    const report = this.generateEnhancedReport();
    const simulation = this.runEnhancedSimulation();
    const patches = this.generatePatchExport('json');

    return {
      timestamp: new Date().toISOString(),
      version: '2.1E',
      report,
      simulation,
      patches: JSON.parse(patches)
    };
  }
}

// Public utility functions
export function analyzeCardBalanceEnhanced(includeExtensions: boolean = true): EnhancedBalanceReport {
  const balancer = new EnhancedCardBalancer(includeExtensions);
  return balancer.generateEnhancedReport();
}

export function runBalanceSimulationEnhanced(iterations: number = 1000, includeExtensions: boolean = true): SimulationReport {
  const balancer = new EnhancedCardBalancer(includeExtensions);
  return balancer.runEnhancedSimulation(iterations);
}