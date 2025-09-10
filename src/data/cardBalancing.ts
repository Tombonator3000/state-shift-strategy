// Card Balancing System for Shadow Government
// Analyzes and provides feedback on card balance

import { CARD_DATABASE } from './cardDatabase';
import { extensionManager } from './extensionSystem';

export interface CardBalance {
  cardId: string;
  name: string;
  type: string;
  rarity: string;
  cost: number;
  effectValue: number;
  costEfficiencyRatio: number;
  balanceStatus: 'balanced' | 'undercosted' | 'overcosted';
  recommendations: string[];
}

export interface BalanceReport {
  timestamp: string;
  totalCards: number;
  balancedCards: number;
  undercostCards: number;
  overcostCards: number;
  cardAnalysis: CardBalance[];
  recommendations: string[];
}

// For compatibility with existing dashboard
export interface CardMetrics {
  id: string;
  name: string;
  type: string;
  rarity: string;
  currentCost: number;
  recommendedCost: number;
  powerScore: number;
  balanceStatus: 'balanced' | 'underpowered' | 'overpowered';
  usageRate: number;
  winRateWhenPlayed: number;
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
}

export class CardBalancer {
  private cards: any[];

  constructor(includeExtensions: boolean = true) {
    if (includeExtensions) {
      const extensionCards = extensionManager.getAllExtensionCards();
      this.cards = [...CARD_DATABASE, ...extensionCards];
    } else {
      this.cards = CARD_DATABASE;
    }
  }

  generateBalancingReport(): BalancingReport {
    const analysis = analyzeCardBalance(this.cards);
    
    // Calculate averages by type and rarity
    const costsByType: Record<string, number[]> = {};
    const costsByRarity: Record<string, number[]> = {};

    this.cards.forEach(card => {
      if (!costsByType[card.type]) costsByType[card.type] = [];
      if (!costsByRarity[card.rarity]) costsByRarity[card.rarity] = [];
      
      costsByType[card.type].push(card.cost);
      costsByRarity[card.rarity].push(card.cost);
    });

    const averageCostByType: Record<string, number> = {};
    Object.entries(costsByType).forEach(([type, costs]) => {
      averageCostByType[type] = costs.reduce((a, b) => a + b, 0) / costs.length;
    });

    const averageCostByRarity: Record<string, number> = {};
    Object.entries(costsByRarity).forEach(([rarity, costs]) => {
      averageCostByRarity[rarity] = costs.reduce((a, b) => a + b, 0) / costs.length;
    });

    return {
      totalCards: analysis.totalCards,
      balancedCards: analysis.balancedCards,
      underpoweredCards: analysis.overcostCards, // Overcosted -> underpowered
      overpoweredCards: analysis.undercostCards, // Undercosted -> overpowered
      averageCostByType,
      averageCostByRarity,
      recommendations: analysis.recommendations
    };
  }

  getCardsNeedingAttention(): CardMetrics[] {
    const analysis = analyzeCardBalance(this.cards);
    
    return analysis.cardAnalysis
      .filter(card => card.balanceStatus !== 'balanced')
      .map(card => {
        const optimalCost = calculateOptimalCost(card.type, card.rarity, card.effectValue);
        
        return {
          id: card.cardId,
          name: card.name,
          type: card.type,
          rarity: card.rarity,
          currentCost: card.cost,
          recommendedCost: optimalCost,
          powerScore: Math.min(10, card.effectValue / (card.cost || 1)),
          balanceStatus: card.balanceStatus === 'undercosted' ? 'overpowered' : 
                        card.balanceStatus === 'overcosted' ? 'underpowered' : 'balanced',
          usageRate: Math.random() * 100, // Mock data - would come from game analytics
          winRateWhenPlayed: 45 + Math.random() * 20, // Mock data
          issues: card.recommendations
        };
      });
  }

  exportBalancingData() {
    const report = this.generateBalancingReport();
    const cardsNeedingAttention = this.getCardsNeedingAttention();
    
    return {
      report,
      cardsNeedingAttention,
      timestamp: new Date().toISOString(),
      version: '1.0'
    };
  }
}

// Base cost curves for different rarities and effects
const COST_CURVES = {
  MEDIA: {
    common: { baseCost: 4, effectMultiplier: 1.0 }, // Truth ±10 = 4 cost
    uncommon: { baseCost: 6, effectMultiplier: 1.5 }, // Truth ±20 = 6 cost  
    rare: { baseCost: 8, effectMultiplier: 2.0 }, // Truth ±30 = 8 cost
    legendary: { baseCost: 12, effectMultiplier: 3.0 } // Truth ±50+ = 12+ cost
  },
  ZONE: {
    common: { baseCost: 5, effectMultiplier: 1.0 }, // +1 Pressure = 5 cost
    uncommon: { baseCost: 7, effectMultiplier: 1.4 },
    rare: { baseCost: 9, effectMultiplier: 1.8 },
    legendary: { baseCost: 12, effectMultiplier: 2.2 }
  },
  ATTACK: {
    common: { baseCost: 6, effectMultiplier: 1.0 },
    uncommon: { baseCost: 8, effectMultiplier: 1.3 },
    rare: { baseCost: 11, effectMultiplier: 1.6 },
    legendary: { baseCost: 15, effectMultiplier: 2.0 }
  },
  DEFENSIVE: {
    common: { baseCost: 5, effectMultiplier: 1.0 },
    uncommon: { baseCost: 7, effectMultiplier: 1.3 },
    rare: { baseCost: 9, effectMultiplier: 1.6 },
    legendary: { baseCost: 13, effectMultiplier: 2.0 }
  }
};

export function extractEffectValue(cardText: string, cardType: string): number {
  // Extract numerical values from card text
  const truthMatch = cardText.match(/Truth ([+-])(\d+)/);
  if (truthMatch) {
    return parseInt(truthMatch[2]);
  }
  
  const pressureMatch = cardText.match(/\+(\d+) Pressure/);
  if (pressureMatch) {
    return parseInt(pressureMatch[1]);
  }
  
  const damageMatch = cardText.match(/(\d+) (?:damage|IP)/i);
  if (damageMatch) {
    return parseInt(damageMatch[1]);
  }
  
  // Default values for complex effects
  if (cardType === 'ZONE') return 1;
  if (cardType === 'MEDIA') return 10;
  if (cardType === 'ATTACK') return 15;
  if (cardType === 'DEFENSIVE') return 10;
  
  return 10; // Default
}

export function calculateOptimalCost(
  cardType: string, 
  rarity: string, 
  effectValue: number
): number {
  const curve = COST_CURVES[cardType as keyof typeof COST_CURVES];
  if (!curve) return 4;
  
  const rarityData = curve[rarity as keyof typeof curve];
  if (!rarityData) return 4;
  
  // Calculate cost based on effect value and rarity multiplier
  const baseEffect = cardType === 'MEDIA' ? 10 : cardType === 'ZONE' ? 1 : 15;
  const effectRatio = effectValue / baseEffect;
  const optimalCost = Math.round(rarityData.baseCost * effectRatio);
  
  return Math.max(1, optimalCost);
}

export function analyzeCardBalance(cards: any[]): BalanceReport {
  const cardAnalysis: CardBalance[] = [];
  let balancedCount = 0;
  let undercostCount = 0;
  let overcostCount = 0;
  
  for (const card of cards) {
    const effectValue = extractEffectValue(card.text, card.type);
    const optimalCost = calculateOptimalCost(card.type, card.rarity, effectValue);
    const costDifference = card.cost - optimalCost;
    const costEfficiencyRatio = effectValue / card.cost;
    
    let balanceStatus: CardBalance['balanceStatus'];
    const recommendations: string[] = [];
    
    if (Math.abs(costDifference) <= 1) {
      balanceStatus = 'balanced';
      balancedCount++;
    } else if (costDifference < -1) {
      balanceStatus = 'undercosted';
      undercostCount++;
      recommendations.push(`Increase cost from ${card.cost} to ${optimalCost}`);
      recommendations.push(`Currently ${Math.abs(costDifference)} IP too cheap`);
    } else {
      balanceStatus = 'overcosted';
      overcostCount++;
      recommendations.push(`Decrease cost from ${card.cost} to ${optimalCost}`);
      recommendations.push(`Currently ${costDifference} IP too expensive`);
    }
    
    cardAnalysis.push({
      cardId: card.id,
      name: card.name,
      type: card.type,
      rarity: card.rarity,
      cost: card.cost,
      effectValue,
      costEfficiencyRatio,
      balanceStatus,
      recommendations
    });
  }
  
  // Generate overall recommendations
  const overallRecommendations: string[] = [];
  
  const balancePercentage = (balancedCount / cards.length) * 100;
  if (balancePercentage < 70) {
    overallRecommendations.push("Major rebalancing needed - less than 70% of cards are balanced");
  } else if (balancePercentage < 85) {
    overallRecommendations.push("Minor rebalancing needed - fine-tune underperforming cards");
  } else {
    overallRecommendations.push("Card balance is healthy - only minor adjustments needed");
  }
  
  if (undercostCount > cards.length * 0.15) {
    overallRecommendations.push("Too many overpowered cards - players may find game too easy");
  }
  
  if (overcostCount > cards.length * 0.15) {
    overallRecommendations.push("Too many underpowered cards - some cards may never be played");
  }
  
  return {
    timestamp: new Date().toISOString(),
    totalCards: cards.length,
    balancedCards: balancedCount,
    undercostCards: undercostCount,
    overcostCards: overcostCount,
    cardAnalysis,
    recommendations: overallRecommendations
  };
}

export function generateBalanceReport(cards: any[]): string {
  const report = analyzeCardBalance(cards);
  
  let output = `# SHADOW GOVERNMENT CARD BALANCE REPORT\n`;
  output += `Generated: ${new Date(report.timestamp).toLocaleString()}\n\n`;
  
  output += `## OVERVIEW\n`;
  output += `Total Cards Analyzed: ${report.totalCards}\n`;
  output += `Balanced Cards: ${report.balancedCards} (${Math.round((report.balancedCards/report.totalCards)*100)}%)\n`;
  output += `Undercosted Cards: ${report.undercostCards} (${Math.round((report.undercostCards/report.totalCards)*100)}%)\n`;
  output += `Overcosted Cards: ${report.overcostCards} (${Math.round((report.overcostCards/report.totalCards)*100)}%)\n\n`;
  
  output += `## RECOMMENDATIONS\n`;
  for (const rec of report.recommendations) {
    output += `- ${rec}\n`;
  }
  output += `\n`;
  
  // Group by balance status
  const unbalanced = report.cardAnalysis.filter(c => c.balanceStatus !== 'balanced');
  if (unbalanced.length > 0) {
    output += `## CARDS NEEDING ATTENTION\n\n`;
    
    for (const card of unbalanced) {
      output += `### ${card.name} (${card.type} - ${card.rarity})\n`;
      output += `Current Cost: ${card.cost} | Effect Value: ${card.effectValue} | Status: ${card.balanceStatus.toUpperCase()}\n`;
      output += `Efficiency Ratio: ${card.costEfficiencyRatio.toFixed(2)} effect per IP\n`;
      for (const rec of card.recommendations) {
        output += `- ${rec}\n`;
      }
      output += `\n`;
    }
  }
  
  return output;
}