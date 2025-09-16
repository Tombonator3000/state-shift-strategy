// Execute Migration - Load, migrate and save
import { runFullMigration } from './run-full-migration';
import { writeFileSync } from 'fs';
import { join } from 'path';

console.log("🚀 Executing migration...");

try {
  const { mvpCards, reportText, mvpCardsFileContent } = runFullMigration();
  
  console.log("✅ Migration complete!");
  console.log("📝 Writing migration report...");
  
  // Write migration report
  writeFileSync(join(process.cwd(), 'migration-report.txt'), reportText);
  
  // Write migrated cards file
  writeFileSync(join(process.cwd(), 'src/data/core/mvp-cards-migrated.ts'), mvpCardsFileContent);
  
  console.log("📁 Files written:");
  console.log("  - migration-report.txt");
  console.log("  - src/data/core/mvp-cards-migrated.ts");
  console.log(`\n🎯 Total migrated cards: ${mvpCards.length}`);
  
} catch (error) {
  console.error("❌ Migration execution failed:", error);
  process.exit(1);
}