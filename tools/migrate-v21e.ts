#!/usr/bin/env ts-node
// v2.1E Migration Script
// Usage: ts-node tools/migrate-v21e.ts

import fs from 'fs';
import path from 'path';
import { whitelistEffects, validateCard } from '../src/utils/whitelistEffects';
import { calculateCardCost } from '../src/systems/cost/v21e/scorer';
import type { Faction, CardType, GameCard } from '../src/types/cardTypes';

const TARGET_FILES = [
  'public/extensions/cryptids.json',
  'public/extensions/halloween_spooktacular_with_temp_image.json',
  // Add more extension files here
];

function normalizeCard(card: any): GameCard {
  // Normalize faction to lowercase
  const faction = String(card.faction || 'truth').toLowerCase() as Faction;
  
  // Normalize type and enforce whitelist
  let type = String(card.type || 'MEDIA').toUpperCase();
  if (!['MEDIA', 'ZONE', 'ATTACK', 'DEFENSIVE'].includes(type)) {
    console.warn(`Invalid type ${type} for card ${card.id}, defaulting to MEDIA`);
    type = 'MEDIA';
  }

  // Ensure both flavor fields exist
  const flavorTruth = card.flavorTruth || card.flavor || '';
  const flavorGov = card.flavorGov || card.flavor || '';

  // Whitelist effects
  const effects = whitelistEffects(card.effects || {});

  // Calculate v2.1E cost
  const newCost = calculateCardCost(effects, card.rarity);

  const normalized: GameCard = {
    id: card.id,
    name: card.name,
    type: type as CardType,
    faction,
    rarity: card.rarity,
    cost: newCost,
    text: card.text,
    flavorTruth,
    flavorGov,
    effects,
    extId: card.extId
  };

  // Enforce ZONE targeting
  if (normalized.type === 'ZONE') {
    normalized.target = { scope: 'state', count: 1 };
  }

  // Remove legacy flavor field
  delete (card as any).flavor;

  return normalized;
}

function processFile(filepath: string): void {
  const absolutePath = path.resolve(filepath);
  
  if (!fs.existsSync(absolutePath)) {
    console.warn(`⚠️  File not found: ${filepath}`);
    return;
  }

  console.log(`🔄 Processing: ${filepath}`);

  try {
    const data = JSON.parse(fs.readFileSync(absolutePath, 'utf8'));
    
    if (!data.cards || !Array.isArray(data.cards)) {
      console.warn(`⚠️  No cards array found in ${filepath}`);
      return;
    }

    let migrated = 0;
    let errors = 0;

    const migratedCards = data.cards.map((card: any) => {
      try {
        const normalized = normalizeCard(card);
        const validation = validateCard(normalized);
        
        if (!validation.isValid) {
          console.error(`❌ Validation failed for ${card.id}:`, validation.errors);
          errors++;
        } else {
          migrated++;
        }
        
        return normalized;
      } catch (error) {
        console.error(`💥 Failed to migrate card ${card.id}:`, error);
        errors++;
        return card; // Return original on error
      }
    });

    // Write migrated data
    const output = { ...data, cards: migratedCards };
    fs.writeFileSync(absolutePath, JSON.stringify(output, null, 2), 'utf8');
    
    console.log(`✅ Migrated ${migrated} cards, ${errors} errors in ${filepath}`);
    
  } catch (error) {
    console.error(`💥 Failed to process ${filepath}:`, error);
  }
}

function main(): void {
  console.log('🚀 Starting v2.1E migration...\n');
  
  for (const file of TARGET_FILES) {
    processFile(file);
  }
  
  console.log('\n✨ Migration complete!');
  console.log('\n📋 Next steps:');
  console.log('1. Run validation: ts-node tools/validate-v21e.ts');
  console.log('2. Test in-game to ensure everything works');
  console.log('3. Update documentation');
}

if (require.main === module) {
  main();
}

export { normalizeCard, processFile };