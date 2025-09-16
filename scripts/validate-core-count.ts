// Core database validation script
// Ensures we have the expected 400 core cards (200 truth + 200 government)

import { CARD_DATABASE } from '../src/data/cardDatabase';

const EXPECTED_TOTAL = 400;
const EXPECTED_TRUTH = 200;
const EXPECTED_GOVERNMENT = 200;

function validateCoreDatabase() {
  const truthCount = CARD_DATABASE.filter(c => c.faction === 'truth').length;
  const governmentCount = CARD_DATABASE.filter(c => c.faction === 'government').length;
  const totalCount = CARD_DATABASE.length;
  
  console.log('📊 Core Database Validation:');
  console.log(`  Total cards: ${totalCount} (expected: ${EXPECTED_TOTAL})`);
  console.log(`  Truth cards: ${truthCount} (expected: ${EXPECTED_TRUTH})`);
  console.log(`  Government cards: ${governmentCount} (expected: ${EXPECTED_GOVERNMENT})`);
  
  const errors: string[] = [];
  
  if (totalCount !== EXPECTED_TOTAL) {
    errors.push(`Total card count mismatch: got ${totalCount}, expected ${EXPECTED_TOTAL}`);
  }
  
  if (truthCount !== EXPECTED_TRUTH) {
    errors.push(`Truth card count mismatch: got ${truthCount}, expected ${EXPECTED_TRUTH}`);
  }
  
  if (governmentCount !== EXPECTED_GOVERNMENT) {
    errors.push(`Government card count mismatch: got ${governmentCount}, expected ${EXPECTED_GOVERNMENT}`);
  }
  
  // Check for duplicate IDs
  const ids = CARD_DATABASE.map(c => c.id);
  const uniqueIds = new Set(ids);
  if (ids.length !== uniqueIds.size) {
    errors.push(`Duplicate card IDs found: ${ids.length - uniqueIds.size} duplicates`);
  }
  
  // Check for missing required fields
  const missingFields = CARD_DATABASE.filter(card => 
    !card.id || !card.name || !card.faction || !card.type || !card.rarity
  );
  if (missingFields.length > 0) {
    errors.push(`${missingFields.length} cards missing required fields`);
  }
  
  if (errors.length > 0) {
    console.error('❌ Validation failed:');
    errors.forEach(error => console.error(`  - ${error}`));
    process.exit(1);
  }
  
  console.log('✅ Core database validation passed!');
  console.log(`🎯 Ready for gameplay with ${totalCount} cards`);
}

validateCoreDatabase();