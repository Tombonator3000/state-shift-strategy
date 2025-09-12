// Comprehensive Card Effect Analysis Tool
// Identifies discrepancies between card text and effects data

import { CARD_DATABASE } from '@/data/cardDatabase';
import { CardTextGenerator, CardEffectValidator } from '@/systems/CardTextGenerator';
import type { Card } from '@/types/cardEffects';
import type { GameCard } from '@/components/game/GameHand';

export interface EffectDiscrepancy {
  cardId: string;
  cardName: string;
  originalText: string;
  generatedText: string;
  missingEffects: string[];
  severity: 'minor' | 'major' | 'critical';
}

export interface AnalysisReport {
  totalCards: number;
  cardsWithDiscrepancies: number;
  discrepancies: EffectDiscrepancy[];
  missingEffectTypes: Set<string>;
  summary: {
    minor: number;
    major: number;
    critical: number;
  };
}

export class CardEffectAnalyzer {
  
  static analyzeAllCards(): AnalysisReport {
    console.log('🔍 Analyzing all cards for effect discrepancies...');
    
    const discrepancies: EffectDiscrepancy[] = [];
    const missingEffectTypes = new Set<string>();
    
    for (const card of CARD_DATABASE) {
      const discrepancy = this.analyzeCard(card);
      if (discrepancy) {
        discrepancies.push(discrepancy);
        discrepancy.missingEffects.forEach(effect => missingEffectTypes.add(effect));
      }
    }
    
    const summary = {
      minor: discrepancies.filter(d => d.severity === 'minor').length,
      major: discrepancies.filter(d => d.severity === 'major').length,
      critical: discrepancies.filter(d => d.severity === 'critical').length
    };
    
    return {
      totalCards: CARD_DATABASE.length,
      cardsWithDiscrepancies: discrepancies.length,
      discrepancies,
      missingEffectTypes,
      summary
    };
  }
  
  private static analyzeCard(card: GameCard): EffectDiscrepancy | null {
    const originalText = (card.text || '').toLowerCase().trim();
    const generatedText = CardTextGenerator.generateRulesText(card.effects || {}).toLowerCase().trim();
    
    // Skip cards with no text or empty effects
    if (!originalText || originalText === 'no effect.' || !card.effects) {
      return null;
    }
    
    const missingEffects = this.identifyMissingEffects(originalText, generatedText);
    
    if (missingEffects.length === 0) {
      return null;
    }
    
    const severity = this.calculateSeverity(missingEffects, originalText);
    
    return {
      cardId: card.id,
      cardName: card.name,
      originalText: card.text || '',
      generatedText: CardTextGenerator.generateRulesText(card.effects || {}),
      missingEffects,
      severity
    };
  }
  
  private static identifyMissingEffects(originalText: string, generatedText: string): string[] {
    const missing: string[] = [];
    
    // Common patterns that indicate missing functionality
    const patterns = [
      // Conditional triggers
      { pattern: /when opponent plays.*media/i, type: 'opponent-media-trigger' },
      { pattern: /when.*targeting this state/i, type: 'target-this-state-trigger' },
      { pattern: /when.*played on this state/i, type: 'played-on-state-trigger' },
      { pattern: /if opponent controls/i, type: 'opponent-control-condition' },
      { pattern: /if you control/i, type: 'player-control-condition' },
      
      // Movement effects
      { pattern: /move.*defense/i, type: 'move-defense' },
      { pattern: /transfer.*defense/i, type: 'transfer-defense' },
      { pattern: /relocate/i, type: 'relocate-effect' },
      
      // State-specific effects
      { pattern: /adjacent states/i, type: 'adjacent-states' },
      { pattern: /neighboring/i, type: 'neighboring-states' },
      { pattern: /connected/i, type: 'connected-states' },
      
      // Complex truth effects
      { pattern: /truth.*reduces/i, type: 'truth-reduction' },
      { pattern: /truth.*increases/i, type: 'truth-increase' },
      { pattern: /truth.*by (\d+)%/i, type: 'percentage-truth-change' },
      
      // Turn-based effects
      { pattern: /next turn/i, type: 'next-turn-effect' },
      { pattern: /this turn/i, type: 'this-turn-effect' },
      { pattern: /permanent/i, type: 'permanent-effect' },
      
      // Replacement effects
      { pattern: /instead/i, type: 'replacement-effect' },
      { pattern: /rather than/i, type: 'replacement-effect' },
      
      // Cost modifications
      { pattern: /costs? (\d+) less/i, type: 'cost-reduction' },
      { pattern: /costs? (\d+) more/i, type: 'cost-increase' },
      
      // Deck manipulation
      { pattern: /search.*deck/i, type: 'deck-search' },
      { pattern: /shuffle/i, type: 'deck-shuffle' },
      { pattern: /bottom of deck/i, type: 'deck-bottom' },
      
      // Hand size effects
      { pattern: /hand size/i, type: 'hand-size-effect' },
      { pattern: /maximum hand/i, type: 'max-hand-size' },
      
      // Card type restrictions
      { pattern: /only.*media/i, type: 'media-only-restriction' },
      { pattern: /only.*zone/i, type: 'zone-only-restriction' },
      { pattern: /only.*attack/i, type: 'attack-only-restriction' }
    ];
    
    for (const { pattern, type } of patterns) {
      if (pattern.test(originalText) && !generatedText.includes(type.replace(/-/g, ' '))) {
        missing.push(type);
      }
    }
    
    // Check for specific numeric mismatches
    const originalNumbers = originalText.match(/\d+/g) || [];
    const generatedNumbers = generatedText.match(/\d+/g) || [];
    
    if (originalNumbers.length !== generatedNumbers.length) {
      missing.push('numeric-mismatch');
    }
    
    return missing;
  }
  
  private static calculateSeverity(missingEffects: string[], originalText: string): 'minor' | 'major' | 'critical' {
    // Critical: Card has complex triggers or replacement effects
    const criticalEffects = [
      'opponent-media-trigger',
      'target-this-state-trigger',
      'replacement-effect',
      'move-defense'
    ];
    
    if (missingEffects.some(effect => criticalEffects.includes(effect))) {
      return 'critical';
    }
    
    // Major: Card has conditional logic or permanent effects
    const majorEffects = [
      'opponent-control-condition',
      'player-control-condition',
      'permanent-effect',
      'adjacent-states'
    ];
    
    if (missingEffects.some(effect => majorEffects.includes(effect)) || missingEffects.length >= 3) {
      return 'major';
    }
    
    return 'minor';
  }
  
  static generateReport(analysis: AnalysisReport): string {
    let report = `
# Card Effect Analysis Report

## Summary
- Total Cards: ${analysis.totalCards}
- Cards with Discrepancies: ${analysis.cardsWithDiscrepancies}
- Success Rate: ${((analysis.totalCards - analysis.cardsWithDiscrepancies) / analysis.totalCards * 100).toFixed(1)}%

## Severity Breakdown
- Critical: ${analysis.summary.critical} cards (require immediate attention)
- Major: ${analysis.summary.major} cards (significant gameplay impact)
- Minor: ${analysis.summary.minor} cards (minor discrepancies)

## Missing Effect Types
${Array.from(analysis.missingEffectTypes).map(effect => `- ${effect.replace(/-/g, ' ')}`).join('\n')}

## Detailed Card Analysis

### Critical Issues
`;
    
    const critical = analysis.discrepancies.filter(d => d.severity === 'critical').slice(0, 10);
    for (const card of critical) {
      report += `
**${card.cardName}** (${card.cardId})
- Original: "${card.originalText}"
- Generated: "${card.generatedText}"
- Missing: ${card.missingEffects.join(', ')}
`;
    }
    
    report += `
### Major Issues
`;
    
    const major = analysis.discrepancies.filter(d => d.severity === 'major').slice(0, 10);
    for (const card of major) {
      report += `
**${card.cardName}** (${card.cardId})
- Missing: ${card.missingEffects.join(', ')}
`;
    }
    
    return report;
  }
  
  static exportForFixing(analysis: AnalysisReport): any[] {
    return analysis.discrepancies
      .filter(d => d.severity === 'critical' || d.severity === 'major')
      .map(d => ({
        id: d.cardId,
        name: d.cardName,
        currentText: d.originalText,
        generatedText: d.generatedText,
        missingEffects: d.missingEffects,
        severity: d.severity
      }));
  }
}

// Export for use in browser console
if (typeof window !== 'undefined') {
  (window as any).CardEffectAnalyzer = CardEffectAnalyzer;
}