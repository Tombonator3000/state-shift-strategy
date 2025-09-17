import type { GameCard } from '@/rules/mvp';
import type { CardEffects } from '@/types/cardEffects';

const WHITELIST_KEYS = new Set([
  'truthDelta',
  'ipDelta', 
  'draw',
  'discardOpponent',
  'pressureDelta',
  'zoneDefense',
  'conditional'
]);

export interface ValidationResult {
  cardId: string;
  cardName: string;
  factionOk: boolean;
  whitelistOk: boolean;
  zoneOk: boolean;
  legendaryOk: boolean;
  isValid: boolean;
  issues: string[];
}

export function validateCard(card: GameCard): ValidationResult {
  const issues: string[] = [];
  
  // 1) faction casing - must be lowercase 'truth' or 'government'
  const factionOk = ['truth', 'government'].includes((card.faction ?? '').toLowerCase());
  if (!factionOk) {
    issues.push(`Invalid faction: "${card.faction}". Must be "truth" or "government" (lowercase)`);
  }
  
  // 2) whitelist - only allowed effect keys
  const effectKeys = Object.keys(card.effects ?? {});
  const whitelistOk = effectKeys.every(k => WHITELIST_KEYS.has(k));
  if (!whitelistOk) {
    const invalidKeys = effectKeys.filter(k => !WHITELIST_KEYS.has(k));
    issues.push(`Invalid effect keys: ${invalidKeys.join(', ')}. Allowed: ${Array.from(WHITELIST_KEYS).join(', ')}`);
  }
  
  // 3) zone target - ZONE cards must have state targeting
  const zoneOk = card.type === 'ZONE'
    ? card.target?.scope === 'state' && card.target?.count === 1
    : true;
  if (!zoneOk) {
    issues.push(`ZONE card "${card.name}" must have target: {scope: "state", count: 1}`);
  }
  
  // 4) legendary minimum cost - legendary cards must cost at least 25 IP
  const legendaryOk = card.rarity !== 'legendary' || (card.cost ?? 0) >= 25;
  if (!legendaryOk) {
    issues.push(`Legendary card "${card.name}" must cost at least 25 IP (currently ${card.cost})`);
  }
  
  const isValid = factionOk && whitelistOk && zoneOk && legendaryOk;
  
  return {
    cardId: card.id,
    cardName: card.name,
    factionOk,
    whitelistOk,
    zoneOk,
    legendaryOk,
    isValid,
    issues
  };
}

export function validateCards(cards: GameCard[]): {
  totalCards: number;
  validCards: number;
  invalidCards: number;
  results: ValidationResult[];
} {
  const results = cards.map(validateCard);
  
  return {
    totalCards: cards.length,
    validCards: results.filter(r => r.isValid).length,
    invalidCards: results.filter(r => !r.isValid).length,
    results: results.filter(r => !r.isValid) // Only return problematic cards
  };
}

export function createValidationReport(cards: GameCard[]): string {
  const validation = validateCards(cards);
  
  let report = `\n=== CARD VALIDATION REPORT (v2.1E) ===\n`;
  report += `Total Cards: ${validation.totalCards}\n`;
  report += `Valid Cards: ${validation.validCards}\n`;
  report += `Invalid Cards: ${validation.invalidCards}\n\n`;
  
  if (validation.invalidCards === 0) {
    report += `✅ All cards passed v2.1E validation!\n`;
    return report;
  }
  
  report += `VALIDATION ISSUES:\n`;
  report += `${'='.repeat(50)}\n`;
  
  for (const result of validation.results) {
    report += `\n❌ ${result.cardId}: ${result.cardName}\n`;
    report += `${'-'.repeat(result.cardName.length + result.cardId.length + 2)}\n`;
    
    for (const issue of result.issues) {
      report += `   • ${issue}\n`;
    }
  }
  
  return report;
}