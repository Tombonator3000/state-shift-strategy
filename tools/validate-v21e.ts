#!/usr/bin/env ts-node
// v2.1E Validation Script
// Usage: ts-node tools/validate-v21e.ts

import fs from 'fs';
import path from 'path';
import { validateCard } from '../src/utils/whitelistEffects';

const TARGET_FILES = [
  'public/extensions/cryptids.json',
  'public/extensions/halloween_spooktacular_with_temp_image.json',
];

interface ValidationSummary {
  totalFiles: number;
  totalCards: number;
  validCards: number;
  invalidCards: number;
  errors: Array<{
    file: string;
    cardId: string;
    cardName: string;
    errors: string[];
  }>;
}

function validateFile(filepath: string): {
  cards: number;
  valid: number;
  invalid: number;
  errors: Array<{ cardId: string; cardName: string; errors: string[] }>;
} {
  const absolutePath = path.resolve(filepath);
  
  if (!fs.existsSync(absolutePath)) {
    return { cards: 0, valid: 0, invalid: 0, errors: [] };
  }

  try {
    const data = JSON.parse(fs.readFileSync(absolutePath, 'utf8'));
    
    if (!data.cards || !Array.isArray(data.cards)) {
      return { cards: 0, valid: 0, invalid: 0, errors: [] };
    }

    const results = {
      cards: data.cards.length,
      valid: 0,
      invalid: 0,
      errors: [] as Array<{ cardId: string; cardName: string; errors: string[] }>
    };

    for (const card of data.cards) {
      const validation = validateCard(card);
      
      if (validation.isValid) {
        results.valid++;
      } else {
        results.invalid++;
        results.errors.push({
          cardId: card.id,
          cardName: card.name,
          errors: validation.errors
        });
      }
    }

    return results;
    
  } catch (error) {
    console.error(`💥 Failed to validate ${filepath}:`, error);
    return { cards: 0, valid: 0, invalid: 0, errors: [] };
  }
}

function main(): void {
  console.log('🔍 Starting v2.1E validation...\n');
  
  const summary: ValidationSummary = {
    totalFiles: 0,
    totalCards: 0,
    validCards: 0,
    invalidCards: 0,
    errors: []
  };

  for (const file of TARGET_FILES) {
    const absolutePath = path.resolve(file);
    
    if (!fs.existsSync(absolutePath)) {
      console.warn(`⚠️  File not found: ${file}`);
      continue;
    }

    console.log(`🔍 Validating: ${file}`);
    const results = validateFile(file);
    
    summary.totalFiles++;
    summary.totalCards += results.cards;
    summary.validCards += results.valid;
    summary.invalidCards += results.invalid;
    
    // Add file context to errors
    results.errors.forEach(error => {
      summary.errors.push({
        file,
        ...error
      });
    });

    if (results.invalid === 0) {
      console.log(`✅ ${file}: ${results.valid} cards OK`);
    } else {
      console.log(`❌ ${file}: ${results.valid} OK, ${results.invalid} INVALID`);
    }
  }

  console.log('\n' + '='.repeat(60));
  console.log('📊 VALIDATION SUMMARY');
  console.log('='.repeat(60));
  console.log(`Files processed: ${summary.totalFiles}`);
  console.log(`Total cards: ${summary.totalCards}`);
  console.log(`Valid cards: ${summary.validCards}`);
  console.log(`Invalid cards: ${summary.invalidCards}`);
  
  if (summary.invalidCards > 0) {
    console.log('\n❌ VALIDATION ERRORS:');
    console.log('-'.repeat(40));
    
    for (const error of summary.errors) {
      console.log(`\n📄 ${error.file}`);
      console.log(`🔴 ${error.cardId}: ${error.cardName}`);
      error.errors.forEach(err => {
        console.log(`   • ${err}`);
      });
    }
    
    console.log('\n💡 Fix these errors and run validation again.');
    process.exit(1);
  } else {
    console.log('\n✅ All validations passed!');
    console.log('\n🎉 Your cards are v2.1E compliant!');
  }
}

if (require.main === module) {
  main();
}

export { validateFile };