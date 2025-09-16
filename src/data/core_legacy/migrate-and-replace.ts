// Direct Migration and Replacement
// This directly migrates the cards and returns the result

import { CORE_BATCH_TRUTH_1 } from './truth-batch-1';
import { CORE_BATCH_TRUTH_2 } from './truth-batch-2'; 
import { CORE_BATCH_TRUTH_3 } from './truth-batch-3';
import { CORE_BATCH_TRUTH_4 } from './truth-batch-4';
import { CORE_BATCH_TRUTH_5 } from './truth-batch-5';
import { CORE_BATCH_TRUTH_6 } from './truth-batch-6';
import { CORE_BATCH_TRUTH_7 } from './truth-batch-7';
import { CORE_BATCH_GOV_1 } from './government-batch-1';
import { CORE_BATCH_GOV_2 } from './government-batch-2';
import { CORE_GOV_DECK } from './CORE_GOV_DECK';
import { CORE_TRUTH_DECK } from './CORE_TRUTH_DECK';

import { CardMigrator } from '@/tools/migrate-to-mvp';
import type { GameCard } from '@/types/cardTypes';
import type { MVPCard } from '@/types/mvp-types';

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

console.log(`🔄 Migrating ${allExistingCards.length} existing cards...`);

// Run migration
const migrator = new CardMigrator();
const { mvpCards, report } = migrator.migrateDatabase(allExistingCards);

console.log(`✅ Migrated ${mvpCards.length} cards:`);
console.log(`  ATTACK: ${report.cardsByType.ATTACK}`);
console.log(`  MEDIA: ${report.cardsByType.MEDIA}`);
console.log(`  ZONE: ${report.cardsByType.ZONE}`);

// Export the migrated cards
export const MVP_CORE_CARDS: MVPCard[] = mvpCards;
export default mvpCards;