#!/usr/bin/env ts-node
// Apply v2.1E Migration - One-click setup

import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';

console.log('🚀 Applying v2.1E Migration...\n');

// 1. Create backup
console.log('📦 Creating backup...');
const backupDir = `backup-${Date.now()}`;
if (!fs.existsSync(backupDir)) {
  fs.mkdirSync(backupDir);
}

const filesToBackup = [
  'public/extensions/cryptids.json',
  'public/extensions/halloween_spooktacular_with_temp_image.json'
];

filesToBackup.forEach(file => {
  if (fs.existsSync(file)) {
    const backupPath = path.join(backupDir, path.basename(file));
    fs.copyFileSync(file, backupPath);
    console.log(`   ✓ Backed up ${file}`);
  }
});

// 2. Run migration
console.log('\n🔄 Running migration...');
try {
  execSync('npx ts-node tools/migrate-v21e.ts', { stdio: 'inherit' });
  console.log('   ✓ Migration completed');
} catch (error) {
  console.error('❌ Migration failed:', error);
  process.exit(1);
}

// 3. Run validation
console.log('\n🔍 Running validation...');
try {
  execSync('npx ts-node tools/validate-v21e.ts', { stdio: 'inherit' });
  console.log('   ✓ Validation passed');
} catch (error) {
  console.error('❌ Validation failed:', error);
  console.log('\n🔄 Restoring backup...');
  
  // Restore from backup on failure
  filesToBackup.forEach(file => {
    const backupPath = path.join(backupDir, path.basename(file));
    if (fs.existsSync(backupPath)) {
      fs.copyFileSync(backupPath, file);
      console.log(`   ✓ Restored ${file}`);
    }
  });
  
  process.exit(1);
}

// 4. Update documentation reminder
console.log('\n📚 Migration Summary:');
console.log('   ✅ Card types: MEDIA, ZONE, ATTACK, DEFENSIVE only');
console.log('   ✅ Faction casing: lowercase truth/government');
console.log('   ✅ Effect-based costs (v2.1E engine)');
console.log('   ✅ ZONE cards require state targeting');
console.log('   ✅ Effect whitelist enforced');
console.log('   ✅ Faction distribution (no keyword heuristics)');

console.log('\n✨ v2.1E Migration Complete!');
console.log(`\n📦 Backup saved in: ${backupDir}`);
console.log('\n🎮 Ready to test in-game!');