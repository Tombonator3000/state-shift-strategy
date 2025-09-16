#!/usr/bin/env ts-node
// MVP Migration Script - Convert all cards to 3-type system
// Usage: ts-node src/tools/migrate-to-mvp.ts

import fs from 'fs';
import path from 'path';
import type { GameCard } from '@/types/cardTypes';
import type { MVPCard, CardType, Rarity } from '@/types/mvp-types';
import { COST_TABLE, BASELINE_EFFECTS, TYPE_WHITELIST } from '@/rules/mvp-policy';

// Migration statistics
type MigrationStats = {
  totalCards: number;
  byType: Record<CardType, number>;
  byRarity: Record<Rarity, number>;
  droppedEffects: string[];
  errors: string[];
};

const stats: MigrationStats = {
  totalCards: 0,
  byType: { ATTACK: 0, MEDIA: 0, ZONE: 0 },
  byRarity: { common: 0, uncommon: 0, rare: 0, legendary: 0 },
  droppedEffects: [],
  errors: []
};

// Generate effect text based on card type and effects
function generateEffectText(card: Pick<MVPCard, 'type' | 'effects'>): string {
  switch (card.type) {
    case 'ATTACK':
      const attackEffects = card.effects as any;
      let text = `Opponent loses ${attackEffects.ipDelta.opponent} IP`;
      if (attackEffects.discardOpponent) {
        text += ` and discards ${attackEffects.discardOpponent} card${attackEffects.discardOpponent > 1 ? 's' : ''}`;
      }
      return text + '.';
      
    case 'MEDIA':
      const mediaEffects = card.effects as any;
      const delta = mediaEffects.truthDelta;
      return `${delta > 0 ? '+' : ''}${delta}% Truth.`;
      
    case 'ZONE':
      const zoneEffects = card.effects as any;
      return `Target a state. +${zoneEffects.pressureDelta} Pressure to capture it.`;
      
    default:
      return 'Unknown effect.';
  }
}

function normalizeRarity(rarity: any): Rarity {
  const r = String(rarity || 'common').toLowerCase();
  if (['common', 'uncommon', 'rare', 'legendary'].includes(r)) {
    return r as Rarity;
  }
  return 'common';
}

function migrateCardType(oldType: string): CardType {
  const type = String(oldType || '').toUpperCase();
  switch (type) {
    case 'ATTACK': return 'ATTACK';
    case 'ZONE': return 'ZONE';
    case 'MEDIA': 
    case 'DEFENSIVE': // DEFENSIVE becomes MEDIA in MVP
    case 'TECH':
    case 'DEVELOPMENT':
    case 'INSTANT':
    case 'LEGENDARY':
    default:
      return 'MEDIA'; // Safe default
  }
}

function extractValidEffects(oldEffects: any, newType: CardType): any {
  if (!oldEffects || typeof oldEffects !== 'object') {
    return {};
  }

  const validKeys = TYPE_WHITELIST[newType];
  const cleanEffects: any = {};

  // Extract only whitelisted effects for this type
  for (const key of validKeys) {
    if (oldEffects[key] !== undefined) {
      cleanEffects[key] = oldEffects[key];
    }
  }

  // Log dropped effects
  const allKeys = Object.keys(oldEffects);
  const droppedKeys = allKeys.filter(k => !validKeys.includes(k));
  if (droppedKeys.length > 0) {
    stats.droppedEffects.push(...droppedKeys);
  }

  return cleanEffects;
}

function migrateCard(oldCard: GameCard): MVPCard {
  try {
    const faction = String(oldCard.faction || 'truth').toLowerCase() as any;
    const rarity = normalizeRarity(oldCard.rarity);
    const type = migrateCardType(oldCard.type);
    
    // Get baseline effects from policy
    const baselineEffects = BASELINE_EFFECTS[type][rarity];
    
    // Extract valid effects (preference given to existing effects if valid)
    const extractedEffects = extractValidEffects(oldCard.effects, type);
    
    // Use extracted effects if valid, otherwise baseline
    const finalEffects = Object.keys(extractedEffects).length > 0 
      ? extractedEffects 
      : baselineEffects;

    const cost = COST_TABLE[type][rarity];

    const migratedCard: MVPCard = {
      id: oldCard.id,
      name: oldCard.name,
      faction,
      type,
      rarity,
      cost,
      effects: finalEffects,
      text: oldCard.text || generateEffectText({ type, effects: finalEffects }),
      flavorTruth: oldCard.flavorTruth || oldCard.text || `Truth sees: ${oldCard.name}`,
      flavorGov: oldCard.flavorGov || oldCard.text || `Government responds: ${oldCard.name}`,
      artId: (oldCard as any).artId
    };

    // Update stats
    stats.totalCards++;
    stats.byType[type]++;
    stats.byRarity[rarity]++;

    return migratedCard;
  } catch (error) {
    stats.errors.push(`Failed to migrate card ${oldCard.id}: ${error}`);
    throw error;
  }
}

function loadCoreCards(): GameCard[] {
  const coreFiles = [
    'src/data/core/truth-batch-1.ts',
    'src/data/core/truth-batch-2.ts', 
    'src/data/core/truth-batch-3.ts',
    'src/data/core/truth-batch-4.ts',
    'src/data/core/truth-batch-5.ts',
    'src/data/core/truth-batch-6.ts',
    'src/data/core/truth-batch-7.ts',
    'src/data/core/government-batch-1.ts',
    'src/data/core/government-batch-2.ts',
    'src/data/core/government-batch-3.ts',
    'src/data/core/government-batch-4.ts'
  ];

  const allCards: GameCard[] = [];

  for (const filePath of coreFiles) {
    if (fs.existsSync(filePath)) {
      try {
        const fileContent = fs.readFileSync(filePath, 'utf8');
        // Extract export array name from file content
        const exportMatch = fileContent.match(/export const (\w+):/);
        if (exportMatch) {
          const exportName = exportMatch[1];
          const module = require(path.resolve(filePath));
          if (module[exportName] && Array.isArray(module[exportName])) {
            allCards.push(...module[exportName]);
          }
        }
      } catch (error) {
        console.warn(`Could not load ${filePath}:`, error);
      }
    }
  }

  return allCards;
}

function generateMVPCoreFile(migratedCards: MVPCard[]): string {
  return `// MVP Core Card Database - Auto-generated
// 3 types only: ATTACK, MEDIA, ZONE
// Fixed costs and baseline effects

import type { MVPCard } from '@/types/mvp-types';

export const MVP_CORE_CARDS: MVPCard[] = ${JSON.stringify(migratedCards, null, 2)};

export default MVP_CORE_CARDS;
`;
}

function generateMigrationReport(): string {
  const uniqueDroppedEffects = [...new Set(stats.droppedEffects)];
  
  return `MVP Migration Report
==================

Total Cards Migrated: ${stats.totalCards}

By Type:
- ATTACK: ${stats.byType.ATTACK}
- MEDIA: ${stats.byType.MEDIA}  
- ZONE: ${stats.byType.ZONE}

By Rarity:
- Common: ${stats.byRarity.common}
- Uncommon: ${stats.byRarity.uncommon}
- Rare: ${stats.byRarity.rare}
- Legendary: ${stats.byRarity.legendary}

Dropped Effect Keys (${uniqueDroppedEffects.length} unique):
${uniqueDroppedEffects.map(key => `- ${key}`).join('\n')}

Errors (${stats.errors.length}):
${stats.errors.map(err => `- ${err}`).join('\n')}

Migration Rules Applied:
- DEFENSIVE → MEDIA (truth effects from baseline)
- All other unknown types → MEDIA
- Effects cleaned to type whitelist only
- Costs set from fixed table
- Baseline effects used when original effects invalid

Next Steps:
1. Review migrated cards in src/data/core/mvp-core.ts
2. Run validator: npm run validate-mvp
3. Test gameplay with simplified mechanics
4. Update UI components for 3-type system
`;
}

function main() {
  console.log('🚀 Starting MVP migration...\n');

  try {
    // Load all core cards
    console.log('📖 Loading core cards...');
    const coreCards = loadCoreCards();
    console.log(`Found ${coreCards.length} cards to migrate\n`);

    // Migrate all cards
    console.log('🔄 Migrating cards...');
    const migratedCards = coreCards.map(migrateCard);

    // Generate new core file
    console.log('📝 Generating MVP core file...');
    const coreFileContent = generateMVPCoreFile(migratedCards);
    fs.writeFileSync('src/data/core/mvp-core.ts', coreFileContent, 'utf8');

    // Generate migration report
    const report = generateMigrationReport();
    fs.writeFileSync('src/data/core/mvp-migration-report.txt', report, 'utf8');

    console.log('\n✅ Migration complete!');
    console.log(`📊 ${stats.totalCards} cards migrated`);
    console.log(`📋 Report: src/data/core/mvp-migration-report.txt`);
    console.log(`🗃️  Cards: src/data/core/mvp-core.ts`);

  } catch (error) {
    console.error('💥 Migration failed:', error);
    process.exit(1);
  }
}

if (require.main === module) {
  main();
}

export { migrateCard, stats };