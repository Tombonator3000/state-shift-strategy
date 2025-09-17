// Card Text Generation and Validation System
// Generates human-readable rules text from CardEffects

import type { CardEffects, Card } from '@/types/cardEffects';

// Helper function to render effects consistently
const renderEffects = (e: CardEffects): string[] => {
  const parts: string[] = [];
  if (typeof e.truthDelta === 'number') parts.push(`${e.truthDelta >= 0 ? '+' : ''}${e.truthDelta}% Truth`);
  if (typeof e.ipDelta?.self === 'number') {
    parts.push(`${e.ipDelta.self >= 0 ? '+' : ''}${e.ipDelta.self} IP (you)`);
  }
  if (typeof e.ipDelta?.opponent === 'number') {
    const n = e.ipDelta.opponent;
    if (n > 0) {
      parts.push(`Opponent loses ${n} IP`);
    } else if (n < 0) {
      parts.push(`Opponent gains ${Math.abs(n)} IP`);
    } else {
      parts.push('No IP change');
    }
  }
  if (typeof e.draw === 'number') parts.push(`Draw ${e.draw}`);
  if (typeof e.discardOpponent === 'number') parts.push(`Opponent discards ${e.discardOpponent}`);
  if (typeof e.pressureDelta === 'number') parts.push(`${e.pressureDelta >= 0 ? '+' : ''}${e.pressureDelta} Pressure`);
  if (typeof e.zoneDefense === 'number') parts.push(`${e.zoneDefense >= 0 ? '+' : ''}${e.zoneDefense} Zone Defense`);
  return parts;
};

export class CardTextGenerator {
  
  // Helper method to render effects (public for use in conditionals)
  static renderEffects = renderEffects;
  
  // Generate human-readable rules text from effects
  static generateRulesText(effects: CardEffects): string {
    if (!effects) {
      return 'No effect.';
    }

    const parts: string[] = [];
    
    // Basic resource effects
    if (effects.truthDelta !== undefined) {
      const sign = effects.truthDelta >= 0 ? '+' : '';
      parts.push(`${sign}${effects.truthDelta}% Truth`);
    }
    
    if (effects.ipDelta) {
      if (effects.ipDelta.self !== undefined) {
        const sign = effects.ipDelta.self >= 0 ? '+' : '';
        parts.push(`${sign}${effects.ipDelta.self} IP`);
      }

      if (effects.ipDelta.opponent !== undefined) {
        if (effects.ipDelta.opponent > 0) {
          parts.push(`Opponent loses ${effects.ipDelta.opponent} IP`);
        } else if (effects.ipDelta.opponent < 0) {
          parts.push(`Opponent gains ${Math.abs(effects.ipDelta.opponent)} IP`);
        } else {
          parts.push('No IP change');
        }
      }
    }
    
    // Card effects
    if (effects.draw !== undefined) {
      if (effects.draw === 1) {
        parts.push('Draw 1 card');
      } else {
        parts.push(`Draw ${effects.draw} cards`);
      }
    }
    
    if (effects.discardSelf !== undefined) {
      if (effects.discardSelf === 1) {
        parts.push('Discard 1 card');
      } else {
        parts.push(`Discard ${effects.discardSelf} cards`);
      }
    }
    
    if (effects.discardOpponent !== undefined) {
      if (effects.discardOpponent === 1) {
        parts.push('Opponent discards 1 card');
      } else {
        parts.push(`Opponent discards ${effects.discardOpponent} cards`);
      }
    }
    
    // Zone effects
    if (effects.pressureDelta !== undefined) {
      parts.push(`+${effects.pressureDelta} Pressure to target state`);
    }
    
    if (effects.zoneDefense !== undefined) {
      parts.push(`+${effects.zoneDefense} Defense to controlled states`);
    }
    
    if (effects.captureBonus !== undefined) {
      parts.push(`+${effects.captureBonus} IP when capturing states`);
    }
    
    // Damage effects
    if (effects.damage) {
      if (effects.damage.fixed !== undefined) {
        parts.push(`Deal ${effects.damage.fixed} damage`);
      } else if (effects.damage.min !== undefined && effects.damage.max !== undefined) {
        parts.push(`Deal ${effects.damage.min}-${effects.damage.max} damage`);
      } else if (effects.damage.min !== undefined) {
        parts.push(`Deal ${effects.damage.min}+ damage`);
      } else if (effects.damage.max !== undefined) {
        parts.push(`Deal up to ${effects.damage.max} damage`);
      }
    }
    
    // Income effects
    if (effects.incomeBonus?.ip && effects.incomeBonus?.duration) {
      parts.push(`+${effects.incomeBonus.ip} IP per turn for ${effects.incomeBonus.duration} turns`);
    }
    
    // Process conditional effects with improved ifTargetStateIs handling
    if (effects.conditional) {
      const conditionals = Array.isArray(effects.conditional) ? effects.conditional : [effects.conditional];
      
      for (const conditional of conditionals) {
        // Special handling for ifTargetStateIs
        if (conditional.ifTargetStateIs) {
          const thenText = conditional.then ? this.renderEffects(conditional.then).join('. ') : '';
          const elseText = conditional.else ? this.renderEffects(conditional.else).join('. ') : '';
          const seg = `If targeting ${conditional.ifTargetStateIs}: ${thenText}${elseText ? `. Else: ${elseText}` : ''}`;
          if (thenText) parts.push(seg);
        } else {
          // Standard conditional handling
          const conditionText = this.formatCondition(conditional);
          const thenText = conditional.then ? this.generateRulesText(conditional.then) : '';
          const elseText = conditional.else ? this.generateRulesText(conditional.else) : '';
          
          if (thenText && !elseText) {
            parts.push(`If ${conditionText}: ${thenText}`);
          } else if (thenText && elseText) {
            parts.push(`If ${conditionText}: ${thenText}. Otherwise: ${elseText}`);
          }
        }
      }
    }
    
    // Join parts with appropriate punctuation
    if (parts.length === 0) {
      return 'No effect.';
    } else if (parts.length === 1) {
      return parts[0] + '.';
    } else {
      return parts.join('. ') + '.';
    }
  }

  // Format condition for human reading
  private static formatCondition(conditional: any): string {
    const conditions: string[] = [];
    
    if (conditional.ifTruthAtLeast !== undefined) {
      conditions.push(`Truth ≥ ${conditional.ifTruthAtLeast}%`);
    }
    if (conditional.ifTruthAtMost !== undefined) {
      conditions.push(`Truth ≤ ${conditional.ifTruthAtMost}%`);
    }
    if (conditional.ifZonesControlledAtLeast !== undefined) {
      conditions.push(`you control ≥ ${conditional.ifZonesControlledAtLeast} states`);
    }
    if (conditional.ifZonesControlledAtMost !== undefined) {
      conditions.push(`you control ≤ ${conditional.ifZonesControlledAtMost} states`);
    }
    if (conditional.ifIPAtLeast !== undefined) {
      conditions.push(`you have ≥ ${conditional.ifIPAtLeast} IP`);
    }
    if (conditional.ifIPAtMost !== undefined) {
      conditions.push(`you have ≤ ${conditional.ifIPAtMost} IP`);
    }
    if (conditional.ifOpponentIPAtLeast !== undefined) {
      conditions.push(`opponent has ≥ ${conditional.ifOpponentIPAtLeast} IP`);
    }
    if (conditional.ifOpponentIPAtMost !== undefined) {
      conditions.push(`opponent has ≤ ${conditional.ifOpponentIPAtMost} IP`);
    }
    if (conditional.ifHandSizeAtLeast !== undefined) {
      conditions.push(`hand size ≥ ${conditional.ifHandSizeAtLeast}`);
    }
    if (conditional.ifHandSizeAtMost !== undefined) {
      conditions.push(`hand size ≤ ${conditional.ifHandSizeAtMost}`);
    }
    if (conditional.ifRoundAtLeast !== undefined) {
      conditions.push(`round ≥ ${conditional.ifRoundAtLeast}`);
    }
    if (conditional.ifTargetStateIs !== undefined) {
      const state = conditional.ifTargetStateIs;
      if (state && typeof state === 'string' && state.trim().length > 0) {
        conditions.push(`targeting ${state}`);
      }
    }
    
    return conditions.join(' and ');
  }
}

// Card Effect Validator
export class CardEffectValidator {
  
  // Validate a single card's effects vs text
  static validateCard(card: Card): ValidationResult {
    const result: ValidationResult = {
      cardId: card.id,
      cardName: card.name,
      isValid: true,
      issues: []
    };
    
    // Check if card has effects
    if (!card.effects) {
      result.issues.push({
        type: 'missing_effects',
        severity: 'warning',
        message: 'Card has no effects defined'
      });
    }
    
    // Check if card has rules text
    if (!card.text) {
      result.issues.push({
        type: 'missing_text',
        severity: 'warning', 
        message: 'Card has no rules text'
      });
    }
    
    // Compare existing text with generated text
    if (card.effects && card.text) {
      const generatedText = CardTextGenerator.generateRulesText(card.effects);
      const normalizedExisting = this.normalizeText(card.text);
      const normalizedGenerated = this.normalizeText(generatedText);
      
      if (normalizedExisting !== normalizedGenerated) {
        result.isValid = false;
        result.issues.push({
          type: 'text_mismatch',
          severity: 'error',
          message: 'Rules text does not match effects',
          expected: generatedText,
          found: card.text
        });
      }
    }
    
    // Validate effect schema
    if (card.effects) {
      const schemaIssues = this.validateEffectSchema(card.effects);
      result.issues.push(...schemaIssues);
      
      if (schemaIssues.some(issue => issue.severity === 'error')) {
        result.isValid = false;
      }
    }
    
    return result;
  }

  // Validate multiple cards
  static validateCards(cards: Card[]): ValidationSummary {
    const results = cards.map(card => this.validateCard(card));
    
    const summary: ValidationSummary = {
      totalCards: cards.length,
      validCards: results.filter(r => r.isValid).length,
      invalidCards: results.filter(r => !r.isValid).length,
      warningCards: results.filter(r => r.issues.some(i => i.severity === 'warning')).length,
      results: results.filter(r => !r.isValid || r.issues.length > 0) // Only show problem cards
    };
    
    return summary;
  }

  // Normalize text for comparison (remove extra spaces, standardize punctuation)
  private static normalizeText(text: string): string {
    return text
      .toLowerCase()
      .replace(/\s+/g, ' ')
      .replace(/[.!?]+$/, '.')
      .trim();
  }

  // Validate effect schema structure
  private static validateEffectSchema(effects: CardEffects): ValidationIssue[] {
    const issues: ValidationIssue[] = [];
    
    // Check for unknown properties
    const knownProps = [
      'truthDelta', 'ipDelta', 'draw', 'discardSelf', 'discardOpponent',
      'pressureDelta', 'zoneDefense', 'captureBonus', 'damage', 'conditional',
      'duration', 'tags', 'repeatable', 'requiresTarget', 'incomeBonus'
    ];
    
    for (const prop in effects) {
      if (!knownProps.includes(prop)) {
        issues.push({
          type: 'unknown_property',
          severity: 'warning',
          message: `Unknown effect property: ${prop}`
        });
      }
    }
    
    // Validate specific properties
    if (effects.truthDelta !== undefined && (effects.truthDelta < -100 || effects.truthDelta > 100)) {
      issues.push({
        type: 'invalid_range',
        severity: 'error',
        message: `truthDelta out of range: ${effects.truthDelta} (should be -100 to +100)`
      });
    }
    
    if (effects.damage) {
      if (effects.damage.min !== undefined && effects.damage.max !== undefined && effects.damage.min > effects.damage.max) {
        issues.push({
          type: 'invalid_range',
          severity: 'error',
          message: `damage.min (${effects.damage.min}) > damage.max (${effects.damage.max})`
        });
      }
    }
    
    return issues;
  }

  // Create development report
  static createDevReport(cards: Card[]): string {
    const summary = this.validateCards(cards);
    
    let report = `\n=== CARD EFFECT VALIDATION REPORT ===\n`;
    report += `Total Cards: ${summary.totalCards}\n`;
    report += `Valid Cards: ${summary.validCards}\n`;
    report += `Invalid Cards: ${summary.invalidCards}\n`;
    report += `Cards with Warnings: ${summary.warningCards}\n\n`;
    
    if (summary.results.length === 0) {
      report += `✅ All cards passed validation!\n`;
      return report;
    }
    
    report += `ISSUES FOUND:\n`;
    report += `${'='.repeat(50)}\n`;
    
    for (const result of summary.results) {
      report += `\n${result.cardId}: ${result.cardName}\n`;
      report += `${'-'.repeat(result.cardName.length + result.cardId.length + 2)}\n`;
      
      for (const issue of result.issues) {
        const icon = issue.severity === 'error' ? '❌' : '⚠️';
        report += `${icon} ${issue.type}: ${issue.message}\n`;
        
        if (issue.expected && issue.found) {
          report += `   Expected: "${issue.expected}"\n`;
          report += `   Found:    "${issue.found}"\n`;
        }
      }
    }
    
    return report;
  }
}

// Type definitions for validation
export interface ValidationIssue {
  type: 'missing_effects' | 'missing_text' | 'text_mismatch' | 'unknown_property' | 'invalid_range';
  severity: 'error' | 'warning';
  message: string;
  expected?: string;
  found?: string;
}

export interface ValidationResult {
  cardId: string;
  cardName: string;
  isValid: boolean;
  issues: ValidationIssue[];
}

export interface ValidationSummary {
  totalCards: number;
  validCards: number;
  invalidCards: number;
  warningCards: number;
  results: ValidationResult[];
}