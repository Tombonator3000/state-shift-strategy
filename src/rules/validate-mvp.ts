// MVP Validator - Hard gate for build process
// Ensures all cards follow strict 3-type MVP rules

import type { MVPCard, CardType, Rarity } from '@/types/mvp-types';
import { TYPE_WHITELIST, COST_TABLE } from '@/rules/mvp-policy';

export type ValidationResult = {
  isValid: boolean;
  errors: string[];
  warnings: string[];
};

export function validateMVPCard(card: MVPCard): ValidationResult {
  const errors: string[] = [];
  const warnings: string[] = [];

  // Validate basic structure
  if (!card.id) errors.push('Missing id');
  if (!card.name) errors.push('Missing name');
  if (!card.faction) errors.push('Missing faction');
  if (!card.type) errors.push('Missing type');
  if (!card.rarity) errors.push('Missing rarity');
  if (typeof card.cost !== 'number') errors.push('Missing or invalid cost');

  // Validate enums
  if (card.faction && !['truth', 'government'].includes(card.faction)) {
    errors.push(`Invalid faction: ${card.faction}`);
  }

  if (card.type && !['ATTACK', 'MEDIA', 'ZONE'].includes(card.type)) {
    errors.push(`Invalid type: ${card.type} (MVP allows only ATTACK, MEDIA, ZONE)`);
  }

  if (card.rarity && !['common', 'uncommon', 'rare', 'legendary'].includes(card.rarity)) {
    errors.push(`Invalid rarity: ${card.rarity}`);
  }

  // Validate cost matches table
  if (card.type && card.rarity && COST_TABLE[card.type as CardType]) {
    const expectedCost = COST_TABLE[card.type as CardType][card.rarity as Rarity];
    if (card.cost !== expectedCost) {
      errors.push(`Cost mismatch: expected ${expectedCost}, got ${card.cost}`);
    }
  }

  // Validate effects structure
  if (!card.effects || typeof card.effects !== 'object') {
    errors.push('Missing or invalid effects');
    return { isValid: false, errors, warnings };
  }

  const effectKeys = Object.keys(card.effects);
  const allowedKeys = TYPE_WHITELIST[card.type as CardType] || [];

  // Check for forbidden effect keys
  const forbiddenKeys = effectKeys.filter(key => !allowedKeys.includes(key));
  if (forbiddenKeys.length > 0) {
    errors.push(`Forbidden effects for ${card.type}: ${forbiddenKeys.join(', ')}`);
  }

  // Type-specific validations
  switch (card.type) {
    case 'ATTACK':
      const attackEffects = card.effects as any;
      if (!attackEffects.ipDelta?.opponent || attackEffects.ipDelta.opponent <= 0) {
        errors.push('ATTACK cards must have ipDelta.opponent > 0'); 
      }
      if (attackEffects.discardOpponent && (attackEffects.discardOpponent < 0 || attackEffects.discardOpponent > 2)) {
        errors.push('ATTACK discardOpponent must be 0-2');
      }
      break;

    case 'MEDIA':
      const mediaEffects = card.effects as any;
      if (typeof mediaEffects.truthDelta !== 'number') {
        errors.push('MEDIA cards must have truthDelta (number)');
      }
      break;

    case 'ZONE':
      const zoneEffects = card.effects as any;
      if (!zoneEffects.pressureDelta || zoneEffects.pressureDelta <= 0) {
        errors.push('ZONE cards must have pressureDelta > 0');
      }
      break;
  }

  // Faction case check
  if (card.faction && card.faction !== card.faction.toLowerCase()) {
    warnings.push('Faction should be lowercase');
  }

  return {
    isValid: errors.length === 0,
    errors,
    warnings
  };
}

export function validateMVPCardDatabase(cards: MVPCard[]): ValidationResult {
  const allErrors: string[] = [];
  const allWarnings: string[] = [];

  let validCount = 0;
  let invalidCount = 0;

  for (const card of cards) {
    const result = validateMVPCard(card);
    if (result.isValid) {
      validCount++;
    } else {
      invalidCount++;
      allErrors.push(`Card ${card.id}: ${result.errors.join(', ')}`);
    }
    allWarnings.push(...result.warnings.map(w => `Card ${card.id}: ${w}`));
  }

  // Summary
  console.log(`\n📊 Validation Summary:`);
  console.log(`✅ Valid cards: ${validCount}`);
  console.log(`❌ Invalid cards: ${invalidCount}`);
  console.log(`⚠️  Warnings: ${allWarnings.length}`);

  return {
    isValid: invalidCount === 0,
    errors: allErrors,
    warnings: allWarnings
  };
}

// CLI usage
export function runValidation() {
  try {
    const mvpCards = require('@/data/core/mvp-core').MVP_CORE_CARDS;
    const result = validateMVPCardDatabase(mvpCards);
    
    if (result.warnings.length > 0) {
      console.log('\n⚠️  Warnings:');
      result.warnings.forEach(w => console.log(`  ${w}`));
    }

    if (!result.isValid) {
      console.log('\n❌ Validation failed:');
      result.errors.forEach(e => console.log(`  ${e}`)); 
      process.exit(1);
    }

    console.log('\n✅ All cards pass MVP validation!');
  } catch (error) {
    console.error('💥 Validation failed:', error);
    process.exit(1);
  }
}

if (require.main === module) {
  runValidation();
}