// Migrate Existing Cards to MVP Format
// Load all existing core cards and convert them to MVP

import { CORE_BATCH_TRUTH_1 } from '@/data/core_legacy/truth-batch-1';
import { CORE_BATCH_TRUTH_2 } from '@/data/core/truth-batch-2'; 
import { CORE_BATCH_TRUTH_3 } from '@/data/core/truth-batch-3';
import { CORE_BATCH_TRUTH_4 } from '@/data/core/truth-batch-4';
import { CORE_BATCH_TRUTH_5 } from '@/data/core/truth-batch-5';
import { CORE_BATCH_TRUTH_6 } from '@/data/core/truth-batch-6';
import { CORE_BATCH_TRUTH_7 } from '@/data/core/truth-batch-7';
import { CORE_BATCH_GOV_1 } from '@/data/core/government-batch-1';
import { CORE_BATCH_GOV_2 } from '@/data/core/government-batch-2';
// Note: government-batch-3 and government-batch-4 may not exist yet
import { CORE_GOV_DECK } from '@/data/core/CORE_GOV_DECK';
import { CORE_TRUTH_DECK } from '@/data/core/CORE_TRUTH_DECK';

import { CardMigrator } from '@/tools/migrate-to-mvp';
import type { GameCard } from '@/types/cardTypes';

async function migrateExistingCards() {
  console.log("🔄 Loading existing cards...");
  
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
    // government batches 3 and 4 may not exist yet
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
  
  // Generate output
  const reportText = migrator.generateReport(report);
  
  console.log("✅ Migration completed!");
  console.log(`📊 After: ATTACK:${report.cardsByType.ATTACK}, MEDIA:${report.cardsByType.MEDIA}, ZONE:${report.cardsByType.ZONE}`);
  console.log(`🗑️ Dropped effects: [${report.droppedEffectKeys.join(", ")}]`);
  
  // Generate the new MVP cards file content
  const mvpCardsFileContent = `// MVP Core Cards - Migrated from existing cards
// Generated: ${new Date().toISOString()}

import type { MVPCard } from '@/types/mvp-types';

export const MVP_CORE_CARDS: MVPCard[] = ${JSON.stringify(mvpCards, null, 2)};
`;

  console.log("\n📋 Sample migrated cards:");
  mvpCards.slice(0, 5).forEach(card => {
    console.log(`  ${card.id}: ${card.name} (${card.type}/${card.rarity}) - ${JSON.stringify(card.effects)}`);
  });

  return { mvpCards, reportText, mvpCardsFileContent };
}

// Run migration
migrateExistingCards().then(result => {
  console.log("\n✨ Migration ready! Use the returned data to update files.");
}).catch(error => {
  console.error("❌ Migration failed:", error);
});

export { migrateExistingCards };