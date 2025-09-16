// Run MVP Migration Script
// Converts existing core cards to MVP format

import { CARD_DATABASE_CORE } from '@/data/core_legacy';
import { CardMigrator } from '@/tools/migrate-to-mvp';
import { validateMVPDatabase } from '@/rules/validate-mvp';
import type { MVPCard } from '@/types/mvp-types';

async function runMigration() {
  console.log("🔄 Starting MVP migration...");
  
  try {
    // Load existing cards
    const existingCards = CARD_DATABASE_CORE;
    console.log(`📁 Loaded ${existingCards.length} existing cards`);
    
    // Run migration
    const migrator = new CardMigrator();
    const { mvpCards, report } = migrator.migrateDatabase(existingCards as any);
    
    // Validate migrated cards
    console.log("🔍 Validating migrated cards...");
    const validationErrors = validateMVPDatabase(mvpCards);
    
    if (validationErrors.length > 0) {
      console.error("❌ Validation failed:");
      validationErrors.forEach(error => {
        console.error(`  ${error.cardId}: ${error.error}`);
      });
      return;
    }
    
    // Generate sample cards for testing
    const sampleCards = generateSampleCards();
    const allCards = [...mvpCards.slice(0, 20), ...sampleCards]; // Use first 20 + samples
    
    // Generate report
    const reportText = migrator.generateReport(report);
    
    console.log("✅ Migration completed successfully!");
    console.log(`📊 Migrated ${report.totalCards} cards`);
    console.log(`🎯 ATTACK: ${report.cardsByType.ATTACK}, MEDIA: ${report.cardsByType.MEDIA}, ZONE: ${report.cardsByType.ZONE}`);
    
    // Output for manual review
    console.log("\n📋 Sample migrated cards:");
    allCards.slice(0, 3).forEach(card => {
      console.log(`  ${card.id} (${card.type}/${card.rarity}): ${JSON.stringify(card.effects)}`);
    });
    
    return { mvpCards: allCards, reportText };
    
  } catch (error) {
    console.error("❌ Migration failed:", error);
  }
}

function generateSampleCards(): MVPCard[] {
  return [
    // ATTACK Examples
    {
      id: "MVP-ATTACK-001",
      name: "Black Bag Operation",
      faction: "government",
      type: "ATTACK",
      rarity: "legendary",
      cost: 5,
      effects: { ipDelta: { opponent: 4 }, discardOpponent: 2 },
      text: "Opponent loses 4 IP. Opponent discards 2 cards.",
      flavorTruth: "They came in the night, and now the evidence is gone.",
      flavorGov: "Sometimes the greater good requires uncomfortable measures."
    },
    {
      id: "MVP-ATTACK-002", 
      name: "Disinformation Campaign",
      faction: "government",
      type: "ATTACK",
      rarity: "common",
      cost: 2,
      effects: { ipDelta: { opponent: 1 } },
      text: "Opponent loses 1 IP.",
      flavorTruth: "Another lie spreads faster than truth.",
      flavorGov: "Strategic narrative management in action."
    },
    
    // MEDIA Examples
    {
      id: "MVP-MEDIA-001",
      name: "Emergency Broadcast",
      faction: "truth", 
      type: "MEDIA",
      rarity: "rare",
      cost: 5,
      effects: { truthDelta: 3 },
      text: "+3% Truth.",
      flavorTruth: "The signal cuts through their interference.",
      flavorGov: "Unauthorized transmission detected on emergency channels."
    },
    {
      id: "MVP-MEDIA-002",
      name: "Social Media Manipulation",
      faction: "government",
      type: "MEDIA", 
      rarity: "uncommon",
      cost: 4,
      effects: { truthDelta: -2 },
      text: "-2% Truth.",
      flavorTruth: "The algorithm buries inconvenient truths.",
      flavorGov: "Public opinion successfully realigned."
    },
    
    // ZONE Examples  
    {
      id: "MVP-ZONE-001",
      name: "Regional Sweep",
      faction: "truth",
      type: "ZONE",
      rarity: "uncommon", 
      cost: 5,
      effects: { pressureDelta: 2 },
      text: "+2 Pressure on target state.",
      flavorTruth: "Grassroots organizing takes hold.",
      flavorGov: "Civil unrest detected in target region."
    },
    {
      id: "MVP-ZONE-002",
      name: "Federal Intervention",
      faction: "government",
      type: "ZONE",
      rarity: "legendary",
      cost: 7, 
      effects: { pressureDelta: 4 },
      text: "+4 Pressure on target state.",
      flavorTruth: "The occupation begins.",
      flavorGov: "Restoring order to the region."
    }
  ];
}

// Run if called directly
if (require.main === module) {
  runMigration();
}

export { runMigration };