import fs from 'fs';
import path from 'path';
import { computeV21ECost } from '../src/systems/cost/v21e';

type Card = {
  id: string;
  faction: string;
  type: 'MEDIA' | 'ZONE' | 'ATTACK' | 'DEFENSIVE';
  rarity: 'common' | 'uncommon' | 'rare' | 'legendary';
  effects?: any;
  target?: any;
  cost?: number;
  name: string;
  flavorTruth?: string;
  flavorGov?: string;
  flavor?: string;
};

const GLOBS = [
  'src/data/*.json',
  'public/extensions/*.json',
  'public/expansions/*.json',
  'public/cryptids.json'
];

function readJSON(p: string) {
  return JSON.parse(fs.readFileSync(p, 'utf8'));
}

function writeJSON(p: string, d: any) {
  fs.writeFileSync(p, JSON.stringify(d, null, 2));
}

function migrateCard(c: Card): Card {
  // Faction -> lowercase normalization
  c.faction = (c.faction ?? '').toLowerCase();

  // Ensure flavor fields exist
  c.flavorTruth = c.flavorTruth ?? c.flavor ?? '';
  c.flavorGov = c.flavorGov ?? c.flavor ?? '';

  // ZONE targeting requirements
  if (c.type === 'ZONE') {
    c.target = { scope: 'state', count: 1, ...(c.target ?? {}) };
  }

  // Whitelist cleanup - remove non-allowed effect keys
  if (c.effects) {
    const allowed = [
      'truthDelta',
      'ipDelta',
      'draw',
      'discardOpponent',
      'pressureDelta',
      'zoneDefense',
      'conditional'
    ];
    Object.keys(c.effects).forEach(k => {
      if (!allowed.includes(k)) {
        delete (c.effects as any)[k];
      }
    });
  }

  // Recompute cost using v2.1E engine
  c.cost = computeV21ECost({ rarity: c.rarity, effects: c.effects ?? {} });
  
  return c;
}

function walk(globLike: string): string[] {
  // Simple glob helper for JSON files
  const dir = globLike.substring(0, globLike.lastIndexOf('/') + 1);
  if (!fs.existsSync(dir)) return [];
  
  return fs.readdirSync(dir)
    .filter(f => f.endsWith('.json'))
    .map(f => path.join(dir, f));
}

console.log('Starting v2.1E migration...');

for (const g of GLOBS) {
  for (const file of walk(g)) {
    try {
      const data = readJSON(file);
      const cards: Card[] = Array.isArray(data) ? data : data.cards ?? [];
      const migrated = cards.map(migrateCard);
      
      if (Array.isArray(data)) {
        writeJSON(file, migrated);
      } else {
        data.cards = migrated;
        writeJSON(file, data);
      }
      
      console.log(`✓ Migrated: ${file} (${migrated.length} cards)`);
    } catch (error) {
      console.error(`✗ Failed to migrate ${file}:`, error);
    }
  }
}

console.log('Migration completed!');