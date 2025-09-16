#!/usr/bin/env tsx
// Quick script to run the MVP migration and create new core directory

import { execSync } from 'child_process';

console.log("🚀 Running MVP migration...");

try {
  // Run the migration script
  execSync('tsx scripts/mvp-rewrite.ts', { stdio: 'inherit' });
  
  console.log("✅ Migration completed successfully!");
  console.log("📁 New core directory created at src/data/core/");
  console.log("📄 Migration report available at src/data/core/rewrite-report.txt");
  
} catch (error) {
  console.error("❌ Migration failed:", error);
  process.exit(1);
}