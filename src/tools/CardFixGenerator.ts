// Card Fix Generator - Creates structured fixes for cards with missing effects
// Converts complex text descriptions into proper effect objects

import { CARD_DATABASE } from '@/data/cardDatabase';
import { CardEffectAnalyzer, EffectDiscrepancy } from './CardEffectAnalyzer';
import { EnhancedCardEffects } from '@/types/enhancedCardEffects';
import type { GameCard } from '@/types/cardTypes';

export interface CardFix {
  cardId: string;
  cardName: string;
  currentEffects: any;
  suggestedEffects: EnhancedCardEffects;
  confidence: 'high' | 'medium' | 'low';
  notes: string[];
}

export class CardFixGenerator {
  
  static generateFixes(): CardFix[] {
    console.log('🔧 Generating card fixes...');
    
    const analysis = CardEffectAnalyzer.analyzeAllCards();
    const fixes: CardFix[] = [];
    
    // Focus on critical and major issues
    const priorityDiscrepancies =  analysis.discrepancies.filter(
      d => d.severity === 'critical' || d.severity === 'major'
    );
    
    for (const discrepancy of priorityDiscrepancies) {
      const card = CARD_DATABASE.find(c => c.id === discrepancy.cardId);
      if (!card) continue;
      
      const fix = this.generateCardFix(card, discrepancy);
      if (fix) {
        fixes.push(fix);
      }
    }
    
    return fixes.sort((a, b) => {
      const confidenceOrder = { high: 3, medium: 2, low: 1 };
      return confidenceOrder[b.confidence] - confidenceOrder[a.confidence];
    });
  }
  
  private static generateCardFix(card: GameCard, discrepancy: EffectDiscrepancy): CardFix | null {
    const originalText = card.text?.toLowerCase() || '';
    const suggestedEffects: EnhancedCardEffects = { ...(card.effects || {}) };
    const notes: string[] = [];
    let confidence: 'high' | 'medium' | 'low' = 'medium';
    
    // Analyze missing effects and suggest fixes
    for (const missingEffect of discrepancy.missingEffects) {
      const fix = this.generateEffectFix(missingEffect, originalText, suggestedEffects, notes);
      if (fix.confidence === 'high') confidence = 'high';
      if (fix.confidence === 'low' && confidence === 'medium') confidence = 'low';
    }
    
    return {
      cardId: card.id,
      cardName: card.name,
      currentEffects: card.effects || {},
      suggestedEffects,
      confidence,
      notes
    };
  }
  
  private static generateEffectFix(
    missingEffect: string, 
    originalText: string, 
    effects: EnhancedCardEffects,
    notes: string[]
  ): { confidence: 'high' | 'medium' | 'low' } {
    
    switch (missingEffect) {
      case 'opponent-media-trigger':
        if (originalText.includes('when opponent plays') && originalText.includes('media')) {
          effects.triggers = effects.triggers || [];
          effects.triggers.push({
            condition: {
              opponentPlaysMedia: {
                targetingThisState: originalText.includes('targeting this state')
              }
            },
            effect: this.extractTruthEffect(originalText)
          });
          notes.push('Added opponent media trigger');
          return { confidence: 'high' };
        }
        break;
        
      case 'move-defense':
        const moveMatch = originalText.match(/move (\d+) defense/i);
        if (moveMatch) {
          const amount = parseInt(moveMatch[1]);
          effects.movement = {
            moveDefense: {
              from: 'thisState',
              to: originalText.includes('adjacent') ? 'adjacent' : 'anyControlled',
              amount
            }
          };
          notes.push(`Added move ${amount} defense effect`);
          return { confidence: 'high' };
        }
        break;
        
      case 'truth-reduction':
      case 'truth-increase':
        const truthMatch = originalText.match(/truth.*?(\d+)%/i);
        if (truthMatch) {
          const amount = parseInt(truthMatch[1]);
          const delta = missingEffect === 'truth-reduction' ? -amount : amount;
          effects.truthPercentDelta = delta;
          notes.push(`Added truth ${delta > 0 ? '+' : ''}${delta}% effect`);
          return { confidence: 'high' };
        }
        break;
        
      case 'adjacent-states':
        if (originalText.includes('adjacent') || originalText.includes('neighboring')) {
          effects.stateTargeting = effects.stateTargeting || {};
          effects.stateTargeting.adjacentStates = {
            effect: this.extractPressureEffect(originalText)
          };
          notes.push('Added adjacent states effect');
          return { confidence: 'medium' };
        }
        break;
        
      case 'opponent-control-condition':
        const opponentMatch = originalText.match(/if opponent controls? (\d+)/i);
        if (opponentMatch) {
          const count = parseInt(opponentMatch[1]);
          effects.enhancedConditional = effects.enhancedConditional || [];
          effects.enhancedConditional.push({
            condition: {
              opponentControls: { min: count }
            },
            then: this.extractConditionalEffect(originalText)
          });
          notes.push(`Added opponent control condition (${count}+ states)`);
          return { confidence: 'high' };
        }
        break;
        
      case 'replacement-effect':
        if (originalText.includes('instead') || originalText.includes('rather than')) {
          effects.replacement = {
            replaces: {
              trigger: 'generic',
              with: this.extractReplacementEffect(originalText)
            }
          };
          notes.push('Added replacement effect (needs manual review)');
          return { confidence: 'low' };
        }
        break;
        
      case 'cost-reduction':
      case 'cost-increase':
        const costMatch = originalText.match(/costs? (\d+) (less|more)/i);
        if (costMatch) {
          const amount = parseInt(costMatch[1]);
          const delta = costMatch[2] === 'less' ? -amount : amount;
          effects.replacement = effects.replacement || {};
          effects.replacement.modifyCosts = {
            costDelta: delta,
            duration: 'thisTurn'
          };
          notes.push(`Added cost modification: ${delta > 0 ? '+' : ''}${delta} IP`);
          return { confidence: 'medium' };
        }
        break;
        
      default:
        notes.push(`Unhandled missing effect: ${missingEffect}`);
        return { confidence: 'low' };
    }
    
    return { confidence: 'low' };
  }
  
  private static extractTruthEffect(text: string): any {
    const truthMatch = text.match(/truth.*?(\d+)%/i);
    if (truthMatch) {
      const amount = parseInt(truthMatch[1]);
      const isReduction = text.includes('reduc') || text.includes('decreas') || text.includes('loses');
      return { truthPercentDelta: isReduction ? -amount : amount };
    }
    return {};
  }
  
  private static extractPressureEffect(text: string): any {
    const pressureMatch = text.match(/(\d+) pressure/i);
    if (pressureMatch) {
      return { pressureDelta: parseInt(pressureMatch[1]) };
    }
    return { pressureDelta: 2 }; // Default for zone cards
  }
  
  private static extractConditionalEffect(text: string): any {
    // Try to extract the "then" part of the conditional
    const afterIf = text.split(/if\s+/i)[1] || '';
    const thenPart = afterIf.split(/,\s*/)[1] || afterIf;
    
    return this.extractTruthEffect(thenPart) || this.extractPressureEffect(thenPart) || {};
  }
  
  private static extractReplacementEffect(text: string): any {
    // This is complex and often requires manual review
    return { truthDelta: 0 }; // Placeholder
  }
  
  static generateFixScript(fixes: CardFix[]): string {
    let script = `// Generated Card Effect Fixes
// Apply these fixes to cardDatabase.ts

export const cardEffectFixes = {\n`;
    
    for (const fix of fixes.slice(0, 20)) { // Top 20 fixes
      script += `  "${fix.cardId}": { // ${fix.cardName} (${fix.confidence} confidence)\n`;
      script += `    effects: ${JSON.stringify(fix.suggestedEffects, null, 6).replace(/^/gm, '    ')},\n`;
      script += `    // Notes: ${fix.notes.join(', ')}\n`;
      script += `  },\n\n`;
    }
    
    script += `};\n\n`;
    script += `// Apply fixes with:\n`;
    script += `// Object.assign(CARD_DATABASE.find(c => c.id === 'cardId'), cardEffectFixes['cardId']);\n`;
    
    return script;
  }
  
  static exportHighConfidenceFixes(): CardFix[] {
    return this.generateFixes().filter(fix => fix.confidence === 'high');
  }
}

// Export for browser console
if (typeof window !== 'undefined') {
  (window as any).CardFixGenerator = CardFixGenerator;
}