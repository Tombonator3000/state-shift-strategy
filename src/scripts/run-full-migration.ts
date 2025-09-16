// Run Full Migration and Update Files
// This script loads existing cards, migrates them, and updates the MVP cards file

import { CORE_BATCH_TRUTH_1 } from '@/data/core/truth-batch-1';
import { CORE_BATCH_TRUTH_2 } from '@/data/core/truth-batch-2'; 
import { CORE_BATCH_TRUTH_3 } from '@/data/core/truth-batch-3';
import { CORE_BATCH_TRUTH_4 } from '@/data/core/truth-batch-4';
import { CORE_BATCH_TRUTH_5 } from '@/data/core/truth-batch-5';
import { CORE_BATCH_TRUTH_6 } from '@/data/core/truth-batch-6';
import { CORE_BATCH_TRUTH_7 } from '@/data/core/truth-batch-7';
import { CORE_BATCH_GOV_1 } from '@/data/core/government-batch-1';
import { CORE_BATCH_GOV_2 } from '@/data/core/government-batch-2';
import { CORE_GOV_DECK } from '@/data/core/CORE_GOV_DECK';
import { CORE_TRUTH_DECK } from '@/data/core/CORE_TRUTH_DECK';

import { CardMigrator } from '@/tools/migrate-to-mvp';
import { validateMVPDatabase } from '@/rules/validate-mvp';
import type { GameCard } from '@/types/cardTypes';

export function runFullMigration() {
  console.log("🔄 Starting full migration of existing cards...");
  
  // Collect all existing cards
  const allExistingCards: GameCard[] = [
    ...CORE_BATCH_TRUTH_1,
    ...CORE_BATCH_TRUTH_2,
    ...CORE_BATCH_TRUTH_3,
    ...CORE_BATCH_TRUTH_4,
    ...CORE_BATCH_TRUTH_5,
    ...CORE_BATCH_TRUTH_6,
    ...CORE_BATCH_TRUTH_7,
    ...CORE_BATCH_GOV_1,
    ...CORE_BATCH_GOV_2,
    ...CORE_GOV_DECK,
    ...CORE_TRUTH_DECK
  ];
  
  console.log(`📁 Found ${allExistingCards.length} existing cards`);
  
  // Count types before migration
  const beforeTypes = {
    ATTACK: allExistingCards.filter(c => c.type === 'ATTACK').length,
    MEDIA: allExistingCards.filter(c => c.type === 'MEDIA').length,
    ZONE: allExistingCards.filter(c => c.type === 'ZONE').length,
    DEFENSIVE: allExistingCards.filter(c => c.type === 'DEFENSIVE').length,
    OTHER: allExistingCards.filter(c => !['ATTACK', 'MEDIA', 'ZONE', 'DEFENSIVE'].includes(c.type)).length
  };
  
  console.log("📊 Before migration:", beforeTypes);
  
  // Run migration
  const migrator = new CardMigrator();
  const { mvpCards, report } = migrator.migrateDatabase(allExistingCards);
  
  // Validate migrated cards
  console.log("🔍 Validating migrated cards...");
  const validationErrors = validateMVPDatabase(mvpCards);
  
  if (validationErrors.length > 0) {
    console.error("❌ Validation failed:");
    validationErrors.forEach(error => {
      console.error(`  ${error.cardId}: ${error.error}`);
    });
    throw new Error("Migration validation failed");
  }
  
  console.log("✅ Migration completed and validated!");
  console.log(`📊 After: ATTACK:${report.cardsByType.ATTACK}, MEDIA:${report.cardsByType.MEDIA}, ZONE:${report.cardsByType.ZONE}`);
  console.log(`🗑️ Dropped effects: [${report.droppedEffectKeys.join(", ")}]`);
  
  // Generate report
  const reportText = migrator.generateReport(report);
  
  // Show sample cards
  console.log("\n📋 Sample migrated cards:");
  mvpCards.slice(0, 5).forEach(card => {
    console.log(`  ${card.id}: ${card.name} (${card.type}/${card.rarity}) - ${JSON.stringify(card.effects)}`);
  });
  
  // Generate the new MVP cards file content
  const mvpCardsFileContent = `// MVP Core Cards - Migrated from existing database
// Generated: ${new Date().toISOString()}
// Total cards: ${mvpCards.length}

import type { MVPCard } from '@/types/mvp-types';

export const MVP_CORE_CARDS: MVPCard[] = ${JSON.stringify(mvpCards, null, 2)};

export default MVP_CORE_CARDS;`;

  return { mvpCards, reportText, mvpCardsFileContent };
}

// Log the migration results for review
try {
  const results = runFullMigration();
  console.log(`\n🎯 Migration successful: ${results.mvpCards.length} cards ready`);
} catch (error) {
  console.error("❌ Migration failed:", error);
}