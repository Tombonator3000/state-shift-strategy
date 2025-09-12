// Enhanced Card Balancing System for Shadow Government
// Comprehensive analysis with IP-equivalent weighting, faction alignment, and realistic recommendations

import { CARD_DATABASE } from './cardDatabase';
import { extensionManager } from './extensionSystem';

// Enhanced interfaces for the new system
export interface EnhancedCardAnalysis {
  cardId: string;
  name: string;
  type: string;
  rarity: string;
  currentCost: number;
  
  // Faction alignment
  faction: 'Truth' | 'Government' | 'Neutral';
  alignment: 'Aligned' | 'Mixed' | 'Misaligned';
  alignmentReason: string;
  
  // Effect analysis
  totalUtilityScore: number; // IP-equivalent total
  effectBreakdown: {
    truth: number;
    ip: number;
    pressure: number;
    draw: number;
    flags: number;
    developments: number;
  };
  
  // Cost analysis with new system
  expectedCostRange: { min: number; max: number };
  optimalCost: number;
  classification: 'On Curve' | 'Undercosted' | 'Overcosted';
  
  // Recommendations
  costRecommendation: number | null;
  rarityRecommendation: string | null;
  reasoning: string;
  severity: 'Low' | 'Medium' | 'High' | 'Severe';
}

export interface EnhancedBalanceReport {
  timestamp: string;
  totalCards: number;
  
  // Classification stats
  onCurve: number;
  undercosted: number;
  overcosted: number;
  balancePercentage: number;
  
  // Faction alignment stats
  truthCards: number;
  governmentCards: number;
  neutralCards: number;
  misalignedCards: number;
  
  // Cost distribution
  averageCostByType: Record<string, number>;
  averageCostByRarity: Record<string, number>;
  
  // Analysis results
  cardAnalysis: EnhancedCardAnalysis[];
  topOutliers: {
    undercosted: EnhancedCardAnalysis[];
    overcosted: EnhancedCardAnalysis[];
  };
  
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
  averageTruthPath: number[];
  cardPerformance: {
    topOverpowered: Array<{ name: string; impactScore: number; recommendedFix: string }>;
    topUnderpowered: Array<{ name: string; usageRate: number; recommendedFix: string }>;
  };
}

export interface PatchEntry {
  cardId: string;
  name: string;
  currentCost: number;
  currentRarity: string;
  recommendedCost: number | null;
  recommendedRarity: string | null;
  reasoning: string;
  severity: string;
  step?: number;
}

// New Weight System (IP-equivalents)
const IP_EQUIVALENT_WEIGHTS = {
  // IP effects
  ipOwner: 1.0,          // +1 IP (owner) = +1.0 utility
  ipEnemy: 1.3,          // -1 IP (enemy) = +1.3 utility (tempo bonus)
  
  // Truth effects (baseline)
  truthBase: 2.0,        // ±1 p.p. Truth = 2.0 utility when aligned
  
  // Pressure effects  
  pressureTargeted: 2.0, // +1 pressure on target state = +2.0 utility
  pressureAll: 2.0,      // Per affected state, capped at 5 states
  
  // Card draw
  drawBase: 2.0,         // +1 draw = +2.0 utility
  drawDiminishing: 1.2,  // After 2nd draw per turn
  
  // Flags (one-time effects)
  skipAction: 4.5,
  blockAttack: 2.5,
  immune: 3.5,
  forceDiscard: 2.0,     // Per card
  zoneCostReduction: 1.5,
  
  // Development modifier
  developmentMultiplier: 0.6  // Conservative discount for permanent effects
};

// Rarity Budget System
const RARITY_BUDGETS = {
  common: { min: 2, max: 5, baseline: 3.5 },
  uncommon: { min: 6, max: 9, baseline: 7.5 },
  rare: { min: 10, max: 15, baseline: 12.5 },
  legendary: { min: 16, max: 25, baseline: 20.5 }
};

// Cost caps and limits
const BALANCING_CONSTRAINTS = {
  maxCost: 15,           // No recommendations over 15
  maxStepChange: 3,      // Max ±3 IP per recommendation
  onCurveThreshold: 0.15, // ±15% of expected budget
  undercostedThreshold: 0.20, // >20% over budget  
  overcostedThreshold: 0.20,  // <-20% under budget
  
  // Threshold scaling for Truth effects
  truthThresholdRange: 15,    // ±15 p.p. from relevant thresholds
  truthMaxScale: 2.0         // Max 2x multiplier near thresholds
};

export class EnhancedCardBalancer {
  private cards: any[];

  constructor(includeExtensions: boolean = true) {
    if (includeExtensions) {
      const extensionCards = extensionManager.getAllExtensionCards();
      this.cards = [...CARD_DATABASE, ...extensionCards];
    } else {
      this.cards = CARD_DATABASE;
    }
    
    // Normalize encoding issues
    this.cards = this.cards.map(card => ({
      ...card,
      name: this.normalizeText(card.name),
      text: this.normalizeText(card.text)
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

  private determineFaction(card: any): 'Truth' | 'Government' | 'Neutral' {
    const text = card.text.toLowerCase();
    
    // Look for truth effects
    const truthPositive = /truth\s*\+/.test(text);
    const truthNegative = /truth\s*-/.test(text);
    
    if (truthPositive && !truthNegative) return 'Truth';
    if (truthNegative && !truthPositive) return 'Government';
    
    // Check flavor text for additional context
    const govFlavor = (card.flavorGov || '').toLowerCase();
    const truthFlavor = (card.flavorTruth || '').toLowerCase();
    
    if (govFlavor.includes('suppress') || govFlavor.includes('control')) return 'Government';
    if (truthFlavor.includes('reveal') || truthFlavor.includes('expose')) return 'Truth';
    
    return 'Neutral';
  }

  private calculateTruthScaling(truthChange: number, faction: 'Truth' | 'Government'): number {
    // Determine relevant threshold
    const relevantThreshold = faction === 'Truth' ? 90 : 10;
    
    // For this calculation, assume current truth level is around 50%
    // In practice, this would use game state context
    const assumedCurrentTruth = 50;
    const distance = Math.abs(assumedCurrentTruth - relevantThreshold);
    
    // Calculate scaling factor
    const scale = 1.0 + Math.max(0, Math.min(1.0, (BALANCING_CONSTRAINTS.truthThresholdRange - distance) / BALANCING_CONSTRAINTS.truthThresholdRange));
    
    return scale;
  }

  private analyzeCardEffects(card: any): { totalUtility: number; breakdown: any } {
    const breakdown = {
      truth: 0,
      ip: 0,
      pressure: 0,
      draw: 0,
      flags: 0,
      developments: 0
    };

    const text = card.text.toLowerCase();
    const faction = this.determineFaction(card);
    
    // Truth effects with threshold scaling
    const truthMatch = card.text.match(/truth\s*([+-]?\d+)/i);
    if (truthMatch) {
      const truthValue = parseInt(truthMatch[1]);
      const isAligned = (faction === 'Truth' && truthValue > 0) || 
                       (faction === 'Government' && truthValue < 0);
      
      if (isAligned) {
        const scaling = this.calculateTruthScaling(truthValue, faction);
        breakdown.truth = Math.abs(truthValue) * IP_EQUIVALENT_WEIGHTS.truthBase * scaling;
      } else {
        // Misaligned - negative utility
        breakdown.truth = -Math.abs(truthValue) * IP_EQUIVALENT_WEIGHTS.truthBase;
      }
    }

    // IP effects
    const ipMatches = card.text.match(/([+-]?\d+)\s*ip/gi);
    if (ipMatches) {
      ipMatches.forEach(match => {
        const ipValue = parseInt(match);
        if (ipValue > 0) {
          breakdown.ip += ipValue * IP_EQUIVALENT_WEIGHTS.ipOwner;
        } else {
          breakdown.ip += Math.abs(ipValue) * IP_EQUIVALENT_WEIGHTS.ipEnemy;
        }
      });
    }

    // Pressure effects
    const pressureMatches = card.text.match(/([+-]?\d+)\s*pressure/gi);
    if (pressureMatches) {
      pressureMatches.forEach(match => {
        const pressureValue = Math.abs(parseInt(match));
        if (text.includes('all states') || text.includes('every state')) {
          // Cap at 5 states for calculation
          breakdown.pressure += Math.min(5, pressureValue) * IP_EQUIVALENT_WEIGHTS.pressureAll;
        } else {
          breakdown.pressure += pressureValue * IP_EQUIVALENT_WEIGHTS.pressureTargeted;
        }
      });
    }

    // Card draw effects
    const drawMatches = card.text.match(/draw\s*(\d+)/gi);
    if (drawMatches) {
      drawMatches.forEach(match => {
        const drawValue = parseInt(match.match(/\d+/)[0]);
        if (drawValue <= 2) {
          breakdown.draw += drawValue * IP_EQUIVALENT_WEIGHTS.drawBase;
        } else {
          breakdown.draw += 2 * IP_EQUIVALENT_WEIGHTS.drawBase + 
                          (drawValue - 2) * IP_EQUIVALENT_WEIGHTS.drawDiminishing;
        }
      });
    }

    // Flag effects
    if (text.includes('skip') && text.includes('action')) {
      breakdown.flags += IP_EQUIVALENT_WEIGHTS.skipAction;
    }
    if (text.includes('block') && text.includes('attack')) {
      breakdown.flags += IP_EQUIVALENT_WEIGHTS.blockAttack;
    }
    if (text.includes('immune')) {
      breakdown.flags += IP_EQUIVALENT_WEIGHTS.immune;
    }
    if (text.includes('discard')) {
      const discardMatch = text.match(/discard\s*(\d+)/);
      const discardCount = discardMatch ? parseInt(discardMatch[1]) : 1;
      breakdown.flags += discardCount * IP_EQUIVALENT_WEIGHTS.forceDiscard;
    }
    if (text.includes('cost reduction') || text.includes('reduce') && text.includes('cost')) {
      breakdown.flags += IP_EQUIVALENT_WEIGHTS.zoneCostReduction;
    }

    // Development effects (permanent effects get conservative discount)
    if (card.type === 'DEVELOPMENT' || text.includes('permanent') || text.includes('ongoing')) {
      const basePermanentValue = Object.values(breakdown).reduce((sum, val) => sum + val, 0);
      breakdown.developments = basePermanentValue * IP_EQUIVALENT_WEIGHTS.developmentMultiplier;
    }

    const totalUtility = Object.values(breakdown).reduce((sum, val) => sum + val, 0);
    
    return { totalUtility, breakdown };
  }

  private analyzeFactionAlignment(card: any): { alignment: string; reason: string } {
    const faction = this.determineFaction(card);
    const { totalUtility } = this.analyzeCardEffects(card);
    const text = card.text.toLowerCase();

    // Check for severe misalignment - hard rule violations
    if (faction === 'Truth' && text.includes('truth -')) {
      if (totalUtility <= 0) {
        return { 
          alignment: 'Misaligned', 
          reason: 'Truth card with negative Truth effect and insufficient compensation' 
        };
      } else if (totalUtility < 5) {
        return { 
          alignment: 'Mixed', 
          reason: 'Truth card with negative Truth effect but some compensating utility' 
        };
      }
    }

    if (faction === 'Government' && text.includes('truth +')) {
      if (totalUtility <= 0) {
        return { 
          alignment: 'Misaligned', 
          reason: 'Government card with positive Truth effect and insufficient compensation' 
        };
      } else if (totalUtility < 5) {
        return { 
          alignment: 'Mixed', 
          reason: 'Government card with positive Truth effect but some compensating utility' 
        };
      }
    }

    return { alignment: 'Aligned', reason: 'Effects align with faction goals' };
  }

  private calculateOptimalCost(totalUtility: number, rarity: string): number {
    const budget = RARITY_BUDGETS[rarity as keyof typeof RARITY_BUDGETS];
    if (!budget) return 4; // fallback

    // Calculate cost based on utility relative to baseline
    const utilityRatio = totalUtility / budget.baseline;
    const baseCost = this.getBaseCostForRarity(rarity);
    
    return Math.max(1, Math.round(baseCost * utilityRatio));
  }

  private getBaseCostForRarity(rarity: string): number {
    switch (rarity) {
      case 'common': return 3;
      case 'uncommon': return 5;
      case 'rare': return 8;
      case 'legendary': return 12;
      default: return 4;
    }
  }

  private generateRecommendation(card: any, analysis: any): { cost: number | null; rarity: string | null; reasoning: string } {
    const { totalUtility } = this.analyzeCardEffects(card);
    const currentBudget = RARITY_BUDGETS[card.rarity as keyof typeof RARITY_BUDGETS];
    
    if (!currentBudget) {
      return { cost: null, rarity: null, reasoning: 'Unknown rarity' };
    }

    const utilityDifference = totalUtility - currentBudget.baseline;
    const percentageDiff = Math.abs(utilityDifference) / currentBudget.baseline;

    // Within acceptable range (±15%)
    if (percentageDiff <= BALANCING_CONSTRAINTS.onCurveThreshold) {
      return { cost: null, rarity: null, reasoning: 'Card is balanced within acceptable range' };
    }

    // Calculate optimal cost but apply ±3 step limit
    const optimalCost = this.calculateOptimalCost(totalUtility, card.rarity);
    const costDiff = optimalCost - card.cost;
    
    // Apply ±3 step limit for initial recommendation
    let stepCostChange = costDiff;
    if (Math.abs(costDiff) > BALANCING_CONSTRAINTS.maxStepChange) {
      stepCostChange = Math.sign(costDiff) * BALANCING_CONSTRAINTS.maxStepChange;
    }
    
    const suggestedCost = Math.min(Math.max(card.cost + stepCostChange, 1), BALANCING_CONSTRAINTS.maxCost);
    
    // If large adjustment needed, suggest rarity change as well
    if (Math.abs(costDiff) > 5) {
      const rarities = ['common', 'uncommon', 'rare', 'legendary'];
      const currentIndex = rarities.indexOf(card.rarity);
      
      if (utilityDifference > 0 && currentIndex < rarities.length - 1) {
        // Card is overpowered - promote rarity
        return { 
          cost: suggestedCost, 
          rarity: rarities[currentIndex + 1],
          reasoning: `Step 1: ${stepCostChange > 0 ? '+' : ''}${stepCostChange} IP (utility ${totalUtility.toFixed(1)} vs ${currentBudget.baseline}), then promote to ${rarities[currentIndex + 1]}`
        };
      } else if (utilityDifference < 0 && currentIndex > 0) {
        // Card is underpowered - demote rarity
        return { 
          cost: suggestedCost, 
          rarity: rarities[currentIndex - 1],
          reasoning: `Step 1: ${stepCostChange > 0 ? '+' : ''}${stepCostChange} IP (utility ${totalUtility.toFixed(1)} vs ${currentBudget.baseline}), then demote to ${rarities[currentIndex - 1]}`
        };
      }
    }
    
    // Simple cost adjustment within ±3 limit
    if (suggestedCost !== card.cost) {
      return { 
        cost: suggestedCost, 
        rarity: null, 
        reasoning: `Adjust cost by ${stepCostChange > 0 ? '+' : ''}${stepCostChange} IP (utility ${totalUtility.toFixed(1)} vs expected ${currentBudget.baseline})` 
      };
    }

    return { 
      cost: null, 
      rarity: null, 
      reasoning: `Card balanced within constraints - utility ${totalUtility.toFixed(1)} vs expected ${currentBudget.baseline}` 
    };
  }

  private classifyCard(card: any, totalUtility: number): string {
    const budget = RARITY_BUDGETS[card.rarity as keyof typeof RARITY_BUDGETS];
    if (!budget) return 'On Curve';

    const difference = (totalUtility - budget.baseline) / budget.baseline;

    if (Math.abs(difference) <= BALANCING_CONSTRAINTS.onCurveThreshold) {
      return 'On Curve';
    } else if (difference > BALANCING_CONSTRAINTS.undercostedThreshold) {
      return 'Undercosted';
    } else if (difference < -BALANCING_CONSTRAINTS.overcostedThreshold) {
      return 'Overcosted';
    }

    return 'On Curve';
  }

  public generateEnhancedReport(): EnhancedBalanceReport {
    const cardAnalyses: EnhancedCardAnalysis[] = [];
    
    for (const card of this.cards) {
      const { totalUtility, breakdown } = this.analyzeCardEffects(card);
      const faction = this.determineFaction(card);
      const alignment = this.analyzeFactionAlignment(card);
      const budget = RARITY_BUDGETS[card.rarity as keyof typeof RARITY_BUDGETS];
      const classification = this.classifyCard(card, totalUtility);
      const recommendation = this.generateRecommendation(card, { totalUtility, classification });
      
      // Determine severity
      let severity: 'Low' | 'Medium' | 'High' | 'Severe' = 'Low';
      if (alignment.alignment === 'Misaligned') {
        severity = 'Severe';
      } else if (classification === 'Undercosted' && totalUtility > (budget?.baseline || 10) * 1.5) {
        severity = 'High';
      } else if (classification === 'Overcosted' && totalUtility < (budget?.baseline || 10) * 0.5) {
        severity = 'High';
      } else if (classification !== 'On Curve') {
        severity = 'Medium';
      }

      cardAnalyses.push({
        cardId: card.id,
        name: card.name,
        type: card.type,
        rarity: card.rarity,
        currentCost: card.cost,
        faction,
        alignment: alignment.alignment as any,
        alignmentReason: alignment.reason,
        totalUtilityScore: totalUtility,
        effectBreakdown: breakdown,
        expectedCostRange: budget ? { min: budget.min, max: budget.max } : { min: 1, max: 15 },
        optimalCost: this.calculateOptimalCost(totalUtility, card.rarity),
        classification: classification as any,
        costRecommendation: recommendation.cost,
        rarityRecommendation: recommendation.rarity,
        reasoning: recommendation.reasoning,
        severity
      });
    }

    // Calculate statistics
    const onCurve = cardAnalyses.filter(c => c.classification === 'On Curve').length;
    const undercosted = cardAnalyses.filter(c => c.classification === 'Undercosted').length;
    const overcosted = cardAnalyses.filter(c => c.classification === 'Overcosted').length;
    const balancePercentage = (onCurve / this.cards.length) * 100;

    // Faction stats
    const truthCards = cardAnalyses.filter(c => c.faction === 'Truth').length;
    const governmentCards = cardAnalyses.filter(c => c.faction === 'Government').length;
    const neutralCards = cardAnalyses.filter(c => c.faction === 'Neutral').length;
    const misalignedCards = cardAnalyses.filter(c => c.alignment === 'Misaligned').length;

    // Cost averages
    const averageCostByType: Record<string, number> = {};
    const averageCostByRarity: Record<string, number> = {};

    ['MEDIA', 'ZONE', 'ATTACK', 'DEFENSIVE', 'TECH', 'DEVELOPMENT'].forEach(type => {
      const typeCards = cardAnalyses.filter(c => c.type === type);
      averageCostByType[type] = typeCards.length > 0 
        ? typeCards.reduce((sum, c) => sum + c.currentCost, 0) / typeCards.length 
        : 0;
    });

    ['common', 'uncommon', 'rare', 'legendary'].forEach(rarity => {
      const rarityCards = cardAnalyses.filter(c => c.rarity === rarity);
      averageCostByRarity[rarity] = rarityCards.length > 0
        ? rarityCards.reduce((sum, c) => sum + c.currentCost, 0) / rarityCards.length 
        : 0;
    });

    // Top outliers
    const topOutliers = {
      undercosted: cardAnalyses
        .filter(c => c.classification === 'Undercosted')
        .sort((a, b) => (b.totalUtilityScore - (RARITY_BUDGETS[b.rarity as keyof typeof RARITY_BUDGETS]?.baseline || 0)) - 
                       (a.totalUtilityScore - (RARITY_BUDGETS[a.rarity as keyof typeof RARITY_BUDGETS]?.baseline || 0)))
        .slice(0, 15),
      overcosted: cardAnalyses
        .filter(c => c.classification === 'Overcosted')
        .sort((a, b) => ((RARITY_BUDGETS[a.rarity as keyof typeof RARITY_BUDGETS]?.baseline || 0) - a.totalUtilityScore) - 
                       ((RARITY_BUDGETS[b.rarity as keyof typeof RARITY_BUDGETS]?.baseline || 0) - b.totalUtilityScore))
        .slice(0, 15)
    };

    // Global recommendations
    const globalRecommendations: string[] = [];

    if (balancePercentage < 70) {
      globalRecommendations.push("Major rebalancing needed - less than 70% of cards are balanced");
    } else if (balancePercentage < 85) {
      globalRecommendations.push("Minor rebalancing needed - fine-tune underperforming cards");
    } else {
      globalRecommendations.push("Card balance is healthy - only minor adjustments needed");
    }

    if (misalignedCards > 0) {
      globalRecommendations.push(`${misalignedCards} cards have severe faction misalignment issues - requires immediate attention`);
    }

    const threshold = this.cards.length * 0.15;
    if (undercosted > threshold && overcosted > threshold) {
      globalRecommendations.push(`Balance polarization detected: ${undercosted} undercosted and ${overcosted} overcosted cards. Tighten cost curve and review outliers.`);
    } else if (undercosted > threshold) {
      globalRecommendations.push(`${undercosted} cards are undercosted - consider global utility reduction or cost increases`);
    } else if (overcosted > threshold) {
      globalRecommendations.push(`${overcosted} cards are overcosted - consider global utility improvements or cost reductions`);
    }

    return {
      timestamp: new Date().toISOString(),
      totalCards: this.cards.length,
      onCurve,
      undercosted,
      overcosted,
      balancePercentage,
      truthCards,
      governmentCards,
      neutralCards,
      misalignedCards,
      averageCostByType,
      averageCostByRarity,
      cardAnalysis: cardAnalyses,
      topOutliers,
      globalRecommendations
    };
  }

  public runEnhancedSimulation(iterations: number = 1000): SimulationReport {
    let truthWins = 0;
    let governmentWins = 0;
    let draws = 0;
    const truthPaths: number[][] = [];
    let totalGameLength = 0;
    const cardUsage: Record<string, { played: number; wonWithCard: number }> = {};
    
    // Initialize card usage tracking
    this.cards.forEach(card => {
      cardUsage[card.id] = { played: 0, wonWithCard: 0 };
    });

    for (let i = 0; i < iterations; i++) {
      let truthLevel = 50;
      let playerIP = 100;
      let aiIP = 100;
      let gameLength = 0;
      const truthPath = [50];
      const cardsPlayedThisGame: string[] = [];
      
      // Simulate game until win condition or max turns
      for (let turn = 0; turn < 20 && gameLength < 20; turn++) {
        gameLength++;
        
        // Simulate 2-3 card plays per turn
        const cardsThisTurn = 2 + Math.floor(Math.random() * 2);
        
        for (let play = 0; play < cardsThisTurn; play++) {
          const randomCard = this.cards[Math.floor(Math.random() * this.cards.length)];
          cardsPlayedThisGame.push(randomCard.id);
          cardUsage[randomCard.id].played++;
          
          // Apply effects based on enhanced analysis
          const { totalUtility, breakdown } = this.analyzeCardEffects(randomCard);
          const faction = this.determineFaction(randomCard);
          
          // Apply truth effects
          if (breakdown.truth !== 0) {
            const truthChange = breakdown.truth / IP_EQUIVALENT_WEIGHTS.truthBase;
            truthLevel = Math.max(0, Math.min(100, truthLevel + truthChange));
          }
          
          // Apply IP effects (simplified)
          if (breakdown.ip > 0) {
            if (faction === 'Truth') {
              playerIP += breakdown.ip;
            } else if (faction === 'Government') {
              aiIP += breakdown.ip;
            } else {
              // Neutral - random target
              if (Math.random() > 0.5) playerIP += breakdown.ip;
              else aiIP += breakdown.ip;
            }
          }
        }
        
        truthPath.push(truthLevel);
        
        // Check win conditions
        if (truthLevel >= 90) {
          truthWins++;
          cardsPlayedThisGame.forEach(cardId => cardUsage[cardId].wonWithCard++);
          break;
        }
        if (truthLevel <= 10) {
          governmentWins++;
          cardsPlayedThisGame.forEach(cardId => cardUsage[cardId].wonWithCard++);
          break;
        }
        if (playerIP >= 200) {
          truthWins++;
          cardsPlayedThisGame.forEach(cardId => cardUsage[cardId].wonWithCard++);
          break;
        }
        if (aiIP >= 200) {
          governmentWins++;
          cardsPlayedThisGame.forEach(cardId => cardUsage[cardId].wonWithCard++);
          break;
        }
      }
      
      // If no win condition met, count as draw
      if (gameLength >= 20) {
        draws++;
      }
      
      truthPaths.push(truthPath);
      totalGameLength += gameLength;
    }

    // Calculate average truth path
    const avgTruthPath: number[] = [];
    const maxLength = Math.max(...truthPaths.map(p => p.length));
    
    for (let i = 0; i < maxLength; i++) {
      const validPaths = truthPaths.filter(p => p[i] !== undefined);
      avgTruthPath[i] = validPaths.length > 0 
        ? validPaths.reduce((sum, p) => sum + p[i], 0) / validPaths.length 
        : 50;
    }

    // Analyze card performance
    const cardPerformanceData = Object.entries(cardUsage).map(([cardId, stats]) => {
      const card = this.cards.find(c => c.id === cardId);
      const { totalUtility } = this.analyzeCardEffects(card);
      const winRate = stats.played > 0 ? stats.wonWithCard / stats.played : 0;
      const usageRate = stats.played / iterations;
      
      return {
        cardId,
        name: card?.name || 'Unknown',
        totalUtility,
        winRate,
        usageRate,
        impactScore: totalUtility * winRate
      };
    });

    const topOverpowered = cardPerformanceData
      .filter(c => c.impactScore > 15) // High impact threshold
      .sort((a, b) => b.impactScore - a.impactScore)
      .slice(0, 10)
      .map(c => ({
        name: c.name,
        impactScore: c.impactScore,
        recommendedFix: `Reduce utility from ${c.totalUtility.toFixed(1)} or increase cost by 1-3 IP`
      }));

    const topUnderpowered = cardPerformanceData
      .filter(c => c.usageRate < 0.1) // Low usage threshold
      .sort((a, b) => a.usageRate - b.usageRate)
      .slice(0, 10)
      .map(c => ({
        name: c.name,
        usageRate: c.usageRate,
        recommendedFix: `Increase utility or reduce cost by 1-2 IP`
      }));

    return {
      iterations,
      truthWinRate: (truthWins / iterations) * 100,
      governmentWinRate: (governmentWins / iterations) * 100,
      drawRate: (draws / iterations) * 100,
      averageGameLength: totalGameLength / iterations,
      averageTruthPath: avgTruthPath,
      cardPerformance: {
        topOverpowered,
        topUnderpowered
      }
    };
  }

  public generatePatchExport(format: 'json' | 'csv' | 'txt' = 'json'): string {
    const report = this.generateEnhancedReport();
    const patches: PatchEntry[] = [];

    report.cardAnalysis.forEach(analysis => {
      if (analysis.costRecommendation !== null || analysis.rarityRecommendation !== null) {
        // Generate stepwise patches for large changes
        const costDiff = (analysis.costRecommendation || analysis.currentCost) - analysis.currentCost;
        const steps: Array<{step: number, recCost: number, recRarity: string, reason: string}> = [];
        
        if (Math.abs(costDiff) <= 3) {
          // Single step change
          steps.push({
            step: 1,
            recCost: analysis.costRecommendation || analysis.currentCost,
            recRarity: analysis.rarityRecommendation || analysis.rarity,
            reason: analysis.reasoning
          });
        } else {
          // Multi-step change
          const direction = costDiff > 0 ? 1 : -1;
          let currentCost = analysis.currentCost;
          let stepNum = 1;
          
          // First step: ±3 IP
          currentCost += direction * 3;
          steps.push({
            step: stepNum++,
            recCost: currentCost,
            recRarity: analysis.rarity,
            reason: `Step ${stepNum - 1}: ${direction > 0 ? '+' : ''}${direction * 3} IP (${analysis.reasoning})`
          });
          
          // If rarity change needed, add as separate step
          if (analysis.rarityRecommendation && analysis.rarityRecommendation !== analysis.rarity) {
            steps.push({
              step: stepNum++,
              recCost: currentCost,
              recRarity: analysis.rarityRecommendation,
              reason: `Step ${stepNum - 1}: Promote to ${analysis.rarityRecommendation} rarity`
            });
          }
          
          // Additional cost adjustments if needed (rare case)
          const remainingCostDiff = (analysis.costRecommendation || analysis.currentCost) - currentCost;
          if (Math.abs(remainingCostDiff) > 0) {
            const finalStep = Math.min(Math.abs(remainingCostDiff), 3) * (remainingCostDiff > 0 ? 1 : -1);
            steps.push({
              step: stepNum,
              recCost: currentCost + finalStep,
              recRarity: analysis.rarityRecommendation || analysis.rarity,
              reason: `Step ${stepNum}: Final adjustment ${finalStep > 0 ? '+' : ''}${finalStep} IP`
            });
          }
        }
        
        // Add each step as a separate patch entry
        steps.forEach((step, index) => {
          patches.push({
            cardId: analysis.cardId,
            name: analysis.name,
            currentCost: index === 0 ? analysis.currentCost : steps[index - 1].recCost,
            currentRarity: index === 0 ? analysis.rarity : steps[index - 1].recRarity,
            recommendedCost: step.recCost,
            recommendedRarity: step.recRarity,
            reasoning: step.reason,
            severity: analysis.severity,
            step: step.step
          });
        });
      }
    });

    switch (format) {
      case 'csv':
        const csvHeader = 'cardId,name,currentCost,currentRarity,step,recCost,recRarity,reason,severity\n';
        const csvRows = patches.map(p => 
          `${p.cardId},"${p.name}",${p.currentCost},${p.currentRarity},${p.step || 1},${p.recommendedCost || ''},${p.recommendedRarity || ''},"${p.reasoning}",${p.severity}`
        ).join('\n');
        return csvHeader + csvRows;

      case 'txt':
        let txtOutput = '# SHADOW GOVERNMENT CARD BALANCE PATCH RECOMMENDATIONS\n\n';
        txtOutput += `Analyzer v2.0 — Cost cap: 15 | Max step: ±3 | Truth weighting: 2.0x | Threshold scaling: 1.0-2.0x\n`;
        txtOutput += `Generated: ${new Date().toLocaleString()}\n`;
        txtOutput += `Total patch steps: ${patches.length}\n\n`;
        
        // Group patches by card
        const patchesByCard = patches.reduce((acc, patch) => {
          if (!acc[patch.cardId]) acc[patch.cardId] = [];
          acc[patch.cardId].push(patch);
          return acc;
        }, {} as Record<string, typeof patches>);
        
        Object.values(patchesByCard).forEach(cardPatches => {
          const firstPatch = cardPatches[0];
          txtOutput += `## ${firstPatch.name} (${firstPatch.cardId})\n`;
          txtOutput += `Initial: ${firstPatch.currentCost} IP, ${firstPatch.currentRarity}\n`;
          
          cardPatches.forEach(patch => {
            txtOutput += `${patch.step ? `Step ${patch.step}: ` : ''}${patch.recommendedCost} IP, ${patch.recommendedRarity} - ${patch.reasoning}\n`;
          });
          
          txtOutput += `Severity: ${firstPatch.severity}\n\n`;
        });
        
        return txtOutput;

      default: // json
        return JSON.stringify({
          metadata: {
            timestamp: new Date().toISOString(),
            version: '2.0-enhanced',
            analyzer: 'Cost cap: 15 | Max step: ±3 | Truth weighting: 2.0x | Threshold scaling: 1.0-2.0x',
            totalPatchSteps: patches.length
          },
          patches
        }, null, 2);
    }
  }

  public exportFullAnalysis() {
    const report = this.generateEnhancedReport();
    const simulation = this.runEnhancedSimulation();
    
    return {
      balanceReport: report,
      simulationReport: simulation,
      patches: {
        json: this.generatePatchExport('json'),
        csv: this.generatePatchExport('csv'),
        txt: this.generatePatchExport('txt')
      },
      timestamp: new Date().toISOString(),
      version: '2.0-enhanced'
    };
  }
}

// Utility function for external use
export function analyzeCardBalanceEnhanced(includeExtensions: boolean = true): EnhancedBalanceReport {
  const balancer = new EnhancedCardBalancer(includeExtensions);
  return balancer.generateEnhancedReport();
}

export function runBalanceSimulationEnhanced(iterations: number = 1000, includeExtensions: boolean = true): SimulationReport {
  const balancer = new EnhancedCardBalancer(includeExtensions);
  return balancer.runEnhancedSimulation(iterations);
}

export default EnhancedCardBalancer;