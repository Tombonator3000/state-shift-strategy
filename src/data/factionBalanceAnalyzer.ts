// Faction Balance Analyzer for Shadow Government
// Comprehensive card analysis system with faction alignment and balance evaluation

import { CARD_DATABASE } from './cardDatabase';
import { extensionManager } from './extensionSystem';

// Use centralized v2.1E types
import type { GameCard, Faction, CardType } from '@/rules/mvp';

// Core interfaces for analysis system
export interface FactionAlignmentMatrix {
  truthSeekerEffects: {
    truthPositive: number;    // Truth + = ✅
    truthNegative: number;    // Truth - = ❌ (flagged)
    ipSelf: number;          // IP(player)+ = ✅
    ipOpponent: number;      // IP(ai)- = ✅
    pressureSelf: number;    // Own pressure = situational positive
  };
  governmentEffects: {
    truthNegative: number;   // Truth - = ✅
    truthPositive: number;   // Truth + = ❌ (flagged)
    ipSelf: number;         // IP(ai)+ = ✅
    ipOpponent: number;     // IP(player)- = ✅
    pressureSelf: number;   // Own pressure = situational positive
  };
}

export interface NetUtilityScore {
  total: number;
  breakdown: {
    truth: number;
    ip: number;
    pressure: number;
    defensive: number;
    utility: number;
  };
  explanation: string[];
}

export interface CardAnalysisResult {
  cardId: string;
  name: string;
  type: string;
  rarity: string;
  faction: 'truth' | 'government' | 'neutral';
  
  // Faction alignment
  alignment: 'Aligned' | 'Mixed' | 'Misaligned';
  alignmentReason: string;
  
  // Net utility
  netUtilityScore: NetUtilityScore;
  
  // Cost analysis
  cost: number;
  expectedCostRange: { min: number; max: number };
  costStatus: 'Undercosted' | 'On Curve' | 'Overcosted';
  
  // Issue classification
  severity: 'Low' | 'Medium' | 'High' | 'Severe';
  issues: string[];
  recommendations: string[];
}

export interface BalanceReport {
  timestamp: string;
  totalCards: number;
  
  // Per faction stats
  truthSeekerStats: {
    total: number;
    aligned: number;
    mixed: number;
    misaligned: number;
    averageNUS: number;
  };
  
  governmentStats: {
    total: number;
    aligned: number;
    mixed: number;
    misaligned: number;
    averageNUS: number;
  };
  
  // Cost distribution
  costByType: Record<string, number>;
  costByRarity: Record<string, number>;
  
  // Problem summary
  severeIssues: number;
  highIssues: number;
  mediumIssues: number;
  lowIssues: number;
  
  // Detailed analysis
  cardAnalysis: CardAnalysisResult[];
  
  // Global recommendations
  globalRecommendations: string[];
}

export interface SimulationResult {
  truthWinRate: number;
  governmentWinRate: number;
  averageTruthPath: number[];
  averageIPSwing: number;
  averageCardsPerTurn: number;
  topOverpoweredCards: string[];
  topUnderpoweredCards: string[];
}

// Cost curves per rarity (IP cost expectations)
const COST_CURVES = {
  common: { min: 1, max: 4, baseline: 2.5 },
  uncommon: { min: 3, max: 6, baseline: 4.5 },
  rare: { min: 5, max: 9, baseline: 7 },
  legendary: { min: 8, max: 15, baseline: 11 }
};

// Effect value weights for NUS calculation
const EFFECT_WEIGHTS = {
  truth: 1.0,           // Truth ±10 = 10 points
  ip: 0.8,              // IP ±10 = 8 points
  pressure: 1.2,        // Pressure +1 = 1.2 points (territorial control)
  defensive: 1.5,       // Defensive effects = 1.5x multiplier
  utility: 0.6,         // Card draw, discount = 0.6x
  instant: 1.0,         // No modifier for instant effects
  permanent: 1.8        // Permanent effects get 1.8x multiplier
};

export class FactionBalanceAnalyzer {
  private cards: GameCard[];

  constructor(includeExtensions: boolean = true) {
    if (includeExtensions) {
      const extensionCards = extensionManager.getAllExtensionCards();
      this.cards = [...CARD_DATABASE, ...extensionCards];
    } else {
      this.cards = CARD_DATABASE;
    }
  }

  // Extract numerical effect value from card text
  private extractEffectValue(cardText: string | undefined, cardType: string): number {
    const text = cardText ?? '';
    let totalValue = 0;

    // Truth effects
    const truthMatch = text.match(/Truth\s*([+-]?\d+)/gi);
    if (truthMatch) {
      truthMatch.forEach(match => {
        const value = parseInt(match.replace('Truth', '').trim());
        totalValue += Math.abs(value) * EFFECT_WEIGHTS.truth;
      });
    }
    
    // IP effects
    const ipMatch = text.match(/IP\s*([+-]?\d+)/gi);
    if (ipMatch) {
      ipMatch.forEach(match => {
        const value = parseInt(match.replace('IP', '').trim());
        totalValue += Math.abs(value) * EFFECT_WEIGHTS.ip;
      });
    }
    
    // Pressure effects
    const pressureMatch = text.match(/([+-]?\d+)\s*Pressure/gi);
    if (pressureMatch) {
      pressureMatch.forEach(match => {
        const value = parseInt(match.replace('Pressure', '').trim());
        totalValue += Math.abs(value) * EFFECT_WEIGHTS.pressure;
      });
    }
    
    // Defensive keywords
    const lowered = text.toLowerCase();
    if (lowered.includes('block') || lowered.includes('immune') || lowered.includes('reduce')) {
      totalValue += 3 * EFFECT_WEIGHTS.defensive;
    }
    
    // Utility effects
    if (lowered.includes('draw')) {
      totalValue += 2 * EFFECT_WEIGHTS.utility;
    }
    
    // Base values for card types if no specific effects found
    if (totalValue === 0) {
      switch (cardType) {
        case 'MEDIA': return 8;      // Moderate effect
        case 'ZONE': return 6;       // Territorial value
        case 'ATTACK': return 12;    // High impact
        case 'DEFENSIVE': return 10; // Protective value
        default: return 5;
      }
    }
    
    return totalValue;
  }

  // Determine faction based on card effects
  private determineFaction(card: GameCard): 'truth' | 'government' | 'neutral' {
    const text = (card.text ?? '').toLowerCase();
    
    // Check for truth-positive effects
    const truthPositive = /truth\s*\+/.test(text);
    const truthNegative = /truth\s*-/.test(text);
    
    if (truthPositive && !truthNegative) return 'truth';
    if (truthNegative && !truthPositive) return 'government';
    
    // Check flavor text for additional context
    const govFlavor = (card.flavorGov || '').toLowerCase();
    const truthFlavor = (card.flavorTruth || '').toLowerCase();
    
    if (govFlavor.includes('suppress') || govFlavor.includes('control')) return 'government';
    if (truthFlavor.includes('reveal') || truthFlavor.includes('expose')) return 'truth';
    
    return 'neutral';
  }

  // Calculate Net Utility Score for a faction
  private calculateNUS(card: GameCard, forFaction: 'truth' | 'government'): NetUtilityScore {
    const breakdown = {
      truth: 0,
      ip: 0,
      pressure: 0,
      defensive: 0,
      utility: 0
    };
    
    const explanations: string[] = [];
    
    // Parse truth effects
    const text = (card.text ?? '').toLowerCase();

    const truthMatch = text.match(/truth\s*([+-]?\d+)/);
    if (truthMatch) {
      const value = parseInt(truthMatch[1]);
      const sign = forFaction === 'truth' ? 1 : -1;
      breakdown.truth = value * sign * EFFECT_WEIGHTS.truth;
      explanations.push(`Truth ${value} → ${breakdown.truth.toFixed(1)} points for ${forFaction}`);
    }
    
    // Parse IP effects (need to determine target)
    const ipMatch = text.match(/ip\s*([+-]?\d+)/);
    if (ipMatch) {
      const value = parseInt(ipMatch[1]);
      // Assume positive IP goes to player, negative damages opponent
      const sign = value > 0 ? 1 : -1;
      breakdown.ip = Math.abs(value) * sign * EFFECT_WEIGHTS.ip;
      explanations.push(`IP ${value} → ${breakdown.ip.toFixed(1)} points`);
    }
    
    // Pressure effects (always positive for card owner)
    const pressureMatch = text.match(/([+-]?\d+)\s*pressure/);
    if (pressureMatch) {
      const value = Math.abs(parseInt(pressureMatch[1]));
      breakdown.pressure = value * EFFECT_WEIGHTS.pressure;
      explanations.push(`+${value} Pressure → ${breakdown.pressure.toFixed(1)} points`);
    }
    
    // Defensive effects
    if (card.type === 'DEFENSIVE' || text.includes('block')) {
      breakdown.defensive = 4 * EFFECT_WEIGHTS.defensive;
      explanations.push(`Defensive effect → ${breakdown.defensive.toFixed(1)} points`);
    }
    
    // Utility effects
    if (text.includes('draw')) {
      breakdown.utility = 3 * EFFECT_WEIGHTS.utility;
      explanations.push(`Card utility → ${breakdown.utility.toFixed(1)} points`);
    }
    
    const total = Object.values(breakdown).reduce((sum, val) => sum + val, 0);
    
    return {
      total,
      breakdown,
      explanation: explanations
    };
  }

  // Analyze faction alignment
  private analyzeFactionAlignment(card: GameCard): { alignment: CardAnalysisResult['alignment']; reason: string } {
    const cardFaction = this.determineFaction(card);
    const truthNUS = this.calculateNUS(card, 'truth');
    const govNUS = this.calculateNUS(card, 'government');
    
    // Severe misalignment: card helps opposing faction more than its own
    if (cardFaction === 'truth' && govNUS.total > truthNUS.total + 3) {
      return { alignment: 'Misaligned', reason: 'Truth card helps Government more than Truth Seekers' };
    }
    
    if (cardFaction === 'government' && truthNUS.total > govNUS.total + 3) {
      return { alignment: 'Misaligned', reason: 'Government card helps Truth Seekers more than Government' };
    }
    
    // Mixed: has both positive and negative effects for faction
    if (cardFaction !== 'neutral') {
      const targetNUS = cardFaction === 'truth' ? truthNUS : govNUS;
      if (targetNUS.total > 0 && targetNUS.total < 5) {
        return { alignment: 'Mixed', reason: 'Has both positive and negative effects for faction' };
      }
    }
    
    // Aligned: clearly benefits its faction
    return { alignment: 'Aligned', reason: 'Effects clearly benefit intended faction' };
  }

  // Analyze single card
  private analyzeCard(card: GameCard): CardAnalysisResult {
    const faction = this.determineFaction(card);
    const alignment = this.analyzeFactionAlignment(card);
    // Convert neutral faction to truth for NUS calculation (default assumption)
    const nusTarget: 'truth' | 'government' = faction === 'neutral' ? 'truth' : faction;
    const nus = this.calculateNUS(card, nusTarget);
    
    // Cost analysis
    const expectedRange = COST_CURVES[card.rarity as keyof typeof COST_CURVES];
    const effectValue = this.extractEffectValue(card.text ?? '', card.type);
    const expectedCost = Math.max(expectedRange.min, Math.min(expectedRange.max, 
      expectedRange.baseline + (effectValue - 8) * 0.3));
    
    let costStatus: CardAnalysisResult['costStatus'] = 'On Curve';
    if (card.cost < expectedCost - 1.5) costStatus = 'Undercosted';
    if (card.cost > expectedCost + 1.5) costStatus = 'Overcosted';
    
    // Determine severity and issues
    const issues: string[] = [];
    let severity: CardAnalysisResult['severity'] = 'Low';
    
    if (alignment.alignment === 'Misaligned') {
      issues.push('Faction misalignment detected');
      severity = 'Severe';
    }
    
    if (nus.total < 0 && faction !== 'neutral') {
      issues.push('Negative net utility for intended faction');
      severity = severity === 'Severe' ? 'Severe' : 'High';
    }
    
    if (costStatus === 'Undercosted' && effectValue > 12) {
      issues.push('Undercosted high-impact card');
      severity = severity === 'Severe' ? 'Severe' : 'High';
    }
    
    if (costStatus === 'Overcosted' && effectValue < 6) {
      issues.push('Overcosted low-impact card');
      severity = severity === 'Severe' || severity === 'High' ? severity : 'Medium';
    }
    
    // Generate recommendations
    const recommendations: string[] = [];
    
    if (alignment.alignment === 'Misaligned') {
      recommendations.push('Review card effect polarity - consider flipping Truth +/- signs');
    }
    
    if (costStatus === 'Undercosted') {
      recommendations.push(`Increase cost to ${Math.ceil(expectedCost)} IP or reduce effect strength`);
    }
    
    if (costStatus === 'Overcosted') {
      recommendations.push(`Reduce cost to ${Math.floor(expectedCost)} IP or increase effect strength`);
    }
    
    if (nus.total < 0) {
      recommendations.push('Add positive effects for intended faction or reduce negative impact');
    }
    
    return {
      cardId: card.id,
      name: card.name,
      type: card.type,
      rarity: card.rarity,
      faction,
      alignment: alignment.alignment,
      alignmentReason: alignment.reason,
      netUtilityScore: nus,
      cost: card.cost,
      expectedCostRange: { min: expectedRange.min, max: expectedRange.max },
      costStatus,
      severity,
      issues,
      recommendations
    };
  }

  // Generate full balance report
  generateBalanceReport(): BalanceReport {
    const cardAnalysis = this.cards.map(card => this.analyzeCard(card));
    
    const truthCards = cardAnalysis.filter(c => c.faction === 'truth');
    const govCards = cardAnalysis.filter(c => c.faction === 'government');
    
    // Calculate faction stats
    const truthSeekerStats = {
      total: truthCards.length,
      aligned: truthCards.filter(c => c.alignment === 'Aligned').length,
      mixed: truthCards.filter(c => c.alignment === 'Mixed').length,
      misaligned: truthCards.filter(c => c.alignment === 'Misaligned').length,
      averageNUS: truthCards.reduce((sum, c) => sum + c.netUtilityScore.total, 0) / truthCards.length || 0
    };
    
    const governmentStats = {
      total: govCards.length,
      aligned: govCards.filter(c => c.alignment === 'Aligned').length,
      mixed: govCards.filter(c => c.alignment === 'Mixed').length,
      misaligned: govCards.filter(c => c.alignment === 'Misaligned').length,
      averageNUS: govCards.reduce((sum, c) => sum + c.netUtilityScore.total, 0) / govCards.length || 0
    };
    
    // Cost distributions
    const costByType: Record<string, number> = {};
    const costByRarity: Record<string, number> = {};
    
    ['MEDIA', 'ZONE', 'ATTACK', 'DEFENSIVE'].forEach(type => {
      const typeCards = cardAnalysis.filter(c => c.type === type);
      costByType[type] = typeCards.reduce((sum, c) => sum + c.cost, 0) / typeCards.length || 0;
    });
    
    ['common', 'uncommon', 'rare', 'legendary'].forEach(rarity => {
      const rarityCards = cardAnalysis.filter(c => c.rarity === rarity);
      costByRarity[rarity] = rarityCards.reduce((sum, c) => sum + c.cost, 0) / rarityCards.length || 0;
    });
    
    // Issue counts
    const severeIssues = cardAnalysis.filter(c => c.severity === 'Severe').length;
    const highIssues = cardAnalysis.filter(c => c.severity === 'High').length;
    const mediumIssues = cardAnalysis.filter(c => c.severity === 'Medium').length;
    const lowIssues = cardAnalysis.filter(c => c.severity === 'Low').length;
    
    // Global recommendations
    const globalRecommendations: string[] = [];
    
    if (severeIssues > 0) {
      globalRecommendations.push(`${severeIssues} severe faction alignment issues require immediate attention`);
    }
    
    if (Math.abs(truthSeekerStats.averageNUS - governmentStats.averageNUS) > 3) {
      const stronger = truthSeekerStats.averageNUS > governmentStats.averageNUS ? 'Truth Seekers' : 'Government';
      globalRecommendations.push(`${stronger} cards are significantly stronger on average - consider faction rebalancing`);
    }
    
    const undercosted = cardAnalysis.filter(c => c.costStatus === 'Undercosted').length;
    const overcosted = cardAnalysis.filter(c => c.costStatus === 'Overcosted').length;
    
    if (undercosted > this.cards.length * 0.2) {
      globalRecommendations.push(`${undercosted} cards are undercosted - consider global cost increase`);
    }
    
    if (overcosted > this.cards.length * 0.2) {
      globalRecommendations.push(`${overcosted} cards are overcosted - consider global cost reduction`);
    }
    
    return {
      timestamp: new Date().toISOString(),
      totalCards: this.cards.length,
      truthSeekerStats,
      governmentStats,
      costByType,
      costByRarity,
      severeIssues,
      highIssues,
      mediumIssues,
      lowIssues,
      cardAnalysis,
      globalRecommendations
    };
  }

  // Simple balance simulation
  runBalanceSimulation(iterations: number = 1000): SimulationResult {
    let truthWins = 0;
    let governmentWins = 0;
    const truthPaths: number[][] = [];
    let totalIPSwing = 0;
    let totalCardsPerTurn = 0;
    
    for (let i = 0; i < iterations; i++) {
      // Simplified simulation - random card plays for 15 turns
      let truthLevel = 50;
      let playerIP = 50;
      let aiIP = 50;
      let cardsThisSim = 0;
      const truthPath = [50];
      
      for (let turn = 0; turn < 15; turn++) {
        // Simulate 2-3 random card plays per turn
        const cardsThisTurn = 2 + Math.floor(Math.random() * 2);
        cardsThisSim += cardsThisTurn;
        
        for (let play = 0; play < cardsThisTurn; play++) {
          const randomCard = this.cards[Math.floor(Math.random() * this.cards.length)];
          
          // Apply simplified effects
          const truthMatch = randomCard.text.match(/Truth\s*([+-]?\d+)/);
          if (truthMatch) {
            const truthChange = parseInt(truthMatch[1]);
            truthLevel = Math.max(0, Math.min(100, truthLevel + truthChange));
          }
          
          const ipMatch = randomCard.text.match(/IP\s*([+-]?\d+)/);
          if (ipMatch) {
            const ipChange = parseInt(ipMatch[1]);
            if (Math.random() > 0.5) { // Random targeting
              playerIP = Math.max(0, playerIP + ipChange);
            } else {
              aiIP = Math.max(0, aiIP + ipChange);
            }
          }
        }
        
        truthPath.push(truthLevel);
        
        // Check win conditions
        if (truthLevel >= 90) {
          truthWins++;
          break;
        }
        if (truthLevel <= 10) {
          governmentWins++;
          break;
        }
        if (playerIP >= 200) {
          truthWins++;
          break;
        }
        if (aiIP >= 200) {
          governmentWins++;
          break;
        }
      }
      
      truthPaths.push(truthPath);
      totalIPSwing += Math.abs(playerIP - aiIP);
      totalCardsPerTurn += cardsThisSim / 15;
    }
    
    // Calculate averages
    const avgTruthPath: number[] = [];
    const maxLength = Math.max(...truthPaths.map(p => p.length));
    
    for (let i = 0; i < maxLength; i++) {
      const validPaths = truthPaths.filter(p => p[i] !== undefined);
      avgTruthPath[i] = validPaths.reduce((sum, p) => sum + p[i], 0) / validPaths.length;
    }
    
    // Find problematic cards based on analysis
    const analysis = this.generateBalanceReport();
    const topOverpowered = analysis.cardAnalysis
      .filter(c => c.severity === 'Severe' || c.severity === 'High')
      .filter(c => c.costStatus === 'Undercosted')
      .sort((a, b) => b.netUtilityScore.total - a.netUtilityScore.total)
      .slice(0, 5)
      .map(c => c.name);
      
    const topUnderpowered = analysis.cardAnalysis
      .filter(c => c.costStatus === 'Overcosted')
      .sort((a, b) => a.netUtilityScore.total - b.netUtilityScore.total)
      .slice(0, 5)
      .map(c => c.name);
    
    return {
      truthWinRate: (truthWins / iterations) * 100,
      governmentWinRate: (governmentWins / iterations) * 100,
      averageTruthPath: avgTruthPath,
      averageIPSwing: totalIPSwing / iterations,
      averageCardsPerTurn: totalCardsPerTurn / iterations,
      topOverpoweredCards: topOverpowered,
      topUnderpoweredCards: topUnderpowered
    };
  }

  // Export data for external analysis
  exportBalanceData(): { report: BalanceReport; simulation: SimulationResult } {
    return {
      report: this.generateBalanceReport(),
      simulation: this.runBalanceSimulation()
    };
  }
}

// Lint function for development
export function lintCardBalance(cards: GameCard[]): { errors: string[]; warnings: string[] } {
  const analyzer = new FactionBalanceAnalyzer(false); // Don't include extensions for lint
  analyzer['cards'] = cards; // Override cards for linting
  
  const report = analyzer.generateBalanceReport();
  const errors: string[] = [];
  const warnings: string[] = [];
  
  // Severe issues become errors
  report.cardAnalysis.forEach(card => {
    if (card.severity === 'Severe') {
      errors.push(`${card.name}: ${card.alignmentReason}`);
    } else if (card.severity === 'High') {
      warnings.push(`${card.name}: ${card.issues.join(', ')}`);
    }
  });
  
  return { errors, warnings };
}

export default FactionBalanceAnalyzer;