import type { GameCard } from '@/rules/mvp';
import {
  validateMvpCard,
  validateMvpCards,
  type ValidationResult,
  type ValidationSummary,
} from '@/utils/validate-mvp';

export type { ValidationResult, ValidationSummary } from '@/utils/validate-mvp';

export function validateCard(card: GameCard): ValidationResult {
  return validateMvpCard(card);
}

export function validateCards(cards: GameCard[]): ValidationSummary {
  return validateMvpCards(cards);
}

export function createValidationReport(cards: GameCard[]): string {
  const summary = validateCards(cards);

  let report = `\n=== CARD VALIDATION REPORT (MVP) ===\n`;
  report += `Total Cards: ${summary.totalCards}\n`;
  report += `Valid Cards: ${summary.validCards}\n`;
  report += `Invalid Cards: ${summary.invalidCards}\n\n`;

  if (summary.invalidCards === 0) {
    report += '✅ All cards passed MVP validation!\n';
    return report;
  }

  report += 'VALIDATION ISSUES:\n';
  report += `${'='.repeat(50)}\n`;

  for (const result of summary.results) {
    report += `\n❌ ${result.cardId}: ${result.cardName}\n`;
    report += `${'-'.repeat(result.cardName.length + result.cardId.length + 2)}\n`;

    for (const issue of result.issues) {
      report += `   • ${issue.message}\n`;
    }
  }

  return report;
}
